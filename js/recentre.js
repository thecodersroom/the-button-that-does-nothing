document.getElementById("recenter").addEventListener("click", () => {
  const uselessBtn = document.getElementById("useless-btn");
  const tooltip = document.getElementById("tooltip");

  // Move the useless button smoothly to center
  uselessBtn.style.top = "50%";
  uselessBtn.style.left = "50%";
  uselessBtn.style.transform = "translate(-50%, -50%) scale(1.05)";

  // Show tooltip above it
  const rect = uselessBtn.getBoundingClientRect();
  tooltip.style.top = rect.top - 20 + "px";
  tooltip.style.left = rect.left + rect.width / 2 + "px";
  tooltip.classList.add("active");

  // Hide tooltip after 2 seconds
  setTimeout(() => {
    tooltip.classList.remove("active");
    uselessBtn.style.transform = "translate(-50%, -50%) scale(1)";
  }, 2000);
});
