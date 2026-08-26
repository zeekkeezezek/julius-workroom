# JULIUS WORKROOM v1.3.0 — UI/UX UPDATE

v1.2.1 Cloud Sync版の保存形式と同期処理を維持したまま、PC／スマホの画面構成を整理した更新版です。

## v1.3.0の画面構成

- PC: `HOME / WORK / EXERCISE / CALENDAR / LOG`
- スマホ: `HOME / WORK / EXERCISE / CAL / MORE`
- `WORK`: 旧PROJECTS、TIMER、STATSを一つの画面へ統合。PCではACTIVE PROJECTS／WORK TREE、FOCUS TIMER／TODAY'S BREAKDOWNを2列×2段で表示
- `CALENDAR`: PCでは上段にWORK、下段にEXERCISEの月間記録を常時表示。スマホでは従来どおり切り替えて確認
- `EXERCISE`: 運動入力、今月の3指標、最近の記録を省スペース化
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
3. CALENDARでWORK／EXERCISEを切り替え、日付詳細を確認
4. EXERCISEでテスト記録を追加し、編集できることを確認
5. JSONを書き出し、同じJSONを読み込めることを確認
6. ブラウザを再読み込みしてlocalStorageの記録が残ることを確認
7. 設定の同期テストを使い、PC → iPhone → PCを確認

`file://` で直接開いた場合、GoogleログインとPWA機能は使えません。

## PC → iPhone → PC 同期テスト

1. PCでv1.3.0を開き、表示と既存データを確認してJSONを保存
2. 「同期状態」から固定UIDのGoogleアカウントでログイン
3. 初回比較が出た場合は内容を確認し、残す側を自分で選ぶ
4. 端末名を `PC` にして「同期テストを追加」し、「同期済み」を待つ
5. iPhoneのSafariまたはホーム画面PWAで同じURLを開き、同じGoogleアカウントでログイン
6. 初回比較が出た場合は内容を確認してクラウドを採用
7. iPhoneで `PC` のテスト記録を確認
8. 端末名を `iPhone` にして同期テストを追加
9. PCで `iPhone` の記録が反映されることを確認
10. 最後に、テスト用の小さな一歩または運動記録を片方で追加し、もう片方へ反映されることを確認

## GitHub Pages更新手順

1. 現在のJSONバックアップと、公開中v1.2.1一式のコピーを保管
2. このフォルダの中身を、GitHub Pages公開元のリポジトリ直下へ同じ構成で上書き
3. GitHub Desktopで変更一覧を確認し、コミットしてPush
4. GitHubの `Settings → Pages` で従来と同じブランチ／フォルダが公開元になっていることを確認
5. Pagesの更新完了後、PCで公開URLを開き `v1.3.0 CLOUD SYNC` 表記を確認
6. iPhone PWAを完全終了して再起動。旧版ならSafariで公開URLを一度再読み込みしてからPWAを開く
7. 上記のPC → iPhone → PC同期テストを実施

Service Workerキャッシュ名は `julius-workroom-v1-3-0-ui-update` です。更新時に旧App Shellキャッシュだけを削除し、localStorageの作業記録や同期メタデータは削除しません。

## 問題が起きた場合

- 「Firebase設定待ち」: `firebase-config.js` の配置を確認
- Googleログイン失敗: Firebase Authenticationの承認済みドメインを確認
- Firestore拒否: ログインUIDと固定UIDルールを確認
- 競合・選択待ち: 両方のJSONを保存し、残す側を選ぶまで上書きしない
- iPhoneだけ旧画面: PWAを完全終了し、Safariで公開URLを再読み込み
- 表示崩れ: GitHub上に `assets/icons/nav` を含む全ファイルがPushされているか確認
