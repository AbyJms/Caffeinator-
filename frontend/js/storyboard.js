async function generateStoryboard() {

const idea = document.getElementById("ideaInput").value;
const output = document.getElementById("output");

output.innerHTML = "Generating storyboard...";

try {

// ✅ CALL BACKEND ONLY
const response = await fetch("http://localhost:3000/generate-storyboard", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ idea })
});

const data = await response.json();

if (!data.choices) {
output.innerHTML = "Backend Error";
console.log(data);
return;
}

const text = data.choices[0].message.content;

// 🔥 RUN PYTHON (screenshots)
await fetch("http://localhost:3000/run-frame-grabber");

// 🔥 GET SCREENSHOTS
const frameRes = await fetch("http://localhost:3000/get-frames");
const frames = await frameRes.json();

displayScenes(text, frames);

}
catch (error) {

console.error(error);
output.innerHTML = "Error generating storyboard";

}

}



function displayScenes(text, frames){

const output = document.getElementById("output");
output.innerHTML = "";

const scenes = text.split("\n").filter(line => line.toLowerCase().includes("scene"));

scenes.forEach((scene, i) => {

const description = scene.split(":").slice(1).join(":").trim();

const card = document.createElement("div");
card.className = "card";

card.innerHTML = `
<h3>${scene.split(":")[0]}</h3>
<img src="${frames[i] || 'https://placehold.co/512x512'}">
<p>${description}</p>
`;

output.appendChild(card);

});

}