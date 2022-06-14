import { Chart, registerables } from 'chart.js';

function formatHeights(data) {
    let formatedNumbers = [];
    // sum each day and push it into array
    for (const [key, value] of Object.entries(data)) {
        let total = 0;
        for (const [innerKey, innerhValue] of Object.entries(value)) {
            total += innerhValue;
        }
        formatedNumbers.push(Math.floor(total / 60));
    }

    return formatedNumbers;
}

// export function chartLogic() {
//   const chartBars = document.querySelectorAll('.chart-bar');
//   const weekProgressArray = window.ytData.weekTotalCategory.dateObject;
//   const formatedHeightArray = formatHeights(weekProgressArray);
//   formatedHeightArray.forEach((singleHeight, i) => {
//     const finalHeight = singleHeight === 0 ? 1 : singleHeight;
//     chartBars[i].style.height = `${finalHeight}%`;
//   });
// }

export function chartLogic() {
    const ctx = document.getElementById('myChart').getContext('2d');
    Chart.register(...registerables);
    const myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [
                {
                    label: false,
                    data: formatHeights(
                        window.ytData.weekTotalCategory.dateObject
                    ),
                    backgroundColor: '#45b1d5',
                    borderWidth: 0,
                    borderRadius: 5,
                },
            ],
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                },
            },
            plugins: {
                legend: {
                    display: false,
                },
                tooltip: {
                    callbacks: {
                        label: (item) => `${item.formattedValue} min`,
                    },
                },
            },
        },
    });
}
