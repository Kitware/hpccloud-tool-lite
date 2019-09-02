const vtkChainWebpack = require('vtk.js/Utilities/config/chainWebpack');

module.exports = {
  publicPath: process.env.NODE_ENV === 'production' ? '/tools/' : '/',
  chainWebpack: (config) => {
    // Add vtk.js rules
    vtkChainWebpack(config);
  },
};
