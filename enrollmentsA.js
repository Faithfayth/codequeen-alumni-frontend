/**
 * Admin Enrollment Tracker - Integrated Logic
 * Handles: Attendance toggles, Project status badges, and Admin Verifications.
 */

let studentRegistryCache = [];
const BASE_URL = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://cq-a-bckd.onrender.com'; // Production live Render URL

document.addEventListener('DOMContentLoaded', () => {
    initResponsiveMobileToggle();
    fetchAllStudents();
});

function initResponsiveMobileToggle() {
    const triggerBtn = document.getElementById('mobile-sidebar-toggle');
    const sidebarContainer = document.getElementById('app-sidebar');
    if (triggerBtn && sidebarContainer) {
        triggerBtn.addEventListener('click', () => {
            sidebarContainer.classList.toggle('show-sidebar');
        });
    }
}

/**
 * FETCH: Retrieve student data from backend
 */
async function fetchAllStudents() {
    try {
        const response = await fetch(`${BASE_URL}/users/getallstudents`, {
            method: 'GET',
            headers: { 
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (response.ok) {
            // Using 'result' field as per your backend controller
            studentRegistryCache = data.result || []; 
            renderStudentTable(studentRegistryCache);
        } else {
            console.error('Failed to fetch students:', data.message);
        }
    } catch (err) {
        console.error('Connection to backend failed:', err);
    }
}

/**
 * RENDER: Build the table rows with dynamic status logic
 */
function renderStudentTable(students) {
    const tbody = document.getElementById('enrollment-matrix-body-rows');
    if (!tbody) return;

    if (!students || students.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-5">No matching records found.</td></tr>`;
        return;
    }

    tbody.innerHTML = '';
    students.forEach(student => {
        const userId = student._id;

        // 1. Project Submission Badge Logic
        let projectBadge = '';
        const pStatus = (student.projectsubmission || 'not-eligible').toLowerCase();
        
        if (pStatus === 'approved') {
            projectBadge = `<span class="badge bg-success text-uppercase">Approved</span>`;
        } else if (pStatus === 'pending') {
            projectBadge = `<span class="badge bg-warning text-dark text-uppercase">Pending</span>`;
        } else {
            projectBadge = `<span class="badge bg-danger text-uppercase">Not-Eligible</span>`;
        }

        // 2. Attendance Toggle UI (Tick/Cross + Button)
        const attendanceHTML = student.attendance 
            ? `<div class="d-flex align-items-center justify-content-center gap-2">
                <i class="bi bi-check-circle-fill text-success fs-5"></i>
                <button class="status-toggle-btn btn-reject" onclick="updateStatus('${userId}', 'attendance', false)">Mark Absent</button>
               </div>`
            : `<div class="d-flex align-items-center justify-content-center gap-2">
                <i class="bi bi-x-circle text-danger fs-5"></i>
                <button class="status-toggle-btn" onclick="updateStatus('${userId}', 'attendance', true)">Mark Present</button>
               </div>`;

        // 3. Verification & Graduation Columns
        const verifiedIcon = student.adminverified 
            ? `<i class="bi bi-shield-check text-primary fs-5" title="Admin Verified"></i>` 
            : `<i class="bi bi-shield-exclamation text-muted fs-5" title="Unverified"></i>`;

        const graduateLabel = student.graduate 
            ? `<span class="badge bg-dark px-3">GRADUATED</span>` 
            : `<span class="text-muted small fw-bold">IN-PROGRESS</span>`;

        const rowHTML = `
            <tr>
                <td>
                    <div class="fw-bold">${student.username}</div>
                    <div class="text-muted" style="font-size: 0.7rem;">${student.email}</div>
                </td>
                <td class="small text-muted font-monospace">${userId.substring(0, 8)}...</td>
                <td class="text-center">
                    <span class="badge bg-light text-dark border">Cohort ${student.cohort || 'N/A'}</span>
                </td>
                <td class="text-center">${attendanceHTML}</td>
                <td class="text-center">${projectBadge}</td>
                <td class="text-center">
                    <div class="d-flex flex-column align-items-center gap-1">
                        ${verifiedIcon}
                        ${graduateLabel}
                        <button class="btn btn-sm btn-link text-clay p-0 text-decoration-none" 
                                style="font-size: 0.7rem;" 
                                onclick="approveEnrollment('${userId}')">Verify Student</button>
                    </div>
                </td>
            </tr>`;
        
        tbody.insertAdjacentHTML('beforeend', rowHTML);
    });
}

/**
 * UPDATE STATUS: Generic function for boolean toggles (Attendance, etc.)
 */
async function updateStatus(studentId, field, value) {
    try {
        const response = await fetch(`${BASE_URL}/enrollments/update-status`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ studentId, [field]: value })
        });

        if (response.ok) {
            fetchAllStudents(); // Refresh to show changes
        } else {
            const err = await response.json();
            alert(`Error: ${err.message}`);
        }
    } catch (err) {
        console.error('Status update failed:', err);
    }
}

/**
 * APPROVE: Logic to verify enrollment (Existing endpoint)
 */
async function approveEnrollment(studentId) {
    if (!confirm("Are you sure you want to verify this student's enrollment?")) return;
    
    try {
        const response = await fetch(`${BASE_URL}/enrollments/approvebystudentId`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ studentId })
        });

        if (response.ok) {
            fetchAllStudents();
        } else {
            const error = await response.json();
            alert(`Error: ${error.message}`);
        }
    } catch (err) {
        console.error('Verification request failed:', err);
    }
}

/**
 * SEARCH & FILTERING: Local UI Filtering
 */
function executeClientSideRosterFilter() {
    const query = document.getElementById('tracker-search-input').value.toLowerCase();
    const filtered = studentRegistryCache.filter(s => 
        s.username.toLowerCase().includes(query) || 
        s.email.toLowerCase().includes(query)
    );
    renderStudentTable(filtered);
}

function applyStructuralStateFilter(filterType, btnElement) {
    // UI Update for buttons
    document.querySelectorAll('.filter-pill-btn').forEach(btn => btn.classList.remove('pill-active'));
    btnElement.classList.add('pill-active');

    let filtered = [...studentRegistryCache];

    switch(filterType) {
        case 'attendance-low':
            // Hypothetical logic if attendance was a percentage, 
            // for booleans we might show those who are 'false'
            filtered = studentRegistryCache.filter(s => !s.attendance);
            break;
        case 'project-pending':
            filtered = studentRegistryCache.filter(s => s.projectsubmission === 'pending');
            break;
        case 'graduated':
            filtered = studentRegistryCache.filter(s => s.graduate === true);
            break;
        case 'cohort':
            // Logic to filter by the current active cohort
            filtered = studentRegistryCache.filter(s => s.cohort);
            break;
    }

    renderStudentTable(filtered);
}