import { main } from '../../../popup';
import { addRestriction } from '../../api/addRestriciton';
import { deleteRestriction } from '../../api/deleteRestriction';
import { loadData } from '../../api/loadData';
import { hmsToSeconds } from '../../helpers/hmsToSeconds';
import { restrictTable } from './restrictTable';

function timeInputs() {
  // limit max hours to 999
  document.querySelector('.time-input-hours').addEventListener('keyup', (e) => {
    if (e.target.value > 999) {
      e.target.value = Math.floor(e.target.value / 10); // trim last digit
    }
  });

  // limit max minutes to 59
  document
    .querySelector('.time-input-minutes')
    .addEventListener('keyup', (e) => {
      if (e.target.value > 59) {
        e.target.value = 59;
      }
    });
}

function handleButtons() {
  document.querySelector('#restrict-btn').addEventListener('click', () => {
    const hours = document.querySelector('.time-input-hours').value;
    const minutes = document.querySelector('.time-input-minutes').value;
    const restriction =
      document
        .querySelector('.popup-section')
        .querySelector('#restriction-name').textContent || null;

    if (hours <= 0 && minutes <= 0) return;
    if (restriction === null) return;

    const seconds = hmsToSeconds(hours, minutes, 0); // convert hours, minutes, seconds to seconds

    addRestriction(restriction, seconds, () => {
      main();
    }); // add restriction to database
    document.querySelector('.popup-section').classList.remove('show'); // hide popup

    // reset inputs
    document.querySelector('.time-input-hours').value = '';
    document.querySelector('.time-input-minutes').value = '';
  });
}

function handleDeleteButton() {
  const buttons = document.querySelectorAll('.delete-restriction');

  buttons.forEach((button) => {
    const restrictionCategory = button.getAttribute('att-restriction');

    button.addEventListener('click', () => {
      deleteRestriction(restrictionCategory, () => {
        main();
      });
    });
  });
}

function handleBackButton() {
  document.querySelector('.back-btn').addEventListener('click', () => {
    document.querySelector('.popup-section').classList.remove('show');

    // reset inputs
    document.querySelector('.time-input-hours').value = '';
    document.querySelector('.time-input-minutes').value = '';
  });
}

export function restrict() {
  restrictTable();
  timeInputs();
  handleButtons();
  handleDeleteButton();
  handleBackButton();
}
