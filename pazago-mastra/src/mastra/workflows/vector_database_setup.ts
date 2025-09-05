const { Client } = require("pg");
const { GoogleGenAI } = require("@google/genai");

const connectionString = "postgresql://postgres:password@localhost:5432/mastra";

const client = new Client({ connectionString });
const ai = new GoogleGenAI({ apiKey: "AIzaSyAJekmAW4V-IvmTRf67uW8LLnifjD52dZw" });

function textToVector(text: string, dim = 128): number[] {
  const codes = Array.from(text).map(c => c.charCodeAt(0));
  const vec = new Array(dim).fill(0);

  for (let i = 0; i < Math.min(dim, codes.length); i++) {
    const code = codes[i];
    if (code !== undefined) {
      vec[i] = code / 255;
    }
  }

  return vec;
}


async function setupVectorDatabase(
  chunks: { content: string; metadata: Record<string, any> }[]
) {
  await client.connect();
  console.log("Database Connected:", connectionString);

  for (const chunk of chunks) {
    try {
      // 🔑 Convert chunk text → vector
      const embedding = textToVector(chunk.content, 128);

      // Format vector for pgvector: "[0.1,0.2,...]"
      const embeddingStr = `[${embedding.join(",")}]`;

      console.log("Inserting Chunk:", {
        metadata: chunk.metadata,
        content: chunk.content.slice(0, 60) + "...", // log preview only
      });

      await client.query(
        "INSERT INTO shareholder_vectors (embedding, metadata, content) VALUES ($1, $2, $3)",
        [embeddingStr, JSON.stringify(chunk.metadata), chunk.content]
      );
    } catch (error) {
      console.error("Error Processing Chunk:", chunk, error);
    }
  }

  console.log("Embeddings stored in the database.");
  await client.end();
}

module.exports = { setupVectorDatabase };