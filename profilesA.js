/**
 * CodeQueen Alumnae Profiles System Pipeline Controller
 */
const API_BASE_URL = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://cq-a-bckd.onrender.com'; // Production live Render URL
const CONFIG_API_BASE = `${API_BASE_URL}/profiles`; // Linked exactly to profiles path

document.addEventListener('DOMContentLoaded', () => {
    initLayoutNavigationSwitches();
    fetchAlumnaeProfilesData();

    // Hook search event input listener 
    const searchBar = document.getElementById('profileQuerySearch');
    if (searchBar) {
        searchBar.addEventListener('input', filterProfilesInWorkspace);
    }
});

/**
 * Handle Mobile Drawer Canvas Toggles
 */
function initLayoutNavigationSwitches() {
    const openBtn = document.getElementById('sidebar-open-toggle-trigger');
    const closeBtn = document.getElementById('sidebar-close-toggle-trigger');
    const sidebar = document.getElementById('app-navigation-sidebar-container');

    if (openBtn && sidebar) {
        openBtn.addEventListener('click', () => sidebar.classList.add('show-sidebar'));
    }
    if (closeBtn && sidebar) {
        closeBtn.addEventListener('click', () => sidebar.classList.remove('show-sidebar'));
    }
}

/**
 * Fetch profiles array mapping exactly onto backend schema rules
 */
async function fetchAlumnaeProfilesData() {
    const container = document.getElementById('profilesRenderContainer');
    const spinner = document.getElementById('loadingStatusSpinner');
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${CONFIG_API_BASE}/getallprofiles`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) throw new Error('Unauthorized Authorization Context Drop.');

        const profiles = await response.json();

        if (spinner) spinner.classList.add('d-none');
        renderAlumnaeProfileGrid(profiles);

    } catch (err) {
        console.error("Database connection array extraction pipeline breakdown: ", err);
        if (container) {
            container.innerHTML = `
                <div class="alert alert-danger mx-auto mt-4 text-center" style="max-width: 500px;">
                    <i class="bi bi-exclamation-triangle-fill me-2"></i> Error establishing clear connection stream to Alumnae profile registry.
                </div>`;
        }
    }
}

/**
 * Render components dynamically matching MongoDB layout key names and downsized styles
 */
function renderAlumnaeProfileGrid(profiles) {
    const container = document.getElementById('profilesRenderContainer');
    if (!container) return;

    if (!profiles || profiles.length === 0) {
        container.innerHTML = `<p class="text-muted text-center py-5">No active alumnae profiles found inside collection database.</p>`;
        return;
    }

    container.innerHTML = profiles.map(item => {
        // Precise data binding onto Mongoose schema properties
        const name = item.fullname || 'Anonymous Alumna';
        const cohort = item.cohort || item.cohortName || 'Unknown Cohort';
        const bio = item.bio || 'No career bio provided yet.';
        const portfolio = item.portfoliolink || '';
        const avatar = item.profileimage || 'https://via.placeholder.com/90';
        const cvLocation = item.cvUrl || '#';
        
        // Parse skills array text layouts safely
        const skills = Array.isArray(item.skills) ? item.skills.join(', ') : (item.skills || '');

        // Badges slot mapping synced with compact CSS dimension sizes
        let badgeElements = '';
        for (let i = 0; i < 4; i++) {
            if (item.badges && item.badges[i]) {
                badgeElements += `<div class="badge-slot-box" title="Awarded Token"><i class="bi bi-award text-warning"></i></div>`;
            } else {
                badgeElements += `<div class="badge-slot-box"><i class="bi bi-dash text-muted opacity-25"></i></div>`;
            }
        }

        return `
            <div class="profile-entry-card data-alumna-search-unit" data-search-string="${name.toLowerCase()}">
                <div class="row g-3 align-items-center">
                    
                    <div class="col-12 col-md-3 col-lg-2 profile-avatar-wrapper border-end border-md-light">
                        <img src="${avatar}" alt="${name}" class="profile-avatar-circle">
                        <div class="badge-grid-container mt-2">${badgeElements}</div>
                    </div>

                    <div class="col-12 col-md-6 col-lg-8">
                        <div class="px-md-2">
                            <div class="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
                                <h6 class="fw-bold m-0 text-dark" style="font-size: 1.05rem;">${name}</h6>
                                <span class="badge bg-light text-secondary border px-2 py-1 rounded-pill" style="font-size: 0.75rem;">Alumna Profile</span>
                            </div>

                            <div class="data-display-row">
                                <div class="data-display-label">Cohort :</div>
                                <div class="w-100">
                                    <input type="text" class="data-static-line-input fw-semibold text-secondary" value="${cohort}" readonly>
                                </div>
                            </div>

                            <div class="data-display-row">
                                <div class="data-display-label">Bio :</div>
                                <div class="data-static-field-box">${bio}</div>
                            </div>

                            <div class="data-display-row">
                                <div class="data-display-label">Portfolio :</div>
                                <div class="w-100">
                                    <input type="text" class="data-static-line-input" value="${portfolio}" placeholder="No URL provided" readonly>
                                </div>
                            </div>

                            <div class="data-display-row mb-0">
                                <div class="data-display-label">Skills :</div>
                                <div class="w-100">
                                    <input type="text" class="data-static-line-input" value="${skills}" placeholder="No listed technical skills" readonly>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col-12 col-md-3 col-lg-2 text-md-end">
                        <div class="d-flex flex-row flex-md-column justify-content-center gap-2 mt-2 mt-md-0">
                            <a href="${cvLocation}" target="_blank" class="btn btn-action-pill btn-sm py-1 px-2 d-inline-flex align-items-center justify-content-center gap-1 w-100" style="font-size: 0.8rem;">
                                <i class="bi bi-download"></i> CV
                            </a>
                            <button class="btn btn-card-update btn-sm d-flex align-items-center justify-content-center gap-1 w-100" onclick="triggerUpdateModal('${item._id}')">
                                <i class="bi bi-pencil-square"></i> Edit
                            </button>
                            <button class="btn btn-card-delete btn-sm d-flex align-items-center justify-content-center gap-1 w-100" onclick="executeDeleteRoutine('${item._id}')">
                                <i class="bi bi-trash3"></i> Delete
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        `;
    }).join('');
}

/**
 * Native Search filter logic hook
 */
function filterProfilesInWorkspace(e) {
    const query = e.target.value.toLowerCase().trim();
    const cards = document.querySelectorAll('.data-alumna-search-unit');

    cards.forEach(card => {
        const searchPool = card.getAttribute('data-search-string');
        if (searchPool.includes(query)) {
            card.style.setProperty('display', 'block', 'important');
        } else {
            card.style.setProperty('display', 'none', 'important');
        }
    });
}

/**
 * Execute Mongoose Delete Routine Target via Controller Module
 */
async function executeDeleteRoutine(profileId) {
    if (!confirm("Are you sure you want to permanently delete this profile record?")) return;
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${CONFIG_API_BASE}/deleteprofile/${profileId}`, {
            method: 'DELETE',
            headers: { 
                'Authorization': `Bearer ${token}` 
            }
        });

        const outcome = await response.json();

        if (response.ok) {
            alert(outcome.message || "Profile successfully dropped.");
            fetchAlumnaeProfilesData(); // Hot refresh view panel state
        } else {
            alert(outcome.message || "Action restriction encountered.");
        }
    } catch(err) {
        console.error("Fatal exception firing profile delete payload sequence:", err);
    }
}

function triggerUpdateModal(profileId) {
    console.log(`Open edit lifecycle handler contextual context window for profile targeting index: ${profileId}`);
}

function logoutSession() {
    localStorage.removeItem('token');
    window.location.href = "login.html";
}