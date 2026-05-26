// Base API configuration route path prefix
const API_BASE_URL = 'http://localhost:5000/gallery'; 
let localGalleryCache = [];

// Appends explicit local user tokens to request pipelines
const getAuthHeaders = () => {
    const token = localStorage.getItem('token'); 
    return {
        'Authorization': `Bearer ${token}`
    };
};

// Application pipeline initialize hook sequence
document.addEventListener('DOMContentLoaded', () => {
    fetchGalleryStream();
    setupFormEventListeners();
    setupSearchFilters();
});

// 1. GET ALL IMAGES DISPATCH CONTROLLER
async function fetchGalleryStream() {
    try {
        const response = await fetch(`${API_BASE_URL}/getallimages`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        const data = await response.json();
        if (response.ok) {
            localGalleryCache = data.result || [];
            renderGrid(localGalleryCache);
        } else {
            console.error("API Gallery lookup error message output:", data.message);
        }
    } catch (err) {
        console.error("Ecosystem route asset resource network pipeline failure:", err.message);
    }
}

// 2. RUNTIME DOM STREAM CARD GENERATOR
function renderGrid(imagesList) {
    const galleryGrid = document.getElementById('galleryGrid');
    if (!galleryGrid) return;
    
    galleryGrid.innerHTML = ''; 

    if (imagesList.length === 0) {
        galleryGrid.innerHTML = `
            <div class="col-12 text-center py-5 text-muted">
                <span class="material-icons-outlined fs-2 d-block mb-2">hide_image</span>
                <p>No gallery images found mapping this specific configuration.</p>
            </div>`;
        return;
    }

    imagesList.forEach(img => {
        const colCard = document.createElement('div');
        // Implements clean rendering framework across variable viewport layout targets
        colCard.className = 'col-lg-4 col-md-6 col-sm-12';

        colCard.innerHTML = `
            <div class="gallery-card-wrapper shadow-sm">
                <img src="${img.imageUrl}" alt="${img.caption || 'Ecosystem Asset Submission'}" class="gallery-display-img">
                
                <div class="caption-overlay-container">
                    <div class="caption-pill-box">
                        ${img.caption ? img.caption : 'Untitled Entry'}
                    </div>
                </div>
            </div>
        `;
        galleryGrid.appendChild(colCard);
    });
}

// 3. SECURE MULTIPART FORMDATA DATA SUBMISSION HANDLER
function setupFormEventListeners() {
    const uploadForm = document.getElementById('galleryUploadForm');
    const fileInput = document.getElementById('imageFileInput');
    const dropzonePreview = document.getElementById('dropzonePreview');

    if (!uploadForm || !fileInput) return;

    // Handle interactive thumbnail previews on state file selections
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                dropzonePreview.innerHTML = `
                    <img src="${event.target.result}" class="preview-thumbnail" alt="Active file container stream snapshot">
                `;
            };
            reader.readAsDataURL(file);
        }
    });

    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const file = fileInput.files[0];
        if (!file) {
            alert('Selection Error: An image asset is mandatory to write data records.');
            return;
        }

        const formData = new FormData();
        formData.append('image', file); 
        formData.append('caption', document.getElementById('imageCaption').value.trim());
        formData.append('keywords', document.getElementById('imageKeywords').value.trim());
        formData.append('category', document.getElementById('imageCategory').value.trim());

        try {
            const response = await fetch(`${API_BASE_URL}/addimage`, {
                method: 'POST',
                headers: getAuthHeaders(), 
                body: formData
            });

            const data = await response.json();
            if (response.ok) {
                alert('Success: Item committed to gallery index.');
                
                uploadForm.reset();
                dropzonePreview.innerHTML = `
                    <span class="material-icons-outlined upload-icon mb-2">add_photo_alternate</span>
                    <span class="upload-main-text">Add photo</span>
                    <span class="upload-sub-text mt-1">jpg, png, jpeg, ...</span>
                `;
                
                fetchGalleryStream(); 
            } else {
                alert(`Upload Blocked: ${data.message}`);
            }
        } catch (error) {
            console.error("Network write interaction pipeline execution failed:", error);
            alert("Structural network connectivity error.");
        }
    });
}

// 4. CLIENT SIDE QUERY SEARCH STRING ENGINE
function setupSearchFilters() {
    const searchInput = document.getElementById('keywordSearch');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', (e) => {
        const queryTerm = e.target.value.toLowerCase().trim();
        
        if (!queryTerm) {
            renderGrid(localGalleryCache);
            return;
        }

        const structuredResults = localGalleryCache.filter(img => {
            const matchCaption = img.caption && img.caption.toLowerCase().includes(queryTerm);
            const matchCategory = img.category && img.category.toLowerCase().includes(queryTerm);
            
            // Evaluates arrays if keyword string indexes are structured as arrays via database schemas
            let matchKeywords = false;
            if (Array.isArray(img.keywords)) {
                matchKeywords = img.keywords.some(kw => kw.toLowerCase().includes(queryTerm));
            } else if (typeof img.keywords === 'string') {
                matchKeywords = img.keywords.toLowerCase().includes(queryTerm);
            }
            
            return matchKeywords || matchCaption || matchCategory;
        });

        renderGrid(structuredResults);
    });
}