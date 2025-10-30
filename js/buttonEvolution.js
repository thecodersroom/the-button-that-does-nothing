document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("useless-button");
  if (!button) return;

  let clickCount = 0;
  let stages = {
    eyes: false,
    arms: false,
    wings: false,
    sparkle: false,
    final: false
  };

  button.style.position = "relative";

  button.addEventListener("click", () => {
    clickCount++;

    if (clickCount === 50 && !stages.eyes) {
      addEyes();
      createPopup("👀 The button grew eyes!");
      stages.eyes = true;
    } 
    else if (clickCount === 100 && !stages.arms) {
      addArms();
      createPopup("💪 The button got arms!");
      stages.arms = true;
    } 
    else if (clickCount === 150 && !stages.wings) {
      addWings();
      createPopup("🪽 The button sprouted wings!");
      stages.wings = true;
    } 
    else if (clickCount === 200 && !stages.sparkle) {
      button.classList.add("evo-sparkle");
      createPopup("✨ The button sparkles with power!");
      stages.sparkle = true;
    } 
    else if (clickCount === 250 && !stages.final) {
      button.classList.add("evo-final");
      createPopup("🌈 The button reached its final form!");
      stages.final = true;
    }
  });

  function addEyes() {
    const eyeContainer = document.createElement("div");
    eyeContainer.classList.add("evo-eyes");
    eyeContainer.innerHTML = "👁️👁️";
    button.appendChild(eyeContainer);
  }

  function addArms() {
    const leftArm = document.createElement("div");
    const rightArm = document.createElement("div");
    leftArm.classList.add("evo-arm-left");
    rightArm.classList.add("evo-arm-right");
    leftArm.textContent = "💪";
    rightArm.textContent = "💪";
    button.appendChild(leftArm);
    button.appendChild(rightArm);
  }

  function addWings() {
    const leftWing = document.createElement("div");
    const rightWing = document.createElement("div");
    leftWing.classList.add("evo-wing-left");
    rightWing.classList.add("evo-wing-right");
    leftWing.textContent = "🪽";
    rightWing.textContent = "🪽";
    button.appendChild(leftWing);
    button.appendChild(rightWing);
  }

  function createPopup(message) {
    const popup = document.createElement("div");
    popup.textContent = message;
    popup.className = "evolution-popup";
    Object.assign(popup.style, {
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      background: "rgba(0,0,0,0.7)",
      color: "white",
      padding: "12px 20px",
      borderRadius: "12px",
      fontSize: "1rem",
      zIndex: 9999,
      textAlign: "center",
      animation: "fadeOut 2.5s ease forwards",
    });

    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes fadeOut {
        0% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        80% { opacity: 1; transform: translate(-50%, -55%) scale(1.05); }
        100% { opacity: 0; transform: translate(-50%, -60%) scale(0.9); }
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 2500);
  }
});
