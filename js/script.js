// DOM elements
const button = document.getElementById('useless-button');
const counterDiv = document.getElementById('counter');
const quoteDiv = document.getElementById('quote');
const clickSound = document.getElementById('click-sound');
const failSound = document.getElementById('fail-sound');
// State
let clicks = 0;
let failedClicks = 0;
let userInteracted = false; // unlock audio on first click
const messages = [
  "You are a legend… in another universe.",
  "Clicking skills: unparalleled.",
  "You could be a professional nothing-doer.",
  "Your dedication to nothing is inspiring.",
  "Almost… there… keep clicking!",
  "Warning: excessive clicking may lead to existential thoughts."
];
const failedClickMessages = [
  "Choppy fingers.",
  "My mom's sandal clicks more precise.",
  "As a nothing-doer, you're pretty good.",
  "You're a failing legend.",
  "Bro missed a stationary button 💀",
  "Even the cursor gave up on you.",
  "You’ve achieved the rare 'Click Miss Combo'.",
  "Pathetic reflexes — admirable persistence."
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
// Button dodge behavior
let lastDodgeTime = 0;
button.addEventListener("mouseover", () => {
  const now = Date.now();
  if (now - lastDodgeTime < 150) return; // throttle from 'main'
  lastDodgeTime = now;

  // --- Create smoke/particle trail from 'button-smoke-effect' ---
  for (let i = 0; i < 8; i++) {
    const particle = document.createElement("span");
    particle.classList.add("particle");
    // Random position around the button
    const offsetX = (Math.random() - 0.5) * button.offsetWidth;
    const offsetY = (Math.random() - 0.5) * button.offsetHeight;
    particle.style.left = `${button.offsetLeft + button.offsetWidth / 2 + offsetX}px`;
    particle.style.top = `${button.offsetTop + button.offsetHeight / 2 + offsetY}px`;
    document.body.appendChild(particle);
    // Remove after animation
    setTimeout(() => {
      particle.remove();
    }, 1000);
  }

  // --- Dodge logic and button move (combined) ---
  if (Math.random() < 0.9) { // Only dodge 90% of the time (from 'main')
    failedClicks++; // from 'main'
    const randomFail = failedClickMessages[Math.floor(Math.random() * failedClickMessages.length)]; // from 'main'
    updateCounter(`— ${randomFail}`); // from 'main'

    // Play fail sound every 10 fails (from 'main')
    if (failedClicks % 10 === 0 && userInteracted) {
      failSound.currentTime = 0;
      failSound.play().catch(() => {});
    }

    // Calculate new position
    const maxX = window.innerWidth - button.offsetWidth;
    const maxY = window.innerHeight - button.offsetHeight;
    const randomX = Math.floor(Math.random() * maxX);
    const randomY = Math.floor(Math.random() * maxY);

    // Apply new position
    button.style.position = "absolute";
    button.style.left = `${randomX}px`;
    button.style.top = `${randomY}px`;

    // Shake animation (from 'main')
    button.style.transform = "rotate(5deg)";
    setTimeout(() => {
      button.style.transform = "rotate(0deg)";
    }, 100);
  }
});
// --- Random background color changer ---
function changeBackgroundColor() {
  const color = getRandomColor(); // reuse your existing getRandomColor() function
  document.body.style.backgroundColor = color;
}
// Change every 5 seconds (adjust as you like)
setInterval(changeBackgroundColor, 5000);
// --- Time Spent Doing Nothing Timer ---
const timerDiv = document.getElementById("timer");
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
  // optional little blink effect every 5s for fun
  if (seconds % 5 === 0) {
    timerDiv.classList.add("fade");
    setTimeout(() => timerDiv.classList.remove("fade"), 400);
  }
}
// start timer on page load
window.addEventListener("load", () => {
  setInterval(updateTimer, 1000);
});