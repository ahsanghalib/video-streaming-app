const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const nodeExternals = require('webpack-node-externals')
const path = require('path')

module.exports = {
  entry: [path.join(__dirname, 'src/server.ts')],
  output: {
    filename: 'server.js',
    path: path.resolve(__dirname, 'build'),
  },
  module: {
    rules: [
      {
        exclude: [path.resolve(__dirname, 'node_modules')],
        test: /\.(js|ts)$/,
        use: {
          loader: 'ts-loader',
          options: {
            configFile: 'tsconfig.json',
          },
        },
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  target: 'node',
  devtool: 'source-map',
  externals: [nodeExternals()],
  mode: 'production',
  node: {
    __dirname: false,
    __filename: false,
  },
  plugins: [new CleanWebpackPlugin()],
}
