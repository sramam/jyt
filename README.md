# jyt
`jyt` is a no-fuss CLI to get/set json/yaml config files.

The only assumption it makes is that file-contents are an object (as opposed to an array or other valid json/yaml forms). The primary purpose of the utility is to get/set
values of config files from scripts.

## Install

```
npm i jyt
```

```
yarn add jyt
```

## Usage

```
No-fuss CLI to get/set json/yaml properties in file

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
    jyt some/file.json  a.b.arr.[] 42

    # push to (head of) array
    jyt some/file.json  a.b.arr.[0] 42

```