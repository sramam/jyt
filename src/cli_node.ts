#!/usr/bin/env node
/* istanbul ignore file */
// while we don't get coverage, we have a test to exercise this
// code. Not sure jest will provide coverage collation across sub-processes
import { promises as fs_ } from 'fs';
import * as dotProp from 'dot-prop';
import * as YAML from 'js-yaml';
import jyt from './index';

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

jyt({
  args: process.argv.slice(2),
  imports,
  debug: !!process.env.DEBUG_JY_HO,
})
  .then(console.log)
  .catch(err => {
    console.error(err.message);
  });
