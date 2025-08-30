import fs from "fs";
import path from "path";
import pdfParse from "pdf-parse";
import { chunkText } from "../tools/chunking-tool";
import { MDocument } from "../index";

const lettersDir = path.join(__dirname, "../data/berkshire_letters");
const outputChunks: { content: string; metadata: any }[] = [];

async function parsePDF(filePath: string): Promise<string> {
  const dataBuffer = fs.readFileSync(filePath);
  const pdfData = await pdfParse(dataBuffer);
  let text = pdfData.text;

  // Clean text: remove headers, footers, page numbers, normalize whitespace
  text = text.replace(/Page \d+/gi, ""); // remove "Page X"
  text = text.replace(/\s+/g, " ").trim(); // normalize whitespace
  return text;
}

async function ingestDocuments() {
  const files = fs.readdirSync(lettersDir).filter((file) => file.endsWith(".pdf"));

  for (const file of files) {
    const filePath = path.join(lettersDir, file);
    const yearStr = path.basename(file, ".pdf");
    const year = parseInt(yearStr, 10); // ensure numeric year
    const content = await parsePDF(filePath);

    // Wrap with MDocument
    const document = new MDocument({
      content,
      metadata: {
        source: file,
        year,
        type: "shareholder_letter",
      },
    });

    // Chunk the document
    const chunks = chunkText(document.content, 800, 100);

    chunks.forEach((chunk: any, index: any) => {
      outputChunks.push({
        content: chunk,
        metadata: {
          ...document.metadata,
          chunkIndex: index,
        },
      });
    });
  }

  console.log("Document ingestion complete. Total chunks:", outputChunks.length);
  return outputChunks;
}

ingestDocuments().catch(console.error);
