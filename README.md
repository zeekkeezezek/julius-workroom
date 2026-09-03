# JULIUS WORKROOM v1.3.6 — EXERCISE DIALOGUE EXPANSION

v1.3.5までの機能とデータ互換性を維持したまま、EXERCISEの新規記録に対するジュリアスの反応を、当日の記録件数に合わせて広げた更新版です。

## v1.3.6の変更

- 新規記録後の反応を1件／2件／3件／4件／5件以上へ分岐。4件目以降に「二件」と言う問題を修正
- 2件用7種、3件用8種、4件用8種、5件以上用8種を追加。同一種目の複数記録も件数として扱い、種目数とは混同しない
- 週間目標を今回の追加で初達成した場合は、従来の達成台詞を最優先。次の追加から通常の判定へ戻る
- 当日3件以上かつ合計60分以上では25%、90分以上では35%の確率で長時間向け補助台詞を選択。それぞれ5種を追加し、それ以外は件数別台詞を使用
- 回数型プランクは件数に含めるが、長時間判定の分数には含めない。旧時間型プランクは従来どおり分数として扱う
- 既存の台詞36分類と直近台詞の重複回避を維持。1件目に同日のWORKがある場合は従来の両方記録した台詞を継続
- 旧 `exerciseMulti` は互換性のため残すが、新規記録後の分岐からは使わない
- 件数だけで無理や運動強度を決めつけず、件数を増やすよう促さない文面に調整
- 新規保存フィールドなし。UI、UI SE（QUIET 2.0／NORMAL 4.8）、INBOX、schema version 10、JSON、Firebase、Cloud Syncを変更しない
- Service Workerキャッシュとアプリ表示をv1.3.6へ更新

## v1.3.5までの主な機能

- LIGHT UI SOUNDのQUIETを旧NORMALの2倍、NORMALを旧NORMALの4.8倍へ調整。音色、発火タイミング、3種類のSEは維持
- 設定のLIGHT UI SOUNDカードへ「UI SEを試す」を追加。現在のON/OFFとQUIET/NORMALをその場で確認可能
- HOMEの「プロジェクトへ」を「既存プロジェクトへ」「新規プロジェクトにする」の2モードへ拡張
- 新規モードは既存大カテゴリ、編集可能なINBOX本文を使い、通常プロジェクトと同じ形式で作成
- 進行中プロジェクトが0件でもモーダルを開き、新規モードを初期表示
- キャンセル、名前空欄、カテゴリ0件ではINBOXを削除しない
- schema version 10、localStorageキー、DEVICE UI設定、JSON、Firebase、Cloud Sync、CLOUD DATA SIZE、PWAを維持

## v1.3.4までの主な機能

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

## v1.3.6台詞確認

本番データへ架空の運動記録を増やさないよう、未ログインのローカル確認環境で行ってください。

1. 週間目標に達しない短時間のテスト記録を、同じ日に1件ずつ6件まで追加
2. 1件目は従来の反応、2／3／4件目はそれぞれの件数に合う反応、5／6件目は5件以上用の反応になることを確認
3. プランク10回＋5分＋10分＋20分の4記録で、合計35分・4件目の反応になることを確認
4. 別のテストデータで週間目標120分を3件目で初達成し、達成台詞が優先されることを確認。次の記録は通常判定へ戻る
5. 3件以上かつ当日合計60／90分以上では長時間向け台詞が時々出ることを確認。毎回出る仕様ではない
6. 同じ分類で直近の台詞が続けて出にくいことを確認

隔離したテストデータによる自動検証の詳細は `VERIFICATION_v1.3.6.md` に記載しています。

## v1.3.5機能確認

1. 設定のLIGHT UI SOUNDで「UI SEを試す」を押し、QUIETが控えめに、NORMALが明確に聞こえることを確認
2. UI SEをOFFにすると試聴ボタンも無音になることを確認
3. INBOXの「プロジェクトへ」で、既存／新規の2モードを切り替えられることを確認
4. 既存モードで移動し、元のnextを消さずINBOX本文が追記され、INBOXから消えることを確認
5. 新規モードで既存大カテゴリを選び、初期入力された名称を必要に応じて直して作成する
6. 作成後、温度active、負荷2、current／next空の通常プロジェクトとしてWORKへ表示されることを確認
7. 新規モードをキャンセルした場合と名前空欄の場合、INBOXが残ることを確認
8. 進行中プロジェクト0件でもモーダルが開き、新規モードを使用できることを確認
9. PC幅とスマホ幅で、2モード、カテゴリ、名称、確定ボタンが操作できることを確認

## CLOUD DATA SIZE確認

1. 設定または同期状態からCLOUD SYNCを開く
2. 現在の同期payloadが `KB / 900 KB`、使用率、残量、進捗バーで表示されることを確認
3. 未ログイン時もローカルdataのサイズが表示されることを確認
4. 開いて閉じるだけではCloud Syncのrevisionが増えないことを確認
5. テスト記録を追加した後に再度開き、サイズが自然に更新されることを確認
6. 900KBはFirebase全体の容量ではなく、単一同期ドキュメントの安全上限であることを確認

## PC → iPhone → PC 同期テスト

1. PCでv1.3.6を開き、表示と既存データを確認してJSONを保存
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

1. 現在のJSONバックアップと、公開中v1.3.5一式のコピーを保管
2. このフォルダの中身を、GitHub Pages公開元のリポジトリ直下へ同じ構成で上書き
3. GitHub Desktopで変更一覧を確認し、コミットしてPush
4. GitHubの `Settings → Pages` で従来と同じブランチ／フォルダが公開元になっていることを確認
5. Pagesの更新完了後、PCで公開URLを開き `v1.3.6 CLOUD SYNC` 表記を確認
6. iPhone PWAを完全終了して再起動。旧版ならSafariで公開URLを一度再読み込みしてからPWAを開く
7. 上記のPC → iPhone → PC同期テストを実施

Service Workerキャッシュ名は `julius-workroom-v1-3-6-exercise-dialogue-expansion` です。更新時に旧App Shellキャッシュだけを削除し、localStorageの作業記録、同期メタデータ、端末専用UI SE設定は削除しません。

## 問題が起きた場合

- 「Firebase設定待ち」: `firebase-config.js` の配置を確認
- Googleログイン失敗: Firebase Authenticationの承認済みドメインを確認
- Firestore拒否: ログインUIDと固定UIDルールを確認
- 競合・選択待ち: 両方のJSONを保存し、残す側を選ぶまで上書きしない
- iPhoneだけ旧画面: PWAを完全終了し、Safariで公開URLを再読み込み
- 表示崩れ: GitHub上に `assets/icons/nav` を含む全ファイルがPushされているか確認
