// ==========================================
// 1. INJECT DEPENDENCIES & STYLES (JSON TO PDF)
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
        .dropzone { transition: padding 0.3s ease, min-height 0.3s ease; -webkit-tap-highlight-color: transparent; cursor: pointer; }
        .dropzone.has-files { padding: 2rem 1rem 1rem 1rem !important; margin-bottom: 0 !important; cursor: default; }

        /* A4 Grid Layout */
        .a4-grid { display: flex; flex-wrap: wrap; gap: 0.75rem; justify-content: center; width: 100%; padding: 10px 0 0 0; margin: 0; max-height: 240px; overflow-y: auto; }
        
        /* Rigid Fixed-Height Cards matching Convert standards */
        .a4-card { width: 110px; height: 160px; background-color: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 6px; position: relative; padding: 10px; text-align: center; display: block; transition: all 0.2s ease; box-shadow: 0 4px 10px rgba(0,0,0,0.2); user-select: none; margin-top: 5px; }
        .a4-card:hover { border-color: rgba(184, 41, 255, 0.5); transform: translateY(-3px); box-shadow: 0 6px 15px rgba(184, 41, 255, 0.15); }
        
        .a4-icon-wrapper { height: 90px; display: flex; align-items: center; justify-content: center; width: 100%; }
        .a4-icon { font-size: 2.2rem; color: var(--theme-color, #b829ff); transition: color 0.2s; }
        
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

        .action-container { margin-top: 1rem !important; margin-bottom: 3rem; display: none; gap: 1rem; justify-content: center; flex-direction: column; align-items: center; animation: fadeIn 0.4s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        .button-group { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; width: 100%; }
        
        .options-panel { background: rgba(184, 41, 255, 0.02); border: 1px solid rgba(184, 41, 255, 0.15); padding: 1.25rem 1.5rem; border-radius: 8px; display: flex; flex-direction: column; gap: 0.75rem; align-items: center; width: 100%; max-width: 450px; font-family: 'Space Grotesk', sans-serif; text-align: center; }
        .options-panel p { color: var(--text-muted); font-size: 0.9rem; line-height: 1.5; margin: 0; }

        .btn-action { background-color: #b829ff; color: #fff; border: none; padding: 0.85rem 2.5rem; font-size: 1.05rem; font-weight: 700; font-family: 'Space Grotesk', sans-serif; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(184, 41, 255, 0.2); text-decoration: none; display: inline-flex; align-items: center; gap: 8px; }
        .btn-action:hover { background-color: #c74dff; transform: translateY(-2px); box-shadow: 0 6px 20px rgba(184, 41, 255, 0.35); }
        .btn-action:disabled { background-color: #222; color: #666; cursor: not-allowed; transform: none; box-shadow: none; }
        
        .btn-secondary { background-color: transparent; color: var(--text-main); border: 1px solid var(--border-subtle); padding: 0.85rem 1.75rem; font-size: 0.95rem; font-weight: 600; font-family: 'Space Grotesk', sans-serif; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; }
        .btn-secondary:hover { border-color: var(--theme-color, #b829ff); color: var(--theme-color, #b829ff); background-color: rgba(184, 41, 255, 0.05); }
        
        .success-message { width: 100%; text-align: center; color: var(--theme-color, #b829ff); font-size: 1.2rem; font-weight: 600; margin-bottom: 0.25rem; }
        .file-flow { color: var(--text-muted); font-size: 0.85rem; margin-bottom: 1rem; display: flex; align-items: center; justify-content: center; gap: 8px; flex-wrap: wrap; background: rgba(184, 41, 255, 0.03); padding: 10px 20px; border-radius: 8px; border: 1px solid rgba(184, 41, 255, 0.2); text-align: center; max-width: 100%; word-break: break-word; }
        .file-flow-name { color: var(--text-main); font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; }
        .file-flow-final { color: #fff; font-weight: 700; border-bottom: 1px dashed var(--theme-color, #b829ff); font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; }
    `;
    document.head.appendChild(style);
})();

// ==========================================
// 2. STATE MANAGEMENT & DOM SETUP
// ==========================================
document.addEventListener('DOMContentLoaded', () => {

    let mainJsonFile = null; 
    let rawJsonText = null;
    let parsedJson = null;

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
        
        const optionsPanel = document.createElement('div');
        optionsPanel.className = 'options-panel';
        optionsPanel.innerHTML = `
            <p><i class="fa-solid fa-file-code" style="color: var(--theme-color);"></i> Ready to compile JSON payload into a paginated PDF report.</p>
        `;

        const btnGroup = document.createElement('div');
        btnGroup.className = 'button-group';
        
        const actionBtn = document.createElement('button');
        actionBtn.className = 'btn-action';
        actionBtn.innerHTML = '<i class="fa-solid fa-file-pdf"></i> Generate PDF Report';
        actionBtn.addEventListener('click', executeJsonToPdf);
        
        btnGroup.appendChild(actionBtn);
        actionContainer.appendChild(optionsPanel);
        actionContainer.appendChild(btnGroup);
    }

    // ==========================================
    // 3. EVENT LISTENERS
    // ==========================================
    if (selectFilesBtn) {
        selectFilesBtn.addEventListener('click', (e) => {
            e.preventDefault(); e.stopPropagation(); fileInput.click();
        });
    }

    dropzone.addEventListener('click', (e) => {
        if (!mainJsonFile && e.target !== fileInput && !e.target.closest('.a4-card')) fileInput.click();
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

    function handleMainFile(file) {
        if (file.type !== 'application/json' && !file.name.toLowerCase().endsWith('.json')) {
            alert('Invalid format. Please select a valid JSON file.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                rawJsonText = e.target.result;
                parsedJson = JSON.parse(rawJsonText); // Validate JSON
                mainJsonFile = file;
                renderFileCard();
                initConvertUI();
            } catch (err) {
                console.error("JSON Parse Error:", err);
                alert("Invalid JSON format. Please ensure the file contains valid JSON data.");
            }
        };
        reader.readAsText(file);
    }

    function renderFileCard() {
        a4Grid.innerHTML = '';
        if (!mainJsonFile) {
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
            <button type="button" class="a4-remove" onclick="removeMainFile(event)" title="Remove File">
                <i class="fa-solid fa-xmark"></i>
            </button>
            <div class="a4-icon-wrapper">
                <i class="fa-solid fa-file-code a4-icon"></i>
            </div>
            <div class="a4-name" title="${mainJsonFile.name}">${mainJsonFile.name}</div>
        `;
        a4Grid.appendChild(item);
    }

    window.removeMainFile = function(event) {
        if (event) { event.stopPropagation(); event.preventDefault(); }
        mainJsonFile = null; 
        rawJsonText = null;
        parsedJson = null;
        renderFileCard();
        
        dropzone.style.display = 'block';
        actionContainer.innerHTML = '';
    };

    window.resetTool = function() { 
        mainJsonFile = null;
        rawJsonText = null;
        parsedJson = null;
        window.location.reload(); 
    };

    // ==========================================
    // 4. CLIENT-SIDE COMPILATION LOGIC
    // ==========================================
    async function executeJsonToPdf() {
        if (!parsedJson || !mainJsonFile) return alert('Please upload a JSON file first.');
        if (!window.PDFLib) return alert('Engine is still loading. Please wait.');

        const actionBtn = actionContainer.querySelector('.btn-action');

        try {
            actionBtn.disabled = true;
            actionBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Compiling Report...';

            const { PDFDocument, StandardFonts, rgb } = window.PDFLib;
            const pdfDoc = await PDFDocument.create();
            const font = await pdfDoc.embedFont(StandardFonts.Courier);
            const boldFont = await pdfDoc.embedFont(StandardFonts.CourierBold);

            // Format JSON into an indented string
            const jsonString = JSON.stringify(parsedJson, null, 4);
            const rawLines = jsonString.split('\n');

            // Constants for pagination and layout
            const fontSize = 10;
            const margin = 40;
            const lineHeight = 14;
            let page = pdfDoc.addPage([595.28, 841.89]); // A4 Size
            let { height, width } = page.getSize();
            let yCursor = height - margin - 20;

            // Draw Header
            page.drawText(`DATA REPORT: ${mainJsonFile.name}`, { x: margin, y: yCursor, size: 14, font: boldFont, color: rgb(0, 0, 0) });
            page.drawLine({ start: { x: margin, y: yCursor - 5 }, end: { x: width - margin, y: yCursor - 5 }, thickness: 1, color: rgb(0.7, 0.7, 0.7) });
            yCursor -= 30;

            // Function to handle line wrapping if lines are extremely long
            const maxCharsPerLine = 85; 
            const processLine = (line) => {
                const chunks = [];
                for (let i = 0; i < line.length; i += maxCharsPerLine) {
                    chunks.push(line.substring(i, i + maxCharsPerLine));
                }
                return chunks.length > 0 ? chunks : [''];
            };

            for (const rawLine of rawLines) {
                const wrappedLines = processLine(rawLine);
                
                for (const textLine of wrappedLines) {
                    if (yCursor < margin + 20) {
                        // Create a new page if we run out of vertical space
                        page = pdfDoc.addPage([595.28, 841.89]);
                        yCursor = height - margin;
                    }

                    page.drawText(textLine, {
                        x: margin,
                        y: yCursor,
                        size: fontSize,
                        font: font,
                        color: rgb(0.1, 0.1, 0.1)
                    });
                    yCursor -= lineHeight;
                }
            }

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            
            const baseName = mainJsonFile.name.replace(/\.[^/.]+$/, "");
            const finalFileName = `PDFase_${baseName}_Report.pdf`;
            
            setTimeout(() => {
                document.getElementById('pdf-dropzone').style.display = 'none';
                
                const stealthAttribution = Math.random() > 0.5 
                    ? `<div style="margin-top: 15px; font-size: 0.75rem; color: var(--text-muted); text-align: center;">Processed securely via <a href="https://rupamdas.in" target="_blank" rel="noopener" style="color: inherit; text-decoration: none;">PDFase Engine</a></div>`
                    : `<div style="margin-top: 15px; font-size: 0.75rem; color: var(--text-muted); text-align: center;">Client utility crafted by <a href="https://rupamdas.in" target="_blank" rel="noopener" style="color: inherit; text-decoration: none;">Rupam Das</a></div>`;

                actionContainer.innerHTML = `
                    <div class="success-message">
                        <i class="fa-solid fa-circle-check"></i> Report Compiled Successfully!
                    </div>
                    <div class="file-flow">
                        <span class="file-flow-name">${mainJsonFile.name}</span>
                        <i class="fa-solid fa-arrow-right" style="color: var(--theme-color, #b829ff); margin: 0 10px;"></i>
                        <span class="file-flow-final">${finalFileName}</span>
                    </div>
                    <div class="button-group" style="margin-top: 5px;">
                        <a href="${url}" download="${finalFileName}" class="btn-action">
                            <i class="fa-solid fa-download"></i> Download PDF Report
                        </a>
                        <button type="button" class="btn-secondary" onclick="resetTool()">
                            <i class="fa-solid fa-rotate-right"></i> Compile Another
                        </button>
                    </div>
                    ${stealthAttribution}
                `;
            }, 600);

        } catch (error) {
            console.error('Compilation Error:', error);
            alert('A critical error occurred while generating the PDF report.');
            actionBtn.disabled = false;
            actionBtn.innerHTML = '<i class="fa-solid fa-file-pdf"></i> Generate PDF Report';
        }
    }

});
