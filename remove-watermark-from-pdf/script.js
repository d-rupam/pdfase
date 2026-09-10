// ==========================================
// 1. INJECT DEPENDENCIES & STYLES
// ==========================================
(function initEnvironment() {
    // Inject pdf-lib for reading, modifying, and saving the PDF
    if (!window.PDFLib) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js';
        document.head.appendChild(script);
    }

    // Inject pdf.js for rendering the visual page thumbnails
    if (!window.pdfjsLib) {
        const pdfScript = document.createElement('script');
        pdfScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        document.head.appendChild(pdfScript);
    }

    const style = document.createElement('style');
    style.innerHTML = `
        /* Dynamic Dropzone Shrinking */
        .dropzone { transition: padding 0.3s ease, min-height 0.3s ease; -webkit-tap-highlight-color: transparent; cursor: pointer; }
        .dropzone.has-files { display: none !important; }

        /* Main Workspace Container */
        .workspace-container { display: none; flex-direction: column; width: 100%; margin-bottom: 3rem; animation: fadeIn 0.4s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        /* Top Toolbar (File Info & Global Controls) */
        .top-toolbar { width: 100%; display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; padding: 1rem 1.5rem; background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 8px; }
        .file-info { color: var(--text-main); font-family: 'JetBrains Mono', monospace; font-size: 0.9rem; font-weight: 600; display: flex; align-items: center; gap: 8px; }

        /* Removal Config Panel */
        .removal-panel { background: rgba(57, 255, 20, 0.02); border: 1px solid rgba(57, 255, 20, 0.15); padding: 2rem; border-radius: 12px; margin-bottom: 2rem; display: flex; flex-direction: column; gap: 1rem; align-items: center; text-align: center; }
        .removal-panel h3 { color: #fff; font-size: 1.2rem; margin-bottom: 0.5rem; }
        .input-group { display: flex; flex-direction: column; gap: 8px; width: 100%; max-width: 500px; text-align: left; }
        .input-group label { color: var(--text-muted); font-size: 0.85rem; font-weight: 600; font-family: 'Space Grotesk', sans-serif; }
        .input-group input[type="text"] { background: var(--bg-base); color: #fff; border: 1px solid var(--border-subtle); padding: 1rem; border-radius: 8px; font-family: 'JetBrains Mono', monospace; font-size: 1rem; outline: none; transition: border-color 0.2s; width: 100%; box-shadow: inset 0 2px 4px rgba(0,0,0,0.2); }
        .input-group input[type="text"]:focus { border-color: var(--theme-color); }
        .engine-note { font-size: 0.8rem; color: var(--text-muted); margin-top: 5px; }

        /* Document Grid */
        .doc-grid { display: flex; flex-wrap: wrap; gap: 1.5rem; justify-content: center; width: 100%; padding: 2rem; background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 12px; max-height: 500px; overflow-y: auto; }
        .doc-grid::-webkit-scrollbar { width: 8px; }
        .doc-grid::-webkit-scrollbar-thumb { background: rgba(57, 255, 20, 0.3); border-radius: 4px; }
        
        /* Individual Page Card */
        .page-card { width: 140px; background-color: var(--bg-base); border: 1px solid var(--border-subtle); border-radius: 8px; display: flex; flex-direction: column; align-items: center; padding: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.2); user-select: none; }
        .thumbnail-wrapper { width: 100%; height: 160px; display: flex; align-items: center; justify-content: center; background-color: #fff; border-radius: 4px; overflow: hidden; box-shadow: inset 0 0 5px rgba(0,0,0,0.1); }
        .thumbnail-canvas { max-width: 100%; max-height: 100%; object-fit: contain; }
        .page-label { margin-top: 10px; font-size: 0.85rem; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }

        /* Bottom Action Box */
        .bottom-action-box { width: 100%; display: flex; justify-content: center; margin-top: 2rem; padding-top: 1rem; }

        /* Buttons */
        .btn-secondary { background-color: transparent; color: var(--text-main); border: 1px solid var(--border-subtle); padding: 0.65rem 1.1rem; font-size: 0.85rem; font-weight: 600; font-family: 'Space Grotesk', sans-serif; border-radius: 6px; cursor: pointer; transition: all 0.3s ease; display: inline-flex; align-items: center; gap: 8px; }
        .btn-secondary:hover { border-color: var(--theme-color); color: var(--theme-color); background-color: rgba(57, 255, 20, 0.05); }

        .btn-action { 
            background-color: #2ee310; /* Solid Green */
            color: #0b1121; /* Dark text */
            border: none; 
            padding: 1rem 3rem; 
            font-size: 1.1rem; 
            font-weight: 700; 
            font-family: 'Space Grotesk', sans-serif; 
            border-radius: 8px; 
            cursor: pointer; 
            transition: all 0.3s ease; 
            box-shadow: 0 4px 15px rgba(46, 227, 16, 0.2); 
            text-decoration: none; 
            display: inline-flex; 
            align-items: center; 
            gap: 10px; 
        }
        .btn-action:hover { background-color: #34fa14; transform: translateY(-2px); box-shadow: 0 6px 20px rgba(46, 227, 16, 0.35); }
        .btn-action:disabled { background-color: #222; color: #666; cursor: not-allowed; transform: none; box-shadow: none; }

        /* Success UI */
        .success-message { width: 100%; text-align: center; margin-bottom: 2rem; }
        .success-icon { color: var(--theme-color); font-size: 3rem; margin-bottom: 1rem; }
        .success-title { font-size: 1.8rem; color: #fff; font-weight: 700; margin-bottom: 0.5rem; font-family: 'Space Grotesk', sans-serif; }
    `;
    document.head.appendChild(style);
})();

// ==========================================
// 2. STATE MANAGEMENT & DOM SETUP
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    let activePdfFile = null;
    let rawPdfBytes = null; // Deep cloned buffer for PDF-lib saving

    const dropzone = document.getElementById('pdf-dropzone');
    const fileInput = document.getElementById('file-input');
    const selectFilesBtn = document.getElementById('select-files-btn');
    const mainContainer = dropzone.parentNode;

    // Create dynamic workspace container
    const workspaceContainer = document.createElement('div');
    workspaceContainer.className = 'workspace-container';
    
    // Build Workspace UI
    workspaceContainer.innerHTML = `
        <div class="top-toolbar">
            <div class="file-info" id="active-filename"><i class="fa-solid fa-file-pdf" style="color: var(--theme-color);"></i> document.pdf</div>
            <button class="btn-secondary" onclick="window.location.reload()">
                <i class="fa-solid fa-xmark"></i> Cancel
            </button>
        </div>

        <div class="removal-panel">
            <h3><i class="fa-solid fa-eraser" style="color: var(--theme-color);"></i> Watermark Settings</h3>
            <div class="input-group">
                <label for="wm-text-input">Exact text to remove</label>
                <input type="text" id="wm-text-input" placeholder="e.g., CONFIDENTIAL, DRAFT, DO NOT COPY..." autocomplete="off">
                <div class="engine-note"><i class="fa-solid fa-circle-info"></i> The engine will strip exact string matches from the internal text layers.</div>
            </div>
        </div>

        <div class="doc-grid" id="document-grid">
            <!-- Thumbnails injected here -->
        </div>

        <div class="bottom-action-box">
            <button class="btn-action" id="btn-execute-removal">
                <i class="fa-solid fa-wand-magic-sparkles"></i> Remove Watermark & Download
            </button>
        </div>
    `;
    
    mainContainer.insertBefore(workspaceContainer, dropzone.nextSibling);

    // ==========================================
    // 3. EVENT LISTENERS
    // ==========================================
    if (selectFilesBtn) {
        selectFilesBtn.addEventListener('click', (e) => {
            e.preventDefault(); e.stopPropagation(); fileInput.click();
        });
    }

    dropzone.addEventListener('click', (e) => {
        if (!activePdfFile && e.target !== fileInput) fileInput.click();
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
        e.preventDefault(); dropzone.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]);
    });
    window.addEventListener('paste', (e) => {
        if (e.clipboardData && e.clipboardData.files.length > 0) handleFile(e.clipboardData.files[0]);
    });

    document.getElementById('btn-execute-removal').addEventListener('click', executeFinalRemoval);

    // ==========================================
    // 4. FILE HANDLING & THUMBNAIL RENDERING
    // ==========================================
    async function handleFile(file) {
        if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
            alert('Invalid format. Please select a PDF document.');
            return;
        }
        
        activePdfFile = file;
        document.getElementById('active-filename').innerHTML = `<i class="fa-solid fa-file-pdf" style="color: var(--theme-color);"></i> ${file.name}`;
        
        dropzone.classList.add('has-files');
        workspaceContainer.style.display = 'flex';
        const docGrid = document.getElementById('document-grid');
        docGrid.innerHTML = '<div style="color: var(--text-muted); width: 100%; text-align: center; padding: 3rem 0;"><i class="fa-solid fa-circle-notch fa-spin"></i> Loading Document...</div>';

        try {
            const rawBuffer = await activePdfFile.arrayBuffer();
            
            // Deep clone the buffer for safety
            rawPdfBytes = rawBuffer.slice(0);
            const typedarray = new Uint8Array(rawBuffer);

            await renderGrid(typedarray);
        } catch (error) {
            console.error("Error reading file:", error);
            alert("Could not load the PDF. It may be corrupted.");
        }
    }

    async function renderGrid(typedarray) {
        if (!window.pdfjsLib) {
            setTimeout(() => renderGrid(typedarray), 200); 
            return;
        }

        const pdfjsLib = window['pdfjs-dist/build/pdf'];
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

        const loadingTask = pdfjsLib.getDocument({ data: typedarray });
        const pdf = await loadingTask.promise;
        const totalPages = pdf.numPages;
        
        const docGrid = document.getElementById('document-grid');
        docGrid.innerHTML = '';

        // Render first 10 pages maximum for performance to keep it snappy
        const pagesToRender = Math.min(totalPages, 10);

        for (let i = 1; i <= pagesToRender; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 0.5 }); 
            
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            canvas.className = 'thumbnail-canvas';
            
            await page.render({ canvasContext: ctx, viewport: viewport }).promise;

            const card = document.createElement('div');
            card.className = 'page-card';
            card.innerHTML = `
                <div class="thumbnail-wrapper"></div>
                <div class="page-label">Page ${i}</div>
            `;
            
            card.querySelector('.thumbnail-wrapper').appendChild(canvas);
            docGrid.appendChild(card);
        }
        
        if(totalPages > 10) {
            const moreIndicator = document.createElement('div');
            moreIndicator.style.width = '100%';
            moreIndicator.style.textAlign = 'center';
            moreIndicator.style.color = 'var(--text-muted)';
            moreIndicator.style.fontSize = '0.9rem';
            moreIndicator.style.padding = '1rem 0';
            moreIndicator.innerHTML = `+ ${totalPages - 10} more pages (Engine processes all pages)`;
            docGrid.appendChild(moreIndicator);
        }
    }

    // ==========================================
    // 5. CLIENT-SIDE REMOVAL PROCESSING
    // ==========================================
    async function executeFinalRemoval() {
        const targetText = document.getElementById('wm-text-input').value.trim();
        
        if (!targetText) {
            alert('Please enter the text of the watermark you want to remove.');
            document.getElementById('wm-text-input').focus();
            return;
        }

        if (!window.PDFLib) {
            alert('Engine is still loading. Please wait a moment.'); return;
        }

        const actionBtn = document.getElementById('btn-execute-removal');
        actionBtn.disabled = true;
        actionBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Scanning & Cleaning...';

        try {
            const { PDFDocument } = window.PDFLib;
            const pdfDoc = await PDFDocument.load(rawPdfBytes, { ignoreEncryption: true });
            
            // Heuristic Text Removal Engine
            // This loops through internal PDF string objects and attempts to wipe exact matches
            let matchCount = 0;
            const context = pdfDoc.context;
            const objects = context.enumerateIndirectObjects();
            
            objects.forEach(([ref, obj]) => {
                // Look for standard String or HexString objects which hold text data
                if (obj.constructor.name === 'PDFString' || obj.constructor.name === 'PDFHexString') {
                    try {
                        const decodedStr = obj.decodeText();
                        // If exact match found, we replace it with a blank space
                        if (decodedStr.includes(targetText)) {
                            matchCount++;
                            // Using standard PDFString creation to replace the value
                            const newStr = decodedStr.replace(new RegExp(targetText, 'gi'), '');
                            context.assign(ref, window.PDFLib.PDFString.of(newStr));
                        }
                    } catch(e) {
                        // Ignore decode errors for raw byte streams
                    }
                }
            });

            // Save modified document
            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            
            const baseName = activePdfFile.name.replace(/\.[^/.]+$/, "");
            const finalFileName = `PDFase_${baseName}_Cleaned.pdf`;

            setTimeout(() => {
                workspaceContainer.innerHTML = `
                    <div class="success-message">
                        <div class="success-icon"><i class="fa-solid fa-circle-check"></i></div>
                        <div class="success-title">Cleanup Complete!</div>
                        <div style="color: var(--text-muted); margin-bottom: 2rem;">
                            Engine scanned the file and removed <strong>${matchCount}</strong> matching text layers securely.
                        </div>
                        
                        <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                            <a href="${url}" download="${finalFileName}" class="btn-action">
                                <i class="fa-solid fa-download"></i> Download Cleaned PDF
                            </a>
                            <button class="btn-secondary" onclick="window.location.reload()">
                                <i class="fa-solid fa-rotate-right"></i> Clean Another
                            </button>
                        </div>
                    </div>
                `;
            }, 800);

        } catch (error) {
            console.error('Processing Error:', error);
            alert('A critical error occurred. Make sure your PDF is not encrypted.');
            actionBtn.disabled = false;
            actionBtn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Remove Watermark & Download';
        }
    }

}); // End DOMContentLoaded
