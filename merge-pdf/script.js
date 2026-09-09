// ==========================================
// 1. INJECT DEPENDENCIES & STYLES
// ==========================================
(function initEnvironment() {
    // Dynamically load pdf-lib for client-side processing
    if (!window.PDFLib) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js';
        document.head.appendChild(script);
    }

    // Inject dynamic CSS for the file list & buttons
    const style = document.createElement('style');
    style.innerHTML = `
        .file-list-container { margin-top: 2rem; text-align: left; }
        .file-item { background: var(--bg-card); border: 1px solid var(--border-subtle); padding: 1rem; margin-bottom: 0.5rem; border-radius: 8px; display: flex; align-items: center; gap: 1rem; cursor: grab; transition: border-color 0.2s; }
        .file-item.dragging { opacity: 0.5; border-color: var(--cyber-cyan); }
        .file-item:hover { border-color: rgba(0, 255, 204, 0.5); }
        .drag-handle { color: var(--text-muted); cursor: grab; font-size: 1.2rem; }
        .file-info { flex-grow: 1; overflow: hidden; }
        .file-name { color: var(--text-main); font-weight: 500; font-size: 0.95rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .file-size { color: var(--text-muted); font-size: 0.8rem; }
        .remove-btn { background: none; border: none; color: #ff4444; cursor: pointer; font-size: 1.2rem; transition: transform 0.2s; }
        .remove-btn:hover { transform: scale(1.1); }
        
        /* Fixed Overlap and Flex Layout for multiple buttons */
        .action-container { margin-top: 2rem; margin-bottom: 5rem; display: none; gap: 1rem; justify-content: center; flex-wrap: wrap; align-items: center; }
        
        .btn-merge { background-color: var(--cyber-cyan); color: #000; border: none; padding: 1rem 3rem; font-size: 1.1rem; font-weight: 700; font-family: 'Space Grotesk', sans-serif; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 0 15px rgba(0, 255, 204, 0.2); text-decoration: none; display: inline-flex; align-items: center; gap: 8px; }
        .btn-merge:hover { transform: translateY(-3px); box-shadow: 0 5px 20px rgba(0, 255, 204, 0.4); }
        .btn-merge:disabled { background-color: #333; color: #888; cursor: not-allowed; transform: none; box-shadow: none; }
        
        /* Secondary Buttons UX */
        .btn-secondary { background-color: transparent; color: var(--text-main); border: 1px solid var(--border-subtle); padding: 1rem 2rem; font-size: 1rem; font-weight: 600; font-family: 'Space Grotesk', sans-serif; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; }
        .btn-secondary:hover { border-color: var(--cyber-cyan); color: var(--cyber-cyan); background-color: rgba(0, 255, 204, 0.05); }
        
        .success-message { width: 100%; text-align: center; color: var(--cyber-cyan); font-size: 1.3rem; font-weight: 600; margin-bottom: 1rem; }
    `;
    document.head.appendChild(style);
})();

// ==========================================
// 2. STATE MANAGEMENT
// ==========================================
let pdfFiles = []; // Array of File objects
let draggedItemIndex = null;

const dropzone = document.getElementById('pdf-dropzone');
const fileInput = document.getElementById('file-input');

// Create UI containers dynamically
const listContainer = document.createElement('div');
listContainer.className = 'file-list-container';
const actionContainer = document.createElement('div');
actionContainer.className = 'action-container';

// Insert after dropzone
dropzone.parentNode.insertBefore(listContainer, dropzone.nextSibling);
listContainer.parentNode.insertBefore(actionContainer, listContainer.nextSibling);

// Initialize Default Merge Button
function initMergeButton() {
    actionContainer.innerHTML = '';
    const mergeBtn = document.createElement('button');
    mergeBtn.className = 'btn-merge';
    mergeBtn.innerHTML = '<i class="fa-solid fa-layer-group"></i> Merge PDFs';
    mergeBtn.addEventListener('click', executeMerge);
    actionContainer.appendChild(mergeBtn);
}
initMergeButton();

// ==========================================
// 3. EVENT LISTENERS
// ==========================================
dropzone.addEventListener('click', (e) => {
    if (e.target.tagName !== 'BUTTON') fileInput.click();
});
fileInput.addEventListener('change', (e) => handleFiles(e.target.files));

dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
});
dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    handleFiles(e.dataTransfer.files);
});
window.addEventListener('paste', (e) => {
    if (e.clipboardData && e.clipboardData.files.length > 0) handleFiles(e.clipboardData.files);
});

// ==========================================
// 4. FILE HANDLING & UI RENDERING
// ==========================================
function handleFiles(files) {
    const newFiles = Array.from(files).filter(file => file.type === 'application/pdf');
    if (newFiles.length === 0) {
        alert('Invalid format. Please select PDF substrates only.');
        return;
    }
    pdfFiles = [...pdfFiles, ...newFiles];
    renderFileList();
}

function formatBytes(bytes, decimals = 2) {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

function renderFileList() {
    listContainer.innerHTML = '';
    
    if (pdfFiles.length === 0) {
        actionContainer.style.display = 'none';
        return;
    }
    
    actionContainer.style.display = 'flex'; // Changed from block to flex for proper centering

    pdfFiles.forEach((file, index) => {
        const item = document.createElement('div');
        item.className = 'file-item';
        item.draggable = true;
        item.dataset.index = index;

        item.innerHTML = `
            <i class="fa-solid fa-grip-vertical drag-handle"></i>
            <div class="file-info">
                <div class="file-name">${file.name}</div>
                <div class="file-size">${formatBytes(file.size)}</div>
            </div>
            <button class="remove-btn" onclick="removeFile(${index})" title="Remove File">
                <i class="fa-solid fa-xmark"></i>
            </button>
        `;

        // Reordering Drag Events
        item.addEventListener('dragstart', () => {
            draggedItemIndex = index;
            setTimeout(() => item.classList.add('dragging'), 0);
        });
        item.addEventListener('dragend', () => item.classList.remove('dragging'));
        item.addEventListener('dragover', (e) => {
            e.preventDefault();
            const draggingEl = document.querySelector('.dragging');
            const siblings = [...listContainer.querySelectorAll('.file-item:not(.dragging)')];
            let nextSibling = siblings.find(sibling => {
                return e.clientY <= sibling.getBoundingClientRect().top + sibling.offsetHeight / 2;
            });
            listContainer.insertBefore(draggingEl, nextSibling);
        });
        item.addEventListener('drop', (e) => {
            e.preventDefault();
            const newOrderNodes = [...listContainer.querySelectorAll('.file-item')];
            pdfFiles = newOrderNodes.map(node => pdfFiles[node.dataset.index]);
            renderFileList(); 
        });

        listContainer.appendChild(item);
    });
}

window.removeFile = function(index) {
    pdfFiles.splice(index, 1);
    renderFileList();
};

// Reset Tool Function
window.resetTool = function() {
    pdfFiles = [];
    document.getElementById('pdf-dropzone').style.display = 'block';
    listContainer.style.display = 'block';
    renderFileList();
    initMergeButton();
};

// ==========================================
// 5. CLIENT-SIDE MERGE LOGIC (pdf-lib)
// ==========================================
async function executeMerge() {
    if (pdfFiles.length < 2) {
        alert('Synthesis requires at least two PDF files to merge.');
        return;
    }

    if (!window.PDFLib) {
        alert('Engine is still loading. Please wait a moment.');
        return;
    }

    const mergeBtn = actionContainer.querySelector('.btn-merge');
    
    try {
        // UI Loading State
        mergeBtn.disabled = true;
        mergeBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Synthesizing...';

        const { PDFDocument } = window.PDFLib;
        const mergedPdf = await PDFDocument.create();

        for (const file of pdfFiles) {
            const arrayBuffer = await file.arrayBuffer();
            const pdfToMerge = await PDFDocument.load(arrayBuffer);
            const copiedPages = await mergedPdf.copyPages(pdfToMerge, pdfToMerge.getPageIndices());
            copiedPages.forEach((page) => mergedPdf.addPage(page));
        }

        const mergedPdfBytes = await mergedPdf.save();
        const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        // Artificial delay for smooth UX transition
        setTimeout(() => {
            // Hide upload UI
            document.getElementById('pdf-dropzone').style.display = 'none';
            listContainer.style.display = 'none';
            
            // Render Post-Merge UI
            actionContainer.innerHTML = `
                <div class="success-message">
                    <i class="fa-solid fa-circle-check"></i> Synthesis Complete!
                </div>
                <a href="${url}" download="PDFase_Merged.pdf" class="btn-merge">
                    <i class="fa-solid fa-download"></i> Download PDF
                </a>
                <button class="btn-secondary" onclick="resetTool()">
                    <i class="fa-solid fa-rotate-right"></i> Merge More
                </button>
                <a href="/" class="btn-secondary">
                    <i class="fa-solid fa-toolbox"></i> Other Tools
                </a>
            `;
        }, 800);

    } catch (error) {
        console.error('Synthesis Error:', error);
        alert('A critical error occurred. Make sure your PDFs are not encrypted with passwords.');
        mergeBtn.disabled = false;
        mergeBtn.innerHTML = '<i class="fa-solid fa-layer-group"></i> Merge PDFs';
    }
}
