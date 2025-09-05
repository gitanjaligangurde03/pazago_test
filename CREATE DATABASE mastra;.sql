CREATE DATABASE mastra;


CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE shareholder_vectors (
    id SERIAL PRIMARY KEY,
    embedding VECTOR(1536),
    metadata JSONB,
    content TEXT
);

CREATE INDEX ON shareholder_vectors USING ivfflat (embedding vector_cosine_ops);