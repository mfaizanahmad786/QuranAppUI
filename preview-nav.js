(function () {
  const page = document.body.dataset.preview || "";
  const nav = document.createElement("nav");
  nav.className = "preview-nav";
  nav.setAttribute("aria-label", "Preview pages");
  nav.innerHTML = `
    <button class="preview-nav-btn" type="button" data-href="home.html">Home</button>
    <button class="preview-nav-btn" type="button" data-href="onboarding.html">Onboarding</button>
  `;
  nav.querySelectorAll("[data-href]").forEach((btn) => {
    if (btn.dataset.href === page) btn.classList.add("is-current");
    btn.addEventListener("click", () => {
      window.location.href = btn.dataset.href;
    });
  });
  document.body.appendChild(nav);
})();
