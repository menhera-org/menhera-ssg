const path = require('node:path');

/** @type {import('webpack').Configuration} */
module.exports = {
  mode: 'production',
  target: 'web',
  entry: {
    'menhera-window': './src/index.tsx',
  },
  devtool: [{ type: "all", use: "source-map" }],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    clean: true,
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
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
