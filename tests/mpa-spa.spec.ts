// @vitest-environment jsdom
// MPA 構成の spa ページ (src/pages/spa/main.ts) をマウントし、
// ルーティングとロケール切り替えの振る舞いを確かめるテストです。
import { beforeAll, describe, expect, it } from 'vitest'
import { bodyText, linkTo, localeButton, waitForText } from './helpers'

beforeAll(async () => {
  window.history.replaceState(null, '', '/page1')
  document.body.innerHTML = '<div id="app"></div>'
  await import('../src/pages/spa/main')
  await waitForText('This is Page1.')
})

describe('MPA の spa ページ (src/pages/spa/main.ts)', () => {
  it('/page1 では Page1、ヘッダーのリンク、フッターを表示します', () => {
    const text = bodyText()
    expect(text).toContain('Welcome!!')
    expect(text).toContain('Welcome to Your Vue.js App')
    const links = Array.from(document.querySelectorAll('#header a')).map((link) => [link.getAttribute('href'), link.textContent])
    expect(links).toEqual([['/', 'page1'], ['/page2', 'page2'], ['/page3', 'page3']])
    expect(document.querySelectorAll('#app')).toHaveLength(1)
  })

  it.each(['2', '3'])('page%s へのリンクで対応するページを表示します', async (page) => {
    linkTo(`/page${page}`).click()
    await waitForText(`This is Page${page}.`)
    expect(window.location.pathname).toBe(`/page${page}`)
    expect(bodyText()).not.toContain('This is Page1.')
  })

  it('ロケール変更ボタンで英語と日本語を切り替えます', async () => {
    localeButton().click()
    await waitForText('ロケール変更', 'ようこそ!')
    localeButton().click()
    await waitForText('Change Locale', 'Welcome!!')
  })
})
