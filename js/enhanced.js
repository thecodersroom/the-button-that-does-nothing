// ========================================
// ⚡ ENHANCED FEATURES - Modern & Impressive
// ========================================

// Particle Canvas Background System
class ParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.resize();
    this.animate();
    
    window.addEventListener('resize', () => this.resize());
  }
  
  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }
  
  createParticle(x, y, color) {
    this.particles.push(new BackgroundParticle(x || Math.random() * this.canvas.width, y || Math.random() * this.canvas.height, color));
  }
  
  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Add random particles
    if (Math.random() < 0.05) {
      this.createParticle();
    }
    
    // Update and draw
    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update();
      this.particles[i].draw(this.ctx);
      
      if (this.particles[i].opacity <= 0) {
        this.particles.splice(i, 1);
      }
    }
    
    requestAnimationFrame(() => this.animate());
  }
}

class BackgroundParticle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.size = Math.random() * 3 + 1;
    this.speedX = (Math.random() - 0.5) * 0.5;
    this.speedY = (Math.random() - 0.5) * 0.5;
    this.color = color || `hsl(${Math.random() * 360}, 70%, 60%)`;
    this.opacity = 1;
  }
  
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.opacity -= 0.005;
  }
  
  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.globalAlpha = this.opacity;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

// Matrix Rain Effect
class MatrixRain {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.fontSize = 16;
    this.columns = 0;
    this.drops = [];
    this.chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }
  
  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.columns = Math.floor(this.canvas.width / this.fontSize);
    this.drops = Array(this.columns).fill(1);
  }
  
  animate() {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.ctx.fillStyle = '#00ff00';
    this.ctx.font = this.fontSize + 'px monospace';
    
    for (let i = 0; i < this.drops.length; i++) {
      const text = this.chars[Math.floor(Math.random() * this.chars.length)];
      this.ctx.fillText(text, i * this.fontSize, this.drops[i] * this.fontSize);
      
      if (this.drops[i] * this.fontSize > this.canvas.height && Math.random() > 0.975) {
        this.drops[i] = 0;
      }
      this.drops[i]++;
    }
    
    requestAnimationFrame(() => this.animate());
  }
  
  start() {
    this.animate();
  }
}

// Game Mode System
class GameModeManager {
  constructor() {
    this.currentMode = 'normal';
    this.modes = {
      normal: {
        dodgeChance: 0.7,
        speedMultiplier: 1,
        sizeVariation: true,
        colorChange: true,
        description: 'Standard gameplay'
      },
      hard: {
        dodgeChance: 0.85,
        speedMultiplier: 1.5,
        sizeVariation: true,
        colorChange: true,
        description: 'Button is faster and dodges more'
      },
      impossible: {
        dodgeChance: 0.95,
        speedMultiplier: 2,
        sizeVariation: true,
        colorChange: true,
        mouseDodge: true,
        dangerZone: 200,
        description: 'Good luck!'
      },
      god: {
        dodgeChance: 0.98,
        speedMultiplier: 3,
        sizeVariation: true,
        colorChange: true,
        mouseDodge: true,
        dangerZone: 300,
        teleportOnHover: true,
        randomSize: true,
        description: 'For the true masters'
      }
    };
  }
  
  setMode(mode) {
    if (this.modes[mode]) {
      this.currentMode = mode;
      return this.modes[mode];
    }
    return this.modes.normal;
  }
  
  getCurrentMode() {
    return this.modes[this.currentMode];
  }
}

// Power-up System
class PowerUpManager {
  constructor() {
    this.activePowerUps = new Map();
    this.powerUps = {
      shield: {
        name: 'Shield',
        icon: '🛡️',
        duration: 10000,
        cost: 50,
        effect: () => {
          return { dodgeDisabled: true };
        }
      },
      magnet: {
        name: 'Magnet',
        icon: '🧲',
        duration: 8000,
        cost: 30,
        effect: () => {
          return { magnetActive: true };
        }
      },
      freeze: {
        name: 'Freeze Time',
        icon: '❄️',
        duration: 7000,
        cost: 40,
        effect: () => {
          return { speedMultiplier: 0.3 };
        }
      },
      giant: {
        name: 'Giant Button',
        icon: '🎯',
        duration: 15000,
        cost: 25,
        effect: () => {
          return { sizeMultiplier: 2 };
        }
      }
    };
  }
  
  activate(powerUpName, button, updateUI) {
    if (this.activePowerUps.has(powerUpName)) return false;
    
    const powerUp = this.powerUps[powerUpName];
    if (!powerUp) return false;
    
    const effect = powerUp.effect();
    this.activePowerUps.set(powerUpName, {
      ...powerUp,
      effect,
      endTime: Date.now() + powerUp.duration
    });
    
    this.applyEffects(button);
    updateUI();
    
    setTimeout(() => {
      this.deactivate(powerUpName, button, updateUI);
    }, powerUp.duration);
    
    return true;
  }
  
  deactivate(powerUpName, button, updateUI) {
    this.activePowerUps.delete(powerUpName);
    this.applyEffects(button);
    updateUI();
  }
  
  applyEffects(button) {
    let totalSpeedMult = 1;
    let totalSizeMult = 1;
    let dodgeDisabled = false;
    let magnetActive = false;
    
    this.activePowerUps.forEach(powerUp => {
      if (powerUp.effect.speedMultiplier) totalSpeedMult *= powerUp.effect.speedMultiplier;
      if (powerUp.effect.sizeMultiplier) totalSizeMult *= powerUp.effect.sizeMultiplier;
      if (powerUp.effect.dodgeDisabled) dodgeDisabled = true;
      if (powerUp.effect.magnetActive) magnetActive = true;
    });
    
    return { totalSpeedMult, totalSizeMult, dodgeDisabled, magnetActive };
  }
  
  getActive() {
    return Array.from(this.activePowerUps.values());
  }
}

// Challenge System
class ChallengeManager {
  constructor() {
    this.activeChallenge = null;
    this.challenges = {
      speed: {
        name: 'Speed Demon',
        icon: '⚡',
        description: 'Click 10 times in 5 seconds',
        target: 10,
        timeLimit: 5000,
        type: 'clicks',
        reward: 100
      },
      accuracy: {
        name: 'Accuracy Master',
        icon: '🎯',
        description: 'Achieve 95% accuracy for 20 clicks',
        target: 0.95,
        clicksRequired: 20,
        type: 'accuracy',
        reward: 150
      },
      combo: {
        name: 'Combo King',
        icon: '🔥',
        description: 'Reach a 10x combo',
        target: 10,
        type: 'combo',
        reward: 200
      },
      timeattack: {
        name: 'Time Attack',
        icon: '⏰',
        description: '100 clicks in 60 seconds',
        target: 100,
        timeLimit: 60000,
        type: 'clicks',
        reward: 250
      }
    };
  }
  
  start(challengeName) {
    const challenge = this.challenges[challengeName];
    if (!challenge) return null;
    
    this.activeChallenge = {
      ...challenge,
      startTime: Date.now(),
      startClicks: 0,
      progress: 0,
      completed: false
    };
    
    return this.activeChallenge;
  }
  
  update(stats) {
    if (!this.activeChallenge || this.activeChallenge.completed) return null;
    
    const challenge = this.activeChallenge;
    const elapsed = Date.now() - challenge.startTime;
    
    switch (challenge.type) {
      case 'clicks':
        challenge.progress = stats.clicks - challenge.startClicks;
        if (challenge.timeLimit && elapsed > challenge.timeLimit) {
          return this.fail();
        }
        if (challenge.progress >= challenge.target) {
          return this.complete();
        }
        break;
        
      case 'accuracy':
        const totalAttempts = stats.clicks + stats.misses;
        if (totalAttempts >= challenge.clicksRequired) {
          const accuracy = stats.clicks / totalAttempts;
          if (accuracy >= challenge.target) {
            return this.complete();
          } else {
            return this.fail();
          }
        }
        break;
        
      case 'combo':
        if (stats.combo >= challenge.target) {
          return this.complete();
        }
        break;
    }
    
    return challenge;
  }
  
  complete() {
    this.activeChallenge.completed = true;
    return { status: 'completed', reward: this.activeChallenge.reward };
  }
  
  fail() {
    const failed = this.activeChallenge;
    this.activeChallenge = null;
    return { status: 'failed', challenge: failed };
  }
  
  getActive() {
    return this.activeChallenge;
  }
}

// Statistics & Leaderboard System
class StatsManager {
  constructor() {
    this.stats = this.loadStats();
  }
  
  loadStats() {
    const saved = localStorage.getItem('buttonGameStats');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      totalClicks: 0,
      totalMisses: 0,
      bestCombo: 0,
      totalTimePlayed: 0,
      highScore: 0,
      leaderboard: []
    };
  }
  
  save() {
    localStorage.setItem('buttonGameStats', JSON.stringify(this.stats));
  }
  
  update(sessionStats) {
    this.stats.totalClicks += sessionStats.clicks;
    this.stats.totalMisses += sessionStats.misses;
    if (sessionStats.bestCombo > this.stats.bestCombo) {
      this.stats.bestCombo = sessionStats.bestCombo;
    }
    this.save();
  }
  
  addScore(score, name = 'Anonymous') {
    this.stats.leaderboard.push({
      score,
      name,
      date: new Date().toISOString()
    });
    this.stats.leaderboard.sort((a, b) => b.score - a.score);
    this.stats.leaderboard = this.stats.leaderboard.slice(0, 10);
    this.save();
  }
  
  reset() {
    this.stats = {
      totalClicks: 0,
      totalMisses: 0,
      bestCombo: 0,
      totalTimePlayed: 0,
      highScore: 0,
      leaderboard: []
    };
    this.save();
  }
  
  getStats() {
    return this.stats;
  }
}

// Konami Code Easter Egg
class KonamiCode {
  constructor(callback) {
    this.pattern = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    this.current = 0;
    this.callback = callback;
    
    document.addEventListener('keydown', (e) => this.checkKey(e.key));
  }
  
  checkKey(key) {
    if (key === this.pattern[this.current]) {
      this.current++;
      if (this.current === this.pattern.length) {
        this.callback();
        this.current = 0;
      }
    } else {
      this.current = 0;
    }
  }
}

// Theme Manager
class ThemeManager {
  constructor() {
    this.currentTheme = localStorage.getItem('buttonTheme') || 'dark';
    this.applyTheme(this.currentTheme);
  }
  
  applyTheme(themeName) {
    this.currentTheme = themeName;
    document.body.setAttribute('data-theme', themeName);
    localStorage.setItem('buttonTheme', themeName);
    
    // Special effects for matrix theme
    const matrixCanvas = document.getElementById('matrix-canvas');
    if (themeName === 'matrix' && matrixCanvas) {
      matrixCanvas.style.display = 'block';
    } else if (matrixCanvas) {
      matrixCanvas.style.display = 'none';
    }
  }
  
  getTheme() {
    return this.currentTheme;
  }
}

// Export for use in main script
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ParticleSystem,
    MatrixRain,
    GameModeManager,
    PowerUpManager,
    ChallengeManager,
    StatsManager,
    KonamiCode,
    ThemeManager
  };
}
