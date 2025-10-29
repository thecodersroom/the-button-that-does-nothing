document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("useless-button");
  if (!button) return;

  const clickMoreSound = new Audio("audio/clickmore.mp3");
  clickMoreSound.volume = 0.8; // adjust volume if needed

  let clickCount = 0;
  let randomTrigger = Math.floor(Math.random() * 10) + 1; // 1 to 10

  button.addEventListener("click", () => {
    clickCount++;

    if (clickCount >= randomTrigger) {
      clickMoreSound.currentTime = 0;
      clickMoreSound.play();

      // Reset for next random trigger
      clickCount = 0;
      randomTrigger = Math.floor(Math.random() * 10) + 1;
    }
  });
});
