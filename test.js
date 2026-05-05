const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:8000');
  
  // Wait until scripts are loaded
  await page.waitForTimeout(2000);
  
  // Initialize state
  await page.evaluate(() => {
    window.LC.App.state.plaintext = "HELLO";
    window.LC.App.state.computed = true;
  });

  const imgData = await page.evaluate(async () => {
    return (await window.LC.PdfExport._captureMath('\\\\begin{bmatrix} 25 & 17 & 15 \\\\\\\\ 17 & 6 & 14 \\\\\\\\ 15 & 14 & 10 \\\\end{bmatrix}', true)).imgData;
  });
  
  const base64Data = imgData.replace(/^data:image\/png;base64,/, '');
  require('fs').writeFileSync('test-matrix.png', base64Data, 'base64');
  
  await browser.close();
})();
