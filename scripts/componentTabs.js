// component filtering
document.addEventListener("DOMContentLoaded", function () {
  const tabs = document.querySelectorAll(".component-tabs li");

  tabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      const filterValue = this.getAttribute("data-filter");

      tabs.forEach((t) => t.classList.remove("uk-active"));
      this.classList.add("uk-active");

      const cards = document.querySelectorAll(".component-card");

      cards.forEach((card) => {
        const cardGroup = card.getAttribute("data-group");
        card.parentElement.style.display =
          filterValue === "all" || cardGroup === filterValue ? "block" : "none";
      });
    });
  });
});
