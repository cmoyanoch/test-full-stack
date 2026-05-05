/** @type {import('jest').Config} */
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testEnvironment: 'node',
  testRegex: '\\.e2e-spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.e2e.json',
      },
    ],
  },
  moduleNameMapper: {
    '^@app/(.*)$': '<rootDir>/src/$1',
  },
  globalSetup: '<rootDir>/test/e2e-global-setup.ts',
  globalTeardown: '<rootDir>/test/e2e-global-teardown.ts',
  testTimeout: 60_000,
  maxWorkers: 1,
  forceExit: true,
};
