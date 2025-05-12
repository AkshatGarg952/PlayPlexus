let requests = [];
let filteredRequests = []; // Store filtered requests for display
let currentPage = 1;
const requestsPerPage = 6;

let userObj = window.userObj || {};
let teamObj = window.teamObj || {};
let name = userObj.username || teamObj.leader;
let userId = userObj ? userObj._id : null;
let teamId = teamObj ? teamObj._id : null;





async function acceptR(id){
   const aId = userId || teamId;
    const response = await fetch(`/api/requests/accept/${aId}/${id}`, {
        method: 'GET',
        credentials:'include'
    })
    location.reload();
}




async function rejectR(id){
    const aId = userId || teamId;
    const response = await fetch(`/api/requests/reject/${aId}/${id}`, {
        method: 'GET',
        credentials:'include'
    })
    location.reload();
    }

 
    async function cancelR(id){
        const aId = userId || teamId;
        const response = await fetch(`/api/requests/cancel/${aId}/${id}`, {
            method: 'GET',
            credentials:'include'
        })

        location.reload();
        }    





const filter = document.getElementById('sportFilter');

filter.addEventListener('change', function () {
    const selectedValue = this.value;
    
    if (selectedValue === 'All Sended') {
        let url = `http://localhost:3000/api/requests/sended`;
        fetchRequests(url);
    } else if (selectedValue === "All Received") {
        let url = `http://localhost:3000/api/requests/received`;
        fetchRequests(url);
    } else {
        let url = `http://localhost:3000/api/requests/details`;
        fetchRequests(url);
    }
});

// Fetch requests
async function fetchRequests(url) {
    try {
        const id = userId || teamId;
        const updatedUrl = `${url}/${id}`;
        const response = await fetch(updatedUrl);
        if (!response.ok) throw new Error('Failed to fetch requests');
        const data = await response.json();
        requests = data.map((request, index) => ({
            id: request._id,
            sender: request.senderName,
            message: request.message,
            status: request.status,
            date: request.date,
            seen:request.seen,
            activity: request.sport || request.game
        }));
        filteredRequests = [...requests];
        displayRequests(filteredRequests.slice(0, requestsPerPage));
        updateLoadMoreButton();
    } catch (error) {
        console.error('Error fetching requests:', error);
        document.getElementById('usersContainer').innerHTML = '<p>Error loading requests. Please try again.</p>';
    }
}


function displayRequests(requestsToDisplay) {
    const usersContainer = document.getElementById('usersContainer');
    usersContainer.innerHTML = '';
    if (requestsToDisplay.length === 0) {
        usersContainer.innerHTML = '<p>No requests found.</p>';
        return;
    }
    requestsToDisplay.forEach(request => {
        const requestCard = document.createElement('div');
        requestCard.className = 'request-card';
        
        // Check conditions for buttons
        const isReceiver = request.sender !== name;
        const isSender = request.sender === name;
        const status = request.status.toLowerCase();
        const showActionButtons = isReceiver && status === 'pending';
        const accepted1 = isReceiver && status === 'accepted';
        const rejected1 = isReceiver && status === 'rejected';
        const expired1 = isReceiver && status === 'expired';
        const cancelled1 = isReceiver && status === 'cancelled';
        const showCancelButton = isSender && status==='pending';
        const accepted2 = isSender && status==='accepted';
        const rejected2 = isSender && status==='rejected';
        const expired2 = isSender && status==='expired';
        const cancelled2 = isSender && status === 'cancelled';
        requestCard.innerHTML = `
            <div class="card-bg"></div>
            <div class="card-content">
                <div class="request-header">
                    <div class="request-info">
                        <h3>${request.sender}</h3>
                    </div>
                    
                    <span class="status ${status}">${request.status}</span>
                </div>
                <div class="request-info">
                    <p><i class="fa-solid fa-calendar"></i> ${request.date}</p>
                    <p><i class="fa-solid fa-futbol"></i> ${request.activity}</p>
                </div>
                <div class="request-actions">
                    <div class="action-row">
                        <button class="action-btn btn-profile" onclick="showRequestDetails('${request.id}')">
                            <i class="fa-solid fa-eye"></i> View Details
                        </button>
                    </div>
                    ${showActionButtons ?`
                        <div class="action-row action-buttons">
                            <button class="action-btn btn-accept" onclick="acceptR('${request.id}')">
                                <i class="fa-solid fa-check"></i> Accept
                            </button>
                            <button class="action-btn btn-reject" onclick="rejectR('${request.id}')">
                                <i class="fa-solid fa-times"></i> Reject
                            </button>
                        </div>
                    ` : ''}
                    ${accepted1 ? `
                        <div class="action-row status-button">
                            <button class="action-btn btn-accept" disabled>
                                <i class="fa-solid fa-info-circle"></i> ${request.status}
                            </button>
                        </div>
                    ` : ''}
                    ${rejected1 ? `
                        <div class="action-row status-button">
                            <button class="action-btn btn-cancel" disabled>
                                <i class="fa-solid fa-info-circle"></i> ${request.status}
                            </button>
                        </div>
                    ` : ''}
                    ${cancelled1 ? `
                        <div class="action-row status-button">
                            <button class="action-btn btn-status" disabled>
                                <i class="fa-solid fa-info-circle"></i> ${request.status}
                            </button>
                        </div>
                    ` : ''}
                    ${expired1 ? `
                        <div class="action-row status-button">
                            <button class="action-btn btn-status" disabled>
                                <i class="fa-solid fa-info-circle"></i> ${request.status}
                            </button>
                        </div>
                    ` : ''}
                    ${showCancelButton ? `
                        <div class="action-row cancel-button">
                            <button class="action-btn btn-cancel" onclick="cancelR('${request.id}')">
                                <i class="fa-solid fa-ban"></i> Cancel Request
                            </button>
                        </div>
                    ` : ''}

                    ${accepted2 ? `
                        <div class="action-row status-button">
                            <button class="action-btn btn-accept" disabled>
                                <i class="fa-solid fa-info-circle"></i> ${request.status}
                            </button>
                        </div>
                    ` : ''}

                    ${rejected2 ? `
                        <div class="action-row status-button">
                            <button class="action-btn btn-reject" disabled>
                                <i class="fa-solid fa-info-circle"></i> ${request.status}
                            </button>
                        </div>
                    ` : ''}
                    ${cancelled2 ? `
                        <div class="action-row status-button">
                            <button class="action-btn btn-status" disabled>
                                <i class="fa-solid fa-info-circle"></i> ${request.status}
                            </button>
                        </div>
                    ` : ''}

                    ${expired2 ? `
                        <div class="action-row status-button">
                            <button class="action-btn btn-status" disabled>
                                <i class="fa-solid fa-info-circle"></i> ${request.status}
                            </button>
                        </div>
                    ` : ''}
                    
                </div>
            </div>
        `;
        usersContainer.appendChild(requestCard);
    });
}


async function handleRequestAction(requestId, action) {
    try {
        const response = await fetch(`http://localhost:3000/api/requests/update/${requestId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: action })
        });
        if (!response.ok) throw new Error(`Failed to ${action} request`);
        const updatedRequest = await response.json();

        // Update the request in filteredRequests
        filteredRequests = filteredRequests.map(req => 
            req.id === requestId ? { ...req, status: action } : req
        );

        // Refresh the displayed requests
        const start = (currentPage - 1) * requestsPerPage;
        const end = start + requestsPerPage;
        displayRequests(filteredRequests.slice(0, end));
        updateLoadMoreButton();

        // Show success toast
        showToast(`Request ${action} successfully!`);
    } catch (error) {
        console.error(`Error ${action} request:`, error);
        showToast(`Failed to ${action} request. Please try again.`, 'error');
    }
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('successToast');
    const toastMessage = toast.querySelector('.toast-message');
    toastMessage.textContent = message;
    
    if (type === 'error') {
        toast.querySelector('.toast-icon').classList.remove('success');
        toast.querySelector('.toast-icon i').classList.replace('fa-check', 'fa-exclamation');
    } else {
        toast.querySelector('.toast-icon').classList.add('success');
        toast.querySelector('.toast-icon i').classList.replace('fa-exclamation', 'fa-check');
    }

    toast.classList.add('active');
    setTimeout(() => {
        toast.classList.remove('active');
    }, 3000);
}

// Update "Load More" button visibility
function updateLoadMoreButton() {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    loadMoreBtn.style.display = filteredRequests.length > currentPage * requestsPerPage ? 'block' : 'none';
}

// ${showActionButtons ? `<span class="status ${status}">${request.status}</span>` : ''}
// Show request details modal
function showRequestDetails(requestId) {
    const request = filteredRequests.find(r => r.id === requestId);
    if (!request) return;

    const isReceiver = request.sender !== name;
        const isSender = request.sender === name;
        const status = request.status.toLowerCase();
        const showActionButtons = isReceiver && status === 'pending'; // For Accept/Reject
        const accepted1 = isReceiver && status === 'accepted';
        const rejected1 = isReceiver && status === 'rejected';
        const expired1 = isReceiver && status === 'expired';

        const cancelled1 = isReceiver && status === 'cancelled';
        const showCancelButton = isSender && status==='pending';
        const accepted2 = isSender && status==='accepted';
        const rejected2 = isSender && status==='rejected';
        const expired2 = isSender && status==='expired';
        const cancelled2 = isSender && status==='cancelled';
    
    const requestDetail = document.getElementById('requestDetail');
    requestDetail.innerHTML = `
        <h3>${request.sender}</h3>
        ${showActionButtons ? `<span class="status ${request.status.toLowerCase()}">${request.status}</span>` : ''}

        ${accepted1 ? `<span class="status ${request.status.toLowerCase()}">You have ${request.status} the request!</span>` : ''}

        ${rejected1 ? `<span class="status ${request.status.toLowerCase()}">You have ${request.status} the request!</span>` : ''}
        
        ${expired1 ? `<span class="status ${request.status.toLowerCase()}">The Request has been ${request.status}!</span>` : ''}

        ${cancelled1 ? `<span class="status ${request.status.toLowerCase()}">The Request has been ${request.status}!</span>` : ''}

        ${showCancelButton ? `<span class="status ${request.status.toLowerCase()}">Your Request is still ${request.status}!</span>` : ''}

        ${accepted2 ? `<span class="status ${request.status.toLowerCase()}">Your Request has been ${request.status} by ${request.receiverName}!</span>` : ''}

        ${rejected2 ? `<span class="status ${request.status.toLowerCase()}">Your Request has been ${request.status}!</span>` : ''}

        ${expired2 ? `<span class="status ${request.status.toLowerCase()}">Your Request has been ${request.status}!</span>` : ''}
   

        ${cancelled2 ? `<span class="status ${request.status.toLowerCase()}">Your have ${request.status} the request!</span>` : ''}
        
        <p><i class="fa-solid fa-calendar"></i> Date: ${request.date}</p>
        <p><i class="fa-solid fa-futbol"></i> Activity: ${request.activity}</p>
        <div class="message">
            <p><strong>Message:</strong> ${request.message}</p>
        </div>
    `;
    document.getElementById('requestDetailsModal').classList.add('active');
    document.body.classList.add('modal-open');
}

// Close modals
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
    document.body.classList.remove('modal-open');
}

document.getElementById('requestDetailsModalClose').addEventListener('click', () => closeModal('requestDetailsModal'));
document.getElementById('requestDetailsModalOverlay').addEventListener('click', () => closeModal('requestDetailsModal'));

document.addEventListener('DOMContentLoaded', () => {
    // Load more requests
    document.getElementById('loadMoreBtn').addEventListener('click', () => {
        currentPage++;
        const start = (currentPage - 1) * requestsPerPage;
        const end = start + requestsPerPage;
        displayRequests(filteredRequests.slice(0, end));
        updateLoadMoreButton();
    });

    // Navbar toggle
    document.getElementById('menuToggle').addEventListener('click', () => {
        document.getElementById('navLinks').classList.toggle('active');
    });

    // Close menu when clicking outside
    document.addEventListener('click', function (e) {
        const navLinks = document.getElementById('navLinks');
        const menuToggle = document.getElementById('menuToggle');

        if (!navLinks.contains(e.target) && !menuToggle.contains(e.target) && navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            const icon = menuToggle.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });

    // Sidebar toggle
    document.getElementById('sidebarToggle').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('collapsed');
    });

    // Initial fetch
    fetchRequests(`http://localhost:3000/api/requests/details`);
});