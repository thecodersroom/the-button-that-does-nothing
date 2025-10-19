// sound files
const clickSoundFiles = [
  "audio/click1.mp3",
  "audio/click2.wav",
  "audio/click3.wav",
  "audio/click4.wav",
  "audio/click5.wav",
  "audio/click6.mp3",
  "audio/click7.wav",
  "audio/click8.wav",
];

// === DOM Elements ===
const button = document.getElementById("useless-button");
const counterDiv = document.getElementById("counter");
const quoteDiv = document.getElementById("quote");
const timerDiv = document.getElementById("timer");
const clickSound = document.getElementById("click-sound");
const failSound = document.getElementById("fail-sound");
const canvas = document.getElementById("particle-canvas");
const ctx = canvas ? canvas.getContext("2d") : null;
const popupContainer = document.getElementById("still-clicking-popup");
const popupYesButton = document.getElementById("popup-yes");
const popupNoButton = document.getElementById("popup-no");

// === State Variables ===
let clicks = 0;
let failedClicks = 0;
let userInteracted = false;
let isButtonMoving = false;
let particles = [];
let comboCount = 0;
let lastClickTime = 0;
let lastActivityTime = Date.now();
let popupTimer = null;
let popupActive = false;
let popupAutoCloseTimer = null;

// Setup canvas if exists
if (canvas) {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
}

// === Messages ===
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
  "As a nothing-doer, you're pretty good. 😏",
  "You're a failing legend. 💀",
  "Bro missed a stationary button 💀",
  "Even the cursor gave up on you. 🖱️",
  "You've achieved the rare 'Click Miss Combo'. 🎪",
  "Pathetic reflexes — admirable persistence. 🐌",
  "Your aim is as good as a stormtrooper's. 🎯",
  "Button: 1, You: 0 😂",
];

const comboMessages = [
  "🔥 COMBO x2! You're on fire!",
  "⚡ COMBO x3! Lightning speed!",
  "💫 COMBO x4! Unstoppable!",
  "🌟 COMBO x5! LEGENDARY!",
  "👑 MEGA COMBO! You're the chosen one!",
];

// === Achievements System ===
const achievements = {
  10: {
    icon: "🥉",
    text: "Novice Nothing-Doer — 10 clicks! You've officially wasted your first minute productively doing nothing!",
  },
  25: {
    icon: "🧤",
    text: "Casual Clicker — 25 clicks! You’re getting suspiciously good at being unproductive.",
  },
  50: {
    icon: "🥈",
    text: "Master of Useless Clicking — 50 clicks! Your dedication to pointlessness is unmatched!",
  },
  100: {
    icon: "🥇",
    text: "Legendary Button Slayer — 100 clicks! The button now fears your existence.",
  },
  200: {
    icon: "🚀",
      text: "Galactic Click Commander — 200 clicks! You've officially left the orbit of sanity.",
    },
    500: {
      icon: "👑",
      text: "Click Royalty — 500 clicks! Bow down to the Emperor of Empty Effort!",
    },
    1000: {
      icon: "🏆",
      text: "Ultimate Button God — 1000 clicks! You’ve ascended beyond purpose, beyond reason, beyond… everything.",
    },
  };

// === Utility Functions ===
function getRandomColor() {
  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#FFA07A",
    "#98D8C8",
    "#F7DC6F",
    "#BB8FCE",
    "#85C1E2",
    "#F8B739",
    "#52B788",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomLocation() {
  // find the maximum and minimum locations the useless button can be
  const padding = 20;
  const maxX = window.innerWidth - button.offsetWidth - padding;
  const maxY = window.innerHeight - button.offsetHeight - padding;
  const minX = padding;
  const minY = padding;

  // randomly choose a location
  const randomX = Math.floor(Math.random() * (maxX - minX)) + minX;
  const randomY = Math.floor(Math.random() * (maxY - minY)) + minY;

  // find the location of useless button's parent node
  var parentNode = document
    .getElementById("useless-button")
    .parentNode.getBoundingClientRect();

  // modify the random location by the parent div location so the absolute style renders in the correct position
  const top = randomY - parentNode.top;
  const left = randomX - parentNode.left;

  return { left, top };
}

function buttonTeleport(posX, posY) {
  button.style.position = "absolute";
  button.style.left = `${posX}px`;
  button.style.top = `${posY}px`;
  button.style.transition = "all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)";
}

function updateCounter(extraText = "") {
  counterDiv.textContent = `Clicks: ${clicks} | Failed clicks: ${failedClicks}`;
  if (extraText) {
    quoteDiv.textContent = extraText;
    quoteDiv.style.animation = "none";
    setTimeout(() => {
      quoteDiv.style.animation = "fadeIn 0.5s ease-in forwards";
    }, 10);
  }
}

function playSound(sound) {
  if (sound && userInteracted) {
    const randomIndex = Math.floor(Math.random() * clickSoundFiles.length);
    sound.src = clickSoundFiles[randomIndex];
    sound.currentTime = 0;
    sound.play().catch(() => {});
  }
}

// === Particle System ===
class Particle {
  constructor(x, y, isSuccess = true) {
    this.x = x;
    this.y = y;
    this.size = Math.random() * 5 + 2;
    this.speedX = (Math.random() - 0.5) * 10;
    this.speedY = (Math.random() - 0.5) * 10;
    this.color = isSuccess
      ? `hsl(${Math.random() * 60 + 120}, 100%, 60%)`
      : `hsl(${Math.random() * 30}, 100%, 60%)`;
    this.life = 100;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.speedY += 0.2;
    this.life -= 2;
  }

  draw() {
    if (!ctx) return;
    ctx.fillStyle = this.color;
    ctx.globalAlpha = this.life / 100;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

function createParticles(x, y, count = 20, isSuccess = true) {
  for (let i = 0; i < count; i++) {
    particles.push(new Particle(x, y, isSuccess));
  }
}

function animateParticles() {
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].draw();

    if (particles[i].life <= 0) {
      particles.splice(i, 1);
    }
  }

  requestAnimationFrame(animateParticles);
}

if (ctx) animateParticles();

// === Smoke Trail Effect ===
function createSmokeTrail() {
  for (let i = 0; i < 8; i++) {
    const particle = document.createElement("span");
    particle.classList.add("particle");

    const offsetX = (Math.random() - 0.5) * button.offsetWidth;
    const offsetY = (Math.random() - 0.5) * button.offsetHeight;

    particle.style.left = `${
      button.offsetLeft + button.offsetWidth / 2 + offsetX
    }px`;
    particle.style.top = `${
      button.offsetTop + button.offsetHeight / 2 + offsetY
    }px`;
    particle.style.background = getRandomColor();

    document.body.appendChild(particle);

    setTimeout(() => particle.remove(), 1000);
  }
}

// === Achievement Display ===
function showAchievement(clickCount) {
  if (!achievements[clickCount]) return;

  const achievement = achievements[clickCount];
  const popup = document.getElementById("achievement-popup");

  if (popup) {
    const icon = popup.querySelector(".achievement-icon");
    const text = popup.querySelector(".achievement-text");

    icon.textContent = achievement.icon;
    text.textContent = achievement.text;
    popup.classList.add("show");

    setTimeout(() => popup.classList.remove("show"), 3000);
  }
}

// === Combo System ===
function checkCombo() {
  const now = Date.now();
  const timeDiff = now - lastClickTime;

  if (timeDiff < 500) {
    // Less than 500ms between clicks
    comboCount++;
    if (comboCount >= 2 && comboCount <= 6) {
      const comboMessage =
        comboMessages[Math.min(comboCount - 2, comboMessages.length - 1)];
      quoteDiv.textContent = comboMessage;
      quoteDiv.style.color = "#FFD700";
      setTimeout(() => {
        quoteDiv.style.color = "#fff";
      }, 1000);
    }
  } else {
    comboCount = 0;
  }

  lastClickTime = now;
}

// === Unlock Audio ===
window.addEventListener(
  "click",
  () => {
    if (!userInteracted) {
      userInteracted = true;
      if (clickSound)
        clickSound
          .play()
          .then(() => clickSound.pause())
          .catch(() => {});
      if (failSound)
        failSound
          .play()
          .then(() => failSound.pause())
          .catch(() => {});
    }
  },
  { once: true }
);

// === Button Click Handler ===
button.addEventListener("click", (e) => {
  e.stopPropagation();
  clicks++;
  checkCombo();

  const randomMessage = messages[Math.floor(Math.random() * messages.length)];
  updateCounter(`— ${randomMessage}`);

  // Change button appearance
  button.style.backgroundColor = getRandomColor();
  const width = getRandomNumber(150, 250);
  const height = getRandomNumber(80, 150);
  button.style.width = `${width}px`;
  button.style.height = `${height}px`;

  // Teleport button
  const { randomX, randomY } = getRandomLocation();
  buttonTeleport(randomX, randomY);

  // Animations
  button.style.transform = "scale(1.2) rotate(10deg)";
  setTimeout(() => {
    button.style.transform = "scale(1) rotate(0deg)";
  }, 150);

  // Effects

  if (!userInteracted) {
    userInteracted = true;
  }

  playSound(clickSound);
  createParticles(e.clientX, e.clientY, 30, true);
  showAchievement(clicks);

  // Special effects at milestones
  if (clicks % 50 === 0) {
    document.body.classList.add("page-shake");
    setTimeout(() => document.body.classList.remove("page-shake"), 500);
  }
});

// === Button Dodge Behavior ===
let lastDodgeTime = 0;
button.addEventListener("mouseover", () => {
  if (isButtonMoving) return;

  const now = Date.now();
  if (now - lastDodgeTime < 200) return;
  lastDodgeTime = now;

  // Create smoke trail
  createSmokeTrail();

  // Dodge logic (90% chance)
  if (Math.random() < 0.9) {
    isButtonMoving = true;
    failedClicks++;

    const randomFail =
      failedClickMessages[
        Math.floor(Math.random() * failedClickMessages.length)
      ];
    updateCounter(`— ${randomFail}`);

    // Play fail sound every 10 fails
    if (failedClicks % 10 === 0) {
      playSound(failSound);
    }

    // Teleport button
    const { randomX, randomY } = getRandomLocation();
    buttonTeleport(randomX, randomY);

    // Shake animation
    button.style.transform = "rotate(5deg) scale(0.95)";
    setTimeout(() => {
      button.style.transform = "rotate(0deg) scale(1)";
      isButtonMoving = false;
    }, 200);
  }
});

// === Background Color Changer ===
function changeBackgroundColor() {
  const color1 = getRandomColor();
  const color2 = getRandomColor();
  document.body.style.background = `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`;
}

setInterval(changeBackgroundColor, 5000);

// === Timer ===
let seconds = 0;
function formatTime(sec) {
  const mins = Math.floor(sec / 60);
  const secs = sec % 60;
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
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
  quoteDiv.textContent = "Click the button to begin your pointless journey! 🚀";
});

const themeToggle = document.getElementById("theme-toggle");

themeToggle.addEventListener("click", () => {
  const current = document.body.dataset.theme;
  const newTheme = current === "light" ? "dark" : "light";
  document.body.dataset.theme = newTheme;
  quoteDiv.textContent =
    newTheme === "light"
      ? "Welcome to the light. It won’t help."
      : "Back to the void.";
});

// === Are You Still Clicking Popup ===

// Function to update the last activity time
function updateActivityTime() {
  lastActivityTime = Date.now();

  // Reset popup timer if it exists
  if (popupTimer) {
    clearTimeout(popupTimer);
  }

  // Set new popup timer
  popupTimer = setTimeout(showPopup, getRandomInactivityTime());
}

// Function to get a random inactivity time between 15-30 seconds
function getRandomInactivityTime() {
  return Math.floor(Math.random() * (30000 - 15000 + 1)) + 15000; // 15-30 seconds
}

// Function to show the popup
function showPopup() {
  if (popupActive) return;

  popupActive = true;
  popupContainer.classList.add("show");

  // Auto-close popup after 8 seconds
  popupAutoCloseTimer = setTimeout(() => {
    hidePopup();
  }, 8000);
}

// Function to hide the popup
function hidePopup() {
  popupContainer.classList.remove("show");
  popupActive = false;

  if (popupAutoCloseTimer) {
    clearTimeout(popupAutoCloseTimer);
  }

  // Reset the activity timer
  updateActivityTime();
}

// Function to randomize button position within the popup
function randomizeButtonPosition(button, containerWidth, containerHeight) {
  const buttonWidth = button.offsetWidth;
  const buttonHeight = button.offsetHeight;

  // Calculate maximum positions while keeping buttons within container
  const maxX = containerWidth - buttonWidth;
  const maxY = containerHeight - buttonHeight;

  // Generate random positions
  const randomX = Math.random() * maxX;
  const randomY = Math.random() * maxY;

  // Apply new positions
  button.style.left = `${randomX}px`;
  button.style.top = `${randomY}px`;
  button.style.transform = "none"; // Reset any transform
}

// Event listeners for popup buttons
popupYesButton.addEventListener("mouseover", () => {
  const container = popupYesButton.closest(".popup-buttons");
  randomizeButtonPosition(
    popupYesButton,
    container.offsetWidth,
    container.offsetHeight
  );
});

popupNoButton.addEventListener("mouseover", () => {
  const container = popupNoButton.closest(".popup-buttons");
  randomizeButtonPosition(
    popupNoButton,
    container.offsetWidth,
    container.offsetHeight
  );
});

popupYesButton.addEventListener("click", () => {
  hidePopup();
  playSound(clickSound);
});

popupNoButton.addEventListener("click", () => {
  hidePopup();
  playSound(clickSound);
});

// Track all user interactions to reset the inactivity timer
["click", "mousemove", "keydown"].forEach((eventType) => {
  document.addEventListener(eventType, updateActivityTime);
});

// Initialize the popup timer on page load
window.addEventListener("load", () => {
  // Add this to the existing load event
  updateActivityTime();
});

// Update activity time on theme toggle
themeToggle.addEventListener("click", updateActivityTime);

// Update activity time on button click
button.addEventListener("click", updateActivityTime);
