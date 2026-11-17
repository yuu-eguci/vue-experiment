// @vitest-environment node
// 本番ビルドの出力先とファイル構成を確かめるテストです。
// 既定の構成 (vite.config.mts) と MPA 構成 (vite.mpa.config.mts) をそれぞれ一時ディレクトリへビルドします。
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { build } from 'vite'
import { afterAll, describe, expect, it } from 'vitest'

const root = path.resolve(import.meta.dirname, '..')
const outDirs: string[] = []

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

// HTML が読み込む JavaScript (エントリーと modulepreload) の内容をまとめて返します。
function scriptsOf(outDir: string, htmlFile: string): string {
  const html = fs.readFileSync(path.join(outDir, htmlFile), 'utf8')
  const sources = Array.from(html.matchAll(/(?:src|href)="\/(assets\/[^"]+\.js)"/g), (match) => match[1])
  expect(sources.length, `${htmlFile} が JavaScript を読み込んでいません。`).toBeGreaterThan(0)
  return sources.map((source) => fs.readFileSync(path.join(outDir, source), 'utf8')).join('\n')
}

afterAll(() => {
  for (const outDir of outDirs) {
    fs.rmSync(outDir, { recursive: true, force: true })
  }
})

describe('本番ビルド', () => {
  it('既定の構成では index.html、favicon.ico、assets を出力します', async () => {
    const outDir = await buildWith('vite.config.mts')
    expect(fs.readdirSync(outDir).sort()).toEqual(['assets', 'favicon.ico', 'index.html'])
    const html = fs.readFileSync(path.join(outDir, 'index.html'), 'utf8')
    expect(html).toContain('<div id="app"></div>')
    expect(html).toContain('href="/favicon.ico"')
    expect(html).toMatch(/<script type="module" crossorigin src="\/assets\/[^"]+\.js"><\/script>/)
    expect(html).not.toContain('<%')
    const scripts = scriptsOf(outDir, 'index.html')
    expect(scripts).toContain('This is Page1.')
    expect(scripts).toContain('Welcome!!')
    expect(fs.readdirSync(path.join(outDir, 'assets')).some((file) => /^logo-.+\.png$/.test(file))).toBe(true)
  })

  it('MPA の構成では index.html と spa.html をそれぞれのエントリーから出力します', async () => {
    const outDir = await buildWith('vite.mpa.config.mts')
    expect(fs.readdirSync(outDir).sort()).toEqual(['assets', 'favicon.ico', 'index.html', 'spa.html'])
    const indexScripts = scriptsOf(outDir, 'index.html')
    expect(indexScripts).toContain('This is index page.')
    expect(indexScripts).not.toContain('This is Page1.')
    const spaScripts = scriptsOf(outDir, 'spa.html')
    expect(spaScripts).toContain('This is Page1.')
    expect(spaScripts).not.toContain('This is index page.')
    expect(fs.readFileSync(path.join(outDir, 'spa.html'), 'utf8')).toContain('Spa')
  })
})
