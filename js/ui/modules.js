// ============================================================
// LinearCrypt — Module Selector Page
// ============================================================
window.LC = window.LC || {};
LC.Modules = {};

LC.Modules.render = function(container) {
  container.innerHTML = `
    <div class="container page-section" style="padding-top:var(--sp-10)">
      <h1 class="text-display" style="margin-bottom:var(--sp-2)">Module Selector</h1>
      <p class="text-body-lg" style="max-width:600px;margin-bottom:var(--sp-10)">
        Select a cryptographic operation to begin. Each module represents a core step in the linear algebraic encryption process.
      </p>
      <div class="grid-3col" id="module-grid"></div>
    </div>
  `;

  const modules = [
    { accent: 'cyan', icon: 'format_size', title: 'Message Conversion', desc: 'Translate plaintext characters into numerical values using standard encoding schemas.', tags: ['A→1', 'Z→26'], step: 1 },
    { accent: 'blue', icon: 'view_column', title: 'Vector Partitioning', desc: 'Segment numerical data into 3×1 column vectors for matrix multiplication.', tags: ['3×1', 'PADDING'], step: 2 },
    { accent: 'coral', icon: 'enhanced_encryption', title: 'Encryption', desc: 'Apply the Hill Cipher matrix multiplication to obscure the original message vectors.', tags: ['C = K·M mod 27'], step: 3 },
    { accent: 'yellow', icon: 'functions', title: 'Gauss-Jordan Elimination', desc: 'Perform elementary row operations to find the inverse of the encoding matrix.', tags: ['[K|I] → [I|K⁻¹]'], step: 4 },
    { accent: 'cyan', icon: 'grid_3x3', title: "Cramer's Rule", desc: "Alternative method for solving systems using determinants.", tags: ['det(Kᵢ)/det(K)'], step: 5 },
    { accent: 'blue', icon: 'lock_open', title: 'Inverse Decryption', desc: 'Recover the original message by multiplying ciphertext by the inverse key matrix.', tags: ['M = K⁻¹·C'], step: 6 }
  ];

  const grid = document.getElementById('module-grid');
  modules.forEach((m, i) => {
    const accentColors = { cyan: 'var(--cyan)', blue: 'var(--primary)', coral: 'var(--coral)', yellow: 'var(--yellow)' };
    const color = accentColors[m.accent];
    const card = document.createElement('div');
    card.className = 'module-card animate-fade-in-up stagger-' + (i + 1);
    card.setAttribute('data-accent', m.accent);
    card.onclick = function() { LC.App.navigateToStep(m.step); };
    card.innerHTML = `
      <div class="flex justify-between items-center mb-6">
        <span class="material-symbols-outlined module-icon" style="color:${color};font-size:40px;font-variation-settings:'wght' 200">${m.icon}</span>
        <span class="material-symbols-outlined module-arrow">arrow_outward</span>
      </div>
      <h2 class="text-h2" style="margin-bottom:var(--sp-2)">${m.title}</h2>
      <p class="text-body" style="flex:1">${m.desc}</p>
      <div class="flex gap-2 mt-4">
        ${m.tags.map(t => '<span class="module-tag">' + t + '</span>').join('')}
      </div>
    `;
    grid.appendChild(card);
  });
};
