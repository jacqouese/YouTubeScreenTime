export function isVideoLoaded() {
    return document.querySelector(`ytd-watch-flexy[video-id]`) || null;
}

export function cLog(value) {
    const DEVELOPMENT = true;

    if (DEVELOPMENT === false) return;

    console.log(value);
}
