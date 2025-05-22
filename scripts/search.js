const historyKey = "searchHistory";

function handleSearchSubmit(event) {
  event.preventDefault();
  const input = document.getElementById("search-input");
  const query = input.value.trim().toLowerCase();

  if (!query) return;

  const validPages = ['button', 'accordion', 'card', 'slider']; // Extend as needed
  if (!validPages.includes(query)) {
    document.getElementById('main-content').innerHTML = `<p>No content found for "${query}".</p>`;
    return;
  }

  // If hash is already the same, call loadPage directly
  if (window.location.hash.slice(1) === query) {
    loadPage(query);
  } else {
    window.location.hash = query; // This triggers loadPage via hashchange event
  }

  saveToHistory(query);
  renderSearchHistory();
  input.value = "";
  UIkit.modal('#search-modal').hide();
}
function fillSearch(term) {
  console.log("fillSearch called with term:", term);  // <-- debug log
  if (!term) return;

  const normalized = term.trim().toLowerCase();
  if (!normalized) return;

  if (window.location.hash.slice(1) === normalized) {
    loadPage(normalized);
  } else {
    window.location.hash = normalized;
  }

  UIkit.modal('#search-modal').hide();
}




function saveToHistory(query) {
  let history = JSON.parse(localStorage.getItem(historyKey)) || [];
  if (!history.includes(query)) {
    history.unshift(query);
    if (history.length > 10) history = history.slice(0, 10);
    localStorage.setItem(historyKey, JSON.stringify(history));
  }
}

function renderSearchHistory() {
  const container = document.getElementById("search-history");
  const history = JSON.parse(localStorage.getItem(historyKey)) || [];

  container.innerHTML = '';  // Clear first

  if (!history.length) {
    container.innerHTML = "<li class='uk-text-muted'>No history yet.</li>";
    return;
  }

  history.forEach(term => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = "#";
    a.textContent = term;
    a.addEventListener('click', (e) => {
      e.preventDefault();
      fillSearch(term);
    });
    li.appendChild(a);
    container.appendChild(li);
  });
}



function clearSearchHistory() {
  localStorage.removeItem(historyKey);
  renderSearchHistory();
}

UIkit.util.on('#search-modal', 'beforeshow', renderSearchHistory);
