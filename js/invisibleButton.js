const eggButton = document.getElementById("hidden-button");
const card = document.getElementById("easter-card");

function placeEggRandomly() {
  const eggWidth = 75;
  const eggHeight = 100;
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const randomX = Math.random() * (screenWidth - eggWidth);
  const randomY = Math.random() * (screenHeight - eggHeight - 50);
  eggButton.style.left = `${randomX}px`;
  eggButton.style.top = `${randomY}px`;
}

function getBadgeInfo(count) {
  if (count === 1) return { name: "Egg Finder", icon: "🥚", css: "egg-finder" };
  if (count === 2) return { name: "Double Discover", icon: "🥯", css: "double-discover" };
  if (count === 3) return { name: "Nothing Seeker", icon: "🔍", css: "nothing-seeker" };
  if (count === 4) return { name: "Button Ninja", icon: "🥷", css: "button-ninja" };
  return { name: "Ultimate Clicker", icon: "🚀", css: "ultimate-clicker" };
}

function showCard() {
  let eggClickCount = Number(localStorage.getItem('eggClickCount') || 0);
  eggClickCount++;
  localStorage.setItem('eggClickCount', eggClickCount);

  const badgeData = getBadgeInfo(eggClickCount <= 5 ? eggClickCount : 5);
  const badgeBox = card.querySelector('#badge-box');
  if (badgeBox) {
    badgeBox.innerHTML = `
      <div class="easter-badge ${badgeData.css}">
        <div class="badge-icon">${badgeData.icon}</div>
        <div class="badge-name">${badgeData.name}</div>
        <div class="badge-count">Eggs Found : ${eggClickCount}${eggClickCount > 5 ? '+' : ''}</div>
      </div>
    `;
  }

  card.style.display = "block";
  eggButton.style.display = "block";

  setTimeout(() => {
    card.style.display = "none";
    eggButton.style.display = "none";
    placeEggRandomly();
  }, 2500);
}

window.addEventListener("load", placeEggRandomly);
window.addEventListener("resize", placeEggRandomly);
eggButton.addEventListener("click", showCard);
