let _debug = false;
const trace = (msg: Record<string, unknown> | string) => {
  /* istanbul ignore next */
  if (_debug) {
    console.log(msg);
  }
};

export interface Imports {
  fs: {
    readTextFile: (fname: string) => Promise<string>;
    writeTextFile: (fname: string, contents: string) => Promise<unknown>;
  };
  YAML: {
    load: (str: string, opts?: unknown) => unknown;
    dump: (obj: unknown, opts?: unknown) => string;
  };
  dotProp: {
    get: <T>(
      object:
        | {
          [key: string]: unknown;
        }
        | undefined,
      path: string
    ) => T | undefined;
    set: <T extends { [key: string]: unknown }>(
      object: T,
      path: string,
      value: unknown
    ) => T;
  };
  exit: (code: number) => void;
}

enum FORMAT {
  JSON,
  YAML,
}

export default async function ({
  args,
  imports,
  debug,
}: {
  args: string[];
  imports: Imports;
  debug?: boolean;
}): Promise<unknown> {
  _debug = !!debug;
  const { fs, YAML, dotProp, exit } = imports;
  const { filepath, key, val: val_, type } = parseArgs(args, exit);
  const { format, contents, input } = await parse(filepath);
  trace({ filepath, key, type, val: val_, format });
  if (val_) {
    // set
    let val;
    if (type) {
      if (type === 'number') {
        val = Number(val_);
      } else if (type === 'boolean') {
        val = val_.trim().toLowerCase().match(/false|0|null/)
          ? false
          : true
      } else {
        // string
        val = val_
      }
    } else {
      val = val_;
    }
    let modified;
    if (key.match(/\.\[\]$/)) {
      // user is requesting the value be appended to array
      const _key = key.replace(/\.\[\]$/, ``);
      const prev = (dotProp.get(contents, _key) as Array<unknown>) || [];
      prev.push(val)
      modified = dotProp.set(contents, _key, prev);
    } else if (key.match(/\.\[0\]$/)) {
      // user is requesting the value be appended to array
      const _key = key.replace(/\.\[0\]$/, ``);
      const prev = (dotProp.get(contents, _key) as Array<unknown>) || [];
      prev.unshift(val)
      modified = dotProp.set(contents, _key, prev);
    } else {
      modified = dotProp.set(contents, key, val);
    }
    const output =
      format === FORMAT.JSON
        ? JSON.stringify(modified, null, 2)
        : YAML.dump(modified);
    await fs.writeTextFile(filepath, output);
    trace(`updated "${key}: ${val}"`);
    return modified;
  } else if (key) {
    // get
    const val = dotProp.get(contents, key);
    return val;
  } else {
    // full file
    return input;
  }

  async function parse(filepath: string) {
    let input: string;
    let contents: Record<string, unknown>;
    try {
      input = await fs.readTextFile(filepath);
    } catch (err) {
      // failed to open file.
      if (filepath.match(/\.json$/)) {
        return { input: `{}`, contents: {}, format: FORMAT.JSON }
      } else if (filepath.match(/\.(yaml|yml)/)) {
        return { input: ``, contents: {}, format: FORMAT.YAML }
      }
      throw err;
    }
    try {
      contents = JSON.parse(input);
      return { input, contents, format: FORMAT.JSON };
    } catch {
      contents = YAML.load(input) as Record<string, unknown>;
      return { input, contents, format: FORMAT.YAML };
    }
  }
}

function parseArgs(args: string[], exit: (n: number) => void) {
  const [filepath, key, val, type] = args;
  /* istanbul ignore next */
  if (!filepath || filepath === '-h' || filepath === '--help') {
    console.log(
      [
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
      ].join('\n')
    );
    exit(filepath ? 0 : 1);
  }
  return { filepath, key, val, type };
}
