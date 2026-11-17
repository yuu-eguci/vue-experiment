// @vitest-environment jsdom
// MPA 構成の index ページ (src/pages/index/main.ts) をマウントして表示を確かめるテストです。
import { beforeAll, describe, expect, it } from 'vitest'
import { bodyText, linkTo, waitForText } from './helpers'

beforeAll(async () => {
  document.body.innerHTML = '<div id="app"></div>'
  await import('../src/pages/index/main')
  await waitForText('This is index page.')
})

describe('MPA の index ページ (src/pages/index/main.ts)', () => {
  it('index ページの本文と SPA ページへのリンクを表示します', () => {
    expect(bodyText()).toBe('This is index page. Go to SPA page.')
    expect(linkTo('/spa').textContent).toBe('SPA page')
  })
})
