import { parseIconSizes } from "./loadIconsFromManifestJson"

describe('parseIconSizes', () => {
  test('single size', () => {
    expect(parseIconSizes("24x24")).toEqual([{ width: 24, height: 24 }]);
  });

  test('multiple sizes', () => {
    expect(parseIconSizes("24x24 48x48 96x96")).toEqual([{ width: 24, height: 24 }, { width: 48, height: 48 }, { width: 96, height: 96 }]);
  });

  test('invalid size', () => {
    expect(() => parseIconSizes("test")).toThrowError(new Error("invalid size: 'test'"));
  });
})