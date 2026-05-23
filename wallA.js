/**
 * CodeQueen Wall of Fame Architecture Logic Module
 * Automatically streams existing badges directly via backend data joins
 */

const BACKEND_BASE_URL = 'http://localhost:5000';
const WALL_API_BASE = `${BACKEND_BASE_URL}/walloffame`;

let internalHonoreeRegistry = [];
let verifiedAlumniCache = [];
let selectedAlumnaId = null; // Holds the active MongoDB ID for the submission payload
let currentSelectedFileBinary = null;

document.addEventListener('DOMContentLoaded', async () => {
    const sidebarContainer = document.getElementById('app-navigation-sidebar-container');
    
    document.getElementById('sidebar-open-toggle-trigger')?.addEventListener('click', () => {
        sidebarContainer.classList.add('show-sidebar');
    });

    document.getElementById('sidebar-close-toggle-trigger')?.addEventListener('click', () => {
        sidebarContainer.classList.remove('show-sidebar');
    });

    initBinaryFilePreviewEngine();
    setupInterfaceActionListeners();
    setupAlumniSearchEngine(); // Initialize the custom filtering search menu

    // Synchronize wall collection grid view matrix
    await syncWallOfFameCollection();
});

function initBinaryFilePreviewEngine() {
    const fileSelector = document.getElementById('inputAlumnaFile');
    const iconNode = document.getElementById('previewPhotoIcon');
    const imageNode = document.getElementById('previewPhotoImage');
    const labelsWrapper = document.getElementById('uploadLabelWrapper');

    fileSelector.addEventListener('change', (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!validTypes.includes(selectedFile.type)) {
            alert("File Exception: Only JPEG or PNG formatting is supported.");
            fileSelector.value = '';
            return;
        }

        if (selectedFile.size > 5 * 1024 * 1024) {
            alert("Payload limit: Profile image must be under 5MB.");
            fileSelector.value = '';
            return;
        }

        currentSelectedFileBinary = selectedFile;
        const localBlobStreamUrl = URL.createObjectURL(selectedFile);
        imageNode.src = localBlobStreamUrl;
        imageNode.classList.remove('d-none');
        iconNode.classList.add('d-none');
        labelsWrapper.classList.add('d-none');
    });
}

function setupInterfaceActionListeners() {
    document.getElementById('formWallAction').addEventListener('submit', executeFormPayloadDispatch);

    document.getElementById('btnScrollToForm').addEventListener('click', () => {
        resetFormToCreateMode();
        document.getElementById('formSectionAnchor').scrollIntoView({ behavior: 'smooth' });
    });

    document.getElementById('btnCancelUpdateMode').addEventListener('click', resetFormToCreateMode);
}

function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return { 'Authorization': `Bearer ${token}` };
}

function getAuthHeadersForJson() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

/**
 * Dynamic Alumna Filtering and Input Search Logic
 * Fetches platform users, keeping only those matching role === "alumna"
 */
async function setupAlumniSearchEngine() {
    const searchInput = document.getElementById('inputAlumnaSearch');
    const resultsContainer = document.getElementById('searchSuggestionsContainer');

    try { //function to fetch users from the directory base, then filter only those with the "alumna" role classification for search results
        // Fetch users from directory base
        const response = await fetch(`${BACKEND_BASE_URL}/users/getallalumnae`, {
            method: 'GET',
            headers: getAuthHeadersForJson()
        });

        if (response.ok) {
            const data = await response.json();
            const allUsers = data.result || data || [];
            
            // Critical filter: isolate users containing role explicitly marked "alumna"
            verifiedAlumniCache = allUsers.filter(user => user.role === 'alumna');
            searchInput.placeholder = "Type to search alumnae...";
            searchInput.disabled = false;
        } else {
            searchInput.placeholder = "Error mapping database users";
        }
    } catch (err) {
        console.error("Critical identity collection fault:", err);
        searchInput.placeholder = "Connection connection failure";
    }

    // Input matching keystroke listener
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        resultsContainer.innerHTML = '';

        if (!query) {
            resultsContainer.classList.add('d-none');
            return;
        }

        const filteredList = verifiedAlumniCache.filter(alumna => 
            alumna.name?.toLowerCase().includes(query) || 
            (alumna.cohort && alumna.cohort.toLowerCase().includes(query))
        );

        if (filteredList.length === 0) {
            resultsContainer.innerHTML = '<div class="p-2 text-muted small">No matches found with role "alumna"</div>';
            resultsContainer.classList.remove('d-none');
            return;
        }

        filteredList.forEach(alumna => {
            const rowItem = document.createElement('div');
            rowItem.className = "p-2 dropdown-item small cursor-pointer border-bottom text-dark";
            rowItem.style.cursor = "pointer";
            rowItem.textContent = `${alumna.name} (${alumna.cohort || 'Alumna'})`;
            
            rowItem.addEventListener('click', () => {
                // Record the MongoDB User Identification string
                selectedAlumnaId = alumna._id;
                searchInput.value = alumna.name;
                resultsContainer.innerHTML = '';
                resultsContainer.classList.add('d-none');
                searchInput.classList.add('is-valid');
            });
            resultsContainer.appendChild(rowItem);
        });

        resultsContainer.classList.remove('d-none');
    });

    // Close options box if admin taps outside target container
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !resultsContainer.contains(e.target)) {
            resultsContainer.classList.add('d-none');
        }
    });
}

async function syncWallOfFameCollection() {
    toggleLoaderSpinner(true);
    try {
        const response = await fetch(`${WALL_API_BASE}/getwalloffame`, {
            method: 'GET',
            headers: getAuthHeadersForJson()
        });
        if (response.ok) {
            const data = await response.json();
            internalHonoreeRegistry = data.result || data || [];
            renderHonoreesDisplayMatrix();
        }
    } catch (err) {
        console.error(err);
        dispatchNotificationBanner("Could not synchronize wall data records.", "danger");
    } finally {
        toggleLoaderSpinner(false);
    }
}

/**
 * Renders Showcase cards, parsing the nested badge collection references found inside the matched user object
 */
function renderHonoreesDisplayMatrix() {
    const gridNode = document.getElementById('honoreesGridContainer');
    gridNode.innerHTML = '';

    const isEmpty = internalHonoreeRegistry.length === 0;
    document.getElementById('noHonoreesPlaceholder').classList.toggle('d-none', !isEmpty);

    internalHonoreeRegistry.forEach(item => {
        const itemCol = document.createElement('div');
        itemCol.className = "col-12 col-md-6 col-lg-4";

        // Accesses joined document badges array mapped inside the user document model reference
        const targetProfileBadges = item.alumnaId?.badges || item.badges || [];
        
        const renderedBadgesHTML = targetProfileBadges.length > 0
            ? targetProfileBadges.map(b => `
                <div class="micro-badge-item" title="${b.name || 'Ecosystem Award'}">
                    <i class="fa-solid ${b.icon || 'fa-award'}"></i>
                </div>`).join('')
            : `<div class="micro-badge-item" title="Distinguished Alumna"><i class="fa-solid fa-star"></i></div>`;

        const computedName = item.alumnaId?.name || item.name || "Distinguished Alumna";
        const sourcePhotoUrl = item.photoUrl 
            ? (item.photoUrl.startsWith('http') ? item.photoUrl : `${BACKEND_BASE_URL}${item.photoUrl}`)
            : 'https://via.placeholder.com/150?text=CodeQueen';

        itemCol.innerHTML = `
            <div class="honoree-showcase-card shadow-sm">
                <div>
                    <div class="avatar-laurel-frame">
                        <img src="${sourcePhotoUrl}" class="honoree-avatar" onerror="this.src='https://via.placeholder.com/150?text=CodeQueen'">
                    </div>
                    <div>
                        <div class="ribbon-title-badge">${computedName}</div>
                    </div>
                    <div class="small text-start mb-2 text-muted">
                        <strong class="text-dark">Achievement:</strong> ${item.achievement || item.specialAchievement}
                    </div>
                    <div class="small text-start mb-3 text-muted">
                        <strong class="text-dark">Category:</strong> 
                        <span class="badge bg-light text-secondary border px-2">${item.category || item.spotlightCategory}</span>
                    </div>
                </div>
                <div class="border-top pt-3 mt-2">
                    <div class="d-flex justify-content-center gap-2 mb-3">
                        ${renderedBadgesHTML}
                    </div>
                    <div class="d-flex justify-content-center gap-2">
                        <button class="btn btn-action-outline btn-sm text-dark" onclick="hydrateFormForEdit('${item._id}')">
                            <i class="fa-solid fa-edit text-muted me-1"></i> Update
                        </button>
                        <button class="btn btn-action-outline btn-sm text-danger" onclick="dispatchDeleteTransaction('${item._id}')">
                            <i class="fa-solid fa-trash-can me-1"></i> Delete
                        </button>
                    </div>
                </div>
            </div>`;
        gridNode.appendChild(itemCol);
    });
}

async function executeFormPayloadDispatch(e) {
    e.preventDefault();

    const currentRecordID = document.getElementById('fieldHonoreeId').value;

    if (!selectedAlumnaId) {
        alert("Selection Missing: Please type and select an active profile containing the 'alumna' role classification.");
        return;
    }

    const formStreamWrapper = new FormData();
    formStreamWrapper.append('alumnaId', selectedAlumnaId); // Transmits the targeted user profile ID
    formStreamWrapper.append('category', document.getElementById('selectCategory').value);
    formStreamWrapper.append('achievement', document.getElementById('textareaAchievement').value.trim());
    
    if (currentSelectedFileBinary) {
        formStreamWrapper.append('photo', currentSelectedFileBinary); 
    }

    let targetUrl = `${WALL_API_BASE}/addhonoree`;
    let transportMethod = 'POST';

    if (currentRecordID) {
        targetUrl = `${WALL_API_BASE}/updatehonoree`;
        transportMethod = 'PUT';
        formStreamWrapper.append('id', currentRecordID);
    }

    try {
        const response = await fetch(targetUrl, {
            method: transportMethod,
            headers: getAuthHeaders(),
            body: formStreamWrapper
        });

        const feedback = await response.json();

        if (response.ok) {
            dispatchNotificationBanner(feedback.message || "Wall of Fame data updated.", "success");
            resetFormToCreateMode();
            await syncWallOfFameCollection();
        } else {
            alert(`Backend operational error: ${feedback.message}`);
        }
    } catch (error) {
        console.error(error);
        dispatchNotificationBanner("Communication transaction failed across network stream.", "danger");
    }
}

function hydrateFormForEdit(id) {
    const target = internalHonoreeRegistry.find(h => h._id === id);
    if (!target) return;

    resetFormToCreateMode();

    document.getElementById('formHeaderTitle').innerText = `Modify Entry Profile`;
    document.getElementById('fieldHonoreeId').value = target._id;

    // Isolate underlying identifier references from join state mapping models
    const resolvedId = target.alumnaId?._id || target.alumnaId || '';
    const resolvedName = target.alumnaId?.name || target.name || '';
    
    selectedAlumnaId = resolvedId;
    const searchInput = document.getElementById('inputAlumnaSearch');
    searchInput.value = resolvedName;
    searchInput.classList.add('is-valid');
    
    document.getElementById('selectCategory').value = target.category || target.spotlightCategory || '';
    document.getElementById('textareaAchievement').value = target.achievement || target.specialAchievement || '';
    
    if (target.photoUrl || target.imageUrl) {
        const imageNode = document.getElementById('previewPhotoImage');
        const iconNode = document.getElementById('previewPhotoIcon');
        const labelsWrapper = document.getElementById('uploadLabelWrapper');
        
        const pathString = target.photoUrl || target.imageUrl;
        const fullSourceUrl = pathString.startsWith('http') ? pathString : `${BACKEND_BASE_URL}${pathString}`;
        imageNode.src = fullSourceUrl;
        imageNode.classList.remove('d-none');
        iconNode.classList.add('d-none');
        labelsWrapper.classList.add('d-none');
    }

    document.getElementById('btnCancelUpdateMode').classList.remove('d-none');
    document.getElementById('btnSubmitForm').innerHTML = '<i class="fa-solid fa-save"></i> Save Changes';
    document.getElementById('formSectionAnchor').scrollIntoView({ behavior: 'smooth' });
}

async function dispatchDeleteTransaction(id) {
    if (!confirm("Remove this entry profile permanently?")) return;

    try {
        const response = await fetch(`${WALL_API_BASE}/deletehonoree`, {
            method: 'DELETE',
            headers: getAuthHeadersForJson(),
            body: JSON.stringify({ id: id })
        });
        const outcome = await response.json();
        if (response.ok) {
            dispatchNotificationBanner(outcome.message || "Entry deleted successfully.", "warning");
            await syncWallOfFameCollection();
        }
    } catch (err) {
        console.error(err);
    }
}

function resetFormToCreateMode() {
    document.getElementById('formWallAction').reset();
    document.getElementById('fieldHonoreeId').value = '';
    selectedAlumnaId = null;
    
    const searchInput = document.getElementById('inputAlumnaSearch');
    searchInput.classList.remove('is-valid');
    searchInput.placeholder = "Type to search alumnae...";

    document.getElementById('formHeaderTitle').innerText = "Add Alumna to Wall of Fame";
    document.getElementById('btnSubmitForm').innerHTML = '<i class="fa-solid fa-paper-plane"></i> Publish';
    document.getElementById('btnCancelUpdateMode').classList.add('d-none');
    
    const imageNode = document.getElementById('previewPhotoImage');
    const iconNode = document.getElementById('previewPhotoIcon');
    const labelsWrapper = document.getElementById('uploadLabelWrapper');
    imageNode.src = '';
    imageNode.classList.add('d-none');
    iconNode.classList.remove('d-none');
    labelsWrapper.classList.remove('d-none');
    
    currentSelectedFileBinary = null;
    document.getElementById('inputAlumnaFile').value = '';
}

function toggleLoaderSpinner(show) {
    const loader = document.getElementById('showcaseSpinner');
    if (show) loader?.classList.remove('d-none');
    else loader?.classList.add('d-none');
}

function dispatchNotificationBanner(message, typeStyle) {
    const anchor = document.getElementById('alertFeedbackAnchor');
    anchor.innerHTML = `
        <div class="alert alert-${typeStyle} alert-dismissible fade show shadow-sm small fw-bold" role="alert">
            <i class="fa-solid ${typeStyle === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'} me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>`;
    setTimeout(() => {
        const activeAlert = bootstrap.Alert.getInstance(anchor.querySelector('.alert'));
        activeAlert?.close();
    }, 4000);
}