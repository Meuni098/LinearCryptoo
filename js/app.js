// ============================================================
// LinearCrypt — Main App Controller & SPA Router
// ============================================================
window.LC = window.LC || {};
LC.App = {};

// Global state
LC.App.state = {
  plaintext: '',
  keyMatrix: [[2,1,1],[1,4,1],[1,1,8]],
  numericalValues: [],
  vectors: [],
  paddingMask: [],
  paddingCount: 0,
  cipherVectors: [],
  ciphertext: '',
  encryptionData: null,
  inverseData: null,
  inverseKeyMatrix: null,
  cramerData: null,
  matInvData: null,
  recoveredPlaintext: '',
  currentStep: 0,
  computed: false
};

// Custom Notification Modal
LC.App.showAlert = function(message) {
  let overlay = document.getElementById('lc-modal-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'lc-modal-overlay';
    overlay.className = 'lc-modal-overlay';
    const modal = document.createElement('div');
    modal.className = 'lc-modal';
    const content = document.createElement('div');
    content.className = 'lc-modal-content';
    const btnContainer = document.createElement('div');
    btnContainer.className = 'lc-modal-actions';
    const okBtn = document.createElement('button');
    okBtn.className = 'lc-modal-btn';
    okBtn.innerText = 'OK';
    okBtn.onclick = () => {
      overlay.classList.remove('visible');
      setTimeout(() => overlay.remove(), 250);
    };
    btnContainer.appendChild(okBtn);
    modal.appendChild(content);
    modal.appendChild(btnContainer);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
  }
  const contentEl = overlay.querySelector('.lc-modal-content');
  contentEl.innerHTML = message.split('\\n').join('<br>');
  setTimeout(() => overlay.classList.add('visible'), 10);
};

// Route table
LC.App.routes = {
  '/': 'home',
  '/end-to-end': 'end-to-end',
  '/modules': 'modules'
};

// Navigate to a specific step (from module selector)
LC.App.navigateToStep = function(step) {
  // Store the desired step so endToEnd can jump after compute
  LC.App.state.pendingStep = step - 1;
  window.location.hash = '#/end-to-end';
};

// Router
LC.App.route = function() {
  const hash = window.location.hash || '#/';
  
  // If the hash is an internal anchor on the landing page (e.g. #features)
  // and the landing page is already rendered, just let the browser scroll.
  if (!hash.startsWith('#/') && hash !== '') {
    if (document.querySelector('.hero')) {
      return; 
    }
  }

  let path = '/';
  if (hash.startsWith('#/')) {
    path = hash.replace('#', '') || '/';
  }

  const container = document.getElementById('app');

  // Update nav links
  document.querySelectorAll('.nav-link').forEach(link => {
    const nav = link.getAttribute('data-nav');
    if (nav === 'home' && path === '/') link.classList.add('active');
    else if (nav === 'end-to-end' && path === '/end-to-end') link.classList.add('active');
    else if (nav === 'modules' && path === '/modules') link.classList.add('active');
    else link.classList.remove('active');
  });

  // Manage Navbar visibility
  const navLinks = document.querySelector('.nav-links');
  const navRight = document.querySelector('.nav-right');
  const navToggle = document.querySelector('.nav-toggle');

  if (navLinks && navRight) {
    const isLanding = (path !== '/end-to-end' && path !== '/modules');
    const displayStyle = isLanding ? '' : 'none';
    navLinks.style.display = displayStyle;
    navRight.style.display = displayStyle;
    if (navToggle) navToggle.style.display = isLanding ? '' : 'none';
  }

  // Render page
  switch (path) {
    case '/end-to-end':
      LC.EndToEnd.render(container);
      window.scrollTo(0, 0);
      break;
    case '/modules':
      LC.Modules.render(container);
      window.scrollTo(0, 0);
      break;
    default:
      LC.Landing.render(container);
      // For the first load of landing page, if there's a hash, scroll to it, otherwise scroll to top.
      if (!hash.startsWith('#/') && hash !== '') {
        setTimeout(() => {
          const el = document.querySelector(hash);
          if (el) el.scrollIntoView();
        }, 100);
      } else {
        window.scrollTo(0, 0);
      }
      break;
  }
};

// Init
LC.App.init = function() {
  window.addEventListener('hashchange', LC.App.route);
  LC.App.route();
};

// Boot
document.addEventListener('DOMContentLoaded', LC.App.init);
