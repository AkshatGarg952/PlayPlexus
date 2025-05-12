

// document.getElementById('modalClose').addEventListener('click', () => closeModal('profileModal'));
// document.getElementById('requestModalClose').addEventListener('click', () => closeModal('requestModal'));
// document.getElementById('cancelRequest').addEventListener('click', () => closeModal('requestModal'));
// document.getElementById('modalOverlay').addEventListener('click', () => closeModal('profileModal'));
// document.querySelector('#requestModal .modal-overlay').addEventListener('click', () => closeModal('requestModal'));

// // Toggle activity type
// const sportToggle = document.getElementById('sportToggle');
// const gameToggle = document.getElementById('gameToggle');
// const sportSelectGroup = document.getElementById('sportSelectGroup');
// const gameSelectGroup = document.getElementById('gameSelectGroup');
// const venueGroup = document.getElementById('venueGroup');
// const platformGroup = document.getElementById('platformGroup');

// sportToggle.addEventListener('click', () => {
//     sportToggle.classList.add('active');
//     gameToggle.classList.remove('active');
//     document.getElementById('requestType').value = 'sport';
//     sportSelectGroup.classList.remove('hidden');
//     venueGroup.classList.remove('hidden');
//     gameSelectGroup.classList.add('hidden');
//     platformGroup.classList.add('hidden');
// });

// gameToggle.addEventListener('click', () => {
//     gameToggle.classList.add('active');
//     sportToggle.classList.remove('active');
//     document.getElementById('requestType').value = 'game';
//     gameSelectGroup.classList.remove('hidden');
//     platformGroup.classList.remove('hidden');
//     sportSelectGroup.classList.add('hidden');
//     venueGroup.classList.add('hidden');
// });


// Navbar toggle
document.getElementById('menuToggle').addEventListener('click', () => {
    document.getElementById('navLinks').classList.toggle('active');
});

// Sidebar toggle
document.getElementById('sidebarToggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('collapsed');
});

// Profile Picture Preview
document.getElementById('profilePicInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('profilePicPreview').src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});


function populateEditForm() {
    document.getElementById('profilePicPreview').src = currentUser.profile_picture;
    document.getElementById('name').value = currentUser.name || '';
    document.getElementById('username').value = currentUser.username || '';
    document.getElementById('email').value = currentUser.email || '';
    document.getElementById('phone').value = currentUser.phone || '';
    document.getElementById('location').value = currentUser.location || '';
    document.getElementById('sports').value = currentUser.sports.join(', ') || '';
    document.getElementById('onlineGames').value = currentUser.online_games.join(', ') || '';
    document.getElementById('bio').value = currentUser.bio || '';
}

document.getElementById('editProfileButton').addEventListener('click', () => {
    document.getElementById('profileDisplay').classList.add('hidden');
    document.getElementById('editProfileSection').classList.remove('hidden');
    populateEditForm();
});

document.getElementById('cancelEdit').addEventListener('click', () => {
    document.getElementById('editProfileSection').classList.add('hidden');
    document.getElementById('profileDisplay').classList.remove('hidden');
});
