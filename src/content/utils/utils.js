export function isVideoLoaded() {
    return document.querySelector(`ytd-watch-flexy[video-id]`) || null;
}

export function cLog(value1, value2) {
    const DEVELOPMENT = true;

    if (DEVELOPMENT === false) return;

    if (value2) return console.log('[yt-d]', value1, value2);

    console.log('[yt-d]', value1);
}
