document.addEventListener("click", (e) => {
  const button = e.target.closest(".copy-button");
  if (!button) return;

  const codeContent = button.closest(".code-content-wrapper");
  const clone = codeContent.cloneNode(true);
  clone.querySelector(".copy-button").remove();

  navigator.clipboard.writeText(clone.innerText.trim()).then(() => {
    const originalText = button.innerHTML;
    button.innerHTML = "Copied!";
    button.disabled = true;

    setTimeout(() => {
      button.innerHTML = originalText;
      button.disabled = false;
    }, 1500);
  });
});
