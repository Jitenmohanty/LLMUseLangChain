import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { env } from "../config/env";
import SerpApi from "google-search-results-nodejs";
import wikipedia from "wikipedia";

export const llm = new ChatGoogleGenerativeAI({
  apiKey: env.GOOGLE_API_KEY,
  model: "gemini-pro",
  temperature: 0.2,
  maxOutputTokens: 2048
});

export const queryRefinementPrompt = (originalQuery: string) => 
  `Given the following research topic, generate 3-5 specific and diverse search queries that will help gather comprehensive information about this topic.

Original Topic: ${originalQuery}

Return the queries as a JSON list.`;

export const contentAnalysisPrompt = (content: string, topic: string) => 
  `Analyze the content related to "${topic}" and extract main concepts, key facts, insights, and short bullet points. Provide the result as JSON. Content: ${content}`;

export const summarizationPrompt = (topic: string, content: string) => 
  `Create a concise research summary for the topic "${topic}". Include summary, key_points (title, content, sources) and confidence (1-100). Output as JSON. Content: ${content}`;

// SerpAPI client wrapper
export const serpClient = new SerpApi.GoogleSearch(env.SERP_API_KEY);
export const wikiClient = wikipedia;
