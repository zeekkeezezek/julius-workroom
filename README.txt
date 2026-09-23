# JULIUS WORKROOM v1.5.1
MANUAL WORK LOG / schema 12

## 今回の変更
WORKカードの「…」→「時間を手動追加」から、日時・作業時間（整数の分）・任意メモを記録できる。
対象の作業はカードから決まり、再選択は不要。日時は現在日時を初期表示し、過去日へ変更できる。
保存先は通常のWORKログ。手動専用フィールドや新しいschemaは追加しない。

- 作業カード表面のボタンは増やさない。アーカイブ中は復元してから追加。
- 1分以上の整数のみ。空欄・0・負数・小数・不正日時は保存しない。
- 入力した日付のactivity・CALENDAR・LOG・日別／週別／月別／累計・HOMEへ反映。
- 最終作業日時は全通常ログから再計算。過去日追加で巻き戻さない。
- メモなしで保存可能。既存LOG画面から編集・削除できる。
- 連打による同一フォームの二重保存を防止。ただし別操作で同じ日時・時間を入力することは許可。
- 保存失敗時は記録を確定せず、入力を残す。タイマー動作は手動追加によって変更しない。
- 手動記録時のジュリアス反応7本、既存のWORK完了SE。音量とOFF設定は維持。
- スマホ下部はHOME／WORK／EXERCISE／CALENDAR／MOREの5項目を維持。

## データと同期の保護
schemaは12、保存キーはjulius_workroom_v1のまま。v1.5.0からのデータ移行は不要。
schema.js、cloud-sync.js、firebase-config.js、6枚の立ち絵はv1.5.0と同一。
EXERCISE・小さな一歩・INBOX・JSONバックアップ・同期テスト・設定は維持。
Firestore保存先users/{uid}/workroom/state、revision/hash/writerId、競合確認、安全コピー、900KB安全上限も変更しない。
手動記録の保存も既存の保存通知を経由し、クラウド同期と容量表示へ反映される。
サービスアカウント鍵は使用しない。

v1.4.1以前からのschema 12への移行処理は引き続き利用可能。
移行前のコピーjulius_workroom_before_schema12と、外部へ書き出した旧JSONは保管しておく。
ブラウザのサイトデータやlocalStorageを消す必要はない。

## GitHub Pagesへの更新
1. 現在のJSONを書き出して保管。PC・iPhoneの未同期データがないか確認。
2. ZIPを別フォルダへ展開。ZIP自体ではなく中身を、リポジトリのindex.htmlと同じ階層へ上書きする。
3. 特にindex.html、work-ui.js、service-worker.jsを揃えて反映する。
4. GitHub Desktopで変更を確認し、Commit／Pushを1回実行。
5. ActionsのPages成功を確認。失敗時に連続再実行しない。
6. 両端末を再読み込みし、v1.5.1の表示を確認。iPhoneのホーム画面アプリも開き直す。
main／rootの公開設定、Firebaseルール、認証設定は変更しない。.gitやJSONバックアップは削除しない。

公開先: https://zeekkeezezek.github.io/julius-workroom/

## 公開後のPC → iPhone → PC確認
1. 両端末のJSONを保管し、v1.5.1と「同期済み」を確認。
2. PCでテスト用WORKを作成し、「…」→「時間を手動追加」から今日30分・空メモで保存。
3. iPhoneのカード、LOG、今日の時間に30分が届くことを確認。
4. iPhoneから同じ作業に昨日45分を追加。PCの昨日のCALENDARへ加算され、今日の時間は増えないことを確認。
5. 1週間前20分を追加し、最終作業日が今日から巻き戻らないことを確認。
6. LOGからテスト記録を編集・削除し、相手端末と集計にも反映されることを確認。
7. 設定のCLOUD DATA SIZEと既存の同期テストも確認。
競合が出た場合は双方のJSONを保存し、内容を確認してから採用する側を選ぶ。

## 検証
VERIFICATION_v1.5.1.mdを参照。
ローカル自動テストは隔離したテストデータと模擬Firestoreで実施。本番データを使った記録追加・削除は行っていない。
実機iPhoneと本番Firestoreの往復同期は公開後に確認する。
