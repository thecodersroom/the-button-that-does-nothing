// sound files
const clickSoundFiles = [
  "audio/click1.mp3","audio/click2.wav","audio/click3.wav",
  "audio/click4.wav","audio/click5.wav","audio/click6.mp3",
  "audio/click7.wav","audio/click8.wav"
];

// DOM Elements
const button = document.getElementById("useless-button");
const counterDiv = document.getElementById("counter");
const quoteDiv = document.getElementById("quote");
const timerDiv = document.getElementById("timer");
const clickSound = document.getElementById("click-sound");
const failSound = document.getElementById("fail-sound");
const impossibleToggle = document.getElementById("impossible-toggle");
const themeToggle = document.getElementById("theme-toggle");

const canvas = document.getElementById("particle-canvas");
const ctx = canvas ? canvas.getContext("2d") : null;
const popupContainer = document.getElementById("still-clicking-popup");
const popupYesButton = document.getElementById("popup-yes");
const popupNoButton = document.getElementById("popup-no");

// State
let clicks = 0;
let failedClicks = 0;
let userInteracted = false;
let impossibleMode = false;
let isButtonMoving = false;
let particles = [];
let comboCount = 0;
let lastClickTime = 0;
let lastActivityTime = Date.now();
let popupTimer = null;
let popupActive = false;
let popupAutoCloseTimer = null;

// Canvas setup
if (canvas) {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
}

// Messages
const messages = [
  "You are a legend… in another universe. 🌌",
  "Clicking skills: unparalleled. 💪",
  "You could be a professional nothing-doer. 🎯",
  "Your dedication to nothing is inspiring. ✨",
  "Almost… there… keep clicking! 🚀",
  "Warning: excessive clicking may lead to existential thoughts. 🤔",
  "The button has accepted you as its master. 👑",
  "NASA called, they want your reaction time. 📞",
  "Achievement unlocked: Ultimate Time Waster! 🏆",
  "Your parents would be so proud... maybe. 😅",
];

const failedClickMessages = [
  "Choppy fingers. 🍗",
  "My mom's sandal clicks more precise. 👡",
  "You're a failing legend. 💀",
  "Even the cursor gave up on you. 🖱️",
  "You've achieved the rare 'Click Miss Combo'. 🎪",
  "Pathetic reflexes — admirable persistence. 🐌",
  "Your aim is as good as a stormtrooper's. 🎯",
  "Button: 1, You: 0 😂",
];

const impossibleFailMessages = [
  "Did you really think it would be that easy?",
  "IMPOSSIBLE MODE activated! Good luck! 😈",
  "The button is now sentient and afraid of you.",
  "Physics don't apply here anymore.",
  "You're fighting a losing battle, friend.",
  "The button has evolved beyond your reach.",
  "Welcome to the nightmare dimension.",
  "This is what peak performance looks like.",
];

const comboMessages = [
  "🔥 COMBO x2! You're on fire!",
  "⚡ COMBO x3! Lightning speed!",
  "💫 COMBO x4! Unstoppable!",
  "🌟 COMBO x5! LEGENDARY!",
  "👑 MEGA COMBO! You're the chosen one!",
];

// Achievements
const achievements = {
  10: { icon: "🎯", text: "First Steps - 10 clicks!" },
  25: { icon: "⚡", text: "Speed Demon - 25 clicks!" },
  50: { icon: "🌟", text: "Half Century - 50 clicks!" },
  100: { icon: "💯", text: "Century Master - 100 clicks!" },
  200: { icon: "🚀", text: "Double Century - 200 clicks!" },
  500: { icon: "👑", text: "Click Royalty - 500 clicks!" },
  1000: { icon: "🏆", text: "ULTIMATE CHAMPION - 1000 clicks!" },
};

// Utils
function getRandomColor() {
  const colors = ["#FF6B6B","#4ECDC4","#45B7D1","#FFA07A","#98D8C8","#F7DC6F","#BB8FCE","#85C1E2","#F8B739","#52B788"];
  return colors[Math.floor(Math.random() * colors.length)];
}

function getRandomNumber(min,max){return Math.floor(Math.random()*(max-min+1))+min;}

function getRandomLocation(){
  const padding=20;
  const maxX=window.innerWidth-button.offsetWidth-padding;
  const maxY=window.innerHeight-button.offsetHeight-padding;
  const minX=padding;
  const minY=padding;
  const randomX=Math.floor(Math.random()*(maxX-minX))+minX;
  const randomY=Math.floor(Math.random()*(maxY-minY))+minY;
  const parentNode = button.parentNode.getBoundingClientRect();
  return { left: randomX-parentNode.left, top: randomY-parentNode.top, randomX, randomY };
}

function buttonTeleport(posX,posY){
  button.style.position="absolute";
  button.style.left=`${posX}px`;
  button.style.top=`${posY}px`;
  button.style.transition="all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)";
}

function updateCounter(extraText=""){
  counterDiv.textContent=`Clicks: ${clicks} | Failed clicks: ${failedClicks}`;
  if(extraText){
    quoteDiv.textContent=extraText;
    quoteDiv.style.animation="none";
    setTimeout(()=>{quoteDiv.style.animation="fadeIn 0.5s ease-in forwards";},10);
  }
}

function playSound(sound){
  if(sound && userInteracted){
    const idx=Math.floor(Math.random()*clickSoundFiles.length);
    sound.src=clickSoundFiles[idx];sound.currentTime=0;
    sound.play().catch(()=>{});
  }
}

// Impossible Mode Toggle
impossibleToggle.addEventListener("change",()=>{
  impossibleMode=impossibleToggle.checked;
  if(impossibleMode){
    button.classList.add("impossible-mode");
    updateCounter("— 🔥 IMPOSSIBLE MODE ACTIVATED! Good luck clicking now! 🔥");
  } else {
    button.classList.remove("impossible-mode");
    updateCounter("— Normal mode restored. (Boring!)");
  }
});

// Unlock audio on first interaction
window.addEventListener("click",()=>{
  if(!userInteracted){
    userInteracted=true;
    clickSound.play().then(()=>clickSound.pause());
    failSound.play().then(()=>failSound.pause());
  }
},{once:true});

// Combo System
function checkCombo(){
  const now=Date.now();
  const timeDiff=now-lastClickTime;
  if(timeDiff<500){comboCount++;
    if(comboCount>=2 && comboCount<=6){
      const comboMessage=comboMessages[Math.min(comboCount-2,comboMessages.length-1)];
      quoteDiv.textContent=comboMessage;quoteDiv.style.color="#FFD700";
      setTimeout(()=>{quoteDiv.style.color="#fff";},1000);
    }
  } else {comboCount=0;}
  lastClickTime=now;
}

// Particle System
class Particle{
  constructor(x,y,isSuccess=true){
    this.x=x;this.y=y;this.size=Math.random()*5+2;
    this.speedX=(Math.random()-0.5)*10;this.speedY=(Math.random()-0.5)*10;
    this.color=isSuccess?`hsl(${Math.random()*60+120},100%,60%)`:`hsl(${Math.random()*30},100%,60%)`;
    this.life=100;
  }
  update(){this.x+=this.speedX;this.y+=this.speedY;this.speedY+=0.2;this.life-=2;}
  draw(){if(!ctx)return;ctx.fillStyle=this.color;ctx.globalAlpha=this.life/100;ctx.beginPath();ctx.arc(this.x,this.y,this.size,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;}
}
function createParticles(x,y,count=20,isSuccess=true){for(let i=0;i<count;i++){particles.push(new Particle(x,y,isSuccess));}}
function animateParticles(){if(!ctx)return;ctx.clearRect(0,0,canvas.width,canvas.height);for(let i=particles.length-1;i>=0;i--){particles[i].update();particles[i].draw();if(particles[i].life<=0){particles.splice(i,1);}}requestAnimationFrame(animateParticles);}
if(ctx)animateParticles();

// Show Achievement
function showAchievement(clickCount){
  if(!achievements[clickCount])return;
  const achievement=achievements[clickCount];
  const popup=document.getElementById("achievement-popup");
  if(popup){
    popup.querySelector(".achievement-icon").textContent=achievement.icon;
    popup.querySelector(".achievement-text").textContent=achievement.text;
    popup.classList.add("show");
    setTimeout(()=>popup.classList.remove("show"),3000);
  }
}

// Button Click
button.addEventListener("click",(e)=>{
  clicks++;checkCombo();
  const randomMessage=messages[Math.floor(Math.random()*messages.length)];
  updateCounter(`— ${randomMessage}`);
  button.style.backgroundColor=getRandomColor();
  const width=getRandomNumber(150,250);const height=getRandomNumber(80,150);
  button.style.width=`${width}px`;button.style.height=`${height}px`;
  const {randomX,randomY}=getRandomLocation();
  buttonTeleport(randomX,randomY);
  button.style.transform="scale(1.2) rotate(10deg)";
  setTimeout(()=>{button.style.transform="scale(1) rotate(0deg)";},100);
  playSound(clickSound);
  createParticles(e.clientX,e.clientY,30,true);
  showAchievement(clicks);
  if(clicks%50===0){document.body.classList.add("page-shake");setTimeout(()=>document.body.classList.remove("page-shake"),500);}
  updateActivityTime();
});

// Button Dodge
let lastDodgeTime=0;
button.addEventListener("mouseover",()=>{
  if(isButtonMoving)return;
  const now=Date.now();
  const throttleTime=impossibleMode?50:150;
  if(now-lastDodgeTime<throttleTime)return;
  lastDodgeTime=now;
  const particleCount=impossibleMode?15:8;
  for(let i=0;i<particleCount;i++){
    const particle=document.createElement("span");particle.classList.add("particle");
    const offsetX=(Math.random()-0.5)*button.offsetWidth;const offsetY=(Math.random()-0.5)*button.offsetHeight;
    particle.style.left=`${button.offsetLeft+button.offsetWidth/2+offsetX}px`;
    particle.style.top=`${button.offsetTop+button.offsetHeight/2+offsetY}px`;
    document.body.appendChild(particle);setTimeout(()=>{particle.remove();},1000);
  }
  const dodgeChance=impossibleMode?1:0.9;
  if(Math.random()<dodgeChance){
    isButtonMoving=true;failedClicks++;
    const messageArray=impossibleMode?impossibleFailMessages:failedClickMessages;
    const randomFail=messageArray[Math.floor(Math.random()*messageArray.length)];
    updateCounter(`— ${randomFail}`);
    if(failedClicks%(impossibleMode?5:10)===0 && userInteracted){failSound.currentTime=0;failSound.play().catch(()=>{});}
    const {randomX,randomY}=getRandomLocation();buttonTeleport(randomX,randomY);
    const rotation=impossibleMode?getRandomNumber(-15,15):5;button.style.transform=`rotate(${rotation}deg)`;
    setTimeout(()=>{button.style.transform="rotate(0deg) scale(1)";isButtonMoving=false;},200);
  }
});

// Impossible Mode Mousemove Dodge
document.addEventListener("mousemove",(e)=>{
  if(!impossibleMode)return;
  const rect=button.getBoundingClientRect();
  const cx=rect.left+rect.width/2;const cy=rect.top+rect.height/2;
  const dx=e.clientX-cx;const dy=e.clientY-cy;
  const dist=Math.sqrt(dx*dx+dy*dy);const dangerZone=200;
  if(dist<dangerZone){const now=Date.now();if(now-lastDodgeTime<100)return;lastDodgeTime=now;
    const {randomX,randomY}=getRandomLocation();buttonTeleport(randomX,randomY);
    if(Math.random()>0.7){button.style.width=`${getRandomNumber(120,200)}px`;button.style.height=`${getRandomNumber(60,150)}px`;}
  }
});

// Background color changer
function changeBackgroundColor(){
  const color1=getRandomColor();const color2=getRandomColor();
  document.body.style.background=`linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`;
}
setInterval(changeBackgroundColor,5000);

// Timer
let seconds=0;
function formatTime(sec){const mins=Math.floor(sec/60);const secs=sec%60;return `${mins.toString().padStart(2,"0")}:${secs.toString().padStart(2,"0")}`;}
function updateTimer(){seconds++;timerDiv.textContent=`Time spent doing nothing: ${formatTime(seconds)}`;if(seconds%5===0){timerDiv.classList.add("fade");setTimeout(()=>timerDiv.classList.remove("fade"),400);}}
window.addEventListener("load",()=>{setInterval(updateTimer,1000);quoteDiv.textContent="Click the button to begin your pointless journey! 🚀";updateActivityTime();});

// Theme toggle
themeToggle.addEventListener("click",()=>{
  const current=document.body.dataset.theme;
  const newTheme=current==="light"?"dark":"light";
  document.body.dataset.theme=newTheme;
  quoteDiv.textContent=newTheme==="light"?"Welcome to the light. It won’t help.":"Back to the void.";
  updateActivityTime();
});

// === Are You Still Clicking Popup ===
function updateActivityTime(){lastActivityTime=Date.now();if(popupTimer)clearTimeout(popupTimer);popupTimer=setTimeout(showPopup,getRandomInactivityTime());}
function getRandomInactivityTime(){return Math.floor(Math.random()*(30000-15000+1))+15000;}
function showPopup(){if(popupActive)return;popupActive=true;popupContainer.classList.add("show");popupAutoCloseTimer=setTimeout(hidePopup,8000);}
function hidePopup(){popupContainer.classList.remove("show");popupActive=false;if(popupAutoCloseTimer)clearTimeout(popupAutoCloseTimer);updateActivityTime();}
function randomizeButtonPosition(button,containerWidth,containerHeight){const bw=button.offsetWidth;const bh=button.offsetHeight;const rx=Math.random()* (containerWidth-bw);const ry=Math.random()* (containerHeight-bh);button.style.left=`${rx}px`;button.style.top=`${ry}px`;button.style.transform="none";}
popupYesButton.addEventListener("mouseover",()=>{randomizeButtonPosition(popupYesButton,popupYesButton.closest(".popup-buttons").offsetWidth,popupYesButton.closest(".popup-buttons").offsetHeight);});
popupNoButton.addEventListener("mouseover",()=>{randomizeButtonPosition(popupNoButton,popupNoButton.closest(".popup-buttons").offsetWidth,popupNoButton.closest(".popup-buttons").offsetHeight);});
popupYesButton.addEventListener("click",()=>{hidePopup();playSound(clickSound);});
popupNoButton.addEventListener("click",()=>{hidePopup();playSound(clickSound);});
["click","mousemove","keydown"].forEach(e=>document.addEventListener(e,updateActivityTime));
