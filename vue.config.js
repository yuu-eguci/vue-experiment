module.exports = {
  pages: {
    index: {
      entry: 'src/pages/index/main.js', // エントリーポイントとなる js
      template: 'public/index.html', // テンプレートの HTML
      filename: 'index.html', // build 時に出力されるファイル名
    },
    spa: {
      entry: 'src/pages/spa/main.js',
      template: 'public/spa.html',
      filename: 'spa.html',
    },
  },
}