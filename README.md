## 構築手順

```sh
# nextjs-typescriptの構築
$ mkdir nextjs-typescript-starter
$ cd nextjs-typescript-starter
$ mkdir -p src/pages
$ touch src/pages/index.tsx
$ yarn add react react-dom next typescript @types/react @types/react-dom @types/node

# eslint, prettier導入
$ yarn add -D eslint eslint-plugin-react @typescript-eslint/eslint-plugin @typescript-eslint/parser
$ yarn add -D prettier eslint-config-prettier eslint-plugin-prettier

# linter確認
$ yarn lint

# nowデプロイ
$ now login # Github logged in
$ now --prod

# material-ui導入
$ yarn add @material-ui/core @material-ui/icons @material-ui/lab
```

## 参考

- [Next v9 + TypeScript の環境構築 - Qiita](https://qiita.com/natsuhiko/items/c6f18187fafed4776c22)
- [初心者向け TypeScript 用に ESLint と Prettier を導入する - Qiita](https://qiita.com/y-w/items/dcf5fb4af52e990109eb)
- [Next.js+TypeScript でパスの alias を設定する - Qiita](https://qiita.com/tatane616/items/e3ee99a181662ad6824b)
