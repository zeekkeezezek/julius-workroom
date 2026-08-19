JULIUS WORKROOM v1.1 — Mobile / PWA Edition
================================================

■ この版について
v1.0.2の保存形式と機能を維持したまま、スマートフォン表示とPWA用ファイルを追加した版です。
PCでは従来どおりの2カラムUI、画面幅760px以下ではスマホ専用UIへ自動切替します。

■ スマホUI
下部タブ：
  HOME / WORK / BODY / CAL / MORE

MORE内：
  TIMER / STATS / LOG / 設定 / JSON書き出し / JSON読み込み

HOMEではジュリアス、今日の作業候補、5分だけ、小さな一歩など「今すぐ動く」機能を優先して表示します。

■ PWAとして使う
PWAのインストールやService Workerは、file:// で直接開いたローカルHTMLでは有効になりません。
GitHub PagesなどHTTPSで公開してください。

iPhone:
  1. GitHub PagesのWORKROOMをSafari等で開く
  2. 共有メニューを開く
  3. 「ホーム画面に追加」
  4. ホーム画面のWORKROOMアイコンから起動

manifest.json の display=standalone により、ホーム画面からは独立したWebアプリ風に開きます。

■ オフライン
HTTPS上ではService Workerを登録し、HTML・ジュリアス差分・アイコン等をキャッシュします。
一度読み込んだ後は、最低限の画面をオフラインでも開ける構成です。

■ データ保存について（重要）
現時点では記録は各端末のlocalStorageです。
PCとiPhoneは自動同期しません。
スマホで本格運用する前後は、JSON書き出しを定期的に行ってください。
クラウド同期は今後の別段階で追加予定です。

■ v1.0.2との互換性
データスキーマは変更していません。APP_VERSION表記のみv1.1.0です。
既存JSONは従来どおり読み込み可能です。
