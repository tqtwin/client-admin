const path = require('path');

module.exports = {
  entry: './src/index.js', // Entry point của ứng dụng
  output: {
    path: path.resolve(__dirname, 'dist'), // Thư mục xuất ra
    filename: 'bundle.js', // Tên file xuất ra
  },
  module: {
    rules: [
      {
        test: /\.js$/, // Tất cả các file JS
        exclude: /node_modules/, // Không áp dụng cho node_modules
        use: {
          loader: 'babel-loader', // Sử dụng babel-loader
        },
      },
      {
        test: /\.css$/, // Tất cả các file CSS
        use: ['style-loader', 'css-loader'], // Sử dụng style-loader và css-loader
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'], // Các loại file sẽ được giải quyết
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'), // Thư mục chứa file tĩnh
    compress: true,
    port: 9000, // Port cho dev server
  },
};
