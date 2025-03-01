const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
	entry: {
		main: "./src/scripts/main.js",
	},
	output: {
		filename: "scripts/[name].js",
		path: path.resolve(__dirname, "dist"),
		clean: true,
	},
	module: {
		rules: [
			// Обработка Pug
			{
				test: /\.pug$/,
				loader: "pug-loader",
				options: {
					pretty: true,
				},
			},
			// Обработка SCSS
			{
				test: /\.s[ac]ss$/i,
				use: [
					MiniCssExtractPlugin.loader,
					"css-loader",
					"sass-loader",
				],
			},
			// Обработка JS (если нужен Babel)
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: "babel-loader",
					options: {
						presets: ["@babel/preset-env"],
					},
				},
			},
		],
	},
	plugins: [
		// Компиляция HTML из Pug
		new HtmlWebpackPlugin({
			filename: "index.html",
			template: "./src/index.pug",
		}),
		// Создание CSS-файлов
		new MiniCssExtractPlugin({
			filename: "styles/[name].css",
		}),
	],
	resolve: {
		alias: {
			"@components": path.resolve(__dirname, "src/components"),
		},
	},
	devServer: {
		static: {
			directory: path.resolve(__dirname, "dist"),
		},
		compress: true,
		port: 8080,
		hot: true,
	},
};