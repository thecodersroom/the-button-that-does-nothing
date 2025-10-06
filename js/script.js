// Get references to DOM elements
const button = document.getElementById('useless-button');
const counterDiv = document.getElementById('counter');

// Initialize click count
let clicks = 0;

// Event listener for the button
button.addEventListener('click', () => {
  clicks++;
  counterDiv.textContent = `Clicks: ${clicks}`;

  // Tiny animation for fun
  button.style.transform = 'scale(1.2)';
  setTimeout(() => {
    button.style.transform = 'scale(1)';
  }, 100);
});


// Button dodge on hover
button.addEventListener('mouseover', () => {
  const maxX = window.innerWidth - button.offsetWidth;
  const maxY = window.innerHeight - button.offsetHeight;
  const randomX = Math.floor(Math.random() * maxX);
  const randomY = Math.floor(Math.random() * maxY);
  button.style.position = 'absolute';
  button.style.left = `${randomX}px`;
  button.style.top = `${randomY}px`;
});

const messages = [
  "You are a legend… in another universe.",
  "Clicking skills: unparalleled.",
  "You could be a professional nothing-doer.",
  "Your dedication to nothing is inspiring.",
  "Almost… there… keep clicking!"
];

button.addEventListener('click', () => {
  clicks++;
  counterDiv.textContent = `Clicks: ${clicks}`;

  if (clicks % 5 === 0) {
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    counterDiv.textContent += ` — ${randomMessage}`;
  }
});

