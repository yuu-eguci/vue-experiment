// @vitest-environment node
// 本番ビルドの出力先とファイル構成を確かめるテストです。
// 既定の構成 (vite.config.mts) と MPA 構成 (vite.mpa.config.mts) をそれぞれ一時ディレクトリへビルドし、
// Vue CLI 4 のころと同じパス (js/、css/、img/、<名前>.<8 桁の 16 進ハッシュ>.<拡張子>) で出力されることを確認します。
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { build } from 'vite'
import { afterAll, describe, expect, it } from 'vitest'

const root = path.resolve(import.meta.dirname, '..')
const outDirs: string[] = []
const hash = '[0-9a-f]{8}'

async function buildWith(configFile: string): Promise<string> {
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vue-experiment-build-'))
  outDirs.push(outDir)
  await build({
    configFile: path.join(root, configFile),
    logLevel: 'silent',
    build: { outDir, emptyOutDir: true },
  })
  return outDir
}

function read(outDir: string, file: string): string {
  return fs.readFileSync(path.join(outDir, file), 'utf8')
}

// outDir 配下のファイルを、outDir からの相対パス ('/' 区切り) で列挙します。
function listFiles(outDir: string, dir = outDir): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name)
    return entry.isDirectory() ? listFiles(outDir, fullPath) : [path.relative(outDir, fullPath).split(path.sep).join('/')]
  })
}

// 出力されたファイルが、パターン (ハッシュ部分は `${hash}`) とちょうど 1 対 1 で対応することを確かめます。
function expectLayout(outDir: string, patterns: string[]): string[] {
  const files = listFiles(outDir).sort()
  const regexps = patterns.map((pattern) => new RegExp(`^${pattern.replace(/\./g, '\\.')}$`))
  for (const regexp of regexps) {
    expect(files.filter((file) => regexp.test(file)), `${regexp} に一致するファイルが 1 つではありません: ${files.join(', ')}`).toHaveLength(1)
  }
  expect(files.filter((file) => !regexps.some((regexp) => regexp.test(file))), '想定していないファイルがあります。').toEqual([])
  return files
}

function findFile(files: string[], pattern: string): string {
  const regexp = new RegExp(`^${pattern}$`)
  const file = files.find((candidate) => regexp.test(candidate))
  expect(file, `${pattern} が見つかりません。`).toBeDefined()
  return file as string
}

// HTML が参照する /js/ と /css/ のファイルを、参照の種類ごとに返します。参照先が存在することも確かめます。
function referencesOf(outDir: string, htmlFile: string) {
  const html = read(outDir, htmlFile)
  const pick = (pattern: RegExp) => Array.from(html.matchAll(pattern), (match) => match[1])
  const references = {
    scripts: pick(/<script type="module" crossorigin src="\/([^"]+)"><\/script>/g),
    modulepreloads: pick(/<link rel="modulepreload" crossorigin href="\/([^"]+)">/g),
    stylesheets: pick(/<link rel="stylesheet" crossorigin href="\/([^"]+)">/g),
  }
  for (const file of [...references.scripts, ...references.modulepreloads, ...references.stylesheets]) {
    expect(fs.existsSync(path.join(outDir, file)), `${htmlFile} が参照する ${file} がありません。`).toBe(true)
  }
  return references
}

// JavaScript の末尾にソースマップへの参照があり、ソースマップに元のソースが含まれていることを確かめ、そのソース一覧を返します。
function sourcesOf(outDir: string, jsFile: string): string[] {
  expect(read(outDir, jsFile).trimEnd().endsWith(`//# sourceMappingURL=${path.basename(jsFile)}.map`)).toBe(true)
  const map = JSON.parse(read(outDir, `${jsFile}.map`)) as { sources: string[] }
  expect(map.sources.length).toBeGreaterThan(0)
  return map.sources
}

// chunk-vendors には node_modules のコードと、ツールが追加するコード (@vitejs/plugin-vue のヘルパー、Vite の modulepreload の polyfill) だけが入ります。
function expectVendorOnly(sources: string[]): void {
  const isVendor = (source: string) => /node_modules|plugin-vue:export-helper|vite\/modulepreload-polyfill/.test(source)
  expect(sources.filter((source) => !isVendor(source))).toEqual([])
}

function expectAppOnly(sources: string[]): void {
  expect(sources.filter((source) => source.includes('node_modules'))).toEqual([])
}

afterAll(() => {
  for (const outDir of outDirs) {
    fs.rmSync(outDir, { recursive: true, force: true })
  }
})

describe('既定の構成 (vite.config.mts) の本番ビルド', () => {
  let outDir: string
  let files: string[]

  it('Vue CLI 4 と同じパスにファイルを出力します', async () => {
    outDir = await buildWith('vite.config.mts')
    files = expectLayout(outDir, [
      'index.html',
      'spa.html',
      'favicon.ico',
      `js/app.${hash}.js`,
      `js/app.${hash}.js.map`,
      `js/chunk-vendors.${hash}.js`,
      `js/chunk-vendors.${hash}.js.map`,
      `css/app.${hash}.css`,
      `img/logo.${hash}.png`,
    ])
  })

  it('index.html は js/ と css/ のファイルを読み込み、アプリのコードと node_modules のコードを分けて出力します', () => {
    const app = findFile(files, `js/app\\.${hash}\\.js`)
    const vendors = findFile(files, `js/chunk-vendors\\.${hash}\\.js`)
    const css = findFile(files, `css/app\\.${hash}\\.css`)
    expect(referencesOf(outDir, 'index.html')).toEqual({ scripts: [app], modulepreloads: [vendors], stylesheets: [css] })
    const html = read(outDir, 'index.html')
    expect(html).toContain('<link rel="icon" href="/favicon.ico">')
    expect(html).toContain('<div id="app"></div>')
    expect(html).not.toContain('<%')
    expect(read(outDir, app)).toContain('This is Page1.')
    expect(read(outDir, app)).toContain('Welcome!!')
    expect(read(outDir, app)).toContain(`/${findFile(files, `img/logo\\.${hash}\\.png`)}`)
    expect(read(outDir, vendors)).not.toContain('This is Page1.')
    expectAppOnly(sourcesOf(outDir, app))
    expectVendorOnly(sourcesOf(outDir, vendors))
  })

  it('spa.html は base を埋め込んだ静的なページとして出力し、未展開のテンプレートやスクリプトを含めません', () => {
    const html = read(outDir, 'spa.html')
    expect(html).not.toContain('<%')
    expect(html).not.toContain('<script')
    expect(html).toContain('<link rel="icon" href="/favicon.ico">')
    expect(html).toContain('<title>vue-experiment</title>')
    expect(html).toContain("We're sorry but vue-experiment doesn't work properly without JavaScript enabled.")
    expect(html).toMatch(/\n\s*Spa\n\s*<div id="app"><\/div>\n/)
  })
})

describe('MPA の構成 (vite.mpa.config.mts) の本番ビルド', () => {
  let outDir: string
  let files: string[]

  it('Vue CLI 4 と同じパスにファイルを出力します', async () => {
    outDir = await buildWith('vite.mpa.config.mts')
    files = expectLayout(outDir, [
      'index.html',
      'spa.html',
      'favicon.ico',
      `js/index.${hash}.js`,
      `js/index.${hash}.js.map`,
      `js/spa.${hash}.js`,
      `js/spa.${hash}.js.map`,
      `js/chunk-vendors.${hash}.js`,
      `js/chunk-vendors.${hash}.js.map`,
    ])
  })

  it('index.html と spa.html はそれぞれのエントリーと共通の chunk-vendors を読み込みます', () => {
    const index = findFile(files, `js/index\\.${hash}\\.js`)
    const spa = findFile(files, `js/spa\\.${hash}\\.js`)
    const vendors = findFile(files, `js/chunk-vendors\\.${hash}\\.js`)
    expect(referencesOf(outDir, 'index.html')).toEqual({ scripts: [index], modulepreloads: [vendors], stylesheets: [] })
    expect(referencesOf(outDir, 'spa.html')).toEqual({ scripts: [spa], modulepreloads: [vendors], stylesheets: [] })
    expect(read(outDir, index)).toContain('This is index page.')
    expect(read(outDir, index)).not.toContain('This is Page1.')
    expect(read(outDir, spa)).toContain('This is Page1.')
    expect(read(outDir, spa)).not.toContain('This is index page.')
    expect(read(outDir, 'spa.html')).toMatch(/\n\s*Spa\n\s*<div id="app"><\/div>\n/)
    expectAppOnly(sourcesOf(outDir, index))
    expectAppOnly(sourcesOf(outDir, spa))
    expectVendorOnly(sourcesOf(outDir, vendors))
  })
})
