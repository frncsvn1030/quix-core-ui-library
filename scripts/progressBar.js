function initScrollAndProgress() {
  const sections = document.querySelectorAll(".section");
  const navLinks = document.querySelectorAll(".nav-link");
  const progressFill = document.getElementById("progressFill");
  const navItems = document.querySelectorAll(".sidebar-nav li");

  if (!sections.length || !navLinks.length || !progressFill || !navItems.length)
    return;

  // scroll to section w/o hiding it behind navbar
  const OFFSET = 100;

  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href");
      const targetSection = document.querySelector(targetId);

      if (targetSection) {
        const targetOffset = targetSection.offsetTop - OFFSET;

        window.scrollTo({
          top: targetOffset,
          behavior: "smooth",
        });
      }
    });
  });

  // check which section is in view
  function updateProgress() {
    const scrollY = window.scrollY;
    let currentIndex = -1;

    sections.forEach((section, index) => {
      const top = section.offsetTop - 300;
      const bottom = top + section.offsetHeight;

      if (scrollY >= top && scrollY < bottom) {
        currentIndex = index;
      }
    });

    const isAtBottom =
      window.innerHeight + scrollY >= document.body.scrollHeight - 2;

    if (isAtBottom) {
      currentIndex = sections.length - 1;
      navLinks[currentIndex].classList.add("active");
      progressFill.style.height = "100%"; // Fill the full height
      return;
    }

    // higlight nav link and update progress
    if (currentIndex >= 0) {
      navLinks.forEach((link) => link.classList.remove("active"));
      navLinks[currentIndex].classList.add("active");

      const currentItem = navItems[currentIndex];
      const height = currentItem.offsetTop + currentItem.offsetHeight / 2;
      progressFill.style.height = height + "px";
    }
  }

  // update on scroll
  window.removeEventListener("scroll", updateProgress); // avoid duplicates
  window.addEventListener("scroll", updateProgress);
  updateProgress(); // run once on load
}
