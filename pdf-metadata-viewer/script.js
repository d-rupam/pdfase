// ==========================================
// 1. INJECT DEPENDENCIES & STYLES (PDF METADATA VIEWER)
// ==========================================
(function initEnvironment() {
    if (!window.PDFLib) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js';
        document.head.appendChild(script);
    }

    const style = document.createElement('style');
    style.innerHTML = `
        /* Dynamic Dropzone Shrinking */
        .dropzone.has-files { padding: 2rem 1rem 1rem 1rem !important; cursor: default; border: 1px solid var(--border-subtle); background-color: var(--bg-card); }
        .dropzone.has-files .dropzone-icon, 
        .dropzone.has-files .dropzone-text, 
        .dropzone.has-files .btn-upload, 
        .dropzone.has-files .privacy-badge,
        .dropzone.has-files br { display: none; }

        /* A4 Grid Layout */
        .a4-grid { display: flex; flex-wrap: wrap; gap: 0.75rem; justify-content: center; width: 100%; padding: 10px 0 0 0; margin: 0; }
        
        /* Rigid Fixed-Height Cards */
        .a4-card { width: 110px; height: 160px; background-color: var(--bg-base); border: 1px solid var(--border-subtle); border-radius: 6px; position: relative; padding: 10px; text-align: center; display: block; transition: all 0.2s ease; box-shadow: 0 4px 10px rgba(0,0,0,0.2); user-select: none; margin-top: 5px; }
        .a4-card:hover { border-color: rgba(255, 191, 0, 0.5); transform: translateY(-3px); box-shadow: 0 6px 15px rgba(255, 191, 0, 0.15); }
        
        .a4-icon-wrapper { height: 90px; display: flex; align-items: center; justify-content: center; width: 100%; }
        .a4-icon { font-size: 2.2rem; color: var(--theme-color, #ffbf00); transition: color 0.2s; }
        
        /* Fixed multi-line text truncation */
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

        /* Action UI */
        .action-container { margin-top: 1.5rem !important; display: none; flex-direction: column; align-items: center; gap: 1rem; animation: fadeIn 0.4s ease; max-width: 600px; margin: 0 auto; width: 100%; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        .options-panel { background: rgba(255, 191, 0, 0.02); border: 1px solid rgba(255, 191, 0, 0.15); padding: 1.25rem 1.5rem; border-radius: 8px; width: 100%; text-align: left; }
        .preflight-report-title { font-size: 0.95rem; font-weight: 700; color: #fff; border-bottom: 1px solid rgba(255, 191, 0, 0.2); padding-bottom: 8px; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
        
        .preflight-metrics { display: flex; flex-direction: column; gap: 8px; font-size: 0.85rem; font-family: 'JetBrains Mono', monospace; }
        .metric-row { display: flex; justify-content: space-between; background: var(--bg-base); padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-subtle); align-items: flex-start; gap: 1rem; }
        .metric-label { color: var(--text-muted); min-width: 130px; font-weight: 600; }
        .metric-val { color: var(--theme-color, #ffbf00); font-weight: 600; text-align: right; word-break: break-word; flex: 1; }

        .btn-action { background-color: var(--theme-color, #ffbf00); color: #000; border: none; padding: 0.85rem 2.5rem; font-size: 1.05rem; font-weight: 700; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(255, 191, 0, 0.2); display: inline-flex; align-items: center; gap: 8px; font-family: inherit; }
        .btn-action:hover { filter: brightness(1.1); transform: translateY(-2px); }
        .btn-action:disabled { background-color: #222; color: #666; cursor: not-allowed; transform: none; box-shadow: none; }
        
        .btn-secondary { background: transparent; color: var(--text-main); border: 1px solid var(--border-subtle); padding: 0.85rem 1.75rem; font-size: 0.95rem; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; font-family: inherit; display: inline-flex; align-items: center; gap: 8px; }
        .btn-secondary:hover { border-color: var(--theme-color, #ffbf00); color: var(--theme-color, #ffbf00); background-color: rgba(255, 191, 0, 0.05); }
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
    
    // Create A4 Grid container
    const a4Grid = document.createElement('div');
    a4Grid.className = 'a4-grid';
    a4Grid.style.display = 'none';
    dropzone.appendChild(a4Grid);

    // Create Action container below dropzone
    const actionContainer = document.createElement('div');
    actionContainer.className = 'action-container';
    dropzone.parentNode.insertBefore(actionContainer, dropzone.nextSibling);

    // ==========================================
    // 3. EVENT LISTENERS
    // ==========================================
    if (selectFilesBtn) {
        selectFilesBtn.addEventListener('click', (e) => {
            e.preventDefault(); e.stopPropagation(); fileInput.click();
        });
    }

    dropzone.addEventListener('click', (e) => {
        if (!mainPdfFile && e.target !== fileInput && !e.target.closest('.a4-card')) {
            fileInput.click();
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
            handleMainFile(e.target.files[0]);
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
            handleMainFile(e.dataTransfer.files[0]);
        }
    });

    window.addEventListener('paste', (e) => {
        if (e.clipboardData && e.clipboardData.files.length > 0) {
            handleMainFile(e.clipboardData.files[0]);
        }
    });

    async function handleMainFile(file) {
        if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
            alert('Invalid format. Please select a valid PDF document.');
            return;
        }
        
        if (!window.PDFLib) {
            alert('Engine is still loading. Please wait a moment.');
            return;
        }

        try {
            rawPdfBuffer = await file.arrayBuffer();
            mainPdfFile = file;
            renderFileCard();
            initActionUI();
        } catch (err) {
            console.error("Load Error:", err);
            alert("Could not read PDF file. Ensure it is not corrupted.");
        }
    }

    function renderFileCard() {
        a4Grid.innerHTML = '';
        if (!mainPdfFile) {
            dropzone.classList.remove('has-files');
            a4Grid.style.display = 'none';
            actionContainer.style.display = 'none';
            return;
        }
        
        dropzone.classList.add('has-files');
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
        actionContainer.innerHTML = '';
    };

    window.resetTool = function() { 
        window.removeMainFile();
    };

    function initActionUI() {
        actionContainer.innerHTML = `
            <button class="btn-action" id="btn-view-meta">
                <i class="fa-solid fa-magnifying-glass"></i> Extract Metadata
            </button>
        `;
        document.getElementById('btn-view-meta').addEventListener('click', executeMetadataExtraction);
    }

    // ==========================================
    // 4. METADATA EXTRACTION LOGIC
    // ==========================================
    async function executeMetadataExtraction() {
        if (!rawPdfBuffer) return;
        
        const btn = document.getElementById('btn-view-meta');
        btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Reading Data...';
        btn.disabled = true;

        try {
            const { PDFDocument } = window.PDFLib;
            // Load without updating metadata so we read exactly what is currently inside
            const pdfDoc = await PDFDocument.load(rawPdfBuffer, { updateMetadata: false });
            
            const formatData = (data) => data ? data : '<span style="color:var(--text-muted)">Not set</span>';
            
            // Build the metadata dictionary
            const metadata = {
                "File Name": mainPdfFile.name,
                "File Size": (mainPdfFile.size / 1024).toFixed(2) + ' KB',
                "Page Count": pdfDoc.getPageCount(),
                "Title": formatData(pdfDoc.getTitle()),
                "Author": formatData(pdfDoc.getAuthor()),
                "Subject": formatData(pdfDoc.getSubject()),
                "Creator": formatData(pdfDoc.getCreator()),
                "Producer": formatData(pdfDoc.getProducer()),
                "Keywords": formatData(pdfDoc.getKeywords()),
                "Creation Date": pdfDoc.getCreationDate() ? pdfDoc.getCreationDate().toLocaleString() : '<span style="color:var(--text-muted)">Not set</span>',
                "Modification Date": pdfDoc.getModificationDate() ? pdfDoc.getModificationDate().toLocaleString() : '<span style="color:var(--text-muted)">Not set</span>'
            };

            let metricsHtml = '';
            for (const [key, value] of Object.entries(metadata)) {
                metricsHtml += `
                    <div class="metric-row">
                        <span class="metric-label">${key}:</span> 
                        <span class="metric-val">${value}</span>
                    </div>
                `;
            }

            // Render the results
            setTimeout(() => {
                actionContainer.innerHTML = `
                    <div class="options-panel">
                        <div class="preflight-report-title">
                            <i class="fa-solid fa-circle-info"></i> Document Properties
                        </div>
                        <div class="preflight-metrics">
                            ${metricsHtml}
                        </div>
                    </div>
                    <div style="margin-top: 1rem;">
                        <button class="btn-secondary" onclick="resetTool()">
                            <i class="fa-solid fa-rotate-right"></i> Check Another File
                        </button>
                    </div>
                `;
            }, 300); // Slight delay for UI smoothness

        } catch (error) {
            console.error('Metadata Read Error:', error);
            alert('Could not read metadata. The file might be encrypted with a password or corrupted.');
            btn.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i> Extract Metadata';
            btn.disabled = false;
        }
    }
});
