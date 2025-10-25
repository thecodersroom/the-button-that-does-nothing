// Epilepsy Warning Logic
window.addEventListener("load", () => {
  const warning = document.getElementById("epilepsy-warning");
  const continueBtn = document.getElementById("continue-warning");

  document.body.style.overflow = "hidden";

  continueBtn.addEventListener("click", () => {
    warning.style.display = "none";
    document.body.style.overflow = "auto";
  });
});
