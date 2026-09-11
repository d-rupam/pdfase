// ==========================================
// 1. INJECT DEPENDENCIES & STYLES (ZIP PDF)
// ==========================================
(function initEnvironment() {
    // Inject JSZip library for creating zip archives entirely client-side
    if (!window.JSZip) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
        document.head.appendChild(script);
    }

    const style = document.createElement('style');
    style.innerHTML = `
        .dropzone { transition: padding 0.3s ease, min-height 0.3s ease; -webkit-tap-highlight-color: transparent; cursor: pointer; }
        .dropzone.has-files { padding: 1.25rem 1rem 0.25rem 1rem !important; margin-bottom: 0 !important; cursor: default; }

        .a4-grid { display: flex; flex-wrap: wrap; gap: 0.75rem; justify-content: center; width: 100%; padding: 0; margin: 0; max-height: 240px; overflow-y: auto; }
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
        
        .options-panel { background: rgba(255, 191, 0, 0.02); border: 1px solid rgba(255, 191, 0, 0.15); padding: 1.25rem 1.5rem; border-radius: 8px; display: flex; flex-direction: column; gap: 0.75rem; align-items: center; width: 100%; max-width: 420px; font-family: 'Space Grotesk', sans-serif; text-align: center; }
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

    let activeFiles = []; 

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

    function initZipUI() {
        actionContainer.innerHTML = '';
        
        const optionsPanel = document.createElement('div');
        optionsPanel.className = 'options-panel';
        optionsPanel.innerHTML = `
            <p><i class="fa-solid fa-file-zipper" style="color: var(--theme-color);"></i> Ready to bundle <strong id="file-count-badge" style="color:#fff;">0</strong> PDF file(s) into a compressed ZIP package.</p>
        `;

        const btnGroup = document.createElement('div');
        btnGroup.className = 'button-group';
        
        const actionBtn = document.createElement('button');
        actionBtn.className = 'btn-action';
        actionBtn.innerHTML = '<i class="fa-solid fa-file-zipper"></i> Create ZIP Archive';
        actionBtn.addEventListener('click', executeZipArchiving);
        
        btnGroup.appendChild(actionBtn);
        actionContainer.appendChild(optionsPanel);
        actionContainer.appendChild(btnGroup);
    }

    initZipUI();

    // ==========================================
    // 3. FILE EVENT LISTENERS
    // ==========================================
    if (selectFilesBtn) {
        selectFilesBtn.addEventListener('click', (e) => {
            e.preventDefault(); e.stopPropagation(); fileInput.click();
        });
    }

    dropzone.addEventListener('click', (e) => {
        if (e.target !== fileInput && !e.target.closest('.a4-card')) fileInput.click();
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
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
        }
    });

    window.addEventListener('paste', (e) => {
        if (e.clipboardData && e.clipboardData.files.length > 0) handleFiles(e.clipboardData.files);
    });

    function handleFiles(files) {
        let addedCount = 0;
        Array.from(files).forEach(file => {
            if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
                // Prevent duplicate naming conflicts in array
                if (!activeFiles.some(f => f.name === file.name && f.size === file.size)) {
                    activeFiles.push(file);
                    addedCount++;
                }
            }
        });

        if (addedCount > 0 || activeFiles.length > 0) {
            renderFileGrid();
            const badge = document.getElementById('file-count-badge');
            if (badge) badge.innerText = activeFiles.length;
        } else {
            alert('Please select valid PDF documents.');
        }
    }

    function renderFileGrid() {
        a4Grid.innerHTML = '';
        if (activeFiles.length === 0) {
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

        activeFiles.forEach((file, index) => {
            const item = document.createElement('div');
            item.className = 'a4-card';
            item.innerHTML = `
                <button class="a4-remove" onclick="removeFileAtIndex(event, ${index})" title="Remove File">
                    <i class="fa-solid fa-xmark"></i>
                </button>
                <div class="a4-icon-wrapper">
                    <i class="fa-solid fa-file-pdf a4-icon"></i>
                </div>
                <div class="a4-name" title="${file.name}">${file.name}</div>
            `;
            a4Grid.appendChild(item);
        });
    }

    window.removeFileAtIndex = function(event, index) {
        event.stopPropagation(); event.preventDefault();
        activeFiles.splice(index, 1);
        renderFileGrid();
        const badge = document.getElementById('file-count-badge');
        if (badge) badge.innerText = activeFiles.length;
    };

    window.resetTool = function() { window.location.reload(); };

    // ==========================================
    // 4. CLIENT-SIDE ZIP CREATION LOGIC
    // ==========================================
    async function executeZipArchiving() {
        if (activeFiles.length === 0) return alert('Please upload at least one PDF file.');
        if (!window.JSZip) return alert('Archiving engine is still loading. Please wait.');

        const actionBtn = actionContainer.querySelector('.btn-action');

        try {
            actionBtn.disabled = true;
            actionBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Building ZIP Archive...';

            const zip = new window.JSZip();

            // Handle filename deduplication if files share identical names
            const nameTracker = {};
            
            for (let i = 0; i < activeFiles.length; i++) {
                const file = activeFiles[i];
                let fileName = file.name;
                
                if (nameTracker[fileName]) {
                    nameTracker[fileName]++;
                    const extIndex = fileName.lastIndexOf('.');
                    const base = fileName.substring(0, extIndex);
                    const ext = fileName.substring(extIndex);
                    fileName = `${base}_${nameTracker[fileName]}${ext}`;
                } else {
                    nameTracker[fileName] = 1;
                }

                const buffer = await file.arrayBuffer();
                zip.file(fileName, buffer);
            }

            // Generate compressed ZIP binary
            const content = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
            const url = URL.createObjectURL(content);
            
            const finalFileName = `PDFase_Archive_${Date.now()}.zip`;
            
            setTimeout(() => {
                document.getElementById('pdf-dropzone').style.display = 'none';
                
                const stealthAttribution = Math.random() > 0.5 
                    ? `<div style="margin-top: 10px; font-size: 0.75rem; color: var(--text-muted);">Processed securely via <a href="https://rupamdas.in" target="_blank" rel="noopener" style="color: inherit; text-decoration: none;">PDFase Engine</a></div>`
                    : `<div style="margin-top: 10px; font-size: 0.75rem; color: var(--text-muted);">Client utility crafted by <a href="https://rupamdas.in" target="_blank" rel="noopener" style="color: inherit; text-decoration: none;">Rupam Das</a></div>`;

                actionContainer.innerHTML = `
                    <div class="success-message">
                        <i class="fa-solid fa-circle-check"></i> ZIP Archive Created Successfully!
                    </div>
                    <div class="file-flow">
                        <span class="file-flow-name">${activeFiles.length} PDF files bundled</span>
                        <i class="fa-solid fa-arrow-right" style="color: var(--theme-color, #ffbf00); margin: 0 10px;"></i>
                        <span class="file-flow-final">${finalFileName}</span>
                    </div>
                    ${stealthAttribution}
                    <div class="button-group" style="margin-top: 15px;">
                        <a href="${url}" download="${finalFileName}" class="btn-action">
                            <i class="fa-solid fa-download"></i> Download ZIP Archive
                        </a>
                        <button class="btn-secondary" onclick="resetTool()">
                            <i class="fa-solid fa-rotate-right"></i> Create Another
                        </button>
                    </div>
                `;
            }, 600);

        } catch (error) {
            console.error('ZIP Creation Error:', error);
            alert('A critical error occurred while building the archive.');
            actionBtn.disabled = false;
            actionBtn.innerHTML = '<i class="fa-solid fa-file-zipper"></i> Create ZIP Archive';
        }
    }

});
