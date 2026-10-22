import { chromium } from 'playwright';

const BASE = 'http://127.0.0.1:4173';
const browser = await chromium.launch({
  args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));

await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForSelector('[data-hero-core] canvas', { timeout: 15000 });
await page.waitForTimeout(2500);

const report = await page.evaluate(async () => {
  const canvas = document.querySelector('[data-hero-core] canvas');
  const gl = canvas?.getContext('webgl2') || canvas?.getContext('webgl');
  const h1 = document.querySelector('h1');
  const hero = h1?.closest('section');
  const rect = canvas?.getBoundingClientRect();

  // Count frames for one second to confirm the scene is actually running.
  const frames = await new Promise((resolve) => {
    let n = 0;
    const start = performance.now();
    const tick = () => {
      n += 1;
      if (performance.now() - start < 1000) requestAnimationFrame(tick);
      else resolve(n);
    };
    requestAnimationFrame(tick);
  });

  return {
    canvas: rect ? { w: Math.round(rect.width), h: Math.round(rect.height) } : null,
    webgl: Boolean(gl),
    renderer: gl ? gl.getParameter(gl.VERSION) : null,
    pointerEvents: canvas ? getComputedStyle(canvas).pointerEvents : null,
    h1: h1?.innerText.replace(/\s+/g, ' ').slice(0, 90),
    h1Visible: h1 ? getComputedStyle(h1).visibility !== 'hidden' : false,
    heroHeight: hero ? Math.round(hero.getBoundingClientRect().height) : 0,
    overflowX: document.documentElement.scrollWidth > window.innerWidth,
    hasVideoPlaceholder: document.body.innerHTML.includes('HERO VIDEO'),
    frames,
  };
});

// Scroll to confirm dispersal does not break the page or throw.
await page.mouse.wheel(0, 1200);
await page.waitForTimeout(800);
const afterScroll = await page.evaluate(() => ({
  opacity: document.querySelector('[data-hero-core]')?.style.opacity ?? null,
}));

await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(600);
await page.screenshot({ path: 'artifacts/hero-desktop.png' });

await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(1200);
await page.screenshot({ path: 'artifacts/hero-mobile.png' });

console.log(JSON.stringify({ ...report, afterScroll, errors }, null, 2));
await browser.close();
