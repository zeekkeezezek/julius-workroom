# JULIUS WORKROOM v1.4.0 検証記録

検証日: 2026-09-09

## 結果

- JavaScript構文: PASS
  - `index.html` 内のスクリプト
  - `cloud-sync.js`
  - `firebase-config.js`
  - `service-worker.js`
- DOM整合性: PASS
  - ID 218件に重複なし
  - JavaScriptから参照する主要DOMの欠落なし
- ナビゲーション: PASS
  - PC: HOME / WORK / EXERCISE / BODY / CALENDAR / LOG
  - スマホ: HOME / WORK / EXERCISE / BODY / MORE
  - MORE内: CALENDAR / LOG / 設定
- PWA: PASS
  - manifest、サービスワーカー、既存アイコン、BODYナビアイコンを確認
  - キャッシュ名 `julius-workroom-v1-4-0-body-tracker`
- データ移行: PASS
  - schema 10 の全既存項目を保ったまま schema 11 へ移行
  - 追加される初期値は `bodyDays: {}`
  - localStorageキーは変更なし
- JSON: PASS
  - schema 11 の書き出し・読み込みに `bodyDays` を含む
  - schema 8 / 9 / 10 の読み込み互換性を維持
- Cloud Sync契約: PASS
  - 単一Firestoreドキュメントへ既存データと `bodyDays` をまとめて保存
  - revision / hash / writerId による競合保護を維持
  - CLOUD DATA SIZE に `bodyDays` が含まれる
- BODY集約データ: PASS
  - 日単位の小さな集約オブジェクトのみを保持
  - 不正日付、不正睡眠値、未知フィールドを正規化
- BODY操作: PASS
  - STANDING: 回数のみ、5/10/15分加算、合計の直接編集、0への戻し
  - WATER: 200/300/500ml加算、合計ml・回数の直接編集
  - SLEEP: 同日・日またぎ、起床日への保存、終了≦開始の拒否、未記録への戻し
  - STEPS: 加算ではなく一日の合計値を置換、0への戻し
  - 保存順序: 保存 → BODY再描画 → ジュリアス台詞 → 既存EXERCISE系UI SE
- 既存機能保護: PASS
  - 既存台詞プールを維持
  - HOME / CALENDAR / 今日のまとめへBODY数値を混在させない
  - Firebase設定、既存画像・PWAアイコン、`.gitattributes` の内容を変更していない

## ローカル実画面確認

公開版や実際のFirebaseデータには接続せず、`127.0.0.1:4174` の独立したブラウザ領域で確認した。

- v1.4.0表記とBODYページ表示: PASS
- PCの2×2入力カード、4項目サマリー、BODY HISTORY: PASS
- 「立った」1回と「5分」を記録し、2回 / 5分になることを確認
- 水分200mlを記録し、200ml / 1回になることを確認
- 歩数2,100を保存後、4,280へ更新し、6,380ではなく4,280になることを確認
- 2026-09-08 23:30〜2026-09-09 07:00を保存し、起床日の睡眠7時間30分になることを確認
- 前日へ移動した際に入力可能、当日の「次の日」が無効になることを確認
- 各記録後にサマリー、入力カード、履歴、ジュリアス台詞が更新されることを確認

## 補足

- 上記は隔離テストデータでの確認で、君の既存localStorageやFirestore実データには書き込んでいない。
- 公開後のPC⇔iPhone実同期は、READMEの手順で少量のテストデータを使って最終確認する。
