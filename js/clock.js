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
    
    
    
    