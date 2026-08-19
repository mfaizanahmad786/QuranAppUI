/* ── Auth screen ── */
const authScreen = document.getElementById("auth-screen");
const authTabs = document.querySelectorAll(".auth-tab");
const authLoginForm = document.getElementById("auth-login-form");
const authSignupForm = document.getElementById("auth-signup-form");
const onboardMain = document.getElementById("onboard-main");
const onboardStatusBar = document.getElementById("onboard-status-bar");

function switchAuthTab(mode) {
  authTabs.forEach((t) => t.classList.toggle("is-active", t.dataset.tab === mode));
  authLoginForm.classList.toggle("is-active", mode === "login");
  authSignupForm.classList.toggle("is-active", mode === "signup");
}

authTabs.forEach((tab) => {
  tab.addEventListener("click", () => switchAuthTab(tab.dataset.tab));
});

function enterOnboarding() {
  authScreen.classList.add("is-hidden");
  onboardMain.style.display = "";
  onboardStatusBar.style.display = "";
  showStep(0, "forward");
}

document.getElementById("auth-login-submit").addEventListener("click", enterOnboarding);
document.getElementById("auth-signup-submit").addEventListener("click", enterOnboarding);
document.getElementById("google-auth").addEventListener("click", enterOnboarding);
document.getElementById("apple-auth").addEventListener("click", enterOnboarding);

document.querySelectorAll(".password-toggle").forEach((btn) => {
  btn.addEventListener("click", () => {
    const field = btn.previousElementSibling;
    if (!field) return;
    const isPassword = field.type === "password";
    field.type = isPassword ? "text" : "password";
    btn.setAttribute("aria-label", isPassword ? "Hide password" : "Show password");
  });
});

/* ── Onboarding flow (Name → Goal → Reminder → Summary) ── */
const steps = document.querySelectorAll(".onboard-step");
const dots = document.querySelectorAll(".onboard-dot");
const dotsWrap = document.querySelector(".onboard-dots");
const backBtn = document.getElementById("onboard-back");
const skipBtn = document.getElementById("onboard-skip");
const nextBtn = document.getElementById("onboard-next");
const nameInput = document.getElementById("onboard-name");
const customGoal = document.getElementById("custom-goal");
const customGoalInput = document.getElementById("custom-goal-days");
const customGoalHint = document.getElementById("custom-goal-hint");

const TOTAL = steps.length;
let current = 0;

const state = {
  name: "",
  goalDays: 60,
  reminder: "After Fajr",
};

function pagesPerDayFor(days) {
  return Math.max(1, Math.round(604 / days));
}

function formatGoalLabel(days) {
  return `${days} day${days === 1 ? "" : "s"}`;
}

function updateDots(index) {
  dots.forEach((dot, i) => dot.classList.toggle("is-active", i === index));
}

function updateNextLabel(index) {
  if (index === TOTAL - 1) {
    nextBtn.textContent = "Start Khatm";
    return;
  }
  nextBtn.textContent = "Continue";
}

function customDays() {
  const days = Number(customGoalInput.value);
  return Number.isInteger(days) && days >= 1 && days <= 365 ? days : null;
}

function canContinue(index) {
  if (index === 0) return nameInput.value.trim().length > 0;
  if (index === 1 && customGoal.classList.contains("is-selected")) {
    return customDays() !== null;
  }
  return true;
}

function refreshNextState() {
  nextBtn.disabled = !canContinue(current);
}

function updateSummary() {
  document.getElementById("summary-name").textContent = nameInput.value.trim() || "—";
  document.getElementById("summary-goal").textContent = formatGoalLabel(state.goalDays);
  document.getElementById("summary-pages").textContent = `${pagesPerDayFor(state.goalDays)} pages / day`;
  document.getElementById("summary-reminder").textContent = state.reminder;
}

function showStep(index, direction) {
  steps.forEach((step, i) => {
    step.classList.remove("is-active", "is-exiting");
    if (i === index) step.classList.add("is-active");
    else if (direction === "back" && i === index + 1) step.classList.add("is-exiting");
    else if (direction === "forward" && i === index - 1) step.classList.add("is-exiting");
  });

  current = index;
  backBtn.classList.toggle("is-visible", index > 0);
  skipBtn.style.visibility = index >= 1 ? "visible" : "hidden";
  updateDots(index);
  updateNextLabel(index);
  if (index === TOTAL - 1) updateSummary();
  refreshNextState();
}

function finishOnboarding() {
  window.location.href = "index.html";
}

function goNext() {
  if (!canContinue(current)) return;
  if (current === TOTAL - 1) {
    finishOnboarding();
    return;
  }
  showStep(current + 1, "forward");
}

function goBack() {
  if (current === 0) return;
  showStep(current - 1, "back");
}

function selectPresetGoal(days) {
  document.querySelectorAll("[data-goal]").forEach((el) => el.classList.remove("is-selected"));
  customGoal.classList.remove("is-selected");
  const preset = document.querySelector(`[data-goal="${days}"]`);
  if (preset) preset.classList.add("is-selected");
  customGoalHint.textContent = "Set your own number of days";
  state.goalDays = days;
  refreshNextState();
}

document.querySelectorAll("[data-goal]").forEach((btn) => {
  btn.addEventListener("click", () => selectPresetGoal(Number(btn.dataset.goal)));
});

function selectCustomGoal() {
  document.querySelectorAll("[data-goal]").forEach((el) => el.classList.remove("is-selected"));
  customGoal.classList.add("is-selected");
  const days = customDays();
  if (days) {
    state.goalDays = days;
    customGoalHint.textContent = `~${pagesPerDayFor(days)} pages per day`;
  } else {
    customGoalHint.textContent = "Enter 1–365 days";
  }
  refreshNextState();
}

customGoal.addEventListener("click", () => {
  selectCustomGoal();
  customGoalInput.focus();
});

customGoalInput.addEventListener("focus", selectCustomGoal);
customGoalInput.addEventListener("input", selectCustomGoal);

document.querySelectorAll("[data-reminder]").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("[data-reminder]").forEach((el) => el.classList.remove("is-selected"));
    btn.classList.add("is-selected");
    state.reminder = btn.dataset.reminder;
    document.getElementById("summary-reminder").textContent = state.reminder;
  });
});

nameInput.addEventListener("input", () => {
  document.getElementById("summary-name").textContent = nameInput.value.trim() || "—";
  refreshNextState();
});

nextBtn.addEventListener("click", goNext);
backBtn.addEventListener("click", goBack);
skipBtn.addEventListener("click", finishOnboarding);
