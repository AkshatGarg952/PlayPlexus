const navbar = document.querySelector('.navbar');
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const modalOverlay = document.getElementById('authModal');
const authSelectModal = document.getElementById('authSelectModal');
const registerPlayerModal = document.getElementById('registerPlayerModal');
const registerTeamModal = document.getElementById('registerTeamModal');
const loginPlayerModal = document.getElementById('loginPlayerModal');
const loginTeamModal = document.getElementById('loginTeamModal');
const modalCloseButtons = document.querySelectorAll('.modal-close');
const registerButtons = document.querySelectorAll('.register-btn');
const loginButtons = document.querySelectorAll('.login-btn');
const authOptions = document.querySelectorAll('.auth-option');
const switchToLoginLinks = document.querySelectorAll('.switch-to-login');
const switchToRegisterLinks = document.querySelectorAll('.switch-to-register');
const sliderDots = document.querySelectorAll('.slider-dot');
const reviewsSlider = document.querySelector('.reviews-slider');

// Mobile Nav Toggle
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
});

// Close mobile nav when clicking a link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
    });
});

// Navbar Scroll Effect
window.addEventListener('scroll', () => {
    if (window.scrollY > 10) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Auth Modal Functions
function openAuthSelect(type) {
    modalOverlay.classList.add('active');
    authSelectModal.classList.add('active');
    // Hide other modals
    registerPlayerModal.classList.remove('active');
    registerTeamModal.classList.remove('active');
    loginPlayerModal.classList.remove('active');
    loginTeamModal.classList.remove('active');
    // Store the desired action (login or register)
    authSelectModal.dataset.action = type;
}

function closeAllModals() {
    modalOverlay.classList.remove('active');
    authSelectModal.classList.remove('active');
    registerPlayerModal.classList.remove('active');
    registerTeamModal.classList.remove('active');
    loginPlayerModal.classList.remove('active');
    loginTeamModal.classList.remove('active');
}

// Register Button Click
registerButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        openAuthSelect('register');
    });
});

// Login Button Click
loginButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        openAuthSelect('login');
    });
});

// Modal Close Button Click
modalCloseButtons.forEach(btn => {
    btn.addEventListener('click', closeAllModals);
});

// Auth Option Selection
authOptions.forEach(option => {
    option.addEventListener('click', () => {
        const type = option.dataset.type;
        const action = authSelectModal.dataset.action;
        
        authSelectModal.classList.remove('active');
        
        if (action === 'register') {
            if (type === 'player') {
                registerPlayerModal.classList.add('active');
            } else {
                registerTeamModal.classList.add('active');
            }
        } else {
            if (type === 'player') {
                loginPlayerModal.classList.add('active');
            } else {
                loginTeamModal.classList.add('active');
            }
        }
    });
});

// Switch between Login and Register
switchToLoginLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        
        registerPlayerModal.classList.remove('active');
        registerTeamModal.classList.remove('active');
        
        if (link.closest('#registerPlayerModal')) {
            loginPlayerModal.classList.add('active');
        } else {
            loginTeamModal.classList.add('active');
        }
    });
});

switchToRegisterLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        
        loginPlayerModal.classList.remove('active');
        loginTeamModal.classList.remove('active');
        
        if (link.closest('#loginPlayerModal')) {
            registerPlayerModal.classList.add('active');
        } else {
            registerTeamModal.classList.add('active');
        }
    });
});

// Click outside modals to close
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
        closeAllModals();
    }
});

// Reviews Slider
sliderDots.forEach(dot => {
    dot.addEventListener('click', () => {
        const slideIndex = dot.dataset.slide;
        
        sliderDots.forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
        
        reviewsSlider.style.transform = `translateX(-${slideIndex * 33.333}%)`;
    });
});

// Auto slide reviews
let currentSlide = 0;
const totalSlides = sliderDots.length;

function autoSlide() {
    currentSlide = (currentSlide + 1) % totalSlides;
    
    sliderDots.forEach(d => d.classList.remove('active'));
    sliderDots[currentSlide].classList.add('active');
    
    reviewsSlider.style.transform = `translateX(-${currentSlide * 33.333}%)`;
}

// Start auto slider
const sliderInterval = setInterval(autoSlide, 5000);

// Particle Animation
function createParticles() {
    const particlesContainer = document.querySelector('.particles');
    if (!particlesContainer) return;
    
    const icons = ['gamepad', 'futbol', 'basketball-ball', 'volleyball-ball', 'chess', 'trophy', 'medal'];
    
    for (let i = 0; i < 15; i++) {
        const icon = document.createElement('i');
        const randomIcon = icons[Math.floor(Math.random() * icons.length)];
        
        icon.className = `fas fa-${randomIcon} floating-icon`;
        icon.style.fontSize = `${Math.random() * 20 + 10}px`;
        icon.style.left = `${Math.random() * 100}%`;
        icon.style.top = `${Math.random() * 100}%`;
        icon.style.animationDuration = `${Math.random() * 10 + 5}s`;
        icon.style.animationDelay = `${Math.random() * 5}s`;
        
        particlesContainer.appendChild(icon);
    }
}

// GSAP Animations - FIXED
function initGSAP() {
    // Pre-set all elements to be animated to their initial state
    gsap.set('.feature-card', { y: 50, opacity: 0 });
    gsap.set('.step', { y: 50, opacity: 0 });
    gsap.set('.review-card', { y: 50, opacity: 0 });
    
    // Feature Card Animations
    gsap.utils.toArray('.feature-card').forEach((card, i) => {
        ScrollTrigger.create({
            trigger: card,
            start: 'top 80%',
            onEnter: () => {
                gsap.to(card, {
                    y: 0,
                    opacity: 1,
                    duration: 0.8,
                    delay: i * 0.1,
                    ease: 'power2.out'
                });
            },
            once: true
        });
    });

    // Steps Animation
    gsap.utils.toArray('.step').forEach((step, i) => {
        ScrollTrigger.create({
            trigger: step,
            start: 'top 80%',
            onEnter: () => {
                gsap.to(step, {
                    y: 0,
                    opacity: 1,
                    duration: 0.8,
                    delay: i * 0.2,
                    ease: 'back.out(1.5)'
                });
            },
            once: true
        });
    });

    // Review Cards Animation
    gsap.utils.toArray('.review-card').forEach((card, i) => {
        ScrollTrigger.create({
            trigger: card,
            start: 'top 80%',
            onEnter: () => {
                gsap.to(card, {
                    y: 0,
                    opacity: 1,
                    duration: 0.8,
                    delay: i * 0.15,
                    ease: 'power2.out'
                });
            },
            once: true
        });
    });
}

// Fixed Image Preview for Profile Image
const playerProfileImageInput = document.getElementById('profileImage');
const playerProfileImagePreview = document.getElementById('playerProfileImagePreview');

if (playerProfileImageInput) {
    playerProfileImageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                // Create a new image element with proper styling
                playerProfileImagePreview.innerHTML = '';
                const img = document.createElement('img');
                img.src = event.target.result;
                img.alt = 'Profile Preview';
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'cover';
                img.style.borderRadius = '50%'; // Ensure circular shape
                playerProfileImagePreview.appendChild(img);
                
                // Remove the default icon class if exists
                playerProfileImagePreview.querySelector('i')?.remove();
            };
            reader.readAsDataURL(file);
        } else {
            // Revert to default icon if no file is selected
            playerProfileImagePreview.innerHTML = '<i class="fas fa-user-circle"></i>';
        }
    });
}

// Fixed Image Preview for Team Logo
const teamLogoInput = document.getElementById('teamLogo');
const teamLogoPreview = document.getElementById('teamLogoPreview');

if (teamLogoInput) {
    teamLogoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                // Create a new image element with proper styling
                teamLogoPreview.innerHTML = '';
                const img = document.createElement('img');
                img.src = event.target.result;
                img.alt = 'Logo Preview';
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'cover';
                img.style.borderRadius = '50%'; // Ensure circular shape
                teamLogoPreview.appendChild(img);
                
                // Remove the default icon class if exists
                teamLogoPreview.querySelector('i')?.remove();
            };
            reader.readAsDataURL(file);
        } else {
            // Revert to default icon if no file is selected
            teamLogoPreview.innerHTML = '<i class="fas fa-users"></i>';
        }
    });
}

// Helper function to serialize form data
function serializeForm(form) {
    const formData = new FormData(form);
    const obj = {};
    for (let [key, value] of formData) {
        obj[key] = value;
    }
    return JSON.stringify(obj);
}

// Initialize functions on page load
document.addEventListener('DOMContentLoaded', () => {
    createParticles();
    
    // Initialize GSAP with ScrollTrigger properly
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        initGSAP();
    } else {
        console.error('GSAP or ScrollTrigger is not loaded properly');
        
        // As a fallback, make elements visible without animations
        document.querySelectorAll('.feature-card, .step, .review-card').forEach(el => {
            el.style.opacity = 1;
            el.style.transform = 'translateY(0)';
        });
    }
});