import { llm, queryRefinementPrompt, contentAnalysisPrompt, summarizationPrompt, serpClient, wikiClient } from "./langchain";

export class ResearchService {
  async analyzeAndRefineQuery(originalQuery: string): Promise<string[]> {
    try {
      const prompt = queryRefinementPrompt(originalQuery);
      const response = await llm.invoke(prompt);
      const text = String(response.content || response);
      try {
        const parsed = JSON.parse(text.trim());
        if (Array.isArray(parsed) && parsed.length) return parsed;
      } catch {
        // fallback: split lines
        return text.split("\n").map(s => s.trim()).filter(Boolean).slice(0, 5);
      }
      return [originalQuery];
    } catch (e) {
      console.warn("Refine query failed:", e);
      return [originalQuery];
    }
  }

  async fetchSerp(query: string) {
    return new Promise<any[]>((resolve) => {
      serpClient.json({ q: query, num: 5, api_key: process.env.SERP_API_KEY }, (data: any) => {
        const list = (data.organic_results || []).slice(0, 5).map((r: any) => ({
          title: r.title,
          url: r.link,
          snippet: r.snippet,
          source: "Google Search",
          credibility_score: this.assessUrlCredibility(r.link)
        }));
        resolve(list);
      });
    });
  }

  async fetchWikipedia(query: string) {
    try {
      const search = await wikiClient.search(query, { limit: 3 });
      if (!search.results || search.results.length === 0) return null;
      const page = await wikiClient.page(search.results[0].title);
      const summary = await page.summary();
      const content = (await page.content()) || "";
      return {
        title: page.title,
        url: page.fullurl,
        snippet: summary.extract ? summary.extract.slice(0, 400) : "",
        content: content.slice(0, 2000),
        source: "Wikipedia",
        credibility_score: 0.9
      };
    } catch (e) {
      console.warn("wiki fetch failed:", e);
      return null;
    }
  }

  assessUrlCredibility(url: string) {
    if (!url) return 0.5;
    if (url.includes(".edu") || url.includes(".gov")) return 0.9;
    if (url.includes("wikipedia.org") || url.includes("reuters.com") || url.includes("bbc.com")) return 0.7;
    return 0.5;
  }

  async fetchInformation(queries: string[]) {
    const limited = queries.slice(0, 3);
    const results: any[] = [];
    await Promise.all(limited.map(async (q) => {
      try {
        const serp = await this.fetchSerp(q);
        if (serp && serp.length) results.push(...serp);
      } catch (e) { /* ignore */ }
      try {
        const wiki = await this.fetchWikipedia(q);
        if (wiki) results.push(wiki);
      } catch (e) { /* ignore */ }
    }));
    return results;
  }

  async processAndSummarize(searchResults: any[], topic: string) {
    const combined = searchResults.map(r => `${r.title || r.source}: ${r.snippet || r.content || ""}`).join("\n\n");
    if (!combined) {
      return { processed_content: "", sources: [], confidence: 0 };
    }
    const prompt = contentAnalysisPrompt(combined.slice(0, 8000), topic);
    const response = await llm.invoke(prompt);
    const processedText = String(response.content || response);
    return {
      processed_content: processedText,
      sources: searchResults,
      confidence: Math.min(searchResults.length * 15, 95)
    };
  }

  async generateReportStructure(processedData: any, topic: string) {
    try {
      const prompt = summarizationPrompt(topic, processedData.processed_content);
      const response = await llm.invoke(prompt);
      const text = String(response.content || response);
      try {
        const parsed = JSON.parse(text.trim());
        // ensure fields
        parsed.sources = parsed.sources || processedData.sources || [];
        parsed.confidence = parsed.confidence ?? processedData.confidence ?? 50;
        return parsed;
      } catch {
        // fallback structure
        return {
          summary: processedData.processed_content.slice(0, 1000),
          key_points: [],
          sources: processedData.sources || [],
          confidence: processedData.confidence ?? 50
        };
      }
    } catch (e) {
      console.warn("generateReportStructure failed:", e);
      return {
        summary: "Failed to generate summary",
        key_points: [],
        sources: processedData.sources || [],
        confidence: 0
      };
    }
  }
}
