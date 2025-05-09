document.addEventListener("DOMContentLoaded", function () {
    const hash = window.location.hash.substring(1); // remove '#'
    if (hash) {
      const switcher = UIkit.switcher('.uk-switcher');
      const targets = document.querySelectorAll('.uk-switcher > li');
      targets.forEach((el, index) => {
        if (el.id === hash) {
          switcher.show(index);
        }
      });
    }
});

