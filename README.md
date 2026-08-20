# JULIUS WORKROOM v1.2 — Cloud Sync Edition

JULIUS WORKROOM v1.1.1のWORK / EXERCISE / PROJECTS / INBOX / LOG / CALENDAR / STATS / 設定 / SE / PWA / スマホUIを維持し、GoogleログインとCloud Firestore同期を追加した版です。

## Firebase設定

この配布版の `firebase-config.js` には、Firebaseプロジェクト `julius-workroom` のWebアプリ用 `firebaseConfig` を設定済みです。別プロジェクトへ移す場合だけ、Firebase Consoleの「プロジェクトの設定 → マイアプリ → SDK の設定と構成」に表示される値へ置き換えます。

```js
window.JULIUS_FIREBASE_CONFIG = {
  apiKey: "...",
  authDomain: "...",
  projectId: "julius-workroom",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

Firebase Webの設定値はブラウザへ配布される接続情報であり、秘密鍵ではありません。データの保護はAuthenticationとFirestore Security Rulesが担当します。ただし、サービスアカウント鍵や秘密鍵は絶対にこのファイルへ入れないでください。

Firebase側は次の状態を前提にしています。

- Google Authenticationが有効
- Authenticationの承認済みドメインに `zeekkeezezek.github.io` が登録済み
- Cloud Firestore（Standard）が作成済み
- `/users/{userId}/{document=**}` は、ログイン中の `request.auth.uid == userId` の場合だけread/write可能

実際の保存先は `/users/{uid}/workroom/state` です。

## データを守る同期仕様

- すべての変更は、クラウドより先に従来の `localStorage` へ保存します。
- JSON書き出し／読み込みは従来どおり利用できます。
- 初回ログイン時はローカルとクラウドを比較し、内容が異なる場合は必ず選択画面を表示します。
- クラウドが空でも、自動アップロードはしません。
- クラウド採用前は現在のローカルデータをJSONと端末内安全コピーへ退避します。
- ローカル採用で既存クラウドを置き換える前は、クラウド側をJSONと端末内安全コピーへ退避します。
- Firestoreの `revision` をトランザクション内で検査します。別端末が先に更新していれば上書きを中止し、競合画面を表示します。
- `updatedAt`、`updatedAtMs`、`writerId`、`hash`、`revision` をクラウド文書へ保存します。
- Firestore Web永続キャッシュを複数タブ対応で有効化します。非対応ブラウザや別タブ競合時は、ローカル保存を継続して状態欄へ表示します。
- Firestore文書上限へ達する事故を避けるため、同期ペイロードが約900KBを超えた時点でクラウド書き込みを停止します。ローカルとJSONの全データは残ります。

## PC ↔ iPhone 同期テスト

本番データを大きく編集する前に、次の順で確認してください。

1. PCで公開済みv1.2を開き、「同期状態 → Googleでログイン」を押します。
2. 初回比較画面で内容を確認し、採用する側を選びます。念のため先にJSONも保存してください。
3. 設定の「この端末の名前」に `PC` と入力し、「同期テストを追加」を押します。
4. 状態が「同期済み」になるまで待ちます。
5. iPhoneのSafariまたはホーム画面PWAで同じURLを開き、同じGoogleアカウントでログインします。
6. 初回比較画面でクラウドを採用し、RECENT SYNC TESTSに `PC` の記録が見えることを確認します。
7. iPhone側の端末名を `iPhone` にして同期テストを追加します。
8. PC側に `iPhone` の記録が現れることを確認します。

同期テストは専用の `syncTests` データで、WORKやEXERCISEの集計には入りません。直近20件だけ保持します。

## GitHub Pagesへの更新手順

公開前に、現在使っているv1.1.1一式とJSONバックアップを別の場所へ保存してください。

1. `index.html`、`cloud-sync.js`、`firebase-config.js`、`service-worker.js`、`manifest.json`、`assets` フォルダをGitHub Pages公開元へコピーします。
2. GitHub Desktopを使う場合は変更内容を確認し、コミットしてPushします。Web画面を使う場合は同じ構成を保ってアップロードします。
3. GitHubのリポジトリで Settings → Pages を開き、従来と同じ公開ブランチ／フォルダになっていることを確認します。
4. Pagesの更新完了後、PCブラウザで公開URLを再読み込みします。
5. iPhone PWAは旧Service Workerが一時的に残る場合があります。アプリを完全に閉じて再起動し、それでも旧版ならSafariで公開URLを一度開いて再読み込みしてください。
6. 画面上部または設定に `v1.2 CLOUD SYNC` と表示されることを確認してから同期テストを行います。

Service Workerのキャッシュ名は設定済み最終版専用の `julius-workroom-v1-2-0-configured` です。v1.1系および未設定v1.2のキャッシュは最終版の有効化時に削除されますが、`localStorage` の作業記録は削除しません。

## PWA / オフライン

PWAとGoogleログインはHTTPS上で使用してください。`file://` で直接開いた場合は、安全のためクラウド機能を無効にしてローカル版として動作します。

オフライン中も変更は端末の `localStorage` へ残ります。Firestoreトランザクションはオンラインでなければ確定できないため、状態は「オフライン・同期待ち」になります。オンライン復帰時にクラウドの最新世代を再確認してから同期します。

## 問題が起きた場合

- 「Firebase設定待ち」: `firebase-config.js` が正しく配置されているか、内容が欠けていないか確認します。
- 「承認済みドメイン」エラー: Firebase AuthenticationのAuthorized domainsを確認します。
- 「Firestoreルールにより拒否」: ログインUIDと `/users/{uid}/workroom/state` のルールを確認します。
- 「競合・選択待ち」: 両方のJSONを保存し、残したい側を選びます。選ぶまでクラウド上書きは行われません。
- iPhoneでログイン画面が開かない: ユーザー操作起点の「Googleでログイン」をもう一度押し、Safariのポップアップ制限も確認します。
