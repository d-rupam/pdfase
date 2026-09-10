// ==========================================
// 1. INJECT DEPENDENCIES & STYLES
// ==========================================
(function initEnvironment() {
    // 1. pdf-lib for editing and embedding the signature
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

    // 3. Inject Google Fonts for the 10 Signature Styles
    const fonts = document.createElement('link');
    fonts.href = 'https://fonts.googleapis.com/css2?family=Alex+Brush&family=Caveat&family=Dancing+Script&family=Great+Vibes&family=Homemade+Apple&family=Marck+Script&family=Pacifico&family=Sacramento&family=Satisfy&family=Yellowtail&display=swap';
    fonts.rel = 'stylesheet';
    document.head.appendChild(fonts);

    const style = document.createElement('style');
    style.innerHTML = `
        .dropzone { transition: padding 0.3s ease, min-height 0.3s ease; cursor: pointer; }
        .dropzone.has-files { display: none !important; }

        .workspace-container { display: none; flex-direction: column; width: 100%; margin-bottom: 3rem; animation: fadeIn 0.4s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        .top-toolbar { width: 100%; display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; padding: 1rem 1.5rem; background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 8px; }
        .file-info { color: var(--text-main); font-family: 'JetBrains Mono', monospace; font-size: 0.9rem; font-weight: 600; display: flex; align-items: center; gap: 8px; }

        /* Main Workspace: Left Canvas, Right Controls */
        .sign-workspace { display: grid; grid-template-columns: 1fr 380px; gap: 2rem; width: 100%; align-items: start; }
        @media (max-width: 900px) { .sign-workspace { grid-template-columns: 1fr; } }

        /* --- Viewer Area (Left) --- */
        .viewer-panel { display: flex; flex-direction: column; gap: 1rem; align-items: center; width: 100%; }
        .canvas-container { position: relative; background: #e0e0e0; border: 1px solid var(--border-subtle); border-radius: 6px; box-shadow: 0 4px 20px rgba(0,0,0,0.5); display: inline-block; overflow: hidden; }
        #pdf-render-canvas { display: block; max-width: 100%; height: auto; }
        
        /* Draggable Signature Overlay */
        #sig-overlay { position: absolute; z-index: 50; cursor: grab; border: 2px dashed transparent; padding: 5px; box-sizing: content-box; display: none; user-select: none; touch-action: none; transform-origin: top left; }
        #sig-overlay:hover, #sig-overlay.dragging { border-color: var(--theme-color); background: rgba(57, 255, 20, 0.1); }
        #sig-overlay:active { cursor: grabbing; }
        #sig-image { width: 100%; height: 100%; object-fit: contain; pointer-events: none; }
        
        /* Pagination Controls */
        .pagination-controls { display: flex; gap: 1rem; align-items: center; background: var(--bg-card); padding: 0.5rem 1rem; border-radius: 20px; border: 1px solid var(--border-subtle); }
        .page-btn { background: none; border: none; color: var(--theme-color); font-size: 1.2rem; cursor: pointer; transition: transform 0.2s; }
        .page-btn:hover:not(:disabled) { transform: scale(1.2); }
        .page-btn:disabled { color: #444; cursor: not-allowed; }
        .page-info { font-family: 'JetBrains Mono', monospace; font-size: 0.9rem; color: var(--text-main); }

        /* --- Controls Panel (Right) --- */
        .controls-panel { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 12px; display: flex; flex-direction: column; overflow: hidden; }
        
        /* Tabs */
        .tabs { display: flex; border-bottom: 1px solid var(--border-subtle); }
        .tab-btn { flex: 1; background: none; border: none; color: var(--text-muted); padding: 1rem 0; font-family: 'Space Grotesk', sans-serif; font-weight: 600; cursor: pointer; transition: all 0.3s; }
        .tab-btn.active { color: var(--theme-color); border-bottom: 2px solid var(--theme-color); background: rgba(57, 255, 20, 0.05); }
        
        .tab-content { padding: 1.5rem; display: none; flex-direction: column; gap: 1rem; }
        .tab-content.active { display: flex; }

        /* Inputs */
        .input-group { display: flex; flex-direction: column; gap: 8px; }
        .input-group label { color: var(--text-muted); font-size: 0.85rem; font-weight: 600; }
        .text-input { background: var(--bg-base); color: #fff; border: 1px solid var(--border-subtle); padding: 0.75rem 1rem; border-radius: 6px; font-family: 'Space Grotesk', sans-serif; font-size: 1rem; outline: none; }
        .text-input:focus { border-color: var(--theme-color); }

        /* Font Styles List (10 Styles) */
        .font-list { display: flex; flex-direction: column; gap: 8px; max-height: 250px; overflow-y: auto; padding-right: 5px; }
        .font-list::-webkit-scrollbar { width: 6px; }
        .font-list::-webkit-scrollbar-thumb { background: rgba(57, 255, 20, 0.3); border-radius: 3px; }
        .font-option { display: flex; align-items: center; gap: 10px; padding: 10px; border: 1px solid var(--border-subtle); border-radius: 6px; cursor: pointer; transition: all 0.2s; background: var(--bg-base); }
        .font-option:hover { border-color: rgba(57, 255, 20, 0.5); }
        .font-option.selected { border-color: var(--theme-color); background: rgba(57, 255, 20, 0.05); }
        .font-option input { display: none; }
        .font-preview { font-size: 1.5rem; color: #fff; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

        /* Drawing Canvas */
        .draw-box { border: 1px solid var(--border-subtle); border-radius: 6px; background: #fff; height: 150px; cursor: crosshair; touch-action: none; }
        .clear-btn { background: none; border: none; color: #ff3366; font-size: 0.85rem; font-weight: 600; cursor: pointer; align-self: flex-end; }

        /* General Options (Pages, Size, Color) */
        .global-options { padding: 1.5rem; border-top: 1px solid var(--border-subtle); display: flex; flex-direction: column; gap: 1rem; background: rgba(0,0,0,0.2); }
        .row-group { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        
        input[type="range"] { -webkit-appearance: none; width: 100%; background: transparent; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; height: 16px; width: 16px; border-radius: 50%; background: var(--theme-color); cursor: pointer; margin-top: -6px; }
        input[type="range"]::-webkit-slider-runnable-track { width: 100%; height: 4px; background: var(--border-subtle); border-radius: 2px; }
        input[type="color"] { -webkit-appearance: none; border: none; width: 100%; height: 35px; border-radius: 4px; cursor: pointer; background: none; padding: 0; }
        input[type="color"]::-webkit-color-swatch-wrapper { padding: 0; }
        input[type="color"]::-webkit-color-swatch { border: 1px solid var(--border-subtle); border-radius: 4px; }

        /* Action Buttons */
        .bottom-action-box { width: 100%; display: flex; justify-content: center; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px dashed var(--border-subtle); }
        .btn-action { background-color: #2ee310; color: #0b1121; border: none; padding: 1rem 3rem; font-size: 1.1rem; font-weight: 700; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; display: inline-flex; align-items: center; gap: 10px; }
        .btn-action:hover { background-color: #34fa14; transform: translateY(-2px); box-shadow: 0 6px 20px rgba(46, 227, 16, 0.35); }
        .btn-secondary { background-color: transparent; color: var(--text-main); border: 1px solid var(--border-subtle); padding: 0.65rem 1.1rem; border-radius: 6px; cursor: pointer; }
        .btn-secondary:hover { border-color: var(--theme-color); color: var(--theme-color); }

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
    
    let currentSignatureDataUrl = null; // Holds the active signature image (typed/drawn/uploaded)
    
    // Draggable Overlay State
    let isDragging = false;
    let dragStartX = 0, dragStartY = 0;
    let initialOverlayLeft = 0, initialOverlayTop = 0;

    const fontsList = [
        'Dancing Script', 'Pacifico', 'Caveat', 'Satisfy', 'Great Vibes', 
        'Sacramento', 'Homemade Apple', 'Yellowtail', 'Marck Script', 'Alex Brush'
    ];

    const dropzone = document.getElementById('pdf-dropzone');
    const fileInput = document.getElementById('file-input');
    const mainContainer = dropzone.parentNode;

    // --- 1. BUILD UI ---
    const workspaceContainer = document.createElement('div');
    workspaceContainer.className = 'workspace-container';
    
    workspaceContainer.innerHTML = `
        <div class="top-toolbar">
            <div class="file-info" id="active-filename"><i class="fa-solid fa-file-pdf" style="color: var(--theme-color);"></i> document.pdf</div>
            <button class="btn-secondary" onclick="window.location.reload()"><i class="fa-solid fa-xmark"></i> Close</button>
        </div>

        <div class="sign-workspace">
            
            <!-- LEFT: Viewer Panel -->
            <div class="viewer-panel">
                <div class="canvas-container" id="canvas-container">
                    <canvas id="pdf-render-canvas"></canvas>
                    <div id="sig-overlay">
                        <img id="sig-image" src="" alt="Signature" />
                    </div>
                </div>
                
                <div class="pagination-controls">
                    <button class="page-btn" id="btn-prev" disabled><i class="fa-solid fa-circle-chevron-left"></i></button>
                    <span class="page-info">Page <span id="page-num">1</span> of <span id="page-count">1</span></span>
                    <button class="page-btn" id="btn-next" disabled><i class="fa-solid fa-circle-chevron-right"></i></button>
                </div>
            </div>

            <!-- RIGHT: Controls Panel -->
            <div class="controls-panel">
                <div class="tabs">
                    <button class="tab-btn active" data-tab="type">Type</button>
                    <button class="tab-btn" data-tab="draw">Draw</button>
                    <button class="tab-btn" data-tab="upload">Upload</button>
                </div>
                
                <!-- TYPE TAB -->
                <div class="tab-content active" id="tab-type">
                    <div class="input-group">
                        <label>Your Name</label>
                        <input type="text" class="text-input" id="type-input" value="Your Name" placeholder="Type signature...">
                    </div>
                    <div class="input-group">
                        <label>Signature Style</label>
                        <div class="font-list" id="font-list-container">
                            <!-- Injected dynamically -->
                        </div>
                    </div>
                </div>

                <!-- DRAW TAB -->
                <div class="tab-content" id="tab-draw">
                    <div class="input-group">
                        <label>Draw Signature <button class="clear-btn" id="btn-clear-draw">Clear</button></label>
                        <canvas class="draw-box" id="draw-canvas"></canvas>
                    </div>
                </div>

                <!-- UPLOAD TAB -->
                <div class="tab-content" id="tab-upload">
                    <div class="input-group">
                        <label>Upload Image (PNG/JPG)</label>
                        <input type="file" class="text-input" id="upload-sig-input" accept="image/png, image/jpeg" style="padding: 0.5rem;">
                    </div>
                </div>

                <!-- GLOBAL SETTINGS -->
                <div class="global-options">
                    <div class="input-group">
                        <label>Apply to Pages</label>
                        <select class="text-input" id="page-selection" style="padding: 0.6rem;">
                            <option value="all">All Pages</option>
                            <option value="current">Current Page Only</option>
                        </select>
                    </div>
                    <div class="row-group">
                        <div class="input-group">
                            <label>Size</label>
                            <input type="range" id="sig-scale" min="0.2" max="2" step="0.1" value="1">
                        </div>
                        <div class="input-group">
                            <label>Color</label>
                            <input type="color" id="sig-color" value="#000000">
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="bottom-action-box">
            <button class="btn-action" id="btn-apply-sig">
                <i class="fa-solid fa-file-signature"></i> Apply Signature & Download
            </button>
        </div>
    `;
    
    mainContainer.insertBefore(workspaceContainer, dropzone.nextSibling);

    // Populate Fonts List
    const fontListContainer = document.getElementById('font-list-container');
    fontsList.forEach((font, index) => {
        const option = document.createElement('label');
        option.className = `font-option ${index === 0 ? 'selected' : ''}`;
        option.innerHTML = `
            <input type="radio" name="font-choice" value="${font}" ${index === 0 ? 'checked' : ''}>
            <div class="font-preview" style="font-family: '${font}', cursive;">Your Name</div>
        `;
        option.addEventListener('change', () => {
            document.querySelectorAll('.font-option').forEach(el => el.classList.remove('selected'));
            option.classList.add('selected');
            generateTypeSignature();
        });
        fontListContainer.appendChild(option);
    });

    // Elements
    const pdfRenderCanvas = document.getElementById('pdf-render-canvas');
    const pdfRenderCtx = pdfRenderCanvas.getContext('2d');
    const sigOverlay = document.getElementById('sig-overlay');
    const sigImage = document.getElementById('sig-image');
    const container = document.getElementById('canvas-container');

    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    const numSpan = document.getElementById('page-num');
    const countSpan = document.getElementById('page-count');
    
    // Inputs
    const typeInput = document.getElementById('type-input');
    const sigColor = document.getElementById('sig-color');
    const sigScale = document.getElementById('sig-scale');
    const uploadInput = document.getElementById('upload-sig-input');
    
    // --- 2. UPLOAD & PDF.JS RENDERING ---
    document.getElementById('select-files-btn').addEventListener('click', (e) => { e.preventDefault(); fileInput.click(); });
    dropzone.addEventListener('click', (e) => { if (!activePdfFile && e.target !== fileInput) fileInput.click(); });
    fileInput.addEventListener('change', (e) => { if (e.target.files.length) handleFile(e.target.files[0]); });
    dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
    dropzone.addEventListener('drop', (e) => { e.preventDefault(); dropzone.classList.remove('dragover'); if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]); });

    async function handleFile(file) {
        if (file.type !== 'application/pdf') return alert('Please select a PDF.');
        activePdfFile = file;
        document.getElementById('active-filename').innerHTML = `<i class="fa-solid fa-file-pdf" style="color: var(--theme-color);"></i> ${file.name}`;
        
        dropzone.classList.add('has-files');
        workspaceContainer.style.display = 'flex';

        const rawBuffer = await activePdfFile.arrayBuffer();
        rawPdfBytes = rawBuffer.slice(0); // Clone for final processing

        if (!window.pdfjsLib) await new Promise(r => setTimeout(r, 300));
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

        pdfDocProxy = await window.pdfjsLib.getDocument({ data: new Uint8Array(rawBuffer) }).promise;
        totalPages = pdfDocProxy.numPages;
        countSpan.textContent = totalPages;
        
        renderPage(1);
        generateTypeSignature(); // Initial signature creation
    }

    async function renderPage(num) {
        const page = await pdfDocProxy.getPage(num);
        const viewport = page.getViewport({ scale: 1.5 }); // High res rendering
        
        pdfRenderCanvas.width = viewport.width;
        pdfRenderCanvas.height = viewport.height;
        // Make the canvas visually responsive
        pdfRenderCanvas.style.width = '100%';
        pdfRenderCanvas.style.height = 'auto';

        await page.render({ canvasContext: pdfRenderCtx, viewport: viewport }).promise;
        
        currentPage = num;
        numSpan.textContent = num;
        btnPrev.disabled = num <= 1;
        btnNext.disabled = num >= totalPages;

        // Position signature overlay bottom-right by default on first load
        if(sigOverlay.style.display === 'none' || sigOverlay.style.display === '') {
            sigOverlay.style.display = 'block';
            setTimeout(() => {
                const cRect = container.getBoundingClientRect();
                const oRect = sigOverlay.getBoundingClientRect();
                sigOverlay.style.left = (cRect.width - oRect.width - 40) + 'px';
                sigOverlay.style.top = (cRect.height - oRect.height - 40) + 'px';
            }, 100);
        }
    }

    btnPrev.addEventListener('click', () => { if(currentPage > 1) renderPage(currentPage - 1); });
    btnNext.addEventListener('click', () => { if(currentPage < totalPages) renderPage(currentPage + 1); });

    // --- 3. SIGNATURE GENERATION (Offscreen Canvas -> DataURL) ---
    
    // Render Typed Signature
    function generateTypeSignature() {
        const text = typeInput.value || ' ';
        const font = document.querySelector('input[name="font-choice"]:checked').value;
        const color = sigColor.value;

        // Create temporary offscreen canvas to measure and draw text
        const tCanvas = document.createElement('canvas');
        const tCtx = tCanvas.getContext('2d');
        const fontSize = 100; // High res
        tCtx.font = `${fontSize}px "${font}", cursive`;
        
        const metrics = tCtx.measureText(text);
        tCanvas.width = Math.max(metrics.width + 40, 100);
        tCanvas.height = fontSize * 1.5;
        
        // Reset font after resize
        tCtx.font = `${fontSize}px "${font}", cursive`;
        tCtx.fillStyle = color;
        tCtx.textBaseline = 'middle';
        tCtx.fillText(text, 20, tCanvas.height / 2);

        updateOverlayImage(tCanvas.toDataURL('image/png'));
    }

    typeInput.addEventListener('input', () => {
        document.querySelectorAll('.font-preview').forEach(el => el.textContent = typeInput.value || 'Your Name');
        generateTypeSignature();
    });
    sigColor.addEventListener('input', () => {
        const activeTab = document.querySelector('.tab-btn.active').dataset.tab;
        if(activeTab === 'type') generateTypeSignature();
        // (For drawing, changing color updates future strokes, for simplicity we leave existing drawn pixels)
    });
    
    sigScale.addEventListener('input', () => {
        const scale = parseFloat(sigScale.value);
        sigOverlay.style.transform = `scale(${scale})`;
    });

    function updateOverlayImage(dataUrl) {
        currentSignatureDataUrl = dataUrl;
        sigImage.src = dataUrl;
        
        // Adjust physical width based on natural aspect ratio to avoid squishing
        const img = new Image();
        img.onload = () => {
            const aspect = img.width / img.height;
            sigOverlay.style.height = '60px'; // Base visual height
            sigOverlay.style.width = (60 * aspect) + 'px';
        };
        img.src = dataUrl;
    }

    // --- Drawing Canvas Logic ---
    const drawCanvas = document.getElementById('draw-canvas');
    const drawCtx = drawCanvas.getContext('2d');
    let isDrawing = false;
    
    // Fix canvas rendering resolution
    setTimeout(() => {
        drawCanvas.width = drawCanvas.offsetWidth * 2;
        drawCanvas.height = drawCanvas.offsetHeight * 2;
        drawCtx.scale(2, 2);
        drawCtx.lineCap = 'round';
        drawCtx.lineJoin = 'round';
    }, 100);

    function startDraw(e) { 
        isDrawing = true; 
        drawCtx.beginPath(); 
        drawCtx.strokeStyle = sigColor.value;
        drawCtx.lineWidth = 3;
        const rect = drawCanvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        drawCtx.moveTo(clientX - rect.left, clientY - rect.top); 
    }
    function draw(e) { 
        if(!isDrawing) return; 
        e.preventDefault();
        const rect = drawCanvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        drawCtx.lineTo(clientX - rect.left, clientY - rect.top); 
        drawCtx.stroke(); 
    }
    function stopDraw() { 
        if(isDrawing) {
            isDrawing = false; 
            updateOverlayImage(drawCanvas.toDataURL('image/png'));
        }
    }

    drawCanvas.addEventListener('mousedown', startDraw);
    drawCanvas.addEventListener('mousemove', draw);
    drawCanvas.addEventListener('mouseup', stopDraw);
    drawCanvas.addEventListener('mouseout', stopDraw);
    drawCanvas.addEventListener('touchstart', startDraw, {passive: false});
    drawCanvas.addEventListener('touchmove', draw, {passive: false});
    drawCanvas.addEventListener('touchend', stopDraw);

    document.getElementById('btn-clear-draw').addEventListener('click', () => {
        drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
        // Fallback to type signature if cleared
        generateTypeSignature();
    });

    // --- Upload Logic ---
    uploadInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if(!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => updateOverlayImage(ev.target.result);
        reader.readAsDataURL(file);
    });

    // --- Tab Switching ---
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn, .tab-content').forEach(el => el.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
            
            if(btn.dataset.tab === 'type') generateTypeSignature();
            else if(btn.dataset.tab === 'draw') updateOverlayImage(drawCanvas.toDataURL('image/png'));
            else if(btn.dataset.tab === 'upload' && uploadInput.files[0]) {
                const reader = new FileReader();
                reader.onload = (ev) => updateOverlayImage(ev.target.result);
                reader.readAsDataURL(uploadInput.files[0]);
            }
        });
    });

    // --- 4. DRAG & DROP OVERLAY LOGIC ---
    sigOverlay.addEventListener('mousedown', dragStart);
    sigOverlay.addEventListener('touchstart', dragStart, {passive: false});

    function dragStart(e) {
        if (e.type === "touchstart") { dragStartX = e.touches[0].clientX; dragStartY = e.touches[0].clientY; } 
        else { dragStartX = e.clientX; dragStartY = e.clientY; }
        
        initialOverlayLeft = sigOverlay.offsetLeft;
        initialOverlayTop = sigOverlay.offsetTop;
        isDragging = true;
        sigOverlay.classList.add('dragging');
        
        document.addEventListener('mousemove', drag);
        document.addEventListener('touchmove', drag, {passive: false});
        document.addEventListener('mouseup', dragEnd);
        document.addEventListener('touchend', dragEnd);
    }

    function drag(e) {
        if (!isDragging) return;
        e.preventDefault();
        let clientX = e.type === "touchmove" ? e.touches[0].clientX : e.clientX;
        let clientY = e.type === "touchmove" ? e.touches[0].clientY : e.clientY;

        let dx = clientX - dragStartX;
        let dy = clientY - dragStartY;

        // Boundary constraints
        const cRect = container.getBoundingClientRect();
        const rect = sigOverlay.getBoundingClientRect();
        
        let newLeft = initialOverlayLeft + dx;
        let newTop = initialOverlayTop + dy;

        // Allow some overflow but keep it mostly within bounds
        newLeft = Math.max(-rect.width/2, Math.min(newLeft, cRect.width - rect.width/2));
        newTop = Math.max(-rect.height/2, Math.min(newTop, cRect.height - rect.height/2));

        sigOverlay.style.left = newLeft + 'px';
        sigOverlay.style.top = newTop + 'px';
    }

    function dragEnd() {
        isDragging = false;
        sigOverlay.classList.remove('dragging');
        document.removeEventListener('mousemove', drag);
        document.removeEventListener('touchmove', drag);
        document.removeEventListener('mouseup', dragEnd);
        document.removeEventListener('touchend', dragEnd);
    }


    // --- 5. FINAL PDF-LIB PROCESSING ---
    document.getElementById('btn-apply-sig').addEventListener('click', async () => {
        if(!currentSignatureDataUrl || !window.PDFLib) return;
        
        const btn = document.getElementById('btn-apply-sig');
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Processing...';

        try {
            const { PDFDocument } = window.PDFLib;
            const pdfDoc = await PDFDocument.load(rawPdfBytes, { ignoreEncryption: true });
            
            // Convert Base64 DataURL to Image for PDF-lib
            const imgBytes = await fetch(currentSignatureDataUrl).then(res => res.arrayBuffer());
            let pdfImage;
            if (currentSignatureDataUrl.startsWith('data:image/jpeg')) {
                pdfImage = await pdfDoc.embedJpg(imgBytes);
            } else {
                pdfImage = await pdfDoc.embedPng(imgBytes);
            }

            // Calculate Coordinates based on percentages of the visual canvas
            const cRect = container.getBoundingClientRect();
            
            // Get actual visual rect of the overlay (accounting for scale transform)
            const oRect = sigOverlay.getBoundingClientRect();
            
            // Relative Position (0 to 1)
            const relX = (oRect.left - cRect.left) / cRect.width;
            const relY = (oRect.top - cRect.top) / cRect.height;
            const relWidth = oRect.width / cRect.width;
            const relHeight = oRect.height / cRect.height;

            const pages = pdfDoc.getPages();
            const pageSelect = document.getElementById('page-selection').value;
            
            const targetPages = pageSelect === 'all' 
                ? pages 
                : [pages[currentPage - 1]];

            targetPages.forEach(page => {
                const { width, height } = page.getSize();
                
                // Map relative HTML coordinates to PDF physical dimensions
                const finalWidth = relWidth * width;
                const finalHeight = relHeight * height;
                const finalX = relX * width;
                // PDF-lib Y-axis is inverted (0 is bottom)
                const finalY = height - (relY * height) - finalHeight;

                page.drawImage(pdfImage, {
                    x: finalX,
                    y: finalY,
                    width: finalWidth,
                    height: finalHeight
                });
            });

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            
            const baseName = activePdfFile.name.replace(/\.[^/.]+$/, "");
            const finalFileName = `PDFase_${baseName}_Signed.pdf`;

            workspaceContainer.innerHTML = `
                <div class="success-message">
                    <div class="success-icon"><i class="fa-solid fa-circle-check"></i></div>
                    <div class="success-title">Signature Applied!</div>
                    <div style="color: var(--text-muted); margin-bottom: 2rem;">Your document was processed locally & securely.</div>
                    
                    <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                        <a href="${url}" download="${finalFileName}" class="btn-action">
                            <i class="fa-solid fa-download"></i> Download Signed PDF
                        </a>
                        <button class="btn-secondary" onclick="window.location.reload()">
                            <i class="fa-solid fa-rotate-right"></i> Sign Another
                        </button>
                    </div>
                </div>
            `;
            
        } catch (error) {
            console.error('Processing Error:', error);
            alert('An error occurred. Make sure your PDF is not password protected.');
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-file-signature"></i> Apply Signature & Download';
        }
    });

});
