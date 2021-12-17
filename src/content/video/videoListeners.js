export function videoListeners(video, timer) {
  video.addEventListener('playing', () => {
    // prevent starting multiple timeouts
    if (timer.isResumed === false) {
      console.log('resumed');
      timer.resume();
    }
  });

  video.addEventListener('pause', () => {
    timer.pause();
    console.log('paused');
  });
}
