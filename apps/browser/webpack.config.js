const path = require("path");
const webpack = require("webpack");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { AngularWebpackPlugin } = require("@ngtools/webpack");
const TerserPlugin = require("terser-webpack-plugin");
const configurator = require("./config/config");

if (process.env.NODE_ENV == null) {
  process.env.NODE_ENV = "development";
}
const ENV = (process.env.ENV = process.env.NODE_ENV);
const manifestVersion = process.env.MANIFEST_VERSION == 3 ? 3 : 2;

console.log(`Building Manifest Version ${manifestVersion} app`);
const envConfig = configurator.load(ENV);
configurator.log(envConfig);

const moduleRules = [
  {
    test: /\.(html)$/,
    loader: "html-loader",
  },
  {
    test: /.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
    exclude: /loading.svg/,
    generator: {
      filename: "popup/fonts/[name][ext]",
    },
    type: "asset/resource",
  },
  {
    test: /\.(jpe?g|png|gif|svg)$/i,
    exclude: /.*(bwi-font|glyphicons-halflings-regular)\.svg/,
    generator: {
      filename: "popup/images/[name][ext]",
    },
    type: "asset/resource",
  },
  {
    test: /\.scss$/,
    use: [
      {
        loader: MiniCssExtractPlugin.loader,
      },
      "css-loader",
      "sass-loader",
    ],
  },
  {
    test: /\.[cm]?js$/,
    use: [
      {
        loader: "babel-loader",
        options: {
          configFile: false,
          plugins: ["@angular/compiler-cli/linker/babel"],
        },
      },
    ],
  },
  {
    test: /\.[jt]sx?$/,
    loader: "@ngtools/webpack",
  },
];

const plugins = [
  new HtmlWebpackPlugin({
    template: "./src/popup/index.html",
    filename: "popup/index.html",
    chunks: ["popup/polyfills", "popup/vendor-angular", "popup/vendor", "popup/main"],
  }),
  new HtmlWebpackPlugin({
    template: "./src/background.html",
    filename: "background.html",
    chunks: ["vendor", "background"],
  }),
  new HtmlWebpackPlugin({
    template: "./src/notification/bar.html",
    filename: "notification/bar.html",
    chunks: ["notification/bar"],
  }),
  new CopyWebpackPlugin({
    patterns: [
      manifestVersion == 3
        ? { from: "./src/manifest.v3.json", to: "manifest.json" }
        : "./src/manifest.json",
      { from: "./src/managed_schema.json", to: "managed_schema.json" },
      { from: "./src/_locales", to: "_locales" },
      { from: "./src/images", to: "images" },
      { from: "./src/popup/images", to: "popup/images" },
      { from: "./src/content/autofill.css", to: "content" },
    ],
  }),
  new MiniCssExtractPlugin({
    filename: "[name].css",
    chunkFilename: "chunk-[id].css",
  }),
  new webpack.DefinePlugin({
    "process.env": {
      ENV: JSON.stringify(ENV),
    },
  }),
  new AngularWebpackPlugin({
    tsConfigPath: "tsconfig.json",
    entryModule: "src/popup/app.module#AppModule",
    sourceMap: true,
  }),
  new CleanWebpackPlugin({
    cleanAfterEveryBuildPatterns: ["!popup/fonts/**/*"],
  }),
  new webpack.ProvidePlugin({
    process: "process/browser.js",
  }),
  new webpack.SourceMapDevToolPlugin({
    exclude: [/content\/.*/, /notification\/.*/],
    filename: "[file].map",
  }),
  new webpack.EnvironmentPlugin({
    FLAGS: envConfig.flags,
    DEV_FLAGS: ENV === "development" ? envConfig.devFlags : {},
  }),
];

const config = {
  mode: ENV,
  devtool: false,
  entry: {
    "popup/polyfills": "./src/popup/polyfills.ts",
    "popup/main": "./src/popup/main.ts",
    background: "./src/background.ts",
    "content/autofill": "./src/content/autofill.js",
    "content/autofiller": "./src/content/autofiller.ts",
    "content/notificationBar": "./src/content/notificationBar.ts",
    "content/contextMenuHandler": "./src/content/contextMenuHandler.ts",
    "content/message_handler": "./src/content/message_handler.ts",
    "notification/bar": "./src/notification/bar.js",
    "encrypt-worker": "../../libs/common/src/services/cryptography/encrypt.worker.ts",
  },
  optimization: {
    minimize: ENV !== "development",
    minimizer: [
      new TerserPlugin({
        exclude: [/content\/.*/, /notification\/.*/],
        terserOptions: {
          // Replicate Angular CLI behaviour
          compress: {
            global_defs: {
              ngDevMode: false,
              ngI18nClosureMode: false,
            },
          },
        },
      }),
    ],
    splitChunks: {
      cacheGroups: {
        commons: {
          test(module, chunks) {
            return (
              module.resource != null &&
              module.resource.includes(`${path.sep}node_modules${path.sep}`) &&
              !module.resource.includes(`${path.sep}node_modules${path.sep}@angular${path.sep}`)
            );
          },
          name: "popup/vendor",
          chunks: (chunk) => {
            return chunk.name === "popup/main";
          },
        },
        angular: {
          test(module, chunks) {
            return (
              module.resource != null &&
              module.resource.includes(`${path.sep}node_modules${path.sep}@angular${path.sep}`)
            );
          },
          name: "popup/vendor-angular",
          chunks: (chunk) => {
            return chunk.name === "popup/main";
          },
        },
      },
    },
  },
  resolve: {
    extensions: [".ts", ".js"],
    symlinks: false,
    modules: [path.resolve("../../node_modules")],
    alias: {
      sweetalert2: require.resolve("sweetalert2/dist/sweetalert2.js"),
      "#sweetalert2": require.resolve("sweetalert2/src/sweetalert2.scss"),
    },
    fallback: {
      assert: false,
      buffer: require.resolve("buffer/"),
      util: require.resolve("util/"),
      url: require.resolve("url/"),
    },
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "build"),
  },
  module: { rules: moduleRules },
  plugins: plugins,
};

if (manifestVersion == 2) {
  // We can't use this in manifest v3
  // Ideally we understand why this breaks it and we don't have to do this
  config.optimization.splitChunks.cacheGroups.commons2 = {
    test: /[\\/]node_modules[\\/]/,
    name: "vendor",
    chunks: (chunk) => {
      return chunk.name === "background";
    },
  };
} else {
  config.entry["content/misc-utils"] = "./src/content/misc-utils.ts";
}

module.exports = config;
