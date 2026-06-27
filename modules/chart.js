import { getCounts } from '../modules/db.js'

const ctx = document.getElementById('chart');
let notesChart

export function drawChart() {
    if (notesChart) {
        notesChart.data.datasets[0].data = getCounts()
        notesChart.update()
        return
    }
    notesChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Created notes', 'Deleted notes', 'Uploaded images', 'Removed images'],
            datasets: [{
                label: '# of Votes',
                data: getCounts(),
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}