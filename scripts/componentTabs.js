// component filtering
document.addEventListener("DOMContentLoaded", function () {
  const tabs = document.querySelectorAll(".component-tabs li");
  const cards = document.querySelectorAll(".component-card");

  // how many components are actually ready
  const progress = document.getElementById("components-progress");
  if (progress) {
    const ready = document.querySelectorAll(".component-status.ready").length;
    progress.textContent = `${ready} of ${cards.length} components were completed.`;
  }

  // show how many components each category has
  tabs.forEach((tab) => {
    const filter = tab.getAttribute("data-filter");
    const count =
      filter === "all"
        ? cards.length
        : [...cards].filter((c) => c.getAttribute("data-group") === filter)
            .length;

    const badge = document.createElement("span");
    badge.className = "tab-count";
    badge.textContent = count;
    tab.querySelector("a").appendChild(badge);
  });

  tabs.forEach((tab) => {
    tab.addEventListener("click", function (e) {
      e.preventDefault();
      const filterValue = this.getAttribute("data-filter");

      tabs.forEach((t) => {
        t.classList.remove("uk-active");
        t.querySelector("a").removeAttribute("aria-current");
      });
      this.classList.add("uk-active");
      this.querySelector("a").setAttribute("aria-current", "true");

      cards.forEach((card) => {
        const wrapper = card.parentElement;
        const show =
          filterValue === "all" ||
          card.getAttribute("data-group") === filterValue;

        wrapper.style.display = show ? "block" : "none";
        if (show) {
          card.classList.remove("is-entering");
          void card.offsetWidth; // restart the animation
          card.classList.add("is-entering");
        }
      });
    });
  });
});
