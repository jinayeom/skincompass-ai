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
  if (profile) {
    let display = profile.name ? 'ProfileL ${profile.name}/n/n' : "";
    display += JSON.stringify(profile, null, 2);
    profileEl.textContent = display;
  } else {
    profileEl.textContent = "No profile yet. Open Options to create one.";
  }
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

