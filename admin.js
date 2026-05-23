/**
 * Admin Dashboard System Controller Architecture File
 * CodeQueen Alumnae Platform Core Management Layer
 */

// Active state reference for monitoring selected execution pipeline context queues
let currentApprovalContext = 'enrollments';

// System Gateway URI Base Constant matching your unified Node.js router ports
const ENDPOINT_API_BASE = 'http://localhost:5000';

document.addEventListener('DOMContentLoaded', () => {
    // Mobilized Responsive Interface Display Trigger Registration Hooks
    initMobileSidebarNavigation();
    
    // Identity Profile Registration Hydration Routines Execution Block
    hydrateAdminSessionIdentity();

    // Data Counters Pipeline Ingestion Metrics Hydration Execution Run
    fetchDashboardMetricCounters();

    // Initialize Default View Rendering State Engine for Approvals Container
    loadPendingApprovalsQueue(currentApprovalContext);
});

/**
 * Responsive Window Header Sidebar Viewport Layout Drawer State Controllers
 */
function initMobileSidebarNavigation() {
    const sidebarElement = document.getElementById('app-navigation-sidebar-container');
    const openTrigger = document.getElementById('sidebar-open-toggle-trigger');
    const closeTrigger = document.getElementById('sidebar-close-toggle-trigger');

    if (openTrigger && sidebarElement) {
        openTrigger.addEventListener('click', () => {
            sidebarElement.classList.add('show-sidebar');
        });
    }

    if (closeTrigger && sidebarElement) {
        closeTrigger.addEventListener('click', () => {
            sidebarElement.classList.remove('show-sidebar');
        });
    }
}

/**
 * Accesses Authorization Contexts to Safely Render Active Administrative Meta State Signatures
 */
function hydrateAdminSessionIdentity() {
    try {
        // Recover user metadata record stored locally upon verification clearance execution
        const sessionUser = JSON.parse(localStorage.getItem('user'));
        
        const welcomeBanner = document.getElementById('admin-welcome-string');
        const metaNameField = document.getElementById('admin-meta-name');
        const metaEmailField = document.getElementById('admin-meta-email');

        if (sessionUser) {
            // Safe fallback checking validation mechanisms
            const adminName = sessionUser.username || sessionUser.name || 'Administrative Executive';
            const adminEmail = sessionUser.email || 'admin@codequeen.org';

            if (welcomeBanner) welcomeBanner.textContent = `Welcome Back, ${adminName}!`;
            if (metaNameField) metaNameField.textContent = adminName;
            if (metaEmailField) metaEmailField.textContent = adminEmail;
        } else {
            // Re-route processing logic loops safely down to base tier if session variables remain unallocated
            window.location.href = 'login.html';
        }
    } catch (error) {
        console.error('Session clearance identity profile processing runtime fault:', error);
    }
}

/**
 * Queries the Database Models Endpoint Collections via API Controllers Layer to Extract Total Item Counts
 * Correctly targets individual collection paths to hydrate dashboard metadata dynamically.
 */
async function fetchDashboardMetricCounters() {
    const metrics = ['opportunities', 'resources', 'projects', 'profiles'];
    
    // Loop mapping logic across items to populate visual element UI count cards dynamically
    for (const model of metrics) {
        try {
            let urlTarget = '';
            
            // Map models smoothly to the precise routes matching your uploaded backend parameters
            if (model === 'opportunities') {
                urlTarget = `${ENDPOINT_API_BASE}/opportunities/getpcomingpportunities`;
            } else if (model === 'resources') {
                urlTarget = `${ENDPOINT_API_BASE}/resources/getallresources`;
            } else if (model === 'projects') {
                urlTarget = `${ENDPOINT_API_BASE}/projects/getallprojects`;
            } else if (model === 'profiles') {
                // Profiles metric maps directly into your partner network records
                urlTarget = `${ENDPOINT_API_BASE}/partners/getapprovedpartners`;
            }

            const response = await fetch(urlTarget, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                const counterElement = document.getElementById(`count-${model}`);
                if (counterElement) {
                    // Extract payload lists dynamically based on custom controller payload wrappings
                    let activeList = [];
                    if (Array.isArray(data)) {
                        activeList = data;
                    } else if (data.result && Array.isArray(data.result)) {
                        activeList = data.result;
                    } else if (data.opportunities && Array.isArray(data.opportunities)) {
                        activeList = data.opportunities;
                    } else if (data.resources && Array.isArray(data.resources)) {
                        activeList = data.resources;
                    } else if (data.projects && Array.isArray(data.projects)) {
                        activeList = data.projects;
                    } else if (data.partners && Array.isArray(data.partners)) {
                        activeList = data.partners;
                    }
                    
                    // Assign explicit length count or fallback safely to 0
                    counterElement.textContent = activeList.length !== undefined ? activeList.length : 0;
                }
            } else {
                document.getElementById(`count-${model}`).textContent = '0';
            }
        } catch (err) {
            console.warn(`Fallback execution activated for metric query stream context: [${model}]. Verify active controllers link.`);
            const targetElement = document.getElementById(`count-${model}`);
            if (targetElement) targetElement.textContent = '0';
        }
    }
}

/**
 * Switches Active Tab Targets visually and requests pipeline datasets context from controllers
 */
function switchApprovalQueue(queueType, elementBtn) {
    // Clear structural visual highlight flags systematically across the category loop array elements
    const actionButtons = document.querySelectorAll('.approval-category-btn');
    actionButtons.forEach(btn => btn.classList.remove('active-target'));

    // Attach indicator designation context token to target trigger
    if (elementBtn) {
        elementBtn.classList.add('active-target');
    }

    currentApprovalContext = queueType;
    loadPendingApprovalsQueue(queueType);
}

/**
 * Fetches and displays pending requests depending on selected approval category target context 
 */
async function loadPendingApprovalsQueue(category) {
    const queueTray = document.getElementById('approval-queue-render-box');
    if (!queueTray) return;

    // Instatiate visual interface loading progress loop state indicators 
    queueTray.innerHTML = `
        <div class="text-center py-5 text-muted">
            <div class="spinner-border spinner-border-sm text-secondary mb-2" role="status"></div>
            <div class="small">Retrieving pending ${category} pipeline...</div>
        </div>`;

    try {
        let urlTarget = '';

        // Map categories dynamically into your active controller approval routing layers
        if (category === 'opportunities') {
            urlTarget = `${ENDPOINT_API_BASE}/opportunities/getunverifiedopportunities`;
        } else if (category === 'enrollments') {
            urlTarget = `${ENDPOINT_API_BASE}/enrollments/getpendingapprovals`;
        } else if (category === 'partners') {
            urlTarget = `${ENDPOINT_API_BASE}/partners/getpendingpartners`;
        } else {
            // Dynamic fallback path for unmapped tabs (events, resources, mentorship) to match original base structure
            urlTarget = `${ENDPOINT_API_BASE}/api/admin/pending/${category}`;
        }

        const response = await fetch(urlTarget, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const dataset = await response.json();
            // Pull internal data array payload directly if backend serves nested wrappers
            const trueItemsArray = dataset.result || dataset.opportunities || dataset.enrollments || dataset.partners || dataset;
            renderQueueItems(Array.isArray(trueItemsArray) ? trueItemsArray : [], category);
        } else {
            renderMockFallbackPipeline(category);
        }
    } catch (err) {
        console.warn(`API routing trace to '/api/admin/pending/${category}' failed. Generating design simulation visualization frame.`);
        renderMockFallbackPipeline(category);
    }
}

/**
 * Loops and constructs structural table block views dynamically for each validated pending asset instance element array 
 */
function renderQueueItems(items, type) {
    const queueTray = document.getElementById('approval-queue-render-box');
    if (!queueTray) return;

    if (!items || items.length === 0) {
        queueTray.innerHTML = `<div class="text-center py-5 text-muted small"><i class="bi bi-patch-check fs-4 d-block mb-1 text-success"></i>All cleared! No items require review.</div>`;
        return;
    }

    queueTray.innerHTML = ''; // Clean canvas layout context block
    
    items.forEach((item, index) => {
        const itemTitle = item.title || item.name || item.studentId || `Request Entry Reference #${index + 1}`;
        const itemSubtitle = item.subtitle || item.email || item.company || item.course || 'Pending review logs';
        const targetId = item._id || item.id || index;

        const rowMarkup = `
            <div class="approval-data-row" id="queue-item-${type}-${targetId}">
                <div style="max-width: 60%;">
                    <div class="fw-bold text-truncate text-dark small mb-0">${itemTitle}</div>
                    <small class="text-muted d-block text-truncate" style="font-size:0.78rem;">${itemSubtitle}</small>
                </div>
                <div class="d-flex gap-1">
                    <button class="btn btn-sm btn-success py-1 px-2 rounded-2" style="font-size:0.75rem;" onclick="processApprovalDecision('${type}', '${targetId}', 'approve')">
                        <i class="bi bi-check-circle"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger py-1 px-2 rounded-2" style="font-size:0.75rem;" onclick="processApprovalDecision('${type}', '${targetId}', 'reject')">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>`;
        queueTray.insertAdjacentHTML('beforeend', rowMarkup);
    });
}

/**
 * Action Trigger Executor Logic targeting decision pipeline states endpoints to update storage instances
 */
async function processApprovalDecision(type, id, action) {
    try {
        let urlTarget = '';
        let config = {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        };

        // Determine method type and body arguments using matching backend criteria definitions
        if (type === 'opportunities') {
            if (action === 'approve') {
                urlTarget = `${ENDPOINT_API_BASE}/opportunities/verifyopportunity/${id}`;
                config.method = 'PUT';
            } else {
                urlTarget = `${ENDPOINT_API_BASE}/opportunities/deleteopportunity/${id}`;
                config.method = 'DELETE';
            }
        } else if (type === 'enrollments') {
            urlTarget = `${ENDPOINT_API_BASE}/enrollments/approvebystudentId`;
            config.method = 'PUT';
            config.body = JSON.stringify({ studentId: id, status: action === 'approve' ? 'approved' : 'rejected' });
        } else if (type === 'partners') {
            if (action === 'approve') {
                urlTarget = `${ENDPOINT_API_BASE}/partners/verifypartnerstatus/${id}`;
                config.method = 'PUT';
            } else {
                urlTarget = `${ENDPOINT_API_BASE}/partners/deletepartnerprofile/${id}`;
                config.method = 'DELETE';
            }
        } else {
            // General structure fallback setup mapping original code structures
            urlTarget = `${ENDPOINT_API_BASE}/api/admin/decision/${type}/${id}`;
            config.method = 'POST';
            config.body = JSON.stringify({ status: action === 'approve' ? 'approved' : 'rejected' });
        }

        const response = await fetch(urlTarget, config);

        if (response.ok) {
            // Remove target element block dynamically from screen space layout framework tree mapping models
            const targetRow = document.getElementById(`queue-item-${type}-${id}`);
            if (targetRow) {
                targetRow.style.transition = 'all 0.3s ease';
                targetRow.style.opacity = '0';
                setTimeout(() => {
                    targetRow.remove();
                    // If area box element grid remains totally cleared out, append fallback visual indicators loop context
                    const queueTray = document.getElementById('approval-queue-render-box');
                    if (queueTray && queueTray.children.length === 0) {
                        queueTray.innerHTML = `<div class="text-center py-5 text-muted small"><i class="bi bi-patch-check fs-4 d-block mb-1 text-success"></i>Pipeline validation tasks processed completely.</div>`;
                    }
                }, 300);
            }
        } else {
            alert(`Execution action validation processing anomaly detected for decision operations logic stack parameters.`);
        }
    } catch (err) {
        console.error('Network execution failure routing context exception path tracking loop:', err);
        // Direct interface layout UI simulation feedback loop sequence execution run context implementation wrapper:
        const targetRow = document.getElementById(`queue-item-${type}-${id}`);
        if (targetRow) {
            targetRow.style.opacity = '0.4';
            targetRow.style.pointerEvents = 'none';
        }
    }
}

/**
 * Simulation Data Fallback Rendering System Engine Block
 */
function renderMockFallbackPipeline(category) {
    const mockDataMap = {
        enrollments: [
            { id: 'e1', title: 'Nsubuga Brenda', subtitle: 'brenda@example.com' },
            { id: 'e2', title: 'Nakato Sarah', subtitle: 'nakato@example.com' }
        ],
        events: [
            { id: 'ev1', title: 'Web3 Builders Uganda Workshop', subtitle: 'Date: 25th May 2026' }
        ],
        resources: [
            { id: 'r1', title: 'MERN Stack Production Handbook.pdf', subtitle: 'Shared by Tech Team' }
        ],
        opportunities: [
            { id: 'o1', title: 'Junior Node.js Engineer Position', subtitle: 'Refactory Recruitment Hub' }
        ],
        partners: [
            { id: 'p1', title: 'Kampala Innovation Village', subtitle: 'Enterprise Node Workspace Link' }
        ],
        mentorship: [
            { id: 'm1', title: 'Faith Nabwire matched with Hassan', subtitle: 'Track: Backend Architecture' }
        ]
    };

    renderQueueItems(mockDataMap[category] || [], category);
}

/**
 * Tears down authorization session variables contexts safely to reset route authorization guards 
 */
function logoutSession() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}