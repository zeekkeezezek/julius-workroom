# JULIUS WORKROOM v1.3.3 検証記録

検証日: 2026-08-27

## 結果

- JavaScript構文: `index.html`、`cloud-sync.js`、`firebase-config.js`、`service-worker.js` すべて正常
- 主要DOM: ID重複0件、JavaScriptから参照するIDの欠落0件
- 保存形式: `julius_workroom_v1`、schema version 10、既存WORK／EXERCISE／PROJECT／INBOX／同期テストを保持
- 新規入力: 「ひとこと（任意）」を削除。運動名の自由入力と6個のクイック選択を維持し、「その他」を「ペダル漕ぎ」へ変更
- プランク: ボタン選択と完全一致の自由入力で回数欄へ切り替わり、1～999回、既定10回で保存
- 保存形: 新規プランクを `minutes: 0`、`note: ""`、`measure: "reps"`、`reps` 付きで保存
- 旧データ: `measure` が無い時間型プランクを分数のまま保持。旧メモと未知の追加フィールドも保持
- 回数編集: `measure: "reps"` のログは名前変更後も回数モードを維持し、時間欄を表示しない
- 集計: 回数記録は週間・月間の分数へ加算せず、運動日、報告回数、カレンダー活動には含める
- 表示: TODAY'S EXERCISEとCALENDARで回数ログを「プランク ・ 10回」形式にし、「0分」を表示しない
- RECENT: カード、DOM、展開状態、描画、イベント参照を削除。編集・削除はTODAY'S EXERCISEとCALENDARから維持
- PC表示: EXERCISE右カラムはWEEKLY EXERCISE／THIS MONTHのみ。CALENDARのWORK／EXERCISE二段表示を維持
- スマホ表示: 390 × 844で運動ボタンを3列×2段表示。CALENDARは切替式を維持
- ブラウザ操作: プランク25回＋ペダル漕ぎ5分で、運動日1日／記録時間5分／報告2件、週間5分になることを確認
- UI SE／Julius: 新規台詞を追加せず、v1.3.2の台詞分岐、重複防止、軽いUI SEを維持
- Cloud Sync: `cloud-sync.js` と `firebase-config.js` がv1.3.2と同一であることをSHA-256で確認
- JSON: メインデータ全体を書き出し／schema 8・9・10を読込可能。回数記録を任意フィールドとして保持
- PWA: manifest、App Shell参照資産、Service Worker構文、キャッシュ名を確認
- Service Workerキャッシュ: `julius-workroom-v1-3-3-exercise-input-cleanup`
- ブラウザコンソール: アプリ由来のエラー0件。Firebase 10.12.5の既存永続キャッシュAPIに関する非推奨警告だけを確認

## 実機で行う最終確認

1. 更新前に現在のJSONを書き出す
2. PCでプランク10回とペダル漕ぎ5分をテスト記録し、表示と分数集計を確認
3. iPhoneへ同期し、「10回」「5分」、週間5分、報告2件が一致することを確認
4. iPhoneでプランク回数を編集し、PCへ回数変更が反映されることを確認
5. 旧時間型プランクと旧メモがある場合、分数表示と編集内容が変わっていないことを確認
6. 軽いEXERCISE記録SEと従来のタイマー終了SEが端末上で鳴ることを確認

確認用ブラウザではlocalhost専用のテストデータだけを使用し、公開版とFirestore上の実データには触れていない。
