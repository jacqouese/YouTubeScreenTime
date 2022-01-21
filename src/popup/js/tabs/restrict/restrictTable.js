import youtubeCategories from '../../../data/youtubeCategories';
import { secondsToHms } from '../../helpers/secondsToHms';

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
  const myRestrictions = window.ytData.allRestrictions;
  const restrictionList = youtubeCategories;

  const restrictedTable = document.querySelector('#table-restricted');

  restrictedTable.innerHTML = '';

  myRestrictions.forEach((restriction) => {
    // remove duplicates from table by removing already added restrictions
    if (restrictionList.includes(restriction.category)) {
      const index = restrictionList.indexOf(restriction.category);

      if (index > -1) restrictionList.splice(index, 1);
    }

    // populate table
    const formatedTime = secondsToHms(restriction.time_in_sec);
    const HTMLinsert = `
        <tr>
            <td>
                <div class="table-inner-wrapper">
                    <span class="longer">${restriction.category}</span>
                    <span>${formatedTime} / ${restriction.timeframe}</span>
                    <span class="delete-restriction" att-restriction="${restriction.category}"><img src="./assets/remove.png" alt="x"></span>
                </div>
            </td>
        </tr>`;

    restrictedTable.innerHTML += HTMLinsert;
  });

  const listTable = document.querySelector('#table-restrict-list');

  listTable.innerHTML = '';

  restrictionList.forEach((elem) => {
    const HTMLinsert = `
        <tr>
            <td>
                <div class="table-inner-wrapper">
                    <span class="restriction-name" att-name="${elem}">${elem}</span>
                    <span>></span>
                </div>
            </td>
        </tr>`;

    listTable.innerHTML += HTMLinsert;
  });

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
