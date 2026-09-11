// ==========================================
// 1. INJECT DEPENDENCIES & STYLES (OCR PDF)
// ==========================================
(function initEnvironment() {
    // 1. pdf-lib for building the final searchable PDF
    if (!window.PDFLib) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js';
        document.head.appendChild(script);
    }

    // 2. pdf.js for rendering the PDF pages to a canvas for the OCR engine
    if (!window.pdfjsLib) {
        const pdfScript = document.createElement('script');
        pdfScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        document.head.appendChild(pdfScript);
    }

    // 3. Tesseract.js for client-side Optical Character Recognition
    if (!window.Tesseract) {
        const tesseractScript = document.createElement('script');
        tesseractScript.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
        document.head.appendChild(tesseractScript);
    }

    const style = document.createElement('style');
    style.innerHTML = `
        /* Dynamic Dropzone Shrinking */
        .dropzone { transition: padding 0.3s ease, min-height 0.3s ease; -webkit-tap-highlight-color: transparent; cursor: pointer; }
        .dropzone.has-files { padding: 1.25rem 1rem 0.25rem 1rem !important; margin-bottom: 0 !important; cursor: default; }

        /* A4 Grid Layout for the selected file */
        .a4-grid { display: flex; flex-wrap: wrap; gap: 0.75rem; justify-content: center; width: 100%; padding: 0; margin: 0; }
        
        /* Rigid Fixed-Height Card */
        .a4-card { width: 120px; height: 160px; background-color: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 6px; position: relative; padding: 10px; text-align: center; display: block; transition: all 0.2s ease; box-shadow: 0 4px 10px rgba(0,0,0,0.2); user-select: none; }
        .a4-card:hover { border-color: rgba(255, 191, 0, 0.5); transform: translateY(-3px); box-shadow: 0 6px 15px rgba(255, 191, 0, 0.15); }
        
        .a4-icon-wrapper { height: 90px; display: flex; align-items: center; justify-content: center; width: 100%; }
        .a4-icon { font-size: 2.5rem; color: var(--theme-color, #ffbf00); transition: color 0.2s; }
        
        .a4-name { 
            font-size: 0.75rem; 
            color: var(--text-main); 
            font-weight: 500; 
            width: 100%; 
            height: 38px; 
            margin-top: 5px;
            padding-top: 6px; 
            border-top: 1px solid rgba(255, 255, 255, 0.05);
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: normal;
            line-height: 1.3;
            word-break: break-word;
        }
        
        .a4-remove { position: absolute; top: -8px; right: -8px; background: #ff3366; color: #fff; border: none; border-radius: 50%; width: 22px; height: 22px; font-size: 0.75rem; cursor: pointer; display: flex; justify-content: center; align-items: center; box-shadow: 0 2px 5px rgba(0,0,0,0.4); z-index: 10; transition: transform 0.2s; }
        .a4-remove:hover { transform: scale(1.1); }

        /* Action Container */
        .action-container { margin-top: 1rem !important; margin-bottom: 3rem; display: none; gap: 1rem; justify-content: center; flex-direction: column; align-items: center; animation: fadeIn 0.4s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        .button-group { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; width: 100%; }
        
        /* Options Panel for OCR Configuration */
        .options-panel { background: rgba(255, 191, 0, 0.02); border: 1px solid rgba(255, 191, 0, 0.15); padding: 1.5rem; border-radius: 8px; display: flex; flex-direction: column; gap: 1.25rem; align-items: stretch; width: 100%; max-width: 450px; font-family: 'Space Grotesk', sans-serif; position: relative; }
        
        .input-group { display: flex; flex-direction: column; gap: 6px; text-align: left; }
        .input-group label { color: var(--text-muted); font-size: 0.85rem; font-weight: 600; font-family: 'Space Grotesk', sans-serif; }
        .input-group select { background: var(--bg-card); color: #fff; border: 1px solid var(--border-subtle); padding: 0.75rem 1rem; border-radius: 6px; font-family: 'JetBrains Mono', monospace; font-size: 0.95rem; outline: none; transition: border-color 0.2s; width: 100%; cursor: pointer; }
        .input-group select:focus { border-color: var(--theme-color, #ffbf00); }

        /* Progress Bar UI */
        .progress-wrapper { width: 100%; display: none; flex-direction: column; gap: 8px; margin-top: 10px; }
        .progress-text { font-size: 0.85rem; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; text-align: center; }
        .progress-track { width: 100%; height: 6px; background: rgba(255, 255, 255, 0.1); border-radius: 3px; overflow: hidden; }
        .progress-fill { height: 100%; width: 0%; background: var(--theme-color, #ffbf00); transition: width 0.2s ease; }

        /* Eye-Friendly Balanced Amber Action Button */
        .btn-action { 
            background-color: #e6ac00; 
            color: #050505; 
            border: none; 
            padding: 0.85rem 2.5rem; 
            font-size: 1.05rem; 
            font-weight: 700; 
            font-family: 'Space Grotesk', sans-serif; 
            border-radius: 8px; 
            cursor: pointer; 
            transition: all 0.3s ease; 
            box-shadow: 0 4px 15px rgba(230, 172, 0, 0.2); 
            text-decoration: none; 
            display: inline-flex; 
            align-items: center; 
            gap: 8px; 
        }
        .btn-action:hover { 
            background-color: #ffbf00;
            transform: translateY(-2px); 
            box-shadow: 0 6px 20px rgba(255, 191, 0, 0.35); 
        }
        .btn-action:disabled { background-color: #222; color: #666; cursor: not-allowed; transform: none; box-shadow: none; }
        
        .btn-secondary { background-color: transparent; color: var(--text-main); border: 1px solid var(--border-subtle); padding: 0.85rem 1.75rem; font-size: 0.95rem; font-weight: 600; font-family: 'Space Grotesk', sans-serif; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; }
        .btn-secondary:hover { border-color: var(--theme-color, #ffbf00); color: var(--theme-color, #ffbf00); background-color: rgba(255, 191, 0, 0.05); }
        
        .success-message { width: 100%; text-align: center; color: var(--theme-color, #ffbf00); font-size: 1.2rem; font-weight: 600; margin-bottom: 0.25rem; }
        
        .file-flow { color: var(--text-muted); font-size: 0.85rem; margin-bottom: 1rem; display: flex; align-items: center; justify-content: center; gap: 8px; flex-wrap: wrap; background: rgba(255, 191, 0, 0.03); padding: 10px 20px; border-radius: 8px; border: 1px solid rgba(255, 191, 0, 0.2); text-align: center; max-width: 100%; word-break: break-word; }
        .file-flow-name { color: var(--text-main); font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; }
        .file-flow-final { color: #fff; font-weight: 700; border-bottom: 1px dashed var(--theme-color, #ffbf00); font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; }
    `;
    document.head.appendChild(style);
})();

// ==========================================
// WAIT FOR HTML DOM TO FULLY LOAD
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

    function initOcrUI() {
        actionContainer.innerHTML = '';
        
        const optionsPanel = document.createElement('div');
        optionsPanel.className = 'options-panel';
        optionsPanel.innerHTML = `
            <div class="input-group">
                <label>Document Language</label>
                <select id="ocr-lang">
                    <option value="eng" selected>English</option>
                    <option value="spa">Spanish</option>
                    <option value="fra">French</option>
                    <option value="deu">German</option>
                    <option value="ita">Italian</option>
                    <option value="por">Portuguese</option>
                    <option value="hin">Hindi</option>
                </select>
            </div>
            
            <div class="progress-wrapper" id="ocr-progress-wrapper">
                <div class="progress-text" id="ocr-progress-text">Initializing Engine...</div>
                <div class="progress-track">
                    <div class="progress-fill" id="ocr-progress-fill"></div>
                </div>
            </div>
            
            <div style="font-size: 0.75rem; color: var(--text-muted); text-align: center; margin-top: 4px;">
                Optical Character Recognition runs entirely on your device. Large documents may take several minutes depending on your processor speed.
            </div>
        `;

        const btnGroup = document.createElement('div');
        btnGroup.className = 'button-group';
        
        const actionBtn = document.createElement('button');
        actionBtn.className = 'btn-action';
        actionBtn.innerHTML = '<i class="fa-solid fa-font"></i> Run OCR Engine';
        actionBtn.addEventListener('click', executeOCR);
        
        btnGroup.appendChild(actionBtn);
        
        actionContainer.appendChild(optionsPanel);
        actionContainer.appendChild(btnGroup);
    }
    initOcrUI();

    // ==========================================
    // BULLETPROOF EVENT LISTENERS 
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
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]);
    });

    window.addEventListener('paste', (e) => {
        if (e.clipboardData && e.clipboardData.files.length > 0) handleFile(e.clipboardData.files[0]);
    });

    // ==========================================
    // FILE HANDLING & UI RENDERING
    // ==========================================
    async function handleFile(file) {
        if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
            alert('Invalid format. Please select a PDF document.');
            return;
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
        event.stopPropagation(); 
        event.preventDefault();
        activePdfFile = null;
        rawPdfBuffer = null;
        renderFileCard();
    };

    window.resetTool = function() {
        window.location.reload(); 
    };

    // ==========================================
    // CLIENT-SIDE OCR LOGIC (pdf.js + Tesseract + pdf-lib)
    // ==========================================
    async function executeOCR() {
        if (!activePdfFile || !rawPdfBuffer) return alert('Please upload a PDF file first.');
        
        if (!window.pdfjsLib || !window.PDFLib || !window.Tesseract) {
            alert('Engines are still loading. Please wait a moment.');
            return;
        }

        const actionBtn = actionContainer.querySelector('.btn-action');
        const langSelect = document.getElementById('ocr-lang');
        const progressWrapper = document.getElementById('ocr-progress-wrapper');
        const progressText = document.getElementById('ocr-progress-text');
        const progressFill = document.getElementById('ocr-progress-fill');
        
        try {
            actionBtn.disabled = true;
            actionBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Processing...';
            progressWrapper.style.display = 'flex';

            // 1. Setup PDF.js Worker
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            const loadingTask = window.pdfjsLib.getDocument({ data: new Uint8Array(rawPdfBuffer) });
            const sourcePdf = await loadingTask.promise;
            const totalPages = sourcePdf.numPages;

            // 2. Setup PDF-lib (Target Document)
            const { PDFDocument, rgb, StandardFonts } = window.PDFLib;
            const newPdf = await PDFDocument.create();
            const helveticaFont = await newPdf.embedFont(StandardFonts.Helvetica);

            // 3. Initialize Tesseract WASM Engine
            progressText.innerText = "Loading Language Models...";
            const selectedLang = langSelect.value;
            
            const worker = await window.Tesseract.createWorker(selectedLang, 1, {
                logger: m => {
                    if (m.status === 'recognizing text') {
                        const pct = Math.round(m.progress * 100);
                        progressFill.style.width = `${pct}%`;
                    }
                }
            });

            // Reusable Off-screen Canvas
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // 4. Iterate over pages
            for (let i = 1; i <= totalPages; i++) {
                progressText.innerText = `Rasterizing Page ${i} of ${totalPages}...`;
                progressFill.style.width = '0%';
                
                const page = await sourcePdf.getPage(i);
                
                // Scale 2.0 provides good resolution for OCR engines
                const viewport = page.getViewport({ scale: 2.0 }); 
                canvas.width = viewport.width;
                canvas.height = viewport.height;

                await page.render({ canvasContext: ctx, viewport: viewport }).promise;

                // Extract image to base64
                const imgDataUrl = canvas.toDataURL('image/jpeg', 0.95);
                const imgBytes = await fetch(imgDataUrl).then(res => res.arrayBuffer());

                // Embed image to PDF-Lib
                const pdfImage = await newPdf.embedJpg(imgBytes);
                const origViewport = page.getViewport({ scale: 1.0 }); // Native PDF Dimensions
                
                const newPage = newPdf.addPage([origViewport.width, origViewport.height]);
                newPage.drawImage(pdfImage, {
                    x: 0,
                    y: 0,
                    width: origViewport.width,
                    height: origViewport.height
                });

                // Run OCR on the Canvas image
                progressText.innerText = `Running OCR on Page ${i}...`;
                const { data } = await worker.recognize(canvas);

                // Map Tesseract Bounding Boxes to PDF-lib Coords and inject invisible text
                const scaleX = origViewport.width / canvas.width;
                const scaleY = origViewport.height / canvas.height;

                for (const word of data.words) {
                    if (!word.text.trim()) continue;

                    // Tesseract origin is Top-Left. PDF-Lib origin is Bottom-Left.
                    const pdfX = word.bbox.x0 * scaleX;
                    const pdfY = origViewport.height - (word.bbox.y1 * scaleY);
                    const pdfHeight = (word.bbox.y1 - word.bbox.y0) * scaleY;
                    
                    // Draw invisible text layer (opacity: 0) directly over the image words
                    // This allows users to highlight and copy the text natively in the PDF viewer
                    newPage.drawText(word.text, {
                        x: pdfX,
                        y: pdfY,
                        size: pdfHeight,
                        font: helveticaFont,
                        color: rgb(0,0,0),
                        opacity: 0 
                    });
                }
            }

            // Cleanup Worker
            await worker.terminate();

            progressText.innerText = "Compiling Final PDF...";
            progressFill.style.width = '100%';

            // Export New Document
            const pdfBytes = await newPdf.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            
            const baseName = activePdfFile.name.replace(/\.[^/.]+$/, "");
            const finalFileName = `PDFase_${baseName}_Searchable.pdf`;
            
            setTimeout(() => {
                document.getElementById('pdf-dropzone').style.display = 'none';
                
                actionContainer.innerHTML = `
                    <div class="success-message">
                        <i class="fa-solid fa-circle-check"></i> OCR Complete!
                    </div>
                    <div class="file-flow">
                        <span class="file-flow-name">${activePdfFile.name}</span>
                        <i class="fa-solid fa-arrow-right" style="color: var(--theme-color, #ffbf00); margin: 0 10px;"></i>
                        <span class="file-flow-final">${finalFileName}</span>
                    </div>
                    <div class="button-group">
                        <a href="${url}" download="${finalFileName}" class="btn-action">
                            <i class="fa-solid fa-download"></i> Download Searchable PDF
                        </a>
                        <button class="btn-secondary" onclick="resetTool()">
                            <i class="fa-solid fa-rotate-right"></i> OCR Another
                        </button>
                        <a href="/" class="btn-secondary">
                            <i class="fa-solid fa-toolbox"></i> Other Tools
                        </a>
                    </div>
                `;
            }, 600);

        } catch (error) {
            console.error('OCR Processing Error:', error);
            alert('A critical error occurred while processing the OCR. Please ensure the document is clear.');
            actionBtn.disabled = false;
            actionBtn.innerHTML = '<i class="fa-solid fa-font"></i> Run OCR Engine';
            progressWrapper.style.display = 'none';
        }
    }

}); // End of DOMContentLoaded
