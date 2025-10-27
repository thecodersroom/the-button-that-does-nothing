// keron start
// === NOTHING SHOP SCRIPT ===
import { 
  getCurrentCoins, 
  setCurrentCoins, 
  getCoinDisplayElement,
  updateCoinDisplay as updateCoinDisplayFromMain,
  createConfettiForShop as createConfetti,
  createParticlesForShop as createParticles
} from './script.js';

let nothingCoins = getCurrentCoins();
let coinCountDisplay = getCoinDisplayElement();
// keron end

const shopItems = [
  {
    id: 'shinier-nothing',
    name: '✨ Shinier Nothing',
    cost: 50,
    description: 'Makes your nothing slightly shinier.',
    effect: () => addVisualGlow(),
    persistent: true,
    activate: () => {
      document.body.classList.add('shinier-nothing');
      document.documentElement.style.setProperty('--glow-intensity', '1.5');
    },
    deactivate: () => {
      document.body.classList.remove('shinier-nothing');
      document.documentElement.style.setProperty('--glow-intensity', '1');
    }
  },
  {
    id: 'dancing-duck',
    name: '🦆 Dancing Duck',
    cost: 150,
    description: 'Adds a joyful dancing duck at the center.',
    effect: () => addDancingDuck(),
    persistent: true,
    activate: () => {
      if (!document.querySelector('.dancing-duck')) {
        addDancingDuck();
      }
    },
    deactivate: () => {
      const duck = document.querySelector('.dancing-duck');
      if (duck) duck.remove();
    }
  },
  {
    id: 'particle-burst',
    name: '💥 Particle Burst',
    cost: 200,
    description: 'Triggers a colorful particle explosion every click.',
    effect: () => enableParticleBurst(),
    persistent: true,
    activate: () => {
      document.body.dataset.particleBurst = 'true';
      enableParticleBurst();
    },
    deactivate: () => {
      document.body.dataset.particleBurst = 'false';
    }
  },
  {
    id: 'ambient-nothing',
    name: '🎵 Ambient Nothing',
    cost: 300,
    description: 'Adds a calming ambient hum of… nothing.',
    effect: () => playAmbientNothing(),
    persistent: true,
    activate: () => {
      if (!window.ambientSound) {
        window.ambientSound = new Audio('audio/ambient-nothing.mp3');
        window.ambientSound.loop = true;
        window.ambientSound.volume = 0.2;
        window.ambientSound.play().catch(() => {});
      }
    },
    deactivate: () => {
      if (window.ambientSound) {
        window.ambientSound.pause();
        window.ambientSound = null;
      }
    }
  },
  {
    id: 'confetti-mode',
    name: '🎉 Confetti Mode',
    cost: 500,
    description: 'Every purchase rains confetti of pure emptiness.',
    effect: () => createConfetti(),
    persistent: false, // This is a one-time effect
    activate: () => createConfetti(),
    deactivate: () => {} // No need to deactivate one-time effects
  },
];

const ownedItems = JSON.parse(localStorage.getItem('ownedNothingItems')) || [];

function renderShop() {
  const container = document.getElementById('shop-items');
  if (!container) return;
  
  container.innerHTML = '';
  nothingCoins = getCurrentCoins(); // Refresh coins from main script
  shopItems.forEach(item => {
    const owned = ownedItems.includes(item.id);
    const affordable = nothingCoins >= item.cost;
    const div = document.createElement('div');
    div.className = `shop-item ${owned ? 'owned' : ''} ${affordable ? 'affordable' : ''}`;
    
    div.innerHTML = `
      <h3>${item.name}</h3>
      <p>${item.description}</p>
      <p class="item-cost ${owned ? 'owned' : affordable ? 'affordable' : 'expensive'}">
        ${owned ? '✅ Purchased' : `💰 ${item.cost} Nothing Coins`}
      </p>
      <button class="${owned ? 'owned' : affordable ? 'affordable' : 'expensive'}" ${owned ? 'disabled' : ''}>
        ${owned ? '✨ Owned' : affordable ? '🛍️ Buy' : '💔 Too Expensive'}
      </button>
    `;
    
    const btn = div.querySelector('button');
    if (!owned) {
      btn.addEventListener('click', async () => {
        try {
          await purchaseItem(item);
          // Add purchase animation
          div.classList.add('purchase-animation');
          setTimeout(() => div.classList.remove('purchase-animation'), 1000);
        } catch (err) {
          console.error('Purchase failed:', err);
        }
      });
    }
    
    // Add hover preview if not owned
    if (!owned && item.activate && item.deactivate) {
      div.addEventListener('mouseenter', () => {
        if (!div.dataset.previewing) {
          div.dataset.previewing = 'true';
          item.activate();
        }
      });
      
      div.addEventListener('mouseleave', () => {
        if (div.dataset.previewing) {
          div.dataset.previewing = 'false';
          if (!ownedItems.includes(item.id)) {
            item.deactivate();
          }
        }
      });
    }
    
    container.appendChild(div);
  });
}

async function purchaseItem(item) {
  nothingCoins = getCurrentCoins(); // Get fresh coin count
  if (nothingCoins < item.cost || ownedItems.includes(item.id)) return;
  
  try {
    // Deduct coins using the exported function
    setCurrentCoins(nothingCoins - item.cost);
    nothingCoins = getCurrentCoins(); // Update local variable
    
    // Update display immediately
    if (coinCountDisplay) {
      coinCountDisplay.textContent = nothingCoins;
      coinCountDisplay.classList.add('coin-update');
      setTimeout(() => coinCountDisplay.classList.remove('coin-update'), 500);
    }
    
    // Add to owned items
    ownedItems.push(item.id);
    localStorage.setItem('ownedNothingItems', JSON.stringify(ownedItems));
    
    // Apply the effect
    if (item.effect) {
      await Promise.resolve(item.effect());
    }
    
    // For persistent items, activate them
    if (item.persistent && item.activate) {
      item.activate();
    }
    
    // Save the active state for persistent items
    if (item.persistent) {
      const activeItems = JSON.parse(localStorage.getItem('activeShopItems') || '[]');
      if (!activeItems.includes(item.id)) {
        activeItems.push(item.id);
        localStorage.setItem('activeShopItems', JSON.stringify(activeItems));
      }
    }
    
    // Show purchase celebration
    createConfetti(); // This now uses the imported function
    
    // Show success message
    showPurchaseNotification(item.name);
    
    // Update shop display
    renderShop();
    
  } catch (error) {
    console.error('Purchase failed:', error);
    // Rollback if something fails
    nothingCoins = getCurrentCoins();
    setCurrentCoins(nothingCoins + item.cost);
    nothingCoins = getCurrentCoins();
    throw error;
  }
}

function showPurchaseNotification(itemName) {
  const notification = document.createElement('div');
  notification.className = 'notification-popup';
  notification.textContent = `🎉 Successfully purchased ${itemName}!`;
  document.body.appendChild(notification);
  
  // Trigger animation
  setTimeout(() => notification.classList.add('show'), 10);
  
  // Remove after animation
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
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
  // Note: Particle burst effect is now handled globally in script.js
  // This is just for the shop preview
}

function playAmbientNothing() {
  const audio = new Audio('audio/ambient-nothing.mp3');
  audio.loop = true;
  audio.volume = 0.2;
  audio.play().catch(() => {});
}

// Initialize shop and restore purchases
function initializeShop() {
  // Load owned items
  const savedItems = localStorage.getItem('ownedNothingItems');
  if (savedItems) {
    ownedItems.length = 0;
    ownedItems.push(...JSON.parse(savedItems));
  }
  
  // Restore active persistent effects
  const activeItems = JSON.parse(localStorage.getItem('activeShopItems') || '[]');
  activeItems.forEach(itemId => {
    const item = shopItems.find(i => i.id === itemId);
    if (item && item.persistent && item.activate) {
      item.activate();
    }
  });
  
  // Initialize display
  renderShop();
}

// Reset shop state
function resetShop() {
  // Deactivate all persistent effects
  shopItems.forEach(item => {
    if (item.persistent && item.deactivate) {
      item.deactivate();
    }
  });
  
  // Clear storage
  localStorage.removeItem('ownedNothingItems');
  localStorage.removeItem('activeShopItems');
  
  // Reset arrays
  ownedItems.length = 0;
  
  // Update display
  renderShop();
}

// Initialize
document.addEventListener('DOMContentLoaded', initializeShop);

// Add reset handler if reset button exists
if (document.getElementById('reset-score-button')) {
  document.getElementById('reset-score-button').addEventListener('click', resetShop);
}



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
