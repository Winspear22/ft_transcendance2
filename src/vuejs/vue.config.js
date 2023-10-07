//const { defineConfig } = require('@vue/cli-service')
//module.exports = defineConfig({
//  transpileDependencies: true
//})
const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    host: '0.0.0.0',
    allowedHosts: ['paul-f4ar5s6', 'localhost'],
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Host": "paul-f4ar5s6"
    }
  }
})
