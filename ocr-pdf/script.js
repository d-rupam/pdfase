// ==========================================
// 1. INJECT DEPENDENCIES & STYLES (EXTRACT TEXT TO TXT)
// ==========================================
(function initEnvironment() {
    if (!window.pdfjsLib) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        document.head.appendChild(script);
    }

    const style = document.createElement('style');
    style.innerHTML = `
        /* Dynamic Dropzone Shrinking with top clearance for delete buttons */
        .dropzone { transition: padding 0.3s ease, min-height 0.3s ease; -webkit-tap-highlight-color: transparent; cursor: pointer; }
        .dropzone.has-files { padding: 2rem 1rem 1rem 1rem !important; margin-bottom: 0 !important; cursor: default; }

        /* A4 Grid Layout with top padding so badges/cross buttons are never clipped */
        .a4-grid { display: flex; flex-wrap: wrap; gap: 0.75rem; justify-content: center; width: 100%; padding: 10px 0 0 0; margin: 0; max-height: 240px; overflow-y: auto; }
        
        /* Rigid Fixed-Height Cards matching Ecosystem standards */
        .a4-card { width: 110px; height: 160px; background-color: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 6px; position: relative; padding: 10px; text-align: center; display: block; transition: all 0.2s ease; box-shadow: 0 4px 10px rgba(0,0,0,0.2); user-select: none; margin-top: 5px; }
        .a4-card:hover { border-color: rgba(255, 191, 0, 0.5); transform: translateY(-3px); box-shadow: 0 6px 15px rgba(255, 191, 0, 0.15); }
        
        .a4-icon-wrapper { height: 90px; display: flex; align-items: center; justify-content: center; width: 100%; }
        .a4-icon { font-size: 2.2rem; color: var(--theme-color, #ffbf00); transition: color 0.2s; }
        
        /* Fixed multi-line text truncation matching ecosystem standards */
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

        .action-container { margin-top: 1rem !important; margin-bottom: 3rem; display: none; gap: 1rem; justify-content: center; flex-direction: column; align-items: center; animation: fadeIn 0.4s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        .button-group { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; width: 100%; }
        
        .options-panel { background: rgba(255, 191, 0, 0.02); border: 1px solid rgba(255, 191, 0, 0.15); padding: 1.25rem 1.5rem; border-radius: 8px; display: flex; flex-direction: column; gap: 0.75rem; align-items: center; width: 100%; max-width: 450px; font-family: 'Space Grotesk', sans-serif; text-align: center; }
        .options-panel p { color: var(--text-muted); font-size: 0.9rem; line-height: 1.5; margin: 0; }

        .btn-action { background-color: #e6ac00; color: #050505; border: none; padding: 0.85rem 2.5rem; font-size: 1.05rem; font-weight: 700; font-family: 'Space Grotesk', sans-serif; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(230, 172, 0, 0.2); text-decoration: none; display: inline-flex; align-items: center; gap: 8px; }
        .btn-action:hover { background-color: #ffbf00; transform: translateY(-2px); box-shadow: 0 6px 20px rgba(255, 191, 0, 0.35); }
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
// 2. STATE MANAGEMENT & DOM SETUP
// ==========================================
document.addEventListener('DOMContentLoaded', () => {

    let mainPdfFile = null; 
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

    function initExtractUI() {
        actionContainer.innerHTML = '';
        
        const optionsPanel = document.createElement('div');
        optionsPanel.className = 'options-panel';
        optionsPanel.innerHTML = `
            <p><i class="fa-solid fa-file-lines" style="color: var(--theme-color);"></i> Ready to extract raw text streams into a downloadable TXT document.</p>
        `;

        const btnGroup = document.createElement('div');
        btnGroup.className = 'button-group';
        
        const actionBtn = document.createElement('button');
        actionBtn.className = 'btn-action';
        actionBtn.innerHTML = '<i class="fa-solid fa-file-arrow-down"></i> Extract Text to TXT';
        actionBtn.addEventListener('click', executeTextExtraction);
        
        btnGroup.appendChild(actionBtn);
        actionContainer.appendChild(optionsPanel);
        actionContainer.appendChild(btnGroup);
    }

    // ==========================================
    // 3. EVENT LISTENERS
    // ==========================================
    if (selectFilesBtn) {
        selectFilesBtn.addEventListener('click', (e) => {
            e.preventDefault(); e.stopPropagation(); fileInput.click();
        });
    }

    dropzone.addEventListener('click', (e) => {
        if (!mainPdfFile && e.target !== fileInput && !e.target.closest('.a4-card')) fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
            handleMainFile(e.target.files[0]);
            fileInput.value = ''; 
        }
    });

    dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleMainFile(e.dataTransfer.files[0]);
        }
    });

    window.addEventListener('paste', (e) => {
        if (e.clipboardData && e.clipboardData.files.length > 0) handleMainFile(e.clipboardData.files[0]);
    });

    async function handleMainFile(file) {
        if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
            alert('Invalid format. Please select a valid PDF document.');
            return;
        }
        
        if (!window.pdfjsLib) {
            alert('Engine is still loading. Please wait.');
            return;
        }

        try {
            rawPdfBuffer = await file.arrayBuffer();
            mainPdfFile = file;
            renderFileCard();
            initExtractUI();

        } catch (err) {
            console.error("Load Error:", err);
            alert("Could not read PDF file. Ensure it is not encrypted or corrupted.");
        }
    }

    function renderFileCard() {
        a4Grid.innerHTML = '';
        if (!mainPdfFile) {
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
            <button type="button" class="a4-remove" onclick="removeMainFile(event)" title="Remove File">
                <i class="fa-solid fa-xmark"></i>
            </button>
            <div class="a4-icon-wrapper">
                <i class="fa-solid fa-file-pdf a4-icon"></i>
            </div>
            <div class="a4-name" title="${mainPdfFile.name}">${mainPdfFile.name}</div>
        `;
        a4Grid.appendChild(item);
    }

    window.removeMainFile = function(event) {
        if (event) { event.stopPropagation(); event.preventDefault(); }
        mainPdfFile = null; 
        rawPdfBuffer = null; 
        renderFileCard();
        
        dropzone.style.display = 'block';
        actionContainer.innerHTML = '';
    };

    window.resetTool = function() { 
        mainPdfFile = null;
        rawPdfBuffer = null;
        window.location.reload(); 
    };

    // ==========================================
    // 4. CLIENT-SIDE TEXT EXTRACTION LOGIC
    // ==========================================
    async function executeTextExtraction() {
        if (!rawPdfBuffer || !mainPdfFile) return alert('Please upload a PDF file first.');

        const actionBtn = actionContainer.querySelector('.btn-action');

        try {
            actionBtn.disabled = true;
            actionBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Extracting Text...';

            window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            const loadingTask = window.pdfjsLib.getDocument({ data: new Uint8Array(rawPdfBuffer) });
            const pdfDoc = await loadingTask.promise;
            
            let fullTextContent = "";

            for (let i = 1; i <= pdfDoc.numPages; i++) {
                const page = await pdfDoc.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map(item => item.str).join(' ');
                fullTextContent += `--- PAGE ${i} ---\n\n${pageText}\n\n\n`;
            }

            const blob = new Blob([fullTextContent], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            
            const baseName = mainPdfFile.name.replace(/\.[^/.]+$/, "");
            const finalFileName = `PDFase_${baseName}_Extracted.txt`;
            
            setTimeout(() => {
                document.getElementById('pdf-dropzone').style.display = 'none';
                
                const stealthAttribution = Math.random() > 0.5 
                    ? `<div style="margin-top: 15px; font-size: 0.75rem; color: var(--text-muted); text-align: center;">Processed securely via <a href="https://rupamdas.in" target="_blank" rel="noopener" style="color: inherit; text-decoration: none;">PDFase Engine</a></div>`
                    : `<div style="margin-top: 15px; font-size: 0.75rem; color: var(--text-muted); text-align: center;">Client utility crafted by <a href="https://rupamdas.in" target="_blank" rel="noopener" style="color: inherit; text-decoration: none;">Rupam Das</a></div>`;

                actionContainer.innerHTML = `
                    <div class="success-message">
                        <i class="fa-solid fa-circle-check"></i> Text Extracted Successfully!
                    </div>
                    <div class="file-flow">
                        <span class="file-flow-name">${mainPdfFile.name}</span>
                        <i class="fa-solid fa-arrow-right" style="color: var(--theme-color, #ffbf00); margin: 0 10px;"></i>
                        <span class="file-flow-final">${finalFileName}</span>
                    </div>
                    <div class="button-group" style="margin-top: 5px;">
                        <a href="${url}" download="${finalFileName}" class="btn-action">
                            <i class="fa-solid fa-download"></i> Download TXT File
                        </a>
                        <button type="button" class="btn-secondary" onclick="resetTool()">
                            <i class="fa-solid fa-rotate-right"></i> Extract Another
                        </button>
                    </div>
                    ${stealthAttribution}
                `;
            }, 600);

        } catch (error) {
            console.error('Extraction Error:', error);
            alert('A critical error occurred while extracting text from the PDF.');
            actionBtn.disabled = false;
            actionBtn.innerHTML = '<i class="fa-solid fa-file-arrow-down"></i> Extract Text to TXT';
        }
    }

});
