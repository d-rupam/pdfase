// ==========================================
// 1. INJECT DEPENDENCIES & STYLES
// ==========================================
(function initEnvironment() {
    // Inject pdf-lib for reading, modifying, and saving the PDF
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
        
        /* Rigid Fixed-Height Card */
        .a4-card { width: 120px; height: 160px; background-color: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 6px; position: relative; padding: 10px; text-align: center; display: block; transition: all 0.2s ease; box-shadow: 0 4px 10px rgba(0,0,0,0.2); user-select: none; }
        .a4-card:hover { border-color: rgba(57, 255, 20, 0.5); transform: translateY(-3px); box-shadow: 0 6px 15px rgba(57, 255, 20, 0.15); }
        
        .a4-icon-wrapper { height: 90px; display: flex; align-items: center; justify-content: center; width: 100%; }
        .a4-icon { font-size: 2.5rem; color: var(--theme-color, #39ff14); transition: color 0.2s; }
        
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
        .action-container { margin-top: 1rem !important; margin-bottom: 3rem; display: none; gap: 1rem; justify-content: center; flex-direction: column; align-items: center; }
        .button-group { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; width: 100%; }
        
        /* Options Panel */
        .options-panel { background: rgba(57, 255, 20, 0.03); border: 1px solid rgba(57, 255, 20, 0.2); padding: 1rem 1.5rem; border-radius: 8px; display: flex; gap: 1rem; align-items: center; flex-wrap: wrap; justify-content: center; }
        .options-panel label { color: var(--text-muted); font-size: 0.9rem; font-weight: 500; }
        .options-panel select { background: var(--bg-card); color: var(--text-main); border: 1px solid var(--border-subtle); padding: 0.5rem 1rem; border-radius: 6px; font-family: 'Space Grotesk', sans-serif; font-size: 0.9rem; cursor: pointer; outline: none; transition: border-color 0.2s; }
        .options-panel select:focus, .options-panel select:hover { border-color: var(--theme-color, #39ff14); }
        
        .btn-action { background-color: var(--theme-color, #39ff14); color: #000; border: none; padding: 0.85rem 2.5rem; font-size: 1.05rem; font-weight: 700; font-family: 'Space Grotesk', sans-serif; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 0 15px rgba(57, 255, 20, 0.2); text-decoration: none; display: inline-flex; align-items: center; gap: 8px; }
        .btn-action:hover { transform: translateY(-3px); box-shadow: 0 5px 20px rgba(57, 255, 20, 0.4); }
        .btn-action:disabled { background-color: #333; color: #888; cursor: not-allowed; transform: none; box-shadow: none; }
        
        .btn-secondary { background-color: transparent; color: var(--text-main); border: 1px solid var(--border-subtle); padding: 0.85rem 1.75rem; font-size: 0.95rem; font-weight: 600; font-family: 'Space Grotesk', sans-serif; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; }
        .btn-secondary:hover { border-color: var(--theme-color, #39ff14); color: var(--theme-color, #39ff14); background-color: rgba(57, 255, 20, 0.05); }
        
        .success-message { width: 100%; text-align: center; color: var(--theme-color, #39ff14); font-size: 1.2rem; font-weight: 600; margin-bottom: 0.25rem; }
        
        .file-flow { color: var(--text-muted); font-size: 0.85rem; margin-bottom: 1rem; display: flex; align-items: center; justify-content: center; gap: 8px; flex-wrap: wrap; background: rgba(57, 255, 20, 0.03); padding: 10px 20px; border-radius: 8px; border: 1px solid rgba(57, 255, 20, 0.2); text-align: center; max-width: 100%; word-break: break-word; }
        .file-flow-name { color: var(--text-main); font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; }
        .file-flow-final { color: #fff; font-weight: 700; border-bottom: 1px dashed var(--theme-color, #39ff14); font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; }
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
        
        // Options Panel for Position Selection
        const optionsPanel = document.createElement('div');
        optionsPanel.className = 'options-panel';
        optionsPanel.innerHTML = `
            <label for="pos-select"><i class="fa-solid fa-arrows-to-dot" style="margin-right: 5px;"></i> Position:</label>
            <select id="pos-select">
                <option value="bottom-center">Bottom Center</option>
                <option value="bottom-right">Bottom Right</option>
                <option value="top-center">Top Center</option>
                <option value="top-right">Top Right</option>
            </select>
        `;

        const btnGroup = document.createElement('div');
        btnGroup.className = 'button-group';
        
        const actionBtn = document.createElement('button');
        actionBtn.className = 'btn-action';
        actionBtn.innerHTML = '<i class="fa-solid fa-list-ol"></i> Add Page Numbers';
        actionBtn.addEventListener('click', executeNumbering);
        
        btnGroup.appendChild(actionBtn);
        
        actionContainer.appendChild(optionsPanel);
        actionContainer.appendChild(btnGroup);
    }
    initConvertUI();

    // ==========================================
    // 3. BULLETPROOF EVENT LISTENERS 
    // ==========================================
    
    // 1. Button Click
    if (selectFilesBtn) {
        selectFilesBtn.addEventListener('click', (e) => {
            e.preventDefault(); 
            e.stopPropagation(); 
            fileInput.click();
        });
    }

    // 2. Dropzone Background/Icon/Text Click
    dropzone.addEventListener('click', (e) => {
        if (!activePdfFile && e.target !== fileInput) {
            fileInput.click();
        }
    });

    // 3. Hidden File Input Change
    fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFile(e.target.files[0]);
            fileInput.value = ''; 
        }
    });

    // 4. Drag & Drop
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

    // 5. CTRL+V Paste
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
    // 5. CLIENT-SIDE NUMBERING LOGIC (pdf-lib)
    // ==========================================
    async function executeNumbering() {
        if (!activePdfFile) {
            alert('Please upload a PDF file first.');
            return;
        }

        if (!window.PDFLib) {
            alert('Engine is still loading. Please wait a moment.');
            return;
        }

        const actionBtn = actionContainer.querySelector('.btn-action');
        const posSelect = document.getElementById('pos-select').value;
        
        try {
            actionBtn.disabled = true;
            actionBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Processing...';

            // 1. Load the PDF Document
            const arrayBuffer = await activePdfFile.arrayBuffer();
            const { PDFDocument, StandardFonts, rgb } = window.PDFLib;
            const pdfDoc = await PDFDocument.load(arrayBuffer);
            
            // 2. Embed standard Helvetica font
            const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
            
            // 3. Get Pages and Add Numbers
            const pages = pdfDoc.getPages();
            const fontSize = 11;
            const margin = 30; // 30 units from the edge
            
            pages.forEach((page, index) => {
                const { width, height } = page.getSize();
                const text = String(index + 1);
                const textWidth = helveticaFont.widthOfTextAtSize(text, fontSize);
                
                let x, y;

                // Calculate Position Math
                switch (posSelect) {
                    case 'bottom-center':
                        x = (width / 2) - (textWidth / 2);
                        y = margin;
                        break;
                    case 'bottom-right':
                        x = width - margin - textWidth;
                        y = margin;
                        break;
                    case 'top-center':
                        x = (width / 2) - (textWidth / 2);
                        y = height - margin - fontSize;
                        break;
                    case 'top-right':
                        x = width - margin - textWidth;
                        y = height - margin - fontSize;
                        break;
                    default:
                        x = (width / 2) - (textWidth / 2);
                        y = margin;
                }

                // Draw the number
                page.drawText(text, {
                    x: x,
                    y: y,
                    size: fontSize,
                    font: helveticaFont,
                    color: rgb(0, 0, 0), // Black text
                });
            });

            // 4. Save the modified PDF
            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            
            // 5. Create final filename
            const baseName = activePdfFile.name.replace(/\.[^/.]+$/, "");
            const finalFileName = `PDFase_${baseName}_Numbered.pdf`;
            
            setTimeout(() => {
                document.getElementById('pdf-dropzone').style.display = 'none';
                
                actionContainer.innerHTML = `
                    <div class="success-message">
                        <i class="fa-solid fa-circle-check"></i> Processing Complete!
                    </div>
                    <div class="file-flow">
                        <span class="file-flow-name">${activePdfFile.name}</span>
                        <i class="fa-solid fa-arrow-right" style="color: var(--theme-color, #39ff14); margin: 0 10px;"></i>
                        <span class="file-flow-final">${finalFileName}</span>
                        <span style="display: block; width: 100%; margin-top: 5px; color: var(--text-muted); font-size: 0.8rem;">
                            Numbered ${pages.length} page(s)
                        </span>
                    </div>
                    <div class="button-group">
                        <a href="${url}" download="${finalFileName}" class="btn-action">
                            <i class="fa-solid fa-download"></i> Download PDF
                        </a>
                        <button class="btn-secondary" onclick="resetTool()">
                            <i class="fa-solid fa-rotate-right"></i> Number Another
                        </button>
                        <a href="/" class="btn-secondary">
                            <i class="fa-solid fa-toolbox"></i> Other Tools
                        </a>
                    </div>
                `;
            }, 500);

        } catch (error) {
            console.error('Processing Error:', error);
            alert('A critical error occurred. Make sure your PDF is not encrypted with a password.');
            actionBtn.disabled = false;
            actionBtn.innerHTML = '<i class="fa-solid fa-list-ol"></i> Add Page Numbers';
        }
    }

}); // End of DOMContentLoaded
