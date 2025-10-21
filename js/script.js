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

    if (!userInteracted) userInteracted = true;

    // Effects
    playSound(clickSound);
    createParticles(e.clientX, e.clientY, 30, true);
    createSmokeTrail();
    showAchievement(clicks);

    // 🎉 Confetti animation at 50 clicks
    if (clicks === 50 && typeof createConfetti === "function") {
      createConfetti();
    }

    // Special effects at milestones
    if (clicks % 50 === 0) {
      document.body.classList.add("page-shake");
      setTimeout(() => document.body.classList.remove("page-shake"), 500);
    }

    updateActivityTime();
  });
}


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
      failedClicks++;

      const messageArray = impossibleMode ? impossibleFailMessages : failedClickMessages;
      const randomFail = messageArray[Math.floor(Math.random() * messageArray.length)];
      updateCounter(`— ${randomFail}`);

      // Play fail sound occasionally
      if (failedClicks % (impossibleMode ? 5 : 10) === 0 && userInteracted) {
        if (failSound) {
          failSound.currentTime = 0;
          failSound.play().catch(() => {});
        }
      }

      const { randomX, randomY } = getRandomLocation();
      buttonTeleport(randomX, randomY);

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

// === Theme toggle ===
if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const current = document.body.dataset.theme;
    const newTheme = current === "light" ? "dark" : "light";
    document.body.dataset.theme = newTheme;
    if (quoteDiv) {
      quoteDiv.textContent =
        newTheme === "light" ? "Welcome to the light. It won’t help." : "Back to the void.";
    }
  });
}

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
