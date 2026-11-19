// Leonida Trophy Guide — checklist, filters, spoiler hiding, export/import.
// Everything runs offline: the only file fetched is data/trophies.json, and the
// only thing saved is the player's own progress in localStorage.

const STORAGE_KEY = "leonida-trophy-progress-v1";
const SPOILER_KEY = "leonida-trophy-spoilers-v1";

const listEl = document.getElementById("trophyList");
const countEl = document.getElementById("resultCount");
const emptyEl = document.getElementById("emptyState");
const searchEl = document.getElementById("searchInput");
const kindEl = document.getElementById("kindFilter");
const gradeEl = document.getElementById("gradeFilter");
const spoilerEl = document.getElementById("spoilerToggle");
const progressTextEl = document.getElementById("progressText");
const progressPctEl = document.getElementById("progressPct");
const progressBarEl = document.getElementById("progressBar");
const progressWrapEl = document.getElementById("progressBarWrap");
const gradeCountsEl = document.getElementById("gradeCounts");
const exportBtn = document.getElementById("exportBtn");
const importInput = document.getElementById("importInput");
const importStatusEl = document.getElementById("importStatus");
const resetBtn = document.getElementById("resetBtn");
const missableListEl = document.getElementById("missableList");

const response = await fetch("data/trophies.json");
const data = await response.json();
const trophies = data.trophies;

// Earned trophies are stored by id so a rename can never silently un-earn one.
let earnedIds = new Set(loadStoredIds());
let expandedId = null;

function loadStoredIds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((n) => Number.isInteger(n)) : [];
  } catch {
    return [];
  }
}

function persistProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...earnedIds].sort((a, b) => a - b)));
}

function persistSpoilers() {
  localStorage.setItem(SPOILER_KEY, spoilerEl.checked ? "on" : "off");
}

function loadSpoilerSetting() {
  const saved = localStorage.getItem(SPOILER_KEY);
  if (saved === "off") spoilerEl.checked = false;
  if (saved === "on") spoilerEl.checked = true;
}

function gradeLabel(grade) {
  return grade.charAt(0).toUpperCase() + grade.slice(1);
}

function kindLabel(kind) {
  return kind.charAt(0).toUpperCase() + kind.slice(1);
}

function isHiddenBySpoilers(trophy) {
  return spoilerEl.checked && trophy.kind === "story" && !earnedIds.has(trophy.id);
}

function trophyMatches(trophy) {
  const query = searchEl.value.trim().toLowerCase();
  if (query) {
    const haystack = [trophy.name, trophy.description, trophy.guide, trophy.kind, trophy.grade]
      .join(" ")
      .toLowerCase();
    if (!haystack.includes(query)) return false;
  }
  if (kindEl.value === "missable" && !trophy.missable) return false;
  if (kindEl.value === "online") return false; // No online trophies: the list is single-player only.
  if (kindEl.value !== "all" && kindEl.value !== "missable" && kindEl.value !== "online" && trophy.kind !== kindEl.value) return false;
  if (gradeEl.value !== "all" && trophy.grade !== gradeEl.value) return false;
  return true;
}

function makeBadge(text, className) {
  const badge = document.createElement("span");
  badge.className = "badge " + className;
  badge.textContent = text;
  return badge;
}

function buildSourcesList(trophy) {
  const heading = document.createElement("h4");
  heading.textContent = "Sources";
  const list = document.createElement("ul");
  list.className = "guide-sources";
  for (const source of trophy.sources || []) {
    const item = document.createElement("li");
    const link = document.createElement("a");
    link.href = source.url;
    link.textContent = source.name;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    item.append(link);
    list.append(item);
  }
  return [heading, list];
}

function buildGuideBody(trophy) {
  const body = document.createElement("div");
  body.className = "guide-body";
  const heading = document.createElement("h4");
  heading.textContent = "Guide";
  const text = document.createElement("p");
  text.textContent = trophy.guide;
  body.append(heading, text, ...buildSourcesList(trophy));
  return body;
}

function buildCard(trophy, idPrefix) {
  const prefix = idPrefix || "trophy-";
  const earned = earnedIds.has(trophy.id);
  const card = document.createElement("article");
  card.className = "trophy-card" + (earned ? " earned" : "") + (trophy.missable ? " missable-card" : "");
  card.id = prefix + trophy.id;

  const top = document.createElement("div");
  top.className = "card-top";

  const box = document.createElement("input");
  box.type = "checkbox";
  box.checked = earned;
  box.setAttribute("aria-label", "Mark " + trophy.name + " as earned");
  box.addEventListener("change", () => {
    if (box.checked) earnedIds.add(trophy.id);
    else earnedIds.delete(trophy.id);
    persistProgress();
    refresh();
  });

  const main = document.createElement("div");
  main.className = "card-main";

  const titleRow = document.createElement("div");
  titleRow.className = "card-title";
  const title = document.createElement("h3");
  const hidden = isHiddenBySpoilers(trophy);
  title.textContent = hidden ? "Hidden story trophy" : trophy.name;
  titleRow.append(title);
  if (!hidden) {
    titleRow.append(makeBadge(gradeLabel(trophy.grade), "badge-" + trophy.grade));
    titleRow.append(makeBadge(kindLabel(trophy.kind), "badge-kind"));
    if (trophy.missable) titleRow.append(makeBadge("Missable", "badge-missable"));
  }
  if (earned) titleRow.append(makeBadge("Earned", "badge-earned"));
  main.append(titleRow);

  const desc = document.createElement("p");
  desc.className = hidden ? "hidden-note" : "trophy-desc";
  desc.textContent = hidden
    ? "Hidden until earned — turn off “Hide story spoilers” above, or tick this trophy once you have earned it."
    : trophy.description;
  main.append(desc);

  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "guide-toggle";
  const open = expandedId === trophy.id;
  toggle.textContent = open ? "Hide guide ▲" : "Show guide + sources ▼";
  toggle.setAttribute("aria-expanded", String(open));
  toggle.addEventListener("click", () => {
    expandedId = expandedId === trophy.id ? null : trophy.id;
    refresh();
    if (expandedId === trophy.id) {
      document.getElementById(prefix + trophy.id)?.scrollIntoView({ block: "nearest" });
    }
  });
  main.append(toggle);
  if (open) main.append(buildGuideBody(trophy));

  top.append(box, main);
  card.append(top);
  return card;
}

function renderProgress() {
  const total = trophies.length;
  const done = earnedIds.size;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  progressTextEl.textContent = done + " of " + total + " earned";
  progressPctEl.textContent = pct + "%";
  progressBarEl.style.width = pct + "%";
  progressWrapEl.setAttribute("aria-valuenow", String(done));
  const byGrade = {};
  for (const trophy of trophies) {
    byGrade[trophy.grade] = byGrade[trophy.grade] || { done: 0, total: 0 };
    byGrade[trophy.grade].total += 1;
    if (earnedIds.has(trophy.id)) byGrade[trophy.grade].done += 1;
  }
  const order = ["platinum", "gold", "silver", "bronze"];
  gradeCountsEl.textContent = order
    .map((g) => gradeLabel(g) + " " + (byGrade[g]?.done ?? 0) + "/" + (byGrade[g]?.total ?? 0))
    .join(" · ");
}

function renderMissableCallout() {
  missableListEl.replaceChildren();
  for (const trophy of trophies.filter((t) => t.missable)) {
    // A different id prefix: this trophy also appears in the main checklist.
    missableListEl.append(buildCard(trophy, "missable-"));
  }
}

function refresh() {
  renderProgress();
  renderMissableCallout();
  const visible = trophies.filter(trophyMatches);
  countEl.textContent = "Showing " + visible.length + " of " + trophies.length + " trophies";
  emptyEl.hidden = visible.length !== 0;
  listEl.replaceChildren();
  for (const trophy of visible) listEl.append(buildCard(trophy));
}

function exportProgress() {
  const payload = {
    game: "Grand Theft Auto VI",
    exportedAt: new Date().toISOString(),
    earned: [...earnedIds].sort((a, b) => a - b),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "gta6-trophy-progress.json";
  link.click();
  URL.revokeObjectURL(link.href);
  importStatusEl.textContent = "Progress exported.";
}

async function importProgress(file) {
  try {
    const parsed = JSON.parse(await file.text());
    const ids = Array.isArray(parsed) ? parsed : parsed.earned;
    if (!Array.isArray(ids)) throw new Error("not a progress file");
    const known = new Set(trophies.map((t) => t.id));
    const clean = ids.filter((n) => Number.isInteger(n) && known.has(n));
    earnedIds = new Set(clean);
    persistProgress();
    refresh();
    importStatusEl.textContent = "Imported " + clean.length + " earned trophies.";
  } catch {
    importStatusEl.textContent = "That file is not valid progress — nothing was changed.";
  }
}

function applyShareableView() {
  const params = new URLSearchParams(location.search);
  const kind = params.get("kind");
  if (kind && ["story", "missable", "collectibles", "activities", "online"].includes(kind)) kindEl.value = kind;
  const grade = params.get("grade");
  if (grade && ["platinum", "gold", "silver", "bronze"].includes(grade)) gradeEl.value = grade;
  const spoilers = params.get("spoilers");
  if (spoilers === "off") spoilerEl.checked = false;
  if (spoilers === "on") spoilerEl.checked = true;
  const query = params.get("q");
  if (query) searchEl.value = query;
  const trophy = Number(params.get("trophy"));
  if (Number.isInteger(trophy) && trophies.some((t) => t.id === trophy)) expandedId = trophy;
  const hash = location.hash.match(/^#trophy-(\d+)$/);
  if (hash) {
    const id = Number(hash[1]);
    if (trophies.some((t) => t.id === id)) expandedId = id;
  }
}

searchEl.addEventListener("input", refresh);
kindEl.addEventListener("change", refresh);
gradeEl.addEventListener("change", refresh);
spoilerEl.addEventListener("change", () => {
  persistSpoilers();
  refresh();
});
exportBtn.addEventListener("click", exportProgress);
importInput.addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (file) importProgress(file);
  importInput.value = "";
});
resetBtn.addEventListener("click", () => {
  if (!earnedIds.size) return;
  if (window.confirm("Clear all earned trophies? This cannot be undone.")) {
    earnedIds = new Set();
    persistProgress();
    refresh();
  }
});

loadSpoilerSetting();
applyShareableView();
renderMissableCallout();
refresh();
if (expandedId !== null) {
  document.getElementById("trophy-" + expandedId)?.scrollIntoView();
}
