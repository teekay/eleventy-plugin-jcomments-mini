# eleventy-plugin-jcomments-mini

An [Eleventy](https://www.11ty.dev/) plugin that fetches comments from [jcomments-mini](https://github.com/teekay/jcomments-mini) and bakes them into your static pages at build time.

Drop-in replacement for [eleventy-plugin-jcomments](https://github.com/teekay/eleventy-plugin-jcomments). Zero dependencies, Node 18+.

## How it works

Before each build, the plugin fetches all comments from your jcomments-mini endpoint and saves them to a local JSON cache. A Nunjucks shortcode then renders comments for each page directly into the HTML.

Because comments are embedded at build time, they load instantly and survive API outages. For comments posted after the build, use the [jcomments-mini client script](https://github.com/teekay/jcomments-mini#comment-form-html) to fetch and render them in the browser.

## Installation

```sh
npm install eleventy-plugin-jcomments-mini
```

## Configuration

Add the plugin to your Eleventy config (`.eleventy.js` or `eleventy.config.js`):

```javascript
const jcommentsPlugin = require('eleventy-plugin-jcomments-mini');

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(jcommentsPlugin, {
    apiUrl: 'https://jcomments-mini.<you>.workers.dev',
    pathToCache: '/absolute/path/to/comments.json',
    useCached: false,
    dateFormat: 'en-US',
  });
};
```

### Options

| Option | Required | Default | Description |
|---|---|---|---|
| `apiUrl` | Yes | — | URL of your jcomments-mini endpoint |
| `pathToCache` | Yes | — | Absolute path where the comment cache is stored |
| `useCached` | No | `false` | Skip fetching and use the existing cache (useful during local development) |
| `dateFormat` | No | `'en-US'` | A locale string (e.g. `'en-US'`, `'de-DE'`) or a function `(Date) => string` for custom formatting |
| `apiToken` | No | — | Accepted for compatibility with eleventy-plugin-jcomments but ignored (jcomments-mini does not require auth for reads) |
| `format` | No | — | Accepted for compatibility but ignored (jcomments-mini always returns plain text) |
| `noFollow` | No | — | Accepted for compatibility but ignored (jcomments-mini does not store commenter websites) |

## Usage

### Nunjucks shortcode

Use the `commentsForPage` shortcode in your templates:

```njk
{{ commentsForPage("https://example.com", page.url) }}
```

This renders all comments for the page as an HTML block:

```html
<section class="jcomments comments">
  <article class="comment" data-id="69ac579c-19a1-4b4e-8656-933fd60040ce">
    <p class="comment-meta">
      <span class="post-info-label">Jan 1, 2026
      by Alice</span>
    </p>
    <blockquote class="comment-text">
      Great article!
    </blockquote>
  </article>
</section>
```

### Programmatic API

For more control over rendering, use the exported functions directly:

```javascript
const { loadComments, commentsForPage, commentsRendered } = require('eleventy-plugin-jcomments-mini');

// Fetch and cache all comments
await loadComments('https://jcomments-mini.<you>.workers.dev', null, null, '/path/to/cache.json', false);

// Get comments for a specific page
const comments = commentsForPage('/path/to/cache.json', 'https://example.com', '/blog/my-post');

// Render to HTML
const html = commentsRendered(comments, 'en-US');
```

## Migrating from eleventy-plugin-jcomments

1. Replace the package: `npm uninstall eleventy-plugin-jcomments && npm install eleventy-plugin-jcomments-mini`
2. Update the require in your Eleventy config:
   ```diff
   -const jcommentsPlugin = require('eleventy-plugin-jcomments');
   +const jcommentsPlugin = require('eleventy-plugin-jcomments-mini');
   ```
3. Change `apiUrl` to point to your jcomments-mini endpoint (drop the `/api/comments` suffix).
4. The `apiToken`, `format`, and `noFollow` options are accepted but no longer used — remove them at your convenience.
5. If you used a Moment.js format string for `dateFormat`, replace it with a locale string (`'en-US'`) or a custom function.

## License

MIT
