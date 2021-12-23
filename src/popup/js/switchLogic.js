const switches = document.querySelectorAll('.switch');

switches.forEach((switchElem) => {
  switchElem.addEventListener('click', () => {
    console.log('click');
    const isActive = switchElem.classList.contains('switch-active');

    if (isActive === true) {
      switchElem.classList.remove('switch-active');
    } else {
      switchElem.classList.add('switch-active');
    }
  });
});