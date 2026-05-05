// ============================================================
// LinearCrypt — Alphabet Encoder/Decoder
// ============================================================
window.LC = window.LC || {};
LC.Alphabet = {};

const ALPHA = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ';

LC.Alphabet.charToNum = function(c) {
  if (c === ' ') return 0;
  const idx = c.toUpperCase().charCodeAt(0) - 64;
  return (idx >= 1 && idx <= 26) ? idx : -1;
};

LC.Alphabet.numToChar = function(n) {
  if (n === 0) return ' ';
  return (n >= 1 && n <= 26) ? ALPHA[n] : '?';
};

LC.Alphabet.encodeMessage = function(text) {
  const cleaned = text.toUpperCase().replace(/[^A-Z ]/g, '');
  return Array.from(cleaned).map(LC.Alphabet.charToNum);
};

LC.Alphabet.decodeMessage = function(nums) {
  return nums.map(LC.Alphabet.numToChar).join('');
};

LC.Alphabet.validateInput = function(text) {
  const upper = text.toUpperCase();
  const cleaned = upper.replace(/[^A-Z ]/g, '');
  const warnings = [];
  
  if (cleaned.length === 0) {
    warnings.push('Please enter at least one character (A-Z or space).');
    return { valid: false, cleaned, warnings };
  }
  
  if (cleaned.length !== upper.length) {
    warnings.push('Some invalid characters were removed.');
  }
  
  if (cleaned.length > 80) {
    warnings.push('Message is too long! Please limit the text to 80 characters to prevent performance drops during matrix rendering.');
    return { valid: false, cleaned, warnings };
  }

  return { valid: true, cleaned, warnings };
};

LC.Alphabet.getAlphabetMap = function() {
  const map = [{ char: 'space', display: '_', num: 0 }];
  for (let i = 1; i <= 26; i++) map.push({ char: ALPHA[i], display: ALPHA[i], num: i });
  return map;
};
