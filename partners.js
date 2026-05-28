/**
 * Synchronized Frontend Client Engine for CodeQueen Partners Network
 */

const API_BASE_URL = 'http://localhost:5000/partners';
let cachedEcosystemRegistry = [];
let targetActiveProfileId = null; 

document.addEventListener('DOMContentLoaded', async () => {
    const storedToken = localStorage.getItem('token');
    const cachedUserData = localStorage.getItem('user');

    if (!storedToken || !cachedUserData) {
        console.warn("Session context parameters missing. Evicting browser instance...");
        window.location.href = 'login.html';
        return;
    }

    const parsedUserObj = JSON.parse(cachedUserData);

    // 1. Inject the matching structural layout sidebar wrapper base view context
    injectDynamicRoleSidebar(parsedUserObj);

    // 2. Add structural click bindings for mobile screens
    setupMobileSidebarInteractions();

    // 3. Show Management Form Panel Options if account role is authorized
    evaluatePartnerPermissionsWorkspace(parsedUserObj, storedToken);

    // 4. Start search input watchers
    initClientSearchEngine();

    // 5. Query verified operational systems profiles data array
    await pullApprovedPartnersRegistry(storedToken);
});

/**
 * Renders the chosen structural layout path according to user role matrix values
 */
function injectDynamicRoleSidebar(userObj) {
    const renderMountPoint = document.getElementById('sidebar-injection-target');
    if (!renderMountPoint) return;

    const userRole = userObj.role ? userObj.role.toLowerCase() : 'alumna';

    let sidebarHtmlMarkup = '';

    if (userRole === 'partner') {
        // Partner Interface Menu Configuration Base Layout Matrix
        sidebarHtmlMarkup = `
        <nav class="sidebar-wrapper" id="sidebarMenu">
            <div>
                <div class="sidebar-brand">
                    <h4 class="m-0 text-white fw-bold text-uppercase">CodeQueen</h4>
                    <small class="text-white-50">Alumni Administrative Space</small>
                </div>
                <ul class="sidebar-menu">
                    <li><a href="partner.html" class="sidebar-link"><i class="fa-solid fa-house"></i> HOME</a></li>
                    <li><a href="alumniProfiles.html" class="sidebar-link"><i class="fa-solid fa-user-graduate"></i> Alumna Profiles</a></li>
                    <li><a href="projects.html" class="sidebar-link"><i class="fa-solid fa-laptop-code"></i> Community Projects</a></li>
                    <li><a href="achievements.html" class="sidebar-link"><i class="fa-solid fa-trophy"></i> Achievements</a></li>
                    <li><a href="partners.html" class="sidebar-link active"><i class="fa-solid fa-handshake"></i> Other partners</a></li>
                    <li><a href="leadership.html" class="sidebar-link"><i class="fa-solid fa-users-gear"></i> Leadership</a></li>
                    <li><a href="wallOfFame.html" class="sidebar-link"><i class="fa-solid fa-star"></i> Wall of Fame</a></li>
                    <li><a href="eventsSpace.html" class="sidebar-link"><i class="fa-solid fa-calendar-days"></i> Events</a></li>
                </ul>
            </div>
            <button class="btn btn-logout-sidebar" id="btnSidebarSignout">
                <i class="fa-solid fa-arrow-right-from-bracket"></i> Logout
            </button>
        </nav>`;
    } else {
        // Alumna, Student, or Admin Standard View Interface Configuration Layout
        sidebarHtmlMarkup = `
        <nav class="sidebar-wrapper" id="sidebarMenu">
            <div>
                <div class="sidebar-brand">
                    <h4 class="m-0 text-white fw-bold text-uppercase">CodeQueen</h4>
                    <small class="text-white-50">Alumni Ecosystem Hub</small>
                </div>
                <ul class="sidebar-menu">
                    <li><a href="alumni.html" class="sidebar-link"><i class="bi bi-house-door"></i> HOME</a></li>
                    <li><a href="profiles.html" class="sidebar-link"><i class="bi bi-person"></i> Profiles</a></li>
                    <li><a href="gallery.html" class="sidebar-link"><i class="bi bi-image"></i> Gallery</a></li>
                    <li><a href="resources.html" class="sidebar-link"><i class="bi bi-folder"></i> Resources</a></li>
                    <li><a href="projects.html" class="sidebar-link"><i class="bi bi-briefcase"></i> Projects</a></li>
                    <li><a href="achievements.html" class="sidebar-link"><i class="bi bi-award"></i> Achievements</a></li>
                    <li><a href="wall.html" class="sidebar-link"><i class="bi bi-star"></i> Wall of fame</a></li>
                    <li><a href="partners.html" class="sidebar-link active"><i class="bi bi-building"></i> Partners</a></li>
                    <li><a href="elections.html" class="sidebar-link"><i class="bi bi-box-seam"></i> Elections</a></li>
                    <li><a href="mentors.html" class="sidebar-link"><i class="bi bi-mortarboard"></i> Mentors</a></li>
                </ul>
            </div>
            <button class="btn btn-logout-sidebar" id="btnSidebarSignout">
                <i class="fa-solid fa-arrow-right-from-bracket"></i> Logout !
            </button>
        </nav>`;
    }

    renderMountPoint.innerHTML = sidebarHtmlMarkup;

    // Attach immediate sign-out hook listeners to injected button elements
    const signoutButton = document.getElementById('btnSidebarSignout');
    if (signoutButton) {
        signoutButton.addEventListener('click', logoutSession);
    }
}

/**
 * Binds sidebar drawer view modifiers for compact viewports
 */
function setupMobileSidebarInteractions() {
    const navigationDrawer = document.getElementById('sidebarMenu');
    const openActionTrigger = document.getElementById('open-sidebar-trigger');

    if (openActionTrigger && navigationDrawer) {
        openActionTrigger.addEventListener('click', () => {
            navigationDrawer.classList.add('show-sidebar');
        });
    }

    // Close menu when a click falls outside sidebar container boundaries
    document.addEventListener('click', (event) => {
        if (navigationDrawer && navigationDrawer.classList.contains('show-sidebar')) {
            if (!navigationDrawer.contains(event.target) && !openActionTrigger.contains(event.target)) {
                navigationDrawer.classList.remove('show-sidebar');
            }
        }
    });
}

/**
 * Validates structural credentials before enabling corporate workspace widgets
 */
function evaluatePartnerPermissionsWorkspace(userObj, token) {
    const activeRole = userObj.role ? userObj.role.toLowerCase() : '';
    const managePartnerBtn = document.getElementById('btn-manage-partner');

    if (activeRole === 'partner' || userObj.isAdmin) {
        if (managePartnerBtn) {
            managePartnerBtn.classList.remove('d-none');
            managePartnerBtn.classList.add('d-inline-flex');
            managePartnerBtn.addEventListener('click', () => toggleAndFetchPartnerWorkspace(token, userObj));
        }

        const updateForm = document.getElementById('update-partner-profile-form');
        if (updateForm) {
            updateForm.addEventListener('submit', (e) => handlePublishOrSavePartnerProfile(e, token));
        }

        const deleteBtn = document.getElementById('btn-delete-partner-exec');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => handleDeletePartnerProfileCard(token));
        }
    }
}

/**
 * Loads the main public dashboard feed content
 */
async function pullApprovedPartnersRegistry(token) {
    toggleInterfaceContentLoader(true);
    try {
        const networkResponse = await fetch(`${API_BASE_URL}/getapprovedpartners`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (networkResponse.ok) {
            cachedEcosystemRegistry = await networkResponse.json();
            renderEcosystemGridCards(cachedEcosystemRegistry);
        } else {
            dispatchSystemAlertNotification("Failed to download approved partner listings directory.", "danger");
        }
    } catch (err) {
        console.error("Roster pipeline failure:", err);
        dispatchSystemAlertNotification("Network execution fault when streaming verified items.", "danger");
    } finally {
        toggleInterfaceContentLoader(false);
    }
}

/**
 * Controls profile visibility status maps inside workspace layout forms
 */
async function toggleAndFetchPartnerWorkspace(token, userObj) {
    const container = document.getElementById('partner-management-workspace');
    if (!container) return;

    if (container.style.display === 'block') {
        container.style.display = 'none';
        return;
    }

    container.style.display = 'block';
    container.scrollIntoView({ behavior: 'smooth' });

    try {
        const response = await fetch(`${API_BASE_URL}/getapprovedpartners`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const workspaceTitle = document.getElementById('partner-workspace-title');
        const submitBtnText = document.getElementById('submit-partner-btn-text');
        const deleteBtn = document.getElementById('btn-delete-partner-exec');
        const formElement = document.getElementById('update-partner-profile-form');

        let localizedProfileMatch = null;
        const loggedInUserId = userObj._id || userObj.id;

        if (response.ok) {
            const currentRoster = await response.json();
            localizedProfileMatch = currentRoster.find(item => item.userID === loggedInUserId);
        }

        if (localizedProfileMatch) {
            targetActiveProfileId = localizedProfileMatch._id;

            document.getElementById('edit-partner-name').value = localizedProfileMatch.companyname || '';
            document.getElementById('edit-partner-logo').value = localizedProfileMatch.logoUrl || '';
            document.getElementById('edit-partner-desc').value = localizedProfileMatch.description || '';
            document.getElementById('edit-partner-website').value = localizedProfileMatch.website || '';
            document.getElementById('edit-partner-location').value = localizedProfileMatch.location || '';
            document.getElementById('edit-partner-contact').value = localizedProfileMatch.contact || '';
            document.getElementById('edit-partner-email').value = localizedProfileMatch.email || '';

            if (workspaceTitle) workspaceTitle.innerHTML = `<i class="bi bi-sliders me-2 text-warning"></i>Update Company Record`;
            if (submitBtnText) submitBtnText.textContent = "Save Update Modifications";
            if (deleteBtn) deleteBtn.style.display = 'inline-block';
            formElement.setAttribute('data-record-exists', 'true');
        } else {
            formElement.reset();
            targetActiveProfileId = null;
            
            if (workspaceTitle) workspaceTitle.innerHTML = `<i class="bi bi-building-add me-2 text-warning"></i>Publish Your Corporate Profile`;
            if (submitBtnText) submitBtnText.textContent = "Publish Profile Entry";
            if (deleteBtn) deleteBtn.style.display = 'none';
            formElement.setAttribute('data-record-exists', 'false');
        }
    } catch (err) {
        console.error("Unable to process configuration mappings:", err);
    }
}

/**
 * Manages post streams updates executions
 */
async function handlePublishOrSavePartnerProfile(event, token) {
    event.preventDefault();
    const formElement = document.getElementById('update-partner-profile-form');
    const profileExists = formElement.getAttribute('data-record-exists') === 'true';

    const rawPayload = {
        companyname: document.getElementById('edit-partner-name').value,
        logoUrl: document.getElementById('edit-partner-logo').value,
        description: document.getElementById('edit-partner-desc').value,
        website: document.getElementById('edit-partner-website').value,
        location: document.getElementById('edit-partner-location').value,
        contact: document.getElementById('edit-partner-contact').value,
        email: document.getElementById('edit-partner-email').value
    };

    let requestUrl = `${API_BASE_URL}/createpartnerprofile`;
    let requestMethod = 'POST';

    if (profileExists && targetActiveProfileId) {
        requestUrl = `${API_BASE_URL}/updatepartnerprofile/${targetActiveProfileId}`;
        requestMethod = 'PUT';
    }

    try {
        const response = await fetch(requestUrl, {
            method: requestMethod,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(rawPayload)
        });

        const outcomePayload = await response.json();

        if (response.ok) {
            dispatchSystemAlertNotification(outcomePayload.message || "Operation processing success!", "success");
            document.getElementById('partner-management-workspace').style.display = 'none';
            await pullApprovedPartnersRegistry(token); 
        } else {
            dispatchSystemAlertNotification(outcomePayload.message || "Transaction denied by backend server.", "warning");
        }
    } catch (err) {
        console.error("Form submission failure:", err);
        dispatchSystemAlertNotification("Communication error: Failed to save partner entry.", "danger");
    }
}

/**
 * Handles account entries destruction requests
 */
async function handleDeletePartnerProfileCard(token) {
    if (!targetActiveProfileId) return;

    const confirmationPrompt = confirm("Are you sure you want to permanently erase this enterprise listing card from system archives?");
    if (!confirmationPrompt) return;

    try {
        const response = await fetch(`${API_BASE_URL}/deletepartnerprofile/${targetActiveProfileId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        if (response.ok) {
            dispatchSystemAlertNotification(data.message || "Record successfully removed.", "success");
            document.getElementById('partner-management-workspace').style.display = 'none';
            await pullApprovedPartnersRegistry(token);
        } else {
            dispatchSystemAlertNotification(data.message || "Erase operation rejected.", "warning");
        }
    } catch (err) {
        console.error("Deletion transaction dropped:", err);
        dispatchSystemAlertNotification("Unable to execute delete request.", "danger");
    }
}

/**
 * Converts response datasets directly into structured list cards
 * INCLUDES ANTI-LOOP IMAGE FIX (this.onerror=null)
 */
function renderEcosystemGridCards(dataSubsetCollection) {
    const interactionDisplayMount = document.getElementById('approvedPartnersContainer');
    interactionDisplayMount.innerHTML = '';

    const validationCondition = dataSubsetCollection && dataSubsetCollection.length > 0;
    document.getElementById('noApprovedPlaceholder').classList.toggle('d-none', validationCondition);

    if (!validationCondition) return;

    dataSubsetCollection.forEach(partnerRecord => {
        const structureWrapperNode = document.createElement('div');
        structureWrapperNode.className = "partner-display-box shadow-sm";
        
        structureWrapperNode.innerHTML = `
            <div class="row g-3 align-items-center">
                <div class="col-12 col-md-3 text-center bg-light p-3 rounded-4 border">
                    <img src="${partnerRecord.logoUrl || 'https://placehold.co/120?text=No+Logo'}" 
                         class="img-fluid rounded-3" style="max-height: 110px; object-fit: contain;"
                         alt="${partnerRecord.companyname || 'Corporate partner'}"
                         onerror="this.onerror=null; this.src='https://placehold.co/120?text=No+Logo';">
                </div>
                
                <div class="col-12 col-md-9">
                    <div class="d-flex justify-content-between align-items-start border-bottom pb-2 mb-2 flex-wrap gap-2">
                        <div>
                            <h5 class="fw-bold m-0 text-dark">${partnerRecord.companyname}</h5>
                            <small class="text-muted d-inline-flex align-items-center gap-1" style="font-size: 12px;">
                                <i class="bi bi-geo-alt"></i>${partnerRecord.location}
                            </small>
                        </div>
                    </div>
                    
                    <p class="small text-secondary mb-3">${partnerRecord.description}</p>
                    
                    <div class="row g-2 text-muted small">
                        <div class="col-12 col-sm-6 d-flex align-items-center gap-2">
                            <i class="bi bi-telephone text-secondary"></i><span><strong>Contact:</strong> ${partnerRecord.contact}</span>
                        </div>
                        <div class="col-12 col-sm-6 d-flex align-items-center gap-2">
                            <i class="bi bi-envelope text-secondary"></i><span><strong>Email:</strong> ${partnerRecord.email}</span>
                        </div>
                        <div class="col-12 col-sm-6 d-flex align-items-center gap-2">
                            <i class="bi bi-globe text-secondary"></i><span><strong>Website:</strong> 
                            ${partnerRecord.website ? `<a href="${partnerRecord.website}" target="_blank" class="text-orange text-decoration-none fw-semibold d-inline-flex align-items-center gap-1">${partnerRecord.website} <i class="bi bi-arrow-up-right" style="font-size: 10px;"></i></a>` : 'N/A'}</span>
                        </div>
                    </div>
                </div>
            </div>`;
            
        interactionDisplayMount.appendChild(structureWrapperNode);
    });
}

/**
 * Handles front-end text searches 
 */
function initClientSearchEngine() {
    const queryInputElement = document.getElementById('partnerSearchInput');
    if (!queryInputElement) return;
    
    queryInputElement.addEventListener('input', (event) => {
        const sanitationToken = event.target.value.toLowerCase().trim();
        
        if (!sanitationToken) {
            renderEcosystemGridCards(cachedEcosystemRegistry);
            return;
        }

        const computationalFilterCollection = cachedEcosystemRegistry.filter(entry => {
            return (
                entry.companyname?.toLowerCase().includes(sanitationToken) ||
                entry.description?.toLowerCase().includes(sanitationToken) ||
                entry.location?.toLowerCase().includes(sanitationToken)
            );
        });

        renderEcosystemGridCards(computationalFilterCollection);
    });
}

function toggleInterfaceContentLoader(isProcessing) {
    const masterLoaderNode = document.getElementById('approvedSpinner');
    if (isProcessing) {
        masterLoaderNode?.classList.remove('d-none');
    } else {
        masterLoaderNode?.classList.add('d-none');
    }
}

function dispatchSystemAlertNotification(messagePayloadText, semanticThemeContext) {
    const outputTargetAnchor = document.getElementById('alertFeedbackAnchor');
    if (!outputTargetAnchor) return;

    outputTargetAnchor.innerHTML = `
        <div class="alert alert-${semanticThemeContext} alert-dismissible fade show shadow-sm small fw-bold" role="alert">
            <i class="bi bi-exclamation-circle me-2"></i>
            ${messagePayloadText}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>`;
}

function logoutSession() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}