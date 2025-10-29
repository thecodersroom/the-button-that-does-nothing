(function () {

  const PARTICLE_COUNT = 28;
  const PARTICLE_SPEED = 2.6;
  const PARTICLE_LIFETIME = 900; // ms
  const RIPPLE_LIFETIME = 700; // ms
  const COLOR_PULSE_MS = 650;

  const canvas = document.createElement("canvas");
  canvas.id = "click-effects-canvas";
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d", { alpha: true });

  
  function onResize() {
    canvas.width = innerWidth * devicePixelRatio;
    canvas.height = innerHeight * devicePixelRatio;
    canvas.style.width = innerWidth + "px";
    canvas.style.height = innerHeight + "px";
    ctx.scale(devicePixelRatio, devicePixelRatio);
  }
  onResize();
  window.addEventListener("resize", onResize);

  
  const particles = [];

  function rand(min, max) { return Math.random() * (max - min) + min; }

  function spawnParticles(x, y, themeHue) {
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = rand(PARTICLE_SPEED * 0.4, PARTICLE_SPEED * 1.8);
      const size = rand(3, 9);
      const life = PARTICLE_LIFETIME * rand(0.7, 1.2);
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed * (0.7 + Math.random() * 0.8);
      const hue = (themeHue + rand(-30, 30)) | 0;
      const sat = rand(60, 92) | 0;
      particles.push({
        x, y, vx, vy, size, life, born: performance.now(),
        hue, sat, alpha: 1, friction: 0.992 + Math.random()*0.006
      });
    }
  }

  function drawParticles(now) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!particles.length) return;
    ctx.save();
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      const age = now - p.born;
      if (age >= p.life || p.alpha <= 0.01) {
        particles.splice(i, 1);
        continue;
      }
      p.vx *= p.friction;
      p.vy *= p.friction;
      p.vy += 0.04; 
      p.x += p.vx;
      p.y += p.vy;
      p.alpha = 1 - (age / p.life);
     
      const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size*2);
      grd.addColorStop(0, `hsla(${p.hue}, ${p.sat}%, 60%, ${p.alpha})`);
      grd.addColorStop(0.5, `hsla(${p.hue}, ${p.sat}%, 45%, ${p.alpha * 0.6})`);
      grd.addColorStop(1, `hsla(${p.hue}, ${p.sat}%, 30%, 0)`);
      ctx.beginPath();
      ctx.fillStyle = grd;
      ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
      ctx.fill();
    }
    ctx.restore();
  }

  function spawnRipple(x, y, themeKind = "dark") {
    const ripple = document.createElement("div");
    ripple.className = "click-ripple " + (themeKind === "light" ? "light" : "dark");
    const size = Math.max(window.innerWidth, window.innerHeight) * 0.9;
    ripple.style.left = x + "px";
    ripple.style.top = y + "px";
    ripple.style.width = size + "px";
    ripple.style.height = size + "px";
    ripple.style.marginLeft = -(size/2) + "px";
    ripple.style.marginTop = -(size/2) + "px";
    ripple.style.transitionDuration = (RIPPLE_LIFETIME) + "ms";
    document.body.appendChild(ripple);
  
    requestAnimationFrame(() => {
      ripple.style.transform = "translate(-50%, -50%) scale(1)";
      ripple.style.opacity = "0";
    });
    setTimeout(() => {
      if (ripple && ripple.parentNode) ripple.parentNode.removeChild(ripple);
    }, RIPPLE_LIFETIME + 80);
  }

  function spawnPulse(x, y) {
    const p = document.createElement("div");
    p.className = "click-pulse";
    p.style.left = x + "px";
    p.style.top = y + "px";
    document.body.appendChild(p);
    requestAnimationFrame(() => {
      p.style.transform = "translate(-50%, -50%) scale(1.8)";
      p.style.opacity = "0";
    });
    setTimeout(() => { if (p.parentNode) p.parentNode.removeChild(p); }, 420);
  }

  const bgContainer = document.querySelector(".background-container") || document.body;
  const appContainer = document.querySelector(".app-container") || document.body;

  function applyColorPulse(xPct, yPct, hue) {
    appContainer.style.setProperty("--cx", xPct + "%");
    appContainer.style.setProperty("--cy", yPct + "%");
    appContainer.style.setProperty("--click-hue", hue);
    appContainer.style.setProperty("--click-sat", (30 + Math.random()*35) + "%");

    bgContainer.classList.add("click-color-pulse");
    appContainer.classList.add("click-tint");

    setTimeout(() => {
      bgContainer.classList.remove("click-color-pulse");
      appContainer.classList.remove("click-tint");
      
      appContainer.style.removeProperty("--cx");
      appContainer.style.removeProperty("--cy");
    }, COLOR_PULSE_MS + 40);
  }

  let rafId;
  function loop(now) {
    drawParticles(now);
    rafId = requestAnimationFrame(loop);
  }
  rafId = requestAnimationFrame(loop);

  function onGlobalClick(e) {
   
    const node = e.target;
    if (node && (node.tagName === "INPUT" || node.tagName === "TEXTAREA" || node.isContentEditable)) {
      return;
    }

    const x = e.clientX;
    const y = e.clientY;
    const xPct = (x / window.innerWidth) * 100;
    const yPct = (y / window.innerHeight) * 100;

    const hue = Math.round((xPct / 100) * 360);

    spawnParticles(x, y, hue);

    spawnRipple(x, y, document.documentElement.classList.contains("dark") ? "dark" : "light");

    spawnPulse(x, y);

    applyColorPulse(xPct, yPct, hue);

    const target = e.target;
    target.classList.add("clicked-bounce");
    setTimeout(() => target.classList.remove("clicked-bounce"), 220);

    try {
      const coin = document.getElementById("coin-count");
      if (coin) {
        coin.style.transition = "transform 180ms ease";
        coin.style.transform = "translateY(-6px)";
        setTimeout(()=> coin.style.transform = "", 180);
      }
    } catch (err) { }
  }

  document.addEventListener("click", onGlobalClick, { passive: true });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      const el = document.activeElement;
      if (el && el.getBoundingClientRect) {
        const rect = el.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        const fakeEvent = { clientX: x, clientY: y, target: el };
        onGlobalClick(fakeEvent);
      }
    }
  });
  window.__clickEffects = {
    stop: function () {
      document.removeEventListener("click", onGlobalClick);
      cancelAnimationFrame(rafId);
      if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
    }
  };

})();
