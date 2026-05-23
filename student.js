/**
 * CodeQueen Student Hub Controller Engine
 * Binds active profile states, toggles interactive tabs, and loads course resources
 */

const BACKEND_BASE_URL = 'http://localhost:5000';

document.addEventListener('DOMContentLoaded', async () => {
    // Check user session details before execution
    verifyUserAuthenticationState();

    // Initialize layout event configurations
    initNavigationDrawer();
    initInterfaceTabSwitcher();

    // Pull student workspace records from the server
    await fetchStudentWorkspaceData();
});

/**
 * Validates that the active session contains a valid JWT bearer token
 */
function verifyUserAuthenticationState() {
    const activeToken = localStorage.getItem('token');
    if (!activeToken) {
        // Redirect to entry login routing gateway if credentials are missing
        window.location.href = 'login.html';
    }

    document.getElementById('btnSignoutSession')?.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        window.location.href = 'login.html';
    });
}

function getRequestAuthHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    };
}

/**
 * Setup mobile side drawer responsive visibility toggles
 */
function initNavigationDrawer() {
    const drawerMenu = document.getElementById('sidebarMenu');
    const toggleButton = document.getElementById('mobileMenuToggle');

    toggleButton?.addEventListener('click', (e) => {
        e.stopPropagation();
        drawerMenu.classList.toggle('open');
    });

    // Close menu sidebar on outer mobile content press
    document.addEventListener('click', () => {
        drawerMenu.classList.remove('open');
    });

    // Handle seamless anchors for auto-scrolling navigation options
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.addEventListener('click', function(e) {
            document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
            this.classList.add('active');

            const targetSectionId = this.getAttribute('data-nav-target');
            const elementToScroll = document.getElementById(targetSectionId);
            
            if (elementToScroll) {
                e.preventDefault();
                elementToScroll.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

/**
 * Handles tab execution switching patterns
 */
function initInterfaceTabSwitcher() {
    const tabTriggers = document.querySelectorAll('.custom-tab-link');
    const tabPanes = document.querySelectorAll('.tab-pane-block');

    tabTriggers.forEach(btn => {
        btn.addEventListener('click', function() {
            tabTriggers.forEach(t => t.classList.remove('active'));
            tabPanes.forEach(p => {
                p.classList.remove('d-block');
                p.classList.add('d-none');
            });

            this.classList.add('active');
            const boundedPaneId = this.getAttribute('data-tab-target');
            const targetedPane = document.getElementById(boundedPaneId);
            
            if (targetedPane) {
                targetedPane.classList.remove('d-none');
                targetedPane.classList.add('d-block');
            }
        });
    });
}

/**
 * Gathers user metadata profiles, documents, and lists of council members
 */
async function fetchStudentWorkspaceData() {
    try {
        // Query route references mapped inside your server routes structure
        const response = await fetch(`${BACKEND_BASE_URL}/student/dashboard-summary`, {
            method: 'GET',
            headers: getRequestAuthHeaders()
        });

        if (!response.ok) {
            throw new Error(`Server execution query rejection code: ${response.status}`);
        }

        const dataPayload = await response.json();
        const payloadResult = dataPayload.result || dataPayload;

        // Hydrate UI elements with fetched data
        populateStudentProfileHeader(payloadResult.profile || payloadResult.user);
        renderDocumentsResourcesPane(payloadResult.resources || []);
        mapStaticPanelHyperlinks(payloadResult.links || {});
        hydrateStaffGridShowcase(payloadResult.leadership || [], 'gridLeadershipContainer', 'Member Name', 'Role / Position');
        hydrateStaffGridShowcase(payloadResult.facilitators || [], 'gridFacilitatorsContainer', 'Facilitator Name', 'Department / Area');

    } catch (error) {
        console.error("Critical ecosystem processing failure:", error);
        // Load secure development fallbacks if the endpoints are not yet fully configured
        injectDevelopmentMockData();
    }
}

/**
 * Hydrates upper canvas layout user properties
 */
function populateStudentProfileHeader(user) {
    if (!user) return;
    document.getElementById('displayStudentName').innerText = user.name || user.username || 'Active Queen';
    document.getElementById('displayStudentCohort').innerText = user.cohort || 'General Track';
    
    if (user.photoUrl) {
        const fullProfileUrl = user.photoUrl.startsWith('http') ? user.photoUrl : `${BACKEND_BASE_URL}${user.photoUrl}`;
        document.getElementById('displayStudentAvatar').src = fullProfileUrl;
    }
}

/**
 * Compiles files inside the layout wrapper cards element
 */
function renderDocumentsResourcesPane(documentsArray) {
    const container = document.getElementById('resourcesContainerList');
    container.innerHTML = '';

    if (documentsArray.length === 0) {
        container.innerHTML = `
            <div class="text-center py-4 text-muted small">
                <i class="fa-solid fa-box-open d-block mb-2 fa-2x"></i>
                No active resources shared with this cohort cohort track yet.
            </div>`;
        return;
    }

    documentsArray.forEach((doc, idx) => {
        const fullDownloadUrl = doc.fileUrl ? (doc.fileUrl.startsWith('http') ? doc.fileUrl : `${BACKEND_BASE_URL}${doc.fileUrl}`) : '#';
        const itemRow = document.createElement('div');
        itemRow.className = "document-download-row d-flex justify-content-between align-items-center shadow-sm";
        itemRow.innerHTML = `
            <div class="d-flex align-items-center gap-3">
                <div class="icon-doc-box">
                    <i class="fa-regular fa-file-lines"></i>
                </div>
                <div>
                    <span class="d-block fw-bold small text-dark">${doc.title || `Document ${idx + 1}`}</span>
                    <small class="text-muted text-uppercase font-monospace" style="font-size: 11px;">Resource Reference Attachment</small>
                </div>
            </div>
            <a href="${fullDownloadUrl}" download target="_blank" class="btn-cq-action-outline">
                Download <i class="fa-solid fa-download"></i>
            </a>
        `;
        container.appendChild(itemRow);
    });
}

/**
 * Maps static file location attributes across targeted navigation elements
 */
function mapStaticPanelHyperlinks(linksObject) {
    // Configures core curriculum file location paths
    const curriculumBtn = document.getElementById('linkViewCurriculum');
    if (curriculumBtn) curriculumBtn.href = linksObject.curriculumUrl || '#';

    // Configures live structural calendar targets
    const tabTimetableBtn = document.getElementById('linkViewTimetable');
    if (tabTimetableBtn) tabTimetableBtn.href = linksObject.timetableUrl || '#';

    // Excel spreadsheet visualization target map
    const excelViewBtn = document.getElementById('linkViewExcelFile');
    if (excelViewBtn) excelViewBtn.href = linksObject.excelFileUrl || '#';

    // General shortcut banner scheduling maps
    const standaloneTimetableBtn = document.getElementById('linkViewTimetableBanner');
    if (standaloneTimetableBtn) standaloneTimetableBtn.href = linksObject.timetableUrl || '#';
}

/**
 * Reusable layout processor for population grids
 */
function hydrateStaffGridShowcase(staffArray, containerId, defaultName, defaultRole) {
    const gridNode = document.getElementById(containerId);
    if (!gridNode) return;
    gridNode.innerHTML = '';

    if (staffArray.length === 0) {
        // Output fallback placeholders to preserve UI mock spacing symmetry safely
        for (let i = 1; i <= 4; i++) {
            gridNode.appendChild(createPlaceholderNodeItem(defaultName, defaultRole));
        }
        return;
    }

    staffArray.forEach(person => {
        const itemCol = document.createElement('div');
        itemCol.className = "col";
        
        let avatarMarkup = `<div class="team-member-avatar"><i class="fa-regular fa-user"></i></div>`;
        if (person.photoUrl) {
            const parsedUrl = person.photoUrl.startsWith('http') ? person.photoUrl : `${BACKEND_BASE_URL}${person.photoUrl}`;
            avatarMarkup = `<img src="${parsedUrl}" class="team-member-avatar" alt="Staff Portrait" onerror="this.innerHTML='<i class=fa-regular fa-user></i>'">`;
        }

        itemCol.innerHTML = `
            <div class="team-profile-node">
                ${avatarMarkup}
                <span class="d-block fw-bold small text-truncate text-dark">${person.name || defaultName}</span>
                <small class="text-muted d-block text-truncate" style="font-size: 11px;">${person.role || defaultRole}</small>
            </div>
        `;
        gridNode.appendChild(itemCol);
    });
}

function createPlaceholderNodeItem(nameLabel, roleLabel) {
    const wrapper = document.createElement('div');
    wrapper.className = "col";
    wrapper.innerHTML = `
        <div class="team-profile-node">
            <div class="team-member-avatar">
                <i class="fa-regular fa-user"></i>
            </div>
            <span class="d-block fw-bold small text-muted text-truncate">${nameLabel}</span>
            <small class="text-black-50 d-block text-truncate" style="font-size: 11px;">${roleLabel}</small>
        </div>`;
    return wrapper;
}

/**
 * Fallback initialization engine to populate UI state configurations immediately during system sandbox previews
 */
function injectDevelopmentMockData() {
    populateStudentProfileHeader({
        name: "Akello Sandra",
        cohort: "COGE11"
    });

    renderDocumentsResourcesPane([
        { title: "Document 1", fileUrl: "#" },
        { title: "Document 2", fileUrl: "#" },
        { title: "Document 3", fileUrl: "#" }
    ]);

    hydrateStaffGridShowcase([], 'gridLeadershipContainer', 'Member Name', 'Role / Position');
    hydrateStaffGridShowcase([], 'gridFacilitatorsContainer', 'Facilitator Name', 'Department / Area');
}