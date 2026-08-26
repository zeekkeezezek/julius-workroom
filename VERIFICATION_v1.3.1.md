# JULIUS WORKROOM v1.3.1 検証記録

検証日: 2026-08-27

## 結果

- JavaScript構文: `index.html`、`cloud-sync.js`、`firebase-config.js`、`service-worker.js` すべて正常
- 主要DOM: JavaScriptから参照するIDの欠落 0件
- 新規台詞: 指示書の125行をすべて収録
- 共通指定: `exerciseBoth` と `returnBoth` の共通5行を両方へ収録（追加エントリ合計130件／24カテゴリ）
- 既存台詞: v1.3.0の126件をすべて維持
- 感情タグ: `normal / soft / think / stern` 以外 0件
- 重複抑制: 大きい候補群は直近3件、小さい候補群は直前1件を避ける試行を各300回実施して成功
- UI SE: 小さな一歩／WORK完了保存／EXERCISE新規記録の3箇所だけに接続
- UI SE設定: ON／QUIET初期値、OFF、NORMAL切り替えを確認
- 既存タイマー終了SE: 音量・再生・予約処理をv1.3.0から変更していないことを確認
- 保存形式: `julius_workroom_v1`、schema version 10、`fresh`、`normalizeV10`、`save`、JSON読込処理を変更していないことを確認
- 端末専用設定: `julius_workroom_device_ui_v1` に分離し、メイン保存データ・JSON・Cloud Syncへ含めないことを確認
- Cloud Sync: `cloud-sync.js` と `firebase-config.js` がv1.3.0と同一であることをSHA-256で確認
- PC表示: HOME／WORK／EXERCISE／CALENDAR／LOG、設定、3種の記録成立を確認。ブラウザエラー0件
- スマホ表示: 390 × 844で下部ナビ、CALENDAR切り替え、MORE、LIGHT UI SOUND設定を確認。ブラウザエラー0件
- PWA: manifest、standalone設定、App Shell 19資産、アイコン2点、Service Worker参照資産の欠落0件
- Service Workerキャッシュ: `julius-workroom-v1-3-1-dialogue-sound`

## 実機で行う最終確認

Web Audioの聞こえ方は端末・スピーカー・iPhoneの消音状態で変わるため、GitHub Pagesへ反映する前にPCとiPhoneで次を聴き比べる。

1. 小さな一歩: 短く控えめな低音
2. WORK完了保存: 短く明るい高音
3. EXERCISE新規記録: 短く明るい高音（WORKとは別の音程）
4. QUIET／NORMALの音量差
5. OFF時に3操作すべて無音
6. タイマー終了SEが従来どおり鳴る

確認用ブラウザではlocalhost専用のテストデータだけを使用し、公開版とFirestore上の実データには触れていない。
