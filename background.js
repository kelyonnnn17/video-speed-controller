// Keyboard shortcuts handler
chrome.commands.onCommand.addListener(async (command) => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) return;
    
    // Get current speed
    let currentSpeed = 1.0;
    try {
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'getCurrentSpeed' });
      if (response && response.speed) {
        currentSpeed = response.speed;
      }
    } catch (e) {
      // Fallback to stored speed
      const result = await chrome.storage.sync.get(['videoSpeed']);
      if (result.videoSpeed) {
        currentSpeed = result.videoSpeed;
      }
    }
    
    // Get domain for per-site speed
    let domain = null;
    try {
      const url = new URL(tab.url);
      domain = url.hostname;
    } catch (e) {}
    
    let newSpeed = currentSpeed;
    
    switch (command) {
      case 'increase-speed':
        newSpeed = Math.min(currentSpeed + 0.25, 10);
        break;
      case 'decrease-speed':
        newSpeed = Math.max(currentSpeed - 0.25, 0.25);
        break;
      case 'reset-speed':
        newSpeed = 1.0;
        break;
      case 'toggle-overlay':
        try {
          await chrome.tabs.sendMessage(tab.id, { action: 'toggleOverlay' });
        } catch (e) {
          // Inject content script if needed
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
          });
        }
        return;
    }
    
    // Apply speed
    try {
      await chrome.tabs.sendMessage(tab.id, { action: 'setSpeed', speed: newSpeed });
    } catch (e) {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });
      await new Promise(resolve => setTimeout(resolve, 100));
      await chrome.tabs.sendMessage(tab.id, { action: 'setSpeed', speed: newSpeed });
    }
    
    // Save speed
    const settingsResult = await chrome.storage.sync.get(['settings']);
    const settings = settingsResult.settings || { perSiteSpeed: true };
    
    if (settings.perSiteSpeed && domain) {
      const result = await chrome.storage.sync.get(['perSiteSpeeds']);
      const perSiteSpeeds = result.perSiteSpeeds || {};
      perSiteSpeeds[domain] = newSpeed;
      await chrome.storage.sync.set({ perSiteSpeeds });
    } else {
      await chrome.storage.sync.set({ videoSpeed: newSpeed });
    }
  } catch (error) {
    console.error('Error handling command:', error);
  }
});

chrome.runtime.onInstalled.addListener(() => {
  console.log("Video Speed Controller v2.0 installed.");
});
