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
const bgMusic = document.getElementById("bg-music");
const soundToggle = document.getElementById("sound-toggle");
const soundPanel = document.getElementById("sound-panel");
const soundsToggle = document.getElementById("sounds-toggle");
const musicToggle = document.getElementById("music-toggle");
const volumeSlider = document.getElementById("volume-slider");
const trackSelector = document.getElementById("track-selector");
const closeSoundPanel = document.getElementById("close-sound-panel");

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
let lastDodgeTime = 0;
let seconds = 0;

// Sound Settings
let soundsEnabled = localStorage.getItem('soundsEnabled') !== 'false';
let musicEnabled = localStorage.getItem('musicEnabled') !== 'false';
let masterVolume = parseFloat(localStorage.getItem('masterVolume')) || 1.0;
let currentTrack = localStorage.getItem('currentTrack') || '8bit';

const tracks = {
  'lofi': 'audio/lo-fi.mp3',
  '8bit': 'audio/8-bit.mp3',
  'boss': 'audio/boss.mp3',
  'suspense': 'audio/suspense.mp3',
  'horror': 'audio/horror.mp3'
};

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

// Utils
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

/**
 * Returns location values:
 * - left/top are relative to button.parentNode (suitable for style.left/top)
 * - randomX/randomY are provided as aliases (equal to left/top) so older calls still work
 */
function getRandomLocation() {
  const padding = 20;
  const maxX = window.innerWidth - (button ? button.offsetWidth : 100) - padding;
  const maxY = window.innerHeight - (button ? button.offsetHeight : 50) - padding;
  const minX = padding;
  const minY = padding;

  const randomXAbs = Math.floor(Math.random() * (maxX - minX + 1)) + minX;
  const randomYAbs = Math.floor(Math.random() * (maxY - minY + 1)) + minY;

  const parentNodeRect = button.parentNode.getBoundingClientRect();
  const left = randomXAbs - parentNodeRect.left;
  const top = randomYAbs - parentNodeRect.top;

  return { left, top, randomX: left, randomY: top };
}

function buttonTeleport(posX, posY) {
  // posX/posY are expected to be left/top relative to parent (as returned by getRandomLocation)
  button.style.position = "absolute";
  button.style.left = `${posX}px`;
  button.style.top = `${posY}px`;
  button.style.transition = "all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)";
}

function updateCounter(extraText = "") {
  if (counterDiv) {
    counterDiv.textContent = `Clicks: ${clicks} | Failed clicks: ${failedClicks}`;
  }
  if (extraText && quoteDiv) {
    quoteDiv.textContent = extraText;
    quoteDiv.style.animation = "none";
    setTimeout(() => {
      quoteDiv.style.animation = "fadeIn 0.5s ease-in forwards";
    }, 10);
  }
}

function playSound(sound) {
  if (sound && userInteracted && soundsEnabled) {
    sound.volume = masterVolume;
    const randomIndex = Math.floor(Math.random() * clickSoundFiles.length);
    sound.src = clickSoundFiles[randomIndex];
    sound.currentTime = 0;
    sound.play().catch(() => {});
  }
}

// === Particle System (canvas) ===
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
    ctx.globalAlpha = Math.max(this.life / 100, 0);
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
    if (particles[i].life <= 0) particles.splice(i, 1);
  }
  requestAnimationFrame(animateParticles);
}

if (ctx) animateParticles();

// === Confetti System ===
function createConfetti() {
  for (let i = 0; i < 200; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = Math.random() * 100 + 'vw';
    confetti.style.backgroundColor = getRandomColor();
    confetti.style.animationDelay = Math.random() * 2 + 's';
    document.body.appendChild(confetti);
    
    setTimeout(() => confetti.remove(), 6000);
  }
}

// === Smoke Trail Effect ===
function createSmokeTrail() {
  if (!button) return;
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

// === Disable Teleport Method === 
function buttonDisableTeleport() { 
  button.style.transition = "none";
  button.style.position = "relative";
  button.style.left = "";
  button.style.top = "";
}

// === Main Burst Particles Method === 
function burstButtonParticles() {
  isCelebrationAnimationComplete = false;

  const rect = button.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  explode(centerX, centerY);

  if (isCelebrationAnimationComplete === true) {
    const randomLoc = getRandomLocation();
    targetX = randomLoc.left;
    targetY = randomLoc.top;
    buttonTeleport(targetX, targetY);
  }
}
 
// === Rand Utility === 
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// === Burst Method === 
function explode(x, y) {
  // === Rand (required utility) === 
  if (typeof rand !== 'function') {
      console.error("The 'rand' utility function is required for explode().");
      return;
  }

  const particles = 1200;
  const explosion = document.createElement('div');
  explosion.classList.add('explosion');

  document.body.appendChild(explosion);

  explosion.style.position = 'absolute';
  explosion.style.left = `${x - explosion.offsetWidth / 2}px`;
  explosion.style.top = `${y - explosion.offsetHeight / 2}px`;

  for (let i = 0; i < particles; i++) {

      const distanceX = rand(80, 500);
      const distanceY = rand(80, 500);
      const angleFactor = rand(particles - 10, particles + 10);
      
      const particleX = (explosion.offsetWidth / 2) + distanceX * Math.cos(2 * Math.PI * i / angleFactor);
      const particleY = (explosion.offsetHeight / 2) + distanceY * Math.sin(2 * Math.PI * i / angleFactor);
      
      // === Color Generation in RGB === 
      const r = rand(50, 255);
      const g = rand(50, 255);
      const b = rand(50, 255);
      const color = `rgb(${r}, ${g}, ${b})`;

      // === Particle element === 
      const elm = document.createElement('div');
      elm.classList.add('particle-burst');
      
      // === Apply inline styles === 
      elm.style.backgroundColor = color;
      elm.style.top = `${particleY}px`;
      elm.style.left = `${particleX}px`;

      if (i === 0) {
          // ===  CSS defines a keyframe animation === 
          elm.addEventListener('animationend', function cleanup() {
              explosion.remove();
              elm.removeEventListener('animationend', cleanup); 
          }, { once: true });
      }
      
      explosion.appendChild(elm);
      isCelebrationAnimationComplete  = true;
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
    comboCount++;
    if (comboCount >= 2 && comboCount <= 6) {
      const comboMessage =
        comboMessages[Math.min(comboCount - 2, comboMessages.length - 1)];
      if (quoteDiv) {
        quoteDiv.textContent = comboMessage;
        quoteDiv.style.color = "#FFD700";
        setTimeout(() => {
          quoteDiv.style.color = "#fff";
        }, 1000);
      }
    }
  } else {
    comboCount = 0;
  }

  lastClickTime = now;
}

// === Unlock audio on first user interaction ===
window.addEventListener(
  "click",
  () => {
    if (!userInteracted) {
      userInteracted = true;
      if (clickSound) {
        clickSound
          .play()
          .then(() => clickSound.pause())
          .catch(() => {});
      }
      if (failSound) {
        failSound
          .play()
          .then(() => failSound.pause())
          .catch(() => {});
      }
      // Start background music if enabled
      if (musicEnabled && currentTrack) {
        playBackgroundMusic(currentTrack);
      }
    }
  },
  { once: true }
);

// === Button Click Handler ===
if (button) {
  button.addEventListener("click", (e) => {
    e.stopPropagation();
    clicks++;
    checkCombo();
    
    // Prevent mouseover from registering a failed click when clicking
    isButtonMoving = true;
    setTimeout(() => {
      isButtonMoving = false;
    }, 300);

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    updateCounter(`— ${randomMessage}`);

    // Change button appearance
    button.style.backgroundColor = getRandomColor();
    const width = getRandomNumber(150, 250);
    const height = getRandomNumber(80, 150);
    button.style.width = `${width}px`;
    button.style.height = `${height}px`;
    
    // Animations
    button.style.transform = "scale(1.2) rotate(10deg)";
    setTimeout(() => {
      button.style.transform = "scale(1) rotate(0deg)";
    }, 150);

    if (!userInteracted) userInteracted = true;

    // Effects
    playSound(clickSound);

    createSmokeTrail();
    showAchievement(clicks);

    if (clicks === 20) {
      quoteDiv.textContent = "✨ 20-CLICK POWER UP! Particles Erupt! ✨";
      burstButtonParticles(); // Power Up 
    } else {
      quoteDiv.textContent = quoteDiv.textContent;
      buttonDisableTeleport(); // Reset 
    }

    // 🎉 Confetti animation at 50 clicks
    if (clicks === 50 && typeof createConfetti === "function") {
      createConfetti();
    }

    // Special effects at milestones
    if (clicks % 50 === 0) {
      document.body.classList.add("page-shake");
      setTimeout(() => document.body.classList.remove("page-shake"), 500);
    }

    // Teleport button
    const { randomX, randomY } = getRandomLocation();
    buttonTeleport(randomX, randomY);

    updateActivityTime();
  });
}


// === Count failed clicks when clicking anywhere but the button ===
document.addEventListener("click", (e) => {
  // Check if the click target is a button or inside a button
  const clickedButton = e.target.closest('button');
  const clickedInput = e.target.closest('input');
  const clickedLabel = e.target.closest('label');
  
  // Only count as failed click if NOT clicking on any interactive element
  if (!clickedButton && !clickedInput && !clickedLabel) {
    failedClicks++;
    
    const messageArray = impossibleMode ? impossibleFailMessages : failedClickMessages;
    const randomFail = messageArray[Math.floor(Math.random() * messageArray.length)];
    updateCounter(`— ${randomFail}`);

    // Play fail sound occasionally
    if (failedClicks % (impossibleMode ? 5 : 10) === 0 && userInteracted) {
      if (failSound) {
        failSound.volume = masterVolume;
        failSound.currentTime = 0;
        failSound.play().catch(() => {});
      }
    }
  }
});

// === Button Dodge / Mouseover ===
if (button) {
  button.addEventListener("mouseover", () => {
    if (isButtonMoving) return;
    const now = Date.now();
    // Throttle dodge more aggressively in impossible mode
    const throttleTime = impossibleMode ? 50 : 150;
    if (now - lastDodgeTime < throttleTime) return;
    lastDodgeTime = now;

    // create some smoke visuals
    createSmokeTrail();

    const dodgeChance = impossibleMode ? 1 : 0.9;
    if (Math.random() < dodgeChance) {
      isButtonMoving = true;

      const rotation = impossibleMode ? getRandomNumber(-15, 15) : 5;
      button.style.transform = `rotate(${rotation}deg)`;
      setTimeout(() => {
        button.style.transform = "rotate(0deg) scale(1)";
        isButtonMoving = false;
      }, 200);
    }
  });
}

// === Impossible mode special mousemove dodge (larger radius reaction) ===
document.addEventListener("mousemove", (e) => {
  if (!button || !impossibleMode) return;
  const rect = button.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const dx = e.clientX - cx;
  const dy = e.clientY - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const dangerZone = 200;
  if (dist < dangerZone) {
    const now = Date.now();
    if (now - lastDodgeTime < 100) return;
    lastDodgeTime = now;
    const { randomX, randomY } = getRandomLocation();
    buttonTeleport(randomX, randomY);
    if (Math.random() > 0.7) {
      button.style.width = `${getRandomNumber(120, 200)}px`;
      button.style.height = `${getRandomNumber(60, 150)}px`;
    }
  }
});

document.addEventListener("contextmenu", () => {
  failedClicks += clicks; // Add all earned clicks to failed count
  clicks = 0;
  updateCounter("💥 SIKE YOU THOUGHT! 💥");
  if (failSound) {
    failSound.currentTime = 0;
    failSound.play().catch(() => {});
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
function formatTime(sec) {
  const mins = Math.floor(sec / 60);
  const secs = sec % 60;
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
}

function updateTimer() {
  seconds++;
  if (timerDiv) {
    timerDiv.textContent = `Time spent doing nothing: ${formatTime(seconds)}`;
    if (seconds % 5 === 0) {
      timerDiv.classList.add("fade");
      setTimeout(() => timerDiv.classList.remove("fade"), 400);
    }
  }
}

// === Theme System ===
const themes = {
  dark: {
    name: 'Dark Purple',
    icon: '🌙',
    bgStart: '#667eea',
    bgEnd: '#764ba2',
    textColor: '#fff',
    cardBg: 'rgba(255, 255, 255, 0.15)',
    accentColor: '#ff6b6b',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    buttonStart: '#ff6b6b',
    buttonEnd: '#ff9a76'
  },
  light: {
    name: 'Light Rose',
    icon: '☀️',
    bgStart: '#fdf2ec',
    bgEnd: '#ffd8d8',
    textColor: '#1f1f1f',
    cardBg: 'rgba(255, 255, 255, 0.95)',
    accentColor: '#ff5a5a',
    borderColor: 'rgba(0, 0, 0, 0.1)',
    buttonStart: '#ff867c',
    buttonEnd: '#ff5a5a'
  },
  neon: {
    name: 'Neon Cyberpunk',
    icon: '⚡',
    bgStart: '#0a0e27',
    bgEnd: '#1a1a2e',
    textColor: '#00ff88',
    cardBg: 'rgba(0, 255, 136, 0.1)',
    accentColor: '#ff006e',
    borderColor: 'rgba(0, 255, 136, 0.3)',
    buttonStart: '#ff006e',
    buttonEnd: '#00d9ff'
  },
  retro: {
    name: 'Retro Sunset',
    icon: '🕹️',
    bgStart: '#ff6b9d',
    bgEnd: '#c94b4b',
    textColor: '#fff5e1',
    cardBg: 'rgba(255, 245, 225, 0.2)',
    accentColor: '#ffc93c',
    borderColor: 'rgba(255, 245, 225, 0.4)',
    buttonStart: '#ffc93c',
    buttonEnd: '#ff6b9d'
  },
  pastel: {
    name: 'Pastel Dreams',
    icon: '🦄',
    bgStart: '#ffcce7',
    bgEnd: '#d5f5e3',
    textColor: '#5d5d5d',
    cardBg: 'rgba(255, 255, 255, 0.8)',
    accentColor: '#ff8fa3',
    borderColor: 'rgba(93, 93, 93, 0.2)',
    buttonStart: '#ffb3c6',
    buttonEnd: '#ff8fa3'
  },
  solarized: {
    name: 'Solarized Dark',
    icon: '🌅',
    bgStart: '#002b36',
    bgEnd: '#073642',
    textColor: '#839496',
    cardBg: 'rgba(0, 43, 54, 0.8)',
    accentColor: '#268bd2',
    borderColor: 'rgba(131, 148, 150, 0.3)',
    buttonStart: '#268bd2',
    buttonEnd: '#2aa198'
  },
  ocean: {
    name: 'Deep Ocean',
    icon: '🌊',
    bgStart: '#004e92',
    bgEnd: '#000428',
    textColor: '#e0f7fa',
    cardBg: 'rgba(224, 247, 250, 0.15)',
    accentColor: '#00bcd4',
    borderColor: 'rgba(224, 247, 250, 0.3)',
    buttonStart: '#00bcd4',
    buttonEnd: '#00acc1'
  },
  forest: {
    name: 'Forest Grove',
    icon: '🌲',
    bgStart: '#134e4a',
    bgEnd: '#064e3b',
    textColor: '#d1fae5',
    cardBg: 'rgba(209, 250, 229, 0.15)',
    accentColor: '#34d399',
    borderColor: 'rgba(209, 250, 229, 0.3)',
    buttonStart: '#34d399',
    buttonEnd: '#10b981'
  },
  sunset: {
    name: 'Warm Sunset',
    icon: '🌇',
    bgStart: '#ff7e5f',
    bgEnd: '#feb47b',
    textColor: '#3d1f00',
    cardBg: 'rgba(255, 255, 255, 0.3)',
    accentColor: '#ff6b35',
    borderColor: 'rgba(61, 31, 0, 0.2)',
    buttonStart: '#ff6b35',
    buttonEnd: '#f7931e'
  },
  midnight: {
    name: 'Midnight Blue',
    icon: '🌃',
    bgStart: '#2c3e50',
    bgEnd: '#000000',
    textColor: '#ecf0f1',
    cardBg: 'rgba(236, 240, 241, 0.1)',
    accentColor: '#e74c3c',
    borderColor: 'rgba(236, 240, 241, 0.3)',
    buttonStart: '#e74c3c',
    buttonEnd: '#c0392b'
  }
};

let currentTheme = localStorage.getItem('currentTheme') || 'dark';
const themeKeys = Object.keys(themes);

// Theme Selector Elements
const themeSelector = document.getElementById('theme-selector');
const closeThemeSelector = document.getElementById('close-theme-selector');
const themeTabs = document.querySelectorAll('.theme-tab');
const themeTabContents = document.querySelectorAll('.theme-tab-content');
const themesGrid = document.getElementById('themes-grid');

// Custom Theme Elements
const customBgStart = document.getElementById('custom-bg-start');
const customBgStartText = document.getElementById('custom-bg-start-text');
const customBgEnd = document.getElementById('custom-bg-end');
const customBgEndText = document.getElementById('custom-bg-end-text');
const customTextColor = document.getElementById('custom-text-color');
const customTextColorText = document.getElementById('custom-text-color-text');
const customAccentColor = document.getElementById('custom-accent-color');
const customAccentColorText = document.getElementById('custom-accent-color-text');
const customButtonStart = document.getElementById('custom-button-start');
const customButtonStartText = document.getElementById('custom-button-start-text');
const customButtonEnd = document.getElementById('custom-button-end');
const customButtonEndText = document.getElementById('custom-button-end-text');
const customFontFamily = document.getElementById('custom-font-family');
const previewCustomTheme = document.getElementById('preview-custom-theme');
const saveCustomTheme = document.getElementById('save-custom-theme');
const resetCustomTheme = document.getElementById('reset-custom-theme');

// Apply theme to the page
function applyTheme(themeName) {
  const theme = themes[themeName];
  if (!theme) return;

  document.body.dataset.theme = themeName;
  
  // Apply CSS variables
  document.documentElement.style.setProperty('--bg-start', theme.bgStart);
  document.documentElement.style.setProperty('--bg-end', theme.bgEnd);
  document.documentElement.style.setProperty('--text-color', theme.textColor);
  document.documentElement.style.setProperty('--card-bg', theme.cardBg);
  document.documentElement.style.setProperty('--accent-color', theme.accentColor);
  document.documentElement.style.setProperty('--border-color', theme.borderColor);
  document.documentElement.style.setProperty('--button-gradient-start', theme.buttonStart);
  document.documentElement.style.setProperty('--button-gradient-end', theme.buttonEnd);
  
  // Apply font family if custom theme has it
  if (theme.fontFamily) {
    document.body.style.fontFamily = theme.fontFamily;
  } else {
    document.body.style.fontFamily = "'Poppins', sans-serif";
  }
  
  currentTheme = themeName;
  localStorage.setItem('currentTheme', themeName);
  
  updateThemeCards();
}

// Generate theme cards
function generateThemeCards() {
  if (!themesGrid) return;
  
  themesGrid.innerHTML = '';
  
  Object.keys(themes).forEach(themeKey => {
    const theme = themes[themeKey];
    const card = document.createElement('div');
    card.className = 'theme-card';
    if (themeKey === currentTheme) {
      card.classList.add('active');
    }
    
    // Set background gradient for preview
    card.style.background = `linear-gradient(135deg, ${theme.bgStart}, ${theme.bgEnd})`;
    card.style.color = theme.textColor;
    
    card.innerHTML = `
      <h3>${theme.icon} ${theme.name}</h3>
      <div class="theme-preview">
        <div class="theme-color-dot" style="background: ${theme.bgStart}"></div>
        <div class="theme-color-dot" style="background: ${theme.bgEnd}"></div>
        <div class="theme-color-dot" style="background: ${theme.buttonStart}"></div>
        <div class="theme-color-dot" style="background: ${theme.accentColor}"></div>
      </div>
    `;
    
    card.addEventListener('click', () => {
      applyTheme(themeKey);
      if (quoteDiv) {
        quoteDiv.textContent = `✨ ${theme.name} theme activated!`;
      }
    });
    
    themesGrid.appendChild(card);
  });
}

// Update active theme card
function updateThemeCards() {
  const cards = themesGrid.querySelectorAll('.theme-card');
  cards.forEach((card, index) => {
    if (themeKeys[index] === currentTheme) {
      card.classList.add('active');
    } else {
      card.classList.remove('active');
    }
  });
}

// Theme toggle button - cycles through themes
if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const currentIndex = themeKeys.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themeKeys.length;
    const nextTheme = themeKeys[nextIndex];
    
    applyTheme(nextTheme);
    
    if (quoteDiv) {
      quoteDiv.textContent = `${themes[nextTheme].icon} Switched to ${themes[nextTheme].name}!`;
    }
  });
}

// Open theme selector (double click on theme toggle or right click)
if (themeToggle) {
  themeToggle.addEventListener('dblclick', (e) => {
    e.preventDefault();
    themeSelector.classList.add('show');
    generateThemeCards();
  });
  
  themeToggle.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    themeSelector.classList.add('show');
    generateThemeCards();
  });
}

// Close theme selector
if (closeThemeSelector) {
  closeThemeSelector.addEventListener('click', () => {
    themeSelector.classList.remove('show');
  });
}

// Close when clicking outside
if (themeSelector) {
  themeSelector.addEventListener('click', (e) => {
    if (e.target === themeSelector) {
      themeSelector.classList.remove('show');
    }
  });
}

// Theme tabs switching
themeTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const targetTab = tab.dataset.tab;
    
    // Update active tab
    themeTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    
    // Update active content
    themeTabContents.forEach(content => {
      if (content.id === `${targetTab}-tab`) {
        content.classList.add('active');
      } else {
        content.classList.remove('active');
      }
    });
  });
});

// Custom Theme Creator - Sync color pickers with text inputs
function syncColorInputs(colorInput, textInput) {
  colorInput.addEventListener('input', () => {
    textInput.value = colorInput.value;
  });
  
  textInput.addEventListener('input', () => {
    if (/^#[0-9A-F]{6}$/i.test(textInput.value)) {
      colorInput.value = textInput.value;
    }
  });
}

syncColorInputs(customBgStart, customBgStartText);
syncColorInputs(customBgEnd, customBgEndText);
syncColorInputs(customTextColor, customTextColorText);
syncColorInputs(customAccentColor, customAccentColorText);
syncColorInputs(customButtonStart, customButtonStartText);
syncColorInputs(customButtonEnd, customButtonEndText);

// Preview custom theme
if (previewCustomTheme) {
  previewCustomTheme.addEventListener('click', () => {
    const customTheme = {
      name: 'Custom',
      icon: '🎨',
      bgStart: customBgStart.value,
      bgEnd: customBgEnd.value,
      textColor: customTextColor.value,
      cardBg: `${hexToRgba(customTextColor.value, 0.15)}`,
      accentColor: customAccentColor.value,
      borderColor: `${hexToRgba(customTextColor.value, 0.3)}`,
      buttonStart: customButtonStart.value,
      buttonEnd: customButtonEnd.value,
      fontFamily: customFontFamily.value
    };
    
    // Temporarily apply custom theme
    document.documentElement.style.setProperty('--bg-start', customTheme.bgStart);
    document.documentElement.style.setProperty('--bg-end', customTheme.bgEnd);
    document.documentElement.style.setProperty('--text-color', customTheme.textColor);
    document.documentElement.style.setProperty('--card-bg', customTheme.cardBg);
    document.documentElement.style.setProperty('--accent-color', customTheme.accentColor);
    document.documentElement.style.setProperty('--border-color', customTheme.borderColor);
    document.documentElement.style.setProperty('--button-gradient-start', customTheme.buttonStart);
    document.documentElement.style.setProperty('--button-gradient-end', customTheme.buttonEnd);
    document.body.style.fontFamily = customTheme.fontFamily;
    
    if (quoteDiv) {
      quoteDiv.textContent = '👁️ Previewing your custom theme!';
    }
  });
}

// Save custom theme
if (saveCustomTheme) {
  saveCustomTheme.addEventListener('click', () => {
    const customTheme = {
      name: 'My Custom Theme',
      icon: '🎨',
      bgStart: customBgStart.value,
      bgEnd: customBgEnd.value,
      textColor: customTextColor.value,
      cardBg: `${hexToRgba(customTextColor.value, 0.15)}`,
      accentColor: customAccentColor.value,
      borderColor: `${hexToRgba(customTextColor.value, 0.3)}`,
      buttonStart: customButtonStart.value,
      buttonEnd: customButtonEnd.value,
      fontFamily: customFontFamily.value
    };
    
    // Add to themes
    themes.custom = customTheme;
    if (!themeKeys.includes('custom')) {
      themeKeys.push('custom');
    }
    
    // Save to localStorage
    localStorage.setItem('customTheme', JSON.stringify(customTheme));
    
    // Apply theme
    applyTheme('custom');
    
    // Regenerate theme cards
    generateThemeCards();
    
    if (quoteDiv) {
      quoteDiv.textContent = '💾 Custom theme saved successfully!';
    }
    
    // Close selector
    setTimeout(() => {
      themeSelector.classList.remove('show');
    }, 1500);
  });
}

// Reset custom theme
if (resetCustomTheme) {
  resetCustomTheme.addEventListener('click', () => {
    customBgStart.value = customBgStartText.value = '#667eea';
    customBgEnd.value = customBgEndText.value = '#764ba2';
    customTextColor.value = customTextColorText.value = '#ffffff';
    customAccentColor.value = customAccentColorText.value = '#ff6b6b';
    customButtonStart.value = customButtonStartText.value = '#ff6b6b';
    customButtonEnd.value = customButtonEndText.value = '#ff9a76';
    customFontFamily.value = "'Poppins', sans-serif";
    
    if (quoteDiv) {
      quoteDiv.textContent = '🔄 Custom theme reset to defaults!';
    }
  });
}

// Helper function to convert hex to rgba
function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Load custom theme from localStorage if exists
function loadCustomTheme() {
  const savedCustomTheme = localStorage.getItem('customTheme');
  if (savedCustomTheme) {
    try {
      const customTheme = JSON.parse(savedCustomTheme);
      themes.custom = customTheme;
      if (!themeKeys.includes('custom')) {
        themeKeys.push('custom');
      }
      // Update custom theme form if saved theme exists
      if (customFontFamily && customTheme.fontFamily) {
        customFontFamily.value = customTheme.fontFamily;
      }
    } catch (e) {
      console.error('Failed to load custom theme:', e);
    }
  }
}

// Initialize themes
loadCustomTheme();
applyTheme(currentTheme);

// === Impossible Mode Toggle ===
if (impossibleToggle) {
  impossibleToggle.addEventListener("change", () => {
    impossibleMode = impossibleToggle.checked;
    if (impossibleMode) {
      if (button) button.classList.add("impossible-mode");
      updateCounter("— 🔥 IMPOSSIBLE MODE ACTIVATED! Good luck clicking now! 🔥");
    } else {
      if (button) button.classList.remove("impossible-mode");
      updateCounter("— Normal mode restored. (Boring!)");
    }
  });
}

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
  if (!popupContainer) return;
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
  if (!popupContainer) return;
  popupContainer.classList.remove("show");
  popupActive = false;

  if (popupAutoCloseTimer) {
    clearTimeout(popupAutoCloseTimer);
  }

  // Reset the activity timer
  updateActivityTime();
}

// Function to randomize button position within the popup (keeps button inside container)
function randomizeButtonPosition(buttonEl, containerWidth, containerHeight) {
  const buttonWidth = buttonEl.offsetWidth;
  const buttonHeight = buttonEl.offsetHeight;

  const maxX = Math.max(0, containerWidth - buttonWidth);
  const maxY = Math.max(0, containerHeight - buttonHeight);

  const randomX = Math.random() * maxX;
  const randomY = Math.random() * maxY;

  buttonEl.style.position = "absolute";
  buttonEl.style.left = `${randomX}px`;
  buttonEl.style.top = `${randomY}px`;
  buttonEl.style.transform = "none";
}

// Event listeners for popup buttons (if they exist)
if (popupYesButton) {
  popupYesButton.addEventListener("mouseover", () => {
    const container = popupYesButton.closest(".popup-buttons");
    if (container) {
      randomizeButtonPosition(
        popupYesButton,
        container.offsetWidth,
        container.offsetHeight
      );
    }
  });

  popupYesButton.addEventListener("click", () => {
    hidePopup();
    playSound(clickSound);
  });
}

if (popupNoButton) {
  popupNoButton.addEventListener("mouseover", () => {
    const container = popupNoButton.closest(".popup-buttons");
    if (container) {
      randomizeButtonPosition(
        popupNoButton,
        container.offsetWidth,
        container.offsetHeight
      );
    }
  });

  popupNoButton.addEventListener("click", () => {
    hidePopup();
    playSound(clickSound);
  });
}

// Track all user interactions to reset the inactivity timer
["click", "mousemove", "keydown"].forEach((eventType) => {
  document.addEventListener(eventType, updateActivityTime);
});

// Initialize on load
window.addEventListener("load", () => {
  // Timer tick every second
  setInterval(updateTimer, 1000);

  if (quoteDiv) {
    quoteDiv.textContent = "Click the button to begin your pointless journey! 🚀";
  }

  // start the inactivity timer
  updateActivityTime();

  // initial background
  changeBackgroundColor();
});

// === Sound Settings System ===
function playBackgroundMusic(trackName) {
  if (!musicEnabled || !trackName || !tracks[trackName]) {
    bgMusic.pause();
    return;
  }
  
  bgMusic.src = tracks[trackName];
  bgMusic.volume = masterVolume * 0.7;
  bgMusic.play().catch(() => {});
}

function updateSoundSettings() {
  localStorage.setItem('soundsEnabled', soundsEnabled);
  localStorage.setItem('musicEnabled', musicEnabled);
  localStorage.setItem('masterVolume', masterVolume);
  localStorage.setItem('currentTrack', currentTrack);
  
  if (clickSound) clickSound.volume = masterVolume;
  if (failSound) failSound.volume = masterVolume;
  if (bgMusic) bgMusic.volume = masterVolume * 0.7;
}

function updateMusicPlayback() {
  playBackgroundMusic(currentTrack);
}

function initSoundSettings() {
  soundsToggle.checked = soundsEnabled;
  musicToggle.checked = musicEnabled;
  volumeSlider.value = masterVolume * 100;
  trackSelector.value = currentTrack;
  
  updateSoundSettings();
  updateMusicPlayback();
}

// Sound panel toggle
soundToggle.addEventListener('click', () => {
  soundPanel.classList.add('show');
});

closeSoundPanel.addEventListener('click', () => {
  soundPanel.classList.remove('show');
});

// Close sound panel when clicking outside
soundPanel.addEventListener('click', (e) => {
  if (e.target === soundPanel) {
    soundPanel.classList.remove('show');
  }
});

// Sound controls
soundsToggle.addEventListener('change', () => {
  soundsEnabled = soundsToggle.checked;
  updateSoundSettings();
});

musicToggle.addEventListener('change', () => {
  musicEnabled = musicToggle.checked;
  updateSoundSettings();
  updateMusicPlayback();
});

volumeSlider.addEventListener('input', () => {
  masterVolume = volumeSlider.value / 100;
  updateSoundSettings();
});

trackSelector.addEventListener('change', () => {
  currentTrack = trackSelector.value;
  updateSoundSettings();
  updateMusicPlayback();
});

// Initialize on load
window.addEventListener('load', () => {
  initSoundSettings();
});
