// every component listed in the docs menu
const knownPages = [
  "button",
  "accordion",
  "card",
  "slider",
  "table",
  "checkbox",
  "input-field",
  "radio",
  "toggle-switch",
  "navbar",
  "tab",
  "progress",
];

function prettyName(slug) {
  if (slug === "toggle-switch") return "Toggle & Switch";
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function notAvailableHTML(name) {
  return `
    <div class="docs-empty">
      <span class="docs-empty-icon" uk-icon="icon: clock; ratio: 1.6"></span>
      <h1 class="docs-empty-title">${prettyName(name)}</h1>
      <p class="docs-empty-text">This component was not completed.</p>
    </div>`;
}

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
    .catch(() => {
      main.innerHTML = notAvailableHTML(name);
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
  const hash = window.location.hash.substring(1).toLowerCase();
  // a hash that isn't a component name is a section anchor, so open Button and scroll to it
  const defaultPage = knownPages.includes(hash) ? hash : "button";
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

  window.addEventListener("hashchange", () => {
    const newHash = window.location.hash.substring(1);

    // only react to component pages, not in-page section anchors
    if (knownPages.includes(newHash)) {
      localStorage.setItem("currentPage", newHash);
      loadPage(newHash);
    }
  });
  // make loadPage available globally
  window.loadPage = loadPage;
});
