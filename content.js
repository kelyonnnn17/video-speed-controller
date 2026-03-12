// Sets playback speed for all video/audio elements on the page
function setMediaSpeed(speed) {
  const mediaElements = document.querySelectorAll('video, audio');
  mediaElements.forEach((media) => {
    media.playbackRate = speed;
  });
}

// Auto-apply saved speed when the content script first loads on a page
chrome.storage.local.get('videoSpeed', ({ videoSpeed }) => {
  if (videoSpeed) {
    setMediaSpeed(parseFloat(videoSpeed));
  }
});

// Re-apply speed to any media elements added dynamically after page load
// (e.g. YouTube's player loads asynchronously)
const observer = new MutationObserver(() => {
  chrome.storage.local.get('videoSpeed', ({ videoSpeed }) => {
    if (videoSpeed) setMediaSpeed(parseFloat(videoSpeed));
  });
});
observer.observe(document.body, { childList: true, subtree: true });

// Listen for messages from the popup to change speed
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'setSpeed') {
    setMediaSpeed(message.speed);
  }
});