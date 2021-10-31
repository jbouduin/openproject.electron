import * as path from 'path';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';

module.exports = (env: string) => {
  if (!env) { env = 'development'; }
  return {
    entry: {
      main: './src/main/main.ts'
    },
    target: 'electron-main',
    output: {
      path: path.resolve(__dirname, '../../dist/main'),
      filename: 'electron-main.js'
    },
    externals: [ ],
    devtool: 'source-map',
    module: {
      rules: [
        {
          test: /\.ts?$/,
          loader: 'ts-loader',
          exclude: /node_modules/
        }
      ]
    },
    resolve: {
      extensions: ['.js', '.ts', '.tsx', '.jsx', '.json'],
      plugins: [new TsconfigPathsPlugin({ configFile: './src/main/tsconfig.json' })],
      alias: { }
    },
    node: {
      __dirname: true,
      __filename: true
    },
    plugins: [
      new CopyPlugin({
        patterns: [
          {
            from: '**/*',//path.resolve(__dirname, '../../src/main/static/**/*').replace(/\\/g, '/'),
            to: path.resolve(__dirname, '../../dist/main/static'),
            context: path.resolve(__dirname, '../../src/main/static')
          }
        ]
      }),
    ]
  };
};
