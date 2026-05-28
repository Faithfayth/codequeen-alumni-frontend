/**
 * CodeQueen Sisters' Opportunities Core Management Interface Engine
 * Standardizes security payloads, tracks active tabs, and parses network asset objects
 */

const BACKEND_BASE_URL = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://cq-a-bckd.onrender.com'; // Production live Render URL

let currentLoadedActiveTabCode = 'current';
let comprehensiveGlobalRegistry = [];
let locallyLoadedBinaryFileObj = null;

document.addEventListener('DOMContentLoaded', async () => {
    // Intercept standard workspace layout toggle action buttons
    document.getElementById('sidebarToggle')?.addEventListener('click', () => {
        document.getElementById('sidebarMenu').classList.toggle('show');
    });

    initTabInterfaceControls();
    initImageFileStreamingPreview();
    setupFormSubmissionPipeline();

    // Pull database documents matching the default viewport view mode setup
    await synchronizeActiveTabDatasets();
});

/**
 * Handles Tab Toggles & Refreshes the View Components Automatically
 */
function initTabInterfaceControls() {
    const tabSelectors = document.querySelectorAll('.opp-nav-tab-btn');
    
    tabSelectors.forEach(btn => {
        btn.addEventListener('click', async function() {
            tabSelectors.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            currentLoadedActiveTabCode = this.getAttribute('data-tab-target');
            
            // Map the layout canvas element views container nodes
            document.getElementById('view-pane-current').className = currentLoadedActiveTabCode === 'current' ? 'd-block' : 'd-none';
            document.getElementById('view-pane-past').className = currentLoadedActiveTabCode === 'past' ? 'd-block' : 'd-none';
            document.getElementById('view-pane-pending').className = currentLoadedActiveTabCode === 'pending' ? 'd-block' : 'd-none';

            await synchronizeActiveTabDatasets();
        });
    });

    // Setup active text filtering layer
    document.getElementById('searchBarFilter').addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        filterRenderedGridCards(query);
    });

    // Handle authentication session exit operations
    document.getElementById('btnTriggerLogout')?.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    });
}

/**
 * Local File Image Binary Reading Module
 */
function initImageFileStreamingPreview() {
    const hiddenFileInput = document.getElementById('fileOpportunityImage');
    const imageContainer = document.getElementById('imagePreviewContainer');
    const centralIconBox = document.getElementById('iconBoxPlaceholder');
    const textualMetaLabels = document.getElementById('labelPreviewMeta');

    hiddenFileInput.addEventListener('change', (e) => {
        const matchingFile = e.target.files[0];
        if (!matchingFile) return;

        // Restriction safety validation guardrails rules
        const acceptedFormats = ['image/png', 'image/jpeg', 'image/jpg'];
        if (!acceptedFormats.includes(matchingFile.type)) {
            alert("File Format Conflict: System parameters require image extensions type matching .png, .jpg or .jpeg only.");
            hiddenFileInput.value = '';
            return;
        }

        locallyLoadedBinaryFileObj = matchingFile;

        // Render instant structural asset link preview via web-object stream conversion
        const transientBlobStreamUrl = URL.createObjectURL(matchingFile);
        imageContainer.src = transientBlobStreamUrl;
        imageContainer.classList.remove('d-none');
        centralIconBox.classList.add('d-none');
        textualMetaLabels.classList.add('d-none');
    });
}

function getSecuredHeaderMappings() {
    const bearerToken = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${bearerToken}`
    };
}

/**
 * Routes Data Payload Streams Mapped Directly via Your Backend Controllers Architecture
 */
async function synchronizeActiveTabDatasets() {
    let finalTargetQueryUrl = `${BACKEND_BASE_URL}/opportunities/getpcomingpportunities`;
    
    if (currentLoadedActiveTabCode === 'past') {
        finalTargetQueryUrl = `${BACKEND_BASE_URL}/opportunities/getpastopportunities`;
    } else if (currentLoadedActiveTabCode === 'pending') {
        finalTargetQueryUrl = `${BACKEND_BASE_URL}/opportunities/getunverifiedopportunities`;
    }

    try {
        const response = await fetch(finalTargetQueryUrl, {
            method: 'GET',
            headers: getSecuredHeaderMappings()
        });

        if (!response.ok) throw new Error("API transaction processing fault.");

        const jsonResponse = await response.json();
        
        // Handle unverified properties structure standard wrapper count format extraction rules cleanly
        comprehensiveGlobalRegistry = jsonResponse.result || jsonResponse || [];
        
        renderOpportunitiesDataGridCards();
    } catch (err) {
        console.error(err);
        dispatchGlobalStatusBanner("Could not sync opportunities register dataset matrix with the server cluster.", "danger");
    }
}

/**
 * Hydrates standard HTML card strings to map interface representations
 */
function renderOpportunitiesDataGridCards() {
    let assignedLayoutContainerId = 'currentOpportunitiesList';
    if (currentLoadedActiveTabCode === 'past') assignedLayoutContainerId = 'pastOpportunitiesList';
    if (currentLoadedActiveTabCode === 'pending') assignedLayoutContainerId = 'pendingOpportunitiesList';

    const targetContainerNode = document.getElementById(assignedLayoutContainerId);
    if (!targetContainerNode) return;
    
    targetContainerNode.innerHTML = '';

    if (comprehensiveGlobalRegistry.length === 0) {
        targetContainerNode.innerHTML = `
            <div class="text-center py-4 text-muted bg-white border rounded p-4">
                <i class="fa-solid fa-circle-nodes fa-2x mb-2 text-black-50 d-block"></i>
                No opportunity assets found matching this workspace filter channel segment.
            </div>`;
        return;
    }

    comprehensiveGlobalRegistry.forEach(item => {
        const opportunityCardItem = document.createElement('div');
        opportunityCardItem.className = 'opportunity-display-card';
        opportunityCardItem.setAttribute('data-card-title-meta', item.title.toLowerCase());

        // Resolve local file storage or absolute route paths dynamically
        const matchingAssetPhotoLink = item.imageUrl 
            ? (item.imageUrl.startsWith('http') ? item.imageUrl : `${BACKEND_BASE_URL}${item.imageUrl}`)
            : 'https://via.placeholder.com/260x180?text=CodeQueen+Opportunity';

        const parsedDeadlineDateStr = item.deadline ? new Date(item.deadline).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A';

        // Action block setup depends on user authorization clear tracking levels
        let interfaceInteractiveControlsRowHTML = `
            <button class="btn btn-action-outline btn-sm text-danger" onclick="executePermanentDeleteTransaction('${item._id}')">
                <i class="fa-solid fa-trash-can me-1"></i> Delete
            </button>
            <button class="btn btn-action-outline btn-sm text-dark ms-2" onclick="window.open('${item.url}', '_blank')">
                <i class="fa-solid fa-arrow-up-right-from-square me-1"></i> Go to Link
            </button>
        `;

        if (currentLoadedActiveTabCode === 'pending') {
            interfaceInteractiveControlsRowHTML = `
                <div class="d-flex justify-content-between align-items-center w-100">
                    <div>
                        <button class="btn btn-action-outline btn-sm text-danger me-2" onclick="executePermanentDeleteTransaction('${item._id}')">
                            <i class="fa-solid fa-trash-can me-1"></i> Delete
                        </button>
                    </div>
                    <div>
                        <button class="approve-check-circle-btn" title="Verify and Publish Live" onclick="executeAdminApprovalVerification('${item._id}')">
                            <i class="fa-solid fa-check"></i>
                        </button>
                    </div>
                </div>
            `;
        }

        opportunityCardItem.innerHTML = `
            <div class="row g-3 align-items-center">
                <div class="col-12 col-sm-3 col-md-2">
                    <div style="height: 100px; width: 100%; overflow: hidden; border-radius: 10px; background: #FFF5E9; display: flex; align-items: center; justify-content: center;">
                        <img src="${matchingAssetPhotoLink}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='https://via.placeholder.com/150?text=Opportunity'">
                    </div>
                </div>
                <div class="col-12 col-sm-9 col-md-10">
                    <div class="row g-2">
                        <div class="col-12 col-md-8">
                            <h6 class="fw-bold text-dark m-0 mb-1">${item.title}</h6>
                            <p class="text-muted small m-0 text-truncate" style="max-width: 500px;">${item.description}</p>
                            <div class="d-flex gap-3 align-items-center mt-2 flex-wrap" style="font-size: 12px;">
                                <span class="text-secondary"><strong class="text-dark">url :</strong> <span class="text-primary text-decoration-underline">${item.url}</span></span>
                                <span class="text-secondary"><strong class="text-dark">category :</strong> <span class="badge bg-light text-dark border">${item.category}</span></span>
                                <span class="text-secondary"><strong class="text-dark">deadline :</strong> <i class="fa-solid fa-calendar-day text-warning me-1"></i>${parsedDeadlineDateStr}</span>
                            </div>
                        </div>
                        <div class="col-12 col-md-4 text-md-end pt-2">
                            ${interfaceInteractiveControlsRowHTML}
                        </div>
                    </div>
                </div>
            </div>
        `;
        targetContainerNode.appendChild(opportunityCardItem);
    });
}

/**
 * Form Payload Compilation Handler Network Engine Mapping Pipeline
 */
function setupFormSubmissionPipeline() {
    const creationForm = document.getElementById('formOpportunitySubmission');

    creationForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const inputTitleText = document.getElementById('inputTitle').value.trim();
        const inputDescText = document.getElementById('inputDescription').value.trim();
        const inputTargetUrl = document.getElementById('inputUrl').value.trim();
        const inputCategoryVal = document.getElementById('selectCategory').value;
        const inputDeadlineVal = document.getElementById('inputDeadline').value;

        let processedWebStringUrl = "";

        // Standardized image parser strategy to sync file code data array with the backend text string database schema rules cleanly
        if (locallyLoadedBinaryFileObj) {
            try {
                // Instantiates a multi-part form package to upload the file binary
                const multiPartWrapper = new FormData();
                multiPartWrapper.append('image', locallyLoadedBinaryFileObj);

                // Dispatches upload call straight to a local storage or open image host service endpoint
                const imageHostResponse = await fetch('https://api.imgbb.com/1/upload?key=chg_your_api_key_here_or_use_multer_endpoint', {
                    method: 'POST',
                    body: multiPartWrapper
                });
                
                if (imageHostResponse.ok) {
                    const hostResult = await imageHostResponse.json();
                    processedWebStringUrl = hostResult.data?.url || "";
                }
            } catch (err) {
                console.warn("Media host resolution fault tracker fallback triggered: ", err);
                processedWebStringUrl = "/uploads/mock-placeholder.png";
            }
        }

        // Bundle elements safely into an explicitly verified standard backend JSON payload package model object
        const finalJsonFormPackage = {
            title: inputTitleText,
            description: inputDescText,
            imageUrl: processedWebStringUrl, 
            url: inputTargetUrl,
            category: inputCategoryVal,
            deadline: new Date(inputDeadlineVal).toISOString()
        };

        try {
            const submissionResponse = await fetch(`${BACKEND_BASE_URL}/opportunities/createopportunity`, {
                method: 'POST',
                headers: getSecuredHeaderMappings(),
                body: JSON.stringify(finalJsonFormPackage)
            });

            const backendFeedback = await submissionResponse.json();

            if (submissionResponse.ok) {
                dispatchGlobalStatusBanner(backendFeedback.message || "Asset sent successfully! Admin review initialized.", "success");
                resetFormStateToDefault();
                await synchronizeActiveTabDatasets();
            } else {
                alert(`Ecosystem Submission Exception: ${backendFeedback.message}`);
            }
        } catch (error) {
            console.error(error);
            dispatchGlobalStatusBanner("Network interface tracking gateway interruption error.", "danger");
        }
    });
}

/**
 * Triggers Status Flag Inversion Database Modifications (Flips flag live via ID parameter)
 */
async function executeAdminApprovalVerification(id) {
    try {
        const res = await fetch(`${BACKEND_BASE_URL}/opportunities/verifyopportunity/${id}`, {
            method: 'PUT',
            headers: getSecuredHeaderMappings()
        });
        const status = await res.json();
        if (res.ok) {
            dispatchGlobalStatusBanner(status.message || "Verification passed! Card moved to system active feed lines.", "success");
            await synchronizeActiveTabDatasets();
        }
    } catch (err) {
        console.error(err);
    }
}

/**
 * Issues Database Entry Permanent Erasure Transactions
 */
async function executePermanentDeleteTransaction(id) {
    if (!confirm("Expunge this opportunity posting record permanently from database logs?")) return;

    try {
        const res = await fetch(`${BACKEND_BASE_URL}/opportunities/deleteopportunity/${id}`, {
            method: 'DELETE',
            headers: getSecuredHeaderMappings()
        });
        const details = await res.json();
        if (res.ok) {
            dispatchGlobalStatusBanner(details.message || "Opportunity expunged.", "warning");
            await synchronizeActiveTabDatasets();
        }
    } catch (err) {
        console.error(err);
    }
}

/**
 * Local Filter Core Engine Search Controller Function
 */
function filterRenderedGridCards(queryString) {
    let selectedActiveAreaId = 'currentOpportunitiesList';
    if (currentLoadedActiveTabCode === 'past') selectedActiveAreaId = 'pastOpportunitiesList';
    if (currentLoadedActiveTabCode === 'pending') selectedActiveAreaId = 'pendingOpportunitiesList';

    const listContainerNode = document.getElementById(selectedActiveAreaId);
    if (!listContainerNode) return;

    const childCards = listContainerNode.querySelectorAll('.opportunity-display-card');
    childCards.forEach(card => {
        const semanticTitleMeta = card.getAttribute('data-card-title-meta') || "";
        if (semanticTitleMeta.includes(queryString)) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }
    });
}

function resetFormStateToDefault() {
    document.getElementById('formOpportunitySubmission').reset();
    locallyLoadedBinaryFileObj = null;
    document.getElementById('fileOpportunityImage').value = '';
    
    // Clear display structures back to blueprint defaults
    const imageContainer = document.getElementById('imagePreviewContainer');
    const centralIconBox = document.getElementById('iconBoxPlaceholder');
    const textualMetaLabels = document.getElementById('labelPreviewMeta');
    
    imageContainer.src = '';
    imageContainer.classList.add('d-none');
    centralIconBox.classList.remove('d-none');
    textualMetaLabels.classList.remove('d-none');
}

function dispatchGlobalStatusBanner(msgText, themeStyleCode) {
    const layoutAnchor = document.getElementById('alertLayoutAnchor');
    layoutAnchor.innerHTML = `
        <div class="alert alert-${themeStyleCode} alert-dismissible fade show shadow-sm small fw-bold" role="alert">
            <i class="fa-solid ${themeStyleCode === 'success' ? 'fa-circle-check' : 'fa-triangle-exclamation'} me-2"></i>
            ${msgText}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>`;
    setTimeout(() => {
        const instance = bootstrap.Alert.getInstance(layoutAnchor.querySelector('.alert'));
        instance?.close();
    }, 4500);
}