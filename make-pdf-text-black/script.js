// ==========================================
// 1. INJECT DEPENDENCIES & STYLES
// ==========================================
(function initEnvironment() {
    // Inject pdf-lib for building the final monochrome PDF
    if (!window.PDFLib) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js';
        document.head.appendChild(script);
    }

    // Inject pdf.js for rendering the pages to intercept pixel data
    if (!window.pdfjsLib) {
        const pdfScript = document.createElement('script');
        pdfScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        document.head.appendChild(pdfScript);
    }

    const style = document.createElement('style');
    style.innerHTML = `
        /* Dynamic Dropzone */
        .dropzone { transition: padding 0.3s ease, min-height 0.3s ease; -webkit-tap-highlight-color: transparent; cursor: pointer; }
        .dropzone.has-files { padding: 1.25rem 1rem 0.25rem 1rem !important; margin-bottom: 0 !important; cursor: default; }

        /* A4 Grid Layout for the selected file */
        .a4-grid { display: flex; flex-wrap: wrap; gap: 0.75rem; justify-content: center; width: 100%; padding: 0; margin: 0; }
        .a4-card { width: 120px; height: 160px; background-color: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 6px; position: relative; padding: 10px; text-align: center; display: block; transition: all 0.2s ease; box-shadow: 0 4px 10px rgba(0,0,0,0.2); user-select: none; }
        .a4-card:hover { border-color: rgba(57, 255, 20, 0.5); transform: translateY(-3px); box-shadow: 0 6px 15px rgba(57, 255, 20, 0.15); }
        .a4-icon-wrapper { height: 90px; display: flex; align-items: center; justify-content: center; width: 100%; }
        .a4-icon { font-size: 2.5rem; color: var(--theme-color, #39ff14); transition: color 0.2s; }
        .a4-name { font-size: 0.75rem; color: var(--text-main); font-weight: 500; width: 100%; height: 38px; margin-top: 5px; padding-top: 6px; border-top: 1px solid rgba(255, 255, 255, 0.05); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis; white-space: normal; line-height: 1.3; word-break: break-word; }
        .a4-remove { position: absolute; top: -8px; right: -8px; background: #ff3366; color: #fff; border: none; border-radius: 50%; width: 22px; height: 22px; font-size: 0.75rem; cursor: pointer; display: flex; justify-content: center; align-items: center; box-shadow: 0 2px 5px rgba(0,0,0,0.4); z-index: 10; transition: transform 0.2s; }
        .a4-remove:hover { transform: scale(1.1); }

        /* Action Container */
        .action-container { margin-top: 1.5rem !important; margin-bottom: 3rem; display: none; gap: 1.5rem; justify-content: center; flex-direction: column; align-items: center; animation: fadeIn 0.4s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        
        /* Configuration Panel */
        .options-panel { background: rgba(57, 255, 20, 0.02); border: 1px solid rgba(57, 255, 20, 0.15); padding: 2rem; border-radius: 8px; display: flex; flex-direction: column; gap: 1.5rem; width: 100%; max-width: 650px; }
        .options-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; width: 100%; }
        
        .input-group { display: flex; flex-direction: column; gap: 6px; text-align: left; }
        .input-group label { color: var(--text-muted); font-size: 0.85rem; font-weight: 600; font-family: 'Space Grotesk', sans-serif; display: flex; justify-content: space-between;}
        .input-group select { background: var(--bg-card); color: #fff; border: 1px solid var(--border-subtle); padding: 0.75rem 1rem; border-radius: 6px; font-family: 'JetBrains Mono', monospace; font-size: 0.95rem; outline: none; transition: border-color 0.2s; width: 100%; cursor: pointer; }
        .input-group select:focus { border-color: var(--theme-color, #39ff14); }

        /* Sliders */
        input[type="range"] { -webkit-appearance: none; width: 100%; background: transparent; padding: 10px 0; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; height: 16px; width: 16px; border-radius: 50%; background: var(--theme-color); cursor: pointer; margin-top: -6px; box-shadow: 0 0 10px rgba(57, 255, 20, 0.5); }
        input[type="range"]::-webkit-slider-runnable-track { width: 100%; height: 4px; cursor: pointer; background: var(--border-subtle); border-radius: 2px; }

        .hidden { display: none !important; }

        /* Action Buttons */
        .button-group { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; width: 100%; margin-top: 1rem; }
        .btn-action { background-color: #2ee310; color: #0b1121; border: none; padding: 1rem 3rem; font-size: 1.1rem; font-weight: 700; font-family: 'Space Grotesk', sans-serif; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(46, 227, 16, 0.2); display: inline-flex; align-items: center; gap: 10px; text-decoration: none; }
        .btn-action:hover { background-color: #34fa14; transform: translateY(-2px); box-shadow: 0 6px 20px rgba(46, 227, 16, 0.35); }
        .btn-action:disabled { background-color: #222; color: #666; cursor: not-allowed; transform: none; box-shadow: none; }
        
        .btn-secondary { background-color: transparent; color: var(--text-main); border: 1px solid var(--border-subtle); padding: 0.85rem 1.75rem; font-size: 0.95rem; font-weight: 600; font-family: 'Space Grotesk', sans-serif; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; }
        .btn-secondary:hover { border-color: var(--theme-color, #39ff14); color: var(--theme-color, #39ff14); background-color: rgba(57, 255, 20, 0.05); }

        /* Success UI */
        .success-message { width: 100%; text-align: center; color: var(--theme-color, #39ff14); font-size: 1.5rem; font-weight: 700; margin-bottom: 0.25rem; }
        .file-flow { color: var(--text-muted); font-size: 0.85rem; margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: center; gap: 8px; flex-wrap: wrap; background: rgba(57, 255, 20, 0.03); padding: 12px 24px; border-radius: 8px; border: 1px solid rgba(57, 255, 20, 0.2); text-align: center; max-width: 100%; word-break: break-word; }
        .file-flow-name, .file-flow-final { font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; }
        .file-flow-final { color: #fff; font-weight: 700; border-bottom: 1px dashed var(--theme-color, #39ff14); }
    `;
    document.head.appendChild(style);
})();

// ==========================================
// STATE MANAGEMENT & DOM SETUP
// ==========================================
document.addEventListener('DOMContentLoaded', () => {

    let activePdfFile = null; 
    let rawPdfBuffer = null;

    const dropzone = document.getElementById('pdf-dropzone');
    const fileInput = document.getElementById('file-input');
    const selectFilesBtn = document.getElementById('select-files-btn');
    const defaultDropzoneElements = Array.from(dropzone.children).filter(el => el.id !== 'file-input');

    const a4Grid = document.createElement('div');
    a4Grid.className = 'a4-grid';
    a4Grid.style.display = 'none';
    dropzone.appendChild(a4Grid);

    const actionContainer = document.createElement('div');
    actionContainer.className = 'action-container';
    dropzone.parentNode.insertBefore(actionContainer, dropzone.nextSibling);

    function initUI() {
        actionContainer.innerHTML = '';

        const optionsPanel = document.createElement('div');
        optionsPanel.className = 'options-panel';
        optionsPanel.innerHTML = `
            <div class="options-grid" style="grid-template-columns: 1fr;">
                <div class="input-group">
                    <label>Conversion Mode</label>
                    <select id="conversion-mode">
                        <option value="grayscale" selected>Smooth Grayscale (Best for documents with images)</option>
                        <option value="threshold">Pure Black & White (Forces all text to pure black)</option>
                    </select>
                </div>
            </div>
            
            <div class="options-grid hidden" id="threshold-container" style="grid-template-columns: 1fr;">
                <div class="input-group">
                    <label>Blackness Threshold <span id="threshold-val">128</span></label>
                    <input type="range" id="threshold-slider" min="1" max="254" value="128">
                    <span style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">Higher values force more colors to become pure black.</span>
                </div>
            </div>
            
            <div style="font-size: 0.8rem; color: var(--text-muted); text-align: center; border-top: 1px solid var(--border-subtle); padding-top: 1rem;">
                <i class="fa-solid fa-circle-info"></i> <strong>Note:</strong> To guarantee all embedded fonts and complex vectors lose their color, this tool securely flattens your pages into high-resolution monochrome images.
            </div>
        `;

        const btnGroup = document.createElement('div');
        btnGroup.className = 'button-group';
        
        const actionBtn = document.createElement('button');
        actionBtn.className = 'btn-action';
        actionBtn.id = 'btn-apply-conversion';
        actionBtn.innerHTML = '<i class="fa-solid fa-droplet-slash"></i> Convert to B&W';
        actionBtn.addEventListener('click', executeConversion);
        
        btnGroup.appendChild(actionBtn);
        actionContainer.appendChild(optionsPanel);
        actionContainer.appendChild(btnGroup);

        // Bind visibility for Threshold slider
        const modeSelect = document.getElementById('conversion-mode');
        const thresholdContainer = document.getElementById('threshold-container');
        const thresholdSlider = document.getElementById('threshold-slider');
        const thresholdVal = document.getElementById('threshold-val');

        modeSelect.addEventListener('change', () => {
            if (modeSelect.value === 'threshold') {
                thresholdContainer.classList.remove('hidden');
            } else {
                thresholdContainer.classList.add('hidden');
            }
        });

        thresholdSlider.addEventListener('input', () => {
            thresholdVal.textContent = thresholdSlider.value;
        });
    }
    initUI();

    // ==========================================
    // FILE EVENT LISTENERS 
    // ==========================================
    if (selectFilesBtn) {
        selectFilesBtn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); fileInput.click(); });
    }

    dropzone.addEventListener('click', (e) => {
        if (!activePdfFile && e.target !== fileInput) fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) { handleFile(e.target.files[0]); fileInput.value = ''; }
    });

    dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
    dropzone.addEventListener('drop', (e) => {
        e.preventDefault(); dropzone.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]);
    });

    // ==========================================
    // FILE HANDLING & UI RENDERING
    // ==========================================
    async function handleFile(file) {
        if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
            alert('Invalid format. Please select a PDF document.'); return;
        }
        activePdfFile = file;
        rawPdfBuffer = await file.arrayBuffer();
        renderFileCard();
    }

    function renderFileCard() {
        a4Grid.innerHTML = '';
        if (!activePdfFile) {
            dropzone.classList.remove('has-files');
            defaultDropzoneElements.forEach(el => el.style.display = '');
            a4Grid.style.display = 'none';
            actionContainer.style.display = 'none';
            return;
        }
        
        dropzone.classList.add('has-files');
        defaultDropzoneElements.forEach(el => el.style.display = 'none');
        a4Grid.style.display = 'flex';
        actionContainer.style.display = 'flex';

        const item = document.createElement('div');
        item.className = 'a4-card';
        item.innerHTML = `
            <button class="a4-remove" onclick="removeFile(event)" title="Remove File">
                <i class="fa-solid fa-xmark"></i>
            </button>
            <div class="a4-icon-wrapper">
                <i class="fa-solid fa-file-pdf a4-icon"></i>
            </div>
            <div class="a4-name" title="${activePdfFile.name}">${activePdfFile.name}</div>
        `;
        a4Grid.appendChild(item);
    }

    window.removeFile = function(event) {
        event.stopPropagation(); event.preventDefault();
        activePdfFile = null;
        rawPdfBuffer = null;
        renderFileCard();
    };

    window.resetTool = function() { window.location.reload(); };

    // ==========================================
    // CLIENT-SIDE IMAGE MANIPULATION (pdf.js + Canvas + pdf-lib)
    // ==========================================
    async function executeConversion() {
        if (!activePdfFile || !rawPdfBuffer) return alert('Please upload a PDF file first.');
        if (!window.pdfjsLib || !window.PDFLib) return alert('Engine is still loading. Please wait.');

        const actionBtn = document.getElementById('btn-apply-conversion');
        actionBtn.disabled = true;
        
        const mode = document.getElementById('conversion-mode').value;
        const threshold = parseInt(document.getElementById('threshold-slider').value);

        try {
            // Setup PDF.js worker
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            
            // 1. Load Original PDF for rendering
            const loadingTask = window.pdfjsLib.getDocument({ data: new Uint8Array(rawPdfBuffer) });
            const sourcePdf = await loadingTask.promise;
            const totalPages = sourcePdf.numPages;

            // 2. Create Target PDF
            const { PDFDocument } = window.PDFLib;
            const newPdf = await PDFDocument.create();

            // Setup a hidden off-screen canvas for pixel manipulation
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d', { willReadFrequently: true });

            for (let i = 1; i <= totalPages; i++) {
                actionBtn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Processing Page ${i} of ${totalPages}...`;
                
                const page = await sourcePdf.getPage(i);
                
                // Render at 2.0 scale to maintain print quality (appx 144 DPI)
                const viewport = page.getViewport({ scale: 2.0 }); 
                canvas.width = viewport.width;
                canvas.height = viewport.height;

                // Render page to canvas
                await page.render({ canvasContext: ctx, viewport: viewport }).promise;

                // Extract and manipulate Pixels
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;

                for (let p = 0; p < data.length; p += 4) {
                    const r = data[p];
                    const g = data[p + 1];
                    const b = data[p + 2];
                    
                    // Calculate Luma (Grayscale formula)
                    const luma = 0.299 * r + 0.587 * g + 0.114 * b;

                    if (mode === 'threshold') {
                        // Pure B&W Mode: If darker than threshold, make it black. Otherwise white.
                        const color = luma < threshold ? 0 : 255;
                        data[p] = data[p + 1] = data[p + 2] = color;
                    } else {
                        // Smooth Grayscale Mode
                        data[p] = data[p + 1] = data[p + 2] = luma;
                    }
                }

                // Put altered pixels back
                ctx.putImageData(imageData, 0, 0);

                // Convert Canvas to base64 JPEG (High Quality)
                const imgDataUrl = canvas.toDataURL('image/jpeg', 0.95);
                const imgBytes = await fetch(imgDataUrl).then(res => res.arrayBuffer());

                // Embed into new PDF
                const pdfImage = await newPdf.embedJpg(imgBytes);
                
                // Get original page dimensions (unscaled) for accurate output sizing
                const origViewport = page.getViewport({ scale: 1.0 });
                const newPage = newPdf.addPage([origViewport.width, origViewport.height]);
                
                newPage.drawImage(pdfImage, {
                    x: 0,
                    y: 0,
                    width: origViewport.width,
                    height: origViewport.height
                });
            }

            actionBtn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Compiling PDF...`;

            // Export New Document
            const pdfBytes = await newPdf.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            
            const baseName = activePdfFile.name.replace(/\.[^/.]+$/, "");
            const suffix = mode === 'threshold' ? 'PureBlack' : 'Grayscale';
            const finalFileName = `PDFase_${baseName}_${suffix}.pdf`;
            
            setTimeout(() => {
                document.getElementById('pdf-dropzone').style.display = 'none';
                
                actionContainer.innerHTML = `
                    <div class="success-message">
                        <i class="fa-solid fa-circle-check"></i> Conversion Complete!
                    </div>
                    <div class="file-flow">
                        <span class="file-flow-name">${activePdfFile.name}</span>
                        <i class="fa-solid fa-arrow-right" style="color: var(--theme-color); margin: 0 10px;"></i>
                        <span class="file-flow-final">${finalFileName}</span>
                    </div>
                    <div class="button-group">
                        <a href="${url}" download="${finalFileName}" class="btn-action">
                            <i class="fa-solid fa-download"></i> Download B&W PDF
                        </a>
                        <button class="btn-secondary" onclick="resetTool()">
                            <i class="fa-solid fa-rotate-right"></i> Convert Another
                        </button>
                    </div>
                `;
            }, 500);

        } catch (error) {
            console.error('Processing Error:', error);
            alert('A critical error occurred. Make sure your PDF is not encrypted.');
            actionBtn.disabled = false;
            actionBtn.innerHTML = '<i class="fa-solid fa-droplet-slash"></i> Convert to B&W';
        }
    }

}); // End of DOMContentLoaded
