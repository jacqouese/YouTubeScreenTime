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
    '🎧 Music': false,
    '🖥️ Entertainment': false,
    '📱 Autos': false,
    '📚 Others': false,
  };

  const listTable = document.querySelector('#table-restrict-list');

  for (const [key, value] of Object.entries(restrictionList)) {
    const HTMLinsert = `
        <tr>
            <td>
                <div class="table-inner-wrapper">
                    <span>${key}</span>
                    <span>></span>
                </div>
            </td>
        </tr>`;

    listTable.innerHTML += HTMLinsert;
  }
}
