// listen for first video after opening YouTube
export function listenForFirstVideo(callback) {
    chrome.runtime.onMessage.addListener(function listenForFirstVideoInner() {
        let video = document.getElementsByTagName('video')[0] || null;

        // when the video has been found, remove listener and run callback
        if (video !== null) {
            const correctVideoTag =
                document.getElementsByTagName('video')[
                    document.getElementsByTagName('video').length - 1
                ];

            chrome.runtime.onMessage.removeListener(listenForFirstVideoInner);

            callback(correctVideoTag);
        }
    });
}
