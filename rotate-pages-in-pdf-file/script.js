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
        .dropzone.has-files { display: none !important; } /* Hide completely when file is loaded */

        /* Main Workspace Container */
        .workspace-container { display: none; flex-direction: column; width: 100%; margin-bottom: 3rem; animation: fadeIn 0.4s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        /* Toolbar */
        .toolbar { width: 100%; display: flex; justify-content: space-between; align-items: center; margin-bottom: 2.5rem; flex-wrap: wrap; gap: 1rem; background: rgba(255, 255, 255, 0.02); padding: 1rem 1.5rem; border: 1px solid var(--border-subtle); border-radius: 8px; }
        .toolbar-group { display: flex; gap: 1rem; align-items: center; flex-wrap: wrap; }
        .file-info { color: var(--text-main); font-family: 'JetBrains Mono', monospace; font-size: 0.9rem; font-weight: 600; display: flex; align-items: center; gap: 8px; }

        /* Document Grid */
        .doc-grid { display: flex; flex-wrap: wrap; gap: 1.5rem; justify-content: center; width: 100%; }
        
        /* Individual Page Card */
        .page-card { width: 150px; background-color: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 8px; display: flex; flex-direction: column; align-items: center; padding: 12px; transition: all 0.2s ease; box-shadow: 0 4px 10px rgba(0,0,0,0.2); user-select: none; }
        .page-card:hover { border-color: rgba(255, 255, 255, 0.15); transform: translateY(-2px); box-shadow: 0 6px 15px rgba(0,0,0,0.4); }

        /* Card Controls */
        .rotate-controls { display: flex; justify-content: space-between; width: 100%; margin-bottom: 12px; padding: 0 10px; }
        .rotate-controls button { background: none; border: none; color: var(--text-muted); font-size: 1.1rem; cursor: pointer; transition: color 0.2s, transform 0.2s; outline: none; }
        .rotate-controls button:hover { color: var(--theme-color); transform: scale(1.15); }

        /* Thumbnail Wrapper */
        .thumbnail-wrapper { width: 100%; height: 160px; display: flex; align-items: center; justify-content: center; background-color: #fff; border-radius: 4px; overflow: hidden; position: relative; box-shadow: inset 0 0 5px rgba(0,0,0,0.1); }
        .thumbnail-canvas { max-width: 100%; max-height: 100%; object-fit: contain; transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        
        .page-label { margin-top: 12px; font-size: 0.85rem; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }

        /* Secondary Toolbar Buttons */
        .btn-secondary { background-color: transparent; color: var(--text-main); border: 1px solid var(--border-subtle); padding: 0.75rem 1.25rem; font-size: 0.9rem; font-weight: 600; font-family: 'Space Grotesk', sans-serif; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; display: inline-flex; align-items: center; gap: 8px; }
        .btn-secondary:hover { border-color: var(--theme-color); color: var(--theme-color); background-color: rgba(255, 255, 255, 0.03); }

        /* Eye-Friendly Balanced Solid Green Action Button (As Requested) */
        .btn-action { 
            background-color: #2ee310; /* Comfortable dialed-back neon green */
            color: #0b1121; /* Deep dark navy text for zero glare contrast */
            border: none; 
            padding: 0.85rem 2.5rem; 
            font-size: 1.05rem; 
            font-weight: 700; 
            font-family: 'Space Grotesk', sans-serif; 
            border-radius: 8px; 
            cursor: pointer; 
            transition: all 0.3s ease; 
            box-shadow: 0 4px 15px rgba(46, 227, 16, 0.2); 
            text-decoration: none; 
            display: inline-flex; 
            align-items: center; 
            gap: 8px; 
        }
        .btn-action:hover { background-color: #34fa14; transform: translateY(-2px); box-shadow: 0 6px 20px rgba(46, 227, 16, 0.35); }
        .btn-action:disabled { background-color: #222; color: #666; cursor: not-allowed; transform: none; box-shadow: none; }

        /* Success Message UI */
        .success-message { width: 100%; text-align: center; margin-bottom: 2rem; }
        .success-icon { color: var(--theme-color); font-size: 3rem; margin-bottom: 1rem; }
        .success-title { font-size: 1.8rem; color: #fff; font-weight: 700; margin-bottom: 0.5rem; font-family: 'Space Grotesk', sans-serif; }
        .file-flow { color: var(--text-muted); font-size: 0.9rem; display: flex; align-items: center; justify-content: center; gap: 12px; flex-wrap: wrap; background: rgba(255, 255, 255, 0.02); padding: 12px 24px; border-radius: 8px; border: 1px solid var(--border-subtle); }
    `;
    document.head.appendChild(style);
})();


// ==========================================
// 2. STATE MANAGEMENT & DOM SETUP
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    let activePdfFile = null;
    let rawPdfBytes = null;
    let pageRotations = []; // Array storing current rotation state for each page (e.g., 0, 90, 180, 270)

    const dropzone = document.getElementById('pdf-dropzone');
    const fileInput = document.getElementById('file-input');
    const selectFilesBtn = document.getElementById('select-files-btn');
    const mainContainer = dropzone.parentNode;

    // Create dynamic workspace container (Toolbar + Grid)
    const workspaceContainer = document.createElement('div');
    workspaceContainer.className = 'workspace-container';
    
    // Inject Toolbar
    const toolbar = document.createElement('div');
    toolbar.className = 'toolbar';
    toolbar.innerHTML = `
        <div class="toolbar-group">
            <span class="file-info" id="active-filename"><i class="fa-solid fa-file-pdf" style="color: var(--theme-color);"></i> document.pdf</span>
        </div>
        <div class="toolbar-group">
            <button class="btn-secondary" id="btn-rotate-all-left" title="Rotate all pages left">
                <i class="fa-solid fa-rotate-left"></i> Rotate all left
            </button>
            <button class="btn-secondary" id="btn-rotate-all-right" title="Rotate all pages right">
                <i class="fa-solid fa-rotate-right"></i> Rotate all right
            </button>
            <button class="btn-action" id="btn-apply-changes">
                Apply changes
            </button>
        </div>
    `;
    
    // Inject Grid
    const docGrid = document.createElement('div');
    docGrid.className = 'doc-grid';
    docGrid.id = 'document-grid';

    workspaceContainer.appendChild(toolbar);
    workspaceContainer.appendChild(docGrid);
    
    // Insert workspace right after dropzone
    mainContainer.insertBefore(workspaceContainer, dropzone.nextSibling);

    // ==========================================
    // 3. BULLETPROOF EVENT LISTENERS
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

    dropzone.addEventListener('dragover', (e) => { 
        e.preventDefault(); dropzone.classList.add('dragover'); 
    });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
    dropzone.addEventListener('drop', (e) => {
        e.preventDefault(); dropzone.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]);
    });
    window.addEventListener('paste', (e) => {
        if (e.clipboardData && e.clipboardData.files.length > 0) handleFile(e.clipboardData.files[0]);
    });

    // Global Rotate Listeners
    toolbar.querySelector('#btn-rotate-all-left').addEventListener('click', () => rotateAll(-90));
    toolbar.querySelector('#btn-rotate-all-right').addEventListener('click', () => rotateAll(90));
    toolbar.querySelector('#btn-apply-changes').addEventListener('click', executeFinalRotation);

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
        
        // Hide dropzone, show workspace
        dropzone.classList.add('has-files');
        workspaceContainer.style.display = 'flex';
        docGrid.innerHTML = '<div style="color: var(--text-muted); width: 100%; text-align: center; padding: 3rem 0;"><i class="fa-solid fa-circle-notch fa-spin"></i> Rendering pages...</div>';

        try {
            rawPdfBytes = await activePdfFile.arrayBuffer();
            await renderGrid(rawPdfBytes);
        } catch (error) {
            console.error("Error reading file:", error);
            alert("Could not load the PDF. It may be corrupted.");
        }
    }

    async function renderGrid(buffer) {
        if (!window.pdfjsLib) {
            setTimeout(() => renderGrid(buffer), 200); // Wait for dependency to load
            return;
        }

        // Initialize PDF.js worker securely
        const pdfjsLib = window['pdfjs-dist/build/pdf'];
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

        const loadingTask = pdfjsLib.getDocument({ data: buffer });
        const pdf = await loadingTask.promise;
        const totalPages = pdf.numPages;
        
        // Reset state
        pageRotations = new Array(totalPages).fill(0);
        docGrid.innerHTML = '';

        // Render each page
        for (let i = 1; i <= totalPages; i++) {
            const page = await pdf.getPage(i);
            
            // Render at a lower scale for thumbnails to save memory/speed
            const viewport = page.getViewport({ scale: 0.8 }); 
            
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            canvas.className = 'thumbnail-canvas';
            canvas.id = `canvas-page-${i-1}`;
            
            await page.render({ canvasContext: ctx, viewport: viewport }).promise;

            // Build Card Structure matching screenshot
            const card = document.createElement('div');
            card.className = 'page-card';
            card.innerHTML = `
                <div class="rotate-controls">
                    <button type="button" title="Rotate Left" onclick="window.rotateSinglePage(${i-1}, -90)">
                        <i class="fa-solid fa-rotate-left"></i>
                    </button>
                    <button type="button" title="Rotate Right" onclick="window.rotateSinglePage(${i-1}, 90)">
                        <i class="fa-solid fa-rotate-right"></i>
                    </button>
                </div>
                <div class="thumbnail-wrapper"></div>
                <div class="page-label">(${i})</div>
            `;
            
            card.querySelector('.thumbnail-wrapper').appendChild(canvas);
            docGrid.appendChild(card);
        }
    }

    // ==========================================
    // 5. ROTATION LOGIC (Visual UI)
    // ==========================================
    
    // Expose to global scope for inline onclick handlers
    window.rotateSinglePage = function(index, degrees) {
        pageRotations[index] = (pageRotations[index] + degrees) % 360;
        updateVisualCanvas(index);
    };

    function rotateAll(degrees) {
        for (let i = 0; i < pageRotations.length; i++) {
            pageRotations[i] = (pageRotations[i] + degrees) % 360;
            updateVisualCanvas(i);
        }
    }

    function updateVisualCanvas(index) {
        const canvas = document.getElementById(`canvas-page-${index}`);
        if (canvas) {
            canvas.style.transform = `rotate(${pageRotations[index]}deg)`;
        }
    }

    // ==========================================
    // 6. CLIENT-SIDE PROCESSING (pdf-lib)
    // ==========================================
    async function executeFinalRotation() {
        if (!window.PDFLib) {
            alert('Engine is still loading. Please wait a moment.'); return;
        }

        const actionBtn = document.getElementById('btn-apply-changes');
        actionBtn.disabled = true;
        actionBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Processing...';

        try {
            const { PDFDocument, degrees } = window.PDFLib;
            
            // 1. Load Original Document
            const pdfDoc = await PDFDocument.load(rawPdfBytes);
            const pages = pdfDoc.getPages();

            // 2. Apply Rotations
            pages.forEach((page, index) => {
                // PDF-lib keeps track of existing rotation. Add our new relative rotation to it.
                const currentRotationAngle = page.getRotation().angle;
                const addedRotation = pageRotations[index];
                
                // Only modify if there is an actual change needed
                if (addedRotation !== 0) {
                    page.setRotation(degrees(currentRotationAngle + addedRotation));
                }
            });

            // 3. Save modified PDF locally
            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            
            // 4. Generate Output UI
            const baseName = activePdfFile.name.replace(/\.[^/.]+$/, "");
            const finalFileName = `PDFase_${baseName}_Rotated.pdf`;

            setTimeout(() => {
                workspaceContainer.innerHTML = `
                    <div class="success-message">
                        <div class="success-icon"><i class="fa-solid fa-circle-check"></i></div>
                        <div class="success-title">Rotation Complete!</div>
                        <div style="color: var(--text-muted); margin-bottom: 1.5rem;">Your document has been successfully processed locally.</div>
                        
                        <div class="file-flow" style="margin: 0 auto 2rem auto; width: max-content;">
                            <span style="font-family: 'JetBrains Mono', monospace; color: #fff;">${finalFileName}</span>
                        </div>

                        <div class="toolbar-group" style="justify-content: center; width: 100%;">
                            <a href="${url}" download="${finalFileName}" class="btn-action">
                                <i class="fa-solid fa-download"></i> Download PDF
                            </a>
                            <button class="btn-secondary" onclick="window.location.reload()">
                                <i class="fa-solid fa-rotate-right"></i> Rotate Another
                            </button>
                            <a href="/" class="btn-secondary">
                                <i class="fa-solid fa-toolbox"></i> Other Tools
                            </a>
                        </div>
                    </div>
                `;
            }, 500);

        } catch (error) {
            console.error('Processing Error:', error);
            alert('A critical error occurred. Make sure your PDF is not encrypted with a password.');
            actionBtn.disabled = false;
            actionBtn.innerHTML = 'Apply changes';
        }
    }

}); // End DOMContentLoaded
