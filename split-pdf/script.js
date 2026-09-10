// ==========================================
// 1. INJECT DEPENDENCIES & STYLES (SPLIT PDF)
// ==========================================
(function initEnvironment() {
    // Load pdf-lib for client-side processing
    if (!window.PDFLib) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js';
        document.head.appendChild(script);
    }

    const style = document.createElement('style');
    style.innerHTML = `
        /* Dynamic Dropzone */
        .dropzone { transition: padding 0.3s ease, min-height 0.3s ease; -webkit-tap-highlight-color: transparent; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .dropzone.has-files { padding: 1.5rem 1.5rem !important; margin-bottom: 0 !important; cursor: default; }

        /* Controls Container (Top Bar) */
        .controls-container { display: none; justify-content: space-between; align-items: center; width: 100%; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border-subtle); flex-wrap: wrap; gap: 10px; }
        .file-info { display: flex; align-items: center; gap: 10px; color: var(--text-main); font-family: 'JetBrains Mono', monospace; font-size: 0.95rem; }
        .file-info i { color: var(--cyber-cyan); font-size: 1.2rem; }
        .selection-tools { display: flex; gap: 10px; }
        .btn-text { background: rgba(0, 255, 204, 0.05); border: 1px solid rgba(0, 255, 204, 0.2); color: var(--cyber-cyan); cursor: pointer; font-family: 'Space Grotesk', sans-serif; font-size: 0.85rem; font-weight: 600; padding: 6px 12px; border-radius: 6px; transition: all 0.2s; }
        .btn-text:hover { background: rgba(0, 255, 204, 0.15); border-color: var(--cyber-cyan); }

        /* Scrollable Grid for Pages */
        .a4-grid { display: flex; flex-wrap: wrap; gap: 1rem; justify-content: center; width: 100%; padding: 0.5rem; margin: 0; max-height: 55vh; overflow-y: auto; }
        
        /* Custom Scrollbar */
        .a4-grid::-webkit-scrollbar { width: 8px; }
        .a4-grid::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.02); border-radius: 4px; }
        .a4-grid::-webkit-scrollbar-thumb { background: rgba(0, 255, 204, 0.2); border-radius: 4px; }
        .a4-grid::-webkit-scrollbar-thumb:hover { background: rgba(0, 255, 204, 0.5); }

        /* Page Cards */
        .page-card { width: 110px; height: 150px; background-color: var(--bg-card); border: 2px solid var(--border-subtle); border-radius: 8px; position: relative; padding: 10px; text-align: center; display: flex; flex-direction: column; justify-content: center; align-items: center; cursor: pointer; transition: all 0.2s ease; user-select: none; box-shadow: 0 4px 10px rgba(0,0,0,0.2); }
        .page-card:hover { border-color: rgba(0, 255, 204, 0.5); transform: translateY(-3px); box-shadow: 0 6px 15px rgba(0, 255, 204, 0.15); }
        .page-card.selected { border-color: var(--cyber-cyan); background-color: rgba(0, 255, 204, 0.05); transform: translateY(-3px); box-shadow: 0 6px 20px rgba(0, 255, 204, 0.2); }
        
        .page-number { font-size: 2.8rem; font-weight: 800; font-family: 'JetBrains Mono', monospace; color: var(--text-muted); transition: color 0.2s; line-height: 1; }
        .page-card:hover .page-number { color: #fff; }
        .page-card.selected .page-number { color: var(--cyber-cyan); }
        
        .page-label { font-size: 0.8rem; color: var(--text-muted); margin-top: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
        .page-card.selected .page-label { color: #fff; }
        
        .check-icon { position: absolute; top: -10px; right: -10px; background: var(--cyber-cyan); color: #000; border-radius: 50%; width: 26px; height: 26px; font-size: 0.9rem; display: none; justify-content: center; align-items: center; box-shadow: 0 2px 8px rgba(0, 255, 204, 0.5); z-index: 10; }
        .page-card.selected .check-icon { display: flex; animation: popIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        
        @keyframes popIn { 0% { transform: scale(0); } 100% { transform: scale(1); } }

        /* Action Container */
        .action-container { margin-top: 1.5rem !important; margin-bottom: 3rem; display: none; gap: 0.5rem; justify-content: center; flex-direction: column; align-items: center; }
        .button-group { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; width: 100%; }
        
        .btn-action { background-color: var(--cyber-cyan); color: #000; border: none; padding: 0.85rem 2.5rem; font-size: 1.05rem; font-weight: 700; font-family: 'Space Grotesk', sans-serif; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 0 15px rgba(0, 255, 204, 0.2); text-decoration: none; display: inline-flex; align-items: center; gap: 8px; }
        .btn-action:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 5px 20px rgba(0, 255, 204, 0.4); }
        .btn-action:disabled { background-color: #2a2a2a; color: #666; cursor: not-allowed; box-shadow: none; border: 1px solid #444; }
        
        .btn-secondary { background-color: transparent; color: var(--text-main); border: 1px solid var(--border-subtle); padding: 0.85rem 1.75rem; font-size: 0.95rem; font-weight: 600; font-family: 'Space Grotesk', sans-serif; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; }
        .btn-secondary:hover { border-color: var(--cyber-cyan); color: var(--cyber-cyan); background-color: rgba(0, 255, 204, 0.05); }

        /* Success UI */
        .success-message { width: 100%; text-align: center; color: var(--cyber-cyan); font-size: 1.2rem; font-weight: 600; margin-bottom: 0.25rem; }
        .file-flow { color: var(--text-muted); font-size: 0.85rem; margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: center; gap: 8px; flex-wrap: wrap; background: rgba(0, 255, 204, 0.03); padding: 10px 20px; border-radius: 8px; border: 1px solid rgba(0, 255, 204, 0.2); text-align: center; max-width: 100%; word-break: break-word; }
        .file-flow-name { color: var(--text-main); font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; }
        .file-flow-final { color: #fff; font-weight: 700; border-bottom: 1px dashed var(--cyber-cyan); font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; }
        
        .loading-overlay { position: absolute; inset: 0; background: var(--bg-card); display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 12px; z-index: 50; gap: 15px; }
        .loading-overlay i { font-size: 3rem; color: var(--cyber-cyan); }
        .loading-overlay p { font-weight: 600; color: #fff; }
    `;
    document.head.appendChild(style);
})();

// ==========================================
// WAIT FOR HTML DOM TO FULLY LOAD
// ==========================================
document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 2. STATE MANAGEMENT & DOM SETUP
    // ==========================================
    let currentPdfBytes = null;
    let currentFileName = "";
    let totalPages = 0;
    let selectedPages = new Set(); // Stores 1-based page numbers

    const dropzone = document.getElementById('pdf-dropzone');
    const fileInput = document.getElementById('file-input');
    const selectFilesBtn = document.getElementById('select-files-btn');
    const defaultDropzoneElements = Array.from(dropzone.children).filter(el => el.id !== 'file-input');

    // Create Controls Container (Top Bar)
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'controls-container';
    controlsContainer.innerHTML = `
        <div class="file-info" id="file-info-display"></div>
        <div class="selection-tools">
            <button class="btn-text" id="btn-select-all">Select All</button>
            <button class="btn-text" id="btn-deselect-all">Deselect All</button>
        </div>
    `;
    dropzone.appendChild(controlsContainer);

    // Create Scrollable Grid
    const a4Grid = document.createElement('div');
    a4Grid.className = 'a4-grid';
    a4Grid.style.display = 'none';
    dropzone.appendChild(a4Grid);

    // Create Action Container (Below Dropzone)
    const actionContainer = document.createElement('div');
    actionContainer.className = 'action-container';
    dropzone.parentNode.insertBefore(actionContainer, dropzone.nextSibling);

    let splitBtn; // Reference to the main action button

    function initSplitUI() {
        actionContainer.innerHTML = '';
        const btnGroup = document.createElement('div');
        btnGroup.className = 'button-group';
        
        splitBtn = document.createElement('button');
        splitBtn.className = 'btn-action';
        splitBtn.disabled = true; // Disabled initially
        splitBtn.innerHTML = '<i class="fa-solid fa-scissors"></i> Extract Pages';
        splitBtn.addEventListener('click', executeSplit);
        
        btnGroup.appendChild(splitBtn);
        actionContainer.appendChild(btnGroup);

        // Hook up selection buttons
        document.getElementById('btn-select-all').addEventListener('click', (e) => {
            e.stopPropagation();
            selectAllPages();
        });
        document.getElementById('btn-deselect-all').addEventListener('click', (e) => {
            e.stopPropagation();
            deselectAllPages();
        });
    }
    initSplitUI();

    // ==========================================
    // 3. EVENT LISTENERS
    // ==========================================
    
    if (selectFilesBtn) {
        selectFilesBtn.addEventListener('click', (e) => {
            e.preventDefault(); e.stopPropagation();
            fileInput.click();
        });
    }

    dropzone.addEventListener('click', (e) => {
        // Only trigger file input if no file is loaded and we aren't clicking a card
        if (!currentPdfBytes && e.target !== fileInput) {
            fileInput.click();
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFile(e.target.files[0]);
            fileInput.value = ''; 
        }
    });

    dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    window.addEventListener('paste', (e) => {
        if (!currentPdfBytes && e.clipboardData && e.clipboardData.files.length > 0) {
            handleFile(e.clipboardData.files[0]);
        }
    });

    // ==========================================
    // 4. FILE HANDLING & UI RENDERING
    // ==========================================
    async function handleFile(file) {
        if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
            alert('Invalid format. Please select a PDF document.');
            return;
        }

        if (!window.PDFLib) {
            alert('Engine is still loading. Please wait a moment.');
            return;
        }

        // Show loading state in dropzone
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'loading-overlay';
        loadingDiv.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i><p>Analyzing Document Structure...</p>';
        dropzone.appendChild(loadingDiv);

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await window.PDFLib.PDFDocument.load(arrayBuffer);
            
            totalPages = pdfDoc.getPageCount();
            currentPdfBytes = arrayBuffer;
            currentFileName = file.name;
            selectedPages.clear(); // Reset selections

            renderPageGrid();
        } catch (error) {
            console.error('Error loading PDF:', error);
            alert('Could not read the PDF file. It might be corrupted or password-protected.');
        } finally {
            if (dropzone.contains(loadingDiv)) dropzone.removeChild(loadingDiv);
        }
    }

    function renderPageGrid() {
        dropzone.classList.add('has-files');
        defaultDropzoneElements.forEach(el => el.style.display = 'none');
        
        controlsContainer.style.display = 'flex';
        document.getElementById('file-info-display').innerHTML = `
            <i class="fa-solid fa-file-pdf"></i> ${currentFileName} <span style="color:var(--text-muted);">(${totalPages} Pages)</span>
        `;

        a4Grid.style.display = 'flex';
        actionContainer.style.display = 'flex';
        a4Grid.innerHTML = '';

        for (let i = 1; i <= totalPages; i++) {
            const card = document.createElement('div');
            card.className = 'page-card';
            card.dataset.page = i;
            
            card.innerHTML = `
                <div class="check-icon"><i class="fa-solid fa-check"></i></div>
                <div class="page-number">${i}</div>
                <div class="page-label">Page</div>
            `;

            card.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent dropzone click
                togglePageSelection(i, card);
            });

            a4Grid.appendChild(card);
        }

        updateActionState();
    }

    function togglePageSelection(pageNum, cardElement) {
        if (selectedPages.has(pageNum)) {
            selectedPages.delete(pageNum);
            cardElement.classList.remove('selected');
        } else {
            selectedPages.add(pageNum);
            cardElement.classList.add('selected');
        }
        updateActionState();
    }

    function selectAllPages() {
        const cards = a4Grid.querySelectorAll('.page-card');
        cards.forEach((card, index) => {
            const pageNum = index + 1;
            selectedPages.add(pageNum);
            card.classList.add('selected');
        });
        updateActionState();
    }

    function deselectAllPages() {
        selectedPages.clear();
        const cards = a4Grid.querySelectorAll('.page-card');
        cards.forEach(card => card.classList.remove('selected'));
        updateActionState();
    }

    function updateActionState() {
        const count = selectedPages.size;
        if (count === 0) {
            splitBtn.disabled = true;
            splitBtn.innerHTML = '<i class="fa-solid fa-scissors"></i> Extract Pages';
        } else {
            splitBtn.disabled = false;
            splitBtn.innerHTML = `<i class="fa-solid fa-scissors"></i> Extract ${count} Page${count > 1 ? 's' : ''}`;
        }
    }

    window.resetTool = function() {
        window.location.reload(); 
    };

    // ==========================================
    // 5. CLIENT-SIDE EXTRACT LOGIC (pdf-lib)
    // ==========================================
    async function executeSplit() {
        if (selectedPages.size === 0 || !currentPdfBytes) return;

        try {
            splitBtn.disabled = true;
            splitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Cleaving Document...';

            const { PDFDocument } = window.PDFLib;
            
            // Load original doc
            const originalPdf = await PDFDocument.load(currentPdfBytes);
            // Create a new blank doc
            const newPdf = await PDFDocument.create();

            // Convert set to array, sort numerically, then convert to 0-based indices for pdf-lib
            const pageIndices = Array.from(selectedPages)
                                     .sort((a, b) => a - b)
                                     .map(pageNum => pageNum - 1);

            // Copy selected pages
            const copiedPages = await newPdf.copyPages(originalPdf, pageIndices);
            copiedPages.forEach(page => newPdf.addPage(page));

            // Save the new PDF
            const pdfBytes = await newPdf.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            
            // Name formatting: originalName_Extracted.pdf
            const baseName = currentFileName.replace(/\.[^/.]+$/, "");
            const finalFileName = `${baseName}_Extracted.pdf`;
            
            // Transition to Success UI
            setTimeout(() => {
                dropzone.style.display = 'none';
                
                actionContainer.innerHTML = `
                    <div class="success-message">
                        <i class="fa-solid fa-circle-check"></i> Extraction Complete!
                    </div>
                    <div class="file-flow">
                        <span class="file-flow-name">${currentFileName}</span>
                        <i class="fa-solid fa-scissors" style="color: var(--cyber-cyan); margin: 0 10px; font-size: 0.8rem;"></i>
                        <span class="file-flow-name">${selectedPages.size} pages extracted</span>
                        <i class="fa-solid fa-arrow-right" style="color: var(--cyber-cyan); margin: 0 10px; font-size: 0.8rem;"></i>
                        <span class="file-flow-final">${finalFileName}</span>
                    </div>
                    <div class="button-group">
                        <a href="${url}" download="${finalFileName}" class="btn-action">
                            <i class="fa-solid fa-download"></i> Download PDF
                        </a>
                        <button class="btn-secondary" onclick="resetTool()">
                            <i class="fa-solid fa-rotate-right"></i> Split Another
                        </button>
                        <a href="/" class="btn-secondary">
                            <i class="fa-solid fa-toolbox"></i> Other Tools
                        </a>
                    </div>
                `;
            }, 600);

        } catch (error) {
            console.error('Extraction Error:', error);
            alert('A critical error occurred while extracting the pages.');
            updateActionState(); // Reset button to normal state
        }
    }

}); // End of DOMContentLoaded
