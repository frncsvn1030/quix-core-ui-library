function loadPage(name) {
  const main = document.getElementById("main-content");
  const sidebar = document.getElementById("right-sidebar");
  const options = document.querySelectorAll(".option");

  fetch(`components/${name}.html`)
    .then((res) => {
      if (!res.ok) throw new Error("Page not found");
      return res.text();
    })
    .then((html) => {
      main.innerHTML = html;

      setTimeout(() => {
        if (window.initScrollAndProgress) initScrollAndProgress();

        const hash = window.location.hash;
        if (hash && hash !== `#${name}`) {
          const el = document.querySelector(hash);
          if (el) {
            const OFFSET = 100;
            const targetOffset = el.offsetTop - OFFSET;
            window.scrollTo({ top: targetOffset, behavior: "smooth" });
          }
        }
      }, 50);

      const oldScript = document.querySelector(
        `script[data-component="${name}"]`
      );
      if (oldScript) oldScript.remove();

      const script = document.createElement("script");
      script.src = `components/scripts/${name}.js`;
      script.defer = true;
      script.dataset.component = name;
      document.body.appendChild(script);
    })
    .catch((err) => {
      main.innerHTML = `<p>Error loading page: ${err.message}</p>`;
    });

  // load sidebar
  fetch(`components/sidebars/${name}-right.html`)
    .then((res) => {
      if (!res.ok) throw new Error("Sidebar not found");
      return res.text();
    })
    .then((html) => (sidebar.innerHTML = html))
    .catch(() => (sidebar.innerHTML = ""));

  // highlight sidebar option
  options.forEach((option) => {
    option.classList.remove("active");
    const optionName = option.textContent
      .trim()
      .toLowerCase()
      .replace(/ & /g, "-")
      .replace(/\s+/g, "-");
    if (optionName === name) {
      option.classList.add("active");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const hash = window.location.hash;
  const defaultPage = hash ? hash.substring(1).toLowerCase() : "button";
  loadPage(defaultPage);

  document.querySelectorAll(".option").forEach((option) => {
    option.addEventListener("click", (e) => {
      e.preventDefault();
      const name = option.textContent
        .trim()
        .toLowerCase()
        .replace(/ & /g, "-")
        .replace(/\s+/g, "-");
      window.location.hash = name;
    });
  });

  const validPages = [
    "button",
    "accordion",
    "card",
    "slider",
    "input-field",
    "navbar",
    "checkbox",
    "toggle-switch",
    "table",
  ];

  window.addEventListener("hashchange", () => {
    const newHash = window.location.hash.substring(1);

    // if hash matches a valid page, load it
    if (validPages.includes(newHash)) {
      localStorage.setItem("currentPage", newHash);
      loadPage(newHash);
    }
  });
  // make loadPage available globally
  window.loadPage = loadPage;
});
