/**
 * Administrative Directory Interaction & Integration Subsystem
 * CodeQueen Ecosystem Target Architecture
 */

document.addEventListener("DOMContentLoaded", () => {
    // 1. App Configuration Context
    const API_BASE_URL = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost' ? 'https://cq-a-bckd.onrender.com' : 'http://localhost:5000';
    const BASE_API_ROUTE = `${API_BASE_URL}/users`; // Linked exactly to alumdirectory path
    const token = localStorage.getItem("adminToken"); 
    const currentAdminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");

    // Display working admin details in header card
    const adminEmailEl = document.getElementById("adminEmailDisplay");
    if (adminEmailEl && currentAdminUser.email) {
        adminEmailEl.textContent = currentAdminUser.email;
    }

    // 2. Request Headers Generation Factory
    const getHeaders = () => ({
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    });

    // 3. Tab State Switching & Lazy-Fetching Controllers
    const tabs = document.querySelectorAll("#directoryTabs .tab-btn");
    const sections = document.querySelectorAll(".data-section");

    tabs.forEach(tab => {
        tab.addEventListener("click", async () => {
            // Remove active status highlights across buttons
            tabs.forEach(t => t.classList.remove("active"));
            
            // Hide all table sections cleanly using Bootstrap utilities
            sections.forEach(s => {
                s.classList.add("d-none");
            });

            // Bind targeted interface configuration
            tab.classList.add("active");
            const target = tab.dataset.target;
            const targetSectionId = `section-${target}`;
            
            const targetSection = document.getElementById(targetSectionId);
            if (targetSection) {
                targetSection.classList.remove("d-none");
            }

            // Execute dynamic target directory fetch ONLY when clicked
            switch (target) {
                case "alumni":
                    await fetchAndRenderAlumni();
                    break;
                case "partners":
                    await fetchAndRenderPartners();
                    break;
                case "students":
                    await fetchAndRenderStudents();
                    break;
                case "admin":
                    await fetchAndRenderAdmins();
                    break;
            }
        });
    });

    // 4. Responsive Sidebar Mobile Interactions Hooks
    const openSidebarBtn = document.getElementById("sidebar-open-toggle-trigger");
    const closeSidebarBtn = document.getElementById("sidebar-close-toggle-trigger");
    const sidebarContainer = document.getElementById("app-navigation-sidebar-container");

    if (openSidebarBtn && sidebarContainer) {
        openSidebarBtn.addEventListener("click", () => {
            sidebarContainer.classList.add("show-sidebar");
        });
    }

    if (closeSidebarBtn && sidebarContainer) {
        closeSidebarBtn.addEventListener("click", () => {
            sidebarContainer.classList.remove("show-sidebar");
        });
    }

    // ==========================================
    // DATA EXTRACTION & RENDERING CONTROLLERS
    // ==========================================

    // FETCH & RENDER: ALUMNAE REGISTER
    async function fetchAndRenderAlumni() {
        const tbody = document.getElementById("alumniTableBody");
        if (!tbody) return;
        tbody.innerHTML = `<tr><td colspan="10" class="text-center py-4"><div class="spinner-border text-warning spinner-border-sm"></div> Indexing Database Records...</td></tr>`;
        
        try {
            const response = await fetch(`${BASE_API_ROUTE}/getallalumnae`, { headers: getHeaders() });
            const data = await response.json();
            
            if (!response.ok) throw new Error(data.message || "Failed to load directory execution pool.");
            
            const users = data.result || [];
            tbody.innerHTML = users.length === 0 ? `<tr><td colspan="10" class="text-center py-3 text-muted">No registered accounts found matching "alumna" role status.</td></tr>` : "";
            
            users.forEach(u => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td class="text-secondary small font-monospace">${u._id}</td>
                    <td class="fw-semibold">${u.username || '—'}</td>
                    <td>${u.email || '—'}</td>
                    <td><span class="badge bg-light text-dark border">Cohort ${u.cohort || 'N/A'}</span></td>
                    <td class="small text-muted">${u.cohortHistory && u.cohortHistory.length ? u.cohortHistory.join(", ") : '—'}</td>
                    <td><i class="bi ${u.isMentor ? 'bi-check-circle-fill text-success' : 'bi-x-circle text-muted'}"></i></td>
                    <td><i class="bi ${u.isleader ? 'bi-check-circle-fill text-success' : 'bi-x-circle text-muted'}"></i></td>
                    <td><i class="bi ${u.isAdmin ? 'bi-shield-check text-danger' : 'bi-x-circle text-muted'}"></i></td>
                    <td><span class="badge bg-secondary-subtle text-secondary-emphasis">0 assigned</span></td>
                    <td><button class="btn btn-sm btn-outline-danger pt-0 pb-0 px-2" onclick="deleteUserRecord('${u._id}', 'alumni')"><i class="bi bi-trash3 small"></i></button></td>
                `;
                tbody.appendChild(tr);
            });
        } catch (err) {
            tbody.innerHTML = `<tr><td colspan="10" class="text-center text-danger py-3">Error extraction pool failure: ${err.message}</td></tr>`;
        }
    }

    // FETCH & RENDER: PARTNER REGISTRY
    async function fetchAndRenderPartners() {
        const tbody = document.getElementById("partnersTableBody");
        if (!tbody) return;
        tbody.innerHTML = `<tr><td colspan="9" class="text-center py-4"><div class="spinner-border text-warning spinner-border-sm"></div> Pulling System Records...</td></tr>`;
        
        try {
            const response = await fetch(`http://localhost:5000/partners/getapprovedpartners`, { headers: getHeaders() });
            
            if (!response.ok) throw new Error("Could not extract clean structural configuration array.");
            const profiles = await response.json() || [];
            
            tbody.innerHTML = profiles.length === 0 ? `<tr><td colspan="9" class="text-center py-3 text-muted">No validated partners registry entities found in system memory.</td></tr>` : "";
            
            profiles.forEach(p => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td class="text-secondary small font-monospace">${p.userID || '—'}</td>
                    <td class="fw-bold text-dark">${p.companyname || '—'}</td>
                    <td><i class="bi bi-geo-alt text-muted me-1"></i>${p.location || '—'}</td>
                    <td class="text-truncate small" style="max-width: 200px;" title="${p.description}">${p.description || '—'}</td>
                    <td><a href="${p.website}" target="_blank" class="text-decoration-none text-truncate d-inline-block" style="max-width:120px;">${p.website || '—'}</a></td>
                    <td class="text-truncate small text-muted" style="max-width: 100px;">${p.logoUrl || '—'}</td>
                    <td><span class="badge bg-light text-dark border font-monospace">${p.contact || '—'}</span></td>
                    <td>${p.email || '—'}</td>
                    <td><button class="btn btn-sm btn-outline-danger pt-0 pb-0 px-2" onclick="deletePartnerProfileRecord('${p._id}')"><i class="bi bi-trash3 small"></i></button></td>
                `;
                tbody.appendChild(tr);
            });
        } catch (err) {
            tbody.innerHTML = `<tr><td colspan="9" class="text-center text-danger py-3">Failed loading profiles: ${err.message}</td></tr>`;
        }
    }

    // FETCH & RENDER: STUDENTS DIRECTORY
    async function fetchAndRenderStudents() {
        const tbody = document.getElementById("studentsTableBody");
        if (!tbody) return;
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4"><div class="spinner-border text-warning spinner-border-sm"></div> Compiling Active Registers...</td></tr>`;
        
        try {
            const response = await fetch(`${BASE_API_ROUTE}/getallstudents`, { headers: getHeaders() });
            const data = await response.json();
            
            if (!response.ok) throw new Error(data.message || "Failed running verification sequence lookup.");
            
            const users = data.result || [];
            tbody.innerHTML = users.length === 0 ? `<tr><td colspan="6" class="text-center py-3 text-muted">No student profiles registered.</td></tr>` : "";
            
            users.forEach(u => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td class="text-secondary small font-monospace">${u._id}</td>
                    <td class="fw-semibold">${u.username || '—'}</td>
                    <td>${u.email || '—'}</td>
                    <td><span class="badge bg-light text-dark border">Cohort ${u.cohort || '0'}</span></td>
                    <td class="small text-muted">${u.cohortHistory && u.cohortHistory.length ? u.cohortHistory.join(", ") : '—'}</td>
                    <td><button class="btn btn-sm btn-outline-danger pt-0 pb-0 px-2" onclick="deleteUserRecord('${u._id}', 'students')"><i class="bi bi-trash3 small"></i></button></td>
                `;
                tbody.appendChild(tr);
            });
        } catch (err) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger py-3">Extraction abort sequence triggered: ${err.message}</td></tr>`;
        }
    }

    // FETCH & RENDER: ADMINISTRATIVE STAFF ACCOUNT INDEX
    async function fetchAndRenderAdmins() {
        const tbody = document.getElementById("adminTableBody");
        if (!tbody) return;
        tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4"><div class="spinner-border text-warning spinner-border-sm"></div> Parsing Security Protocols...</td></tr>`;
        
        try {
            const response = await fetch(`${BASE_API_ROUTE}/getalladmin`, { headers: getHeaders() });
            const data = await response.json();
            
            if (!response.ok) throw new Error(data.message || "System failure reading security clearance logs.");
            
            const users = data.result || [];
            tbody.innerHTML = users.length === 0 ? `<tr><td colspan="5" class="text-center py-3 text-muted">No administrative clearance records stored.</td></tr>` : "";
            
            let incrementalAdminNo = 1001;
            users.forEach(u => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td class="text-secondary small font-monospace">${u._id}</td>
                    <td class="fw-bold text-dark">${u.username || '—'} <span class="badge bg-warning text-dark ms-1 small" style="font-size:0.75rem;">Root System</span></td>
                    <td>${u.email || '—'}</td>
                    <td><span class="badge bg-danger-subtle text-danger border border-danger-subtle"><i class="bi bi-shield-fill-check me-1"></i>${u.isAdmin || 'true'}</span></td>
                    <td class="font-monospace fw-bold text-secondary">ADM-${incrementalAdminNo++}</td>
                `;
                tbody.appendChild(tr);
            });
        } catch (err) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger py-3">Security validation logs rendering exception: ${err.message}</td></tr>`;
        }
    }

    // ==========================================
    // EXPLICIT ACTION HOOK MUTATIONS
    // ==========================================

    window.deleteUserRecord = async (id, contextTab) => {
        if (!confirm("Are you absolutely sure you want to completely erase this user account? This cannot be undone.")) return;
        try {
            const response = await fetch(`${BASE_API_ROUTE}/delete/${id}`, { 
                method: "DELETE",
                headers: getHeaders() 
            });
            const resData = await response.json();
            alert(resData.message || "Operation committed successfully.");
            
            if (contextTab === "alumni") await fetchAndRenderAlumni();
            if (contextTab === "students") await fetchAndRenderStudents();
        } catch (err) {
            alert(`Execution Failure: ${err.message}`);
        }
    };

    window.deletePartnerProfileRecord = async (profileId) => {
        if (!confirm("Wipe this company registry entry clean from ecosystem network stream metrics?")) return;
        try {
            const response = await fetch(`${API_BASE_URL}/partners/deletepartnerprofile/${profileId}`, {
                method: "DELETE",
                headers: getHeaders()
            });
            const resData = await response.json();
            alert(resData.message || "Partner record removed.");
            await fetchAndRenderPartners();
        } catch (err) {
            alert(`Execution Failure: ${err.message}`);
        }
    };

    // Global session logout wire-up
    window.logoutSession = () => {
        localStorage.clear();
        window.location.href = "login.html"; 
    };

    // Initially don't trigger anything automatic until a tab navigation link selection occurs.
    // If you want Alumni loaded implicitly at first arrival, uncomment the line below:
    // fetchAndRenderAlumni();
});