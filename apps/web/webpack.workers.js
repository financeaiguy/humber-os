const path = require('path')

module.exports = {
  target: 'webworker',
  mode: 'production',
  entry: './src/workers-main.tsx',
  output: {
    filename: 'worker.js',
    path: path.resolve(__dirname, 'dist-workers'),
    library: { type: 'module' },
  },
  experiments: {
    outputModule: true,
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    fallback: {
      "events": require.resolve("events/"),
      "util": require.resolve("util/"),
      "crypto": false,
      "stream": false,
      "fs": false,
      "path": false,
      "os": false
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              configFile: 'tsconfig.workers.json',
              transpileOnly: true,
            },
          },
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['css-loader'],
      },
    ],
  },
  // Remove externals - bundle everything for Workers
  externals: {},
  optimization: {
    minimize: true,
    usedExports: true,
    sideEffects: false,
  },
}
