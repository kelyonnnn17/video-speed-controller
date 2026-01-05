// function that sets the playback speed for all video/audio elements on the page
function setMediaSpeed(speed) {
    const mediaElements = document.querySelectorAll('video, audio');
    mediaElements.forEach(media => {
      media.playbackRate = speed;
    });
  }
  
  // listens for messages from the popup to change speed
  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'setSpeed') {
      setMediaSpeed(message.speed);
    }
  });
  