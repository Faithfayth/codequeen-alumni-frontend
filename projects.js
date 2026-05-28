/**
 * Frontend Control Logic Architecture for CodeQueen Portfolio Manager
 * Adapts context visibility dynamically for Alumna, Partner, and Student role frameworks
 */
const API_BASE_URL = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://cq-a-bckd.onrender.com'; // Production live Render URL
const BASE_API_ROUTE = `${API_BASE_URL}/projects`;

// Global variables parsed out of runtime security caches
let currentUserId = "";
let currentUserRole = "";

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Authenticate local variables and session states
    const storedToken = localStorage.getItem('token');
    const cachedUserData = localStorage.getItem('user');
    
    // Fallback variable alignment for roles if explicit item is stored
    currentUserRole = localStorage.getItem('userRole') || ""; 

    if (!storedToken || !cachedUserData) {
        console.warn("Session contexts absent. Returning upstream to entry space...");
        window.location.href = 'login.html';
        return;
    }

    try {
        const userObj = JSON.parse(cachedUserData);
        currentUserId = userObj._id || userObj.id || "";
        if (!currentUserRole && userObj.role) {
            currentUserRole = userObj.role;
        }
    } catch(e) {
        console.error("Failed parsing identity structures:", e);
    }

    // 2. Adjust role specific sidebar configurations, headers and button states
    configureRoleBasedInterfaceEngine();

    // Intercept mobile responsive layout drawer toggles
    document.getElementById('sidebarToggle')?.addEventListener('click', () => {
        document.getElementById('sidebarMenu').classList.toggle('show');
    });

    initLiveThumbnailPreviewEngine();
    setupActionFormListeners();

    // Fire core data collection array fetch
    await synchronizeProjectsMatrixGrid();
});

/**
 * Mutates title fields, components, and sidebars based on active credentials
 */
function configureRoleBasedInterfaceEngine() {
    const normalRole = currentUserRole.toLowerCase();
    
    const titleHeader = document.getElementById('mainHeaderDisplayTitle');
    const subLabel = document.getElementById('sidebarSubRoleLabel');
    const topAddBtn = document.getElementById('btnTopAddProjectAnchor');
    const formSection = document.getElementById('sectionAddProjectFormWorkspace');
    const linksContainer = document.getElementById('sidebarLinksDynamicContainer');

    if (!linksContainer) return;

    // Reset layout navigation links placeholder block
    linksContainer.innerHTML = '';

    // Branching conditional configurations mapping Partner, Student or Alumna paths
    if (normalRole === 'partner') {
        if (titleHeader) titleHeader.textContent = "Codequeen Partner";
        if (subLabel) subLabel.textContent = "Partner Portal";
        
        // Hide creation input blocks for corporate readers
        if (topAddBtn) topAddBtn.classList.add('d-none');
        if (formSection) formSection.classList.add('d-none');

        // Inject navigation maps exactly following partner.html blueprints
        linksContainer.innerHTML = `
            <li><a href="partner.html" class="sidebar-link"><i class="fa-solid fa-house"></i> HOME</a></li>
            <li><a href="alumniProfiles.html" class="sidebar-link"><i class="fa-solid fa-user-graduate"></i> Alumna Profiles</a></li>
            <li><a href="projects.html" class="sidebar-link active"><i class="fa-solid fa-laptop-code"></i> Community Projects</a></li>
            <li><a href="achievements.html" class="sidebar-link"><i class="fa-solid fa-trophy"></i> Achievements</a></li>
            <li><a href="partners.html" class="sidebar-link"><i class="fa-solid fa-handshake"></i> Other partners</a></li>
            <li><a href="leadership.html" class="sidebar-link"><i class="fa-solid fa-users-gear"></i> Leadership</a></li>
            <li><a href="wallOfFame.html" class="sidebar-link"><i class="fa-solid fa-star"></i> Wall of Fame</a></li>
            <li><a href="eventsSpace.html" class="sidebar-link"><i class="fa-solid fa-calendar-days"></i> Events</a></li>
        `;
    } else if (normalRole === 'student') {
        if (titleHeader) titleHeader.textContent = "Student Workspace";
        if (subLabel) subLabel.textContent = "Student Portal";
        
        // Hide form options from current current enrolled student tiers
        if (topAddBtn) topAddBtn.classList.add('d-none');
        if (formSection) formSection.classList.add('d-none');

        // Build navigation array map matching student dashboard interfaces
        linksContainer.innerHTML = `
            <li><a href="student.html" class="sidebar-link"><i class="fa-solid fa-chart-pie"></i> Dashboard</a></li>
            <li><a href="directory.html" class="sidebar-link"><i class="fa-solid fa-address-book"></i> Alumni directory</a></li>
            <li><a href="projects.html" class="sidebar-link active"><i class="fa-solid fa-laptop-code"></i> Projects</a></li>
        `;
    } else {
        // Fallback architecture defaults explicitly assuming Alumna context layouts
        if (titleHeader) titleHeader.textContent = "Queens' Projects";
        if (subLabel) subLabel.textContent = "Alumna Portal";
        
        // Reveal entry triggers for Alumna editors
        if (topAddBtn) {
            topAddBtn.classList.remove('d-none');
            topAddBtn.addEventListener('click', () => {
                formSection?.classList.remove('d-none');
                formSection?.scrollIntoView({ behavior: 'smooth' });
            });
        }
        if (formSection) formSection.classList.remove('d-none');

        linksContainer.innerHTML = `
            <li><a href="alumni.html" class="sidebar-link"><i class="bi bi-house-door"></i> HOME</a></li>
            <li><a href="profiles.html" class="sidebar-link"><i class="bi bi-person"></i> Profiles</a></li>
            <li><a href="gallery.html" class="sidebar-link"><i class="bi bi-image"></i> Gallery</a></li>
            <li><a href="resources.html" class="sidebar-link"><i class="bi bi-folder"></i> Resources</a></li>
            <li><a href="projects.html" class="sidebar-link"><i class="bi bi-briefcase"></i> Projects</a></li>
            <li><a href="achievements.html" class="sidebar-link"><i class="bi bi-award"></i> Achievements</a></li>
            <li><a href="wall-of-fame.html" class="sidebar-link"><i class="bi bi-star"></i> Wall of fame</a></li>
            <li><a href="partners.html" class="sidebar-link"><i class="bi bi-building"></i> Partners</a></li>
            <li><a href="elections.html" class="sidebar-link"><i class="bi bi-box-seam"></i> Elections</a></li>
            <li><a href="mentors.html" class="sidebar-link"><i class="bi bi-mortarboard"></i> Mentors</a></li>
        `;
    }
}

function initLiveThumbnailPreviewEngine() {
    const urlInputField = document.getElementById('inputProjectThumbnail');
    const placeholderIcon = document.getElementById('iconThumbnailPlaceholder');
    const imageContainer = document.getElementById('imageThumbnailPreview');

    if (!urlInputField) return;

    urlInputField.addEventListener('input', (e) => {
        const linkValue = e.target.value.trim();
        if (linkValue) {
            imageContainer.src = linkValue;
            imageContainer.classList.remove('d-none');
            placeholderIcon.classList.add('d-none');
        } else {
            imageContainer.classList.add('d-none');
            placeholderIcon.classList.remove('d-none');
        }
    });
}

function setupActionFormListeners() {
    // Form Creation Interceptor Pipeline
    document.getElementById('formProjectSubmission')?.addEventListener('submit', dispatchProjectPublishFormPayload);

    // Contextual Dynamic Lookup Field Interceptor
    document.getElementById('txtSearchQuery')?.addEventListener('input', debounceSearchQueryTrigger(async (e) => {
        const queryTerm = e.target.value.trim();
        if (queryTerm.length > 0) {
            await executeSearchQueryDatabaseLookup(queryTerm);
        } else {
            await synchronizeProjectsMatrixGrid();
        }
    }, 350));

    // Session Termination Lifecycle Mapping Event Bindings
    document.getElementById('btnSidebarSignout')?.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.clear();
        window.location.href = 'login.html';
    });
}

function getBearerSecurityHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    };
}

async function synchronizeProjectsMatrixGrid() {
    try {
        const response = await fetch(`${BASE_API_ROUTE}/getallprojects`, {
            method: 'GET',
            headers: getBearerSecurityHeaders()
        });

        if (!response.ok) throw new Error("Baseline breakdown reading server data array blocks.");

        const datasets = await response.json();
        renderProjectsMatrixGridCards(datasets);
    } catch (err) {
        console.error(err);
        dispatchUINotificationBanner("Failed loading project ecosystem registry records.", "danger");
    }
}

async function executeSearchQueryDatabaseLookup(queryValue) {
    try {
        const response = await fetch(`${BASE_API_ROUTE}/searchprojects?query=${encodeURIComponent(queryValue)}`, {
            method: 'GET',
            headers: getBearerSecurityHeaders()
        });

        if (!response.ok) throw new Error("Search index communication crash exception mapping.");

        const matches = await response.json();
        renderProjectsMatrixGridCards(matches);
    } catch (err) {
        console.error(err);
    }
}

function renderProjectsMatrixGridCards(projectsArray) {
    const rootGridTarget = document.getElementById('projectsMasterListGrid');
    if (!rootGridTarget) return;
    
    rootGridTarget.innerHTML = '';

    if (!projectsArray || projectsArray.length === 0) {
        rootGridTarget.innerHTML = `
            <div class="text-center py-5 text-muted bg-light border rounded-3 p-4">
                <i class="fa-solid fa-layer-group fa-2x mb-2 text-black-50 d-block"></i>
                No uploaded projects records found matching criteria elements.
            </div>`;
        return;
    }

    projectsArray.forEach(proj => {
        const itemCard = document.createElement('div');
        itemCard.className = 'project-display-card';

        const badgesHTML = Array.isArray(proj.participants)
            ? proj.participants.map(p => `<span class="badge bg-secondary-subtle text-secondary border px-2 py-1 me-1 small mb-1 d-inline-block">${p}</span>`).join('')
            : `<span class="text-muted small">None documented</span>`;

        const creationDate = proj.createdAt 
            ? new Date(proj.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : 'N/A';

        // Extract internal identifier from submittedBy entity framework
        let submittedById = "";
        let submittedByName = "Alumna/Admin";

        if (proj.submittedBy) {
            if (typeof proj.submittedBy === 'object') {
                submittedById = proj.submittedBy._id || proj.submittedBy.id || "";
                submittedByName = proj.submittedBy.username || proj.submittedBy.name || "Alumna/Admin";
            } else {
                submittedById = proj.submittedBy;
            }
        }

        // Conditional rendering requirement: User role is alumna and matches owner criteria parameters
        const isUserOwner = currentUserId && (String(submittedById) === String(currentUserId));
        const isAlumnaRole = currentUserRole.toLowerCase() === 'alumna';
        
        const deleteButtonHTML = (isAlumnaRole && isUserOwner)
            ? `<button class="btn btn-sm btn-outline-danger px-3" onclick="dispatchPermanentDeleteOperation('${proj._id}')">
                   <i class="fa-solid fa-trash-can me-1"></i> Delete
               </button>`
            : '';

        itemCard.innerHTML = `
            <div class="row g-4 align-items-center">
                <div class="col-12 col-md-3 text-center bg-light p-3 rounded border">
                    <img src="${proj.projectthumbnail || 'https://via.placeholder.com/150?text=Project+Photo'}" 
                         class="img-fluid rounded" style="max-height: 120px; object-fit: contain;"
                         onerror="this.src='https://via.placeholder.com/150?text=Project+Photo'">
                </div>
                <div class="col-12 col-md-9">
                    <div class="d-flex justify-content-between align-items-start border-bottom pb-2 mb-2 flex-wrap gap-2">
                        <div>
                            <h5 class="fw-bold m-0 text-dark">${proj.title}</h5>
                            <small class="text-muted"><strong>Owner(s):</strong> ${proj.owner}</small>
                        </div>
                        ${deleteButtonHTML}
                    </div>
                    
                    <p class="small text-secondary mb-3">${proj.description}</p>
                    
                    <div class="row g-2 text-muted small border-bottom pb-2 mb-2">
                        <div class="col-12 col-sm-6"><i class="fa-solid fa-link me-1"></i> <strong>Demo Link:</strong> ${proj.demolink ? `<a href="${proj.demolink}" target="_blank" style="color: var(--cq-orange);" class="text-decoration-none">${proj.demolink}</a>` : 'N/A'}</div>
                        <div class="col-12 col-sm-6"><i class="fa-brands fa-github me-1"></i> <strong>Github Link:</strong> ${proj.githubLink ? `<a href="${proj.githubLink}" target="_blank" class="text-dark text-decoration-none">${proj.githubLink}</a>` : 'N/A'}</div>
                        <div class="col-12 col-sm-6"><i class="fa-solid fa-user-tag me-1"></i> <strong>Submitted By:</strong> ${submittedByName}</div>
                        <div class="col-12 col-sm-6"><i class="fa-solid fa-calendar-day me-1"></i> <strong>Created At:</strong> ${creationDate}</div>
                    </div>
                    
                    <div class="pt-1">
                        <small class="d-block text-dark fw-bold mb-1">Participants:</small>
                        <div class="d-flex flex-wrap">${badgesHTML}</div>
                    </div>
                </div>
            </div>`;
        rootGridTarget.appendChild(itemCard);
    });
}

async function dispatchProjectPublishFormPayload(e) {
    e.preventDefault();

    const titleText = document.getElementById('inputTitle').value.trim();
    const ownerText = document.getElementById('inputOwner').value.trim();
    const descriptionText = document.getElementById('inputDescription').value.trim();
    const demoLinkText = document.getElementById('inputDemoLink').value.trim();
    const githubLinkText = document.getElementById('inputGithubLink').value.trim();
    const thumbnailText = document.getElementById('inputProjectThumbnail').value.trim();

    if (!demoLinkText && !githubLinkText) {
        alert("Validation Constraint: You must provide either a Demo link or a GitHub link repository.");
        return;
    }

    const rawParticipantsString = document.getElementById('inputParticipants').value;
    const participantsArrayPayload = rawParticipantsString 
        ? rawParticipantsString.split(',').map(name => name.trim()).filter(Boolean) 
        : [];

    const bodyPayload = {
        title: titleText,
        owner: ownerText,
        description: descriptionText,
        projectthumbnail: thumbnailText,
        demolink: demoLinkText,
        githubLink: githubLinkText,
        participants: participantsArrayPayload
    };

    try {
        const response = await fetch(`${BASE_API_ROUTE}/uploadproject`, {
            method: 'POST',
            headers: getBearerSecurityHeaders(),
            body: JSON.stringify(bodyPayload)
        });

        const outcome = await response.json();

        if (response.ok) {
            dispatchUINotificationBanner(outcome.message || "Project entry registered successfully.", "success");
            resetFormContainerState();
            await synchronizeProjectsMatrixGrid();
        } else {
            alert(`Submission denied: ${outcome.message}`);
        }
    } catch (err) {
        console.error(err);
        dispatchUINotificationBanner("Network error during project transfer execution mapping.", "danger");
    }
}

async function dispatchPermanentDeleteOperation(id) {
    if (!confirm("Are you certain you want to permanently delete your project profile?")) return;

    try {
        const response = await fetch(`${BASE_API_ROUTE}/deleteproject/${id}`, {
            method: 'DELETE',
            headers: getBearerSecurityHeaders()
        });

        const feedback = await response.json();
        if (response.ok) {
            dispatchUINotificationBanner(feedback.message || "Record successfully removed.", "warning");
            await synchronizeProjectsMatrixGrid();
        } else {
            alert(feedback.message || "Error clearing data documents from node endpoint.");
        }
    } catch (err) {
        console.error(err);
    }
}

function resetFormContainerState() {
    document.getElementById('formProjectSubmission').reset();
    document.getElementById('inputProjectThumbnail').dispatchEvent(new Event('input'));
}

function debounceSearchQueryTrigger(func, timeout = 300) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
}

function dispatchUINotificationBanner(message, aestheticStatusType) {
    const layoutAnchor = document.getElementById('alertLayoutAnchor');
    if (!layoutAnchor) return;
    
    layoutAnchor.innerHTML = `
        <div class="alert alert-${aestheticStatusType} alert-dismissible fade show shadow-sm small fw-bold" role="alert">
            <i class="fa-solid ${aestheticStatusType === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'} me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>`;
    setTimeout(() => {
        const alertNode = layoutAnchor.querySelector('.alert');
        if (alertNode && typeof bootstrap !== 'undefined') {
            const activeNode = bootstrap.Alert.getInstance(alertNode);
            activeNode?.close();
        }
    }, 4500);
}