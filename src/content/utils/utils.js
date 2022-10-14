export function isVideoLoaded() {
    return document.querySelector(`ytd-watch-flexy[video-id]`) || null;
}

export function cLog(value1, value2) {
    const DEVELOPMENT = true;

    if (DEVELOPMENT === false) return;

    if (value2) return console.log(value1, value2);

    console.log(value1);
}
