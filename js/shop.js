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
    category: null, // Stackable effect
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
    category: 'character', // Mutually exclusive category
    activate: () => {
      if (!document.querySelector('.dancing-duck')) {
        addDancingDuck();
      }
    },
    deactivate: () => {
      const duck = document.querySelector('.dancing-duck');
      if (duck) duck.remove();
      // Also remove any other characters
      const chars = document.querySelectorAll('.shop-character');
      chars.forEach(char => char.remove());
    }
  },
  {
    id: 'particle-burst',
    name: '💥 Particle Burst',
    cost: 200,
    description: 'Triggers a colorful particle explosion every click.',
    effect: () => enableParticleBurst(),
    persistent: true,
    category: null, // Stackable effect
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
    category: null, // Stackable effect
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
    category: null,
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
    // If this item has a category (mutually exclusive items)
    if (item.category) {
      // Find other items in the same category that are currently active
      const activeItems = JSON.parse(localStorage.getItem('activeShopItems') || '[]');
      const activeItemsArray = [...activeItems];
      
      // Deactivate other items in the same category
      for (const activeItemId of activeItemsArray) {
        const activeItem = shopItems.find(i => i.id === activeItemId);
        if (activeItem && activeItem.category === item.category && activeItem.persistent && activeItem.deactivate) {
          activeItem.deactivate();
          // Remove from active items list
          const index = activeItems.indexOf(activeItemId);
          if (index > -1) {
            activeItems.splice(index, 1);
          }
        }
      }
      
      // Save updated active items
      localStorage.setItem('activeShopItems', JSON.stringify(activeItems));
    }
    
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
  // Remove any existing character items first
  const existingCharacters = document.querySelectorAll('.shop-character');
  existingCharacters.forEach(char => char.remove());
  
  const duck = document.createElement('img');
  duck.src = 'image/animals.gif';
  duck.className = 'dancing-duck shop-character';
  duck.style.position = 'absolute';
  duck.style.left = '50%';
  duck.style.top = '50%';
  duck.style.transform = 'translate(-50%, -50%)';
  duck.style.zIndex = 2000;
  duck.style.width = '100px';
  duck.alt = 'Dancing Duck';
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
  
  // Restore active persistent effects, but only if they are owned
  const activeItems = JSON.parse(localStorage.getItem('activeShopItems') || '[]');
  const validActiveItems = [];
  
  activeItems.forEach(itemId => {
    // Only activate if the item is actually owned
    if (ownedItems.includes(itemId)) {
      const item = shopItems.find(i => i.id === itemId);
      if (item && item.persistent && item.activate) {
        item.activate();
        validActiveItems.push(itemId);
      }
    }
  });
  
  // Update activeItems list to only include valid owned items
  if (validActiveItems.length !== activeItems.length) {
    localStorage.setItem('activeShopItems', JSON.stringify(validActiveItems));
  }
  
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

// Export function to refresh shop when coin balance changes
export function refreshShop() {
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
    
    // Refresh shop to show latest coin balance
    renderShop();

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
