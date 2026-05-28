// Centralized API Configuration Base Endpoint Path
const ENDPOINT_API_BASE = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://cq-a-bckd.onrender.com'; // Production live Render URL

// Memory layout context variables state arrays matching registry schemas
let activeCohortsDirectoryCache = [];
let selectedCohortIdentifierRef = null;

document.addEventListener('DOMContentLoaded', () => {
    // Mobilized Responsive Panel Action Drawer Binding Handlers Configuration
    initResponsiveMobileDrawer();

    // Pull database instances collection arrays context to display rows list index metrics
    fetchActiveSystemCohortsCatalog();
});

/**
 * Mobile responsive layout toggles setup
 */
function initResponsiveMobileDrawer() {
    const mobileBtn = document.getElementById('mobile-sidebar-toggle');
    const drawerMenu = document.getElementById('app-sidebar');
    if (mobileBtn && drawerMenu) {
        mobileBtn.addEventListener('click', () => {
            drawerMenu.classList.toggle('show-sidebar');
        });
    }
}

/**
 * Switcher system routing layout display visibility boxes inside control deck spaces panels
 */
function switchRightWorkspaceTab(tabId, trackingElementNode) {
    // Strip layout visibility states across targeted tracking panels layers arrays
    document.querySelectorAll('.workspace-tab-panel').forEach(pane => {
        pane.classList.add('d-none');
    });
    document.querySelectorAll('.cohort-action-btn').forEach(btn => {
        btn.classList.remove('active-tab');
    });

    // Unveil targeting workspace view components
    const targetBox = document.getElementById(`tab-pane-${tabId}`);
    if (targetBox) targetBox.classList.remove('d-none');

    if (trackingElementNode) {
        trackingElementNode.classList.add('active-tab');
    }
}

/**
 * Syncs up backend records dataset arrays matching created storage entity structures rows
 */
// Syncs up backend records dataset arrays

async function fetchActiveSystemCohortsCatalog() {
    try {
        const response = await fetch(`${ENDPOINT_API_BASE}/cohort/getallcohorts`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        if (response.ok) {
            // The controller now sends a clean array [{}, {}]
            activeCohortsDirectoryCache = await response.json();
            renderCohortCatalogRows(activeCohortsDirectoryCache);
            populateCohortSelectionDropdownOptions(activeCohortsDirectoryCache);
        } else {
            renderMockFallbackCohortMatrixData();
        }
    } catch (err) {
        console.error("API Error:", err);
        renderMockFallbackCohortMatrixData();
    }
}
/**
 * Maps collections elements properties to build catalog structural item block loops
 */
function renderCohortCatalogRows(cohorts) {
    const container = document.getElementById('cohorts-master-index-list');
    if (!container) return;

    if (cohorts.length === 0) {
        container.innerHTML = '<div class="text-center text-muted py-4 small">No active cohort entries found.</div>';
        return;
    }

    container.innerHTML = '';
    cohorts.forEach(cohort => {
        const id = cohort._id || cohort.id;
        const rowNode = document.createElement('div');
        rowNode.className = `cohort-list-item ${selectedCohortIdentifierRef === id ? 'selected-item' : ''}`;
        rowNode.id = `cohort-entity-row-${id}`;
        
        rowNode.innerHTML = `
            <div class="fw-bold text-dark d-flex align-items-center gap-2">
                <i class="bi bi-folder-symlink text-warning"></i>
                <span>${cohort.name}</span>
            </div>
            <i class="bi bi-x-circle delete-cohort-icon" title="Purge Cohort Record" onclick="executeCohortDeletionPipeline(event, '${id}')"></i>
        `;

        // Interactive switch hook capture row tracking parameters selection metrics
        rowNode.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-cohort-icon')) return; // Avoid bubbled event path traps
            
            document.querySelectorAll('.cohort-list-item').forEach(r => r.classList.remove('selected-item'));
            rowNode.classList.add('selected-item');
            
            selectedCohortIdentifierRef = id;
            switchRightWorkspaceTab('view-cohort', document.querySelector('[onclick*="view-cohort"]'));
            fetchCohortContextualProfile(cohort);
        });

        container.appendChild(rowNode);
    });
}

/**
 * Queries target contextual member rosters linked specifically to chosen category path keys entries data maps
 */
// * Handles single cohort view
//  */
async function fetchCohortContextualProfile(cohortObject) {
    const frame = document.getElementById('cohort-data-profile-viewframe');
    const id = cohortObject._id || cohortObject.id;

    try {
        // FIXED: Route changed from /cohorts/ to /cohort/ to match your backend
        const response = await fetch(`${ENDPOINT_API_BASE}/cohort/getsinglecohort/${id}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        if (response.ok) {
            const dataResult = await response.json();
            renderCohortDetailsTemplateCard(dataResult, dataResult.students || []);
        }
    } catch (err) {
        console.warn("Could not fetch real profile, using cached data.");
        renderCohortDetailsTemplateCard(cohortObject, []);
    }
}
/**
 * Displays user roster elements and metadata details block metrics inside wireframe target frames
 */
function renderCohortDetailsTemplateCard(cohort, studentArray) {
    const frame = document.getElementById('cohort-data-profile-viewframe');
    if (!frame) return;

    // Convert raw ISO string properties into localized typography parameters formats definitions
    let displayGradDate = 'Not Scheduled';
    if (cohort.graduationYear) {
        const dateObj = new Date(cohort.graduationYear);
        displayGradDate = !isNaN(dateObj) ? dateObj.toLocaleDateString('en-GB') : cohort.graduationYear;
    }

    let studentsListMarkup = '';
    if (!studentArray || studentArray.length === 0) {
        studentsListMarkup = '<li class="text-muted small italic">No students allocated yet to this cohort class path.</li>';
    } else {
        studentArray.forEach(st => {
            studentsListMarkup += `<li class="mb-1 text-dark fw-medium small"><i class="bi bi-circle-fill text-warning me-2" style="font-size:0.5rem;"></i>${st.name || st.username}</li>`;
        });
    }

    frame.innerHTML = `
        <div class="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
            <h4 class="fw-bold text-clay mb-0" style="font-family: inherit;">${cohort.name}</h4>
        </div>
        <div class="row g-3 mb-4 text-dark">
            <div class="col-6 col-sm-3">
                <small class="text-muted d-block text-uppercase fw-bold" style="font-size:0.7rem;">ID Reference:</small>
                <span class="fw-semibold small text-truncate d-block">${cohort._id || cohort.id || 'N/A'}</span>
            </div>
            <div class="col-6 col-sm-3">
                <small class="text-muted d-block text-uppercase fw-bold" style="font-size:0.7rem;">Count Status:</small>
                <span class="fw-bold text-clay">${studentArray ? studentArray.length : 0} Members</span>
            </div>
            <div class="col-6 col-sm-3">
                <small class="text-muted d-block text-uppercase fw-bold" style="font-size:0.7rem;">Year:</small>
                <span class="fw-semibold text-dark">${cohort.year || '2026'}</span>
            </div>
            <div class="col-6 col-sm-3">
                <small class="text-muted d-block text-uppercase fw-bold" style="font-size:0.7rem;">Graduation:</small>
                <span class="fw-bold text-warning" style="font-size:0.9rem;">${displayGradDate}</span>
            </div>
        </div>
        <div>
            <h6 class="fw-bold text-muted text-uppercase tracking-wider small mb-2"><i class="bi bi-mortarboard text-clay me-1"></i> Students Directory</h6>
            <ul class="list-unstyled ps-1">
                ${studentsListMarkup}
            </ul>
        </div>
    `;
}

/**
 * Post handler tracking database integration actions to create a new cohort context storage record
 */
async function executeCohortCreationPipeline(event) {
    event.preventDefault();
    
    const payload = {
        cohortname: document.getElementById('new-cohort-name-field').value.trim(),
        year: document.getElementById('new-cohort-year-field').value,
        graduationYear: document.getElementById('new-cohort-grad-field').value // Returns "YYYY-MM-DD"
    };

    try {
        const response = await fetch(`${ENDPOINT_API_BASE}/cohort/createcohort`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert('Cohort created successfully!');
            document.getElementById('form-create-cohort-record').reset();
            fetchActiveSystemCohortsCatalog();
        } else {
            const err = await response.json();
            alert(`Error: ${err.message}`);
        }
    } catch (err) {
        alert('Network error connecting to the server.');
    }
};
/**
 * Handles account creations and tracking operations routing paths directly into the users architecture models stack layers
 */
async function executeStudentRegistrationPipeline(event) {
    event.preventDefault();
    
    // 1. Capture the raw input values
    const cohortTargetName = document.getElementById('assign-student-cohort-select').value;
    const nameInput = document.getElementById('student-register-name').value.trim();
    const emailInput = document.getElementById('student-register-email').value.trim();
    const roleInput = document.getElementById('student-register-role').value;

    // 2. Adjust keys to match the backend controller's destructuring:
    // Backend expects: { username, email, password, confirmPassword, role, cohort }
    const registrationFormPayload = { //the payload names have to match with the backend.
        username: nameInput,        // Changed from 'name' to 'username'
        email: emailInput,
        cohort: cohortTargetName, 
        role: roleInput,
        password: "DefaultCQStudentPass123!",
        confirmPassword: "DefaultCQStudentPass123!",
        isMentor: false,            // Added explicit defaults for safety
        isAdmin: false,
        isleader: false
    };

    try {
        const response = await fetch(`${ENDPOINT_API_BASE}/users/register`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(registrationFormPayload)
        });

        const responseData = await response.json();

        if (response.ok) {
            alert(`Account created successfully! ${nameInput} is now part of Cohort ${cohortTargetName}.`);
            document.getElementById('form-register-assign-student').reset();
            
            // Refresh data views
            fetchActiveSystemCohortsCatalog();
            switchRightWorkspaceTab('view-cohort', document.querySelector('[onclick*="view-cohort"]'));
        } else {
            // Display the specific error message from your backend (e.g., "Email already belongs to user")
            alert(`Registration Error: ${responseData.message}`);
        }
    } catch (err) {
        console.error('Network/Connection Error:', err);
        alert('Failed to connect to the server. Please ensure the backend is running.');
    }
}
/**
 * Destructive row array pruning transaction pipeline executions commands routing routines configuration
 */
async function executeCohortDeletionPipeline(event, cohortId) {
    event.stopPropagation(); // Shield action triggers against event bubbling collision traps paths
    if (!confirm('Are you entirely confident you want to delete this cohort schema entry record permanently from database registers data streams catalogs maps layers?')) return;

    try {
        // Connected using ENDPOINT_API_BASE pointing to deletecohort endpoint
        const response = await fetch(`${ENDPOINT_API_BASE}/cohort/deletecohort/${cohortId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        if (response.ok) {
            alert('Cohort metadata entry purged and cleaned from ecosystem records catalog files clusters paths.');
            fetchActiveSystemCohortsCatalog();
        } else {
            alert('Destruction sequence command intercepted and dropped by controller network security check parameters.');
        }
    } catch (err) {
        activeCohortsDirectoryCache = activeCohortsDirectoryCache.filter(c => (c._id || c.id) !== cohortId);
        renderCohortCatalogRows(activeCohortsDirectoryCache);
        populateCohortSelectionDropdownOptions(activeCohortsDirectoryCache);
    }
}

/**
 * Hydrates selection controls parameters targeting mapping link structures elements fields properties hooks
 */
function populateCohortSelectionDropdownOptions(cohorts) {
    const selectorNode = document.getElementById('assign-student-cohort-select');
    if (!selectorNode) return;

    // Clean existing layout items except baseline anchor option container row mapping element
    selectorNode.innerHTML = '<option value="">Choose cohort matrix path...</option>';

    cohorts.forEach(c => {
        const optionElement = document.createElement('option');
        optionElement.value = c.name; 
        optionElement.textContent = c.name;
        selectorNode.appendChild(optionElement);
    });
}

/**
 * Mock Simulation Data Pipeline Subsystem Elements Assemblies Generators Engine Block
 */
function renderMockFallbackCohortMatrixData() {
    const mockCohorts = [
        { id: 'ch14', name: 'Cohort 14', year: 2026, graduationYear: '2026-11-20' },
        { id: 'ch13', name: 'Cohort 13', year: 2025, graduationYear: '2026-01-05' },
        { id: 'ch12', name: 'Cohort 12', year: 2025, graduationYear: '2025-07-15' },
        { id: 'ch11', name: 'Cohort 11', year: 2024, graduationYear: '2024-12-10' }
    ];
    activeCohortsDirectoryCache = mockCohorts;
    renderCohortCatalogRows(mockCohorts);
    populateCohortSelectionDropdownOptions(mockCohorts);
}

function getMockStudentsSubArray(cohortName) {
    const databaseMockDictionary = {
        'Cohort 14': [{ name: 'Nsubuga Brenda' }, { name: 'Nakato Sarah' }],
        'Cohort 13': [{ name: 'Jane Rue' }, { name: 'Alex Mahuz' }, { name: 'Abigella Kin' }],
        'Cohort 12': [{ name: 'Faith Nabwire' }, { name: 'Vancy Alumna' }],
        'Cohort 11': [{ name: 'Nakato Rose' }, { name: 'Sserungonj Joan Eve' }]
    };
    return databaseMockDictionary[cohortName] || [{ name: 'Anonymous Student Record' }];
}