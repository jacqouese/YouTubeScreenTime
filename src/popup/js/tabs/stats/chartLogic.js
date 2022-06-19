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
                    data: formatHeights(window.ytData.weekTotalCategory.dateObject),
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
                    ticks: {
                        // Include a dollar sign in the ticks
                        callback: function (value, index, ticks) {
                            if (value === 0) return 0;
                            if (ticks[ticks.length - 1].value >= 60) {
                                console.log('here');
                                return `${Math.floor(value / 60)}:${('0' + (value % 60)).slice(-2)}`;
                            }

                            return value;
                        },
                    },
                },
            },
            plugins: {
                legend: {
                    display: false,
                },
                tooltip: {
                    callbacks: {
                        label: (item) => {
                            if (item.formattedValue >= 60) {
                                return `${Math.floor(item.formattedValue / 60)} h ${item.formattedValue % 60} min`;
                            }
                            return `${item.formattedValue} min`;
                        },
                    },
                },
            },
        },
    });
}
