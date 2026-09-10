// ==========================================
// 1. INJECT DEPENDENCIES & STYLES
// ==========================================
(function initEnvironment() {
    // Inject PDF.js for parsing and extracting PDF text objects
    if (!window.pdfjsLib) {
        const scriptPdf = document.createElement('script');
        scriptPdf.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        scriptPdf.onload = () => {
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        };
        document.head.appendChild(scriptPdf);
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
        .a4-card:hover { border-color: rgba(184, 41, 255, 0.5); transform: translateY(-3px); box-shadow: 0 6px 15px rgba(184, 41, 255, 0.15); }
        
        .a4-icon-wrapper { height: 90px; display: flex; align-items: center; justify-content: center; width: 100%; }
        .a4-icon { font-size: 2.5rem; color: var(--theme-color, #b829ff); transition: color 0.2s; }
        
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

        /* Force zero gap between Dropzone and Action Container */
        .action-container { margin-top: 1rem !important; margin-bottom: 3rem; display: none; gap: 0.5rem; justify-content: center; flex-direction: column; align-items: center; }
        .button-group { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; width: 100%; }
        
        .btn-action { background-color: var(--theme-color, #b829ff); color: #fff; border: none; padding: 0.85rem 2.5rem; font-size: 1.05rem; font-weight: 700; font-family: 'Space Grotesk', sans-serif; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 0 15px rgba(184, 41, 255, 0.2); text-decoration: none; display: inline-flex; align-items: center; gap: 8px; }
        .btn-action:hover { transform: translateY(-3px); box-shadow: 0 5px 20px rgba(184, 41, 255, 0.4); }
        .btn-action:disabled { background-color: #333; color: #888; cursor: not-allowed; transform: none; box-shadow: none; }
        
        .btn-secondary { background-color: transparent; color: var(--text-main); border: 1px solid var(--border-subtle); padding: 0.85rem 1.75rem; font-size: 0.95rem; font-weight: 600; font-family: 'Space Grotesk', sans-serif; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; }
        .btn-secondary:hover { border-color: var(--theme-color, #b829ff); color: var(--theme-color, #b829ff); background-color: rgba(184, 41, 255, 0.05); }
        
        .success-message { width: 100%; text-align: center; color: var(--theme-color, #b829ff); font-size: 1.2rem; font-weight: 600; margin-bottom: 0.25rem; }
        
        .file-flow { color: var(--text-muted); font-size: 0.85rem; margin-bottom: 1rem; display: flex; align-items: center; justify-content: center; gap: 8px; flex-wrap: wrap; background: rgba(184, 41, 255, 0.03); padding: 10px 20px; border-radius: 8px; border: 1px solid rgba(184, 41, 255, 0.2); text-align: center; max-width: 100%; word-break: break-word; }
        .file-flow-name { color: var(--text-main); font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; }
        .file-flow-final { color: #fff; font-weight: 700; border-bottom: 1px dashed var(--theme-color, #b829ff); font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; }
        
        .progress-text { font-size: 0.85rem; font-family: 'JetBrains Mono', monospace; color: #fff; margin-left: 8px; }
    `;
    document.head.appendChild(style);
})();

// ==========================================
// WAIT FOR HTML DOM TO FULLY LOAD
// ==========================================
document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 2. STATE MANAGEMENT & DOM SETUP
    // ==========================================
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
        const btnGroup = document.createElement('div');
        btnGroup.className = 'button-group';
        
        const convertBtn = document.createElement('button');
        convertBtn.className = 'btn-action';
        convertBtn.innerHTML = '<i class="fa-brands fa-markdown"></i> Convert to Markdown';
        convertBtn.addEventListener('click', executeConversion);
        
        btnGroup.appendChild(convertBtn);
        actionContainer.appendChild(btnGroup);
    }
    initConvertUI();

    // ==========================================
    // 3. BULLETPROOF EVENT LISTENERS 
    // ==========================================
    
    if (selectFilesBtn) {
        selectFilesBtn.addEventListener('click', (e) => {
            e.preventDefault(); 
            e.stopPropagation(); 
            fileInput.click();
        });
    }

    dropzone.addEventListener('click', (e) => {
        if (!activePdfFile && e.target !== fileInput) {
            fileInput.click();
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFile(e.target.files[0]);
            fileInput.value = ''; // Reset
        }
    });

    dropzone.addEventListener('dragover', (e) => { 
        e.preventDefault(); 
        dropzone.classList.add('dragover'); 
    });
    
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
    
    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
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
        event.stopPropagation(); 
        event.preventDefault();
        activePdfFile = null;
        renderFileCard();
    };

    window.resetTool = function() {
        window.location.reload(); 
    };

    // ==========================================
    // 5. CLIENT-SIDE TEXT PARSING LOGIC
    // ==========================================
    async function executeConversion() {
        if (!activePdfFile) {
            alert('Please upload a PDF file first.');
            return;
        }

        if (!window.pdfjsLib) {
            alert('Parsing engine is still loading. Please wait a moment and try again.');
            return;
        }

        const convertBtn = actionContainer.querySelector('.btn-action');
        
        try {
            convertBtn.disabled = true;
            convertBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Initializing...';

            // 1. Load the PDF
            const arrayBuffer = await activePdfFile.arrayBuffer();
            const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
            const totalPages = pdf.numPages;
            
            // Markdown header
            let markdownContent = `# Extracted Content: ${activePdfFile.name}\n\n`;
            markdownContent += `> Automatically generated by PDFase\n\n---\n\n`;

            // 2. Extract Text Page by Page
            for (let i = 1; i <= totalPages; i++) {
                convertBtn.innerHTML = `<i class="fa-solid fa-code fa-beat-fade"></i> Parsing <span class="progress-text">Page ${i} / ${totalPages}</span>`;
                
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                
                markdownContent += `## Page ${i}\n\n`;

                let lastY = -1;
                let pageText = '';

                // PDF.js returns text items as absolute coordinates. 
                // We use a heuristic: if the Y coordinate changes by more than 5 points, we assume a new line.
                for (let j = 0; j < textContent.items.length; j++) {
                    const item = textContent.items[j];
                    const currentY = item.transform[5]; // The Y coordinate

                    if (lastY !== -1 && Math.abs(lastY - currentY) > 5) {
                        pageText += '\n'; // Trigger a new line in markdown
                    }

                    pageText += item.str;
                    lastY = currentY;
                }

                // Add the cleaned page text to our main document
                markdownContent += pageText + '\n\n---\n\n';
            }

            convertBtn.innerHTML = '<i class="fa-solid fa-file-code fa-bounce"></i> Generating Markdown...';

            // 3. Create the standard .md Blob
            const mdBlob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
            const url = URL.createObjectURL(mdBlob);
            
            // 4. Create final filename (include PDFase brand)
            const baseName = activePdfFile.name.replace(/\.[^/.]+$/, "");
            const finalFileName = `PDFase_${baseName}.md`;
            
            setTimeout(() => {
                document.getElementById('pdf-dropzone').style.display = 'none';
                
                actionContainer.innerHTML = `
                    <div class="success-message">
                        <i class="fa-solid fa-circle-check"></i> Conversion Complete!
                    </div>
                    <div class="file-flow">
                        <span class="file-flow-name">${activePdfFile.name}</span>
                        <i class="fa-solid fa-arrow-right" style="color: var(--theme-color, #b829ff); margin: 0 10px;"></i>
                        <span class="file-flow-final">${finalFileName}</span>
                        <span style="display: block; width: 100%; margin-top: 5px; color: var(--text-muted); font-size: 0.8rem;">
                            Extracted text from ${totalPages} page(s)
                        </span>
                    </div>
                    <div class="button-group">
                        <a href="${url}" download="${finalFileName}" class="btn-action">
                            <i class="fa-solid fa-download"></i> Download .md
                        </a>
                        <button class="btn-secondary" onclick="resetTool()">
                            <i class="fa-solid fa-rotate-right"></i> Convert Another
                        </button>
                        <a href="/" class="btn-secondary">
                            <i class="fa-solid fa-toolbox"></i> Other Tools
                        </a>
                    </div>
                `;
            }, 500);

        } catch (error) {
            console.error('Conversion Error:', error);
            alert('An error occurred while parsing the PDF text. It might be corrupted, password protected, or contain only scanned images.');
            convertBtn.disabled = false;
            convertBtn.innerHTML = '<i class="fa-brands fa-markdown"></i> Convert to Markdown';
        }
    }

}); // End of DOMContentLoaded
