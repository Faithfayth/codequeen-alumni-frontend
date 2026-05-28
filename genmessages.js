document.addEventListener('DOMContentLoaded', () => {
    // 1. ENVIRONMENT CONFIGURATION & STATE
    const API_BASE_URL = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://cq-a-bckd.onrender.com'; // Production live Render URL
    const BASE_API_ROUTE = `${API_BASE_URL}/generalmessages`; // Route template configuration set to explicitly capture prefix targets
    const socket = io(API_BASE_URL); // Real-time Engine Connection

    // const socket = io('http://localhost:5000'); // Real-time Engine Connection
    
    // Fallback Mock profile extraction - Replace with your actual local session management data hook
    // 1. Fetch the raw separate items from local storage
const rawToken = localStorage.getItem('token') || '';
const rawUserObj = localStorage.getItem('user') || '';

// 2. Parse the stringified user details object safely
const parsedUser = rawUserObj ? JSON.parse(rawUserObj) : {};

// 3. Helper Utility: Decodes the database ID hidden directly inside the JWT token string
function getUserIdFromToken(tokenString) {
    try {
        if (!tokenString) return null;
        // JWT structure is: Header.Payload.Signature -> We split and grab the middle Payload segment
        const base64Url = tokenString.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        return JSON.parse(jsonPayload).id; // Pulls out your real: 6a086896f05c449487c3bd0d
    } catch (e) {
        console.error("Token decoding error details:", e);
        return null;
    }
}

// 4. Construct your perfectly mapped runtime application context
const CURRENT_USER = {
    id: getUserIdFromToken(rawToken) || 'user.id', // Real decoded ID fallback
    username: parsedUser.username || 'Username',
    role: parsedUser.role || 'alumna',
    token: rawToken // Feeds the precise header payload straight to your backend controllers!
};

    // DOM Element Mapping Nodes
    const chatStreamArea = document.getElementById('chatStreamArea');
    const generalChatForm = document.getElementById('generalChatForm');
    const messageTextInput = document.getElementById('messageTextInput');
    const mediaUploadClip = document.getElementById('mediaUploadClip');
    
    let activeMediaUrl = null;

    // Responsive Mobile Navbar Drawer Toggles
    const sidebar = document.getElementById('main-application-sidebar');
    document.getElementById('open-sidebar-trigger')?.addEventListener('click', () => sidebar.classList.add('show-sidebar'));
    document.getElementById('close-sidebar-trigger')?.addEventListener('click', () => sidebar.classList.remove('show-sidebar'));
    document.getElementById('btnSidebarSignout')?.addEventListener('click', () => {
        localStorage.clear();
        window.location.href = 'login.html';
    });

    // 2. HELPER UTILITY: INITIAL EXTRACTOR (Transforms username to initials bubble)
    function getInitials(nameString) {
        if (!nameString) return 'CQ';
        const segments = nameString.trim().split(' ');
        if (segments.length >= 2) {
            return (segments[0][0] + segments[1][0]).toUpperCase();
        }
        return nameString.substring(0, 2).toUpperCase();
    }

    // 3. HELPER UTILITY: TIMESTAMP FORMATTER (Formats date to exactly 'username 10:30 AM')
    function formatTime(dateString) {
        const dateObj = new Date(dateString);
        return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // 4. RENDER CONTEXT ENGINE
    function appendMessageToStream(msgObj, prepend = false) {
        const isMyOwnMessage = msgObj.senderID === CURRENT_USER.id;
        const msgWrapper = document.createElement('div');
        msgWrapper.classList.add('msg-wrapper', isMyOwnMessage ? 'outgoing' : 'incoming');
        msgWrapper.setAttribute('data-msg-id', msgObj._id);

        // Calculate if message age is within 24 hours boundary limit
        const messageAgeInMs = new Date() - new Date(msgObj.timestamp);
        const twentyFourHoursInMs = 24 * 60 * 60 * 1000;
        const canDelete = isMyOwnMessage && (messageAgeInMs < twentyFourHoursInMs);

        // Generate inner message DOM layout template tree
        let imageMarkup = msgObj.imageUrl ? `<img src="${msgObj.imageUrl}" class="attached-chat-img" alt="Media Attachment">` : '';
        let textMarkup = msgObj.message ? `<div class="text-break">${msgObj.message}</div>` : '';
        let deleteButtonMarkup = canDelete ? `• <button class="delete-msg-btn" onclick="executeMessageDeletion('${msgObj._id}')">Delete</button>` : '';

        msgWrapper.innerHTML = `
            <div class="avatar-circle">${getInitials(msgObj.sendername)}</div>
            <div class="bubble-content-block">
                <div class="chat-bubble">
                    ${imageMarkup}
                    ${textMarkup}
                </div>
                <div class="msg-meta-data">
                    <span class="fw-semibold text-dark">${msgObj.sendername}</span> 
                    <span>${formatTime(msgObj.timestamp)}</span>
                    ${deleteButtonMarkup}
                </div>
            </div>
        `;

        if (prepend) {
            chatStreamArea.insertBefore(msgWrapper, chatStreamArea.firstChild);
        } else {
            chatStreamArea.appendChild(msgWrapper);
        }
    }

    // Scroll Viewport Synchronization Lock anchor
    function scrollToStreamBottom() {
        chatStreamArea.scrollTop = chatStreamArea.scrollHeight;
    }

    // 5. REST CALLS: LOAD SYSTEM ARCHIVES
    async function loadChatLogs() {
    try {
        chatStreamArea.innerHTML = '<div class="text-center text-muted my-auto small"><i class="bi bi-arrow-clockwise spinning"></i> Loading community message logs...</div>';
        
        // Safety Fallback: Alert if user loaded the interface unauthenticated
        if (!CURRENT_USER.token) {
            throw new Error("Missing authentication token. Please log in again.");
        }

        const response = await fetch(`${BASE_API_ROUTE}/getallmessages`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${CURRENT_USER.token}`,
                'Content-Type': 'application/json'
            }
        });

        // Backend Error Parser: Extracts exact messages like "Access Denied" or "Expired Token"
        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.message || `Server responded with status ${response.status}`);
        }
        
        const historyLogs = await response.json();
        
        chatStreamArea.innerHTML = ''; // Flush processing loading state safely
        
        if (historyLogs.length === 0) {
            chatStreamArea.innerHTML = '<div class="text-center text-muted my-auto small">No messages yet. Say hello to the sisterhood!</div>';
            return;
        }

        historyLogs.forEach(msg => appendMessageToStream(msg));
        scrollToStreamBottom();
    } catch (err) {
        chatStreamArea.innerHTML = `<div class="text-center text-danger my-auto small">Failed to load chat history: ${err.message}</div>`;
    }
}

// FIX: Explicitly bind deletion to global window scope so HTML onclick attributes can execute it
window.executeMessageDeletion = async function(messageID) {
    if (!confirm("Are you certain you wish to purge this message from history logs?")) return;
    
    try {
        const response = await fetch(`${BASE_API_ROUTE}/deletemessage/${messageID}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${CURRENT_USER.token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const faultObj = await response.json();
            alert(faultObj.message || "Deletion transaction denied.");
        }
    } catch (err) {
        console.error("Purge operations execution error:", err);
    }
};

    // 6. ACTION EXECUTION HANDLERS: SEND SYSTEM CONTEXTS
    generalChatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const textPayload = messageTextInput.value.trim();

        if (!textPayload && !activeMediaUrl) return;

        try {
            const response = await fetch(`${BASE_API_ROUTE}/sendmessage`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${CURRENT_USER.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: textPayload,
                    imageUrl: activeMediaUrl
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                alert(errorData.message || 'Transmission failure.');
                return;
            }

            // Reset interaction states on form clearance blocks
            messageTextInput.value = '';
            if (activeMediaUrl) {
                activeMediaUrl = null;
                mediaUploadClip.classList.remove('text-warning');
            }
        } catch (err) {
            console.error('Submission loop failure:', err);
        }
    });

    // Paperclip Media Prompt Trigger Handler
    mediaUploadClip.addEventListener('click', () => {
        const urlPrompt = prompt("Enter your image URL asset link:", activeMediaUrl || "");
        if (urlPrompt !== null) {
            if (urlPrompt.trim() === "") {
                activeMediaUrl = null;
                mediaUploadClip.classList.remove('text-warning');
                mediaUploadClip.setAttribute('title', 'Attach Media Asset Url');
            } else {
                activeMediaUrl = urlPrompt.trim();
                mediaUploadClip.classList.add('text-warning'); // Highlight color indicator when active
                mediaUploadClip.setAttribute('title', `Attached: ${activeMediaUrl}`);
            }
        }
    });

    // Global scoping container wrapper hook for executing safe inline message deletions
    window.executeMessageDeletion = async function(messageID) {
        if (!confirm("Are you certain you wish to purge this message from history logs?")) return;
        
        try {
            const response = await fetch(`${BASE_API_ROUTE}/deletemessage/${messageID}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${CURRENT_USER.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const faultObj = await response.json();
                alert(faultObj.message || "Deletion transaction denied.");
            }
        } catch (err) {
            console.error("Purge operations execution error loop:", err);
        }
    };

    // 7. REAL-TIME ENGINE EVENT DISPATCH LISTENERS (SOCKET.IO HOOKS)
    socket.on('receive_general_message', (newMessageObj) => {
        const isNearBottom = chatStreamArea.scrollHeight - chatStreamArea.scrollTop <= chatStreamArea.clientHeight + 150;
        appendMessageToStream(newMessageObj);
        if (isNearBottom || newMessageObj.senderID === CURRENT_USER.id) {
            scrollToStreamBottom();
        }
    });

    socket.on('general_message_deleted', (deletedMessageID) => {
        const DOMTarget = document.querySelector(`[data-msg-id="${deletedMessageID}"]`);
        if (DOMTarget) {
            DOMTarget.remove();
        }
    });

    // Run Initial Data Extraction Loop Pipeline on Page Load
    loadChatLogs();
});