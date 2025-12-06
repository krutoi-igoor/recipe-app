/** @type {import('jest').Config} */
export default {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  testMatch: ['**/tests/**/*.test.js'],
  testPathIgnorePatterns: [
    'tests/api.test.js',  // Requires database
    'tests/collection.test.js', // Requires database
  ],
  collectCoverageFrom: ['src/**/*.js'],
  coveragePathIgnorePatterns: ['/node_modules/'],
  bail: 1,  // Stop on first failure for debugging
  verbose: true,
};
