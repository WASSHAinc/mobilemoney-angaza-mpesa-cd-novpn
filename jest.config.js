/** @type {import('ts-jest').JestConfigWithTsJest} */
const { pathsToModuleNameMapper } = require('ts-jest')
const { compilerOptions } = require('./tsconfig.json')
moduleNameMapper = pathsToModuleNameMapper(compilerOptions.paths)

module.exports = {
  preset: 'ts-jest',
  rootDir: 'src',
  transform: {
    "^.+\\.(t|j)sx?$": "@swc/jest",
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  reporters: ['default'],
  verbose: true,
  testTimeout: 60000,
  testEnvironment: 'node',
  moduleNameMapper
};
