const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	entry: [
		__dirname + '/js/main.js',
		__dirname + '/scss/styles.scss'
	],
	output: {
		path: path.resolve(__dirname, '../build'),
		clean: true,
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: './index.html',
			filename: 'index.html',
		}),
	],
	module: {
		rules: [
			{
				test:/\.js$/i,
				exclude: /node_modules/,
				use: [
					{
						loader: 'babel-loader',
					}
				]
			},
			{
				test: /\.s[ac]ss$/i,
				exclude: /node_modules/,
				use: [
					{
						loader: 'file-loader',
						options: { name: 'styles.css' }
					},
					"sass-loader"
				]
			},
			{
				test: /\.(svg|png|jpg|gif)$/i,
				type: 'asset',
			},
		],
	},
};
