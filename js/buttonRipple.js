document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("useless-button");

  btn.addEventListener("click", (e) => {
    const existingRipple = btn.querySelector(".ripple");
    if (existingRipple) existingRipple.remove();

    const ripple = document.createElement("span");
    ripple.classList.add("ripple");
    btn.appendChild(ripple);

    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - size / 2}px`;

    setTimeout(() => ripple.remove(), 600);
  });
});
