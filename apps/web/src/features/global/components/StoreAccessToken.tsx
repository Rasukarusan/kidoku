// このコンポーネントは以前はaccessTokenをlocalStorageに保存していましたが、
// 現在は認証がセッションクッキーベースのため不要になりました。
// 互換性のため空のコンポーネントとして残しています。
export const StoreAccessToken = () => {
  return <></>
}
