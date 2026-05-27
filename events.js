/**
 * Dynamic Operations and Network Integration Module for CodeQueen Events Platform Hub
 */
const BASE_API_ROUTE = 'http://localhost:5000/events'; // Route template configuration set to explicitly capture prefix targets
let CURRENT_VIEW_CONTEXT = 'upcoming';

// Execute content rendering workflows after initialization processes complete
document.addEventListener('DOMContentLoaded', () => {
    initializeNavigationDrawerControls();
    initializeViewTabListeners();
    loadEventsDataPayloadStream();
});

/**
 * Handle Off-Screen Responsive Drawer Toggle Systems
 */
function initializeNavigationDrawerControls() {
    const sidebar = document.getElementById('main-application-sidebar');
    const openBtn = document.getElementById('open-sidebar-trigger');

    if (openBtn && sidebar) {
        openBtn.addEventListener('click', () => {
            sidebar.classList.add('show-sidebar');
        });
    }

    // Auto close menu context structure if a click falls outside the box bounds layout on desktop view alternatives
    document.addEventListener('click', (event) => {
        if (window.innerWidth < 992 && sidebar && sidebar.classList.contains('show-sidebar')) {
            if (!sidebar.contains(event.target) && event.target !== openBtn && !openBtn.contains(event.target)) {
                sidebar.classList.remove('show-sidebar');
            }
        }
    });
}

/**
 * Terminate Session Storage References
 */
function logoutSession() {
    localStorage.clear();
    window.location.href = 'login.html';
}

/**
 * Bind View Filtering Action Switches
 */
function initializeViewTabListeners() {
    const btnUpcoming = document.getElementById('tabUpcoming');
    const btnPast = document.getElementById('tabPast');

    if (btnUpcoming && btnPast) {
        btnUpcoming.addEventListener('click', () => handleTabTransition('upcoming', btnUpcoming, btnPast));
        btnPast.addEventListener('click', () => handleTabTransition('past', btnPast, btnUpcoming));
    }
}

function handleTabTransition(targetTabType, targetActiveBtn, targetInactiveBtn) {
    if (CURRENT_VIEW_CONTEXT === targetTabType) return;

    CURRENT_VIEW_CONTEXT = targetTabType;
    targetActiveBtn.classList.add('active');
    targetInactiveBtn.classList.remove('active');

    loadEventsDataPayloadStream();
}

/**
 * Content Collection Processor Sync with Database Management Modules
 */
async function loadEventsDataPayloadStream() {
    const targetDeck = document.getElementById('eventsDisplayDeck');
    const stateLoader = document.getElementById('asyncLoadingSpinner');
    const userToken = localStorage.getItem('token');

    if (!targetDeck) return;
    
    targetDeck.innerHTML = '';
    if (stateLoader) stateLoader.classList.remove('d-none');

    // Route calls precisely formatted as ...5000/events/<routename>
    const activeUrl = (CURRENT_VIEW_CONTEXT === 'upcoming')
        ? `${BASE_API_ROUTE}/getcurrentevents`
        : `${BASE_API_ROUTE}/getpastevents`;

    try {
        const response = await fetch(activeUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${userToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) throw new Error(`Network Stream Fault Code: ${response.status}`);
        const dataRecords = await response.json();

        renderUiLayoutDeckRows(dataRecords, targetDeck);
    } catch (error) {
        console.error("Critical communications error encountered during content fetching pipeline:", error);
        targetDeck.innerHTML = `
            <div class="alert alert-danger text-center py-4 my-2 fw-bold" role="alert">
                <i class="bi bi-cloud-slash me-2 fs-5 align-middle"></i>
                Failed to communicate with system catalogs. Verify authentication status rules.
            </div>`;
    } finally {
        if (stateLoader) stateLoader.classList.add('d-none');
    }
}

/**
 * Construct Interface Rows Map conforming to UI Table View Schematics
 */
function renderUiLayoutDeckRows(recordsArray, mountContainer) {
    if (!recordsArray || recordsArray.length === 0) {
        mountContainer.innerHTML = `
            <div class="text-center py-5 text-muted shadow-sm rounded-4 bg-white border">
                <i class="bi bi-calendar-x display-4 d-block mb-2 text-secondary"></i>
                No catalog entries corresponding to this target index framework were located.
            </div>`;
        return;
    }

    mountContainer.innerHTML = recordsArray.map(event => {
        const mediaRenderNode = event.imageurl 
            ? `<img src="${event.imageurl}" alt="${event.title}">`
            : `<i class="bi bi-calendar4-event"></i>`;

        const formattedTimeline = new Date(event.startdate).toLocaleDateString('en-US', {
            weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
        }) + ' @ ' + new Date(event.startdate).toLocaleTimeString('en-US', {
            hour: '2-digit', minute: '2-digit'
        });

        let contextualActionButton = '';
        if (CURRENT_VIEW_CONTEXT === 'upcoming') {
            contextualActionButton = `
                <div class="d-flex justify-content-end mt-2">
                    <button class="btn btn-register-action" onclick="executeEventEnrollmentTransaction('${event._id}')">
                        <i class="bi bi-person-plus"></i> Register
                    </button>
                </div>`;
        } else {
            contextualActionButton = `
                <div class="d-flex justify-content-end mt-2">
                    <button class="btn btn-register-action" disabled>
                        <i class="bi bi-clock-history"></i> Concluded
                    </button>
                </div>`;
        }

        return `
            <div class="event-row-container shadow-sm">
                <div class="row g-4 align-items-center">
                    
                    <div class="col-12 col-sm-4 col-md-3 col-lg-2 d-flex justify-content-sm-start justify-content-center">
                        <div class="event-graphic-thumbnail">
                            ${mediaRenderNode}
                        </div>
                    </div>
                    
                    <div class="col-12 col-sm-8 col-md-9 col-lg-10">
                        <div class="table-responsive">
                            <table class="event-wireframe-table">
                                <tbody>
                                    <tr>
                                        <td class="property-label">Title</td>
                                        <td class="property-divider">:</td>
                                        <td class="property-value fw-bold text-dark">${event.title}</td>
                                    </tr>
                                    <tr>
                                        <td class="property-label">Description</td>
                                        <td class="property-divider">:</td>
                                        <td class="property-value">${event.description}</td>
                                    </tr>
                                    <tr>
                                        <td class="property-label">Timeline</td>
                                        <td class="property-divider">:</td>
                                        <td class="property-value">${formattedTimeline}</td>
                                    </tr>
                                    <tr>
                                        <td class="property-label">Location</td>
                                        <td class="property-divider">:</td>
                                        <td class="property-value">${event.location}</td>
                                    </tr>
                                    <tr>
                                        <td class="property-label">Url</td>
                                        <td class="property-divider">:</td>
                                        <td class="property-value">
                                            ${event.url ? `<a href="${event.url}" target="_blank" class="text-decoration-none" style="color: var(--cq-gold-bg); word-break: break-all;">${event.url}</a>` : 'N/A'}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        ${contextualActionButton}
                    </div>

                </div>
            </div>`;
    }).join('');
}

/**
 * Handle Remote Updates via Enrollment Processing Action Events
 */
async function executeEventEnrollmentTransaction(eventRecordID) {
    const tokenSignature = localStorage.getItem('token');
    
    try {
        // Route calls formatted to explicitly match ...5000/events/registerforevent/:id
        const response = await fetch(`${BASE_API_ROUTE}/registerforevent/${eventRecordID}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${tokenSignature}`,
                'Content-Type': 'application/json'
            }
        });

        const dataFeedback = await response.json();
        
        if (response.ok) {
            alert(dataFeedback.message || "Registration transaction processed completely!");
            loadEventsDataPayloadStream();
        } else {
            alert(`Registration operation warning: ${dataFeedback.message}`);
        }
    } catch (err) {
        console.error("Networking connection interface failure resolving payload transaction updates:", err);
        alert("Communications error: Could not complete transaction requirements.");
    }
}