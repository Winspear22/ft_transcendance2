const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    host: '0.0.0.0',
    allowedHosts: process.env.VUE_APP_HOSTNAME2,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Host": process.env.VUE_APP_HOSTNAME2
    }
  }
})