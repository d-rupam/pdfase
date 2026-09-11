// ==========================================
// 1. INJECT DEPENDENCIES & STYLES (SCAN TO PDF)
// ==========================================
(function initEnvironment() {
    // Inject pdf-lib for compiling the final PDF
    if (!window.PDFLib) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js';
        document.head.appendChild(script);
    }

    const style = document.createElement('style');
    style.innerHTML = `
        /* Dynamic Layout Adjustments */
        .scanner-container.active { padding: 1rem; border-color: var(--theme-color); }
        
        /* Gallery Grid */
        .gallery-grid { display: flex; flex-wrap: wrap; gap: 1rem; justify-content: center; width: 100%; margin-top: 2rem; padding: 1rem; background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 12px; }
        .gallery-grid:empty { display: none; }
        
        /* Image Thumbnail Card */
        .scan-card { width: 140px; height: 190px; background-color: var(--bg-base); border: 1px solid var(--border-subtle); border-radius: 8px; position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; transition: all 0.2s ease; box-shadow: 0 4px 10px rgba(0,0,0,0.2); user-select: none; overflow: hidden; padding: 5px; }
        .scan-card:hover { border-color: rgba(255, 191, 0, 0.5); transform: translateY(-3px); box-shadow: 0 6px 15px rgba(255, 191, 0, 0.15); }
        
        .scan-img { max-width: 100%; max-height: 140px; object-fit: contain; border-radius: 4px; }
        
        .scan-label { font-size: 0.75rem; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; margin-top: 8px; font-weight: 600; }
        
        .scan-remove { position: absolute; top: -5px; right: -5px; background: #ff3366; color: #fff; border: none; border-radius: 50%; width: 24px; height: 24px; font-size: 0.8rem; cursor: pointer; display: flex; justify-content: center; align-items: center; box-shadow: 0 2px 5px rgba(0,0,0,0.4); z-index: 10; transition: transform 0.2s; }
        .scan-remove:hover { transform: scale(1.1); }

        /* Action Container */
        .action-container { margin-top: 1.5rem; display: none; gap: 1.5rem; justify-content: center; flex-direction: column; align-items: center; animation: fadeIn 0.4s ease; width: 100%; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        .button-group { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; width: 100%; }

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
        .file-flow-final { color: #fff; font-weight: 700; border-bottom: 1px dashed var(--theme-color, #ffbf00); font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; }
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
    let capturedImages = [];
    let videoStream = null;

    const scannerContainer = document.getElementById('scanner-container');
    const idleUI = document.getElementById('camera-idle-ui');
    const cameraWrapper = document.getElementById('camera-wrapper');
    const videoElem = document.getElementById('camera-stream');
    const btnStartCamera = document.getElementById('btn-start-camera');
    const btnCapture = document.getElementById('btn-capture');

    // Create Gallery and Action areas dynamically
    const galleryGrid = document.createElement('div');
    galleryGrid.className = 'gallery-grid';
    
    const actionContainer = document.createElement('div');
    actionContainer.className = 'action-container';
    actionContainer.innerHTML = `
        <div class="button-group">
            <button class="btn-action" id="btn-generate-pdf">
                <i class="fa-solid fa-file-pdf"></i> Create PDF
            </button>
            <button class="btn-secondary" id="btn-cancel-scan">
                <i class="fa-solid fa-xmark"></i> Cancel
            </button>
        </div>
    `;

    scannerContainer.parentNode.insertBefore(galleryGrid, scannerContainer.nextSibling);
    galleryGrid.parentNode.insertBefore(actionContainer, galleryGrid.nextSibling);

    const btnGenerate = actionContainer.querySelector('#btn-generate-pdf');
    const btnCancel = actionContainer.querySelector('#btn-cancel-scan');

    // ==========================================
    // 3. CAMERA LOGIC (WebRTC)
    // ==========================================
    btnStartCamera.addEventListener('click', async () => {
        try {
            // Prioritize the rear camera on mobile devices for document scanning
            const constraints = {
                video: {
                    facingMode: 'environment',
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                },
                audio: false
            };

            videoStream = await navigator.mediaDevices.getUserMedia(constraints);
            videoElem.srcObject = videoStream;
            
            // Check if it's the front camera. If it's front, mirror it. If rear, don't mirror (so text reads normally).
            const track = videoStream.getVideoTracks()[0];
            const settings = track.getSettings();
            if (settings.facingMode === 'user') {
                videoElem.style.transform = 'scaleX(-1)';
            } else {
                videoElem.style.transform = 'none'; // Essential for reading text correctly
            }

            idleUI.style.display = 'none';
            cameraWrapper.style.display = 'block';
            scannerContainer.classList.add('active');

        } catch (error) {
            console.error('Camera access denied or unavailable.', error);
            alert('Unable to access camera. Please check your browser permissions.');
        }
    });

    function stopCamera() {
        if (videoStream) {
            videoStream.getTracks().forEach(track => track.stop());
            videoStream = null;
        }
        videoElem.srcObject = null;
        cameraWrapper.style.display = 'none';
        idleUI.style.display = 'flex';
        scannerContainer.classList.remove('active');
    }

    btnCancel.addEventListener('click', () => {
        stopCamera();
        capturedImages = [];
        updateGallery();
    });

    window.resetTool = function() {
        window.location.reload(); 
    };

    // ==========================================
    // 4. CAPTURE LOGIC
    // ==========================================
    btnCapture.addEventListener('click', () => {
        if (!videoElem.videoWidth) return;

        // Visual flash effect
        cameraWrapper.style.opacity = '0.3';
        setTimeout(() => cameraWrapper.style.opacity = '1', 100);

        // Draw video frame to hidden canvas
        const canvas = document.createElement('canvas');
        canvas.width = videoElem.videoWidth;
        canvas.height = videoElem.videoHeight;
        const ctx = canvas.getContext('2d');

        // Handle mirroring if it was applied to the video element
        if (videoElem.style.transform === 'scaleX(-1)') {
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
        }
        
        ctx.drawImage(videoElem, 0, 0, canvas.width, canvas.height);
        
        // Export high-quality JPEG
        const imgDataUrl = canvas.toDataURL('image/jpeg', 0.95);
        
        capturedImages.push({
            id: 'scan_' + Date.now(),
            dataUrl: imgDataUrl
        });

        updateGallery();
    });

    // ==========================================
    // 5. GALLERY UI RENDERING
    // ==========================================
    function updateGallery() {
        galleryGrid.innerHTML = '';
        
        if (capturedImages.length === 0) {
            galleryGrid.style.display = 'none';
            actionContainer.style.display = 'none';
            return;
        }

        galleryGrid.style.display = 'flex';
        actionContainer.style.display = 'flex';

        capturedImages.forEach((imgObj, index) => {
            const card = document.createElement('div');
            card.className = 'scan-card';
            card.innerHTML = `
                <button class="scan-remove" data-id="${imgObj.id}" title="Delete Page">
                    <i class="fa-solid fa-xmark"></i>
                </button>
                <img src="${imgObj.dataUrl}" class="scan-img" alt="Scanned Page ${index + 1}">
                <div class="scan-label">Page ${index + 1}</div>
            `;
            galleryGrid.appendChild(card);
        });

        // Bind delete buttons
        const delBtns = galleryGrid.querySelectorAll('.scan-remove');
        delBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                capturedImages = capturedImages.filter(img => img.id !== id);
                updateGallery();
            });
        });
    }

    // ==========================================
    // 6. CLIENT-SIDE PDF COMPILATION (PDF-LIB)
    // ==========================================
    btnGenerate.addEventListener('click', async () => {
        if (capturedImages.length === 0) return;
        if (!window.PDFLib) {
            alert('Engine is still loading. Please wait.'); return;
        }

        try {
            btnGenerate.disabled = true;
            btnGenerate.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Compiling...';

            const { PDFDocument } = window.PDFLib;
            const pdfDoc = await PDFDocument.create();

            for (const imgObj of capturedImages) {
                // Fetch the base64 string back into an array buffer
                const imgBytes = await fetch(imgObj.dataUrl).then(res => res.arrayBuffer());
                
                // Embed the JPEG into the PDF
                const pdfImage = await pdfDoc.embedJpg(imgBytes);
                
                // Get image dimensions
                const imgDims = pdfImage.scale(1);
                
                // Standard A4 dimensions (in points)
                const A4_WIDTH = 595.28;
                const A4_HEIGHT = 841.89;

                const page = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]);

                // Calculate scaling to fit the image entirely inside the A4 page
                const scale = Math.min(A4_WIDTH / imgDims.width, A4_HEIGHT / imgDims.height);
                const drawWidth = imgDims.width * scale;
                const drawHeight = imgDims.height * scale;
                
                // Center the image on the page
                const xPos = (A4_WIDTH - drawWidth) / 2;
                const yPos = (A4_HEIGHT - drawHeight) / 2;

                page.drawImage(pdfImage, {
                    x: xPos,
                    y: yPos,
                    width: drawWidth,
                    height: drawHeight,
                });
            }

            // Export New Document
            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            
            const timestamp = new Date().toISOString().slice(0,10);
            const finalFileName = `PDFase_Scan_${timestamp}.pdf`;
            
            // Stop Camera gracefully
            stopCamera();
            scannerContainer.style.display = 'none';
            galleryGrid.style.display = 'none';

            // Show Success UI
            actionContainer.innerHTML = `
                <div class="success-message">
                    <i class="fa-solid fa-circle-check"></i> PDF Successfully Created!
                </div>
                <div class="file-flow">
                    <i class="fa-solid fa-file-pdf" style="color: var(--theme-color); margin-right: 8px;"></i>
                    <span class="file-flow-final">${finalFileName}</span>
                    <span style="margin-left: 8px;">(${capturedImages.length} Pages)</span>
                </div>
                <div class="button-group">
                    <a href="${url}" download="${finalFileName}" class="btn-action">
                        <i class="fa-solid fa-download"></i> Download PDF
                    </a>
                    <button class="btn-secondary" onclick="resetTool()">
                        <i class="fa-solid fa-camera-rotate"></i> Start New Scan
                    </button>
                    <a href="/" class="btn-secondary">
                        <i class="fa-solid fa-toolbox"></i> Other Tools
                    </a>
                </div>
            `;

        } catch (error) {
            console.error('PDF Compilation Error:', error);
            alert('A critical error occurred while generating the PDF.');
            btnGenerate.disabled = false;
            btnGenerate.innerHTML = '<i class="fa-solid fa-file-pdf"></i> Create PDF';
        }
    });

}); // End of DOMContentLoaded
