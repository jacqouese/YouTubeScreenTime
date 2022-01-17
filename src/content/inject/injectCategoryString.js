import { checkCategory } from '../category/extractCategory';

export function injectCategoryString() {
  const elem = document.querySelector('#info-strings') || null;

  if (elem === null) return;

  const paragraph = elem.getElementsByTagName('yt-formatted-string')[0];

  paragraph.textContent += ` - ${checkCategory()}`;
}
