const { loadComments, commentsForPage, commentsRendered } = require('./lib/jcomments-api');

module.exports = function (eleventyConfig, options = {}) {
  const { apiUrl, apiToken, format, dateFormat, pathToCache, useCached, noFollow } = options;

  eleventyConfig.on('eleventy.before', async () => {
    await loadComments(apiUrl, apiToken, format, pathToCache, useCached);
  });

  const commentsForPagePartial = (baseUrl, permalink) => commentsForPage(pathToCache, baseUrl, permalink);
  const commentsRenderedPartial = (comments, pageUrl) => commentsRendered(comments, dateFormat, noFollow, apiUrl, pageUrl);

  eleventyConfig.addNunjucksShortcode('commentsForPage', function (baseUrl, permalink) {
    return commentsRenderedPartial(commentsForPagePartial(baseUrl, permalink), baseUrl + permalink);
  });
};

module.exports.loadComments = loadComments;
module.exports.commentsForPage = commentsForPage;
module.exports.commentsRendered = commentsRendered;
