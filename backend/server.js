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
model: "llama-3.3-70b-versatile",

messages: [
{
role: "system",
content: `
You are a professional film storyboard writer.

Your job is to convert movie plot summaries into
clear cinematic storyboard captions.

Each scene should describe a visual moment in the film.

Keep descriptions short and visual.
`
},

{
role: "user",
content: `
MOVIE CONTEXT

Aadu 1 Summary:
In Bangkok, a gangster named Dude is asked by his boss to search for and bring a rare herb known as Neelakoduveli from Kerala which is believed to bring eternal fortune to its bearer.
In Kerala, Shaji Pappan and his friends who live in the High Range area in Idukki participate in and win a tug-of-war tournament, the prize of which is a female goat, whom the team calls 'Pinky'. Shaji, who suffers from frequent back pain, has an issue with women due to his wife, Mary, eloping with his driver.
He reluctantly allows Pinky inside his van on the condition that Abu, one of his teammates, will slaughter it later for a feast. Abu, however, is revealed to be unable to slaughter the goat. This, along with many other problems on their journey back, makes Shaji determined to get rid of Pinky.
One such problem is that they are stopped by Inspector Sarbath Shameer, a quirky police officer, who is known for ramming the culprits' forehead on a lemon and drinking the juice. As Shameer questions them, Menaka Kanthan, an animal welfare activist, arrives and accuses the group of abusing the goat and presses charges. Elsewhere, a veteran leader named P.P Sasi foolishly discloses politically driven murders publicly and has to escape to evade the law.
Dude and his boys now arrive in Kerala in search of Neelakkoduveli, which is now in possession of Satan Xavier, a high-profile drug dealer living in the High Range area. They make a deal with Kanjavu Soman, a low-level drug dealer, to retrieve the herb from Xavier. However, the trunk containing Neelakkoduveli is stolen from Soman by masked assailants driving a van similar to the one that Shaji drives. Dude thinks that Shaji and his group are the thieves and his men then capture Abu and Pinky as hostages. In reality, the true thief is High Range Hakkim, P.P. Sasi's right hand man, who wanted to steal the Neelakoduveli for their profit after hearing about it from Kanjavu Soman.
Shaji is sent a ransom video by Dude and is able to work out their location. The group attempts to rescue Abu and Pinky but is unable to do so due to the firepower that Dude unleashes. Shaji then reluctantly decides to seek help from his estranged elder brother, Thomas, who arms the group with ancient rifles. These rifles turn out to be duds but the group is still able to defeat Dude and rescue Abu and Pinky. During this clash, Shameer and his men arrive and apprehend Dude, the trunk, and also find Sasi hidden nearby. However, on opening the trunk they discover cow dung instead of the herb.
It is then revealed that Soman had switched the trunk with a decoy one filled with dung early on. While escaping with it, he falls into a pit and the contents of the trunk are dispersed. The herb is then eaten by Pinky who is nearby. The power of the herb brought Pinky luck, which was why the lamb wasn't harmed.
Shaji finally manages to sell Pinky to a butcher. On the sight of his friends' evoked grievances, he feels a stroke of sympathy and calls Pinky back. But the butcher's daughter, also named Pinky, responds to the call, and a budding romance is implied between her and Shaji Pappan.

Aadu 2 Summary:
In the high range of Idukki, Shaji Pappan and his friends Arakkal Abu, Captain Sachin Cleetus, Krishnan Mandaram, Kuttan Moonga, Lalan P. K. alias Lolan and Bastin Pathrose are leading a normal life. One day, an uninformed Shaji fights and tosses an SI into a dam unaware that his friends were smuggling sandalwood. This leads him to being charged and bailed. He now has to report to the police station where Shameer joins as the SI. Due to this financial strain, Shaji and his friends decide to compete in a tug-of-war tournament to win a massive gold trophy. To pay for the entry fee of Rs.50,000 Shaji steals the documents for his house and uses it as collateral to take a loan from a loan shark, Irumbu Abdullah.
Dude and his gang, who unable to go back to Bangkok are working in a restaurant. The gang starts digging a tunnel to rob a bank nearby. They complete the tunnel and break into the vault the very night that demonetisation of Indian currency notes takes place. The demonetisation is also bad news for drug dealer Satan Xavier and his assistants Kanjav Soman and Battery Simon.
Shaji's friends enters the tournament and wins the gold trophy. However, the trophy is stolen from them on their journey home. Shaji's mother, realizing that the house documents were stolen, faints and is taken to an hospital. The group then tracks down the thief, Anali Sabu, whose team were runners up in the tournament. Shaji and group break into Sabu's dance party to retrieve the trophy. They beat up Sabu and destroy his place. However, Sabu and his elder brother, Chekuthan Lassar, a notorious criminal, return and burn down Shaji's house. Lassar demands a hefty sum as compensation for the damages they caused.
Mahesh Shetty, a counterfeiter is finalizing a deal to buy the engraving plates of the new 500 Rupee note. But Shetty's partner, Prabhakar, decides to cheat him by making a deal with Xavier. He does this by pretending to have the plates stolen from him. Soman informs Dude about this deal who then decides to steal the plates for himself. Coincidentally, these engraving plates as well as the back medicine for Shaji were to arrive on the same train at the same station. Shaji and his friends reach the station first and receive the plates instead, and Xavier's men get the medicine. This sets a motion, a relentless pursuit by all involved to get these plates.
In the end, Shaji and his friends get the plates and gives it to Lassar to make new fake notes. But soon a foul occurs after which Lassar, Sabu and his henchmen hits Shaji and his friends but towards the end, Shaji and his friends fights back and defeats Lassar, Sabu and his henchman. Lassar tries to kill Shaji with a grenade but Cleetus saves them. The government officials commend them for their honesty but give them a paltry reward. When Shaji and his friends were returning back, they are stopped by the guys who were supposed to give Shaji's medicine for back pain and they give them the dollars which was accidentally given to Shaji. Shaji and his friends, who have the dollars are awestruck thinking what to do with the money. Meanwhile Shaji sees Ponnappan, his ex-driver, eloping with another girl. The film ends by Shaji and his gang chasing him.

TASK:

Create a cinematic storyboard with 12 scenes.

Return ONLY this format:

Scene 1: description
Scene 2: description
Scene 3: description
Scene 4: description
Scene 5: description
Scene 6: description
Scene 7: description
Scene 8: description
Scene 9: description
Scene 10: description
Scene 11: description
Scene 12: description

User idea: ${idea}
`
}
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

app.get("/get-frames", (req, res) => {
  const framesDir = __dirname + "/screenshots";

  const fs = require("fs");

  fs.readdir(framesDir, (err, files) => {
    if (err) return res.status(500).send("Cannot read frames");

    const images = files
      .filter(f => f.endsWith(".png"))
      .slice(0, 12) // only 12
      .map(f => `/screenshots/${f}`);

    res.json(images);
  });
});

// serve screenshots folder
app.use("/screenshots", require("express").static(__dirname + "/screenshots"));


app.post("/generate-storyboard", async (req, res) => {

try {

const idea = req.body.idea;

const completion = await groq.chat.completions.create({
model: "llama-3.3-70b-versatile",

messages: [{
role: "user",
content: `Create a cinematic storyboard with 12 scenes.

Return ONLY this format:

Scene 1: description
Scene 2: description
Scene 3: description
Scene 4: description
Scene 5: description
Scene 6: description
Scene 7: description
Scene 8: description
Scene 9: description
Scene 10: description
Scene 11: description
Scene 12: description

Story idea: ${idea}`
}]
});

res.json(completion);

} catch (err) {

console.error(err);
res.status(500).send("Storyboard failed");

}

});