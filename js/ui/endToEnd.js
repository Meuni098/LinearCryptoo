// ============================================================
// LinearCrypt — End-to-End Flow Page
// ============================================================
window.LC = window.LC || {};
LC.EndToEnd = {};

// Default key matrix (known invertible mod 27)
LC.EndToEnd.DEFAULT_KEY = [[2,1,1],[1,4,1],[1,1,8]];

LC.EndToEnd.render = function(container) {
  container.innerHTML = `
    <div class="container page-section" style="padding-top:var(--sp-6)">
      <!-- STEP TIMELINE -->
      <div class="step-timeline" id="step-timeline">
        <div class="step-timeline-track"><div class="step-timeline-fill" id="timeline-fill" style="width:0%"></div></div>
      </div>

      <!-- INPUT PANEL -->
      <div class="card-panel" style="margin-top:var(--sp-6)" id="input-panel">
        <div class="input-section">
          <!-- Plaintext -->
          <div>
            <div class="input-panel-header">
              <h2 class="text-h2">Plaintext Message</h2>
              <span class="badge badge-waiting">Input</span>
            </div>
            <textarea id="plaintext-input" class="textarea-field" placeholder="Enter message to encrypt (e.g., HELLO WORLD)">HELLO WORLD</textarea>
            <p class="text-caption mt-2">Only A-Z and spaces allowed. Auto-uppercase.</p>
          </div>
          <!-- Key Matrix -->
          <div>
            <div class="input-panel-header">
              <h2 class="text-h2">Key Matrix [3×3]</h2>
              <span class="badge" id="key-validity-badge"><span class="badge-dot" style="width:6px;height:6px;border-radius:50%;background:var(--cyan)"></span> Invertible</span>
            </div>
            <div class="matrix-input-wrap">
              <div class="matrix-grid" id="key-matrix-grid"></div>
            </div>
            <div class="flex items-center gap-4 mt-4">
              <button class="btn btn-ghost btn-sm" id="btn-default-key" style="color:var(--primary-container)">Use Default</button>
              <span id="key-status" class="text-caption"></span>
            </div>
          </div>
        </div>
        <!-- Start button -->
        <div class="text-center mt-8">
          <button class="btn btn-coral btn-lg" id="btn-start">
            Start Encryption
            <span class="material-symbols-outlined" style="font-size:18px">arrow_forward</span>
          </button>
        </div>
      </div>

      <!-- VISUALIZATION PANEL -->
      <div class="viz-panel" style="margin-top:var(--sp-8);display:none" id="viz-panel">
        <div class="viz-panel-dot-bg"></div>
        <div class="viz-header">
          <h3 class="text-h2" id="viz-title">Step 1: Message Conversion</h3>
          <div class="flex gap-2">
            <button class="btn btn-ghost btn-sm" id="btn-skip">Skip</button>
          </div>
        </div>
        <div class="viz-content" id="viz-content"></div>
        <div class="viz-footer">
          <button class="btn btn-secondary" id="btn-prev" disabled style="display:inline-flex; align-items:center; gap:6px;">
            <span class="material-symbols-outlined" style="font-size:18px">arrow_back</span>
            Previous Step
          </button>
          <span class="text-body" id="step-counter" style="color:var(--text-secondary)">Step 1 of 6</span>
          <div class="flex gap-2 items-center">
            <button class="btn btn-primary" id="btn-next" style="display:inline-flex; align-items:center; gap:6px;">
              Next Step
              <span class="material-symbols-outlined" style="font-size:18px">arrow_forward</span>
            </button>
            <button class="btn btn-export-pdf" id="btn-export-pdf" title="Export all steps as PDF" style="display:inline-flex; align-items:center; gap:6px;">
              <span class="material-symbols-outlined" style="font-size:18px">picture_as_pdf</span>
              Export PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  LC.EndToEnd._initMatrixInputs();
  LC.EndToEnd._initTimeline();
  LC.EndToEnd._bindEvents();
};

// ----- Matrix Input Grid -----
LC.EndToEnd._initMatrixInputs = function() {
  const grid = document.getElementById('key-matrix-grid');
  const defaultK = LC.EndToEnd.DEFAULT_KEY;
  grid.innerHTML = '';
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'matrix-cell animate-fade-in-up stagger-' + Math.min((i*3+j)+1, 10);
      input.value = defaultK[i][j];
      input.setAttribute('data-row', i);
      input.setAttribute('data-col', j);
      input.addEventListener('input', LC.EndToEnd._validateKey);
      grid.appendChild(input);
    }
  }
  // Decorative brackets
  ['bracket-tl','bracket-bl','bracket-tr','bracket-br'].forEach(c => {
    const d = document.createElement('div');
    d.className = c;
    grid.appendChild(d);
  });
  LC.EndToEnd._validateKey();
};

LC.EndToEnd._getKeyMatrix = function() {
  const cells = document.querySelectorAll('#key-matrix-grid .matrix-cell');
  const K = [[0,0,0],[0,0,0],[0,0,0]];
  cells.forEach(c => {
    const r = parseInt(c.getAttribute('data-row'));
    const col = parseInt(c.getAttribute('data-col'));
    K[r][col] = parseInt(c.value) || 0;
  });
  return K;
};

LC.EndToEnd._validateKey = function() {
  const K = LC.EndToEnd._getKeyMatrix();
  const valid = LC.GaussJordan.isKeyValid(K, 27);
  const badge = document.getElementById('key-validity-badge');
  if (valid) {
    badge.className = 'badge badge-valid';
    badge.innerHTML = '<span style="width:6px;height:6px;border-radius:50%;background:var(--cyan)"></span> Invertible';
  } else {
    badge.className = 'badge badge-invalid';
    badge.innerHTML = '<span style="width:6px;height:6px;border-radius:50%;background:var(--coral)"></span> Not Invertible';
  }
  const startBtn = document.getElementById('btn-start');
  if (startBtn) startBtn.disabled = !valid;
};

// ----- Step Timeline -----
LC.EndToEnd.STEP_NAMES = ['Conversion', 'Vectorization', 'Encryption', 'Inverse Matrix', "Cramer's Rule", 'Decryption'];
LC.EndToEnd.STEP_ICONS = ['format_size', 'view_column', 'enhanced_encryption', 'settings_backup_restore', 'functions', 'lock_open'];

LC.EndToEnd._initTimeline = function() {
  const timeline = document.getElementById('step-timeline');
  // Keep the track
  LC.EndToEnd.STEP_NAMES.forEach((name, i) => {
    const node = document.createElement('div');
    node.className = 'step-node';
    node.setAttribute('data-step', i);
    const circle = document.createElement('div');
    circle.className = 'step-circle ' + (i === 0 ? 'active' : 'upcoming');
    circle.innerHTML = '<span class="material-symbols-outlined" style="font-size:16px">' + LC.EndToEnd.STEP_ICONS[i] + '</span>';
    const label = document.createElement('span');
    label.className = 'step-label ' + (i === 0 ? 'active' : 'upcoming');
    label.textContent = name;
    node.appendChild(circle);
    node.appendChild(label);
    node.onclick = function() { if (LC.App.state.computed) LC.EndToEnd._goToStep(i); };
    timeline.appendChild(node);
  });
};

LC.EndToEnd._updateTimeline = function(currentStep) {
  const nodes = document.querySelectorAll('.step-node');
  nodes.forEach((node, i) => {
    const circle = node.querySelector('.step-circle');
    const label = node.querySelector('.step-label');
    circle.className = 'step-circle';
    label.className = 'step-label';
    if (i < currentStep) { circle.classList.add('completed'); label.classList.add('completed'); circle.innerHTML = '<span class="material-symbols-outlined" style="font-size:16px">check</span>'; }
    else if (i === currentStep) { circle.classList.add('active'); label.classList.add('active'); circle.innerHTML = '<span class="material-symbols-outlined" style="font-size:16px">' + LC.EndToEnd.STEP_ICONS[i] + '</span>'; }
    else { circle.classList.add('upcoming'); label.classList.add('upcoming'); circle.innerHTML = '<span class="material-symbols-outlined" style="font-size:16px">' + LC.EndToEnd.STEP_ICONS[i] + '</span>'; }
  });
  const fill = document.getElementById('timeline-fill');
  if (fill) fill.style.width = (currentStep / 5 * 100) + '%';
  document.getElementById('step-counter').textContent = `Step ${currentStep + 1} of 6`;
};

// ----- Event Bindings -----
LC.EndToEnd._bindEvents = function() {
  document.getElementById('btn-default-key').onclick = function() {
    const cells = document.querySelectorAll('#key-matrix-grid .matrix-cell');
    const dk = LC.EndToEnd.DEFAULT_KEY;
    cells.forEach(c => {
      const r = parseInt(c.getAttribute('data-row'));
      const col = parseInt(c.getAttribute('data-col'));
      c.value = dk[r][col];
    });
    LC.EndToEnd._validateKey();
  };

  document.getElementById('btn-start').onclick = function() {
    LC.EndToEnd._computeAll();
  };

  document.getElementById('btn-next').onclick = function() {
    if (LC.App.state.currentStep < 5) LC.EndToEnd._goToStep(LC.App.state.currentStep + 1);
  };

  document.getElementById('btn-prev').onclick = function() {
    if (LC.App.state.currentStep > 0) LC.EndToEnd._goToStep(LC.App.state.currentStep - 1);
  };

  document.getElementById('btn-skip').onclick = function() {
    LC.EndToEnd._goToStep(5);
  };

  document.getElementById('btn-export-pdf').onclick = function() {
    LC.PdfExport.generate();
  };
};

// ----- Compute Everything -----
LC.EndToEnd._computeAll = function() {
  const text = document.getElementById('plaintext-input').value;
  const validation = LC.Alphabet.validateInput(text);
  if (!validation.valid) { LC.App.showAlert(validation.warnings.join('\n')); return; }

  const K = LC.EndToEnd._getKeyMatrix();
  const state = LC.App.state;

  // Step 1: Encode
  state.plaintext = validation.cleaned;
  state.numericalValues = LC.Alphabet.encodeMessage(state.plaintext);

  // Step 2: Vectorize
  const { vectors, paddingCount } = LC.Vectorizer.partition(state.numericalValues, 3);
  state.vectors = vectors;
  state.paddingMask = LC.Vectorizer.getPaddingMask(state.numericalValues, 3);
  state.paddingCount = paddingCount;

  // Step 3: Encrypt
  state.keyMatrix = K;
  const encResult = LC.Encryption.encryptWithSteps(K, vectors, 3, 27);
  state.cipherVectors = encResult.cipherVectors;
  state.encryptionData = encResult;

  // Ciphertext string
  const allCipherNums = state.cipherVectors.flat();
  state.ciphertext = LC.Alphabet.decodeMessage(allCipherNums);

  // Step 4: Invert key
  const invResult = LC.GaussJordan.invertMatrix(K, 27);
  state.inverseData = invResult;
  state.inverseKeyMatrix = invResult.inverse;

  // Step 5: Cramer's Rule (block 1)
  if (state.cipherVectors.length > 0) {
    state.cramerData = LC.Cramer.decryptBlock(K, state.cipherVectors[0], 27);
  }

  // Step 6: Matrix inverse decryption (all blocks)
  if (invResult.success) {
    state.matInvData = LC.MatInv.decryptWithSteps(invResult.inverse, state.cipherVectors, 27);
    const allPlainNums = state.matInvData.decryptedVectors.flat();
    state.recoveredPlaintext = LC.Alphabet.decodeMessage(allPlainNums).trim();
  }

  state.computed = true;
  state.currentStep = 0;

  // Show viz panel
  document.getElementById('viz-panel').style.display = '';

  // If navigated from module selector, jump to the pending step
  const startStep = (state.pendingStep != null && state.pendingStep >= 0 && state.pendingStep <= 5) ? state.pendingStep : 0;
  state.pendingStep = null;
  LC.EndToEnd._goToStep(startStep);
};

// ----- Step Navigation -----
LC.EndToEnd._goToStep = function(step) {
  LC.App.state.currentStep = step;
  LC.EndToEnd._updateTimeline(step);

  const vizContent = document.getElementById('viz-content');
  const vizTitle = document.getElementById('viz-title');
  const prevBtn = document.getElementById('btn-prev');
  const nextBtn = document.getElementById('btn-next');

  prevBtn.disabled = step === 0;
  nextBtn.disabled = step === 5;

  const exportBtn = document.getElementById('btn-export-pdf');
  if (exportBtn) {
    exportBtn.style.display = step === 5 ? 'inline-flex' : 'none';
  }

  const titles = [
    'Step 1: Message Conversion',
    'Step 2: Vector Partitioning',
    'Step 3: Encryption',
    'Step 4: Inverse Key Matrix (Gauss-Jordan)',
    "Step 5: Decryption (Cramer's Rule)",
    'Step 6: Decryption (Matrix Inverse) & Recovery'
  ];
  vizTitle.textContent = titles[step];

  // Render step content
  switch(step) {
    case 0: LC.EndToEnd._renderStep1(vizContent); break;
    case 1: LC.EndToEnd._renderStep2(vizContent); break;
    case 2: LC.EndToEnd._renderStep3(vizContent); break;
    case 3: LC.EndToEnd._renderStep4(vizContent); break;
    case 4: LC.EndToEnd._renderStep5(vizContent); break;
    case 5: LC.EndToEnd._renderStep6(vizContent); break;
  }
};

// ========== STEP 1: Message Conversion ==========
LC.EndToEnd._renderStep1 = function(el) {
  const s = LC.App.state;
  let html = '<p class="text-body text-center mb-6">Each character is converted to its numerical value: A=1, B=2, …, Z=26, space=0.</p>';
  html += '<div class="flex items-center justify-center gap-2" style="flex-wrap:wrap">';
  const chars = Array.from(s.plaintext);
  chars.forEach((c, i) => {
    const num = s.numericalValues[i];
    const display = c === ' ' ? 'SPC' : c;
    const isSpace = c === ' ' || c === '.';
    html += `<div class="char-card animate-fade-in-up stagger-${Math.min(i+1, 10)} ${isSpace ? 'padding' : ''}">
      <span class="char-letter">${display}</span>
      <span class="material-symbols-outlined char-arrow">arrow_downward</span>
      <span class="char-number">${num}</span>
    </div>`;
  });
  html += '</div>';

  // Formula
  html += '<div class="formula-block animate-fade-in-up mt-8" id="formula-step1"></div>';
  el.innerHTML = html;

  const formulaEl = document.getElementById('formula-step1');
  if (formulaEl) LC.Katex.render('\\text{Encoding: } A=1,\\; B=2,\\; \\ldots,\\; Z=26,\\; \\_=0', formulaEl);
};

// ========== STEP 2: Vector Partitioning ==========
LC.EndToEnd._renderStep2 = function(el) {
  const s = LC.App.state;
  let html = '<p class="text-body text-center mb-6">The numerical values are divided into 3×1 column vectors. Padding zeros fill the last vector if needed.</p>';
  html += '<div class="vector-container">';
  s.vectors.forEach((v, vi) => {
    html += `<div class="animate-fade-in-up stagger-${Math.min(vi+1, 10)}" style="text-align:center">
      <div class="vector-bracket">`;
    v.forEach((val, j) => {
      const isPad = s.paddingMask[vi] && s.paddingMask[vi][j];
      html += `<span class="vec-val ${isPad ? 'padded' : ''}">${val}</span>`;
    });
    html += `</div><span class="vector-label">M<sub>${vi + 1}</sub></span></div>`;
  });
  html += '</div>';
  html += `<p class="text-body text-center mt-6" style="color:var(--text-secondary)">Total vectors: ${s.vectors.length}${s.paddingCount > 0 ? ` (with ${s.paddingCount} padding zero${s.paddingCount > 1 ? 's' : ''})` : ''}</p>`;
  el.innerHTML = html;
};

// ========== STEP 3: Encryption ==========
LC.EndToEnd._renderStep3 = function(el) {
  const s = LC.App.state;
  const enc = s.encryptionData;

  let html = '<p class="text-body text-center mb-4">Encryption uses matrix multiplication: C ≡ K · M (mod 27).</p>';
  html += '<div class="formula-block coral animate-fade-in-up mb-6" id="formula-step3"></div>';

  // Block tabs — show all blocks individually
  const totalBlocks = enc.detailedBlocks.length + enc.summaryBlocks.length;
  html += '<div class="pill-tabs" id="enc-tabs">';
  for (let i = 0; i < totalBlocks; i++) {
    html += `<button class="pill-tab ${i === 0 ? 'active' : ''}" data-block="${i}">Block ${i + 1}</button>`;
  }
  html += '</div>';
  html += '<div id="enc-block-content"></div>';

  // Ciphertext
  html += `<div class="result-box mt-8" style="background:rgba(0,180,216,0.05);border-color:rgba(0,180,216,0.15)">
    <p class="text-h3" style="color:var(--cyan);margin-bottom:var(--sp-2)">Ciphertext</p>
    <p class="text-math" style="font-size:20px;color:var(--cyan)">${s.ciphertext}</p>
  </div>`;

  el.innerHTML = html;

  const formulaEl = document.getElementById('formula-step3');
  if (formulaEl) LC.Katex.render('C \\equiv K \\cdot M \\pmod{27}', formulaEl);

  // Tab logic
  LC.EndToEnd._renderEncBlock(0);
  document.querySelectorAll('#enc-tabs .pill-tab').forEach(tab => {
    tab.onclick = function() {
      document.querySelectorAll('#enc-tabs .pill-tab').forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      LC.EndToEnd._renderEncBlock(parseInt(this.getAttribute('data-block')));
    };
  });
};

LC.EndToEnd._renderEncBlock = function(blockIdx) {
  const s = LC.App.state;
  const enc = s.encryptionData;
  const contentEl = document.getElementById('enc-block-content');
  if (!contentEl) return;

  // Get block data — use detailed if available, otherwise compute steps on the fly
  let block;
  if (blockIdx < enc.detailedBlocks.length) {
    block = enc.detailedBlocks[blockIdx];
  } else {
    // Compute steps for summary blocks
    const sIdx = blockIdx - enc.detailedBlocks.length;
    const sb = enc.summaryBlocks[sIdx];
    block = {
      blockIndex: sb.blockIndex,
      plainVector: sb.plainVector,
      cipherVector: sb.cipherVector,
      steps: LC.Encryption.generateBlockSteps(s.keyMatrix, sb.plainVector, 27)
    };
  }

  const plainLetters = block.plainVector.map(n => LC.Alphabet.numToChar(n));
  const cipherLetters = block.cipherVector.map(n => LC.Alphabet.numToChar(n));
  const blockNum = blockIdx + 1;

  let html = '<div class="enc-block-solution animate-fade-in-up stagger-1" style="background:var(--surface-dim);border:1px solid rgba(255,255,255,0.06);border-radius:var(--radius-lg);padding:var(--sp-6);margin-bottom:var(--sp-4)">';

  // ── Block Header: Block N  M_n = [vals]^T (letters)
  const plainLetterStr = plainLetters.map(c => c === ' ' ? 'SPC' : c).join(', ');
  html += `<div style="margin-bottom:var(--sp-5)">
    <span class="text-h3" style="color:var(--text-primary)">Block ${blockNum}</span>
    <span class="text-math" style="font-size:16px;color:var(--text-secondary);margin-left:var(--sp-4)">M<sub>${blockNum}</sub> = [${block.plainVector.join(', ')}]<sup>T</sup></span>
    <span class="text-math" style="font-size:15px;color:var(--cyan);margin-left:var(--sp-2)">(${plainLetterStr})</span>
  </div>`;

  // ── Matrix Equation: C_n = K · M = [expanded] = [raw results] — all inline
  html += '<div style="overflow-x:auto;padding:var(--sp-4) 0">';
  html += '<div class="matrix-equation mb-4" style="flex-wrap:nowrap">';

  // C_n =
  html += `<span class="text-math" style="font-size:17px;color:var(--text-secondary);white-space:nowrap">C<sub>${blockNum}</sub> =</span>`;

  // Key matrix
  html += LC.EndToEnd._renderMatrixHTML(s.keyMatrix, 3, 3);

  // · (dot operator)
  html += '<span class="operator">·</span>';

  // Plaintext vector
  html += LC.EndToEnd._renderVectorHTML(block.plainVector);

  // = (equals)
  html += '<span class="operator">=</span>';

  // Expanded dot products column (plain flex, NOT .matrix-display which forces 48px)
  html += '<div style="display:flex;flex-direction:column;justify-content:center;gap:2px;padding:var(--sp-2) var(--sp-3);border-left:2px solid var(--outline-variant);border-right:2px solid var(--outline-variant)">';
  block.steps.forEach(step => {
    const expr = step.products.map(p => `${p.kVal}(${p.mVal})`).join(' + ');
    html += `<div style="height:36px;display:flex;align-items:center;justify-content:center;font-family:var(--font-mono);font-size:14px;white-space:nowrap;color:var(--text-secondary)">${expr}</div>`;
  });
  html += '</div>';

  // = raw sums column (also plain flex to avoid 48px constraint)
  html += '<span class="operator">=</span>';
  html += '<div style="display:flex;flex-direction:column;justify-content:center;gap:2px;padding:var(--sp-2) var(--sp-3);border-left:2px solid var(--outline-variant);border-right:2px solid var(--outline-variant)">';
  block.steps.forEach(step => {
    html += `<div style="height:36px;display:flex;align-items:center;justify-content:center;font-family:var(--font-mono);font-size:18px;color:var(--text-primary);min-width:36px">${step.sum}</div>`;
  });
  html += '</div>';

  html += '</div>'; // .matrix-equation

  // ── Mod 27 Reduction
  const needsReduction = block.steps.some(step => step.sum >= 27 || step.sum < 0);
  if (needsReduction) {
    html += '<div style="text-align:center;margin:var(--sp-4) 0">';
    const reductions = block.steps
      .filter(step => step.sum >= 27 || step.sum < 0)
      .map(step => {
        const q = Math.floor(step.sum / 27);
        return `${step.sum} − ${q}(27) = ${step.modResult}`;
      });
    html += `<p class="text-math" style="font-size:15px;color:var(--text-secondary)">${reductions.join(',&nbsp;&nbsp;&nbsp;&nbsp;')}</p>`;
    html += '</div>';
  }

  // ── Final Cipher Vector with Letter Mapping
  const cipherLetterStr = cipherLetters.map(c => c === ' ' ? 'SPC' : c).join(', ');
  html += '<div style="display:flex;align-items:center;justify-content:center;gap:var(--sp-4);margin-top:var(--sp-5);flex-wrap:wrap">';
  html += `<span class="text-math" style="font-size:17px;color:var(--text-secondary)">C<sub>${blockNum}</sub> =</span>`;
  html += LC.EndToEnd._renderVectorHTML(block.cipherVector, true);
  html += `<span class="text-math" style="font-size:20px;color:var(--yellow);font-weight:700;letter-spacing:0.05em">→&nbsp;&nbsp;${cipherLetterStr}</span>`;
  html += '</div>';

  html += '</div>'; // end overflow wrapper
  html += '</div>'; // .enc-block-solution

  contentEl.innerHTML = html;
};

// ========== STEP 4: Gauss-Jordan ==========
LC.EndToEnd._renderStep4 = function(el) {
  const s = LC.App.state;
  const inv = s.inverseData;

  let html = '<p class="text-body text-center mb-4">Finding K⁻¹ using Gauss-Jordan Elimination. Every row operation is shown.</p>';

  // Determinant panel
  html += `<div class="det-panel animate-fade-in-up stagger-1 mb-6">
    <p class="text-math" style="font-size:15px">det(K) = ${inv.determinant}</p>
    <p class="text-math" style="font-size:15px">det(K) mod 27 = <span class="det-value">${inv.detMod}</span></p>`;
  if (inv.detInverse !== null) {
    html += `<p class="text-math" style="font-size:15px">det(K)⁻¹ mod 27 = <span class="det-value">${inv.detInverse}</span> (because ${inv.detMod} × ${inv.detInverse} ≡ 1 mod 27)</p>`;
  }
  html += '</div>';

  if (!inv.success) {
    html += `<div class="formula-block coral"><p class="text-body" style="color:var(--coral)">${inv.error}</p></div>`;
    el.innerHTML = html;
    return;
  }

  // All steps displayed sequentially
  let stepCounter = 0;
  inv.steps.forEach((step, idx) => {
    html += '<div class="enc-block-solution animate-fade-in-up stagger-1" style="background:var(--surface-dim);border:1px solid rgba(255,255,255,0.06);border-radius:var(--radius-lg);padding:var(--sp-5);margin-bottom:var(--sp-4)">';

    if (step.type === 'initial') {
      html += '<p class="text-h3" style="color:var(--text-primary);margin-bottom:var(--sp-3)">Initial augmented matrix:</p>';
    } else {
      stepCounter++;
      // Step header with explanation
      html += `<p class="text-h3" style="color:var(--text-primary);margin-bottom:var(--sp-2)">Step ${stepCounter} — <span style="font-weight:400;font-size:15px;color:var(--cyan)">${step.operation}</span></p>`;

      if (step.detail && step.detail.explanation) {
        html += `<p class="text-math" style="font-size:14px;color:var(--text-secondary);margin-bottom:var(--sp-3);font-style:italic">(${step.detail.explanation})</p>`;
      }

      // Detailed computation
      if (step.detail) {
        html += LC.EndToEnd._renderGJComputation(step, inv);
      }
    }

    // Augmented matrix
    html += LC.EndToEnd._renderAugmentedMatrix(step.matrix);
    html += '</div>';
  });

  // Final result K⁻¹
  html += '<div class="enc-block-solution animate-fade-in-up stagger-1" style="background:var(--surface-dim);border:1px solid rgba(255,255,255,0.06);border-radius:var(--radius-lg);padding:var(--sp-5);margin-bottom:var(--sp-4)">';
  html += '<p class="text-h3" style="color:var(--yellow);margin-bottom:var(--sp-4);text-align:center">Result</p>';
  html += '<div class="matrix-equation" style="justify-content:center">';
  html += '<span class="text-math" style="font-size:17px;color:var(--text-secondary)">K⁻¹ ≡</span>';
  html += LC.EndToEnd._renderMatrixHTML(inv.inverse, 3, 3, true);
  html += '<span class="text-math" style="font-size:15px;color:var(--text-secondary)">(mod 27)</span>';
  html += '</div>';
  html += '</div>';

  // Verification: K · K⁻¹ ≡ I₃ (mod 27)
  html += LC.EndToEnd._renderGJVerification(s.keyMatrix, inv.inverse);

  el.innerHTML = html;
};

// Render detailed computation for a GJ step
LC.EndToEnd._renderGJComputation = function(step) {
  let html = '<div style="overflow-x:auto;margin-bottom:var(--sp-3)">';
  const m = 27;

  if (step.type === 'scale') {
    const d = step.detail;
    const prevStr = LC.EndToEnd._formatRowVector(d.prevRow);
    const rawStr = LC.EndToEnd._formatRowVector(d.rawRow);
    const modStr = LC.EndToEnd._formatRowVector(step.matrix[d.targetRow]);

    html += `<p class="text-math" style="font-size:14px;color:var(--text-secondary);margin-bottom:var(--sp-1)">
      ${d.factor} · ${prevStr} = ${rawStr} ≡ ${modStr}
    </p>`;
  } else if (step.type === 'eliminate') {
    const d = step.detail;
    // Show: R_target - factor·R_source element by element
    const parts = [];
    for (let j = 0; j < d.prevTargetRow.length; j++) {
      parts.push(`${d.prevTargetRow[j]} − ${d.factor}(${d.prevSourceRow[j]})`);
    }

    // Show as: element-wise subtraction = raw = mod result
    const rawStr = LC.EndToEnd._formatRowVector(d.rawValues);
    const modStr = LC.EndToEnd._formatRowVector(step.matrix[d.targetRow]);

    // Show the element-wise computation on first line
    html += `<p class="text-math" style="font-size:14px;color:var(--text-secondary);margin-bottom:var(--sp-1)">
      R${d.targetRow + 1}: ${d.prevTargetRow.map((v, j) => `${v} − ${d.factor}(${d.prevSourceRow[j]})`).join('; ')}
    </p>`;
    html += `<p class="text-math" style="font-size:14px;color:var(--text-secondary);margin-bottom:var(--sp-1)">
      = ${rawStr} ≡ ${modStr}
    </p>`;
  }

  html += '</div>';
  return html;
};

// Format a row vector as [a, b, c | d, e, f]
LC.EndToEnd._formatRowVector = function(row) {
  const left = row.slice(0, 3).join(', ');
  const right = row.slice(3).join(', ');
  return `[${left} | ${right}]`;
};

// Render an augmented matrix (3×6 with divider)
LC.EndToEnd._renderAugmentedMatrix = function(matrix) {
  let html = '<div style="overflow-x:auto;display:flex;justify-content:center;margin-top:var(--sp-3)">';
  html += '<div style="display:grid;grid-template-columns:repeat(3,52px) 16px repeat(3,52px);gap:2px;align-items:center">';
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 6; j++) {
      if (j === 3) {
        html += '<div style="display:flex;align-items:center;justify-content:center;color:var(--outline-variant);font-size:20px">│</div>';
      }
      const bg = j < 3 ? 'rgba(15,52,96,0.08)' : 'rgba(0,180,216,0.06)';
      html += `<div style="width:52px;height:38px;display:flex;align-items:center;justify-content:center;font-family:var(--font-mono);font-size:15px;color:var(--text-primary);background:${bg};border-radius:2px">${matrix[i][j]}</div>`;
    }
  }
  html += '</div></div>';
  return html;
};

// Render verification: K · K⁻¹ ≡ I₃ (mod 27)
LC.EndToEnd._renderGJVerification = function(K, Kinv) {
  const m = 27;
  // Compute K · K⁻¹
  const product = [];
  for (let i = 0; i < 3; i++) {
    product[i] = [];
    for (let j = 0; j < 3; j++) {
      let sum = 0;
      for (let k = 0; k < 3; k++) sum += K[i][k] * Kinv[k][j];
      product[i][j] = sum;
    }
  }
  const productMod = product.map(row => row.map(v => LC.Math.mod(v, m)));

  let html = '<div class="enc-block-solution animate-fade-in-up stagger-1" style="background:var(--surface-dim);border:1px solid rgba(255,255,255,0.06);border-radius:var(--radius-lg);padding:var(--sp-5);margin-bottom:var(--sp-4)">';
  html += '<p class="text-h3" style="color:var(--yellow);margin-bottom:var(--sp-4);text-align:center">Verification: K · K⁻¹ ≡ I₃ (mod 27)</p>';

  // K · K⁻¹ = [product] ≡ I₃ (mod 27)
  html += '<div class="matrix-equation" style="justify-content:center;flex-wrap:nowrap">';
  html += '<span class="text-math" style="font-size:15px;color:var(--text-secondary)">K · K⁻¹ =</span>';
  html += LC.EndToEnd._renderMatrixHTML(K, 3, 3);
  html += '<span class="operator">·</span>';
  html += LC.EndToEnd._renderMatrixHTML(Kinv, 3, 3);
  html += '<span class="operator">=</span>';
  html += LC.EndToEnd._renderMatrixHTML(product, 3, 3);
  html += '<span class="operator">≡</span>';
  html += LC.EndToEnd._renderMatrixHTML(productMod, 3, 3, true);
  html += '<span class="text-math" style="font-size:14px;color:var(--text-secondary)">(mod 27) ✓</span>';
  html += '</div>';

  // Show individual reductions
  const reductions = [];
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (product[i][j] !== productMod[i][j]) {
        reductions.push(`${product[i][j]} ≡ ${productMod[i][j]}`);
      }
    }
  }
  if (reductions.length > 0) {
    html += `<p class="text-math" style="font-size:13px;color:var(--text-secondary);text-align:center;margin-top:var(--sp-3)">since ${reductions.join(', ')} (mod 27)</p>`;
  }

  html += '</div>';
  return html;
};

// ========== STEP 5: Cramer's Rule ==========
LC.EndToEnd._renderStep5 = function(el) {
  const s = LC.App.state;
  const cr = s.cramerData;

  let html = '<p class="text-body text-center mb-4">For the first cipher block, we use Cramer\'s Rule to decrypt.</p>';

  if (!cr.success) {
    html += `<div class="formula-block coral"><p class="text-body" style="color:var(--coral)">${cr.error}</p></div>`;
    el.innerHTML = html;
    return;
  }

  // Header: Decryption formula
  const detStep = cr.steps.find(s => s.type === 'determinant');
  const cipherVec = s.cipherVectors[0];
  html += '<div class="enc-block-solution animate-fade-in-up stagger-1" style="background:var(--surface-dim);border:1px solid rgba(255,255,255,0.06);border-radius:var(--radius-lg);padding:var(--sp-5);margin-bottom:var(--sp-4)">';
  html += `<p class="text-h3" style="color:var(--text-primary);margin-bottom:var(--sp-3)">Block 1 — Cramer's Rule (mod 27)</p>`;
  html += `<p class="text-math" style="font-size:14px;color:var(--text-secondary);margin-bottom:var(--sp-2)">We solve the system Km = C₁ where C₁ = [${cipherVec.join(', ')}]<sup>T</sup> using Cramer's Rule modulo 27:</p>`;
  html += `<p class="text-math" style="font-size:14px;color:var(--text-secondary);margin-bottom:var(--sp-2)">m<sub>j</sub> ≡ det(K)⁻¹ · det(K<sub>j</sub>) (mod 27), &nbsp;&nbsp; det(K) = ${detStep.detKRaw} mod 27 = ${detStep.detK}, &nbsp;&nbsp; ${detStep.detK}⁻¹ ≡ ${detStep.detKInv} (mod 27)</p>`;
  html += `<p class="text-math" style="font-size:13px;color:var(--text-secondary);font-style:italic">where K<sub>j</sub> is K with column j replaced by C₁.</p>`;
  html += '</div>';

  // Each variable m₁, m₂, m₃ shown sequentially
  const varSteps = cr.steps.filter(s => s.type === 'variable');
  varSteps.forEach((step) => {
    html += '<div class="enc-block-solution animate-fade-in-up stagger-1" style="background:var(--surface-dim);border:1px solid rgba(255,255,255,0.06);border-radius:var(--radius-lg);padding:var(--sp-5);margin-bottom:var(--sp-4)">';

    // Header
    html += `<p class="text-h3" style="color:var(--cyan);margin-bottom:var(--sp-3)">Finding m<sub>${step.varIndex + 1}</sub> — replace column ${step.varIndex + 1} with C₁:</p>`;

    // Modified matrix
    html += '<div class="flex justify-center mb-4">';
    html += `<div class="matrix-equation">`;
    html += `<span class="text-math" style="font-size:16px;color:var(--text-secondary)">K<sub>${step.varIndex + 1}</sub> =</span>`;
    html += LC.EndToEnd._renderMatrixHTML(step.modifiedMatrix, 3, 3, false, step.replacedColumn);
    html += '</div></div>';

    // Determinant expansion
    const exp = step.expansion;
    html += '<p class="text-math" style="font-size:14px;color:var(--text-secondary);margin-bottom:var(--sp-1)">Expanding along Row 1:</p>';
    html += `<div style="padding-left:var(--sp-4);margin-bottom:var(--sp-3)">`;
    html += `<p class="text-math" style="font-size:14px;color:var(--text-secondary)">det(K<sub>${step.varIndex + 1}</sub>) = ${exp.line1}</p>`;
    html += `<p class="text-math" style="font-size:14px;color:var(--text-secondary)">&nbsp;&nbsp;= ${exp.line2}</p>`;
    html += `<p class="text-math" style="font-size:14px;color:var(--text-secondary)">&nbsp;&nbsp;= ${exp.line3}</p>`;
    html += `<p class="text-math" style="font-size:14px;color:var(--text-secondary)">&nbsp;&nbsp;= ${exp.rawDet}`;
    if (exp.rawDet !== step.detKi) {
      const q = Math.floor(exp.rawDet / 27);
      if (exp.rawDet < 0) {
        const qAbs = Math.ceil(-exp.rawDet / 27);
        html += ` = ${exp.rawDet} + ${qAbs}(27) = ${step.detKi}`;
      } else {
        html += ` = ${exp.rawDet} − ${q}(27) = ${step.detKi}`;
      }
    }
    html += ' (mod 27)</p>';
    html += '</div>';

    // Final computation: m_j = detKInv × detKi mod 27
    const miRaw = step.detKInv * step.detKi;
    const mi = step.result;
    const letter = LC.Alphabet.numToChar(mi);
    const display = letter === ' ' ? 'SPC' : letter;

    html += `<p class="text-math" style="font-size:15px;color:var(--text-secondary)">m<sub>${step.varIndex + 1}</sub> ≡ ${step.detKInv} × ${step.detKi} = ${miRaw}`;
    if (miRaw !== mi) {
      const q = Math.floor(miRaw / 27);
      html += ` = ${miRaw} − ${q}(27) = ${mi}`;
    }
    html += ` (mod 27)`;
    html += `&nbsp;&nbsp; <span style="font-size:18px;color:var(--yellow);font-weight:700">→ ${display}</span></p>`;

    html += '</div>';
  });

  // Cramer's Rule Result
  html += '<div class="enc-block-solution animate-fade-in-up stagger-1" style="background:var(--surface-dim);border:1px solid rgba(255,255,255,0.06);border-radius:var(--radius-lg);padding:var(--sp-5);margin-bottom:var(--sp-4);text-align:center">';
  html += '<p class="text-h3" style="color:var(--yellow);margin-bottom:var(--sp-3)">Cramer\'s Rule Result</p>';
  const resultLetters = cr.plaintext.map(v => { const c = LC.Alphabet.numToChar(v); return c === ' ' ? 'SPC' : c; });
  html += `<div class="matrix-equation" style="justify-content:center">`;
  html += `<span class="text-math" style="font-size:16px;color:var(--text-secondary)">M₁ = [${cr.plaintext.join(', ')}]<sup>T</sup></span>`;
  html += `<span class="text-math" style="font-size:20px;color:var(--yellow);font-weight:700;margin-left:var(--sp-4)">→ ${resultLetters.join(', ')}</span>`;
  html += `<span class="text-math" style="font-size:18px;color:var(--cyan);margin-left:var(--sp-3)">✓</span>`;
  html += '</div>';
  html += '</div>';

  el.innerHTML = html;
};

// ========== STEP 6: Matrix Inverse Decryption ==========
LC.EndToEnd._renderStep6 = function(el) {
  const s = LC.App.state;
  const matInv = s.matInvData;

  let html = '<p class="text-body text-center mb-4">Using K⁻¹ to decrypt all blocks: M ≡ K⁻¹ · C (mod 27). <span style="color:var(--text-secondary)">(Block 1 was also solved via Cramer\'s Rule in Step 5.)</span></p>';

  if (!matInv) {
    html += '<p class="text-body text-center" style="color:var(--coral)">Could not compute — key matrix inversion failed.</p>';
    el.innerHTML = html;
    return;
  }

  // Block tabs
  const blocks = matInv.blocks;
  if (blocks.length > 0) {
    html += '<div class="pill-tabs" id="matinv-tabs">';
    blocks.forEach((b, i) => {
      html += `<button class="pill-tab ${i === 0 ? 'active' : ''}" data-block="${i}">Block ${i + 1}</button>`;
    });
    html += '</div>';
    html += '<div id="matinv-block-content"></div>';
  }

  // Recovery summary
  html += `<div class="result-box animate-fade-in-up stagger-2 mt-8">
    <p class="text-h2" style="color:var(--cyan);margin-bottom:var(--sp-4)">Full Recovered Plaintext</p>
    <div class="flex items-center justify-center gap-2 mb-4" style="flex-wrap:wrap">`;

  const allDecrypted = matInv.decryptedVectors.flat();
  const totalOriginalLen = s.plaintext.length;
  allDecrypted.forEach((v, i) => {
    const isPadding = i >= totalOriginalLen;
    const ch = LC.Alphabet.numToChar(v);
    const display = ch === ' ' ? 'SPC' : ch;
    html += `<div class="char-card animate-fade-in-up stagger-${Math.min(i+1, 10)} ${isPadding ? 'padding' : ''}">
      <span class="char-number" style="color:${isPadding ? 'var(--text-muted)' : 'var(--yellow)'}">${v}</span>
      <span class="material-symbols-outlined char-arrow">arrow_downward</span>
      <span class="char-letter">${display}</span>
      ${isPadding ? '<span class="text-caption">pad</span>' : ''}
    </div>`;
  });

  html += '</div>';
  html += `<p class="result-text">${s.recoveredPlaintext || ''}</p>`;
  html += `<p class="mt-4" style="color:var(--cyan)"><span class="material-symbols-outlined" style="vertical-align:middle;font-size:20px">check_circle</span> The plaintext has been successfully recovered!</p>`;
  html += '</div>';

  el.innerHTML = html;

  const formulaEl = document.getElementById('formula-step6');
  if (formulaEl) LC.Katex.render('M \\equiv K^{-1} \\cdot C \\pmod{27}', formulaEl);

  // Tab logic for all blocks
  if (blocks.length > 0) {
    LC.EndToEnd._renderMatInvBlock(0);
    document.querySelectorAll('#matinv-tabs .pill-tab').forEach(tab => {
      tab.onclick = function() {
        document.querySelectorAll('#matinv-tabs .pill-tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        LC.EndToEnd._renderMatInvBlock(parseInt(this.getAttribute('data-block')));
      };
    });
  }
};

LC.EndToEnd._renderMatInvBlock = function(blockIdx) {
  const s = LC.App.state;
  const block = s.matInvData.blocks[blockIdx];
  const contentEl = document.getElementById('matinv-block-content');
  if (!contentEl || !block) return;

  const blockNum = blockIdx + 1;
  const plainLetters = block.plainVector.map(n => LC.Alphabet.numToChar(n));
  const cipherLetters = block.cipherVector.map(n => { const c = LC.Alphabet.numToChar(n); return c === ' ' ? 'SPC' : c; });
  const plainLetterStr = plainLetters.map(c => c === ' ' ? 'SPC' : c).join(', ');

  let html = '<div class="enc-block-solution animate-fade-in-up stagger-1" style="background:var(--surface-dim);border:1px solid rgba(255,255,255,0.06);border-radius:var(--radius-lg);padding:var(--sp-6);margin-bottom:var(--sp-4)">';

  // Block Header
  html += `<div style="margin-bottom:var(--sp-5)">
    <span class="text-h3" style="color:var(--text-primary)">Block ${blockNum}</span>
    <span class="text-math" style="font-size:16px;color:var(--text-secondary);margin-left:var(--sp-4)">C<sub>${blockNum}</sub> = [${block.cipherVector.join(', ')}]<sup>T</sup></span>
    <span class="text-math" style="font-size:15px;color:var(--cyan);margin-left:var(--sp-2)">(${cipherLetters.join(', ')})</span>
  </div>`;

  // Compute dot product steps on-the-fly
  const Kinv = s.inverseKeyMatrix;
  const C = block.cipherVector;
  const steps = [];
  for (let i = 0; i < 3; i++) {
    const products = [];
    let sum = 0;
    for (let j = 0; j < 3; j++) {
      const kVal = Kinv[i][j];
      const cVal = C[j];
      const product = kVal * cVal;
      products.push({ kVal, cVal, product });
      sum += product;
    }
    const modResult = LC.Math.mod(sum, 27);
    steps.push({ row: i, products, sum, modResult });
  }

  // Inline matrix equation: M_n = K⁻¹ · C = [expansion] = [sums]
  html += '<div style="overflow-x:auto;padding:var(--sp-4) 0">';
  html += '<div class="matrix-equation mb-4" style="flex-wrap:nowrap">';

  html += `<span class="text-math" style="font-size:17px;color:var(--text-secondary);white-space:nowrap">M<sub>${blockNum}</sub> =</span>`;
  html += LC.EndToEnd._renderMatrixHTML(Kinv, 3, 3);
  html += '<span class="operator">·</span>';
  html += LC.EndToEnd._renderVectorHTML(block.cipherVector);
  html += '<span class="operator">=</span>';

  // Expanded dot products column
  html += '<div style="display:flex;flex-direction:column;justify-content:center;gap:2px;padding:var(--sp-2) var(--sp-3);border-left:2px solid var(--outline-variant);border-right:2px solid var(--outline-variant)">';
  steps.forEach(step => {
    const expr = step.products.map(p => `${p.kVal}(${p.cVal})`).join(' + ');
    html += `<div style="height:36px;display:flex;align-items:center;justify-content:center;font-family:var(--font-mono);font-size:14px;white-space:nowrap;color:var(--text-secondary)">${expr}</div>`;
  });
  html += '</div>';

  // Raw sums column
  html += '<span class="operator">=</span>';
  html += '<div style="display:flex;flex-direction:column;justify-content:center;gap:2px;padding:var(--sp-2) var(--sp-3);border-left:2px solid var(--outline-variant);border-right:2px solid var(--outline-variant)">';
  steps.forEach(step => {
    html += `<div style="height:36px;display:flex;align-items:center;justify-content:center;font-family:var(--font-mono);font-size:18px;color:var(--text-primary);min-width:36px">${step.sum}</div>`;
  });
  html += '</div>';

  html += '</div>'; // .matrix-equation

  // Mod 27 reduction
  const needsReduction = steps.some(step => step.sum >= 27 || step.sum < 0);
  if (needsReduction) {
    html += '<div style="text-align:center;margin:var(--sp-4) 0">';
    const reductions = steps
      .filter(step => step.sum >= 27 || step.sum < 0)
      .map(step => {
        const q = Math.floor(step.sum / 27);
        return `${step.sum} − ${q}(27) = ${step.modResult}`;
      });
    html += `<p class="text-math" style="font-size:15px;color:var(--text-secondary)">${reductions.join(',&nbsp;&nbsp;&nbsp;&nbsp;')}</p>`;
    html += '</div>';
  }

  // Final decrypted vector with letter mapping
  html += '<div style="display:flex;align-items:center;justify-content:center;gap:var(--sp-4);margin-top:var(--sp-5);flex-wrap:wrap">';
  html += `<span class="text-math" style="font-size:17px;color:var(--text-secondary)">M<sub>${blockNum}</sub> =</span>`;
  html += LC.EndToEnd._renderVectorHTML(block.plainVector, true);
  html += `<span class="text-math" style="font-size:20px;color:var(--yellow);font-weight:700;letter-spacing:0.05em">→&nbsp;&nbsp;${plainLetterStr}</span>`;
  html += '</div>';

  html += '</div>'; // end overflow wrapper
  html += '</div>'; // .enc-block-solution

  contentEl.innerHTML = html;
};

// ========== HELPER: Render matrix HTML ==========
LC.EndToEnd._renderMatrixHTML = function(M, rows, cols, highlight, highlightCol) {
  let html = '<div class="matrix-display cols-' + cols + '">';
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const isHighlight = highlight || (highlightCol !== undefined && j === highlightCol);
      html += `<div class="m-cell ${isHighlight ? 'result-cell' : ''}" ${highlightCol === j ? 'style="background:rgba(233,69,96,0.1);color:var(--coral)"' : ''}>${M[i][j]}</div>`;
    }
  }
  html += '</div>';
  return html;
};

LC.EndToEnd._renderVectorHTML = function(v, isResult) {
  let html = '<div class="matrix-display cols-1">';
  v.forEach(val => {
    html += `<div class="m-cell ${isResult ? 'result-cell' : ''}">${val}</div>`;
  });
  html += '</div>';
  return html;
};
