const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

pool.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err.stack);
    } else {
        console.log('Successfully connected to the PostgreSQL database.');
    }
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend'), { index: false }));

// Fallback to index.html if root is requested
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

app.post("/api/chat", async (req, res) => {
  const { message, history = [] } = req.body;

  try {
    const systemPrompt = `
You are MovCap ScriptGen — a professional AI script writer.

🎯 GOAL:
Generate MOVIE RECAP SCRIPTS like YouTube narration.

STEP 1:
Ask short questions to collect:

• Movie name
• Genre
• Tone (funny, dark, emotional, chaotic)
• Length (short / medium / detailed)
• Any specific scenes or characters to focus on?

STEP 2:
Once ready → generate FULL script.

STRICT RULES:

❌ NEVER write screenplay format
(no FADE IN, EXT, camera angles)

✅ ONLY narration storytelling style.

FORMAT:

[INTRO]
Hook + setup

[MIDDLE]
Story progression

[CLIMAX]
Turning point

[ENDING]
Short conclusion

IMPORTANT:
Talk normally if missing info.
Output script AFTER receiving all information.
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        ...history,
        { role: "user", content: message },
      ],
    });

    const reply = completion.choices[0]?.message?.content || "No reply";

    res.json({ reply });

  } catch (error) {
    console.error("AI ERROR:", error);
    res.status(500).json({ reply: "AI error." });
  }
});