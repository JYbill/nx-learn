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
