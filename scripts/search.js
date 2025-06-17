const historyKey = "searchHistory";
const valid = [
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

function formatTerm(term) {
  return term
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function handleSearchSubmit(event) {
  event.preventDefault();

  const input = document.getElementById("search-input");
  const term = input.value.trim().toLowerCase();
  if (!term) return;

  if (!valid.includes(term)) {
    document.getElementById(
      "main-content"
    ).innerHTML = `<p>No content found for "${term}".</p>`;
    return;
  }

  goToPage(term);
  saveToHistory(term);
  resetSearchInterface(); // Reset and show updated history

  UIkit.modal("#search-modal").hide();
}

// navigate or load the page based on the term
function goToPage(term) {
  const isHome =
    window.location.pathname.endsWith("/index.html") ||
    window.location.pathname === "/";
  const currentHash = window.location.hash.slice(1);

  if (isHome) {
    window.location.href = `docs.html#${term}`;
  } else if (currentHash === term) {
    loadPage(term);
  } else {
    window.location.hash = term;
  }
}

function fillSearch(term) {
  if (!term.trim()) return;

  const cleanTerm = term.trim().toLowerCase();
  saveToHistory(cleanTerm); // save to history when clicked
  goToPage(cleanTerm);
  resetSearchInterface(); // reset and show updated history

  UIkit.modal("#search-modal").hide();
}

// reset search interface to show history
function resetSearchInterface() {
  const searchInput = document.getElementById("search-input");
  const suggestionList = document.getElementById("search-suggestions");
  const historyContainer = document.getElementById("search-history");

  if (searchInput) searchInput.value = "";
  if (suggestionList) {
    suggestionList.innerHTML = "";
    suggestionList.style.display = "none";
  }
  if (historyContainer) historyContainer.style.display = "block";

  renderSearchHistory();
}

// save a term to localStorage history
function saveToHistory(term) {
  let history = getHistory();
  const existingIndex = history.findIndex((item) => item.term === term);

  if (existingIndex !== -1) {
    const [existing] = history.splice(existingIndex, 1);
    history.unshift(existing);
  } else {
    history.unshift({ term, starred: false });
  }

  if (history.length > 10) history = history.slice(0, 10);
  localStorage.setItem(historyKey, JSON.stringify(history));
}

// starred
function toggleStar(index) {
  let history = getHistory();
  history[index].starred = !history[index].starred;
  localStorage.setItem(historyKey, JSON.stringify(history));
  renderSearchHistory();
}

// delete
function removeItem(index) {
  let history = getHistory();
  history.splice(index, 1);
  localStorage.setItem(historyKey, JSON.stringify(history));
  renderSearchHistory();
}

// retrieve history from localStorage
function getHistory() {
  return JSON.parse(localStorage.getItem(historyKey)) || [];
}

// Render the search history list
function renderSearchHistory() {
  const container = document.getElementById("search-history");
  const history = getHistory();

  container.innerHTML = "";

  if (!history.length) {
    container.innerHTML = "<li class='uk-text-muted'>No history yet.</li>";
    return;
  }

  const recentItems = history.filter((item) => !item.starred);
  const starredItems = history.filter((item) => item.starred);

  function createHistoryItem(item, index) {
    const li = document.createElement("li");
    li.className = "custom-search-li uk-flex uk-flex-between uk-flex-middle";
    li.style.cursor = "pointer";

    li.onclick = (e) => {
      if (e.target.closest(".custom-search-icon")) return;
      fillSearch(item.term);
    };

    const text = document.createElement("div");
    text.innerHTML = `
    <div class="custom-term uk-link-text">${formatTerm(item.term)}</div>
    <small class="uk-text-meta">Component</small>
  `;

    const actions = document.createElement("div");
    actions.className = "uk-flex uk-flex-middle";

    const star = document.createElement("a");
    star.href = "#";
    star.className = "custom-search-icon uk-margin-xsmall-right";
    star.style.textDecoration = "none";
    star.style.fontSize = "1rem";
    star.innerHTML = item.starred
      ? '<i class="fas fa-star"></i>'
      : '<i class="far fa-star"></i>';
    star.title = item.starred ? "Unstar" : "Star";
    star.onclick = (e) => {
      e.preventDefault();
      toggleStar(index);
    };

    const del = document.createElement("a");
    del.href = "#";
    del.className = "custom-search-icon";
    del.style.textDecoration = "none";
    del.innerHTML = '<span uk-icon="icon: close"></span>';
    del.title = "Remove";
    del.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      removeItem(index);
    };

    actions.appendChild(star);
    actions.appendChild(del);

    li.appendChild(text);
    li.appendChild(actions);

    return li;
  }

  if (recentItems.length > 0) {
    const recentHeader = document.createElement("li");
    recentHeader.innerHTML =
      "<h4 class='custom-search-meta uk-text-meta'>Recent</h4>";
    container.appendChild(recentHeader);

    recentItems.forEach((item) => {
      const index = history.findIndex(
        (h) => h.term === item.term && h.starred === item.starred
      );
      container.appendChild(createHistoryItem(item, index));
    });
  }

  if (starredItems.length > 0) {
    const starredHeader = document.createElement("li");
    starredHeader.innerHTML =
      "<h4 class='custom-search-meta uk-text-meta'>Starred</h4>";
    if (recentItems.length > 0) {
      starredHeader.style.marginTop = "20px";
    }
    container.appendChild(starredHeader);

    starredItems.forEach((item) => {
      const index = history.findIndex(
        (h) => h.term === item.term && h.starred === item.starred
      );
      container.appendChild(createHistoryItem(item, index));
    });
  }

  let lastHovered = null;

  document.querySelectorAll(".custom-search-li").forEach((li) => {
    li.addEventListener("mouseenter", () => {
      if (lastHovered && lastHovered !== li) {
        lastHovered.classList.remove("persist-hover");
      }
      li.classList.add("persist-hover");
      lastHovered = li;
    });
  });

  UIkit.util.on("#search-modal", "hide", () => {
    if (lastHovered) {
      lastHovered.classList.remove("persist-hover");
      lastHovered = null;
    }
  });
}

function setupSearchSuggestions() {
  const searchInput = document.getElementById("search-input");
  const suggestionList = document.getElementById("search-suggestions");
  const historyContainer = document.getElementById("search-history");

  if (!searchInput || searchInput.hasAttribute("data-init")) return;
  searchInput.setAttribute("data-init", "true");

  searchInput.addEventListener("input", () => {
    const value = searchInput.value.trim().toLowerCase();
    suggestionList.innerHTML = "";

    if (!value) {
      suggestionList.style.display = "none";
      historyContainer.style.display = "block";
      return;
    }

    historyContainer.style.display = "none";

    // show all matching suggestions regardless of history
    const matches = valid.filter((term) => term.startsWith(value));

    if (!matches.length) {
      suggestionList.style.display = "none";
      return;
    }

    suggestionList.style.display = "block";

    matches.forEach((term) => {
      const li = document.createElement("li");
      li.className = "custom-search-li uk-flex uk-flex-between uk-flex-middle";
      li.style.cursor = "pointer";

      const textDiv = document.createElement("div");
      textDiv.innerHTML = `
        <div class="custom-term uk-link-text">
          ${formatTerm(term)}
        </div>
        <small class="uk-text-meta">Component</small>
      `;

      li.appendChild(textDiv);
      li.onclick = () => fillSearch(term);
      suggestionList.appendChild(li);
    });
  });
}

UIkit.util.on("#search-modal", "shown", () => {
  resetSearchInterface(); // always reset when modal opens
});

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    if (document.getElementById("search-history")) {
      renderSearchHistory();
      setupSearchSuggestions();
    }
  }, 100);
});
