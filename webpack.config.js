const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const extractCSS = new ExtractTextPlugin('./view/dist/css/style.css');

const src_dir = './view/src/js/'

const config = [
    {
        entry: {
            bundle: src_dir + 'main.js'
        },
        output: {
            path: path.join(__dirname, 'view/dist/js'),
            filename: '[name].js'
        }
    },{
        entry: {
            style: src_dir + 'style.js',
        },
        output: {
            path: path.join(__dirname, 'view/dist/css'),
            filename: '[name].js'
        },
        module: {
            loaders: [{
                test: /\.css$/,
                loader: ExtractTextPlugin.extract("style-loader", "css-loader")
            },
            {
                test: /\.scss$/,
                loader: ExtractTextPlugin.extract("style-loader", "css-loader!sass-loader")
            }]
        },
        plugins: [
            new ExtractTextPlugin("[name].css")
        ]
    }
];

module.exports = config;