// ==========================================
// 1. INJECT DEPENDENCIES & STYLES (INTERWEAVE PDF)
// ==========================================
(function initEnvironment() {
    // pdf-lib for processing/interweaving the files
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

        /* A4 Grid Layout inside Dropzone */
        .a4-grid { display: flex; flex-wrap: wrap; gap: 0.75rem; justify-content: center; width: 100%; padding: 0; margin: 0; }
        
        /* Rigid Fixed-Height Cards */
        .a4-card { width: 110px; height: 160px; background-color: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 6px; position: relative; padding: 10px; text-align: center; display: block; cursor: grab; transition: all 0.2s ease; box-shadow: 0 4px 10px rgba(0,0,0,0.2); user-select: none; }
        .a4-card:hover { border-color: rgba(0, 255, 204, 0.5); transform: translateY(-3px); box-shadow: 0 6px 15px rgba(0, 255, 204, 0.15); }
        .a4-card.dragging { opacity: 0.4; border-color: var(--cyber-cyan); transform: scale(1.05); z-index: 50; }
        
        .a4-icon-wrapper { height: 90px; display: flex; align-items: center; justify-content: center; width: 100%; position: relative; }
        .a4-icon { font-size: 2.5rem; color: var(--text-muted); transition: color 0.2s; }
        .a4-card:hover .a4-icon { color: var(--cyber-cyan); }
        
        /* Order Badge */
        .order-badge { position: absolute; top: -5px; left: -5px; background: var(--bg-base); color: var(--cyber-cyan); border: 1px solid var(--cyber-cyan); width: 22px; height: 22px; border-radius: 50%; font-size: 0.7rem; font-weight: bold; display: flex; align-items: center; justify-content: center; font-family: 'JetBrains Mono', monospace; }

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
        
        .a4-remove { position: absolute; top: -8px; right: -8px; background: #ff3366; color: #fff; border: none; border-radius: 50%; width: 22px; height: 22px; font-size: 0.75rem; cursor: pointer; display: flex; justify-content: center; align-items: center; box-shadow: 0 2px 5px rgba(0,0,0,0.4); z-index: 10; transition: transform 0.2s;}
        .a4-remove:hover { transform: scale(1.1); }
        
        .a4-add { border: 2px dashed rgba(0, 255, 204, 0.3); background: rgba(0, 255, 204, 0.02); color: var(--cyber-cyan); cursor: pointer; box-shadow: none; display: flex; flex-direction: column; justify-content: center; }
        .a4-add:hover { border-color: var(--cyber-cyan); background: rgba(0, 255, 204, 0.05); transform: translateY(-3px); }
        .a4-add .a4-icon { color: var(--cyber-cyan); font-size: 2rem; margin-bottom: 5px; }
        .a4-add .a4-name { color: var(--cyber-cyan); font-weight: 600; border-top: none; height: auto; margin-top: 0; padding-top: 0; display: block; }

        /* Action Container */
        .action-container { margin-top: 1.5rem !important; margin-bottom: 3rem; display: none; gap: 0.5rem; justify-content: center; flex-direction: column; align-items: center; }
        .button-group { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; width: 100%; }
        
        .btn-action { background-color: var(--cyber-cyan); color: #000; border: none; padding: 0.85rem 2.5rem; font-size: 1.05rem; font-weight: 700; font-family: 'Space Grotesk', sans-serif; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 0 15px rgba(0, 255, 204, 0.2); text-decoration: none; display: inline-flex; align-items: center; gap: 8px; }
        .btn-action:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 5px 20px rgba(0, 255, 204, 0.4); }
        .btn-action:disabled { background-color: #2a2a2a; color: #666; cursor: not-allowed; box-shadow: none; border: 1px solid #444; }
        
        .btn-secondary { background-color: transparent; color: var(--text-main); border: 1px solid var(--border-subtle); padding: 0.85rem 1.75rem; font-size: 0.95rem; font-weight: 600; font-family: 'Space Grotesk', sans-serif; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; }
        .btn-secondary:hover { border-color: var(--cyber-cyan); color: var(--cyber-cyan); background-color: rgba(0, 255, 204, 0.05); }

        /* Success UI */
        .success-message { width: 100%; text-align: center; color: var(--cyber-cyan); font-size: 1.2rem; font-weight: 600; margin-bottom: 0.25rem; }
        .file-flow { color: var(--text-muted); font-size: 0.85rem; margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: center; gap: 8px; flex-wrap: wrap; background: rgba(0, 255, 204, 0.03); padding: 10px 20px; border-radius: 8px; border: 1px solid rgba(0, 255, 204, 0.2); text-align: center; max-width: 100%; word-break: break-word; }
        .file-flow-name { color: var(--text-main); font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; }
        .file-flow-final { color: #fff; font-weight: 700; border-bottom: 1px dashed var(--cyber-cyan); font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; }
    `;
    document.head.appendChild(style);
})();

document.addEventListener('DOMContentLoaded', () => {

    let pdfFiles = []; 
    let draggedItemIndex = null;

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

    let interweaveBtn;

    function initUI() {
        actionContainer.innerHTML = '';
        const btnGroup = document.createElement('div');
        btnGroup.className = 'button-group';
        
        interweaveBtn = document.createElement('button');
        interweaveBtn.className = 'btn-action';
        interweaveBtn.innerHTML = '<i class="fa-solid fa-shuffle"></i> Interweave PDFs';
        interweaveBtn.addEventListener('click', executeInterweave);
        
        btnGroup.appendChild(interweaveBtn);
        actionContainer.appendChild(btnGroup);
    }
    initUI();

    // ==========================================
    // 3. EVENT LISTENERS
    // ==========================================
    if (selectFilesBtn) {
        selectFilesBtn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); fileInput.click(); });
    }

    dropzone.addEventListener('click', (e) => {
        if (pdfFiles.length === 0 && e.target !== fileInput) fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files);
            fileInput.value = ''; 
        }
    });

    dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files);
    });

    window.addEventListener('paste', (e) => {
        if (e.clipboardData && e.clipboardData.files.length > 0) handleFiles(e.clipboardData.files);
    });

    // ==========================================
    // 4. FILE HANDLING & UI RENDERING
    // ==========================================
    async function handleFiles(files) {
        // Create an array of File objects and deep clone their buffers immediately for safety
        const newFilesPromises = Array.from(files)
            .filter(file => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'))
            .map(async (file) => {
                const buffer = await file.arrayBuffer();
                return {
                    name: file.name,
                    safeBytes: buffer.slice(0) // Deep clone
                };
            });

        const newFiles = await Promise.all(newFilesPromises);

        if (newFiles.length === 0) {
            alert('Invalid format. Please select PDF documents only.');
            return;
        }

        pdfFiles = [...pdfFiles, ...newFiles];
        renderFileList();
    }

    function renderFileList() {
        a4Grid.innerHTML = '';
        
        if (pdfFiles.length === 0) {
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

        pdfFiles.forEach((fileObj, index) => {
            const item = document.createElement('div');
            item.className = 'a4-card';
            item.draggable = true;
            item.dataset.index = index;

            item.innerHTML = `
                <div class="order-badge">${index + 1}</div>
                <button class="a4-remove" onclick="removeFile(event, ${index})" title="Remove File">
                    <i class="fa-solid fa-xmark"></i>
                </button>
                <div class="a4-icon-wrapper">
                    <i class="fa-solid fa-file-pdf a4-icon"></i>
                </div>
                <div class="a4-name" title="${fileObj.name}">${fileObj.name}</div>
            `;

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
                pdfFiles = newOrderNodes.map(node => pdfFiles[node.dataset.index]);
                renderFileList(); 
            });

            a4Grid.appendChild(item);
        });

        // Add More Button
        const addMoreCard = document.createElement('div');
        addMoreCard.className = 'a4-card a4-add';
        addMoreCard.onclick = (e) => {
            e.stopPropagation();
            fileInput.click();
        };
        addMoreCard.innerHTML = `
            <div class="a4-icon-wrapper" style="height: auto;">
                <i class="fa-solid fa-plus a4-icon"></i>
            </div>
            <div class="a4-name">Add More</div>
        `;
        a4Grid.appendChild(addMoreCard);

        // Update button state based on file count
        if (pdfFiles.length < 2) {
            interweaveBtn.disabled = true;
            interweaveBtn.innerHTML = '<i class="fa-solid fa-shuffle"></i> Require 2+ Files';
        } else {
            interweaveBtn.disabled = false;
            interweaveBtn.innerHTML = '<i class="fa-solid fa-shuffle"></i> Interweave PDFs';
        }
    }

    window.removeFile = function(event, index) {
        event.stopPropagation(); 
        event.preventDefault();
        pdfFiles.splice(index, 1);
        renderFileList();
    };

    window.resetTool = function() {
        window.location.reload(); 
    };

    // ==========================================
    // 5. CLIENT-SIDE INTERWEAVE LOGIC (pdf-lib)
    // ==========================================
    async function executeInterweave() {
        if (pdfFiles.length < 2) return;

        try {
            interweaveBtn.disabled = true;
            interweaveBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Processing...';

            const { PDFDocument } = window.PDFLib;
            const newPdf = await PDFDocument.create();
            
            const loadedPdfs = [];
            let maxPages = 0;

            // Load all PDFs into memory and find the max page count
            for (const fileObj of pdfFiles) {
                const pdf = await PDFDocument.load(fileObj.safeBytes, { ignoreEncryption: true });
                loadedPdfs.push(pdf);
                if (pdf.getPageCount() > maxPages) {
                    maxPages = pdf.getPageCount();
                }
            }

            // Core Interweave Logic: Pull one page from each document sequentially
            let totalPagesMixed = 0;
            for (let pageIndex = 0; pageIndex < maxPages; pageIndex++) {
                for (const pdf of loadedPdfs) {
                    if (pageIndex < pdf.getPageCount()) {
                        const [copiedPage] = await newPdf.copyPages(pdf, [pageIndex]);
                        newPdf.addPage(copiedPage);
                        totalPagesMixed++;
                    }
                }
            }

            const pdfBytes = await newPdf.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            
            const finalFileName = `PDFase_Interwoven.pdf`;
            
            setTimeout(() => {
                dropzone.style.display = 'none';
                
                actionContainer.innerHTML = `
                    <div class="success-message">
                        <i class="fa-solid fa-circle-check"></i> Interweave Complete!
                    </div>
                    <div class="file-flow">
                        <span class="file-flow-name">${pdfFiles.length} files combined</span>
                        <i class="fa-solid fa-shuffle" style="color: var(--cyber-cyan); margin: 0 10px; font-size: 0.8rem;"></i>
                        <span class="file-flow-name">${totalPagesMixed} Pages Alternated</span>
                        <i class="fa-solid fa-arrow-right" style="color: var(--cyber-cyan); margin: 0 10px; font-size: 0.8rem;"></i>
                        <span class="file-flow-final">${finalFileName}</span>
                    </div>
                    <div class="button-group">
                        <a href="${url}" download="${finalFileName}" class="btn-action">
                            <i class="fa-solid fa-download"></i> Download PDF
                        </a>
                        <button class="btn-secondary" onclick="resetTool()">
                            <i class="fa-solid fa-rotate-right"></i> Process More
                        </button>
                        <a href="/" class="btn-secondary">
                            <i class="fa-solid fa-toolbox"></i> Other Tools
                        </a>
                    </div>
                `;
            }, 600);

        } catch (error) {
            console.error('Interweave Error:', error);
            alert('Process Failed. Error: ' + error.message);
            
            interweaveBtn.disabled = false;
            interweaveBtn.innerHTML = `<i class="fa-solid fa-shuffle"></i> Interweave PDFs`; 
        }
    }

});
