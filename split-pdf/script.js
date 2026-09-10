// ==========================================
// 1. INJECT DEPENDENCIES & STYLES (SPLIT PDF PRO)
// ==========================================
(function initEnvironment() {
    // pdf-lib for processing/splitting
    if (!window.PDFLib) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js';
        document.head.appendChild(script);
    }
    // JSZip for bundling multiple PDFs
    if (!window.JSZip) {
        const zipScript = document.createElement('script');
        zipScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
        document.head.appendChild(zipScript);
    }
    // pdf.js for rendering visual previews
    if (!window.pdfjsLib) {
        const pdfjsScript = document.createElement('script');
        pdfjsScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        document.head.appendChild(pdfjsScript);
    }

    const style = document.createElement('style');
    style.innerHTML = `
        /* Dynamic Dropzone & Grid */
        .dropzone { transition: padding 0.3s ease, min-height 0.3s ease; -webkit-tap-highlight-color: transparent; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; }
        .dropzone.has-files { padding: 1.5rem !important; margin-bottom: 2rem !important; cursor: default; border-color: var(--border-subtle); background: transparent; }
        
        .a4-grid { display: flex; flex-wrap: wrap; gap: 1rem; justify-content: center; width: 100%; padding: 0.5rem; margin: 0; max-height: 45vh; overflow-y: auto; }
        .a4-grid::-webkit-scrollbar { width: 8px; }
        .a4-grid::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.02); border-radius: 4px; }
        .a4-grid::-webkit-scrollbar-thumb { background: rgba(0, 255, 204, 0.2); border-radius: 4px; }
        .a4-grid::-webkit-scrollbar-thumb:hover { background: rgba(0, 255, 204, 0.5); }

        /* Canvas Cards (Visual Reference Only) */
        .page-card { width: 120px; height: 170px; background-color: #fff; border: 2px solid var(--border-subtle); border-radius: 6px; position: relative; display: flex; justify-content: center; align-items: center; user-select: none; box-shadow: 0 4px 10px rgba(0,0,0,0.3); overflow: hidden; transition: border 0.3s; }
        .page-card:hover { border-color: var(--cyber-cyan); }
        .page-card canvas { width: 100%; height: 100%; object-fit: contain; pointer-events: none; }
        .card-loader { color: var(--bg-card); font-size: 1.5rem; position: absolute; }
        .page-badge { position: absolute; bottom: 4px; right: 4px; background: rgba(0,0,0,0.8); color: var(--cyber-cyan); font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; font-weight: bold; padding: 3px 8px; border-radius: 4px; z-index: 5; pointer-events: none; border: 1px solid rgba(0,255,204,0.3); }

        /* Configuration Panel Below Dropzone */
        .split-config-wrapper { display: none; flex-direction: column; width: 100%; max-width: 750px; margin: 0 auto 3rem auto; animation: fadeIn 0.4s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        
        .config-header { display: flex; justify-content: space-between; align-items: center; background: var(--bg-card); border: 1px solid var(--border-subtle); padding: 1.2rem 2rem; border-radius: 12px; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 15px; }
        .config-title { font-family: 'JetBrains Mono', monospace; font-size: 1.2rem; color: #fff; display: flex; align-items: center; gap: 10px; }
        .config-title i { color: var(--cyber-cyan); }
        
        .split-controls { display: flex; align-items: center; gap: 12px; }
        .split-controls label { color: var(--text-muted); font-size: 0.95rem; font-weight: 500; }
        .input-number { background: var(--bg-base); border: 1px solid rgba(0, 255, 204, 0.3); color: #fff; padding: 0.6rem 1rem; border-radius: 6px; font-family: 'JetBrains Mono', monospace; font-size: 1rem; width: 80px; text-align: center; outline: none; transition: all 0.3s; }
        .input-number:focus { border-color: var(--cyber-cyan); box-shadow: 0 0 10px rgba(0, 255, 204, 0.2); }
        .btn-set { background: rgba(0, 255, 204, 0.1); color: var(--cyber-cyan); border: 1px solid var(--cyber-cyan); padding: 0.6rem 1.2rem; border-radius: 6px; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: 'Space Grotesk', sans-serif; }
        .btn-set:hover { background: var(--cyber-cyan); color: #000; }

        /* Beautiful Range Input Boxes */
        .range-boxes-container { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2rem; }
        .range-box { background: var(--bg-card); border: 1px solid var(--border-subtle); border-left: 4px solid var(--cyber-cyan); padding: 1.2rem 1.5rem; border-radius: 8px; display: flex; align-items: center; gap: 20px; transition: all 0.3s ease; }
        .range-box:focus-within { border-color: rgba(0, 255, 204, 0.4); box-shadow: 0 4px 15px rgba(0,0,0,0.2); background: rgba(255,255,255,0.02); }
        
        .range-box-badge { background: rgba(0, 255, 204, 0.1); color: var(--cyber-cyan); font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: 0.9rem; padding: 0.4rem 0.8rem; border-radius: 4px; min-width: 85px; text-align: center; border: 1px solid rgba(0,255,204,0.2); }
        
        .range-input-wrapper { flex: 1; display: flex; flex-direction: column; gap: 6px; }
        .range-input { width: 100%; background: var(--bg-base); border: 1px solid var(--border-subtle); color: #fff; padding: 0.8rem 1.2rem; border-radius: 6px; font-family: 'Space Grotesk', sans-serif; font-size: 1.05rem; outline: none; transition: all 0.3s; }
        .range-input:focus { border-color: var(--cyber-cyan); box-shadow: inset 0 0 0 1px var(--cyber-cyan); }
        .range-input::placeholder { color: rgba(255,255,255,0.2); }
        .range-hint { font-size: 0.85rem; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }

        /* Action Container */
        .action-container { display: flex; justify-content: center; width: 100%; margin-top: 1rem; }
        .btn-action { background-color: var(--cyber-cyan); color: #000; border: none; padding: 1rem 3rem; font-size: 1.1rem; font-weight: 700; font-family: 'Space Grotesk', sans-serif; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 0 15px rgba(0, 255, 204, 0.2); display: inline-flex; align-items: center; gap: 10px; text-decoration: none; }
        .btn-action:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 5px 25px rgba(0, 255, 204, 0.4); }
        .btn-action:disabled { background-color: #2a2a2a; color: #666; cursor: not-allowed; box-shadow: none; }
        .btn-secondary { background-color: transparent; color: var(--text-main); border: 1px solid var(--border-subtle); padding: 0.85rem 1.75rem; font-size: 0.95rem; font-weight: 600; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; display: inline-flex; align-items: center; gap: 8px; text-decoration: none;}
        .btn-secondary:hover { border-color: var(--cyber-cyan); color: var(--cyber-cyan); background-color: rgba(0, 255, 204, 0.05); }

        /* Success & Loaders */
        .success-message { width: 100%; text-align: center; color: var(--cyber-cyan); font-size: 1.3rem; font-weight: 700; margin-bottom: 1rem; }
        .file-flow { color: var(--text-main); font-size: 0.9rem; margin-bottom: 2rem; display: flex; align-items: center; justify-content: center; gap: 12px; flex-wrap: wrap; background: rgba(0, 255, 204, 0.05); padding: 15px 25px; border-radius: 8px; border: 1px dashed rgba(0, 255, 204, 0.3); font-family: 'JetBrains Mono', monospace; }
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
    let pdfJsDoc = null; 

    const dropzone = document.getElementById('pdf-dropzone');
    const fileInput = document.getElementById('file-input');
    const selectFilesBtn = document.getElementById('select-files-btn');
    const defaultDropzoneElements = Array.from(dropzone.children).filter(el => el.id !== 'file-input');

    // Create Grid for Visual Previews
    const a4Grid = document.createElement('div');
    a4Grid.className = 'a4-grid';
    a4Grid.style.display = 'none';
    dropzone.appendChild(a4Grid);

    // Create Configuration Wrapper (Below Dropzone)
    const configWrapper = document.createElement('div');
    configWrapper.className = 'split-config-wrapper';
    configWrapper.innerHTML = `
        <div class="config-header">
            <div class="config-title">
                <i class="fa-solid fa-file-pdf"></i> <span id="display-filename">File Loaded</span> 
                <span style="color: var(--text-muted); font-size: 0.9rem; margin-left: 10px;" id="display-pages"></span>
            </div>
            <div class="split-controls">
                <label>Split into how many files?</label>
                <input type="number" id="split-count" class="input-number" min="2" max="50" value="2">
                <button class="btn-set" id="btn-generate-boxes">Update</button>
            </div>
        </div>
        <div class="range-boxes-container" id="range-boxes-container">
            <!-- Dynamic boxes go here -->
        </div>
        <div class="action-container" id="action-container">
            <button class="btn-action" id="btn-execute-split"><i class="fa-solid fa-file-zipper"></i> Split & Download ZIP</button>
        </div>
    `;
    
    // Insert config panel directly after the dropzone in the DOM
    dropzone.parentNode.insertBefore(configWrapper, dropzone.nextSibling);

    const btnExecuteSplit = configWrapper.querySelector('#btn-execute-split');
    btnExecuteSplit.addEventListener('click', executeSplit);
    configWrapper.querySelector('#btn-generate-boxes').addEventListener('click', generateRangeBoxes);

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

        if (!window.PDFLib || !window.pdfjsLib) {
            alert('Engines are still loading. Please wait a moment.');
            return;
        }

        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'loading-overlay';
        loadingDiv.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i><p>Analyzing & Rendering Previews...</p>';
        dropzone.appendChild(loadingDiv);

        try {
            currentFileName = file.name;

            // 1. Safe Deep Clone for pdf-lib
            const rawBuffer = await file.arrayBuffer();
            safePdfBytes = rawBuffer.slice(0); 

            // 2. Render visuals with pdf.js
            const typedarray = new Uint8Array(rawBuffer);
            pdfJsDoc = await pdfjsLib.getDocument(typedarray).promise;
            totalPages = pdfJsDoc.numPages;

            setupUILayout();
            await renderAllCanvases();

        } catch (error) {
            console.error('Error loading PDF:', error);
            alert('Could not read the PDF file. Error: ' + error.message);
        } finally {
            if (dropzone.contains(loadingDiv)) dropzone.removeChild(loadingDiv);
        }
    }

    function setupUILayout() {
        dropzone.classList.add('has-files');
        defaultDropzoneElements.forEach(el => el.style.display = 'none');
        
        // Show Canvas Grid inside dropzone
        a4Grid.style.display = 'flex';

        // Show Config Panel below dropzone
        configWrapper.style.display = 'flex';
        document.getElementById('display-filename').textContent = currentFileName;
        document.getElementById('display-pages').textContent = `(${totalPages} Pages)`;
        
        generateRangeBoxes(); // Create default boxes
    }

    // ==========================================
    // CANVAS RENDERING (Visual Only)
    // ==========================================
    async function renderAllCanvases() {
        a4Grid.innerHTML = '';
        for (let i = 1; i <= totalPages; i++) {
            const card = document.createElement('div');
            card.className = 'page-card';
            card.innerHTML = `
                <div class="page-badge">Pg ${i}</div>
                <i class="fa-solid fa-circle-notch fa-spin card-loader"></i>
                <canvas id="canvas-page-${i}"></canvas>
            `;
            a4Grid.appendChild(card);
        }

        for (let i = 1; i <= totalPages; i++) {
            await renderSinglePage(i);
        }
    }

    async function renderSinglePage(pageNum) {
        try {
            const page = await pdfJsDoc.getPage(pageNum);
            const canvas = document.getElementById(`canvas-page-${pageNum}`);
            const ctx = canvas.getContext('2d');
            
            const viewport = page.getViewport({ scale: 0.4 }); // Low res for thumbnails
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({ canvasContext: ctx, viewport: viewport }).promise;
            
            const card = canvas.parentElement;
            const loader = card.querySelector('.card-loader');
            if(loader) loader.remove();
        } catch(err) {
            console.error(`Error rendering page ${pageNum}:`, err);
        }
    }

    // ==========================================
    // SMART DYNAMIC RANGE LOGIC & UI
    // ==========================================
    function getDynamicHint(maxPage) {
        if (maxPage === 1) return `e.g., 1`;
        if (maxPage === 2) return `e.g., 1, 2`;
        if (maxPage <= 5) return `e.g., 1-2, 4-${maxPage}`;
        // For larger files, create a smart-looking dummy hint bounded by total pages
        const midPoint = Math.floor(maxPage / 2);
        return `e.g., 1-3, ${midPoint}, ${maxPage-1}-${maxPage}`;
    }

    function generateRangeBoxes() {
        const countInput = document.getElementById('split-count');
        let count = parseInt(countInput.value);
        
        if (isNaN(count) || count < 1) count = 1;
        if (count > 50) { alert("Maximum 50 files allowed."); count = 50; countInput.value = 50; }

        const container = document.getElementById('range-boxes-container');
        container.innerHTML = ''; 
        
        const smartHint = getDynamicHint(totalPages);

        for (let i = 1; i <= count; i++) {
            const box = document.createElement('div');
            box.className = 'range-box';
            
            // Suggest an initial sequential distribution for placeholders
            const pagesPerFile = Math.floor(totalPages / count);
            let start = ((i - 1) * pagesPerFile) + 1;
            let end = (i === count) ? totalPages : (i * pagesPerFile);
            if (start > totalPages) { start = totalPages; end = totalPages; }
            
            const placeholder = (start === end) ? `${start}` : `${start}-${end}`;

            box.innerHTML = `
                <div class="range-box-badge">FILE 0${i}</div>
                <div class="range-input-wrapper">
                    <input type="text" class="range-input" data-index="${i}" placeholder="Auto: ${placeholder}" title="Type the pages to include in File ${i}">
                    <div class="range-hint">Enter exact pages to extract for this file (${smartHint})</div>
                </div>
            `;
            container.appendChild(box);
        }
    }

    function parsePageRangeString(rangeStr, maxPage, fallbackStart, fallbackEnd) {
        // If user left it blank, use the auto placeholder logic
        if (!rangeStr.trim()) {
            const pages = [];
            for (let p = fallbackStart; p <= fallbackEnd; p++) pages.push(p - 1);
            return pages;
        }

        const pages = new Set();
        const parts = rangeStr.split(',');
        
        for (let part of parts) {
            part = part.trim();
            if (!part) continue;

            if (part.includes('-')) {
                const bounds = part.split('-');
                const start = parseInt(bounds[0], 10);
                const end = parseInt(bounds[1], 10);
                
                if (isNaN(start) || isNaN(end) || start > end || start < 1) throw new Error(`Invalid format in range: "${part}"`);
                
                for (let p = start; p <= end; p++) {
                    if (p > maxPage) throw new Error(`Page ${p} does not exist. (Max is ${maxPage})`);
                    pages.add(p);
                }
            } else {
                const p = parseInt(part, 10);
                if (isNaN(p) || p < 1) throw new Error(`Invalid page number: "${part}"`);
                if (p > maxPage) throw new Error(`Page ${p} does not exist. (Max is ${maxPage})`);
                pages.add(p);
            }
        }
        
        return Array.from(pages).sort((a, b) => a - b).map(p => p - 1); // 0-indexed
    }

    window.resetTool = function() {
        window.location.reload(); 
    };

    // ==========================================
    // CLIENT-SIDE SPLIT & ZIP LOGIC
    // ==========================================
    async function executeSplit() {
        if (!safePdfBytes) return;
        
        const inputs = document.querySelectorAll('.range-input');
        const splitInstructions = [];
        const count = inputs.length;
        const pagesPerFile = Math.floor(totalPages / count);
        
        // Validation
        try {
            inputs.forEach((input, index) => {
                const val = input.value;
                const fileNum = index + 1;
                
                let fallbackStart = ((fileNum - 1) * pagesPerFile) + 1;
                let fallbackEnd = (fileNum === count) ? totalPages : (fileNum * pagesPerFile);
                if (fallbackStart > totalPages) { fallbackStart = totalPages; fallbackEnd = totalPages; }

                const zeroIndexedPages = parsePageRangeString(val, totalPages, fallbackStart, fallbackEnd);
                if (zeroIndexedPages.length === 0) throw new Error(`File ${fileNum} has no valid pages selected.`);
                
                splitInstructions.push({ fileNum, pages: zeroIndexedPages });
            });
        } catch (err) {
            alert(err.message);
            return; 
        }

        try {
            btnExecuteSplit.disabled = true;
            btnExecuteSplit.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Processing...';

            const { PDFDocument } = window.PDFLib;
            const originalPdf = await PDFDocument.load(safePdfBytes, { ignoreEncryption: true });
            
            const zip = new JSZip();
            const baseName = currentFileName.replace(/\.[^/.]+$/, "");

            for (const instruction of splitInstructions) {
                const newPdf = await PDFDocument.create();
                const copiedPages = await newPdf.copyPages(originalPdf, instruction.pages);
                copiedPages.forEach(page => newPdf.addPage(page));
                
                const pdfBytes = await newPdf.save();
                const splitFileName = `PDFase_${baseName}_Part_${instruction.fileNum}.pdf`;
                zip.file(splitFileName, pdfBytes);
            }

            btnExecuteSplit.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Bundling ZIP...';

            const zipBlob = await zip.generateAsync({ type: "blob" });
            const zipUrl = URL.createObjectURL(zipBlob);
            const finalZipName = `PDFase_${baseName}_Split.zip`;

            // Success UI: Hide Dropzone and Config, Show Download
            setTimeout(() => {
                dropzone.style.display = 'none';
                configWrapper.style.display = 'none';
                
                const finalContainer = document.createElement('div');
                finalContainer.style.width = '100%';
                finalContainer.innerHTML = `
                    <div class="success-message">
                        <i class="fa-solid fa-circle-check"></i> Splitting Complete!
                    </div>
                    <div class="file-flow">
                        <i class="fa-solid fa-file-zipper" style="color: var(--cyber-cyan); font-size: 1.2rem;"></i>
                        <span>Successfully created <strong>${splitInstructions.length}</strong> PDF documents inside <strong>${finalZipName}</strong></span>
                    </div>
                    <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                        <a href="${zipUrl}" download="${finalZipName}" class="btn-action">
                            <i class="fa-solid fa-download"></i> Download ZIP
                        </a>
                        <button class="btn-secondary" onclick="resetTool()">
                            <i class="fa-solid fa-rotate-right"></i> Split Another
                        </button>
                        <a href="/" class="btn-secondary">
                            <i class="fa-solid fa-toolbox"></i> All Tools
                        </a>
                    </div>
                `;
                
                dropzone.parentNode.insertBefore(finalContainer, dropzone.nextSibling);
            }, 500);

        } catch (error) {
            console.error('Splitting Error:', error);
            alert('A critical error occurred while processing. Error: ' + error.message);
            btnExecuteSplit.disabled = false;
            btnExecuteSplit.innerHTML = '<i class="fa-solid fa-file-zipper"></i> Split & Download ZIP';
        }
    }

});
