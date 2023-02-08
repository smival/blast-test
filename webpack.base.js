const path = require('path');
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");
const WebpackBeforeBuildPlugin = require('before-build-webpack');
const StyleExtHtmlWebpackPlugin = require("style-ext-html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
    entry: './src/index.ts',

    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            },
            {
                test: /\.(png|svg|jpg|gif|mp3|ogg)$/,
                use: 'file-loader'
            },
            {
                test: /\.css$/i,
                use: [MiniCssExtractPlugin.loader, "css-loader"],
            },
        ]
    },

    resolve: {
        extensions: [ '.tsx', '.ts', '.js' ]
    },

    output: {
        filename: 'app.js',
        path: path.resolve(__dirname, 'dist')
    },

// https://webpack.js.org/guides/hot-module-replacement/
    plugins: [
        new WebpackBeforeBuildPlugin(function(stats, callback) {
            // ...
        }, ['versionPatch']),
        new CleanWebpackPlugin({ verbose:true }),
        new CopyPlugin({
            patterns: [
                { from: "assets" },
            ],
            options: {
                concurrency: 100,
            },
        }),
        new HtmlWebpackPlugin({  title: `Game version v${JSON.stringify(require('./package.json').version)}`  }),
        new MiniCssExtractPlugin({
            linkType: "text/css",
        }),
        new StyleExtHtmlWebpackPlugin(),
        new webpack.HotModuleReplacementPlugin()
    ]
};