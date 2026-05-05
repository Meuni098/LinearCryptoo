// ============================================================
// LinearCrypt — Modular Arithmetic Utilities
// All operations in ℤ_m (default m = 27)
// ============================================================
window.LC = window.LC || {};
LC.Math = {};

LC.Math.mod = function(a, m) {
  m = m || 27;
  return ((a % m) + m) % m;
};

LC.Math.gcd = function(a, b) {
  a = Math.abs(a); b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a;
};

LC.Math.extendedGcd = function(a, b) {
  if (b === 0) return { g: a, x: 1, y: 0 };
  const { g, x, y } = LC.Math.extendedGcd(b, a % b);
  return { g, x: y, y: x - Math.floor(a / b) * y };
};

LC.Math.modInverse = function(a, m) {
  m = m || 27;
  a = LC.Math.mod(a, m);
  if (a === 0) return null;
  const { g, x } = LC.Math.extendedGcd(a, m);
  if (g !== 1) return null;
  return LC.Math.mod(x, m);
};

LC.Math.det3x3 = function(M) {
  const [[a,b,c],[d,e,f],[g,h,i]] = M;
  return a*(e*i - f*h) - b*(d*i - f*g) + c*(d*h - e*g);
};

LC.Math.det3x3Mod = function(M, m) {
  return LC.Math.mod(LC.Math.det3x3(M), m || 27);
};

LC.Math.matVecMul = function(M, v, m) {
  m = m || 27;
  return M.map(row => LC.Math.mod(row.reduce((s, val, j) => s + val * v[j], 0), m));
};

LC.Math.copyMatrix = function(M) { return M.map(r => [...r]); };

LC.Math.identityMatrix = function(n) {
  const I = [];
  for (let i = 0; i < n; i++) {
    I[i] = [];
    for (let j = 0; j < n; j++) I[i][j] = i === j ? 1 : 0;
  }
  return I;
};
