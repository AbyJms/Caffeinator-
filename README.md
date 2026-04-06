# Mov-Cap

Mov-Cap is an automated movie recap generator that converts full-length films into structured 5–10 minute recap videos. It processes the original movie file, extracts key scenes, generates narration and storyboard, and assembles a final recap video using precise clip cutting and sequencing.

---

## Features

* Automated recap video generation from full movie files
* Scene extraction using subtitles and timestamp analysis
* Script and storyboard generation for narration alignment
* Clip-based video editing pipeline
* Targeted recap duration (5–10 minutes)
* Audio handling and synchronization
* Upload-based subtitle processing
* AI-assisted narration and structure generation

---

## Tech Stack

Backend:

* Node.js
* Express.js
* PostgreSQL
* JWT Authentication
* bcrypt

AI Integration:

* Groq API (LLM processing)

Media Processing:

* FFmpeg
* Multer (file uploads)

Other:

* dotenv
* fs (file handling)

---

## How It Works

1. User provides a movie file or subtitle input
2. Subtitles are parsed and key timestamps are extracted
3. Important scenes are selected and reduced
4. AI generates structured outputs including timestamps, narration, and storyboard
5. The original movie is segmented into clips
6. Clips are arranged into a concise recap sequence
7. Narration is aligned with the final video

---

## Key Components

Scene Extraction:

* Timestamp parsing from subtitles
* Intro and credits filtering
* Data reduction for efficiency

AI Processing:

* Generates recap structure
* Produces narration and storyboard

Video Processing:

* Cuts original video into clips
* Assembles final recap
* Handles audio transitions

---

## Known Limitations

* Dependent on subtitle quality
* Scene cuts may not always align perfectly
* Performance depends on video size

---

## Future Improvements

* Shot boundary detection for precise cuts
* Improved narration synchronization
* Title and thumbnail generation
* Scene diversity control
* Multi-language support

---

## License

This project is for educational and experimental purposes.
