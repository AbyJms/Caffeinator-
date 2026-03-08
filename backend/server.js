const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
const Groq = require("groq-sdk");
const multer = require("multer");
const fs = require("fs");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

/*using express for login bs*/

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend"), { index: false }));

/* ================= DATABASE ================= */

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.connect(err => {
  if (err) console.error("DB error:", err.stack);
  else console.log("PostgreSQL connected.");
});

// Initialize database table if not exists
const initDb = async () => {
  try {
    await pool.query(`
            CREATE TABLE IF NOT EXISTS public.users (
                id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
                email text NOT NULL,
                password_hash text NOT NULL,
                created_at timestamp WITHOUT TIME ZONE DEFAULT now(),
                CONSTRAINT users_pkey PRIMARY KEY (id),
                CONSTRAINT users_email_key UNIQUE (email)
            )
        `);
    console.log("Users table verified.");
  } catch (err) {
    console.error("Error creating users table:", err);
  }
};
initDb();

/* ================= AUTH ROUTES ================= */

// Register Route
app.post("/api/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    // Check if user exists
    const userCheck = await pool.query("SELECT * FROM public.users WHERE email = $1", [email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert user
    await pool.query(
      "INSERT INTO public.users (email, password_hash) VALUES ($1, $2)",
      [email, passwordHash]
    );

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Server error during registration" });
  }
});

// Login Route
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    // Find user
    const result = await pool.query("SELECT * FROM public.users WHERE email = $1", [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Create token
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "24h" });

    res.json({
      message: "Login successful",
      token,
      user: { id: user.id, email: user.email }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error during login" });
  }
});

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

function filterSubtitles(text) {

  const lines = text.split("\n");
  let filtered = [];
  let include = false;

  for (let line of lines) {

    if (line.includes("-->")) {

      const time = line.split(" --> ")[0].trim();
      const p = time.split(":");

      const sec =
        parseInt(p[0]) * 3600 +
        parseInt(p[1]) * 60 +
        parseFloat(p[2]);

      include = sec > 300 && sec < (2 * 3600 + 26 * 60);
    }

    if (include) filtered.push(line);
  }

  return filtered.join("\n");
}

/* ================= COMPRESS SUBTITLES ================= */

function compressSubtitles(text) {

  const blocks = text.split("\n\n");
  let reduced = [];

  for (let i = 0; i < blocks.length; i += 20) {
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
    const reduced = matches.filter((_, i) => i % 20 === 0).join(", ");

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

const { exec } = require("child_process");

app.get("/run-frame-grabber", (req, res) => {
  exec("python frame_grabber.py", (error, stdout, stderr) => {
    if (error) {
      console.error(error);
      return res.status(500).send("Error running script");
    }
    res.send(stdout || "Frame grabber executed");
  });
});
