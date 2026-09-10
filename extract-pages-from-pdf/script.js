// ==========================================
// 1. INJECT DEPENDENCIES & STYLES (EXTRACT PDF)
// ==========================================
(function initEnvironment() {
    // 1. pdf-lib for processing/extracting the actual file
    if (!window.PDFLib) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js';
        document.head.appendChild(script);
    }

    // 2. pdf.js for rendering the visual canvas previews
    if (!window.pdfjsLib) {
        const pdfjsScript = document.createElement('script');
        pdfjsScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        document.head.appendChild(pdfjsScript);
    }

    const style = document.createElement('style');
    style.innerHTML = `
        /* Dynamic Dropzone */
        .dropzone { transition: padding 0.3s ease, min-height 0.3s ease; -webkit-tap-highlight-color: transparent; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .dropzone.has-files { padding: 1.5rem 1.5rem !important; margin-bottom: 0 !important; cursor: default; }

        /* Controls Container (Top Bar) */
        .controls-container { display: none; justify-content: space-between; align-items: center; width: 100%; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border-subtle); flex-wrap: wrap; gap: 10px; }
        .file-info { display: flex; align-items: center; gap: 10px; color: var(--text-main); font-family: 'JetBrains Mono', monospace; font-size: 0.95rem; }
        .file-info i { color: var(--cyber-cyan); font-size: 1.2rem; }
        .selection-tools { display: flex; gap: 10px; }
        .btn-text { background: rgba(0, 255, 204, 0.05); border: 1px solid rgba(0, 255, 204, 0.2); color: var(--cyber-cyan); cursor: pointer; font-family: 'Space Grotesk', sans-serif; font-size: 0.85rem; font-weight: 600; padding: 6px 12px; border-radius: 6px; transition: all 0.2s; }
        .btn-text:hover { background: rgba(0, 255, 204, 0.15); border-color: var(--cyber-cyan); }

        /* Scrollable Grid for Pages */
        .a4-grid { display: flex; flex-wrap: wrap; gap: 1.2rem; justify-content: center; width: 100%; padding: 0.5rem; margin: 0; max-height: 60vh; overflow-y: auto; }
        
        /* Custom Scrollbar */
        .a4-grid::-webkit-scrollbar { width: 8px; }
        .a4-grid::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.02); border-radius: 4px; }
        .a4-grid::-webkit-scrollbar-thumb { background: rgba(0, 255, 204, 0.2); border-radius: 4px; }
        .a4-grid::-webkit-scrollbar-thumb:hover { background: rgba(0, 255, 204, 0.5); }

        /* Canvas Page Cards */
        .page-card { 
            width: 140px; 
            height: 198px; 
            background-color: #fff; 
            border: 3px solid var(--border-subtle); 
            border-radius: 6px; 
            position: relative; 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            cursor: pointer; 
            transition: all 0.2s ease; 
            user-select: none; 
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            overflow: hidden;
        }
        .page-card:hover { border-color: rgba(0, 255, 204, 0.6); transform: translateY(-3px); box-shadow: 0 6px 15px rgba(0, 255, 204, 0.15); }
        .page-card.selected { border-color: var(--cyber-cyan); transform: translateY(-3px); box-shadow: 0 6px 20px rgba(0, 255, 204, 0.25); }
        
        .page-card canvas { width: 100%; height: 100%; object-fit: contain; pointer-events: none; }
        
        /* Loading spinner inside card */
        .card-loader { color: var(--bg-card); font-size: 1.5rem; position: absolute; }

        /* Page Number Badge overlay */
        .page-badge { position: absolute; bottom: 4px; right: 4px; background: rgba(0,0,0,0.7); color: #fff; font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; padding: 2px 6px; border-radius: 4px; z-index: 5; backdrop-filter: blur(2px); pointer-events: none; }
        .page-card.selected .page-badge { background: var(--cyber-cyan); color: #000; font-weight: bold; }
        
        /* Selection Check Icon */
        .check-icon { position: absolute; top: 4px; left: 4px; background: var(--cyber-cyan); color: #000; border-radius: 50%; width: 24px; height: 24px; font-size: 0.8rem; display: none; justify-content: center; align-items: center; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5); z-index: 10; pointer-events: none; }
        .page-card.selected .check-icon { display: flex; animation: popIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        
        @keyframes popIn { 0% { transform: scale(0); } 100% { transform: scale(1); } }

        /* Action Container */
        .action-container { margin-top: 1.5rem !important; margin-bottom: 3rem; display: none; gap: 0.5rem; justify-content: center; flex-direction: column; align-items: center; }
        .button-group { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; width: 100%; }
        
        .btn-action { background-color: var(--cyber-cyan); color: #000; border: none; padding: 0.85rem 2.5rem; font-size: 1.05rem; font-weight: 700; font-family: 'Space Grotesk', sans-serif; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 0 15px rgba(0, 255, 204, 0.2); text-decoration: none; display: inline-flex; align-items: center; gap: 8px; }
        .btn-action:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 5px 20px rgba(0, 255, 204, 0.4); }
        .btn-action:disabled { background-color: #2a2a2a; color: #666; cursor: not-allowed; box-shadow: none; border: 1px solid #444; }
        
        .btn-secondary { background-color: transparent; color: var(--text-main); border: 1px solid var(--border-subtle); padding: 0.85rem 1.75rem; font-size: 0.95rem; font-weight: 600; font-family: 'Space Grotesk', sans-serif; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; }
        .btn-secondary:hover { border-color: var(--cyber-cyan); color: var(--cyber-cyan); background-color: rgba(0, 255, 204, 0.05); }

        /* Success UI & Loaders */
        .success-message { width: 100%; text-align: center; color: var(--cyber-cyan); font-size: 1.2rem; font-weight: 600; margin-bottom: 0.25rem; }
        .file-flow { color: var(--text-muted); font-size: 0.85rem; margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: center; gap: 8px; flex-wrap: wrap; background: rgba(0, 255, 204, 0.03); padding: 10px 20px; border-radius: 8px; border: 1px solid rgba(0, 255, 204, 0.2); text-align: center; max-width: 100%; word-break: break-word; }
        .file-flow-name { color: var(--text-main); font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; }
        .file-flow-final { color: #fff; font-weight: 700; border-bottom: 1px dashed var(--cyber-cyan); font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; }
        
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
    let selectedPages = new Set();
    let pdfJsDoc = null; 

    const dropzone = document.getElementById('pdf-dropzone');
    const fileInput = document.getElementById('file-input');
    const selectFilesBtn = document.getElementById('select-files-btn');
    const defaultDropzoneElements = Array.from(dropzone.children).filter(el => el.id !== 'file-input');

    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'controls-container';
    controlsContainer.innerHTML = `
        <div class="file-info" id="file-info-display"></div>
        <div class="selection-tools">
            <button class="btn-text" id="btn-select-all">Select All</button>
            <button class="btn-text" id="btn-deselect-all">Deselect All</button>
        </div>
    `;
    dropzone.appendChild(controlsContainer);

    const a4Grid = document.createElement('div');
    a4Grid.className = 'a4-grid';
    a4Grid.style.display = 'none';
    dropzone.appendChild(a4Grid);

    const actionContainer = document.createElement('div');
    actionContainer.className = 'action-container';
    dropzone.parentNode.insertBefore(actionContainer, dropzone.nextSibling);

    let extractBtn;

    function initExtractUI() {
        actionContainer.innerHTML = '';
        const btnGroup = document.createElement('div');
        btnGroup.className = 'button-group';
        
        extractBtn = document.createElement('button');
        extractBtn.className = 'btn-action';
        extractBtn.disabled = true; 
        extractBtn.innerHTML = '<i class="fa-solid fa-file-export"></i> Extract Pages';
        extractBtn.addEventListener('click', executeExtract);
        
        btnGroup.appendChild(extractBtn);
        actionContainer.appendChild(btnGroup);

        document.getElementById('btn-select-all').addEventListener('click', (e) => { e.stopPropagation(); selectAllPages(); });
        document.getElementById('btn-deselect-all').addEventListener('click', (e) => { e.stopPropagation(); deselectAllPages(); });
    }
    initExtractUI();

    // ==========================================
    // 3. EVENT LISTENERS
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

    window.addEventListener('paste', (e) => {
        if (!safePdfBytes && e.clipboardData && e.clipboardData.files.length > 0) handleFile(e.clipboardData.files[0]);
    });

    // ==========================================
    // 4. FILE HANDLING & CANVAS RENDERING
    // ==========================================
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
        loadingDiv.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i><p>Rendering Document Previews...</p>';
        dropzone.appendChild(loadingDiv);

        try {
            currentFileName = file.name;
            selectedPages.clear();

            // 1. Read the file into memory
            const rawBuffer = await file.arrayBuffer();
            
            // 2. Deep clone the memory for pdf-lib to use later.
            safePdfBytes = rawBuffer.slice(0);

            // 3. Pass the original buffer to PDF.js for rendering
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
        
        controlsContainer.style.display = 'flex';
        document.getElementById('file-info-display').innerHTML = `
            <i class="fa-solid fa-file-pdf"></i> ${currentFileName} <span style="color:var(--text-muted);">(${totalPages} Pages)</span>
        `;

        a4Grid.style.display = 'flex';
        actionContainer.style.display = 'flex';
        a4Grid.innerHTML = '';
        updateActionState();
    }

    async function renderAllCanvases() {
        for (let i = 1; i <= totalPages; i++) {
            const card = document.createElement('div');
            card.className = 'page-card';
            card.dataset.page = i;
            
            card.innerHTML = `
                <div class="check-icon"><i class="fa-solid fa-check"></i></div>
                <div class="page-badge">${i}</div>
                <i class="fa-solid fa-circle-notch fa-spin card-loader"></i>
                <canvas id="canvas-page-${i}"></canvas>
            `;

            card.addEventListener('click', (e) => {
                e.stopPropagation();
                togglePageSelection(i, card);
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
            
            const viewport = page.getViewport({ scale: 0.5 });
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            const renderContext = { canvasContext: ctx, viewport: viewport };
            await page.render(renderContext).promise;
            
            const card = canvas.parentElement;
            const loader = card.querySelector('.card-loader');
            if(loader) loader.remove();

        } catch(err) {
            console.error(`Error rendering page ${pageNum}:`, err);
        }
    }

    // ==========================================
    // 5. SELECTION LOGIC
    // ==========================================
    function togglePageSelection(pageNum, cardElement) {
        if (selectedPages.has(pageNum)) {
            selectedPages.delete(pageNum);
            cardElement.classList.remove('selected');
        } else {
            selectedPages.add(pageNum);
            cardElement.classList.add('selected');
        }
        updateActionState();
    }

    function selectAllPages() {
        const cards = a4Grid.querySelectorAll('.page-card');
        cards.forEach((card, index) => {
            selectedPages.add(index + 1);
            card.classList.add('selected');
        });
        updateActionState();
    }

    function deselectAllPages() {
        selectedPages.clear();
        const cards = a4Grid.querySelectorAll('.page-card');
        cards.forEach(card => card.classList.remove('selected'));
        updateActionState();
    }

    function updateActionState() {
        const count = selectedPages.size;
        if (count === 0) {
            extractBtn.disabled = true;
            extractBtn.innerHTML = '<i class="fa-solid fa-file-export"></i> Extract Pages';
        } else {
            extractBtn.disabled = false;
            extractBtn.innerHTML = `<i class="fa-solid fa-file-export"></i> Extract ${count} Page${count > 1 ? 's' : ''}`;
        }
    }

    window.resetTool = function() {
        window.location.reload(); 
    };

    // ==========================================
    // 6. CLIENT-SIDE EXTRACT LOGIC (pdf-lib)
    // ==========================================
    async function executeExtract() {
        if (selectedPages.size === 0 || !safePdfBytes) return;

        try {
            extractBtn.disabled = true;
            extractBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Extracting Document...';

            const { PDFDocument } = window.PDFLib;
            
            const originalPdf = await PDFDocument.load(safePdfBytes, { ignoreEncryption: true });
            const newPdf = await PDFDocument.create();

            const pageIndices = Array.from(selectedPages)
                                     .sort((a, b) => a - b)
                                     .map(pageNum => pageNum - 1); 

            const copiedPages = await newPdf.copyPages(originalPdf, pageIndices);
            copiedPages.forEach(page => newPdf.addPage(page));

            const pdfBytes = await newPdf.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            
            const baseName = currentFileName.replace(/\.[^/.]+$/, "");
            const finalFileName = `PDFase_${baseName}_Extracted.pdf`;
            
            setTimeout(() => {
                dropzone.style.display = 'none';
                
                actionContainer.innerHTML = `
                    <div class="success-message">
                        <i class="fa-solid fa-circle-check"></i> Extraction Complete!
                    </div>
                    <div class="file-flow">
                        <span class="file-flow-name">${currentFileName}</span>
                        <i class="fa-solid fa-file-export" style="color: var(--cyber-cyan); margin: 0 10px; font-size: 0.8rem;"></i>
                        <span class="file-flow-name">${selectedPages.size} pages extracted</span>
                        <i class="fa-solid fa-arrow-right" style="color: var(--cyber-cyan); margin: 0 10px; font-size: 0.8rem;"></i>
                        <span class="file-flow-final">${finalFileName}</span>
                    </div>
                    <div class="button-group">
                        <a href="${url}" download="${finalFileName}" class="btn-action">
                            <i class="fa-solid fa-download"></i> Download PDF
                        </a>
                        <button class="btn-secondary" onclick="resetTool()">
                            <i class="fa-solid fa-rotate-right"></i> Extract Another
                        </button>
                        <a href="/" class="btn-secondary">
                            <i class="fa-solid fa-toolbox"></i> Other Tools
                        </a>
                    </div>
                `;
            }, 600);

        } catch (error) {
            console.error('Extraction Error:', error);
            alert('Extraction Failed. Error: ' + error.message);
            
            extractBtn.disabled = false;
            extractBtn.innerHTML = `<i class="fa-solid fa-file-export"></i> Extract Pages`; 
        }
    }

});
