document.addEventListener("DOMContentLoaded", () => {
  const downloadBtn = document.getElementById("download-report");
  const timerElement = document.getElementById("timer");
  const coinCount = document.getElementById("coin-count");
  const highScore = document.getElementById("high-score");

  if (!downloadBtn) return;

  downloadBtn.addEventListener("click", () => {
    const currentTime = new Date().toLocaleString();
    const timeSpent = timerElement ? timerElement.textContent : "Unknown";
    const coins = coinCount ? coinCount.textContent : "0";
    const score = highScore ? highScore.textContent : "0";

    const report = `
==== NOTHING REPORT ====

🕒 Report generated at: ${currentTime}

⏱️ ${timeSpent}
🪙 Nothing Coins Earned: ${coins}
🏆 High Score: ${score}

Keep doing nothing... you're amazing at it!
`;

    const blob = new Blob([report], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Nothing_Report.txt";
    link.click();
  });
});
