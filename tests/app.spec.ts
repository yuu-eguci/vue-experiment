// @vitest-environment jsdom
// 既定のアプリ (index.html から読み込まれる src/main.ts) を実際にマウントし、
// ルーティングとロケール切り替えの振る舞いを DOM から確かめるテストです。
import { beforeAll, describe, expect, it } from 'vitest'
import { bodyText, linkTo, localeButton, waitForText } from './helpers'

beforeAll(async () => {
  window.history.replaceState(null, '', '/')
  document.body.innerHTML = '<div id="app"></div>'
  await import('../src/main')
  await waitForText('This is Index page.')
})

describe('既定のアプリ (src/main.ts)', () => {
  it('トップページでは Index、ヘッダーのリンク、フッターを表示します', () => {
    const text = bodyText()
    expect(text).toContain('This is Index page.')
    expect(text).toContain('Welcome!!')
    expect(text).toContain('Welcome to Your Vue.js App')
    expect(text).not.toContain('PagesLayout')
    const hrefs = Array.from(document.querySelectorAll('#header a')).map((link) => link.getAttribute('href'))
    expect(hrefs).toEqual(['/', '/page1', '/page2', '/page3'])
    expect(document.querySelector('img')?.getAttribute('src')).toMatch(/logo/)
    // Vue 2 では #app の要素がアプリのルート要素に置き換えられていました。Vue 3 でも #app が 1 つだけになることを確かめます。
    expect(document.querySelectorAll('#app')).toHaveLength(1)
  })

  it.each(['1', '2', '3'])('page%s へのリンクでは PagesLayout の中に対応するページを表示します', async (page) => {
    linkTo(`/page${page}`).click()
    await waitForText('This is PagesLayout.', `This is Page${page}.`)
    expect(window.location.pathname).toBe(`/page${page}`)
    expect(bodyText()).not.toContain('Index page')
    expect(document.querySelector('.pagename')?.textContent).toBe('PagesLayout')
  })

  it('top へのリンクで Index に戻ります', async () => {
    linkTo('/').click()
    await waitForText('This is Index page.')
    expect(window.location.pathname).toBe('/')
    expect(bodyText()).not.toContain('PagesLayout')
  })

  it('ロケール変更ボタンで英語と日本語を切り替えます', async () => {
    expect(localeButton().textContent?.trim()).toBe('Change Locale')
    localeButton().click()
    await waitForText('ロケール変更', 'ようこそ!')
    expect(bodyText()).not.toContain('Welcome!!')
    localeButton().click()
    await waitForText('Change Locale', 'Welcome!!')
  })
})
