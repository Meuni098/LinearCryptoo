// ============================================================
// LinearCrypt — Gauss-Jordan Elimination
// ============================================================
window.LC = window.LC || {};
LC.GaussJordan = {};

LC.GaussJordan.invertMatrix = function(K, m) {
  m = m || 27;
  const n = K.length;
  const det = LC.Math.det3x3(K);
  const detMod = LC.Math.mod(det, m);
  const detInv = LC.Math.modInverse(detMod, m);

  if (detInv === null) {
    return { success: false, inverse: null, steps: [], determinant: det, detMod, detInverse: null,
      error: `det(K) mod ${m} = ${detMod}. No modular inverse exists. The matrix is not invertible mod ${m}.` };
  }

  const aug = [];
  const I = LC.Math.identityMatrix(n);
  for (let i = 0; i < n; i++) aug[i] = [...K[i].map(v => LC.Math.mod(v, m)), ...I[i]];

  const steps = [{
    operation: 'Initial augmented matrix [K | I]',
    type: 'initial',
    matrix: aug.map(r => [...r]),
    detail: null
  }];

  for (let col = 0; col < n; col++) {
    let pivotRow = -1;
    for (let row = col; row < n; row++) {
      if (LC.Math.mod(aug[row][col], m) !== 0) { pivotRow = row; break; }
    }
    if (pivotRow === -1) {
      return { success: false, inverse: null, steps, determinant: det, detMod, detInverse: null, error: 'Matrix is singular.' };
    }
    if (pivotRow !== col) {
      [aug[col], aug[pivotRow]] = [aug[pivotRow], aug[col]];
      steps.push({
        operation: `R${col+1} ↔ R${pivotRow+1}`,
        type: 'swap',
        matrix: aug.map(r => [...r]),
        detail: { row1: col, row2: pivotRow }
      });
    }

    // Scale pivot row
    const pivotVal = LC.Math.mod(aug[col][col], m);
    const pivotInv = LC.Math.modInverse(pivotVal, m);
    if (pivotInv === null) {
      return { success: false, inverse: null, steps, determinant: det, detMod, detInverse: null, error: `Cannot invert pivot ${pivotVal} mod ${m}.` };
    }
    const prevRow = [...aug[col]];
    for (let j = 0; j < 2*n; j++) aug[col][j] = LC.Math.mod(aug[col][j] * pivotInv, m);

    // Compute raw (before mod) for display
    const rawRow = prevRow.map(v => v * pivotInv);

    steps.push({
      operation: `R${col+1} ← ${pivotInv} · R${col+1} (mod ${m})`,
      type: 'scale',
      matrix: aug.map(r => [...r]),
      detail: {
        targetRow: col,
        factor: pivotInv,
        pivotVal: pivotVal,
        pivotPos: [col, col],
        prevRow: prevRow,
        rawRow: rawRow,
        explanation: `multiply by ${pivotVal}⁻¹ so the (${col+1},${col+1}) pivot becomes 1`
      }
    });

    // Eliminate other rows
    for (let row = 0; row < n; row++) {
      if (row === col) continue;
      const factor = LC.Math.mod(aug[row][col], m);
      if (factor === 0) continue;
      const prevTargetRow = [...aug[row]];
      const prevSourceRow = [...aug[col]];
      for (let j = 0; j < 2*n; j++) aug[row][j] = LC.Math.mod(aug[row][j] - factor * aug[col][j], m);

      // Compute raw values for display
      const rawValues = prevTargetRow.map((v, j) => v - factor * prevSourceRow[j]);

      steps.push({
        operation: `R${row+1} ← R${row+1} − ${factor}·R${col+1} (mod ${m})`,
        type: 'eliminate',
        matrix: aug.map(r => [...r]),
        detail: {
          targetRow: row,
          sourceRow: col,
          factor: factor,
          prevTargetRow: prevTargetRow,
          prevSourceRow: prevSourceRow,
          rawValues: rawValues,
          explanation: `eliminate column ${col+1} entry in R${row+1}`
        }
      });
    }
  }

  const inverse = [];
  for (let i = 0; i < n; i++) inverse[i] = aug[i].slice(n);

  return { success: true, inverse, steps, determinant: det, detMod, detInverse: detInv, error: null };
};

LC.GaussJordan.isKeyValid = function(K, m) {
  m = m || 27;
  const det = LC.Math.det3x3(K);
  return LC.Math.modInverse(LC.Math.mod(det, m), m) !== null;
};
