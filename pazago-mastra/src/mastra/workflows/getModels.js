const axios = require('axios');
require('dotenv').config();

const apiKey = process.env.GOOGLE_API_KEY || "AIzaSyAJekmAW4V-IvmTRf67uW8LLnifjD52dZw" ;

async function listGeminiModels() {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const response = await axios.get(url);
    const models = response.data.models || [];

    console.log("Available Gemini Models:");
    models.forEach((m) => console.log(m.name));
  } catch (error) {
    console.error("Failed to list models:", error);
  }
}

listGeminiModels();
