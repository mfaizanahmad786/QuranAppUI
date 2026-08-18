const steps = document.querySelectorAll(".onboard-step");
const dots = document.querySelectorAll(".onboard-dot");
const phone = document.querySelector(".phone");
const onboard = document.querySelector(".onboard");
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
  dots.forEach((dot, i) => {
    dot.classList.toggle("is-active", i === index);
  });
}

function updateNextLabel(index) {
  if (index === TOTAL - 1) {
    nextBtn.textContent = "Start Khatm";
    return;
  }
  nextBtn.textContent = index === 0 ? "Get started" : "Continue";
}

function customDays() {
  const days = Number(customGoalInput.value);
  return Number.isInteger(days) && days >= 1 && days <= 365 ? days : null;
}

function canContinue(index) {
  if (index === 1) return nameInput.value.trim().length > 0;
  if (index === 2 && customGoal.classList.contains("is-selected")) {
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
  phone?.classList.toggle("is-welcome", index === 0);
  onboard?.classList.toggle("is-welcome", index === 0);
  if (dotsWrap) dotsWrap.hidden = index === 0;
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

showStep(0);
