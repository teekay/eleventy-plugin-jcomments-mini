const fs = require('fs');

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatDate(isoString, dateFormat) {
  const d = new Date(isoString);
  if (typeof dateFormat === 'function') return dateFormat(d);
  const locale = typeof dateFormat === 'string' ? dateFormat : 'en-US';
  return d.toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });
}

async function loadComments(apiUrl, apiToken, format, pathToCache, useCached) {
  if (!apiUrl) {
    throw new Error('jcomments-mini endpoint URL is required');
  }

  if (fs.existsSync(pathToCache) && useCached) {
    console.log('[jcomments-mini] Using cached comments');
    return;
  }

  console.log(`[jcomments-mini] Fetching all comments from ${apiUrl}`);
  const response = await fetch(`${apiUrl}/comments`);
  if (!response.ok) {
    throw new Error(`[jcomments-mini] Failed to fetch comments: ${response.status}`);
  }

  const grouped = await response.json();

  // Flatten to array with postUrl field for cache compatibility
  const flat = [];
  for (const [pagePath, comments] of Object.entries(grouped)) {
    for (const comment of comments) {
      flat.push({ ...comment, pagePath });
    }
  }

  console.log(`[jcomments-mini] Received ${flat.length} comments across ${Object.keys(grouped).length} pages`);
  fs.writeFileSync(pathToCache, JSON.stringify(flat));
}

function commentsForPage(pathToCache, baseUrl, permalink) {
  delete require.cache[require.resolve(pathToCache)];
  const allComments = require(pathToCache);
  const normalizedPermalink = permalink.replace(/\/$/, '') || '/';
  return allComments.filter((c) => {
    const path = c.pagePath.replace(/\/$/, '') || '/';
    return path === normalizedPermalink;
  });
}

function commentsRendered(comments, dateFormat, noFollow, apiUrl, pageUrl) {
  const attrs = apiUrl && pageUrl
    ? ` data-api-url="${escapeHtml(apiUrl)}" data-page-url="${escapeHtml(pageUrl)}"`
    : '';
  return `<section class="jcomments comments"${attrs}>
    ${comments.map((c) => singleComment(c, dateFormat)).join('\n')}
    </section>`;
}

function singleComment(comment, dateFormat) {
  const textHtml = escapeHtml(comment.text)
    .split('\n')
    .map((line) => line.trimEnd())
    .filter((line, i, arr) => !(line === '' && i > 0 && arr[i - 1] === ''))
    .join('<br>');

  return `
  <article class="comment" data-id="${escapeHtml(comment.id)}" data-created-at="${escapeHtml(comment.createdAt)}">
    <p class="comment-meta">
      <span class="post-info-label">${formatDate(comment.createdAt, dateFormat)}
      by ${escapeHtml(comment.author)}</span>
    </p>
    <blockquote class="comment-text">
      ${textHtml}
    </blockquote>
  </article>`;
}

module.exports = {
  loadComments,
  commentsForPage,
  commentsRendered,
};
