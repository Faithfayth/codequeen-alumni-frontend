/**
 * CodeQueen Alumnae Resources Feed & Shared Knowledge Management Interface Engine
 * Interlaces natively with backing platform document repositories securely.
 */

const API_BASE_URL = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://cq-a-bckd.onrender.com'; // Production live Render URL
// Centralized Base Endpoint configuration reflecting backend routing structures
const BACKEND_BASE_URL = `${API_BASE_URL}/resources`;

document.addEventListener('DOMContentLoaded', async () => {
    // Structural layout sidebar expansion toggle controller setup
    document.getElementById('sidebarToggle')?.addEventListener('click', () => {
        document.getElementById('sidebarMenu').classList.toggle('show');
    });

    // Wire up the header "+ Add Resource" scroll shortcut action button click
    document.getElementById('shortcutAddResourceBtn')?.addEventListener('click', () => {
        const submissionSection = document.getElementById('resourceSubmissionSection');
        if (submissionSection) {
            submissionSection.scrollIntoView({ behavior: 'smooth' });
        }
    });

    initFormMediaFileInputMonitor();
    setupFormSubmissionPipeline();
    setupLogoutSystemActions();

    // Pull database entries onto active view grid rows instantly
    await synchronizeResourcesDataset();
});

/**
 * Common Secured Network Headers Helper Meta Block
 */
function getSecuredHeaders(includeContentType = true) {
    const bearerToken = localStorage.getItem('token');
    const coreHeaders = {
        'Authorization': `Bearer ${bearerToken}`
    };
    if (includeContentType) {
        coreHeaders['Content-Type'] = 'application/json';
    }
    // Note: When includeContentType is false, we return ONLY Authorization.
    // This allows the browser to dynamically set the proper 'multipart/form-data' boundary context.
    return coreHeaders;
}

/**
 * Pulls resource logs from API server cluster and injects pure view-only HTML layout blocks
 */
async function synchronizeResourcesDataset() {
    const dataTargetFeedNode = document.getElementById('alumniResourcesList');
    if (!dataTargetFeedNode) return;

    try {
        const response = await fetch(`${BACKEND_BASE_URL}/getallresources`, {
            method: 'GET',
            headers: getSecuredHeaders(true)
        });

        if (!response.ok) throw new Error("Could not download resources registry rows.");

        const datasetsArray = await response.json();

        if (!datasetsArray || datasetsArray.length === 0) {
            dataTargetFeedNode.innerHTML = `
                <div class="text-center py-5 text-muted bg-light border rounded-4 p-4">
                    <i class="fa-solid fa-box-open fa-2x mb-2 text-black-50 d-block"></i>
                    No published resource records identified matching current tracking indices.
                </div>`;
            return;
        }

        dataTargetFeedNode.innerHTML = '';

        datasetsArray.forEach(resourceItem => {
            const rowCardItem = document.createElement('div');
            rowCardItem.className = 'resource-display-card';

            const formattedCreationDateStr = resourceItem.createdAt 
                ? new Date(resourceItem.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) 
                : 'N/A';

            // Displays specific view option or binary document files fetch routing blocks cleanly
            const interfaceActionButtonHTML = resourceItem.isTypeFile
                ? `<button class="btn btn-action-outline btn-sm text-dark px-3" onclick="window.open('${resourceItem.url}', '_blank')">
                       <i class="fa-solid fa-cloud-arrow-down text-warning me-1"></i> Download File
                   </button>`
                : `<button class="btn btn-action-outline btn-sm text-dark px-3" onclick="window.open('${resourceItem.url}', '_blank')">
                       <i class="fa-solid fa-arrow-up-right-from-square text-primary me-1"></i> Visit Resource Link
                   </button>`;

            dataTargetFeedNode.appendChild(rowCardItem);
            rowCardItem.innerHTML = `
                <div class="row g-3 align-items-center">
                    <div class="col-12 col-sm-3 col-md-2 text-center">
                        <div style="height: 110px; width: 100%; border-radius: 12px; background: #FFF5E9; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(197, 108, 100, 0.1);">
                            <i class="fa-solid ${resourceItem.isTypeFile ? 'fa-file-lines text-danger' : 'fa-link text-primary'} fa-3x"></i>
                        </div>
                    </div>
                    <div class="col-12 col-sm-9 col-md-10">
                        <div class="row g-2">
                            <div class="col-12 col-md-9">
                                <div class="d-flex align-items-center gap-2 flex-wrap mb-1">
                                    <h6 class="fw-bold text-dark m-0">${escapeHtml(resourceItem.title)}</h6>
                                    <span class="badge bg-light text-dark border font-monospace small" style="font-size:10px;">${escapeHtml(resourceItem.category)}</span>
                                </div>
                                <p class="text-muted small m-0 mb-2">${escapeHtml(resourceItem.description)}</p>
                                <div class="d-flex gap-3 align-items-center flex-wrap text-secondary" style="font-size: 11px;">
                                    <span><strong class="text-dark">Resource URL:</strong> <span class="text-primary text-break">${resourceItem.url}</span></span>
                                    <span><strong class="text-dark">Shared By:</strong> ${escapeHtml(resourceItem.addedBy?.username || 'Alumna')}</span>
                                    <span><strong class="text-dark">Date:</strong> ${formattedCreationDateStr}</span>
                                </div>
                            </div>
                            <div class="col-12 col-md-3 text-md-end align-self-center pt-2">
                                ${interfaceActionButtonHTML}
                            </div>
                        </div>
                    </div>
                </div>`;
        });

    } catch (err) {
        console.error(err);
        dispatchUINotificationBanner("Could not sync shared resources database matrix with local engine.", "danger");
    }
}

/**
 * Prepares visual upload cues upon picking local resources binaries
 */
function initFormMediaFileInputMonitor() {
    const inputNode = document.getElementById('fileResourceAsset');
    const placeholderMetaBox = document.getElementById('filePlaceholderMeta');
    const attachmentSuccessBox = document.getElementById('fileSelectedFeedback');
    const filenameLabel = document.getElementById('lblAttachedFileName');

    if (!inputNode) return;

    inputNode.addEventListener('change', (e) => {
        const structuralFile = e.target.files[0];
        if (!structuralFile) {
            placeholderMetaBox.classList.remove('d-none');
            attachmentSuccessBox.classList.add('d-none');
            return;
        }

        filenameLabel.textContent = structuralFile.name;
        placeholderMetaBox.classList.add('d-none');
        attachmentSuccessBox.classList.remove('d-none');
    });
}

/**
 * Handles form packing, routes Multi-part stream packages for files OR handles raw input contexts
 */
function setupFormSubmissionPipeline() {
    const insertionForm = document.getElementById('formResourceSubmission');
    if (!insertionForm) return;

    insertionForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const titleVal = document.getElementById('inputTitle').value.trim();
        const descriptionVal = document.getElementById('inputDescription').value.trim();
        const urlVal = document.getElementById('inputUrl').value.trim();
        const categoryVal = document.getElementById('selectCategory').value;
        const localFileInput = document.getElementById('fileResourceAsset');

        const networkPackageWrapper = new FormData();
        networkPackageWrapper.append('title', titleVal);
        networkPackageWrapper.append('description', descriptionVal);
        networkPackageWrapper.append('category', categoryVal);

        if (localFileInput && localFileInput.files.length > 0) {
            networkPackageWrapper.append('resourceFile', localFileInput.files[0]);
        } else {
            if (!urlVal) {
                alert("Validation Boundary Error: Provide a resource URL parameter link or upload an asset document file.");
                return;
            }
            networkPackageWrapper.append('url', urlVal);
        }

        try {
            const response = await fetch(`${BACKEND_BASE_URL}/addresource`, {
                method: 'POST',
                headers: getSecuredHeaders(false), // Automatically allows boundary generation flags to match multi-part specifications
                body: networkPackageWrapper
            });

            const parsedServerMessage = await response.json();

            if (response.ok) {
                dispatchUINotificationBanner(parsedServerMessage.message || "Resource asset added and shared systematically!", "success");
                clearFormTrackingStates();
                await synchronizeResourcesDataset();
            } else {
                console.error("Backend Rejected Payload Exception Trace:", parsedServerMessage);
                alert(`Transaction Rejected: ${parsedServerMessage.message}`);
            }
        } catch (error) {
            console.error("Network Fetch Transport Failure:", error);
            dispatchUINotificationBanner("Critical network gateway connection failure trace.", "danger");
        }
    });
}

function setupLogoutSystemActions() {
    const executeLogoutChain = (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        window.location.href = 'login.html';
    };

    document.getElementById('btnSidebarSignout')?.addEventListener('click', executeLogoutChain);
    document.getElementById('btnTopBarLogout')?.addEventListener('click', executeLogoutChain);
}

function clearFormTrackingStates() {
    const submissionForm = document.getElementById('formResourceSubmission');
    if (submissionForm) submissionForm.reset();
    
    document.getElementById('filePlaceholderMeta')?.classList.remove('d-none');
    document.getElementById('fileSelectedFeedback')?.classList.add('d-none');
}

function dispatchUINotificationBanner(msgContentText, contextThemeStyleKey) {
    const alertAnchor = document.getElementById('alertLayoutAnchor');
    if (!alertAnchor) return;

    alertAnchor.innerHTML = `
        <div class="alert alert-${contextThemeStyleKey} alert-dismissible fade show shadow-sm small fw-bold" role="alert">
            <i class="fa-solid ${contextThemeStyleKey === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'} me-2"></i>
            ${msgContentText}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>`;
    setTimeout(() => {
        const targetAlert = alertAnchor.querySelector('.alert');
        if (targetAlert) {
            targetAlert.classList.remove('show');
            setTimeout(() => targetAlert.remove(), 150);
        }
    }, 4000);
}

function escapeHtml(stringText) {
    return String(stringText).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}