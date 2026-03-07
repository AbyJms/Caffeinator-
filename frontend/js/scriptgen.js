const inputBox = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const messages = document.getElementById("messages");
const welcome = document.getElementById("welcome");

let chatHistory = [];

/* PARTICLES */
particlesJS("particles-js", {
  particles: {
    number: { value: 70 }, size: { value: 2 }, color: { value: "#4f7cff" },
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

/* MESSAGE UI */

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

/* SEND */

async function sendMessage(textFromBtn = null) {

  const message = textFromBtn || inputBox.value.trim();
  if (!message) return;

  welcome.style.display = "none";

  addUserMessage(message);
  inputBox.value = "";

  chatHistory.push({ role: "user", content: message });

  const thinking = showThinking();

  try {
    const res = await fetch("http://localhost:3000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history: chatHistory })
    });

    const data = await res.json();

    thinking.remove();

    chatHistory.push({ role: "assistant", content: data.reply });
    addBotMessage(data.reply);

  } catch {
    thinking.innerText = "Error connecting to AI.";
  }

  messages.scrollTop = messages.scrollHeight;
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
/*
inputBox.addEventListener("keydown",e=>{
if(e.key==="Enter"){
e.preventDefault();
sendMessage();
}
});
*/

inputBox.addEventListener("keydown", e => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

document.querySelectorAll(".suggestion").forEach(btn => {
  btn.onclick = () => sendMessage(btn.innerText);
});

/* EXPORT */

document.getElementById("exportBtn").onclick = () => {
  let text = "";
  document.querySelectorAll(".bot").forEach(m => {
    text += m.innerText + "\n\n";
  });
  const blob = new Blob([text], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "movie_script.txt";
  link.click();
};