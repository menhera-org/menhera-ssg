const path = require('node:path');

/** @type {import('webpack').Configuration} */
module.exports = {
  mode: 'production',
  target: 'web',
  entry: {
    'menhera-window': './src/index.ts',
  },
  devtool: [{ type: "all", use: "source-map" }],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    clean: true,
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: "css-loader",
            options: {
              exportType: "string",
              esModule: true,
            },
          }
        ],
        exclude: /node_modules/,
      },
    ],
  },
};
