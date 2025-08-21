export default {
  displayName: 'api',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: './tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/api',
  testMatch: [
    "./**/*.spec.ts",
  ],
  transformIgnorePatterns: [
    '/node_modules/',
    '\\.pnp\\.[^\\/]+$',
    // 忽略所有 dist 目录
    '.*/dist/.*',
    // 或者更具体地忽略 workspace 包的 dist 目录
    'libs/.*/dist/.*',
    'apps/.*/dist/.*'
  ],
  modulePathIgnorePatterns: [
    '<rootDir>/libs/.*/dist',
    '<rootDir>/apps/.*/dist',
    // 或者更通用的模式
    '.*/dist/.*'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '.*/dist/.*'
  ]
};
