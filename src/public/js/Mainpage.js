// DOM Elements
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
const cubeScene = document.getElementById('cubeScene');
const chatbotButton = document.querySelector('.chatbot-button');

// Icons for cube faces
const cubeIcons = [
    'fa-gamepad',
    'fa-trophy',
    'fa-chess',
    'fa-dice',
    'fa-futbol',
    'fa-basketball',
    'fa-volleyball',
    'fa-table-tennis-paddle-ball',
    'fa-headset',
    'fa-medal'
];

// Navar
// Navbar toggle - improved version
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
        const icon = menuToggle.querySelector('i');
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    }
});
// Bavbar

// Toggle Sidebar
sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    
    // Save preference to localStorage
    const isCollapsed = sidebar.classList.contains('collapsed');
    localStorage.setItem('sidebarCollapsed', isCollapsed);
});

// Check localStorage for sidebar state
document.addEventListener('DOMContentLoaded', () => {
    const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    if (isCollapsed) {
        sidebar.classList.add('collapsed');
    }
    
    // Initialize cubes
    createCubes();
    
    // Start cube animations
    animateCubes();
});

// Create 3D Cubes
function createCubes() {
    // Clear existing cubes
    cubeScene.innerHTML = '';
    
    // Create new cubes
    const numCubes = window.innerWidth < 768 ? 5 : 10;
    
    for (let i = 0; i < numCubes; i++) {
        // Create cube container
        const cube = document.createElement('div');
        cube.className = 'cube';
        
        // Set random position
        const posX = Math.random() * 80; // % of container width
        const posY = Math.random() * 70; // % of container height
        cube.style.left = `${posX}%`;
        cube.style.top = `${posY}%`;
        
        // Set random size
        const size = 40 + Math.random() * 40; // between 40px and 80px
        cube.style.width = `${size}px`;
        cube.style.height = `${size}px`;
        
        // Add cube faces
        const faces = ['front', 'back', 'right', 'left', 'top', 'bottom'];
        faces.forEach(face => {
            const cubeFace = document.createElement('div');
            cubeFace.className = `cube-face ${face}`;
            
            // Add icon to the front face
            if (face === 'front') {
                const icon = document.createElement('i');
                const randomIcon = cubeIcons[Math.floor(Math.random() * cubeIcons.length)];
                icon.className = `fa-solid ${randomIcon}`;
                cubeFace.appendChild(icon);
            }
            
            cube.appendChild(cubeFace);
        });
        
        // Apply initial random rotation
        const rotX = Math.random() * 360;
        const rotY = Math.random() * 360;
        const rotZ = Math.random() * 360;
        cube.style.transform = `translateZ(-30px) rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(${rotZ}deg)`;
        
        // Add data attributes for animation
        cube.dataset.rotationSpeed = 0.2 + Math.random() * 0.5;
        cube.dataset.rotationDirection = Math.random() > 0.5 ? 1 : -1;
        cube.dataset.rotationAxis = ['X', 'Y', 'Z'][Math.floor(Math.random() * 3)];
        
        // Add to scene
        cubeScene.appendChild(cube);
    }
}

// Animate Cubes
function animateCubes() {
    const cubes = document.querySelectorAll('.cube');
    
    cubes.forEach(cube => {
        let rotation = 0;
        const speed = parseFloat(cube.dataset.rotationSpeed);
        const direction = parseInt(cube.dataset.rotationDirection);
        const axis = cube.dataset.rotationAxis;
        
        // Create unique animation function for each cube
        function animateCube() {
            rotation += speed * direction;
            
            // Apply rotation based on assigned axis
            if (axis === 'X') {
                cube.style.transform = `translateZ(-30px) rotateX(${rotation}deg)`;
            } else if (axis === 'Y') {
                cube.style.transform = `translateZ(-30px) rotateY(${rotation}deg)`;
            } else {
                cube.style.transform = `translateZ(-30px) rotateZ(${rotation}deg)`;
            }
            
            requestAnimationFrame(animateCube);
        }
        
        // Start animation
        animateCube();
    });
}

// Handle window resize
window.addEventListener('resize', () => {
    // Recreate cubes on window resize for better responsiveness
    createCubes();
    animateCubes();
});

// Add mouse move parallax effect to cube scene
cubeScene.addEventListener('mousemove', (e) => {
    const cubes = document.querySelectorAll('.cube');
    
    // Calculate mouse position relative to container center
    const rect = cubeScene.getBoundingClientRect();
    const containerX = rect.left + rect.width / 2;
    const containerY = rect.top + rect.height / 2;
    
    // Calculate offset from center (normalized from -1 to 1)
    const offsetX = (e.clientX - containerX) / (rect.width / 2);
    const offsetY = (e.clientY - containerY) / (rect.height / 2);
    
    // Apply subtle movement to cubes based on mouse position
    cubes.forEach(cube => {
        const moveX = offsetX * 10 * (Math.random() * 0.5 + 0.5);
        const moveY = offsetY * 10 * (Math.random() * 0.5 + 0.5);
        
        // Apply translate3d for hardware acceleration
        cube.style.transform += ` translate3d(${moveX}px, ${moveY}px, 0)`;
    });
});

// Chatbot button animation
chatbotButton.addEventListener('mouseover', () => {
    chatbotButton.style.transform = 'scale(1.1) rotate(10deg)';
});

chatbotButton.addEventListener('mouseout', () => {
    chatbotButton.style.transform = 'scale(1)';
});

chatbotButton.addEventListener('click', () => {
    // Simulate click animation
    chatbotButton.style.transform = 'scale(0.95)';
    setTimeout(() => {
        chatbotButton.style.transform = 'scale(1.1)';
        
        // Add chatbot open logic here
        alert('AI Chatbot is coming soon!');
    }, 150);
});

// Add active class to sidebar menu items on click
const menuItems = document.querySelectorAll('.sidebar-menu li');
menuItems.forEach(item => {
    item.addEventListener('click', () => {
        // Remove active class from all items
        menuItems.forEach(i => i.classList.remove('active'));
        
        // Add active class to clicked item
        item.classList.add('active');
    });
});