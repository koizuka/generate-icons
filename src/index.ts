import { writeFileSync } from 'fs';
import commandLineArgs from 'command-line-args';
import commandLineUsage from 'command-line-usage';
// @ts-ignore
import Svg2 from 'oslllo-svg2';
import path from 'path';
import PngToIco from 'png-to-ico';
import { readFile } from 'fs/promises';

type Icons = {
    src: string; // eg. "favicon.ico"
    sizes: string; // eg. "256x256 48x48"
    type: string; // MIME type. eg. "image/x-icon" "image/png"
}

async function loadIconsFromManifestJson(filename: string): Promise<Icons[]> {
    try {
        const manifestJson = await readFile(filename);
        const manifest = JSON.parse(manifestJson.toString('utf8'));
        if (!('icons' in manifest) || !Array.isArray(manifest.icons)) {
            throw new Error(`there is no 'icons' array field. is this correct manifest.json file?`);
        }
        const icons = manifest.icons as Icons[];
        for (const icon of icons) {
            if (!('src' in icon) || !('sizes' in icon) || !('type' in icon)) {
                throw new Error('invalid icons[] field. is this correct manifest.json file?');
            }
        }
        return icons;
    }
    catch (e) {
        console.error(`loading manifest.json '${filename}' failed: ${e.name}: ${e.message}`);
        process.exit(1);
    }
}

function loadSvg(filename: string, size: { width: number, height: number }) {
    try {
        const svg = Svg2(filename);
        svg.svg.resize(size);
        return svg;
    }
    catch (e) {
        console.error(`loading SVG file '${filename}' failed: ${e.name}: ${e.message}`);
        process.exit(1);
    }
}

async function main() {
    // parse command line
    const optionDefinitions: commandLineUsage.OptionDefinition[] = [
        {
            name: 'help',
            alias: 'h',
            type: Boolean,
            description: 'Show this help.'
        },
        {
            name: 'manifest',
            alias: 'm',
            type: String,
            defaultValue: './public/manifest.json',
            description: 'specify manifest.json file.',
        },
        {
            name: 'src',
            defaultOption: true,
            type: String,
            description: 'SVG filename to read.'
        },
    ];

    const options = commandLineArgs(optionDefinitions);

    if (!options.help) {
        if (!options.src) {
            console.error('a SVG filename is required!');
            process.exitCode = 1;
            options.help = true;
        }
    }

    if (options.help) {
        const usage = commandLineUsage([
            {
                header: 'generate-icons',
                content: 'generate icon files defined in manifest.json from a SVG file.',
            },
            {
                header: 'Options',
                optionList: optionDefinitions,
            },
            {
                content: 'Project home: {underline https://github.com/koizuka/generate-icons}',
            },
        ]);
        console.log(usage);
        return;
    }

    const svgFileName = options.src;
    console.log(`Input SVG file: ${svgFileName}`);

    // read manifest.json
    const manifestFilename = options.manifest;
    const dirname = path.dirname(manifestFilename);

    const icons = await loadIconsFromManifestJson(manifestFilename);

    for (const icon of icons) {
        const fileName = path.join(dirname, icon.src);
        const sizes = icon.sizes.split(' ').map(s => {
            const m = s.match(/(\d+)x(\d+)/);
            if (!m || m.length < 3) {
                throw `invalid size: '${s}'`;
            }
            const width = parseInt(m[1], 10);
            const height = parseInt(m[2], 10);
            if (width !== height) {
                console.error(`${fileName}: invalid size: '${s}' (width: ${width}, height: ${height}). width must be equal to height. `);
                process.exit(1);
            }
            if (width < 8) {
                console.error(`${fileName}: size too small: '${s}' (${width}).`);
                process.exit(1);
            }
            return {
                width,
                height,
            };
        });

        console.log(`${fileName}: type: ${icon.type}`);

        try {
            switch (icon.type) {
                case "image/x-icon":
                    const pngs = await Promise.all(sizes.map(s => {
                        console.log('size:', s.width);
                        const svg = loadSvg(svgFileName, s);
                        return svg.png().toBuffer();
                    }));
                    const buf = await PngToIco(pngs);
                    writeFileSync(fileName, buf);
                    break;

                case "image/png":
                    console.log('size:', sizes[0].width);
                    const svg = loadSvg(svgFileName, sizes[0]);
                    await svg.png().toFile(fileName);
                    break;

                default:
                    console.warn('Unsupported type. ignored.');
            }
        }
        catch (e) {
            console.error(`writing file '${fileName}' failed: ${e.name}:${e.message}`);
            process.exit(1);

        }
    }
}

main();