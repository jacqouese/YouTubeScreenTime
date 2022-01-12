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

    if (hours <= 0 && minutes <= 0) return;

    console.log(hours);

    document.querySelector('.popup-section').classList.remove('show');

    // reset inputs
    document.querySelector('.time-input-hours').value = '';
    document.querySelector('.time-input-minutes').value = '';
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
  handleBackButton();
}
