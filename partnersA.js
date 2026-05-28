/**
 * Synchronized Frontend Client for CodeQueen Partners Architecture
 * Targets the /partners base route pattern using verified field parameters
 */
const API_BASE_URL = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://cq-a-bckd.onrender.com'; // Production live Render URL
const COMPONENT_API_BASE = `${API_BASE_URL}/partners`;

let activeApprovedRegistry = [];
let activePendingRegistry = [];

document.addEventListener('DOMContentLoaded', async () => {
    // Responsive Navbar Drawer Toggle Bindings
    document.getElementById('sidebarToggle')?.addEventListener('click', () => {
        document.getElementById('sidebarMenu').classList.toggle('show');
    });

    initLiveLogoPreviewEngine();
    setupInterfaceNavigationHooks();

    // Ingest and dispatch baseline network load tasks
    await syncPartnersDataCollections();
});

function initLiveLogoPreviewEngine() {
    const urlInput = document.getElementById('inputCompanyLogo');
    const backupIcon = document.getElementById('previewLogoIcon');
    const imageDisplay = document.getElementById('previewLogoImage');

    urlInput.addEventListener('input', (e) => {
        const structuralValue = e.target.value.trim();
        if (structuralValue) {
            imageDisplay.src = structuralValue;
            imageDisplay.classList.remove('d-none');
            backupIcon.classList.add('d-none');
        } else {
            imageDisplay.classList.add('d-none');
            backupIcon.classList.remove('d-none');
        }
    });
}

function setupInterfaceNavigationHooks() {
    document.getElementById('formPartnerAction').addEventListener('submit', executeFormPayloadDispatch);

    document.getElementById('btnScrollToForm').addEventListener('click', () => {
        resetWorkspaceFormToCreateMode();
        document.getElementById('formSectionAnchor').scrollIntoView({ behavior: 'smooth' });
    });

    document.getElementById('btnJumpToPending').addEventListener('click', () => {
        document.getElementById('pendingSectionAnchor').scrollIntoView({ behavior: 'smooth' });
    });

    document.getElementById('btnCancelUpdateMode').addEventListener('click', resetWorkspaceFormToCreateMode);
}

function getRequestSecurityHeaders() {
    const activeSessionToken = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${activeSessionToken}`
    };
}

/**
 * Loads approved profiles and pending listings in parallel using separate admin/public routes
 */
async function syncPartnersDataCollections() {
    toggleContentLoaders(true);
    try {
        // 1. Fetch Approved Partners Registry (Public Access Layer)
        const approvedResponse = await fetch(`${COMPONENT_API_BASE}/getapprovedpartners`, {
            method: 'GET',
            headers: getRequestSecurityHeaders()
        });
        if (approvedResponse.ok) {
            activeApprovedRegistry = await approvedResponse.json();
        }

        // 2. Fetch Pending Partners Queue (Admin Route Layer)
        const pendingResponse = await fetch(`${COMPONENT_API_BASE}/getpendingpartners`, {
            method: 'GET',
            headers: getRequestSecurityHeaders()
        });
        if (pendingResponse.ok) {
            const rawBody = await pendingResponse.json();
            activePendingRegistry = rawBody.result || [];
        }

        renderInterfaceComponents();
    } catch (networkCommunicationError) {
        console.error("Data tracking failure:", networkCommunicationError);
        dispatchUINotificationBanner("Network error syncing partners ecosystem databases.", "danger");
    } finally {
        toggleContentLoaders(false);
    }
}

/**
 * Builds and injects data fragments exactly matching your Mongoose naming design layout
 */
function renderInterfaceComponents() {
    const approvedNode = document.getElementById('approvedPartnersContainer');
    const pendingNode = document.getElementById('pendingPartnersContainer');

    approvedNode.innerHTML = '';
    pendingNode.innerHTML = '';

    // Handle empty views layouts status flags
    document.getElementById('noApprovedPlaceholder').classList.toggle('d-none', activeApprovedRegistry.length > 0);
    document.getElementById('noPendingPlaceholder').classList.toggle('d-none', activePendingRegistry.length > 0);

    // Update operational badge visibility counters
    const badge = document.getElementById('badgePendingCount');
    if (activePendingRegistry.length > 0) {
        badge.innerText = activePendingRegistry.length;
        badge.classList.remove('d-none');
    } else {
        badge.classList.add('d-none');
    }

    // Process Approved Profile Displays
    activeApprovedRegistry.forEach(partner => {
        const cardBox = document.createElement('div');
        cardBox.className = "partner-display-box";
        cardBox.innerHTML = `
            <div class="row g-3 align-items-center">
                <div class="col-12 col-md-3 text-center bg-light p-3 rounded border">
                    <img src="${partner.logoUrl || 'https://via.placeholder.com/120?text=No+Logo'}" 
                         class="img-fluid rounded" style="max-height: 110px; object-fit: contain;"
                         onerror="this.src='https://via.placeholder.com/120?text=No+Logo'">
                </div>
                
                <div class="col-12 col-md-9">
                    <div class="d-flex justify-content-between align-items-start border-bottom pb-2 mb-2 flex-wrap gap-2">
                        <div>
                            <h5 class="fw-bold m-0 text-dark">${partner.companyname}</h5>
                            <small class="text-muted" style="font-size: 11px;"><i class="fa-solid fa-map-pin"></i> ${partner.location}</small>
                        </div>
                        
                        <div class="d-flex align-items-center gap-2">
                            <button class="btn btn-sm btn-outline-burgundy py-1 px-2" onclick="hydrateFormForModification('${partner._id}')" style="font-size: 12px;">
                                <i class="fa-solid fa-pen-to-square"></i> Edit
                            </button>
                            <button class="btn btn-sm btn-outline-danger py-1 px-2" onclick="dispatchDeleteRequest('${partner._id}')" style="font-size: 12px;">
                                <i class="fa-solid fa-trash-can"></i> Delete
                            </button>
                            <span class="badge bg-success-subtle text-success border border-success-subtle px-2 py-1.5 small rounded-pill">
                                <i class="fa-solid fa-circle-check"></i> Active
                            </span>
                        </div>
                    </div>
                    
                    <p class="small text-secondary mb-3">${partner.description}</p>
                    
                    <div class="row g-2 text-muted small">
                        <div class="col-12 col-sm-6"><i class="fa-solid fa-phone me-1"></i> <strong>Contact:</strong> ${partner.contact}</div>
                        <div class="col-12 col-sm-6"><i class="fa-solid fa-envelope me-1"></i> <strong>Email:</strong> ${partner.email}</div>
                        <div class="col-12 col-sm-6"><i class="fa-solid fa-globe me-1"></i> <strong>Website:</strong> <a href="${partner.website}" target="_blank" class="text-orange text-decoration-none">${partner.website || 'N/A'}</a></div>
                    </div>
                </div>
            </div>`;
        approvedNode.appendChild(cardBox);
    });

    // Process Pending Review Queues
    activePendingRegistry.forEach(partner => {
        const inlineRow = document.createElement('div');
        inlineRow.className = "pending-item-card d-flex justify-content-between align-items-center flex-wrap gap-2";
        inlineRow.innerHTML = `
            <div class="d-flex align-items-center gap-3">
                <div class="bg-warning-subtle text-warning border rounded-circle p-2 d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
                    <i class="fa-solid fa-building-columns"></i>
                </div>
                <div>
                    <h6 class="fw-bold m-0 text-dark">${partner.companyname}</h6>
                    <small class="text-muted d-block text-truncate" style="max-width: 260px;">${partner.description}</small>
                    <small class="text-secondary" style="font-size: 11px;"><i class="fa-solid fa-map-pin"></i> ${partner.location} | <i class="fa-solid fa-envelope"></i> ${partner.email}</small>
                </div>
            </div>
            <div class="d-flex gap-2">
                <button class="btn btn-sm btn-outline-danger px-2 py-1" onclick="dispatchAdminStatusToggle('${partner._id}', 'rejected')" style="font-size: 12px;">
                    <i class="fa-solid fa-xmark"></i> Reject
                </button>
                <button class="btn btn-sm btn-orange px-3 py-1" onclick="dispatchAdminStatusToggle('${partner._id}', 'approved')" style="font-size: 12px;">
                    <i class="fa-solid fa-check"></i> Approve
                </button>
                <button class="btn btn-sm btn-light border px-2 py-1" onclick="hydrateFormForModification('${partner._id}')" style="font-size: 12px;" title="Edit details before approving">
                    <i class="fa-solid fa-pen"></i>
                </button>
            </div>`;
        pendingNode.appendChild(inlineRow);
    });
}

/**
 * Route Mapping Handler matching backend logic inputs properties
 */
async function executeFormPayloadDispatch(e) {
    e.preventDefault();

    const targetRecordID = document.getElementById('fieldPartnerId').value;
    
    const bodyPayload = {
        companyname: document.getElementById('inputCompanyName').value.trim(),
        description: document.getElementById('inputDescription').value.trim(),
        contact: document.getElementById('inputContact').value.trim(),
        email: document.getElementById('inputEmail').value.trim(),
        website: document.getElementById('inputWebsiteUrl').value.trim(),
        location: document.getElementById('inputLocation').value.trim(),
        logoUrl: document.getElementById('inputCompanyLogo').value.trim()
    };

    let targetUrl = `${COMPONENT_API_BASE}/createpartnerrofile`;
    let transportMethod = 'POST';

    if (targetRecordID) {
        targetUrl = `${COMPONENT_API_BASE}/updatepartnerprofile/${targetRecordID}`;
        transportMethod = 'PUT';
    }

    try {
        const response = await fetch(targetUrl, {
            method: transportMethod,
            headers: getRequestSecurityHeaders(),
            body: JSON.stringify(bodyPayload)
        });

        const feedbackBody = await response.json();

        if (response.ok) {
            dispatchUINotificationBanner(feedbackBody.message || "Profile operation completed successfully.", "success");
            resetWorkspaceFormToCreateMode();
            await syncPartnersDataCollections();
        } else {
            alert(`Backend Conflict: ${feedbackBody.message}`);
        }
    } catch (err) {
        console.error(err);
        dispatchUINotificationBanner("Transaction pipeline communication crash.", "danger");
    }
}

/**
 * Hydrates local memory details from selected cache array directly into tracking entry fields
 */
function hydrateFormForModification(id) {
    const compositeCollection = [...activeApprovedRegistry, ...activePendingRegistry];
    const targetMatch = compositeCollection.find(p => p._id === id);
    if (!targetMatch) return;

    document.getElementById('formHeaderTitle').innerText = "Update Corporate Partner Profile";
    document.getElementById('fieldPartnerId').value = targetMatch._id;

    document.getElementById('inputCompanyName').value = targetMatch.companyname || '';
    document.getElementById('inputDescription').value = targetMatch.description || '';
    document.getElementById('inputContact').value = targetMatch.contact || '';
    document.getElementById('inputEmail').value = targetMatch.email || '';
    document.getElementById('inputWebsiteUrl').value = targetMatch.website || '';
    document.getElementById('inputLocation').value = targetMatch.location || '';
    
    const logoField = document.getElementById('inputCompanyLogo');
    logoField.value = targetMatch.logoUrl || '';
    logoField.dispatchEvent(new Event('input')); // Force image display update

    document.getElementById('btnCancelUpdateMode').classList.remove('d-none');
    document.getElementById('btnSubmitForm').innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Save Modifications';
    document.getElementById('formSectionAnchor').scrollIntoView({ behavior: 'smooth' });
}

/**
 * Dispatches Admin decisions to /partners/verifypartnerstatus/:id
 */
async function dispatchAdminStatusToggle(id, decisionValue) {
    try {
        const response = await fetch(`${COMPONENT_API_BASE}/verifypartnerstatus/${id}`, {
            method: 'PUT',
            headers: getRequestSecurityHeaders(),
            body: JSON.stringify({ status: decisionValue })
        });

        const data = await response.json();
        if (response.ok) {
            dispatchUINotificationBanner(data.message, decisionValue === 'approved' ? 'success' : 'warning');
            await syncPartnersDataCollections();
        } else {
            alert(data.message || "Status alteration validation rejected by administrative framework.");
        }
    } catch (ex) {
        console.error(ex);
    }
}

/**
 * Maps straight to DELETE /partners/deletepartnerprofile/:id
 */
async function dispatchDeleteRequest(id) {
    if (!confirm("Are you absolutely certain you want to permanently delete this corporate partner entry?")) return;

    try {
        const response = await fetch(`${COMPONENT_API_BASE}/deletepartnerprofile/${id}`, {
            method: 'DELETE',
            headers: getRequestSecurityHeaders()
        });

        const data = await response.json();
        if (response.ok) {
            dispatchUINotificationBanner(data.message || "Record successfully removed.", "warning");
            await syncPartnersDataCollections();
        } else {
            alert(data.message || "Profile deletion processing intercept fault.");
        }
    } catch (err) {
        console.error(err);
    }
}

function resetWorkspaceFormToCreateMode() {
    document.getElementById('formPartnerAction').reset();
    document.getElementById('fieldPartnerId').value = '';
    document.getElementById('formHeaderTitle').innerText = "Create Partner Profile";
    document.getElementById('btnSubmitForm').innerHTML = '<i class="fa-solid fa-circle-check"></i> Dispatch Application';
    document.getElementById('btnCancelUpdateMode').classList.add('d-none');
    document.getElementById('inputCompanyLogo').dispatchEvent(new Event('input'));
}

function toggleContentLoaders(show) {
    const appLoader = document.getElementById('approvedSpinner');
    const pendLoader = document.getElementById('pendingSpinner');
    if (show) {
        appLoader?.classList.remove('d-none');
        pendLoader?.classList.remove('d-none');
    } else {
        appLoader?.classList.add('d-none');
        pendLoader?.classList.add('d-none');
    }
}

function dispatchUINotificationBanner(message, semanticStyle) {
    const anchor = document.getElementById('alertFeedbackAnchor');
    anchor.innerHTML = `
        <div class="alert alert-${semanticStyle} alert-dismissible fade show shadow-sm small fw-bold" role="alert">
            <i class="fa-solid ${semanticStyle === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'} me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>`;
    setTimeout(() => {
        const bannerInstance = bootstrap.Alert.getInstance(anchor.querySelector('.alert'));
        bannerInstance?.close();
    }, 4000);
}