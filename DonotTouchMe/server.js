require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const Groq = require("groq-sdk");

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname)); // serve frontend

// GROQ SETUP
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// HOME
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});


// ✅ MAIN CHATBOT ROUTE (FINAL WORKING)
app.post("/api/chat", async (req, res) => {
  const { message, history = [] } = req.body;

  try {
    const systemPrompt = `
You are MovCap ScriptGen — a professional AI script writer.

🎯 GOAL:
Generate MOVIE RECAP SCRIPTS like YouTube narration.

HOW TO BEHAVE:

STEP 1 (CHAT MODE)
Ask short questions to collect:

• Movie name
• Genre
• Tone (funny, dark, emotional, chaotic)
• Length (short / medium / detailed)
• Any specific scenes or characters to focus on?

STEP 2 (SCRIPT MODE)
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

STYLE:

• cinematic narration
• smooth flow
• simple English
• engaging storytelling

IMPORTANT:
Talk normally if missing info.
Output script AFTER receiving all information(title, genre, tone, length).
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
    console.error(error);
    res.status(500).json({ reply: "AI error." });
  }
});

app.listen(port, () => {
  console.log(`MovCap running → http://localhost:${port}`);
});