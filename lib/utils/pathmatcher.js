'use strict';

const micromatch = require("micromatch");

const match = (definitionPath, path) => {
    const normalizedDefinitionPath = wildcardNormalizer(definitionPath);
    return !!micromatch.isMatch(path, normalizedDefinitionPath);

};

const wildcardNormalizer = (path) => {
    if (!path) {
        throw new Error("Invalid path");
    }
    return path.replace(/(\{).+?(\})/g, '*');
};

module.exports.wildcardNormalizer = wildcardNormalizer;
module.exports.match = match;
