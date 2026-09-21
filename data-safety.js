/* MyPortfolio Data Safety v2 — Offline First / Stable ID / Soft Delete */
(function(){
  'use strict';
  const NS='mff_ds_v2_';
  const QUEUE=NS+'queue';
  const TOMBSTONES=NS+'tombstones';
  const META=NS+'meta';
  const watched=/cache|data|items|bookshelf|profile|portfolio|money|expense|investment/i;
  const clone=o=>{try{return JSON.parse(JSON.stringify(o));}catch(e){return o;}};
  const read=(k,d)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):d;}catch(e){return d;}};
  const write=(k,v)=>{try{if(typeof rawSet==='function') rawSet(k,JSON.stringify(v)); else localStorage.setItem(k,JSON.stringify(v));return true;}catch(e){return false;}};
  const uuid=()=>{if(crypto&&crypto.randomUUID)return crypto.randomUUID();return 'mff-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,10);};
  const idOf=o=>o&&(o.id||o._id||o.mff_id||o.record_id||null);
  function normalizeRecord(r){
    if(!r||typeof r!=='object') return r;
    if(!idOf(r)) r.mff_id=uuid(); else if(!r.mff_id) r.mff_id=idOf(r);
    if(!r.created_at) r.created_at=new Date().toISOString();
    r.updated_at=new Date().toISOString();
    if(r._deleted===undefined) r._deleted=false;
    if(!r._revision) r._revision=1;
    return r;
  }
  function queue(op){
    const q=read(QUEUE,[]); q.push(Object.assign({qid:uuid(),queued_at:new Date().toISOString()},op));
    write(QUEUE,q.slice(-500)); updateBadge();
  }
  function snapshotKey(key){return NS+'base_'+key;}
  function captureArray(key,arr){
    if(!Array.isArray(arr)) return arr;
    const old=read(key+'_mff_prev',null);
    const oldMap={}; if(Array.isArray(old)) old.forEach(x=>{const id=idOf(x);if(id)oldMap[id]=x;});
    const next=arr.map(normalizeRecord);
    // Missing records become tombstones instead of silent hard deletes.
    if(Array.isArray(old)) old.forEach(x=>{
      const id=idOf(x); if(id && !next.some(n=>idOf(n)===id)){
        const ts=read(TOMBSTONES,[]); if(!ts.some(t=>t.key===key&&t.id===id)){
          ts.push({key,id,record:clone(x),deleted_at:new Date().toISOString()}); write(TOMBSTONES,ts.slice(-500));
          queue({type:'delete',key,id,record:clone(x)});
        }
      }
    });
    write(key+'_mff_prev',clone(next));
    return next;
  }
  const rawSet=localStorage.setItem.bind(localStorage);
  const rawRemove=localStorage.removeItem.bind(localStorage);
  // Intercept only application JSON arrays. This adds IDs and an offline queue without changing page APIs.
  localStorage.setItem=function(key,value){
    try{
      if(typeof value==='string' && watched.test(key) && key.indexOf(NS)!==0){
        const parsed=JSON.parse(value);
        if(Array.isArray(parsed)){
          const normalized=captureArray(key,parsed);
          value=JSON.stringify(normalized);
          queue({type:'upsert_batch',key,records:clone(normalized.filter(x=>x&&!x._deleted))});
        }else if(parsed && typeof parsed==='object' && !Array.isArray(parsed)){
          const n=normalizeRecord(parsed); value=JSON.stringify(n); queue({type:'upsert',key,record:clone(n)});
        }
      }
    }catch(e){}
    rawSet(key,value); updateBadge();
  };
  localStorage.removeItem=function(key){
    // Do not physically delete watched application data. Keep a tombstone marker.
    if(watched.test(key) && key.indexOf(NS)!==0){
      const old=read(key,null); if(old){
        const tomb=read(TOMBSTONES,[]); tomb.push({key,id:'__container__',record:clone(old),deleted_at:new Date().toISOString()}); write(TOMBSTONES,tomb.slice(-500));
        queue({type:'delete_container',key,record:clone(old)});
      }
    }
    rawRemove(key); updateBadge();
  };
  function pending(){return read(QUEUE,[]).length;}
  function updateBadge(){
    const n=pending(); document.querySelectorAll('[data-mff-pending]').forEach(el=>{el.textContent=n?('รอ Sync '+n+' รายการ'):'พร้อมใช้งาน';el.dataset.pending=n;});
    try{window.dispatchEvent(new CustomEvent('mff:data-safety',{detail:{pending:n,online:navigator.onLine}}));}catch(e){}
  }
  function restoreLast(){
    const ts=read(TOMBSTONES,[]); const last=ts[ts.length-1]; if(!last||!last.record)return false;
    const cur=read(last.key,[]); if(Array.isArray(cur)){cur.push(Object.assign({},last.record,{_deleted:false})); rawSet(last.key,JSON.stringify(cur));}
    else rawSet(last.key,JSON.stringify(last.record));
    ts.pop(); write(TOMBSTONES,ts); updateBadge(); return true;
  }
  function softDelete(key,id){
    const arr=read(key,[]); if(!Array.isArray(arr))return false;
    const item=arr.find(x=>idOf(x)===id); if(!item)return false;
    item._deleted=true; item.deleted_at=new Date().toISOString(); item.updated_at=item.deleted_at; item._revision=(item._revision||0)+1;
    rawSet(key,JSON.stringify(arr)); queue({type:'delete',key,id,record:clone(item)}); updateBadge(); return true;
  }
  function restore(key,id){
    const arr=read(key,[]); if(!Array.isArray(arr))return false; const item=arr.find(x=>idOf(x)===id); if(!item)return false;
    item._deleted=false; delete item.deleted_at; item.updated_at=new Date().toISOString(); item._revision=(item._revision||0)+1;
    rawSet(key,JSON.stringify(arr)); queue({type:'upsert',key,record:clone(item)}); updateBadge(); return true;
  }
  function exportQueue(){return clone(read(QUEUE,[]));}
  function clearQueue(){rawSet(QUEUE,'[]');updateBadge();}
  window.MFFDataSafety={version:'2.0',pending,softDelete,restore,restoreLast,exportQueue,clearQueue,updateBadge,queue,normalizeRecord};
  window.addEventListener('online',updateBadge); window.addEventListener('offline',updateBadge);
  setTimeout(updateBadge,0);
})();
