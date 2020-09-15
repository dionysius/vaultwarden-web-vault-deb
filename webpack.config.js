const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const AngularCompilerPlugin = require('@ngtools/webpack').AngularCompilerPlugin;

if (process.env.NODE_ENV == null) {
    process.env.NODE_ENV = 'development';
}
const ENV = process.env.ENV = process.env.NODE_ENV;

const moduleRules = [
    {
        test: /\.ts$/,
        enforce: 'pre',
        loader: 'tslint-loader',
    },
    {
        test: /\.(html)$/,
        loader: 'html-loader',
    },
    {
        test: /.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
        exclude: /loading.svg/,
        use: [{
            loader: 'file-loader',
            options: {
                name: '[name].[ext]',
                outputPath: 'popup/fonts/',
                publicPath: './fonts/',
            },
        }],
    },
    {
        test: /\.(jpe?g|png|gif|svg)$/i,
        exclude: /.*(fontawesome-webfont|glyphicons-halflings-regular)\.svg/,
        use: [{
            loader: 'file-loader',
            options: {
                name: '[name].[ext]',
                outputPath: 'popup/images/',
                publicPath: './images/',
            },
        }],
    },
    {
        test: /\.scss$/,
        use: [
            {
                loader: MiniCssExtractPlugin.loader,
                options: {
                    publicPath: '../',
                }
            },
            'css-loader',
            'sass-loader',
        ],
    },
    // Hide System.import warnings. ref: https://github.com/angular/angular/issues/21560
    {
        test: /[\/\\]@angular[\/\\].+\.js$/,
        parser: { system: true },
    },
];

const plugins = [
    new CleanWebpackPlugin([
        path.resolve(__dirname, 'build/*'),
    ]),
    // ref: https://github.com/angular/angular/issues/20357
    new webpack.ContextReplacementPlugin(/\@angular(\\|\/)core(\\|\/)fesm5/,
        path.resolve(__dirname, './src')),
    new HtmlWebpackPlugin({
        template: './src/popup/index.html',
        filename: 'popup/index.html',
        chunks: ['popup/vendor-angular', 'popup/vendor', 'popup/main'],
    }),
    new HtmlWebpackPlugin({
        template: './src/background.html',
        filename: 'background.html',
        chunks: ['vendor', 'background'],
    }),
    new HtmlWebpackPlugin({
        template: './src/notification/bar.html',
        filename: 'notification/bar.html',
        chunks: ['notification/bar']
    }),
    new CopyWebpackPlugin([
        './src/manifest.json',
        { from: './src/_locales', to: '_locales' },
        { from: './src/images', to: 'images' },
        { from: './src/popup/images', to: 'popup/images' },
        { from: './src/content/autofill.css', to: 'content' },
    ]),
    new webpack.SourceMapDevToolPlugin({
        include: ['popup/main.js', 'background.js'],
    }),
    new MiniCssExtractPlugin({
        filename: '[name].css',
        chunkFilename: 'chunk-[id].css',
    }),
    new webpack.DefinePlugin({
        'process.env': {
            'ENV': JSON.stringify(ENV)
        }
    }),
];

if (ENV === 'production') {
    moduleRules.push({
        test: /(?:\.ngfactory\.js|\.ngstyle\.js|\.ts)$/,
        loader: '@ngtools/webpack',
    });
    plugins.push(new AngularCompilerPlugin({
        tsConfigPath: 'tsconfig.json',
        entryModule: 'src/popup/app.module#AppModule',
        sourceMap: true,
    }));
} else {
    moduleRules.push({
        test: /\.ts$/,
        loaders: ['ts-loader', 'angular2-template-loader'],
        exclude: path.resolve(__dirname, 'node_modules'),
    });
}

const config = {
    mode: ENV,
    devtool: false,
    entry: {
        'popup/main': './src/popup/main.ts',
        'background': './src/background.ts',
        'content/autofill': './src/content/autofill.js',
        'content/autofiller': './src/content/autofiller.ts',
        'content/notificationBar': './src/content/notificationBar.ts',
        'content/shortcuts': './src/content/shortcuts.ts',
        'content/sso': './src/content/sso.ts',
        'notification/bar': './src/notification/bar.js',
    },
    optimization: {
        minimize: false,
        splitChunks: {
            cacheGroups: {
                commons: {
                    test(module, chunks) {
                        return module.resource != null &&
                            module.resource.includes(`${path.sep}node_modules${path.sep}`) &&
                            !module.resource.includes(`${path.sep}node_modules${path.sep}@angular${path.sep}`);
                    },
                    name: 'popup/vendor',
                    chunks: (chunk) => {
                        return chunk.name === 'popup/main';
                    },
                },
                angular: {
                    test(module, chunks) {
                        return module.resource != null &&
                            module.resource.includes(`${path.sep}node_modules${path.sep}@angular${path.sep}`);
                    },
                    name: 'popup/vendor-angular',
                    chunks: (chunk) => {
                        return chunk.name === 'popup/main';
                    },
                },
                commons2: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendor',
                    chunks: (chunk) => {
                        return chunk.name === 'background';
                    },
                },
            },
        },
    },
    resolve: {
        extensions: ['.ts', '.js'],
        alias: {
            jslib: path.join(__dirname, 'jslib/src'),
        },
        symlinks: false,
        modules: [path.resolve('node_modules')],
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'build'),
    },
    module: { rules: moduleRules },
    plugins: plugins,
};

module.exports = config;
