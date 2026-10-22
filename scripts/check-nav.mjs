import { chromium } from 'playwright';

const BASE = 'http://127.0.0.1:4173';
const browser = await chromium.launch({
  args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const errors = [];
const results = {};

// --- Desktop header and menu ------------------------------------------------
const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
desktop.on('pageerror', (e) => errors.push(e.message));
desktop.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

await desktop.goto(BASE, { waitUntil: 'networkidle' });
await desktop.waitForTimeout(1200);

results.header = await desktop.evaluate(() => {
  const header = document.querySelector('header');
  const toggle = document.querySelector('[aria-controls="site-menu"]');
  const nav = document.querySelector('nav[aria-label="Primary"]');
  return {
    height: header ? Math.round(header.getBoundingClientRect().height) : null,
    toggleVisible: toggle ? toggle.getBoundingClientRect().width > 0 : false,
    toggleLabel: toggle?.getAttribute('aria-label'),
    toggleExpanded: toggle?.getAttribute('aria-expanded'),
    navVisibleBeforeOpen: nav ? nav.getBoundingClientRect().width > 0 : false,
    topLevelLinks: document.querySelectorAll('header a').length,
    getStartedAnywhere: document.body.innerText.includes('Get Started'),
    pricingAnywhere: document.body.innerText.includes('Pricing'),
  };
});

await desktop.click('[aria-controls="site-menu"]');
await desktop.waitForTimeout(400);
results.menuOpen = await desktop.evaluate(() => {
  const panel = document.getElementById('site-menu');
  return {
    present: Boolean(panel),
    links: Array.from(panel?.querySelectorAll('nav a') ?? []).map((a) => a.textContent?.trim()),
    hasPricing: panel?.innerHTML.includes('/pricing') ?? false,
    hasGetStarted: panel?.innerHTML.includes('Get Started') ?? false,
    primaryCta: panel?.querySelector('.btn-primary')?.textContent?.trim(),
    bodyOverflow: getComputedStyle(document.body).overflow,
  };
});
await desktop.screenshot({ path: 'artifacts/nav-desktop-open.png' });

await desktop.keyboard.press('Escape');
await desktop.waitForTimeout(300);
results.menuClosedByEscape = await desktop.evaluate(
  () => document.getElementById('site-menu') === null,
);

// --- Hidden pricing route ---------------------------------------------------
await desktop.goto(`${BASE}/pricing`, { waitUntil: 'networkidle' });
results.pricing = await desktop.evaluate(() => ({
  title: document.title,
  robots: document.querySelector('meta[name="robots"]')?.getAttribute('content'),
  bodyMentionsPricing: document.body.innerText.includes('Pricing'),
}));

// --- Responsive sweep -------------------------------------------------------
results.widths = [];
for (const width of [320, 360, 390, 768, 1024, 1440]) {
  const page = await browser.newPage({ viewport: { width, height: 800 } });
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(700);
  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
    toggleVisible: (() => {
      const t = document.querySelector('[aria-controls="site-menu"]');
      return t ? t.getBoundingClientRect().width > 0 : false;
    })(),
  }));
  results.widths.push({ width, ...overflow });
  if (width === 390) {
    await page.click('[aria-controls="site-menu"]');
    await page.waitForTimeout(350);
    await page.screenshot({ path: 'artifacts/nav-mobile-open.png' });
  }
  await page.close();
}

results.errors = errors;
console.log(JSON.stringify(results, null, 2));
await browser.close();
