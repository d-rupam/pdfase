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

    // Inject dynamic CSS for the file list & merge button
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
        .action-container { text-align: center; margin-top: 2rem; display: none; }
        .btn-merge { background-color: var(--cyber-cyan); color: #000; border: none; padding: 1rem 3rem; font-size: 1.1rem; font-weight: 700; font-family: 'Space Grotesk', sans-serif; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 0 15px rgba(0, 255, 204, 0.2); }
        .btn-merge:hover { transform: translateY(-3px); box-shadow: 0 5px 20px rgba(0, 255, 204, 0.4); }
        .btn-merge:disabled { background-color: #555; color: #888; cursor: not-allowed; transform: none; box-shadow: none; }
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

const mergeBtn = document.createElement('button');
mergeBtn.className = 'btn-merge';
mergeBtn.innerHTML = '<i class="fa-solid fa-layer-group"></i> Merge PDFs';
actionContainer.appendChild(mergeBtn);

// Insert after dropzone
dropzone.parentNode.insertBefore(listContainer, dropzone.nextSibling);
listContainer.parentNode.insertBefore(actionContainer, listContainer.nextSibling);

// ==========================================
// 3. EVENT LISTENERS
// ==========================================
// Click to upload
dropzone.addEventListener('click', (e) => {
    if (e.target.tagName !== 'BUTTON') fileInput.click();
});

// File Input Change
fileInput.addEventListener('change', (e) => handleFiles(e.target.files));

// Drag & Drop Handling
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

// Paste Handling (Ctrl+V)
window.addEventListener('paste', (e) => {
    if (e.clipboardData && e.clipboardData.files.length > 0) {
        handleFiles(e.clipboardData.files);
    }
});

// Merge Button Click
mergeBtn.addEventListener('click', executeMerge);

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
    
    actionContainer.style.display = 'block';

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
            <button class="remove-btn" onclick="removeFile(${index})" title="Cleave Sequence">
                <i class="fa-solid fa-xmark"></i>
            </button>
        `;

        // Reordering Drag Events
        item.addEventListener('dragstart', (e) => {
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
            // Reconstruct array based on DOM order
            const newOrderNodes = [...listContainer.querySelectorAll('.file-item')];
            const newPdfFiles = newOrderNodes.map(node => pdfFiles[node.dataset.index]);
            pdfFiles = newPdfFiles;
            renderFileList(); // Re-render to fix indices
        });

        listContainer.appendChild(item);
    });
}

window.removeFile = function(index) {
    pdfFiles.splice(index, 1);
    renderFileList();
};

// ==========================================
// 5. CLIENT-SIDE MERGE LOGIC (pdf-lib)
// ==========================================
async function executeMerge() {
    if (pdfFiles.length < 2) {
        alert('Synthesis requires at least two PDF substrates to merge.');
        return;
    }

    if (!window.PDFLib) {
        alert('Enzyme engine (pdf-lib) is still loading. Please wait a moment.');
        return;
    }

    try {
        mergeBtn.disabled = true;
        mergeBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Synthesizing Sequence...';

        const { PDFDocument } = window.PDFLib;
        const mergedPdf = await PDFDocument.create();

        for (const file of pdfFiles) {
            const arrayBuffer = await file.arrayBuffer();
            const pdfToMerge = await PDFDocument.load(arrayBuffer);
            const copiedPages = await mergedPdf.copyPages(pdfToMerge, pdfToMerge.getPageIndices());
            
            copiedPages.forEach((page) => {
                mergedPdf.addPage(page);
            });
        }

        const mergedPdfBytes = await mergedPdf.save();
        
        // Trigger Download
        const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'PDFase_Merged_Sequence.pdf';
        document.body.appendChild(a);
        a.click();
        
        // Cleanup
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);

    } catch (error) {
        console.error('Synthesis Error:', error);
        alert('A critical error occurred during structural synthesis. Check console for details.');
    } finally {
        mergeBtn.disabled = false;
        mergeBtn.innerHTML = '<i class="fa-solid fa-layer-group"></i> Merge PDFs';
    }
}
