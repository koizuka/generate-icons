import { readFileSync } from 'fs';
import { renderAsync } from '@resvg/resvg-js';
import PngToIco from 'png-to-ico';
import { FatalError } from './FatalError';
import { Size } from './loadIconsFromManifestJson';

async function getPngFromSvgFile(filename: string, { size, background }: { size: { width: number, height: number }, background?: string }): Promise<Buffer> {
  try {
    const svg = readFileSync(filename, 'utf-8');
    const result = await renderAsync(svg, {
      fitTo: { mode: 'width', value: size.width },
      background,
      font: { loadSystemFonts: true },
    });
    return result.asPng();
  }
  catch (err: unknown) {
    const error = err as Error;
    throw new FatalError(`failed loading SVG file`, { filename, error });
  }
}

export type GenerateIconOptions = {
  background?: string;
  log?: (...message: any[]) => void,
}

async function svgToIco(svgFilename: string, sizes: Size[], { background, log }: GenerateIconOptions): Promise<Buffer> {
  const pngs = await Promise.all(sizes.map(size => {
    log && log('size:', size.width);
    return getPngFromSvgFile(svgFilename, { size, background });
  }));
  return await PngToIco(pngs);
}

async function svgToPng(svgFilename: string, sizes: Size[], { background, log }: GenerateIconOptions): Promise<Buffer> {
  if (sizes.length !== 1) {
    throw Error(`PNG: number of sizes must be 1, but ${sizes.length}`)
  }
  log && log('size:', sizes[0].width);
  return await getPngFromSvgFile(svgFilename, { size: sizes[0], background });
}

type Converter = (svgFilename: string, sizes: Size[], { background, log }: GenerateIconOptions) => Promise<Buffer>;

const converters: { [type: string]: Converter } = {
  'image/x-icon': svgToIco,
  'image/png': svgToPng,
};

export function getConverter(type: string): Converter | undefined {
  return converters[type];
}
