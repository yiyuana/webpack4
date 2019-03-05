const path = require('path');

// 给node的process.env设置NODE_ENV后才能查看到，依赖是corss-env
// const env = process.env.NODE_ENV
// console.log(process.env.NODE_ENV);

// html部分处理插件
const htmlWebpackPlugin = require('html-webpack-plugin');   // html处理

// css部分处理插件
// const extractTextPlugin = require("extract-text-webpack-plugin");   // extract-text-webpack-plugin不支持webpack4
const MiniCssExtractPlugin  = require("mini-css-extract-plugin");     // 采用mini-css-extract-plugin，使CSS分离
const glob = require('glob');   // 因为需要同步检查html模板，所以需要引入node的glob对象使用
const PurifyCSSPlugin = require("purifycss-webpack");                 // 消除无用的css

// 引入webpack，webpack自带很多插件可以使用
const webpack=require('webpack');

const config = {
    // mode: env,
    entry: {    // 入口文件
        src: './src/main.js'
    },
    devtool: 'inline-source-map',
    output: {   // 出口文件
        path: path.resolve(__dirname, 'dist'),  // 输出文件的路径
        filename: '[name].js',   // 输出文件名称
        publicPath: './'    // 打包路径为相对路径
    },
    resolve: {  // 解析
        alias: {    // 配置解析别名
            '@': path.resolve('src')   // 不在script中使用需要在之前加~才能正常解析
        }
    },
    module: {
        rules: [
            {   // 解析css
                test: /\.css$/,
                use: [  // 按顺序
                    {
                        loader: 'style-loader'
                    }, 
                    MiniCssExtractPlugin.loader,    // 分离css
                    {
                        loader: 'css-loader',
                        options: {
                            importLoaders: 1            // 在css中使用@import引入其他文件时，不加importLoaders，postcss-loader不会操作引入的文件
                        }
                    },
                    {   
                        loader: 'postcss-loader'        // css自动补全前缀 
                    } 
                ]
            },
            {
                test: /\.less$/,
                use: [
                    'style-loader',
                    MiniCssExtractPlugin.loader,    // 分离css
                    {
                        loader: 'css-loader'
                    },
                    {
                        loader: 'less-loader'   // 不用加importLoader，less-loader默认会有
                    },
                    {   
                        loader: 'postcss-loader'        // css自动补全前缀 
                    } 
                ]
            },
            {   // babel解析es6
                test: /\.js$/,
                use: {
                    loader: 'babel-loader'
                },
                exclude: /node_modules/   // 忽略这个目录，提高打包速度
            },
            {   // 图片处理
                test: /\.(png|jpg|gif)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 100,     // 把小于100字节的图片打成Base64的格式，写入JS
                            outputPath: './static/images/',   // 图片输出目录
                            publicPath: '../images/'    // 解决图片打包路径问题
                        },
                    }
                ]
            }
        ]
    },
    plugins: [
        new htmlWebpackPlugin({
            minify: {   // 是对html文件进行压缩，removeAttrubuteQuotes是却掉属性的双引号。
                removeAttributeQuotes: true
            },
            hash: true, // 为了开发中js有缓存效果，所以加入hash，这样可以有效避免缓存JS。
            template: './src/index.html'  // 是要打包的html模版路径和文件名称
        }),
        new MiniCssExtractPlugin({  // 分离css
            filename: './static/css/[name]-buddle.css'
        }),
        new webpack.HotModuleReplacementPlugin(),    //引入热更新插件,解决模块多导致热更新缓慢的问题
        new webpack.ProvidePlugin({ // 1、自动加载模块，而不必用import或require 2、如果加载的模块没有使用，则不会被打包 3、加载的模块为全局模块，在全局都可以使用
            $:'jquery',    //接收名字:模块名
        }),
        new PurifyCSSPlugin({   // 消除无用的css，提高代码质量
            paths: glob.sync(path.resolve(__dirname, 'src/*.html'))
        })
    ],
    optimization: { // 正常都使用默认，不然可以使用一下分离库
        splitChunks: {
            // chunks: 'initial',  // 哪些代码需要优化,三个可选值：initial(初始块)、async(按需加载块)、all(全部块)
            cacheGroups: {  // 缓存组，需要可以配置多个
                vendors: {  
                    test: /vue/,    // 用于控制哪些模块被这个缓存组匹配到
                    chunks: 'initial',    
                    name: 'vendors',
                    minChunks: 2
                }
            }
        }
    },
    devServer: {
        historyApiFallback: true,   // 任意的 404 响应都可能需要被替代为 index.html
        contentBase: path.resolve(__dirname, 'dist'), // 默认情况下，将使用当前工作目录作为提供内容的目录
        inline: true,   // 应用程序启用内联模式
        compress: true, // 一切服务都启用gzip 压缩
        port: 3000,     // 端口
        open: true,     // 自动打开默认浏览器
        hot: true       // 启用 webpack 的模块热替换特性
    }
};

module.exports = config;
