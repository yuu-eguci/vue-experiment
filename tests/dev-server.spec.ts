// @vitest-environment node
// 開発サーバーが /spa.html で返すページを確かめるテストです。
// Vue CLI 4 の開発サーバーは、既定の構成では public/spa.html を静的なページとして返していました。
import path from 'node:path'
import { createServer, type ViteDevServer } from 'vite'
import { afterEach, describe, expect, it } from 'vitest'

const root = path.resolve(import.meta.dirname, '..')
let server: ViteDevServer | undefined

async function fetchFrom(configFile: string, pathname: string): Promise<{ status: number; type: string | null; body: string }> {
  server = await createServer({
    configFile: path.join(root, configFile),
    logLevel: 'silent',
    server: { host: '127.0.0.1', port: 0, strictPort: false },
  })
  await server.listen()
  const response = await fetch(new URL(pathname, server.resolvedUrls?.local[0]))
  return { status: response.status, type: response.headers.get('content-type'), body: await response.text() }
}

afterEach(async () => {
  await server?.close()
  server = undefined
})

describe('開発サーバーの /spa.html', () => {
  it('既定の構成では本番ビルドと同じ静的なページを返します', async () => {
    const { status, type, body } = await fetchFrom('vite.config.mts', '/spa.html')
    expect(status).toBe(200)
    expect(type).toMatch(/^text\/html/)
    expect(body).not.toContain('<%')
    expect(body).not.toContain('<script')
    expect(body).toContain('<link rel="icon" href="/favicon.ico">')
    expect(body).toMatch(/\n\s*Spa\n\s*<div id="app"><\/div>\n/)
  })

  it('MPA の構成では SPA のエントリーを読み込むページを返します', async () => {
    const { status, body } = await fetchFrom('vite.mpa.config.mts', '/spa.html')
    expect(status).toBe(200)
    expect(body).toMatch(/<script type="module" src="[^"]*spa\/main\.ts"><\/script>/)
  })
})
