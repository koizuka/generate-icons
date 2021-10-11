
export class FatalError extends Error {
  readonly filename?: string;
  readonly error?: object;

  constructor(message: string, { error, filename }: { error?: object; filename?: string; }) {
    super([
      filename,
      message,
      error && error.toString(),
    ].join(': '));

    this.filename = filename;
    this.error = error;

    this.name = 'FatalError';
  }

  toString(): string {
    return this.message;
  }
}
