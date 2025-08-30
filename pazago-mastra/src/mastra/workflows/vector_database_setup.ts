import { Client } from 'pg';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL!;
const openaiApiKey = process.env.OPENAI_API_KEY!;

const client = new Client({ connectionString });
const openai = new OpenAI({ apiKey: openaiApiKey });

async function setupVectorDatabase(chunks: any[]) {
  await client.connect();

  for (const chunk of chunks) {
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small", // better to use latest embedding model
      input: chunk.content,
    });

    const embedding = embeddingResponse.data[0].embedding;

    await client.query(
      `INSERT INTO shareholder_vectors (embedding, metadata, content) 
       VALUES ($1, $2, $3)`,
      [
        embedding, // must be stored in a pgvector column
        JSON.stringify(chunk.metadata), // ensure metadata is stored properly
        chunk.content,
      ]
    );
  }

  console.log("Embeddings stored in the database.");
  await client.end();
}

export { setupVectorDatabase };
