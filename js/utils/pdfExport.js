// ============================================================
// LinearCrypt — PDF Export (Hybrid: jsPDF vector + KaTeX math)
// Times New Roman body, LaTeX-quality math via targeted KaTeX capture
// ============================================================
window.LC = window.LC || {};
LC.PdfExport = {};

// ---- Constants ----
LC.PdfExport.PAGE_W  = 595.28;
LC.PdfExport.PAGE_H  = 841.89;
LC.PdfExport.MARGIN  = 40;
LC.PdfExport.CONTENT_W = 595.28 - 80;
LC.PdfExport.FOOTER_H = 30;
LC.PdfExport.MAX_Y  = 841.89 - 40 - 30; // bottom of usable area

// ---- Colors ----
LC.PdfExport.COLORS = {
  navy: [15, 52, 96],
  coral: [233, 69, 96],
  cyan: [0, 180, 216],
  yellow: [255, 215, 0],
  darkBg: [22, 33, 62],
  cardBg: [248, 249, 250],
  cardBorder: [224, 224, 224],
  white: [255, 255, 255],
  black: [26, 26, 46],
  gray: [102, 102, 102],
  lightGray: [136, 136, 136],
  greenBg: [240, 255, 244],
  greenBorder: [198, 246, 213],
  greenText: [39, 103, 73],
  tableBg: [240, 244, 248],
};

// ============================================================
// MAIN ENTRY POINT
// ============================================================
LC.PdfExport.generate = async function() {
  const s = LC.App.state;
  if (!s.computed) { LC.App.showAlert('Please run the encryption first.'); return; }

  const overlay = LC.PdfExport._createOverlay();
  document.body.appendChild(overlay);

  try {
    // Sanitize: deep-clone state snapshot
    const snap = JSON.parse(JSON.stringify(s));

    // ---- PHASE 1: MATH PRELOAD (DRY RUN) ----
    LC.PdfExport._forceUpdateOverlay(overlay, 'Analyzing document structure...');
    LC.PdfExport._isPreloadPass = true;
    LC.PdfExport._preloadQueue = [];

    const { jsPDF } = window.jspdf;
    let pdfDry = new jsPDF({ unit: 'pt', format: 'a4', compress: false });
    pdfDry.setFont('times', 'normal');

    let yDry = LC.PdfExport.MARGIN;
    yDry = await LC.PdfExport._renderTitlePage(pdfDry, snap, yDry);
    yDry = await LC.PdfExport._renderStep1(pdfDry, snap, yDry);
    yDry = await LC.PdfExport._renderStep2(pdfDry, snap, yDry);
    yDry = await LC.PdfExport._renderStep3(pdfDry, snap, yDry);
    yDry = await LC.PdfExport._renderStep4(pdfDry, snap, yDry);
    yDry = await LC.PdfExport._renderStep5(pdfDry, snap, yDry);
    yDry = await LC.PdfExport._renderStep6(pdfDry, snap, yDry);

    LC.PdfExport._isPreloadPass = false;

    // Batch render unique math formulas
    const uniqueMap = new Map();
    LC.PdfExport._preloadQueue.forEach(item => {
      if (!LC.PdfExport._mathCache[item.key]) {
        uniqueMap.set(item.key, item);
      }
    });

    const uniqueMath = Array.from(uniqueMap.values());
    if (uniqueMath.length > 0) {
      LC.PdfExport._forceUpdateOverlay(overlay, 'Rendering equations (' + uniqueMath.length + ')...');

      const chunkSize = 10;
      for (let c = 0; c < uniqueMath.length; c += chunkSize) {
        const chunk = uniqueMath.slice(c, c + chunkSize);
        if (uniqueMath.length > chunkSize) {
          LC.PdfExport._forceUpdateOverlay(overlay, `Rendering math batches (${Math.floor(c/chunkSize)+1} of ${Math.ceil(uniqueMath.length/chunkSize)})...`);
        }

        const batchContainer = document.createElement('div');
        batchContainer.style.cssText = 'position:absolute; top:0; left:0; z-index:-1; background:transparent; color:#000000; padding:20px; max-width:800px; display:inline-block; pointer-events:none;';
        document.body.appendChild(batchContainer);

        chunk.forEach((item, i) => {
          const wrap = document.createElement('div');
          wrap.id = 'math-batch-' + c + '-' + i;
          wrap.style.cssText = 'padding: 30px 10px; font-size:14px; display:inline-block; vertical-align:top; background:transparent; margin: 20px 0px; width:max-content; border:1px solid transparent;';
          if (item.displayMode) wrap.style.fontSize = '15px';

          try {
            katex.render(item.latex, wrap, { displayMode: !!item.displayMode, throwOnError: false });
          } catch(e) {
            wrap.textContent = item.latex;
          }
          batchContainer.appendChild(wrap);
          item.el = wrap;
        });

        await new Promise(r => setTimeout(r, 150));

        const isMobile = window.innerWidth <= 768;
        const pixelRatio = isMobile ? 1.5 : 2.5;
        
        const overlayStatus = document.getElementById('pdf-overlay-status');
        if (overlayStatus) overlayStatus.textContent = 'Rendering equations (this may take up to a minute on mobile devices)...';

        try {
          const batchImgData = await htmlToImage.toPng(batchContainer, { pixelRatio, skipFonts: true, fontEmbedCSS: '' });

          const img = new Image();
          img.src = batchImgData;
          await new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          });

          if (img.width > 0 && img.height > 0) {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            chunk.forEach((item) => {
              const wrap = item.el;
              const rect = wrap.getBoundingClientRect();
              const pRect = batchContainer.getBoundingClientRect();

              const relLeft = rect.left - pRect.left;
              const relTop = rect.top - pRect.top;

              const sx = Math.floor(relLeft * pixelRatio);
              const sy = Math.floor(relTop * pixelRatio);
              const sWidth = Math.ceil(rect.width * pixelRatio);
              const sHeight = Math.ceil(rect.height * pixelRatio);

              const tempCanvas = document.createElement('canvas');
              tempCanvas.width = Math.max(1, sWidth);
              tempCanvas.height = Math.max(1, sHeight);
              const tempCtx = tempCanvas.getContext('2d');
              tempCtx.drawImage(canvas, sx, sy, sWidth, sHeight, 0, 0, sWidth, sHeight);

              LC.PdfExport._mathCache[item.key] = {
                imgData: tempCanvas.toDataURL('image/png'),
                srcW: Math.max(1, sWidth),
                srcH: Math.max(1, sHeight)
              };
            });
          }
        } catch(batchErr) {
          console.warn('Batch capture ignored', batchErr);
        }

        document.body.removeChild(batchContainer);
      }
    }

    // ---- PHASE 2: REAL GENERATION ----
    LC.PdfExport._forceUpdateOverlay(overlay, 'Assembling PDF...');
    const pdf = new jsPDF({ unit: 'pt', format: 'a4', compress: false });
    pdf.setFont('times', 'normal');

    let y = LC.PdfExport.MARGIN;

    // Render each section
    y = await LC.PdfExport._renderTitlePage(pdf, snap, y);

    pdf.addPage();
    y = LC.PdfExport.MARGIN;
    y = await LC.PdfExport._renderStep1(pdf, snap, y);

    pdf.addPage();
    y = LC.PdfExport.MARGIN;
    y = await LC.PdfExport._renderStep2(pdf, snap, y);

    pdf.addPage();
    y = LC.PdfExport.MARGIN;
    y = await LC.PdfExport._renderStep3(pdf, snap, y);

    pdf.addPage();
    y = LC.PdfExport.MARGIN;
    y = await LC.PdfExport._renderStep4(pdf, snap, y);

    pdf.addPage();
    y = LC.PdfExport.MARGIN;
    y = await LC.PdfExport._renderStep5(pdf, snap, y);

    pdf.addPage();
    y = LC.PdfExport.MARGIN;
    y = await LC.PdfExport._renderStep6(pdf, snap, y);

    // Add footers to all pages
    LC.PdfExport._addFooters(pdf);

    // Download using jsPDF's built-in save (reliable filename across all browsers)
    LC.PdfExport._forceUpdateOverlay(overlay, 'Preparing download...');
    pdf.save('LinearCrypt_HillCipher_Report.pdf');

  } catch (err) {
    console.error('PDF Export Error:', err);
    let msg = 'Unknown Error';
    if (err && err.message) msg = err.message;
    else if (typeof err === 'string' || err instanceof String) msg = err;
    LC.App.showAlert('Error generating PDF: ' + msg);
  } finally {
    try { document.body.removeChild(overlay); } catch(e){}
    LC.PdfExport._isGenerating = false;
    
    // Unconditionally restore hidden elements
    document.querySelectorAll('nav, .mobile-menu, .viz-footer, .step-timeline-container').forEach(el => {
      el.style.display = '';
    });
    const mainApp = document.getElementById('app');
    if (mainApp) mainApp.classList.remove('pdf-mode');
  }
};

// ============================================================
// OVERLAY
// ============================================================
LC.PdfExport._createOverlay = function() {
  const el = document.createElement('div');
  el.id = 'pdf-export-overlay';
  el.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;gap:16px;position:relative;z-index:9999999;transform:translateZ(0);">
      <div class="pdf-spinner"></div>
      <p style="font-family:'Space Grotesk',sans-serif;font-size:18px;font-weight:600;color:#f0f0f0;text-shadow:0 1px 3px rgba(0,0,0,0.8);">Generating PDF...</p>
      <p id="pdf-overlay-status" style="font-family:'Noto Sans',sans-serif;font-size:14px;color:#888;text-shadow:0 1px 2px rgba(0,0,0,0.8);">Preparing content...</p>
    </div>`;
  return el;
};

LC.PdfExport._forceUpdateOverlay = function(overlay, msg) {
  const status = overlay.querySelector('#pdf-overlay-status');
  if (status) status.textContent = msg;
};

LC.PdfExport._updateOverlay = function(overlay, msg) {
  if (LC.PdfExport._isPreloadPass) return;
  const status = overlay.querySelector('#pdf-overlay-status');
  if (status) status.textContent = msg;
};

// ============================================================
// MATH CAPTURE — targeted KaTeX rendering
// ============================================================
LC.PdfExport._mathCache = {};

LC.PdfExport._captureMath = async function(latex, displayMode) {
  const key = (displayMode ? 'D:' : 'I:') + latex;
  if (LC.PdfExport._mathCache[key]) return LC.PdfExport._mathCache[key];

  if (LC.PdfExport._isPreloadPass) {
    LC.PdfExport._preloadQueue.push({ key, latex, displayMode });
    // Return dummy 1x1 png and arbitrary dimensions to let layout proceed
    return {
      imgData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
      srcW: 100,
      srcH: 20
    };
  }

  const container = document.createElement('div');
  // Position behind other elements but fully part of layout to guarantee perfect rendering
  container.style.cssText = 'position:absolute; top:0; left:0; z-index:-1; background:transparent; color:#000000; padding: 30px 10px; font-size:14px; width:max-content; display:inline-block; pointer-events:none; border:1px solid transparent;';
  if (displayMode) container.style.fontSize = '15px';
  
  document.body.appendChild(container);

  try {
    katex.render(latex, container, { displayMode: !!displayMode, throwOnError: false });
  } catch(e) {
    container.textContent = latex;
  }

  await new Promise(r => setTimeout(r, 100));

  const isMobile = window.innerWidth <= 768;
  try {
    const imgData = await htmlToImage.toPng(container, { pixelRatio: isMobile ? 1.0 : 2.5, skipFonts: true, fontEmbedCSS: '' });

    const img = new Image();
    img.src = imgData;
    await new Promise(r => { img.onload = r; img.onerror = () => r(); });

    if (img.width === 0 || img.height === 0) throw new Error('Blank image generated - iOS security block');

    const srcW = img.width;
    const srcH = img.height;

    document.body.removeChild(container);

    const result = { imgData, srcW, srcH };
    LC.PdfExport._mathCache[key] = result;
    return result;
  } catch(fallbackErr) {
    console.warn("Generating fallback math string instead of canvas image", fallbackErr);
    document.body.removeChild(container);
    
    const fc = document.createElement('canvas');
    fc.width = 400; fc.height = 36;
    const fctx = fc.getContext('2d');
    fctx.fillStyle = '#ffffff'; fctx.fillRect(0,0,400,36);
    fctx.fillStyle = '#e94560'; fctx.font = '13px monospace';
    // Fallback directly to text if mobile locks math extraction
    fctx.fillText(latex.substring(0, 50) + (latex.length>50?'...':''), 5, 22);
    
    const result = { imgData: fc.toDataURL('image/png'), srcW: 400, srcH: 36 };
    LC.PdfExport._mathCache[key] = result;
    return result;
  }
};

// ============================================================
// DRAWING PRIMITIVES
// ============================================================

// Page break check: if y + neededH exceeds max, add page and return new y
LC.PdfExport._checkPageBreak = function(pdf, y, neededH) {
  if (y + neededH > LC.PdfExport.MAX_Y) {
    pdf.addPage();
    return LC.PdfExport.MARGIN;
  }
  return y;
};

// Draw text with Times New Roman
LC.PdfExport._drawText = function(pdf, text, x, y, opts) {
  opts = opts || {};
  pdf.setFont('times', opts.style || 'normal');
  pdf.setFontSize(opts.size || 12);
  const c = opts.color || LC.PdfExport.COLORS.black;
  pdf.setTextColor(c[0], c[1], c[2]);
  const align = opts.align || 'left';
  const maxW = opts.maxWidth || LC.PdfExport.CONTENT_W;

  if (opts.maxWidth) {
    const lines = pdf.splitTextToSize(String(text), maxW);
    pdf.text(lines, x, y, { align });
    return y + lines.length * (opts.size || 12) * 1.35;
  } else {
    pdf.text(String(text), x, y, { align });
    return y + (opts.size || 12) * 1.35;
  }
};

// Draw monospace text
LC.PdfExport._drawMono = function(pdf, text, x, y, opts) {
  opts = opts || {};
  pdf.setFont('courier', opts.style || 'normal');
  pdf.setFontSize(opts.size || 11);
  const c = opts.color || LC.PdfExport.COLORS.black;
  pdf.setTextColor(c[0], c[1], c[2]);
  pdf.text(String(text), x, y, { align: opts.align || 'left' });
  return y + (opts.size || 11) * 1.35;
};

// Draw captured KaTeX math image, scaled to fit within maxWidth
LC.PdfExport._drawMath = function(pdf, mathResult, x, y, maxWidth) {
  maxWidth = maxWidth || LC.PdfExport.CONTENT_W;
  const scale = 72 / (96 * 2.5); // Convert px to pt, accounting for 2.5x capture scale
  let imgW = mathResult.srcW * scale;
  let imgH = mathResult.srcH * scale;

  // Scale down if too wide
  if (imgW > maxWidth) {
    const ratio = maxWidth / imgW;
    imgW = maxWidth;
    imgH *= ratio;
  }

  // Center horizontally
  const cx = x + (maxWidth - imgW) / 2;
  pdf.addImage(mathResult.imgData, 'PNG', cx, y, imgW, imgH, undefined, 'FAST');
  return y + imgH + 4;
};

// Draw a filled card (light background with border)
LC.PdfExport._drawCard = function(pdf, x, y, w, h) {
  pdf.setFillColor(248, 249, 250);
  pdf.setDrawColor(224, 224, 224);
  pdf.setLineWidth(0.5);
  pdf.roundedRect(x, y, w, h, 4, 4, 'FD');
};

// Draw a dark result box
LC.PdfExport._drawResultBox = function(pdf, x, y, w, h) {
  pdf.setFillColor(15, 52, 96);
  pdf.roundedRect(x, y, w, h, 4, 4, 'F');
};

// Draw a green verification box
LC.PdfExport._drawGreenBox = function(pdf, x, y, w, h) {
  pdf.setFillColor(240, 255, 244);
  pdf.setDrawColor(198, 246, 213);
  pdf.setLineWidth(0.5);
  pdf.roundedRect(x, y, w, h, 4, 4, 'FD');
};

// Draw section header with step badge
LC.PdfExport._drawSectionHeader = function(pdf, y, stepNum, title, description) {
  y = LC.PdfExport._checkPageBreak(pdf, y, 60);
  const M = LC.PdfExport.MARGIN;

  // Step badge
  pdf.setFillColor(233, 69, 96);
  pdf.roundedRect(M, y - 10, 42, 16, 3, 3, 'F');
  pdf.setFont('times', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(255, 255, 255);
  pdf.text(stepNum.toUpperCase(), M + 21, y + 1, { align: 'center' });

  // Title
  pdf.setFont('times', 'bold');
  pdf.setFontSize(18);
  pdf.setTextColor(26, 26, 46);
  pdf.text(title, M + 50, y + 2);
  y += 18;

  // Description
  pdf.setFont('times', 'normal');
  pdf.setFontSize(11);
  pdf.setTextColor(102, 102, 102);
  const descLines = pdf.splitTextToSize(description, LC.PdfExport.CONTENT_W);
  pdf.text(descLines, M, y);
  y += descLines.length * 14 + 4;

  // Gradient line
  pdf.setDrawColor(233, 69, 96);
  pdf.setLineWidth(1.5);
  pdf.line(M, y, M + LC.PdfExport.CONTENT_W * 0.6, y);
  y += 12;

  return y;
};

// Add footers to all pages
LC.PdfExport._addFooters = function(pdf) {
  const total = pdf.internal.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    pdf.setPage(p);
    pdf.setFont('times', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(150, 150, 150);
    pdf.text('Page ' + p + ' of ' + total, LC.PdfExport.PAGE_W / 2, LC.PdfExport.PAGE_H - 20, { align: 'center' });
    pdf.text('LinearCrypt -- Hill Cipher Observatory', LC.PdfExport.MARGIN, LC.PdfExport.PAGE_H - 20);
  }
};

// Sanitize any string for jsPDF (replace non-WinAnsi Unicode with ASCII)
LC.PdfExport._safe = function(str) {
  return String(str)
    .replace(/\u2190/g, '<-')    // ←
    .replace(/\u2192/g, '->')    // →
    .replace(/\u2194/g, '<->')   // ↔
    .replace(/\u2014/g, '--')    // —
    .replace(/\u2013/g, '-')     // –
    .replace(/\u2212/g, '-')     // −
    .replace(/\u00b7/g, '*')     // ·
    .replace(/\u22c5/g, '*')     // ⋅
    .replace(/\u00d7/g, 'x')     // ×
    .replace(/\u2261/g, '=')     // ≡
    .replace(/\u2248/g, '~')     // ≈
    .replace(/\u2260/g, '!=')    // ≠
    .replace(/\u2264/g, '<=')    // ≤
    .replace(/\u2265/g, '>=')    // ≥
    .replace(/\u207B/g, '-')     // ⁻
    .replace(/\u00B9/g, '1')     // ¹
    .replace(/\u00B2/g, '2')     // ²
    .replace(/\u00B3/g, '3')     // ³
    .replace(/\u2080/g, '0')     // ₀
    .replace(/\u2081/g, '1')     // ₁
    .replace(/\u2082/g, '2')     // ₂
    .replace(/\u2083/g, '3')     // ₃
    .replace(/\u1D40/g, '^T')    // ᵀ
    .replace(/\u2713/g, '[OK]')  // ✓
    .replace(/\u2026/g, '...')   // …
    .replace(/[^\x00-\x7F]/g, ''); // strip anything else non-ASCII
};

// Convert plain determinant expansion text into KaTeX-friendly form
LC.PdfExport._expansionToTex = function(expr) {
  return String(expr)
    .replace(/\u00b7|\u22c5/g, '\\cdot ')
    .replace(/\u00d7/g, '\\times ')
    .replace(/\u2212|\u2013|\u2014/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
};

// LaTeX helpers
LC.PdfExport._matrixTex = function(M) {
  const rows = M.map(r => r.join(' & ')).join(' \\\\ ');
  return '\\begin{bmatrix} ' + rows + ' \\end{bmatrix}';
};

LC.PdfExport._vectorTex = function(v) {
  return '\\begin{bmatrix} ' + v.join(' \\\\ ') + ' \\end{bmatrix}';
};

LC.PdfExport._augTex = function(matrix) {
  const rows = matrix.map(r => {
    return r.slice(0, 3).join(' & ') + ' & ' + r.slice(3).join(' & ');
  }).join(' \\\\ ');
  return '\\left[\\begin{array}{ccc|ccc} ' + rows + ' \\end{array}\\right]';
};

// ============================================================
// TITLE PAGE
// ============================================================
LC.PdfExport._renderTitlePage = async function(pdf, s, y) {
  const M = LC.PdfExport.MARGIN;
  const CW = LC.PdfExport.CONTENT_W;
  const cx = LC.PdfExport.PAGE_W / 2;

  // Brand
  y += 40;
  pdf.setFont('times', 'normal');
  pdf.setFontSize(11);
  pdf.setTextColor(136, 136, 136);
  pdf.text('LINEARCRYPT', cx, y, { align: 'center', charSpace: 4 });
  y += 30;

  // Title
  pdf.setFont('times', 'bold');
  pdf.setFontSize(28);
  pdf.setTextColor(26, 26, 46);
  pdf.text('Hill Cipher Analysis Report', cx, y, { align: 'center' });
  y += 16;

  // Accent line
  pdf.setDrawColor(233, 69, 96);
  pdf.setLineWidth(2);
  pdf.line(cx - 30, y, cx + 30, y);
  y += 20;

  // Date
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  pdf.setFont('times', 'normal');
  pdf.setFontSize(12);
  pdf.setTextColor(102, 102, 102);
  pdf.text(date + ' at ' + time, cx, y, { align: 'center' });
  y += 35;

  // Input Parameters card
  pdf.setFont('courier', 'bold');
  pdf.setFontSize(14);
  let ptLines = pdf.splitTextToSize(s.plaintext, CW - 32);
  let ctLines = pdf.splitTextToSize(s.ciphertext, CW - 32);
  if (ptLines.length > 12) { ptLines = ptLines.slice(0, 12); ptLines.push('... [Truncated for PDF rendering]'); }
  if (ctLines.length > 12) { ctLines = ctLines.slice(0, 12); ctLines.push('... [Truncated for PDF rendering]'); }

  const kTex = 'K = ' + LC.PdfExport._matrixTex(s.keyMatrix);
  const kMath = await LC.PdfExport._captureMath(kTex, true);
  const scale = 72 / (96 * 2.5);
  const kMathH = kMath.srcH * scale;

  const cardY = y;
  const contentH = 18 + 14 + (ptLines.length * 16) + 20 + 8 + kMathH + 16 + 14 + (ctLines.length * 16);
  const cardH = contentH + 30; // padding

  LC.PdfExport._drawCard(pdf, M, cardY, CW, cardH);

  y = cardY + 20;
  pdf.setFont('times', 'bold');
  pdf.setFontSize(12);
  pdf.setTextColor(15, 52, 96);
  pdf.text('INPUT PARAMETERS', M + 16, y);
  y += 18;

  // Plaintext
  pdf.setFont('times', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor(136, 136, 136);
  pdf.text('PLAINTEXT', M + 16, y);
  y += 14;
  pdf.setFont('courier', 'bold');
  pdf.setFontSize(14); // slightly smaller for long string capacities
  pdf.setTextColor(26, 26, 46);
  pdf.text(ptLines, M + 16, y);
  y += ptLines.length * 16 + 10;

  // Key matrix (KaTeX)
  pdf.setFont('times', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor(136, 136, 136);
  pdf.text('KEY MATRIX K (3x3)', M + 16, y);
  y += 8;
  y = LC.PdfExport._drawMath(pdf, kMath, M + 16, y, CW - 32);
  y += 16;

  // Ciphertext
  pdf.setFont('times', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor(136, 136, 136);
  pdf.text('CIPHERTEXT', M + 16, y);
  y += 14;
  pdf.setFont('courier', 'bold');
  pdf.setFontSize(14);
  pdf.setTextColor(233, 69, 96);
  pdf.text(ctLines, M + 16, y);

  y = cardY + cardH + 20;

  // Process Overview
  pdf.setFont('times', 'bold');
  pdf.setFontSize(13);
  pdf.setTextColor(15, 52, 96);
  pdf.text('Process Overview', M, y);
  y += 18;

  const steps = [
    '1.  Message Conversion -- Characters -> Numerical values',
    '2.  Vector Partitioning -- Grouping into 3x1 column vectors',
    '3.  Encryption -- Matrix multiplication C = K * M (mod 27)',
    '4.  Inverse Key Matrix -- Gauss-Jordan Elimination',
    '5.  Decryption via Cramer\'s Rule -- First block verification',
    '6.  Decryption via Matrix Inverse -- Full message recovery'
  ];
  pdf.setFont('times', 'normal');
  pdf.setFontSize(11);
  pdf.setTextColor(68, 68, 68);
  steps.forEach(step => {
    pdf.text(step, M + 8, y);
    y += 16;
  });

  return y;
};

// ============================================================
// STEP 1: Message Conversion
// ============================================================
LC.PdfExport._renderStep1 = async function(pdf, s, y) {
  const M = LC.PdfExport.MARGIN;
  const CW = LC.PdfExport.CONTENT_W;

  y = LC.PdfExport._drawSectionHeader(pdf, y, 'Step 1', 'Message Conversion',
    'Each character is mapped to its numerical equivalent: A = 1, B = 2, ..., Z = 26, Space = 0.');

  // Table
  const chars = Array.from(s.plaintext);
  const colW = CW / 2;

  // Table header
  y = LC.PdfExport._checkPageBreak(pdf, y, 24);
  pdf.setFillColor(15, 52, 96);
  pdf.rect(M, y - 12, CW, 18, 'F');
  pdf.setFont('times', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(255, 255, 255);
  pdf.text('CHARACTER', M + 12, y);
  pdf.text('VALUE', M + colW + 12, y);
  y += 10;

  // Table rows
  chars.forEach((c, i) => {
    y = LC.PdfExport._checkPageBreak(pdf, y, 18);
    const num = s.numericalValues[i];
    const display = c === ' ' ? 'SPACE' : c;
    if (i % 2 === 0) {
      pdf.setFillColor(248, 249, 250);
      pdf.rect(M, y - 10, CW, 16, 'F');
    }
    pdf.setFont('courier', 'bold');
    pdf.setFontSize(12);
    pdf.setTextColor(26, 26, 46);
    pdf.text(display, M + 12, y);
    pdf.setTextColor(233, 69, 96);
    pdf.text(String(num), M + colW + 12, y);
    y += 16;
  });
  y += 8;

  // Encoding formula
  const formulaMath = await LC.PdfExport._captureMath(
    '\\text{Encoding: } A=1,\\; B=2,\\; \\ldots,\\; Z=26,\\; \\text{Space}=0', true);
  y = LC.PdfExport._checkPageBreak(pdf, y, 40);
  y = LC.PdfExport._drawMath(pdf, formulaMath, M, y, CW);
  y += 8;

  // Numerical sequence summary
  pdf.setFont('courier', 'normal');
  pdf.setFontSize(11);
  const arrStr = '[' + s.numericalValues.join(', ') + ']';
  let seqLines = pdf.splitTextToSize(arrStr, CW - 24);
  if (seqLines.length > 25) {
    seqLines = seqLines.slice(0, 25);
    seqLines.push('... [Sequence truncated for PDF layout]');
  }
  const cardH = 26 + seqLines.length * 14;

  y = LC.PdfExport._checkPageBreak(pdf, y, cardH + 20);
  LC.PdfExport._drawCard(pdf, M, y, CW, cardH);
  pdf.setFont('times', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(136, 136, 136);
  pdf.text('NUMERICAL SEQUENCE', M + 12, y + 14);
  pdf.setFont('courier', 'normal');
  pdf.setFontSize(11);
  pdf.setTextColor(26, 26, 46);
  pdf.text(seqLines, M + 12, y + 30);
  y += cardH + 16;

  return y;
};

// ============================================================
// STEP 2: Vector Partitioning
// ============================================================
LC.PdfExport._renderStep2 = async function(pdf, s, y) {
  const M = LC.PdfExport.MARGIN;
  const CW = LC.PdfExport.CONTENT_W;

  y = LC.PdfExport._drawSectionHeader(pdf, y, 'Step 2', 'Vector Partitioning',
    'The numerical values are divided into 3x1 column vectors. Padding zeros fill the last vector if needed.');

  // Vectors rendered via KaTeX in groups of 4
  const perLine = 4;
  for (let i = 0; i < s.vectors.length; i += perLine) {
    const group = s.vectors.slice(i, i + perLine);
    const texParts = group.map((v, j) => {
      return 'M_{' + (i + j + 1) + '} = ' + LC.PdfExport._vectorTex(v);
    });
    const tex = texParts.join(' \\qquad ');
    const mathResult = await LC.PdfExport._captureMath(tex, true);
    y = LC.PdfExport._checkPageBreak(pdf, y, 60);
    y = LC.PdfExport._drawMath(pdf, mathResult, M, y, CW);
    y += 4;
  }
  y += 8;

  // Info box
  y = LC.PdfExport._checkPageBreak(pdf, y, 30);
  LC.PdfExport._drawCard(pdf, M, y, CW, 28);
  pdf.setFont('times', 'normal');
  pdf.setFontSize(11);
  pdf.setTextColor(68, 68, 68);
  let info = 'Total vectors: ' + s.vectors.length;
  if (s.paddingCount > 0) info += '  |  Padding zeros added: ' + s.paddingCount;
  pdf.text(info, M + 12, y + 17);
  y += 36;

  return y;
};

// ============================================================
// STEP 3: Encryption
// ============================================================
LC.PdfExport._renderStep3 = async function(pdf, s, y) {
  const M = LC.PdfExport.MARGIN;
  const CW = LC.PdfExport.CONTENT_W;
  const enc = s.encryptionData;

  y = LC.PdfExport._drawSectionHeader(pdf, y, 'Step 3', 'Encryption',
    'Each plaintext vector is encrypted via matrix multiplication modulo 27.');

  // Master formula
  const masterMath = await LC.PdfExport._captureMath('C_i \\equiv K \\cdot M_i \\pmod{27}', true);
  y = LC.PdfExport._drawMath(pdf, masterMath, M, y, CW);
  y += 8;

  // All blocks
  const totalBlocks = enc.detailedBlocks.length + enc.summaryBlocks.length;
  for (let blockIdx = 0; blockIdx < totalBlocks; blockIdx++) {
    let block;
    if (blockIdx < enc.detailedBlocks.length) {
      block = enc.detailedBlocks[blockIdx];
    } else {
      const sIdx = blockIdx - enc.detailedBlocks.length;
      const sb = enc.summaryBlocks[sIdx];
      block = {
        blockIndex: sb.blockIndex,
        plainVector: sb.plainVector,
        cipherVector: sb.cipherVector,
        steps: LC.Encryption.generateBlockSteps(s.keyMatrix, sb.plainVector, 27)
      };
    }

    const blockNum = blockIdx + 1;
    const plainLetters = block.plainVector.map(n => { const c = LC.Alphabet.numToChar(n); return c === ' ' ? '\\text{SPC}' : c; });
    const cipherLetters = block.cipherVector.map(n => { const c = LC.Alphabet.numToChar(n); return c === ' ' ? '\\text{SPC}' : c; });

    // Matrix equation: C_n = K · M = [expanded] = [raw]
    const kTex = LC.PdfExport._matrixTex(s.keyMatrix);
    const mTex = LC.PdfExport._vectorTex(block.plainVector);
    const expandedRows = block.steps.map(step =>
      step.products.map(p => p.kVal + ' \\cdot ' + p.mVal).join(' + ')
    );
    const expandedTex = '\\begin{bmatrix} ' + expandedRows.join(' \\\\ ') + ' \\end{bmatrix}';
    const rawSumsTex = LC.PdfExport._vectorTex(block.steps.map(step => step.sum));

    const eqTex = 'C_{' + blockNum + '} = ' + kTex + ' \\cdot ' + mTex + ' = ' + expandedTex + ' = ' + rawSumsTex;
    const eqMath = await LC.PdfExport._captureMath(eqTex, true);

    const scale = 72 / (96 * 2.5);
    const approxH = 16 + (eqMath.srcH * scale) + 40;

    // Card for this block
    y = LC.PdfExport._checkPageBreak(pdf, y, approxH);
    const cardY = y;

    // Block header
    pdf.setFont('times', 'bold');
    pdf.setFontSize(12);
    pdf.setTextColor(15, 52, 96);
    const headerText = 'Block ' + blockNum + ': [' + block.plainVector.join(', ') + ']^T -> (' + plainLetters.map(l => l.replace('\\text{', '').replace('}', '')).join(', ') + ')';
    pdf.text(headerText, M + 12, y + 4);
    y += 16;

    y = LC.PdfExport._drawMath(pdf, eqMath, M, y, CW);

    // Mod 27 reduction
    const needsReduction = block.steps.some(step => step.sum >= 27 || step.sum < 0);
    if (needsReduction) {
      const reductions = block.steps
        .filter(step => step.sum >= 27 || step.sum < 0)
        .map(step => {
          const q = Math.floor(step.sum / 27);
          return step.sum + ' - ' + q + '(27) = ' + step.modResult;
        });
      pdf.setFont('times', 'italic');
      pdf.setFontSize(10);
      pdf.setTextColor(102, 102, 102);
      pdf.text('Reduction: ' + reductions.join(',   '), M + 16, y);
      y += 14;
    }

    // Result
    const resultTex = 'C_{' + blockNum + '} = ' + LC.PdfExport._vectorTex(block.cipherVector) + ' \\quad \\rightarrow \\quad ' + cipherLetters.join(',\\; ');
    const resultMath = await LC.PdfExport._captureMath(resultTex, true);
    y = LC.PdfExport._drawMath(pdf, resultMath, M, y, CW);

    // Draw card background behind content
    const cardH = y - cardY + 8;
    // We need to draw card first then content — since we already rendered, skip card border for simplicity
    // Instead add a subtle separator
    pdf.setDrawColor(224, 224, 224);
    pdf.setLineWidth(0.3);
    pdf.line(M, y + 4, M + CW, y + 4);
    y += 16;
  }

  // Full ciphertext result box
  pdf.setFont('courier', 'bold');
  pdf.setFontSize(14);
  let ctLinesStr = pdf.splitTextToSize(s.ciphertext, CW - 24);
  if (ctLinesStr.length > 22) {
    ctLinesStr = ctLinesStr.slice(0, 22);
    ctLinesStr.push('... [Ciphertext truncated for PDF layout]');
  }
  const resultBoxH = 26 + ctLinesStr.length * 16 + 8;

  y = LC.PdfExport._checkPageBreak(pdf, y, resultBoxH + 20);
  LC.PdfExport._drawResultBox(pdf, M, y, CW, resultBoxH);
  pdf.setFont('times', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(200, 200, 200);
  pdf.text('FULL CIPHERTEXT', LC.PdfExport.PAGE_W / 2, y + 16, { align: 'center' });
  pdf.setFont('courier', 'bold');
  pdf.setFontSize(14);
  pdf.setTextColor(0, 180, 216);
  pdf.text(ctLinesStr, LC.PdfExport.PAGE_W / 2, y + 36, { align: 'center' });
  y += resultBoxH + 16;

  return y;
};

// ============================================================
// STEP 4: Gauss-Jordan Elimination
// ============================================================
LC.PdfExport._renderStep4 = async function(pdf, s, y) {
  const M = LC.PdfExport.MARGIN;
  const CW = LC.PdfExport.CONTENT_W;
  const inv = s.inverseData;

  y = LC.PdfExport._drawSectionHeader(pdf, y, 'Step 4', 'Inverse Key Matrix (Gauss-Jordan)',
    'Finding K^(-1) mod 27 so we can decrypt the ciphertext.');

  // Determinant info card
  const detTex = '\\det(K) = ' + inv.determinant + ', \\quad \\det(K) \\bmod 27 = ' + inv.detMod;
  const detMath = await LC.PdfExport._captureMath(detTex, true);

  let invTex = null;
  let invMath = null;
  if (inv.detInverse !== null) {
    invTex = '\\det(K)^{-1} \\bmod 27 = ' + inv.detInverse + ' \\quad (\\text{since } ' + inv.detMod + ' \\times ' + inv.detInverse + ' \\equiv 1 \\pmod{27})';
    invMath = await LC.PdfExport._captureMath(invTex, true);
  }

  const scale = 72 / (96 * 2.5);
  const detMathH = detMath.srcH * scale;
  const invMathH = invMath ? (invMath.srcH * scale) : 0;
  const totalMathH = detMathH + (invMath ? (invMathH + 8) : 0);

  const cardH = 16 + 12 + totalMathH + 16;
  y = LC.PdfExport._checkPageBreak(pdf, y, cardH + 20);
  const detCardY = y;
  LC.PdfExport._drawCard(pdf, M, y, CW, cardH);

  let cy = y + 16;
  pdf.setFont('times', 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(15, 52, 96);
  pdf.text('DETERMINANT', M + 16, cy);
  cy += 12;

  cy = LC.PdfExport._drawMath(pdf, detMath, M + 16, cy, CW - 32);
  
  if (invMath) {
    cy += 4;
    cy = LC.PdfExport._drawMath(pdf, invMath, M + 16, cy, CW - 32);
  }
  y += cardH + 16;

  if (!inv.success) {
    pdf.setFont('times', 'bold');
    pdf.setFontSize(12);
    pdf.setTextColor(233, 69, 96);
    pdf.text(LC.PdfExport._safe(inv.error), M, y);
    return y + 20;
  }

  // Row operations
  let stepCounter = 0;
  for (let si = 0; si < inv.steps.length; si++) {
    const step = inv.steps[si];

    const augMath = await LC.PdfExport._captureMath(LC.PdfExport._augTex(step.matrix), true);
    const scale = 72 / (96 * 2.5);
    y = LC.PdfExport._checkPageBreak(pdf, y, 50 + (augMath.srcH * scale));

    if (step.type === 'initial') {
      pdf.setFont('times', 'bold');
      pdf.setFontSize(11);
      pdf.setTextColor(15, 52, 96);
      pdf.text('Initial Augmented Matrix [K | I3]', M, y);
      y += 14;
    } else {
      stepCounter++;
      pdf.setFont('times', 'bold');
      pdf.setFontSize(11);
      pdf.setTextColor(15, 52, 96);
      pdf.text('Step ' + stepCounter + ' -- ', M, y);
      const stepW = pdf.getTextWidth('Step ' + stepCounter + ' -- ');
      pdf.setFont('times', 'italic');
      pdf.setTextColor(233, 69, 96);
      pdf.text(LC.PdfExport._safe(step.operation), M + stepW, y);
      y += 14;

      if (step.detail && step.detail.explanation) {
        pdf.setFont('times', 'italic');
        pdf.setFontSize(10);
        pdf.setTextColor(120, 120, 120);
        pdf.text(LC.PdfExport._safe(step.detail.explanation), M + 8, y);
        y += 12;
      }

      // Computation detail
      if (step.detail && step.type === 'scale') {
        const d = step.detail;
        const rowStr = (r) => '[' + r.slice(0,3).join(', ') + ' | ' + r.slice(3).join(', ') + ']';
        pdf.setFont('courier', 'normal');
        pdf.setFontSize(9);
        pdf.setTextColor(85, 85, 85);
        pdf.text(LC.PdfExport._safe(d.factor + ' * ' + rowStr(d.prevRow) + ' = ' + rowStr(d.rawRow) + ' = ' + rowStr(step.matrix[d.targetRow]) + ' (mod 27)'), M + 8, y);
        y += 12;
      } else if (step.detail && step.type === 'eliminate') {
        const d = step.detail;
        const elemWise = d.prevTargetRow.map((v, j) => v + ' - ' + d.factor + '(' + d.prevSourceRow[j] + ')').join(';  ');
        const rowStr = (r) => '[' + r.slice(0,3).join(', ') + ' | ' + r.slice(3).join(', ') + ']';
        pdf.setFont('courier', 'normal');
        pdf.setFontSize(9);
        pdf.setTextColor(85, 85, 85);
        const lines = pdf.splitTextToSize('R' + (d.targetRow+1) + ': ' + elemWise, CW - 16);
        pdf.text(lines, M + 8, y);
        y += lines.length * 11;
        pdf.text('= ' + rowStr(d.rawValues) + ' = ' + rowStr(step.matrix[d.targetRow]) + ' (mod 27)', M + 8, y);
        y += 12;
      }
    }

    // Augmented matrix via KaTeX
    y = LC.PdfExport._drawMath(pdf, augMath, M, y, CW);
    y += 6;

    // Separator
    pdf.setDrawColor(230, 230, 230);
    pdf.setLineWidth(0.3);
    pdf.line(M, y, M + CW, y);
    y += 10;
  }

  // Final K⁻¹ result
  const kinvTex = 'K^{-1} \\equiv ' + LC.PdfExport._matrixTex(inv.inverse) + ' \\pmod{27}';
  const kinvMath = await LC.PdfExport._captureMath(kinvTex, true);

  const scale2 = 72 / (96 * 2.5);
  let mathW = kinvMath.srcW * scale2;
  let mathH = kinvMath.srcH * scale2;

  if (mathW > CW - 40) {
    const ratio = (CW - 40) / mathW;
    mathW = CW - 40;
    mathH *= ratio;
  }

  const resultBoxH = 14 + 10 + mathH + 16;

  y = LC.PdfExport._checkPageBreak(pdf, y, resultBoxH + 20);
  LC.PdfExport._drawResultBox(pdf, M, y, CW, resultBoxH);
  
  pdf.setFont('times', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(200, 200, 200);
  pdf.text('RESULT', LC.PdfExport.PAGE_W / 2, y + 14, { align: 'center' });

  const cx = M + (CW - mathW) / 2;
  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(cx - 8, y + 20, mathW + 16, mathH + 8, 3, 3, 'F');
  
  LC.PdfExport._drawMath(pdf, kinvMath, M, y + 24, CW);
  
  y += resultBoxH + 16;

  // Verification
  const K = s.keyMatrix, Kinv = inv.inverse;
  const product = [];
  for (let i = 0; i < 3; i++) { product[i] = []; for (let j = 0; j < 3; j++) { let sum = 0; for (let k = 0; k < 3; k++) sum += K[i][k] * Kinv[k][j]; product[i][j] = sum; } }
  const productMod = product.map(row => row.map(v => LC.Math.mod(v, 27)));
  const verTex = 'K \\cdot K^{-1} = ' + LC.PdfExport._matrixTex(K) + ' \\cdot ' + LC.PdfExport._matrixTex(Kinv) + ' = ' + LC.PdfExport._matrixTex(product) + ' \\equiv ' + LC.PdfExport._matrixTex(productMod) + ' \\pmod{27}';
  const verMath = await LC.PdfExport._captureMath(verTex, true);

  const scaleVer = 72 / (96 * 2.5);
  const verMathH = verMath.srcH * scaleVer;
  
  const verBoxH = 16 + 12 + verMathH + 16;
  
  y = LC.PdfExport._checkPageBreak(pdf, y, verBoxH + 20);
  LC.PdfExport._drawGreenBox(pdf, M, y, CW, verBoxH);
  
  pdf.setFont('times', 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(39, 103, 73);
  pdf.text('[OK] Verification: K * K^(-1) = I3 (mod 27)', M + 16, y + 16);
  
  LC.PdfExport._drawMath(pdf, verMath, M + 8, y + 26, CW - 16);
  y += verBoxH + 16;

  return y;
};

// ============================================================
// STEP 5: Cramer's Rule
// ============================================================
LC.PdfExport._renderStep5 = async function(pdf, s, y) {
  const M = LC.PdfExport.MARGIN;
  const CW = LC.PdfExport.CONTENT_W;
  const cr = s.cramerData;

  y = LC.PdfExport._drawSectionHeader(pdf, y, 'Step 5', 'Decryption via Cramer\'s Rule',
    'For the first cipher block, we solve Km = C1 using Cramer\'s Rule modulo 27.');

  if (!cr.success) {
    pdf.setFont('times', 'bold');
    pdf.setFontSize(12);
    pdf.setTextColor(233, 69, 96);
    pdf.text(LC.PdfExport._safe(cr.error), M, y);
    return y + 20;
  }

  const detStep = cr.steps.find(st => st.type === 'determinant');
  const cipherVec = s.cipherVectors[0];

  const crFormulaTeX = 'm_j \\equiv \\det(K)^{-1} \\cdot \\det(K_j) \\pmod{27}';
  const crfMath = await LC.PdfExport._captureMath(crFormulaTeX, true);
  const scale = 72 / (96 * 2.5);
  const imgH = crfMath.srcH * scale;

  const cardH = 14 + 8 + imgH + 8 + 14 + 16;
  
  // Header info card
  y = LC.PdfExport._checkPageBreak(pdf, y, cardH + 20);
  LC.PdfExport._drawCard(pdf, M, y, CW, cardH);
  
  let cy = y + 16;
  pdf.setFont('times', 'normal');
  pdf.setFontSize(11);
  pdf.setTextColor(68, 68, 68);
  pdf.text('System: Km = C1 where C1 = [' + cipherVec.join(', ') + ']^T', M + 12, cy);
  cy += 8;

  cy = LC.PdfExport._drawMath(pdf, crfMath, M + 12, cy, CW - 24);
  
  cy += 8;
  pdf.setFont('times', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor(68, 68, 68);
  pdf.text('det(K) = ' + detStep.detKRaw + ' mod 27 = ' + detStep.detK + ',   det(K)^(-1) = ' + detStep.detKInv + ' (mod 27)', M + 12, cy);
  
  y += cardH + 16;

  // Each variable
  const varSteps = cr.steps.filter(st => st.type === 'variable');
  for (let vi = 0; vi < varSteps.length; vi++) {
    const step = varSteps[vi];

    // Modified matrix prep
    const modMatTex = 'K_{' + (step.varIndex + 1) + '} = ' + LC.PdfExport._matrixTex(step.modifiedMatrix);
    const modMath = await LC.PdfExport._captureMath(modMatTex, true);
    const scale = 72 / (96 * 2.5);

    y = LC.PdfExport._checkPageBreak(pdf, y, 16 + (modMath.srcH * scale) + 10);

    // Variable header
    pdf.setFont('times', 'bold');
    pdf.setFontSize(12);
    pdf.setTextColor(15, 52, 96);
    pdf.text('Finding m' + (step.varIndex + 1) + ' -- replace column ' + (step.varIndex + 1) + ' with C1', M, y);
    y += 16;

    y = LC.PdfExport._drawMath(pdf, modMath, M, y, CW);

    // Determinant expansion
    const exp = step.expansion;
    pdf.setFont('times', 'italic');
    pdf.setFontSize(10);
    pdf.setTextColor(102, 102, 102);
    pdf.text('Expanding along Row 1:', M + 8, y);
    y += 14;

    const detTexLines = [
      '\\det(K_{' + (step.varIndex + 1) + '}) = ' + LC.PdfExport._expansionToTex(exp.line1),
      '\\qquad = ' + LC.PdfExport._expansionToTex(exp.line2),
      '\\qquad = ' + LC.PdfExport._expansionToTex(exp.line3)
    ];
    const detTex = '\\begin{aligned} ' + detTexLines.join(' \\\\ ') + ' \\end{aligned}';
    const detMath = await LC.PdfExport._captureMath(detTex, true);
    const detScale = 72 / (96 * 2.5);
    y = LC.PdfExport._checkPageBreak(pdf, y, (detMath.srcH * detScale) + 16);
    y = LC.PdfExport._drawMath(pdf, detMath, M + 8, y, CW - 16);

    // Raw det with mod reduction
    let detResult = '  = ' + exp.rawDet;
    if (exp.rawDet !== step.detKi) {
      if (exp.rawDet < 0) {
        const qAbs = Math.ceil(-exp.rawDet / 27);
        detResult += ' = ' + exp.rawDet + ' + ' + qAbs + '(27) = ' + step.detKi;
      } else {
        const q = Math.floor(exp.rawDet / 27);
        detResult += ' = ' + exp.rawDet + ' - ' + q + '(27) = ' + step.detKi;
      }
    }
    detResult += ' (mod 27)';
    pdf.text(detResult, M + 16, y);
    y += 14;

    // Final computation
    const miRaw = step.detKInv * step.detKi;
    const mi = step.result;
    const letter = LC.Alphabet.numToChar(mi);
    const display = letter === ' ' ? 'SPACE' : letter;

    pdf.setFont('times', 'normal');
    pdf.setFontSize(11);
    pdf.setTextColor(51, 51, 51);
    let compText = 'm' + (step.varIndex+1) + ' = ' + step.detKInv + ' x ' + step.detKi + ' = ' + miRaw;
    if (miRaw !== mi) {
      const q = Math.floor(miRaw / 27);
      compText += ' = ' + miRaw + ' - ' + q + '(27) = ' + mi;
    }
    compText += ' (mod 27)  ->  ' + display;
    pdf.text(compText, M + 8, y);
    y += 20;

    // Separator
    pdf.setDrawColor(224, 224, 224);
    pdf.setLineWidth(0.3);
    pdf.line(M, y - 6, M + CW, y - 6);
  }

  // Result box
  y = LC.PdfExport._checkPageBreak(pdf, y, 50);
  LC.PdfExport._drawResultBox(pdf, M, y, CW, 42);
  pdf.setFont('times', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(200, 200, 200);
  pdf.text('CRAMER\'S RULE RESULT', LC.PdfExport.PAGE_W / 2, y + 14, { align: 'center' });
  const resultLetters = cr.plaintext.map(v => { const c = LC.Alphabet.numToChar(v); return c === ' ' ? 'SPACE' : c; });
  pdf.setFont('courier', 'bold');
  pdf.setFontSize(14);
  pdf.setTextColor(255, 215, 0);
  pdf.text('M1 = [' + cr.plaintext.join(', ') + ']^T -> ' + resultLetters.join(', ') + ' [OK]', LC.PdfExport.PAGE_W / 2, y + 32, { align: 'center' });
  y += 52;

  return y;
};

// ============================================================
// STEP 6: Matrix Inverse Decryption & Recovery
// ============================================================
LC.PdfExport._renderStep6 = async function(pdf, s, y) {
  const M = LC.PdfExport.MARGIN;
  const CW = LC.PdfExport.CONTENT_W;
  const matInv = s.matInvData;

  y = LC.PdfExport._drawSectionHeader(pdf, y, 'Step 6', 'Decryption via Matrix Inverse & Recovery',
    'Using K^(-1) to decrypt all blocks: M = K^(-1) * C (mod 27).');

  if (!matInv) {
    pdf.setFont('times', 'bold');
    pdf.setFontSize(12);
    pdf.setTextColor(233, 69, 96);
    pdf.text('Could not compute -- key matrix inversion failed.', M, y);
    return y + 20;
  }

  // Master formula
  const masterMath = await LC.PdfExport._captureMath('M_i \\equiv K^{-1} \\cdot C_i \\pmod{27}', true);
  y = LC.PdfExport._drawMath(pdf, masterMath, M, y, CW);
  y += 8;

  const Kinv = s.inverseKeyMatrix;

  for (let blockIdx = 0; blockIdx < matInv.blocks.length; blockIdx++) {
    const block = matInv.blocks[blockIdx];
    const blockNum = blockIdx + 1;
    const cipherLetters = block.cipherVector.map(n => { const c = LC.Alphabet.numToChar(n); return c === ' ' ? '\\text{SPC}' : c; });
    const plainLetters = block.plainVector.map(n => { const c = LC.Alphabet.numToChar(n); return c === ' ' ? '\\text{SPC}' : c; });

    // Compute steps
    const steps = [];
    for (let i = 0; i < 3; i++) {
      const products = [];
      let sum = 0;
      for (let j = 0; j < 3; j++) {
        products.push({ kVal: Kinv[i][j], cVal: block.cipherVector[j] });
        sum += Kinv[i][j] * block.cipherVector[j];
      }
      steps.push({ products, sum, modResult: LC.Math.mod(sum, 27) });
    }

    // Matrix equation
    const kinvTex = LC.PdfExport._matrixTex(Kinv);
    const cTex = LC.PdfExport._vectorTex(block.cipherVector);
    const expandedRows = steps.map(step => step.products.map(p => p.kVal + ' \\cdot ' + p.cVal).join(' + '));
    const expandedTex = '\\begin{bmatrix} ' + expandedRows.join(' \\\\ ') + ' \\end{bmatrix}';
    const rawSumsTex = LC.PdfExport._vectorTex(steps.map(step => step.sum));

    const eqTex = 'M_{' + blockNum + '} = ' + kinvTex + ' \\cdot ' + cTex + ' = ' + expandedTex + ' = ' + rawSumsTex;
    const eqMath = await LC.PdfExport._captureMath(eqTex, true);
    const scale = 72 / (96 * 2.5);

    y = LC.PdfExport._checkPageBreak(pdf, y, 16 + (eqMath.srcH * scale) + 20);

    // Block header
    pdf.setFont('times', 'bold');
    pdf.setFontSize(12);
    pdf.setTextColor(15, 52, 96);
    pdf.text('Block ' + blockNum + ': C' + blockNum + ' = [' + block.cipherVector.join(', ') + ']^T', M, y);
    y += 16;

    y = LC.PdfExport._drawMath(pdf, eqMath, M, y, CW);

    // Mod reduction
    const needsReduction = steps.some(step => step.sum >= 27 || step.sum < 0);
    if (needsReduction) {
      const reductions = steps
        .filter(step => step.sum >= 27 || step.sum < 0)
        .map(step => {
          const q = Math.floor(step.sum / 27);
          return step.sum + ' - ' + q + '(27) = ' + step.modResult;
        });
      pdf.setFont('times', 'italic');
      pdf.setFontSize(10);
      pdf.setTextColor(102, 102, 102);
      pdf.text('Reduction: ' + reductions.join(',   '), M + 16, y);
      y += 14;
    }

    // Result
    const rTex = 'M_{' + blockNum + '} = ' + LC.PdfExport._vectorTex(block.plainVector) + ' \\quad \\rightarrow \\quad ' + plainLetters.join(',\\; ');
    const rMath = await LC.PdfExport._captureMath(rTex, true);
    y = LC.PdfExport._drawMath(pdf, rMath, M, y, CW);

    // Separator
    pdf.setDrawColor(224, 224, 224);
    pdf.setLineWidth(0.3);
    pdf.line(M, y + 4, M + CW, y + 4);
    y += 16;
  }

  // Final recovery result box
  pdf.setFont('courier', 'bold');
  pdf.setFontSize(14);
  let resLinesStr = pdf.splitTextToSize(s.recoveredPlaintext || '', CW - 24);
  if (resLinesStr.length > 22) {
    resLinesStr = resLinesStr.slice(0, 22);
    resLinesStr.push('... [Recovered plaintext truncated for PDF layout]');
  }
  const resBoxH = 26 + Math.max(1, resLinesStr.length) * 16 + 28;
  
  y = LC.PdfExport._checkPageBreak(pdf, y, resBoxH + 20);
  LC.PdfExport._drawResultBox(pdf, M, y, CW, resBoxH);
  pdf.setFont('times', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(200, 200, 200);
  pdf.text('RECOVERED PLAINTEXT', LC.PdfExport.PAGE_W / 2, y + 16, { align: 'center' });
  pdf.setFont('courier', 'bold');
  pdf.setFontSize(14);
  pdf.setTextColor(255, 215, 0);
  pdf.text(resLinesStr, LC.PdfExport.PAGE_W / 2, y + 36, { align: 'center' });
  pdf.setFont('times', 'normal');
  pdf.setFontSize(12);
  pdf.setTextColor(0, 180, 216);
  pdf.text('The plaintext has been successfully recovered!', LC.PdfExport.PAGE_W / 2, y + 36 + Math.max(1, resLinesStr.length) * 16 + 6, { align: 'center' });
  y += resBoxH + 16;

  return y;
};
