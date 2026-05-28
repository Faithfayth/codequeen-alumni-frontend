/**
 * CodeQueen Alumnae Profiles Directory - Reader Client Engine
 */
const API_BASE_URL = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://cq-a-bckd.onrender.com'; // Production live Render URL
const CONFIG_API_BASE = `${API_BASE_URL}/profiles`;

document.addEventListener('DOMContentLoaded', () => {
    const storedToken = localStorage.getItem('token');
    const cachedUserData = localStorage.getItem('user');

    if (!storedToken || !cachedUserData) {
        console.warn("Session parameters missing. Relocating to login portal...");
        window.location.href = 'login.html';
        return;
    }

    const parsedUserObj = JSON.parse(cachedUserData);

    // 1. Setup role-specific dynamic navigation blueprints
    injectDynamicRoleSidebar(parsedUserObj);

    // 2. Bind mobile layout triggers
    initLayoutNavigationSwitches();

    // 3. Collect read-only database datasets
    fetchAlumnaeProfilesData(storedToken);

    // 4. Attach searching events listener
    const searchBar = document.getElementById('profileQuerySearch');
    if (searchBar) {
        searchBar.addEventListener('input', filterProfilesInWorkspace);
    }
});

/**
 * Renders corresponding structural navigation view matching user roles
 */
function injectDynamicRoleSidebar(userObj) {
    const renderMountPoint = document.getElementById('sidebar-injection-target');
    if (!renderMountPoint) return;

    const userRole = userObj.role ? userObj.role.toLowerCase() : 'alumna';
    let sidebarHtmlMarkup = '';

    if (userRole === 'partner') {
        // Partner Administrative Subspace Menu Map Configuration
        sidebarHtmlMarkup = `
        <nav class="sidebar-wrapper" id="sidebarMenu">
            <div>
                <div class="sidebar-brand">
                    <h4 class="m-0 text-white fw-bold text-uppercase">CodeQueen</h4>
                    <small class="text-white-50">Alumni Administrative Space</small>
                </div>
                <ul class="sidebar-menu">
                    <li><a href="partner-dashboard.html" class="sidebar-link"><i class="fa-solid fa-house"></i> HOME</a></li>
                    <li><a href="alumniProfiles.html" class="sidebar-link active"><i class="fa-solid fa-user-graduate"></i> Alumna Profiles</a></li>
                    <li><a href="projects.html" class="sidebar-link"><i class="fa-solid fa-laptop-code"></i> Community Projects</a></li>
                    <li><a href="achievements.html" class="sidebar-link"><i class="fa-solid fa-trophy"></i> Achievements</a></li>
                    <li><a href="partners.html" class="sidebar-link"><i class="fa-solid fa-handshake"></i> Other partners</a></li>
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
        // Alumna/Student Ecosystem Hub Standard View Layout Map Configuration
        sidebarHtmlMarkup = `
        <nav class="sidebar-wrapper" id="sidebarMenu">
            <div>
                <div class="sidebar-brand">
                    <h4 class="m-0 text-white fw-bold text-uppercase">CodeQueen</h4>
                    <small class="text-white-50">Alumni Ecosystem Hub</small>
                </div>
                <ul class="sidebar-menu">
                    <li><a href="alumni.html" class="sidebar-link"><i class="bi bi-house-door"></i> HOME</a></li>
                    <li><a href="profiles.html" class="sidebar-link active"><i class="bi bi-person"></i> Profiles</a></li>
                    <li><a href="gallery.html" class="sidebar-link"><i class="bi bi-image"></i> Gallery</a></li>
                    <li><a href="resources.html" class="sidebar-link"><i class="bi bi-folder"></i> Resources</a></li>
                    <li><a href="projects.html" class="sidebar-link"><i class="bi bi-briefcase"></i> Projects</a></li>
                    <li><a href="achievements.html" class="sidebar-link"><i class="bi bi-award"></i> Achievements</a></li>
                    <li><a href="wall.html" class="sidebar-link"><i class="bi bi-star"></i> Wall of fame</a></li>
                    <li><a href="partners.html" class="sidebar-link"><i class="bi bi-building"></i> Partners</a></li>
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

    // Attach immediate signout trigger hooks
    const signoutButton = document.getElementById('btnSidebarSignout');
    if (signoutButton) {
        signoutButton.addEventListener('click', logoutSession);
    }
}

/**
 * Handle Mobile Drawer Canvas Toggles
 */
function initLayoutNavigationSwitches() {
    const openBtn = document.getElementById('open-sidebar-trigger');
    const sidebar = document.getElementById('sidebarMenu');

    if (openBtn && sidebar) {
        openBtn.addEventListener('click', () => {
            sidebar.classList.add('show-sidebar');
        });
    }

    // Dismiss drawer panel when clicking outside structural limits
    document.addEventListener('click', (event) => {
        if (sidebar && sidebar.classList.contains('show-sidebar')) {
            if (!sidebar.contains(event.target) && !openBtn.contains(event.target)) {
                sidebar.classList.remove('show-sidebar');
            }
        }
    });
}

/**
 * Pull and access system collections records through standard read actions
 */
async function fetchAlumnaeProfilesData(token) {
    const container = document.getElementById('profilesRenderContainer');
    const spinner = document.getElementById('loadingStatusSpinner');

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
        console.error("Profile extraction pipeline breakdown: ", err);
        if (spinner) spinner.classList.add('d-none');
        if (container) {
            container.innerHTML = `
                <div class="alert alert-danger mx-auto mt-4 text-center" style="max-width: 500px;">
                    <i class="bi bi-exclamation-triangle-fill me-2"></i> Error establishing connection stream to the Alumnae directory.
                </div>`;
        }
    }
}

/**
 * Render read-only components dynamically. Action updates options are completely removed.
 */
function renderAlumnaeProfileGrid(profiles) {
    const container = document.getElementById('profilesRenderContainer');
    if (!container) return;

    if (!profiles || profiles.length === 0) {
        container.innerHTML = `<p class="text-muted text-center py-5">No active alumnae profiles found inside the directory.</p>`;
        return;
    }

    container.innerHTML = profiles.map(item => {
        const name = item.fullname || 'Anonymous Alumna';
        const cohort = item.cohort || item.cohortName || 'Unknown Cohort';
        const bio = item.bio || 'No career bio provided yet.';
        const portfolio = item.portfoliolink || '';
        const avatar = item.profileimage || 'https://placehold.co/90?text=Queen';
        const cvLocation = item.cvUrl && item.cvUrl !== '#' ? item.cvUrl : '';
        
        const skills = Array.isArray(item.skills) ? item.skills.join(', ') : (item.skills || 'General Technologies');

        // Badges mapping arrays logic loops
        let badgeElements = '';
        for (let i = 0; i < 4; i++) {
            if (item.badges && item.badges[i]) {
                badgeElements += `<div class="badge-slot-box" title="Awarded Token"><i class="bi bi-award text-warning"></i></div>`;
            } else {
                badgeElements += `<div class="badge-slot-box"><i class="bi bi-dash text-muted opacity-25"></i></div>`;
            }
        }

        // Construct search target data matrices
        const dataSearchPool = `${name.toLowerCase()} ${skills.toLowerCase()}`;

        return `
            <div class="profile-entry-card data-alumna-search-unit" data-search-string="${dataSearchPool}">
                <div class="row g-3 align-items-center">
                    
                    <div class="col-12 col-md-3 col-lg-2 profile-avatar-wrapper border-end border-md-light">
                        <img src="${avatar}" alt="${name}" class="profile-avatar-circle"
                             onerror="this.onerror=null; this.src='https://placehold.co/90?text=Queen';">
                        <div class="badge-grid-container mt-2">${badgeElements}</div>
                    </div>

                    <div class="col-12 col-md-6 col-lg-8">
                        <div class="px-md-2">
                            <div class="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
                                <h6 class="fw-bold m-0 text-dark" style="font-size: 1.05rem;">${name}</h6>
                                <span class="badge bg-light text-secondary border px-2 py-1 rounded-pill" style="font-size: 0.75rem;">Verified Alumna</span>
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
                                    ${portfolio ? `<a href="${portfolio}" target="_blank" class="text-decoration-none fw-semibold d-inline-flex align-items-center gap-1" style="color: var(--cq-gold-bg); font-size: 0.9rem;">${portfolio} <i class="bi bi-box-arrow-up-right" style="font-size:11px;"></i></a>` : '<span class="text-muted small italic">No URL portfolio shared</span>'}
                                </div>
                            </div>

                            <div class="data-display-row mb-0">
                                <div class="data-display-label">Skills :</div>
                                <div class="w-100">
                                    <input type="text" class="data-static-line-input" value="${skills}" readonly>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col-12 col-md-3 col-lg-2 text-md-end">
                        <div class="d-flex flex-row flex-md-column justify-content-center gap-2 mt-2 mt-md-0">
                            ${portfolio ? `
                            <a href="${portfolio}" target="_blank" class="btn btn-action-pill btn-sm py-2 px-2 d-inline-flex align-items-center justify-content-center gap-1 w-100" style="font-size: 0.85rem;">
                                <i class="bi bi-file-earmark-pdf"></i> View Portfolio
                            </a>` : `
                            <button class="btn btn-light btn-sm py-2 px-2 text-muted w-100" style="font-size: 0.85rem;" disabled>
                                <i class="bi bi-file-earmark-x"></i> No CV Shared
                            </button>`}
                        </div>
                    </div>

                </div>
            </div>
        `;
    }).join('');
}

/**
 * Filter profile system records locally
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

function logoutSession() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = "login.html";
}