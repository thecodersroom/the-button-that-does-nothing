document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("useless-button");
  const themesGrid = document.getElementById("themes-grid");
  if (!button || !themesGrid) return;

  let clickCount = parseInt(localStorage.getItem("clickCount") || "0");
  let unlockedThemes = JSON.parse(localStorage.getItem("unlockedThemes") || "[]");

  const allThemes = [
    { name: "Sunset Glow", color: "linear-gradient(135deg, #ff9966, #ff5e62)" },
    { name: "Ocean Breeze", color: "linear-gradient(135deg, #36d1dc, #5b86e5)" },
    { name: "Cyber Neon", color: "linear-gradient(135deg, #00c6ff, #0072ff)" },
    { name: "Galaxy Drift", color: "linear-gradient(135deg, #654ea3, #eaafc8)" },
    { name: "Golden Mirage", color: "linear-gradient(135deg, #f7971e, #ffd200)" },
  ];

  const milestones = [5, 10, 300, 600, 1000];

  const popup = document.createElement("div");
  popup.id = "theme-unlock-popup";
  popup.className = "theme-unlock-popup";
  document.body.appendChild(popup);

  function showPopup(themeName) {
    popup.textContent = `🎨 New Theme Unlocked: ${themeName}!`;
    popup.classList.add("show");
    setTimeout(() => popup.classList.remove("show"), 4000);
  }

  function unlockTheme(clicks) {
    const index = milestones.indexOf(clicks);
    if (index !== -1) {
      const theme = allThemes[index];
      if (!unlockedThemes.includes(theme.name)) {
        unlockedThemes.push(theme.name);
        localStorage.setItem("unlockedThemes", JSON.stringify(unlockedThemes));
        showPopup(theme.name);
        renderThemes();
      }
    }
  }

  function renderThemes() {
    themesGrid.innerHTML = "";
    allThemes.forEach(theme => {
      const locked = !unlockedThemes.includes(theme.name);
      const div = document.createElement("div");
      div.className = `theme-item ${locked ? "locked" : "unlocked"}`;
      div.style.background = theme.color;
      div.textContent = locked ? "🔒 " + theme.name : theme.name;

      if (!locked) {
        div.addEventListener("click", () => {
          document.body.style.background = theme.color;
          localStorage.setItem("currentTheme", theme.name);
        });
      }

      themesGrid.appendChild(div);
    });
  }
  renderThemes();

  button.addEventListener("click", () => {
    clickCount++;
    localStorage.setItem("clickCount", clickCount);
    unlockTheme(clickCount);
  });
});
