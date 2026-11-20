/**
 * The gate every article in the AGi series has to pass before it ships.
 *
 * Reads the article modules as text so it can run without a build, and exits
 * non-zero listing every failure. Run it before committing an article.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = new URL('../src/data/agi/', import.meta.url).pathname;
const LEADERS = [
  'Altman',
  'Amodei',
  'Hassabis',
  'Musk',
  'Nadella',
  'Huang',
  'Fei-Fei Li',
  'Sutskever',
  'LeCun',
  'Hinton',
  'Bengio',
  'Pichai',
  'Zuckerberg',
  'Gates',
  'Suleyman',
];
const BANNED = ['inthacity', 'deepestresearch', 'deepest research', 'justthink', 'just think ai', 'emergentmind'];

const strip = (html) =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const files = readdirSync(dir)
  .filter((name) => /^article-\d+\.ts$/.test(name))
  .sort();

const problems = [];
const report = [];

for (const file of files) {
  const source = readFileSync(join(dir, file), 'utf8');
  const id = Number(source.match(/id: '(\d+)'/)?.[1] ?? 0);
  const title = source.match(/title:\s*\n?\s*(['"])(.+?)\1,/)?.[2] ?? '';
  const excerpt = source.match(/excerpt:\s*\n?\s*'([^']+)'/)?.[1] ?? '';
  const content = source.match(/content: `([\s\S]*?)`,\n  citations/)?.[1] ?? '';
  const author = source.match(/author: '([^']+)'/)?.[1] ?? '';
  const company = source.match(/company: '([^']+)'/)?.[1] ?? '';
  const publishedAt = source.match(/publishedAt: '([^']+)'/)?.[1] ?? '';
  const citations = [...(source.match(/citations: \[([\s\S]*?)\]/)?.[1] ?? '').matchAll(/'(https?:\/\/[^']+)'/g)].map(
    (m) => m[1],
  );
  const hrefs = [...content.matchAll(/href="(https?:\/\/[^"]+)"/g)].map((m) => m[1]);
  const fail = (message) => problems.push(`${file}: ${message}`);

  if (!content) fail('content block not found');
  if (!title) fail('missing title');
  if (!excerpt) fail('missing excerpt');

  // 1. No em dashes, anywhere. En dashes are flagged too, as a warning.
  const dashes = (text) => (text.match(/\u2014/g) ?? []).length;
  const enDashes = (text) => (text.match(/\u2013/g) ?? []).length;
  const dashCount = dashes(content) + dashes(title) + dashes(excerpt);
  if (dashCount > 0) fail(`${dashCount} em dash(es) present`);
  const enCount = enDashes(content) + enDashes(title) + enDashes(excerpt);

  // 2. Every citation points at a source that is also linked in the article,
  //    and every linked source is in the citations list.
  const missing = citations.filter((url) => !hrefs.includes(url));
  if (missing.length) fail(`citation(s) not linked in body: ${missing.join(', ')}`);
  const unrecorded = hrefs.filter((url) => !citations.includes(url));
  if (unrecorded.length) fail(`link(s) missing from citations: ${unrecorded.join(', ')}`);
  if (!citations.length) fail('no citations');

  // 3. Three named leaders inside the first ~100 words.
  const first = strip(content).split(' ').slice(0, 100).join(' ');
  const named = LEADERS.filter((leader) => first.includes(leader));
  if (named.length < 3) fail(`only ${named.length} leader(s) in the first 100 words: ${named.join(', ') || 'none'}`);

  // 4. Byline and company on every article.
  if (author !== 'Jeremy Taylor') fail(`author is "${author}"`);
  if (company !== 'NeurusAGi') fail(`company is "${company}"`);

  // 5. Weekly since 2025-02-05, one slot per published article. Skipped
  //    numbers (17, 21) never leave a gap in the schedule.
  const position = files.indexOf(file);
  const expected = new Date(Date.UTC(2025, 1, 5) + position * 7 * 86_400_000).toISOString().slice(0, 10);
  if (publishedAt !== expected) fail(`publishedAt ${publishedAt}, expected ${expected} for slot ${position + 1}`);

  // 6. Never link the four sites that are off limits.
  const lower = content.toLowerCase();
  for (const banned of BANNED) {
    if (lower.includes(banned)) fail(`links or names a banned source: ${banned}`);
  }

  // 7. A sources block at the bottom, with real links.
  if (!/<h2>Sources<\/h2>/.test(content)) fail('no Sources heading');
  if (!hrefs.length) fail('no source links');

  report.push({
    file,
    id,
    title,
    words: strip(content).split(' ').filter(Boolean).length,
    leaders: named,
    sources: citations.length,
    enDashes: enCount,
  });
}

report.sort((a, b) => a.id - b.id);
for (const row of report) {
  console.log(
    `${String(row.id).padStart(2)} ${row.file.padEnd(16)} ${String(row.words).padStart(5)} words  ` +
      `${row.sources} sources  leaders: ${row.leaders.join(', ')}${row.enDashes ? `  [${row.enDashes} en dash]` : ''}`,
  );
}

if (problems.length) {
  console.error(`\n${problems.length} problem(s):`);
  for (const problem of problems) console.error(`  ${problem}`);
  process.exit(1);
}
console.log(`\nAll ${report.length} article(s) pass the checklist.`);
