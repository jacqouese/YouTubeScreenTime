export function notification() {
  const mainContainer = document.createElement('div');
  mainContainer.id = 'ytt-notification-contianer';

  document.body.appendChild(mainContainer);

  this.dismissNotificationById = (id) => {
    const notificationElem = document.querySelector(`#${id}`);
    notificationElem.parentNode.removeChild(notificationElem);
  };

  this.createSimpleNotification = (title, subtitle) => {
    const simpleNotification = document.createElement('div');
    simpleNotification.classList.add('ytt-simple-notification');
    const notificationId = `ytt-element-${Math.floor(Math.random() * 99999)}`;
    simpleNotification.id = notificationId;
    mainContainer.appendChild(simpleNotification);

    const imgURL = chrome.extension.getURL('content/logo.png');

    const html = `
    <div class="flex">
        <img src="${imgURL}" alt="">
        <h1>${title}</h1>
    </div>
    <p>${subtitle}</p>
    `;

    const button = document.createElement('button');
    button.textContent = 'Dismiss';
    button.addEventListener('click', () => {
      const idElem = document.getElementById(notificationId);
      idElem.parentNode.removeChild(idElem);
    });
    simpleNotification.innerHTML = html;
    simpleNotification.appendChild(button);

    setTimeout(() => {
      this.dismissNotificationById(notificationId);
    }, 10000);
  };
}
