const $ = (id) => document.getElementById(id);
const profileName = $("profileName");
const concernsHidden = $("concerns");     // hidden CSV store
const sensitivity = $("sensitivity");
const goals = $("goals");
const msg = $("msg");
const saveBtn = $("save");

// ====== new selectors for chips/typeahead control ======
const chipsWrap = $("concernsChips");
const concernsInput = $("concernsInput");

// ====== presets (20 common concerns) ======
const PRESET = new Set([
  "acne","acne scars","hyperpigmentation","melasma","dark spots",
  "redness / rosacea","sensitivity","eczema","psoriasis","dryness",
  "dehydration","oiliness","enlarged pores","blackheads","whiteheads",
  "wrinkles","fine lines","uneven texture","sun damage","dullness"
]);

const selected = new Set();

// ---------- helpers ----------
const normalize = (s) => s.trim().replace(/\s+/g, " ").toLowerCase();

function syncHidden() {
  concernsHidden.value = [...selected].join(", ");
}

function renderChips() {
  if (!chipsWrap) return;
  chipsWrap.innerHTML = "";
  [...selected].forEach((label) => {
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.innerHTML = `
      <span>${label}</span>
      <button type="button" aria-label="Remove ${label}">×</button>
    `;
    chip.querySelector("button").addEventListener("click", () => {
      selected.delete(label);
      syncHidden();
      renderChips();
      concernsInput?.focus();
    });
    chipsWrap.appendChild(chip);
  });
}

function addConcern(raw) {
  if (!raw) return;
  const val = normalize(raw);
  if (!val) return;
  if (selected.has(val)) return;
  selected.add(val);
  syncHidden();
  renderChips();
}

function addFromTypedString(str) {
  const parts = str.split(",").map(s => s.trim()).filter(Boolean);
  parts.forEach(addConcern);
}

function hydrateFromArray(arr) {
  selected.clear();
  (arr || []).map(normalize).filter(Boolean).forEach(addConcern);
}

function hydrateFromCSV(csv) {
  selected.clear();
  (csv || "").split(",").map(s => s.trim()).filter(Boolean).forEach(addConcern);
}

// ---------- load existing profile ----------
async function load() {
  const { profile } = await chrome.storage.sync.get("profile");
  if (profile) {
    profileName.value = profile.name || "";
    hydrateFromArray(profile.concerns || []);

    sensitivity.value = profile.sensitivity || "";
    goals.value = (profile.goals || []).join(", ");
  } else {
    // No profile yet. Make sure hidden is in sync with empty set.
    syncHidden();
  }
}

// ---------- input interactions for concerns ----------
if (concernsInput) {
  // Enter or comma adds current token(s)
  concernsInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addFromTypedString(concernsInput.value);
      concernsInput.value = "";
    } else if (e.key === "Backspace" && concernsInput.value === "" && selected.size) {
      // Remove last chip with Backspace
      const last = [...selected].pop();
      selected.delete(last);
      syncHidden();
      renderChips();
    }
  });

  // Picking a datalist option triggers change
  concernsInput.addEventListener("change", () => {
    if (!concernsInput.value) return;
    addFromTypedString(concernsInput.value);
    concernsInput.value = "";
  });

  // Optional: on blur, add whatever is typed
  concernsInput.addEventListener("blur", () => {
    if (concernsInput.value.trim()) {
      addFromTypedString(concernsInput.value);
      concernsInput.value = "";
    }
  });
}

// ---------- save ----------
saveBtn.addEventListener("click", async () => {
  // Make sure hidden CSV reflects chips before splitting
  syncHidden();

  const profile = {
    name: profileName.value.trim(),
    // store as array in sync, as you already do
    concerns: concernsHidden.value.split(",").map(s => s.trim()).filter(Boolean),
    sensitivity: sensitivity.value || "",
    goals: goals.value.split(",").map(s => s.trim()).filter(Boolean)
  };

  await chrome.storage.sync.set({ profile });
  msg.textContent = "Saved.";
  setTimeout(() => (msg.textContent = ""), 1200);
});

// kick off
load();
