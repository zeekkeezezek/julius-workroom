/* Deterministic, non-mutating migrations shared by local, JSON and cloud entry points. */
(function(root){
'use strict';
const defaults={idleCheck:true,juliusCheck:true,sound:true,alarmVolume:'loud',weeklyExerciseTarget:120};
const microDefaults=['執筆ファイルを開いた','Blenderを起動した','ZBrushを起動した','MMDを起動した','裁縫道具を出した','作業机を片付けた'].map((label,i)=>({id:'ma_'+i,label}));
const clone=x=>JSON.parse(JSON.stringify(x));
const dayKey=ts=>{const d=new Date(ts);return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')};
function activityFrom(logs,timer,previous={}){
  const result={};
  for(const [key,value] of Object.entries(previous||{}))if(value?.started)result[key]={started:true,micro:0,completed:0};
  const touch=ts=>result[dayKey(ts)]||(result[dayKey(ts)]={started:false,micro:0,completed:0});
  for(const log of logs){const a=touch(log.ts);if(log.micro)a.micro++;else{a.started=true;a.completed++}}
  if(timer?.startedAt)touch(timer.startedAt).started=true;
  return result;
}
function fresh(){return {version:12,workItems:[],logs:[],activity:{},exerciseLogs:[],microActions:clone(microDefaults),inbox:[],syncTests:[],settings:{...defaults},ui:{energy:'normal',available:15,period:'today',timerMinutes:15},timer:null}}
function normalize(input){
  if(!input||typeof input!=='object'||Array.isArray(input))throw new Error('Invalid WORKROOM data');
  const version=Number(input.version||0);
  if(!Number.isInteger(version)||version<1||version>12)throw new Error('Unsupported schema');
  const x=clone(input);
  for(const key of ['logs','exerciseLogs','microActions','inbox','syncTests','categories','workItems'])if(x[key]!=null&&!Array.isArray(x[key]))throw new Error('Invalid '+key);
  if(version===1&&Array.isArray(x.hobbies)){
    x.categories=x.hobbies.map((h,i)=>({id:'legacy-category-'+i,projects:[{...h,id:h.id||'legacy-hobby-'+i,name:h.name||'旧記録'}]}));
    x.logs=(x.logs||[]).map(l=>({...l,projectId:l.projectId??l.hobbyId,projectName:l.projectName||(x.hobbies.find(h=>h.id===l.hobbyId)?.name)||'旧記録'}));
    if(x.timer)x.timer.projectId=x.timer.projectId??x.timer.hobbyId;
    delete x.hobbies;
  }
  // v2-v10 already used categories/projects; their optional collections are filled here.
  const legacy=version<12;
  const originals=legacy?(x.categories||[]).flatMap(c=>{if(c.projects!=null&&!Array.isArray(c.projects))throw new Error('Invalid projects');return c.projects||[]}):(x.workItems||[]);
  const ids=new Set();
  x.workItems=originals.map((p,i)=>{
    const id=p.id??'legacy-work-'+i;
    if(ids.has(id))throw new Error('Duplicate work item ID');ids.add(id);
    return {id,name:String(p.name||'旧記録'),createdAt:Number(p.createdAt)||0,lastWorkedAt:Number(p.lastWorkedAt)||null,archivedAt:(legacy?p.completedAt:p.archivedAt)??null};
  });
  const originalIds=new Set(ids),byId=new Map(x.workItems.map(p=>[p.id,p]));
  x.logs=(x.logs||[]).map((old,i)=>{
    const l={...old,micro:!!old.micro,minutes:Number(old.minutes)||0};
    if(!Number.isFinite(Number(l.ts)))throw new Error('Invalid log timestamp');
    l.workItemId=l.micro?null:(old.workItemId??old.projectId??'legacy-orphan-'+(old.id??i));
    l.workItemName=String(old.workItemName||old.projectName||(l.micro?old.note:'')||byId.get(l.workItemId)?.name||(l.micro?'小さな一歩':'旧記録'));
    if(!l.micro&&!byId.has(l.workItemId)){
      const item={id:l.workItemId,name:l.workItemName,createdAt:Number(l.ts)||0,lastWorkedAt:Number(l.ts)||null,archivedAt:Number(l.ts)||1};
      byId.set(item.id,item);x.workItems.push(item);
    }
    for(const key of ['categoryId','categoryName','projectId','projectName','hobbyId'])delete l[key];
    return l;
  });
  for(const p of x.workItems){
    const times=x.logs.filter(l=>!l.micro&&l.workItemId===p.id).map(l=>Number(l.ts));
    if(times.length){p.lastWorkedAt=Math.max(p.lastWorkedAt||0,...times);if(!p.createdAt)p.createdAt=Math.min(...times)}
  }
  if(x.timer){
    const t=x.timer,id=t.workItemId??t.projectId;
    x.timer=originalIds.has(id)?{workItemId:id,duration:t.duration,remaining:t.remaining,running:!!t.running,startedAt:t.startedAt??null,endAt:t.endAt??null}:null;
  }else x.timer=null;
  x.microActions=(x.microActions||microDefaults).map((a,i)=>({id:a.id??'legacy-micro-'+i,label:String(a.label||'小さな一歩')}));
  x.exerciseLogs=(x.exerciseLogs||[]).map(l=>{const n={...l,minutes:Number(l.minutes)||0};if(l.measure==='reps'){n.reps=Math.min(999,Math.max(1,Math.round(Number(l.reps)||10)));n.minutes=0}return n});
  x.inbox=x.inbox||[];x.syncTests=x.syncTests||[];
  x.settings={...defaults,...x.settings};x.settings.weeklyExerciseTarget=Math.min(600,Math.max(30,Math.round(Number(x.settings.weeklyExerciseTarget)||120)));
  x.ui={energy:'normal',available:15,period:'today',timerMinutes:15,...x.ui};delete x.ui.excludedToday;
  delete x.categories;delete x.bodyDays;
  delete x.app;delete x.appVersion;delete x.exportedAt;
  x.activity=activityFrom(x.logs,x.timer,x.activity);x.version=12;
  return x;
}
const api={fresh,normalize,activityFrom};root.WorkroomSchema=api;
if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
