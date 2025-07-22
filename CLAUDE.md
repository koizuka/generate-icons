# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`generate-icons` is a TypeScript CLI tool that generates multiple icon files (ICO, PNG) from a single SVG source, reading requirements from a manifest.json file.

## Essential Commands

### Development

```bash
# Install dependencies
npm install

# Build TypeScript to JavaScript
npm run build

# Run tests
npm test

# Run a specific test file
npm test src/main.test.ts

# Run the CLI tool locally (after building)
./generate-icons --help
```

### Publishing

```bash
# Version bump and create git tag
npm version patch  # or minor/major

# Publish to NPM
npm publish
```

## Architecture

The codebase follows a modular design with clear separation of concerns:

1. **Entry Point**: `src/main.ts` - CLI argument parsing and orchestration
2. **Core Logic**: `src/getConverter.ts` - Handles SVG→PNG→ICO conversion pipeline
3. **Manifest Parser**: `src/loadIconsFromManifestJson.ts` - Reads icon specifications from manifest.json
4. **Error Handling**: `src/FatalError.ts` - Custom error class for user-friendly error messages

### Key Design Patterns

- **Converter Functions**: Each output format has a converter function that handles the transformation
- **Promise-based**: All async operations use Promises for clean error handling
- **Type Safety**: TypeScript strict mode ensures type correctness throughout

### Testing Strategy

Tests use Jest with ts-jest for TypeScript support. Key test files:

- `src/main.test.ts` - CLI integration tests
- `src/getConverter.test.ts` - Converter logic tests
- `src/loadIconsFromManifestJson.test.ts` - Manifest parsing tests

Test data is stored in `test-data/` directory.

## Important Implementation Details

1. **SVG to Raster Conversion**: Uses `oslllo-svg2` library which requires careful size specification
2. **ICO Format**: ICO files can contain multiple PNG images of different sizes (16x16, 32x32, 48x48, etc.)
3. **Background Handling**: Default is transparent; optional background color can be specified
4. **Path Resolution**: All file paths are resolved relative to the current working directory
5. **Error Messages**: Use `FatalError` class for user-facing errors to ensure clean output

## Common Tasks

### Adding a New Output Format

1. Add the MIME type handling in `src/getConverter.ts`
2. Create a converter function following the existing pattern
3. Add tests for the new format
4. Update README.md with the new capability

### Debugging Icon Generation Issues

1. Check the manifest.json structure - it should have an "icons" array
2. Verify SVG file is valid and accessible
3. Use `--background` flag if transparency issues occur
4. Check output paths are writable
