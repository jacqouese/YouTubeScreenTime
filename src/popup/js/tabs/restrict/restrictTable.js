function restrictPupup(restriction) {
  const createPopup = () => {
    document.querySelector('.popup-section').classList.add('show');
  };

  const destroyPupup = () => {
    document.querySelector('.popup-section').classList.remove('show');
  };

  // inject category name
  document
    .querySelector('.popup-section')
    .querySelector('#restriction-name').textContent = restriction;

  createPopup();
}

export function restrictTable() {
  const myRestrictions = {
    '🎧 Music': '10.0d',
    '🖥️ Entertainment': '6.0d',
    '📱 Autos': '16.0w',
    '📚 Others': '2.0d',
  };

  const restrictedTable = document.querySelector('#table-restricted');

  for (const [key, value] of Object.entries(myRestrictions)) {
    const HTMLinsert = `
        <tr>
            <td>
                <div class="table-inner-wrapper">
                    <span class="longer">${key}</span>
                    <span>${value}</span>
                    <span><img src="./assets/remove.png" alt="x"></span>
                </div>
            </td>
        </tr>`;

    restrictedTable.innerHTML += HTMLinsert;
  }
  const restrictionList = {
    Music: '🎧',
    Entertainment: '🖥️',
    Autos: '📱',
    Others: '📚',
  };

  const listTable = document.querySelector('#table-restrict-list');

  for (const [key, value] of Object.entries(restrictionList)) {
    const HTMLinsert = `
        <tr>
            <td>
                <div class="table-inner-wrapper">
                    <span class="restriction-name" att-name=${key}>${value} ${key}</span>
                    <span>></span>
                </div>
            </td>
        </tr>`;

    listTable.innerHTML += HTMLinsert;
  }

  console.log(listTable.querySelectorAll('td'));

  listTable.querySelectorAll('td').forEach((elem) => {
    elem.addEventListener('click', () => {
      const restrictionName = elem
        .querySelector('.restriction-name')
        .getAttribute('att-name');
      console.log(restrictionName);
      restrictPupup(restrictionName);
    });
  });
}
