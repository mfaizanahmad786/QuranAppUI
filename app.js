const screens = document.querySelectorAll(".screen[data-screen]");
const tabs = document.querySelectorAll(".tab");
const tabbar = document.querySelector(".tabbar");
const drawer = document.getElementById("drawer");
const searchOverlay = document.getElementById("search-overlay");
const reader = document.getElementById("screen-reader");
const readerPageLabel = document.getElementById("reader-page-label");
const readerPosition = document.getElementById("reader-position");
const readerPrev = document.getElementById("reader-prev");
const readerNext = document.getElementById("reader-next");

const complete = document.getElementById("screen-complete");
const completeDone = document.getElementById("complete-done");
const completeStreak = document.getElementById("complete-streak");
const homeStreak = document.getElementById("home-streak");
const statStreak = document.getElementById("stat-streak");
const statPages = document.getElementById("stat-pages");
const checkLottie = document.getElementById("check-lottie");

const SESSION_PAGES = [22, 23, 24];
const BASE_STREAK = 14;
let readerIndex = 0;
let streak = BASE_STREAK;
let sessionFinished = false;
let checkAnim = null;

function renderReaderPage() {
  const page = SESSION_PAGES[readerIndex];
  const last = readerIndex === SESSION_PAGES.length - 1;
  if (readerPageLabel) readerPageLabel.textContent = `Page ${page} of 604`;
  if (readerPosition) readerPosition.textContent = `Page ${readerIndex + 1}`;
  if (readerPrev) readerPrev.disabled = readerIndex === 0;
  if (readerNext) {
    readerNext.disabled = false;
    readerNext.textContent = last ? "Complete" : "Next page";
    readerNext.classList.toggle("is-complete", last);
  }
}

function openReader() {
  readerIndex = 0;
  renderReaderPage();
  complete.hidden = true;
  complete.classList.remove("is-active");
  reader.hidden = false;
  reader.classList.add("is-active");
  tabbar.hidden = true;
}

function updateStreakDisplay() {
  if (homeStreak) homeStreak.textContent = String(streak);
  if (statStreak) statStreak.textContent = String(streak);
  const homeWrap = homeStreak?.closest(".streak");
  if (homeWrap) homeWrap.setAttribute("aria-label", `${streak} day streak`);
}

function animateStreak(from, to) {
  const fromEl = document.getElementById("streak-from");
  const toEl = document.getElementById("streak-to");
  if (fromEl) fromEl.textContent = String(from);
  if (toEl) toEl.textContent = String(to);
  completeStreak?.classList.remove("is-lit", "is-rolled");
  void completeStreak?.offsetWidth;
  window.setTimeout(() => {
    completeStreak?.classList.add("is-lit");
  }, 700);
  window.setTimeout(() => {
    completeStreak?.classList.add("is-rolled");
    updateStreakDisplay();
  }, 980);
}

function showComplete() {
  const from = sessionFinished ? streak - 1 : streak;
  const to = sessionFinished ? streak : streak + 1;
  if (!sessionFinished) {
    streak = to;
    sessionFinished = true;
    if (statPages) statPages.textContent = String(Number(statPages.textContent) + SESSION_PAGES.length);
  }
  reader.hidden = true;
  reader.classList.remove("is-active");
  complete.hidden = false;
  complete.classList.add("is-active");
  tabbar.hidden = true;
  playCheckAnimation();
  animateStreak(from, to);
}

function playCheckAnimation() {
  if (!checkLottie) return;
  if (checkAnim) {
    checkAnim.destroy();
    checkAnim = null;
  }
  checkLottie.innerHTML = "";
  if (window.lottie) {
    checkAnim = window.lottie.loadAnimation({
      container: checkLottie,
      renderer: "svg",
      loop: false,
      autoplay: true,
      path: "assets/check-animation.json",
    });
  }
}

function closeComplete() {
  showScreen("home");
}

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
  if (complete) {
    complete.hidden = true;
    complete.classList.remove("is-active");
  }
  tabbar.hidden = false;
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => showScreen(tab.dataset.tab));
});

function openDrawer() {
  if (!drawer) return;
  drawer.hidden = false;
  void drawer.offsetWidth;
  drawer.classList.add("is-open");
}

function closeDrawer() {
  if (!drawer || drawer.hidden) return;
  drawer.classList.remove("is-open");
  window.setTimeout(() => {
    if (!drawer.classList.contains("is-open")) drawer.hidden = true;
  }, 340);
}

document.querySelectorAll("[data-open]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.open;
    if (target === "menu") openDrawer();
    if (target === "search") searchOverlay.hidden = false;
    if (target === "reader") {
      openReader();
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
  if (event.target === drawer) closeDrawer();
});

drawer.querySelectorAll("[data-go]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const name = btn.dataset.go;
    closeDrawer();
    if (name) showScreen(name);
  });
});

const signOut = document.getElementById("drawer-signout");
if (signOut) {
  signOut.addEventListener("click", () => {
    closeDrawer();
    showScreen("home");
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && drawer && !drawer.hidden) closeDrawer();
});

const initial = new URLSearchParams(location.search).get("screen");
if (initial) showScreen(initial);

const themeToggle = document.getElementById("theme-toggle");
const themeSeg = document.getElementById("theme-seg");
const themeSegButtons = document.querySelectorAll("[data-theme-set]");

function currentTheme() {
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("khatm-theme", theme);
  const isDark = theme === "dark";
  if (themeToggle) themeToggle.checked = isDark;
  if (themeSeg) themeSeg.classList.toggle("is-dark", isDark);
  themeSegButtons.forEach((btn) => {
    const active = btn.dataset.themeSet === theme;
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-checked", String(active));
  });
}

applyTheme(currentTheme());

if (themeToggle) {
  themeToggle.addEventListener("change", () => {
    applyTheme(themeToggle.checked ? "dark" : "light");
  });
}

themeSegButtons.forEach((btn) => {
  btn.addEventListener("click", () => applyTheme(btn.dataset.themeSet));
});

if (readerPrev) {
  readerPrev.addEventListener("click", () => {
    if (readerIndex > 0) {
      readerIndex -= 1;
      renderReaderPage();
    }
  });
}

if (readerNext) {
  readerNext.addEventListener("click", () => {
    if (readerIndex < SESSION_PAGES.length - 1) {
      readerIndex += 1;
      renderReaderPage();
    } else {
      showComplete();
    }
  });
}

if (completeDone) {
  completeDone.addEventListener("click", closeComplete);
}

const READ_DAYS = [1, 3, 4, 7, 8, 12, 13, 14, 18, 21, 22, 25, 27, 28];
const dayReadings = {};
READ_DAYS.forEach((day, index) => {
  const start = index * 3 + 1;
  const end = start + 2;
  const juz = start <= 21 ? 1 : start <= 41 ? 2 : 3;
  dayReadings[day] = { start, end, juz };
});

const dayPop = document.getElementById("day-pop");
const dayPopDate = document.getElementById("day-pop-date");
const dayPopPages = document.getElementById("day-pop-pages");
const dayPopJuz = document.getElementById("day-pop-juz");
const activityCard = document.querySelector(".activity-card");

function hideDayPop() {
  if (dayPop) {
    dayPop.hidden = true;
    dayPop.classList.remove("is-open");
  }
  document.querySelectorAll(".cell.is-selected").forEach((cell) => {
    cell.classList.remove("is-selected");
  });
}

function showDayPop(cell) {
  const day = Number(cell.dataset.day);
  if (!day || !dayPop || !activityCard) return;

  const reading = dayReadings[day];
  dayPopDate.textContent = `${day} August 2026`;
  if (reading) {
    dayPopPages.textContent = `3 pages · ${reading.start} – ${reading.end}`;
    dayPopJuz.textContent = `Juz ${reading.juz}`;
  } else {
    dayPopPages.textContent = "No pages read";
    dayPopJuz.textContent = "Missed day";
  }

  hideDayPop();
  cell.classList.add("is-selected");
  dayPop.hidden = false;
  dayPop.classList.remove("is-above");

  const cardRect = activityCard.getBoundingClientRect();
  const cellRect = cell.getBoundingClientRect();
  let left = cellRect.left - cardRect.left + cellRect.width / 2;
  let top = cellRect.bottom - cardRect.top + 8;
  const popWidth = 160;
  left = Math.max(popWidth / 2 + 8, Math.min(left, cardRect.width - popWidth / 2 - 8));

  dayPop.style.left = `${left}px`;
  dayPop.style.top = `${top}px`;

  const popRect = dayPop.getBoundingClientRect();
  if (popRect.bottom > cardRect.bottom - 4) {
    dayPop.classList.add("is-above");
    dayPop.style.top = `${cellRect.top - cardRect.top - popRect.height - 8}px`;
  }

  requestAnimationFrame(() => {
    dayPop.classList.remove("is-open");
    void dayPop.offsetWidth;
    dayPop.classList.add("is-open");
  });
}

document.querySelectorAll(".activity-grid .cell[data-day]").forEach((cell) => {
  cell.addEventListener("click", (event) => {
    event.stopPropagation();
    if (cell.classList.contains("is-selected")) {
      hideDayPop();
      return;
    }
    showDayPop(cell);
  });
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".activity-card")) hideDayPop();
});
