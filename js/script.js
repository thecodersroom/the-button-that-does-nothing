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
