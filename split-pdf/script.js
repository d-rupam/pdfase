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

        /* Canvas Cards */
        .page-card { width: 110px; height: 155px; background-color: #fff; border: 3px solid var(--border-subtle); border-radius: 6px; position: relative; display: flex; justify-content: center; align-items: center; user-select: none; box-shadow: 0 4px 10px rgba(0,0,0,0.3); overflow: hidden; transition: all 0.2s ease; cursor: pointer; }
        .page-card:hover { border-color: rgba(0, 255, 204, 0.6); transform: translateY(-3px); box-shadow: 0 6px 15px rgba(0, 255, 204, 0.15); }
        .page-card.selected { border-color: var(--cyber-cyan); transform: translateY(-3px); box-shadow: 0 6px 20px rgba(0, 255, 204, 0.25); }
        .page-card canvas { width: 100%; height: 100%; object-fit: contain; pointer-events: none; }
        
        .card-loader { color: var(--bg-card); font-size: 1.5rem; position: absolute; }
        .page-badge { position: absolute; bottom: 4px; right: 4px; background: rgba(0,0,0,0.8); color: #fff; font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; padding: 2px 6px; border-radius: 4px; z-index: 5; pointer-events: none; }
        .page-card.selected .page-badge { background: var(--cyber-cyan); color: #000; font-weight: bold; }
        
        .check-icon { position: absolute; top: 4px; left: 4px; background: var(--cyber-cyan); color: #000; border-radius: 50%; width: 22px; height: 22px; font-size: 0.75rem; display: none; justify-content: center; align-items: center; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5); z-index: 10; pointer-events: none; }
        .page-card.selected .check-icon { display: flex; animation: popIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        @keyframes popIn { 0% { transform: scale(0); } 100% { transform: scale(1); } }

        /* Configuration Panel Below Dropzone */
        .split-config-wrapper { display: none; flex-direction: column; width: 100%; max-width: 900px; margin: 0 auto 3rem auto; animation: fadeIn 0.4s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        
        .config-header { display: flex; justify-content: space-between; align-items: center; background: var(--bg-card); border: 1px solid var(--border-subtle); padding: 1rem 1.5rem; border-radius: 12px; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 15px; }
        .config-title { font-family: 'JetBrains Mono', monospace; font-size: 1.1rem; color: #fff; display: flex; align-items: center; gap: 10px; }
        .config-title i { color: var(--cyber-cyan); }
        
        .split-controls { display: flex; align-items: center; gap: 12px; }
        .split-controls label { color: var(--text-muted); font-size: 0.9rem; font-weight: 500; }
        .input-number { background: var(--bg-base); border: 1px solid rgba(0, 255, 204, 0.3); color: #fff; padding: 0.5rem 0.8rem; border-radius: 6px; font-family: 'JetBrains Mono', monospace; font-size: 1rem; width: 70px; text-align: center; outline: none; transition: all 0.3s; }
        .input-number:focus { border-color: var(--cyber-cyan); box-shadow: 0 0 10px rgba(0, 255, 204, 0.2); }
        .btn-set { background: rgba(0, 255, 204, 0.1); color: var(--cyber-cyan); border: 1px solid var(--cyber-cyan); padding: 0.5rem 1rem; border-radius: 6px; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: 'Space Grotesk', sans-serif; font-size: 0.9rem;}
        .btn-set:hover { background: var(--cyber-cyan); color: #000; }

        /* Compact Grid Range Boxes */
        .range-boxes-container { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem; }
        @media (max-width: 768px) { .range-boxes-container { grid-template-columns: 1fr; } }
        
        .range-box { background: var(--bg-card); border: 1px solid var(--border-subtle); padding: 0.8rem 1.2rem; border-radius: 8px; display: flex; align-items: center; gap: 12px; transition: all 0.3s ease; opacity: 0.6; cursor: pointer; position: relative; overflow: hidden; }
        .range-box:hover { opacity: 0.8; }
        
        /* Active State for the Box currently receiving clicks */
        .range-box.active { opacity: 1; border-color: var(--cyber-cyan); background: rgba(0, 255, 204, 0.03); box-shadow: 0 4px 15px rgba(0,255,204,0.1); }
        .range-box.active::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: var(--cyber-cyan); }
        
        .range-box-badge { background: rgba(255, 255, 255, 0.05); color: var(--text-main); font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: 0.8rem; padding: 0.3rem 0.6rem; border-radius: 4px; min-width: 70px; text-align: center; border: 1px solid var(--border-subtle); transition: all 0.3s; }
        .range-box.active .range-box-badge { background: rgba(0, 255, 204, 0.1); color: var(--cyber-cyan); border-color: rgba(0, 255, 204, 0.3); }
        
        .range-input { flex: 1; background: transparent; border: none; color: #fff; padding: 0.4rem; font-family: 'Space Grotesk', sans-serif; font-size: 1rem; outline: none; transition: all 0.3s; min-width: 0; }
        .range-input::placeholder { color: rgba(255,255,255,0.2); }
        
        .active-indicator { font-size: 0.75rem; color: var(--cyber-cyan); font-weight: 600; text-transform: uppercase; letter-spacing: 1px; display: none; margin-left: auto; }
        .range-box.active .active-indicator { display: block; animation: fadeIn 0.3s ease; }

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
    
    // TRACKING ACTIVE BOX FOR CLICKS
    let activeBoxIndex = 1;

    const dropzone = document.getElementById('pdf-dropzone');
    const fileInput = document.getElementById('file-input');
    const selectFilesBtn = document.getElementById('select-files-btn');
    const defaultDropzoneElements = Array.from(dropzone.children).filter(el => el.id !== 'file-input');

    const a4Grid = document.createElement('div');
    a4Grid.className = 'a4-grid';
    a4Grid.style.display = 'none';
    dropzone.appendChild(a4Grid);

    const configWrapper = document.createElement('div');
    configWrapper.className = 'split-config-wrapper';
    configWrapper.innerHTML = `
        <div class="config-header">
            <div class="config-title">
                <i class="fa-solid fa-file-pdf"></i> <span id="display-filename">File Loaded</span> 
                <span style="color: var(--text-muted); font-size: 0.9rem; margin-left: 10px;" id="display-pages"></span>
            </div>
            <div class="split-controls">
                <label>Files:</label>
                <input type="number" id="split-count" class="input-number" min="2" max="50" value="2">
                <button class="btn-set" id="btn-generate-boxes">Update</button>
            </div>
        </div>
        <div style="text-align: center; color: var(--text-muted); font-size: 0.85rem; margin-bottom: 1rem;">
            Click a box to select it, then click thumbnails to assign pages, or type manually.
        </div>
        <div class="range-boxes-container" id="range-boxes-container">
            <!-- Dynamic boxes go here -->
        </div>
        <div class="action-container" id="action-container">
            <button class="btn-action" id="btn-execute-split"><i class="fa-solid fa-file-zipper"></i> Split & Download ZIP</button>
        </div>
    `;
    
    dropzone.parentNode.insertBefore(configWrapper, dropzone.nextSibling);

    const btnExecuteSplit = configWrapper.querySelector('#btn-execute-split');
    btnExecuteSplit.addEventListener('click', executeSplit);
    configWrapper.querySelector('#btn-generate-boxes').addEventListener('click', () => {
        generateRangeBoxes();
        setActiveBox(1); // Reset to file 1 on update
    });

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

            const rawBuffer = await file.arrayBuffer();
            safePdfBytes = rawBuffer.slice(0); 

            const typedarray = new Uint8Array(rawBuffer);
            pdfJsDoc = await pdfjsLib.getDocument(typedarray).promise;
            totalPages = pdfJsDoc.numPages;

            setupUILayout();
            await renderAllCanvases();
            setActiveBox(1); // Initialize selection

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
        
        a4Grid.style.display = 'flex';
        configWrapper.style.display = 'flex';
        document.getElementById('display-filename').textContent = currentFileName;
        document.getElementById('display-pages').textContent = `(${totalPages} Pages)`;
        
        generateRangeBoxes();
    }

    // ==========================================
    // CANVAS RENDERING & CLICKS
    // ==========================================
    async function renderAllCanvases() {
        a4Grid.innerHTML = '';
        for (let i = 1; i <= totalPages; i++) {
            const card = document.createElement('div');
            card.className = 'page-card';
            card.dataset.page = i;
            card.innerHTML = `
                <div class="check-icon"><i class="fa-solid fa-check"></i></div>
                <div class="page-badge">Pg ${i}</div>
                <i class="fa-solid fa-circle-notch fa-spin card-loader"></i>
                <canvas id="canvas-page-${i}"></canvas>
            `;
            
            // Thumbnail Click Handler
            card.addEventListener('click', (e) => {
                e.stopPropagation();
                handleThumbnailClick(i);
            });

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
            
            const viewport = page.getViewport({ scale: 0.3 }); 
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
    // SMART DYNAMIC RANGE LOGIC & TWO-WAY UI
    // ==========================================
    function getDynamicHint(maxPage) {
        if (maxPage <= 5) return `e.g. 1, 3`;
        return `e.g. 1-3, ${maxPage}`;
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
            box.dataset.index = i;
            
            box.innerHTML = `
                <div class="range-box-badge">FILE ${String(i).padStart(2, '0')}</div>
                <input type="text" class="range-input" data-index="${i}" placeholder="${smartHint}">
                <div class="active-indicator">Editing</div>
            `;

            // Make box active when clicked anywhere inside
            box.addEventListener('click', () => setActiveBox(i));
            
            // Update canvas checkmarks in real-time when typing manually
            const inputField = box.querySelector('.range-input');
            inputField.addEventListener('input', () => {
                setActiveBox(i);
                syncCanvasWithInput();
            });

            container.appendChild(box);
        }
    }

    // Switches focus to a specific box and syncs the canvas visually
    function setActiveBox(index) {
        activeBoxIndex = index;
        document.querySelectorAll('.range-box').forEach(b => b.classList.remove('active'));
        
        const activeBox = document.querySelector(`.range-box[data-index="${index}"]`);
        if(activeBox) {
            activeBox.classList.add('active');
            activeBox.querySelector('.range-input').focus();
        }
        
        syncCanvasWithInput();
    }

    // Lenient parser: turns "1-3, 5" into Set(1, 2, 3, 5) without crashing on typos
    function parseLenientSet(str) {
        const pages = new Set();
        if(!str) return pages;
        
        const parts = str.split(',');
        for (let part of parts) {
            part = part.trim();
            if(!part) continue;
            
            if (part.includes('-')) {
                const [startStr, endStr] = part.split('-');
                const start = parseInt(startStr);
                const end = parseInt(endStr);
                if (!isNaN(start) && !isNaN(end) && start <= end) {
                    for(let p = start; p <= end; p++) if(p <= totalPages) pages.add(p);
                } else if (!isNaN(start)) {
                    if (start <= totalPages) pages.add(start); // Handle dangling "1-" as just "1"
                }
            } else {
                const val = parseInt(part);
                if (!isNaN(val) && val <= totalPages) pages.add(val);
            }
        }
        return pages;
    }

    // Serializer: turns Set(1, 2, 3, 5) into "1-3, 5"
    function serializeSetToString(pagesSet) {
        if (pagesSet.size === 0) return "";
        const sorted = Array.from(pagesSet).sort((a,b) => a - b);
        const ranges = [];
        let start = sorted[0];
        let prev = sorted[0];

        for (let i = 1; i <= sorted.length; i++) {
            if (i < sorted.length && sorted[i] === prev + 1) {
                prev = sorted[i];
            } else {
                if (start === prev) ranges.push(`${start}`);
                else ranges.push(`${start}-${prev}`);
                
                if (i < sorted.length) {
                    start = sorted[i];
                    prev = sorted[i];
                }
            }
        }
        return ranges.join(", ");
    }

    // Master logic for clicking a thumbnail
    function handleThumbnailClick(pageNum) {
        const activeInput = document.querySelector(`.range-input[data-index="${activeBoxIndex}"]`);
        if (!activeInput) return;

        const currentPages = parseLenientSet(activeInput.value);
        
        if (currentPages.has(pageNum)) {
            currentPages.delete(pageNum);
        } else {
            currentPages.add(pageNum);
        }

        // Re-write the string cleanly into the box
        activeInput.value = serializeSetToString(currentPages);
        
        // Sync visual checkmarks
        syncCanvasWithInput();
    }

    // Visual sync
    function syncCanvasWithInput() {
        const activeInput = document.querySelector(`.range-input[data-index="${activeBoxIndex}"]`);
        const activePages = activeInput ? parseLenientSet(activeInput.value) : new Set();
        
        document.querySelectorAll('.page-card').forEach(card => {
            const p = parseInt(card.dataset.page);
            if (activePages.has(p)) {
                card.classList.add('selected');
            } else {
                card.classList.remove('selected');
            }
        });
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
        
        // Strict Validation for extraction
        try {
            inputs.forEach((input, index) => {
                const val = input.value.trim();
                const fileNum = index + 1;
                
                if (!val) throw new Error(`File ${fileNum} is empty. Please select pages.`);

                // Convert 1-indexed UI sets to 0-indexed pdf-lib arrays
                const pagesSet = parseLenientSet(val);
                if (pagesSet.size === 0) throw new Error(`File ${fileNum} has no valid pages selected.`);
                
                const zeroIndexedPages = Array.from(pagesSet).sort((a,b)=>a-b).map(p => p - 1);
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
