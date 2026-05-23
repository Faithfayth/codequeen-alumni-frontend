/**
 * Alumni Dashboard Ecosystem Controller Pipeline Logic
 * Automatically parses active session states, fetches verified blogs, and lists active job listings.
 */

const API_BASE_URL = 'http://localhost:5000';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Verify session security token before compiling information models
    const storedToken = localStorage.getItem('token');
    const cachedUserData = localStorage.getItem('user');

    if (!storedToken || !cachedUserData) {
        // Drop user back out if token context is unpopulated
        console.warn("Session token or user data missing. Redirecting to entry login space...");
        window.location.href = 'login.html';
        return;
    }

    // 2. Hydrate user identity details into DOM targets straight out of localStorage cache
    renderUserProfileDetails(cachedUserData);

    // 3. Initiate dynamic data population routines automatically from backend endpoints
    fetchCommunityBlogs(storedToken);
    fetchVerifiedOpportunities(storedToken);

    // Attach event handler loop to the create blog submission entity form
    const createBlogForm = document.getElementById('create-blog-form');
    if (createBlogForm) {
        createBlogForm.addEventListener('submit', (e) => handlePostNewBlog(e, storedToken));
    }
});

/**
 * Parses local session storage object and replaces placeholders with active user metrics
 */
function renderUserProfileDetails(cachedUserData) {
    try {
        const userData = JSON.parse(cachedUserData);

        // Safely extract name (checking for fallback properties like username or name)
        const activeName = userData.name || userData.username || "Alumna Member";
        const activeCohort = userData.cohort || "Cohort Continuous";
        const activeRole = userData.role ? userData.role.toLowerCase() : "alumna";

        // Hydrate identity details into DOM targets directly
        document.getElementById('dom-user-name').textContent = activeName;
        document.getElementById('dom-user-cohort').textContent = activeCohort;
        
        if (document.getElementById('dom-user-role')) {
            document.getElementById('dom-user-role').textContent = activeRole;
        }
    } catch (err) {
        console.error("Profile rendering failed from cached schema structure:", err);
        document.getElementById('dom-user-name').textContent = "Alumna Member";
    }
}

/**
 * Automatically fetches active community updates from backend controllers
 */
async function fetchCommunityBlogs(token) {
    const listContainer = document.getElementById('blogs-rendered-list');
    
    try {
        const response = await fetch(`${API_BASE_URL}/blogs/getallblogs`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) throw new Error('Failed to download network resource asset items.');
        const blogs = await response.json();

        if (!blogs || blogs.length === 0) {
            listContainer.innerHTML = `<div class="text-center text-muted py-4">No community stories published yet. Be the first to start the trend!</div>`;
            return;
        }

        // Render iterative HTML elements directly inside the target dashboard workspace
        listContainer.innerHTML = blogs.map(blog => {
            const commentsHtml = blog.comments && blog.comments.length > 0 
                ? blog.comments.map(c => `
                    <div class="single-comment-bubble text-start">
                        <strong>${c.author?.name || c.username || 'Anonymous'}:</strong> ${c.text || c.content}
                    </div>
                  `).join('')
                : `<div class="text-center text-muted py-2 small context-empty-msg">No entries logged yet. Post a comment inside the channel below!</div>`;

            return `
                <div class="blog-inner-post border shadow-sm">
                    <div class="row align-items-center g-3">
                        ${blog.image ? `
                            <div class="col-sm-4">
                                <img src="${blog.image}" class="blog-photo-frame" alt="Post graphic thumbnail">
                            </div>
                        ` : ''}
                        <div class="${blog.image ? 'col-sm-8' : 'col-12'}">
                            <h4 class="fw-bold text-dark mb-2">${blog.title}</h4>
                            <p class="text-muted small mb-3 text-truncate-3">${blog.content}</p>
                            <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
                                <span class="badge bg-secondary rounded-pill small px-2 py-1">By: ${blog.author?.name || 'Anonymous'}</span>
                                <button class="comments-action-btn shadow-sm" onclick="toggleCommentsTray('${blog._id}')">
                                    <i class="bi bi-chat-left-text me-1"></i> Comments
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="comments-interactive-tray" id="comments-tray-${blog._id}">
                        <div class="comments-stream-container mb-3" id="comments-stream-${blog._id}">
                            ${commentsHtml}
                        </div>
                        <div class="input-group mt-2 border rounded-3 p-1 bg-white">
                            <input type="text" class="form-control border-0 bg-transparent comment-input-field" 
                                   id="comment-input-${blog._id}" 
                                   placeholder="Write an open response inside the ring..." 
                                   onkeydown="if(event.key === 'Enter') handleSendNewComment('${blog._id}')">
                            <button class="btn btn-link text-decoration-none text-danger d-flex align-items-center justify-content-center" 
                                    type="button" 
                                    onclick="handleSendNewComment('${blog._id}')">
                                <i class="bi bi-send-fill fs-5"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

    } catch (err) {
        console.error("Error gathering blog feeds:", err);
        listContainer.innerHTML = `<div class="text-center text-danger py-3 small">Unable to retrieve blogs. Ensure server endpoint is active.</div>`;
    }
}

/**
 * Dispatches a comment payload upstream using structured data maps
 */
async function handleSendNewComment(blogId) {
    const token = localStorage.getItem('token');
    const textInput = document.getElementById(`comment-input-${blogId}`);
    if (!textInput) return;

    const commentText = textInput.value.trim();
    if (!commentText) return;

    try {
        const response = await fetch(`${API_BASE_URL}/blogs/addcomment/${blogId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) throw new Error('Transmission request denied.');
        
        textInput.value = '';
        await fetchCommunityBlogs(token);
        
        const tray = document.getElementById(`comments-tray-${blogId}`);
        if (tray) tray.style.display = 'block';

    } catch (err) {
        console.error("Comment submission process failed:", err);
        alert("Unable to transmit entry payload context.");
    }
}

/**
 * Intercepts, reads, and renders opportunities dynamically on load
 */
async function fetchVerifiedOpportunities(token) {
    const listContainer = document.getElementById('opportunities-list-box');

    try {
        const response = await fetch(`${API_BASE_URL}/opportunities/getpcomingpportunities`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) throw new Error('Network failure parsing corporate channel data collections.');
        const items = await response.json();

        if (!items || items.length === 0) {
            listContainer.innerHTML = `<div class="text-center text-muted py-3 small">No open roles posted today.</div>`;
            return;
        }

        listContainer.innerHTML = items.map(item => `
            <div class="opportunity-clickable-row d-flex align-items-center gap-3 shadow-sm" onclick="viewSpecificOpportunityDetails(${JSON.stringify(item).replace(/"/g, '&quot;')})">
                <div class="circle-avatar-container flex-shrink-0">
                    <i class="bi bi-building text-warning fs-4"></i>
                </div>
                <div class="overflow-hidden">
                    <h6 class="fw-bold text-dark mb-0 text-truncate">${item.title || 'Job Opening'}</h6>
                    <small class="text-muted text-truncate d-block">${item.company || 'Partner Enterprise'}</small>
                </div>
            </div>
        `).join('');

    } catch (err) {
        console.error("Error gathering active pipeline listings:", err);
        listContainer.innerHTML = `<div class="text-center text-danger py-3 small">Error fetching active channels.</div>`;
    }
}

/**
 * Populates and opens details modal item variables for visual previewing
 */
function viewSpecificOpportunityDetails(item) {
    document.getElementById('opp-modal-title').innerText = item.title || 'Opportunity Asset Details';
    document.getElementById('opp-modal-company').innerText = item.company || 'Not Specified';
    document.getElementById('opp-modal-requirements').innerText = item.requirements || item.description || 'No additional requirements compiled.';
    document.getElementById('opp-modal-deadline').innerText = item.deadline ? new Date(item.deadline).toLocaleDateString() : 'Open Position';
    
    const displayModal = new bootstrap.Modal(document.getElementById('opportunityDisplayModal'));
    displayModal.show();
}

/**
 * Handles publishing new content pipelines to your mongo framework routes
 */
async function handlePostNewBlog(e, token) {
    e.preventDefault();
    
    const title = document.getElementById('blog-title').value.trim();
    const image = document.getElementById('blog-image').value.trim();
    const content = document.getElementById('blog-content').value.trim();

    try {
        const response = await fetch(`${API_BASE_URL}/blogs/createblog`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, image, content })
        });

        if (response.ok) {
            document.getElementById('create-blog-form').reset();
            const modalElement = document.getElementById('createBlogModal');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) modalInstance.hide();
            
            fetchCommunityBlogs(token);
        } else {
            alert("Error trying to process new content feed. Verify constraints.");
        }
    } catch (err) {
        console.error("Transmission error while adding blog data structure:", err);
    }
}

/**
 * Interface view toggler utility helper engine
 */
function toggleCommentsTray(blogId) {
    const tray = document.getElementById(`comments-tray-${blogId}`);
    if (tray) {
        tray.style.display = tray.style.display === 'block' ? 'none' : 'block';
    }
}

/**
 * Clears security configurations and dumps session frames completely
 */
function logoutSession() {
    localStorage.clear();
    window.location.href = 'login.html';
}