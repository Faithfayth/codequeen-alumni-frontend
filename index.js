/**
 * Interactive Automation Engine for CodeQueen Community Ecosystem Landing Page
 */

document.addEventListener('DOMContentLoaded', () => {
    initializeNavbarScrollEffect();
    bindInteractiveLandingActions();
});

/**
 * Applies a crisp aesthetic shading tweak as users navigate down through images layers
 */
function initializeNavbarScrollEffect() {
    const navbarNode = document.querySelector('.cq-navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            navbarNode.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.4)';
            navbarNode.style.borderBottomColor = 'rgba(227, 146, 36, 0.3)';
        } else {
            navbarNode.style.boxShadow = 'none';
            navbarNode.style.borderBottomColor = 'rgba(197, 108, 100, 0.2)';
        }
    });
}

/**
 * Handles clicks and actions on the navbar conversion elements
 */
function bindInteractiveLandingActions() {
    // Dynamic tracking hooks can be seamlessly mounted here for analytic platforms
    const partnerActionButtons = document.querySelectorAll('.btn-cq-burgundy-outline');
    
    partnerActionButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Keep default flow safe if mapped to static references later
            if (btn.getAttribute('href') === '#') {
                e.preventDefault();
                alert("Thank you for your interest! The Corporate Partnership Onboarding Channel is launching shortly.");
            }
        });
    });
}