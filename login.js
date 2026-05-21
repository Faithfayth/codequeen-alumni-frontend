/**
 * Login JavaScript Controller Hook for the Codequeen Platform Ecosystem
 * Synchronizes sessions, parses system permissions, and hydrates local application caches.
 */

const ENDPOINT_API_BASE = 'http://localhost:5000';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('login-form-element');
    if (form) {
        form.addEventListener('submit', handleSystemLoginTransaction);
    }
});

/**
 * Main application authentication intercept process loop.
 */
async function handleSystemLoginTransaction(event) {
    event.preventDefault();

    const emailInput = document.getElementById('input-user-email');
    const passwordInput = document.getElementById('input-user-password');
    const confirmPasswordInput = document.getElementById('input-user-confirm-password');
    const errorBanner = document.getElementById('error-banner-view');
    const submitBtn = document.getElementById('submit-btn-spinner-target');

    // Hide previous error flags safely
    errorBanner.style.display = 'none';
    errorBanner.innerText = '';

    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    // 1. Frontend validation check for missing values
    if (!email || !password || !confirmPassword) {
        revealFormError("Please complete all required security credentials.");
        return;
    }

    // 2. Client-side security verification match gate
    if (password !== confirmPassword) {
        revealFormError("Passwords do not match. Please verify your typing entry.");
        return;
    }

    // Visual button loading state adjustment
    submitBtn.disabled = true;
    submitBtn.innerText = "Verifying...";

    try {
        // 3. Dispatch validation payload directly to the backend login router
        const response = await fetch(`${ENDPOINT_API_BASE}/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                email: email, 
                password: password 
            })
        });

        const data = await response.json();

        if (response.ok && data.token) {
            // Persist the authentication jsonwebtoken context securely
            localStorage.setItem('token', data.token);
            
            // FIX: Point directly to data.result instead of data.user
            const userPayload = data.result; 
            const resolvedRole = userPayload && userPayload.role ? userPayload.role.toLowerCase() : 'alumna';
            
            // Hydrate application state object for profile UI sync
            const accountMetadata = {
                username: userPayload?.username || 'User Profile', // Pulls perfectly from MongoDB now
                cohort: userPayload?.cohort !== undefined ? userPayload.cohort : 'Not Assigned',
                role: resolvedRole,
                email: userPayload?.email || email 
            };
            
            localStorage.setItem('user', JSON.stringify(accountMetadata));

            // 4. CLEAN ROUTING ACCORDING TO ACCESS TIERS
            if (resolvedRole === 'admin') {
                window.location.href = 'admin.html';
            } else if (resolvedRole === 'alumna') {
                window.location.href = 'alumni.html';
            } else if (resolvedRole === 'student') {
                window.location.href = 'student.html';
            } else if (resolvedRole === 'partner') {
                window.location.href = 'partner.html';
            } else {
                window.location.href = 'alumni-profile.html';
            }
        } else {
            revealFormError(data.message || "Invalid authentication credentials. Please try again.");
            resetButtonState(submitBtn);
        }

    } catch (networkError) {
        console.error("Critical gateway failure inside authentication process loop:", networkError);
        revealFormError("Connection timeout. Verify that your MERN backend server is active on port 5000.");
        resetButtonState(submitBtn);
    }
}

/**
 * Utility: Renders errors into the card notification sub-container
 */
function revealFormError(msg) {
    const errorBanner = document.getElementById('error-banner-view');
    if (errorBanner) {
        errorBanner.innerText = msg;
        errorBanner.style.display = 'block';
    }
}

/**
 * Utility: Resets the primary button interface element interaction state
 */
function resetButtonState(btnElement) {
    btnElement.disabled = false;
    btnElement.innerText = "Login";
}