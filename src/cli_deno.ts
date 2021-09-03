import { fs, YAML, dotProp } from '../deps.js';
import jyho from './index.ts';

const imports = {
  fs,
  YAML,
  dotProp,
  exit: Deno.exit,
};

jyho({
  args: Deno.args,
  imports,
  debug: !!Deno.env.get('DEBUG_JY_HO'),
})
  .then(console.log)
  .catch(err => {
    console.error(err.message);
  });
