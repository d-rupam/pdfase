// ==========================================
// 1. INJECT DEPENDENCIES & STYLES (ADD BLANK PAGES)
// ==========================================
(function initEnvironment() {
    // 1. pdf-lib for processing/modifying the file
    if (!window.PDFLib) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js';
        document.head.appendChild(script);
    }

    // 2. pdf.js for rendering the visual canvas preview
    if (!window.pdfjsLib) {
        const pdfjsScript = document.createElement('script');
        pdfjsScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        document.head.appendChild(pdfjsScript);
    }

    const style = document.createElement('style');
    style.innerHTML = `
        /* Dynamic Dropzone */
        .dropzone { transition: padding 0.3s ease, min-height 0.3s ease; -webkit-tap-highlight-color: transparent; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; }
        .dropzone.has-files { padding: 1.5rem !important; margin-bottom: 2rem !important; cursor: default; border-color: var(--border-subtle); background: transparent; }
        
        .preview-container { display: flex; justify-content: center; width: 100%; padding: 0.5rem; }

        /* Single Preview Card */
        .page-card { width: 130px; height: 184px; background-color: #fff; border: 3px solid var(--border-subtle); border-radius: 6px; position: relative; display: flex; justify-content: center; align-items: center; user-select: none; box-shadow: 0 4px 10px rgba(0,0,0,0.3); overflow: hidden; }
        .page-card canvas { width: 100%; height: 100%; object-fit: contain; pointer-events: none; }
        .card-loader { color: var(--bg-card); font-size: 1.5rem; position: absolute; }
        .page-badge { position: absolute; bottom: 4px; right: 4px; background: rgba(0,0,0,0.8); color: var(--cyber-cyan); font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; font-weight: bold; padding: 2px 6px; border-radius: 4px; z-index: 5; border: 1px solid rgba(0,255,204,0.3); }

        /* Configuration Panel Below Dropzone */
        .blank-config-wrapper { display: none; flex-direction: column; width: 100%; max-width: 650px; margin: 0 auto 3rem auto; animation: fadeIn 0.4s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        
        .config-box { background: var(--bg-card); border: 1px solid var(--border-subtle); border-left: 4px solid var(--cyber-cyan); padding: 1.5rem 2rem; border-radius: 12px; display: flex; flex-direction: column; gap: 1.2rem; }
        .config-file-info { display: flex; align-items: center; gap: 10px; font-family: 'JetBrains Mono', monospace; color: #fff; font-size: 1rem; word-break: break-all; }
        .config-file-info i { color: var(--cyber-cyan); font-size: 1.2rem; }
        
        .config-row { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px; }
        .config-label { font-weight: 600; color: #fff; font-size: 1.05rem; }
        
        .select-custom { background: var(--bg-base); border: 1px solid rgba(0, 255, 204, 0.3); color: #fff; padding: 0.6rem 1rem; border-radius: 6px; font-family: 'Space Grotesk', sans-serif; font-size: 1rem; outline: none; transition: all 0.3s; cursor: pointer; }
        .select-custom:focus { border-color: var(--cyber-cyan); box-shadow: 0 0 10px rgba(0, 255, 204, 0.2); }

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

    const previewContainer = document.createElement('div');
    previewContainer.className = 'preview-container';
    previewContainer.style.display = 'none';
    dropzone.appendChild(previewContainer);

    const configWrapper = document.createElement('div');
    configWrapper.className = 'blank-config-wrapper';
    configWrapper.innerHTML = `
        <div class="config-box">
            <div class="config-file-info">
                <i class="fa-solid fa-file-pdf"></i> <span id="display-filename">File Loaded</span> 
                <span style="color: var(--text-muted); font-size: 0.85rem; margin-left: auto;" id="display-pages"></span>
            </div>
            <div class="config-row">
                <label class="config-label">Insertion Mode</label>
                <select id="blank-mode" class="select-custom">
                    <option value="even">Make Odd Page Count Even (+1 if odd)</option>
                    <option value="end">Append 1 Blank Page at End</option>
                    <option value="every">Insert Blank Page After Every Page</option>
                </select>
            </div>
        </div>
        <div class="action-container" id="action-container" style="margin-top: 1.5rem;">
            <button class="btn-action" id="btn-execute-blank"><i class="fa-solid fa-file"></i> Add Blank Pages</button>
        </div>
    `;
    
    dropzone.parentNode.insertBefore(configWrapper, dropzone.nextSibling);

    const btnExecuteBlank = configWrapper.querySelector('#btn-execute-blank');
    btnExecuteBlank.addEventListener('click', executeAddBlanks);

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
        loadingDiv.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i><p>Analyzing Document...</p>';
        dropzone.appendChild(loadingDiv);

        try {
            currentFileName = file.name;

            const rawBuffer = await file.arrayBuffer();
            safePdfBytes = rawBuffer.slice(0); // Deep clone for safety

            const typedarray = new Uint8Array(rawBuffer);
            pdfJsDoc = await pdfjsLib.getDocument(typedarray).promise;
            totalPages = pdfJsDoc.numPages;

            setupUILayout();
            await renderPreviewThumbnail();

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
        
        previewContainer.style.display = 'flex';
        configWrapper.style.display = 'flex';
        
        document.getElementById('display-filename').textContent = currentFileName;
        document.getElementById('display-pages').textContent = `${totalPages} Pages`;
    }

    async function renderPreviewThumbnail() {
        previewContainer.innerHTML = `
            <div class="page-card">
                <div class="page-badge">1 / ${totalPages}</div>
                <i class="fa-solid fa-circle-notch fa-spin card-loader"></i>
                <canvas id="canvas-preview-1"></canvas>
            </div>
        `;

        try {
            const page = await pdfJsDoc.getPage(1);
            const canvas = document.getElementById(`canvas-preview-1`);
            const ctx = canvas.getContext('2d');
            
            const viewport = page.getViewport({ scale: 0.4 }); 
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({ canvasContext: ctx, viewport: viewport }).promise;
            
            const loader = previewContainer.querySelector('.card-loader');
            if(loader) loader.remove();
        } catch(err) {
            console.error(`Error rendering preview:`, err);
        }
    }

    window.resetTool = function() {
        window.location.reload(); 
    };

    // ==========================================
    // CLIENT-SIDE BLANK PAGE INJECTION LOGIC
    // ==========================================
    async function executeAddBlanks() {
        if (!safePdfBytes) return;

        const mode = document.getElementById('blank-mode').value;

        try {
            btnExecuteBlank.disabled = true;
            btnExecuteBlank.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Modifying PDF...';

            const { PDFDocument } = window.PDFLib;
            const originalPdf = await PDFDocument.load(safePdfBytes, { ignoreEncryption: true });
            const newPdf = await PDFDocument.create();

            const allIndices = originalPdf.getPageIndices();
            
            // 1. Copy all original pages over first
            const copiedPages = await newPdf.copyPages(originalPdf, allIndices);
            copiedPages.forEach(page => newPdf.addPage(page));

            // 2. Apply insertion logic depending on user selection
            if (mode === 'even') {
                if (totalPages % 2 !== 0) {
                    // It's odd, grab dimensions of the last page to match size seamlessly
                    const lastPage = originalPdf.getPage(totalPages - 1);
                    const { width, height } = lastPage.getSize();
                    newPdf.addPage([width, height]); // Adds a clean vector blank page
                }
            } else if (mode === 'end') {
                const lastPage = originalPdf.getPage(totalPages - 1);
                const { width, height } = lastPage.getSize();
                newPdf.addPage([width, height]);
            } else if (mode === 'every') {
                // Rebuild page order interleaving blank pages
                const originalPageObjects = await newPdf.copyPages(originalPdf, allIndices);
                const reassembledPdf = await PDFDocument.create();
                
                for (let i = 0; i < originalPageObjects.length; i++) {
                    const [p] = await reassembledPdf.copyPages(newPdf, [i]);
                    reassembledPdf.addPage(p);
                    
                    // Add a blank page matching dimensions
                    const { width, height } = p.getSize();
                    reassembledPdf.addPage([width, height]);
                }
                
                // Replace newPdf reference with reassembledPdf bytes
                const finalBytes = await reassembledPdf.save();
                finishDownload(finalBytes);
                return;
            }

            const pdfBytes = await newPdf.save();
            finishDownload(pdfBytes);

        } catch (error) {
            console.error('Blank Page Error:', error);
            alert('A critical error occurred while processing. Error: ' + error.message);
            btnExecuteBlank.disabled = false;
            btnExecuteBlank.innerHTML = '<i class="fa-solid fa-file"></i> Add Blank Pages';
        }
    }

    function finishDownload(pdfBytes) {
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        const baseName = currentFileName.replace(/\.[^/.]+$/, "");
        const finalFileName = `PDFase_${baseName}_Padded.pdf`;

        setTimeout(() => {
            dropzone.style.display = 'none';
            configWrapper.style.display = 'none';
            
            const finalContainer = document.createElement('div');
            finalContainer.style.width = '100%';
            finalContainer.style.marginBottom = '4rem';
            finalContainer.innerHTML = `
                <div class="success-message">
                    <i class="fa-solid fa-circle-check"></i> Modification Complete!
                </div>
                <div class="file-flow">
                    <i class="fa-solid fa-file" style="color: var(--cyber-cyan); font-size: 1.2rem;"></i>
                    <span>Blank pages successfully inserted into <strong>${finalFileName}</strong></span>
                </div>
                <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                    <a href="${url}" download="${finalFileName}" class="btn-action">
                        <i class="fa-solid fa-download"></i> Download PDF
                    </a>
                    <button class="btn-secondary" onclick="resetTool()">
                        <i class="fa-solid fa-rotate-right"></i> Process Another
                    </button>
                    <a href="/" class="btn-secondary">
                        <i class="fa-solid fa-toolbox"></i> All Tools
                    </a>
                </div>
            `;
            
            dropzone.parentNode.insertBefore(finalContainer, dropzone.nextSibling);
        }, 500);
    }

});
