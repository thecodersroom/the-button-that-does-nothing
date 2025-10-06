// DOM elements
const button = document.getElementById('useless-button');
const counterDiv = document.getElementById('counter');
const clickSound = document.getElementById('click-sound');

// State
let clicks = 0;
const messages = [
  "You are a legend… in another universe.",
  "Clicking skills: unparalleled.",
  "You could be a professional nothing-doer.",
  "Your dedication to nothing is inspiring.",
  "Almost… there… keep clicking!"
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

// Button click handler
button.addEventListener('click', () => {
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
  button.style.transform = 'scale(1.2)';
  setTimeout(() => {
    button.style.transform = 'scale(1)';
  }, 100);

  // Play click sound
  clickSound.currentTime = 0; // restart sound if clicked quickly
  clickSound.play();
});

// Button dodge behavior
button.addEventListener('mouseover', () => {
  const maxX = window.innerWidth - button.offsetWidth;
  const maxY = window.innerHeight - button.offsetHeight;
  const randomX = Math.floor(Math.random() * maxX);
  const randomY = Math.floor(Math.random() * maxY);
  button.style.position = 'absolute';
  button.style.left = `${randomX}px`;
  button.style.top = `${randomY}px`;
});
