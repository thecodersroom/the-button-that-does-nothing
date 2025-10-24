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
const darkLightToggle = document.getElementById("dark-light-toggle");

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

// === MERGED: Added High Score and Share Button Elements from main ===
const highScoreDisplay = document.getElementById('high-score');
const shareButton = document.getElementById('share-button');
// === END MERGE ===

// State
// --- MERGED: Keep game reset from fix/game-bugs, add high score from main ---
let clicks = 0;
let failedClicks = 0;
let highScore = Number(localStorage.getItem('nothingHighScore')) || 0; // High score still saved
// --- END MERGE ---

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
let isCelebrationAnimationComplete = false; // Kept from fix/game-bugs

// Sound Settings
let soundsEnabled = localStorage.getItem('soundsEnabled') !== 'false';
let musicEnabled = localStorage.getItem('musicEnabled') !== 'false';
let masterVolume = parseFloat(localStorage.getItem('masterVolume')) || 1.0;
let currentTrack = '8bit'; // Reset track on load

// MODIFIED: Re-ordered the tracks so '8bit' is the default (index 0)
const tracks = {
  '8bit': 'audio/8-bit.mp3',   // Default (0 clicks)
  'lofi': 'audio/lo-fi.mp3', // Unlocks at 100
  'boss': 'audio/boss.mp3',   // Unlocks at 200
  'suspense': 'audio/suspense.mp3', // Unlocks at 300
  'horror': 'audio/horror.mp3'  // Unlocks at 400
};

// Defined allTrackKeys globally
const allTrackKeys = Object.keys(tracks);

// Will be populated by loadUnlockedTracks()
let unlockedTracks = [];

// Canvas setup
if (canvas) {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  window.addEventListener("resize", () => {
    if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
  });
}

// Action Prompts with Categories and Rarity
const actions = [
 // Physical (Common: 10)
{ text: "Do 20 jumping jacks.", category: "Physical", rarity: 10 },
{ text: "Hold a wall sit for 30 seconds.", category: "Physical", rarity: 10 },
{ text: "Do 10 lunges on each leg.", category: "Physical", rarity: 10 },
{ text: "Roll your shoulders forward and backward for 1 minute.", category: "Physical", rarity: 10 },
{ text: "Touch your toes slowly 10 times.", category: "Physical", rarity: 10 },
{ text: "Do 15 calf raises.", category: "Physical", rarity: 10 },
{ text: "Walk up and down the stairs for 2 minutes.", category: "Physical", rarity: 10 },
{ text: "Swing your arms in big circles for 1 minute.", category: "Physical", rarity: 10 },
{ text: "Do 10 side bends on each side.", category: "Physical", rarity: 10 },
{ text: "Lie down and do 10 gentle leg lifts.", category: "Physical", rarity: 10 },

// Mindful (Common: 10)
{ text: "Notice 3 sounds you’ve never paid attention to before.", category: "Mindful", rarity: 10 },
{ text: "Close your eyes and feel the texture of an object near you.", category: "Mindful", rarity: 10 },
{ text: "Take 3 slow, deep breaths and focus on the rise and fall of your chest.", category: "Mindful", rarity: 10 },
{ text: "Observe one cloud or tree for 2 minutes, noting details.", category: "Mindful", rarity: 10 },
{ text: "Spend a minute noticing the temperature of the air on your skin.", category: "Mindful", rarity: 10 },
{ text: "Slowly eat a piece of fruit or snack, noticing flavor and texture.", category: "Mindful", rarity: 10 },
{ text: "Trace the outline of an object with your eyes slowly, noticing details.", category: "Mindful", rarity: 10 },
{ text: "Sit quietly for 1 minute, focusing only on your breath.", category: "Mindful", rarity: 10 },
{ text: "Notice your posture and gently adjust to feel comfortable.", category: "Mindful", rarity: 10 },
{ text: "Pay attention to your heartbeat for one minute, noticing rhythm and pace.", category: "Mindful", rarity: 10 },
// Social (Uncommon: 5)
{ text: "Send a positive message to a colleague or classmate.", category: "Social", rarity: 5 },
{ text: "Invite a friend to share a short walk or coffee.", category: "Social", rarity: 5 },
{ text: "Call or text someone just to say 'hi' without an agenda.", category: "Social", rarity: 5 },
{ text: "Write down a compliment about someone you know and send it to them.", category: "Social", rarity: 5 },
{ text: "Share a helpful tip or resource with someone who might need it.", category: "Social", rarity: 5 },
{ text: "Reach out to someone you haven’t spoken to in a while.", category: "Social", rarity: 5 },
{ text: "Ask a friend about a goal they’re working on and encourage them.", category: "Social", rarity: 5 },
{ text: "Leave a kind note or message for someone you see regularly.", category: "Social", rarity: 5 },
{ text: "Offer help to someone today, even if small.", category: "Social", rarity: 5 },
{ text: "Share a happy memory with a loved one.", category: "Social", rarity: 5 },

// Purposeful (Uncommon: 5)
{ text: "Set a timer for 5 minutes and declutter one small space.", category: "Purposeful", rarity: 5 },
{ text: "Write down one thing you want to accomplish before the day ends.", category: "Purposeful", rarity: 5 },
{ text: "Plan one small act of kindness you can do tomorrow.", category: "Purposeful", rarity: 5 },
{ text: "Review your schedule and prioritize the most important task.", category: "Purposeful", rarity: 5 },
{ text: "Write a short note about your long-term goal progress.", category: "Purposeful", rarity: 5 },
{ text: "Organize one folder or section on your computer or phone.", category: "Purposeful", rarity: 5 },
{ text: "Reflect on your top 3 priorities today.", category: "Purposeful", rarity: 5 },
{ text: "Make a small plan to finish an unfinished task.", category: "Purposeful", rarity: 5 },
{ text: "Write down one thing that would make tomorrow better.", category: "Purposeful", rarity: 5 },
{ text: "Set a mini-challenge for yourself to complete in 10 minutes.", category: "Purposeful", rarity: 5 },


// Growth (Rare: 2)
{ text: "Write down one thing you learned today.", category: "Growth", rarity: 2 },
{ text: "Listen to a 3-minute educational podcast or video on a topic you’re curious about.", category: "Growth", rarity: 2 },
{ text: "Try a quick brain teaser or logic puzzle.", category: "Growth", rarity: 2 },
{ text: "Learn a short phrase in a new language.", category: "Growth", rarity: 2 },
{ text: "Read an interesting article headline and summarize it in one sentence.", category: "Growth", rarity: 2 },
{ text: "Research a famous person who inspires you and note one key lesson from them.", category: "Growth", rarity: 2 },
{ text: "Write down one skill you’d like to improve and a small first step.", category: "Growth", rarity: 2 },
{ text: "Try a new creative activity for 5 minutes (drawing, writing, music).", category: "Growth", rarity: 2 },
{ text: "Find and memorize one inspiring quote.", category: "Growth", rarity: 2 },
{ text: "Think of a problem you faced recently and brainstorm one alternative solution.", category: "Growth", rarity: 2 },
{ text: "Watch a short tutorial on something practical (e.g., cooking, tech tip, exercise).", category: "Growth", rarity: 2 },
{ text: "Read a random page from a book you’ve never read before.", category: "Growth", rarity: 2 },


// Special (Super Rare: 1)
{ text: "Take a moment to write a note of encouragement to your future self.", category: "Growth", rarity: 1 },
{ text: "Stand up, stretch, and silently say 'I am proud of myself' three times.", category: "Growth", rarity: 1 },
{ text: "Treat yourself to a small indulgence mindfully (like a favorite snack or drink).", category: "Growth", rarity: 1 },
{ text: "Reflect on one recent accomplishment and celebrate it in writing.", category: "Growth", rarity: 1 },
{ text: "Spend 2 minutes imagining your ideal day and savor the feeling.", category: "Growth", rarity: 1 },
{ text: "Close your eyes and think of someone who makes your life better; send them gratitude silently.", category: "Growth", rarity: 1 },
{ text: "Give yourself a mini award for completing a recent task—say it out loud.", category: "Growth", rarity: 1 },
{ text: "Draw or doodle something that represents how you feel right now.", category: "Growth", rarity: 1 },
{ text: "Write down one quality about yourself that you admire.", category: "Growth", rarity: 1 },
{ text: "Take a mindful pause and truly notice one beautiful thing in your surroundings.", category: "Growth", rarity: 1 },
];

const messages = [
  "Nice click!", "You did it!", "Another one!", "Keep going!", "Fantastic!",
  "Amazing work!", "You're on fire! 🔥", "Incredible!", "Spectacular!", "Magnificent!",
];

const failedClickMessages = [
  "Choppy fingers. 🍗", "My mom's sandal clicks more precise. 👡", "You're a failing legend. 💀",
  "Even the cursor gave up on you. 🖱️", "You've achieved the rare 'Click Miss Combo'. 🎪",
  "Pathetic reflexes — admirable persistence. 🐌", "Your aim is as good as a stormtrooper's. 🎯",
  "Button: 1, You: 0 😂",
];

const impossibleFailMessages = [
  "Did you really think it would be that easy?", "IMPOSSIBLE MODE activated! Good luck! 😈",
  "The button is now sentient and afraid of you.", "Physics don't apply here anymore.",
  "You're fighting a losing battle, friend.", "The button has evolved beyond your reach.",
  "Welcome to the nightmare dimension.", "This is what peak performance looks like.",
];

const comboMessages = [
  "🔥 COMBO x2! You're on fire!", "⚡ COMBO x3! Lightning speed!", "💫 COMBO x4! Unstoppable!",
  "🌟 COMBO x5! LEGENDARY!", "👑 MEGA COMBO! You're the chosen one!",
];

// Achievements
const achievements = {
  10: { icon: "🥉", text: "Novice Nothing-Doer — 10 clicks! You've officially wasted your first minute productively doing nothing!" },
  25: { icon: "🧤", text: "Casual Clicker — 25 clicks! You’re getting suspiciously good at being unproductive." },
  50: { icon: "🥈", text: "Master of Useless Clicking — 50 clicks! Your dedication to pointlessness is unmatched!" },
  100: { icon: "🥇", text: "Legendary Button Slayer — 100 clicks! The button now fears your existence." },
  200: { icon: "🚀", text: "Galactic Click Commander — 200 clicks! You've officially left the orbit of sanity." },
  500: { icon: "👑", text: "Click Royalty — 500 clicks! Bow down to the Emperor of Empty Effort!" },
  1000: { icon: "🏆", text: "Ultimate Button God — 1000 clicks! You’ve ascended beyond purpose, beyond reason, beyond… everything." },
};

// Utils
function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Returns location values:
 * - left/top are relative to button.parentNode (suitable for style.left/top)
 */
function getRandomLocation() {
  const padding = 20;
  const btnWidth = button ? button.offsetWidth : 100;
  const btnHeight = button ? button.offsetHeight : 50;
  const maxX = window.innerWidth - btnWidth - padding;
  const maxY = window.innerHeight - btnHeight - padding;
  const minX = padding;
  const minY = padding;

  const randomXAbs = Math.floor(Math.random() * (maxX - minX + 1)) + minX;
  const randomYAbs = Math.floor(Math.random() * (maxY - minY + 1)) + minY;

  const parentNodeRect = button?.parentNode?.getBoundingClientRect() || { left: 0, top: 0 };
  const left = randomXAbs - parentNodeRect.left;
  const top = randomYAbs - parentNodeRect.top;

  return { left, top };
}

function buttonTeleport(posX, posY) {
  if (!button) return;
  button.style.position = "absolute";
  button.style.left = `${posX}px`;
  button.style.top = `${posY}px`;
  button.style.transition = "all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)";
}

// Initialize modern card-based counter
function initializeCounter() {
  if (!counterDiv) return;
  const totalInitial = clicks + failedClicks;
  const initialAccuracy = totalInitial > 0 ? Math.round((clicks / totalInitial) * 100) : 100;
  counterDiv.innerHTML = `
    <div class="stat-card">
      <span class="stat-icon">👆</span>
      <div class="stat-value" id="clicks-value">${clicks}</div> <div class="stat-label">Total Clicks</div>
    </div>
    <div class="stat-card">
      <span class="stat-icon">❌</span>
      <div class="stat-value" id="failed-value">${failedClicks}</div> <div class="stat-label">Failed Clicks</div>
    </div>
    <div class="stat-card">
      <span class="stat-icon">🎯</span>
      <div class="stat-value" id="accuracy-value">${initialAccuracy}%</div> <div class="stat-label">Accuracy</div>
    </div>
  `;
}

function animateNumber(element, newValue) {
  if (!element) return;
  const current = parseInt(element.textContent) || 0;
  const diff = newValue - current;
  if (diff === 0) return;
  const duration = 300;
  const steps = 15;
  const increment = diff / steps;
  let step = 0;
  const timer = setInterval(() => {
    step++;
    const value = Math.round(current + (increment * step));
    element.textContent = value;
    if (step >= steps) {
      clearInterval(timer);
      element.textContent = newValue;
    }
  }, duration / steps);
}

function updateCounter(extraText = "") {
  const clicksEl = document.getElementById('clicks-value');
  const failedEl = document.getElementById('failed-value');
  const accuracyEl = document.getElementById('accuracy-value');
  if (clicksEl) animateNumber(clicksEl, clicks);
  if (failedEl) animateNumber(failedEl, failedClicks);
  if (accuracyEl) {
    const total = clicks + failedClicks;
    const accuracy = total > 0 ? Math.round((clicks / total) * 100) : 100;
    accuracyEl.textContent = `${accuracy}%`;
  }
  if (extraText && quoteDiv) {
    quoteDiv.textContent = extraText;
    quoteDiv.style.animation = "none";
    setTimeout(() => {
      if(quoteDiv) quoteDiv.style.animation = "fadeIn 0.5s ease-in forwards";
    }, 10);
  }
}

// Add ripple effect to button
function addRippleEffect(event) {
  if (!button) return;
  button.classList.add('ripple');
  setTimeout(() => {
    button.classList.remove('ripple');
  }, 600);
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
    this.x = x; this.y = y;
    this.size = Math.random() * 5 + 2;
    this.speedX = (Math.random() - 0.5) * 10;
    this.speedY = (Math.random() - 0.5) * 10;
    this.color = isSuccess ? `hsl(${Math.random() * 60 + 120}, 100%, 60%)` : `hsl(${Math.random() * 30}, 100%, 60%)`;
    this.life = 100;
  }
  update() {
    this.x += this.speedX; this.y += this.speedY;
    this.speedY += 0.2; this.life -= 2;
  }
  draw() {
    if (!ctx) return;
    ctx.fillStyle = this.color; ctx.globalAlpha = Math.max(this.life / 100, 0);
    ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  }
}
function createParticles(x, y, count = 20, isSuccess = true) {
  for (let i = 0; i < count; i++) particles.push(new Particle(x, y, isSuccess));
}
function animateParticles() {
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update(); particles[i].draw();
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
    confetti.style.backgroundColor = getRandomColor(); // Re-using getRandomColor util
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
    particle.classList.add("particle"); // Ensure CSS targets .particle
    const rect = button.getBoundingClientRect();
    const offsetX = (Math.random() - 0.5) * rect.width;
    const offsetY = (Math.random() - 0.5) * rect.height;
    particle.style.left = `${rect.left + rect.width / 2 + offsetX + window.scrollX}px`;
    particle.style.top = `${rect.top + rect.height / 2 + offsetY + window.scrollY}px`;
    particle.style.background = getRandomColor(); // Re-using getRandomColor util
    document.body.appendChild(particle);
    setTimeout(() => particle.remove(), 1000);
  }
}

// === Disable Teleport Method ===
function buttonDisableTeleport() {
  if (!button) return;
  button.style.transition = "none";
  button.style.position = "relative";
  button.style.left = "";
  button.style.top = "";
}

// === Rand Utility ===
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// === Burst Method ===
function explode(x, y) {
  const particles = 150; // Reduced particle count for performance
  const explosion = document.createElement('div');
  explosion.classList.add('explosion');
  document.body.appendChild(explosion);
  explosion.style.position = 'fixed'; // Use fixed for viewport positioning
  explosion.style.left = `${x}px`;
  explosion.style.top = `${y}px`;
  explosion.style.transform = 'translate(-50%, -50%)'; // Center it
  explosion.style.pointerEvents = 'none'; // Prevent interaction
  explosion.style.zIndex = '9999'; // Ensure it's on top

  for (let i = 0; i < particles; i++) {
      const distance = rand(50, 250); // Adjusted range
      const angle = (i / particles) * 360; // Spread evenly
      const radians = angle * (Math.PI / 180);
      const particleX = distance * Math.cos(radians);
      const particleY = distance * Math.sin(radians);
      const r = rand(50, 255); const g = rand(50, 255); const b = rand(50, 255);
      const color = `rgb(${r}, ${g}, ${b})`;
      const elm = document.createElement('div');
      elm.classList.add('particle-burst');
      elm.style.backgroundColor = color;
      elm.style.top = `${particleY}px`;
      elm.style.left = `${particleX}px`;
      if (i === 0) {
          elm.addEventListener('animationend', function cleanup() {
              explosion.remove();
              isCelebrationAnimationComplete = true; // Set flag *after* animation
          }, { once: true });
      }
      explosion.appendChild(elm);
  }
}

// === MERGED: Added Mini-Event Functions from main ===
function flipScreen() {
    document.body.classList.add('flipped');
    if (quoteDiv) quoteDiv.textContent = "😵 Whoa! The screen just flipped for 5 seconds!";
    setTimeout(() => {
        document.body.classList.remove('flipped');
        if (quoteDiv?.textContent.includes("flipped")) getNewAction();
    }, 5000);
}

function cloneButton() {
    if (!button) return;
    const clone = button.cloneNode(true);
    clone.classList.add("button-clone");
    const rect = button.getBoundingClientRect();
    clone.style.left = rect.left + Math.random() * 50 - 25 + window.scrollX + "px";
    clone.style.top = rect.top + Math.random() * 50 - 25 + window.scrollY + "px";
    const scale = Math.random() * 0.5 + 0.8;
    const rotation = 0;
    clone.style.transform = `scale(${scale}) rotate(${rotation}deg)`;
    document.body.appendChild(clone);
    setTimeout(() => clone.remove(), 3000);
}

function emojiRain() {
    const emojis = ['✨', '🔥', '🥳', '🙃', '😂', '💖', '⭐']; 
    if (quoteDiv) quoteDiv.textContent = "🎊 EMOJI PARTY! Enjoy the pointless rain!";
    for (let i = 0; i < 60; i++) {
        const emoji = document.createElement('span');
        emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        emoji.classList.add('falling-emoji');
        emoji.style.left = Math.random() * 100 + 'vw';
        emoji.style.animationDelay = (Math.random() * -5) + 's';
        emoji.style.animationDuration = (Math.random() * 4 + 4) + 's';
        document.body.appendChild(emoji);
        setTimeout(() => emoji.remove(), 8500);
    }
    setTimeout(() => {
        if (quoteDiv?.textContent.includes("EMOJI PARTY")) getNewAction();
    }, 5000);
}

function timeFreeze() {
    if (quoteDiv) quoteDiv.textContent = "❄️ TIME FREEZE! The button is stuck for 3 seconds!";
    isButtonMoving = true;
    button?.classList.add('frozen');
    setTimeout(() => {
        button?.classList.remove('frozen');
        isButtonMoving = false;
        if (quoteDiv?.textContent.includes("TIME FREEZE")) getNewAction();
    }, 3000);
}
// Event List Definition
const miniEvents = [flipScreen, cloneButton, emojiRain, timeFreeze];
// === END MERGE ===

// === Achievement Display ===
function showAchievement(clickCount) {
  if (!achievements[clickCount]) return;
  const achievement = achievements[clickCount];
  const popup = document.getElementById("achievement-popup");
  if (popup) {
    const icon = popup.querySelector(".achievement-icon");
    const text = popup.querySelector(".achievement-text");
    if (icon) icon.textContent = achievement.icon;
    if (text) text.textContent = achievement.text;
    popup.classList.add("show");
    setTimeout(() => popup.classList.remove("show"), 3000);
  }
}

// === MERGED: Added randomizeButtonPositionBasedOnMouse from main ===
function randomizeButtonPositionBasedOnMouse(clickCount, buttonEl, containerWidth, containerHeight) {
  if (clickCount < 1000 || !buttonEl) return;
  let mouseX = 0, mouseY = 0;

  const mouseMoveHandler = (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;

    const rect = buttonEl.getBoundingClientRect();
    const buttonCenterX = rect.left + rect.width / 2;
    const buttonCenterY = rect.top + rect.height / 2;
    const dx = mouseX - buttonCenterX;
    const dy = mouseY - buttonCenterY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const dangerZone = 500; // Increased danger zone

    if (distance < dangerZone) {
      const { left, top } = getRandomLocation(); // Use existing function
      buttonTeleport(left, top); // Use existing teleport function
    }
  };

  // Add listener only if needed, consider removing later if performance is an issue
  document.addEventListener('mousemove', mouseMoveHandler);

  // Optional: Add a way to remove the listener if needed
  // return () => document.removeEventListener('mousemove', mouseMoveHandler);
}
// === END MERGE ===

// === Combo System ===
function checkCombo() {
  const now = Date.now();
  const timeDiff = now - lastClickTime;
  if (timeDiff < 500) {
    comboCount++;
    if (comboCount >= 2 && comboCount <= 6) {
      const comboMessage = comboMessages[Math.min(comboCount - 2, comboMessages.length - 1)];
      if (quoteDiv) {
        quoteDiv.textContent = comboMessage;
        quoteDiv.style.color = "#FFD700";
        setTimeout(() => {
          if (quoteDiv) quoteDiv.style.color = "";
        }, 1000);
      }
    }
  } else {
    comboCount = 0;
  }
  lastClickTime = now;
}

// === Unlock audio on first user interaction ===
window.addEventListener("click", () => {
    if (!userInteracted) {
      userInteracted = true;
      // Initialize audio elements only once
      clickSound?.load(); failSound?.load(); bgMusic?.load();
      // Attempt to play and pause to unlock on mobile
      clickSound?.play().then(() => clickSound.pause()).catch(() => {});
      failSound?.play().then(() => failSound.pause()).catch(() => {});
      if (musicEnabled && currentTrack) {
        playBackgroundMusic(currentTrack); // This will attempt play
      }
    }
  }, { once: true }
);

// === Button Click Handler ===
if (button) {
  button.addEventListener("click", (e) => {
    e.stopPropagation();
    clicks++;

    // === MERGED: High Score Logic from main ===
    if (clicks > highScore) {
      highScore = clicks;
      if (highScoreDisplay) highScoreDisplay.textContent = highScore;
      localStorage.setItem('nothingHighScore', highScore); // Save high score
    }
    // === END MERGE ===

    checkCombo();
    getNewAction();
    addRippleEffect(e);
    isButtonMoving = true; setTimeout(() => { isButtonMoving = false; }, 300);
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    updateCounter(`— ${randomMessage}`);
    button.style.backgroundColor = getRandomColor();
    const width = getRandomNumber(150, 250); const height = getRandomNumber(80, 150);
    button.style.width = `${width}px`; button.style.height = `${height}px`;
    button.style.transform = "scale(1.2) rotate(10deg)";
    setTimeout(() => { if(button) button.style.transform = "scale(1) rotate(0deg)"; }, 150);
    if (!userInteracted) userInteracted = true;
    playSound(clickSound);
    createSmokeTrail();
    showAchievement(clicks);

    if (clicks === 20) {
      quoteDiv.textContent = "✨ 20-CLICK POWER UP! Particles Erupt! âœ¨";
    }

    //  Confetti animation at 50 clicks
    if (clicks === 50 && typeof createConfetti === "function") {
      createConfetti();
    }

    // Special effects at milestones
    if (clicks % 50 === 0) {
      document.body.classList.add("page-shake");
      setTimeout(() => document.body.classList.remove("page-shake"), 500);
    }
    // === MERGED: Random Mini Event Trigger from main ===
    if (Math.random() < 0.15) {
        const randomIndex = Math.floor(Math.random() * miniEvents.length);
        miniEvents[randomIndex]();
    }
    // === END MERGE ===
    const { left, top } = getRandomLocation(); // Destructure correctly
    buttonTeleport(left, top);
    checkMusicUnlock();
    updateActivityTime();
  });
}

// === Action Prompt System (Rarity + Cooldown) ===
const CATEGORY_COOLDOWN = 10 * 60 * 1000;
let categoryCooldowns = {}; // Reset on load
function getNewAction() {
    const now = Date.now();

    // 1ï¸ Filter actions whose categories are NOT in cooldown
    const available = actions.filter(a => {
        const lastShown = categoryCooldowns[a.category];
        return !lastShown || now - lastShown > CATEGORY_COOLDOWN;
    });

    // 2ï¸ random show when cooldown 
    const pool = available.length > 0 ? available : actions;

    // 3ï¸ Weighted random selection (rarity logic)
    const totalWeight = pool.reduce((sum, a) => sum + (1 / a.rarity), 0);
    let randVal = Math.random() * totalWeight; // Renamed variable
    let selected = pool[0];
    for (const a of pool) {
        randVal -= (1 / a.rarity);
        if (randVal <= 0) { selected = a; break; }
    }

    // 4 Display the prompt
    quoteDiv.textContent = selected.text;

    // 5ï¸ Update cooldown for that category
    categoryCooldowns[selected.category] = now;
}

// === Count failed clicks ===
document.addEventListener("click", (e) => {
  const clickedButton = e.target.closest('button');
  const clickedInput = e.target.closest('input, select, textarea'); // Broaden check
  const clickedLabel = e.target.closest('label');
  const clickedControl = e.target.closest('.control-buttons button, #theme-selector, #sound-panel'); // Ignore UI controls

  if (!clickedButton && !clickedInput && !clickedLabel && !clickedControl) {
    failedClicks++;
    const messageArray = impossibleMode ? impossibleFailMessages : failedClickMessages;
    const randomFail = messageArray[Math.floor(Math.random() * messageArray.length)];
    updateCounter(`— ${randomFail}`);
    if (failedClicks % (impossibleMode ? 5 : 10) === 0 && userInteracted) {
      playSound(failSound); // Use playSound utility
    }
    checkMusicUnlock();
  }
});

// === Button Dodge / Mouseover ===
if (button) {
  button.addEventListener("mouseover", () => {
    if (isButtonMoving) return;
    const now = Date.now();
    const throttleTime = impossibleMode ? 50 : 150;
    if (now - lastDodgeTime < throttleTime) return;
    lastDodgeTime = now;
    createSmokeTrail();
    const dodgeChance = impossibleMode ? 1 : 0.9;
    if (Math.random() < dodgeChance) {
      isButtonMoving = true;
      const rotation = impossibleMode ? getRandomNumber(-15, 15) : 5;
      button.style.transform = `rotate(${rotation}deg)`;
      setTimeout(() => {
        if (button) button.style.transform = "rotate(0deg) scale(1)";
        isButtonMoving = false;
      }, 200);
    }
  });
}

// === Impossible mode special mousemove dodge ===
document.addEventListener("mousemove", (e) => {
  if (!button || !impossibleMode || isButtonMoving) return; // Add check for isButtonMoving
  const rect = button.getBoundingClientRect();
  const cx = rect.left + rect.width / 2; const cy = rect.top + rect.height / 2;
  const dx = e.clientX - cx; const dy = e.clientY - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const dangerZone = 200;
  if (dist < dangerZone) {
    const now = Date.now();
    if (now - lastDodgeTime < 100) return; // Throttle
    lastDodgeTime = now;
    const { left, top } = getRandomLocation(); // Destructure correctly
    buttonTeleport(left, top);
    if (Math.random() > 0.7) {
      button.style.width = `${getRandomNumber(120, 200)}px`;
      button.style.height = `${getRandomNumber(60, 150)}px`;
    }
  }
});

// === Context Menu Reset ===
document.addEventListener("contextmenu", (e) => {
  e.preventDefault();
  failedClicks += clicks;
  clicks = 0;
  updateCounter("💥 SIKE YOU THOUGHT! 💥");
  playSound(failSound); // Use playSound utility
});

// === Timer ===
function formatTime(sec) {
  const mins = Math.floor(sec / 60); const secs = sec % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}
function updateTimer() {
  seconds++;
  if (timerDiv) {
    timerDiv.textContent = `Time spent doing nothing: ${formatTime(seconds)}`;
    timerDiv.classList.toggle("fade", seconds % 5 === 0); // Use toggle
  }
}

// === Theme System ===
const themes = {
  dark: { name: 'Dark Purple', icon: '🌙', bgStart: '#667eea', bgEnd: '#764ba2', textColor: '#fff', cardBg: 'rgba(255, 255, 255, 0.15)', accentColor: '#ff6b6b', borderColor: 'rgba(255, 255, 255, 0.3)', buttonStart: '#ff6b6b', buttonEnd: '#ff9a76' },
  light: { name: 'Light Rose', icon: '☀️', bgStart: '#fdf2ec', bgEnd: '#ffd8d8', textColor: '#1f1f1f', cardBg: 'rgba(255, 255, 255, 0.95)', accentColor: '#ff5a5a', borderColor: 'rgba(0, 0, 0, 0.1)', buttonStart: '#ff867c', buttonEnd: '#ff5a5a' },
  neon: { name: 'Neon Cyberpunk', icon: '⚡', bgStart: '#0a0e27', bgEnd: '#1a1a2e', textColor: '#00ff88', cardBg: 'rgba(0, 255, 136, 0.1)', accentColor: '#ff006e', borderColor: 'rgba(0, 255, 136, 0.3)', buttonStart: '#ff006e', buttonEnd: '#00d9ff' },
  retro: { name: 'Retro Sunset', icon: '🕹️', bgStart: '#ff6b9d', bgEnd: '#c94b4b', textColor: '#fff5e1', cardBg: 'rgba(255, 245, 225, 0.2)', accentColor: '#ffc93c', borderColor: 'rgba(255, 245, 225, 0.4)', buttonStart: '#ffc93c', buttonEnd: '#ff6b9d' },
  pastel: { name: 'Pastel Dreams', icon: '🦄', bgStart: '#ffcce7', bgEnd: '#d5f5e3', textColor: '#5d5d5d', cardBg: 'rgba(255, 255, 255, 0.8)', accentColor: '#ff8fa3', borderColor: 'rgba(93, 93, 93, 0.2)', buttonStart: '#ffb3c6', buttonEnd: '#ff8fa3' },
  solarized: { name: 'Solarized Dark', icon: '🌅', bgStart: '#002b36', bgEnd: '#073642', textColor: '#839496', cardBg: 'rgba(0, 43, 54, 0.8)', accentColor: '#268bd2', borderColor: 'rgba(131, 148, 150, 0.3)', buttonStart: '#268bd2', buttonEnd: '#2aa198' },
  ocean: { name: 'Deep Ocean', icon: '🌊', bgStart: '#004e92', bgEnd: '#000428', textColor: '#e0f7fa', cardBg: 'rgba(224, 247, 250, 0.15)', accentColor: '#00bcd4', borderColor: 'rgba(224, 247, 250, 0.3)', buttonStart: '#00bcd4', buttonEnd: '#00acc1' },
  forest: { name: 'Forest Grove', icon: '🌲', bgStart: '#134e4a', bgEnd: '#064e3b', textColor: '#d1fae5', cardBg: 'rgba(209, 250, 229, 0.15)', accentColor: '#34d399', borderColor: 'rgba(209, 250, 229, 0.3)', buttonStart: '#34d399', buttonEnd: '#10b981' },
  sunset: { name: 'Warm Sunset', icon: '🌇', bgStart: '#ff7e5f', bgEnd: '#feb47b', textColor: '#3d1f00', cardBg: 'rgba(255, 255, 255, 0.3)', accentColor: '#ff6b35', borderColor: 'rgba(61, 31, 0, 0.2)', buttonStart: '#ff6b35', buttonEnd: '#f7931e' },
  midnight: { name: 'Midnight Blue', icon: '🌃', bgStart: '#2c3e50', bgEnd: '#000000', textColor: '#ecf0f1', cardBg: 'rgba(236, 240, 241, 0.1)', accentColor: '#e74c3c', borderColor: 'rgba(236, 240, 241, 0.3)', buttonStart: '#e74c3c', buttonEnd: '#c0392b' }
};
let currentTheme = localStorage.getItem('currentTheme') || 'dark';
const themeKeys = Object.keys(themes);

const themeSelector = document.getElementById('theme-selector');
const closeThemeSelector = document.getElementById('close-theme-selector');
const themeTabs = document.querySelectorAll('.theme-tab');
const themeTabContents = document.querySelectorAll('.theme-tab-content');
const themesGrid = document.getElementById('themes-grid');
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
const randomizeCustomTheme = document.getElementById("random-color-theme"); // Added from main

function applyTheme(themeName) {
  const theme = themes[themeName]; if (!theme) return;
  document.body.dataset.theme = themeName;
  const rootStyle = document.documentElement.style;
  rootStyle.setProperty('--bg-start', theme.bgStart); rootStyle.setProperty('--bg-end', theme.bgEnd);
  rootStyle.setProperty('--text-color', theme.textColor); rootStyle.setProperty('--card-bg', theme.cardBg);
  rootStyle.setProperty('--accent-color', theme.accentColor); rootStyle.setProperty('--border-color', theme.borderColor);
  rootStyle.setProperty('--button-gradient-start', theme.buttonStart); rootStyle.setProperty('--button-gradient-end', theme.buttonEnd);
  document.body.style.fontFamily = theme.fontFamily || "'Poppins', sans-serif";
  currentTheme = themeName; localStorage.setItem('currentTheme', themeName);
  if (themesGrid) updateThemeCards();
}
function generateThemeCards() {
  if (!themesGrid) return; themesGrid.innerHTML = '';
  Object.keys(themes).forEach(themeKey => {
    const theme = themes[themeKey]; const card = document.createElement('div');
    card.className = 'theme-card'; if (themeKey === currentTheme) card.classList.add('active');
    card.style.background = `linear-gradient(135deg, ${theme.bgStart}, ${theme.bgEnd})`;
    card.style.color = theme.textColor;
    card.innerHTML = `<h3>${theme.icon} ${theme.name}</h3><div class="theme-preview">
        <div class="theme-color-dot" style="background: ${theme.bgStart}"></div><div class="theme-color-dot" style="background: ${theme.bgEnd}"></div>
        <div class="theme-color-dot" style="background: ${theme.buttonStart}"></div><div class="theme-color-dot" style="background: ${theme.accentColor}"></div></div>`;
    card.addEventListener('click', () => { applyTheme(themeKey); if (quoteDiv) quoteDiv.textContent = `✨ ${theme.name} theme activated!`; });
    themesGrid.appendChild(card);
  });
}
function updateThemeCards() {
  if (!themesGrid) return;
  const cards = themesGrid.querySelectorAll('.theme-card');
  const themeKeysArray = Object.keys(themes); // Use different name
  cards.forEach((card, index) => {
    const themeKey = themeKeysArray[index];
    card.classList.toggle('active', themeKey === currentTheme);
  });
}
// === MERGED: Added getRandomColor function from main ===
function getRandomColor() {
  const letters = "0123456789abcdef";
  let color = "#";
  for (let i = 0; i < 6; i++) color += letters[Math.floor(Math.random() * 16)];
  return color;
}
function assignRandomColorsToCustomTheme() {
    const inputs = [
        [customBgStart, customBgStartText], [customBgEnd, customBgEndText],
        [customTextColor, customTextColorText], [customAccentColor, customAccentColorText],
        [customButtonStart, customButtonStartText], [customButtonEnd, customButtonEndText]
    ];
    inputs.forEach(([colorInput, textInput]) => {
        if (colorInput && textInput) {
            const randomColor = getRandomColor();
            colorInput.value = randomColor;
            textInput.value = randomColor;
        }
    });
}
if (randomizeCustomTheme) { // Added from main
  randomizeCustomTheme.addEventListener("click", () => {
    assignRandomColorsToCustomTheme();
    if (quoteDiv) quoteDiv.textContent = "🎲 Custom theme colors randomized!";
  });
}
// === END MERGE ===
if (themeToggle) { // Theme cycle button
  themeToggle.addEventListener("click", () => {
    const currentIndex = themeKeys.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themeKeys.length;
    applyTheme(themeKeys[nextIndex]);
    if (quoteDiv) quoteDiv.textContent = `${themes[themeKeys[nextIndex]].icon} Switched to ${themes[themeKeys[nextIndex]].name}!`;
  });
  // Theme selector open triggers
  themeToggle.addEventListener('dblclick', (e) => { e.preventDefault(); if (themeSelector) { themeSelector.classList.add('show'); generateThemeCards(); } });
  themeToggle.addEventListener('contextmenu', (e) => { e.preventDefault(); if (themeSelector) { themeSelector.classList.add('show'); generateThemeCards(); } });
}
if (closeThemeSelector) closeThemeSelector.addEventListener('click', () => themeSelector?.classList.remove('show'));
if (themeSelector) themeSelector.addEventListener('click', (e) => { if (e.target === themeSelector) themeSelector.classList.remove('show'); });
if (themeTabs && themeTabContents) { // Theme tabs
  themeTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.dataset.tab;
      themeTabs.forEach(t => t.classList.remove('active')); tab.classList.add('active');
      themeTabContents.forEach(content => content.classList.toggle('active', content.id === `${targetTab}-tab`));
    });
  });
}
function syncColorInputs(colorInput, textInput) { // Custom theme sync
  if (!colorInput || !textInput) return;
  colorInput.addEventListener('input', () => { textInput.value = colorInput.value; });
  textInput.addEventListener('input', () => { if (/^#[0-9A-F]{6}$/i.test(textInput.value)) colorInput.value = textInput.value; });
}
syncColorInputs(customBgStart, customBgStartText); syncColorInputs(customBgEnd, customBgEndText);
syncColorInputs(customTextColor, customTextColorText); syncColorInputs(customAccentColor, customAccentColorText);
syncColorInputs(customButtonStart, customButtonStartText); syncColorInputs(customButtonEnd, customButtonEndText);
if (previewCustomTheme) { // Custom theme preview
  previewCustomTheme.addEventListener('click', () => {
    const customTheme = {
      bgStart: customBgStart.value, bgEnd: customBgEnd.value, textColor: customTextColor.value,
      cardBg: hexToRgba(customTextColor.value, 0.15), accentColor: customAccentColor.value,
      borderColor: hexToRgba(customTextColor.value, 0.3), buttonStart: customButtonStart.value,
      buttonEnd: customButtonEnd.value, fontFamily: customFontFamily.value
    };
    const rootStyle = document.documentElement.style;
    rootStyle.setProperty('--bg-start', customTheme.bgStart); rootStyle.setProperty('--bg-end', customTheme.bgEnd);
    rootStyle.setProperty('--text-color', customTheme.textColor); rootStyle.setProperty('--card-bg', customTheme.cardBg);
    rootStyle.setProperty('--accent-color', customTheme.accentColor); rootStyle.setProperty('--border-color', customTheme.borderColor);
    rootStyle.setProperty('--button-gradient-start', customTheme.buttonStart); rootStyle.setProperty('--button-gradient-end', customTheme.buttonEnd);
    document.body.style.fontFamily = customTheme.fontFamily;
    if (quoteDiv) quoteDiv.textContent = '👁️ Previewing your custom theme!';
  });
}
if (saveCustomTheme) { // Custom theme save
  saveCustomTheme.addEventListener('click', () => {
    const customTheme = {
      name: 'My Custom Theme', icon: '🎨', bgStart: customBgStart.value, bgEnd: customBgEnd.value,
      textColor: customTextColor.value, cardBg: hexToRgba(customTextColor.value, 0.15),
      accentColor: customAccentColor.value, borderColor: hexToRgba(customTextColor.value, 0.3),
      buttonStart: customButtonStart.value, buttonEnd: customButtonEnd.value, fontFamily: customFontFamily.value
    };
    themes.custom = customTheme; if (!themeKeys.includes('custom')) themeKeys.push('custom');
    localStorage.setItem('customTheme', JSON.stringify(customTheme));
    applyTheme('custom'); generateThemeCards();
    if (quoteDiv) quoteDiv.textContent = '💾 Custom theme saved successfully!';
    setTimeout(() => themeSelector?.classList.remove('show'), 1500);
  });
}
if (resetCustomTheme) { // Custom theme reset
  resetCustomTheme.addEventListener('click', () => {
    if(customBgStart && customBgStartText) customBgStart.value = customBgStartText.value = '#667eea';
    if(customBgEnd && customBgEndText) customBgEnd.value = customBgEndText.value = '#764ba2';
    if(customTextColor && customTextColorText) customTextColor.value = customTextColorText.value = '#ffffff';
    if(customAccentColor && customAccentColorText) customAccentColor.value = customAccentColorText.value = '#ff6b6b';
    if(customButtonStart && customButtonStartText) customButtonStart.value = customButtonStartText.value = '#ff6b6b';
    if(customButtonEnd && customButtonEndText) customButtonEnd.value = customButtonEndText.value = '#ff9a76';
    if(customFontFamily) customFontFamily.value = "'Poppins', sans-serif";
    if (quoteDiv) quoteDiv.textContent = '🔄 Custom theme reset to defaults!';
  });
}
function hexToRgba(hex, alpha) { // Helper
  if (!hex || hex.length < 7) hex = '#ffffff';
  const r = parseInt(hex.slice(1, 3), 16); const g = parseInt(hex.slice(3, 5), 16); const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
function loadCustomTheme() { // Load saved custom theme
  const savedCustomTheme = localStorage.getItem('customTheme');
  if (savedCustomTheme) {
    try {
      const customTheme = JSON.parse(savedCustomTheme); themes.custom = customTheme;
      if (!themeKeys.includes('custom')) themeKeys.push('custom');
      if (customFontFamily && customTheme.fontFamily) customFontFamily.value = customTheme.fontFamily;
    } catch (e) { console.error('Failed to load custom theme:', e); }
  }
}
loadCustomTheme(); applyTheme(currentTheme); // Initialize themes

// === Impossible Mode Toggle ===
if (impossibleToggle) {
  impossibleToggle.addEventListener("change", () => {
    impossibleMode = impossibleToggle.checked;
    if (impossibleMode) {
      if (button) button.classList.add("impossible-mode");
      updateCounter("— 🔥 IMPOSSIBLE MODE ACTIVATED! Good luck clicking now! ðŸ”¥");
    } else {
      if (button) button.classList.remove("impossible-mode");
      updateCounter("— Normal mode restored. (Boring!)");
    }
  });
}

// === Are You Still Clicking Popup ===
function updateActivityTime() {
  lastActivityTime = Date.now();
  if (popupTimer) clearTimeout(popupTimer);
  popupTimer = setTimeout(showPopup, getRandomInactivityTime());
}
function getRandomInactivityTime() { return Math.floor(Math.random() * 30001) + 30000; } // 30-60 sec
function showPopup() {
  if (!popupContainer || popupActive) return;
  popupActive = true; popupContainer.classList.add("show");
  popupAutoCloseTimer = setTimeout(hidePopup, 15000); // Auto-close
}
function hidePopup() {
  if (!popupContainer) return;
  popupContainer.classList.remove("show"); popupActive = false;
  if (popupAutoCloseTimer) clearTimeout(popupAutoCloseTimer);
  updateActivityTime(); // Reset timer after interaction
}





// Function to randomize button position within the popup (keeps button inside container)
function randomizeButtonPosition(clickCount, buttonEl, containerWidth, containerHeight) {
  if (clickCount >= 1000 || !buttonEl) return; // Prevent excessive movement or null button

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
    if (container) randomizeButtonPosition(clicks, popupYesButton, container.offsetWidth, container.offsetHeight);
  });
  popupYesButton.addEventListener("click", () => { 
    hidePopup(); 
    playSound(clickSound); 
  });
}

if (popupNoButton) {
  popupNoButton.addEventListener("mouseover", () => {
    const container = popupNoButton.closest(".popup-buttons");
    if (container) randomizeButtonPosition(clicks, popupNoButton, container.offsetWidth, container.offsetHeight);
  });
  popupNoButton.addEventListener("click", () => { 
    hidePopup(); 
    playSound(clickSound); 
  });
}

["click", "mousemove", "keydown"].forEach(eventType => 
  document.addEventListener(eventType, updateActivityTime)
);

// === MERGED: Share Button Logic from main ===
if (shareButton) {
  shareButton.addEventListener('click', () => {
    const shareMessage = `😲 I have clicked the button 'The Button That Does Nothing' ${clicks} times! My High Score is ${highScore}. Can you beat it?`;
    const gameUrl = window.location.href; // Use current URL

    // Use navigator.clipboard API for better compatibility and security
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareMessage + '\n' + gameUrl)
            .then(() => {
                const originalText = shareButton.textContent;
                shareButton.textContent = 'Copied!';
                setTimeout(() => { shareButton.textContent = originalText; }, 2000);
            })
            .catch(err => {
                console.error('Failed to copy using navigator.clipboard: ', err);
                // Fallback for older browsers or if permission denied
                try {
                    const textArea = document.createElement("textarea");
                    textArea.value = shareMessage + '\n' + gameUrl;
                    document.body.appendChild(textArea);
                    textArea.focus();
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    const originalText = shareButton.textContent;
                    shareButton.textContent = 'Copied!';
                    setTimeout(() => { shareButton.textContent = originalText; }, 2000);
                } catch (fallbackErr) {
                    console.error('Fallback copy failed: ', fallbackErr);
                    alert('Could not copy score. Please copy manually.');
                }
            });
    } else {
        // Very old browser fallback
        alert('Clipboard API not supported. Please copy the score manually.');
    }
  });
}
// === END MERGE ===
// Track all user interactions to reset the inactivity timer
["click", "mousemove", "keydown"].forEach((eventType) => {
  document.addEventListener(eventType, updateActivityTime);
});

window.addEventListener("load", () => {
  setInterval(updateTimer, 1000);

  if (highScoreDisplay) {
    highScoreDisplay.textContent = highScore;
  }
});

// === Sound Settings System ===
function loadUnlockedTracks() {
  const totalInteractions = clicks + failedClicks;
  const tracksToUnlockCount = Math.max(1, Math.floor(totalInteractions / 100) + 1);
  
  let calculatedList = allTrackKeys.slice(0, tracksToUnlockCount);
  
  if (allTrackKeys.length > 0 && calculatedList.length > 0 && !calculatedList.includes(allTrackKeys[0])) {
    calculatedList.unshift(allTrackKeys[0]);
  }

  if (calculatedList.length === 0 && allTrackKeys.length > 0) {
    calculatedList = [allTrackKeys[0]];
  }

  unlockedTracks = [...new Set(calculatedList)];
  console.log("Loaded unlocked tracks:", unlockedTracks);
}
function populateTrackSelector() {
  if (!trackSelector) return;
  const currentSelectedValue = trackSelector.value;
  trackSelector.innerHTML = '';
  unlockedTracks.forEach(trackKey => {
    if (tracks[trackKey]) {
      const option = document.createElement('option'); option.value = trackKey;
      const trackName = trackKey.charAt(0).toUpperCase() + trackKey.slice(1); option.textContent = trackName;
      trackSelector.appendChild(option);
    }
  });
  if (unlockedTracks.includes(currentSelectedValue)) trackSelector.value = currentSelectedValue;
  else if (unlockedTracks.includes(currentTrack)) trackSelector.value = currentTrack;
  else if (unlockedTracks.length > 0) trackSelector.value = unlockedTracks[0];
}
function checkMusicUnlock() {
  const totalInteractions = clicks + failedClicks;
  const tracksToUnlockCount = Math.max(1, Math.floor(totalInteractions / 100) + 1);
  const tracksThatShouldBeUnlocked = allTrackKeys.slice(0, tracksToUnlockCount);
  let newTrackUnlocked = false; let lastUnlockedTrackKey = null;
  tracksThatShouldBeUnlocked.forEach(trackKey => {
    if (trackKey && !unlockedTracks.includes(trackKey)) {
      console.log(`Unlocking track: ${trackKey}`); unlockedTracks.push(trackKey);
      newTrackUnlocked = true; lastUnlockedTrackKey = trackKey;
    }
  });
  if (newTrackUnlocked && lastUnlockedTrackKey) {
    populateTrackSelector();
    console.log(`Auto-playing newly unlocked track: ${lastUnlockedTrackKey}`);
    currentTrack = lastUnlockedTrackKey; if (trackSelector) trackSelector.value = currentTrack;
    updateSoundSettings(); playBackgroundMusic(currentTrack);
    if (quoteDiv) {
      const trackName = lastUnlockedTrackKey.charAt(0).toUpperCase() + lastUnlockedTrackKey.slice(1);
      quoteDiv.textContent = `🎵 New Track Unlocked: ${trackName}!`;
    }
  }
document.addEventListener('DOMContentLoaded', () => {
  updateActivityTime();
  changeBackgroundColor();

  // Initialize counter and sound settings
  initializeCounter();
  initSoundSettings();

  // Setup dark/light toggle
  setupDarkLightToggle();
  applyDarkLightMode();

  // Load an initial action prompt when the page first loads
  getNewAction();
});

// === Sound Settings System ===
function playBackgroundMusic(trackName) {
  if (!userInteracted || !musicEnabled || !trackName || !tracks[trackName]) {
    if(bgMusic) bgMusic.pause(); return;
  }
  if (bgMusic) {
      const newSrc = tracks[trackName];
      // Fixed check for current source
      const currentRelativeSrc = bgMusic.currentSrc ? bgMusic.currentSrc.substring(bgMusic.currentSrc.lastIndexOf('/') + 1) : '';
      const newRelativeSrc = newSrc.substring(newSrc.lastIndexOf('/') + 1);
      if (currentRelativeSrc !== newRelativeSrc || bgMusic.paused) {
           console.log(`Setting music source to: ${newSrc}`);
           bgMusic.src = newSrc; bgMusic.volume = masterVolume * 0.7;
           const playPromise = bgMusic.play();
           if (playPromise) playPromise.catch(error => console.error(`Error playing music:`, error));
      } else bgMusic.volume = masterVolume * 0.7; // Ensure volume if already playing
  } else console.error("bgMusic element not found!");
}
function updateSoundSettings() {
  localStorage.setItem('soundsEnabled', soundsEnabled); localStorage.setItem('musicEnabled', musicEnabled);
  localStorage.setItem('masterVolume', masterVolume);
  // Do NOT save currentTrack
  if (clickSound) clickSound.volume = masterVolume; if (failSound) failSound.volume = masterVolume;
  if (bgMusic) bgMusic.volume = masterVolume * 0.7;
}
function updateMusicPlayback() { playBackgroundMusic(currentTrack); }
function initSoundSettings() {
  if (soundsToggle) soundsToggle.checked = soundsEnabled; if (musicToggle) musicToggle.checked = musicEnabled;
  if (volumeSlider) volumeSlider.value = masterVolume * 100;
  loadUnlockedTracks(); populateTrackSelector();
  currentTrack = unlockedTracks[unlockedTracks.length - 1] || '8bit';
  console.log(`Initial track set to: ${currentTrack}`);
  if (trackSelector) trackSelector.value = currentTrack;
  updateSoundSettings();
}
if (soundToggle) soundToggle.addEventListener('click', () => soundPanel?.classList.add('show'));
if (closeSoundPanel) closeSoundPanel.addEventListener('click', () => soundPanel?.classList.remove('show'));
if (soundPanel) soundPanel.addEventListener('click', (e) => { if (e.target === soundPanel) soundPanel.classList.remove('show'); });
if (soundsToggle) soundsToggle.addEventListener('change', () => { soundsEnabled = soundsToggle.checked; updateSoundSettings(); });
if (musicToggle) musicToggle.addEventListener('change', () => { musicEnabled = musicToggle.checked; updateSoundSettings(); updateMusicPlayback(); });
if (volumeSlider) volumeSlider.addEventListener('input', () => { masterVolume = volumeSlider.value / 100; updateSoundSettings(); });
if (trackSelector) trackSelector.addEventListener('change', () => { currentTrack = trackSelector.value; updateSoundSettings(); updateMusicPlayback(); });

// === Magnetic Hover Effect ===
if (button) {
  button.addEventListener('mousemove', (e) => {
    if (impossibleMode || isButtonMoving) return;
    const rect = button.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2; const centerY = rect.top + rect.height / 2;
    const deltaX = e.clientX - centerX; const deltaY = e.clientY - centerY;
    const moveX = deltaX * 0.15; const moveY = deltaY * 0.15;
    button.style.setProperty('--magnetic-x', `${moveX}px`); button.style.setProperty('--magnetic-y', `${moveY}px`);
  });
  button.addEventListener('mouseleave', () => {
    if (!impossibleMode && !isButtonMoving) {
      button.style.setProperty('--magnetic-x', '0px'); button.style.setProperty('--magnetic-y', '0px');
    }
  });
}
if (impossibleToggle) { // Reset magnetic on impossible toggle
  impossibleToggle.addEventListener('change', () => {
    if (impossibleMode && button) {
      button.style.setProperty('--magnetic-x', '0px'); button.style.setProperty('--magnetic-y', '0px');
    }
  });
}

// === Keyboard Navigation ===
document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
  if (e.key === ' ' || e.key === 'Enter') {
    if (document.activeElement === button || !document.activeElement || document.activeElement === document.body) {
      e.preventDefault(); button?.click();
    }
  }
  if ((e.key === 't' || e.key === 'T') && !e.metaKey && !e.ctrlKey) { e.preventDefault(); themeToggle?.click(); }
  if ((e.key === 's' || e.key === 'S') && !e.metaKey && !e.ctrlKey) { e.preventDefault(); soundToggle?.click(); }
  if ((e.key === 'i' || e.key === 'I') && !e.metaKey && !e.ctrlKey) { e.preventDefault(); impossibleToggle?.click(); }
  if (e.key === 'Escape') {
    themeSelector?.classList.remove('show'); soundPanel?.classList.remove('show'); popupContainer?.classList.remove('show');
  }
});
// === Dark/Light Mode Toggle ===
let isDarkMode = localStorage.getItem('isDarkMode') !== 'false'; // Default to dark mode

function applyDarkLightMode() {
  if (isDarkMode) {
    // Dark mode
    document.documentElement.style.setProperty('--bg-start', '#1a1a2e');
    document.documentElement.style.setProperty('--bg-end', '#16213e');
    document.documentElement.style.setProperty('--text-color', '#ffffff');
    document.documentElement.style.setProperty('--text-secondary', 'rgba(255, 255, 255, 0.85)');
    document.documentElement.style.setProperty('--card-bg', 'rgba(255, 255, 255, 0.12)');
    document.documentElement.style.setProperty('--card-bg-solid', 'rgba(255, 255, 255, 0.18)');
    document.documentElement.style.setProperty('--accent-color', '#ffd93d');
    document.documentElement.style.setProperty('--border-color', 'rgba(255, 255, 255, 0.25)');
    document.documentElement.style.setProperty('--button-gradient-start', '#6bcf7f');
    document.documentElement.style.setProperty('--button-gradient-end', '#4ec9db');

    if (darkLightToggle) darkLightToggle.textContent = '🌙';
    if (darkLightToggle) darkLightToggle.title = 'Switch to Light Mode';
  } else {
    // Light mode
    document.documentElement.style.setProperty('--bg-start', '#fdf2ec');
    document.documentElement.style.setProperty('--bg-end', '#ffd8d8');
    document.documentElement.style.setProperty('--text-color', '#1f1f1f');
    document.documentElement.style.setProperty('--text-secondary', 'rgba(31, 31, 31, 0.6)');
    document.documentElement.style.setProperty('--card-bg', 'rgba(255, 255, 255, 0.8)');
    document.documentElement.style.setProperty('--card-bg-solid', 'rgba(255, 255, 255, 0.95)');
    document.documentElement.style.setProperty('--accent-color', '#ff5a5a');
    document.documentElement.style.setProperty('--border-color', 'rgba(0, 0, 0, 0.1)');
    document.documentElement.style.setProperty('--button-gradient-start', '#ff867c');
    document.documentElement.style.setProperty('--button-gradient-end', '#ff5a5a');

    if (darkLightToggle) darkLightToggle.textContent = '☀️';
    if (darkLightToggle) darkLightToggle.title = 'Switch to Dark Mode';
  }

  localStorage.setItem('isDarkMode', isDarkMode);
}

// Dark/Light toggle button - Setup
function setupDarkLightToggle() {
  const toggleBtn = document.getElementById('dark-light-toggle');
  if (toggleBtn) {
    console.log('Dark/Light toggle button found!');
    toggleBtn.addEventListener('click', (e) => {
      console.log('Dark/Light toggle clicked!');
      e.stopPropagation();
      isDarkMode = !isDarkMode;
      applyDarkLightMode();

      if (quoteDiv) {
        quoteDiv.textContent = isDarkMode ? '🌙 Dark mode activated!' : '☀️ Light mode activated!';
      }
    });
  } else {
    console.error('Dark/Light toggle button NOT found!');
  }
}

// === Main Initialization ===
window.addEventListener('load', () => {
  initializeCounter(); // Shows 0 clicks
  initSoundSettings(); // Sets up sounds, loads ['8bit']
  setInterval(updateTimer, 1000); // Starts timer

  // Apply dark/light mode on load
  applyDarkLightMode();
  setupDarkLightToggle();

  // Display high score if available
  if (highScoreDisplay) {
    highScoreDisplay.textContent = highScore;
  }

  // Initial quote
  if (quoteDiv && clicks === 0 && failedClicks === 0) {
    quoteDiv.textContent = "Click the button to begin your pointless journey! 🚀";
  }

  // Start inactivity timer
  updateActivityTime();
});
initializeCounter();
initSoundSettings();
