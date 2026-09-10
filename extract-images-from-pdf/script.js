// ==========================================
// 1. INJECT DEPENDENCIES & STYLES
// ==========================================
(function initEnvironment() {
    // Inject PDF.js for parsing and extracting PDF objects
    if (!window.pdfjsLib) {
        const scriptPdf = document.createElement('script');
        scriptPdf.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        scriptPdf.onload = () => {
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        };
        document.head.appendChild(scriptPdf);
    }

    // Inject JSZip for packaging extracted images into a downloadable zip
    if (!window.JSZip) {
        const scriptZip = document.createElement('script');
        scriptZip.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
        document.head.appendChild(scriptZip);
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
        convertBtn.innerHTML = '<i class="fa-solid fa-file-export"></i> Extract Images';
        convertBtn.addEventListener('click', executeExtraction);
        
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
    // 5. CLIENT-SIDE EXTRACTION LOGIC (pdf.js stream parser)
    // ==========================================
    async function executeExtraction() {
        if (!activePdfFile) {
            alert('Please upload a PDF file first.');
            return;
        }

        if (!window.pdfjsLib || !window.JSZip) {
            alert('Parsing engines are still loading. Please wait a moment and try again.');
            return;
        }

        const extractBtn = actionContainer.querySelector('.btn-action');
        let extractedImagesCount = 0;
        
        try {
            extractBtn.disabled = true;
            extractBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Analyzing...';

            const arrayBuffer = await activePdfFile.arrayBuffer();
            const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
            const totalPages = pdf.numPages;
            
            const zip = new JSZip();
            
            // Loop through all pages
            for (let i = 1; i <= totalPages; i++) {
                extractBtn.innerHTML = `<i class="fa-solid fa-magnifying-glass fa-beat-fade"></i> Scanning <span class="progress-text">Page ${i} / ${totalPages}</span>`;
                
                const page = await pdf.getPage(i);
                // Get internal operator list which contains draw commands
                const ops = await page.getOperatorList();
                
                // Identify paint commands
                for (let j = 0; j < ops.fnArray.length; j++) {
                    const fn = ops.fnArray[j];
                    
                    if (fn === pdfjsLib.OPS.paintImageXObject || fn === pdfjsLib.OPS.paintJpegXObject) {
                        const objId = ops.argsArray[j][0];
                        
                        try {
                            // Extract the raw image object from PDF cache
                            const img = await new Promise((resolve) => page.objs.get(objId, resolve));
                            if (!img) continue;

                            const canvas = document.createElement('canvas');
                            canvas.width = img.width;
                            canvas.height = img.height;
                            const ctx = canvas.getContext('2d');

                            // Modern PDF.js versions often supply an ImageBitmap for performance
                            if (img.bitmap) {
                                ctx.drawImage(img.bitmap, 0, 0);
                            } 
                            // Otherwise, it provides raw pixel data (Uint8ClampedArray)
                            else if (img.data) {
                                let clampedArray;
                                // RGBA format
                                if (img.data.length === img.width * img.height * 4) {
                                    clampedArray = new Uint8ClampedArray(img.data);
                                } 
                                // RGB format (Convert to RGBA for canvas rendering)
                                else if (img.data.length === img.width * img.height * 3) {
                                    clampedArray = new Uint8ClampedArray(img.width * img.height * 4);
                                    for (let p = 0, q = 0; p < img.data.length; p += 3, q += 4) {
                                        clampedArray[q] = img.data[p];       // R
                                        clampedArray[q+1] = img.data[p+1];   // G
                                        clampedArray[q+2] = img.data[p+2];   // B
                                        clampedArray[q+3] = 255;             // A (Opaque)
                                    }
                                }

                                if (clampedArray) {
                                    const imgData = new ImageData(clampedArray, img.width, img.height);
                                    ctx.putImageData(imgData, 0, 0);
                                }
                            }

                            // Convert to PNG blob and add to ZIP
                            const blob = await new Promise(res => canvas.toBlob(res, 'image/png'));
                            if (blob) {
                                extractedImagesCount++;
                                // Pad numbers for clean sorting in the folder
                                const paddedCount = String(extractedImagesCount).padStart(3, '0');
                                const paddedPage = String(i).padStart(String(totalPages).length, '0');
                                zip.file(`Extracted_${paddedCount}_(Page_${paddedPage}).png`, blob);
                            }
                            
                        } catch (err) {
                            console.warn(`Could not extract image object ${objId} on page ${i}`, err);
                        }
                    }
                }
            }

            if (extractedImagesCount === 0) {
                alert('Analysis complete: No embedded images were found in this PDF document.');
                extractBtn.disabled = false;
                extractBtn.innerHTML = '<i class="fa-solid fa-file-export"></i> Extract Images';
                return;
            }

            extractBtn.innerHTML = '<i class="fa-solid fa-box-archive fa-bounce"></i> Zipping assets...';

            const zipBlob = await zip.generateAsync({ type: 'blob' });
            const url = URL.createObjectURL(zipBlob);
            
            const baseName = activePdfFile.name.replace(/\.[^/.]+$/, "");
            const finalFileName = `PDFase_${baseName}_Assets.zip`;
            
            setTimeout(() => {
                document.getElementById('pdf-dropzone').style.display = 'none';
                
                actionContainer.innerHTML = `
                    <div class="success-message">
                        <i class="fa-solid fa-circle-check"></i> Extraction Complete!
                    </div>
                    <div class="file-flow">
                        <span class="file-flow-name">${activePdfFile.name}</span>
                        <i class="fa-solid fa-arrow-right" style="color: var(--theme-color, #b829ff); margin: 0 10px;"></i>
                        <span class="file-flow-final">${finalFileName}</span>
                        <span style="display: block; width: 100%; margin-top: 5px; color: var(--text-muted); font-size: 0.8rem;">
                            Successfully isolated ${extractedImagesCount} graphic asset(s)
                        </span>
                    </div>
                    <div class="button-group">
                        <a href="${url}" download="${finalFileName}" class="btn-action">
                            <i class="fa-solid fa-download"></i> Download Assets
                        </a>
                        <button class="btn-secondary" onclick="resetTool()">
                            <i class="fa-solid fa-rotate-right"></i> Extract Another
                        </button>
                        <a href="/" class="btn-secondary">
                            <i class="fa-solid fa-toolbox"></i> Other Tools
                        </a>
                    </div>
                `;
            }, 500);

        } catch (error) {
            console.error('Extraction Error:', error);
            alert('An error occurred while parsing the PDF stream. The file might be corrupted or encrypted.');
            extractBtn.disabled = false;
            extractBtn.innerHTML = '<i class="fa-solid fa-file-export"></i> Extract Images';
        }
    }

}); // End of DOMContentLoaded
