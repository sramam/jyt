import { default as dotProp_ } from 'https://esm.sh/dot-prop';
import {
  parse as load,
  stringify as dump,
} from 'https://deno.land/std/encoding/yaml.ts';

export const YAML = {
  load,
  dump,
};

export const fs = {
  readTextFile: Deno.readTextFile,
  writeTextFile: Deno.writeTextFile,
};

export const dotProp = {
  get: dotProp_.get,
  set: dotProp_.set,
};
