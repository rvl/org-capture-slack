const webpack = require("webpack");
const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const _ = require("lodash");
const webpackMerge = require('webpack-merge');

const srcDir = path.join(__dirname, "..", "src");
const distDir = path.join(__dirname, "..", "dist");
const chromeOut = path.join(distDir, "chrome");
const firefoxOut = path.join(distDir, "firefox");

function makeEntryPoints(entrypoints) {
  return _(entrypoints)
    .flatMap((names, ext) => _(names)
      .map(name => [name, path.join(srcDir, `${name}.${ext}`)])
      .value())
    .fromPairs()
    .value();
}

module.exports = {
  merge: function(...names) {
    const configs = names.map(name => module.exports[name]);
    return webpackMerge(...configs);
  },
  base: {
    output: {
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
    plugins: [],
    watchOptions: {
      ignored: ['**/node_modules', '**/dist', '**/.*', '**/#*'],
    },
  },
  dev: {
    devtool: 'inline-source-map',
    mode: 'development'
  },
  prod: {
    mode: 'production'
  },
  firefox: {
    output: { path: firefoxOut },
    entry: makeEntryPoints({
      ts: [
        "content_slack_in_browser",
        "content_capture_button",
        "content_enhance_slack",
        "firefox_background_grab_token",
        "firefox_background_org_capture_slack",
      ],
    }),
    plugins: [
      new CopyPlugin({
          patterns: [
            { from: ".", to: firefoxOut, context: "public" },
            { from: "firefox.json", to: "manifest.json" },
          ],
      }),
    ],
  },
  chrome: {
    output: { path: chromeOut },
    entry: makeEntryPoints({
      ts: [
        "content_slack_in_browser",
        "content_capture_button",
        "content_enhance_slack",
        "chrome_background_grab_token",
        "chrome_background_org_capture_slack",
        "chrome_popup",
        "chrome_options",
      ],
    }),
    plugins: [
      new CopyPlugin({
          patterns: [
            { from: ".", to: chromeOut, context: "public" },
            { from: "chrome.json", to: "manifest.json" },
            { from: 'node_modules/webextension-polyfill/dist/browser-polyfill.js' },
          ],
      }),
    ],
  },
};
