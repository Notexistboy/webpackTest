const path = require("path")
const uglify = require('uglifyjs-webpack-plugin');//压缩js插件
const htmlPlugin = require('html-webpack-plugin')
const extractTextPlugin = require('extract-text-webpack-plugin')

var website ={
  publicPath:"http://localhost:8888/"
  // publicPath:"http://192.168.1.103:8888/"
}//这里的IP和端口，是你本机的ip或者是你devServer配置的IP和端口。


/**
 * npm install --save-dev style-loader css-loader  解析css代码，引入style-loader css-loader
 * npm install --save-dev uglifyjs-webpack-plugin 解析js代码，引入一个uglifyjs-webpack-plugin
 * npm install --save-dev html-webpack-plugin 解析html代码，引入html-webpack-plugin
 * npm install --save-dev file-loader url-loader 解析图片链接，loader的解析,现在需要下载两个解析图片的loader
 * webpack最终会将各个模块打包成一个文件，因此我们样式中的url路径是相对入口html页面的，而不是相对于原始css文件所在的路径的。
 * npm install extract-text-webpack-plugin --save-dev css分离的插件
 * npm install html-withimg-loader --save-dev 打包编译分离图片
 * npm install --save-dev less less-loader less预编译器
 * 
 * 这就会导致图片引入失败。这个问题是用file-loader解决的，file-loader可以解析项目中的url引入（不仅限于css）。
 * 根据我们的配置，将图片拷贝到相应的路径，再根据我们的配置，修改打包后文件引用路径，使之指向正确的文件。
 * 如果图片较多，会发很多http请求，会降低页面性能。这个问题可以通过url-loader解决。url-loader会将引入的图片编码，生成dataURl。
 * 
 * 
 */

module.exports = {
  mode: 'development',//开发模式
  //入口文件配置项
  entry: {
    //main可以随便写？
    main:'./src/main.js'
  },
  //模块： 解读css，图片图和转换，压缩
  output:{
    //打包的路径
   path:path.resolve(__dirname,'../dist'),
   //打包的文件名称
   filename:'[name].js',   //这里[name] 是告诉我们入口进去的文件是什么名字，打包出来也同样是什么名字
   publicPath:website.publicPath  //publicPath：主要作用就是处理静态文件路径的。
},
  module: {
    //规则
    rules:[
      //css-loader
      {
        test:/\.css$/,
        use: extractTextPlugin.extract({
          use: [{
              loader: "css-loader"
              }, {
              loader: "less-loader"
          }],
          // use style-loader in development
          fallback: "style-loader"
        }),//使用分离的插件
        /* use:[//下载的两个包npm install style-loader css-loader --save-dev
          {loader: "style-loader"},
          {loader: "css-loader"}
        ] */
      },
      {
        test:/\.(png|jpg|gif|jpeg)/,  //是匹配图片文件后缀名称
        use:[{
          loader:'url-loader', //是指定使用的loader和loader的配置参数
          options:{
            limit:1024,  //是把小于500B的文件打成Base64的格式，写入JS
            //name: 'img/[name].[hash:7].[ext]',
            outputPath:'images/',
          }
        }]
      },
      {
        test: /\.(htm|html)$/i,
        use:[ 'html-withimg-loader'] 
      },
      {
        test: /\.less$/,
        use: [{
               loader: "style-loader" // creates style nodes from JS strings
            }, 
            {
                loader: "css-loader" // translates CSS into CommonJS
            },
            {
                loader: "less-loader" // compiles Less to CSS
            }]
      },
      //babel 配置
      {
        test:/\.(jsx|js)$/,
        use:{
            loader:'babel-loader',
            options:{
                presets:[
                    "es2015","react"
                ]
            }
        },
        exclude:/node_modules/
      }
    ]
  },
  //插件： 生产模板和各项功能
  plugins: [
    new uglify(),
    new htmlPlugin({
          minify:{ //是对html文件进行压缩
              removeAttributeQuotes:true  //removeAttrubuteQuotes是却掉属性的双引号。
          },
          hash:true, //为了开发中js有缓存效果，所以加入hash，这样可以有效避免缓存JS。
          template:'./src/index.html' //是要打包的html模版路径和文件名称。
        }),
    new extractTextPlugin('css/index.css')  //这里的/css/index.css 是分离后的路径
  ],
  //配置webpack开发服务功能
  devServer:{
    //设置基本目录结构
    contentBase:path.resolve(__dirname, '../dist'),
    //服务器IP地址，可以使用IP地址可以使用localhost
    host: 'localhost',
    //服务器端是否开启
    compress: true,
    //配置服务端口号
    port: 8080,
  },
}