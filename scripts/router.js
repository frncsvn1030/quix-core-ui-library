document.addEventListener('DOMContentLoaded', () => {
  const options = document.querySelectorAll('.option');

  function loadPage(name) {
    // load main section
    fetch(`components/${name}.html`)
      .then(res => res.text())
      .then(html => {
        document.getElementById('main-content').innerHTML = html;
        setTimeout(initScrollAndProgress, 50); // re-run scroll logic
      });

    // load sidebar 
    fetch(`components/sidebars/${name}-right.html`)
      .then(res => res.text())
      .then(html => {
        document.getElementById('right-sidebar').innerHTML = html;
      })
      .catch(() => {
        document.getElementById('right-sidebar').innerHTML = ''; // clear if not found
      });
  }

  // default page button 
  const lastPage = localStorage.getItem('currentPage') || 'button';
  loadPage(lastPage);

  // show page when clicked
  options.forEach(option => {
    option.addEventListener('click', e => {
      e.preventDefault();
      const name = option.textContent.trim().toLowerCase().replace(/ & /g, '-').replace(/\s+/g, '-');
      localStorage.setItem('currentPage', name);
      loadPage(name);
    });
  });
});
