/**
 * Frontend Control Logic Architecture for CodeQueen Corporate Projects Portfolio Manager
 * Wireframe synced seamlessly with underlying REST endpoints
 */

const BASE_API_ROUTE = 'http://localhost:5000/projects';

document.addEventListener('DOMContentLoaded', async () => {
    // Intercept mobile responsive layout drawer toggles
    document.getElementById('sidebarToggle')?.addEventListener('click', () => {
        document.getElementById('sidebarMenu').classList.toggle('show');
    });

    initLiveThumbnailPreviewEngine();
    setupActionFormListeners();

    // Fire initial core synchronization data fetch pipeline
    await synchronizeProjectsMatrixGrid();
});

function initLiveThumbnailPreviewEngine() {
    const urlInputField = document.getElementById('inputProjectThumbnail');
    const placeholderIcon = document.getElementById('iconThumbnailPlaceholder');
    const imageContainer = document.getElementById('imageThumbnailPreview');

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
    document.getElementById('formProjectSubmission').addEventListener('submit', dispatchProjectPublishFormPayload);

    // Contextual Dynamic Lookup Field Interceptor
    document.getElementById('txtSearchQuery').addEventListener('input', debounceSearchQueryTrigger(async (e) => {
        const queryTerm = e.target.value.trim();
        if (queryTerm.length > 0) {
            await executeSearchQueryDatabaseLookup(queryTerm);
        } else {
            await synchronizeProjectsMatrixGrid();
        }
    }, 350));

    // Session Termination Lifecycle Mapping Event Bindings
    document.getElementById('btnSidebarSignout').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        window.location.href = 'login.html';
    });
}

function getBearerSecurityHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    };
}

/**
 * Loads list array vectors straight into the application DOM matrix
 */
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

/**
 * Connects search terms queries with backend text regex index paths
 */
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

/**
 * Builds HTML blocks structure exactly matching your wireframe card elements specifications
 */
function renderProjectsMatrixGridCards(projectsArray) {
    const listContainerNode = document.getElementById('projectsDisplayList');
    const rootGridTarget = document.getElementById('projectsMasterListGrid');
    
    rootGridTarget.innerHTML = '';

    if (!projectsArray || projectsArray.length === 0) {
        rootGridTarget.innerHTML = `
            <div class="text-center py-5 text-muted bg-light border rounded-3 p-4">
                <i class="fa-solid fa-layer-group fa-2x mb-2 text-black-50 d-block"></i>
                No uploaded projects records matched the active search parameter fields filter.
            </div>`;
        return;
    }

    projectsArray.forEach(proj => {
        const itemCard = document.createElement('div');
        itemCard.className = 'project-display-card';

        // Check if list consists of populated string variables tags or sub objects array nodes
        const badgesHTML = Array.isArray(proj.participants)
            ? proj.participants.map(p => `<span class="badge bg-secondary-subtle text-secondary border px-2 py-1 me-1 small mb-1 d-inline-block">${p}</span>`).join('')
            : `<span class="text-muted small">None documented</span>`;

        const creationDate = proj.createdAt 
            ? new Date(proj.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : 'N/A';

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
                        <button class="btn btn-sm btn-outline-danger px-3" onclick="dispatchPermanentDeleteOperation('${proj._id}')">
                            <i class="fa-solid fa-trash-can me-1"></i> Delete
                        </button>
                    </div>
                    
                    <p class="small text-secondary mb-3">${proj.description}</p>
                    
                    <div class="row g-2 text-muted small border-bottom pb-2 mb-2">
                        <div class="col-12 col-sm-6"><i class="fa-solid fa-link me-1"></i> <strong>Demo Link:</strong> ${proj.demolink ? `<a href="${proj.demolink}" target="_blank" class="text-orange text-decoration-none">${proj.demolink}</a>` : 'N/A'}</div>
                        <div class="col-12 col-sm-6"><i class="fa-brands fa-github me-1"></i> <strong>Github Link:</strong> ${proj.githubLink ? `<a href="${proj.githubLink}" target="_blank" class="text-dark text-decoration-none">${proj.githubLink}</a>` : 'N/A'}</div>
                        <div class="col-12 col-sm-6"><i class="fa-solid fa-user-tag me-1"></i> <strong>Submitted By:</strong> ${proj.submittedBy?.username || 'Alumna/Admin'}</div>
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

/**
 * Builds creation parameters schema payload array object bindings matching required checks
 */
async function dispatchProjectPublishFormPayload(e) {
    e.preventDefault();

    const titleText = document.getElementById('inputTitle').value.trim();
    const ownerText = document.getElementById('inputOwner').value.trim();
    const descriptionText = document.getElementById('inputDescription').value.trim();
    const demoLinkText = document.getElementById('inputDemoLink').value.trim();
    const githubLinkText = document.getElementById('inputGithubLink').value.trim();
    const thumbnailText = document.getElementById('inputProjectThumbnail').value.trim();

    // Controller Validation Rule Assertion: Ensure at least one link repository exists
    if (!demoLinkText && !githubLinkText) {
        alert("Operational Validation Constraint: You must provide either a Demo link or a GitHub link repository to submit project logs.");
        return;
    }

    // Process comma string parameters field elements into a proper data array
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
            dispatchUINotificationBanner(outcome.message || "Project entry registered across the ecosystem hub.", "success");
            resetFormContainerState();
            await synchronizeProjectsMatrixGrid();
        } else {
            alert(`Backend operational denial: ${outcome.message}`);
        }
    } catch (err) {
        console.error(err);
        dispatchUINotificationBanner("Network gateway payload communication failure transaction aborted.", "danger");
    }
}

/**
 * Maps straight onto administrative DELETE /projects/deleteproject/:id
 */
async function dispatchPermanentDeleteOperation(id) {
    if (!confirm("Are you certain you want to permanently delete this project record profile from system indices logs?")) return;

    try {
        const response = await fetch(`${BASE_API_ROUTE}/deleteproject/${id}`, {
            method: 'DELETE',
            headers: getBearerSecurityHeaders()
        });

        const feedback = await response.json();
        if (response.ok) {
            dispatchUINotificationBanner(feedback.message || "Record expelled from tracking metrics frames.", "warning");
            await synchronizeProjectsMatrixGrid();
        } else {
            alert(feedback.message || "System error intercept encountered erasing documents.");
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
    layoutAnchor.innerHTML = `
        <div class="alert alert-${aestheticStatusType} alert-dismissible fade show shadow-sm small fw-bold" role="alert">
            <i class="fa-solid ${aestheticStatusType === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'} me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>`;
    setTimeout(() => {
        const activeNode = bootstrap.Alert.getInstance(layoutAnchor.querySelector('.alert'));
        activeNode?.close();
    }, 4500);
}