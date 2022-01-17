export function showNoTimeLeftPage() {
  const div = document.createElement('div');
  div.classList.add('ytt-notification');

  const html = `
    <h1>whoops, your time has run out</h1>
    <p>The time limit you set for Entertainment has run out. The video will stop playing if you don’t take any action.</p>
`;

  div.innerHTML += html;

  document.body.appendChild(div);
}
