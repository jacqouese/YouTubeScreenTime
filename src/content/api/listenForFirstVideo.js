// listen for first video after opening YouTube
export function listenForFirstVideo(callback) {
  chrome.runtime.onMessage.addListener(function listenForFirstVideoInner() {
    const video = document.getElementsByTagName('video')[0] || null;
    // when the video has been found, remove listener and run callback
    if (video !== null) {
      chrome.runtime.onMessage.removeListener(listenForFirstVideoInner);
      console.log('video found');
      callback(video);
    }
  });
}
