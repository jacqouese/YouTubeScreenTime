export function injectCategory(category) {
    // get video category by injecting JS

    setTimeout(() => {
        console.log(JSON.parse(document.getElementById('scriptTag').innerHTML)['genre'], 'fromext');
    }, 5000);

    const injectedCode = `
        setTimeout(() => {
          if (document.querySelector('#ytt-category')) {
            if (JSON.parse(document.getElementById('scriptTag').innerHTML)['genre'] !== ${category}) {
              console.log(JSON.parse(document.getElementById('scriptTag').innerHTML)['genre']);
              document.querySelector('#ytt-category').innerHTML = JSON.parse(document.getElementById('scriptTag').innerHTML)['genre'];
            }
          }
          else {
            const yttDiv = document.createElement('div');
                yttDiv.id = 'ytt-category'
                yttDiv.style.display = 'hidden';
                yttDiv.innerHTML =
                  JSON.parse(document.getElementById('scriptTag').innerHTML)['genre'];

                document.body.appendChild(yttDiv);
          }
        }, 2000); 
      `;

    var previousScript = document.querySelector('.ytt-script');
    if (previousScript) {
        previousScript.parentNode.removeChild(previousScript);
    }

    var script = document.createElement('script');
    script.textContent = injectedCode;
    script.classList.add('ytt-script');
    script.setAttribute('defer', '');
    document.body.appendChild(script);
}
export function checkCategory() {
    const categoryScript = document.getElementById('scriptTag');

    if (!categoryScript) return null;

    const parsedCategory = JSON.parse(categoryScript.innerHTML)['genre'];

    return parsedCategory;
}
