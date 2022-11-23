const path = require('path');

module.exports = {
  mode: 'production',
  entry: './use-signal/index.js',
  output: {
    path: path.resolve(__dirname, './demo/src/lib'),
    filename: 'react-use-signal.js',
    library: {
      type: 'module'
    }
  },
  experiments: {
    outputModule: true,
  },
};