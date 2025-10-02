import type { Config } from 'jest';

export default {
  displayName: "@nx-learn/esm-nest-jest",
  preset: "../../jest.preset.ts",
  testEnvironment: "node",
  testMatch: ["**/*spec.?([mc])ts"],
  transform: {
    "^.+\\.ts$": ["ts-jest", {
      useEsm: true,
      tsconfig: "<rootDir>/tsconfig.spec.json",
    }],
  },
  moduleFileExtensions: ["ts", "js"],
  extensionsToTreatAsEsm: [".ts"],
  coverageDirectory: "api-output/jest/coverage",
} satisfies Config;
