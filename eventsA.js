/**
 * CodeQueen Alumnae Event Pipeline controller module
 */
const CONFIG_API_BASE = 'http://localhost:5000/events';

// Keep track of the current user's role globally for conditional rendering
let CURRENT_USER_ROLE = null;

document.addEventListener('DOMContentLoaded', () => {
    // Safely evaluate logged user identity tokens
    CURRENT_USER_ROLE = parseJwtIdentityRole(localStorage.getItem('token'));
    
    initLayoutNavigationSwitches();
    
    if (CURRENT_USER_ROLE === 'admin') {
        const counterBox = document.getElementById('unverifiedCounterBox');
        if (counterBox) counterBox.classList.remove('d-none');
        document.getElementById('adminReviewWrapperSection').classList.remove('d-none');
        fetchUnverifiedAdminQueue();
    }

    // Default to displaying upcoming events tab on load
    switchEventViewTab('upcoming');

    // Attach Event Creation Handler Sequence Form Hook
    const creationForm = document.getElementById('proposeEventForm');
    if (creationForm) {
        creationForm.addEventListener('submit', dispatchEventProposalPayload);
    }
});

/**
 * Handle Mobile Navigation Sidebar Canvas Toggles
 */
function initLayoutNavigationSwitches() {
    const openBtn = document.getElementById('sidebar-open-toggle-trigger');
    const closeBtn = document.getElementById('sidebar-close-toggle-trigger');
    const sidebar = document.getElementById('app-navigation-sidebar-container');

    if (openBtn && sidebar) openBtn.addEventListener('click', () => sidebar.classList.add('show-sidebar'));
    if (closeBtn && sidebar) closeBtn.addEventListener('click', () => sidebar.classList.remove('show-sidebar'));
}

/**
 * Central Tab Switch router logic layout handling
 */
function switchEventViewTab(targetTab) {
    // Clear active highlight styles
    document.getElementById('tab-upcoming-toggle').classList.remove('active');
    document.getElementById('tab-past-toggle').classList.remove('active');
    document.getElementById('tab-create-toggle').classList.remove('active');

    // Hide creation panel block by default unless selected
    const formSection = document.getElementById('creationFormSection');
    formSection.classList.add('d-none');
    document.getElementById('eventsRenderDisplayDeck').classList.remove('d-none');

    if (targetTab === 'upcoming') {
        document.getElementById('tab-upcoming-toggle').classList.add('active');
        fetchApprovedLiveEvents();
    } else if (targetTab === 'past') {
        document.getElementById('tab-past-toggle').classList.add('active');
        fetchPastVerifiedEvents();
    } else if (targetTab === 'create') {
        document.getElementById('tab-create-toggle').classList.add('active');
        document.getElementById('eventsRenderDisplayDeck').classList.add('d-none');
        formSection.classList.remove('d-none');
        // Smooth scroll view context down into active layout frame focus
        formSection.scrollIntoView({ behavior: 'smooth' });
    }
}

/**
 * Fetch Upcoming Verified Events
 */
async function fetchApprovedLiveEvents() {
    toggleSpinner(true);
    const deck = document.getElementById('eventsRenderDisplayDeck');
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${CONFIG_API_BASE}/getcurrentevents`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });

        if (!response.ok) throw new Error();
        const events = await response.json();
        
        renderEventsGridDeck(events, deck, false);
    } catch (err) {
        renderErrorMessage(deck, "Failed to pull live events framework registry.");
    } finally {
        toggleSpinner(false);
    }
}

/**
 * Fetch Past Verified Events
 */
async function fetchPastVerifiedEvents() {
    toggleSpinner(true);
    const deck = document.getElementById('eventsRenderDisplayDeck');
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${CONFIG_API_BASE}/getpastevents`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const events = await response.json();
        renderEventsGridDeck(events, deck, true);
    } catch (err) {
        renderErrorMessage(deck, "Failed to pull historical event archives.");
    } finally {
        toggleSpinner(false);
    }
}

/**
 * Fetch Admin Exclusive Unverified Pipeline Submissions
 */
async function fetchUnverifiedAdminQueue() {
    const targetDeck = document.getElementById('unverifiedEventsDeck');
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${CONFIG_API_BASE}/getunverifiedevents`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        document.getElementById('unverifiedCountText').innerText = data.count || 0;
        renderEventsGridDeck(data.result, targetDeck, false, true);
    } catch (err) {
         console.error("Admin queue stream disconnected: ", err);
    }
}

/**
 * Dispatches creation post payload with date boundary validation rules
 */
async function dispatchEventProposalPayload(e) {
    e.preventDefault();
    
    const start = new Date(document.getElementById('eventStartDate').value);
    const end = new Date(document.getElementById('eventEndDate').value);
    const now = new Date();

    if (end <= start) {
        alert("Operation Error: Event end date context must occur after start timestamp rules!");
        return;
    }
    if (end < now) {
        alert("Operation Error: Cannot schedule event lifecycles in past boundaries.");
        return;
    }

    const payload = {
        title: document.getElementById('eventTitle').value,
        description: document.getElementById('eventDescription').value,
        category: document.getElementById('eventCategory').value,
        startdate: start.toISOString(),
        enddate: end.toISOString(),
        location: document.getElementById('eventLocation').value,
        imageurl: document.getElementById('eventImageUrl').value || ""
    };

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${CONFIG_API_BASE}/createevent`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const outcome = await response.json();
        if (response.ok) {
            alert(outcome.message);
            document.getElementById('proposeEventForm').reset();
            switchEventViewTab('upcoming');
        } else {
            alert(outcome.message || "Failed to finalize insertion layout.");
        }
    } catch (err) {
        console.error("Fatal event injection error: ", err);
    }
}

/**
 * Render standard layout nodes across screens matching design structure rules
 */
function renderEventsGridDeck(events, targetContainer, isHistoryMode = false, isAdminMode = false) {
    if (!targetContainer) return;
    if (!events || events.length === 0) {
        targetContainer.innerHTML = `<p class="text-muted text-center py-4">No active records context found inside this stream module index.</p>`;
        return;
    }

    targetContainer.innerHTML = events.map(event => {
        const banner = event.imageurl || 'https://via.placeholder.com/150';
        const attendeesCount = event.attendees ? event.attendees.length : 0;
        
        let actionButtonsMarkup = '';
        
        if (isAdminMode) {
            // Context: Administrative Verification Queue Section
            actionButtonsMarkup = `
                <button class="btn btn-action-amber btn-sm px-3" onclick="executeVerificationRoutine('${event._id}')"><i class="bi bi-shield-check me-1"></i> Verify & Publish</button>
                <button class="btn btn-action-rose btn-sm px-3" onclick="executeDeleteRoutine('${event._id}', true)"><i class="bi bi-trash3 me-1"></i> Reject & Delete</button>
            `;
        } else if (isHistoryMode) {
            // Context: Concluded Events Stream
            actionButtonsMarkup = `<span class="badge bg-secondary px-3 py-2 rounded-pill"><i class="bi bi-clock-history me-1"></i> Event Concluded</span>`;
        } else {
            // Context: Live Upcoming Events Stream
            actionButtonsMarkup = `
                <button class="btn btn-action-amber btn-sm px-3" onclick="executeEventRegistration('${event._id}')"><i class="bi bi-person-check me-1"></i> Register Attendee</button>
            `;
            
            // Check if current user has an admin token to append a delete option to upcoming events
            if (CURRENT_USER_ROLE === 'admin') {
                actionButtonsMarkup += `
                    <button class="btn btn-action-rose btn-sm px-3 ms-2" onclick="executeDeleteRoutine('${event._id}', false)"><i class="bi bi-trash3 me-1"></i> Delete Event</button>
                `;
            }
        }

        return `
            <div class="event-section-card transition-card mb-3">
                <div class="row g-3 align-items-center">
                    <div class="col-12 col-md-4 col-lg-3 text-center">
                        <div class="p-1 border rounded bg-light">
                            <img src="${banner}" alt="Event Visual" style="max-height:130px; object-fit:contain; max-width:100%;">
                        </div>
                    </div>
                    <div class="col-12 col-md-8 col-lg-9">
                        <div class="d-flex flex-column gap-2">
                            <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
                                <h5 class="fw-bold text-dark m-0">${event.title}</h5>
                                <span class="badge bg-light text-warning border border-warning px-3 py-1 rounded-pill">${event.category}</span>
                            </div>
                            <p class="text-muted m-0 small">${event.description}</p>
                            <div class="row g-2 text-secondary small">
                                <div class="col-12 col-md-6"><strong><i class="bi bi-calendar-range me-1"></i> Timeline:</strong> ${new Date(event.startdate).toLocaleString()}</div>
                                <div class="col-12 col-md-6"><strong><i class="bi bi-geo-alt me-1"></i> Location:</strong> ${event.location}</div>
                                <div class="col-12"><strong><i class="bi bi-people me-1"></i> Headcount:</strong> ${attendeesCount} Registered Alumnae</div>
                            </div>
                            <div class="d-flex justify-content-end gap-2 mt-2 border-top pt-2">
                                ${actionButtonsMarkup}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Execute Event registration context routing
 */
async function executeEventRegistration(id) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${CONFIG_API_BASE}/registerforevent/${id}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const resData = await response.json();
        alert(resData.message);
        fetchApprovedLiveEvents();
    } catch(err) {
        console.error(err);
    }
}

/**
 * Admin: Verify & Publish Event
 */
async function executeVerificationRoutine(id) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${CONFIG_API_BASE}/verifyevent/${id}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            alert("Event verified, registered, and published!");
            fetchUnverifiedAdminQueue();
            fetchApprovedLiveEvents();
        }
    } catch (err) {
        console.error(err);
    }
}

/**
 * Admin: Reject / Delete Event 
 * @param {string} id - The database object identification sequence
 * @param {boolean} isFromQueue - Context flag to determine which display grids need refreshing
 */
async function executeDeleteRoutine(id, isFromQueue = false) {
    if (!confirm("Are you sure you want to permanently strip this event execution record?")) return;
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${CONFIG_API_BASE}/deleteevent/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            alert("Event permanently wiped.");
            
            // Re-sync correct UI contexts
            if (isFromQueue) {
                fetchUnverifiedAdminQueue();
            } else {
                fetchApprovedLiveEvents();
            }
        } else {
            const errorData = await response.json();
            alert(errorData.message || "Failed to complete deletion process context.");
        }
    } catch (err) {
        console.error(err);
    }
}

/**
 * Helper Utilities
 */
function toggleSpinner(show) {
    const spinner = document.getElementById('loadingStatusSpinner');
    if (spinner) {
        if (show) spinner.classList.remove('d-none');
        else spinner.classList.add('d-none');
    }
}

function renderErrorMessage(container, msg) {
    if (container) {
        container.innerHTML = `<div class="alert alert-danger text-center"><i class="bi bi-exclamation-triangle me-2"></i>${msg}</div>`;
    }
}

function parseJwtIdentityRole(token) {
    if (!token) return null;
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        return payload.role || 'alumna'; 
    } catch (e) {
        return null;
    }
}

function logoutSession() {
    localStorage.removeItem('token');
    window.location.href = "login.html";
}