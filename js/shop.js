// === NOTHING SHOP SCRIPT ===

const shopItems = [
  {
    id: 'shinier-nothing',
    name: '✨ Shinier Nothing',
    cost: 50,
    description: 'Makes your nothing slightly shinier.',
    effect: () => addVisualGlow(),
  },
  {
    id: 'dancing-duck',
    name: '🦆 Dancing Duck',
    cost: 150,
    description: 'Adds a joyful dancing duck at the center.',
    effect: () => addDancingDuck(),
  },
  {
    id: 'particle-burst',
    name: '💥 Particle Burst',
    cost: 200,
    description: 'Triggers a colorful particle explosion every click.',
    effect: () => enableParticleBurst(),
  },
  {
    id: 'ambient-nothing',
    name: '🎵 Ambient Nothing',
    cost: 300,
    description: 'Adds a calming ambient hum of… nothing.',
    effect: () => playAmbientNothing(),
  },
  {
    id: 'confetti-mode',
    name: '🎉 Confetti Mode',
    cost: 500,
    description: 'Every purchase rains confetti of pure emptiness.',
    effect: () => createConfetti(),
  },
];

const ownedItems = JSON.parse(localStorage.getItem('ownedNothingItems')) || [];

function renderShop() {
  const container = document.getElementById('shop-items');
  container.innerHTML = '';
  shopItems.forEach(item => {
    const owned = ownedItems.includes(item.id);
    const affordable = nothingCoins >= item.cost;
    const div = document.createElement('div');
    div.className = 'shop-item';
    div.innerHTML = `
      <h3>${item.name}</h3>
      <p>${item.description}</p>
      <p>💰 ${item.cost} Nothing Coins</p>
      <button ${owned ? 'disabled' : ''}>
        ${owned ? 'Owned' : affordable ? 'Buy' : 'Too Expensive'}
      </button>
    `;
    const btn = div.querySelector('button');
    btn.addEventListener('click', () => purchaseItem(item));
    container.appendChild(div);
  });
}

function purchaseItem(item) {
  if (nothingCoins < item.cost || ownedItems.includes(item.id)) return;
  nothingCoins -= item.cost;
  localStorage.setItem('nothingCoins', nothingCoins);
  ownedItems.push(item.id);
  localStorage.setItem('ownedNothingItems', JSON.stringify(ownedItems));
  if (coinCountDisplay) coinCountDisplay.textContent = nothingCoins;
  item.effect?.();
  renderShop();
  createConfetti();
}

function addVisualGlow() {
  document.body.style.boxShadow = 'inset 0 0 80px rgba(255,255,255,0.1)';
  document.body.style.transition = 'box-shadow 1s ease';
}

function addDancingDuck() {
  if (document.querySelector('.dancing-duck')) return;
  const duck = document.createElement('img');
  duck.src = 'image/dancing-duck.gif';
  duck.className = 'dancing-duck';
  duck.style.position = 'absolute';
  duck.style.left = '50%';
  duck.style.top = '50%';
  duck.style.transform = 'translate(-50%, -50%)';
  duck.style.zIndex = 2000;
  duck.style.width = '100px';
  document.body.appendChild(duck);
}

function enableParticleBurst() {
  document.body.dataset.particleBurst = 'true';
  document.addEventListener('click', e => {
    if (document.body.dataset.particleBurst === 'true') {
      createParticles(e.clientX, e.clientY, 15);
    }
  });
}

function playAmbientNothing() {
  const audio = new Audio('audio/ambient-nothing.mp3');
  audio.loop = true;
  audio.volume = 0.2;
  audio.play().catch(() => {});
}

// Initialize
document.addEventListener('DOMContentLoaded', renderShop);



document.addEventListener("DOMContentLoaded", () => {
  const shop = document.getElementById("nothing-shop");
  const openBtn = document.getElementById("open-shop-btn");
  const closeBtn = document.getElementById("close-shop");

  openBtn.addEventListener("click", () => {
    shop.classList.remove("closed", "closing");
    shop.classList.add("opening");

    setTimeout(() => {
      shop.classList.remove("opening");
      shop.classList.add("open");
    }, 400);
  });

  closeBtn.addEventListener("click", () => {
    shop.classList.add("closing");
    setTimeout(() => {
      shop.classList.remove("open", "opening");
      shop.classList.add("closed");
    }, 350);
  });
});
