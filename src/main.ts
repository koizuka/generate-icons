import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Command } from "commander";
import { FatalError } from "./FatalError.js";
import { getConverter } from "./getConverter.js";
import { loadIconsFromManifestJson } from "./loadIconsFromManifestJson.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function getVersion(): string {
	const packageJsonPath = path.join(__dirname, "..", "package.json");
	try {
		const packageJson = readFileSync(packageJsonPath, "utf8");
		const pkg = JSON.parse(packageJson);
		return pkg.version;
	} catch (err: unknown) {
		const error = err as Error;
		throw new FatalError(`reading '${packageJsonPath}' failed`, { error });
	}
}

const program = new Command();

program
	.name("generate-icons")
	.description("generate icon files defined in manifest.json from a SVG file.")
	.version(getVersion())
	.argument("<src>", "SVG filename to read")
	.option(
		"-m, --manifest <file>",
		"Specify manifest.json file",
		"./public/manifest.json",
	)
	.option(
		"--background <color>",
		'Background color (eg. "white", "#ffffff"). transparent if not specified',
	)
	.addHelpText(
		"after",
		"\nProject home: https://github.com/koizuka/generate-icons",
	)
	.action(
		async (src: string, opts: { manifest: string; background?: string }) => {
			const log = (...args: unknown[]) => console.log(...args);

			log(`Input SVG file: ${src}`);

			try {
				const manifestFilename = opts.manifest;
				const dirname = path.dirname(manifestFilename);

				const icons = await loadIconsFromManifestJson(manifestFilename);
				for (const icon of icons) {
					const filename = path.join(dirname, icon.src);
					log(`${filename}: type: ${icon.type}`);
					const convert = getConverter(icon.type);
					if (!convert) {
						log(`Unsupported type '${icon.type}'. ignored.`);
						continue;
					}

					let buffer: Buffer;
					try {
						buffer = await convert(src, icon.sizes, {
							background: opts.background,
							log,
						});
					} catch (err) {
						const error = err as Error;
						throw new FatalError(`failed to convert`, {
							filename: icon.src,
							error,
						});
					}

					try {
						writeFileSync(filename, buffer);
					} catch (err: unknown) {
						const error = err as Error;
						throw new FatalError(`failed to write`, { filename, error });
					}
				}
			} catch (err: unknown) {
				console.error(err);
				process.exit(1);
			}
		},
	);

program.parse();
