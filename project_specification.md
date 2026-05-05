# Project Specification: LinearCrypt

## 1. Executive Summary

- **Product:** LinearCrypt — An interactive educational system providing a deep, transparent visualization of the Hill Cipher's complete cryptographic lifecycle using step-by-step mathematical breakdowns.
- **Problem:** Students and educators lack an intuitive, hands-on tool to understand how linear algebra concepts (matrix multiplication, modular arithmetic, Gauss-Jordan elimination, Cramer's Rule) apply to real cryptographic systems. Existing resources are static textbook explanations or opaque code that hides the underlying math.
- **Solution:** A web-based application written in deep Tagalog (Filipino) that takes any plaintext message and walks the user through the entire Hill Cipher process — from character-to-number encoding, vector partitioning, encryption via matrix multiplication mod 27, key matrix inversion via Gauss-Jordan Elimination, and decryption through both Cramer's Rule and matrix-inverse multiplication — all with granular, animated step-by-step visualizations. Each mathematical concept is also available as a standalone module for isolated experimentation.
- **Platform:** Web (Single-Page Application, client-side only)
- **Target Launch:** Academic submission / educational deployment
- **Scope:** MVP — full end-to-end Hill Cipher visualization with standalone module exploration

---

## 2. User Personas & Workflows

### Persona 1: Mag-aaral (Student)
- **Role:** College student studying linear algebra or cryptography
- **Primary goal:** Understand *how* and *why* the Hill Cipher works by seeing each mathematical step
- **Key workflow:**
  1. Opens the app, greeted by a landing/welcome screen in Tagalog
  2. Navigates to the **End-to-End Flow** section
  3. Inputs a plaintext message (e.g., "KUMUSTA KA")
  4. Views **Step 1: Message Conversion** — sees each character mapped to its numerical value (A=1…Z=26, space/period=0)
  5. Views **Step 2: Vector Partitioning** — sees the numerical values grouped into 3×1 column vectors with space-padding
  6. Views **Step 3: Encryption** — watches the matrix multiplication $C \equiv K \cdot M \pmod{27}$ animated block-by-block for the first 3 blocks
  7. Views **Step 4: Inverse Key Matrix** — follows Gauss-Jordan Elimination to derive $K^{-1}$, including the augmented matrix, each row operation, and the modular inverse of the determinant in $\mathbb{Z}_{27}$
  8. Views **Step 5: Decryption (Cramer's Rule)** — sees the first cipher block solved via Cramer's Rule modulo 27
  9. Views **Step 6: Decryption (Matrix Inverse)** — sees subsequent blocks decrypted via $M \equiv K^{-1} \cdot C \pmod{27}$
  10. Reviews the full plaintext recovery and confirms the round-trip
- **Frequency:** Multiple times during a course/semester
- **Pain points:** Textbooks show formulas but not the intermediate arithmetic; existing tools just output results without explanation

### Persona 2: Guro (Educator/Instructor)
- **Role:** Professor or teacher demonstrating cryptographic concepts in class
- **Primary goal:** Use the app as a live classroom demonstration tool to explain Hill Cipher mechanics
- **Key workflow:**
  1. Opens the app and navigates to a **Standalone Module** (e.g., "Gauss-Jordan Elimination")
  2. Inputs a custom 3×3 key matrix
  3. Steps through each row operation with the class, pausing and explaining at each stage
  4. Switches to the **Encryption Module** to demonstrate a specific multiplication
  5. Uses the **End-to-End Flow** for a complete walkthrough at the end of the lesson
- **Frequency:** Several times per semester, during lectures
- **Pain points:** Needs a tool that can isolate individual concepts without forcing students through the entire pipeline

---

## 3. Feature Specification

### MVP Features (Must Ship)

---

#### 3.1 Message Conversion Module
- **Description:** Converts plaintext input into numerical values using the 27-character alphabet (A-Z = 1-26, space/period = 0) and displays the mapping visually.
- **User story:** "Bilang mag-aaral, gusto kong makita kung paano nagiging numero ang bawat letra para maintindihan ko ang encoding na ginagamit ng Hill Cipher."
- **Inputs:** Any plaintext string (letters A-Z, spaces, periods)
- **Outputs:** A visual table/grid showing each character → numerical value mapping
- **Business rules:**
  - Only uppercase A-Z, spaces, and periods are valid; lowercase is auto-uppercased
  - Invalid characters are stripped or flagged with a warning
  - The alphabet mapping is fixed: A=1, B=2, …, Z=26, space=0, period=0
- **Edge cases:**
  - Empty input → show validation message
  - Very long input → handled gracefully with scrolling; all blocks processed
  - Input with only spaces → produces all zeros
- **Dependencies:** None (standalone capable)

---

#### 3.2 Vector Partitioning Module
- **Description:** Takes the numerical array from message conversion and partitions it into 3×1 column vectors, applying space-padding (0) to ensure the last vector is complete.
- **User story:** "Bilang mag-aaral, gusto kong makita kung paano hinahati sa 3×1 vectors ang mga numero, kasama ang padding, para sa matrix multiplication."
- **Inputs:** Array of numerical values (from Message Conversion)
- **Outputs:** Visual display of each 3×1 column vector with padding highlighted
- **Business rules:**
  - Group numerals into groups of 3
  - If the final group has fewer than 3 values, pad with 0s
  - Display padding values in a visually distinct style (highlighted/colored differently)
- **Edge cases:**
  - Input length is an exact multiple of 3 → no padding needed
  - Input length is 1 or 2 → single vector with 2 or 1 padding zeros
- **Dependencies:** Message Conversion Module (3.1)

---

#### 3.3 Encryption Module
- **Description:** Demonstrates the Hill Cipher encryption using the congruence $C \equiv K \cdot M \pmod{27}$ with a granular, step-by-step breakdown of the matrix multiplication for the first three blocks.
- **User story:** "Bilang mag-aaral, gusto kong makita ang bawat hakbang ng matrix multiplication at modular arithmetic para maintindihan ko kung paano nag-e-encrypt ang Hill Cipher."
- **Inputs:**
  - 3×3 key matrix $K$ (user-provided or default)
  - Array of 3×1 plaintext vectors (from Vector Partitioning)
- **Outputs:**
  - Animated step-by-step multiplication showing: row × column dot products, intermediate sums, mod 27 reduction, and resulting ciphertext values
  - First 3 blocks: full granular breakdown
  - Remaining blocks: computed and displayed in summary form
  - Final ciphertext string
- **Business rules:**
  - Key matrix must be 3×3 with integer entries in [0, 26]
  - Key matrix must be invertible modulo 27 (gcd(det(K), 27) = 1); validate on input
  - All arithmetic is performed in $\mathbb{Z}_{27}$
  - Step-by-step animation for blocks 1-3; batch computation for remaining blocks
- **Edge cases:**
  - Non-invertible key matrix → display error explaining why and suggest a valid key
  - Single block of plaintext → only one block to animate
- **Dependencies:** Vector Partitioning Module (3.2)

---

#### 3.4 Inverse Key Matrix Module (Gauss-Jordan Elimination)
- **Description:** A dedicated "laboratory" that finds the inverse key matrix $K^{-1}$ through Gauss-Jordan Elimination, revealing every step: augmented matrix $[K | I]$, each modular row operation, and the modular inverse of the determinant within $\mathbb{Z}_{27}$.
- **User story:** "Bilang mag-aaral, gusto kong sundan ang bawat row operation ng Gauss-Jordan Elimination para maintindihan ko kung paano kinukuha ang inverse matrix sa modular arithmetic."
- **Inputs:** 3×3 key matrix $K$
- **Outputs:**
  - Initial augmented matrix $[K | I]$
  - Each row operation displayed as a labeled step (e.g., $R_2 \leftarrow R_2 - 3R_1 \pmod{27}$)
  - The intermediate matrix state after each operation
  - Calculation of $\det(K) \pmod{27}$ and its modular multiplicative inverse
  - Final result: $K^{-1} \pmod{27}$
- **Business rules:**
  - All row operations are modular (mod 27)
  - Show the extended Euclidean algorithm or trial method for finding $\det(K)^{-1} \pmod{27}$
  - If determinant has no modular inverse (gcd ≠ 1), display explanation and halt
- **Edge cases:**
  - Zero determinant → clearly explain the matrix is singular
  - Determinant coprime to 27 but requiring multiple row swaps → handle row permutations
- **Dependencies:** None (standalone capable)

---

#### 3.5 Decryption via Cramer's Rule Module
- **Description:** Demonstrates decryption of the first cipher block using Cramer's Rule modulo 27, illustrating the resolution of linear systems.
- **User story:** "Bilang mag-aaral, gusto kong makita kung paano gumagana ang Cramer's Rule sa modular arithmetic para ma-decrypt ang isang cipher block."
- **Inputs:**
  - 3×3 key matrix $K$
  - First cipher block (3×1 vector)
- **Outputs:**
  - Step-by-step computation of the determinant of $K$
  - Construction of each modified matrix (replacing columns with the cipher vector)
  - Computation of each modified determinant
  - Division (modular inverse multiplication) to find each plaintext value
  - Final recovered plaintext vector for block 1
- **Business rules:**
  - All operations in $\mathbb{Z}_{27}$
  - Show the formula: $m_i = \det(K_i) \cdot \det(K)^{-1} \pmod{27}$
  - Label each step clearly with mathematical notation
- **Edge cases:**
  - Same as Inverse Key Matrix edge cases for non-invertible matrices
- **Dependencies:** Encryption Module (3.3) for generating cipher blocks, or standalone with manual input

---

#### 3.6 Decryption via Matrix Inverse Multiplication Module
- **Description:** Demonstrates decryption of subsequent cipher blocks using $M \equiv K^{-1} \cdot C \pmod{27}$, the efficient standard method.
- **User story:** "Bilang mag-aaral, gusto kong makita ang difference ng Cramer's Rule at matrix-inverse multiplication para sa decryption."
- **Inputs:**
  - Inverse key matrix $K^{-1}$ (from Module 3.4)
  - Cipher blocks (from Module 3.3)
- **Outputs:**
  - Step-by-step matrix multiplication of $K^{-1} \cdot C$ for each block
  - Mod 27 reduction at each step
  - Recovered plaintext vectors
  - Final plaintext string with padding removed
- **Business rules:**
  - Use the already-computed $K^{-1}$ — do not recompute
  - In the end-to-end flow, blocks 2+ use this method while block 1 uses Cramer's Rule
  - Display the recovered numerical values and their character mappings
- **Edge cases:**
  - Padding zeros at the end → visually indicate which characters are padding (not part of original message)
- **Dependencies:** Inverse Key Matrix Module (3.4), Encryption Module (3.3)

---

#### 3.7 End-to-End Flow
- **Description:** The unified pipeline that chains all modules together: Message Input → Conversion → Vectorization → Encryption → Key Inversion → Decryption (Cramer's Rule for Block 1, Matrix Inverse for remaining blocks) → Plaintext Recovery.
- **User story:** "Bilang mag-aaral, gusto kong makita ang buong proseso ng Hill Cipher mula sa plaintext hanggang ciphertext at pabalik, sa isang tuloy-tuloy na daloy."
- **Inputs:** Plaintext message + Key matrix (or use default)
- **Outputs:** Complete animated walkthrough through all 6 stages with navigation controls
- **Business rules:**
  - Users can navigate forward/backward between stages
  - Each stage shows the output from the previous stage as input context
  - The default key matrix should be a known-good invertible 3×3 matrix
  - Provide a "Skip to Results" option for users who just want the output
- **Edge cases:**
  - User changes the key matrix mid-flow → restart from encryption stage
  - User changes the plaintext mid-flow → restart from conversion stage
- **Dependencies:** All modules (3.1–3.6)

---

#### 3.8 Standalone Module Section
- **Description:** A dedicated section where each individual lesson (Message Conversion, Vector Partitioning, Encryption, Gauss-Jordan Elimination, Cramer's Rule, Matrix Inverse Decryption) can be accessed and computed independently.
- **User story:** "Bilang mag-aaral, gusto kong mag-experiment sa isang partikular na module nang hindi ko kailangang dumaan sa buong flow — para mas maintindihan ko ang bawat bahagi nang hiwalay."
- **Inputs:** Varies per module — users provide their own inputs for isolated computation
- **Outputs:** Same as each individual module, but without pipeline context
- **Business rules:**
  - Each module is fully self-contained with its own input form
  - Modules provide sample/default values for quick experimentation
  - Navigation makes it easy to jump between standalone modules
- **Edge cases:**
  - User inputs inconsistent data (e.g., wrong-sized matrix) → clear validation messages
- **Dependencies:** Individual module implementations (3.1–3.6)

---

### V1.1 Features (Next Release)
- **Customizable Alphabet Size:** Allow users to change the modulus from 27 to other values (e.g., 26, 29) and see how it affects the cipher
- **Key Matrix Generator:** Auto-generate valid (invertible mod n) key matrices of size 2×2 or 3×3
- **Quiz/Exercise Mode:** Interactive questions that test the student's understanding of each step (e.g., "What is the value of $C_2$ after mod 27?")
- **Step Bookmark/Export:** Allow users to export a specific step's visualization as an image or PDF for study notes
- **Bilingual Toggle:** Option to switch between Tagalog and English for broader accessibility

### Future Considerations
- Support for larger key matrices (4×4, 5×5) with corresponding larger block sizes
- Comparison mode showing Hill Cipher vs. other classical ciphers (Caesar, Vigenère, Playfair)
- Integration with an LMS (Moodle, Google Classroom) for assignment submission
- Mobile-native app version for offline use
- Audio narration of steps in Tagalog for accessibility

### Anti-Features (Explicitly Out of Scope)
- **No user accounts or authentication** — this is a standalone educational tool, not a SaaS platform
- **No server-side processing** — all cryptographic computations happen client-side in the browser
- **No real-world encryption** — this is for educational purposes only; the Hill Cipher is not secure for actual use
- **No arbitrary matrix sizes in MVP** — locked to 3×3 key matrices
- **No automated grading** — the tool demonstrates, it does not assess

---

## 4. Technical Architecture

### Stack

| Layer | Technology | Justification |
|---|---|---|
| Frontend | HTML5 + Vanilla JavaScript (ES6+) | Simple educational app; no framework overhead needed. All computation is client-side. Modular JS with ES6 modules for clean separation of concerns. |
| Styling | Vanilla CSS3 with CSS Custom Properties | Maximum control over animations and responsive design. CSS variables for theming. No build step required. |
| Math Rendering | KaTeX (via CDN) | Lightweight, fast LaTeX rendering for displaying mathematical formulas ($C \equiv K \cdot M \pmod{27}$, etc.). Far faster than MathJax. |
| Animations | CSS Transitions + JavaScript (requestAnimationFrame) | Smooth step-by-step animations for matrix operations without heavy animation libraries. |
| Build Tool | None (vanilla) or Vite (if modules grow) | Start with no build; introduce Vite only if module bundling becomes necessary. |
| Hosting | GitHub Pages or Vercel (static) | Free, fast, no backend needed. Static HTML/CSS/JS deployment. |
| Version Control | Git + GitHub | Standard for academic collaboration and submission. |

### System Architecture

```
┌──────────────────────────────────────────────┐
│                  Browser (Client)             │
│                                              │
│  ┌─────────────┐  ┌──────────────────────┐   │
│  │   UI Layer   │  │   Math Engine Layer   │   │
│  │             │  │                      │   │
│  │ - Landing   │  │ - alphabet.js        │   │
│  │ - End-to-End│◄─┤ - vectorizer.js      │   │
│  │ - Standalone│  │ - encryption.js      │   │
│  │ - Navigation│  │ - gaussJordan.js     │   │
│  │             │  │ - cramersRule.js     │   │
│  └──────┬──────┘  │ - matrixInverse.js   │   │
│         │         │ - modularArith.js    │   │
│         ▼         └──────────────────────┘   │
│  ┌──────────────┐                            │
│  │ Visualization │                            │
│  │    Layer      │                            │
│  │              │                            │
│  │ - stepRenderer│                            │
│  │ - animator    │                            │
│  │ - katexHelper │                            │
│  └──────────────┘                            │
│                                              │
│  ┌──────────────┐                            │
│  │  State Mgmt   │ (simple JS object/store)   │
│  └──────────────┘                            │
└──────────────────────────────────────────────┘
```

- **UI Layer:** Handles DOM rendering, navigation between sections (End-to-End vs. Standalone Modules), and user input forms.
- **Math Engine Layer:** Pure functions that perform all cryptographic and mathematical computations. No DOM dependencies — fully testable in isolation.
- **Visualization Layer:** Bridges the math engine and the UI. Takes computation results and renders step-by-step visualizations with KaTeX-formatted formulas and CSS animations.
- **State Management:** Simple JavaScript object that tracks the current session state (plaintext, key matrix, current step, computed results). No Redux/Vuex needed.

### Data Model (Key Entities)

Since this is a client-side application with no persistence, these are in-memory data structures:

- **Session State**
  - `plaintext: string` — user's input message
  - `keyMatrix: number[][]` — 3×3 key matrix
  - `numericalValues: number[]` — character-to-number encoded array
  - `vectors: number[][]` — array of 3×1 column vectors (with padding)
  - `cipherVectors: number[][]` — encrypted vectors
  - `ciphertext: string` — resulting cipher string
  - `inverseKeyMatrix: number[][]` — computed $K^{-1}$
  - `determinant: number` — det(K) mod 27
  - `determinantInverse: number` — det(K)$^{-1}$ mod 27
  - `decryptedVectors: number[][]` — recovered plaintext vectors
  - `currentStep: number` — current visualization step index
  - `currentModule: string` — which module is active

- **Step Record** (for visualization timeline)
  - `stepId: number`
  - `title: string` — Tagalog label for the step
  - `description: string` — Tagalog explanation
  - `mathContent: string` — LaTeX formula string
  - `matrixState: number[][]` — matrix state at this step
  - `operation: string` — the operation performed (e.g., "R2 ← R2 - 3R1 mod 27")
  - `highlight: object` — which cells/values to highlight

### API Design Philosophy

Not applicable — this is a client-side only application with no server API. All computation is performed in JavaScript within the browser.

### Third-Party Integrations

| Service | Purpose | Tier/Cost |
|---|---|---|
| KaTeX (CDN) | LaTeX math formula rendering | Free / Open Source |
| Google Fonts (Inter/Noto Sans Filipino) | Typography for Tagalog content | Free |
| GitHub Pages / Vercel | Static site hosting | Free tier |

---

## 5. Design Direction

- **Aesthetic:** Educational + Premium Modern — think *Brilliant.org* meets *3Blue1Brown* visual style. Clean, spacious layouts with focus on mathematical content. Deep Tagalog interface with a warm, approachable tone. Reference apps: Brilliant.org (step-by-step math), Desmos (interactive math), 3Blue1Brown's Manim visualizations (matrix operations).
- **Color palette:**
  - **Primary:** `#1A1A2E` (deep navy) — main background for dark-mode math display
  - **Secondary:** `#16213E` (darker navy) — panels and cards
  - **Accent:** `#0F3460` (royal blue) — interactive elements and highlights
  - **Highlight:** `#E94560` (vibrant coral/red) — active step indicators, important values
  - **Success:** `#00B4D8` (cyan) — completed steps, correct results
  - **Text Primary:** `#EAEAEA` (near-white) — body text on dark backgrounds
  - **Text Muted:** `#A0A0B0` (soft gray) — secondary labels
  - **Matrix Cell:** `#FFD93D` (golden yellow) — highlighted matrix cells during computation
  - **Padding Indicator:** `#6C757D` (gray) — padding zeros
- **Typography:**
  - Headings: **Inter** (700/600 weight) — clean, modern, excellent readability
  - Body: **Noto Sans** — excellent Filipino/Tagalog character support
  - Math/Mono: **KaTeX default** for formulas, **JetBrains Mono** for matrix grids and numerical displays
- **Themes:** Dark mode primary (optimal for math visualization against a dark canvas), with an optional light mode toggle
- **Key screens (in priority order):**
  1. Landing/Welcome Screen — app title, brief Tagalog description, navigation
  2. End-to-End Flow Dashboard — input form + step timeline navigator
  3. Step Visualization Panel — the main stage where math animations play out
  4. Standalone Module Selector — grid/card layout to pick a module
  5. Individual Module View — input form + step-by-step output for each standalone module
  6. Inverse Key Matrix Laboratory — the most complex visualization with Gauss-Jordan steps
- **Responsive strategy:** Desktop-first (primary use is classroom/laptop), with responsive breakpoints at 1024px (tablet) and 768px (mobile). On mobile, matrices display in a scrollable container with pinch-to-zoom support.

---

## 6. Security & Compliance

- **Security tier:** MVP/Internal — this is a client-side educational tool with no user data, no authentication, and no server.
- **Authentication:** None required
- **Authorization:** None — all users have the same access
- **Data handling:** No personal data is collected, stored, or transmitted. All computation happens local to the browser. No cookies, no analytics tracking, no external API calls (except CDN assets).
- **Rate limiting:** Not applicable (no server)
- **Audit logging:** Not applicable
- **Content Security Policy:** Set CSP headers to allow only KaTeX CDN and Google Fonts as external resources

---

## 7. Infrastructure & DevOps

- **Environments:**
  - **Dev:** Local file server or `npx serve` / Vite dev server
  - **Production:** GitHub Pages or Vercel static deployment
- **Deployment strategy:** Push to `main` branch triggers automatic deployment via GitHub Pages or Vercel integration. No staging environment needed for an educational tool of this scope.
- **Monitoring:** Not required for MVP. Console error logging in development.
- **Backup:** Git repository serves as the backup. No database to back up.
- **Scaling considerations:** Static files served via CDN — effectively infinite scaling. No server-side computation.

---

## 8. Project Phases & Milestones

| Phase | Focus | Duration | Key Deliverables |
|---|---|---|---|
| 0 | Project setup & design system | 1-2 days | Repository structure, CSS design tokens, typography, color palette, base layout (landing + navigation shell) |
| 1 | Math Engine — Core computation modules | 3-4 days | `alphabet.js`, `vectorizer.js`, `modularArith.js`, `encryption.js`, `gaussJordan.js`, `cramersRule.js`, `matrixInverse.js` — all pure functions with unit tests |
| 2 | Visualization Layer | 3-4 days | `stepRenderer.js`, `animator.js`, `katexHelper.js` — step-by-step rendering with KaTeX formulas, CSS animations for matrix operations |
| 3 | End-to-End Flow UI | 2-3 days | Input form, step timeline navigator, wiring all modules together in sequence, forward/backward navigation |
| 4 | Standalone Module Section | 2-3 days | Individual module pages with isolated input forms and standalone computation views, module selector/grid |
| 5 | Polish & Final Integration | 2-3 days | Responsive design, Tagalog content review, animation polish, edge case handling, cross-browser testing |
| 6 | Documentation & Submission | 1 day | README, usage instructions, deployment to GitHub Pages, final QA pass |

**Total estimated duration: 14-20 days**

---

## 9. Open Questions & Risks

### Open Questions
1. **Default Key Matrix:** Which specific 3×3 matrix should be used as the default? It must be invertible mod 27. A common educational choice is: $K = \begin{bmatrix} 6 & 24 & 1 \\ 13 & 16 & 10 \\ 20 & 17 & 15 \end{bmatrix}$  — confirm with the instructor/user.
2. **Tagalog Depth:** Should the interface be exclusively in Tagalog, or should mathematical terms (e.g., "determinant," "modular inverse") also be translated? Standard practice in Filipino math education is to keep English technical terms.
3. **Matrix Input Method:** Should users type values into individual cells, or paste a comma-separated format? Or both?
4. **Animation Speed:** Should the user be able to control animation speed (slow/normal/fast) or pause/play?
5. **Mobile Priority:** Is mobile support critical for MVP, or can it be deferred to V1.1?

### Risks & Mitigation

| Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|
| Complex animation logic causes performance issues on low-end devices | Medium | Medium | Use CSS transforms (GPU-accelerated) instead of JS-based layout animations; debounce step transitions |
| KaTeX fails to render complex modular arithmetic notation | Low | Low | Pre-test all LaTeX strings; have fallback plain-text rendering |
| Gauss-Jordan step generation produces too many steps for large matrices | Medium | Low | For MVP, matrix size is locked at 3×3 (max ~15-20 row operations) — manageable |
| Tagalog translations are awkward or unclear | Medium | Medium | Have a native Tagalog speaker review all UI text; keep mathematical terms in English where standard |
| Scope creep from adding too many visualization features | High | Medium | Strict adherence to MVP feature list; defer all V1.1 items |

---

## 10. Success Metrics

| Metric | Target | How to Measure |
|---|---|---|
| **Feature completeness** | All 8 MVP features functional | Manual QA checklist |
| **Mathematical accuracy** | 100% — all computations verified against known Hill Cipher examples | Unit tests for math engine; manual verification with textbook examples |
| **End-to-end test** | Encrypt → Decrypt a message and recover the original plaintext | Automated test + manual verification |
| **Cross-browser support** | Works on Chrome, Firefox, Edge (latest versions) | Manual testing on all 3 browsers |
| **Tagalog content quality** | All UI text reviewed by a native speaker | Peer review |
| **Page load time** | < 2 seconds on a standard connection | Chrome DevTools Lighthouse audit |
| **Mobile responsiveness** | Usable (not necessarily optimal) on 768px+ screens | Manual testing on tablet viewport |
| **Student comprehension** | Users can follow the full encryption-decryption cycle without external help | User testing with 2-3 students (if possible) |

---

## 11. Recommended Skills

| Phase | Skills | Purpose |
|---|---|---|
| Phase 0: Project Setup & Design System | `clean-code`, `cc-skill-coding-standards`, `frontend-design`, `ui-ux-pro-max` | Establish project structure, CSS design system with tokens, visual design direction |
| Phase 1: Math Engine | `javascript-mastery`, `clean-code`, `testing-patterns`, `tdd-workflow` | Build pure computation modules (modular arithmetic, matrix operations) with TDD approach |
| Phase 2: Visualization Layer | `frontend-design`, `scroll-experience`, `web-performance-optimization`, `claude-d3js-skill` | Step-by-step animated rendering, KaTeX integration, performant visual transitions |
| Phase 3: End-to-End Flow UI | `cc-skill-frontend-patterns`, `web-design-guidelines`, `onboarding-cro`, `i18n-localization` | Wire modules into seamless user flow, Tagalog localization, user experience polish |
| Phase 4: Standalone Modules | `frontend-design`, `core-components`, `documentation-templates` | Reusable module components, consistent standalone experiences, internal documentation |
| Phase 5: Polish & Integration | `web-performance-optimization`, `lint-and-validate`, `code-review-checklist`, `systematic-debugging` | Performance audit, code quality review, cross-browser validation, bug fixes |
| Phase 6: Deployment & Docs | `documentation-templates`, `vercel-deployment`, `seo-fundamentals` | README, deployment configuration, basic SEO (meta tags, title) |
