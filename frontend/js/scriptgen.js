const inputBox = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const messages = document.getElementById("messages");
const welcome = document.getElementById("welcome");

let chatHistory = [];

/* PARTICLES */
particlesJS("particles-js", {
  particles: {
    number: { value: 70 },
    size: { value: 2 },
    color: { value: "#4f7cff" },
    line_linked: { enable: true, distance: 150, color: "#4f7cff", opacity: 0.2 },
    move: { speed: 1 }
  }
});

/* LOTTIE */
lottie.loadAnimation({
  container: document.getElementById("aiAnimation"),
  renderer: "svg",
  loop: true,
  autoplay: true,
  path: "https://assets4.lottiefiles.com/packages/lf20_jcikwtux.json"
});

/* UI HELPERS */

function addUserMessage(text) {
  const msg = document.createElement("div");
  msg.className = "message user";
  msg.innerText = text;
  messages.appendChild(msg);
}

function addBotMessage(text) {
  const msg = document.createElement("div");
  msg.className = "message bot";
  msg.innerText = text;
  messages.appendChild(msg);
}

function showThinking() {
  const msg = document.createElement("div");
  msg.className = "message bot";
  msg.innerText = "AI is thinking...";
  messages.appendChild(msg);
  return msg;
}

/* ✅ MAIN FUNCTION (SCREENGEN ONLY) */

async function sendMessage(textFromBtn = null) {

  const message = textFromBtn || inputBox.value.trim();
  if (!message) return;

  welcome.style.display = "none";

  addUserMessage(message);
  inputBox.value = "";

  const thinking = showThinking();

  try {

    /* 👉 ONLY SEND MESSAGE (NO HISTORY NEEDED) */
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });

    const data = await res.json();

    thinking.remove();
    addBotMessage(data.reply);

  } catch {
    thinking.innerText = "Error connecting to AI.";
  }

  messages.scrollTop = messages.scrollHeight;
}

/* ✅ SCREENGEN FILE UPLOAD FUNCTION */

async function runScreenGen(){

  const fileInput = document.getElementById("subtitleUpload");

  if(!fileInput.files.length){
    alert("Upload subtitle (.srt) first");
    return;
  }

  welcome.style.display = "none";

  const thinking = showThinking();

  const formData = new FormData();
  formData.append("file", fileInput.files[0]);

  try {

    const res = await fetch("/api/screengen", {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    thinking.remove();
    addBotMessage(data.reply);

  } catch {
    thinking.innerText = "ScreenGen failed.";
  }

}

/* EVENTS */

document.querySelector(".new-script").onclick = () => {
  chatHistory = [];
  messages.innerHTML = "";
  welcome.style.display = "block";
  inputBox.value = "";
  inputBox.focus();
};

sendBtn.onclick = () => sendMessage();

inputBox.addEventListener("keydown", e => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

/* suggestion buttons (Aadu etc) */

document.querySelectorAll(".suggestion").forEach(btn => {
  btn.onclick = () => sendMessage(btn.innerText);
});

/* ================= EXPORT TXT ================= */

const exportBtn = document.getElementById("exportBtn");

exportBtn.addEventListener("click", () => {

  const botMessages = document.querySelectorAll(".bot");

  if (!botMessages.length) {
    alert("Nothing to export.");
    return;
  }

  let text = "";

  botMessages.forEach(msg => {
    text += msg.innerText + "\n\n";
  });

  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "ScriptGen_output.txt";

  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  URL.revokeObjectURL(url);

});