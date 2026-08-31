# JULIUS WORKROOM v1.3.4 検証記録

検証日: 2026-08-31

## 対象

- CLOUD SYNCパネル内の同期payloadサイズ表示
- 既存900KB安全停止判定との計算共通化
- v1.3.3までの保存形式、同期、JSON、PWA、UI互換

## 結果

- JavaScript構文: `index.html`、`cloud-sync.js`、`firebase-config.js`、`service-worker.js`すべて正常
- サイズ計算: `cleanPayload` → `JSON.stringify` → `Blob.size` を表示とwriteLocalで共用
- 安全上限: `CLOUD_PAYLOAD_SAFE_LIMIT = 900 * 1024` を表示と同期停止で共用
- 表示: 現在KB、900KBに対する%、残りKB、progress barをローカルブラウザで確認
- 状態: 通常、70%、85%、95%、900KB超を自動テストで確認
- 誤解防止: Firebaseアカウント全体の容量ではない旨を表示
- 非保存: パネル描画は純粋なサイズ計算だけ。無変更の設定終了時も`save()`を呼ばないことを確認
- 既存停止: 900KB超で同期を停止し、ローカルとJSONに全データが残る文言を維持
- 保存形式: `julius_workroom_v1`、schema version 10、新規保存フィールドなし
- データ: WORK、EXERCISE、プランクreps、週間目標、categories、projects、INBOX、syncTestsを維持
- 同期: Firebase Auth、Firestore単一ドキュメント、revision、hash、writerId、競合防止を維持
- JSON: 書き出し／読み込み互換を維持
- PWA: manifest、App Shell、v1.3.4キャッシュ名、`cloud-sync.js?v=1.3.4`による旧キャッシュ回避を確認
- PC表示: 2.8 KB / 900 KB、0%、残り約897 KB、通常バー、Firebase容量注記を確認
- ブラウザコンソール: アプリ由来のエラー0件。Firebase 10.12.5の既存永続キャッシュAPIに関する非推奨警告だけを確認
- レスポンシブ: 既存のスマホ用設定モーダル構造と、幅固定を持たないメーターCSSを確認

## 実機で行う最終確認

1. 更新前に現在のJSONを書き出す
2. PCで設定／CLOUD SYNCを開き、現在KB、使用率、残量を確認
3. 開いて閉じるだけでは同期revisionが増えないことを確認
4. テスト用の小さな一歩を1件追加し、サイズが自然に更新されることを確認
5. iPhoneで同じクラウドデータを開き、同じサイズ表示になることを確認
6. PC → iPhone → PCの同期テストを1往復行う

確認用ブラウザではlocalhost専用のテストデータだけを使用し、公開版とFirestore上の実データには触れない。
