const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: "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",
});

const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

const pool = new Pool({
  connectionString: "postgresql://postgres.hvremodwbonzunlujlde:annhridya456@aws-1-ap-south-1.pooler.supabase.com:6543/postgres",
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
• What does the movie revolve around?
• Any specific scenes or characters to focus on?


STEP 2:
Once ready → generate FULL script.

STRICT RULES:
  - Scene Heading (Slugline):
Indicates where and when a scene takes place. 
Format: INT. COFFEE SHOP - DAY (INT. for interior, EXT. for exterior).
Use INT/EXT. or EXT/INT. for transitions between interior and exterior within a scene. 
  - Action Lines:
Describe visuals and sounds in present tense. 
Written in third person, focused on what the audience sees and hears. 
Use ALL CAPS for important sounds or objects (e.g., SIRENS WAILING). 
  - Character Names:
Written in all capital letters, centered, 3.7 inches from the left margin. 
First introduction includes age and brief description in parentheses:
example : "JAMES (30s), a weary detective."
  - Dialogue:
Centered on the page. 
Indented to align with the character name.
Written in present tense, concise and natural. 
  - Parentheticals (Extensions):
Provide delivery context (e.g., (softly), (angrily)).
Placed above the dialogue, in parentheses, centered. 
Use sparingly to avoid clutter.
  - Transitions:
Written in all caps, typically in the bottom right corner. 
Common examples: CUT TO:, FADE OUT:, DISSOLVE TO:.
Modern scripts often minimize transitions. 
  - Subheaders:
Used to indicate location shifts within a scene without breaking it (e.g., INT. COFFEE SHOP - LATER). 
  - Special Sequences:
Montages, flashbacks, or non-linear sequences are formatted differently to signal pacing or tone. 
  - Final Page:
Include “FADE OUT.” or “THE END” at the bottom left, about 6 inches from the left edge.
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