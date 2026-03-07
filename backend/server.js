const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: "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",
});

// ✅ DIFFERENT BOT PROMPTS (ADD HERE)

const prompts = {

  chat: `
You are Movie Bot.

You know every Malayalam movie.
Answer short, clean, accurate.
`,

  screengen: `
You are ScriptGen Bot, a professional movie editor AI.

TASK:
Pick BEST timestamps for recap video from subtitle file.

RULES:
• choose only main story moments  
• avoid filler dialogue  
• focus comedy / action / twists  

FORMAT STRICTLY:

00:01:20 — intro moment  
00:05:44 — chaos begins  
00:18:12 — big twist  

ONLY timestamps list.
`

};

const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const multer = require("multer");
const fs = require("fs");

const upload = multer({ dest: "uploads/" });

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
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: prompts.chat },
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

app.post("/api/screengen", upload.single("file"), async (req, res) => {
  try {

    // ✅ check file uploaded
    if (!req.file) {
      return res.status(400).json({ reply: "No subtitle file uploaded." });
    }

    // ✅ read subtitle file
    const subtitleText = fs.readFileSync(req.file.path, "utf8");

    // ✅ AI call (timestamp finder)
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",

      messages: [
  { role: "system", content: prompts.screengen },
  { role: "user", content: subtitleText.slice(0,15000) }
]
    });

    // ✅ delete temp file after use
    fs.unlinkSync(req.file.path);

    // ✅ send result
    res.json({
      reply: completion.choices[0].message.content
    });

  } catch (err) {
    console.error("ScreenGen error:", err);
    res.status(500).json({ reply: "ScreenGen AI failed." });
  }
});