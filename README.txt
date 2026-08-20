JULIUS WORKROOM v1.2.1 — Cloud Sync Edition
==============================================

詳しいFirebase設定、安全な初回移行、PCとiPhoneの同期テスト、GitHub Pages更新手順は README.md を参照してください。

重要:
- firebase-config.js にはFirebaseプロジェクト julius-workroom のWebアプリ設定を組み込み済みです。
- 初回ログインではローカル／クラウドを自動上書きせず、必ず比較画面を表示します。
- 同期中もlocalStorageとJSONバックアップは維持されます。
- 前回同期済みの端末では、クラウドだけが新しい場合に確認画面を繰り返さず自動反映します。
- 両側に変更がある場合は、従来どおり自動上書きせず選択を待ちます。
- 公開前にv1.1.1一式と現在のJSONバックアップを保存してください。
