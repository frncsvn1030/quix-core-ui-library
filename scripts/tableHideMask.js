window.addEventListener('DOMContentLoaded', () => {
  const waitForWrapper = setInterval(() => {
    const wrapper = document.querySelector('.table-wrapper');
    if (wrapper) {
      clearInterval(waitForWrapper);

      wrapper.addEventListener('scroll', () => {
        const isAtBottom = Math.ceil(wrapper.scrollTop + wrapper.clientHeight) >= wrapper.scrollHeight;
        wrapper.classList.toggle('no-mask', isAtBottom);
      });
    }
  }, 100);
});
