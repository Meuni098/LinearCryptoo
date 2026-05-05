// ============================================================
// LinearCrypt — Hill Cipher Encryption
// ============================================================
window.LC = window.LC || {};
LC.Encryption = {};

LC.Encryption.encryptBlock = function(K, M, m) {
  return LC.Math.matVecMul(K, M, m || 27);
};

LC.Encryption.encryptAll = function(K, vectors, m) {
  return vectors.map(v => LC.Encryption.encryptBlock(K, v, m));
};

LC.Encryption.generateBlockSteps = function(K, M, m) {
  m = m || 27;
  const steps = [];
  for (let row = 0; row < K.length; row++) {
    const products = K[row].map((val, col) => ({ kVal: val, mVal: M[col], product: val * M[col] }));
    const sum = products.reduce((s, p) => s + p.product, 0);
    const result = LC.Math.mod(sum, m);
    steps.push({
      row, products, sum, modResult: result,
      expression: products.map(p => `(${p.kVal} × ${p.mVal})`).join(' + '),
      sumExpression: `${products.map(p => p.product).join(' + ')} = ${sum}`,
      modExpression: `${sum} mod ${m} = ${result}`
    });
  }
  return steps;
};

LC.Encryption.encryptWithSteps = function(K, vectors, detailCount, m) {
  detailCount = detailCount || 3; m = m || 27;
  const cipherVectors = [], detailedBlocks = [], summaryBlocks = [];
  vectors.forEach((v, idx) => {
    const cipher = LC.Encryption.encryptBlock(K, v, m);
    cipherVectors.push(cipher);
    if (idx < detailCount) {
      detailedBlocks.push({ blockIndex: idx, plainVector: [...v], cipherVector: [...cipher], steps: LC.Encryption.generateBlockSteps(K, v, m) });
    } else {
      summaryBlocks.push({ blockIndex: idx, plainVector: [...v], cipherVector: [...cipher] });
    }
  });
  return { cipherVectors, detailedBlocks, summaryBlocks };
};
