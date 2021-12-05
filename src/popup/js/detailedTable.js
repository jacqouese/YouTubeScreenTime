const categories = {
    Music: 70,
    Entertainment: 50,
    Autos: 20,
    Others: 10,
};

const detailedTable = document.querySelector('#detailed-table-table');

for (const [key, value] of Object.entries(categories)) {
    const HTMLinsert = `
    <tr>
    <td>
    <div class="detailed-elem">
      <div class="detailed-color-box"></div>
      <div class="detailed-category">
        ${key}
        <div class="progress" att-progress="${value}"></div>
      </div>
    </div>
  </td>
  </tr>`;

    detailedTable.innerHTML += HTMLinsert;
}

const progressBars = document.querySelectorAll('.progress');

progressBars.forEach((bar) => {
    const value = bar.getAttribute('att-progress');

    bar.style.width = `${value}%`;
});
