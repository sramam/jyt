"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
let _debug = false;
const trace = (msg) => {
    if (_debug) {
        console.log(msg);
    }
};
var FORMAT;
(function (FORMAT) {
    FORMAT[FORMAT["JSON"] = 0] = "JSON";
    FORMAT[FORMAT["YAML"] = 1] = "YAML";
})(FORMAT || (FORMAT = {}));
function default_1({ args, imports, debug, }) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        _debug = !!debug;
        const { fs, YAML, dotProp, exit } = imports;
        const { filepath, key, val: val_, type } = parseArgs(args, exit);
        const { format, contents, input } = yield parse(filepath);
        trace({ filepath, key, type, val: val_, format });
        if (val_) {
            let val;
            if (type) {
                if (type === 'number') {
                    val = Number(val_);
                }
                else if (type === 'boolean') {
                    val = val_.trim().toLowerCase().match(/false|0|null/)
                        ? false
                        : true;
                }
                else {
                    val = val_;
                }
            }
            else {
                val = val_;
            }
            let modified;
            if (key.match(/\.\[\]$/)) {
                const _key = key.replace(/\.\[\]$/, ``);
                const prev = dotProp.get(contents, _key) || [];
                prev.push(val);
                modified = dotProp.set(contents, _key, prev);
            }
            else if (key.match(/\.\[0\]$/)) {
                const _key = key.replace(/\.\[0\]$/, ``);
                const prev = dotProp.get(contents, _key) || [];
                prev.unshift(val);
                modified = dotProp.set(contents, _key, prev);
            }
            else {
                modified = dotProp.set(contents, key, val);
            }
            const output = format === FORMAT.JSON
                ? JSON.stringify(modified, null, 2)
                : YAML.dump(modified);
            yield fs.writeTextFile(filepath, output);
            trace(`updated "${key}: ${val}"`);
            return modified;
        }
        else if (key) {
            const val = dotProp.get(contents, key);
            return val;
        }
        else {
            return input;
        }
        function parse(filepath) {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const input = yield fs.readTextFile(filepath);
                let contents;
                try {
                    contents = JSON.parse(input);
                    return { input, contents, format: FORMAT.JSON };
                }
                catch (_a) {
                    contents = YAML.load(input);
                    return { input, contents, format: FORMAT.YAML };
                }
            });
        }
    });
}
exports.default = default_1;
function parseArgs(args, exit) {
    const [filepath, key, val, type] = args;
    if (!filepath || filepath === '-h' || filepath === '--help') {
        console.log([
            `No-fuss CLI to get/set json/yaml properties in file`,
            ``,
            ` Usage: jyt <filepath> [dotPath] [val] [type]`,
            ``,
            `    filepath : must be valid json/yaml files (expects objects)`,
            `    dotPath  : a dotted key path 'a.b.c'. When absent, prints the whole file`,
            `    val      : if specified, sets the value, else prints value to stdout`,
            `    type     : type of 'val' (defaults to string)`,
            ``,
            ` Examples:`,
            `    # get a value`,
            `    jyt some/file.json  a.b.c`,
            ``,
            `    # set a value`,
            `    jyt some/file.json  a.b.c 42`,
            ``,
            `    # push to (end of) array`,
            `    jyt some/file.json  a.b.arr.[] 42 number`,
            ``,
            `    # push to (head of) array`,
            `    jyt some/file.json  a.b.arr.[0] false boolean`,
            ``,
            `    # add a new field (defaults to string)`,
            `    jyt some/file.yaml  a.b.d hello`,
            ``,
            `    # add a new field (defaults to string)`,
            `    jyt some/file.yaml  a.b.e world string`,
            ``,
        ].join('\n'));
        exit(filepath ? 0 : 1);
    }
    return { filepath, key, val, type };
}
//# sourceMappingURL=index.js.map