let chart;

// CSV Parsing + Chart Creation
document.getElementById("fileInput").addEventListener("change", function (event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
        const text = e.target.result;
        const rows = text.split("\n").map(row => row.split(","));

        // First row = labels
        const labels = rows.slice(1).map(row => row[0]);

        // Second column = values
        const values = rows.slice(1).map(row => parseFloat(row[1]));

        // Create Chart
        createChart(labels, values);
    };

    reader.readAsText(file);
});

function createChart(labels, values) {
    const ctx = document.getElementById("chart");

    if (chart) chart.destroy(); // reset chart if new one uploaded

    chart = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Projections",
                data: values,
                borderWidth: 3,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: false }
            }
        }
    });
}
