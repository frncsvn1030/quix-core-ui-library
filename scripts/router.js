document.addEventListener('DOMContentLoaded', () => {
  const main = document.getElementById('main-content');
  const sidebar = document.getElementById('right-sidebar');
  const options = document.querySelectorAll('.option');

  const loadPage = (name) => {
    // load main content
    fetch(`components/${name}.html`)
      .then(res => res.text())
      .then(html => {
        main.innerHTML = html;
        setTimeout(() => {
          if (window.initScrollAndProgress) initScrollAndProgress();
        }, 10);
        const script = document.createElement('script');
        script.src = `components/scripts/${name}.js`;
        script.defer = true;
        document.body.appendChild(script);
      });

    // load right sidebar
    fetch(`components/sidebars/${name}-right.html`)
      .then(res => res.text())
      .then(html => sidebar.innerHTML = html)
      .catch(() => sidebar.innerHTML = '');
  };

  const defaultPage = localStorage.getItem('currentPage') || 'button';
  loadPage(defaultPage);

  options.forEach(option => {
    option.addEventListener('click', (e) => {
      e.preventDefault();
      const name = option.textContent.trim().toLowerCase().replace(/ & /g, '-').replace(/\s+/g, '-');
      localStorage.setItem('currentPage', name);
      loadPage(name);
    });
  });
});
