async function generateStoryboard(){

const idea = document.getElementById("ideaInput").value;
const output = document.getElementById("output");

output.innerHTML = "Generating storyboard...";

try {

const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
method: "POST",

headers: {
"Content-Type": "application/json",
"Authorization": "Bearer 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"
},

body: JSON.stringify({
model: "llama-3.3-70b-versatile",
messages: [
{
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
}
]
})
});

const data = await response.json();

if(!data.choices){
output.innerHTML = "API Error: " + JSON.stringify(data);
return;
}

const text = data.choices[0].message.content;

displayScenes(text);

}
catch(error){

console.error(error);
output.innerHTML = "Error generating storyboard";

}

}



async function generateImage(prompt){

try{

const response = await fetch(
data.candidates[0].content.parts[1].inlineData.data,
{
method: "POST",

headers: {
"Content-Type": "application/json"
},

body: JSON.stringify({
contents: [{
parts: [{
text: `Create a cinematic movie scene image: ${prompt}`
}]
}],

generationConfig:{
responseModalities:["TEXT","IMAGE"]
}

})
});

const data = await response.json();

const base64 = data.candidates[0].content.parts[1].inlineData.data;

return `data:image/png;base64,${base64}`;

}
catch(error){

console.error("Image generation error:",error);
return "https://placehold.co/512x512?text=Scene+Image";

}

}



async function displayScenes(text){

const output = document.getElementById("output");
output.innerHTML = "";

const scenes = text.split("\n").filter(line => line.toLowerCase().includes("scene"));

for(const scene of scenes){

const description = scene.split(":").slice(1).join(":").trim();

const shortPrompt = description.substring(0,100);

const imageURL = await generateImage(shortPrompt);

const card = document.createElement("div");
card.className = "card";

card.innerHTML = `
<h3>${scene.split(":")[0]}</h3>
<img src="${imageURL}" alt="scene image" onerror="this.src='https://placehold.co/512x512?text=Scene+Image';">
<p>${description}</p>
`;

output.appendChild(card);

}

}

