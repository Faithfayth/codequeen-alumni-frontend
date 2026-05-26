/**
 * Frontend Control Pipeline Architecture for CodeQueen Corporate Partners Workspace
 * Integrates directly with defined REST Opportunities & Events engine topologies
 */

const API_OPPORTUNITIES_BASE = 'http://localhost:5000/opportunities';
const API_EVENTS_BASE = 'http://localhost:5000/events';

document.addEventListener('DOMContentLoaded', () => {
    // Check validation frameworks
    enforceSecuritySessionLock();

    // Setup interface presentation fields matching mockups
    populatePartnerMetadataProfile();

    // Instantiate layout toggle handlers
    setupLayoutNavigationInterceptors();

    // Active continuous rendering URL preview managers
    bindLiveUrlAssetPreviews();

    // Map transactional submissions to endpoints
    bindPayloadSubmissionPipelines();
});

/**
 * Validates baseline storage objects to prevent unauthorized layout entry loops
 */
function enforceSecuritySessionLock() {
    const activeToken = localStorage.getItem('token');
    if (!activeToken) {
        console.warn("Security clearance token absent. Terminating view redirection loops.");
        window.location.href = 'login.html';
    }
}

/**
 * Loads metadata properties from authorization layers straight into card fields
 */
function populatePartnerMetadataProfile() {
    const serializedUser = localStorage.getItem('user');
    if (!serializedUser) return;

    try {
        const profile = JSON.parse(serializedUser);
        
        // Map data layers directly into wireframe design targets
        document.getElementById('lblCompanyName').textContent = profile.companyName || profile.username || "CodeQueen Corporate Partner";
        document.getElementById('lblDescription').textContent = profile.description || "Verified Corporate Ecosystem Network Contributor.";
        document.getElementById('lblContact').textContent = profile.contact || profile.phone || "N/A";
        document.getElementById('lblWebsite').textContent = profile.website || "https://codequeen.org";
        document.getElementById('lblEmail').textContent = profile.email || "partner@codequeen.org";
        document.getElementById('lblLocation').textContent = profile.location || "Kampala, Uganda";

    } catch (err) {
        console.error("Failure processing user JSON cache context parameters:", err);
    }
}

/**
 * Instantiates sidebar reactive behaviors and custom interface modifications
 */
function setupLayoutNavigationInterceptors() {
    document.getElementById('sidebarToggle')?.addEventListener('click', () => {
        document.getElementById('sidebarMenu').classList.toggle('show');
    });

    document.getElementById('btnSidebarSignout')?.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.clear();
        window.location.href = 'login.html';
    });

    document.getElementById('btnResetEventForm')?.addEventListener('click', () => {
        if (confirm("Are you certain you want to clear all inputs inside the Event creation frame?")) {
            document.getElementById('formCreateEvent').reset();
            document.getElementById('eventPreviewImg').classList.add('d-none');
            document.getElementById('eventFallbackIcon').classList.remove('d-none');
        }
    });
}

/**
 * Creates reactive image preview components linking live URL inputs to user feedback frames
 */
function bindLiveUrlAssetPreviews() {
    const oppUrlInput = document.getElementById('inputOppImageUrl');
    oppUrlInput?.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        const preview = document.getElementById('oppPreviewImg');
        const icon = document.getElementById('oppPlaceholderIcon');
        if (val) {
            preview.src = val;
            preview.classList.remove('d-none');
            icon.classList.add('d-none');
        } else {
            preview.classList.add('d-none');
            icon.classList.remove('d-none');
        }
    });

    const eventUrlInput = document.getElementById('inputEventImageUrl');
    eventUrlInput?.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        const preview = document.getElementById('eventPreviewImg');
        const icon = document.getElementById('eventFallbackIcon');
        if (val) {
            preview.src = val;
            preview.classList.remove('d-none');
            icon.classList.add('d-none');
        } else {
            preview.classList.add('d-none');
            icon.classList.remove('d-none');
        }
    });
}

function getAuthorizationSecurityHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token ? token.trim() : ''}`
    };
}

/**
 * Configures system submission hooks to direct processing sequences away from standard browser behavior
 */
function bindPayloadSubmissionPipelines() {
    document.getElementById('formCreateOpportunity')?.addEventListener('submit', executingOpportunityTransmission);
    document.getElementById('formCreateEvent')?.addEventListener('submit', executingEventTransmission);
}

/**
 * Captures, normalizes, and sends Opportunity model components to backend route destinations
 */
async function executingOpportunityTransmission(e) {
    e.preventDefault();

    const title = document.getElementById('inputOppTitle').value.trim();
    const description = document.getElementById('inputOppDescription').value.trim();
    const imageUrl = document.getElementById('inputOppImageUrl').value.trim();
    const url = document.getElementById('inputOppUrl').value.trim();
    const category = document.getElementById('inputOppCategory').value;
    const deadline = document.getElementById('inputOppDeadline').value;

    const bodyPayload = { title, description, imageUrl, url, category, deadline };

    try {
        const response = await fetch(`${API_OPPORTUNITIES_BASE}/createopportunity`, {
            method: 'POST',
            headers: getAuthorizationSecurityHeaders(),
            body: JSON.stringify(bodyPayload)
        });

        const data = await response.json();

        if (response.status === 201 || response.ok) {
            renderStatusBannerNotification(data.message || "Opportunity logged and awaiting verification.", "success");
            document.getElementById('formCreateOpportunity').reset();
            document.getElementById('oppPreviewImg').classList.add('d-none');
            document.getElementById('oppPlaceholderIcon').classList.remove('d-none');
        } else {
            renderStatusBannerNotification(`Submission rejection: ${data.message || 'Validation failed'}`, "danger");
        }
    } catch (err) {
        console.error(err);
        renderStatusBannerNotification("Network layer timeout encountered communicating with Opportunity endpoints.", "danger");
    }
}

/**
 * Normalizes user data inputs and directs payload parameters to the Event schema structure
 */
async function executingEventTransmission(e) {
    e.preventDefault();

    const title = document.getElementById('inputEventTitle').value.trim();
    const description = document.getElementById('inputEventDescription').value.trim();
    const category = document.getElementById('inputEventCategory').value.trim();
    const startdate = document.getElementById('inputEventStartDate').value;
    const enddate = document.getElementById('inputEventEndDate').value;
    const location = document.getElementById('inputEventLocation').value.trim();
    const imageurl = document.getElementById('inputEventImageUrl').value.trim();
    const url = document.getElementById('inputEventUrl').value.trim();

    // Operational Constraint Rule Validation: End Dates cannot occur sequentially before Start Dates
    if (new Date(enddate) < new Date(startdate)) {
        alert("Ecosystem Logic Error: Your selected End date cannot happen prior to the defined Start date parameters.");
        return;
    }

    const bodyPayload = { title, description, category, startdate, enddate, location, imageurl, url };

    try {
        const response = await fetch(`${API_EVENTS_BASE}/createevent`, {
            method: 'POST',
            headers: getAuthorizationSecurityHeaders(),
            body: JSON.stringify(bodyPayload)
        });

        const data = await response.json();

        if (response.status === 201 || response.ok) {
            renderStatusBannerNotification(data.message || "Event proposed successfully! Review pending.", "success");
            document.getElementById('formCreateEvent').reset();
            document.getElementById('eventPreviewImg').classList.add('d-none');
            document.getElementById('eventFallbackIcon').classList.remove('d-none');
        } else {
            renderStatusBannerNotification(`Ecosystem rejection: ${data.message || 'Validation failed'}`, "danger");
        }
    } catch (err) {
        console.error(err);
        renderStatusBannerNotification("Network exception mapping aborted during Event creation pipelines.", "danger");
    }
}

/**
 * Generates reusable banner indicators matching the application's style guide
 */
function renderStatusBannerNotification(text, bootstrapThemeKeyword) {
    const targetAnchor = document.getElementById('alertNotificationAnchor');
    if (!targetAnchor) return;

    targetAnchor.innerHTML = `
        <div class="alert alert-${bootstrapThemeKeyword} alert-dismissible fade show shadow-sm fw-bold small" role="alert">
            <i class="fa-solid ${bootstrapThemeKeyword === 'success' ? 'fa-circle-check' : 'fa-triangle-exclamation'} me-2"></i>
            ${text}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>`;

    // Clear alert block structures after visibility window passes
    setTimeout(() => {
        const alertDomElement = targetAnchor.querySelector('.alert');
        if (alertDomElement && typeof bootstrap !== 'undefined') {
            const runningInstance = bootstrap.Alert.getInstance(alertDomElement);
            runningInstance?.close();
        }
    }, 5000);
}