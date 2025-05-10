document.addEventListener('DOMContentLoaded', () => {
  const options = document.querySelectorAll('.option');

  function loadContent(name) {
    // load main content
    fetch(`components/${name}.html`)
      .then(res => res.text())
      .then(data => {
        document.getElementById('main-content').innerHTML = data;
      });

    // load right sidebar content (if it exists)
    fetch(`components/sidebars/${name}-right.html`)
      .then(res => res.text())
      .then(data => {
        document.getElementById('right-sidebar').innerHTML = data;
      })
      .catch(() => {
        document.getElementById('right-sidebar').innerHTML = '';
      });
  }

  // load default content (Button)
  loadContent('button');

  // add click event to each option
  options.forEach(option => {
    option.addEventListener('click', (e) => {
      e.preventDefault();
      const name = option.textContent
        .trim()
        .toLowerCase()
        .replace(/ & /g, '-')
        .replace(/\s+/g, '-');
      loadContent(name);
    });
  });
});
