class redirectService {
    static redirectToFocusPage() {
        const mainContainer = document.createElement('div');
        mainContainer.className = 'ytt-redirected-container';

        const mainText = document.createElement('h1');
        mainText.textContent = "You're not allowed to watch this video in Focus Mode";

        const subText = document.createElement('p');
        subText.textContent = 'check YouTube ScreenTime extension for more information';

        const button = document.createElement('button');
        button.textContent = 'Go to homepage';
        button.onclick = () => (window.location.href = 'https://www.youtube.com');

        mainContainer.appendChild(mainText);
        mainContainer.appendChild(subText);
        mainContainer.appendChild(button);

        document.querySelector('#columns').innerHTML = '';
        document.querySelector('#columns').appendChild(mainContainer);
    }
}

export default redirectService;
