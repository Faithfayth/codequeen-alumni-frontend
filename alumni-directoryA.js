/**
 * Alumni Directory Manager Administrative Controller Interceptor Module
 * Governs active profile indexing matrices and locks down student editing access configurations
 */

// Memory layout global arrays storage directory matrix cache structures
let alumniDirectoryRegistryCache = [];
let operationalActiveSortingKeyField = 'name';

document.addEventListener('DOMContentLoaded', () => {
    // Mobilize side layout navigation menus control triggers configuration 
    initMobileDrawerNavigationLinks();

    // Pull database documents rows instances array collection maps metrics
    fetchMasterAlumniDirectoryDataset();
});

/**
 * Mobile navigation setup
 */
function initMobileDrawerNavigationLinks() {
    const toggleButtonNode = document.getElementById('mobile-sidebar-toggle');
    const drawerContainerMenu = document.getElementById('app-sidebar');
    if (toggleButtonNode && drawerContainerMenu) {
        toggleButtonNode.addEventListener('click', () => {
            drawerContainerMenu.classList.toggle('show-sidebar');
        });
    }
}

/**
 * Syncs active directories records lists items directly from operational backend collection structures
 */
async function fetchMasterAlumniDirectoryDataset() {
    try {
        const response = await fetch('/api/alumni-directory', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        if (response.ok) {
            alumniDirectoryRegistryCache = await response.json();
            executeDataOrderingPipeline();
        } else {
            renderMockFallbackDirectoryMatrixData();
        }
    } catch (err) {
        console.warn('API link path dropped on /api/alumni-directory; fallback mock framework loaded.');
        renderMockFallbackDirectoryMatrixData();
    }
}

/**
 * Iterates through system profiles caches collections objects to construct DOM layout tabular rows strings
 */
function renderAlumniDirectoryTableRows(datasetArray) {
    const tbody = document.getElementById('directory-records-matrix-rows');
    if (!tbody) return;

    if (datasetArray.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted py-4 small">No directory profiles match current search criteria vectors.</td></tr>`;
        return;
    }

    tbody.innerHTML = '';
    datasetArray.forEach(record => {
        const recordId = record._id || record.id;
        const shortUserId = record.userIdSymbol || record.userId || (recordId ? recordId.substring(0,6) : '000000');
        
        // Assert lock flags states. Force initial submissions to lock automatically by default design specs
        const isLocked = record.isLocked !== false; 

        const rowMarkup = `
            <tr id="directory-row-node-${recordId}">
                <td class="text-muted small fw-semibold">${shortUserId.toUpperCase()}</td>
                <td class="fw-bold text-dark">${record.name || 'Anonymous Alumna'}</td>
                <td class="text-secondary small">${record.email || 'not-provided@example.com'}</td>
                <td class="text-dark">${record.contact || 'N/A'}</td>
                <td class="text-secondary fw-medium">${record.location || 'Kampala, UG'}</td>
                <td class="fw-bold text-dark">${record.cohort || 'COGE11'}</td>
                <td class="text-secondary">${record.graduationYear || record.gradYear || '2025'}</td>
                
                <td class="text-center">
                    <label class="lock-switch-wrapper">
                        <input type="checkbox" ${isLocked ? 'checked' : ''} onchange="executeToggleAccessLockPipeline(event, '${recordId}')">
                        <span class="lock-slider">
                            <i class="bi bi-unlock-fill"></i>
                            <i class="bi bi-lock-fill"></i>
                        </span>
                    </label>
                </td>
            </tr>`;
        tbody.insertAdjacentHTML('beforeend', rowMarkup);
    });
}

/**
 * Submits dynamic access restriction changes down to the server to control the alumna interface edit state
 */
async function executeToggleAccessLockPipeline(event, profileId) {
    const checkboxToggleNode = event.target;
    const targetLockStateFlag = checkboxToggleNode.checked;

    // Capture memory entity row context reference link parameters matching target records indices
    const cachedProfile = alumniDirectoryRegistryCache.find(p => (p._id || p.id) === profileId);
    
    try {
        const response = await fetch(`/api/alumni-directory/toggle-lock/${profileId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ isLocked: targetLockStateFlag })
        });

        if (response.ok) {
            if (cachedProfile) cachedProfile.isLocked = targetLockStateFlag;
            console.log(`Profile registry instance ${profileId} access authorization lock mutated state value to: ${targetLockStateFlag}`);
        } else {
            alert('Security clearance state change rejected by structural database route verification constraints.');
            checkboxToggleNode.checked = !targetLockStateFlag; // Revert checkbox control interface element step
        }
    } catch (err) {
        // Fallback local execution runtime processing engine loop behavior mapping simulations layers
        console.log(`Local UI matrix fallback operation. Lock changed to: ${targetLockStateFlag}`);
        if (cachedProfile) cachedProfile.isLocked = targetLockStateFlag;
    }
}

/**
 * Client-Side Text Search Match Evaluation Processor Engine Block Linkages 
 */
function executeDirectorySearchFilter() {
    const searchStringQuery = document.getElementById('directory-global-search').value.toLowerCase().trim();

    if (searchStringQuery.length === 0) {
        executeDataOrderingPipeline();
        return;
    }

    const filteredStream = alumniDirectoryRegistryCache.filter(item => {
        return (
            (item.name || '').toLowerCase().includes(searchStringQuery) ||
            (item.email || '').toLowerCase().includes(searchStringQuery) ||
            (item.contact || '').toLowerCase().includes(searchStringQuery) ||
            (item.location || '').toLowerCase().includes(searchStringQuery) ||
            (item.cohort || '').toLowerCase().includes(searchStringQuery) ||
            (item.userIdSymbol || '').toLowerCase().includes(searchStringQuery)
        );
    });

    renderAlumniDirectoryTableRows(filteredStream);
}

/**
 * Sets sorting field parameters configurations matching chosen panel indicator buttons tags
 */
function applyDirectoryOrdering(sortingKeyField, UIElementNode) {
    operationalActiveSortingKeyField = sortingKeyField;

    document.querySelectorAll('.sorting-list-item').forEach(item => {
        item.classList.remove('sort-active');
    });
    if (UIElementNode) {
        UIElementNode.classList.add('sort-active');
    }

    executeDataOrderingPipeline();
}

/**
 * Runs sorting computations cleanly across active collection arrays models data fields properties
 */
function executeDataOrderingPipeline() {
    const sortedCollection = [...alumniDirectoryRegistryCache];

    sortedCollection.sort((alpha, beta) => {
        let fieldA = '';
        let fieldB = '';

        if (operationalActiveSortingKeyField === 'name') { fieldA = alpha.name; fieldB = beta.name; }
        else if (operationalActiveSortingKeyField === 'email') { fieldA = alpha.email; fieldB = beta.email; }
        else if (operationalActiveSortingKeyField === 'contact') { fieldA = alpha.contact; fieldB = beta.contact; }
        else if (operationalActiveSortingKeyField === 'location') { fieldA = alpha.location; fieldB = beta.location; }
        else if (operationalActiveSortingKeyField === 'cohort') { fieldA = alpha.cohort; fieldB = beta.cohort; }
        else if (operationalActiveSortingKeyField === 'gradYear') { 
            fieldA = (alpha.graduationYear || alpha.gradYear || '').toString(); 
            fieldB = (beta.graduationYear || beta.gradYear || '').toString(); 
        }
        else if (operationalActiveSortingKeyField === 'locked') {
            fieldA = (alpha.isLocked !== false ? '1' : '0');
            fieldB = (beta.isLocked !== false ? '1' : '0');
        }

        return (fieldA || '').toString().localeCompare((fieldB || '').toString(), undefined, { numeric: true, sensitivity: 'base' });
    });

    renderAlumniDirectoryTableRows(sortedCollection);
}

/**
 * Converts dynamic arrays tracking objects contexts to build downloadable data text structures blocks files
 */
function triggerDirectorySpreadsheetExport(exportFormatExtensionType) {
    if (alumniDirectoryRegistryCache.length === 0) {
        alert('Data collection register matrices array is empty. Download transaction aborted safely.');
        return;
    }

    let reportFileContentString = '';

    if (exportFormatExtensionType === 'csv') {
        // Construct header column blocks arrays maps
        const CSVHeadersRow = ['User ID', 'Name', 'Email', 'Contact', 'Location', 'Cohort', 'Graduation Year', 'Locked Status'];
        const dataRowsCollection = alumniDirectoryRegistryCache.map(record => [
            `"${record.userIdSymbol || record.id || ''}"`,
            `"${record.name || ''}"`,
            `"${record.email || ''}"`,
            `"${record.contact || ''}"`,
            `"${record.location || ''}"`,
            `"${record.cohort || ''}"`,
            `"${record.graduationYear || record.gradYear || ''}"`,
            `"${record.isLocked !== false ? 'LOCKED' : 'UNLOCKED'}"`
        ]);

        reportFileContentString = [CSVHeadersRow.join(','), ...dataRowsCollection.map(r => r.join(','))].join('\n');
        executeClientSideFileDownloadBypass(reportFileContentString, `CQ_Alumni_Directory_Export.${exportFormatExtensionType}`, 'text/csv');
    } else {
        // Simulate XML spreadsheet data payload streams generation for Microsoft Excel formats handling blocks
        reportFileContentString = `Mock Binary spreadsheet stream sequence arrays map for structural type definitions: XLSX. Entries count: ${alumniDirectoryRegistryCache.length}`;
        executeClientSideFileDownloadBypass(reportFileContentString, `CQ_Alumni_Directory_Export.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    }
}

function executeClientSideFileDownloadBypass(fileRawDataContent, fallbackFilenameString, mimeTypePayloadString) {
    const blobDataContainer = new Blob([fileRawDataContent], { type: mimeTypePayloadString });
    const localVirtualAnchorNode = document.createElement('a');
    
    localVirtualAnchorNode.href = URL.createObjectURL(blobDataContainer);
    localVirtualAnchorNode.download = fallbackFilenameString;
    document.body.appendChild(localVirtualAnchorNode);
    localVirtualAnchorNode.click();
    
    document.body.removeChild(localVirtualAnchorNode);
    URL.revokeObjectURL(localVirtualAnchorNode.href);
}

/**
 * Populates sample interface metrics matching layout presentation configurations expectations
 */
function renderMockFallbackDirectoryMatrixData() {
    const mockDirectoryListings = [
        { id: 'dir01', userIdSymbol: '007A4E', name: 'Jane', email: 'jane@example.com', contact: '+256 700 123 456', location: 'Kampala, UG', cohort: 'COGE11', gradYear: 2025, isLocked: true },
        { id: 'dir02', userIdSymbol: '00B2F1', name: 'Rose', email: 'rose@example.com', contact: '+256 701 234 567', location: 'Entebbe, UG', cohort: 'COGE11', gradYear: 2025, isLocked: false },
        { id: 'dir03', userIdSymbol: '00C3D2', name: 'Sarah', email: 'sarah@example.com', contact: '+256 702 345 678', location: 'Mbarara, UG', cohort: 'COGE12', gradYear: 2024, isLocked: true },
        { id: 'dir04', userIdSymbol: '00D4E3', name: 'Laura', email: 'laura@example.com', contact: '+256 703 456 789', location: 'Gulu, UG', cohort: 'COGE12', gradYear: 2024, isLocked: false }
    ];

    alumniDirectoryRegistryCache = mockDirectoryListings;
    executeDataOrderingPipeline();
}