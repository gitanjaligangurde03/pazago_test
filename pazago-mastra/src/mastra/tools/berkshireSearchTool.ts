const { createTool } = require('mastra');
const { z } = require('zod');
const { Pool } = require('pg');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Google AI and PostgreSQL clients
const apiKey = process.env.GEMINI_API_KEY || "YOUR_GEMINI_API_KEY"; // Use environment variables
const databaseUrl = process.env.DATABASE_URL || "postgresql://postgres:password@localhost:5432/mastra";

const genAI = new GoogleGenerativeAI(apiKey);
const pool = new Pool({ connectionString: databaseUrl });

async function getEmbedding(text: string): Promise<number[]> {
  const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
  const result = await model.embedContent(text);
  const embedding = result.embedding;
  return embedding.values;
}

const berkshireSearchTool = createTool({
  schema: z.object({
    query: z.string().describe("Summarize Warren Buffett's investment philosophy."),
  }),
  description: "Searches through Berkshire Hathaway shareholder letters from 2019-2024 to find information related to a user's query.",
  
  async run({ query }: { query: string }) {
    console.log(`Executing search for query: "${query}"`);

    const queryEmbedding = await getEmbedding(query);
    const queryVector = `[${queryEmbedding.join(',')}]`;

    const client = await pool.connect();
    try {
      const sqlQuery = `
        SELECT
          content,
          metadata
        FROM
          shareholder_vectors
        ORDER BY
          embedding <=> $1::vector
        LIMIT 5;
      `;
      const { rows } = await client.query(sqlQuery, [queryVector]);
      
      console.log(`Found ${rows.length} relevant documents.`);
      return rows;
    } catch (error) {
      console.error('Error executing vector search:', error);
      throw new Error('Failed to search shareholder letters.');
    } finally {
      client.release();
    }
  },
});

module.exports = {
    berkshireSearchTool
};