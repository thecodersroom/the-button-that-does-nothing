// === Digital Clock ===
function updateClock() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    
    document.getElementById('hrs').textContent = hours;
    document.getElementById('min').textContent = minutes;
    document.getElementById('sec').textContent = seconds;
}

// Update clock every second
setInterval(updateClock, 1000);
updateClock(); // Initial call

// -----------Fake Crash -------------
function simulateFakeCrash() {
    console.warn("⚠️ WARNING: Critical style corruption detected!");
    console.error("💥 Memory overflow in CSS module! Aborting styles...");
    console.log("🧠 Attempting fail-safe recovery... nope, too late.");
  
    // Flashing and glitch effects
    document.body.classList.add('fake-crash');
    const glitchInterval = setInterval(() => {
      const hue = Math.floor(Math.random() * 360);
      const skew = Math.random() * 30 - 15;
      document.body.style.filter = `hue-rotate(${hue}deg) saturate(2)`;
      document.body.style.transform = `skew(${skew}deg)`;
    }, 200);
  
    // Play glitch sound effects
    const crashSound = new Audio('audio/error-glitch.mp3');
    crashSound.volume = 0.8;
    crashSound.play().catch(() => {});
  
    // Flashing screen simulation
    let flash = true;
    const flashInterval = setInterval(() => {
      document.body.style.backgroundColor = flash ? '#ff0000' : '#000';
      flash = !flash;
    }, 100);
  
    // Stop chaos after 7 seconds
    setTimeout(() => {
      clearInterval(glitchInterval);
      clearInterval(flashInterval);
      document.body.classList.remove('fake-crash');
      document.body.style = '';
      console.info("✅ System rebooted successfully.");
    }, 7000);
  }
  
  // Trigger after 500 clicks
  if (button) {
    button.addEventListener("click", () => {
      if (clicks === 2) simulateFakeCrash();
    });
  }
  




















// ---

// ## 🎯 New Features Added:

// 1. **✨ Particle Explosion Effect** - Beautiful particles har click par
// 2. **🏃 Smart Runaway Button** - Button screen se bahar nahi jayega (boundaries set hai)
// 3. **🏆 Achievement System** - Milestones unlock hote hai with popup notifications
// 4. **🌈 Rainbow Button** - 20 clicks ke baad rainbow animation
// 5. **📱 Fully Responsive** - Mobile aur desktop dono me perfect
// 6. **🎨 Glassmorphism Design** - Modern UI with backdrop blur effects
// 7. **💫 Smooth Animations** - Professional level animations
// 8. **🔊 Sound Support** - Click aur fail sounds ke liye ready
// 9. **⚡ Performance Optimized** - Smooth 60fps animations

// Files structure:
// project/
// ├── index.html
// ├── css/
// │   ├── style.css
// │   └── clock.css
// ├── js/
// │   ├── script.js
// │   └── clock.js
// └── audio/
//     ├── click.mp3
//     └── failedClick.mp3
    
    
    
    