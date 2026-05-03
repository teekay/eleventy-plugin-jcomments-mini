const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { commentsForPage, commentsRendered } = require('../lib/jcomments-api');

const cachePath = path.join(__dirname, 'fixtures', 'comments.json');

const fixtures = [
  { id: 'aaa', author: 'Alice', text: 'Hello world', createdAt: '2026-01-01T10:00:00.000Z', pagePath: '/blog/post-one' },
  { id: 'bbb', author: 'Bob', text: 'Line one\nLine two', createdAt: '2026-01-02T12:00:00.000Z', pagePath: '/blog/post-one' },
  { id: 'ccc', author: 'Charlie', text: 'Other page', createdAt: '2026-02-01T08:00:00.000Z', pagePath: '/blog/post-two' },
];

fs.mkdirSync(path.dirname(cachePath), { recursive: true });
fs.writeFileSync(cachePath, JSON.stringify(fixtures));

// commentsForPage filters by permalink
const page1 = commentsForPage(cachePath, 'https://example.com', '/blog/post-one');
assert.strictEqual(page1.length, 2, 'should find 2 comments for post-one');
assert.strictEqual(page1[0].author, 'Alice');
assert.strictEqual(page1[1].author, 'Bob');

const page2 = commentsForPage(cachePath, 'https://example.com', '/blog/post-two');
assert.strictEqual(page2.length, 1);

const empty = commentsForPage(cachePath, 'https://example.com', '/blog/nonexistent');
assert.strictEqual(empty.length, 0);

// trailing slash normalization
const page1Slash = commentsForPage(cachePath, 'https://example.com', '/blog/post-one/');
assert.strictEqual(page1Slash.length, 2, 'trailing slash should still match');

// commentsRendered produces expected HTML structure
const html = commentsRendered(page1, 'en-US', false);
assert(html.includes('<section class="jcomments comments">'), 'should have section wrapper');
assert(html.includes('data-id="aaa"'), 'should include comment id');
assert(html.includes('by Alice'), 'should include author');
assert(html.includes('Hello world'), 'should include text');
assert(html.includes('Line one<br>Line two'), 'should convert newlines to <br>');
assert(!html.includes('<script'), 'should escape HTML');

// XSS safety
const xssComments = [{ id: 'x', author: '<script>alert(1)</script>', text: '<img onerror=alert(1)>', createdAt: '2026-01-01T00:00:00.000Z', pagePath: '/x' }];
const xssHtml = commentsRendered(xssComments, 'en-US', false);
assert(!xssHtml.includes('<script>'), 'should escape script tags in author');
assert(!xssHtml.includes('<img'), 'should escape img tags in text');
assert(xssHtml.includes('&lt;script&gt;'), 'should have escaped entities');

// dateFormat as function
const customDate = commentsRendered(page1, (d) => d.toISOString().slice(0, 10), false);
assert(customDate.includes('2026-01-01'), 'should use custom date formatter');

// cleanup
fs.unlinkSync(cachePath);
fs.rmdirSync(path.dirname(cachePath));

console.log('All tests passed.');
