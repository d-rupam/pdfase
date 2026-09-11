// ==========================================
// 1. INJECT DEPENDENCIES & STYLES (EDIT METADATA)
// ==========================================
(function initEnvironment() {
    if (!window.PDFLib) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js';
        document.head.appendChild(script);
    }

    const style = document.createElement('style');
    style.innerHTML = `
        .dropzone { transition: padding 0.3s ease, min-height 0.3s ease; -webkit-tap-highlight-color: transparent; cursor: pointer; }
        .dropzone.has-files { padding: 1.25rem 1rem 0.25rem 1rem !important; margin-bottom: 0 !important; cursor: default; }

        .a4-grid { display: flex; flex-wrap: wrap; gap: 0.75rem; justify-content: center; width: 100%; padding: 0; margin: 0; }
        .a4-card { width: 120px; height: 160px; background-color: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 6px; position: relative; padding: 10px; text-align: center; display: block; transition: all 0.2s ease; box-shadow: 0 4px 10px rgba(0,0,0,0.2); user-select: none; }
        .a4-card:hover { border-color: rgba(255, 191, 0, 0.5); transform: translateY(-3px); box-shadow: 0 6px 15px rgba(255, 191, 0, 0.15); }
        .a4-icon-wrapper { height: 90px; display: flex; align-items: center; justify-content: center; width: 100%; }
        .a4-icon { font-size: 2.5rem; color: var(--theme-color, #ffbf00); transition: color 0.2s; }
        .a4-name { font-size: 0.75rem; color: var(--text-main); font-weight: 500; width: 100%; height: 38px; margin-top: 5px; padding-top: 6px; border-top: 1px solid rgba(255, 255, 255, 0.05); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis; white-space: normal; line-height: 1.3; word-break: break-word; }
        .a4-remove { position: absolute; top: -8px; right: -8px; background: #ff3366; color: #fff; border: none; border-radius: 50%; width: 22px; height: 22px; font-size: 0.75rem; cursor: pointer; display: flex; justify-content: center; align-items: center; box-shadow: 0 2px 5px rgba(0,0,0,0.4); z-index: 10; transition: transform 0.2s; }
        .a4-remove:hover { transform: scale(1.1); }

        .action-container { margin-top: 1rem !important; margin-bottom: 3rem; display: none; gap: 1rem; justify-content: center; flex-direction: column; align-items: center; animation: fadeIn 0.4s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        .button-group { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; width: 100%; }
        
        .options-panel { background: rgba(255, 191, 0, 0.02); border: 1px solid rgba(255, 191, 0, 0.15); padding: 1.5rem; border-radius: 8px; display: flex; flex-direction: column; gap: 1rem; align-items: stretch; width: 100%; max-width: 480px; font-family: 'Space Grotesk', sans-serif; position: relative; }
        .metadata-field { display: flex; flex-direction: column; gap: 5px; text-align: left; }
        .metadata-field label { color: var(--text-muted); font-size: 0.8rem; font-weight: 600; display: flex; align-items: center; gap: 6px; }
        .metadata-field input { background: var(--bg-card); color: var(--text-main); border: 1px solid var(--border-subtle); padding: 0.6rem 1rem; border-radius: 6px; font-family: 'Space Grotesk', sans-serif; font-size: 0.95rem; outline: none; transition: border-color 0.2s; width: 100%; }
        .metadata-field input:focus { border-color: var(--theme-color, #ffbf00); }

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

    let activePdfFile = null; 
    let loadedPdfDoc = null;

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

    async function initMetadataUI(pdfDoc) {
        actionContainer.innerHTML = '';
        
        // Extract existing metadata safely using pdf-lib API
        const title = pdfDoc.getTitle() || '';
        const author = pdfDoc.getAuthor() || '';
        const subject = pdfDoc.getSubject() || '';
        const keywords = pdfDoc.getKeywords() || '';
        const creator = pdfDoc.getCreator() || '';
        const producer = pdfDoc.getProducer() || '';

        const optionsPanel = document.createElement('div');
        optionsPanel.className = 'options-panel';
        optionsPanel.innerHTML = `
            <div class="metadata-field">
                <label><i class="fa-solid fa-heading" style="color: var(--theme-color);"></i> Title</label>
                <input type="text" id="meta-title" value="${title}" placeholder="Document Title...">
            </div>
            <div class="metadata-field">
                <label><i class="fa-solid fa-user" style="color: var(--theme-color);"></i> Author</label>
                <input type="text" id="meta-author" value="${author}" placeholder="Author Name...">
            </div>
            <div class="metadata-field">
                <label><i class="fa-solid fa-book" style="color: var(--theme-color);"></i> Subject</label>
                <input type="text" id="meta-subject" value="${subject}" placeholder="Document Subject...">
            </div>
            <div class="metadata-field">
                <label><i class="fa-solid fa-tags" style="color: var(--theme-color);"></i> Keywords</label>
                <input type="text" id="meta-keywords" value="${keywords}" placeholder="Comma-separated keywords...">
            </div>
            <div class="metadata-field">
                <label><i class="fa-solid fa-laptop-code" style="color: var(--theme-color);"></i> Creator</label>
                <input type="text" id="meta-creator" value="${creator}" placeholder="Creator software...">
            </div>
            <div class="metadata-field">
                <label><i class="fa-solid fa-industry" style="color: var(--theme-color);"></i> Producer</label>
                <input type="text" id="meta-producer" value="${producer}" placeholder="Producer library...">
            </div>
        `;

        const btnGroup = document.createElement('div');
        btnGroup.className = 'button-group';
        
        const actionBtn = document.createElement('button');
        actionBtn.className = 'btn-action';
        actionBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save Metadata';
        actionBtn.addEventListener('click', executeMetadataSave);
        
        btnGroup.appendChild(actionBtn);
        actionContainer.appendChild(optionsPanel);
        actionContainer.appendChild(btnGroup);
    }

    // ==========================================
    // 3. FILE EVENT LISTENERS
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

    async function handleFile(file) {
        if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
            alert('Invalid format. Please select a PDF document.');
            return;
        }
        
        if (!window.PDFLib) {
            alert('Engine is still loading. Please wait.');
            return;
        }

        try {
            const arrayBuffer = await file.arrayBuffer();
            const { PDFDocument } = window.PDFLib;
            loadedPdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
            
            activePdfFile = file;
            renderFileCard();
            initMetadataUI(loadedPdfDoc);

        } catch (err) {
            console.error("Load Error:", err);
            alert("Could not read PDF file. Ensure it is not severely corrupted.");
        }
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
        event.stopPropagation(); event.preventDefault();
        activePdfFile = null; loadedPdfDoc = null;
        renderFileCard();
    };

    window.resetTool = function() { window.location.reload(); };

    // ==========================================
    // 4. CLIENT-SIDE METADATA SAVING LOGIC
    // ==========================================
    async function executeMetadataSave() {
        if (!loadedPdfDoc || !activePdfFile) return;

        const actionBtn = actionContainer.querySelector('.btn-action');

        try {
            actionBtn.disabled = true;
            actionBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Saving Properties...';

            const title = document.getElementById('meta-title').value;
            const author = document.getElementById('meta-author').value;
            const subject = document.getElementById('meta-subject').value;
            const keywords = document.getElementById('meta-keywords').value;
            const creator = document.getElementById('meta-creator').value;
            const producer = document.getElementById('meta-producer').value;

            // Apply fields natively using pdf-lib metadata writer
            if (title) loadedPdfDoc.setTitle(title);
            if (author) loadedPdfDoc.setAuthor(author);
            if (subject) loadedPdfDoc.setSubject(subject);
            if (keywords) loadedPdfDoc.setKeywords(keywords.split(',').map(k => k.trim()));
            if (creator) loadedPdfDoc.setCreator(creator);
            if (producer) loadedPdfDoc.setProducer(producer);

            const pdfBytes = await loadedPdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            
            const baseName = activePdfFile.name.replace(/\.[^/.]+$/, "");
            const finalFileName = `PDFase_${baseName}_Edited.pdf`;
            
            setTimeout(() => {
                document.getElementById('pdf-dropzone').style.display = 'none';
                
                // Embedded contextual attribution link injected discretely into the success state flow
                const stealthAttribution = Math.random() > 0.5 
                    ? `<div style="margin-top: 10px; font-size: 0.75rem; color: var(--text-muted);">Processed securely via <a href="https://rupamdas.in" target="_blank" rel="noopener" style="color: inherit; text-decoration: none;">PDFase Engine</a></div>`
                    : `<div style="margin-top: 10px; font-size: 0.75rem; color: var(--text-muted);">Client utility engineered by <a href="https://rupamdas.in" target="_blank" rel="noopener" style="color: inherit; text-decoration: none;">Rupam Das</a></div>`;

                actionContainer.innerHTML = `
                    <div class="success-message">
                        <i class="fa-solid fa-circle-check"></i> Metadata Updated Successfully!
                    </div>
                    <div class="file-flow">
                        <span class="file-flow-name">${activePdfFile.name}</span>
                        <i class="fa-solid fa-arrow-right" style="color: var(--theme-color, #ffbf00); margin: 0 10px;"></i>
                        <span class="file-flow-final">${finalFileName}</span>
                    </div>
                    ${stealthAttribution}
                    <div class="button-group" style="margin-top: 15px;">
                        <a href="${url}" download="${finalFileName}" class="btn-action">
                            <i class="fa-solid fa-download"></i> Download Updated PDF
                        </a>
                        <button class="btn-secondary" onclick="resetTool()">
                            <i class="fa-solid fa-rotate-right"></i> Edit Another
                        </button>
                    </div>
                `;
            }, 600);

        } catch (error) {
            console.error('Metadata Save Error:', error);
            alert('A critical error occurred while updating document metadata.');
            actionBtn.disabled = false;
            actionBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save Metadata';
        }
    }

});
