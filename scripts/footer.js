document.addEventListener("DOMContentLoaded", function () {
  fetch("/partials/footer.html")
    .then((response) => response.text())
    .then((data) => {
      document.getElementById("footer-container").innerHTML = data;
    })
    .catch((error) => {
      console.error("Error loading navbar:", error);
    });
});
