const chartBars = document.querySelectorAll('.chart-bar');

chartBars.forEach((bar) => {
    const att = bar.getAttribute('att-height');

    bar.style.height = `${att}%`;
});
