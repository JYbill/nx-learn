import { NxAppWebpackPlugin } from "@nx/webpack/app-plugin.js";
import { join } from "node:path";

module.exports = {
  output: {
    path: join(__dirname, '../../dist/apps/api'),
    ...(process.env.NODE_ENV !== 'production' && {
      devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    }),
    clean: true
  },
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: "swc",
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      assets: ['./src/assets'],
      optimization: false,
      skipTypeChecking: true,
      outputHashing: 'none',
      generatePackageJson: true,
      sourceMap: true,
      progress: true,

      //test
      namedChunks: true,
    }),
  ],
};
