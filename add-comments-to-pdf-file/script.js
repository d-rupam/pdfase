// ==========================================
// 1. INJECT DEPENDENCIES & STYLES
// ==========================================
(function initEnvironment() {
    // Inject pdf-lib for building the native PDF annotations
    if (!window.PDFLib) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js';
        document.head.appendChild(script);
    }

    // Inject pdf.js for rendering the visual document preview
    if (!window.pdfjsLib) {
        const pdfScript = document.createElement('script');
        pdfScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        document.head.appendChild(pdfScript);
    }

    const style = document.createElement('style');
    style.innerHTML = `
        /* Dynamic Dropzone Shrinking */
        .dropzone { transition: padding 0.3s ease, min-height 0.3s ease; cursor: pointer; }
        .dropzone.has-files { display: none !important; }

        /* Main Workspace Container */
        .workspace-container { display: none; flex-direction: column; width: 100%; margin-bottom: 3rem; animation: fadeIn 0.4s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        /* Top Toolbar (File Info & Global Controls) */
        .top-toolbar { width: 100%; display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; padding: 1rem 1.5rem; background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 8px; }
        .file-info { color: var(--text-main); font-family: 'JetBrains Mono', monospace; font-size: 0.9rem; font-weight: 600; display: flex; align-items: center; gap: 8px; }

        /* Main Workspace: Left Canvas, Right Controls */
        .comment-workspace { display: grid; grid-template-columns: 1fr 340px; gap: 2rem; width: 100%; align-items: start; }
        @media (max-width: 900px) { .comment-workspace { grid-template-columns: 1fr; } }

        /* --- Viewer Area (Left) --- */
        .viewer-panel { display: flex; flex-direction: column; gap: 1rem; align-items: center; width: 100%; }
        
        .canvas-wrapper { position: relative; background: #e0e0e0; border: 1px solid var(--border-subtle); border-radius: 6px; box-shadow: 0 4px 20px rgba(0,0,0,0.5); display: inline-block; user-select: none; touch-action: none; }
        #pdf-render-canvas { display: block; max-width: 100%; height: auto; }
        
        /* Interactive Overlay for Placing Comments */
        #draw-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; cursor: crosshair; z-index: 10; }
        
        /* Visual Comment Marker */
        .comment-marker { position: absolute; width: 24px; height: 24px; background-color: var(--theme-color); color: #000; border-radius: 50% 50% 50% 0; display: flex; justify-content: center; align-items: center; font-weight: bold; font-size: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.6); transform: translate(-50%, -100%); pointer-events: none; border: 2px solid #fff; font-family: 'JetBrains Mono', monospace; }

        /* Pagination Controls */
        .pagination-controls { display: flex; gap: 1rem; align-items: center; background: var(--bg-card); padding: 0.5rem 1.5rem; border-radius: 20px; border: 1px solid var(--border-subtle); }
        .page-btn { background: none; border: none; color: var(--theme-color); font-size: 1.2rem; cursor: pointer; transition: transform 0.2s; }
        .page-btn:hover:not(:disabled) { transform: scale(1.2); }
        .page-btn:disabled { color: #444; cursor: not-allowed; }
        .page-info { font-family: 'JetBrains Mono', monospace; font-size: 0.9rem; color: var(--text-main); }

        /* --- Controls Panel (Right) --- */
        .controls-panel { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; max-height: 600px; overflow-y: auto; }
        .controls-panel::-webkit-scrollbar { width: 6px; }
        .controls-panel::-webkit-scrollbar-thumb { background: rgba(57, 255, 20, 0.3); border-radius: 3px; }

        .controls-panel h3 { color: #fff; font-size: 1.1rem; border-bottom: 1px solid var(--border-subtle); padding-bottom: 0.5rem; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 10px; }
        .info-text { font-size: 0.85rem; color: var(--text-muted); line-height: 1.6; }
        
        .comment-list { display: flex; flex-direction: column; gap: 1rem; }
        
        .comment-item { background: rgba(255,255,255,0.03); border: 1px solid rgba(57, 255, 20, 0.2); border-left: 3px solid var(--theme-color); border-radius: 6px; padding: 10px; display: flex; flex-direction: column; gap: 8px; animation: fadeIn 0.3s ease; }
        .comment-header { display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; font-family: 'JetBrains Mono', monospace; color: var(--theme-color); font-weight: bold; }
        .comment-delete { background: none; border: none; color: #ff3366; cursor: pointer; font-size: 0.9rem; transition: transform 0.2s; }
        .comment-delete:hover { transform: scale(1.2); }
        .comment-input { background: var(--bg-base); color: #fff; border: 1px solid var(--border-subtle); padding: 0.75rem; border-radius: 4px; font-family: 'Space Grotesk', sans-serif; font-size: 0.9rem; outline: none; resize: vertical; min-height: 60px; width: 100%; transition: border-color 0.2s; }
        .comment-input:focus { border-color: var(--theme-color); }

        /* Action Box */
        .bottom-action-box { width: 100%; display: flex; justify-content: center; margin-top: 2rem; padding-top: 1rem; }
        
        .btn-action { background-color: #2ee310; color: #0b1121; border: none; padding: 1rem 3rem; font-size: 1.1rem; font-weight: 700; font-family: 'Space Grotesk', sans-serif; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(46, 227, 16, 0.2); display: inline-flex; align-items: center; gap: 10px; text-decoration: none; }
        .btn-action:hover { background-color: #34fa14; transform: translateY(-2px); box-shadow: 0 6px 20px rgba(46, 227, 16, 0.35); }
        .btn-action:disabled { background-color: #222; color: #666; cursor: not-allowed; transform: none; box-shadow: none; }
        
        .btn-secondary { background-color: transparent; color: var(--text-main); border: 1px solid var(--border-subtle); padding: 0.65rem 1.1rem; font-size: 0.85rem; font-weight: 600; font-family: 'Space Grotesk', sans-serif; border-radius: 6px; cursor: pointer; transition: all 0.3s ease; display: inline-flex; align-items: center; gap: 8px; }
        .btn-secondary:hover { border-color: var(--theme-color); color: var(--theme-color); background-color: rgba(57, 255, 20, 0.05); }

        .success-message { width: 100%; text-align: center; margin-bottom: 2rem; }
    `;
    document.head.appendChild(style);
})();

document.addEventListener('DOMContentLoaded', () => {
    
    // Core State
    let activePdfFile = null;
    let rawPdfBytes = null;
    let pdfDocProxy = null;
    let totalPages = 0;
    let currentPage = 1;
    let commentCounter = 1;
    
    // Store comments per page: { pageNum: [ { id, relX, relY, text, num } ] }
    let pageComments = {}; 

    const dropzone = document.getElementById('pdf-dropzone');
    const fileInput = document.getElementById('file-input');
    const selectFilesBtn = document.getElementById('select-files-btn');
    const mainContainer = dropzone.parentNode;

    // --- 1. BUILD UI ---
    const workspaceContainer = document.createElement('div');
    workspaceContainer.className = 'workspace-container';
    
    workspaceContainer.innerHTML = `
        <div class="top-toolbar">
            <div class="file-info" id="active-filename"><i class="fa-solid fa-file-pdf" style="color: var(--theme-color);"></i> document.pdf</div>
            <button class="btn-secondary" onclick="window.location.reload()"><i class="fa-solid fa-xmark"></i> Cancel</button>
        </div>

        <div class="comment-workspace">
            
            <!-- LEFT: Viewer Panel -->
            <div class="viewer-panel">
                <div class="canvas-wrapper" id="canvas-wrapper">
                    <canvas id="pdf-render-canvas"></canvas>
                    <div id="draw-overlay"></div>
                </div>
                
                <div class="pagination-controls">
                    <button class="page-btn" id="btn-prev" disabled><i class="fa-solid fa-circle-chevron-left"></i></button>
                    <span class="page-info">Page <span id="page-num">1</span> of <span id="page-count">1</span></span>
                    <button class="page-btn" id="btn-next" disabled><i class="fa-solid fa-circle-chevron-right"></i></button>
                </div>
            </div>

            <!-- RIGHT: Controls Panel -->
            <div class="controls-panel">
                <div>
                    <h3><i class="fa-solid fa-note-sticky" style="color: var(--theme-color);"></i> Annotations</h3>
                    <p class="info-text">Click anywhere on the document to drop a new sticky note comment.</p>
                </div>
                
                <div class="comment-list" id="comment-list-container">
                    <!-- Dynamic Textareas inserted here -->
                </div>
            </div>
        </div>

        <div class="bottom-action-box">
            <button class="btn-action" id="btn-apply-comments">
                <i class="fa-solid fa-code-merge"></i> Embed Comments & Download
            </button>
        </div>
    `;
    
    mainContainer.insertBefore(workspaceContainer, dropzone.nextSibling);

    // Elements
    const pdfRenderCanvas = document.getElementById('pdf-render-canvas');
    const pdfRenderCtx = pdfRenderCanvas.getContext('2d');
    const drawOverlay = document.getElementById('draw-overlay');
    const commentListContainer = document.getElementById('comment-list-container');

    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    const numSpan = document.getElementById('page-num');
    const countSpan = document.getElementById('page-count');
    
    // --- 2. UPLOAD & PDF.JS RENDERING ---
    if(selectFilesBtn) selectFilesBtn.addEventListener('click', (e) => { e.preventDefault(); fileInput.click(); });
    dropzone.addEventListener('click', (e) => { if (!activePdfFile && e.target !== fileInput) fileInput.click(); });
    fileInput.addEventListener('change', (e) => { if (e.target.files.length) handleFile(e.target.files[0]); });
    dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
    dropzone.addEventListener('drop', (e) => { e.preventDefault(); dropzone.classList.remove('dragover'); if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]); });

    async function handleFile(file) {
        if (file.type !== 'application/pdf') return alert('Please select a valid PDF.');
        activePdfFile = file;
        document.getElementById('active-filename').innerHTML = `<i class="fa-solid fa-file-pdf" style="color: var(--theme-color);"></i> ${file.name}`;
        
        dropzone.classList.add('has-files');
        workspaceContainer.style.display = 'flex';

        const rawBuffer = await activePdfFile.arrayBuffer();
        rawPdfBytes = rawBuffer.slice(0);

        if (!window.pdfjsLib) await new Promise(r => setTimeout(r, 300));
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

        pdfDocProxy = await window.pdfjsLib.getDocument({ data: new Uint8Array(rawBuffer) }).promise;
        totalPages = pdfDocProxy.numPages;
        countSpan.textContent = totalPages;
        
        // Initialize state
        for(let i=1; i<=totalPages; i++) pageComments[i] = [];
        
        renderPage(1);
    }

    async function renderPage(num) {
        const page = await pdfDocProxy.getPage(num);
        const viewport = page.getViewport({ scale: 1.5 });
        
        pdfRenderCanvas.width = viewport.width;
        pdfRenderCanvas.height = viewport.height;
        pdfRenderCanvas.style.width = '100%';
        pdfRenderCanvas.style.height = 'auto';

        await page.render({ canvasContext: pdfRenderCtx, viewport: viewport }).promise;
        
        currentPage = num;
        numSpan.textContent = num;
        btnPrev.disabled = num <= 1;
        btnNext.disabled = num >= totalPages;

        refreshVisuals();
    }

    btnPrev.addEventListener('click', () => { if(currentPage > 1) renderPage(currentPage - 1); });
    btnNext.addEventListener('click', () => { if(currentPage < totalPages) renderPage(currentPage + 1); });

    // --- 3. INTERACTIVE PLACEMENT LOGIC ---
    drawOverlay.addEventListener('mousedown', (e) => {
        if(e.button !== 0) return; // Only left click
        
        const rect = drawOverlay.getBoundingClientRect();
        const relX = (e.clientX - rect.left) / rect.width;
        const relY = (e.clientY - rect.top) / rect.height;

        const newComment = {
            id: 'cmt_' + Date.now(),
            num: commentCounter++,
            relX: relX,
            relY: relY,
            text: ''
        };

        pageComments[currentPage].push(newComment);
        refreshVisuals();

        // Focus the newly created textarea
        setTimeout(() => {
            const input = document.getElementById(`input_${newComment.id}`);
            if(input) {
                input.focus();
                // Scroll panel to bottom
                const panel = document.querySelector('.controls-panel');
                panel.scrollTop = panel.scrollHeight;
            }
        }, 50);
    });

    function refreshVisuals() {
        // Clear Overlay & List
        drawOverlay.innerHTML = '';
        commentListContainer.innerHTML = '';

        const comments = pageComments[currentPage];
        const overlayRect = drawOverlay.getBoundingClientRect();

        if (comments.length === 0) {
            commentListContainer.innerHTML = `<div style="text-align: center; color: var(--text-muted); font-size: 0.85rem; margin-top: 1rem; font-style: italic;">No comments on this page.</div>`;
            return;
        }

        comments.forEach((cmt) => {
            // 1. Draw Visual Marker on PDF
            const marker = document.createElement('div');
            marker.className = 'comment-marker';
            marker.textContent = cmt.num;
            marker.style.left = (cmt.relX * overlayRect.width) + 'px';
            marker.style.top = (cmt.relY * overlayRect.height) + 'px';
            drawOverlay.appendChild(marker);

            // 2. Build Side Panel Editor
            const item = document.createElement('div');
            item.className = 'comment-item';
            item.innerHTML = `
                <div class="comment-header">
                    <span>Note #${cmt.num}</span>
                    <button class="comment-delete" data-id="${cmt.id}" title="Delete Comment"><i class="fa-solid fa-trash-can"></i></button>
                </div>
                <textarea class="comment-input" id="input_${cmt.id}" placeholder="Type your comment here...">${cmt.text}</textarea>
            `;
            commentListContainer.appendChild(item);

            // Bind Text Input
            const textarea = item.querySelector('textarea');
            textarea.addEventListener('input', (e) => {
                cmt.text = e.target.value;
            });
            // Stop propagation so clicking textarea doesn't add a new note if bubbling occurs
            textarea.addEventListener('mousedown', (e) => e.stopPropagation());

            // Bind Delete
            const delBtn = item.querySelector('.comment-delete');
            delBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                pageComments[currentPage] = pageComments[currentPage].filter(c => c.id !== cmt.id);
                refreshVisuals();
            });
        });
    }

    // Keep markers synced on window resize
    window.addEventListener('resize', () => { if(activePdfFile) refreshVisuals(); });

    // --- 4. FINAL PDF-LIB ANNOTATION INJECTION ---
    document.getElementById('btn-apply-comments').addEventListener('click', async () => {
        
        let totalComments = 0;
        for(let i=1; i<=totalPages; i++) totalComments += pageComments[i].length;

        if (totalComments === 0) {
            alert('Please add at least one comment to the document.');
            return;
        }

        if(!window.PDFLib) return;
        
        const btn = document.getElementById('btn-apply-comments');
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Embedding Annotations...';

        try {
            const { PDFDocument, PDFName, PDFString, PDFArray } = window.PDFLib;
            const pdfDoc = await PDFDocument.load(rawPdfBytes, { ignoreEncryption: true });
            const pages = pdfDoc.getPages();

            // Iterate over each page and embed annotations
            for (let i = 1; i <= totalPages; i++) {
                const comments = pageComments[i];
                if (comments.length === 0) continue;

                const page = pages[i - 1];
                const { height } = page.getSize();
                const pageRef = page.ref;

                // Ensure the page has an Annots array
                let annots = page.node.Annots();
                if (!annots) {
                    annots = pdfDoc.context.obj([]);
                    page.node.set(PDFName.of('Annots'), annots);
                }

                comments.forEach(cmt => {
                    // PDF-lib coordinates: X from left, Y from bottom
                    // The visual marker points to its bottom-center. 
                    const absX = cmt.relX * page.getSize().width;
                    const absY = height - (cmt.relY * height);

                    // Create the Annotation Dictionary
                    const annotObj = pdfDoc.context.obj({
                        Type: 'Annot',
                        Subtype: 'Text',
                        // Bounding box for the sticky note icon [llx, lly, urx, ury]
                        Rect: [absX - 12, absY, absX + 12, absY + 24],
                        Contents: PDFString.of(cmt.text || "Empty Note"),
                        Name: PDFName.of('Comment'), // Standard Sticky Note Icon
                        C: [0.22, 1.0, 0.08], // Neon green-ish RGB color [R, G, B] array
                        Open: false // Start closed
                    });
                    
                    annots.push(annotObj);
                });
            }

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            
            const baseName = activePdfFile.name.replace(/\.[^/.]+$/, "");
            const finalFileName = `PDFase_${baseName}_Annotated.pdf`;

            workspaceContainer.innerHTML = `
                <div class="success-message">
                    <div style="color: var(--theme-color); font-size: 3rem; margin-bottom: 1rem;"><i class="fa-solid fa-circle-check"></i></div>
                    <div style="font-size: 1.8rem; color: #fff; font-weight: 700; margin-bottom: 0.5rem;">Comments Embedded!</div>
                    <div style="color: var(--text-muted); margin-bottom: 2rem;">Successfully injected ${totalComments} interactive sticky notes.</div>
                    
                    <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                        <a href="${url}" download="${finalFileName}" class="btn-action">
                            <i class="fa-solid fa-download"></i> Download PDF
                        </a>
                        <button class="btn-secondary" onclick="window.location.reload()">
                            <i class="fa-solid fa-rotate-right"></i> Annotate Another
                        </button>
                    </div>
                </div>
            `;
            
        } catch (error) {
            console.error('Processing Error:', error);
            alert('A critical error occurred. Make sure your PDF is not password protected.');
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-code-merge"></i> Embed Comments & Download';
        }
    });

});
