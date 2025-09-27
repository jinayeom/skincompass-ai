const $ = (id) => document.getElementById(id);
const concerns = $("concerns");
const sensitivity = $("sensitivity");
const goals = $("goals");
const msg = $("msg");
const saveBtn = $("save");

async function load() {
  const { profile } = await chrome.storage.sync.get("profile");
  if (profile) {
    concerns.value = (profile.concerns || []).join(", ");
    sensitivity.value = profile.sensitivity || "";
    goals.value = (profile.goals || []).join(", ");
  }
}

saveBtn.addEventListener("click", async () => {
  const profile = {
    concerns: concerns.value.split(",").map(s => s.trim()).filter(Boolean),
    sensitivity: sensitivity.value || "",
    goals: goals.value.split(",").map(s => s.trim()).filter(Boolean)
  };
  await chrome.storage.sync.set({ profile });
  msg.textContent = "Saved.";
  setTimeout(() => msg.textContent = "", 1200);
});

load();

