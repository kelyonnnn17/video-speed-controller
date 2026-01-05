const speedSlider = document.getElementById('speed');
const speedValue = document.getElementById('speedValue');

// retrieves saved speed value from localStorage
window.addEventListener('DOMContentLoaded', () => {
  const savedSpeed = localStorage.getItem('videoSpeed');
  if (savedSpeed) {
    speedSlider.value = savedSpeed;
    speedValue.textContent = `${savedSpeed}x`;
  } else {
    speedValue.textContent = '1x'; // Default speed
  }
});

// updates the speed value in the popup when the slider changes
speedSlider.addEventListener('input', function() {
  const speed = speedSlider.value;
  speedValue.textContent = `${speed}x`;

  // saves the speed value to localStorage
  localStorage.setItem('videoSpeed', speed);

  // sends the speed to the content script
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'setSpeed', speed: parseFloat(speed) });
  });
});
