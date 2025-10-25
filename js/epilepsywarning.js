// Epilepsy Warning Logic
window.addEventListener("load", () => {
  const warning = document.getElementById("epilepsy-warning");
  const continueBtn = document.getElementById("continue-warning");

  const hasSeenWarning = localStorage.getItem("epilepsyAcknowledged");

  if(!hasSeenWarning){
    warning.style.display = "flex";
    document.body.style.overflow = "hidden";
    continueBtn.addEventListener("click", () => {
      warning.style.display = "none";
      document.body.style.overflow = "auto";
      localStorage.setItem("epilepsyAcknowledged", "true");
    });
  } else {
    warning.style.display = "none";
    document.body.style.overflow = "auto";
  }
});
