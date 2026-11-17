# 開発サーバーの起動と、型チェック・テスト・ビルドの実行に使うイメージです。
# Node.js のバージョンは .node-version と合わせています。
FROM node:26.13.1-trixie-slim

WORKDIR /app
RUN chown node:node /app
# 公式イメージの node ユーザー (UID 1000) で実行します。
USER 1000:1000

# package-lock.json に従って依存関係を入れます。ソースより先にコピーすることで、依存関係が変わらない限りこの層を再利用できます。
COPY --chown=node:node package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY --chown=node:node . .

EXPOSE 8080
# コンテナの外からアクセスできるように、すべてのインターフェースで待ち受けます。
CMD ["npm", "run", "serve", "--", "--host", "0.0.0.0"]
