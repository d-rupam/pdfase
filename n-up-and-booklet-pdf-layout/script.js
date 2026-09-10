// ==========================================
// 1. INJECT DEPENDENCIES & STYLES
// ==========================================
(function initEnvironment() {
    // Inject pdf-lib for editing and rebuilding the PDF
    if (!window.PDFLib) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js';
        document.head.appendChild(script);
    }

    const style = document.createElement('style');
    style.innerHTML = `
        /* Dynamic Dropzone Shrinking */
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
        .options-panel { background: rgba(57, 255, 20, 0.02); border: 1px solid rgba(57, 255, 20, 0.15); padding: 2rem; border-radius: 8px; display: flex; flex-direction: column; gap: 1.5rem; width: 100%; max-width: 800px; }
        .options-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; width: 100%; }
        
        .input-group { display: flex; flex-direction: column; gap: 6px; text-align: left; }
        .input-group label { color: var(--text-muted); font-size: 0.85rem; font-weight: 600; font-family: 'Space Grotesk', sans-serif; }
        .input-group select { background: var(--bg-card); color: #fff; border: 1px solid var(--border-subtle); padding: 0.75rem 1rem; border-radius: 6px; font-family: 'JetBrains Mono', monospace; font-size: 0.95rem; outline: none; transition: border-color 0.2s; width: 100%; cursor: pointer; }
        .input-group select:focus { border-color: var(--theme-color, #39ff14); }

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

    function initLayoutUI() {
        actionContainer.innerHTML = '';

        const optionsPanel = document.createElement('div');
        optionsPanel.className = 'options-panel';
        optionsPanel.innerHTML = `
            <div class="options-grid">
                <div class="input-group">
                    <label>Layout Mode</label>
                    <select id="layout-mode">
                        <option value="nup" selected>N-up Pages</option>
                        <option value="booklet">Booklet</option>
                    </select>
                </div>
                <div class="input-group">
                    <label>Pages Per Sheet</label>
                    <select id="pages-per-sheet">
                        <option value="2" selected>2 Pages</option>
                        <option value="4">4 Pages</option>
                        <option value="6">6 Pages</option>
                        <option value="9">9 Pages</option>
                        <option value="16">16 Pages</option>
                    </select>
                </div>
            </div>

            <div class="options-grid hidden" id="booklet-extras">
                <div class="input-group">
                    <label>Reading Order</label>
                    <select id="reading-order">
                        <option value="ltr" selected>Left to Right</option>
                        <option value="rtl">Right to Left (Manga)</option>
                    </select>
                </div>
                <div class="input-group">
                    <label>Pages Per Signature</label>
                    <select id="signature-size">
                        <option value="all" selected>All pages (Single Booklet)</option>
                        <option value="8">8 Pages</option>
                        <option value="12">12 Pages</option>
                        <option value="16">16 Pages</option>
                        <option value="20">20 Pages</option>
                        <option value="24">24 Pages</option>
                        <option value="32">32 Pages</option>
                    </select>
                </div>
            </div>

            <div class="options-grid">
                <div class="input-group">
                    <label>Target Paper Size</label>
                    <select id="paper-size">
                        <option value="auto" selected>Automatic (Source Size)</option>
                        <option value="a3">A3</option>
                        <option value="a4">A4</option>
                        <option value="a5">A5</option>
                        <option value="letter">US Letter</option>
                        <option value="legal">US Legal</option>
                    </select>
                </div>
                <div class="input-group">
                    <label>Outer Margin</label>
                    <select id="outer-margin">
                        <option value="0" selected>0 mm</option>
                        <option value="5">5 mm</option>
                        <option value="10">10 mm</option>
                        <option value="15">15 mm</option>
                    </select>
                </div>
                <div class="input-group">
                    <label>Center Gutter</label>
                    <select id="center-gutter">
                        <option value="0" selected>0 mm</option>
                        <option value="3">3 mm</option>
                        <option value="5">5 mm</option>
                        <option value="10">10 mm</option>
                    </select>
                </div>
            </div>
        `;

        const btnGroup = document.createElement('div');
        btnGroup.className = 'button-group';
        
        const actionBtn = document.createElement('button');
        actionBtn.className = 'btn-action';
        actionBtn.id = 'btn-generate-layout';
        actionBtn.innerHTML = '<i class="fa-solid fa-layer-group"></i> Generate Layout';
        actionBtn.addEventListener('click', executeLayout);
        
        btnGroup.appendChild(actionBtn);
        actionContainer.appendChild(optionsPanel);
        actionContainer.appendChild(btnGroup);

        // Bind visibility toggle for Booklet extras
        const layoutModeSelect = document.getElementById('layout-mode');
        const bookletExtras = document.getElementById('booklet-extras');

        layoutModeSelect.addEventListener('change', () => {
            if (layoutModeSelect.value === 'booklet') {
                bookletExtras.classList.remove('hidden');
            } else {
                bookletExtras.classList.add('hidden');
            }
        });
    }
    initLayoutUI();

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
    // 5. CLIENT-SIDE LAYOUT ENGINE (pdf-lib)
    // ==========================================
    async function executeLayout() {
        if (!activePdfFile) return alert('Please upload a PDF file first.');
        if (!window.PDFLib) return alert('Engine is still loading. Please wait a moment.');

        const actionBtn = document.getElementById('btn-generate-layout');
        actionBtn.disabled = true;
        actionBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Processing Layout...';

        try {
            // Get Config
            const layoutMode = document.getElementById('layout-mode').value;
            const nUp = parseInt(document.getElementById('pages-per-sheet').value);
            const readingOrder = document.getElementById('reading-order').value;
            const signatureSize = document.getElementById('signature-size').value;
            const paperSize = document.getElementById('paper-size').value;
            const marginMM = parseInt(document.getElementById('outer-margin').value);
            const gutterMM = parseInt(document.getElementById('center-gutter').value);

            // Convert mm to points
            const mmToPt = 2.83465;
            const marginPt = marginMM * mmToPt;
            const gutterPt = gutterMM * mmToPt;

            const arrayBuffer = await activePdfFile.arrayBuffer();
            const { PDFDocument } = window.PDFLib;
            const origPdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
            const origPages = origPdf.getPages();
            const totalOrigPages = origPages.length;

            // Step 1: Calculate Grid (Cols & Rows)
            let cols = 1, rows = 1;
            switch(nUp) {
                case 2: cols = 2; rows = 1; break;
                case 4: cols = 2; rows = 2; break;
                case 6: cols = 2; rows = 3; break; 
                case 9: cols = 3; rows = 3; break;
                case 16: cols = 4; rows = 4; break;
            }

            // Step 2: Generate Sequence Array
            let seq = [];
            if (layoutMode === 'booklet') {
                // Booklet padding (must be multiple of 4)
                let paddedTotal = totalOrigPages;
                while (paddedTotal % 4 !== 0) paddedTotal++;

                let S = signatureSize === 'all' ? paddedTotal : parseInt(signatureSize);
                let currentStart = 1;

                while (currentStart <= paddedTotal) {
                    let end = currentStart + S - 1;
                    if (end > paddedTotal) {
                        end = paddedTotal;
                    }
                    let chunkTotal = end - currentStart + 1;
                    while (chunkTotal % 4 !== 0) { chunkTotal++; end++; } 

                    for (let i = 0; i < chunkTotal / 4; i++) {
                        let left1 = end - 2 * i;
                        let right1 = currentStart + 2 * i;
                        let left2 = currentStart + 2 * i + 1;
                        let right2 = end - 2 * i - 1;

                        if (readingOrder === 'rtl') {
                            seq.push(right1, left1, right2, left2);
                        } else {
                            seq.push(left1, right1, left2, right2);
                        }
                    }
                    currentStart += chunkTotal;
                }
            } else {
                // Normal N-up
                for (let i = 1; i <= totalOrigPages; i++) seq.push(i);
            }

            // Create Output PDF
            const newPdf = await PDFDocument.create();

            // Determine Target Sheet Dimensions based on first page
            const firstOrigPage = origPages[0];
            const { width: origW, height: origH } = firstOrigPage.getSize();
            let sheetW, sheetH;

            if (paperSize === 'auto') {
                sheetW = origW * cols;
                sheetH = origH * rows;
            } else {
                const sizes = {
                    'a3': [841.89, 1190.55],
                    'a4': [595.28, 841.89],
                    'a5': [420.94, 595.28],
                    'letter': [612, 792],
                    'legal': [612, 1008]
                };
                sheetW = sizes[paperSize][0];
                sheetH = sizes[paperSize][1];
                
                // Auto rotate to match grid ratio perfectly
                if (cols > rows && sheetW < sheetH) {
                    let temp = sheetW; sheetW = sheetH; sheetH = temp; // Landscape
                } else if (rows > cols && sheetH < sheetW) {
                    let temp = sheetW; sheetW = sheetH; sheetH = temp; // Portrait
                }
            }

            // Cell math
            const usableW = sheetW - (2 * marginPt);
            const usableH = sheetH - (2 * marginPt);
            const cellW = (usableW - ((cols - 1) * gutterPt)) / cols;
            const cellH = (usableH - ((rows - 1) * gutterPt)) / rows;

            // Step 3: Draw Sequence into Sheets
            for (let i = 0; i < seq.length; i += nUp) {
                const sheetPage = newPdf.addPage([sheetW, sheetH]);
                
                for (let j = 0; j < nUp; j++) {
                    const pageNum = seq[i + j];
                    
                    if (pageNum && pageNum <= totalOrigPages) {
                        const embedPage = await newPdf.embedPage(origPages[pageNum - 1]);
                        
                        const col = j % cols;
                        const row = Math.floor(j / cols);
                        
                        const cellX = marginPt + col * (cellW + gutterPt);
                        // PDF Y is bottom-up
                        const cellY = sheetH - marginPt - (row + 1) * cellH - (row * gutterPt);

                        // Scale to fit inside the cell proportionally
                        const scale = Math.min(cellW / embedPage.width, cellH / embedPage.height);
                        const scaledW = embedPage.width * scale;
                        const scaledH = embedPage.height * scale;
                        
                        // Center within cell
                        const dx = cellX + (cellW - scaledW) / 2;
                        const dy = cellY + (cellH - scaledH) / 2;

                        sheetPage.drawImage(embedPage, {
                            x: dx,
                            y: dy,
                            width: scaledW,
                            height: scaledH
                        });
                    }
                }
            }

            // Step 4: Export
            const pdfBytes = await newPdf.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            
            const baseName = activePdfFile.name.replace(/\.[^/.]+$/, "");
            const suffix = layoutMode === 'booklet' ? 'Booklet' : `${nUp}Up`;
            const finalFileName = `PDFase_${baseName}_${suffix}.pdf`;
            
            setTimeout(() => {
                document.getElementById('pdf-dropzone').style.display = 'none';
                
                actionContainer.innerHTML = `
                    <div class="success-message">
                        <i class="fa-solid fa-circle-check"></i> Layout Generated!
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
                            <i class="fa-solid fa-rotate-right"></i> Format Another
                        </button>
                    </div>
                `;
            }, 500);

        } catch (error) {
            console.error('Processing Error:', error);
            alert('A critical error occurred. Error: ' + error.message);
            actionBtn.disabled = false;
            actionBtn.innerHTML = '<i class="fa-solid fa-layer-group"></i> Generate Layout';
        }
    }

}); // End of DOMContentLoaded
