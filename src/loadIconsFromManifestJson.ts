import { readFile } from 'fs/promises';
import { FatalError } from "./FatalError";

type IconField = {
  src: string; // eg. "favicon.ico"
  sizes: string; // eg. "256x256 48x48"
  type: string; // MIME type. eg. "image/x-icon" "image/png"
}

function isIconField(obj: object): obj is IconField {
  return ('src' in obj)
    && ('sizes' in obj)
    && ('type' in obj);
}

export type Size = {
  width: number;
  height: number;
}

export type Icon = {
  src: string; // eg. "favicon.ico"
  sizes: Size[];
  type: string; // MIME type. eg. "image/x-icon" "image/png"
}

export function parseIconSizes(sizes: string): Size[] {
  return sizes.split(' ').map(s => {
    const m = s.match(/(\d+)x(\d+)/);
    if (!m || m.length < 3) {
      throw new Error(`invalid size: '${s}'`);
    }
    const width = parseInt(m[1], 10);
    const height = parseInt(m[2], 10);
    if (width !== height) {
      throw new Error(`invalid size: '${s}' (width: ${width}, height: ${height}). width must be equal to height.`);
    }
    if (width < 8) {
      throw new Error(`size too small: '${s}' (${width}).`);
    }
    return {
      width,
      height,
    };
  });
}

function iconFieldToIcon(iconField: IconField): Icon {
  try {
    return {
      ...iconField,
      sizes: parseIconSizes(iconField.sizes),
    }
  } catch (e: any) {
    throw new FatalError(`${iconField.src}: ${e.message}}`, {});
  }
}

export async function loadIconsFromManifestJson(filename: string): Promise<Icon[]> {
  try {
    const manifestJson = await readFile(filename);
    const manifest = JSON.parse(manifestJson.toString('utf8'));
    if (!('icons' in manifest) || !Array.isArray(manifest.icons)) {
      throw new Error(`there is no 'icons' array field. is this correct manifest.json file?`);
    }
    const icons = manifest.icons as IconField[];
    for (const icon of icons) {
      if (!isIconField(icon)) {
        throw new Error('invalid icons[] field. is this correct manifest.json file?');
      }
    }
    return icons.map(field => iconFieldToIcon(field));
  }
  catch (err: unknown) {
    const error = err as Error;
    throw new FatalError(`loading manifest.json failed`, { filename, error });
  }
}
