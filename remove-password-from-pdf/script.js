// ==========================================
// 1. INJECT DEPENDENCIES & STYLES (REMOVE PASSWORD)
// ==========================================
(function initEnvironment() {
    const style = document.createElement('style');
    style.innerHTML = `
        /* Dynamic Dropzone Shrinking */
        .dropzone { transition: padding 0.3s ease, min-height 0.3s ease; -webkit-tap-highlight-color: transparent; cursor: pointer; }
        .dropzone.has-files { padding: 1.25rem 1rem 0.25rem 1rem !important; margin-bottom: 0 !important; cursor: default; }

        /* A4 Grid Layout for the selected file */
        .a4-grid { display: flex; flex-wrap: wrap; gap: 0.75rem; justify-content: center; width: 100%; padding: 0; margin: 0; }
        
        /* Rigid Fixed-Height Card */
        .a4-card { width: 120px; height: 160px; background-color: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 6px; position: relative; padding: 10px; text-align: center; display: block; transition: all 0.2s ease; box-shadow: 0 4px 10px rgba(0,0,0,0.2); user-select: none; }
        .a4-card:hover { border-color: rgba(255, 191, 0, 0.5); transform: translateY(-3px); box-shadow: 0 6px 15px rgba(255, 191, 0, 0.15); }
        
        .a4-icon-wrapper { height: 90px; display: flex; align-items: center; justify-content: center; width: 100%; }
        .a4-icon { font-size: 2.5rem; color: var(--theme-color, #ffbf00); transition: color 0.2s; }
        
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
        .action-container { margin-top: 1rem !important; margin-bottom: 3rem; display: none; gap: 1rem; justify-content: center; flex-direction: column; align-items: center; animation: fadeIn 0.4s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        .button-group { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; width: 100%; }
        
        /* Options Panel for Password Input */
        .options-panel { background: rgba(255, 191, 0, 0.02); border: 1px solid rgba(255, 191, 0, 0.15); padding: 1.25rem 1.5rem; border-radius: 8px; display: flex; flex-direction: column; gap: 0.75rem; align-items: stretch; width: 100%; max-width: 420px; font-family: 'Space Grotesk', sans-serif; position: relative; }
        .options-panel label { color: var(--text-muted); font-size: 0.85rem; font-weight: 500; display: flex; align-items: center; justify-content: space-between; gap: 6px; margin-bottom: 4px; }
        
        .password-input-wrapper { position: relative; width: 100%; display: flex; align-items: center; }
        .options-panel input[type="password"], .options-panel input[type="text"] { background: var(--bg-card); color: var(--text-main); border: 1px solid var(--border-subtle); padding: 0.75rem 3rem 0.75rem 1rem; border-radius: 6px; font-family: 'Space Grotesk', sans-serif; font-size: 0.95rem; outline: none; transition: border-color 0.2s; width: 100%; }
        .options-panel input:focus { border-color: var(--theme-color, #ffbf00); }
        
        /* Multi-action icons container on right side of main input */
        .input-actions-right { position: absolute; right: 10px; display: flex; align-items: center; gap: 6px; }
        
        .toggle-password { background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 0.9rem; transition: color 0.2s; display: flex; align-items: center; justify-content: center; padding: 2px; }
        .toggle-password:hover { color: var(--theme-color, #ffbf00); }

        /* Eye-Friendly Balanced Amber Action Button */
        .btn-action { 
            background-color: #e6ac00; 
            color: #050505; 
            border: none; 
            padding: 0.85rem 2.5rem; 
            font-size: 1.05rem; 
            font-weight: 700; 
            font-family: 'Space Grotesk', sans-serif; 
            border-radius: 8px; 
            cursor: pointer; 
            transition: all 0.3s ease; 
            box-shadow: 0 4px 15px rgba(230, 172, 0, 0.2); 
            text-decoration: none; 
            display: inline-flex; 
            align-items: center; 
            gap: 8px; 
        }
        .btn-action:hover { 
            background-color: #ffbf00;
            transform: translateY(-2px); 
            box-shadow: 0 6px 20px rgba(255, 191, 0, 0.35); 
        }
        .btn-action:disabled { background-color: #222; color: #666; cursor: not-allowed; transform: none; box-shadow: none; }
        
        .btn-secondary { background-color: transparent; color: var(--text-main); border: 1px solid var(--border-subtle); padding: 0.85rem 1.75rem; font-size: 0.95rem; font-weight: 600; font-family: 'Space Grotesk', sans-serif; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; }
        .btn-secondary:hover { border-color: var(--theme-color, #ffbf00); color: var(--theme-color, #ffbf00); background-color: rgba(255, 191, 0, 0.05); }
        
        .success-message { width: 100%; text-align: center; color: var(--theme-color, #ffbf00); font-size: 1.2rem; font-weight: 600; margin-bottom: 0.25rem; }
        
        .file-flow { color: var(--text-muted); font-size: 0.85rem; margin-bottom: 1rem; display: flex; align-items: center; justify-content: center; gap: 8px; flex-wrap: wrap; background: rgba(255, 191, 0, 0.03); padding: 10px 20px; border-radius: 8px; border: 1px solid rgba(255, 191, 0, 0.2); text-align: center; max-width: 100%; word-break: break-word; }
        .file-flow-name { color: var(--text-main); font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; }
        .file-flow-final { color: #fff; font-weight: 700; border-bottom: 1px dashed var(--theme-color, #ffbf00); font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; }
    `;
    document.head.appendChild(style);

    // Standard UNPKG script loading to match the working encryption pattern
    const qpdfScript = document.createElement('script');
    qpdfScript.src = 'https://unpkg.com/@jspawn/qpdf-wasm/qpdf.js';
    
    qpdfScript.onload = () => {
        const factory = window.qpdf || window.qpdfWasm || window.Module;
        if (typeof factory === 'function') {
            factory({
                locateFile: (path) => {
                    if (path.endsWith('.wasm')) {
                        return 'https://unpkg.com/@jspawn/qpdf-wasm/' + path;
                    }
                    return path;
                }
            }).then(instance => {
                window.qpdfEngine = instance;
                console.log("✅ QPDF Decryption Engine Loaded Successfully");
            }).catch(err => {
                console.error("❌ WASM Instantiation Error:", err);
            });
        }
    };
    document.head.appendChild(qpdfScript);
})();

// ==========================================
// WAIT FOR HTML DOM TO FULLY LOAD
// ==========================================
document.addEventListener('DOMContentLoaded', () => {

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

    function initUnlockUI() {
        actionContainer.innerHTML = '';
        
        const optionsPanel = document.createElement('div');
        optionsPanel.className = 'options-panel';
        optionsPanel.innerHTML = `
            <label for="pdf-password">
                <span><i class="fa-solid fa-unlock-keyhole" style="color: var(--theme-color);"></i> Current Password:</span>
            </label>
            <div class="password-input-wrapper">
                <input type="password" id="pdf-password" placeholder="Enter password to unlock..." autocomplete="off">
                <div class="input-actions-right">
                    <button type="button" class="toggle-password" id="toggle-pass-btn" title="Show/Hide Password">
                        <i class="fa-solid fa-eye" id="toggle-eye-icon"></i>
                    </button>
                </div>
            </div>
            <div style="font-size: 0.75rem; color: var(--text-muted); text-align: center; margin-top: 8px;">
                You must provide the correct password to strip the encryption layer.
            </div>
        `;

        const btnGroup = document.createElement('div');
        btnGroup.className = 'button-group';
        
        const actionBtn = document.createElement('button');
        actionBtn.className = 'btn-action';
        actionBtn.innerHTML = '<i class="fa-solid fa-lock-open"></i> Unlock PDF';
        actionBtn.addEventListener('click', executeDecryption);
        
        btnGroup.appendChild(actionBtn);
        actionContainer.appendChild(optionsPanel);
        actionContainer.appendChild(btnGroup);

        const passInput = optionsPanel.querySelector('#pdf-password');
        const toggleBtn = optionsPanel.querySelector('#toggle-pass-btn');
        const eyeIcon = optionsPanel.querySelector('#toggle-eye-icon');

        toggleBtn.addEventListener('click', () => {
            if (passInput.type === 'password') {
                passInput.type = 'text';
                eyeIcon.className = 'fa-solid fa-eye-slash';
            } else {
                passInput.type = 'password';
                eyeIcon.className = 'fa-solid fa-eye';
            }
        });
        
        passInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                executeDecryption();
            }
        });
    }
    initUnlockUI();

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
        
        setTimeout(() => {
            const passInput = document.getElementById('pdf-password');
            if(passInput) passInput.focus();
        }, 100);
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
        document.getElementById('pdf-password').value = '';
    };

    window.resetTool = function() {
        window.location.reload(); 
    };

    // ==========================================
    // 5. CLIENT-SIDE DECRYPTION LOGIC (WASM VFS)
    // ==========================================
    async function executeDecryption() {
        if (!activePdfFile) {
            alert('Please upload a PDF file first.');
            return;
        }

        const passwordInput = document.getElementById('pdf-password');
        const password = passwordInput ? passwordInput.value : '';

        if (!password) {
            alert('Please enter the current password to unlock your PDF.');
            if (passwordInput) passwordInput.focus();
            return;
        }

        if (!window.qpdfEngine) {
            alert('Decryption Engine is still initializing. Please wait a moment.');
            return;
        }

        const actionBtn = actionContainer.querySelector('.btn-action');
        
        try {
            actionBtn.disabled = true;
            actionBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Unlocking Document...';

            const arrayBuffer = await activePdfFile.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);
            
            // Write encrypted file to virtual filesystem
            window.qpdfEngine.FS.writeFile('/input_locked.pdf', uint8Array);
            
            // Execute decryption via QPDF CLI arguments matching the working pattern
            try {
                window.qpdfEngine.callMain([
                    '--decrypt',
                    `--password=${password}`,
                    '/input_locked.pdf',
                    '/output_unlocked.pdf'
                ]);
            } catch (cliErr) {
                console.error("CLI Decryption Error:", cliErr);
                throw new Error("Incorrect password or corrupted file.");
            }
            
            // Read unlocked bytes from virtual filesystem
            const decryptedBytes = window.qpdfEngine.FS.readFile('/output_unlocked.pdf');
            
            // Cleanup VFS memory
            window.qpdfEngine.FS.unlink('/input_locked.pdf');
            window.qpdfEngine.FS.unlink('/output_unlocked.pdf');

            const blob = new Blob([decryptedBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            
            const baseName = activePdfFile.name.replace(/\.[^/.]+$/, "");
            const finalFileName = `PDFase_${baseName}_Unlocked.pdf`;
            
            setTimeout(() => {
                document.getElementById('pdf-dropzone').style.display = 'none';
                
                actionContainer.innerHTML = `
                    <div class="success-message">
                        <i class="fa-solid fa-circle-check"></i> PDF Successfully Unlocked!
                    </div>
                    <div class="file-flow">
                        <span class="file-flow-name">${activePdfFile.name}</span>
                        <i class="fa-solid fa-arrow-right" style="color: var(--theme-color, #ffbf00); margin: 0 10px;"></i>
                        <span class="file-flow-final">${finalFileName}</span>
                    </div>
                    <div class="button-group">
                        <a href="${url}" download="${finalFileName}" class="btn-action">
                            <i class="fa-solid fa-download"></i> Download Unlocked PDF
                        </a>
                        <button class="btn-secondary" onclick="resetTool()">
                            <i class="fa-solid fa-rotate-right"></i> Unlock Another
                        </button>
                        <a href="/" class="btn-secondary">
                            <i class="fa-solid fa-toolbox"></i> Other Tools
                        </a>
                    </div>
                `;
            }, 400);

        } catch (error) {
            console.error('Decryption Error:', error);
            alert('Incorrect password or the document could not be unlocked.');
            actionBtn.disabled = false;
            actionBtn.innerHTML = '<i class="fa-solid fa-lock-open"></i> Unlock PDF';
            if(passwordInput) {
                passwordInput.value = '';
                passwordInput.focus();
            }
        }
    }

});
