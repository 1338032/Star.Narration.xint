/*
╔══════════════════════════════════════════════════════════════════
║  星叙 script-1-core.js — JS 结构目录（拆分 1/5）
║  主题：基础设施 & 角色设定层
║
║  本文件是原 script.js 按功能板块拆成的 5 份之一，浏览器里需要按顺序加载：
║  script-1-core.js → script-2-content.js → script-3-settings.js → script-4-aitools.js → script-5-system.js
║  （原单文件共 40191 行；本文件对应原文件第 182~4663 行，body 共 4482 行）
╠══════════════════════════════════════════════════════════════════
║   IndexedDB 存储系统                                          61
║   CONFIG                                                  205
║   STORAGE                                                 211
║   SAFE LOCAL STORAGE HELPER                               280
║   APP STATE CONTAINER                                     292
║   WORLD MAP 世界地图（数据层）                                    294
║   STATE                                                   446
║   后台保活 & 生成队列                                             520
║   内置官方资源包                                                 617
║   END 内置官方资源包                                             698
║   PAGE LOADING SYSTEM                                     726
║   TOAST                                                   810
║   CONFIRM DIALOG                                          836
║   INPUT DIALOG                                            878
║   INPUT LIMIT HELPERS 输入限制工具                              891
║   统一错误处理                                                  1003
║   UTILITY                                                 1011
║   Token估算                                                 1034
║   NAV                                                     1169
║   TAGS                                                    1234
║   TYPE SWITCH                                             1512
║   ARTICLES RENDER                                         1520
║   TOGGLE LIKE (by id)                                     1589
║   SYNC HELPER                                             1671
║   API CONFIG                                              1719
║   CHARACTER MANAGEMENT                                    2177
║   人物关系图                                                   2217
║   NPC设定                                                   2489
║   万能输入框                                                   2518
║   万能输入框 END                                               2669
║   今日一写 END                                                3012
║   自定义灵感管理                                                 3014
║   自定义灵感管理 END                                             3079
║   人物设定页 Tab 切换                                            3081
║   三句话人设                                                   3095
║   三句话人设 END                                               3161
║   这里发生了什么                                                 3163
║   这里发生了什么 END                                             3182
║   万能输入框 全屏页                                               3184
║   万能输入框 全屏页 END                                           3487
║   AI建档                                                    3489
║   AI建档 END                                                3554
║   我卡住了                                                    3556
║   我卡住了 END                                                3577
║   懒人通道                                                    3596
║   懒人通道 END                                                3684
║   SYSTEM PROMPT                                           3901
║   系统提示词条目内容生成（供 buildSysPrompt 和条目列表渲染共用，两边保证读到的是同一份文本）   3902
║   STREAM API CALL                                         4286
╚══════════════════════════════════════════════════════════════════
*/

// ==================== IndexedDB 存储系统 ====================
const DB_NAME = 'BijiAI_DB'; // 保留原名以兼容已有数据
const DB_VERSION = 1;
const STORE_NAME = 'data';
let db = null;
let dbReady = false;
let dbCache = {}; // 内存缓存

// 初始化数据库
function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onerror = () => {
            console.error('IndexedDB 打开失败');
            reject(request.error);
        };
        
        request.onsuccess = () => {
            db = request.result;
            dbReady = true;
            resolve(db);
        };
        
        request.onupgradeneeded = (e) => {
            const database = e.target.result;
            if (!database.objectStoreNames.contains(STORE_NAME)) {
                database.createObjectStore(STORE_NAME, { keyPath: 'key' });
            }
        };
    });
}

// 从IndexedDB读取
function dbGet(key) {
    return new Promise((resolve) => {
        if (!db) { resolve(null); return; }
        try {
            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const request = store.get(key);
            request.onsuccess = () => {
                const result = request.result;
                resolve(result ? result.value : null);
            };
            request.onerror = () => resolve(null);
        } catch (e) {
            resolve(null);
        }
    });
}

// 写入IndexedDB
function dbSet(key, value) {
    return new Promise((resolve) => {
        if (!db) { resolve(false); return; }
        try {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            store.put({ key: key, value: value });
            tx.oncomplete = () => resolve(true);
            tx.onerror = (e) => {
                console.warn('IndexedDB写入失败('+key+'):', e);
                try{var s=JSON.stringify(value);if(s.length<50000)localStorage.setItem(key,s);}catch(le){
                  // IndexedDB和localStorage都失败了，需要紧急提醒
                  if(typeof showToastForce==='function'){
                    showToastForce('数据保存失败！请立即导出备份',6000);
                  }
                }
                resolve(false);
            };
        } catch (e) {
            console.warn('IndexedDB事务异常('+key+'):', e);
            try{var s2=JSON.stringify(value);if(s2.length<50000)localStorage.setItem(key,s2);}catch(le2){}
            resolve(false);
        }
    });
}

// 从IndexedDB加载所有数据到缓存
async function loadAllFromDB() {
    if (!db) return;
    return new Promise((resolve) => {
        // 超时保护：最多等5秒，防止IndexedDB卡死
        const timeout = setTimeout(() => {
            console.warn('IndexedDB加载超时，使用localStorage兜底');
            resolve();
        }, 5000);
        try {
            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const request = store.getAll();
            request.onsuccess = () => {
                clearTimeout(timeout);
                const items = request.result || [];
                let count = 0;
                items.forEach(item => {
                    if (item && item.key) {
                        dbCache[item.key] = item.value;
                        count++;
                    }
                });
                    resolve();
            };
            request.onerror = () => {
                clearTimeout(timeout);
                console.warn('IndexedDB读取失败，使用localStorage兜底');
                resolve();
            };
        } catch (e) {
            clearTimeout(timeout);
            logError('loadAllFromDB', e);
            resolve();
        }
    });
}

// 获取IndexedDB使用量
async function getDBStorageUsage() {
    if (!db) return { used: 0, usedMB: '0', percent: 0 };
    return new Promise((resolve) => {
        try {
            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const request = store.getAll();
            request.onsuccess = () => {
                const items = request.result || [];
                let total = 0;
                items.forEach(item => {
                    total += JSON.stringify(item).length * 2;
                });
                const maxSize = 50 * 1024 * 1024; // 50MB
                resolve({
                    used: total,
                    usedMB: (total / 1024 / 1024).toFixed(2),
                    percent: (total / maxSize * 100).toFixed(1)
                });
            };
            request.onerror = () => resolve({ used: 0, usedMB: '0', percent: 0 });
        } catch (e) {
            resolve({ used: 0, usedMB: '0', percent: 0 });
        }
    });
}
// ==================== CONFIG ====================
const APP_VER='v1.5.0';
// 协议版本号：老用户不需要重新确认
// 用 var（而非 const/let）以确保挂载到 window 上，跨 script 块可靠访问
var AGREEMENT_VER='1.2';
// ==================== STORAGE ====================
const K={
tags:'bj_tags',apiP:'bj_apiP',charP:'bj_charP',worldP:'bj_worldP',
curApi:'bj_curApi',curChars:'bj_curChars',curWorld:'bj_curWorld',
cols:'bj_cols',ws:'bj_ws',ap:'bj_ap'
};
function ld(k, fb) {
    // 优先从内存缓存读取
    if (dbCache.hasOwnProperty(k)) {
        return dbCache[k];
    }
    // 回退到localStorage（兼容旧数据）
    try {
        const d = localStorage.getItem(k);
        if (d) {
            const parsed = JSON.parse(d);
            dbCache[k] = parsed; // 存入缓存
            return parsed;
        }
        return fb;
    } catch {
        return fb;
    }
}

let _svQueue = new Map();
let _svTimer = null;

function sv(k, d) {
    dbCache[k] = d;
    _svQueue.set(k, d);
    
    // 合并写入：50ms内的多次sv只执行一次实际写入
    if (!_svTimer) {
        _svTimer = setTimeout(_flushSv, 50);
    }
}

function _flushSv() {
    _svTimer = null;
    _svQueue.forEach((d, k) => {
        // IndexedDB写入
        if (dbReady && db) {
            dbSet(k, d).catch(() => {});
        }
        // localStorage写入（小数据才写）
        try {
            var str = JSON.stringify(d);
            // 超过100KB的数据只写IndexedDB，不写localStorage
            if(str.length < 100000) {
                localStorage.setItem(k, str);
            }
        } catch (e) {
            if (e.name === 'QuotaExceededError') {
                try {
                    localStorage.removeItem('bj_genLogs');
                    localStorage.removeItem('bj_xjMessages');
                    localStorage.setItem(k, JSON.stringify(d));
                } catch (e2) {
            console.warn('localStorage 空间不足，数据仅保存在IndexedDB:', k);
            if(typeof backupReminder !== 'undefined' && backupReminder && typeof showToastForce === 'function'){
  showToastForce('本地存储已满！建议立即导出备份，否则数据可能丢失', 6000);
}
        }
            }
        }
    });
    _svQueue.clear();
}
// ==================== SAFE LOCAL STORAGE HELPER ====================
// 所有不走 sv/ld 的 localStorage 原始调用都应改用这个函数，防止配额不足或隐私模式下静默崩溃
function safeLS(op, key, val) {
  try {
    if (op === 'get') return localStorage.getItem(key);
    if (op === 'set') { localStorage.setItem(key, val); return true; }
    if (op === 'del') { localStorage.removeItem(key); return true; }
  } catch (e) {
    return null;
  }
  return null;
}
// ==================== APP STATE CONTAINER ====================
const AppState = {};
// ==================== WORLD MAP 世界地图（数据层）====================
// 编辑器界面在 script-6-worldmap.js；这里只放状态校验、克隆、保存和提示词文字。
// 预设(script-3)、备份(script-3/4/5)、提示词拼接(script-1/5)都要用到，所以必须先于它们加载。
const WM_W=1280; // 地图图片固定为 16:9 的 1280×720；分区/地点的坐标一律存 0~1 的比例，不依赖像素尺寸
const WM_H=720;
const WM_COLORS=[
{hex:'#e74c3c',name:'红'},{hex:'#f39c12',name:'橙'},{hex:'#f1c40f',name:'黄'},{hex:'#2ecc71',name:'绿'},
{hex:'#00cec9',name:'青'},{hex:'#3498db',name:'蓝'},{hex:'#9b59b6',name:'紫'}
];
// zones/pins/links：数量上限；vertices：单个分区的顶点数上限；name/content：字数上限；
// prompt：启用地图后追加进提示词的字数上限；undo：撤回步数；img：地图图片(data URL)字符数上限
const WM_LIMIT={zones:30,pins:50,links:80,vertices:60,name:20,content:500,prompt:2000,undo:30,img:3000000};
// 自动空间关系的判定参数（单位：地图像素，即 1280×720 坐标系）：
// ADJ_TOL：两个分区的边相距不超过这个值算「相邻」；NEAR_TOL：地点在分区外、离分区边界不超过这个值写「靠近」；
// CENTER_RATIO：地点离分区重心不超过「等面积圆半径」的这个比例写「中部」；MAX_OFF_REL：被取消写入的自动关系最多记录多少条
const WM_ADJ_TOL=4;
const WM_NEAR_TOL=40;
const WM_CENTER_RATIO=0.25;
const WM_MAX_OFF_REL=2000;
const WM_DIR_NAMES=['东','东北','北','西北','西','西南','南','东南']; // 图片上方为正北
// 地点类型：id 存进数据；name 是选择器上的短名；label 是写进提示词的名称（默认的针不写）。图标在 script-6-worldmap.js 里
const WM_PIN_TYPES=[
{id:'pin',name:'默认',label:''},{id:'city',name:'城',label:'城市'},{id:'village',name:'村',label:'村庄'},
{id:'mountain',name:'山',label:'山地'},{id:'port',name:'港',label:'港口'},{id:'ruins',name:'遗迹',label:'遗迹'},
{id:'pass',name:'关隘',label:'关隘'},{id:'forest',name:'森林',label:'森林'},{id:'temple',name:'神殿',label:'神殿'}
];
function wmEmptyMap(){return {img:'',enabled:false,autoSpatial:true,offRel:[],zones:[],pins:[],links:[]};}
function wmNewId(prefix){return prefix+Date.now().toString(36)+Math.random().toString(36).slice(2,6);}
// 文字清洗：去掉控制字符并按字数截断；singleLine=true 时把换行压成空格（名称用）
function wmCleanText(v,max,singleLine){
var s=typeof v==='string'?v:(v==null?'':String(v));
s=s.replace(/\r\n?/g,'\n').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g,'');
if(singleLine)s=s.replace(/[\n\t]+/g,' ');
s=s.trim();
var chars=Array.from(s);
return chars.length>max?chars.slice(0,max).join('').trim():s;
}
function wmCleanColor(c){
for(var i=0;i<WM_COLORS.length;i++){if(WM_COLORS[i].hex===c)return c;}
return WM_COLORS[0].hex;
}
// 坐标比例：非数字返回 null（调用方丢弃该点），超出范围夹到 0~1
function wmCleanRatio(n){
var v=typeof n==='number'?n:parseFloat(n);
if(!isFinite(v))return null;
return Math.round(Math.min(1,Math.max(0,v))*10000)/10000;
}
function wmCleanId(v){return (typeof v==='string'&&/^[A-Za-z0-9_-]{1,40}$/.test(v))?v:'';}
// 地点类型：不认识的值（旧数据、手改的备份）一律退回默认的针
function wmCleanPinType(v){
for(var i=0;i<WM_PIN_TYPES.length;i++){if(WM_PIN_TYPES[i].id===v)return v;}
return WM_PIN_TYPES[0].id;
}
function wmPinTypeLabel(v){
for(var i=0;i<WM_PIN_TYPES.length;i++){if(WM_PIN_TYPES[i].id===v)return WM_PIN_TYPES[i].label;}
return '';
}
// 被取消写入的自动关系编号清单：只收字母数字和 : _ -，去重，数量封顶
function wmCleanKeyList(list){
var out=[],seen={};
if(!Array.isArray(list))return out;
for(var i=0;i<list.length&&out.length<WM_MAX_OFF_REL;i++){
var k=list[i];
if(typeof k!=='string'||!/^[A-Za-z0-9:_-]{1,120}$/.test(k)||seen[k])continue;
seen[k]=true;out.push(k);
}
return out;
}
// 所有来自存储/备份/预设的地图数据都必须先过这里：不合法的字段会被丢弃或修正，保证后面的渲染代码可以放心使用
function wmSanitizeMap(raw){
var out=wmEmptyMap();
if(!raw||typeof raw!=='object')return out;
var img=typeof raw.img==='string'?raw.img:'';
if(!/^data:image\/(jpeg|png|webp);base64,/.test(img)||img.length>WM_LIMIT.img)return out;
out.img=img;
out.enabled=raw.enabled===true;
out.autoSpatial=raw.autoSpatial!==false; // 旧数据没有这个字段，默认开启
out.offRel=wmCleanKeyList(raw.offRel);
var seen={};
var zones=Array.isArray(raw.zones)?raw.zones:[];
for(var i=0;i<zones.length&&out.zones.length<WM_LIMIT.zones;i++){
var z=zones[i];
if(!z||typeof z!=='object'||!Array.isArray(z.pts))continue;
var zid=wmCleanId(z.id),zname=wmCleanText(z.name,WM_LIMIT.name,true);
if(!zid||!zname||seen['zone:'+zid])continue;
var pts=[];
for(var j=0;j<z.pts.length&&pts.length<WM_LIMIT.vertices;j++){
var pt=z.pts[j];
if(!Array.isArray(pt))continue;
var px=wmCleanRatio(pt[0]),py=wmCleanRatio(pt[1]);
if(px===null||py===null)continue;
pts.push([px,py]);
}
if(pts.length<3)continue;
seen['zone:'+zid]=true;
out.zones.push({id:zid,name:zname,content:wmCleanText(z.content,WM_LIMIT.content,false),color:wmCleanColor(z.color),pts:pts,inPrompt:z.inPrompt!==false,hidden:z.hidden===true,hideName:z.hideName===true}); // inPrompt：是否写入提示词，旧数据没有这个字段，默认写入
}
var pins=Array.isArray(raw.pins)?raw.pins:[];
for(var k=0;k<pins.length&&out.pins.length<WM_LIMIT.pins;k++){
var p=pins[k];
if(!p||typeof p!=='object')continue;
var pid=wmCleanId(p.id),pname=wmCleanText(p.name,WM_LIMIT.name,true);
var x=wmCleanRatio(p.x),y=wmCleanRatio(p.y);
if(!pid||!pname||x===null||y===null||seen['pin:'+pid])continue;
seen['pin:'+pid]=true;
out.pins.push({id:pid,name:pname,content:wmCleanText(p.content,WM_LIMIT.content,false),color:wmCleanColor(p.color),x:x,y:y,type:wmCleanPinType(p.type),inPrompt:p.inPrompt!==false,hidden:p.hidden===true,hideName:p.hideName===true});
}
var links=Array.isArray(raw.links)?raw.links:[];
for(var m=0;m<links.length&&out.links.length<WM_LIMIT.links;m++){
var l=links[m];
if(!l||typeof l!=='object'||!l.a||!l.b)continue;
var lid=wmCleanId(l.id),lname=wmCleanText(l.name,WM_LIMIT.name,true);
var ta=l.a.t,tb=l.b.t,ia=wmCleanId(l.a.id),ib=wmCleanId(l.b.id);
if(!lid||!lname||(ta!=='zone'&&ta!=='pin')||(tb!=='zone'&&tb!=='pin'))continue;
if(!seen[ta+':'+ia]||!seen[tb+':'+ib]||(ta===tb&&ia===ib))continue; // 端点必须存在且不能连自己
out.links.push({id:lid,a:{t:ta,id:ia},b:{t:tb,id:ib},name:lname,content:wmCleanText(l.content,WM_LIMIT.content,false),color:wmCleanColor(l.color),inPrompt:l.inPrompt!==false,hidden:l.hidden===true,hideName:l.hideName===true});
}
return out;
}
// 按绑定名保存的地图表：{绑定名: 地图}，只保留有图片的项
function wmSanitizeBindings(raw){
var out={};
if(!raw||typeof raw!=='object'||Array.isArray(raw))return out;
Object.keys(raw).forEach(function(key){
if(key==='__proto__')return;
var m=wmSanitizeMap(raw[key]);
if(m.img)out[key]=m;
});
return out;
}
// 克隆：图片字符串不可变，直接引用；其余部分深拷贝，编辑器改的是副本，不会污染已保存的数据
function wmCloneMap(m){
var src=(m&&typeof m==='object')?m:wmEmptyMap();
return {
img:typeof src.img==='string'?src.img:'',
enabled:src.enabled===true,
autoSpatial:src.autoSpatial!==false,
offRel:Array.isArray(src.offRel)?src.offRel.slice():[],
zones:JSON.parse(JSON.stringify(Array.isArray(src.zones)?src.zones:[])),
pins:JSON.parse(JSON.stringify(Array.isArray(src.pins)?src.pins:[])),
links:JSON.parse(JSON.stringify(Array.isArray(src.links)?src.links:[]))
};
}
function wmHasContent(m){return !!(m&&(m.zones.length||m.pins.length||m.links.length));}
function wmMapsEqual(a,b){
if(!a||!b)return a===b;
return a.img===b.img&&a.enabled===b.enabled&&a.autoSpatial===b.autoSpatial&&JSON.stringify([a.offRel,a.zones,a.pins,a.links])===JSON.stringify([b.offRel,b.zones,b.pins,b.links]);
}
// 读取某个绑定名下的地图；没有则返回空地图（与局部世界观文字「没有就是空」的规则一致）
function wmBoundMap(name){
if(!name||!Object.prototype.hasOwnProperty.call(localWorldMapBindings,name))return wmEmptyMap();
return wmSanitizeMap(localWorldMapBindings[name]);
}
// 把当前地图写入存储；已绑定角色预设时同步写进该绑定的地图槽位（与局部世界观文字使用同一个绑定键）
function wmPersistMap(){
sv('bj_worldMap',worldMap);
if(currentWorldBinding){
if(worldMap.img)localWorldMapBindings[currentWorldBinding]=wmCloneMap(worldMap);
else delete localWorldMapBindings[currentWorldBinding];
sv('bj_localWorldMapBindings',localWorldMapBindings);
}
}
// ---- 自动空间关系：几何计算（只给下面的关系计算用；坐标一律换算成 1280×720 的地图像素）----
function wmGeoPx(pts){return pts.map(function(p){return [p[0]*WM_W,p[1]*WM_H];});}
// 点是否在多边形内（奇偶规则）
function wmGeoPointInPoly(x,y,pts){
var inside=false;
for(var i=0,j=pts.length-1;i<pts.length;j=i++){
var xi=pts[i][0],yi=pts[i][1],xj=pts[j][0],yj=pts[j][1];
if(((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi))inside=!inside;
}
return inside;
}
function wmGeoDistToSeg(px,py,ax,ay,bx,by){
var dx=bx-ax,dy=by-ay,len2=dx*dx+dy*dy;
var t=len2>0?Math.min(1,Math.max(0,((px-ax)*dx+(py-ay)*dy)/len2)):0;
return Math.hypot(px-(ax+t*dx),py-(ay+t*dy));
}
function wmGeoCross(ax,ay,bx,by,cx,cy){return (bx-ax)*(cy-ay)-(by-ay)*(cx-ax);}
// 两条线段的最短距离；真正相交时为 0
function wmGeoSegDist(a,b,c,d){
var o1=wmGeoCross(a[0],a[1],b[0],b[1],c[0],c[1]),o2=wmGeoCross(a[0],a[1],b[0],b[1],d[0],d[1]);
var o3=wmGeoCross(c[0],c[1],d[0],d[1],a[0],a[1]),o4=wmGeoCross(c[0],c[1],d[0],d[1],b[0],b[1]);
if(o1*o2<0&&o3*o4<0)return 0;
return Math.min(
wmGeoDistToSeg(a[0],a[1],c[0],c[1],d[0],d[1]),wmGeoDistToSeg(b[0],b[1],c[0],c[1],d[0],d[1]),
wmGeoDistToSeg(c[0],c[1],a[0],a[1],b[0],b[1]),wmGeoDistToSeg(d[0],d[1],a[0],a[1],b[0],b[1]));
}
function wmGeoBoundaryDist(x,y,pts){
var best=Infinity;
for(var i=0;i<pts.length;i++){
var p=pts[i],q=pts[(i+1)%pts.length];
best=Math.min(best,wmGeoDistToSeg(x,y,p[0],p[1],q[0],q[1]));
}
return best;
}
// 两个多边形边与边之间的最短距离
function wmGeoPolyDist(A,B){
var best=Infinity;
for(var i=0;i<A.length&&best>0;i++){
var a1=A[i],a2=A[(i+1)%A.length];
for(var j=0;j<B.length&&best>0;j++){
best=Math.min(best,wmGeoSegDist(a1,a2,B[j],B[(j+1)%B.length]));
}
}
return best;
}
function wmGeoBBox(pts){
var b=[Infinity,Infinity,-Infinity,-Infinity];
pts.forEach(function(p){b[0]=Math.min(b[0],p[0]);b[1]=Math.min(b[1],p[1]);b[2]=Math.max(b[2],p[0]);b[3]=Math.max(b[3],p[1]);});
return b;
}
// 面积重心；面积退化（点共线）时退回顶点平均值
function wmGeoCentroid(pts){
var n=pts.length,a=0,cx=0,cy=0,i;
for(i=0;i<n;i++){
var p=pts[i],q=pts[(i+1)%n],f=p[0]*q[1]-q[0]*p[1];
a+=f;cx+=(p[0]+q[0])*f;cy+=(p[1]+q[1])*f;
}
a*=0.5;
if(Math.abs(a)>1e-6)return {x:cx/(6*a),y:cy/(6*a),area:Math.abs(a)};
var sx=0,sy=0;
pts.forEach(function(p){sx+=p[0];sy+=p[1];});
return {x:n?sx/n:0,y:n?sy/n:0,area:0};
}
// src 的顶点、边中点、重心里，只要有一个深入 dst 内部（离 dst 边界超过 tol），就认为两个分区重叠。
// 这是采样判断，不是精确的多边形裁剪：两个分区只有极小面积相交时可能漏判
function wmGeoSamplesInside(src,dst,tol){
var samples=[],n=src.length,i;
for(i=0;i<n;i++){
var p=src[i],q=src[(i+1)%n];
samples.push(p);samples.push([(p[0]+q[0])/2,(p[1]+q[1])/2]);
}
var c=wmGeoCentroid(src);
if(wmGeoPointInPoly(c.x,c.y,src))samples.push([c.x,c.y]); // 凹形的重心可能落在自己外面，那样的重心不能代表自己
for(i=0;i<samples.length;i++){
var s=samples[i];
if(wmGeoPointInPoly(s[0],s[1],dst)&&wmGeoBoundaryDist(s[0],s[1],dst)>tol)return true;
}
return false;
}
function wmGeoOverlap(A,B,tol){return wmGeoSamplesInside(A,B,tol)||wmGeoSamplesInside(B,A,tol);}
// 以 from 为原点，to 在哪个方位（8 方位，图片上方为正北）
function wmGeoDirection(fromX,fromY,toX,toY){
var ang=Math.atan2(-(toY-fromY),toX-fromX)*180/Math.PI;
return WM_DIR_NAMES[((Math.round(ang/45)%8)+8)%8];
}
// 分区之间的关系只取决于分区的名称和形状，而拖动地点或顶点时会反复重算，所以按分区签名缓存
var _wmZoneGeoCache={sig:'',zs:[],pairs:[]};
function wmZoneGeo(m){
var sig=JSON.stringify(m.zones.map(function(z){return [z.id,z.name,z.pts];}));
if(_wmZoneGeoCache.sig===sig)return _wmZoneGeoCache;
var zs=m.zones.map(function(z){
var px=wmGeoPx(z.pts),c=wmGeoCentroid(px);
return {z:z,px:px,c:c,box:wmGeoBBox(px),r:Math.sqrt(c.area/Math.PI)};
});
var pairs=[];
for(var i=0;i<zs.length;i++){
for(var j=i+1;j<zs.length;j++){
var A=zs[i],B=zs[j];
if(A.box[2]+WM_ADJ_TOL<B.box[0]||B.box[2]+WM_ADJ_TOL<A.box[0]||A.box[3]+WM_ADJ_TOL<B.box[1]||B.box[3]+WM_ADJ_TOL<A.box[1])continue; // 外框都碰不到，不可能相邻
var ids=A.z.id<B.z.id?A.z.id+':'+B.z.id:B.z.id+':'+A.z.id;
if(wmGeoOverlap(A.px,B.px,WM_ADJ_TOL)){
pairs.push({key:'ovl:'+ids,a:{t:'zone',id:A.z.id},b:{t:'zone',id:B.z.id},text:A.z.name+'与'+B.z.name+'的范围有重叠'});
}else if(wmGeoPolyDist(A.px,B.px)<=WM_ADJ_TOL){
pairs.push({key:'adj:'+ids,a:{t:'zone',id:A.z.id},b:{t:'zone',id:B.z.id},
text:A.z.name+'与'+B.z.name+'相邻（'+A.z.name+'在'+B.z.name+'的'+wmGeoDirection(B.c.x,B.c.y,A.c.x,A.c.y)+'方）'});
}
}
}
_wmZoneGeoCache={sig:sig,zs:zs,pairs:pairs};
return _wmZoneGeoCache;
}
// 由几何自动算出的关系：地点在哪个分区内、离哪个分区很近，以及分区之间的相邻/重叠。
// 每条有稳定的 key（形如 in:地点id:分区id），用于「勾选写入」
function wmComputeSpatialFacts(m){
var geo=wmZoneGeo(m),facts=[];
m.pins.forEach(function(p){
var x=p.x*WM_W,y=p.y*WM_H,inside=false,nearest=null;
geo.zs.forEach(function(zi){
if(wmGeoPointInPoly(x,y,zi.px)){
inside=true;
var d=Math.hypot(x-zi.c.x,y-zi.c.y);
var where=d<=zi.r*WM_CENTER_RATIO?'中部':wmGeoDirection(zi.c.x,zi.c.y,x,y)+'部';
facts.push({key:'in:'+p.id+':'+zi.z.id,a:{t:'pin',id:p.id},b:{t:'zone',id:zi.z.id},text:p.name+'位于'+zi.z.name+'分区内（'+where+'）'});
}else{
var dist=wmGeoBoundaryDist(x,y,zi.px);
if(!nearest||dist<nearest.dist)nearest={zi:zi,dist:dist};
}
});
if(!inside&&nearest&&nearest.dist<=WM_NEAR_TOL){
var nz=nearest.zi;
facts.push({key:'near:'+p.id+':'+nz.z.id,a:{t:'pin',id:p.id},b:{t:'zone',id:nz.z.id},
text:p.name+'靠近'+nz.z.name+'分区（在'+nz.z.name+'的'+wmGeoDirection(nz.c.x,nz.c.y,x,y)+'方）'});
}
});
return facts.concat(geo.pairs);
}
// 保存前清掉已经不存在的自动关系的「不写入」记录，避免越积越多
function wmPruneOffRel(m){
var live={};
wmComputeSpatialFacts(m).forEach(function(f){live[f.key]=true;});
return (Array.isArray(m.offRel)?m.offRel:[]).filter(function(k){return live[k]===true;});
}
// 哪些分区、地点、关联线现在是「隐藏」的：自己被隐藏，或关联线的任意一端被隐藏。隐藏的不画、不写入提示词。键形如 zone:id
function wmHiddenMap(m){
var hid={};
m.zones.forEach(function(z){if(z.hidden===true)hid['zone:'+z.id]=true;});
m.pins.forEach(function(p){if(p.hidden===true)hid['pin:'+p.id]=true;});
m.links.forEach(function(l){
if(l.hidden===true||hid[l.a.t+':'+l.a.id]===true||hid[l.b.t+':'+l.b.id]===true)hid['link:'+l.id]=true;
});
return hid;
}
// 提示词方案：把地图拆成「分区 / 地点 / 关系 / 空间关系」四节，每条带
//   sel（用户自己的勾选）、on（最终是否写入：还要看自动空间关系总开关、以及关系涉及的分区/地点有没有被取消写入）、
//   blocked（被什么挡住：'hidden' 已隐藏，'auto' 总开关关闭，'entity' 涉及的分区/地点没写入）、dropped（超出字数上限被舍去）。
// 超限规则：按顺序累计，遇到第一条放不下的就停止，后面所有写入的条目都舍去，保证预览和真正写入的内容完全一致。
// 开启「去掉所有设定字数限制」(noDescLimit) 时没有上限（limit 为 null）。
// 编辑器预览也用它（传入编辑中的副本），所以这里不检查 m.enabled
function wmBuildPromptPlan(m){
var limit=(typeof noDescLimit!=='undefined'&&noDescLimit===true)?null:WM_LIMIT.prompt;
var oneLine=function(s){return s?'：'+s.replace(/\s*\n\s*/g,' '):'';};
var charLen=function(s){return Array.from(s).length;};
var names={},onMap={},hid=wmHiddenMap(m);
var sections=[
{kind:'zone',title:'分区：',items:[]},
{kind:'pin',title:'地点：',items:[]},
{kind:'link',title:'关系：',items:[]},
{kind:'rel',title:'空间关系：',items:[]}
];
var add=function(secIdx,kind,id,text,sel,blocked){
sections[secIdx].items.push({key:kind+':'+id,kind:kind,id:id,text:text,len:charLen(text),sel:sel,on:sel&&!blocked,blocked:blocked,dropped:false});
};
m.zones.forEach(function(z){
names['zone:'+z.id]=z.name;onMap['zone:'+z.id]=z.inPrompt!==false;
add(0,'zone',z.id,'· '+z.name+oneLine(z.content),z.inPrompt!==false,hid['zone:'+z.id]?'hidden':'');
});
m.pins.forEach(function(p){
names['pin:'+p.id]=p.name;onMap['pin:'+p.id]=p.inPrompt!==false;
var typeLabel=wmPinTypeLabel(p.type);
add(1,'pin',p.id,'· '+p.name+(typeLabel?'（'+typeLabel+'）':'')+oneLine(p.content),p.inPrompt!==false,hid['pin:'+p.id]?'hidden':'');
});
m.links.forEach(function(l){
add(2,'link',l.id,'· '+(names[l.a.t+':'+l.a.id]||'?')+' ↔ '+(names[l.b.t+':'+l.b.id]||'?')+'（'+l.name+'）'+oneLine(l.content),l.inPrompt!==false,hid['link:'+l.id]?'hidden':'');
});
var off={};
(Array.isArray(m.offRel)?m.offRel:[]).forEach(function(k){off[k]=true;});
wmComputeSpatialFacts(m).forEach(function(f){
var blocked='';
if(m.autoSpatial===false)blocked='auto';
else if(hid[f.a.t+':'+f.a.id]===true||hid[f.b.t+':'+f.b.id]===true)blocked='hidden';
else if(onMap[f.a.t+':'+f.a.id]===false||onMap[f.b.t+':'+f.b.id]===false)blocked='entity';
add(3,'rel',f.key,'· '+f.text,!off[f.key],blocked);
});
var lines=[],used=0,overflow=false,dropped=0;
sections.forEach(function(sec){
var started=false;
sec.items.forEach(function(it){
if(!it.on)return;
if(overflow){it.dropped=true;dropped++;return;}
var pieces=[];
if(!lines.length)pieces.push('【世界地图设定】');
if(!started)pieces.push(sec.title);
pieces.push(it.text);
var need=0; // 每一行前面都有一个换行，只有整段文字的第一行没有
pieces.forEach(function(s){need+=charLen(s)+1;});
if(!lines.length)need-=1;
if(limit!==null&&used+need>limit){overflow=true;it.dropped=true;dropped++;return;}
pieces.forEach(function(s){lines.push(s);});
started=true;
used+=need;
});
});
return {text:lines.join('\n'),used:used,limit:limit,overflow:overflow,dropped:dropped,sections:sections};
}
// 启用地图后追加到世界观设定后面的文字（只有文字，不含图片）；未启用或没有任何内容时返回空串
function wmPromptText(){
try{
var m=worldMap;
if(!m||m.enabled!==true||!m.img)return '';
return wmBuildPromptPlan(m).text;
}catch(e){
logError('wmPromptText',e);
return '';
}
}
// ==================== STATE ====================
let curType='long';
let wsDisplayCount=30; // 作坊当前显示条数
let selTags=[];
let ws=ld(K.ws,[]);// workshop articles
let cols=ld(K.cols,{books:[],shorts:[]});
if(!cols.folders)cols.folders=[];// 收藏页文件夹列表：[{id,name,createdAt}]；books/shorts条目用folderId记录所属文件夹（''=未分类），书架+短篇共用同一套文件夹
let tags=ld(K.tags,['#日常','#bg','#穿越','#奇幻','#校园','#甜文','#虐文','#悬疑','#古风','#现代']);
let apiP=ld(K.apiP,[]);
let charP=ld(K.charP,[]);
let worldP=ld(K.worldP,[]);
let styleP=ld('bj_styleP',[]);
let ruleP=ld('bj_ruleP',[]);
let fontP=ld('bj_fontP',[]); // 字体预设
let sysPromptP=ld('bj_sysPromptP',[]); // 自定义系统提示词预设
let sysPromptEntries=ld('bj_sysPromptEntries',null); // 系统提示词条目顺序+内置提示词改写+自定义指令，null表示尚未初始化/需要从旧版数据迁移，见 ensureSysPromptEntries()
let curRule=ld('bj_curRule','');
// 全局设定（不随角色切换）
let globalWorld=ld('bj_globalWorld','');
let globalRule=ld('bj_globalRule','');
let globalBanWords=ld('bj_globalBanWords','');
let customSysPromptPosition = ld('bj_customSysPromptPosition', 'tail'); 
let rdBgImg = ld('bj_rdBgImg', '');
let homeBgImg = ld('bj_homeBg', '');
let localWorldBindings=ld('bj_localWorldBindings',{});
// 世界地图：图片是大体积base64，只存在IndexedDB；这里启动时缓存可能还没加载完，script-5 初始化阶段会重新读取并校验
let worldMap=wmSanitizeMap(ld('bj_worldMap',null));
let localWorldMapBindings=wmSanitizeBindings(ld('bj_localWorldMapBindings',{}));
let localRuleBindings=ld('bj_localRuleBindings',{});
let localBanWordsBindings=ld('bj_localBanWordsBindings',{});
let localStyleBindings=ld('bj_localStyleBindings',{});

// 当前使用的角色预设名（用于绑定局部设定）
let currentWorldBinding=ld('bj_currentWorldBinding',''); let currentRuleBinding=ld('bj_currentRuleBinding',''); let currentBanBinding=ld('bj_currentBanBinding',''); let currentStyleBinding=ld('bj_currentStyleBinding','');
let currentCharPresetName=ld('bj_currentCharPresetName','');
let currentWorldPresetName=ld('bj_currentWorldPresetName','');
let currentStylePresetName=ld('bj_currentStylePresetName','');
let currentRulePresetName=ld('bj_currentRulePresetName','');
let currentBanPresetName=ld('bj_currentBanPresetName','');
var _silentPresetApply=false; // 模板应用期间屏蔽中间 Toast
let banWords=ld('bj_banWords','');
let banWordsP=ld('bj_banWordsP',[]);
let ap=ld(K.ap,{theme:'default',fontUrl:'',rdBg:'',rdFontSize:15,rdLineHeight:2,curStyle:'',simpleUI:false});
let customSysPrompt=ld('bj_customSysPrompt','');
if(typeof ap.simpleUI==='undefined') ap.simpleUI=false;
let characters=ld(K.curChars,[{name:'',desc:''},{name:'',desc:''}]);
let customTraits=ld('bj_customTraits',[]);
let curRd=null;// current reading article
let curCh=0;// current chapter index
let isGen=false;
let _apiCooldown=false;
let _apiCooldownMs=2000;
let _btnClickLock=false;
function withClickLock(fn){
  if(_btnClickLock)return;
  _btnClickLock=true;
  setTimeout(function(){_btnClickLock=false;},800);
  fn();
}
function checkApiCooldown(){
  if(_apiCooldown){showToast('操作太频繁，请稍后再试');return false;}
  _apiCooldown=true;
  setTimeout(function(){_apiCooldown=false;},_apiCooldownMs);
  return true;
}
AppState.isGen=false;
function setIsGen(v){isGen=v;AppState.isGen=v;}
let isFS=false;
let abortCtrl=null;// for aborting stream
let crWorks=ld('bj_crWorks',[]);// 创作作品列表
let crFolders=ld('bj_crFolders',[]);// 创作工具箱文件夹列表：[{id,name,createdAt}]；每个crWorks作品用work.folderId记录所属文件夹（''=未分类）
let crTab='draft';// 当前创作页tab
let crSearchKw='';// 创作工具箱顶部搜索框的关键词，非空时 renderCrList() 会按名称/创建日期过滤当前 tab
let _streamBreakpoint = {}; // {articleId, partialText, chNum, timestamp}
// ==================== 后台保活 & 生成队列 ====================
let _bgGenerating = false; // 当前是否有生成任务在运行
let _bgTaskInfo = null; // {type:'stream'|'nonstream', startTime, articleId, title, lastSaveTime, totalChunks}
let _genQueue = []; // 生成队列 [{fn:async function, label:'描述'}]
let _genQueueRunning = false;
let _bgWakeLock = null; // WakeLock API（如果浏览器支持）

// 请求WakeLock防止手机熄屏中断
async function requestWakeLock(){
  if('wakeLock' in navigator){
    try{
      _bgWakeLock = await navigator.wakeLock.request('screen');
      _bgWakeLock.addEventListener('release', ()=>{ _bgWakeLock=null; });
    }catch(e){ console.warn('WakeLock不可用:',e); }
  }
}

function releaseWakeLock(){
  if(_bgWakeLock){
    try{ _bgWakeLock.release(); }catch(e){}
    _bgWakeLock = null;
  }
}

// 保存流式断点（增强版：带完整请求参数）
function saveStreamBreakpoint(articleId, partialText, chNum, requestParams){
  _streamBreakpoint = {
    articleId: articleId,
    partialText: partialText,
    chNum: chNum,
    timestamp: Date.now(),
    version: 2, // 断点版本号
    requestParams: requestParams || null
  };
  sv('bj_streamBreakpoint', _streamBreakpoint);
}

// 清除断点
function clearStreamBreakpoint(){
  _streamBreakpoint = {};
  try{ localStorage.removeItem('bj_streamBreakpoint'); }catch(e){}
  dbSet('bj_streamBreakpoint', {}).catch(()=>{});
}

// 生成队列：添加任务
function enqueueGenTask(fn, label){
  _genQueue.push({fn:fn, label:label||'生成任务'});
  if(!_genQueueRunning) runGenQueue();
}

// 生成队列：运行
async function runGenQueue(){
  if(_genQueueRunning) return;
  _genQueueRunning = true;
  while(_genQueue.length > 0){
    var task = _genQueue.shift();
    try{
      showToast('⏳ 开始：' + task.label, 2000);
      await task.fn();
    }catch(e){
      console.error('队列任务失败:', e);
      showToast('任务失败：' + task.label, 3000);
    }
    // 任务间隔500ms，避免限流
    if(_genQueue.length > 0) await new Promise(r=>setTimeout(r,500));
  }
  _genQueueRunning = false;
}

// visibilitychange 监听：切后台时提示
document.addEventListener('visibilitychange', function(){
  if(document.visibilityState === 'hidden'){
    // 切到后台
    if(_bgGenerating || isGen){
      // 正在生成中，尝试保持连接
      console.warn('[后台保活] 检测到切后台，生成任务仍在运行');
    }
    // 自动保存所有数据
    saveCurSettings();
    autoSaveAll();
    try{if(typeof _flushSv==='function'){if(_svTimer){clearTimeout(_svTimer);_svTimer=null;}_flushSv();}}catch(e){}
  } else {
    // 从后台回来
    if(_bgGenerating || isGen){
      showToast('生成任务仍在运行中...', 2000);
    }
    // 检查网络状态
    updateOnlineStatus();
  }
});
let curEd=null;// 当前编辑的作品
let curEdCh=0;// 当前编辑的章节
let edAutoSaveTimer=null;
// 自动保存草稿定时器（新增）
let autoSaveInterval = null;
let resPacks=ld('bj_resPacks',[]);// 已导入的资源包

// ==================== 内置官方资源包 ====================
var builtinPacks=[];// 运行时加载，不存本地
var _builtinPacksLoading=false;
var BUILTIN_PACK_FILES=[
  'json/Doctor-and-patient.json',
  'json/Husbandwife.json',
  'json/stardust.json',
  'json/Rulebook-sharing2.json',
  'json/Novelistic-style.json',
  'json/RCHP.json',
  'json/Normal-views-on-love.json'
];
function loadBuiltinPacks(){
  if(_builtinPacksLoading)return;
  _builtinPacksLoading=true;
  var _plazaTimer=null;
  if(builtinPacks.length===0){
    _plazaTimer=setTimeout(function(){
      if(!_builtinPacksLoading)return;
      var list=document.getElementById('resList');
      if(list){
        list.innerHTML='<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:48px 0;gap:14px"><img src="./photos/xinx2.png" style="width:96px;height:96px;object-fit:contain;filter:drop-shadow(0 4px 16px rgba(108,92,231,.4))" alt=""><span style="font-size:16px;color:var(--text2)">正在努力加载…</span></div>';
      }
    },1000);
  }
  var promises=BUILTIN_PACK_FILES.map(function(url){
    return fetch(url+'?_='+Date.now())
      .then(function(r){if(!r.ok)throw new Error(r.status);return r.json();})
      .then(function(data){
        data._builtin=true;
        data._builtinUrl=url;
        return data;
      })
      .catch(function(e){console.warn('内置资源加载失败:',url,e);return null;});
  });
  Promise.all(promises).then(function(results){
    if(_plazaTimer)clearTimeout(_plazaTimer);
    builtinPacks=results.filter(function(d){return d&&d._app==='syn_resource';});
    _builtinPacksLoading=false;
    if(document.getElementById('resList'))renderResList();
  }).catch(function(){
    if(_plazaTimer)clearTimeout(_plazaTimer);
    _builtinPacksLoading=false;
    if(document.getElementById('resList'))renderResList();
  });
}
// 合并内置+用户资源包（内置在前）
function _getAllPacks(){
  // 内置包按 _releaseTag 降序排列，最新的在最前面
  var sorted=builtinPacks.slice().sort(function(a,b){
    var ta=a._releaseTag||'';
    var tb=b._releaseTag||'';
    if(tb>ta)return 1;
    if(tb<ta)return -1;
    return 0;
  });
  return sorted.concat(resPacks);
}
// 返回所有内置包中最新的 _releaseTag（字符串比较）
function _getLatestReleaseTag(){
  var max='';
  builtinPacks.forEach(function(p){
    if(p._releaseTag && p._releaseTag > max) max=p._releaseTag;
  });
  return max;
}
// 判断某个包是否属于最新一批（_releaseTag 等于当前最大值）
function _isPackNew(pack){
  if(!pack._builtin || !pack._releaseTag) return false;
  var latest=_getLatestReleaseTag();
  if(!latest) return false;
  var diffDays=(new Date(latest)-new Date(pack._releaseTag))/86400000;
  return diffDays>=0 && diffDays<=7;
}
// 根据 _badge 字段返回标签HTML
function _getResBadgeHtml(badge){
  if(!badge) return '';
  if(badge==='official') return '<span style="font-size:9px;font-weight:700;padding:2px 6px;border-radius:6px;background:rgba(108,92,231,.18);color:var(--accent2);border:1px solid rgba(108,92,231,.35);margin-left:5px;vertical-align:middle">官方</span>';
  if(badge==='recommend') return '<span style="font-size:9px;font-weight:700;padding:2px 6px;border-radius:6px;background:rgba(39,174,96,.15);color:#58d68d;border:1px solid rgba(39,174,96,.35);margin-left:5px;vertical-align:middle">推荐</span>';
  return '';
}
// ==================== END 内置官方资源包 ====================
let resTab='all';
let useStream=ld('bj_stream',true);
let noDescLimit=ld('bj_noDescLimit',false);
let devMode = ld('bj_devMode', false);
const PAGE_SIZE = 24;
let colBookPage = 1;
let colShortPage = 1;
let resPage = 1;
let userCard=ld('bj_userCard',{name:'',bio:'',avatar:''});
let lockSettings = ld('bj_lockSettings', { enabled:false, passHash:'', q:'', aHash:'' });
// [FIX-4] 安全：用闭包封装 _unlocked，防止攻击者在控制台直接赋值绕过锁屏。
// 通过 Object.defineProperty 劫持赋值，内部用私有变量存储真实值；
// 注意：这是前端防护，有经验的开发者仍可通过 getOwnPropertyDescriptor 绕过，
// 但可有效防止随手输入 `_unlocked=true` 的低门槛攻击。
const _lockState = (function(){
  let _val = false;
  return { get: function(){ return _val; }, set: function(v){ _val = !!v; } };
})();
Object.defineProperty(window, '_unlocked', {
  get: function(){ return _lockState.get(); },
  set: function(v){ _lockState.set(v); },
  configurable: false,
  enumerable: false,
});
let articleContexts = ld('bj_articleContexts', {}); // 存储每篇文章的上下文设置
let xjAbortCtrl = null; // 星笺聊天中止控制
let ringAudio = null; // 铃声播放器
// ==================== PAGE LOADING SYSTEM ====================
var _plShowing = false;
var _plHideTimer = null;

function _pl_doShow(){
  try{
    var isSecret=(typeof xjSkin!=='undefined'&&xjSkin==='secret');
    var icon=document.getElementById('plIcon');
    var label=document.getElementById('plLabel');
    var ov=document.getElementById('pageLoadingOv');
    if(!ov)return;
    if(icon){
      icon.src=isSecret?'./photos/Humanoid.png':'./photos/xinx2.png';
      icon.className=isSecret?'pl-icon secret-icon':'pl-icon';
    }
    if(label){
      label.className=isSecret?'pl-label secret':'pl-label';
    }
    _plShowing=true;
    ov.classList.add('show');
    // 最长显示 3 秒兜底
    clearTimeout(window._plMaxTimer);
    window._plMaxTimer=setTimeout(function(){
      ov.classList.remove('show');
      _plShowing=false;
    },3000);
  }catch(e){}
}

function hidePageLoading(){
  clearTimeout(window._plMaxTimer);
  if(!_plShowing)return;
  var ov=document.getElementById('pageLoadingOv');
  if(!ov){_plShowing=false;return;}
  // 至少显示 280ms 防止一闪而过
  clearTimeout(_plHideTimer);
  _plHideTimer=setTimeout(function(){
    ov.classList.remove('show');
    _plShowing=false;
  },280);
}

// 只在数据量判断需要时才调用这个
function showPageLoading(){
  _pl_doShow();
}

// 判断是否需要加载动画（根据数据量）
function _needsLoadingAnim(type){
  try{
    if(type==='collection'){
      return (cols.books.length+cols.shorts.length)>30;
    }
    if(type==='create'){
      return crWorks.length>20;
    }
    if(type==='resource'){
      var total=0;
      resPacks.forEach(function(p){total+=(p.items||[]).length;});
      return total>30;
    }
    if(type==='settings'){
      return (charP.length+worldP.length+styleP.length+ruleP.length)>50;
    }
    if(type==='rp'){
      var ch=typeof getRpCurrentChar==='function'?getRpCurrentChar():null;
      return ch&&(ch.messages||[]).length>60;
    }
    if(type==='reading'){
      return typeof curRd!=='undefined'&&curRd&&(
        (curRd.chapters&&curRd.chapters.length>10)||
        countWords(curRd.content||'')>8000||
        (curRd.chapters&&curRd.chapters.reduce(function(s,c){return s+countWords(c||'');},0)>8000)
      );
    }
    if(type==='editor'){
      return typeof curEd!=='undefined'&&curEd&&(
        (curEd.chapters&&curEd.chapters.length>15)||
        countWords(curEd.content||'')>5000
      );
    }
  }catch(e){}
  return false;
}
// ==================== TOAST ====================
let toastTimer=null;
let _lastToastMsg='';
function showToast(msg,dur=2000){
try{if(navigator.vibrate)navigator.vibrate(10);}catch(e){}
const t=document.getElementById('toast');
// 相同内容连续触发时跳过，避免叠加闪烁
if(msg===_lastToastMsg&&t.classList.contains('show'))return;
_lastToastMsg=msg;
t.textContent=msg;t.classList.add('show');
if(toastTimer)clearTimeout(toastTimer);
toastTimer=setTimeout(()=>{t.classList.remove('show');_lastToastMsg='';},dur);
t.onclick=function(){t.classList.remove('show');if(toastTimer)clearTimeout(toastTimer);};
// 点击页面任意地方也能关闭toast
var _toastDismiss=function(){
t.classList.remove('show');
if(toastTimer)clearTimeout(toastTimer);
document.removeEventListener('touchstart',_toastDismiss);
document.removeEventListener('click',_toastDismiss);
};
setTimeout(function(){
document.addEventListener('touchstart',_toastDismiss,{once:true,passive:true});
document.addEventListener('click',_toastDismiss,{once:true});
},300);
}

// ==================== CONFIRM DIALOG ====================
function showDlg(title,msg,onOk,danger=false,asHtml=false){
  document.getElementById('dlgTitle').textContent=title;
  const p=document.getElementById('dlgMsg');
  if(asHtml){ p.innerHTML=msg; } else { p.textContent=msg; }

  const btn=document.getElementById('dlgOkBtn');
  btn.style.display='';
  btn.className=danger?'dlg-danger':'dlg-ok';
  btn.textContent='确认';

  btn.onclick=()=>{ 
    closeDlg(); 
    try{ if(typeof onOk==='function') onOk(); }catch(e){logError('op',e)} 
  };

  document.getElementById('dlgOv').classList.add('show');
  navPush('dlgOv');
}
function closeDlg(){
  navPop('dlgOv');
  document.getElementById('dlgOkBtn').style.display='';
  // 恢复取消按钮显示、文案和点击行为，防止个别调用（如401/404报错弹窗、进度续接确认弹窗）
  // 临时自定义后忘记还原，把自定义的onclick"泄漏"到下一个完全无关的弹窗上
  const cancelBtn=document.querySelector('#dlgOv .dlg-cancel');
  if(cancelBtn){
    cancelBtn.style.display='';
    cancelBtn.textContent='取消';
    cancelBtn.onclick=closeDlg;
  }
  document.getElementById('dlgOv').classList.remove('show');

  // 关闭时恢复 dlgMsg 的滚动样式（避免影响其他弹窗）
  const p=document.getElementById('dlgMsg');
  if(p){
    p.style.maxHeight='';
    p.style.overflowY='';
    p.style.paddingRight='';
    p.style.webkitOverflowScrolling='';
  }
}

// ==================== INPUT DIALOG ====================
function showInp(title,ph,onOk){
document.getElementById('inpTitle').textContent=title;
const f=document.getElementById('inpField');
f.placeholder=ph;f.value='';
document.getElementById('inpOkBtn').onclick=()=>{
const v=f.value.trim();if(v){closeInp();onOk(v);}else{showToast('请输入内容');}
};
document.getElementById('inpOv').classList.add('show');
navPush('inpOv');
setTimeout(()=>f.focus(),100);
}
function closeInp(){navPop('inpOv');document.getElementById('inpOv').classList.remove('show');}
// ==================== INPUT LIMIT HELPERS 输入限制工具 ====================
function refreshAllCounters(){
  try{
    const gr=document.getElementById('globalRuleDesc'); if(gr) limitTextarea(gr,2000,'grCount');
    const lr=document.getElementById('ruleDesc'); if(lr) limitTextarea(lr,2000,'lrCount');

    const st=document.getElementById('styleDesc'); if(st) limitTextarea(st,600,'stCount');

    const gw=document.getElementById('globalWorldDesc'); if(gw) limitTextarea(gw,3000,'gwCount');
    const lw=document.getElementById('worldDesc'); if(lw) limitTextarea(lw,3000,'lwCount');

    const gb=document.getElementById('globalBanWordsInput'); if(gb) limitLines(gb,30,'gbwCount');
    const lb=document.getElementById('banWordsInput'); if(lb) limitLines(lb,30,'lbwCount');

    if(Array.isArray(characters)){
      characters.forEach((_,idx)=>{ try{ updateCharDescCounter(idx); }catch(e){logError('op',e)} });
    }
  }catch(e){logError('op',e)}
}
function limitTextarea(el, max, counterId){
  if(!el) return;
  let v = (el.value || '');
  if(!noDescLimit && v.length > max){
    el.value = v.slice(0, max);
    try{if(navigator.vibrate) navigator.vibrate(10);}catch(e){}
  }
  if(counterId){
    const c = document.getElementById(counterId);
    if(c){
      if(noDescLimit){
        c.textContent = el.value.length + '字（无限制）';
        c.style.color = 'var(--text2)';
      } else {
        c.textContent = (el.value.length) + '/' + max;
        c.style.color = (el.value.length >= max) ? 'var(--danger)' : 'var(--text2)';
      }
    }
  }
}

function refreshAllDescCounters(){
  // 刷新所有人设相关计数器（开关字数限制后立即更新显示）
  try{
    var gw=document.getElementById('globalWorldDesc');
    if(gw) limitTextarea(gw,3000,'gwCount');
    var lw=document.getElementById('worldDesc');
    if(lw) limitTextarea(lw,3000,'lwCount');
    var st=document.getElementById('styleDesc');
    if(st) limitTextarea(st,600,'stCount');
    var gr=document.getElementById('globalRuleDesc');
    if(gr) limitTextarea(gr,2000,'grCount');
    var lr=document.getElementById('ruleDesc');
    if(lr) limitTextarea(lr,2000,'lrCount');
    var npcD=document.getElementById('npcDesc');
    if(npcD) limitTextarea(npcD,500,'npcDescCount');
    var gb=document.getElementById('globalBanWordsInput');
    if(gb) limitLines(gb,30,'gbwCount');
    var lb=document.getElementById('banWordsInput');
    if(lb) limitLines(lb,30,'lbwCount');
    if(characters) characters.forEach(function(_,i){ updateCharDescCounter(i); });
  }catch(e){}
}
function applyDescLimitAttr(){
  var pairs=[['globalWorldDesc',3000],['worldDesc',3000],['styleDesc',600],['globalRuleDesc',2000],['ruleDesc',2000],['npcDesc',500]];
  pairs.forEach(function(p){var el=document.getElementById(p[0]);if(!el)return;if(noDescLimit){el.removeAttribute('maxlength');}else{el.setAttribute('maxlength',p[1]);}});
}
function limitLines(el, maxLines, counterId){
  if(!el) return;
  let v = (el.value || '').replace(/\r\n/g, '\n');
  let lines = v.split('\n');

  if(!noDescLimit && lines.length > maxLines){
    lines = lines.slice(0, maxLines);
    el.value = lines.join('\n');
    try{if(navigator.vibrate) navigator.vibrate(10);}catch(e){}
  }

  if(counterId){
    const c = document.getElementById(counterId);
    if(c){
      const used = (el.value.trim() ? el.value.split('\n').filter(x=>x.trim()).length : 0);
      if(noDescLimit){
        c.textContent = used + '行（无限制）';
        c.style.color = 'var(--text2)';
      } else {
        c.textContent = used + '/' + maxLines + ' 行';
        c.style.color = (used >= maxLines) ? 'var(--danger)' : 'var(--text2)';
      }
    }
  }
}

// 人物描述：根据优先级自动选择上限
function getCharDescMaxByPriority(pri){
  if(pri === '核心') return 3000;
  if(pri === '参考') return 1000;
  return 2000; // 普通人物上限
}

function updateCharDescCounter(idx){
  const pri = (characters && characters[idx] && characters[idx].priority) ? characters[idx].priority : '普通';
  const max = getCharDescMaxByPriority(pri);
  const ta = document.querySelector('.char-desc[data-idx="'+idx+'"]');
  if(ta) limitTextarea(ta, max, 'charDescCount'+idx);
}

function onCharDescInput(idx, el){
  const pri = (characters && characters[idx] && characters[idx].priority) ? characters[idx].priority : '普通';
  const max = getCharDescMaxByPriority(pri);
  limitTextarea(el, max, 'charDescCount'+idx);
  saveCharactersFromUI();
}
// ==================== 统一错误处理 ====================
function logError(context, error) {
    const msg = error && error.message ? error.message : String(error);
    console.error('[' + context + ']', error);
    if (devMode && typeof _originalShowToast === 'function') {
        _originalShowToast('' + context + ': ' + msg, 3000);
    }
}
// ==================== UTILITY ====================
function esc(s){
// [FIX-1] 补全反引号转义，防止在内联事件属性/模板字符串中注入
if(s===null||s===undefined)return '';
if(typeof s!=='string')s=String(s);
return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;').replace(/`/g,'&#96;');
}
// 安全版innerHTML设置：自动对文本内容转义
function safeSetHtml(el, html){
  if(!el) return;
  el.innerHTML = html;
}
// 安全版：用textContent设置纯文本（无XSS风险）
function safeSetText(el, text){
  if(!el) return;
  el.textContent = text || '';
}
function uid(){return Date.now()+'_'+Math.random().toString(36).substr(2,8);}
function escapeRegExp(str){
  return str.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
}
// [FIX-2] countWords 增加空值保护，防止传入 undefined/null 时崩溃
function countWords(text){return (text==null?'':String(text)).replace(/\s/g,'').length;}
// ==================== Token估算 ====================
// 粗略估算：中文约1.5token/字，英文约0.75token/词，标点约1token
function estimateTokens(text){
  if(!text) return 0;
  let tokens = 0;
  // 中文字符
  const cnMatch = text.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g);
  if(cnMatch) tokens += cnMatch.length * 1.5;
  // 英文单词
  const enMatch = text.match(/[a-zA-Z]+/g);
  if(enMatch) tokens += enMatch.length * 0.75;
  // 数字
  const numMatch = text.match(/\d+/g);
  if(numMatch) tokens += numMatch.length;
  // 标点和其他
  const punctMatch = text.match(/[^\u4e00-\u9fff\u3400-\u4dbfa-zA-Z0-9\s]/g);
  if(punctMatch) tokens += punctMatch.length;
  return Math.ceil(tokens);
}
// 根据模型名称粗略估算它的总上下文窗口（输入+输出token总预算）。
// 用途：像"高级创作"这类会主动设置较大max_tokens（输出token）的场景，如果只关注输入prompt的大小、
// 完全不管请求的输出token本身是否已经逼近甚至超过模型总窗口，即使把输入精简到极致也还是会报"上下文超限"——
// 这个函数统一供各处使用，避免各写一份、后续维护时不一致。
function _guessModelContextWindow(modelName){
  const m=(modelName||'').toLowerCase();
  if(m.includes('gpt-4o')||m.includes('gpt-4')) return 128000;
  if(m.includes('gpt-3.5')) return 16384;
  if(m.includes('claude')) return 200000;
  if(m.includes('qwen')) return 32768;
  if(m.includes('deepseek')) return 65536;
  if(m.includes('llama')) return 8192;
  if(m.includes('gemma')) return 8192;
  return 8192; // 默认保守估计
}

// 计算完整系统提示词的Token数
function getFullPromptTokens(){
  const sysPrompt = buildSysPrompt();
  return estimateTokens(sysPrompt);
}

// 刷新上下文编辑器的Token显示
function toggleCtxTokenInfo(){
  var detail=document.getElementById('ctxTokenDetail');
  var bar=document.getElementById('ctxTokenBar').parentElement;
  var warn=document.getElementById('ctxTokenWarn');
  var btn=document.getElementById('ctxTokenToggleBtn');
  if(!detail.classList.contains('show')){
    foldSlide(detail,true);
    foldSlide(bar,true);
    warn.style.display='';
    btn.textContent='收起';
  }else{
    foldSlide(detail,false);
    foldSlide(bar,false);
    warn.style.display='none';
    btn.textContent='展开';
  }
}
function refreshCtxTokenCount(){
  if(!curRd) return;
  const ctx = articleContexts[curRd.id] || {};
  const maxTokens = parseInt(document.getElementById('apiMaxTokens').value) || 4096;
  
  // 估算各部分Token
  const sysTokens = getFullPromptTokens();
  const summaryTokens = estimateTokens(document.getElementById('ctxPrevSummary').value || '');
  const fsTokens = estimateTokens(document.getElementById('ctxForeshadows').value || '');
  const charStateTokens = estimateTokens(document.getElementById('ctxCharStates').value || '');
  const dirTokens = estimateTokens(document.getElementById('ctxDirection').value || '');
  const outlineTokens = estimateTokens(
  (window._ctxChOutlines||[]).filter(Boolean).join('\n') || ''
);
  const reqTokens = estimateTokens(document.getElementById('ctxSpecialReq').value || '');
  
  // 上一章文本Token
  const lastChLen = _ctxGetLastChLen();
  const lastCh = curRd.chapters ? curRd.chapters[curRd.chapters.length-1] || '' : '';
  const lastChText = lastCh.substring(Math.max(0, lastCh.length - lastChLen));
  const lastChTokens = estimateTokens(lastChText);
  
  // 第一章开头Token
  let firstChTokens = 0;
  if(document.getElementById('ctxSendFirstCh').checked && curRd.chapters && curRd.chapters.length > 1){
    firstChTokens = estimateTokens(curRd.chapters[0].substring(0, 500));
  }
  
  const estFactsTokens = estimateTokens((document.getElementById('ctxEstFacts')&&document.getElementById('ctxEstFacts').value)||'');
  const inputTotal = sysTokens + summaryTokens + fsTokens + charStateTokens + dirTokens + outlineTokens + reqTokens + lastChTokens + firstChTokens + estFactsTokens;
  
  // 估算一个常见模型的上下文窗口
  const modelName = (document.getElementById('apiModel').value || '').toLowerCase();
  let ctxWindow = _guessModelContextWindow(modelName);
  
  const outputReserve = maxTokens; // 留给输出的Token
  const availableForInput = ctxWindow - outputReserve;
  const usagePercent = availableForInput > 0 ? Math.round(inputTotal / availableForInput * 100) : 0;
  
  // 更新显示
  const detail = document.getElementById('ctxTokenDetail');
  detail.innerHTML = 
    '系统提示词：<span style="color:var(--accent2);font-weight:600">~' + sysTokens + '</span> tokens<br>' +
    '前情提要：~' + summaryTokens + ' · 伏笔：~' + fsTokens + ' · 人物状态：~' + charStateTokens + '<br>' +
    (estFactsTokens?'已确立事实：~' + estFactsTokens + '<br>':'')+
    '方向：~' + dirTokens + ' · 大纲：~' + outlineTokens + ' · 特殊要求：~' + reqTokens + '<br>' +
    '上一章文本：~' + lastChTokens + (firstChTokens > 0 ? ' · 第一章开头：~' + firstChTokens : '') + '<br>' +
    '<strong style="color:var(--text)">输入总计：~' + inputTotal + ' tokens</strong> · 输出预留：' + outputReserve + '<br>' +
    '模型上下文窗口：~' + ctxWindow + ' · 使用率：<span style="color:' + (usagePercent > 85 ? 'var(--danger)' : usagePercent > 60 ? '#f0a030' : 'var(--success)') + ';font-weight:600">' + usagePercent + '%</span>';
  
  // 进度条
  const bar = document.getElementById('ctxTokenBar');
  bar.style.width = Math.min(100, usagePercent) + '%';
  if(usagePercent > 85){
    bar.style.background = 'var(--danger)';
  } else if(usagePercent > 60){
    bar.style.background = 'linear-gradient(90deg,#f0a030,#e67e22)';
  } else {
    bar.style.background = 'linear-gradient(90deg,var(--accent),var(--accent2))';
  }
  
  // 警告
  const warn = document.getElementById('ctxTokenWarn');
  warn.style.display = usagePercent > 85 ? 'block' : 'none';
  
  showToast('Token估算已更新');
var tBtn=document.getElementById('ctxTokenToggleBtn');if(tBtn&&tBtn.textContent==='展开'){toggleCtxTokenInfo();}
}
function _suppressSelect(el){el.style.webkitUserSelect='none';el.style.userSelect='none';}
function _restoreSelect(el){el.style.webkitUserSelect='';el.style.userSelect='';}
function debounce(fn,ms){let t;return function(...a){clearTimeout(t);t=setTimeout(()=>fn.apply(this,a),ms);};}
function isLiked(article){
if(article.type==='long')return cols.books.some(b=>b.id===article.id);
return cols.shorts.some(s=>s.id===article.id);
}

// ==================== 平滑折叠动画 ====================
// 折叠面板的展开/收起统一走 foldSlide。class（默认 show）就是逻辑状态，调用后立即生效；
// 动画只是视觉过渡：高度、内外边距、边框、透明度在 0 与自然值之间渐变（Web Animations API）。
// 浏览器不支持该 API、系统开启"减少动态效果"、或元素当前不在渲染树里（量不到高度）时直接切换，功能不受影响。
// 动画途中再次调用会从当前高度反向过渡而不是跳变；朝同一目标重复调用则直接忽略。
const FOLD_OPEN_MS=280;
const FOLD_CLOSE_MS=220;
const FOLD_EASING='cubic-bezier(.4,0,.2,1)';
const FOLD_LENGTH_PROPS=['height','paddingTop','paddingBottom','marginTop','marginBottom','borderTopWidth','borderBottomWidth'];
const _foldRuns=new WeakMap();
function _foldCanAnimate(el){
  if(typeof el.animate!=='function')return false;
  if(typeof window.matchMedia==='function'&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)return false;
  return true;
}
// 读取元素此刻的真实尺寸；动画进行中读到的是中间值
function _foldMeasure(el){
  const cs=window.getComputedStyle(el);
  const m={opacity:cs.opacity};
  FOLD_LENGTH_PROPS.forEach(function(p){m[p]=cs[p];});
  return m;
}
function _foldCollapsed(){
  const z={opacity:'0'};
  FOLD_LENGTH_PROPS.forEach(function(p){z[p]='0px';});
  return z;
}
// 撤销一次折叠动画，并还原动画期间临时改过的内联样式
function _foldRestore(el,run){
  _foldRuns.delete(el);
  el.style.overflow=run.prevOverflow;
  if(run.keepVisible)el.style.display=run.prevDisplay;
  // forwards 的结束帧要等内联样式还原之后再撤掉，否则收起的最后一帧会闪一下
  run.anim.cancel();
}
function _foldCallback(fn){
  try{fn();}catch(e){logError('折叠动画回调',e);}
}
// el：折叠元素；open：目标状态；cls：表示"展开"的 class（默认 show）；
// instant：为 true 时不播放动画（例如弹窗刚打开时同步初始状态）；onClosed：元素收起完成后调用一次
function foldSlide(el,open,cls,instant,onClosed){
  if(!el)return;
  cls=cls||'show';
  open=!!open;
  const callback=(!open&&typeof onClosed==='function')?onClosed:null;
  const run=_foldRuns.get(el);
  const isOpen=el.classList.contains(cls);
  if(run&&run.open===open&&isOpen===open){
    if(callback)run.onClosed=callback;
    return;
  }
  if(!run&&isOpen===open){
    if(callback)_foldCallback(callback);
    return;
  }
  // 收起时若焦点还在里面，先让它失焦：display:none 本来就会让焦点消失，这里保持一致
  if(!open){
    const active=document.activeElement;
    if(active&&active!==document.body&&el.contains(active)&&typeof active.blur==='function')active.blur();
  }
  const motion=!instant&&_foldCanAnimate(el);
  // 动画起点必须在撤销旧动画之前量：途中被打断取当前中间值，从展开收起取当前值，从收起展开则从 0 开始
  const from=(motion&&(run||isOpen))?_foldMeasure(el):null;
  if(run)_foldRestore(el,run);
  if(!motion||(from&&!/px$/.test(from.height))){
    el.classList.toggle(cls,open);
    if(callback)_foldCallback(callback);
    return;
  }
  const prevOverflow=el.style.overflow;
  const prevDisplay=el.style.display;
  let keepVisible=false;
  if(open){
    el.classList.add(cls);
  }else{
    // 逻辑状态立即变成"已收起"，但动画期间元素还得继续显示，所以临时用内联 display 顶住，动画结束再还原
    const shownDisplay=window.getComputedStyle(el).display;
    el.classList.remove(cls);
    el.style.display=shownDisplay;
    keepVisible=true;
  }
  const to=open?_foldMeasure(el):_foldCollapsed();
  if(!/px$/.test(to.height)){
    // 元素不在渲染树里（例如祖先被隐藏），没有可过渡的高度：保持已落地的状态即可
    if(keepVisible)el.style.display=prevDisplay;
    if(callback)_foldCallback(callback);
    return;
  }
  el.style.overflow='hidden';
  let anim=null;
  try{
    anim=el.animate([from||_foldCollapsed(),to],{duration:open?FOLD_OPEN_MS:FOLD_CLOSE_MS,easing:FOLD_EASING,fill:'forwards'});
  }catch(e){
    el.style.overflow=prevOverflow;
    if(keepVisible)el.style.display=prevDisplay;
    logError('折叠动画',e);
    if(callback)_foldCallback(callback);
    return;
  }
  const newRun={anim:anim,open:open,prevOverflow:prevOverflow,prevDisplay:prevDisplay,keepVisible:keepVisible,onClosed:callback};
  _foldRuns.set(el,newRun);
  anim.onfinish=function(){
    if(_foldRuns.get(el)!==newRun)return;
    _foldRestore(el,newRun);
    if(newRun.onClosed)_foldCallback(newRun.onClosed);
  };
}

// ==================== NAV ====================
function _checkFirstVisitHint(pg){
  var key='bj_fv_'+pg;
  var seen=false;
  try{ seen=!!localStorage.getItem(key); }catch(e){ seen=true; }
  if(seen)return;
  try{ localStorage.setItem(key,'1'); }catch(e){}
  var hints={
    collection:'收藏夹：长按书名卡片可重命名、导出或删除；点封面区域可换封面。',
    create:'创作：点右上角「+」新建作品；长按作品卡片可删除或导出。',
    resource:'资源广场：点「导入」可把角色卡和世界观模板装进你的预设库。',
    settings:'设置：先填好「API设置」里的密钥，AI功能才能正常使用。'
  };
  var msg=hints[pg];
  if(msg)setTimeout(function(){ try{ showToast(msg,4500); }catch(e){} },600);
}
function _cleanupPageUI(){
  // 结束还在进行的新手引导（遮罩和气泡），避免残留到新页面上
  try{ tutDismiss(); }catch(e){ logError('tutDismiss', e); }
  // 移除所有动态生成的 pop-glass-menu 弹出菜单
  document.querySelectorAll('[id$="MenuPop"]').forEach(function(el){el.remove();});
  // 隐藏复用的长按消息菜单
  var msgMenu=document.getElementById('xjMsgMenu');
  if(msgMenu)msgMenu.style.display='none';
  // 关闭所有 res-exp-ov 浮窗（点击遮罩关闭类）
  document.querySelectorAll('.res-exp-ov.show').forEach(function(el){
    el.classList.remove('show');
  });
}
function switchPage(pg,el){
if(el.classList.contains('act')){
window.scrollTo({top:0,behavior:'smooth'});
return;
}
_cleanupPageUI();
// 只在数据量大时才显示加载
var needsLoading=_needsLoadingAnim(pg);
if(needsLoading) showPageLoading();

var _curPg=document.querySelector('.pg.act');
var _newPg=document.getElementById('pg-'+pg);
if(_curPg===_newPg)return;
window.scrollTo({top:0});
// 先让新页面准备好再切换，减少闪烁
if(_newPg){_newPg.style.opacity='0';_newPg.classList.add('act');}
if(_curPg&&_curPg!==_newPg){_curPg.classList.remove('act');}
requestAnimationFrame(function(){
  requestAnimationFrame(function(){
    if(_newPg)_newPg.style.opacity='';
  });
});
document.querySelectorAll('.bnav-i').forEach(n=>n.classList.remove('act'));
el.classList.add('act');

if(pg==='collection')renderCollections();
if(pg==='create'){renderCrList();try{renderLazyLane();}catch(e){}}
if(pg==='resource'){loadBuiltinPacks();renderResList();}
if(pg==='settings'){renderAllPresets();renderCharCards();updateStats();updateStorageDisplay();}
if(pg==='workshop'&&(isGen||AppState.isGen)){var _sc=document.getElementById('streamCard');if(_sc)_sc.scrollIntoView({block:'nearest'});}
try{if(xjVisible)document.getElementById('xjGlobalFloat').style.display='';}catch(e){}
_checkFirstVisitHint(pg);
try{ tutOnPageEnter(pg); }catch(e){ logError('tutOnPageEnter', e); }

if(needsLoading) hidePageLoading();
}
// ==================== TAGS ====================
// 标签筛选生效后重新渲染作品列表：如果搜索框里有关键词，走关键词筛选那条路径（同时叠加标签），
// 否则走普通的 renderArticles()（selTags 已经在其内部的筛选逻辑里生效）
function _wsRefreshAfterTagChange(){
  var kw=(document.getElementById('searchInput')&&document.getElementById('searchInput').value||'').trim();
  if(kw){filterWorkshopArticles(kw);}
  else{renderArticles._force=true;renderArticles();}
}
function renderTags(){
const w=document.getElementById('tagsWrap');w.innerHTML='';
tags.forEach((tag,i)=>{
const isAct=selTags.includes(tag);
const el=document.createElement('span');
el.className='tag'+(isAct?' act':'');
el.innerHTML=esc(tag)+'<span class="tdel" onclick="event.stopPropagation();rmTag('+i+')"><i class="fas fa-times"></i></span>';
el.onclick=(e)=>{
  if(e.detail===2&&selTags.length>0){selTags=[];renderTags();_wsRefreshAfterTagChange();showToast('已清空所有标签');return;}
  const idx=selTags.indexOf(tag);
  if(idx>-1){selTags.splice(idx,1);}
  else{
    if(selTags.length>=6){showToast('最多选择 6 个标签');return;}
    selTags.push(tag);
  }
  renderTags();
  // 标签按钮不只是给"待生成小说"选主题，也同时用来筛选下方作品列表：
  // 选中的标签之间是"且"关系——作品必须同时具备所有选中标签才会显示，一个都不选则不筛选
  _wsRefreshAfterTagChange();
};
w.appendChild(el);
});
const ab=document.createElement('button');
ab.className='tag-add';ab.textContent='+ 新建';
ab.onclick=()=>showInp('新建标签','输入标签名（自动加#）',v=>{
const t=v.startsWith('#')?v:'#'+v;
if(!tags.includes(t)){tags.push(t);sv(K.tags,tags);renderTags();}
});
w.appendChild(ab);
}
function rmTag(i){
const _removed=tags[i];
selTags=selTags.filter(t=>t!==_removed);
tags.splice(i,1);
sv(K.tags,tags);
renderTags();
// 删掉的标签如果正好在筛选中生效，列表也要跟着刷新，不然界面上标签消失了但筛选效果还残留着
_wsRefreshAfterTagChange();
}
let cmpParts = { char:true, rel:true, npc:true, world:true, rule:true, style:true, ban:true, extra:false };
// ✅ 新增：标记是否在压缩 & 中止控制器
let cmpIsRunning = false;
let cmpAbortCtrl = null;
let cmpLastResult = null;
function _cmpExtractJson(text){
  // 使用统一的JSON提取工具（支持代码块、前后多余文字、末尾截断等）
  return _extractJsonStr(text||'');
}
function safeJsonParse(text){
  let t = (text||'').trim();
  if(!t) throw new Error('empty');

  // 去 BOM
  t = t.replace(/\uFEFF/g,'');

  // 去 ```json ``` 包裹（多种变体）
  t = t.replace(/^```(?:json|JSON|js|javascript|text|plaintext)?\s*\n?/i,'');
  t = t.replace(/\n?```\s*$/,'');
  t = t.trim();

  // 去掉AI常见的开头废话（"好的，以下是JSON：" 之类）
  t = t.replace(/^[\s\S]*?(?=\{)/,'');

  // 截取第一对完整大括号
  let depth=0, start=-1, end=-1;
  for(let i=0;i<t.length;i++){
    if(t[i]==='{'){if(start<0)start=i;depth++;}
    else if(t[i]==='}'){depth--;if(depth===0&&start>=0){end=i;break;}}
  }
  if(start>=0 && end>start) t = t.slice(start, end+1);

  // 中文标点替换
  t = t.replace(/[""]/g,'"').replace(/['']/g,"'");
  t = t.replace(/：/g,':').replace(/，/g,',');

  // 修复常见JSON格式问题
  // 1. 拖尾逗号
  t = t.replace(/,\s*([}\]])/g,'$1');
  // 2. 单引号键名 → 双引号
  t = t.replace(/'/g,'"');
  // 3. 没有引号的键名（如 name: "xxx" → "name": "xxx"）
  t = t.replace(/([{,]\s*)([a-zA-Z_]\w*)\s*:/g,'$1"$2":');
  // 4. 值中的换行符转义（JSON不允许裸换行）
  t = t.replace(/"([^"]*?)"/g, function(match){
    return match.replace(/\n/g,'\\n').replace(/\r/g,'\\r').replace(/\t/g,'\\t');
  });
  // 5. 修复连续双引号 "" → "
  t = t.replace(/""/g,'"');
  // 6. 修复缺少逗号的相邻键值对（"key1":"val1" "key2" → "key1":"val1","key2"）
  t = t.replace(/"\s*\n\s*"/g,'",\n"');

  try{
    return JSON.parse(t);
  }catch(e1){
    throw e1;
  }
}
function _cmpNormalizeLine(line){
  return (line||'')
    .replace(/^[\s•\-\*◆◇\d\)\.\、]+/g,'')
    .trim();
}

function openCompressor(){
  document.getElementById('setModalCompressor').classList.add('show');
  navPush('setModalCompressor');
  document.getElementById('bnav').classList.add('hide');

  document.getElementById('cmpOut').value='';
  cmpLastResult=null;
  refreshCmpStats();

  // 打开时根据当前勾选状态显示/隐藏 extra 输入框
  const wrap=document.getElementById('cmpExtraWrap');
  // 弹窗刚打开，同步初始状态即可，不需要动画
  if(wrap) foldSlide(wrap, !!cmpParts.extra, 'show', true);
}

function closeCompressor(){
  // 兼容旧调用（如果别处还在用 closeCompressor）
  closeCompressorFull();
}

function closeCompressorFull(){
  navPop('setModalCompressor');
  document.getElementById('setModalCompressor').classList.remove('show');
  document.getElementById('bnav').classList.remove('hide');
}

function toggleCmpPart(key, el){
  cmpParts[key] = !cmpParts[key];
  el.classList.toggle('act', cmpParts[key]);

  if(key==='extra'){
    const wrap=document.getElementById('cmpExtraWrap');
    if(wrap) foldSlide(wrap, !!cmpParts.extra);
  }

  refreshCmpStats();
}

function _getVal(id, fb=''){
  const el=document.getElementById(id);
  return (el && typeof el.value==='string') ? el.value : fb;
}

function _len(s){ return (s||'').toString().trim().length; }

function refreshCmpStats(){
  const raw = _gatherCmpRaw();
  const before = _calcCmpLen(raw);
  const after = cmpLastResult ? _calcCmpLen(cmpLastResult) : null;

  let t = '';
  t += '压缩前（字符数）\n';
  t += '人物：' + before.char + '\n';
  t += '关系：' + before.rel + '\n';
  t += 'NPC：' + before.npc + '\n';
  t += '世界观（全局+局部）：' + before.world + '\n';
  t += '规则（全局+局部）：' + before.rule + '\n';
  t += '文风（局部）：' + before.style + '\n';
  t += '禁用词（全局+局部）：' + before.ban + '\n';
  t += '额外设定：' + (before.extra||0) + '\n';
  t += '合计：' + before.total + '\n';

  if(after){
    t += '\n压缩后（字符数）\n';
    t += '人物：' + after.char + '\n';
    t += '关系：' + after.rel + '\n';
    t += 'NPC：' + after.npc + '\n';
    t += '世界观（全局+局部）：' + after.world + '\n';
    t += '规则（全局+局部）：' + after.rule + '\n';
    t += '文风（局部）：' + after.style + '\n';
    t += '禁用词（全局+局部）：' + after.ban + '\n';
    t += '额外设定：' + (after.extra||0) + '\n';
    t += '合计：' + after.total + '\n';
  }
  document.getElementById('cmpStats').textContent = t;
}

function _gatherCmpRaw(){
  // 简单的长度限制，防止提示词太长把接口撑爆
  const limit = (s, max) => {
    s = (s || '').toString();
    if (s.length > max) {
      return s.slice(0, max) + '\n……【已截断，防止提示过长】';
    }
    return s;
  };

  const gWorld = (_getVal('globalWorldDesc', globalWorld) || '').trim();
  const lWorld = (_getVal('worldDesc', '') || '').trim();

  const gRule  = (_getVal('globalRuleDesc', globalRule) || '').trim();
  const lRule  = (_getVal('ruleDesc', curRule) || '').trim();

  const style  = (_getVal('styleDesc', ap.curStyle || '') || '').trim();

  const gBan   = (_getVal('globalBanWordsInput', globalBanWords) || '').trim();
  const lBan   = (_getVal('banWordsInput', banWords) || '').trim();

  // 原始拼接
  let charText = (characters || []).map(c=>{
    if(!c || !c.name) return '';
    const pri = c.priority || '普通';
    const traits = (c.traits && c.traits.length)
      ? ('（' + c.traits.join('、') + '）')
      : '';
    const desc = (c.desc || '').trim();
    return c.name + ' ' + pri + traits + (desc ? ('：' + desc) : '');
  }).filter(Boolean).join('\n');

  let relText = (charRelations || []).map(r=>{
    if(!r || !r.charA || !r.charB) return '';
    return r.charA + '-' + (r.direction || '双向') + '-' + r.charB + '：' +
      (r.type || '') + (r.desc ? ('(' + r.desc + ')') : '');
  }).filter(Boolean).join('\n');

  let npcText = (npcList || []).map(n=>{
    if(!n || !n.name) return '';
    const role = n.role ? ('[' + n.role + ']') : '';
    const traits = (n.traits && n.traits.length)
      ? ('（' + n.traits.join('、') + '）')
      : '';
    const desc = (n.desc || '').trim();
    return n.name + role + traits + (desc ? ('：' + desc) : '');
  }).filter(Boolean).join('\n');

  let worldText = [gWorld, lWorld].filter(Boolean).join('\n\n');
  let ruleText  = [gRule,  lRule ].filter(Boolean).join('\n\n');
  let styleText = style;
  let banText   = [gBan, lBan].filter(Boolean).join('\n');
  let extraText = ((_getVal('cmpExtra','') || '').trim());

  // 在真正返回前做长度裁剪（字符数上限可以改）
  charText  = limit(charText,  3000);
  relText   = limit(relText,   1500);
  npcText   = limit(npcText,   2000);
  worldText = limit(worldText, 3000);
  ruleText  = limit(ruleText,  2000);
  styleText = limit(styleText, 1500);
  banText   = limit(banText,   1000);
  extraText = limit(extraText, 3000);

  return {
    char:  charText,
    rel:   relText,
    npc:   npcText,
    world: worldText,
    rule:  ruleText,
    style: styleText,
    ban:   banText,
    extra: extraText
  };
}

function _calcCmpLen(obj){
  const m = {
    char: _len(obj.char),
    rel: _len(obj.rel),
    npc: _len(obj.npc),
    world: _len(obj.world),
    rule: _len(obj.rule),
    style: _len(obj.style),
    ban: _len(obj.ban),
    extra: _len(obj.extra)
  };
  m.total = m.char+m.rel+m.npc+m.world+m.rule+m.style+m.ban+m.extra;
  return m;
}

// ==================== TYPE SWITCH ====================
function switchType(type,el){
curType=type;
wsDisplayCount=30;
document.querySelectorAll('.ttab').forEach(t=>t.classList.remove('act'));
el.classList.add('act');renderArticles();
}

// ==================== ARTICLES RENDER ====================
let _lastRenderArticlesHash='';
function renderArticles(){
const list=document.getElementById('articleList');
const hash=curType+'_'+ws.length+'_'+wsDisplayCount+'_'+selTags.join(',')+'_'+cols.books.length+'_'+cols.shorts.length;
// 正在生成时跳过重渲染，防止 streamCard 被清除
if(isGen||AppState.isGen){renderArticles._force=false;return;}
if(hash===_lastRenderArticlesHash&&!renderArticles._force){return;}
_lastRenderArticlesHash=hash;
if(!list) return;
renderArticles._force=false;
const _wsTypeCache={};
function getWsByType(type){
if(!_wsTypeCache[type]||_wsTypeCache[type].ver!==ws.length){
_wsTypeCache[type]={ver:ws.length,data:ws.filter(a=>a&&a.type===type)};
}
return _wsTypeCache[type].data;
}
const _byType=getWsByType(curType);
// 标签筛选：作坊页的标签按钮身兼两职——既是"待生成小说"的主题标签选择，也是下方作品列表的筛选器。
// 选中的多个标签之间是"且"关系：作品必须同时具备所有选中的标签才会显示，少一个都不行；
// 不选任何标签则不筛选、显示该类型下全部作品。
const allFiltered=selTags.length===0?_byType:_byType.filter(a=>selTags.every(t=>(a.tags||[]).includes(t)));
const filtered=allFiltered.slice(0,wsDisplayCount);
if(filtered.length===0){
if(selTags.length>0){
list.innerHTML='<div class="empty-st"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg><p>没有命中所选标签的'+(curType==='long'?'长篇连载':'短篇一发')+'<br>试试取消部分标签，或换个标签组合 <i class="fas fa-tag"></i></p></div>';
}else{
list.innerHTML='<div class="empty-st"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg><p>还没有作品<br><br><i class="fas fa-lightbulb"></i> 试试这样开始：<br>1. 在上方输入框描述你想要的故事<br>2. 选择几个氛围标签<br>3. 点击「生成」按钮<br><br>或者点击右上角「转盘」获取创意 <i class="fas fa-wand-magic-sparkles"></i></p></div>';
}
return;
}
list.innerHTML='';
const artFrag=document.createDocumentFragment();
filtered.forEach(article=>{
const liked=isLiked(article);
const card=document.createElement('div');
card.className='acard';
card.onclick=e=>{if(!e.target.closest('.btn-like'))openReading(article);};

let text='';
if(article.type==='long'&&article.chapters&&article.chapters.length>0)text=article.chapters[0];
else if(article.content)text=article.content;
const preview=(text||'').substring(0,120).replace(/\n/g,' ');
const wc=getTotalWords(article); const chCount=article.chapters?article.chapters.length:0;
const tagsHtml=(article.tags||[]).map(t=>'<span class="acard-tag">'+esc(t)+'</span>').join('');

card.innerHTML=
'<div class="acard-hd"><div class="acard-t">'+esc(article.title)+'</div>'+
'<span class="acard-badge '+article.type+'">'+(article.type==='long'?'长篇':'短篇')+'</span></div>'+
'<div class="acard-pv">'+esc(preview)+'</div>'+
'<div class="acard-ft">'+
'<span class="acard-wc">'+(chCount>0?chCount+'章 · ':'')+wc+'字 · '+new Date(article.createdAt).toLocaleDateString()+'</span>'+
'<button class="btn-like '+(liked?'liked':'')+'" onclick="event.stopPropagation();toggleLike(\''+article.id+'\')" title="'+(liked?'取消收藏':'收藏')+'">'+(liked?'<i class="fas fa-heart" style="color:#ff6b6b"></i>':'<i class="fas fa-heart" style="color:var(--text2)"></i>')+'</button>'+
'<button class="btn-like" onclick="event.stopPropagation();deleteWsArticle(\''+article.id+'\')" style="color:var(--danger)" title="删除"><i class="fas fa-trash-can"></i></button>'+
'</div>'+
'<div class="acard-tags" style="margin-top:8px">'+tagsHtml+'</div>';
artFrag.appendChild(card);
});
list.appendChild(artFrag);
// 滚动加载更多
if(allFiltered.length>filtered.length){
var moreDiv=document.createElement('div');
moreDiv.style.cssText='text-align:center;padding:16px;color:var(--text2);font-size:12px';
moreDiv.innerHTML='显示 '+filtered.length+' / '+allFiltered.length+' 篇<br><button id="wsLoadMoreBtn" style="margin-top:8px;padding:10px 24px;border-radius:12px;border:1px solid var(--border);background:var(--card);color:var(--text);cursor:pointer;font-size:12px" onclick="wsLoadMore()">加载更多（+20篇）</button>';
list.appendChild(moreDiv);
}
}

// ==================== TOGGLE LIKE (by id) ====================
function wsLoadMore(){
  wsDisplayCount+=20;
  renderArticles._force=true;
  renderArticles();
  showToast('已加载更多');
}
let likeProcessing=false;
function toggleLike(id){
if(likeProcessing)return;
likeProcessing=true;
setTimeout(()=>{likeProcessing=false;},500);
const article=ws.find(a=>a.id===id);
if(!article){
// 也检查收藏里的文章（可能只在收藏不在作坊）
if(cols.books.find(b=>b.id===id)){
cols.books=cols.books.filter(b=>b.id!==id);
sv(K.cols,cols);
renderArticles();
showToast('已取消收藏');
likeProcessing=false;
return;
}
if(cols.shorts.find(s=>s.id===id)){
cols.shorts=cols.shorts.filter(s=>s.id!==id);
sv(K.cols,cols);
renderArticles();
showToast('已取消收藏');
likeProcessing=false;
return;
}
likeProcessing=false;
return;
}
if(article.type==='long'){
const bIdx=cols.books.findIndex(b=>b.id===id);
if(bIdx>-1){cols.books.splice(bIdx,1);showToast('已取消收藏');}
else{
const copy=JSON.parse(JSON.stringify(article));
copy.cover=null;copy.status='ongoing';copy.rating=0;
cols.books.push(copy);
showToast('已整理到书架上啦');
}
}else{
const sIdx=cols.shorts.findIndex(s=>s.id===id);
if(sIdx>-1){cols.shorts.splice(sIdx,1);showToast('已取消收藏');}
else{
const copy=JSON.parse(JSON.stringify(article));
copy.rating=0;
cols.shorts.push(copy);
showToast('星笺帮你收好啦');
}
}
sv(K.cols,cols);renderArticles._force=true;renderArticles();
// 刷新续写按钮状态
if(curRd&&curRd.id===id){
  var liked2=isLiked(curRd);
  var bc3=document.getElementById('btnCont');
  var sc3=document.getElementById('btnSmartCont');
  if(curRd.type==='long'){
    if(liked2){
      if(bc3){bc3.disabled=false;bc3.innerHTML='<i class="fas fa-pen-nib"></i> 续写第'+(curRd.chapters?curRd.chapters.length+1:2)+'章';}
      if(sc3){sc3.disabled=false;sc3.innerHTML='<i class="fas fa-brain"></i> 智能续写';}
    }else{
      if(bc3){bc3.disabled=true;bc3.textContent='请先收藏后才能续写';}
      if(sc3){sc3.disabled=true;sc3.textContent='请先收藏';}
    }
  }
}
// 立即更新阅读页中所有收藏按钮状态
try{updateRdLikeBtn();}catch(e){}
try{
  if(_rdOverlayEl){
    var topBtns=_rdOverlayEl.querySelectorAll('.rd-reader-ov-btn');
    if(topBtns.length>=2){
      var likeBtn2=topBtns[topBtns.length-1];
      likeBtn2.innerHTML=isLiked({id:id})?'<i class="fas fa-heart" style="color:#ff6b6b"></i>':'<i class="fas fa-heart" style="color:var(--text2)"></i>';
    }
  }
}catch(e){}
}

// ==================== SYNC HELPER ====================
// Sync article data across workshop and collections
function syncArticle(article){
if(!article||!article.id){
console.error('syncArticle: 无效的文章数据');
return;
}
// 备份当前数据以防同步失败
const backup=JSON.stringify(ws);
try{
const wIdx=ws.findIndex(a=>a.id===article.id);
if(wIdx>-1){
ws[wIdx]=JSON.parse(JSON.stringify(article));
sv(K.ws,ws);
}
if(article.type==='long'){
const bIdx=cols.books.findIndex(b=>b.id===article.id);
if(bIdx>-1){
const cover=cols.books[bIdx].cover;
const status=cols.books[bIdx].status;
const rating=cols.books[bIdx].rating;
const chOutlines=cols.books[bIdx].chOutlines;
cols.books[bIdx]=JSON.parse(JSON.stringify(article));
cols.books[bIdx].cover=cover;
cols.books[bIdx].status=status;
cols.books[bIdx].rating=rating;
if(!cols.books[bIdx].chOutlines&&chOutlines)cols.books[bIdx].chOutlines=chOutlines;
if(article.chSummaries)cols.books[bIdx].chSummaries=article.chSummaries;
sv(K.cols,cols);
}
}else{
const sIdx=cols.shorts.findIndex(s=>s.id===article.id);
if(sIdx>-1){
const rating=cols.shorts[sIdx].rating;
cols.shorts[sIdx]=JSON.parse(JSON.stringify(article));
cols.shorts[sIdx].rating=rating;
sv(K.cols,cols);
}
}
autoSaveAll();
}catch(e){
console.error('同步失败，尝试恢复:',e);
try{ws=JSON.parse(backup);}catch(e2){}
try{cols=ld(K.cols,cols);if(!cols.folders)cols.folders=[];}catch(e3){}
showToast('数据同步异常，请手动保存',3000);
}
}

// ==================== API CONFIG ====================
function getCurApi(){
  let url = (document.getElementById('apiUrl') && document.getElementById('apiUrl').value || '').trim();
  const key = (document.getElementById('apiKey') && document.getElementById('apiKey').value || '').trim();
  if(url && !/^https/i.test(url) && !/^http:\/\/localhost/i.test(url) && !/^http:\/\/127\./i.test(url)){
    console.warn('API地址未使用HTTPS，密钥可能被窃听');
  }
  let model = (document.getElementById('apiModel') && document.getElementById('apiModel').value || '').trim();
  let temp = Math.min(parseFloat(document.getElementById('apiTemp') && document.getElementById('apiTemp').value) || 0.8, 1.5);
  let maxTokens = parseInt(document.getElementById('apiMaxTokens') && document.getElementById('apiMaxTokens').value) || 4096;

  // 如果用户没写 http/https，自动补成 https://
  if (url && !/^https?:\/\//i.test(url)) {
    url = 'https://' + url;
  }

  // 模型名留空时给一个默认值，避免空字符串导致报错
  if (!model) {
    model = 'gpt-4o-mini';
  }

  let freqPenalty = parseFloat(document.getElementById('apiFreqPenalty') && document.getElementById('apiFreqPenalty').value) || 0;
  let presPenalty = parseFloat(document.getElementById('apiPresPenalty') && document.getElementById('apiPresPenalty').value) || 0;
  let hideAntiRepeat = !!_antiRepeatHidden;
  return { url, key, model, temp, maxTokens, freqPenalty, presPenalty, hideAntiRepeat };
}
// 获取AI工具专用API配置（如果未设置则回退到通用API）
function getToolApi(){
  var toolUrl = (document.getElementById('toolApiUrl') && document.getElementById('toolApiUrl').value || '').trim();
  var toolKey = (document.getElementById('toolApiKey') && document.getElementById('toolApiKey').value || '').trim();
  var toolModel = (document.getElementById('toolApiModel') && document.getElementById('toolApiModel').value || '').trim();
  var toolTemp = document.getElementById('toolApiTemp') ? document.getElementById('toolApiTemp').value : '';
  var toolMaxTokens = document.getElementById('toolApiMaxTokens') ? document.getElementById('toolApiMaxTokens').value : '';
  // 如果三个核心字段都没填，回退到通用API
  if(!toolUrl && !toolKey && !toolModel) return getCurApi();
  var base = getCurApi();
  return {
    url: toolUrl || base.url,
    key: toolKey || base.key,
    model: toolModel || base.model,
    temp: toolTemp !== '' ? parseFloat(toolTemp) : base.temp,
    maxTokens: toolMaxTokens !== '' ? parseInt(toolMaxTokens) : base.maxTokens
  };
}
// 统一的API错误友好提示
function friendlyApiErr(status) {
  if(status===401) return 'API密钥不对或没有权限，去设置里检查一下密钥';
  if(status===403) return '访问被拒绝，密钥可能没有权限调用这个模型';
  if(status===404) return '接口地址找不到，API地址或模型名可能填错了';
  if(status===429) return '⏳ 请求太频繁或余额不足，稍等一会儿再试';
  if(status===500) return 'AI服务器开小差了，不是你的问题，过一会儿再试';
  if(status===502||status===503) return 'AI服务暂时不可用，请稍后再试';
  if(status>=500)  return 'AI服务器出错了（'+status+'），请稍后再试';
  return '请求出了点问题（'+status+'），请检查API设置';
}

// 用工具API调用（非流式）
async function callToolAPINonStream(messages, _retryLeft){
  if(_retryLeft===undefined)_retryLeft=2;
  var toolCfg = getToolApi();
  // 直接用工具API配置发请求，不修改DOM
  var ep = buildChatEndpoint(toolCfg.url);
  if(!ep.endpoint){
    showToast('工具API地址为空');
    return null;
  }
  var controller = new AbortController();
  var timeoutId = setTimeout(function(){try{controller.abort();}catch(e){}}, 120000);
  try{
    var resp = await fetch(ep.endpoint,{
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':'Bearer '+toolCfg.key},
      body:JSON.stringify({model:toolCfg.model,messages:messages,temperature:toolCfg.temp,max_tokens:toolCfg.maxTokens}),
      signal:controller.signal
    });
    clearTimeout(timeoutId);
    if(!resp.ok){
      var errText=await resp.text().catch(function(){return'';});
      var detail='';
      try{var j=JSON.parse(errText);if(j&&j.error&&j.error.message)detail=j.error.message;}catch(e){}
      if(resp.status===429&&_retryLeft>0){
  showToast('工具API限流，3秒后重试...',2500);
  await new Promise(function(r){setTimeout(r,3000);});
  return callToolAPINonStream(messages,_retryLeft-1);
}
showToast(friendlyApiErr(resp.status),4000);
return null;
    }
    var rawText=await resp.text();
    var data;
    try{data=JSON.parse(rawText);}catch(pe){
      var js=rawText.indexOf('{'),je=rawText.lastIndexOf('}');
      if(js>=0&&je>js){try{data=JSON.parse(rawText.substring(js,je+1));}catch(e2){showToast('工具API返回非JSON');return null;}}
      else{showToast('工具API返回格式异常');return null;}
    }
    var content='';
    if(data.choices&&data.choices[0]){
      var choice=data.choices[0];
      content=choice.message&&choice.message.content||choice.text||choice.delta&&choice.delta.content||'';
    }else if(data.output&&data.output.text){content=data.output.text;}
    else if(data.result){content=typeof data.result==='string'?data.result:JSON.stringify(data.result);}
    if(!content){showToast('工具API未返回内容');return null;}
    return stripMetaThinking(content);
  }catch(err){
    clearTimeout(timeoutId);
    if(err.name==='AbortError'){showToast('⏱请求超时，网络可能较慢，稍后再试');return null;}
    if(!navigator.onLine){showToast('网络断开了，请检查网络连接');return null;}
    showToast('AI功能出了点小问题，请稍后再试');
    return null;
  }
}

// 测试工具API连接
async function testToolApiConnection(){
  var toolUrl = (document.getElementById('toolApiUrl').value||'').trim();
  var toolKey = (document.getElementById('toolApiKey').value||'').trim();
  var toolModel = (document.getElementById('toolApiModel').value||'').trim();
  if(!toolUrl && !toolKey && !toolModel){
    showToastForce('工具API未设置，将使用通用API');
    return;
  }
  var cfg = getToolApi();
  if(!cfg.url||!cfg.key){showToastForce('请填写工具API的地址和密钥');return;}
  var btn = document.getElementById('btnTestToolApi');
  btn.disabled=true;btn.textContent='⏳ 测试中...';
  var ep = buildChatEndpoint(cfg.url);
  var controller = new AbortController();
  var timeoutId = setTimeout(function(){try{controller.abort();}catch(e){}},60000);
  try{
    var resp = await fetch(ep.endpoint,{
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':'Bearer '+cfg.key},
      body:JSON.stringify({model:cfg.model,messages:[{role:'user',content:'Hi'}],max_tokens:1,temperature:0}),
      signal:controller.signal
    });
    clearTimeout(timeoutId);
    if(resp.ok){showToastForce('工具API连接成功！模型 '+cfg.model+' 可用',3000);}
    else{
      var errText=await resp.text().catch(function(){return'';});
      var detail='';
      try{var j=JSON.parse(errText);if(j&&j.error&&j.error.message)detail=j.error.message;}catch(e){}
      var friendly='工具API连接失败('+resp.status+')';
      if(resp.status===401)friendly='认证失败（密钥错误）';
      else if(resp.status===404)friendly='接口路径不存在';
      else if(resp.status===400)friendly='请求参数错误'+(detail.toLowerCase().includes('model')?'（模型名可能不正确）':'');
      if(detail)friendly+='：'+detail;
      showToastForce(''+friendly,4000);
    }
  }catch(e){
    clearTimeout(timeoutId);
    if(e.name==='AbortError')showToastForce('测试超时（60秒），请检查地址',5000);
    else showToastForce('测试失败：'+e.message,3000);
  }
  finally{btn.disabled=false;btn.innerHTML='<i class="fas fa-link"></i> 测试工具API连接';}
}
// 根据用户填写的 URL 智能生成 chat/completions 完整地址
function buildChatEndpoint(rawUrl){
  if(!rawUrl) return { endpoint:'', raw:'' };

  let url = rawUrl.trim();

  // 如果没写协议，默认加上 https://
  if(!/^https?:\/\//i.test(url)){
    url = 'https://' + url;
  }

  // 去掉末尾多余的 /
  url = url.replace(/\/+$/,'');

  // 如果已经是完整的 /chat/completions 地址，直接用
  if(/\/chat\/completions\s*$/i.test(url)){
    return { endpoint:url, raw:url };
  }

  // 用户写的是 .../v1 或 .../beta → 拼成 .../v1/chat/completions
  if(/\/(v1|beta)\s*$/i.test(url)){
    return { endpoint: url + '/chat/completions', raw: url + '/chat/completions' };
  }

  // 如果路径中已包含 /v1/ 但不是结尾（比如 /v1/models 之类的误写），截断到 /v1
  const v1Match = url.match(/(.*\/v1)\b/i);
  if(v1Match){
    return { endpoint: v1Match[1] + '/chat/completions', raw: v1Match[1] + '/chat/completions' };
  }

  // 其他情况：尝试 /v1/chat/completions；如果失败，外层会报错提示
  return { endpoint: url + '/v1/chat/completions', raw: url + '/v1/chat/completions' };
}
// 拉取模型列表
// ── 渲染通用模型列表面板 ──
// 模型名来自远端API的返回内容（不可信），所以这里全程用DOM API + textContent构建，
// 不把模型名拼进innerHTML或内联onclick——否则名字里带引号/尖括号就能注入脚本
function _renderModelPanel(listAreaId, inputId, btnId, models){
  var listArea = document.getElementById(listAreaId);
  if(!listArea) return;
  listArea._allModels = models;
  listArea.innerHTML = '';

  var searchWrap = document.createElement('div');
  searchWrap.style.cssText = 'position:relative;margin-bottom:6px';
  var searchIcon = document.createElement('i');
  searchIcon.className = 'fas fa-search';
  searchIcon.style.cssText = 'position:absolute;left:10px;top:50%;transform:translateY(-50%);font-size:11px;color:var(--text2);pointer-events:none';
  var searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.id = listAreaId + '_search';
  searchInput.placeholder = '输入关键词筛选模型...';
  searchInput.setAttribute('aria-label', '筛选模型');
  searchInput.style.cssText = 'width:100%;box-sizing:border-box;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:8px 10px 8px 30px;color:var(--text);font-size:12px;outline:none';
  searchInput.addEventListener('input', function(){ _filterModelPanel(listAreaId, inputId); });
  searchWrap.appendChild(searchIcon);
  searchWrap.appendChild(searchInput);

  var listEl = document.createElement('div');
  listEl.id = listAreaId + '_list';
  listEl.style.cssText = 'max-height:220px;overflow-y:auto;border:1px solid var(--border);border-radius:10px;background:var(--card2)';
  models.forEach(function(name){
    var row = document.createElement('div');
    row.className = 'bj-model-row';
    row.setAttribute('data-model', name);
    row.setAttribute('role', 'button');
    row.tabIndex = 0;
    row.style.cssText = 'padding:9px 14px;font-size:12px;color:var(--text);cursor:pointer;border-bottom:1px solid var(--border);transition:background .15s;display:flex;align-items:center;gap:8px';
    row.addEventListener('mouseover', function(){ row.style.background = 'rgba(108,92,231,.09)'; });
    row.addEventListener('mouseout', function(){ row.style.background = ''; });
    row.addEventListener('click', function(){ _pickModel(listAreaId, inputId, name); });
    row.addEventListener('keydown', function(ev){
      if(ev.key === 'Enter' || ev.key === ' '){ ev.preventDefault(); _pickModel(listAreaId, inputId, name); }
    });
    var cube = document.createElement('i');
    cube.className = 'fas fa-cube';
    cube.style.cssText = 'color:var(--accent2);font-size:10px;flex-shrink:0';
    var label = document.createElement('span');
    label.style.cssText = 'flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap';
    label.textContent = name;
    row.appendChild(cube);
    row.appendChild(label);
    listEl.appendChild(row);
  });

  var countEl = document.createElement('div');
  countEl.id = listAreaId + '_count';
  countEl.style.cssText = 'font-size:10px;color:var(--text2);margin-top:4px;text-align:center';
  countEl.textContent = '共 ' + models.length + ' 个模型，点击选择';

  listArea.appendChild(searchWrap);
  listArea.appendChild(listEl);
  listArea.appendChild(countEl);
  setTimeout(function(){ var fi=document.getElementById(listAreaId+'_search'); if(fi) fi.focus(); }, 100);
}

function _filterModelPanel(listAreaId, inputId){
  var searchEl = document.getElementById(listAreaId+'_search');
  var listEl   = document.getElementById(listAreaId+'_list');
  var countEl  = document.getElementById(listAreaId+'_count');
  if(!searchEl||!listEl) return;
  var q = searchEl.value.trim().toLowerCase();
  var rows = listEl.querySelectorAll('.bj-model-row');
  var vis = 0;
  rows.forEach(function(row){
    var name=(row.getAttribute('data-model')||'').toLowerCase();
    var show = !q || name.indexOf(q)!==-1;
    row.style.display = show ? '' : 'none';
    if(show) vis++;
  });
  if(countEl){
    if(!q){
      countEl.textContent='共 '+rows.length+' 个模型，点击选择';
      countEl.style.color='var(--text2)';
    }else{
      countEl.textContent='匹配 '+vis+'/'+rows.length+' 个模型';
      countEl.style.color = vis>0?'var(--text2)':'var(--danger)';
    }
  }
}

function _pickModel(listAreaId, inputId, name){
  var input=document.getElementById(inputId);
  if(input) input.value=name;
  var listArea=document.getElementById(listAreaId);
  if(listArea){
    listArea.innerHTML='';
    var ok=document.createElement('div');
    ok.style.cssText='font-size:12px;color:var(--success);text-align:center;padding:8px 0';
    var okIcon=document.createElement('i');
    okIcon.className='fas fa-check-circle';
    ok.appendChild(okIcon);
    ok.appendChild(document.createTextNode(' 已选择：'+name));
    listArea.appendChild(ok);
  }
  showToast('已选择：'+name);
}

// ── 模型列表实时拉取 ──
// 每个模型面板同一时刻只允许一个拉取请求在进行：key=面板id，value={ctl,timedOut,cancelled,timer,btnId}
var _modelFetchJobs = {};
var MODEL_FETCH_TIMEOUT_MS = 20000;
var _MODEL_BTN_IDLE_HTML = '<i class="fas fa-cloud-arrow-down"></i> 拉取';

// 把用户填的API地址规整成 .../v1/models；通用API和工具API共用同一套规则，
// 同时兼容用户直接粘贴了完整的 /chat/completions 或 /models 地址的情况
function _buildModelsUrl(rawUrl){
  var url = String(rawUrl||'').trim();
  if(!url) return '';
  if(!/^https?:\/\//i.test(url)) url = 'https://' + url;
  url = url.replace(/\/+$/,'').replace(/\/chat\/completions$/i,'').replace(/\/models$/i,'').replace(/\/+$/,'');
  if(!/\/v\d+$/i.test(url)) url += '/v1';
  try{ new URL(url); }catch(e){ return ''; }
  return url + '/models';
}

function _modelFetchHttpMsg(status){
  if(status===401) return '认证失败（密钥错误或已失效，HTTP 401）';
  if(status===403) return '没有权限访问模型列表（HTTP 403）';
  if(status===404) return '接口路径不存在，该API可能不提供模型列表（HTTP 404）';
  if(status===429) return '请求太频繁或额度不足（HTTP 429）';
  if(status>=500) return '服务器暂时出问题（HTTP '+status+'）';
  return 'HTTP '+status;
}

// 取消正在进行的拉取（不传参=取消全部）：关闭API设置页时调用，避免旧请求的结果事后又写回已关闭的面板
function _cancelModelFetch(listAreaId){
  var ids = listAreaId ? [listAreaId] : Object.keys(_modelFetchJobs);
  ids.forEach(function(id){
    var job = _modelFetchJobs[id];
    if(!job) return;
    delete _modelFetchJobs[id];
    job.cancelled = true;
    if(job.timer) clearTimeout(job.timer);
    try{ job.ctl.abort(); }catch(e){}
    var btn = document.getElementById(job.btnId);
    if(btn){ btn.disabled = false; btn.innerHTML = _MODEL_BTN_IDLE_HTML; }
  });
}

// 发请求并解析出模型名数组；任何失败都抛出带中文说明的Error
async function _requestModelList(modelsUrl, key, job){
  var timeoutMsg = '请求超时（'+(MODEL_FETCH_TIMEOUT_MS/1000)+'秒），请检查API地址或网络';
  var resp;
  try{
    // cache:'no-store' 让浏览器本身也不使用HTTP缓存；SW层的缓存另外在sw.js里绕过
    resp = await fetch(modelsUrl, {
      method:'GET',
      headers:{'Authorization':'Bearer '+key},
      cache:'no-store',
      signal:job.ctl.signal
    });
  }catch(err){
    if(job.timedOut) throw new Error(timeoutMsg);
    if(err && err.name==='AbortError') throw err;
    throw new Error('网络请求失败，请检查API地址是否正确、网络是否可用');
  }
  if(!resp.ok) throw new Error(_modelFetchHttpMsg(resp.status));
  var data;
  try{
    data = await resp.json();
  }catch(err){
    if(job.timedOut) throw new Error(timeoutMsg);
    if(err && err.name==='AbortError') throw err;
    throw new Error('返回内容不是有效的JSON，该地址可能不是模型接口');
  }
  var raw = null;
  if(data && Array.isArray(data.data)) raw = data.data;
  else if(Array.isArray(data)) raw = data;
  if(!raw) throw new Error('返回格式无法识别，没有找到模型列表');
  var seen = new Set();
  var models = [];
  raw.forEach(function(m){
    var name = (typeof m==='string') ? m : ((m && typeof m==='object') ? (m.id||m.name||'') : '');
    if(typeof name!=='string') return;
    name = name.trim();
    if(!name || seen.has(name)) return;
    seen.add(name);
    models.push(name);
  });
  models.sort();
  return models;
}

// 当前输入框里的模型如果不在最新列表里（比如已下架），在列表下方给出提示，但不改动输入框
function _hintMissingModel(listAreaId, inputId, models){
  var input = document.getElementById(inputId);
  var cur = input ? String(input.value||'').trim() : '';
  if(!cur || models.indexOf(cur)!==-1) return;
  var countEl = document.getElementById(listAreaId+'_count');
  if(!countEl || !countEl.parentNode) return;
  var tip = document.createElement('div');
  tip.style.cssText = 'font-size:10px;color:var(--danger);margin-top:4px;text-align:center;line-height:1.5';
  tip.textContent = '当前填写的模型「'+cur+'」不在本次拉取的列表中，可能已下架或名称有误，请从上方选择';
  countEl.parentNode.insertBefore(tip, countEl.nextSibling);
}

function _showModelPanelError(listArea, msg){
  if(!listArea) return;
  listArea.innerHTML = '';
  var box = document.createElement('div');
  box.style.cssText = 'font-size:12px;color:var(--danger);text-align:center;padding:8px';
  var icon = document.createElement('i');
  icon.className = 'fas fa-circle-xmark';
  box.appendChild(icon);
  box.appendChild(document.createTextNode(' '+msg));
  listArea.appendChild(box);
}

// 通用拉取流程：fetchModels（通用API）和fetchToolModels（工具API）共用
async function _runModelFetch(opts){
  var listArea = document.getElementById(opts.listAreaId);
  var btn = document.getElementById(opts.btnId);
  if(_modelFetchJobs[opts.listAreaId]){ showToast('正在拉取中，请稍候'); return; }
  var modelsUrl = _buildModelsUrl(opts.url);
  if(!modelsUrl){ showToastForce('API地址格式不正确'); return; }
  // HTTP请求头只能是Latin-1字符，密钥里混进中文/全角符号会让fetch直接抛出莫名其妙的错误，这里提前说清楚
  if(/[^\x00-\xFF]/.test(opts.key)){ showToastForce('密钥中包含无法使用的字符（可能复制时带入了中文或全角符号）',4000); return; }

  var job = {ctl:new AbortController(), timedOut:false, cancelled:false, timer:null, btnId:opts.btnId};
  _modelFetchJobs[opts.listAreaId] = job;
  job.timer = setTimeout(function(){ job.timedOut = true; try{ job.ctl.abort(); }catch(e){} }, MODEL_FETCH_TIMEOUT_MS);
  if(btn){ btn.disabled = true; btn.innerHTML = '<div class="loading-dots"><span></span><span></span><span></span></div>'; }
  if(listArea) listArea.innerHTML = '';
  try{
    var models = await _requestModelList(modelsUrl, opts.key, job);
    if(job.cancelled) return;
    if(models.length===0){
      showToastForce('未获取到模型');
      _showModelPanelError(listArea, '接口返回的模型列表为空');
      return;
    }
    _renderModelPanel(opts.listAreaId, opts.inputId, opts.btnId, models);
    _hintMissingModel(opts.listAreaId, opts.inputId, models);
    showToastForce('已拉取 '+models.length+' 个模型');
  }catch(e){
    if(job.cancelled) return;
    var msg = (e && e.name==='AbortError') ? '请求已取消' : ((e && e.message) || '未知错误');
    showToastForce('拉取失败: '+msg, 3000);
    _showModelPanelError(listArea, msg);
  }finally{
    if(job.timer) clearTimeout(job.timer);
    // 只有"自己仍是当前这次拉取"才负责还原按钮；被取消或被新请求取代的旧请求不能动按钮状态
    if(_modelFetchJobs[opts.listAreaId]===job){
      delete _modelFetchJobs[opts.listAreaId];
      if(btn){ btn.disabled = false; btn.innerHTML = _MODEL_BTN_IDLE_HTML; }
    }
  }
}

async function fetchModels(){
  const cfg=getCurApi();
  if(!cfg.url||!cfg.key){
    showToastForce('请先填写API地址和密钥');
    return;
  }
  await _runModelFetch({listAreaId:'modelListArea',inputId:'apiModel',btnId:'fetchModelsBtn',url:cfg.url,key:cfg.key});
}
async function fetchToolModels(){
  var urlEl=document.getElementById('toolApiUrl');
  var keyEl=document.getElementById('toolApiKey');
  var toolUrl=((urlEl&&urlEl.value)||'').trim();
  var toolKey=((keyEl&&keyEl.value)||'').trim();
  if(!toolUrl||!toolKey){
    var base=getCurApi();
    toolUrl=toolUrl||base.url;
    toolKey=toolKey||base.key;
  }
  if(!toolUrl||!toolKey){showToastForce('请填写工具API地址和密钥');return;}
  await _runModelFetch({listAreaId:'toolModelListArea',inputId:'toolApiModel',btnId:'fetchToolModelsBtn',url:toolUrl,key:toolKey});
}
// 测试API连接
async function testApiConnection(){
  const cfg = getCurApi();
  if(!cfg.url || !cfg.key){
    showToastForce('请先填写 API 地址和密钥');
    return;
  }
  const btn = document.getElementById('btnTestApi');
  btn.disabled = true;
  btn.textContent = '⏳ 测试中...';

  const ep = buildChatEndpoint(cfg.url);
  if(!ep.endpoint){
    showToast('API地址为空，请先在设置中配置');
    btn.disabled=false;
    btn.textContent='测试连接';
    return;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(()=>{
    try{controller.abort();}catch(e){}
  }, 60000);

  const _startMs = Date.now();

  try{
    // 第一步：连接 + 基础输出测试（max_tokens=10，验证模型真的能输出）
    const resp = await fetch(ep.endpoint,{
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        'Authorization':'Bearer '+cfg.key
      },
      body:JSON.stringify({
        model:cfg.model,
        messages:[
          {role:'system',content:'你是一个写作助手，只用中文回复。'},
          {role:'user',content:'请只回复"连接正常"四个字，不要任何其他内容。'}
        ],
        max_tokens:10,
        temperature:0
      }),
      signal:controller.signal
    });

    clearTimeout(timeoutId);
    const _ms = Date.now() - _startMs;
    const text = await resp.text().catch(()=> '');

    if(!resp.ok){
      let detail='';
      try{
        const j = JSON.parse(text);
        if(j && j.error && j.error.message) detail = j.error.message;
      }catch(e){}
      let friendly='';
      if(resp.status===401) friendly='认证失败（API密钥错误或没有权限）';
      else if(resp.status===404) friendly='接口路径不存在（API地址或路径可能写错）';
      else if(resp.status===429) friendly='请求太频繁或额度不足';
      else if(resp.status===400){
        friendly='请求参数错误';
        if(detail.toLowerCase().includes('model')) friendly+='（模型名称可能不正确）';
      }
      else if(resp.status>=500) friendly='服务器暂时出问题('+resp.status+')';
      else friendly='请求失败('+resp.status+')';
      if(detail) friendly+='：'+detail;
      showToastForce(''+friendly,5000);
      return;
    }

    // 解析模型实际输出
    let modelReply = '';
    try{
      const j = JSON.parse(text);
      if(j && j.choices && j.choices[0]){
        modelReply = (j.choices[0].message && j.choices[0].message.content)
          || (j.choices[0].delta && j.choices[0].delta.content)
          || '';
        modelReply = modelReply.trim().substring(0,30);
      }
    }catch(e){}

    // 质量判断
    const hasChinese = /[\u4e00-\u9fa5]/.test(modelReply);
    const isEmpty = modelReply.length === 0;
    const latencyLabel = _ms < 2000 ? '极快' : _ms < 5000 ? '正常' : '偏慢';

    if(isEmpty){
      // 有响应但输出为空——模型可能存在问题
      showToastForce('连接成功，但模型返回空内容，请确认模型名称是否正确（响应'+_ms+'ms）',5000);
    } else if(!hasChinese){
      // 输出了内容但不是中文——可能模型不支持中文
      showToastForce('连接成功，但模型回复非中文（"'+modelReply+'"），建议换用支持中文的模型（'+_ms+'ms）',6000);
    } else {
      // 完全正常
      showToastForce('测试通过！模型「'+cfg.model+'」响应正常 · 延迟'+_ms+'ms（'+latencyLabel+'）',4000);
      // 只有这一路才算真正测试通过：空内容/非中文都不触发。教程内部出错不能被外层 catch 误报成"测试失败"
      try{ tutOfferAfterApiTest(); }catch(e){ logError('tutOfferAfterApiTest', e); }
    }
    saveCurSettings();

  }catch(e){
    clearTimeout(timeoutId);
    if(e.name==='AbortError'){
      showToastForce('测试超时（60秒无响应），请检查API地址是否正确',5000);
    }else if(!navigator.onLine){
      showToastForce('网络似乎断开了，请检查网络连接',4000);
    }else{
      showToastForce('测试失败：'+e.message,4000);
    }
  }finally{
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-link"></i> 测试连接';
  }
}

let lastSaveTime=0;
let _dirtyKeys=new Set();
function markDirty(key){_dirtyKeys.add(key);}
function autoSaveAll(){
const now=Date.now();
if(now-lastSaveTime<2000)return;
lastSaveTime=now;
if(_dirtyKeys.size===0)return;
_dirtyKeys.forEach(k=>{
if(k===K.ws)sv(K.ws,ws);
else if(k===K.cols)sv(K.cols,cols);
else if(k===K.tags)sv(K.tags,tags);
else if(k===K.ap)sv(K.ap,ap);
else if(k==='bj_genLogs')sv('bj_genLogs',genLogs);
else if(k==='bj_crWorks')sv('bj_crWorks',crWorks);
else if(k==='bj_resPacks')sv('bj_resPacks',resPacks);
else if(k==='bj_stream')sv('bj_stream',useStream);
});
_dirtyKeys.clear();
}
function saveCurSettings(){
sv(K.curApi,getCurApi());
saveCharactersFromUI();
sv(K.curWorld,{
desc:document.getElementById('worldDesc').value,
minWords:parseInt(document.getElementById('minWords').value)||800
});
const styleEl=document.getElementById('styleDesc');
if(styleEl){ap.curStyle=styleEl.value;sv(K.ap,ap);}
useStream=document.getElementById('streamOn').checked;sv('bj_stream',useStream);
sv('bj_toolApi',{url:(document.getElementById('toolApiUrl').value||'').trim(),key:(document.getElementById('toolApiKey').value||'').trim(),model:(document.getElementById('toolApiModel').value||'').trim(),temp:(document.getElementById('toolApiTemp').value||'').trim(),maxTokens:(document.getElementById('toolApiMaxTokens').value||'').trim()});
}

// ==================== CHARACTER MANAGEMENT ====================
// 肖像只接受本应用自己生成的 data:image（jpeg/png/webp）。备份导入、预设切换带来的 portrait 字段来源不可控，
// 通过字符集校验后才允许当作图片地址使用，防止异常字符串混入页面
function isValidPortraitSrc(src){
if(typeof src!=='string'||src.length<30||src.length>2000000)return false;
return /^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+\/]+={0,2}$/.test(src);
}
// 各角色卡片当前是否翻到肖像面（按卡片序号记录，仅存内存：重绘时保持朝向，刷新页面后默认回到设定面）
let _charFlipped=[];
// 各角色卡片的性格标签栏是否展开（同样仅存内存，默认折叠）
let _charTraitOpen=[];
// 人物设定页搜索关键词（已转小写），三个页面共用
let _charSearchKw='';
// 折叠状态下只展示已选标签；一个都没选时给出淡色提示
function charTraitSummaryHtml(traits){
const list=Array.isArray(traits)?traits:[];
if(list.length===0)return '<span class="char-trait-none">未选择</span>';
return list.map(t=>'<span class="tag act">'+esc(String(t))+'</span>').join('');
}
// 背面右下角的人物名：与正面名称输入框同步，空名字时显示淡色占位
function setCharBackName(el,name){
const nm=(name||'').trim();
el.textContent=nm||'未命名';
el.classList.toggle('empty',!nm);
}
function renderCharCards(){
const wrap=document.getElementById('charCards');
if(!wrap)return;
wrap.innerHTML='';
if(_charFlipped.length>characters.length)_charFlipped.length=characters.length;
characters.forEach((c,i)=>{
const card=document.createElement('div');
const flipped=!!_charFlipped[i];
card.className='char-card'+(flipped?' flipped':'');
card.dataset.idx=i;
const traits=c.traits||[];
const defaultTraits=['内向','外向','冷静','冲动','善良','腹黑','傲娇','温柔','毒舌','天然呆'];
const allTraits=[...defaultTraits,...customTraits];
const curPri=c.priority||'普通';
const traitOpen=!!_charTraitOpen[i];
const traitBtnsHtml=allTraits.map(t=>
'<span class="tag'+(traits.includes(t)?' act':'')+'" style="font-size:10px;padding:3px 8px" onclick="toggleCharTrait('+i+',\''+t+'\',this)">'+t+'</span>'
).join('');
// 正反两面的操作区完全一致，保证翻转图标始终停在原位
const actsHtml=
(characters.length>1?'<button type="button" class="char-icon-btn char-del-btn" aria-label="删除角色'+(i+1)+'" title="删除" onclick="removeChar('+i+')"><i class="fas fa-trash-can"></i></button>':'')+
'<button type="button" class="char-icon-btn char-flip-btn" aria-label="翻转角色卡片" aria-pressed="'+(flipped?'true':'false')+'" title="翻转" onclick="toggleCharFlip('+i+')"><i class="fas fa-rotate"></i></button>';
card.innerHTML=
'<div class="char-card-inner">'+
'<div class="char-face char-front">'+
'<div class="char-card-hdr"><span>角色 '+(i+1)+'</span><div class="char-card-acts">'+actsHtml+'</div></div>'+
'<div class="fg"><label class="fl">名称</label><input class="fi char-name" data-idx="'+i+'" value="'+esc(c.name||'')+'" placeholder="角色名" oninput="saveCharactersFromUI()"></div>'+
'<div class="fg"><div class="char-trait-bar" role="button" tabindex="0" aria-expanded="'+(traitOpen?'true':'false')+'" aria-controls="traitWrap'+i+'" onclick="toggleCharTraitFold('+i+')" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();toggleCharTraitFold('+i+');}"><span class="fl" style="margin:0">性格标签（点击选择）</span><i class="fas fa-chevron-down char-trait-chev"></i></div>'+
'<div class="char-trait-sel fold-box fold-flex'+(traitOpen?'':' show')+'" id="traitSel'+i+'">'+charTraitSummaryHtml(traits)+'</div>'+
'<div class="fold-box fold-flex'+(traitOpen?' show':'')+'" style="flex-wrap:wrap;gap:4px;margin-top:4px" id="traitWrap'+i+'">'+
traitBtnsHtml+
'<span class="tag" style="font-size:10px;padding:3px 8px;border-style:dashed;color:var(--accent2)" onclick="addCustomTrait('+i+')">+ 自定义</span>'+
'</div></div>'+
'<div class="fg"><label class="fl">重要度</label>'+
'<div style="display:flex;gap:5px;margin-top:4px">'+
'<span class="tag'+(curPri==='核心'?' act':'')+'" onclick="setCharPriority('+i+',\'核心\',this)" style="font-size:10px;padding:3px 8px"><i class="fas fa-circle" style="font-size:7px;color:var(--danger)"></i> 核心</span>'+
'<span class="tag'+(curPri==='普通'?' act':'')+'" onclick="setCharPriority('+i+',\'普通\',this)" style="font-size:10px;padding:3px 8px"><i class="fas fa-circle" style="font-size:7px;color:#f0a030"></i> 普通</span>'+
'<span class="tag'+(curPri==='参考'?' act':'')+'" onclick="setCharPriority('+i+',\'参考\',this)" style="font-size:10px;padding:3px 8px"><i class="fas fa-circle" style="font-size:7px;color:var(--success)"></i> 参考</span>'+
'</div></div>'+
'<div class="fg char-desc-fg"><label class="fl">详细设定</label>'+
'<textarea class="fta char-desc" data-idx="'+i+'" placeholder="外貌、背景、说话方式、口头禅..." oninput="onCharDescInput('+i+',this)">'+esc(c.desc||'')+'</textarea>'+
'<div style="font-size:10px;color:var(--text2);text-align:right;margin-top:6px" id="charDescCount'+i+'">0/0</div>'+
'</div>'+
'</div>'+
'<div class="char-face char-back">'+
'<img class="char-portrait-img" alt="" hidden>'+
'<div class="char-back-hit" role="button" tabindex="0" aria-label="上传或更换肖像" onclick="uploadCharPortrait('+i+')" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();uploadCharPortrait('+i+');}"><span class="char-back-hint"><i class="fas fa-image"></i><span>点击上传肖像</span></span></div>'+
'<div class="char-back-acts">'+actsHtml+'</div>'+
'<button type="button" class="char-icon-btn char-portrait-clear" aria-label="移除肖像" title="移除肖像" onclick="clearCharPortrait('+i+')" hidden><i class="fas fa-xmark"></i></button>'+
'<div class="char-back-name" data-idx="'+i+'"></div>'+
'</div>'+
'</div>';
// 肖像和名字通过DOM属性写入而不是拼进HTML字符串，避免异常内容破坏结构
setCharBackName(card.querySelector('.char-back-name'),c.name);
if(isValidPortraitSrc(c.portrait)){
const img=card.querySelector('.char-portrait-img');
const hint=card.querySelector('.char-back-hint');
const clearBtn=card.querySelector('.char-portrait-clear');
img.onerror=function(){
img.hidden=true;hint.hidden=false;clearBtn.hidden=true;card.classList.remove('has-portrait');
};
img.alt=(c.name||('角色'+(i+1)))+'的肖像';
img.src=c.portrait;
img.hidden=false;
hint.hidden=true;
clearBtn.hidden=false;
card.classList.add('has-portrait');
}
wrap.appendChild(card);
});
applyCharSearchFilter();
// 渲染后刷新计数（按优先级自动上限）
setTimeout(()=>{
  characters.forEach((_,idx)=>updateCharDescCounter(idx));
},0);
}
// 展开/收起性格标签栏：只改当前卡片的DOM，不重绘整页，避免打断正在输入的内容
function toggleCharTraitFold(idx){
const c=characters[idx];
if(!c)return;
const open=!_charTraitOpen[idx];
const bar=document.querySelector('#charCards .char-trait-bar[aria-controls="traitWrap'+idx+'"]');
const wrap=document.getElementById('traitWrap'+idx);
const sel=document.getElementById('traitSel'+idx);
if(!bar||!wrap||!sel)return;
_charTraitOpen[idx]=open;
if(!open)sel.innerHTML=charTraitSummaryHtml(c.traits);
bar.setAttribute('aria-expanded',open?'true':'false');
// 全部标签与已选摘要此消彼长：一个展开的同时另一个收起，整体高度平滑过渡
foldSlide(wrap,open);
foldSlide(sel,!open);
}
// 翻转角色卡片：翻到肖像面时先收起键盘、把被拉长的输入框恢复默认高度，卡片才能回到 3:4
function toggleCharFlip(idx){
const card=document.querySelector('#charCards .char-card[data-idx="'+idx+'"]');
if(!card||!characters[idx])return;
const toFlipped=!card.classList.contains('flipped');
const flipBtns=card.querySelectorAll('.char-flip-btn');
// 动画期间禁用翻转按钮，避免连点把动画打断成半翻状态
flipBtns.forEach(b=>{b.disabled=true;});
if(toFlipped){
const ae=document.activeElement;
if(ae&&card.contains(ae)&&typeof ae.blur==='function')ae.blur();
card.querySelectorAll('textarea').forEach(t=>{t.style.height='';t.style.minHeight='';});
}
card.classList.toggle('flipped',toFlipped);
_charFlipped[idx]=toFlipped;
flipBtns.forEach(b=>{b.setAttribute('aria-pressed',toFlipped?'true':'false');});
setTimeout(()=>{
if(card.isConnected)flipBtns.forEach(b=>{b.disabled=false;});
},550);
}
// 移除角色肖像（带确认，避免误触后找不回）
function clearCharPortrait(idx){
const ch=characters[idx];
if(!ch||!ch.portrait)return;
showDlg('移除肖像','确定要移除「'+((ch.name||'').trim()||('角色'+(idx+1)))+'」的肖像吗？',()=>{
if(characters.indexOf(ch)===-1)return;
delete ch.portrait;
sv(K.curChars,characters);
renderCharCards();
showToast('肖像已移除');
},true);
}
// ==================== 人物关系图 ====================
let charRelations=ld('bj_charRelations',[]);
let currentRelType='';
let currentRelDir='双向';
let editingRelIdx=-1;
let npcList=ld('bj_npcList',[]);
let editingNpcIdx=-1;
let currentNpcRole='';

// 关系类型对应的CSS类
function getRelTypeClass(type){
const map={'恋人':'love','暗恋':'love','朋友':'friend','青梅竹马':'friend','敌对':'enemy','宿敌':'enemy','亲属':'family','师徒':'master','主仆':'master','同事':'colleague'};
return map[type]||'other';
}

// 渲染关系列表
function renderRelList(){
const container=document.getElementById('relList');
if(!container)return;
if(charRelations.length===0){
container.innerHTML='<div class="rel-empty">还没有人物关系<br>添加角色后点击「添加关系」建立联系</div>';
applyCharSearchFilter();
return;
}
container.innerHTML='';
charRelations.forEach((rel,i)=>{
const item=document.createElement('div');
item.className='rel-item';
item.dataset.idx=i;
const typeClass=getRelTypeClass(rel.type);
const dirSymbol=rel.direction==='A→B'?'→':rel.direction==='B→A'?'←':'↔';
// 描述放在第二行，第一行只留名字和关系类型，给右侧操作图标让出空间
item.innerHTML=
'<div class="rel-item-main">'+
'<div class="rel-item-top">'+
'<div class="rel-item-names">'+
'<span class="rel-item-name">'+esc(rel.charA||'?')+'</span>'+
'<span class="rel-item-arrow">'+dirSymbol+'</span>'+
'<span class="rel-item-name">'+esc(rel.charB||'?')+'</span>'+
'</div>'+
'<span class="rel-item-type rel-type-'+typeClass+'">'+esc(rel.type||'未知')+'</span>'+
'</div>'+
(rel.desc?'<div class="rel-item-desc" title="'+esc(rel.desc)+'">'+esc(rel.desc)+'</div>':'')+
'</div>'+
'<div class="rel-item-acts">'+
'<button type="button" class="char-icon-btn" aria-label="编辑关系" title="编辑" onclick="editRelation('+i+')"><i class="fas fa-pencil"></i></button>'+
'<button type="button" class="char-icon-btn char-del-btn" aria-label="删除关系" title="删除" onclick="deleteRelation('+i+')"><i class="fas fa-times"></i></button>'+
'</div>';
container.appendChild(item);
});
applyCharSearchFilter();
}

// 获取所有角色名（主角+NPC）
function getAllCharNames(){
const names=[];
characters.forEach(c=>{if(c.name)names.push(c.name);});
npcList.forEach(n=>{if(n.name)names.push(n.name);});
return names;
}

// 填充角色下拉框
function fillRelCharSelects(){
  var charNames=characters.filter(c=>c.name).map(c=>c.name);
  var npcNames=(npcList||[]).filter(n=>n.name).map(n=>n.name);
  ['relCharA','relCharB'].forEach(function(id){
    var drop=document.getElementById(id+'Drop');
    if(!drop)return;
    drop.innerHTML='<div onclick="setRelChar(\''+id+'\',\'\')" style="padding:10px 14px;cursor:pointer;font-size:13px;color:var(--text2)">-- 请选择 --</div>';
    function appendItem(name){
      var item=document.createElement('div');
      item.style.cssText='padding:10px 14px;cursor:pointer;font-size:13px;color:var(--text);border-top:1px solid var(--border);';
      item.textContent=name;
      item.onclick=function(){setRelChar(id,name);};
      var _touchStartY=0;
      item.addEventListener('touchstart',function(e){
        _touchStartY=e.touches[0].clientY;
      },{passive:true});
      item.addEventListener('touchend',function(e){
        if(Math.abs(e.changedTouches[0].clientY-_touchStartY)<8){
          e.preventDefault();
          setRelChar(id,name);
        }
      });
      drop.appendChild(item);
    }
    function appendSection(label){
      var sec=document.createElement('div');
      sec.style.cssText='padding:4px 14px;font-size:11px;font-weight:700;color:var(--text2);letter-spacing:.5px;background:rgba(108,92,231,.08);';
      sec.textContent=label;
      drop.appendChild(sec);
    }
    if(charNames.length===0&&npcNames.length===0){
      var empty=document.createElement('div');
      empty.style.cssText='padding:10px 14px;font-size:13px;color:var(--text2);text-align:center;';
      empty.textContent='暂无角色，请先添加角色或NPC';
      drop.appendChild(empty);
      return;
    }
    if(charNames.length>0){
      appendSection('── 主要角色 ──');
      charNames.forEach(appendItem);
    }
    if(npcNames.length>0){
      appendSection('── NPC / 配角 ──');
      npcNames.forEach(appendItem);
    }
  });
}
function setRelChar(id,name){
  document.getElementById(id).value=name;
  var textEl=document.getElementById(id+'Text');
  if(textEl){textEl.textContent=name||(id==='relCharA'?'请选择人物 A':'请选择人物 B');textEl.style.color=name?'var(--text)':'var(--text2)';}
  var drop=document.getElementById(id+'Drop');
  if(drop)drop.style.display='none';
}
function toggleCustomSelect(id){
  var dropA=document.getElementById('relCharADrop');
  var dropB=document.getElementById('relCharBDrop');
  var drop=document.getElementById(id+'Drop');
  if(!drop)return;
  var isOpen=drop.style.display!=='none';
  if(dropA)dropA.style.display='none';
  if(dropB)dropB.style.display='none';
  drop.style.display=isOpen?'none':'block';
}

function addRelation(){
clearCharSearch();
editingRelIdx=-1;
document.getElementById('addRelTitle').textContent='添加人物关系';
fillRelCharSelects();
document.getElementById('relCharA').value='';
document.getElementById('relCharB').value='';
var tA=document.getElementById('relCharAText');if(tA){tA.textContent='请选择人物 A';tA.style.color='var(--text2)';}
var tB=document.getElementById('relCharBText');if(tB){tB.textContent='请选择人物 B';tB.style.color='var(--text2)';}
document.getElementById('relTypeCustom').value='';
document.getElementById('relDesc').value='';
currentRelType='';
currentRelDir='双向';
document.querySelectorAll('#addRelOv .tag').forEach(t=>t.classList.remove('act'));
document.getElementById('relDirBoth').classList.add('act');
document.getElementById('addRelBtn').textContent='保存';
document.getElementById('addRelOv').classList.add('show');
navPush('addRelOv');
}

function editRelation(idx){
if(idx<0||idx>=charRelations.length)return;
editingRelIdx=idx;
const rel=charRelations[idx];
document.getElementById('addRelTitle').textContent='编辑人物关系';
fillRelCharSelects();
document.getElementById('relCharA').value=rel.charA||'';
document.getElementById('relCharB').value=rel.charB||'';
var tA2=document.getElementById('relCharAText');if(tA2){tA2.textContent=rel.charA||'请选择人物 A';tA2.style.color=rel.charA?'var(--text)':'var(--text2)';}
var tB2=document.getElementById('relCharBText');if(tB2){tB2.textContent=rel.charB||'请选择人物 B';tB2.style.color=rel.charB?'var(--text)':'var(--text2)';}
document.getElementById('relTypeCustom').value='';
document.getElementById('relDesc').value=rel.desc||'';
currentRelType=rel.type||'';
currentRelDir=rel.direction||'双向';
// 高亮对应的关系类型标签
document.querySelectorAll('#addRelOv .tag[data-rel]').forEach(t=>{
t.classList.toggle('act',t.dataset.rel===rel.type);
});
// 高亮方向
document.getElementById('relDirBoth').classList.toggle('act',currentRelDir==='双向');
document.getElementById('relDirAB').classList.toggle('act',currentRelDir==='A→B');
document.getElementById('relDirBA').classList.toggle('act',currentRelDir==='B→A');
document.getElementById('addRelBtn').textContent='更新';
document.getElementById('addRelOv').classList.add('show');
navPush('addRelOv');
}

function closeAddRel(){
  navPop('addRelOv');
document.getElementById('addRelOv').classList.remove('show');
editingRelIdx=-1;
}

function setRelType(type,el){
currentRelType=type;
document.getElementById('relTypeCustom').value='';
document.querySelectorAll('#addRelOv .tag[data-rel]').forEach(t=>t.classList.remove('act'));
el.classList.add('act');
}

function setRelDir(dir,el){
currentRelDir=dir;
document.getElementById('relDirBoth').classList.remove('act');
document.getElementById('relDirAB').classList.remove('act');
document.getElementById('relDirBA').classList.remove('act');
el.classList.add('act');
}

function saveRel(){
const charA=document.getElementById('relCharA').value;
const charB=document.getElementById('relCharB').value;
const customType=document.getElementById('relTypeCustom').value.trim();
const type=customType||currentRelType;
const desc=document.getElementById('relDesc').value.trim();
if(!charA||!charB){showToast('请选择两个人物');return;}
if(charA===charB){showToast('不能选择同一个人物');return;}
if(!type){showToast('请选择或输入关系类型');return;}
const rel={charA,charB,type,direction:currentRelDir,desc};
if(editingRelIdx>=0&&editingRelIdx<charRelations.length){
charRelations[editingRelIdx]=rel;
showToast('关系已更新');
}else{
charRelations.push(rel);
showToast('关系已添加');
}
sv('bj_charRelations',charRelations);
closeAddRel();
renderRelList();
}

function deleteRelation(idx){
if(idx<0||idx>=charRelations.length)return;
const rel=charRelations[idx];
showDlg('删除关系','确定要删除 '+rel.charA+' 和 '+rel.charB+' 的关系吗？',()=>{
charRelations.splice(idx,1);
sv('bj_charRelations',charRelations);
renderRelList();
showToast('关系已删除');
},true);
}

// AI生成人物关系
async function aiGenRelations(){
const cfg=getCurApi();
if(!cfg.url||!cfg.key){showToast('请先配置API');return;}
const names=getAllCharNames();
if(names.length<2){showToast('至少需要2个角色（主角或NPC）才能生成关系');return;}
showToast('AI正在分析人物关系...',3000);
let charInfo='';
characters.forEach(c=>{
if(c.name){
charInfo+=c.name;
if(c.traits&&c.traits.length>0)charInfo+='（'+c.traits.join('、')+'）';
if(c.desc)charInfo+='：'+c.desc.substring(0,80);
charInfo+='\n';
}
});
npcList.forEach(n=>{
if(n.name){
charInfo+=n.name+'[NPC-'+n.role+']';
if(n.desc)charInfo+='：'+n.desc.substring(0,60);
charInfo+='\n';
}
});
const sysMsg='根据角色设定，分析所有人物之间可能的关系，包括主角之间、主角与配角(NPC)之间、配角(NPC)与配角(NPC)之间的关系，形成完整的关系网。\n输出格式（每行一条）：\n人物A|人物B|关系类型|方向(双向/A→B/B→A)|简短描述\n\n关系类型可选：恋人、暗恋、朋友、青梅竹马、敌对、宿敌、亲属、师徒、主仆、同事、上下级、竞争对手、邻居、陌生人\n尽可能为每对有交集的人物都建立关系，不要遗漏配角之间的关系。\n只输出关系列表，不要其他内容。';
const userMsg='请分析以下所有角色之间的关系（包括配角与配角之间），构建完整关系网：\n\n'+charInfo;
const result=await callToolAPINonStream([{role:'system',content:sysMsg},{role:'user',content:userMsg}]);
if(!result){showToast('生成失败');return;}
const lines=result.split('\n').filter(l=>l.includes('|'));
let addCount=0;
lines.forEach(line=>{
const parts=line.split('|').map(p=>p.trim());
if(parts.length>=3){
const exists=charRelations.some(r=>
(r.charA===parts[0]&&r.charB===parts[1])||(r.charA===parts[1]&&r.charB===parts[0])
);
if(!exists){
charRelations.push({
charA:parts[0],charB:parts[1],
type:parts[2],
direction:parts[3]||'双向',
desc:parts[4]||''
});
addCount++;
}
}
});
sv('bj_charRelations',charRelations);
renderRelList();
showToast('AI生成了'+addCount+'条关系');
}

// ==================== NPC设定 ====================
// NPC编辑弹窗里暂存的肖像：点“保存”才写入NPC，点取消/关闭则丢弃
let _npcPendingPortrait='';
function refreshNpcPortraitPreview(){
const img=document.getElementById('npcPortraitPreview');
const hint=document.getElementById('npcPortraitHint');
const clearBtn=document.getElementById('npcPortraitClear');
if(!img||!hint||!clearBtn)return;
if(isValidPortraitSrc(_npcPendingPortrait)){
img.src=_npcPendingPortrait;
img.hidden=false;
hint.hidden=true;
clearBtn.hidden=false;
}else{
img.removeAttribute('src');
img.hidden=true;
hint.hidden=false;
clearBtn.hidden=true;
}
}
function clearNpcPortrait(){
_npcPendingPortrait='';
refreshNpcPortraitPreview();
}
function renderNpcCards(){
const container=document.getElementById('npcCards');
if(!container)return;
if(npcList.length===0){
container.innerHTML='<div class="rel-empty">还没有NPC<br>点击上方按钮添加配角和路人</div>';
applyCharSearchFilter();
return;
}
container.innerHTML='';
npcList.forEach((npc,i)=>{
const card=document.createElement('div');
card.className='npc-card';
card.dataset.idx=i;
const traitsHtml=(npc.traits||[]).map(t=>'<span style="font-size:9px;padding:2px 6px;border-radius:6px;background:rgba(81,207,102,.1);color:var(--success)">'+esc(t)+'</span>').join(' ');
const initial=esc((npc.name||'').trim().substring(0,1)||'?');
card.innerHTML=
'<div class="npc-card-row">'+
'<div class="npc-thumb"><span class="npc-thumb-ph">'+initial+'</span></div>'+
'<div class="npc-card-main">'+
'<div class="npc-card-top">'+
'<span class="npc-card-name">'+esc(npc.name||'未命名')+'</span>'+
'<div class="npc-card-acts">'+
'<button type="button" class="char-icon-btn" aria-label="编辑NPC" title="编辑" onclick="editNpc('+i+')"><i class="fas fa-pencil"></i></button>'+
'<button type="button" class="char-icon-btn char-del-btn" aria-label="删除NPC" title="删除" onclick="deleteNpc('+i+')"><i class="fas fa-trash-can"></i></button>'+
'</div>'+
'</div>'+
'<div><span class="npc-badge" style="margin-left:0">'+esc(npc.role||'NPC')+'</span></div>'+
(traitsHtml?'<div style="display:flex;flex-wrap:wrap;gap:3px">'+traitsHtml+'</div>':'')+
'</div>'+
'</div>';
if(isValidPortraitSrc(npc.portrait)){
const thumb=card.querySelector('.npc-thumb');
const ph=thumb.querySelector('.npc-thumb-ph');
const img=document.createElement('img');
img.alt=(npc.name||'NPC')+'的肖像';
// 图片损坏时退回首字占位，不留空白缩略图
img.onerror=function(){img.remove();ph.hidden=false;};
img.src=npc.portrait;
ph.hidden=true;
thumb.appendChild(img);
}
container.appendChild(card);
});
applyCharSearchFilter();
}

// ==================== 万能输入框 ====================
async function doUniversalCharInput(){
  var inputEl = document.getElementById('univCharInput');
  var resultEl = document.getElementById('univCharResult');
  var btn = document.getElementById('univCharBtn');
  var text = (inputEl.value||'').trim();
  if(!text){showToast('请先输入一些角色信息');return;}

  var cfg = getCurApi();
  if(!cfg.url||!cfg.key){showToast('请先在API设置中配置接口');return;}

  btn.disabled=true;
  btn.innerHTML='<i class="fas fa-spinner fa-spin"></i> 识别中...';
  resultEl.style.display='none';

  // 构建当前角色/NPC信息上下文
  var charContext='';
  var validChars=(characters||[]).filter(function(c){return c.name;});
  if(validChars.length>0){
    charContext+='【现有主角/角色】\n';
    validChars.forEach(function(c,i){
      charContext+='  '+i+'# '+c.name+'（'+( c.priority||'普通')+'）\n';
    });
    charContext+='\n';
  }
  var validNpcs=(npcList||[]).filter(function(n){return n.name;});
  if(validNpcs.length>0){
    charContext+='【现有NPC/配角】\n';
    validNpcs.forEach(function(n,i){
      charContext+='  '+i+'# '+n.name+'（'+( n.role||'NPC')+'）\n';
    });
    charContext+='\n';
  }

  var sysPrompt='你是小说人物设定助手。用户输入关于角色的任意描述，请逐字段完整识别并分类，不得简写或截断用户内容。\n\n'+
    '主角/角色字段：name(名字), priority(重要度：核心/普通/参考), traits(性格标签，逗号分隔), desc(完整人物设定，包括背景、动机、性格细节)\n'+
    'NPC/配角字段：name(名字), role(定位：配角/路人/反派/重要配角), traits(性格标签), appearance(完整外貌描写), desc(完整背景故事和关系), chapter(出场章节)\n\n'+
    '输出格式：只返回JSON，不输出任何其他文字。格式如下：\n'+
    '{"actions":[{"target":"char","name":"角色名","isNew":true,"field":"字段名","value":"完整内容"}],"summary":"一句话说明做了什么"}\n\n'+
    '规则：\n'+
    '- value必须完整，不得简写、省略或用省略号替代\n'+
    '- 如果用户描述的是新角色（现有列表里没有的名字），isNew=true，target优先选npc（除非用户明确说是主角）\n'+
    '- traits字段value是逗号分隔的性格词，如"冷漠,话少,内心温柔"\n'+
    '- 一次输入可以产生多个action（同一角色的多个字段各拆成独立action）\n'+
    '- 所有action均为直接覆盖写入，不追加到旧内容\n'+
    '- 如果输入信息模糊无法分类，summary说明原因，actions为空数组';

  var userMsg=charContext?'当前角色列表：\n'+charContext+'\n用户输入：'+text:'用户输入：'+text;

  try{
    var raw=await callAPINonStream([{role:'system',content:sysPrompt},{role:'user',content:userMsg}],1);
    raw=_extractJsonStr(stripMetaThinking(raw));

    var parsed;
    try{ parsed=JSON.parse(raw); }
    catch(e){ throw new Error('AI返回格式解析失败：'+raw.substring(0,100)); }

    if(!parsed.actions||!Array.isArray(parsed.actions)){
      throw new Error('AI返回结构异常');
    }

    if(parsed.actions.length===0){
      resultEl.innerHTML='<div style="color:var(--text2);padding:6px 10px;background:var(--card);border-radius:8px"><i class="fas fa-triangle-exclamation"></i> '+esc(parsed.summary||'未能识别出可填写的字段')+'</div>';
      resultEl.style.display='block';
      btn.disabled=false;btn.innerHTML='<i class="fas fa-robot"></i> AI智能填入';
      return;
    }

    // 按实体收集字段，去重显示
    var entityFields={};
    parsed.actions.forEach(function(action){
      if(!action.name||!action.field||action.value===undefined||String(action.value).trim()==='') return;
      var fieldLabel=_siFieldLabel(action.field);

      if(action.target==='char'){
        var idx=validChars.findIndex(function(c){return c.name===action.name;});
        if(idx===-1&&action.isNew){
          characters.push({name:action.name,desc:'',traits:[],priority:'普通'});
          saveCharactersFromUI();
          validChars=characters.filter(function(c){return c.name;});
          idx=validChars.length-1;
        }
        if(idx===-1){
          idx=characters.findIndex(function(c){return c.name&&action.name&&c.name.indexOf(action.name)!==-1;});
        }
        if(idx>=0&&characters[idx]){
          var ch=characters[idx];
          if(action.field==='name') ch.name=action.value;
          else if(action.field==='priority') ch.priority=action.value;
          else if(action.field==='traits') ch.traits=String(action.value).split(/[,，、\s]+/).filter(function(t){return t;});
          else if(action.field==='desc') ch.desc=action.value;
          sv(K.curChars,characters);
          var eKey='char:'+ch.name;
          _siTrackEntity(entityFields,eKey,fieldLabel,'<i class="fas fa-user"></i>','角色「'+ch.name+'」','');
        } else {
          var wKey='warn:'+action.name+Date.now();
          entityFields[wKey]={icon:'<i class="fas fa-triangle-exclamation"></i>',label:'未找到角色「'+action.name+'」',fields:[],suffix:''};
        }
      } else {
        var nidx=npcList.findIndex(function(n){return n.name===action.name;});
        if(nidx===-1&&action.isNew){
          var newNpc={id:uid(),name:action.name,role:action.role||'配角',traits:[],appearance:'',desc:'',chapter:''};
          npcList.push(newNpc);
          nidx=npcList.length-1;
        }
        if(nidx===-1){
          nidx=npcList.findIndex(function(n){return n.name&&action.name&&n.name.indexOf(action.name)!==-1;});
        }
        if(nidx>=0&&npcList[nidx]){
          var npc=npcList[nidx];
          if(action.field==='name') npc.name=action.value;
          else if(action.field==='role') npc.role=action.value;
          else if(action.field==='traits') npc.traits=String(action.value).split(/[,，、\s]+/).filter(function(t){return t;});
          else if(action.field==='appearance') npc.appearance=action.value;
          else if(action.field==='desc') npc.desc=action.value;
          else if(action.field==='chapter') npc.chapter=action.value;
          sv('bj_npcList',npcList);
          var nKey='npc:'+npc.name;
          _siTrackEntity(entityFields,nKey,fieldLabel,'<i class="fas fa-theater-masks"></i>','NPC「'+npc.name+'」','');
        } else {
          var wKey2='warn:'+action.name+Date.now();
          entityFields[wKey2]={icon:'<i class="fas fa-triangle-exclamation"></i>',label:'未找到NPC「'+action.name+'」',fields:[],suffix:''};
        }
      }
    });

    // 刷新UI
    renderCharCards();
    renderNpcCards();

    var summaryHtml='<div style="background:rgba(81,207,102,.08);border:1px solid rgba(81,207,102,.3);border-radius:10px;padding:10px 12px">';
    summaryHtml+='<div style="font-size:12px;font-weight:600;color:var(--success);margin-bottom:6px"><i class="fas fa-check-circle"></i> '+esc(parsed.summary||'完成')+'</div>';
    Object.keys(entityFields).forEach(function(k){
      var e=entityFields[k];
      var fieldsStr=e.fields.length>0?'（'+e.fields.join('、')+'）':'';
      summaryHtml+='<div style="font-size:11px;color:var(--text2);margin-top:3px">'+e.icon+' '+esc(e.label+fieldsStr+e.suffix)+' 已更新</div>';
    });
    summaryHtml+='</div>';
    resultEl.innerHTML=summaryHtml;
    resultEl.style.display='block';
    inputEl.value='';
    showToast('万能框：'+( parsed.summary||'已填入'));

  }catch(e){
    resultEl.innerHTML='<div style="color:var(--danger);font-size:11px;padding:8px 10px;background:rgba(255,107,107,.08);border-radius:8px"><i class="fas fa-circle-xmark"></i> '+esc(e.message||'识别失败')+'</div>';
    resultEl.style.display='block';
    showToast('识别失败：'+e.message,3000);
  }
  btn.disabled=false;
  btn.innerHTML='<i class="fas fa-robot"></i> AI智能填入';
}
// ==================== 万能输入框 END ====================
function openDwModal(){
  _dwTriggered={};
  var ov=document.getElementById('dwModalOv');
  if(ov) ov.classList.add('show');
  navPush('dwModalOv');
  var dl=document.getElementById('dwDateLabel');
  if(dl){var _d=new Date();dl.textContent=_d.getFullYear()+'年'+(_d.getMonth()+1)+'月'+_d.getDate()+'日';}
  var todayKey='dw_prompt_'+_dwTodayStr();
  var saved=ld(todayKey,'');
  if(!saved){ var _pool=_getDwAllPrompts(); saved=_pool[Math.floor(Math.random()*_pool.length)]; sv(todayKey,saved); }
  var pt=document.getElementById('dwPromptText');
  if(pt) pt.textContent=saved;
  var ta=document.getElementById('dwTextarea');
  if(ta){ ta.value=ld('dw_draft_'+_dwTodayStr(),''); dwCheckMilestone(ta); }
  switchDwTab('write');
}
function closeDwModal(){
  navPop('dwModalOv');
  var ov=document.getElementById('dwModalOv');
  if(ov) ov.classList.remove('show');
  var ta=document.getElementById('dwTextarea');
  if(ta&&ta.value.trim()) sv('dw_draft_'+_dwTodayStr(),ta.value);
}
function switchDwTab(tab){
  _dwCurrentTab=tab;
  var pw=document.getElementById('dwPanelWrite');
  var pl=document.getElementById('dwPanelLib');
  var tw=document.getElementById('dwTabWrite');
  var tl=document.getElementById('dwTabLib');
  if(tab==='write'){
    if(pw) pw.style.display='block';
    if(pl) pl.style.display='none';
    if(tw){ tw.style.background='var(--card)'; tw.style.color='var(--text)'; tw.style.fontWeight='600'; }
    if(tl){ tl.style.background='transparent'; tl.style.color='var(--text2)'; tl.style.fontWeight='400'; }
  } else {
    if(pw) pw.style.display='none';
    if(pl) pl.style.display='flex';
    if(tw){ tw.style.background='transparent'; tw.style.color='var(--text2)'; tw.style.fontWeight='400'; }
    if(tl){ tl.style.background='var(--card)'; tl.style.color='var(--text)'; tl.style.fontWeight='600'; }
    _renderDwLib();
  }
}
function _dwTodayStr(){
  var d=new Date();
  return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();
}
function refreshDwPrompt(){
  var pt=document.getElementById('dwPromptText');
  if(!pt) return;
  var cur=pt.textContent;
  var pool=_getDwAllPrompts().filter(function(p){return p!==cur;});
  var next=pool[Math.floor(Math.random()*pool.length)];
  pt.textContent=next;
  sv('dw_prompt_'+_dwTodayStr(),next);
}
// 字数里程碑
var _dwCurrentTab='write'; var _dwMilestones=[100,300,500,1000];
var _dwTriggered={};
function dwCheckMilestone(ta){
  var len=(ta.value||'').length;
  var wc=document.getElementById('dwWordCount');
  if(wc) wc.textContent=len+'字';
  var hint=document.getElementById('dwMilestoneHint');
  if(!hint) return;
  var msgs={100:'已经100字了！继续～',300:'300字，写得不错！',500:'500字！可以存为草稿了',1000:'1000字！这可以变成一篇完整的故事！'};
  for(var m of _dwMilestones){
    if(len>=m&&!_dwTriggered[m]){
      _dwTriggered[m]=true;
      hint.textContent=msgs[m]||'';
      hint.style.display='block';
      try{if(navigator.vibrate) navigator.vibrate([30,20,30]);}catch(e){}
      setTimeout(function(){ hint.style.display='none'; },3000);
      break;
    }
  }
}
// AI帮我开个头
var _dwAiStartCancelled=false;
async function dwAiStartWrite(){
  var cfg=getCurApi();
  if(!cfg.url||!cfg.key){showToast('请先配置API');return;}
  var pt=document.getElementById('dwPromptText');
  var prompt=(pt?pt.textContent||'':'').trim()||'随意发挥';
  var btn=document.getElementById('dwAiStartBtn');
  _dwAiStartCancelled=false;
  if(btn){
    btn.disabled=false;
    btn.style.background='var(--danger)';
    btn.innerHTML='<i class="fas fa-stop-circle"></i> 点击中断';
    btn.onclick=function(){
      _dwAiStartCancelled=true;
      btn.disabled=true;
      btn.innerHTML='<i class="fas fa-spinner fa-spin"></i> 中断中...';
    };
  }
  try{
    var sys='你是一位有独特视角的小说家。根据用户提供的一句灵感提示，写出一段让人想继续读下去的小说开头。\n\n【要求】\n- 字数严格控制在100-150字，不多不少\n- 直接切入人物动作或具体场景，禁止用"清晨的阳光""夜幕降临"这类套路开场\n- 不直说人物情绪，用身体反应和细节暗示\n- 禁用词：不禁、缓缓、淡淡、微微、默默\n\n【输出铁律】\n- 第一个字就是正文内容，不加任何开场白\n- 禁止以"好的""让我""这是"开头\n- 禁止在正文后附加任何说明';
    var raw=await callAPINonStream([{role:'system',content:sys},{role:'user',content:'灵感提示：'+prompt}],1);
    if(!_dwAiStartCancelled&&raw){
      raw=stripMetaThinking(raw).trim();
      var ta=document.getElementById('dwTextarea');
      if(ta){
        ta.value=(ta.value?ta.value+'\n\n':'')+raw;
        dwCheckMilestone(ta);
        ta.focus();
        ta.scrollTop=ta.scrollHeight;
      }
      showToast('开头已生成，接着续写吧');
    }else if(_dwAiStartCancelled){
      showToast('已中断生成');
    }
  }catch(e){if(!_dwAiStartCancelled)showToast('生成失败：'+(e.message||''),2500);}
  _dwAiStartCancelled=false;
  if(btn){
    btn.disabled=false;
    btn.style.background='var(--accent)';
    btn.innerHTML='<i class="fas fa-robot"></i> AI帮我开个头';
    btn.onclick=dwAiStartWrite;
  }
}
// 发展成长篇
var _dwExpandCancelled=false;
async function dwExpandToStory(){
  var cfg=getCurApi();
  if(!cfg.url||!cfg.key){showToast('请先配置API');return;}
  var ta=document.getElementById('dwTextarea');
  var text=(ta?ta.value||'':'').trim();
  if(!text){showToast('请先写点内容');return;}
  var btn=document.getElementById('dwExpandBtn');
  _dwExpandCancelled=false;
  if(btn){
    btn.disabled=false;
    btn.style.background='rgba(255,107,107,.15)';
    btn.style.color='var(--danger)';
    btn.style.borderColor='rgba(255,107,107,.4)';
    btn.innerHTML='<i class="fas fa-stop-circle"></i> 点击中断';
    btn.onclick=function(){
      _dwExpandCancelled=true;
      btn.disabled=true;
      btn.innerHTML='<i class="fas fa-spinner fa-spin"></i> 中断中...';
    };
  }
  try{
    var sys='你是一位擅长故事结构的策划编辑。根据用户提供的任意长度的灵感或草稿，生成一份可以直接落笔的创作方案。\n\n【必须输出以下内容】\n1. 故事标题（有则优化，无则起一个）\n2. 核心冲突（一句话：谁 vs 谁/什么，为了什么，障碍是什么）\n3. 三幕结构大纲（每幕2-3句，重点写每幕末尾的转折点）\n4. 建议篇幅（短篇一发/长篇连载）及一句理由\n\n【输出规范】\n- 用自然中文输出，不要markdown符号\n- 用1. 2. 3.数字编号\n- 第一个字就是内容，禁止以"好的/让我/分析一下"等开头\n- 输出结束就结束，不加客套结尾';
    var raw=await callAPINonStream([{role:'system',content:sys},{role:'user',content:'我的灵感草稿：\n\n'+text}],1);
    if(!_dwExpandCancelled&&raw){
      raw=stripMetaThinking(raw).trim();
      showStuckResult('发展方案\n\n'+raw);
    }else if(_dwExpandCancelled){
      showToast('已中断生成');
    }
  }catch(e){if(!_dwExpandCancelled)showToast('生成失败：'+(e.message||''),2500);}
  _dwExpandCancelled=false;
  if(btn){
    btn.disabled=false;
    btn.style.background='transparent';
    btn.style.color='var(--text2)';
    btn.style.borderColor='var(--border)';
    btn.innerHTML='<i class="fas fa-expand-alt"></i> 发展成长篇';
    btn.onclick=dwExpandToStory;
  }
}
function saveDwEntry(){
  var ta=document.getElementById('dwTextarea');
  var text=(ta?ta.value||'':'').trim();
  if(!text){showToast('请先写点什么');return;}
  var entries=ld('dw_entries',[]);
  var today=_dwTodayStr();
  var existing=entries.findIndex(function(e){return e.date===today;});
  var prompt=document.getElementById('dwPromptText')?document.getElementById('dwPromptText').textContent:'';
  var entry={date:today,text:text,prompt:prompt,time:new Date().toISOString()};
  if(existing>=0) entries[existing]=entry; else entries.unshift(entry);
  if(entries.length>60) entries=entries.slice(0,60);
  sv('dw_entries',entries);
  sv('dw_draft_'+today,text);
  sv('bj_dwLastSeen',today);
  _dwTriggered={};
  showToast('已保存今日记录');
}
function dwCreateArticle(){
  var ta=document.getElementById('dwTextarea');
  var text=(ta?ta.value||'':'').trim();
  if(!text){showToast('请先写点什么');return;}
  try{
    var title='今日一写·'+_dwTodayStr();
    var id=uid();
    var article={id:id,title:title,type:'short',content:text,createdAt:Date.now(),updatedAt:Date.now()};
    if(!ws) ws=[];
    ws.push(article);
    sv(K.ws,ws);
    closeDwModal();
    showToast('已存为草稿：'+title);
  }catch(e){showToast('创建失败：'+(e.message||''));}
}
// 灵感库
function _renderDwLib(){
  var entries=ld('dw_entries',[]);
  var list=document.getElementById('dwLibList');
  if(!list) return;
  if(!entries.length){
    list.innerHTML='<div style="text-align:center;padding:40px 0;color:var(--text2);font-size:13px"><i class="fas fa-feather-alt" style="font-size:28px;opacity:.3;display:block;margin-bottom:10px"></i>还没有记录<br><span style="font-size:11px">去「写作」标签开始今日一写吧</span></div>';
    return;
  }
  list.innerHTML=entries.map(function(e,i){
    var wc=e.text?e.text.length:0;
    return '<div style="background:var(--card);border-radius:12px;padding:12px 14px;border:1px solid var(--border)">'
      +'<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">'
      +'<span style="font-size:11px;font-weight:700;color:var(--accent2)">'+esc(e.date)+'</span>'
      +'<span style="font-size:10px;color:var(--text2)">'+wc+'字</span>'
      +'</div>'
      +(e.prompt?'<div style="font-size:10px;color:var(--accent2);margin-bottom:6px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"><i class="fas fa-wand-magic-sparkles"></i> '+esc(e.prompt)+'</div>':'')
      +'<div style="font-size:12px;line-height:1.8;color:var(--text);overflow:hidden;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical">'+esc(e.text)+'</div>'
      +'<div style="display:flex;gap:6px;margin-top:10px">'
      +'<button onclick="dwLibLoad('+i+')" style="flex:1;padding:7px;border-radius:8px;border:1px solid var(--border);background:transparent;color:var(--text2);font-size:11px;cursor:pointer">载入编辑</button>'
      +'<button onclick="dwLibDelete('+i+')" style="padding:7px 12px;border-radius:8px;border:1px solid rgba(255,107,107,.3);background:transparent;color:var(--danger);font-size:11px;cursor:pointer">删除</button>'
      +'</div>'
      +'</div>';
  }).join('');
}
function dwLibLoad(idx){
  var entries=ld('dw_entries',[]);
  var entry=entries[idx];
  if(!entry) return;
  var ta=document.getElementById('dwTextarea');
  if(ta){ta.value=entry.text; dwCheckMilestone(ta); sv('dw_draft_'+_dwTodayStr(),entry.text);}
  var pt=document.getElementById('dwPromptText');
  if(pt&&entry.prompt) pt.textContent=entry.prompt;
  switchDwTab('write');
  showToast('已载入 '+entry.date+' 的记录，可直接继续编辑');
}
function dwLibDelete(idx){
  var entries=ld('dw_entries',[]);
  var entry=entries[idx];
  if(!entry) return;
  showDlg('删除记录','确定删除 '+entry.date+' 的今日一写记录？此操作不可恢复。',function(){
    entries.splice(idx,1);
    sv('dw_entries',entries);
    _renderDwLib();
  },true);
}
function checkDwBlink(){/* 闪烁功能已移除 */}
var DW_PROMPTS=[
  '如果今天是你人生中的最后一天，你会做什么？',
  '写一个以"那扇门从未打开过"开头的故事',
  '描述一种你从未尝过的颜色',
  '一个陌生人在雨中递给你一把伞，然后消失了',
  '写下你最想对五年前的自己说的一句话',
  '一座空城，只剩下你和一只猫',
  '如果记忆可以出售，你愿意卖掉哪一段？',
  '写一封永远不会寄出的信',
  '世界上最后一个图书馆着火了，你只能救出一本书',
  '描述一个你反复做的梦',
  '当音乐突然停止的那一刻',
  '写一个以"她把钥匙放在桌上"结尾的故事',
  '如果你可以和任何一个历史人物共进晚餐',
  '一张照片里，有个人你认不出来，但他认识你',
  '写下今天让你停顿了一下的瞬间',
  '如果城市会做梦，它会梦到什么？',
  '最后一班地铁上只有你和一个哭泣的人',
  '写一个关于"等待"的故事',
  '有些东西失去了才知道珍贵，比如……',
  '一个会说话的钟表，它记住了这个房间所有的秘密',
  '你在书里看到了一句话，像是专门写给你的',
  '写下你心里那个还没说出口的故事',
  '如果勇气是一种颜色，它是什么色？',
  '深夜便利店，两个陌生人，一段意外的对话',
  '写一个"本以为结束了，却只是开始"的故事',
  '今天，你注意到了什么别人都忽略的细节？',
  '一封来自未来的信，说"一切都值得"',
  '写下你最喜欢的某个普通的早晨',
  '如果你的名字是一首歌，它会是什么风格？',
  '她走进那家咖啡馆，从此改变了一切',
  '窗外的那棵树，见证了这栋楼里多少故事',
  '写一段对话：两个人说的是同一件事，但完全不同的心情',
  '如果你能回到某个下午，你会回到哪里？',
  '一个孩子在沙滩上挖到了一个铁盒子',
  '写一个关于"错过"的故事，但结局温柔',
  '她第一次说谎，是为了保护一个她根本不认识的人',
  '如果明天醒来你失去了一种感官，你最怕失去哪个？',
  '深山里有一座灯塔，它从未熄灭，也从未有人来取光',
  '写一个只有三句话的故事，但让人看完会沉默',
  '那件衣服，他挂在那里再没穿过',
  '如果你的影子开始提前走，你会怎么办？',
  '写一个关于"等一个人"的故事，不说等谁，不说为什么',
  '最后一封邮件，发出去之后她就关掉了电脑',
  '一个人收拾旧物，在抽屉最里面发现了一枚戒指',
  '如果你可以把某段时光装进瓶子里，你装哪一段？',
  '写下你第一次感觉到"长大了"是在什么时候',
  '街角那家面馆，老板娘从来不问你想吃什么',
  '一场大雨之后，世界安静得像什么都没发生过',
  '他们没有说再见，只是有一天对方就不再出现了',
  '如果此刻有人能听见你内心真实的声音，那句话是什么？',
  '写一个角色，他最大的优点和最大的缺点是同一件事',
  '一个画家突然发现，自己画的所有人物都活过来了',
  '写一段独白：一个人站在镜子前，终于决定说出某件事',
  '如果你能给十年后的自己发一条消息，你会写什么？',
  '某个夜晚，两个素不相识的人共撑一把伞走了三站路',
  '有一种思念，是你去了某个地方，第一反应是想带他来看',
  '她从未回头，但她知道他一直站在那里',
  '写一个以"其实我一直知道"结尾的故事',
  '如果你是一座城市，你愿意是哪座？为什么？',
  '那是他们最后一次笑得那么大声，谁也没想到',
  '凌晨三点，一个人站在阳台上，他在想什么？',
  '写一个从反派视角讲述的故事开头',
  '两个多年未见的朋友重逢，却发现彼此都变了',
  '如果你能让一件物品开口说话，你选哪件？它会说什么？',
  '一个旅人在陌生小镇迷路，遇见了一个奇怪的老人',
  '写一个关于"原谅"的故事，但不说原谅了什么',
  '她把那首歌单曲循环了一整夜',
  '如果所有的谎言都会变成可见的烟，这个世界会是什么样？',
  '写下你曾经最害怕的一件事，它后来怎样了？',
  '一列没有终点站的火车',
  '在拥挤的城市里，有一个角落只有你知道',
  '他从未告诉任何人，那个秘密藏了二十年',
  '写一封用来和解的信，寄给你内心最难过的那一部分',
  '如果你可以选择忘记一件事，你选什么？',
  '一座老宅，一个陌生的名字刻在墙上',
  '写一个"一切都来得及"的故事',
  '她收到了一份不知道是谁寄来的礼物',
  '如果恐惧可以被画出来，它长什么样？',
  '写下你某天突然懂了的一件事',
  '两个不同时代的人，因为同一本日记相遇',
  '他终于说了那句话，但已经太晚了，又或许刚刚好',
  '写一个以"我以为我不会哭的"开头的故事',
  '一朵花开在不该开的地方，却偏偏开得很好',
  '如果你是世界上最后一个人，你第一件事做什么？',
  '写一段没有主语的对话，让读者去猜是谁在说',
  '她终于明白，有些告别是没有仪式感的',
  '一条写满字的便利贴，贴在路灯柱上',
  '写一个结局比开头更温暖的悲剧',
  '如果你能重新选择一次职业，你会选什么？',
  '一个人突然开始怀念一种他从未拥有过的生活',
  '写下你今天想象过的某个画面',
  '两个人各自说着"没事"，但彼此都知道有事',
  '如果时间是一种食材，你会用它做什么？',
  '写一个关于"刚刚好"的故事',
  '他翻出了一张十年前的车票，目的地是她的城市',
  '写一个开头是结束、结束是开始的故事',
  '如果眼泪有颜色，每种颜色代表不同的心情',
  '有个人每天路过同一扇橱窗，从来没有走进去',
  '写下你从未对人说过的某个愿望'
];
// ==================== 今日一写 END ====================

// ==================== 自定义灵感管理 ====================
function _getDwAllPrompts(){
  var custom=[];
  try{
    var raw=ld('dw_custom_prompts',null);
    if(raw){
      custom=Array.isArray(raw)?raw:JSON.parse(raw);
      if(!Array.isArray(custom)) custom=[];
      custom=custom.filter(function(p){return p&&p.trim();});
    }
  }catch(e){}
  // 自定义灵感权重加倍（更容易被抽到）
  var pool=DW_PROMPTS.slice();
  custom.forEach(function(p){pool.push(p);pool.push(p);});
  return pool;
}

function openDwCustomPrompts(){
  var old=document.getElementById('_dwCustomOv');
  if(old) old.remove();
  var existing=[];
  try{
    var raw=localStorage.getItem('dw_custom_prompts');
    if(raw) existing=JSON.parse(raw)||[];
  }catch(e){}
  var existingText=existing.join('\n');

  var ov=document.createElement('div');
  ov.id='_dwCustomOv';
  ov.style.cssText='position:fixed;left:0;top:0;width:100%;height:100%;background:rgba(0,0,0,.55);z-index:10001;display:flex;align-items:flex-end';
  var box=document.createElement('div');
  box.style.cssText='width:100%;max-height:80vh;display:flex;flex-direction:column;background:var(--card);border-radius:20px 20px 0 0;padding:18px 16px 24px;box-sizing:border-box';

  box.innerHTML=
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">'
    +'<span style="font-size:14px;font-weight:700;color:var(--text)"><i class="fas fa-edit" style="color:var(--accent2);margin-right:6px"></i>自定义今日灵感</span>'
    +'<button id="_dwCustClose" style="background:transparent;border:none;font-size:20px;color:var(--text2);cursor:pointer;padding:0 4px">×</button>'
    +'</div>'
    +'<div style="font-size:11px;color:var(--text2);margin-bottom:10px">每行一条，保存后自动混入随机抽取池（自定义灵感被抽到的概率更高）</div>'
    +'<textarea id="_dwCustTa" style="flex:1;min-height:180px;max-height:45vh;width:100%;padding:10px 12px;border-radius:10px;border:1px solid var(--border);background:var(--card2);color:var(--text);font-size:13px;line-height:1.8;resize:none;outline:none;box-sizing:border-box" placeholder="每行写一条灵感提示，例如：&#10;如果你能和昨天的自己说一句话&#10;写一个关于等待的故事"></textarea>'
    +'<div style="display:flex;gap:8px;margin-top:12px">'
    +'<button id="_dwCustClear" style="padding:10px 14px;border-radius:10px;border:1px solid var(--border);background:transparent;color:var(--text2);font-size:12px;cursor:pointer">清空</button>'
    +'<button id="_dwCustSave" style="flex:1;padding:10px;border-radius:10px;border:none;background:linear-gradient(135deg,var(--accent),var(--accent2));color:#fff;font-size:13px;font-weight:700;cursor:pointer">保存</button>'
    +'</div>';

  ov.appendChild(box);
  ov.addEventListener('click',function(e){if(e.target===ov) ov.remove();});
  document.body.appendChild(ov);

  var ta=document.getElementById('_dwCustTa');
  if(ta) ta.value=existingText;

  document.getElementById('_dwCustClose').onclick=function(){ov.remove();};
  document.getElementById('_dwCustClear').onclick=function(){
    if(ta) ta.value='';
  };
  document.getElementById('_dwCustSave').onclick=function(){
    var lines=(ta?ta.value:'').split('\n').map(function(l){return l.trim();}).filter(function(l){return l.length>0;});
    try{localStorage.setItem('dw_custom_prompts',JSON.stringify(lines));}catch(e){}
    ov.remove();
    showToast('自定义灵感已保存（共'+lines.length+'条）');
  };

  setTimeout(function(){if(ta) ta.focus();},150);
}
// ==================== 自定义灵感管理 END ====================

// ==================== 人物设定页搜索 ====================
function normSearchText(v){
return String(v==null?'':v).toLowerCase();
}
function findPersonByName(name){
if(!name)return null;
return characters.find(c=>c&&c.name===name)||npcList.find(n=>n&&n.name===name)||null;
}
// 人物自身的名称、角色定位（NPC才有）、性格标签是否包含关键词
function personDirectMatch(p,kw){
if(!p)return false;
if(normSearchText(p.name).includes(kw))return true;
if(normSearchText(p.role).includes(kw))return true;
return (Array.isArray(p.traits)?p.traits:[]).some(t=>normSearchText(t).includes(kw));
}
// 在直接命中之外，再看这个人参与的关系类型（搜“敌对”能找到有敌对关系的人）
function personMatchesKw(p,kw){
if(personDirectMatch(p,kw))return true;
const nm=p&&p.name;
if(!nm)return false;
return charRelations.some(r=>r&&(r.charA===nm||r.charB===nm)&&normSearchText(r.type).includes(kw));
}
// 关系页：关系类型命中，或任意一端人物（名字/定位/标签）命中
function relationMatchesKw(rel,kw){
if(normSearchText(rel.type).includes(kw))return true;
return [rel.charA,rel.charB].some(n=>normSearchText(n).includes(kw)||personDirectMatch(findPersonByName(n),kw));
}
function setCharSearchEmpty(id,show){
const el=document.getElementById(id);
if(el)el.hidden=!show;
}
// 同时过滤三个页面的列表，切换页面时无需再处理
function applyCharSearchFilter(){
const kw=_charSearchKw;
let roleShown=0,npcShown=0,relShown=0;
document.querySelectorAll('#charCards .char-card').forEach(card=>{
const c=characters[parseInt(card.dataset.idx,10)];
const hit=!kw||(!!c&&personMatchesKw(c,kw));
card.hidden=!hit;
if(hit)roleShown++;
});
document.querySelectorAll('#npcCards .npc-card').forEach(card=>{
const n=npcList[parseInt(card.dataset.idx,10)];
const hit=!kw||(!!n&&personMatchesKw(n,kw));
card.hidden=!hit;
if(hit)npcShown++;
});
document.querySelectorAll('#relList .rel-item').forEach(item=>{
const r=charRelations[parseInt(item.dataset.idx,10)];
const hit=!kw||(!!r&&relationMatchesKw(r,kw));
item.hidden=!hit;
if(hit)relShown++;
});
setCharSearchEmpty('charSearchEmptyRole',!!kw&&characters.length>0&&roleShown===0);
setCharSearchEmpty('charSearchEmptyNpc',!!kw&&npcList.length>0&&npcShown===0);
setCharSearchEmpty('charSearchEmptyRel',!!kw&&charRelations.length>0&&relShown===0);
}
function onCharSearchInput(e){
// 中文输入法拼音组合期间不过滤，等 compositionend 再处理，避免拼音字母造成空结果闪烁
if(e&&e.isComposing)return;
const input=document.getElementById('charSearchInput');
if(!input)return;
_charSearchKw=normSearchText(input.value.trim());
const clr=document.getElementById('charSearchClear');
if(clr)clr.hidden=!input.value;
applyCharSearchFilter();
}
// 浏览器没有 oncompositionend 属性，只能用事件监听；输入法确认选词后才按最终文字过滤
function bindCharSearchComposition(){
const input=document.getElementById('charSearchInput');
if(!input||input.dataset.imeBound)return;
input.dataset.imeBound='1';
input.addEventListener('compositionend',onCharSearchInput);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bindCharSearchComposition);
else bindCharSearchComposition();
function clearCharSearch(refocus){
const input=document.getElementById('charSearchInput');
if(input)input.value='';
_charSearchKw='';
const clr=document.getElementById('charSearchClear');
if(clr)clr.hidden=true;
applyCharSearchFilter();
if(refocus&&input)input.focus();
}
// ==================== 人物设定页 Tab 切换 ====================
function switchCharTab(tab,el){
  document.querySelectorAll('#charTabsNav .cr-tab').forEach(function(t){t.classList.remove('act');});
  el.classList.add('act');
  var panels={role:'charTabRole',npc:'charTabNpc',rel:'charTabRel'};
  Object.keys(panels).forEach(function(key){
    var panel=document.getElementById(panels[key]);
    if(panel) panel.style.display=(key===tab)?'':'none';
  });
  // 自定义标签管理/清空按钮/预设管理三个Tab共用一份DOM，挪到当前激活Tab的末尾
  var footer=document.getElementById('charSharedFooter');
  var target=document.getElementById(panels[tab]);
  if(footer&&target) target.appendChild(footer);
}
// ==================== 三句话人设 ====================
function toggleQuick3(){
  var body=document.getElementById('quick3Body');
  var arrow=document.getElementById('quick3Arrow');
  if(!body) return;
  var isOpen=body.classList.contains('open');
  foldSlide(body,!isOpen,'open');
  if(arrow) arrow.style.transform=isOpen?'':'rotate(180deg)';
}
async function doQuick3Char(){
  var name=(document.getElementById('q3name').value||'').trim();
  var trait=(document.getElementById('q3trait').value||'').trim();
  var rel=(document.getElementById('q3rel').value||'').trim();
  if(!trait&&!rel){showToast('至少填写性格或关系哦');return;}
  var cfg=getCurApi();
  if(!cfg.url||!cfg.key){showToast('请先配置API');return;}
  var btn=document.getElementById('q3btn');
  var result=document.getElementById('q3result');
  btn.disabled=true;
  btn.innerHTML='<i class="fas fa-spinner fa-spin"></i> AI建档中...';
  result.style.display='none';
  var sys='你是小说人物设定助手。根据用户提供的简短信息，生成一份完整丰富的NPC人物设定。\n'+
    '只返回JSON，不输出任何其他内容，格式：\n'+
    '{"name":"完整姓名（若用户未提供则自己起一个符合故事气质的名字）","role":"配角","traits":["性格标签1","性格标签2","性格标签3","性格标签4"],"appearance":"详细外貌描写，包括发型发色、肤色、体型、五官特征、常见穿着和气质气场（3-5句话，不得简写）","desc":"完整背景故事和与主角的关系，包括成长经历要点、现在的处境、与主角相识或对立的缘由，以及在故事中可能扮演的角色（4-6句话，不得简写）"}\n'+
    '不输出任何其他内容，不加任何前缀或后缀。';
  var userMsg='角色名字：'+(name||'（请AI起一个符合故事气质的名字）')+'\n性格特点：'+(trait||'（不限）')+'\n与主角的关系：'+(rel||'（不限）');
  try{
    var raw=await callAPINonStream([{role:'system',content:sys},{role:'user',content:userMsg}],1);
    raw=_extractJsonStr(stripMetaThinking(raw));
    var parsed;
    try{ parsed=JSON.parse(raw); }
    catch(e){ throw new Error('AI返回格式解析失败，请重试'); }
    // 字段安全兜底
    var safeName=String(parsed.name||name||'新角色').trim()||'新角色';
    var safeRole=String(parsed.role||'配角').trim()||'配角';
    var safeTraits=Array.isArray(parsed.traits)?parsed.traits.filter(function(t){return typeof t==='string'&&t.trim();}).map(function(t){return t.trim();}):[];
    var safeAppearance=String(parsed.appearance||'').trim();
    var safeDesc=String(parsed.desc||'').trim();
    // 写入NPC列表
    var newNpc={id:uid(),name:safeName,role:safeRole,traits:safeTraits,appearance:safeAppearance,desc:safeDesc,chapter:''};
    npcList.push(newNpc);
    sv('bj_npcList',npcList);
    // 清空输入
    document.getElementById('q3name').value='';
    document.getElementById('q3trait').value='';
    document.getElementById('q3rel').value='';
    // 刷新NPC列表展示
    renderNpcCards();
    result.innerHTML='<div style="background:rgba(81,207,102,.08);border:1px solid rgba(81,207,102,.3);border-radius:10px;padding:12px 14px">'
      +'<div style="font-size:12px;font-weight:700;color:var(--success);margin-bottom:6px"><i class="fas fa-check-circle"></i> 「'+esc(newNpc.name)+'」已创建</div>'
      +'<div style="font-size:11px;color:var(--text2);line-height:1.8">'
      +(newNpc.traits.length?'性格：'+esc(newNpc.traits.join('、'))+'<br>':'')
      +(newNpc.appearance?'外貌：'+esc(newNpc.appearance.substring(0,50))+(newNpc.appearance.length>50?'…':'')+'<br>':'')
      +(newNpc.desc?'背景：'+esc(newNpc.desc.substring(0,60))+(newNpc.desc.length>60?'…':'')+'<br>':'')
      +'</div>'
      +'<button onclick="toggleQuick3()" style="margin-top:8px;font-size:11px;color:var(--text2);background:none;border:none;cursor:pointer;padding:0">折叠 ↑</button>'
      +'</div>';
    result.style.display='block';
    showToast('角色「'+newNpc.name+'」已创建');
  }catch(e){
    result.innerHTML='<div style="color:var(--danger);font-size:12px;padding:8px;background:rgba(255,107,107,.08);border-radius:8px"><i class="fas fa-circle-xmark"></i> '+esc(e.message||'生成失败，请重试')+'</div>';
    result.style.display='block';
  }
  btn.disabled=false;
  btn.innerHTML='<i class="fas fa-robot"></i> AI帮我建完整人设';
}
// ==================== 三句话人设 END ====================

// ==================== 这里发生了什么 ====================
function sendParaToXj(text){
  // 打开星笺，把段落原文作为 pending 消息加入，但不立即触发AI回复
  openXingJian();
  setTimeout(function(){
    var msg='【这里发生了什么？】\n\n「'+text+'」\n\n（请帮我用大白话解释这段内容的意思，以及和前后剧情的关联。）';
    // 直接加入到 xjMessages 作为 user 消息（但不 pending，等用户自己点发送）
    xjMessages.push({role:'user', content:msg, time:new Date().toISOString(), isPendingXj:true});
    if(xjMessages.length > XJ_MAX_CONTEXT*2) xjMessages=xjMessages.slice(-XJ_MAX_CONTEXT*2);
    sv('bj_xjMessages',xjMessages);
    renderXjMessages();
    // 滚动到底部
    setTimeout(function(){
      var body=document.getElementById('xjBody');
      if(body) body.scrollTop=body.scrollHeight;
    }, 200);
    showToast('原文已发给星笺，点 接收回复');
  }, 400);
}
// ==================== 这里发生了什么 END ====================

// ==================== 万能输入框 全屏页 ====================
function openSmartInput(){
  var p=document.getElementById('smartInputPage');
  if(p){p.style.display='flex';p.classList.add('show');}
  navPush('smartInputPage');
  var nav=document.getElementById('bnav');
  if(nav) nav.classList.add('hide');
}
function closeSmartInput(){
  var p=document.getElementById('smartInputPage');
  if(p){p.style.display='none';p.classList.remove('show');}
  navPop('smartInputPage');
  var nav=document.getElementById('bnav');
  if(nav) nav.classList.remove('hide');
}
function clearSmartInput(){
  var t=document.getElementById('smartInputText');
  var r=document.getElementById('siResultArea');
  if(t) t.value='';
  if(r){r.innerHTML='';r.style.display='none';}
  var s=document.getElementById('siStatusText');
  if(s) s.textContent='输入完成后点击识别';
}
function updateSiCharCount(ta){
  var len=(ta.value||'').length;
  var el=document.getElementById('siCharCount');
  var warn=document.getElementById('siCharCountWarn');
  if(el){
    el.textContent=len>0?(len.toLocaleString()+' 字'):'0 字';
    el.style.color=len>20000?'var(--danger)':len>10000?'#e5a300':'var(--text2)';
  }
  if(warn) warn.style.display=len>=30000?'block':'none';
}

function toggleSiExamples(e){
  if(e) e.stopPropagation();
  var panel=document.getElementById('siExamples');
  var arrow=document.getElementById('siExArrow');
  if(!panel) return;
  var isOpen=panel.classList.contains('show');
  if(isOpen){
    foldSlide(panel,false);
    if(arrow) arrow.style.transform='';
    document.removeEventListener('click',_siExOutsideHandler);
  } else {
    foldSlide(panel,true);
    if(arrow) arrow.style.transform='rotate(180deg)';
    // 注册点击外部关闭
    setTimeout(function(){
      document.addEventListener('click',_siExOutsideHandler);
    },0);
  }
}
function _siExOutsideHandler(e){
  var bar=document.getElementById('siExampleBar');
  if(bar&&!bar.contains(e.target)){
    var panel=document.getElementById('siExamples');
    var arrow=document.getElementById('siExArrow');
    if(panel) foldSlide(panel,false);
    if(arrow) arrow.style.transform='';
    document.removeEventListener('click',_siExOutsideHandler);
  }
}
function _closeSiExamples(){
  var panel=document.getElementById('siExamples');
  var arrow=document.getElementById('siExArrow');
  if(panel) foldSlide(panel,false);
  if(arrow) arrow.style.transform='';
  document.removeEventListener('click',_siExOutsideHandler);
}

function insertSiExample(el){
  var t=document.getElementById('smartInputText');
  if(!t) return;
  var v=t.value.trim();
  t.value=v?(v+'\n'+el.textContent.trim()):el.textContent.trim();
  t.focus();
  _closeSiExamples();
}

async function doSmartInput(){
  var inputEl=document.getElementById('smartInputText');
  var resultEl=document.getElementById('siResultArea');
  var btn=document.getElementById('siSubmitBtn');
  var statusEl=document.getElementById('siStatusText');
  var text=(inputEl.value||'').trim();
  if(!text){showToast('请先输入一些内容');return;}

  var cfg=getCurApi();
  if(!cfg.url||!cfg.key){showToast('请先在API设置中配置接口');return;}

  btn.disabled=true;
  btn.innerHTML='<i class="fas fa-spinner fa-spin"></i> 识别中...';
  if(statusEl) statusEl.textContent='AI正在分析你的内容...';
  resultEl.innerHTML='';
  resultEl.style.display='none';

  // 构建角色/NPC上下文
  var charCtx='';
  var vChars=(characters||[]).filter(function(c){return c.name;});
  if(vChars.length>0){
    charCtx+='现有角色：'+vChars.map(function(c){return c.name+'('+( c.priority||'普通')+')';}).join('、')+'\n';
  }
  var vNpcs=(npcList||[]).filter(function(n){return n.name;});
  if(vNpcs.length>0){
    charCtx+='现有NPC：'+vNpcs.map(function(n){return n.name+'('+( n.role||'配角')+')';}).join('、')+'\n';
  }

  var sysPrompt='你是小说创作设定助手。用户一次性输入多条设定信息，请逐条识别并完整分类到对应字段，不得简化或截断用户内容。\n\n'+
    '【可填写的目标与字段】\n'+
    '→ target="char" 主角/核心角色：\n'+
    '   field="name"       角色姓名（字符串）\n'+
    '   field="priority"   重要度：核心 / 普通 / 参考\n'+
    '   field="traits"     性格标签，用中文逗号分隔（如：冷漠,话少,内心温柔）\n'+
    '   field="desc"       详细人物设定，完整填写（背景、动机、特点等）\n'+
    '→ target="npc" 配角/次要角色/NPC：\n'+
    '   field="name"       角色姓名\n'+
    '   field="role"       定位：配角 / 反派 / 路人 / 重要配角 / 工具人\n'+
    '   field="traits"     性格标签，逗号分隔\n'+
    '   field="appearance" 外貌描写，完整填写（发色、肤色、体型、衣着、气质等）\n'+
    '   field="desc"       背景故事、与主角的关系、登场目的等，完整填写\n'+
    '   field="chapter"    出场章节（如"第3章"或"开篇"）\n'+
    '→ target="world" 世界观/背景设定：\n'+
    '   field="content"    完整世界观描述，包括时代背景、地理、社会结构、规则等\n'+
    '→ target="style" 文风/叙事风格要求：\n'+
    '   field="content"    文风描述，包括行文节奏、叙事视角、语言特点、情感浓度等\n'+
    '→ target="rule" 写作规则/创作约束：\n'+
    '   field="content"    写作规则，包括章节结构、情节要求、叙事限制等\n'+
    '→ target="ban" 禁止内容/禁用词：\n'+
    '   field="content"    禁止出现的内容，每条一行\n\n'+
    (charCtx?'【当前已有角色】\n'+charCtx+'\n':'')+
    '【输出规则】\n'+
    '1. 只返回JSON，不输出任何其他文字、解释或Markdown代码块\n'+
    '2. 格式：{"actions":[{"target":"char/npc/world/style/rule/ban","name":"仅角色类填写","isNew":true,"field":"字段名","value":"完整内容"}],"summary":"一句话总结做了什么"}\n'+
    '   isNew字段：若target为char/npc且是新角色/NPC填true，否则填false\n'+
    '3. 所有字段的value必须完整，不得简写、省略或用"..."代替\n'+
    '4. 同一角色有多个字段信息时，拆分成多个action（每个action一个field）\n'+
    '5. 所有action均为直接覆盖写入（不追加），请确保value内容完整自洽\n'+
    '6. 无法识别归类的内容直接跳过，不要强行分类';

  try{
    var raw=await callAPINonStream([{role:'system',content:sysPrompt},{role:'user',content:'用户输入：\n'+text}],1);
    raw=_extractJsonStr(stripMetaThinking(raw));
    var parsed;
    try{parsed=JSON.parse(raw);}catch(e){throw new Error('AI返回格式错误，请重试（预览：'+String(raw||'').substring(0,60)+'）');}
    if(!parsed.actions||!Array.isArray(parsed.actions)) throw new Error('返回结构异常');

    if(parsed.actions.length===0){
      resultEl.innerHTML='<div style="padding:12px;background:var(--card);border-radius:10px;color:var(--text2);font-size:12px"><i class="fas fa-triangle-exclamation"></i> '+esc(parsed.summary||'未能识别出可归类的内容，请补充更多细节')+'</div>';
      resultEl.style.display='block';
      if(statusEl) statusEl.textContent='未识别到内容';
      btn.disabled=false;
      btn.innerHTML='<i class="fas fa-robot"></i> AI智能识别';
      return;
    }

    // 按实体收集已更新字段，用于去重显示
    // key = "类型:名字" 或 "world/style/rule/ban"
    var entityFields={};  // key → {icon, label, fields:[]}
    var totalCount=0;

    parsed.actions.forEach(function(action){
      if(!action.target||action.value===undefined||String(action.value).trim()==='') return;
      var fieldLabel=_siFieldLabel(action.field);
      if(action.target==='world'){
        var gw=document.getElementById('globalWorldDesc');
        if(gw){
          gw.value=action.value;
          globalWorld=gw.value;sv('bj_globalWorld',globalWorld);
          limitTextarea(gw,3000,'gwCount');
          _siTrackEntity(entityFields,'world','','<i class="fas fa-circle-check"></i>','世界观',' 已更新');
          totalCount++;
        }
      } else if(action.target==='style'){
        var st=document.getElementById('styleDesc');
        if(st){
          st.value=action.value;
          ap.curStyle=action.value;sv(K.ap,ap);
          limitTextarea(st,600,'stCount');
          saveCurSettings();
          _siTrackEntity(entityFields,'style','','<i class="fas fa-circle-check"></i>','文风',' 已更新');
          totalCount++;
        }
      } else if(action.target==='rule'){
        var rl=document.getElementById('globalRuleDesc');
        if(rl){
          rl.value=action.value;
          globalRule=action.value;sv('bj_globalRule',globalRule);
          limitTextarea(rl,2000,'grCount');
          _siTrackEntity(entityFields,'rule','','<i class="fas fa-circle-check"></i>','写作规则',' 已更新');
          totalCount++;
        }
      } else if(action.target==='ban'){
        var gb=document.getElementById('globalBanWordsInput');
        if(gb){
          var existingBan=(gb.value||'').trim();
          gb.value=existingBan?(existingBan+'\n'+action.value):action.value;
          globalBanWords=gb.value;sv('bj_globalBanWords',globalBanWords);
          limitLines(gb,30,'gbwCount');
          _siTrackEntity(entityFields,'ban','','<i class="fas fa-circle-check"></i>','禁用词',' 已添加');
          totalCount++;
        }
      } else if(action.target==='char'||action.target==='npc'){
        var applyResult=_applyCharNpcAction(action);
        if(applyResult.ok){
          var eKey=(action.target==='char'?'char:':'npc:')+applyResult.name;
          var eIcon=action.target==='char'?'<i class="fas fa-user"></i>':'<i class="fas fa-theater-masks"></i>';
          var eType=action.target==='char'?'角色':'NPC';
          _siTrackEntity(entityFields,eKey,fieldLabel,eIcon,eType+'「'+applyResult.name+'」','');
          totalCount++;
        } else {
          // 找不到角色，单独展示警告
          var wKey='warn:'+Date.now()+Math.random();
          entityFields[wKey]={icon:'<i class="fas fa-triangle-exclamation"></i>',label:'未找到「'+(action.name||'?')+'」',fields:[],suffix:''};
        }
      }
    });

    renderCharCards();
    renderNpcCards();

    // 构建去重后的结果HTML
    var html='<div style="background:rgba(81,207,102,.07);border:1px solid rgba(81,207,102,.25);border-radius:14px;padding:14px">';
    html+='<div style="font-size:13px;font-weight:700;color:var(--success);margin-bottom:10px"><i class="fas fa-check-circle"></i> '+esc(parsed.summary||'完成')+'</div>';
    Object.keys(entityFields).forEach(function(k){
      var e=entityFields[k];
      var fieldsStr=e.fields.length>0?'（'+e.fields.join('、')+'）':'';
      html+='<div style="font-size:11px;color:var(--text2);padding:4px 0;border-bottom:1px solid var(--border);display:flex;align-items:baseline;gap:5px">'
        +'<span>'+e.icon+'</span>'
        +'<span style="color:var(--text)">'+esc(e.label)+esc(fieldsStr)+esc(e.suffix)+'</span>'
        +'</div>';
    });
    html+='<button onclick="clearSmartInput()" style="margin-top:12px;width:100%;padding:9px;border-radius:10px;border:1px solid var(--border);background:transparent;color:var(--text2);font-size:12px;cursor:pointer">清空，再输入一批</button>';
    html+='</div>';
    resultEl.innerHTML=html;
    resultEl.style.display='block';
    if(statusEl) statusEl.textContent='已处理 '+totalCount+' 项';
    showToast('万能框：'+( parsed.summary||'已填入'));
  }catch(e){
    resultEl.innerHTML='<div style="color:var(--danger);font-size:12px;padding:10px;background:rgba(255,107,107,.07);border-radius:10px"><i class="fas fa-circle-xmark"></i> '+esc(e.message||'识别失败，请重试')+'</div>';
    resultEl.style.display='block';
    if(statusEl) statusEl.textContent='识别失败';
  }
  btn.disabled=false;
  btn.innerHTML='<i class="fas fa-robot"></i> AI智能识别';
}

// 辅助：把 field 名转为中文标签
function _siFieldLabel(field){
  var map={name:'名字',priority:'重要度',traits:'性格',desc:'描述',role:'定位',appearance:'外貌',chapter:'出场章节',content:'内容'};
  return map[field]||field||'';
}

// 辅助：向 entityFields 追踪字段更新（去重，同实体只记一条，字段列表合并）
function _siTrackEntity(entityFields,key,fieldLabel,icon,label,suffix){
  if(!entityFields[key]){
    entityFields[key]={icon:icon,label:label,fields:[],suffix:suffix};
  }
  if(fieldLabel&&entityFields[key].fields.indexOf(fieldLabel)===-1){
    entityFields[key].fields.push(fieldLabel);
  }
}

function _applyCharNpcAction(action){
  var isChar=action.target==='char';
  var list=isChar?characters:npcList;
  var idx=-1;
  if(action.name){
    idx=list.findIndex(function(c){return c.name===action.name;});
    if(idx===-1) idx=list.findIndex(function(c){return c.name&&action.name&&c.name.indexOf(action.name)!==-1;});
  }
  if(idx===-1&&action.isNew){
    if(isChar){
      characters.push({name:action.name||'新角色',desc:'',traits:[],priority:'普通'});
      sv(K.curChars,characters);
      idx=characters.length-1;
    } else {
      npcList.push({id:uid(),name:action.name||'新NPC',role:action.role||'配角',traits:[],appearance:'',desc:'',chapter:''});
      sv('bj_npcList',npcList);
      idx=npcList.length-1;
    }
  }
  if(idx<0) return {ok:false,name:action.name||'?'};
  var item=list[idx];
  var f=action.field;
  var val=action.value;
  // 所有字段均直接覆盖写入，不追加
  if(f==='name') item.name=val;
  else if(f==='priority'&&isChar) item.priority=val;
  else if(f==='role'&&!isChar) item.role=val;
  else if(f==='traits'){
    var tags=String(val).split(/[,，、\s]+/).filter(function(t){return t;});
    item.traits=tags;
  } else if(f==='appearance'&&!isChar){
    item.appearance=val;
  } else if(f==='desc'){
    item.desc=val;
  } else if(f==='chapter'&&!isChar){
    item.chapter=val;
  }
  isChar?sv(K.curChars,characters):sv('bj_npcList',npcList);
  return {ok:true,name:item.name};
}
// ==================== 万能输入框 全屏页 END ====================

// ==================== AI建档 ====================
async function aiAutoArchive(){
  var cfg=getCurApi();
  if(!cfg.url||!cfg.key){showToast('请先配置API');return;}
  // 获取当前阅读器内容
  var content='';
  var titleEl=document.getElementById('rdTitle');
  var bodyEl=document.getElementById('rdBody');
  if(bodyEl) content=bodyEl.innerText||bodyEl.textContent||'';
  if(!content||content.length<50){showToast('当前内容太少，无法建档');return;}

  showToast('AI正在读取内容建档，请稍候...',3000);

  var sysPrompt='你是一个小说人物提取助手。请从以下小说内容中提取：\n'+
    '1. 主要角色（名字、性格特点、外貌、背景）\n'+
    '2. 世界观/背景设定\n'+
    '3. 写作文风特点\n\n'+
    '只返回JSON：\n'+
    '{"chars":[{"name":"","priority":"核心|普通|参考","traits":[""],"desc":""}],"npcs":[{"name":"","role":"配角|反派|路人","traits":[""],"appearance":"","desc":""}],"world":"","style":"","summary":"一句话说明提取了什么"}';

  try{
    var raw=await callAPINonStream([{role:'system',content:sysPrompt},{role:'user',content:'小说内容（前3000字）：\n'+content.substring(0,3000)}],1);
    raw=_extractJsonStr(stripMetaThinking(raw));
    var d=JSON.parse(raw);
    var msgs=[];

    (d.chars||[]).forEach(function(c){
      if(!c.name) return;
      var idx=characters.findIndex(function(x){return x.name===c.name;});
      if(idx===-1){
        characters.push({name:c.name,priority:c.priority||'普通',traits:c.traits||[],desc:c.desc||''});
        msgs.push('新建角色「'+c.name+'」');
      } else {
        if(c.traits&&c.traits.length) characters[idx].traits=(characters[idx].traits||[]).concat((c.traits||[]).filter(function(t){return (characters[idx].traits||[]).indexOf(t)===-1;}));
        if(c.desc&&!characters[idx].desc) characters[idx].desc=c.desc;
        msgs.push('更新角色「'+c.name+'」');
      }
    });
    sv(K.curChars,characters);

    (d.npcs||[]).forEach(function(n){
      if(!n.name) return;
      var idx=npcList.findIndex(function(x){return x.name===n.name;});
      if(idx===-1){
        npcList.push({id:uid(),name:n.name,role:n.role||'配角',traits:n.traits||[],appearance:n.appearance||'',desc:n.desc||'',chapter:''});
        msgs.push('新建NPC「'+n.name+'」');
      }
    });
    sv('bj_npcList',npcList);

    if(d.world){
      var gw=document.getElementById('globalWorldDesc');
      if(gw&&!gw.value){gw.value=d.world;globalWorld=d.world;sv('bj_globalWorld',globalWorld);msgs.push('填写世界观');}
    }
    if(d.style){
      var st=document.getElementById('styleDesc');
      if(st&&!st.value){st.value=d.style;saveCurSettings();msgs.push('填写文风');}
    }

    renderCharCards();renderNpcCards();
    showDlg('AI建档完成',( d.summary||'提取完成')+'。\n\n本次操作：\n'+msgs.map(function(m){return '· '+m;}).join('\n'));
  }catch(e){
    showToast('建档失败：'+( e.message||'解析出错'),3000);
  }
}
// ==================== AI建档 END ====================

// ==================== 我卡住了 ====================
async function aiStuckHelper(){
  var cfg=getCurApi();
  if(!cfg.url||!cfg.key){showToast('请先配置API');return;}
  var ta=document.getElementById('edTextarea');
  var content=(ta&&ta.value)?ta.value:'';
  if(!content||content.length<100){showToast('当前章节内容太少，先多写一点吧');return;}

  showToast('AI正在分析当前内容...',3000);

  var sysPr=buildSysPrompt();
  var userMsg='我写到这里卡住了，请根据前文给我3个具体的"接下来可以发生"的剧情走向，每个走向要简洁具体（2-3句话），风格各有差异（一个偏情感，一个偏冲突，一个偏意外转折）。\n\n当前内容（末尾部分）：\n'+content.slice(-800);

  try{
    var result=await callAPINonStream([{role:'system',content:sysPr},{role:'user',content:userMsg}],1);
    result=stripMetaThinking(result).trim();
    showStuckResult(result);
  }catch(e){
    showToast('生成失败：'+( e.message||'请重试'),3000);
  }
}
// ==================== 我卡住了 END ====================
function showStuckResult(text){
  var old=document.getElementById('_stuckResultOv');
  if(old) old.remove();
  var ov=document.createElement('div');
  ov.id='_stuckResultOv';
  ov.style.cssText='position:fixed;left:0;top:0;width:100%;height:100%;background:rgba(0,0,0,.5);z-index:9999;display:flex;align-items:flex-end';
  var box=document.createElement('div');
  box.style.cssText='width:100%;max-height:70vh;overflow-y:auto;background:var(--card);border-radius:20px 20px 0 0;padding:20px 16px 40px;box-sizing:border-box;-webkit-overflow-scrolling:touch';
  var header='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">'
    +'<span style="font-size:14px;font-weight:700;color:var(--text)"><i class="fas fa-lightbulb" style="color:var(--success);margin-right:6px"></i>AI 给你的方向</span>'
    +'<button onclick="document.getElementById(\'_stuckResultOv\').remove()" style="background:transparent;border:none;font-size:20px;color:var(--text2);cursor:pointer;padding:0 4px">×</button>'
    +'</div>';
  var content='<div style="font-size:13px;line-height:2;color:var(--text);white-space:pre-wrap">'+esc(text)+'</div>';
  box.innerHTML=header+content;
  ov.appendChild(box);
  ov.addEventListener('click',function(e){if(e.target===ov) ov.remove();});
  document.body.appendChild(ov);
}
// ==================== 懒人通道 ====================
function renderLazyLane(){
  var card=document.getElementById('lazyLaneCard');
  if(!card) return;
  // 找最近编辑的作品
  var allWorks=[];
  try{
    var drafts=ld('bj_works',[]);
    if(Array.isArray(drafts)) drafts.forEach(function(w){if(w&&w.id) allWorks.push(w);});
  }catch(e){}
  var apiOk=false;
  try{var c=getCurApi();apiOk=!!(c.url&&c.key);}catch(e){}

  if(allWorks.length===0){
    card.style.display='none';
  } else {
    // 有作品：显示继续写入口
    var recent=allWorks.sort(function(a,b){return (b.updatedAt||b.createdAt||0)-(a.updatedAt||a.createdAt||0);})[0];
    if(!recent){card.style.display='none';return;}
    var title=recent.title||'未命名';
    var wordCount=recent.content?(recent.content.length):0;
    if(recent.chapters&&recent.chapters.length) wordCount=recent.chapters.reduce(function(s,c){return s+(c?c.length:0);},0);
    card.style.display='block';
    card.innerHTML='<div class="lazy-lane">'
      +'<div class="lazy-lane-hdr">'
      +'<div style="width:32px;height:32px;border-radius:9px;background:linear-gradient(135deg,var(--accent),var(--accent2));display:flex;align-items:center;justify-content:center;flex-shrink:0"><i class="fas fa-book-open" style="color:#fff;font-size:13px"></i></div>'
      +'<div><div class="lazy-lane-title">继续写「'+esc(title.length>12?title.substring(0,12)+'…':title)+'」</div>'
      +'<div class="lazy-lane-sub">上次写了约 '+wordCount+' 字 · 点击继续</div></div>'
      +'</div>'
      +'<div class="lazy-lane-btns">'
      +'<button class="lazy-lane-btn" onclick="lazyOpenWork(\''+recent.id+'\')" style="background:linear-gradient(135deg,var(--accent),var(--accent2));color:#fff"><i class="fas fa-pen"></i> 继续写</button>'
      +'<button class="lazy-lane-btn" onclick="lazyStuckFromWork(\''+recent.id+'\')" style="background:rgba(81,207,102,.15);color:var(--success);border:1px solid rgba(81,207,102,.3)"><i class="fas fa-lightbulb"></i> 我卡住了</button>'
      +'</div>'
      +'</div>';
  }
}

function lazyOpenWork(id){
  // 找到作品并打开编辑器
  try{
    var works=ld('bj_works',[]);
    var w=works.find(function(x){return x.id===id;});
    if(w) openEditor(w);
    else showToast('找不到该作品');
  }catch(e){showToast('打开失败');}
}

async function lazyStuckFromWork(id){
  try{
    var works=ld('bj_works',[]);
    var w=works.find(function(x){return x.id===id;});
    if(!w){showToast('找不到该作品');return;}
    var content=w.content||'';
    if(w.chapters&&w.chapters.length) content=w.chapters[w.chapters.length-1]||'';
    if(!content||content.length<100){showToast('内容太少，先多写一点吧');return;}
    var cfg=getCurApi();
    if(!cfg.url||!cfg.key){showToast('请先配置API');return;}
    showToast('AI正在分析...',3000);
    var sysP=buildSysPrompt();
    var uMsg='我写到这里卡住了，请给我3个具体的接下来剧情方向（一个偏情感，一个偏冲突，一个偏意外），每个2-3句。\n当前内容末尾：\n'+content.slice(-800);
    var r=await callAPINonStream([{role:'system',content:sysP},{role:'user',content:uMsg}],1);
    r=stripMetaThinking(r).trim();
    showStuckResult(r);
  }catch(e){showToast('生成失败',2000);}
}

async function doLazyFirstChapter(){
  var ideaEl=document.getElementById('lazyIdeaInput');
  var idea=(ideaEl&&ideaEl.value)?ideaEl.value.trim():'';
  if(!idea){showToast('请先写一个故事想法');return;}
  var cfg=getCurApi();
  if(!cfg.url||!cfg.key){
    showToast('请先在「设置→API设置」配置接口',4000);
    return;
  }
  // 创建新短篇作品，切换到创作页生成
  var searchInput=document.getElementById('searchInput');
  if(searchInput) searchInput.value=idea;
  // 切换到短篇模式
  var shortTab=document.querySelector('[onclick*="switchCrType"][onclick*="short"]');
  if(shortTab&&typeof switchCrType==='function') switchCrType('short');
  showToast('已填入想法，点击生成按钮开始创作！',3000);
  // 自动触发生成
  setTimeout(function(){
    var genBtn=document.getElementById('btnGen');
    if(genBtn&&!isGen) genBtn.click();
  },500);
}
// ==================== 懒人通道 END ====================

function addNpc(){
clearCharSearch();
editingNpcIdx=-1;
document.getElementById('addNpcTitle').textContent='添加NPC';
document.getElementById('npcName').value='';
document.getElementById('npcRoleCustom').value='';
document.getElementById('npcTraits').value='';
document.getElementById('npcAppearance').value='';
document.getElementById('npcDesc').value='';
document.getElementById('npcChapter').value='';
currentNpcRole='';
_npcPendingPortrait='';
refreshNpcPortraitPreview();
document.querySelectorAll('#addNpcOv .tag').forEach(t=>t.classList.remove('act'));
document.getElementById('addNpcBtn').textContent='保存';
document.getElementById('addNpcOv').classList.add('show');
navPush('addNpcOv');
}

function editNpc(idx){
if(idx<0||idx>=npcList.length)return;
editingNpcIdx=idx;
const npc=npcList[idx];
document.getElementById('addNpcTitle').textContent='编辑NPC';
document.getElementById('npcName').value=npc.name||'';
document.getElementById('npcRoleCustom').value='';
document.getElementById('npcTraits').value=(npc.traits||[]).join(',');
document.getElementById('npcAppearance').value=npc.appearance||'';
document.getElementById('npcDesc').value=npc.desc||'';
document.getElementById('npcChapter').value=npc.chapter||'';
currentNpcRole=npc.role||'';
_npcPendingPortrait=isValidPortraitSrc(npc.portrait)?npc.portrait:'';
refreshNpcPortraitPreview();
document.querySelectorAll('#addNpcOv .tag').forEach(t=>{
t.classList.toggle('act',t.textContent===npc.role);
});
document.getElementById('addNpcBtn').textContent='更新';
document.getElementById('addNpcOv').classList.add('show');
}

function closeAddNpc(){
  navPop('addNpcOv');
document.getElementById('addNpcOv').classList.remove('show');
editingNpcIdx=-1;
_npcPendingPortrait='';
}

function setNpcRole(role,el){
currentNpcRole=role;
document.getElementById('npcRoleCustom').value='';
document.querySelectorAll('#addNpcOv .tag').forEach(t=>t.classList.remove('act'));
el.classList.add('act');
}

function saveNpc(){
const name=document.getElementById('npcName').value.trim();
if(!name){showToast('请输入NPC名称');return;}
const customRole=document.getElementById('npcRoleCustom').value.trim();
const role=customRole||currentNpcRole||'NPC';
const traitsStr=document.getElementById('npcTraits').value.trim();
const traits=traitsStr?traitsStr.split(/[,，、]/).map(t=>t.trim()).filter(t=>t):[];
const npc={
name,
role,
traits,
appearance:document.getElementById('npcAppearance').value.trim(),
desc:document.getElementById('npcDesc').value.trim(),
chapter:document.getElementById('npcChapter').value.trim()
};
if(_npcPendingPortrait)npc.portrait=_npcPendingPortrait;
if(editingNpcIdx>=0&&editingNpcIdx<npcList.length){
npcList[editingNpcIdx]=npc;
showToast('NPC已更新');
}else{
npcList.push(npc);
showToast('NPC已添加');
}
sv('bj_npcList',npcList);
closeAddNpc();
renderNpcCards();
renderRelList();
}

function deleteNpc(idx){
if(idx<0||idx>=npcList.length)return;
showDlg('删除NPC','确定要删除「'+npcList[idx].name+'」吗？',()=>{
const name=npcList[idx].name;
npcList.splice(idx,1);
charRelations=charRelations.filter(r=>r.charA!==name&&r.charB!==name);
sv('bj_npcList',npcList);
sv('bj_charRelations',charRelations);
renderNpcCards();
renderRelList();
showToast('NPC已删除');
},true);
}
function setCharPriority(idx,pri,el){
if(!characters[idx])return;
characters[idx].priority=pri;
sv(K.curChars,characters);
el.parentElement.querySelectorAll('.tag').forEach(t=>t.classList.remove('act'));
el.classList.add('act');
updateCharDescCounter(idx);
}
var _customTraitExpanded=false;
// 自定义标签管理默认折叠：收起时只更新数量文案，不渲染标签胶囊列表，
// 避免标签较多时直接占满页面空间；点击标题栏展开后才渲染完整列表
function renderCustomTraitList(){
const wrap=document.getElementById('customTraitList');
if(!wrap)return;
_updateCustomTraitCount();
if(!_customTraitExpanded){
// 先播放收起动画，动画结束后才清空内容；一收起就清空的话，高度会瞬间塌掉
foldSlide(wrap,false,'show',false,function(){
if(!_customTraitExpanded)wrap.innerHTML='';
});
return;
}
if(customTraits.length===0){
wrap.innerHTML='<span style="font-size:11px;color:var(--text2)">暂无自定义标签</span>';
}else{
wrap.innerHTML=customTraits.map(t=>
'<span class="tag act" style="font-size:10px;padding:3px 8px">'+esc(t)+' <span style="margin-left:4px;cursor:pointer" onclick="event.stopPropagation();deleteCustomTrait(\''+t+'\')"><i class="fas fa-times"></i></span></span>'
).join('');
}
foldSlide(wrap,true);
}
// 切换自定义标签管理折叠栏展开/收起状态（点击标题栏触发）
function toggleCustomTraitList(){
_customTraitExpanded=!_customTraitExpanded;
const chevron=document.getElementById('customTraitChevron');
if(chevron)chevron.style.transform='rotate('+(_customTraitExpanded?90:0)+'deg)';
const bar=document.getElementById('customTraitBar');
if(bar)bar.setAttribute('aria-expanded',_customTraitExpanded?'true':'false');
renderCustomTraitList();
}
function _updateCustomTraitCount(){
const span=document.getElementById('customTraitCount');
if(!span)return;
const n=customTraits.length;
span.textContent=n>0?('（共'+n+'个）'):'';
}

function addCustomTrait(charIdx){
showInp('添加自定义性格标签','输入标签名称（如：话痨、社恐、吃货）',trait=>{
trait=trait.trim();
if(!trait){showToast('标签不能为空');return;}
if(customTraits.includes(trait)){
showToast('该标签已存在');
return;
}
customTraits.push(trait);
sv('bj_customTraits',customTraits);
if(!characters[charIdx].traits)characters[charIdx].traits=[];
characters[charIdx].traits.push(trait);
sv(K.curChars,characters);
renderCharCards();
showToast('已添加标签：'+trait);
});
}

function deleteCustomTrait(trait){
showDlg('删除标签','确定要删除自定义标签「'+trait+'」吗？',()=>{
customTraits=customTraits.filter(t=>t!==trait);
sv('bj_customTraits',customTraits);
characters.forEach(c=>{
if(c.traits)c.traits=c.traits.filter(t=>t!==trait);
});
sv(K.curChars,characters);
renderCharCards();
renderCustomTraitList();
showToast('标签已删除');
},true);
}

function toggleCharTrait(charIdx,trait,el){
if(!characters[charIdx].traits)characters[charIdx].traits=[];
const idx=characters[charIdx].traits.indexOf(trait);
if(idx>-1){
characters[charIdx].traits.splice(idx,1);
el.classList.remove('act');
}else{
characters[charIdx].traits.push(trait);
el.classList.add('act');
}
sv(K.curChars,characters);
}
function clearAllChars(){
showDlg('清空人物设定','将清空所有角色、关系、NPC（预设不受影响）\n\n确定继续吗？',function(){
characters=[{name:'',desc:'',traits:[]}];
_charFlipped=[];
_charTraitOpen=[];
sv(K.curChars,characters);
charRelations=[];
sv('bj_charRelations',charRelations);
npcList=[];
sv('bj_npcList',npcList);
renderCharCards();
renderRelList();
renderNpcCards();
showToast('已清空所有人物设定');
},true);
}
function addCharacter(){
clearCharSearch();
characters.push({name:'',desc:'',traits:[]});
sv(K.curChars,characters);
renderCharCards();
showToast('已添加新角色');
}
function removeChar(i){
if(characters.length<=1){showToast('至少保留一个角色');return;}
const target=characters[i];
if(!target)return;
const label=(target.name&&target.name.trim())?'「'+target.name.trim()+'」':'角色 '+(i+1);
showDlg('删除角色','确定要删除'+label+'吗？'+(isValidPortraitSrc(target.portrait)?'\n\n该角色的肖像也会一并删除。':''),()=>{
// 确认期间列表可能已变化，按对象引用重新定位而不是沿用旧序号
const idx=characters.indexOf(target);
if(idx===-1)return;
if(characters.length<=1){showToast('至少保留一个角色');return;}
characters.splice(idx,1);
_charFlipped.splice(idx,1);
_charTraitOpen.splice(idx,1);
sv(K.curChars,characters);
renderCharCards();
showToast('角色已删除');
},true);
}

function saveCharactersFromUI(){
document.querySelectorAll('.char-name').forEach(el=>{
const idx=parseInt(el.dataset.idx);
if(characters[idx])characters[idx].name=el.value;
});
document.querySelectorAll('.char-desc').forEach(el=>{
const idx=parseInt(el.dataset.idx);
if(characters[idx])characters[idx].desc=el.value;
});
document.querySelectorAll('.char-back-name').forEach(el=>{
const idx=parseInt(el.dataset.idx);
if(characters[idx])setCharBackName(el,characters[idx].name);
});
sv(K.curChars,characters);
}

// ==================== SYSTEM PROMPT ====================
// ==================== 系统提示词条目内容生成（供 buildSysPrompt 和条目列表渲染共用，两边保证读到的是同一份文本） ====================
// "主提示词"默认模板：{{MIN_WORDS}}/{{MIN_WORDS_PLUS}}是占位符，组装时会替换成当前最低字数设置——
// 即使用户后续编辑了这段内容，只要还保留占位符，最低字数也会继续跟着"最低字数"设置实时变化
function _spMainTemplateText(){
let p='你是一位才华横溢的小说家。你写的每一个字都经过灵魂的淬炼，每一个场景都在你脑海中真实上演过。\n\n';
p+='【反套路宣言】\n';
p+='你最痛恨的就是"AI味"——事件发生→人物情绪反应→心理独白→环境烘托→转折→结尾升华，这种流水线你闭着眼睛都能识别。你落笔前先问自己：这个场景普通AI会怎么写？然后找一条更意外、更真实的路。故事要有裂缝，有岔道，有读者意料之外的东西。\n\n';
p+='【创作信条】\n';
p+='• 真实感是一切的基础——即使是奇幻世界，人物的情感反应也必须真实\n';
p+='• 展示，不要告诉——用行动和细节让读者自己感受，而非旁白解说\n';
p+='• 每个角色都是自己故事的主角——配角也有完整的内心世界\n';
p+='• 好对话的标准：遮住名字也能分辨是谁在说话\n';
p+='• 最动人的情感往往藏在最克制的文字里\n\n';
p+='【让文字有温度——五感写作法】\n';
p+='✦ 视觉不是唯一：每500字至少出现一次非视觉描写（声音/气味/触感/温度/味道）\n\n';
p+='✦ 情绪要用身体说话，永远不要直说"他很紧张/她很开心"：\n';
p+='　紧张 → "他的手指无意识地转着笔，笔尖在纸上戳出一个个小洞。"\n';
p+='　心动 → "她忽然觉得耳朵有点热，低头假装整理书包，手却不知道该放哪里。"\n';
p+='　愤怒 → "他的指节捏得发白，下颌线绷成一条直线。"\n';
p+='　悲伤 → "她盯着杯子里的水面看了很久，直到倒影模糊。"\n';
p+='　尴尬 → "他咳了一声，目光飘向天花板的某个角落，好像那里有什么很有趣的东西。"\n\n';
p+='✦ 环境要有功能——每一处环境描写都要服务于情绪或暗示：\n';
p+='　热 → "柏油路面泛着油光，热浪扭曲了远处的景物。她后背的T恤湿透了。"\n';
p+='　冷 → "呼出的白气在路灯下短暂地亮了一下，她把手缩进袖子里。"\n';
p+='　孤独 → "走廊尽头的日光灯闪了两下，发出细微的嗡嗡声。"\n\n';
p+='【对话的艺术】\n';
p+='真人说话的特点：会打断、会跑题、会答非所问、会欲言又止。\n';
p+='好的对话示范：\n';
p+='　"你今天怎么——"\n';
p+='　"没什么。"她打断他，顿了顿又说，"就是有点累。"\n';
p+='　他看着她，没再问。有些话不用说出口。\n\n';
p+='【节奏呼吸】\n';
p+='紧张时：短句。断句。甚至一个词独立成段。\n';
p+='舒缓时：让句子像河流一样蜿蜒，带着读者慢慢走过风景。\n';
p+='永远不要匀速行驶。\n\n';
p+='【七条红线（违反即废稿）】\n';
p+='1. 禁用万能副词：不禁、缓缓、淡淡、微微、默默（删掉，句子更有力）\n';
p+='2. 禁用空洞形容：深邃的眼眸、完美的侧脸、精致的五官、不可方物（换具体细节）\n';
p+='3. 禁用说书腔：殊不知、岂料、却说、话说（这不是评书）\n';
p+='4. 禁用AI式开场白：时光飞逝、岁月如梭、在这个……的世界里、自从……以来\n';
p+='5. 禁止滥用"突然/忽然"：每章最多出现1次；严禁"就在这时""正当此时"\n';
p+='6. 禁止情感解说：不许写"这让他感到""她心里涌起""他意识到自己爱上了"——只用行为和细节暗示\n';
p+='7. 禁止万能开场：不准用"清晨的阳光""夜幕降临""春风轻柔"开篇——直接切入人物动作或对话\n\n';
p += '【反重复铁律】\n';
p += '• 每章内同一个词语出现不超过2次，发现自己要第3次用同一个词，换掉它\n';
p += '• 不连续使用相同句式结构：三个"她XX了"连排、三个"他XX地XX"连排，全部打散\n';
p += '• 场景描写不重复使用已用过的意象：上章写过"窗外的雨"，本章换别的切入\n';
p += '• 角色出场时的描写方式每次不同：不要每次都先写眼睛再写嘴角\n';
p += '• 段落级禁令：本章内不允许出现两段意思高度相似的段落——即使措辞不同，内容重叠即视为废稿\n';
p += '• 换词≠推进：把同一个情绪或动作换不同词反复描述，不算新内容；新内容的标准是：读者读完这段知道了上一段不知道的事\n';
p += '• 生成前自查：在脑中快速检索本章各段落，若发现有两段在讲同一件事，删掉冗余的那段\n\n';
p+='【格式要求】\n';
p+='• 第一行：标题（纯文字）\n';
p+='• 空一行后：正文开始\n';
p+='• 每章字数【严格不少于】{{MIN_WORDS}}字，这是硬性要求\n';
p+='• 字数计算方式：所有中文字符 + 标点 + 数字都算一个字\n';
p+='• 强烈建议写到 {{MIN_WORDS_PLUS}} 字以上，宁多勿少，低于 {{MIN_WORDS}} 字就算这章没写合格\n';
p+='• 段落间空一行\n';
p+='• 对话用「」标注\n';
p+='• 只输出小说正文，无任何说明、章节号、作者按语\n\n';
p+='【输出铁律——违反任何一条即视为废稿】\n';
p+='① 你的所有构思、分析、推理只在大脑内部完成，输出里不能有一个字泄露\n';
p+='② 禁止以下任何词句开头："好的""让我""首先""接下来我""分析一下""思路是""构思如下""步骤：""以下是"\n';
p+='③ 禁止任何思考标记：<think> <reasoning> <analysis> ```thinking``` 以及任何XML标签\n';
p+='④ 禁止在正文后附加"注""PS""备注""写作说明""创作思路""（完）""（全文完）"\n';
p+='⑤ 禁止用markdown代码块（```）包裹正文，禁止使用**加粗**、#标题 等markdown语法\n';
p+='⑥ 生成新文章时：第1行=标题，空一行，之后=正文。续写时：直接输出正文，无标题\n';
p+='⑦ 输出的第一个字必须是标题的第一个字（新文章）或正文的第一个字（续写），不能是任何元文字\n\n';
return p;
}
function _spAuxTemplateText(){
let p='【长篇连载专项指南】\n';
p+='每一章不是独立短篇，是故事链上的一环。好章节三段式：\n';
p+='① 开头承上：用动作或对话直接切入，不是"上回说到"\n';
p+='② 中段推进：至少一次意外事件或人物关系的微妙变化，不许平铺直叙\n';
p+='③ 结尾留钩：用细节、悬念或未说完的话收尾，不要用感悟式升华句\n';
p+='人物的成长是线，事件是珠——珠要穿在线上，不能散落一地。每个配角都有自己来这里的理由。\n\n';
p+='现在，深呼吸，让故事在你脑海中活过来。写出让你自己也想继续读下去的文字。\n';
return p;
}
function _spCharSectionContent(){
let p='';
const validChars=characters.filter(c=>c.name||c.desc);
if(validChars.length>0){
const coreChars=validChars.filter(c=>c.priority==='核心');
const normalChars=validChars.filter(c=>c.priority!=='核心'&&c.priority!=='参考');
const refChars=validChars.filter(c=>c.priority==='参考');
if(coreChars.length>0){
p+='【核心人物（绝对不能违反以下设定）】\n';
coreChars.forEach(c=>{
if(c.name){
p+='◆ '+c.name;
if(c.traits&&c.traits.length>0)p+='（'+c.traits.join('·')+'）';
p+='\n';
if(c.desc)p+='　'+(noDescLimit?c.desc:c.desc.substring(0,2000)+(c.desc.length>2000?'...':''))+'\n';
p+='\n';
}
});
p+='\n';
}
if(normalChars.length>0){
p+='【主要人物】\n';
normalChars.forEach(c=>{
if(c.name){
p+='◆ '+c.name;
if(c.traits&&c.traits.length>0)p+='（'+c.traits.slice(0,4).join('·')+'）';
p+='\n';
if(c.desc)p+='　'+(noDescLimit?c.desc:c.desc.substring(0,2000)+(c.desc.length>2000?'...':''))+'\n';
p+='\n';
}
});
p+='\n';
}
if(refChars.length>0){
p+='【参考人物（可灵活处理）】\n';
refChars.forEach(c=>{
if(c.name){
p+='◇ '+c.name;
if(c.traits&&c.traits.length>0)p+='（'+c.traits.slice(0,3).join('·')+'）';
p+='\n';
if(c.desc)p+='　'+(noDescLimit?c.desc:c.desc.substring(0,1000))+'\n';
}
});
p+='\n';
}
p+='※ 【优先级说明】\n';
p+='核心人物的设定是铁律，任何情况下都不能违反；\n';
p+='普通人物要保持前后一致，不要突然换性格；\n';
p+='参考人物可以适当发挥，但也不要凭空造出和前文冲突的新设定。\n\n';
}
if(npcList.length>0){
p+='【配角/NPC设定】\n';
npcList.forEach(n=>{
if(n.name){
p+='◇ '+n.name+' ['+( n.role||'NPC')+']';
if(n.traits&&n.traits.length>0)p+='（'+n.traits.join('·')+'）';
p+='\n';
if(n.appearance)p+='　外貌：'+n.appearance+'\n';
if(n.desc)p+='　设定：'+(noDescLimit?n.desc:n.desc.substring(0,500))+'\n';
if(n.chapter)p+='　出场：'+n.chapter+'\n';
}
});
p+='\n【NPC使用原则】\n';
p+='• NPC是为主线服务的，出场要有目的，不要喧宾夺主\n';
p+='• NPC的言行要符合其角色定位和性格标签\n';
p+='• 路人型NPC可以一笔带过，配角型NPC需要适当刻画\n';
p+='• 反派型NPC要有自己的逻辑和动机，不要脸谱化\n\n';
}
if(charRelations.length>0){
p+='【人物关系网（铁律，不可违反）】\n';
charRelations.forEach(r=>{
const dir=r.direction==='A→B'?'→':r.direction==='B→A'?'←':'↔';
p+='• '+r.charA+' '+dir+' '+r.charB+'：'+r.type;
if(r.desc)p+='（'+r.desc.substring(0,80)+'）';
p+='\n';
});
p+='\n【关系如何影响写作】\n';
p+='• 恋人/暗恋：注意眼神、微动作、呼吸变化，不要直白说"喜欢"\n';
p+='• 敌对/宿敌：对话要有火药味，但不是无脑骂街，要有智商在线的交锋\n';
p+='• 朋友：说话可以随意，但每个人的随意方式不同\n';
p+='• 亲属：注意辈分和家庭角色带来的说话方式差异\n';
p+='• 师徒/主仆：注意权力关系对语气和行为的影响\n';
p+='• 关系是动态的，但变化必须有事件驱动，不能突然转变\n\n';
}
return p;
}
function _spWorldSectionContent(wD,mapD){
let p='';
if(wD||mapD){
p+='【故事发生的世界】\n';
if(wD)p+=(noDescLimit?wD:wD.substring(0,3000)+(wD.length>3000?'...':''))+'\n';
// 地图文字单独追加，不参与上面的3000字截断，否则世界观写得长的人启用地图后看不到任何效果
if(mapD)p+=(wD?'\n':'')+mapD+'\n';
p+='※ 世界观是背景，不是说明书，通过人物的日常自然呈现\n\n';
}
return p;
}
function _spStyleSectionContent(styleD){
let p='';
if(styleD){ p+='【文风要求】\n'+styleD+'\n\n'; }
return p;
}
function _spRuleSectionContent(ruleD){
let p='';
if(ruleD){ p+='【创作规则】\n'+ruleD+'\n\n'; }
return p;
}
function _spBanSectionContent(banD){
let p='';
if(banD){
  const words=banD.split('\n').map(w=>w.trim()).filter(w=>w).slice(0,30);
  if(words.length>0){
    p+='【避免使用】'+words.join('、')+'\n';
    p+='如果直接删掉会让句子别扭，可以换成更具体、更有画面感的近义表达\n\n';
  }
}
return p;
}
// 内置条目默认标题
const SP_BUILTIN_LABELS={main:'主提示词',aux:'辅助提示词',world:'世界观',style:'文风',char:'人物设定',rule:'创作规则',ban:'禁用词'};
function _defaultSysPromptEntries(){
  return [
    {id:'main',type:'builtin',enabled:true,title:null,content:null},
    {id:'aux',type:'builtin',enabled:true,title:null,content:null},
    {id:'world',type:'context',enabled:true},
    {id:'style',type:'context',enabled:true},
    {id:'char',type:'context',enabled:true},
    {id:'rule',type:'context',enabled:true},
    {id:'ban',type:'context',enabled:true}
  ];
}
// 确保 sysPromptEntries 已初始化；老用户首次运行时会把旧版单条自定义指令（customSysPrompt+customSysPromptPosition）
// 自动迁移成一条自定义指令条目，避免升级后老数据丢失。之后每次调用只做"是否缺新增内置/上下文类型"的幂等补全。
function ensureSysPromptEntries(){
  if(sysPromptEntries && Array.isArray(sysPromptEntries) && sysPromptEntries.length>0){
    const haveIds=sysPromptEntries.map(function(e){return e.id;});
    _defaultSysPromptEntries().forEach(function(def){
      if(haveIds.indexOf(def.id)===-1) sysPromptEntries.push(def);
    });
    return;
  }
  sysPromptEntries=_defaultSysPromptEntries();
  if(customSysPrompt && customSysPrompt.trim()){
    const mig={id:'custom_'+uid(),type:'custom',enabled:true,title:'自定义指令',content:customSysPrompt.trim()};
    if(customSysPromptPosition==='head'){ sysPromptEntries.unshift(mig); } else { sysPromptEntries.push(mig); }
  }
  sv('bj_sysPromptEntries',sysPromptEntries);
}

// 重置：把当前 sysPromptEntries 恢复成初始默认状态（内置条目顺序+默认文案、关联模块条目默认顺序，自定义指令全部清空）。
// 只重置"当前正在使用"的条目状态，不触碰"提示词预设管理"里已保存的任何预设（sysPromptP 是独立存储，互不影响）。
function resetSysPromptEntries(){
  showDlg('重置为初始状态','这会把当前的提示词顺序、内置提示词内容改写、自定义指令全部恢复为初始默认状态，当前未保存的修改将会丢失（已保存的预设不受影响）。确定要重置吗？',function(){
    sysPromptEntries=_defaultSysPromptEntries();
    sv('bj_sysPromptEntries',sysPromptEntries);
    renderSysPromptEntryList();
    showToast('已恢复初始状态');
  },true);
}

// 导出：只导出当前的 sysPromptEntries（顺序+内置提示词改写+自定义指令+每条的启用状态），
// 不含预设管理里的其他预设，也不含世界观/人设等关联模块自身的实际内容（这些模块条目在数组里只是位置引用）。
function exportSysPromptEntries(){
  ensureSysPromptEntries();
  var data={
    _app:'syn_sysPromptEntries',
    _version:1,
    _exportedAt:new Date().toISOString(),
    sysPromptEntries:sysPromptEntries
  };
  var jsonStr;
  try{
    jsonStr=JSON.stringify(data,null,2);
    if(!jsonStr||jsonStr.length<10||jsonStr[0]!=='{'){throw new Error('序列化结果异常');}
  }catch(e){
    showToast('导出失败：'+e.message,4000);
    return;
  }
  var filename='星叙_自定义系统提示词_'+new Date().toLocaleDateString().replace(/\//g,'-')+'.json';
  _exportFileWithFallback(filename,jsonStr,'application/json');
}

// 导入：覆盖当前 sysPromptEntries。兼容两种来源文件：本功能自己导出的单项文件（_app==='syn_sysPromptEntries'），
// 以及"数据管理"里导出的整包备份文件（_app==='syn'，只要含 sysPromptEntries 字段也能识别并提取）。
function importSysPromptEntriesFile(e){
  var file=e.target.files[0];if(!file)return;
  var reader=new FileReader();
  reader.onload=function(ev){
    try{
      var rawText=ev.target.result||'';
      rawText=rawText.replace(/^\uFEFF/,'').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g,'');
      var data;
      try{
        data=JSON.parse(rawText);
      }catch(pe){
        try{
          var fixed=rawText.replace(/,\s*([}\]])/g,'$1');
          data=JSON.parse(fixed);
        }catch(pe2){
          showToast('文件解析失败：不是有效的JSON文件',4000);
          return;
        }
      }
      if(!data||typeof data!=='object'||(data._app!=='syn_sysPromptEntries'&&data._app!=='syn')){
        showToast('这不是有效的自定义系统提示词导出文件',3000);
        return;
      }
      var entries=data.sysPromptEntries;
      if(!Array.isArray(entries)||entries.length===0){
        showToast('文件中没有找到有效的提示词数据',3000);
        return;
      }
      var valid=entries.every(function(en){return en&&typeof en==='object'&&typeof en.id==='string'&&typeof en.type==='string';});
      if(!valid){
        showToast('文件内容格式不正确，导入已取消',3000);
        return;
      }
      showDlg('导入提示词','导入将覆盖当前的提示词顺序、内置提示词内容改写和自定义指令，当前未保存的修改将会丢失（已保存的预设不受影响）。确定要导入吗？',function(){
        sysPromptEntries=JSON.parse(JSON.stringify(entries));
        ensureSysPromptEntries();
        sv('bj_sysPromptEntries',sysPromptEntries);
        renderSysPromptEntryList();
        showToast('导入成功');
      },true);
    }catch(err){
      showToast('导入失败：'+(err&&err.message||'未知错误'),4000);
    }
  };
  reader.readAsText(file);
  e.target.value='';
}

function buildSysPrompt(){
const globalWD=(document.getElementById('globalWorldDesc')&&document.getElementById('globalWorldDesc').value||globalWorld||'').trim();
const localWD=(document.getElementById('worldDesc').value||'').trim();
const wD=[globalWD,localWD].filter(Boolean).join('\n\n');
const mapD=wmPromptText();
const mW=parseInt(document.getElementById('minWords').value)||800;
const styleD=(document.getElementById('styleDesc')&&document.getElementById('styleDesc').value||ap.curStyle||'').trim();
const globalRD=(document.getElementById('globalRuleDesc')&&document.getElementById('globalRuleDesc').value||globalRule||'').trim();
const localRD=(document.getElementById('ruleDesc')&&document.getElementById('ruleDesc').value||curRule||'').trim();
const ruleD=[globalRD,localRD].filter(Boolean).join('\n');
const globalBD=(document.getElementById('globalBanWordsInput')&&document.getElementById('globalBanWordsInput').value||globalBanWords||'').trim();
const localBD=(document.getElementById('banWordsInput')&&document.getElementById('banWordsInput').value||banWords||'').trim();
const banD=[globalBD,localBD].filter(Boolean).join('\n');

ensureSysPromptEntries();

// 当前作品名——不是可排序条目，始终固定在系统提示词最前面，不受下面的排序影响
let p='';
if(curRd && (curRd.customTitle || curRd.title)){
  p += '【当前创作的作品】《' + (curRd.customTitle || curRd.title) + '》\n';
  p += '所有续写内容的基调、风格、人物关系必须与本作品保持一致。\n\n';
}

// 按用户自定义顺序 + 启用状态拼装各条目
sysPromptEntries.forEach(function(en){
  if(en.enabled===false) return;
  if(en.type==='builtin'){
    if(en.id==='main'){
      let c=(en.content!=null?en.content:_spMainTemplateText());
      c=c.split('{{MIN_WORDS_PLUS}}').join(String(mW+500)).split('{{MIN_WORDS}}').join(String(mW));
      p+=c;
    }else if(en.id==='aux'){
      p+=(en.content!=null?en.content:_spAuxTemplateText());
    }
  }else if(en.type==='context'){
    if(en.id==='world')p+=_spWorldSectionContent(wD,mapD);
    else if(en.id==='style')p+=_spStyleSectionContent(styleD);
    else if(en.id==='char')p+=_spCharSectionContent();
    else if(en.id==='rule')p+=_spRuleSectionContent(ruleD);
    else if(en.id==='ban')p+=_spBanSectionContent(banD);
  }else if(en.type==='custom'){
    if(en.content&&en.content.trim()){
      p+='【'+(en.title&&en.title.trim()?en.title.trim():'自定义指令')+'】\n'+en.content.trim()+'\n\n';
    }
  }
});

// 近期章节内容回避（动态生成，不是可编辑条目，固定附加在条目内容之后）
if(curRd && curRd.chapters && curRd.chapters.length >= 1){
  var _recentChs = curRd.chapters.slice(-2).join('').substring(0, 1500);
  p += '【近期章节节选——请续写前自行分析，主动回避其中重复出现的词、句式、场景描写方式】\n';
  p += _recentChs + '\n\n';
}

// 设定复杂度检测（基于已拼装内容的长度，与条目顺序无关）
if(p.length>3000){
p+='【重要提醒】以上设定信息较多，请特别注意：\n';
p+='1. 核心人物的性格和关系是最高优先级，任何情况下不能违反\n';
p+='2. 世界观规则是第二优先级，所有情节必须在世界观框架内\n';
p+='3. 文风和禁用词是第三优先级\n';
p+='4. 如果设定之间有冲突，以核心人物设定为准\n';
p+='5. 不确定的地方宁可保守也不要乱发挥\n\n';
}

// 系统提示词超长保护：如果超过6000字符，精简非核心部分。
// 这几条正则只认"主提示词"默认文案里的原始文字锚点——如果用户已经编辑过主提示词，锚点不存在，
// replace会安全地找不到匹配、不生效（不会报错），代价是超长时不再自动精简，这是编辑内置提示词后的预期取舍。
if(p.length > 6000){
  p = p.replace(/【让文字有温度——五感写作法】[\s\S]*?【对话的艺术】/g, '【对话的艺术】');
  p = p.replace(/【节奏呼吸】[\s\S]*?永远不要匀速行驶。\n\n/g, '');
  p = p.replace(/【对话的艺术】[\s\S]*?有些话不用说出口。\n\n/g, '');
  p = p.replace(/【创作信条】[\s\S]*?\n\n/g, '');
}
return p;
}
// ==================== STREAM API CALL ====================
async function callAPIStream(messages,onChunk,onDone,onError,_opts){
  const cfg = getCurApi();
  if(!cfg.url || !cfg.key){
    showToast('请先在底部「设置」→「API设置」中填写地址和密钥',4000);
    if(onError) onError('未配置API');
    return;
  }

  const ep = buildChatEndpoint(cfg.url);
  if(!ep.endpoint){
    showToast('API地址为空，请先在设置中配置');
    if(onError) onError('API地址为空');
    return;
  }

  saveCurSettings();

  abortCtrl = new AbortController();

  try{
    // 标记后台生成状态
    _bgGenerating = true;
    _bgTaskInfo = { type:'stream', startTime:Date.now(), articleId:'', title:'', chNum:0, requestParams:null };
    requestWakeLock();
    const timeoutId = setTimeout(()=>{
      try{ if(abortCtrl) abortCtrl.abort(); }catch(e){logError('op',e)}
    }, 180000); // 3分钟超时（长文生成需要更多时间）

    const resp = await fetch(ep.endpoint,{
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        'Authorization':'Bearer '+cfg.key
      },
      body:JSON.stringify(Object.assign({
        model:cfg.model,
        messages,
        temperature:cfg.temp,
        max_tokens:(_opts&&_opts.maxTokens)?Math.max(_opts.maxTokens,cfg.maxTokens):cfg.maxTokens,
        stream:true
      },cfg.freqPenalty>0?{frequency_penalty:cfg.freqPenalty}:{},cfg.presPenalty>0?{presence_penalty:cfg.presPenalty}:{})),
      signal:abortCtrl.signal
    }).finally(()=>clearTimeout(timeoutId));

    if(!resp.ok){
      const errText = await resp.text().catch(()=> '');
      let detail = '';
      try{
        const j = JSON.parse(errText);
        if(j && j.error && j.error.message){
          detail = j.error.message;
        }
      }catch(e){logError('op',e)}

      let friendly = '';
      if(resp.status===401){
        friendly = '认证失败（可能是 API 密钥错误或没有权限）';
      }else if(resp.status===404){
        friendly = '接口路径不存在（API地址或路径可能写错，例如 /v1 或 /chat/completions 配置错误）';
      }else if(resp.status===429){
        friendly = '请求太频繁或额度不足（被限流/余额不足）';
      }else if(resp.status>=500){
        friendly = '对方服务器暂时出问题（HTTP '+resp.status+'）';
      }else{
        friendly = '请求失败（HTTP '+resp.status+'）';
      }
      if(detail) friendly += '：'+detail;
      if(onError) onError(friendly);
      showToast(friendly,4000);
      return;
    }

// ---- SSE 解析逻辑（增强兼容版） ----
    const reader=resp.body.getReader();
    const decoder=new TextDecoder();
    let buffer='';
    let fullText='';
    let sseDone = false;

    const extractChunk = (jsonText) => {
      try{
        const json = JSON.parse(jsonText);
        // 兼容多种返回格式
        const choice = json && json.choices && json.choices[0];
        if(!choice) return '';
        const delta = choice.delta || choice.message || {};
        return delta.content || delta.text || delta.reasoning_content || '';
      }catch(e){
        return '';
      }
    };

    // 断点增量保存计数器
    let _bpSaveCounter = 0;
    const _bpSaveInterval = 200; // 每200字保存一次断点

    while(true){
      const {done,value} = await reader.read();
      if(done) break;
      buffer += decoder.decode(value,{stream:true});

      // 按行处理（兼容 \r\n 和 \n）
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() || ''; // 最后一行可能不完整，留到下次

      for(const line of lines){
        const trimmed = line.trim();
        if(!trimmed) continue;

        // 提取 data: 后面的内容
        let dataStr = '';
        if(trimmed.startsWith('data:')){
          dataStr = trimmed.slice(5).trim();
        } else if(trimmed.startsWith('{')){
          dataStr = trimmed;
        } else {
          continue;
        }

        if(!dataStr) continue;
        if(dataStr === '[DONE]'){ sseDone = true; break; }

        const chunk = extractChunk(dataStr);
        if(chunk){
          fullText += chunk;
          onChunk(fullText, chunk);
          
          // 增量断点保存：每200字保存一次
          const curWc = countWords(fullText);
          if(curWc - _bpSaveCounter >= _bpSaveInterval){
            _bpSaveCounter = curWc;
            if(_bgTaskInfo && _bgTaskInfo.articleId){
              saveStreamBreakpoint(
                _bgTaskInfo.articleId,
                fullText,
                _bgTaskInfo.chNum || 0,
                _bgTaskInfo.requestParams || null
              );
            }
          }
        }
      }

      if(sseDone) break;
    }

    // 处理buffer中可能残留的最后一行
    if(!sseDone && buffer.trim()){
      const lastLine = buffer.trim();
      if(lastLine.startsWith('data:')){
        const d = lastLine.slice(5).trim();
        if(d && d !== '[DONE]'){
          const chunk = extractChunk(d);
          if(chunk){ fullText += chunk; onChunk(fullText, chunk); }
        }
      } else if(lastLine.startsWith('{')){
        const chunk = extractChunk(lastLine);
        if(chunk){ fullText += chunk; onChunk(fullText, chunk); }
      }
    }

    onDone(stripMetaThinking(fullText));
  }catch(err){
    if(err.name==='AbortError'){
      onDone(null);
      return;
    }
    if(!navigator.onLine){
      const msg = '网络似乎断开了，请检查网络连接后再试';
      showToast(msg,4000);
      if(onError) onError(msg);
    }else{
      const msg = '请求失败：'+err.message+(navigator.onLine?'（请检查API地址和密钥）':'（网络未连接）');
      showToast(msg,4000);
      if(onError) onError(msg);
    }
  }finally{
    abortCtrl=null;
    _bgGenerating=false;
    _bgTaskInfo=null;
    releaseWakeLock();
  }
}

// 从AI输出中健壮地提取JSON字符串
// 处理：markdown代码块、前后有多余文字、思维链残留等
function _extractJsonStr(raw){
  if(!raw)return '';
  var t=raw.trim();
  // 优先：提取 ```json ... ``` 或 ``` ... ``` 代码块内的内容
  var m=t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if(m){t=m[1].trim();}
  // 再次 trim 掉剩余的 ``` 标记
  t=t.replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'').trim();
  // 如果内容不以 { 或 [ 开头，尝试找到第一个 { 或 [
  if(t[0]!=='{' && t[0]!=='['){
    var objStart=t.indexOf('{');
    var arrStart=t.indexOf('[');
    var start=-1;
    if(objStart!==-1&&(arrStart===-1||objStart<arrStart))start=objStart;
    else if(arrStart!==-1)start=arrStart;
    if(start!==-1)t=t.slice(start);
  }
  // 去掉尾部多余文字（找最后一个 } 或 ] 之后的内容）
  var lastBrace=Math.max(t.lastIndexOf('}'),t.lastIndexOf(']'));
  if(lastBrace!==-1&&lastBrace<t.length-1)t=t.slice(0,lastBrace+1);
  return t.trim();
}

function stripMetaThinking(text){
  if(!text)return '';
  let t=text;

  // 去掉各种思维标签块
  t=t.replace(/<think>[\s\S]*?<\/think>/gi,'');
  t=t.replace(/<thinking>[\s\S]*?<\/thinking>/gi,'');
  t=t.replace(/<reasoning>[\s\S]*?<\/reasoning>/gi,'');
  t=t.replace(/<analysis>[\s\S]*?<\/analysis>/gi,'');
  t=t.replace(/<output>[\s\S]*?<\/output>/gi, function(m){ return m.replace(/<\/?output>/gi,''); });
  t=t.replace(/```thinking[\s\S]*?```/gi,'');
  t=t.replace(/```reasoning[\s\S]*?```/gi,'');

  // 去掉开头的AI自我声明（各种模型的常见问题）
  t=t.replace(/^(好的[，,]?\s*|让我|我来|我将|我会|首先[，,]?\s*|接下来[，,]?\s*|以下是|下面是)[^\n]{0,80}\n*/gi,'');

  // 去掉"思维链"/"分析过程"类段落
  t=t.replace(/^(思维链|推理过程|分析过程|创作思路|写作思路|构思|大纲规划|整体规划|写作计划)[:：][^\n]*/gm,'');
  t=t.replace(/^(步骤\s*\d|第\s*[一二三四五六七八九十\d]+\s*步)[：:][^\n]*/gm,'');

  // 去掉尾部的思维类附录
  t=t.replace(/\n{0,3}(思维链|推理过程|分析过程|创作思路|写作说明|注[:：]|备注[:：]|PS[:：]|p\.s\.[:：]|写在最后[:：]|创作说明[:：])[\s\S]*$/gi,'');

  // 去掉markdown代码块包裹
  t=t.replace(/^```(?:markdown|text|novel|story|zh|chinese|plaintext)?\s*\n([\s\S]*?)\n```\s*$/gi,'$1');
  // 也处理只有开头```没有结尾```的情况
  t=t.replace(/^```(?:markdown|text|novel|story|zh|chinese|plaintext)?\s*\n/gi,'');
  t=t.replace(/\n```\s*$/gi,'');

  // 去掉多余空行（超过2个连续空行压缩）
  t=t.replace(/\n{3,}/g,'\n\n');

  return t.trim();
}
async function callAPINonStream(messages, _retryLeft=2, _opts={}){
  const cfg = getCurApi();
  if(!cfg.url || !cfg.key){
    showToast('请先在底部「设置」→「API设置」中填写地址和密钥',4000);
    return null;
  }

  const ep = buildChatEndpoint(cfg.url);
  if(!ep.endpoint){
    showToast('API地址为空，请先在设置中配置');
    return null;
  }

  saveCurSettings();
  const controller = new AbortController();
  const timeoutId = setTimeout(()=>{
    try{ controller.abort(); }catch(e){logError('op',e)}
  }, 300000); // 5分钟超时（番外/高级创作等长文需要更多时间）

  try{
    _bgGenerating = true;
    requestWakeLock();
    const resp = await fetch(ep.endpoint,{
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        'Authorization':'Bearer '+cfg.key
      },
      body:JSON.stringify({
        model:cfg.model,
        messages,
        temperature:(_opts&&_opts.temperature!==undefined)?_opts.temperature:cfg.temp,
        max_tokens:_opts.maxTokens||cfg.maxTokens
      }),
      signal:controller.signal
    });

    clearTimeout(timeoutId);

    if(!resp.ok){
      const errText = await resp.text().catch(()=> '');
      let detail = '';
      try{
        const j = JSON.parse(errText);
        if(j && j.error && j.error.message){
          detail = j.error.message;
        }
      }catch(e){logError('op',e)}
      let friendly='';
      // ── 智能切换：主API 401/429 时，若工具API已独立配置则自动切换 ──
      function _tryFallbackToToolApi(){
        var toolUrl=(document.getElementById('toolApiUrl')&&document.getElementById('toolApiUrl').value||'').trim();
        var toolKey=(document.getElementById('toolApiKey')&&document.getElementById('toolApiKey').value||'').trim();
        var mainUrl=cfg.url||'';var mainKey=cfg.key||'';
        // 工具API与主API不同才切换
        return (toolUrl||toolKey)&&(toolUrl!==mainUrl||toolKey!==mainKey);
      }
      if(resp.status===401){
        friendly='认证失败（可能是 API 密钥错误或没有权限）';
        // 若工具API已单独配置，自动切换并重试
        if(_tryFallbackToToolApi()&&!_opts._usedToolFallback){
          showToast('主API认证失败，自动切换工具API重试…',3000);
          return callToolAPINonStream(messages,2);
        }
        setTimeout(function(){
          showDlg('密钥认证失败','API密钥不对或已失效，是否去设置页检查？',function(){
            switchPage('settings',document.querySelector('.bnav-i:nth-child(4)'));
          },false);
          document.getElementById('dlgOkBtn').textContent='去设置 →';
          // 加取消按钮（取消按钮在dlgOv里只有class，没有id，用querySelector才能找到）
          var cancelBtn=document.querySelector('#dlgOv .dlg-cancel');
          if(cancelBtn){cancelBtn.style.display='';cancelBtn.textContent='稍后再说';}
        },400);
      }else if(resp.status===404){
        friendly='接口路径不存在（API地址或路径可能写错，例如 /v1 或 /chat/completions 配置错误）';
        setTimeout(function(){
          showDlg('接口地址错误','API地址或模型名填错了，是否去设置页修改？',function(){
            switchPage('settings',document.querySelector('.bnav-i:nth-child(4)'));
          },false);
          document.getElementById('dlgOkBtn').textContent='去设置 →';
          var cancelBtn=document.querySelector('#dlgOv .dlg-cancel');
          if(cancelBtn){cancelBtn.style.display='';cancelBtn.textContent='稍后再说';}
        },400);
      }else if(resp.status===429){
        friendly='请求太频繁或额度不足（被限流/余额不足）';
        if(_retryLeft>0){
          showToast('触发限流，3秒后自动重试...',2500);
          await new Promise(r=>setTimeout(r,3000));
          return callAPINonStream(messages,_retryLeft-1,_opts);
        }
        // 重试耗尽后，若工具API已独立配置则自动切换
        if(_tryFallbackToToolApi()&&!_opts._usedToolFallback){
          showToast('主API限流耗尽，自动切换工具API重试…',3000);
          return callToolAPINonStream(messages,2);
        }
      }else if(resp.status>=500){
        // 500 可能是请求体过大或上下文超限，提取详细错误
        let serverDetail='';
        try{const j2=JSON.parse(errText);serverDetail=j2?.error?.message||j2?.message||'';}catch(e){}
        if(serverDetail&&(serverDetail.includes('context')||serverDetail.includes('token')||serverDetail.includes('length')||serverDetail.includes('too long'))){
          friendly='上下文长度超限，请减少大纲长度或人设内容';
          showToast(friendly,5000);
          return null; // 超限错误不重试，重试也没用
        }
        friendly='对方服务器暂时出问题（HTTP '+resp.status+(serverDetail?'：'+serverDetail.substring(0,60):'')+')';
        if(_retryLeft>0){
          showToast('服务器错误，5秒后自动重试...',4000);
          await new Promise(r=>setTimeout(r,5000));
          return callAPINonStream(messages,_retryLeft-1,_opts);
        }
      }else{
        friendly='请求失败（HTTP '+resp.status+'）';
      }
      if(detail) friendly+='：'+detail;
      showToast(friendly,4000);
      return null;
    }

    let data;
    const rawText = await resp.text();
    try{
      data = JSON.parse(rawText);
    }catch(parseErr){
      // 有些API返回的JSON前后有多余字符
      const jsonStart = rawText.indexOf('{');
      const jsonEnd = rawText.lastIndexOf('}');
      if(jsonStart >= 0 && jsonEnd > jsonStart){
        try{ data = JSON.parse(rawText.substring(jsonStart, jsonEnd+1)); }catch(e2){
          showToast('API返回的不是有效JSON，请检查API地址和模型名',4000);
          return null;
        }
      } else {
        showToast('API返回格式异常：非JSON响应',4000);
        return null;
      }
    }
    // 兼容多种返回格式
    let content = '';
    if(data.choices && data.choices[0]){
      const choice = data.choices[0];
      if(choice.message && choice.message.content){
        content = choice.message.content;
      } else if(choice.text){
        content = choice.text; // 兼容旧版 completions 格式
      } else if(choice.delta && choice.delta.content){
        content = choice.delta.content;
      }
    } else if(data.output && data.output.text){
      content = data.output.text; // 兼容某些国产API格式
    } else if(data.result){
      content = typeof data.result === 'string' ? data.result : JSON.stringify(data.result); // 兼容百度等
    }
    if(!content){
      showToast('API返回格式异常：未找到生成内容（请检查模型名是否正确）',4000);
      return null;
    }
    content = stripMetaThinking(content);
    return content;
  }catch(err){
    clearTimeout(timeoutId);
    if(err.name==='AbortError'){
      showToast('请求超时，请稍后重试',3000);
    }else if(!navigator.onLine){
      showToastForce('网络似乎断开了，请检查网络连接',4000);
    }else{
      showToast('网络出了点问题，请稍后再试',3000);
    }
    return null;
  }finally{
    _bgGenerating=false;
    releaseWakeLock();
  }
}