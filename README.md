# 🧬 PDFase: The Digital Enzyme Hub

[![Local First](https://img.shields.io/badge/Architecture-100%25_Local_Browser-success?style=for-the-badge)](https://pdfase.rupamdas.in/)
[![Vanilla JS](https://img.shields.io/badge/Tech_Stack-Vanilla_JS_%7C_HTML_%7C_CSS-f7df1e?style=for-the-badge&logo=javascript&logoColor=black)]()
[![Cloudflare Pages](https://img.shields.io/badge/Hosted_On-Cloudflare_Pages-f38020?style=for-the-badge&logo=cloudflare&logoColor=white)]()

**PDFase** is a high-performance, privacy-first ecosystem of 30+ PDF manipulation tools designed specifically for researchers, academics, and data professionals. 

> **[ THE METAPHOR ]** In cellular biochemistry, an enzyme (identified by the suffix "-ase") is a high-speed, specialized molecular machine that binds directly to a raw substrate to cut, synthesize, or structurally modify it. 
> 
> **PDFase** functions as the active digital enzyme for your documents. It hosts a suite of high-precision scripts engineered to cleave, ligate, and compress PDF substrates locally.

## 🔒 The Privacy Promise (Zero-Server Architecture)
Handling unpublished research, confidential lab data, and sensitive academic manuscripts requires absolute data sovereignty. 

**Every single tool in PDFase executes entirely within your browser's memory hardware.** 
* Zero server uploads. 
* Zero cloud processing queues.
* Zero external data retention. 
* Once the application loads, it can function completely offline.

---

## 🛠️ The Tool Catalog

PDFase is categorized into four distinct functional families, color-coded for workflow efficiency:

### 🟦 Organize (Cyan) - *Structural Assembly*
* **Merge & Split PDF:** Combine multiple documents or cleave them into individual pages.
* **Extract & Delete:** Isolate specific pages or remove redundant data.
* **Interweave & Reorder:** Interlace pages from two different documents or reverse document order.

### 🟪 Convert (Purple) - *Substrate Transformation*
* **Image ↔ PDF Rendering:** Bi-directional conversion for JPEG, PNG, and TIFF.
* **Extract Text to TXT / Markdown:** Strip layout wrappers and extract pure raw text strings.
* **JSON to PDF Report Generator:** Compile raw JSON data arrays into structured, printable A4 layouts.

### 🟩 Edit (Green) - *Direct Modification*
* **Flatten PDF:** Lock interactive form fields and annotations into permanent, un-editable page graphics.
* **Invert Colors (Dark Mode):** Transform blinding white document backgrounds into comfortable dark-mode layouts for late-night reading.
* **Crop PDF:** Isolate specific visual bounds using a precise 8-handle grid system.
* **Bates Numbering:** Stamp fixed-width legal/academic Bates IDs across massive document sets.

### 🟨 Protect & Optimize (Amber) - *Security & Diagnostics*
* **PDF Font & Preflight Checker:** Audit embedded fonts, color spaces, and layout compliance before submitting papers to academic journals.
* **Compress PDF:** Reduce footprint size via adjustable client-side compression.
* **Metadata Editor / Eraser:** Strip or modify invisible document tracking data.
* **Local OCR:** Utilize WebAssembly neural networks (`tesseract.js`) to make scanned documents fully searchable.

---

## 💻 Technical Stack & Engine

PDFase is built to be brutally fast and lightweight, avoiding heavy frontend frameworks in favor of raw performance:
* **Core Logic:** Vanilla JavaScript (ES6+), HTML5, CSS3.
* **PDF Engine:** [`pdf-lib`](https://pdf-lib.js.org/) for direct structural modification of PDF object trees.
* **Rendering Engine:** [`pdf.js`](https://mozilla.github.io/pdf.js/) for high-fidelity canvas visualization and text extraction.
* **OCR Engine:** [`tesseract.js`](https://tesseract.projectnaptha.com/) for client-side Optical Character Recognition.

## 🚀 Running Locally

Because PDFase relies on pure client-side processing, there is no complex build step, npm installation, or backend server required.

1. Clone the repository:
   ```bash
   git clone [https://github.com/d-rupam/pdfase.git](https://github.com/d-rupam/pdfase.git)
