// ============================================================
// LinearCrypt - LaTeX Export
// Replaces the old jsPDF logic to generate a raw .tex file dynamically.
// ============================================================
window.LC = window.LC || {};
LC.PdfExport = {};

// Helper: Matrix to LaTeX
LC.PdfExport._matrixTex = function(M) {
  const rows = M.map(r => r.join(' & ')).join(' \\\\ ');
  return '\\begin{bmatrix} ' + rows + ' \\end{bmatrix}';
};

// Helper: Vector to LaTeX
LC.PdfExport._vectorTex = function(v) {
  return '\\begin{bmatrix} ' + v.join(' \\\\ ') + ' \\end{bmatrix}';
};

// Helper: Augmented matrix to LaTeX
LC.PdfExport._augTex = function(matrix) {
  const rows = matrix.map(r => {
    return r.slice(0, 3).join(' & ') + ' & ' + r.slice(3).join(' & ');
  }).join(' \\\\ ');
  return '\\left[\\begin{array}{ccc|ccc} ' + rows + ' \\end{array}\\right]';
};

LC.PdfExport.generateCode = function() {
  const s = LC.App.state;
  if (!s.computed) {
    LC.App.showAlert('Please run the encryption first.');
    return '';
  }

  let tex = `\\documentclass{article}
\\usepackage[utf8]{inputenc}
\\usepackage{amsmath, amssymb}
\\usepackage{geometry}
\\geometry{a4paper, margin=1in}
\\usepackage{hhline}

\\title{\\textbf{LinearCrypt}\\\\Hill Cipher Analysis Report}
\\author{}
\\date{\\today}

\\begin{document}
\\maketitle

`;

  // INPUT PARAMETERS
  tex += `\\section*{Input Parameters}\n`;
  tex += `\\textbf{Plaintext:} \\texttt{${s.plaintext}}\\\\[1ex]\n`;
  tex += `\\textbf{Key Matrix K (3$\\times$3):}\n`;
  tex += `\\[ K = ${LC.PdfExport._matrixTex(s.keyMatrix)} \\]\n`;
  
  if (s.ciphertext) {
    tex += `\\textbf{Ciphertext:} \\texttt{${s.ciphertext}}\n\n`;
  }

  // STEP 1
  tex += `\\section{Step 1: Message Conversion}\n`;
  tex += `Each character is mapped to its numerical equivalent: $A = 1, B = 2, \\ldots, Z = 26, \\text{Space} = 0$.\n\n`;
  
  const chars = Array.from(s.plaintext);
  tex += `\\begin{center}\n\\begin{tabular}{|c|c|}\n\\hline\n\\textbf{Character} & \\textbf{Value} \\\\ \\hline\n`;
  chars.forEach((c, i) => {
    const num = s.numericalValues[i];
    const display = c === ' ' ? '\\text{SPACE}' : c;
    tex += `${display} & ${num} \\\\ \\hline\n`;
  });
  tex += `\\end{tabular}\n\\end{center}\n\n`;
  tex += `\\textbf{Numerical Sequence:} $[${s.numericalValues.join(', ')}]$\n\n`;

  // STEP 2
  tex += `\\section{Step 2: Vector Partitioning}\n`;
  tex += `The numerical values are divided into 3$\\times$1 column vectors. `;
  if (s.paddingCount > 0) tex += `Padding zeros added: ${s.paddingCount}.`;
  tex += `\n\n`;
  
  const perLine = 4;
  for (let i = 0; i < s.vectors.length; i += perLine) {
    const group = s.vectors.slice(i, i + perLine);
    const texParts = group.map((v, j) => {
      return `M_{${i + j + 1}} = ${LC.PdfExport._vectorTex(v)}`;
    });
    tex += `\\[ ${texParts.join(' \\qquad ')} \\]\n`;
  }
  tex += `Total vectors: ${s.vectors.length}\n\n`;

  // STEP 3
  tex += `\\section{Step 3: Encryption}\n`;
  tex += `Each plaintext vector is encrypted via matrix multiplication modulo 27.\n`;
  tex += `\\[ C_i \\equiv K \\cdot M_i \\pmod{27} \\]\n\n`;
  
  const enc = s.encryptionData;
  const totalBlocks = enc.detailedBlocks.length + enc.summaryBlocks.length;
  for (let idx = 0; idx < totalBlocks; idx++) {
    let block;
    if (idx < enc.detailedBlocks.length) {
      block = enc.detailedBlocks[idx];
    } else {
      const sIdx = idx - enc.detailedBlocks.length;
      const sb = enc.summaryBlocks[sIdx];
      block = {
        blockIndex: sb.blockIndex,
        plainVector: sb.plainVector,
        cipherVector: sb.cipherVector,
        steps: LC.Encryption.generateBlockSteps(s.keyMatrix, sb.plainVector, 27)
      };
    }
    
    const kTex = LC.PdfExport._matrixTex(s.keyMatrix);
    const mTex = LC.PdfExport._vectorTex(block.plainVector);
    const expandedRows = block.steps.map(step =>
      step.products.map(p => p.kVal + ' \\cdot ' + p.mVal).join(' + ')
    );
    const expandedTex = '\\begin{bmatrix} ' + expandedRows.join(' \\\\ ') + ' \\end{bmatrix}';
    const rawSumsTex = LC.PdfExport._vectorTex(block.steps.map(step => step.sum));
    const finalCTex = LC.PdfExport._vectorTex(block.cipherVector);

    tex += `\\subsection*{Block ${idx + 1}}\n`;
    tex += `\\[ C_{${idx+1}} = ${kTex} ${mTex} = ${expandedTex} = ${rawSumsTex} \\equiv ${finalCTex} \\pmod{27} \\]\n`;
  }

  // STEP 4
  tex += `\\section{Step 4: Inverse Key Matrix}\n`;
  tex += `Calculate the modular inverse of the key matrix $K$ modulo 27 using Gauss-Jordan Elimination.\n\n`;
  if (!s.inverseData || !s.inverseData.success) {
      tex += `\\textbf{Note:} The matrix could not be inverted.\n`;
  } else {
      tex += `First, the determinant is checked: $\\det(K) = ${s.inverseData.determinant}$, and $\\det(K) \\pmod{27} = ${s.inverseData.detMod}$.\n`;
      tex += `The modular inverse of the determinant is ${s.inverseData.detInverse}.\n\n`;
      
      tex += `Gauss-Jordan Steps:\n\\begin{itemize}\n`;
      s.inverseData.steps.forEach(step => {
        let safeOp = step.operation
            .replace(/\u2194/g, '$\\leftrightarrow$')
            .replace(/\u2192/g, '$\\rightarrow$')
            .replace(/\u2014/g, '--')
            .replace(/\u2013/g, '-')
            .replace(/\u2212/g, '$-{}$')
            .replace(/\u00b7/g, '$\\cdot$')
            .replace(/\u00d7/g, '$\\times$')
            .replace(/\u207B\u00B9/g, '$^{-1}$')
            .replace(/⁻¹/g, '$^{-1}$');
        tex += `\\item \\textbf{${safeOp}}: \\\\[1ex]\n`;
        tex += `\\[ ${LC.PdfExport._augTex(step.matrix)} \\]\n`;
      });
      tex += `\\end{itemize}\n\n`;
      tex += `\\[ K^{-1} \\equiv ${LC.PdfExport._matrixTex(s.inverseKeyMatrix)} \\pmod{27} \\]\n\n`;
  }

  // STEP 5
  if (s.cramerData && s.cramerData.success) {
      tex += `\\section{Step 5: Decryption via Cramer's Rule (First Block)}\n`;
      tex += `Verify the inverse operations for the first block using Cramer's rule.\n`;
      const cd = s.cramerData;
      cd.steps.forEach(step => {
        if (step.type === 'determinant') {
            tex += `\\[ \\det(K) = ${step.detKRaw}, \\quad \\det(K) \\pmod{27} = ${step.detK}, \\quad \\det(K)^{-1} \\equiv ${step.detKInv} \\pmod{27} \\]\n`;
        } else if (step.type === 'variable') {
            const KiTex = LC.PdfExport._matrixTex(step.modifiedMatrix);
            tex += `\\[ K_{${step.varIndex + 1}} = ${KiTex} \\Rightarrow \\det(K_{${step.varIndex + 1}}) = ${step.detKiRaw} \\equiv ${step.detKi} \\pmod{27} \\]\n`;
            tex += `\\[ m_{${step.varIndex + 1}} \\equiv ${step.detKInv} \\cdot ${step.detKi} = ${step.miRaw} \\equiv ${step.result} \\pmod{27} \\]\n`;
        }
      });
      tex += `Recovered partial plaintext vector: $M_1 = ${LC.PdfExport._vectorTex(cd.plaintext)}$.\n\n`;
  }

  // STEP 6
  if (s.matInvData) {
      tex += `\\section{Step 6: Decryption via Matrix Inverse}\n`;
      tex += `Applying $M_i \\equiv K^{-1} \\cdot C_i \\pmod{27}$ to recover the full text.\n\n`;
      
      s.matInvData.blocks.forEach(block => {
        const cTex = LC.PdfExport._vectorTex(block.cipherVector);
        const mTex = LC.PdfExport._vectorTex(block.plainVector);
        const kInvTex = LC.PdfExport._matrixTex(s.inverseKeyMatrix);
        
        const expandedRows = block.steps.map(step =>
          step.products.map(p => p.kVal + ' \\cdot ' + p.cVal).join(' + ')
        );
        const expandedTex = '\\begin{bmatrix} ' + expandedRows.join(' \\\\ ') + ' \\end{bmatrix}';
        const rawSumsTex = LC.PdfExport._vectorTex(block.steps.map(step => step.sum));
        
        tex += `\\subsection*{Block ${block.blockIndex + 1}}\n`;
        tex += `\\[ M_{${block.blockIndex + 1}} = ${kInvTex} ${cTex} = ${expandedTex} = ${rawSumsTex} \\equiv ${mTex} \\pmod{27} \\]\n`;
      });
      
      tex += `\\textbf{Fully Recovered Plaintext:} \\texttt{${s.recoveredPlaintext}}\n`;
  }

  tex += `\\end{document}\n`;

  return tex;
};

LC.PdfExport.compileAndDownload = function(tex) {
  if (LC.App && LC.App.showAlert) {
    LC.App.showAlert('Compiling PDF securely... This will open in a new tab shortly.', 'info');
  }

  const form = document.createElement('form');
  form.method = 'POST';
  form.action = 'https://texlive.net/cgi-bin/latexcgi';
  form.target = '_blank';
  form.enctype = 'multipart/form-data';
  form.style.display = 'none';

  // TeXLive.net requires the text submitted as actual fields containing strings, not blobs
  const fileInput = document.createElement('input');
  fileInput.type = 'hidden';
  fileInput.name = 'filecontents[]';
  fileInput.value = tex;
  form.appendChild(fileInput);

  const filename = document.createElement('input');
  filename.type = 'hidden';
  filename.name = 'filename[]';
  filename.value = 'document.tex';
  form.appendChild(filename);

  const engine = document.createElement('input');
  engine.type = 'hidden';
  engine.name = 'engine';
  engine.value = 'pdflatex';
  form.appendChild(engine);

  const ret = document.createElement('input');
  ret.type = 'hidden';
  ret.name = 'return';
  ret.value = 'pdf';
  form.appendChild(ret);

  document.body.appendChild(form);
  form.submit();
  
  setTimeout(() => document.body.removeChild(form), 1000);
};
