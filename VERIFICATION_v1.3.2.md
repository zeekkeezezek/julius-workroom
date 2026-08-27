# JULIUS WORKROOM v1.3.2 検証記録

検証日: 2026-08-27

## 結果

- JavaScript構文: `index.html`、`cloud-sync.js`、`firebase-config.js`、`service-worker.js` すべて正常
- 主要DOM: ID重複0件、JavaScriptから参照するIDの欠落0件
- 保存形式: `julius_workroom_v1`、schema version 10、既存WORK／EXERCISE／PROJECT／INBOX／同期テストを保持
- 旧データ補完: `weeklyExerciseTarget` が無い場合は120分、入力範囲は30～600分
- 週間集計: 月曜00:00から翌月曜00:00未満。先週日曜と翌週月曜を除外し、今週月曜・日曜だけを加算
- 分数: `minutes=0`／未入力／負数を推測加算しない
- 進捗: 120分未満、120分ちょうど、120分超、150分設定の残り分数・達成判定を確認
- Julius: 週間専用23件／5カテゴリ、感情タグ正常、固定120分文言なし
- 既存Julius: v1.3.1の追加台詞と直近重複防止ロジックをSHA-256相当の抽出比較で維持確認
- 運動記録後: 未達から初めて達成した瞬間だけ週間達成台詞を優先。既存記録台詞と軽いEXERCISE SEは維持
- HOME: 週間カードおよび未達警告を表示しない
- PC表示: EXERCISE週間カード、CALENDARのWORK／EXERCISE二段表示、EXERCISE側THIS WEEKを確認
- スマホ表示: 390 × 844で週間カードを月間指標より上へ表示。CALENDARは切替式を維持し、EXERCISE側THIS WEEKを確認
- 設定: 150分へ変更後すぐ閉じても保存・再描画されることを確認
- Cloud Sync: `cloud-sync.js` と `firebase-config.js` がv1.3.1と同一であることをSHA-256で確認
- JSON: メインデータ全体を書き出し／schema 8・9・10を読込可能。週間目標を含み、端末専用UI SE設定は分離
- PWA: manifest、App Shell参照資産、Service Worker構文、キャッシュ名を確認
- Service Workerキャッシュ: `julius-workroom-v1-3-2-weekly-exercise`

## 実機で行う最終確認

1. 更新前に現在のJSONを書き出す
2. PCでEXERCISEを開き、今週の実記録と週間カードが一致することを確認
3. 設定で週間目標を一時的に150分へ変更し、iPhoneにも反映されることを確認
4. iPhoneから元の目標へ戻し、PCにも反映されることを確認
5. PCとiPhoneの片方でテスト用運動記録を追加し、もう片方の週間合計とCALENDARへ反映されることを確認
6. 軽いEXERCISE記録SEと従来のタイマー終了SEが端末上で鳴ることを確認

確認用ブラウザではlocalhost専用のテストデータだけを使用し、公開版とFirestore上の実データには触れていない。
