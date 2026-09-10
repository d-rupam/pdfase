// ==========================================
// 1. INJECT DEPENDENCIES & STYLES (SPLIT PDF)
// ==========================================
(function initEnvironment() {
    // pdf-lib for processing/splitting
    if (!window.PDFLib) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js';
        document.head.appendChild(script);
    }

    // JSZip for bundling multiple PDFs into one zip file client-side
    if (!window.JSZip) {
        const zipScript = document.createElement('script');
        zipScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
        document.head.appendChild(zipScript);
    }

    const style = document.createElement('style');
    style.innerHTML = `
        .dropzone { transition: padding 0.3s ease, min-height 0.3s ease; -webkit-tap-highlight-color: transparent; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .dropzone.has-files { padding: 2rem !important; margin-bottom: 0 !important; cursor: default; }

        /* Configuration Panel */
        .split-config { display: none; flex-direction: column; width: 100%; max-width: 600px; margin: 0 auto; gap: 1.5rem; text-align: left; }
        .file-header { background: rgba(0, 255, 204, 0.05); border: 1px solid rgba(0, 255, 204, 0.2); padding: 1rem 1.5rem; border-radius: 8px; display: flex; align-items: center; gap: 10px; font-family: 'JetBrains Mono', monospace; color: var(--text-main); }
        .file-header i { color: var(--cyber-cyan); font-size: 1.2rem; }
        
        .config-row { display: flex; align-items: center; gap: 15px; justify-content: space-between; flex-wrap: wrap; }
        .config-label { font-weight: 600; color: #fff; font-size: 1.05rem; }
        
        .input-number { background: var(--bg-base); border: 1px solid var(--border-subtle); color: #fff; padding: 0.5rem 1rem; border-radius: 6px; font-family: 'Space Grotesk', sans-serif; font-size: 1rem; width: 100px; outline: none; transition: border 0.3s; }
        .input-number:focus { border-color: var(--cyber-cyan); }
        
        /* Range Boxes */
        .range-boxes-container { display: flex; flex-direction: column; gap: 1rem; margin-top: 1rem; }
        .range-box { background: var(--bg-base); border: 1px solid var(--border-subtle); border-left: 3px solid var(--cyber-cyan); padding: 1rem; border-radius: 8px; display: flex; align-items: center; gap: 15px; }
        .range-box-title { font-family: 'JetBrains Mono', monospace; font-size: 0.9rem; color: var(--cyber-cyan); width: 80px; }
        .range-input { flex: 1; background: transparent; border: 1px solid var(--border-subtle); border-radius: 6px; color: #fff; padding: 0.6rem 1rem; font-family: 'Space Grotesk', sans-serif; font-size: 1rem; outline: none; transition: all 0.3s; }
        .range-input:focus { border-color: var(--cyber-cyan); background: rgba(0, 255, 204, 0.02); }
        .range-hint { font-size: 0.8rem; color: var(--text-muted); margin-top: 5px; }

        /* Action Buttons */
        .action-container { margin-top: 2rem !important; margin-bottom: 3rem; display: none; gap: 0.5rem; justify-content: center; flex-direction: column; align-items: center; }
        .button-group { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; width: 100%; }
        .btn-action { background-color: var(--cyber-cyan); color: #000; border: none; padding: 0.85rem 2.5rem; font-size: 1.05rem; font-weight: 700; font-family: 'Space Grotesk', sans-serif; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 0 15px rgba(0, 255, 204, 0.2); display: inline-flex; align-items: center; gap: 8px; text-decoration: none; }
        .btn-action:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 5px 20px rgba(0, 255, 204, 0.4); }
        .btn-action:disabled { background-color: #2a2a2a; color: #666; cursor: not-allowed; box-shadow: none; }
        .btn-secondary { background-color: transparent; color: var(--text-main); border: 1px solid var(--border-subtle); padding: 0.85rem 1.75rem; font-size: 0.95rem; font-weight: 600; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; display: inline-flex; align-items: center; gap: 8px; text-decoration: none;}
        .btn-secondary:hover { border-color: var(--cyber-cyan); color: var(--cyber-cyan); background-color: rgba(0, 255, 204, 0.05); }

        /* Success UI */
        .success-message { width: 100%; text-align: center; color: var(--cyber-cyan); font-size: 1.2rem; font-weight: 600; margin-bottom: 0.25rem; }
        .file-flow { color: var(--text-muted); font-size: 0.85rem; margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: center; gap: 8px; flex-wrap: wrap; background: rgba(0, 255, 204, 0.03); padding: 10px 20px; border-radius: 8px; border: 1px solid rgba(0, 255, 204, 0.2); text-align: center; }
        
        .loading-overlay { position: absolute; inset: 0; background: var(--bg-card); display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 12px; z-index: 50; gap: 15px; }
        .loading-overlay i { font-size: 3rem; color: var(--cyber-cyan); }
        .loading-overlay p { font-weight: 600; color: #fff; }
    `;
    document.head.appendChild(style);
})();

document.addEventListener('DOMContentLoaded', () => {

    let safePdfBytes = null; 
    let currentFileName = "";
    let totalPages = 0;

    const dropzone = document.getElementById('pdf-dropzone');
    const fileInput = document.getElementById('file-input');
    const selectFilesBtn = document.getElementById('select-files-btn');
    const defaultDropzoneElements = Array.from(dropzone.children).filter(el => el.id !== 'file-input');

    // UI FOR SPLIT CONFIGURATION
    const configContainer = document.createElement('div');
    configContainer.className = 'split-config';
    configContainer.innerHTML = `
        <div class="file-header" id="file-info-display"></div>
        
        <div class="config-row">
            <label class="config-label">How many files do you want to split this into?</label>
            <div style="display:flex; gap:10px;">
                <input type="number" id="split-count" class="input-number" min="2" max="20" value="2">
                <button class="btn-secondary" id="btn-generate-boxes" style="padding: 0.5rem 1rem;">Set</button>
            </div>
        </div>

        <div class="range-boxes-container" id="range-boxes-container">
            <!-- Dynamic boxes go here -->
        </div>
    `;
    dropzone.appendChild(configContainer);

    const actionContainer = document.createElement('div');
    actionContainer.className = 'action-container';
    dropzone.parentNode.insertBefore(actionContainer, dropzone.nextSibling);

    let splitBtn;

    function initSplitUI() {
        actionContainer.innerHTML = '';
        const btnGroup = document.createElement('div');
        btnGroup.className = 'button-group';
        
        splitBtn = document.createElement('button');
        splitBtn.className = 'btn-action';
        splitBtn.id = 'btn-execute-split';
        splitBtn.innerHTML = '<i class="fa-solid fa-file-zipper"></i> Split & Download ZIP';
        splitBtn.addEventListener('click', executeSplit);
        
        btnGroup.appendChild(splitBtn);
        actionContainer.appendChild(btnGroup);

        document.getElementById('btn-generate-boxes').addEventListener('click', generateRangeBoxes);
    }
    initSplitUI();

    // ==========================================
    // FILE INPUT HANDLING
    // ==========================================
    if (selectFilesBtn) {
        selectFilesBtn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); fileInput.click(); });
    }

    dropzone.addEventListener('click', (e) => {
        if (!safePdfBytes && e.target !== fileInput) fileInput.click();
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
        e.preventDefault();
        dropzone.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]);
    });

    async function handleFile(file) {
        if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
            alert('Invalid format. Please select a PDF document.');
            return;
        }

        if (!window.PDFLib) {
            alert('Engine is still loading. Please wait a moment.');
            return;
        }

        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'loading-overlay';
        loadingDiv.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i><p>Analyzing Document...</p>';
        dropzone.appendChild(loadingDiv);

        try {
            currentFileName = file.name;
            const rawBuffer = await file.arrayBuffer();
            safePdfBytes = rawBuffer.slice(0); // Deep clone

            const pdfDoc = await window.PDFLib.PDFDocument.load(safePdfBytes, { ignoreEncryption: true });
            totalPages = pdfDoc.getPageCount();

            setupConfigLayout();

        } catch (error) {
            console.error('Error loading PDF:', error);
            alert('Could not read the PDF file. Error: ' + error.message);
        } finally {
            if (dropzone.contains(loadingDiv)) dropzone.removeChild(loadingDiv);
        }
    }

    function setupConfigLayout() {
        dropzone.classList.add('has-files');
        defaultDropzoneElements.forEach(el => el.style.display = 'none');
        
        configContainer.style.display = 'flex';
        document.getElementById('file-info-display').innerHTML = `
            <i class="fa-solid fa-file-pdf"></i> ${currentFileName} <span style="color:var(--text-muted);">(${totalPages} Pages Total)</span>
        `;
        actionContainer.style.display = 'flex';
        
        // Generate default 2 boxes
        generateRangeBoxes();
    }

    // ==========================================
    // RANGE BOX GENERATION
    // ==========================================
    function generateRangeBoxes() {
        const countInput = document.getElementById('split-count');
        let count = parseInt(countInput.value);
        
        if (isNaN(count) || count < 1) count = 1;
        if (count > 50) { alert("Maximum 50 files allowed at once."); count = 50; countInput.value = 50; }

        const container = document.getElementById('range-boxes-container');
        container.innerHTML = ''; // Clear existing

        for (let i = 1; i <= count; i++) {
            const box = document.createElement('div');
            box.className = 'range-box';
            
            // Just a helpful placeholder suggestion based on math
            const pagesPerFile = Math.floor(totalPages / count);
            const start = ((i - 1) * pagesPerFile) + 1;
            const end = (i === count) ? totalPages : (i * pagesPerFile);
            const placeholder = `${start}-${end}`;

            box.innerHTML = `
                <div class="range-box-title">File ${i}</div>
                <div style="flex:1;">
                    <input type="text" class="range-input" data-index="${i}" placeholder="e.g. ${placeholder}" title="Enter page numbers (e.g., 1-5, 8, 11-13)">
                    <div class="range-hint">Enter pages or ranges (e.g., 1-5, 8, 11-13)</div>
                </div>
            `;
            container.appendChild(box);
        }
    }

    // ==========================================
    // RANGE PARSER HELPER
    // ==========================================
    // Converts a string like "1-3, 5" into an array [1, 2, 3, 5]
    function parsePageRangeString(rangeStr, maxPage) {
        const pages = new Set();
        const parts = rangeStr.split(',');
        
        for (let part of parts) {
            part = part.trim();
            if (!part) continue;

            if (part.includes('-')) {
                const bounds = part.split('-');
                const start = parseInt(bounds[0], 10);
                const end = parseInt(bounds[1], 10);
                
                if (isNaN(start) || isNaN(end) || start > end || start < 1) throw new Error(`Invalid range format: ${part}`);
                
                for (let p = start; p <= end; p++) {
                    if (p > maxPage) throw new Error(`Page ${p} exceeds total pages (${maxPage})`);
                    pages.add(p);
                }
            } else {
                const p = parseInt(part, 10);
                if (isNaN(p) || p < 1) throw new Error(`Invalid page number: ${part}`);
                if (p > maxPage) throw new Error(`Page ${p} exceeds total pages (${maxPage})`);
                pages.add(p);
            }
        }
        
        // Convert to array, sort, and subtract 1 for pdf-lib (which is 0-indexed)
        return Array.from(pages).sort((a, b) => a - b).map(p => p - 1);
    }

    window.resetTool = function() {
        window.location.reload(); 
    };

    // ==========================================
    // CLIENT-SIDE SPLIT & ZIP LOGIC
    // ==========================================
    async function executeSplit() {
        if (!safePdfBytes) return;
        
        if (!window.JSZip) {
            alert('ZIP Engine is still loading. Please wait a moment.');
            return;
        }

        // 1. Collect and validate all inputs first
        const inputs = document.querySelectorAll('.range-input');
        const splitInstructions = [];
        
        try {
            inputs.forEach((input, index) => {
                const val = input.value.trim();
                const fileNum = index + 1;
                
                if (!val) {
                    throw new Error(`Please enter a page range for File ${fileNum}.`);
                }
                
                const zeroIndexedPages = parsePageRangeString(val, totalPages);
                if (zeroIndexedPages.length === 0) {
                    throw new Error(`No valid pages found for File ${fileNum}.`);
                }
                
                splitInstructions.push({ fileNum, pages: zeroIndexedPages });
            });
        } catch (err) {
            alert(err.message);
            return; // Stop execution if validation fails
        }

        try {
            splitBtn.disabled = true;
            splitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Processing PDFs...';

            const { PDFDocument } = window.PDFLib;
            const originalPdf = await PDFDocument.load(safePdfBytes, { ignoreEncryption: true });
            
            // Initialize JSZip
            const zip = new JSZip();
            const baseName = currentFileName.replace(/\.[^/.]+$/, "");

            // 2. Create the individual PDFs and add to ZIP
            for (const instruction of splitInstructions) {
                const newPdf = await PDFDocument.create();
                const copiedPages = await newPdf.copyPages(originalPdf, instruction.pages);
                copiedPages.forEach(page => newPdf.addPage(page));
                
                const pdfBytes = await newPdf.save();
                
                // Naming convention including PDFase branding
                const splitFileName = `PDFase_${baseName}_Part_${instruction.fileNum}.pdf`;
                zip.file(splitFileName, pdfBytes);
            }

            splitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Zipping Files...';

            // 3. Generate ZIP File
            const zipBlob = await zip.generateAsync({ type: "blob" });
            const zipUrl = URL.createObjectURL(zipBlob);
            const finalZipName = `PDFase_${baseName}_Split.zip`;

            // 4. Success UI
            setTimeout(() => {
                dropzone.style.display = 'none';
                
                actionContainer.innerHTML = `
                    <div class="success-message">
                        <i class="fa-solid fa-circle-check"></i> Splitting Complete!
                    </div>
                    <div class="file-flow" style="font-family:'JetBrains Mono', monospace; font-size:0.9rem;">
                        <span style="color:#fff;">Created ${splitInstructions.length} PDFs inside ZIP</span>
                    </div>
                    <div class="button-group">
                        <a href="${zipUrl}" download="${finalZipName}" class="btn-action">
                            <i class="fa-solid fa-download"></i> Download ZIP
                        </a>
                        <button class="btn-secondary" onclick="resetTool()">
                            <i class="fa-solid fa-rotate-right"></i> Split Another
                        </button>
                        <a href="/" class="btn-secondary">
                            <i class="fa-solid fa-toolbox"></i> Other Tools
                        </a>
                    </div>
                `;
            }, 600);

        } catch (error) {
            console.error('Splitting Error:', error);
            alert('A critical error occurred while processing. Error: ' + error.message);
            splitBtn.disabled = false;
            splitBtn.innerHTML = '<i class="fa-solid fa-file-zipper"></i> Split & Download ZIP';
        }
    }

});
