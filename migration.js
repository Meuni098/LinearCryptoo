const fs = require('fs');

try {
const content = fs.readFileSync('home.md', 'utf8');

const headMatch = content.match(/<head\b[^>]*>([\s\S]*?)<\/head>/);
const headContent = headMatch ? headMatch[1] : '';
const fontsMatch = headContent.match(/<link href="https:\/\/fonts\.googleapis\.com\/css2[^>]+>/);
const fonts = fontsMatch ? fontsMatch[0] : '';

const styleMatch = content.match(/<style>([\s\S]*?)<\/style>/);
const stylesCss = styleMatch ? styleMatch[1] : '';

const bodyMatch = content.match(/<body\b[^>]*>([\s\S]*?)<\/body>/);
const bodyContent = bodyMatch ? bodyMatch[1] : '';

const mobileMenuMatch = bodyContent.match(/(<div class="mobile-menu"[\s\S]*?<\/nav>)/);
const mobileMenu = mobileMenuMatch ? mobileMenuMatch[1] : '';

const mainMatch = bodyContent.match(/<main>([\s\S]*?)<\/main>/);
let mainContent = mainMatch ? mainMatch[1] : '';

const footerMatch = bodyContent.match(/(<footer>[\s\S]*?<\/footer>)/);
let footerContent = footerMatch ? footerMatch[1] : '';

const scriptMatch = bodyContent.match(/<script>([\s\S]*?)<\/script>/);
const scriptContent = scriptMatch ? scriptMatch[1] : '';

// Routing optimizations
let mm = mobileMenu.replace(/href="#" class="btn-cta">Open Lab/g, 'href="#/end-to-end" class="btn-cta">Open Lab')
                   .replace(/href="#" class="mobile-cta">Open the Lab/g, 'href="#/end-to-end" class="mobile-cta">Open the Lab')
                   .replace(/href="#"/g, 'href="#/"');

mainContent = mainContent.replace(/href="#" class="btn-primary">Open the Lab/g, 'href="#/end-to-end" class="btn-primary">Open the Lab')
                         .replace(/href="#" class="btn-primary">Open LinearCrypt Lab/g, 'href="#/end-to-end" class="btn-primary">Open LinearCrypt Lab')
                         .replace(/href="#"/g, 'href="#/"');

footerContent = footerContent.replace(/href="#"/g, 'href="#/"');

const landingJs = `// ============================================================
// LinearCrypt — Landing / Welcome Page
// ============================================================
window.LC = window.LC || {};
LC.Landing = {};

LC.Landing.render = function(container) {
  container.innerHTML = \`
${mainContent.replace(/`/g, '\\`').replace(/\$/g, '\\$')}
  \`;

  setTimeout(() => {
${scriptContent.replace(/`/g, '\\`').replace(/\$/g, '\\$')}
  }, 100);
};
`;
fs.writeFileSync('js/ui/landing.js', landingJs);

let indexHtml = fs.readFileSync('index.html', 'utf8');
if (fonts) indexHtml = indexHtml.replace(/<link href="https:\/\/fonts\.googleapis\.com\/css2[^"]+" rel="stylesheet">/, fonts);
indexHtml = indexHtml.replace(/<!-- ===== NAVBAR REMOVED ===== -->/, '<!-- ===== NAVBAR ===== -->\n' + mm + '\n\n  <!-- ===== MAIN APP CONTAINER ===== -->');
indexHtml = indexHtml.replace(/<!-- ===== FOOTER ===== -->[\s\S]*?<!-- ===== APP SCRIPTS/, '<!-- ===== FOOTER ===== -->\n' + footerContent + '\n\n  <!-- ===== APP SCRIPTS');
fs.writeFileSync('index.html', indexHtml);

let currStyles = fs.readFileSync('css/styles.css', 'utf8');
if (!currStyles.includes('/* ===== IMPORTED HOME.MD CSS ===== */')) {
  fs.appendFileSync('css/styles.css', '\n\n/* ===== IMPORTED HOME.MD CSS ===== */\n' + stylesCss);
}

console.log('DONE REPL');
} catch(e) { console.error(e); }
