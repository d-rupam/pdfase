// ==========================================
// 1. INJECT DEPENDENCIES & STYLES (ADD ATTACHMENTS)
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

        .a4-grid { display: flex; flex-wrap: wrap; gap: 0.75rem; justify-content: center; width: 100%; padding: 0; margin: 0; max-height: 220px; overflow-y: auto; }
        .a4-card { width: 110px; height: 150px; background-color: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 6px; position: relative; padding: 8px; text-align: center; display: block; transition: all 0.2s ease; box-shadow: 0 4px 10px rgba(0,0,0,0.2); user-select: none; }
        .a4-card:hover { border-color: rgba(255, 191, 0, 0.5); transform: translateY(-3px); box-shadow: 0 6px 15px rgba(255, 191, 0, 0.15); }
        .a4-icon-wrapper { height: 80px; display: flex; align-items: center; justify-content: center; width: 100%; }
        .a4-icon { font-size: 2.2rem; color: var(--theme-color, #ffbf00); transition: color 0.2s; }
        .a4-name { font-size: 0.7rem; color: var(--text-main); font-weight: 500; width: 100%; height: 35px; margin-top: 4px; padding-top: 4px; border-top: 1px solid rgba(255, 255, 255, 0.05); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis; white-space: normal; line-height: 1.2; word-break: break-word; }
        .a4-remove { position: absolute; top: -6px; right: -6px; background: #ff3366; color: #fff; border: none; border-radius: 50%; width: 20px; height: 20px; font-size: 0.7rem; cursor: pointer; display: flex; justify-content: center; align-items: center; box-shadow: 0 2px 5px rgba(0,0,0,0.4); z-index: 10; transition: transform 0.2s; }
        .a4-remove:hover { transform: scale(1.1); }

        .action-container { margin-top: 1rem !important; margin-bottom: 3rem; display: none; gap: 1rem; justify-content: center; flex-direction: column; align-items: center; animation: fadeIn 0.4s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        .button-group { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; width: 100%; }
        
        .options-panel { background: rgba(255, 191, 0, 0.02); border: 1px solid rgba(255, 191, 0, 0.15); padding: 1.25rem 1.5rem; border-radius: 8px; display: flex; flex-direction: column; gap: 1rem; align-items: stretch; width: 100%; max-width: 480px; font-family: 'Space Grotesk', sans-serif; }
        .attachment-drop-box { border: 2px dashed rgba(255, 191, 0, 0.3); border-radius: 8px; padding: 1.25rem; text-align: center; background: rgba(0,0,0,0.2); cursor: pointer; transition: border-color 0.2s; }
        .attachment-drop-box:hover { border-color: var(--theme-color); }
        .attachment-list { display: flex; flex-direction: column; gap: 6px; max-height: 140px; overflow-y: auto; text-align: left; }
        .attachment-item { display: flex; justify-content: space-between; align-items: center; background: var(--bg-card); padding: 6px 10px; border-radius: 6px; font-size: 0.85rem; border: 1px solid var(--border-subtle); }
        .attachment-item span { font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; color: #fff; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 320px; }

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
    let loadedPdfDoc = null;
    let attachedFiles = [];

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

    function initAttachmentUI() {
        actionContainer.innerHTML = '';
        
        const optionsPanel = document.createElement('div');
        optionsPanel.className = 'options-panel';
        optionsPanel.innerHTML = `
            <div style="font-size: 0.9rem; font-weight: 600; color: #fff; display: flex; align-items: center; gap: 8px;">
                <i class="fa-solid fa-paperclip" style="color: var(--theme-color);"></i> Auxiliary Files to Embed
            </div>
            
            <input type="file" id="attachment-file-input" multiple style="display: none;">
            <div class="attachment-drop-box" id="attachment-drop-box">
                <i class="fa-solid fa-cloud-arrow-up" style="font-size: 1.5rem; color: var(--theme-color); margin-bottom: 5px;"></i>
                <div style="font-size: 0.85rem; color: var(--text-main);">Click or drop files here to attach</div>
            </div>

            <div class="attachment-list" id="attachment-list-container" style="display: none;"></div>
        `;

        const btnGroup = document.createElement('div');
        btnGroup.className = 'button-group';
        
        const actionBtn = document.createElement('button');
        actionBtn.className = 'btn-action';
        actionBtn.innerHTML = '<i class="fa-solid fa-file-circle-plus"></i> Embed Attachments';
        actionBtn.addEventListener('click', executeEmbedding);
        
        btnGroup.appendChild(actionBtn);
        actionContainer.appendChild(optionsPanel);
        actionContainer.appendChild(btnGroup);

        // Setup secondary file picker events
        const attachBox = optionsPanel.querySelector('#attachment-drop-box');
        const attachInput = optionsPanel.querySelector('#attachment-file-input');

        attachBox.addEventListener('click', () => attachInput.click());
        attachInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files.length > 0) {
                Array.from(e.target.files).forEach(f => {
                    if (!attachedFiles.some(existing => existing.name === f.name && existing.size === f.size)) {
                        attachedFiles.push(f);
                    }
                });
                renderAttachmentList();
                attachInput.value = '';
            }
        });
    }

    function renderAttachmentList() {
        const container = document.getElementById('attachment-list-container');
        if (!container) return;

        if (attachedFiles.length === 0) {
            container.style.display = 'none';
            container.innerHTML = '';
            return;
        }

        container.style.display = 'flex';
        container.innerHTML = '';

        attachedFiles.forEach((file, index) => {
            const item = document.createElement('div');
            item.className = 'attachment-item';
            item.innerHTML = `
                <span><i class="fa-solid fa-file" style="color: var(--theme-color); margin-right: 6px;"></i> ${file.name}</span>
                <button style="background:transparent; border:none; color:#ff3366; cursor:pointer; font-size:0.9rem;" onclick="removeAttachment(${index})" title="Remove">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            `;
            container.appendChild(item);
        });
    }

    window.removeAttachment = function(index) {
        attachedFiles.splice(index, 1);
        renderAttachmentList();
    };

    // ==========================================
    // 3. MAIN FILE EVENT LISTENERS
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
        
        if (!window.PDFLib) {
            alert('Engine is still loading. Please wait.');
            return;
        }

        try {
            const arrayBuffer = await file.arrayBuffer();
            const { PDFDocument } = window.PDFLib;
            loadedPdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
            
            mainPdfFile = file;
            renderFileCard();
            initAttachmentUI();

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
            <button class="a4-remove" onclick="removeMainFile(event)" title="Remove File">
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
        event.stopPropagation(); event.preventDefault();
        mainPdfFile = null; loadedPdfDoc = null; attachedFiles = [];
        renderFileCard();
    };

    window.resetTool = function() { window.location.reload(); };

    // ==========================================
    // 4. CLIENT-SIDE EMBEDDING LOGIC
    // ==========================================
    async function executeEmbedding() {
        if (!loadedPdfDoc || !mainPdfFile) return alert('Please upload a main PDF file first.');
        if (attachedFiles.length === 0) return alert('Please select at least one file to attach.');

        const actionBtn = actionContainer.querySelector('.btn-action');

        try {
            actionBtn.disabled = true;
            actionBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Embedding Files...';

            for (let i = 0; i < attachedFiles.length; i++) {
                const attFile = attachedFiles[i];
                const attBuffer = await attFile.arrayBuffer();
                
                // Embed attachment natively using pdf-lib attach API
                await loadedPdfDoc.attach(attBuffer, attFile.name, {
                    mimeType: attFile.type || 'application/octet-stream',
                    description: `Attached file: ${attFile.name}`,
                    creationDate: new Date(),
                    modificationDate: new Date(),
                });
            }

            const pdfBytes = await loadedPdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            
            const baseName = mainPdfFile.name.replace(/\.[^/.]+$/, "");
            const finalFileName = `PDFase_${baseName}_Attached.pdf`;
            
            setTimeout(() => {
                document.getElementById('pdf-dropzone').style.display = 'none';
                
                const stealthAttribution = Math.random() > 0.5 
                    ? `<div style="margin-top: 10px; font-size: 0.75rem; color: var(--text-muted);">Processed securely via <a href="https://rupamdas.in" target="_blank" rel="noopener" style="color: inherit; text-decoration: none;">PDFase Engine</a></div>`
                    : `<div style="margin-top: 10px; font-size: 0.75rem; color: var(--text-muted);">Client utility crafted by <a href="https://rupamdas.in" target="_blank" rel="noopener" style="color: inherit; text-decoration: none;">Rupam Das</a></div>`;

                actionContainer.innerHTML = `
                    <div class="success-message">
                        <i class="fa-solid fa-circle-check"></i> Attachments Embedded Successfully!
                    </div>
                    <div class="file-flow">
                        <span class="file-flow-name">${attachedFiles.length} file(s) embedded into ${mainPdfFile.name}</span>
                        <i class="fa-solid fa-arrow-right" style="color: var(--theme-color, #ffbf00); margin: 0 10px;"></i>
                        <span class="file-flow-final">${finalFileName}</span>
                    </div>
                    ${stealthAttribution}
                    <div class="button-group" style="margin-top: 15px;">
                        <a href="${url}" download="${finalFileName}" class="btn-action">
                            <i class="fa-solid fa-download"></i> Download Updated PDF
                        </a>
                        <button class="btn-secondary" onclick="resetTool()">
                            <i class="fa-solid fa-rotate-right"></i> Attach More
                        </button>
                    </div>
                `;
            }, 600);

        } catch (error) {
            console.error('Embedding Error:', error);
            alert('A critical error occurred while embedding files into the PDF.');
            actionBtn.disabled = false;
            actionBtn.innerHTML = '<i class="fa-solid fa-file-circle-plus"></i> Embed Attachments';
        }
    }

});
