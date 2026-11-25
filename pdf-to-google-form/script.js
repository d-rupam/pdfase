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
    const addNumbersCheckbox = document.getElementById('add-numbers-checkbox');
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
// Helper: Clean Markdown symbols (**, __, ###, bullet dashes) from AI or PDF text
    function cleanLine(raw) {
        return raw
            .replace(/\*\*|__/g, '')         // Remove bold markers
            .replace(/^#+\s*/, '')           // Remove ### headings
            .replace(/^[\*•\-]\s+/, '')      // Remove bullet points (keeps negative numbers like -5 safe)
            .trim();
    }

    // Helper: Mark option A-E as the green-tick correct answer
    function markAnswerByLetter(question, letter) {
        if (!question || !letter) return;
        const idx = letter.toUpperCase().charCodeAt(0) - 65; // A=0, B=1, C=2...
        if (idx >= 0 && idx < question.options.length) {
            question.options.forEach((opt, i) => {
                opt.isCorrect = i === idx;
            });
        }
    }

    // --- 3. PARSE QUESTIONS, ANSWER KEYS & EXPLANATIONS ---
    function parseQuestionsFromLines(lines) {
        const parsed = [];
        let currentQ = null;
        let inAnswerKeySection = false;
        let lastKeyQuestion = null;

        const questionStartRegex = /^(?:Q(?:uestion)?\.?\s*)?(\d{1,3})[\.\)\:\-]\s+(.+)/i;
        const singleOptionRegex = /^(?:\(?([A-Ea-e])\)?[\.\)\:\-])\s+(.+)/;
        const inlineOptionsRegex = /(?:^|\s)\(?([A-Ea-e])\)?[\.\)\:]\s+([^\(\)]+?)(?=\s+\(?[A-Ea-e]\)?[\.\)\:]|$)/g;

        // Matches: "Answer: B", "Correct Answer: (c)", "Ans - A"
        const inlineAnswerRegex = /^(?:correct\s*)?ans(?:wer)?\s*[:\-\.]\s*\(?([A-Ea-e])\)?(?:\b[\.\)\:\-]?\s*(.*))?$/i;
        // Matches: "Explanation: ...", "Solution: ...", "Reason: ..."
        const explanationRegex = /^(?:explanation|rationale|reason|solution|hint|feedback)\s*[:\-]\s*(.+)/i;
        // Matches bottom section header: "Answer Key", "Solutions:", "Answers"
        const answerSectionHeaderRegex = /^(?:answer\s*key|answers|solutions|correct\s*answers)\s*:?$/i;
        // Matches single line in Answer Key: "1. B", "Q2) (c) - Explanation..."
        const keyEntryRegex = /^(?:Q\.?\s*)?(\d{1,3})[\.\)\:\-\s]+\(?([A-Ea-e])\)?(?:\s*[\.\)\:\-\u2013\u2014]\s*(.*))?$/i;
        // Matches compact Answer Key on one line: "1. A, 2. B, 3. C" or "1-A 2-B 3-C"
        const compactKeyRegex = /(?:Q\.?\s*)?(\d{1,3})\s*[\.\)\:\-]\s*\(?([A-Ea-e])\)?/gi;
        // Matches AI sign-off / divider fluff
        const outroFluffRegex = /^(?:---+|___+|\*\*\*+|hope this helps|let me know if|feel free to|good luck|would you like)/i;

        for (const rawLine of lines) {
            const line = cleanLine(rawLine);
            if (!line) continue;

            // Stop capturing continuation text on AI outro fluff or dividers
            if (outroFluffRegex.test(line)) {
                if (currentQ) {
                    parsed.push(finalizeQuestion(currentQ));
                    currentQ = null;
                }
                continue;
            }

            // Skip common exam header/footer noise
            if (/^(page\s+\d+|time\s*:|max\.?\s*marks|total\s*marks|section\s+[a-z0-9]+)$/i.test(line)) {
                continue;
            }

            // Detect separate "Answer Key" or "Solutions" section at the bottom
            if (answerSectionHeaderRegex.test(line)) {
                if (currentQ) {
                    parsed.push(finalizeQuestion(currentQ));
                    currentQ = null;
                }
                inAnswerKeySection = true;
                continue;
            }

            // MODE A: Matching a separate Answer Key / Solutions section at the bottom
            if (inAnswerKeySection) {
                const compactMatches = [...line.matchAll(compactKeyRegex)];
                if (compactMatches.length >= 2) {
                    for (const m of compactMatches) {
                        const qNum = parseInt(m[1], 10);
                        const targetQ = parsed.find((q) => q.originalNum === qNum) || parsed[qNum - 1];
                        markAnswerByLetter(targetQ, m[2]);
                    }
                    lastKeyQuestion = null;
                    continue;
                }

                const keyMatch = line.match(keyEntryRegex);
                if (keyMatch) {
                    const qNum = parseInt(keyMatch[1], 10);
                    const targetQ = parsed.find((q) => q.originalNum === qNum) || parsed[qNum - 1];
                    if (targetQ) {
                        markAnswerByLetter(targetQ, keyMatch[2]);
                        const extraText = (keyMatch[3] || '').trim();
                        // Attach extra text as explanation if it isn't just repeating the option text
                        const matchedOpt = targetQ.options[keyMatch[2].toUpperCase().charCodeAt(0) - 65];
                        if (extraText && (!matchedOpt || extraText.toLowerCase() !== matchedOpt.text.toLowerCase())) {
                            targetQ.explanation = extraText.replace(/^(?:explanation|reason)\s*[:\-]\s*/i, '').trim();
                        }
                        lastKeyQuestion = targetQ;
                    }
                    continue;
                }

                // Catch "Explanation: ..." or continuation line under a bottom solution entry
                if (lastKeyQuestion) {
                    const expMatch = line.match(explanationRegex);
                    const addText = expMatch ? expMatch[1].trim() : line;
                    lastKeyQuestion.explanation = lastKeyQuestion.explanation
                        ? `${lastKeyQuestion.explanation} ${addText}`
                        : addText;
                }
                continue;
            }

            // MODE B: Normal question parsing
            // 1. Inline Explanation right below a question
            const expMatch = line.match(explanationRegex);
            if (currentQ && expMatch) {
                currentQ.explanation = expMatch[1].trim();
                currentQ._inExplanation = true;
                continue;
            }

            // 2. Inline Answer right below a question (e.g., "Answer: B")
            const ansMatch = line.match(inlineAnswerRegex);
            if (currentQ && ansMatch && currentQ.options.length > 0) {
                markAnswerByLetter(currentQ, ansMatch[1]);
                currentQ._inExplanation = false;
                continue;
            }

            // 3. Inline multiple options on the same line (e.g., A) x  B) y  C) z  D) w)
            const inlineMatches = [...line.matchAll(inlineOptionsRegex)];
            if (currentQ && inlineMatches.length >= 2) {
                for (const match of inlineMatches) {
                    currentQ.options.push({ text: match[2].trim(), isCorrect: false });
                }
                currentQ.type = 'MULTIPLE_CHOICE';
                currentQ._inExplanation = false;
                continue;
            }

            // 4. Single option line
            const optMatch = line.match(singleOptionRegex);
            if (currentQ && optMatch) {
                currentQ.options.push({ text: optMatch[2].trim(), isCorrect: false });
                currentQ.type = 'MULTIPLE_CHOICE';
                currentQ._inExplanation = false;
                continue;
            }

            // 5. New numbered question (anything before Q1 is automatically ignored as intro fluff!)
            const qMatch = line.match(questionStartRegex);
            if (qMatch) {
                if (currentQ) parsed.push(finalizeQuestion(currentQ));
                currentQ = {
                    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
                    originalNum: parseInt(qMatch[1], 10),
                    prompt: qMatch[2].trim(),
                    type: 'SHORT_ANSWER',
                    options: [],
                    explanation: '',
                    required: requireAllCheckbox.checked,
                    _inExplanation: false
                };
                continue;
            }

            // 6. Continuation line
            if (currentQ) {
                if (currentQ._inExplanation) {
                    currentQ.explanation += ' ' + line;
                } else if (currentQ.options.length > 0) {
                    const lastOpt = currentQ.options[currentQ.options.length - 1];
                    lastOpt.text += ' ' + line;
                } else {
                    currentQ.prompt += ' ' + line;
                }
            }
        }

        if (currentQ) parsed.push(finalizeQuestion(currentQ));

        // Fallback if no numbered questions were found at all
        if (parsed.length === 0) {
            for (const rawLine of lines) {
                const line = cleanLine(rawLine);
                if (line.length > 8 && !outroFluffRegex.test(line)) {
                    parsed.push({
                        id: String(Date.now() + Math.random()),
                        prompt: line,
                        type: 'SHORT_ANSWER',
                        options: [],
                        explanation: '',
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
            explanation: '',
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

           // Answer Explanation / Feedback input (visible in Quiz Mode)
            if (isQuiz) {
                const expWrapper = document.createElement('div');
                expWrapper.style.cssText = 'padding-left: 2.6rem; margin-bottom: 0.85rem;';

                const expInput = document.createElement('input');
                expInput.type = 'text';
                expInput.className = 'text-input';
                expInput.style.cssText =
                    'padding: 0.45rem 0.75rem; font-size: 0.85rem; border-style: dashed;';
                expInput.placeholder = 'Answer explanation / feedback (optional — shown after submission)';
                expInput.value = q.explanation || '';
                expInput.addEventListener('input', (e) => {
                    q.explanation = e.target.value;
                    updateGeneratedScript();
                });

                expWrapper.appendChild(expInput);
                card.appendChild(expWrapper);
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
        const addNumbers = addNumbersCheckbox.checked;

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
            let prompt = q.prompt.trim() || `Question ${idx + 1}`;
if (addNumbers) {
    // Strip any leftover number first so you never get duplicates like "1. Q1."
    prompt = prompt.replace(/^(?:Q(?:uestion)?\.?\s*)?[\(\[]?\d{1,3}[\)\]]?[\.\)\:\-]?\s+/i, '');
    prompt = `${idx + 1}. ${prompt}`;
}
            const varName = `q${idx + 1}`;
            const explanation = (q.explanation || '').trim();

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
if (isQuiz && explanation) {
                    lines.push(
                        `  var ${varName}Feedback = FormApp.createFeedback().setText(${JSON.stringify(explanation)}).build();`
                    );
                    lines.push(`  ${varName}.setFeedbackForCorrect(${varName}Feedback);`);
                    lines.push(`  ${varName}.setFeedbackForIncorrect(${varName}Feedback);`);
                }

                
                lines.push(`  ${varName}.setRequired(${Boolean(q.required)});`);
                lines.push('');
                
} else if (q.type === 'PARAGRAPH') {
                lines.push(`  var ${varName} = form.addParagraphTextItem();`);
                lines.push(`  ${varName}.setTitle(${JSON.stringify(prompt)});`);
                if (isQuiz && explanation) {
                    lines.push(
                        `  ${varName}.setGeneralFeedback(FormApp.createFeedback().setText(${JSON.stringify(explanation)}).build());`
                    );
                }
                lines.push(`  ${varName}.setRequired(${Boolean(q.required)});`);
                lines.push('');
            } else {
                lines.push(`  var ${varName} = form.addTextItem();`);
                lines.push(`  ${varName}.setTitle(${JSON.stringify(prompt)});`);
                if (isQuiz && explanation) {
                    lines.push(
                        `  ${varName}.setGeneralFeedback(FormApp.createFeedback().setText(${JSON.stringify(explanation)}).build());`
                    );
                }
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

    addNumbersCheckbox.addEventListener('change', updateGeneratedScript);
    
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
        requireAllCheckbox.checked = false;
        addNumbersCheckbox.checked = false;
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
