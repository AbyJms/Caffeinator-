function typeMessage(text) {

  const msg = document.createElement("div");
  msg.classList.add("message", "bot");

  chatArea.appendChild(msg);

  let i = 0;

  const cursor = document.createElement("span");
  cursor.innerText = "|";
  cursor.style.marginLeft = "2px";

  msg.appendChild(cursor);

  let interval = setInterval(() => {

    msg.innerText = text.substring(0, i);

    msg.appendChild(cursor);

    i++;

    if (i > text.length) {
      clearInterval(interval);
      cursor.remove();
    }

    chatArea.scrollTop = chatArea.scrollHeight;

  }, 18);


}

particlesJS("particles-js", {
  particles: {
    number: { value: 70 },
    size: { value: 2 },
    color: { value: "#4f7cff" },
    line_linked: {
      enable: true,
      distance: 150,
      color: "#4f7cff",
      opacity: 0.2
    },
    move: { speed: 1 }
  }
});


lottie.loadAnimation({
  container: document.getElementById('aiAnimation'),
  renderer: 'svg',
  loop: true,
  autoplay: true,
  path: 'https://assets4.lottiefiles.com/packages/lf20_jcikwtux.json'
});


function showThinking() {

  const msg = document.createElement("div");

  msg.classList.add("message", "bot");

  msg.innerHTML = "AI is thinking<span class='dots'></span>";

  chatArea.appendChild(msg);

  return msg;

}


document.getElementById("exportBtn").onclick = () => {

  let messages = document.querySelectorAll(".bot");

  let text = "";

  messages.forEach(m => {
    text += m.innerText + "\n\n";
  });

  let blob = new Blob([text], { type: "text/plain" });

  let link = document.createElement("a");

  link.href = URL.createObjectURL(blob);

  link.download = "movie_script.txt";

  link.click();

};

document.querySelector('.sidebar .logo').addEventListener('click', () => {
  window.location.href = '../index.html';
});

// For testing purposes, you can pre-fill the chat with a message
let chatHistory = [];

const inputBox = document.querySelector("input");
const sendBtn = document.querySelector("button");
const chatArea = document.querySelector(".scriptgen-container");

async function sendMessage(textFromBtn = null) {

  const message = textFromBtn || inputBox.value.trim();
  if (!message) return;

  // 👉 ADD HERE (THIS LINE)
  document.getElementById("welcome").style.display = "none";

  inputBox.value = "";

  // show user message
  const userMsg = document.createElement("div");
  userMsg.classList.add("message", "user");
  userMsg.innerText = message;
  chatArea.appendChild(userMsg);

  chatHistory.push({ role: "user", content: message });

  const thinkingMsg = showThinking();

  try {
    const res = await fetch("http://localhost:3000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        history: chatHistory
      })
    });

    const data = await res.json();

    thinkingMsg.remove();

    chatHistory.push({ role: "assistant", content: data.reply });

    typeMessage(data.reply);

  } catch (err) {
    thinkingMsg.innerText = "Error connecting to AI.";
  }

  chatArea.scrollTop = chatArea.scrollHeight;
}

sendBtn.onclick = () => sendMessage();

inputBox.addEventListener("keypress", e => {
  if (e.key === "Enter") sendMessage();
});

document.querySelectorAll(".suggestion").forEach(btn => {
  btn.onclick = () => sendMessage(btn.innerText);
});