/**
 * Checks quoted material against the pages each article cites.
 *
 * For every quotation in an article, this fetches that article's sources and
 * looks for the words on the page. A quote that no linked page contains is
 * either misattributed or points at the wrong source, and that is exactly what
 * a reader would call a fabricated citation, so it fails.
 *
 * Paraphrases are not checked here. Quotes are objective; paraphrase accuracy
 * still needs a human or agent read. Run: node scripts/check-quotes.mjs
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = new URL('../src/data/agi/', import.meta.url).pathname;
const cache = new Map();

const normalise = (text) =>
  text
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/&nbsp;|&#8217;|&rsquo;|&ldquo;|&rdquo;/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .toLowerCase();

async function page(url) {
  if (!cache.has(url)) {
    cache.set(
      url,
      fetch(url, {
        headers: {
          'user-agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36',
        },
        redirect: 'follow',
      })
        .then((r) => (r.ok ? r.text() : null))
        .then((body) => (body === null ? null : normalise(body)))
        .catch(() => null),
    );
  }
  return cache.get(url);
}

const files = readdirSync(dir)
  .filter((name) => /^article-\d+\.ts$/.test(name))
  .sort();

const misses = [];
const unreadable = new Set();
let checked = 0;

for (const file of files) {
  const source = readFileSync(join(dir, file), 'utf8');
  const content = source.match(/content: `([\s\S]*?)`,\n  citations/)?.[1] ?? '';
  const citations = [...(source.match(/citations: \[([\s\S]*?)\]/)?.[1] ?? '').matchAll(/'(https?:\/\/[^']+)'/g)].map(
    (m) => m[1],
  );
  const plain = content.replace(/<[^>]+>/g, ' ');
  const quotes = [...plain.matchAll(/[\u201c"]([^\u201d"]{12,160})[\u201d"]/g)].map((m) => normalise(m[1]));

  for (const quote of quotes) {
    checked += 1;
    const fragment = quote.slice(0, 70).replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
    let found = false;
    let blocked = true;
    for (const url of citations) {
      const body = await page(url);
      if (body === null) continue;
      blocked = false;
      if (body.includes(fragment)) {
        found = true;
        break;
      }
    }
    if (found) continue;
    if (blocked) unreadable.add(`${file}: "${quote.slice(0, 60)}" (every linked page blocked the fetch)`);
    else misses.push({ file, quote: quote.slice(0, 90) });
  }
}

console.log(`checked ${checked} quotation(s) across ${files.length} article(s)`);
if (unreadable.size) {
  console.log(`\n${unreadable.size} quote(s) could not be verified because the sources block bots:`);
  for (const line of unreadable) console.log(`  ${line}`);
}
if (misses.length) {
  console.log(`\n${misses.length} quote(s) not found on any linked source page:`);
  for (const miss of misses) console.log(`  ${miss.file}: "${miss.quote}"`);
  process.exit(1);
}
console.log('every quotation appears on a page the article links.');
