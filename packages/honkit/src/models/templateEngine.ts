// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'nunjucks'.
const nunjucks = require("nunjucks");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'Immutable'... Remove this comment to see the full error message
const Immutable = require("immutable");

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'TemplateEn... Remove this comment to see the full error message
const TemplateEngine = Immutable.Record(
    {
        // Map of {TemplateBlock}
        blocks: Immutable.Map(),

        // Map of Extension
        extensions: Immutable.Map(),

        // Map of filters: {String} name -> {Function} fn
        filters: Immutable.Map(),

        // Map of globals: {String} name -> {Mixed}
        globals: Immutable.Map(),

        // Context for filters / blocks
        context: Object(),

        // Nunjucks loader
        loader: new nunjucks.FileSystemLoader("views"),
    },
    "TemplateEngine"
);

TemplateEngine.prototype.getBlocks = function () {
    return this.get("blocks");
};

TemplateEngine.prototype.getGlobals = function () {
    return this.get("globals");
};

TemplateEngine.prototype.getFilters = function () {
    return this.get("filters");
};

TemplateEngine.prototype.getShortcuts = function () {
    return this.get("shortcuts");
};

TemplateEngine.prototype.getLoader = function () {
    return this.get("loader");
};

TemplateEngine.prototype.getContext = function () {
    return this.get("context");
};

TemplateEngine.prototype.getExtensions = function () {
    return this.get("extensions");
};

/**
    Return a block by its name (or undefined)

    @param {String} name
    @return {TemplateBlock}
*/
TemplateEngine.prototype.getBlock = function (name) {
    const blocks = this.getBlocks();
    return blocks.find((block) => {
        return block.getName() === name;
    });
};

/**
    Return a nunjucks environment from this configuration

    @return {Nunjucks.Environment}
*/
TemplateEngine.prototype.toNunjucks = function (blocksOutput) {
    const loader = this.getLoader();
    const blocks = this.getBlocks();
    const filters = this.getFilters();
    const globals = this.getGlobals();
    const extensions = this.getExtensions();
    const context = this.getContext();

    const env = new nunjucks.Environment(loader, {
        // Escaping is done after by the asciidoc/markdown parser
        autoescape: false,

        // Syntax
        tags: {
            blockStart: "{%",
            blockEnd: "%}",
            variableStart: "{{",
            variableEnd: "}}",
            commentStart: "{###",
            commentEnd: "###}",
        },
    });

    // Add filters
    filters.forEach((filterFn, filterName) => {
        env.addFilter(filterName, filterFn.bind(context));
    });

    // Add blocks
    blocks.forEach((block) => {
        const extName = block.getExtensionName();
        const Ext = block.toNunjucksExt(context, blocksOutput);

        env.addExtension(extName, new Ext());
    });

    // Add globals
    globals.forEach((globalValue, globalName) => {
        env.addGlobal(globalName, globalValue);
    });

    // Add other extensions
    extensions.forEach((ext, extName) => {
        env.addExtension(extName, ext);
    });

    return env;
};

/**
    Create a template engine

    @param {Object} def
    @return {TemplateEngine}
*/
TemplateEngine.create = function (def) {
    return new TemplateEngine({
        blocks: Immutable.List(def.blocks || []),
        extensions: Immutable.Map(def.extensions || {}),
        filters: Immutable.Map(def.filters || {}),
        globals: Immutable.Map(def.globals || {}),
        context: def.context,
        loader: def.loader,
    });
};

module.exports = TemplateEngine;
