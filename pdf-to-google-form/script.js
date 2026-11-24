// Configure PDF.js Worker
if (typeof pdfjsLib !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const dropzone = document.getElementById('pdf-dropzone');
    const dropzoneStatus = document.getElementById('dropzone-status');
    const fileInput = document.getElementById('file-input');
    const selectFilesBtn = document.getElementById('select-files-btn');

    const workspace = document.getElementById('editor-workspace');
    const formTitleInput = document.getElementById('form-title-input');
    const quizModeCheckbox = document.getElementById('quiz-mode-checkbox');
    const requireAllCheckbox = document.getElementById('require-all-checkbox');
    const questionsList = document.getElementById('questions-list');

    const addQuestionBtn = document.getElementById('add-question-btn');
    const resetToolBtn = document.getElementById('reset-tool-btn');
    const copyScriptBtn = document.getElementById('copy-script-btn');
    const toggleCodeBtn = document.getElementById('toggle-code-btn');
    const scriptPreview = document.getElementById('script-preview');

    // Application State
    let questions = [];
    const defaultDropzoneText = 'Drop your PDF question paper here (or paste using Ctrl+V)';

    // --- 1. FILE UPLOAD, DRAG & DROP, AND CTRL+V PASTE ---
    selectFilesBtn.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            handlePDFFile(e.target.files[0]);
        }
    });

    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
    });

    dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('dragover');
    });

    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file) handlePDFFile(file);
    });

    window.addEventListener('paste', (e) => {
        const items = e.clipboardData?.items;
        if (!items) return;
        for (const item of items) {
            if (item.type === 'application/pdf') {
                const file = item.getAsFile();
                if (file) handlePDFFile(file);
                break;
            }
        }
    });

    // --- 2. EXTRACT TEXT FROM PDF CLIENT-SIDE ---
    async function handlePDFFile(file) {
        if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
            setDropzoneMessage('Please select a valid PDF file.', true);
            return;
        }

        setDropzoneMessage(`Reading "${file.name}" locally in your browser...`, false);
        selectFilesBtn.disabled = true;

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let allLines = [];

            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                const page = await pdf.getPage(pageNum);
                const textContent = await page.getTextContent();
                const pageLines = reconstructLines(textContent.items);
                allLines = allLines.concat(pageLines);
            }

            const cleanTitle = file.name.replace(/\.pdf$/i, '').replace(/[_-]+/g, ' ').trim();
            formTitleInput.value = cleanTitle || 'Untitled Quiz';

            if (allLines.join('').trim().length < 15) {
                setDropzoneMessage(
                    'This PDF appears to be a scanned image with no selectable text. You can still add questions manually below.',
                    true
                );
                questions = [createEmptyQuestion()];
            } else {
                questions = parseQuestionsFromLines(allLines);
                if (questions.length === 0) {
                    questions = [createEmptyQuestion()];
                }
                setDropzoneMessage(`Loaded ${questions.length} question(s) from "${file.name}"`, false);
            }

            renderQuestions();
            updateGeneratedScript();
            workspace.classList.add('active');
            workspace.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } catch (err) {
            console.error('PDF parsing error:', err);
            setDropzoneMessage('Could not read this PDF. Make sure it is not password-protected.', true);
        } finally {
            selectFilesBtn.disabled = false;
        }
    }

    function setDropzoneMessage(msg, isError) {
        dropzoneStatus.textContent = msg;
        dropzoneStatus.style.color = isError ? '#f87171' : '#fff';
    }

    // Group PDF.js text items into visual lines using Y/X coordinates
    function reconstructLines(items) {
        const rows = [];
        const yTolerance = 4;

        for (const item of items) {
            const str = item.str;
            if (!str || !str.trim()) continue;

            const x = item.transform[4];
            const y = item.transform[5];

            let row = rows.find((r) => Math.abs(r.y - y) <= yTolerance);
            if (!row) {
                row = { y, items: [] };
                rows.push(row);
            }
            row.items.push({ x, str });
        }

        // Sort top-to-bottom (higher Y is higher on page in PDF coordinates)
        rows.sort((a, b) => b.y - a.y);

        return rows.map((row) => {
            row.items.sort((a, b) => a.x - b.x);
            return row.items.map((i) => i.str).join(' ').replace(/\s+/g, ' ').trim();
        });
    }

    // --- 3. PARSE QUESTIONS & OPTIONS ---
    function parseQuestionsFromLines(lines) {
        const parsed = [];
        let currentQ = null;

        // Matches: "1. What is...", "Q1) What is...", "Q. 2 - What is..."
        const questionStartRegex = /^(?:Q(?:uestion)?\.?\s*)?(\d{1,3})[\.\)\:\-]\s+(.+)/i;
        // Matches single option line: "(a) Option", "A) Option", "a. Option"
        const singleOptionRegex = /^(?:\(?([A-Ea-e])\)?[\.\)\:\-])\s+(.+)/;
        // Matches multiple inline options on one line: "(a) Foo (b) Bar (c) Baz (d) Qux"
        const inlineOptionsRegex = /(?:^|\s)\(?([A-Ea-e])\)?[\.\)\:]\s+([^\(\)]+?)(?=\s+\(?[A-Ea-e]\)?[\.\)\:]|$)/g;

        for (const rawLine of lines) {
            const line = rawLine.trim();
            if (!line) continue;

            // Skip common exam headers/footers
            if (/^(page\s+\d+|time\s*:|max\.?\s*marks|total\s*marks|section\s+[a-z0-9]+)$/i.test(line)) {
                continue;
            }

            // 1. Check for inline multiple options on the same line (e.g., A) x  B) y  C) z  D) w)
            const inlineMatches = [...line.matchAll(inlineOptionsRegex)];
            if (currentQ && inlineMatches.length >= 2) {
                for (const match of inlineMatches) {
                    currentQ.options.push({ text: match[2].trim(), isCorrect: false });
                }
                currentQ.type = 'MULTIPLE_CHOICE';
                continue;
            }

            // 2. Check for a single option line
            const optMatch = line.match(singleOptionRegex);
            if (currentQ && optMatch) {
                currentQ.options.push({ text: optMatch[2].trim(), isCorrect: false });
                currentQ.type = 'MULTIPLE_CHOICE';
                continue;
            }

            // 3. Check for a new numbered question
            const qMatch = line.match(questionStartRegex);
            if (qMatch) {
                if (currentQ) parsed.push(finalizeQuestion(currentQ));
                currentQ = {
                    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
                    prompt: qMatch[2].trim(),
                    type: 'SHORT_ANSWER',
                    options: [],
                    required: requireAllCheckbox.checked
                };
                continue;
            }

            // 4. Continuation line for the current question or last option
            if (currentQ) {
                if (currentQ.options.length > 0) {
                    const lastOpt = currentQ.options[currentQ.options.length - 1];
                    lastOpt.text += ' ' + line;
                } else {
                    currentQ.prompt += ' ' + line;
                }
            }
        }

        if (currentQ) parsed.push(finalizeQuestion(currentQ));

        // Fallback if no numbered questions were found at all: treat substantive lines as Short Answer
        if (parsed.length === 0) {
            for (const line of lines) {
                if (line.length > 8) {
                    parsed.push({
                        id: String(Date.now() + Math.random()),
                        prompt: line,
                        type: 'SHORT_ANSWER',
                        options: [],
                        required: requireAllCheckbox.checked
                    });
                }
            }
        }

        return parsed;
    }

    function finalizeQuestion(q) {
        if (q.options.length >= 2) {
            q.type = 'MULTIPLE_CHOICE';
        } else {
            q.type = 'SHORT_ANSWER';
            q.options = [];
        }
        return q;
    }

    function createEmptyQuestion() {
        return {
            id: String(Date.now() + Math.random()),
            prompt: '',
            type: 'MULTIPLE_CHOICE',
            options: [
                { text: 'Option 1', isCorrect: false },
                { text: 'Option 2', isCorrect: false }
            ],
            required: requireAllCheckbox.checked
        };
    }

    // --- 4. RENDER INTERACTIVE QUESTION EDITOR ---
    function renderQuestions() {
        questionsList.innerHTML = '';
        const isQuiz = quizModeCheckbox.checked;

        questions.forEach((q, qIndex) => {
            const card = document.createElement('div');
            card.className = 'question-card';

            // Top row: Question number, Prompt input, Type selector, Delete button
            const topRow = document.createElement('div');
            topRow.className = 'question-card-top';

            const numBadge = document.createElement('span');
            numBadge.textContent = `Q${qIndex + 1}`;
            numBadge.style.cssText =
                'font-family: "JetBrains Mono", monospace; font-weight: 700; color: var(--theme-color); align-self: center; min-width: 34px;';

            const promptInput = document.createElement('input');
            promptInput.type = 'text';
            promptInput.className = 'text-input';
            promptInput.placeholder = 'Enter question text...';
            promptInput.value = q.prompt;
            promptInput.addEventListener('input', (e) => {
                q.prompt = e.target.value;
                updateGeneratedScript();
            });

            const typeSelect = document.createElement('select');
            typeSelect.className = 'select-input';
            const types = [
                { value: 'MULTIPLE_CHOICE', label: 'Multiple Choice' },
                { value: 'CHECKBOX', label: 'Checkboxes' },
                { value: 'SHORT_ANSWER', label: 'Short Answer' },
                { value: 'PARAGRAPH', label: 'Paragraph' }
            ];
            types.forEach((t) => {
                const opt = document.createElement('option');
                opt.value = t.value;
                opt.textContent = t.label;
                if (q.type === t.value) opt.selected = true;
                typeSelect.appendChild(opt);
            });
            typeSelect.addEventListener('change', (e) => {
                q.type = e.target.value;
                if ((q.type === 'MULTIPLE_CHOICE' || q.type === 'CHECKBOX') && q.options.length === 0) {
                    q.options = [
                        { text: 'Option 1', isCorrect: false },
                        { text: 'Option 2', isCorrect: false }
                    ];
                }
                renderQuestions();
                updateGeneratedScript();
            });

            const deleteBtn = document.createElement('button');
            deleteBtn.type = 'button';
            deleteBtn.className = 'btn-icon-danger';
            deleteBtn.title = 'Delete question';
            deleteBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
            deleteBtn.addEventListener('click', () => {
                questions.splice(qIndex, 1);
                renderQuestions();
                updateGeneratedScript();
            });

            topRow.append(numBadge, promptInput, typeSelect, deleteBtn);
            card.appendChild(topRow);

            // Options area (for Multiple Choice / Checkboxes)
            if (q.type === 'MULTIPLE_CHOICE' || q.type === 'CHECKBOX') {
                const optionsContainer = document.createElement('div');
                optionsContainer.style.cssText =
                    'display: flex; flex-direction: column; gap: 0.6rem; padding-left: 2.6rem; margin-bottom: 0.8rem;';

                q.options.forEach((opt, optIndex) => {
                    const optRow = document.createElement('div');
                    optRow.style.cssText = 'display: flex; align-items: center; gap: 0.6rem;';

                    // Correct answer selector (visible when Quiz Mode is enabled)
                    if (isQuiz) {
                        const correctBtn = document.createElement('button');
                        correctBtn.type = 'button';
                        correctBtn.title = opt.isCorrect ? 'Marked as correct answer' : 'Mark as correct answer';
                        correctBtn.style.cssText = `
                            background: ${opt.isCorrect ? 'rgba(16, 185, 129, 0.2)' : 'transparent'};
                            border: 1px solid ${opt.isCorrect ? '#34d399' : 'var(--border-input)'};
                            color: ${opt.isCorrect ? '#34d399' : 'var(--text-muted)'};
                            border-radius: 50%;
                            width: 28px;
                            height: 28px;
                            cursor: pointer;
                            flex-shrink: 0;
                            display: inline-flex;
                            align-items: center;
                            justify-content: center;
                        `;
                        correctBtn.innerHTML = '<i class="fa-solid fa-check" style="font-size: 0.75rem;"></i>';
                        correctBtn.addEventListener('click', () => {
                            if (q.type === 'MULTIPLE_CHOICE') {
                                q.options.forEach((o, idx) => (o.isCorrect = idx === optIndex ? !o.isCorrect : false));
                            } else {
                                opt.isCorrect = !opt.isCorrect;
                            }
                            renderQuestions();
                            updateGeneratedScript();
                        });
                        optRow.appendChild(correctBtn);
                    }

                    const optInput = document.createElement('input');
                    optInput.type = 'text';
                    optInput.className = 'text-input';
                    optInput.style.padding = '0.45rem 0.75rem';
                    optInput.style.fontSize = '0.9rem';
                    optInput.placeholder = `Option ${optIndex + 1}`;
                    optInput.value = opt.text;
                    optInput.addEventListener('input', (e) => {
                        opt.text = e.target.value;
                        updateGeneratedScript();
                    });

                    const removeOptBtn = document.createElement('button');
                    removeOptBtn.type = 'button';
                    removeOptBtn.title = 'Remove option';
                    removeOptBtn.style.cssText =
                        'background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 0.3rem 0.5rem; font-size: 1rem;';
                    removeOptBtn.innerHTML = '&times;';
                    removeOptBtn.addEventListener('click', () => {
                        q.options.splice(optIndex, 1);
                        renderQuestions();
                        updateGeneratedScript();
                    });

                    optRow.append(optInput, removeOptBtn);
                    optionsContainer.appendChild(optRow);
                });

                const addOptBtn = document.createElement('button');
                addOptBtn.type = 'button';
                addOptBtn.style.cssText =
                    'align-self: flex-start; background: none; border: none; color: var(--theme-color); font-family: inherit; font-size: 0.85rem; font-weight: 600; cursor: pointer; margin-top: 0.2rem;';
                addOptBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Add Option';
                addOptBtn.addEventListener('click', () => {
                    q.options.push({ text: `Option ${q.options.length + 1}`, isCorrect: false });
                    renderQuestions();
                    updateGeneratedScript();
                });

                optionsContainer.appendChild(addOptBtn);
                card.appendChild(optionsContainer);
            }

            // Bottom bar: Required toggle + Answer key hint
            const footerRow = document.createElement('div');
            footerRow.style.cssText =
                'display: flex; justify-content: space-between; align-items: center; padding-left: 2.6rem; font-size: 0.8rem; color: var(--text-muted);';

            const hintText = document.createElement('span');
            if (isQuiz && (q.type === 'MULTIPLE_CHOICE' || q.type === 'CHECKBOX')) {
                hintText.textContent = 'Tip: Click the circle next to an option to set the answer key.';
            }

            const reqLabel = document.createElement('label');
            reqLabel.style.cssText = 'display: inline-flex; align-items: center; gap: 6px; cursor: pointer; margin-left: auto;';
            const reqCheckbox = document.createElement('input');
            reqCheckbox.type = 'checkbox';
            reqCheckbox.checked = q.required;
            reqCheckbox.style.accentColor = 'var(--theme-color)';
            reqCheckbox.addEventListener('change', (e) => {
                q.required = e.target.checked;
                requireAllCheckbox.checked = questions.length > 0 && questions.every((item) => item.required);
                updateGeneratedScript();
            });
            reqLabel.append(reqCheckbox, document.createTextNode('Required'));

            footerRow.append(hintText, reqLabel);
            card.appendChild(footerRow);

            questionsList.appendChild(card);
        });
    }

    // --- 5. GENERATE GOOGLE APPS SCRIPT ---
    function updateGeneratedScript() {
        const formTitle = formTitleInput.value.trim() || 'Untitled Quiz';
        const isQuiz = quizModeCheckbox.checked;

        const lines = [
            '// Generated by PDFase (https://pdfase.rupamdas.in/pdf-to-google-form)',
            '// Paste this entire script into https://script.google.com/create, press Ctrl+S to Save, and click Run.',
            '',
            'function createGoogleForm() {',
            `  var form = FormApp.create(${JSON.stringify(formTitle)});`,
            `  form.setIsQuiz(${isQuiz});`,
            ''
        ];

        questions.forEach((q, idx) => {
            const prompt = q.prompt.trim() || `Question ${idx + 1}`;
            const varName = `q${idx + 1}`;

            if (q.type === 'MULTIPLE_CHOICE' || q.type === 'CHECKBOX') {
                const validOptions = q.options.filter((o) => o.text.trim().length > 0);
                if (validOptions.length === 0) return;

                const creatorMethod =
                    q.type === 'MULTIPLE_CHOICE' ? 'addMultipleChoiceItem' : 'addCheckboxItem';

                lines.push(`  var ${varName} = form.${creatorMethod}();`);
                lines.push(`  ${varName}.setTitle(${JSON.stringify(prompt)});`);

                const hasCorrectAnswer = isQuiz && validOptions.some((o) => o.isCorrect);
                if (hasCorrectAnswer) {
                    lines.push(`  ${varName}.setPoints(1);`);
                }

                lines.push(`  ${varName}.setChoices([`);
                validOptions.forEach((opt, oIdx) => {
                    const comma = oIdx < validOptions.length - 1 ? ',' : '';
                    if (isQuiz) {
                        lines.push(
                            `    ${varName}.createChoice(${JSON.stringify(opt.text.trim())}, ${Boolean(opt.isCorrect)})${comma}`
                        );
                    } else {
                        lines.push(`    ${varName}.createChoice(${JSON.stringify(opt.text.trim())})${comma}`);
                    }
                });
                lines.push('  ]);');
                lines.push(`  ${varName}.setRequired(${Boolean(q.required)});`);
                lines.push('');
            } else if (q.type === 'PARAGRAPH') {
                lines.push(`  var ${varName} = form.addParagraphTextItem();`);
                lines.push(`  ${varName}.setTitle(${JSON.stringify(prompt)});`);
                lines.push(`  ${varName}.setRequired(${Boolean(q.required)});`);
                lines.push('');
            } else {
                lines.push(`  var ${varName} = form.addTextItem();`);
                lines.push(`  ${varName}.setTitle(${JSON.stringify(prompt)});`);
                lines.push(`  ${varName}.setRequired(${Boolean(q.required)});`);
                lines.push('');
            }
        });

        lines.push('  Logger.log("SUCCESS! Your Google Form is ready.");');
        lines.push('  Logger.log("Edit Form (Teacher Link): " + form.getEditUrl());');
        lines.push('  Logger.log("Share Form (Student Link): " + form.getPublishedUrl());');
        lines.push('}');

        scriptPreview.textContent = lines.join('\n');
    }

    // --- 6. WORKSPACE CONTROLS & COPY ACTION ---
    formTitleInput.addEventListener('input', updateGeneratedScript);

    quizModeCheckbox.addEventListener('change', () => {
        renderQuestions();
        updateGeneratedScript();
    });

requireAllCheckbox.addEventListener('change', () => {
        const isRequired = requireAllCheckbox.checked;
        questions.forEach((q) => {
            q.required = isRequired;
        });
        renderQuestions();
        updateGeneratedScript();
    });
    
    addQuestionBtn.addEventListener('click', () => {
        questions.push(createEmptyQuestion());
        renderQuestions();
        updateGeneratedScript();
    });

    resetToolBtn.addEventListener('click', () => {
        questions = [];
        fileInput.value = '';
        formTitleInput.value = '';
        questionsList.innerHTML = '';
        scriptPreview.textContent = '';
        scriptPreview.classList.remove('open');
        requireAllCheckbox.checked = false
        toggleCodeBtn.textContent = 'View generated script';
        workspace.classList.remove('active');
        setDropzoneMessage(defaultDropzoneText, false);
        dropzone.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    toggleCodeBtn.addEventListener('click', () => {
        const isOpen = scriptPreview.classList.toggle('open');
        toggleCodeBtn.textContent = isOpen ? 'Hide generated script' : 'View generated script';
    });

    copyScriptBtn.addEventListener('click', async () => {
        const code = scriptPreview.textContent;
        if (!code) return;

        try {
            await navigator.clipboard.writeText(code);
        } catch {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = code;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
        }

        const originalHTML = copyScriptBtn.innerHTML;
        copyScriptBtn.innerHTML = '<i class="fa-solid fa-check"></i> Copied! Now click Step 2';
        copyScriptBtn.style.backgroundColor = '#10b981';

        setTimeout(() => {
            copyScriptBtn.innerHTML = originalHTML;
            copyScriptBtn.style.backgroundColor = '';
        }, 3000);
    });
});
