// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'SummaryArt... Remove this comment to see the full error message
const SummaryArticle = require("../../models/summaryArticle");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'SummaryPar... Remove this comment to see the full error message
const SummaryPart = require("../../models/summaryPart");

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'indexLevel... Remove this comment to see the full error message
const indexLevels = require("./indexLevels");

/**
    Insert an article at the beginning of summary

    @param {Summary} summary
    @param {Article} article
    @return {Summary}
*/
function unshiftArticle(summary, article) {
    article = SummaryArticle(article);

    let parts = summary.getParts();
    let part = parts.get(0) || SummaryPart();

    let articles = part.getArticles();
    articles = articles.unshift(article);
    part = part.set("articles", articles);

    parts = parts.set(0, part);
    summary = summary.set("parts", parts);

    return indexLevels(summary);
}

module.exports = unshiftArticle;
