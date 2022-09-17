class redirectService {
    static redirectToFocusPage() {
        document.querySelector('#columns').innerHTML =
            '<div class="ytt-redirected-container"><h1>This video is not allowed in focus mode</h1><h2>check YouTube ScreenTime extension for more information</h2></div>';
    }
}

export default redirectService;
