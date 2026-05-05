// ============================================================
// LinearCrypt — Vector Partitioning
// ============================================================
window.LC = window.LC || {};
LC.Vectorizer = {};

LC.Vectorizer.partition = function(nums, size) {
  size = size || 3;
  const vectors = [];
  let paddingCount = 0;
  for (let i = 0; i < nums.length; i += size) {
    const chunk = nums.slice(i, i + size);
    while (chunk.length < size) { chunk.push(0); paddingCount++; }
    vectors.push(chunk);
  }
  if (vectors.length === 0) { vectors.push(new Array(size).fill(0)); paddingCount = size; }
  return { vectors, paddingCount };
};

LC.Vectorizer.getPaddingMask = function(nums, size) {
  size = size || 3;
  const totalNeeded = Math.max(Math.ceil(nums.length / size) * size, size);
  const mask = [];
  for (let i = 0; i < totalNeeded; i += size) {
    const group = [];
    for (let j = 0; j < size; j++) group.push(i + j >= nums.length);
    mask.push(group);
  }
  return mask;
};
