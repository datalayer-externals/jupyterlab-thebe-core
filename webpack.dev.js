const merge = require("webpack-merge").default;
const express = require("express");
const path = require("path");
const common = require("./webpack.common.js");

module.exports = merge(common, {
  mode: "development",
  devtool: "inline-source-map",
  module: {
    rules: [
      {
        test: /\.(svg)$/,
        use: ["file-loader"],
      },
    ],
  },
  devServer: {
    port: 3003,
    compress: true,
    static: ["dist/lib", "demo"],
  },
});