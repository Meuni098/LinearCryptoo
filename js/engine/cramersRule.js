// ============================================================
// LinearCrypt — Cramer's Rule Decryption
// ============================================================
window.LC = window.LC || {};
LC.Cramer = {};

LC.Cramer.decryptBlock = function(K, C, m) {
  m = m || 27;
  const detK = LC.Math.mod(LC.Math.det3x3(K), m);
  const detKInv = LC.Math.modInverse(detK, m);

  if (detKInv === null) {
    return { success: false, plaintext: null, steps: [], error: `det(K) mod ${m} = ${detK} has no inverse.` };
  }

  const steps = [];
  const plaintext = [];

  const detKRaw = LC.Math.det3x3(K);
  steps.push({ type: 'determinant', detK, detKRaw, detKInv,
    label: `det(K) = ${detKRaw}, det(K) mod ${m} = ${detK}`,
    detKInvLabel: `det(K)⁻¹ mod ${m} = ${detKInv} (${detK} × ${detKInv} ≡ 1 mod ${m})` });

  for (let i = 0; i < 3; i++) {
    const Ki = LC.Math.copyMatrix(K);
    for (let row = 0; row < 3; row++) Ki[row][i] = C[row];
    const detKiRaw = LC.Math.det3x3(Ki);
    const detKi = LC.Math.mod(detKiRaw, m);
    const miRaw = detKi * detKInv;
    const mi = LC.Math.mod(miRaw, m);
    plaintext.push(mi);

    // Detailed 3×3 determinant expansion along Row 1 (cofactor method)
    const [[a,b,c],[d,e,f],[g,h,ii]] = Ki;
    const line1 = `${a}(${e}·${ii} − ${f}·${h}) − ${b}(${d}·${ii} − ${f}·${g}) + ${c}(${d}·${h} − ${e}·${g})`;
    const m1 = e*ii - f*h;
    const m2 = d*ii - f*g;
    const m3 = d*h - e*g;
    const line2 = `${a}(${m1}) − ${b}(${m2}) + ${c}(${m3})`;
    const p1 = a * m1, p2 = b * m2, p3 = c * m3;
    const line3 = `${p1} − ${p2} + ${p3}`;

    steps.push({
      type: 'variable',
      varIndex: i,
      varName: `m${i+1}`,
      modifiedMatrix: Ki,
      replacedColumn: i,
      detKiRaw: detKiRaw,
      detKi: detKi,
      result: mi,
      miRaw: miRaw,
      detKInv: detKInv,
      expansion: { line1, line2, line3, rawDet: p1 - p2 + p3 },
      computation: `m${i+1} ≡ ${detKInv} × ${detKi} = ${miRaw} = ${miRaw} mod ${m} = ${mi}`
    });
  }

  return { success: true, plaintext, steps, error: null };
};
