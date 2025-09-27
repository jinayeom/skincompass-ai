const statusEl = document.getElementById("status");
const profileEl = document.getElementById("profile");
const openOptionsEl = document.getElementById("openOptions");

openOptionsEl.addEventListener("click", async (e) => {
  e.preventDefault();
  // Opens the Options page
  chrome.runtime.openOptionsPage();
});

async function loadProfile() {
  const { profile } = await chrome.storage.sync.get("profile");
  if (!profile) {
    profileEl.textContent = "No profile yet. Open Options to create one.";
    return;
  }
  profileEl.textContent = JSON.stringify(profile, null, 2);
}

async function pingBackground() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: "PING" }, (res) => {
      if (chrome.runtime.lastError) {
        statusEl.textContent = "Background not responding";
        resolve();
      } else {
        statusEl.textContent = "Side Panel ready";
        resolve(res);
      }
    });
  });
}

(async function init() {
  await pingBackground();
  await loadProfile();
})();

