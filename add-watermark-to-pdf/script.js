// ==========================================
// 1. INJECT DEPENDENCIES & STYLES
// ==========================================
(function initEnvironment() {
    // Inject pdf-lib for editing/saving
    if (!window.PDFLib) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js';
        document.head.appendChild(script);
    }

    // Inject pdf.js for live rendering of the document preview
    if (!window.pdfjsLib) {
        const pdfScript = document.createElement('script');
        pdfScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        document.head.appendChild(pdfScript);
    }

    const style = document.createElement('style');
    style.innerHTML = `
        .dropzone { transition: padding 0.3s ease, min-height 0.3s ease; -webkit-tap-highlight-color: transparent; cursor: pointer; }
        .dropzone.has-files { display: none !important; }

        .workspace-container { display: none; flex-direction: column; width: 100%; margin-bottom: 3rem; animation: fadeIn 0.4s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        .top-toolbar { width: 100%; display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; padding: 1rem 1.5rem; background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 8px; }
        .file-info { color: var(--text-main); font-family: 'JetBrains Mono', monospace; font-size: 0.9rem; font-weight: 600; display: flex; align-items: center; gap: 8px; }

        /* Main Workspace: Left Controls, Right Preview */
        .watermark-workspace { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; width: 100%; align-items: start; }
        
        @media (max-width: 768px) {
            .watermark-workspace { grid-template-columns: 1fr; }
        }

        /* Controls Panel */
        .controls-panel { background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-subtle); padding: 2rem; border-radius: 12px; display: flex; flex-direction: column; gap: 1.25rem; }
        
        .input-group { display: flex; flex-direction: column; gap: 8px; }
        .input-group label { color: var(--text-muted); font-size: 0.85rem; font-weight: 600; font-family: 'Space Grotesk', sans-serif; display: flex; justify-content: space-between; }
        .input-group input[type="text"], .input-group input[type="number"] { background: var(--bg-base); color: #fff; border: 1px solid var(--border-subtle); padding: 0.75rem 1rem; border-radius: 6px; font-family: 'Space Grotesk', sans-serif; font-size: 0.95rem; outline: none; transition: border-color 0.2s; width: 100%; }
        .input-group input:focus { border-color: var(--theme-color); }
        
        /* Dual inputs for start/end page */
        .row-group { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

        /* Sliders */
        input[type="range"] { -webkit-appearance: none; width: 100%; background: transparent; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; height: 16px; width: 16px; border-radius: 50%; background: var(--theme-color); cursor: pointer; margin-top: -6px; box-shadow: 0 0 10px rgba(57, 255, 20, 0.5); }
        input[type="range"]::-webkit-slider-runnable-track { width: 100%; height: 4px; cursor: pointer; background: var(--border-subtle); border-radius: 2px; }
        
        /* Color Picker */
        input[type="color"] { -webkit-appearance: none; border: none; width: 100%; height: 40px; border-radius: 6px; cursor: pointer; background: none; padding: 0; }
        input[type="color"]::-webkit-color-swatch-wrapper { padding: 0; }
        input[type="color"]::-webkit-color-swatch { border: 1px solid var(--border-subtle); border-radius: 6px; }

        /* Live Preview Panel */
        .preview-panel { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 1.5rem; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; position: relative; }
        .preview-label { position: absolute; top: 1rem; left: 1rem; background: rgba(57, 255, 20, 0.1); color: var(--theme-color); padding: 4px 10px; border-radius: 4px; font-size: 0.75rem; font-family: 'JetBrains Mono', monospace; font-weight: 700; z-index: 10; }
        
        .canvas-wrapper { width: 100%; display: flex; justify-content: center; align-items: center; overflow: hidden; background: #e0e0e0; box-shadow: 0 5px 20px rgba(0,0,0,0.4); border-radius: 4px; }
        #live-preview-canvas { max-width: 100%; max-height: 500px; object-fit: contain; }

        /* Action Box */
        .bottom-action-box { width: 100%; display: flex; justify-content: center; margin-top: 2.5rem; padding-top: 1rem; }
        
        .btn-action { background-color: #2ee310; color: #0b1121; border: none; padding: 1rem 3rem; font-size: 1.1rem; font-weight: 700; font-family: 'Space Grotesk', sans-serif; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(46, 227, 16, 0.2); display: inline-flex; align-items: center; gap: 10px; }
        .btn-action:hover { background-color: #34fa14; transform: translateY(-2px); box-shadow: 0 6px 20px rgba(46, 227, 16, 0.35); }
        .btn-action:disabled { background-color: #222; color: #666; cursor: not-allowed; transform: none; box-shadow: none; }
        
        .btn-secondary { background-color: transparent; color: var(--text-main); border: 1px solid var(--border-subtle); padding: 0.75rem 1.5rem; font-size: 0.95rem; font-weight: 600; font-family: 'Space Grotesk', sans-serif; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; display: inline-flex; align-items: center; gap: 8px; }
        .btn-secondary:hover { border-color: var(--theme-color); color: var(--theme-color); background-color: rgba(57, 255, 20, 0.05); }

        /* Success UI */
        .success-message { width: 100%; text-align: center; margin-bottom: 2rem; }
        .success-icon { color: var(--theme-color); font-size: 3rem; margin-bottom: 1rem; }
        .success-title { font-size: 1.8rem; color: #fff; font-weight: 700; margin-bottom: 0.5rem; }
    `;
    document.head.appendChild(style);
})();

document.addEventListener('DOMContentLoaded', () => {
    let activePdfFile = null;
    let rawPdfBytes = null;
    let totalPages = 0;
    
    // Background canvas caching for the live preview
    let bgCanvas = document.createElement('canvas');
    let bgCtx = bgCanvas.getContext('2d');
    let isPreviewReady = false;

    const dropzone = document.getElementById('pdf-dropzone');
    const fileInput = document.getElementById('file-input');
    const selectFilesBtn = document.getElementById('select-files-btn');
    const mainContainer = dropzone.parentNode;

    // Build Workspace
    const workspaceContainer = document.createElement('div');
    workspaceContainer.className = 'workspace-container';
    
    workspaceContainer.innerHTML = `
        <div class="top-toolbar">
            <div class="file-info" id="active-filename"><i class="fa-solid fa-file-pdf" style="color: var(--theme-color);"></i> document.pdf</div>
            <button class="btn-secondary" onclick="window.location.reload()"><i class="fa-solid fa-xmark"></i> Cancel</button>
        </div>

        <div class="watermark-workspace">
            <!-- Left Controls -->
            <div class="controls-panel">
                <div class="input-group">
                    <label>Watermark Text</label>
                    <input type="text" id="wm-text" value="CONFIDENTIAL">
                </div>
                
                <div class="row-group">
                    <div class="input-group">
                        <label>Font Size: <span id="val-size">60</span>px</label>
                        <input type="range" id="wm-size" min="10" max="200" value="60">
                    </div>
                    <div class="input-group">
                        <label>Color</label>
                        <input type="color" id="wm-color" value="#FF0000">
                    </div>
                </div>

                <div class="input-group">
                    <label>Opacity: <span id="val-opacity">30</span>%</label>
                    <input type="range" id="wm-opacity" min="5" max="100" value="30">
                </div>

                <div class="input-group">
                    <label>Rotation: <span id="val-rotation">45</span>°</label>
                    <input type="range" id="wm-rotation" min="-90" max="90" value="45">
                </div>

                <div class="row-group">
                    <div class="input-group">
                        <label>Start Page</label>
                        <input type="number" id="wm-start" value="1" min="1">
                    </div>
                    <div class="input-group">
                        <label>End Page</label>
                        <input type="number" id="wm-end" value="1" min="1">
                    </div>
                </div>
            </div>

            <!-- Right Live Preview -->
            <div class="preview-panel">
                <div class="preview-label">LIVE PREVIEW</div>
                <div class="canvas-wrapper">
                    <canvas id="live-preview-canvas"></canvas>
                </div>
                <div id="preview-loader" style="color: var(--text-muted); margin-top: 15px; display: none;">
                    <i class="fa-solid fa-circle-notch fa-spin"></i> Rendering page preview...
                </div>
            </div>
        </div>

        <div class="bottom-action-box">
            <button class="btn-action" id="btn-apply-watermark">
                <i class="fa-solid fa-stamp"></i> Apply Watermark & Download
            </button>
        </div>
    `;
    
    mainContainer.insertBefore(workspaceContainer, dropzone.nextSibling);

    // Grab UI Elements
    const wmText = document.getElementById('wm-text');
    const wmSize = document.getElementById('wm-size');
    const wmColor = document.getElementById('wm-color');
    const wmOpacity = document.getElementById('wm-opacity');
    const wmRotation = document.getElementById('wm-rotation');
    const wmStart = document.getElementById('wm-start');
    const wmEnd = document.getElementById('wm-end');
    
    const valSize = document.getElementById('val-size');
    const valOpacity = document.getElementById('val-opacity');
    const valRotation = document.getElementById('val-rotation');
    
    const previewCanvas = document.getElementById('live-preview-canvas');
    const previewCtx = previewCanvas.getContext('2d');
    const btnApply = document.getElementById('btn-apply-watermark');

    // Setup Listeners for real-time preview updates
    const inputs = [wmText, wmSize, wmColor, wmOpacity, wmRotation];
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            // Update label texts
            valSize.textContent = wmSize.value;
            valOpacity.textContent = wmOpacity.value;
            valRotation.textContent = wmRotation.value;
            renderLivePreview();
        });
    });

    // Handle Upload Events
    if (selectFilesBtn) selectFilesBtn.addEventListener('click', (e) => { e.preventDefault(); fileInput.click(); });
    dropzone.addEventListener('click', (e) => { if (!activePdfFile && e.target !== fileInput) fileInput.click(); });
    fileInput.addEventListener('change', (e) => { if (e.target.files.length > 0) handleFile(e.target.files[0]); fileInput.value = ''; });
    dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
    dropzone.addEventListener('drop', (e) => { e.preventDefault(); dropzone.classList.remove('dragover'); if (e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]); });

    async function handleFile(file) {
        if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) { alert('Please select a PDF.'); return; }
        
        activePdfFile = file;
        document.getElementById('active-filename').innerHTML = `<i class="fa-solid fa-file-pdf" style="color: var(--theme-color);"></i> ${file.name}`;
        
        dropzone.classList.add('has-files');
        workspaceContainer.style.display = 'flex';
        document.getElementById('preview-loader').style.display = 'block';

        const rawBuffer = await activePdfFile.arrayBuffer();
        rawPdfBytes = rawBuffer.slice(0); // Deep clone for pdf-lib

        extractPreviewPage(new Uint8Array(rawBuffer));
    }

    // Load PDF.js and extract the first page for the Live Preview Background
    async function extractPreviewPage(typedarray) {
        if (!window.pdfjsLib) {
            setTimeout(() => extractPreviewPage(typedarray), 200); return;
        }

        const pdfjsLib = window['pdfjs-dist/build/pdf'];
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

        try {
            const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
            totalPages = pdf.numPages;
            
            // Set max page dynamically
            wmEnd.value = totalPages;
            wmEnd.max = totalPages;
            wmStart.max = totalPages;

            const page = await pdf.getPage(1); // Preview page 1
            const viewport = page.getViewport({ scale: 1.0 });

            bgCanvas.height = viewport.height;
            bgCanvas.width = viewport.width;

            await page.render({ canvasContext: bgCtx, viewport: viewport }).promise;
            
            isPreviewReady = true;
            document.getElementById('preview-loader').style.display = 'none';
            renderLivePreview(); // Initial render with watermark overlay

        } catch (error) {
            console.error("Preview render failed", error);
            document.getElementById('preview-loader').innerHTML = "Could not render preview.";
        }
    }

    // Re-draws the canvas with the background page + the watermark text overlay
    function renderLivePreview() {
        if (!isPreviewReady) return;

        // Size the visible canvas to match the background PDF page
        previewCanvas.width = bgCanvas.width;
        previewCanvas.height = bgCanvas.height;

        // 1. Draw PDF Page Background
        previewCtx.drawImage(bgCanvas, 0, 0);

        // 2. Setup Watermark Styles
        const text = wmText.value;
        const fontSize = parseInt(wmSize.value);
        const opacity = parseInt(wmOpacity.value) / 100;
        const angle = parseInt(wmRotation.value) * (Math.PI / 180); // convert deg to rad
        
        // Convert Hex to RGBA
        const hex = wmColor.value.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        
        previewCtx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
        previewCtx.font = `bold ${fontSize}px "Helvetica", sans-serif`;
        previewCtx.textAlign = 'center';
        previewCtx.textBaseline = 'middle';

        // 3. Transform & Draw Watermark perfectly centered
        const centerX = previewCanvas.width / 2;
        const centerY = previewCanvas.height / 2;

        previewCtx.save();
        previewCtx.translate(centerX, centerY);
        previewCtx.rotate(-angle); // Canvas rotation is opposite to natural math
        previewCtx.fillText(text, 0, 0);
        previewCtx.restore();
    }

    // Hex to normalized RGB utility for pdf-lib
    function hexToPdfRgb(hexStr, PDFLibRgbFn) {
        const hex = hexStr.replace('#', '');
        return PDFLibRgbFn(
            parseInt(hex.substring(0, 2), 16) / 255,
            parseInt(hex.substring(2, 4), 16) / 255,
            parseInt(hex.substring(4, 6), 16) / 255
        );
    }

    // Apply via PDF-Lib
    btnApply.addEventListener('click', async () => {
        if (!window.PDFLib) return;
        
        btnApply.disabled = true;
        btnApply.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Processing...';

        try {
            const { PDFDocument, StandardFonts, rgb, degrees } = window.PDFLib;
            const pdfDoc = await PDFDocument.load(rawPdfBytes, { ignoreEncryption: true });
            const helveticaFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
            
            const pages = pdfDoc.getPages();
            
            const text = wmText.value;
            const fontSize = parseInt(wmSize.value);
            const opacity = parseInt(wmOpacity.value) / 100;
            const angle = parseInt(wmRotation.value);
            const color = hexToPdfRgb(wmColor.value, rgb);
            
            const startP = Math.max(1, parseInt(wmStart.value)) - 1;
            const endP = Math.min(totalPages, parseInt(wmEnd.value)) - 1;

            for (let i = startP; i <= endP; i++) {
                const page = pages[i];
                const { width, height } = page.getSize();
                
                const textWidth = helveticaFont.widthOfTextAtSize(text, fontSize);
                const textHeight = helveticaFont.heightAtSize(fontSize);
                
                // Calculate anchor so text perfectly centers while rotated
                // PDF-lib draws from bottom-left corner of the text box
                const rad = angle * (Math.PI / 180);
                const centerX = width / 2;
                const centerY = height / 2;
                
                // Adjust coordinates based on rotation anchor point
                const x = centerX - (textWidth/2)*Math.cos(rad) + (textHeight/2)*Math.sin(rad);
                const y = centerY - (textWidth/2)*Math.sin(rad) - (textHeight/2)*Math.cos(rad);

                page.drawText(text, {
                    x: x,
                    y: y,
                    size: fontSize,
                    font: helveticaFont,
                    color: color,
                    opacity: opacity,
                    rotate: degrees(angle)
                });
            }

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            
            const baseName = activePdfFile.name.replace(/\.[^/.]+$/, "");
            const finalFileName = `PDFase_${baseName}_Watermarked.pdf`;

            setTimeout(() => {
                workspaceContainer.innerHTML = `
                    <div class="success-message">
                        <div class="success-icon"><i class="fa-solid fa-circle-check"></i></div>
                        <div class="success-title">Watermark Applied!</div>
                        <div style="color: var(--text-muted); margin-bottom: 2rem;">Your document was processed locally & securely.</div>
                        
                        <div class="toolbar-group" style="justify-content: center; width: 100%;">
                            <a href="${url}" download="${finalFileName}" class="btn-action">
                                <i class="fa-solid fa-download"></i> Download PDF
                            </a>
                            <button class="btn-secondary" onclick="window.location.reload()">
                                <i class="fa-solid fa-rotate-right"></i> Watermark Another
                            </button>
                        </div>
                    </div>
                `;
            }, 500);

        } catch (error) {
            console.error('Processing Error:', error);
            alert('A critical error occurred. Ensure the PDF is not password protected.');
            btnApply.disabled = false;
            btnApply.innerHTML = '<i class="fa-solid fa-stamp"></i> Apply Watermark & Download';
        }
    });
});
