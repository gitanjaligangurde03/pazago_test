const express = require('express');
// Change: Import the agent directly without destructuring
const berkshireAnalystAgentObject = require('./agents/berkshireAnalystAgent');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 4111;

// A simple in-memory store for conversation histories.
const conversations = new Map();

// API endpoint for your chat interface
app.post('/api/chat', async (req: { body: { message: any; sessionId: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { error: string; }): void; new(): any; }; }; json: (arg0: { reply: any; }) => void; }) => {
  try {
    const { message, sessionId } = req.body;

    if (!message || !sessionId) {
      return res.status(400).json({ error: 'Message and sessionId are required.' });
    }

    // Retrieve the conversation history for the given session, or start a new one.
    const history = conversations.get(sessionId) || [];
    
    // Call the agent with the user's input and the conversation history.
    const result = await berkshireAnalystAgentObject.run({ input: message, history });

    // Update the history with the latest exchange.
    history.push({ role: 'user', content: message });
    history.push({ role: 'assistant', content: result });
    conversations.set(sessionId, history);

    // Send the agent's reply back to the client.
    res.json({ reply: result });

  } catch (error) {
    console.error('Error processing chat message:', error);
    res.status(500).json({ error: 'An internal error occurred.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log('Use the Mastra development playground or your custom frontend to test.');
});

