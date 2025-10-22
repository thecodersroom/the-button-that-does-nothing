// ========================================
// 🎮 MAIN INTEGRATION SCRIPT
// Combines all features into one cohesive experience
// ========================================

// Initialize all systems
let particleSystem;
let matrixRain;
let gameModeManager;
let powerUpManager;
let challengeManager;
let statsManager;
let themeManager;

// Session stats
let sessionStats = {
  clicks: 0,
  misses: 0,
  combo: 0,
  bestCombo: 0,
  startTime: Date.now()
};

let lastClickTime = 0;
let userInteracted = false;

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  // Initialize canvas systems
  const particleCanvas = document.getElementById('particle-canvas');
  const matrixCanvas = document.getElementById('matrix-canvas');
  
  if (particleCanvas) {
    particleSystem = new ParticleSystem(particleCanvas);
  }
  
  if (matrixCanvas) {
    matrixRain = new MatrixRain(matrixCanvas);
    matrixRain.start();
  }
  
  // Initialize managers
  gameModeManager = new GameModeManager();
  powerUpManager = new PowerUpManager();
  challengeManager = new ChallengeManager();
  statsManager = new StatsManager();
  themeManager = new ThemeManager();
  
  // Setup UI
  setupModeButtons();
  setupThemeButtons();
  setupFloatingButtons();
  setupPowerUps();
  setupChallenges();
  setupButton();
  setupKonamiCode();
  
  // Update displays
  updateStatsDisplay();
  updateUI();
  
  // Start update loop
  setInterval(updateGameLoop, 100);
});

// Setup mode selector buttons
function setupModeButtons() {
  const modeButtons = document.querySelectorAll('.mode-btn');
  modeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      modeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const mode = btn.getAttribute('data-mode');
      gameModeManager.setMode(mode);
      showNotification(`${mode.toUpperCase()} MODE activated!`);
    });
  });
}

// Setup theme selector buttons
function setupThemeButtons() {
  const themeButtons = document.querySelectorAll('.theme-btn');
  themeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      themeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const theme = btn.getAttribute('data-theme');
      themeManager.applyTheme(theme);
      showNotification(`${theme.toUpperCase()} theme activated!`);
    });
  });
  
  // Set active theme button
  const currentTheme = themeManager.getTheme();
  document.querySelector(`[data-theme="${currentTheme}"]`)?.classList.add('active');
}

// Setup floating panel buttons
function setupFloatingButtons() {
  const statsToggle = document.getElementById('stats-toggle');
  const powerupsToggle = document.getElementById('powerups-toggle');
  const challengeToggle = document.getElementById('challenge-toggle');
  
  const statsPanel = document.getElementById('stats-panel');
  const powerupsPanel = document.getElementById('powerups-panel');
  const challengePanel = document.getElementById('challenge-panel');
  
  statsToggle?.addEventListener('click', () => {
    statsPanel.classList.toggle('show');
    powerupsPanel.classList.remove('show');
    challengePanel.classList.remove('show');
    updateStatsDisplay();
  });
  
  powerupsToggle?.addEventListener('click', () => {
    powerupsPanel.classList.toggle('show');
    statsPanel.classList.remove('show');
    challengePanel.classList.remove('show');
  });
  
  challengeToggle?.addEventListener('click', () => {
    challengePanel.classList.toggle('show');
    statsPanel.classList.remove('show');
    powerupsPanel.classList.remove('show');
  });
  
  // Close panel buttons
  document.querySelectorAll('.close-panel').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.side-panel').classList.remove('show');
    });
  });
}

// Setup power-ups
function setupPowerUps() {
  document.querySelectorAll('.powerup-activate').forEach(btn => {
    btn.addEventListener('click', () => {
      const powerupName = btn.closest('.powerup-item').getAttribute('data-powerup');
      const cost = parseInt(btn.getAttribute('data-cost'));
      
      if (sessionStats.clicks >= cost) {
        const button = document.getElementById('useless-button');
        const success = powerUpManager.activate(powerupName, button, updateUI);
        
        if (success) {
          sessionStats.clicks -= cost;
          updateClickDisplay();
          showNotification(`💫 ${powerUpManager.powerUps[powerupName].name} activated!`);
          playSound(document.getElementById('powerup-sound'));
        }
      } else {
        showNotification(`❌ Need ${cost} clicks to activate!`);
      }
    });
  });
  
  // Reset stats button
  document.getElementById('reset-stats')?.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset all statistics?')) {
      statsManager.reset();
      updateStatsDisplay();
      showNotification('📊 Statistics reset!');
    }
  });
}

// Setup challenges
function setupChallenges() {
  document.querySelectorAll('.challenge-start').forEach(btn => {
    btn.addEventListener('click', () => {
      const challengeName = btn.getAttribute('data-challenge');
      const challenge = challengeManager.start(challengeName);
      
      if (challenge) {
        challenge.startClicks = sessionStats.clicks;
        updateChallengeDisplay();
        showNotification(`🎯 Challenge started: ${challenge.name}`);
      }
    });
  });
}

// Setup main button
function setupButton() {
  const button = document.getElementById('useless-button');
  if (!button) return;
  
  // Click handler
  button.addEventListener('click', (e) => {
    e.stopPropagation();
    handleButtonClick();
  });
  
  // Hover handler for dodging
  button.addEventListener('mouseover', () => {
    handleButtonDodge();
  });
  
  // Mouse move handler for advanced dodging
  document.addEventListener('mousemove', (e) => {
    handleMouseMove(e);
  });
}

// Handle button click
function handleButtonClick() {
  sessionStats.clicks++;
  
  // Update combo
  const now = Date.now();
  if (now - lastClickTime < 500) {
    sessionStats.combo++;
    if (sessionStats.combo > sessionStats.bestCombo) {
      sessionStats.bestCombo = sessionStats.combo;
    }
  } else {
    sessionStats.combo = 1;
  }
  lastClickTime = now;
  
  // Create particles
  const button = document.getElementById('useless-button');
  const rect = button.getBoundingClientRect();
  if (particleSystem) {
    for (let i = 0; i < 20; i++) {
      particleSystem.createParticle(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2,
        `hsl(${Math.random() * 360}, 100%, 60%)`
      );
    }
  }
  
  // Play sound
  playSound(document.getElementById('click-sound'));
  
  // Animate button
  animateButton();
  
  // Update displays
  updateClickDisplay();
  updateUI();
  
  // Check challenge progress
  if (challengeManager.getActive()) {
    const result = challengeManager.update(sessionStats);
    if (result?.status === 'completed') {
      sessionStats.clicks += result.reward;
      showNotification(`🏆 Challenge completed! +${result.reward} bonus clicks!`);
      playSound(document.getElementById('achievement-sound'));
      challengeManager.activeChallenge = null;
      updateChallengeDisplay();
    } else if (result?.status === 'failed') {
      showNotification(`😢 Challenge failed! Try again!`);
      updateChallengeDisplay();
    } else {
      updateChallengeDisplay();
    }
  }
  
  // Check for milestones
  checkMilestones();
  
  // Move button
  moveButton();
}

// Handle button dodge
function handleButtonDodge() {
  const mode = gameModeManager.getCurrentMode();
  const powerUpEffects = powerUpManager.applyEffects();
  
  // Shield prevents dodging
  if (powerUpEffects.dodgeDisabled) return;
  
  // Magnet attracts button to cursor
  if (powerUpEffects.magnetActive) return;
  
  // Check dodge chance
  if (Math.random() < mode.dodgeChance) {
    sessionStats.misses++;
    updateClickDisplay();
    playSound(document.getElementById('fail-sound'));
    moveButton();
  }
}

// Handle mouse movement (for impossible/god modes)
function handleMouseMove(e) {
  const mode = gameModeManager.getCurrentMode();
  if (!mode.mouseDodge) return;
  
  const button = document.getElementById('useless-button');
  if (!button) return;
  
  const powerUpEffects = powerUpManager.applyEffects();
  if (powerUpEffects.dodgeDisabled) return;
  
  // Magnet effect
  if (powerUpEffects.magnetActive) {
    const rect = button.getBoundingClientRect();
    const buttonX = rect.left + rect.width / 2;
    const buttonY = rect.top + rect.height / 2;
    
    const dx = e.clientX - buttonX;
    const dy = e.clientY - buttonY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < 300) {
      const moveX = dx * 0.1;
      const moveY = dy * 0.1;
      
      button.style.transform = `translate(${moveX}px, ${moveY}px) scale(${powerUpEffects.totalSizeMult})`;
    }
    return;
  }
  
  // Normal dodge
  const rect = button.getBoundingClientRect();
  const buttonX = rect.left + rect.width / 2;
  const buttonY = rect.top + rect.height / 2;
  
  const dx = e.clientX - buttonX;
  const dy = e.clientY - buttonY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  if (distance < (mode.dangerZone || 200)) {
    if (Math.random() < 0.3) {
      moveButton();
    }
  }
}

// Move button to random position
function moveButton() {
  const button = document.getElementById('useless-button');
  if (!button) return;
  
  const container = button.parentElement;
  const containerRect = container.getBoundingClientRect();
  
  const maxX = containerRect.width - button.offsetWidth - 20;
  const maxY = containerRect.height - button.offsetHeight - 20;
  
  const randomX = Math.random() * maxX;
  const randomY = Math.random() * maxY;
  
  button.style.position = 'absolute';
  button.style.left = randomX + 'px';
  button.style.top = randomY + 'px';
  
  // Apply size from power-ups
  const powerUpEffects = powerUpManager.applyEffects();
  if (powerUpEffects.totalSizeMult !== 1) {
    button.style.transform = `scale(${powerUpEffects.totalSizeMult})`;
  }
}

// Animate button on click
function animateButton() {
  const button = document.getElementById('useless-button');
  if (!button) return;
  
  button.style.animation = 'none';
  setTimeout(() => {
    button.style.animation = '';
  }, 10);
  
  // Random color
  const hue = Math.random() * 360;
  button.style.background = `linear-gradient(135deg, hsl(${hue}, 80%, 60%), hsl(${hue + 30}, 80%, 70%))`;
}

// Update click display
function updateClickDisplay() {
  document.getElementById('click-count').textContent = sessionStats.clicks;
  document.getElementById('miss-count').textContent = sessionStats.misses;
  
  const total = sessionStats.clicks + sessionStats.misses;
  const accuracy = total > 0 ? (sessionStats.clicks / total * 100).toFixed(1) : 100;
  document.getElementById('accuracy').textContent = accuracy + '%';
  
  document.getElementById('combo-display').textContent = sessionStats.combo + 'x';
  
  // Update progress bar
  const nextMilestone = getNextMilestone();
  if (nextMilestone) {
    const progress = (sessionStats.clicks / nextMilestone) * 100;
    document.getElementById('progress-fill').style.width = Math.min(progress, 100) + '%';
  }
}

// Update UI (power-ups, etc.)
function updateUI() {
  const activePowerups = document.getElementById('active-powerups');
  if (!activePowerups) return;
  
  activePowerups.innerHTML = '';
  
  powerUpManager.getActive().forEach(powerUp => {
    const timeLeft = Math.ceil((powerUp.endTime - Date.now()) / 1000);
    const div = document.createElement('div');
    div.className = 'active-powerup';
    div.innerHTML = `${powerUp.icon} ${powerUp.name} (${timeLeft}s)`;
    activePowerups.appendChild(div);
  });
  
  // Update power-up buttons
  document.querySelectorAll('.powerup-activate').forEach(btn => {
    const cost = parseInt(btn.getAttribute('data-cost'));
    btn.disabled = sessionStats.clicks < cost;
  });
}

// Update stats display
function updateStatsDisplay() {
  const stats = statsManager.getStats();
  
  document.getElementById('total-clicks-stat').textContent = stats.totalClicks;
  document.getElementById('total-misses-stat').textContent = stats.totalMisses;
  document.getElementById('best-combo-stat').textContent = stats.bestCombo;
  document.getElementById('high-score-stat').textContent = stats.highScore;
  
  const elapsed = Math.floor((Date.now() - sessionStats.startTime) / 1000);
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  document.getElementById('time-played-stat').textContent = 
    `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
  const cpm = minutes > 0 ? Math.round(sessionStats.clicks / minutes) : 0;
  document.getElementById('cpm-stat').textContent = cpm;
  
  // Update leaderboard
  const leaderboardList = document.getElementById('leaderboard-list');
  if (leaderboardList && stats.leaderboard.length > 0) {
    leaderboardList.innerHTML = stats.leaderboard
      .map((entry, i) => `<li>${entry.score} clicks - ${entry.name}</li>`)
      .join('');
  }
}

// Update challenge display
function updateChallengeDisplay() {
  const activeChallenge = challengeManager.getActive();
  const display = document.getElementById('active-challenge');
  
  if (!display) return;
  
  if (!activeChallenge) {
    display.innerHTML = '<p>No active challenge</p>';
    return;
  }
  
  let progressText = '';
  switch (activeChallenge.type) {
    case 'clicks':
      progressText = `${activeChallenge.progress}/${activeChallenge.target} clicks`;
      if (activeChallenge.timeLimit) {
        const timeLeft = Math.ceil((activeChallenge.timeLimit - (Date.now() - activeChallenge.startTime)) / 1000);
        progressText += ` (${timeLeft}s left)`;
      }
      break;
    case 'accuracy':
      const total = sessionStats.clicks + sessionStats.misses;
      const current = total > 0 ? (sessionStats.clicks / total * 100).toFixed(1) : 100;
      progressText = `${current}% accuracy (${total}/${activeChallenge.clicksRequired} clicks)`;
      break;
    case 'combo':
      progressText = `${sessionStats.combo}x / ${activeChallenge.target}x combo`;
      break;
  }
  
  display.innerHTML = `
    <h4>${activeChallenge.icon} ${activeChallenge.name}</h4>
    <p>${progressText}</p>
  `;
}

// Game loop
function updateGameLoop() {
  updateUI();
  updateStatsDisplay();
  
  if (challengeManager.getActive()) {
    updateChallengeDisplay();
  }
}

// Check milestones
function checkMilestones() {
  const milestones = [10, 25, 50, 100, 250, 500, 1000];
  
  if (milestones.includes(sessionStats.clicks)) {
    showNotification(`🎉 Milestone: ${sessionStats.clicks} clicks!`);
    playSound(document.getElementById('achievement-sound'));
    
    // Special effects
    if (sessionStats.clicks === 100) {
      createConfetti();
    }
  }
}

// Get next milestone
function getNextMilestone() {
  const milestones = [10, 25, 50, 100, 250, 500, 1000, 2500, 5000];
  return milestones.find(m => m > sessionStats.clicks) || 10000;
}

// Show notification
function showNotification(message) {
  const notification = document.getElementById('easter-egg-notification');
  if (!notification) return;
  
  notification.textContent = message;
  notification.classList.add('show');
  
  setTimeout(() => {
    notification.classList.remove('show');
  }, 3000);
}

// Create confetti
function createConfetti() {
  for (let i = 0; i < 100; i++) {
    const confetti = document.createElement('div');
    confetti.style.cssText = `
      position: fixed;
      width: 10px;
      height: 10px;
      background: hsl(${Math.random() * 360}, 100%, 50%);
      left: ${Math.random() * 100}vw;
      top: -20px;
      border-radius: 50%;
      animation: confettiFall ${2 + Math.random() * 3}s linear forwards;
      z-index: 9999;
    `;
    document.body.appendChild(confetti);
    
    setTimeout(() => confetti.remove(), 5000);
  }
}

// Play sound helper
function playSound(audio) {
  if (!audio || !userInteracted) return;
  audio.currentTime = 0;
  audio.volume = 0.3;
  audio.play().catch(() => {});
}

// Enable audio on first interaction
document.addEventListener('click', () => {
  userInteracted = true;
}, { once: true });

// Konami code setup
function setupKonamiCode() {
  new KonamiCode(() => {
    showNotification('🎮 KONAMI CODE! +1000 bonus clicks!');
    sessionStats.clicks += 1000;
    updateClickDisplay();
    createConfetti();
  });
}

// Save stats on exit
window.addEventListener('beforeunload', () => {
  statsManager.update(sessionStats);
  if (sessionStats.clicks > statsManager.stats.highScore) {
    statsManager.stats.highScore = sessionStats.clicks;
    statsManager.addScore(sessionStats.clicks);
  }
  statsManager.save();
});
