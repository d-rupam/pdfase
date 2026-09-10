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
        .options-panel { background: rgba(57, 255, 20, 0.02); border: 1px solid rgba(57, 255, 20, 0.15); padding: 2rem; border-radius: 8px; display: flex; flex-direction: column; gap: 1.5rem; align-items: center; width: 100%; max-width: 650px; }
        .options-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1.5rem; width: 100%; }
        
        .input-group { display: flex; flex-direction: column; gap: 6px; text-align: left; }
        .input-group label { color: var(--text-muted); font-size: 0.85rem; font-weight: 600; font-family: 'Space Grotesk', sans-serif; }
        .input-group select, .input-group input { background: var(--bg-card); color: #fff; border: 1px solid var(--border-subtle); padding: 0.75rem 1rem; border-radius: 6px; font-family: 'JetBrains Mono', monospace; font-size: 0.95rem; outline: none; transition: border-color 0.2s; width: 100%; }
        .input-group select:focus, .input-group input:focus { border-color: var(--theme-color, #39ff14); }
        .input-group input:disabled { color: #555; background: #111; border-color: #222; cursor: not-allowed; }

        /* Action Buttons */
        .button-group { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; width: 100%; }
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
// PREDEFINED SIZES LIBRARY (in Millimeters)
// ==========================================
const PAPER_SIZES = {
    "A0": [841, 1189], "A1": [594, 841], "A2": [420, 594], "A3": [297, 420],
    "A4": [210, 297], "A5": [148, 210], "A6": [105, 148], "A7": [74, 105],
    "A8": [52, 74], "A9": [37, 52], "A10": [26, 37],
    
    "B0": [1000, 1414], "B1": [707, 1000], "B2": [500, 707], "B3": [353, 500],
    "B4": [250, 353], "B5": [176, 250], "B6": [125, 176], "B7": [88, 125],
    "B8": [62, 88], "B9": [44, 62], "B10": [31, 44],
    
    "C0": [917, 1297], "C1": [648, 917], "C2": [458, 648], "C3": [324, 458],
    "C4": [229, 324], "C5": [162, 229], "C6": [114, 162], "C7": [81, 114],
    "C8": [57, 81], "C9": [40, 57], "C10": [28, 40],
    
    "JB0": [1030, 1456], "JB1": [728, 1030], "JB2": [515, 728], "JB3": [364, 515],
    "JB4": [257, 364], "JB5": [182, 257], "JB6": [128, 182], "JB7": [91, 128],
    "JB8": [64, 91], "JB9": [45, 64], "JB10": [32, 45], "JB11": [22, 32], "JB12": [16, 22],
    
    "AB": [210, 257], "B40": [103, 182], "35": [84, 148],
    "Shiroku-ban 4": [264, 379], "Shiroku-ban 5": [189, 262], "Shiroku-ban 6": [127, 188],
    "Kiku 4": [227, 306], "Kiku 5": [151, 227],
    
    "Ledger": [431.8, 279.4], "Tabloid Extra": [304.8, 457.2], "European EDP": [304.8, 355.6],
    "Tabloid (Doble Carta)": [279.4, 431.8], "11 x 15": [279.4, 381], "Fanfold": [279.4, 377.83],
    "EDP": [279.4, 355.6], "11 x 12": [279.4, 304.8], "10 x 14": [254, 355.6],
    "10 x 13": [254, 330.2], "10 x 11": [254, 279.4], "Legal Extra": [241.3, 381],
    "Letter Extra": [241.3, 304.8], "Letter Tab": [228.6, 279.4], "Government Legal": [203.2, 330.2],
    "Government Letter": [203.2, 254], "Junior Legal": [127, 203.2],
    
    "Arch A": [228.6, 304.8], "Arch B": [304.8, 457.2], "Arch C": [457.2, 609.6],
    "Arch D": [609.6, 914.4], "Arch E": [914.4, 1219.2], "Arch E1": [762, 1066.8],
    "Arch E2": [660.4, 965.2], "Arch E3": [685.8, 990.6]
};

const MM_TO_PT = 2.834645669;
const IN_TO_PT = 72;

// ==========================================
// STATE MANAGEMENT & DOM SETUP
// ==========================================
document.addEventListener('DOMContentLoaded', () => {

    let activePdfFile = null; 

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

    function initConvertUI() {
        actionContainer.innerHTML = '';
        
        // Generate options HTML for presets
        let presetOptions = `<option value="Custom">Custom Size</option>`;
        for (const [name, dims] of Object.entries(PAPER_SIZES)) {
            const isA4 = name === "A4" ? "selected" : "";
            presetOptions += `<option value="${name}" ${isA4}>${name} (${dims[0]} x ${dims[1]} mm)</option>`;
        }

        const optionsPanel = document.createElement('div');
        optionsPanel.className = 'options-panel';
        optionsPanel.innerHTML = `
            <div class="options-grid" style="grid-template-columns: 1fr;">
                <div class="input-group">
                    <label>Target Page Size</label>
                    <select id="preset-size-select">
                        ${presetOptions}
                    </select>
                </div>
            </div>

            <div class="options-grid">
                <div class="input-group">
                    <label>Width</label>
                    <input type="number" id="input-width" value="210" step="0.1" disabled>
                </div>
                <div class="input-group">
                    <label>Height</label>
                    <input type="number" id="input-height" value="297" step="0.1" disabled>
                </div>
                <div class="input-group">
                    <label>Unit</label>
                    <select id="unit-select">
                        <option value="mm" selected>Millimeters (mm)</option>
                        <option value="in">Inches (in)</option>
                        <option value="pt">Points (pt)</option>
                    </select>
                </div>
            </div>
            
            <div class="options-grid" style="grid-template-columns: 1fr;">
                <div class="input-group">
                    <label>Scaling Mode</label>
                    <select id="scale-mode-select">
                        <option value="fit" selected>Scale to Fit & Center (No Distortion)</option>
                        <option value="stretch">Stretch to Fill (May distort content)</option>
                    </select>
                </div>
            </div>
        `;

        const btnGroup = document.createElement('div');
        btnGroup.className = 'button-group';
        
        const actionBtn = document.createElement('button');
        actionBtn.className = 'btn-action';
        actionBtn.id = 'btn-apply-resize';
        actionBtn.innerHTML = '<i class="fa-solid fa-maximize"></i> Resize Document';
        actionBtn.addEventListener('click', executeResize);
        
        btnGroup.appendChild(actionBtn);
        actionContainer.appendChild(optionsPanel);
        actionContainer.appendChild(btnGroup);

        // Bind Dynamic Inputs
        const presetSelect = document.getElementById('preset-size-select');
        const unitSelect = document.getElementById('unit-select');
        const inputWidth = document.getElementById('input-width');
        const inputHeight = document.getElementById('input-height');

        function updateInputs() {
            const preset = presetSelect.value;
            const unit = unitSelect.value;
            
            if (preset === "Custom") {
                inputWidth.disabled = false;
                inputHeight.disabled = false;
            } else {
                inputWidth.disabled = true;
                inputHeight.disabled = true;
                
                let dimsMM = PAPER_SIZES[preset];
                let w = dimsMM[0];
                let h = dimsMM[1];

                if (unit === "in") {
                    w = w / 25.4;
                    h = h / 25.4;
                } else if (unit === "pt") {
                    w = w * MM_TO_PT;
                    h = h * MM_TO_PT;
                }

                inputWidth.value = w.toFixed(2);
                inputHeight.value = h.toFixed(2);
            }
        }

        presetSelect.addEventListener('change', updateInputs);
        unitSelect.addEventListener('change', updateInputs);
    }
    initConvertUI();

    // ==========================================
    // 3. FILE EVENT LISTENERS 
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

    window.addEventListener('paste', (e) => {
        if (e.clipboardData && e.clipboardData.files.length > 0) handleFile(e.clipboardData.files[0]);
    });

    // ==========================================
    // 4. FILE HANDLING & UI RENDERING
    // ==========================================
    function handleFile(file) {
        if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
            alert('Invalid format. Please select a PDF document.');
            return;
        }
        activePdfFile = file;
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
        renderFileCard();
    };

    window.resetTool = function() { window.location.reload(); };

    // ==========================================
    // 5. CLIENT-SIDE RESIZING LOGIC (pdf-lib)
    // ==========================================
    async function executeResize() {
        if (!activePdfFile) return alert('Please upload a PDF file first.');
        if (!window.PDFLib) return alert('Engine is still loading. Please wait a moment.');

        const actionBtn = document.getElementById('btn-apply-resize');
        
        // Calculate Target dimensions in Points
        const widthVal = parseFloat(document.getElementById('input-width').value);
        const heightVal = parseFloat(document.getElementById('input-height').value);
        const unit = document.getElementById('unit-select').value;
        const scaleMode = document.getElementById('scale-mode-select').value;
        
        if (!widthVal || !heightVal || widthVal <= 0 || heightVal <= 0) {
            return alert('Please enter valid dimensions.');
        }

        let targetWidthPt, targetHeightPt;
        if (unit === 'mm') {
            targetWidthPt = widthVal * MM_TO_PT;
            targetHeightPt = heightVal * MM_TO_PT;
        } else if (unit === 'in') {
            targetWidthPt = widthVal * IN_TO_PT;
            targetHeightPt = heightVal * IN_TO_PT;
        } else {
            targetWidthPt = widthVal;
            targetHeightPt = heightVal;
        }
        
        try {
            actionBtn.disabled = true;
            actionBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Processing...';

            const arrayBuffer = await activePdfFile.arrayBuffer();
            const { PDFDocument } = window.PDFLib;
            
            const originalPdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
            const origPages = originalPdf.getPages();
            
            // To prevent metadata loss or corruption, we create a new PDF and embed the original pages
            const newPdf = await PDFDocument.create();

            for (let i = 0; i < origPages.length; i++) {
                // Create a blank page with the target dimensions
                const newPage = newPdf.addPage([targetWidthPt, targetHeightPt]);
                
                // Embed the original page as an image/object
                const embeddedPage = await newPdf.embedPage(origPages[i]);
                const { width: origW, height: origH } = embeddedPage;

                let drawOpts = {};

                if (scaleMode === 'stretch') {
                    drawOpts = { x: 0, y: 0, width: targetWidthPt, height: targetHeightPt };
                } else {
                    // Fit and Center Proportional Scaling
                    const scaleFactor = Math.min(targetWidthPt / origW, targetHeightPt / origH);
                    const scaledW = origW * scaleFactor;
                    const scaledH = origH * scaleFactor;
                    
                    const xOffset = (targetWidthPt - scaledW) / 2;
                    const yOffset = (targetHeightPt - scaledH) / 2;
                    
                    drawOpts = { x: xOffset, y: yOffset, width: scaledW, height: scaledH };
                }

                newPage.drawImage(embeddedPage, drawOpts);
            }

            const pdfBytes = await newPdf.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            
            const baseName = activePdfFile.name.replace(/\.[^/.]+$/, "");
            const finalFileName = `PDFase_${baseName}_Resized.pdf`;
            
            setTimeout(() => {
                document.getElementById('pdf-dropzone').style.display = 'none';
                
                actionContainer.innerHTML = `
                    <div class="success-message">
                        <i class="fa-solid fa-circle-check"></i> Resize Complete!
                    </div>
                    <div class="file-flow">
                        <span class="file-flow-name">${activePdfFile.name}</span>
                        <i class="fa-solid fa-arrow-right" style="color: var(--theme-color); margin: 0 10px;"></i>
                        <span class="file-flow-final">${finalFileName}</span>
                    </div>
                    <div class="button-group">
                        <a href="${url}" download="${finalFileName}" class="btn-action">
                            <i class="fa-solid fa-download"></i> Download PDF
                        </a>
                        <button class="btn-secondary" onclick="resetTool()">
                            <i class="fa-solid fa-rotate-right"></i> Resize Another
                        </button>
                    </div>
                `;
            }, 500);

        } catch (error) {
            console.error('Processing Error:', error);
            alert('A critical error occurred. Error: ' + error.message);
            actionBtn.disabled = false;
            actionBtn.innerHTML = '<i class="fa-solid fa-maximize"></i> Resize Document';
        }
    }

}); // End of DOMContentLoaded
