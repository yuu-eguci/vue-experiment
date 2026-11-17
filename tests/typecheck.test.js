// vue-tsc による型チェックが、実際のアプリケーションコード (スクリプトとテンプレート) の
// 型の誤りを検出できることを確かめるテストです。
// src を一時ディレクトリへ複製し、何も変えない状態では型チェックが成功すること、
// 各ファイルにわざと型の誤りを入れた状態では、その位置でエラーが報告されることを確認します。
const assert = require('assert')
const fs = require('fs')
const os = require('os')
const path = require('path')
const { spawnSync } = require('child_process')

const root = path.resolve(__dirname, '..')

// file: 書き換えるファイル、from: 元の記述 (ファイル内で一意である必要があります)、
// to: 型の誤りを含む記述、code: 期待する TypeScript のエラーコードです。
const mutations = [
  { file: 'src/main.ts', from: "locale: 'en',", to: 'locale: 0,', code: 'TS2322' },
  { file: 'src/router.ts', from: "mode: 'history',", to: "mode: 'browser',", code: 'TS2322' },
  { file: 'src/App.vue', from: '<Footer msg="Welcome to Your Vue.js App"/>', to: '<Footer :msg="404"/>', code: 'TS2322' },
  { file: 'src/App.vue', from: "? 'en' : 'ja'", to: "? 'en' : 0", code: 'TS2322' },
  { file: 'src/components/Footer.vue', from: '{{ msg }}', to: '{{ msg.toFixed() }}', code: 'TS2551' },
  { file: 'src/components/HelloWorld.vue', from: '<h1>{{ msg }}</h1>', to: '<h1>{{ msg.toFixed() }}</h1>', code: 'TS2551' },
  { file: 'src/components/Index.vue', from: '$t("message.welcome")', to: '$t(404)', code: 'TS2345' },
  { file: 'src/components/Page1.vue', from: '$t("message.welcome")', to: '$t(404)', code: 'TS2345' },
  { file: 'src/components/Page2.vue', from: '$t("message.welcome")', to: '$t(404)', code: 'TS2345' },
  { file: 'src/components/Page3.vue', from: '$t("message.welcome")', to: '$t(404)', code: 'TS2345' },
  { file: 'src/components/PagesLayout.vue', from: '>PagesLayout<', to: '>{{ undefinedName }}<', code: 'TS2339' },
  { file: 'src/pages/index/Index.vue', from: 'This is index page.', to: 'This is {{ undefinedName }} page.', code: 'TS2339' },
  { file: 'src/pages/index/main.ts', from: "$mount('#app')", to: '$mount(404)', code: 'TS2345' },
  { file: 'src/pages/spa/main.ts', from: "locale: 'en',", to: 'locale: 0,', code: 'TS2322' },
  { file: 'src/pages/spa/router.ts', from: 'component: Page1,', to: "component: 'Page1',", code: 'TS2322' },
  { file: 'src/pages/spa/Spa.vue', from: '<Footer msg="Welcome to Your Vue.js App"/>', to: '<Footer :msg="404"/>', code: 'TS2322' },
  { file: 'src/pages/spa/Spa.vue', from: "? 'en' : 'ja'", to: "? 'en' : 0", code: 'TS2322' },
]

// tsconfig.json と src を一時ディレクトリへ複製し、node_modules はシンボリックリンクで参照します。
function makeProjectCopy() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vue-experiment-typecheck-'))
  fs.copyFileSync(path.join(root, 'tsconfig.json'), path.join(dir, 'tsconfig.json'))
  copyDir(path.join(root, 'src'), path.join(dir, 'src'))
  fs.symlinkSync(path.join(root, 'node_modules'), path.join(dir, 'node_modules'), 'dir')
  return dir
}

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true })
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const source = path.join(from, entry.name)
    const target = path.join(to, entry.name)
    if (entry.isDirectory()) {
      copyDir(source, target)
    } else {
      fs.copyFileSync(source, target)
    }
  }
}

function runVueTsc(cwd) {
  const vueTsc = require.resolve('vue-tsc/bin/vue-tsc.js', { paths: [root] })
  const result = spawnSync(process.execPath, [vueTsc, '--noEmit', '-p', 'tsconfig.json'], { cwd, encoding: 'utf8' })
  return { status: result.status, output: `${result.stdout}${result.stderr}` }
}

// 書き換えた行を求めたうえで、記述を型の誤りへ置き換えます。
function applyMutation(dir, mutation) {
  const filePath = path.join(dir, mutation.file)
  assert.ok(fs.existsSync(filePath), `${mutation.file} が存在しません。`)
  const source = fs.readFileSync(filePath, 'utf8')
  const index = source.indexOf(mutation.from)
  assert.ok(index !== -1, `${mutation.file} に "${mutation.from}" が見つかりません。`)
  assert.strictEqual(source.indexOf(mutation.from, index + 1), -1, `${mutation.file} に "${mutation.from}" が複数あります。`)
  fs.writeFileSync(filePath, source.slice(0, index) + mutation.to + source.slice(index + mutation.from.length))
  return source.slice(0, index).split('\n').length
}

function parseErrors(output) {
  const pattern = /^(.+?)\((\d+),\d+\): error (TS\d+):/gm
  const errors = []
  let match
  while ((match = pattern.exec(output)) !== null) {
    errors.push({ file: match[1].replace(/\\/g, '/'), line: Number(match[2]), code: match[3] })
  }
  return errors
}

const tests = {
  '型の誤りを入れていないコードは型チェックに成功します'() {
    const dir = makeProjectCopy()
    try {
      const { status, output } = runVueTsc(dir)
      assert.strictEqual(status, 0, `型チェックが失敗しました。\n${output}`)
    } finally {
      fs.rmSync(dir, { recursive: true, force: true })
    }
  },

  'スクリプトとテンプレートに入れた型の誤りをすべて検出します'() {
    const dir = makeProjectCopy()
    try {
      const expected = mutations.map((mutation) => ({ ...mutation, line: applyMutation(dir, mutation) }))
      const { status, output } = runVueTsc(dir)
      assert.notStrictEqual(status, 0, `型の誤りがあるのに型チェックが成功しました。\n${output}`)
      const errors = parseErrors(output)
      for (const mutation of expected) {
        const found = errors.some((error) => error.file === mutation.file && error.line === mutation.line && error.code === mutation.code)
        assert.ok(found, `${mutation.file}:${mutation.line} の ${mutation.code} が報告されませんでした ("${mutation.to}")。\n${output}`)
      }
      const mutatedFiles = new Set(expected.map((mutation) => mutation.file))
      const unexpected = errors.filter((error) => !mutatedFiles.has(error.file))
      assert.deepStrictEqual(unexpected, [], `書き換えていないファイルでエラーが報告されました。\n${output}`)
    } finally {
      fs.rmSync(dir, { recursive: true, force: true })
    }
  },
}

let failed = 0
for (const [name, test] of Object.entries(tests)) {
  try {
    test()
    process.stdout.write(`ok - ${name}\n`)
  } catch (error) {
    failed += 1
    process.stdout.write(`not ok - ${name}\n${error.message}\n`)
  }
}
process.exitCode = failed === 0 ? 0 : 1
