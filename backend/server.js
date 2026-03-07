const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
const Groq = require("groq-sdk");
const multer = require("multer");
const fs = require("fs");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3000;

/* ================= GROQ ================= */

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

/* ================= PROMPTS ================= */

const prompts = {

chat: `
You are Movie Bot.
You know every Malayalam movie.
Answer short and accurate.
`,

screengen: `
You are ScriptGen Bot, a professional movie editor AI.

TASK:
Pick BEST recap timestamps.

RULES:

• skip intro + credits  
• cover full story timeline  
• include comedy, action, emotional, climax  

choose 30 timestamps.

FORMAT:

00:08:20 — intro  
00:34:10 — conflict  
01:42:15 — climax  

ONLY timestamps list.
`

};

/* ================= DATABASE ================= */

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.connect(err => {
  if (err) console.error("DB error:", err.stack);
  else console.log("PostgreSQL connected.");
});

/* ================= MIDDLEWARE ================= */

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend"), { index: false }));

/* ================= FILE UPLOAD ================= */

const upload = multer({ dest: "uploads/" });

/* ================= ROUTES ================= */

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

/* ================= CHAT BOT ================= */

app.post("/api/chat", async (req, res) => {

  const { message, history = [] } = req.body;

  try {

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant", // ✅ cheap + stable
      messages: [
        { role: "system", content: prompts.chat },
        ...history,
        { role: "user", content: message },
      ],
    });

    res.json({
      reply: completion.choices[0]?.message?.content || "No reply"
    });

  } catch (err) {
    console.error("CHAT ERROR:", err.message);
    res.json({ reply: "Chat failed." });
  }

});

/* ================= FILTER INTRO + CREDITS ================= */

function filterSubtitles(text){

  const lines = text.split("\n");
  let filtered = [];
  let include = false;

  for(let line of lines){

    if(line.includes("-->")){

      const time = line.split(" --> ")[0].trim();
      const p = time.split(":");

      const sec =
        parseInt(p[0])*3600 +
        parseInt(p[1])*60 +
        parseFloat(p[2]);

      include = sec > 300 && sec < (2*3600 + 26*60);
    }

    if(include) filtered.push(line);
  }

  return filtered.join("\n");
}

/* ================= COMPRESS SUBTITLES ================= */

function compressSubtitles(text){

  const blocks = text.split("\n\n");
  let reduced = [];

  for(let i=0; i<blocks.length; i+=20){
    reduced.push(blocks[i]);
  }

  return reduced.join("\n\n");
}

/* ================= SCREENGEN ================= */

app.post("/api/screengen", upload.single("file"), async (req, res) => {

  try {

    if (!req.file) {
      return res.json({ reply: "Upload subtitle file first." });
    }

    const subtitleText = fs.readFileSync(req.file.path, "utf8");

    /* ✅ EXTRACT ONLY TIMESTAMPS */
    const matches = subtitleText.match(/\d{2}:\d{2}:\d{2}/g) || [];

    /* ✅ REDUCE HEAVILY */
    const reduced = matches.filter((_,i)=> i%20===0).join(", ");

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",

      messages: [
        { role: "system", content: prompts.screengen },
        { role: "user", content: reduced }
      ]
    });

    fs.unlinkSync(req.file.path);

    res.json({
      reply: completion.choices[0].message.content
    });

  } catch (err) {
    console.error("ScreenGen error:", err.message);
    res.json({ reply: "ScreenGen failed." });
  }

});

/* ================= START ================= */

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});