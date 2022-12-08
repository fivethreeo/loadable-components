const { defineConfig } = require('cypress')
const { devServer } = require('@cypress/webpack-dev-server')
require('@babel/register')

module.exports = defineConfig({
  component: {
    supportFile: false,

    devServer(devServerConfig) {
      return devServer({
        ...devServerConfig,
        webpackConfig: require('./webpack.config.babel.js').default
      })
    }
  }
})