const historyKey = "searchHistory";
const MAX_RECENT = 8;

// every component in the docs menu
const valid = [
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

// category + icon shown next to each result
const componentInfo = {
  button: { category: "Actions", icon: "bolt" },
  accordion: { category: "Data Display", icon: "list" },
  card: { category: "Data Display", icon: "image" },
  slider: { category: "Data Display", icon: "thumbnails" },
  table: { category: "Data Display", icon: "table" },
  checkbox: { category: "Data Input", icon: "check" },
  "input-field": { category: "Data Input", icon: "pencil" },
  radio: { category: "Data Input", icon: "minus-circle" },
  "toggle-switch": { category: "Data Input", icon: "settings" },
  navbar: { category: "Navigation", icon: "menu" },
  tab: { category: "Navigation", icon: "folder" },
  progress: { category: "Feedback", icon: "forward" },
};

// components that already have a docs page, offered when there is no history yet
const quickPicks = ["button"];

let activeIndex = -1;

/* ---------- helpers ---------- */

function formatTerm(term) {
  if (term === "toggle-switch") return "Toggle & Switch";
  return term
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function escapeHTML(str) {
  return str.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]
  );
}

// wraps the first match of the query in <mark>
function highlight(label, query) {
  const safe = escapeHTML(label);
  if (!query) return safe;
  const i = label.toLowerCase().indexOf(query.toLowerCase());
  if (i === -1) return safe;
  return (
    escapeHTML(label.slice(0, i)) +
    "<mark>" +
    escapeHTML(label.slice(i, i + query.length)) +
    "</mark>" +
    escapeHTML(label.slice(i + query.length))
  );
}

function getSearchEls() {
  return {
    modal: document.getElementById("search-modal"),
    input: document.getElementById("search-input"),
    suggestions: document.getElementById("search-suggestions"),
    history: document.getElementById("search-history"),
  };
}

/* ---------- storage ---------- */

function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(historyKey)) || [];
  } catch (e) {
    return [];
  }
}

function saveHistory(history) {
  // favorites are never dropped, only the oldest recent searches are
  const favorites = history.filter((h) => h.starred);
  const recent = history.filter((h) => !h.starred).slice(0, MAX_RECENT);
  const keep = new Set([...favorites, ...recent]);
  localStorage.setItem(
    historyKey,
    JSON.stringify(history.filter((h) => keep.has(h)))
  );
}

function saveToHistory(term) {
  const history = getHistory();
  const i = history.findIndex((item) => item.term === term);

  if (i !== -1) {
    const [existing] = history.splice(i, 1);
    history.unshift(existing);
  } else {
    history.unshift({ term, starred: false });
  }
  saveHistory(history);
}

function toggleFavorite(term) {
  const history = getHistory();
  const item = history.find((h) => h.term === term);

  if (item) {
    item.starred = !item.starred;
  } else {
    history.unshift({ term, starred: true });
  }
  saveHistory(history);
}

function removeFromHistory(term) {
  saveHistory(getHistory().filter((h) => h.term !== term));
}

function clearRecent() {
  saveHistory(getHistory().filter((h) => h.starred));
}

/* ---------- navigation ---------- */

function goToPage(term) {
  const onDocs = window.location.pathname.endsWith("docs.html");

  if (!onDocs) {
    window.location.href = `docs.html#${term}`;
  } else if (window.location.hash.slice(1) === term) {
    loadPage(term);
  } else {
    window.location.hash = term;
  }
}

// open a result: remember it, go there and close the modal
function fillSearch(term) {
  if (!term) return;
  saveToHistory(term);
  goToPage(term);
  UIkit.modal("#search-modal").hide();
}

/* ---------- rendering ---------- */

function createItem(term, { starred = false, query = "", showRemove = false }) {
  const info = componentInfo[term] || { category: "Component", icon: "file" };
  const li = document.createElement("li");
  li.className = "search-item";
  li.setAttribute("role", "option");
  li.dataset.term = term;

  li.innerHTML = `
    <span class="search-item-icon"><span uk-icon="icon: ${info.icon}; ratio: 0.9"></span></span>
    <span class="search-item-text">
      <span class="search-item-title">${highlight(formatTerm(term), query)}</span>
      <span class="search-item-meta">${info.category}</span>
    </span>
    <span class="search-item-actions">
      <button type="button" class="search-icon-btn search-star${starred ? " is-on" : ""}"
        data-action="star" aria-pressed="${starred}"
        aria-label="${starred ? "Remove from favorites" : "Add to favorites"}"
        title="${starred ? "Remove from favorites" : "Add to favorites"}">
        <span uk-icon="icon: star; ratio: 0.85"></span>
      </button>
      ${
        showRemove
          ? `<button type="button" class="search-icon-btn" data-action="remove"
              aria-label="Remove from history" title="Remove">
              <span uk-icon="icon: close; ratio: 0.8"></span>
            </button>`
          : ""
      }
    </span>
    <span class="search-item-go" uk-icon="icon: arrow-right; ratio: 0.8"></span>
  `;
  return li;
}

function createSection(title, items, onClear) {
  const section = document.createElement("div");
  section.className = "search-section";

  const head = document.createElement("div");
  head.className = "search-section-head";
  head.innerHTML = `<span class="search-section-title">${title}</span>`;

  if (onClear) {
    const clear = document.createElement("button");
    clear.type = "button";
    clear.className = "search-clear";
    clear.dataset.action = "clear";
    clear.textContent = "Clear";
    head.appendChild(clear);
  }

  const list = document.createElement("ul");
  list.className = "search-list";
  list.setAttribute("role", "listbox");
  items.forEach((item) => list.appendChild(item));

  section.appendChild(head);
  section.appendChild(list);
  return section;
}

function renderEmptyState() {
  const wrap = document.createElement("div");
  wrap.className = "search-empty";
  wrap.innerHTML = `
    <span class="search-empty-icon"><span uk-icon="icon: history; ratio: 1.2"></span></span>
    <div class="search-empty-title">No recent searches</div>
    <p class="search-empty-text">Find a component, or start with one of these.</p>
    <div class="search-chips">
      ${quickPicks
        .map(
          (t) =>
            `<button type="button" class="search-chip" data-term="${t}">${formatTerm(
              t
            )}</button>`
        )
        .join("")}
    </div>
  `;
  return wrap;
}

// favorites first, then recent searches
function renderSearchHistory() {
  const { history: container } = getSearchEls();
  if (!container) return;

  const history = getHistory().filter((h) => valid.includes(h.term));
  const favorites = history.filter((h) => h.starred);
  const recent = history.filter((h) => !h.starred);

  container.innerHTML = "";

  if (!history.length) {
    container.appendChild(renderEmptyState());
    return;
  }

  if (favorites.length) {
    container.appendChild(
      createSection(
        "Favorites",
        favorites.map((h) =>
          createItem(h.term, { starred: true, showRemove: false })
        )
      )
    );
  }

  if (recent.length) {
    container.appendChild(
      createSection(
        "Recent",
        recent.map((h) =>
          createItem(h.term, { starred: false, showRemove: true })
        ),
        true
      )
    );
  }
}

function renderSuggestions(query) {
  const { suggestions } = getSearchEls();
  const favorites = new Set(
    getHistory()
      .filter((h) => h.starred)
      .map((h) => h.term)
  );

  const q = query.toLowerCase();
  const slug = q.replace(/\s+/g, "-");

  const matches = valid
    .filter(
      (t) => t.includes(slug) || formatTerm(t).toLowerCase().includes(q)
    )
    .sort((a, b) => {
      const as = formatTerm(a).toLowerCase().startsWith(q) ? 0 : 1;
      const bs = formatTerm(b).toLowerCase().startsWith(q) ? 0 : 1;
      return as - bs;
    });

  suggestions.innerHTML = "";

  if (!matches.length) {
    suggestions.innerHTML = `
      <div class="search-empty">
        <span class="search-empty-icon"><span uk-icon="icon: search; ratio: 1.2"></span></span>
        <div class="search-empty-title">No components found</div>
        <p class="search-empty-text">Nothing matches &ldquo;${escapeHTML(query)}&rdquo;. Try another word.</p>
      </div>`;
    return;
  }

  suggestions.appendChild(
    createSection(
      "Components",
      matches.map((t) =>
        createItem(t, { starred: favorites.has(t), query })
      )
    )
  );
}

/* ---------- keyboard / selection ---------- */

function visibleItems() {
  const { input, suggestions, history } = getSearchEls();
  const root = input && input.value.trim() ? suggestions : history;
  return root ? [...root.querySelectorAll(".search-item")] : [];
}

function setActive(index, { scroll = true } = {}) {
  const items = visibleItems();
  items.forEach((el) => el.classList.remove("is-active"));
  if (!items.length) {
    activeIndex = -1;
    return;
  }

  activeIndex = (index + items.length) % items.length;
  const el = items[activeIndex];
  el.classList.add("is-active");
  if (scroll) el.scrollIntoView({ block: "nearest" });
}

// the input is empty -> show history, otherwise show matching components
function refreshResults() {
  const { input, suggestions, history } = getSearchEls();
  if (!input) return;

  const value = input.value.trim();
  activeIndex = -1;

  if (!value) {
    suggestions.style.display = "none";
    suggestions.innerHTML = "";
    history.style.display = "block";
    renderSearchHistory();
  } else {
    history.style.display = "none";
    suggestions.style.display = "block";
    renderSuggestions(value);
    setActive(0, { scroll: false }); // Enter opens the best match
  }
}

// kept for the form's onsubmit: opens the highlighted or best matching result
function handleSearchSubmit(event) {
  event.preventDefault();
  const items = visibleItems();
  const target = items[activeIndex] || items[0];
  if (target) fillSearch(target.dataset.term);
}

/* ---------- events (delegated, the modal is injected after load) ---------- */

document.addEventListener("input", (e) => {
  if (e.target.id === "search-input") refreshResults();
});

document.addEventListener("keydown", (e) => {
  // open search with Cmd/Ctrl + K
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    UIkit.modal("#search-modal").show();
    return;
  }

  if (!e.target || e.target.id !== "search-input") return;

  if (e.key === "ArrowDown") {
    e.preventDefault();
    setActive(activeIndex + 1);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    setActive(activeIndex - 1);
  }
});

document.addEventListener("click", (e) => {
  const modal = e.target.closest("#search-modal");
  if (!modal) return;

  const action = e.target.closest("[data-action]");
  const item = e.target.closest(".search-item");
  const chip = e.target.closest(".search-chip");

  if (action) {
    e.preventDefault();
    e.stopPropagation();
    const row = action.closest(".search-item");

    if (action.dataset.action === "star" && row) toggleFavorite(row.dataset.term);
    if (action.dataset.action === "remove" && row) removeFromHistory(row.dataset.term);
    if (action.dataset.action === "clear") clearRecent();

    // keep the same view after changing a favorite
    const { input } = getSearchEls();
    const scroller = modal.querySelector(".search-body");
    const top = scroller ? scroller.scrollTop : 0;
    if (input && input.value.trim()) renderSuggestions(input.value.trim());
    else renderSearchHistory();
    if (scroller) scroller.scrollTop = top;
    return;
  }

  if (chip) {
    fillSearch(chip.dataset.term);
    return;
  }

  if (item) fillSearch(item.dataset.term);
});

// hovering moves the highlight so it matches the keyboard selection
document.addEventListener("mouseover", (e) => {
  const item = e.target.closest && e.target.closest("#search-modal .search-item");
  if (!item) return;
  const index = visibleItems().indexOf(item);
  if (index !== -1 && index !== activeIndex) setActive(index, { scroll: false });
});

// reset every time the modal opens
if (window.UIkit) {
  UIkit.util.on(document, "show", "#search-modal", () => {
    const { input } = getSearchEls();
    if (input) input.value = "";
    refreshResults();
  });

  UIkit.util.on(document, "shown", "#search-modal", () => {
    const { input } = getSearchEls();
    if (input) input.focus();
  });
}
