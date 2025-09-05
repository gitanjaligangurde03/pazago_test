const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const { chunkText } = require("../tools/chunking-tool.ts");
const { MDocument } = require("../index.ts");
const dotenv = require("dotenv");

dotenv.config();

const lettersDir = path.join(__dirname, "../data/berkshire_letters");
const outputChunks: { content: string; metadata: Record<string, any> }[] = [];

async function parsePDF(filePath: string): Promise<string> {
  const resolvedFilePath = path.resolve(filePath);
  console.log(`Reading file: ${resolvedFilePath}`);
  const dataBuffer = fs.readFileSync(resolvedFilePath);
  const pdfData = await pdfParse(dataBuffer);
  let text = pdfData.text;

  // Clean text: remove headers, footers, page numbers, normalize whitespace
  text = text.replace(/Page \d+/gi, ""); // remove "Page X"
  text = text.replace(/\s+/g, " ").trim(); // normalize whitespace
  return text;
}

async function ingestDocuments() {
  const files = fs.readdirSync(lettersDir).filter((file: string) => file.endsWith(".pdf"));

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

    chunks.forEach((chunk: string, index: number) => {
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

module.exports = { ingestDocuments };

ingestDocuments().catch(console.error);