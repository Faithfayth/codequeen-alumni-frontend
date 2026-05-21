const API_BASE = 'http://localhost:5000';



///-------------------------------------------BADGES-------------------------------------------------------------------

const badgesContainer = document.getElementById('badges');
const searchInput = document.getElementById('search');
const filterSelect = document.getElementById('filter');
let allBadges = [];

async function loadBadges(){
  try{
    const res = await fetch(`${API_BASE}/badges/getbadges`);
    const data = await res.json();
    allBadges = data.result || [];
    renderBadges(allBadges);
  }catch(e){
    badgesContainer.innerHTML = '<p class="error">Failed to load badges.</p>';
    console.error(e);
  }
}

function renderBadges(list){
  if(!list.length){ badgesContainer.innerHTML = '<p class="error">No badges found.</p>'; return }
  badgesContainer.innerHTML = list.map(b => `
      <div class="badge-card">
        <div class="badge-thumb"><img src="${b.iconurl || 'badges.jfif'}" alt="${b.badgename}"></div>
        <div class="badge-info">
          <h3>${b.badgename}</h3>
          <p>${b.description}</p>
        </div>
        <div class="meta"><span>Type: ${b.type || 'General'}</span><span>${b.points ? b.points + ' pts' : ''}</span></div>
      </div>
    `).join('');
}

function applyFilters(){
  const q = searchInput?.value?.toLowerCase() || '';
  const f = filterSelect?.value || '';
  const filtered = allBadges.filter(b => {
    const matchesQ = !q || (b.badgename && b.badgename.toLowerCase().includes(q)) || (b.description && b.description.toLowerCase().includes(q));
    const matchesF = !f || (b.type && b.type === f);
    return matchesQ && matchesF;
  });
  renderBadges(filtered);
}

searchInput?.addEventListener('input', applyFilters);
filterSelect?.addEventListener('change', applyFilters);
document.addEventListener('DOMContentLoaded', loadBadges);







//-----------------------------------------------------------STUDENTS-----------------------------------------


// Intercept security parameters from dynamic client data matrices
const getAuthToken = () => localStorage.getItem('token');

// Component Memory Cache Layer
let dashboardState = {
    user: null,
    opportunities: [],
    currentSampleBlogId: 'blog_001' // Standard track handler for platform integration testing
};

// INITIALIZATION PIPELINE LAUNCHER
document.addEventListener('DOMContentLoaded', () => {
    initializeDashboardSession();
    fetchApprovedOpportunitiesStream();
    registerGlobalUIEventListeners();
});

// 1. SESSION MANAGEMENT & HYDRATION
function initializeDashboardSession() {
    try {
        // Hydrate UI matching dynamic model properties parsed during user authorization
        const activeSessionUser = JSON.parse(localStorage.getItem('user')) || {
            username: "Dailos Veonn",
            cohort: 14
        };
        
        dashboardState.user = activeSessionUser;
        document.getElementById('profile-name-field').innerText = activeSessionUser.username;
        document.getElementById('profile-cohort-field').innerText = `Cohort ${activeSessionUser.cohort || 'N/A'}`;
    } catch (err) {
        console.error("Dashboard engine was unable to parse profile metadata configurations:", err);
    }
}

// 2. FETCH SYSTEM-APPROVED OPPORTUNITIES (Refers directly to your Opportunities Model)
async function fetchApprovedOpportunitiesStream() {
    const grid = document.getElementById('opportunities-injection-grid');
    if (!grid) return;

    try {
        const response = await fetch(`${API_BASE_URL}/opportunities`, {
            headers: { 'Authorization': `Bearer ${getAuthToken()}` }
        });
        const payload = await response.json();

        if (response.ok && payload.result && payload.result.length > 0) {
            // Exclude non-verified elements: Match "adminverified === 'approved'" from your business rules
            dashboardState.opportunities = payload.result.filter(opp => opp.adminverified === 'approved' || opp.isApproved === true);
            
            if (dashboardState.opportunities.length === 0) {
                renderNoOpportunitiesMessage(grid);
                return;
            }

            grid.innerHTML = ''; // Wipe loading feedback cleanly
            dashboardState.opportunities.forEach(opp => {
                const deadlineDate = opp.deadline ? new Date(opp.deadline).toISOString().split('T')[0] : 'Open Route';
                
                // Building rows directly matching model imageUrl criteria
                const cardElementHtml = `
                    <div class="opportunity-row-card shadow-sm d-flex align-items-center justify-content-between gap-3" data-id="${opp._id}">
                        <div class="d-flex align-items-center gap-3">
                            <div class="calendar-circle-icon flex-shrink-0">
                                ${opp.imageUrl ? `<img src="${opp.imageUrl}" alt="Company Icon">` : `<i class="bi bi-briefcase fs-5 text-warning"></i>`}
                            </div>
                            <div>
                                <div class="fw-bold text-dark text-truncate" style="max-width: 150px; font-size:0.9rem;">${opp.title || 'Role'}</div>
                                <div class="text-muted" style="font-size:0.75rem;">Deadline</div>
                            </div>
                        </div>
                        <div class="text-end small fw-bold text-danger" style="font-size:0.8rem;">${deadlineDate}</div>
                    </div>`;
                grid.insertAdjacentHTML('beforeend', cardElementHtml);
            });

            // Re-bind click events dynamically to the injected elements
            document.querySelectorAll('.opportunity-row-card').forEach(card => {
                card.addEventListener('click', () => {
                    const id = card.getAttribute('data-id');
                    expandOpportunityModalDetails(id);
                });
            });

        } else {
            renderNoOpportunitiesMessage(grid);
        }
    } catch (error) {
        console.error("Infrastructure route error connecting to opportunity database pools:", error);
        renderNoOpportunitiesMessage(grid);
    }
}

function renderNoOpportunitiesMessage(container) {
    container.innerHTML = `
        <div class="opportunity-row-card shadow-sm d-flex align-items-center justify-content-between gap-3">
            <div class="d-flex align-items-center gap-3">
                <div class="calendar-circle-icon flex-shrink-0"><i class="bi bi-calendar3 fs-5"></i></div>
                <div>
                    <div class="fw-bold text-dark" style="font-size:0.9rem;">No Active Positions</div>
                    <div class="text-muted" style="font-size:0.75rem;">Check back later</div>
                </div>
            </div>
            <div class="text-end small fw-bold text-muted" style="font-size:0.8rem;">Closed</div>
        </div>`;
}

// 3. MODAL POPULATOR: SHOW EVERYTHING EXCEPT ADMINVERIFIED AND ADDEDBY
function expandOpportunityModalDetails(id) {
    const opp = dashboardState.opportunities.find(item => item._id === id);
    if (!opp) return;

    // Direct interface mappings avoiding protected security parameters
    document.getElementById('modal-opp-title').innerText = opp.title || 'Opportunity Spec';
    document.getElementById('modal-opp-company').innerText = opp.company || 'CodeQueen Network Alliance';
    document.getElementById('modal-opp-reqs').innerText = opp.requirements || opp.description || 'No specialized criteria provided.';
    document.getElementById('modal-opp-deadline').innerText = opp.deadline ? new Date(opp.deadline).toISOString().split('T')[0] : 'Immediate Opening';

    const frame = document.getElementById('modal-opp-image-frame');
    if (opp.imageUrl) {
        frame.innerHTML = `<img src="${opp.imageUrl}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
    } else {
        frame.innerHTML = `<i class="bi bi-briefcase fs-2 text-warning"></i>`;
    }

    const targetModal = new bootstrap.Modal(document.getElementById('opportunityDetailsModal'));
    targetModal.show();
}

// 4. COMMENTS SYSTEM WORKFLOW (GET /api/blogs/:id/comments)
async function syncAndRenderCommentsFeed(blogId) {
    const stream = document.getElementById('comments-stream');
    stream.innerHTML = `<div class="text-muted small p-2"><span class="spinner-border spinner-border-sm me-1"></span>Syncing feed...</div>`;

    try {
        const response = await fetch(`${API_BASE_URL}/blogs/${blogId}/comments`, {
            headers: { 'Authorization': `Bearer ${getAuthToken()}` }
        });
        const data = await response.json();

        if (response.ok && data.comments && data.comments.length > 0) {
            stream.innerHTML = '';
            data.comments.forEach(comment => {
                stream.insertAdjacentHTML('beforeend', `
                    <div class="bg-white p-2 rounded-2 mb-1 border-start border-3 border-warning shadow-sm">
                        <strong class="small text-dark d-block">${comment.username || 'Sister'}</strong>
                        <span class="text-muted d-block" style="font-size:0.75rem;">${comment.text}</span>
                    </div>`);
            });
        } else {
            stream.innerHTML = `<div class="text-muted p-2" style="font-size:0.75rem;"><i class="bi bi-chat-left-dots me-1"></i>No comments logged yet. Add your thoughts!</div>`;
        }
    } catch (err) {
        // Fallback mockup logic for initial local dashboard setup testing
        stream.innerHTML = `
            <div class="bg-white p-2 rounded-2 mb-1 border-start border-3 border-warning shadow-sm">
                <strong class="small text-dark d-block">Hassan_Mentor</strong>
                <span class="text-muted d-block" style="font-size:0.75rem;">Excellent system architecture breakdown card representation. Keep up the speed!</span>
            </div>`;
    }
}

// 5. POST NEW COMMENT DISPATCH (POST /api/blogs/:id/comments)
async function executeSubmitComment(blogId) {
    const input = document.getElementById('comment-input-field');
    const commentText = input.value.trim();
    if (!commentText) return;

    try {
        const response = await fetch(`${API_BASE_URL}/blogs/${blogId}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify({ text: commentText })
        });

        if (response.ok) {
            input.value = '';
            await syncAndRenderCommentsFeed(blogId); // Direct cascade UI data refresh
        } else {
            // Local fallback simulation for pure static sandbox presentations
            const stream = document.getElementById('comments-stream');
            if (stream.innerHTML.includes("No comments logged")) stream.innerHTML = '';
            
            stream.insertAdjacentHTML('beforeend', `
                <div class="bg-white p-2 rounded-2 mb-1 border-start border-3 border-warning shadow-sm">
                    <strong class="small text-dark d-block">${dashboardState.user.username || 'You'} (Local)</strong>
                    <span class="text-muted d-block" style="font-size:0.75rem;">${commentText}</span>
                </div>`);
            input.value = '';
        }
    } catch (error) {
        console.error("Critical error dispatching user comment metadata logs:", error);
    }
}

// 6. DECLARATIVE UI DOM BINDINGS & NAV LINKS
function registerGlobalUIEventListeners() {
    // Nav Navigation Link Banners
    document.getElementById('events-nav-block').addEventListener('click', () => {
        window.location.href = 'events.html';
    });

    // Collapsible Comment Drawer Tray Trigger
    document.getElementById('toggle-comment-btn').addEventListener('click', () => {
        const tray = document.getElementById('comment-drawer');
        if (tray.style.display === 'block') {
            tray.style.display = 'none';
        } else {
            tray.style.display = 'block';
            syncAndRenderCommentsFeed(dashboardState.currentSampleBlogId);
        }
    });

    // Send Comment Action Button Trigger
    document.getElementById('send-comment-btn').addEventListener('click', () => {
        executeSubmitComment(dashboardState.currentSampleBlogId);
    });

    // Enter Key Handler inside Comment Input Field
    document.getElementById('comment-input-field').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            executeSubmitComment(dashboardState.currentSampleBlogId);
        }
    });

    // Security Session Logout Action Link
    document.getElementById('logout-action-btn').addEventListener('click', () => {
        if (confirm("Confirm logout action? This drops active session variables immediately.")) {
            localStorage.clear();
            window.location.href = 'login.html';
        }
    });
}