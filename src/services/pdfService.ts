import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export type ReportData = {
  summary: string;
  confidence: number;
  key_points: { title: string; content: string; sources?: string[] }[];
  sources: { title: string; description?: string; url?: string; credibility_score?: number }[];
};

export class PDFService {
  rootDir = path.join(process.cwd(), "generated_reports");

  constructor() {
    if (!fs.existsSync(this.rootDir)) fs.mkdirSync(this.rootDir, { recursive: true });
  }

  async generatePdf(topic: string, report: ReportData, filename: string) {
    return new Promise<string>((resolve, reject) => {
      try {
        const filepath = path.join(this.rootDir, filename);
        const doc = new PDFDocument({ size: "A4", margin: 50 });
        const stream = fs.createWriteStream(filepath);
        doc.pipe(stream);

        // Title
        doc.fontSize(22).fillColor("#2563eb").text(`Research Report: ${topic}`, { align: "center" });
        doc.moveDown(1);

        // Meta
        doc.fontSize(10).fillColor("#333").text(`Generated: ${new Date().toUTCString()}`);
        doc.text(`Confidence: ${report.confidence}%`);
        doc.text(`Sources: ${report.sources.length}`);
        doc.moveDown(1);

        // Summary
        doc.fontSize(14).fillColor("#000").text("Executive Summary");
        doc.moveDown(0.5);
        doc.fontSize(11).text(report.summary || "No summary available.");
        doc.moveDown(1);

        // Key points
        doc.fontSize(14).fillColor("#000").text("Key Findings");
        report.key_points.forEach((kp, i) => {
          doc.moveDown(0.3);
          doc.fontSize(12).fillColor("#2563eb").text(`${i + 1}. ${kp.title}`);
          doc.fontSize(11).fillColor("#444").text(kp.content);
          if (kp.sources?.length) doc.fontSize(9).text("Sources: " + kp.sources.join(", "));
        });

        doc.addPage();
        doc.fontSize(14).text("Sources & References");
        report.sources.forEach((s, i) => {
          doc.moveDown(0.3);
          doc.fontSize(11).fillColor("#2563eb").text(`${i + 1}. ${s.title}`);
          if (s.description) doc.fontSize(10).text(s.description);
          if (s.url) doc.fontSize(9).fillColor("blue").text(s.url);
        });

        doc.end();
        stream.on("finish", () => resolve(filepath));
      } catch (e) {
        reject(e);
      }
    });
  }
}
