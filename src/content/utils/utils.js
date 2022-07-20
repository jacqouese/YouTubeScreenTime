export function isVideoLoaded() {
    return document.querySelector(`ytd-watch-flexy[video-id]`) || null;
}
