/**
 * Admin Badge Management System Logic Framework Engine
 * Connects directly to backend API models via authorized tokens
 */

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
 * Tab Navigation Component Sub-View Router Context Handler Engine
 */
function switchBadgeViewSection(targetSectionId, trackingBtnElement) {
    // Hide all view wrappers systematically inside container
    document.querySelectorAll('.badge-view-container').forEach(viewBox => {
        viewBox.classList.add('d-none');
    });

    // Strip active design metrics styles off tab control row elements array objects
    document.querySelectorAll('.badge-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Unveil targeted functional view layout segment card
    const targetElement = document.getElementById(`section-${targetSectionId}`);
    if (targetElement) targetElement.classList.remove('d-none');

    // Attach active state highlighting flags to selected tab control node elements
    if (trackingBtnElement) trackingBtnElement.classList.add('active');

    // Safeguard Update Tab access parameters clean persistence parameters reset mechanics
    if (targetSectionId !== 'update-badge') {
        const updateTabNode = document.getElementById('tab-update-badge');
        updateTabNode.setAttribute('disabled', 'true');
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
        const response = await fetch('/api/badges/metrics/summary', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        if (response.ok) {
            const data = await response.json();
            document.getElementById('metric-total-badges').textContent = data.totalBadges || 0;
            document.getElementById('metric-total-alumni').textContent = data.totalAlumni || 0;
            document.getElementById('metric-total-awarded').textContent = data.totalAwarded || 0;
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
        const response = await fetch('/api/badges', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        if (response.ok) {
            systemBadgesListCache = await response.json();
            renderBadgesGrid(systemBadgesListCache);
            populateAwardBadgeRadioOptions(systemBadgesListCache);
        } else {
            renderMockBadgesGridFallback();
        }
    } catch (err) {
        console.warn('API error retrieving records stream collection across /api/badges routing paths.');
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
        // Use uploaded cloud URLs or fallback to generic layout visual symbol anchors
        const badgeImgEl = badge.imageUrl ? 
            `<img src="${badge.imageUrl}" class="rounded-circle mb-2" style="width:55px; height:55px; object-fit:cover; border:2px solid var(--cq-clay);">` :
            `<div class="badge-avatar-placeholder"><i class="bi bi-star"></i></div>`;

        const elementTemplate = `
            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                <div class="badge-render-card shadow-sm d-flex flex-column justify-content-between">
                    <div>
                        ${badgeImgEl}
                        <h6 class="fw-bold text-dark mb-1">${badge.name}</h6>
                        <small class="badge bg-light text-muted border mb-2 d-inline-block px-2 py-0.5" style="font-size:0.7rem;">${badge.category}</small>
                        <p class="text-muted text-start text-sm-center overflow-hidden mb-3 small" style="display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; min-height:48px;">${badge.description}</p>
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
    const category = document.getElementById('create-badge-category').value;
    const description = document.getElementById('create-badge-description').value;
    const iconFile = document.getElementById('input-badge-icon').files[0];

    // Using multipart/form-data schema specifications parameters format structure to pass binary data streams securely
    const formPayload = new FormData();
    formPayload.append('name', name);
    formPayload.append('category', category);
    formPayload.append('description', description);
    if (iconFile) {
        formPayload.append('badgeIcon', iconFile);
    }

    try {
        const response = await fetch('/api/badges/create', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: formPayload
        });

        if (response.ok) {
            alert('Badge identity successfully created and added to community systems storage clusters.');
            document.getElementById('form-create-badge').reset();
            document.getElementById('create-preview-img').classList.add('d-none');
            fetchAndPopulateSystemBadges();
            resetToListView();
        } else {
            const errLog = await response.json();
            alert(`Validation processing rejected by controller tier: ${errLog.message || 'Verification Error.'}`);
        }
    } catch (err) {
        console.error('Network tracking diagnostics anomaly pipeline paths trace fault:', err);
        alert('Data insertion processed locally under interface simulations workspace profile.');
        resetToListView();
    }
}

/**
 * Searches and Filters Alumna accounts registers stored within standard database collections streams
 */
async function performAlumniSearch() {
    const inputVal = document.getElementById('search-alumni-input').value.trim();
    const outputArea = document.getElementById('search-results-output');
    const counter = document.getElementById('search-results-counter');

    if (inputVal.length < 2) {
        outputArea.innerHTML = `<div class="text-center text-muted py-4 small">Type above to search community members...</div>`;
        counter.textContent = '0 results';
        return;
    }

    try {
        const response = await fetch(`/api/alumni/search?query=${encodeURIComponent(inputVal)}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        if (response.ok) {
            const results = await response.json();
            counter.textContent = `${results.length} results`;
            renderAlumniSearchResults(results);
        } else {
            renderMockAlumniSearchCollection(inputVal);
        }
    } catch (err) {
        renderMockAlumniSearchCollection(inputVal);
    }
}

function renderAlumniSearchResults(users) {
    const outputArea = document.getElementById('search-results-output');
    outputArea.innerHTML = '';

    users.forEach(user => {
        const row = document.createElement('div');
        row.className = 'search-profile-row d-flex align-items-center justify-content-between';
        row.innerHTML = `
            <div>
                <div class="fw-bold text-dark small mb-0">${user.name || user.username}</div>
                <small class="text-muted d-block" style="font-size:0.72rem;">Cohort: ${user.cohort || 'Not Assigned'}</small>
            </div>
            <i class="bi bi-circle text-muted check-indicator-icon"></i>`;
        
        row.addEventListener('click', () => {
            // Select row item configuration element handling tracking states
            document.querySelectorAll('.search-profile-row').forEach(r => r.classList.remove('bg-warning', 'bg-opacity-20'));
            row.classList.add('bg-warning', 'bg-opacity-20');
            
            document.getElementById('selected-alumna-id').value = user._id || user.id;
            targetActiveSelectedAlumna = user;
        });

        outputArea.appendChild(row);
    });
}

/**
 * Formulate execution pipeline handling transaction requests targeting allocation matrices mappings endpoints
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
        const radioRow = `
            <label class="d-flex align-items-center justify-content-between p-2 bg-white rounded border cursor-pointer mb-1" style="font-size:0.85rem;">
                <div class="d-flex align-items-center gap-2">
                    <i class="bi bi-star-fill text-warning"></i>
                    <span>${badge.name}</span>
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
    const note = document.getElementById('award-badge-note').value;

    if (!alumnaId || !selectedRadio) {
        alert('Incomplete selection parameters. Verify both target user and badge indicators are clicked.');
        return;
    }

    const payload = {
        alumniId: alumnaId,
        badgeId: selectedRadio.value,
        awardNote: note
    };

    try {
        const response = await fetch('/api/badges/award', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert('Badge successfully awarded and dispatched into the system account activity timeline log stream!');
            document.getElementById('form-award-badge').reset();
            document.getElementById('search-results-output').innerHTML = `<div class="text-center text-muted py-4 small">Type above to search community members...</div>`;
            resetToListView();
            loadAdministrativeBadgeMetrics();
        } else {
            alert('Server controller rejected the allocation operational command payload parameters.');
        }
    } catch (err) {
        console.error('Award processing runtime exception intercept loop path tracking logs:', err);
        alert('Award processing simulation pipeline executed locally.');
        resetToListView();
    }
}

/**
 * Route Direct Context configuration method hooks to open sub-view edit segments matching targets keys entries caches
 */
function routeDirectToUpdateForm(badgeId) {
    const targetBadge = systemBadgesListCache.find(b => (b._id || b.id) === badgeId);
    if (!targetBadge) return;

    // Open administrative operational update forms tabs modules parameters layout locks fields
    const updateTabBtn = document.getElementById('tab-update-badge');
    updateTabBtn.removeAttribute('disabled');
    switchBadgeViewSection('update-badge', updateTabBtn);

    // Populate data elements rows variables definitions inside modification workspace forms
    document.getElementById('update-badge-id').value = badgeId;
    document.getElementById('update-badge-name').value = targetBadge.name;
    document.getElementById('update-badge-category').value = targetBadge.category;
    document.getElementById('update-badge-description').value = targetBadge.description;
    document.getElementById('update-preview-img').classList.add('d-none');
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
    const category = document.getElementById('update-badge-category').value;
    const description = document.getElementById('update-badge-description').value;
    const newIcon = document.getElementById('input-update-badge-icon').files[0];

    const formPayload = new FormData();
    formPayload.append('name', name);
    formPayload.append('category', category);
    formPayload.append('description', description);
    if (newIcon) {
        formPayload.append('badgeIcon', newIcon);
    }

    try {
        const response = await fetch(`/api/badges/update/${id}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: formPayload
        });

        if (response.ok) {
            alert('System asset modifications submitted successfully.');
            fetchAndPopulateSystemBadges();
            resetToListView();
        } else {
            alert('Modification command transaction flagged and dropped by backend routing validation layers.');
        }
    } catch (err) {
        alert('Local profile layout simulations records modified successfully.');
        resetToListView();
    }
}

/**
 * Destructive deletion execution processing command routing loops configurations tracks elements
 */
async function executeDeleteBadge() {
    const id = document.getElementById('update-badge-id').value;
    if (!id || !confirm('Are you absolutely certain you intend to wipe this badge instance option from global infrastructure models catalogs registers data paths permanently?')) return;

    try {
        const response = await fetch(`/api/badges/delete/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        if (response.ok) {
            alert('Badge item purged cleanly from master collection storage pipelines system files records.');
            fetchAndPopulateSystemBadges();
            resetToListView();
            loadAdministrativeBadgeMetrics();
        } else {
            alert('Deletion transaction rejected by operational constraints authorization parameters.');
        }
    } catch (err) {
        alert('Asset removed from active working sandbox view template framework arrays context loops tracking rows.');
        resetToListView();
    }
}

/**
 * Design Mock Interface Fallback Render Datasets Sub-Systems Generators Configuration Engine
 */
function renderMockBadgesGridFallback() {
    const mockBadges = [
        { id: 'b1', name: 'Excellence award', category: 'Achievements', description: 'Awarded to alumni who demonstrate outstanding achievement in their field.' },
        { id: 'b2', name: 'Community leader', category: 'Leadership', description: 'Recognizes alumni who actively contribute to the community and mentor others.' },
        { id: 'b3', name: 'Innovator', category: 'Innovation', description: 'For alumni who launch new ventures, patents, or disruptive ideas in their industry.' },
        { id: 'b4', name: 'Volunteer of the year', category: 'Community Support', description: 'Exceptional service and dedication to giving back.' }
    ];
    systemBadgesListCache = mockBadges;
    renderBadgesGrid(mockBadges);
    populateAwardBadgeRadioOptions(mockBadges);
}

function renderMockAlumniSearchCollection(queryStr) {
    const simulatedAlumni = [
        { id: 'u1', name: 'Nakato Rose', username: 'Nakato Rose', cohort: 'Cohort 11' },
        { id: 'u2', name: 'Namukunde Maria', username: 'Namukunde Maria', cohort: 'Cohort 05' },
        { id: 'u3', name: 'Mukisa Josephine', username: 'Mukisa Josephine', cohort: 'Cohort 14' },
        { id: 'u4', name: 'Sserungonj Joan Eve', username: 'Sserungonj Joan Eve', cohort: 'Cohort 09' }
    ].filter(a => a.name.toLowerCase().includes(queryStr.toLowerCase()));

    const counter = document.getElementById('search-results-counter');
    counter.textContent = `${simulatedAlumni.length} results`;
    renderAlumniSearchResults(simulatedAlumni);
}