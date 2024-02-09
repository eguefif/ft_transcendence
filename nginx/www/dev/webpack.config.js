const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	entry: [
		__dirname + '/scripts/main.js',
		__dirname + '/scss/styles.scss',
	],
	output: {
		path: path.resolve(__dirname, '../build/scripts'),
		clean: true,
	},
	plugins: [
		new CopyWebpackPlugin({
			patterns: [
				{ from: 'images', to: '../images' },
				{ from: 'index.html', to: '../index.html' }
			]
		})
	],
	module: {
		rules: [
			{
				test:/\.js$/i,
				exclude: /node_modules/,
				use:{
					loader: 'babel-loader',
				}
			},
			{
				test: /\.s[ac]ss$/i,
				exclude: /node_modules/,
				use: [
					{
						loader: 'file-loader',
						options: { outputPath: '../styles', name: 'styles.css' }
					},
					"sass-loader"
				]
			},
		],
	},
};
