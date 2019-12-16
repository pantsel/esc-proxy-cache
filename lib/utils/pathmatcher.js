'use strict';

const micromatch = require("micromatch");

const match = (definitionPath, path) => {

    const wildcardPath = wildcardNormalizer(definitionPath);

    return !!micromatch.isMatch(wildcardPath, path);

};

const wildcardNormalizer = (path) => {
    if (!path) {
        throw new Error("Invalid path");
    }
    return path.replace(/(\{).+?(\})/g, "*");
};

module.exports.wildcardNormalizer = wildcardNormalizer;
module.exports.match = match;
