/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ["**/*.test.ts"],
  transformIgnorePatterns: [
    "/node_modules/(?!png-to-ico/)"
  ],
  transform: {
    '\\.ts$': 'ts-jest',
    '\\.js$': ['babel-jest', { presets: [['@babel/preset-env', { targets: { node: 'current' } }]] }],
  },
};
