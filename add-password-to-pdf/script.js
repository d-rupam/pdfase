// ==========================================
// 1. INJECT DEPENDENCIES & STYLES (ADD PASSWORD)
// ==========================================
(function initEnvironment() {
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
        
        .options-panel { background: rgba(255, 191, 0, 0.02); border: 1px solid rgba(255, 191, 0, 0.15); padding: 1.25rem 1.5rem; border-radius: 8px; display: flex; flex-direction: column; gap: 0.75rem; align-items: stretch; width: 100%; max-width: 420px; font-family: 'Space Grotesk', sans-serif; position: relative; }
        .options-panel label { color: var(--text-muted); font-size: 0.85rem; font-weight: 500; display: flex; align-items: center; justify-content: space-between; gap: 6px; }
        
        .password-input-wrapper { position: relative; width: 100%; display: flex; align-items: center; }
        .options-panel input[type="password"], .options-panel input[type="text"] { background: var(--bg-card); color: var(--text-main); border: 1px solid var(--border-subtle); padding: 0.6rem 4.5rem 0.6rem 1rem; border-radius: 6px; font-family: 'Space Grotesk', sans-serif; font-size: 0.95rem; outline: none; transition: border-color 0.2s; width: 100%; }
        .options-panel input:focus { border-color: var(--theme-color, #ffbf00); }
        
        .input-actions-right { position: absolute; right: 10px; display: flex; align-items: center; gap: 6px; }
        
        .toggle-password, .copy-password-btn { background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 0.9rem; transition: color 0.2s; display: flex; align-items: center; justify-content: center; padding: 2px; }
        .toggle-password:hover, .copy-password-btn:hover { color: var(--theme-color, #ffbf00); }

        .gen-toggle-btn { background: rgba(255, 191, 0, 0.08); border: 1px solid rgba(255, 191, 0, 0.25); color: var(--theme-color, #ffbf00); font-size: 0.75rem; font-family: 'Space Grotesk', sans-serif; cursor: pointer; font-weight: 600; padding: 4px 10px; border-radius: 20px; display: inline-flex; align-items: center; gap: 5px; transition: background-color 0.2s ease, border-color 0.2s ease; box-shadow: none !important; }
        .gen-toggle-btn:hover { background: rgba(255, 191, 0, 0.15); border-color: var(--theme-color); color: #fff; transform: none !important; }

        .password-generator-box { background: rgba(0, 0, 0, 0.5); border: 1px solid rgba(255, 191, 0, 0.3); border-radius: 8px; padding: 1.1rem 1rem 1rem 1rem; margin-top: 0.25rem; display: none; flex-direction: column; gap: 0.75rem; font-family: 'Space Grotesk', sans-serif; position: relative; }
        .password-generator-box.active { display: flex; }
        
        .gen-close-btn { position: absolute; top: -10px; right: -10px; background: #1a1a1e; border: 1px solid rgba(255, 191, 0, 0.3); color: var(--text-muted); width: 24px; height: 24px; border-radius: 50%; cursor: pointer; font-size: 0.75rem; display: flex; justify-content: center; align-items: center; box-shadow: 0 2px 6px rgba(0,0,0,0.4); transition: all 0.2s; z-index: 5; }
        .gen-close-btn:hover { background: #ff3366; border-color: #ff3366; color: #fff; transform: scale(1.1); }

        .gen-preview-row { display: flex; gap: 8px; align-items: center; }
        .gen-preview-input { background: #050505 !important; font-family: 'JetBrains Mono', monospace !important; font-size: 0.9rem !important; color: var(--theme-color) !important; flex: 1; padding: 0.5rem 0.75rem !important; border: 1px solid rgba(255, 191, 0, 0.3) !important; border-radius: 6px !important; outline: none; }
        
        .gen-refresh-btn, .gen-copy-btn { background: rgba(255, 191, 0, 0.08); border: 1px solid rgba(255, 191, 0, 0.25); color: var(--theme-color); border-radius: 6px; width: 38px; height: 38px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.2s; box-shadow: none !important; }
        .gen-refresh-btn:hover, .gen-copy-btn:hover { background: rgba(255, 191, 0, 0.2); color: #fff; transform: none !important; }

        .gen-settings { display: flex; flex-direction: column; gap: 0.6rem; font-size: 0.82rem; color: var(--text-muted); }
        .gen-slider-row { display: flex; justify-content: space-between; align-items: center; }
        .gen-slider-row input[type="range"] { accent-color: var(--theme-color, #ffbf00); cursor: pointer; flex: 1; margin-left: 10px; }
        
        .gen-checkboxes { display: grid; grid-template-columns: 1fr 1fr; gap: 0.4rem 1rem; margin-top: 2px; }
        .gen-checkboxes label { display: flex; align-items: center; gap: 6px; cursor: pointer; color: var(--text-main); font-size: 0.8rem; font-weight: 400; justify-content: flex-start !important; }
        .gen-checkboxes input[type="checkbox"] { accent-color: var(--theme-color, #ffbf00); cursor: pointer; width: 14px; height: 14px; }

        .btn-use-gen { background: var(--theme-color, #ffbf00); color: #050505; border: none; padding: 0.5rem 1rem; border-radius: 6px; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 0.85rem; cursor: pointer; transition: transform 0.1s, background-color 0.2s; text-align: center; margin-top: 4px; box-shadow: 0 2px 8px rgba(255, 191, 0, 0.2); }
        .btn-use-gen:hover { background-color: #ffd233; transform: translateY(-1px); }

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

    // Modern Dynamic Import to bypass global variable binding issues
    import('https://cdn.jsdelivr.net/npm/@jspawn/qpdf-wasm/qpdf.js')
        .then(async (module) => {
            const qpdfFactory = module.default || module;
            window.qpdfEngine = await qpdfFactory({
                locateFile: (path) => {
                    if (path.endsWith('.wasm')) {
                        return 'https://cdn.jsdelivr.net/npm/@jspawn/qpdf-wasm/' + path;
                    }
                    return path;
                }
            });
            console.log("✅ QPDF WASM Engine Loaded Successfully");
        })
        .catch(err => {
            console.error("❌ QPDF Engine failed to load:", err);
            alert("Failed to initialize the encryption engine. Please check your internet connection and try again.");
        });
})();

// ==========================================
// 2. STATE MANAGEMENT & DOM SETUP
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

    function initPasswordUI() {
        actionContainer.innerHTML = '';
        
        const optionsPanel = document.createElement('div');
        optionsPanel.className = 'options-panel';
        optionsPanel.innerHTML = `
            <label for="pdf-password">
                <span><i class="fa-solid fa-key" style="color: var(--theme-color);"></i> Protection Password:</span>
                <button type="button" class="gen-toggle-btn" id="gen-toggle-trigger"><i class="fa-solid fa-wand-magic-sparkles"></i> Generate Password</button>
            </label>
            <div class="password-input-wrapper">
                <input type="password" id="pdf-password" placeholder="Type secret password..." autocomplete="new-password">
                <div class="input-actions-right">
                    <button type="button" class="copy-password-btn" id="copy-main-btn" title="Copy Password">
                        <i class="fa-regular fa-copy" id="copy-main-icon"></i>
                    </button>
                    <button type="button" class="toggle-password" id="toggle-pass-btn" title="Show/Hide Password">
                        <i class="fa-solid fa-eye" id="toggle-eye-icon"></i>
                    </button>
                </div>
            </div>

            <div class="password-generator-box" id="gen-drawer">
                <button type="button" class="gen-close-btn" id="gen-close-trigger" title="Close Generator"><i class="fa-solid fa-xmark"></i></button>
                <div class="gen-preview-row">
                    <input type="text" id="gen-result-field" class="gen-preview-input" readonly>
                    <button type="button" class="gen-copy-btn" id="gen-copy-drawer-btn" title="Copy Generated"><i class="fa-regular fa-copy" id="copy-drawer-icon"></i></button>
                    <button type="button" class="gen-refresh-btn" id="gen-refresh-trigger" title="Generate New"><i class="fa-solid fa-rotate-right"></i></button>
                </div>
                <div class="gen-settings">
                    <div class="gen-slider-row">
                        <span>Length: <strong id="gen-length-val">12</strong></span>
                        <input type="range" id="gen-length-slider" min="6" max="30" value="12">
                    </div>
                    <div class="gen-checkboxes">
                        <label><input type="checkbox" id="gen-upper" checked> Uppercase (A-Z)</label>
                        <label><input type="checkbox" id="gen-lower" checked> Lowercase (a-z)</label>
                        <label><input type="checkbox" id="gen-nums" checked> Numbers (0-9)</label>
                        <label><input type="checkbox" id="gen-syms" checked> Symbols (!@#$)</label>
                    </div>
                </div>
                <button type="button" class="btn-use-gen" id="gen-use-btn">Use Password</button>
            </div>
        `;

        const btnGroup = document.createElement('div');
        btnGroup.className = 'button-group';
        
        const actionBtn = document.createElement('button');
        actionBtn.className = 'btn-action';
        actionBtn.innerHTML = '<i class="fa-solid fa-lock"></i> Encrypt PDF';
        actionBtn.addEventListener('click', executeEncryption);
        
        btnGroup.appendChild(actionBtn);
        actionContainer.appendChild(optionsPanel);
        actionContainer.appendChild(btnGroup);

        const passInput = optionsPanel.querySelector('#pdf-password');
        const toggleBtn = optionsPanel.querySelector('#toggle-pass-btn');
        const eyeIcon = optionsPanel.querySelector('#toggle-eye-icon');
        const copyMainBtn = optionsPanel.querySelector('#copy-main-btn');
        const copyMainIcon = optionsPanel.querySelector('#copy-main-icon');
        
        const genTrigger = optionsPanel.querySelector('#gen-toggle-trigger');
        const genClose = optionsPanel.querySelector('#gen-close-trigger');
        const genDrawer = optionsPanel.querySelector('#gen-drawer');
        const genResult = optionsPanel.querySelector('#gen-result-field');
        const genRefresh = optionsPanel.querySelector('#gen-refresh-trigger');
        const genCopyDrawerBtn = optionsPanel.querySelector('#gen-copy-drawer-btn');
        const copyDrawerIcon = optionsPanel.querySelector('#copy-drawer-icon');
        const genSlider = optionsPanel.querySelector('#gen-length-slider');
        const genLengthVal = optionsPanel.querySelector('#gen-length-val');
        
        const genUpper = optionsPanel.querySelector('#gen-upper');
        const genLower = optionsPanel.querySelector('#gen-lower');
        const genNums = optionsPanel.querySelector('#gen-nums');
        const genSyms = optionsPanel.querySelector('#gen-syms');
        const genUseBtn = optionsPanel.querySelector('#gen-use-btn');

        function copyTextToClipboard(text, iconElement) {
            if (!text) return;
            navigator.clipboard.writeText(text).then(() => {
                iconElement.className = 'fa-solid fa-check';
                iconElement.style.color = '#34d399';
                setTimeout(() => {
                    iconElement.className = 'fa-regular fa-copy';
                    iconElement.style.color = '';
                }, 1500);
            }).catch(err => console.error('Failed to copy text: ', err));
        }

        copyMainBtn.addEventListener('click', (e) => {
            e.preventDefault();
            copyTextToClipboard(passInput.value, copyMainIcon);
        });

        genCopyDrawerBtn.addEventListener('click', (e) => {
            e.preventDefault();
            copyTextToClipboard(genResult.value, copyDrawerIcon);
        });

        toggleBtn.addEventListener('click', () => {
            if (passInput.type === 'password') {
                passInput.type = 'text';
                eyeIcon.className = 'fa-solid fa-eye-slash';
            } else {
                passInput.type = 'password';
                eyeIcon.className = 'fa-solid fa-eye';
            }
        });

        genTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            genDrawer.classList.toggle('active');
            if (genDrawer.classList.contains('active')) {
                generateNewPassword();
            }
        });

        genClose.addEventListener('click', (e) => {
            e.preventDefault();
            genDrawer.classList.remove('active');
        });

        function generateNewPassword() {
            const length = parseInt(genSlider.value);
            const upperChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            const lowerChars = 'abcdefghijklmnopqrstuvwxyz';
            const numChars = '0123456789';
            const symChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';

            let availableChars = '';
            if (genUpper.checked) availableChars += upperChars;
            if (genLower.checked) availableChars += lowerChars;
            if (genNums.checked) availableChars += numChars;
            if (genSyms.checked) availableChars += symChars;

            if (!availableChars) {
                availableChars = lowerChars; 
                genLower.checked = true;
            }

            let result = '';
            for (let i = 0; i < length; i++) {
                result += availableChars.charAt(Math.floor(Math.random() * availableChars.length));
            }
            genResult.value = result;
        }

        genSlider.addEventListener('input', () => {
            genLengthVal.textContent = genSlider.value;
            generateNewPassword();
        });

        genUpper.addEventListener('change', generateNewPassword);
        genLower.addEventListener('change', generateNewPassword);
        genNums.addEventListener('change', generateNewPassword);
        genSyms.addEventListener('change', generateNewPassword);
        
        genRefresh.addEventListener('click', (e) => {
            e.preventDefault();
            generateNewPassword();
        });

        genUseBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (genResult.value) {
                passInput.value = genResult.value;
                passInput.type = 'text'; 
                eyeIcon.className = 'fa-solid fa-eye-slash';
                genDrawer.classList.remove('active');
            }
        });
    }
    initPasswordUI();

    // ==========================================
    // 3. FILE EVENT LISTENERS
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
    // 4. CLIENT-SIDE ENCRYPTION LOGIC (WASM VFS)
    // ==========================================
    async function executeEncryption() {
        if (!activePdfFile) {
            alert('Please upload a PDF file first.');
            return;
        }

        const passwordInput = document.getElementById('pdf-password');
        const password = passwordInput ? passwordInput.value : '';

        if (!password) {
            alert('Please enter a password to encrypt your PDF.');
            if (passwordInput) passwordInput.focus();
            return;
        }

        const actionBtn = actionContainer.querySelector('.btn-action');

        if (!window.qpdfEngine) {
            alert("Encryption Engine is still initializing. Please wait a few seconds and try again.");
            return;
        }
        
        try {
            actionBtn.disabled = true;
            actionBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Securing Document...';

            const arrayBuffer = await activePdfFile.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);
            
            // Write the unencrypted file into Emscripten's virtual filesystem
            window.qpdfEngine.FS.writeFile('/input.pdf', uint8Array);
            
            // Execute the QPDF encryption command internally via WASM
            window.qpdfEngine.callMain([
                '--encrypt', 
                password, 
                password, 
                '256', 
                '--', 
                '/input.pdf', 
                '/output.pdf'
            ]);
            
            // Read the encrypted file back out
            const encryptedBytes = window.qpdfEngine.FS.readFile('/output.pdf');
            
            // Cleanup memory to prevent freezing on multiple files
            window.qpdfEngine.FS.unlink('/input.pdf');
            window.qpdfEngine.FS.unlink('/output.pdf');

            const blob = new Blob([encryptedBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            
            const baseName = activePdfFile.name.replace(/\.[^/.]+$/, "");
            const finalFileName = `PDFase_${baseName}_Protected.pdf`;
            
            setTimeout(() => {
                document.getElementById('pdf-dropzone').style.display = 'none';
                
                actionContainer.innerHTML = `
                    <div class="success-message">
                        <i class="fa-solid fa-circle-check"></i> Encryption Complete!
                    </div>
                    <div class="file-flow">
                        <span class="file-flow-name">${activePdfFile.name}</span>
                        <i class="fa-solid fa-arrow-right" style="color: var(--theme-color, #ffbf00); margin: 0 10px;"></i>
                        <span class="file-flow-final">${finalFileName}</span>
                    </div>
                    <div class="button-group">
                        <a href="${url}" download="${finalFileName}" class="btn-action">
                            <i class="fa-solid fa-download"></i> Download Protected PDF
                        </a>
                        <button class="btn-secondary" onclick="resetTool()">
                            <i class="fa-solid fa-rotate-right"></i> Protect Another
                        </button>
                        <a href="/" class="btn-secondary">
                            <i class="fa-solid fa-toolbox"></i> Other Tools
                        </a>
                    </div>
                `;
            }, 600);

        } catch (error) {
            console.error('Encryption Error:', error);
            alert('A critical error occurred. Ensure your uploaded PDF file is uncorrupted.');
            actionBtn.disabled = false;
            actionBtn.innerHTML = '<i class="fa-solid fa-lock"></i> Encrypt PDF';
        }
    }

});
