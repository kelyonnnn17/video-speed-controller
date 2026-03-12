const speedSlider = document.getElementById('speed');
const speedValue = document.getElementById('speedValue');
const presetButtons = document.querySelectorAll('.preset-btn');
const resetBtn = document.getElementById('resetBtn');

// Only send to tabs where content scripts can run
function canInjectTab(url) {
  return url && (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('file://'));
}

// Applies a given speed: updates UI, saves to storage, sends to tab
function applySpeed(speed) {
  const rounded = parseFloat(speed).toFixed(2);
  speedSlider.value = rounded;
  speedValue.textContent = `${parseFloat(rounded)}x`;

  chrome.storage.local.set({ videoSpeed: rounded });

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (!tabs[0] || !canInjectTab(tabs[0].url)) return;
    chrome.tabs.sendMessage(
      tabs[0].id,
      { action: 'setSpeed', speed: parseFloat(rounded) },
      () => { void chrome.runtime.lastError; } // suppress port-closed warnings
    );
  });
}

// Restore saved speed on popup open
window.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get('videoSpeed', ({ videoSpeed }) => {
    const speed = videoSpeed || '1';
    speedSlider.value = speed;
    speedValue.textContent = `${parseFloat(speed)}x`;
  });
});

// Slider input
speedSlider.addEventListener('input', function () {
  applySpeed(this.value);
});

// Preset speed buttons
presetButtons.forEach((btn) => {
  btn.addEventListener('click', function () {
    applySpeed(this.dataset.speed);
  });
});

// Reset to 1x
resetBtn.addEventListener('click', () => {
  applySpeed(1.0);
});
