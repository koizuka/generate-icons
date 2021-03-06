# generate-icons

command line utility to generate all icon files defined in [manifest.json](https://developer.mozilla.org/ja/docs/Mozilla/Add-ons/WebExtensions/manifest.json) from a SVG file.

it is intended to use with manifest.json which placed by [create-react-app](https://github.com/facebook/create-react-app).

On create-react-app'ed directory, only thing you have to do is to prepare a single square SVG file, and run generate-icons.



# Usage

```bash
$ npx generate-icons --manifest public/manifest.json icon.svg
Input SVG file: icon.svg
public/favicon.ico: type: image/x-icon
size: 64
size: 32
size: 24
size: 16
public/logo192.png: type: image/png
size: 192
public/logo512.png: type: image/png
size: 512
```

```bash
$ npx generate-icons --help

generate-icons

  generate icon files defined in manifest.json from a SVG file. 

Options

  -h, --help              Show this help.             
  -v, --version           Show version.               
  -m, --manifest string   Specify manifest.json file. 
  --src string            SVG filename to read.       
  --background string     Background color(eg. "white", "#ffffff"). transparent if not specified. 

  Project home: https://github.com/koizuka/generate-icons 
```

# Limitations

supported input format:
* svg

supported output formats:
* .ico, .png

# Development information
## build and run
```shell
yarn build
yarn start test-data/test.svg
```

## update version and publish
```shell
npm version patch # eg. increase patch level
```
then, release from version tag on GitHub

# License
ISC

# Author
@koizuka ([Twitter](https://twitter.com/koizuka))
