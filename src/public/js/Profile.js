




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
