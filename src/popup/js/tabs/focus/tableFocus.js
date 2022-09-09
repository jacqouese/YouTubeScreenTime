export function tableFocus(whitelisted, allCategories) {
    const focusTable = document.querySelector('#table-focus');

    focusTable.innerHTML = '';

    if (whitelisted.length === 0) {
        const HTMLinsert = `
        <tr>
            <td>
                <span>No whitelisted categories</span>
            </td>
        </tr>`;

        focusTable.innerHTML = HTMLinsert;
    }

    whitelisted.forEach((restriction) => {
        // remove duplicates from table by removing already added restrictions
        if (allCategories.includes(restriction.category)) {
            const index = allCategories.indexOf(restriction.category);

            if (index > -1) allCategories.splice(index, 1);
        }

        // populate table
        const formatedTime = secondsToHms(restriction.time_in_sec);

        let periodObject = window.ytData.dayTotalCategory.categoryObject[restriction.category] || null;
        if (restriction.category === 'All') periodObject = window.ytData.dayTotalCategory.time || null;

        const formatedWatchtime = secondsToHms(periodObject);
        const HTMLinsert = `
        <tr>
            <td>
                <div class="table-inner-wrapper">
                    <span class="longer">${youtubeCategoryIcons[restriction.category]} ${restriction.category}</span>
                    <span>${formatedWatchtime} / ${formatedTime}</span>
                    <span class="delete-restriction" att-restriction="${
                        restriction.category
                    }"><img src="./assets/remove.png" alt="x"></span>
                </div>
            </td>
        </tr>`;

        focusTable.innerHTML += HTMLinsert;
    });
}
