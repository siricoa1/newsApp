const webpack = require('webpack');
const dotenv = require('dotenv');
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

dotenv.config({ path: path.resolve(__dirname, '.env') });

module.exports = {
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: "asset/resource",
      },
    ],
  },
  resolve: {
    extensions: [".js", ".jsx"],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html",
    }),
    new webpack.DefinePlugin({
      'process.env.REACT_APP_FIREBASE_API_KEY': JSON.stringify(process.env.REACT_APP_FIREBASE_API_KEY),
      'process.env.REACT_APP_AUTH_DOMAIN': JSON.stringify(process.env.REACT_APP_AUTH_DOMAIN),
      'process.env.REACT_APP_PROJECT_ID': JSON.stringify(process.env.REACT_APP_PROJECT_ID),
      'process.env.REACT_APP_STORAGE_BUCKET': JSON.stringify(process.env.REACT_APP_STORAGE_BUCKET),
      'process.env.REACT_APP_MESSAGING_SENDER_ID': JSON.stringify(process.env.REACT_APP_MESSAGING_SENDER_ID),
      'process.env.REACT_APP_APP_ID': JSON.stringify(process.env.REACT_APP_APP_ID),
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, "dist"),
    },
    compress: true,
    port: 3000,
    historyApiFallback: true,
  },
  mode: "development",
};
