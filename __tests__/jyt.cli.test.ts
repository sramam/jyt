import * as cp from 'child_process';


describe(`cli`, () => {
  it(`cli_node.js`, async () => {
    const result = cp.execSync('node dist/cli_node.js --help');
    expect(result.toString('utf8')).toMatchInlineSnapshot(`
"No-fuss CLI to get/set json/yaml properties in file

 Usage: jyt <filepath> [dotPath] [val] [type]

    filepath : must be valid json/yaml files (expects objects)
    dotPath  : a dotted key path 'a.b.c'. When absent, prints the whole file
    val      : if specified, sets the value, else prints value to stdout
    type     : type of 'val' (defaults to string)

 Examples:
    # get a value
    jyt some/file.json  a.b.c

    # set a value
    jyt some/file.json  a.b.c 42

    # push to (end of) array
    jyt some/file.json  a.b.arr.[] 42 number

    # push to (head of) array
    jyt some/file.json  a.b.arr.[0] false boolean

    # add a new field (defaults to string)
    jyt some/file.yaml  a.b.d hello

    # add a new field (defaults to string)
    jyt some/file.yaml  a.b.e world string

"
`);
  });
});
