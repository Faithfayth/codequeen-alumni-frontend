/**
 * Frontend Controller Operations: Syncs with backend schema constraints.
 * Converts frontend JavaScript object variables to raw serialized JSON text strings.
 */

const BACKEND_API_ROOT = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost' ? 'https://cq-a-bckd.onrender.com' : 'http://localhost:5000';
let activeElectionId = null;

// Overlay References Definitions
let modalSetupObj, modalPostObj, modalCandidateObj;

document.addEventListener('DOMContentLoaded', async () => {
    initUserInterfaceProfileHeader();
    
    modalSetupObj = new bootstrap.Modal(document.getElementById('modalElectionSetup'));
    modalPostObj = new bootstrap.Modal(document.getElementById('modalAddPost'));
    modalCandidateObj = new bootstrap.Modal(document.getElementById('modalAddCandidate'));

    document.getElementById('sidebarToggle')?.addEventListener('click', () => {
        document.getElementById('sidebarMenu').classList.toggle('show');
    });

    registerEventHandlers();

    // Trigger sequential pipeline reads
    await refreshElectionsDataWorkspace();
    await preloadAlumnaeDirectoryIndex();
});

function initUserInterfaceProfileHeader() {
    const cachedUserString = localStorage.getItem('user');
    if (cachedUserString) {
        const cachedUser = JSON.parse(cachedUserString);
        if (document.getElementById('headerProfileName')) document.getElementById('headerProfileName').innerText = cachedUser.username || 'Admin';
        if (document.getElementById('headerProfileEmail')) document.getElementById('headerProfileEmail').innerText = cachedUser.email || 'admin@codequeen.com';
    }
}

function registerEventHandlers() {
    document.getElementById('btnOpenCreateElectionModal').addEventListener('click', () => {
        document.getElementById('formElectionSetup').reset();
        modalSetupObj.show();
    });

    document.getElementById('formElectionSetup').addEventListener('submit', dispatchElectionPayloadTransaction);
    document.getElementById('formAddPost').addEventListener('submit', dispatchPostPositionTransaction);
    document.getElementById('formAddCandidate').addEventListener('submit', dispatchCandidateTransaction);
    document.getElementById('switchElectionActive').addEventListener('change', dispatchToggleStateTransaction);
    
    document.getElementById('btnTriggerAddPostModal').addEventListener('click', () => {
        document.getElementById('formAddPost').reset();
        modalPostObj.show();
    });
}

/**
 * Packs clean headers declaring standard JSON content transport targets
 */
function getSecurityRequestHeaders() {
    const activeToken = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${activeToken}`
    };
}

/**
 * GET - Pulls array indexes from /getactiveelections
 */
async function refreshElectionsDataWorkspace() {
    toggleVisualLoader(true);
    try {
        const response = await fetch(`${BACKEND_API_ROOT}/getactiveelections`, {
            method: 'GET',
            headers: getSecurityRequestHeaders()
        });

        // Defensive Route Interceptor
        if (!response.ok) {
            console.error(`Route handshake dropped. Server state: ${response.status}`);
            showNoElectionPlaceholder();
            return;
        }

        const data = await response.json();
        // Extract array element safely from backend tracking structures 
        let workingElection = Array.isArray(data) ? data[0] : data;

        if (!workingElection) {
            showNoElectionPlaceholder();
            activeElectionId = null;
        } else {
            activeElectionId = workingElection._id;
            hydrateElectionWorkspaceDOM(workingElection);
            document.getElementById('noElectionPlaceholder').classList.add('d-none');
            document.getElementById('activeElectionWorkspace').classList.remove('d-none');
        }
    } catch (err) {
        console.error("Connection processing Exception context:", err);
        showNoElectionPlaceholder();
    } finally {
        toggleVisualLoader(false);
    }
}

function showNoElectionPlaceholder() {
    document.getElementById('noElectionPlaceholder').classList.remove('d-none');
    document.getElementById('activeElectionWorkspace').classList.add('d-none');
}

function hydrateElectionWorkspaceDOM(election) {
    document.getElementById('txtElectionName').innerText = election.electionName;
    document.getElementById('txtElectionDescription').innerText = election.description;
    
    if(election.startDate) document.getElementById('txtStartDate').innerText = new Date(election.startDate).toLocaleDateString();
    if(election.endDate) document.getElementById('txtEndDate').innerText = new Date(election.endDate).toLocaleDateString();
    
    document.getElementById('switchElectionActive').checked = election.isActive;

    const postsContainer = document.getElementById('postsDynamicDOMContainer');
    postsContainer.innerHTML = '';

    if (!election.posts || election.posts.length === 0) {
        postsContainer.innerHTML = `
            <div class="text-center bg-white border rounded-4 py-4 text-muted small">
                <i class="fa-solid fa-folder-open mb-2 d-block"></i> No seats configured yet. Use the option button above to start.
            </div>`;
        return;
    }

    election.posts.forEach((postItem, idx) => {
        const postElementCard = document.createElement('div');
        postElementCard.className = "bg-white p-4 rounded-4 border mb-4 shadow-sm";
        
        let candidateGridItemsHTML = '';

        if (!postItem.candidates || postItem.candidates.length === 0) {
            candidateGridItemsHTML = `
                <div class="col-12">
                    <div class="py-4 text-center text-muted border border-dashed rounded-3 small">
                         No candidates registered for this seat.
                    </div>
                </div>`;
        } else {
            postItem.candidates.forEach(cand => {
                candidateGridItemsHTML += `
                    <div class="col-12 col-sm-6 col-md-4 col-xl-3">
                        <div class="candidate-card">
                            <img src="${cand.imageurl}" class="candidate-avatar" onerror="this.src='https://via.placeholder.com/150'">
                            <h6 class="fw-bold mb-1">${cand.name}</h6>
                            <p class="text-muted small mb-3 text-truncate px-2">"${cand.manifesto}"</p>
                            <div class="bg-light p-2 rounded-3 border">
                                <span class="small text-muted d-block text-uppercase fw-semibold" style="font-size:10px;">Votes Checked</span>
                                <span class="vote-badge m-0">${cand.votesCount}</span>
                            </div>
                        </div>
                    </div>`;
            });
        }

        postElementCard.innerHTML = `
            <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3 pb-2 border-bottom">
                <h5 class="fw-bold m-0 text-secondary d-flex align-items-center" style="font-size: 1rem;">
                    <span class="badge bg-secondary me-2">${idx + 1}</span> Position: ${postItem.postName}
                </h5>
                <div class="d-flex gap-2">
                    <button type="button" class="btn btn-xs btn-gold text-white" onclick="triggerCandidateModalSetup('${postItem.postName}')" style="font-size:12px; padding: 4px 10px;">
                        <i class="fa-solid fa-user-plus"></i> Add Candidate Profile
                    </button>
                </div>
            </div>
            <div class="row g-3">${candidateGridItemsHTML}</div>
        `;
        postsContainer.appendChild(postElementCard);
    });
}

/**
 * POST - Matches target route /createelection using JSON body specs
 */
async function dispatchElectionPayloadTransaction(e) {
    e.preventDefault();
    
    const payload = {
        electionName: document.getElementById('inputElectionName').value,
        description: document.getElementById('inputElectionDescription').value,
        startDate: document.getElementById('inputStartDate').value,
        endDate: document.getElementById('inputEndDate').value
    };

    try {
        const response = await fetch(`${BACKEND_API_ROOT}/createelection`, {
            method: 'POST',
            headers: getSecurityRequestHeaders(),
            body: JSON.stringify(payload) // Compiles data cleanly to JSON text format down the stream
        });

        if (response.ok) {
            modalSetupObj.hide();
            await refreshElectionsDataWorkspace();
        } else {
            const err = await response.json();
            alert(`Creation Failure context: ${err.message}`);
        }
    } catch (xhrError) {
        console.error("AJAX Error context parsing:", xhrError);
    }
}

/**
 * PUT - Matches backend configuration /toggleelectionactive/:id
 */
async function dispatchToggleStateTransaction(e) {
    if (!activeElectionId) return;
    const activeStateToggle = e.target.checked;

    try {
        const response = await fetch(`${BACKEND_API_ROOT}/toggleelectionactive/${activeElectionId}`, {
            method: 'PUT',
            headers: getSecurityRequestHeaders(),
            body: JSON.stringify({ isActive: activeStateToggle })
        });

        if (!response.ok) {
            e.target.checked = !activeStateToggle;
            alert("Database status transition rejected.");
        }
    } catch (networkErr) {
        e.target.checked = !activeStateToggle;
        console.error(networkErr);
    }
}

/**
 * POST - Hooks target parameter mapping endpoint /addpost/:electionId
 */
async function dispatchPostPositionTransaction(e) {
    e.preventDefault();
    if (!activeElectionId) return;

    const postName = document.getElementById('inputPostName').value.trim();

    try {
        const response = await fetch(`${BACKEND_API_ROOT}/addpost/${activeElectionId}`, {
            method: 'POST',
            headers: getSecurityRequestHeaders(),
            body: JSON.stringify({ postName })
        });

        if (response.ok) {
            modalPostObj.hide();
            await refreshElectionsDataWorkspace();
        } else {
            const data = await response.json();
            alert(data.message || "Failed appending post structure payload array parameters.");
        }
    } catch (err) {
        console.error(err);
    }
}

function triggerCandidateModalSetup(postName) {
    document.getElementById('formAddCandidate').reset();
    document.getElementById('fieldTargetPostName').value = postName;
    document.getElementById('displayPostContext').value = postName;
    modalCandidateObj.show();
}

/**
 * POST - Maps target structural subschema route /addcandidate/:electionId
 */
async function dispatchCandidateTransaction(e) {
    e.preventDefault();
    if (!activeElectionId) return;

    const postName = document.getElementById('fieldTargetPostName').value;
    const payload = {
        candidateID: document.getElementById('selectUserAccountID').value,
        name: document.getElementById('inputCandidateName').value.trim(),
        postName: postName,
        manifesto: document.getElementById('inputCandidateManifesto').value.trim(),
        imageurl: document.getElementById('inputCandidateImageUrl').value.trim()
    };

    try {
        const response = await fetch(`${BACKEND_API_ROOT}/addcandidate/${activeElectionId}`, {
            method: 'POST',
            headers: getSecurityRequestHeaders(),
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            modalCandidateObj.hide();
            await refreshElectionsDataWorkspace();
        } else {
            const errorContext = await response.json();
            alert(errorContext.message || "Candidate record mapping validation error.");
        }
    } catch (txEx) {
        console.error(txEx);
    }
}

async function preloadAlumnaeDirectoryIndex() {
    try {
        const response = await fetch(`${BACKEND_API_ROOT}/users/getallalumnae`, {
            method: 'GET',
            headers: getSecurityRequestHeaders()
        });
        
        if (!response.ok) return;
        
        const data = await response.json();
        const directoryArray = data.result || [];
        
        const dropdownNode = document.getElementById('selectUserAccountID');
        dropdownNode.innerHTML = '<option value="">-- Associate Candidate Profile Account --</option>';
        
        directoryArray.forEach(user => {
            const processingOptionNode = document.createElement('option');
            processingOptionNode.value = user._id;
            processingOptionNode.innerText = `${user.username} (${user.email})`;
            dropdownNode.appendChild(processingOptionNode);
        });

        dropdownNode.addEventListener('change', (e) => {
            const selectedUser = directoryArray.find(u => u._id === e.target.value);
            if (selectedUser) {
                document.getElementById('inputCandidateName').value = selectedUser.username;
            }
        });
    } catch (directoryLoadException) {
        console.error("Failed loading target profile user arrays maps indices:", directoryLoadException);
    }
}

function toggleVisualLoader(show) {
    const loader = document.getElementById('loadingIndicator');
    if (loader) {
        show ? loader.classList.remove('d-none') : loader.classList.add('d-none');
    }
}