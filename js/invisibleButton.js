// Invisible Button

  const eggButton = document.getElementById("hidden-button");
  const card = document.getElementById("easter-card");

  function placeEggRandomly() {
    const eggWidth = 75;
    const eggHeight = 100;

    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    // Random X/Y so egg stays within the viewport
    const randomX = Math.random() * (screenWidth - eggWidth);
    const randomY = Math.random() * (screenHeight - eggHeight - 50);

    eggButton.style.left = `${randomX}px`;
    eggButton.style.top = `${randomY}px`;
  }

  function showCard() {
    // Show the centered popup
    card.style.display = "block";
    eggButton.style.display = "block";

    // Hide after 2.5 seconds
    setTimeout(() => {
      card.style.display = "none";
      eggButton.style.display = "none";
      placeEggRandomly();
    }, 2500);
    // Move the egg to a new random position
  }

  // Randomize position on load and on resize
  window.addEventListener("load", placeEggRandomly);
  window.addEventListener("resize", placeEggRandomly);

  // Move and show popup on click
  eggButton.addEventListener("click", showCard);
