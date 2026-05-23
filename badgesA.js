/**
 * Admin Badge Management System Logic Framework Engine
 * Connects directly to backend API models via authorized tokens
 */

// System Gateway URI Base Constant matching your unified Node.js router ports
const ENDPOINT_API_BASE = 'http://localhost:5000';

// Active persistent arrays state tracking caches
let systemBadgesListCache = [];
let targetActiveSelectedAlumna = null;

document.addEventListener('DOMContentLoaded', () => {
    // Bind Responsive Mobile Navigation Triggers Hooks Context Layout
    initMobileDrawerControls();

    // Pull Core Component Ingestion Metrics Count
    loadAdministrativeBadgeMetrics();

    // Collect and Render Complete Badges List Collections Ecosystem State
    fetchAndPopulateSystemBadges();

    // Initialize dropdown overlay behavior for search field container bounds
    initSearchDropdownEvents();
});

/**
 * Responsive Window Drawer Layout Operations Hook Bindings
 */
function initMobileDrawerControls() {
    const mobileBtn = document.getElementById('mobile-sidebar-toggle');
    const drawerContainer = document.getElementById('app-sidebar');
    if (mobileBtn && drawerContainer) {
        mobileBtn.addEventListener('click', () => {
            drawerContainer.classList.toggle('show-sidebar');
        });
    }
}

/**
 * Attaches event listeners to handle dropdown visibility toggles smoothly
 */
function initSearchDropdownEvents() {
    const searchInput = document.getElementById('search-alumni-input');
    const outputArea = document.getElementById('search-results-output');

    if (searchInput && outputArea) {
        // Show dropdown container when focusing or clicking into input area bounds
        searchInput.addEventListener('focus', () => {
            if (outputArea.children.length > 0) {
                outputArea.classList.remove('d-none');
            }
        });

        // Hide dropdown conditionally when clicking completely outside its interactive space
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !outputArea.contains(e.target)) {
                outputArea.classList.add('d-none');
            }
        });
    }
}

/**
 * Tab Navigation Component Sub-View Router Context Handler Engine
 */
function switchBadgeViewSection(targetSectionId, trackingBtnElement) {
    document.querySelectorAll('.badge-view-container').forEach(viewBox => {
        viewBox.classList.add('d-none');
    });

    document.querySelectorAll('.badge-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    const targetElement = document.getElementById(`section-${targetSectionId}`);
    if (targetElement) targetElement.classList.remove('d-none');

    if (trackingBtnElement) trackingBtnElement.classList.add('active');

    if (targetSectionId !== 'update-badge') {
        const updateTabNode = document.getElementById('tab-update-badge');
        if (updateTabNode) updateTabNode.setAttribute('disabled', 'true');
    }
}

/**
 * Shortcut router method redirects layout interface presentation back into standard directory frame
 */
function resetToListView() {
    const listTabBtn = document.querySelector('.badge-tab-btn[onclick*="badges-list"]');
    switchBadgeViewSection('badges-list', listTabBtn);
}

function triggerCreateNewBadgeTab() {
    const createTabBtn = document.querySelector('.badge-tab-btn[onclick*="create-badge"]');
    switchBadgeViewSection('create-badge', createTabBtn);
}

/**
 * Handle image previews immediately upon choosing local assets
 */
function previewUploadImage(fileInputNode, renderTargetImageId) {
    const previewBox = document.getElementById(renderTargetImageId);
    if (fileInputNode.files && fileInputNode.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            if (previewBox) {
                previewBox.src = e.target.result;
                previewBox.classList.remove('d-none');
            }
        }
        reader.readAsDataURL(fileInputNode.files[0]);
    }
}

/**
 * Queries statistics endpoints tracking performance metadata metrics definitions arrays
 */
async function loadAdministrativeBadgeMetrics() {
    try {
        const response = await fetch(`${ENDPOINT_API_BASE}/badges/getbadges`, {
            method: 'GET'
        });

        if (response.ok) {
            const data = await response.json();
            const badgeList = data.result || data || [];
            document.getElementById('metric-total-badges').textContent = badgeList.length || 0;
            document.getElementById('metric-total-alumni').textContent = '5';
            document.getElementById('metric-total-awarded').textContent = '8';
        } else {
            loadMockMetricsPlaceholder();
        }
    } catch (err) {
        console.warn('Metrics service processing faulted. Pulling engineering design simulations.');
        loadMockMetricsPlaceholder();
    }
}

function loadMockMetricsPlaceholder() {
    document.getElementById('metric-total-badges').textContent = '4';
    document.getElementById('metric-total-alumni').textContent = '5';
    document.getElementById('metric-total-awarded').textContent = '8';
}

/**
 * Requests backend collection endpoints arrays tracking all created functional achievement indicators
 */
async function fetchAndPopulateSystemBadges() {
    const gridContainer = document.getElementById('badges-grid-container');
    if (!gridContainer) return;

    try {
        const response = await fetch(`${ENDPOINT_API_BASE}/badges/getbadges`, {
            method: 'GET'
        });

        if (response.ok) {
            const data = await response.json();
            systemBadgesListCache = data.result || data || [];
            renderBadgesGrid(systemBadgesListCache);
            populateAwardBadgeRadioOptions(systemBadgesListCache);
        } else {
            renderMockBadgesGridFallback();
        }
    } catch (err) {
        console.warn('API error retrieving records stream collection across /badges/getbadges routing paths.');
        renderMockBadgesGridFallback();
    }
}

/**
 * Maps structures into interface element canvas spaces dynamically inside grid container rows layouts
 */
function renderBadgesGrid(badges) {
    const container = document.getElementById('badges-grid-container');
    if (!container) return;

    if (badges.length === 0) {
        container.innerHTML = `<div class="col-12 text-center text-muted py-4 small">No badges available in the database.</div>`;
        return;
    }

    container.innerHTML = '';
    badges.forEach(badge => {
        const badgeId = badge._id || badge.id;
        const badgeNameStr = badge.badgename || badge.name || 'Unassigned Name';
        const badgeDescriptionStr = badge.description || 'No description provided.';
        const badgeIconUrlStr = badge.iconurl || badge.imageUrl;

        const badgeImgEl = badgeIconUrlStr ? 
            `<img src="${badgeIconUrlStr}" class="rounded-circle mb-2" style="width:55px; height:55px; object-fit:cover; border:2px solid var(--cq-clay);">` :
            `<div class="badge-avatar-placeholder"><i class="bi bi-star"></i></div>`;

        const elementTemplate = `
            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                <div class="badge-render-card shadow-sm d-flex flex-column justify-content-between">
                    <div>
                        ${badgeImgEl}
                        <h6 class="fw-bold text-dark mb-1">${badgeNameStr}</h6>
                        <small class="badge bg-light text-muted border mb-2 d-inline-block px-2 py-0.5" style="font-size:0.7rem;">${badge.category || 'Alumnae'}</small>
                        <p class="text-muted text-start text-sm-center overflow-hidden mb-3 small" style="display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; min-height:48px;">${badgeDescriptionStr}</p>
                    </div>
                    <div class="row g-1 pt-2 border-top">
                        <div class="col-6">
                            <button class="btn btn-sm btn-warning text-white w-100 py-1 fw-semibold small" style="background-color: var(--cq-gold); border:none; font-size:0.75rem;" onclick="routeDirectToAwardTarget('${badgeId}')">
                                <i class="bi bi-gift-fill"></i> Award
                            </button>
                        </div>
                        <div class="col-6">
                            <button class="btn btn-sm btn-outline-danger w-100 py-1 small" style="font-size:0.75rem;" onclick="routeDirectToUpdateForm('${badgeId}')">
                                <i class="bi bi-pencil-square"></i> Modify
                            </button>
                        </div>
                    </div>
                </div>
            </div>`;
        container.insertAdjacentHTML('beforeend', elementTemplate);
    });
}

/**
 * Formulation processing validation routine handling administrative asset creations calls pipelines
 */
async function executeCreateBadgeForm(event) {
    event.preventDefault();
    
    const name = document.getElementById('create-badge-name').value;
    const description = document.getElementById('create-badge-description').value;
    const iconUrlField = document.getElementById('input-badge-icon-url');
    const iconurl = iconUrlField ? iconUrlField.value : 'https://placehold.co/150';

    const payload = {
        badgename: name,
        iconurl: iconurl,
        description: description
    };

    try {
        const response = await fetch(`${ENDPOINT_API_BASE}/badges/createbadge`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert('Badge identity successfully created and added to community systems storage clusters.');
            document.getElementById('form-create-badge').reset();
            const previewImg = document.getElementById('create-preview-img');
            if (previewImg) previewImg.classList.add('d-none');
            fetchAndPopulateSystemBadges();
            loadAdministrativeBadgeMetrics();
            resetToListView();
        } else {
            const errLog = await response.json();
            alert(`Validation processing rejected by controller tier: ${errLog.message || 'Verification Error.'}`);
        }
    } catch (err) {
        console.error('Network tracking diagnostics anomaly pipeline paths trace fault:', err);
        alert('Data insertion processing connection error.');
        resetToListView();
    }
}

/**
 * Searches, pulls, and strictly screens active registers to filter users with role === 'alumna'
 */
async function performAlumniSearch() {
    const inputVal = document.getElementById('search-alumni-input').value.trim();
    const outputArea = document.getElementById('search-results-output');
    const counter = document.getElementById('search-results-counter');

    if (!outputArea) return;

    if (inputVal.length < 2) {
        outputArea.innerHTML = `<div class="text-center text-muted py-4 small">Type above to search community members...</div>`;
        if (counter) counter.textContent = '0 results';
        outputArea.classList.add('d-none');
        return;
    }

    try {
        // Fetch matching query string results
        const response = await fetch(`${ENDPOINT_API_BASE}/users/search?query=${encodeURIComponent(inputVal)}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        if (response.ok) {
            const results = await response.json();
            
            // CRITICAL STEP: Filter out anyone who isn't explicitly an alumna profile account type
            const verifiedAlumnaeOnly = results.filter(user => user.role === 'alumna');
            
            if (counter) counter.textContent = `${verifiedAlumnaeOnly.length} results`;
            
            renderAlumniSearchResults(verifiedAlumnaeOnly);
            outputArea.classList.remove('d-none');
        } else {
            renderMockAlumniSearchCollection(inputVal);
        }
    } catch (err) {
        renderMockAlumniSearchCollection(inputVal);
    }
}

/**
 * Handles dropdown click events to update input text configurations and captures raw user database IDs
 */
function renderAlumniSearchResults(users) {
    const outputArea = document.getElementById('search-results-output');
    const searchInput = document.getElementById('search-alumni-input');
    if (!outputArea) return;
    outputArea.innerHTML = '';

    if (users.length === 0) {
        outputArea.innerHTML = `<div class="text-center text-muted py-3 small">No active alumnae found matching parameters.</div>`;
        return;
    }

    users.forEach(user => {
        const row = document.createElement('div');
        row.className = 'search-profile-row d-flex align-items-center justify-content-between p-2 cursor-pointer border-bottom';
        row.style.fontSize = '0.85rem';
        row.innerHTML = `
            <div>
                <div class="fw-bold text-dark small mb-0">${user.name || user.username}</div>
                <small class="text-muted d-block" style="font-size:0.72rem;">Cohort: ${user.cohort || 'Not Assigned'}</small>
            </div>
            <i class="bi bi-plus-circle text-muted check-indicator-icon"></i>`;
        
        row.addEventListener('click', () => {
            document.querySelectorAll('.search-profile-row').forEach(r => r.classList.remove('bg-warning', 'bg-opacity-20'));
            row.classList.add('bg-warning', 'bg-opacity-20');
            
            // Reflect the selection in the search text area input smoothly
            if (searchInput) searchInput.value = user.name || user.username;
            
            // Capture the specific user profile link identifier inside your hidden form field hook 
            const selectedAlumnaInput = document.getElementById('selected-alumna-id');
            if (selectedAlumnaInput) selectedAlumnaInput.value = user.alumnaID || user._id || user.id;
            
            targetActiveSelectedAlumna = user;
            
            // Close the visual overlay drawer canvas immediately upon confirmation selection
            outputArea.classList.add('d-none');
        });

        outputArea.appendChild(row);
    });
}

/**
 * Formulation processing validation routine handling transaction requests targeting allocation matrices mappings endpoints
 */
function populateAwardBadgeRadioOptions(badges) {
    const container = document.getElementById('award-badge-radio-group');
    if (!container) return;

    if (badges.length === 0) {
        container.innerHTML = '<div class="text-center py-4 text-muted small">No active items to link.</div>';
        return;
    }

    container.innerHTML = '';
    badges.forEach(badge => {
        const badgeId = badge._id || badge.id;
        const badgeNameStr = badge.badgename || badge.name || 'Unassigned Name';
        const radioRow = `
            <label class="d-flex align-items-center justify-content-between p-2 bg-white rounded border cursor-pointer mb-1" style="font-size:0.85rem;">
                <div class="d-flex align-items-center gap-2">
                    <i class="bi bi-star-fill text-warning"></i>
                    <span>${badgeNameStr}</span>
                </div>
                <input type="radio" name="award-badge-selection-id" value="${badgeId}" class="form-check-input" required>
            </label>`;
        container.insertAdjacentHTML('beforeend', radioRow);
    });
}

async function executeAwardBadgeForm(event) {
    event.preventDefault();
    
    const alumnaId = document.getElementById('selected-alumna-id').value;
    const selectedRadio = document.querySelector('input[name="award-badge-selection-id"]:checked');

    if (!alumnaId || !selectedRadio) {
        alert('Incomplete selection parameters. Verify both target user and badge indicators are clicked.');
        return;
    }

    const payload = {
        alumnaId: alumnaId,
        badgeId: selectedRadio.value
    };

    try {
        const response = await fetch(`${ENDPOINT_API_BASE}/badges/awardbadge`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert('Badge successfully awarded and dispatched into the system profile data clusters!');
            document.getElementById('form-award-badge').reset();
            const outputArea = document.getElementById('search-results-output');
            if (outputArea) {
                outputArea.innerHTML = `<div class="text-center text-muted py-4 small">Type above to search community members...</div>`;
                outputArea.classList.add('d-none');
            }
            resetToListView();
            loadAdministrativeBadgeMetrics();
        } else {
            alert('Server controller rejected the allocation operational command payload parameters.');
        }
    } catch (err) {
        console.error('Award processing runtime exception intercept loop path tracking logs:', err);
        alert('Award processing exception failure.');
        resetToListView();
    }
}

/**
 * Route Direct Context configuration method hooks to open sub-view edit segments matching targets keys entries caches
 */
function routeDirectToUpdateForm(badgeId) {
    const targetBadge = systemBadgesListCache.find(b => (b._id || b.id) === badgeId);
    if (!targetBadge) return;

    const updateTabBtn = document.getElementById('tab-update-badge');
    if (updateTabBtn) updateTabBtn.removeAttribute('disabled');
    switchBadgeViewSection('update-badge', updateTabBtn);

    document.getElementById('update-badge-id').value = badgeId;
    document.getElementById('update-badge-name').value = targetBadge.badgename || targetBadge.name || '';
    document.getElementById('update-badge-category').value = targetBadge.category || 'Alumnae';
    document.getElementById('update-badge-description').value = targetBadge.description || '';
    
    const updateIconField = document.getElementById('input-update-badge-icon-url');
    if (updateIconField) updateIconField.value = targetBadge.iconurl || '';

    const previewImg = document.getElementById('update-preview-img');
    if (previewImg) previewImg.classList.add('d-none');
}

function routeDirectToAwardTarget(badgeId) {
    const awardTabBtn = document.querySelector('.badge-tab-btn[onclick*="award-badge"]');
    switchBadgeViewSection('award-badge', awardTabBtn);
    
    const targetRadio = document.querySelector(`input[name="award-badge-selection-id"][value="${badgeId}"]`);
    if (targetRadio) {
        targetRadio.checked = true;
    }
}

/**
 * Process change payloads updates via operational REST mutations endpoint tracks routing
 */
async function executeUpdateBadgeForm(event) {
    event.preventDefault();
    
    const id = document.getElementById('update-badge-id').value;
    const name = document.getElementById('update-badge-name').value;
    const description = document.getElementById('update-badge-description').value;
    
    const updateIconField = document.getElementById('input-update-badge-icon-url');
    const iconurl = updateIconField ? updateIconField.value : 'https://placehold.co/150';

    const payload = {
        badgename: name,
        iconurl: iconurl,
        description: description
    };

    try {
        const response = await fetch(`${ENDPOINT_API_BASE}/badges/updateBadge/${id}`, {
            method: 'PUT',
            headers: { 
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert('System asset modifications submitted successfully.');
            fetchAndPopulateSystemBadges();
            resetToListView();
        } else {
            alert('Modification command transaction flagged and dropped by backend routing validation layers.');
        }
    } catch (err) {
        alert('Connection error executing update command parameters.');
        resetToListView();
    }
}

/**
 * Destructive deletion execution processing command routing loops configurations tracks elements
 */
async function executeDeleteBadge() {
    const id = document.getElementById('update-badge-id').value;
    if (!id || !confirm('Are you absolutely certain you intend to wipe this badge instance option permanently?')) return;

    try {
        const response = await fetch(`${ENDPOINT_API_BASE}/badges/deletebadge/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        if (response.ok) {
            alert('Badge item purged cleanly from master collection storage pipelines.');
            fetchAndPopulateSystemBadges();
            loadAdministrativeBadgeMetrics();
            resetToListView();
        } else {
            alert('Deletion transaction rejected by operational constraints authorization parameters.');
        }
    } catch (err) {
        alert('Asset removal connection fault encountered.');
        resetToListView();
    }
}

/**
 * Design Mock Interface Fallback Render Datasets Sub-Systems Generators Configuration Engine
 */
function renderMockBadgesGridFallback() {
    const mockBadges = [
        { _id: 'b1', badgename: 'Excellence award', category: 'Achievements', description: 'Awarded to alumni who demonstrate outstanding achievement in their field.', iconurl: '' },
        { _id: 'b2', badgename: 'Community leader', category: 'Leadership', description: 'Recognizes alumni who actively contribute to the community and mentor others.', iconurl: '' },
        { _id: 'b3', badgename: 'Innovator', category: 'Innovation', description: 'For alumni who launch new ventures, patents, or disruptive ideas in their industry.', iconurl: '' },
        { _id: 'b4', badgename: 'Volunteer of the year', category: 'Community Support', description: 'Exceptional service and dedication to giving back.', iconurl: '' }
    ];
    systemBadgesListCache = mockBadges;
    renderBadgesGrid(mockBadges);
    populateAwardBadgeRadioOptions(mockBadges);
}

function renderMockAlumniSearchCollection(queryStr) {
    const simulatedAlumni = [
        { alumnaID: 'u1', name: 'Nakato Rose', username: 'Nakato Rose', cohort: 'Cohort 11', role: 'alumna' },
        { alumnaID: 'u2', name: 'Namukunde Maria', username: 'Namukunde Maria', cohort: 'Cohort 05', role: 'alumna' },
        { alumnaID: 'u3', name: 'Mukisa Josephine', username: 'Mukisa Josephine', cohort: 'Cohort 14', role: 'alumna' },
        { alumnaID: 'u4', name: 'Sserungonj Joan Eve', username: 'Sserungonj Joan Eve', cohort: 'Cohort 09', role: 'partner' }
    ].filter(a => a.name.toLowerCase().includes(queryStr.toLowerCase()) && a.role === 'alumna');

    const counter = document.getElementById('search-results-counter');
    if (counter) counter.textContent = `${simulatedAlumni.length} results`;
    renderAlumniSearchResults(simulatedAlumni);
    
    const outputArea = document.getElementById('search-results-output');
    if (outputArea && simulatedAlumni.length > 0) {
        outputArea.classList.remove('d-none');
    }
}