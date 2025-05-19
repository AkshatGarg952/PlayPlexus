let requests = [];
let filteredRequests = []; // Store filtered requests for display
let currentPage = 1;
const requestsPerPage = 6;

let userObj = window.userObj || {};
let teamObj = window.teamObj || {};
let name = userObj.username || teamObj.name;
let userId = userObj ? userObj._id : null;
let teamId = teamObj ? teamObj._id : null;





const socket = io({
    transports: ['websocket', 'polling']
});

socket.on('connect', () => {
            console.log('Connected to Socket.IO server with ID:', socket.id);
           
        });

        socket.on('connect_error', (error) => {
            console.error('Socket.IO connection error:', error);
            alert('Failed to connect to chat server: ' + error.message);
        });


function acceptR(requestId, requestCard) {

    const actionButtons = requestCard.querySelector('#both');
    const status = requestCard.querySelector('.status');
    if(status){
    status.textContent = 'Accepted';
    status.className = 'status accepted';
    }
if (actionButtons) {
    const statusDiv = document.createElement('div');
    statusDiv.className = 'action-row status-button';
    statusDiv.innerHTML = `
                        <div class="action-row status-button">
                            <button class="action-btn btn-accept" disabled>
                                <i class="fa-solid fa-info-circle"></i> accepted
                            </button>
                        </div>
                    `;


    
    actionButtons.replaceWith(statusDiv);
}

   
    socket.emit('requestAction', { action: 'accept', requestId });
}


function rejectR(requestId, requestCard) {
    const actionButtons = requestCard.querySelector('#both');
    const status = requestCard.querySelector('.status');
    if(status){
    status.textContent = 'Rejected';
    status.className = 'status rejected';
    }
if (actionButtons) {
    const statusDiv = document.createElement('div');
    statusDiv.className = 'action-row status-button';
    statusDiv.innerHTML = `
        <button class="action-btn btn-reject" disabled>
            <i class="fa-solid fa-info-circle"></i> rejected
        </button>
    `;

    
    actionButtons.replaceWith(statusDiv);
}


    
    socket.emit('requestAction', { action: 'reject', requestId });
}


function cancelR(requestId, requestCard) {
   const cancelDiv = requestCard.querySelector('#cancell');
   const status = requestCard.querySelector('.status');
    if(status){
    status.textContent = 'Cancelled';
    status.className = 'status cancelled';
    }
if (cancelDiv) {
    const statusDiv = document.createElement('div');
    statusDiv.className = 'action-row status-button';
    statusDiv.innerHTML =  `
                            <button class="action-btn btn-status" disabled>
                                <i class="fa-solid fa-info-circle"></i> cancelled
                            </button>
                      
                    `;

    cancelDiv.replaceWith(statusDiv);
}
    console.log(requestId);
    socket.emit('requestAction', { action: 'cancel', requestId });
}


socket.on('receive', (m) => {
  console.log('Received event:', m);
  console.log(getAllRequestCardIds());
  const requestCard = document.querySelector(`.request-card[data-request-id="${m.id}"]`);
 
  console.log(requestCard.getAttribute('data-request-id'));

  if (!requestCard) {
    console.warn(`Request card with ID ${m.id} not found.`);
    return;
  }

  

  
  if (m.status === 'accepted') {
    
    const cancelDiv = requestCard.querySelector('#cancell');
    const status = requestCard.querySelector('.status');
    if(status){
    status.textContent = 'Accepted';
    status.className = 'status accepted';
    }
if (cancelDiv) {
    const statusDiv = document.createElement('div');
    statusDiv.className = 'action-row status-button';
    statusDiv.innerHTML = `
        <button class="action-btn btn-accept" disabled>
            <i class="fa-solid fa-info-circle"></i> accepted
        </button>
    `;

    
    cancelDiv.replaceWith(statusDiv);
}


  } 
  
  
  else if (m.status === 'rejected') {
    const cancelDiv = requestCard.querySelector('#cancell');
    const status = requestCard.querySelector('.status');
    if(status){
    status.textContent = 'Rejected';
    status.className = 'status rejected';
    }
if (cancelDiv) {
    const statusDiv = document.createElement('div');
    statusDiv.className = 'action-row status-button';
    statusDiv.innerHTML = `
                        <div class="action-row status-button">
                            <button class="action-btn btn-reject" disabled>
                                <i class="fa-solid fa-info-circle"></i> rejected
                            </button>
                        </div>
                    `;

    cancelDiv.replaceWith(statusDiv);
}
  }
  
  else if (m.status === 'cancelled') {
    const actionButtons = requestCard.querySelector('#both');
    const status = requestCard.querySelector('.status');
    if(status){
    status.textContent = 'Cancelled';
    status.className = 'status cancelled';
    }
if (actionButtons) {
    const statusDiv = document.createElement('div');
    statusDiv.className = 'action-row status-button';
    statusDiv.innerHTML = `
                        <div class="action-row status-button">
                            <button class="action-btn btn-status" disabled>
                                <i class="fa-solid fa-info-circle"></i> cancelled
                            </button>
                        </div>
                    `;
    actionButtons.replaceWith(statusDiv);
}
  }

  filteredRequests = filteredRequests.map(req =>
    req.id === m.requestId ? { ...req, status: m.status } : req
  );

  const requestDetail = document.getElementById('requestDetail');
  if (requestDetail && requestDetail.querySelector('h3')?.textContent === m.sender) {
    showRequestDetails(m.requestId);
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
            activity: request.sport || request.onlineGame
        }));
        filteredRequests = [...requests]; // Initialize filteredRequests with all requests
        displayRequests(filteredRequests.slice(0, requestsPerPage));
        updateLoadMoreButton();
    } catch (error) {
        console.error('Error fetching requests:', error);
        document.getElementById('usersContainer').innerHTML = '<p>Error loading requests. Please try again.</p>';
    }
}

// Display requests in cards
// Display requests in cards
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
        requestCard.setAttribute('data-request-id', request.id);
        // Check conditions for buttons
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
                    ${showActionButtons ? `
                        <div class="action-row action-buttons" id="both">
                            <button class="action-btn btn-accept" id="accept-button" onclick="acceptR('${request.id}', this.closest('.request-card'))">
                                <i class="fa-solid fa-check"></i> Accept
                            </button>
                            <button class="action-btn btn-reject" id="reject-button" onclick="rejectR('${request.id}', this.closest('.request-card'))">
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
                            <button class="action-btn btn-reject" disabled>
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
                        <div class="action-row cancel-button" id="cancell">
                            <button class="action-btn btn-cancel" id="cancel-button" onclick="cancelR('${request.id}', this.closest('.request-card'))">
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

// Handle accept/reject actions
async function handleRequestAction(requestId, action) {
    try {
        const response = await fetch(`/api/requests/update/${requestId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: action })
        });
        if (!response.ok) throw new Error(`Failed to ${action} request`);
        const updatedRequest = await response.json();

        
        filteredRequests = filteredRequests.map(req => 
            req.id === requestId ? { ...req, status: action } : req
        );

        const start = (currentPage - 1) * requestsPerPage;
        const end = start + requestsPerPage;
        displayRequests(filteredRequests.slice(0, end));
        updateLoadMoreButton();

        
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
    fetchRequests(`/api/requests/newdetails`);
});
