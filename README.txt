JULIUS WORKROOM v1.3.5 — UI FEEDBACK & INBOX ROUTING

使い方、データ互換性、PC⇔iPhone同期テスト、GitHub Pages更新手順はREADME.mdを確認してください。

この版はv1.3.4までのEXERCISE、週間運動目標、CLOUD DATA SIZE、schema version 10、JSONバックアップ、Firebase Cloud Sync、PWAを維持しています。

LIGHT UI SOUNDは音色と発火タイミングを変えず、QUIETを旧NORMALの2倍、NORMALを旧NORMALの4.8倍へ調整しました。設定から「UI SEを試す」で確認できます。

HOMEのINBOXは、既存プロジェクトの「次にやること」へ移すほか、既存大カテゴリ内へ新規プロジェクトとして追加できます。

設定／CLOUD SYNCで、現在の同期payloadサイズ、900KB安全上限に対する使用率と残量を確認できます。900KBはFirebase全体の容量ではありません。

軽いUI SEのON/OFFと音量は端末専用キーへ保存され、Cloud SyncとJSONには含まれません。

週間運動目標は既定120分、設定範囲30～600分です。PCとiPhoneで同期され、JSONにも含まれます。

新規のプランクは回数で記録し、週間・月間の分数へ換算しません。旧時間型プランク、旧メモ、未知の追加フィールドはそのまま維持します。
