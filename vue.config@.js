module.exports = {
  pages: {
    index: {
      entry: 'src/pages/index/main.ts', // エントリーポイントとなる ts
      template: 'public/index.html', // テンプレートの HTML
      filename: 'index.html', // build 時に出力されるファイル名
    },
    spa: {
      entry: 'src/pages/spa/main.ts',
      template: 'public/spa.html',
      filename: 'spa.html',
    },
  },
}