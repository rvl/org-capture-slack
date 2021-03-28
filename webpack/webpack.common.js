const webpack = require("webpack");
const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const srcDir = path.join(__dirname, "..", "src");

module.exports = {
    entry: {
      background: path.join(srcDir, 'background.ts'),
      content_script: path.join(srcDir, 'content_script.ts'),
      slackinbrowser: path.join(srcDir, 'slackinbrowser.ts'),
      popup: path.join(srcDir, 'popup.ts'),
      options: path.join(srcDir, 'options.ts'),
      // these could be built with react
      // popup: path.join(srcDir, 'popup.tsx'),
      // options: path.join(srcDir, 'options.tsx'),
    },
    output: {
        path: path.join(__dirname, "../dist/js"),
        filename: "[name].js",
    },
    optimization: {
        // splitChunks: {
        //     name: "vendor",
        //     chunks: "initial",
        // },
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js"],
    },
    plugins: [
        new CopyPlugin({
            patterns: [{ from: ".", to: "../", context: "public" }],
            options: {},
        }),
    ],
    watchOptions: {
      ignored: ['**/node_modules', '**/dist', '**/.*'],
    },
};
