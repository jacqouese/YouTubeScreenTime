export function videoListeners(video, timer) {
    video.addEventListener('playing', () => {
        // prevent starting multiple timeouts
        console.log('video is playing');
        if (timer.isResumed === false) {
            console.log('resumed');
            timer.resume();
        }
    });

    // makes timer not start if video is opened in a new tab
    if (video.readyState > 2) {
        if (timer.isResumed === false) {
            console.log('resumed');
            timer.resume();
        }
    }

    video.addEventListener('pause', () => {
        timer.pause();
        console.log('paused');
    });
}
