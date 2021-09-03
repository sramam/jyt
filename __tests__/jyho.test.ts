import { promises as fs_ } from 'fs';
import * as dotProp from 'dot-prop';
import * as YAML from 'js-yaml';
import jyt from '../src/index';

const fs = {
  readTextFile: (filepath: string) => fs_.readFile(filepath, 'utf8'),
  writeTextFile: (filepath: string, contents: string) =>
    fs_.writeFile(filepath, contents, 'utf8'),
};

const imports = {
  fs,
  YAML,
  dotProp,
  exit: process.exit,
};

describe('jyt', () => {
  let tmpdir: string;
  let fnames: {
    json: string;
    yaml: string;
  };

  beforeAll(async () => {
    tmpdir = await fs_.mkdtemp('jy_ho');

    fnames = {
      json: `${tmpdir}/sample.json`,
      yaml: `${tmpdir}/sample.yaml`,
    };

    await fs_.copyFile(`${__dirname}/fixtures/sample.json`, fnames.json);
    await fs_.copyFile(`${__dirname}/fixtures/sample.yaml`, fnames.yaml);
  });

  afterAll(async () => {
    fs_.rm(tmpdir, { recursive: true });
  });

  it('json', async () => {
    const result = await jyt({
      args: [fnames.json, 'some.nested.json'],
      imports,
    });
    expect(result).toMatchInlineSnapshot(`true`);
  });

  it('yaml', async () => {
    const result = await jyt({
      args: [fnames.yaml, 'some.nested.yaml'],
      imports,
    });
    expect(result).toMatchInlineSnapshot(`true`);
  });

  it(`json-arr.[]`, async () => {
    await jyt({
      args: [fnames.json, 'some.arr.[]', '2', 'number'],
      imports,
    });
    const result = await jyt({
      args: [fnames.json],
      imports,
    });
    expect(result).toMatchInlineSnapshot(`
      "{
        \\"some\\": {
          \\"nested\\": {
            \\"json\\": true
          },
          \\"arr\\": [
            1,
            2
          ]
        }
      }"
    `);
  });

  it(`json-arr.[0]`, async () => {
    await jyt({
      args: [fnames.json, 'some.arr.[0]', '0', 'number'],
      imports,
    });
    const result = await jyt({
      args: [fnames.json],
      imports,
    });
    expect(result).toMatchInlineSnapshot(`
      "{
        \\"some\\": {
          \\"nested\\": {
            \\"json\\": true
          },
          \\"arr\\": [
            0,
            1,
            2
          ]
        }
      }"
    `);
  });

  it(`(json)create arr if non-existent`, async () => {
    await jyt({
      args: [fnames.json, 'some.arr2.[]', '1', 'number'],
      imports,
    });
    await jyt({
      args: [fnames.json, 'some.arr2.[]', '2'],
      imports,
    });
    await jyt({
      args: [fnames.json, 'some.arr2.[0]', 'false'],
      imports,
    });
    await jyt({
      args: [fnames.json, 'some.arr2.[0]', 'false', 'boolean'],
      imports,
    });
    const result = await jyt({
      args: [fnames.json],
      imports,
    });
    expect(result).toMatchInlineSnapshot(`
      "{
        \\"some\\": {
          \\"nested\\": {
            \\"json\\": true
          },
          \\"arr\\": [
            0,
            1,
            2
          ],
          \\"arr2\\": [
            false,
            \\"false\\",
            1,
            \\"2\\"
          ]
        }
      }"
    `);
  });

  it(`(json) types`, async () => {
    await jyt({
      args: [fnames.json, 'some.number', '1', 'number'],
      imports,
    });
    await jyt({
      args: [fnames.json, 'some.string', 'hello'],
      imports,
    });
    await jyt({
      args: [fnames.json, 'some.boolean', 'false', 'boolean'],
      imports,
    });
    const result = await jyt({
      args: [fnames.json],
      imports,
    });
    expect(result).toMatchInlineSnapshot(`
      "{
        \\"some\\": {
          \\"nested\\": {
            \\"json\\": true
          },
          \\"arr\\": [
            0,
            1,
            2
          ],
          \\"arr2\\": [
            false,
            \\"false\\",
            1,
            \\"2\\"
          ],
          \\"number\\": 1,
          \\"string\\": \\"hello\\",
          \\"boolean\\": false
        }
      }"
    `);
  });

  // ---

  it(`yaml-arr.[]`, async () => {
    await jyt({
      args: [fnames.yaml, 'some.arr.[]', '2', 'number'],
      imports,
    });
    const result = await jyt({
      args: [fnames.yaml],
      imports,
    });
    expect(result).toMatchInlineSnapshot(`
      "some:
        nested:
          yaml: true
        arr:
          - 1
          - 2
      "
    `);
  });

  it(`yaml-arr.[0]`, async () => {
    await jyt({
      args: [fnames.yaml, 'some.arr.[0]', '0', 'number'],
      imports,
    });
    const result = await jyt({
      args: [fnames.yaml],
      imports,
    });
    expect(result).toMatchInlineSnapshot(`
      "some:
        nested:
          yaml: true
        arr:
          - 0
          - 1
          - 2
      "
    `);
  });

  it(`(yaml)create arr if non-existent`, async () => {
    await jyt({
      args: [fnames.yaml, 'some.arr2.[]', '1', 'number'],
      imports,
    });
    await jyt({
      args: [fnames.yaml, 'some.arr2.[]', '2'],
      imports,
    });
    await jyt({
      args: [fnames.yaml, 'some.arr2.[0]', 'false'],
      imports,
    });
    await jyt({
      args: [fnames.yaml, 'some.arr2.[0]', 'false', 'boolean'],
      imports,
    });
    const result = await jyt({
      args: [fnames.yaml],
      imports,
    });
    expect(result).toMatchInlineSnapshot(`
      "some:
        nested:
          yaml: true
        arr:
          - 0
          - 1
          - 2
        arr2:
          - false
          - 'false'
          - 1
          - '2'
      "
    `);
  });

  it(`(yaml) types`, async () => {
    await jyt({
      args: [fnames.yaml, 'some.number', '1', 'number'],
      imports,
    });
    await jyt({
      args: [fnames.yaml, 'some.string', 'hello', 'string'],
      imports,
    });
    await jyt({
      args: [fnames.yaml, 'some.string-default', 'hello'],
      imports,
    });
    await jyt({
      args: [fnames.yaml, 'some.boolean-true', 'true', 'boolean'],
      imports,
    });
    await jyt({
      args: [fnames.yaml, 'some.boolean-false', 'false', 'boolean'],
      imports,
    });
    const result = await jyt({
      args: [fnames.yaml],
      imports,
    });
    expect(result).toMatchInlineSnapshot(`
      "some:
        nested:
          yaml: true
        arr:
          - 0
          - 1
          - 2
        arr2:
          - false
          - 'false'
          - 1
          - '2'
        number: 1
        string: hello
        string-default: hello
        boolean-true: true
        boolean-false: false
      "
    `);
  });
});
