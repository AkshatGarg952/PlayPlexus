
// Navbar toggle
document.getElementById('menuToggle').addEventListener('click', () => {
    document.getElementById('navLinks').classList.toggle('active');
});

// Sidebar toggle
document.getElementById('sidebarToggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('collapsed');
});

// Toast close button
document.querySelector('.toast-close').addEventListener('click', () => {
    document.getElementById('successToast').classList.remove('active');
});


