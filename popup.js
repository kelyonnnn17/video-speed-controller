// State management
let currentSpeed = 1.0;
let currentDomain = '';
let settings = {
  perSiteSpeed: true,
  showOverlay: true,
  autoApply: true
};

// DOM elements
const speedSlider = document.getElementById('speed');
const speedValue = document.getElementById('speedValue');
const currentSpeedEl = document.getElementById('currentSpeed');
const settingsPanel = document.getElementById('settingsPanel');
const settingsBtn = document.getElementById('settingsBtn');

// Initialize
async function init() {
  await loadSettings();
  await loadCurrentTabInfo();
  await loadSpeed();
  setupEventListeners();
}

// Load settings
async function loadSettings() {
  try {
    const result = await chrome.storage.sync.get(['settings']);
    if (result.settings) {
      settings = { ...settings, ...result.settings };
      document.getElementById('perSiteSpeed').checked = settings.perSiteSpeed;
      document.getElementById('showOverlay').checked = settings.showOverlay;
      document.getElementById('autoApply').checked = settings.autoApply;
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

// Load current tab info
async function loadCurrentTabInfo() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url) {
      try {
        const url = new URL(tab.url);
        currentDomain = url.hostname;
      } catch (e) {
        // Ignore
      }
    }
  } catch (error) {
    console.error('Error loading tab info:', error);
  }
}

// Load speed
async function loadSpeed() {
  try {
    let speed = 1.0;
    
    // Try to get current media speed from page
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'getCurrentSpeed' });
      if (response && response.speed) {
        speed = response.speed;
      }
    } catch (e) {
      // Fallback to stored speed
    }
    
    // If per-site speed is enabled, check for domain-specific speed
    if (settings.perSiteSpeed && currentDomain) {
      const result = await chrome.storage.sync.get(['perSiteSpeeds']);
      if (result.perSiteSpeeds && result.perSiteSpeeds[currentDomain]) {
        speed = result.perSiteSpeeds[currentDomain];
      } else {
        // Fallback to global speed
        const globalResult = await chrome.storage.sync.get(['videoSpeed']);
        if (globalResult.videoSpeed) {
          speed = globalResult.videoSpeed;
        }
      }
    } else {
      // Use global speed
      const result = await chrome.storage.sync.get(['videoSpeed']);
      if (result.videoSpeed) {
        speed = result.videoSpeed;
      }
    }
    
    updateUI(speed);
  } catch (error) {
    console.error('Error loading speed:', error);
  }
}

// Update UI
function updateUI(speed) {
  currentSpeed = parseFloat(speed);
  speedSlider.value = currentSpeed;
  speedValue.textContent = `${currentSpeed.toFixed(2)}×`;
  currentSpeedEl.textContent = currentSpeed.toFixed(2);
}

// Set speed
async function setSpeed(speed) {
  try {
    speed = Math.max(0.25, Math.min(10, parseFloat(speed)));
    
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Inject content script if needed
    try {
      await chrome.tabs.sendMessage(tab.id, { action: 'setSpeed', speed: speed });
      if (settings.showOverlay) {
        await chrome.tabs.sendMessage(tab.id, { action: 'toggleOverlay', show: true });
      }
    } catch (err) {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });
      await new Promise(resolve => setTimeout(resolve, 100));
      await chrome.tabs.sendMessage(tab.id, { action: 'setSpeed', speed: speed });
      if (settings.showOverlay) {
        await chrome.tabs.sendMessage(tab.id, { action: 'toggleOverlay', show: true });
      }
    }
    
    // Save speed
    if (settings.perSiteSpeed && currentDomain) {
      const result = await chrome.storage.sync.get(['perSiteSpeeds']);
      const perSiteSpeeds = result.perSiteSpeeds || {};
      perSiteSpeeds[currentDomain] = speed;
      await chrome.storage.sync.set({ perSiteSpeeds });
    } else {
      await chrome.storage.sync.set({ videoSpeed: speed });
    }
    
    updateUI(speed);
  } catch (error) {
    console.error('Error setting speed:', error);
  }
}

// Event listeners
function setupEventListeners() {
  // Slider
  speedSlider.addEventListener('input', (e) => {
    updateUI(e.target.value);
  });
  
  speedSlider.addEventListener('change', (e) => {
    setSpeed(e.target.value);
  });
  
  // Settings
  settingsBtn.addEventListener('click', () => {
    const isVisible = settingsPanel.style.display !== 'none';
    settingsPanel.style.display = isVisible ? 'none' : 'block';
    settingsBtn.classList.toggle('active', !isVisible);
  });
  
  document.getElementById('perSiteSpeed').addEventListener('change', async (e) => {
    settings.perSiteSpeed = e.target.checked;
    await chrome.storage.sync.set({ settings });
    await loadSpeed();
  });
  
  document.getElementById('showOverlay').addEventListener('change', async (e) => {
    settings.showOverlay = e.target.checked;
    await chrome.storage.sync.set({ settings });
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    try {
      await chrome.tabs.sendMessage(tab.id, { 
        action: 'toggleOverlay', 
        show: settings.showOverlay 
      });
    } catch (err) {
      // Ignore if content script not ready
    }
  });
  
  document.getElementById('autoApply').addEventListener('change', async (e) => {
    settings.autoApply = e.target.checked;
    await chrome.storage.sync.set({ settings });
  });
  
  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    switch(e.key) {
      case 'ArrowUp':
        e.preventDefault();
        setSpeed(Math.min(10, currentSpeed + 0.1));
        break;
      case 'ArrowDown':
        e.preventDefault();
        setSpeed(Math.max(0.25, currentSpeed - 0.1));
        break;
      case '0':
        e.preventDefault();
        setSpeed(1.0);
        break;
    }
  });
}

// Initialize on load
window.addEventListener('DOMContentLoaded', init);
