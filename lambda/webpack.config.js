module.exports = {
  entry: ['./build/lambda/index.js'],
  target: 'node',
  mode: 'production',
  externals: ['aws-sdk'],
  output: {
    path: `${process.cwd()}/build/bundled`,
    filename: 'lambda.js',
    libraryTarget: 'umd',
  },
};
