/**
 * Admin Enrollment Tracker Controller & Interaction Logic Framework Engine
 * Interacts directly with enrollment endpoints, validating state synchronization changes
 */

// Global volatile active memory matrix variables cache rows layout parameters structures
let trackingEnrollmentRegistryCache = [];
let operationalActiveQueryFilterState = 'all';

document.addEventListener('DOMContentLoaded', () => {
    // Mobilize navigation responsive handler binding contexts setup
    initResponsiveMobileToggle();

    // Pull database matrices structures pipelines configurations arrays
    fetchMasterEnrollmentTrackerRecords();
});

/**
 * Mobile navigation setup
 */
function initResponsiveMobileToggle() {
    const triggerBtn = document.getElementById('mobile-sidebar-toggle');
    const sidebarContainer = document.getElementById('app-sidebar');
    if (triggerBtn && sidebarContainer) {
        triggerBtn.addEventListener('click', () => {
            sidebarContainer.classList.toggle('show-sidebar');
        });
    }
}

/**
 * Pull entries data streams directly across assigned controller collection models routers paths
 */
async function fetchMasterEnrollmentTrackerRecords() {
    try {
        const response = await fetch('/api/enrollments', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        if (response.ok) {
            trackingEnrollmentRegistryCache = await response.json();
            renderEnrollmentMatrixGridTable(trackingEnrollmentRegistryCache);
            populatePendingProjectsValidationCards(trackingEnrollmentRegistryCache);
        } else {
            renderMockFallbackTrackerMatrixSchema();
        }
    } catch (err) {
        console.warn('API connection faulted across paths /api/enrollments. Failsafe mock sequence activated safely.');
        renderMockFallbackTrackerMatrixSchema();
    }
}

/**
 * Builds table grid element rows structures iteratively into DOM workspace elements structures view
 */
function renderEnrollmentMatrixGridTable(recordsList) {
    const tbody = document.getElementById('enrollment-matrix-body-rows');
    if (!tbody) return;

    if (recordsList.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4 small">No matching student enrollment records exist in current scope views.</td></tr>`;
        return;
    }

    tbody.innerHTML = '';
    recordsList.forEach(record => {
        const recordId = record._id || record.id;
        const studentName = record.studentName || (record.studentId ? record.studentId.name : 'Unknown Alumna');
        const userIdToken = record.userIdSymbol || (record.studentId ? record.studentId._id : '000X00');
        const cohortLabel = record.cohortCode || record.cohortId || 'COGE11';

        // Evaluate evaluation markers states properties targets assertions rules parameters configurations
        const isAttending = record.attendance === true || record.attendance === 'Passed';
        const isProjectDone = record.projectStatus === true || record.projectStatus === 'Approved';
        const isGraduated = record.graduateStatus === true || record.graduateStatus === 'Confirmed';

        const rowHTML = `
            <tr id="tracker-row-node-${recordId}">
                <td class="fw-bold text-dark">${studentName}</td>
                <td class="text-muted small">${userIdToken.substring(0, 7).toUpperCase()}</td>
                <td class="fw-medium text-secondary">${cohortLabel}</td>
                
                <td class="text-center">
                    <div class="d-inline-flex gap-1">
                        <button class="status-toggle-btn ${isAttending ? 'state-active' : ''}" onclick="executeUpdateMetricState('${recordId}', 'attendance', true)">✓</button>
                        <button class="status-toggle-btn btn-reject ${!isAttending ? 'state-active' : ''}" onclick="executeUpdateMetricState('${recordId}', 'attendance', false)">✕</button>
                    </div>
                </td>

                <td class="text-center">
                    <div class="d-inline-flex gap-1">
                        <button class="status-toggle-btn ${isProjectDone ? 'state-active' : ''}" onclick="executeUpdateMetricState('${recordId}', 'project', true)">✓</button>
                        <button class="status-toggle-btn btn-reject ${!isProjectDone ? 'state-active' : ''}" onclick="executeUpdateMetricState('${recordId}', 'project', false)">✕</button>
                    </div>
                </td>

                <td class="text-center">
                    <div class="d-inline-flex gap-1">
                        <button class="status-toggle-btn ${isGraduated ? 'state-active' : ''}" onclick="executeUpdateMetricState('${recordId}', 'graduate', true)">✓</button>
                        <button class="status-toggle-btn btn-reject ${!isGraduated ? 'state-active' : ''}" onclick="executeUpdateMetricState('${recordId}', 'graduate', false)">✕</button>
                    </div>
                </td>
            </tr>`;
        tbody.insertAdjacentHTML('beforeend', rowHTML);
    });
}

/**
 * Filter items selectively across submission structures to extract incomplete project configurations files
 */
function populatePendingProjectsValidationCards(records) {
    const listContainer = document.getElementById('pending-projects-wrapper-list');
    if (!listContainer) return;

    // Filter down array targeting explicitly elements containing pending files structures
    const pendingItems = records.filter(r => r.projectStatus === 'Pending' || r.hasPendingSubmission === true);

    if (pendingItems.length === 0) {
        listContainer.innerHTML = '<div class="text-center text-muted py-4 small">No project items currently awaiting validation clearance metrics.</div>';
        return;
    }

    listContainer.innerHTML = '';
    pendingItems.forEach(item => {
        const id = item._id || item.id;
        const studentName = item.studentName || 'Jane Student';
        const projectTitle = item.projectTitleSubmit || 'Web Application Development Task';
        const projectUrl = item.projectUrlSubmit || 'Url to project repository';

        const panelCardNode = `
            <div class="inner-item-bubble d-flex flex-column gap-2" id="pending-item-card-${id}">
                <div class="d-flex justify-content-between align-items-start">
                    <span class="fw-bold text-dark small"># ${studentName}</span>
                    <div class="bg-white px-3 py-2 rounded border shadow-sm flex-grow-1 ms-3">
                        <div class="fw-bold text-dark small mb-0">${projectTitle}</div>
                        <small class="text-muted text-truncate d-block" style="font-size:0.75rem;">${projectUrl}</small>
                    </div>
                </div>
                <div class="d-flex justify-content-end gap-2 pt-1 border-top border-light border-opacity-10">
                    <button class="status-toggle-btn px-3 py-1 fw-bold" onclick="executeApproveProjectDirectly('${id}', true)">✓</button>
                    <button class="status-toggle-btn btn-reject px-3 py-1 fw-bold" onclick="executeApproveProjectDirectly('${id}', false)">✕</button>
                </div>
            </div>`;
        listContainer.insertAdjacentHTML('beforeend', panelCardNode);
    });
}

/**
 * Push mutation metric transformations down to database controllers pipelines systematically
 */
async function executeUpdateMetricState(recordId, categoryKey, flagValue) {
    // Find item context index position rows elements configurations properties matches definitions flags
    const recordItem = trackingEnrollmentRegistryCache.find(r => (r._id || r.id) === recordId);
    if (!recordItem) return;

    // Map mutations properties changes parameters structures schemas expectations requirements
    const payload = {
        metricField: categoryKey, // 'attendance', 'project', 'graduate'
        statusValue: flagValue // true or false assertion metrics
    };

    try {
        const response = await fetch(`/api/enrollments/update-status/${recordId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            // Update cache arrays model definitions safely locally inside workspace view configurations elements rows
            if (categoryKey === 'attendance') recordItem.attendance = flagValue;
            if (categoryKey === 'project') recordItem.projectStatus = flagValue ? 'Approved' : 'Failed';
            if (categoryKey === 'graduate') recordItem.graduateStatus = flagValue ? 'Confirmed' : 'Pending';

            // Re-render dataset matrix framework maps
            executeClientSideRosterFilter();
        } else {
            alert('Status amendment rejected by network server storage layers configuration guidelines.');
        }
    } catch (err) {
        // Fallback simulation layout update loop track execution routines
        console.log('Local Sandbox Matrix configuration processing simulation update step.');
        if (categoryKey === 'attendance') recordItem.attendance = flagValue;
        if (categoryKey === 'project') recordItem.projectStatus = flagValue ? 'Approved' : 'Failed';
        if (categoryKey === 'graduate') recordItem.graduateStatus = flagValue ? 'Confirmed' : 'Pending';
        
        executeClientSideRosterFilter();
    }
}

/**
 * Special handler mutation pathway managing processing actions routing across lower-left submission panels cards
 */
async function executeApproveProjectDirectly(recordId, isApproved) {
    try {
        const response = await fetch(`/api/enrollments/approve-project/${recordId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ approved: isApproved })
        });

        if (response.ok) {
            alert('Project deployment entry authorization verified cleanly.');
            fetchMasterEnrollmentTrackerRecords();
        } else {
            executeLocalProjectApprovalSimulation(recordId, isApproved);
        }
    } catch (err) {
        executeLocalProjectApprovalSimulation(recordId, isApproved);
    }
}

function executeLocalProjectApprovalSimulation(id, isApproved) {
    const item = trackingEnrollmentRegistryCache.find(r => (r._id || r.id) === id);
    if (item) {
        item.projectStatus = isApproved ? 'Approved' : 'Failed';
        item.hasPendingSubmission = false;
    }
    populatePendingProjectsValidationCards(trackingEnrollmentRegistryCache);
    executeClientSideRosterFilter();
}

/**
 * Filter operational management driver handling switching structural views parameters state filtering metrics definitions
 */
function applyStructuralStateFilter(filterMode, controlElementNode) {
    operationalActiveQueryFilterState = filterMode;

    document.querySelectorAll('.filter-pill-btn').forEach(btn => {
        btn.classList.remove('pill-active');
    });
    if (controlElementNode) {
        controlElementNode.classList.add('pill-active');
    }

    executeClientSideRosterFilter();
}

/**
 * Computes sorting and text match extractions on active datastores cache streams
 */
function executeClientSideRosterFilter() {
    const textQuery = document.getElementById('tracker-search-input').value.toLowerCase().trim();
    
    let runtimeFilteredArray = [...trackingEnrollmentRegistryCache];

    // Stage 1: Process Category Structural Context Filtering Modes Parameters Rules
    if (operationalActiveQueryFilterState === 'cohort') {
        // Sort items by grouping allocations keys tracking values tags fields parameters matches
        runtimeFilteredArray.sort((a, b) => (a.cohortCode || '').localeCompare(b.cohortCode || ''));
    } else if (operationalActiveQueryFilterState === 'attendance-low') {
        runtimeFilteredArray = runtimeFilteredArray.filter(r => r.attendance === false || r.attendanceScore < 75);
    } else if (operationalActiveQueryFilterState === 'project-pending') {
        runtimeFilteredArray = runtimeFilteredArray.filter(r => r.projectStatus === 'Pending' || r.hasPendingSubmission === true);
    } else if (operationalActiveQueryFilterState === 'graduated') {
        runtimeFilteredArray = runtimeFilteredArray.filter(r => r.graduateStatus === true || r.graduateStatus === 'Confirmed');
    }

    // Stage 2: Process Text Search Queries Match Assertions Elements
    if (textQuery.length > 0) {
        runtimeFilteredArray = runtimeFilteredArray.filter(record => {
            const name = (record.studentName || '').toLowerCase();
            const idToken = (record.userIdSymbol || '').toLowerCase();
            const chCode = (record.cohortCode || '').toLowerCase();
            return name.includes(textQuery) || idToken.includes(textQuery) || chCode.includes(textQuery);
        });
    }

    renderEnrollmentMatrixGridTable(runtimeFilteredArray);
}

/**
 * Design Fallback Engine Layer Structuring Visual Mock Indicators Setup Pipelines
 */
function renderMockFallbackTrackerMatrixSchema() {
    const mockRegistry = [
        { id: 'en01', studentName: 'Jane', userIdSymbol: '007A4E', cohortCode: 'COGE11', attendance: true, projectStatus: 'Approved', graduateStatus: 'Confirmed', hasPendingSubmission: false },
        { id: 'en02', studentName: 'Rose', userIdSymbol: '012B5A', cohortCode: 'COGE11', attendance: true, projectStatus: 'Pending', graduateStatus: 'Pending', hasPendingSubmission: true, projectTitleSubmit: 'Web Application.', projectUrlSubmit: 'Url to project' },
        { id: 'en03', studentName: 'Sarah', userIdSymbol: '095C2B', cohortCode: 'COGE14', attendance: false, projectStatus: 'Failed', graduateStatus: 'Pending', attendanceScore: 62, hasPendingSubmission: false },
        { id: 'en04', studentName: 'Laura', userIdSymbol: '034F9D', cohortCode: 'COGE12', attendance: true, projectStatus: 'Pending', graduateStatus: 'Pending', hasPendingSubmission: true, projectTitleSubmit: 'Mobile Application.', projectUrlSubmit: 'Url to project' }
    ];

    trackingEnrollmentRegistryCache = mockRegistry;
    renderEnrollmentMatrixGridTable(mockRegistry);
    populatePendingProjectsValidationCards(mockRegistry);
}