// ==========================================
// 1. INJECT DEPENDENCIES & STYLES (COMPRESS PDF)
// ==========================================
(function initEnvironment() {
    // 1. pdf-lib for building the final optimized PDF
    if (!window.PDFLib) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js';
        document.head.appendChild(script);
    }

    // 2. pdf.js for rendering and rasterizing the original PDF
    if (!window.pdfjsLib) {
        const pdfScript = document.createElement('script');
        pdfScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        document.head.appendChild(pdfScript);
    }

    const style = document.createElement('style');
    style.innerHTML = `
        /* Dynamic Dropzone Shrinking */
        .dropzone { transition: padding 0.3s ease, min-height 0.3s ease; -webkit-tap-highlight-color: transparent; cursor: pointer; }
        .dropzone.has-files { padding: 1.25rem 1rem 0.25rem 1rem !important; margin-bottom: 0 !important; cursor: default; }

        /* A4 Grid Layout for the selected file */
        .a4-grid { display: flex; flex-wrap: wrap; gap: 0.75rem; justify-content: center; width: 100%; padding: 0; margin: 0; }
        
        .a4-card { width: 120px; height: 160px; background-color: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 6px; position: relative; padding: 10px; text-align: center; display: block; transition: all 0.2s ease; box-shadow: 0 4px 10px rgba(0,0,0,0.2); user-select: none; }
        .a4-card:hover { border-color: rgba(255, 191, 0, 0.5); transform: translateY(-3px); box-shadow: 0 6px 15px rgba(255, 191, 0, 0.15); }
        
        .a4-icon-wrapper { height: 90px; display: flex; align-items: center; justify-content: center; width: 100%; }
        .a4-icon { font-size: 2.5rem; color: var(--theme-color, #ffbf00); transition: color 0.2s; }
        
        .a4-name { font-size: 0.75rem; color: var(--text-main); font-weight: 500; width: 100%; height: 38px; margin-top: 5px; padding-top: 6px; border-top: 1px solid rgba(255, 255, 255, 0.05); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis; white-space: normal; line-height: 1.3; word-break: break-word; }
        
        .a4-remove { position: absolute; top: -8px; right: -8px; background: #ff3366; color: #fff; border: none; border-radius: 50%; width: 22px; height: 22px; font-size: 0.75rem; cursor: pointer; display: flex; justify-content: center; align-items: center; box-shadow: 0 2px 5px rgba(0,0,0,0.4); z-index: 10; transition: transform 0.2s; }
        .a4-remove:hover { transform: scale(1.1); }

        /* Action Container */
        .action-container { margin-top: 1rem !important; margin-bottom: 3rem; display: none; gap: 1rem; justify-content: center; flex-direction: column; align-items: center; animation: fadeIn 0.4s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        .button-group { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; width: 100%; }
        
        /* Options Panel for Compression Settings */
        .options-panel { background: rgba(255, 191, 0, 0.02); border: 1px solid rgba(255, 191, 0, 0.15); padding: 1.5rem; border-radius: 8px; display: flex; flex-direction: column; gap: 1.25rem; align-items: stretch; width: 100%; max-width: 500px; font-family: 'Space Grotesk', sans-serif; position: relative; }
        
        .settings-row { display: flex; flex-direction: column; gap: 8px; }
        .settings-header { display: flex; justify-content: space-between; align-items: center; color: var(--text-main); font-size: 0.9rem; font-weight: 600; }
        .settings-header span { color: var(--theme-color); font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; }
        
        /* Custom Range Slider */
        input[type="range"] { -webkit-appearance: none; width: 100%; background: transparent; cursor: pointer; }
        input[type="range"]::-webkit-slider-runnable-track { width: 100%; height: 6px; background: rgba(255, 255, 255, 0.1); border-radius: 3px; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; height: 16px; width: 16px; border-radius: 50%; background: var(--theme-color); margin-top: -5px; box-shadow: 0 0 10px rgba(255, 191, 0, 0.5); }
        
        /* Target Size Input Group */
        .target-size-wrapper { display: flex; gap: 10px; align-items: center; }
        .target-size-wrapper input[type="number"] { background: var(--bg-card); color: var(--text-main); border: 1px solid var(--border-subtle); padding: 0.6rem; border-radius: 6px; font-family: 'JetBrains Mono', monospace; font-size: 0.95rem; outline: none; width: 100%; transition: border-color 0.2s; }
        .target-size-wrapper input[type="number"]:focus { border-color: var(--theme-color); }
        .target-size-wrapper select { background: var(--bg-card); color: var(--text-main); border: 1px solid var(--border-subtle); padding: 0.6rem; border-radius: 6px; font-family: 'Space Grotesk', sans-serif; font-size: 0.9rem; outline: none; cursor: pointer; }

        /* Checkboxes */
        .checkbox-group { display: flex; align-items: center; gap: 8px; margin-top: 5px; cursor: pointer; }
        .checkbox-group input { accent-color: var(--theme-color); width: 16px; height: 16px; cursor: pointer; }
        .checkbox-group label { color: var(--text-main); font-size: 0.85rem; cursor: pointer; user-select: none; }

        /* Progress Bar UI */
        .progress-wrapper { width: 100%; display: none; flex-direction: column; gap: 8px; margin-top: 10px; }
        .progress-text { font-size: 0.85rem; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; text-align: center; }
        .progress-track { width: 100%; height: 6px; background: rgba(255, 255, 255, 0.1); border-radius: 3px; overflow: hidden; }
        .progress-fill { height: 100%; width: 0%; background: var(--theme-color, #ffbf00); transition: width 0.2s ease; }

        .btn-action { background-color: #e6ac00; color: #050505; border: none; padding: 0.85rem 2.5rem; font-size: 1.05rem; font-weight: 700; font-family: 'Space Grotesk', sans-serif; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(230, 172, 0, 0.2); text-decoration: none; display: inline-flex; align-items: center; gap: 8px; }
        .btn-action:hover { background-color: #ffbf00; transform: translateY(-2px); box-shadow: 0 6px 20px rgba(255, 191, 0, 0.35); }
        .btn-action:disabled { background-color: #222; color: #666; cursor: not-allowed; transform: none; box-shadow: none; }
        
        .btn-secondary { background-color: transparent; color: var(--text-main); border: 1px solid var(--border-subtle); padding: 0.85rem 1.75rem; font-size: 0.95rem; font-weight: 600; font-family: 'Space Grotesk', sans-serif; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; }
        .btn-secondary:hover { border-color: var(--theme-color, #ffbf00); color: var(--theme-color, #ffbf00); background-color: rgba(255, 191, 0, 0.05); }
        
        .success-message { width: 100%; text-align: center; color: var(--theme-color, #ffbf00); font-size: 1.2rem; font-weight: 600; margin-bottom: 0.25rem; }
        .file-flow { color: var(--text-muted); font-size: 0.85rem; margin-bottom: 1rem; display: flex; align-items: center; justify-content: center; gap: 8px; flex-wrap: wrap; background: rgba(255, 191, 0, 0.03); padding: 10px 20px; border-radius: 8px; border: 1px solid rgba(255, 191, 0, 0.2); text-align: center; max-width: 100%; word-break: break-word; }
        .file-flow-name { color: var(--text-main); font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; }
        .file-flow-final { color: #fff; font-weight: 700; border-bottom: 1px dashed var(--theme-color, #ffbf00); font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; }
        
        .size-badge { background: rgba(255, 191, 0, 0.15); color: var(--theme-color); padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: bold; }
    `;
    document.head.appendChild(style);
})();

// ==========================================
// 2. STATE MANAGEMENT & DOM SETUP
// ==========================================
document.addEventListener('DOMContentLoaded', () => {

    let activePdfFile = null; 
    let originalSizeBytes = 0;

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

    // Format bytes helper
    function formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    function initCompressUI() {
        actionContainer.innerHTML = '';
        
        const optionsPanel = document.createElement('div');
        optionsPanel.className = 'options-panel';
        optionsPanel.innerHTML = `
            <!-- Original Size Indicator -->
            <div style="text-align: center; color: var(--text-muted); font-size: 0.85rem; margin-bottom: -5px;">
                Original Size: <strong id="orig-size-display" style="color: #fff;">0 MB</strong>
            </div>

            <!-- Quality Slider -->
            <div class="settings-row">
                <div class="settings-header">
                    <label><i class="fa-solid fa-image"></i> Image Quality</label>
                    <span id="quality-val">60%</span>
                </div>
                <input type="range" id="compress-quality" min="10" max="100" value="60">
            </div>

            <!-- Resolution Slider -->
            <div class="settings-row">
                <div class="settings-header">
                    <label><i class="fa-solid fa-compress"></i> Resolution (DPI)</label>
                    <span id="scale-val">Standard</span>
                </div>
                <input type="range" id="compress-scale" min="1" max="3" value="2" step="1">
            </div>

            <!-- Grayscale & Needed Size -->
            <div style="display: flex; gap: 20px; flex-wrap: wrap; margin-top: 10px; align-items: flex-end;">
                <div style="flex: 1; min-width: 150px;">
                    <div class="settings-header" style="margin-bottom: 8px;">
                        <label><i class="fa-solid fa-bullseye"></i> Target Size (Optional)</label>
                    </div>
                    <div class="target-size-wrapper">
                        <input type="number" id="target-size-input" placeholder="e.g. 2">
                        <select id="target-size-unit">
                            <option value="KB">KB</option>
                            <option value="MB" selected>MB</option>
                        </select>
                    </div>
                </div>

                <div class="checkbox-group" style="padding-bottom: 8px;">
                    <input type="checkbox" id="compress-grayscale">
                    <label for="compress-grayscale">Convert to Grayscale (Saves Space)</label>
                </div>
            </div>

            <!-- Progress UI -->
            <div class="progress-wrapper" id="compress-progress-wrapper">
                <div class="progress-text" id="compress-progress-text">Initializing Engine...</div>
                <div class="progress-track">
                    <div class="progress-fill" id="compress-progress-fill"></div>
                </div>
            </div>
            
            <div style="font-size: 0.75rem; color: var(--text-muted); text-align: center; margin-top: 5px;">
                Note: Client-side compression works by rasterizing document pages into highly optimized JPEGs.
            </div>
        `;

        const btnGroup = document.createElement('div');
        btnGroup.className = 'button-group';
        
        const actionBtn = document.createElement('button');
        actionBtn.className = 'btn-action';
        actionBtn.innerHTML = '<i class="fa-solid fa-minimize"></i> Compress PDF';
        actionBtn.addEventListener('click', executeCompression);
        
        btnGroup.appendChild(actionBtn);
        actionContainer.appendChild(optionsPanel);
        actionContainer.appendChild(btnGroup);

        // Bind Sliders to Labels
        const qSlider = optionsPanel.querySelector('#compress-quality');
        const qVal = optionsPanel.querySelector('#quality-val');
        qSlider.addEventListener('input', () => qVal.innerText = qSlider.value + '%');

        const sSlider = optionsPanel.querySelector('#compress-scale');
        const sVal = optionsPanel.querySelector('#scale-val');
        sSlider.addEventListener('input', () => {
            if (sSlider.value == 1) sVal.innerText = 'Low (Smallest)';
            if (sSlider.value == 2) sVal.innerText = 'Standard';
            if (sSlider.value == 3) sVal.innerText = 'High (Largest)';
        });
    }

    initCompressUI();

    // ==========================================
    // 3. FILE EVENT LISTENERS
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
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'););
    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]);
    });

    window.addEventListener('paste', (e) => {
        if (e.clipboardData && e.clipboardData.files.length > 0) handleFile(e.clipboardData.files[0]);
    });

    function handleFile(file) {
        if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
            alert('Invalid format. Please select a PDF document.');
            return;
        }
        activePdfFile = file;
        originalSizeBytes = file.size;
        renderFileCard();
        
        const origSizeDisplay = document.getElementById('orig-size-display');
        if(origSizeDisplay) origSizeDisplay.innerText = formatBytes(originalSizeBytes);
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
        activePdfFile = null; originalSizeBytes = 0;
        renderFileCard();
    };

    window.resetTool = function() { window.location.reload(); };

    // ==========================================
    // 4. CLIENT-SIDE COMPRESSION LOGIC
    // ==========================================
    async function executeCompression() {
        if (!activePdfFile) return alert('Please upload a PDF file first.');
        if (!window.pdfjsLib || !window.PDFLib) return alert('Engines are still loading. Please wait.');

        const actionBtn = actionContainer.querySelector('.btn-action');
        const progressWrapper = document.getElementById('compress-progress-wrapper');
        const progressText = document.getElementById('compress-progress-text');
        const progressFill = document.getElementById('compress-progress-fill');

        // Grab User Settings
        let quality = parseInt(document.getElementById('compress-quality').value) / 100;
        let scaleLvl = parseInt(document.getElementById('compress-scale').value); // 1, 2, or 3
        const isGrayscale = document.getElementById('compress-grayscale').checked;
        const targetInput = document.getElementById('target-size-input').value;
        const targetUnit = document.getElementById('target-size-unit').value;

        // Target Size Override Algorithm (Estimation)
        if (targetInput && !isNaN(targetInput) && targetInput > 0) {
            let targetBytes = parseFloat(targetInput) * (targetUnit === 'MB' ? 1048576 : 1024);
            let ratio = targetBytes / originalSizeBytes;
            
            if (ratio >= 1) {
                alert("Target size is larger than the original file!");
                return;
            }
            
            // Adjust quality and scale strictly based on requested ratio
            if (ratio < 0.2) { scaleLvl = 1; quality = 0.3; }
            else if (ratio < 0.5) { scaleLvl = 1; quality = 0.5; }
            else if (ratio < 0.8) { scaleLvl = 2; quality = 0.6; }
            else { scaleLvl = 2; quality = 0.8; }
            
            console.log(`Target Mode override: Scale set to ${scaleLvl}, Quality to ${quality}`);
        }

        // Map Scale Level to DPI float
        const viewportScale = scaleLvl === 1 ? 1.0 : (scaleLvl === 2 ? 1.5 : 2.0);

        try {
            actionBtn.disabled = true;
            actionBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Compressing...';
            progressWrapper.style.display = 'flex';

            // 1. Setup PDF.js Worker
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            const arrayBuffer = await activePdfFile.arrayBuffer();
            const loadingTask = window.pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
            const sourcePdf = await loadingTask.promise;
            const totalPages = sourcePdf.numPages;

            // 2. Setup PDF-lib Target Document
            const { PDFDocument } = window.PDFLib;
            const newPdf = await PDFDocument.create();

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d', { willReadFrequently: true });

            // 3. Iterate over and compress pages
            for (let i = 1; i <= totalPages; i++) {
                progressText.innerText = `Processing Page ${i} of ${totalPages}...`;
                progressFill.style.width = \`\${(i / totalPages) * 100}%\`;
                
                const page = await sourcePdf.getPage(i);
                const viewport = page.getViewport({ scale: viewportScale }); 
                canvas.width = viewport.width;
                canvas.height = viewport.height;

                // Render page to canvas
                await page.render({ canvasContext: ctx, viewport: viewport }).promise;

                // Apply Grayscale Filter if selected
                if (isGrayscale) {
                    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const data = imgData.data;
                    for (let j = 0; j < data.length; j += 4) {
                        const avg = (data[j] + data[j + 1] + data[j + 2]) / 3;
                        data[j] = avg;       // Red
                        data[j + 1] = avg;   // Green
                        data[j + 2] = avg;   // Blue
                    }
                    ctx.putImageData(imgData, 0, 0);
                }

                // Compress canvas to JPEG Data URL
                const imgDataUrl = canvas.toDataURL('image/jpeg', quality);
                const imgBytes = await fetch(imgDataUrl).then(res => res.arrayBuffer());

                // Embed into new PDF
                const pdfImage = await newPdf.embedJpg(imgBytes);
                const origViewport = page.getViewport({ scale: 1.0 }); // Keep original physical size
                
                const newPage = newPdf.addPage([origViewport.width, origViewport.height]);
                newPage.drawImage(pdfImage, {
                    x: 0,
                    y: 0,
                    width: origViewport.width,
                    height: origViewport.height
                });
            }

            progressText.innerText = "Finalizing File...";

            // Export compressed document
            const pdfBytes = await newPdf.save();
            const newSizeBytes = pdfBytes.length;
            const sizeSaved = originalSizeBytes - newSizeBytes;
            const percentageSaved = Math.max(0, ((sizeSaved / originalSizeBytes) * 100).toFixed(1));

            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            
            const baseName = activePdfFile.name.replace(/\.[^/.]+$/, "");
            const finalFileName = `PDFase_${baseName}_Compressed.pdf`;
            
            setTimeout(() => {
                document.getElementById('pdf-dropzone').style.display = 'none';
                
                actionContainer.innerHTML = `
                    <div class="success-message">
                        <i class="fa-solid fa-circle-check"></i> Compression Complete!
                    </div>
                    <div class="file-flow" style="flex-direction: column; gap: 15px; padding: 20px;">
                        <div style="display: flex; align-items: center; justify-content: center; gap: 15px; flex-wrap: wrap;">
                            <div style="text-align: center;">
                                <div class="file-flow-name" style="color: var(--text-muted); margin-bottom: 5px;">Original</div>
                                <div class="size-badge" style="background: rgba(255, 255, 255, 0.1); color: #fff;">${formatBytes(originalSizeBytes)}</div>
                            </div>
                            <i class="fa-solid fa-arrow-right" style="color: var(--theme-color);"></i>
                            <div style="text-align: center;">
                                <div class="file-flow-final" style="margin-bottom: 5px;">Compressed</div>
                                <div class="size-badge">${formatBytes(newSizeBytes)}</div>
                            </div>
                        </div>
                        <div style="color: #34d399; font-weight: bold; font-size: 0.95rem;">
                            <i class="fa-solid fa-arrow-trend-down"></i> Saved ${percentageSaved}%
                        </div>
                    </div>
                    <div class="button-group">
                        <a href="${url}" download="${finalFileName}" class="btn-action">
                            <i class="fa-solid fa-download"></i> Download PDF
                        </a>
                        <button class="btn-secondary" onclick="resetTool()">
                            <i class="fa-solid fa-rotate-right"></i> Compress Another
                        </button>
                    </div>
                `;
            }, 600);

        } catch (error) {
            console.error('Compression Error:', error);
            alert('A critical error occurred while compressing the PDF.');
            actionBtn.disabled = false;
            actionBtn.innerHTML = '<i class="fa-solid fa-minimize"></i> Compress PDF';
            progressWrapper.style.display = 'none';
        }
    }

}); // End of DOMContentLoaded
