document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("useless-button");
  if (!button) return;

  const now = new Date();
  const hour = now.getHours();
  const month = now.getMonth(); 

  button.classList.remove("day-theme", "night-theme", "halloween-theme", "winter-theme");

  let theme = "";

  if (month === 9) {
    theme = "halloween-theme";
  }
  else if (month === 11 || month === 0 || month === 1) {
    theme = "winter-theme";
  }
  else if (hour >= 6 && hour < 18) {
    theme = "day-theme";
  } else {
    theme = "night-theme";
  }

  button.classList.add(theme);
  console.log(`🎨 Button theme applied: ${theme}`);
});
