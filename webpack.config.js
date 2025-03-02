const path = require("path");
const fs = require("fs");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

// Функция для поиска всех .pug файлов в указанной папке (и подпапках)
function getPugFiles(dir, root = dir) {
	return fs.readdirSync(dir).flatMap(item => {
		const fullPath = path.join(dir, item);
		const relativePath = path.relative(root, fullPath).replace(/\\/g, "/");
		if (fs.statSync(fullPath).isDirectory()) {
			return getPugFiles(fullPath, root);
		} else if (fullPath.endsWith(".pug")) {
			return [relativePath];
		}
		return [];
	});
}

const srcDir = path.resolve(__dirname, "src");
const componentsDir = path.resolve(__dirname, "src/components");
const pages = getPugFiles(srcDir);
const componentPugs = getPugFiles(componentsDir);

module.exports = {
	mode: "development",
	entry: {
		main: "./src/scripts/main.js",
		// Подключаем SCSS-файлы компонентов
		...componentPugs.reduce((entries, file) => {
			const scssPath = path.join(componentsDir, file.replace(/\.pug$/, ".scss"));
			if (fs.existsSync(scssPath)) {
				entries[`components/${file.replace(/\.pug$/, "")}`] = scssPath;
			}
			return entries;
		}, {}),
	},
	output: {
		filename: "[name].js",
		path: path.resolve(__dirname, "dist"),
		clean: true,
	},
	module: {
		rules: [
			{ // Обработка Pug
				test: /\.pug$/,
				use: ["pug-loader"],
			},
			{ // Обработка SCSS
				test: /\.s[ac]ss$/i,
				use: [
					MiniCssExtractPlugin.loader,
					"css-loader",
					"sass-loader",
				],
			},
			{ // Обработка JS
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
		// Генерация страниц
		...pages.map(file => new HtmlWebpackPlugin({
			filename: file.replace(/\.pug$/, ".html"),
			template: path.join(srcDir, file),
		})),
		// Генерация HTML для компонентов
		...componentPugs.map(file => new HtmlWebpackPlugin({
			filename: `components/${file.replace(/\.pug$/, ".html")}`,
			template: path.join(componentsDir, file),
		})),
		// Создание CSS файлов
		new MiniCssExtractPlugin({
			filename: "[name].css",
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