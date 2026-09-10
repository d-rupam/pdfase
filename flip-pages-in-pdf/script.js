// ==========================================
// 1. INJECT DEPENDENCIES & STYLES
// ==========================================
(function initEnvironment() {
    // Inject pdf-lib for editing the PDF layout matrix
    if (!window.PDFLib) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js';
        document.head.appendChild(script);
    }

    // Inject pdf.js for rendering visual previews
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
        .toolbar-group { display: flex; gap: 1rem; align-items: center; flex-wrap: wrap; }
        .file-info { color: var(--text-main); font-family: 'JetBrains Mono', monospace; font-size: 0.9rem; font-weight: 600; display: flex; align-items: center; gap: 8px; }

        /* Document Grid */
        .doc-grid { display: flex; flex-wrap: wrap; gap: 1.5rem; justify-content: center; width: 100%; padding: 2rem; background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 12px; }
        
        /* Individual Page Card */
        .page-card { width: 150px; background-color: var(--bg-base); border: 1px solid var(--border-subtle); border-radius: 8px; display: flex; flex-direction: column; align-items: center; padding: 12px; transition: all 0.2s ease; box-shadow: 0 4px 10px rgba(0,0,0,0.2); user-select: none; }
        .page-card:hover { border-color: rgba(57, 255, 20, 0.3); transform: translateY(-2px); box-shadow: 0 6px 15px rgba(57, 255, 20, 0.1); }

        /* Card Controls */
        .flip-controls { display: flex; justify-content: space-between; width: 100%; margin-bottom: 12px; padding: 0 10px; }
        .flip-controls button { background: none; border: none; color: var(--text-muted); font-size: 1.1rem; cursor: pointer; transition: color 0.2s, transform 0.2s; outline: none; }
        .flip-controls button:hover { color: var(--theme-color); transform: scale(1.15); }
        .flip-controls button.active { color: var(--theme-color); }

        /* Thumbnail Wrapper */
        .thumbnail-wrapper { width: 100%; height: 160px; display: flex; align-items: center; justify-content: center; background-color: #fff; border-radius: 4px; overflow: hidden; position: relative; box-shadow: inset 0 0 5px rgba(0,0,0,0.1); }
        .thumbnail-canvas { max-width: 100%; max-height: 100%; object-fit: contain; transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        
        .page-label { margin-top: 12px; font-size: 0.85rem; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }

        /* Bottom Action Box */
        .bottom-action-box { width: 100%; display: flex; justify-content: center; margin-top: 2rem; padding-top: 1rem; }

        /* Buttons */
        .btn-secondary { background-color: transparent; color: var(--text-main); border: 1px solid var(--border-subtle); padding: 0.65rem 1.1rem; font-size: 0.85rem; font-weight: 600; font-family: 'Space Grotesk', sans-serif; border-radius: 6px; cursor: pointer; transition: all 0.3s ease; display: inline-flex; align-items: center; gap: 8px; }
        .btn-secondary:hover { border-color: var(--theme-color); color: var(--theme-color); background-color: rgba(57, 255, 20, 0.05); }

        .btn-action { 
            background-color: #2ee310; 
            color: #0b1121; 
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
        .file-flow { color: var(--text-muted); font-size: 0.9rem; display: flex; align-items: center; justify-content: center; gap: 12px; flex-wrap: wrap; background: rgba(57, 255, 20, 0.03); padding: 12px 24px; border-radius: 8px; border: 1px solid rgba(57, 255, 20, 0.15); margin: 0 auto 2rem auto; width: max-content; }
    `;
    document.head.appendChild(style);
})();

// ==========================================
// 2. STATE MANAGEMENT & DOM SETUP
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    let activePdfFile = null;
    let rawPdfBytes = null;
    let pageStates = []; // Stores { flipH: boolean, flipV: boolean } for each page

    const dropzone = document.getElementById('pdf-dropzone');
    const fileInput = document.getElementById('file-input');
    const selectFilesBtn = document.getElementById('select-files-btn');
    const mainContainer = dropzone.parentNode;

    // Create dynamic workspace container
    const workspaceContainer = document.createElement('div');
    workspaceContainer.className = 'workspace-container';
    
    // Top Toolbar (Info & Global Flips)
    const topToolbar = document.createElement('div');
    topToolbar.className = 'top-toolbar';
    topToolbar.innerHTML = `
        <div class="toolbar-group">
            <span class="file-info" id="active-filename"><i class="fa-solid fa-file-pdf" style="color: var(--theme-color);"></i> document.pdf</span>
        </div>
        <div class="toolbar-group">
            <button class="btn-secondary" id="btn-flip-all-h" title="Mirror all pages horizontally">
                <i class="fa-solid fa-arrows-left-right"></i> Flip All Horizontal
            </button>
            <button class="btn-secondary" id="btn-flip-all-v" title="Mirror all pages vertically">
                <i class="fa-solid fa-arrows-up-down"></i> Flip All Vertical
            </button>
        </div>
    `;
    
    // Grid Container
    const docGrid = document.createElement('div');
    docGrid.className = 'doc-grid';
    docGrid.id = 'document-grid';

    // Bottom Action Box
    const bottomActionBox = document.createElement('div');
    bottomActionBox.className = 'bottom-action-box';
    bottomActionBox.innerHTML = `
        <button class="btn-action" id="btn-apply-flip">
            <i class="fa-solid fa-object-group"></i> Apply Flip & Download
        </button>
    `;

    // Append in correct order
    workspaceContainer.appendChild(topToolbar);
    workspaceContainer.appendChild(docGrid);
    workspaceContainer.appendChild(bottomActionBox);
    
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

    // Global Flip Bindings
    topToolbar.querySelector('#btn-flip-all-h').addEventListener('click', () => flipAll('h'));
    topToolbar.querySelector('#btn-flip-all-v').addEventListener('click', () => flipAll('v'));
    bottomActionBox.querySelector('#btn-apply-flip').addEventListener('click', executeFinalFlip);

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
        docGrid.innerHTML = '<div style="color: var(--text-muted); width: 100%; text-align: center; padding: 3rem 0;"><i class="fa-solid fa-circle-notch fa-spin"></i> Rendering pages...</div>';

        try {
            const rawBuffer = await activePdfFile.arrayBuffer();
            rawPdfBytes = rawBuffer.slice(0); // Deep clone for pdf-lib to consume safely
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
        
        // Initialize state arrays
        pageStates = Array.from({ length: totalPages }, () => ({ flipH: false, flipV: false }));
        docGrid.innerHTML = '';

        for (let i = 1; i <= totalPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 0.6 }); 
            
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            canvas.className = 'thumbnail-canvas';
            canvas.id = `canvas-page-${i-1}`;
            
            await page.render({ canvasContext: ctx, viewport: viewport }).promise;

            const card = document.createElement('div');
            card.className = 'page-card';
            card.innerHTML = `
                <div class="flip-controls">
                    <button type="button" title="Flip Horizontally" onclick="window.toggleFlip(${i-1}, 'h')" id="btn-h-${i-1}">
                        <i class="fa-solid fa-arrows-left-right"></i>
                    </button>
                    <button type="button" title="Flip Vertically" onclick="window.toggleFlip(${i-1}, 'v')" id="btn-v-${i-1}">
                        <i class="fa-solid fa-arrows-up-down"></i>
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
    // 5. FLIP LOGIC (Visual UI)
    // ==========================================
    window.toggleFlip = function(index, axis) {
        if (axis === 'h') pageStates[index].flipH = !pageStates[index].flipH;
        if (axis === 'v') pageStates[index].flipV = !pageStates[index].flipV;
        updateVisualCanvas(index);
    };

    function flipAll(axis) {
        for (let i = 0; i < pageStates.length; i++) {
            if (axis === 'h') pageStates[i].flipH = !pageStates[i].flipH;
            if (axis === 'v') pageStates[i].flipV = !pageStates[i].flipV;
            updateVisualCanvas(i);
        }
    }

    function updateVisualCanvas(index) {
        const canvas = document.getElementById(`canvas-page-${index}`);
        const btnH = document.getElementById(`btn-h-${index}`);
        const btnV = document.getElementById(`btn-v-${index}`);
        
        if (canvas) {
            const scaleX = pageStates[index].flipH ? -1 : 1;
            const scaleY = pageStates[index].flipV ? -1 : 1;
            canvas.style.transform = `scale(${scaleX}, ${scaleY})`;
            
            // Toggle active styling on buttons
            if(pageStates[index].flipH) btnH.classList.add('active'); else btnH.classList.remove('active');
            if(pageStates[index].flipV) btnV.classList.add('active'); else btnV.classList.remove('active');
        }
    }

    // ==========================================
    // 6. CLIENT-SIDE PROCESSING (pdf-lib)
    // ==========================================
    async function executeFinalFlip() {
        if (!window.PDFLib) {
            alert('Engine is still loading. Please wait a moment.'); return;
        }

        const actionBtn = document.getElementById('btn-apply-flip');
        actionBtn.disabled = true;
        actionBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Processing...';

        try {
            const { PDFDocument } = window.PDFLib;
            
            const originalPdf = await PDFDocument.load(rawPdfBytes, { ignoreEncryption: true });
            const origPages = originalPdf.getPages();
            
            // Create a brand new PDF to avoid complex matrix manipulation on existing corrupted trees
            const newPdf = await PDFDocument.create();

            for (let i = 0; i < origPages.length; i++) {
                const state = pageStates[i];
                const origPage = origPages[i];
                const { width, height } = origPage.getSize();
                
                // Embed the original page as an object
                const embeddedPage = await newPdf.embedPage(origPage);
                
                // Create a blank target page
                const newPage = newPdf.addPage([width, height]);

                // Determine scaling and translation factors based on flip states
                const scaleX = state.flipH ? -1 : 1;
                const scaleY = state.flipV ? -1 : 1;
                
                // If flipping, we must translate the origin to account for the negative scale pulling it off-screen
                const transX = state.flipH ? width : 0;
                const transY = state.flipV ? height : 0;

                newPage.drawImage(embeddedPage, {
                    x: transX,
                    y: transY,
                    width: width * scaleX,
                    height: height * scaleY
                });
            }

            const pdfBytes = await newPdf.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            
            const baseName = activePdfFile.name.replace(/\.[^/.]+$/, "");
            const finalFileName = `PDFase_${baseName}_Flipped.pdf`;

            setTimeout(() => {
                workspaceContainer.innerHTML = `
                    <div class="success-message">
                        <div class="success-icon"><i class="fa-solid fa-circle-check"></i></div>
                        <div class="success-title">Pages Flipped!</div>
                        <div style="color: var(--text-muted); margin-bottom: 1.5rem;">Your document has been successfully processed locally.</div>
                        
                        <div class="file-flow">
                            <span style="font-family: 'JetBrains Mono', monospace; color: #fff;">${finalFileName}</span>
                        </div>

                        <div class="toolbar-group" style="justify-content: center; width: 100%;">
                            <a href="${url}" download="${finalFileName}" class="btn-action">
                                <i class="fa-solid fa-download"></i> Download PDF
                            </a>
                            <button class="btn-secondary" onclick="window.location.reload()">
                                <i class="fa-solid fa-rotate-right"></i> Flip Another
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
            alert('A critical error occurred. Error: ' + error.message);
            actionBtn.disabled = false;
            actionBtn.innerHTML = '<i class="fa-solid fa-object-group"></i> Apply Flip & Download';
        }
    }

}); // End DOMContentLoaded
