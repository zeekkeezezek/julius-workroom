# JULIUS WORKROOM v1.3.5 検証記録

検証日: 2026-09-01

## 対象

- LIGHT UI SOUNDの音量調整と試聴ボタン
- HOMEのINBOXから既存プロジェクト／新規プロジェクトへの振り分け
- v1.3.4までの保存形式、同期、JSON、CLOUD DATA SIZE、PWA互換

## 自動・ローカル検証

- JavaScript構文: `index.html`、`cloud-sync.js`、`service-worker.js`すべて正常
- QUIET / NORMAL倍率: 2.0 / 4.8を確認。元のtone gainと周波数、タイミングは維持。最大tone gainは0.168でクリップ上限0.45未満
- micro / workComplete / exercise: 3種類の呼び出しと保存成功時だけの発火位置を確認
- UI SE試聴: workCompleteを一度だけ呼び、既存ON/OFFとQUIET/NORMALを使用。ローカルブラウザで両音量を操作しエラー0件
- 既存プロジェクトへの移動: 既存nextを保持して改行＋中黒で追記し、成功後にINBOXを削除
- 新規プロジェクト作成: INBOX本文を名称初期値とし、既存カテゴリへactive／負荷2／current・next空で作成
- 進行中0件: 新規モードを初期表示し作成可能。カテゴリ0件では確定ボタンを無効化
- キャンセル／名前空欄／保存失敗: INBOXを維持。保存失敗時は追加プロジェクトとnext変更もロールバック
- PC表示: 既存／新規モード、カテゴリ、名称、確定ボタンを操作し、新規作成と既存next追記を確認
- スマホ表示: 390×844で2モード、カテゴリ、名称、確定ボタンが画面内に収まり操作可能
- schema version 10 / `julius_workroom_v1` / `julius_workroom_device_ui_v1`: 維持
- Firebase設定、Cloud Sync、JSON、manifest、Julius台詞、タイマー終了SE: v1.3.4から変更なし
- PWA: v1.3.5キャッシュ名と `cloud-sync.js?v=1.3.5`、全App Shellファイルの存在を確認
- ZIP整合性: 24ファイルを格納し、展開内容との不一致0件を確認

## 実機で行う最終確認

1. 更新前に現在のJSONを書き出す
2. 設定でLIGHT UI SOUNDをONにし、QUIETとNORMALを「UI SEを試す」で比較する
3. 小さな一歩、WORK完了、EXERCISE新規記録で各SEが一度だけ鳴ることを確認する
4. INBOXを既存プロジェクトへ移し、既存nextを消さず追記されることを確認する
5. INBOXを既存カテゴリ内の新規プロジェクトへ変換し、name以外が既定値になることを確認する
6. キャンセルと名前空欄ではINBOXが残ることを確認する
7. PC → iPhone → PCで新規プロジェクトが同期されることを確認する

確認用ブラウザではlocalhost専用のテストデータだけを使用し、公開版とFirestore上の実データには触れない。
