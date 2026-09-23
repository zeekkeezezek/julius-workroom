/* Flat WORK cards and timer controls. The existing exercise/audio/calendar code is shared. */
function workItemBy(id){return data.workItems.find(p=>p.id===id)}
function activeWorkItems(){return data.workItems.filter(p=>p.archivedAt==null).sort((a,b)=>(b.lastWorkedAt||b.createdAt||0)-(a.lastWorkedAt||a.createdAt||0))}
function logWorkName(l){return !l.micro&&workItemBy(l.workItemId)?.name||l.workItemName||(l.micro?'小さな一歩':'旧記録')}
function minutesFor(period,id=null){return logsFor(period).filter(l=>!l.micro&&(id===null||l.workItemId===id)).reduce((a,l)=>a+(Number(l.minutes)||0),0)}
function rebuildActivity(){data.activity=WorkroomSchema.activityFrom(data.logs,data.timer,data.activity)}
function refreshWorkLastWorked(){for(const p of data.workItems){const times=data.logs.filter(l=>!l.micro&&l.workItemId===p.id).map(l=>l.ts);p.lastWorkedAt=times.length?Math.max(...times):null}}
function workDate(ts){if(!ts)return'—';return dateKey(new Date(ts))===dateKey()?'今日':new Date(ts).toLocaleDateString('ja-JP',{month:'numeric',day:'numeric'})}
function workCard(p,manage=true){
 const today=minutesFor('today',p.id),busy=!!data.timer,arch=p.archivedAt!=null;
 return `<article class="workItem"><div class="workItemText"><h3>${esc(p.name)}</h3><div class="workItemMeta">今日 ${today?fmtMin(today):'—'} ・ 累計 ${fmtMin(minutesFor('all',p.id))} ・ 最終 ${workDate(p.lastWorkedAt)}</div></div><div class="workItemActions">${arch?`<button class="btn small" data-work-restore="${esc(p.id)}">復元</button>`:`<button class="btn primary workPlay" data-work-start="${esc(p.id)}" aria-label="${esc(p.name)}を開始" ${busy?'disabled':''}>▶</button>`}${manage?`<button class="btn workManage" data-work-edit="${esc(p.id)}" aria-label="${esc(p.name)}を編集">…</button>`:''}</div></article>`;
}
function bindWorkCards(){
 document.querySelectorAll('[data-work-start]').forEach(b=>b.onclick=()=>quickStart(b.dataset.workStart));
 document.querySelectorAll('[data-work-edit]').forEach(b=>b.onclick=()=>editWorkItem(b.dataset.workEdit));
 document.querySelectorAll('[data-work-restore]').forEach(b=>b.onclick=()=>restoreWorkItem(b.dataset.workRestore));
}
function renderWorkItems(){
 document.getElementById('workItems').innerHTML=activeWorkItems().map(p=>workCard(p)).join('')||'<div class="empty">作業名を一つ追加すれば、ここから始められる。</div>';
 const archived=data.workItems.filter(p=>p.archivedAt!=null).sort((a,b)=>b.archivedAt-a.archivedAt);
 document.getElementById('archiveCount').textContent=archived.length;
 document.getElementById('archivedWorkItems').innerHTML=archived.map(p=>workCard(p)).join('')||'<div class="empty">保管中の作業はない。</div>';
 bindWorkCards();
}
function editWorkItem(id=null){const p=workItemBy(id);document.getElementById('workItemId').value=p?.id||'';document.getElementById('workItemName').value=p?.name||'';document.getElementById('workItemModalTitle').textContent=p?'作業名を変更':'作業を追加';document.getElementById('saveWorkItemBtn').textContent=p?'保存':'追加';document.getElementById('archiveWorkItemBtn').hidden=!p||p.archivedAt!=null;document.getElementById('manualWorkLogBtn').hidden=!p||p.archivedAt!=null;openModal('workItemModal');document.getElementById('workItemName').focus()}

// Separate creation state: never reuse the existing log editor's ID.
function openManualWorkLog(){
 const p=workItemBy(document.getElementById('workItemId').value);
 if(!p||p.archivedAt!=null)return toast('作業一覧の項目を確認してくれ');
 document.getElementById('manualWorkItemId').value=p.id;
 document.getElementById('manualWorkLabel').textContent=p.name;
 document.getElementById('manualWorkDate').value=toLocalInput(Date.now());
 document.getElementById('manualWorkMinutes').value='';
 document.getElementById('manualWorkNote').value='';
 closeModal('workItemModal');openModal('manualWorkLogModal');
 document.getElementById('manualWorkMinutes').focus();
}
function saveManualWorkLog(){
 const p=workItemBy(document.getElementById('manualWorkItemId').value);
 if(!p||p.archivedAt!=null)return toast('対象の作業が変更された。作業一覧から開き直してくれ');
 const dateInput=document.getElementById('manualWorkDate'),ts=new Date(dateInput.value).getTime();
 if(!dateInput.value||!dateInput.checkValidity()||!Number.isFinite(ts)||toLocalInput(ts)!==dateInput.value)return toast('日時を確認してくれ');
 const minutes=Number(document.getElementById('manualWorkMinutes').value);
 if(!Number.isSafeInteger(minutes)||minutes<1)return toast('作業時間を確認してくれ');
 const previous=structuredClone(data);
 data.logs.push({id:uid('l'),ts,workItemId:p.id,workItemName:p.name,minutes,note:document.getElementById('manualWorkNote').value.trim(),micro:false});
 rebuildActivity();refreshWorkLastWorked();
 try{save()}catch(e){data=previous;return toast('保存できなかった。入力を残しているので、空き容量を確認してくれ')}
 document.getElementById('manualWorkItemId').value='';
 closeModal('manualWorkLogModal');renderAll();playUiSound('workComplete');julius('manualWorkLog');toast('作業時間を'+minutes+'分追加した');
}
lines.manualWorkLog=[
 {t:'記録した。開始を押し忘れていても、実際にやった作業まで無かったことにはしない。',m:'neutral'},
 {t:'後からでも構わない。君がやった分は、きちんと残しておこう。',m:'smile'},
 {t:'承知した。その時間は確かに作業したのだろう。記録しておく。',m:'neutral'},
 {t:'タイマーを忘れたか。……まあいい。作業そのものを忘れたわけではない。',m:'smile'},
 {t:'記録を忘れたことより、実際に手を動かしたことの方が重要だ。',m:'neutral'},
 {t:'次から押せればそれでいい。今回は私が後から拾っておく。',m:'smile'},
 {t:'君。記録のために作業しているわけではない。やった時間は、後からでも残せばいい。',m:'focused'}
];
function saveWorkItem(){const name=document.getElementById('workItemName').value.trim(),id=document.getElementById('workItemId').value;if(!name)return toast('作業名を入れてくれ');const p=workItemBy(id);if(p)p.name=name;else data.workItems.push({id:uid('p'),name,createdAt:Date.now(),lastWorkedAt:null,archivedAt:null});save();closeModal('workItemModal');renderAll();toast(p?'名前を変更した':'作業を追加した')}
function archiveWorkItem(){const p=workItemBy(document.getElementById('workItemId').value);if(!p)return;if(data.timer?.workItemId===p.id)return toast('この作業のタイマーを先に記録・終了してくれ');p.archivedAt=Date.now();save();closeModal('workItemModal');renderAll();julius('archive');toast('アーカイブした。記録は残っている')}
function restoreWorkItem(id){const p=workItemBy(id);if(!p)return;p.archivedAt=null;save();renderAll();toast('作業一覧へ戻した')}
function renderWorkChart(id,period,limit=999){const sums=new Map();for(const l of logsFor(period)){if(l.micro)continue;const key=l.workItemId??l.id,prev=sums.get(key)||{name:logWorkName(l),m:0};prev.m+=Number(l.minutes)||0;sums.set(key,prev)}renderRows(id,[...sums.values()].filter(x=>x.m>0).sort((a,b)=>b.m-a.m).slice(0,limit))}
function renderRows(id,rows){let max=Math.max(1,...rows.map(x=>x.m));document.getElementById(id).innerHTML=rows.length?rows.map(x=>`<div class="chartRow"><div class="chartName">${esc(x.name)}</div><div class="bar"><div class="fill" style="width:${x.m/max*100}%"></div></div><div class="chartVal">${fmtMin(x.m)}</div></div>`).join(''):'<div class="empty">まだ記録がない。</div>'}
function renderHome(){
 const values=[[fmtMin(minutesFor('today')),'今日の作業','ゼロでも失点なし'],[workLogs('today').length,'今日の記録','タイマー完了で残す'],[microCount('today'),'小さな一歩','起動や準備も価値がある'],[fmtMin(minutesFor('month')),'今月累積','積み上げた時間']];
 document.getElementById('todayMetrics').innerHTML=values.map(([v,k,s])=>`<div class="metric"><div class="n">${v}</div><div class="k">${k}</div><div class="sub">${s}</div></div>`).join('');
 renderWorkChart('todayChart','today');renderWorkChart('monthMiniChart','month',5);
 document.getElementById('continueList').innerHTML=activeWorkItems().slice(0,3).map(p=>workCard(p,false)).join('')||'<div class="empty">WORKで作業名を一つ追加してくれ。</div>';
 document.getElementById('homeWorkItems').innerHTML=activeWorkItems().slice(0,6).map(p=>workCard(p,false)).join('')||'<div class="empty">作業はまだない。</div>';
 renderHomeTracker();renderInbox();
}
function renderStats(){document.getElementById('periodMetrics').innerHTML=[['today','今日'],['week','今週'],['month','今月']].map(([p,n])=>`<div class="card metric"><div class="n">${fmtMin(minutesFor(p))}</div><div class="k">${n}</div><div class="sub">${workLogs(p).length} セッション / 小さな一歩 ${microCount(p)}</div></div>`).join('');renderWorkChart('workStats',data.ui.period);renderWeeklyReview()}
function renderTimerState(){const t=data.timer,p=t&&workItemBy(t.workItemId);document.getElementById('timerWorkName').textContent=p?p.name:'カードの ▶ から始められる';document.getElementById('timerStart').hidden=!t||t.running;document.getElementById('timerStart').disabled=!t||timerRemaining()<=0;document.getElementById('timerPause').hidden=!t?.running||timerRemaining()<=0;document.getElementById('timerComplete').disabled=!t;document.getElementById('timerCancel').disabled=!t;document.querySelectorAll('[data-timer-shortcut]').forEach(b=>b.disabled=!!t);document.querySelectorAll('[data-work-start]').forEach(b=>b.disabled=!!t)}
function syncTimerShortcuts(){const selected=Number(data.ui.timerMinutes)||15;document.querySelectorAll('[data-timer-shortcut]').forEach(b=>{const active=Number(b.dataset.timerShortcut)===selected;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active))})}
function setTimerMinutes(min){if(data.timer)return toast('今のタイマーを先に記録・終了してくれ');data.ui.timerMinutes=min;save();resetTimerDisplay(min);syncTimerShortcuts()}
function timerRemaining(){if(!data.timer)return (Number(data.ui.timerMinutes)||15)*60;if(data.timer.running)return Math.max(0,Math.round((data.timer.endAt-Date.now())/1000));return Math.max(0,Number(data.timer.remaining)||0)}
function resetTimerDisplay(min=Number(data.ui.timerMinutes)||15){if(data.timer)return;document.getElementById('timerDisplay').textContent=String(min).padStart(2,'0')+':00'}
function quickStart(id,minutes=Number(data.ui.timerMinutes)||15){
 if(data.timer){toast('今の作業を記録・終了してから次を始めてくれ');openWorkTimer();return false}
 const p=workItemBy(id);if(!p||p.archivedAt!=null)return false;
 try{ensureAudio()}catch(_){}
 data.ui.timerMinutes=minutes;data.timer={workItemId:id,duration:minutes*60,remaining:minutes*60,running:false,startedAt:Date.now(),endAt:null};
 startTimer();setView('work');document.getElementById('workTimerCard').scrollIntoView({block:'nearest',behavior:'smooth'});return true;
}
function startTimer(){const t=data.timer;if(!t)return toast('作業カードの ▶ を押してくれ');if(t.running)return;const p=workItemBy(t.workItemId);if(!p)return;const rem=timerRemaining();if(rem<=0)return openFinish(true);try{ensureAudio()}catch(_){}t.running=true;t.endAt=Date.now()+rem*1000;t.remaining=rem;idlePrompted=false;timerEndPlayed=false;lastActivity=Date.now();markActivity('started');alarmScheduled=scheduleTimerAlarm(rem);if(!tick)tick=setInterval(renderTimer,500);renderTimer();renderTimerState();julius('start');toast(p.name+'を開始した')}
function pauseTimer(){if(!data.timer?.running)return;data.timer.remaining=timerRemaining();data.timer.running=false;data.timer.endAt=null;cancelScheduledAlarm();save();if(tick){clearInterval(tick);tick=null}renderTimer();renderTimerState();toast('一時停止した')}
function elapsedMinutes(){return data.timer?Math.max(1,Math.round((data.timer.duration-timerRemaining())/60)):0}
function openFinish(auto=false){if(!data.timer)return;pendingFinish={minutes:auto?Math.max(1,Math.round(data.timer.duration/60)):elapsedMinutes(),workItemId:data.timer.workItemId,startedAt:data.timer.startedAt};document.getElementById('finishSummary').textContent=`${workItemBy(pendingFinish.workItemId)?.name||'作業'} / ${fmtMin(pendingFinish.minutes)}`;document.getElementById('finishNote').value='';openModal('finishModal');renderTimerState()}
function completeTimer(){if(!data.timer)return toast('作業カードから開始してくれ');pauseTimer();openFinish(false)}
function saveFinish(){
 if(!pendingFinish)return;
 if(!data.timer||pendingFinish.workItemId!==data.timer.workItemId||pendingFinish.startedAt!==data.timer.startedAt){pendingFinish=null;closeModal('finishModal');return toast('別端末でタイマーが更新された。現在の作業を確認してくれ')}
 const p=workItemBy(pendingFinish.workItemId);if(!p)return;
 const previous=structuredClone(data),ts=Date.now();
 data.logs.push({id:uid('l'),ts,workItemId:p.id,workItemName:p.name,minutes:pendingFinish.minutes,note:document.getElementById('finishNote').value.trim(),micro:false});p.lastWorkedAt=ts;data.timer=null;rebuildActivity();
 try{save()}catch(e){data=previous;return toast('保存できなかった。記録を確定せず、タイマーを残した')}
 cancelScheduledAlarm();if(tick){clearInterval(tick);tick=null}pendingFinish=null;closeModal('finishModal');renderAll();playUiSound('workComplete');julius('complete');toast('記録した');
}
function cancelTimer(){if(!data.timer)return;if(!confirm('このタイマーを取消すか？ 未記録の時間は保存されない。'))return;cancelScheduledAlarm();data.timer=null;pendingFinish=null;save();if(tick){clearInterval(tick);tick=null}closeModal('finishModal');renderAll();toast('取り消した。失点はない。')}
function chooseRecommendation(){const candidates=activeWorkItems(),box=document.getElementById('recommendBox');box.style.display='block';if(!candidates.length){box.innerHTML='<div class="recommendTask">WORKで作業名を一つ追加してくれ。</div>';return}const p=candidates[Math.floor(Math.random()*candidates.length)],avail=Number(data.ui.available)||15,dur=avail<=5?5:avail<=15?15:avail<=30?25:60;box.innerHTML=`<div class="recommendMeta">今日はこれにするか。${dur}分</div><h3>${esc(p.name)}</h3><div class="recommendActions"><button class="btn primary" id="recommendedStart">開始</button><button class="btn" onclick="chooseRecommendation()">別候補</button></div>`;document.getElementById('recommendedStart').onclick=()=>quickStart(p.id,dur);julius('recommend')}
function startFiveMinutes(){const a=activeWorkItems();if(!a.length)return toast('先に作業名を一つ追加してくれ');if(quickStart(a[Math.floor(Math.random()*a.length)].id,5))julius('fiveMin')}
function renderMicroManager(){document.getElementById('microManagerList').innerHTML=data.microActions.map(a=>`<div class="managerRow"><strong>${esc(a.label)}</strong><button class="btn small" data-micro-edit="${esc(a.id)}">編集</button></div>`).join('')||'<div class="empty">プリセットがない。</div>';document.querySelectorAll('[data-micro-edit]').forEach(b=>b.onclick=()=>editMicroPreset(b.dataset.microEdit))}
function clearMicroPresetForm(){document.getElementById('microPresetId').value='';document.getElementById('microPresetLabel').value='';document.getElementById('deleteMicroPresetBtn').style.display='none'}
function editMicroPreset(id){const a=data.microActions.find(x=>x.id===id);if(!a)return;document.getElementById('microPresetId').value=a.id;document.getElementById('microPresetLabel').value=a.label;document.getElementById('deleteMicroPresetBtn').style.display='inline-block'}
function saveMicroPreset(){const id=document.getElementById('microPresetId').value,label=document.getElementById('microPresetLabel').value.trim();if(!label)return toast('ボタン名を入れてくれ');const a=data.microActions.find(x=>x.id===id);if(a)a.label=label;else data.microActions.push({id:uid('ma'),label});save();renderMicroButtons();renderMicroManager();clearMicroPresetForm();toast('小さな一歩を保存した')}
function recordMicro(id){const a=data.microActions.find(x=>x.id===id);if(!a)return;data.logs.push({id:uid('m'),ts:Date.now(),workItemId:null,workItemName:a.label,minutes:0,note:a.label,micro:true});markActivity('micro');renderAll();playPraise();julius('micro');toast('小さな一歩を記録した')}
function inboxToWork(id){const item=data.inbox.find(i=>i.id===id);if(!item||!item.text.trim())return toast('作業名が空だ');const previous=structuredClone(data);data.workItems.push({id:uid('p'),name:item.text.trim(),createdAt:Date.now(),lastWorkedAt:null,archivedAt:null});data.inbox=data.inbox.filter(i=>i.id!==id);try{save()}catch(e){data=previous;return toast('作成できなかった。INBOXは残してある')}renderAll();toast('作業一覧に追加した')}
function renderInbox(){const a=[...data.inbox].sort((a,b)=>b.ts-a.ts);document.getElementById('inboxCount').textContent=a.length+'件';document.getElementById('inboxList').innerHTML=a.map(i=>`<div class="inboxItem"><div><div class="inboxText">${esc(i.text)}</div><div class="inboxMeta">${new Date(i.ts).toLocaleString('ja-JP')}</div></div><div class="inboxActions"><button class="btn small primary" data-inbox-work="${esc(i.id)}">作業にする</button><button class="btn small danger" data-inbox-delete="${esc(i.id)}">削除</button></div></div>`).join('')||'<div class="empty">思いついたら一行だけ放り込め。</div>';document.querySelectorAll('[data-inbox-work]').forEach(b=>b.onclick=()=>inboxToWork(b.dataset.inboxWork));document.querySelectorAll('[data-inbox-delete]').forEach(b=>b.onclick=()=>deleteInbox(b.dataset.inboxDelete))}
function restoreTimerRuntime(previousTimer=null){cancelScheduledAlarm();if(tick){clearInterval(tick);tick=null}if(!previousTimer||previousTimer.workItemId!==data.timer?.workItemId||previousTimer.startedAt!==data.timer?.startedAt)timerEndPlayed=false;pendingFinish=null;closeModal('finishModal');if(data.timer?.running){alarmScheduled=scheduleTimerAlarm(timerRemaining());tick=setInterval(renderTimer,500)}}
function backup(){downloadBackup(data,'julius_workroom_v12_'+dateKey()+'.json');toast('バックアップを書き出した')}
function downloadBackup(payload,name){const blob=new Blob([JSON.stringify({...payload,app:'JULIUS WORKROOM',appVersion:APP_VERSION,exportedAt:new Date().toISOString()},null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
function exportMigrationBackup(){const raw=localStorage.getItem(MIGRATION_BACKUP_KEY);if(!raw)return toast('この端末には移行前のコピーがない');const backup=JSON.parse(raw);downloadBackup(backup.payload,'julius_workroom_before_v12_'+dateKey()+'.json')}
function importJson(file){const r=new FileReader();r.onload=()=>{try{const original=JSON.parse(r.result),next=WorkroomSchema.normalize(original);if(!confirm('このJSONの記録に置き換えるか？ 現在の記録は先にJSONへ書き出す。旧版のBODY・カテゴリ情報は移行時に取り除く。'))return;backup();keepMigrationBackup(original);const old=data;data=next;try{save()}catch(e){data=old;throw e}restoreTimerRuntime();renderAll();toast('JSONを読み込んだ')}catch(e){alert('読み込みを完了できなかった。現在の保存データは維持している。\n'+e.message)}};r.readAsText(file)}
