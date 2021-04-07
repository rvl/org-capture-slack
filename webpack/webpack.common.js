const webpack = require("webpack");
const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const srcDir = path.join(__dirname, "..", "src");
const _ = require("lodash");

function makeEntries(entries) {
  return _(entries)
    .flatMap((names, ext) => _(names)
      .map(name => [name, path.join(srcDir, `${name}.${ext}`)])
      .value())
    .fromPairs()
    .value();
}

module.exports = {
    entry: makeEntries({
      ts: [
        "background_grab_token",
        "background_org_capture_slack",
        "content_capture_button",
        "content_enhance_slack",
        "content_slack_in_browser",
        "popup",
        "options",
      ],
      // these could be built with react
      // tsx: [ "popup", "options" ]
    }),
    output: {
        path: path.join(__dirname, "../dist"),
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
