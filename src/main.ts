import commandLineArgs from 'command-line-args';
import commandLineUsage from 'command-line-usage';
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { FatalError } from "./FatalError";
import { getConverter } from './getConverter';
import { loadIconsFromManifestJson } from "./loadIconsFromManifestJson";

export function getVersion() {
  const packageJson = readFileSync(path.join(__dirname, '..', 'package.json'));
  try {
    const pkg = JSON.parse(packageJson.toString('utf8'));
    return pkg.version;
  }
  catch (err: unknown) {
    const error = err as Error;
    throw new FatalError(`reading '${packageJson}' failed`, { error });
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
      name: 'version',
      alias: 'v',
      type: Boolean,
      description: 'Show version.'
    },
    {
      name: 'manifest',
      alias: 'm',
      type: String,
      defaultValue: './public/manifest.json',
      description: 'Specify manifest.json file.',
    },
    {
      name: 'src',
      defaultOption: true,
      type: String,
      description: 'SVG filename to read.'
    },
    {
      name: 'background',
      type: String,
      description: 'Background color(eg. "white", "#ffffff"). transparent if not specified.',
    },
  ];

  type Options = {
    help: boolean;
    version: boolean;
    manifest: string;
    src: string;
    background?: string;
  };

  const options = function (): Options {
    try {
      return commandLineArgs(optionDefinitions) as Options;
    }
    catch (err: unknown) {
      const e = err as Error
      console.error(`command line error: ${e.message}`);
      process.exit(1);
    }
  }();

  if (options.version) {
    console.log(getVersion());
    return;
  }

  if (!options.help) {
    if (!options.src) {
      console.error('an SVG filename is required!');
      process.exitCode = 1;
      options.help = true;
    }
  }

  if (options.help) {
    const usage = commandLineUsage([
      {
        header: `generate-icons ${getVersion()}`,
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

  const log = (...args: any[]) => console.log(...args);

  const svgFilename = options.src;
  log(`Input SVG file: ${svgFilename}`);

  // read manifest.json
  try {
    const manifestFilename = options.manifest;
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
        buffer = await convert(svgFilename, icon.sizes, {
          background: options.background,
          log,
        });
      } catch (err) {
        const error = err as Error;
        throw new FatalError(`failed to convert`, { filename: icon.src, error });
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
}

main();

