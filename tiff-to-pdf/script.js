// ==========================================
// 1. INJECT DEPENDENCIES & STYLES (TIFF TO PDF)
// ==========================================
(function initEnvironment() {
    // Inject jsPDF for creating PDF documents locally
    if (!window.jspdf) {
        const scriptPdf = document.createElement('script');
        scriptPdf.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        document.head.appendChild(scriptPdf);
    }

    // Inject UTIF.js to decode TIFF files in the browser natively
    if (!window.UTIF) {
        const scriptUtif = document.createElement('script');
        scriptUtif.src = 'https://unpkg.com/utif@3.1.0/UTIF.js';
        document.head.appendChild(scriptUtif);
    }

    const style = document.createElement('style');
    style.innerHTML = `
        /* Dynamic Dropzone Shrinking */
        .dropzone { transition: padding 0.3s ease, min-height 0.3s ease; -webkit-tap-highlight-color: transparent; cursor: pointer; }
        .dropzone.has-files { padding: 1.25rem 1rem 0.25rem 1rem !important; margin-bottom: 0 !important; cursor: default; }

        /* A4 Grid Layout for the selected files */
        .a4-grid { display: flex; flex-wrap: wrap; gap: 0.75rem; justify-content: center; width: 100%; padding: 0; margin: 0; }
        
        /* Rigid Fixed-Height Cards */
        .a4-card { width: 120px; height: 160px; background-color: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 6px; position: relative; padding: 10px; text-align: center; display: block; cursor: grab; transition: all 0.2s ease; box-shadow: 0 4px 10px rgba(0,0,0,0.2); user-select: none; }
        .a4-card:hover { border-color: rgba(184, 41, 255, 0.5); transform: translateY(-3px); box-shadow: 0 6px 15px rgba(184, 41, 255, 0.15); }
        .a4-card.dragging { opacity: 0.4; border-color: var(--theme-color); transform: scale(1.05); }
        
        .a4-icon-wrapper { height: 90px; display: flex; align-items: center; justify-content: center; width: 100%; background: rgba(0,0,0,0.2); border-radius: 4px; overflow: hidden; }
        .a4-thumbnail { width: 100%; height: 100%; object-fit: cover; pointer-events: none; }
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
            pointer-events: none;
        }
        
        .a4-remove { position: absolute; top: -8px; right: -8px; background: #ff3366; color: #fff; border: none; border-radius: 50%; width: 22px; height: 22px; font-size: 0.75rem; cursor: pointer; display: flex; justify-content: center; align-items: center; box-shadow: 0 2px 5px rgba(0,0,0,0.4); z-index: 10; transition: transform 0.2s; }
        .a4-remove:hover { transform: scale(1.1); }

        /* ADD MORE CARD STYLES */
        .a4-add { border: 2px dashed rgba(184, 41, 255, 0.3); background: rgba(184, 41, 255, 0.02); color: var(--theme-color); cursor: pointer; box-shadow: none; display: flex; flex-direction: column; justify-content: center; }
        .a4-add:hover { border-color: var(--theme-color); background: rgba(184, 41, 255, 0.05); transform: translateY(-3px); }
        .a4-add .a4-icon { color: var(--theme-color); font-size: 2rem; margin-bottom: 5px; }
        .a4-add .a4-name { color: var(--theme-color); font-weight: 600; border-top: none; height: auto; margin-top: 0; padding-top: 0; display: block; }

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
    let activeImageFiles = []; 
    let draggedItemIndex = null;
    
    // Memory cache to hold decoded TIFF data (DataURL, Width, Height)
    // so we don't have to decode twice (once for thumbnail, once for PDF)
    const tiffCache = new Map(); 

    const dropzone = document.getElementById('image-dropzone');
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
        convertBtn.innerHTML = '<i class="fa-regular fa-file-pdf"></i> Convert to PDF';
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
        if (activeImageFiles.length === 0 && e.target !== fileInput) {
            fileInput.click();
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files);
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
            handleFiles(e.dataTransfer.files);
        }
    });

    // ==========================================
    // 4. FILE HANDLING, TIFF DECODING & UI RENDERING
    // ==========================================
    function handleFiles(files) {
        // Filter for TIFF files
        const newFiles = Array.from(files).filter(file => 
            file.type === 'image/tiff' || 
            file.name.toLowerCase().endsWith('.tif') || 
            file.name.toLowerCase().endsWith('.tiff')
        );
        
        if (newFiles.length === 0) {
            alert('No valid TIFF images found. Please select .tif or .tiff files.');
            return;
        }
        
        activeImageFiles = [...activeImageFiles, ...newFiles];
        renderFileCards();
    }

    // Function to natively decode TIFF into a Base64 JPEG data URL for display & PDF insertion
    async function processTiff(file) {
        return new Promise(async (resolve, reject) => {
            try {
                const buffer = await file.arrayBuffer();
                const ifds = window.UTIF.decode(buffer);
                window.UTIF.decodeImage(buffer, ifds[0]);
                const rgba = window.UTIF.toRGBA8(ifds[0]);
                
                const canvas = document.createElement('canvas');
                canvas.width = ifds[0].width;
                canvas.height = ifds[0].height;
                const ctx = canvas.getContext('2d');
                
                const imageData = ctx.createImageData(canvas.width, canvas.height);
                imageData.data.set(new Uint8ClampedArray(rgba));
                ctx.putImageData(imageData, 0, 0);
                
                // Convert to high-quality JPEG data URL
                const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
                resolve({ dataUrl: dataUrl, width: canvas.width, height: canvas.height });
            } catch (err) {
                reject(err);
            }
        });
    }

    function renderFileCards() {
        a4Grid.innerHTML = '';
        
        if (activeImageFiles.length === 0) {
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

        activeImageFiles.forEach((file, index) => {
            const item = document.createElement('div');
            item.className = 'a4-card';
            item.draggable = true;
            item.dataset.index = index;
            
            // Unique ID to inject thumbnail after async TIFF decode
            const thumbId = `thumb-wrapper-${Math.random().toString(36).substr(2, 9)}`;

            item.innerHTML = `
                <button class="a4-remove" onclick="removeFile(event, ${index})" title="Remove Image">
                    <i class="fa-solid fa-xmark"></i>
                </button>
                <div class="a4-icon-wrapper" id="${thumbId}">
                    <i class="fa-solid fa-circle-notch fa-spin a4-icon" style="font-size: 1.5rem;"></i>
                </div>
                <div class="a4-name" title="${file.name}">${file.name}</div>
            `;

            // Load the TIFF image asynchronously (or from cache)
            if (tiffCache.has(file)) {
                const cachedData = tiffCache.get(file);
                setTimeout(() => {
                    const wrapper = document.getElementById(thumbId);
                    if(wrapper) wrapper.innerHTML = `<img src="${cachedData.dataUrl}" class="a4-thumbnail" alt="${file.name}">`;
                }, 0);
            } else {
                if(window.UTIF) {
                    processTiff(file).then(data => {
                        tiffCache.set(file, data);
                        const wrapper = document.getElementById(thumbId);
                        if(wrapper) wrapper.innerHTML = `<img src="${data.dataUrl}" class="a4-thumbnail" alt="${file.name}">`;
                    }).catch(err => {
                        console.error("Failed to decode TIFF:", err);
                        const wrapper = document.getElementById(thumbId);
                        if(wrapper) wrapper.innerHTML = `<i class="fa-solid fa-triangle-exclamation a4-icon" style="color: #ff3366; font-size: 1.5rem;"></i>`;
                    });
                }
            }

            // Drag and Drop reordering events
            item.addEventListener('dragstart', () => { 
                draggedItemIndex = index; 
                setTimeout(() => item.classList.add('dragging'), 0); 
            });
            item.addEventListener('dragend', () => item.classList.remove('dragging'));
            
            item.addEventListener('dragover', (e) => {
                e.preventDefault();
                const draggingEl = document.querySelector('.dragging');
                if (!draggingEl) return;
                
                const bounding = item.getBoundingClientRect();
                if (e.clientX > bounding.left + bounding.width / 2) {
                    item.parentNode.insertBefore(draggingEl, item.nextSibling);
                } else {
                    item.parentNode.insertBefore(draggingEl, item);
                }
            });
            
            item.addEventListener('drop', (e) => {
                e.preventDefault();
                const newOrderNodes = [...a4Grid.querySelectorAll('.a4-card:not(.a4-add)')];
                activeImageFiles = newOrderNodes.map(node => activeImageFiles[node.dataset.index]);
                renderFileCards(); 
            });

            a4Grid.appendChild(item);
        });

        // "Add More" Card Logic
        const addMoreCard = document.createElement('div');
        addMoreCard.className = 'a4-card a4-add';
        addMoreCard.onclick = (e) => {
            e.stopPropagation();
            fileInput.click();
        };
        addMoreCard.innerHTML = `
            <div class="a4-icon-wrapper" style="height: auto; background: transparent;">
                <i class="fa-solid fa-plus a4-icon"></i>
            </div>
            <div class="a4-name">Add More</div>
        `;
        a4Grid.appendChild(addMoreCard);
    }

    window.removeFile = function(event, index) {
        event.stopPropagation(); 
        event.preventDefault();
        
        // Remove from cache to free memory
        const fileToRemove = activeImageFiles[index];
        if (tiffCache.has(fileToRemove)) {
            tiffCache.delete(fileToRemove);
        }
        
        activeImageFiles.splice(index, 1);
        renderFileCards();
    };

    window.resetTool = function() {
        window.location.reload(); 
    };

    // ==========================================
    // 5. CLIENT-SIDE CONVERSION LOGIC (jsPDF)
    // ==========================================
    async function executeConversion() {
        if (activeImageFiles.length === 0) {
            alert('Please add at least one TIFF image.');
            return;
        }

        if (!window.jspdf || !window.jspdf.jsPDF || !window.UTIF) {
            alert('Rendering engines are still loading. Please wait a moment and try again.');
            return;
        }

        const convertBtn = actionContainer.querySelector('.btn-action');
        
        try {
            convertBtn.disabled = true;
            
            // Hide the "Add More" card during processing
            const addMoreCard = a4Grid.querySelector('.a4-add');
            if (addMoreCard) addMoreCard.style.display = 'none';
            
            convertBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Initializing...';

            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
            
            const a4Width = 210; // mm
            const a4Height = 297; // mm

            for (let i = 0; i < activeImageFiles.length; i++) {
                convertBtn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Processing <span class="progress-text">${i + 1} / ${activeImageFiles.length}</span>`;
                
                const file = activeImageFiles[i];
                
                // Fetch the decoded TIFF image from cache. (Wait for it if still decoding)
                let tiffData = tiffCache.get(file);
                if (!tiffData) {
                    tiffData = await processTiff(file);
                    tiffCache.set(file, tiffData);
                }

                const imgRatio = tiffData.width / tiffData.height;
                const a4Ratio = a4Width / a4Height;
                
                let renderWidth, renderHeight, x, y;

                if (imgRatio > a4Ratio) {
                    renderWidth = a4Width;
                    renderHeight = a4Width / imgRatio;
                    x = 0;
                    y = (a4Height - renderHeight) / 2;
                } else {
                    renderHeight = a4Height;
                    renderWidth = a4Height * imgRatio;
                    y = 0;
                    x = (a4Width - renderWidth) / 2;
                }

                if (i > 0) {
                    pdf.addPage();
                }

                // Add the decoded image data to jsPDF
                pdf.addImage(tiffData.dataUrl, 'JPEG', x, y, renderWidth, renderHeight);
            }

            convertBtn.innerHTML = '<i class="fa-solid fa-box-archive fa-bounce"></i> Generating PDF...';

            const pdfBlob = pdf.output('blob');
            const url = URL.createObjectURL(pdfBlob);
            
            const baseName = activeImageFiles.length === 1 
                ? activeImageFiles[0].name.replace(/\.[^/.]+$/, "") 
                : "Combined_TIFFs";
            const finalFileName = `PDFase_${baseName}.pdf`;
            
            setTimeout(() => {
                document.getElementById('image-dropzone').style.display = 'none';
                
                actionContainer.innerHTML = `
                    <div class="success-message">
                        <i class="fa-solid fa-circle-check"></i> Document Ready!
                    </div>
                    <div class="file-flow">
                        <span class="file-flow-name">${activeImageFiles.length} TIFF(s)</span>
                        <i class="fa-solid fa-arrow-right" style="color: var(--theme-color, #b829ff); margin: 0 10px;"></i>
                        <span class="file-flow-final">${finalFileName}</span>
                    </div>
                    <div class="button-group">
                        <a href="${url}" download="${finalFileName}" class="btn-action">
                            <i class="fa-solid fa-download"></i> Download PDF
                        </a>
                        <button class="btn-secondary" onclick="resetTool()">
                            <i class="fa-solid fa-rotate-right"></i> Convert More
                        </button>
                        <a href="/" class="btn-secondary">
                            <i class="fa-solid fa-toolbox"></i> Other Tools
                        </a>
                    </div>
                `;
            }, 500);

        } catch (error) {
            console.error('Conversion Error:', error);
            alert('An error occurred while building the PDF. One of the TIFF files might be corrupted or unsupported.');
            convertBtn.disabled = false;
            convertBtn.innerHTML = '<i class="fa-regular fa-file-pdf"></i> Convert to PDF';
            
            const addMoreCard = a4Grid.querySelector('.a4-add');
            if (addMoreCard) addMoreCard.style.display = 'flex';
        }
    }

}); // End of DOMContentLoaded
