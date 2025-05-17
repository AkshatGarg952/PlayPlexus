// DOM Elements
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
const sentSection = document.getElementById('sent-section');
const receivedSection = document.getElementById('received-section');
const bothSection = document.getElementById('both-section');
const sentChartCtx = document.getElementById('sentChart').getContext('2d');
const receivedChartCtx = document.getElementById('receivedChart').getContext('2d');
const bothChartCtx = document.getElementById('bothChart').getContext('2d');
const graphButtons = document.querySelectorAll('.graph-btn');

// Initial data (will be updated by API)
let sentData = {
    totalCount: 0,
    accepted: 0,
    rejected: 0,
    pending: 0,
    expired: 0,
    cancelled: 0
};

let receivedData = {
    totalCount: 0,
    accepted: 0,
    rejected: 0,
    noAction: 0,
    expired: 0,
    cancelled: 0
};

let userObj = window.userObj || {};
let teamObj = window.teamObj || {};
let userId = userObj ? userObj._id : null;
let teamId = teamObj ? teamObj._id : null;
let id = userId || teamId;

// Fetch sent requests
async function fetchSentUsers(id) {
    try {
        const response = await fetch(`http://localhost:3000/api/requests/sender/${id}`);
        if (!response.ok) throw new Error('Failed to fetch sent requests');
        const data = await response.json();
        
        sentData.totalCount = data.total || 0;
        sentData.accepted = data.statusWise.find(item => item._id === "accepted")?.count || 0;
        sentData.rejected = data.statusWise.find(item => item._id === "rejected")?.count || 0;
        sentData.expired = data.statusWise.find(item => item._id === "expired")?.count || 0;
        sentData.cancelled = data.statusWise.find(item => item._id === "cancelled")?.count || 0;
        sentData.pending = data.statusWise.find(item => item._id === "pending")?.count || 0;

        // Update DOM for sent section
        updateSentSectionDOM();
    } catch (err) {
        alert(err.message);
    }
}

// Fetch received requests
async function fetchReceivedUsers(id) {
    try {
        const response = await fetch(`http://localhost:3000/api/requests/receiver/${id}`);
        if (!response.ok) throw new Error('Failed to fetch received requests');
        const data = await response.json();
        
        receivedData.totalCount = data.total || 0;
        receivedData.accepted = data.statusWise.find(item => item._id === "accepted")?.count || 0;
        receivedData.rejected = data.statusWise.find(item => item._id === "rejected")?.count || 0;
        receivedData.expired = data.statusWise.find(item => item._id === "expired")?.count || 0;
        receivedData.noAction = data.statusWise.find(item => item._id === "pending")?.count || 0;
        receivedData.cancelled = data.statusWise.find(item => item._id === "cancelled")?.count || 0;

        // Update DOM for received section
        updateReceivedSectionDOM();
    } catch (err) {
        alert(err.message);
    }
}

// Update DOM for sent section
function updateSentSectionDOM() {
    const sentStats = sentSection.querySelectorAll('.stats-row .stat .number');
    sentStats[0].textContent = sentData.totalCount; // Total Sended Requests
    sentStats[1].textContent = sentData.accepted;   // Accepted by Others
    sentStats[2].textContent = sentData.rejected;   // Rejected by Others
    sentStats[3].textContent = sentData.pending;    // Pending
    sentStats[4].textContent = sentData.cancelled;  // Cancelled by You
    sentStats[5].textContent = sentData.expired;    // Expired
}

// Update DOM for received section
function updateReceivedSectionDOM() {
    const receivedStats = receivedSection.querySelectorAll('.stats-row .stat .number');
    receivedStats[0].textContent = receivedData.totalCount; 
    receivedStats[1].textContent = receivedData.accepted;   
    receivedStats[2].textContent = receivedData.rejected;   
    receivedStats[3].textContent = receivedData.noAction; 
    receivedStats[4].textContent = receivedData.cancelled;
    receivedStats[5].textContent = receivedData.expired;
}

// Charts
let sentChart, receivedChart, bothChart;

// Navbar toggle
document.getElementById('menuToggle').addEventListener('click', () => {
    document.getElementById('navLinks').classList.toggle('active');
});

// Close menu when clicking outside
document.addEventListener('click', function(e) {
    const navLinks = document.getElementById('navLinks');
    const menuToggle = document.getElementById('menuToggle');
    
    if (!navLinks.contains(e.target) && !menuToggle.contains(e.target) && navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
    }
});

// Sidebar toggle
document.getElementById('sidebarToggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('collapsed');
});

// Initialize Charts
function createSentChart() {
    if (sentChart) sentChart.destroy();
    sentChart = new Chart(sentChartCtx, {
        type: 'bar',
        data: {
            labels: ['Total', 'Accepted', 'Rejected', 'No Action', 'Cancelled', 'Expired'],
            datasets: [{
                label: 'Requests You Sent',
                data: [
                    sentData.totalCount || 0,
                    sentData.accepted || 0,
                    sentData.rejected || 0,
                    sentData.pending || 0,
                    sentData.cancelled || 0,
                    sentData.expired || 0
                ],
                backgroundColor: '#7c4dff',
                hoverBackgroundColor: '#5e35b1',
                barPercentage: 0.9, // Match default Chart.js bar width
                categoryPercentage: 0.8 // Match default Chart.js category width
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#fff',
                        font: { size: 20 },
                        stepSize: 1,
                        precision: 0
                    },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                x: {
                    ticks: { color: '#fff', font: { size: 20 } },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    enabled: true,
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed.y || 0;
                            const label = context.dataset.label || '';
                            return `${label}: ${value}`;
                        }
                    }
                }
            },
            interaction: {
                mode: 'index',
                intersect: false
            }
        }
    });
}

function createReceivedChart() {
    if (receivedChart) receivedChart.destroy();
    receivedChart = new Chart(receivedChartCtx, {
        type: 'bar',
        data: {
            labels: ['Total', 'Accepted', 'Rejected', 'No Action', 'Cancelled', 'Expired'],
            datasets: [{
                label: 'Requests You Received',
                data: [
                    receivedData.totalCount || 0,
                    receivedData.accepted || 0,
                    receivedData.rejected || 0,
                    receivedData.noAction || 0,
                    receivedData.cancelled || 0,
                    receivedData.expired || 0
                ],
                backgroundColor: '#ff5c8d',
                hoverBackgroundColor: '#d81b60',
                barPercentage: 0.9, 
                categoryPercentage: 0.8 
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#fff',
                        font: { size: 20 },
                        stepSize: 1,
                        precision: 0
                    },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                x: {
                    ticks: { color: '#fff', font: { size: 20 } },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    enabled: true,
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed.y || 0;
                            const label = context.dataset.label || '';
                            return `${label}: ${value}`;
                        }
                    }
                }
            },
            interaction: {
                mode: 'index',
                intersect: false
            }
        }
    });
}

function createBothChart() {
    if (bothChart) bothChart.destroy();
    bothChart = new Chart(bothChartCtx, {
        type: 'bar',
        data: {
            labels: ['Total', 'Accepted', 'Rejected', 'No Action', 'Cancelled', 'Expired'],
            datasets: [
                {
                    label: 'Requests You Sent',
                    data: [
                        sentData.totalCount || 0,
                        sentData.accepted || 0,
                        sentData.rejected || 0,
                        sentData.pending || 0,
                        sentData.cancelled || 0,
                        sentData.expired || 0
                    ],
                    backgroundColor: '#7c4dff',
                    hoverBackgroundColor: '#5e35b1',
                    barPercentage: 0.9, // Adjusted for two datasets to match single bar width
                    categoryPercentage: 0.8
                },
                {
                    label: 'Requests You Received',
                    data: [
                        receivedData.totalCount || 0,
                        receivedData.accepted || 0,
                        receivedData.rejected || 0,
                        receivedData.noAction || 0,
                        receivedData.cancelled || 0,
                        receivedData.expired || 0
                    ],
                    backgroundColor: '#ff5c8d',
                    hoverBackgroundColor: '#d81b60',
                    barPercentage: 0.9, // Adjusted for two datasets
                    categoryPercentage: 0.8
                }
            ]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#fff',
                        font: { size: 20 },
                        stepSize: 1,
                        precision: 0
                    },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                x: {
                    ticks: { color: '#fff', font: { size: 20 } },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    enabled: true,
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed.y || 0;
                            const label = context.dataset.label || '';
                            return `${label}: ${value}`;
                        }
                    }
                }
            },
            interaction: {
                mode: 'index',
                intersect: false
            }
        }
    });
}

// Toggle Graph Visibility and Full-Screen Logic
function toggleGraph(type) {
    graphButtons.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`button[onclick="toggleGraph('${type}')"]`).classList.add('active');

    sentSection.classList.remove('full-screen');
    receivedSection.classList.remove('full-screen');
    bothSection.classList.remove('full-screen');

    if (type === 'sent') {
        sentSection.style.display = 'block';
        sentSection.classList.add('full-screen');
        receivedSection.style.display = 'none';
        bothSection.style.display = 'none';
        createSentChart();
    } else if (type === 'received') {
        sentSection.style.display = 'none';
        receivedSection.style.display = 'block';
        receivedSection.classList.add('full-screen');
        bothSection.style.display = 'none';
        createReceivedChart();
    } else {
        sentSection.style.display = 'none';
        receivedSection.style.display = 'none';
        bothSection.style.display = 'block';
        bothSection.classList.add('full-screen');
        createBothChart();
    }
}

// Fetch data and initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    if (isCollapsed) {
        sidebar.classList.add('collapsed');
    }

    
    await Promise.all([
        fetchSentUsers(id),
        fetchReceivedUsers(id)
    ]);

    
    toggleGraph('sent'); // Start with "Requests You Sent" view
});


// const menuItems = document.querySelectorAll('.sidebar-menu li');
// menuItems.forEach(item => {
//     item.addEventListener('click', () => {
//         menuItems.forEach(i => i.classList.remove('active'));
//         item.classList.add('active');
//     });
// });
