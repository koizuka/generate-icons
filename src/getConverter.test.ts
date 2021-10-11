import sizeOf from "image-size";
import { PNG } from "pngjs";
import { getConverter } from "./getConverter";
import { Icon } from "./loadIconsFromManifestJson";


describe('generateIconsFromSvgFile', () => {
  const testSvgFile = 'test-data/test.svg';

  test('unknown', () => {
    const unknownDef: Icon = {
      src: "test.unknown",
      sizes: [{ width: 48, height: 48 }],
      type: "image/unknown"
    }
    expect(getConverter(unknownDef.type)).toBeUndefined();
  });

  test('ico', async () => {
    const icoDef: Icon = {
      src: "test.ico",
      sizes: [{ width: 24, height: 24 }, { width: 48, height: 48 }, { width: 96, height: 96 }],
      type: "image/x-icon"
    };
    const convertToIco = getConverter(icoDef.type);
    expect(convertToIco).not.toBeUndefined();
    if (convertToIco) {
      const buffer = await convertToIco(testSvgFile, icoDef.sizes, {});
      expect(buffer).not.toBeNull();
      if (buffer) {
        const size = sizeOf(buffer);
        expect(size.images).toEqual(icoDef.sizes);
      }
    }
  });

  test('png', async () => {
    const pngDef: Icon = {
      src: "test.png",
      sizes: [{ width: 48, height: 48 }],
      type: "image/png"
    };
    const convertToPng = getConverter(pngDef.type);
    expect(convertToPng).not.toBeUndefined();
    if (convertToPng) {
      const buffer = await convertToPng(testSvgFile, pngDef.sizes, {});
      expect(buffer).not.toBeNull();
      if (buffer) {
        const png = PNG.sync.read(buffer);

        expect({ width: png.width, height: png.height }).toEqual({ width: 48, height: 48 });

        const get = (x: number, y: number) => {
          const start = (x + y * png.width) * 4;
          return png.data.slice(start, start + 4);
        }

        const red = [255, 0, 0, 255];
        const blue = [0, 0, 255, 255];
        const white = [255, 255, 255, 255];
        const magenta = [255, 0, 255, 255];
        const cyan = [0, 255, 255, 255];
        const transparent = [0, 0, 0, 0];

        expect(get(0, 0)).toEqual(Buffer.from(red));
        expect(get(47, 0)).toEqual(Buffer.from(blue));
        expect(get(0, 24)).toEqual(Buffer.from(transparent));
        expect(get(24, 24)).toEqual(Buffer.from(white));
        expect(get(47, 24)).toEqual(Buffer.from(transparent));
        expect(get(0, 47)).toEqual(Buffer.from(magenta));
        expect(get(47, 47)).toEqual(Buffer.from(cyan));
      }
    }
  });

});