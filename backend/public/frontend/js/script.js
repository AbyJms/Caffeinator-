const GROQ_API_KEY = "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"; // paste yours

document.getElementById("sendBtn")
.addEventListener("click", generateMovcap);

document.getElementById("movieInput")
.addEventListener("keydown", e => {
if(e.key==="Enter"){
e.preventDefault();
generateMovcap();
}
});

async function generateMovcap(){

const input = document.getElementById("movieInput");
const text = input.value.trim();

if(!text) return;

addMessage(text,"user");
input.value="";

const loading = addMessage("Thinking...","bot");

try{

const res = await fetch("https://api.groq.com/openai/v1/chat/completions",{
method:"POST",
headers:{
"Content-Type":"application/json",
"Authorization":"Bearer "+GROQ_API_KEY
},
body:JSON.stringify({
model:"llama-3.3-70b-versatile",
messages:[{
role:"user",
content:`
Write a cinematic recap script:\n${text}

if ${text} == Aadu or Aadu 1 or Aadu : Beekara Jeevi then provide script of : 
In Bangkok, a gangster named Dude is asked by his boss to search for and bring a rare herb known as Neelakoduveli from Kerala which is believed to bring eternal fortune to its bearer.
In Kerala, Shaji Pappan and his friends who live in the High Range area in Idukki participate in and win a tug-of-war tournament, the prize of which is a female goat, whom the team calls 'Pinky'. Shaji, who suffers from frequent back pain, has an issue with women due to his wife, Mary, eloping with his driver.
He reluctantly allows Pinky inside his van on the condition that Abu, one of his teammates, will slaughter it later for a feast. Abu, however, is revealed to be unable to slaughter the goat. This, along with many other problems on their journey back, makes Shaji determined to get rid of Pinky.
One such problem is that they are stopped by Inspector Sarbath Shameer, a quirky police officer, who is known for ramming the culprits' forehead on a lemon and drinking the juice. As Shameer questions them, Menaka Kanthan, an animal welfare activist, arrives and accuses the group of abusing the goat and presses charges. Elsewhere, a veteran leader named P.P Sasi foolishly discloses politically driven murders publicly and has to escape to evade the law.
Dude and his boys now arrive in Kerala in search of Neelakkoduveli, which is now in possession of Satan Xavier, a high-profile drug dealer living in the High Range area. They make a deal with Kanjavu Soman, a low-level drug dealer, to retrieve the herb from Xavier. However, the trunk containing Neelakkoduveli is stolen from Soman by masked assailants driving a van similar to the one that Shaji drives. Dude thinks that Shaji and his group are the thieves and his men then capture Abu and Pinky as hostages. In reality, the true thief is High Range Hakkim, P.P. Sasi's right hand man, who wanted to steal the Neelakoduveli for their profit after hearing about it from Kanjavu Soman.
Shaji is sent a ransom video by Dude and is able to work out their location. The group attempts to rescue Abu and Pinky but is unable to do so due to the firepower that Dude unleashes. Shaji then reluctantly decides to seek help from his estranged elder brother, Thomas, who arms the group with ancient rifles. These rifles turn out to be duds but the group is still able to defeat Dude and rescue Abu and Pinky. During this clash, Shameer and his men arrive and apprehend Dude, the trunk, and also find Sasi hidden nearby. However, on opening the trunk they discover cow dung instead of the herb.
It is then revealed that Soman had switched the trunk with a decoy one filled with dung early on. While escaping with it, he falls into a pit and the contents of the trunk are dispersed. The herb is then eaten by Pinky who is nearby. The power of the herb brought Pinky luck, which was why the lamb wasn't harmed.
Shaji finally manages to sell Pinky to a butcher. On the sight of his friends' evoked grievances, he feels a stroke of sympathy and calls Pinky back. But the butcher's daughter, also named Pinky, responds to the call, and a budding romance is implied between her and Shaji Pappan.

if ${text} == Aadu 2 or Aadu Two then provide script of :
In the high range of Idukki, Shaji Pappan and his friends Arakkal Abu, Captain Sachin Cleetus, Krishnan Mandaram, Kuttan Moonga, Lalan P. K. alias Lolan and Bastin Pathrose are leading a normal life. One day, an uninformed Shaji fights and tosses an SI into a dam unaware that his friends were smuggling sandalwood. This leads him to being charged and bailed. He now has to report to the police station where Shameer joins as the SI. Due to this financial strain, Shaji and his friends decide to compete in a tug-of-war tournament to win a massive gold trophy. To pay for the entry fee of Rs.50,000 Shaji steals the documents for his house and uses it as collateral to take a loan from a loan shark, Irumbu Abdullah.
Dude and his gang, who unable to go back to Bangkok are working in a restaurant. The gang starts digging a tunnel to rob a bank nearby. They complete the tunnel and break into the vault the very night that demonetisation of Indian currency notes takes place. The demonetisation is also bad news for drug dealer Satan Xavier and his assistants Kanjav Soman and Battery Simon.
Shaji's friends enters the tournament and wins the gold trophy. However, the trophy is stolen from them on their journey home. Shaji's mother, realizing that the house documents were stolen, faints and is taken to an hospital. The group then tracks down the thief, Anali Sabu, whose team were runners up in the tournament. Shaji and group break into Sabu's dance party to retrieve the trophy. They beat up Sabu and destroy his place. However, Sabu and his elder brother, Chekuthan Lassar, a notorious criminal, return and burn down Shaji's house. Lassar demands a hefty sum as compensation for the damages they caused.
Mahesh Shetty, a counterfeiter is finalizing a deal to buy the engraving plates of the new 500 Rupee note. But Shetty's partner, Prabhakar, decides to cheat him by making a deal with Xavier. He does this by pretending to have the plates stolen from him. Soman informs Dude about this deal who then decides to steal the plates for himself. Coincidentally, these engraving plates as well as the back medicine for Shaji were to arrive on the same train at the same station. Shaji and his friends reach the station first and receive the plates instead, and Xavier's men get the medicine. This sets a motion, a relentless pursuit by all involved to get these plates.
In the end, Shaji and his friends get the plates and gives it to Lassar to make new fake notes. But soon a foul occurs after which Lassar, Sabu and his henchmen hits Shaji and his friends but towards the end, Shaji and his friends fights back and defeats Lassar, Sabu and his henchman. Lassar tries to kill Shaji with a grenade but Cleetus saves them. The government officials commend them for their honesty but give them a paltry reward. When Shaji and his friends were returning back, they are stopped by the guys who were supposed to give Shaji's medicine for back pain and they give them the dollars which was accidentally given to Shaji. Shaji and his friends, who have the dollars are awestruck thinking what to do with the money. Meanwhile Shaji sees Ponnappan, his ex-driver, eloping with another girl. The film ends by Shaji and his gang chasing him.

Follow Normal Script Writing Format.
Provide detailed descriptions of scenes, dialogues, and character actions.
Make it clean and easy to read, suitable for voiceover narration.

`
}]
})
});

const data = await res.json();

loading.remove();

addMessage(data.choices[0].message.content,"bot");

}catch(err){

loading.remove();
addMessage("❌ Failed","bot");
console.log(err);

}

}


function addMessage(text,type){

const box=document.getElementById("messages");

const msg=document.createElement("div");
msg.className=`message ${type}`;
msg.innerText=text;

box.appendChild(msg);
box.scrollTop=box.scrollHeight;

return msg;

}