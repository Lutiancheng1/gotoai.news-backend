const path = require('path');

module.exports = {
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  devServer: {
    setupMiddlewares: (middlewares, devServer) => {
      return middlewares;
    }
  }
}; 