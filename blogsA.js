/**
 * CodeQueen Alumnae Ecosystem - Blog Controller Interaction Engine
 * Maps precisely to backend standard port schema mapping endpoints: http://localhost:5000/blogs/<routename>
 */

const BACKEND_API_URL = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://cq-a-bckd.onrender.com'; // Production live Render URL
let localCachedBlogsStream = [];
let processingUserId = null;

document.addEventListener('DOMContentLoaded', () => {
    // Initialize sidebar slide drawer listeners 
    initializeResponsiveSidebarControls();
    
    // Extrapolate authenticated identity tokens
    extractUserTokenContext();

    // Fetch master database records allocation
    pullSystemBlogsCollectionStream();

    // Link form submission logic hook
    document.getElementById('blog-workspace-form').addEventListener('submit', handleFormSubmissionPipeline);
    
    // Realtime search filter hook
    document.getElementById('blog-search-box').addEventListener('input', executeClientSideSearchIndex);

    // Scroll shortcut binder helper
    document.getElementById('focus-editor-shortcut').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('blog-title-input').focus();
    });
});

/**
 * Handle structural toggle events mapping across client side screen resolutions
 */
function initializeResponsiveSidebarControls() {
    const openBtn = document.getElementById('sidebar-open-toggle-trigger');
    const closeBtn = document.getElementById('sidebar-close-toggle-trigger');
    const navSidebar = document.getElementById('app-navigation-sidebar-container');

    if (openBtn && navSidebar) {
        openBtn.addEventListener('click', () => navSidebar.classList.add('show-sidebar'));
    }
    if (closeBtn && navSidebar) {
        closeBtn.addEventListener('click', () => navSidebar.classList.remove('show-sidebar'));
    }
}

/**
 * Grabs token details to identify author context and enable actions
 */
function extractUserTokenContext() {
    const activeToken = localStorage.getItem('token');
    if (!activeToken) return;
    try {
        const structuralBaseSplit = activeToken.split('.')[1];
        const parsedObject = JSON.parse(atob(structuralBaseSplit));
        processingUserId = parsedObject.id || null;
    } catch (e) {
        console.error("Invalid local structural context token tracing verification details.", e);
    }
}

/**
 * Reads stream from backend route mapping framework: GET /blogs/getallblogs
 */
async function pullSystemBlogsCollectionStream() {
    try {
        const response = await fetch(`${BACKEND_API_URL}/getallblogs`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const dataPayload = await response.json();
            // Assign parsed collection data array
            localCachedBlogsStream = dataPayload || [];
            buildUIBlogsStreamDeck(localCachedBlogsStream);
        } else {
            showStatusMessage('global-error-display', 'Failed to safely retrieve community blogs data matching session metrics.');
        }
    } catch (err) {
        console.error(err);
        showStatusMessage('global-error-display', 'Server connection issues experienced mounting remote pipeline streams.');
    }
}

/**
 * Builds data rows lists and populates layout views dynamically
 */
function buildUIBlogsStreamDeck(blogsArray) {
    const feedTarget = document.getElementById('blog-posts-feed-stream-target');
    if (!feedTarget) return;

    if (blogsArray.length === 0) {
        feedTarget.innerHTML = `
            <div class="text-center py-5 text-muted border rounded-3 bg-white" style="border-color: var(--cq-gold-bg) !important;">
                <i class="bi bi-chat-right-quote-fill opacity-25 fs-1 mb-2 d-block"></i>
                <div class="small fw-medium">No records or published matching blog post items structured in this context.</div>
            </div>`;
        return;
    }

    feedTarget.innerHTML = '';

    blogsArray.forEach(post => {
        const creationTime = new Date(post.timestamp);
        const hoursDelta = Math.abs(new Date() - creationTime) / 3600000;
        
        // Security Verification: Enable modification buttons based on creator identity match
        const isPostCreator = post.authorID === processingUserId;
        
        // Conditional flag tracking if record falls within the 24-hour update availability window
        const allowsUpdateWindow = isPostCreator && hoursDelta <= 24;
        
        // Delete functionality remains constant for creators or admins
        const allowsDeleteOption = isPostCreator;

        // Formulate image asset payload elements if URL structure is assigned
        const imageNodeHTML = post.imageUrl 
            ? `<img src="${post.imageUrl}" class="post-image-preview img-fluid d-block shadow-sm" alt="Blog Media Content Placement">` 
            : '';

        // Formulate nested timeline structure mapping sub-comments strings rows
        let finalCommentsStackHTML = '';
        if (post.comments && post.comments.length > 0) {
            post.comments.forEach(comment => {
                const commentDate = new Date(comment.timestamp).toLocaleString();
                finalCommentsStackHTML += `
                    <div class="comment-node-item">
                        <div class="comment-meta-row">
                            <span class="commenter-name-string">${comment.commentername || 'Alumna Guest'}</span>
                            <span class="commenter-time-string">${commentDate}</span>
                        </div>
                        <p class="comment-text-payload">${comment.content || ''}</p>
                    </div>`;
            });
        } else {
            finalCommentsStackHTML = `<div class="text-muted small ps-2">No comment logs documented regarding this post tracking timeline index.</div>`;
        }

        // Build modification tracking components controls setup row elements block
        const structuralControlsRow = `
            <div class="d-flex gap-2 mt-3 justify-content-end border-top pt-2">
                ${allowsUpdateWindow ? `
                    <button class="btn btn-sm btn-outline-warning d-flex align-items-center gap-1 py-1 px-3" onclick="triggerEditFormMode('${post._id}')">
                        <i class="bi bi-pencil-square"></i> Edit (24h)
                    </button>` : ''
                }
                ${allowsDeleteOption ? `
                    <button class="btn btn-sm btn-outline-danger d-flex align-items-center gap-1 py-1 px-3" onclick="executeDeleteRecordCall('${post._id}')">
                        <i class="bi bi-trash"></i> Delete
                    </button>` : ''
                }
            </div>`;

        const blockMarkup = `
            <div class="blog-post-item-view shadow-sm">
                <div class="post-meta-header">
                    <span class="post-author-badge"><i class="bi bi-person-circle"></i> By: ${post.authorname || 'Anonymous Author'}</span>
                    <span class="post-time-stamp"><i class="bi bi-clock"></i> ${creationTime.toLocaleString()}</span>
                </div>
                
                <h4 class="post-main-title">${post.title || 'Untitled Post'}</h4>
                <p class="post-body-content">${post.content || ''}</p>
                
                ${imageNodeHTML}

                ${(allowsUpdateWindow || allowsDeleteOption) ? structuralControlsRow : ''}

                <div class="comments-section-wrapper shadow-sm">
                    <h6 class="fw-bold mb-3 text-uppercase text-secondary small style-offset"><i class="bi bi-chat-left-text"></i> Discussions</h6>
                    <div class="comments-timeline-nodes-holder mb-3">
                        ${finalCommentsStackHTML}
                    </div>
                    
                    <form onsubmit="handleCommentPostingPipeline(event, '${post._id}')" class="inline-comment-form">
                        <input type="text" class="form-control form-control-sm" placeholder="Write a comment..." required>
                        <button type="submit" class="btn btn-sm btn-warning text-white fw-bold px-3">Comment</button>
                    </form>
                </div>
            </div>`;

        feedTarget.insertAdjacentHTML('beforeend', blockMarkup);
    });
}

/**
 * Route Dispatcher Matrix sorting operations out across updates vs creation hooks
 */
async function handleFormSubmissionPipeline(event) {
    event.preventDefault();
    
    const blogIdTracker = document.getElementById('target-active-blog-id').value;
    const titlePayload = document.getElementById('blog-title-input').value.trim();
    const contentPayload = document.getElementById('blog-content-input').value.trim();
    const imageUrlPayload = document.getElementById('blog-image-url-input').value.trim();

    const requestPayload = {
        title: titlePayload,
        content: contentPayload,
        imageUrl: imageUrlPayload || undefined
    };

    let targetedURL = `${BACKEND_API_URL}/createblog`;
    let methodVerb = 'POST';

    // Switch variables parameters Context pointers if system is tracking active edit profiles parameters updates
    if (blogIdTracker) {
        targetedURL = `${BACKEND_API_URL}/updateblog/${blogIdTracker}`;
        methodVerb = 'PUT';
    }

    try {
        const response = await fetch(targetedURL, {
            method: methodVerb,
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestPayload)
        });

        const parsedResult = await response.json();

        if (response.ok) {
            showStatusMessage('global-success-display', parsedResult.message || 'Operation executed smoothly across records registry matrix context.');
            resetFormPayloadWorkspace();
            pullSystemBlogsCollectionStream();
        } else {
            showStatusMessage('global-error-display', parsedResult.message || 'Failed verification checks submitting transaction records payload.');
        }
    } catch (err) {
        console.error(err);
        showStatusMessage('global-error-display', 'Server synchronization fault encountered resolving entity updates pipelines.');
    }
}

/**
 * Comment Form Submission Handler: POST /blogs/addcomment/:id
 */
async function handleCommentPostingPipeline(event, postId) {
    event.preventDefault();
    const inputElement = event.target.querySelector('input');
    const commentValue = inputElement.value.trim();

    if (!commentValue) return;

    try {
        const response = await fetch(`${BACKEND_API_URL}/addcomment/${postId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ content: commentValue })
        });

        if (response.ok) {
            inputElement.value = '';
            pullSystemBlogsCollectionStream();
        } else {
            const dataErr = await response.json();
            showStatusMessage('global-error-display', dataErr.message || 'Failed to submit message details response parameters.');
        }
    } catch (err) {
        console.error(err);
        showStatusMessage('global-error-display', 'Network drop handling comment post logic execution profiles loop paths.');
    }
}

/**
 * Sets Form values to point safely into active caching keys properties to perform updates
 */
function triggerEditFormMode(id) {
    const matchedRecord = localCachedBlogsStream.find(b => b._id === id);
    if (!matchedRecord) return;

    document.getElementById('target-active-blog-id').value = matchedRecord._id;
    document.getElementById('blog-title-input').value = matchedRecord.title || '';
    document.getElementById('blog-content-input').value = matchedRecord.content || '';
    document.getElementById('blog-image-url-input').value = matchedRecord.imageUrl || '';

    // Transform Visual layout controls indicators 
    document.getElementById('btn-submit-main-payload').innerHTML = `<i class="bi bi-check2-circle"></i> Update Post`;
    document.getElementById('btn-cancel-edit-mode').classList.remove('d-none');
    
    // Smooth scroll straight into workspace viewport grid
    document.getElementById('blog-title-input').scrollIntoView({ behavior: 'smooth' });
}

/**
 * Resets Workspace Editor State back to standard layout creation setups
 */
function resetFormPayloadWorkspace() {
    document.getElementById('target-active-blog-id').value = '';
    document.getElementById('blog-workspace-form').reset();
    document.getElementById('btn-submit-main-payload').innerHTML = `<i class="bi bi-chat-right-quote"></i> Publish`;
    document.getElementById('btn-cancel-edit-mode').classList.add('d-none');
}

// Attach explicit listener breakout routine to handle cancel requests cleanly
document.getElementById('btn-cancel-edit-mode').addEventListener('click', resetFormPayloadWorkspace);

/**
 * Deletes single article instance: DELETE /blogs/deleteblog/:id
 */
async function executeDeleteRecordCall(id) {
    if (!confirm("Are you confident you want to delete this community blog narrative? This execution step is permanent.")) return;

    try {
        const response = await fetch(`${BACKEND_API_URL}/deleteblog/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });

        const parsedMetaResponse = await response.json();

        if (response.ok) {
            showStatusMessage('global-success-display', parsedMetaResponse.message || 'Entity dropped safely out from database array records.');
            pullSystemBlogsCollectionStream();
        } else {
            showStatusMessage('global-error-display', parsedMetaResponse.message || 'Security validation clearance rules dropped transaction command request contexts.');
        }
    } catch (err) {
        console.error(err);
        showStatusMessage('global-error-display', 'Server data transmission loop failure mapping deletion request updates endpoints logic context.');
    }
}

/**
 * Filter collection across keywords matched entries locally to maintain high rendering speeds
 */
function executeClientSideSearchIndex() {
    const textQuery = document.getElementById('blog-search-box').value.toLowerCase().trim();

    if (textQuery.length === 0) {
        buildUIBlogsStreamDeck(localCachedBlogsStream);
        return;
    }

    const outputFilteredList = localCachedBlogsStream.filter(item => {
        return (
            (item.title || '').toLowerCase().includes(textQuery) ||
            (item.content || '').toLowerCase().includes(textQuery) ||
            (item.authorname || '').toLowerCase().includes(textQuery)
        );
    });

    buildUIBlogsStreamDeck(outputFilteredList);
}

/**
 * Utility messaging status banner presentation framework helper
 */
function showStatusMessage(targetContainerId, textContent) {
    const box = document.getElementById(targetContainerId);
    if (!box) return;
    box.innerText = textContent;
    box.classList.remove('d-none');
    setTimeout(() => {
        box.classList.add('d-none');
        box.innerText = '';
    }, 4500);
}

/**
 * Placeholder breakout mapping to maintain parity routines across systemic dashboard features components sets
 */
function logoutSession() {
    localStorage.clear();
    window.location.href = 'login.html';
}