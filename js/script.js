// DOM elements
const button = document.getElementById("useless-button");
const counterDiv = document.getElementById("counter");
const quoteDiv = document.getElementById("quote");
const clickSound = document.getElementById("click-sound");
const failSound = document.getElementById("fail-sound");
const impossibleToggle = document.getElementById("impossible-toggle");

// State
let clicks = 0;
let failedClicks = 0;
let userInteracted = false;
let impossibleMode = false;

const messages = [
  "You are a legend… in another universe.",
  "Clicking skills: unparalleled.",
  "You could be a professional nothing-doer.",
  "Your dedication to nothing is inspiring.",
  "Almost… there… keep clicking!",
  "Warning: excessive clicking may lead to existential thoughts.",
];

const failedClickMessages = [
  "Choppy fingers.",
  "My mom's sandal clicks more precise.",
  "As a nothing-doer, you're pretty good.",
  "You're a failing legend.",
  "Bro missed a stationary button 💀",
  "Even the cursor gave up on you.",
  "You've achieved the rare 'Click Miss Combo'.",
  "Pathetic reflexes — admirable persistence.",
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

// Random color generator
function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// Update counter + quote
function updateCounter(extraText = "") {
  counterDiv.textContent = `Clicks: ${clicks} | Failed clicks: ${failedClicks}`;
  if (extraText) {
    quoteDiv.textContent = extraText;
  }
}

// Random number generator
function getRandomNumber(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Random Location
function getRandomLocation() {
  const maxX = window.innerWidth - button.offsetWidth;
  const maxY = window.innerHeight - button.offsetHeight;
  const randomX = Math.floor(Math.random() * maxX);
  const randomY = Math.floor(Math.random() * maxY);

  return {
    randomX,
    randomY,
  };
}

function buttonTeleport(posX, posY) {
  button.style.position = "absolute";
  button.style.left = `${posX}px`;
  button.style.top = `${posY}px`;
}

// NEW: Toggle impossible mode
impossibleToggle.addEventListener("change", () => {
  impossibleMode = impossibleToggle.checked;
  
  if (impossibleMode) {
    button.classList.add("impossible-mode");
    updateCounter("— 🔥 IMPOSSIBLE MODE ACTIVATED! Good luck clicking now! 🔥");
  } else {
    button.classList.remove("impossible-mode");
    updateCounter("— Normal mode restored. (Boring!)");
  }
});

// Unlock audio on first interaction
window.addEventListener(
  "click",
  () => {
    if (!userInteracted) {
      userInteracted = true;
      clickSound.play().then(() => clickSound.pause());
      failSound.play().then(() => failSound.pause());
    }
  },
  { once: true }
);

// Button click handler
button.addEventListener("click", () => {
  clicks++;
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];
  updateCounter(`— ${randomMessage}`);
  button.style.backgroundColor = getRandomColor();

  // Change size of button
  const width = getRandomNumber(150, 250);
  const height = getRandomNumber(80, 300);
  button.style.width = `${width}px`;
  button.style.height = `${height}px`;

  // Calculate new position
  const { randomX, randomY } = getRandomLocation();
  buttonTeleport(randomX, randomY);

  // Tiny scale animation
  button.style.transform = "scale(1.2)";
  setTimeout(() => {
    button.style.transform = "scale(1)";
  }, 100);
  
  if (userInteracted) {
    clickSound.currentTime = 0;
    clickSound.play().catch(() => {});
  }
});

// Button dodge behavior with impossible mode
let lastDodgeTime = 0;
button.addEventListener("mouseover", () => {
  const now = Date.now();
  
  // IMPOSSIBLE MODE: More aggressive dodge with shorter throttle
  const throttleTime = impossibleMode ? 50 : 150;
  if (now - lastDodgeTime < throttleTime) return;
  lastDodgeTime = now;

  // Create smoke/particle trail
  const particleCount = impossibleMode ? 15 : 8;
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement("span");
    particle.classList.add("particle");
    const offsetX = (Math.random() - 0.5) * button.offsetWidth;
    const offsetY = (Math.random() - 0.5) * button.offsetHeight;
    particle.style.left = `${button.offsetLeft + button.offsetWidth / 2 + offsetX}px`;
    particle.style.top = `${button.offsetTop + button.offsetHeight / 2 + offsetY}px`;
    document.body.appendChild(particle);
    
    setTimeout(() => {
      particle.remove();
    }, 1000);
  }

  // IMPOSSIBLE MODE: Always dodge (100% vs 90%)
  const dodgeChance = impossibleMode ? 1.0 : 0.9;
  
  if (Math.random() < dodgeChance) {
    failedClicks++;
    
    // Use impossible mode messages when active
    const messageArray = impossibleMode ? impossibleFailMessages : failedClickMessages;
    const randomFail = messageArray[Math.floor(Math.random() * messageArray.length)];
    updateCounter(`— ${randomFail}`);

    // Play fail sound (more often in impossible mode)
    const failSoundInterval = impossibleMode ? 5 : 10;
    if (failedClicks % failSoundInterval === 0 && userInteracted) {
      failSound.currentTime = 0;
      failSound.play().catch(() => {});
    }

    // Calculate new position
    const { randomX, randomY } = getRandomLocation();
    buttonTeleport(randomX, randomY);

    // IMPOSSIBLE MODE: More dramatic shake
    const rotation = impossibleMode ? getRandomNumber(-15, 15) : 5;
    button.style.transform = `rotate(${rotation}deg)`;
    setTimeout(() => {
      button.style.transform = "rotate(0deg)";
    }, 100);
  }
});

// NEW: Enhanced mousemove tracking for impossible mode
document.addEventListener("mousemove", (e) => {
  if (!impossibleMode) return;
  
  const buttonRect = button.getBoundingClientRect();
  const buttonCenterX = buttonRect.left + buttonRect.width / 2;
  const buttonCenterY = buttonRect.top + buttonRect.height / 2;
  
  const distanceX = e.clientX - buttonCenterX;
  const distanceY = e.clientY - buttonCenterY;
  const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
  
  // If cursor gets too close (within 200px), run away!
  const dangerZone = 200;
  if (distance < dangerZone) {
    const now = Date.now();
    if (now - lastDodgeTime < 100) return;
    lastDodgeTime = now;
    
    // Move away from cursor
    const { randomX, randomY } = getRandomLocation();
    buttonTeleport(randomX, randomY);
    
    // Random size change for extra chaos
    if (Math.random() > 0.7) {
      const width = getRandomNumber(120, 200);
      const height = getRandomNumber(60, 150);
      button.style.width = `${width}px`;
      button.style.height = `${height}px`;
    }
  }
});

// Random background color changer
function changeBackgroundColor() {
  const color = getRandomColor();
  document.body.style.backgroundColor = color;
}

setInterval(changeBackgroundColor, 5000);

// Time Spent Doing Nothing Timer
const timerDiv = document.getElementById("timer");
let seconds = 0;

function formatTime(sec) {
  const mins = Math.floor(sec / 60);
  const secs = sec % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

function updateTimer() {
  seconds++;
  timerDiv.textContent = `Time spent doing nothing: ${formatTime(seconds)}`;
  
  if (seconds % 5 === 0) {
    timerDiv.classList.add("fade");
    setTimeout(() => timerDiv.classList.remove("fade"), 400);
  }
}

window.addEventListener("load", () => {
  setInterval(updateTimer, 1000);
});