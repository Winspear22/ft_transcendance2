const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    host: '0.0.0.0',
    allowedHosts: 'made-f0cr5s6',
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Host": "made-f0cr5s6"
    }
  }
})