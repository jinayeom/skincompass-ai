const statusEl = document.getElementById('status');
const profileEl = document.getElementById('profile');
const openOptionsEl = document.getElementById('openOptions');

openOptionsEl.addEventListener('click', async (e) => {
  e.preventDefault();
  chrome.runtime.openOptionsPage();
});

async function loadProfile() {
  const { profile } = await chrome.storage.sync.get('profile');
  if (profile) {
    profileEl.innerHTML = `
      <div class="profile-info">
        ${profile.name ? `<div class="profile-name"><strong> ${profile.name}</strong></div>` : ''}
        ${profile.concerns ? `<div class="profile-item"><span class="label"> Concerns:</span> ${profile.concerns}</div>` : ''}
        ${profile.sensitivity ? `<div class="profile-item"><span class="label"> Sensitivity:</span> ${profile.sensitivity}</div>` : ''}
        ${profile.goals ? `<div class="profile-item"><span class="label"> Goals:</span> ${profile.goals}</div>` : ''}
      </div>
    `;
  } else {
    profileEl.innerHTML =
      '<div class="empty-profile"> No profile yet. Open Options to create one.</div>';
  }
}

async function pingBackground() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: 'PING' }, (res) => {
      if (chrome.runtime.lastError) {
        statusEl.textContent = 'Background not responding';
        resolve();
      } else {
        statusEl.textContent = 'Extension ready';
        resolve(res);
      }
    });
  });
}

(async function init() {
  await pingBackground();
  await loadProfile();
})();
