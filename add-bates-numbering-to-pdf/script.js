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
        .a4-card { width: 120px; height: 160px; background-color: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 6px; position: relative; padding: 10px; text-align: center; display: block; transition: all 0.2s ease; box-shadow: 0 4px 10px rgba(0,0,0,0.2); user-select: none; }
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
        .action-container { margin-top: 1.5rem !important; margin-bottom: 3rem; display: none; gap: 1.5rem; justify-content: center; flex-direction: column; align-items: center; animation: fadeIn 0.4s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        
        .button-group { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; width: 100%; }
        
        /* Options Panel for Bates Config */
        .options-panel { background: rgba(57, 255, 20, 0.02); border: 1px solid rgba(57, 255, 20, 0.15); padding: 2rem; border-radius: 8px; display: flex; flex-direction: column; gap: 1.5rem; align-items: center; width: 100%; max-width: 600px; }
        
        .options-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 1rem; width: 100%; }
        .input-group { display: flex; flex-direction: column; gap: 6px; text-align: left; }
        .input-group label { color: var(--text-muted); font-size: 0.85rem; font-weight: 600; font-family: 'Space Grotesk', sans-serif; }
        .input-group input, .input-group select { background: var(--bg-card); color: #fff; border: 1px solid var(--border-subtle); padding: 0.65rem 0.8rem; border-radius: 6px; font-family: 'JetBrains Mono', monospace; font-size: 0.9rem; outline: none; transition: border-color 0.2s; width: 100%; }
        .input-group input:focus, .input-group select:focus { border-color: var(--theme-color, #39ff14); }
        
        /* Live Preview Widget */
        .live-preview-box { background: #050505; border: 1px dashed rgba(57, 255, 20, 0.4); padding: 1rem; border-radius: 6px; text-align: center; width: 100%; margin-top: 0.5rem; }
        .live-preview-text { color: var(--theme-color); font-family: 'JetBrains Mono', monospace; font-size: 1.2rem; font-weight: 700; letter-spacing: 1px; }
        .live-preview-label { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; display: block; }

        /* Action Buttons */
        .btn-action { 
            background-color: #2ee310; /* Comfortable dialed-back neon green */
            color: #0b1121; 
            border: none; 
            padding: 0.85rem 2.5rem; 
            font-size: 1.05rem; 
            font-weight: 700; 
            font-family: 'Space Grotesk', sans-serif; 
            border-radius: 8px; 
            cursor: pointer; 
            transition: all 0.3s ease; 
            box-shadow: 0 4px 15px rgba(46, 227, 16, 0.2); 
            text-decoration: none; 
            display: inline-flex; 
            align-items: center; 
            gap: 8px; 
        }
        .btn-action:hover { background-color: #34fa14; transform: translateY(-2px); box-shadow: 0 6px 20px rgba(46, 227, 16, 0.35); }
        .btn-action:disabled { background-color: #222; color: #666; cursor: not-allowed; transform: none; box-shadow: none; }
        
        .btn-secondary { background-color: transparent; color: var(--text-main); border: 1px solid var(--border-subtle); padding: 0.85rem 1.75rem; font-size: 0.95rem; font-weight: 600; font-family: 'Space Grotesk', sans-serif; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; }
        .btn-secondary:hover { border-color: var(--theme-color, #39ff14); color: var(--theme-color, #39ff14); background-color: rgba(57, 255, 20, 0.05); }
        
        /* Success UI */
        .success-message { width: 100%; text-align: center; color: var(--theme-color, #39ff14); font-size: 1.5rem; font-weight: 700; margin-bottom: 0.25rem; }
        .file-flow { color: var(--text-muted); font-size: 0.85rem; margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: center; gap: 8px; flex-wrap: wrap; background: rgba(57, 255, 20, 0.03); padding: 12px 24px; border-radius: 8px; border: 1px solid rgba(57, 255, 20, 0.2); text-align: center; max-width: 100%; word-break: break-word; }
        .file-flow-name { color: var(--text-main); font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; }
        .file-flow-final { color: #fff; font-weight: 700; border-bottom: 1px dashed var(--theme-color, #39ff14); font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; }
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
        
        // Configuration Panel
        const optionsPanel = document.createElement('div');
        optionsPanel.className = 'options-panel';
        optionsPanel.innerHTML = `
            <div class="options-grid">
                <div class="input-group">
                    <label for="bates-prefix">Prefix (Optional)</label>
                    <input type="text" id="bates-prefix" placeholder="e.g. DEF-" value="">
                </div>
                <div class="input-group">
                    <label for="bates-start">Start Number</label>
                    <input type="number" id="bates-start" value="1" min="1">
                </div>
                <div class="input-group">
                    <label for="bates-padding">Padding (Zeros)</label>
                    <input type="number" id="bates-padding" value="6" min="1" max="10">
                </div>
                <div class="input-group">
                    <label for="bates-suffix">Suffix (Optional)</label>
                    <input type="text" id="bates-suffix" placeholder="e.g. -A" value="">
                </div>
            </div>
            
            <div class="options-grid" style="grid-template-columns: 1fr;">
                <div class="input-group">
                    <label for="pos-select">Stamp Position</label>
                    <select id="pos-select">
                        <option value="bottom-right">Bottom Right</option>
                        <option value="bottom-center">Bottom Center</option>
                        <option value="bottom-left">Bottom Left</option>
                        <option value="top-right">Top Right</option>
                        <option value="top-center">Top Center</option>
                        <option value="top-left">Top Left</option>
                    </select>
                </div>
            </div>

            <div class="live-preview-box">
                <span class="live-preview-label">Live Preview</span>
                <div class="live-preview-text" id="bates-preview">000001</div>
            </div>
        `;

        const btnGroup = document.createElement('div');
        btnGroup.className = 'button-group';
        
        const actionBtn = document.createElement('button');
        actionBtn.className = 'btn-action';
        actionBtn.id = 'btn-apply-bates';
        actionBtn.innerHTML = '<i class="fa-solid fa-stamp"></i> Apply Bates Numbering';
        actionBtn.addEventListener('click', executeBatesNumbering);
        
        btnGroup.appendChild(actionBtn);
        
        actionContainer.appendChild(optionsPanel);
        actionContainer.appendChild(btnGroup);

        // Bind Live Preview Logic
        const inputs = ['bates-prefix', 'bates-start', 'bates-padding', 'bates-suffix'].map(id => optionsPanel.querySelector(`#${id}`));
        const previewEl = optionsPanel.querySelector('#bates-preview');

        function updatePreview() {
            const prefix = inputs[0].value;
            const startNum = inputs[1].value || "1";
            const padding = parseInt(inputs[2].value) || 1;
            const suffix = inputs[3].value;
            
            let numStr = startNum.toString();
            while (numStr.length < padding) numStr = "0" + numStr;
            
            previewEl.textContent = `${prefix}${numStr}${suffix}`;
        }

        inputs.forEach(input => {
            input.addEventListener('input', updatePreview);
            input.addEventListener('change', updatePreview);
        });
        updatePreview();
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
            fileInput.value = ''; 
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
    // 5. CLIENT-SIDE BATES LOGIC (pdf-lib)
    // ==========================================
    async function executeBatesNumbering() {
        if (!activePdfFile) {
            alert('Please upload a PDF file first.');
            return;
        }

        if (!window.PDFLib) {
            alert('Engine is still loading. Please wait a moment.');
            return;
        }

        const actionBtn = document.getElementById('btn-apply-bates');
        
        // Grab configurations
        const prefix = document.getElementById('bates-prefix').value;
        const startNumStr = document.getElementById('bates-start').value || "1";
        const padding = parseInt(document.getElementById('bates-padding').value) || 1;
        const suffix = document.getElementById('bates-suffix').value;
        const posSelect = document.getElementById('pos-select').value;
        
        let currentNum = parseInt(startNumStr) || 1;
        
        try {
            actionBtn.disabled = true;
            actionBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Processing...';

            const arrayBuffer = await activePdfFile.arrayBuffer();
            const { PDFDocument, StandardFonts, rgb } = window.PDFLib;
            const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
            
            const helveticaFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
            const pages = pdfDoc.getPages();
            const fontSize = 12;
            const margin = 35; // margin offset from page edges
            
            pages.forEach((page) => {
                const { width, height } = page.getSize();
                
                // Format the Bates Number String
                let numStr = currentNum.toString();
                while (numStr.length < padding) numStr = "0" + numStr;
                const text = `${prefix}${numStr}${suffix}`;
                
                const textWidth = helveticaFont.widthOfTextAtSize(text, fontSize);
                let x, y;

                // Calculate Position Math
                switch (posSelect) {
                    case 'bottom-center':
                        x = (width / 2) - (textWidth / 2);
                        y = margin;
                        break;
                    case 'bottom-left':
                        x = margin;
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
                    case 'top-left':
                        x = margin;
                        y = height - margin - fontSize;
                        break;
                    case 'top-right':
                        x = width - margin - textWidth;
                        y = height - margin - fontSize;
                        break;
                    default:
                        x = width - margin - textWidth;
                        y = margin;
                }

                page.drawText(text, {
                    x: x,
                    y: y,
                    size: fontSize,
                    font: helveticaFont,
                    color: rgb(0, 0, 0),
                });
                
                currentNum++;
            });

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            
            const baseName = activePdfFile.name.replace(/\.[^/.]+$/, "");
            const finalFileName = `PDFase_${baseName}_Bates.pdf`;
            
            setTimeout(() => {
                document.getElementById('pdf-dropzone').style.display = 'none';
                
                actionContainer.innerHTML = `
                    <div class="success-message">
                        <i class="fa-solid fa-circle-check"></i> Stamping Complete!
                    </div>
                    <div class="file-flow">
                        <span class="file-flow-name">${activePdfFile.name}</span>
                        <i class="fa-solid fa-arrow-right" style="color: var(--theme-color); margin: 0 10px;"></i>
                        <span class="file-flow-final">${finalFileName}</span>
                        <span style="display: block; width: 100%; margin-top: 8px; color: var(--text-muted); font-size: 0.85rem;">
                            Stamped ${pages.length} page(s)
                        </span>
                    </div>
                    <div class="button-group">
                        <a href="${url}" download="${finalFileName}" class="btn-action">
                            <i class="fa-solid fa-download"></i> Download Document
                        </a>
                        <button class="btn-secondary" onclick="resetTool()">
                            <i class="fa-solid fa-rotate-right"></i> Stamp Another
                        </button>
                        <a href="/" class="btn-secondary">
                            <i class="fa-solid fa-toolbox"></i> Other Tools
                        </a>
                    </div>
                `;
            }, 500);

        } catch (error) {
            console.error('Processing Error:', error);
            alert('A critical error occurred. Error: ' + error.message);
            actionBtn.disabled = false;
            actionBtn.innerHTML = '<i class="fa-solid fa-stamp"></i> Apply Bates Numbering';
        }
    }

}); // End of DOMContentLoaded
