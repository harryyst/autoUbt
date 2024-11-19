const { defineConfig } = require('@vue/cli-service')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const path=require('path')
const UbtPlugin = require('./ubtPlugin')
// const {routers,allRouters,pathRouteMap,fileId,clickContentList} = require('./loaderVar')

let routers=[]
let allRouters = []
const pathRouteMap = new Map()
let clickContentList = []

module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: "./",
  configureWebpack:{
    
    module: {
      rules: [
        {
          test: /\.vue$/, // 匹配.vue文件
          use: [
            // {
            //   loader: path.resolve(__dirname, 'testLoader.js'), // 使用自定义Loader处理Vue文件
            // },
            {
              loader: path.resolve(__dirname, 'ubtLoader.js'), // 使用自定义Loader处理Vue文件
              options:{
                pathRouteMap,
                routers,
                allRouters,
                clickContentList
              }
            }
          ]
        }
      ]
    },
    plugins:[
      new UbtPlugin()
    ]
    
  }
  
})
