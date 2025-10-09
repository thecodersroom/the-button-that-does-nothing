// DOM elements
const button = document.getElementById("useless-button");
const counterDiv = document.getElementById("counter");
const clickSound = document.getElementById("click-sound");

// Disable tab navigation for counter
counterDiv.setAttribute("tabindex", "-1");

// State
let clicks = 0;
const messages = [
  "You are a legend… in another universe.",
  "Clicking skills: unparalleled.",
  "You could be a professional nothing-doer.",
  "Your dedication to nothing is inspiring.",
  "Almost… there… keep clicking!",
];

let isCheating = false; // flag to track cheat message state

// Utility: random color
function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// --- Detect Tab-focus (cheating attempt) ---
button.addEventListener("focus", (event) => {
  if (event.detail === 0) {
    // Focus via keyboard, not mouse
    isCheating = true;
    counterDiv.textContent =
      "You're cheating! Try clicking with your mouse 😜 try again you can do it ";
    button.blur(); // remove focus immediately
  }
});

// --- Restore counter text when mouse moves again ---
document.addEventListener("mousemove", () => {
  if (isCheating) {
    counterDiv.textContent = `Clicks: ${clicks}`;
    isCheating = false;
  }
});

// --- Button click handler ---
button.addEventListener("click", () => {
  clicks++;
  counterDiv.textContent = `Clicks: ${clicks}`;

  // Random motivational message every 5 clicks
  if (clicks % 5 === 0) {
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    counterDiv.textContent += ` — ${randomMessage}`;
  }

  // Random button color
  button.style.backgroundColor = getRandomColor();

  // Tiny scale animation
  button.style.transform = "scale(1.2)";
  setTimeout(() => {
    button.style.transform = "scale(1)";
  }, 100);

  // Play click sound
  clickSound.currentTime = 0;
  clickSound.play();
});

// --- Button dodge behavior ---
button.addEventListener("mouseover", () => {
  const maxX = window.innerWidth - button.offsetWidth;
  const maxY = window.innerHeight - button.offsetHeight;
  const randomX = Math.floor(Math.random() * maxX);
  const randomY = Math.floor(Math.random() * maxY);
  button.style.position = "absolute";
  button.style.left = `${randomX}px`;
  button.style.top = `${randomY}px`;
});
