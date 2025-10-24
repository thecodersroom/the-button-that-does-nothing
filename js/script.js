// sound files
const clickSoundFiles = [
  "audio/click1.mp3","audio/click2.wav","audio/click3.wav",
  "audio/click4.wav","audio/click5.wav","audio/click6.mp3",
  "audio/click7.wav","audio/click8.wav"
];

// DOM Elements
const button = document.getElementById("useless-button");
const counterDiv = document.getElementById("counter"); // Note: 'button' is already used for the main button
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

// === FIX: High Score aur Share Button Elements ko Yahaan Add Karein ===
const highScoreDisplay = document.getElementById('high-score');
const shareButton = document.getElementById('share-button');

// State
// ... jahaan 'let clicks = 0;' aur 'let failedClicks = 0;' likha hai
let clicks = 0;
let failedClicks = 0;

// YEH CODE YAHIN ADD KAREIN (Yeh aapne sahi kiya tha)
let highScore = Number(localStorage.getItem('nothingHighScore')) || 0;
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
let isCelebrationAnimationComplete = false; // FIX: Added missing state variable

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
  "Nice click!",
  "You did it!",
  "Another one!",
  "Keep going!",
  "Fantastic!",
  "Amazing work!",
  "You're on fire! 🔥",
  "Incredible!",
  "Spectacular!",
  "Magnificent!",
];

const failedClickMessages = [
  "Choppy fingers. 🍗",
  "My mom's sandal clicks more precise. 👡",
  "You're a failing legend. 💀",
  "Even the cursor gave up on you. 🖱️",
  "You've achieved the rare 'Click Miss Combo'. 🎪",
  "Pathetic reflexes â€” admirable persistence. 🐌",
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

// Initialize modern card-based counter
function initializeCounter() {
  if (!counterDiv) return;
  counterDiv.innerHTML = `
    <div class="stat-card">
      <span class="stat-icon">👆</span>
      <div class="stat-value" id="clicks-value">0</div>
      <div class="stat-label">Total Clicks</div>
    </div>
    <div class="stat-card">
      <span class="stat-icon">❌</span>
      <div class="stat-value" id="failed-value">0</div>
      <div class="stat-label">Failed Clicks</div>
    </div>
    <div class="stat-card">
      <span class="stat-icon">🎯</span>
      <div class="stat-value" id="accuracy-value">100%</div>
      <div class="stat-label">Accuracy</div>
    </div>
  `;
}

function animateNumber(element, newValue) {
  if (!element) return;
  const current = parseInt(element.textContent) || 0;
  const diff = newValue - current;
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
      quoteDiv.style.animation = "fadeIn 0.5s ease-in forwards";
    }, 10);
  }
}

// Add ripple effect to button
function addRippleEffect(event) {
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
// === NEW MINI-EVENT FUNCTIONS FOR ISSUE #42 (Random Mini Events) ===

function flipScreen() {
    document.body.classList.add('flipped');
    if (quoteDiv) quoteDiv.textContent = "😵 Whoa! The screen just flipped for 5 seconds!";
    
    // Revert after 5 seconds
    setTimeout(() => {
        document.body.classList.remove('flipped');
        // Revert quote if still showing the event message
        if (quoteDiv.textContent.includes("flipped")) {
             getNewAction(); 
        }
    }, 5000);
}

function cloneButton() {
    const button = document.getElementById("useless-button");
    const clone = button.cloneNode(true); // Copy HTML only
    clone.classList.add("button-clone");   // Apply the CSS class for clones

    // Set initial random position near the original button
    const rect = button.getBoundingClientRect();
    clone.style.left = rect.left + Math.random() * 50 - 25 + "px";
    clone.style.top = rect.top + Math.random() * 50 - 25 + "px";

    // Set scale and rotation
    const scale = Math.random() * 0.5 + 0.8; // random size
    const rotation = 0;                       // rotation 0
    clone.style.transform = `scale(${scale}) rotate(${rotation}deg)`;

    document.body.appendChild(clone);

    // Remove clone after a short duration
    setTimeout(() => {
        clone.remove();
    }, 3000); // 3 seconds
}

function emojiRain() {
    const emojis = ['✨', '🔥', '🥳', '🙃', '😂', '💖', '⭐']; 
    if (quoteDiv) quoteDiv.textContent = "🎊 EMOJI PARTY! Enjoy the pointless rain!";

    for (let i = 0; i < 60; i++) { // Create 60 emojis
        const emoji = document.createElement('span');
        emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        emoji.classList.add('falling-emoji');
        
        // Randomize position, delay, and speed
        emoji.style.left = Math.random() * 100 + 'vw';
        emoji.style.animationDelay = (Math.random() * -5) + 's'; 
        emoji.style.animationDuration = (Math.random() * 4 + 4) + 's'; 
        
        document.body.appendChild(emoji);
        
        // Cleanup after max animation time
        setTimeout(() => {
            emoji.remove();
        }, 8500); 
    }
    
    // Set a timeout to clear the quoteDiv text after the initial event duration
    setTimeout(() => {
        if (quoteDiv.textContent.includes("EMOJI PARTY")) {
            getNewAction();
        }
    }, 5000);
}

function timeFreeze() {
    if (quoteDiv) quoteDiv.textContent = "❄️ TIME FREEZE! The button is stuck for 3 seconds!";
    
    // Disable dodge and teleport temporarily (using existing state and class)
    isButtonMoving = true; 
    button.classList.add('frozen');

    setTimeout(() => {
        button.classList.remove('frozen');
        isButtonMoving = false; // Allow dodge and teleport again
        // Revert quote if still showing the event message
        if (quoteDiv.textContent.includes("TIME FREEZE")) {
            getNewAction();
        }
    }, 3000);
}

// --- Event List Definition (Place this immediately after the functions) ---
const miniEvents = [flipScreen, cloneButton, emojiRain, timeFreeze];

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

function randomizeButtonPositionBasedOnMouse(clickCount, buttonEl, containerWidth, containerHeight) {
  if(clickCount < 1000) return;
  let mouseX = 0;
  let mouseY = 0;

  document.addEventListener('mousemove', (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;

    const rect = buttonEl.getBoundingClientRect();
    const buttonCenterX = rect.left + rect.width / 2;
    const buttonCenterY = rect.top + rect.height / 2;

    const dx = mouseX - buttonCenterX;
    const dy = mouseY - buttonCenterY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const dangerZone = 500;
    if(distance < dangerZone) {
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
  });
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

    // === FIX: High Score Logic ko Yahaan Merge Karein ===
    if (clicks > highScore) {
      highScore = clicks; // high score (number) ko update karein
      if (highScoreDisplay) { //  element hai ya nahi
        highScoreDisplay.textContent = highScore; // Page par (number) dikhaayein
      }
      // Save karte waqt localStorage use string mein badal dega
      localStorage.setItem('nothingHighScore', highScore);
    }
    // === END FIX ===

    checkCombo();
    getNewAction(); // This will now update the quoteDiv
    
    // Add ripple effect
    addRippleEffect(e);
    
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

    // --- NEW CODE INSERTION: Random Mini Event Trigger (Issue #42) ---
    // 15% chance to trigger one of the events
    if (Math.random() < 0.15) { 
        const randomIndex = Math.floor(Math.random() * miniEvents.length);
        miniEvents[randomIndex]();
    }
    // ---------------------------------------------------

    // Teleport button
    const { randomX, randomY } = getRandomLocation();
    buttonTeleport(randomX, randomY);

    updateActivityTime();
  });
}

// === Action Prompt System (Rarity + Cooldown) ===

// Cooldown period in milliseconds (e.g., 10 minutes)
const CATEGORY_COOLDOWN = 10 * 60 * 1000; 

// Load cooldowns from localStorage to make them persistent
let categoryCooldowns = JSON.parse(localStorage.getItem('categoryCooldowns')) || {};

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
    let rand = Math.random() * totalWeight;
    let selected = pool[0];

    for (const a of pool) {
        rand -= (1 / a.rarity);
        if (rand <= 0) {
            selected = a;
            break;
        }
    }

    // 4 Display the prompt
    quoteDiv.textContent = selected.text;

    // 5ï¸ Update cooldown for that category
    categoryCooldowns[selected.category] = now;
    localStorage.setItem('categoryCooldowns', JSON.stringify(categoryCooldowns));
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
const randomizeCustomTheme = document.getElementById("random-color-theme");

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

function getRandomColor() {
  const letters = "0123456789abcdef";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function assignRandomColorsToCustomTheme() {
  for (let i = 0; i < 6; i++) {
    const randomColor = getRandomColor();
    switch (i) {
      case 0:
        customBgStart.value = randomColor;
        customBgStartText.value = randomColor;
        break;
      case 1:
        customBgEnd.value = randomColor;
        customBgEndText.value = randomColor;
        break;
      case 2:
        customTextColor.value = randomColor;
        customTextColorText.value = randomColor;
        break;
      case 3:
        customAccentColor.value = randomColor;
        customAccentColorText.value = randomColor;
        break;
      case 4:
        customButtonStart.value = randomColor;
        customButtonStartText.value = randomColor;
        break;
      case 5:
        customButtonEnd.value = randomColor;
        customButtonEndText.value = randomColor;
        break;
    }
  }
}

// Randomize custom theme colors
if (randomizeCustomTheme) {
  randomizeCustomTheme.addEventListener("click", () => {
    assignRandomColorsToCustomTheme();
    if (quoteDiv) {
      quoteDiv.textContent = "🎲 Custom theme colors randomized!";
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
      updateCounter("— 🔥 IMPOSSIBLE MODE ACTIVATED! Good luck clicking now! ðŸ”¥");
    } else {
      if (button) button.classList.remove("impossible-mode");
      updateCounter("— Normal mode restored. (Boring!)");
    }
  });
}




function updateActivityTime() {
  lastActivityTime = Date.now();

  
  if (popupTimer) {
    clearTimeout(popupTimer);
  }

  
  popupTimer = setTimeout(showPopup, getRandomInactivityTime());
}


function getRandomInactivityTime() {
  return Math.floor(Math.random() * (60000 - 30000 + 1)) + 30000; // 30-60 seconds
}

// Function to show the popup
function showPopup() {
  if (!popupContainer) return;
  if (popupActive) return;

  popupActive = true;
  popupContainer.classList.add("show");

  // Auto-close popup after 15 seconds
  popupAutoCloseTimer = setTimeout(() => {
    hidePopup();
  }, 15000);
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



if (shareButton) { 
  shareButton.addEventListener('click', () => {
    
    const shareMessage = `😲 I have clicked the button 'The Button That Does Nothing'  ${clicks} times! and now my High Score is  ${highScore} . can you beat it?`;
    
   
    const gameUrl = 'https://ashasaini-033.github.io/the-button-that-does-nothing/'; 

    
    navigator.clipboard.writeText(shareMessage + '\n' + gameUrl)
      .then(() => {
       
        shareButton.textContent = 'Copied to Clipboard!';
        setTimeout(() => {
          shareButton.textContent = 'Share My Score';
        }, 2000); 
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
        alert('Score copy nahi ho paaya!');
      });
  });
}





// function randomizeButtonPosition(buttonEl, containerWidth, containerHeight) {
// // Function to randomize button position within the popup (keeps button inside container)
function randomizeButtonPosition(clickCount, buttonEl, containerWidth, containerHeight) {
  if(clickCount>=1000) return;
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


window.addEventListener("load", () => {
  
  setInterval(updateTimer, 1000);

  
  if (highScoreDisplay) {
    highScoreDisplay.textContent = highScore;
  }
  // === END FIX ===

  if (quoteDiv) {
    quoteDiv.textContent = "Click the button to begin your pointless journey! 🚀";
  }

  
  updateActivityTime();


  changeBackgroundColor();
});


// Load an initial action prompt when the page first loads
document.addEventListener('DOMContentLoaded', getNewAction);

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


// === Magnetic Hover Effect (Normal Mode Only) ===
if (button) {
  button.addEventListener('mousemove', (e) => {
    // Only apply magnetic effect in normal mode
    if (impossibleMode || isButtonMoving) return;
    
    const rect = button.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate distance from center
    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;
    
    // Subtle movement toward cursor (max 10px)
    const moveX = deltaX * 0.15;
    const moveY = deltaY * 0.15;
    
    // Set CSS custom properties (composes with existing transforms)
    button.style.setProperty('--magnetic-x', `${moveX}px`);
    button.style.setProperty('--magnetic-y', `${moveY}px`);
  });
  
  button.addEventListener('mouseleave', () => {
    // Reset magnetic properties when mouse leaves
    if (!impossibleMode && !isButtonMoving) {
      button.style.setProperty('--magnetic-x', '0px');
      button.style.setProperty('--magnetic-y', '0px');
    }
  });
}

// Reset magnetic properties when Impossible Mode is toggled
if (impossibleToggle) {
  impossibleToggle.addEventListener('change', () => {
    if (impossibleMode) {
      // Clear magnetic hover when entering Impossible Mode
      button.style.setProperty('--magnetic-x', '0px');
      button.style.setProperty('--magnetic-y', '0px');
    }
  });
}

// === Keyboard Navigation (Accessibility) ===
document.addEventListener('keydown', (e) => {
  // Prevent if user is typing in an input field
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
    return;
  }
  
  // Space or Enter to click the button
  if (e.key === ' ' || e.key === 'Enter') {
    if (document.activeElement === button || !document.activeElement || document.activeElement === document.body) {
      e.preventDefault();
      button?.click();
    }
  }
  
  // T key to toggle theme selector
  if (e.key === 't' || e.key === 'T') {
    e.preventDefault();
    themeToggle?.click();
  }
  
  // S key to toggle sound panel
  if (e.key === 's' || e.key === 'S') {
    e.preventDefault();
    soundToggle?.click();
  }
  
  // I key to toggle impossible mode
  if (e.key === 'i' || e.key === 'I') {
    e.preventDefault();
    impossibleToggle?.click();
  }
  
  // Escape to close modals
  if (e.key === 'Escape') {
    const themeSelector = document.getElementById('theme-selector');
    if (themeSelector?.classList.contains('show')) {
      themeSelector.classList.remove('show');
    }
    if (soundPanel?.classList.contains('show')) {
      soundPanel.classList.remove('show');
    }
    if (popupContainer?.classList.contains('show')) {
      popupContainer.classList.remove('show');
    }
  }
});
initializeCounter();
initSoundSettings();
