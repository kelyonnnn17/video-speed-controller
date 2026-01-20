// Speed overlay
let overlay = null;
let isOverlayVisible = false;

// Initialize overlay
function createOverlay() {
  if (overlay) return;
  
  overlay = document.createElement('div');
  overlay.id = 'speed-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: rgba(0, 0, 0, 0.85);
    color: #4f9bff;
    padding: 12px 20px;
    border-radius: 8px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 24px;
    font-weight: 700;
    z-index: 999999;
    pointer-events: none;
    opacity: 0;
    transform: translateY(-10px);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    border: 2px solid #4f9bff;
  `;
  document.body.appendChild(overlay);
}

function showOverlay(speed) {
  if (!overlay) createOverlay();
  
  overlay.textContent = `${speed.toFixed(2)}×`;
  overlay.style.opacity = '1';
  overlay.style.transform = 'translateY(0)';
  isOverlayVisible = true;
  
  clearTimeout(overlay.hideTimeout);
  overlay.hideTimeout = setTimeout(() => {
    if (overlay && isOverlayVisible) {
      overlay.style.opacity = '0';
      overlay.style.transform = 'translateY(-10px)';
    }
  }, 1500);
}

function toggleOverlay(show) {
  isOverlayVisible = show;
  if (!show && overlay) {
    overlay.style.opacity = '0';
  }
}

// Set media speed
function setMediaSpeed(speed) {
  const mediaElements = document.querySelectorAll('video, audio');
  let applied = false;
  
  mediaElements.forEach(media => {
    try {
      // Mark as extension-controlled to prevent overlay on manual changes
      media.dataset.extensionControlled = 'true';
      media.playbackRate = speed;
      media.dataset.speedPreference = speed;
      // Remove flag after a short delay
      setTimeout(() => {
        delete media.dataset.extensionControlled;
      }, 500);
      applied = true;
    } catch (e) {
      console.error('Error setting playback rate:', e);
    }
  });
  
  if (applied && isOverlayVisible) {
    showOverlay(speed);
  }
  
  return applied;
}

// Get current media speed
function getCurrentSpeed() {
  const mediaElements = document.querySelectorAll('video, audio');
  if (mediaElements.length === 0) return 1;
  
  // Get speed from first playing media, or first media element
  for (let media of mediaElements) {
    if (!media.paused) {
      return media.playbackRate;
    }
  }
  
  return mediaElements[0]?.playbackRate || 1;
}

// Observe for new media elements
function setupMediaObserver() {
  const observer = new MutationObserver(() => {
    chrome.storage.sync.get(['settings', 'videoSpeed', 'perSiteSpeeds'], (result) => {
      const settings = result.settings || { autoApply: true };
      
      if (!settings.autoApply) return;
      
      const domain = window.location.hostname;
      let speed = result.videoSpeed || 1;
      
      if (result.perSiteSpeeds && result.perSiteSpeeds[domain]) {
        speed = result.perSiteSpeeds[domain];
      }
      
      // Only apply if media exists
      const mediaElements = document.querySelectorAll('video, audio');
      if (mediaElements.length > 0) {
        setMediaSpeed(speed);
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Watch for media rate changes (in case user changes speed manually)
function setupMediaRateWatcher() {
  const mediaElements = document.querySelectorAll('video, audio');
  
  mediaElements.forEach(media => {
    if (media.dataset.rateWatcher) return;
    media.dataset.rateWatcher = 'true';
    
    // Store original playbackRate property descriptor
    const originalDescriptor = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'playbackRate') ||
                               Object.getOwnPropertyDescriptor(Object.getPrototypeOf(media), 'playbackRate');
    
    // Watch for changes but don't block actual setting
    let lastSpeed = media.playbackRate;
    const checkInterval = setInterval(() => {
      if (media.playbackRate !== lastSpeed) {
        lastSpeed = media.playbackRate;
        if (isOverlayVisible && !media.dataset.extensionControlled) {
          showOverlay(media.playbackRate);
        }
      }
    }, 100);
    
    // Clean up when element is removed
    const observer = new MutationObserver(() => {
      if (!document.contains(media)) {
        clearInterval(checkInterval);
        observer.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  });
}

// Initialize
function init() {
  setupMediaObserver();
  
  // Apply saved speed on load
  chrome.storage.sync.get(['settings', 'videoSpeed', 'perSiteSpeeds'], (result) => {
    const settings = result.settings || { autoApply: true, showOverlay: true };
    const domain = window.location.hostname;
    
    let speed = result.videoSpeed || 1;
    if (result.perSiteSpeeds && result.perSiteSpeeds[domain]) {
      speed = result.perSiteSpeeds[domain];
    }
    
    if (settings.showOverlay !== false) {
      createOverlay();
      isOverlayVisible = true;
    }
    
    if (settings.autoApply !== false) {
      setMediaSpeed(speed);
    }
    
    setupMediaRateWatcher();
  });
  
  // Re-check for media periodically
  setInterval(() => {
    setupMediaRateWatcher();
  }, 1000);
}

// Message listener
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'setSpeed') {
    const applied = setMediaSpeed(message.speed);
    sendResponse({ success: true, applied });
  } else if (message.action === 'getCurrentSpeed') {
    const speed = getCurrentSpeed();
    sendResponse({ speed });
  } else if (message.action === 'toggleOverlay') {
    toggleOverlay(message.show);
    if (message.show && overlay) {
      const speed = getCurrentSpeed();
      showOverlay(speed);
    }
    sendResponse({ success: true });
  }
  
  return true;
});

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
