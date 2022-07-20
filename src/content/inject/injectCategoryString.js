import { checkCategory } from '../category/extractCategory';

export function injectCategoryString() {
    const elem = document.querySelector('#info-strings') || null;

    if (elem === null) return console.log('null on strings');

    const dot = document.createElement('span');
    dot.id = 'dot';
    dot.classList.add('style-scope');
    dot.classList.add('ytd-video-primary-info-renderer');

    var span = elem.querySelector('.ytt-cateogry') || null;

    if (span === null) {
        span = document.createElement('span');
        span.classList.add('ytt-cateogry');

        elem.appendChild(dot);
        elem.appendChild(span);
    }

    span.textContent = `${checkCategory()}`;
}
