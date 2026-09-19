/*
╔══════════════════════════════════════════════════════════════════
║  星叙 script-4-aitools.js — JS 结构目录（拆分 4/5）
║  主题：AI工具集 & 创意工具 & 高级续写
║
║  本文件是原 script.js 按功能板块拆成的 5 份之一，浏览器里需要按顺序加载：
║  script-1-core.js → script-2-content.js → script-3-settings.js → script-4-aitools.js → script-5-system.js
║  （原单文件共 40191 行；本文件对应原文件第 16072~28136 行，body 共 12065 行）
╠══════════════════════════════════════════════════════════════════
║   RESOURCE                        54
║   RESOURCE EXPORT                 622
║   HANDBOOK                        953
║   USER CARD                       1087
║   设定健康检查                          1128
║   设定健康检查 END                      1294
║   写作统计弹窗                          1295
║   写作统计弹窗 END                      1470
║   浏览器持久化存储保护                      1644
║   存储空间满提醒（开关UI，需先获得持久化存储保护才可关闭）   1768
║   存储空间满时的备份提醒                     1812
║   头像裁剪系统                          1864
║   OUTLINE GENERATOR               2073
║   章节多版本管理                         2093
║   收藏批量管理                          2258
║   导入TXT文件                         2460
║   快速设置向导                          2628
║   精华压缩器执行                         2971
║   AI REWRITE                      3653
║   文件夹打包导出为zip                     4478
║   本地文件夹导入                         4584
║   旧版二进制Word(.doc)解析（OLE复合文档格式）    4746
║   长图 (.png) 导出                    5537
║   文章重写功能                          6069
║   修订模式差异对比                        6384
║   故事转盘                            6629
║   NAME GENERATOR                  7140
║   写作基因提取器                         7315
║   丰富设定                            7714
║   角色设计器                           7948
║   情节分支器                           8628
║   高级创作模式                          8765
║   上下文编辑器                          9947
║   全局变量定义区                         9948
║   智能续写                            10547
║   伏笔追踪器                           10989
║   续写质量反馈                          11230
║   GEN LOG 生成日志                    11355
║   清除所有数据                          11529
║   AUTO BACKUP                     11833
║   TTS 语音朗读                        11881
╚══════════════════════════════════════════════════════════════════
*/

// ==================== RESOURCE ====================
function toggleResActionMenu(btn){
  var old=document.getElementById('resActionMenuPop');
  if(old){old.remove();btn._menuOpen=false;return;}
  if(btn._menuClosedAt&&Date.now()-btn._menuClosedAt<200)return;
  btn._menuOpen=true;
  var pop=document.createElement('div');
  pop.id='resActionMenuPop';
  pop.className='pop-glass-menu';
pop.style.cssText='position:fixed;z-index:300;min-width:160px;padding:6px 0;animation:fadeIn .15s ease';
  var items=[
    {icon:'fa-file-export',text:'打包导出',fn:function(){openResExport();}},
    {icon:'fa-file-import',text:'导入资源包',fn:function(){document.getElementById('resImpFile').click();}},
    {icon:'fa-boxes',text:'资源包管理',fn:function(){openResPackManager();}},
    {icon:'fa-upload',text:'上传我的资源',fn:function(){showUploadResInfo();},sub:'发送给创作者，审核后上线'}
  ];
  items.forEach(function(it){
    var d=document.createElement('div');
    d.style.cssText='padding:12px 16px;font-size:13px;cursor:pointer;display:flex;align-items:center;gap:8px;color:var(--text)';
    d.innerHTML='<i class="fas '+it.icon+'" style="width:16px;text-align:center;color:var(--text2)"></i>'+it.text;
    d.addEventListener('click',function(e){
      e.preventDefault();e.stopPropagation();
      _closePopMenu('resActionMenuPop',btn);
      setTimeout(function(){it.fn();},50);
    });
    pop.appendChild(d);
  });
  document.body.appendChild(pop);
  _positionPopMenu(pop,btn);
  _bindPopMenuClose('resActionMenuPop',btn);
}
var _resMgrTab='official';
function openResPackManager(){
  var existing=document.getElementById('resPackMgrOv');
  if(existing) existing.remove();
  var ov=document.createElement('div');
  ov.id='resPackMgrOv';
  ov.style.cssText='position:fixed;inset:0;z-index:2000;background:var(--bg);display:flex;flex-direction:column;animation:slideUp .3s ease';
  var hdr='<div style="position:sticky;top:0;z-index:10;background:var(--card);border-bottom:1px solid var(--border)">'
    +'<div style="padding:14px 16px;display:flex;align-items:center;justify-content:space-between">'
    +'<span style="font-size:15px;font-weight:700"><i class="fas fa-boxes"></i> 资源包管理</span>'
    +'<button onclick="document.getElementById(\'resPackMgrOv\').remove()" style="padding:6px 14px;border-radius:8px;border:1px solid var(--border);background:transparent;color:var(--text);font-size:12px;cursor:pointer">关闭</button>'
    +'</div>'
    +'<div style="display:flex;border-top:1px solid var(--border)">'
    +['official','recommend','other'].map(function(t,i){
      var labels=['官方','用户投稿','已导入'];
      var latestTag=_getLatestReleaseTag();
      var newBadge=((t==='official'||t==='recommend')&&latestTag&&builtinPacks.some(function(p){var bt=(t==='official'?p._badge==='official':p._badge==='recommend');if(!bt||!p._releaseTag)return false;var d=(new Date(latestTag)-new Date(p._releaseTag))/86400000;return d>=0&&d<=7;}))?'<span style="display:inline-block;font-size:9px;font-weight:700;padding:1px 5px;border-radius:5px;background:linear-gradient(135deg,#ff6b6b,#ee5a24);color:#fff;margin-left:5px;vertical-align:middle;line-height:1.5">新</span>':'';
      var isAct=_resMgrTab===t;
      return '<button onclick="switchResMgrTab(\''+t+'\',this)" style="flex:1;padding:9px;text-align:center;font-size:13px;font-weight:600;cursor:pointer;border:none;border-bottom:2px solid '+(isAct?'var(--accent)':'transparent')+';color:'+(isAct?'var(--accent2)':'var(--text2)')+';transition:all .3s;background:none">'+labels[i]+newBadge+'</button>';
    }).join('')
    +'</div>'
    +'</div>';
  var body='<div id="resMgrBody" style="flex:1;overflow-y:auto;padding:14px 16px">'+_renderResMgrPacks(_resMgrTab)+'</div>';
  ov.innerHTML=hdr+body;
  document.body.appendChild(ov);
}
function switchResMgrTab(tab,el){
  _resMgrTab=tab;
  var tabs=document.querySelectorAll('#resPackMgrOv [onclick^="switchResMgrTab"]');
  var labels=['官方','用户投稿','已导入'];
  var tabKeys=['official','recommend','other'];
  tabs.forEach(function(b,i){
    var isAct=tabKeys[i]===tab;
    b.style.borderBottomColor=isAct?'var(--accent)':'transparent';
    b.style.color=isAct?'var(--accent2)':'var(--text2)';
  });
  var body=document.getElementById('resMgrBody');
  if(body) body.innerHTML=_renderResMgrPacks(tab);
}
function _renderResMgrPacks(tab){
  var allPacks=_getAllPacks();
  var filtered;
  if(tab==='official') filtered=allPacks.filter(function(p){return p._badge==='official';});
  else if(tab==='recommend') filtered=allPacks.filter(function(p){return p._badge==='recommend';});
  else filtered=allPacks.filter(function(p){return !p._builtin;});
  if(filtered.length===0){
    var emptyMsg=tab==='official'?'暂无官方资源包':tab==='recommend'?'暂无用户投稿资源包':'还没有导入过资源包<br><small style="font-size:11px">点击右上角「+」→「导入资源包」添加</small>';
    return '<div style="text-align:center;padding:40px 0;color:var(--text2);font-size:13px">'+emptyMsg+'</div>';
  }
  var html='';
  filtered.forEach(function(pack){
    var count=pack.items?pack.items.length:0;
    var time=pack.createdAt?new Date(pack.createdAt).toLocaleDateString():'';
    var isBuiltin=pack._builtin||false;
    var officialTag=_getResBadgeHtml(pack._badge||'');
    var newTag=_isPackNew(pack)?'<span style="display:inline-block;font-size:9px;font-weight:700;padding:1px 5px;border-radius:5px;background:linear-gradient(135deg,#ff6b6b,#ee5a24);color:#fff;margin-left:5px;vertical-align:middle;line-height:1.5">新</span>':'';
    html+='<div style="background:var(--card);border:1px solid '+(isBuiltin?'rgba(108,92,231,.35)':'var(--border)')+';border-radius:12px;padding:14px;margin-bottom:12px">';
    html+='<div style="font-size:14px;font-weight:700;margin-bottom:4px">'+esc(pack.name||'未命名')+officialTag+newTag+'</div>';
    if(pack.author) html+='<div style="font-size:11px;color:var(--text2);margin-bottom:2px">作者：'+esc(pack.author)+'</div>';
    if(pack.desc) html+='<div style="font-size:11px;color:var(--text2);margin-bottom:6px">'+esc(pack.desc)+'</div>';
    html+='<div style="font-size:11px;color:var(--text2);margin-bottom:10px">'+count+'项资源'+(time?' · '+time:'')+(isBuiltin?' · 内置，不可删除':'')+'</div>';
    html+='<div style="display:flex;flex-wrap:wrap;gap:8px">';
    html+='<button onclick="resPackMgrApplyAll(\''+pack.id+'\')" style="padding:7px 14px;border-radius:8px;border:none;background:var(--accent);color:#fff;font-size:12px;cursor:pointer"><i class="fas fa-magic"></i> 一键使用</button>';
    html+='<button onclick="resPackMgrView(\''+pack.id+'\')" style="padding:7px 14px;border-radius:8px;border:1px solid var(--border);background:transparent;color:var(--text);font-size:12px;cursor:pointer"><i class="fas fa-eye"></i> 查看内容</button>';
    if(!isBuiltin){
      html+='<button onclick="resPackMgrDelete(\''+pack.id+'\')" style="padding:7px 14px;border-radius:8px;border:1px solid rgba(255,107,107,.3);background:transparent;color:var(--danger);font-size:12px;cursor:pointer"><i class="fas fa-trash-alt"></i> 删除</button>';
    }
    html+='</div></div>';
  });
  return html;
}
function resPackMgrApplyAll(id){
  var pack=_getAllPacks().find(function(p){return p.id===id;});
  if(!pack||!pack.items||!pack.items.length){showToast('资源包为空');return;}
  var typeLabels={char:'人物设定',world:'世界观',style:'文风',rule:'规则',work:'作品',exp:'素材',ban:'禁用词'};
  var typesSummary=[...new Set(pack.items.map(function(it){return typeLabels[it.type]||it.type;}))].join('、');
  showDlg('一键使用资源包',
    '将应用「'+esc(pack.name||'未命名')+'」中的全部资源（共'+pack.items.length+'项：'+typesSummary+'）。\n\n注意：人物/世界观/文风/规则/禁用词将覆盖当前对应设定，作品将追加到创作页。素材类不自动应用。\n\n是否继续？',
    function(){
      var count=0;
      var skipped=0;
      pack.items.forEach(function(item){
        var ok=_applySingleItemSilent(item);
        if(ok)count++;else skipped++;
      });
      // 批量应用后统一刷新UI
      if(typeof renderCharCards==='function')renderCharCards();
      if(typeof renderNpcCards==='function')renderNpcCards();
      saveCurSettings();
      var msg='已应用'+count+'项资源';
      if(skipped>0)msg+='（'+skipped+'项素材未自动应用，可在素材工坊单独使用）';
      showToast(msg,3000);
    }
  );
}
function resPackMgrView(id){
  var pack=_getAllPacks().find(function(p){return p.id===id;});
  if(!pack){return;}
  var typeLabels={char:'人物',world:'世界观',style:'文风',rule:'规则',work:'作品',exp:'素材',ban:'禁用词'};

  var ov=document.createElement('div');
  ov.style.cssText='position:fixed;inset:0;z-index:2100;background:var(--bg);display:flex;flex-direction:column;animation:slideUp .3s ease';

  var hdrHtml='<div style="position:sticky;top:0;z-index:10;background:var(--card);border-bottom:1px solid var(--border);padding:14px 16px;display:flex;align-items:center;gap:10px;flex-shrink:0">';
  hdrHtml+='<button onclick="this.closest(\'[data-rpmv]\').remove()" style="background:none;border:none;color:var(--accent2);cursor:pointer;display:flex;align-items:center;gap:5px;font-size:13px;padding:4px"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px"><path d="M15 18l-6-6 6-6"/></svg>返回</button>';
  hdrHtml+='<h2 style="font-size:15px;font-weight:700;flex:1;margin:0"><i class="fas fa-box-open"></i> '+esc(pack.name||'未命名')+'</h2>';
  hdrHtml+='</div>';

  var bodyHtml='<div style="padding:14px 16px;overflow-y:auto;flex:1">';
  if(!pack.items||pack.items.length===0){
    bodyHtml+='<div style="text-align:center;padding:40px 0;color:var(--text2);font-size:13px">该资源包暂无内容</div>';
  } else {
    (pack.items).forEach(function(item){
      var typeLabel=typeLabels[item.type]||item.type||'';
      var dataStr='';
      if(typeof item.data==='string'){
        dataStr=item.data;
      } else if(item.data && item.type==='char'){
        // 人物设定：提取 characters 数组里每个角色的 name + desc 拼成可读文本
        var chars=Array.isArray(item.data)?item.data:(Array.isArray(item.data.characters)?item.data.characters:[]);
        dataStr=chars.map(function(c){
          var name=c.name||'未命名';
          var desc=c.desc||c.content||'';
          return '【'+name+'】\n'+desc;
        }).join('\n\n');
      } else if(item.data && item.type==='work'){
        // 作品：显示标题和正文内容，不显示JSON结构
        var w=item.data;
        var wTitle=w.title||item.name||'未命名';
        var wContent='';
        if(w.type==='draft'){
          wContent=w.content||'';
        } else if(w.chapters&&w.chapters.length>0){
          wContent=w.chapters.join('\n\n---\n\n');
        }
        dataStr='《'+wTitle+'》\n\n'+wContent;
      } else if(item.data){
        dataStr=JSON.stringify(item.data,null,2);
      }
      bodyHtml+='<div style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:14px;margin-bottom:10px">';
      bodyHtml+='<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">';
      bodyHtml+='<span style="font-size:13px;font-weight:700;color:var(--text)">'+esc(item.name||'未命名')+'</span>';
      bodyHtml+='<span style="font-size:10px;color:var(--accent2);background:rgba(108,92,231,.12);padding:2px 8px;border-radius:8px">'+esc(typeLabel)+'</span>';
      bodyHtml+='</div>';
      if(dataStr){
        bodyHtml+='<div style="font-size:12px;color:var(--text2);line-height:1.8;white-space:pre-wrap;word-break:break-all;background:var(--bg);border-radius:8px;padding:10px;max-height:240px;overflow-y:auto">'+esc(dataStr)+'</div>';
      }
      bodyHtml+='</div>';
    });
  }
  bodyHtml+='</div>';

  ov.innerHTML=hdrHtml+bodyHtml;
  ov.setAttribute('data-rpmv','1');
  document.body.appendChild(ov);
}
function resPackMgrDelete(id){
  var pack=resPacks.find(function(p){return p.id===id;});
  if(!pack){return;}
  showDlg('删除资源包','确定要删除「'+(pack.name||'未命名')+'」吗？',function(){
    resPacks=resPacks.filter(function(p){return p.id!==id;});
    sv('bj_resPacks',resPacks);
    renderResList();
    showToast('资源包已删除');
    var ov=document.getElementById('resPackMgrOv');
    if(ov)ov.remove();
    setTimeout(openResPackManager,200);
  },true);
}
function openResSearch(){
  var ov=document.createElement('div');
  ov.id='resSearchOv';
  ov.style.cssText='position:fixed;inset:0;z-index:2000;background:var(--bg);overflow-y:auto;display:flex;flex-direction:column;animation:slideUp .3s ease';
  var typeLabels={all:'全部',char:'人物',world:'世界观',style:'文风',rule:'规则',work:'作品',exp:'素材',ban:'禁用词'};
  var tabs=Object.keys(typeLabels);
  var hdr='<div style="position:sticky;top:0;z-index:10;background:var(--card);border-bottom:1px solid var(--border);padding:14px 16px">';
  hdr+='<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">';
  hdr+='<span style="font-size:15px;font-weight:700"><i class="fas fa-search"></i> 搜索资源</span>';
  hdr+='<button onclick="document.getElementById(\'resSearchOv\').remove()" style="padding:6px 14px;border-radius:8px;border:1px solid var(--border);background:transparent;color:var(--text);font-size:12px;cursor:pointer">关闭</button>';
  hdr+='</div>';
  hdr+='<input id="resSearchInput" placeholder="搜索名称或来源资源包" style="width:100%;padding:10px 12px;border-radius:10px;border:1px solid var(--border);background:var(--card2);color:var(--text);font-size:13px;margin-bottom:10px" oninput="doResSearch()">';
  hdr+='<div style="display:flex;gap:6px;overflow-x:auto;padding-bottom:4px">';
  tabs.forEach(function(t){
    hdr+='<button onclick="resSearchSetTab(\''+t+'\',this)" id="rsTab_'+t+'" style="padding:5px 12px;border-radius:8px;border:1px solid var(--border);background:'+(t==='all'?'var(--accent)':'transparent')+';color:'+(t==='all'?'#fff':'var(--text)')+';font-size:12px;white-space:nowrap;cursor:pointer;flex-shrink:0">'+typeLabels[t]+'</button>';
  });
  hdr+='</div></div>';
  var body='<div id="resSearchResults" style="padding:14px 16px">请输入关键词开始搜索</div>';
  ov.innerHTML=hdr+body;
  ov.setAttribute('data-tab','all');
  document.body.appendChild(ov);
}
function resSearchSetTab(tab,btn){
  var ov=document.getElementById('resSearchOv');
  if(!ov)return;
  ov.setAttribute('data-tab',tab);
  ov.querySelectorAll('[id^="rsTab_"]').forEach(function(b){
    b.style.background='transparent';b.style.color='var(--text)';
  });
  btn.style.background='var(--accent)';btn.style.color='#fff';
  doResSearch();
}
function doResSearch(){
  var ov=document.getElementById('resSearchOv');
  var inp=document.getElementById('resSearchInput');
  var res=document.getElementById('resSearchResults');
  if(!ov||!inp||!res)return;
  var kw=(inp.value||'').trim().toLowerCase();
  var tab=ov.getAttribute('data-tab')||'all';
  var typeLabels={char:'人物',world:'世界观',style:'文风',rule:'规则',work:'作品',exp:'素材',ban:'禁用词'};
  var items=[];
  _getAllPacks().forEach(function(pack){
    (pack.items||[]).forEach(function(item){
      items.push({item:item,packName:pack.name||'未命名',packId:pack.id,isBuiltin:pack._builtin||false,badge:pack._badge||''});
    });
  });
  if(tab!=='all') items=items.filter(function(x){return x.item.type===tab;});
  if(kw) items=items.filter(function(x){
    return (x.item.name||'').toLowerCase().indexOf(kw)>-1||(x.packName||'').toLowerCase().indexOf(kw)>-1;
  });
  if(items.length===0){res.innerHTML='<div style="text-align:center;padding:30px 0;color:var(--text2);font-size:13px">没有找到匹配的资源</div>';return;}
  var html='';
  items.forEach(function(x,i){
    var item=x.item;
    var preview=typeof item.data==='string'?item.data.substring(0,60):'';
    var officialBadge=_getResBadgeHtml(x.item._badge||x.badge||'');
    html+='<div style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:12px;margin-bottom:10px">';
    html+='<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">';
    html+='<span style="font-size:13px;font-weight:600">'+esc(item.name||'未命名')+officialBadge+'</span>';
    html+='<span style="font-size:10px;color:var(--accent2)">'+(typeLabels[item.type]||item.type||'')+'</span>';
    html+='</div>';
    html+='<div style="font-size:11px;color:var(--text2);margin-bottom:8px">来自：'+esc(x.packName)+'</div>';
    if(preview) html+='<div style="font-size:11px;color:var(--text2);margin-bottom:8px">'+esc(preview)+'...</div>';
    html+='<div style="display:flex;gap:6px">';
    html+='<button onclick="resSearchApply(\''+x.packId+'\',\''+esc(item.name||'')+'\',\''+item.type+'\')" style="padding:6px 12px;border-radius:7px;border:none;background:var(--accent);color:#fff;font-size:11px;cursor:pointer"><i class="fas fa-magic"></i> 应用</button>';
    html+='<button onclick="resSearchPreview(\''+x.packId+'\',\''+esc(item.name||'')+'\')" style="padding:6px 12px;border-radius:7px;border:1px solid var(--border);background:transparent;color:var(--text);font-size:11px;cursor:pointer"><i class="fas fa-eye"></i> 预览</button>';
    html+='</div></div>';
  });
  res.innerHTML=html;
  res._items=items;
}
function resSearchApply(packId,name,type){
  var pack=_getAllPacks().find(function(p){return p.id===packId;});
  if(!pack)return;
  var localIdx=(pack.items||[]).findIndex(function(it){return (it.name||'')===(name||'')&&it.type===type;});
  if(localIdx<0){showToast('未找到该资源');return;}
  applyResItem(packId,localIdx);
}
function resSearchPreview(packId,name){
  var pack=_getAllPacks().find(function(p){return p.id===packId;});
  if(!pack)return;
  var localIdx=(pack.items||[]).findIndex(function(it){return (it.name||'')===name;});
  if(localIdx<0){showToast('未找到该资源');return;}
  previewResItem(packId,localIdx);
}
function switchResTab(tab,el){
resTab=tab;
document.querySelectorAll('.res-tab').forEach(t=>t.classList.remove('act'));
el.classList.add('act');
resPage = 1;
renderResList();
}
function doResInlineSearch(kw){window._resInlineKw=(kw||'').trim();resPage=1;renderResList();}
function renderResList(){
const list=document.getElementById('resList');
let items=[];
_getAllPacks().forEach(function(pack){
if(pack.items&&Array.isArray(pack.items)){
pack.items.forEach(function(item,localIdx){
item._packName=pack.name||'未命名资源包';
item._packId=pack.id;
item._localIdx=localIdx;
item._builtin=pack._builtin||false;
item._badge=pack._badge||'';
item._packAuthor=pack.author||'';
item._packDesc=pack.desc||'';
items.push(item);
});
}
});
if(resTab!=='all')items=items.filter(it=>it.type===resTab);
var _rkw=window._resInlineKw||'';
if(_rkw){var _rkwL=_rkw.toLowerCase();items=items.filter(function(it){return (it.name||'').toLowerCase().indexOf(_rkwL)>-1||(it._packName||'').toLowerCase().indexOf(_rkwL)>-1||(it._packAuthor||'').toLowerCase().indexOf(_rkwL)>-1||(it._packDesc||'').toLowerCase().indexOf(_rkwL)>-1;});}
const totalItems = items.length;
items = items.slice(0, resPage * PAGE_SIZE);
if(items.length===0){
const tips={
all:'还没有资源<br>点击「打包导出」分享你的设定，或「导入资源包」获取别人的',
char:'没有人物设定资源',world:'没有世界观资源',
style:'没有文风资源',rule:'没有规则资源',work:'没有作品资源',exp:'没有素材',ban:'没有禁用词资源'
};
list.innerHTML='<div class="empty-st"><p>'+(tips[resTab]||tips.all)+'</p></div>';
return;
}
list.innerHTML='';
items.forEach((item)=>{
const card=document.createElement('div');
card.className='res-card';
const typeLabels={char:'人物设定',world:'世界观',style:'文风',rule:'规则',work:'作品',exp:'素材',ban:'禁用词'};
const preview=getResPreview(item);
const officialBadge=_getResBadgeHtml(item._badge||'');
var _itemPack=builtinPacks.find(function(p){return p.id===item._packId;})||null;
const newBadge=(_itemPack&&_isPackNew(_itemPack))?'<span style="display:inline-block;font-size:9px;font-weight:700;padding:1px 5px;border-radius:5px;background:linear-gradient(135deg,#ff6b6b,#ee5a24);color:#fff;margin-left:5px;vertical-align:middle;line-height:1.5">新</span>':'';
const lIdx=item._localIdx;
card.innerHTML=
'<div class="res-card-hd">'+
'<div class="res-card-t">'+esc(item.name||'未命名')+officialBadge+newBadge+'</div>'+
'<span class="res-card-type '+item.type+'">'+(typeLabels[item.type]||'其他')+'</span>'+
'</div>'+
'<div class="res-card-pv">'+esc(preview)+'</div>'+
'<div class="res-card-ft">'+
'<span class="res-card-info">来自：'+esc(item._packName)+'</span>'+
'<div class="res-card-acts">'+
'<button class="use" onclick="event.stopPropagation();applyResItem(\''+item._packId+'\','+lIdx+')">应用</button>'+
'<button onclick="event.stopPropagation();previewResItem(\''+item._packId+'\','+lIdx+')">预览</button>'+
'<button onclick="event.stopPropagation();copyResItem(\''+item._packId+'\','+lIdx+')">复制</button>'+
'</div>'+
'</div>';
list.appendChild(card);
});
if(totalItems > items.length){
  const more=document.createElement('div');
  more.style.cssText='text-align:center;padding:14px;color:var(--text2);font-size:12px';
  more.innerHTML='<button style="padding:10px 18px;border-radius:12px;border:1px solid var(--border);background:var(--card);color:var(--text);cursor:pointer" onclick="resPage++;renderResList()">加载更多（'+items.length+'/'+totalItems+'）</button>';
  list.appendChild(more);
}
}
function getResPreview(item){
if(item.type==='char'){
var cdata=item.data||[];
var chars=Array.isArray(cdata)?cdata:(cdata.characters&&Array.isArray(cdata.characters)?cdata.characters:[]);
if(chars.length===0)return '（人物资源）';
return chars.map(function(c){return (c.name||'未命名')+'：'+(c.desc||'').substring(0,30);}).join('；');
}
if(item.type==='world')return (item.data||'').substring(0,80);
if(item.type==='style')return (item.data||'').substring(0,80);
if(item.type==='rule')return (item.data||'').substring(0,80);
if(item.type==='work'){
const w=item.data||{};
if(w.type==='draft')return (w.content||'').substring(0,80);
if(w.chapters&&w.chapters.length>0)return (w.chapters[0]||'').substring(0,80);
return '暂无内容';
}
if(item.type==='exp')return (item.data||'').substring(0,80);
if(item.type==='ban')return (item.data||'').replace(/\n/g,'、').substring(0,80);
return '';
}
// 静默应用单个资源项（供批量应用使用，不弹确认框）
function _applySingleItemSilent(item){
  if(!item)return false;
  try{
    if(item.type==='char'){
      var d=item.data||{};
      if(Array.isArray(d)){
        characters=JSON.parse(JSON.stringify(d));
      }else{
        characters=JSON.parse(JSON.stringify(d.characters||[{name:'',desc:''}]));
        if(d.relations){charRelations=JSON.parse(JSON.stringify(d.relations));sv('bj_charRelations',charRelations);}
        if(d.npcs){npcList=JSON.parse(JSON.stringify(d.npcs));sv('bj_npcList',npcList);}
      }
      sv(K.curChars,characters);
      if(typeof renderCharCards==='function')renderCharCards();
      if(typeof renderNpcCards==='function')renderNpcCards();
    }else if(item.type==='world'){
      var wEl=document.getElementById('worldDesc');
      if(wEl){wEl.value=item.data||'';wEl.dispatchEvent(new Event('input'));}
      saveCurSettings();
    }else if(item.type==='style'){
      var stEl=document.getElementById('styleDesc');
      if(stEl){stEl.value=item.data||'';stEl.dispatchEvent(new Event('input'));}
      ap.curStyle=item.data||'';sv(K.ap,ap);
    }else if(item.type==='rule'){
      var rEl=document.getElementById('ruleDesc');
      if(rEl){rEl.value=item.data||'';rEl.dispatchEvent(new Event('input'));}
      curRule=item.data||'';sv('bj_curRule',curRule);
    }else if(item.type==='work'){
      var w=JSON.parse(JSON.stringify(item.data));
      w.id=uid();w.createdAt=new Date().toISOString();w.updatedAt=new Date().toISOString();
      crWorks.unshift(w);sv('bj_crWorks',crWorks);
    }else if(item.type==='ban'){
      var gbwEl=document.getElementById('globalBanWordsInput');
      if(gbwEl){gbwEl.value=item.data||'';gbwEl.dispatchEvent(new Event('input'));}
      globalBanWords=item.data||'';sv('bj_globalBanWords',globalBanWords);
    }else if(item.type==='exp'){
      // 素材不做静默应用
      return false;
    }
    return true;
  }catch(e){console.error('[applyItem] 应用失败:',e);return false;}
}
// applyResItem(packId, localIdx) — 与previewResItem保持一致，使用包内局部索引
function applyResItem(packId,localIdx){
var pack=_getAllPacks().find(function(p){return p.id===packId;});
if(!pack||!pack.items)return;
var item=pack.items[localIdx];
if(!item)return;
if(item.type==='char'){
showDlg('应用人物设定','将覆盖当前的人物设定（含关系和NPC），是否继续？',function(){
var d=item.data||{};
if(Array.isArray(d)){
characters=JSON.parse(JSON.stringify(d));
}else{
characters=JSON.parse(JSON.stringify(d.characters||[{name:'',desc:''}]));
if(d.relations){charRelations=JSON.parse(JSON.stringify(d.relations));sv('bj_charRelations',charRelations);}
if(d.npcs){npcList=JSON.parse(JSON.stringify(d.npcs));sv('bj_npcList',npcList);}
}
sv(K.curChars,characters);
if(typeof renderCharCards==='function')renderCharCards();
if(typeof renderNpcCards==='function')renderNpcCards();
showToast('人物设定已应用');
});
}
else if(item.type==='world'){
showDlg('应用世界观','将覆盖当前的世界观设定，是否继续？',function(){
var wEl=document.getElementById('worldDesc');
if(wEl){wEl.value=item.data||'';wEl.dispatchEvent(new Event('input'));}
saveCurSettings();
showToast('世界观已应用');
});
}else if(item.type==='style'){
showDlg('应用文风','将覆盖当前的文风设置，是否继续？',function(){
var stEl=document.getElementById('styleDesc');
if(stEl){stEl.value=item.data||'';stEl.dispatchEvent(new Event('input'));}
ap.curStyle=item.data||'';sv(K.ap,ap);
showToast('文风已应用');
});
}else if(item.type==='rule'){
showDlg('应用规则','将覆盖当前的规则设置，是否继续？',function(){
var rEl=document.getElementById('ruleDesc');
if(rEl){rEl.value=item.data||'';rEl.dispatchEvent(new Event('input'));}
curRule=item.data||'';sv('bj_curRule',curRule);
showToast('规则已应用');
});
}else if(item.type==='work'){
showDlg('导入作品','将添加到你的创作页面，是否继续？',function(){
var w=JSON.parse(JSON.stringify(item.data));
w.id=uid();
w.createdAt=new Date().toISOString();
w.updatedAt=new Date().toISOString();
crWorks.unshift(w);
sv('bj_crWorks',crWorks);
showToast('作品已导入到创作页');
});
}else if(item.type==='ban'){
showDlg('应用禁用词','将覆盖当前的全局禁用词，是否继续？',function(){
var gbwEl=document.getElementById('globalBanWordsInput');
if(gbwEl){gbwEl.value=item.data||'';gbwEl.dispatchEvent(new Event('input'));}
globalBanWords=item.data||'';sv('bj_globalBanWords',globalBanWords);
showToast('禁用词已应用');
});
}else if(item.type==='exp'){
showDlg('查看素材','是否复制这条素材内容到剪贴板？',function(){
doCopy(item.data||'');
});
}
}
function previewResItem(packId,localIdx){
var pack=_getAllPacks().find(function(p){return p.id===packId;});
if(!pack||!pack.items) return;
var item=pack.items[localIdx];
if(!item) return;
var typeLabels={char:'人物设定',world:'世界观',style:'文风',rule:'规则',work:'作品',exp:'素材',ban:'禁用词'};
var packName=pack.name||'未命名';
var html='<div style="margin-bottom:10px">';
html+='<span style="font-size:11px;color:var(--accent2);background:rgba(108,92,231,.15);padding:2px 8px;border-radius:10px">'+(typeLabels[item.type]||'其他')+'</span>';
html+='<span style="font-size:11px;color:var(--text2);margin-left:8px">来自：'+esc(packName)+'</span>';
html+='</div>';
if(item.type==='char'){
var chars=[];
var data=item.data||[];
if(Array.isArray(data)){
  chars=data;
}else if(data.characters&&Array.isArray(data.characters)){
  chars=data.characters;
}
if(chars.length>0){
chars.forEach(function(c){
html+='<div style="background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:12px;margin-bottom:8px">';
html+='<div style="font-size:13px;font-weight:600;color:var(--accent2);margin-bottom:6px"><i class="fas fa-user"></i> '+esc(c.name||'未命名')+'</div>';
if(c.traits&&c.traits.length>0){
html+='<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:6px">';
c.traits.forEach(function(t){html+='<span style="padding:2px 8px;border-radius:8px;font-size:10px;background:rgba(108,92,231,.1);color:var(--accent2)">'+esc(t)+'</span>';});
html+='</div>';
}
html+='<div style="font-size:12px;line-height:1.7;white-space:pre-wrap;word-break:break-word">'+esc(c.desc||'（无描述）')+'</div>';
html+='</div>';
});
}else{
html+='<div style="font-size:12px;color:var(--text2);padding:10px">（人物数据格式不兼容，无法预览）</div>';
}
}else if(item.type==='work'){
var w=item.data||{};
html+='<div style="font-size:12px;font-weight:600;margin-bottom:8px"><i class="fas fa-book"></i> '+esc(w.title||'未命名作品')+'</div>';
if(w.type==='draft'){
var txt=w.content||'';
html+='<div style="font-size:12px;line-height:1.7;max-height:280px;overflow-y:auto;white-space:pre-wrap;word-break:break-word;background:var(--bg);border-radius:8px;padding:10px;border:1px solid var(--border)">'+esc(txt.substring(0,1500)+(txt.length>1500?'…':''))+'</div>';
}else if(w.chapters){
var previewCount=0;
w.chapters.forEach(function(ch,i){
if(previewCount>=3){return;}
previewCount++;
html+='<div style="margin-bottom:8px"><div style="font-size:11px;font-weight:600;color:var(--text2);margin-bottom:4px">第'+(i+1)+'章</div>';
html+='<div style="font-size:12px;line-height:1.7;max-height:100px;overflow-y:auto;white-space:pre-wrap;word-break:break-word;background:var(--bg);border-radius:8px;padding:8px;border:1px solid var(--border)">'+esc((ch||'').substring(0,250)+((ch||'').length>250?'…':''))+'</div></div>';
});
if(w.chapters.length>3)html+='<div style="font-size:10px;color:var(--text2);text-align:center;margin-top:4px">（仅预览前3章，共'+w.chapters.length+'章）</div>';
}
}else{
var text=item.data||'';
html+='<div style="font-size:12px;line-height:1.7;white-space:pre-wrap;word-break:break-word;background:var(--bg);border-radius:8px;padding:12px;border:1px solid var(--border)">'+esc(text||'（无内容）')+'</div>';
}
showDlg('预览：'+esc(item.name||'未命名'),html,function(){},false,true);
document.getElementById('dlgOkBtn').style.display='none';
setTimeout(function(){
var p=document.getElementById('dlgMsg');
if(p){p.style.maxHeight='62vh';p.style.overflowY='auto';p.style.wordBreak='break-word';}
},50);
}
function copyResItem(packId,localIdx){
var pack=_getAllPacks().find(function(p){return p.id===packId;});
if(!pack||!pack.items) return;
var item=pack.items[localIdx];
if(!item) return;
var text='';
if(item.type==='char'){
var chars=Array.isArray(item.data)?item.data:(item.data&&item.data.characters?item.data.characters:[]);
text=chars.map(function(c){return '【'+(c.name||'')+'】\n'+(c.desc||'');}).join('\n\n');
}else if(item.type==='rule'){
text=item.data||'';
}else if(item.type==='work'){
var w=item.data||{};
if(w.type==='draft')text=w.content||'';
else if(w.chapters)text=w.chapters.map(function(ch,i){return '第'+(i+1)+'章\n\n'+ch;}).join('\n\n');
}else{
text=item.data||'';
}
doCopy(text);
}

// ==================== RESOURCE EXPORT ====================
function showUploadResInfo(){
  showDlg('上传你的资源包',
    '<div style="font-size:13px;line-height:2;color:var(--text)">'
    +'<div style="margin-bottom:10px">将你导出的资源包发送到以下邮箱，通过审核后即可上线，所有用户均可看到。</div>'
    +'<div style="background:var(--card2);border:1px solid var(--border);border-radius:10px;padding:12px;text-align:center;font-size:14px;font-weight:700;color:var(--accent2);letter-spacing:.5px">a13380324832@qq.com</div>'
    +'<div style="margin-top:10px;font-size:11px;color:var(--text2)">· 请使用网页内的「打包导出」功能导出 .json 文件<br>· 邮件标题注明「星叙资源投稿」<br>· 资源须注明原创作者和类型<br>· 审核通过后将在下次版本更新时上线</div>'
    +'</div>',
    function(){},false,true
  );
}
function openResExport(){
const box=document.getElementById('resExpList');
box.innerHTML='';
// 每次打开都重置搜索框，避免残留上一次的关键词
const resExpSearchInputEl=document.getElementById('resExpSearchInput');
if(resExpSearchInputEl)resExpSearchInputEl.value='';
const resExpSearchClearEl=document.getElementById('resExpSearchClear');
if(resExpSearchClearEl)resExpSearchClearEl.style.display='none';
const exportItems=[];
saveCharactersFromUI();
const validChars=characters.filter(c=>c.name||c.desc);

// ---- 动态标签辅助函数 ----
function _makeLabel(presetName, typeSuffix){
  if(presetName && presetName.trim()){
    return presetName.trim() + typeSuffix;
  }
  return '（资源包名）' + typeSuffix;
}

// 人物
if(validChars.length>0){
  exportItems.push({id:'cur_char',type:'char',label:_makeLabel('','人设'),desc:validChars.map(c=>c.name).filter(Boolean).join('、')||'未命名角色',data:{characters:validChars,relations:charRelations,npcs:npcList}});
}
charP.forEach((p,i)=>{
  exportItems.push({
    id:'charP_'+i,
    type:'char',
    label:_makeLabel(p.name,'人设'),
    desc:(p.characters||[]).map(c=>c.name).filter(Boolean).join('、'),
    data:{characters:p.characters||[],relations:p.relations||[],npcs:p.npcs||[]}
  });
});

// 世界观
const wD=(document.getElementById('worldDesc').value||'').trim();
if(wD){
  exportItems.push({id:'cur_world',type:'world',label:_makeLabel('','世界观'),desc:wD.substring(0,40),data:wD});
}
worldP.forEach((p,i)=>{
  exportItems.push({id:'worldP_'+i,type:'world',label:_makeLabel(p.name,'世界观'),desc:(p.desc||'').substring(0,40),data:p.desc});
});

// 文风
const sD=(document.getElementById('styleDesc')&&document.getElementById('styleDesc').value||'').trim();
if(sD){
  exportItems.push({id:'cur_style',type:'style',label:_makeLabel('','文风'),desc:sD.substring(0,40),data:sD});
}
styleP.forEach((p,i)=>{
  exportItems.push({id:'styleP_'+i,type:'style',label:_makeLabel(p.name,'文风'),desc:(p.desc||'').substring(0,40),data:p.desc});
});

// 规则
const rD=(document.getElementById('ruleDesc')&&document.getElementById('ruleDesc').value||'').trim();
if(rD){
  exportItems.push({id:'cur_rule',type:'rule',label:_makeLabel('','规则'),desc:rD.substring(0,40),data:rD});
}
ruleP.forEach((p,i)=>{
  exportItems.push({id:'ruleP_'+i,type:'rule',label:_makeLabel(p.name,'规则'),desc:(p.desc||'').substring(0,40),data:p.desc});
});

// 禁用词
const gbwD=(document.getElementById('globalBanWordsInput')&&document.getElementById('globalBanWordsInput').value||'').trim();
if(gbwD){
  exportItems.push({id:'cur_ban_global',type:'ban',label:_makeLabel('','全局禁用词'),desc:gbwD.replace(/\n/g,'、').substring(0,40),data:gbwD});
}
const lbwD=(document.getElementById('banWordsInput')&&document.getElementById('banWordsInput').value||'').trim();
if(lbwD){
  exportItems.push({id:'cur_ban_local',type:'ban',label:_makeLabel('','局部禁用词'),desc:lbwD.replace(/\n/g,'、').substring(0,40),data:lbwD});
}
banWordsP.forEach((p,i)=>{
  exportItems.push({id:'banP_'+i,type:'ban',label:_makeLabel(p.name,'禁用词'),desc:(p.desc||'').replace(/\n/g,'、').substring(0,40),data:p.desc});
});

// 素材（直接读取素材库；图片素材仅使用文字描述，没有可用文字内容的不列入）
const gsExpMats=ld('bj_materials',[]);
gsExpMats.forEach(function(m){
  if(!m||!m.id)return;
  var bodyText=m.type==='image'?(m.imgDesc||''):(m.content||'');
  if(!bodyText||bodyText.startsWith('data:'))return;
  exportItems.push({id:'mat_'+m.id,type:'exp',label:m.title||bodyText.slice(0,20)||'（无标题素材）',desc:bodyText.replace(/\n/g,' ').substring(0,40),data:bodyText});
});

crWorks.forEach(w=>{
exportItems.push({id:'work_'+w.id,type:'work',label:(w.type==='draft'?'草稿：'+(w.title||'无标题'):'《'+(w.title||'无标题')+'》'),desc:getCrWordCount(w)+'字',data:w});
});
const typeLabels={char:'人物',world:'世界观',style:'文风',rule:'规则',work:'作品',exp:'素材',ban:'禁用词'};
const typeOrder=['char','world','style','rule','work','exp','ban'];
if(exportItems.length===0){
box.innerHTML='<p style="font-size:12px;color:var(--text2);text-align:center;padding:20px">没有可导出的内容<br>请先在设置中添加人物/世界观/文风，或在创作页写点东西</p>';
document.getElementById('resExpTabs').innerHTML='';
updateResExpSelectedCount();
document.getElementById('resExpOv').classList.add('show');
navPush('resExpOv');
return;
}
// 渲染分类标签（横向可滚动，只显示有内容的分类）
const tabsBox=document.getElementById('resExpTabs');
let tabsHtml='<button class="res-tab act" onclick="switchResExpTab(\'all\',this)">全部</button>';
typeOrder.forEach(function(type){
  if(!exportItems.some(function(it){return it.type===type;}))return;
  tabsHtml+='<button class="res-tab" onclick="switchResExpTab(\''+type+'\',this)">'+typeLabels[type]+'</button>';
});
tabsBox.innerHTML=tabsHtml;
tabsBox.dataset.curType='all';
// 渲染分类分组与可勾选项
typeOrder.forEach(function(type){
  const group=exportItems.filter(function(item){return item.type===type;});
  if(group.length===0)return;
  const grp=document.createElement('div');
  grp.className='res-chk-group';
  grp.dataset.groupType=type;
  const hdr=document.createElement('div');
  hdr.className='res-exp-grp-hdr';
  hdr.style.cssText='font-size:11px;font-weight:700;color:var(--accent2);padding:10px 4px 5px;margin-top:8px;border-bottom:1px solid var(--border);letter-spacing:.5px;';
  hdr.textContent=typeLabels[type]||type;
  grp.appendChild(hdr);
  group.forEach(function(item){
    const div=document.createElement('div');
    div.className='res-chk-item';
    div.dataset.resId=item.id;
    div.dataset.resType=item.type;
    div.dataset.resData=JSON.stringify(item.data);
    div.dataset.resLabel=item.label;
    div.onclick=function(){div.classList.toggle('checked');updateResExpSelectedCount();};
    div.innerHTML=
    '<div class="res-chk-box"><i class="fas fa-check"></i></div>'+
    '<div class="res-chk-info">'+
    '<div class="res-chk-name">'+esc(item.label)+'</div>'+
    '<div class="res-chk-desc">'+esc(item.desc)+'</div>'+
    '</div>';
    grp.appendChild(div);
  });
  box.appendChild(grp);
});
updateResExpSelectedCount();
document.getElementById('resExpOv').classList.add('show');
navPush('resExpOv');
}
// 切换打包导出全屏页的分类标签
function switchResExpTab(type,el){
  document.querySelectorAll('#resExpTabs .res-tab').forEach(function(t){t.classList.remove('act');});
  if(el)el.classList.add('act');
  const tabsBox=document.getElementById('resExpTabs');
  if(tabsBox)tabsBox.dataset.curType=type;
  resExpApplyFilters();
}
// 统一处理"分类tab + 搜索关键词"两个维度的显隐逻辑
function resExpApplyFilters(){
  const tabsBox=document.getElementById('resExpTabs');
  const curType=(tabsBox&&tabsBox.dataset.curType)||'all';
  const searchEl=document.getElementById('resExpSearchInput');
  const kw=((searchEl&&searchEl.value)||'').trim().toLowerCase();
  document.querySelectorAll('#resExpList .res-chk-group').forEach(function(g){
    const tabMatch=(curType==='all'||g.dataset.groupType===curType);
    let visibleCount=0;
    g.querySelectorAll('.res-chk-item').forEach(function(item){
      const label=(item.dataset.resLabel||'').toLowerCase();
      const kwMatch=(!kw||label.indexOf(kw)>-1);
      const show=tabMatch&&kwMatch;
      item.style.display=show?'':'none';
      if(show)visibleCount++;
    });
    g.style.display=(tabMatch&&visibleCount>0)?'':'none';
    const hdr=g.querySelector('.res-exp-grp-hdr');
    if(hdr)hdr.style.display=(curType==='all'&&tabMatch&&visibleCount>0)?'':'none';
  });
}
// 搜索框输入回调：按预设名过滤当前分类下的资源
function filterResExpItems(val){
  const clearBtn=document.getElementById('resExpSearchClear');
  if(clearBtn)clearBtn.style.display=val?'flex':'none';
  resExpApplyFilters();
}
// 清空搜索框
function clearResExpSearch(){
  const searchEl=document.getElementById('resExpSearchInput');
  if(searchEl)searchEl.value='';
  const clearBtn=document.getElementById('resExpSearchClear');
  if(clearBtn)clearBtn.style.display='none';
  resExpApplyFilters();
}
// 更新"已选择 N 项"计数
function updateResExpSelectedCount(){
  var n=document.querySelectorAll('#resExpList .res-chk-item.checked').length;
  var el=document.getElementById('resExpCount');
  if(el)el.textContent='已选择 '+n+' 项';
}
function updateResPackLabels(val){
  var hint = (val||'').trim() || '（资源包名）';
  document.querySelectorAll('#resExpList .res-chk-name').forEach(function(el){
    if(el.textContent.indexOf('（资源包名）') > -1){
      el.textContent = el.textContent.replace(/（资源包名）/g, hint);
    }
  });
}
// 分类选择完成，进入命名小弹窗
function openResExportNaming(){
  const checked=document.querySelectorAll('#resExpList .res-chk-item.checked');
  if(checked.length===0){showToast('请至少选择一项');return;}
  document.getElementById('resPackName').value='';
  document.getElementById('resPackAuthor').value='';
  document.getElementById('resPackDesc').value='';
  document.getElementById('resExpNameOv').classList.add('show');
  navPush('resExpNameOv');
}
function closeResExportNaming(){
  navPop('resExpNameOv');
document.getElementById('resExpNameOv').classList.remove('show');
}
function closeResExport(){
  navPop('resExpOv');
document.getElementById('resExpOv').classList.remove('show');
}
function doResExport(){
  const checked=document.querySelectorAll('#resExpList .res-chk-item.checked');
  if(checked.length===0){showToast('请至少选择一项');return;}
  const packName=(document.getElementById('resPackName').value||'').trim();
  const packAuthor=(document.getElementById('resPackAuthor').value||'').trim();
  const packDesc=(document.getElementById('resPackDesc').value||'').trim();
  if(!packName){showToast('请填写资源包名称');return;}
  if(!packAuthor){showToast('请填写作者名称');return;}
  const items=[];
  checked.forEach(el=>{
    var finalLabel=(el.dataset.resLabel||'').replace(/（资源包名）/g,packName);
    items.push({type:el.dataset.resType,name:finalLabel,data:JSON.parse(el.dataset.resData)});
  });
  const pack={_app:'syn_resource',_ver:APP_VER,id:uid(),name:packName,desc:packDesc,author:packAuthor,createdAt:new Date().toISOString(),items:items};
  const jsonStr=JSON.stringify(pack,null,2);
  const fileName='星叙_'+new Date().toLocaleDateString().replace(/\//g,'-')+'_'+packName+'.json';
  closeResExportNaming();
  closeResExport();
  // 使用与数据导出相同的统一导出方法，APK环境也能正常下载或回退到复制
  _exportFileWithFallback(fileName,jsonStr,'application/json;charset=utf-8');
}
function fallbackResExport(jsonStr,fileName){
const dataUri='data:application/json;charset=utf-8,'+encodeURIComponent(jsonStr);
const a=document.createElement('a');
a.href=dataUri;a.download=fileName;
a.style.display='none';
document.body.appendChild(a);a.click();
setTimeout(()=>{document.body.removeChild(a);},500);
closeResExport();
showToast('资源包已导出');
}

function _showResExportDialog(fileName,downloadAttempted){
  var html='<div style="font-size:12px;line-height:1.8;color:var(--text);margin-bottom:14px;">';
  if(downloadAttempted){
    html+='已尝试导出资源文件：<br><b style="color:var(--accent2);">'+esc(fileName)+'</b><br>';
    html+='<span style="font-size:11px;color:var(--text2);">请检查手机「下载」目录是否已收到该文件。</span>';
  }else{
    html+='当前环境不支持直接下载文件。<br>点击下方按钮复制内容后，手动新建文件并粘贴保存：<br>';
    html+='<b style="color:var(--accent2);font-size:11px;">'+esc(fileName)+'</b>';
  }
  html+='</div>';
  html+='<button id="resFallbackCopyBtn" onclick="resExportFallbackCopy()" style="width:100%;padding:10px;border-radius:10px;border:1px solid rgba(108,92,231,.4);background:rgba(108,92,231,.08);color:var(--accent2);font-size:12px;cursor:pointer;font-weight:600;"><i class="fas fa-clipboard"></i> 未收到导出，复制到剪贴板</button>';
  showDlg(downloadAttempted?'导出完成':'导出提示',html,function(){
    window._pendingResExport=null;
  },false,true);
  setTimeout(function(){
    var okBtn=document.getElementById('dlgOkBtn');
    if(okBtn)okBtn.textContent='✓ 已收到，关闭';
    var p=document.getElementById('dlgMsg');
    if(p)p.style.maxHeight='60vh';
  },50);
}

function resExportFallbackCopy(){
  var data=window._pendingResExport;
  if(!data||!data.jsonStr){showToast('内容已失效，请重新导出');return;}
  if(navigator.clipboard&&navigator.clipboard.writeText){
    navigator.clipboard.writeText(data.jsonStr).then(function(){
      showToast('已复制到剪贴板');
      var btn=document.getElementById('resFallbackCopyBtn');
      if(btn){btn.textContent='✓ 已复制！';btn.disabled=true;btn.style.opacity='.6';}
    }).catch(function(){showToast('复制失败，请检查剪贴板权限');});
  }else{
    showToast('当前环境不支持自动复制');
  }
}
function deleteResPack(id){
const pack=resPacks.find(p=>p.id===id);
if(!pack)return;
showDlg('删除资源包','确定要删除「'+(pack.name||'未命名')+'」吗？',()=>{
resPacks=resPacks.filter(p=>p.id!==id);
sv('bj_resPacks',resPacks);
renderResList();
showToast('资源包已删除');
},true);
}
function importResPack(e){
const file=e.target.files[0];if(!file)return;
const reader=new FileReader();
reader.onload=ev=>{
try{
const data=JSON.parse(ev.target.result);
if((data._app!=='syn_resource'&&data._app!=='bijiAI_resource')||!data.items){
showToast('这不是有效的资源包文件',3000);return;
}
const existing=resPacks.findIndex(p=>p.id===data.id);
if(existing>-1){
showDlg('重复资源包','已存在同名资源包「'+(data.name||'')+'」，是否覆盖？',()=>{
resPacks[existing]=data;
sv('bj_resPacks',resPacks);
renderResList();
showToast('资源包已更新');
});
}else{
resPacks.unshift(data);
sv('bj_resPacks',resPacks);
renderResList();
const count=data.items.length;
showToast('已导入「'+(data.name||'资源包')+'」('+count+'项)');
}
}catch(err){showToast('文件解析失败: '+err.message,3000);}
};
reader.readAsText(file);
e.target.value='';
}
// ==================== HANDBOOK ====================
function openHandbook(){openHandbookUnified();}
function closeHandbook(){closeHandbookUnified();}
function openProtocol(){openHandbookUnified('protocol');}
function closeProtocol(){closeHandbookUnified();}

function openHandbookUnified(tab){
  document.getElementById('hbOv').classList.add('show');
  navPush('hbOv');
  document.getElementById('bnav').classList.add('hide');
  // 首次打开时把协议内容搬运过来
  var protocolPage=document.getElementById('hbPageProtocol');
  if(protocolPage && (!protocolPage.innerHTML || protocolPage.innerHTML.trim().length<50)){
    var protocolOv=document.getElementById('protocolOv');
    if(protocolOv){
      var protocolBody=protocolOv.querySelector('.hb-body');
      if(protocolBody){
        protocolPage.innerHTML=protocolBody.innerHTML;
      }
    }
  }
  switchHbTab(tab||'manual');
  if((tab||'manual')==='manual') _buildHbToc();
}

function closeHandbookUnified(){
  navPop('hbOv');
  document.getElementById('hbOv').classList.remove('show');
  document.getElementById('bnav').classList.remove('hide');
  closeHbToc();
  // 同时关闭旧的协议弹窗（以防万一）
  try{document.getElementById('protocolOv').classList.remove('show');}catch(e){}
}

function openNoticeBoard(){
  document.getElementById('boardOv').classList.add('show');
  navPush('boardOv');
  document.getElementById('bnav').classList.add('hide');
}

function closeNoticeBoard(){
  navPop('boardOv');
  document.getElementById('boardOv').classList.remove('show');
  document.getElementById('bnav').classList.remove('hide');
}

function switchBoardTab(tab){
  document.getElementById('boardTabLog').classList.toggle('act',tab==='log');
  document.getElementById('boardTabNotice').classList.toggle('act',tab==='notice');
  document.getElementById('boardPageLog').classList.toggle('act',tab==='log');
  document.getElementById('boardPageNotice').classList.toggle('act',tab==='notice');
  var boardOv=document.getElementById('boardOv');
  if(boardOv)boardOv.scrollTop=0;
}

function switchHbTab(tab){
  document.getElementById('hbTabManual').classList.toggle('act',tab==='manual');
  document.getElementById('hbTabProtocol').classList.toggle('act',tab==='protocol');
  document.getElementById('hbPageManual').classList.toggle('act',tab==='manual');
  document.getElementById('hbPageProtocol').classList.toggle('act',tab==='protocol');
  // 协议页隐藏目录按钮
  var tocBtn=document.getElementById('hbTocBtn');
  if(tocBtn) tocBtn.style.display=tab==='protocol'?'none':'flex';
  // 切换时关闭抽屉
  closeHbToc();
  // 切换到手册页时生成目录
  if(tab==='manual') _buildHbToc();
  // 滚动到顶部
  var hbOv=document.getElementById('hbOv');
  if(hbOv)hbOv.scrollTop=0;
}

function toggleHbToc(){
  var drawer=document.getElementById('hbTocDrawer');
  var ov=document.getElementById('hbTocOv');
  if(!drawer) return;
  var isOpen=drawer.style.left==='0px';
  if(isOpen){
    closeHbToc();
  } else {
    _buildHbToc();
    drawer.style.left='0';
    if(ov) ov.style.display='block';
  }
}

function closeHbToc(){
  var drawer=document.getElementById('hbTocDrawer');
  var ov=document.getElementById('hbTocOv');
  if(drawer) drawer.style.left='-280px';
  if(ov) ov.style.display='none';
}

function _buildHbToc(){
  var list=document.getElementById('hbTocList');
  if(!list) return;
  var page=document.getElementById('hbPageManual');
  if(!page) return;
  var headings=page.querySelectorAll('h3');
  if(!headings.length){list.innerHTML='<div style="padding:12px 16px;font-size:12px;color:var(--text2)">暂无目录</div>';return;}
  // 为每个标题补 id
  var html='';
  headings.forEach(function(h,i){
    var id='hb-anchor-'+i;
    if(!h.id) h.id=id;
    var text=h.textContent.trim().replace(/<[^>]*>/g,'');
    // 缩进：带数字序号的为二级，其余为一级
    var isTop=/^[一二三四五六七八九十]/.test(text);
    var indent=isTop?'14px':'22px';
    var fw=isTop?'600':'400';
    html+='<div onclick="hbTocJump(\''+h.id+'\')" style="padding:7px '+indent+';font-size:12px;font-weight:'+fw+';color:var(--text2);cursor:pointer;border-bottom:1px solid transparent;transition:background .15s;-webkit-tap-highlight-color:transparent" '
      +'onmouseenter="this.style.background=\'var(--bg)\'" onmouseleave="this.style.background=\'\'">'
      +esc(text.length>28?text.substring(0,28)+'…':text)
      +'</div>';
  });
  list.innerHTML=html;
}

function hbTocJump(id){
  closeHbToc();
  var el=document.getElementById(id);
  if(!el) return;
  setTimeout(function(){
    var hbOv=document.getElementById('hbOv');
    if(hbOv){
      var rect=el.getBoundingClientRect();
      var ovRect=hbOv.getBoundingClientRect();
      hbOv.scrollTop=hbOv.scrollTop+(rect.top-ovRect.top)-60;
    } else {
      el.scrollIntoView({behavior:'smooth',block:'start'});
    }
  },320);
}

// ==================== USER CARD ====================
function renderUserCard(){
  const uc = userCard;
  const nameEl = document.getElementById('ucName');
  const bioEl = document.getElementById('ucBio');
  const avatarEl = document.getElementById('ucAvatar');
  nameEl.textContent = uc.name || '点击设置昵称';
  bioEl.textContent = uc.bio || '点击添加个人简介...';

  // 默认头像图片地址（替换为你自己的链接）
  const defaultAvatar = './photos/Default%20Avatar.png';

  if (uc.avatar) {
    avatarEl.innerHTML = '<img src="' + uc.avatar + '" alt="头像"><div class="ucard-avatar-hint">更换</div>';
  } else {
    // 使用默认图片代替 ✦ 符号
    avatarEl.innerHTML = '<img src="' + defaultAvatar + '" alt="默认头像"><div class="ucard-avatar-hint">更换</div>';
  }
  updateStats();
}

function getStorageUsage(){
let total=0;
// [FIX-4] 低危：用 Object.keys 替代 for...in，避免遍历到原型链属性，语义更明确
Object.keys(localStorage).forEach(function(key){
total+=localStorage[key].length*2;
});
return total;
}

function checkStorageHealth(){
const used=getStorageUsage();
const usedMB=(used/1024/1024).toFixed(2);
const percent=(used/(5*1024*1024)*100).toFixed(1);
if(percent>80){
showToastForce('存储已用'+percent+'%，建议导出备份',4000);
}
return {used,usedMB,percent};
}

let totalWords=0;
// ==================== 设定健康检查 ====================
function runSettingsHealthCheck(){
  // 直接从 textarea 读取原始长度（不经过截断），不写回 characters 避免污染数据
  var _charDescReal=function(idx){
    var ta=document.querySelector('.char-desc[data-idx="'+idx+'"]');
    if(ta)return ta.value;
    return (characters&&characters[idx]&&characters[idx].desc)||'';
  };
  var problems=[], warns=[], goods=[];
  var score=100;

  // 1. API配置
  var hasApi=Array.isArray(apiP)&&apiP.length>0&&apiP[0]&&(apiP[0].key||apiP[0].url);
  if(!hasApi){
    problems.push('<i class="fas fa-circle" style="font-size:7px;color:var(--danger)"></i> <b>API未配置</b>：没有可用的API预设，所有AI功能无法使用。请先到「API设置」配置密钥。');
    score-=30;
  } else {
    goods.push('<i class="fas fa-circle" style="font-size:7px;color:var(--success)"></i> API已配置（'+apiP.length+'个预设）');
  }

  // 2. 角色设定
  var validChars=(characters||[]).filter(function(c){return c.name;});
  if(validChars.length===0){
    warns.push('<i class="fas fa-circle" style="font-size:7px;color:#f0a030"></i> <b>没有任何角色</b>：AI续写时无法保持人物一致性，建议至少设置主角。');
    score-=15;
  } else {
    var emptyCharDesc=validChars.filter(function(c){return !(c.desc||'').trim().length;});
  var longChars=validChars.filter(function(c){var i=validChars.indexOf(c);return _charDescReal(i).length>1200;});
    if(emptyCharDesc.length>0){
      warns.push('<i class="fas fa-circle" style="font-size:7px;color:#f0a030"></i> <b>'+emptyCharDesc.length+'个角色设定为空</b>（'+emptyCharDesc.map(function(c){return c.name;}).slice(0,3).join('、')+'）：空设定会让AI"忘记"这个人，建议补充性格、说话方式。');
      score-=10;
    }
    if(longChars.length>0){
      warns.push('<i class="fas fa-circle" style="font-size:7px;color:#f0a030"></i> <b>角色设定偏长</b>（'+longChars.map(function(c){var i=validChars.indexOf(c);return c.name+'·'+_charDescReal(i).length+'字';}).join('、')+'）：超过1200字时AI处理效率下降，建议精简到600字以内（核心主角可适当放宽）。');
      score-=3;
    }
    if(emptyCharDesc.length===0&&longChars.length===0){
      goods.push('<i class="fas fa-circle" style="font-size:7px;color:var(--success)"></i> 角色设定完整（共'+validChars.length+'个，平均'+Math.round(validChars.reduce(function(s,c,i){return s+_charDescReal(i).length;},0)/validChars.length)+'字）');
    }
  }

  // 3. 世界观
  var gwEl=document.getElementById('globalWorldDesc');
  var gwLen=(gwEl?gwEl.value:(globalWorld||'')).length;
  if(gwLen===0){
    warns.push('<i class="fas fa-circle" style="font-size:7px;color:#f0a030"></i> <b>世界观为空</b>：AI对故事背景没有任何参考，续写可能缺乏世界感。可以只写2-3句核心设定。');
    score-=10;
  } else if(gwLen>2000){
    warns.push('<i class="fas fa-circle" style="font-size:7px;color:#f0a030"></i> <b>世界观过长（'+gwLen+'字）</b>：超过2000字时会大量占用上下文，建议精简到1000字以内，保留最核心的背景设定。');
    score-=5;
  } else {
    goods.push('<i class="fas fa-circle" style="font-size:7px;color:var(--success)"></i> 世界观设定正常（'+gwLen+'字）');
  }

// 4. 规则
  var grEl=document.getElementById('globalRuleDesc');
  var grLen=(grEl?grEl.value:(globalRule||'')).length;
  if(grLen===0){
    warns.push('<i class="fas fa-circle" style="font-size:7px;color:#f0a030"></i> <b>规则为空</b>：可以写"永远1V1""结局必须HE""禁止写死亡"等，AI会严格遵守。');
    score-=5;
  } else if(grLen>800){
    warns.push('<i class="fas fa-circle" style="font-size:7px;color:#f0a030"></i> <b>规则偏长（'+grLen+'字）</b>：规则越精简执行越稳定，建议保留最核心的约束，控制在500字以内。');
    score-=3;
  } else {
    goods.push('<i class="fas fa-circle" style="font-size:7px;color:var(--success)"></i> 规则设定正常（'+grLen+'字）');
  }

  // 5. 文风
  var liveStyle=(document.getElementById('styleDesc')&&document.getElementById('styleDesc').value||ap.curStyle||'').trim();
  var styleLen=liveStyle.length;
  if(styleLen===0){
    warns.push('<i class="fas fa-circle" style="font-size:7px;color:#f0a030"></i> <b>文风为空</b>：没有文风设定时AI会用默认风格，可在「文风设置」里选预设或自定义。');
    score-=5;
  } else if(styleLen>1500){
    warns.push('<i class="fas fa-circle" style="font-size:7px;color:#f0a030"></i> <b>文风设定偏长（'+styleLen+'字）</b>：超过1500字时文风指令可能互相干扰，建议精简到800字以内，突出最重要的风格特征。');
    score-=2;
  } else {
    goods.push('<i class="fas fa-circle" style="font-size:7px;color:var(--success)"></i> 文风设定正常（'+styleLen+'字）');
  }

  // 6. 禁用词
  var bwEl=document.getElementById('globalBanWordsInput');
  var bwRaw=(bwEl?bwEl.value:(globalBanWords||'')).trim();
  var bwList=bwRaw?bwRaw.split(/[,，\n]/).filter(function(s){return s.trim();}):[];
  if(bwList.length===0){
    warns.push('<i class="fas fa-circle" style="font-size:7px;color:#f0a030"></i> <b>禁用词为空</b>：可添加"突然""不禁""猛地"等网文通病词，让AI少用陈词滥调。');
  } else if(bwList.length>80){
    warns.push('<i class="fas fa-circle" style="font-size:7px;color:#f0a030"></i> <b>禁用词过多（'+bwList.length+'个）</b>：超过80个时容易误封正常词汇，建议精简到40个内，保留最常见的通病词。');
    score-=3;
  } else {
    goods.push('<i class="fas fa-circle" style="font-size:7px;color:var(--success)"></i> 禁用词设置正常（'+bwList.length+'个）');
  }

  // 7. NPC
  var validNpcs=(npcList||[]).filter(function(n){return n.name;});
  if(validNpcs.length>0){
    var emptyNpcs=validNpcs.filter(function(n){return !countWords(n.desc||'');});
    if(emptyNpcs.length>0){
      warns.push('<i class="fas fa-circle" style="font-size:7px;color:#f0a030"></i> <b>'+emptyNpcs.length+'个NPC设定为空</b>（'+emptyNpcs.map(function(n){return n.name;}).slice(0,3).join('、')+'等）：出场时AI对这些角色没有参考。');
      score-=3;
    } else {
      goods.push('<i class="fas fa-circle" style="font-size:7px;color:var(--success)"></i> NPC设定完整（共'+validNpcs.length+'个）');
    }
  }

  // 8. 名字一致性：角色和NPC有无同名冲突
  var charNames=new Set(validChars.map(function(c){return c.name;}));
  var dupNpcs=(validNpcs||[]).filter(function(n){return charNames.has(n.name);});
  if(dupNpcs.length>0){
    problems.push('<i class="fas fa-circle" style="font-size:7px;color:var(--danger)"></i> <b>角色与NPC重名</b>（'+dupNpcs.map(function(n){return n.name;}).join('、')+'）：同一个名字在两处有不同设定，AI可能混淆，建议删除其中一处。');
    score-=15;
  }

  // 9. Token估算
  var totalCh=gwLen+grLen+bwList.join('').length+styleLen;
  validChars.forEach(function(c,i){totalCh+=_charDescReal(i).length;});
  validNpcs.forEach(function(n){totalCh+=(n.desc||'').length;});
  var estTok=Math.round(totalCh*1.5);
  var contextLen=(apiP&&apiP[0]&&apiP[0].contextLen)||8;
  var contextTokens=contextLen*500;
  var settingPct=contextTokens>0?Math.round(estTok/contextTokens*100):0;
  if(settingPct>=40 || estTok>8000){
    warns.push('<i class="fas fa-circle" style="font-size:7px;color:#f0a030"></i> <b>设定总量偏大（约'+estTok+' tokens，占上下文约'+settingPct+'%）</b>：留给正文的空间变少，续写可能变短。建议在API设置中扩大上下文窗口，或用「精华压缩器」精简设定。');
    score-=6;
  } else if(totalCh>0){
    goods.push('<i class="fas fa-circle" style="font-size:7px;color:var(--success)"></i> 设定总量合理（约'+estTok+' tokens，占上下文约'+settingPct+'%）');
  }

  score=Math.max(0,score);
  var scoreColor=score>=80?'#55efc4':score>=60?'#ffeaa7':'#fd79a8';
  var scoreLabel;
if (score >= 80) scoreLabel = '健康';
else if (score >= 60) scoreLabel = '需优化';
else scoreLabel = '较差';

  var html='<div style="display:flex;align-items:center;gap:12px;background:var(--bg);border-radius:10px;padding:12px 14px;margin-bottom:14px">'
    +'<div style="font-size:28px;font-weight:900;color:'+scoreColor+'">'+score+'</div>'
    +'<div><div style="font-size:13px;font-weight:700;color:'+scoreColor+'">设定健康度：'+scoreLabel+'</div>'
    +'<div style="font-size:10px;color:var(--text2);margin-top:2px">发现 '+problems.length+' 个问题 · '+warns.length+' 条建议</div></div>'
    +'</div>';

  if(problems.length>0){
    html+='<div style="font-size:11px;font-weight:700;color:#fd79a8;margin-bottom:6px"><i class="fas fa-triangle-exclamation"></i> 需要修复</div>';
    problems.forEach(function(p){
      html+='<div style="background:rgba(253,121,168,.08);border:1px solid rgba(253,121,168,.2);border-radius:8px;padding:10px 12px;margin-bottom:8px;font-size:12px;line-height:1.7;color:var(--text)">'+p+'</div>';
    });
  }
  if(warns.length>0){
    html+='<div style="font-size:11px;font-weight:700;color:#ffeaa7;margin-bottom:6px;margin-top:4px"><i class="fas fa-lightbulb"></i> 建议优化</div>';
    warns.forEach(function(w){
      html+='<div style="background:rgba(255,234,167,.06);border:1px solid rgba(255,234,167,.2);border-radius:8px;padding:10px 12px;margin-bottom:8px;font-size:12px;line-height:1.7;color:var(--text)">'+w+'</div>';
    });
  }
  if(goods.length>0){
    html+='<div style="font-size:11px;font-weight:700;color:#55efc4;margin-bottom:6px;margin-top:4px"><i class="fas fa-circle-check"></i> 状态良好</div>';
    goods.forEach(function(g){
      html+='<div style="font-size:12px;color:var(--text2);padding:4px 0;line-height:1.6">'+g+'</div>';
    });
  }

  showDlg('设定健康检查',html,null,false,true);
  setTimeout(function(){
    var p=document.getElementById('dlgMsg');
    if(p){p.style.maxHeight='62vh';p.style.overflowY='auto';}
  },50);
}
// ==================== 设定健康检查 END ====================
// ==================== 写作统计弹窗 ====================
function openStatsModal(){
  var modal=document.getElementById('statsModal');
  if(!modal) return;
  modal.classList.add('show');
  navPush('statsModal');
  setTimeout(function(){ _drawStatsCharts(); }, 80);
}
function closeStatsModal(){
  var modal=document.getElementById('statsModal');
  if(modal) modal.classList.remove('show');
  navPop('statsModal');
}
function _drawStatsCharts(){
  _drawStatsPie();
  _drawStatsLine();
}
function _drawStatsPie(){
  var canvas=document.getElementById('statsPieCanvas');
  var legend=document.getElementById('statsPieLegend');
  if(!canvas||!legend) return;
  var items=[];
  var seen=new Set();
  var addItem=function(a,src){
    if(!a||seen.has(a.id)) return;
    seen.add(a.id);
    var wc=getTotalWords(a);
    if(wc>0) items.push({title:(a.title||'未命名').substring(0,10),wc:wc,src:src});
  };
  (ws||[]).forEach(function(a){addItem(a,'作坊');});
  (cols.books||[]).forEach(function(a){addItem(a,'收藏');});
  (cols.shorts||[]).forEach(function(a){addItem(a,'收藏');});
  (crWorks||[]).forEach(function(w){
    if(seen.has(w.id)) return;
    seen.add(w.id);
    var wc=getCrWordCount(w);
    if(wc>0) items.push({title:(w.title||'未命名').substring(0,10),wc:wc,src:'创作'});
  });
  items.sort(function(a,b){return b.wc-a.wc;});
  var MAX=7;
  if(items.length>MAX){
    var rest=items.slice(MAX).reduce(function(s,i){return s+i.wc;},0);
    items=items.slice(0,MAX);
    if(rest>0) items.push({title:'其他',wc:rest,src:''});
  }
  var total=items.reduce(function(s,i){return s+i.wc;},0);
  if(total===0){
    legend.innerHTML='<div style="text-align:center;color:var(--text2);padding:20px 0">还没有作品数据</div>';
    return;
  }
  // HiDPI 适配
  var dpr=window.devicePixelRatio||1;
  var SIZE=220;
  canvas.width=SIZE*dpr; canvas.height=SIZE*dpr;
  canvas.style.width=SIZE+'px'; canvas.style.height=SIZE+'px';
  var ctx=canvas.getContext('2d');
  ctx.scale(dpr,dpr);
  var cx=SIZE/2,cy=SIZE/2,r=SIZE/2-12;
  var COLORS=['#a29bfe','#74b9ff','#55efc4','#ffeaa7','#fd79a8','#e17055','#81ecec','#b2bec3'];
  ctx.clearRect(0,0,SIZE,SIZE);
  var start=-Math.PI/2;
  items.forEach(function(item,i){
    var angle=(item.wc/total)*Math.PI*2;
    ctx.beginPath();
    ctx.moveTo(cx,cy);
    ctx.arc(cx,cy,r,start,start+angle);
    ctx.closePath();
    ctx.fillStyle=COLORS[i%COLORS.length];
    ctx.fill();
    ctx.strokeStyle=getComputedStyle(document.documentElement).getPropertyValue('--bg')||'#0f0f14';
    ctx.lineWidth=2;
    ctx.stroke();
    start+=angle;
  });
  ctx.beginPath();
  ctx.arc(cx,cy,r*0.48,0,Math.PI*2);
  ctx.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--card')||'#1a1a2e';
  ctx.fill();
  ctx.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--text')||'#e0e0e0';
  ctx.font='bold '+(13*dpr/dpr)+'px sans-serif';
  ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText(formatNum(total)+'字',cx,cy-7);
  ctx.font='9px sans-serif';
  ctx.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--text2')||'#888';
  ctx.fillText('全部作品',cx,cy+9);
  legend.innerHTML=items.map(function(item,i){
    var pct=Math.round(item.wc/total*100);
    return '<div style="display:flex;align-items:center;gap:6px">'
      +'<span style="width:10px;height:10px;border-radius:2px;background:'+COLORS[i%COLORS.length]+';flex-shrink:0;display:inline-block"></span>'
      +'<span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text)">'+_esc(item.title)+'</span>'
      +'<span style="color:var(--text2);flex-shrink:0">'+formatNum(item.wc)+'字 '+pct+'%</span>'
      +'</div>';
  }).join('');
}
function _drawStatsLine(){
  var canvas=document.getElementById('statsLineCanvas');
  var legendEl=document.getElementById('statsLineLegend');
  if(!canvas) return;
  var days=[],labels=[],now=new Date();
  for(var i=6;i>=0;i--){
    var d=new Date(now);
    d.setDate(d.getDate()-i);
    var key=d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();
    labels.push((d.getMonth()+1)+'/'+(d.getDate()));
    days.push(goalDailyStats[key]||0);
  }
  var maxVal=Math.max.apply(null,days)||1;
  var dpr=window.devicePixelRatio||1;
  var rect=canvas.getBoundingClientRect();
  var W=rect.width>0?rect.width:320, H=140;
  canvas.width=Math.round(W*dpr); canvas.height=Math.round(H*dpr);
  canvas.style.width=W+'px'; canvas.style.height=H+'px';
  var ctx=canvas.getContext('2d');
  ctx.scale(dpr,dpr);
  ctx.clearRect(0,0,W,H);
  var PAD={t:14,r:12,b:28,l:38};
  var cW=W-PAD.l-PAD.r, cH=H-PAD.t-PAD.b;
  var cs=getComputedStyle(document.documentElement);
  var accent=(cs.getPropertyValue('--accent')||'#6c5ce7').trim();
  var text2=(cs.getPropertyValue('--text2')||'#888').trim();
  var border=(cs.getPropertyValue('--border')||'#2a2a40').trim();
  // 渐变填充色（安全解析hex）
  var fillColor='rgba(108,92,231,0.15)';
  if(accent.startsWith('#')&&accent.length===7){
    var rr=parseInt(accent.slice(1,3),16),gg=parseInt(accent.slice(3,5),16),bb=parseInt(accent.slice(5,7),16);
    fillColor='rgba('+rr+','+gg+','+bb+',0.15)';
  }
  // 网格线
  ctx.strokeStyle=border; ctx.lineWidth=0.5;
  [0,0.5,1].forEach(function(ratio){
    var y=PAD.t+cH*(1-ratio);
    ctx.beginPath(); ctx.moveTo(PAD.l,y); ctx.lineTo(PAD.l+cW,y); ctx.stroke();
    if(ratio>0){
      ctx.fillStyle=text2; ctx.font='9px sans-serif';
      ctx.textAlign='right'; ctx.textBaseline='middle';
      ctx.fillText(formatNum(Math.round(maxVal*ratio)),PAD.l-4,y);
    }
  });
  var pts=days.map(function(v,i){
    return {x:PAD.l+(cW/(days.length-1))*i, y:PAD.t+cH*(1-v/maxVal)};
  });
  // 渐变填充
  var grad=ctx.createLinearGradient(0,PAD.t,0,PAD.t+cH);
  grad.addColorStop(0,fillColor);
  grad.addColorStop(1,'rgba(0,0,0,0)');
  ctx.beginPath();
  ctx.moveTo(pts[0].x,PAD.t+cH);
  pts.forEach(function(p){ctx.lineTo(p.x,p.y);});
  ctx.lineTo(pts[pts.length-1].x,PAD.t+cH);
  ctx.closePath();
  ctx.fillStyle=grad; ctx.fill();
  // 折线
  ctx.beginPath();
  ctx.strokeStyle=accent; ctx.lineWidth=2; ctx.lineJoin='round';
  pts.forEach(function(p,i){i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y);});
  ctx.stroke();
  // 数据点 + 标签
  pts.forEach(function(p,i){
    ctx.beginPath(); ctx.arc(p.x,p.y,3.5,0,Math.PI*2);
    ctx.fillStyle=accent; ctx.fill();
    if(days[i]>0){
      ctx.fillStyle=text2; ctx.font='9px sans-serif';
      ctx.textAlign='center'; ctx.textBaseline='bottom';
      ctx.fillText(formatNum(days[i]),p.x,p.y-5);
    }
  });
  // X轴标签
  ctx.fillStyle=text2; ctx.font='9px sans-serif';
  ctx.textAlign='center'; ctx.textBaseline='top';
  pts.forEach(function(p,i){ctx.fillText(labels[i],p.x,PAD.t+cH+4);});
  var todayVal=days[days.length-1];
  var weekTotal=days.reduce(function(s,v){return s+v;},0);
  if(legendEl) legendEl.textContent='本周合计 '+formatNum(weekTotal)+' 字 · 今日 '+formatNum(todayVal)+' 字';
}
function _esc(s){var d=document.createElement('div');d.textContent=s;return d.innerHTML;}
// ==================== 写作统计弹窗 END ====================
function updateStats(){
let totalWords=0;
let worksCount=0;
let todayWords=0;
const today=new Date().toDateString();
// 作坊文章
ws.forEach(a=>{totalWords+=getTotalWords(a);});
worksCount+=ws.length;
// 创作作品
crWorks.forEach(w=>{totalWords+=getCrWordCount(w);});
worksCount+=crWorks.length;
// 收藏里独有的（不在作坊里的）
cols.books.forEach(b=>{
if(!ws.find(a=>a.id===b.id))totalWords+=getTotalWords(b);
});
cols.shorts.forEach(s=>{
if(!ws.find(a=>a.id===s.id))totalWords+=getTotalWords(s);
});
const colsCount=cols.books.length+cols.shorts.length;
// 总登录天数（与星笺主动对话、AI人设上下文读取同一份 bj_loginLog 打卡记录，保持数据一致）
const loginLog=ld('bj_loginLog',{});
const totalLoginDays=Object.keys(loginLog).length||1;
document.getElementById('statTotal').textContent=formatNum(totalWords);
document.getElementById('statWorks').textContent=worksCount;
document.getElementById('statCols').textContent=colsCount;
document.getElementById('statLoginDays').textContent=totalLoginDays;

// 计算今日创作字数
const todayKey='bj_today_'+today;
const savedToday=ld(todayKey,0);
if(savedToday>0){
const statTotalEl=document.getElementById('statTotal');
if(statTotalEl)statTotalEl.title='今日创作：'+savedToday+'字';
}
}

// 记录今日创作字数
function recordTodayWords(addWords){
const today=new Date().toDateString();
const todayKey='bj_today_'+today;
const current=ld(todayKey,0);
sv(todayKey,current+addWords);
}
// 字节数格式化：自动选择 B/KB/MB/GB，避免大配额下出现一长串数字
function _fmtStorageSize(bytes){
  bytes = bytes || 0;
  if (bytes >= 1024*1024*1024) return (bytes/1024/1024/1024).toFixed(2) + 'GB';
  if (bytes >= 1024*1024) return (bytes/1024/1024).toFixed(1) + 'MB';
  if (bytes >= 1024) return (bytes/1024).toFixed(0) + 'KB';
  return bytes + 'B';
}
async function updateStorageDisplay() {
  try {
    // 优先用浏览器真实 estimate（更准确）
    if (navigator.storage && navigator.storage.estimate) {
      const est = await navigator.storage.estimate();
      const used = est.usage || 0;
      const quota = est.quota || 0;
      // 部分浏览器（隐私模式/老版本 iOS Safari 等）可能返回异常小或为 0 的配额，
      // 这种不可信的情况下退回到 50MB 的预估目标，避免误导用户"空间快满了"
      const useRealQuota = quota >= 5 * 1024 * 1024;
      const targetBytes = useRealQuota ? quota : 50 * 1024 * 1024;
      const pct = Math.min(used / targetBytes * 100, 100);
      const isFull = pct >= 85;

      const percentEl = document.getElementById('storagePercent');
      const barEl = document.getElementById('storageBar');
      const detailEl = document.getElementById('storageDetail');
      // 存储概览面板尚未挂载（如页面还没渲染出数据管理弹层）时元素可能取不到，
      // 加判空跳过对应写入，避免整段 try 提前抛错、连累下面的分类明细刷新也一起跳过
      if (percentEl) {
        percentEl.textContent = pct.toFixed(1) + '%';
        percentEl.classList.toggle('storage-full-warn', isFull);
      }
      if (barEl) {
        barEl.style.width = pct.toFixed(1) + '%';
        barEl.classList.toggle('storage-full-warn', isFull);
      }
      if (detailEl) {
        detailEl.textContent = '已用 ' + _fmtStorageSize(used) + ' / ' + _fmtStorageSize(targetBytes) +
          (useRealQuota ? '（浏览器实际可用空间）' : '（预估值，当前浏览器未提供准确配额）');
      }
    } else {
      // 没有 estimate 就用 IndexedDB 估算
      const info = await getDBStorageUsage();
      const percentEl = document.getElementById('storagePercent');
      const barEl = document.getElementById('storageBar');
      const detailEl = document.getElementById('storageDetail');
      if (percentEl) percentEl.textContent = info.percent + '%';
      if (barEl) barEl.style.width = Math.min(info.percent, 100) + '%';
      if (detailEl) detailEl.textContent = '已用 ' + info.usedMB + 'MB / 50MB（预估值）';
    }
    // 存储概览面板：分类明细，两条路径都要刷新，保证"及时更新"
    updateStorageCategoryBreakdown();
  } catch (e) {
    logError('updateStorageDisplay', e);
    const percentElFail = document.getElementById('storagePercent');
    const detailElFail = document.getElementById('storageDetail');
    if (percentElFail) percentElFail.textContent = '计算失败';
    if (detailElFail) detailElFail.textContent = '请刷新页面重试';
  }
}

// ---- 存储概览：六大分类明细（按key前缀归类，兜底桶保证总数永远准确）----
var STORAGE_CAT_DEFS = [
  {name:'作品与创作', icon:'fa-book-open', color:'#6c5ce7', desc:'作坊、收藏、创作页作品与续写上下文'},
  {name:'设定与预设', icon:'fa-sliders', color:'#0984e3', desc:'人物、世界观、文风、规则、API配置'},
  {name:'笔记与追踪', icon:'fa-pen-nib', color:'#00b894', desc:'章节笔记、伏笔、时间线、版本快照'},
  {name:'素材与资源包', icon:'fa-box-open', color:'#e17055', desc:'素材库、导入导出的资源包'},
  {name:'日志与统计', icon:'fa-chart-line', color:'#e0a800', desc:'生成日志、创作目标统计'},
  {name:'外观与其他', icon:'fa-palette', color:'#fd79a8', desc:'背景图、主题、账号信息及其余设置'}
];
function _classifyStorageKey(key){
  var p0 = ['bj_cols','bj_crWorks','bj_crFolders','bj_works','bj_advProjects','bj_advGenres','bj_articleContexts'];
  for(var i=0;i<p0.length;i++){ if(key.indexOf(p0[i])===0) return 0; }
  var p1 = ['bj_curChars','bj_curWorld','bj_styleP','bj_ruleP','bj_banWordsP','bj_charP','bj_worldP',
    'bj_sysPromptP','bj_sysPromptEntries','bj_genTemplates','bj_globalWorld','bj_globalRule','bj_globalBanWords','bj_curRule',
    'bj_customSysPrompt','bj_customTraits','bj_curApi','bj_toolApi','bj_apiP',
    'bj_localBanWordsBindings','bj_localRuleBindings','bj_localStyleBindings','bj_localWorldBindings',
    'bj_currentBanBinding','bj_currentCharPresetName','bj_currentRuleBinding','bj_currentRulePresetName',
    'bj_currentStyleBinding','bj_currentStylePresetName','bj_currentWorldBinding','bj_currentWorldPresetName',
    'bj_currentBanPresetName'];
  for(var j=0;j<p1.length;j++){ if(key.indexOf(p1[j])===0) return 1; }
  var p2 = ['bj_notes_','bj_foreshadow_','bj_timeline_','bj_chVer_','bj_fanwai_','bj_charRelations','bj_npcList'];
  for(var k=0;k<p2.length;k++){ if(key.indexOf(p2[k])===0) return 2; }
  var p3 = ['bj_materials','bj_resPacks','bj_favItems','bj_favTags','bj_storyWheels'];
  for(var m=0;m<p3.length;m++){ if(key.indexOf(p3[m])===0) return 3; }
  var p4 = ['bj_genLogs','bj_loginLog','bj_goalDailyStats','bj_goalYearStats','bj_goalProgress','bj_goalSettings','bj_goalCelebrated','bj_daily_streak'];
  for(var n=0;n<p4.length;n++){ if(key.indexOf(p4[n])===0) return 4; }
  return 5; // 外观、账号、主题及其余未归类的设置项，兜底保证总数不漏算
}
function updateStorageCategoryBreakdown(){
  var grid = document.getElementById('storageCatGrid');
  if(!grid) return;
  try{
    // 汇总 localStorage 与内存缓存(dbCache) 里出现过的所有 bj_ 前缀key；
    // 单条数据超过约10万字符时只会写入IndexedDB(走dbCache)、不会出现在localStorage里，
    // 两边都扫一遍再用 ld() 读值，避免大体积数据被漏算
    var allKeys = {};
    Object.keys(localStorage).forEach(function(k){ if(k.indexOf('bj_')===0) allKeys[k]=true; });
    if(typeof dbCache==='object'&&dbCache){ Object.keys(dbCache).forEach(function(k){ if(k.indexOf('bj_')===0) allKeys[k]=true; }); }

    var totals = [0,0,0,0,0,0];
    Object.keys(allKeys).forEach(function(key){
      try{
        var v = ld(key, null);
        if(v===null||v===undefined) return;
        var size = (typeof v==='string') ? v.length*2 : JSON.stringify(v).length*2;
        totals[_classifyStorageKey(key)] += size;
      }catch(e){}
    });

    var grand = totals.reduce(function(a,b){return a+b;},0) || 1;
    var html = '';
    STORAGE_CAT_DEFS.forEach(function(cat, i){
      var bytes = totals[i];
      var label = bytes >= 1024*1024 ? (bytes/1024/1024).toFixed(2)+'MB' : (bytes/1024).toFixed(1)+'KB';
      var pct = bytes>0 ? Math.max(bytes/grand*100, 2) : 0;
      html += '<div class="storage-cat-card">'+
        '<div class="storage-cat-top">'+
          '<div class="storage-cat-icon" style="background:'+cat.color+'"><i class="fas '+cat.icon+'"></i></div>'+
          '<div class="storage-cat-size">'+label+'</div>'+
        '</div>'+
        '<div class="storage-cat-track"><div class="storage-cat-fill" style="width:'+pct.toFixed(1)+'%;background:'+cat.color+'"></div></div>'+
        '<div class="storage-cat-desc">'+cat.desc+'</div>'+
      '</div>';
    });
    grid.innerHTML = html;
  }catch(e){
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:10px;font-size:11px;color:var(--text2)">明细计算失败</div>';
  }
}

// ==================== 浏览器持久化存储保护 ====================
// persistStorageGranted：当前是否已获得持久化存储保护
// storageFullReminder：是否开启"空间满时提醒备份"（默认开启，需先获得持久化存储保护才允许关闭）
persistStorageGranted = ld('bj_persistStorageGranted', false);
storageFullReminder = ld('bj_storageFullReminder', true);

// 进入网页时自动申请一次（仅在从未申请过、或上次已经申请成功的情况下静默处理；
// 若上次申请被拒绝/取消，则不再自动打扰，等待用户在"其他设置"里手动重新申请）
async function initPersistentStorageOnLoad(){
  try{
    if(!navigator.storage || !navigator.storage.persist){
      updatePersistStorageUI(false, true);
      return;
    }
    var already = await navigator.storage.persisted();
    if(already){
      persistStorageGranted = true;
      sv('bj_persistStorageGranted', true);
      updatePersistStorageUI(true, false);
      return;
    }
    var asked = ld('bj_persistStorageAsked', false);
    if(asked){
      // 之前已经自动申请过一次但未获批准，这次不再自动弹权限请求
      persistStorageGranted = false;
      sv('bj_persistStorageGranted', false);
      updatePersistStorageUI(false, false);
      return;
    }
    sv('bj_persistStorageAsked', true);
    var granted = await navigator.storage.persist();
    persistStorageGranted = !!granted;
    sv('bj_persistStorageGranted', persistStorageGranted);
    updatePersistStorageUI(persistStorageGranted, false);
  }catch(e){
    logError('persistStorage', e);
    updatePersistStorageUI(false, true);
  }
}

// 仅刷新状态显示，不主动弹权限请求（用于每次打开设置页时同步最新状态）
async function refreshPersistStorageStatus(){
  try{
    if(!navigator.storage || !navigator.storage.persist){
      updatePersistStorageUI(false, true);
      return;
    }
    var already = await navigator.storage.persisted();
    persistStorageGranted = !!already;
    sv('bj_persistStorageGranted', persistStorageGranted);
    updatePersistStorageUI(persistStorageGranted, false);
  }catch(e){
    logError('persistStorage', e);
    updatePersistStorageUI(false, true);
  }
}

// "其他设置"页里的手动重新申请按钮
async function retryRequestPersistentStorage(){
  if(!navigator.storage || !navigator.storage.persist){
    showToast('当前浏览器不支持持久化存储保护');
    return;
  }
  try{
    var already = await navigator.storage.persisted();
    if(already){
      persistStorageGranted = true;
      sv('bj_persistStorageGranted', true);
      updatePersistStorageUI(true, false);
      showToast('已经是受保护状态啦～');
      return;
    }
    var granted = await navigator.storage.persist();
    sv('bj_persistStorageAsked', true);
    persistStorageGranted = !!granted;
    sv('bj_persistStorageGranted', persistStorageGranted);
    updatePersistStorageUI(persistStorageGranted, false);
    showToast(persistStorageGranted ? '持久化存储保护已开启，浏览器不会再自动清理星叙数据啦～' : '申请未成功，浏览器可能需要更多访问记录才会批准，可以稍后再试试');
  }catch(e){
    logError('persistStorage', e);
    showToast('申请失败，请稍后重试');
  }
}

// 统一刷新"持久化存储"相关的所有UI（其他设置页的卡片 + 数据管理页的小徽标）
function updatePersistStorageUI(granted, unsupported){
  var desc = document.getElementById('persistStorageDesc');
  var btn = document.getElementById('persistStorageBtn');
  if(desc){
    if(unsupported){
      desc.textContent = '当前浏览器不支持此功能';
      desc.style.color = 'var(--text2)';
    }else if(granted){
      desc.textContent = '✅ 已开启，浏览器不会自动清理星叙数据';
      desc.style.color = 'var(--success)';
    }else{
      desc.textContent = '⚠️ 尚未开启，数据存在被系统自动清理的风险';
      desc.style.color = '#f0a030';
    }
  }
  if(btn){
    if(unsupported){
      btn.textContent = '不支持'; btn.disabled = true; btn.style.opacity = '.5'; btn.style.cursor = 'default';
    }else if(granted){
      btn.textContent = '已开启'; btn.disabled = true; btn.style.opacity = '.5'; btn.style.cursor = 'default';
    }else{
      btn.textContent = '重新申请'; btn.disabled = false; btn.style.opacity = '1'; btn.style.cursor = 'pointer';
    }
  }
  var badge = document.getElementById('dataPersistBadge');
  if(badge){
    if(unsupported){ badge.textContent = '不支持'; badge.style.color = 'var(--text2)'; }
    else if(granted){ badge.textContent = '✅ 已开启'; badge.style.color = 'var(--success)'; }
    else{ badge.textContent = '未开启 · 点击去开启 ›'; badge.style.color = '#f0a030'; }
  }
  updateStorageFullReminderGateUI();
}

// 从"数据管理"页跳转到"其他设置"页（点击持久化存储徽标时使用）
function jumpToOtherFromData(){
  try{ closeSetModal('data'); }catch(e){}
  setTimeout(function(){ try{ openSetModal('other'); }catch(e){} }, 260);
}

// ==================== 存储空间满提醒（开关UI，需先获得持久化存储保护才可关闭）====================
function updateStorageFullReminderGateUI(){
  var wrap = document.getElementById('storageFullReminderWrap');
  var descEl = document.getElementById('storageFullReminderDesc');
  if(wrap){
    if(persistStorageGranted){
      wrap.style.opacity = '1';
      wrap.style.cursor = 'pointer';
    }else{
      wrap.style.opacity = '.5';
      wrap.style.cursor = 'not-allowed';
    }
  }
  if(descEl){
    descEl.textContent = persistStorageGranted
      ? '空间接近用满时，无论"定期备份"是否开启都会提示一次'
      : '需先开启上方的持久化存储保护，才能关闭此提醒';
  }
  updateStorageFullReminderUI();
}
function updateStorageFullReminderUI(){
  var cb = document.getElementById('storageFullReminderOn');
  var track = document.getElementById('storageFullReminderTrack');
  var thumb = document.getElementById('storageFullReminderThumb');
  if(!cb||!track||!thumb) return;
  cb.checked = !!storageFullReminder;
  if(storageFullReminder){ track.style.background = 'var(--accent)'; thumb.style.left = '22px'; }
  else{ track.style.background = 'var(--border)'; thumb.style.left = '2px'; }
  var wrapper = track.parentElement;
  if(wrapper && wrapper.hasAttribute('role')){
    wrapper.setAttribute('aria-checked', storageFullReminder ? 'true' : 'false');
  }
}
function toggleStorageFullReminder(){
  if(!persistStorageGranted){
    showToast('请先开启上方的"持久化存储保护"，才能关闭此提醒哦～');
    return;
  }
  storageFullReminder = !storageFullReminder;
  sv('bj_storageFullReminder', storageFullReminder);
  updateStorageFullReminderUI();
  showToast('存储空间满提醒：' + (storageFullReminder ? '已开启' : '已关闭'));
}

// ==================== 存储空间满时的备份提醒 ====================
// 独立于"定期备份"开关：即使那个开关关闭，空间快满时依然会提醒一次。
// 每 3 天最多检查一次，避免频繁弹窗打扰。
async function checkStorageFullReminder(){
  try{
    if(!navigator.storage || !navigator.storage.estimate) return;
    var lastCheck = parseInt(localStorage.getItem('bj_lastStorageFullCheck') || '0', 10);
    var now = Date.now();
    var threeDays = 3 * 24 * 60 * 60 * 1000;
    if(now - lastCheck < threeDays) return; // 未到三天检查周期
    localStorage.setItem('bj_lastStorageFullCheck', now.toString());

    if(!storageFullReminder) return; // 用户已主动关闭此提醒（需先获得持久化存储保护才能关闭）

    var est = await navigator.storage.estimate();
    var usage = est.usage || 0;
    var quota = est.quota || 0;
    if(!quota || quota < 5 * 1024 * 1024) return; // 配额数据不可信时不判断"是否满"
    var pct = usage / quota * 100;
    if(pct >= 85){
      setTimeout(function(){
        showDlg(
          '存储空间快用满啦',
          '浏览器分配给星叙的空间已经用了 ' + pct.toFixed(0) + '%（' + _fmtStorageSize(usage) + ' / ' + _fmtStorageSize(quota) + '）。\n\n继续创作可能会因为空间不足导致保存失败，建议先导出一份数据备份，也可以顺手清理一些不需要的旧内容～',
          function(){ openSetModal('data'); }
        );
      }, 6000);
    }
  }catch(e){
    logError('storageFullCheck', e);
  }
}

function formatNum(n){
if(n>=10000)return (n/10000).toFixed(1)+'万';
if(n>=1000)return (n/1000).toFixed(1)+'k';
return n;
}
function uploadAvatar(){
document.getElementById('avatarUp').click();
}
function handleAvatarUpload(e){
var file=e.target.files[0];
if(!file)return;
e.target.value='';
var img=new Image();
img.onload=function(){
  _cropState={imgW:img.width,imgH:img.height,scale:1,x:0,y:0,src:img.src,target:'avatar'};
  openAvatarCropModal(img.src);
};
img.src=URL.createObjectURL(file);
}
// ==================== 头像裁剪系统 ====================
let _cropState={imgW:0,imgH:0,scale:1,x:0,y:0,src:'',target:'avatar'};
let _cropDragging=false;
let _cropStartX=0,_cropStartY=0,_cropStartOX=0,_cropStartOY=0;
let _cropPinchDist=0,_cropPinchScale=1;

function openAvatarCropModal(src){
  var cropImg=document.getElementById('cropImg');
  cropImg.src=src;
  // 等图片加载后初始化位置
  cropImg.onload=function(){
    _cropFitImage();
    _cropApplyTransform();
  };
  document.getElementById('avatarCropOv').classList.add('show');
  _cropBindGestures();
}

function _cropFitImage(){
  var containerSize=240;
  var imgW=_cropState.imgW;
  var imgH=_cropState.imgH;
  // 让短边填满容器
  var minDim=Math.min(imgW,imgH);
  _cropState.scale=containerSize/minDim;
  // 居中
  _cropState.x=(containerSize-imgW*_cropState.scale)/2;
  _cropState.y=(containerSize-imgH*_cropState.scale)/2;
  document.getElementById('cropZoomVal').textContent=Math.round(_cropState.scale*100)+'%';
}

function _cropApplyTransform(){
  var img=document.getElementById('cropImg');
  if(!img)return;
  img.style.width=(_cropState.imgW*_cropState.scale)+'px';
  img.style.height=(_cropState.imgH*_cropState.scale)+'px';
  img.style.left=_cropState.x+'px';
  img.style.top=_cropState.y+'px';
}

function _cropZoom(delta){
  _cropState.scale=Math.max(0.3,Math.min(5,_cropState.scale+delta));
  // 保持中心点
  var containerSize=240;
  var cx=containerSize/2;
  var cy=containerSize/2;
  _cropState.x=cx-(_cropState.imgW*_cropState.scale)/2;
  _cropState.y=cy-(_cropState.imgH*_cropState.scale)/2;
  document.getElementById('cropZoomVal').textContent=Math.round(_cropState.scale*100)+'%';
  _cropApplyTransform();
}

function _cropReset(){
  _cropFitImage();
  _cropApplyTransform();
}

function _cropBindGestures(){
  var container=document.getElementById('cropContainer');
  if(!container)return;
  // 移除旧监听（简单方案：克隆替换）
  var newC=container.cloneNode(true);
  container.parentNode.replaceChild(newC,container);
  container=newC;
  // 重新获取img引用
  var img=container.querySelector('#cropImg');
  if(img){
    img.src=_cropState.src;
    img.onload=function(){_cropApplyTransform();};
  }

  var isDrag=false,moved=false;
  var sx=0,sy=0,sox=0,soy=0;
  var pinching=false,pinchDist0=0,pinchScale0=1;

  container.addEventListener('touchstart',function(e){
    e.preventDefault();
    if(e.touches.length===2){
      pinching=true;
      var dx=e.touches[0].clientX-e.touches[1].clientX;
      var dy=e.touches[0].clientY-e.touches[1].clientY;
      pinchDist0=Math.sqrt(dx*dx+dy*dy);
      pinchScale0=_cropState.scale;
      return;
    }
    if(e.touches.length===1){
      isDrag=true;moved=false;
      sx=e.touches[0].clientX;sy=e.touches[0].clientY;
      sox=_cropState.x;soy=_cropState.y;
    }
  },{passive:false});

  container.addEventListener('touchmove',function(e){
    e.preventDefault();
    if(pinching&&e.touches.length===2){
      var dx=e.touches[0].clientX-e.touches[1].clientX;
      var dy=e.touches[0].clientY-e.touches[1].clientY;
      var dist=Math.sqrt(dx*dx+dy*dy);
      _cropState.scale=Math.max(0.3,Math.min(5,pinchScale0*(dist/pinchDist0)));
      document.getElementById('cropZoomVal').textContent=Math.round(_cropState.scale*100)+'%';
      _cropApplyTransform();
      return;
    }
    if(isDrag&&e.touches.length===1){
      var dx2=e.touches[0].clientX-sx;
      var dy2=e.touches[0].clientY-sy;
      if(Math.abs(dx2)>3||Math.abs(dy2)>3)moved=true;
      _cropState.x=sox+dx2;
      _cropState.y=soy+dy2;
      _cropApplyTransform();
    }
  },{passive:false});

  container.addEventListener('touchend',function(e){
    isDrag=false;pinching=false;
  });
  container.addEventListener('touchcancel',function(){isDrag=false;pinching=false;});

  // PC鼠标拖动
  var mDown=false,msx=0,msy=0,msox=0,msoy=0;
  container.addEventListener('mousedown',function(e){
    mDown=true;msx=e.clientX;msy=e.clientY;
    msox=_cropState.x;msoy=_cropState.y;
    container.style.cursor='grabbing';
  });
  container.addEventListener('mousemove',function(e){
    if(!mDown)return;
    _cropState.x=msox+(e.clientX-msx);
    _cropState.y=msoy+(e.clientY-msy);
    _cropApplyTransform();
  });
  container.addEventListener('mouseup',function(){mDown=false;container.style.cursor='';});
  container.addEventListener('mouseleave',function(){mDown=false;container.style.cursor='';});
  // PC滚轮缩放
  container.addEventListener('wheel',function(e){
    e.preventDefault();
    _cropZoom(e.deltaY<0?0.05:-0.05);
  },{passive:false});
}

function cancelAvatarCrop(){
  document.getElementById('avatarCropOv').classList.remove('show');
}

function confirmAvatarCrop(){
  var containerSize=240;
  var outputSize=200; // 输出200px的正方形
  var canvas=document.createElement('canvas');
  canvas.width=outputSize;canvas.height=outputSize;
  var ctx=canvas.getContext('2d');

  var img=new Image();
  img.onload=function(){
    // 计算裁剪区域：容器的240x240圆形区域对应到原图的什么位置
    var ratio=outputSize/containerSize;
    var drawX=_cropState.x*ratio;
    var drawY=_cropState.y*ratio;
    var drawW=_cropState.imgW*_cropState.scale*ratio;
    var drawH=_cropState.imgH*_cropState.scale*ratio;
    
    // 圆形裁剪
    ctx.beginPath();
    ctx.arc(outputSize/2,outputSize/2,outputSize/2,0,Math.PI*2);
    ctx.closePath();
    ctx.clip();
    
    ctx.drawImage(img,drawX,drawY,drawW,drawH);
    
    var dataUrl=canvas.toDataURL('image/jpeg',0.85);
    
    if(_cropState.target==='avatar'){
      userCard.avatar=dataUrl;
      sv('bj_userCard',userCard);
      renderUserCard();
      showToast('头像已裁剪并保存');
    }else if(_cropState.target==='rpAvatar'){
      rpTempAvatar=dataUrl;
      document.getElementById('rpEditAvatarPreview').innerHTML='<img src="'+dataUrl+'" style="width:100%;height:100%;object-fit:cover;border-radius:50%">';
      showToast('角色头像已裁剪');
    }
    
    document.getElementById('avatarCropOv').classList.remove('show');
  };
  img.src=_cropState.src;
}
function editUcName(){
showInp('设置昵称','输入你的昵称',name=>{
userCard.name=name;
sv('bj_userCard',userCard);
renderUserCard();
showToast('昵称已更新');
});
}
function editUcBio(){
const ov=document.getElementById('inpOv');
document.getElementById('inpTitle').textContent='编辑简介';
const f=document.getElementById('inpField');
f.placeholder='写一句话介绍自己...';
f.value=userCard.bio||'';
document.getElementById('inpOkBtn').onclick=()=>{
userCard.bio=f.value.trim();
sv('bj_userCard',userCard);
closeInp();
renderUserCard();
showToast('简介已更新');
};
ov.classList.add('show');
setTimeout(()=>f.focus(),100);
}
// ==================== OUTLINE GENERATOR ====================
let outlineChCount=10;
let outlineText='';
function toggleOutlineSwitch(id){
var cb=document.getElementById(id);
cb.checked=!cb.checked;
var track=document.getElementById(id+'Track');
var thumb=document.getElementById(id+'Thumb');
if(cb.checked){track.style.background='var(--accent)';thumb.style.left='20px';}
else{track.style.background='var(--border)';thumb.style.left='2px';}
}

function toggleBranchSwitch(id){
var cb=document.getElementById(id);
cb.checked=!cb.checked;
var track=document.getElementById(id+'Track');
var thumb=document.getElementById(id+'Thumb');
if(cb.checked){track.style.background='var(--accent)';thumb.style.left='20px';}
else{track.style.background='var(--border)';thumb.style.left='2px';}
}
// ==================== 章节多版本管理 ====================
function getChapterVersions(workId,chIdx){
return ld('bj_chVer_'+workId+'_'+chIdx,[]);
}

function saveChapterVersions(workId,chIdx,versions){
sv('bj_chVer_'+workId+'_'+chIdx,versions);
}

function saveChapterVersion(){
if(!curEd){showToast('请先打开一篇作品');return;}
saveEditorChapter();
var text=curEd.type==='novel'?(curEd.chapters[curEdCh]||''):(curEd.content||'');
if(countWords(text)<5){showToast('当前内容太少，至少写5个字再保存版本');return;}
var versions=getChapterVersions(curEd.id,curEdCh);
var defaultName='版本'+(versions.length+1);
showInp('保存版本','给这个版本起个名字（如：初稿、修改版、甜蜜线）',function(name){
versions.push({
name:name||defaultName,
text:text,
wordCount:countWords(text),
time:new Date().toISOString()
});
if(versions.length>20){versions=versions.slice(-20);}
saveChapterVersions(curEd.id,curEdCh,versions);
showToast('版本「'+name+'」已保存 (共'+versions.length+'个版本)');
});
}

function openVersionList(){
if(!curEd){showToast('请先打开一篇作品');return;}
var chName=(curEd.type==='novel'&&curEd.chNames&&curEd.chNames[curEdCh])?curEd.chNames[curEdCh]:'';
document.getElementById('versionTitle').textContent=curEd.type==='novel'
  ? '第'+(curEdCh+1)+'章'+(chName?' '+chName:'')+' 的版本'
  : '「'+(curEd.title||'未命名草稿')+'」的版本';
var versions=getChapterVersions(curEd.id,curEdCh);
var currentText=document.getElementById('edTextarea').value||'';
var currentWc=countWords(currentText);
document.getElementById('versionSubtitle').textContent='当前内容 '+currentWc+' 字 · 共 '+versions.length+' 个保存的版本';
document.getElementById('versionCompare').style.display='none';
_versionSearchQ='';
var sInp=document.getElementById('versionSearchInput');
if(sInp)sInp.value='';
var sClr=document.getElementById('versionSearchClear');
if(sClr)sClr.style.display='none';
renderVersionList(versions,currentText);
document.getElementById('versionOv').classList.add('show');
navPush('versionOv');
}

function closeVersionList(){
  navPop('versionOv');
document.getElementById('versionOv').classList.remove('show');
}

var _verListCache=[];
var _verCurrentTextCache='';
var _versionSearchQ='';

function renderVersionList(versions,currentText){
_verListCache=versions;
_verCurrentTextCache=currentText;
var body=document.getElementById('versionListBody');
if(versions.length===0){
body.innerHTML='<div style="text-align:center;padding:30px;color:var(--text2);font-size:12px">还没有保存的版本<br><br>在编辑器工具栏点击「<i class="fas fa-floppy-disk"></i> 保存版本」<br>可以保存当前内容的一个快照</div>';
return;
}
var q=(_versionSearchQ||'').trim().toLowerCase();
// 保留原始索引（i），这样使用/对比/复制/删除时依然能定位到versions数组里正确的那一项，不受搜索筛选影响
var filtered=versions.map(function(v,i){return {v:v,i:i};});
if(q){
filtered=filtered.filter(function(item){return (item.v.name||'').toLowerCase().indexOf(q)!==-1;});
}
if(filtered.length===0){
body.innerHTML='<div style="text-align:center;padding:30px;color:var(--text2);font-size:12px">没有名称匹配「'+esc(_versionSearchQ)+'」的版本</div>';
return;
}
var html='';
filtered.forEach(function(item){
var v=item.v,i=item.i;
var time=v.time?new Date(v.time).toLocaleString():'';
var preview=(v.text||'').replace(/\n/g,' ').substring(0,60);
html+='<div style="background:var(--card);border:1px solid var(--border);border-radius:10px;padding:12px;margin-bottom:8px;transition:all .2s">';
html+='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">';
html+='<div style="display:flex;align-items:center;gap:6px">';
html+='<span style="font-size:13px;font-weight:600">'+esc(v.name||'版本'+(i+1))+'</span>';
html+='<span style="font-size:9px;padding:2px 6px;border-radius:6px;background:rgba(108,92,231,.1);color:var(--accent2)">'+v.wordCount+'字</span>';
html+='</div>';
html+='<span style="font-size:9px;color:var(--text2)">'+time+'</span>';
html+='</div>';
html+='<div style="font-size:11px;color:var(--text2);line-height:1.6;margin-bottom:8px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+esc(preview)+'</div>';
html+='<div style="display:flex;gap:2px;justify-content:flex-end">';
html+='<button class="ver-icon-btn accent" onclick="useVersion('+i+')" title="使用此版本"><i class="fas fa-check-circle"></i></button>';
html+='<button class="ver-icon-btn" onclick="compareVersion('+i+')" title="与当前对比"><i class="fas fa-chart-bar"></i></button>';
html+='<button class="ver-icon-btn" onclick="copyVersionText('+i+')" title="复制文本"><i class="fas fa-copy"></i></button>';
html+='<button class="ver-icon-btn danger" onclick="deleteVersion('+i+')" title="删除"><i class="fas fa-trash-alt"></i></button>';
html+='</div>';
html+='</div>';
});
body.innerHTML=html;
}

var _versionSearchTimer=null;
function debounceVersionSearch(){
var inp=document.getElementById('versionSearchInput');
var clr=document.getElementById('versionSearchClear');
if(inp)_versionSearchQ=inp.value;
if(clr)clr.style.display=_versionSearchQ?'block':'none';
clearTimeout(_versionSearchTimer);
_versionSearchTimer=setTimeout(function(){renderVersionList(_verListCache,_verCurrentTextCache);},250);
}
function clearVersionSearch(){
var inp=document.getElementById('versionSearchInput');
var clr=document.getElementById('versionSearchClear');
if(inp)inp.value='';
if(clr)clr.style.display='none';
_versionSearchQ='';
renderVersionList(_verListCache,_verCurrentTextCache);
}

function useVersion(idx){
if(!curEd)return;
var versions=getChapterVersions(curEd.id,curEdCh);
if(idx<0||idx>=versions.length)return;
showDlg('切换版本','将当前内容替换为「'+versions[idx].name+'」的内容？\n\n建议先保存当前版本再切换。',function(){
edPushUndo();
document.getElementById('edTextarea').value=versions[idx].text;
onEditorInput();
closeVersionList();
showToast('已切换到「'+versions[idx].name+'」');
});
}

function compareVersion(idx){
if(!curEd)return;
var versions=getChapterVersions(curEd.id,curEdCh);
if(idx<0||idx>=versions.length)return;
var currentText=document.getElementById('edTextarea').value||'';
document.getElementById('compareLeftLabel').textContent='当前内容 ('+countWords(currentText)+'字)';
document.getElementById('compareRightLabel').textContent=''+versions[idx].name+' ('+versions[idx].wordCount+'字)';
document.getElementById('compareLeftText').textContent=currentText.substring(0,2000)+(currentText.length>2000?'\n\n...（已截断）':'');
document.getElementById('compareRightText').textContent=(versions[idx].text||'').substring(0,2000)+(versions[idx].text.length>2000?'\n\n...（已截断）':'');
document.getElementById('versionCompare').style.display='';
}

function copyVersionText(idx){
if(!curEd)return;
var versions=getChapterVersions(curEd.id,curEdCh);
if(idx<0||idx>=versions.length)return;
doCopy(versions[idx].text||'');
showToast('版本内容已复制');
}

function deleteVersion(idx){
if(!curEd)return;
var versions=getChapterVersions(curEd.id,curEdCh);
if(idx<0||idx>=versions.length)return;
showDlg('删除版本','确定要删除「'+versions[idx].name+'」吗？',function(){
versions.splice(idx,1);
saveChapterVersions(curEd.id,curEdCh,versions);
var currentText=document.getElementById('edTextarea').value||'';
renderVersionList(versions,currentText);
showToast('版本已删除');
},true);
}
// ==================== 收藏批量管理 ====================
let batchMode=false;
let batchSelected=new Set();

function toggleBatchMode(){
batchMode=!batchMode;
batchSelected.clear();
var btn=document.getElementById('batchModeBtn');
var bar=document.getElementById('batchBar');
if(batchMode){
btn.textContent='退出管理';
btn.style.borderColor='var(--accent)';
btn.style.color='var(--accent2)';
bar.style.display='';
}else{
btn.textContent='批量管理';
btn.style.borderColor='var(--border)';
btn.style.color='var(--text2)';
bar.style.display='none';
}
updateBatchCount();
renderCollections();
}

function updateBatchCount(){
var el=document.getElementById('batchCount');
if(el)el.textContent='已选 '+batchSelected.size+' 项';
}

function toggleBatchItem(id,type){
var key=type+'_'+id;
if(batchSelected.has(key)){
batchSelected.delete(key);
}else{
batchSelected.add(key);
}
updateBatchCount();
var card=document.querySelector('[data-batch-id="'+key+'"]');
if(card){
card.style.borderColor=batchSelected.has(key)?'var(--accent)':'var(--border)';
card.style.background=batchSelected.has(key)?'rgba(108,92,231,.08)':'';
}
var chk=document.getElementById('bchk_'+id);
if(chk){
var sel=batchSelected.has(key);
chk.style.borderColor=sel?'var(--accent)':'rgba(255,255,255,.5)';
chk.style.background=sel?'var(--accent)':'rgba(0,0,0,.3)';
chk.textContent=sel?'✓':'';
}
}

function batchSelectAll(){
cols.books.forEach(function(b){batchSelected.add('book_'+b.id);});
cols.shorts.forEach(function(s){batchSelected.add('short_'+s.id);});
updateBatchCount();
document.querySelectorAll('[data-batch-id]').forEach(function(el){
el.style.borderColor='var(--accent)';
el.style.background='rgba(108,92,231,.08)';
});
cols.books.forEach(function(b){
var chk=document.getElementById('bchk_'+b.id);
if(chk){chk.style.borderColor='var(--accent)';chk.style.background='var(--accent)';chk.textContent='✓';}
});
}

function batchDeselectAll(){
batchSelected.clear();
updateBatchCount();
document.querySelectorAll('[data-batch-id]').forEach(function(el){
el.style.borderColor='var(--border)';
el.style.background='';
});
cols.books.forEach(function(b){
var chk=document.getElementById('bchk_'+b.id);
if(chk){chk.style.borderColor='rgba(255,255,255,.5)';chk.style.background='rgba(0,0,0,.3)';chk.textContent='';}
});
}

function batchDelete(){
if(batchSelected.size===0){showToast('请先选择要删除的项目');return;}
showDlg('批量删除','确定要删除选中的 '+batchSelected.size+' 个项目吗？\n\n此操作不可恢复！',function(){
var delBooks=0;
var delShorts=0;
batchSelected.forEach(function(key){
var parts=key.split('_');
var type=parts[0];
var id=parts.slice(1).join('_');
if(type==='book'){
cols.books=cols.books.filter(function(b){return b.id!==id;});
delBooks++;
}else if(type==='short'){
cols.shorts=cols.shorts.filter(function(s){return s.id!==id;});
delShorts++;
}
});
sv(K.cols,cols);
batchSelected.clear();
updateBatchCount();
renderCollections();
showToast('已删除 '+(delBooks+delShorts)+' 个项目'+(delBooks?' ('+delBooks+'本长篇)':'')+(delShorts?' ('+delShorts+'篇短篇)':''));
},true);
}
function batchExportMenu(){
  if(batchSelected.size===0){showToast('请先选择要导出的项目');return;}
  var html=
    '<div style="display:flex;flex-direction:column;gap:10px">'+
    '<button onclick="window._doBatchExport(\'txt\')" style="padding:12px 16px;border-radius:12px;border:1px solid var(--border);background:var(--card);color:var(--text);font-size:13px;cursor:pointer;text-align:left">'+
    '<b><i class="fas fa-file-alt"></i> 导出为 TXT</b>'+
    '<div style="font-size:10px;color:var(--text2);margin-top:3px">合并所有选中作品到一个纯文本文件</div></button>'+
    '<button onclick="window._doBatchExport(\'res\')" style="padding:12px 16px;border-radius:12px;border:1px solid var(--border);background:var(--card);color:var(--text);font-size:13px;cursor:pointer;text-align:left">'+
    '<b><i class="fas fa-box-open"></i> 导出为资源包</b>'+
    '<div style="font-size:10px;color:var(--text2);margin-top:3px">打包为 .json 资源包，可分享或导入其他设备</div></button>'+
    '</div>';
  showDlg('选择导出方式',html,function(){},false,true);
  setTimeout(function(){
    var ok=document.getElementById('dlgOkBtn');
    if(ok)ok.style.display='none';
    var p=document.getElementById('dlgMsg');
    if(p){p.style.maxHeight='50vh';p.style.overflowY='auto';}
  },50);
  window._doBatchExport=function(type){
    closeDlg();
    setTimeout(function(){
      if(type==='txt')batchExportTxt();
      else if(type==='res')batchExportAsResPack();
    },80);
  };
}
function batchExportAsResPack(){
  if(batchSelected.size===0){showToast('请先选择要导出的项目');return;}
  _showResPackInfoForm(
    {name:'收藏批量导出',author:userCard.name||'星叙用户'},
    function(packName,packAuthor,packDesc){
      var items=[];
      var exportCount=0;
      batchSelected.forEach(function(key){
        var parts=key.split('_');
        var type=parts[0];
        var id=parts.slice(1).join('_');
        if(type==='book'){
          var book=cols.books.find(function(b){return b.id===id;});
          if(book){
            items.push({type:'work',name:'小说：'+(book.title||'未命名'),data:JSON.parse(JSON.stringify(book))});
            exportCount++;
          }
        }else if(type==='short'){
          var s=cols.shorts.find(function(x){return x.id===id;});
          if(s){
            items.push({type:'work',name:'短篇：'+(s.title||'未命名'),data:JSON.parse(JSON.stringify(s))});
            exportCount++;
          }
        }
      });
      if(items.length===0){showToast('没有内容可导出');return;}
      var pack={
        _app:'syn_resource',_ver:APP_VER,
        id:uid(),name:packName,
        desc:packDesc||('共'+exportCount+'篇作品'),
        author:packAuthor,
        createdAt:new Date().toISOString(),
        items:items
      };
      var jsonStr=JSON.stringify(pack,null,2);
      var fileName='星叙_'+packName+'_'+new Date().toLocaleDateString().replace(/\//g,'-')+'.json';
      _exportFileWithFallback(fileName,jsonStr,'application/json;charset=utf-8');
    }
  );
}
function batchExportTxt(){
if(batchSelected.size===0){showToast('请先选择要导出的项目');return;}
var allContent='';
var exportCount=0;
batchSelected.forEach(function(key){
var parts=key.split('_');
var type=parts[0];
var id=parts.slice(1).join('_');
if(type==='book'){
var book=cols.books.find(function(b){return b.id===id;});
if(book){
allContent+='════════════════════\n「'+(book.title||'未命名')+'」\n════════════════════\n\n';
if(book.chapters){
book.chapters.forEach(function(ch,i){
allContent+='【第'+(i+1)+'章】\n\n'+(ch||'')+'\n\n\n';
});
}
allContent+='\n\n';
exportCount++;
}
}else if(type==='short'){
var s=cols.shorts.find(function(x){return x.id===id;});
if(s){
allContent+='════════════════════\n「'+(s.title||'未命名')+'」\n════════════════════\n\n';
allContent+=(s.content||'')+'\n\n\n';
exportCount++;
}
}
});
if(!allContent){showToast('没有内容可导出');return;}
var header='星叙 批量导出\n导出时间：'+new Date().toLocaleString()+'\n共 '+exportCount+' 篇作品\n\n\n';
var fileName='星叙_批量导出_'+exportCount+'篇_'+new Date().toLocaleDateString().replace(/\//g,'-')+'.txt';
exportToTxtFile(fileName,header+allContent);
}
// ==================== 导入TXT文件 ====================
let importTxtRawText='';
let importTxtMode='auto';
let importTxtRule='blank';
// 非空时表示这次"导入TXT"弹窗不是走创作工具箱的常规流程，而是收藏页文件夹导入触发的——
// 结果要存进cols.books而不是crWorks，弹窗关闭（无论是确认导入、取消、点击背景还是硬件返回键，
// 全部会经过closeImportTxt）时必须清空，否则会污染下一次从创作工具箱正常发起的单篇导入。
let _importTxtTarget=null;

function setImportMode(mode,el){
importTxtMode=mode;
el.parentElement.querySelectorAll('.tag').forEach(function(t){t.classList.remove('act');});
el.classList.add('act');
document.getElementById('importAutoSettings').style.display=(mode==='auto')?'':'none';
document.getElementById('importManualSettings').style.display=(mode==='manual')?'':'none';
if(mode==='manual'){
document.getElementById('importManualText').value=importTxtRawText;
document.getElementById('importPreview').style.display='none';
}else{
updateImportPreview();
}
}

function setImportRule(rule,el){
importTxtRule=rule;
el.parentElement.querySelectorAll('.tag').forEach(function(t){t.classList.remove('act');});
el.classList.add('act');
document.getElementById('importCustomSep').style.display=(rule==='custom')?'':'none';
updateImportPreview();
}

function splitTxtToChapters(text,rule,customSep){
if(!text||!text.trim())return[''];
text=text.replace(/\r\n/g,'\n').replace(/\r/g,'\n');
var chapters=[];
if(rule==='blank'){
var blocks=text.split(/\n{3,}/);
if(blocks.length<=1){
blocks=text.split(/\n{2,}/);
}
var currentCh='';
var minChLen=200;
for(var i=0;i<blocks.length;i++){
var block=blocks[i].trim();
if(!block)continue;
currentCh+=(currentCh?'\n\n':'')+block;
if(currentCh.length>=minChLen&&i<blocks.length-1){
chapters.push(currentCh);
currentCh='';
}
}
if(currentCh.trim())chapters.push(currentCh);
}else if(rule==='chapter'){
var regex=/(?:^|\n)(第[一二三四五六七八九十百千\d]+章[^\n]*)/g;
var matches=[];
var m;
while((m=regex.exec(text))!==null){
matches.push({index:m.index,title:m[1]});
}
if(matches.length===0){
chapters=[text.trim()];
}else{
if(matches[0].index>50){
chapters.push(text.substring(0,matches[0].index).trim());
}
for(var j=0;j<matches.length;j++){
var start=matches[j].index;
var end=j+1<matches.length?matches[j+1].index:text.length;
var chText=text.substring(start,end).trim();
if(chText)chapters.push(chText);
}
}
}else if(rule==='custom'){
var sep=(customSep!=null?customSep:(document.getElementById('importSepInput').value||'')).trim();
if(!sep){chapters=[text.trim()];}
else{
var parts=text.split(sep);
parts.forEach(function(p){
p=p.trim();
if(p)chapters.push(p);
});
}
}
if(chapters.length===0)chapters=[text.trim()];
return chapters;
}

function updateImportPreview(){
if(importTxtMode!=='auto'){document.getElementById('importPreview').style.display='none';return;}
var chapters=splitTxtToChapters(importTxtRawText,importTxtRule);
var previewEl=document.getElementById('importPreviewList');
document.getElementById('importPreview').style.display='';
var html='<div style="font-size:11px;color:var(--text2);margin-bottom:8px">共识别 <strong style="color:var(--accent2)">'+chapters.length+'</strong> 章</div>';
chapters.forEach(function(ch,i){
var wc=countWords(ch);
var preview=ch.replace(/\n/g,' ').substring(0,50);
html+='<div style="padding:6px 8px;background:var(--card);border-radius:6px;border:1px solid var(--border);margin-bottom:4px;display:flex;justify-content:space-between;align-items:center">';
html+='<span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">第'+(i+1)+'章：'+esc(preview)+'...</span>';
html+='<span style="flex-shrink:0;font-size:10px;color:var(--text2);margin-left:8px">'+wc+'字</span>';
html+='</div>';
});
previewEl.innerHTML=html;
}

function doImportTxt(){
var title=(document.getElementById('importTxtTitle').value||'').trim()||'导入的文本';
var chapters=[];
if(importTxtMode==='single'){
chapters=[importTxtRawText.trim()];
}else if(importTxtMode==='manual'){
var manualText=(document.getElementById('importManualText').value||'').trim();
if(!manualText){showToast('请粘贴文本内容');return;}
chapters=manualText.split('===').map(function(p){return p.trim();}).filter(function(p){return p;});
}else{
chapters=splitTxtToChapters(importTxtRawText,importTxtRule);
}
if(chapters.length===0){showToast('没有识别到内容');return;}

// 收藏页文件夹导入触发的场景：结果存进cols.books（长篇），不走下面crWorks那一套、也不打开编辑器
if(_importTxtTarget&&_importTxtTarget.mode==='col'){
var tgt=_importTxtTarget;
_importTxtTarget=null;
var book={
id:uid(),type:'long',title:title,chapters:chapters,
cover:null,status:'ongoing',rating:0,folderId:tgt.folderId,
createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()
};
cols.books.push(book);
sv(K.cols,cols);
closeImportTxt();
var totalWc2=0;
chapters.forEach(function(ch){totalWc2+=countWords(ch);});
showToast('已导入到「'+tgt.folderName+'」：'+chapters.length+'章 · '+totalWc2+'字',3000);
renderColFolderDrawerList();
if(document.getElementById('colFolderDetailOv').classList.contains('show'))renderColFolderDetailList();
renderCollections();
return;
}

var isNovel=chapters.length>1;
var work={
id:uid(),
type:isNovel?'novel':'draft',
title:title,
createdAt:new Date().toISOString(),
updatedAt:new Date().toISOString()
};
if(isNovel){
work.chapters=chapters;
}else{
work.content=chapters[0];
}
crWorks.unshift(work);
sv('bj_crWorks',crWorks);
closeImportTxt();
var totalWc=0;
chapters.forEach(function(ch){totalWc+=countWords(ch);});
showToast('导入成功！'+(isNovel?chapters.length+'章 · ':'')+ totalWc+'字',3000);
renderCrList();
if(document.getElementById('edModal').classList.contains('show'))closeEditor();
openEditor(work.id);
}

function closeImportTxt(){
  navPop('importTxtOv');
document.getElementById('importTxtOv').classList.remove('show');
_importTxtTarget=null;// 无论以哪种方式关闭弹窗，都清空目标标记，避免污染下一次创作工具箱的常规单篇导入
}
// ==================== 快速设置向导 ====================
let wizStep=0;
let wizData={genre:'',worldTemplate:'',hasChars:false,charName1:'',charName2:'',charTraits1:'',charTraits2:'',styleName:''};

function openWizard(){
wizStep=0;
wizData={genre:'',worldTemplate:'',hasChars:false,charName1:'',charName2:'',charTraits1:'',charTraits2:'',styleName:''};
renderWizardStep();
document.getElementById('wizardOv').classList.add('show');
navPush('wizardOv');
}

function closeWizard(){
document.getElementById('wizardOv').classList.remove('show');
}

function renderWizardStep(){
const body=document.getElementById('wizardBody');
const prevBtn=document.getElementById('wizPrevBtn');
const nextBtn=document.getElementById('wizNextBtn');
prevBtn.style.display=wizStep>0?'':'none';

for(let i=0;i<4;i++){
const dot=document.getElementById('wizDot'+i);
if(dot)dot.style.background=i<=wizStep?'var(--accent)':'var(--border)';
}

if(wizStep===0){
document.getElementById('wizardTitle').textContent='第1步：你想写什么？';
document.getElementById('wizardSubtitle').textContent='选一个最接近的类型，我们帮你配好基础设定';
nextBtn.textContent='下一步 →';
const genres=[
{id:'modern_sweet',icon:'<i class="fas fa-heart" style="color:#ff6b6b"></i>',name:'现代甜宠',desc:'都市背景、甜蜜恋爱'},
{id:'modern_suspense',icon:'<i class="fas fa-magnifying-glass"></i>',name:'现代悬疑',desc:'都市背景、烧脑推理'},
{id:'ancient_romance',icon:'<i class="fas fa-landmark"></i>',name:'古风言情',desc:'古代宫廷、唯美爱情'},
{id:'xianxia',icon:'<i class="fas fa-yin-yang"></i>',name:'仙侠修真',desc:'修仙世界、热血冒险'},
{id:'fantasy',icon:'<i class="fas fa-dragon"></i>',name:'西方奇幻',desc:'魔法大陆、史诗冒险'},
{id:'campus',icon:'<i class="fas fa-graduation-cap"></i>',name:'校园青春',desc:'学生时代、青涩恋爱'},
{id:'apocalypse',icon:'<i class="fas fa-radiation" style="color:#f0a030"></i>',name:'末日废土',desc:'末日求生、人性考验'},
{id:'custom',icon:'<i class="fas fa-pen"></i>',name:'自定义',desc:'我有自己的想法'}
];
body.innerHTML='<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">'+genres.map(g=>
'<div onclick="wizSelectGenre(\''+g.id+'\')" id="wizGenre_'+g.id+'" style="padding:14px 12px;border-radius:12px;border:1px solid '+(wizData.genre===g.id?'var(--accent)':'var(--border)')+';background:'+(wizData.genre===g.id?'rgba(108,92,231,.1)':'var(--card)')+';cursor:pointer;transition:all .2s;text-align:center">'+
'<div style="font-size:24px;margin-bottom:6px">'+g.icon+'</div>'+
'<div style="font-size:13px;font-weight:600">'+g.name+'</div>'+
'<div style="font-size:10px;color:var(--text2);margin-top:2px">'+g.desc+'</div>'+
'</div>'
).join('')+'</div>';
}
else if(wizStep===1){
document.getElementById('wizardTitle').textContent='第2步：世界观和文风';
document.getElementById('wizardSubtitle').textContent='已根据你的选择推荐了模板，也可以自己改';
nextBtn.textContent='下一步 →';
const worldMap={
'modern_sweet':'现代都市','modern_suspense':'现代都市','ancient_romance':'古代宫廷',
'xianxia':'仙侠修真','fantasy':'西方奇幻','campus':'校园青春','apocalypse':'末日废土','custom':''
};
const styleMap={
'modern_sweet':'甜宠言情','modern_suspense':'悬疑紧张','ancient_romance':'古风典雅',
'xianxia':'硬核写实','fantasy':'硬核写实','campus':'轻松日常','apocalypse':'硬核写实','custom':''
};
const recWorld=worldMap[wizData.genre]||'';
const recStyle=styleMap[wizData.genre]||'';
if(!wizData.worldTemplate)wizData.worldTemplate=recWorld;
if(!wizData.styleName)wizData.styleName=recStyle;
const worldOpts=['现代都市','古代宫廷','仙侠修真','西方奇幻','末日废土','校园青春','不设置'];
const styleOpts=['轻松日常','甜宠言情','悬疑紧张','古风典雅','硬核写实','沉郁文学','幽默讽刺','不设置'];
body.innerHTML=
'<div class="fg"><label class="fl"><i class="fas fa-earth-asia"></i> 世界观模板'+(recWorld?' （推荐：'+recWorld+'）':'')+'</label>'+
'<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:6px">'+worldOpts.map(w=>
'<span class="tag'+(wizData.worldTemplate===w||(!wizData.worldTemplate&&w==='不设置')?' act':'')+'" onclick="wizSelectWorld(\''+w+'\',this)" style="padding:6px 12px">'+w+'</span>'
).join('')+'</div></div>'+
'<div class="fg" style="margin-top:14px"><label class="fl"><i class="fas fa-feather-alt"></i> 文风模板'+(recStyle?' （推荐：'+recStyle+'）':'')+'</label>'+
'<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:6px">'+styleOpts.map(s=>
'<span class="tag'+(wizData.styleName===s||(!wizData.styleName&&s==='不设置')?' act':'')+'" onclick="wizSelectStyle(\''+s+'\',this)" style="padding:6px 12px">'+s+'</span>'
).join('')+'</div></div>';
}
else if(wizStep===2){
document.getElementById('wizardTitle').textContent='第3步：要设角色吗？';
document.getElementById('wizardSubtitle').textContent='先设两个主角就够了，以后随时可以加';
nextBtn.textContent='下一步 →';
body.innerHTML=
'<div style="display:flex;gap:10px;margin-bottom:16px">'+
'<div onclick="wizToggleChars(true)" style="flex:1;padding:16px;border-radius:12px;border:2px solid '+(wizData.hasChars?'var(--accent)':'var(--border)')+';background:'+(wizData.hasChars?'rgba(108,92,231,.1)':'var(--card)')+';cursor:pointer;text-align:center;transition:all .2s">'+
'<div style="font-size:24px;margin-bottom:6px"><i class="fas fa-user-friends"></i></div>'+
'<div style="font-size:13px;font-weight:600">设两个主角</div>'+
'<div style="font-size:10px;color:var(--text2);margin-top:2px">AI写作更贴合</div>'+
'</div>'+
'<div onclick="wizToggleChars(false)" style="flex:1;padding:16px;border-radius:12px;border:2px solid '+(!wizData.hasChars?'var(--accent)':'var(--border)')+';background:'+(!wizData.hasChars?'rgba(108,92,231,.1)':'var(--card)')+';cursor:pointer;text-align:center;transition:all .2s">'+
'<div style="font-size:24px;margin-bottom:6px"><i class="fas fa-dice"></i></div>'+
'<div style="font-size:13px;font-weight:600">先不设</div>'+
'<div style="font-size:10px;color:var(--text2);margin-top:2px">之后再加也行</div>'+
'</div>'+
'</div>'+
'<div id="wizCharForm" style="display:'+(wizData.hasChars?'block':'none')+'">'+
'<div style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:14px;margin-bottom:10px">'+
'<div style="font-size:12px;font-weight:600;color:var(--accent2);margin-bottom:8px">角色1</div>'+
'<input class="fi" id="wizChar1Name" placeholder="名字（如：林晚）" value="'+esc(wizData.charName1)+'" style="margin-bottom:8px">'+
'<input class="fi" id="wizChar1Traits" placeholder="性格关键词（如：温柔、倔强、外冷内热）" value="'+esc(wizData.charTraits1)+'">'+
'</div>'+
'<div style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:14px">'+
'<div style="font-size:12px;font-weight:600;color:var(--accent2);margin-bottom:8px">角色2</div>'+
'<input class="fi" id="wizChar2Name" placeholder="名字（如：顾深）" value="'+esc(wizData.charName2)+'" style="margin-bottom:8px">'+
'<input class="fi" id="wizChar2Traits" placeholder="性格关键词（如：高冷、腹黑、专一）" value="'+esc(wizData.charTraits2)+'">'+
'</div>'+
'</div>';
}
else if(wizStep===3){
document.getElementById('wizardTitle').textContent='设置完成！';
document.getElementById('wizardSubtitle').textContent='以下是你的配置预览，点击完成即可应用';
nextBtn.textContent='完成并应用';
let summary='';
const genreNames={'modern_sweet':'现代甜宠','modern_suspense':'现代悬疑','ancient_romance':'古风言情','xianxia':'仙侠修真','fantasy':'西方奇幻','campus':'校园青春','apocalypse':'末日废土','custom':'自定义'};
summary+='<div style="background:var(--card);border-radius:12px;padding:14px;margin-bottom:10px">';
summary+='<div style="font-size:12px;font-weight:600;margin-bottom:10px"><i class="fas fa-copy"></i> 配置预览</div>';
summary+='<div style="font-size:12px;line-height:2;color:var(--text)">';
summary+='<i class="fas fa-file-alt"></i> 类型：<span style="color:var(--accent2);font-weight:600">'+(genreNames[wizData.genre]||'未选择')+'</span><br>';
summary+='<i class="fas fa-earth-asia"></i> 世界观：<span style="color:var(--accent2);font-weight:600">'+(wizData.worldTemplate&&wizData.worldTemplate!=='不设置'?wizData.worldTemplate:'不设置')+'</span><br>';
summary+='<i class="fas fa-feather-alt"></i> 文风：<span style="color:var(--accent2);font-weight:600">'+(wizData.styleName&&wizData.styleName!=='不设置'?wizData.styleName:'不设置')+'</span><br>';
if(wizData.hasChars){
summary+='<i class="fas fa-user"></i> 角色1：<span style="color:var(--accent2);font-weight:600">'+(wizData.charName1||'未填写')+'</span>'+(wizData.charTraits1?' （'+wizData.charTraits1+'）':'')+'<br>';
summary+='<i class="fas fa-user"></i> 角色2：<span style="color:var(--accent2);font-weight:600">'+(wizData.charName2||'未填写')+'</span>'+(wizData.charTraits2?' （'+wizData.charTraits2+'）':'')+'<br>';
}else{
summary+='<i class="fas fa-user"></i> 角色：<span style="color:var(--text2)">暂不设置</span><br>';
}
summary+='</div></div>';
summary+='<div style="font-size:11px;color:var(--text2);line-height:1.7;padding:0 4px">点击「完成并应用」后，所有设定会自动填入对应位置。你随时可以在设置中心修改。</div>';
body.innerHTML=summary;
}
}

function wizSelectGenre(id){
wizData.genre=id;
wizData.worldTemplate='';
wizData.styleName='';
renderWizardStep();
}

function wizSelectWorld(name,el){
wizData.worldTemplate=(name==='不设置')?'':name;
el.parentElement.querySelectorAll('.tag').forEach(t=>t.classList.remove('act'));
el.classList.add('act');
}

function wizSelectStyle(name,el){
wizData.styleName=(name==='不设置')?'':name;
el.parentElement.querySelectorAll('.tag').forEach(t=>t.classList.remove('act'));
el.classList.add('act');
}

function wizToggleChars(val){
wizData.hasChars=val;
renderWizardStep();
}

function wizardSaveCharInputs(){
if(wizData.hasChars){
var el1=document.getElementById('wizChar1Name');
var el2=document.getElementById('wizChar1Traits');
var el3=document.getElementById('wizChar2Name');
var el4=document.getElementById('wizChar2Traits');
if(el1)wizData.charName1=el1.value.trim();
if(el2)wizData.charTraits1=el2.value.trim();
if(el3)wizData.charName2=el3.value.trim();
if(el4)wizData.charTraits2=el4.value.trim();
}
}

function wizardPrev(){
if(wizStep===2)wizardSaveCharInputs();
if(wizStep>0){wizStep--;renderWizardStep();}
}

function wizardNext(){
if(wizStep===0){
if(!wizData.genre){showToast('请选择一个类型');return;}
}
if(wizStep===2){
wizardSaveCharInputs();
}
if(wizStep<3){
wizStep++;
renderWizardStep();
return;
}
applyWizard();
}

function applyWizard(){
if(wizData.worldTemplate){
applyGlobalWorldTemplate(wizData.worldTemplate);
}
if(wizData.styleName){
applyStyleTemplate(wizData.styleName);
}
if(wizData.hasChars){
var newChars=[];
if(wizData.charName1||wizData.charTraits1){
var traits1=wizData.charTraits1?wizData.charTraits1.split(/[,，、\s]+/).filter(function(t){return t;}):[];
newChars.push({name:wizData.charName1||'',desc:'',traits:traits1,priority:'核心'});
}
if(wizData.charName2||wizData.charTraits2){
var traits2=wizData.charTraits2?wizData.charTraits2.split(/[,，、\s]+/).filter(function(t){return t;}):[];
newChars.push({name:wizData.charName2||'',desc:'',traits:traits2,priority:'核心'});
}
if(newChars.length>0){
characters=newChars;
sv(K.curChars,characters);
}
}
closeWizard();
showToast('设置完成！现在可以去作坊开始创作啦',3000);
}
function openOutlineGen(){
document.getElementById('outlineTitle').value='';
document.getElementById('outlineDesc').value='';
document.getElementById('outlineResult').style.display='none';
document.getElementById('outlineActions').style.display='none';
document.getElementById('outlineGenBtn').style.display='';
document.getElementById('outlineGenBtn').disabled=false;
document.getElementById('outlineGenBtn').innerHTML='<i class="fas fa-brain"></i> 生成大纲';
document.getElementById('outlineChInput').value=outlineChCount;
outlineText='';
document.getElementById('outlineOv').classList.add('show');
navPush('outlineOv');
setTimeout(()=>document.getElementById('outlineDesc').focus(),200);
}
function closeOutlineGen(){
  navPop('outlineOv');
document.getElementById('outlineOv').classList.remove('show');
if(abortCtrl){abortCtrl.abort();abortCtrl=null;}
}
function setOutlineCh(n,el){
outlineChCount=n;
const inp=document.getElementById('outlineChInput');
if(inp)inp.value=n;
}
async function doGenOutline(){
const cfg=getCurApi();
if(!cfg.url||!cfg.key){showToast('请先在设置中配置API');return;}
const desc=(document.getElementById('outlineDesc').value||'').trim();
const title=(document.getElementById('outlineTitle').value||'').trim();
if(!desc){showToast('请描述一下你想写的故事');return;}
const btn=document.getElementById('outlineGenBtn');
btn.style.display='';
btn.disabled=true;
btn.innerHTML='生成中 <span class="ldots"><span></span><span></span><span></span></span>';
document.getElementById('outlineResult').style.display='block';
document.getElementById('outlineActions').style.display='none';
document.getElementById('outlineContent').textContent='正在构思大纲...';
let sysMsg='你是一位资深的故事架构师，精通各类小说的结构设计。\n\n';
sysMsg+='【你的任务】\n';
sysMsg+='根据用户描述，设计一份专业的小说大纲。\n\n';
sysMsg+='【输出格式】严格按以下格式：\n';
sysMsg+='第一行：小说标题\n';
sysMsg+='第二行：空行\n';
sysMsg+='第三行：一句话核心卖点（让人想看的理由）\n';
sysMsg+='第四行：空行\n';
sysMsg+='然后逐章列出：\n';
sysMsg+='第X章：章节标题\n';
sysMsg+='- 核心事件：本章必须发生的关键情节\n';
sysMsg+='- 情感曲线：角色情绪从A到B的变化\n';
sysMsg+='- 钩子设计：本章结尾留下的悬念\n\n';
sysMsg+='【结构要求】共'+outlineChCount+'章\n';
sysMsg+='- 第1章：抓人开场，建立期待\n';
sysMsg+='- 前1/4：铺垫人物关系和世界观\n';
sysMsg+='- 中段：层层递进的冲突和转折\n';
sysMsg+='- 3/4处：最大危机或情感爆发点\n';
sysMsg+='- 结局：情感收束，余韵悠长\n\n';
sysMsg+='【专业技巧】\n';
sysMsg+='- 每3-4章设置一个小高潮\n';
sysMsg+='- 伏笔要在埋设后3-5章内回收\n';
sysMsg+='- 主角要有清晰的成长弧线\n';
sysMsg+='- 避免"为虐而虐"，冲突要有意义\n';
sysMsg+='\n【输出约束】\n';
sysMsg+='- 所有分析、思考过程只在你心里完成，不要写在输出里\n';
sysMsg+='- 只按要求输出大纲内容，不要写“分析如下”“思维链”等说明\n';
if(document.getElementById('outlineUseChars').checked){
const validChars=characters.filter(c=>c.name||c.desc);
if(validChars.length>0){
sysMsg+='\n【可用角色】\n';
validChars.forEach((c,i)=>{
sysMsg+='角色'+(i+1)+'：'+(c.name||'未命名');
if(c.traits&&c.traits.length>0)sysMsg+='（'+c.traits.join('·')+'）';
if(c.desc)sysMsg+='（'+c.desc.substring(0,100)+'）';
sysMsg+='\n';
});
}
if(npcList.length>0){
sysMsg+='\n【配角/NPC】\n';
npcList.forEach(n=>{
if(n.name)sysMsg+=n.name+'['+( n.role||'NPC')+']'+(n.desc?'：'+n.desc.substring(0,60):'')+'\n';
});
}
if(charRelations.length>0){
sysMsg+='\n【人物关系】\n';
charRelations.forEach(r=>{
const dir=r.direction==='A→B'?'→':r.direction==='B→A'?'←':'↔';
sysMsg+=r.charA+' '+dir+' '+r.charB+'：'+r.type+(r.desc?'（'+r.desc.substring(0,40)+'）':'')+'\n';
});
}
}
if(document.getElementById('outlineUseWorld').checked){
const globalWD=(document.getElementById('globalWorldDesc')&&document.getElementById('globalWorldDesc').value||globalWorld||'').trim();
const localWD=(document.getElementById('worldDesc')&&document.getElementById('worldDesc').value||'').trim();
const wD=[globalWD,localWD].filter(Boolean).join('\n');
if(wD)sysMsg+='\n【世界观】\n'+wD.substring(0,500)+'\n';
}
if(document.getElementById('outlineUseStyle')&&document.getElementById('outlineUseStyle').checked){
const styleD=(document.getElementById('styleDesc')&&document.getElementById('styleDesc').value||'').trim();
if(styleD)sysMsg+='\n【文风设置】\n'+styleD.substring(0,300)+'\n';
}
if(document.getElementById('outlineUseRules')&&document.getElementById('outlineUseRules').checked){
const gRuleD=(document.getElementById('globalRuleDesc')&&document.getElementById('globalRuleDesc').value||globalRule||'').trim();
const lRuleD=(document.getElementById('ruleDesc')&&document.getElementById('ruleDesc').value||'').trim();
const rD=[gRuleD,lRuleD].filter(Boolean).join('\n');
if(rD)sysMsg+='\n【规则约束（必须遵守）】\n'+rD.substring(0,400)+'\n';
}
let userMsg='请为以下故事生成'+outlineChCount+'章的详细大纲：\n\n';
if(title)userMsg+='标题方向：'+title+'\n';
userMsg+='故事描述：'+desc;
const messages=[{role:'system',content:sysMsg},{role:'user',content:userMsg}];
const contentEl=document.getElementById('outlineContent');
outlineText='';
try{
var result=await callToolAPINonStream(messages);
if(result){
outlineText=result;
contentEl.value=result;
btn.style.display='none';
document.getElementById('outlineActions').style.display='block';
}else{
contentEl.value='生成失败，请检查API设置';
}
}catch(e){
console.error('[doGenOutline]',e);
contentEl.value='生成出错：'+e.message;
showToast('大纲生成失败',4000);
}finally{
btn.disabled=false;
btn.innerHTML='<i class="fas fa-brain"></i> 生成大纲';
}
}
// ==================== 精华压缩器执行 ====================
async function doCompress(){
  if(!requireNetwork()) return;
  var cfg = getCurApi();
  if(!cfg.url || !cfg.key){
    showToast('请先配置API');
    return;
  }

  if(cmpIsRunning){
    showToast('压缩已经在进行中，如需停止请点"停止压缩"');
    return;
  }

  var btn = document.getElementById('cmpDoBtn');
  var stopBtn = document.getElementById('cmpStopBtn');

  var raw = _gatherCmpRaw();
  var levelEl = document.getElementById('cmpLevel');
  var level = levelEl ? levelEl.value : 'mid';

  var outSel = document.getElementById('cmpOutputMode');
  var outMode = outSel ? outSel.value : 'json';

  // 获取用户的压缩需求
  var requirementEl = document.getElementById('cmpRequirement');
  var requirement = (requirementEl ? requirementEl.value : '').trim();

  var parts = {};
  Object.keys(cmpParts).forEach(function(k){
    if(cmpParts[k]) parts[k] = raw[k] || '';
  });

  var anySelected = false;
  Object.keys(parts).forEach(function(k){
    if((parts[k] || '').trim().length > 0) anySelected = true;
  });
  if(!anySelected){
    showToast('没有可压缩内容（或者你没有勾选任何模块）');
    return;
  }

  // 压缩强度描述
  var levelRuleMap = {
    'lite': '轻度压缩：保留尽可能多的细节和原文表达，只删除明显重复和冗余。压缩率目标：原文的60%-80%。',
    'mid':  '中度压缩：提取核心要点，用高密度短句改写，删除次要细节。压缩率目标：原文的30%-50%。',
    'hard': '重度压缩：极简提要模式，每个角色/设定只保留1-2句最关键的信息。压缩率目标：原文的15%-30%。'
  };
  var levelRuleText = levelRuleMap[level] || levelRuleMap['mid'];

  // 构建系统提示词
  var sysMsg = '';
  sysMsg += '你是一台专业的"提示词精华压缩机"。\n\n';
  sysMsg += '【你的任务】\n';
  sysMsg += '把用户提供的小说创作设定（人物/关系/NPC/世界观/规则/文风/禁用词/额外设定）压缩成更短、更适合放进AI系统提示词的高密度版本。\n\n';

  sysMsg += '【压缩强度】\n' + levelRuleText + '\n\n';

  // 用户的压缩需求
  if(requirement){
    sysMsg += '【用户的压缩需求（最高优先级，必须严格遵守）】\n';
    sysMsg += requirement + '\n';
    sysMsg += '以上需求优先于默认压缩规则。如果用户说"只保留X"，则其他内容可以大幅精简或省略。\n\n';
  }

  sysMsg += '【压缩原则（按优先级排序）】\n';
  sysMsg += '1. 绝对不能丢失的：角色名字、核心性格特质、关键关系、世界观的核心规则\n';
  sysMsg += '2. 尽量保留的：说话方式差异、重要伏笔、禁忌/限制条件\n';
  sysMsg += '3. 可以省略的：重复表述、过度修饰、示例性描述、可从上下文推断的信息\n';
  sysMsg += '4. 同类合并：多个相似禁用词合并为一类描述\n';
  sysMsg += '5. 层级压缩：核心人物保留最多细节，参考人物只留名字+一句话\n\n';

  if(outMode === 'json'){
    sysMsg += '【输出格式——JSON模式（极其重要，违反即废稿）】\n';
    sysMsg += '你的整个回复必须是且仅是一个合法的JSON对象。\n';
    sysMsg += '禁止在JSON前后写任何文字、说明、分析。禁止使用```代码块。禁止使用单引号。\n';
    sysMsg += '所有键名和字符串值都用双引号。字符串值中的换行用\\n表示，不要用真实换行。\n';
    sysMsg += '你的回复的第一个字符必须是 { ，最后一个字符必须是 } 。\n\n';
    sysMsg += 'JSON的键名固定为：char, rel, npc, world, rule, style, ban, extra\n';
    sysMsg += '每个键的值是一个字符串（用换行符分隔多条内容）。\n';
    sysMsg += '如果用户没有提供某个板块的内容，对应键给空字符串""。\n\n';
    sysMsg += '各字段格式参考：\n';
    sysMsg += 'char: "姓名[核心]：一句话精华\\n姓名[普通]：一句话精华"\n';
    sysMsg += 'rel: "A ↔ B：关系类型（简述）"\n';
    sysMsg += 'npc: "姓名[定位]：一句话"\n';
    sysMsg += 'world: "要点1\\n要点2"\n';
    sysMsg += 'rule: "规则1\\n规则2"\n';
    sysMsg += 'style: "要点1\\n要点2"\n';
    sysMsg += 'ban: "类别1（具体词）\\n类别2（具体词）"\n';
    sysMsg += 'extra: "要点1\\n要点2"\n\n';
    sysMsg += '再次强调：只输出JSON，第一个字符是{，最后是}，中间没有任何非JSON内容。\n';
  } else {
    sysMsg += '【输出格式——纯文本模式】\n';
    sysMsg += '按以下模板输出，保留所有出现过的标题。\n';
    sysMsg += '如果某个板块用户没有提供内容，就不要输出它的标题。\n\n';
    sysMsg += '【人物精华】\n- 角色名[重要度]：一句话\n\n';
    sysMsg += '【关系精华】\n- A ↔ B：关系（简述）\n\n';
    sysMsg += '【NPC精华】\n- 姓名[定位]：一句话\n\n';
    sysMsg += '【世界观精华】\n- 要点\n\n';
    sysMsg += '【规则精华】\n- 要点\n\n';
    sysMsg += '【文风精华】\n- 要点\n\n';
    sysMsg += '【禁用词精华】\n- 类别（具体词）\n\n';
    sysMsg += '【额外设定精华】\n- 要点\n\n';
    sysMsg += '只输出纯文本，不要JSON，不要代码块，不要分析过程。\n';
  }

  sysMsg += '\n【铁律】\n';
  sysMsg += '- 不要输出任何思维过程、分析、"好的"、"让我"等开头\n';
  sysMsg += '- 不要使用```代码块\n';
  sysMsg += '- 直接输出结果，第一行就是内容\n';

  // 构建用户消息
  var userMsg = '需要压缩的内容如下：\n\n';
  var nameMap = {
    char:  '人物 char',
    rel:   '关系 rel',
    npc:   'NPC npc',
    world: '世界观 world',
    rule:  '规则 rule',
    style: '文风 style',
    ban:   '禁用词 ban',
    extra: '额外设定 extra'
  };
  Object.keys(parts).forEach(function(k){
    var title = nameMap[k] || k;
    var content = (parts[k] || '').trim();
    if(content){
      userMsg += '【' + title + '】\n' + content + '\n\n';
    }
  });

  if(requirement){
    userMsg += '\n请特别注意我的压缩需求：' + requirement + '\n';
  }

  // 状态标记 & 按钮
  cmpIsRunning = true;
  cmpAbortCtrl = new AbortController();
  btn.disabled = true;
  btn.innerHTML = '压缩中…';
  if(stopBtn) stopBtn.style.display = 'block';

  var result = '';

  try{
    var ep = buildChatEndpoint(cfg.url);
    if(!ep.endpoint){
      showToast('API地址为空');
      return;
    }

    var resp = await fetch(ep.endpoint,{
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        'Authorization':'Bearer '+cfg.key
      },
      body:JSON.stringify({
        model:cfg.model,
        messages:[
          {role:'system',content:sysMsg},
          {role:'user',content:userMsg}
        ],
        temperature: Math.min(cfg.temp, 0.5),
        max_tokens:cfg.maxTokens
      }),
      signal: cmpAbortCtrl.signal
    });

    if(!resp.ok){
      var errText = await resp.text();
      showToast('压缩失败：'+friendlyApiErr(resp.status),4000);
      return;
    }

    var data = await resp.json();
    if(!data.choices || !data.choices[0] || !data.choices[0].message){
      showToast('压缩失败：返回格式异常',4000);
      return;
    }
    var content = data.choices[0].message.content;
    content = stripMetaThinking(content);
    result = content;
  }catch(err){
    if(err.name === 'AbortError'){
      return;
    }
    showToast('压缩时遇到了网络问题，请稍后再试',4000);
    return;
  }finally{
    cmpIsRunning = false;
    cmpAbortCtrl = null;
    if(btn){btn.disabled = false; btn.textContent = '开始压缩';}
    if(stopBtn) stopBtn.style.display = 'none';
  }

  if(!result) return;

  // 纯文本模式
  if(outMode === 'text'){
    cmpLastResult = null;
    document.getElementById('cmpOut').value = result.trim();
    refreshCmpStats();
    showToast('压缩完成（纯文本模式）',3000);
    return;
  }

  // JSON模式：尝试解析
  var obj = null;
  try{
    obj = safeJsonParse(result);
  }catch(e){
    // 第一次解析失败，尝试更aggressive的清理
    try{
      var cleaned = result.replace(/^[\s\S]*?(\{)/,'$1').replace(/\}[\s\S]*$/,'}');
      cleaned = cleaned.replace(/[\u201c\u201d]/g,'"').replace(/[\u2018\u2019]/g,"'");
      cleaned = cleaned.replace(/,\s*([}\]])/g,'$1');
      obj = JSON.parse(cleaned);
    }catch(e2){
      obj = null;
    }
  }

  if(!obj || typeof obj !== 'object'){
    cmpLastResult = null;
    document.getElementById('cmpOut').value = result;
    refreshCmpStats();
    showToast('压缩完成，但AI未按JSON格式返回。结果已放入文本框，可手动复制使用。建议切换为"纯文本"输出模式再试一次。',6000);
    return;
  }

  var keys = ['char','rel','npc','world','rule','style','ban','extra'];
  keys.forEach(function(k){
    if(obj[k] === undefined || obj[k] === null){
      obj[k] = '';
    } else if(typeof obj[k] !== 'string'){
      if(Array.isArray(obj[k])){
        obj[k] = obj[k].join('\n');
      } else {
        obj[k] = String(obj[k]);
      }
    }
  });

  cmpLastResult = {
    char  : obj.char.trim(),
    rel   : obj.rel.trim(),
    npc   : obj.npc.trim(),
    world : obj.world.trim(),
    rule  : obj.rule.trim(),
    style : obj.style.trim(),
    ban   : obj.ban.trim(),
    extra : obj.extra.trim()
  };

  // 组装输出文本
  var outLines = [];
  if(parts.char !== undefined && cmpLastResult.char){
    outLines.push('【人物精华】\n'+cmpLastResult.char);
  }
  if(parts.rel !== undefined && cmpLastResult.rel){
    outLines.push('【关系精华】\n'+cmpLastResult.rel);
  }
  if(parts.npc !== undefined && cmpLastResult.npc){
    outLines.push('【NPC精华】\n'+cmpLastResult.npc);
  }
  if(parts.world !== undefined && cmpLastResult.world){
    outLines.push('【世界观精华】\n'+cmpLastResult.world);
  }
  if(parts.rule !== undefined && cmpLastResult.rule){
    outLines.push('【规则精华】\n'+cmpLastResult.rule);
  }
  if(parts.style !== undefined && cmpLastResult.style){
    outLines.push('【文风精华】\n'+cmpLastResult.style);
  }
  if(parts.ban !== undefined && cmpLastResult.ban){
    outLines.push('【禁用词精华】\n'+cmpLastResult.ban);
  }
  if(parts.extra !== undefined && cmpLastResult.extra){
    outLines.push('【额外设定精华（手动复制）】\n'+cmpLastResult.extra);
  }

  document.getElementById('cmpOut').value = outLines.join('\n\n');
  refreshCmpStats();
  showToast('压缩完成',3000);
}
function addCmpReq(text){
  var ta=document.getElementById('cmpRequirement');
  if(!ta)return;
  var cur=ta.value.trim();
  if(cur){
    ta.value=cur+'\n- '+text;
  }else{
    ta.value='- '+text;
  }
}
function setCmpLevel(val,btn){
  var hidden=document.getElementById('cmpLevel');
  if(hidden)hidden.value=val;
  var group=document.getElementById('cmpLevelGroup');
  if(!group)return;
  group.querySelectorAll('button').forEach(function(b){
    b.style.border='1px solid var(--border)';
    b.style.background='var(--bg)';
    b.style.color='var(--text2)';
    b.style.fontWeight='';
  });
  btn.style.border='1px solid var(--accent)';
  btn.style.background='rgba(108,92,231,.15)';
  btn.style.color='var(--accent2)';
  btn.style.fontWeight='600';
}
function setCmpOutputMode(val,btn){
  var hidden=document.getElementById('cmpOutputMode');
  if(hidden)hidden.value=val;
  var group=document.getElementById('cmpOutputGroup');
  if(!group)return;
  group.querySelectorAll('button').forEach(function(b){
    b.style.border='1px solid var(--border)';
    b.style.background='var(--bg)';
    b.style.color='var(--text2)';
    b.style.fontWeight='';
  });
  btn.style.border='1px solid var(--accent)';
  btn.style.background='rgba(108,92,231,.15)';
  btn.style.color='var(--accent2)';
  btn.style.fontWeight='600';
}
function stopCompress(){
  if(!cmpIsRunning){
    showToast('当前没有正在运行的压缩');
    return;
  }
  if(cmpAbortCtrl){
    try{ cmpAbortCtrl.abort(); }catch(e){logError('op',e)}
  }
  cmpIsRunning = false;
  cmpAbortCtrl = null;
  var btn = document.getElementById('cmpDoBtn');
  var stopBtn = document.getElementById('cmpStopBtn');
  if(btn){btn.disabled=false;btn.textContent='开始压缩';}
  if(stopBtn)stopBtn.style.display='none';
  showToast('已停止压缩');
}
// 临时存储待创建的小说，避免 onclick 字符串传参的转义问题
var _pendingOutlineWork = null;

function applyOutline(){
  const contentEl=document.getElementById('outlineContent');
  const text=((contentEl&&(contentEl.value||contentEl.textContent))||'').trim();
  if(!text){showToast('没有大纲内容');return;}
  let title='';
  const lines=text.split('\n');
  for(let i=0;i<Math.min(3,lines.length);i++){
    const l=lines[i].trim();
    if(l&&l.length<40&&!l.startsWith('-')){
      title=l.replace(/^[#*《「【\s:：标题]+/,'').replace(/[》」】\s]+$/,'').trim();
      break;
    }
  }
  const inputTitle=(document.getElementById('outlineTitle').value||'').trim();
  if(inputTitle)title=inputTitle;
  if(!title)title='未命名小说';

  var _pco=[];
  var _pocLines=text.split('\n');
  var _pocCur=[];
  var _pocIn=false;
  for(var _poli=0;_poli<_pocLines.length;_poli++){
    var _poLine=_pocLines[_poli].trim();
    if(/^第\d+章/.test(_poLine)){
      if(_pocIn&&_pocCur.length>0)_pco.push(_pocCur.join('\n').trim());
      _pocCur=[_poLine];_pocIn=true;
    }else if(_pocIn){_pocCur.push(_poLine);}
  }
  if(_pocIn&&_pocCur.length>0)_pco.push(_pocCur.join('\n').trim());
  const work={id:uid(),type:'novel',title:title,chapters:[''],outline:text,chOutlines:_pco.length>0?_pco:[],createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};
  _pendingOutlineWork=work;

  // 先入库一次（只此一次，避免重复）
  crWorks.unshift(work);
  sv('bj_crWorks',crWorks);
  try{renderCrList();}catch(e){}

  showDlg('确认并创建',
    '小说《'+title+'》已就绪\n\n是否同时用AI生成第一章？（将使用当前所有设定）\n\n· 点「生成第一章」自动写好后打开编辑器\n· 点「仅创建框架」直接进编辑器',
    function(){
      // OK按钮：生成第一章
      closeOutlineGen();
      _genOutlineFirstChapter(work,text);
    }, false, '生成第一章');

  setTimeout(function(){
    var dlgMsg=document.getElementById('dlgMsg');
    if(dlgMsg){
      dlgMsg.innerHTML+='<div style="margin-top:10px"><button onclick="closeDlg();_applyPendingOutlineOnly()" style="width:100%;padding:9px;border-radius:10px;border:1px solid var(--border);background:var(--card2);color:var(--text);font-size:12px;cursor:pointer"><i class="fas fa-file-alt"></i> 仅创建框架，手动创作</button></div>';
    }
  }, 30);
}

function _applyPendingOutlineOnly(){
  var w=_pendingOutlineWork;
  _pendingOutlineWork=null;
  if(!w){showToast('小说已创建，请在作品列表中找到它');closeOutlineGen();return;}
  closeOutlineGen();
  openEditor(w.id);
  showToast('《'+w.title+'》创建完成，大纲已保存');
}

function _applyOutlineOnly(workId,title){
  closeOutlineGen();
  openEditor(workId);
  showToast('《'+title+'》创建完成，大纲已保存');
}

async function _genOutlineFirstChapter(work,outlineText){
  showToast('正在生成第一章，请稍候...⏳',5000);
  var cfg=getCurApi();
  if(!cfg.url||!cfg.key){openEditor(work.id);showToast('API未配置，直接进入编辑器');return;}
  var sysPr=buildSysPrompt();
  var mW=parseInt(document.getElementById('minWords')&&document.getElementById('minWords').value)||1200;
  var userMsg='【创作任务】\n根据以下大纲创作《'+work.title+'》第1章\n\n【全文大纲】\n'+outlineText.substring(0,1500)+'\n\n【第1章要求】\n- 直接输出正文，不要标题和章节号\n- 字数不少于'+mW+'字\n- 抓人的开场，让读者在前三段就被吸引\n- 主角行动中登场，不要旁白介绍\n- 结尾在悬念或情感高点收尾';
  try{
    var result=await callAPINonStream([{role:'system',content:sysPr},{role:'user',content:userMsg}],2);
    if(result&&result.length>50){
      var idx=crWorks.findIndex(function(w){return w.id===work.id;});
      if(idx>-1){crWorks[idx].chapters=[result];sv('bj_crWorks',crWorks);}
      work.chapters=[result];
      openEditor(work.id);
      showToast('第一章已生成！共'+countWords(result)+'字');
    }else{
      openEditor(work.id);
      showToast('生成失败，已进入编辑器，可手动创作',4000);
    }
  }catch(e){
    console.error('[_genOutlineFirstChapter]',e);
    openEditor(work.id);
    showToast('生成出错，已进入编辑器',4000);
  }
}
function saveOutlineAsDraft(){
  const el=document.getElementById('outlineContent');
  if(!el)return;
  const text=((el.value||el.textContent)||'').trim();
  if(!text){
    showToast('没有大纲内容');
    return;
  }
  const baseTitle=(document.getElementById('outlineTitle').value||'AI大纲').trim()||'AI大纲';
  const work={
    id:uid(),
    type:'draft',
    title:baseTitle+'（大纲）',
    content:text,
    createdAt:new Date().toISOString(),
    updatedAt:new Date().toISOString()
  };
  crWorks.unshift(work);
  sv('bj_crWorks',crWorks);
  try{renderCrList();}catch(e){}
  showToast('大纲已保存到创作草稿');
}
function copyCmpResult(){
  const t=(document.getElementById('cmpOut').value||'').trim();
  if(!t){ showToast('没有结果可复制'); return; }
  doCopy(t);
}

function applyCmpResult(){
  if(!cmpLastResult){
    // 检查纯文本模式下是否有内容
    var textOut = (document.getElementById('cmpOut').value||'').trim();
    if(textOut){
      showDlg('纯文本模式提示','纯文本模式不支持一键写回预设。\n\n你可以：\n1. 点击「复制结果」手动粘贴到需要的地方\n2. 切换为「JSON结构」输出模式再压缩一次，就能一键写回了',function(){});
    }else{
      showToast('没有压缩结果');
    }
    return;
  }

  var now = new Date();
  var stamp =
    (now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0')+'-'+String(now.getDate()).padStart(2,'0'))+
    ' '+String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0');
  var baseName = '压缩精华 '+stamp;

  var savedCount = 0;

  // 世界观
  if(cmpParts.world && (cmpLastResult.world||'').trim()){
    worldP = ld(K.worldP, worldP || []);
    worldP.unshift({
      name: baseName+' · 世界观',
      desc: (cmpLastResult.world||'').trim(),
      minWords: parseInt(document.getElementById('minWords').value)||800
    });
    sv(K.worldP, worldP);
    savedCount++;
  }

  // 规则
  if(cmpParts.rule && (cmpLastResult.rule||'').trim()){
    ruleP = ld('bj_ruleP', ruleP || []);
    ruleP.unshift({
      name: baseName+' · 规则',
      desc: (cmpLastResult.rule||'').trim()
    });
    sv('bj_ruleP', ruleP);
    savedCount++;
  }

  // 文风
  if(cmpParts.style && (cmpLastResult.style||'').trim()){
    styleP = ld('bj_styleP', styleP || []);
    styleP.unshift({
      name: baseName+' · 文风',
      desc: (cmpLastResult.style||'').trim()
    });
    sv('bj_styleP', styleP);
    savedCount++;
  }

  // 禁用词
  if(cmpParts.ban && (cmpLastResult.ban||'').trim()){
    banWordsP = ld('bj_banWordsP', banWordsP || []);
    banWordsP.unshift({
      name: baseName+' · 禁用词',
      desc: (cmpLastResult.ban||'').trim()
    });
    sv('bj_banWordsP', banWordsP);
    savedCount++;
  }

  // 人物精华（保存为角色预设的附注）
  if((cmpParts.char || cmpParts.rel || cmpParts.npc) && 
     ((cmpLastResult.char||'').trim() || (cmpLastResult.rel||'').trim() || (cmpLastResult.npc||'').trim())){
    charP = ld(K.charP, charP || []);
    var snapshot = {
      name: baseName+' · 人物精华',
      characters: JSON.parse(JSON.stringify(characters||[])),
      relations: JSON.parse(JSON.stringify(charRelations||[])),
      npcs: JSON.parse(JSON.stringify(npcList||[]))
    };
    if(snapshot.characters && snapshot.characters[0]){
      var extra =
        '\n\n═══ 压缩精华 ═══\n'+
        (cmpLastResult.char ? '【人物】\n'+cmpLastResult.char+'\n\n' : '')+
        (cmpLastResult.rel ? '【关系】\n'+cmpLastResult.rel+'\n\n' : '')+
        (cmpLastResult.npc ? '【NPC】\n'+cmpLastResult.npc : '');
      snapshot.characters[0].desc = (snapshot.characters[0].desc||'') + extra;
    }
    charP.unshift(snapshot);
    sv(K.charP, charP);
    savedCount++;
  }

  try{ renderAllPresets(); }catch(e){logError('op',e)}

  if(cmpParts.extra && (cmpLastResult.extra||'').trim()){
    showToast('已保存 '+savedCount+' 个预设\n额外设定需手动复制', 4000);
  }else{
    showToast('已保存 '+savedCount+' 个预设（不会覆盖原设定）',3000);
  }
}
function cmpClearExtra(){
  const el=document.getElementById('cmpExtra');
  if(el) el.value='';
  refreshCmpStats();
  showToast('已清空额外设定');
}

function cmpImportContexts(){
  // 导入所有文章的续写上下文（articleContexts）
  const el=document.getElementById('cmpExtra');
  if(!el) return;

  const ctxObj = articleContexts || {};
  const ids = Object.keys(ctxObj);
  if(ids.length===0){
    showToast('没有找到续写上下文（你可能还没用过上下文编辑器）');
    return;
  }

  const findTitle = (id)=>{
    const a = (ws||[]).find(x=>x&&x.id===id) || (cols.books||[]).find(x=>x&&x.id===id) || (cols.shorts||[]).find(x=>x&&x.id===id);
    return a ? a.title : id;
  };

  let text='【续写上下文汇总】\n';
  ids.forEach(id=>{
    const c=ctxObj[id]||{};
    const t=findTitle(id);
    text += '\n==== '+t+' ====\n';
    if(c.prevSummary) text += '前情提要：\n'+c.prevSummary+'\n';
    if(c.foreshadows) text += '伏笔：\n'+c.foreshadows+'\n';
    if(c.charStates) text += '人物状态：\n'+c.charStates+'\n';
    if(c.direction) text += '方向：\n'+c.direction+'\n';
    if(c.chOutline) text += '本章大纲：\n'+c.chOutline+'\n';
    if(c.specialReq) text += '特殊要求：\n'+c.specialReq+'\n';
  });

  el.value = text.trim();
  refreshCmpStats();
  showToast('已导入续写上下文');
}

function cmpImportOutlines(){
  // 导入创作作品/收藏长篇的总大纲与章节大纲
  const el=document.getElementById('cmpExtra');
  if(!el) return;

  let text='【大纲/章节大纲汇总】\n';

  // 创作页作品
  (crWorks||[]).forEach(w=>{
    if(!w || !w.id) return;
    if(w.type!=='novel' && !w.chapters) return;
    text += '\n==== 创作作品：'+(w.title||w.id)+' ====\n';
    if(w.outline) text += '总大纲：\n'+w.outline+'\n';
    if(w.chOutlines && Array.isArray(w.chOutlines) && w.chOutlines.some(x=>x&&x.trim())){
      text += '章节大纲：\n';
      w.chOutlines.forEach((o,i)=>{
        if(o && o.trim()) text += '第'+(i+1)+'章：'+o+'\n';
      });
    }
  });

  // 收藏长篇
  (cols.books||[]).forEach(b=>{
    if(!b || !b.id) return;
    text += '\n==== 收藏长篇：'+(b.title||b.id)+' ====\n';
    if(b.outline) text += '总大纲：\n'+b.outline+'\n';
    if(b.chOutlines && Array.isArray(b.chOutlines) && b.chOutlines.some(x=>x&&x.trim())){
      text += '章节大纲：\n';
      b.chOutlines.forEach((o,i)=>{
        if(o && o.trim()) text += '第'+(i+1)+'章：'+o+'\n';
      });
    }
  });

  el.value = text.trim();
  refreshCmpStats();
  showToast('已导入大纲/章节大纲');
}

function cmpImportForeshadows(){
  // 从伏笔追踪器导入（按已知文章ID扫描）
  const el=document.getElementById('cmpExtra');
  if(!el) return;

  const ids = new Set();
  (ws||[]).forEach(a=>a&&a.id&&ids.add(a.id));
  (cols.books||[]).forEach(a=>a&&a.id&&ids.add(a.id));
  (cols.shorts||[]).forEach(a=>a&&a.id&&ids.add(a.id));

  let text='【伏笔追踪汇总】\n';
  let found=0;

  ids.forEach(id=>{
    const list = ld('bj_foreshadow_'+id, []);
    if(!Array.isArray(list) || list.length===0) return;

    const a = (ws||[]).find(x=>x&&x.id===id) || (cols.books||[]).find(x=>x&&x.id===id) || (cols.shorts||[]).find(x=>x&&x.id===id);
    const title = a ? a.title : id;

    text += '\n==== '+title+' ====\n';
    list.forEach(f=>{
      const st = (f.status==='done')?'已回收':'待回收';
      text += st+' '+(f.chapter||'')+' '+(f.content||'')+'\n';
      found++;
    });
  });

  if(found===0){
    showToast('没有找到伏笔记录');
    return;
  }

  el.value = text.trim();
  refreshCmpStats();
  showToast('已导入伏笔记录');
}
// ==================== AI REWRITE ====================
// AI润色（比重写更轻量，只优化文笔不改情节）
async function aiPolishChapter(){
if(!curEd)return;
var cfg=getCurApi();
if(!cfg.url||!cfg.key){showToast('请先在设置中配置API');return;}
var text=document.getElementById('edTextarea').value||'';
if(countWords(text)<20){showToast('内容太少，至少20字才能润色');return;}
// 弹出自定义要求面板
var ovId='polishReqOv';
var existing=document.getElementById(ovId);
if(existing)existing.remove();
var ov=document.createElement('div');
ov.id=ovId;
ov.style.cssText='display:flex;position:fixed;inset:0;z-index:9500;background:rgba(0,0,0,.55);align-items:center;justify-content:center;padding:28px';
ov.innerHTML=
'<div style="background:var(--card);border-radius:16px;padding:22px;width:100%;max-width:360px;border:1px solid var(--border);animation:fadeIn .25s ease">'+
'<h3 style="font-size:15px;margin-bottom:8px"><i class="fas fa-wand-magic-sparkles"></i> AI润色</h3>'+
'<p style="font-size:11px;color:var(--text2);margin-bottom:12px;line-height:1.6">优化文笔、删除万能副词、改善句式，保持情节不变。<br>可以在下方填写额外要求（可留空）。</p>'+
'<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px">'+
'<span class="tag" onclick="_appendPolishReq(\'增加感官细节\')" style="font-size:11px;padding:4px 10px">+感官细节</span>'+
'<span class="tag" onclick="_appendPolishReq(\'加强对话自然感\')" style="font-size:11px;padding:4px 10px">+对话自然</span>'+
'<span class="tag" onclick="_appendPolishReq(\'精简冗余描写\')" style="font-size:11px;padding:4px 10px">+精简冗余</span>'+
'<span class="tag" onclick="_appendPolishReq(\'加强情感细节\')" style="font-size:11px;padding:4px 10px">+情感细节</span>'+
'<span class="tag" onclick="_appendPolishReq(\'减少万能副词\')" style="font-size:11px;padding:4px 10px">+减副词</span>'+
'<span class="tag" onclick="_appendPolishReq(\'节奏更紧凑\')" style="font-size:11px;padding:4px 10px">+紧凑节奏</span>'+
'</div>'+
'<textarea id="polishReqInput" placeholder="额外要求，例如：\n- 保持古风语气\n- 对话要更口语化\n- 重点润色环境描写部分\n（留空则按默认方式润色）" style="width:100%;padding:9px 13px;border-radius:9px;border:1px solid var(--border);background:var(--bg);color:var(--text);font-size:12px;min-height:80px;resize:vertical;font-family:inherit;line-height:1.6;outline:none;box-sizing:border-box;margin-bottom:12px"></textarea>'+
'<div style="display:flex;gap:9px">'+
'<button onclick="document.getElementById(\''+ovId+'\').remove()" style="flex:1;padding:9px;border-radius:11px;background:var(--card2);color:var(--text);border:none;font-size:12px;font-weight:600;cursor:pointer">取消</button>'+
'<button onclick="_doPolishWithReq(\''+ovId+'\')" style="flex:1;padding:9px;border-radius:11px;background:linear-gradient(135deg,var(--accent),var(--accent2));color:#fff;border:none;font-size:12px;font-weight:600;cursor:pointer"><i class="fas fa-wand-magic-sparkles"></i> 开始润色</button>'+
'</div>'+
'</div>';
ov.onclick=function(e){if(e.target===ov)ov.remove();};
document.body.appendChild(ov);
setTimeout(function(){var ta=document.getElementById('polishReqInput');if(ta)ta.focus();},200);
return; // 阻止继续执行原来的逻辑
}
function _appendPolishReq(text){
  var ta=document.getElementById('polishReqInput');
  if(!ta)return;
  var cur=(ta.value||'').trim();
  ta.value=cur?(cur+'\n- '+text):'- '+text;
}

async function _doPolishWithReq(ovId){
  var userReq=(document.getElementById('polishReqInput').value||'').trim();
  var ov=document.getElementById(ovId);
  if(ov)ov.remove();
  if(!curEd)return;
  var cfg=getCurApi();
  if(!cfg.url||!cfg.key){showToast('请先在设置中配置API');return;}
  var text=document.getElementById('edTextarea').value||'';
  if(countWords(text)<20){showToast('内容太少，至少20字才能润色');return;}
  var ta=document.getElementById('edTextarea');
  var statusEl=document.getElementById('edSaveStatus');
  statusEl.textContent='AI润色中...';
  ta.disabled=true;
  var styleD2=(document.getElementById('styleDesc')&&document.getElementById('styleDesc').value||ap.curStyle||'').trim();
  var sysMsg='你是一位极度克制的文字外科医生，只做最小创伤手术。\n\n';
  sysMsg+='【铁律——违反即失职】\n';
  sysMsg+='❌ 情节走向：绝对不改\n';
  sysMsg+='❌ 对话内容：一个字都不改（只能改标签，不能改说的话）\n';
  sysMsg+='❌ 人物性格：不能改变任何角色的说话方式和行为逻辑\n';
  sysMsg+='❌ 篇幅：总字数变化不超过±15%\n\n';
  sysMsg+='【可以动的地方】按顺序处理：\n';
  sysMsg+='① 删除万能副词（不禁/缓缓/淡淡/微微/默默/静静/轻轻/渐渐）——直接删，不要替换\n';
  sysMsg+='② 对话标签"他/她说"→ 换成同义动作，但只改标签词，不改对话内容\n';
  sysMsg+='③ 连续3句相同主语开头——改掉中间那句的句式\n';
  sysMsg+='④ 空洞形容词→ 改成具体身体反应（保持原意）\n';
  sysMsg+='⑤ 若有明显病句或错别字，顺手修正\n\n';
  if(styleD2){sysMsg+='【必须保持的文风】\n'+styleD2+'\n润色时所有改动都不能偏离这个文风方向。\n\n';}
  if(userReq){sysMsg+='【用户额外要求（最高优先级，必须严格遵守）】\n'+userReq+'\n以上要求优先于默认润色规则。\n\n';}
  sysMsg+='【输出要求】\n- 直接输出润色后的完整正文\n- 不加任何说明、不注释改了哪里\n- 第一个字就是正文内容\n';
  var userMsg='请润色以下文章，只优化文笔，不改情节：\n\n'+text;
  var messages=[{role:'system',content:sysMsg},{role:'user',content:userMsg}];
  try{
    var result=await callToolAPINonStream(messages);
    ta.disabled=false;
    if(result){
      var polishOld=text;
      edPushUndo(text,curEdCh); // 润色前先记撤回点，和其它工具（自动排版/Markdown插入/切换版本/AI扩写缩写）保持一致，diff对比里的"恢复原文"只是当次可见，撤回栈才能长期保留这一步
      ta.value=result;updateEdWc();saveEditorContent();statusEl.textContent='润色完成 ✓';
      showToast('AI润色完成！正在显示差异对比...',3000);
      showDiffCompare(polishOld,result,'editor',-1);
    }else{
      statusEl.textContent='润色失败';
      showToast('润色失败，请检查API设置',3000);
    }
  }catch(e){
    ta.disabled=false;
    statusEl.textContent='润色失败';
    showToast('润色出错：'+(e.message||'网络异常'),3000);
  }
}

function _appendRewriteReq(text){
  var ta=document.getElementById('rewriteReqInput');
  if(!ta)return;
  var cur=(ta.value||'').trim();
  ta.value=cur?(cur+'\n- '+text):'- '+text;
}

async function _doRewriteWithReq(ovId){
  var userReq=(document.getElementById('rewriteReqInput').value||'').trim();
  var ov=document.getElementById(ovId);
  if(ov)ov.remove();
  if(!curEd)return;
  const cfg=getCurApi();
  if(!cfg.url||!cfg.key){showToast('请先在设置中配置API');return;}
  const text=document.getElementById('edTextarea').value||'';
  if(countWords(text)<10){showToast('当前章节内容太少，至少10字才能重写');return;}
  const ta=document.getElementById('edTextarea');
  const statusEl=document.getElementById('edSaveStatus');
  statusEl.textContent='AI重写中...';
  ta.disabled=true;
  let sysMsg='你是一位顶级的文字外科医生，专门给小说做精细手术。\n\n';
  sysMsg+='【手术原则】\n';
  sysMsg+='骨架（情节、人物、对话内容）→ 绝对不动\n';
  sysMsg+='血肉（表达方式、细节描写）→ 全面升级\n\n';
  sysMsg+='【必做手术清单】\n';
  sysMsg+='1. 万能副词切除术：删掉所有"不禁、缓缓、淡淡、微微、默默"\n';
  sysMsg+='2. 空洞形容词替换术："她很漂亮"→具体的五官、神态、气质\n';
  sysMsg+='3. 感官植入术：每500字至少加入1处非视觉描写（声音/气味/触感/温度）\n';
  sysMsg+='4. 对话自然化手术：删掉书面语，加入停顿、语气词、未说完的话\n';
  sysMsg+='5. 动作细化术："他笑了"→具体是什么样的笑，嘴角、眼睛、肩膀\n\n';
  if(userReq){
    sysMsg+='【用户额外要求（最高优先级，必须严格遵守）】\n';
    sysMsg+=userReq+'\n';
    sysMsg+='以上要求优先于默认重写规则，请逐条落实。\n\n';
  }
  sysMsg+='【输出要求】\n直接输出改写后的正文，字数不少于原文，不加任何说明。\n';
  const styleD=(document.getElementById('styleDesc')&&document.getElementById('styleDesc').value||ap.curStyle||'').trim();
  if(styleD)sysMsg+='\n【文风要求】'+styleD+'\n';
  if(curEd && (curEd.customTitle || curEd.title)){
  sysMsg += '\n【本章所属作品】《' + (curEd.customTitle || curEd.title) + '》\n';
  sysMsg += '改写时保持与本作品一致的文风和人物性格，不得引入与原著矛盾的表达。\n';
}
  // 注入上下文设置
  var _rwCtx = (articleContexts && curEd) ? (articleContexts[curEd.id]||{}) : {};
  if(_rwCtx.prevSummary) sysMsg+='\n【前情提要（不要改变已有情节走向）】\n'+_rwCtx.prevSummary+'\n';
  if(_rwCtx.foreshadows) sysMsg+='\n【重要伏笔/悬念（改写时请保留）】\n'+_rwCtx.foreshadows+'\n';
  if(_rwCtx.specialReq) sysMsg+='\n【特殊要求（最高优先级）】\n'+_rwCtx.specialReq+'\n';
  const chInfo=curEd.type==='novel'?'这是「'+(curEd.title||'')+'」的第'+(curEdCh+1)+'章。':'';
  let contextInfo='';
  if(curEd.type==='novel'&&curEd.chapters&&curEdCh>0){
    const prevCh=curEd.chapters[curEdCh-1]||'';
    if(prevCh)contextInfo='\n\n【上一章结尾参考】\n'+prevCh.substring(prevCh.length-300)+'\n';
  }
  const userMsg=chInfo+contextInfo+'\n\n请重写以下章节内容：\n\n'+text;
  const messages=[{role:'system',content:sysMsg},{role:'user',content:userMsg}];
  // 重写前先记一个撤回点（用原始text，此时ta.value还没被流式回调改动），和AI润色/自动排版等工具保持一致；
  // 放在流式/非流式分支之前统一记一次，避免流式回调里每收到一段增量文本就重复入栈
  edPushUndo(text,curEdCh);
  if(useStream){
    await callAPIStream(messages,
    (fullText)=>{ta.value=fullText;updateEdWc();},
    (fullText)=>{
      ta.disabled=false;
      if(fullText){
        var rewriteOld=text;
        ta.value=fullText;updateEdWc();saveEditorContent();statusEl.textContent='重写完成 ✓';
        showToast('AI重写完成！正在显示差异对比...',3000);
        showDiffCompare(rewriteOld,fullText,'editor',-1);
      }else{statusEl.textContent='重写已取消';}
    },
    (errMsg)=>{ta.disabled=false;statusEl.textContent='重写失败';showToast('重写遇到了点问题，请检查API设置后再试',3000);}
    );
  }else{
    try{
      const result=await callAPINonStream(messages);
      ta.disabled=false;
      if(result){
        var rewriteOld2=text;
        ta.value=result;updateEdWc();saveEditorContent();statusEl.textContent='重写完成 ✓';
        showDiffCompare(rewriteOld2,result,'editor',-1);
      }else{statusEl.textContent='重写失败';}
    }catch(e){
      ta.disabled=false;
      statusEl.textContent='重写失败';
      showToast('重写出错：'+(e.message||'网络异常'),3000);
    }
  }
}
async function aiRewriteChapter(){
if(!curEd)return;
const cfg=getCurApi();
if(!cfg.url||!cfg.key){showToast('请先在设置中配置API');return;}
var isNovel=(curEd.type==='novel'&&Array.isArray(curEd.chapters)&&curEd.chapters.length>1);
if(!isNovel){
  var _t0=document.getElementById('edTextarea').value||'';
  if(countWords(_t0)<10){showToast('当前内容太少，至少10字才能重写');return;}
}
var rwOvId='rewriteReqOv';
var rwExisting=document.getElementById(rwOvId);
if(rwExisting)rwExisting.remove();
var chPickerHtml='';
if(isNovel){
  _edRwSI=curEdCh;_edRwEI=curEdCh;
  chPickerHtml=
    '<div style="background:rgba(108,92,231,.09);border:1px solid rgba(108,92,231,.28);border-radius:10px;padding:10px 12px;margin-bottom:12px">'+
    '<div style="font-size:11px;font-weight:700;color:var(--accent2);margin-bottom:10px"><i class="fas fa-list-ol"></i> 选择改写范围（连续，最多10章）</div>'+
    '<div style="display:flex;flex-direction:column;gap:8px">'+
    '<div style="display:flex;align-items:center;gap:8px">'+
    '<span style="font-size:11px;color:var(--text2);width:20px;flex-shrink:0;text-align:center">从</span>'+
    '<div style="display:flex;align-items:stretch;flex:1;border:1px solid var(--border);border-radius:9px;overflow:hidden;min-height:34px;background:var(--bg)">'+
    '<button onclick="_edRwStepCh(\'s\',-1)" style="width:36px;flex-shrink:0;background:var(--card2);border:none;color:var(--text);font-size:18px;cursor:pointer;padding:0;display:flex;align-items:center;justify-content:center;transition:background .15s" onmousedown="this.style.background=\'var(--border)\'" onmouseup="this.style.background=\'var(--card2)\'" ontouchstart="this.style.background=\'var(--border)\'" ontouchend="this.style.background=\'var(--card2)\'">‹</button>'+
    '<div id="edRwSLabel" style="flex:1;display:flex;align-items:center;justify-content:center;font-size:12px;color:var(--text);padding:0 6px;text-align:center;overflow:hidden;white-space:nowrap;text-overflow:ellipsis"></div>'+
    '<button onclick="_edRwStepCh(\'s\',1)" style="width:36px;flex-shrink:0;background:var(--card2);border:none;color:var(--text);font-size:18px;cursor:pointer;padding:0;display:flex;align-items:center;justify-content:center;transition:background .15s" onmousedown="this.style.background=\'var(--border)\'" onmouseup="this.style.background=\'var(--card2)\'" ontouchstart="this.style.background=\'var(--border)\'" ontouchend="this.style.background=\'var(--card2)\'">›</button>'+
    '</div></div>'+
    '<div style="display:flex;align-items:center;gap:8px">'+
    '<span style="font-size:11px;color:var(--text2);width:20px;flex-shrink:0;text-align:center">到</span>'+
    '<div style="display:flex;align-items:stretch;flex:1;border:1px solid var(--border);border-radius:9px;overflow:hidden;min-height:34px;background:var(--bg)">'+
    '<button onclick="_edRwStepCh(\'e\',-1)" style="width:36px;flex-shrink:0;background:var(--card2);border:none;color:var(--text);font-size:18px;cursor:pointer;padding:0;display:flex;align-items:center;justify-content:center;transition:background .15s" onmousedown="this.style.background=\'var(--border)\'" onmouseup="this.style.background=\'var(--card2)\'" ontouchstart="this.style.background=\'var(--border)\'" ontouchend="this.style.background=\'var(--card2)\'">‹</button>'+
    '<div id="edRwELabel" style="flex:1;display:flex;align-items:center;justify-content:center;font-size:12px;color:var(--text);padding:0 6px;text-align:center;overflow:hidden;white-space:nowrap;text-overflow:ellipsis"></div>'+
    '<button onclick="_edRwStepCh(\'e\',1)" style="width:36px;flex-shrink:0;background:var(--card2);border:none;color:var(--text);font-size:18px;cursor:pointer;padding:0;display:flex;align-items:center;justify-content:center;transition:background .15s" onmousedown="this.style.background=\'var(--border)\'" onmouseup="this.style.background=\'var(--card2)\'" ontouchstart="this.style.background=\'var(--border)\'" ontouchend="this.style.background=\'var(--card2)\'">›</button>'+
    '</div></div>'+
    '</div>'+
    '<div id="edRwHint" style="font-size:10px;color:var(--text2);margin-top:7px;text-align:center">共选 1 章</div>'+
    '</div>';
}
var rwOv=document.createElement('div');
rwOv.id=rwOvId;
rwOv.style.cssText='display:flex;position:fixed;inset:0;z-index:9500;background:rgba(0,0,0,.55);align-items:center;justify-content:center;padding:20px';
rwOv.innerHTML=
'<div style="background:var(--card);border-radius:16px;padding:20px;width:100%;max-width:380px;border:1px solid var(--border);animation:fadeIn .25s ease;max-height:88vh;overflow-y:auto">'+
'<h3 style="font-size:15px;margin-bottom:6px"><i class="fas fa-rotate-right"></i> AI重写</h3>'+
'<p style="font-size:11px;color:var(--text2);margin-bottom:12px;line-height:1.6">保留核心情节骨架，用更好的方式重新表达。<br>原内容会被替换，建议先保存版本。</p>'+
chPickerHtml+
'<div style="font-size:11px;font-weight:600;color:var(--text);margin-bottom:6px">额外要求（可留空）</div>'+
'<div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:10px">'+
'<span class="tag" onclick="_appendRewriteReq(\'增加感官细节和微表情\')" style="font-size:11px;padding:4px 10px">+感官细节</span>'+
'<span class="tag" onclick="_appendRewriteReq(\'对话更口语化自然\')" style="font-size:11px;padding:4px 10px">+对话自然</span>'+
'<span class="tag" onclick="_appendRewriteReq(\'加快叙事节奏\')" style="font-size:11px;padding:4px 10px">+快节奏</span>'+
'<span class="tag" onclick="_appendRewriteReq(\'增强环境氛围描写\')" style="font-size:11px;padding:4px 10px">+氛围感</span>'+
'<span class="tag" onclick="_appendRewriteReq(\'用情绪更饱满的方式改写\')" style="font-size:11px;padding:4px 10px">+情绪饱满</span>'+
'<span class="tag" onclick="_appendRewriteReq(\'精简冗余保持核心\')" style="font-size:11px;padding:4px 10px">+精简版</span>'+
'<span class="tag" onclick="_appendRewriteReq(\'换成第一人称叙述\')" style="font-size:11px;padding:4px 10px">+第一人称</span>'+
'<span class="tag" onclick="_appendRewriteReq(\'加强人物心理描写\')" style="font-size:11px;padding:4px 10px">+心理描写</span>'+
'</div>'+
'<textarea id="rewriteReqInput" placeholder="额外要求，例如：\n- 开头要更有冲击力\n- 结尾要留悬念\n- 多用短句增加节奏感\n（留空则按默认方式重写）" style="width:100%;padding:9px 13px;border-radius:9px;border:1px solid var(--border);background:var(--bg);color:var(--text);font-size:12px;min-height:80px;resize:vertical;font-family:inherit;line-height:1.6;outline:none;box-sizing:border-box;margin-bottom:12px"></textarea>'+
'<div style="display:flex;gap:9px">'+
'<button onclick="document.getElementById(\''+rwOvId+'\').remove()" style="flex:1;padding:9px;border-radius:11px;background:var(--card2);color:var(--text);border:none;font-size:12px;font-weight:600;cursor:pointer">取消</button>'+
'<button onclick="_submitRewriteDialog(\''+rwOvId+'\')" style="flex:1;padding:9px;border-radius:11px;background:linear-gradient(135deg,var(--accent),var(--accent2));color:#fff;border:none;font-size:12px;font-weight:600;cursor:pointer"><i class="fas fa-rotate-right"></i> 开始重写</button>'+
'</div>'+
'</div>';
rwOv.onclick=function(e){if(e.target===rwOv)rwOv.remove();};
document.body.appendChild(rwOv);
setTimeout(function(){
  _edRwUpdatePicker();
  var ta=document.getElementById('rewriteReqInput');if(ta)ta.focus();
  var ov=document.getElementById('rewriteReqOv');if(!ov)return;
  // 章节标签点击→自定义输入
  var sl=document.getElementById('edRwSLabel');
  var el=document.getElementById('edRwELabel');
  if(sl){sl.style.cursor='pointer';sl.addEventListener('click',function(){_edRwCustomInput('s');});}
  if(el){el.style.cursor='pointer';el.addEventListener('click',function(){_edRwCustomInput('e');});}
  // 手机触摸支持（‹ › 按钮）
  var stepBtns=ov.querySelectorAll('button[style*="width:36px"]');
  var map=[['s',-1],['s',1],['e',-1],['e',1]];
  stepBtns.forEach(function(btn,i){
    if(i>=4)return;
    btn.addEventListener('touchstart',function(ev){ev.preventDefault();_edRwStepCh(map[i][0],map[i][1]);},{passive:false});
  });
},200);
}
function _edRwStepCh(which,delta){
  var tot=curEd&&curEd.chapters?curEd.chapters.length:0;
  if(tot===0)return;
  if(which==='s'){
    _edRwSI=Math.max(0,Math.min(_edRwSI+delta,tot-1));
    if(_edRwEI<_edRwSI)_edRwEI=_edRwSI;
    if(_edRwEI-_edRwSI>=10)_edRwEI=Math.min(_edRwSI+9,tot-1);
  }else{
    _edRwEI=Math.max(_edRwSI,Math.min(_edRwEI+delta,Math.min(_edRwSI+9,tot-1)));
  }
  _edRwUpdatePicker();
}
function _edRwUpdatePicker(){
  var tot=curEd&&curEd.chapters?curEd.chapters.length:0;
  var chNames=curEd&&curEd.chNames;
  var sLabel='第'+(_edRwSI+1)+'章'+(chNames&&chNames[_edRwSI]?' · '+chNames[_edRwSI]:'');
  var eLabel='第'+(_edRwEI+1)+'章'+(chNames&&chNames[_edRwEI]?' · '+chNames[_edRwEI]:'');
  var sl=document.getElementById('edRwSLabel');
  var el=document.getElementById('edRwELabel');
  var h=document.getElementById('edRwHint');
  if(sl)sl.textContent=sLabel;
  if(el)el.textContent=eLabel;
  if(h){
    var diff=_edRwEI-_edRwSI+1;
    h.textContent='共选 '+diff+' 章（第'+(_edRwSI+1)+'章 ~ 第'+(_edRwEI+1)+'章）';
    h.style.color=diff>1?'var(--accent2)':'var(--text2)';
  }
}
function _submitRewriteDialog(ovId){
  if(curEd&&curEd.type==='novel'&&Array.isArray(curEd.chapters)&&curEd.chapters.length>1){
    var si=_edRwSI;
    var ei=_edRwEI;
    if(ei<si)ei=si;
    if(ei-si>=10)ei=si+9;
    if(ei>=curEd.chapters.length)ei=curEd.chapters.length-1;
    if(ei>si){
      var userReqEl=document.getElementById('rewriteReqInput');
      var userReq=userReqEl?(userReqEl.value||'').trim():'';
      var ov=document.getElementById(ovId);
      if(ov)ov.remove();
      saveEditorChapter();
      _doMultiChapterRewrite(si,ei,userReq);
      return;
    }
    if(si!==curEdCh){
      saveEditorChapter();
      curEdCh=si;
      var ta=document.getElementById('edTextarea');
      if(ta)ta.value=curEd.chapters[curEdCh]||'';
      try{renderEdChBar();}catch(e){}
    }
  }
  _doRewriteWithReq(ovId);
}
async function _doMultiChapterRewrite(startIdx,endIdx,userReq){
  if(!curEd||!Array.isArray(curEd.chapters))return;
  var cfg=getCurApi();
  if(!cfg.url||!cfg.key){showToast('请先在设置中配置API');return;}
  var total=endIdx-startIdx+1;
  // 进度浮层
  var pgId='rwMultiPgOv';
  var old=document.getElementById(pgId);
  if(old)old.remove();
  var pgOv=document.createElement('div');
  pgOv.id=pgId;
  pgOv.style.cssText='display:flex;position:fixed;inset:0;z-index:9600;background:rgba(0,0,0,.72);align-items:center;justify-content:center;padding:28px';
  pgOv.innerHTML=
  '<div style="background:var(--card);border-radius:16px;padding:22px;width:100%;max-width:340px;border:1px solid var(--border)">'+
  '<h3 style="font-size:14px;margin-bottom:10px"><i class="fas fa-rotate-right"></i> 多章节重写进行中</h3>'+
  '<div id="rwPgTxt" style="font-size:12px;color:var(--text2);margin-bottom:10px;line-height:1.5">准备中...</div>'+
  '<div style="height:6px;border-radius:3px;background:rgba(108,92,231,.15);overflow:hidden;margin-bottom:6px">'+
  '<div id="rwPgBar" style="height:100%;width:0%;background:linear-gradient(90deg,var(--accent),var(--accent2));transition:width .4s ease"></div>'+
  '</div>'+
  '<div id="rwPgCnt" style="font-size:11px;color:var(--text2);text-align:right;margin-bottom:14px">0/'+total+'</div>'+
  '<button onclick="window._rwMultiAbort=true;this.disabled=true;this.textContent=\'正在停止...\'" style="width:100%;padding:9px;border-radius:10px;background:rgba(255,107,107,.1);color:var(--danger);border:1px solid rgba(255,107,107,.3);font-size:12px;font-weight:600;cursor:pointer"><i class="fas fa-stop"></i> 停止重写</button>'+
  '</div>';
  document.body.appendChild(pgOv);
  window._rwMultiAbort=false;
  var styleD=(document.getElementById('styleDesc')&&document.getElementById('styleDesc').value||ap.curStyle||'').trim();
  var _rwCtx=(articleContexts&&curEd)?(articleContexts[curEd.id]||{}):{};
  var newChapters=curEd.chapters.slice();
  var doneCount=0;
  for(var i=startIdx;i<=endIdx;i++){
    if(window._rwMultiAbort)break;
    var chText=newChapters[i]||'';
    var pgTxt=document.getElementById('rwPgTxt');
    var pgBar=document.getElementById('rwPgBar');
    var pgCnt=document.getElementById('rwPgCnt');
    if(pgTxt)pgTxt.textContent='正在重写第'+(i+1)+'章 ('+(doneCount+1)+'/'+total+')...';
    if(pgBar)pgBar.style.width=((doneCount/total)*100)+'%';
    if(pgCnt)pgCnt.textContent=doneCount+'/'+total;
    if(countWords(chText)<5){doneCount++;continue;}
    var sysMsg='你是一位顶级的文字外科医生，专门给小说做精细手术。\n\n';
    sysMsg+='【手术原则】\n骨架（情节、人物、对话内容）→ 绝对不动\n血肉（表达方式、细节描写）→ 全面升级\n\n';
    sysMsg+='【必做手术清单】\n';
    sysMsg+='1. 万能副词切除术：删掉所有"不禁、缓缓、淡淡、微微、默默"\n';
    sysMsg+='2. 空洞形容词替换术："她很漂亮"→具体的五官、神态、气质\n';
    sysMsg+='3. 感官植入术：每500字至少加入1处非视觉描写（声音/气味/触感/温度）\n';
    sysMsg+='4. 对话自然化手术：删掉书面语，加入停顿、语气词、未说完的话\n';
    sysMsg+='5. 动作细化术："他笑了"→具体是什么样的笑，嘴角、眼睛、肩膀\n\n';
    if(userReq){sysMsg+='【用户额外要求（最高优先级）】\n'+userReq+'\n以上要求优先于默认重写规则，请逐条落实。\n\n';}
    sysMsg+='【输出要求】\n直接输出改写后的正文，字数不少于原文，不加任何说明。\n';
    if(styleD)sysMsg+='\n【文风要求】'+styleD+'\n';
    if(curEd&&(curEd.customTitle||curEd.title)){
      sysMsg+='\n【本章所属作品】《'+(curEd.customTitle||curEd.title)+'》\n';
      sysMsg+='改写时保持与本作品一致的文风和人物性格，不得引入与原著矛盾的表达。\n';
    }
    if(_rwCtx.prevSummary)sysMsg+='\n【前情提要】\n'+_rwCtx.prevSummary+'\n';
    if(_rwCtx.foreshadows)sysMsg+='\n【重要伏笔/悬念】\n'+_rwCtx.foreshadows+'\n';
    if(_rwCtx.specialReq)sysMsg+='\n【特殊要求】\n'+_rwCtx.specialReq+'\n';
    var chInfo='这是「'+(curEd.title||'')+'」的第'+(i+1)+'章。';
    var contextInfo='';
    if(i>0){var pv=newChapters[i-1]||'';if(pv)contextInfo='\n\n【上一章结尾参考】\n'+pv.substring(pv.length-300)+'\n';}
    var userMsg=chInfo+contextInfo+'\n\n请重写以下章节内容：\n\n'+chText;
    var messages=[{role:'system',content:sysMsg},{role:'user',content:userMsg}];
    try{
      var result=await callAPINonStream(messages);
      if(result&&countWords(result)>5){
        newChapters[i]=result;
      }else{
        showToast('第'+(i+1)+'章未获有效内容，保持原文',2000);
      }
    }catch(e){
      showToast('第'+(i+1)+'章出错：'+(e.message||'网络异常'),2000);
    }
    doneCount++;
  }
  var wasAborted=window._rwMultiAbort;
  window._rwMultiAbort=false;
  // 应用结果到 curEd
  curEd.chapters=newChapters;
  // 若当前显示的章节在改写范围内，同步更新编辑器
  if(curEdCh>=startIdx&&curEdCh<=endIdx){
    var ta=document.getElementById('edTextarea');
    if(ta){ta.value=newChapters[curEdCh]||'';try{updateEdWc();}catch(e){}}
  }
  try{saveEditorContent();}catch(e){}
  // 更新进度UI后关闭
  var pgBar2=document.getElementById('rwPgBar');
  var pgTxt2=document.getElementById('rwPgTxt');
  var pgCnt2=document.getElementById('rwPgCnt');
  if(pgBar2)pgBar2.style.width='100%';
  if(pgTxt2)pgTxt2.textContent=wasAborted?'已停止（完成'+doneCount+'/'+total+'章）':'全部章节重写完成！';
  if(pgCnt2)pgCnt2.textContent=doneCount+'/'+total;
  setTimeout(function(){
    var el=document.getElementById(pgId);
    if(el)el.remove();
    showToast(wasAborted?'⏹ 已停止，完成 '+doneCount+' 章':'多章节重写完成，共 '+total+' 章',3000);
  },1500);
}
// 打开扩写/缩写弹窗时，如果用户在正文里选中了一段文字，自动把选中内容带进"原文内容"框，
// 不用再手动复制粘贴——这也是"点了AI扩写像没反应"的一个重要原因：弹窗默认是空的，
// 用户选中文字点按钮后，本以为会自动处理选中内容，结果框是空的，点"开始处理"只弹出一条容易被忽略的提示，
// 体验上跟完全没反应没什么区别
function _prefillExpandInput(){
var ta=document.getElementById('edTextarea');
var inputEl=document.getElementById('expandInput');
if(!inputEl)return;
if(ta){
var sel=_edGetSelection();
if(sel&&sel.end>sel.start){
inputEl.value=ta.value.substring(sel.start,sel.end);
return;
}
}
inputEl.value='';
}
// AI扩写入口——之前这个函数在全文里完全没有定义，点"AI扩写"按钮实际上是JS报错、什么反应都没有，
// 现在补上，写法和openAiShrink保持一致（doExpand内部本来就已经处理了expandMode==='expand'的分支）
function openAiExpand(){
if(!curEd){showToast('请先打开一篇文章');return;}
expandMode='expand';
document.getElementById('expandTitle').textContent='AI扩写';
document.getElementById('expandDesc').textContent='选中要扩写的段落再点这里，AI会添加更多细节描写（也可以手动粘贴）';
document.getElementById('expandDoBtn').textContent='开始扩写';
_prefillExpandInput();
document.getElementById('expandHint').value='';
document.getElementById('expandOutput').value='';
document.getElementById('expandResult').style.display='none';
document.getElementById('expandBtns').style.display='flex';
document.getElementById('expandOv').classList.add('show');
navPush('expandOv');
setTimeout(()=>document.getElementById('expandInput').focus(),200);
}
function openAiShrink(){
if(!curEd){showToast('请先打开一篇文章');return;}
expandMode='shrink';
document.getElementById('expandTitle').textContent='AI缩写';
document.getElementById('expandDesc').textContent='选中要缩写的段落再点这里，AI会精简内容、保留核心信息（也可以手动粘贴）';
document.getElementById('expandDoBtn').textContent='开始缩写';
_prefillExpandInput();
document.getElementById('expandHint').value='';
document.getElementById('expandOutput').value='';
document.getElementById('expandResult').style.display='none';
document.getElementById('expandBtns').style.display='flex';
document.getElementById('expandOv').classList.add('show');
navPush('expandOv');
setTimeout(()=>document.getElementById('expandInput').focus(),200);
}
function closeExpandOv(){
  navPop('expandOv');
document.getElementById('expandOv').classList.remove('show');
if(abortCtrl){abortCtrl.abort();abortCtrl=null;}
}
async function doExpand(){
const cfg=getCurApi();
if(!cfg.url||!cfg.key){showToast('请先在设置中配置API');return;}
const input=(document.getElementById('expandInput').value||'').trim();
if(!input){showToast('请输入要处理的内容');return;}
if(countWords(input)<5){showToast('内容太少，至少5个字');return;}
const hint=(document.getElementById('expandHint').value||'').trim();
const btn=document.getElementById('expandDoBtn');
btn.disabled=true;
btn.innerHTML='处理中 <span class="ldots"><span></span><span></span><span></span></span>';
document.getElementById('expandResult').style.display='block';
document.getElementById('expandOutput').value='正在处理...';
let sysMsg='';
if(expandMode==='expand'){
sysMsg='你是一位细节控作家，擅长把骨架变成血肉丰满的场景。\n\n';
sysMsg+='【扩写方向】按需选择添加：\n';
sysMsg+='• 感官层：不只是看到什么，还有听到、闻到、摸到、尝到\n';
sysMsg+='• 动作层：大动作拆成小动作，加入微表情和下意识举动\n';
sysMsg+='• 心理层：角色在想什么，有什么犹豫、期待、担忧\n';
sysMsg+='• 环境层：光线、温度、声音、气味，营造氛围\n';
sysMsg+='• 节奏层：在紧张处用短句，在舒缓处用长句\n\n';
sysMsg+='【扩写示范】\n';
sysMsg+='原文：他打开门，看到她站在门口。\n';
sysMsg+='扩写：门锁发出轻微的咔哒声。他拉开门，走廊的冷气扑面而来，带着一点消毒水的味道。她就站在那里，手里攥着手机，指节有点发白。见他开门，她的眼睛亮了一下，又很快垂下去，像是在掩饰什么。\n\n';
}else{
sysMsg='你是一位惜字如金的编辑，擅长用最少的字传达最多的信息。\n\n';
sysMsg+='【缩写删除顺序——从高到低】\n';
sysMsg+='① 重复表达同一意思的句子（留最精炼那句）\n';
sysMsg+='② 不推动情节且不服务情绪的环境描写\n';
sysMsg+='③ 可以由行为推断出来的心理活动（行动比想法更有力）\n';
sysMsg+='④ 过度修饰的形容词和副词\n';
sysMsg+='⑤ 对话中的废话、客套、过度的语气词\n\n';
sysMsg+='【必须保留】\n';
sysMsg+='- 关键情节点和转折（缺了会断剧情的）\n';
sysMsg+='- 推动剧情或揭示性格的对话\n';
sysMsg+='- 最能体现人物性格的细节（哪怕只有一句）\n';
sysMsg+='- 重要伏笔和暗示\n\n';
sysMsg+='【缩写示范】\n';
sysMsg+='原文：她慢慢地走到窗边，轻轻地推开了那扇有些陈旧的窗户，一阵带着花香的微风缓缓地吹了进来，她深深地吸了一口气，感觉心情好了很多。\n';
sysMsg+='缩写：她推开窗，花香涌进来，深吸一口气。\n\n';
sysMsg+='【铁律】\n';
sysMsg+='- 用户有特别要求时，优先严格执行用户要求\n';
sysMsg+='- 缩写后字数为原文40%-70%\n';
sysMsg+='- 直接输出，第一个字就是正文，不加任何说明\n';
const styleD=(document.getElementById('styleDesc')&&document.getElementById('styleDesc').value||ap.curStyle||'').trim();
if(styleD)sysMsg+='\n【保持文风】\n'+styleD+'\n';
}
let userMsg=expandMode==='expand'?'请扩写以下段落：\n\n':'请缩写以下段落：\n\n';
userMsg+=input;
if(hint)userMsg+='\n\n【特别要求】'+hint;
const messages=[{role:'system',content:sysMsg},{role:'user',content:userMsg}];
const outputEl=document.getElementById('expandOutput');
// 扩写/缩写属于工具类功能，统一走工具专用API（未单独配置工具API时会自动回退到通用API，行为不变）
const result=await callToolAPINonStream(messages);
btn.disabled=false;
btn.textContent=expandMode==='expand'?'开始扩写':'开始缩写';
if(result){
outputEl.value=result;
const oldWc=countWords(input);
const newWc=countWords(result);
const ratio=((newWc/oldWc)*100).toFixed(0);
showToast((expandMode==='expand'?'扩写':'缩写')+'完成！原文'+oldWc+'字→'+newWc+'字('+ratio+'%)');
}else{
outputEl.value='处理失败，请检查API设置'; showToast(''+(expandMode==='expand'?'扩写':'缩写')+'失败，请检查API设置',4000);
}
}
// 导出TXT文件
function _isApkWebView(){return /Android/i.test(navigator.userAgent)&&/;\s*wv\s*\)/i.test(navigator.userAgent);}
function _exportFileWithFallback(filename,content,mimeType){
  window._pendingExportFile={filename:filename,content:content};
  mimeType=mimeType||'text/plain;charset=utf-8';
  var downloaded=false;
  try{
    var blob=new Blob([content],{type:mimeType});
    var url=URL.createObjectURL(blob);
    var a=document.createElement('a');
    a.href=url;a.download=filename;a.style.display='none';
    document.body.appendChild(a);a.click();
    setTimeout(function(){try{URL.revokeObjectURL(url);document.body.removeChild(a);}catch(e){}},1000);
    downloaded=true;
  }catch(e){downloaded=false;}
  var html='<div style="font-size:12px;line-height:1.8;color:var(--text);margin-bottom:14px;">';
  if(downloaded){
    html+='已尝试导出文件：<br><b style="color:var(--accent2);">'+esc(filename)+'</b><br>';
    html+='<span style="font-size:11px;color:var(--text2);">请检查手机「下载」目录是否已收到该文件。</span>';
  }else{
    html+='当前环境无法直接下载，请复制后手动保存：<br><b style="color:var(--accent2);font-size:11px;">'+esc(filename)+'</b>';
  }
  html+='</div>';
  html+='<button id="exportFbCopyBtn" onclick="_exportFallbackCopy()" style="width:100%;padding:10px;border-radius:10px;border:1px solid rgba(108,92,231,.4);background:rgba(108,92,231,.08);color:var(--accent2);font-size:12px;cursor:pointer;font-weight:600;"><i class="fas fa-clipboard"></i> 未收到导出，复制到剪贴板</button>';
  showDlg(downloaded?'导出完成':'导出提示',html,function(){window._pendingExportFile=null;},false,true);
  setTimeout(function(){
    var okBtn=document.getElementById('dlgOkBtn');
    if(okBtn)okBtn.textContent='✓ 已收到，关闭';
    var p=document.getElementById('dlgMsg');
    if(p)p.style.maxHeight='60vh';
  },50);
}
function _exportFallbackCopy(){
  var data=window._pendingExportFile;
  if(!data||!data.content){showToast('内容已失效，请重新导出');return;}
  if(navigator.clipboard&&navigator.clipboard.writeText){
    navigator.clipboard.writeText(data.content).then(function(){
      showToast('已复制到剪贴板');
      var btn=document.getElementById('exportFbCopyBtn');
      if(btn){btn.textContent='✓ 已复制！';btn.disabled=true;btn.style.opacity='.6';}
    }).catch(function(){showToast('复制失败，请检查剪贴板权限');});
  }else{showToast('当前环境不支持自动复制');}
}

function exportToTxtFile(filename, content) {
  _exportFileWithFallback(filename,content,'text/plain;charset=utf-8');
}
// ── 资源包信息填写表单（分享/批量导出 公用）──
function _showResPackInfoForm(defaults,onConfirm){
  var dName=esc(defaults.name||'');
  var dAuthor=esc(defaults.author||'');
  var html=
    '<div style="display:flex;flex-direction:column;gap:12px">'+
    '<div>'+
      '<div style="font-size:11px;color:var(--text2);margin-bottom:5px">资源包名称 <span style="color:var(--danger)">*</span></div>'+
      '<input id="_rpName" type="text" value="'+dName+'" placeholder="给资源包起个名字" '+
      'style="width:100%;padding:10px 12px;border-radius:10px;border:1px solid var(--border);background:var(--card2);color:var(--text);font-size:13px;outline:none;box-sizing:border-box">'+
    '</div>'+
    '<div>'+
      '<div style="font-size:11px;color:var(--text2);margin-bottom:5px">作者名称 <span style="color:var(--danger)">*</span></div>'+
      '<input id="_rpAuthor" type="text" value="'+dAuthor+'" placeholder="你的名字或笔名" '+
      'style="width:100%;padding:10px 12px;border-radius:10px;border:1px solid var(--border);background:var(--card2);color:var(--text);font-size:13px;outline:none;box-sizing:border-box">'+
    '</div>'+
    '<div>'+
      '<div style="font-size:11px;color:var(--text2);margin-bottom:5px">资源包简介 <span style="font-size:10px">(选填)</span></div>'+
      '<input id="_rpDesc" type="text" placeholder="一句话描述这个资源包..." '+
      'style="width:100%;padding:10px 12px;border-radius:10px;border:1px solid var(--border);background:var(--card2);color:var(--text);font-size:13px;outline:none;box-sizing:border-box">'+
    '</div>'+
    '</div>';
  window._resPackInfoConfirm=onConfirm;
  showDlg('资源包信息',html,function(){},false,true);
  setTimeout(function(){
    var okBtn=document.getElementById('dlgOkBtn');
    if(okBtn){
      okBtn.textContent='✓ 确认打包导出';
      okBtn.onclick=function(){
        var name=(document.getElementById('_rpName').value||'').trim();
        var author=(document.getElementById('_rpAuthor').value||'').trim();
        var desc=(document.getElementById('_rpDesc').value||'').trim();
        if(!name){showToast('请填写资源包名称');return;}
        if(!author){showToast('请填写作者名称');return;}
        closeDlg();
        if(window._resPackInfoConfirm){
          var cb=window._resPackInfoConfirm;
          window._resPackInfoConfirm=null;
          cb(name,author,desc);
        }
      };
    }
    var p=document.getElementById('dlgMsg');
    if(p){p.style.maxHeight='60vh';p.style.overflowY='auto';}
  },50);
}

// ── Word (.doc) 内容构建 ──
function buildWordContent(title,chapters,isAI){
  var _e=function(s){
    return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  };
  var paras=function(text){
    var r='';
    String(text||'').split('\n').forEach(function(line){
      if(line.trim())r+='<p>'+_e(line)+'</p>\n';
      else r+='<p class="bl">&nbsp;</p>\n';
    });
    return r;
  };
  var body='<h1>'+_e(title)+'</h1>\n';
  if(Array.isArray(chapters)){
    chapters.forEach(function(ch,i){
      body+='<h2>第'+(i+1)+'章</h2>\n'+paras(ch);
    });
  }else{
    body+=paras(chapters);
  }
  if(isAI){
    body+='<p class="note">本文由「星叙」AI辅助创作 &nbsp;|&nbsp; 导出于 '+_e(new Date().toLocaleString())+'</p>\n';
  }
  return '<!DOCTYPE html>\n'+
    '<html xmlns:o="urn:schemas-microsoft-com:office:office"\n'+
    '  xmlns:w="urn:schemas-microsoft-com:office:word"\n'+
    '  xmlns="http://www.w3.org/TR/REC-html40">\n'+
    '<head><meta charset="UTF-8"><title>'+_e(title)+'</title>\n'+
    '<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View>'+
    '<w:Zoom>90</w:Zoom></w:WordDocument></xml><![endif]-->\n'+
    '<style>\n'+
    'body{font-family:"Microsoft YaHei","宋体",SimSun,serif;margin:2.5cm 3cm;line-height:1.8;}\n'+
    'h1{font-size:18pt;text-align:center;font-weight:bold;margin-bottom:1.5em;}\n'+
    'h2{font-size:14pt;font-weight:bold;margin-top:2em;margin-bottom:0.8em;border-bottom:1pt solid #ccc;padding-bottom:4pt;}\n'+
    'p{font-size:12pt;text-indent:2em;margin:0.4em 0;}\n'+
    'p.bl{text-indent:0;margin:0.15em 0;}\n'+
    'p.note{font-size:9pt;color:#888;text-align:center;margin-top:2em;border-top:1pt solid #ddd;padding-top:0.5em;text-indent:0;}\n'+
    '</style></head>\n<body>\n'+body+'\n</body></html>';
}

// ── 极简 ZIP 生成器（STORED 无压缩，用于生成合规 EPUB 文件）──
function _minimalZip(files){
  var _tbl=(function(){
    var t=new Uint32Array(256);
    for(var i=0;i<256;i++){
      var c=i;
      for(var j=0;j<8;j++)c=(c&1)?(0xEDB88320^(c>>>1)):(c>>>1);
      t[i]=c;
    }
    return t;
  })();
  function _crc32(data){
    var crc=0xFFFFFFFF;
    for(var i=0;i<data.length;i++)crc=((crc>>>8)^_tbl[(crc^data[i])&0xFF])>>>0;
    return(crc^0xFFFFFFFF)>>>0;
  }
  function u16(arr,off,v){arr[off]=v&0xFF;arr[off+1]=(v>>8)&0xFF;}
  function u32(arr,off,v){arr[off]=v&0xFF;arr[off+1]=(v>>8)&0xFF;arr[off+2]=(v>>16)&0xFF;arr[off+3]=(v>>24)&0xFF;}
  var enc=new TextEncoder();
  var parts=[],cdInfos=[],offsets=[];
  var pos=0;
  files.forEach(function(file){
    var nb=enc.encode(file.name);
    var db=(file.data instanceof Uint8Array)?file.data:enc.encode(String(file.data));
    var crc=_crc32(db);
    var lh=new Uint8Array(30+nb.length);
    lh[0]=0x50;lh[1]=0x4B;lh[2]=0x03;lh[3]=0x04;
    u16(lh,4,20);u16(lh,6,0);u16(lh,8,0);u16(lh,10,0);u16(lh,12,0);
    u32(lh,14,crc);u32(lh,18,db.length);u32(lh,22,db.length);
    u16(lh,26,nb.length);u16(lh,28,0);
    lh.set(nb,30);
    offsets.push(pos);
    pos+=30+nb.length+db.length;
    parts.push(lh,db);
    cdInfos.push({nb:nb,crc:crc,len:db.length});
  });
  var cdOff=pos,cdSize=0;
  var cdArr=cdInfos.map(function(e,i){
    var cd=new Uint8Array(46+e.nb.length);
    cd[0]=0x50;cd[1]=0x4B;cd[2]=0x01;cd[3]=0x02;
    u16(cd,4,20);u16(cd,6,20);u16(cd,8,0);u16(cd,10,0);u16(cd,12,0);u16(cd,14,0);
    u32(cd,16,e.crc);u32(cd,20,e.len);u32(cd,24,e.len);
    u16(cd,28,e.nb.length);u16(cd,30,0);u16(cd,32,0);
    u16(cd,34,0);u16(cd,36,0);u32(cd,38,0);u32(cd,42,offsets[i]);
    cd.set(e.nb,46);
    cdSize+=cd.length;
    return cd;
  });
  var eocd=new Uint8Array(22);
  eocd[0]=0x50;eocd[1]=0x4B;eocd[2]=0x05;eocd[3]=0x06;
  u16(eocd,4,0);u16(eocd,6,0);
  u16(eocd,8,files.length);u16(eocd,10,files.length);
  u32(eocd,12,cdSize);u32(eocd,16,cdOff);u16(eocd,20,0);
  return new Blob(parts.concat(cdArr).concat([eocd]),{type:'application/epub+zip'});
}

// 生成epub的二进制内容，只返回Blob不触发下载——被"单篇作品导出为epub"(_exportEpubFile)和
// "整个文件夹打包为zip"（每篇小说各自生成一个.epub再一起打进外层zip）两处共用
function _buildEpubBlob(title,chapters,isAI){
  var _e=function(s){
    return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  };
  var bookId='xingxu-'+Date.now()+'-'+Math.random().toString(36).substr(2,6);
  var paras=function(text){
    var r='';
    String(text||'').split('\n').forEach(function(line){
      if(line.trim())r+='<p>'+_e(line)+'</p>\n';
      else r+='<p class="bl"> </p>\n';
    });
    return r;
  };
  var body='<h1 id="start">'+_e(title)+'</h1>\n';
  if(Array.isArray(chapters)){
    chapters.forEach(function(ch,i){body+='<h2>第'+(i+1)+'章</h2>\n'+paras(ch);});
  }else{
    body+=paras(chapters);
  }
  if(isAI){body+='<p class="note">本文由「星叙」AI辅助创作</p>\n';}
  var xhtml='<?xml version="1.0" encoding="UTF-8"?>\n'+
    '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">\n'+
    '<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="zh-CN">\n<head>\n'+
    '<meta charset="UTF-8"/><title>'+_e(title)+'</title>\n<style>\n'+
    'body{font-family:serif;margin:1.5em;line-height:1.8;}\n'+
    'h1{font-size:1.5em;text-align:center;margin-bottom:1em;}\n'+
    'h2{font-size:1.2em;margin-top:1.5em;border-bottom:1px solid #ccc;padding-bottom:0.3em;}\n'+
    'p{text-indent:2em;margin:0.4em 0;}\n'+
    'p.bl{text-indent:0;margin:0.15em 0;}\n'+
    'p.note{font-size:0.8em;color:#888;text-align:center;margin-top:2em;border-top:1px solid #ccc;padding-top:0.5em;text-indent:0;}\n'+
    '</style>\n</head>\n<body>\n'+body+'</body>\n</html>';
  var ncx='<?xml version="1.0" encoding="UTF-8"?>\n'+
    '<!DOCTYPE ncx PUBLIC "-//NISO//DTD ncx 2005-1//EN" "http://www.daisy.org/z3986/2005/ncx-2005-1.dtd">\n'+
    '<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">\n'+
    '<head><meta name="dtb:uid" content="'+bookId+'"/></head>\n'+
    '<docTitle><text>'+_e(title)+'</text></docTitle>\n'+
    '<navMap><navPoint id="p1" playOrder="1">'+
    '<navLabel><text>'+_e(title)+'</text></navLabel>'+
    '<content src="content.xhtml#start"/></navPoint></navMap>\n</ncx>';
  var opf='<?xml version="1.0" encoding="UTF-8"?>\n'+
    '<package version="2.0" xmlns="http://www.idpf.org/2007/opf" unique-identifier="uid">\n'+
    '<metadata xmlns:dc="http://purl.org/dc/elements/1.1/">\n'+
    '<dc:title>'+_e(title)+'</dc:title>\n'+
    '<dc:language>zh-CN</dc:language>\n'+
    '<dc:identifier id="uid">'+bookId+'</dc:identifier>\n'+
    '</metadata>\n<manifest>\n'+
    '<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>\n'+
    '<item id="c1" href="content.xhtml" media-type="application/xhtml+xml"/>\n'+
    '</manifest>\n<spine toc="ncx"><itemref idref="c1"/></spine>\n</package>';
  var container='<?xml version="1.0" encoding="UTF-8"?>\n'+
    '<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">\n'+
    '<rootfiles><rootfile full-path="OEBPS/content.opf" '+
    'media-type="application/oebps-package+xml"/></rootfiles>\n</container>';
  return _minimalZip([
    {name:'mimetype',data:'application/epub+zip'},
    {name:'META-INF/container.xml',data:container},
    {name:'OEBPS/content.opf',data:opf},
    {name:'OEBPS/toc.ncx',data:ncx},
    {name:'OEBPS/content.xhtml',data:xhtml}
  ]);
}
// ── EPUB (.epub) 导出（EPUB2 格式，兼容掌阅/多看等阅读器）──
function _exportEpubFile(filename,title,chapters,isAI){
  var blob;
  try{
    blob=_buildEpubBlob(title,chapters,isAI);
  }catch(e){
    showToast('EPUB 生成失败：'+(e.message||'未知错误'));
    return;
  }
  var downloaded=false;
  try{
    var url=URL.createObjectURL(blob);
    var a=document.createElement('a');
    a.href=url;a.download=filename;a.style.display='none';
    document.body.appendChild(a);a.click();
    setTimeout(function(){try{URL.revokeObjectURL(url);document.body.removeChild(a);}catch(ee){}},1000);
    downloaded=true;
  }catch(e){downloaded=false;}
  var dlgHtml='<div style="font-size:12px;line-height:1.8;color:var(--text);margin-bottom:14px;">';
  if(downloaded){
    dlgHtml+='已尝试导出 EPUB 文件：<br><b style="color:var(--accent2);">'+esc(filename)+'</b><br>';
    dlgHtml+='<span style="font-size:11px;color:var(--text2);">请检查手机「下载」目录，可用掌阅、多看等阅读器打开。</span>';
  }else{
    dlgHtml+='当前环境无法直接下载 EPUB，可尝试更换浏览器重新导出，或改用 TXT / Word 格式。';
  }
  dlgHtml+='</div>';
  showDlg(downloaded?'EPUB 导出完成':'EPUB 导出提示',dlgHtml,function(){},false,true);
  setTimeout(function(){
    var ok=document.getElementById('dlgOkBtn');
    if(ok)ok.textContent='✓ 已收到，关闭';
    var p=document.getElementById('dlgMsg');
    if(p)p.style.maxHeight='60vh';
  },50);
}

// ==================== 文件夹打包导出为zip ====================
// 把一组 {title,chapters} 一起打包成一个zip压缩包并下载，chapters是字符串（短篇/草稿）或数组
// （长篇/多章节小说）——和buildTxtContent/buildMdContent/buildWordContent/_buildEpubBlob期望的
// 参数形状完全一致。创作工具箱的文件夹导出、收藏页的文件夹导出共用这一套打包逻辑，
// 各自只需要先把自己的数据结构（crWorks / cols.books+cols.shorts）转换成这个统一形状再调用。
function _showFolderZipFormatDialog(items,folderLabel){
  if(!items||items.length===0){showToast('这个文件夹里还没有作品');return;}
  var fmtHtml=
    '<p style="font-size:12px;color:var(--text2);margin-bottom:14px">把「'+esc(folderLabel)+'」里的 '+items.length+' 篇作品打包为zip，请选择压缩包里每篇小说的文件格式：</p>'+
    '<div style="display:flex;flex-direction:column;gap:10px">'+
    '<button onclick="window._doFolderZipFmt(\'txt\')" style="padding:12px 16px;border-radius:12px;border:1px solid var(--border);background:var(--card);color:var(--text);font-size:13px;cursor:pointer;text-align:left"><b><i class="fas fa-file"></i> TXT 纯文本</b><div style="font-size:10px;color:var(--text2);margin-top:3px">通用格式，任何设备均可打开</div></button>'+
    '<button onclick="window._doFolderZipFmt(\'md\')" style="padding:12px 16px;border-radius:12px;border:1px solid var(--border);background:var(--card);color:var(--text);font-size:13px;cursor:pointer;text-align:left"><b><i class="fas fa-pen-nib"></i> Markdown (.md)</b><div style="font-size:10px;color:var(--text2);margin-top:3px">适合Obsidian、Typora等Markdown编辑器</div></button>'+
    '<button onclick="window._doFolderZipFmt(\'word\')" style="padding:12px 16px;border-radius:12px;border:1px solid var(--border);background:var(--card);color:var(--text);font-size:13px;cursor:pointer;text-align:left"><b><i class="fas fa-file-word"></i> Word (.doc)</b><div style="font-size:10px;color:var(--text2);margin-top:3px">可用 WPS、Microsoft Word 直接打开</div></button>'+
    '<button onclick="window._doFolderZipFmt(\'epub\')" style="padding:12px 16px;border-radius:12px;border:1px solid var(--border);background:var(--card);color:var(--text);font-size:13px;cursor:pointer;text-align:left"><b><i class="fas fa-book-open"></i> EPUB (.epub)</b><div style="font-size:10px;color:var(--text2);margin-top:3px">电子书格式，可用掌阅、多看阅读器打开</div></button>'+
    '</div>';
  showDlg('导出文件夹为zip',fmtHtml,function(){},false,true);
  document.getElementById('dlgOkBtn').style.display='none';
  setTimeout(function(){
    var p=document.getElementById('dlgMsg');
    if(p){p.style.maxHeight='50vh';p.style.overflowY='auto';}
  },50);
  window._doFolderZipFmt=function(fmt){
    closeDlg();
    showToast('正在生成zip，请稍候...',3000);
    // 用setTimeout让"正在生成"提示先绘制出来，再执行下面这段可能较耗时的打包（和长图导出的
    // _liExportAndDownload是同一个道理），避免界面卡在提示弹出前
    setTimeout(function(){
      _buildAndDownloadZipFromList(items,folderLabel,fmt);
    },30);
  };
}
async function _buildAndDownloadZipFromList(items,folderLabel,fmt){
  try{
    var files=[];
    var usedNames={};
    for(var i=0;i<items.length;i++){
      var it=items[i];
      var title=it.title||'未命名';
      var safeTitle=title.replace(/[\\/:*?"<>|]/g,'_')||'未命名';
      var ext,entryData;
      if(fmt==='txt'){ext='txt';entryData=buildTxtContent(title,it.chapters,false);}
      else if(fmt==='md'){ext='md';entryData=buildMdContent(title,it.chapters,false);}
      else if(fmt==='word'){ext='doc';entryData=buildWordContent(title,it.chapters,false);}
      else{
        ext='epub';
        var epubBlob=_buildEpubBlob(title,it.chapters,false);
        entryData=new Uint8Array(await epubBlob.arrayBuffer());
      }
      // 同名作品（比如两篇都叫"无标题"）在压缩包里加编号后缀，避免互相覆盖
      var finalName=safeTitle+'.'+ext;
      var dupIdx=1;
      while(usedNames[finalName]){finalName=safeTitle+'_'+(++dupIdx)+'.'+ext;}
      usedNames[finalName]=true;
      files.push({name:finalName,data:entryData});
    }
    var rawZip=_minimalZip(files);
    var zipBlob=new Blob([rawZip],{type:'application/zip'});
    var safeFolderName=(folderLabel||'文件夹').replace(/[\\/:*?"<>|]/g,'_');
    var filename='星叙_'+safeFolderName+'.zip';
    var downloaded=false;
    try{
      var url=URL.createObjectURL(zipBlob);
      var a=document.createElement('a');
      a.href=url;a.download=filename;a.style.display='none';
      document.body.appendChild(a);a.click();
      setTimeout(function(){try{URL.revokeObjectURL(url);document.body.removeChild(a);}catch(ee){}},1000);
      downloaded=true;
    }catch(e){downloaded=false;}
    var dlgHtml='<div style="font-size:12px;line-height:1.8;color:var(--text);margin-bottom:14px;">';
    if(downloaded){
      dlgHtml+='已尝试导出：<br><b style="color:var(--accent2);">'+esc(filename)+'</b><br>';
      dlgHtml+='<span style="font-size:11px;color:var(--text2);">共'+files.length+'篇作品，请检查手机「下载」目录。</span>';
    }else{
      dlgHtml+='当前环境无法直接下载zip，可尝试更换浏览器重新导出。';
    }
    dlgHtml+='</div>';
    showDlg(downloaded?'导出完成':'导出提示',dlgHtml,function(){},false,true);
    setTimeout(function(){
      var ok=document.getElementById('dlgOkBtn');
      if(ok)ok.textContent='✓ 已收到，关闭';
    },50);
  }catch(e){
    logError('op',e);
    showToast('打包失败：'+(e.message||'未知错误'));
  }
}
function exportCrFolderAsZip(){
  if(!_crFolderDetailCtx)return;
  var works=_crWorksInFolder(_crFolderDetailCtx.folderId);
  var folderLabel=_crFolderDetailCtx.folderId?_crFolderName(_crFolderDetailCtx.folderId):'未分类';
  var items=works.map(function(w){
    return {title:w.title||'未命名',chapters:(w.type==='novel'||w.chapters)?(w.chapters||[]):(w.content||'')};
  });
  _showFolderZipFormatDialog(items,folderLabel);
}
function exportColFolderAsZip(){
  if(!_colFolderDetailCtx)return;
  var colItems=_colWorksInFolder(_colFolderDetailCtx.folderId);
  var folderLabel=_colFolderDetailCtx.folderId?_colFolderName(_colFolderDetailCtx.folderId):'未分类';
  var items=colItems.map(function(it){
    var isBook=it.kind==='book';
    return {title:it.obj.title||'未命名',chapters:isBook?(it.obj.chapters||[]):(it.obj.content||'')};
  });
  _showFolderZipFormatDialog(items,folderLabel);
}

// ==================== 本地文件夹导入 ====================
// 读取一个zip文件的所有条目（与_minimalZip互为逆操作），从中央目录(Central Directory)解析——
// 这是zip格式里权威、可靠的文件清单来源，不依赖本地文件头里可能不准确的大小字段（部分zip写入器
// 用"数据描述符"模式时本地头的大小会先写0、之后才补在压缩数据后面，直接按本地头顺序读会读串位置）。
// 支持STORED(不压缩)和DEFLATE两种压缩方式；DEFLATE解压依赖浏览器原生DecompressionStream API，
// 遇到不支持的环境（较老的浏览器/WebView）或其它压缩方式，对应条目标记ok:false，不中断整体读取。
async function _readZip(arrayBuffer){
  var bytes=new Uint8Array(arrayBuffer);
  var dv=new DataView(arrayBuffer);
  var eocdSig=0x06054b50;
  var searchStart=Math.max(0,bytes.length-65557);// EOCD在文件末尾，前面最多跟65535字节的注释
  var eocdOffset=-1;
  for(var i=bytes.length-22;i>=searchStart;i--){
    if(dv.getUint32(i,true)===eocdSig){eocdOffset=i;break;}
  }
  if(eocdOffset===-1){var e0=new Error('不是有效的zip文件（找不到目录结构）');throw e0;}
  var cdEntryCount=dv.getUint16(eocdOffset+10,true);
  var cdOffset=dv.getUint32(eocdOffset+16,true);
  var entries=[];
  var hasUnsupported=false;
  var pos=cdOffset;
  for(var e2=0;e2<cdEntryCount;e2++){
    if(dv.getUint32(pos,true)!==0x02014b50)break;// Central Directory File Header签名校验
    var method=dv.getUint16(pos+10,true);
    var compSize=dv.getUint32(pos+20,true);
    var nameLen=dv.getUint16(pos+28,true);
    var extraLen=dv.getUint16(pos+30,true);
    var commentLen=dv.getUint16(pos+32,true);
    var localHeaderOffset=dv.getUint32(pos+42,true);
    var name=new TextDecoder('utf-8').decode(bytes.subarray(pos+46,pos+46+nameLen));
    // 中央目录只给出本地文件头的偏移，真正的数据起始位置要跳到本地头、读它自己的文件名/extra长度来算
    var lhNameLen=dv.getUint16(localHeaderOffset+26,true);
    var lhExtraLen=dv.getUint16(localHeaderOffset+28,true);
    var dataStart=localHeaderOffset+30+lhNameLen+lhExtraLen;
    var raw=bytes.subarray(dataStart,dataStart+compSize);
    if(method===0){
      entries.push({name:name,data:raw,ok:true});
    }else if(method===8&&typeof DecompressionStream==='function'){
      try{
        var ds=new DecompressionStream('deflate-raw');
        var writer=ds.writable.getWriter();
        // 读写必须并发进行，不能等write+close都完成了才开始读readable端——
        // 部分真实压缩数据在写入端会因为背压（没人读就一直不释放缓冲区）卡死，导致整个导入永久挂起
        var readPromise=new Response(ds.readable).arrayBuffer();
        var writePromise=writer.write(raw).then(function(){return writer.close();});
        await writePromise;
        var outBuf=await readPromise;
        entries.push({name:name,data:new Uint8Array(outBuf),ok:true});
      }catch(err){
        entries.push({name:name,data:null,ok:false});
        hasUnsupported=true;
      }
    }else{
      entries.push({name:name,data:null,ok:false});
      hasUnsupported=true;
    }
    pos+=46+nameLen+extraLen+commentLen;
  }
  return {entries:entries,hasUnsupported:hasUnsupported};
}
// 把HTML内容转成纯文字（块级标签换成换行）。用DOMParser而不是直接给某个元素赋innerHTML——
// DOMParser生成的文档不会执行脚本、不会加载图片等外部资源，是解析不可信HTML内容时更安全的做法
// （不可信HTML直接赋给innerHTML，即便那个元素没挂到页面上，图片onerror等事件处理器也可能被触发）。
function _htmlToPlainText(html){
  var withBreaks=String(html||'')
    .replace(/<br\s*\/?>/gi,'\n')
    .replace(/<\/(p|div|h[1-6]|li|tr)>/gi,'\n')
    .replace(/<(p|div|h[1-6]|li)[^>]*>/gi,'\n');
  var doc=new DOMParser().parseFromString(withBreaks,'text/html');
  var junk=doc.querySelectorAll('script,style');
  junk.forEach(function(el){el.remove();});
  var text=doc.body?(doc.body.textContent||''):'';
  return text.split('\n').map(function(l){return l.trim();}).join('\n').replace(/\n{3,}/g,'\n\n').trim();
}
// 解析epub文件：读container.xml定位OPF清单文件，再按OPF里spine（阅读顺序列表）依次取出每个
// XHTML章节文件转成纯文字，一个spine条目对应一章——不是简单按文件名排序（文件名不一定反映
// 真实阅读顺序），这是epub规范里权威的顺序来源。
async function _parseEpubFile(arrayBuffer,fileName){
  var zip=await _readZip(arrayBuffer);
  var byName={};
  zip.entries.forEach(function(e){if(e.ok)byName[e.name]=e.data;});
  var td=new TextDecoder('utf-8');
  var containerData=byName['META-INF/container.xml'];
  if(!containerData){var e1=new Error('epub结构不完整（缺少container.xml）');throw e1;}
  var containerXml=new DOMParser().parseFromString(td.decode(containerData),'application/xml');
  if(containerXml.querySelector('parsererror')){var e1b=new Error('epub结构损坏（container.xml无法解析）');throw e1b;}
  var rootfileEl=containerXml.querySelector('rootfile');
  var opfPath=rootfileEl&&rootfileEl.getAttribute('full-path');
  if(!opfPath||!byName[opfPath]){var e2=new Error('epub结构不完整（找不到内容目录文件）');throw e2;}
  var opfDir=opfPath.indexOf('/')>=0?opfPath.substring(0,opfPath.lastIndexOf('/')+1):'';
  var opfXml=new DOMParser().parseFromString(td.decode(byName[opfPath]),'application/xml');
  if(opfXml.querySelector('parsererror')){var e2b=new Error('epub结构损坏（内容目录文件无法解析）');throw e2b;}
  var manifest={};
  var manifestItems=opfXml.getElementsByTagName('item');
  for(var i=0;i<manifestItems.length;i++){
    manifest[manifestItems[i].getAttribute('id')]=manifestItems[i].getAttribute('href');
  }
  var titleEls=opfXml.getElementsByTagName('dc:title');
  var epubTitle=titleEls.length>0?(titleEls[0].textContent||'').trim():'';
  var spineIds=[];
  var itemrefs=opfXml.getElementsByTagName('itemref');
  for(var j=0;j<itemrefs.length;j++){spineIds.push(itemrefs[j].getAttribute('idref'));}
  var chapters=[];
  spineIds.forEach(function(id){
    var href=manifest[id];
    if(!href)return;
    // href里可能带URL编码（比如空格是%20），要解码后才能和byName里实际的文件路径对上
    var fullPath=opfDir+decodeURIComponent(href.split('#')[0]);
    var data=byName[fullPath];
    if(!data)return;
    var html=td.decode(data);
    var text=_htmlToPlainText(html);
    if(text.trim())chapters.push(text);
  });
  if(chapters.length===0){
    var e3=new Error(zip.hasUnsupported?'epub使用了当前环境不支持的压缩方式，无法解析':'epub里没有找到可读取的章节内容（可能已加密）');
    throw e3;
  }
  return {title:epubTitle||fileName.replace(/\.epub$/i,''),chapters:chapters};
}
// 解析docx（本质是zip+XML）：取出word/document.xml，按<w:p>取段落、<w:t>取实际文字
// （一个段落内的文字可能被拆成多个<w:t>，比如中途有加粗/变色等格式变化）。
async function _parseDocxFile(arrayBuffer,fileName){
  var zip=await _readZip(arrayBuffer);
  var docEntry=zip.entries.find(function(e){return e.name==='word/document.xml'&&e.ok;});
  if(!docEntry){
    var e1=new Error(zip.hasUnsupported?'docx使用了当前环境不支持的压缩方式，无法解析':'不是有效的docx文件（缺少document.xml）');
    throw e1;
  }
  var xml=new TextDecoder('utf-8').decode(docEntry.data);
  var doc=new DOMParser().parseFromString(xml,'application/xml');
  if(doc.querySelector('parsererror')){var e2=new Error('docx内容解析失败');throw e2;}
  var pNodes=doc.getElementsByTagName('w:p');
  var paragraphs=[];
  for(var i=0;i<pNodes.length;i++){
    var tNodes=pNodes[i].getElementsByTagName('w:t');
    var line='';
    for(var j=0;j<tNodes.length;j++)line+=tNodes[j].textContent;
    paragraphs.push(line);
  }
  var text=paragraphs.join('\n').replace(/\n{3,}/g,'\n\n').trim();
  if(!text){var e3=new Error('docx里没有找到可提取的文字内容');throw e3;}
  return {title:fileName.replace(/\.docx?$/i,''),chapters:[text]};
}
// 判断+解析一个导入文件夹里的单个文件，返回{title,chapters}（chapters是数组，每项一章）。
// 支持txt/md（纯文本）、epub、docx，以及doc——doc按内容特征判断：文件头是zip结构就当.docx解析
// （很多人电脑上的"doc"其实就是docx），是本应用自己导出的那种HTML内容就直接转纯文本，两者都不是
// 就说明是真正的旧版二进制Word格式，判定为不支持——不做乱码硬解析。
// 抛出的Error上如果有err.unsupported===true，表示"压根不支持这个格式"（和PDF等一起计入"不支持"
// 列表）；普通Error表示"看起来是支持的格式但解析失败"（文件可能已损坏）。
// 读取File为ArrayBuffer/文本，用FileReader而不是较新的File.prototype.arrayBuffer()——
// 和这个项目里已有的"导入TXT"功能（handleImportTxt）保持同一套读取方式，兼容性更好，
// 避免在较老的浏览器/APK WebView环境里因为新API不可用导致读取直接失败。
function _readFileAsArrayBuffer(file){
  return new Promise(function(resolve,reject){
    var reader=new FileReader();
    reader.onload=function(ev){resolve(ev.target.result);};
    reader.onerror=function(){reject(new Error('文件读取失败'));};
    reader.onabort=function(){reject(new Error('文件读取被中断'));};
    reader.readAsArrayBuffer(file);
  });
}
// ==================== 旧版二进制Word(.doc)解析（OLE复合文档格式）====================
// 真正的.doc文件不是zip也不是HTML，而是"OLE复合文档"（CFBF）容器格式，正文本身按"分段表"
// (piece table)拆成若干段，每段各自可能是单字节(Windows-1252压缩)或双字节(UTF-16LE)编码存储，
// 需要按MS-DOC规范逐层解出：CFBF扇区链 → WordDocument/Table两个数据流 → FIB头里的分段表位置 →
// 逐段解码拼出正文。只做纯文本提取，不处理分栏/表格/图片/批注等格式信息；域代码（如页码域）
// 只保留域结果、丢弃域指令，避免把域代码本身当正文导入进去。
function _parseLegacyDoc(arrayBuffer){
  var bytes=new Uint8Array(arrayBuffer);
  var dv=new DataView(arrayBuffer);
  var sig=[0xD0,0xCF,0x11,0xE0,0xA1,0xB1,0x1A,0xE1];
  for(var si=0;si<8;si++){
    if(bytes.length<8||bytes[si]!==sig[si]){ throw new Error('不是有效的OLE复合文档格式'); }
  }
  var sectorShift=dv.getUint16(30,true);
  var sectorSize=1<<sectorShift;
  var miniSectorShift=dv.getUint16(32,true);
  var miniSectorSize=1<<miniSectorShift;
  var firstDirSector=dv.getUint32(48,true);
  var miniStreamCutoff=dv.getUint32(56,true);
  var firstMiniFatSector=dv.getUint32(60,true);
  var numMiniFatSectors=dv.getUint32(64,true);
  var firstDifatSector=dv.getUint32(68,true);
  var numDifatSectors=dv.getUint32(72,true);
  if(!(sectorSize>0&&sectorSize<=65536)){ throw new Error('文档扇区大小异常，文件可能已损坏'); }

  function sectorOffset(sec){ return 512+sec*sectorSize; }
  function readSector(sec){
    var off=sectorOffset(sec);
    if(off<0||off>=bytes.length){ return new Uint8Array(sectorSize); }
    if(off+sectorSize>bytes.length){
      var partial=new Uint8Array(sectorSize);
      partial.set(bytes.subarray(off,bytes.length));
      return partial;
    }
    return bytes.subarray(off,off+sectorSize);
  }

  var fatSectorIndices=[];
  for(var i=0;i<109;i++){
    var v=dv.getUint32(76+i*4,true);
    if(v===0xFFFFFFFF)break;
    fatSectorIndices.push(v);
  }
  var difatSec=firstDifatSector,difatCount=0,difatGuard=0;
  while(difatSec!==0xFFFFFFFE&&difatSec!==0xFFFFFFFF&&difatCount<numDifatSectors){
    if(difatGuard++>100000)break;
    var dsect=readSector(difatSec);
    var ddv2=new DataView(dsect.buffer,dsect.byteOffset,dsect.byteLength);
    for(var j=0;j<127;j++){
      var v2=ddv2.getUint32(j*4,true);
      if(v2===0xFFFFFFFF)break;
      fatSectorIndices.push(v2);
    }
    difatSec=ddv2.getUint32(127*4,true);
    difatCount++;
  }

  var fat=[];
  fatSectorIndices.forEach(function(sec){
    var s=readSector(sec);
    var sdv=new DataView(s.buffer,s.byteOffset,s.byteLength);
    var entriesPerSector=sectorSize/4;
    for(var k=0;k<entriesPerSector;k++){ fat.push(sdv.getUint32(k*4,true)); }
  });

  function readChainToEnd(startSector){
    var chunks=[],sec=startSector,guard=0,total=0;
    while(sec!==0xFFFFFFFE&&sec!==0xFFFFFFFF){
      if(guard++>2000000){ throw new Error('文档内部结构异常（扇区链循环），文件可能已损坏'); }
      if(sec<0||sec>=fat.length)break;
      var s=readSector(sec);
      chunks.push(s);
      total+=s.length;
      sec=fat[sec];
    }
    var out=new Uint8Array(total),pos=0;
    chunks.forEach(function(c){out.set(c,pos);pos+=c.length;});
    return out;
  }
  function readChain(startSector,size){
    var full=readChainToEnd(startSector);
    return (size!=null&&size<full.length)?full.subarray(0,size):full;
  }

  var dirBytes=readChainToEnd(firstDirSector);
  var numDirEntries=Math.floor(dirBytes.length/128);
  if(numDirEntries===0){ throw new Error('不是有效的doc文件（缺少目录结构）'); }
  var entries=[];
  var dirDv=new DataView(dirBytes.buffer,dirBytes.byteOffset,dirBytes.byteLength);
  for(var e=0;e<numDirEntries;e++){
    var base=e*128;
    var nameLen=dirDv.getUint16(base+64,true);
    var objType=dirBytes[base+66];
    if(objType===0)continue;
    var name='';
    if(nameLen>2&&nameLen<=64){
      name=new TextDecoder('utf-16le').decode(dirBytes.subarray(base,base+nameLen-2));
    }
    entries.push({
      name:name,type:objType,
      start:dirDv.getUint32(base+116,true),
      size:dirDv.getUint32(base+120,true) // Word文档不会超过4GB，只读低32位足够
    });
  }

  var rootEntry=entries.filter(function(en){return en.type===5;})[0];
  if(!rootEntry){ throw new Error('不是有效的doc文件（缺少根目录项）'); }

  var miniFat=[];
  if(numMiniFatSectors>0){
    var miniFatBytes=readChainToEnd(firstMiniFatSector);
    var mfDv=new DataView(miniFatBytes.buffer,miniFatBytes.byteOffset,miniFatBytes.byteLength);
    for(var m=0;m<Math.floor(miniFatBytes.length/4);m++){ miniFat.push(mfDv.getUint32(m*4,true)); }
  }
  var miniStreamData=readChain(rootEntry.start,rootEntry.size);

  function readMiniChain(startSector,size){
    var chunks=[],sec=startSector,guard=0,total=0;
    while(sec!==0xFFFFFFFE&&sec!==0xFFFFFFFF){
      if(guard++>2000000){ throw new Error('文档内部结构异常（迷你扇区链循环），文件可能已损坏'); }
      if(sec<0||sec>=miniFat.length)break;
      var off=sec*miniSectorSize;
      var chunk=miniStreamData.subarray(off,Math.min(off+miniSectorSize,miniStreamData.length));
      chunks.push(chunk);
      total+=chunk.length;
      sec=miniFat[sec];
    }
    var out=new Uint8Array(total),pos=0;
    chunks.forEach(function(c){out.set(c,pos);pos+=c.length;});
    return (size!=null&&size<out.length)?out.subarray(0,size):out;
  }
  function readStream(entry){
    return entry.size<miniStreamCutoff?readMiniChain(entry.start,entry.size):readChain(entry.start,entry.size);
  }

  var wdEntry=entries.filter(function(en){return en.name==='WordDocument';})[0];
  if(!wdEntry){ throw new Error('不是有效的doc文件（缺少WordDocument数据流）'); }
  var wd=readStream(wdEntry);
  if(wd.length<34){ throw new Error('文档头部数据不完整，文件可能已损坏'); }
  var wdv=new DataView(wd.buffer,wd.byteOffset,wd.byteLength);
  if(wdv.getUint16(0,true)!==0xA5EC){ throw new Error('不是有效的doc文件（文件头签名不匹配）'); }

  var flags1=wdv.getUint16(0x0A,true);
  var fWhichTblStm=(flags1>>9)&1;
  var tableName=fWhichTblStm?'1Table':'0Table';
  var tableEntry=entries.filter(function(en){return en.name===tableName;})[0];
  if(!tableEntry){ throw new Error('不是有效的doc文件（缺少'+tableName+'数据流）'); }
  var table=readStream(tableEntry);

  var csw=wdv.getUint16(32,true);
  var cslwOffset=34+csw*2;
  if(cslwOffset+2>wd.length){ throw new Error('文档头部结构异常，文件可能已损坏'); }
  var cslw=wdv.getUint16(cslwOffset,true);
  var fibRgLwOffset=cslwOffset+2;
  if(fibRgLwOffset+cslw*4>wd.length){ throw new Error('文档头部结构异常，文件可能已损坏'); }
  var ccpText=wdv.getInt32(fibRgLwOffset+3*4,true);
  if(!(ccpText>0)){ throw new Error('文档不包含正文内容（可能是空白文档）'); }

  var cbRgFcLcbOffset=fibRgLwOffset+cslw*4;
  if(cbRgFcLcbOffset+2>wd.length){ throw new Error('文档头部结构异常，文件可能已损坏'); }
  var cbRgFcLcb=wdv.getUint16(cbRgFcLcbOffset,true);
  var fcLcbArrayOffset=cbRgFcLcbOffset+2;
  if(cbRgFcLcb<34){ throw new Error('文档版本过旧或结构不完整，无法定位正文位置表'); }
  var fcClxOffset=fcLcbArrayOffset+33*8; // fibRgFcLcb97数组第33项固定是fcClx/lcbClx（分段表位置）
  if(fcClxOffset+8>wd.length){ throw new Error('文档头部结构异常，文件可能已损坏'); }
  var fcClx=wdv.getUint32(fcClxOffset,true);
  var lcbClx=wdv.getUint32(fcClxOffset+4,true);
  if(!(lcbClx>0)||fcClx+lcbClx>table.length){ throw new Error('未能定位到正文分段表，文档可能已损坏或使用了不支持的特性'); }

  var clx=table.subarray(fcClx,fcClx+lcbClx);
  var clxDv=new DataView(clx.buffer,clx.byteOffset,clx.byteLength);
  var pos=0,pcdtData=null,clxGuard=0;
  while(pos<clx.length){
    if(clxGuard++>100000)break;
    var marker=clx[pos];
    if(marker===1){
      if(pos+3>clx.length)break;
      var cbGrpprl=clxDv.getUint16(pos+1,true);
      pos+=3+cbGrpprl;
    }else if(marker===2){
      if(pos+5>clx.length)break;
      var lcb=clxDv.getUint32(pos+1,true);
      pcdtData=clx.subarray(pos+5,Math.min(pos+5+lcb,clx.length));
      break;
    }else{
      break;
    }
  }
  if(!pcdtData||pcdtData.length<16){ throw new Error('未能解析正文分段表，文档可能使用了不支持的高级特性'); }

  var n=Math.floor((pcdtData.length-4)/12);
  if(n<=0){ throw new Error('文档不包含可提取的正文段落'); }
  var pcdtDv=new DataView(pcdtData.buffer,pcdtData.byteOffset,pcdtData.byteLength);
  var cps=[];
  for(var ci=0;ci<=n;ci++){ cps.push(pcdtDv.getInt32(ci*4,true)); }

  var pieces=[];
  var pcdBase=(n+1)*4;
  for(var pi=0;pi<n;pi++){
    var pcdOff=pcdBase+pi*8;
    if(pcdOff+8>pcdtData.length)break;
    var fcRaw=pcdtDv.getUint32(pcdOff+2,true);
    var fCompressed=(fcRaw>>>30)&1;
    var fc=fcRaw&0x3FFFFFFF;
    if(fCompressed)fc=Math.floor(fc/2);
    var charCount=Math.max(0,cps[pi+1]-cps[pi]);
    pieces.push({fc:fc,compressed:!!fCompressed,charCount:charCount});
  }
  if(pieces.length===0){ throw new Error('文档不包含可提取的正文段落'); }

  var win1252Decoder,utf16Decoder;
  try{ win1252Decoder=new TextDecoder('windows-1252'); }catch(e1){ win1252Decoder=new TextDecoder('utf-8'); }
  try{ utf16Decoder=new TextDecoder('utf-16le'); }catch(e2){ throw new Error('当前浏览器不支持Unicode解码，无法解析该文档'); }

  var textParts=[];
  var consumed=0;
  for(var qi=0;qi<pieces.length;qi++){
    if(consumed>=ccpText)break;
    var pc=pieces[qi];
    var take=Math.min(pc.charCount,ccpText-consumed);
    if(take<=0)continue;
    if(pc.compressed){
      var raw=wd.subarray(pc.fc,Math.min(pc.fc+take,wd.length));
      textParts.push(win1252Decoder.decode(raw));
    }else{
      var raw2=wd.subarray(pc.fc,Math.min(pc.fc+take*2,wd.length));
      textParts.push(utf16Decoder.decode(raw2));
    }
    consumed+=take;
  }

  var rawText=textParts.join('');
  // 域代码只保留域结果、丢弃域指令：0x13开始，0x14分隔指令/结果，0x15结束
  var cleaned='';
  var skippingFieldCode=false;
  for(var ti=0;ti<rawText.length;ti++){
    var code=rawText.charCodeAt(ti);
    if(code===0x13){ skippingFieldCode=true; continue; }
    if(code===0x14){ skippingFieldCode=false; continue; }
    if(code===0x15){ continue; }
    if(skippingFieldCode)continue;
    if(code===0x0D||code===0x0B){ cleaned+='\n'; continue; } // 段落标记/软换行
    if(code===0x07){ cleaned+='\t'; continue; } // 表格单元格/行标记
    if(code<0x20&&code!==0x09){ continue; } // 其余控制字符丢弃（保留Tab）
    cleaned+=rawText[ti];
  }
  cleaned=cleaned.replace(/\n{3,}/g,'\n\n').trim();
  if(!cleaned){ throw new Error('文档内容为空或未能提取到有效文字'); }
  return cleaned;
}
// 判断+解析一个导入文件的单个文件。返回{title,rawText}（txt/md/doc-html/docx/doc-legacy，交由调用方按用户
// 选择的分章方式再切分）或{title,realChapters}（epub——已经有OPF清单给出的真实章节边界，
// 不需要也不应该再用通用文本规则重新切分一遍）。
// 支持txt/md（纯文本）、epub、docx，以及doc——doc按内容特征判断：文件头是zip结构就当.docx解析
// （很多人电脑上的"doc"其实就是docx），是本应用自己导出的那种HTML内容就直接转纯文本，两者都不是
// 就是真正的旧版二进制Word格式，交给_parseLegacyDoc完整解析（OLE复合文档结构化提取，不是乱码硬解析）。
// 抛出的Error上如果有err.unsupported===true，表示"压根不支持这个格式，或者虽是doc但解析失败"
// （和PDF等一起计入"不支持"列表）；普通Error表示"看起来是支持的格式但解析失败"（文件可能已损坏）。
async function _classifyAndParseFile(file){
  var ext=(file.name.split('.').pop()||'').toLowerCase();
  var buf=await _readFileAsArrayBuffer(file);
  var bytes=new Uint8Array(buf);
  var isZip=bytes.length>=4&&bytes[0]===0x50&&bytes[1]===0x4B&&bytes[2]===0x03&&bytes[3]===0x04;
  if(ext==='txt'||ext==='md'){
    var text=new TextDecoder('utf-8').decode(buf);
    if(!text.trim()){var eEmpty=new Error('文件内容为空');throw eEmpty;}
    return {title:file.name.replace(/\.[^.]+$/,''),rawText:text};
  }
  if(ext==='epub'){
    if(!isZip){var eBad1=new Error('epub文件已损坏（不是有效的压缩包）');throw eBad1;}
    var epubResult=await _parseEpubFile(buf,file.name);
    return {title:epubResult.title,realChapters:epubResult.chapters};
  }
  if(ext==='docx'){
    if(!isZip){var eBad2=new Error('docx文件已损坏（不是有效的压缩包）');throw eBad2;}
    var docxResult=await _parseDocxFile(buf,file.name);
    return {title:docxResult.title,rawText:docxResult.chapters[0]};
  }
  if(ext==='doc'){
    if(isZip){
      var docxResult2=await _parseDocxFile(buf,file.name);
      return {title:docxResult2.title,rawText:docxResult2.chapters[0]};
    }
    var text2=new TextDecoder('utf-8').decode(buf);
    if(/<html[\s>]/i.test(text2)||/<body[\s>]/i.test(text2)){
      var plain=_htmlToPlainText(text2);
      if(!plain.trim()){var eEmpty2=new Error('文件内容为空');throw eEmpty2;}
      return {title:file.name.replace(/\.[^.]+$/,''),rawText:plain};
    }
    try{
      var legacyText=_parseLegacyDoc(buf);
      return {title:file.name.replace(/\.[^.]+$/,''),rawText:legacyText};
    }catch(legacyErr){
      var eLegacy=new Error('无法解析该doc文件：'+((legacyErr&&legacyErr.message)||'格式不受支持'));
      eLegacy.unsupported=true;
      throw eLegacy;
    }
  }
  var eOther=new Error('不支持的文件格式');
  eOther.unsupported=true;
  throw eOther;
}
// 导入结果汇总弹窗，创作工具箱和收藏页两处导入共用
function _showImportSummaryDlg(folderName,okCount,failList,skippedOther){
  var html='<div style="font-size:12px;line-height:1.8;color:var(--text)">';
  html+='已导入到文件夹「'+esc(folderName)+'」：<br><b style="color:var(--accent2)">成功 '+okCount+' 篇</b>';
  var totalSkipped=(failList?failList.length:0)+(skippedOther?skippedOther.length:0);
  if(totalSkipped>0){
    html+='，跳过 '+totalSkipped+' 个<br><span style="font-size:11px;color:var(--text2)">只导入了支持的文件类型（txt/md/doc/epub）';
    if(skippedOther&&skippedOther.length>0){
      html+='，其中不支持的格式（如PDF、压缩包等）'+skippedOther.length+'个';
    }
    if(failList&&failList.length>0){
      html+='，解析失败'+failList.length+'个';
    }
    html+='</span>';
    // 列出具体哪些文件失败、失败原因是什么，方便定位问题（而不是只给一个笼统的数字）
    if(failList&&failList.length>0){
      html+='<div style="margin-top:10px;max-height:140px;overflow-y:auto;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:8px">';
      failList.slice(0,20).forEach(function(f){
        html+='<div style="font-size:10.5px;color:var(--text2);padding:3px 0;border-bottom:1px solid var(--border)"><b style="color:var(--text)">'+esc(f.name)+'</b>：'+esc(f.reason)+'</div>';
      });
      if(failList.length>20){
        html+='<div style="font-size:10.5px;color:var(--text2);padding:3px 0">...还有 '+(failList.length-20)+' 个</div>';
      }
      html+='</div>';
    }
  }
  html+='</div>';
  showDlg('导入完成',html,function(){},false,true);
  setTimeout(function(){
    var p=document.getElementById('dlgMsg');
    if(p){p.style.maxHeight='60vh';p.style.overflowY='auto';}
  },50);
}

// ---- 创作工具箱：导入文件（单个或多个，不问文件夹，直接放进"未分类"）----
function handleImportCrFiles(event){
  var fileList=Array.prototype.slice.call(event.target.files||[]);
  event.target.value='';// 立即清空，允许用户之后重新选择同样的文件再导入一次
  if(fileList.length===0)return;
  var supportedExts={txt:1,md:1,doc:1,docx:1,epub:1};
  var supportedFiles=[];
  var skippedOther=[];
  fileList.forEach(function(f){
    var ext=(f.name.split('.').pop()||'').toLowerCase();
    if(supportedExts[ext])supportedFiles.push(f);
    else skippedOther.push(f.name);
  });
  if(supportedFiles.length===0){
    showDlg('导入文件','没有找到可导入的txt/md/doc/epub文件。'+(skippedOther.length>0?'<br><br>已跳过 '+skippedOther.length+' 个不支持的文件（如PDF、压缩包等）。':''),function(){},false,true);
    return;
  }
  _showBatchImportSettingsDlg(supportedFiles,skippedOther,'',function(mode,rule,customSep){
    _runImportCrFiles(supportedFiles,skippedOther,mode,rule,customSep);
  });
}
async function _runImportCrFiles(files,skippedOther,mode,rule,customSep){
  showToast('正在导入，请稍候...',3000);
  try{
    var okCount=0;
    var failList=[];
    for(var i=0;i<files.length;i++){
      var f=files[i];
      try{
        var parsed=await _classifyAndParseFile(f);
        var chapters;
        if(parsed.realChapters){
          chapters=parsed.realChapters;
        }else if(mode==='single'){
          chapters=[(parsed.rawText||'').trim()];
        }else{
          chapters=splitTxtToChapters(parsed.rawText||'',rule,rule==='custom'?customSep:undefined);
        }
        chapters=(chapters||[]).map(function(c){return (c||'').trim();}).filter(function(c){return c;});
        if(chapters.length===0){ failList.push({name:f.name,reason:'没有识别到有效内容'}); continue; }
        var isNovel=chapters.length>1;
        var work={
          id:uid(),
          type:isNovel?'novel':'draft',
          title:(parsed.title||f.name.replace(/\.[^.]+$/,'')).trim()||'导入的文本',
          createdAt:new Date().toISOString(),
          updatedAt:new Date().toISOString()
        };
        if(isNovel){ work.chapters=chapters; } else { work.content=chapters[0]; }
        crWorks.unshift(work);
        okCount++;
      }catch(fileErr){
        failList.push({name:f.name,reason:(fileErr&&fileErr.message)||'解析失败'});
      }
    }
    if(okCount>0){ sv('bj_crWorks',crWorks); renderCrList(); }
    _showImportSummaryDlg('未分类',okCount,failList,skippedOther);
  }catch(err){
    showDlg('导入失败','导入过程中出现意外错误：'+((err&&err.message)||'未知错误'),function(){},true);
  }
}

// ---- 创作工具箱：导入本地文件夹 ----
// ---- 创作工具箱：导入本地文件夹（批量），先统一设置导入方式/分章规则，再应用到每个文件 ----
// "手动分章"需要针对单篇内容手动粘贴/编辑，批量导入面对多个不同文件没法统一操作，所以这里
// 只提供"自动分章"和"整篇导入"两种批量方式；epub本身已有真实的章节结构（来自内部目录），
// 不受这里选择的分章方式影响，始终按自己的章节导入。
var _batchImportMode='auto';
var _batchImportRule='blank';
function handleImportCrLocalFolder(event){
  var fileList=Array.prototype.slice.call(event.target.files||[]);
  event.target.value='';// 立即清空，允许用户之后重新选择同一个文件夹再导入一次
  if(fileList.length===0)return;
  var supportedExts={txt:1,md:1,doc:1,docx:1,epub:1};
  var supportedFiles=[];
  var skippedOther=[];
  fileList.forEach(function(f){
    var ext=(f.name.split('.').pop()||'').toLowerCase();
    if(supportedExts[ext])supportedFiles.push(f);
    else skippedOther.push(f.name);
  });
  if(supportedFiles.length===0){
    showDlg('导入本地文件夹','这个文件夹里没有找到可导入的txt/md/doc/epub文件。'+(skippedOther.length>0?'<br><br>已跳过 '+skippedOther.length+' 个不支持的文件（如PDF、压缩包等）。':''),function(){},false,true);
    return;
  }
  var defaultName='';
  var firstPath=fileList[0].webkitRelativePath||'';
  if(firstPath.indexOf('/')>=0)defaultName=firstPath.split('/')[0];
  _showBatchImportSettingsDlg(supportedFiles,skippedOther,defaultName,function(mode,rule,customSep){
    _crBatchAskFolderName(supportedFiles,skippedOther,defaultName,mode,rule,customSep);
  });
}
function _showBatchImportSettingsDlg(files,skippedOther,defaultFolderName,onNext){
  _batchImportMode='auto';
  _batchImportRule='blank';
  var html='<p style="font-size:12px;color:var(--text2);margin-bottom:12px">共 '+files.length+' 个文件，下面的设置会统一应用到每一篇（epub除外，epub会按自身目录结构导入）</p>'+
    '<div class="fg"><label class="fl">导入方式</label><div style="display:flex;gap:8px;margin-top:6px">'+
    '<span class="tag act" id="batchImpModeAuto" onclick="_setBatchImportMode(\'auto\',this)"><i class="fas fa-robot"></i> 自动分章</span>'+
    '<span class="tag" id="batchImpModeSingle" onclick="_setBatchImportMode(\'single\',this)"><i class="fas fa-file"></i> 整篇导入</span>'+
    '</div></div>'+
    '<div id="batchImpAutoSettings" style="margin-top:10px">'+
    '<div class="fg"><label class="fl">分章规则</label><div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px">'+
    '<span class="tag act" id="batchImpRuleBlank" onclick="_setBatchImportRule(\'blank\',this)">按连续空行</span>'+
    '<span class="tag" id="batchImpRuleChapter" onclick="_setBatchImportRule(\'chapter\',this)">按"第X章"</span>'+
    '<span class="tag" id="batchImpRuleCustom" onclick="_setBatchImportRule(\'custom\',this)">自定义分隔符</span>'+
    '</div></div>'+
    '<div id="batchImpCustomSep" style="display:none;margin-top:8px"><input class="fi" id="batchImpSepInput" placeholder="输入分隔文字，如：---、===、***"></div>'+
    '</div>';
  showDlg('批量导入设置',html,function(){},false,true);
  var okBtn=document.getElementById('dlgOkBtn');
  if(okBtn){
    okBtn.style.display='';
    okBtn.textContent='下一步';
    okBtn.onclick=function(){
      var mode=_batchImportMode;
      var rule=_batchImportRule;
      var sepEl=document.getElementById('batchImpSepInput');
      var customSep=sepEl?sepEl.value:'';
      closeDlg();
      onNext(mode,rule,customSep);
    };
  }
}
function _setBatchImportMode(mode,el){
  _batchImportMode=mode;
  el.parentElement.querySelectorAll('.tag').forEach(function(t){t.classList.remove('act');});
  el.classList.add('act');
  var settingsEl=document.getElementById('batchImpAutoSettings');
  if(settingsEl)settingsEl.style.display=(mode==='auto')?'':'none';
}
function _setBatchImportRule(rule,el){
  _batchImportRule=rule;
  el.parentElement.querySelectorAll('.tag').forEach(function(t){t.classList.remove('act');});
  el.classList.add('act');
  var sepWrap=document.getElementById('batchImpCustomSep');
  if(sepWrap)sepWrap.style.display=(rule==='custom')?'':'none';
}
// ---- 导入时选择"放进已有文件夹"还是"新建文件夹"，creation工具箱批量导入/收藏页单文件导入共用 ----
var _importFolderChoiceCtx=null; // {scope:'cr'|'col', defaultName, onFolderId}
function _openImportFolderChoice(scope,defaultName,onFolderId){
  var folders=scope==='cr'?crFolders:cols.folders;
  if(!folders||folders.length===0){
    // 还没有任何文件夹可选，直接进入"新建文件夹"，不用多弹一层空列表出来选
    _askNewImportFolderName(scope,defaultName,onFolderId);
    return;
  }
  _importFolderChoiceCtx={scope:scope,defaultName:defaultName,onFolderId:onFolderId};
  var listEl=document.getElementById('importFolderChoiceList');
  if(!listEl)return;
  var html='';
  folders.forEach(function(f){
    html+='<button class="col-fp-item" onclick="_pickImportFolderChoice(\''+f.id+'\')"><span>'+esc(f.name||'未命名文件夹')+'</span></button>';
  });
  html+='<button class="col-fp-item" style="border-style:dashed;color:var(--accent2)" onclick="_pickImportFolderChoice(\'\')"><span><i class="fas fa-plus" style="font-size:10px"></i> 新建文件夹</span></button>';
  listEl.innerHTML=html;
  document.getElementById('importFolderChoiceOv').classList.add('show');
  navPush('importFolderChoiceOv');
}
function closeImportFolderChoice(){
  navPop('importFolderChoiceOv');
  document.getElementById('importFolderChoiceOv').classList.remove('show');
  _importFolderChoiceCtx=null;
}
function _pickImportFolderChoice(folderId){
  var ctx=_importFolderChoiceCtx;
  navPop('importFolderChoiceOv');
  document.getElementById('importFolderChoiceOv').classList.remove('show');
  _importFolderChoiceCtx=null;
  if(!ctx)return;
  if(folderId){
    ctx.onFolderId(folderId);
  }else{
    _askNewImportFolderName(ctx.scope,ctx.defaultName,ctx.onFolderId);
  }
}
function _askNewImportFolderName(scope,defaultName,onFolderId){
  showInp('新建文件夹','请输入文件夹名称',function(name){
    name=(name||'').trim();
    if(!name)return;
    var newId=scope==='cr'?_createCrFolder(name):_createColFolder(name);
    onFolderId(newId);
  });
  setTimeout(function(){var el=document.getElementById('inpField');if(el)el.value=defaultName;},120);
}
function _crBatchAskFolderName(files,skippedOther,defaultName,mode,rule,customSep){
  _openImportFolderChoice('cr',defaultName,function(folderId){
    _runImportCrLocalFolder(files,skippedOther,folderId,mode,rule,customSep);
  });
}
async function _runImportCrLocalFolder(files,skippedOther,folderId,mode,rule,customSep){
  showToast('正在导入，请稍候...',3000);
  try{
    var newFolderId=folderId;
    var folderName=_crFolderName(newFolderId);
    var okCount=0;
    var failList=[];
    for(var i=0;i<files.length;i++){
      var f=files[i];
      try{
        var parsed=await _classifyAndParseFile(f);
        var chapters;
        if(parsed.realChapters){
          chapters=parsed.realChapters;
        }else if(mode==='single'){
          chapters=[parsed.rawText];
        }else{
          chapters=splitTxtToChapters(parsed.rawText,rule,customSep);
        }
        if(!chapters||chapters.length===0||!chapters.some(function(c){return c&&c.trim();})){
          var eNoContent=new Error('没有识别到有效内容');throw eNoContent;
        }
        var w={
          id:uid(),type:'novel',
          title:parsed.title||f.name.replace(/\.[^.]+$/,''),
          chapters:chapters,
          folderId:newFolderId,
          createdAt:new Date().toISOString(),
          updatedAt:new Date().toISOString()
        };
        crWorks.push(w);
        okCount++;
      }catch(err){
        failList.push({name:f.name,reason:(err&&err.unsupported)?'不支持的格式':((err&&err.message)||'解析失败')});
      }
    }
    sv('bj_crWorks',crWorks);
    renderCrFolderDrawerList();
    if(document.getElementById('crFolderDetailOv').classList.contains('show'))renderCrFolderDetailList();
    _showImportSummaryDlg(folderName,okCount,failList,skippedOther);
  }catch(outerErr){
    logError('op',outerErr);
    showDlg('导入出错','导入过程中出现意外错误：'+esc((outerErr&&outerErr.message)||'未知错误')+'，请重试或换一批文件试试。',function(){},false,true);
  }
}

// ---- 收藏页：导入本地文件（每次一个，可选类型；长篇复用"导入TXT"弹窗选择分章方式） ----
function handleImportColLocalFile(event){
  var file=event.target.files&&event.target.files[0];
  event.target.value='';
  if(!file)return;
  var ext=(file.name.split('.').pop()||'').toLowerCase();
  var supportedExts={txt:1,md:1,doc:1,docx:1,epub:1};
  if(!supportedExts[ext]){
    showDlg('导入本地文件','不支持的文件格式（仅支持 txt / md / doc / epub）。',function(){},false,true);
    return;
  }
  var typeHtml='<p style="font-size:12px;color:var(--text2);margin-bottom:14px">「'+esc(file.name)+'」导入为：</p>'+
    '<div style="display:flex;flex-direction:column;gap:10px">'+
    '<button onclick="window._colImportPickType(\'book\')" style="padding:12px 16px;border-radius:12px;border:1px solid var(--border);background:var(--card);color:var(--text);font-size:13px;cursor:pointer;text-align:left"><b><i class="fas fa-book"></i> 长篇小说</b><div style="font-size:10px;color:var(--text2);margin-top:3px">可设置自动分章/整篇导入/手动分章</div></button>'+
    '<button onclick="window._colImportPickType(\'short\')" style="padding:12px 16px;border-radius:12px;border:1px solid var(--border);background:var(--card);color:var(--text);font-size:13px;cursor:pointer;text-align:left"><b><i class="fas fa-feather"></i> 短篇/单篇</b><div style="font-size:10px;color:var(--text2);margin-top:3px">整篇作为一篇短篇导入，不分章</div></button>'+
    '</div>';
  showDlg('选择导入类型',typeHtml,function(){},false,true);
  var okBtn=document.getElementById('dlgOkBtn');
  if(okBtn)okBtn.style.display='none';
  window._colImportPickType=function(kind){
    closeDlg();
    _colImportAskFolderName(file,kind);
  };
}
function _colImportAskFolderName(file,kind){
  var defaultName=file.name.replace(/\.[^.]+$/,'');
  _openImportFolderChoice('col',defaultName,function(folderId){
    var folderName=_colFolderName(folderId);
    if(kind==='short'){
      _importColShortFile(file,folderId,folderName);
    }else{
      _importColBookFile(file,folderId,folderName);
    }
  });
}
function _importColShortFile(file,folderId,folderName){
  showToast('正在导入...',3000);
  _classifyAndParseFile(file).then(function(parsed){
    var content=parsed.realChapters?parsed.realChapters.join('\n\n'):(parsed.rawText||'');
    if(!content.trim()){
      showDlg('导入失败','「'+esc(file.name)+'」内容为空。',function(){},false,true);
      return;
    }
    var short={
      id:uid(),type:'short',
      title:parsed.title||file.name.replace(/\.[^.]+$/,''),
      content:content,tags:[],rating:0,folderId:folderId,
      createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()
    };
    cols.shorts.push(short);
    sv(K.cols,cols);
    renderColFolderDrawerList();
    if(document.getElementById('colFolderDetailOv').classList.contains('show'))renderColFolderDetailList();
    renderCollections();
    showToast('已导入到「'+folderName+'」：'+countWords(content)+'字',3000);
  }).catch(function(err){
    logError('op',err);
    showDlg('导入失败','「'+esc(file.name)+'」解析失败：'+esc((err&&err.message)||'未知错误'),function(){},false,true);
  });
}
function _importColBookFile(file,folderId,folderName){
  showToast('正在解析文件...',3000);
  _classifyAndParseFile(file).then(function(parsed){
    if(parsed.realChapters){
      // epub已经有真实的章节结构（来自内部目录），不需要再让用户选分章方式，直接导入
      var chapters=parsed.realChapters;
      var book={
        id:uid(),type:'long',title:parsed.title||file.name.replace(/\.[^.]+$/,''),
        chapters:chapters,cover:null,status:'ongoing',rating:0,folderId:folderId,
        createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()
      };
      cols.books.push(book);
      sv(K.cols,cols);
      renderColFolderDrawerList();
      if(document.getElementById('colFolderDetailOv').classList.contains('show'))renderColFolderDetailList();
      renderCollections();
      var totalWc=0;chapters.forEach(function(ch){totalWc+=countWords(ch);});
      showToast('已导入到「'+folderName+'」：'+chapters.length+'章 · '+totalWc+'字',3000);
      return;
    }
    // 其它格式：复用"导入TXT"弹窗，让用户像单篇导入一样选择自动分章/整篇导入/手动分章
    importTxtRawText=parsed.rawText||'';
    document.getElementById('importTxtTitle').value=parsed.title||file.name.replace(/\.[^.]+$/,'');
    document.getElementById('importTxtInfo').textContent='文件已加载：'+file.name+' ('+countWords(importTxtRawText)+'字)';
    importTxtMode='auto';
    importTxtRule='blank';
    document.getElementById('importModeAuto').classList.add('act');
    document.getElementById('importModeSingle').classList.remove('act');
    document.getElementById('importModeManual').classList.remove('act');
    document.getElementById('importAutoSettings').style.display='';
    document.getElementById('importManualSettings').style.display='none';
    updateImportPreview();
    _importTxtTarget={mode:'col',folderId:folderId,folderName:folderName};
    document.getElementById('importTxtOv').classList.add('show');
    navPush('importTxtOv');
  }).catch(function(err){
    logError('op',err);
    showDlg('导入失败','「'+esc(file.name)+'」解析失败：'+esc((err&&err.message)||'未知错误'),function(){},false,true);
  });
}

function buildTxtContent(title,chapters,isAI){
let content='';
if(isAI){
content+='════════════════════════════════════════\n';
content+='　　　　　　「'+title+'」\n';
content+='════════════════════════════════════════\n\n';
content+='【声明】\n';
content+='本文由「星叙」辅助创作生成\n';
content+='创作工具：星叙 · AI辅助创作工坊\n';
content+='工具作者：心田\n';
content+='导出时间：'+new Date().toLocaleString()+'\n\n';
content+='【AI创作提示】\n';
content+='本文内容由AI辅助生成，仅供参考和娱乐。\n';
content+='AI生成的内容可能存在事实错误或不当表述，\n';
content+='请读者自行甄别，切勿作为专业依据。\n';
content+='如需转载或发布，请注明AI辅助创作。\n\n';
content+='════════════════════════════════════════\n';
content+='　　　　　　　正　文　开　始\n';
content+='════════════════════════════════════════\n\n\n';
}else{
content+='════════════════════════════════════════\n';
content+='　　　　　　「'+title+'」\n';
content+='════════════════════════════════════════\n\n';
content+='导出时间：'+new Date().toLocaleString()+'\n';
content+='创作工具：星叙\n\n';
content+='════════════════════════════════════════\n\n\n';
}
// 正文：多章节时给每章前面加一个纯文本"第N章"标题分隔，和Word/长图等其它导出格式的章节标注方式保持一致。
// 原代码这里错误引用了未声明的md变量（明显是从下面buildMdContent函数里的Markdown目录/标题逻辑误粘贴过来的：
// 变量名和"## "Markdown标题语法都是buildMdContent专用的，没有清理干净），只要导出多章节的长篇小说就会直接
// 报 ReferenceError 崩溃。Markdown的锚点目录在纯文本里没有对应形式也用不上，这里直接删掉；
// 每章的"##"标题改成纯文本"第N章"，写回真正在用的content变量。
if(Array.isArray(chapters)){
chapters.forEach(function(ch,i){
content+='第'+(i+1)+'章\n\n';
content+=(ch||'').trim()+'\n\n\n';
});
}else{
content+=(chapters||'').trim()+'\n\n';
}
// 结尾
if(isAI){
content+='\n════════════════════════════════════════\n';
content+='　　　　　　　正　文　结　束\n';
content+='════════════════════════════════════════\n\n';
content+='【关于星叙】\n';
content+='星叙是一款基于大语言模型的AI辅助创作工坊，\n';
content+='帮助创作者快速生成高质量的小说、散文等文学作品。\n\n';
content+='功能特色：\n';
content+='· 长篇连载 & 短篇一发\n';
content+='· 自定义人物、世界观、文风、规则\n';
content+='· AI续写、扩写、缩写、重写\n';
content+='· 章节大纲管理\n';
content+='· 多主题界面美化\n\n';
content+='工具作者：心田\n';
content+='联系方式：\n';
content+='· 小红书：27418565861\n';
content+='· （推荐）邮箱：a13380324832@qq.com\n';
content+='· QQ：962005530\n\n';
content+='════════════════════════════════════════\n';
content+='感谢使用星叙，祝创作愉快！\n';
content+='════════════════════════════════════════\n';
}else{
content+='\n════════════════════════════════════════\n';
content+='导出自：星叙 · 创作工具\n';
content+='════════════════════════════════════════\n';
}
return content;
}
function buildMdContent(title,chapters,isAI){
var now=new Date();
var dateStr=now.toLocaleDateString('zh-CN',{year:'numeric',month:'long',day:'numeric'});
var timeStr=now.toLocaleString();
var md='';
md+='---\n';
md+='title: '+title+'\n';
md+='date: '+dateStr+'\n';
md+='tool: 星叙 · AI辅助创作工坊\n';
md+='author: 心田\n';
if(isAI){md+='note: 本文由AI辅助创作生成\n';}
md+='---\n\n';
md+='# '+title+'\n\n';
if(isAI){
md+='> ⚠️ **AI 创作声明**\n';
md+='>\n';
md+='> 本文由「**星叙**」辅助创作生成，内容仅供参考与娱乐。\n';
md+='> AI生成的内容可能存在事实偏差，请读者自行甄别；如需转载请注明 AI 辅助创作。\n\n';
}else{
md+='> 📝 *本文由星叙创作工坊辅助整理*\n\n';
}
md+='**导出时间**：'+timeStr+'　　**工具**：星叙\n\n';
md+='---\n\n';
if(Array.isArray(chapters)){
chapters.forEach(function(ch,i){
md+='## 第'+(i+1)+'章\n\n';
md+=(ch||'').trim()+'\n\n';
if(i<chapters.length-1){md+='---\n\n';}
});
}else{
md+=(chapters||'').trim()+'\n\n';
}
md+='\n---\n\n';
if(isAI){
md+='## 关于 星叙\n\n';
md+='星叙 是一款基于大语言模型的 AI 创作工坊，帮助创作者快速生成高质量的小说、散文等文学作品。\n\n';
md+='**功能特色**\n\n';
md+='- 📖 长篇连载 & 短篇一发\n';
md+='- 🎭 自定义人物、世界观、文风、规则\n';
md+='- ✍️ AI续写、扩写、缩写、重写\n';
md+='- 🎨 章节大纲管理 & 多主题界面\n\n';
md+='**联系作者（心田）**\n\n';
md+='- 📕 小红书：27418565861\n';
md+='- 📧 邮箱：a13380324832@qq.com\n';
md+='- 💬 QQ：962005530\n\n';
}else{
md+='*导出自 **星叙** · 工具作者：心田*\n';
}
return md;
}
// ==================== 长图 (.png) 导出 ====================
// 背景：原"EPUB草稿(.html)"格式下线，改为导出长图，方便直接分享到社交平台。
// 规则：短篇（含草稿）直接导出全文一张图；长篇必须先选择一个章节，仅导出该章节内容——
// 不支持整本小说合并导出成一张图，避免篇幅越长图片越畸高、越容易卡顿或超出画布尺寸上限。
// 配色跟随当前网页主题：直接读取 body 上当前生效的 --bg/--text/--text2/--accent2/--border 等CSS变量，
// 深色/浅色/暖色/绿色/蓝色等主题切换后导出的图片会自动跟着变。

// 短篇字数达到这个阈值就不再直接导出长图（图片会过高，不便查看/分享），提醒用户改用长篇小说分章导出
var LI_SHORT_STORY_LIMIT=10000;
// 安全上限：预计物理画布高度（含缩放倍数）超过这个值就不再继续渲染，直接提示用户，
// 而不是生成一张部分浏览器/设备可能无法处理的超高图片或让内存占用失控。正常单章正文很难达到这个量级，
// 这里只是兜底防御，不影响日常使用。
var LI_MAX_PHYSICAL_HEIGHT=28000;

// 读取当前主题下各CSS变量的实际计算值；极少数不支持CSS变量的环境读取失败时，回退到默认深色配色，
// 保证取色失败也不会导致导出功能本身报错崩溃
function _liGetThemeColors(){
  var fb={bg:'#0f0f14',text:'#e8e8f0',text2:'#9090a8',accent2:'#a29bfe',border:'#2a2a3a'};
  try{
    var cs=getComputedStyle(document.body);
    var pick=function(name,fallback){var v=(cs.getPropertyValue(name)||'').trim();return v||fallback;};
    return {
      bg:pick('--bg',fb.bg),
      text:pick('--text',fb.text),
      text2:pick('--text2',fb.text2),
      accent2:pick('--accent2',fb.accent2),
      border:pick('--border',fb.border)
    };
  }catch(e){logError('op',e);return fb;}
}

// 把一段文字拆成"词"数组：连续的英文字母/数字算一个词（避免英文单词被从中间断开），
// 其余字符（含中文、标点等）逐字符独立成词——中文本就适合逐字换行
function _liTokenize(str){
  var tokens=[];var buf='';
  for(var i=0;i<str.length;i++){
    var c=str[i];
    if(/[A-Za-z0-9]/.test(c)){buf+=c;}
    else{if(buf){tokens.push(buf);buf='';}tokens.push(c);}
  }
  if(buf)tokens.push(buf);
  return tokens;
}

// 按可用宽度给一段文字自动换行，返回 [{text,indented}]；indented=true 表示这一行是段落首行，
// 渲染时需要在行首额外加上缩进。measureFn(text) 需返回该文字在当前字体下的像素宽度。
// 单个"词"本身就超过一整行可用宽度时（比如很长的英文单词/链接），按字符强制断开，避免死循环或超出画布。
// 换行规则（含首行缩进的处理方式）已用模拟measureFn单独验证过，覆盖纯中文/中英混排/超长单词/空段落等情况。
function _liWrapParagraph(measureFn,text,maxWidth,indentWidth){
  var tokens=_liTokenize(text);
  var lines=[];
  var cur='';
  var isFirstLine=true;
  function curMax(){return isFirstLine?Math.max(1,maxWidth-indentWidth):maxWidth;}
  function pushLine(t){lines.push({text:t,indented:isFirstLine});isFirstLine=false;}
  tokens.forEach(function(tok){
    if(measureFn(tok)>curMax()&&tok.length>1){
      if(cur){pushLine(cur);cur='';}
      var remain=tok;
      while(remain.length>0){
        var w=curMax();
        var brk=remain.length;
        while(brk>1&&measureFn(remain.substring(0,brk))>w)brk--;
        pushLine(remain.substring(0,brk));
        remain=remain.substring(brk);
      }
      return;
    }
    var test=cur+tok;
    if(cur&&measureFn(test)>curMax()){
      pushLine(cur);
      cur=tok;
    }else{
      cur=test;
    }
  });
  if(cur||lines.length===0)pushLine(cur);
  return lines;
}

// 构建长图的"排版方案"：一份 {advance, draw} 的数组。advance是这一块要占用的竖直高度，
// draw(ctx,x,y) 是把内容画在(x,y)（y为这一块顶部）的函数，纯间距块draw为null。
// 之所以先构建成方案数组，而不是"边测量边画"：这样"计算总高度"（把所有advance加起来）和
// "实际绘制"（遍历同一份数组，边画边累加y）保证使用完全相同的数值，不会出现两次计算对不上、
// 画布开早了/晚了导致内容被截断或留白的问题。
function _liBuildLayout(mctx,theme,fontStack,W,padX,bookTitle,chapterLabel,bodyText,isAI,sizes){
  var maxTextWidth=W-padX*2;
  var blocks=[];
  var measure=function(s){return mctx.measureText(s).width;};

  // 标题（可能超宽，也需要换行）
  mctx.font='bold '+sizes.title+'px '+fontStack;
  var titleLines=_liWrapParagraph(measure,bookTitle||'未命名',maxTextWidth,0);
  titleLines.forEach(function(l){
    blocks.push({advance:Math.round(sizes.title*1.4),draw:function(ctx,x,y){
      ctx.font='bold '+sizes.title+'px '+fontStack;ctx.fillStyle=theme.text;ctx.textBaseline='top';ctx.textAlign='left';
      ctx.fillText(l.text,x,y);
    }});
  });

  // 章节标签（仅长篇单章导出时有值）
  if(chapterLabel){
    blocks.push({advance:10,draw:null});
    blocks.push({advance:Math.round(sizes.label*1.6),draw:function(ctx,x,y){
      ctx.font=sizes.label+'px '+fontStack;ctx.fillStyle=theme.accent2;ctx.textBaseline='top';ctx.textAlign='left';
      ctx.fillText(chapterLabel,x,y);
    }});
  }

  // 头部分隔线
  blocks.push({advance:16,draw:null});
  blocks.push({advance:1,draw:function(ctx,x,y){
    ctx.strokeStyle=theme.border;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,y+0.5);ctx.lineTo(x+maxTextWidth,y+0.5);ctx.stroke();
  }});
  blocks.push({advance:22,draw:null});

  // 正文：按原文换行符拆段落，逐段落自动换行；连续空行折叠成一个较小的段间距（而不是逐行都占一整行高度），
  // 避免排版不规范（比如夹了很多空行）时长图出现大片空白
  mctx.font=sizes.body+'px '+fontStack;
  var indentWidth=measure('　　'); // 首行缩进2个中文字符宽度，和正文同字号测量，保证缩进量与字号联动一致
  var rawLines=String(bodyText||'').split('\n');
  var prevBlank=false;
  var gapH=Math.round(sizes.lineHeight*0.55);
  rawLines.forEach(function(raw){
    if(!raw.trim()){
      if(!prevBlank)blocks.push({advance:gapH,draw:null});
      prevBlank=true;
      return;
    }
    prevBlank=false;
    var lines=_liWrapParagraph(measure,raw,maxTextWidth,indentWidth);
    lines.forEach(function(l){
      blocks.push({advance:sizes.lineHeight,draw:function(ctx,x,y){
        ctx.font=sizes.body+'px '+fontStack;ctx.fillStyle=theme.text;ctx.textBaseline='top';ctx.textAlign='left';
        ctx.fillText(l.text,x+(l.indented?indentWidth:0),y);
      }});
    });
  });

  // 底部分隔线 + 落款
  blocks.push({advance:28,draw:null});
  blocks.push({advance:1,draw:function(ctx,x,y){
    ctx.strokeStyle=theme.border;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,y+0.5);ctx.lineTo(x+maxTextWidth,y+0.5);ctx.stroke();
  }});
  blocks.push({advance:16,draw:null});
  var footerText='星叙 · 导出于 '+new Date().toLocaleDateString('zh-CN')+(isAI?'　·　AI辅助创作':'');
  blocks.push({advance:Math.round(sizes.footer*1.6),draw:function(ctx,x,y){
    ctx.font=sizes.footer+'px '+fontStack;ctx.fillStyle=theme.text2;ctx.textBaseline='top';ctx.textAlign='center';
    ctx.fillText(footerText,x+maxTextWidth/2,y);
    ctx.textAlign='left';
  }});

  return blocks;
}

// 核心渲染函数：把 书名/章节标签/正文 画成一张长图，通过 canvas.toBlob 异步产出 PNG Blob。
// onDone(blob) 成功时调用；onFail(reason) 渲染失败、环境不支持、或触发安全上限时调用，reason为可展示给用户的文案。
function _liRenderToBlob(bookTitle,chapterLabel,bodyText,isAI,onDone,onFail){
  try{
    var theme=_liGetThemeColors();
    var scale=2; // 固定2倍分辨率，兼顾清晰度与文件体积/内存占用；不跟随devicePixelRatio，避免高dpr设备画布过大
    var W=720,padX=48,padTop=56,padBottom=48;
    var sizes={title:26,label:15,body:17,lineHeight:32,footer:12};
    var fontStack='"PingFang SC","Noto Serif SC","Microsoft YaHei",serif';

    var measureCanvas=document.createElement('canvas');
    var mctx=measureCanvas.getContext('2d');
    if(!mctx){onFail('当前环境不支持Canvas，无法生成长图。');return;}

    var blocks=_liBuildLayout(mctx,theme,fontStack,W,padX,bookTitle,chapterLabel,bodyText,isAI,sizes);
    var contentH=blocks.reduce(function(s,b){return s+b.advance;},0);
    var totalH=Math.ceil(padTop+contentH+padBottom);

    if(totalH*scale>LI_MAX_PHYSICAL_HEIGHT){
      onFail('内容过长（预计图片高度约'+Math.round(totalH*scale/1000)+'千像素），超出长图导出的安全上限。'+(chapterLabel?'建议把这一章拆分成两章后再分别导出。':'建议缩短本次导出的内容。'));
      return;
    }

    var canvas=document.createElement('canvas');
    canvas.width=Math.ceil(W*scale);
    canvas.height=Math.ceil(totalH*scale);
    var ctx=canvas.getContext('2d');
    if(!ctx){onFail('当前环境不支持Canvas，无法生成长图。');return;}
    ctx.scale(scale,scale);
    ctx.fillStyle=theme.bg;
    ctx.fillRect(0,0,W,totalH);

    var y=padTop;
    blocks.forEach(function(b){
      if(b.draw)b.draw(ctx,padX,y);
      y+=b.advance;
    });

    var finish=function(blob){
      if(blob)onDone(blob);else onFail('图片生成失败，当前环境不支持导出，请更换浏览器后重试。');
    };
    if(canvas.toBlob){
      canvas.toBlob(finish,'image/png');
    }else{
      // 兼容极少数不支持 toBlob 的环境：退化用 toDataURL 手动转成 Blob
      var dataUrl=canvas.toDataURL('image/png');
      var bstr=atob(dataUrl.split(',')[1]);
      var n=bstr.length;var u8=new Uint8Array(n);
      while(n--){u8[n]=bstr.charCodeAt(n);}
      finish(new Blob([u8],{type:'image/png'}));
    }
  }catch(e){
    logError('op',e);
    onFail('长图生成时发生错误：'+(e.message||'未知错误'));
  }
}

// 生成长图并触发下载 + 展示完成弹窗（短篇直接导出 / 长篇选中某一章后导出，是两者共用的最后一步）
function _liExportAndDownload(filePrefix,bookTitle,chapterLabel,bodyText,isAI){
  showToast('正在生成长图...',2000);
  // 用setTimeout让"正在生成"的提示先绘制出来，再执行下面这段同步的测量+绘制（避免界面卡在提示弹出前）
  setTimeout(function(){
    _liRenderToBlob(bookTitle,chapterLabel,bodyText,isAI,function(blob){
      var safeLabel=chapterLabel?chapterLabel.replace(/[\\/:*?"<>|]/g,'_'):'';
      var filename=filePrefix+(safeLabel?'_'+safeLabel:'')+'.png';
      _liDeliverImage(blob,filename);
    },function(reason){
      showDlg('长图导出失败',reason,function(){},false,false);
    });
  },30);
}

// 把生成好的PNG图片交给用户。优先尝试系统分享（Web Share API + 文件）：这是在"网页打包成APK"的WebView壳子里
// 最可靠的导出方式——这类壳子通常没有实现下载管理器，a[download]点击可能悄悄没有任何反应，
// 但系统分享面板是WebView之外、由Android系统接管的界面，能直接调起"保存到相册/文件/发送到其它APP"。
// 不支持分享（不满足特性检测）或分享失败时，退化到传统的 a[download] 下载方式。
function _liDeliverImage(blob,filename){
  var isApk=_isApkWebView();
  var canShareFile=false;
  var shareFile=null;
  try{
    if(navigator.share&&navigator.canShare&&window.File){
      shareFile=new File([blob],filename,{type:'image/png'});
      canShareFile=navigator.canShare({files:[shareFile]});
    }
  }catch(e){canShareFile=false;}

  if(canShareFile){
    navigator.share({files:[shareFile],title:filename}).then(function(){
      showToast('已通过系统分享发送');
    }).catch(function(err){
      // 用户在系统分享面板里主动取消，不算失败，不用再弹后备下载的提示打扰用户；
      // 其它原因导致分享失败（比如目标APP不支持接收图片）才继续走后备下载方案
      if(err&&err.name==='AbortError')return;
      _liFallbackDownload(blob,filename,isApk);
    });
    return; // 分享面板本身已经是最直接的操作反馈，不再叠加下载+完成弹窗，避免同时弹两层
  }
  _liFallbackDownload(blob,filename,isApk);
}

// 传统下载方式：创建 a[download] 触发浏览器下载，同时始终展示一张可长按保存的图片预览兜底。
// isApk为true时，即使a.click()没有抛错，也不代表WebView壳子真的处理了这次下载（很多简单的
// "网页打包APK"壳子并未实现下载逻辑，点击下载会静默无反应），所以文案不再声称"已导出到下载目录"，
// 而是直接引导长按图片保存——这个方式不依赖下载管理器，是WebView原生支持的图片保存入口。
function _liFallbackDownload(blob,filename,isApk){
  var downloaded=false;
  try{
    var url=URL.createObjectURL(blob);
    var a=document.createElement('a');
    a.href=url;a.download=filename;a.style.display='none';
    document.body.appendChild(a);a.click();
    setTimeout(function(){try{URL.revokeObjectURL(url);document.body.removeChild(a);}catch(e){}},1000);
    downloaded=true;
  }catch(e){logError('op',e);downloaded=false;}
  var previewUrl;
  try{previewUrl=URL.createObjectURL(blob);}catch(e){logError('op',e);previewUrl='';}
  var tip;
  if(isApk){
    tip='当前处于APP内置浏览器环境，点击下载可能没有反应；请长按上方图片，选择"保存图片"即可存到相册';
  }else if(downloaded){
    tip='已尝试导出：<b style="color:var(--accent2)">'+esc(filename)+'</b><br>请检查手机「下载」目录；如果没收到，也可以长按上方图片直接保存';
  }else{
    tip='当前环境无法直接下载，请长按上方图片保存';
  }
  var html='<div style="text-align:center">'+
    (previewUrl?'<img src="'+previewUrl+'" style="max-width:100%;max-height:50vh;border-radius:10px;box-shadow:var(--shadow);margin-bottom:12px">':'')+
    '<div style="font-size:12px;color:var(--text2);line-height:1.8">'+tip+'</div></div>';
  showDlg('长图导出完成',html,function(){if(previewUrl){try{URL.revokeObjectURL(previewUrl);}catch(e){}}},false,true);
  setTimeout(function(){
    var okBtn=document.getElementById('dlgOkBtn');
    if(okBtn)okBtn.textContent='✓ 已收到，关闭';
    var p=document.getElementById('dlgMsg');
    if(p){p.style.maxHeight='70vh';p.style.overflowY='auto';}
  },50);
}

// 短篇（含草稿）导出长图：先检测字数，达到上限则提醒用户改为新建长篇小说分章导出，不直接生成图片
function _liExportShortStory(filePrefix,title,content,isAI){
  var text=String(content||'');
  if(!text.trim()){showToast('内容为空，无法导出长图');return;}
  var wc=countWords(text);
  if(wc>=LI_SHORT_STORY_LIMIT){
    showDlg('内容较长，暂不适合导出长图',
      '当前短篇约 <b style="color:var(--accent2)">'+wc+'</b> 字，超过1万字后长图会过长，不便查看和分享。<br><br>'+
      '建议：点击下方按钮复制正文内容，到"创作"页新建一篇<b>长篇小说</b>并分章粘贴，之后即可对单个章节导出长图。',
      function(){
        if(navigator.clipboard&&navigator.clipboard.writeText){
          navigator.clipboard.writeText(text).then(function(){showToast('已复制正文，可粘贴到新建的长篇小说中');}).catch(function(){showToast('复制失败，请检查剪贴板权限');});
        }else{showToast('当前环境不支持自动复制，请手动选中文本复制');}
      },false,true);
    setTimeout(function(){var okBtn=document.getElementById('dlgOkBtn');if(okBtn)okBtn.textContent='复制正文';},50);
    return;
  }
  _liExportAndDownload(filePrefix,title,null,text,isAI);
}

// 长篇导出长图：仅支持单章导出；章节数>1时弹出"选择章节"弹窗（按已有分卷分组展示，支持搜索定位），
// 只有1章时没有可选的余地，直接导出该章
function _liExportNovel(filePrefix,title,work,chapters,isAI){
  if(!Array.isArray(chapters)||chapters.length===0){showToast('没有章节内容可导出');return;}
  if(chapters.length===1){
    _liExportNovelChapter(filePrefix,title,chapters,0,isAI);
    return;
  }
  _liShowChapterPicker(work,chapters,function(idx){
    _liExportNovelChapter(filePrefix,title,chapters,idx,isAI);
  });
}
function _liExportNovelChapter(filePrefix,title,chapters,idx,isAI){
  var text=chapters[idx]||'';
  if(!text.trim()){showToast('这一章内容为空，无法导出长图');return;}
  _liExportAndDownload(filePrefix,title,'第'+(idx+1)+'章',text,isAI);
}

// "选择要导出的章节"弹窗：分组展开状态、搜索定位当前值、当前弹窗上下文（work/chapters/onSelect）。
// 每次打开弹窗都会重置为"全部折叠+清空搜索"，和章节大纲页的 _chOutlineExpanded/_chOutlineLocateVal
// 是完全独立的一份状态，但折叠交互和搜索定位规则都照抄自章节大纲页（chOutlineLocate/renderChOutlineList），
// 保持两处体验一致：纯数字按章节号定位，命中且属于某个分卷时只显示这一整卷（强制展开）、其余分卷隐藏并自动
// 滚动到命中的那一章；非数字按分卷名模糊匹配，同样只显示匹配到的分卷；没建过分卷的作品没有"卷"可筛，不做隐藏。
var _liPickerExpanded={};
var _liPickerLocateVal='';
var _liPickerCtx=null; // {work,chapters,onSelect}

function _liShowChapterPicker(work,chapters,onSelect){
  _liPickerExpanded={};
  _liPickerLocateVal='';
  _liPickerCtx={work:work,chapters:chapters,onSelect:onSelect};
  document.getElementById('dlgTitle').textContent='选择要导出的章节';
  // 搜索框是常驻元素，只在这里创建一次；后续搜索/展开折叠只重绘下面的#liPickerList，
  // 不会把输入框一起替换掉——否则每敲一个字输入框都会失焦，体验很差（和章节大纲页只重绘
  // #chOutlineList、从不触碰#chOutlineLocateInput本身是同一个道理）
  document.getElementById('dlgMsg').innerHTML=
    '<div style="position:relative;margin-bottom:10px">'+
    '<input type="text" maxlength="24" id="liPickerLocateInput" placeholder="输入章节号或分卷名定位" oninput="_liPickerLocate(this.value)" style="width:100%;box-sizing:border-box;padding:8px 30px 8px 12px;border-radius:20px;border:1.5px solid var(--border);background:var(--bg);color:var(--text);font-size:12px;outline:none">'+
    '<button type="button" id="liPickerLocateClear" onclick="_liPickerLocateClear()" style="display:none;position:absolute;right:6px;top:50%;transform:translateY(-50%);width:18px;height:18px;border-radius:50%;border:none;background:var(--card2);color:var(--text2);font-size:9px;align-items:center;justify-content:center;cursor:pointer;line-height:1;padding:0"><i class="fas fa-times"></i></button>'+
    '</div>'+
    '<div id="liPickerList"></div>';
  document.getElementById('dlgOkBtn').style.display='none';
  window._selectDlgCallback=function(id){
    if(_liPickerCtx&&_liPickerCtx.onSelect)_liPickerCtx.onSelect(parseInt(id,10));
    _liPickerCtx=null;
  };
  document.getElementById('dlgOv').classList.add('show');
  _liRenderPickerList();
}
function _liPickerLocate(val){
  var clean=String(val==null?'':val);
  _liPickerLocateVal=clean;
  var clearBtn=document.getElementById('liPickerLocateClear');
  if(clearBtn)clearBtn.style.display=clean?'flex':'none';
  _liRenderPickerList();
}
function _liPickerLocateClear(){
  var inp=document.getElementById('liPickerLocateInput');
  if(inp)inp.value='';
  _liPickerLocate('');
}
function _liRenderPickerList(){
  if(!_liPickerCtx)return;
  var work=_liPickerCtx.work,chapters=_liPickerCtx.chapters;
  var list=document.getElementById('liPickerList');
  if(!list)return;
  var groups=_buildVolGroups(work);
  var hasAnyVolume=(work.volumes||[]).length>0;

  var locateActive=(_liPickerLocateVal!=='');
  var isNumericLocate=locateActive&&/^\d+$/.test(_liPickerLocateVal);
  var numericHitIdx=-1;
  var keepGroupIds=null;
  var emptyMsg='没有可导出的章节';
  if(locateActive){
    if(isNumericLocate){
      var locateNum=parseInt(_liPickerLocateVal,10);
      numericHitIdx=(locateNum>0&&locateNum-1<chapters.length)?(locateNum-1):-1;
      if(hasAnyVolume){
        if(numericHitIdx>=0){
          var hitVol=(work.chVolume&&work.chVolume[numericHitIdx])||'';
          keepGroupIds={};keepGroupIds[hitVol]=true;
        }else{
          keepGroupIds={};
        }
      }
      emptyMsg='未找到第'+esc(_liPickerLocateVal)+'章';
    }else if(hasAnyVolume){
      var kw=_liPickerLocateVal.trim().toLowerCase();
      keepGroupIds={};
      (work.volumes||[]).forEach(function(v){if((v.name||'').toLowerCase().indexOf(kw)!==-1)keepGroupIds[v.id]=true;});
      emptyMsg='未找到名称包含"'+esc(_liPickerLocateVal.trim())+'"的分卷';
    }
  }

  function itemHtml(i){
    var wc=countWords(chapters[i]);
    return '<div data-ch="'+i+'" style="padding:10px 12px;background:var(--bg);border:1px solid var(--border);border-radius:9px;margin-bottom:8px;cursor:pointer;display:flex;justify-content:space-between;align-items:center" onclick="selectDlgItem(\''+i+'\')">'+
      '<span style="font-size:12px">第'+(i+1)+'章</span>'+
      '<span style="font-size:10px;color:var(--text2)">'+wc+'字</span>'+
      '</div>';
  }

  var html='';
  var anyGroupShown=false;
  groups.forEach(function(g){
    if(!g.indices||g.indices.length===0)return;
    var key=g.id||'';
    if(keepGroupIds&&!keepGroupIds[key])return;
    anyGroupShown=true;
    if(hasAnyVolume){
      var expanded=keepGroupIds?true:!!_liPickerExpanded[key];
      html+='<div class="vol-group-hdr'+(g.id===null?' unassigned':'')+'" data-vol-hdr="'+key+'"><i class="fas fa-chevron-'+(expanded?'down':'right')+' vol-chevron"></i><span class="vol-name">'+esc(g.name||'未命名分卷')+'</span><span class="vol-count">（'+g.indices.length+'章）</span></div>';
      if(expanded)html+=g.indices.map(itemHtml).join('');
    }else{
      html+=g.indices.map(itemHtml).join('');
    }
  });

  if(keepGroupIds&&!anyGroupShown){
    list.innerHTML='<div style="text-align:center;padding:24px;color:var(--text2);font-size:12px">'+emptyMsg+'</div>';
    return;
  }
  list.innerHTML=html;
  if(hasAnyVolume){
    // 分组标题的展开/折叠是JS事件监听，不是innerHTML能直接带上的，批量赋值后要单独补绑
    list.querySelectorAll('.vol-group-hdr').forEach(function(hdr){
      var volId=hdr.dataset.volHdr;
      hdr.onclick=function(){
        _liPickerExpanded[volId]=!_liPickerExpanded[volId];
        _liRenderPickerList();
      };
    });
  }
  // 数字定位命中时自动滚动到那一具体章节，方便"快速找到"（哪怕展示的是它所在的整卷）
  if(numericHitIdx>=0){
    var hit=list.querySelector('[data-ch="'+numericHitIdx+'"]');
    if(hit)setTimeout(function(){hit.scrollIntoView({block:'nearest',behavior:'smooth'});},50);
  }
}
// 从创作页导出
// 从编辑器导出
function exportEdToTxt(){
if(!curEd){showToast('没有打开的作品');return;}
saveEditorContent();
doExportWork(curEd,false);
}
// 从收藏导出
function exportBookToTxt(id){
const book=cols.books.find(b=>b.id===id);
if(!book){showToast('找不到该书籍');return;}
doExportWork(book,true);
}
// 执行导出
function exportSingleCrWork(id){
const w=crWorks.find(x=>x.id===id);
if(!w){showToast('找不到该作品');return;}
doExportWork(w,false);
}
function doExportWork(work,isAI){
const title=work.title||'未命名';
let chapters;
if(work.type==='novel'||work.chapters){
chapters=work.chapters||[];
}else{
chapters=work.content||'';
}
const safeTitle=title.replace(/[\\/:*?"<>|]/g,'_');
const dateStr=new Date().toLocaleDateString().replace(/\//g,'-');
const isNovel=work.type==='novel';
const filePrefix=isNovel?'星叙_《'+safeTitle+'》':'星叙_'+safeTitle;
var fmtHtml=
'<p style="font-size:12px;color:var(--text2);margin-bottom:14px">请选择导出格式：</p>'+
'<div style="display:flex;flex-direction:column;gap:10px">'+
'<button onclick="window._doExportFmt(\'txt\')" style="padding:12px 16px;border-radius:12px;border:1px solid var(--border);background:var(--card);color:var(--text);font-size:13px;cursor:pointer;text-align:left"><b><i class="fas fa-file"></i> TXT 纯文本</b><div style="font-size:10px;color:var(--text2);margin-top:3px">通用格式，任何设备均可打开</div></button>'+
'<button onclick="window._doExportFmt(\'md\')" style="padding:12px 16px;border-radius:12px;border:1px solid var(--border);background:var(--card);color:var(--text);font-size:13px;cursor:pointer;text-align:left"><b><i class="fas fa-pen-nib"></i> Markdown (.md)</b><div style="font-size:10px;color:var(--text2);margin-top:3px">适合Obsidian、Typora等Markdown编辑器</div></button>'+
'<button onclick="window._doExportFmt(\'word\')" style="padding:12px 16px;border-radius:12px;border:1px solid var(--border);background:var(--card);color:var(--text);font-size:13px;cursor:pointer;text-align:left"><b><i class="fas fa-file-word"></i> Word (.doc)</b><div style="font-size:10px;color:var(--text2);margin-top:3px">可用 WPS、Microsoft Word 直接打开</div></button>'+
'<button onclick="window._doExportFmt(\'epubzip\')" style="padding:12px 16px;border-radius:12px;border:1px solid var(--border);background:var(--card);color:var(--text);font-size:13px;cursor:pointer;text-align:left"><b><i class="fas fa-book-open"></i> EPUB (.epub)</b><div style="font-size:10px;color:var(--text2);margin-top:3px">电子书格式，可用掌阅、多看阅读器打开</div></button>'+
'<button onclick="window._doExportFmt(\'longimg\')" style="padding:12px 16px;border-radius:12px;border:1px solid var(--border);background:var(--card);color:var(--text);font-size:13px;cursor:pointer;text-align:left"><b><i class="fas fa-image"></i> 长图 (.png)</b><div style="font-size:10px;color:var(--text2);margin-top:3px">适合分享到社交平台；长篇小说需先选择其中一章导出</div></button>'+
'</div>';
showDlg('导出格式',fmtHtml,function(){},false,true);
document.getElementById('dlgOkBtn').style.display='none';
setTimeout(function(){
var p=document.getElementById('dlgMsg');
if(p){p.style.maxHeight='50vh';p.style.overflowY='auto';}
},50);
window._doExportFmt=function(fmt){
  closeDlg();
  if(fmt==='txt'){
    var content=buildTxtContent(title,chapters,isAI);
    exportToTxtFile(filePrefix+'.txt',content);
  }else if(fmt==='md'){
    var content=buildMdContent(title,chapters,isAI);
    exportToTxtFile(filePrefix+'.md',content);
  }else if(fmt==='word'){
    var content=buildWordContent(title,chapters,isAI);
    _exportFileWithFallback(filePrefix+'.doc',content,'application/msword');
  }else if(fmt==='epubzip'){
    _exportEpubFile(filePrefix+'.epub',title,chapters,isAI);
  }else if(fmt==='longimg'){
    // 短篇（含草稿）：chapters是字符串，直接导出全文；长篇：chapters是数组，仅能选择单章导出。
    // 这里判断数组用Array.isArray(chapters)而不是isNovel标志位，和buildTxtContent/buildMdContent等
    // 其它导出格式的判断方式保持一致（isNovel只影响文件名前缀，不代表chapters实际的数据类型）。
    if(Array.isArray(chapters)){
      _liExportNovel(filePrefix,title,work,chapters,isAI);
    }else{
      _liExportShortStory(filePrefix,title,chapters,isAI);
    }
  }
};
}
// 选择弹窗回调（供长图导出的章节选择弹窗复用，见 _liShowChapterPicker）
function selectDlgItem(id){
closeDlg();
document.getElementById('dlgOkBtn').style.display='';
if(window._selectDlgCallback){
window._selectDlgCallback(id);
window._selectDlgCallback=null;
}
}
// ==================== 文章重写功能 ====================
let rewriteArticle=null;
var _rwRdSI=0,_rwRdEI=0; // 章节改写范围：起始/结束索引
var _edRwSI=0,_edRwEI=0; // 编辑器多章节重写索引

function openArticleRewrite(){
if(!curRd){showToast('请先打开一篇文章');return;}
rewriteArticle=curRd;
var isLong=curRd.type==='long'&&Array.isArray(curRd.chapters)&&curRd.chapters.length>0;
var totalChs=isLong?curRd.chapters.length:0;
var typeText=isLong?'长篇（共'+totalChs+'章）':'短篇文章';
document.getElementById('rewriteTitle').innerHTML='<i class="fas fa-rotate-right"></i> AI改写 · '+esc(typeText);
document.getElementById('rewriteRequirement').value='';
document.getElementById('rewriteProgress').style.display='none';
document.getElementById('rewriteBtns').style.display='flex';
document.getElementById('rewriteDoBtn').disabled=false;
document.getElementById('rewriteDoBtn').innerHTML='<i class="fas fa-rocket"></i> 开始改写';
var picker=document.getElementById('rewriteChPicker');
if(picker){
  if(isLong&&totalChs>1){
    _rwRdSI=Math.max(0,Math.min(curCh||0,totalChs-1));
    _rwRdEI=_rwRdSI;
    picker.style.display='block';
    _rwRdUpdatePicker();
  }else{
    picker.style.display='none';
  }
}
document.getElementById('rewriteOv').classList.add('show');
navPush('rewriteOv');
}
function _rwRdStepCh(which,delta){
  var tot=rewriteArticle&&rewriteArticle.chapters?rewriteArticle.chapters.length:0;
  if(tot===0)return;
  if(which==='s'){
    _rwRdSI=Math.max(0,Math.min(_rwRdSI+delta,tot-1));
    if(_rwRdEI<_rwRdSI)_rwRdEI=_rwRdSI;
    if(_rwRdEI-_rwRdSI>=10)_rwRdEI=Math.min(_rwRdSI+9,tot-1);
  }else{
    _rwRdEI=Math.max(_rwRdSI,Math.min(_rwRdEI+delta,Math.min(_rwRdSI+9,tot-1)));
  }
  _rwRdUpdatePicker();
}
function _rwRdUpdatePicker(){
  var tot=rewriteArticle&&rewriteArticle.chapters?rewriteArticle.chapters.length:0;
  var chNames=rewriteArticle&&rewriteArticle.chNames;
  var sLabel='第'+(_rwRdSI+1)+'章'+(chNames&&chNames[_rwRdSI]?' · '+chNames[_rwRdSI]:'');
  var eLabel='第'+(_rwRdEI+1)+'章'+(chNames&&chNames[_rwRdEI]?' · '+chNames[_rwRdEI]:'');
  var sl=document.getElementById('rwRdSLabel');
  var el=document.getElementById('rwRdELabel');
  var h=document.getElementById('rwRdChHint');
  if(sl)sl.textContent=sLabel;
  if(el)el.textContent=eLabel;
  if(h){
    var diff=_rwRdEI-_rwRdSI+1;
    h.textContent='共选 '+diff+' 章（第'+(_rwRdSI+1)+'章 ~ 第'+(_rwRdEI+1)+'章）';
    h.style.color=diff>1?'var(--accent2)':'var(--text2)';
  }
}
function _showChNumDlg(title,cur,tot,onOk){
  var old=document.getElementById('_chNumDlg');if(old)old.remove();
  var ov=document.createElement('div');
  ov.id='_chNumDlg';
  ov.style.cssText='display:flex;position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.6);align-items:center;justify-content:center;padding:20px';
  ov.innerHTML=
    '<div style="background:var(--card);border-radius:16px;padding:22px;width:100%;max-width:300px;border:1px solid var(--border);animation:fadeIn .2s ease">'+
    '<div style="font-size:13px;font-weight:700;color:var(--text);margin-bottom:14px">'+title+'</div>'+
    '<input id="_chNumInput" type="number" inputmode="numeric" min="1" max="'+tot+'" value="'+cur+'"'+
    ' style="width:100%;padding:12px;border-radius:10px;border:1px solid var(--border);background:var(--bg);color:var(--text);font-size:22px;font-weight:700;outline:none;box-sizing:border-box;text-align:center;-webkit-appearance:none">'+
    '<div style="font-size:11px;color:var(--text2);text-align:center;margin:10px 0 16px">可选范围：第 1 章 ～ 第 '+tot+' 章</div>'+
    '<div style="display:flex;gap:10px">'+
    '<button id="_chNumCancel" style="flex:1;padding:12px;border-radius:12px;background:var(--card2);color:var(--text2);border:none;font-size:13px;font-weight:600;cursor:pointer">取消</button>'+
    '<button id="_chNumOk" style="flex:1;padding:12px;border-radius:12px;background:linear-gradient(135deg,var(--accent),var(--accent2));color:#fff;border:none;font-size:13px;font-weight:600;cursor:pointer">确定</button>'+
    '</div></div>';
  document.body.appendChild(ov);
  ov.onclick=function(e){if(e.target===ov)ov.remove();};
  document.getElementById('_chNumCancel').onclick=function(){ov.remove();};
  document.getElementById('_chNumOk').onclick=function(){
    var n=parseInt(document.getElementById('_chNumInput').value,10);
    if(isNaN(n)||n<1||n>tot){showToast('请输入 1 ～ '+tot+' 之间的整数',2500);return;}
    ov.remove();onOk(n);
  };
  setTimeout(function(){var f=document.getElementById('_chNumInput');if(f){f.focus();f.select();}},100);
}
function _rwRdCustomInput(which){
  var tot=rewriteArticle&&rewriteArticle.chapters?rewriteArticle.chapters.length:0;
  if(tot===0)return;
  var label=which==='s'?'起始章节':'结束章节';
  var cur=which==='s'?(_rwRdSI+1):(_rwRdEI+1);
  _showChNumDlg('请输入'+label+'编号',cur,tot,function(n){
    var idx=n-1;
    if(which==='s'){
      _rwRdSI=idx;
      if(_rwRdEI<_rwRdSI)_rwRdEI=_rwRdSI;
      if(_rwRdEI-_rwRdSI>=10)_rwRdEI=Math.min(_rwRdSI+9,tot-1);
    }else{
      _rwRdEI=idx;
      if(_rwRdEI<_rwRdSI)_rwRdSI=_rwRdEI;
      if(_rwRdEI-_rwRdSI>=10)_rwRdSI=Math.max(_rwRdEI-9,0);
    }
    _rwRdUpdatePicker();
  });
}
function _edRwCustomInput(which){
  var tot=curEd&&curEd.chapters?curEd.chapters.length:0;
  if(tot===0)return;
  var label=which==='s'?'起始章节':'结束章节';
  var cur=which==='s'?(_edRwSI+1):(_edRwEI+1);
  _showChNumDlg('请输入'+label+'编号',cur,tot,function(n){
    var idx=n-1;
    if(which==='s'){
      _edRwSI=idx;
      if(_edRwEI<_edRwSI)_edRwEI=_edRwSI;
      if(_edRwEI-_edRwSI>=10)_edRwEI=Math.min(_edRwSI+9,tot-1);
    }else{
      _edRwEI=idx;
      if(_edRwEI<_edRwSI)_edRwSI=_edRwEI;
      if(_edRwEI-_edRwSI>=10)_edRwSI=Math.max(_edRwEI-9,0);
    }
    _edRwUpdatePicker();
  });
}
function closeRewriteOv(){
  navPop('rewriteOv');
document.getElementById('rewriteOv').classList.remove('show');
if(abortCtrl){abortCtrl.abort();abortCtrl=null;}
}

function addRewriteReq(text){
const ta=document.getElementById('rewriteRequirement');
const current=ta.value.trim();
if(current){
ta.value=current+'\n- '+text;
}else{
ta.value='- '+text;
}
}

async function doArticleRewrite(){
if(!rewriteArticle){showToast('没有要改写的文章');return;}
const cfg=getCurApi();
if(!cfg.url||!cfg.key){showToast('请先在设置中配置API');return;}

const requirement=(document.getElementById('rewriteRequirement').value||'').trim();
const btn=document.getElementById('rewriteDoBtn');
btn.disabled=true;
btn.innerHTML='改写中 <span class="ldots"><span></span><span></span><span></span></span>';
document.getElementById('rewriteProgress').style.display='block';
document.getElementById('rewriteBtns').style.display='none';
var stopBtn=document.getElementById('rewriteStopBtn');
if(stopBtn){stopBtn.disabled=false;stopBtn.innerHTML='<i class="fas fa-stop"></i> 停止改写';}
window._rwRdAbort=false;

if(rewriteArticle.type==='long'&&rewriteArticle.chapters){
  var startIdx=_rwRdSI||0;
  var endIdx=_rwRdEI||0;
  if(startIdx<0)startIdx=0;
  if(endIdx<startIdx)endIdx=startIdx;
  if(endIdx>=rewriteArticle.chapters.length)endIdx=rewriteArticle.chapters.length-1;
  await rewriteLongArticle(requirement,startIdx,endIdx);
}else{
  await rewriteShortArticle(requirement);
}
}

async function rewriteShortArticle(requirement){
const text=rewriteArticle.content||'';
if(countWords(text)<10){
showToast('文章内容太少');
closeRewriteOv();
return;
}

document.getElementById('rewriteProgressBar').style.width='10%';
document.getElementById('rewriteProgressText').textContent='正在重写短篇...';

let sysMsg='你是一位资深的文学编辑，擅长改写和润色文章。\n\n';
sysMsg+='【改写原则】\n';
sysMsg+='1. 保留原文的核心情节、人物关系、故事走向\n';
sysMsg+='2. 用更精准、更有画面感的方式重新表达每一句话\n';
sysMsg+='3. 补充感官细节、微表情、环境氛围\n';
sysMsg+='4. 修复万能副词、空洞形容词、重复句式等问题\n';
sysMsg+='5. 让对话更自然口语化\n';
sysMsg+='6. 直接输出改写后的正文，不加任何说明\n';

if(requirement){
sysMsg+='\n【用户特别要求】\n'+requirement+'\n';
}

const styleD=(document.getElementById('styleDesc')&&document.getElementById('styleDesc').value||ap.curStyle||'').trim();
if(styleD)sysMsg+='\n【文风要求】\n'+styleD+'\n';

const userMsg='请改写以下短篇文章：\n\n'+text;
const messages=[{role:'system',content:sysMsg},{role:'user',content:userMsg}];

if(useStream){
await callAPIStream(messages,
(fullText)=>{
const pct=Math.min(90,10+countWords(fullText)/countWords(text)*80);
document.getElementById('rewriteProgressBar').style.width=pct+'%';
document.getElementById('rewriteProgressText').textContent='已重写 '+countWords(fullText)+' 字...';
},
(fullText)=>{
if(fullText){
rewriteArticle.content=fullText;
syncArticle(rewriteArticle);
document.getElementById('rewriteProgressBar').style.width='100%';
document.getElementById('rewriteProgressText').textContent='重写完成！';
setTimeout(()=>{
closeRewriteOv();
renderChContent();
showToast('短篇重写完成！');
},500);
}else{
closeRewriteOv();
}
},
(errMsg)=>{
closeRewriteOv();
showToast('重写遇到了点问题，请检查API设置后再试',3000);
}
);
}else{
const result=await callAPINonStream(messages);
if(result){
rewriteArticle.content=result;
syncArticle(rewriteArticle);
closeRewriteOv();
renderChContent();
showToast('短篇重写完成！');
}else{
closeRewriteOv();
}
}
}

async function rewriteLongArticle(requirement,startIdx,endIdx){
const chapters=rewriteArticle.chapters||[];
if(chapters.length===0){
showToast('没有章节内容');
closeRewriteOv();
return;
}
if(startIdx===undefined||isNaN(startIdx)||startIdx<0)startIdx=0;
if(endIdx===undefined||isNaN(endIdx))endIdx=chapters.length-1;
if(endIdx>=chapters.length)endIdx=chapters.length-1;
if(endIdx<startIdx)endIdx=startIdx;

const totalCh=chapters.length;
const totalSel=endIdx-startIdx+1;
// 复制全部章节，只改写选定区间
let newChapters=chapters.slice();
let doneCount=0;

for(let i=startIdx;i<=endIdx;i++){
if(window._rwRdAbort)break;
const chText=chapters[i]||'';
if(countWords(chText)<10){doneCount++;continue;}

const pct=Math.round((doneCount/totalSel)*100);
document.getElementById('rewriteProgressBar').style.width=pct+'%';
document.getElementById('rewriteProgressText').textContent='正在改写第'+(i+1)+'章（'+(doneCount+1)+'/'+totalSel+'）...';

let sysMsg='你是一位资深的文学编辑，擅长改写和润色文章。\n\n';
sysMsg+='【改写原则】\n';
sysMsg+='1. 保留原文的核心情节、人物关系、故事走向\n';
sysMsg+='2. 用更精准、更有画面感的方式重新表达\n';
sysMsg+='3. 补充感官细节、微表情、环境氛围\n';
sysMsg+='4. 修复万能副词、空洞形容词等问题\n';
sysMsg+='5. 直接输出改写后的正文，不加任何说明\n';

if(requirement){sysMsg+='\n【用户特别要求】\n'+requirement+'\n';}

const styleD=(document.getElementById('styleDesc')&&document.getElementById('styleDesc').value||ap.curStyle||'').trim();
if(styleD)sysMsg+='\n【文风要求】\n'+styleD+'\n';

let contextInfo='';
if(i>0&&newChapters[i-1]){
contextInfo='【上一章结尾】\n'+newChapters[i-1].substring(newChapters[i-1].length-300)+'\n\n';
}

const userMsg=contextInfo+'请改写以下章节（第'+(i+1)+'章，全文共'+totalCh+'章）：\n\n'+chText;
const messages=[{role:'system',content:sysMsg},{role:'user',content:userMsg}];

try{
const result=await callAPINonStream(messages);
if(result&&countWords(result)>5){
newChapters[i]=result;
}else{
showToast('第'+(i+1)+'章未获有效内容，保留原文',2000);
}
}catch(e){
showToast('第'+(i+1)+'章出错，保留原文',2000);
}

doneCount++;
if(!window._rwRdAbort){
const waitMs=countWords(chText)>1500?1500:countWords(chText)>800?1000:700;
await new Promise(r=>setTimeout(r,waitMs));
}
}

const wasAborted=window._rwRdAbort;
window._rwRdAbort=false;
rewriteArticle.chapters=newChapters;
syncArticle(rewriteArticle);
document.getElementById('rewriteProgressBar').style.width='100%';
document.getElementById('rewriteProgressText').textContent=wasAborted?'已停止（完成'+doneCount+'/'+totalSel+'章）':'改写完成！';
setTimeout(()=>{
closeRewriteOv();
if(!wasAborted)curCh=startIdx;
renderChContent();
showToast(wasAborted?'⏹ 已停止，完成 '+doneCount+' 章':'改写完成！共 '+totalSel+' 章',3000);
},500);
}
// ==================== 修订模式差异对比 ====================
let _diffOldText = '';
let _diffNewText = '';
let _diffTarget = null; // 'editor' 或 'reading'
let _diffChIdx = -1;

// 简单的行级别差异算法（LCS）
function computeLineDiff(oldText, newText){
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');
  const result = [];
  
  // 简单的逐行对比
  const maxLen = Math.max(oldLines.length, newLines.length);
  let oi = 0, ni = 0;
  
  while(oi < oldLines.length || ni < newLines.length){
    const oLine = oi < oldLines.length ? oldLines[oi] : null;
    const nLine = ni < newLines.length ? newLines[ni] : null;
    
    if(oLine === nLine){
      // 相同行
      result.push({type:'same', text:oLine || ''});
      oi++; ni++;
    } else if(oLine !== null && nLine !== null){
      // 检查是否是修改（同一行的内容变了）
      // 用词级别差异
      const wordDiff = computeWordDiff(oLine || '', nLine || '');
      result.push({type:'modify', old:oLine, new:nLine, wordDiff:wordDiff});
      oi++; ni++;
    } else if(oLine === null){
      // 新增行
      result.push({type:'add', text:nLine || ''});
      ni++;
    } else {
      // 删除行
      result.push({type:'del', text:oLine || ''});
      oi++;
    }
  }
  return result;
}

// 简单的词级别差异（用于同一行内的修改对比）
function computeWordDiff(oldStr, newStr){
  // 按字符拆分（中文一个字一个token）
  const oldChars = oldStr.split('');
  const newChars = newStr.split('');
  
  // 找最长公共子序列
  const m = oldChars.length, n = newChars.length;
  // 对于特别长的文本，简单返回整行替换
  if(m > 500 || n > 500){
    return [{type:'del',text:oldStr},{type:'add',text:newStr}];
  }
  
  const dp = Array(m+1).fill(null).map(()=>Array(n+1).fill(0));
  for(let i = 1; i <= m; i++){
    for(let j = 1; j <= n; j++){
      if(oldChars[i-1] === newChars[j-1]) dp[i][j] = dp[i-1][j-1] + 1;
      else dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);
    }
  }
  
  // 回溯
  const result = [];
  let i = m, j = n;
  const ops = [];
  while(i > 0 || j > 0){
    if(i > 0 && j > 0 && oldChars[i-1] === newChars[j-1]){
      ops.unshift({type:'same', ch:oldChars[i-1]});
      i--; j--;
    } else if(j > 0 && (i === 0 || dp[i][j-1] >= dp[i-1][j])){
      ops.unshift({type:'add', ch:newChars[j-1]});
      j--;
    } else {
      ops.unshift({type:'del', ch:oldChars[i-1]});
      i--;
    }
  }
  
  // 合并连续相同类型
  const merged = [];
  ops.forEach(op => {
    if(merged.length > 0 && merged[merged.length-1].type === op.type){
      merged[merged.length-1].text += op.ch;
    } else {
      merged.push({type:op.type, text:op.ch});
    }
  });
  
  return merged;
}

// 显示差异对比
function showDiffCompare(oldText, newText, target, chIdx){
  _diffOldText = oldText;
  _diffNewText = newText;
  _diffTarget = target || 'editor';
  _diffChIdx = chIdx !== undefined ? chIdx : -1;
  
  const diff = computeLineDiff(oldText, newText);
  const container = document.getElementById('diffContent');
  
  const oldWc = countWords(oldText);
  const newWc = countWords(newText);
  document.getElementById('diffOldWc').textContent = oldWc;
  document.getElementById('diffNewWc').textContent = newWc;
  
  const change = newWc - oldWc;
  const changeEl = document.getElementById('diffWcChange');
  if(change > 0){
    changeEl.textContent = '(+' + change + ')';
    changeEl.style.color = 'var(--success)';
  } else if(change < 0){
    changeEl.textContent = '(' + change + ')';
    changeEl.style.color = 'var(--danger)';
  } else {
    changeEl.textContent = '(±0)';
    changeEl.style.color = 'var(--text2)';
  }
  
  // 渲染差异
  let html = '';
  diff.forEach(item => {
    if(item.type === 'same'){
      html += '<p style="margin-bottom:8px">' + esc(item.text) + '</p>';
    } else if(item.type === 'add'){
      html += '<p style="margin-bottom:8px" class="diff-section"><span class="diff-add">' + esc(item.text) + '</span></p>';
    } else if(item.type === 'del'){
      html += '<p style="margin-bottom:8px" class="diff-section"><span class="diff-del">' + esc(item.text) + '</span></p>';
    } else if(item.type === 'modify'){
      // 词级别差异
      let lineHtml = '';
      if(item.wordDiff){
        item.wordDiff.forEach(wd => {
          if(wd.type === 'same') lineHtml += esc(wd.text);
          else if(wd.type === 'add') lineHtml += '<span class="diff-add">' + esc(wd.text) + '</span>';
          else if(wd.type === 'del') lineHtml += '<span class="diff-del">' + esc(wd.text) + '</span>';
        });
      } else {
        lineHtml = '<span class="diff-del">' + esc(item.old) + '</span> <span class="diff-add">' + esc(item.new) + '</span>';
      }
      html += '<p style="margin-bottom:8px" class="diff-section">' + lineHtml + '</p>';
    }
  });
  
  container.innerHTML = html;
  document.getElementById('diffCompareOv').classList.add('show');
  navPush('diffCompareOv');
}

function closeDiffCompare(){
  navPop('diffCompareOv');
  document.getElementById('diffCompareOv').classList.remove('show');
}

// 恢复原文
function revertDiff(){
  if(!_diffOldText){showToast('没有原文可恢复');return;}
  if(_diffTarget === 'editor'){
    const ta = document.getElementById('edTextarea');
    if(ta){
      ta.value = _diffOldText;
      onEditorInput();
      showToast('已恢复原文 ↩');
    }
  } else if(_diffTarget === 'reading' && curRd){
    if(curRd.type === 'long' && curRd.chapters && _diffChIdx >= 0){
      curRd.chapters[_diffChIdx] = _diffOldText;
    } else {
      curRd.content = _diffOldText;
    }
    syncArticle(curRd);
    renderChContent();
    showToast('已恢复原文 ↩');
  }
  closeDiffCompare();
}

// 确认采纳
function acceptDiff(){
  closeDiffCompare();
  showToast('已采纳修改');
  // 新文本已经在调用showDiffCompare之前就写入了，所以直接关闭即可
}
function copyExpandResult(){
const text=document.getElementById('expandOutput').value;
if(!text){showToast('没有内容可复制');return;}
doCopy(text);
}
function applyExpandResult(){
const text=document.getElementById('expandOutput').value;
if(!text||text.startsWith('处理失败')||text==='正在处理...'){showToast('没有有效结果');return;}
const ta=document.getElementById('edTextarea');
const original=document.getElementById('expandInput').value;
// 尝试替换原文
const currentText=ta.value;
if(currentText.includes(original)){
edPushUndo(currentText,curEdCh); // 替换前先记撤回点，不依赖3秒防抖，点了就能立刻撤回
ta.value=currentText.replace(original,text);
onEditorInput();
closeExpandOv();
showToast('已替换原文');
}else{
// 原文不在当前章节，追加到末尾
showDlg('无法定位原文','原文不在当前章节中，是否将结果追加到章节末尾？',()=>{
edPushUndo(currentText,curEdCh); // 用户确认追加后才记撤回点，不然点"取消"也会留下一个没意义的撤回点
ta.value=currentText+'\n\n'+text;
onEditorInput();
closeExpandOv();
showToast('已追加到末尾');
});
}
}
function setTempPreset(temp,name){
document.getElementById('apiTemp').value=temp;
document.getElementById('quickTemp').value=temp;
document.getElementById('qtVal').textContent=temp;
showToast('已切换为「'+name+'」模式 (T='+temp+')');
}
function toggleStreamSwitch(el){
const cb=document.getElementById('streamOn');
cb.checked=!cb.checked;
useStream=cb.checked;
// [FIX-3] 同步更新 aria-checked 状态
if(el && el.setAttribute) el.setAttribute('aria-checked', useStream ? 'true' : 'false');
sv('bj_stream',useStream);
updateStreamUI();
showToast(useStream?'已开启流式输出':'已关闭流式输出');
}
function updateStreamUI(){
const track=document.getElementById('streamTrack');
const thumb=document.getElementById('streamThumb');
if(useStream){
track.style.background='var(--accent)';
thumb.style.left='22px';
}else{
track.style.background='var(--border)';
thumb.style.left='2px';
}
// [FIX-3] 初始化时同步 aria-checked
var sw=track&&track.parentElement;
if(sw&&sw.setAttribute)sw.setAttribute('aria-checked',useStream?'true':'false');
}
// ==================== 故事转盘 ====================
let storyWheels=ld('bj_storyWheels',[]);
let wheelResults=[];
let editingWheelIdx=-1;

const defaultWheels=[
{name:'故事标签',spinCount:2,options:['甜文','虐文','悬疑','奇幻','校园','职场','古风','现代','穿越','重生','豪门','娱乐圈','电竞','医疗','刑侦'],used:[]},
{name:'女主职业',spinCount:1,options:['医生','律师','教师','记者','设计师','程序员','作家','演员','警察','厨师','画家','舞者','科学家','侦探','花店老板'],used:[]},
{name:'男主职业',spinCount:1,options:['总裁','军人','医生','律师','教授','警察','特工','厨师','音乐家','运动员','建筑师','飞行员','消防员','兽医','咖啡店主'],used:[]}
];

function openWheelPanel(){
if(storyWheels.length===0){
storyWheels=JSON.parse(JSON.stringify(defaultWheels));
sv('bj_storyWheels',storyWheels);
}
wheelResults=[];
renderWheelList();
document.getElementById('wheelResultArea').style.display='none';
document.getElementById('wheelStoryArea').style.display='none';
document.getElementById('wheelOv').classList.add('show');
navPush('wheelOv');
document.getElementById('bnav').classList.add('hide');
// 首次打开引导气泡
if(!ld('bj_wheelGuideShown',false)){
  sv('bj_wheelGuideShown',true);
  setTimeout(function(){
    var tip=document.createElement('div');
    tip.id='wheelGuideTip';
    tip.style.cssText='position:fixed;top:68px;right:16px;z-index:9500;background:linear-gradient(135deg,var(--accent),var(--accent2));color:#fff;font-size:12px;font-weight:600;line-height:1.6;padding:10px 14px;border-radius:12px;box-shadow:0 4px 18px rgba(108,92,231,.45);max-width:230px;pointer-events:none;animation:wheelTipIn .35s cubic-bezier(.4,0,.2,1)';
    tip.textContent='点右上角的 + 号可以创建自己的转盘，比如「反派结局」';
    var arr=document.createElement('div');
    arr.style.cssText='position:absolute;top:-7px;right:24px;width:0;height:0;border-left:7px solid transparent;border-right:7px solid transparent;border-bottom:7px solid var(--accent)';
    tip.appendChild(arr);
    document.body.appendChild(tip);
    setTimeout(function(){var t=document.getElementById('wheelGuideTip');if(t)t.remove();},4500);
  },600);
}
}

function closeWheelPanel(){
  navPop('wheelOv');
  document.getElementById('wheelOv').classList.remove('show');
  document.getElementById('bnav').classList.remove('hide');
  // 清理可能残留的引导气泡
  var tip=document.getElementById('wheelGuideTip');
  if(tip)tip.remove();
}

function renderWheelList(){
const container=document.getElementById('wheelList');
if(storyWheels.length===0){
container.innerHTML=`
<div class="wheel-empty" style="grid-column:1/-1">
<div class="wheel-empty-icon"><i class="fas fa-dice"></i></div>
<div class="wheel-empty-text">还没有转盘<br>创建你的第一个转盘，开始随机故事之旅！</div>
<button class="wheel-empty-btn" onclick="addWheel()"><i class="fas fa-plus"></i> 创建转盘</button>
</div>`;
return;
}
container.innerHTML='';
storyWheels.forEach((w,i)=>{
const usedCount=w.used?w.used.length:0;
const totalCount=w.options?w.options.length:0;
const availableCount=totalCount-usedCount;
const card=document.createElement('div');
card.className='wheel-card';

// 生成选项预览标签
let optTagsHtml='';
const showOpts=(w.options||[]).slice(0,8);
showOpts.forEach(opt=>{
const isUsed=(w.used||[]).includes(opt);
optTagsHtml+=`<span class="wheel-opt-tag ${isUsed?'used':''}">${esc(opt)}</span>`;
});
if(totalCount>8)optTagsHtml+=`<span class="wheel-opt-tag">+${totalCount-8}</span>`;

card.innerHTML=`
<div class="wheel-card-hdr">
<div>
<div class="wheel-card-title">${esc(w.name||'未命名转盘')}</div>
<div class="wheel-card-meta">
<span><i class="fas fa-bullseye"></i> 转${w.spinCount||1}次</span>
<span><i class="fas fa-box-open"></i> ${totalCount}项</span>
<span style="color:${availableCount>0?'var(--success)':'var(--danger)'}"><i class="fas fa-wand-magic-sparkles"></i> 剩${availableCount}项</span>
</div>
</div>
<div class="wheel-card-acts">
<button onclick="editWheel(${i})" title="编辑"><i class="fas fa-pencil"></i></button>
<button onclick="resetSingleWheel(${i})" title="重置此转盘"><i class="fas fa-rotate-right"></i></button>
<button class="del" onclick="deleteWheel(${i})" title="删除"><i class="fas fa-trash-alt"></i></button>
</div>
</div>
<div class="wheel-display">
<div class="wheel-outer-ring"></div>
<div class="wheel-pointer"></div>
<div class="wheel-container">
<div class="wheel-circle" id="wheelCircle${i}"></div>
<div class="wheel-center"><i class="fas fa-dice"></i></div>
</div>
</div>
<div class="wheel-options-preview">${optTagsHtml}</div>
<div id="wheelResult${i}" style="display:none"></div>
`;
container.appendChild(card);
});
}

function addWheel(){
editingWheelIdx=-1;
document.getElementById('wheelEditTitle').textContent='添加转盘';
document.getElementById('wheelName').value='';
document.getElementById('wheelSpinCount').value=1;
document.getElementById('wheelSpinVal').textContent='1';
document.getElementById('wheelOptions').value='';
document.getElementById('aiGenOptArea').style.display='none';
document.getElementById('wheelEditOv').classList.add('show');
navPush('wheelEditOv');
}

function editWheel(idx){
if(idx<0||idx>=storyWheels.length)return;
editingWheelIdx=idx;
const w=storyWheels[idx];
document.getElementById('wheelEditTitle').textContent='编辑转盘';
document.getElementById('wheelName').value=w.name||'';
document.getElementById('wheelSpinCount').value=w.spinCount||1;
document.getElementById('wheelSpinVal').textContent=w.spinCount||1;
document.getElementById('wheelOptions').value=(w.options||[]).join('\n');
document.getElementById('aiGenOptArea').style.display='none';
document.getElementById('wheelEditOv').classList.add('show');
}

function closeWheelEdit(){
  navPop('wheelEditOv');
document.getElementById('wheelEditOv').classList.remove('show');
editingWheelIdx=-1;
}

function saveWheel(){
const name=(document.getElementById('wheelName').value||'').trim()||'未命名转盘';
const spinCount=parseInt(document.getElementById('wheelSpinCount').value)||1;
const optionsText=document.getElementById('wheelOptions').value||'';
const options=optionsText.split('\n').map(o=>o.trim()).filter(o=>o);
if(options.length<2){
showToast('至少需要2个选项');
return;
}
if(editingWheelIdx>=0&&editingWheelIdx<storyWheels.length){
storyWheels[editingWheelIdx].name=name;
storyWheels[editingWheelIdx].spinCount=spinCount;
storyWheels[editingWheelIdx].options=options;
// 清理已用列表中不存在的选项
storyWheels[editingWheelIdx].used=(storyWheels[editingWheelIdx].used||[]).filter(u=>options.includes(u));
showToast('转盘已更新');
}else{
storyWheels.push({name,spinCount,options,used:[]});
showToast('转盘已添加');
}
sv('bj_storyWheels',storyWheels);
closeWheelEdit();
renderWheelList();
}

function deleteWheel(idx){
if(idx<0||idx>=storyWheels.length)return;
showDlg('删除转盘','确定要删除「'+storyWheels[idx].name+'」吗？',()=>{
storyWheels.splice(idx,1);
sv('bj_storyWheels',storyWheels);
renderWheelList();
showToast('转盘已删除');
},true);
}

function resetSingleWheel(idx){
if(idx<0||idx>=storyWheels.length)return;
storyWheels[idx].used=[];
sv('bj_storyWheels',storyWheels);
const resultDiv=document.getElementById('wheelResult'+idx);
if(resultDiv)resultDiv.style.display='none';
renderWheelList();
showToast('「'+storyWheels[idx].name+'」已重置');
}

function resetAllWheels(){
showDlg('重置所有转盘','确定要重置所有转盘的已用状态吗？',()=>{
storyWheels.forEach(w=>{w.used=[];});
sv('bj_storyWheels',storyWheels);
wheelResults=[];
document.getElementById('wheelResultArea').style.display='none';
document.getElementById('wheelStoryArea').style.display='none';
renderWheelList();
showToast('已重置所有转盘');
});
}

async function spinAllWheels(){
if(storyWheels.length===0){
showToast('请先添加转盘');
return;
}
// 检查是否有可用选项
let hasAvailable=false;
storyWheels.forEach(w=>{
const available=(w.options||[]).filter(o=>!(w.used||[]).includes(o));
if(available.length>0)hasAvailable=true;
});
if(!hasAvailable){
showToast('所有转盘都已用完，请重置后再试');
return;
}

const btn=document.getElementById('spinAllBtn');
btn.disabled=true;
btn.innerHTML='<span class="wheel-spin-icon" style="animation:none"><i class="fas fa-hourglass-half"></i></span><span>转动中...</span>';

wheelResults=[];

for(let i=0;i<storyWheels.length;i++){
const w=storyWheels[i];
const available=(w.options||[]).filter(o=>!(w.used||[]).includes(o));
if(available.length===0){
continue;
}
const spinCount=Math.min(w.spinCount||1,available.length);
const results=[];
for(let s=0;s<spinCount;s++){
const currentAvailable=(w.options||[]).filter(o=>!(w.used||[]).includes(o));
if(currentAvailable.length===0)break;
const result=await spinSingleWheel(i,currentAvailable);
if(result){
results.push(result);
wheelResults.push({wheel:w.name,value:result});
w.used.push(result);
}
if(s<spinCount-1)await new Promise(r=>setTimeout(r,500));
}
// 显示该转盘的结果
showSingleWheelResult(i,results);
if(i<storyWheels.length-1)await new Promise(r=>setTimeout(r,300));
}

sv('bj_storyWheels',storyWheels);
renderWheelList();
showWheelResults();

btn.disabled=false;
btn.innerHTML='<span class="wheel-spin-icon"><i class="fas fa-dice"></i></span><span>再转一次！</span>';
}

function spinSingleWheel(wheelIdx,available){
return new Promise(resolve=>{
const circle=document.getElementById('wheelCircle'+wheelIdx);
if(!circle||available.length===0){resolve(null);return;}

const randomIdx=Math.floor(Math.random()*available.length);
const result=available[randomIdx];

// 计算旋转角度
const spins=4+Math.floor(Math.random()*3);
const randomOffset=Math.random()*360;
const totalAngle=spins*360+randomOffset;

circle.style.transition='transform 3s cubic-bezier(.17,.67,.12,.99)';
circle.style.transform='rotate('+totalAngle+'deg)';

setTimeout(()=>{
resolve(result);
},3000);
});
}

function showSingleWheelResult(idx,results){
const resultDiv=document.getElementById('wheelResult'+idx);
if(!resultDiv||results.length===0)return;
resultDiv.style.display='block';
resultDiv.className='wheel-spin-result';
resultDiv.innerHTML=`
<div class="wheel-spin-result-label"><i class="fas fa-bullseye"></i> 本轮结果</div>
<div class="wheel-spin-result-value">${results.map(r=>esc(r)).join(' · ')}</div>
`;
}

function showWheelResults(){
if(wheelResults.length===0)return;
const area=document.getElementById('wheelResultArea');
const tags=document.getElementById('wheelResultTags');
area.style.display='block';
tags.innerHTML='';
wheelResults.forEach((r,i)=>{
const tag=document.createElement('span');
tag.className='wheel-result-tag';
tag.style.animationDelay=(i*0.1)+'s';
tag.textContent=r.value;
tag.title='来自：'+r.wheel;
tags.appendChild(tag);
});
// 滚动到结果区域
setTimeout(()=>{
area.scrollIntoView({behavior:'smooth',block:'center'});
},100);
}

function copyWheelResult(){
if(wheelResults.length===0){showToast('还没有转盘结果');return;}
const text=wheelResults.map(r=>r.value).join('、');
doCopy(text);
showToast('已复制：'+text);
}

function copyWheelStory(){
const content=document.getElementById('wheelStoryContent').value;
if(!content){showToast('没有故事内容');return;}
doCopy(content);
showToast('故事梗概已复制');
}

function useWheelStory(){
const content=document.getElementById('wheelStoryContent').value;
if(!content){showToast('没有故事内容');return;}
closeWheelPanel();
document.getElementById('searchInput').value=content;
const wsBtn=document.querySelector('.bnav-i');
switchPage('workshop',wsBtn);
showToast('已填入作坊，可以开始创作啦');
}
function saveWheelStoryToDraft(){
  const el=document.getElementById('wheelStoryContent');
  if(!el)return;
  const text=(el.value||'').trim();
  if(!text){
    showToast('没有梗概可以保存');
    return;
  }
  const title='转盘故事梗概 '+new Date().toLocaleString();
  const work={
    id:uid(),
    type:'draft',
    title:title,
    content:text,
    createdAt:new Date().toISOString(),
    updatedAt:new Date().toISOString()
  };
  crWorks.unshift(work);
  sv('bj_crWorks',crWorks);
  showToast('梗概已保存到创作草稿');
}
async function aiGenStoryFromWheel(){
if(wheelResults.length===0){showToast('请先转动转盘');return;}
const cfg=getCurApi();
if(!cfg.url||!cfg.key){showToast('请先在设置中配置API');return;}

const btn=document.getElementById('wheelAiBtn');
btn.disabled=true;
btn.innerHTML='生成中 <span class="ldots"><span></span><span></span><span></span></span>';

const keywords=wheelResults.map(r=>r.wheel+'：'+r.value).join('\n');

let sysMsg='你做过一件很厉害的事：把任何一组看似不搭的词，拼成一个让人想继续看下去的故事开局。这不是凑字数，是真正想清楚了"这几个词放在一起，什么情况才会同时成立"。\n\n';
sysMsg+='【生成要求】\n';
sysMsg+='- 150-250字，不超不少\n';
sysMsg+='- 所有给定关键词必须自然融入，不能生硬堆砌\n';
sysMsg+='- 要有具体的人物、一个核心冲突、一个隐约的走向\n';
sysMsg+='- 要有让人想知道"然后呢"的悬念感\n';
sysMsg+='- 直接输出梗概正文，不要标题不要说明\n';

const userMsg='请根据以下随机抽取的关键词生成故事梗概：\n\n'+keywords;
const messages=[{role:'system',content:sysMsg},{role:'user',content:userMsg}];

const storyArea=document.getElementById('wheelStoryArea');
const storyContent=document.getElementById('wheelStoryContent');
storyArea.style.display='block';
storyContent.value='正在构思故事...';

if(useStream){
  await callAPIStream(messages,
    (text)=>{
      storyContent.value=text;
    },
    (text)=>{
      btn.disabled=false;
      btn.textContent='重新生成';
      if(text){
        storyContent.value=text;
        storyArea.scrollIntoView({behavior:'smooth',block:'center'});
      }
    },
    (err)=>{
      btn.disabled=false;
      btn.textContent='AI生成梗概';
      storyContent.value='生成失败：'+err;
    }
  );
}else{
  const result=await callAPINonStream(messages);
  btn.disabled=false;
  btn.textContent='重新生成';
  if(result){
    storyContent.value=result;
    storyArea.scrollIntoView({behavior:'smooth',block:'center'});
  }else{
    storyContent.value='生成失败，请检查API设置';
  }
}
}

function aiGenWheelOptions(){
const area=document.getElementById('aiGenOptArea');
area.style.display=area.style.display==='none'?'block':'none';
if(area.style.display==='block'){
document.getElementById('aiGenOptPrompt').focus();
}
}

async function doAiGenOptions(){
const prompt=(document.getElementById('aiGenOptPrompt').value||'').trim();
if(!prompt){showToast('请输入需求描述');return;}
const cfg=getCurApi();
if(!cfg.url||!cfg.key){showToast('请先在设置中配置API');return;}

const btn=document.getElementById('doAiGenBtn');
btn.disabled=true;
btn.innerHTML='生成中...';

let sysMsg='你是一台高密度联想引擎，专门为随机轮盘生成选项池。你的原则是：每个选项都不废话，但每个选项都有故事。\n\n';
sysMsg+='【生成规则】\n';
sysMsg+='- 每行一个选项，每个选项2-6个字\n';
sysMsg+='- 数量：15-25个\n';
sysMsg+='- 选项之间不能重复、不能太近义——轮盘转出来每一格都要有惊喜感\n';
sysMsg+='- 口语化优先，避免"正式文件"风格\n';
sysMsg+='- 只输出选项，不要编号、解释或任何多余内容\n';

const messages=[{role:'system',content:sysMsg},{role:'user',content:prompt}];
const result=await callToolAPINonStream(messages);

btn.disabled=false;
btn.textContent='生成';

if(result){
const current=document.getElementById('wheelOptions').value;
const newOpts=result.split('\n').map(l=>l.replace(/^\d+[\.\、\)\]]\s*/,'').trim()).filter(l=>l).join('\n');
document.getElementById('wheelOptions').value=current?(current+'\n'+newOpts):newOpts;
document.getElementById('aiGenOptArea').style.display='none';
document.getElementById('aiGenOptPrompt').value='';
showToast('选项已生成');
}else{
showToast('生成失败，请重试');
}
}

const presetOptionsData={
'故事标签':['甜文','虐文','悬疑','奇幻','校园','职场','古风','现代','穿越','重生','豪门','娱乐圈','电竞','医疗','刑侦','末日','科幻','仙侠','都市','乡村','军旅','谍战'],
'女性职业':['医生','律师','教师','记者','设计师','程序员','作家','演员','警察','厨师','画家','舞者','科学家','侦探','花店老板','咖啡师','摄影师','翻译','会计','护士','主播','调酒师'],
'男性职业':['总裁','军人','医生','律师','教授','警察','特工','厨师','音乐家','运动员','建筑师','飞行员','消防员','兽医','咖啡店主','作家','画家','程序员','记者','导演','赛车手','调香师'],
'性格特点':['高冷','温柔','毒舌','腹黑','傲娇','天然呆','话痨','社恐','阳光','忧郁','神秘','热情','冷漠','善良','偏执','温润','霸道','内敛','活泼','闷骚','洁癖','强迫症'],
'故事场景':['校园','医院','律所','警局','公司','咖啡馆','书店','花店','酒吧','海边','山村','古镇','都市','异世界','宫廷','江湖','战场','孤岛','雪山','森林','沙漠','太空站'],
'故事元素':['误会','重逢','复仇','救赎','守护','背叛','失忆','穿越','契约','假戏真做','青梅竹马','欢喜冤家','先婚后爱','破镜重圆','日久生情','一见钟情','暗恋成真','双向奔赴','替身梗','双胞胎'],
'情感基调':['甜蜜','虐心','治愈','搞笑','紧张','温馨','悲伤','热血','浪漫','刺激','感动','压抑','轻松','沉重','欢快','忧伤'],
'时代背景':['现代都市','民国乱世','古代宫廷','架空王朝','末日废土','近未来','平行世界','仙侠世界','西方中世纪','战争年代','八九十年代','千禧年代']
};

function loadPresetOptions(){
const container=document.getElementById('presetOptList');
container.innerHTML='';
Object.keys(presetOptionsData).forEach(name=>{
const opts=presetOptionsData[name];
const div=document.createElement('div');
div.style.cssText='padding:14px;background:var(--card);border:1px solid var(--border);border-radius:12px;margin-bottom:10px;cursor:pointer;transition:all .2s';
div.onmouseenter=()=>{div.style.borderColor='var(--accent)';div.style.transform='translateX(4px)';};
div.onmouseleave=()=>{div.style.borderColor='var(--border)';div.style.transform='';};
div.innerHTML=`
<div style="font-size:14px;font-weight:600;color:var(--text);margin-bottom:6px;display:flex;align-items:center;gap:6px">
<span style="font-size:16px">${getPresetIcon(name)}</span>
${esc(name)}
</div>
<div style="font-size:11px;color:var(--text2);line-height:1.6">${opts.length}个选项：${opts.slice(0,6).join('、')}${opts.length>6?'...':''}</div>
`;
div.onclick=()=>{
const current=document.getElementById('wheelOptions').value;
const newOpts=opts.join('\n');
document.getElementById('wheelOptions').value=current?(current+'\n'+newOpts):newOpts;
if(!document.getElementById('wheelName').value){
document.getElementById('wheelName').value=name;
}
closePresetOpt();
showToast('已加载「'+name+'」模板');
};
container.appendChild(div);
});
document.getElementById('presetOptOv').classList.add('show');
navPush('presetOptOv');
}

function getPresetIcon(name){
const icons={
'故事标签':'<i class="fas fa-tag"></i>',
'女性职业':'<i class="fas fa-venus"></i>',
'男性职业':'<i class="fas fa-mars"></i>',
'性格特点':'<i class="fas fa-brain"></i>',
'故事场景':'<i class="fas fa-house"></i>',
'故事元素':'<i class="fas fa-puzzle-piece"></i>',
'情感基调':'<i class="fas fa-heart" style="color:#ff6b6b"></i>',
'时代背景':'<i class="fas fa-clock-rotate-left"></i>'
};
return icons[name]||'<i class="fas fa-box-open"></i>';
}

function closePresetOpt(){
  navPop('presetOptOv');
document.getElementById('presetOptOv').classList.remove('show');
}
// ==================== NAME GENERATOR ====================
let nameGenType='char';
let nameGenStyle='';

function openNameGen(){
document.getElementById('nameGenDesc').value='';
document.getElementById('nameGenResult').style.display='none';
document.getElementById('nameGenBtn').disabled=false;
document.getElementById('nameGenBtn').textContent='生成名字';
nameGenType='char';
nameGenStyle='';
document.getElementById('nameTypeChar').classList.add('act');
document.getElementById('nameTypeBook').classList.remove('act');
document.getElementById('nameTypePlace').classList.remove('act');
document.querySelectorAll('#nameGenOv .tag').forEach(t=>{
if(t.onclick&&t.onclick.toString().includes('setNameStyle'))t.classList.remove('act');
});
document.getElementById('nameGenOv').classList.add('show');
navPush('nameGenOv');
setTimeout(()=>document.getElementById('nameGenDesc').focus(),200);
}

function closeNameGen(){
  navPop('nameGenOv');
document.getElementById('nameGenOv').classList.remove('show');
}

function setNameType(type){
nameGenType=type;
document.getElementById('nameTypeChar').classList.toggle('act',type==='char');
document.getElementById('nameTypeBook').classList.toggle('act',type==='book');
document.getElementById('nameTypePlace').classList.toggle('act',type==='place');
}

function setNameStyle(style,el){
nameGenStyle=style;
const parent=el.parentElement;
parent.querySelectorAll('.tag').forEach(t=>{
if(t.onclick&&t.onclick.toString().includes('setNameStyle'))t.classList.remove('act');
});
el.classList.add('act');
}

async function doGenNames(){
const cfg=getCurApi();
if(!cfg.url||!cfg.key){showToast('请先在设置中配置API');return;}

const desc=(document.getElementById('nameGenDesc').value||'').trim();
const btn=document.getElementById('nameGenBtn');
btn.disabled=true;
btn.innerHTML='生成中 <span class="ldots"><span></span><span></span><span></span></span>';

// 构建上下文
let context='';
if(!desc){
// 使用当前设置
const validChars=characters.filter(c=>c.name||c.desc);
if(validChars.length>0&&nameGenType==='char'){
context+='当前人物设定：\n';
validChars.forEach(c=>{
if(c.desc)context+=c.desc.substring(0,100)+'\n';
});
}
const wD=(document.getElementById('worldDesc')&&document.getElementById('worldDesc').value||'').trim();
if(wD)context+='世界观：'+wD.substring(0,200)+'\n';
}else{
context=desc;
}

const typeLabels={char:'人名',book:'书名/小说名',place:'地名/场所名'};
const typeHints={
char:'要求：名字要有寓意或特色，符合角色身份，朗朗上口，避免生僻字',
book:'要求：书名要有吸引力，能体现故事核心，让人想点进去看',
place:'要求：地名要有画面感，符合世界观设定，便于记忆'
};

let sysMsg='你是一位深谙文字美学的命名大师，为无数畅销小说起过名字。\n\n';
sysMsg+='【任务】生成5个'+typeLabels[nameGenType]+'，每个都要独特且有记忆点。\n\n';
sysMsg+='【输出格式】每行一个，格式：\n';
sysMsg+='名字 - 寓意/来源（15字以内）\n\n';
if(nameGenType==='char'){
sysMsg+='【人名技巧】\n';
sysMsg+='- 名字要能暗示性格或命运\n';
sysMsg+='- 避免生僻字，但可以用不常见的组合\n';
sysMsg+='- 姓和名要搭配和谐，读起来顺口\n';
sysMsg+='- 可以藏一些小心思（谐音、典故、意象）\n';
sysMsg+='- 反派的名字也要好听，不要太刻意\n';
}else if(nameGenType==='book'){
sysMsg+='【书名技巧】\n';
sysMsg+='- 要有画面感或情绪感染力\n';
sysMsg+='- 4-8个字最佳，太长记不住\n';
sysMsg+='- 可以用：意象型、悬念型、情感型、人物型\n';
sysMsg+='- 避免烂大街的词（霸道总裁、重生之类）\n';
sysMsg+='- 让人看到书名就想点进去\n';
sysMsg+='【书名禁区——以下模式禁止出现】\n';
sysMsg+='- "无X"开头：无声、无光、无名、无处、无界（滥用到麻木）\n';
sysMsg+='- "X与Y"结构：控制与支配、时间与记忆、光与暗（抽象苍白，无画面感）\n';
sysMsg+='- 单个抽象名词做书名：支配、掌控、沦陷、羁绊、束缚、觉醒\n';
sysMsg+='- 冷僻学术/医学词：无菌、基因、程序、代码、系统（除非明确是硬科幻）\n';
sysMsg+='- 强行高深的哲学词：存在、虚无、本质、意识、永恒\n';
sysMsg+='【好书名的检验标准】能让人脑海浮现一个具体画面，或产生"然后呢？"的冲动。\n';
sysMsg+='参考方向：人物切面（《平凡的世界》）、物件意象（《追风筝的人》）、具体场景（《白夜行》）\n\n';
}else{
sysMsg+='【地名技巧】\n';
sysMsg+='- 要有画面感，让人能想象出场景\n';
sysMsg+='- 符合世界观设定（古风/现代/奇幻）\n';
sysMsg+='- 可以暗示这个地方的特点或历史\n';
sysMsg+='- 便于记忆和口头传播\n';
}
sysMsg+='\n只输出5个名字，不要编号，不要多余内容。\n';

let userMsg='请生成5个'+typeLabels[nameGenType]+'。\n\n';
if(nameGenStyle)userMsg+='风格要求：'+nameGenStyle+'风格\n';
if(context)userMsg+='参考信息：\n'+context;
else userMsg+='自由发挥，生成有特色的名字';

const messages=[{role:'system',content:sysMsg},{role:'user',content:userMsg}];

const resultDiv=document.getElementById('nameGenResult');
const listDiv=document.getElementById('nameGenList');

var result=await callToolAPINonStream(messages);
btn.disabled=false;
btn.textContent='重新生成';
if(result){
resultDiv.style.display='block';
parseAndShowNames(result);
}else{
showToast('生成失败，请检查API设置');
}
}

function parseAndShowNames(text){
const listDiv=document.getElementById('nameGenList');
listDiv.innerHTML='';

const lines=text.split('\n').filter(l=>l.trim());
lines.forEach(line=>{
const cleaned=line.replace(/^\d+[\.\、\)\]\s]*/,'').trim();
if(!cleaned)return;

const item=document.createElement('div');
item.style.cssText='display:flex;justify-content:space-between;align-items:center;padding:10px 12px;background:var(--card);border-radius:8px;border:1px solid var(--border);cursor:pointer;transition:all .2s';
item.onmouseenter=()=>{item.style.borderColor='var(--accent)';item.style.background='rgba(108,92,231,.08)';};
item.onmouseleave=()=>{item.style.borderColor='var(--border)';item.style.background='var(--card)';};

// 分离名字和说明
let name=cleaned;
let hint='';
const sepIdx=cleaned.search(/[\-\—\–\:：]/);
if(sepIdx>0){
name=cleaned.substring(0,sepIdx).trim();
hint=cleaned.substring(sepIdx+1).trim();
}

item.innerHTML=
'<div style="flex:1">'+
'<div style="font-size:14px;font-weight:600;color:var(--text)">'+esc(name)+'</div>'+
(hint?'<div style="font-size:10px;color:var(--text2);margin-top:2px">'+esc(hint)+'</div>':'')+
'</div>'+
'<button style="padding:4px 10px;border-radius:6px;border:1px solid var(--accent);background:transparent;color:var(--accent2);font-size:10px;cursor:pointer;flex-shrink:0" onclick="event.stopPropagation();copyName(\''+esc(name.replace(/'/g,"\\'"))+'\')">复制</button>';

item.onclick=()=>copyName(name);
listDiv.appendChild(item);
});

if(listDiv.children.length===0){
listDiv.innerHTML='<div style="font-size:12px;color:var(--text);white-space:pre-wrap">'+esc(text)+'</div>';
}
}

function copyName(name){
doCopy(name);
showToast('已复制：'+name+'');
}
// ==================== 写作基因提取器 ====================
let sgSrc='paste'; // paste | collection
let sgLevel='mid'; // lite | mid | deep
let sgFmt='text'; // text | json
let sgLastResult=null;
let sgSelectedFav=null;
let sgSelectedNovel=null;

function openStyleGene(){
  sgSrc='paste';sgLevel='mid';sgFmt='text';sgLastResult=null;
  sgSelectedFav=null; sgSelectedNovel=null;
  document.getElementById('sgInputText').value='';
  document.getElementById('sgInputWc').textContent='0 字';
  document.getElementById('sgExtra').value='';
  document.getElementById('sgResultBox').style.display='none';
  document.getElementById('sgResultText').value='';
  document.getElementById('sgGenBtn').disabled=false;
  document.getElementById('sgGenBtn').textContent='提取文风';
  document.getElementById('sgPasteWrap').style.display='';
  document.getElementById('sgColWrap').style.display='none';
  document.getElementById('sgNovelWrap').style.display='none';
  document.getElementById('sgColSelected').style.display='none';
  document.getElementById('sgNovelSelected').style.display='none';
  document.getElementById('sgColPickBtn').innerHTML='<i class="fas fa-bookmark"></i> 点击选择收藏小说';
  document.getElementById('sgNovelPickBtn').innerHTML='<i class="fas fa-book-open"></i> 点击选择小说和章节';
  document.querySelectorAll('#styleGeneOv .cd-role-btn').forEach(function(b){b.classList.remove('act');});
  document.getElementById('sgSrcPaste').classList.add('act');
  document.getElementById('sgLv_mid').classList.add('act');
  document.getElementById('sgFmt_text').classList.add('act');
  document.getElementById('styleGeneOv').classList.add('show');
  navPush('styleGeneOv');
  document.getElementById('bnav').classList.add('hide');
}

function closeStyleGene(){
  navPop('styleGeneOv');
  document.getElementById('styleGeneOv').classList.remove('show');
  document.getElementById('bnav').classList.remove('hide');
}

function setSgSrc(src,el){
  sgSrc=src;
  document.getElementById('sgSrcPaste').classList.toggle('act',src==='paste');
  document.getElementById('sgSrcCol').classList.toggle('act',src==='collection');
  document.getElementById('sgSrcNovel').classList.toggle('act',src==='novel');
  document.getElementById('sgPasteWrap').style.display=src==='paste'?'':'none';
  document.getElementById('sgColWrap').style.display=src==='collection'?'':'none';
  document.getElementById('sgNovelWrap').style.display=src==='novel'?'':'none';
}

function setSgLevel(lv,el){
  sgLevel=lv;
  document.querySelectorAll('#styleGeneOv [id^="sgLv_"]').forEach(function(b){b.classList.remove('act');});
  el.classList.add('act');
  var hints={
    lite:'轻度：提取整体基调和节奏感，约100-200字',
    mid:'中度：提取叙述节奏、对话风格、情感基调、常用修辞手法，约200-400字',
    deep:'深度：逐项拆解叙述视角、句式偏好、感官倾向、情绪表达、对话特征、节奏模式等，约400-700字'
  };
  document.getElementById('sgLevelHint').textContent=hints[lv]||'';
}

function setSgFmt(fmt,el){
  sgFmt=fmt;
  document.getElementById('sgFmt_text').classList.toggle('act',fmt==='text');
  document.getElementById('sgFmt_json').classList.toggle('act',fmt==='json');
  var hints={text:'纯文本：适合阅读和手动复制',json:'JSON结构：可一键写回文风设置'};
  document.getElementById('sgFmtHint').textContent=hints[fmt]||'';
}

function openSgFavPicker(){
  var items=[];
  (cols.shorts||[]).forEach(function(s){
    if(countWords(s.content||'')>50) items.push({type:'short',title:s.title||'未命名',content:s.content||'',chapters:null});
  });
  (cols.books||[]).forEach(function(b){
    if(b.chapters&&b.chapters.length>0){
      var totalWc=b.chapters.reduce(function(sum,ch){return sum+countWords(ch||'');},0);
      if(totalWc>50) items.push({type:'book',title:b.title||'未命名',content:'',chapters:b.chapters});
    }
  });
  if(!items.length){showToast('收藏夹里暂无可用内容');return;}
  var html='<div style="display:flex;flex-direction:column;gap:7px;max-height:300px;overflow-y:auto;padding:2px 0">';
  items.forEach(function(item,i){
    var isBook=item.type==='book';
    var chCount=isBook?item.chapters.length:0;
    var wc=isBook?item.chapters.reduce(function(s,c){return s+countWords(c||'');},0):countWords(item.content);
    var tag=isBook?'长篇 · '+chCount+'章':'短篇';
    var tagColor=isBook?'var(--accent2)':'var(--success,#27ae60)';
    html+='<div class="_sgFavItem" data-i="'+i+'" style="padding:10px 14px;border-radius:10px;border:1px solid var(--border);background:var(--card2);cursor:pointer;transition:all .2s;user-select:none">'
      +'<div style="font-size:13px;font-weight:600;color:var(--text);margin-bottom:3px;display:flex;align-items:center;gap:6px">'
      +'<i class="fas fa-'+(isBook?'book-open':'file-alt')+'" style="color:'+tagColor+';font-size:11px"></i>'
      +esc(item.title.substring(0,22))
      +'<span style="margin-left:auto;font-size:10px;color:var(--text2);font-weight:400">'+wc+'字</span></div>'
      +'<div style="font-size:10px;font-weight:600;color:'+tagColor+'">'+tag+'</div>'
      +(isBook&&chCount>5?'<div style="font-size:10px;color:var(--text2);margin-top:2px">章节较多，可自定义发送章节</div>':'')
      +'</div>';
  });
  html+='</div>';
  showDlg('选择收藏小说',html,function(){},false,true);
  setTimeout(function(){
    var okBtn=document.getElementById('dlgOkBtn');
    if(okBtn) okBtn.style.display='none';
    document.querySelectorAll('._sgFavItem').forEach(function(el){
      el.addEventListener('click',function(){
        var i=parseInt(this.dataset.i);
        var item=items[i]; if(!item) return;
        closeDlg();
        if(item.type==='short'){
          setTimeout(function(){_setSgFavResult(item.title,item.content,'');},100);
        } else if(item.chapters.length<=5){
          setTimeout(function(){_setSgFavResult(item.title,item.chapters.join('\n\n'),item.chapters.length+'章全部');},100);
        } else {
          setTimeout(function(){_openSgChapPicker(item.title,item.chapters,'fav');},200);
        }
      });
    });
  },30);
}

function openSgNovelPicker(){
  var novels=(crWorks||[]).filter(function(w){return w.type==='novel'&&w.chapters&&w.chapters.length>0;});
  if(!novels.length){showToast('创作页暂无可用小说');return;}
  var html='<div style="display:flex;flex-direction:column;gap:7px;max-height:300px;overflow-y:auto;padding:2px 0">';
  novels.forEach(function(n,i){
    var chCount=n.chapters.length;
    var wc=n.chapters.reduce(function(s,c){return s+countWords(c||'');},0);
    html+='<div class="_sgNovelItem" data-i="'+i+'" style="padding:10px 14px;border-radius:10px;border:1px solid var(--border);background:var(--card2);cursor:pointer;transition:all .2s;user-select:none;display:flex;align-items:center;gap:10px">'
      +'<i class="fas fa-book-open" style="color:var(--accent2);font-size:14px;flex-shrink:0"></i>'
      +'<div style="flex:1;min-width:0">'
      +'<div style="font-size:13px;font-weight:600;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+esc((n.title||'未命名').substring(0,25))+'</div>'
      +'<div style="font-size:10px;color:var(--text2);margin-top:2px">'+chCount+'章 · '+wc+'字'+(chCount>5?' · 可自定义章节':'')+'</div>'
      +'</div>'
      +'<i class="fas fa-chevron-right" style="color:var(--text2);font-size:11px;flex-shrink:0"></i>'
      +'</div>';
  });
  html+='</div>';
  showDlg('选择我的小说',html,function(){},false,true);
  setTimeout(function(){
    var okBtn=document.getElementById('dlgOkBtn');
    if(okBtn) okBtn.style.display='none';
    document.querySelectorAll('._sgNovelItem').forEach(function(el){
      el.addEventListener('click',function(){
        var i=parseInt(this.dataset.i);
        var n=novels[i]; if(!n) return;
        closeDlg();
        if(n.chapters.length<=5){
          setTimeout(function(){_setSgNovelResult(n.title,n.chapters.join('\n\n'),n.chapters.length+'章全部');},100);
        } else {
          setTimeout(function(){_openSgChapPicker(n.title,n.chapters,'novel');},200);
        }
      });
    });
  },30);
}

function _openSgChapPicker(novelTitle,chapters,target){
  var html='<div style="font-size:11px;color:var(--text2);margin-bottom:10px;line-height:1.6">《'+esc(novelTitle)+'》<br>勾选要发送的章节，最多5章</div>'
    +'<div style="display:flex;flex-direction:column;gap:6px;max-height:280px;overflow-y:auto;padding:2px 0">';
  chapters.forEach(function(ch,i){
    var wc=countWords(ch||''); if(wc<10) return;
    var preview=(ch||'').replace(/\n/g,' ').substring(0,30);
    html+='<label style="display:flex;align-items:flex-start;gap:10px;padding:10px 12px;border-radius:10px;border:1px solid var(--border);background:var(--card2);cursor:pointer;user-select:none;transition:all .2s">'
      +'<input type="checkbox" data-i="'+i+'" class="_sgChapCb" style="margin-top:2px;accent-color:var(--accent);width:15px;height:15px;flex-shrink:0">'
      +'<div style="flex:1;min-width:0">'
      +'<div style="font-size:13px;font-weight:600;color:var(--text)">第'+(i+1)+'章<span style="float:right;font-size:10px;color:var(--text2);font-weight:400">'+wc+'字</span></div>'
      +'<div style="font-size:11px;color:var(--text2);line-height:1.5;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+esc(preview)+'…</div>'
      +'</div></label>';
  });
  html+='</div>';
  showDlg('选择章节',html,function(){
    var checked=document.querySelectorAll('._sgChapCb:checked');
    if(!checked.length){showToast('请至少勾选一章');return;}
    var contents=[];
    checked.forEach(function(cb){var idx=parseInt(cb.dataset.i);if(chapters[idx])contents.push(chapters[idx]);});
    var content=contents.join('\n\n');
    var chDesc=checked.length+'章选段';
    if(target==='fav') _setSgFavResult(novelTitle,content,chDesc);
    else _setSgNovelResult(novelTitle,content,chDesc);
  },false,'确认选择');
  setTimeout(function(){
    var okBtn=document.getElementById('dlgOkBtn');
    if(okBtn){okBtn.textContent='确认选择';}
    // 勾选超5章时自动取消
    document.querySelectorAll('._sgChapCb').forEach(function(cb){
      cb.addEventListener('change',function(){
        var all=document.querySelectorAll('._sgChapCb:checked');
        if(all.length>5){this.checked=false;showToast('最多选5章');}
      });
    });
  },30);
}

function _setSgFavResult(title,content,chDesc){
  sgSelectedFav={title:title,content:content};
  document.getElementById('sgColSelectedTitle').textContent=title+(chDesc?' · '+chDesc:'');
  document.getElementById('sgColSelectedPreview').textContent=content.substring(0,200)+'…';
  document.getElementById('sgColSelected').style.display='';
  document.getElementById('sgColPickBtn').innerHTML='<i class="fas fa-check-circle" style="color:var(--accent2);margin-right:5px"></i>已选：'+esc(title.substring(0,18));
}

function _setSgNovelResult(title,content,chDesc){
  sgSelectedNovel={novelTitle:title,content:content};
  document.getElementById('sgNovelSelectedTitle').textContent='《'+title+'》'+(chDesc?' · '+chDesc:'');
  document.getElementById('sgNovelSelectedPreview').textContent=content.substring(0,200)+'…';
  document.getElementById('sgNovelSelected').style.display='';
  document.getElementById('sgNovelPickBtn').innerHTML='<i class="fas fa-check-circle" style="color:var(--accent2);margin-right:5px"></i>已选：'+esc(title.substring(0,15));
}

// 输入框字数统计
document.addEventListener('input',function(e){
  if(e.target.id==='sgInputText'){
    document.getElementById('sgInputWc').textContent=countWords(e.target.value)+' 字';
  }
});

async function doStyleGeneExtract(){
  var cfg=getCurApi();
  if(!cfg.url||!cfg.key){showToast('请先配置API');return;}
  
  var text='';
  if(sgSrc==='paste'){
    text=(document.getElementById('sgInputText').value||'').trim();
  } else if(sgSrc==='collection'){
    if(!sgSelectedFav){showToast('请先选择一篇收藏短篇');return;}
    text=sgSelectedFav.content.trim();
  } else if(sgSrc==='novel'){
    if(!sgSelectedNovel){showToast('请先选择小说章节');return;}
    text=sgSelectedNovel.content.trim();
  }
  if(countWords(text)<100){showToast('文本太短，至少100字才能有效提取文风');return;}
  
  var extra=(document.getElementById('sgExtra').value||'').trim();
  var btn=document.getElementById('sgGenBtn');
  btn.disabled=true;
  btn.innerHTML='提取中 <span class="ldots"><span></span><span></span><span></span></span>';
  
  var levelDesc={
    lite:'轻度提取：只需整体文风基调（叙事节奏快/慢、情感冷/暖、语言简洁/华丽），100-200字',
    mid:'中度提取：需要拆解叙述节奏、对话风格、情感基调、常用修辞手法、段落节奏、视角偏好，200-400字',
    deep:'深度提取：需要逐项分析以下维度——叙述视角、句式偏好（长句/短句/混合比例）、感官倾向（视/听/嗅/触）、情绪表达方式（直述/隐喻/身体语言）、对话特征（口语化程度/语气词/停顿）、节奏模式（张弛交替方式）、环境描写手法、比喻/通感倾向、留白程度、信息密度。400-700字'
  };
  
  var sysMsg='你是一位文学鉴赏大师和文风分析专家，拥有极其敏锐的语言触觉。\n\n';
  sysMsg+='【你的任务】\n分析用户提供的文本样本，提取其中的"写作基因"——即文风DNA。\n';
  sysMsg+='这个DNA将被用于指导AI模仿这种写法来创作新故事。\n\n';
  sysMsg+='【提取强度】\n'+levelDesc[sgLevel]+'\n\n';
  sysMsg+='【提取方向——你必须覆盖的维度】\n';
  sysMsg+='① 叙述视角与距离：第几人称？全知还是限制？叙述者的介入感强吗？\n';
  sysMsg+='② 句式节奏：长句多还是短句多？断句频率？段落平均多长？\n';
  sysMsg+='③ 感官偏好：最常用哪些感官（视觉/听觉/嗅觉/触觉/味觉）？\n';
  sysMsg+='④ 情绪表达：直接说"她很难过"还是用行为暗示？用什么方式传递情感？\n';
  sysMsg+='⑤ 对话风格：口语化程度？有没有语气词/口头禅/停顿？对话占比？\n';
  sysMsg+='⑥ 修辞倾向：偏好比喻、通感、白描中的哪种？比喻的来源领域？\n';
  sysMsg+='⑦ 环境描写：频率如何？是服务于情绪还是独立审美？\n';
  sysMsg+='⑧ 整体基调：冷/暖？轻/重？明/暗？快/慢？\n\n';
  
  if(sgFmt==='json'){
    sysMsg+='【输出格式——JSON模式（极其重要，违反即废稿）】\n';
    sysMsg+='你的整个回复必须是且仅是一个合法的JSON对象。\n';
    sysMsg+='禁止在JSON前后写任何文字。禁止使用```代码块。禁止使用单引号。\n';
    sysMsg+='所有键名和字符串值都用双引号。字符串值中的换行用\\n表示，不要用真实换行。\n';
    sysMsg+='你的回复的第一个字符必须是 { ，最后一个字符必须是 } 。\n';
    sysMsg+='{\n';
    sysMsg+='  "summary": "一句话概括这种文风（20字以内）",\n';
    sysMsg+='  "styleDesc": "完整的文风描述（可直接用于指导AI写作的提示词）",\n';
    sysMsg+='  "narrative": "叙述视角和距离",\n';
    sysMsg+='  "rhythm": "句式节奏特征",\n';
    sysMsg+='  "sensory": "感官偏好",\n';
    sysMsg+='  "emotion": "情绪表达方式",\n';
    sysMsg+='  "dialogue": "对话风格",\n';
    sysMsg+='  "rhetoric": "修辞倾向",\n';
    sysMsg+='  "tone": "整体基调关键词（3-5个，逗号分隔）"\n';
    sysMsg+='}\n';
  }else{
    sysMsg+='【输出格式——纯文本模式】\n';
    sysMsg+='按以下模板输出：\n\n';
    sysMsg+='【一句话概括】XXX\n\n';
    sysMsg+='【文风描述（可直接作为AI写作指导）】\n';
    sysMsg+='（这部分要写成可以直接粘贴到"文风设置"里使用的完整描述）\n\n';
    sysMsg+='【分项拆解】\n';
    sysMsg+='叙述视角：...\n';
    sysMsg+='句式节奏：...\n';
    sysMsg+='感官偏好：...\n';
    sysMsg+='情绪表达：...\n';
    sysMsg+='对话风格：...\n';
    sysMsg+='修辞倾向：...\n';
    sysMsg+='整体基调：...\n';
  }
  sysMsg+='\n【铁律】不要输出思维过程、分析步骤。直接输出结果。\n';
  
  var userMsg='请从以下文本样本中提取文风基因：\n\n'+text.substring(0,6000);
  if(extra)userMsg+='\n\n【额外需求】'+extra;
  
  var result=await callToolAPINonStream([{role:'system',content:sysMsg},{role:'user',content:userMsg}]);
  btn.disabled=false;
  btn.textContent='重新提取';
  
  if(result){
    var cleaned=stripMetaThinking(result);
    document.getElementById('sgResultText').value=cleaned;
    document.getElementById('sgResultWc').textContent=countWords(cleaned)+'字';
    document.getElementById('sgResultBox').style.display='';
    parseSgResult(cleaned);
    showToast('文风基因提取完成');
  }else{
    showToast('提取失败，请检查API设置');
  }
}

function parseSgResult(text){
  sgLastResult=null;
  if(!text)return;
  if(sgFmt==='json'){
    try{
      var obj=safeJsonParse(text);
      if(obj&&typeof obj==='object'){
        sgLastResult={
          summary:obj.summary||'',
          styleDesc:obj.styleDesc||'',
          tone:obj.tone||''
        };
        document.getElementById('sgApplyBtn').textContent='写回「'+(obj.summary||'文风').substring(0,10)+'」';
        return;
      }
    }catch(e){}
  }
// 纯文本：提取文风描述部分
  var descMatch=text.match(/【文风描述[^】]*】\s*\n?([\s\S]*?)(?=\n【|$)/);
  var summaryMatch=text.match(/【一句话概括】\s*(.+)/);
  sgLastResult={
    summary:summaryMatch?summaryMatch[1].trim():'',
    styleDesc:descMatch?descMatch[1].trim():text,
    tone:''
  };
  if(sgLastResult.summary){
    document.getElementById('sgApplyBtn').textContent='写回「'+sgLastResult.summary.substring(0,10)+'」';
  }
}

function copySgResult(){
  var t=(document.getElementById('sgResultText').value||'').trim();
  if(!t){showToast('没有结果可复制');return;}
  doCopy(t);
}

function applySgResult(){
  if(!sgLastResult){showToast('请先提取文风');return;}
  var desc=sgLastResult.styleDesc||document.getElementById('sgResultText').value||'';
  if(!desc.trim()){showToast('没有文风内容');return;}
  var styleEl=document.getElementById('styleDesc');
  if(styleEl){
    showDlg('写回文风设置','将提取的文风基因写入当前文风设置？\n\n当前文风'+(styleEl.value.trim()?'将被覆盖':'为空')+'\n\n也可以选择「追加」模式',function(){
      styleEl.value=desc;
      ap.curStyle=desc;
      sv(K.ap,ap);
      if(currentStyleBinding)saveLocalStyle();
      refreshAllCounters();
      showToast('文风已写回');
    });
    setTimeout(function(){
      var okBtn=document.getElementById('dlgOkBtn');
      if(okBtn)okBtn.textContent='覆盖写入';
      var msgEl=document.getElementById('dlgMsg');
      if(msgEl){
        msgEl.innerHTML+='<div style="margin-top:12px"><button onclick="closeDlg();appendSgResult()" style="width:100%;padding:10px;border-radius:10px;border:1px solid var(--accent);background:rgba(108,92,231,.1);color:var(--accent2);font-size:12px;font-weight:600;cursor:pointer"><i class="fas fa-plus"></i> 追加到现有文风末尾</button></div>';
      }
    },50);
  }
}

function appendSgResult(){
  if(!sgLastResult)return;
  var desc=sgLastResult.styleDesc||document.getElementById('sgResultText').value||'';
  var styleEl=document.getElementById('styleDesc');
  if(styleEl){
    var cur=styleEl.value.trim();
    styleEl.value=cur?(cur+'\n\n'+desc):desc;
    ap.curStyle=styleEl.value;
    sv(K.ap,ap);
    if(currentStyleBinding)saveLocalStyle();
    refreshAllCounters();
    showToast('文风已追加');
  }
}

function saveSgAsPreset(){
  var text=(document.getElementById('sgResultText').value||'').trim();
  if(!text){showToast('没有结果可保存');return;}
  var desc='';
  if(sgLastResult&&sgLastResult.styleDesc)desc=sgLastResult.styleDesc;
  else desc=text;
  showInp('保存为文风预设','给这个文风起个名字',function(name){
    styleP.push({name:name,desc:desc});
    sv('bj_styleP',styleP);
    renderStylePresets();
    showToast('文风预设已保存：'+name+'');
  });
}
// ==================== 丰富设定 ====================
var _enrichSettingType='';
var _enrichAppendMode=false;

function openEnrichSetting(type){
  _enrichSettingType=type;
  var titles={world:'世界观设定',style:'文风设置',rule:'规则设置'};
  var icons={world:'fa-globe',style:'fa-feather-alt',rule:'fa-scroll'};
  var el=document.getElementById('enrichSettingTitle');
  if(el)el.innerHTML='<i class="fas '+icons[type]+'"></i> 丰富'+titles[type];
  var refOpts=document.getElementById('enrichRefOpts');
  refOpts.innerHTML='';
  var opts=[
    {id:'enrichRef_chars',label:'人物设定',icon:'fa-user',color:'#3498db'},
    {id:'enrichRef_world',label:'世界观设定',icon:'fa-globe',color:'var(--accent2)',skip:type==='world'},
    {id:'enrichRef_style',label:'文风设置',icon:'fa-feather-alt',color:'#e67e22',skip:type==='style'},
    {id:'enrichRef_rule',label:'规则设置',icon:'fa-scroll',color:'#8e44ad',skip:type==='rule'},
  ];
  opts.forEach(function(opt){
    if(opt.skip)return;
    var div=document.createElement('div');
    div.style.cssText='display:flex;align-items:center;justify-content:space-between;padding:9px 13px;background:var(--card2);border-radius:10px;border:1px solid var(--border)';
    div.innerHTML='<span style="font-size:12px;display:flex;align-items:center;gap:8px"><i class="fas '+opt.icon+'" style="color:'+opt.color+';font-size:12px;width:14px;text-align:center"></i>'+opt.label+'</span>'
      +'<label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:11px;color:var(--text2)">'
      +'<input type="checkbox" id="'+opt.id+'" checked style="accent-color:var(--accent);width:16px;height:16px;cursor:pointer"> 参考</label>';
    refOpts.appendChild(div);
  });
  document.getElementById('enrichReqInput').value='';
  document.getElementById('enrichResult').style.display='none';
  document.getElementById('enrichActions').style.display='none';
  var gb=document.getElementById('enrichGenBtn');
  if(gb){gb.style.display='';gb.disabled=false;gb.innerHTML='<i class="fas fa-wand-magic-sparkles"></i> 开始丰富';}
  document.getElementById('enrichSettingOv').classList.add('show');
  navPush('enrichSettingOv');
  setTimeout(function(){document.getElementById('enrichReqInput').focus();},200);
}

function closeEnrichSetting(){
  navPop('enrichSettingOv');
  document.getElementById('enrichSettingOv').classList.remove('show');
}

async function doEnrichSetting(){
  var cfg=getCurApi();
  if(!cfg.url||!cfg.key){showToast('请先在设置中配置API');return;}
  var req=(document.getElementById('enrichReqInput').value||'').trim();
  if(!req){showToast('请输入丰富需求');return;}
  var btn=document.getElementById('enrichGenBtn');
  btn.disabled=true;
  btn.innerHTML='生成中 <span class="ldots"><span></span><span></span><span></span></span>';
  document.getElementById('enrichResult').style.display='block';
  document.getElementById('enrichActions').style.display='none';
  var resultEl=document.getElementById('enrichResultText');
  resultEl.value='正在生成...';
  var curContent='';
  if(_enrichSettingType==='world'){
    var gw=(document.getElementById('globalWorldDesc')&&document.getElementById('globalWorldDesc').value||'').trim();
    var lw=(document.getElementById('worldDesc')&&document.getElementById('worldDesc').value||'').trim();
    curContent=[gw,lw].filter(Boolean).join('\n\n');
  }else if(_enrichSettingType==='style'){
    curContent=(document.getElementById('styleDesc')&&document.getElementById('styleDesc').value||'').trim();
  }else if(_enrichSettingType==='rule'){
    var gr=(document.getElementById('globalRuleDesc')&&document.getElementById('globalRuleDesc').value||'').trim();
    var lr=(document.getElementById('ruleDesc')&&document.getElementById('ruleDesc').value||'').trim();
    curContent=[gr,lr].filter(Boolean).join('\n\n');
  }
  // 原文超过200字时自动切换为追加模式，防止AI输出比原文字数还少的问题
  _enrichAppendMode=curContent.length>200;
  var refCtx='';
  var refCharsEl=document.getElementById('enrichRef_chars');
  if(refCharsEl&&refCharsEl.checked){
    var vc=characters.filter(function(c){return c.name||c.desc;});
    if(vc.length>0){refCtx+='\n【人物设定】\n';vc.slice(0,5).forEach(function(c){refCtx+=(c.name||'无名')+(c.desc?'：'+c.desc.substring(0,80):'')+'\n';});}
  }
  var refWorldEl=document.getElementById('enrichRef_world');
  if(refWorldEl&&refWorldEl.checked&&_enrichSettingType!=='world'){
    var gw2=(document.getElementById('globalWorldDesc')&&document.getElementById('globalWorldDesc').value||globalWorld||'').trim();
    var lw2=(document.getElementById('worldDesc')&&document.getElementById('worldDesc').value||'').trim();
    var wd=[gw2,lw2].filter(Boolean).join('\n');
    if(wd)refCtx+='\n【世界观设定】\n'+wd.substring(0,500)+'\n';
  }
  var refStyleEl=document.getElementById('enrichRef_style');
  if(refStyleEl&&refStyleEl.checked&&_enrichSettingType!=='style'){
    var st=(document.getElementById('styleDesc')&&document.getElementById('styleDesc').value||'').trim();
    if(st)refCtx+='\n【文风设置】\n'+st.substring(0,250)+'\n';
  }
  var refRuleEl=document.getElementById('enrichRef_rule');
  if(refRuleEl&&refRuleEl.checked&&_enrichSettingType!=='rule'){
    var gr2=(document.getElementById('globalRuleDesc')&&document.getElementById('globalRuleDesc').value||globalRule||'').trim();
    var lr2=(document.getElementById('ruleDesc')&&document.getElementById('ruleDesc').value||'').trim();
    var rd=[gr2,lr2].filter(Boolean).join('\n');
    if(rd)refCtx+='\n【规则设置】\n'+rd.substring(0,350)+'\n';
  }
  var typeName={world:'世界观设定',style:'文风设置',rule:'规则设置'}[_enrichSettingType]||'设定';
  var sysMsg,userMsg;
  if(_enrichAppendMode){
    // 追加模式：原文已较完整，AI只输出新增部分，彻底杜绝输出量少于原文的问题
    sysMsg='你是一位专业创作顾问，精通小说各类设定的设计。\n\n'
      +'【任务】用户已有一份较完整的'+typeName+'。请根据用户的补充需求，只生成新增部分，禁止重复或改写已有内容。\n\n'
      +'【输出规则】\n'
      +'1. 只输出新增内容，不得复述或摘抄原文任何片段\n'
      +'2. 新增量要充足，覆盖用户需求的全部方面，不能蜻蜓点水\n'
      +'3. 不与原有内容矛盾，风格和格式与原文保持一致\n'
      +'4. 直接从新增内容正文开始，不加"新增如下""补充内容："等任何前缀或标题';
    if(refCtx)sysMsg+='\n\n【参考设定（保持一致性）】'+refCtx;
    userMsg='【现有'+typeName+'（只供参考，禁止重复）】\n'+curContent
      +'\n\n【补充需求】\n'+req
      +'\n\n请直接输出新增内容正文（不要重复原文）：';
  }else{
    // 新建/原文极少时：输出完整内容
    sysMsg='你是一位专业创作顾问，精通小说各类设定的设计。\n\n'
      +'【任务】根据用户的需求，生成一份完整的'+typeName+'。\n\n'
      +'【输出规则】\n'
      +'1. 直接输出内容正文，不加说明语或"内容如下"等前缀\n'
      +'2. 结构清晰，内容丰富充实，不能语焉不详\n'
      +'3. 风格统一，逻辑自洽';
    if(refCtx)sysMsg+='\n\n【参考设定（保持一致性）】'+refCtx;
    userMsg='【当前'+typeName+'】\n'+(curContent||'（暂无，请新建）')
      +'\n\n【丰富需求】\n'+req
      +'\n\n请输出完整'+typeName+'：';
  }
  try{
    var result=await callToolAPINonStream([{role:'system',content:sysMsg},{role:'user',content:userMsg}]);
    if(result){
      if(_enrichAppendMode){
        resultEl.value='追加内容（以下均为新增，不含原文）\n────────────────────────\n'+result;
      }else{
        resultEl.value=result;
      }
      var modeNote=document.getElementById('enrichModeNote');
      if(modeNote)modeNote.style.display=_enrichAppendMode?'block':'none';
      btn.style.display='none';
      document.getElementById('enrichActions').style.display='block';
    }else{
      resultEl.value='生成失败，请检查API设置后重试';
      btn.disabled=false;
      btn.innerHTML='<i class="fas fa-wand-magic-sparkles"></i> 开始丰富';
      showToast('AI未返回内容，请检查API设置',3000);
    }
  }catch(e){
    console.error('[doEnrichSetting]',e);
    resultEl.value='出错：'+e.message;
    btn.disabled=false;
    btn.innerHTML='<i class="fas fa-wand-magic-sparkles"></i> 开始丰富';
    showToast('生成失败',3000);
  }
}

function applyEnrichResult(){
  var result=(document.getElementById('enrichResultText').value||'').trim();
  if(!result){showToast('没有内容可使用');return;}
  var typeLabel={world:'世界观',style:'文风',rule:'规则'}[_enrichSettingType]||'';
  showDlg('直接替换'+typeLabel+'设定','将用生成内容替换当前'+typeLabel+'设定，是否继续？（不可撤销）',function(){
    if(_enrichSettingType==='world'){
      var e1=document.getElementById('globalWorldDesc');
      if(e1){e1.value=result;globalWorld=result;sv('bj_globalWorld',globalWorld);try{limitTextarea(e1,3000,'gwCount');}catch(e){}}
    }else if(_enrichSettingType==='style'){
      var e2=document.getElementById('styleDesc');
      if(e2){e2.value=result;try{limitTextarea(e2,600,'stCount');saveLocalStyle();}catch(e){}}
    }else if(_enrichSettingType==='rule'){
      var e3=document.getElementById('globalRuleDesc');
      if(e3){e3.value=result;globalRule=result;sv('bj_globalRule',globalRule);try{limitTextarea(e3,2000,'grCount');}catch(e){}}
    }
    closeEnrichSetting();
    showToast('设定已更新');
  },true);
}
function appendEnrichResult(){
  var raw=(document.getElementById('enrichResultText').value||'');
  // 去掉追加模式的头部提示行后取正文
  var result=raw.replace(/^📌[^\n]*\n────[^\n]*\n?/,'').trim();
  if(!result){showToast('没有内容可追加');return;}
  var typeLabel={world:'世界观',style:'文风',rule:'规则'}[_enrichSettingType]||'';
  var appended=false;
  if(_enrichSettingType==='world'){
    var e1=document.getElementById('globalWorldDesc');
    if(e1){
      var cur1=(e1.value||'').trimEnd();
      e1.value=cur1+(cur1?'\n\n':'')+result;
      globalWorld=e1.value;
      sv('bj_globalWorld',globalWorld);
      try{limitTextarea(e1,3000,'gwCount');}catch(err){}
      appended=true;
    }
  }else if(_enrichSettingType==='style'){
    var e2=document.getElementById('styleDesc');
    if(e2){
      var cur2=(e2.value||'').trimEnd();
      e2.value=cur2+(cur2?'\n\n':'')+result;
      try{limitTextarea(e2,600,'stCount');saveLocalStyle();}catch(err){}
      appended=true;
    }
  }else if(_enrichSettingType==='rule'){
    var e3=document.getElementById('globalRuleDesc');
    if(e3){
      var cur3=(e3.value||'').trimEnd();
      e3.value=cur3+(cur3?'\n\n':'')+result;
      globalRule=e3.value;
      sv('bj_globalRule',globalRule);
      try{limitTextarea(e3,2000,'grCount');}catch(err){}
      appended=true;
    }
  }
  if(!appended){showToast('未找到对应的设定文本框');return;}
  closeEnrichSetting();
  showToast(typeLabel+'设定已追加');
}
function saveEnrichAsPreset(){
  var result=(document.getElementById('enrichResultText').value||'').trim();
  if(!result){showToast('没有内容可保存');return;}
  var typeLabel={world:'世界观',style:'文风',rule:'规则'}[_enrichSettingType]||'';
  showInp('保存'+typeLabel+'预设','为这份丰富后的内容起个预设名称',function(name){
    if(!name){showToast('预设名称不能为空');return;}
    var preset={id:uid(),name:name,desc:result};
    try{
      if(_enrichSettingType==='world'){
        worldP=worldP||[];worldP.push(preset);sv('bj_worldP',worldP);
        renderWorldPresets();if(typeof _presetType!=='undefined'&&_presetType){renderPresetModalList();}
        fillCdWorldSelect();// 同步更新角色设计器里的世界观列表
      }else if(_enrichSettingType==='style'){
        styleP=styleP||[];styleP.push(preset);sv('bj_styleP',styleP);
        renderStylePresets();if(typeof _presetType!=='undefined'&&_presetType){renderPresetModalList();}
      }else if(_enrichSettingType==='rule'){
        ruleP=ruleP||[];ruleP.push(preset);sv('bj_ruleP',ruleP);
        renderRulePresets();if(typeof _presetType!=='undefined'&&_presetType){renderPresetModalList();}
      }
      showToast('已保存'+typeLabel+'预设：「'+name+'」');
    }catch(e){
      console.error('[saveEnrichAsPreset]',e);
      showToast('保存失败：'+e.message,3000);
    }
  });
}

// ==================== 角色设计器 ====================
let cdRole = 'main'; // main, support, npc
let cdFmt = 'text';  // text, json
let cdSelectedTags = [];
let cdLinkedChars = []; // 关联的角色名数组
let cdLastResult = null; // {name,desc,traits,priority,role}

function openCharDesigner(){
  cdRole = 'main';
  cdFmt = 'text';
  cdSelectedTags = [];
  cdLinkedChars = [];
  cdLastResult = null;

  document.getElementById('cdName').value = '';
  document.getElementById('cdPersonality').value = '';
  document.getElementById('cdBackground').value = '';
  document.getElementById('cdAppearance').value = '';
  document.getElementById('cdExtra').value = '';
  document.getElementById('cdResultBox').style.display = 'none';
  document.getElementById('cdResultText').value = '';
  document.getElementById('cdGenBtn').disabled = false;
  document.getElementById('cdGenBtn').textContent = 'AI生成人设';

  // 重置角色定位高亮
  document.querySelectorAll('.cd-role-btn').forEach(function(b){b.classList.remove('act');});
  document.getElementById('cdRole_main').classList.add('act');
  document.getElementById('cdFmt_text').classList.add('act');
  document.getElementById('cdFmt_json').classList.remove('act');
  document.getElementById('cdRoleHint').textContent = '主角：AI会详细描写性格、背景、说话方式、内心矛盾等';
  document.getElementById('cdFmtHint').textContent = '纯文本：适合阅读和手动复制 · JSON：适合一键写回人物设定';

  renderCdTags();
  renderCdLinks();
  fillCdWorldSelect();
  fillCdLinkSelect();

  document.getElementById('charDesignerOv').classList.add('show');
  navPush('charDesignerOv');
  document.getElementById('bnav').classList.add('hide');
}

function closeCharDesigner(){
  navPop('charDesignerOv');
  document.getElementById('charDesignerOv').classList.remove('show');
  document.getElementById('bnav').classList.remove('hide');
}

function setCdRole(role, el){
  cdRole = role;
  document.querySelectorAll('#charDesignerOv .cd-role-btn').forEach(function(b){
    if(b.id && b.id.startsWith('cdRole_')) b.classList.remove('act');
  });
  el.classList.add('act');
  var hints = {
    main: '主角：AI会详细描写性格、背景、说话方式、内心矛盾等',
    support: '配角：AI会侧重角色定位、与主角的关系、标志性特征',
    npc: 'NPC：AI会给出简洁的定位、外貌、性格、出场作用'
  };
  document.getElementById('cdRoleHint').textContent = hints[role] || '';
}

function setCdFmt(fmt, el){
  cdFmt = fmt;
  document.getElementById('cdFmt_text').classList.toggle('act', fmt === 'text');
  document.getElementById('cdFmt_json').classList.toggle('act', fmt === 'json');
  var fmtHints = {
    text: '纯文本：适合阅读和手动复制 · JSON：适合一键写回人物设定',
    json: 'JSON结构：可一键写回人物设定（含标签），自动填充'
  };
  document.getElementById('cdFmtHint').textContent = fmtHints[fmt] || '';
}

// 标签相关
function renderCdTags(){
  var wrap = document.getElementById('cdTagsWrap');
  if(!wrap) return;
  var defaultTags = ['内向','外向','冷静','冲动','善良','腹黑','傲娇','温柔','毒舌','天然呆','话痨','社恐','阳光','忧郁','神秘'];
  var allTags = defaultTags.slice();
  (customTraits || []).forEach(function(t){ if(allTags.indexOf(t) === -1) allTags.push(t); });

  wrap.innerHTML = '';
  allTags.forEach(function(tag){
    var isAct = cdSelectedTags.indexOf(tag) >= 0;
    var chip = document.createElement('span');
    chip.className = 'cd-tag-chip' + (isAct ? ' act' : '');
    chip.textContent = tag;
    chip.onclick = function(){
      var idx = cdSelectedTags.indexOf(tag);
      if(idx >= 0) cdSelectedTags.splice(idx, 1);
      else cdSelectedTags.push(tag);
      renderCdTags();
    };
    wrap.appendChild(chip);
  });
}

function addCdTag(){
  var input = document.getElementById('cdNewTag');
  if(!input) return;
  var val = (input.value || '').trim();
  if(!val){showToast('请输入标签名');return;}
  if(val.length > 10){showToast('标签最多10个字');return;}
  if(cdSelectedTags.indexOf(val) >= 0){showToast('标签已存在');return;}
  cdSelectedTags.push(val);
  if(customTraits.indexOf(val) === -1){
    var defaultTags = ['内向','外向','冷静','冲动','善良','腹黑','傲娇','温柔','毒舌','天然呆','话痨','社恐','阳光','忧郁','神秘'];
    if(defaultTags.indexOf(val) === -1){
      customTraits.push(val);
      sv('bj_customTraits', customTraits);
    }
  }
  input.value = '';
  renderCdTags();
  showToast('已添加标签：' + val);
}
// 关联世界观
let cdSelectedWorld = ''; // 选中的世界观文本

function fillCdWorldSelect(){
  var sel = document.getElementById('cdWorldSelect');
  if(!sel) return;
  while(sel.options.length > 2) sel.removeChild(sel.lastChild);
  (worldP || []).forEach(function(p, i){
    var opt = document.createElement('option');
    opt.value = 'preset_' + i;
    opt.textContent = (p.name || '预设' + (i+1));
    sel.appendChild(opt);
  });
  sel.value = '';
  cdSelectedWorld = '';
  renderCdWorldCards();// 同步渲染自定义卡片
}

function onCdWorldChange(){
  var sel = document.getElementById('cdWorldSelect');
  var val = sel.value;
  var preview = document.getElementById('cdWorldPreview');
  var previewText = document.getElementById('cdWorldPreviewText');

  if(!val){
    cdSelectedWorld = '';
    preview.style.display = 'none';
    return;
  }

  if(val === '__current__'){
    // 使用当前世界观（全局+局部）
    var gw = (document.getElementById('globalWorldDesc') && document.getElementById('globalWorldDesc').value || globalWorld || '').trim();
    var lw = (document.getElementById('worldDesc') && document.getElementById('worldDesc').value || '').trim();
    cdSelectedWorld = [gw, lw].filter(Boolean).join('\n\n');
    if(!cdSelectedWorld){
      showToast('当前世界观为空，请先在设置中配置');
      sel.value = '';
      preview.style.display = 'none';
      return;
    }
  } else if(val.startsWith('preset_')){
    var idx = parseInt(val.replace('preset_', ''));
    if(idx >= 0 && idx < (worldP || []).length){
      cdSelectedWorld = (worldP[idx].desc || '').trim();
    } else {
      cdSelectedWorld = '';
    }
  }

  if(cdSelectedWorld){
    preview.style.display = 'block';
    var short = cdSelectedWorld.length > 200 ? cdSelectedWorld.substring(0, 200) + '...' : cdSelectedWorld;
    previewText.textContent = short;
  } else {
    preview.style.display = 'none';
  }
}
// 关联角色
function fillCdLinkSelect(){
  var sel = document.getElementById('cdLinkSelect');
  sel.innerHTML = '<option value="">-- 选择要关联的角色 --</option>';
  var names = getAllCharNames();
  names.forEach(function(n){
    if(cdLinkedChars.indexOf(n) === -1){
      var opt = document.createElement('option');
      opt.value = n; opt.textContent = n;
      sel.appendChild(opt);
    }
  });
}

// 自定义关联角色选择弹窗
function openCdLinkPicker(){
  var allNames = getAllCharNames();
  if(allNames.length === 0){showToast('暂无可关联角色，请先在人物设定中添加角色');return;}
  var available = allNames.filter(function(n){return cdLinkedChars.indexOf(n)===-1;});
  if(available.length === 0){showToast('所有角色都已关联');return;}
  var html = '<div style="display:flex;flex-direction:column;gap:7px;max-height:260px;overflow-y:auto;padding:2px 0">';
  available.forEach(function(name){
    html += '<div onclick="this.classList.toggle(\'_cdsel\');this.style.borderColor=this.classList.contains(\'_cdsel\')?\'var(--accent)\':\' var(--border)\';this.style.background=this.classList.contains(\'_cdsel\')?\'rgba(108,92,231,.12)\':\' var(--card2)\'" data-name="'+esc(name)+'" style="padding:10px 14px;border-radius:10px;border:1px solid var(--border);background:var(--card2);cursor:pointer;font-size:13px;display:flex;align-items:center;gap:9px;transition:all .2s;user-select:none"><i class="fas fa-user-circle" style="color:var(--accent2);font-size:14px"></i>'+esc(name)+'</div>';
  });
  html += '</div>';
  showDlg('选择关联角色', html, function(){
    var selected = document.querySelectorAll('#dlgMsg ._cdsel');
    selected.forEach(function(el){
      var n = el.dataset.name;
      if(n && cdLinkedChars.indexOf(n)===-1) cdLinkedChars.push(n);
    });
    renderCdLinks();
    fillCdLinkSelect();
  }, false, true);
  setTimeout(function(){
    var okBtn = document.getElementById('dlgOkBtn');
    if(okBtn) okBtn.textContent = '添加选中';
  }, 30);
}

// 渲染世界观卡片选择器
// 渲染世界观卡片选择器（固定选项内联，预设走弹窗）
function renderCdWorldCards(){
  var container = document.getElementById('cdWorldCardList');
  if(!container) return;
  var sel = document.getElementById('cdWorldSelect');
  var curVal = sel ? sel.value : '';
  container.innerHTML = '';

  // 固定选项：不关联
  var fixedOpts = [{value:'', label:'不关联世界观', icon:'fa-times-circle', color:'var(--text2)'}];
  var gw=(document.getElementById('globalWorldDesc')&&document.getElementById('globalWorldDesc').value||globalWorld||'').trim();
  var lw=(document.getElementById('worldDesc')&&document.getElementById('worldDesc').value||'').trim();
  if(gw||lw) fixedOpts.push({value:'__current__', label:'使用当前世界观', icon:'fa-map-pin', color:'var(--accent2)'});

  fixedOpts.forEach(function(opt){
    var isAct = curVal===opt.value;
    var div = document.createElement('div');
    div.style.cssText = 'padding:9px 14px;border-radius:10px;border:1px solid '+(isAct?'var(--accent)':'var(--border)')+';background:'+(isAct?'rgba(108,92,231,.12)':'var(--card2)')+';cursor:pointer;font-size:12px;display:flex;align-items:center;gap:8px;transition:all .2s;user-select:none';
    div.innerHTML = '<i class="fas '+opt.icon+'" style="color:'+opt.color+';font-size:12px;width:14px;text-align:center"></i><span>'+esc(opt.label)+'</span>'+(isAct?'<i class="fas fa-check-circle" style="margin-left:auto;color:var(--accent);font-size:13px"></i>':'');
    div.onclick = function(){
      var s=document.getElementById('cdWorldSelect');
      if(s){s.value=opt.value;onCdWorldChange();}
      renderCdWorldCards();
    };
    container.appendChild(div);
  });

  // 如果当前选中的是某个预设，显示已选预设卡片
  if(curVal.startsWith('preset_')){
    var pIdx=parseInt(curVal.replace('preset_',''));
    var selP=(worldP||[])[pIdx];
    if(selP){
      var selDiv=document.createElement('div');
      selDiv.style.cssText='padding:9px 14px;border-radius:10px;border:1px solid var(--accent);background:rgba(108,92,231,.12);cursor:pointer;font-size:12px;display:flex;align-items:center;gap:8px;transition:all .2s;user-select:none';
      selDiv.innerHTML='<i class="fas fa-box-open" style="color:var(--text);font-size:12px;width:14px;text-align:center"></i><span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+esc(selP.name||'预设')+'</span><i class="fas fa-check-circle" style="color:var(--accent);font-size:13px;flex-shrink:0"></i>';
      selDiv.onclick=function(){openCdWorldPresetPicker();};
      container.appendChild(selDiv);
    }
  }

  // 预设选择按钮（始终显示，仅当有预设时）
  if((worldP||[]).length>0){
    var pickBtn=document.createElement('button');
    pickBtn.className='btn-s';
    pickBtn.style.cssText='margin:4px 0 0;width:100%;display:flex;align-items:center;justify-content:center;gap:6px;padding:8px 12px;border-style:dashed;font-size:11px';
    var hasSel=curVal.startsWith('preset_');
    pickBtn.innerHTML='<i class="fas fa-box-open"></i> '+(hasSel?'更换预设（'+((worldP||[]).length)+'个可选）':'从预设中选择（'+((worldP||[]).length)+'个）');
    pickBtn.onclick=function(){openCdWorldPresetPicker();};
    container.appendChild(pickBtn);
  }
}

// 世界观预设选择弹窗
function openCdWorldPresetPicker(){
  if(!(worldP||[]).length){showToast('暂无世界观预设，请先在世界观设置里保存预设');return;}
  var sel=document.getElementById('cdWorldSelect');
  var curVal=sel?sel.value:'';
  var html='<div style="display:flex;flex-direction:column;gap:7px;max-height:300px;overflow-y:auto;padding:2px 0">';
  // 取消选中选项
  var noActStyle='padding:10px 14px;border-radius:10px;border:1px solid var(--border);background:var(--card2);cursor:pointer;font-size:12px;transition:all .2s;user-select:none';
  (worldP||[]).forEach(function(p,i){
    var isAct=curVal==='preset_'+i;
    var preview=(p.desc||'').trim().substring(0,60);
    html+='<div onclick="_cdSelectWorldPreset('+i+',this)" style="padding:10px 14px;border-radius:10px;border:1px solid '+(isAct?'var(--accent)':'var(--border)')+';background:'+(isAct?'rgba(108,92,231,.12)':'var(--card2)')+';cursor:pointer;font-size:12px;transition:all .2s;user-select:none">'
      +'<div style="display:flex;align-items:center;gap:8px"><i class="fas fa-box-open" style="color:var(--text2);font-size:11px;flex-shrink:0"></i><strong style="font-size:13px;flex:1">'+esc(p.name||'预设'+(i+1))+'</strong>'+(isAct?'<i class="fas fa-check" style="color:var(--accent);flex-shrink:0"></i>':'')+'</div>'
      +(preview?'<div style="font-size:10px;color:var(--text2);margin-top:5px;line-height:1.5;padding-left:20px">'+esc(preview)+(p.desc&&p.desc.length>60?'...':'')+'</div>':'')
      +'</div>';
  });
  html+='</div>';
  showDlg('选择世界观预设',html,function(){},false,true);
  // 隐藏无用的确认按钮（选择后直接关闭）
  setTimeout(function(){
    var okBtn=document.getElementById('dlgOkBtn');
    if(okBtn)okBtn.style.display='none';
  },30);
}

function _cdSelectWorldPreset(i,el){
  var s=document.getElementById('cdWorldSelect');
  if(s){s.value='preset_'+i;onCdWorldChange();}
  renderCdWorldCards();
  closeDlg();
}

function addCdLink(){
  var sel = document.getElementById('cdLinkSelect');
  var name = sel.value;
  if(!name){showToast('请选择一个角色');return;}
  if(cdLinkedChars.indexOf(name) >= 0){showToast('已关联该角色');return;}
  cdLinkedChars.push(name);
  renderCdLinks();
  fillCdLinkSelect();
}

function removeCdLink(name){
  cdLinkedChars = cdLinkedChars.filter(function(n){return n !== name;});
  renderCdLinks();
  fillCdLinkSelect();
}

function renderCdLinks(){
  var container = document.getElementById('cdLinkList');
  container.innerHTML = '';
  if(cdLinkedChars.length === 0){
    container.innerHTML = '<div style="font-size:11px;color:var(--text2);padding:8px 0">暂未关联角色</div>';
    return;
  }
  cdLinkedChars.forEach(function(name){
    var div = document.createElement('div');
    div.className = 'cd-link-item';
    div.innerHTML =
      '<span class="cd-link-name"><i class="fas fa-link"></i> ' + esc(name) + '</span>' +
      '<button class="cd-link-del" onclick="removeCdLink(\'' + esc(name.replace(/'/g, "\\'")) + '\')"><i class="fas fa-times"></i></button>';
    container.appendChild(div);
  });
}

// AI生成
async function doCharDesign(){
  var cfg = getCurApi();
  if(!cfg.url || !cfg.key){showToast('请先在设置中配置API');return;}

  var personality = (document.getElementById('cdPersonality').value || '').trim();
  var background = (document.getElementById('cdBackground').value || '').trim();
  if(!personality && !background){
    showToast('请至少填写性格或经历信息');
    return;
  }

  var btn = document.getElementById('cdGenBtn');
  btn.disabled = true;
  btn.innerHTML = '生成中 <span class="ldots"><span></span><span></span><span></span></span>';

  var charName = (document.getElementById('cdName').value || '').trim();
  var appearance = (document.getElementById('cdAppearance').value || '').trim();
  var extra = (document.getElementById('cdExtra').value || '').trim();

  // 获取关联角色的详细信息
  var linkedInfo = '';
  if(cdLinkedChars.length > 0){
    linkedInfo = '\n\n【关联角色信息（生成时要考虑与他们的关系和互动方式）】\n';
    cdLinkedChars.forEach(function(name){
      // 从主角色列表找
      var ch = (characters || []).find(function(c){return c.name === name;});
      if(ch){
        linkedInfo += '· ' + name;
        if(ch.traits && ch.traits.length > 0) linkedInfo += '（' + ch.traits.join('·') + '）';
        if(ch.desc) linkedInfo += '：' + ch.desc.substring(0, 150);
        linkedInfo += '\n';
      }
      // 从NPC列表找
      var npc = (npcList || []).find(function(n){return n.name === name;});
      if(npc && !ch){
        linkedInfo += '· ' + name + '[' + (npc.role || 'NPC') + ']';
        if(npc.desc) linkedInfo += '：' + npc.desc.substring(0, 100);
        linkedInfo += '\n';
      }
      // 查找已有关系
      (charRelations || []).forEach(function(r){
        if(r.charA === name || r.charB === name){
          var other = r.charA === name ? r.charB : r.charA;
          linkedInfo += '  关系：' + r.charA + ' ↔ ' + r.charB + '：' + r.type + (r.desc ? '（' + r.desc + '）' : '') + '\n';
        }
      });
    });
  }

  // 世界观参考
  var worldRef = '';
  var gw = (document.getElementById('globalWorldDesc') && document.getElementById('globalWorldDesc').value || globalWorld || '').trim();
  var lw = (document.getElementById('worldDesc') && document.getElementById('worldDesc').value || '').trim();
  if(gw || lw) worldRef = '\n\n【世界观参考】\n' + [gw, lw].filter(Boolean).join('\n').substring(0, 500);

  // 构建系统提示词
  var detailLevel = {
    main: '这是一个主角级别的角色，请给出非常详细的人设，包括：\n' +
      '1. 核心性格特质（3-5条，每条用一句话解释为什么会形成这种性格）\n' +
      '2. 说话方式和口癖（举2-3个对话示例）\n' +
      '3. 内心矛盾/弱点（让角色有深度的关键）\n' +
      '4. 习惯性小动作/微表情\n' +
      '5. 与关联角色的互动方式\n' +
      '6. 角色弧线建议（可能的成长方向）\n' +
      '7. 详细背景故事',
    support: '这是一个配角，请给出中等详细的人设，包括：\n' +
      '1. 核心性格特质（2-3条）\n' +
      '2. 在故事中的定位和作用\n' +
      '3. 与主角/关联角色的关系和互动方式\n' +
      '4. 标志性特征（让读者记住这个角色的一个细节）\n' +
      '5. 简要背景',
    npc: '这是一个NPC/路人角色，请给出简洁的人设，包括：\n' +
      '1. 角色定位（一句话）\n' +
      '2. 外貌/标志性特征\n' +
      '3. 性格（1-2个关键词）\n' +
      '4. 出场作用\n' +
      '5. 简短背景（2-3句话）'
  };

  var sysMsg = '你是一位资深的小说人物设计师，擅长创造有血有肉、让人过目不忘的角色。\n\n';
  sysMsg += '【设计要求】\n' + (detailLevel[cdRole] || detailLevel.main) + '\n\n';

  sysMsg += '【设计原则】\n';
  sysMsg += '· 性格要有矛盾性——完美无缺的角色是无趣的\n';
  sysMsg += '· 背景要服务于性格——经历决定了一个人为什么会变成现在这样\n';
  sysMsg += '· 说话方式要有辨识度——遮住名字也能认出是谁\n';
  sysMsg += '· 避免刻板印象——"冷面总裁""傻白甜"之类的标签不够\n';
  sysMsg += '· 如果有关联角色，要明确两人之间的化学反应\n\n';

  // 输出格式
  if(cdFmt === 'json'){
    sysMsg += '【输出格式——JSON模式（极其重要，违反即废稿）】\n';
    sysMsg += '你的整个回复必须是且仅是一个合法的JSON对象。\n';
    sysMsg += '禁止在JSON前后写任何文字、说明、分析。\n';
    sysMsg += '禁止使用```代码块包裹。禁止使用单引号。所有键名和字符串值都用双引号。\n';
    sysMsg += '字符串值中的换行用\\n表示，不要用真实换行。\n';
    sysMsg += '你的回复的第一个字符必须是 { ，最后一个字符必须是 } 。\n\n';
    sysMsg += 'JSON结构：\n';
    sysMsg += '{\n';
    sysMsg += '  "name": "角色名",\n';
    sysMsg += '  "priority": "核心|普通|参考",\n';
    sysMsg += '  "traits": ["标签1","标签2","标签3"],\n';
    sysMsg += '  "desc": "详细人设描述（完整的一段或多段文字）",\n';
    sysMsg += '  "role": "主角|配角|NPC",\n';
    sysMsg += '  "appearance": "外貌描述",\n';
    sysMsg += '  "speakStyle": "说话方式示例"\n';
    sysMsg += '}\n\n';
    sysMsg += 'priority对应关系：主角=核心，配角=普通，NPC=参考\n';
    sysMsg += 'traits数组要包含3-6个性格标签（短词，如"外冷内热""话少""倔强"）\n';
  } else {
    sysMsg += '【输出格式——纯文本模式】\n';
    sysMsg += '按以下模板输出，保留所有标题：\n\n';
    sysMsg += '【角色名】XXX\n';
    sysMsg += '【定位】主角/配角/NPC\n';
    sysMsg += '【性格标签】标签1、标签2、标签3\n';
    sysMsg += '【性格详述】...\n';
    sysMsg += '【背景故事】...\n';
    sysMsg += '【外貌特征】...\n';
    sysMsg += '【说话方式】...\n';
    if(cdRole === 'main'){
      sysMsg += '【内心矛盾】...\n';
      sysMsg += '【习惯性动作】...\n';
      sysMsg += '【角色弧线建议】...\n';
    }
    if(cdLinkedChars.length > 0){
      sysMsg += '【与关联角色的关系】...\n';
    }
    sysMsg += '\n只输出纯文本，不要JSON，不要代码块。\n';
  }

  sysMsg += '\n【铁律】不要输出思维过程、分析步骤、"好的"等开头。直接输出结果。\n';

  // 构建用户消息
  var userMsg = '请为以下角色生成完整人设：\n\n';
  if(charName) userMsg += '角色名：' + charName + '\n';
  else userMsg += '角色名：请帮我起一个合适的名字\n';
  
  var roleLabels = {main:'主角',support:'配角',npc:'NPC'};
  userMsg += '角色定位：' + (roleLabels[cdRole] || '主角') + '\n';
  
  if(personality) userMsg += '性格关键词：' + personality + '\n';
  if(background) userMsg += '经历背景：' + background + '\n';
  if(appearance) userMsg += '外貌特征：' + appearance + '\n';
  if(cdSelectedTags.length > 0) userMsg += '性格标签：' + cdSelectedTags.join('、') + '\n';
  if(extra) userMsg += '额外要求：' + extra + '\n';
  if(linkedInfo) userMsg += linkedInfo;
  if(cdSelectedWorld){
    userMsg += '\n\n【关联世界观（角色必须属于这个世界观设定）】\n' + cdSelectedWorld.substring(0, 800);
  } else if(worldRef){
    userMsg += worldRef;
  }

  var messages = [{role:'system',content:sysMsg},{role:'user',content:userMsg}];

  var resultBox = document.getElementById('cdResultBox');
  var resultText = document.getElementById('cdResultText');
  resultBox.style.display = 'block';
  resultText.value = '正在生成...';

  var result = await callToolAPINonStream(messages);
  btn.disabled = false;
  btn.textContent = '重新生成';
  if(result){
    var cleaned = stripMetaThinking(result);
    resultText.value = cleaned;
    document.getElementById('cdResultWc').textContent = countWords(cleaned) + '字';
    parseCdResult(cleaned);
    showToast('角色人设生成完成');
  } else {
    resultText.value = '生成失败，请检查API设置';
  }
}

// 解析结果（尝试提取JSON或文本中的关键信息）
function parseCdResult(text){
  cdLastResult = null;
  if(!text) return;

  if(cdFmt === 'json'){
    try{
      var obj = safeJsonParse(text);
      if(obj && typeof obj === 'object'){
        cdLastResult = {
          name: obj.name || '',
          desc: obj.desc || '',
          traits: Array.isArray(obj.traits) ? obj.traits : [],
          priority: obj.priority || '普通',
          role: obj.role || 'support',
          appearance: obj.appearance || '',
          speakStyle: obj.speakStyle || ''
        };
        // 更新写回按钮提示
        document.getElementById('cdApplyBtn').textContent = '写回「' + (cdLastResult.name || '角色') + '」到人物设定';
        return;
      }
    }catch(e){
      // JSON解析失败，尝试当纯文本处理
    }
  }

  // 纯文本模式：尝试提取角色名和标签
  var nameMatch = text.match(/【角色名】\s*(.+)/);
  var tagsMatch = text.match(/【性格标签】\s*(.+)/);
  var name = nameMatch ? nameMatch[1].trim() : (document.getElementById('cdName').value || '').trim();
  var traits = [];
  if(tagsMatch){
    traits = tagsMatch[1].split(/[、，,\s]+/).filter(function(t){return t.trim();});
  }

  var priorityMap = {main:'核心',support:'普通',npc:'参考'};

  cdLastResult = {
    name: name,
    desc: text, // 纯文本就把整个结果当desc
    traits: traits.length > 0 ? traits : cdSelectedTags.slice(),
    priority: priorityMap[cdRole] || '普通',
    role: cdRole
  };

  if(name){
    document.getElementById('cdApplyBtn').textContent = '写回「' + name + '」到人物设定';
  }
}

// 复制结果
function copyCdResult(){
  var text = (document.getElementById('cdResultText').value || '').trim();
  if(!text){showToast('没有结果可复制');return;}
  doCopy(text);
}

// 写回人物设定
function applyCdResult(){
  if(!cdLastResult){
    showToast('请先生成角色人设');
    return;
  }

  var r = cdLastResult;
  var roleName = r.role || cdRole;

  if(roleName === 'npc'){
    // 写入NPC列表
    var npcEntry = {
      name: r.name || '未命名',
      role: 'NPC',
      traits: r.traits || [],
      appearance: r.appearance || '',
      desc: (cdFmt === 'json') ? (r.desc || '') : (document.getElementById('cdResultText').value || ''),
      chapter: ''
    };
    npcList.push(npcEntry);
    sv('bj_npcList', npcList);
    showToast('已添加NPC「' + npcEntry.name + '」到人物设定');
  } else {
    // 写入主角色列表
    var charEntry = {
      name: r.name || '未命名',
      desc: (cdFmt === 'json') ? (r.desc || '') : (document.getElementById('cdResultText').value || ''),
      traits: r.traits || [],
      priority: r.priority || '普通'
    };
    
    // 检查是否已有同名角色
    var existIdx = characters.findIndex(function(c){return c.name === charEntry.name;});
    if(existIdx >= 0){
      showDlg('角色已存在','已有名为「' + charEntry.name + '」的角色。\n\n覆盖现有设定还是新增一个？',function(){
        // 覆盖
        characters[existIdx] = charEntry;
        sv(K.curChars, characters);
        showToast('已更新「' + charEntry.name + '」的设定');
      });
      // 修改确认按钮文字并添加新增按钮
      setTimeout(function(){
        var okBtn = document.getElementById('dlgOkBtn');
        if(okBtn) okBtn.textContent = '覆盖';
        var msgEl = document.getElementById('dlgMsg');
        if(msgEl){
          msgEl.innerHTML += '<div style="margin-top:12px"><button onclick="closeDlg();addCdAsNewChar()" style="width:100%;padding:10px;border-radius:10px;border:1px solid var(--accent);background:rgba(108,92,231,.1);color:var(--accent2);font-size:12px;font-weight:600;cursor:pointer"><i class="fas fa-plus"></i> 新增为独立角色</button></div>';
        }
      }, 50);
      return;
    }

    // 检查是否有空角色槽位可以填入
    var emptyIdx = characters.findIndex(function(c){return !c.name && !c.desc;});
    if(emptyIdx >= 0){
      characters[emptyIdx] = charEntry;
    } else {
      characters.push(charEntry);
    }
    sv(K.curChars, characters);
    showToast('已添加「' + charEntry.name + '」到人物设定');
  }

  // 同步标签到自定义标签列表
  if(r.traits && r.traits.length > 0){
    var added = 0;
    r.traits.forEach(function(t){
      if(customTraits.indexOf(t) === -1){
        var defaultTags = ['内向','外向','冷静','冲动','善良','腹黑','傲娇','温柔','毒舌','天然呆'];
        if(defaultTags.indexOf(t) === -1){
          customTraits.push(t);
          added++;
        }
      }
    });
    if(added > 0){
      sv('bj_customTraits', customTraits);
    }
  }

  // 如果有关联角色且是JSON模式，自动创建关系
  if(cdLinkedChars.length > 0 && r.name){
    cdLinkedChars.forEach(function(linkedName){
      var exists = charRelations.some(function(rel){
        return (rel.charA === r.name && rel.charB === linkedName) || 
               (rel.charA === linkedName && rel.charB === r.name);
      });
      if(!exists){
        charRelations.push({
          charA: r.name,
          charB: linkedName,
          type: '待定义',
          direction: '双向',
          desc: '由角色设计器自动创建，请手动编辑关系类型'
        });
      }
    });
    sv('bj_charRelations', charRelations);
  }
}

// 辅助函数：新增为独立角色（当同名角色已存在时）
function addCdAsNewChar(){
  if(!cdLastResult) return;
  var r = cdLastResult;
  var charEntry = {
    name: r.name + '(新)',
    desc: (cdFmt === 'json') ? (r.desc || '') : (document.getElementById('cdResultText').value || ''),
    traits: r.traits || [],
    priority: r.priority || '普通'
  };
  characters.push(charEntry);
  sv(K.curChars, characters);
  showToast('已新增「' + charEntry.name + '」');
}
// ==================== 情节分支器 ====================
function openBranchGen(){
document.getElementById('branchInput').value='';
document.getElementById('branchContext').value='';
document.getElementById('branchResult').style.display='none';
document.getElementById('branchGenBtn').disabled=false;
document.getElementById('branchGenBtn').textContent='生成分支';
document.getElementById('branchOv').classList.add('show');
navPush('branchOv');
setTimeout(()=>document.getElementById('branchInput').focus(),200);
}

function closeBranchGen(){
  navPop('branchOv');
document.getElementById('branchOv').classList.remove('show');
}

async function doGenBranch(){
const cfg=getCurApi();
if(!cfg.url||!cfg.key){showToast('请先在设置中配置API');return;}
const input=(document.getElementById('branchInput').value||'').trim();
if(!input){showToast('请描述当前的情节节点');return;}
const context=(document.getElementById('branchContext').value||'').trim();
const btn=document.getElementById('branchGenBtn');
btn.disabled=true;
btn.innerHTML='生成中 <span class="ldots"><span></span><span></span><span></span></span>';

let sysMsg='你是一位深谙故事结构的剧情设计师，你最擅长的是：在同一个节点上，找到三条让人都觉得"这也挺对"但走向截然不同的路。\n\n';
sysMsg+='【核心原则】\n';
sysMsg+='- 三条路线是本质差异（不是程度差异），读者选哪条都能理解\n';
sysMsg+='- 每条路线都必须符合已有角色性格——如果角色是内向型，不能突然英雄主义\n';
sysMsg+='- 情感走向要有清晰的弧线，不是平移\n';
sysMsg+='- 给出具体会发生的事件和场景，不要写"他们会解开误会"这种模糊描述\n\n';
sysMsg+='【输出格式——严格遵守，不能省略任何字段】\n\n';
sysMsg+='【路线A：顺势发展（最符合期待的走向）】\n';
sysMsg+='▶ 触发事件：（一个具体的动作或对话，成为这条路的起点）\n';
sysMsg+='▶ 发展过程：（80-120字，写清楚发生了什么，不要只写方向）\n';
sysMsg+='▶ 情感弧线：从______到______\n';
sysMsg+='▶ 最打动人的瞬间：（一个具体场景或细节）\n\n';
sysMsg+='【路线B：意外反转（出乎意料但情理之中）】\n';
sysMsg+='▶ 触发事件：（什么意外让故事转向）\n';
sysMsg+='▶ 发展过程：（80-120字）\n';
sysMsg+='▶ 情感弧线：从______到______\n';
sysMsg+='▶ 最打动人的瞬间：\n\n';
sysMsg+='【路线C：深挖人物（聚焦内心而非外部事件）】\n';
sysMsg+='▶ 触发事件：（一个让角色内心发生变化的契机）\n';
sysMsg+='▶ 发展过程：（80-120字）\n';
sysMsg+='▶ 情感弧线：从______到______\n';
sysMsg+='▶ 最打动人的瞬间：\n\n';
sysMsg+='【最后】哪条路线续写难度最低（适合新手）？哪条情感张力最强？一句话说明。\n';

if(document.getElementById('branchUseChars').checked){
const validChars=characters.filter(c=>c.name||c.desc);
if(validChars.length>0){
sysMsg+='\n【当前角色】\n';
validChars.forEach(c=>{
if(c.name){
sysMsg+=c.name;
if(c.traits&&c.traits.length>0)sysMsg+='（'+c.traits.join('·')+'）';
if(c.desc)sysMsg+='：'+c.desc.substring(0,80);
sysMsg+='\n';
}
});
}
if(charRelations.length>0){
sysMsg+='\n【人物关系】\n';
charRelations.forEach(r=>{
const dir=r.direction==='A→B'?'→':r.direction==='B→A'?'←':'↔';
sysMsg+=r.charA+' '+dir+' '+r.charB+'：'+r.type+'\n';
});
}
}
if(document.getElementById('branchUseWorld').checked){
const globalWD=(document.getElementById('globalWorldDesc')&&document.getElementById('globalWorldDesc').value||globalWorld||'').trim();
const localWD=(document.getElementById('worldDesc')&&document.getElementById('worldDesc').value||'').trim();
const wD=[globalWD,localWD].filter(Boolean).join('\n');
if(wD)sysMsg+='\n【世界观背景】\n'+wD.substring(0,300)+'\n';
}

let userMsg='当前情节节点：\n'+input;
if(context)userMsg+='\n\n补充信息：'+context;

const messages=[{role:'system',content:sysMsg},{role:'user',content:userMsg}];
const resultDiv=document.getElementById('branchResult');
const listDiv=document.getElementById('branchList');

var result=await callToolAPINonStream(messages);
btn.disabled=false;
btn.textContent='重新生成';
if(result){
resultDiv.style.display='block';
parseBranchResult(result);
}else{
showToast('生成失败，请检查API设置');
}
}

function parseBranchResult(text){
const listDiv=document.getElementById('branchList');
listDiv.innerHTML='';
const routes=text.split(/【路线[ABC]/).filter(r=>r.trim());
const labels=['A','B','C'];
const colors=['#6c5ce7','#27ae60','#e67e22'];

routes.forEach((route,i)=>{
if(i>=3)return;
const lines=route.trim().split('\n');
let title=lines[0]||'';
title=title.replace(/^[：:]\s*/,'').replace(/】$/,'').trim();
const content=lines.slice(1).join('\n').trim();

const card=document.createElement('div');
card.style.cssText='background:var(--card);border:2px solid '+colors[i]+';border-radius:12px;padding:14px;margin-bottom:10px;cursor:pointer;transition:all .2s';
card.onmouseenter=()=>{card.style.transform='translateY(-2px)';card.style.boxShadow='0 4px 15px rgba(0,0,0,.15)';};
card.onmouseleave=()=>{card.style.transform='';card.style.boxShadow='';};
card.innerHTML=
'<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">'+
'<span style="background:'+colors[i]+';color:#fff;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600">路线'+labels[i]+'</span>'+
'<span style="font-size:13px;font-weight:600;color:var(--text)">'+esc(title)+'</span>'+
'</div>'+
'<div style="font-size:12px;line-height:1.7;color:var(--text2)">'+esc(content)+'</div>'+
'<div style="margin-top:10px;display:flex;gap:6px">'+
'<button style="flex:1;padding:6px;border-radius:8px;border:1px solid '+colors[i]+';background:transparent;color:'+colors[i]+';font-size:11px;cursor:pointer" onclick="event.stopPropagation();copyBranch(\''+esc(title.replace(/'/g,"\\'"))+'：'+esc(content.replace(/'/g,"\\'").replace(/\n/g,' '))+'\')"><i class="fas fa-copy"></i> 复制</button>'+
'<button style="flex:1;padding:6px;border-radius:8px;border:none;background:'+colors[i]+';color:#fff;font-size:11px;cursor:pointer" onclick="event.stopPropagation();useBranch(\''+esc(content.replace(/'/g,"\\'").replace(/\n/g,' '))+'\')"><i class="fas fa-check-circle"></i> 采用此路线</button>'+
'</div>';
listDiv.appendChild(card);
});

if(listDiv.children.length===0){
listDiv.innerHTML='<div style="font-size:12px;line-height:1.8;white-space:pre-wrap;color:var(--text)">'+esc(text)+'</div>';
}
}

function copyBranch(text){
doCopy(text);
showToast('已复制路线');
}
// ==================== 高级创作模式 ====================
let advChapters=[];// 章节大纲列表
let advVolumes=[];// 高级创作模式的分卷列表：{id,name,summary}，和 advChapters 一样只在内存里，
// 点"保存项目"或"开始创作"才真正落盘（分别见 saveAdvProject / 开始创作 那段）
// 分卷相关的通用工具函数（_createVolume/_updateVolumeMeta/_deleteVolumeById/openVolEdit/openVolPicker）
// 认的是 work.volumes，这里给一个只暴露 volumes、并带 __advMode 标记的轻量适配对象，
// 不需要重新实现一遍新建/编辑/删除分卷的弹窗逻辑
var _advVolWork={__advMode:true,get volumes(){return advVolumes;},set volumes(v){advVolumes=v;}};
var _advChSortValue='seq-asc';
var _advChExpanded={}; // 分组展开状态，key为卷id（未分卷用''），默认全部折叠
var _advChLocateVal=''; // 定位输入框当前值：纯数字按章节号定位，其余按分卷名模糊匹配
// 按分卷分组：和 _buildVolGroups 逻辑一致，但这里的章节是对象数组、分卷归属存在each章节自己的
// volumeId 字段上（不是平行数组），数据形状不同所以单独写一份，不能直接复用 _buildVolGroups
function _advGroupChapters(){
  var groups=advVolumes.map(function(v){return {id:v.id,name:v.name,summary:v.summary,indices:[]};});
  var groupById={};
  groups.forEach(function(g){groupById[g.id]=g;});
  var unassigned={id:null,name:'未分卷',summary:'',indices:[]};
  advChapters.forEach(function(ch,i){
    var vid=(ch&&ch.volumeId)||'';
    if(vid&&groupById[vid])groupById[vid].indices.push(i);
    else unassigned.indices.push(i);
  });
  groups.push(unassigned);
  return groups;
}
let advCreateAbort=false;
// 记录"最近一次高级创作"如果中途停止或失败，对应crWorks里的哪部作品的id。
// 不需要用户先手动"保存项目"——只要标题和总章数不变，下次点"开始创作"就会自动检测到并询问是否续接，
// 而不是每次都从第一章重新生成、把已经写好的内容晾在一边不好找。
let _advResumeNovelId=ld('bj_advResumeNovelId','');
var _rdContChCount=1;// 本次续写章节数（1-10）
var _batchContRemain=0;// 批量续写：剩余待生成章节数
var _batchArticleId='';// 批量续写时锁定的文章ID，防止串书
var _dibThemeOverride=null;// 今日主题随机覆盖（null=按日期哈希）
// 更新章节数stepper的显示和边界状态
function _syncContStepperUI(){
  var _n=_rdContChCount;
  // 更新主页面 contWrap 里的 stepper
  var num=document.getElementById('rdContChNum');
  var minus=document.getElementById('rdContChMinus');
  var plus=document.getElementById('rdContChPlus');
  if(num)num.textContent=_n;
  if(minus)minus.style.opacity=_n<=1?'0.35':'1';
  if(plus)plus.style.opacity=_n>=10?'0.35':'1';
  // 同步更新浮窗（rdOv）里的 stepper（浮窗打开时才存在）
  var ovNum=document.getElementById('rdOvContChNum');
  var ovMinus=document.getElementById('rdOvContMinus');
  var ovPlus=document.getElementById('rdOvContPlus');
  if(ovNum)ovNum.textContent=_n;
  if(ovMinus)ovMinus.style.opacity=_n<=1?'0.35':'1';
  if(ovPlus)ovPlus.style.opacity=_n>=10?'0.35':'1';
}
let advProjects=ld('bj_advProjects',[]);
let advGenreList=ld('bj_advGenres',['甜宠','虐恋','悬疑','奇幻','古风','现代','校园','职场','重生','穿越','仙侠','都市','末日','科幻','豪门','娱乐圈','电竞','军旅']);

// 渲染故事类型标签
function renderAdvGenreTags(){
const container=document.getElementById('advGenreTags');
if(!container)return;
container.innerHTML='';
advGenreList.forEach((tag,idx)=>{
const span=document.createElement('span');
span.className='tag';
span.textContent=tag;
span.onclick=function(){toggleAdvTag(this);};
// 长按删除（仅自定义标签，前10个是默认的）
let lpTimer=null;
span.ontouchstart=function(e){
lpTimer=setTimeout(function(){
if(idx>=10){
showDlg('删除标签','确定要删除标签「'+tag+'」吗？',function(){deleteAdvGenre(idx);},true);
}else{
showToast('默认标签不可删除');
}
},600);
};
span.ontouchend=function(){clearTimeout(lpTimer);};
span.ontouchcancel=function(){clearTimeout(lpTimer);};
// PC端右键删除
span.oncontextmenu=function(e){
e.preventDefault();
if(idx>=10){
showDlg('删除标签','确定要删除标签「'+tag+'」吗？',function(){deleteAdvGenre(idx);},true);
}else{
showToast('默认标签不可删除');
}
};
container.appendChild(span);
});
}

// 添加自定义类型
function addAdvGenre(){
const input=document.getElementById('advNewGenre');
const val=(input.value||'').trim();
if(!val){showToast('请输入标签名');return;}
if(val.length>10){showToast('标签最多10个字');return;}
if(advGenreList.includes(val)){showToast('该标签已存在');return;}
advGenreList.push(val);
sv('bj_advGenres',advGenreList);
input.value='';
renderAdvGenreTags();
// 自动选中新添加的标签
setTimeout(()=>{
const tags=document.querySelectorAll('#advGenreTags .tag');
const lastTag=tags[tags.length-1];
if(lastTag)lastTag.classList.add('act');
},50);
showToast('已添加：'+val);
}

// 删除自定义类型
function deleteAdvGenre(idx){
if(idx<10)return;// 保护默认标签
advGenreList.splice(idx,1);
sv('bj_advGenres',advGenreList);
renderAdvGenreTags();
showToast('标签已删除');
}
let currentAdvProject=null;

function openAdvancedCreate(){
renderAdvGenreTags();
// 重置
advChapters=[];
advVolumes=[];
_advChExpanded={};
_advChSortValue='seq-asc';
_advChLocateVal='';
currentAdvProject=null;
document.getElementById('advTitle').value='';
document.getElementById('advWordsPerCh').value='1500';
document.getElementById('advTheme').value='';
document.getElementById('advSynopsis').value='';
document.getElementById('advAvoid').value='';
document.getElementById('advProgress').style.display='none';
document.getElementById('advStartBtn').disabled=false;
document.getElementById('advStartBtn').textContent='开始创作';
var advChSortLbl=document.getElementById('advChSortLabel');
if(advChSortLbl)advChSortLbl.textContent='最旧';
var advChLocInp=document.getElementById('advChLocateInput');
if(advChLocInp)advChLocInp.value='';
var advChLocClr=document.getElementById('advChLocateClear');
if(advChLocClr)advChLocClr.style.display='none';
closeAdvChAddMenu();
// 重置标签
document.querySelectorAll('#advGenreTags .tag').forEach(t=>t.classList.remove('act'));
// 重置开关（advUseRules 之前漏掉了，导致上次如果关过"使用当前规则设定"，
// 下次重新打开高级创作时勾选框状态没跟着重置，和其余三个开关表现不一致）
['advUseChars','advUseWorld','advUseStyle','advUseRules'].forEach(id=>{
var _cb=document.getElementById(id);
if(_cb){_cb.checked=true;updateAdvSwitch(id);}
});
renderAdvChapterList();
document.getElementById('advCreateOv').classList.add('show');
document.getElementById('bnav').classList.add('hide');
navPush('advCreateOv');
// 若存在未写完的进度，自动把表单恢复回去，并给出清晰可见的"继续创作"入口——
// 见 _advPrefillResumeIfAny() 里的详细说明
_advPrefillResumeIfAny();
}

// 恢复未完成的高级创作进度。
// 背景：startAdvCreate() 里早就有"标题+章数都匹配就自动续接"的检测逻辑，但触发它需要用户
// 自己重新打开「高级创作」、一字不差地填回原来的标题和章节数、再点"开始创作"——这个操作路径
// 完全没有任何界面提示，等于做了功能却没人找得到（对应反馈：生成失败后找不到"接着生成"的选项）。
// 这里改成主动式：只要一打开「高级创作」面板就检查有没有未写完的进度，有的话直接把表单和章节
// 大纲都填回去，用户睁眼就能看到"欸，还在这儿，点一下就能接着写"，而不用凭空猜一个隐藏功能。
function _advPrefillResumeIfAny(){
  if(!_advResumeNovelId)return;
  var existing=crWorks.find(function(w){return w.id===_advResumeNovelId;});
  // 进度已经失效（作品被删除 / 已经全部写完 / 数据被破坏），清掉过期指针，避免以后一直误判
  if(!existing||existing.type!=='novel'||!Array.isArray(existing.chapters)
     ||!Array.isArray(existing.chOutlines)||existing.chOutlines.length===0
     ||existing.chapters.length>=existing.chOutlines.length){
    _advResumeNovelId='';
    sv('bj_advResumeNovelId','');
    return;
  }
  document.getElementById('advTitle').value=existing.title||'';
  document.getElementById('advWordsPerCh').value=existing.wordsPerCh||1500;
  document.getElementById('advTheme').value=existing.advTheme||'';
  document.getElementById('advSynopsis').value=existing.advSynopsis||'';
  document.getElementById('advAvoid').value=existing.avoid||'';
  // 恢复类型标签选中状态（标签是异步渲染出来的，等一拍再去找 DOM 节点，和 loadAdvProject 的写法一致）
  setTimeout(function(){
    document.querySelectorAll('#advGenreTags .tag').forEach(function(t){
      t.classList.toggle('act',(existing.tags||[]).includes(t.textContent));
    });
  },50);
  document.getElementById('advUseChars').checked=existing.advUseChars!==false;
  document.getElementById('advUseWorld').checked=existing.advUseWorld!==false;
  document.getElementById('advUseStyle').checked=existing.advUseStyle!==false;
  if(document.getElementById('advUseRules'))document.getElementById('advUseRules').checked=existing.advUseRules!==false;
  ['advUseChars','advUseWorld','advUseStyle','advUseRules'].forEach(function(id){
    if(document.getElementById(id))updateAdvSwitch(id);
  });
  // 恢复分卷（如果这部作品已经有人工/之前的高级创作设过分卷）
  advVolumes=JSON.parse(JSON.stringify(existing.volumes||[]));
  // 恢复章节大纲+标题（chTitles 是旧数据可能没有的新字段，缺失时按空字符串兜底，不会报错）
  advChapters=existing.chOutlines.map(function(ol,idx){
    return {outline:ol||'',title:(existing.chTitles&&existing.chTitles[idx])||'',volumeId:(existing.chVolume&&existing.chVolume[idx])||'',updatedAt:(existing.chOutlineUpdatedAt&&existing.chOutlineUpdatedAt[idx])||0};
  });
  renderAdvChapterList();
  currentAdvProject=null;
  var startBtn=document.getElementById('advStartBtn');
  if(startBtn)startBtn.innerHTML='<i class="fas fa-play"></i> 继续创作（已完成'+existing.chapters.length+'/'+existing.chOutlines.length+'章）';
  showToast('已为你恢复未完成的创作《'+existing.title+'》，已完成'+existing.chapters.length+'/'+existing.chOutlines.length+'章，可直接点击下方按钮继续',5000);
}

function closeAdvancedCreate(){
navPop('advCreateOv');
advCreateAbort=true;
document.getElementById('advCreateOv').classList.remove('show');
document.getElementById('bnav').classList.remove('hide');
closeAdvChAddMenu();
}

function toggleAdvTag(el){
el.classList.toggle('act');
}

function toggleAdvSwitch(id){
const cb=document.getElementById(id);
cb.checked=!cb.checked;
updateAdvSwitch(id);
}

function updateAdvSwitch(id){
const cb=document.getElementById(id);
const track=document.getElementById(id+'Track');
const thumb=document.getElementById(id+'Thumb');
if(!track||!thumb)return;
if(cb.checked){
track.style.background='var(--accent)';
thumb.style.left='20px';
}else{
track.style.background='var(--border)';
thumb.style.left='2px';
}
}

// 添加章节
// 章节标题/大纲编辑：顺带记录修改时间，供"最近"排序使用
function _advChTouch(idx,field,value){
if(!advChapters[idx])return;
advChapters[idx][field]=value;
advChapters[idx].updatedAt=Date.now();
}
function addAdvChapter(volumeId){
var vol=volumeId||'';
// 添加前先清除定位筛选：否则如果新章节不属于当前筛选命中的分卷，会被"隐藏"，用户会以为添加失败
if(_advChLocateVal!==''){
_advChLocateVal='';
var _locInp=document.getElementById('advChLocateInput');
if(_locInp)_locInp.value='';
var _locClr=document.getElementById('advChLocateClear');
if(_locClr)_locClr.style.display='none';
}
advChapters.push({outline:'',title:'',volumeId:vol,updatedAt:Date.now()});
var newIdx=advChapters.length-1;
renderAdvChapterList();
// 新章节所在分组当前是展开的（或者这本书还没建过分卷、本来就是平铺列表）才滚动定位+聚焦；
// 分组是折叠的话，新章节这时候不在DOM里，用提示告知添加成功即可，不强行展开打乱用户当前的浏览状态
var groupVisible=advVolumes.length===0||!!_advChExpanded[vol];
if(groupVisible){
setTimeout(()=>{
const container=document.getElementById('advChapterList');
if(!container)return;
const item=container.querySelector('.adv-ch-item[data-idx="'+newIdx+'"]');
if(!item)return;
item.scrollIntoView({block:'nearest',behavior:'smooth'});
const ta=item.querySelector('textarea');
if(ta)ta.focus();
},100);
}else{
showToast('已添加第'+(newIdx+1)+'章，展开分组查看',2200);
}
}

// 删除章节
function deleteAdvChapter(idx){
if(advChapters.length<=1){
showToast('至少保留一章');
return;
}
advChapters.splice(idx,1);
renderAdvChapterList();
showToast('已删除第'+(idx+1)+'章');
}

// 上移章节：只在同一分卷分组内移动（和创作页章节目录的拖拽排序同一个限制、同一个原因——
// 卷内章节可以不连续，允许跨组移动会导致"看起来换组了、但分卷归属没变"这种视觉上说不通的结果，
// 跨卷请用每章下方的分卷选择框）
function moveAdvChapterUp(idx){
if(!advChapters[idx])return;
var myVol=advChapters[idx].volumeId||'';
var j=idx-1;
while(j>=0&&(advChapters[j].volumeId||'')!==myVol)j--;
if(j<0)return; // 已经是组内第一个
var temp=advChapters[idx];advChapters[idx]=advChapters[j];advChapters[j]=temp;
renderAdvChapterList();
}

// 下移章节：同上，限定在同一分卷分组内
function moveAdvChapterDown(idx){
if(!advChapters[idx])return;
var myVol=advChapters[idx].volumeId||'';
var j=idx+1;
while(j<advChapters.length&&(advChapters[j].volumeId||'')!==myVol)j++;
if(j>=advChapters.length)return; // 已经是组内最后一个
var temp=advChapters[idx];advChapters[idx]=advChapters[j];advChapters[j]=temp;
renderAdvChapterList();
}

// 渲染章节列表：按分卷分组（默认全部折叠，和章节目录/大纲页一致），组内按当前排序方式排列；
// 章节/分卷定位命中时强制展开对应分组、隐藏其余分组，方便快速找到。
function renderAdvChapterList(){
const container=document.getElementById('advChapterList');
if(!container)return;
var countEl=document.getElementById('advChCount');
if(countEl)countEl.textContent=advChapters.length>0?('（共'+advChapters.length+'章）'):'';

if(advChapters.length===0){
container.innerHTML='<div style="text-align:center;padding:20px;color:var(--text2);font-size:12px">还没有章节<br>点击右上角加号添加</div>';
return;
}

var sortFns={
'seq-asc':function(a,b){return a-b;},
'seq-desc':function(a,b){return b-a;},
'recent':function(a,b){
var ua=(advChapters[a]&&advChapters[a].updatedAt)||0;
var ub=(advChapters[b]&&advChapters[b].updatedAt)||0;
return ub!==ua?ub-ua:a-b;
}
};
var sortFn=sortFns[_advChSortValue]||sortFns['seq-asc'];
var groups=_advGroupChapters();
var hasAnyVolume=advVolumes.length>0;

// 章节/分卷定位：纯数字按章节号定位（命中且属于某分卷时只展示这一整卷，其余分卷隐藏），
// 否则按分卷名模糊匹配；还没建过分卷时没有"卷"可筛，退化成只在数字命中时自动滚动过去
var locateActive=(_advChLocateVal!=='');
var isNumericLocate=locateActive&&/^\d+$/.test(_advChLocateVal);
var numericHitIdx=-1;
var keepGroupIds=null; // null=不筛选；否则是"允许显示的分组key集合"
var emptyMsg='还没有章节';
if(locateActive){
if(isNumericLocate){
var locateNum=parseInt(_advChLocateVal,10);
numericHitIdx=(locateNum>0&&locateNum-1<advChapters.length)?(locateNum-1):-1;
if(hasAnyVolume){
if(numericHitIdx>=0){
var hitVol=advChapters[numericHitIdx].volumeId||'';
keepGroupIds={};keepGroupIds[hitVol]=true;
}else{
keepGroupIds={};
}
}
emptyMsg='未找到第'+esc(_advChLocateVal)+'章';
}else if(hasAnyVolume){
var kw=_advChLocateVal.trim().toLowerCase();
keepGroupIds={};
advVolumes.forEach(function(v){if((v.name||'').toLowerCase().indexOf(kw)!==-1)keepGroupIds[v.id]=true;});
emptyMsg='未找到名称包含"'+esc(_advChLocateVal.trim())+'"的分卷';
}
}

container.innerHTML='';
var anyGroupShown=false;
groups.forEach(function(g){
if(g.indices.length===0)return; // 空分组（比如全部章节都已分卷时的"未分卷"）不渲染
var key=g.id||'';
if(keepGroupIds&&!keepGroupIds[key])return; // 定位筛选生效时，不在结果里的分组整组跳过
anyGroupShown=true;
var indices=g.indices.slice().sort(sortFn);
if(hasAnyVolume){
var expanded=keepGroupIds?true:!!_advChExpanded[key]; // 定位命中时强制展开，方便直接看到内容
var hdr=document.createElement('div');
hdr.className='vol-group-hdr'+(g.id===null?' unassigned':'');
hdr.innerHTML='<i class="fas fa-chevron-'+(expanded?'down':'right')+' vol-chevron"></i><span class="vol-name">'+esc(g.name||'未命名分卷')+'</span><span class="vol-count">（'+indices.length+'章）</span>'+(g.summary?'<span class="vol-summary">'+esc(g.summary)+'</span>':'');
hdr.onclick=function(){
_advChExpanded[key]=!_advChExpanded[key];
renderAdvChapterList();
};
if(g.id!==null)_bindVolHdrLongPress(hdr,_advVolWork,g.id,function(){renderAdvChapterList();});
container.appendChild(hdr);
if(!expanded)return; // 折叠状态：只渲染标题，不生成里面的章节卡片（章节多时省性能，逻辑上也和目录/大纲页一致）
}
indices.forEach(function(idx){
container.appendChild(_buildAdvChItem(idx));
});
});
if(keepGroupIds&&!anyGroupShown){
container.innerHTML='<div style="text-align:center;padding:20px;color:var(--text2);font-size:12px">'+emptyMsg+'</div>';
return;
}
if(numericHitIdx>=0){
var hit=container.querySelector('.adv-ch-item[data-idx="'+numericHitIdx+'"]');
if(hit)setTimeout(function(){hit.scrollIntoView({block:'nearest',behavior:'smooth'});},50);
}
}

// 构建单个章节卡片：标题输入框、上/下移、删除、分卷选择chip、大纲文本框。
// data-idx 记录真实数组下标（分组展示后DOM顺序和数组顺序可能不一致，syncAdvChaptersFromUI 靠这个属性
// 把编辑框内容准确写回对应章节，不能再假设"DOM里第N个就是数组第N个"）。
function _buildAdvChItem(idx){
var ch=advChapters[idx];
var myVol=ch.volumeId||'';
var isFirstInGroup=true;
for(var i=idx-1;i>=0;i--){if((advChapters[i].volumeId||'')===myVol){isFirstInGroup=false;break;}}
var isLastInGroup=true;
for(var j=idx+1;j<advChapters.length;j++){if((advChapters[j].volumeId||'')===myVol){isLastInGroup=false;break;}}
var div=document.createElement('div');
div.className='adv-ch-item';
div.dataset.idx=idx;
div.style.cssText='background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:12px;margin-bottom:8px;position:relative';
div.innerHTML=`
<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
<div style="display:flex;align-items:center;gap:8px">
<span style="font-size:12px;font-weight:600;color:var(--accent2)">第${idx+1}章</span>
<input type="text" value="${esc(ch.title||'')}" placeholder="章节标题（可选）"
style="padding:4px 8px;border-radius:6px;border:1px solid var(--border);background:var(--card);color:var(--text);font-size:11px;width:120px"
onchange="_advChTouch(${idx},'title',this.value)">
</div>
<div style="display:flex;gap:4px">
<button onclick="moveAdvChapterUp(${idx})" ${isFirstInGroup?'disabled':''} style="padding:2px 6px;border-radius:4px;border:1px solid var(--border);background:transparent;color:var(--text2);font-size:10px;cursor:pointer;${isFirstInGroup?'opacity:.3':''}">↑</button>
<button onclick="moveAdvChapterDown(${idx})" ${isLastInGroup?'disabled':''} style="padding:2px 6px;border-radius:4px;border:1px solid var(--border);background:transparent;color:var(--text2);font-size:10px;cursor:pointer;${isLastInGroup?'opacity:.3':''}">↓</button>
<button onclick="deleteAdvChapter(${idx})" style="padding:2px 6px;border-radius:4px;border:1px solid rgba(255,107,107,.3);background:transparent;color:var(--danger);font-size:10px;cursor:pointer"><i class="fas fa-times"></i></button>
</div>
</div>
<textarea placeholder="本章大纲：要写什么内容、关键情节、情感走向..."
style="width:100%;padding:8px 10px;border-radius:8px;border:1px solid var(--border);background:var(--card);color:var(--text);font-size:11px;min-height:60px;resize:vertical;font-family:inherit;line-height:1.6"
onchange="_advChTouch(${idx},'outline',this.value)">${esc(ch.outline||'')}</textarea>
`;
var volObj=myVol?advVolumes.find(function(v){return v.id===myVol;}):null;
var volBadge=document.createElement('button');
volBadge.type='button';
volBadge.className='ch-vol-select'+(volObj?' assigned':'');
volBadge.style.cssText='margin-top:6px;';
volBadge.innerHTML='<i class="fas fa-layer-group" style="font-size:9px"></i> '+(volObj?esc(volObj.name||'未命名分卷'):'不分卷');
volBadge.onclick=function(){advPickVolForChapter(idx);};
div.appendChild(volBadge);
return div;
}

// 单章分卷改选：不绑定到 curEd/curRd，用 openVolPicker 的仅选择模式，选中后自己写回 advChapters[idx].volumeId
function advPickVolForChapter(idx){
if(!advChapters[idx])return;
openVolPicker(_advVolWork,null,function(volId){
advChapters[idx].volumeId=volId||'';
renderAdvChapterList();
},advChapters[idx].volumeId||'');
}

// ---- 加号菜单：图标点击旋转，下拉"添加章节/添加分卷"两个选项 ----
function toggleAdvChAddMenu(){
var menu=document.getElementById('advChAddMenu');
if(!menu)return;
if(menu.style.display!=='none')closeAdvChAddMenu();
else{
menu.style.display='block';
var icon=document.getElementById('advChAddIcon');
if(icon)icon.style.transform='rotate(45deg)';
var btn=document.getElementById('advChAddBtn');
if(btn)btn.setAttribute('aria-expanded','true');
setTimeout(function(){document.addEventListener('click',_advChAddMenuOutsideClick);},0);
}
}
function closeAdvChAddMenu(){
var menu=document.getElementById('advChAddMenu');
if(menu)menu.style.display='none';
var icon=document.getElementById('advChAddIcon');
if(icon)icon.style.transform='rotate(0deg)';
var btn=document.getElementById('advChAddBtn');
if(btn)btn.setAttribute('aria-expanded','false');
document.removeEventListener('click',_advChAddMenuOutsideClick);
}
function _advChAddMenuOutsideClick(e){
var menu=document.getElementById('advChAddMenu');
var btn=document.getElementById('advChAddBtn');
if(menu&&menu.contains(e.target))return;
if(btn&&btn.contains(e.target))return;
closeAdvChAddMenu();
}
function advChAddMenuPick(type){
closeAdvChAddMenu();
if(type==='chapter')addAdvChapter();
else if(type==='volume')openAdvChAddVolume();
}
function openAdvChAddVolume(){
openVolEdit(_advVolWork,null,function(){renderAdvChapterList();});
}

// ---- 排序方式选择弹窗 ----
var _advChSortOptions=[
{value:'seq-desc',label:'最新'},
{value:'seq-asc',label:'最旧'},
{value:'recent',label:'最近'}
];
function openAdvChSortPicker(){
var listEl=document.getElementById('advChSortPickerList');
if(!listEl)return;
var html='';
_advChSortOptions.forEach(function(o){
var sel=o.value===_advChSortValue;
html+='<button class="col-fp-item'+(sel?' selected':'')+'" onclick="pickAdvChSort(\''+o.value+'\')"><span>'+o.label+'</span>'+(sel?'<i class="fas fa-check fp-check"></i>':'')+'</button>';
});
listEl.innerHTML=html;
var ov=document.getElementById('advChSortPickerOv');
if(!ov)return;
ov.classList.add('show');
navPush('advChSortPickerOv');
}
function pickAdvChSort(value){
closeAdvChSortPicker();
_advChSortValue=value;
var opt=_advChSortOptions.find(function(o){return o.value===value;});
var lbl=document.getElementById('advChSortLabel');
if(lbl&&opt)lbl.textContent=opt.label;
renderAdvChapterList();
}
function closeAdvChSortPicker(){
navPop('advChSortPickerOv');
var ov=document.getElementById('advChSortPickerOv');
if(ov)ov.classList.remove('show');
}

// ---- 章节/分卷定位 ----
function advChLocate(val){
var clean=String(val==null?'':val);
var inp=document.getElementById('advChLocateInput');
if(inp&&inp.value!==clean)inp.value=clean;
_advChLocateVal=clean;
var clearBtn=document.getElementById('advChLocateClear');
if(clearBtn)clearBtn.style.display=clean?'flex':'none';
renderAdvChapterList();
}
function advChLocateClear(){
var inp=document.getElementById('advChLocateInput');
if(inp)inp.value='';
advChLocate('');
}

// 获取选中的标签
function getAdvSelectedTags(containerId){
const tags=[];
document.querySelectorAll('#'+containerId+' .tag.act').forEach(t=>{
tags.push(t.textContent);
});
return tags;
}

// 保存项目
function saveAdvProject(){
const title=document.getElementById('advTitle').value.trim();
if(!title){showToast('请先输入小说标题');return;}
// 同步章节数据
syncAdvChaptersFromUI();
const project={
id:currentAdvProject?currentAdvProject.id:uid(),
title:title,
wordsPerCh:parseInt(document.getElementById('advWordsPerCh').value)||1500,
theme:document.getElementById('advTheme').value.trim(),
synopsis:document.getElementById('advSynopsis').value.trim(),
avoid:document.getElementById('advAvoid').value.trim(),
genres:getAdvSelectedTags('advGenreTags'),
chapters:JSON.parse(JSON.stringify(advChapters)),
volumes:JSON.parse(JSON.stringify(advVolumes)),
useChars:document.getElementById('advUseChars').checked,
useWorld:document.getElementById('advUseWorld').checked,
useStyle:document.getElementById('advUseStyle').checked,
savedAt:new Date().toISOString()
};
// 更新或新增
const existIdx=advProjects.findIndex(p=>p.id===project.id);
if(existIdx>=0){
advProjects[existIdx]=project;
}else{
advProjects.unshift(project);
}
sv('bj_advProjects',advProjects);
currentAdvProject=project;
showToast('项目已保存：'+title+'');
}

// 同步UI到数据
function syncAdvChaptersFromUI(){
document.querySelectorAll('#advChapterList .adv-ch-item').forEach((item)=>{
const idx=parseInt(item.dataset.idx,10);
if(isNaN(idx)||!advChapters[idx])return;
const titleInput=item.querySelector('input[type="text"]');
const outlineInput=item.querySelector('textarea');
if(titleInput)advChapters[idx].title=titleInput.value;
if(outlineInput)advChapters[idx].outline=outlineInput.value;
});
}

// 加载项目
function loadAdvProject(id){
const project=advProjects.find(p=>p.id===id);
if(!project)return;
currentAdvProject=project;
document.getElementById('advTitle').value=project.title||'';
document.getElementById('advWordsPerCh').value=project.wordsPerCh||1500;
document.getElementById('advTheme').value=project.theme||'';
document.getElementById('advSynopsis').value=project.synopsis||'';
document.getElementById('advAvoid').value=project.avoid||'';
// 恢复标签
renderAdvGenreTags();
setTimeout(()=>{
document.querySelectorAll('#advGenreTags .tag').forEach(t=>{
t.classList.toggle('act',(project.genres||[]).includes(t.textContent));
});
},50);
// 恢复开关
document.getElementById('advUseChars').checked=project.useChars!==false;
document.getElementById('advUseWorld').checked=project.useWorld!==false;
document.getElementById('advUseStyle').checked=project.useStyle!==false;
['advUseChars','advUseWorld','advUseStyle'].forEach(updateAdvSwitch);
// 恢复章节+分卷
advChapters=JSON.parse(JSON.stringify(project.chapters||[]));
advVolumes=JSON.parse(JSON.stringify(project.volumes||[]));
_advChExpanded={};
_advChSortValue='seq-asc';
_advChLocateVal='';
var _advChSortLbl2=document.getElementById('advChSortLabel');
if(_advChSortLbl2)_advChSortLbl2.textContent='最旧';
var _advChLocInp2=document.getElementById('advChLocateInput');
if(_advChLocInp2)_advChLocInp2.value='';
var _advChLocClr2=document.getElementById('advChLocateClear');
if(_advChLocClr2)_advChLocClr2.style.display='none';
renderAdvChapterList();
closeAdvLoad();
// 若高级创作弹窗未打开，则打开它
if(!document.getElementById('advCreateOv').classList.contains('show')){
  document.getElementById('advCreateOv').classList.add('show');
  document.getElementById('bnav').classList.add('hide');
  navPush('advCreateOv');
}
showToast('已加载：'+project.title+'');
}

// 删除项目
function deleteAdvProject(id){
showDlg('删除项目','确定要删除这个项目吗？',()=>{
advProjects=advProjects.filter(p=>p.id!==id);
sv('bj_advProjects',advProjects);
renderAdvProjectList();
showToast('项目已删除');
},true);
}

// 打开加载弹窗
function openAdvLoad(){
renderAdvProjectList();
document.getElementById('advLoadOv').classList.add('show');
navPush('advLoadOv');
}

function closeAdvLoad(){
  navPop('advLoadOv');
document.getElementById('advLoadOv').classList.remove('show');
}

function renderAdvProjectList(){
const container=document.getElementById('advProjectList');
if(advProjects.length===0){
container.innerHTML='<div style="text-align:center;padding:30px;color:var(--text2);font-size:12px">还没有保存的项目</div>';
return;
}
container.innerHTML='';
advProjects.forEach(p=>{
const div=document.createElement('div');
div.style.cssText='padding:12px;background:var(--bg);border:1px solid var(--border);border-radius:10px;margin-bottom:8px;cursor:pointer;transition:all .2s';
div.onmouseenter=()=>{div.style.borderColor='var(--accent)';};
div.onmouseleave=()=>{div.style.borderColor='var(--border)';};
const chCount=(p.chapters||[]).length;
const time=p.savedAt?new Date(p.savedAt).toLocaleDateString():'';
div.innerHTML=`
<div style="display:flex;justify-content:space-between;align-items:flex-start">
<div onclick="loadAdvProject('${p.id}')" style="flex:1">
<div style="font-size:13px;font-weight:600;margin-bottom:4px">${esc(p.title||'未命名')}</div>
<div style="font-size:10px;color:var(--text2)">${chCount}章 · ${p.wordsPerCh||1500}字/章 · ${time}</div>
</div>
<button onclick="event.stopPropagation();deleteAdvProject('${p.id}')" style="padding:4px 8px;border-radius:6px;border:1px solid rgba(255,107,107,.3);background:transparent;color:var(--danger);font-size:10px;cursor:pointer">删除</button>
</div>
`;
container.appendChild(div);
});
}

// 停止创作
function stopAdvCreate(){
advCreateAbort=true;
showToast('停止指令已发出，当前章节完成后自动停止，已完成的章节不会丢失',4000);
var _pInfo=document.getElementById('advProgressInfo');
if(_pInfo)_pInfo.textContent='⏸ 停止指令已发出，等待本章完成后停止...';
}

// 开始创作
async function startAdvCreate(){
const cfg=getCurApi();
if(!cfg.url||!cfg.key){showToast('请先在设置中配置API');return;}
syncAdvChaptersFromUI();
const title=document.getElementById('advTitle').value.trim();
if(!title){showToast('请输入小说标题');return;}
if(advChapters.length===0){showToast('请至少添加一章');return;}
// 检查是否有大纲
const hasOutline=advChapters.some(ch=>ch.outline&&ch.outline.trim());
if(!hasOutline){
const synopsis=document.getElementById('advSynopsis').value.trim();
if(!synopsis){
showToast('请填写全文梗概或章节大纲');
return;
}
}
const wordsPerCh=parseInt(document.getElementById('advWordsPerCh').value)||1500;
const theme=document.getElementById('advTheme').value.trim();
const synopsis=document.getElementById('advSynopsis').value.trim();
const avoid=document.getElementById('advAvoid').value.trim();
const genres=getAdvSelectedTags('advGenreTags');
const useChars=document.getElementById('advUseChars').checked;
const useWorld=document.getElementById('advUseWorld').checked;
const useStyle=document.getElementById('advUseStyle').checked;
const useRules=document.getElementById('advUseRules')&&document.getElementById('advUseRules').checked;
const totalCh=advChapters.length;

// ── 检测是否有可以续接的未完成进度 ──
// 判断依据：标题和总章数都要一致才认为是"同一个创作任务"，避免误续到不相关的旧记录；
// 只看"数量"不看逐字内容，是因为用户可能在续接前又调整了大纲文字，这种情况仍然应该允许续接。
let _advResumeNovel=null;
if(_advResumeNovelId){
  const _existing=crWorks.find(w=>w.id===_advResumeNovelId);
  if(_existing&&_existing.type==='novel'&&_existing.title===title
     &&(_existing.chOutlines||[]).length===totalCh
     &&_existing.chapters&&_existing.chapters.length>0&&_existing.chapters.length<totalCh){
    _advResumeNovel=_existing;
  }else{
    // 记录的进度已经不匹配了（标题变了/已经写完/被删除了），清掉过期指针，避免以后一直误判
    _advResumeNovelId='';
    sv('bj_advResumeNovelId','');
  }
}
if(_advResumeNovel){
  const _doResume=await new Promise(function(resolve){
    var _resolved=false;
    function _finish(v){ if(_resolved)return; _resolved=true; resolve(v); }
    showDlg('发现未完成的进度','《'+title+'》上次创作到第'+_advResumeNovel.chapters.length+'/'+totalCh+'章时中断了，是否从下一章继续？直接重新开始会覆盖之前已经生成的章节。',function(){_finish(true);},false);
    setTimeout(function(){
      var okBtn=document.getElementById('dlgOkBtn');
      if(okBtn)okBtn.textContent='继续创作';
      var cancelBtn=document.querySelector('#dlgOv .dlg-cancel');
      if(cancelBtn){
        cancelBtn.style.display='';
        cancelBtn.textContent='重新开始';
        cancelBtn.onclick=function(){closeDlg();_finish(false);};
      }
    },30);
    // 兜底：如果用户是点弹窗外的背景关闭的（不会触发上面两个按钮的onclick），也要让Promise正常resolve，
    // 否则"开始创作"会一直卡在这里没有响应
    var _dlgOv=document.getElementById('dlgOv');
    if(_dlgOv){
      var _mo=new MutationObserver(function(){
        if(!_dlgOv.classList.contains('show')){
          _finish(false);
          _mo.disconnect();
        }
      });
      _mo.observe(_dlgOv,{attributes:true,attributeFilter:['class']});
    }
  });
  if(!_doResume)_advResumeNovel=null;
}

// 预估 token 风险提示
(function(){
  try{
    const _tmpSys=buildSysPrompt();
    const _avgOutlineLen=advChapters.reduce((s,c)=>s+(c.outline||'').length,0)/Math.max(advChapters.length,1);
    const _estInput=estimateTokens(_tmpSys)+Math.ceil(_avgOutlineLen*1.5)+500;
    const _estOutput=Math.ceil(wordsPerCh*1.8)+800;
    const _cfg2=getCurApi();
    const _modelMax=_cfg2.maxTokens||4096;
    const _preflightCtxWindow=_guessModelContextWindow(_cfg2.model);
    if(_estInput+_estOutput>_preflightCtxWindow-1000){
      showToastForce('预估总Token（约'+(_estInput+_estOutput)+'）已接近当前模型上下文窗口（约'+_preflightCtxWindow+'），生成中可能触发"上下文超限"，建议减少每章字数或人设/世界观内容',6000);
    }else if(_modelMax<Math.ceil(wordsPerCh*1.8)){
      showToastForce('Max Tokens 设置('+_modelMax+')可能不足以生成'+wordsPerCh+'字，已自动提升',4000);
    }
  }catch(e){}
})();

// 显示进度，清除上次残留数据
document.getElementById('advProgress').style.display='block';
document.getElementById('advStartBtn').disabled=true;
document.getElementById('advStartBtn').textContent='创作中...';
document.getElementById('advProgressBar').style.width='0%';
document.getElementById('advProgressBar').style.background='';
document.getElementById('advProgressInfo').textContent='准备中...';
var _sdInit=document.getElementById('advChStatusDetail');
if(_sdInit){_sdInit.style.display='none';_sdInit.innerHTML='';}
var _sbInit=document.getElementById('advStopBtn');
if(_sbInit)_sbInit.style.display='block';
advCreateAbort=false;
// novel 声明在try外面，这样即使中途抛出异常，catch块里也能拿到已经生成的章节，
// 给出和正常收尾一致的"已保存，可继续编辑"提示，而不是让用户只看到一句干巴巴的报错
let novel=null;
try{
// 创建或续接小说对象
if(_advResumeNovel){
  novel=_advResumeNovel;
  // 续接时把大纲/主题/梗概/标签/每章字数/规避内容/章节标题/开关状态都更新为这次最新的输入——
  // 用户可能在续接前又调整过后面章节的大纲，也可能是从"高级创作"面板自动恢复表单后直接续接，
  // 这些字段都要跟着最新表单走，否则续接出来的设定和用户刚看到的表单对不上
  novel.chOutlines=advChapters.map(ch=>ch.outline||'');
  novel.chTitles=advChapters.map(ch=>ch.title||'');
  novel.volumes=JSON.parse(JSON.stringify(advVolumes));
  novel.chVolume=advChapters.map(ch=>ch.volumeId||'');
  novel.advTheme=theme;
  novel.advSynopsis=synopsis;
  novel.tags=genres;
  novel.wordsPerCh=wordsPerCh;
  novel.avoid=avoid;
  novel.advUseChars=useChars;
  novel.advUseWorld=useWorld;
  novel.advUseStyle=useStyle;
  novel.advUseRules=useRules;
}else{
  novel={
    id:uid(),
    type:'novel',
    title:title,
    chapters:[],
    chOutlines:advChapters.map(ch=>ch.outline||''),
    // chTitles 是新增字段，专门给"高级创作"恢复表单用的（chOutlines 是纯大纲字符串数组，
    // 全站很多地方按这个格式在读，不能改动它的结构；章节标题另存一份，互不影响）
    chTitles:advChapters.map(ch=>ch.title||''),
    volumes:JSON.parse(JSON.stringify(advVolumes)),
    chVolume:advChapters.map(ch=>ch.volumeId||''),
    advTheme:theme,
    advSynopsis:synopsis,
    tags:genres,
    wordsPerCh:wordsPerCh,
    avoid:avoid,
    advUseChars:useChars,
    advUseWorld:useWorld,
    advUseStyle:useStyle,
    advUseRules:useRules,
    createdAt:new Date().toISOString(),
    updatedAt:new Date().toISOString()
  };
  // 立即记下续接指针：万一这次又中途停止/失败，下次能自动找到接着写
  _advResumeNovelId=novel.id;
  sv('bj_advResumeNovelId',novel.id);
}
// 构建系统提示词
let sysPrompt='';
if(useChars||useWorld||useStyle){
sysPrompt=buildSysPrompt();
}else{
sysPrompt='你是一位才华横溢的小说家，擅长根据大纲创作精彩的故事。\n';
}
sysPrompt+='\n\n【本次创作任务】\n';
sysPrompt+='小说名：《'+title+'》\n';
sysPrompt+='总章数：'+totalCh+'章\n';
sysPrompt+='每章字数：不少于'+wordsPerCh+'字\n';
if(theme)sysPrompt+='核心主题：'+theme+'\n';
if(genres.length>0)sysPrompt+='故事类型：'+genres.join('、')+'\n';
if(avoid)sysPrompt+='【绝对禁止出现的内容】\n'+avoid+'\n请在创作中严格回避以上内容，不要以任何形式触及。\n';
if(synopsis){
sysPrompt+='\n【全文梗概（故事主线）】\n'+synopsis+'\n';
sysPrompt+='请严格围绕此主线推进情节，不要偏离核心走向。\n';
}
if(useRules){
  var _grAdv=(document.getElementById('globalRuleDesc')&&document.getElementById('globalRuleDesc').value||globalRule||'').trim();
  var _lrAdv=(document.getElementById('ruleDesc')&&document.getElementById('ruleDesc').value||'').trim();
  var _rdAdv=[_grAdv,_lrAdv].filter(Boolean).join('\n');
  if(_rdAdv)sysPrompt+='\n【规则约束（全程必须遵守，优先级最高）】\n'+_rdAdv+'\n';
}
sysPrompt+='\n\n【高级创作模式特别要求】\n';
sysPrompt+='1. 每章必须严格遵守对应的章节大纲，大纲中提到的事件、人物行为、情绪转折必须全部体现\n';
sysPrompt+='2. 章与章之间要有明确的因果关系，上一章的结尾要自然衔接下一章的开头\n';
sysPrompt+='3. 人物性格要前后一致，不能突然OOC（除非大纲明确要求性格转变）\n';
sysPrompt+='4. 每章结尾必须设置钩子（悬念/情感高点/新信息），让读者想看下一章\n';
sysPrompt+='5. 伏笔管理：大纲中提到要埋的伏笔必须自然融入，不能生硬\n';
sysPrompt+='6. 情感节奏：不要每章都是高潮，要有张有弛，参考"起承转合"的节奏\n';
sysPrompt+='7. 对话占比控制在30%-50%之间，不要全是对话也不要全是叙述\n';
// 逐章创作
for(let i=novel.chapters.length;i<totalCh;i++){
if(advCreateAbort){
showToast('创作已停止，已完成'+novel.chapters.length+'章');
break;
}
const chNum=i+1;
const chData=advChapters[i];
const pct=Math.round((i/totalCh)*100);
document.getElementById('advProgressBar').style.width=pct+'%';
document.getElementById('advProgressText').textContent=chNum+'/'+totalCh+' 章';
document.getElementById('advProgressInfo').textContent='正在创作：'+(chData.title||'第'+chNum+'章')+'...';
// 构建本章提示词
let userMsg='【创作任务】创作《'+title+'》第'+chNum+'章';
if(chData.title)userMsg+='「'+chData.title+'」';
userMsg+='（共'+totalCh+'章）\n\n';
// 本章大纲
if(chData.outline&&chData.outline.trim()){
userMsg+='【本章大纲（必须严格遵守）】\n'+chData.outline+'\n\n';
}else{
userMsg+='【本章位置】第'+chNum+'/'+totalCh+'章\n';
if(chNum===1)userMsg+='这是开篇，需要抓人的开场\n\n';
else if(chNum===totalCh)userMsg+='这是结局章，需要收束故事\n\n';
else userMsg+='请根据全文梗概推进情节\n\n';
}
// 前文回顾（动态控制长度，避免 Token 随章数增长）
if(novel.chapters.length>0){
userMsg+='【前文回顾】\n';
// 只回顾最近 2 章摘要（每章限 60 字）
const reviewStart=Math.max(0,novel.chapters.length-2);
for(let j=reviewStart;j<novel.chapters.length;j++){
const prevCh=novel.chapters[j];
const prevTitle=advChapters[j]&&advChapters[j].title?'「'+advChapters[j].title+'」':'';
userMsg+='第'+(j+1)+'章'+prevTitle+'：'+prevCh.substring(0,60).replace(/\n/g,' ')+'...\n';
}
// 上一章结尾：章数越多越短，最多 600 字
const lastCh=novel.chapters[novel.chapters.length-1];
const _snipLen=Math.max(200,Math.min(600,Math.floor(8000/Math.max(totalCh,1))));
userMsg+='\n【上一章结尾】\n'+lastCh.substring(Math.max(0,lastCh.length-_snipLen))+'\n\n';
}
userMsg+='【创作要求】\n';
userMsg+='- 【字数硬性要求】正文字数严格不少于'+wordsPerCh+'字！这是铁律，低于此字数视为创作失败。建议写到'+(wordsPerCh+500)+'字以上确保达标\n';
userMsg+='- 直接输出正文，无标题无章节号无作者按语\n';
if(novel.chapters.length>0){
userMsg+='- 开头必须直接承接上一章结尾，用动作或对话切入，禁止用"话说""却说"等说书腔开头，禁止复述前情\n';
userMsg+='- 保持人物说话方式和性格与前文一致\n';
}else{
userMsg+='- 这是第一章，需要一个抓人的开场，让读者在前三段就被吸引\n';
userMsg+='- 让主角在行动中登场，不要用旁白介绍\n';
}
if(chNum<totalCh){
userMsg+='- 结尾必须在悬念或情感高点收尾，制造"非看下一章不可"的冲动\n';
userMsg+='- 不要在本章解决所有矛盾，留有余地给后续章节\n';
}else{
userMsg+='- 这是最后一章，需要：①解决核心矛盾 ②回收主要伏笔 ③给主角一个有成长感的结局 ④结尾留有余韵\n';
}
if(avoid)userMsg+='- 严禁出现：'+avoid+'\n';
// 动态计算这一章目标字数需要的输出token（下面会结合模型上下文窗口再算出真正下发的max_tokens）
const cfg2=getCurApi();
const neededTokens=Math.max(4096, Math.ceil(wordsPerCh*1.8)+800);

// ── Token 三级降级策略 ──
// 精简备用提示词（超限时用）
const _minSys='你是专业小说家，严格按大纲创作。每章字数不少于'+wordsPerCh+'字。直接输出正文，不加标题章节号。\n\n'
  +(useChars&&characters&&characters.filter(c=>c.name).length>0
    ?'【核心人物】\n'+characters.filter(c=>c.name).slice(0,4).map(c=>c.name+(c.desc?'：'+c.desc.substring(0,120):'')).join('\n')+'\n\n'
    :'')
  +(synopsis?'【全文梗概】\n'+synopsis.substring(0,400)+'\n\n':'')
  +(avoid?'【禁止出现】'+avoid+'\n':'');

const inputEstimate=estimateTokens(sysPrompt)+estimateTokens(userMsg);
let finalSysPrompt;
if(inputEstimate<=7000){
  // 正常：使用完整提示词
  finalSysPrompt=sysPrompt;
}else if(inputEstimate<=11000){
  // 偏大：裁剪写作技巧长段，保留人设/世界观
  finalSysPrompt=sysPrompt
    .replace(/【反套路宣言】[\s\S]*?【创作信条】/,'【创作信条】')
    .replace(/【让文字有温度——五感写作法】[\s\S]*?【七条红线/,'【七条红线')
    .replace(/【对话的艺术】[\s\S]*?【节奏呼吸】/,'')
    .replace(/【节奏呼吸】[\s\S]*?永远不要匀速行驶。\n\n/,'')
    .replace(/【长篇连载专项指南】[\s\S]*?现在，深呼吸[\s\S]*?\n/,'');
}else{
  // 超大：直接用最小版
  finalSysPrompt=_minSys;
}
// 二次兜底
if(estimateTokens(finalSysPrompt)+estimateTokens(userMsg)>11000){
  finalSysPrompt=_minSys;
}
// 三次兜底：压缩 userMsg 里的"上一章结尾"到 200 字
let finalUserMsg=userMsg;
if(estimateTokens(finalSysPrompt)+estimateTokens(finalUserMsg)>13000){
  finalUserMsg=finalUserMsg.replace(/(【上一章结尾】\n)([\s\S]*?)(\n\n【创作要求】)/,function(m,p1,p2,p3){
    return p1+p2.substring(Math.max(0,p2.length-200))+p3;
  });
}

const messages=[{role:'system',content:finalSysPrompt},{role:'user',content:finalUserMsg}];

// ── max_tokens 安全上限 ──
// 不能无脑取"目标字数需要的token"和"用户配置的Max Tokens"两者中较大者：用户配置的Max Tokens可能是为别的
// 场景设的一个较大数值，如果直接当作这一章的max_tokens，很容易让"输入+输出"总token数超过模型实际的上下文窗口，
// 导致500报错——这跟大纲精不精简毫无关系，精简大纲只会减少输入token，对"输出token本身就请求过大"这个问题没有帮助。
// 这里改成：先估算模型的上下文窗口，再用"窗口-实际输入-安全余量"作为硬上限。
const _advCtxWindow=_guessModelContextWindow(cfg2.model);
const _advFirstInputEst=estimateTokens(finalSysPrompt)+estimateTokens(finalUserMsg);
const _advFirstSafeMax=Math.max(2048,_advCtxWindow-_advFirstInputEst-1000);
const advMaxTokens=Math.min(_advFirstSafeMax, cfg2.maxTokens?Math.max(neededTokens,cfg2.maxTokens):neededTokens);
// 如果目标字数在当前模型窗口下根本达不到，提前提示一次，帮用户定位原因，而不是让它反复报错
if(advMaxTokens<neededTokens*0.7){
  showToastForce('第'+chNum+'章：当前模型上下文窗口（约'+_advCtxWindow+' tokens）偏小，可能不足以稳定生成'+wordsPerCh+'字，建议减少每章字数或更换上下文更大的模型',5000);
}

// ── 调用 API，失败后用最小提示词自动重试一次 ──
let result=await callAPINonStream(messages,2,{maxTokens:advMaxTokens});
if(!result&&!advCreateAbort){
  document.getElementById('advProgressInfo').textContent='⏳ 第'+chNum+'章出错，精简后重试...';
  showToast('第'+chNum+'章出错，3秒后用精简提示词重试...',3000);
  await new Promise(r=>setTimeout(r,3000));
  if(!advCreateAbort){
    const _advRetryInputEst=estimateTokens(_minSys)+estimateTokens(finalUserMsg);
    const _advRetrySafeMax=Math.max(2048,_advCtxWindow-_advRetryInputEst-1000);
    result=await callAPINonStream(
      [{role:'system',content:_minSys},{role:'user',content:finalUserMsg}],
      1,
      {maxTokens:Math.min(_advRetrySafeMax, Math.min(neededTokens,6000))}
    );
  }
}
if(!result){
  document.getElementById('advProgressInfo').textContent='第'+chNum+'章创作失败（已保存前'+novel.chapters.length+'章）';
  showToast('第'+chNum+'章两次均失败。已保存前'+novel.chapters.length+'章，请检查API或减少人设内容后重试',6000);
  break;
}
novel.chapters.push(result);
novel.updatedAt=new Date().toISOString();
// 每章生成后立即保存，防止中途停止丢失
const tempIdx=crWorks.findIndex(w=>w.id===novel.id);
if(tempIdx>-1){crWorks[tempIdx]=JSON.parse(JSON.stringify(novel));}
else{crWorks.unshift(JSON.parse(JSON.stringify(novel)));}
sv('bj_crWorks',crWorks);
// 延迟避免限流
await new Promise(r=>setTimeout(r,800));
}
// ── 收尾：区分三种结果 ──
const _totalWords=novel.chapters.reduce((sum,ch)=>sum+countWords(ch),0);
const _donePct=(novel.chapters.length/totalCh*100).toFixed(0);

document.getElementById('advProgressText').textContent=novel.chapters.length+'/'+totalCh+' 章';
document.getElementById('advStartBtn').disabled=false;
document.getElementById('advStartBtn').textContent='开始创作';
// 输出每章状态明细
(function(){
  var _sd=document.getElementById('advChStatusDetail');
  if(!_sd)return;
  var _lines=[],_si;
  for(_si=0;_si<totalCh;_si++){
    var _done=(_si<novel.chapters.length);
    var _wc=_done?countWords(novel.chapters[_si]):0;
    var _t=(advChapters[_si]&&advChapters[_si].title)?'「'+advChapters[_si].title+'」':'';
    var _icon=!_done?'<i class="fas fa-circle-xmark"></i>':(_wc>=wordsPerCh?'<i class="fas fa-circle-check"></i>':'<i class="fas fa-triangle-exclamation"></i>');
    var _info=_done?('：'+_wc+'字'+(_wc<wordsPerCh?' (未达标)':'')):'：未生成';
    _lines.push(_icon+' 第'+(_si+1)+'章'+_t+_info);
  }
  if(_lines.length){_sd.style.display='block';_sd.innerHTML=_lines.join('<br>');}
})();

if(novel.chapters.length===0){
  // 完全失败：0 章都没生成，没什么可续接的，清掉指针
  _advResumeNovelId='';
  sv('bj_advResumeNovelId','');
  document.getElementById('advProgressBar').style.width='0%';
  document.getElementById('advProgressBar').style.background='var(--danger)';
  document.getElementById('advProgressInfo').textContent='创作失败，未生成任何章节';
  showToast('创作失败：API 返回错误。建议：①检查 API Key ②减少人设/世界观内容 ③缩短每章字数后重试',7000);
  return;
}

// 有内容：保存并展示结果
document.getElementById('advProgressBar').style.width=_donePct+'%';
if(novel.chapters.length===totalCh&&!advCreateAbort){
  document.getElementById('advProgressInfo').textContent='全部创作完成！共'+_totalWords+'字';
  showToast('创作完成！共'+novel.chapters.length+'章，'+_totalWords+'字',4000);
  // 全部完成，没什么可续接的了，清掉指针
  _advResumeNovelId='';
  sv('bj_advResumeNovelId','');
}else{
  document.getElementById('advProgressInfo').textContent='⏸ 已完成 '+novel.chapters.length+'/'+totalCh+' 章，共 '+_totalWords+' 字（已自动保存）';
  showToast('已保存前'+novel.chapters.length+'章（共'+_totalWords+'字）。重新打开「高级创作」点"开始创作"可自动续接，也可在作品页直接编辑',6000);
}

// 保存到创作页（去重）
const _saveIdx=crWorks.findIndex(w=>w.id===novel.id);
if(_saveIdx>-1){crWorks[_saveIdx]=JSON.parse(JSON.stringify(novel));}
else{crWorks.unshift(JSON.parse(JSON.stringify(novel)));}
sv('bj_crWorks',crWorks);

// 自动收藏（去重）
// 注意：novel.type 在"创作工坊"体系里固定是 'novel'（crWorks/编辑器都按这个判断"是不是长篇"），
// 但"阅读/收藏"体系（cols.books、openReading、renderChContent...）判断长篇的依据是 type==='long'，
// 两边类型定义不一样。如果直接把 novel 深拷贝过去而不转换 type，openReading 里所有
// curRd.type==='long' 的判断都会失败，转而去读 curRd.content——但长篇作品根本没有 content 字段，
// 正文全在 chapters 数组里，结果就是打开预览显示"（本章暂无内容）"，其实章节内容都好好保存着。
// 这里必须显式转换成 'long'，收藏/阅读体系才能正确识别为长篇多章节作品。
const colCopy=JSON.parse(JSON.stringify(novel));
colCopy.type='long';
colCopy.cover=null;
colCopy.status='ongoing';// 不自动完结，由用户手动在收藏页标记
colCopy.rating=0;
const _colIdx=cols.books.findIndex(b=>b.id===novel.id);
if(_colIdx>-1){cols.books[_colIdx]=colCopy;}
else{cols.books.push(colCopy);}
sv(K.cols,cols);

setTimeout(()=>{
closeAdvancedCreate();
renderCrList();
renderCollections();
var _isFullyDone=novel.chapters.length===totalCh&&!advCreateAbort;
var _dlgMsg=_isFullyDone
  ?'创作完成！是否立即阅读《'+novel.title+'》？'
  :'已保存'+novel.chapters.length+'章，是否立即打开查看？';
showDlg('创作完成',_dlgMsg,function(){openReading(colCopy);},true);
if(!_isFullyDone){
  // 没写完才需要一个显眼的"继续创作"入口——之前用户只能靠记住"重新打开高级创作、
  // 输入一模一样的标题和章节数再点开始创作"这种隐藏操作来续接，根本没人找得到。
  // 现在直接把弹窗的"取消"按钮改造成"继续创作"，点一下就回到高级创作面板，
  // 面板会自动检测到未完成的进度并把表单填好（见 openAdvancedCreate 里的自动恢复逻辑）。
  setTimeout(function(){
    var cancelBtn=document.querySelector('#dlgOv .dlg-cancel');
    if(cancelBtn){
      cancelBtn.style.display='';
      cancelBtn.textContent='继续创作';
      cancelBtn.onclick=function(){closeDlg();openAdvancedCreate();};
    }
  },30);
}
},1000);
}catch(e){
console.error('[startAdvCreate]',e);
// novel 声明在try外面，即使中途抛出了没预料到的异常，这里也能访问到已经生成的章节——
// 循环里每章生成后都立即保存过一份到crWorks，不会丢失，这里要给出和"正常收尾"一样清晰的引导，
// 而不是让用户只看到一句干巴巴的报错、不知道已经写好的内容在哪、要怎么继续
if(novel&&novel.chapters&&novel.chapters.length>0){
  const _errIdx=crWorks.findIndex(w=>w.id===novel.id);
  if(_errIdx>-1){crWorks[_errIdx]=JSON.parse(JSON.stringify(novel));}
  else{crWorks.unshift(JSON.parse(JSON.stringify(novel)));}
  sv('bj_crWorks',crWorks);
  // 和"正常收尾"分支一样自动收藏一份，并把 type 转成 'long'（原因见上面"有内容：保存并展示结果"
  // 分支里的详细注释）。之前这里只存进了 crWorks 就完事，收藏页/阅读页都找不到这部分内容，
  // 而且就算传给 openReading 的是 crWorks 里那份 type==='novel' 的原始对象，一样会触发
  // "本章暂无内容"的显示问题——两个分支必须用同一套转换逻辑，不能一个改了一个漏掉。
  const _errColCopy=JSON.parse(JSON.stringify(novel));
  _errColCopy.type='long';
  _errColCopy.cover=null;
  _errColCopy.status='ongoing';
  _errColCopy.rating=0;
  const _errColIdx=cols.books.findIndex(function(b){return b.id===novel.id;});
  if(_errColIdx>-1){cols.books[_errColIdx]=_errColCopy;}
  else{cols.books.push(_errColCopy);}
  sv(K.cols,cols);
  showToast('创作中断（'+(e.message||'未知错误')+'），已保存前'+novel.chapters.length+'章。重新打开「高级创作」可自动续接',6000);
  setTimeout(function(){
    closeAdvancedCreate();
    renderCrList();
    renderCollections();
    showDlg('创作中断','已保存前'+novel.chapters.length+'章，是否立即打开查看？',function(){
      openReading(_errColCopy);
    },false);
    // 同样给一个直达的"继续创作"入口，逻辑和正常收尾分支保持一致
    setTimeout(function(){
      var cancelBtn=document.querySelector('#dlgOv .dlg-cancel');
      if(cancelBtn){
        cancelBtn.style.display='';
        cancelBtn.textContent='继续创作';
        cancelBtn.onclick=function(){closeDlg();openAdvancedCreate();};
      }
    },30);
  },800);
}else{
  showToast('创作中断：'+(e.message||'未知错误'),5000);
}
}finally{
var _sb=document.getElementById('advStartBtn');
if(_sb){_sb.disabled=false;_sb.textContent='开始创作';}
var _sbFin=document.getElementById('advStopBtn');
if(_sbFin)_sbFin.style.display='none';
advCreateAbort=false;
}
}
// ==================== 上下文编辑器 ====================
// ==================== 全局变量定义区 ====================
// 章节大纲：排序方式 + 章节/分卷定位（只影响本面板的浏览/筛选顺序，不改变章节编号和 bookChOutlines 的实际存储顺序）
var _ctxChSortValue='seq-asc';
var _ctxChSortOptions=[
{value:'seq-desc',label:'最新'},
{value:'seq-asc',label:'最旧'},
{value:'recent',label:'最近'}
];
var _ctxChLocateVal=''; // 定位输入框当前值：纯数字按章节号定位，其余按分卷名模糊匹配，''表示不筛选
// 大折叠栏（点击"章节大纲"标题栏展开/收起整个列表）是否展开，默认收起。
// 注意：这只控制"整个列表要不要渲染"，和每个章节自己的小折叠状态（_ctxChExpanded）是两回事，
// 展开大折叠栏不会自动展开任何一个章节卡片。
var _ctxChMasterExpanded=false;

// 分卷归属读写：这份大纲副本里，只要条目对应的是一个已经真实存在的章节（idx < curRd.chapters.length），
// 就直接读写 curRd.chVolume——这样续写上下文页显示/修改的分卷，和章节目录、创作页大纲页看到的是同一份数据，
// 改一处三处都会同步。只有超出真实章节数的条目（大纲页允许预先多写几章的规划，那些章节还不存在，
// 没有真实chVolume可以对应）才会退回到这份副本自己的 _ctxChVolume。
function _ctxChVolGet(idx){
  if(curRd&&curRd.chapters&&idx<curRd.chapters.length){
    return (curRd.chVolume&&curRd.chVolume[idx])||'';
  }
  return (window._ctxChVolume&&window._ctxChVolume[idx])||'';
}
function _ctxChVolSet(idx,volId){
  if(curRd&&curRd.chapters&&idx<curRd.chapters.length){
    _assignChVolume(curRd,idx,volId);
    _persistWorkAfterVolChange(curRd);
  }else{
    if(!window._ctxChVolume)window._ctxChVolume=[];
    while(window._ctxChVolume.length<=idx)window._ctxChVolume.push('');
    window._ctxChVolume[idx]=volId||'';
    if(window.ctxAutoSave)saveContextSettings();
  }
}

// 渲染章节大纲列表：大折叠栏收起且未在定位时，不渲染任何章节卡片（只更新标题栏的章节计数），
// 避免章节很多时一次性生成大量文本框/事件监听器占用性能；展开后按当前排序方式排列每个章节自己的折叠状态不受影响；
// 定位命中时，无论大折叠栏是否展开都会直接显示匹配内容，方便快速查找。
function renderCtxChOutlines(){
  var list=document.getElementById('ctxChOutlineList');
  if(!list)return;
  var outlines=window._ctxChOutlines||[];
  if(!window._ctxChOutlineUpdatedAt)window._ctxChOutlineUpdatedAt=[];
  if(!window._ctxChExpanded)window._ctxChExpanded=[];
  if(!window._ctxChVolume)window._ctxChVolume=[];
  _updateCtxChMasterCount();
  var locateActive=(_ctxChLocateVal!=='');
  if(!_ctxChMasterExpanded&&!locateActive){
    list.innerHTML='';
    return;
  }
  list.innerHTML='';
  if(outlines.length===0){
    list.innerHTML='<div style="font-size:12px;color:var(--text2);text-align:center;padding:16px 0;">暂无章节大纲，点击「添加章节」开始添加</div>';
    return;
  }
  var indices=outlines.map(function(_,i){return i;});
  var isNumericLocate=locateActive&&/^\d+$/.test(_ctxChLocateVal);
  var numericHitIdx=-1; // 数字定位命中的那个具体条目下标，用于后面自动滚动定位（哪怕展示的是整卷）
  var emptyMsg='暂无章节大纲，点击「添加章节」开始添加';
  if(locateActive){
    if(isNumericLocate){
      var locateNum=parseInt(_ctxChLocateVal,10);
      numericHitIdx=(locateNum>0&&locateNum-1<outlines.length)?(locateNum-1):-1;
      if(numericHitIdx>=0){
        var hitVol=_ctxChVolGet(numericHitIdx);
        // 命中的章节属于某个分卷：展示这一整卷，其余分卷全部隐藏；不属于任何分卷则只显示这一条，和原来行为一致
        indices=hitVol?indices.filter(function(i){return _ctxChVolGet(i)===hitVol;}):[numericHitIdx];
      }else{
        indices=[];
      }
      emptyMsg='未找到第'+esc(_ctxChLocateVal)+'章';
    }else{
      var kw=_ctxChLocateVal.trim().toLowerCase();
      var matchVolIds=((curRd&&curRd.volumes)||[]).filter(function(v){return (v.name||'').toLowerCase().indexOf(kw)!==-1;}).map(function(v){return v.id;});
      indices=matchVolIds.length>0?indices.filter(function(i){var vid=_ctxChVolGet(i);return vid&&matchVolIds.indexOf(vid)!==-1;}):[];
      emptyMsg='未找到名称包含"'+esc(_ctxChLocateVal.trim())+'"的分卷';
    }
  }
  // 排序（仅决定浏览顺序，章节编号始终按原始索引显示，不会因排序而错位）
  var sortFns={
    'seq-asc':function(a,b){return a-b;},
    'seq-desc':function(a,b){return b-a;},
    'recent':function(a,b){
      var ua=window._ctxChOutlineUpdatedAt[a]||0;
      var ub=window._ctxChOutlineUpdatedAt[b]||0;
      return ub!==ua?ub-ua:a-b;
    }
  };
  indices.sort(sortFns[_ctxChSortValue]||sortFns['seq-asc']);
  if(indices.length===0){
    list.innerHTML='<div style="font-size:12px;color:var(--text2);text-align:center;padding:16px 0;">'+(locateActive?emptyMsg:emptyMsg)+'</div>';
    return;
  }
  indices.forEach(function(idx){
    list.appendChild(_buildCtxChOutlineItem(idx,outlines[idx]||'',locateActive));
  });
  // 数字定位命中时自动滚动到那一具体章节并展开，方便"快速找到"（哪怕当前展示的是它所在的整卷）
  if(numericHitIdx>=0){
    var hit=list.querySelector('[data-ch-idx="'+numericHitIdx+'"]');
    if(hit)setTimeout(function(){hit.scrollIntoView({block:'nearest',behavior:'smooth'});},50);
  }
}

// 切换大折叠栏展开/收起状态（点击"章节大纲"标题栏触发）
function toggleCtxChMasterBar(){
  _ctxChMasterExpanded=!_ctxChMasterExpanded;
  _syncCtxChMasterBarUI();
  renderCtxChOutlines();
}

// 同步大折叠栏的箭头方向和无障碍状态，与实际展开/收起状态保持一致
function _syncCtxChMasterBarUI(){
  var chevron=document.getElementById('ctxChMasterChevron');
  if(chevron)chevron.style.transform='rotate('+(_ctxChMasterExpanded?90:0)+'deg)';
  var bar=document.getElementById('ctxChMasterBar');
  if(bar)bar.setAttribute('aria-expanded',_ctxChMasterExpanded?'true':'false');
}

// 更新标题栏里的章节计数文案，让用户不展开列表也能知道已经有多少章
function _updateCtxChMasterCount(){
  var span=document.getElementById('ctxChMasterCount');
  if(!span)return;
  var n=(window._ctxChOutlines||[]).length;
  span.textContent=n>0?('（共'+n+'章）'):'';
}

// 构建单个章节卡片：折叠时只显示"第N章 + 单行预览"，点击展开后才渲染可编辑大纲
function _buildCtxChOutlineItem(idx,text,forceExpand){
  var expanded=forceExpand||!!window._ctxChExpanded[idx];
  var item=document.createElement('div');
  item.setAttribute('data-ch-idx',String(idx));
  item.style.cssText='background:var(--card);border:1px solid var(--border);border-radius:12px;padding:10px 12px;margin-bottom:8px;';
  var hdr=document.createElement('div');
  hdr.style.cssText='display:flex;align-items:center;gap:8px;cursor:pointer;-webkit-tap-highlight-color:transparent;';
  hdr.onclick=function(){toggleCtxChOutlineItem(idx);};
  var preview=(text||'').replace(/\s+/g,' ').trim().substring(0,26);
  hdr.innerHTML='<i class="fas fa-chevron-right" id="ctxChChevron'+idx+'" style="font-size:10px;color:var(--text2);flex-shrink:0;transition:transform .2s;transform:rotate('+(expanded?90:0)+'deg);"></i>'+
    '<span style="font-size:11px;font-weight:700;color:var(--accent2);flex-shrink:0;">第'+(idx+1)+'章</span>'+
    '<span id="ctxChPreview'+idx+'" style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px;color:var(--text2);'+(expanded?'display:none;':'')+'">'+(preview?esc(preview)+(text.length>26?'…':''):'未填写')+'</span>';
  var delBtn=document.createElement('button');
  delBtn.type='button';
  delBtn.style.cssText='background:none;border:none;padding:2px 4px;cursor:pointer;border-radius:6px;flex-shrink:0;';
  delBtn.innerHTML='<i class="fas fa-trash-alt" style="font-size:12px;color:var(--danger);"></i>';
  delBtn.onclick=function(e){e.stopPropagation();removeCtxChOutline(idx);};
  hdr.appendChild(delBtn);
  var body=document.createElement('div');
  body.id='ctxChBody'+idx;
  body.style.cssText='margin-top:8px;'+(expanded?'':'display:none;');
  // 分卷标记：已存在的真实章节直接读 curRd.chVolume（和目录页/大纲页保持同步）；
  // 超出真实章节数的预规划条目才用这份大纲自己的 _ctxChVolume。分卷名称/梗概本身共用同一份 curRd.volumes。
  var volId=_ctxChVolGet(idx);
  var volObj=volId&&curRd&&curRd.volumes?curRd.volumes.find(function(v){return v.id===volId;}):null;
  var volBadge=document.createElement('button');
  volBadge.type='button';
  volBadge.className='ch-vol-select'+(volObj?' assigned':'');
  volBadge.style.cssText='margin-bottom:6px;';
  volBadge.innerHTML='<i class="fas fa-layer-group" style="font-size:9px"></i> '+(volObj?esc(volObj.name||'未命名分卷'):'不分卷');
  volBadge.onclick=function(e){e.stopPropagation();ctxChPickVolForEntry(idx);};
  body.appendChild(volBadge);
  var scrollWrap=document.createElement('div');
  // 展开后最大高度约等于一屏手机高度，超出部分在卡片内部正常滚动，不会把整页无限撑长
  scrollWrap.style.cssText='max-height:70vh;overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;';
  var ta=document.createElement('textarea');
  ta.className='fta';
  ta.setAttribute('data-outline-idx',String(idx));
  ta.placeholder='第'+(idx+1)+'章大纲...';
  ta.style.cssText='width:100%;min-height:60px;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:7px 9px;font-size:12px;color:var(--text);line-height:1.7;box-sizing:border-box;font-family:inherit;';
  ta.value=text||'';
  ta.addEventListener('input',(function(i){return function(){
    if(!window._ctxChOutlines)return;
    window._ctxChOutlines[i]=this.value;
    if(!window._ctxChOutlineUpdatedAt)window._ctxChOutlineUpdatedAt=[];
    window._ctxChOutlineUpdatedAt[i]=Date.now();
    var pv=document.getElementById('ctxChPreview'+i);
    if(pv){
      var p=(this.value||'').replace(/\s+/g,' ').trim().substring(0,26);
      pv.textContent=p?p+(this.value.length>26?'…':''):'未填写';
    }
    if(window.ctxAutoSave)saveContextSettings();
  };})(idx));
  scrollWrap.appendChild(ta);
  body.appendChild(scrollWrap);
  item.appendChild(hdr);
  item.appendChild(body);
  return item;
}

// 展开/折叠某一章节卡片
function toggleCtxChOutlineItem(idx){
  var body=document.getElementById('ctxChBody'+idx);
  var chevron=document.getElementById('ctxChChevron'+idx);
  var preview=document.getElementById('ctxChPreview'+idx);
  if(!body)return;
  if(!window._ctxChExpanded)window._ctxChExpanded=[];
  var expanded=body.style.display!=='none';
  if(expanded){
    body.style.display='none';
    if(chevron)chevron.style.transform='rotate(0deg)';
    if(preview)preview.style.display='';
    window._ctxChExpanded[idx]=false;
  }else{
    body.style.display='block';
    if(chevron)chevron.style.transform='rotate(90deg)';
    if(preview)preview.style.display='none';
    window._ctxChExpanded[idx]=true;
  }
}

function addCtxChOutline(){
  if(!window._ctxChOutlines)window._ctxChOutlines=[];
  if(!window._ctxChOutlineUpdatedAt)window._ctxChOutlineUpdatedAt=[];
  if(!window._ctxChExpanded)window._ctxChExpanded=[];
  if(!window._ctxChVolume)window._ctxChVolume=[];
  // 新增章节前先清除章节/分卷定位筛选：否则如果之前筛选的内容和新章节不匹配，
  // 新章节会被"隐藏"，用户会误以为添加失败
  if(_ctxChLocateVal!==''){
    _ctxChLocateVal='';
    var _locInp=document.getElementById('ctxChLocateInput');
    if(_locInp)_locInp.value='';
    var _locClr=document.getElementById('ctxChLocateClear');
    if(_locClr)_locClr.style.display='none';
  }
  var newIdx=window._ctxChOutlines.length;
  window._ctxChOutlines.push('');
  window._ctxChOutlineUpdatedAt.push(Date.now());
  window._ctxChExpanded.push(true); // 新章节预先标记为展开：大折叠栏收起时不会立即渲染它，但之后一旦展开列表就能直接看到并编辑，不用再多点一次
  window._ctxChVolume.push(''); // 新章节默认未分卷，添加后可以用每条自己的分卷chip改选
  renderCtxChOutlines();
  if(_ctxChMasterExpanded){
    // 大折叠栏已展开：沿用原有体验，滚动定位到新章节方便立即填写
    var target=document.querySelector('#ctxChOutlineList [data-ch-idx="'+newIdx+'"]');
    if(target)setTimeout(function(){target.scrollIntoView({block:'nearest',behavior:'smooth'});},100);
  }else{
    // 大折叠栏收起：不强制展开、不渲染其他章节（避免章节多时的性能开销），用toast明确告知已添加成功
    showToast('已添加第'+(newIdx+1)+'章，展开列表或定位章节编辑',2200);
  }
  if(window.ctxAutoSave)saveContextSettings();
}

function removeCtxChOutline(idx){
  if(!window._ctxChOutlines)return;
  window._ctxChOutlines.splice(idx,1);
  if(window._ctxChOutlineUpdatedAt)window._ctxChOutlineUpdatedAt.splice(idx,1);
  if(window._ctxChExpanded)window._ctxChExpanded.splice(idx,1);
  if(window._ctxChVolume)window._ctxChVolume.splice(idx,1);
  renderCtxChOutlines();
  if(window.ctxAutoSave)saveContextSettings();
}

// ---- 加号菜单：图标点击旋转，下拉"添加章节/添加分卷"两个选项 ----
function toggleCtxChAddMenu(){
  var menu=document.getElementById('ctxChAddMenu');
  if(!menu)return;
  if(menu.style.display!=='none')closeCtxChAddMenu();
  else{
    menu.style.display='block';
    var icon=document.getElementById('ctxChAddIcon');
    if(icon)icon.style.transform='rotate(45deg)';
    var btn=document.getElementById('ctxChAddBtn');
    if(btn)btn.setAttribute('aria-expanded','true');
    // 延后一个事件循环再监听"点击外部关闭"，避免这次打开菜单的点击冒泡到document时把菜单立刻关掉
    setTimeout(function(){document.addEventListener('click',_ctxChAddMenuOutsideClick);},0);
  }
}
function closeCtxChAddMenu(){
  var menu=document.getElementById('ctxChAddMenu');
  if(menu)menu.style.display='none';
  var icon=document.getElementById('ctxChAddIcon');
  if(icon)icon.style.transform='rotate(0deg)';
  var btn=document.getElementById('ctxChAddBtn');
  if(btn)btn.setAttribute('aria-expanded','false');
  document.removeEventListener('click',_ctxChAddMenuOutsideClick);
}
function _ctxChAddMenuOutsideClick(e){
  var menu=document.getElementById('ctxChAddMenu');
  var btn=document.getElementById('ctxChAddBtn');
  if(menu&&menu.contains(e.target))return;
  if(btn&&btn.contains(e.target))return;
  closeCtxChAddMenu();
}
function ctxChAddMenuPick(type){
  closeCtxChAddMenu();
  if(type==='chapter')addCtxChOutline();
  else if(type==='volume')openCtxChAddVolume();
}
// 从加号菜单"添加分卷"：复用和目录页/大纲页同一个新建/编辑分卷弹窗，写入的是同一份 curRd.volumes
function openCtxChAddVolume(){
  if(!curRd)return;
  openVolEdit(curRd,null,null);
}
// 单条大纲的分卷改选：用 openVolPicker 的仅选择模式（不绑定具体章节，选中后自己决定写到哪），
// 实际落地位置由 _ctxChVolGet/_ctxChVolSet 决定——已存在的真实章节会直接同步到 curRd.chVolume
function ctxChPickVolForEntry(idx){
  if(!curRd)return;
  openVolPicker(curRd,null,function(volId){
    _ctxChVolSet(idx,volId);
    renderCtxChOutlines();
  },_ctxChVolGet(idx));
}

// ---- 排序方式选择弹窗 ----
function openCtxChSortPicker(){
  var listEl=document.getElementById('ctxChSortPickerList');
  if(!listEl)return;
  var html='';
  _ctxChSortOptions.forEach(function(o){
    var sel=o.value===_ctxChSortValue;
    html+='<button class="col-fp-item'+(sel?' selected':'')+'" onclick="pickCtxChSort(\''+o.value+'\')">'+
      '<span>'+o.label+'</span>'+(sel?'<i class="fas fa-check fp-check"></i>':'')+
      '</button>';
  });
  listEl.innerHTML=html;
  var ov=document.getElementById('ctxChSortPickerOv');
  if(!ov)return;
  ov.classList.add('show');
  navPush('ctxChSortPickerOv');
}
function pickCtxChSort(value){
  closeCtxChSortPicker();
  _ctxChSortValue=value;
  var opt=_ctxChSortOptions.find(function(o){return o.value===value;});
  var lbl=document.getElementById('ctxChSortLabel');
  if(lbl&&opt)lbl.textContent=opt.label;
  renderCtxChOutlines();
}
function closeCtxChSortPicker(){
  navPop('ctxChSortPickerOv');
  var ov=document.getElementById('ctxChSortPickerOv');
  if(ov)ov.classList.remove('show');
}

// ---- 章节/分卷定位：纯数字按章节号定位；否则按分卷名模糊匹配，命中分卷则显示整卷、隐藏其余分卷 ----
function ctxChLocate(val){
  var clean=String(val==null?'':val); // 现在既可能是章节号也可能是分卷名，不再强制过滤成纯数字
  var inp=document.getElementById('ctxChLocateInput');
  if(inp&&inp.value!==clean)inp.value=clean;
  _ctxChLocateVal=clean;
  var clearBtn=document.getElementById('ctxChLocateClear');
  if(clearBtn)clearBtn.style.display=clean?'flex':'none';
  renderCtxChOutlines();
}
function ctxChLocateClear(){
  var inp=document.getElementById('ctxChLocateInput');
  if(inp)inp.value='';
  ctxChLocate('');
}
function openContextEditor(){
if(!curRd||curRd.type!=='long'){showToast('请先打开一篇长篇文章');return;}
var ctx=articleContexts[curRd.id]||{};
// 书籍级设定
document.getElementById('ctxStorySynopsis').value=ctx.storySynopsis||'';
document.getElementById('ctxCoreTheme').value=ctx.coreTheme||'';
// 自动回填：梗概和主题（来源：高级创作/大纲生成器）
if(!document.getElementById('ctxStorySynopsis').value){
  var _synSrc=(curRd&&(curRd.advSynopsis||curRd.outline))||'';
  if(!_synSrc){var _cwS=crWorks.find(function(w){return w.id===curRd.id;});_synSrc=(_cwS&&(_cwS.advSynopsis||_cwS.outline))||'';}
  if(!_synSrc){var _cbS=cols.books.find(function(b){return b.id===curRd.id;});_synSrc=(_cbS&&(_cbS.advSynopsis||_cbS.outline))||'';}
  if(_synSrc){document.getElementById('ctxStorySynopsis').value=_synSrc.substring(0,800);showToast('已自动填入故事梗概',2000);}
}
if(!document.getElementById('ctxCoreTheme').value){
  var _themeSrc=(curRd&&curRd.advTheme)||'';
  if(!_themeSrc){var _cwT=crWorks.find(function(w){return w.id===curRd.id;});_themeSrc=(_cwT&&_cwT.advTheme)||'';}
  if(!_themeSrc){var _cbT=cols.books.find(function(b){return b.id===curRd.id;});_themeSrc=(_cbT&&_cbT.advTheme)||'';}
  if(_themeSrc)document.getElementById('ctxCoreTheme').value=_themeSrc;
}
// 章节大纲（结构化）
window._ctxChOutlines=(ctx.bookChOutlines&&ctx.bookChOutlines.length>0)?ctx.bookChOutlines.slice():[];
window._ctxChOutlineUpdatedAt=(ctx.chOutlineUpdatedAt&&ctx.chOutlineUpdatedAt.length===window._ctxChOutlines.length)?ctx.chOutlineUpdatedAt.slice():window._ctxChOutlines.map(function(){return 0;});
window._ctxChVolume=(ctx.bookChVolume&&ctx.bookChVolume.length===window._ctxChOutlines.length)?ctx.bookChVolume.slice():window._ctxChOutlines.map(function(){return '';});
if(window._ctxChOutlines.length===0){
  var _autoFilled=false;
  if(curRd.chOutlines&&curRd.chOutlines.length>0){window._ctxChOutlines=curRd.chOutlines.slice();_autoFilled=true;}
  if(!_autoFilled){var _cb=cols.books.find(function(b){return b.id===curRd.id;});if(_cb&&_cb.chOutlines&&_cb.chOutlines.length>0){window._ctxChOutlines=_cb.chOutlines.slice();_autoFilled=true;}}
  if(!_autoFilled){var _cw=crWorks.find(function(w){return w.id===curRd.id;});if(_cw&&_cw.chOutlines&&_cw.chOutlines.length>0){window._ctxChOutlines=_cw.chOutlines.slice();_autoFilled=true;}}
  if(_autoFilled){
    showToast('已自动填入章节大纲',2500);
    window._ctxChOutlineUpdatedAt=window._ctxChOutlines.map(function(){return 0;});
    // 分卷不需要在这里拷贝：只要条目对应真实存在的章节，_ctxChVolGet 会直接读 curRd.chVolume，本来就是同一份数据
    window._ctxChVolume=window._ctxChOutlines.map(function(){return '';});
  }
}
// 折叠状态：每次打开面板默认全部折叠，节省空间
window._ctxChExpanded=window._ctxChOutlines.map(function(){return false;});
// 大折叠栏：每次打开面板默认收起整个章节列表，避免章节很多时一次性渲染出一长串卡片
_ctxChMasterExpanded=false;
_syncCtxChMasterBarUI();
// 排序方式 & 章节/分卷定位：每次打开面板重置为默认，避免带着上次的筛选状态造成困惑
_ctxChSortValue='seq-asc';
_ctxChLocateVal='';
var _ctxChSortLbl=document.getElementById('ctxChSortLabel');
if(_ctxChSortLbl)_ctxChSortLbl.textContent='最旧';
var _ctxChLocInp=document.getElementById('ctxChLocateInput');
if(_ctxChLocInp)_ctxChLocInp.value='';
var _ctxChLocClr=document.getElementById('ctxChLocateClear');
if(_ctxChLocClr)_ctxChLocClr.style.display='none';
closeCtxChAddMenu(); // 防止上次关闭时菜单碰巧还开着，重新打开时残留展开状态
renderCtxChOutlines();
// 续写上下文字段
document.getElementById('ctxPrevSummary').value=ctx.prevSummary||'';
document.getElementById('ctxForeshadows').value=ctx.foreshadows||'';
document.getElementById('ctxCharStates').value=ctx.charStates||'';
var _ctxEstEl=document.getElementById('ctxEstFacts');if(_ctxEstEl)_ctxEstEl.value=ctx.estFacts||'';
var _dirEl=document.getElementById('dirInput');
document.getElementById('ctxDirection').value=ctx.direction||(_dirEl?_dirEl.value:'')||'';
document.getElementById('ctxSpecialReq').value=ctx.specialReq||'';
_ctxSetLastChLen(ctx.lastChLen||1500);
document.getElementById('ctxSendFirstCh').checked=ctx.sendFirstCh!==false;
updateCtxSwitch('ctxSendFirstCh');
document.getElementById('ctxSendAllOutlines').checked=!!ctx.sendAllOutlines;
updateCtxSwitch('ctxSendAllOutlines');
// 多章模式下，若未填写作方向则显示提示
var _hint=document.getElementById('ctxDirectionHint');
if(_hint)_hint.style.display=(_rdContChCount>1&&!ctx.direction)?'block':'none';
document.getElementById('rdModal').style.overflow='hidden';
document.getElementById('contextEditorOv').classList.add('show');
navPush('contextEditorOv');
}

function closeContextEditor(){
  navPop('contextEditorOv');
  document.getElementById('contextEditorOv').classList.remove('show');
  closeCtxChAddMenu();
  // 恢复阅读页滚动
  const rd=document.getElementById('rdModal');
  if(rd) rd.style.overflow='';
}

function toggleCtxSwitch(id,el){
const cb=document.getElementById(id);
cb.checked=!cb.checked;
updateCtxSwitch(id);
}

function updateCtxSwitch(id){
const cb=document.getElementById(id);
const track=document.getElementById(id+'Track');
const thumb=document.getElementById(id+'Thumb');
if(cb.checked){
track.style.background='var(--accent)';
thumb.style.left='22px';
}else{
track.style.background='var(--border)';
thumb.style.left='2px';
}
}

function clearCtxField(id){
document.getElementById(id).value='';
}

// 上一章发送长度：真实值可能超过滑块500-3000的范围（自定义输入产生），单独用变量记录真实值；
// 滑块本身的DOM value会被浏览器自动夹紧到min/max之间，只作为可视化参考，不作为真实值来源
function _ctxSetLastChLen(val){
val=parseInt(val,10);
if(isNaN(val)||val<=0)val=1500;
window._ctxLastChLenReal=val;
var slider=document.getElementById('ctxLastChLen');
if(slider)slider.value=val;
var span=document.getElementById('ctxLastChLenVal');
if(span)span.textContent=val+'字';
}

function _ctxGetLastChLen(){
var v=window._ctxLastChLenReal;
if(typeof v!=='number'||isNaN(v)||v<=0){
var slider=document.getElementById('ctxLastChLen');
v=slider?parseInt(slider.value,10):1500;
}
return (v&&v>0)?v:1500;
}

// 点击"上一章发送长度"的数字：弹出输入框，允许输入不受滑块3000字上限限制的自定义字数
function _ctxLastChLenCustomInput(){
showInp('自定义发送字数','输入字数，如 5000（不受滑块3000字上限限制）',function(val){
var n=parseInt(val,10);
if(!n||n<=0){showToast('请输入大于0的整数字数');return;}
_ctxSetLastChLen(n);
if(window.ctxAutoSave)saveContextSettings();
showToast('已设为'+n+'字');
});
}

function saveContextSettings(){
if(!curRd)return;
// 从DOM同步章节大纲（防止oninput未触发时漏存）；值确实变化时才回写修改时间，避免"最近修改"排序被无意义地打乱
document.querySelectorAll('#ctxChOutlineList textarea[data-outline-idx]').forEach(function(ta){
  var i=parseInt(ta.getAttribute('data-outline-idx'),10);
  if(isNaN(i)||!window._ctxChOutlines)return;
  if(window._ctxChOutlines[i]!==ta.value){
    window._ctxChOutlines[i]=ta.value;
    if(!window._ctxChOutlineUpdatedAt)window._ctxChOutlineUpdatedAt=[];
    window._ctxChOutlineUpdatedAt[i]=Date.now();
  }
});
var ctx={
storySynopsis:document.getElementById('ctxStorySynopsis').value.trim(),
coreTheme:document.getElementById('ctxCoreTheme').value.trim(),
bookChOutlines:(window._ctxChOutlines||[]).map(function(s){return(s||'').trim();}),
chOutlineUpdatedAt:(window._ctxChOutlines||[]).map(function(_,i){return (window._ctxChOutlineUpdatedAt&&window._ctxChOutlineUpdatedAt[i])||0;}),
bookChVolume:(window._ctxChOutlines||[]).map(function(_,i){return (window._ctxChVolume&&window._ctxChVolume[i])||'';}),
prevSummary:document.getElementById('ctxPrevSummary').value.trim(),
foreshadows:document.getElementById('ctxForeshadows').value.trim(),
charStates:document.getElementById('ctxCharStates').value.trim(),
estFacts:document.getElementById('ctxEstFacts')?document.getElementById('ctxEstFacts').value.trim():'',
direction:document.getElementById('ctxDirection').value.trim(),
specialReq:document.getElementById('ctxSpecialReq').value.trim(),
lastChLen:_ctxGetLastChLen(),
sendFirstCh:document.getElementById('ctxSendFirstCh').checked,
sendAllOutlines:document.getElementById('ctxSendAllOutlines').checked
};
articleContexts[curRd.id]=ctx;
sv('bj_articleContexts',articleContexts);
return ctx;
}

function saveAndContinue(){
var saved=saveContextSettings();
if(!saved){showToast('请先打开一篇长篇文章');return;}
closeContextEditor();
showToast('上下文已保存，正在启动续写...', 2500);
continueChapterWithContext();
}

// AI生成前情提要
async function aiGenPrevSummary(btn){
  if(!curRd||!curRd.chapters||curRd.chapters.length<1){showToast('章节太少，无法生成');return;}
  const cfg=getCurApi();
  if(!cfg.url||!cfg.key){showToast('请先配置API');return;}
  btn.disabled=true;
  btn.textContent='生成中...';
let allText='';
curRd.chapters.forEach((ch,i)=>{
allText+='【第'+(i+1)+'章】\n'+ch.substring(0,800)+'\n\n';
});
const sysMsg='你是一位专业的小说编辑，擅长提炼故事要点。请为以下小说内容生成一份简洁的前情提要，供AI续写时参考。\n\n要求：\n- 按章节顺序梳理关键情节\n- 突出人物关系变化\n- 标注重要转折点\n- 总字数200-400字\n- 使用简洁的条目式或分段式';
const userMsg='请为以下内容生成前情提要：\n\n'+allText.substring(0,6000);
try{
const result=await callToolAPINonStream([{role:'system',content:sysMsg},{role:'user',content:userMsg}]);
btn.disabled=false;
btn.innerHTML='<i class="fas fa-robot"></i> AI生成提要';
if(result){
document.getElementById('ctxPrevSummary').value=result;
showToast('前情提要已生成');
}
}catch(e){
btn.disabled=false;
btn.innerHTML='<i class="fas fa-robot"></i> AI生成提要';
showToast('生成失败：'+(e.message||'网络异常'),3000);
}
}

// AI分析人物状态
async function aiGenCharStates(btn){
  if(!curRd||!curRd.chapters||curRd.chapters.length<1){showToast('章节太少');return;}
  const cfg=getCurApi();
  if(!cfg.url||!cfg.key){showToast('请先配置API');return;}
  btn.disabled=true;
  btn.textContent='分析中...';
const lastCh=curRd.chapters[curRd.chapters.length-1]||'';
const validChars=characters.filter(c=>c.name);
let charInfo='';
if(validChars.length>0){
charInfo='【已设定的角色】\n'+validChars.map(c=>c.name).join('、')+'\n\n';
}
const sysMsg='你是一位细心的小说分析师。请根据最新章节内容，分析主要角色当前的状态。\n\n输出格式：\n角色名：当前位置/处境，情绪状态，与其他角色的关系变化\n\n要求简洁，每个角色1-2句话。';
const userMsg=charInfo+'【最新章节内容】\n'+lastCh.substring(0,3000)+'\n\n请分析各角色当前状态：';
try{
const result=await callToolAPINonStream([{role:'system',content:sysMsg},{role:'user',content:userMsg}]);
btn.disabled=false;
btn.innerHTML='<i class="fas fa-robot"></i> AI分析人物状态';
if(result){
document.getElementById('ctxCharStates').value=result;
showToast('人物状态已分析');
}
}catch(e){
btn.disabled=false;
btn.innerHTML='<i class="fas fa-robot"></i> AI分析人物状态';
showToast('分析失败：'+(e.message||'网络异常'),3000);
}
}

// 从伏笔追踪器导入
function loadForeshadowsToCtx(){
if(!curRd){showToast('请先打开文章');return;}
const list=getForeshadows(curRd.id);
const pending=list.filter(f=>f.status!=='done');
if(pending.length===0){
showToast('没有待回收的伏笔');
return;
}
let text='';
pending.forEach(f=>{
text+='- '+f.content+(f.chapter?' ('+f.chapter+')':'')+'\n';
});
document.getElementById('ctxForeshadows').value=text.trim();
showToast('已导入'+pending.length+'条伏笔');
}
// ==================== 智能续写 ====================
async function smartContinue(){
if(!checkApiCooldown())return;
if(!curRd||curRd.type!=='long')return;
if(isGen){showToast('正在生成中');return;}
_batchContRemain=Math.max(0,(_rdContChCount||1)-1);
_batchArticleId=curRd?curRd.id:'';
var liked=isLiked(curRd);
if(!liked){showToast('请先点击 收藏后才能续写哦～');return;}
var colBook3=cols.books.find(function(b){return b.id===curRd.id;});
if(colBook3&&colBook3.status==='complete'){
showToast('此作品已完结，无法续写。可以使用「番外篇」功能',4000);
return;
}
var cfg=getCurApi();
if(!cfg.url||!cfg.key){showToast('请先在设置中配置API');return;}

var btn=document.getElementById('btnSmartCont');
btn.disabled=true;
btn.innerHTML='<i class="fas fa-brain"></i> 分析中...';

var nextChNum=curRd.chapters?curRd.chapters.length+1:1;

showToast('正在分析前情和人物状态...',3000);

if(!articleContexts[curRd.id])articleContexts[curRd.id]={};
var ctx=articleContexts[curRd.id];

var dir=(document.getElementById('dirInput').value||'').trim();
if(dir)ctx.direction=dir;

try{
var summaryResult=await smartGenSummary();
if(summaryResult)ctx.prevSummary=summaryResult;

var charResult=await smartGenCharStatesV2().catch(function(){return null;});
if(charResult){
  ctx.charStatesV2=charResult;
}else{
  var charResultOld=await smartGenCharStates().catch(function(){return '';});
  if(charResultOld)ctx.charStates=charResultOld;
}

var chOutlineHint='';
if(curRd.chOutlines&&curRd.chOutlines[nextChNum-1]){
chOutlineHint=curRd.chOutlines[nextChNum-1];
}
if(!chOutlineHint){
var colBook=cols.books.find(function(b){return b.id===curRd.id;});
if(colBook&&colBook.chOutlines&&colBook.chOutlines[nextChNum-1]){
chOutlineHint=colBook.chOutlines[nextChNum-1];
}
}
if(!chOutlineHint){
var crWork=crWorks.find(function(w){return w.id===curRd.id;});
if(crWork&&crWork.chOutlines&&crWork.chOutlines[nextChNum-1]){
chOutlineHint=crWork.chOutlines[nextChNum-1];
}
}
if(chOutlineHint)ctx.chOutline=chOutlineHint;

var fsList=getForeshadows(curRd.id);
var pendingFs=fsList.filter(function(f){return f.status!=='done';});
if(pendingFs.length>0){
ctx.foreshadows=pendingFs.map(function(f){
return '- '+f.content+(f.chapter?' ('+f.chapter+')':'');
}).join('\n');
}

articleContexts[curRd.id]=ctx;
sv('bj_articleContexts',articleContexts);

localStorage.setItem('bj_ctxUsed_'+curRd.id,'1');

showToast('分析完成，开始续写！',2000);
await new Promise(function(r){setTimeout(r,500);});

btn.disabled=false;
btn.innerHTML='<i class="fas fa-brain"></i> 智能续写';
continueChapterWithContext();

}catch(e){
btn.disabled=false;
btn.innerHTML='<i class="fas fa-brain"></i> 智能续写';
var errMsg=(e&&e.message)?e.message:'未知错误';
showToast('分析失败：'+errMsg+'，切换为快速续写',3000);
continueChapterWithContext();
}
}

async function smartGenSummary(){
if(!curRd||!curRd.chapters||curRd.chapters.length<1)return'';
var allText='';
curRd.chapters.forEach(function(ch,i){
allText+='【第'+(i+1)+'章】\n'+(ch||'').substring(0,600)+'\n\n';
});
if(allText.length<50)return'';
var sysMsg='你是一位专业的小说编辑。请将以下章节内容提炼为一份前情提要，供续写时参考。\n\n【必须包含】\n· 关键情节（按时间顺序，只写重要节点）\n· 人物关系变化（谁和谁之间发生了什么变化）\n· 重要转折点（改变剧情走向的事件）\n· 当前局面（故事到达了什么状态，遗留了什么未解决）\n\n【格式要求】\n- 总字数150-300字\n- 每个要点一行，用"·"开头\n- 只写事实，不加分析和评价\n\n【输出铁律】\n- 直接输出内容，第一个字就是正文\n- 禁止输出思维过程和分析步骤\n- 禁止以"好的/根据/以下是"开头';
var userMsg='请生成前情提要：\n\n'+allText.substring(0,5000);
var result=await callAPINonStream([{role:'system',content:sysMsg},{role:'user',content:userMsg}]);
return result||'';
}

async function smartGenCharStates(){
if(!curRd||!curRd.chapters||curRd.chapters.length<1)return'';
var lastCh=curRd.chapters[curRd.chapters.length-1]||'';
if(lastCh.length<50)return'';
var validChars=characters.filter(function(c){return c.name;});
var charInfo='';
if(validChars.length>0){
charInfo='【已设定的角色】'+validChars.map(function(c){return c.name;}).join('、')+'\n\n';
}
var sysMsg='你是一位小说分析师。根据提供的章节内容，分析其中出现的主要角色的当前状态。\n\n【输出格式】\n角色名：当前位置/处境 | 情绪状态 | 与其他角色的关系变化\n\n【要求】\n- 只分析在本章有实质出现或被提及状态变化的角色，不凭空推测\n- 情绪状态用具体行为或细节体现，不要直说"悲伤/开心/愤怒"\n- 每个角色1-2句话，不超过50字\n- 如果信息不足以判断某项，写"未见描写"而非猜测\n\n【输出铁律】\n- 直接输出分析内容，第一行就是第一个角色\n- 禁止输出分析过程和推理步骤\n- 禁止以"好的/以下是/根据"开头';
var userMsg=charInfo+'【最新章节】\n'+lastCh.substring(0,2500)+'\n\n请分析各角色状态：';
var result=await callAPINonStream([{role:'system',content:sysMsg},{role:'user',content:userMsg}]);
return result||'';
}
// 使用上下文设置续写
async function continueChapterWithContext(){
if(isGen){showToast('正在生成中');return;}
if(!curRd||curRd.type!=='long')return;
// 批量续写防串书：如果当前文章已不是批量启动时的文章，终止批量
if(_batchContRemain>0&&_batchArticleId&&curRd.id!==_batchArticleId){
  _batchContRemain=0;_batchArticleId='';
  showToast('检测到文章已切换，批量续写已自动停止');
  return;
}
const ctx=articleContexts[curRd.id]||{};
// 续写前自动保存上一章快照
(function(){
  try{
    var _snIdx = curRd.chapters ? curRd.chapters.length - 1 : -1;
    if(_snIdx >= 0 && curRd.id){
      saveChapterSnapshot(curRd.id, _snIdx, '续写前·第'+(_snIdx+1)+'章');
    }
  }catch(e){}
})();
setIsGen(true);
const btn=document.getElementById('btnCont');
btn.disabled=true;
btn.innerHTML='正在创作 <span class="ldots"><span></span><span></span><span></span></span>';
var smartBtn3=document.getElementById('btnSmartCont');
if(smartBtn3){smartBtn3.disabled=true;smartBtn3.innerHTML='生成中...';}
// 安全网：5分钟后强制恢复按钮状态
var _contSafetyTimer=setTimeout(function(){
  if(isGen){
    setIsGen(false);
    var _b1=document.getElementById('btnCont');
    var _b2=document.getElementById('btnSmartCont');
    if(_b1){_b1.disabled=false;_b1.innerHTML='<i class="fas fa-pen-nib"></i> 续写下一章';}
    if(_b2){_b2.disabled=false;_b2.innerHTML='<i class="fas fa-brain"></i> 智能续写';}
    showToast('生成超时，请重试',3000);
  }
},300000);
const chNum=curRd.chapters.length+1;
// 构建上下文
var _isBatch=(_rdContChCount>1);
var _batchEnd=chNum+_batchContRemain;
let userMsg=_isBatch
  ?'【多章续写任务说明】你现在正在连续生成第'+chNum+'章至第'+_batchEnd+'章的小说内容，请严格按照设定的大纲和写作方向进行创作，确保每章情节连贯，不要擅自改变剧情走向。\n\n【续写任务】创作《'+curRd.title+'》第'+chNum+'章\n\n'
  :'【续写任务】创作《'+curRd.title+'》第'+chNum+'章\n\n';
// 0.5 书籍全局设定
if(ctx.storySynopsis){userMsg+='【故事梗概】\n'+ctx.storySynopsis+'\n\n';}
if(ctx.coreTheme){userMsg+='【核心理念/主题】\n'+ctx.coreTheme+'\n\n';}
// 1. 前情提要（手动编辑优先）
if(ctx.prevSummary){
userMsg+='【前情提要】\n'+ctx.prevSummary+'\n\n';
}else{
// 自动生成简要回顾
const totalCh=curRd.chapters.length;
if(totalCh>=2){
userMsg+='【前情回顾】\n';
const firstCh=curRd.chapters[0]||'';
userMsg+='故事开篇：'+firstCh.substring(0,150).replace(/\n/g,' ')+'...\n';
if(totalCh>=4){
const midCh=Math.floor(totalCh/2);
const midText=curRd.chapters[midCh]||'';
userMsg+='中段发展：'+midText.substring(0,100).replace(/\n/g,' ')+'...\n';
}
userMsg+='\n';
}
}
// 2. 第一章开头（保持基调）
if(ctx.sendFirstCh!==false&&curRd.chapters.length>1){
const firstCh=curRd.chapters[0]||'';
const firstOpening=firstCh.substring(0,500);
userMsg+='【第一章开头（基调参考）】\n'+firstOpening+'\n\n';
}
// 3. 上一章结尾
const lastChLen=ctx.lastChLen||1500;
const lastCh=curRd.chapters[curRd.chapters.length-1]||'';
const lastChEnding=lastCh.substring(Math.max(0,lastCh.length-lastChLen));
userMsg+='【上一章结尾】\n'+lastChEnding+'\n\n';
// 4. 重要伏笔（自动注入 + 手动注入，不修改 ctx 本身）
var _fsToInject=ctx.foreshadows||'';
if(!_fsToInject.trim()){
  var _autoFs=getForeshadows(curRd.id).filter(function(f){return f.status!=='done';});
  if(_autoFs.length>0){
    var _autoFsShow=_autoFs.length>8?_autoFs.slice(-8):_autoFs;
    _fsToInject=_autoFsShow.map(function(f){return '- '+f.content+(f.chapter?' (埋伏于 '+f.chapter+')':'');}).join('\n');
    if(_autoFs.length>8)_fsToInject+='\n（共'+_autoFs.length+'条，显示最近8条）';
  }
}
if(_fsToInject){
userMsg+='【重要伏笔/悬念（请记住并适时回收）】\n'+_fsToInject+'\n\n';
}
// 5. 人物当前状态
if(ctx.charStatesV2){
  userMsg+='【角色状态快照（本章续写必须严格遵守）】\n';
  userMsg+='格式说明：角色名 | 当前位置 | 情绪状态 | 已知信息 | 与主角关系 | 持有物品\n';
  var _v2Snap=ctx.charStatesV2.length>800?ctx.charStatesV2.substring(0,800)+'\n（状态快照过长，已截断）':ctx.charStatesV2;
  userMsg+=_v2Snap+'\n';
  userMsg+='⚠️ 以上状态快照是最新的事实，续写时所有角色行为必须与之一致。\n\n';
}
if(ctx.charStates){
userMsg+='【人物当前状态】\n'+ctx.charStates+'\n\n';
}
// 5.5 已确立事实
if(ctx.estFacts){
  userMsg+='【已确立事实——绝对禁止违反（违反即视为废稿）】\n';
  userMsg+=ctx.estFacts+'\n';
  userMsg+='⚠️ 以上事实是不可撤销的剧情基础，续写内容不得与之矛盾。\n\n';
}
// 6. 写作方向
if(ctx.direction){
userMsg+='【写作方向】\n'+ctx.direction+'\n\n';
}
// 6.5 书目素材模块（挂载于本书的素材，自动作为参考注入，无需手动引用）
var _bmmText=_buildBookMatModuleText(curRd.id,300,1200);
if(_bmmText){
userMsg+='【素材库参考（请自然融入本章内容，不要生硬照抄）】\n'+_bmmText+'\n\n';
}
// 7. 章节大纲注入
var _bookOutlines=ctx.bookChOutlines||[];
if(ctx.sendAllOutlines&&_bookOutlines.length>0){
  var _allOutStr='';
  _bookOutlines.forEach(function(o,i){if(o)_allOutStr+='第'+(i+1)+'章：'+o+'\n';});
  if(_allOutStr)userMsg+='【全书章节大纲（请严格按此创作）】\n'+_allOutStr+'\n';
}else{
  var _curOut=(_bookOutlines[chNum-1])||'';
  if(_curOut)userMsg+='【第'+chNum+'章大纲（必须严格遵守）】\n'+_curOut+'\n\n';
}
// 7.5 所在分卷（卷名+剧情梗概）：即将续写的这一章如果被标记归属某个分卷，就把卷名+本卷梗概也一起注入，
// 帮助AI知道当前处于故事的哪个阶段/子情节。这里读的是 ctx.bookChVolume（续写上下文页里"新章节预分卷"/
// 单条大纲分卷选择器存的那份分卷标记），因为要续写的这一章此时还不存在，不会出现在 curRd.chVolume 里。
var _bookChVolume=ctx.bookChVolume||[];
var _curChVolId=_bookChVolume[chNum-1]||'';
if(_curChVolId&&curRd.volumes){
  var _curVol=curRd.volumes.find(function(v){return v.id===_curChVolId;});
  if(_curVol){
    userMsg+='【所在分卷：'+(_curVol.name||'未命名分卷')+'】\n';
    if(_curVol.summary)userMsg+='本卷梗概：'+_curVol.summary+'\n';
    userMsg+='\n';
  }
}
// 8. 特殊要求
if(ctx.specialReq){
userMsg+='【特殊要求】\n'+ctx.specialReq+'\n\n';
}
// 9. 创作指南
// 动态角色锁：把核心角色名+关键特质注入续写上下文
const coreCharLock=characters.filter(c=>c.name&&c.priority==='核心');
const allCharLock=characters.filter(c=>c.name&&c.priority!=='核心'&&c.priority!=='参考');
if(coreCharLock.length>0||allCharLock.length>0){
  userMsg+='【角色防OOC锁定（绝对不能违反）】\n';
  coreCharLock.forEach(c=>{
    userMsg+='⚠️ '+c.name;
    if(c.traits&&c.traits.length>0)userMsg+='（'+c.traits.slice(0,3).join('·')+'）';
    userMsg+='：以上特质在本章中必须保持，不得突然改变性格或说话方式\n';
  });
  allCharLock.forEach(c=>{
    userMsg+='• '+c.name;
    if(c.traits&&c.traits.length>0)userMsg+='（'+c.traits.slice(0,3).join('·')+'）：保持前后一致\n';
    else userMsg+='：保持前后一致\n';
  });
  userMsg+='\n';
}
const mW4=parseInt(document.getElementById('minWords').value)||800;
userMsg+='【本章创作指南（铁律，全部必须遵守）】\n';
userMsg+='1. 开头直接承接上文，用动作或对话切入，严禁"上回说到""话说""且说""在上一章中"\n';
userMsg+='2. 本章至少一次意外事件或人物关系微妙变化，不许平铺直叙\n';
userMsg+='3. 每个角色说话有自己的腔调，不能千人一面\n';
userMsg+='4. 如果有大纲，严格按大纲写；如果没有，合理推进\n';
userMsg+='5. 结尾用细节或悬念收尾，不要用感悟式升华句\n';
userMsg+='6. 直接输出正文，不要标题、不要章节号、不要"第X章"字样\n';
userMsg+='7. 不要在正文前后写任何说明、分析、思考过程\n';
userMsg+='8. 不要使用markdown格式（不要```、不要#、不要**加粗**）\n';
userMsg+='9. 【字数硬性要求】本章正文必须不少于'+mW4+'字！低于此字数不合格，宁多勿少，建议写到'+(mW4+500)+'字以上\n';
const messages=[{role:'system',content:buildSysPrompt()},{role:'user',content:userMsg}];
// 新增：把本次续写记录到“生成日志”
try{
  const apiCfg=getCurApi();
  addGenLog({
    kind:'workshop',
    type:'continue',
    title:(curRd && curRd.title ? (curRd.title+' · 续写第'+chNum+'章') : '续写'),
    articleId:(curRd && curRd.id) || '',
    api:apiCfg,
    messages:messages
  });
}catch(e){logError('op',e)}
// 记录后台任务信息（用于断点续写）
if(_bgTaskInfo){
  _bgTaskInfo.articleId = curRd ? curRd.id : '';
  _bgTaskInfo.title = curRd ? curRd.title : '';
  _bgTaskInfo.chNum = curRd && curRd.chapters ? curRd.chapters.length + 1 : 1;
  _bgTaskInfo.requestParams = {messages:messages, sysPrompt:'(已构建)'};
}
const rdContent=document.getElementById('rdContent');
if(!useStream){
const result=await callAPINonStream(messages);
setIsGen(false);btn.disabled=false;btn.textContent='继续连载下一章';
clearTimeout(_contSafetyTimer);
var smartBtn2=document.getElementById('btnSmartCont');if(smartBtn2){smartBtn2.disabled=false;smartBtn2.innerHTML='<i class="fas fa-brain"></i> 智能续写';}
if(!result)return;
curRd.chapters.push(result);
syncArticle(curRd);
curCh=curRd.chapters.length-1;
renderChContent();
document.getElementById('rdMeta').innerHTML =
  '<span><i class="fas fa-book"></i> 长篇连载</span>' +
  '<span><i class="fas fa-clock"></i> ' + new Date(curRd.createdAt).toLocaleDateString() + '</span>' +
  '<span>共 ' + curRd.chapters.length + ' 章</span>' +
  '<span>' + getTotalWords(curRd) + ' 字</span>' +
  '<span onclick="showChapterWordStats()" style="cursor:pointer;color:var(--accent2)"><i class="fas fa-chart-bar"></i> 字数统计</span>';
document.getElementById('btnUndo').style.display='inline-block';
try{if(genVibrate&&navigator.vibrate)navigator.vibrate([50,30,50]);}catch(e){}
showToast('第'+chNum+'章写好啦！星笺期待你的评价');
try{if(ld('bj_contQualityOn',true))renderContQualityCard(result,document.getElementById('rdContent').parentElement);}catch(e){logError('op',e)}
if(ld('bj_consistencyCheckOn',false)&&result&&result.length>=50&&!(_batchContRemain>0)){(function(){var _ccCont=document.getElementById('rdContent')&&document.getElementById('rdContent').parentElement;if(_ccCont){setTimeout(function(){showToast('正在进行一致性检测...',3000);doConsistencyCheck(result,curRd.id).then(function(r){if(r)renderConsistencyCard(r,_ccCont);}).catch(function(){});},800);}})();}
if(_batchContRemain>0&&_batchArticleId&&curRd&&curRd.id===_batchArticleId){
  var _batchNb1=_batchContRemain--;
  showToast('第'+chNum+'章完成！正在续写第'+(chNum+1)+'章（还剩'+(_batchNb1-1)+'章）...',2000);
  setTimeout(continueChapterWithContext,500);
}else{
  _batchArticleId='';// 批量结束，清除锁定
}
return;
}
const _contMinW=parseInt(document.getElementById('minWords').value)||800;
const _contDynTok=Math.max(getCurApi().maxTokens||4096,Math.ceil(_contMinW*2)+1000);
await callAPIStream(messages,
(fullText)=>{
  // 续写中显示流式进度（不破坏翻页器，只在底部显示字数）
  var wc=countWords(fullText);
  try{
    var numEl=document.getElementById('rdReaderPageNum');
    if(numEl)numEl.textContent='生成中 '+wc+'字...';
  }catch(e){}
},
(fullText)=>{
setIsGen(false);btn.disabled=false;btn.textContent='继续连载下一章';
clearTimeout(_contSafetyTimer);
var smartBtn2=document.getElementById('btnSmartCont');if(smartBtn2){smartBtn2.disabled=false;smartBtn2.innerHTML='<i class="fas fa-brain"></i> 智能续写';}
if(!fullText){
  // 断点续写：检查是否有部分生成的内容
  var partialEl=document.getElementById('rdContent');
  var partialText=partialEl?partialEl.textContent.trim():'';
  if(partialText&&partialText.length>50&&curRd){
    saveStreamBreakpoint(
      curRd.id,
      partialText,
      curRd.chapters?curRd.chapters.length+1:1,
      null
    );
    showToast('已保存生成断点（'+countWords(partialText)+'字），下次续写可继续',4000);
  }
  return;
}
// 续写成功，清除断点
clearStreamBreakpoint();
// 续写字数不足自动补写
let finalText=fullText;
const mWCh=parseInt(document.getElementById('minWords').value)||800;
const chWc=countWords(fullText);
if(contAutoExtend&&chWc<mWCh&&chWc>200){
showToast('本章'+chWc+'字，未达到'+mWCh+'字要求，正在自动补写...',4000);
const extMsg2=[
{role:'system',content:buildSysPrompt()},
{role:'user',content:'以下是一个章节的内容，只有'+chWc+'字，需要至少'+mWCh+'字。请直接续写下去，不要重复已有内容，不要加标题说明，直接输出续写部分：\n\n'+fullText}
];
var _snapRd=curRd;
callAPINonStream(extMsg2).then(function(extR2){
if(!_snapRd)return;
if(extR2)finalText=fullText+'\n\n'+extR2;
_snapRd.chapters.push(finalText);
syncArticle(_snapRd);
curCh=_snapRd.chapters.length-1;
renderChContent();
document.getElementById('rdMeta').innerHTML=
'<span><i class="fas fa-book"></i> 长篇连载</span><span><i class="fas fa-clock"></i> '+new Date(_snapRd.createdAt).toLocaleDateString()+'</span>'+
'<span>共 '+_snapRd.chapters.length+' 章</span><span>'+getTotalWords(_snapRd)+' 字</span>';
document.getElementById('btnUndo').style.display='inline-block';
if(contDirMemory&&_snapRd&&_snapRd.id){localStorage.setItem('bj_lastDir_'+_snapRd.id,document.getElementById('dirInput').value);}
document.getElementById('dirInput').value='';
showToast('第'+chNum+'章创作完成！'+countWords(finalText)+'字');
try{if(ld('bj_contQualityOn',true))renderContQualityCard(finalText,document.getElementById('rdContent').parentElement);}catch(e){logError('op',e)}
if(ld('bj_consistencyCheckOn',false)&&finalText&&finalText.length>=50&&!(_batchContRemain>0)){(function(){var _ccCont=document.getElementById('rdContent')&&document.getElementById('rdContent').parentElement;var _snapId=_snapRd?_snapRd.id:'';if(_ccCont&&_snapId){setTimeout(function(){showToast('正在进行一致性检测...',3000);doConsistencyCheck(finalText,_snapId).then(function(r){if(r)renderConsistencyCard(r,_ccCont);}).catch(function(){});},800);}})();}
if(_batchContRemain>0&&_batchArticleId&&curRd&&curRd.id===_batchArticleId){
  var _batchNb2=_batchContRemain--;
  showToast('第'+chNum+'章完成！正在续写第'+(chNum+1)+'章（还剩'+(_batchNb2-1)+'章）...',2000);
  setTimeout(continueChapterWithContext,500);
}else{
  _batchArticleId='';
}
});
}else{
curRd.chapters.push(finalText);
syncArticle(curRd);
if(contAutoScroll){
curCh=curRd.chapters.length-1;
renderChContent();
}else{
showToast('新章节已生成，点击目录可查看',3000);
}
document.getElementById('rdMeta').innerHTML=
'<span><i class="fas fa-book"></i> 长篇连载</span><span><i class="fas fa-clock"></i> '+new Date(curRd.createdAt).toLocaleDateString()+'</span>'+
'<span>共 '+curRd.chapters.length+' 章</span><span>'+getTotalWords(curRd)+' 字</span>';
document.getElementById('btnUndo').style.display='inline-block';
if(contDirMemory&&curRd&&curRd.id){localStorage.setItem('bj_lastDir_'+curRd.id,document.getElementById('dirInput').value);}
document.getElementById('dirInput').value='';
showToast('第'+chNum+'章创作完成！'+countWords(finalText)+'字');
try{if(ld('bj_contQualityOn',true))renderContQualityCard(finalText,document.getElementById('rdContent').parentElement);}catch(e){logError('op',e)}
if(ld('bj_consistencyCheckOn',false)&&finalText&&finalText.length>=50&&!(_batchContRemain>0)){(function(){var _ccCont=document.getElementById('rdContent')&&document.getElementById('rdContent').parentElement;var _snapId2=curRd?curRd.id:'';if(_ccCont&&_snapId2){setTimeout(function(){showToast('正在进行一致性检测...',3000);doConsistencyCheck(finalText,_snapId2).then(function(r){if(r)renderConsistencyCard(r,_ccCont);}).catch(function(){});},800);}})();}
if(_batchContRemain>0&&_batchArticleId&&curRd&&curRd.id===_batchArticleId){
  var _batchNb3=_batchContRemain--;
  showToast('第'+chNum+'章完成！正在续写第'+(chNum+1)+'章（还剩'+(_batchNb3-1)+'章）...',2000);
  setTimeout(continueChapterWithContext,500);
}else{
  _batchArticleId='';
}
}
},
(errMsg)=>{
setIsGen(false);btn.disabled=false;btn.textContent='继续连载下一章';
clearTimeout(_contSafetyTimer);
var smartBtnErr=document.getElementById('btnSmartCont');if(smartBtnErr){smartBtnErr.disabled=false;smartBtnErr.innerHTML='<i class="fas fa-brain"></i> 智能续写';}
_batchContRemain=0;_batchArticleId='';// 出错终止批量
showToast(errMsg,3000);
}
);
}
// ==================== 伏笔追踪器 ====================
function getForeshadows(articleId){
if(!articleId)return[];
return ld('bj_foreshadow_'+articleId,[]);
}

function saveForeshadows(articleId,list){
sv('bj_foreshadow_'+articleId,list);
}

function openForeshadow(){
if(!curRd){showToast('请先打开一篇文章');return;}
renderForeshadowList();
document.getElementById('foreshadowOv').classList.add('show');
navPush('foreshadowOv');
}

function closeForeshadow(){
  navPop('foreshadowOv');
document.getElementById('foreshadowOv').classList.remove('show');
}

function renderForeshadowList(){
if(!curRd)return;
const list=getForeshadows(curRd.id);
const container=document.getElementById('foreshadowList');

let pending=0,done=0;
list.forEach(f=>{if(f.status==='done')done++;else pending++;});
document.getElementById('fsCountPending').textContent=pending;
document.getElementById('fsCountDone').textContent=done;

if(list.length===0){
container.innerHTML='<div style="text-align:center;padding:30px;color:var(--text2);font-size:12px">还没有记录伏笔<br><br>点击「添加伏笔」手动记录<br>或点击「AI识别」自动分析</div>';
return;
}

container.innerHTML='';
list.forEach((f,i)=>{
const item=document.createElement('div');
item.className='fs-item '+(f.status||'pending');
const statusIcon=f.status==='done'?'<i class="fas fa-circle-check"></i>':'<i class="fas fa-thumbtack"></i>';
const statusText=f.status==='done'?'已回收':'待回收';
item.innerHTML=
'<div class="fs-item-hdr">'+
'<span style="font-size:11px;font-weight:600;color:'+(f.status==='done'?'var(--success)':'#f0a030')+'">'+statusIcon+' '+statusText+'</span>'+
'<span style="font-size:10px;color:var(--text2)">#'+(i+1)+'</span>'+
'</div>'+
'<div class="fs-item-content">'+esc(f.content)+'</div>'+
'<div class="fs-item-meta">'+
'<span><i class="fas fa-map-pin"></i> 埋设：'+(f.chapter||'未知')+'</span>'+
(f.planChapter?'<span><i class="fas fa-bullseye"></i> 计划：'+f.planChapter+'</span>':'')+
(f.doneChapter?'<span><i class="fas fa-check-circle"></i> 回收：'+f.doneChapter+'</span>':'')+
'</div>'+
'<div class="fs-item-acts">'+
(f.status!=='done'?'<button class="done-btn" onclick="markFsDone('+i+')"><i class="fas fa-check-circle"></i> 标记已回收</button>':
'<button onclick="markFsUndo('+i+')"><i class="fas fa-rotate-left"></i> 撤销回收</button>')+
'<button onclick="editFs('+i+')"><i class="fas fa-pencil"></i> 编辑</button>'+
'<button class="del-btn" onclick="deleteFs('+i+')"><i class="fas fa-trash-alt"></i></button>'+
'</div>';
container.appendChild(item);
});
}

let editingFsIdx=-1;

function addForeshadow(){
editingFsIdx=-1;
document.getElementById('addFsTitle').textContent='添加伏笔';
document.getElementById('fsContent').value='';
document.getElementById('fsChapter').value=curRd&&curRd.type==='long'?'第'+(curCh+1)+'章':'';
document.getElementById('fsPlanChapter').value='';
document.getElementById('addFsBtn').textContent='保存';
document.getElementById('addFsOv').classList.add('show');
navPush('addFsOv');
setTimeout(()=>document.getElementById('fsContent').focus(),200);
}

function editFs(idx){
if(!curRd)return;
const list=getForeshadows(curRd.id);
if(idx<0||idx>=list.length)return;
const f=list[idx];
editingFsIdx=idx;
document.getElementById('addFsTitle').textContent='编辑伏笔';
document.getElementById('fsContent').value=f.content||'';
document.getElementById('fsChapter').value=f.chapter||'';
document.getElementById('fsPlanChapter').value=f.planChapter||'';
document.getElementById('addFsBtn').textContent='更新';
document.getElementById('addFsOv').classList.add('show');
navPush('addFsOv');
}

function closeAddFs(){
  navPop('addFsOv');
document.getElementById('addFsOv').classList.remove('show');
editingFsIdx=-1;
}

function saveFs(){
if(!curRd)return;
const content=(document.getElementById('fsContent').value||'').trim();
if(!content){showToast('请填写伏笔内容');return;}
const chapter=(document.getElementById('fsChapter').value||'').trim();
const planChapter=(document.getElementById('fsPlanChapter').value||'').trim();

const list=getForeshadows(curRd.id);
if(editingFsIdx>=0&&editingFsIdx<list.length){
list[editingFsIdx].content=content;
list[editingFsIdx].chapter=chapter;
list[editingFsIdx].planChapter=planChapter;
showToast('伏笔已更新');
}else{
list.push({
content:content,
chapter:chapter,
planChapter:planChapter,
status:'pending',
createdAt:new Date().toISOString()
});
showToast('伏笔已添加');
}
saveForeshadows(curRd.id,list);
closeAddFs();
renderForeshadowList();
}

function markFsDone(idx){
if(!curRd)return;
const list=getForeshadows(curRd.id);
if(idx<0||idx>=list.length)return;
list[idx].status='done';
list[idx].doneChapter=curRd.type==='long'?'第'+(curCh+1)+'章':'已回收';
saveForeshadows(curRd.id,list);
renderForeshadowList();
showToast('伏笔已标记为回收');
}

function markFsUndo(idx){
if(!curRd)return;
const list=getForeshadows(curRd.id);
if(idx<0||idx>=list.length)return;
list[idx].status='pending';
list[idx].doneChapter='';
saveForeshadows(curRd.id,list);
renderForeshadowList();
showToast('已撤销回收状态');
}

function deleteFs(idx){
if(!curRd)return;
showDlg('删除伏笔','确定要删除这条伏笔记录吗？',()=>{
const list=getForeshadows(curRd.id);
list.splice(idx,1);
saveForeshadows(curRd.id,list);
renderForeshadowList();
showToast('伏笔已删除');
},true);
}

async function aiDetectForeshadow(){
if(!curRd){showToast('请先打开一篇文章');return;}
const cfg=getCurApi();
if(!cfg.url||!cfg.key){showToast('请先在设置中配置API');return;}

let text='';
if(curRd.type==='long'&&curRd.chapters){
curRd.chapters.forEach((ch,i)=>{
text+='【第'+(i+1)+'章】\n'+ch+'\n\n';
});
}else{
text=curRd.content||'';
}

if(countWords(text)<100){showToast('文章内容太少，无法分析');return;}

const btn=document.getElementById('aiDetectBtn');
btn.disabled=true;
btn.innerHTML='分析中 <span class="ldots"><span></span><span></span><span></span></span>';

let sysMsg='你读过的稿子里，有的伏笔藏在对话里一个字，有的藏在场景描写的细节里，有的藏在角色做了但没说的事里。你的工作就是把这些线索挖出来，归档，标清楚哪些已经收、哪些还悬在那里。\n\n';
sysMsg+='【输出格式】每条伏笔单独一行，严格按以下格式：\n';
sysMsg+='第X章|伏笔内容简述（20字以内）|是否已回收（是/否）\n\n';
sysMsg+='【判断标准】\n';
sysMsg+='- 真正的伏笔：埋下时读者察觉不到，但回头看会恍然大悟\n';
sysMsg+='- 不算伏笔：普通情节推进、常规人物行为、显而易见的铺垫\n';
sysMsg+='- 最多列出10条最重要的，宁缺毋滥\n';
sysMsg+='- 后文有明确回收或解释的，标"是"；仍悬而未决的，标"否"\n';
sysMsg+='- 只输出伏笔列表，不写分析过程或说明文字\n';

const userMsg='请分析以下文章中的伏笔：\n\n'+text.substring(0,8000);
const messages=[{role:'system',content:sysMsg},{role:'user',content:userMsg}];

let result;
try{
  result=await callToolAPINonStream(messages);
}catch(e){
  btn.disabled=false;
  btn.textContent='AI识别';
  showToast('分析失败：'+(e.message||'网络异常'),3000);
  return;
}
btn.disabled=false;
btn.textContent='AI识别';

if(!result){showToast('分析失败，请重试');return;}

const lines=result.split('\n').filter(l=>l.includes('|'));
if(lines.length===0){
showToast('未识别到明显的伏笔');
return;
}

const list=getForeshadows(curRd.id);
let addCount=0;

lines.forEach(line=>{
const parts=line.split('|');
if(parts.length>=2){
const chapter=parts[0].trim();
const content=parts[1].trim();
const isDone=parts[2]&&parts[2].includes('是');
if(content&&!list.some(f=>f.content.includes(content.substring(0,10)))){
list.push({
content:content,
chapter:chapter,
planChapter:'',
status:isDone?'done':'pending',
doneChapter:isDone?'AI识别为已回收':'',
createdAt:new Date().toISOString(),
aiDetected:true
});
addCount++;
}
}
});

saveForeshadows(curRd.id,list);
renderForeshadowList();
showToast('AI识别完成，新增'+addCount+'条伏笔');
}
// ==================== 续写质量反馈 ====================
function contQualityCheck(text){
  if(!text||text.length<50)return null;
  var issues=[];
  var score=90;
  // 检测万能副词
  var vaguePhrases=['突然','忽然','猛然','缓缓','默默','静静','慢慢','渐渐','轻轻'];
  var vagueCount=0;
  vaguePhrases.forEach(function(w){
    var reg=new RegExp(w,'g');
    var m=text.match(reg);
    if(m)vagueCount+=m.length;
  });
  if(vagueCount>5){
    issues.push('万能副词过多('+vagueCount+'处)');
    score-=Math.min(20,vagueCount*2);
  }
  // 检测禁用词
  var curBan=(banWords||'').trim();
  var globalBan=(globalBanWords||'').trim();
  var allBan=(curBan+'\n'+globalBan).split('\n').map(function(s){return s.trim();}).filter(function(s){return s;});
  var banFound=[];
  allBan.forEach(function(w){
    if(text.includes(w))banFound.push(w);
  });
  if(banFound.length>0){
    issues.push('含禁用词：'+banFound.slice(0,5).join('、'));
    score-=banFound.length*5;
  }
  // 检测重复句式开头
  var lines=text.split('\n').filter(function(l){return l.trim().length>4;});
  if(lines.length>6){
    var starts={};
    lines.forEach(function(l){
      var s=l.trim().substring(0,2);
      starts[s]=(starts[s]||0)+1;
    });
    for(var k in starts){
      if(starts[k]>=4){
        issues.push('句首"'+k+'"重复'+starts[k]+'次');
        score-=5;
        break;
      }
    }
  }
  // 检测对话比例
  var dialogCount=(text.match(/[""「」『』]/g)||[]).length;
  var ratio=dialogCount/text.length;
  if(ratio>0.15){
    issues.push('对话占比偏高');
    score-=5;
  }else if(ratio<0.01&&text.length>500){
    issues.push('缺少对话，建议增加人物互动');
    score-=3;
  }
  // 检测段落长度
  var paras=text.split('\n').filter(function(p){return p.trim().length>0;});
  var longParas=paras.filter(function(p){return p.length>300;});
  if(longParas.length>2){
    issues.push(longParas.length+'个超长段落(>300字)');
    score-=5;
  }
  score=Math.max(10,Math.min(100,score));
  return{score:score,issues:issues};
}

function renderContQualityCard(text,container){
  if(!container)return;
  var result=contQualityCheck(text);
  if(!result)return;
  // 移除旧卡片
  var old=container.querySelector('.cont-quality-card');
  if(old)old.remove();
  var card=document.createElement('div');
  card.className='cont-quality-card';
  var scoreClass=result.score>=80?'good':(result.score>=60?'mid':'bad');
  var scoreEmoji=result.score>=80?'<i class="fas fa-circle-check"></i>':(result.score>=60?'<i class="fas fa-triangle-exclamation"></i>':'<i class="fas fa-circle-xmark"></i>');
  var issuesHtml='';
  if(result.issues.length>0){
    issuesHtml='<div class="cq-issues">';
    result.issues.forEach(function(iss){
      issuesHtml+='<span>'+esc(iss)+'</span>';
    });
    issuesHtml+='</div>';
  }else{
    issuesHtml='<div class="cq-issues" style="color:var(--success)">未发现明显问题，写得不错！</div>';
  }
  card.innerHTML=
    '<div class="cq-hdr">'+
    '<div><div class="cq-score '+scoreClass+'">'+scoreEmoji+' '+result.score+'分</div>'+
    '<div class="cq-label">续写质量检测</div></div>'+
    '<div style="font-size:10px;color:var(--text2)">'+countWords(text)+'字</div></div>'+
    issuesHtml+
    '<div class="cq-acts">'+
'<button class="primary" onclick="aiPolishCurrentChapter()"><i class="fas fa-wand-magic-sparkles"></i> AI润色本章</button>'+
'<button onclick="this.closest(\'.cont-quality-card\').remove()">关闭</button>'+
'<button onclick="sv(\'bj_contQualityOn\',false);this.closest(\'.cont-quality-card\').remove();showToast(\'已关闭续写质量反馈，可在设置中重新开启\')" style="color:var(--text2);border-color:var(--border)">不再显示</button></div>';
  container.appendChild(card);
}

async function aiPolishCurrentChapter(){
  if(!curRd||!curRd.chapters||curRd.chapters.length<1){showToast('没有可润色的章节');return;}
  var cfg=getCurApi();
  if(!cfg.url||!cfg.key){showToast('请先配置API');return;}
  var chText=curRd.chapters[curCh]||'';
  if(chText.length<50){showToast('章节内容太短');return;}
  showToast('正在润色中...',3000);
  var sysMsg='你是一位极度克制的文字外科医生，只做最小创伤手术。\n\n【铁律——违反即失职】\n❌ 情节走向：绝对不改\n❌ 对话内容：一个字都不改（只能改对话标签，不能改角色说的话）\n❌ 人物性格：不能改变任何角色的说话方式和行为逻辑\n❌ 篇幅：总字数变化不超过±10%\n\n【可以处理的地方】\n① 删除万能副词（不禁/缓缓/淡淡/微微/默默/静静/轻轻/渐渐）——直接删，不替换\n② 对话标签"他/她说"→换成具体动作，只改标签词，不改对话本身\n③ 连续3句相同主语开头——改掉中间那句的句式\n④ 空洞形容词→改成具体身体反应或感官细节\n⑤ 明显病句或错别字顺手修正\n\n【输出要求】\n- 直接输出润色后的完整正文\n- 不加任何说明，不注释改了哪里\n- 第一个字就是正文内容\n- 禁止输出思维过程';
  var userMsg='请润色以下章节：\n\n'+chText.substring(0,6000);
  var result=await callAPINonStream([{role:'system',content:sysMsg},{role:'user',content:userMsg}]);
  if(!result){showToast('润色失败，请重试');return;}
  showDlg('确认替换','AI润色完成（'+countWords(result)+'字）。\n\n是否用润色后的内容替换当前第'+(curCh+1)+'章？\n\n替换前建议先在「版本管理」中保存当前版本。',function(){
    curRd.chapters[curCh]=result;
    syncArticle(curRd);
    renderChContent();
    showToast('第'+(curCh+1)+'章已润色替换');
  },true);
}
function useBranch(text){
closeBranchGen();
document.getElementById('searchInput').value=text;
const wsBtn=document.querySelector('.bnav-i');
switchPage('workshop',wsBtn);
showToast('已填入作坊，可以开始创作啦');
}
// ==================== GEN LOG 生成日志 ====================
let genLogs = ld('bj_genLogs', []);  // [{id,time,kind,type,title,articleId,api,messagesText}...]
let genLogSelectedId = '';

function _genLogUid(){ return Date.now()+'_'+Math.random().toString(36).slice(2,8); }

function addGenLog({kind,type,title,articleId,api,messages}){
  try{
    // 不记录导入导出：这里我们只在生成/续写处调用即可
    const now = new Date().toISOString();

    // 控制体积：把 messages 合并成纯文本存，且截断
    let msgText = '';
    (messages||[]).forEach(m=>{
      const role = m.role || '';
      const content = (m.content||'').toString();
      msgText += '【'+role+'】\n' + content + '\n\n';
    });
    msgText = msgText.trim();
    if(msgText.length > 20000) msgText = msgText.slice(0,20000) + '\n\n（已截断，防止日志过大）';

    const entry = {
      id: _genLogUid(),
      time: now,
      kind: kind || 'workshop', // workshop
      type: type || 'short',    // short/long/continue
      title: (title||'').toString().slice(0,60),
      articleId: articleId || '',
      api: {
        model: (api&&api.model)||'',
        temp: (api&&api.temp),
        maxTokens: (api&&api.maxTokens),
        stream: useStream
      },
      messagesText: msgText
    };

    genLogs.unshift(entry);
    if(genLogs.length > 200) genLogs = genLogs.slice(0,200); // 最多保留200条
    sv('bj_genLogs', genLogs);
  }catch(e){
    console.warn('addGenLog failed', e);
  }
}

function openGenLog(){
  document.getElementById('genLogOv').classList.add('show');
  navPush('genLogOv');
  document.getElementById('bnav').classList.add('hide');
  genLogSelectedId = '';
  document.getElementById('genLogSearch').value='';
  document.getElementById('genLogFilter').value='all';
  document.getElementById('genLogCount').textContent=(genLogs||[]).length+'条';
  renderGenLogList();
}

function closeGenLog(){
  navPop('genLogOv');
  document.getElementById('genLogOv').classList.remove('show');
  document.getElementById('bnav').classList.remove('hide');
}
function setGenLogFilter(val,label){
  document.getElementById('genLogFilter').value=val;
  document.getElementById('genLogFilterText').textContent=label;
  document.getElementById('genLogFilterDrop').style.display='none';
  renderGenLogList();
}
function toggleGenLogFilter(){
  var d=document.getElementById('genLogFilterDrop');
  if(d)d.style.display=d.style.display==='none'?'block':'none';
}
function renderGenLogList(){
  const list=document.getElementById('genLogList');
  try{document.getElementById('genLogCount').textContent=(genLogs||[]).length+'条';}catch(e){}
  const kw=(document.getElementById('genLogSearch').value||'').trim().toLowerCase();
  const filter=document.getElementById('genLogFilter').value;

  let items = genLogs || [];
  if(filter!=='all') items = items.filter(x=>x.type===filter);
  if(kw){
    items = items.filter(x=>{
      return (x.title||'').toLowerCase().includes(kw) || (x.messagesText||'').toLowerCase().includes(kw);
    });
  }

  if(items.length===0){
    list.innerHTML='<div class="empty-st"><p>没有日志</p></div>';
    return;
  }

  list.innerHTML='';
  items.forEach(item=>{
    const t = item.time ? new Date(item.time).toLocaleString() : '';
    const badge = item.type==='short'?'短篇':item.type==='long'?'长篇':'续写';
    const isSel = item.id===genLogSelectedId;

    const wrap=document.createElement('div');
    wrap.className='res-card';
    wrap.style.padding='0';
    wrap.style.overflow='hidden';
    wrap.style.borderColor = isSel ? 'var(--accent)' : 'var(--border)';

    const preview = (item.messagesText||'').slice(0,120);
    const full = (item.messagesText||'');

    wrap.innerHTML = `
      <details ${isSel?'open':''} style="margin:0">
        <summary style="list-style:none;cursor:pointer;padding:14px">
          <div class="res-card-hd" style="margin:0">
            <div class="res-card-t">${esc(item.title||'（无标题）')}</div>
            <span class="res-card-type exp">${badge}</span>
          </div>
          <div class="res-card-pv" style="margin:8px 0 0 0">${esc(preview)}${full.length>120?'...':''}</div>
          <div class="res-card-ft" style="margin-top:10px">
            <span class="res-card-info">${esc(t)} · ${esc((item.api&&item.api.model)||'')}</span>
            <div class="res-card-acts">
              <button onclick="event.preventDefault();event.stopPropagation();selectGenLog('${item.id}')">选中</button>
              <button onclick="event.preventDefault();event.stopPropagation();copyGenLog('${item.id}')">复制</button>
              <button class="danger" onclick="event.preventDefault();event.stopPropagation();deleteGenLog('${item.id}')">删除</button>
            </div>
          </div>
        </summary>

        <div style="padding:0 14px 14px">
          <div style="height:1px;background:var(--border);margin:10px 0"></div>
          <div style="font-size:11px;color:var(--text2);margin-bottom:8px;line-height:1.6">
            点击上方标题可收起/展开全文
          </div>
          <pre style="white-space:pre-wrap;word-break:break-word;overflow:auto;max-height:45vh;background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:10px;margin:0">${esc(full||'')}</pre>
        </div>
      </details>
    `;

    list.appendChild(wrap);
  });
}

function selectGenLog(id){
  genLogSelectedId = id;
  renderGenLogList();
  showToast('已选中一条日志');
}

function copyGenLog(id){
  const it = (genLogs||[]).find(x=>x.id===id);
  if(!it){showToast('找不到日志');return;}
  doCopy(it.messagesText||'');
  showToast('日志已复制');
}

function copySelectedGenLog(){
  if(!genLogSelectedId){showToast('请先选中一条日志');return;}
  copyGenLog(genLogSelectedId);
}

function deleteGenLog(id){
  showDlg('删除日志','确定要删除这条日志吗？',()=>{
    genLogs = (genLogs||[]).filter(x=>x.id!==id);
    sv('bj_genLogs', genLogs);
    if(genLogSelectedId===id) genLogSelectedId='';
    renderGenLogList();
    showToast('日志已删除');
  },true);
}

function clearGenLogAll(){
  showDlg('清空日志','确定要清空全部生成日志吗？',()=>{
    genLogs=[];
    sv('bj_genLogs', genLogs);
    genLogSelectedId='';
    renderGenLogList();
    showToast('日志已清空');
  },true);
}
// ==================== 清除所有数据 ====================
function clearAllData(){
showDlg('危险操作','即将清除星叙的【所有数据】，包括：\n\n• 全部作坊文章\n• 全部收藏（长篇+短篇）\n• 全部创作作品（草稿+小说）\n• 全部设定（人物/世界观/文风/规则/禁用词）\n• 全部预设（API/人物/世界观/文风/规则/禁用词/字体）\n• 全部资源包\n• 全部笔记和伏笔\n• 全部聊天记录和日志\n• 个人卡片、创作目标、锁屏设置\n• 故事转盘、上下文设置\n\n此操作完全不可恢复！\n\n强烈建议先导出备份！\n\n确定要继续吗？',()=>{
setTimeout(()=>{
showDlg('最终确认','这是最后一次确认！\n\n请在下方输入框输入「清除所有数据」来完成确认（一字不差）。',function(){
if(!clearDataConfirm){doRealClearAll();return;}
showInp('输入确认文字','请输入：清除所有数据',function(input){
if(input==='清除所有数据'){
doRealClearAll();
}else{
showToast('输入不匹配，操作已取消');
}
});
},true);
},200);
},true);
}

function doRealClearAll(){
try{
// 清除localStorage
const keysToKeep=[];
const allKeys=[];
for(let i=0;i<localStorage.length;i++){
allKeys.push(localStorage.key(i));
}
allKeys.forEach(k=>{
if(k&&k.startsWith('bj_')){
localStorage.removeItem(k);
}
});
// 清除IndexedDB
if(db){
try{
const tx=db.transaction(STORE_NAME,'readwrite');
const store=tx.objectStore(STORE_NAME);
store.clear();
}catch(e){console.warn('IndexedDB清除失败:',e);}
}
// 清除内存缓存
dbCache={};
// 重置所有变量
ws=[];
cols={books:[],shorts:[]};
tags=['#日常','#bg','#穿越','#奇幻','#校园','#甜文','#虐文','#悬疑','#古风','#现代'];
apiP=[];charP=[];worldP=[];styleP=[];ruleP=[];fontP=[];
banWordsP=[];
curRule='';
globalWorld='';globalRule='';globalBanWords='';
customSysPrompt='';
sysPromptEntries=_defaultSysPromptEntries();
localWorldBindings={};localRuleBindings={};
localBanWordsBindings={};localStyleBindings={};
currentWorldBinding='';currentRuleBinding='';
currentBanBinding='';currentStyleBinding='';
currentCharPresetName='';
banWords='';
characters=[{name:'',desc:''}];
customTraits=[];
sysPromptP=[];
savedPhrases=[];
charRelations=[];npcList=[];
crWorks=[];resPacks=[];
useStream=true;
userCard={name:'',bio:'',avatar:''};
lockSettings={enabled:false,passHash:'',q:'',aHash:''};
articleContexts={};
storyWheels=[];
genLogs=[];
xjMessages=[];
xjBgImg='';
dndMode=false;
ringData='';ringName='';ringVolume_=0.8;
goalSettings={weekWords:5000,weekChapters:3,monthWords:20000,monthChapters:12};
goalProgress={weekKey:'',weekWords:0,weekChapters:0,monthKey:'',monthWords:0,monthChapters:0,history:[]};
goalYearStats={};
goalDailyStats={};
goalCelebrated={weekWords:false,weekCh:false,monthWords:false,monthCh:false,lastWeekKey:'',lastMonthKey:''};
ap={theme:'default',fontUrl:'',rdBg:'',rdFontSize:15,rdLineHeight:2,curStyle:'',simpleUI:false};
favItems=[];
genTemplates=[];
_streamBreakpoint={};
devMode=false;
// 清除标记
localStorage.removeItem('bj_hasVisited');
localStorage.removeItem('bj_lastBackup');
localStorage.removeItem('bj_darkTipShown');
localStorage.removeItem('bj_xjTotalChats');
localStorage.removeItem('bj_xjEverLong');
localStorage.removeItem('bj_xjEverShort');
localStorage.removeItem('bj_xjEverStreak7');
localStorage.removeItem('bj_xjEverMillion');
localStorage.removeItem('tb_journeys');
localStorage.removeItem('tb_settings');
localStorage.removeItem('tb_bindings');
localStorage.removeItem('tb_beauty');
localStorage.removeItem('tb_hasVisited');
localStorage.removeItem('bj_agreedVer');
showToast('星笺已经帮你清理干净了...页面即将刷新',3000);
setTimeout(()=>{
window.location.reload();
},2000);
}catch(e){
showToast('清除过程出错：'+e.message+'，建议手动清除浏览器数据',5000);
console.error('clearAll error:',e);
}
}
async function emergencyRecover(){
  showDlg('🆘 紧急数据恢复','此功能会尝试从浏览器底层存储中搜寻残留数据。\n\n适用于：\n· 数据意外丢失（清了缓存、崩溃等）\n· 没有导出备份\n\n注意：不保证能恢复全部内容，越早执行越好。\n\n是否开始扫描？',async function(){
    showToast('正在扫描存储碎片...',4000);
    var recovered={ws:0,cols:0,cr:0,notes:0,other:0};
    var report=[];
    
    // 1. 先尝试从IndexedDB重新加载一次
    if(db){
      try{
        await loadAllFromDB();
        report.push('已从IndexedDB重新加载 '+Object.keys(dbCache).length+' 项');
      }catch(e){report.push('IndexedDB加载失败：'+e.message);}
    }
    
    // 2. 扫描localStorage的所有bj_开头的键
    var lsKeys=[];
    for(var i=0;i<localStorage.length;i++){
      var key=localStorage.key(i);
      if(key&&key.startsWith('bj_'))lsKeys.push(key);
    }
    report.push('localStorage中找到 '+lsKeys.length+' 个星叙相关键');
    
    // 3. 尝试恢复作坊文章
    var cachedWs=dbCache[K.ws];
    if(cachedWs&&Array.isArray(cachedWs)&&cachedWs.length>ws.length){
      var oldCount=ws.length;
      ws=cachedWs;
      sv(K.ws,ws);
      recovered.ws=ws.length-oldCount;
      report.push('作坊文章：恢复了 '+recovered.ws+' 篇（总计 '+ws.length+' 篇）');
    }else{
      report.push('作坊文章：当前 '+ws.length+' 篇，无更多可恢复');
    }
    
    // 4. 尝试恢复收藏
    var cachedCols=dbCache[K.cols];
    if(cachedCols&&typeof cachedCols==='object'){
      var oldBooks=(cols.books||[]).length;
      var oldShorts=(cols.shorts||[]).length;
      if(cachedCols.books&&cachedCols.books.length>oldBooks){
        cols.books=cachedCols.books;recovered.cols+=cols.books.length-oldBooks;
      }
      if(cachedCols.shorts&&cachedCols.shorts.length>oldShorts){
        cols.shorts=cachedCols.shorts;recovered.cols+=cols.shorts.length-oldShorts;
      }
      sv(K.cols,cols);
      report.push('收藏：恢复了 '+recovered.cols+' 篇');
    }
    
    // 5. 尝试恢复创作作品
    var cachedCr=dbCache['bj_crWorks'];
    if(cachedCr&&Array.isArray(cachedCr)&&cachedCr.length>crWorks.length){
      var oldCr=crWorks.length;
      crWorks=cachedCr;
      sv('bj_crWorks',crWorks);
      recovered.cr=crWorks.length-oldCr;
      report.push('创作作品：恢复了 '+recovered.cr+' 个');
    }
    
    // 5.5 尝试恢复创作工具箱文件夹
    var cachedCrFolders=dbCache['bj_crFolders'];
    if(cachedCrFolders&&Array.isArray(cachedCrFolders)&&cachedCrFolders.length>crFolders.length){
      var oldCrF=crFolders.length;
      crFolders=cachedCrFolders;
      sv('bj_crFolders',crFolders);
      report.push('文件夹：恢复了 '+(crFolders.length-oldCrF)+' 个');
    }
    
    // 6. 扫描笔记
    var noteCount=0;
    lsKeys.forEach(function(key){
      if(key.startsWith('bj_notes_')){
        try{
          var notes=JSON.parse(localStorage.getItem(key));
          if(Array.isArray(notes)&&notes.length>0){
            var cached=dbCache[key];
            if(!cached||!Array.isArray(cached)||cached.length<notes.length){
              dbCache[key]=notes;
              dbSet(key,notes);
              noteCount+=notes.length;
            }
          }
        }catch(e){}
      }
    });
    if(noteCount>0){
      recovered.notes=noteCount;
      report.push('笔记：恢复了 '+noteCount+' 条');
    }
    
    // 7. 恢复角色/设定等
    var settingKeys=['bj_charRelations','bj_npcList','bj_rpChars','bj_globalWorld','bj_globalRule',
      'bj_globalBanWords','bj_customSysPrompt','bj_sysPromptEntries','bj_goalSettings','bj_goalProgress',
      'bj_articleContexts','bj_storyWheels','bj_genLogs','bj_favItems','bj_savedPhrases',
      'bj_genTemplates','bj_rtInterviews','bj_rtPlays'];
    settingKeys.forEach(function(key){
      var cached=dbCache[key];
      var local=null;
      try{local=JSON.parse(localStorage.getItem(key));}catch(e){}
      if(!cached&&local){
        dbCache[key]=local;
        dbSet(key,local);
        recovered.other++;
      }else if(cached&&!local){
        // IndexedDB有但localStorage没有，算已恢复
      }
    });
    if(recovered.other>0)report.push('其他设定：恢复了 '+recovered.other+' 项');
    
    // 8. 重新渲染
    try{renderArticles();}catch(e){}
    try{renderCollections();}catch(e){}
    try{renderCrList();}catch(e){}
    try{updateStats();}catch(e){}
    
    var total=recovered.ws+recovered.cols+recovered.cr+recovered.notes+recovered.other;
    var resultMsg='扫描完成\n\n'+report.join('\n')+'\n\n';
    if(total>0){
      resultMsg+='共恢复了 '+total+' 项数据！\n\n强烈建议立即导出备份，防止再次丢失。';
    }else{
      resultMsg+='未发现可恢复的额外数据。\n\n可能的原因：\n· 浏览器缓存已被彻底清除\n· 数据从未保存到本设备\n· 使用了无痕/隐身模式\n\n建议：以后定期使用「导出全部数据」功能备份。';
    }
    showDlg('恢复结果',resultMsg,function(){
      if(total>0){
        showDlg('建议备份','数据已恢复，建议立即导出备份防止再次丢失，是否现在导出？',function(){exportData();});
      }
    });
  });
}

function compressData(){
  showDlg('数据压缩','即将对所有本地数据做格式压缩：\n\n• 清除文章中多余空行和行末空格\n• 压缩生成日志中超长文本（>3000字符）\n\n不删除任何内容，所有数据仍可正常查看和使用。',function(){
    var artCount=0;
    var logCount=0;
    function _compact(t){
      if(typeof t!=='string')return t;
      return t.replace(/(\r?\n){3,}/g,'\n\n').replace(/[ \t]+$/gm,'').trim();
    }
    function _compressArt(a){
      if(!a)return a;
      if(Array.isArray(a.chapters))a.chapters=a.chapters.map(function(ch){return typeof ch==='string'?_compact(ch):ch;});
      if(typeof a.content==='string')a.content=_compact(a.content);
      artCount++;
      return a;
    }
    // 压缩作坊
    ws=ws.map(_compressArt);
    sv(K.ws,ws);
    // 压缩收藏
    if(Array.isArray(cols.books))cols.books=cols.books.map(_compressArt);
    if(Array.isArray(cols.shorts))cols.shorts=cols.shorts.map(_compressArt);
    sv(K.cols,cols);
    // 压缩创作作品
    crWorks=crWorks.map(function(w){
      if(!w)return w;
      if(Array.isArray(w.chapters))w.chapters=w.chapters.map(function(ch){return typeof ch==='string'?_compact(ch):ch;});
      if(typeof w.content==='string')w.content=_compact(w.content);
      artCount++;return w;
    });
    sv('bj_crWorks',crWorks);
    // 压缩生成日志（截断超长上下文）
    genLogs=(genLogs||[]).map(function(log){
      if(!log)return log;
      if(typeof log.messagesText==='string'&&log.messagesText.length>3000){
        log.messagesText=log.messagesText.substring(0,3000)+'…（已压缩）';
        logCount++;
      }
      return log;
    });
    if(logCount>0)sv('bj_genLogs',genLogs);
    // 同步更新当前编辑器内容
    try{
      if(curEd){
        var ta=document.getElementById('edTextarea');
        if(ta){var cur=ta.value;var comp=_compact(cur);if(comp!==cur){ta.value=comp;updateEdWc();}}
      }
    }catch(e){}
    showToast('压缩完成：处理文章 '+artCount+' 篇'+(logCount>0?'，日志优化 '+logCount+' 条':''),3000);
    setTimeout(function(){try{updateStorageDisplay();}catch(e){}},300);
  },true);
}

function clearOldGenLog(){
  const oneMonth=30*24*60*60*1000;
  const now=Date.now();
  const beforeLen=(genLogs||[]).length;
  genLogs=(genLogs||[]).filter(x=>{
    if(!x.time)return true;
    return (now-new Date(x.time).getTime())<=oneMonth;
  });
  const deletedCount=beforeLen-genLogs.length;
  if(deletedCount===0){showToast('没有需要清理的旧日志');return;}
  sv('bj_genLogs',genLogs);
  showToast('已清理旧日志：'+deletedCount+' 条');
  try{renderGenLogList();}catch(e){logError('op',e)}
}
// ==================== AUTO BACKUP ====================
function autoBackup(){
  if(!backupReminder) return; // 开关关闭时不提醒
  try{
    var lastBackup=localStorage.getItem('bj_lastBackup');
    var now=Date.now();

    // 计算数据量：数据太少（新用户/刚起步）不打扰
    var totalWords=0;
    ws.forEach(function(a){totalWords+=getTotalWords(a);});
    crWorks.forEach(function(w){totalWords+=getCrWordCount(w);});
    if(totalWords<1000)return;

    // 备份间隔：1-30天，默认7天；防御性夹紧，避免异常值导致永远不提醒或提醒过于频繁
    var days=Math.max(1,Math.min(30,parseInt(backupInterval,10)||7));
    var intervalMs=days*24*60*60*1000;
    if(lastBackup&&(now-parseInt(lastBackup,10))<=intervalMs)return; // 还没到备份周期

    // 到了该备份的日子：一天只提醒一次，点"取消"的话第二天还没备份会继续提醒
    var todayStr=new Date().toDateString();
    if(localStorage.getItem('bj_lastBackupPromptDay')===todayStr)return;

    setTimeout(function(){
      try{localStorage.setItem('bj_lastBackupPromptDay',todayStr);}catch(e){logError('autoBackup',e);}
      if(!lastBackup){
        showDlg('星笺温馨提醒','你已经写了 '+totalWords+' 字啦！这些都是你的心血，星笺帮你守着呢～\n\n不过万一出了意外，星笺也没办法变魔法恢复……\n\n要不现在去备份一下？就几秒钟的事！',function(){exportData();});
      }else{
        var elapsedDays=Math.floor((now-parseInt(lastBackup,10))/86400000);
        showDlg('定期备份提醒','距离上次备份已经 '+elapsedDays+' 天啦，要不现在花几秒钟备份一下？',function(){exportData();});
      }
    },5000);
  }catch(e){logError('autoBackup',e);}
}

function markBackupDone(){
localStorage.setItem('bj_lastBackup',Date.now().toString());
_updateLastBackupDisplay();
}

function _updateLastBackupDisplay(){
var el=document.getElementById('lastBackupTime');
if(!el)return;
var ts=localStorage.getItem('bj_lastBackup');
if(!ts){el.textContent='从未备份';el.style.color='var(--danger)';return;}
var d=new Date(parseInt(ts));
var diff=Math.floor((Date.now()-parseInt(ts))/86400000);
var label=d.toLocaleDateString()+' '+d.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
if(diff>=7){el.style.color='var(--danger)';label=label+'（'+diff+'天前）';}
else if(diff>=3){el.style.color='#f0a030';label=''+label+'（'+diff+'天前）';}
else{el.style.color='var(--success)';label=label;}
el.textContent=label;
}
// ==================== TTS 语音朗读 ====================
let ttsUtterance=null;
let ttsPlaying=false;
let ttsPaused=false;
let ttsParas=[];
let ttsCurrentPara=0;
let ttsSettings_=ld('bj_ttsSettings',{voiceURI:'',rate:1,pitch:1});

function initTtsVoices(){
const select=document.getElementById('ttsVoiceSelect');
if(!select)return;
if(typeof speechSynthesis==='undefined'||!speechSynthesis)return;
let voices=[];
try{voices=speechSynthesis.getVoices();}catch(e){return;}
select.innerHTML='';
const cnVoices=voices.filter(v=>v.lang.includes('zh')||v.lang.includes('CN'));
const otherVoices=voices.filter(v=>!v.lang.includes('zh')&&!v.lang.includes('CN'));
const sorted=[...cnVoices,...otherVoices];
sorted.forEach(v=>{
const opt=document.createElement('option');
opt.value=v.voiceURI;
opt.textContent=v.name+(v.lang?' ('+v.lang+')':'');
if(v.voiceURI===ttsSettings_.voiceURI)opt.selected=true;
select.appendChild(opt);
});
if(!ttsSettings_.voiceURI&&cnVoices.length>0){
select.value=cnVoices[0].voiceURI;
}
}

function toggleTtsBar(){
if (typeof speechSynthesis === 'undefined') {
    showToast('你的浏览器不支持语音朗读功能');
    return;
}
const bar=document.getElementById('ttsBar');
bar.classList.toggle('show');
if(bar.classList.contains('show')){
initTtsVoices();
loadTtsParas();
document.getElementById('ttsRate').value=ttsSettings_.rate;
document.getElementById('ttsRateVal').textContent=ttsSettings_.rate.toFixed(1);
document.getElementById('ttsPitch').value=ttsSettings_.pitch;
document.getElementById('ttsPitchVal').textContent=ttsSettings_.pitch.toFixed(1);
}else{
ttsStop();
}
}

function toggleTtsSettings(){
document.getElementById('ttsSettings').classList.toggle('show');
}

function loadTtsParas(){
if(!curRd){ttsParas=[];ttsCurrentPara=0;updateTtsInfo();return;}
var text='';
if(curRd.type==='long'&&curRd.chapters){
text=curRd.chapters[curCh]||'';
}else{
text=curRd.content||'';
}
ttsParas=text.split(/\n+/).map(function(p){return p.trim();}).filter(function(t){return t;});
ttsCurrentPara=0;
updateTtsInfo();
}

function updateTtsInfo(){
  try{
    const total = ttsParas.length || 0;
    const cur = (total===0) ? 0 : Math.min(ttsCurrentPara+1, total);
    document.getElementById('ttsInfo').textContent = cur + '/' + total + '段';
    const pct = total>0 ? (cur/total*100) : 0;
    document.getElementById('ttsProgress').style.width = pct + '%';
  }catch(e){logError('op',e)}
}

function highlightCurrentPara(){
try{
const content=document.getElementById('rdContent');
if(!content)return;
content.querySelectorAll('p').forEach((p,i)=>{
p.classList.toggle('tts-highlight',i===ttsCurrentPara);
});
const paras=content.querySelectorAll('p');
if(paras[ttsCurrentPara]){
paras[ttsCurrentPara].scrollIntoView({behavior:'smooth',block:'center'});
}
}catch(e){logError('op',e)}
}

function ttsPlayPause(){
try{
if(typeof speechSynthesis==='undefined'||!speechSynthesis||!window.SpeechSynthesisUtterance){
showToast('你的浏览器不支持语音朗读');
return;
}
}catch(e){
showToast('语音功能不可用');
return;
}
if(ttsParas.length===0){
loadTtsParas();
if(ttsParas.length===0){
showToast('没有可朗读的内容');
return;
}
}
if(ttsPlaying&&!ttsPaused){
try{speechSynthesis.pause();}catch(e){logError('op',e)}
ttsPaused=true;
document.getElementById('ttsPlayBtn').textContent='▶ 继续';
return;
}
if(ttsPaused){
try{speechSynthesis.resume();}catch(e){logError('op',e)}
ttsPaused=false;
document.getElementById('ttsPlayBtn').textContent='⏸ 暂停';
return;
}
ttsPlaying=true;
ttsPaused=false;
document.getElementById('ttsPlayBtn').textContent='⏸ 暂停';
speakCurrentPara();
}

function speakCurrentPara(){
if(typeof speechSynthesis==='undefined'||!speechSynthesis)return;
if(ttsCurrentPara>=ttsParas.length){
ttsStop();
showToast('朗读完成');
return;
}
// 先取消之前可能未播放完的语音，避免叠加
try{ speechSynthesis.cancel(); }catch(e){logError('op',e)}
const text=ttsParas[ttsCurrentPara];
ttsUtterance=new SpeechSynthesisUtterance(text);
try{
const voices=speechSynthesis.getVoices();
const selectedURI=document.getElementById('ttsVoiceSelect').value;
const voice=voices.find(v=>v.voiceURI===selectedURI);
if(voice)ttsUtterance.voice=voice;
}catch(e){logError('op',e)}
ttsUtterance.rate=parseFloat(document.getElementById('ttsRate').value)||1;
ttsUtterance.pitch=parseFloat(document.getElementById('ttsPitch').value)||1;
ttsUtterance.onend=()=>{
if(!ttsPlaying)return;
ttsCurrentPara++;
updateTtsInfo();
if(ttsCurrentPara<ttsParas.length){
highlightCurrentPara();
speakCurrentPara();
}else{
ttsStop();
showToast('朗读完成');
}
};
ttsUtterance.onerror=(e)=>{
console.error('TTS错误:',e);
if(e.error!=='interrupted'){
showToast('朗读出错，请换个语音试试');
}
};
highlightCurrentPara();
updateTtsInfo();
try{speechSynthesis.speak(ttsUtterance);}catch(e){logError('op',e)}
}

function ttsStop(){
try{if(typeof speechSynthesis!=='undefined'&&speechSynthesis)speechSynthesis.cancel();}catch(e){logError('op',e)}
ttsPlaying=false;
ttsPaused=false;
ttsCurrentPara=0;
try{document.getElementById('ttsPlayBtn').textContent='▶ 朗读';}catch(e){logError('op',e)}
try{
const content=document.getElementById('rdContent');
if(content){
content.querySelectorAll('p').forEach(p=>p.classList.remove('tts-highlight'));
}
}catch(e){logError('op',e)}
try{updateTtsInfo();}catch(e){logError('op',e)}
}

function ttsPrevPara(){
if(ttsCurrentPara>0){
ttsCurrentPara--;
if(ttsPlaying){
try{speechSynthesis.cancel();}catch(e){logError('op',e)}
ttsPaused=false;
speakCurrentPara();
}else{
highlightCurrentPara();
updateTtsInfo();
}
}
}

function ttsNextPara(){
if(ttsCurrentPara<ttsParas.length-1){
ttsCurrentPara++;
if(ttsPlaying){
try{speechSynthesis.cancel();}catch(e){logError('op',e)}
ttsPaused=false;
speakCurrentPara();
}else{
highlightCurrentPara();
updateTtsInfo();
}
}
}

function updateTtsRate(){
const val=parseFloat(document.getElementById('ttsRate').value);
document.getElementById('ttsRateVal').textContent=val.toFixed(1);
ttsSettings_.rate=val;
saveTtsSettings();
}

function updateTtsPitch(){
const val=parseFloat(document.getElementById('ttsPitch').value);
document.getElementById('ttsPitchVal').textContent=val.toFixed(1);
ttsSettings_.pitch=val;
saveTtsSettings();
}

function saveTtsSettings(){
ttsSettings_.voiceURI=document.getElementById('ttsVoiceSelect').value;
ttsSettings_.rate=parseFloat(document.getElementById('ttsRate').value)||1;
ttsSettings_.pitch=parseFloat(document.getElementById('ttsPitch').value)||1;
sv('bj_ttsSettings',ttsSettings_);
}

try{
if(typeof speechSynthesis!=='undefined'&&speechSynthesis){
speechSynthesis.onvoiceschanged=initTtsVoices;
}
}catch(e){
console.warn('语音合成API不可用:',e);
}
