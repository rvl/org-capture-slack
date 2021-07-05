const webpack = require("webpack");
const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const _ = require("lodash");

const srcDir = path.join(__dirname, "..", "src");
const distDir = path.join(__dirname, "..", "dist");
const chromeOut = path.join(distDir, "chrome");
const firefoxOut = path.join(distDir, "firefox");

function makeEntrypoints(entrypoints) {
  return _(entrypoints.firefox)
    .flatMap((names, ext) => _(names)
      .map(name => [name, path.join(srcDir, `${name}.ts`)])
      // .map(name => [name, {
      //   "import": path.join(srcDir, `${name}.${ext}`),
      //   "filename": `${br}/[name][ext]`
      // }])
      .value())
    .fromPairs()
    .value();
}

module.exports = {
    entry: makeEntrypoints({
      chrome: { ts: [
        // common
        "content_slack_in_browser",
        "content_capture_button",
        "content_enhance_slack",
        // chrome
        "chrome_background_grab_token",
        "chrome_background_org_capture_slack",
        "chrome_popup",
        "chrome_options",
      ] },
      firefox: { ts: [
        // common
        "content_slack_in_browser",
        "content_capture_button",
        "content_enhance_slack",
        // firefox
        "firefox_background_grab_token",
        "firefox_background_org_capture_slack",
      ] },
    }),
    output: {
        path: distDir,
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
            patterns: [
              { from: ".", to: "../dist/chrome", context: "public" },
              { from: ".", to: "../dist/firefox", context: "public" },
              { from: ".", to: "../dist", context: "public" },
              { from: "chrome.json", to: path.join(chromeOut, "manifest.json") },
              { from: "firefox.json", to: path.join(firefoxOut, "manifest.json") },
              { from: "firefox.json", to: path.join(distDir, "manifest.json") },
              { from: 'node_modules/webextension-polyfill/dist/browser-polyfill.js', to: path.join(chromeOut) },
              { from: 'node_modules/webextension-polyfill/dist/browser-polyfill.js', to: path.join(firefoxOut) },
              { from: 'node_modules/webextension-polyfill/dist/browser-polyfill.js' },
            ],
            options: {},
        }),
    ],
    watchOptions: {
      ignored: ['**/node_modules', '**/dist', '**/.*', '**/#*'],
    },
};
