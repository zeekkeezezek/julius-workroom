# JULIUS WORKROOM v1.3.4 — CLOUD DATA SIZE METER

v1.3.3のEXERCISE入力、週間運動目標、Julius台詞、軽いUI SEとv1.2.1互換のCloud Syncを維持したまま、同期payloadの現在サイズを設定内で確認できる更新版です。

## v1.3.4の変更

- 設定／CLOUD SYNCへ、現在の同期payloadサイズ、900KB安全上限に対する使用率、残量、進捗バーを追加
- 未ログイン時も、次回クラウド送信対象になるローカルdataの概算サイズを表示
- サイズ計算と既存の900KB同期停止判定を、同じ `cleanPayload` + `Blob` 計算へ共通化
- 70%／85%／95%の段階表示を追加し、900KBがFirebase全体の容量ではないことを明記
- 表示のための保存フィールド、履歴、予測、Firestore write、revision更新は追加しない
- 保存方式、単一ドキュメント構造、schema version 10、localStorageキー、JSON、Firebase、Cloud Sync、PWAを維持

## v1.3.3までの主な機能

- 新規運動入力の「ひとこと（任意）」を削除。旧ログのメモ表示と編集欄は維持
- EXERCISE右カラムのRECENTを削除し、WEEKLY EXERCISEとTHIS MONTHだけへ整理。全ログの編集・削除はTODAY'S EXERCISEとCALENDARから継続可能
- クイック選択の「その他」を「ペダル漕ぎ」へ変更し、自由入力欄はそのまま維持
- 新規の「プランク」は1～999回の回数記録へ変更。既定10回で、手入力した完全一致の「プランク」にも適用
- 回数記録は `measure: "reps"` と `reps` を持ち、週間・月間の運動時間へ換算しない。運動日、報告回数、カレンダー活動には含める
- v1.3.2以前の時間型プランクは自動変換せず、従来どおり分数として保持・編集
- 保存スキーマversion 10、localStorageキー、JSON、Firebase、Cloud Sync、PWA、既存台詞・SEを維持

## 画面構成

- PC: `HOME / WORK / EXERCISE / CALENDAR / LOG`
- スマホ: `HOME / WORK / EXERCISE / CAL / MORE`
- `WORK`: 旧PROJECTS、TIMER、STATSを一つの画面へ統合。PCではACTIVE PROJECTS／WORK TREE、FOCUS TIMER／TODAY'S BREAKDOWNを2列×2段で表示
- `CALENDAR`: PCでは上段にWORK、下段にEXERCISEの月間記録を常時表示。スマホでは従来どおり切り替えて確認
- `EXERCISE`: 週間運動目標、運動入力、TODAY'S EXERCISE、今月の3指標を省スペースで表示
- `HOME`、`LOG`、設定、SE、JSON、PWA、Cloud Syncの機能は継続
- 「小さな一歩」6項目は、PC／スマホともボタン内で一行表示

旧URLの `?view=projects`、`?view=timer`、`?view=stats` はWORKへ移動します。

## データ互換性

- localStorageキーは従来と同じ `julius_workroom_v1`
- 保存スキーマは従来と同じ `version: 10`
- 既存データを削除・初期化する移行処理は追加していません
- JSON書き出し／読み込みを維持
- `cloud-sync.js` とFirestore上のデータ形式はv1.2.1互換
- クラウドより先にlocalStorageへ保存
- 初回ログイン、端末競合、ローカル／クラウド双方に変更がある場合は自動上書きせず選択画面を表示
- 同期テスト用 `syncTests` はWORK／EXERCISE集計に入りません
- 週間目標は既存 `data.settings` の任意項目として追加し、値が無い旧データには120分を補完
- UI SE設定と台詞の直近履歴はメインデータへ追加せず、schema version 10を維持
- `measure: "reps"` の運動だけ任意の `reps` を安全に補完。既存の `measure` が無いプランク、未知の追加フィールド、旧メモは変更しない

念のため、更新前と初回同期テスト前に現在のJSONを書き出して保管してください。

## Firebase設定

`firebase-config.js` にはFirebaseプロジェクト `julius-workroom` のWebアプリ用設定が入っています。サービスアカウント鍵や秘密鍵は使いません。

Firebase側は次の状態を前提にしています。

- Google Authenticationが有効
- 承認済みドメインに `zeekkeezezek.github.io` が登録済み
- Cloud Firestore（Standard）が作成済み
- `/users/{userId}/{document=**}` は、固定した所有者UIDでログインし、かつ `request.auth.uid == userId` の場合だけread/write可能

保存先は `/users/{uid}/workroom/state` です。

## ローカル確認

本番へ反映する前に、HTTPSまたはローカルWebサーバー経由で次を確認します。

1. HOME、WORK、CALENDAR、EXERCISE、LOGをPC幅とスマホ幅で開く
2. WORKで既存プロジェクトを選び、タイマー対象と時間を変更できることを確認
3. EXERCISEで6つの選択肢が表示され、「ペダル漕ぎ」が時間入力になることを確認
4. 「プランク」を選ぶと時間欄が回数欄へ切り替わり、既定10回になることを確認。自由入力で完全一致の「プランク」と入力した場合も同じになることを確認
5. プランク10回とペダル漕ぎ5分を追加し、TODAY'S EXERCISEとCALENDARへそれぞれ「10回」「5分」と表示されることを確認
6. 上記2件で運動日と報告回数は増え、週間・月間の運動時間は5分だけ増えることを確認
7. 旧時間型プランクがある場合、分数表示と時間編集のまま維持されることを確認
8. CALENDARで、PCはWORK／EXERCISEの2段表示、スマホは切り替え表示とEXERCISE側のTHIS WEEKを確認
9. 「小さな一歩」を1件追加し、短い低音UI SEが一度だけ鳴ることを確認
10. WORKでタイマーを開始して「ここまでで完了」から保存し、短い高音UI SEが一度だけ鳴ることを確認
11. EXERCISEの新規記録で短い高音UI SEが一度だけ鳴り、既存記録の編集では鳴らないことを確認
12. 設定で軽いUI SEをOFFにし、上記3操作が無音になることを確認。確認後はON／QUIETへ戻す
13. JSONを書き出し、同じJSONを読み込めることを確認。回数記録、週間目標、旧メモが保たれることを確認
14. ブラウザを再読み込みしてlocalStorageの記録、週間目標、この端末のUI SE設定が残ることを確認
15. MOREの「同期状態」にある同期テストを使い、PC → iPhone → PCを確認

`file://` で直接開いた場合、GoogleログインとPWA機能は使えません。

## CLOUD DATA SIZE確認

1. 設定または同期状態からCLOUD SYNCを開く
2. 現在の同期payloadが `KB / 900 KB`、使用率、残量、進捗バーで表示されることを確認
3. 未ログイン時もローカルdataのサイズが表示されることを確認
4. 開いて閉じるだけではCloud Syncのrevisionが増えないことを確認
5. テスト記録を追加した後に再度開き、サイズが自然に更新されることを確認
6. 900KBはFirebase全体の容量ではなく、単一同期ドキュメントの安全上限であることを確認

## PC → iPhone → PC 同期テスト

1. PCでv1.3.4を開き、表示と既存データを確認してJSONを保存
2. 「同期状態」から固定UIDのGoogleアカウントでログイン
3. 初回比較が出た場合は内容を確認し、残す側を自分で選ぶ
4. 端末名を `PC` にして「同期テストを追加」し、「同期済み」を待つ
5. iPhoneのSafariまたはホーム画面PWAで同じURLを開き、同じGoogleアカウントでログイン
6. 初回比較が出た場合は内容を確認してクラウドを採用
7. iPhoneで `PC` のテスト記録を確認
8. 端末名を `iPhone` にして同期テストを追加
9. PCで `iPhone` の記録が反映されることを確認
10. PCで週間目標を一時的に150分へ変更し、iPhoneのEXERCISEとCALENDARにも150分が反映されることを確認
11. iPhoneから元の目標へ戻し、PCにも反映されることを確認
12. 最後に、テスト用の小さな一歩または運動記録を片方で追加し、もう片方へ反映されることを確認

## GitHub Pages更新手順

1. 現在のJSONバックアップと、公開中v1.3.3一式のコピーを保管
2. このフォルダの中身を、GitHub Pages公開元のリポジトリ直下へ同じ構成で上書き
3. GitHub Desktopで変更一覧を確認し、コミットしてPush
4. GitHubの `Settings → Pages` で従来と同じブランチ／フォルダが公開元になっていることを確認
5. Pagesの更新完了後、PCで公開URLを開き `v1.3.4 CLOUD SYNC` 表記を確認
6. iPhone PWAを完全終了して再起動。旧版ならSafariで公開URLを一度再読み込みしてからPWAを開く
7. 上記のPC → iPhone → PC同期テストを実施

Service Workerキャッシュ名は `julius-workroom-v1-3-4-cloud-size-meter` です。更新時に旧App Shellキャッシュだけを削除し、localStorageの作業記録、同期メタデータ、端末専用UI SE設定は削除しません。

## 問題が起きた場合

- 「Firebase設定待ち」: `firebase-config.js` の配置を確認
- Googleログイン失敗: Firebase Authenticationの承認済みドメインを確認
- Firestore拒否: ログインUIDと固定UIDルールを確認
- 競合・選択待ち: 両方のJSONを保存し、残す側を選ぶまで上書きしない
- iPhoneだけ旧画面: PWAを完全終了し、Safariで公開URLを再読み込み
- 表示崩れ: GitHub上に `assets/icons/nav` を含む全ファイルがPushされているか確認
