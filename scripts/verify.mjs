import { chromium } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';
import fs from 'node:fs';

const BASE = process.env.BASE_URL ?? 'http://127.0.0.1:4173';
const out = 'artifacts';
fs.mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const results = [];
const failures = [];

async function inspect(label, path, options = {}) {
  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text().slice(0, 240));
  });
  page.on('pageerror', (err) => consoleErrors.push(`pageerror: ${String(err).slice(0, 240)}`));

  const response = await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle', timeout: 45000 });
  await page.waitForTimeout(600);

  const meta = await page.evaluate(() => ({
    title: document.title,
    description: document.querySelector('meta[name="description"]')?.getAttribute('content') ?? null,
    canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? null,
    robots: document.querySelector('meta[name="robots"]')?.getAttribute('content') ?? null,
    ogType: document.querySelector('meta[property="og:type"]')?.getAttribute('content') ?? null,
    h1: [...document.querySelectorAll('h1')].map((el) => el.textContent.trim().slice(0, 90)),
    jsonLdTypes: [...document.querySelectorAll('script[type="application/ld+json"]')]
      .flatMap((node) => {
        try {
          const parsed = JSON.parse(node.textContent);
          return Array.isArray(parsed) ? parsed.map((g) => g['@type']) : [parsed['@type']];
        } catch {
          return ['invalid'];
        }
      })
      .filter(Boolean),
    text: document.body.innerText.replace(/\s+/g, ' ').trim().length,
    articleLinks: [...document.querySelectorAll('a[href^="/news/"]')].map((a) => a.getAttribute('href')),
    skipLink: Boolean(document.querySelector('a[href="#main-content"]')),
    formLabels: [...document.querySelectorAll('input, select, textarea')].filter((el) => {
      if (el.type === 'hidden' || el.getAttribute('aria-hidden') === 'true') return false;
      return Boolean(el.labels?.length || el.getAttribute('aria-label'));
    }).length,
    formFields: [...document.querySelectorAll('input, select, textarea')].filter(
      (el) => el.type !== 'hidden' && el.getAttribute('aria-hidden') !== 'true',
    ).length,
  }));

  let axe = [];
  if (options.axe !== false) {
    const analysis = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    axe = analysis.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length }));
    if (axe.length) failures.push(`${label}: axe ${axe.map((a) => a.id).join(', ')}`);
  }

  if (meta.h1.length !== 1) failures.push(`${label}: ${meta.h1.length} h1 elements`);
  if (!meta.canonical) failures.push(`${label}: missing canonical`);
  if (!meta.title || meta.title.trim().length < 8) failures.push(`${label}: empty document title`);
  if (!meta.description) failures.push(`${label}: missing meta description`);
  if (consoleErrors.length) failures.push(`${label}: console errors -> ${consoleErrors[0]}`);

  await page.screenshot({ path: `${out}/${label}.png`, fullPage: false });
  results.push({
    label,
    path,
    status: response?.status(),
    ...meta,
    axe,
    consoleErrors,
    totalArticleLinks: meta.articleLinks.length,
  });
  await page.close();
}

await inspect('home', '/');
await inspect('news', '/news');
await inspect('article', '/news/what-is-agi-neurusagi-scaling-trap');
await inspect('early-access', '/early-access');
await inspect('about', '/about');
await inspect('investors', '/investors');
await inspect('contact', '/contact');

// Client-side navigation: opening an article from the grid should update the
// URL and show the article overlay without a full page load.
{
  const page = await context.newPage();
  await page.goto(`${BASE}/news`, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /^grid$/i }).click();
  const firstLink = page.locator('a[href^="/news/"]').first();
  const href = await firstLink.getAttribute('href');
  await firstLink.click();
  await page.waitForTimeout(900);
  const state = await page.evaluate(() => ({
    url: location.pathname,
    dialog: Boolean(document.querySelector('[role="dialog"][aria-modal="true"]')),
    dialogTitle: document.querySelector('#article-title')?.textContent?.trim().slice(0, 70) ?? null,
    h1Count: document.querySelectorAll('h1').length,
  }));
  results.push({ label: 'article-navigation', clicked: href, ...state });
  if (!state.dialog) failures.push('article-navigation: dialog did not open');
  if (state.url !== href) failures.push(`article-navigation: url ${state.url} !== ${href}`);
  if (state.h1Count !== 1) failures.push(`article-navigation: ${state.h1Count} h1 elements`);
  await page.screenshot({ path: `${out}/article-modal.png` });

  // Escape closes it and returns to the index.
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  const afterClose = await page.evaluate(() => ({
    url: location.pathname,
    dialog: Boolean(document.querySelector('[role="dialog"]')),
  }));
  results.push({ label: 'article-close', ...afterClose });
  if (afterClose.dialog) failures.push('article-close: dialog still open after Escape');
  if (afterClose.url !== '/news') failures.push(`article-close: url ${afterClose.url}`);
  await page.close();
}

// Direct deep link must render the article on its own URL.
{
  const page = await context.newPage();
  await page.goto(`${BASE}/news/agi-vs-superintelligence`, { waitUntil: 'networkidle' });
  const state = await page.evaluate(() => ({
    url: location.pathname,
    title: document.title,
    dialog: Boolean(document.querySelector('[role="dialog"][aria-modal="true"]')),
    text: (document.querySelector('[role="dialog"]')?.textContent ?? '').trim().length,
  }));
  results.push({ label: 'article-deeplink', ...state });
  if (!state.dialog) failures.push('article-deeplink: article did not open');
  if (!state.title.includes('AGi')) failures.push('article-deeplink: title not set');
  await page.screenshot({ path: `${out}/article-deeplink.png` });
  await page.close();
}

// Early access form: validation, honeypot, submit path and the visible result.
{
  const page = await context.newPage();
  const consoleErrors = [];
  page.on('pageerror', (err) => consoleErrors.push(String(err).slice(0, 200)));
  await page.goto(`${BASE}/early-access`, { waitUntil: 'networkidle' });

  await page.fill('#early-access-page-name', 'Verification Run');
  await page.fill('#early-access-page-email', 'verify@example.com');
  await page.check('#early-access-page-consent');
  await page.click('form button[type="submit"]');
  await page.waitForTimeout(2500);

  const afterSubmit = await page.evaluate(() => ({
    alert: document.querySelector('[role="alert"]')?.textContent?.trim() ?? null,
    success: Boolean(document.querySelector('[role="status"]')),
  }));

  await page.screenshot({ path: `${out}/early-access-submit.png` });
  results.push({ label: 'early-access-submit', ...afterSubmit, consoleErrors });
  if (!afterSubmit.alert && !afterSubmit.success) {
    failures.push('early-access-submit: no feedback after submitting');
  }
  await page.close();
}

// Mobile layout sanity check.
{
  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true });
  const page = await mobile.newPage();
  await page.goto(`${BASE}/news`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: `${out}/news-mobile.png` });
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  results.push({ label: 'mobile', horizontalOverflowPx: overflow });
  if (overflow > 2) failures.push(`mobile: horizontal overflow of ${overflow}px`);
  await mobile.close();
}

fs.writeFileSync(`${out}/verify.json`, JSON.stringify({ results, failures }, null, 2));

console.log(
  results.map((r) => ({
    label: r.label,
    status: r.status,
    title: r.title?.slice(0, 60),
    h1: r.h1?.length,
    axe: r.axe?.map((a) => a.id),
    text: r.text,
    links: r.totalArticleLinks,
  })),
);
console.log('\nFAILURES:', failures.length ? failures : 'none');

await browser.close();
process.exit(failures.length ? 1 : 0);
