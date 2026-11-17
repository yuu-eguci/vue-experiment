import { expect, vi } from 'vitest'

// テストで共通して使う DOM 操作の補助関数です。

// 空白をまとめた body のテキストを返します。テンプレートの改行やインデントに左右されずに比較できます。
export function bodyText(): string {
  return (document.body.textContent ?? '').replace(/\s+/g, ' ').trim()
}

// ルーターの遷移や再描画は非同期に行われるため、期待するテキストが現れるまで待ちます。
export async function waitForText(...texts: string[]): Promise<void> {
  await vi.waitFor(() => {
    for (const text of texts) {
      expect(bodyText()).toContain(text)
    }
  })
}

// 指定した href を持つリンクを取得します。見つからない場合はテストを失敗させます。
export function linkTo(href: string): HTMLAnchorElement {
  const link = document.querySelector<HTMLAnchorElement>(`a[href="${href}"]`)
  expect(link, `href="${href}" のリンクが見つかりません。`).not.toBeNull()
  return link as HTMLAnchorElement
}

// ロケール変更ボタンを取得します。
export function localeButton(): HTMLButtonElement {
  const button = document.querySelector<HTMLButtonElement>('button[type="button"]')
  expect(button, 'ロケール変更ボタンが見つかりません。').not.toBeNull()
  return button as HTMLButtonElement
}
