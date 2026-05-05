// ============================================================
// LinearCrypt — Matrix Inverse Decryption
// ============================================================
window.LC = window.LC || {};
LC.MatInv = {};

LC.MatInv.decryptBlock = function(Kinv, C, m) {
  return LC.Math.matVecMul(Kinv, C, m || 27);
};

LC.MatInv.decryptAll = function(Kinv, cipherVectors, m) {
  return cipherVectors.map(c => LC.MatInv.decryptBlock(Kinv, c, m));
};

LC.MatInv.decryptWithSteps = function(Kinv, cipherVectors, m) {
  m = m || 27;
  const decryptedVectors = [], blocks = [];
  cipherVectors.forEach((C, idx) => {
    const M = LC.MatInv.decryptBlock(Kinv, C, m);
    decryptedVectors.push(M);
    const steps = [];
    for (let row = 0; row < Kinv.length; row++) {
      const products = Kinv[row].map((val, col) => ({ kVal: val, cVal: C[col], product: val * C[col] }));
      const sum = products.reduce((s, p) => s + p.product, 0);
      const result = LC.Math.mod(sum, m);
      steps.push({ row, products, sum, modResult: result,
        expression: products.map(p => `(${p.kVal} × ${p.cVal})`).join(' + '),
        sumExpression: `${products.map(p => p.product).join(' + ')} = ${sum}`,
        modExpression: `${sum} mod ${m} = ${result}` });
    }
    blocks.push({ blockIndex: idx, cipherVector: [...C], plainVector: [...M], steps });
  });
  return { decryptedVectors, blocks };
};
