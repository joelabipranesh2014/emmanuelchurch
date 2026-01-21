// ============================================
// LANGUAGE MANAGEMENT (if translations.js is loaded)
// ============================================
if (typeof translations !== 'undefined') {
    // Language switching is handled in translations.js
    // This ensures compatibility
}

// ============================================
// SCROLL ANIMATIONS
// ============================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animated');
        }
    });
}, observerOptions);

// Make observer available globally for dynamically inserted elements
window.intersectionObserver = observer;

// Function to observe new elements
window.observeAnimateElements = function(container) {
    const animateElements = container.querySelectorAll('.animate-on-scroll');
    animateElements.forEach(el => observer.observe(el));
};

// Observe all elements with animate-on-scroll class
document.addEventListener('DOMContentLoaded', () => {
    const animateElements = document.querySelectorAll('.animate-on-scroll');
    animateElements.forEach(el => observer.observe(el));
    
    // Re-translate after animations are set up
    if (typeof translatePage === 'function') {
        setTimeout(() => translatePage(), 100);
    }
});

// ============================================
// HEADER SCROLL EFFECT
// ============================================
let lastScroll = 0;
const header = document.getElementById('header');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
});

// ============================================
// MOBILE MENU TOGGLE
// ============================================
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const navList = document.querySelector('.nav-list');

if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', () => {
        navList.classList.toggle('active');
        mobileMenuToggle.classList.toggle('active');
    });
}

// Close mobile menu when clicking on a link
const navLinks = document.querySelectorAll('.nav-link');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navList.classList.remove('active');
        mobileMenuToggle.classList.remove('active');
    });
});

// ============================================
// SMOOTH SCROLLING FOR ANCHOR LINKS
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ============================================
// PARALLAX EFFECT FOR HERO SECTION
// ============================================
const hero = document.querySelector('.hero');
if (hero) {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const heroContent = document.querySelector('.hero-content');
        if (heroContent) {
            heroContent.style.transform = `translateY(${scrolled * 0.5}px)`;
            heroContent.style.opacity = 1 - scrolled / 500;
        }
    });
}

// ============================================
// ANIMATED COUNTERS (if needed)
// ============================================
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(start);
        }
    }, 16);
}

// ============================================
// CARD HOVER EFFECTS ENHANCEMENT
// ============================================
const cards = document.querySelectorAll('.value-card, .belief-card, .foundation-card, .service-card');
cards.forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transition = 'all 0.3s ease';
    });
});

// ============================================
// VIDEO PLACEHOLDER CLICK HANDLER
// ============================================
const videoPlaceholders = document.querySelectorAll('.video-placeholder, .play-overlay');
videoPlaceholders.forEach(placeholder => {
    placeholder.addEventListener('click', function() {
        // In a real implementation, this would open a video modal or play the video
        alert('Video player would open here. In production, integrate with your video hosting service.');
    });
});

// ============================================
// FORM VALIDATION (if forms are added)
// ============================================
function validateForm(form) {
    const inputs = form.querySelectorAll('input[required], textarea[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            input.style.borderColor = '#ef4444';
        } else {
            input.style.borderColor = '';
        }
    });
    
    return isValid;
}

// ============================================
// LAZY LOADING FOR IMAGES
// ============================================
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                imageObserver.unobserve(img);
            }
        });
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// ============================================
// SCROLL TO TOP BUTTON (optional)
// ============================================
function createScrollToTopButton() {
    const button = document.createElement('button');
    button.innerHTML = '↑';
    button.className = 'scroll-to-top';
    button.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: var(--gradient-1);
        color: white;
        border: none;
        font-size: 24px;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 999;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    `;
    
    document.body.appendChild(button);
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            button.style.opacity = '1';
            button.style.visibility = 'visible';
        } else {
            button.style.opacity = '0';
            button.style.visibility = 'hidden';
        }
    });
    
    button.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Uncomment to enable scroll to top button
// createScrollToTopButton();

// ============================================
// DYNAMIC YEAR IN FOOTER
// ============================================
const currentYear = new Date().getFullYear();
const yearElements = document.querySelectorAll('.footer-bottom p');
yearElements.forEach(el => {
    if (el.textContent.includes('2024')) {
        el.textContent = el.textContent.replace('2024', currentYear);
    }
});

// ============================================
// STAGGER ANIMATION FOR GRID ITEMS
// ============================================
function staggerAnimation(selector) {
    const elements = document.querySelectorAll(selector);
    elements.forEach((el, index) => {
        el.style.transitionDelay = `${index * 0.1}s`;
    });
}

// Apply stagger to various grid sections
document.addEventListener('DOMContentLoaded', () => {
    staggerAnimation('.value-card');
    staggerAnimation('.belief-card');
    staggerAnimation('.sermon-card');
    staggerAnimation('.ministry-card');
});

// ============================================
// PRAYER REQUEST MODAL
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    const prayerModal = document.getElementById('prayer-modal');
    const prayerForm = document.getElementById('prayer-form');
    const prayerRequestBtns = document.querySelectorAll('.prayer-request-btn');
    const closeBtns = document.querySelectorAll('.prayer-modal-close, .prayer-modal-close-btn');
    
    // WhatsApp number
    const whatsappNumber = '9150185746';
    
    // Open modal when prayer request button is clicked
    prayerRequestBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            if (prayerModal) {
                prayerModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });
    
    // Close modal
    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (prayerModal) {
                prayerModal.classList.remove('active');
                document.body.style.overflow = '';
                if (prayerForm) {
                    prayerForm.reset();
                }
            }
        });
    });
    
    // Close modal when clicking outside
    if (prayerModal) {
        prayerModal.addEventListener('click', (e) => {
            if (e.target === prayerModal) {
                prayerModal.classList.remove('active');
                document.body.style.overflow = '';
                if (prayerForm) {
                    prayerForm.reset();
                }
            }
        });
    }
    
    // Handle form submission
    if (prayerForm) {
        prayerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Get form values
            const formData = new FormData(prayerForm);
            const name = formData.get('name') || '';
            const mobile = formData.get('mobile') || '';
            const location = formData.get('location') || '';
            const request = formData.get('request') || '';
            
            // Validate form
            if (!name || !mobile || !location || !request) {
                alert('Please fill in all fields');
                return;
            }
            
            // Format message for WhatsApp
            const message = `*Prayer Request*\n\n` +
                          `*Name:* ${name}\n` +
                          `*Mobile:* ${mobile}\n` +
                          `*Location:* ${location}\n\n` +
                          `*Prayer Request:*\n${request}`;
            
            // Encode message for URL
            const encodedMessage = encodeURIComponent(message);
            
            // Create WhatsApp URL
            const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
            
            // Open WhatsApp
            window.open(whatsappURL, '_blank');
            
            // Close modal and reset form
            if (prayerModal) {
                prayerModal.classList.remove('active');
                document.body.style.overflow = '';
            }
            prayerForm.reset();
        });
    }
});

// ============================================
// CONSOLE MESSAGE
// ============================================
// Console logs removed for production performance
// Uncomment for development:
// console.log('%c✟ EmmanEzk Church Website ✟', 'font-size: 20px; color: #6B46C1; font-weight: bold;');
// console.log('%cBuilt with love and prayer', 'font-size: 14px; color: #6B7280;');
