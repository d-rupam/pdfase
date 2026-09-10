// ==========================================
// 1. INJECT DEPENDENCIES & STYLES (INTERACTIVE BLANK PAGES)
// ==========================================
(function initEnvironment() {
    if (!window.PDFLib) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js';
        document.head.appendChild(script);
    }
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

        /* Top Action Bar inside Dropzone when loaded */
        .blank-top-bar { display: none; justify-content: space-between; align-items: center; width: 100%; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border-subtle); flex-wrap: wrap; gap: 10px; }
        .file-info { display: flex; align-items: center; gap: 10px; color: var(--text-main); font-family: 'JetBrains Mono', monospace; font-size: 0.95rem; }
        .file-info i { color: var(--cyber-cyan); font-size: 1.2rem; }

        /* Interactive Flow Grid */
        .blank-flow-grid { display: flex; flex-wrap: wrap; gap: 0.8rem; align-items: center; justify-content: center; width: 100%; padding: 0.5rem; max-height: 60vh; overflow-y: auto; }
        .blank-flow-grid::-webkit-scrollbar { width: 8px; }
        .blank-flow-grid::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.02); border-radius: 4px; }
        .blank-flow-grid::-webkit-scrollbar-thumb { background: rgba(0, 255, 204, 0.2); border-radius: 4px; }

        /* Plus Button Node */
        .flow-plus-btn { background: rgba(0, 255, 204, 0.05); border: 2px dashed rgba(0, 255, 204, 0.4); color: var(--cyber-cyan); width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; font-size: 0.9rem; z-index: 5; flex-shrink: 0; }
        .flow-plus-btn:hover { background: var(--cyber-cyan); color: #000; transform: scale(1.15); box-shadow: 0 0 12px rgba(0,255,204,0.4); }

        /* Page Card (Original Document Page) */
        .flow-page-card { width: 110px; height: 155px; background-color: #fff; border: 2px solid var(--border-subtle); border-radius: 6px; position: relative; display: flex; justify-content: center; align-items: center; user-select: none; box-shadow: 0 4px 10px rgba(0,0,0,0.3); overflow: hidden; flex-shrink: 0; }
        .flow-page-card canvas { width: 100%; height: 100%; object-fit: contain; pointer-events: none; }
        .card-loader { color: var(--bg-card); font-size: 1.2rem; position: absolute; }
        .flow-page-badge { position: absolute; bottom: 4px; right: 4px; background: rgba(0,0,0,0.8); color: #fff; font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; padding: 2px 5px; border-radius: 3px; z-index: 5; }

        /* Blank Page Card (Inserted Interactively) */
       /* Blank Page Card (Cyberpunk Dashed Border + Clean White Paper Inside) */
        .flow-blank-card { 
            width: 110px; 
            height: 155px; 
            background-color: #ffffff; 
            border: 2px dashed var(--cyber-cyan); 
            border-radius: 6px; 
            position: relative; 
            display: flex; 
            flex-direction: column; 
            justify-content: center; 
            align-items: center; 
            user-select: none; 
            box-shadow: 0 4px 15px rgba(0, 255, 204, 0.15); 
            flex-shrink: 0; 
            animation: popIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; 
        }
        .flow-blank-card span { 
            font-size: 0.7rem; 
            font-family: 'JetBrains Mono', monospace; 
            color: #333333; 
            font-weight: 700; 
            margin-top: 5px; 
            letter-spacing: 0.5px;
        }
        .flow-blank-card i.fa-file { 
            font-size: 1.8rem; 
            color: #9ca3af; 
        }
        
        .flow-blank-delete { 
            position: absolute; 
            top: 4px; 
            right: 4px; 
            background: #ff3366; 
            color: #fff; 
            border: none; 
            border-radius: 50%; 
            width: 22px; 
            height: 22px; 
            font-size: 0.7rem; 
            cursor: pointer; 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            box-shadow: 0 2px 5px rgba(0,0,0,0.4); 
            z-index: 10; 
            transition: transform 0.2s; 
        }
        .flow-blank-delete:hover { transform: scale(1.15); }

        @keyframes popIn { 0% { transform: scale(0); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }

        /* Action Container */
        .action-container { display: none; justify-content: center; width: 100%; margin-top: 1.5rem; margin-bottom: 4rem; }
        .btn-action { background-color: var(--cyber-cyan); color: #000; border: none; padding: 1rem 3rem; font-size: 1.1rem; font-weight: 700; font-family: 'Space Grotesk', sans-serif; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 0 15px rgba(0, 255, 204, 0.2); display: inline-flex; align-items: center; gap: 10px; text-decoration: none; }
        .btn-action:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 5px 25px rgba(0, 255, 204, 0.4); }
        
        .btn-secondary { background-color: transparent; color: var(--text-main); border: 1px solid var(--border-subtle); padding: 0.6rem 1.2rem; font-size: 0.9rem; font-weight: 600; border-radius: 6px; cursor: pointer; transition: all 0.3s ease; display: inline-flex; align-items: center; gap: 6px; text-decoration: none;}
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

    // Sequence array maintaining items: 
    // Each item is either { type: 'page', originalIndex: 0 } or { type: 'blank', id: uniqueId }
    let sequenceList = [];
    let blankCounter = 0;

    const dropzone = document.getElementById('pdf-dropzone');
    const fileInput = document.getElementById('file-input');
    const selectFilesBtn = document.getElementById('select-files-btn');
    const defaultDropzoneElements = Array.from(dropzone.children).filter(el => el.id !== 'file-input');

    // Top Bar inside Dropzone
    const topBar = document.createElement('div');
    topBar.className = 'blank-top-bar';
    topBar.innerHTML = `
        <div class="file-info" id="file-info-display"></div>
        <button class="btn-secondary" id="btn-add-between-all">
            <i class="fa-solid fa-plus"></i> Add between all
        </button>
    `;
    dropzone.appendChild(topBar);

    // Interactive Flow Grid Container
    const flowGrid = document.createElement('div');
    flowGrid.className = 'blank-flow-grid';
    flowGrid.style.display = 'none';
    dropzone.appendChild(flowGrid);

    // Action Container Below Dropzone
    const actionContainer = document.createElement('div');
    actionContainer.className = 'action-container';
    dropzone.parentNode.insertBefore(actionContainer, dropzone.nextSibling);

    let applyBtn;

    function initUI() {
        actionContainer.innerHTML = '';
        const btnGroup = document.createElement('div');
        btnGroup.className = 'button-group';
        
        applyBtn = document.createElement('button');
        applyBtn.className = 'btn-action';
        applyBtn.innerHTML = '<i class="fa-solid fa-file-circle-plus"></i> Apply Changes & Download';
        applyBtn.addEventListener('click', executeApplyChanges);
        
        btnGroup.appendChild(applyBtn);
        actionContainer.appendChild(btnGroup);

        document.getElementById('btn-add-between-all').addEventListener('click', (e) => {
            e.stopPropagation();
            addBlankBetweenAll();
        });
    }
    initUI();

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
        loadingDiv.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i><p>Analyzing Document & Previews...</p>';
        dropzone.appendChild(loadingDiv);

        try {
            currentFileName = file.name;
            sequenceList = [];

            const rawBuffer = await file.arrayBuffer();
            safePdfBytes = rawBuffer.slice(0); // Deep clone

            const typedarray = new Uint8Array(rawBuffer);
            pdfJsDoc = await pdfjsLib.getDocument(typedarray).promise;
            totalPages = pdfJsDoc.numPages;

            // Initialize sequence with original pages
            for (let i = 0; i < totalPages; i++) {
                sequenceList.push({ type: 'page', originalIndex: i });
            }

            setupUILayout();
            renderFlowGrid();
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
        
        topBar.style.display = 'flex';
        flowGrid.style.display = 'flex';
        actionContainer.style.display = 'flex';
        
        document.getElementById('file-info-display').innerHTML = `
            <i class="fa-solid fa-file-pdf"></i> ${currentFileName} <span style="color:var(--text-muted);">(${totalPages} Pages)</span>
        `;
    }

    // ==========================================
    // INTERACTIVE FLOW GRID RENDERING
    // ==========================================
    function renderFlowGrid() {
        flowGrid.innerHTML = '';

        // Helper to create a '+' button node
        const createPlusButton = (insertIndex) => {
            const btn = document.createElement('button');
            btn.className = 'flow-plus-btn';
            btn.innerHTML = '<i class="fa-solid fa-plus"></i>';
            btn.title = "Insert blank page here";
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                sequenceList.splice(insertIndex, 0, { type: 'blank', id: 'blank_' + (++blankCounter) });
                renderFlowGrid();
                renderAllCanvases(); // Re-render canvas previews for page elements
            });
            return btn;
        };

        // 1. Plus button at the very beginning
        flowGrid.appendChild(createPlusButton(0));

        // 2. Iterate through sequence items
        sequenceList.forEach((item, idx) => {
            if (item.type === 'page') {
                const pageCard = document.createElement('div');
                pageCard.className = 'flow-page-card';
                pageCard.innerHTML = `
                    <div class="flow-page-badge">(${item.originalIndex + 1})</div>
                    <i class="fa-solid fa-circle-notch fa-spin card-loader"></i>
                    <canvas id="flow-canvas-${item.originalIndex}"></canvas>
                `;
                flowGrid.appendChild(pageCard);
            } else if (item.type === 'blank') {
                const blankCard = document.createElement('div');
                blankCard.className = 'flow-blank-card';
                blankCard.innerHTML = `
                    <button class="flow-blank-delete" title="Remove blank page" onclick="removeBlankItem('${item.id}')">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                    <i class="fa-solid fa-file"></i>
                    <span>Blank</span>
                `;
                flowGrid.appendChild(blankCard);
            }

            // Plus button after each item
            flowGrid.appendChild(createPlusButton(idx + 1));
        });
    }

    window.removeBlankItem = function(id) {
        sequenceList = sequenceList.filter(item => !(item.type === 'blank' && item.id === id));
        renderFlowGrid();
        renderAllCanvases();
    };

    function addBlankBetweenAll() {
        const newSequence = [];
        sequenceList.forEach((item, idx) => {
            newSequence.push(item);
            // Add a blank after every page or item as requested by "Add between all"
            newSequence.push({ type: 'blank', id: 'blank_' + (++blankCounter) });
        });
        sequenceList = newSequence;
        renderFlowGrid();
        renderAllCanvases();
    }

    async function renderAllCanvases() {
        for (let i = 0; i < totalPages; i++) {
            const canvas = document.getElementById(`flow-canvas-${i}`);
            if (!canvas) continue;
            
            try {
                const page = await pdfJsDoc.getPage(i + 1);
                const ctx = canvas.getContext('2d');
                
                const viewport = page.getViewport({ scale: 0.3 });
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                await page.render({ canvasContext: ctx, viewport: viewport }).promise;
                
                const card = canvas.parentElement;
                const loader = card.querySelector('.card-loader');
                if(loader) loader.remove();
            } catch(err) {
                console.error(`Error rendering page ${i+1}:`, err);
            }
        }
    }

    window.resetTool = function() {
        window.location.reload(); 
    };

    // ==========================================
    // EXECUTE FINAL EXPORT
    // ==========================================
    async function executeApplyChanges() {
        if (!safePdfBytes || sequenceList.length === 0) return;

        try {
            applyBtn.disabled = true;
            applyBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Generating PDF...';

            const { PDFDocument } = window.PDFLib;
            const originalPdf = await PDFDocument.load(safePdfBytes, { ignoreEncryption: true });
            const newPdf = await PDFDocument.create();

            // Reference dimensions for blank pages based on page 1 of original document
            const firstPage = originalPdf.getPage(0);
            const { width, height } = firstPage.getSize();

            // Construct final PDF based exactly on sequenceList order
            for (const item of sequenceList) {
                if (item.type === 'page') {
                    const [copiedPage] = await newPdf.copyPages(originalPdf, [item.originalIndex]);
                    newPdf.addPage(copiedPage);
                } else if (item.type === 'blank') {
                    newPdf.addPage([width, height]); // Clean structural blank page
                }
            }

            const pdfBytes = await newPdf.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            
            const baseName = currentFileName.replace(/\.[^/.]+$/, "");
            const finalFileName = `PDFase_${baseName}_CustomModified.pdf`;

            setTimeout(() => {
                dropzone.style.display = 'none';
                topBar.style.display = 'none';
                flowGrid.style.display = 'none';
                
                const finalContainer = document.createElement('div');
                finalContainer.style.width = '100%';
                finalContainer.style.marginBottom = '4rem';
                finalContainer.innerHTML = `
                    <div class="success-message">
                        <i class="fa-solid fa-circle-check"></i> Modification Complete!
                    </div>
                    <div class="file-flow">
                        <i class="fa-solid fa-file-circle-plus" style="color: var(--cyber-cyan); font-size: 1.2rem;"></i>
                        <span>Successfully customized <strong>${finalFileName}</strong> (${newPdf.getPageCount()} total pages)</span>
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

        } catch (error) {
            console.error('Generation Error:', error);
            alert('A critical error occurred while processing. Error: ' + error.message);
            applyBtn.disabled = false;
            applyBtn.innerHTML = '<i class="fa-solid fa-file-circle-plus"></i> Apply Changes & Download';
        }
    }

});
