const configs = require('./webpack.configs.js');

module.exports = configs.merge("base", "chrome", "prod");
