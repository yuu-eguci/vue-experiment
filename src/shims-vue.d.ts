// webpack 側の型チェッカーが .vue ファイルを import できるようにするための宣言です。
declare module '*.vue' {
  import Vue from 'vue'
  export default Vue
}
