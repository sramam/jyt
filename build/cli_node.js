"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const dotProp = require("dot-prop");
const YAML = require("js-yaml");
const index_1 = require("./index");
const fs = {
    readTextFile: (filepath) => fs_1.promises.readFile(filepath, 'utf8'),
    writeTextFile: (filepath, contents) => fs_1.promises.writeFile(filepath, contents, 'utf8'),
};
const imports = {
    fs,
    YAML,
    dotProp,
    exit: process.exit,
};
index_1.default({
    args: process.argv.slice(2),
    imports,
    debug: !!process.env.DEBUG_JY_HO,
})
    .then(console.log)
    .catch(err => {
    console.error(err.message);
});
//# sourceMappingURL=cli_node.js.map