// Mock API data enhancement
const mockProfilePics = [
    'https://via.placeholder.com/100?text=User1',
    'https://via.placeholder.com/100?text=User2',
    'https://via.placeholder.com/100?text=User3',
    'https://via.placeholder.com/100?text=User4',
    'https://via.placeholder.com/100?text=User5'
];

let userObj = window.userObj || {};
let teamObj = window.teamObj || {};
let playObj = window.playObj || {};
let locaObj = window.locaObj || {};
let userId = userObj ? userObj._id : null;
let teamId = teamObj ? teamObj._id : null;
let id;

if(userId){
    id = userId
}

else{
    id = teamId
}

let users = [];
let filteredUsers = []; 
let currentPage = 1;
const usersPerPage = 6;

function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

async function fetchUsers() {
    try {
        const response = await fetch(`/api/users/filter/${playObj}/${locaObj}/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch users');
        const data = await response.json();
        users = data.map((user, index) => ({
            id: user._id,
            name: user.name,
            username: user.username,
            phone: user.phone,
            bio: user.bio,
            city: user.location,
            profile_picture: user.profileImage,
            sports: Array.isArray(user.sports) ? user.sports.join(', ') : user.sports,
            email: user.email,
            online_games: Array.isArray(user.onlineGames) ? user.onlineGames.join(', ') : user.onlineGames,
         }));
        filteredUsers = [...users]; // Initialize filteredUsers with all users
        displayUsers(filteredUsers.slice(0, usersPerPage));
        updateLoadMoreButton();
    } catch (error) {
        console.error('Error fetching users:', error);
        document.getElementById('usersContainer').innerHTML = '<p>Error loading users. Please try again.</p>';
    }
}

function filterUsers(query) {
    if (!query) {
        filteredUsers = [...users]; 
    } else {
        const lowerQuery = query.toLowerCase();
        filteredUsers = users.filter(user =>
            user.username.toLowerCase().includes(lowerQuery)
        );
    }
    currentPage = 1; // Reset to first page on search
    displayUsers(filteredUsers.slice(0, usersPerPage));
    updateLoadMoreButton();
}

function displayUsers(usersToDisplay) {
    const usersContainer = document.getElementById('usersContainer');
    usersContainer.innerHTML = '';
    if (usersToDisplay.length === 0) {
        usersContainer.innerHTML = '<p>No users found.</p>';
        return;
    }
    usersToDisplay.forEach(user => {
        const chatLink = userId
            ? `/chat1/${userId}/${user.id}`
            : `/chat1/${teamId}/${user.id}`;

        const userCard = document.createElement('div');
        userCard.className = 'user-card';
        userCard.innerHTML = `
            <div class="card-bg"></div>
            <div class="card-content">
                <div class="user-id" style="display:none;">${user.id}</div>
                <div class="user-header">
                    <div class="user-avatar">
                        <img src="${user.profile_picture}" alt="${user.username}">
                    </div>
                    <div class="user-info">
                        <h3>${user.username}</h3>
                        <p>Player</p>
                    </div>
                </div>
                <div class="detail-item">
                    <i class="fa-solid fa-envelope"></i>
                    <span>${user.email}</span>
                </div>
                <br>
                <div class="user-details">
                    <div class="detail-item">
                        <i class="fa-solid fa-phone"></i>
                        <span>${user.phone}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fa-solid fa-city"></i>
                        <span>${user.city}</span>
                    </div>
                </div>
                <div class="card-actions">
                    <div class="action-row">
                        <button class="action-btn btn-profile" onclick="showProfile('${user.username}')">
                            <i class="fa-solid fa-user"></i> See Full Profile
                        </button>
                        <button class="action-btn btn-request" onclick="showRequestForm('${user.username}')">
                            <i class="fa-solid fa-paper-plane"></i> Send Request
                        </button>
                    </div>
                    <div class="action-centered">
                        <a href="${chatLink}" class="action-btn btn-chat">
                            <i class="fa-solid fa-message"></i> Start Chat
                        </a>
                    </div>
                </div>
            </div>
        `;
        usersContainer.appendChild(userCard);
    });
}

function updateLoadMoreButton() {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    loadMoreBtn.style.display = filteredUsers.length > currentPage * usersPerPage ? 'block' : 'none';
}

function showProfile(username) {
    const user = filteredUsers.find(u => u.username === username);
    if (!user) return;
    const profileDetail = document.getElementById('profileDetail');
    profileDetail.innerHTML = `
        <div class="user-avatar">
            <img src="${user.profile_picture}" alt="${user.username}">
        </div>
        <div class="detail-item">
            <i class="fa-solid fa-user"></i>
            <h3>${user.username}</h3>
        </div>
        ${user.bio ? `
            <div class="detail-item">
                <i class="fa-solid fa-pencil"></i>
                <span>${user.bio}</span>
            </div>` : ''}
        <div class="detail-item">
            <i class="fa-solid fa-envelope"></i>
            <span>${user.email}</span>
        </div>
        <div class="detail-item">
            <i class="fa-solid fa-phone"></i>
            <span>${user.phone}</span>
        </div>
        <div class="detail-item">
            <i class="fa-solid fa-city"></i>
            <span>${user.city}</span>
        </div>
        <div class="detail-item">
            <i class="fa-solid fa-futbol"></i>
            <span>Sports: ${user.sports}</span>
        </div>
        <div class="detail-item">
            <i class="fa-solid fa-gamepad"></i>
            <span>Games: ${user.online_games}</span>
        </div>
    `;
    document.getElementById('profileModal').classList.add('active');
    document.body.classList.add('modal-open');
}

function showRequestForm(username) {
    const user = filteredUsers.find(u => u.username === username);
    
    let baseActionUrl;
    if (userObj && userObj._id) {
        baseActionUrl = `/api/requests/send1/${userObj._id}`;
    } else if (teamObj && teamObj._id) {
        baseActionUrl = `/api/requests/send1/${teamObj._id}`;
    } else {
        console.error('No user or team ID available');
        return;
    }

    // Append the userId to the action URL
    requestForm.action = `${baseActionUrl}/${user.id}`;

    // Show the request modal
    document.getElementById('requestModal').classList.add('active');
    document.body.classList.add('modal-open');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
    document.body.classList.remove('modal-open');
}

document.getElementById('modalClose').addEventListener('click', () => closeModal('profileModal'));
document.getElementById('requestModalClose').addEventListener('click', () => closeModal('requestModal'));
document.getElementById('cancelRequest').addEventListener('click', () => closeModal('requestModal'));
document.getElementById('modalOverlay').addEventListener('click', () => closeModal('profileModal'));
document.querySelector('#requestModal .modal-overlay').addEventListener('click', () => closeModal('requestModal'));

const sportToggle = document.getElementById('sportToggle');
const gameToggle = document.getElementById('gameToggle');
const sportSelectGroup = document.getElementById('sportSelectGroup');
const gameSelectGroup = document.getElementById('gameSelectGroup');
const venueGroup = document.getElementById('venueGroup');
const platformGroup = document.getElementById('platformGroup');

sportToggle.addEventListener('click', () => {
    sportToggle.classList.add('active');
    gameToggle.classList.remove('active');
    document.getElementById('requestType').value = 'sport';
    sportSelectGroup.classList.remove('hidden');
    venueGroup.classList.remove('hidden');
    gameSelectGroup.classList.add('hidden');
    platformGroup.classList.add('hidden');
});

gameToggle.addEventListener('click', () => {
    gameToggle.classList.add('active');
    sportToggle.classList.remove('active');
    document.getElementById('requestType').value = 'game';
    gameSelectGroup.classList.remove('hidden');
    platformGroup.classList.remove('hidden');
    sportSelectGroup.classList.add('hidden');
    venueGroup.classList.add('hidden');
});

document.getElementById('requestForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('Form submission triggered');

    const form = e.target;
    console.log('Form Action URL:', form.action);

    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    // Basic validation
    if (!data.dateTime || !data.message) {
        document.querySelector('#errorToast .toast-message').textContent = 'Date & Time and Message are required.';
        document.getElementById('errorToast').classList.add('active');
        setTimeout(() => {
            document.getElementById('errorToast').classList.remove('active');
        }, 3000);
        return;
    }
    if (data.requestType === 'sport' && !data.sport) {
        document.querySelector('#errorToast .toast-message').textContent = 'Please specify a sport.';
        document.getElementById('errorToast').classList.add('active');
        setTimeout(() => {
            document.getElementById('errorToast').classList.remove('active');
        }, 3000);
        return;
    }
    if (data.requestType === 'game' && !data.game) {
        document.querySelector('#errorToast .toast-message').textContent = 'Please specify a game.';
        document.getElementById('errorToast').classList.add('active');
        setTimeout(() => {
            document.getElementById('errorToast').classList.remove('active');
        }, 3000);
        return;
    }

    try {
        const response = await fetch(form.action, {
            method: 'POST',
            body: JSON.stringify(data),
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            console.log('Request sent successfully');
            document.getElementById('successToast').classList.add('active');
            setTimeout(() => {
                document.getElementById('successToast').classList.remove('active');
            }, 3000);
            closeModal('requestModal');
        } else {
            let errorData;
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                errorData = await response.json();
                document.querySelector('#errorToast .toast-message').textContent = errorData.message || 'Failed to send request';
            } else {
                document.querySelector('#errorToast .toast-message').textContent = `Server error: ${response.statusText}`;
            }
            console.error('Failed to send request:', errorData || response.statusText);
            document.getElementById('errorToast').classList.add('active');
            setTimeout(() => {
                document.getElementById('errorToast').classList.remove('active');
            }, 3000);
        }
    } catch (error) {
        console.error('Error sending request:', error);
        document.querySelector('#errorToast .toast-message').textContent = 'Network error. Please try again.';
        document.getElementById('errorToast').classList.add('active');
        setTimeout(() => {
            document.getElementById('errorToast').classList.remove('active');
        }, 3000);
    }
});
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchFilter');
    
    const handleSearch = debounce((query) => {
        filterUsers(query);
    }, 300);

    searchInput.addEventListener('input', (e) => {
        handleSearch(e.target.value.trim());
    });

    document.getElementById('loadMoreBtn').addEventListener('click', () => {
        currentPage++;
        const start = (currentPage - 1) * usersPerPage;
        const end = start + usersPerPage;
        displayUsers(filteredUsers.slice(0, end));
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
    fetchUsers();
});


// CHATBOT


document.addEventListener('DOMContentLoaded', function() {
    console.log("Chatbot script loaded"); // Debug log
    
    
    const chatbotIcon = document.getElementById('chatbotIcon');
    const chatbotContainer = document.getElementById('chatbotContainer');
    const chatbotClose = document.getElementById('chatbotClose');
    const chatbotMessages = document.getElementById('chatbotMessages');
    const chatbotInput = document.getElementById('chatbotInput');
    const sendButton = document.getElementById('sendButton');
    const recordButton = document.getElementById('recordButton');
    
    // Debug logging
    console.log("Chatbot elements:", {
        chatbotIcon: !!chatbotIcon,
        chatbotContainer: !!chatbotContainer,
        chatbotClose: !!chatbotClose
    });
    
    // Speech recognition setup
    let recognition = null;
    let isRecording = false;
    
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        
        // Auto-detect language
        recognition.lang = '';
        
        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            chatbotInput.value = transcript;
            stopRecording();
        };
        
        recognition.onerror = function(event) {
            console.error('Speech recognition error:', event.error);
            stopRecording();
        };
        
        recognition.onend = function() {
            stopRecording();
        };
    } else {
        if (recordButton) {
            recordButton.style.display = 'none';
        }
        console.log('Speech recognition not supported');
    }
    
    function startRecording() {
        if (recognition) {
            try {
                recognition.start();
                isRecording = true;
                recordButton.classList.add('recording');
            } catch (e) {
                console.error('Error starting speech recognition:', e);
            }
        }
    }
    
    function stopRecording() {
        if (recognition && isRecording) {
            recognition.stop();
            isRecording = false;
            recordButton.classList.remove('recording');
        }
    }
    
    // Toggle chatbot visibility
    if (chatbotIcon) {
        chatbotIcon.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log("Chatbot icon clicked"); // Debug log
            
            if (chatbotContainer) {
                chatbotContainer.classList.add('active');
                chatbotIcon.style.display = 'none';
                
                // If this is first open, add welcome message
                if (chatbotMessages && chatbotMessages.children.length === 0) {
                    displayBotMessage("Hello! Welcome to PlayPLexus. How can I assist you today?");
                }
            }
        });
    }
    
    // Close chatbot
    if (chatbotClose) {
        chatbotClose.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log("Close button clicked"); // Debug log
            
            if (chatbotContainer) {
                chatbotContainer.classList.remove('active');
                if (chatbotIcon) {
                    chatbotIcon.style.display = 'flex';
                }
                stopRecording();
            }
        });
    }
    
    // Close chatbot when clicking outside
    document.addEventListener('click', function(event) {
        if (chatbotContainer && chatbotIcon && 
            chatbotContainer.classList.contains('active') && 
            !chatbotContainer.contains(event.target) && 
            event.target !== chatbotIcon) {
            chatbotContainer.classList.remove('active');
            chatbotIcon.style.display = 'flex';
            stopRecording();
        }
    });
    
    // Send message when Enter key is pressed (without Shift)
    if (chatbotInput) {
        chatbotInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
            
            // Auto resize textarea
            setTimeout(() => {
                this.style.height = 'auto';
                const height = Math.min(this.scrollHeight, 100);
                this.style.height = height + 'px';
            }, 0);
        });
    }
    
    // Send button click handler
    if (sendButton) {
        sendButton.addEventListener('click', sendMessage);
    }
    
    // Record button click handler
    if (recordButton) {
        recordButton.addEventListener('click', function() {
            if (isRecording) {
                stopRecording();
            } else {
                startRecording();
            }
        });
    }
    
    // Function to send message
    function sendMessage() {
        if (!chatbotInput) return;
        
        const message = chatbotInput.value.trim();
        if (message) {
            // Display user message
            displayUserMessage(message);
            
            // Clear input
            chatbotInput.value = '';
            chatbotInput.style.height = 'auto';
            
            // Show typing indicator
            showTypingIndicator();
            
            // Send to backend and get response
            // Replace '/chatbot/message' with your actual endpoint
            fetch(`/api/chats/ask/${userId}/${teamId}`, {
                method: 'POST',
                headers: {
      "Content-Type": "application/json",
    },
    credentials: 'include',
                body: JSON.stringify({ userSpeechText: message })
            })
            .then(response => response.json())
            .then(data => {
                
                
                hideTypingIndicator();
                                
                displayBotMessage(data);
            })
            .catch(error => {
                console.error('Error:', error);
                hideTypingIndicator();
                displayBotMessage("Sorry, I encountered an error. Please try again later.");
            });
        }
    }
    
    // Display user message in chat
    function displayUserMessage(message) {
        if (!chatbotMessages) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user';
        messageDiv.textContent = message;
        
        const timeSpan = document.createElement('span');
        timeSpan.className = 'message-time';
        timeSpan.textContent = getCurrentTime();
        messageDiv.appendChild(timeSpan);
        
        chatbotMessages.appendChild(messageDiv);
        scrollToBottom();
    }
    
    // Display bot message in chat
    function displayBotMessage(message) {
        if (!chatbotMessages) return;
        console.log(message);
        console.log(typeof message === 'object')
        if(typeof message === 'object'){
         const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot';
        messageDiv.textContent = message.text;

        const messageDiv1 = document.createElement('div');
         messageDiv1.className = 'message bot';


const link = document.createElement('a');
link.href = `${message.link}`;
link.textContent = message.link;

// Append anchor to div
messageDiv1.appendChild(link);
        
        const timeSpan = document.createElement('span');
        timeSpan.className = 'message-time';
        timeSpan.textContent = getCurrentTime();
        messageDiv.appendChild(timeSpan);
        
        chatbotMessages.appendChild(messageDiv);
        chatbotMessages.appendChild(messageDiv1);
        }

        else{
            const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot';
        messageDiv.textContent = message;
        
        const timeSpan = document.createElement('span');
        timeSpan.className = 'message-time';
        timeSpan.textContent = getCurrentTime();
        messageDiv.appendChild(timeSpan);
        chatbotMessages.appendChild(messageDiv);
        }
        scrollToBottom();
    }
    
    // Show typing indicator
    function showTypingIndicator() {
        if (!chatbotMessages) return;
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.id = 'typingIndicator';
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('span');
            typingDiv.appendChild(dot);
        }
        
        chatbotMessages.appendChild(typingDiv);
        scrollToBottom();
    }
    
    // Hide typing indicator
    function hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    // Get current time in HH:MM format
    function getCurrentTime() {
        const now = new Date();
        let hours = now.getHours();
        let minutes = now.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        
        hours = hours % 12;
        hours = hours ? hours : 12;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        
        return `${hours}:${minutes} ${ampm}`;
    }
    
    // Scroll to bottom of chat
    function scrollToBottom() {
        if (chatbotMessages) {
            chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
        }
    }
});
