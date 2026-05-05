// ============================================================
// LinearCrypt — KaTeX Helpers
// ============================================================
window.LC = window.LC || {};
LC.Katex = {};

LC.Katex.render = function(latex, el, displayMode) {
  if (typeof katex !== 'undefined') {
    katex.render(latex, el, { throwOnError: false, displayMode: displayMode !== false });
  } else { el.textContent = latex; }
};

LC.Katex.toHTML = function(latex, displayMode) {
  if (typeof katex !== 'undefined') {
    return katex.renderToString(latex, { throwOnError: false, displayMode: !!displayMode });
  }
  return '<code>' + latex + '</code>';
};

LC.Katex.matrix = function(M) {
  const rows = M.map(r => r.join(' & ')).join(' \\\\ ');
  return '\\begin{bmatrix} ' + rows + ' \\end{bmatrix}';
};

LC.Katex.vector = function(v) {
  return '\\begin{bmatrix} ' + v.join(' \\\\ ') + ' \\end{bmatrix}';
};
