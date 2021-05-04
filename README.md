# generate-icons

command line utility to generate all icon files defined in manifest.json from a SVG file.

# Usage

```bash
npx generate-icons --manifest public/manifest.json icon.svg
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

# Limitations

supported input format:
* svg

supported output formats:
* .ico, .png

# License
ISC

# Author
@koizuka ([Twitter](https://twitter.com/koizuka))
