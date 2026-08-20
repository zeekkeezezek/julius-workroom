(function(){
'use strict';

const DEVICE_KEY='julius_workroom_device_id';
const DEVICE_NAME_KEY='julius_workroom_device_name';
const SAFETY_KEY='julius_workroom_cloud_safety_backup';
const SAVE_DELAY=1200;
const state={
  configured:false,auth:null,db:null,user:null,ref:null,unsubscribe:null,
  active:false,paused:false,dirty:false,saving:false,conflict:null,
  baseRevision:0,lastSyncedHash:null,remote:null,saveTimer:null,
  persistence:'準備中',status:'local',statusText:'ローカル保存',error:null,setupIssue:null,
  deviceId:getOrCreateDeviceId()
};

function getOrCreateDeviceId(){
  let id=localStorage.getItem(DEVICE_KEY);
  if(!id){id='device_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,8);localStorage.setItem(DEVICE_KEY,id)}
  return id;
}
function cleanPayload(value){return JSON.parse(JSON.stringify(value))}
function hashPayload(value){
  const text=JSON.stringify(value);let h=2166136261;
  for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619)}
  return ('00000000'+(h>>>0).toString(16)).slice(-8);
}
function isConfigured(config){
  return !!(config&&config.apiKey&&config.authDomain&&config.projectId&&config.appId&&
    !Object.values(config).some(v=>typeof v==='string'&&v.includes('PASTE_YOUR')));
}
function formatTime(value){
  if(!value)return '—';
  let date=value?.toDate?value.toDate():new Date(value);
  return Number.isNaN(date.getTime())?'—':date.toLocaleString('ja-JP');
}
function summary(payload){
  return {projects:(payload.categories||[]).reduce((n,c)=>n+(c.projects||[]).length,0),work:(payload.logs||[]).length,exercise:(payload.exerciseLogs||[]).length,inbox:(payload.inbox||[]).length,updatedAt:payload.updatedAt||null};
}
function summaryText(payload){let s=summary(payload);return `プロジェクト ${s.projects} / 作業 ${s.work} / 運動 ${s.exercise} / INBOX ${s.inbox}`}
function setStatus(kind,text,error=null){
  state.status=kind;state.statusText=text;state.error=error;
  const button=document.getElementById('cloudStatusBtn'),label=document.getElementById('cloudStatusLabel');
  if(button)button.dataset.state=kind;if(label)label.textContent=text;
  renderPanel();
}
function escapeHtml(value=''){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function userHtml(){
  if(!state.user)return '';
  let photo=state.user.photoURL?`<img class="cloudAvatar" src="${escapeHtml(state.user.photoURL)}" alt="">`:'<div class="cloudAvatar"></div>';
  return `<div class="cloudIdentity">${photo}<div class="cloudIdentityText"><strong>${escapeHtml(state.user.displayName||'Googleユーザー')}</strong><span>${escapeHtml(state.user.email||'')}</span></div></div>`;
}
function latestTestsHtml(){
  const tests=[...(data.syncTests||[])].sort((a,b)=>b.ts-a.ts).slice(0,5);
  if(!tests.length)return '<div class="notice">同期テストはまだない。</div>';
  return `<div class="syncTestList">${tests.map(t=>`<div class="syncTestItem"><b>${escapeHtml(t.device||'端末')}</b>　${formatTime(t.ts)}<br>${escapeHtml(t.message||'同期テスト')}</div>`).join('')}</div>`;
}
function renderPanel(){
  const body=document.getElementById('cloudPanelBody');if(!body)return;
  if(!state.configured){
    const message=state.setupIssue||'Firebase設定が未入力のため、現在は安全なローカル保存だけで動作している。firebase-config.jsへFirebase Consoleの設定値を入れるとGoogleログインを有効化できる。';
    body.innerHTML=`<div class="syncWarning">${escapeHtml(message)}</div><div class="syncActions" style="margin-top:9px"><button class="btn" onclick="backup()">JSONバックアップ</button></div>`;return;
  }
  if(!state.user){
    body.innerHTML=`<div class="notice">Googleアカウントでログインすると、同じアカウントのPCとiPhoneで記録を同期できる。初回は必ずローカル／クラウドの比較画面を出し、自動上書きしない。</div><div class="syncStatusGrid"><div class="syncStatusCell"><b>LOCAL</b><span>${escapeHtml(summaryText(data))}</span></div><div class="syncStatusCell"><b>CACHE</b><span>${escapeHtml(state.persistence)}</span></div></div><div class="syncActions"><button class="btn primary" onclick="cloudSyncSignIn()">Googleでログイン</button><button class="btn" onclick="backup()">先にJSON保存</button></div>`;return;
  }
  const revision=state.baseRevision||0,remoteTime=state.remote?.updatedAt||state.remote?.updatedAtMs;
  const primaryAction=state.active?`<button class="btn primary" onclick="cloudSyncNow()" ${state.saving?'disabled':''}>今すぐ同期</button>`:`<button class="btn primary" onclick="cloudSyncResume()">同期を再確認</button>`;
  body.innerHTML=`${userHtml()}<div class="syncStatusGrid"><div class="syncStatusCell"><b>STATUS</b><span>${escapeHtml(state.statusText)}</span></div><div class="syncStatusCell"><b>REVISION</b><span>${revision}</span></div><div class="syncStatusCell"><b>LAST CLOUD</b><span>${escapeHtml(formatTime(remoteTime))}</span></div><div class="syncStatusCell"><b>CACHE</b><span>${escapeHtml(state.persistence)}</span></div></div>${state.error?`<div class="syncWarning syncDanger">${escapeHtml(state.error)}</div><div class="gap"></div>`:''}<div class="syncActions">${primaryAction}<button class="btn" onclick="cloudSyncAddTest()">同期テストを追加</button><button class="btn" onclick="backup()">JSONバックアップ</button><button class="btn" onclick="cloudSyncSignOut()">ログアウト</button></div><div class="gap"></div><div class="field"><label>この端末の名前（テスト表示用）</label><input id="syncDeviceName" value="${escapeHtml(localStorage.getItem(DEVICE_NAME_KEY)||'')}" placeholder="例：PC / iPhone"></div><div class="gap"></div><div class="sectionTitle">RECENT SYNC TESTS</div>${latestTestsHtml()}<div class="gap"></div><div class="syncDetail">UID: ${escapeHtml(state.user.uid)}<br>writer: ${escapeHtml(state.deviceId)}<br>hash: ${escapeHtml(state.lastSyncedHash||'—')}</div>`;
}
function installDialogs(){
  if(document.getElementById('cloudMigrationModal'))return;
  document.body.insertAdjacentHTML('beforeend',`
  <div class="modal" id="cloudMigrationModal"><div class="modalCard"><h3>同期するデータを確認</h3><div id="cloudMigrationBody"></div></div></div>
  <div class="modal" id="cloudConflictModal"><div class="modalCard"><h3>同期の競合を止めた</h3><div id="cloudConflictBody"></div></div></div>`);
}
function openDialog(id){document.getElementById(id)?.classList.add('show')}
function closeDialog(id){document.getElementById(id)?.classList.remove('show')}
function downloadJson(payload,name){
  const blob=new Blob([JSON.stringify({...cleanPayload(payload),app:'JULIUS WORKROOM',appVersion:APP_VERSION,exportedAt:new Date().toISOString()},null,2)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}
function keepSafetyCopy(payload,reason){
  try{localStorage.setItem(SAFETY_KEY,JSON.stringify({reason,savedAt:Date.now(),payload:cleanPayload(payload)}))}catch(error){console.warn('Safety backup could not be stored',error)}
}
function backupBeforeReplace(payload,label){
  keepSafetyCopy(payload,label);downloadJson(payload,`julius_workroom_${label}_${dateKey()}.json`);
}
function showMigration(remote){
  state.active=false;state.remote=remote||null;
  const body=document.getElementById('cloudMigrationBody');
  if(!remote){
    body.innerHTML=`<div class="syncWarning">クラウドは空だ。ローカル記録を勝手に送信せず、君の選択を待っている。</div><div class="syncChoice"><div class="card"><div class="sectionTitle">LOCAL</div><strong>この端末の記録</strong><div class="notice">${escapeHtml(summaryText(data))}<br>更新: ${escapeHtml(formatTime(data.updatedAt))}</div><button class="btn primary" onclick="cloudSyncChooseLocal()">ローカルをクラウドへ保存</button></div><div class="card"><div class="sectionTitle">LOCAL ONLY</div><strong>今は同期しない</strong><div class="notice">データはこの端末に残る。後で設定から同期を再開できる。</div><button class="btn" onclick="cloudSyncPause()">ローカルのまま続ける</button></div></div><div class="modalActions"><button class="btn" onclick="backup()">先にJSON保存</button><button class="btn" onclick="cloudSyncSignOut()">ログアウト</button></div>`;
  }else{
    body.innerHTML=`<div class="syncWarning">ローカルとクラウドの内容が異なる。選ばれるまで双方を変更しない。採用しない側は自動でJSONと端末内の安全コピーへ退避する。</div><div class="syncChoice"><div class="card"><div class="sectionTitle">LOCAL</div><strong>この端末を採用</strong><div class="notice">${escapeHtml(summaryText(data))}<br>更新: ${escapeHtml(formatTime(data.updatedAt))}</div><button class="btn primary" onclick="cloudSyncChooseLocal()">ローカルをクラウドへ反映</button></div><div class="card"><div class="sectionTitle">CLOUD</div><strong>クラウドを採用</strong><div class="notice">${escapeHtml(summaryText(remote.payload||{}))}<br>更新: ${escapeHtml(formatTime(remote.updatedAt||remote.updatedAtMs))}<br>世代: ${Number(remote.revision)||0}</div><button class="btn" onclick="cloudSyncChooseCloud()">クラウドをこの端末へ反映</button></div></div><div class="modalActions"><button class="btn" onclick="cloudSyncDownloadLocal()">ローカルJSON</button><button class="btn" onclick="cloudSyncDownloadCloud()">クラウドJSON</button><button class="btn" onclick="cloudSyncPause()">今は決めない</button></div>`;
  }
  openDialog('cloudMigrationModal');setStatus('conflict','初回選択待ち');
}
function showConflict(remote){
  state.active=false;state.conflict=remote;state.remote=remote;
  const body=document.getElementById('cloudConflictBody');
  body.innerHTML=`<div class="syncWarning syncDanger">別端末の更新を検出したため、全体上書きを実行せず停止した。双方のJSONを保存してから、残す側を選べる。</div><div class="syncChoice"><div class="card"><div class="sectionTitle">THIS DEVICE</div><strong>この端末の未同期変更</strong><div class="notice">${escapeHtml(summaryText(data))}<br>更新: ${escapeHtml(formatTime(data.updatedAt))}</div><button class="btn danger" onclick="cloudSyncResolveLocal()">この端末を採用</button></div><div class="card"><div class="sectionTitle">CLOUD</div><strong>別端末の更新</strong><div class="notice">${escapeHtml(summaryText(remote.payload||{}))}<br>更新: ${escapeHtml(formatTime(remote.updatedAt||remote.updatedAtMs))}<br>世代: ${Number(remote.revision)||0}</div><button class="btn primary" onclick="cloudSyncResolveCloud()">クラウドを採用</button></div></div><div class="modalActions"><button class="btn" onclick="cloudSyncDownloadLocal()">この端末のJSON</button><button class="btn" onclick="cloudSyncDownloadCloud()">クラウドJSON</button><button class="btn" onclick="cloudSyncPauseConflict()">閉じて保留</button></div>`;
  openDialog('cloudConflictModal');setStatus('conflict','競合・選択待ち','別端末の更新とこの端末の未同期変更が重なった。');
}
async function getServerState(){
  try{const snap=await state.ref.get({source:'server'});return snap.exists?snap.data():null}
  catch(error){setStatus('offline','オフライン・端末に保存','クラウドの最新状態を確認できないため、同期を開始していない。');throw error}
}
async function beginForUser(user){
  if(state.unsubscribe){state.unsubscribe();state.unsubscribe=null}
  state.user=user;state.ref=state.db.doc(`users/${user.uid}/workroom/state`);state.active=false;state.paused=false;state.conflict=null;
  setStatus('saving','クラウドを確認中');
  let remote;try{remote=await getServerState()}catch(_){return}
  state.remote=remote;state.baseRevision=Number(remote?.revision)||0;
  const localHash=hashPayload(cleanPayload(data)),remoteHash=remote?.hash||((remote?.payload)?hashPayload(remote.payload):null);
  if(remote&&remote.payload&&localHash===remoteHash){
    state.lastSyncedHash=remoteHash;state.active=true;state.dirty=false;startListener();setStatus('synced','同期済み');return;
  }
  showMigration(remote&&remote.payload?remote:null);
}
function startListener(){
  if(state.unsubscribe)state.unsubscribe();
  state.unsubscribe=state.ref.onSnapshot({includeMetadataChanges:true},snap=>{
    if(!snap.exists||snap.metadata.hasPendingWrites)return;
    const remote=snap.data(),revision=Number(remote.revision)||0;if(revision<=state.baseRevision)return;
    const localHash=hashPayload(cleanPayload(data));
    if(localHash===state.lastSyncedHash&&!state.dirty&&!state.saving){applyRemote(remote,false);return}
    showConflict(remote);
  },error=>{setStatus('error','同期エラー',friendlyError(error))});
}
function applyRemote(remote,downloadLocal){
  if(!remote?.payload)return;
  if(downloadLocal)backupBeforeReplace(data,'before_cloud_adopt');
  data=normalizeV10(cleanPayload(remote.payload));data.syncTests=data.syncTests||[];save({cloudApply:true});renderAll();
  state.remote=remote;state.baseRevision=Number(remote.revision)||0;state.lastSyncedHash=remote.hash||hashPayload(cleanPayload(data));state.dirty=false;state.conflict=null;state.active=true;
  closeDialog('cloudMigrationModal');closeDialog('cloudConflictModal');startListener();setStatus('synced','同期済み');
}
async function writeLocal(expectedRevision,backupRemote){
  if(!state.user||!state.ref)return;
  state.saving=true;setStatus('saving','保存中');
  const payload=cleanPayload(data),hash=hashPayload(payload),now=Date.now();
  const payloadBytes=new Blob([JSON.stringify(payload)]).size;
  if(payloadBytes>900*1024){state.saving=false;state.dirty=true;setStatus('error','クラウド容量上限に接近','データが約900KBを超えたため、Firestore文書の上限に達する前に同期を停止した。ローカルとJSONには全データが残っている。');return}
  try{
    let nextRevision=expectedRevision+1;
    await state.db.runTransaction(async tx=>{
      const snap=await tx.get(state.ref),current=snap.exists?(Number(snap.data().revision)||0):0;
      if(current!==expectedRevision){let error=new Error('revision-conflict');error.code='workroom/revision-conflict';error.remote=snap.exists?snap.data():null;throw error}
      tx.set(state.ref,{payload,hash,revision:nextRevision,updatedAt:firebase.firestore.FieldValue.serverTimestamp(),updatedAtMs:now,writerId:state.deviceId,schemaVersion:10,appVersion:APP_VERSION});
    });
    state.baseRevision=nextRevision;state.lastSyncedHash=hash;state.remote={payload,hash,revision:nextRevision,updatedAtMs:now,writerId:state.deviceId};state.dirty=false;state.active=true;state.conflict=null;closeDialog('cloudMigrationModal');closeDialog('cloudConflictModal');startListener();setStatus('synced','同期済み');
  }catch(error){
    if(error.code==='workroom/revision-conflict'){
      const remote=error.remote||await getServerState().catch(()=>null);
      if(remote?.payload)showConflict(remote);else setStatus('error','競合確認エラー','クラウドの最新データを取得できなかった。ローカルデータは保持している。');
    }
    else{state.dirty=true;setStatus(navigator.onLine?'error':'offline',navigator.onLine?'同期エラー':'オフライン・同期待ち',friendlyError(error))}
  }finally{state.saving=false;renderPanel()}
}
function friendlyError(error){
  const code=error?.code||'';
  if(code.includes('popup-closed'))return 'Googleログイン画面が閉じられた。もう一度、ログインボタンから開始できる。';
  if(code.includes('popup-blocked'))return 'ポップアップが遮断された。Safari/ブラウザでこのサイトのポップアップを許可してくれ。';
  if(code.includes('unauthorized-domain'))return 'この公開ドメインがFirebase Authenticationの承認済みドメインに入っていない。';
  if(code.includes('permission-denied'))return 'Firestoreルールにより拒否された。ログインUIDと /users/{uid}/workroom/state のルールを確認してくれ。';
  if(code.includes('unavailable')||!navigator.onLine)return '通信できない。データはこの端末に保存され、オンライン復帰後に再試行できる。';
  return error?.message||'クラウド処理を完了できなかった。';
}
function queueLocalSave(){
  state.dirty=true;if(!state.active||state.paused||state.conflict||!state.user){renderPanel();return}
  setStatus(navigator.onLine?'saving':'offline',navigator.onLine?'同期待ち':'オフライン・同期待ち');
  clearTimeout(state.saveTimer);state.saveTimer=setTimeout(()=>syncNow(),SAVE_DELAY);
}
async function syncNow(){
  clearTimeout(state.saveTimer);if(!state.active||state.saving||state.conflict||!state.user)return;
  const currentHash=hashPayload(cleanPayload(data));if(currentHash===state.lastSyncedHash&&!state.dirty){setStatus('synced','同期済み');return}
  await writeLocal(state.baseRevision,false);
}
async function signIn(){
  if(!state.configured)return;
  try{const provider=new firebase.auth.GoogleAuthProvider();provider.setCustomParameters({prompt:'select_account'});await state.auth.signInWithPopup(provider)}
  catch(error){setStatus('error','ログイン失敗',friendlyError(error))}
}
async function signOut(){
  closeDialog('cloudMigrationModal');closeDialog('cloudConflictModal');if(state.unsubscribe){state.unsubscribe();state.unsubscribe=null}
  await state.auth.signOut();
}
function pause(){state.active=false;state.paused=true;state.dirty=true;closeDialog('cloudMigrationModal');setStatus('local','同期保留・ローカル保存');}
function pauseConflict(){closeDialog('cloudConflictModal');state.active=false;state.paused=true;setStatus('conflict','競合を保留中','同期は止まっている。設定から状態を確認し、残す側を選んでくれ。')}
async function chooseLocal(){
  const remote=state.remote;
  if(remote?.payload)backupBeforeReplace(remote.payload,'cloud_before_local_adopt');
  await writeLocal(Number(remote?.revision)||0,true);
}
function chooseCloud(){if(state.remote?.payload)applyRemote(state.remote,true)}
async function resolveLocal(){
  const remote=state.conflict;if(!remote)return;
  backupBeforeReplace(remote.payload||{},'cloud_conflict_copy');await writeLocal(Number(remote.revision)||0,true);
}
function resolveCloud(){if(state.conflict)applyRemote(state.conflict,true)}
function addTest(){
  const input=document.getElementById('syncDeviceName'),name=(input?.value||localStorage.getItem(DEVICE_NAME_KEY)||'この端末').trim()||'この端末';localStorage.setItem(DEVICE_NAME_KEY,name);
  data.syncTests=data.syncTests||[];data.syncTests.push({id:uid('sync'),ts:Date.now(),device:name,message:`${name} からの同期テスト`});data.syncTests=data.syncTests.slice(-20);save();renderPanel();toast('同期テストを追加した。別端末で表示を確認してくれ。');
}
function downloadLocal(){downloadJson(data,`julius_workroom_local_${dateKey()}.json`)}
function downloadCloud(){const remote=state.conflict||state.remote;if(remote?.payload)downloadJson(remote.payload,`julius_workroom_cloud_${dateKey()}.json`)}
async function resume(){if(state.user)await beginForUser(state.user)}

async function init(){
  installDialogs();data.syncTests=data.syncTests||[];
  const config=window.JULIUS_FIREBASE_CONFIG;
  if(location.protocol==='file:'){state.persistence='HTTPSで有効';setStatus('local','ローカル保存');return}
  if(!isConfigured(config)){state.persistence='設定待ち';setStatus('local','Firebase設定待ち');return}
  if(!window.firebase){state.persistence='SDK未読込';state.setupIssue='Firebase SDKを読み込めないため、クラウド同期は停止している。ローカルデータは通常どおり保存される。オンラインで再読み込みしてくれ。';setStatus('offline','クラウド機能未読込');return}
  state.configured=true;
  try{
    if(!firebase.apps.length)firebase.initializeApp(config);
    state.auth=firebase.auth();state.db=firebase.firestore();
    try{await state.db.enablePersistence({synchronizeTabs:true});state.persistence='有効（複数タブ対応）'}
    catch(error){state.persistence=error.code==='failed-precondition'?'別タブで使用中':'このブラウザでは未対応'}
    await state.auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
    state.auth.onAuthStateChanged(user=>{
      if(user)beginForUser(user);
      else{state.user=null;state.ref=null;state.active=false;state.paused=false;state.dirty=false;state.baseRevision=0;state.lastSyncedHash=null;state.remote=null;state.conflict=null;if(state.unsubscribe){state.unsubscribe();state.unsubscribe=null}setStatus('local','ローカル保存')}
    });
  }catch(error){setStatus('error','Firebase初期化エラー',friendlyError(error))}
  window.addEventListener('online',()=>{if(state.user&&(state.dirty||!state.active))resume();});
  window.addEventListener('offline',()=>{if(state.user)setStatus('offline','オフライン・端末に保存')});
}

window.cloudSyncLocalChanged=queueLocalSave;
window.cloudSyncSignIn=signIn;window.cloudSyncSignOut=signOut;window.cloudSyncNow=syncNow;
window.cloudSyncChooseLocal=chooseLocal;window.cloudSyncChooseCloud=chooseCloud;window.cloudSyncPause=pause;
window.cloudSyncResolveLocal=resolveLocal;window.cloudSyncResolveCloud=resolveCloud;window.cloudSyncPauseConflict=pauseConflict;
window.cloudSyncDownloadLocal=downloadLocal;window.cloudSyncDownloadCloud=downloadCloud;window.cloudSyncAddTest=addTest;window.cloudSyncResume=resume;
init();
})();
