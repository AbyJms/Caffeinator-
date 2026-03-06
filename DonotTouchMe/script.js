let currentUserId = null;
const loginBtn = document.querySelector('.login-btn'); 
const modal = document.getElementById('loginModal');


loginBtn.addEventListener('click', () => { toggleLogin(); });

function toggleLogin() {
  const isOpen = modal.classList.contains('open');
  if (!isOpen) {
    modal.classList.add('open');
  } else {
    modal.classList.remove('open');
  }
}

modal.addEventListener('click', (e) => {
  if (e.target === modal) toggleLogin();
});

async function submitLogin() {
  const name = document.getElementById('loginName').value;
  const pass = document.getElementById('loginPass').value;
  
  if(!name || !pass) { alert("Fill in both!"); return; }

  try {
    const response = await fetch('http://localhost:3000/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: name, password: pass }) // json converts js obj to string to send over the network
    });
    
    const data = await response.json();

    if (data.success) {
      currentUserId = data.userId;
      loginBtn.textContent = data.username;
      alert(data.msg); 
      toggleLogin();
    } else {
      alert(data.message || data.error || "Login Failed");
    }
  } catch (err) {
    console.error(err);
    alert("Server error. Is Node running?");
  }
}

async function askServer(userText) {
  const chatBody = document.getElementById("chatBody");

  const loadingMsg = document.createElement("div");
  loadingMsg.className = "chat-message";
  loadingMsg.style.alignSelf = "flex-start";
  loadingMsg.innerText = "Thinking...";
  chatBody.appendChild(loadingMsg);
  chatBody.scrollTop = chatBody.scrollHeight;

  try {
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
          message: userText,
          userId: currentUserId
      })
    });

    const data = await response.json();

    // Replace the "thinking" thing
    chatBody.removeChild(loadingMsg);

    const aiMsg = document.createElement("div");
    aiMsg.className = "chat-message";
    aiMsg.textAlign = "left";
    aiMsg.style.alignSelf = "flex-start";
    aiMsg.innerText = data.reply; 
    chatBody.appendChild(aiMsg);

  } catch (error) {
    chatBody.removeChild(loadingMsg);
    const errorMsg = document.createElement("div");
    errorMsg.className = "chat-message";
    errorMsg.style.color = "red";
    errorMsg.innerText = "Error: Server not reachable.";
    chatBody.appendChild(errorMsg);
  }
  
  chatBody.scrollTop = chatBody.scrollHeight;
}

function openChat(symptom) {
  if (!document.body.classList.contains("split-active")) {
    toggleSplitMode();
  }

  const chatBody = document.getElementById("chatBody");
  const text = "I have a " + symptom;

  const userMsg = document.createElement("div");
  userMsg.className = "chat-message";
  userMsg.style.background = "#eef";
  userMsg.style.textAlign = "right";
  userMsg.style.alignSelf = "flex-end";
  userMsg.innerText = text;
  chatBody.appendChild(userMsg);
  chatBody.scrollTop = chatBody.scrollHeight;
  askServer(text); // calling groq
}

function sendMessage() {
  const input = document.getElementById("userInput");
  const text = input.value.trim();
  if (text === "") return;

  const chatBody = document.getElementById("chatBody");

  const userMsg = document.createElement("div");
  userMsg.className = "chat-message";
  userMsg.style.background = "#eef";
  userMsg.style.textAlign = "right";
  userMsg.style.alignSelf = "flex-end";
  userMsg.innerText = text;
  chatBody.appendChild(userMsg);

  input.value = "";
  chatBody.scrollTop = chatBody.scrollHeight;
  askServer(text);
}

function toggleSplitMode() {
  const body = document.body;
  const originalGrid = document.getElementById("originalGrid");
  const splitLayout = document.getElementById("splitLayout");
  const leftCol = document.getElementById("leftCol");
  const rightCol = document.getElementById("rightCol");
  const centerCol = document.getElementById("centerCol");
  const chatBox = document.getElementById("chatBox");

  const isSplit = body.classList.contains("split-active");

  if (!isSplit) {
    body.classList.add("split-active");
    splitLayout.classList.add("active");
    centerCol.appendChild(chatBox);
    chatBox.style.display = "flex";

    const cards = Array.from(originalGrid.children);
    cards.forEach((card, index) => {
      if (index % 2 === 0) leftCol.appendChild(card);
      else rightCol.appendChild(card);
    });

  } else {
    body.classList.remove("split-active");
    splitLayout.classList.remove("active");
    document.body.appendChild(chatBox);
    chatBox.style.display = "none";

    const leftCards = Array.from(leftCol.children);
    const rightCards = Array.from(rightCol.children);
    [...leftCards, ...rightCards].forEach(card => {
        originalGrid.appendChild(card);
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const inputField = document.getElementById("userInput");
  if (inputField) {
    inputField.addEventListener("keypress", (e) => {
      if (e.key === "Enter") sendMessage();
    });
  }
});