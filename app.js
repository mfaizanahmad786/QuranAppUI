const screens = document.querySelectorAll(".screen[data-screen]");
const tabs = document.querySelectorAll(".tab");
const tabbar = document.querySelector(".tabbar");
const drawer = document.getElementById("drawer");
const searchOverlay = document.getElementById("search-overlay");
const reader = document.getElementById("screen-reader");

function showScreen(name) {
  screens.forEach((screen) => {
    const active = screen.dataset.screen === name;
    screen.classList.toggle("is-active", active);
    screen.hidden = !active;
  });
  tabs.forEach((tab) => {
    tab.classList.toggle("is-active", tab.dataset.tab === name);
  });
  reader.hidden = true;
  reader.classList.remove("is-active");
  tabbar.hidden = false;
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => showScreen(tab.dataset.tab));
});

document.querySelectorAll("[data-open]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.open;
    if (target === "menu") drawer.hidden = false;
    if (target === "search") searchOverlay.hidden = false;
    if (target === "reader") {
      reader.hidden = false;
      reader.classList.add("is-active");
      tabbar.hidden = true;
    }
  });
});

document.querySelectorAll("[data-close]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.close;
    if (target === "search") searchOverlay.hidden = true;
    if (target === "reader") {
      reader.hidden = true;
      reader.classList.remove("is-active");
      tabbar.hidden = false;
    }
  });
});

drawer.addEventListener("click", (event) => {
  if (event.target === drawer) drawer.hidden = true;
});

const initial = new URLSearchParams(location.search).get("screen");
if (initial) showScreen(initial);
