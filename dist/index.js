"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const command_line_args_1 = __importDefault(require("command-line-args"));
const command_line_usage_1 = __importDefault(require("command-line-usage"));
// @ts-ignore
const oslllo_svg2_1 = __importDefault(require("oslllo-svg2"));
const path_1 = __importDefault(require("path"));
const png_to_ico_1 = __importDefault(require("png-to-ico"));
async function main() {
    // parse command line
    const optionDefinitions = [
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
    const options = command_line_args_1.default(optionDefinitions);
    if (!options.src) {
        console.error('a SVG filename is required!');
        process.exitCode = 1;
        options.help = true;
    }
    if (options.help) {
        const usage = command_line_usage_1.default([
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
    const dirname = path_1.default.dirname(manifestFilename);
    const manifestJson = fs_1.readFileSync(manifestFilename);
    const manifest = JSON.parse(manifestJson.toString('utf8'));
    for (const icon of manifest.icons) {
        const fileName = path_1.default.join(dirname, icon.src);
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
        switch (icon.type) {
            case "image/x-icon":
                const pngs = await Promise.all(sizes.map(s => {
                    const svg = oslllo_svg2_1.default(svgFileName);
                    console.log('size:', s.width);
                    svg.svg.resize(s);
                    return svg.png().toBuffer();
                }));
                const buf = await png_to_ico_1.default(pngs);
                fs_1.writeFileSync(fileName, buf);
                break;
            case "image/png":
                console.log('size:', sizes[0].width);
                const svg = oslllo_svg2_1.default(svgFileName);
                svg.svg.resize(sizes[0]);
                await svg.png().toFile(fileName);
                break;
            default:
                console.warn('Unsupported type. ignored.');
        }
    }
}
main();
