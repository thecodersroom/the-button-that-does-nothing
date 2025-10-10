// DOM elements
const button = document.getElementById('useless-button');
const counterDiv = document.getElementById('counter');
const clickSound = document.getElementById('click-sound');
const failSound = document.getElementById('fail-sound');

// State
let clicks = 0;
let failedClicks = 0;

const messages = [
  "You are a legend… in another universe.",
  "Clicking skills: unparalleled.",
  "You could be a professional nothing-doer.",
  "Your dedication to nothing is inspiring.",
  "Almost… there… keep clicking!"
];

const failedClickMessages = [
  "Choppy fingers",
  "My mom's sandal clicks more precise",
  "As a nothing-doer, you're pretty good",
  "You're a failing legend"
];

// Utility: random color
function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// Update display
function updateCounter(extraText = "") {
  counterDiv.textContent = `Clicks: ${clicks} | Failed clicks: ${failedClicks} ${extraText}`;
}

// Button click handler
button.addEventListener('click', () => {
  clicks++;
  let message = "";
  if (clicks % 5 === 0) {
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    message = `— ${randomMessage}`;
  }
  updateCounter(message);
  button.style.backgroundColor = getRandomColor();

  // Tiny scale animation
  button.style.transform = 'scale(1.2)';
  setTimeout(() => {
    button.style.transform = 'scale(1)';
  }, 100);

  clickSound.currentTime = 0;
  clickSound.play();
});

// Button dodge behavior 
let lastDodgeTime = 0;
button.addEventListener('mouseover', () => {
  const now = Date.now();
  if (now - lastDodgeTime < 150) return; 
  lastDodgeTime = now;

  if (Math.random() < 0.9) { // 90% chance to dodge
    failedClicks++;
    const randomFail = failedClickMessages[Math.floor(Math.random() * failedClickMessages.length)];

    // Update counter
    updateCounter(`— ${randomFail}`);

    // Play fail sound every 10 fails
    if (failedClicks % 10 === 0) {
      failSound.currentTime = 0;
      failSound.play();
    }

    const maxX = window.innerWidth - button.offsetWidth;
    const maxY = window.innerHeight - button.offsetHeight;
    const randomX = Math.floor(Math.random() * maxX);
    const randomY = Math.floor(Math.random() * maxY);

    button.style.position = 'absolute';
    button.style.left = `${randomX}px`;
    button.style.top = `${randomY}px`;

    // Little shake/rotate animation
    button.style.transform = 'rotate(5deg)';
    setTimeout(() => {
      button.style.transform = 'rotate(0deg)';
    }, 100);
  }
});
