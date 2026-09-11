// ==========================================
// 1. INJECT DEPENDENCIES & STYLES (CROP PDF)
// ==========================================
(function initEnvironment() {
    if (!window.PDFLib) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js';
        document.head.appendChild(script);
    }

    if (!window.pdfjsLib) {
        const pdfScript = document.createElement('script');
        pdfScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        document.head.appendChild(pdfScript);
    }

    const style = document.createElement('style');
    style.innerHTML = `
        :root { --theme-color: #39ff14; }

        .dropzone { transition: padding 0.3s ease, min-height 0.3s ease; cursor: pointer; }
        .dropzone.has-files { display: none !important; }

        .workspace-container { display: none; flex-direction: column; width: 100%; margin-bottom: 3rem; animation: fadeIn 0.4s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        .top-toolbar { width: 100%; display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; padding: 1rem 1.5rem; background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 8px; }
        .file-info { color: var(--text-main); font-family: 'JetBrains Mono', monospace; font-size: 0.9rem; font-weight: 600; display: flex; align-items: center; gap: 8px; }

        /* Main Workspace Layout */
        .crop-workspace { display: grid; grid-template-columns: 1fr 300px; gap: 2rem; width: 100%; align-items: start; }
        @media (max-width: 900px) { .crop-workspace { grid-template-columns: 1fr; } }

        /* Viewer Panel */
        .viewer-panel { display: flex; flex-direction: column; gap: 1rem; align-items: center; width: 100%; }
        
        .canvas-wrapper { position: relative; background: #1a1a1a; border: 1px solid var(--border-subtle); border-radius: 6px; box-shadow: 0 4px 20px rgba(0,0,0,0.5); display: inline-block; user-select: none; touch-action: none; overflow: hidden; max-width: 100%; }
        #pdf-render-canvas { display: block; max-width: 100%; height: auto; }

        /* Interactive Crop Overlay */
        #draw-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 10; pointer-events: none; }
        
        /* The Crop Box with 8 Handles */
        .crop-box { position: absolute; border: 2px solid var(--theme-color); background: rgba(57, 255, 20, 0.05); pointer-events: auto; cursor: move; box-shadow: 0 0 0 9999px rgba(0,0,0,0.65); }
        
        /* Resize Handles */
        .crop-handle { position: absolute; width: 12px; height: 12px; background: #fff; border: 2px solid var(--theme-color); border-radius: 50%; z-index: 15; }
        .handle-nw { top: -6px; left: -6px; cursor: nwse-resize; }
        .handle-ne { top: -6px; right: -6px; cursor: nesw-resize; }
        .handle-se { bottom: -6px; right: -6px; cursor: nwse-resize; }
        .handle-sw { bottom: -6px; left: -6px; cursor: nesw-resize; }
        .handle-n  { top: -6px; left: calc(50% - 6px); cursor: ns-resize; }
        .handle-s  { bottom: -6px; left: calc(50% - 6px); cursor: ns-resize; }
        .handle-w  { top: calc(50% - 6px); left: -6px; cursor: ew-resize; }
        .handle-e  { top: calc(50% - 6px); right: -6px; cursor: ew-resize; }

        /* Pagination Controls */
        .pagination-controls { display: flex; gap: 1rem; align-items: center; background: var(--bg-card); padding: 0.5rem 1.5rem; border-radius: 20px; border: 1px solid var(--border-subtle); }
        .page-btn { background: none; border: none; color: var(--theme-color); font-size: 1.2rem; cursor: pointer; transition: transform 0.2s; }
        .page-btn:hover:not(:disabled) { transform: scale(1.2); }
        .page-btn:disabled { color: #444; cursor: not-allowed; }
        .page-info { font-family: 'JetBrains Mono', monospace; font-size: 0.9rem; color: var(--text-main); }

        /* Controls Panel */
        .controls-panel { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 2rem; display: flex; flex-direction: column; gap: 1.5rem; }
        .controls-panel h3 { color: #fff; font-size: 1.1rem; border-bottom: 1px solid var(--border-subtle); padding-bottom: 0.5rem; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 10px; }
        
        .info-text { font-size: 0.85rem; color: var(--text-muted); line-height: 1.6; }
        
        .input-group { display: flex; flex-direction: column; gap: 8px; }
        .input-group label { color: var(--text-muted); font-size: 0.85rem; font-weight: 600; font-family: 'Space Grotesk', sans-serif; }
        .input-group select { background: var(--bg-base); color: #fff; border: 1px solid var(--border-subtle); padding: 0.75rem 1rem; border-radius: 6px; font-family: 'JetBrains Mono', monospace; font-size: 0.95rem; outline: none; transition: border-color 0.2s; width: 100%; cursor: pointer; }
        .input-group select:focus { border-color: var(--theme-color); }

        .panel-btn { background-color: transparent; color: var(--theme-color); border: 1px solid rgba(57, 255, 20, 0.3); padding: 0.75rem 1rem; border-radius: 6px; font-family: 'Space Grotesk', sans-serif; font-weight: 600; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; }
        .panel-btn:hover { background-color: rgba(57, 255, 20, 0.1); border-color: var(--theme-color); }

        .bottom-action-box { width: 100%; display: flex; justify-content: center; margin-top: 2rem; padding-top: 1rem; flex-direction: column; align-items: center; gap: 12px; }
        
        .btn-action { background-color: #32e011; color: #0b1121; border: none; padding: 1rem 3rem; font-size: 1.1rem; font-weight: 700; font-family: 'Space Grotesk', sans-serif; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(46, 227, 16, 0.2); display: inline-flex; align-items: center; gap: 10px; text-decoration: none; }
        .btn-action:hover { background-color: #34fa14; transform: translateY(-2px); box-shadow: 0 6px 20px rgba(46, 227, 16, 0.35); }
        .btn-action:disabled { background-color: #222; color: #666; cursor: not-allowed; transform: none; box-shadow: none; }
        
        .btn-secondary { background-color: transparent; color: var(--text-main); border: 1px solid var(--border-subtle); padding: 0.65rem 1.1rem; font-size: 0.85rem; font-weight: 600; font-family: 'Space Grotesk', sans-serif; border-radius: 6px; cursor: pointer; transition: all 0.3s ease; display: inline-flex; align-items: center; gap: 8px; text-decoration: none; }
        .btn-secondary:hover { border-color: var(--theme-color); color: var(--theme-color); background-color: rgba(57, 255, 20, 0.05); }

        .success-message { width: 100%; text-align: center; margin-bottom: 2rem; }
    `;
    document.head.appendChild(style);
})();

// ==========================================
// STATE MANAGEMENT & INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    
    let activePdfFile = null;
    let rawPdfBytes = null;
    let pdfDocProxy = null;
    let totalPages = 0;
    let currentPage = 1;
    
    // Crop Box state stored as proportions [0 to 1] relative to rendered canvas dimensions
    let cropBox = { x: 0.1, y: 0.1, w: 0.8, h: 0.8 };

    const dropzone = document.getElementById('pdf-dropzone');
    const fileInput = document.getElementById('file-input');
    const selectFilesBtn = document.getElementById('select-files-btn');
    const mainContainer = dropzone.parentNode;

    // Build Workspace UI
    const workspaceContainer = document.createElement('div');
    workspaceContainer.className = 'workspace-container';
    
    workspaceContainer.innerHTML = `
        <div class="top-toolbar">
            <div class="file-info" id="active-filename"><i class="fa-solid fa-file-pdf" style="color: var(--theme-color);"></i> document.pdf</div>
            <button class="btn-secondary" onclick="window.location.reload()"><i class="fa-solid fa-xmark"></i> Cancel</button>
        </div>

        <div class="crop-workspace">
            <div class="viewer-panel">
                <div class="canvas-wrapper" id="canvas-wrapper">
                    <canvas id="pdf-render-canvas"></canvas>
                    <div id="draw-overlay"></div>
                </div>
                
                <div class="pagination-controls">
                    <button class="page-btn" id="btn-prev" disabled><i class="fa-solid fa-circle-chevron-left"></i></button>
                    <span class="page-info">Page <span id="page-num">1</span> of <span id="page-count">1</span></span>
                    <button class="page-btn" id="btn-next" disabled><i class="fa-solid fa-circle-chevron-right"></i></button>
                </div>
            </div>

            <div class="controls-panel">
                <div>
                    <h3><i class="fa-solid fa-crop" style="color: var(--theme-color);"></i> Precision Cropper</h3>
                    <p class="info-text">Drag the border lines or use the 8 handles to isolate the exact page section you want to keep.</p>
                </div>
                
                <div class="input-group">
                    <label>Apply Crop To:</label>
                    <select id="apply-scope">
                        <option value="all">All Pages</option>
                        <option value="current">Current Page Only</option>
                    </select>
                </div>

                <div style="display: flex; flex-direction: column; gap: 10px; margin-top: auto;">
                    <button class="panel-btn" id="btn-reset-box">
                        <i class="fa-solid fa-rotate-left"></i> Reset to Full Page
                    </button>
                </div>
            </div>
        </div>

        <div class="bottom-action-box">
            <button class="btn-action" id="btn-apply-crop">
                <i class="fa-solid fa-scissors"></i> Crop Document & Download
            </button>
        </div>
    `;
    
    mainContainer.insertBefore(workspaceContainer, dropzone.nextSibling);

    const pdfRenderCanvas = document.getElementById('pdf-render-canvas');
    const pdfRenderCtx = pdfRenderCanvas.getContext('2d');
    const drawOverlay = document.getElementById('draw-overlay');
    const canvasWrapper = document.getElementById('canvas-wrapper');

    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    const numSpan = document.getElementById('page-num');
    const countSpan = document.getElementById('page-count');
    
    // File upload listeners
    if(selectFilesBtn) selectFilesBtn.addEventListener('click', (e) => { e.preventDefault(); fileInput.click(); });
    dropzone.addEventListener('click', (e) => { if (!activePdfFile && e.target !== fileInput) fileInput.click(); });
    fileInput.addEventListener('change', (e) => { if (e.target.files.length) handleFile(e.target.files[0]); });
    dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
    dropzone.addEventListener('drop', (e) => { e.preventDefault(); dropzone.classList.remove('dragover'); if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]); });

    async function handleFile(file) {
        if (file.type !== 'application/pdf') return alert('Please select a valid PDF document.');
        activePdfFile = file;
        document.getElementById('active-filename').innerHTML = `<i class="fa-solid fa-file-pdf" style="color: var(--theme-color);"></i> ${file.name}`;
        
        dropzone.classList.add('has-files');
        workspaceContainer.style.display = 'flex';

        const rawBuffer = await activePdfFile.arrayBuffer();
        rawPdfBytes = rawBuffer.slice(0);

        if (!window.pdfjsLib) await new Promise(r => setTimeout(r, 300));
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

        pdfDocProxy = await window.pdfjsLib.getDocument({ data: new Uint8Array(rawBuffer) }).promise;
        totalPages = pdfDocProxy.numPages;
        countSpan.textContent = totalPages;
        
        renderPage(1);
    }

    async function renderPage(num) {
        const page = await pdfDocProxy.getPage(num);
        const viewport = page.getViewport({ scale: 1.5 });
        
        pdfRenderCanvas.width = viewport.width;
        pdfRenderCanvas.height = viewport.height;

        await page.render({ canvasContext: pdfRenderCtx, viewport: viewport }).promise;
        
        currentPage = num;
        numSpan.textContent = num;
        btnPrev.disabled = num <= 1;
        btnNext.disabled = num >= totalPages;

        renderCropBoxUI();
    }

    btnPrev.addEventListener('click', () => { if(currentPage > 1) renderPage(currentPage - 1); });
    btnNext.addEventListener('click', () => { if(currentPage < totalPages) renderPage(currentPage + 1); });

    // ==========================================
    // INTERACTIVE 8-HANDLE CROP BOX CONTROLLER
    // ==========================================
    function renderCropBoxUI() {
        drawOverlay.innerHTML = '';
        const rect = pdfRenderCanvas.getBoundingClientRect();
        
        const boxEl = document.createElement('div');
        boxEl.className = 'crop-box';
        boxEl.style.left = (cropBox.x * rect.width) + 'px';
        boxEl.style.top = (cropBox.y * rect.height) + 'px';
        boxEl.style.width = (cropBox.w * rect.width) + 'px';
        boxEl.style.height = (cropBox.h * rect.height) + 'px';

        // Create 8 Handles
        const handles = ['nw', 'ne', 'se', 'sw', 'n', 's', 'w', 'e'];
        handles.forEach(h => {
            const handle = document.createElement('div');
            handle.className = `crop-handle handle-${h}`;
            handle.dataset.handle = h;
            boxEl.appendChild(handle);
        });

        drawOverlay.appendChild(boxEl);
        initDragAndResize(boxEl);
    }

    function initDragAndResize(boxEl) {
        let isInteracting = false;
        let actionType = null; // 'drag' or handle name ('nw', 'ne', etc.)
        let startX = 0, startY = 0;
        let startBox = { ...cropBox };

        boxEl.addEventListener('mousedown', startInteraction);
        boxEl.addEventListener('touchstart', startInteraction, { passive: false });

        function startInteraction(e) {
            e.stopPropagation();
            isInteracting = true;
            
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            
            startX = clientX;
            startY = clientY;
            startBox = { ...cropBox };

            if (e.target.classList.contains('crop-handle')) {
                actionType = e.target.dataset.handle;
            } else {
                actionType = 'drag';
            }

            window.addEventListener('mousemove', onInteracting);
            window.addEventListener('touchmove', onInteracting, { passive: false });
            window.addEventListener('mouseup', stopInteraction);
            window.addEventListener('touchend', stopInteraction);
        }

        function onInteracting(e) {
            if (!isInteracting) return;
            e.preventDefault();

            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            
            const rect = pdfRenderCanvas.getBoundingClientRect();
            const dx = (clientX - startX) / rect.width;
            const dy = (clientY - startY) / rect.height;

            let { x, y, w, h } = startBox;

            if (actionType === 'drag') {
                x = Math.max(0, Math.min(1 - w, startBox.x + dx));
                y = Math.max(0, Math.min(1 - h, startBox.y + dy));
            } else {
                // Resize based on handle
                if (actionType.includes('w')) {
                    const newX = Math.max(0, Math.min(startBox.x + startBox.w - 0.05, startBox.x + dx));
                    w = startBox.w + (startBox.x - newX);
                    x = newX;
                }
                if (actionType.includes('e')) {
                    w = Math.max(0.05, Math.min(1 - startBox.x, startBox.w + dx));
                }
                if (actionType.includes('n')) {
                    const newY = Math.max(0, Math.min(startBox.y + startBox.h - 0.05, startBox.y + dy));
                    h = startBox.h + (startBox.y - newY);
                    y = newY;
                }
                if (actionType.includes('s')) {
                    h = Math.max(0.05, Math.min(1 - startBox.y, startBox.h + dy));
                }
            }

            cropBox = { x, y, w, h };
            
            // Real-time DOM update without full re-render
            boxEl.style.left = (cropBox.x * rect.width) + 'px';
            boxEl.style.top = (cropBox.y * rect.height) + 'px';
            boxEl.style.width = (cropBox.w * rect.width) + 'px';
            boxEl.style.height = (cropBox.h * rect.height) + 'px';
        }

        function stopInteraction() {
            isInteracting = false;
            window.removeEventListener('mousemove', onInteracting);
            window.removeEventListener('touchmove', onInteracting);
            window.removeEventListener('mouseup', stopInteraction);
            window.removeEventListener('touchend', stopInteraction);
        }
    }

    window.addEventListener('resize', () => { if (activePdfFile) renderCropBoxUI(); });

    document.getElementById('btn-reset-box').addEventListener('click', () => {
        cropBox = { x: 0.1, y: 0.1, w: 0.8, h: 0.8 };
        renderCropBoxUI();
    });

    // ==========================================
    // PDF-LIB TRIMMING & EXPORT
    // ==========================================
    document.getElementById('btn-apply-crop').addEventListener('click', async () => {
        if (!window.PDFLib) return;
        
        const btn = document.getElementById('btn-apply-crop');
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Trimming Document...';

        try {
            const { PDFDocument } = window.PDFLib;
            const pdfDoc = await PDFDocument.load(rawPdfBytes, { ignoreEncryption: true });
            const pages = pdfDoc.getPages();
            
            const scope = document.getElementById('apply-scope').value;
            const targetPages = scope === 'all' ? pages : [pages[currentPage - 1]];

            targetPages.forEach(page => {
                const { width, height } = page.getSize();
                
                // Convert visual proportions to physical PDF points
                const cropWidth = cropBox.w * width;
                const cropHeight = cropBox.h * height;
                const cropX = cropBox.x * width;
                const cropY = height - (cropBox.y * height) - cropHeight; // PDF origin is bottom-left

                page.setCropBox(cropX, cropY, cropWidth, cropHeight);
                page.setMediaBox(cropX, cropY, cropWidth, cropHeight);
            });

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            
            const baseName = activePdfFile.name.replace(/\.[^/.]+$/, "");
            const finalFileName = `PDFase_${baseName}_Cropped.pdf`;

            const stealthAttribution = Math.random() > 0.5 
                ? `<div style="margin-top: 15px; font-size: 0.75rem; color: var(--text-muted); text-align: center;">Processed securely via <a href="https://rupamdas.in" target="_blank" rel="noopener" style="color: inherit; text-decoration: none;">PDFase Engine</a></div>`
                : `<div style="margin-top: 15px; font-size: 0.75rem; color: var(--text-muted); text-align: center;">Client utility crafted by <a href="https://rupamdas.in" target="_blank" rel="noopener" style="color: inherit; text-decoration: none;">Rupam Das</a></div>`;

            workspaceContainer.innerHTML = `
                <div class="success-message" style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding: 3rem 1rem;">
                    <div style="color: var(--theme-color); font-size: 3rem; margin-bottom: 1rem;"><i class="fa-solid fa-circle-check"></i></div>
                    <div style="font-size: 1.8rem; color: #fff; font-weight: 700; margin-bottom: 0.5rem;">Document Cropped!</div>
                    <div style="color: var(--text-muted); margin-bottom: 2rem;">Successfully trimmed ${scope === 'all' ? 'all pages' : 'the active page'}.</div>
                    
                    <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                        <a href="${url}" download="${finalFileName}" class="btn-action">
                            <i class="fa-solid fa-download"></i> Download PDF
                        </a>
                        <button class="btn-secondary" onclick="window.location.reload()">
                            <i class="fa-solid fa-rotate-right"></i> Crop Another
                        </button>
                    </div>
                    ${stealthAttribution}
                </div>
            `;
            
        } catch (error) {
            console.error('Processing Error:', error);
            alert('An error occurred. Make sure your PDF is not password-protected.');
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-scissors"></i> Crop Document & Download';
        }
    });

});
