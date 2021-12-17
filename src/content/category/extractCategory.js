export function injectCategory() {
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
}
export function checkCategory() {
  // retrive video category
  const category = document.querySelector('#ytt-category').innerHTML;

  return category;
}
