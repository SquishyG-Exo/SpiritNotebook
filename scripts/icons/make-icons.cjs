/**
 * Renders the brand icon (scripts/icons/icon.html) to every PNG the app needs.
 * Requires Playwright + Chromium: `NODE_PATH=$(npm root -g) node scripts/icons/make-icons.cjs`
 * or `npx -p playwright node scripts/icons/make-icons.cjs` after `npx playwright install chromium`.
 */
const path = require('path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..', '..');
const html = 'file://' + path.join(__dirname, 'icon.html');

const targets = [
  // Web / PWA
  ['public/icons/icon-192.png', 'rounded', 192],
  ['public/icons/icon-512.png', 'rounded', 512],
  ['public/icons/icon-maskable-512.png', 'square', 512],
  ['public/icons/apple-touch-icon.png', 'square', 180],
  ['public/icons/favicon-32.png', 'rounded', 32],
  // Expo native config (app.json)
  ['assets/images/icon.png', 'square', 1024],
  ['assets/images/favicon.png', 'rounded', 48],
  ['assets/images/splash-icon.png', 'glyph', 512],
  ['assets/images/android-icon-foreground.png', 'glyph', 1024],
  ['assets/images/android-icon-background.png', 'bg', 1024],
  ['assets/images/android-icon-monochrome.png', 'mono', 1024],
];

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1100, height: 1100 }, deviceScaleFactor: 1 });
  for (const [file, variant, size] of targets) {
    await page.goto(`${html}?variant=${variant}&size=${size}`);
    await page.waitForTimeout(50);
    const stage = await page.$('#stage');
    await stage.screenshot({ path: path.join(root, file), omitBackground: true });
    console.log('wrote', file);
  }
  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
