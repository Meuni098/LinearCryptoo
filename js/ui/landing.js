// ============================================================
// LinearCrypt — Landing / Welcome Page
// ============================================================
window.LC = window.LC || {};
LC.Landing = {};

LC.Landing.render = function(container) {
  container.innerHTML = `


<!-- HERO -->
<section class="hero">
  <div class="hero-inner">
    <!-- CHANGE 1: Added hero-left class for centering -->
    <div class="hero-left">
      <div class="badge"><span class="badge-dot"></span>Interactive Educational System</div>
      <h1>Decode the<br>Math of<br><em>Encryption</em><span class="cursor" aria-hidden="true"></span></h1>
      <div class="hero-sub-formula">C ≡ K · M (mod 27)</div>
      <p class="hero-desc">LinearCrypt is a transparent, step-by-step laboratory for the Hill Cipher. Watch every matrix multiplication, modular reduction, and row operation unfold — live, as you type.</p>
      <div class="hero-actions">
        <a href="#/end-to-end" class="btn-primary">Open the Lab</a>
        <a href="#features" class="btn-secondary">Explore Features</a>
      </div>
      <div class="hero-trust">
        <span class="trust-item">Free to use</span>
        <span class="trust-item">Step-by-step breakdowns</span>
        <span class="trust-item">No prior knowledge needed</span>
      </div>
    </div>

  </div>
</section>

<!-- STATS -->
<div class="stats">
  <div class="stats-row">
    <div class="stat-cell reveal"><span class="stat-val">Z₂₇</span><span class="stat-label">Modular Field</span></div>
    <div class="stat-cell reveal"><span class="stat-val">3×3</span><span class="stat-label">Key Matrix</span></div>
    <div class="stat-cell reveal"><span class="stat-val">6</span><span class="stat-label">Standalone Modules</span></div>
    <div class="stat-cell reveal"><span class="stat-val">2</span><span class="stat-label">Decryption Methods</span></div>
  </div>
</div>

<!-- FEATURES -->
<section id="features">
  <div class="wrap">
    <div class="reveal">
      <div class="sec-tag">Core Features</div>
      <h2>Every Operation,<br><em>Fully Exposed</em></h2>
      <p class="sec-sub">No black boxes. Every scalar, every row operation, every modular step is shown in full.</p>
    </div>
    <div class="feat-grid reveal">
      <div class="feat-card">
        <div class="feat-num">01</div>
        <div class="feat-icon">M→N</div>
        <h3>Message Encoding</h3>
        <p>Map plaintext to a 27-character numerical alphabet — A–Z as 1–26, space and period as 0 — then chunk into padded 3×1 column vectors.</p>
        <span class="feat-tag">Alphabet Mapping</span>
      </div>
      <div class="feat-card">
        <div class="feat-num">02</div>
        <div class="feat-icon">K·M</div>
        <h3>Live Encryption</h3>
        <p>Execute C ≡ K·M (mod 27) in real time. Full scalar arithmetic breakdowns for the first three blocks show exactly how plaintext becomes ciphertext.</p>
        <span class="feat-tag">Linear Transform</span>
      </div>
      <div class="feat-card">
        <div class="feat-num">03</div>
        <div class="feat-icon">K⁻¹</div>
        <h3>Gauss-Jordan Inversion</h3>
        <p>Find K⁻¹ via the augmented matrix [K|I]. Every row swap, scale, and elimination is annotated step by step, including the Z₂₇ determinant inverse.</p>
        <span class="feat-tag">Modular Arithmetic</span>
      </div>
      <div class="feat-card">
        <div class="feat-num">04</div>
        <div class="feat-icon">Δᵢ/Δ</div>
        <h3>Cramer's Rule</h3>
        <p>Block 1 decryption solved as a modular linear system via Cramer's Rule — determinant ratios over Z₂₇ shown with full intermediate values.</p>
        <span class="feat-tag">System of Equations</span>
      </div>
      <div class="feat-card">
        <div class="feat-num">05</div>
        <div class="feat-icon">M≡</div>
        <h3>Dual Decryption</h3>
        <p>Two decryption paths compared side by side: Cramer's Rule for block 1, and inverse matrix multiplication M ≡ K⁻¹·C (mod 27) for all remaining blocks.</p>
        <span class="feat-tag">Comparative Analysis</span>
      </div>
      <div class="feat-card">
        <div class="feat-num">06</div>
        <div class="feat-icon">λ</div>
        <h3>Standalone Modules</h3>
        <p>Isolate any component — vector encoding, encryption, Gauss-Jordan, Cramer's Rule, or modular determinant — in its own independent sandbox.</p>
        <span class="feat-tag">Modular Lab</span>
      </div>
    </div>
  </div>
</section>

<!-- TIMELINE -->
<section id="timeline">
  <div class="wrap">
    <div class="reveal">
      <div class="sec-tag">The Pipeline</div>
      <h2>Your Message's<br><em>Complete Journey</em></h2>
      <p class="sec-sub">From raw text to ciphertext and back — every transformation tracked.</p>
    </div>
    <div class="tl-track reveal">
      <div class="tl-cell">
        <div class="tl-node">M</div>
        <div class="tl-label">Plaintext Input</div>
        <div class="tl-desc">Text mapped to 27-char alphabet values</div>
      </div>
      <div class="tl-cell">
        <div class="tl-node">→N</div>
        <div class="tl-label">Vector Partition</div>
        <div class="tl-desc">Chunked into padded 3×1 column vectors</div>
      </div>
      <div class="tl-cell">
        <div class="tl-node">K·M</div>
        <div class="tl-label">Encryption</div>
        <div class="tl-desc">Matrix multiplication mod 27 per block</div>
      </div>
      <div class="tl-cell">
        <div class="tl-node">K⁻¹</div>
        <div class="tl-label">Key Inversion</div>
        <div class="tl-desc">Gauss-Jordan over Z₂₇ with annotations</div>
      </div>
      <div class="tl-cell">
        <div class="tl-node">M′</div>
        <div class="tl-label">Decryption</div>
        <div class="tl-desc">Cramer's Rule + inverse multiplication</div>
      </div>
    </div>
  </div>
</section>

<!-- PROCESS -->
<section id="process">
  <div class="wrap">

    <div class="process-header">
      <div class="sec-tag">Step by Step</div>
      <h2>Complete <em>Cryptographic</em> Lifecycle</h2>
      <p class="sec-sub">Follow your message through every transformation in real time.</p>
    </div>

    <div class="scatter-grid" id="scatterGrid">

      <!-- Card 1 — wide left -->
      <div class="scatter-card">
        <span class="scatter-num">01</span>
        <div class="scatter-icon">M→N</div>
        <h4>Plaintext → Numeric Vectors</h4>
        <p>Input text is mapped to the 27-char alphabet — A–Z as 1–26, space as 0 — then chunked into padded 3×1 column vectors ready for matrix operations.</p>
      </div>

      <!-- Card 2 — mid -->
      <div class="scatter-card">
        <span class="scatter-num">02</span>
        <div class="scatter-icon">K·M</div>
        <h4>Matrix Multiplication (mod 27)</h4>
        <p>Each vector block multiplies with key matrix K. Full scalar arithmetic breakdowns shown for the first three blocks.</p>
      </div>

      <!-- Card 3 — narrow right -->
      <div class="scatter-card">
        <span class="scatter-num">03</span>
        <div class="scatter-icon">K⁻¹</div>
        <h4>Key Inversion via Gauss-Jordan</h4>
        <p>K⁻¹ computed with full row operation annotation and modular determinant inverse within Z₂₇.</p>
      </div>

      <!-- Card 4 — narrow left -->
      <div class="scatter-card">
        <span class="scatter-num">04</span>
        <div class="scatter-icon">Δ/Δᵢ</div>
        <h4>Cramer's Rule for Block 1</h4>
        <p>First cipher block solved as a modular linear system — determinant ratios over Z₂₇ with full intermediate values.</p>
      </div>

      <!-- Card 5 — wide right, with animated visual -->
      <div class="scatter-card wide-card">
        <div class="card-content">
          <span class="scatter-num">05</span>
          <div class="scatter-icon">M≡</div>
          <h4>Inverse Multiplication for All Others</h4>
          <p>All remaining blocks decrypt via M ≡ K⁻¹·C (mod 27), completing the full decryption pass efficiently with annotated steps.</p>
        </div>
        <div class="card-visual">
          <span class="fchain-block">C</span>
          <span class="fchain-arr">→</span>
          <span class="fchain-block">K⁻¹·C</span>
          <span class="fchain-arr">→</span>
          <span class="fchain-block">mod 27</span>
          <span class="fchain-arr">→</span>
          <span class="fchain-block">M′</span>
        </div>
      </div>

    </div>
  </div>
</section>

<!-- MODULES -->
<section id="modules">
  <div class="wrap">
    <div class="reveal">
      <div class="sec-tag">Standalone Modules</div>
      <h2>Isolate. Experiment.<br><em>Understand.</em></h2>
      <p class="sec-sub">Each mathematical component lives in its own independent sandbox. Input your own values and see exactly what changes.</p>
    </div>
    <div class="modules-grid">
      <div class="mod-card reveal" tabindex="0" role="button">
        <div class="mod-icon">∑</div>
        <div class="mod-info">
          <h4>Vector Conversion Lab</h4>
          <p>Input any string and watch it decompose into 27-alphabet numerals, then partition into padded 3×1 column vectors.</p>
          <span class="mod-formula">text → [n₁, n₂, n₃]ᵀ mod 27</span>
        </div>
      </div>
      <div class="mod-card reveal" tabindex="0" role="button">
        <div class="mod-icon">K·</div>
        <div class="mod-info">
          <h4>Encryption Module</h4>
          <p>Supply any key matrix K and message vector M. See the full scalar arithmetic of each row multiplication before modular reduction.</p>
          <span class="mod-formula">C ≡ K · M (mod 27)</span>
        </div>
      </div>
      <div class="mod-card reveal" tabindex="0" role="button">
        <div class="mod-icon">[K|I]</div>
        <div class="mod-info">
          <h4>Gauss-Jordan Inverter</h4>
          <p>Step through augmented matrix row operations over Z₂₇. Every swap, scale, and elimination fully annotated with modular arithmetic.</p>
          <span class="mod-formula">det⁻¹(K) · adj(K) mod 27</span>
        </div>
      </div>
      <div class="mod-card reveal" tabindex="0" role="button">
        <div class="mod-icon">Δᵢ/Δ</div>
        <div class="mod-info">
          <h4>Cramer's Rule Solver</h4>
          <p>Provide a 3×3 coefficient matrix and RHS vector. Compute each replaced-column determinant and the final solution vector modulo 27.</p>
          <span class="mod-formula">xᵢ = det(Kᵢ) · det(K)⁻¹ mod 27</span>
        </div>
      </div>
      <div class="mod-card reveal" tabindex="0" role="button">
        <div class="mod-icon">K⁻¹·</div>
        <div class="mod-info">
          <h4>Decryption Module</h4>
          <p>Enter ciphertext vectors alongside K⁻¹. Watch the inverse multiplication restore each plaintext block with full intermediate breakdowns.</p>
          <span class="mod-formula">M ≡ K⁻¹ · C (mod 27)</span>
        </div>
      </div>
      <div class="mod-card reveal" tabindex="0" role="button">
        <div class="mod-icon">det</div>
        <div class="mod-info">
          <h4>Modular Determinant</h4>
          <p>Test any 3×3 matrix for invertibility within Z₂₇. Compute the determinant, find gcd(det, 27), and derive the modular multiplicative inverse.</p>
          <span class="mod-formula">det(K) mod 27 · x ≡ 1 mod 27</span>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- CTA -->
<section id="cta">
  <div class="cta-layout">
    <div class="reveal">
      <div class="sec-tag">Ready to Begin?</div>
      <h2>Start Decoding<br><em>Right Now</em></h2>
      <p style="font-size:16px;color:var(--text-2);max-width:420px;margin-top:16px;line-height:1.8">Type any message. Watch it encrypt, transform, and decrypt — every matrix operation explained at each step. No account required.</p>
      <div style="display:flex;gap:10px;margin-top:30px;flex-wrap:wrap">
        <a href="#/end-to-end" class="btn-primary">Open LinearCrypt Lab</a>
        <a href="#features" class="btn-secondary">Browse Features</a>
      </div>
    </div>
    <div class="cta-form-card reveal">
      <h3>Try it instantly</h3>
      <p class="form-hint">Enter a message below to preview the encoding — no sign-up needed.</p>
      <label class="field-label" for="demo-msg">Your Message</label>
      <input class="field-input" id="demo-msg" type="text" placeholder="e.g. HELLO WORLD" maxlength="30" autocomplete="off" spellcheck="false">
      <label class="field-label" for="demo-key">Key (optional)</label>
      <input class="field-input" id="demo-key" type="text" placeholder="Default key pre-loaded" maxlength="20" autocomplete="off">
      <a href="#/" class="btn-primary" style="display:block;text-align:center;width:100%">Encrypt &amp; Visualize →</a>
      <p class="form-note">Free · No sign-up · Runs in your browser</p>
    </div>
  </div>
</section>
<!-- FOOTER -->
<footer style="text-align: center; padding: 40px 20px; color: var(--text-2); font-size: 14px; margin-top: auto;">
  <p>Created by Eunice Angeline Y. Cruz</p>
</footer>

  `;

  setTimeout(() => {

const toggle = document.getElementById('navToggle');
const menu   = document.getElementById('mobileMenu');
toggle.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  toggle.classList.toggle('open', open);
  toggle.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-hidden', String(!open));
});
menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  menu.classList.remove('open');
  toggle.classList.remove('open');
  toggle.setAttribute('aria-expanded', 'false');
  menu.setAttribute('aria-hidden', 'true');
}));

const observer = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('visible'), i * 60);
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.06 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

const cells = document.querySelectorAll('#keyMatrix .mat-cell');
const origVals = Array.from(cells).map(c => c.textContent);
setInterval(() => {
  const idx = Math.floor(Math.random() * cells.length);
  const cell = cells[idx];
  cell.textContent = Math.floor(Math.random() * 27);
  cell.style.background = '#1c2060';
  cell.style.borderColor = '#c7d2fe';
  cell.style.color = '#e0e7ff';
  setTimeout(() => {
    cell.textContent = origVals[idx];
    cell.style.background = '';
    cell.style.borderColor = '';
    cell.style.color = '';
  }, 650);
}, 1400);

document.querySelectorAll('.mod-card[tabindex]').forEach(card => {
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.click(); }
  });
});

// Scatter cards scroll-in animation
const scatterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      scatterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.scatter-card').forEach(card => scatterObserver.observe(card));

  }, 100);
};
