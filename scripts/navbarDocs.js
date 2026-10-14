document.addEventListener("DOMContentLoaded", function () {
  fetch("partials/navbarDocs.html")
    .then((response) => response.text())
    .then((data) => {
      document.getElementById("navbar-container").innerHTML = data;
      initNavbar();
    })
    .catch((error) => {
      console.error("Error loading navbar:", error);
    });
});

// scrolled shadow + platform-specific shortcut hint
function initNavbar() {
  const nav = document.querySelector("#navbar-container nav");
  if (!nav) return;

  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 8);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const isMac = /Mac|iPhone|iPad/.test(navigator.platform);
  const kbd = nav.querySelector(".nav-kbd");
  if (kbd && !isMac) kbd.textContent = "Ctrl K";
}
