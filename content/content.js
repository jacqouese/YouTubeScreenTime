const video = document.getElementsByTagName('video')[0];
const hook = document.querySelector('#count');

let isPaused = false;
let time = 0;

video.addEventListener('playing', () => {
    isPaused = false;
});

video.addEventListener('pause', () => {
    isPaused = true;
});

setInterval(() => {
    if (isPaused === false) {
        time += 1;
    }
    chrome.runtime.sendMessage({
        from: 'content',
        subject: time,
    });
}, 1000);

// get video category by injecting JS
const injectedCode = `
    const yttDiv = document.createElement('div');
    yttDiv.id = 'ytt-category'
    yttDiv.style.display = 'hidden';
    yttDiv.innerHTML =
        ytInitialPlayerResponse.microformat.playerMicroformatRenderer.category;

    document.body.appendChild(yttDiv);

`;
var script = document.createElement('script');
script.textContent = injectedCode;
document.head.appendChild(script);

// retrive video category
const category = document.querySelector('#ytt-category').innerHTML;

console.log(category);
