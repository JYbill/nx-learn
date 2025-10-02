/*
import { readFileSync } from "node:fs";

// Reading the SWC compilation config for the spec files
const swcJestConfig = JSON.parse(readFileSync(`${__dirname}/.swcrc`, "utf-8"));

// Disable .swcrc look-up by SWC core because we're passing in swcJestConfig ourselves
swcJestConfig.swcrc = false;

export default {
  displayName: "@nx-learn/api",
  preset: "../../jest.preset.js",
  testEnvironment: "node",
  testMatch: ["**!/!*spec.?([mc])ts"],
  transform: {
    "^.+\\.[tj]s$": ["@swc/jest", swcJestConfig],
  },
  moduleFileExtensions: ["ts", "js"],
  coverageDirectory: "api-output/jest/coverage",
};
*/
import type { Config } from 'jest';

export default {
  displayName: "@nx-learn/api",
  preset: "../../jest.preset.js",
  testEnvironment: "node",
  testMatch: ["**/*spec.?([mc])ts"],
  transform: {
    "^.+\\.ts$": ["ts-jest", {
      useEsm: true,
    }],
  },
  moduleFileExtensions: ["ts", "js"],
  extensionsToTreatAsEsm: [".ts"],
  coverageDirectory: "api-output/jest/coverage",
} satisfies Config;
