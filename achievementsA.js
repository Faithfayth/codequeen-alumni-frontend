/**
 * Admin Community Achievements Interaction Controller Interceptor Script Engine
 * Orchestrated cleanly to align with the exact endpoints and backend responses.
 */

// Global Base API Path Route
const API_BASE_URL = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost' ? 'https://cq-a-bckd.onrender.com' : 'http://localhost:5000'; // Adjust port to match your local Node.js environment

// Memory layout global object store lists allocations tracking arrays
let systemAchievementsRegistryCache = [];
// let attachedPhotoBinaryPayloadFile = null;

document.addEventListener('DOMContentLoaded', () => {
    // Mobilize slide panel mobile navigation links bindings routines
    initMobileWorkspaceLayoutTriggers();

    // Pull historical document schemas arrays instances mappings
    fetchMasterAchievementsCollectionStream();
});

/**
 * Mobile responsive drawer trigger links activation maps setup
 */
function initMobileWorkspaceLayoutTriggers() {
    const toggleBtn = document.getElementById('mobile-sidebar-toggle');
    const menuContainer = document.getElementById('app-sidebar');
    if (toggleBtn && menuContainer) {
        toggleBtn.addEventListener('click', () => {
            menuContainer.classList.toggle('show-sidebar');
        });
    }
}

/**
 * Pull records directly from the specified backend matching route: /getallachievements
 */
async function fetchMasterAchievementsCollectionStream() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/achievements/getallachievements`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        if (response.ok) {
            const dataWrapper = await response.json();
            // Accessing the payload explicitly using the .result key defined in your controller
            systemAchievementsRegistryCache = dataWrapper.result || [];
            renderAchievementsDeckView(systemAchievementsRegistryCache);
        } else {
            loadMockFallbackAchievementsDesignDeck();
        }
    } catch (err) {
        console.warn('API route path unreached safely. Loading default UI framework mockup.');
        loadMockFallbackAchievementsDesignDeck();
    }
}

/**
 * Formulates the array of rows card matrices directly into the DOM container
 */
function renderAchievementsDeckView(itemsList) {
    const deckContainer = document.getElementById('achievements-dynamic-deck-container');
    if (!deckContainer) return;

    if (itemsList.length === 0) {
        deckContainer.innerHTML = `
            <div class="text-center py-5 border rounded-3 bg-light">
                <i class="bi bi-trophy text-muted fs-1 mb-2 d-block"></i>
                <div class="small text-muted">No historical community achievements entries cataloged under scope views.</div>
            </div>`;
        return;
    }

    deckContainer.innerHTML = '';
    itemsList.forEach(achievement => {
        const id = achievement._id || achievement.id;
        const photoSrc = achievement.ImageUrl || achievement.photoUrl || '';
        
        const thumbnailBoxMarkup = photoSrc 
            ? `<img src="${photoSrc}" alt="Achievement Asset Display">`
            : `<i class="bi bi-image fs-1 opacity-50"></i><small class="text-uppercase tracking-wider fw-bold mt-1" style="font-size:0.65rem;">Photo</small>`;

        const elementCardHTML = `
            <div class="achievement-item-card shadow-sm" id="achievement-node-block-${id}">
                <div class="achievement-photo-frame">
                    ${thumbnailBoxMarkup}
                </div>
                
                <div class="achievement-details-box">
                    <div>
                        <h4 class="fw-bold text-dark mb-1" style="font-size: 1.3rem;">${achievement.title || 'Untitled Achievement'}</h4>
                        <p class="text-secondary mb-2 small style-desc-body-clamp">${achievement.description || 'No description summary data block submitted.'}</p>
                    </div>
                    
                    <div class="d-flex justify-content-between align-items-center pt-2">
                        <span class="badge bg-light text-secondary border px-3 py-1 rounded-pill small fw-medium">${achievement.category || 'General'}</span>
                        <div class="d-flex gap-2">
                            <button class="action-outline-btn" onclick="initiateTargetUpdateWorkflow('${id}')">
                                <i class="bi bi-pencil-square"></i> Update
                            </button>
                            <button class="action-outline-btn btn-delete-mode" onclick="executeDestructiveDeletePipeline('${id}')">
                                <i class="bi bi-trash3"></i> Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>`;
        deckContainer.insertAdjacentHTML('beforeend', elementCardHTML);
    });
}

/**
 * Triggers document file input elements click events
 */
function triggerSystemVirtualFileSelect() {
    document.getElementById('form-hidden-file-input').click();
}

/**
 * Generates immediate memory rendering layout maps mapping file data images inside form cards
 */
function processLocalPhotoPreviewLoad(event) {
    const fileNodeSource = event.target.files[0];
    if (!fileNodeSource) return;

    attachedPhotoBinaryPayloadFile = fileNodeSource;

    const memoryReader = new FileReader();
    memoryReader.onload = function(e) {
        const previewImageTag = document.getElementById('uploader-image-preview-node');
        const internalPromptView = document.getElementById('uploader-prompt-content-view');
        
        if (previewImageTag && internalPromptView) {
            previewImageTag.src = e.target.result;
            previewImageTag.classList.remove('d-none');
            internalPromptView.classList.add('d-none');
        }
    };
    memoryReader.readAsDataURL(fileNodeSource);
}

/**
 * Handles Form submissions, converting objects and variables to match your exact controller requirements.
 */
async function executeSubmitFormRegistryEntry(event) {
    event.preventDefault();

    const entryId = document.getElementById('form-entry-operation-id').value.trim();
    const titleVal = document.getElementById('form-achievement-title').value.trim();
    const descVal = document.getElementById('form-achievement-desc').value.trim();
    const categoryVal = document.getElementById('form-achievement-category').value;
    const dateVal = document.getElementById('form-achievement-date').value;

    // Note: Your controller expects JSON content parsing from `req.body`.
    // If you plan to pass raw file streams across properties directly later, use Cloudinary middleware.
    // Right now, we construct a JSON structure passing the preview/URL string to `ImageUrl`.
    const previewImageTag = document.getElementById('uploader-image-preview-node');
    const computedImageUrlString = previewImageTag.src && !previewImageTag.classList.contains('d-none') ? previewImageTag.src : "";

    const jsonPayload = {
        title: titleVal,
        description: descVal,
        category: categoryVal,
        date: dateVal,
        ImageUrl: computedImageUrlString 
    };

    let dynamicRequestUrlPath = `${API_BASE_URL}/api/achievements/createachievement`;
    let dynamicHttpMethodVerb = 'POST';

    // Reroute paths dynamically if updating existing database items
    if (entryId.length > 0) {
        dynamicRequestUrlPath = `${API_BASE_URL}/api/achievements/updateachievement/${entryId}`;
        dynamicHttpMethodVerb = 'PUT';
    }

    try {
        const response = await fetch(dynamicRequestUrlPath, {
            method: dynamicHttpMethodVerb,
            headers: { 
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(jsonPayload)
        });

        if (response.ok) {
            alert('Achievement document catalog parameters processed successfully.');
            resetFormStudioWorkspaceLayout();
            fetchMasterAchievementsCollectionStream();
        } else {
            const errorReport = await response.json();
            alert(`Execution failed: ${errorReport.message || 'Server rejected request format.'}`);
        }
    } catch (err) {
        console.warn('API execution path dropped; managing modification locally inside sandbox environment arrays.');
        executeLocalMutationFallbackSimulation(entryId, titleVal, descVal, categoryVal, dateVal, computedImageUrlString);
    }
}

/**
 * Loads selected records back down directly inside your input form fields
 */
function initiateTargetUpdateWorkflow(achievementId) {
    const itemMatch = systemAchievementsRegistryCache.find(a => (a._id || a.id) === achievementId);
    if (!itemMatch) return;

    document.getElementById('studio-form-title').innerText = 'Update Achievement Details';
    document.getElementById('btn-submit-action-text').innerText = 'Update Details';
    document.getElementById('btn-cancel-update-mode').classList.remove('d-none');
    
    document.getElementById('form-entry-operation-id').value = achievementId;
    document.getElementById('form-achievement-title').value = itemMatch.title || '';
    document.getElementById('form-achievement-desc').value = itemMatch.description || '';
    document.getElementById('form-achievement-category').value = itemMatch.category || '';
    
    if (itemMatch.date) {
        const parsedIsoStringDate = new Date(itemMatch.date).toISOString().split('T')[0];
        document.getElementById('form-achievement-date').value = parsedIsoStringDate;
    }

    const previewImageTag = document.getElementById('uploader-image-preview-node');
    const internalPromptView = document.getElementById('uploader-prompt-content-view');
    const currentImg = itemMatch.ImageUrl || itemMatch.photoUrl;
    if (currentImg) {
        previewImageTag.src = currentImg;
        previewImageTag.classList.remove('d-none');
        internalPromptView.classList.add('d-none');
    }

    scrollToStudioFormDeck();
}

/**
 * Triggers structural document delete parameters via endpoint route: /deleteachievement/:id
 */
async function executeDestructiveDeletePipeline(id) {
    if (!confirm('Are you sure you want to permanently delete this community achievement record entry?')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/api/achievements/deleteachievement/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        if (response.ok) {
            fetchMasterAchievementsCollectionStream();
        } else {
            executeLocalDeletionSimulation(id);
        }
    } catch (err) {
        executeLocalDeletionSimulation(id);
    }
}

function executeLocalDeletionSimulation(id) {
    systemAchievementsRegistryCache = systemAchievementsRegistryCache.filter(a => (a._id || a.id) !== id);
    renderAchievementsDeckView(systemAchievementsRegistryCache);
}

/**
 * Simulation data storage processor loop fallback layer
 */
function executeLocalMutationFallbackSimulation(id, title, desc, cat, dateStr, imageString) {
    if (id.length > 0) {
        const item = systemAchievementsRegistryCache.find(a => (a._id || a.id) === id);
        if (item) {
            item.title = title;
            item.description = desc;
            item.category = cat;
            item.date = dateStr;
            item.ImageUrl = imageString;
        }
    } else {
        const simulatedMockInstanceNode = {
            id: 'mock-ach-' + Date.now(),
            title: title,
            description: desc,
            category: cat,
            date: dateStr,
            ImageUrl: imageString
        };
        systemAchievementsRegistryCache.push(simulatedMockInstanceNode);
    }
    renderAchievementsDeckView(systemAchievementsRegistryCache);
    resetFormStudioWorkspaceLayout();
}

/**
 * Filters elements cards layout display using user input search tags strings matching metrics
 */
function executeAchievementsSearchFilter() {
    const textQuery = document.getElementById('achievements-search-bar').value.toLowerCase().trim();

    if (textQuery.length === 0) {
        renderAchievementsDeckView(systemAchievementsRegistryCache);
        return;
    }

    const outputFilteredListings = systemAchievementsRegistryCache.filter(ach => {
        return (
            (ach.title || '').toLowerCase().includes(textQuery) ||
            (ach.description || '').toLowerCase().includes(textQuery) ||
            (ach.category || '').toLowerCase().includes(textQuery)
        );
    });

    renderAchievementsDeckView(outputFilteredListings);
}

function resetFormStudioWorkspaceLayout() {
    document.getElementById('achievement-mutation-form').reset();
    document.getElementById('form-entry-operation-id').value = '';
    attachedPhotoBinaryPayloadFile = null;

    const previewImageTag = document.getElementById('uploader-image-preview-node');
    const internalPromptView = document.getElementById('uploader-prompt-content-view');
    
    if (previewImageTag && internalPromptView) {
        previewImageTag.src = '';
        previewImageTag.classList.add('d-none');
        internalPromptView.classList.remove('d-none');
    }

    exitUpdateActiveStateWindow();
}

function exitUpdateActiveStateWindow() {
    document.getElementById('studio-form-title').innerText = 'Add Achievement';
    document.getElementById('btn-submit-action-text').innerText = 'Save Changes';
    document.getElementById('btn-cancel-update-mode').classList.add('d-none');
    document.getElementById('form-entry-operation-id').value = '';
}

function scrollToStudioFormDeck() {
    const anchorNode = document.getElementById('studio-form-deck-anchor');
    if (anchorNode) {
        anchorNode.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

/**
 * Default offline fallback framework records array mock configuration definitions mappings
 */
function loadMockFallbackAchievementsDesignDeck() {
    const sampleMockAchievements = [
        { id: 'ach01', title: 'Top Dev Award', description: 'Recognizing excellence in software engineering architectures.', category: 'Innovation & Tech', date: '2026-04-12', ImageUrl: '' },
        { id: 'ach02', title: 'Community Mentorship Champion', description: 'Awarded to alumnae dedication pathways supporting and building engineering infrastructure pipelines.', category: 'Community Impact', date: '2026-05-01', ImageUrl: '' }
    ];

    systemAchievementsRegistryCache = sampleMockAchievements;
    renderAchievementsDeckView(sampleMockAchievements);
}