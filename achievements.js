/**
 * User Space Achievements Layout Script Interaction Engine
 * Corrected to map precisely to the backend route nesting: /achievements/<routename>
 */

// Global Path Allocation to match port parameters of local Node.js server environments
const API_BASE_URL = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://cq-a-bckd.onrender.com'; // Production live Render URL
    

// Global runtime context caching allocations array tracking historical collection streams
let localAchievementsCollectionCache = [];

document.addEventListener('DOMContentLoaded', () => {
    // Run mobile slide drawer bindings layout setup
    setupMobileResponsiveSidebarDrawer();

    // Pull database schema collection directly on pipeline mount load
    pullSystemAchievementsEcosystemStream();
});

/**
 * Mobile navigation links slide drawer toggle handlers
 */
function setupMobileResponsiveSidebarDrawer() {
    const toggleBtn = document.getElementById('mobile-sidebar-toggle');
    const menuContainer = document.getElementById('app-sidebar');
    if (toggleBtn && menuContainer) {
        toggleBtn.addEventListener('click', () => {
            menuContainer.classList.toggle('show-sidebar');
        });
    }
}

/**
 * Executes a REST array pipeline pull directly from matching endpoint: /achievements/getallachievements
 */
async function pullSystemAchievementsEcosystemStream() {
    try {
        // Corrected route mapping path here
        const response = await fetch(`${API_BASE_URL}/achievements/getallachievements`, {
            method: 'GET',
            headers: { 
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const parsedResponseWrapper = await response.json();
            // Assign explicitly utilizing the data response dictionary mapping key configuration: .result
            localAchievementsCollectionCache = parsedResponseWrapper.result || [];
            buildWireframeAchievementsViewDeck(localAchievementsCollectionCache);
        } else {
            fallbackToDesignSandboxMockData();
        }
    } catch (err) {
        console.warn('Backend endpoint unreached safely. Initializing design sandbox mockup data fallbacks.');
        fallbackToDesignSandboxMockData();
    }
}

/**
 * Formulates rows cards array components mapping directly into user-facing UI interface cards canvas
 */
function buildWireframeAchievementsViewDeck(collectionList) {
    const streamContainer = document.getElementById('user-achievements-display-pipeline');
    if (!streamContainer) return;

    if (collectionList.length === 0) {
        streamContainer.innerHTML = `
            <div class="text-center py-5 text-muted border rounded-3 bg-white" style="border-color: var(--cq-border-orange) !important;">
                <i class="bi bi-trophy-fill opacity-25 fs-1 mb-2 d-block"></i>
                <div class="small fw-medium">No community achievements data cataloged matching view visibility windows.</div>
            </div>`;
        return;
    }

    streamContainer.innerHTML = '';
    
    collectionList.forEach(achievement => {
        const photoSrc = achievement.ImageUrl || achievement.photoUrl || '';
        
        // Thumbnail structural verification switch
        const imageNodeMarkup = photoSrc 
            ? `<img src="${photoSrc}" alt="Community Achievement Detail Display">`
            : `<i class="bi bi-image"></i>`;

        const rowHTML = `
            <div class="wireframe-achievement-row">
                <div class="wireframe-photo-thumbnail shadow-sm">
                    ${imageNodeMarkup}
                </div>

                <div class="wireframe-meta-details">
                    <div class="meta-line-item">
                        <div class="meta-label">Title</div>
                        <div class="meta-value title-bold">: ${achievement.title || 'Untitled Achievement'}</div>
                    </div>
                    <div class="meta-line-item">
                        <div class="meta-label">Description</div>
                        <div class="meta-value">: ${achievement.description || 'No description asset documentation submitted.'}</div>
                    </div>
                    <div class="meta-line-item">
                        <div class="meta-label">Category</div>
                        <div class="meta-value category-tag">: ${achievement.category || 'General Milestone'}</div>
                    </div>
                </div>
            </div>`;
            
        streamContainer.insertAdjacentHTML('beforeend', rowHTML);
    });
}

/**
 * Indexes client-side user queries across active variables parameters
 */
function executeClientSideSearchIndex() {
    const textQuery = document.getElementById('user-achievements-search').value.toLowerCase().trim();

    if (textQuery.length === 0) {
        buildWireframeAchievementsViewDeck(localAchievementsCollectionCache);
        return;
    }

    const outputFilteredCollections = localAchievementsCollectionCache.filter(item => {
        return (
            (item.title || '').toLowerCase().includes(textQuery) ||
            (item.description || '').toLowerCase().includes(textQuery) ||
            (item.category || '').toLowerCase().includes(textQuery)
        );
    });

    buildWireframeAchievementsViewDeck(outputFilteredCollections);
}

/**
 * Sandbox Mock Data Loader to protect visual UI verification pipelines
 */
function fallbackToDesignSandboxMockData() {
    const backupMockDataMatrix = [
        {
            title: "Alumnae Engineering Cohort Initiative",
            description: "Successfully built out open-source cloud data infrastructure models helping local non-profit groups maximize operations scaling vectors.",
            category: "Innovation & Tech"
        },
        {
            title: "Peer Mentorship Excellence Acceleration",
            description: "Recognizing outstanding cohort alumni leadership contributions through foundational support pipelines and structural mentorship groups.",
            category: "Community Impact"
        }
    ];
    localAchievementsCollectionCache = backupMockDataMatrix;
    buildWireframeAchievementsViewDeck(backupMockDataMatrix);
}