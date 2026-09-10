// ==========================================
// 1. INJECT DEPENDENCIES & STYLES
// ==========================================
(function initEnvironment() {
    // 1. pdf-lib for applying the final blackout rectangles
    if (!window.PDFLib) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js';
        document.head.appendChild(script);
    }

    // 2. pdf.js for rendering the visual viewer canvas
    if (!window.pdfjsLib) {
        const pdfScript = document.createElement('script');
        pdfScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        document.head.appendChild(pdfScript);
    }

    const style = document.createElement('style');
    style.innerHTML = `
        .dropzone { transition: padding 0.3s ease, min-height 0.3s ease; cursor: pointer; }
        .dropzone.has-files { display: none !important; }

        .workspace-container { display: none; flex-direction: column; width: 100%; margin-bottom: 3rem; animation: fadeIn 0.4s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        .top-toolbar { width: 100%; display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; padding: 1rem 1.5rem; background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 8px; }
        .file-info { color: var(--text-main); font-family: 'JetBrains Mono', monospace; font-size: 0.9rem; font-weight: 600; display: flex; align-items: center; gap: 8px; }

        /* Main Workspace: Left Canvas, Right Controls */
        .redact-workspace { display: grid; grid-template-columns: 1fr 300px; gap: 2rem; width: 100%; align-items: start; }
        @media (max-width: 900px) { .redact-workspace { grid-template-columns: 1fr; } }

        /* --- Viewer Area (Left) --- */
        .viewer-panel { display: flex; flex-direction: column; gap: 1rem; align-items: center; width: 100%; }
        
        .canvas-wrapper { position: relative; background: #e0e0e0; border: 1px solid var(--border-subtle); border-radius: 6px; box-shadow: 0 4px 20px rgba(0,0,0,0.5); display: inline-block; user-select: none; touch-action: none; }
        #pdf-render-canvas { display: block; max-width: 100%; height: auto; }
        
        /* Interactive Overlay for Drawing Redactions */
        #draw-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; cursor: crosshair; z-index: 10; }
        
        /* Visual Redaction Box */
        .redact-box { position: absolute; background-color: #000; opacity: 0.85; border: 1px solid rgba(255, 255, 255, 0.3); box-shadow: 0 2px 10px rgba(0,0,0,0.5); pointer-events: none; }
        .redact-box.active-drawing { border: 1px dashed var(--theme-color); opacity: 0.6; }

        /* Pagination Controls */
        .pagination-controls { display: flex; gap: 1rem; align-items: center; background: var(--bg-card); padding: 0.5rem 1.5rem; border-radius: 20px; border: 1px solid var(--border-subtle); }
        .page-btn { background: none; border: none; color: var(--theme-color); font-size: 1.2rem; cursor: pointer; transition: transform 0.2s; }
        .page-btn:hover:not(:disabled) { transform: scale(1.2); }
        .page-btn:disabled { color: #444; cursor: not-allowed; }
        .page-info { font-family: 'JetBrains Mono', monospace; font-size: 0.9rem; color: var(--text-main); }

        /* --- Controls Panel (Right) --- */
        .controls-panel { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 2rem; display: flex; flex-direction: column; gap: 1.5rem; }
        .controls-panel h3 { color: #fff; font-size: 1.1rem; border-bottom: 1px solid var(--border-subtle); padding-bottom: 0.5rem; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 10px; }
        
        .info-text { font-size: 0.85rem; color: var(--text-muted); line-height: 1.6; }
        
        .panel-btn { background-color: transparent; color: #ff3366; border: 1px solid rgba(255, 51, 102, 0.3); padding: 0.75rem 1rem; border-radius: 6px; font-family: 'Space Grotesk', sans-serif; font-weight: 600; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; }
        .panel-btn:hover { background-color: rgba(255, 51, 102, 0.1); border-color: #ff3366; }

        /* Action Box */
        .bottom-action-box { width: 100%; display: flex; justify-content: center; margin-top: 2rem; padding-top: 1rem; }
        
        .btn-action { background-color: #2ee310; color: #0b1121; border: none; padding: 1rem 3rem; font-size: 1.1rem; font-weight: 700; font-family: 'Space Grotesk', sans-serif; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(46, 227, 16, 0.2); display: inline-flex; align-items: center; gap: 10px; text-decoration: none; }
        .btn-action:hover { background-color: #34fa14; transform: translateY(-2px); box-shadow: 0 6px 20px rgba(46, 227, 16, 0.35); }
        .btn-action:disabled { background-color: #222; color: #666; cursor: not-allowed; transform: none; box-shadow: none; }
        
        .btn-secondary { background-color: transparent; color: var(--text-main); border: 1px solid var(--border-subtle); padding: 0.65rem 1.1rem; font-size: 0.85rem; font-weight: 600; font-family: 'Space Grotesk', sans-serif; border-radius: 6px; cursor: pointer; transition: all 0.3s ease; display: inline-flex; align-items: center; gap: 8px; }
        .btn-secondary:hover { border-color: var(--theme-color); color: var(--theme-color); background-color: rgba(57, 255, 20, 0.05); }

        .success-message { width: 100%; text-align: center; margin-bottom: 2rem; }
    `;
    document.head.appendChild(style);
})();

document.addEventListener('DOMContentLoaded', () => {
    
    // Core State
    let activePdfFile = null;
    let rawPdfBytes = null;
    let pdfDocProxy = null;
    let totalPages = 0;
    let currentPage = 1;
    
    // Store redactions per page. Key = pageNum, Value = Array of { relX, relY, relW, relH }
    let pageRedactions = {}; 
    
    // Drawing State
    let isDrawing = false;
    let startX = 0, startY = 0;
    let currentActiveBox = null;

    const dropzone = document.getElementById('pdf-dropzone');
    const fileInput = document.getElementById('file-input');
    const selectFilesBtn = document.getElementById('select-files-btn');
    const mainContainer = dropzone.parentNode;

    // --- 1. BUILD UI ---
    const workspaceContainer = document.createElement('div');
    workspaceContainer.className = 'workspace-container';
    
    workspaceContainer.innerHTML = `
        <div class="top-toolbar">
            <div class="file-info" id="active-filename"><i class="fa-solid fa-file-pdf" style="color: var(--theme-color);"></i> document.pdf</div>
            <button class="btn-secondary" onclick="window.location.reload()"><i class="fa-solid fa-xmark"></i> Cancel</button>
        </div>

        <div class="redact-workspace">
            
            <!-- LEFT: Viewer Panel -->
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

            <!-- RIGHT: Controls Panel -->
            <div class="controls-panel">
                <div>
                    <h3><i class="fa-solid fa-pen-nib" style="color: var(--theme-color);"></i> Redaction Tools</h3>
                    <p class="info-text">Click and drag your mouse over the document to draw blackout boxes over sensitive information.</p>
                </div>

                <div style="display: flex; flex-direction: column; gap: 10px;">
                    <button class="panel-btn" id="btn-clear-page">
                        <i class="fa-solid fa-eraser"></i> Clear This Page
                    </button>
                    <button class="panel-btn" id="btn-clear-all" style="border-color: rgba(255,255,255,0.1); color: var(--text-muted);">
                        <i class="fa-solid fa-trash"></i> Clear All Pages
                    </button>
                </div>
                
                <div style="margin-top: auto;">
                    <p class="info-text" style="font-size: 0.75rem; color: #555;">
                        <i class="fa-solid fa-shield-halved"></i> Blackout rectangles will be permanently flattened onto the document upon applying.
                    </p>
                </div>
            </div>
        </div>

        <div class="bottom-action-box">
            <button class="btn-action" id="btn-apply-redact">
                <i class="fa-solid fa-marker"></i> Apply Redactions & Download
            </button>
        </div>
    `;
    
    mainContainer.insertBefore(workspaceContainer, dropzone.nextSibling);

    // Elements
    const pdfRenderCanvas = document.getElementById('pdf-render-canvas');
    const pdfRenderCtx = pdfRenderCanvas.getContext('2d');
    const drawOverlay = document.getElementById('draw-overlay');
    const canvasWrapper = document.getElementById('canvas-wrapper');

    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    const numSpan = document.getElementById('page-num');
    const countSpan = document.getElementById('page-count');
    
    // --- 2. UPLOAD & PDF.JS RENDERING ---
    if(selectFilesBtn) selectFilesBtn.addEventListener('click', (e) => { e.preventDefault(); fileInput.click(); });
    dropzone.addEventListener('click', (e) => { if (!activePdfFile && e.target !== fileInput) fileInput.click(); });
    fileInput.addEventListener('change', (e) => { if (e.target.files.length) handleFile(e.target.files[0]); });
    dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
    dropzone.addEventListener('drop', (e) => { e.preventDefault(); dropzone.classList.remove('dragover'); if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]); });

    async function handleFile(file) {
        if (file.type !== 'application/pdf') return alert('Please select a valid PDF.');
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
        
        // Initialize redaction array for all pages
        for(let i=1; i<=totalPages; i++) pageRedactions[i] = [];
        
        renderPage(1);
    }

    async function renderPage(num) {
        const page = await pdfDocProxy.getPage(num);
        const viewport = page.getViewport({ scale: 1.5 }); // Good resolution for viewing
        
        pdfRenderCanvas.width = viewport.width;
        pdfRenderCanvas.height = viewport.height;
        
        // Force wrapper to match exact intrinsic ratio
        pdfRenderCanvas.style.width = '100%';
        pdfRenderCanvas.style.height = 'auto';

        await page.render({ canvasContext: pdfRenderCtx, viewport: viewport }).promise;
        
        currentPage = num;
        numSpan.textContent = num;
        btnPrev.disabled = num <= 1;
        btnNext.disabled = num >= totalPages;

        restoreVisualBoxes();
    }

    btnPrev.addEventListener('click', () => { if(currentPage > 1) renderPage(currentPage - 1); });
    btnNext.addEventListener('click', () => { if(currentPage < totalPages) renderPage(currentPage + 1); });

    // --- 3. INTERACTIVE DRAWING LOGIC ---
    function getPointerPos(e) {
        const rect = drawOverlay.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    }

    drawOverlay.addEventListener('mousedown', startDrawing);
    drawOverlay.addEventListener('mousemove', draw);
    window.addEventListener('mouseup', stopDrawing); // bind to window to catch releases outside
    
    drawOverlay.addEventListener('touchstart', startDrawing, {passive: false});
    drawOverlay.addEventListener('touchmove', draw, {passive: false});
    window.addEventListener('touchend', stopDrawing);

    function startDrawing(e) {
        if(e.button !== 0 && e.type !== 'touchstart') return; // Only left click
        isDrawing = true;
        const pos = getPointerPos(e);
        startX = pos.x;
        startY = pos.y;

        currentActiveBox = document.createElement('div');
        currentActiveBox.className = 'redact-box active-drawing';
        currentActiveBox.style.left = startX + 'px';
        currentActiveBox.style.top = startY + 'px';
        currentActiveBox.style.width = '0px';
        currentActiveBox.style.height = '0px';
        drawOverlay.appendChild(currentActiveBox);
    }

    function draw(e) {
        if (!isDrawing || !currentActiveBox) return;
        e.preventDefault(); // Prevent scrolling on touch
        
        const pos = getPointerPos(e);
        const currentX = pos.x;
        const currentY = pos.y;

        const width = Math.abs(currentX - startX);
        const height = Math.abs(currentY - startY);
        const left = Math.min(currentX, startX);
        const top = Math.min(currentY, startY);

        currentActiveBox.style.width = width + 'px';
        currentActiveBox.style.height = height + 'px';
        currentActiveBox.style.left = left + 'px';
        currentActiveBox.style.top = top + 'px';
    }

    function stopDrawing() {
        if (!isDrawing) return;
        isDrawing = false;
        
        if (currentActiveBox) {
            currentActiveBox.classList.remove('active-drawing');
            
            const w = parseFloat(currentActiveBox.style.width);
            const h = parseFloat(currentActiveBox.style.height);
            
            // Ignore accidental tiny clicks
            if (w < 5 || h < 5) {
                currentActiveBox.remove();
                currentActiveBox = null;
                return;
            }

            // Calculate relative coordinates based on the overlay's current visual size
            const overlayRect = drawOverlay.getBoundingClientRect();
            const relX = parseFloat(currentActiveBox.style.left) / overlayRect.width;
            const relY = parseFloat(currentActiveBox.style.top) / overlayRect.height;
            const relW = w / overlayRect.width;
            const relH = h / overlayRect.height;

            pageRedactions[currentPage].push({ relX, relY, relW, relH });
            currentActiveBox = null;
        }
    }

    function restoreVisualBoxes() {
        drawOverlay.innerHTML = ''; // clear existing
        const boxes = pageRedactions[currentPage];
        const overlayRect = drawOverlay.getBoundingClientRect();

        boxes.forEach(box => {
            const div = document.createElement('div');
            div.className = 'redact-box';
            div.style.left = (box.relX * overlayRect.width) + 'px';
            // Use Math.max to ensure border sizing doesn't push it weirdly
            div.style.top = (box.relY * overlayRect.height) + 'px';
            div.style.width = (box.relW * overlayRect.width) + 'px';
            div.style.height = (box.relH * overlayRect.height) + 'px';
            drawOverlay.appendChild(div);
        });
    }

    // Handle window resize mapping
    window.addEventListener('resize', () => {
        if(activePdfFile) restoreVisualBoxes();
    });

    // Clear Buttons
    document.getElementById('btn-clear-page').addEventListener('click', () => {
        pageRedactions[currentPage] = [];
        restoreVisualBoxes();
    });

    document.getElementById('btn-clear-all').addEventListener('click', () => {
        for(let i=1; i<=totalPages; i++) pageRedactions[i] = [];
        restoreVisualBoxes();
    });

    // --- 4. FINAL PDF-LIB PROCESSING ---
    document.getElementById('btn-apply-redact').addEventListener('click', async () => {
        
        // Check if any redactions exist
        let totalBoxes = 0;
        for(let i=1; i<=totalPages; i++) totalBoxes += pageRedactions[i].length;
        
        if(totalBoxes === 0) {
            alert('Please draw at least one redaction box before applying.');
            return;
        }

        if(!window.PDFLib) return;
        
        const btn = document.getElementById('btn-apply-redact');
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Securing Document...';

        try {
            const { PDFDocument, rgb } = window.PDFLib;
            const pdfDoc = await PDFDocument.load(rawPdfBytes, { ignoreEncryption: true });
            const pages = pdfDoc.getPages();

            // Iterate over each page and apply rectangles
            for (let i = 1; i <= totalPages; i++) {
                const boxes = pageRedactions[i];
                if (boxes.length === 0) continue;

                const page = pages[i - 1];
                const { width, height } = page.getSize();

                boxes.forEach(box => {
                    const finalWidth = box.relW * width;
                    const finalHeight = box.relH * height;
                    const finalX = box.relX * width;
                    
                    // PDF-lib's Y coordinate starts from the bottom-left corner
                    const finalY = height - (box.relY * height) - finalHeight;

                    page.drawRectangle({
                        x: finalX,
                        y: finalY,
                        width: finalWidth,
                        height: finalHeight,
                        color: rgb(0, 0, 0), // Pure Black
                    });
                });
            }

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            
            const baseName = activePdfFile.name.replace(/\.[^/.]+$/, "");
            const finalFileName = `PDFase_${baseName}_Redacted.pdf`;

            workspaceContainer.innerHTML = `
                <div class="success-message">
                    <div style="color: var(--theme-color); font-size: 3rem; margin-bottom: 1rem;"><i class="fa-solid fa-circle-check"></i></div>
                    <div style="font-size: 1.8rem; color: #fff; font-weight: 700; margin-bottom: 0.5rem;">Document Sanitized!</div>
                    <div style="color: var(--text-muted); margin-bottom: 2rem;">Applied ${totalBoxes} redactions locally.</div>
                    
                    <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                        <a href="${url}" download="${finalFileName}" class="btn-action">
                            <i class="fa-solid fa-download"></i> Download Redacted PDF
                        </a>
                        <button class="btn-secondary" onclick="window.location.reload()">
                            <i class="fa-solid fa-rotate-right"></i> Redact Another
                        </button>
                    </div>
                </div>
            `;
            
        } catch (error) {
            console.error('Processing Error:', error);
            alert('An error occurred. Make sure your PDF is not password protected.');
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-marker"></i> Apply Redactions & Download';
        }
    });

});
