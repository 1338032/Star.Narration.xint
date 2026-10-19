/*
╔══════════════════════════════════════════════════════════════════
║  星叙 script-2-content.js — JS 结构目录（拆分 2/5）
║  主题：生成 & 阅读器 & 收藏
║
║  本文件是原 script.js 按功能板块拆成的 5 份之一，浏览器里需要按顺序加载：
║  script-1-core.js → script-2-content.js → script-3-settings.js → script-4-aitools.js → script-5-system.js
║  （原单文件共 40191 行；本文件对应原文件第 4664~9314 行，body 共 4651 行）
╠══════════════════════════════════════════════════════════════════
║   GENERATE ARTICLE   33
║   收藏夹系统              181
║   快捷短语收藏             483
║   READING            1288
║   阅读页核心              1341
║   翻页阅读器核心（全面重构）      1481
║   阅读器浮层菜单            1973
║   为此卷生成梗概            2466
║   NOTES              2596
║   阅读页全屏原文编辑          3197
║   编辑器内作品更名           3201
║   IMMERSIVE READ     3472
║   阅读页折叠工具栏           3574
║   CONTINUE CHAPTER   3675
║   UNDO CHAPTER       3965
║   COPY               3983
║   COLLECTIONS        4138
║   收藏页筛选器             4139
║   弹出菜单公共工具           4398
║   新手教程（星笺分步引导）    4695
╚══════════════════════════════════════════════════════════════════
*/

// ==================== GENERATE ARTICLE ====================
// 设定冲突检测
function checkSettingConflicts(){
const issues=[];
const validChars=characters.filter(c=>c.name);
// 检查重名
const names=validChars.map(c=>c.name);
const npcNames=npcList.map(n=>n.name).filter(Boolean);
const allNames=[...names,...npcNames];
const dupNames=allNames.filter((n,i)=>allNames.indexOf(n)!==i);
if(dupNames.length>0)issues.push('发现重名角色：'+dupNames.join('、'));

// 检查关系中引用了不存在的角色
charRelations.forEach(r=>{
if(!allNames.includes(r.charA))issues.push('关系中的「'+r.charA+'」不在角色列表中');
if(!allNames.includes(r.charB))issues.push('关系中的「'+r.charB+'」不在角色列表中');
});

// 检查矛盾关系（同两人既是恋人又是敌对）
const relMap={};
charRelations.forEach(r=>{
const key=[r.charA,r.charB].sort().join('|');
if(!relMap[key])relMap[key]=[];
relMap[key].push(r.type);
});
Object.keys(relMap).forEach(key=>{
const types=relMap[key];
if(types.includes('恋人')&&(types.includes('敌对')||types.includes('宿敌'))){
issues.push(''+key.replace('|',' 和 ')+' 同时是恋人和敌对，请确认是否有意为之');
}
});

// 检查世界观和规则是否矛盾
const worldText=(document.getElementById('worldDesc')&&document.getElementById('worldDesc').value||'')+(document.getElementById('globalWorldDesc')&&document.getElementById('globalWorldDesc').value||'');
const ruleText=(document.getElementById('ruleDesc')&&document.getElementById('ruleDesc').value||'')+(document.getElementById('globalRuleDesc')&&document.getElementById('globalRuleDesc').value||'');
if(worldText.includes('古代')&&ruleText.includes('现代限定'))issues.push('世界观是古代但规则要求现代限定');
if(worldText.includes('现代')&&ruleText.includes('古风限定'))issues.push('世界观是现代但规则要求古风限定');

return issues;
}

function showSettingPreview(){
  const short10 = (s)=>{
    s = (s||'').toString().trim().replace(/\s+/g,' ');
    return s ? (s.length>10 ? s.slice(0,10)+'…' : s) : '（未设置）';
  };
  const shortName10 = (s)=>{
    s = (s||'').toString().trim();
    return s ? (s.length>10 ? s.slice(0,10)+'…' : s) : '（未命名）';
  };

  // 读取：优先取输入框（实时），再回退到变量
  const getVal = (id, fb='')=>{
    const el = document.getElementById(id);
    return (el && typeof el.value==='string') ? el.value : fb;
  };

  const gWorld = (getVal('globalWorldDesc', globalWorld)||'').trim();
  const lWorld = (getVal('worldDesc', '')||'').trim();

  const gRule  = (getVal('globalRuleDesc', globalRule)||'').trim();
  const lRule  = (getVal('ruleDesc', curRule)||'').trim();

  const lStyle = (getVal('styleDesc', ap.curStyle||'')||'').trim();

  const gBan = (getVal('globalBanWordsInput', globalBanWords)||'').trim();
  const lBan = (getVal('banWordsInput', banWords)||'').trim();

  const minW = parseInt(getVal('minWords', 0), 10) || 0;

  const validChars = (characters||[]).filter(c=>c && (c.name||c.desc));
  const charNames = validChars.map(c=>shortName10(c.name)).join('、') || '（暂无角色）';

  let info = '';
  info += '当前生效设定（仅展示每项前10字）\n\n';

  info += '人物（'+validChars.length+'个）\n';
  info += '名称：'+charNames+'\n\n';

  info += '世界观\n';
  info += '全局：'+short10(gWorld)+'\n';
  info += '局部：'+short10(lWorld)+'\n';
  info += '每章最少字数：'+(minW?minW+'字':'（未设置）')+'\n\n';

  info += '文风（局部）\n';
  info += short10(lStyle)+'\n\n';

  info += '规则\n';
  info += '全局：'+short10(gRule)+'\n';
  info += '局部：'+short10(lRule)+'\n\n';

  info += '禁用词\n';
  info += '全局：'+short10(gBan)+'\n';
  info += '局部：'+short10(lBan)+'\n\n';

  // 绑定信息（如果你没绑定过，会显示空）
  info += '当前局部绑定对象（角色预设名）\n';
  info += '世界观绑定：'+(currentWorldBinding||'（未绑定）')+'\n';
  info += '文风绑定：'+(currentStyleBinding||'（未绑定）')+'\n';
  info += '规则绑定：'+(currentRuleBinding||'（未绑定）')+'\n';
  info += '禁用词绑定：'+(currentBanBinding||'（未绑定）')+'\n';

  showDlg('当前设定', info, ()=>{});
// 仅“当前设定”弹窗启用竖向滚动
  const p=document.getElementById('dlgMsg');
  if(p){
    p.style.maxHeight='60vh';
    p.style.overflowY='auto';
    p.style.paddingRight='6px';
    p.style.webkitOverflowScrolling='touch';
  }
}
function filterWorkshopArticles(kw){
kw=(kw||'').trim().toLowerCase();
if(!kw){renderArticles();return;}
const list=document.getElementById('articleList');
// 关键词搜索也要叠加上已选中的标签筛选（selTags 是"且"关系，逻辑和 renderArticles() 里保持一致），
// 不然选好标签后一在搜索框打字，标签筛选就被悄悄绕过了，两套筛选各管各的会让人摸不着头脑
const filtered=ws.filter(a=>a&&a.type===curType
&&(selTags.length===0||selTags.every(t=>(a.tags||[]).includes(t)))
&&(
(a.title||'').toLowerCase().includes(kw)||
(a.prompt||'').toLowerCase().includes(kw)||
(a.tags||[]).some(t=>t.toLowerCase().includes(kw))
));
if(filtered.length===0){renderArticles();return;}
list.innerHTML='';
filtered.forEach(article=>{
const liked=isLiked(article);
const card=document.createElement('div');
card.className='acard';
card.onclick=e=>{if(!e.target.closest('.btn-like'))openReading(article);};
let text='';
if(article.type==='long'&&article.chapters&&article.chapters.length>0)text=article.chapters[0];
else if(article.content)text=article.content;
const preview=(text||'').substring(0,120).replace(/\n/g,' ');
const wc=getTotalWords(article);
card.innerHTML=
'<div class="acard-hd"><div class="acard-t">'+esc(article.title)+'</div>'+
'<span class="acard-badge '+article.type+'">'+(article.type==='long'?'长篇':'短篇')+'</span></div>'+
'<div class="acard-pv">'+esc(preview)+'</div>'+
'<div class="acard-ft">'+
'<span class="acard-wc">'+wc+'字</span>'+
'<button class="btn-like '+(liked?'liked':'')+'" onclick="event.stopPropagation();toggleLike(\''+article.id+'\')">'+(liked?'<i class="fas fa-heart" style="color:#ff6b6b"></i> 已收藏':'<i class="fas fa-heart" style="color:var(--text2)"></i> 收藏')+'</button>'+
'</div>';
list.appendChild(card);
});
}
// ==================== 收藏夹系统 ====================
let favItems = ld('bj_favItems', []); // [{id,text,articleId,articleTitle,chIdx,paraIdx,time,tags}]
let favTags = ld('bj_favTags', []); // 全局分类名列表 ['恋爱','推理',...]
let favActiveTag = ''; // 当前选中的标签筛选

function openFavModal(){
  document.getElementById('favModal').classList.add('show');
  navPush('favModal');
  document.getElementById('bnav').classList.add('hide');
  document.getElementById('favSearchInput').value = '';
  renderFavList();
}

function closeFavModal(){
  navPop('favModal');
  document.getElementById('favModal').classList.remove('show');
  document.getElementById('bnav').classList.remove('hide');
}

function renderFavList(){
  // 渲染标签筛选栏（基于全局 favTags 列表）
  var filterBar = document.getElementById('favTagFilterBar');
  if(filterBar){
    var bHtml = '<span class="tag'+(favActiveTag===''?' act':'')+'" onclick="setFavActiveTag(\'\')">全部</span>';
    favTags.forEach(function(t){
      bHtml += '<span class="tag'+(favActiveTag===t?' act':'')+'" data-ftag="'+esc(t)+'" onclick="setFavActiveTag(this.dataset.ftag)">'+esc(t)+'</span>';
    });
    bHtml += '<span class="tag-add" onclick="createFavTag()"><i class="fas fa-plus" style="font-size:9px;margin-right:3px"></i>新建</span>';
    filterBar.innerHTML = bHtml;
    // 长按标签 → 管理（重命名/删除）
    filterBar.querySelectorAll('.tag[data-ftag]').forEach(function(el){
      var _lp = null;
      el.addEventListener('touchstart', function(){
        _lp = setTimeout(function(){ openFavTagMgr(el.dataset.ftag); }, 600);
      }, {passive:true});
      ['touchend','touchmove','touchcancel'].forEach(function(ev){
        el.addEventListener(ev, function(){ clearTimeout(_lp); });
      });
    });
  }
  var kw = (document.getElementById('favSearchInput').value || '').trim().toLowerCase();
  var items = favItems.slice();
  if(kw){
    items = items.filter(function(f){
      return (f.text||'').toLowerCase().includes(kw) || (f.articleTitle||'').toLowerCase().includes(kw);
    });
  }
  if(favActiveTag){
    items = items.filter(function(f){return f.tags&&f.tags.includes(favActiveTag);});
  }
  // 按时间倒序
  items.sort(function(a,b){return new Date(b.time||0) - new Date(a.time||0);});
  
  var container = document.getElementById('favList');
  var emptyEl = document.getElementById('favEmpty');
  document.getElementById('favCount').textContent = favItems.length + ' 条';
  
  if(items.length === 0){
    container.innerHTML = '';
    emptyEl.style.display = 'block';
    return;
  }
  emptyEl.style.display = 'none';
  container.innerHTML = '';
  
  items.forEach(function(f){
    var div = document.createElement('div');
    div.className = 'fav-item';
    var time = f.time ? new Date(f.time).toLocaleString() : '';
    // 查找当前最新书名（优先用实时标题）
    var curTitle = f.articleTitle || '';
    if(f.articleId){
      var _la = ws.find(function(a){return a.id===f.articleId;});
      if(!_la) _la = cols.books.find(function(b){return b.id===f.articleId;});
      if(!_la) _la = cols.shorts.find(function(s){return s.id===f.articleId;});
      if(_la && _la.title) curTitle = _la.title;
    }
    var source = curTitle ? '来自《' + esc(curTitle) + '》' : '';
    if(f.chIdx !== undefined && f.chIdx >= 0) source += ' 第' + (f.chIdx+1) + '章';
    
    div.innerHTML = 
      '<div class="fav-item-text">' + esc(f.text) + '</div>' +
      ((f.tags&&f.tags.length)?'<div>' + f.tags.map(function(t){return '<span class="fav-tag-label">'+esc(t)+'</span>';}).join('') + '</div>' : '') +
      '<div class="fav-item-source">' +
        '<span>' + esc(source) + '</span>' +
        '<span>' + time + '</span>' +
      '</div>' +
      '<div class="fav-item-acts">' +
        '<div class="fav-item-acts-left">' +
          '<button title="复制" onclick="copyFavItem(\'' + f.id + '\')"><i class="fas fa-copy"></i></button>' +
          (f.articleId ? '<button class="primary" title="跳转原文" onclick="jumpToFavSource(\'' + f.id + '\')"><i class="fas fa-book-open"></i></button>' : '') +
          '<button class="tag-btn" title="添加标签" onclick="openFavTagPicker(\'' + f.id + '\')"><i class="fas fa-tag"></i></button>' +
        '</div>' +
        '<button class="danger" title="删除" onclick="deleteFavItem(\'' + f.id + '\')"><i class="fas fa-trash-alt"></i></button>' +
      '</div>';
    container.appendChild(div);
  });
}

function addToFavorites(text, articleId, articleTitle, chIdx, paraIdx){
  if(!text || !text.trim()){showToast('内容为空');return;}
  // 检查是否已收藏
  var exists = favItems.some(function(f){return f.text === text.trim();});
  if(exists){showToast('已经收藏过啦');return;}
  
  favItems.push({
    id: uid(),
    text: text.trim(),
    articleId: articleId || '',
    articleTitle: articleTitle || '',
    chIdx: (chIdx !== undefined) ? chIdx : -1,
    paraIdx: (paraIdx !== undefined) ? paraIdx : -1,
    time: new Date().toISOString(),
    tags: []
  });
  sv('bj_favItems', favItems);
  showToast('⭐ 已收藏到收藏夹');
}

function copyFavItem(id){
  var f = favItems.find(function(x){return x.id === id;});
  if(f) doCopy(f.text);
}

function deleteFavItem(id){
  showDlg('删除收藏','确定要删除这条收藏吗？',function(){
    favItems = favItems.filter(function(x){return x.id !== id;});
    sv('bj_favItems', favItems);
    renderFavList();
    showToast('已删除');
  },true);
}

function jumpToFavSource(id){
  var f = favItems.find(function(x){return x.id === id;});
  if(!f || !f.articleId){showToast('找不到原文来源');return;}
  
  // 在各处查找文章
  var article = ws.find(function(a){return a.id === f.articleId;});
  if(!article) article = cols.books.find(function(b){return b.id === f.articleId;});
  if(!article) article = cols.shorts.find(function(s){return s.id === f.articleId;});
  
  if(!article){showToast('原文已被删除');return;}
  
  // 检查段落内容是否仍然存在
  var chContent = '';
  if(f.chIdx >= 0 && article.chapters && f.chIdx < article.chapters.length){
    chContent = article.chapters[f.chIdx] || '';
  } else {
    chContent = article.content || '';
  }
  var snippet = (f.text || '').trim().substring(0, 40);
  if(snippet && chContent && !chContent.includes(snippet)){
    showToastForce('原文内容已改变，无法跳转', 2500);
    return;
  }
  
  closeFavModal();
  
  // 打开阅读
  setTimeout(function(){
    openReading(article);
    if(f.chIdx >= 0 && article.chapters && f.chIdx < article.chapters.length){
      curCh = f.chIdx;
      renderChContent();
    }
    // 提示用户定位收藏段落
    setTimeout(function(){
      var snippet = (f.text||'').trim().substring(0,15);
      if(snippet) showToast('已跳转，可搜索「'+snippet+'...」快速定位', 3000);
    }, 600);
  }, 300);
}
function setFavActiveTag(tag){
  favActiveTag = tag;
  renderFavList();
}

// ---- 分类选择器（底部抽屉）----
var _favTagPickerId = null;

function openFavTagPicker(id){
  var f = favItems.find(function(x){return x.id===id;});
  if(!f) return;
  _favTagPickerId = id;
  _renderFavTagPickerList(f);
  var ov = document.getElementById('favTagPickerOv');
  ov.style.display = 'flex';
  navPush('favTagPickerOv');
}

function _renderFavTagPickerList(f){
  var list = document.getElementById('favTagPickerList');
  var hint = document.getElementById('favTagPickerHint');
  if(!list) return;
  var itemTags = f.tags || [];
  if(favTags.length === 0){
    list.innerHTML = '<span style="font-size:12px;color:var(--text2);padding:6px 0">还没有分类，请先点筛选栏上的"新建"创建一个分类</span>';
    if(hint) hint.style.display = 'none';
    return;
  }
  if(hint) hint.style.display = '';
  list.innerHTML = favTags.map(function(t){
    var sel = itemTags.includes(t);
    return '<span class="tag'+(sel?' act':'')+'" data-ptag="'+esc(t)+'" onclick="_toggleFavItemTag(this)" style="font-size:12px;padding:8px 16px">'+
      (sel?'<i class="fas fa-check" style="font-size:9px;margin-right:4px;opacity:.8"></i>':'')+esc(t)+'</span>';
  }).join('');
}

function _toggleFavItemTag(el){
  var f = favItems.find(function(x){return x.id===_favTagPickerId;});
  if(!f) return;
  var tag = el.dataset.ptag;
  if(!f.tags) f.tags = [];
  var idx = f.tags.indexOf(tag);
  if(idx >= 0){ f.tags.splice(idx, 1); }
  else { f.tags.push(tag); }
  sv('bj_favItems', favItems);
  _renderFavTagPickerList(f);
}

function closeFavTagPicker(){
  navPop('favTagPickerOv');
  var ov = document.getElementById('favTagPickerOv');
  if(ov) ov.style.display = 'none';
  _favTagPickerId = null;
  renderFavList();
}

// ---- 创建分类 ----
function createFavTag(){
  showInp('新建分类', '输入分类名称（不能含引号）...', function(name){
    name = name.trim().replace(/['"]/g, '');
    if(!name){ showToast('分类名不能为空'); return; }
    if(favTags.includes(name)){ showToast('该分类已存在'); return; }
    favTags.push(name);
    sv('bj_favTags', favTags);
    renderFavList();
    showToast('分类「'+name+'」已创建');
  });
}

// ---- 管理分类（重命名/删除，长按触发）----
function openFavTagMgr(tag){
  var existing = document.getElementById('_favTagMgrOv');
  if(existing) existing.remove();
  var ov = document.createElement('div');
  ov.id = '_favTagMgrOv';
  ov.style.cssText = 'display:flex;position:fixed;inset:0;z-index:9600;background:rgba(0,0,0,.55);align-items:flex-end;justify-content:center';
  ov.onclick = function(e){ if(e.target === ov) ov.remove(); };
  ov.innerHTML =
    '<div style="background:var(--card);border-radius:20px 20px 0 0;padding:20px 20px 34px;width:100%;max-width:520px">'+
    '<div style="font-size:14px;font-weight:700;margin-bottom:16px;color:var(--text);display:flex;align-items:center;gap:6px">'+
    '<i class="fas fa-tag" style="color:var(--accent2)"></i> 管理分类「'+esc(tag)+'」</div>'+
    '<button id="_fmrBtn" style="width:100%;padding:13px;border-radius:13px;background:var(--bg);color:var(--text);border:1px solid var(--border);font-size:13px;font-weight:600;cursor:pointer;margin-bottom:10px;display:flex;align-items:center;gap:10px">'+
    '<i class="fas fa-pencil-alt" style="color:var(--accent2)"></i>重命名</button>'+
    '<button id="_fmdBtn" style="width:100%;padding:13px;border-radius:13px;background:rgba(255,107,107,.07);color:var(--danger);border:1px solid rgba(255,107,107,.22);font-size:13px;font-weight:600;cursor:pointer;margin-bottom:10px;display:flex;align-items:center;gap:10px">'+
    '<i class="fas fa-trash-alt"></i>删除分类</button>'+
    '<button id="_fmcBtn" style="width:100%;padding:13px;border-radius:13px;background:transparent;color:var(--text2);border:none;font-size:13px;cursor:pointer">取消</button>'+
    '</div>';
  document.body.appendChild(ov);
  document.getElementById('_fmrBtn').onclick = function(){ ov.remove(); renameFavTag(tag); };
  document.getElementById('_fmdBtn').onclick = function(){ ov.remove(); deleteFavTag(tag); };
  document.getElementById('_fmcBtn').onclick = function(){ ov.remove(); };
}

function renameFavTag(oldName){
  showInp('重命名分类', '输入新名称（不能含引号）...', function(newName){
    newName = newName.trim().replace(/['"]/g, '');
    if(!newName){ showToast('名称不能为空'); return; }
    if(favTags.includes(newName)){ showToast('该名称已存在'); return; }
    var idx = favTags.indexOf(oldName);
    if(idx >= 0) favTags[idx] = newName;
    sv('bj_favTags', favTags);
    // 同步更新所有收藏项里的旧标签名
    favItems.forEach(function(f){
      if(!f.tags) return;
      var i = f.tags.indexOf(oldName);
      if(i >= 0) f.tags[i] = newName;
    });
    sv('bj_favItems', favItems);
    if(favActiveTag === oldName) favActiveTag = newName;
    renderFavList();
    showToast('已重命名为「'+newName+'」');
  });
}

function deleteFavTag(tag){
  showDlg('删除分类',
    '确定删除分类「'+tag+'」？\n\n该分类下的收藏不会被删除，只是取消标注。',
    function(){
      favTags = favTags.filter(function(t){ return t !== tag; });
      sv('bj_favTags', favTags);
      favItems.forEach(function(f){
        if(f.tags) f.tags = f.tags.filter(function(t){ return t !== tag; });
      });
      sv('bj_favItems', favItems);
      if(favActiveTag === tag) favActiveTag = '';
      renderFavList();
      showToast('分类「'+tag+'」已删除');
    }, true);
}
// ==================== 快捷短语收藏 ====================
let savedPhrases=ld('bj_savedPhrases',[]);
let genTemplates=ld('bj_genTemplates',[]); // [{id,name,desc,charPresetName,worldPresetIdx,stylePresetIdx,rulePresetIdx,banPresetIdx,temp,tags}]
// 兼容旧数据：如果旧数据是字符串数组，自动升级为对象数组
if(savedPhrases.length>0&&typeof savedPhrases[0]==='string'){
  savedPhrases=savedPhrases.map(function(s){return{title:'',content:s};});
  sv('bj_savedPhrases',savedPhrases);
}
if(savedPhrases.length===0){
  savedPhrases=[
    {title:'心理描写',content:'文风细腻，注重心理描写，通过行为和微表情折射内心'},
  {title:'感官细节',content:'多写感官细节（声音、气味、触感、温度），让场景可感知'},
  {title:'口语对话',content:'对话口语化，每个角色说话方式要有辨识度，避免书面腔'},
  {title:'快节奏',content:'节奏快一些，减少冗余描写，每段都要有情节推进'},
  {title:'留悬念',content:'结尾要有悬念，让读者想继续看下去'},
  {title:'甜蜜向',content:'保持甜蜜氛围，不要虐，让读者感到温暖'},
  {title:'氛围感',content:'加入环境描写烘托气氛，让场景有画面感'},
  {title:'字数加长',content:'这一段内容偏短，请在保持原意的前提下适当扩写，丰富细节'},
  {title:'精简压缩',content:'这段有些冗余，请精简到核心，删掉废话但保留情绪'},
  {title:'加强冲突',content:'当前冲突感不足，请强化双方的对立和张力'},
  {title:'换个视角',content:'尝试从另一个角色的视角来重写这段，看看效果'},
  {title:'加环境描写',content:'当前缺乏场景感，请补充时间、地点、天气、光线等环境元素'},
  {title:'强化结尾',content:'本章结尾力度不足，请改写得更有收尾感或更有钩子'},
  {title:'控制篇幅',content:'请控制在800字以内，精炼表达，不要水字数'}
];
  sv('bj_savedPhrases',savedPhrases);
}
let phraseEditMode=false;

function openPhraseModal(){
  phraseEditMode=false;
  renderPhraseListModal();
  document.getElementById('phraseModalOv').classList.add('show');
  navPush('phraseModalOv');
}

function closePhraseModal(){
  phraseEditMode=false;
  document.getElementById('phraseModalOv').classList.remove('show');
}

function renderPhraseListModal(){
  var container=document.getElementById('phraseListModal');
  if(!container)return;
  
  // 清空容器，重新构建
  container.innerHTML='';
  
  // 1. 渲染所有短语（如果有的话）
  if(savedPhrases.length===0){
    // 没有短语时显示提示信息
    var emptyMsg=document.createElement('div');
    emptyMsg.style.cssText='width:100%;text-align:center;padding:30px;color:var(--text2);font-size:12px';
    emptyMsg.textContent='还没有保存的短语\n在下方按钮添加常用短语';
    container.appendChild(emptyMsg);
  } else {
    // 有短语，逐个渲染
    savedPhrases.forEach(function(phrase,idx){
      var p=typeof phrase==='string'?{title:'',content:phrase}:phrase;
      var chip=document.createElement('div');
      chip.style.cssText='display:flex;flex-direction:column;padding:10px 14px;border-radius:12px;border:1px solid var(--border);background:linear-gradient(135deg,var(--card),rgba(108,92,231,.03));cursor:pointer;transition:all .25s;position:relative;min-width:0;max-width:100%;box-sizing:border-box';
      
      var titleHtml=p.title?'<div style="font-size:11px;font-weight:700;color:var(--accent2);margin-bottom:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+esc(p.title)+'</div>':'';
      var contentPreview=p.content.length>40?p.content.substring(0,40)+'...':p.content;
      chip.innerHTML=titleHtml+'<div style="font-size:12px;color:var(--text);line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">'+esc(contentPreview)+'</div>';
      
      if(phraseEditMode){
        chip.innerHTML+='<div style="position:absolute;top:-6px;right:-6px;width:20px;height:20px;border-radius:50%;background:var(--danger);color:#fff;font-size:11px;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 2px 6px rgba(255,107,107,.4);z-index:2;line-height:1" onclick="event.stopPropagation();confirmDeletePhrase('+idx+',this.parentElement)"><i class="fas fa-times"></i></div>';
      }

      chip.onclick=function(e){
        if(phraseEditMode){
          openEditPhraseDialog(idx);
          return;
        }
        insertPhraseToSearch(p.content);
      };

      // 长按编辑
      var lpTimer=null;
      var moved=false;
      var sx=0,sy=0;
      chip.addEventListener('touchstart',function(e){
        moved=false;
        if(e.touches.length>0){sx=e.touches[0].clientX;sy=e.touches[0].clientY;}
        lpTimer=setTimeout(function(){
          if(moved)return;
          try{if(navigator.vibrate)navigator.vibrate(30);}catch(e){}
          openEditPhraseDialog(idx);
        },500);
      },{passive:true});
      chip.addEventListener('touchmove',function(e){
        if(e.touches.length>0){
          if(Math.abs(e.touches[0].clientX-sx)>10||Math.abs(e.touches[0].clientY-sy)>10){
            moved=true;clearTimeout(lpTimer);
          }
        }
      },{passive:true});
      chip.addEventListener('touchend',function(){clearTimeout(lpTimer);});
      chip.addEventListener('touchcancel',function(){clearTimeout(lpTimer);});
      chip.addEventListener('contextmenu',function(e){
        e.preventDefault();
        openEditPhraseDialog(idx);
      });

      container.appendChild(chip);
    });
  }
  
  // 2. 始终渲染按钮行（添加短语 + 管理短语）
  var btnRow=document.createElement('div');
  btnRow.style.cssText='display:flex;gap:8px;width:100%;margin-top:16px';
  
  var addBtn=document.createElement('div');
  addBtn.style.cssText='flex:1;display:flex;align-items:center;justify-content:center;padding:10px 14px;border-radius:12px;border:1px solid var(--accent);background:rgba(108,92,231,.08);color:var(--accent2);cursor:pointer;font-size:12px;transition:all .2s;font-weight:600';
  addBtn.textContent='＋ 添加短语';
  addBtn.onclick=function(){
    openAddPhraseDialog();
  };
  btnRow.appendChild(addBtn);
  
  var editBtn=document.createElement('div');
  editBtn.style.cssText='flex:1;display:flex;align-items:center;justify-content:center;padding:10px 14px;border-radius:12px;border:1px dashed '+(phraseEditMode?'var(--accent)':'var(--border)')+';color:'+(phraseEditMode?'var(--accent2)':'var(--text2)')+';cursor:pointer;font-size:12px;transition:all .2s';
  editBtn.innerHTML=phraseEditMode?'<i class="fas fa-check"></i> 完成编辑':'<i class="fas fa-pen"></i> 管理短语';
  editBtn.onclick=function(){
    phraseEditMode=!phraseEditMode;
    renderPhraseListModal();
  };
  btnRow.appendChild(editBtn);
  
  container.appendChild(btnRow);
}

function confirmDeletePhrase(idx,chipEl){
  if(idx<0||idx>=savedPhrases.length)return;
  var p=typeof savedPhrases[idx]==='string'?savedPhrases[idx]:savedPhrases[idx].content;
  var label=p.length>20?p.substring(0,20)+'...':p;
  showDlg('删除短语','确定要删除「'+label+'」吗？',function(){
    savedPhrases.splice(idx,1);
    sv('bj_savedPhrases',savedPhrases);
    // 如果编辑弹窗打开中，先关闭
    try{closeInp();}catch(e){}try{restoreInpField();}catch(e2){}
    renderPhraseListModal();
    showToast('短语已删除');
  },true);
}

function deletePhraseAnim(idx,delBtn){
  if(idx<0||idx>=savedPhrases.length)return;
  savedPhrases.splice(idx,1);
  sv('bj_savedPhrases',savedPhrases);
  renderPhraseListModal();
  showToast('短语已删除');
}

function insertPhraseToSearch(phrase){
  const input=document.getElementById('searchInput');
  if(!input)return;
  const cur=input.value.trim();
  if(cur){
    input.value=cur+'，'+phrase;
  }else{
    input.value=phrase;
  }
  document.getElementById('searchClear').style.display='flex';
  updateGenBtnState();
  showToast('已插入：'+phrase);
}
function openAddPhraseDialog(){
  var ov=document.getElementById('inpOv');
  document.getElementById('inpTitle').textContent='＋ 添加快捷短语';
  
  var box=document.getElementById('inpField').parentElement;
  var oldField=document.getElementById('inpField');
  
  var container=document.createElement('div');
  container.id='inpField';
  container.style.cssText='display:flex;flex-direction:column;gap:10px;width:100%;margin-bottom:13px';
  container.innerHTML=
    '<div>'+
      '<label style="display:block;font-size:11px;color:var(--text2);margin-bottom:4px;font-weight:500">标题（可选，最多10字）</label>'+
      '<input id="newPhraseTitle" style="width:100%;padding:9px 13px;border-radius:9px;border:1px solid var(--border);background:var(--bg);color:var(--text);font-size:12px;outline:none;box-sizing:border-box" placeholder="如：心理描写、快节奏..." maxlength="10">'+
    '</div>'+
    '<div>'+
      '<label style="display:block;font-size:11px;color:var(--text2);margin-bottom:4px;font-weight:500">内容（必填'+(noDescLimit?''+'，不限字数':''+'，最多500字')+')  </label>'+
      '<textarea id="newPhraseContent" style="width:100%;padding:9px 13px;border-radius:9px;border:1px solid var(--border);background:var(--bg);color:var(--text);font-size:12px;outline:none;min-height:80px;resize:vertical;font-family:inherit;line-height:1.6;box-sizing:border-box" placeholder="输入短语内容..." '+(noDescLimit?'':'maxlength="500"')+'></textarea>'+
      '<div style="font-size:10px;color:var(--text2);text-align:right;margin-top:4px" id="newPhraseCount">0'+(noDescLimit?' 字':'/500')+'</div>'+
    '</div>';
  
  oldField.replaceWith(container);
  
  setTimeout(function(){
    var contentTa=document.getElementById('newPhraseContent');
    if(contentTa){
      contentTa.oninput=function(){
        var c=document.getElementById('newPhraseCount');
        if(noDescLimit){
          if(c)c.textContent=this.value.length+' 字';
        } else {
          if(c)c.textContent=this.value.length+'/500';
          if(this.value.length>500){this.value=this.value.substring(0,500);try{if(navigator.vibrate)navigator.vibrate(10);}catch(e){}}
        }
      };
    }
    var titleInput=document.getElementById('newPhraseTitle');
    if(titleInput){
      titleInput.oninput=function(){
        if(this.value.length>10){this.value=this.value.substring(0,10);try{if(navigator.vibrate)navigator.vibrate(10);}catch(e){}}
      };
      titleInput.focus();
    }
  },50);
  
  document.getElementById('inpOkBtn').textContent='保存';
  document.getElementById('inpOkBtn').onclick=function(){
    var title=(document.getElementById('newPhraseTitle').value||'').trim();
    var content=(document.getElementById('newPhraseContent').value||'').trim();
    if(!content){showToast('内容不能为空');return;}
    if(!noDescLimit && content.length>500){showToast('内容最多500字');return;}
    if(title.length>10){showToast('标题最多10字');return;}
    var exists=savedPhrases.some(function(p){var c=typeof p==='string'?p:p.content;return c===content;});
    if(exists){showToast('这条短语已存在');return;}
    savedPhrases.push({title:title,content:content});
    sv('bj_savedPhrases',savedPhrases);
    closeInp();
    restoreInpField();
    renderPhraseListModal();
    showToast('短语已保存');
  };
  
  var cancelBtn=ov.querySelector('.dlg-cancel');
  cancelBtn.onclick=function(){
    closeInp();
    restoreInpField();
  };
  
  ov.classList.add('show');
  navPush('inpOv');
}
function addPhraseFromModal(){
  var input=document.getElementById('phraseAddInputModal');
  var val=(input.value||'').trim();
  if(!val){showToast('请输入短语内容');return;}
  if(val.length>100){showToast('短语内容最多100个字');return;}
  var exists=savedPhrases.some(function(p){
    var c=typeof p==='string'?p:p.content;
    return c===val;
  });
  if(exists){showToast('这条短语已存在');return;}
  savedPhrases.push({title:'',content:val});
  sv('bj_savedPhrases',savedPhrases);
  input.value='';
  renderPhraseListModal();
  showToast('短语已保存');
}

function openEditPhraseDialog(idx){
  if(idx<0||idx>=savedPhrases.length)return;
  var p=typeof savedPhrases[idx]==='string'?{title:'',content:savedPhrases[idx]}:savedPhrases[idx];
  
  var ov=document.getElementById('inpOv');
  document.getElementById('inpTitle').textContent='编辑短语';
  
  var box=document.getElementById('inpField').parentElement;
  var oldField=document.getElementById('inpField');
  
  var container=document.createElement('div');
  container.id='inpField';
  container.style.cssText='display:flex;flex-direction:column;gap:10px;width:100%;margin-bottom:13px';
  container.innerHTML=
    '<div>'+
      '<label style="display:block;font-size:11px;color:var(--text2);margin-bottom:4px;font-weight:500">标题（可选，最多10字）</label>'+
      '<input id="phraseEditTitle" style="width:100%;padding:9px 13px;border-radius:9px;border:1px solid var(--border);background:var(--bg);color:var(--text);font-size:12px;outline:none;box-sizing:border-box" placeholder="如：心理描写、快节奏..." maxlength="10" value="'+esc(p.title||'')+'">'+
    '</div>'+
    '<div>'+
      '<label style="display:block;font-size:11px;color:var(--text2);margin-bottom:4px;font-weight:500">内容'+(noDescLimit?'（不限字数）':'（最多500字）')+'</label>'+
      '<textarea id="phraseEditContent" style="width:100%;padding:9px 13px;border-radius:9px;border:1px solid var(--border);background:var(--bg);color:var(--text);font-size:12px;outline:none;min-height:80px;resize:vertical;font-family:inherit;line-height:1.6;box-sizing:border-box" placeholder="输入短语内容..." '+(noDescLimit?'':'maxlength="500"')+'>'+esc(p.content||'')+'</textarea>'+
      '<div style="font-size:10px;color:var(--text2);text-align:right;margin-top:4px" id="phraseEditCount">'+(p.content||'').length+(noDescLimit?' 字':'/500')+'</div>'+
    '</div>'+
    '<button onclick="event.preventDefault();confirmDeletePhrase('+idx+',null)" style="padding:8px;border-radius:9px;border:1px solid rgba(255,107,107,.3);background:transparent;color:var(--danger);font-size:11px;cursor:pointer;width:100%"><i class="fas fa-trash-alt"></i> 删除这条短语</button>';
  
  oldField.replaceWith(container);
  
  setTimeout(function(){
    var contentTa=document.getElementById('phraseEditContent');
    if(contentTa){
      contentTa.oninput=function(){
        var c=document.getElementById('phraseEditCount');
        if(noDescLimit){
          if(c)c.textContent=this.value.length+' 字';
        } else {
          if(c)c.textContent=this.value.length+'/500';
          if(this.value.length>500){
            this.value=this.value.substring(0,500);
            try{if(navigator.vibrate)navigator.vibrate(10);}catch(e){}
          }
        }
      };
    }
    var titleInput=document.getElementById('phraseEditTitle');
    if(titleInput){
      titleInput.oninput=function(){
        if(this.value.length>10){
          this.value=this.value.substring(0,10);
          try{if(navigator.vibrate)navigator.vibrate(10);}catch(e){}
        }
      };
    }
  },50);
  
  document.getElementById('inpOkBtn').textContent='保存';
  document.getElementById('inpOkBtn').onclick=function(){
    var title=(document.getElementById('phraseEditTitle').value||'').trim();
    var content=(document.getElementById('phraseEditContent').value||'').trim();
    if(!content){showToast('内容不能为空');return;}
    if(!noDescLimit && content.length>500){showToast('内容最多500字');return;}
    if(title.length>10){showToast('标题最多10字');return;}
    savedPhrases[idx]={title:title,content:content};
    sv('bj_savedPhrases',savedPhrases);
    closeInp();
    restoreInpField();
    renderPhraseListModal();
    showToast('短语已更新');
  };
  
  var cancelBtn=ov.querySelector('.dlg-cancel');
  cancelBtn.onclick=function(){
    closeInp();
    restoreInpField();
  };
  
  ov.classList.add('show');
  navPush('inpOv');
}

// 获取短语列表HTML（用于嵌入到其他弹窗，如长按编辑描述弹窗）
function getPhraseChipsHtml(targetId){
  if(savedPhrases.length===0)return'';
  var bodyId='phraseFoldBody_'+targetId;
  // 折叠栏：默认收起；展开后列表限高可滚动，不会把上方输入框和下方按钮挤出弹窗
  var html='<div class="phrase-fold">'+
    '<button type="button" class="phrase-fold-hdr" aria-expanded="false" aria-controls="'+bodyId+'" onclick="togglePhraseFold(this)">'+
    '<span><i class="fas fa-comment-dots"></i> 快捷短语（'+savedPhrases.length+'）</span><i class="fas fa-chevron-down phrase-fold-ico"></i></button>'+
    '<div class="phrase-fold-body" id="'+bodyId+'" hidden><div class="phrase-fold-list">';
  savedPhrases.forEach(function(phrase,i){
    var p=typeof phrase==='string'?{title:'',content:phrase}:phrase;
    var label=p.title||p.content.substring(0,15);
    html+='<span class="phrase-chip" onclick="insertPhraseToTarget(\''+targetId+'\','+i+')" style="font-size:11px;padding:5px 10px" title="'+esc(p.content)+'">'+esc(label)+'</span>';
  });
  html+='</div></div></div>';
  return html;
}

function togglePhraseFold(btn){
  if(!btn||!btn.nextElementSibling)return;
  var body=btn.nextElementSibling;
  var willOpen=body.hasAttribute('hidden');
  if(willOpen)body.removeAttribute('hidden');else body.setAttribute('hidden','');
  btn.setAttribute('aria-expanded',willOpen?'true':'false');
  btn.classList.toggle('open',willOpen);
}

function insertPhraseToTarget(targetId,phraseIdx){
  if(phraseIdx<0||phraseIdx>=savedPhrases.length)return;
  var p=typeof savedPhrases[phraseIdx]==='string'?savedPhrases[phraseIdx]:savedPhrases[phraseIdx].content;
  var el=document.getElementById(targetId);
  if(!el)return;
  var cur=(el.value||'').trim();
  if(cur){
    el.value=cur+'，'+p;
  }else{
    el.value=p;
  }
  el.focus();
  showToast('已插入：'+(p.length>20?p.substring(0,20)+'...':p));
}
function updateGenBtnState(){
  const btn=document.getElementById('btnGen');
  const input=document.getElementById('searchInput');
  const hasInput=input&&input.value.trim().length>0;
  const hasTags=selTags.length>0;
  if(!isGen){
    btn.style.opacity=(hasInput||hasTags)?'1':'0.7';
  }
}
function handleGenBtn(){
if(_btnClickLock){return;}
_btnClickLock=true;setTimeout(function(){_btnClickLock=false;},1000);
if(isGen&&abortCtrl){
showDlg('停止生成', '确定要停止当前生成吗？', () => {
  abortCtrl.abort();
  setIsGen(false);
  const btn = document.getElementById('btnGen');
  btn.disabled = false; btn.innerHTML = '<i class="fas fa-wand-magic-sparkles"></i> 生成';
  btn.style.background = ''; btn.style.minWidth = '';
  showToast('已停止生成');
}, true);
return;
}
if(genConfirm){
  var searchVal=(document.getElementById('searchInput').value||'').trim();
  var tagVal=selTags.join(' ');
  var desc=searchVal||tagVal||'随机生成';
  if(desc.length>30)desc=desc.substring(0,30)+'...';
  showDlg('确认生成','确定要生成「'+desc+'」吗？\n\n类型：'+(curType==='long'?'长篇连载':'短篇一发'),function(){
    generateArticle();
  });
  return;
}
generateArticle();
}
// 快速质量检查
// 设定一致性检查
function checkSettingConsistency(text){
const issues=[];
if(!text||text.length<50)return issues;

// 检查核心角色名字是否出现
const coreChars=characters.filter(c=>c.name&&c.priority==='核心');
coreChars.forEach(c=>{
if(!text.includes(c.name)){
issues.push('核心角色「'+c.name+'」未在本章出现');
}
});

// 检查禁用词是否出现
const globalBD=(document.getElementById('globalBanWordsInput')&&document.getElementById('globalBanWordsInput').value||globalBanWords||'').trim();
const localBD=(document.getElementById('banWordsInput')&&document.getElementById('banWordsInput').value||banWords||'').trim();
const allBan=[globalBD,localBD].filter(Boolean).join('\n');
if(allBan){
const banList=allBan.split('\n').map(w=>w.trim()).filter(w=>w);
banList.forEach(w=>{
const count=(text.match(new RegExp(escapeRegExp(w),'g'))||[]).length;
if(count>0)issues.push('禁用词「'+w+'」出现了'+count+'次');
});
}

// 检查世界观关键词冲突
const worldText=(document.getElementById('worldDesc')&&document.getElementById('worldDesc').value||'')+(document.getElementById('globalWorldDesc')&&document.getElementById('globalWorldDesc').value||'');
if(worldText.includes('古代')||worldText.includes('宫廷')||worldText.includes('王朝')){
const modernWords=['手机','电脑','汽车','地铁','网络','微信','APP','WiFi'];
modernWords.forEach(w=>{
if(text.includes(w))issues.push('古代背景出现现代词汇「'+w+'」');
});
}
if(worldText.includes('现代')||worldText.includes('都市')){
const ancientWords=['本宫','皇上','奴婢','微臣','圣旨'];
ancientWords.forEach(w=>{
if(text.includes(w))issues.push('现代背景出现古代词汇「'+w+'」');
});
}

return issues;
}
function quickQualityCheck(text){
const issues=[];
const suggestions=[];
if(!text||text.length<100)return {issues,suggestions,score:100};
// 检查万能副词
const badAdverbs={'不禁':0,'缓缓':0,'淡淡':0,'微微':0,'默默':0,'静静':0,'轻轻':0};
Object.keys(badAdverbs).forEach(w=>{
const matches=text.match(new RegExp(escapeRegExp(w),'g'));
if(matches)badAdverbs[w]=matches.length;
});
const adverbTotal=Object.values(badAdverbs).reduce((a,b)=>a+b,0);
if(adverbTotal>=5){
const worst=Object.entries(badAdverbs).filter(([k,v])=>v>=2).map(([k,v])=>'「'+k+'」'+v+'次').join('、');
issues.push('万能副词过多：'+worst);
suggestions.push('试试删掉这些副词，直接描写动作和状态');
}

// 检查重复句式开头
const paras=text.split(/\n+/).filter(p=>p.trim());
if(paras.length>=5){
const starts={};
paras.forEach(p=>{
const start=p.trim().substring(0,2);
if(start)starts[start]=(starts[start]||0)+1;
});
Object.entries(starts).forEach(([k,v])=>{
if(v>=4){
issues.push('句首「'+k+'」重复'+v+'次，节奏单调');
}
});
if(Object.values(starts).some(v=>v>=4)){
suggestions.push('尝试用对话、动作、环境描写交替开头');
}
}

// 检查对话占比
const dialogCount=(text.match(/[「""][^「""」]+[」""]/g)||[]).length;
const totalParas=paras.length;
if(totalParas>8&&dialogCount<2){
issues.push('对话较少，人物互动不足');
suggestions.push('加入一些对话，让人物"活"起来');
}else if(totalParas>5&&dialogCount>totalParas*0.7){
issues.push('对话占比过高，缺少叙述和描写');
suggestions.push('在对话间穿插动作、表情、环境描写');
}

// 检查感官描写
const senseWords=['听到','闻到','触感','温度','气味','声音','光线','阴影','冰凉','温热'];
let senseCount=0;
senseWords.forEach(w=>{if(text.includes(w))senseCount++;});
if(text.length>500&&senseCount<2){
suggestions.push('可以增加一些感官细节（声音、气味、触感）');
}

// 计算质量分数
let score=100;
score-=issues.length*15;
score-=Math.max(0,adverbTotal-3)*5;
score=Math.max(0,Math.min(100,score));

return {issues,suggestions,score};
}
async function generateArticle(){
if(!checkApiCooldown())return;
if(isGen||AppState.isGen){showToast('正在生成中，请稍候...');return;}
const cfg=getCurApi();
if(!cfg.url||!cfg.key){showToast('请先在底部「设置」→「API设置」中填写地址和密钥',4000);return;}
// 生成前检查设定冲突
const conflicts=checkSettingConflicts();
if(conflicts.length>0){
showToastForce('检测到设定问题：'+conflicts[0],4000);
}
if(isGen){
showToast('正在生成中，请稍候...');
return;
}
const searchText=(document.getElementById('searchInput').value||'').trim();
const activeTags=selTags.join(' ');
const type=curType;

let userMsg='';
if(type==='long'){
userMsg+='【创作任务】写一部长篇小说的第一章\n\n';
userMsg+='第一章的使命：\n';
userMsg+='• 用一个抓人的开场切入——可以是一个悬念、一个反常的瞬间、一句意味深长的对话\n';
userMsg+='• 让主角在行动中登场，而不是用旁白介绍\n';
userMsg+='• 建立故事的基调和氛围\n';
userMsg+='• 埋下一两个让读者好奇的种子\n';
userMsg+='• 结尾制造一个"非看下一章不可"的钩子\n\n';
}else{
userMsg+='【创作任务】写一篇完整的短篇小说\n\n';
userMsg+='短篇的精髓是"以小见大"：\n';
userMsg+='• 聚焦一个核心事件或决定性的瞬间\n';
userMsg+='• 人物不需要多，但每个都要鲜活立体\n';
userMsg+='• 结尾要有余韵——可以是反转、可以是留白、可以是一个意象\n';
userMsg+='• 好的短篇读完会让人沉默几秒\n\n';
}

if(searchText){
userMsg+='【故事方向】\n'+searchText+'\n';
userMsg+='（这是灵感种子，请在此基础上自由生长，不必照搬）\n\n';
}

if(activeTags){
userMsg+='【氛围标签】'+activeTags+'\n\n';
}

if(!searchText&&!activeTags){
userMsg+='请根据人设和世界观自由发挥，写一个让你自己也想继续读下去的故事。\n\n';
}
const mW2=parseInt(document.getElementById('minWords').value)||800;
userMsg+='\n\n【输出格式——违反即废稿，没有例外】\n';
userMsg+='你的输出必须严格按以下结构，多一个字少一个字都不行：\n';
userMsg+='第1行：标题（2-20个汉字，纯文字，不加书名号、序号、标点、引号、"标题："等前缀）\n';
userMsg+='第2行：空行（什么都不写）\n';
userMsg+='第3行起：正文（直接开始叙述或对话，不写"正文"二字）\n\n';
userMsg+='【绝对禁止】\n';
userMsg+='× 在标题前写任何文字（如"好的""以下是""标题："）\n';
userMsg+='× 在正文后附加说明（如"注：""创作思路""写作说明"）\n';
userMsg+='× 使用markdown格式（不要```代码块、不要#标题、不要**加粗**）\n';
userMsg+='× 输出章节编号（不要写"第一章"）\n\n';
userMsg+='【字数硬性要求】正文不少于'+mW2+'字，建议写到'+(mW2+500)+'字以上，宁多勿少。';

setIsGen(true);
const btn=document.getElementById('btnGen');
btn.disabled=true;
btn.innerHTML='<i class="fas fa-stop"></i> 停止';btn.disabled=false;btn.style.minWidth='70px';btn.style.background='var(--danger)';

const messages=[{role:'system',content:buildSysPrompt()},{role:'user',content:userMsg}];
// 记录生成日志（短篇/长篇）
try{
  const apiCfg=getCurApi();
  addGenLog({
    kind:'workshop',
    type: (type==='long'?'long':'short'),
    title: (searchText||activeTags||'作坊生成').slice(0,40),
    articleId: '',
    api: apiCfg,
    messages: messages
  });
}catch(e){logError('op',e)}
const list=document.getElementById('articleList');

if(!useStream){
// 非流式模式
const result=await callAPINonStream(messages);
setIsGen(false);btn.disabled=false;btn.innerHTML='<i class="fas fa-wand-magic-sparkles"></i> 生成';btn.style.minWidth='';
btn.style.background='';
if(!result){renderArticles();return;}
let title2='',content2=result;
const lines2=result.split(/\n/);
for(let i=0;i<Math.min(5,lines2.length);i++){
const l=lines2[i].trim();
if(!l)continue;
if(l.length>0&&l.length<50&&!l.startsWith('　')&&!l.startsWith('"')&&!l.startsWith('"')&&!l.startsWith('「')&&!l.startsWith('——')&&!l.startsWith('…')&&!/^[　\s]*[，。、！？：；]/.test(l)){
title2=l.replace(/^[#*《「【\s:：标题]+/,'').replace(/[》」】\s]+$/,'').trim();
content2=lines2.slice(i+1).join('\n').trim();
break;
}
}
if(!title2||title2.length>35)title2=(searchText||activeTags||'随机故事').substring(0,20);
const article2={
id:uid(),title:title2,type,tags:[...selTags],
createdAt:new Date().toISOString(),
chapters:type==='long'?[content2]:undefined,
content:type==='short'?content2:undefined,
prompt:searchText
};
ws.unshift(article2);sv(K.ws,ws);
try{if(genVibrate&&navigator.vibrate)navigator.vibrate([50,30,50]);}catch(e){}
renderArticles();showToast('创作完成！');
return;
}

// 流式模式
const streamCard=document.createElement('div');
streamCard.className='stream-card';
streamCard.id='streamCard';
const startTime=Date.now();
streamCard.innerHTML=
'<div class="stream-title"><span class="ldots"><span></span><span></span><span></span></span> 正在创作中...</div>'+
'<div class="stream-body" id="streamBody"></div>'+
'<div class="stream-info"><span id="streamWc">0 字</span><span id="streamTime">0s</span></div>';
list.insertBefore(streamCard,list.firstChild);

let timeInterval=setInterval(()=>{
const el=document.getElementById('streamTime');
if(el)el.textContent=((Date.now()-startTime)/1000).toFixed(0)+'s';
},1000);

const _wsMinW=parseInt(document.getElementById('minWords').value)||800;
const _wsDynTok=Math.max(getCurApi().maxTokens||4096,Math.ceil(_wsMinW*2)+1000);
await callAPIStream(messages,
(fullText,chunk)=>{
const body=document.getElementById('streamBody');
if(body)body.textContent=fullText;
const wc=document.getElementById('streamWc');
if(wc)wc.textContent=countWords(fullText)+' 字';
if(body)body.scrollTop=body.scrollHeight;
// 后台任务信息（作坊生成时articleId还没有，用临时标记）
if(_bgTaskInfo && !_bgTaskInfo.articleId) _bgTaskInfo.articleId = '_workshop_temp';
},
(fullText)=>{
clearInterval(timeInterval);
setIsGen(false);btn.disabled=false;btn.innerHTML='<i class="fas fa-wand-magic-sparkles"></i> 生成';btn.style.minWidth='';
btn.style.background='';
const sc=document.getElementById('streamCard');
if(sc)sc.remove();
if(!fullText){
  renderArticles();
  showToast('AI 未返回任何内容，请检查 API 设置或重试', 4000);
  return;
}
let title='',content=fullText;
const lines=fullText.split(/\n/);
let titleLine='';
for(let i=0;i<Math.min(5,lines.length);i++){
const l=lines[i].trim();
if(!l)continue;
if(l.length>0&&l.length<50&&!l.startsWith('　')&&!l.startsWith('"')&&!l.startsWith('"')&&!l.startsWith('「')&&!l.startsWith('——')&&!l.startsWith('…')&&!/^[　\s]*[，。、！？：；]/.test(l)){
titleLine=l;
content=lines.slice(i+1).join('\n').trim();
break;
}
}
title=titleLine.replace(/^[#*《「【\s:：标题]+/,'').replace(/[》」】\s]+$/,'').trim();
if(!title||title.length>35)title=(searchText||activeTags||'随机故事').substring(0,20);
const article={
id:uid(),title,type,tags:[...selTags],
createdAt:new Date().toISOString(),
chapters:type==='long'?[content]:undefined,
content:type==='short'?content:undefined,
prompt:searchText
};
// 字数不足自动补写
const mWCheck=parseInt(document.getElementById('minWords').value)||800;
const actualWc=countWords(content);
// 只有实际字数 < 目标字数 × 0.7 才触发补写，否则仅提示
const shouldAutoExtend=contAutoExtend&&actualWc>200&&actualWc<mWCheck&&(actualWc<mWCheck*0.7);
const shouldHintOnly=contAutoExtend&&actualWc>200&&actualWc<mWCheck&&(actualWc>=mWCheck*0.7);
if(shouldAutoExtend){
showToast('字数不足('+actualWc+'/'+mWCheck+')，正在自动补写...',3000);
const extendMsg=[
{role:'system',content:buildSysPrompt()},
{role:'user',content:'以下是一篇未完成的文章，字数只有'+actualWc+'字，距离要求的'+mWCheck+'字还差'+(mWCheck-actualWc)+'字。\n【铁律】你续写的内容本身必须不少于'+(mWCheck-actualWc+300)+'字，确保补写后总字数超过'+mWCheck+'字，宁多勿少。\n请直接续写下去，不要重复已有内容，不要加任何标题或说明，直接输出续写的正文部分：\n\n'+content}
];
callAPINonStream(extendMsg,2,{maxTokens:Math.max(getCurApi().maxTokens||4096,Math.ceil((mWCheck-actualWc)*2.5)+800)}).then(function(extResult){
if(extResult){
content=content+'\n\n'+extResult;
if(type==='long'){article.chapters=[content];}
else{article.content=content;}
}
ws.unshift(article);
sv(K.ws,ws);
renderArticles();
const qc=quickQualityCheck(content);
const sc=checkSettingConsistency(content);
if(sc.length>0){
setTimeout(()=>{
showToastForce('设定问题：'+sc[0],4000);
},2000);
if(sc.length>1){
setTimeout(()=>{
showToastForce('还有：'+sc.slice(1).join('、'),4000);
},4500);
}
}
if(qc.issues.length>0||qc.suggestions.length>0){
showToast('创作完成！'+countWords(content)+'字 · 质量评分 '+qc.score+'/100',3000);
}else{
const genTime=((Date.now()-startTime)/1000).toFixed(1);
showToast('创作完成！'+countWords(content)+'字 · 用时'+genTime+'秒',3000);}});
}else if(shouldHintOnly){
// 字数略少（70%~100%之间），仅提示，不自动补写
ws.unshift(article);
sv(K.ws,ws);
renderArticles();
showToast('字数略少（'+actualWc+'/'+mWCheck+'字），建议手动扩充内容',4000);
}else{
ws.unshift(article);
sv(K.ws,ws);
renderArticles();
const qc=quickQualityCheck(content);

const sc=checkSettingConsistency(content);
if(sc.length>0){
setTimeout(()=>{
showToastForce('设定问题：'+sc[0],4000);
},2000);
if(sc.length>1){
setTimeout(()=>{
showToastForce('还有：'+sc.slice(1).join('、'),4000);
},4500);
}
}
if(qc.issues.length>0||qc.suggestions.length>0){
showToast('创作完成！'+countWords(content)+'字 · 质量评分 '+qc.score+'/100',3000);
if(qc.score<70&&qc.suggestions.length>0){
setTimeout(()=>{
showToast('建议：'+qc.suggestions[0],4000);
},1500);
}
}else{
showToast('创作完成！'+countWords(content)+'字',2500);
}
}
},
(errMsg)=>{
clearInterval(timeInterval);
setIsGen(false);btn.disabled=false;btn.innerHTML='<i class="fas fa-wand-magic-sparkles"></i> 生成';btn.style.minWidth='';
btn.style.background='';
const sc=document.getElementById('streamCard');
if(sc)sc.remove();
showToast('流式输出失败，尝试普通模式...',2000);
setTimeout(()=>generateNonStream(messages,type,searchText),500);
}
,{maxTokens:_wsDynTok});
}

// Non-stream fallback
async function generateNonStream(messages,type,searchText){
setIsGen(true);
const btn=document.getElementById('btnGen');
btn.disabled=true;
btn.innerHTML='<span class="ldots"><span></span><span></span><span></span></span>';

const mWCheck2=parseInt(document.getElementById('minWords').value)||800;
const fallbackMaxTokens=Math.max(getCurApi().maxTokens||4096,Math.ceil(mWCheck2*1.8)+800);
let result;
try{
result=await callAPINonStream(messages,2,{maxTokens:fallbackMaxTokens});
}catch(e){
console.error('[generateNonStream]',e);
result=null;
showToast('生成失败：'+e.message,4000);
}finally{
setIsGen(false);btn.disabled=false;btn.innerHTML='<i class="fas fa-wand-magic-sparkles"></i> 生成';btn.style.minWidth='';btn.style.background='';
}
if(!result)return;

let title='',content=result;
const lines=result.split(/\n/);
for(let i=0;i<Math.min(5,lines.length);i++){
const l=lines[i].trim();
if(!l)continue;
if(l.length>0&&l.length<35&&!l.startsWith('　')&&!l.startsWith('"')&&!l.startsWith('"')&&!l.startsWith('「')&&!l.startsWith('——')&&!l.startsWith('…')&&!l.includes('。')&&!l.includes('，')){
title=l.replace(/^[#*《「【\s:：标题]+/,'').replace(/[》」】\s]+$/,'').trim();
content=lines.slice(i+1).join('\n').trim();
break;
}
}
if(!title||title.length>35)title=(searchText||'随机故事').substring(0,20);

const article={
id:uid(),title,type,tags:[...selTags],
createdAt:new Date().toISOString(),
chapters:type==='long'?[content]:undefined,
content:type==='short'?content:undefined,
prompt:searchText
};
ws.unshift(article);sv(K.ws,ws);
renderArticles();showToast('创作完成！');
try{document.getElementById('articleList').scrollIntoView({behavior:'smooth',block:'start'});}catch(e){}
}

// ==================== READING ====================
function showChapterWordStats(){
if(!curRd||!curRd.chapters||!Array.isArray(curRd.chapters)){
showToast('没有章节数据');
return;
}
let msg='各章字数统计\n\n';
let total=0;
curRd.chapters.forEach((ch,i)=>{
const wc=countWords(ch||'');
total+=wc;
msg+='第'+(i+1)+'章：'+wc+'字\n';
});
msg+='\n总计：'+total+'字';
msg+='\n平均每章：'+Math.round(total/curRd.chapters.length)+'字';
showDlg('各章字数统计',msg,function(){});
}
function showDetailedWordStats(){
  if(!curRd){showToast('没有打开的文章');return;}
  var msg='详细字数统计\n\n';
  msg+='标题：'+(curRd.title||'未命名')+'\n';
  msg+='类型：'+(curRd.type==='long'?'长篇连载':'短篇')+'\n\n';
  var total=0;
  if(curRd.type==='long'&&curRd.chapters){
    msg+='━━━ 各章字数 ━━━\n';
    curRd.chapters.forEach(function(ch,i){
      var wc=countWords(ch||'');
      total+=wc;
      var readMin=Math.ceil(wc/500);
      var isCur=(i===curCh)?' ◀ 当前':'';
      msg+='第'+(i+1)+'章：'+wc+'字（约'+readMin+'分钟）'+isCur+'\n';
    });
    msg+='\n━━━ 汇总 ━━━\n';
    msg+='总字数：'+total+'字\n';
    msg+='总章数：'+curRd.chapters.length+'章\n';
    msg+='平均每章：'+Math.round(total/curRd.chapters.length)+'字\n';
    msg+='预估总阅读时间：'+Math.ceil(total/500)+'分钟\n';
  }else{
    total=countWords(curRd.content||'');
    msg+='总字数：'+total+'字\n';
    msg+='预估阅读时间：'+Math.ceil(total/500)+'分钟\n';
  }
  // 当前页信息
  if(_rdTotalPg>0){
    msg+='\n当前阅读位置：第'+(_rdCurPage+1)+'页 / 共'+_rdTotalPg+'页\n';
    msg+='阅读进度：'+Math.round((_rdCurPage+1)/_rdTotalPg*100)+'%\n';
  }
  showDlg('字数统计',msg,function(){});
  setTimeout(function(){
    var p=document.getElementById('dlgMsg');
    if(p){p.style.maxHeight='60vh';p.style.overflowY='auto';}
  },100);
}
// ==================== 阅读页核心 ====================
function openReading(article){
var _rdNeedsLoading=_needsLoadingAnim('reading');
if(_rdNeedsLoading) showPageLoading();
try{document.getElementById('xjGlobalFloat').style.display='none';}catch(e){}
// Always use the latest version: check workshop first, then collections
let latestArticle=ws.find(a=>a.id===article.id);
if(!latestArticle){
if(article.type==='long')latestArticle=cols.books.find(b=>b.id===article.id);
else latestArticle=cols.shorts.find(s=>s.id===article.id);
}
if(!latestArticle)latestArticle=article;
if(!latestArticle){showToast('文章数据丢失');return;}

curRd=latestArticle;
// 打开新文章时重置续写章节数为1
_rdContChCount=1;
_syncContStepperUI();
const savedCh=parseInt(safeLS('get','bj_lastCh_'+article.id)||'0',10)||0;
curCh=Math.min(savedCh,article.chapters?article.chapters.length-1:0);

const rdTitleEl=document.getElementById('rdTitle'); if(rdTitleEl)rdTitleEl.textContent=curRd.title;
// 显示笔记数量
const allNotes=getArticleNotes(curRd.id);
if(allNotes.length>0&&rdTitleEl){
rdTitleEl.textContent=curRd.title+' ('+allNotes.length+'条笔记)';
}
const totalWords=getTotalWords(curRd);
const meta=document.getElementById('rdMeta');
meta.innerHTML=
'<span>'+(curRd.type==='long'?'<i class="fas fa-book"></i> 长篇连载':'<i class="fas fa-file"></i> 短篇')+'</span>'+
'<span><i class="fas fa-clock"></i> '+new Date(curRd.createdAt).toLocaleDateString()+'</span>'+
(curRd.chapters?'<span>共 '+curRd.chapters.length+' 章</span>':'')+
'<span>'+totalWords+' 字</span>';
applyCrBg();        // 确保创作背景已应用
applyRdThemeBg();   // 确保阅读主题背景也应用
renderChContent();
updateRdLikeBtn();

const liked=isLiked(curRd);
const cw=document.getElementById('contWrap');
if(curRd.type==='long'){
cw.style.display='block';
const btnCont=document.getElementById('btnCont');
var smartBtn=document.getElementById('btnSmartCont');
var colBook=cols.books.find(function(b){return b.id===curRd.id;});
var isComplete=colBook&&colBook.status==='complete';
if(isComplete){
btnCont.disabled=true;
btnCont.textContent='已完结，无法续写';
if(smartBtn){smartBtn.disabled=true;smartBtn.textContent='已完结';}
document.getElementById('dirInputWrap').style.display='none';
}else if(liked){
btnCont.disabled=false;
btnCont.innerHTML='<i class="fas fa-pen-nib"></i> 续写第'+(curRd&&curRd.chapters?curRd.chapters.length+1:2)+'章';
if(smartBtn){smartBtn.disabled=false;smartBtn.innerHTML='<i class="fas fa-brain"></i> 智能续写';}
}else{
btnCont.disabled=true;
btnCont.textContent='请先收藏后才能续写';
if(smartBtn){smartBtn.disabled=true;smartBtn.textContent='请先收藏';}
}
}else{
cw.style.display='none';
}

const dirWrap=document.getElementById('dirInputWrap');
dirWrap.style.display=(curRd.type==='long')?'flex':'none';
// 方向记忆：自动恢复上次的方向提示
if(contDirMemory&&curRd&&curRd.id){
  var savedDir=localStorage.getItem('bj_lastDir_'+curRd.id);
  if(savedDir)document.getElementById('dirInput').value=savedDir;
}
const undoBtn=document.getElementById('btnUndo');
undoBtn.style.display=(curRd.type==='long'&&curRd.chapters&&curRd.chapters.length>1)?'inline-block':'none';

// Reading bg - 主题背景优先，旧的自定义背景已移除
const bg=document.getElementById('rdBg');
if(bg){bg.style.display='none';}

// Apply reading font settings
setRdFont(ap.rdFontSize||15);
setRdLine(ap.rdLineHeight||2);
applyRdThemeBg();
document.getElementById('rdModal').classList.add('show');
if(_rdNeedsLoading) hidePageLoading();
navPush('rdModal');
document.getElementById('rdModal').scrollTop=0;
updateNoteBtn();
// 绑定阅读进度
const rdModal=document.getElementById('rdModal');
rdModal.onscroll=function(){
const scrollTop=rdModal.scrollTop;
const scrollHeight=rdModal.scrollHeight-rdModal.clientHeight;
const pct=scrollHeight>0?Math.round(scrollTop/scrollHeight*100):0;
document.getElementById('rdProgressBar').style.width=pct+'%';
};
try{ tutScheduleReaderGuide(); }catch(e){ logError('tutScheduleReaderGuide', e); }
}

function getTotalWords(a){
if(!a)return 0;
if(a.type==='long'&&Array.isArray(a.chapters)){
return a.chapters.reduce((sum,ch)=>sum+countWords(ch||''),0);
}
return countWords(a.content||'');
}

function renderChContent(){
  if(!curRd)return;

  // 数据完整性检查
  if(curRd.type==='long'){
    if(!curRd.chapters)curRd.chapters=[''];
    if(!Array.isArray(curRd.chapters))curRd.chapters=[curRd.chapters];
    if(curCh>=curRd.chapters.length)curCh=curRd.chapters.length-1;
    if(curCh<0)curCh=0;
  }

  const nav=document.getElementById('chNav');
  if(!nav)return;
  const cdiv=document.getElementById('rdContent');

  let text='';
  if(curRd.type==='long'&&curRd.chapters) text=curRd.chapters[curCh]||'';
  else text=curRd.content||'';

  // 长篇和短篇都用翻页阅读器
  nav.innerHTML='';
  cdiv.innerHTML='';
  cdiv.style.overflow='hidden';
  
  const rdModal=document.getElementById('rdModal');
  rdModal.classList.add('rd-reader-mode');

  _rdInitReader(text);

  updateNoteBtn();
  if(curRd&&curRd.id) safeLS('set','bj_lastCh_'+curRd.id,curCh);
}

// ==================== 翻页阅读器核心（全面重构） ====================
let _rdPages=[];
let _rdCurPage=0;
let _rdTotalPg=0;
let _rdReaderEl=null;
let _rdOverlayEl=null;
let _rdIsAnimating=false;

function _rdInitReader(text){
  ap.rdFontSize = ld('bj_ap', ap).rdFontSize || 15;
ap.rdLineHeight = ld('bj_ap', ap).rdLineHeight || 2;
  _rdDestroyReader();
  try{document.getElementById('rdThemeBg').style.display='none';}catch(e){}
  const paras=text.split(/\n+/).filter(p=>p.trim());
  if(paras.length===0)paras.push('（本章暂无内容）');

  const container=document.createElement('div');
  container.className='rd-reader-container';
  container.id='rdReaderContainer';

  // 主题背景层（优先阅读背景图，其次主题渐变）
  if(rdBgImg){
    var imgBg=document.createElement('div');
    imgBg.className='rd-custom-bg-layer';
    imgBg.style.cssText='position:absolute;inset:0;z-index:0;background-image:url('+rdBgImg+');background-size:cover;background-position:center;opacity:0.35;pointer-events:none;';
    container.appendChild(imgBg);
  }else{
    var themeBgId=ap.rdThemeBg||'';
    if(themeBgId&&themeBgId!=='0'){
      var bgLayer=document.createElement('div');
      bgLayer.className='theme-bg-layer';
      bgLayer.setAttribute('data-bg',themeBgId);
      bgLayer.style.cssText='display:block;opacity:1;position:absolute;inset:0;z-index:0;';
      container.appendChild(bgLayer);
    }
  }

  // 内容区
  const contentArea=document.createElement('div');
  contentArea.className='rd-reader-content';
  contentArea.id='rdReaderContent';
  container.appendChild(contentArea);

  // 进度条（放在footer上方）
  const progressWrap=document.createElement('div');
  progressWrap.className='rd-reader-progress';
  const progressInner=document.createElement('div');
  progressInner.className='rd-reader-progress-inner';
  progressInner.id='rdReaderProgressInner';
  progressWrap.appendChild(progressInner);
  container.appendChild(progressWrap);

  // 底部状态栏
  const footer=document.createElement('div');
  footer.className='rd-reader-footer';
  if(!rdFooterVisible) footer.style.display='none';
  const isLong=curRd&&curRd.type==='long';
  const chName=curRd&&curRd.chNames&&curRd.chNames[curCh]?curRd.chNames[curCh]:'';
  const chLabel=isLong?('第'+(curCh+1)+'章'+(chName?' '+esc(chName):'')):(curRd?esc(curRd.title):'');
  var isLight=document.body.classList.contains('theme-light');
  var ftColor=isLight?'#1a1a2e':'#ffffff';
  var ftShadow=isLight?'none':'0 1px 4px rgba(0,0,0,.7)';
  footer.innerHTML=
    '<span class="rrf-ch" style="color:'+ftColor+';text-shadow:'+ftShadow+'">'+chLabel+'</span>'+
    '<span class="rrf-page" id="rdReaderPageNum">1 / ?</span>'+
    '<span class="rrf-wc" style="color:'+ftColor+';text-shadow:'+ftShadow+'">'+countWords(text)+'字</span>';
  container.appendChild(footer);

  // 浮层菜单
  const overlay=_rdCreateOverlay();
  container.appendChild(overlay);
  _rdOverlayEl=overlay;

  document.getElementById('rdModal').appendChild(container);
  _rdReaderEl=container;

  // 等DOM就绪后分页
  requestAnimationFrame(()=>{
    setTimeout(()=>{
      _rdDoPaginate(paras,contentArea);
      _rdBindGestures(contentArea);
    },80);
  });
}

function _rdDestroyReader(){
  if(_rdReaderEl){
    _rdReaderEl.remove();
    _rdReaderEl=null;
  }
  _rdOverlayEl=null;
  _rdPages=[];
  _rdCurPage=0;
  _rdTotalPg=0;
  _rdIsAnimating=false;
  _rdDoPaginate._retryCount=0;
}

function _rdDoPaginate(paras,contentArea){
  const rect=contentArea.getBoundingClientRect();
  const paddingTop=24;
  const paddingBottom=12;
  const paddingW=22*2;
  let availW=rect.width-paddingW;
  let availH=rect.height-paddingTop-paddingBottom;

  if(availH<80||availW<50){
    if(!_rdDoPaginate._retryCount) _rdDoPaginate._retryCount=0;
    _rdDoPaginate._retryCount++;
    if(_rdDoPaginate._retryCount>20){
      _rdDoPaginate._retryCount=0;
      console.warn('分页重试超限，使用当前尺寸');
      availH=Math.max(availH,window.innerHeight-120);
      availW=Math.max(availW,(window.innerWidth||320)-44);
    }else{
      setTimeout(()=>_rdDoPaginate(paras,contentArea),100);
      return;
    }
  }

  const fontSize=ap.rdFontSize||15;
  const lineHeight=ap.rdLineHeight||2;

  // 创建测量容器，模拟真实页面的完整样式
  const measure=document.createElement('div');
  measure.style.cssText='position:absolute;left:-9999px;top:-9999px;width:'+availW+'px;visibility:hidden;pointer-events:none;font-size:'+fontSize+'px;line-height:'+lineHeight+';letter-spacing:0.02em;';
  document.body.appendChild(measure);

  // 一次性把所有段落都加进去测量（更准确）
  const paraEls=[];
  paras.forEach((p,i)=>{
    const div=document.createElement('p');
    div.style.cssText='margin-bottom:12px;text-indent:2em;padding:2px 4px;box-sizing:border-box;word-wrap:break-word;overflow-wrap:break-word;';
    div.textContent=p.trim();
    measure.appendChild(div);
    paraEls.push(div);
  });

  // 强制浏览器计算布局后再读取高度
  measure.offsetHeight;

  const paraData=[];
  paraEls.forEach((div,i)=>{
    // 使用 getBoundingClientRect 获取更精确的高度
    const r=div.getBoundingClientRect();
    const h=Math.ceil(r.height)+12; // 12 是 margin-bottom
    paraData.push({idx:i,text:paras[i].trim(),height:h});
  });

  document.body.removeChild(measure);

  // 分页：使用 88% 的可用高度作为阈值，留出底部喘息空间
  const pageThreshold=Math.floor(availH*0.88);
  _rdPages=[];
  let curPageParas=[];
  let curH=0;

  paraData.forEach((pd,idx)=>{
    if(curH+pd.height>pageThreshold&&curPageParas.length>0){
      _rdPages.push(curPageParas);
      curPageParas=[];
      curH=0;
    }
    curPageParas.push(pd);
    curH+=pd.height;
  });
  if(curPageParas.length>0)_rdPages.push(curPageParas);
  if(_rdPages.length===0)_rdPages.push([]);

  // 均衡修正第一轮：若某页填充不足 55%，且整段可借入，则借（恢复原始阈值）
  var balanced=true;
  var maxPasses=_rdPages.length+2;
  while(balanced&&maxPasses-->0){
    balanced=false;
    for(var pi=0;pi<_rdPages.length-1;pi++){
      var pageA=_rdPages[pi];
      var pageB=_rdPages[pi+1];
      if(!pageB||pageB.length===0)continue;
      var hA=pageA.reduce(function(s,p){return s+p.height;},0);
      var firstOfB=pageB[0];
      if(hA<pageThreshold*0.72&&hA+firstOfB.height<=pageThreshold){
        pageA.push(firstOfB);
        pageB.shift();
        if(pageB.length===0)_rdPages.splice(pi+1,1);
        balanced=true;
      }
    }
  }

  // 均衡修正第二轮：对极度稀疏(< 35%)的页，保守拆分下一段填充，拆后跳过防连锁
  for(var pi=0;pi<_rdPages.length-1;pi++){
    var pageA=_rdPages[pi];
    var pageB=_rdPages[pi+1];
    if(!pageB||pageB.length===0)continue;
    var hA=pageA.reduce(function(s,p){return s+p.height;},0);
    if(hA>=pageThreshold*0.60)continue;
    var firstOfB=pageB[0];
    if(hA+firstOfB.height<=pageThreshold)continue;
    var remainH=pageThreshold-hA;
    var _lineH=fontSize*(typeof lineHeight==='number'?lineHeight:parseFloat(lineHeight)||2);
    if(remainH<_lineH*2)continue;
    var txt=firstOfB.text;
    if(!txt||txt.length<40)continue;
    var _indentW=fontSize*2;
    var _charsFirst=Math.max(1,Math.floor((availW-_indentW)/fontSize));
    var _charsRest=Math.max(1,Math.floor(availW/fontSize));
    var _linesTarget=Math.max(1,Math.floor(remainH*0.55/_lineH));
    var _maxChars=_charsFirst+(_linesTarget-1)*_charsRest;
    _maxChars=Math.min(_maxChars,txt.length-30);
    if(_maxChars<=5)continue;
    var _enders='。！？…」』）';
    var _splitIdx=-1;
    var _lo=Math.floor(_maxChars*0.5);
    for(var _ci=_maxChars;_ci>_lo;_ci--){
      if(_enders.indexOf(txt[_ci])!==-1){_splitIdx=_ci+1;break;}
    }
    if(_splitIdx===-1){
      for(var _ci=_maxChars;_ci>_lo;_ci--){
        if('，、；'.indexOf(txt[_ci])!==-1){_splitIdx=_ci+1;break;}
      }
    }
    if(_splitIdx===-1)_splitIdx=_maxChars;
    if(_splitIdx<=5||_splitIdx>=txt.length-15)continue;
    var _partA=txt.slice(0,_splitIdx).trim();
    var _partB=txt.slice(_splitIdx).trim();
    if(!_partA||!_partB||_partB.length<25)continue;
    var _mEl=document.createElement('div');
    _mEl.style.cssText='position:absolute;left:-9999px;top:-9999px;width:'+availW+'px;visibility:hidden;pointer-events:none;font-size:'+fontSize+'px;line-height:'+lineHeight+';letter-spacing:0.02em;';
    var _mpA=document.createElement('p');
    _mpA.style.cssText='margin-bottom:12px;text-indent:2em;padding:2px 4px;box-sizing:border-box;word-wrap:break-word;overflow-wrap:break-word;';
    _mpA.textContent=_partA;
    _mEl.appendChild(_mpA);
    document.body.appendChild(_mEl);
    _mEl.offsetHeight;
    var _hPartA=0;
    try{_hPartA=Math.ceil(_mpA.getBoundingClientRect().height)+12;}catch(e){}
    document.body.removeChild(_mEl);
    if(_hPartA<=0||hA+_hPartA>pageThreshold)continue;
    var _mEl2=document.createElement('div');
    _mEl2.style.cssText='position:absolute;left:-9999px;top:-9999px;width:'+availW+'px;visibility:hidden;pointer-events:none;font-size:'+fontSize+'px;line-height:'+lineHeight+';letter-spacing:0.02em;';
    var _mpB=document.createElement('p');
    _mpB.style.cssText='margin-bottom:12px;text-indent:2em;padding:2px 4px;box-sizing:border-box;word-wrap:break-word;overflow-wrap:break-word;';
    _mpB.textContent=_partB;
    _mEl2.appendChild(_mpB);
    document.body.appendChild(_mEl2);
    _mEl2.offsetHeight;
    var _hPartB=0;
    try{_hPartB=Math.ceil(_mpB.getBoundingClientRect().height)+12;}catch(e){}
    document.body.removeChild(_mEl2);
    if(_hPartB<=0)continue;
    pageA.push({idx:firstOfB.idx,text:_partA,height:_hPartA});
    pageB[0]={idx:firstOfB.idx,text:_partB,height:_hPartB};
    pi++; // 关键：跳过被拆的页面，防止连锁稀疏
  }

  _rdTotalPg=_rdPages.length;
  _rdCurPage=0;

  // 阅读进度记忆：恢复上次读到的页码
  if(curRd && curRd.id){
    if(rdProgressMemory){
      try{
        var savedPage=parseInt(localStorage.getItem('bj_rdPage_'+curRd.id+'_'+curCh));
        if(savedPage && savedPage>0 && savedPage<_rdTotalPg){
          _rdCurPage=savedPage;
        }
      }catch(e){}
    }
  }

  _rdRenderPage(contentArea);
}

function _rdRenderPage(contentArea,animClass){
  if(!contentArea)contentArea=document.getElementById('rdReaderContent');
  if(!contentArea)return;

  const fontSize=ap.rdFontSize||15;
  const lineHeight=ap.rdLineHeight||2;

  // 如果有动画，先对旧页面做退出动画
  const oldPage=contentArea.querySelector('.rd-reader-page');
  
  const createNewPage=()=>{
    contentArea.innerHTML='';
    const pageDiv=document.createElement('div');
    pageDiv.className='rd-reader-page'+(animClass?' '+animClass:'');
    pageDiv.style.cssText='font-size:'+fontSize+'px;line-height:'+lineHeight+';';

    const pageParas=_rdPages[_rdCurPage]||[];
    pageParas.forEach(pd=>{
      const pEl=document.createElement('p');
      pEl.className='rd-para';
      pEl.dataset.pi=pd.idx;
      pEl.textContent=pd.text;
      pageDiv.appendChild(pEl);
    });
    contentArea.appendChild(pageDiv);

    // 绑定长按
    _bindParaLongPress(pageDiv);

    // 动画结束后移除class
    if(animClass){
      pageDiv.addEventListener('animationend',()=>{
        pageDiv.classList.remove(animClass);
        _rdIsAnimating=false;
      },{once:true});
      setTimeout(()=>{_rdIsAnimating=false;},400);
    }
  };

  if(animClass&&oldPage){
    const exitClass=animClass==='slide-in-right'?'slide-out-left':'slide-out-right';
    oldPage.classList.add(exitClass);
    oldPage.addEventListener('animationend',()=>{
      createNewPage();
    },{once:true});
  }else{
    createNewPage();
    _rdIsAnimating=false;
  }

  _rdUpdateFooter();
}

function _rdUpdateFooter(){
  const numEl=document.getElementById('rdReaderPageNum');
  if(numEl)numEl.textContent=(_rdCurPage+1)+' / '+_rdTotalPg;

  const progEl=document.getElementById('rdReaderProgressInner');
  if(progEl){
    const pct=_rdTotalPg>0?((_rdCurPage+1)/_rdTotalPg*100):0;
    progEl.style.width=pct+'%';
  }

  // 阅读进度记忆：保存当前页码
  if(curRd && curRd.id){
    try{
      if(rdProgressMemory)localStorage.setItem('bj_rdPage_'+curRd.id+'_'+curCh, _rdCurPage);
    }catch(e){}
  }
}

function _rdNextPage(){
  if(_rdIsAnimating)return false;
  if(_rdCurPage<_rdTotalPg-1){
    _rdIsAnimating=true;
    _rdCurPage++;
    _rdRenderPage(null,'slide-in-right');
    return true;
  }
  return false;
}

function _rdPrevPage(){
  if(_rdIsAnimating)return false;
  if(_rdCurPage>0){
    _rdIsAnimating=true;
    _rdCurPage--;
    _rdRenderPage(null,'slide-in-left');
    return true;
  }
  return false;
}

function _rdBindGestures(contentArea){
  let startX=0,startY=0,startTime=0,moved=false;

  contentArea.addEventListener('touchstart',function(e){
    if(e.touches.length!==1)return;
    startX=e.touches[0].clientX;
    startY=e.touches[0].clientY;
    startTime=Date.now();
    moved=false;
  },{passive:true});

  contentArea.addEventListener('touchmove',function(e){
    if(e.touches.length!==1)return;
    const dx=Math.abs(e.touches[0].clientX-startX);
    const dy=Math.abs(e.touches[0].clientY-startY);
    if(dx>10||dy>10)moved=true;
  },{passive:true});

  contentArea.addEventListener('touchend',function(e){
    if(_rdIsAnimating)return;
    const endX=e.changedTouches[0].clientX;
    const endY=e.changedTouches[0].clientY;
    const dx=endX-startX;
    const elapsed=Date.now()-startTime;
    const w=contentArea.clientWidth;

    // 滑动判断
    if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(endY-startY)*1.2){
      if(dx<-50){
        // 左滑→下一页
        if(!_rdNextPage()){
          _rdTryNextChapter();
        }
      }else if(dx>50){
        // 右滑→上一页
        if(!_rdPrevPage()){
          _rdTryPrevChapter();
        }
      }
    }else if(!moved&&elapsed<300){
      // 点击
      const tapX=startX;
      const w3=w/3;

      if(tapX<w3){
        // 左侧1/3：上一页
        if(!_rdPrevPage()) _rdTryPrevChapter();
      }else if(tapX>w3*2){
        // 右侧1/3：下一页
        if(!_rdNextPage()) _rdTryNextChapter();
      }else{
        // 中间1/3：菜单
        _rdToggleOverlay();
      }
    }
  },{passive:true});
}

// 尝试切换到下一章
function _rdTryNextChapter(){
  if(!curRd||!curRd.chapters||curRd.type!=='long')return;
  if(curCh<curRd.chapters.length-1){
    curCh++;
    _rdShowChToast('第'+(curCh+1)+'章');
    setTimeout(()=>renderChContent(),400);
  }else{
    // 最后一章最后一页：提示续写
    if(isLiked(curRd)){
      _rdShowChToast('已到最后 · 点击中间续写');
    }else{
      _rdShowChToast('已到最后');
    }
  }
}

// 尝试切换到上一章
function _rdTryPrevChapter(){
  if(!curRd||!curRd.chapters||curRd.type!=='long')return;
  if(curCh>0){
    curCh--;
    _rdShowChToast('第'+(curCh+1)+'章');
    setTimeout(()=>{
      renderChContent();
      // 跳到最后一页
      setTimeout(()=>{
        _rdCurPage=_rdTotalPg-1;
        _rdRenderPage();
      },150);
    },400);
  }else{
    _rdShowChToast('已是第一页');
  }
}

// 章节切换提示
function _rdShowChToast(text){
  const old=document.querySelector('.rd-reader-ch-toast');
  if(old)old.remove();
  const toast=document.createElement('div');
  toast.className='rd-reader-ch-toast';
  toast.textContent=text;
  const container=document.getElementById('rdReaderContainer')||document.getElementById('rdModal');
  if(!container)return;
  container.appendChild(toast);
  setTimeout(()=>{if(toast.parentNode)toast.remove();},700);
}

function _rdRepaginate(){
  if(!curRd)return;
  let text='';
  if(curRd.type==='long'&&curRd.chapters) text=curRd.chapters[curCh]||'';
  else text=curRd.content||'';
  const paras=text.split(/\n+/).filter(p=>p.trim());
  if(paras.length===0)paras.push('（本章暂无内容）');
  const contentArea=document.getElementById('rdReaderContent');
  if(contentArea){
    const savedPage=_rdCurPage;
    _rdDoPaginate(paras,contentArea);
    if(savedPage<_rdTotalPg){
      _rdCurPage=savedPage;
      _rdRenderPage();
    }
  }
  try{var jt=document.getElementById('rdOvJumpTotal');if(jt)jt.textContent='/ '+_rdTotalPg;}catch(e){}
}

// ==================== 阅读器浮层菜单 ====================
function _rdCreateOverlay(){
  const ov=document.createElement('div');
  ov.className='rd-reader-overlay';
  ov.id='rdReaderOverlay';

  const isLong=curRd&&curRd.type==='long';
  const totalCh=curRd&&curRd.chapters?curRd.chapters.length:0;

  // === 顶部栏 ===
  const top=document.createElement('div');
  top.className='rd-reader-ov-top';
  top.innerHTML=
    '<button class="rd-reader-ov-btn" onclick="_rdExitReader()">← 返回</button>'+
    '<h3>'+(curRd?esc(curRd.title):'')+'</h3>'+
    '<button class="rd-reader-ov-btn" onclick="_rdHideOverlay();setTimeout(openRdInlineEdit,200)"><i class="fas fa-pen"></i></button>'+
    '<button class="rd-reader-ov-btn" onclick="_rdDoToggleLike()">'+(isLiked(curRd)?'<i class="fas fa-heart" style="color:#ff6b6b"></i>':'<i class="fas fa-heart" style="color:var(--text2)"></i>')+'</button>';
  ov.appendChild(top);

  // === 中间空白区：点击关闭菜单 ===
  const mid=document.createElement('div');
  mid.style.cssText='flex:1;';
  mid.onclick=function(e){e.stopPropagation();_rdHideOverlay();};
  mid.ontouchend=function(e){e.stopPropagation();_rdHideOverlay();};
  ov.appendChild(mid);

  // === 底部栏 ===
  const bottom=document.createElement('div');
  bottom.className='rd-reader-ov-bottom';

  let html='';

  // 字号行高滑块
  html+=
    '<div class="rd-reader-ov-slider">'+
      '<span style="font-size:13px">A</span>'+
      '<input type="range" min="12" max="24" value="'+(ap.rdFontSize||15)+'" oninput="_rdSetFont(this.value)" ontouchstart="event.stopPropagation()">'+
      '<span style="font-size:18px;font-weight:700">A</span>'+
      '<span class="rros-val" id="rdReaderFontVal">'+(ap.rdFontSize||15)+'</span>'+
    '</div>'+
    '<div class="rd-reader-ov-slider">'+
      '<span>行距</span>'+
      '<input type="range" min="1.4" max="3" step="0.1" value="'+(ap.rdLineHeight||2)+'" oninput="_rdSetLine(this.value)" ontouchstart="event.stopPropagation()">'+
      '<span class="rros-val" id="rdReaderLineVal">'+(ap.rdLineHeight||2).toFixed(1)+'</span>'+
    '</div>';

  // 章节导航（仅长篇多章）
  if(isLong&&totalCh>1){
    html+=
      '<div class="rd-reader-ov-row">'+
        '<div class="rd-reader-ov-item" onclick="_rdHideOverlay();_rdGoPrevCh()"><div class="rroi-icon"><i class="fas fa-chevron-left"></i></div><div class="rroi-text">上一章</div></div>'+
        '<div class="rd-reader-ov-item" onclick="_rdHideOverlay();openChapterList()"><div class="rroi-icon"><i class="fas fa-list-alt"></i></div><div class="rroi-text">目录('+totalCh+')</div></div>'+
        '<div class="rd-reader-ov-item" onclick="_rdHideOverlay();_rdGoNextCh()"><div class="rroi-icon"><i class="fas fa-chevron-right"></i></div><div class="rroi-text">下一章</div></div>'+
      '</div>';
  }

  // ========== 搜索 & 跳页（直接嵌入，不用独立浮层） ==========
  html+=
    '<div style="margin:8px 0;padding:10px 12px;background:var(--card);border:1px solid var(--border);border-radius:12px">'+
      '<div style="display:flex;gap:6px;align-items:center">'+
        '<div style="position:relative;flex:1">'+
          '<i class="fas fa-search" style="position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:12px;color:var(--text2);pointer-events:none"></i>'+
          '<input type="text" id="rdOvSearchInput" placeholder="搜索内容..." style="width:100%;box-sizing:border-box;padding:9px 12px 9px 32px;border-radius:10px;border:1px solid var(--border);background:var(--bg);color:var(--text);font-size:13px;outline:none;font-family:inherit" oninput="_rdOvDoSearch()" onkeydown="if(event.key===\'Enter\'){event.preventDefault();_rdOvSearchNext();}" ontouchstart="event.stopPropagation()">'+
        '</div>'+
        '<button onclick="_rdOvSearchPrev()" id="rdOvSPrev" disabled style="width:32px;height:32px;border-radius:8px;border:1px solid var(--border);background:var(--card);color:var(--text);font-size:12px;cursor:pointer;display:flex;align-items:center;justify-content:center">▲</button>'+
        '<button onclick="_rdOvSearchNext()" id="rdOvSNext" disabled style="width:32px;height:32px;border-radius:8px;border:1px solid var(--border);background:var(--card);color:var(--text);font-size:12px;cursor:pointer;display:flex;align-items:center;justify-content:center">▼</button>'+
      '</div>'+
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px">'+
        '<span id="rdOvSearchCount" style="font-size:11px;color:var(--text2)">输入关键词搜索</span>'+
        '<div style="display:flex;gap:6px;align-items:center">'+
          '<span style="font-size:10px;color:var(--text2)">跳到</span>'+
          '<input type="number" id="rdOvJumpInput" min="1" placeholder="页" style="width:48px;padding:6px 8px;border-radius:8px;text-align:center;border:1px solid var(--border);background:var(--card);color:var(--text);font-size:12px;outline:none" onkeydown="if(event.key===\'Enter\'){event.preventDefault();_rdOvJumpToPage();}" ontouchstart="event.stopPropagation()">'+
          '<span style="font-size:10px;color:var(--text2)" id="rdOvJumpTotal">/ '+_rdTotalPg+'</span>'+
          '<button onclick="_rdOvJumpToPage()" style="padding:6px 12px;border-radius:8px;border:none;background:linear-gradient(135deg,var(--accent),var(--accent2));color:#fff;font-size:11px;font-weight:600;cursor:pointer">跳转</button>'+
        '</div>'+
      '</div>'+
    '</div>';

  // ========== 工具箱折叠栏 ==========
  html+=
    '<div id="rdOvToolWrap" style="margin-top:6px">'+
      '<div id="rdOvToolToggle" onclick="_rdToggleToolBox()" style="width:100%;padding:10px 14px;border-radius:12px;border:1px solid var(--border);background:var(--card);color:var(--text);font-size:13px;font-weight:600;cursor:pointer;display:flex;justify-content:space-between;align-items:center;transition:all .2s">'+
        '<span><i class="fas fa-tools"></i> 工具箱</span>'+
        '<span style="font-size:10px;color:var(--text2)">笔记·朗读·复制·伏笔·改写·番外...</span>'+
      '</div>'+
      '<div id="rdOvToolPanel" style="display:none;margin-top:8px;animation:fadeIn .2s ease">'+
        '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin-bottom:7px">'+
          '<div class="rd-reader-ov-item" onclick="_rdToolAction(\'note\')"><div class="rroi-icon"><i class="fas fa-pen"></i></div><div class="rroi-text">笔记</div></div>'+
          '<div class="rd-reader-ov-item" onclick="_rdToolAction(\'tts\')"><div class="rroi-icon"><i class="fas fa-volume-up"></i></div><div class="rroi-text">朗读</div></div>'+
          '<div class="rd-reader-ov-item" onclick="_rdToolAction(\'copyAll\')"><div class="rroi-icon"><i class="fas fa-clipboard"></i></div><div class="rroi-text">复制全文</div></div>'+
          (isLong?'<div class="rd-reader-ov-item" onclick="_rdToolAction(\'copyCh\')"><div class="rroi-icon"><i class="fas fa-file-alt"></i></div><div class="rroi-text">复制本章</div></div>':'')+
          '<div class="rd-reader-ov-item" onclick="_rdToolAction(\'wordStats\')"><div class="rroi-icon"><i class="fas fa-chart-bar"></i></div><div class="rroi-text">字数统计</div></div>'+
          '<div class="rd-reader-ov-item" onclick="_rdToolAction(\'foreshadow\')"><div class="rroi-icon"><i class="fas fa-bullseye"></i></div><div class="rroi-text">伏笔</div></div>'+
          '<div class="rd-reader-ov-item" onclick="_rdToolAction(\'timeline\')"><div class="rroi-icon"><i class="fas fa-clock"></i></div><div class="rroi-text">时间线</div></div>'+
          '<div class="rd-reader-ov-item" onclick="_rdToolAction(\'import\')"><div class="rroi-icon"><i class="fas fa-pen-fancy"></i></div><div class="rroi-text">导入创作</div></div>'+
          '<div class="rd-reader-ov-item" onclick="_rdToolAction(\'proofread\')"><div class="rroi-icon"><i class="fas fa-microscope"></i></div><div class="rroi-text">AI校对</div></div>'+
          '<div class="rd-reader-ov-item" onclick="_rdToolAction(\'rewrite\')"><div class="rroi-icon"><i class="fas fa-sync-alt"></i></div><div class="rroi-text">AI改写</div></div>'+
          '<div class="rd-reader-ov-item" onclick="_rdToolAction(\'fanwai\')"><div class="rroi-icon"><i class="fas fa-book-open"></i></div><div class="rroi-text">番外篇</div></div>'+
          '<div class="rd-reader-ov-item" onclick="_rdToolAction(\'matmodule\')"><div class="rroi-icon"><i class="fas fa-cubes" style="color:var(--accent2)"></i></div><div class="rroi-text">素材模块</div></div>'+
           '<div class="rd-reader-ov-item" onclick="_rdToolAction(\'snapshots\')"><div class="rroi-icon"><i class="fas fa-history" style="color:var(--accent2)"></i></div><div class="rroi-text">历史版本</div></div>'+
        '</div>'+
        // 主题背景选择
        '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px;padding:8px 0">';

  const curBg=ap.rdThemeBg||'';
  const bgOpts=[
    {id:'0',label:'<i class="fas fa-times" style="color:var(--danger)"></i>'},
    {id:'1',label:'<i class="fas fa-star" style="color:#a29bfe"></i>'},
    {id:'2',label:'<i class="fas fa-water" style="color:#5dade2"></i>'},
    {id:'3',label:'<i class="fas fa-leaf" style="color:#58d68d"></i>'},
    {id:'4',label:'<i class="fas fa-fire" style="color:#e67e22"></i>'},
    {id:'5',label:'<i class="fas fa-spa" style="color:#f1948a"></i>'},
    {id:'6',label:'<i class="fas fa-circle" style="color:#555"></i>'},
  ];
  bgOpts.forEach(function(bg){
    const isAct=(bg.id==='0'&&!curBg)||(curBg===bg.id);
    html+='<div onclick="_rdToolAction(\'bg\',\''+bg.id+'\')" style="padding:8px 12px;border-radius:10px;border:1px solid '+(isAct?'var(--accent)':'var(--border)')+';background:'+(isAct?'rgba(108,92,231,.15)':'var(--card)')+';cursor:pointer;font-size:14px;text-align:center;min-width:36px;flex:1;transition:all .2s'+(bg.id==='0'?';color:var(--danger)':'')+'">'+bg.label+'</div>';
  });

  html+=
        '</div>'+
      '</div>'+
    '</div>';

  // ========== 续写区（仅长篇且已收藏） ==========
  if(isLong&&isLiked(curRd)){
    var _ovMO=_rdContChCount<=1?'0.35':'1';
    var _ovPO=_rdContChCount>=10?'0.35':'1';
    html+=
      '<div style="margin-top:8px;padding-top:10px;border-top:1px solid var(--border)">'+
        '<div style="display:flex;align-items:center;justify-content:space-between;padding:4px 2px 8px">'+
          '<span style="font-size:11px;color:var(--text2)">本次续写章节数（1-10）</span>'+
          '<div style="display:flex;align-items:center;gap:10px">'+
            '<button id="rdOvContMinus" onclick="event.stopPropagation();_rdContChCount=Math.max(1,_rdContChCount-1);_syncContStepperUI()" ontouchstart="event.preventDefault();event.stopPropagation();_rdContChCount=Math.max(1,_rdContChCount-1);_syncContStepperUI()" style="width:34px;height:34px;border-radius:50%;border:1px solid var(--border);background:var(--card2);color:var(--text);font-size:18px;line-height:1;cursor:pointer;padding:0;opacity:'+_ovMO+';transition:opacity .2s;-webkit-tap-highlight-color:transparent">−</button>'+
            '<span id="rdOvContChNum" style="font-size:15px;font-weight:700;color:var(--accent2);min-width:20px;text-align:center">'+_rdContChCount+'</span>'+
            '<button id="rdOvContPlus" onclick="event.stopPropagation();_rdContChCount=Math.min(10,_rdContChCount+1);_syncContStepperUI()" ontouchstart="event.preventDefault();event.stopPropagation();_rdContChCount=Math.min(10,_rdContChCount+1);_syncContStepperUI()" style="width:34px;height:34px;border-radius:50%;border:1px solid var(--border);background:var(--card2);color:var(--text);font-size:18px;line-height:1;cursor:pointer;padding:0;opacity:'+_ovPO+';transition:opacity .2s;-webkit-tap-highlight-color:transparent">+</button>'+
          '</div>'+
        '</div>'+
        '<div class="rd-reader-ov-row">'+
          '<div class="rd-reader-ov-item" style="flex:2;background:linear-gradient(135deg,var(--accent),var(--accent2));border-color:var(--accent)" onclick="_rdHideOverlay();quickContinue()"><div class="rroi-icon" style="color:#fff"><i class="fas fa-pen"></i></div><div class="rroi-text" style="color:#fff">快速续写</div></div>'+
          '<div class="rd-reader-ov-item" style="flex:2;background:linear-gradient(135deg,#27ae60,#2ecc71);border-color:#27ae60" onclick="_rdHideOverlay();smartContinue()"><div class="rroi-icon" style="color:#fff"><i class="fas fa-brain"></i></div><div class="rroi-text" style="color:#fff">智能续写</div></div>'+
        '</div>'+
        '<div class="rd-reader-ov-row">'+
          '<div class="rd-reader-ov-item" onclick="_rdHideOverlay();openContextEditor()"><div class="rroi-icon"><i class="fas fa-cog"></i></div><div class="rroi-text">上下文设置</div></div>'+
          '<div class="rd-reader-ov-item" onclick="_rdHideOverlay();undoChapter()"><div class="rroi-icon"><i class="fas fa-undo"></i></div><div class="rroi-text">撤销上一章</div></div>'+
          '<div class="rd-reader-ov-item" onclick="_rdHideOverlay();manualSaveSnapshot()"><div class="rroi-icon"><i class="fas fa-bookmark" style="color:var(--accent2)"></i></div><div class="rroi-text">手动存档</div></div>'+
        '</div>'+
      '</div>';
  }

  bottom.innerHTML=html;
  ov.appendChild(bottom);

  // 阻止浮层上所有事件冒泡到阅读器翻页手势
  ov.addEventListener('touchstart',function(e){e.stopPropagation();},{passive:true});
  ov.addEventListener('touchmove',function(e){e.stopPropagation();},{passive:true});
  ov.addEventListener('touchend',function(e){e.stopPropagation();},{passive:true});

  return ov;
}
// 工具箱折叠栏控制
function _rdToggleToolBox(){
  const panel=document.getElementById('rdOvToolPanel');
  const toggle=document.getElementById('rdOvToolToggle');
  if(!panel)return;
  if(panel.style.display==='none'){
    panel.style.display='block';
    if(toggle)toggle.style.borderColor='var(--accent)';
  }else{
    panel.style.display='none';
    if(toggle)toggle.style.borderColor='var(--border)';
  }
}

// 工具箱按钮统一处理：点击后关闭浮层再执行功能
function _rdToolAction(action,param){
  _rdHideOverlay();
  // 短延迟，确保浮层动画完成后再打开子功能
  setTimeout(function(){
    switch(action){
      case 'note': openNotePanel(); break;
      case 'copyAll': copyCurrentArticle(); break;
      case 'tts': toggleTtsBar(); break;
      case 'import': importRdToCreate(); break;
      case 'copyCh': copyCurChapter(); break;
      case 'foreshadow': openForeshadow(); break;
      case 'timeline': openTimeline(); break;
      case 'rewrite':
        // 改写前自动保存快照
        if(curRd && curRd.type==='long' && isLiked(curRd)){
          try{saveChapterSnapshot(curRd.id, curCh, '改写前·第'+(curCh+1)+'章');}catch(e){}
        }
        openArticleRewrite();
        break;
      case 'snapshots': openSnapshotDrawer(); break;
      case 'proofread': openProofread('reading'); break;
      case 'fanwai': openFanwai(); break;
      case 'matmodule': openBookMatModule(); break;
      case 'wordStats': showDetailedWordStats(); break;
      case 'bg':
        setRdThemeBg(param||'0');
        // 切换背景后重建浮层（更新高亮状态）
        setTimeout(function(){_rdRefreshOverlay();},100);
        break;
    }
  },150);
}

// 刷新浮层（用于收藏状态/主题背景变化后更新）
function _rdRefreshOverlay(){
  if(!_rdOverlayEl||!_rdReaderEl)return;
  const wasShown=_rdOverlayEl.classList.contains('show');
  _rdOverlayEl.remove();
  const newOv=_rdCreateOverlay();
  _rdReaderEl.appendChild(newOv);
  _rdOverlayEl=newOv;
  if(wasShown)_rdOverlayEl.classList.add('show');
  // 同步更新背景层
  var oldBg=_rdReaderEl.querySelector('.theme-bg-layer');
  if(oldBg)oldBg.remove();
  var oldImgBg=_rdReaderEl.querySelector('.rd-custom-bg-layer');
  if(oldImgBg)oldImgBg.remove();
      if(rdBgImg){
      var imgBg2=document.createElement('div');
      imgBg2.className='rd-custom-bg-layer';
      imgBg2.style.cssText='position:absolute;inset:0;z-index:0;background-image:url('+rdBgImg+');background-size:cover;background-position:center;opacity:0.35;pointer-events:none;';
      _rdReaderEl.insertBefore(imgBg2,_rdReaderEl.firstChild);
  }else{
    var bgId=ap.rdThemeBg||'';
    if(bgId&&bgId!=='0'){
      var bgLayer=document.createElement('div');
      bgLayer.className='theme-bg-layer';
      bgLayer.setAttribute('data-bg',bgId);
      bgLayer.style.cssText='display:block;opacity:1;position:absolute;inset:0;z-index:0;';
      _rdReaderEl.insertBefore(bgLayer,_rdReaderEl.firstChild);
    }
  }
}
function _rdDoToggleLike(){
  _rdHideOverlay();
  toggleCurrentLike();
  // 直接修改浮层上的按钮文字（不重建整个浮层）
  if(_rdOverlayEl){
    var liked=isLiked(curRd);
    var topBtns=_rdOverlayEl.querySelectorAll('.rd-reader-ov-btn');
    if(topBtns.length>=2){
      topBtns[topBtns.length-1].innerHTML=liked?'<i class="fas fa-heart" style="color:#ff6b6b"></i>':'<i class="fas fa-heart" style="color:var(--text2)"></i>';
    }
    // 同时更新续写区域（如果有的话）
    _rdOverlayEl.dataset.needRefresh='1';
  }
}
function _rdToggleOverlay(){
  if(!_rdOverlayEl)return;
  if(_rdOverlayEl.classList.contains('show')){
    _rdHideOverlay();
  }else{
    _rdShowOverlay();
  }
}

function _rdShowOverlay(){
  if(!_rdOverlayEl)return;
  // 如果上次操作后标记了需要刷新，重建整个浮层
  if(_rdOverlayEl.dataset.needRefresh==='1'){
    _rdRefreshOverlay();
    _rdOverlayEl=document.querySelector('.rd-reader-overlay');
    if(!_rdOverlayEl)return;
  }
  _rdOverlayEl.classList.add('show');
  // 重置工具箱状态（避免残留状态）
  var tp=document.getElementById('rdOvToolPanel');
  var tt=document.getElementById('rdOvToolToggle');
  if(tp&&tp.style.display==='block'){
    tp.style.display='none';
    if(tt)tt.style.borderColor='var(--border)';
  }
  // 更新收藏按钮
  const topBtns=_rdOverlayEl.querySelectorAll('.rd-reader-ov-btn');
  if(topBtns.length>=2) topBtns[topBtns.length-1].innerHTML=isLiked(curRd)?'<i class="fas fa-heart" style="color:#ff6b6b"></i>':'<i class="fas fa-heart" style="color:var(--text2)"></i>';
  // 防误触：展开后1.5秒内禁止点击底部操作区
  var bottom=_rdOverlayEl.querySelector('.rd-reader-ov-bottom');
  if(bottom){
    bottom.style.pointerEvents='none';
    bottom.style.opacity='0.4';
    setTimeout(function(){
      bottom.style.pointerEvents='';
      bottom.style.opacity='1';
      bottom.style.transition='opacity 0.3s';
    },100);
  }
  var top2=_rdOverlayEl.querySelector('.rd-reader-ov-top');
  if(top2){
    top2.style.pointerEvents='none';
    top2.style.opacity='0.4';
    setTimeout(function(){
      top2.style.pointerEvents='';
      top2.style.opacity='1';
      top2.style.transition='opacity 0.3s';
    },100);
  }
}

function _rdHideOverlay(){
  if(!_rdOverlayEl)return;
  _rdOverlayEl.classList.remove('show');
}

function _rdExitReader(){
  _rdHideOverlay();
  const rdModal=document.getElementById('rdModal');
  rdModal.classList.remove('rd-reader-mode');
  _rdDestroyReader();
  closeReading();
}

function _rdSetFont(v){
  v=parseInt(v);
  ap.rdFontSize=v;sv(K.ap,ap);
  try{document.getElementById('rdContent').style.setProperty('--rd-fontsize',v+'px');}catch(e){}
  const valEl=document.getElementById('rdReaderFontVal');
  if(valEl)valEl.textContent=v;
  try{
    var panel=document.getElementById('rdSettingsPanel');
    if(panel){
      var ranges=panel.querySelectorAll('input[type=range]');
      if(ranges[0])ranges[0].value=v;
    }
    var rdFontVal=document.getElementById('rdFontVal');
    if(rdFontVal)rdFontVal.textContent=v;
  }catch(e){}
  // 同步到编辑器
edFontSize=v;sv('bj_edFontSize',v);
try{document.getElementById('edFontVal').textContent=v;var ranges=document.querySelectorAll('#edWriteSettings input[type=range]');if(ranges[0])ranges[0].value=v;}catch(e){}
applyEdWriteStyle();
  _rdRepaginate();
}

function _rdSetLine(v){
  v=parseFloat(v);
  ap.rdLineHeight=v;sv(K.ap,ap);
  try{document.getElementById('rdContent').style.setProperty('--rd-lineheight',v);}catch(e){}
  const valEl=document.getElementById('rdReaderLineVal');
  if(valEl)valEl.textContent=v.toFixed(1);
  try{
    var panel=document.getElementById('rdSettingsPanel');
    if(panel){
      var ranges=panel.querySelectorAll('input[type=range]');
      if(ranges[1])ranges[1].value=v;
    }
    var rdLineVal=document.getElementById('rdLineVal');
    if(rdLineVal)rdLineVal.textContent=v.toFixed(1);
  }catch(e){}
  // 同步到编辑器
edLineHeight=v;sv('bj_edLineHeight',v);
try{document.getElementById('edLineVal').textContent=v.toFixed(1);var ranges=document.querySelectorAll('#edWriteSettings input[type=range]');if(ranges[1])ranges[1].value=v;}catch(e){}
applyEdWriteStyle();
  _rdRepaginate();
}

function _rdGoPrevCh(){
  if(!curRd||!curRd.chapters||curCh<=0){_rdShowChToast('已是第一章');return;}
  curCh--;
  _rdShowChToast('第'+(curCh+1)+'章');
  setTimeout(()=>renderChContent(),400);
}

function _rdGoNextCh(){
  if(!curRd||!curRd.chapters||curCh>=curRd.chapters.length-1){_rdShowChToast('已是最后一章');return;}
  curCh++;
  _rdShowChToast('第'+(curCh+1)+'章');
  setTimeout(()=>renderChContent(),400);
}

function _rdOpenMore(){
  // 暂时不需要退出阅读器模式了，所有功能都在浮层菜单里
  _rdHideOverlay();
}

// 长按段落绑定（公共函数）
function _bindParaLongPress(container){
  if(!paraLongPress) return; // 开关关闭时不绑定长按
  container.querySelectorAll('.rd-para').forEach(el=>{
    // [FIX-2] 防止每次渲染重复绑定事件监听器（内存泄漏）
    if(el.dataset.lpBound==='1') return;
    el.dataset.lpBound='1';

    let lpTimer=null;
    let startX=0,startY=0,moved=false;

    el.addEventListener('touchstart',function(e){
      moved=false;
      if(e.touches.length>0){
        startX=e.touches[0].clientX;
        startY=e.touches[0].clientY;
      }
        lpTimer=setTimeout(()=>{
        if(moved)return;
        _suppressSelect(el);
        const t=el.textContent.trim();
        if(!t)return;
        try{if(navigator.vibrate)navigator.vibrate(30);}catch(e){}
        el.style.background='rgba(108,92,231,.18)';
        el.style.boxShadow='inset 0 0 0 1px var(--accent)';
        setTimeout(()=>{
          el.style.background='';
          el.style.boxShadow='';
        },800);
        showParaContextMenu(t, parseInt(el.dataset.pi) || 0);
        setTimeout(function(){_restoreSelect(el);},800);
      },500);
    },{passive:false});

    el.addEventListener('touchmove',function(e){
      if(e.touches.length>0){
        const ddx=Math.abs(e.touches[0].clientX-startX);
        const ddy=Math.abs(e.touches[0].clientY-startY);
        if(ddx>8||ddy>8){
          moved=true;
          clearTimeout(lpTimer);
        }
      }
    },{passive:true});

    el.addEventListener('touchend',()=>clearTimeout(lpTimer));
    el.addEventListener('touchcancel',()=>clearTimeout(lpTimer));
  });
}

function updateRdLikeBtn(){
const btn=document.getElementById('rdLikeBtn');
if(!btn)return;
btn.innerHTML=isLiked(curRd)?'<i class="fas fa-heart" style="color:#ff6b6b"></i>':'<i class="fas fa-heart" style="color:var(--text2)"></i>';
}

function toggleCurrentLike(){
if(!curRd)return;
toggleLike(curRd.id);
updateRdLikeBtn();
// 更新翻页器浮层菜单中的收藏按钮
// [FIX-4] 状态同步：用安全的函数存在性检查替代静默 catch，
// _rdRefreshOverlay 内部若有 DOM 缺失等问题会正常抛出，不再被吞掉
if(typeof _rdRefreshOverlay === 'function'){ try{ _rdRefreshOverlay(); }catch(e){ console.error('[toggleCurrentLike] _rdRefreshOverlay 执行失败:', e); } }
// 更新续写按钮状态
const liked=isLiked(curRd);
const cw2=document.getElementById('contWrap');
const dw2=document.getElementById('dirInputWrap');
const bc2=document.getElementById('btnCont');
var smartBtn=document.getElementById('btnSmartCont');
if(curRd.type==='long'){
if(cw2) cw2.style.display='block';
if(dw2) dw2.style.display='flex';
if(bc2){
  if(liked){bc2.disabled=false;bc2.innerHTML='<i class="fas fa-pen-nib"></i> 续写第'+(curRd&&curRd.chapters?curRd.chapters.length+1:2)+'章';}
  else{bc2.disabled=true;bc2.textContent='请先收藏后才能续写';}
}
if(smartBtn){
  if(liked){smartBtn.disabled=false;smartBtn.innerHTML='<i class="fas fa-brain"></i> 智能续写';}
  else{smartBtn.disabled=true;smartBtn.textContent='请先收藏';}
}
if(liked && bc2) bc2.scrollIntoView({behavior:'smooth',block:'center'});
}else{
if(cw2) cw2.style.display='none';
if(dw2) dw2.style.display='none';
}
}
function openChapterList(preserveExpand){
if(!curRd||!curRd.chapters)return;
if(!preserveExpand)_chCatalogExpanded={}; // 重新打开目录：所有分卷/未分卷默认折叠
document.getElementById('chPanelTitle').textContent='「'+curRd.title+'」目录';
document.getElementById('chPanelInfo').textContent='共 '+curRd.chapters.length+' 章 · '+getTotalWords(curRd)+' 字';
const list=document.getElementById('chPanelList');
const fsStats=fsChapterStats(curRd.id); // 每章的伏笔统计，用来给目录里的章节打金色/灰色小圆点
_renderChListGrouped(curRd,list,function(i){
const wc=countWords(curRd.chapters[i]);
const item=document.createElement('div');
item.className='ch-item'+(i===curCh?' act':'');
const chNotes=getArticleNotes(curRd.id).filter(n=>n.ch===i); const noteTag=chNotes.length>0?' · <i class="fas fa-pen"></i>'+chNotes.length:''; const readTime=Math.ceil(wc/500); const fsSt=fsStats[i]; const fsTag=fsSt?' · <i class="fas fa-circle '+(fsSt.pending>0?'fs-dot-gold':'fs-dot-gray')+'" title="'+(fsSt.pending>0?'有未回收伏笔':'伏笔均已回收')+'" aria-label="'+(fsSt.pending>0?'有未回收伏笔':'伏笔均已回收')+'"></i>'+(fsSt.pending+fsSt.done):''; var chSummary = (curRd.chSummaries && curRd.chSummaries[i]) ? curRd.chSummaries[i] : '';
item.innerHTML='<span class="ch-item-num" style="font-size:14px;font-weight:700;width:60px;flex-shrink:0">第'+(i+1)+'章</span><div style="flex:1;min-width:0"><span style="font-size:12px;color:var(--text2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:block">'+esc((curRd.chapters[i]||'').replace(/\n/g,' ').substring(0,30))+'</span>'+(chSummary?'<span class="ch-summary">'+esc(chSummary)+'</span>':'')+'</div><span class="ch-item-wc" style="flex-shrink:0;font-size:10px;opacity:.7">'+wc+'字 · '+readTime+'min'+noteTag+fsTag+'</span>';
item.onclick=()=>{curCh=i;renderChContent();closeChapterList();document.getElementById('rdModal').scrollTop=0;};
_bindChItemLongPressDelete(item,function(){openChAction(curRd,i);});
return item;
},_chCatalogExpanded);
// 为此卷生成梗概 按钮
var oldSumBtn = document.getElementById('volSynBtnDiv');
if(oldSumBtn) oldSumBtn.parentElement.removeChild(oldSumBtn);
var sumBtnDiv = document.createElement('div');
sumBtnDiv.id = 'volSynBtnDiv';
sumBtnDiv.style.cssText = 'padding:10px 18px;border-top:1px solid var(--border)';
sumBtnDiv.innerHTML = '<button style="width:100%;padding:10px;border-radius:10px;border:1px solid var(--accent);background:transparent;color:var(--accent2);font-size:12px;cursor:pointer" onclick="openVolSynPicker()"><i class="fas fa-robot"></i> 为此卷生成梗概</button>';
document.getElementById('chPanelList').parentElement.appendChild(sumBtnDiv);
document.getElementById('chOv').classList.add('show');
navPush('chOv');
}
// ==================== 为此卷生成梗概 ====================
// 与"章节自动摘要"（逐章一句话摘要，写入 chSummaries）是完全不同的功能：
// 这里生成的是"分卷剧情梗概"，写入 volumes[].summary，用户选好分卷后一键替换/追加进该分卷的梗概字段。
let volSynExcerptLen=ld('bj_volSynExcerptLen',1000); // 默认模式下每章开头/结尾各截取的字数（500-2000，可在设置中调节）
function setVolSynExcerptLen(v){
  var n=parseInt(v,10);
  if(isNaN(n))n=1000;
  n=Math.max(500,Math.min(2000,n));
  volSynExcerptLen=n;
  sv('bj_volSynExcerptLen',n);
  var input=document.getElementById('volSynExcerptLenInput');
  if(input)input.value=n; // 回写修正后的值，避免用户输入超出范围的数字后界面和实际生效值不一致
}
var _volSynGenerating=false; // 防止用户连续触发导致同一分卷被重复请求
var _volSynCtx=null; // {volId,volName} 当前正在预览/待写入的分卷
function openVolSynPicker(){
  if(!curRd||!curRd.chapters){showToast('没有章节');return;}
  if(_volSynGenerating){showToast('正在生成中，请稍候');return;}
  // excludeNone=true：生成梗概必须对应一个具体分卷，不允许选"不分卷"
  openVolPicker(curRd,null,function(volId){
    if(!volId)return;
    genVolSynopsis(volId);
  },null,true);
}
async function genVolSynopsis(volId){
  if(!curRd||!curRd.chapters){showToast('没有章节');return;}
  if(_volSynGenerating){showToast('正在生成中，请稍候');return;}
  var vol=(curRd.volumes||[]).find(function(v){return v.id===volId;});
  if(!vol){showToast('分卷不存在，请重新选择');return;}
  var groups=_buildVolGroups(curRd);
  var grp=groups.find(function(g){return g.id===volId;});
  var indices=grp?grp.indices:[];
  // 生成失败原因1：这个分卷里目前没有任何章节
  if(indices.length===0){
    showDlg('生成失败','分卷「'+(vol.name||'未命名分卷')+'」里还没有任何章节，暂时无法生成梗概。请先在目录里把章节移动到这个分卷，再重新生成。');
    return;
  }
  var cfg=getCurApi();
  if(!cfg.url||!cfg.key){showToast('请先配置API');return;}
  var sysMsg='',userMsg='';
  if(volSynFromOutline){
    // 大纲模式：只发送该卷每章大纲，大幅减少上下文消耗；只要有一章大纲为空就整体拦截，提醒用户先补充
    var missing=[];
    var outlineParts=[];
    indices.forEach(function(i){
      var ol=(curRd.chOutlines&&curRd.chOutlines[i])?curRd.chOutlines[i].trim():'';
      if(!ol) missing.push(i+1);
      else outlineParts.push('第'+(i+1)+'章大纲：\n'+ol);
    });
    if(missing.length>0){
      showDlg('大纲不完整','第'+missing.join('、')+'章的章节大纲还是空的，请先在"章节大纲"里补充完整，再来生成本卷梗概。');
      return;
    }
    sysMsg='你是一名网络小说编辑。请根据下面这一整卷每一章的大纲，为这一卷写一段连贯的剧情梗概（200-400字）。语言精炼，聚焦主线发展和关键转折，不要逐章罗列流水账，不要输出梗概正文之外的任何内容（不要标题、不要说明）。';
    userMsg=outlineParts.join('\n\n');
  }else{
    // 默认模式：每章只截取开头+结尾各一段（长度可调节），拼接后发送
    var len=(typeof volSynExcerptLen==='number'&&volSynExcerptLen>=500&&volSynExcerptLen<=2000)?volSynExcerptLen:1000;
    var excerptParts=[];
    var hasContent=false;
    indices.forEach(function(i){
      var text=curRd.chapters[i]||'';
      if(countWords(text)>0)hasContent=true;
      var seg;
      if(countWords(text)<=len*2){
        seg=text;
      }else{
        seg=text.substring(0,len)+'\n……（中间省略）……\n'+text.substring(text.length-len);
      }
      excerptParts.push('第'+(i+1)+'章节选：\n'+seg);
    });
    // 生成失败原因2：分卷内的章节都还没有正文内容
    if(!hasContent){
      showToast('该分卷内的章节暂无正文内容，无法生成梗概');
      return;
    }
    sysMsg='你是一名网络小说编辑。请根据下面这一整卷各章节的内容节选（每章仅截取开头和结尾片段，中间部分已省略），为这一卷写一段连贯的剧情梗概（200-400字）。语言精炼，聚焦主线发展和关键转折，不要逐章罗列流水账，不要输出梗概正文之外的任何内容（不要标题、不要说明）。';
    userMsg=excerptParts.join('\n\n');
  }
  _volSynGenerating=true;
  var volName=vol.name||'未命名分卷';
  showToast('正在为「'+volName+'」生成梗概...',3000);
  var _synArticleId=curRd.id; // 防止生成过程中用户切换了文章，结果写错地方
  try{
    var result=await callToolAPINonStream([{role:'system',content:sysMsg},{role:'user',content:userMsg}]);
    if(!curRd||curRd.id!==_synArticleId){showToast('文章已切换，本次生成结果已丢弃');return;}
    var stillVol=(curRd.volumes||[]).find(function(v){return v.id===volId;});
    if(!stillVol){showToast('该分卷已被删除，本次生成结果已丢弃');return;}
    if(!result||!result.trim()){showToast('生成失败，请重试',3000);return;}
    _volSynCtx={volId:volId,volName:stillVol.name||volName};
    openVolSynResult(result.trim());
  }catch(e){
    showToast('生成失败，请重试',3000);
  }finally{
    _volSynGenerating=false;
  }
}
function openVolSynResult(text){
  var ta=document.getElementById('volSynResultContent');
  if(!ta)return;
  ta.value=text;
  document.getElementById('volSynResultOv').classList.add('show');
  navPush('volSynResultOv');
}
function closeVolSynResult(){
  navPop('volSynResultOv');
  document.getElementById('volSynResultOv').classList.remove('show');
  _volSynCtx=null;
}
function commitVolSynResult(mode){
  if(!_volSynCtx||!curRd){closeVolSynResult();return;}
  var ta=document.getElementById('volSynResultContent');
  var text=(ta&&ta.value||'').trim();
  if(!text){showToast('梗概内容不能为空');return;}
  var vol=(curRd.volumes||[]).find(function(v){return v.id===_volSynCtx.volId;});
  if(!vol){showToast('该分卷已被删除');closeVolSynResult();return;}
  var doWrite=function(){
    var newSummary=(mode==='append'&&vol.summary&&vol.summary.trim())?(vol.summary.trim()+'\n\n'+text):text;
    _updateVolumeMeta(curRd,vol.id,vol.name,newSummary);
    _persistWorkAfterVolChange(curRd);
    closeVolSynResult();
    showToast(mode==='append'?'已追加到本卷梗概':'已替换本卷梗概');
    openChapterList(true);
  };
  if(mode==='replace'&&vol.summary&&vol.summary.trim()){
    showDlg('替换本卷梗概','这会覆盖该分卷当前已有的梗概内容，确定要替换吗？',doWrite,true);
  }else{
    doWrite();
  }
}
// ==================== NOTES ====================
let noteFilterTag='全部';
let noteSelectedTag='';
let noteSort='new'; // new, old, tag
let noteAllView=false; // 全文笔记视图

function getArticleNotes(articleId){
if(!articleId)return[];
return ld('bj_notes_'+articleId,[]);
}
function saveArticleNotes(articleId,notes){
sv('bj_notes_'+articleId,notes);
}

function selectNoteTag(tag,el){
noteSelectedTag=tag;
document.querySelectorAll('#noteTagSelect .note-sel-tag').forEach(s=>{
s.classList.remove('act');
s.style.borderColor='var(--border)';
s.style.background='transparent';
s.style.color='var(--text2)';
});
el.classList.add('act');
el.style.borderColor='var(--accent)';
el.style.background='rgba(108,92,231,.15)';
el.style.color='var(--accent2)';
}

function filterNotes(tag,el){
noteFilterTag=tag;
document.querySelectorAll('.note-tag-btn').forEach(b=>{
b.classList.remove('act');
b.style.borderColor='var(--border)';
b.style.background='transparent';
b.style.color='var(--text2)';
});
el.classList.add('act');
el.style.borderColor='var(--accent)';
el.style.background='var(--accent)';
el.style.color='#fff';
renderNotes();
}

function setNoteSort(mode,el){
noteSort=mode;
document.querySelectorAll('.note-sort-btn').forEach(b=>b.classList.remove('act'));
el.classList.add('act');
renderNotes();
}

function openNotePanel(){
if(!curRd)return;
noteFilterTag='全部';
noteAllView=false;
try{document.getElementById('noteAllViewBtn').style.background='';document.getElementById('noteAllViewBtn').style.borderColor='var(--border)';}catch(e){logError('op',e)}
document.querySelectorAll('.note-tag-btn').forEach(b=>{
b.classList.remove('act');
b.style.borderColor='var(--border)';
b.style.background='transparent';
b.style.color='var(--text2)';
});
const firstBtn=document.querySelector('.note-tag-btn[data-tag="全部"]');
if(firstBtn){
firstBtn.classList.add('act');
firstBtn.style.borderColor='var(--accent)';
firstBtn.style.background='var(--accent)';
firstBtn.style.color='#fff';
}
const chLabel=curRd.type==='long'?'第'+(curCh+1)+'章':'全文';
document.getElementById('noteChInfo').textContent=chLabel+'的笔记';
renderNotes();
document.getElementById('noteOv').classList.add('show');
navPush('noteOv');
setTimeout(()=>{var ni=document.getElementById('noteInput');ni.focus();ni.click();},300);
}
function closeNotePanel(){
  navPop('noteOv');
document.getElementById('noteOv').classList.remove('show');
noteAllView=false;
}

// 富文本渲染：**加粗** ~~删除线~~
function renderNoteRichText(text){
let html=esc(text);
// **加粗**
html=html.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>');
// ~~删除线~~
html=html.replace(/~~(.+?)~~/g,'<del>$1</del>');
return html;
}

// 更新笔记统计
function updateNoteStats(){
if(!curRd)return;
const notes=getArticleNotes(curRd.id);
const el=document.getElementById('noteStats');
if(!el)return;
if(noteAllView){
const totalWords=notes.reduce((s,n)=>s+countWords(n.text||''),0);
el.textContent='全文共 '+notes.length+' 条笔记，'+totalWords+' 字';
}else{
const chNotes=notes.filter(n=>n.ch===curCh);
const chWords=chNotes.reduce((s,n)=>s+countWords(n.text||''),0);
el.textContent='本章 '+chNotes.length+' 条笔记，'+chWords+' 字';
}
}

// 切换全文笔记视图
function toggleNoteAllView(){
noteAllView=!noteAllView;
const btn=document.getElementById('noteAllViewBtn');
if(noteAllView){
btn.style.background='var(--accent)';
btn.style.borderColor='var(--accent)';
btn.style.color='#fff';
document.getElementById('noteChInfo').textContent='全文笔记';
}else{
btn.style.background='';
btn.style.borderColor='var(--border)';
btn.style.color='var(--text2)';
const chLabel=curRd&&curRd.type==='long'?'第'+(curCh+1)+'章':'全文';
document.getElementById('noteChInfo').textContent=chLabel+'的笔记';
}
renderNotes();
}

function renderNotes(){
if(!curRd)return;
const allNotes=getArticleNotes(curRd.id);
let displayNotes=[];

if(noteAllView){
// 全文视图：所有章节的笔记
displayNotes=allNotes.slice();
}else{
// 当前章节
displayNotes=allNotes.filter(n=>n.ch===curCh);
}

// 按标签筛选
if(noteFilterTag&&noteFilterTag!=='全部'){
displayNotes=displayNotes.filter(n=>(n.tag||'')===noteFilterTag);
}

// 排序
if(noteSort==='old'){
displayNotes.sort((a,b)=>new Date(a.time||0)-new Date(b.time||0));
}else if(noteSort==='tag'){
const tagOrder={'灵感':0,'修改':1,'伏笔':2,'吐槽':3,'':4};
displayNotes.sort((a,b)=>(tagOrder[a.tag||'']||4)-(tagOrder[b.tag||'']||4));
}else{
// new：最新在前
displayNotes.sort((a,b)=>new Date(b.time||0)-new Date(a.time||0));
}

// 置顶的放最前面
displayNotes.sort((a,b)=>(b.pinned?1:0)-(a.pinned?1:0));

updateNoteStats();

const list=document.getElementById('noteList');
if(displayNotes.length===0){
const hint=noteAllView?'整篇文章还没有笔记':
(noteFilterTag!=='全部'?'该标签下没有笔记':'还没有笔记<br>在下方输入框写下你的想法吧');
list.innerHTML='<div class="note-empty">'+hint+'</div>';
return;
}
list.innerHTML='';

// 如果是全文视图+按标签排序以外的排序，按章节分组显示
let lastChLabel='';

displayNotes.forEach((n,idx)=>{
const realIdx=allNotes.indexOf(n);

// 全文视图下显示章节分隔
if(noteAllView && noteSort!=='tag'){
const chLabel=curRd.type==='long'?'第'+(n.ch+1)+'章':'全文';
if(chLabel!==lastChLabel){
lastChLabel=chLabel;
const divider=document.createElement('div');
divider.className='note-all-ch-label';
divider.textContent=chLabel;
list.appendChild(divider);
}
}

const item=document.createElement('div');
item.className='note-item'+(n.pinned?' pinned':'');
item.setAttribute('data-tag',n.tag||'');
const time=n.time?new Date(n.time).toLocaleString():'';
const tagColors={'灵感':'#f1c40f','修改':'#3498db','伏笔':'#e67e22','吐槽':'#2ecc71'};
const tagEmoji={'灵感':'<i class="fas fa-lightbulb"></i>','修改':'<i class="fas fa-pen"></i>','伏笔':'<i class="fas fa-bullseye"></i>','吐槽':'<i class="fas fa-face-laugh-squint"></i>'};
let tagHtml='';
if(n.tag){
tagHtml='<span style="display:inline-block;padding:1px 6px;border-radius:6px;font-size:9px;background:'+(tagColors[n.tag]||'var(--accent)')+'22;color:'+(tagColors[n.tag]||'var(--accent2)')+';margin-bottom:4px">'+(tagEmoji[n.tag]||'')+' '+n.tag+'</span>';
}
const isQuote=n.text.startsWith('「');
let noteStyle='';
if(isQuote){
noteStyle='border-left:3px solid var(--accent);padding-left:12px;background:rgba(108,92,231,.04);border-radius:0 8px 8px 0;padding:10px 12px 10px 14px;margin:-4px -8px;cursor:pointer;';
}
const pinIcon=n.pinned?'<span class="note-pin-icon" style="margin-right:4px"><i class="fas fa-thumbtack"></i></span>':'';
const chInfoText=noteAllView&&curRd.type==='long'?' · 第'+(n.ch+1)+'章':'';

item.innerHTML=
pinIcon+tagHtml+
'<div class="note-item-text" style="'+noteStyle+'"'+(isQuote&&typeof n.paraIdx==='number'?' onclick="jumpToNotePara('+n.paraIdx+')"':'')+'>'+renderNoteRichText(n.text)+'</div>'+
'<div class="note-item-ft">'+
'<span class="note-item-time">'+time+chInfoText+'</span>'+
'<div style="display:flex;gap:4px">'+
'<button style="background:none;border:none;color:var(--text2);font-size:9px;cursor:pointer;padding:2px 6px" onclick="toggleNotePin('+realIdx+')">'+(n.pinned?'<i class="fas fa-thumbtack"></i>取消':'<i class="fas fa-thumbtack"></i>置顶')+'</button>'+
'<button style="background:none;border:none;color:var(--text2);font-size:9px;cursor:pointer;padding:2px 6px" onclick="editNote('+realIdx+')">编辑</button>'+
'<button style="background:none;border:none;color:var(--text2);font-size:9px;cursor:pointer;padding:2px 6px" onclick="copyNoteText('+realIdx+')">复制</button>'+
'<button class="note-item-del" onclick="deleteNote('+realIdx+')">删除</button>'+
'</div>'+
'</div>';
list.appendChild(item);
});
if(noteSort!=='old')list.scrollTop=0;
else list.scrollTop=list.scrollHeight;
}

// 笔记置顶
function toggleNotePin(realIdx){
if(!curRd)return;
const notes=getArticleNotes(curRd.id);
if(realIdx<0||realIdx>=notes.length)return;
notes[realIdx].pinned=!notes[realIdx].pinned;
saveArticleNotes(curRd.id,notes);
renderNotes();
showToast(notes[realIdx].pinned?'已置顶':'已取消置顶');
}

// 跳转到原文段落
function jumpToNotePara(paraIdx){
closeNotePanel();
setTimeout(()=>{
const content=document.getElementById('rdContent');
if(!content)return;
const paras=content.querySelectorAll('.rd-para');
if(paraIdx>=0&&paraIdx<paras.length){
const target=paras[paraIdx];
target.scrollIntoView({behavior:'smooth',block:'center'});
target.style.background='rgba(108,92,231,.25)';
target.style.boxShadow='inset 0 0 0 2px var(--accent)';
setTimeout(()=>{
target.style.background='';
target.style.boxShadow='';
},2500);
}
},350);
}

function addNote(){
if(!curRd)return;
const input=document.getElementById('noteInput');
const text=(input.value||'').trim();
if(!text){showToast('请输入笔记内容');return;}
const notes=getArticleNotes(curRd.id);
notes.push({
ch:curCh,
text:text,
tag:noteSelectedTag||'',
time:new Date().toISOString(),
pinned:false
});
saveArticleNotes(curRd.id,notes);
input.value='';
input.style.height='38px';
renderNotes();
updateNoteBtn();
showToast('笔记已保存');
setTimeout(()=>{
const list=document.getElementById('noteList');
const lastItem=list.querySelector('.note-item:last-child');
if(lastItem){
lastItem.style.animation='noteSlideIn .4s ease';
}
},50);
}

function editNote(realIdx){
if(!curRd)return;
const notes=getArticleNotes(curRd.id);
if(realIdx<0||realIdx>=notes.length)return;
const n=notes[realIdx];
const input=document.getElementById('noteInput');
input.value=n.text;
input.style.height='38px';
input.style.height=Math.min(input.scrollHeight,100)+'px';
input.focus();
if(n.tag){
const tagEl=document.querySelector('#noteTagSelect .note-sel-tag[data-val="'+n.tag+'"]');
if(tagEl)selectNoteTag(n.tag,tagEl);
}
notes.splice(realIdx,1);
saveArticleNotes(curRd.id,notes);
renderNotes();
updateNoteBtn();
showToast('正在编辑笔记，修改后点击「记录」保存');
}

function copyNoteText(realIdx){
if(!curRd)return;
const notes=getArticleNotes(curRd.id);
if(realIdx<0||realIdx>=notes.length)return;
doCopy(notes[realIdx].text);
}

function deleteNote(realIdx){
if(!curRd)return;
const notes=getArticleNotes(curRd.id);
if(realIdx<0||realIdx>=notes.length)return;
notes.splice(realIdx,1);
saveArticleNotes(curRd.id,notes);
renderNotes();
updateNoteBtn();
showToast('笔记已删除');
}

function updateNoteBtn(){
if(!curRd)return;
const btn=document.getElementById('rdNoteBtn');
if(!btn)return;
const notes=getArticleNotes(curRd.id)||[];
const chNotes=notes.filter(n=>n&&n.ch===curCh);
if(chNotes.length>0){
btn.innerHTML='<i class="fas fa-file-alt"></i><span class="note-dot"></span>';
btn.title='本章有'+chNotes.length+'条笔记';
}else{
btn.innerHTML='<i class="fas fa-file-alt"></i>';
btn.title='添加笔记';
}
}

function getNoteCount(articleId){
const notes=ld('bj_notes_'+articleId,[]);
return notes.length;
}
function showParaContextMenu(text, paraIdx){
  if(!text || !text.trim()) return;
  var short = text.length > 60 ? text.substring(0, 60) + '...' : text;
  showDlg('选择操作', '「' + short + '」\n\n你想：', function(){
    showQuoteNote(text);
  });
  setTimeout(function(){
    var okBtn = document.getElementById('dlgOkBtn');
    if(okBtn) okBtn.textContent = '记笔记';
    var msgEl = document.getElementById('dlgMsg');
    if(msgEl){
      window._favTempData = {text:text,articleId:curRd?curRd.id:'',articleTitle:curRd?curRd.title:'',chIdx:curCh,paraIdx:paraIdx};
      msgEl.innerHTML += '<div style="display:flex;flex-direction:column;gap:8px;margin-top:12px">'
        +'<button onclick="closeDlg();addToFavorites(window._favTempData.text,window._favTempData.articleId,window._favTempData.articleTitle,window._favTempData.chIdx,window._favTempData.paraIdx)" style="width:100%;padding:10px;border-radius:10px;border:1px solid var(--accent);background:rgba(108,92,231,.1);color:var(--accent2);font-size:12px;font-weight:600;cursor:pointer"><i class="fas fa-star"></i> 收藏到收藏夹</button>'
        +'<button onclick="closeDlg();sendParaToXj(window._favTempData.text)" style="width:100%;padding:10px;border-radius:10px;border:1px solid rgba(39,174,96,.4);background:rgba(39,174,96,.08);color:var(--success);font-size:12px;font-weight:600;cursor:pointer"><i class="fas fa-question-circle"></i> 这里发生了什么？</button>'
        +'</div>';
    }
  }, 50);
}
function showQuoteNote(quoteText){
if(!curRd)return;
const short=quoteText.length>40?quoteText.substring(0,40)+'...':quoteText;
// 找到段落索引
let paraIdx=-1;
const content=document.getElementById('rdContent');
if(content){
const paras=content.querySelectorAll('.rd-para');
paras.forEach((p,i)=>{
if(p.textContent.trim()===quoteText.trim())paraIdx=i;
});
}
openNotePanel();
setTimeout(()=>{
const inp=document.getElementById('noteInput');
inp.value='「'+short+'」\n——我的想法：';
inp.style.height='38px';
inp.style.height=Math.min(inp.scrollHeight,100)+'px';
inp.focus();
inp.setSelectionRange(inp.value.length,inp.value.length);
// 临时存储段落索引，保存时会用
window._quoteParaIdx=paraIdx;
},350);
}

// 覆盖addNote，让引用笔记带上段落索引
addNote=function(){
if(!curRd)return;
const input=document.getElementById('noteInput');
const text=(input.value||'').trim();
if(!text){showToast('请输入笔记内容');return;}
const notes=getArticleNotes(curRd.id);
const noteObj={
ch:curCh,
text:text,
tag:noteSelectedTag||'',
time:new Date().toISOString(),
pinned:false
};
// 如果有引用段落索引
if(typeof window._quoteParaIdx==='number'&&window._quoteParaIdx>=0&&text.startsWith('「')){
noteObj.paraIdx=window._quoteParaIdx;
}
window._quoteParaIdx=undefined;
notes.push(noteObj);
saveArticleNotes(curRd.id,notes);
input.value='';
input.style.height='38px';
renderNotes();
updateNoteBtn();
showToast('笔记已保存');
setTimeout(()=>{
const list=document.getElementById('noteList');
const lastItem=list.querySelector('.note-item:last-child');
if(lastItem){
lastItem.style.animation='noteSlideIn .4s ease';
}
},50);
};

function toggleNoteSearch(){
const wrap=document.getElementById('noteSearchWrap');
const input=document.getElementById('noteSearchInput');
if(!wrap||!input)return;
if(!wrap.classList.contains('show')){
foldSlide(wrap,true);
// preventScroll：展开动画刚开始时输入框还在被裁剪的区域里，避免浏览器为了露出它去滚动被裁剪的容器
input.focus({preventScroll:true});
}else{
foldSlide(wrap,false);
input.value='';
renderNotes();
}
}
function searchNotes(keyword){
if(!curRd)return;
const kw=keyword.trim().toLowerCase();
if(!kw){renderNotes();return;}
const notes=getArticleNotes(curRd.id);
let filtered=noteAllView?notes.slice():notes.filter(n=>n.ch===curCh);
if(noteFilterTag&&noteFilterTag!=='全部'){
filtered=filtered.filter(n=>(n.tag||'')===noteFilterTag);
}
filtered=filtered.filter(n=>n.text.toLowerCase().includes(kw));
const list=document.getElementById('noteList');
if(filtered.length===0){
list.innerHTML='<div class="note-empty" style="padding:20px">没有找到匹配的笔记</div>';
return;
}
list.innerHTML='';
filtered.forEach(n=>{
const realIdx=notes.indexOf(n);
const item=document.createElement('div');
item.className='note-item'+(n.pinned?' pinned':'');
item.setAttribute('data-tag',n.tag||'');
const time=n.time?new Date(n.time).toLocaleString():'';
const tagColors={'灵感':'#f1c40f','修改':'#3498db','伏笔':'#e67e22','吐槽':'#2ecc71'};
const tagEmoji={'灵感':'<i class="fas fa-lightbulb"></i>','修改':'<i class="fas fa-pen"></i>','伏笔':'<i class="fas fa-bullseye"></i>','吐槽':'<i class="fas fa-face-laugh-squint"></i>'};
let tagHtml='';
if(n.tag){tagHtml='<span style="display:inline-block;padding:1px 6px;border-radius:6px;font-size:9px;background:'+(tagColors[n.tag]||'var(--accent)')+'22;color:'+(tagColors[n.tag]||'var(--accent2)')+';margin-bottom:4px">'+(tagEmoji[n.tag]||'')+' '+n.tag+'</span>';}
const pinIcon=n.pinned?'<span class="note-pin-icon" style="margin-right:4px"><i class="fas fa-thumbtack"></i></span>':'';
const highlightedText=renderNoteRichText(n.text).replace(new RegExp('('+kw.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','gi'),'<mark style="background:rgba(108,92,231,.3);color:var(--text);border-radius:2px;padding:0 2px">$1</mark>');
item.innerHTML=pinIcon+tagHtml+'<div class="note-item-text">'+highlightedText+'</div><div class="note-item-ft"><span class="note-item-time">'+time+'</span><button class="note-item-del" onclick="deleteNote('+realIdx+')">删除</button></div>';
list.appendChild(item);
});
}

function exportArticleNotes(){
if(!curRd)return;
const notes=getArticleNotes(curRd.id);
if(notes.length===0){showToast('没有笔记可导出');return;}
let text='「'+(curRd.title||'未命名')+'」的笔记\n';
text+='导出时间：'+new Date().toLocaleString()+'\n';
text+='共 '+notes.length+' 条笔记\n';
text+='════════════════════\n\n';
const grouped={};
notes.forEach(n=>{
const chKey=curRd.type==='long'?'第'+(n.ch+1)+'章':'全文';
if(!grouped[chKey])grouped[chKey]=[];
grouped[chKey].push(n);
});
Object.keys(grouped).forEach(chKey=>{
text+='【'+chKey+'】\n';
grouped[chKey].forEach(n=>{
const tagStr=n.tag?'['+n.tag+'] ':'';
const pinStr=n.pinned?'[置顶] ':'';
const time=n.time?new Date(n.time).toLocaleString():'';
text+=pinStr+tagStr+n.text+'\n';
text+='  — '+time+'\n\n';
});
});
var _nf='星叙_《'+(curRd.title||'未命名').replace(/[\\/:*?"<>|]/g,'_')+'》笔记_'+new Date().toLocaleDateString().replace(/\//g,'-')+'.txt';
_exportFileWithFallback(_nf,text,'text/plain;charset=utf-8');
}

// 从剪贴板导入笔记
async function importNotesFromClipboard(){
if(!curRd){showToast('请先打开一篇文章');return;}
showInp('导入笔记','粘贴之前导出的笔记内容（请先点「导出所有笔记」复制内容）',function(val){
if(!val.trim()){showToast('内容为空');return;}
doImportNotes(val);
});
}

function doImportNotes(text){
if(!text||!curRd){showToast('没有内容可导入');return;}
const lines=text.split('\n');
const notes=getArticleNotes(curRd.id);
let importCount=0;
let currentCh=curCh;
let currentTag='';
for(let i=0;i<lines.length;i++){
const line=lines[i].trim();
// 章节标记
const chMatch=line.match(/^【第(\d+)章】$/);
if(chMatch){
currentCh=parseInt(chMatch[1])-1;
continue;
}
if(line.startsWith('【')&&line.endsWith('】'))continue;
if(!line||line.startsWith('════')||line.startsWith('导出时间')||line.startsWith('共 ')||line.startsWith('「'))continue;
if(line.startsWith('  —')||line.startsWith('— '))continue;
// 解析标签
let tag='';
let noteText=line;
const tagMatch=line.match(/^\[(置顶)\]\s*/);
let pinned=false;
if(tagMatch){
pinned=true;
noteText=noteText.replace(/^\[置顶\]\s*/,'');
}
const tagMatch2=noteText.match(/^\[(灵感|修改|伏笔|吐槽)\]\s*/);
if(tagMatch2){
tag=tagMatch2[1];
noteText=noteText.replace(/^\[(灵感|修改|伏笔|吐槽)\]\s*/,'');
}
if(!noteText.trim())continue;
// 检查是否已存在相同内容
const exists=notes.some(n=>n.text===noteText&&n.ch===currentCh);
if(!exists){
notes.push({
ch:currentCh,
text:noteText,
tag:tag,
time:new Date().toISOString(),
pinned:pinned
});
importCount++;
}
}
if(importCount>0){
saveArticleNotes(curRd.id,notes);
renderNotes();
updateNoteBtn();
showToast('已导入 '+importCount+' 条笔记');
}else{
showToast('没有新笔记可导入（可能已存在或格式不匹配）');
}
}
function closeChapterList(){
  navPop('chOv');
document.getElementById('chOv').classList.remove('show');
}
// 阅读页目录：按索引确认删除章节（我的小说/收藏长篇通用，二者都通过 curRd 读写）
function confirmDeleteRdChapterAt(idx){
  if(!curRd||!curRd.chapters)return;
  if(idx<0||idx>=curRd.chapters.length)return;
  if(curRd.chapters.length<=1){showToast('至少保留一章');return;}
  var chWc=countWords(curRd.chapters[idx]||'');
  var chLabel='第'+(idx+1)+'章'+(curRd.chNames&&curRd.chNames[idx]?' '+curRd.chNames[idx]:'');
  showDlg('删除章节','确定要删除'+chLabel+'吗？('+chWc+'字)\n\n此操作不可恢复！',function(){
    deleteRdChapterAt(idx);
  },true);
}
// 阅读页目录：按索引执行删除，同步清理平行数组并回写到工作台/收藏夹
function deleteRdChapterAt(idx){
  if(!curRd||!curRd.chapters||idx<0||idx>=curRd.chapters.length)return;
  if(curRd.chapters.length<=1){showToast('至少保留一章');return;}
  var _chCountBefore=curRd.chapters.length;
  _shiftChapterVersionsAfterDelete(curRd.id,idx,_chCountBefore);
  _removeChMeta(curRd.id,idx);
  curRd.chapters.splice(idx,1);
  if(curRd.chNames&&curRd.chNames.length>idx)curRd.chNames.splice(idx,1);
  if(curRd.chOutlines&&curRd.chOutlines.length>idx)curRd.chOutlines.splice(idx,1);
  if(curRd.chOutlineTags&&curRd.chOutlineTags.length>idx)curRd.chOutlineTags.splice(idx,1);
  if(curRd.chOutlineUpdatedAt&&curRd.chOutlineUpdatedAt.length>idx)curRd.chOutlineUpdatedAt.splice(idx,1);
  if(curRd.chSummaries&&curRd.chSummaries.length>idx)curRd.chSummaries.splice(idx,1);
  if(curRd.chVolume&&curRd.chVolume.length>idx)curRd.chVolume.splice(idx,1);
  if(curCh>=curRd.chapters.length)curCh=curRd.chapters.length-1;
  else if(curCh>idx)curCh--;
  syncArticle(curRd);
  renderChContent();
  var metaEl=document.getElementById('rdMeta');
  if(metaEl){
    metaEl.innerHTML=
      '<span>'+(curRd.type==='long'?'<i class="fas fa-book"></i> 长篇连载':'<i class="fas fa-file"></i> 短篇')+'</span>'+
      '<span><i class="fas fa-clock"></i> '+new Date(curRd.createdAt).toLocaleDateString()+'</span>'+
      (curRd.chapters?'<span>共 '+curRd.chapters.length+' 章</span>':'')+
      '<span>'+getTotalWords(curRd)+' 字</span>';
  }
  var undoBtn=document.getElementById('btnUndo');
  if(undoBtn)undoBtn.style.display=(curRd.type==='long'&&curRd.chapters&&curRd.chapters.length>1)?'inline-block':'none';
  showToast('已删除');
  closeChapterList();
  openChapterList(true);
}
// ==================== 阅读页全屏原文编辑 ====================
let _rdEditDirty=false;
let _rdEditSearchMatches=[];
let _rdEditSearchIdx=-1;
// ==================== 编辑器内作品更名 ====================
function renameCurrentWork(){
  if(!curEd){showToast('没有打开的作品');return;}
  showInp('作品更名','输入新标题',function(name){
    name=name.trim();
    if(!name){showToast('标题不能为空');return;}
    curEd.title=name;
    var titleInput=document.getElementById('edTitle');
    if(titleInput)titleInput.value=name;
    curEd.updatedAt=new Date().toISOString();
    var idx=crWorks.findIndex(function(w){return w.id===curEd.id;});
    if(idx>-1)crWorks[idx]=curEd;
    sv('bj_crWorks',crWorks);
    showToast('已更名为「'+name+'」');
  });
  setTimeout(function(){
    var f=document.getElementById('inpField');
    if(f)f.value=curEd.title||'';
  },120);
}
function openRdInlineEdit(){
  if(!curRd){showToast('没有打开的文章');return;}
  var text='';
  var label='';
  if(curRd.type==='long'&&curRd.chapters){
    text=curRd.chapters[curCh]||'';
    var chName=(curRd.chNames&&curRd.chNames[curCh])?(' '+curRd.chNames[curCh]):'';
    label='<i class="fas fa-pen"></i> 编辑第'+(curCh+1)+'章'+esc(chName);
    if(curCh===0&&curRd.title&&text){
      var _tBar2=document.getElementById('rdEditTitleBar');
      var _tInp2=document.getElementById('rdEditTitle');
      if(_tBar2&&_tInp2){
        _tBar2.style.display='block';
        _tInp2.value=curRd.title||'';
      }
      var _ct2=curRd.title.replace(/^[#*《「【\s:：]+/,'').replace(/[》」】\s]+$/,'').trim().toLowerCase();
      var _tlines2=text.split('\n');
      var _fi2=_tlines2.findIndex(function(l){return l.trim().length>0;});
      if(_fi2>=0){
        var _fl2=_tlines2[_fi2].replace(/^[#*《「【\s:：]+/,'').replace(/[》」】\s]+$/,'').trim().toLowerCase();
        if(_fl2===_ct2){
          _tlines2.splice(0,_fi2+1);
          while(_tlines2.length>0&&_tlines2[0].trim()==='')_tlines2.shift();
          text=_tlines2.join('\n');
        }
      }
    }
  }else{
    text=curRd.content||'';
    label='<i class="fas fa-pen"></i> 编辑全文';
    var _tBar=document.getElementById('rdEditTitleBar');
    var _tInp=document.getElementById('rdEditTitle');
    if(_tBar&&_tInp){
      _tBar.style.display='block';
      _tInp.value=curRd.title||'';
    }
    if(curRd.title&&text){
      var _ct=curRd.title.replace(/^[#*《「【\s:：]+/,'').replace(/[》」】\s]+$/,'').trim().toLowerCase();
      var _tlines=text.split('\n');
      var _fi=_tlines.findIndex(function(l){return l.trim().length>0;});
      if(_fi>=0){
        var _fl=_tlines[_fi].replace(/^[#*《「【\s:：]+/,'').replace(/[》」】\s]+$/,'').trim().toLowerCase();
        if(_fl===_ct){
          _tlines.splice(0,_fi+1);
          while(_tlines.length>0&&_tlines[0].trim()==='')_tlines.shift();
          text=_tlines.join('\n');
        }
      }
    }
  }
  document.getElementById('rdEditHdrTitle').innerHTML=label;
  var ta=document.getElementById('rdEditTextarea');
  ta.value=text;
  var wc=countWords(text);
  document.getElementById('rdEditWcInfo').textContent=wc+'字';
  document.getElementById('rdEditWc2').textContent=wc+'字';
  document.getElementById('rdEditStatus').textContent='未修改';
  document.getElementById('rdEditSearchInput').value='';
  document.getElementById('rdEditSearchCount').textContent='';
  _rdEditDirty=false;
  _rdEditSearchMatches=[];
  _rdEditSearchIdx=-1;
  var rdEditEl=document.getElementById('rdEditModal');rdEditEl.style.display='flex';rdEditEl.classList.add('show');
  navPush('rdEditModal');
  document.getElementById('bnav').classList.add('hide');
  setTimeout(function(){ta.focus();},300);
}

function closeRdEdit(){
  if(_rdEditDirty){
    showDlg('未保存的修改','编辑的内容还没保存，确定要放弃吗？',function(){
      _rdEditDirty=false;
      closeRdEdit();
    },true);
    setTimeout(function(){var okBtn=document.getElementById('dlgOkBtn');if(okBtn)okBtn.textContent='放弃修改';},50);
    return;
  }
  var _tBarC=document.getElementById('rdEditTitleBar');
  if(_tBarC)_tBarC.style.display='none';
  navPop('rdEditModal');
  var rdEditEl2=document.getElementById('rdEditModal');rdEditEl2.classList.remove('show');setTimeout(function(){if(!rdEditEl2.classList.contains('show'))rdEditEl2.style.display='none';},50);
  document.getElementById('bnav').classList.remove('hide');
}

function onRdEditInput(){
  _rdEditDirty=true;
  document.getElementById('rdEditStatus').textContent='已修改 *';
  document.getElementById('rdEditStatus').style.color='var(--danger)';
  var wc=countWords(document.getElementById('rdEditTextarea').value||'');
  document.getElementById('rdEditWcInfo').textContent=wc+'字';
  document.getElementById('rdEditWc2').textContent=wc+'字';
}

function saveRdEdit(){
  if(!curRd){showToast('没有文章');return;}
  var newText=document.getElementById('rdEditTextarea').value||'';
  var oldWc=0;
  if(curRd.type==='long'&&curRd.chapters){
    oldWc=countWords(curRd.chapters[curCh]||'');
    curRd.chapters[curCh]=newText;
  }else{
    oldWc=countWords(curRd.content||'');
    curRd.content=newText;
  }
  curRd.updatedAt=new Date().toISOString();
  // 自动同步标题为第一章第一句话（长篇）/ 正文第一行（短篇）
  if(curRd.type==='long' && curCh===0){
    var _tInpEl2=document.getElementById('rdEditTitle');
    var _newTitle2=_tInpEl2?(_tInpEl2.value||'').trim():'';
    if(_newTitle2)curRd.title=_newTitle2;
  }else if(curRd.type==='short'){
    var _tInpEl=document.getElementById('rdEditTitle');
    var _newTitle=_tInpEl?(_tInpEl.value||'').trim():'';
    if(_newTitle)curRd.title=_newTitle;
  }
  syncArticle(curRd);
  _rdEditDirty=false;
  document.getElementById('rdEditStatus').textContent='已保存';
  renderArticles._force=true;
  renderArticles();
  document.getElementById('rdEditStatus').style.color='var(--success)';
  var newWc=countWords(newText);
  // 更新阅读页元信息
  try{
    var metaEl=document.getElementById('rdMeta');
    if(metaEl){
      var totalWc2=getTotalWords(curRd);
      metaEl.innerHTML=
        '<span>'+(curRd.type==='long'?'<i class="fas fa-book"></i> 长篇连载':'<i class="fas fa-file"></i> 短篇')+'</span>'+
        '<span><i class="fas fa-clock"></i> '+new Date(curRd.createdAt).toLocaleDateString()+'</span>'+
        (curRd.chapters?'<span>共 '+curRd.chapters.length+' 章</span>':'')+
        '<span>'+totalWc2+' 字</span>';
    }
  }catch(e){}
  showToast('已保存修改 ('+newWc+'字'+(newWc!==oldWc?' ·'+(newWc>oldWc?' +':' ')+(newWc-oldWc)+'字':'')+')');
  // 关闭并刷新阅读页
  var _tBarS=document.getElementById('rdEditTitleBar');
  if(_tBarS)_tBarS.style.display='none';
  navPop('rdEditModal');
  var rdEditEl3=document.getElementById('rdEditModal');rdEditEl3.classList.remove('show');setTimeout(function(){if(!rdEditEl3.classList.contains('show'))rdEditEl3.style.display='none';},300);
  document.getElementById('bnav').classList.remove('hide');
  renderChContent();
  // [FIX-4] 刷新浮层菜单：用函数存在性检查+错误日志替代静默 catch
  if(typeof _rdRefreshOverlay === 'function'){ try{ _rdRefreshOverlay(); }catch(e){ console.error('[rdEdit close] _rdRefreshOverlay 执行失败:', e); } }
}

// ========== 搜索功能 ==========
function rdEditDoCount(){
  var kw=(document.getElementById('rdEditSearchInput').value||'').trim();
  _rdEditSearchMatches=[];
  _rdEditSearchIdx=-1;
  if(!kw){
    document.getElementById('rdEditSearchCount').textContent='';
    return;
  }
  var ta=document.getElementById('rdEditTextarea');
  var text=(ta.value||'');
  var kwLower=kw.toLowerCase();
  var textLower=text.toLowerCase();
  var pos=0;
  while(true){
    var found=textLower.indexOf(kwLower,pos);
    if(found===-1)break;
    _rdEditSearchMatches.push({pos:found,len:kw.length});
    pos=found+1;
  }
  if(_rdEditSearchMatches.length>0){
    document.getElementById('rdEditSearchCount').textContent=_rdEditSearchMatches.length+' 个匹配';
  }else{
    document.getElementById('rdEditSearchCount').textContent='未找到';
    document.getElementById('rdEditSearchCount').style.color='var(--danger)';
    setTimeout(function(){document.getElementById('rdEditSearchCount').style.color='';},1500);
  }
}

function rdEditSearchNext(){
  if(_rdEditSearchMatches.length===0){rdEditDoCount();if(_rdEditSearchMatches.length===0)return;}
  _rdEditSearchIdx=(_rdEditSearchIdx+1)%_rdEditSearchMatches.length;
  rdEditGoToMatch();
}

function rdEditSearchPrev(){
  if(_rdEditSearchMatches.length===0)return;
  _rdEditSearchIdx=(_rdEditSearchIdx-1+_rdEditSearchMatches.length)%_rdEditSearchMatches.length;
  rdEditGoToMatch();
}

function rdEditGoToMatch(){
  var m=_rdEditSearchMatches[_rdEditSearchIdx];
  if(!m)return;
  var ta=document.getElementById('rdEditTextarea');
  ta.focus();
  ta.setSelectionRange(m.pos,m.pos+m.len);
  // 滚动到选中位置
  var lineHeight=parseInt(getComputedStyle(ta).lineHeight)||28;
  var charsPerLine=Math.floor(ta.clientWidth/14)||40;
  var approxLine=Math.floor(m.pos/charsPerLine);
  ta.scrollTop=Math.max(0,approxLine*lineHeight-ta.clientHeight/3);
  document.getElementById('rdEditSearchCount').textContent=(_rdEditSearchIdx+1)+' / '+_rdEditSearchMatches.length;
}
function closeReading(){
// 阅读页关闭时一并结束新手引导，避免遮罩留在已经消失的界面上
try{ tutDismiss(); }catch(e){ logError('tutDismiss', e); }
// 如果正在生成，先确认
if(isGen){
showDlg('正在生成中','关闭将停止当前生成，确定要离开吗？',function(){
  navPop('rdModal');
  try{ttsStop();}catch(e){logError('op',e)}
  try{document.getElementById('ttsBar').classList.remove('show');}catch(e){logError('op',e)}
  try{var rdEd=document.getElementById('rdEditModal');if(rdEd&&rdEd.classList.contains('show')){_rdEditDirty=false;rdEd.classList.remove('show');rdEd.style.display='none';navPop('rdEditModal');}}catch(e){}
  if(abortCtrl){try{abortCtrl.abort();}catch(e){logError('op',e)}abortCtrl=null;setIsGen(false);}
  try{if(document.getElementById('btnPremiumCont'))_resetPremiumBtns();}catch(e){}
  if(isFS)toggleFullscreen();
  if(isImmersiveRead)exitImmersiveRead();
  stopAutoScroll();
  document.getElementById('rdModal').classList.remove('rd-reader-mode');
  _rdDestroyReader();
  document.getElementById('rdModal').classList.remove('show');
},true);
return;
}
navPop('rdModal');
try{ttsStop();}catch(e){logError('op',e)}
try{document.getElementById('ttsBar').classList.remove('show');}catch(e){logError('op',e)}
try{var rdEd=document.getElementById('rdEditModal');if(rdEd&&rdEd.classList.contains('show')){_rdEditDirty=false;rdEd.classList.remove('show');rdEd.style.display='none';navPop('rdEditModal');}}catch(e){}
if(abortCtrl){try{abortCtrl.abort();}catch(e){logError('op',e)}abortCtrl=null;setIsGen(false);}
if(isFS)toggleFullscreen();
if(isImmersiveRead)exitImmersiveRead();
stopAutoScroll();
document.getElementById('rdModal').classList.remove('rd-reader-mode');
_rdDestroyReader();
document.getElementById('rdModal').classList.remove('show');
document.getElementById('rdModal').classList.remove('immersive-read');
var _bnavEl = document.getElementById('bnav');
if(_bnavEl){ _bnavEl.style.transform = 'translateZ(0)'; setTimeout(function(){ _bnavEl.style.transform = ''; }, 100); }
var _alist = document.querySelectorAll('.acard');
for(var _i=0;_i<_alist.length;_i++){ _alist[_i].style.transform='translateZ(0)'; }
setTimeout(function(){ var _al=document.querySelectorAll('.acard'); for(var _i=0;_i<_al.length;_i++){_al[_i].style.transform='';} }, 100);
// 阅读器整体关闭，设置面板同步收起即可，不播放动画
foldSlide(document.getElementById('rdSettingsPanel'),false,'show',true);
document.getElementById('bnav').classList.remove('hide');
closeNotePanel();
closeChapterList();
curRd=null;
try{if(!document.querySelector('.pg.act#pg-settings'))document.getElementById('xjGlobalFloat').style.display='';}catch(e){}
curCh=0;
// 如果正在生成，不清除列表（否则会删掉 streamCard）
if(!isGen && !_bgGenerating){
  renderArticles();
}
renderCollections();
}
// ==================== IMMERSIVE READ ====================
let isImmersiveRead=false;
let autoScrolling=false;
let scrollInterval=null;
let scrollSpeed=3;

function enterImmersiveRead(){
const modal=document.getElementById('rdModal');
modal.classList.add('immersive-read');
isImmersiveRead=true;
document.getElementById('bnav').classList.add('hide');
if(document.documentElement.requestFullscreen){
document.documentElement.requestFullscreen().catch(()=>{});
}
showToast('已进入沉浸阅读模式');
}

function exitImmersiveRead(){
const modal=document.getElementById('rdModal');
modal.classList.remove('immersive-read');
isImmersiveRead=false;
stopAutoScroll();
document.getElementById('bnav').classList.remove('hide');
if(document.fullscreenElement){
document.exitFullscreen().catch(()=>{});
}
}

function toggleAutoScroll(){
if(autoScrolling){
stopAutoScroll();
}else{
startAutoScroll();
}
}

function startAutoScroll(){
autoScrolling=true;
document.getElementById('autoScrollBtn').textContent='⏸ 暂停';
document.getElementById('autoScrollBtn').classList.add('act');
const modal=document.getElementById('rdModal');
const speed=scrollSpeed;
scrollInterval=setInterval(()=>{
modal.scrollTop+=speed;
// 检查是否到底
if(modal.scrollTop+modal.clientHeight>=modal.scrollHeight-50){
stopAutoScroll();
showToast('已到达底部');
}
},50);
}

function stopAutoScroll(){
autoScrolling=false;
document.getElementById('autoScrollBtn').textContent='▶ 自动阅读';
document.getElementById('autoScrollBtn').classList.remove('act');
if(scrollInterval){
clearInterval(scrollInterval);
scrollInterval=null;
}
}

function updateScrollSpeed(){
scrollSpeed=parseInt(document.getElementById('scrollSpeed').value);
document.getElementById('speedVal').textContent=scrollSpeed;
// 如果正在滚动，重新启动以应用新速度
if(autoScrolling){
stopAutoScroll();
startAutoScroll();
}
}

function immersivePrevCh(){
if(!curRd||!curRd.chapters||curCh<=0)return;
stopAutoScroll();
curCh--;
renderChContent();
document.getElementById('rdModal').scrollTop=0;
}

function immersiveNextCh(){
if(!curRd||!curRd.chapters||curCh>=curRd.chapters.length-1)return;
stopAutoScroll();
curCh++;
renderChContent();
document.getElementById('rdModal').scrollTop=0;
}
function toggleFullscreen(){
const modal=document.getElementById('rdModal');
const btn=document.getElementById('btnFS2');
const nav=document.getElementById('bnav');
isFS=!isFS;
if(isFS){
modal.classList.add('fs');nav.classList.add('hide');
if(btn)btn.innerHTML='<i class="fas fa-compress"></i> 退出全屏';
if(document.documentElement.requestFullscreen)document.documentElement.requestFullscreen().catch(()=>{});
}else{
modal.classList.remove('fs');nav.classList.remove('hide');
if(btn)btn.innerHTML='<i class="fas fa-expand"></i> 全屏模式';
if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});
}
}
// ==================== 阅读页折叠工具栏 ====================
let rdToolOpen=false;
function toggleRdToolbar(){
rdToolOpen=!rdToolOpen;
const panel=document.getElementById('rdToolPanel');
const btn=document.getElementById('rdToolToggle');
if(!panel||!btn)return;
if(rdToolOpen){
panel.classList.add('open');
btn.innerHTML='<i class="fas fa-tools"></i> 收起 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;transform:rotate(180deg)"><path d="M6 9l6 6 6-6"/></svg>';
}else{
panel.classList.remove('open');
btn.innerHTML='<i class="fas fa-tools"></i> 工具 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><path d="M6 9l6 6 6-6"/></svg>';
closeAllToolPanels();
}
}
function toggleRdSettings(){
const panel=document.getElementById('rdSettingsPanel');
if(panel)foldSlide(panel,!panel.classList.contains('show'));
}

function setRdFont(v){
v=parseInt(v);
document.getElementById('rdContent').style.setProperty('--rd-fontsize',v+'px');
try{document.getElementById('rdFontVal').textContent=v;}catch(e){}
ap.rdFontSize=v;sv(K.ap,ap);
// 同步到编辑器
edFontSize=v;sv('bj_edFontSize',v);
try{document.getElementById('edFontVal').textContent=v;}catch(e){}
try{var ranges=document.querySelectorAll('#edWriteSettings input[type=range]');if(ranges[0])ranges[0].value=v;}catch(e){}
applyEdWriteStyle();
// 如果翻页模式已初始化，触发重新分页
try{if(typeof _rdRepaginate==='function'&&document.getElementById('rdReaderContent'))_rdRepaginate();}catch(e){}
}

function setRdLine(v){
v=parseFloat(v);
document.getElementById('rdContent').style.setProperty('--rd-lineheight',v);
try{document.getElementById('rdLineVal').textContent=v.toFixed(1);}catch(e){}
ap.rdLineHeight=v;sv(K.ap,ap);
// 同步到编辑器
edLineHeight=v;sv('bj_edLineHeight',v);
try{document.getElementById('edLineVal').textContent=v.toFixed(1);}catch(e){}
try{var ranges=document.querySelectorAll('#edWriteSettings input[type=range]');if(ranges[1])ranges[1].value=v;}catch(e){}
applyEdWriteStyle();
}
// 提取章节关键点
function extractKeyPoints(chapterText,chNum){
if(!chapterText)return '（空章节）';
const text=chapterText.replace(/\n+/g,' ').trim();
// 提取对话（通常包含关键信息）
const dialogues=text.match(/[「""]([^「""」]+)[」""]/g)||[];
const keyDialogue=dialogues.length>0?dialogues[Math.floor(dialogues.length/2)]:'';
// 提取开头和结尾的关键句
const sentences=text.split(/[。！？]/);
const opening=sentences[0]||'';
const ending=sentences[sentences.length-2]||'';
let summary=opening.substring(0,40);
if(keyDialogue)summary+='…'+keyDialogue.substring(0,30);
summary+='…'+ending.substring(0,40);
return summary;
}

// 提取故事状态（伏笔、悬念等）
function extractStoryState(article){
if(!article||!article.chapters||article.chapters.length<2)return '';
const allText=article.chapters.join('\n');
const states=[];
// 检测未解决的问题/悬念（以问号结尾的句子）
const questions=allText.match(/[^。！？]*[？?]/g)||[];
if(questions.length>0){
const lastQ=questions[questions.length-1].trim();
if(lastQ.length>5&&lastQ.length<50)states.push('待解悬念：'+lastQ);
}
// 检测情感状态词
const emotionWords=['愤怒','悲伤','喜悦','恐惧','期待','失望','震惊','怀疑'];
const lastCh=article.chapters[article.chapters.length-1]||'';
emotionWords.forEach(w=>{
if(lastCh.includes(w))states.push('情绪基调：'+w);
});
return states.slice(0,3).join('；');
}

// 获取人物当前状态
function getCharacterStates(article){
if(!article||!article.chapters)return '';
const lastCh=article.chapters[article.chapters.length-1]||'';
const validChars=characters.filter(c=>c.name);
if(validChars.length===0)return '';
const states=[];
validChars.forEach(c=>{
if(!c.name)return;
// 检查角色在最后一章的出现和状态
if(lastCh.includes(c.name)){
// 简单的状态推断
const idx=lastCh.lastIndexOf(c.name);
const context=lastCh.substring(Math.max(0,idx-20),Math.min(lastCh.length,idx+50));
states.push(c.name+'：出现于最近场景');
}
});
return states.join('；');
}
// ==================== CONTINUE CHAPTER ====================
// 快速续写（使用已保存的上下文设置）
function quickContinue(){
if(!checkApiCooldown())return;
if(!curRd)return;
_batchContRemain=Math.max(0,(_rdContChCount||1)-1);
_batchArticleId=curRd?curRd.id:'';
var liked=isLiked(curRd);
if(!liked){
showToast('请先点击 收藏后才能续写哦～');
return;
}
var colBook2=cols.books.find(function(b){return b.id===curRd.id;});
if(colBook2&&colBook2.status==='complete'){
showToast('此作品已完结，无法续写。可以使用「番外篇」功能续写番外',4000);
return;
}
// 检测是否有上次的断点
var savedBp=ld('bj_streamBreakpoint',{});
if(savedBp&&savedBp.articleId===curRd.id&&savedBp.partialText&&savedBp.partialText.length>50){
  var bpAge=Date.now()-(savedBp.timestamp||0);
  if(bpAge<24*60*60*1000){ // 24小时内的断点
    showDlg('发现断点','上次生成到一半被中断了（'+countWords(savedBp.partialText)+'字）\n\n你想：',function(){
      // 从断点继续
      curRd.chapters.push(savedBp.partialText);
      syncArticle(curRd);
      curCh=curRd.chapters.length-1;
      renderChContent();
      clearStreamBreakpoint();
      showToast('已恢复断点内容，可以在此基础上续写下一章',3000);
    });
    // 修改按钮文字
    setTimeout(function(){
      var okBtn=document.getElementById('dlgOkBtn');
      if(okBtn)okBtn.textContent='保留断点内容';
      var msgEl=document.getElementById('dlgMsg');
      if(msgEl){
        msgEl.innerHTML+='<div style="margin-top:12px"><button onclick="closeDlg();_streamBreakpoint={};try{localStorage.removeItem(\'bj_streamBreakpoint\')}catch(e){};continueChapterWithContext();" style="width:100%;padding:10px;border-radius:10px;border:1px solid var(--accent);background:rgba(108,92,231,.1);color:var(--accent2);font-size:12px;font-weight:600;cursor:pointer"><i class="fas fa-rotate-right"></i> 丢弃断点，重新续写</button></div>';
        msgEl.innerHTML+='<div style="margin-top:8px"><button onclick="closeDlg();clearStreamBreakpoint();showToast(\'断点已忽略\')" style="width:100%;padding:8px;border-radius:10px;border:1px solid var(--border);background:transparent;color:var(--text2);font-size:11px;cursor:pointer"><i class="fas fa-ban"></i> 忽略断点，以后不再提醒</button></div>';
      }
    },50);
    return;
  }
}
var dir=(document.getElementById('dirInput').value||'').trim();
if(dir){
if(!articleContexts[curRd.id])articleContexts[curRd.id]={};
articleContexts[curRd.id].direction=dir;
sv('bj_articleContexts',articleContexts);
}
var ctxKey='bj_ctxUsed_'+curRd.id;
var hasUsedCtx=ld(ctxKey,null);
if(!hasUsedCtx&&curRd.chapters&&curRd.chapters.length>=1){
showDlg('星笺的小建议','第一次续写这篇文章呢！星笺建议你先看看「上下文设置」，\n\n在那里可以告诉AI：\n· 前面发生了什么（帮它回忆剧情）\n· 角色现在的状态（防止性格跑偏）\n· 这一章想写什么（让它更听话）\n\n设置一次就好，以后续写星笺就不会再唠叨啦～',function(){
sv(ctxKey,'1');
continueChapterWithContext();
},false,'确认，直接续写');
var okBtn=document.getElementById('dlgOkBtn');
if(okBtn)okBtn.textContent='直接续写';
var dlgMsg=document.getElementById('dlgMsg');
if(dlgMsg){
dlgMsg.innerHTML+='<div style="margin-top:12px"><button onclick="closeDlg();openContextEditor();" style="width:100%;padding:10px;border-radius:10px;border:1px solid var(--accent);background:rgba(108,92,231,.1);color:var(--accent2);font-size:12px;font-weight:600;cursor:pointer"><i class="fas fa-gear"></i> 先去设置上下文（推荐）</button></div>';
}
return;
}
if(!hasUsedCtx)sv(ctxKey,'1');
continueChapterWithContext();
}
async function continueChapter(){
if(isGen){
showToast('正在生成中，请稍候...');
return;
}
if(!curRd||curRd.type!=='long')return;
setIsGen(true);
const btn=document.getElementById('btnCont');
btn.disabled=true;
btn.innerHTML='正在创作 <span class="ldots"><span></span><span></span><span></span></span>';
var _contSafetyTimer=setTimeout(function(){
  if(isGen){
    setIsGen(false);
    var _b=document.getElementById('btnCont');
    if(_b){_b.disabled=false;_b.innerHTML='<i class="fas fa-pen-nib"></i> 续写下一章';}
    showToast('生成超时，请重试',3000);
  }
},300000);

const chNum=curRd.chapters.length+1;
const direction=(document.getElementById('dirInput').value||'').trim();

// 构建智能上下文
let context='';
const totalCh=curRd.chapters.length;

// 提取全书关键信息
const storyState=extractStoryState(curRd);
if(storyState){
context+='【故事状态追踪】\n'+storyState+'\n\n';
}

// 如果章节较多，提供智能摘要
if(totalCh>=3){
context+='【前情脉络】\n';
for(let i=Math.max(0,totalCh-4);i<totalCh-1;i++){
const ch=curRd.chapters[i]||'';
const keyPoints=extractKeyPoints(ch,i+1);
context+='第'+(i+1)+'章：'+keyPoints+'\n';
}
context+='\n';
}

// 上一章完整结尾
const lastCh=curRd.chapters[totalCh-1]||'';
const lastChEnding=lastCh.substring(Math.max(0,lastCh.length-1500));
context+='【上一章（第'+totalCh+'章）结尾】\n'+lastChEnding+'\n';

// 人物当前状态
const charStates=getCharacterStates(curRd);
if(charStates){
context+='\n【人物当前状态】\n'+charStates+'\n';
}

// 如果有大纲，提供当前章节的大纲指引
const wsArticle=ws.find(a=>a.id===curRd.id);
const crArticle=crWorks.find(w=>w.id===curRd.id);
const outline=(wsArticle&&wsArticle.outline)||(crArticle&&crArticle.outline)||'';
// 章节大纲
let chOutlineHint='';
if(curRd.chOutlines&&curRd.chOutlines[chNum-1]){
chOutlineHint=curRd.chOutlines[chNum-1];
}
// 也检查收藏和创作页的大纲
if(!chOutlineHint){
const colBook=cols.books.find(b=>b.id===curRd.id);
if(colBook&&colBook.chOutlines&&colBook.chOutlines[chNum-1]){
chOutlineHint=colBook.chOutlines[chNum-1];
}
}
if(!chOutlineHint){
const crWork=crWorks.find(w=>w.id===curRd.id);
if(crWork&&crWork.chOutlines&&crWork.chOutlines[chNum-1]){
chOutlineHint=crWork.chOutlines[chNum-1];
}
}

let outlineHint='';
if(outline){
const outlineLines=outline.split('\n');
for(let i=0;i<outlineLines.length;i++){
const line=outlineLines[i].trim();
if(line.includes('第'+chNum+'章')||line.includes('第'+chNum+'章')){
outlineHint=line;
// 多取几行，获取更完整的章节信息
for(let j=i+1;j<Math.min(i+5,outlineLines.length);j++){
const nextLine=outlineLines[j].trim();
if(nextLine.startsWith('第')&&nextLine.includes('章'))break;// 到下一章了
if(nextLine)outlineHint+='\n'+nextLine;
}
break;
}
}
}

// 构建智能续写提示
let userMsg='【续写任务】创作《'+curRd.title+'》第'+chNum+'章\n\n';

// 故事脉络回顾（智能摘要）
if(totalCh>=2){
userMsg+='【前情回顾】\n';
// 第一章的开头（建立基调）
const firstCh=curRd.chapters[0]||'';
const firstOpening=firstCh.substring(0,200).split('\n')[0];
userMsg+='故事开篇：'+firstOpening+'...\n';

// 中间章节的关键转折（如果有）
if(totalCh>=4){
const midCh=Math.floor(totalCh/2);
const midText=curRd.chapters[midCh]||'';
const midKey=midText.substring(0,150);
userMsg+='中段发展：'+midKey.replace(/\n/g,' ')+'...\n';
}
userMsg+='\n';
}

// 上一章完整结尾（最重要的上下文）
userMsg+='【上一章结尾】\n';
userMsg+=lastChEnding+'\n\n';

// 人物当前状态追踪
if(charStates){
userMsg+='【人物状态】'+charStates+'\n\n';
}

// 章节大纲（如果有）
if(chOutlineHint){
userMsg+='【本章必须完成】\n';
userMsg+=chOutlineHint+'\n';
userMsg+='⚠️ 以上是硬性要求，必须在本章中体现\n\n';
}else if(outlineHint){
userMsg+='【大纲参考】'+outlineHint+'\n\n';
}

// 用户的方向提示
if(direction){
userMsg+='【作者指示】'+direction+'\n\n';
}

// 创作指引（简洁版）
userMsg+='【本章要求】\n';
userMsg+='• 开头直接承接上文，用动作或对话切入，不要复述前情\n';
userMsg+='• 本章要有起伏，至少一个情感转折或情节推进\n';
userMsg+='• 结尾留下钩子，让人想看下一章\n';
userMsg+='• 直接输出正文，无标题无章节号\n'; const mW3=parseInt(document.getElementById('minWords').value)||800; userMsg+='• 【字数硬性要求】本章正文必须不少于'+mW3+'字！低于此字数不合格，宁多勿少，建议写到'+(mW3+500)+'字以上\n';

const messages=[{role:'system',content:buildSysPrompt()},{role:'user',content:userMsg}];
// 记录续写日志
try{
  const apiCfg=getCurApi();
  addGenLog({
    kind:'workshop',
    type:'continue',
    title: (curRd && curRd.title ? (curRd.title+' · 续写第'+chNum+'章') : '续写'),
    articleId: (curRd&&curRd.id)||'',
    api: apiCfg,
    messages: messages
  });
}catch(e){logError('op',e)}
if(_bgTaskInfo){
  _bgTaskInfo.articleId = curRd ? curRd.id : '';
  _bgTaskInfo.title = curRd ? curRd.title : '';
  _bgTaskInfo.chNum = chNum;
}
const rdContent=document.getElementById('rdContent');
const startTime=Date.now();

if(!useStream){
const result=await callAPINonStream(messages);
setIsGen(false);btn.disabled=false;btn.innerHTML='<i class="fas fa-pen-nib"></i> 续写第'+(curRd.chapters?curRd.chapters.length+1:2)+'章';
clearTimeout(_contSafetyTimer);
if(!result)return;
curRd.chapters.push(result);
syncArticle(curRd);
curCh=curRd.chapters.length-1;
renderChContent();
document.getElementById('rdMeta').innerHTML=
'<span><i class="fas fa-book"></i> 长篇连载</span><span><i class="fas fa-clock"></i> '+new Date(curRd.createdAt).toLocaleDateString()+'</span>'+
'<span>共 '+curRd.chapters.length+' 章</span><span>'+getTotalWords(curRd)+' 字</span>';
document.getElementById('btnUndo').style.display='inline-block';
if(contDirMemory&&curRd&&curRd.id){localStorage.setItem('bj_lastDir_'+curRd.id,document.getElementById('dirInput').value);}
document.getElementById('dirInput').value='';
try{if(genVibrate&&navigator.vibrate)navigator.vibrate([50,30,50]);}catch(e){}
showToast('第'+chNum+'章写好啦！星笺期待你的评价');
try{if(ld('bj_contQualityOn',true))renderContQualityCard(result,document.getElementById('rdContent').parentElement);}catch(e){logError('op',e)}
return;
}

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
if(!fullText)return;
curRd.chapters.push(fullText);
syncArticle(curRd);
curCh=curRd.chapters.length-1;
renderChContent();
document.getElementById('rdMeta').innerHTML=
'<span><i class="fas fa-book"></i> 长篇连载</span><span><i class="fas fa-clock"></i> '+new Date(curRd.createdAt).toLocaleDateString()+'</span>'+
'<span>共 '+curRd.chapters.length+' 章</span><span>'+getTotalWords(curRd)+' 字</span>';
document.getElementById('btnUndo').style.display='inline-block';
if(contDirMemory&&curRd&&curRd.id){localStorage.setItem('bj_lastDir_'+curRd.id,document.getElementById('dirInput').value);}
document.getElementById('dirInput').value='';
try{if(genVibrate&&navigator.vibrate)navigator.vibrate([50,30,50]);}catch(e){}
showToast('第'+chNum+'章写好啦！星笺期待你的评价');
try{if(ld('bj_contQualityOn',true))renderContQualityCard(fullText,document.getElementById('rdContent').parentElement);}catch(e){logError('op',e)}
},
(errMsg)=>{
setIsGen(false);btn.disabled=false;btn.textContent='继续连载下一章';
clearTimeout(_contSafetyTimer);
showToast(errMsg,3000);
}
,{maxTokens:_contDynTok});
}
// ==================== UNDO CHAPTER ====================
function undoChapter(){
if(!curRd||curRd.type!=='long'||!curRd.chapters||curRd.chapters.length<=1)return;
showDlg('撤销确认','确定要删除最后一章（第'+curRd.chapters.length+'章）吗？此操作不可恢复。',()=>{
curRd.chapters.pop();
syncArticle(curRd);
curCh=curRd.chapters.length-1;
renderChContent();

document.getElementById('rdMeta').innerHTML=
'<span><i class="fas fa-book"></i> 长篇连载</span><span><i class="fas fa-clock"></i> '+new Date(curRd.createdAt).toLocaleDateString()+'</span>'+
'<span>共 '+curRd.chapters.length+' 章</span><span>'+getTotalWords(curRd)+' 字</span>';

if(curRd.chapters.length<=1)document.getElementById('btnUndo').style.display='none';
showToast('已撤销最后一章');
},true);
}

// ==================== COPY ====================
function copyCurChapter(){
if(!curRd)return;
let text='';
if(curRd.type==='long'&&curRd.chapters){
text=curRd.chapters[curCh]||'';
text='《'+curRd.title+'》第'+(curCh+1)+'章\n\n'+text;
}else{
text=curRd.content||'';
}
doCopy(text);
showToast('已复制第'+(curCh+1)+'章');
}
function copyCurrentArticle(){
if(!curRd)return;
let text='';
if(curRd.type==='long'&&curRd.chapters){
curRd.chapters.forEach((ch,i)=>{text+='第'+(i+1)+'章\n\n'+ch+'\n\n';});
}else{text=curRd.content||'';}
// Clean: only remove non-standard whitespace, keep normal spaces and newlines
text=text.replace(/[\u200B-\u200D\uFEFF]/g,'');

const header='════════════════════\n「'+curRd.title+'」\n本文由「星叙」辅助创作生成\n创作工具：星叙 · Created by 心田\n════════════════════\n\n';
const footer='\n\n════════════════════\n本文由AI辅助创作，内容仅供参考\n创作工具：星叙 '+APP_VER+'（AI辅助创作工坊）\n网页作者：心田\n════════════════════';
doCopy(header+text+footer);
}
function importRdToCreate(){
  if(!curRd){
    showToast('没有打开的作品');
    return;
  }
  // 新建一个创作作品
  const work={
    id:uid(),
    type:curRd.type==='long'?'novel':'draft',
    title:curRd.title||'未命名',
    createdAt:new Date().toISOString(),
    updatedAt:new Date().toISOString()
  };
  if(work.type==='novel'){
    // 长篇：把每章搬过去
    if(Array.isArray(curRd.chapters)&&curRd.chapters.length>0){
      work.chapters=curRd.chapters.slice();
    }else{
      work.chapters=[curRd.content||''];
    }
  }else{
    // 短篇：整篇当成一篇草稿
    if(curRd.content){
      work.content=curRd.content;
    }else if(Array.isArray(curRd.chapters)){
      work.content=curRd.chapters.join('\n\n');
    }else{
      work.content='';
    }
  }

  crWorks.unshift(work);
  sv('bj_crWorks',crWorks);
  showToast('已导入到创作编辑');

  // 切到创作页面并打开编辑器
  const navBtns=document.querySelectorAll('.bnav-i');
  if(navBtns[2]) switchPage('create',navBtns[2]);
  openEditor(work.id);
}
function doCopy(text){
if(navigator.clipboard&&navigator.clipboard.writeText){
navigator.clipboard.writeText(text).then(()=>showToast('已复制到剪贴板')).catch(()=>fbCopy(text));
}else{fbCopy(text);}
}
function fbCopy(text){
const ta=document.createElement('textarea');ta.value=text;
ta.style.cssText='position:fixed;left:-9999px;';
document.body.appendChild(ta);ta.select();
try{document.execCommand('copy');showToast('已复制到剪贴板');}
catch{showToast('复制失败');}
document.body.removeChild(ta);
}
// 反馈问卷（更新弹窗 + 关于星叙页共用同一个链接）
var FEEDBACK_SURVEY_URL='https://wj.qq.com/s2/27312787/460a/';
// 点击"立即进入"：尝试直接打开问卷；如果打不开（弹窗被拦截，或部分APK环境不支持新开页面），
// 视为进入失败，提醒用户并自动把链接复制到剪贴板，方便手动粘贴打开
function openFeedbackSurvey(){
  var opened=null;
  try{opened=window.open(FEEDBACK_SURVEY_URL,'_blank');}catch(e){opened=null;}
  if(!opened){
    if(navigator.clipboard&&navigator.clipboard.writeText){
      navigator.clipboard.writeText(FEEDBACK_SURVEY_URL).then(function(){
        showToast('没能自动打开问卷，链接已复制，去浏览器粘贴打开吧～',4000);
      }).catch(function(){fbCopy(FEEDBACK_SURVEY_URL);});
    }else{
      fbCopy(FEEDBACK_SURVEY_URL);
    }
  }
}
// 关于星叙页 - 手动复制反馈问卷链接
function copyAboutFeedbackLink(){
  if(navigator.clipboard&&navigator.clipboard.writeText){
    navigator.clipboard.writeText(FEEDBACK_SURVEY_URL).then(function(){showToast('链接已复制');}).catch(function(){fbCopy(FEEDBACK_SURVEY_URL);});
  }else{
    fbCopy(FEEDBACK_SURVEY_URL);
  }
}

// 邮箱反馈（关于星叙页 - 帮助星叙成长）
var ABOUT_FEEDBACK_EMAIL='a13380324832@qq.com';
function openAboutFeedbackEmail(){
  var opened=null;
  try{opened=window.open('mailto:'+ABOUT_FEEDBACK_EMAIL,'_blank');}catch(e){opened=null;}
  if(!opened){
    if(navigator.clipboard&&navigator.clipboard.writeText){
      navigator.clipboard.writeText(ABOUT_FEEDBACK_EMAIL).then(function(){
        showToast('没能自动打开邮箱，地址已复制，去邮箱APP粘贴发送吧～',4000);
      }).catch(function(){fbCopy(ABOUT_FEEDBACK_EMAIL);});
    }else{
      fbCopy(ABOUT_FEEDBACK_EMAIL);
    }
  }
}
function copyAboutFeedbackEmail(){
  if(navigator.clipboard&&navigator.clipboard.writeText){
    navigator.clipboard.writeText(ABOUT_FEEDBACK_EMAIL).then(function(){showToast('邮箱已复制');}).catch(function(){fbCopy(ABOUT_FEEDBACK_EMAIL);});
  }else{
    fbCopy(ABOUT_FEEDBACK_EMAIL);
  }
}

// GitHub 开源仓库（关于星叙页 - 支持星叙）
var ABOUT_GITHUB_URL='https://github.com/1338032/Star.Narration.xint';
function openAboutGithubRepo(){
  var opened=null;
  try{opened=window.open(ABOUT_GITHUB_URL,'_blank');}catch(e){opened=null;}
  if(!opened){
    if(navigator.clipboard&&navigator.clipboard.writeText){
      navigator.clipboard.writeText(ABOUT_GITHUB_URL).then(function(){
        showToast('没能自动打开仓库，链接已复制，去浏览器粘贴打开吧～',4000);
      }).catch(function(){fbCopy(ABOUT_GITHUB_URL);});
    }else{
      fbCopy(ABOUT_GITHUB_URL);
    }
  }
}

// Fullscreen change listener
document.addEventListener('fullscreenchange',()=>{
if(!document.fullscreenElement&&isFS){
isFS=false;
document.getElementById('rdModal').classList.remove('fs');
document.getElementById('bnav').classList.remove('hide');
var fsBtn=document.getElementById('btnFS2');
if(fsBtn)fsBtn.innerHTML='<i class="fas fa-expand"></i> 全屏模式';
}
});

// ==================== COLLECTIONS ====================
// ==================== 收藏页筛选器 ====================
var _colSortValue = 'update';
var _colStatusValue = 'all';
var _colRatingValue = '0';
var _colFilterPickerType = '';
var _colFilterOptions = {
  sort:[
    {value:'update',label:'最近更新'},
    {value:'create',label:'创建时间'},
    {value:'words',label:'按字数'},
    {value:'rating',label:'按评分'}
  ],
  status:[
    {value:'all',label:'全部'},
    {value:'ongoing',label:'连载中'},
    {value:'complete',label:'已完结'},
    {value:'paused',label:'暂停'}
  ],
  rating:[
    {value:'0',label:'全部评分'},
    {value:'3',label:'3星以上'},
    {value:'4',label:'4星以上'},
    {value:'5',label:'仅5星'}
  ]
};
var _colFilterTitles = {sort:'排序方式',status:'状态筛选',rating:'评分筛选'};
var _colFilterIcons = {sort:'fa-sort-amount-down',status:'fa-circle-dot',rating:'fa-star'};

function openColFilterPicker(type) {
  _colFilterPickerType = type;
  var current = type==='sort'?_colSortValue:type==='status'?_colStatusValue:_colRatingValue;
  var opts = _colFilterOptions[type];
  var titleEl = document.getElementById('colFilterPickerTitle');
  var listEl = document.getElementById('colFilterPickerList');
  if(!titleEl||!listEl) return;
  titleEl.innerHTML = '<i class="fas '+(_colFilterIcons[type]||'fa-sliders-h')+'"></i> '+_colFilterTitles[type];
  var html = '';
  opts.forEach(function(o){
    var sel = o.value === current;
    html += '<button class="col-fp-item'+(sel?' selected':'') +'" onclick="pickColFilter(\''+o.value+'\')">'+
      '<span>'+o.label+'</span>'+
      (sel?'<i class="fas fa-check fp-check"></i>':'') +
    '</button>';
  });
  listEl.innerHTML = html;
  document.getElementById('colFilterPickerOv').classList.add('show');
}

function pickColFilter(value) {
  var type = _colFilterPickerType;
  closeColFilterPicker();
  if(!type) return;
  var opts = _colFilterOptions[type];
  var label = (opts.find(function(o){return o.value===value;})||{}).label || value;
  if(type==='sort'){
    _colSortValue = value;
    var el = document.getElementById('colSortLabel');
    if(el) el.textContent = label;
  } else if(type==='status'){
    _colStatusValue = value;
    var el2 = document.getElementById('colStatusLabel');
    if(el2) el2.textContent = label;
  } else {
    _colRatingValue = value;
    var el3 = document.getElementById('colRatingLabel');
    if(el3) el3.textContent = label;
  }
  colBookPage = 1;
  colShortPage = 1;
  renderCollections();
}

function closeColFilterPicker() {
  var ov = document.getElementById('colFilterPickerOv');
  if(ov) ov.classList.remove('show');
  _colFilterPickerType = '';
}

function renderCollections(){
const sv_=(document.getElementById('colSearchInput').value||'').trim().toLowerCase();

const grid=document.getElementById('bookGrid');
let books=cols.books.slice();
if(sv_)books=books.filter(b=>b.title.toLowerCase().includes(sv_));
// 状态筛选
var statusF=_colStatusValue||'all';
if(statusF!=='all')books=books.filter(function(b){return(b.status||'ongoing')===statusF;});
// 评分筛选
var ratingF=parseInt(_colRatingValue)||0;
if(ratingF>0)books=books.filter(function(b){return(b.rating||0)>=ratingF;});
// 排序
var sortF=_colSortValue||'update';
books.sort(function(a,b){
  if(sortF==='update')return new Date(b.updatedAt||b.createdAt||0)-new Date(a.updatedAt||a.createdAt||0);
  if(sortF==='create')return new Date(b.createdAt||0)-new Date(a.createdAt||0);
  if(sortF==='words')return getTotalWords(b)-getTotalWords(a);
  if(sortF==='rating')return(b.rating||0)-(a.rating||0);
  return 0;
});
const totalBooks = books.length;
books = books.slice(0, colBookPage * PAGE_SIZE);

if(books.length===0){
  grid.innerHTML='<div class="empty-st" style="grid-column:1/-1"><div style="font-size:48px;margin-bottom:12px;opacity:.5"><i class="fas fa-book"></i></div><p>'+(sv_?'没有匹配的长篇':'书架空空如也<br><br>在作坊生成作品后<br>点击「<i class="fas fa-heart" style="color:var(--text2)"></i> 收藏」即可添加到这里')+'</p></div>';
}else{
  grid.innerHTML='';
  const bookFrag=document.createDocumentFragment();
  books.forEach(book=>{
    const realId=book.id;
    const card=document.createElement('div');
    card.className='bcard';
    if(batchMode){card.dataset.batchId='book_'+realId;card.style.borderColor=batchSelected.has('book_'+realId)?'var(--accent)':'var(--border)';card.style.background=batchSelected.has('book_'+realId)?'rgba(108,92,231,.08)':'';}
    var covHtml='';
    if(batchMode){
      var bk2='book_'+realId;
      covHtml='<div id="bchk_'+realId+'" style="position:absolute;top:8px;left:8px;z-index:2;width:22px;height:22px;border-radius:6px;border:2px solid '+(batchSelected.has(bk2)?'var(--accent)':'rgba(255,255,255,.5)')+';background:'+(batchSelected.has(bk2)?'var(--accent)':'rgba(0,0,0,.3)')+';display:flex;align-items:center;justify-content:center;font-size:12px;color:#fff">'+(batchSelected.has(bk2)?'<i class="fas fa-check"></i>':'')+'</div>';
      if(book.cover) covHtml+='<img src="'+book.cover+'" alt="封面">';
      else covHtml+='<div class="bcov-ph"><span style="font-size:24px"><i class="fas fa-book"></i></span><span>'+esc(book.title.substring(0,4))+'</span></div>';
    }else{
      if(book.cover) covHtml='<img src="'+book.cover+'" alt="封面" loading="lazy" onerror="this.style.display=\'none\';this.nextElementSibling&&(this.nextElementSibling.style.display=\'\')">';
      else covHtml='<div class="bcov-ph"><span style="font-size:24px"><i class="fas fa-book"></i></span><span>'+esc(book.title.substring(0,4))+'</span></div>';
    }
    const statusClass=book.status||'ongoing';
    const statusText={ongoing:'连载中',complete:'已完结',paused:'暂停'}[statusClass]||'连载中';
    card.innerHTML=
      '<div class="bcov" onclick="'+(batchMode?'toggleBatchItem(\''+realId+'\',\'book\')':'openColBook(\''+realId+'\')')+'">'+covHtml+'</div>'+
      '<div class="binfo" onclick="'+(batchMode?'toggleBatchItem(\''+realId+'\',\'book\')':'openColBook(\''+realId+'\')')+'">'+
      '<div style="display:flex;align-items:center;gap:4px;margin-bottom:3px">'+
      '<div class="binfo-t" style="flex:1;margin-bottom:0">'+esc(book.title)+'</div>'+
      '<button class="bact" onclick="event.stopPropagation();toggleBookMenu(\''+realId+'\',this)" style="flex-shrink:0;flex:none;padding:3px 7px;font-size:11px;border:none;background:transparent;"><i class="fas fa-ellipsis-h"></i></button>'+
      '</div>'+
      '<div class="binfo-m">'+(book.chapters?book.chapters.length+'章 · ':'')+getTotalWords(book)+'字</div>'+
      '<div style="font-size:8px;color:var(--text2);margin-top:1px">'+(function(){const lc=parseInt(localStorage.getItem("bj_lastCh_"+realId));return lc>0?"上次读到第"+(lc+1)+"章":"";})()+'</div>'+
      '<span class="binfo-status '+statusClass+'">'+statusText+'</span>'+
      renderStarHTML(book.rating||0,realId)+
      '</div>';
    bookFrag.appendChild(card);
  });
  grid.appendChild(bookFrag);
  if(totalBooks > books.length){
    const more=document.createElement('div');
    more.style.cssText='grid-column:1/-1;text-align:center;padding:14px;color:var(--text2);font-size:12px';
    more.innerHTML='<button style="padding:10px 18px;border-radius:12px;border:1px solid var(--border);background:var(--card);color:var(--text);cursor:pointer" onclick="colBookPage++;renderCollections()">加载更多（'+books.length+'/'+totalBooks+'）</button>';
    grid.appendChild(more);
  }
}

const sl=document.getElementById('shortList');
let shorts=cols.shorts.slice();
if(sv_) shorts=shorts.filter(s=>(s.title||'').toLowerCase().includes(sv_));
var ratingFS=parseInt(_colRatingValue)||0;
if(ratingFS>0)shorts=shorts.filter(function(s){return(s.rating||0)>=ratingFS;});
var sortFS=_colSortValue||'update';
shorts.sort(function(a,b){
  if(sortFS==='rating')return(b.rating||0)-(a.rating||0);
  if(sortFS==='words')return countWords(b.content||'')-countWords(a.content||'');
  return new Date(b.createdAt||0)-new Date(a.createdAt||0);
});
const totalShorts = shorts.length;
shorts = shorts.slice(0, colShortPage * PAGE_SIZE);

if(shorts.length===0){
  sl.innerHTML='<div class="empty-st"><p>'+(sv_?'没有匹配的短篇':'还没有收藏的短篇文章')+'</p></div>';
}else{
  sl.innerHTML='';
  const shortFrag=document.createDocumentFragment();
  shorts.forEach(s=>{
    const realId=s.id;
    const item=document.createElement('div');
    item.className='sitem';
    if(batchMode){
      var sKey='short_'+realId;
      item.dataset.batchId=sKey;
      item.style.borderColor=batchSelected.has(sKey)?'var(--accent)':'var(--border)';
      item.style.background=batchSelected.has(sKey)?'rgba(108,92,231,.08)':'';
    }
    item.onclick=e=>{
      if(batchMode){toggleBatchItem(realId,'short');return;}
      if(!e.target.closest('button')&&!e.target.closest('.star-rating')){openReading(s);}
    };
    item.innerHTML=
      '<div class="sitem-info"><div class="sitem-t">'+esc(s.title)+'</div>'+
      '<div class="sitem-pv">'+esc((s.content||'').replace(/\n/g,' ').substring(0,20))+'</div>'+
      renderStarHTML(s.rating||0,realId)+
      '</div>'+
      '<div class="sitem-acts">'+
'<button onclick="event.stopPropagation();toggleShortMenu(\''+realId+'\',this)" style="padding:5px 10px;border-radius:8px;border:none;background:transparent;color:var(--text2);font-size:12px;cursor:pointer"><i class="fas fa-ellipsis-h"></i></button>'+
'</div>';
    shortFrag.appendChild(item);
  });
  sl.appendChild(shortFrag);
  if(totalShorts > shorts.length){
    const more=document.createElement('div');
    more.style.cssText='text-align:center;padding:14px;color:var(--text2);font-size:12px';
    more.innerHTML='<button style="padding:10px 18px;border-radius:12px;border:1px solid var(--border);background:var(--card);color:var(--text);cursor:pointer" onclick="colShortPage++;renderCollections()">加载更多（'+shorts.length+'/'+totalShorts+'）</button>';
    sl.appendChild(more);
  }
}

document.getElementById('colCnt').textContent=(cols.books.length+cols.shorts.length)+' 篇';
}

function renderStarHTML(rating,id){
  let html='<div class="star-rating">';
  for(let i=1;i<=5;i++){
    html+='<span class="'+(i<=rating?'filled':'')+'" onclick="event.stopPropagation();setRating(\''+id+'\','+i+')"><i class="fas fa-star"></i></span>';
  }
  html+='</div>';
  return html;
}

function setRating(id,rating){
  let found=cols.books.find(b=>b.id===id);
  if(found){found.rating=rating;}
  else{found=cols.shorts.find(s=>s.id===id);if(found)found.rating=rating;}
  sv(K.cols,cols);renderCollections();
}

function cycleStatus(id){
  var book=cols.books.find(function(b){return b.id===id;});
  if(!book)return;
  var curStatus=book.status||'ongoing';
  if(curStatus==='complete'){showToast('已完结的作品无法更改状态');return;}
  var nextMap={'ongoing':'complete','paused':'ongoing'};
  var nextStatus=nextMap[curStatus]||'ongoing';
  if(nextStatus==='complete'){
    var bookTitle=book.title||'未命名';
    showDlg('确认完结','确定要将《'+bookTitle+'》标记为已完结吗？\n\n完结后：\n· 状态将锁定，无法再更改\n· 无法再续写新章节\n· 可以使用番外篇功能\n\n此操作不可撤销！',function(){
      book.status='complete';
      book.completedAt=new Date().toISOString();
      sv(K.cols,cols);renderCollections();
      showToast('《'+bookTitle+'》已完结');
    },true);
    return;
  }
  book.status=nextStatus;
  sv(K.cols,cols);renderCollections();
  var labels={'ongoing':'连载中','complete':'已完结','paused':'暂停'};
  showToast('状态已切换为：'+labels[book.status]);
}

function updateBookCardStatus(id){
  const book=cols.books.find(b=>b.id===id);
  if(!book)return;
  const cards=document.querySelectorAll('.bcard');
  cards.forEach(function(card){
    const statusEl=card.querySelector('.binfo-status');
    const actsEl=card.querySelector('.bacts');
    if(!statusEl||!actsEl)return;
    const btnEl=actsEl.querySelector('.bact:nth-child(2)');
    if(!btnEl)return;
    const onclickStr=btnEl.getAttribute('onclick')||'';
    if(!onclickStr.includes("'"+id+"'"))return;
    const labels={ongoing:'连载中',complete:'已完结',paused:'暂停'};
    const statusClass=book.status||'ongoing';
    statusEl.className='binfo-status '+statusClass;
    statusEl.textContent=labels[statusClass]||'连载中';
  });
}
// ==================== 弹出菜单公共工具 ====================
function _positionPopMenu(pop,btn){
  var rect=btn.getBoundingClientRect();
  var popW=pop.offsetWidth;var popH=pop.offsetHeight;
  var left=Math.min(rect.left,window.innerWidth-popW-8);
  var top=Math.min(rect.bottom+4,window.innerHeight-popH-8);
  left=Math.max(left,4);
  top=Math.max(top,4);
  pop.style.left=left+'px';pop.style.top=top+'px';
}

function _closePopMenu(popId,btn){
  var el=document.getElementById(popId);
  if(el)el.remove();
  if(btn){btn._menuOpen=false;btn._menuClosedAt=Date.now();}
}

function _bindPopMenuClose(popId,btn){
  setTimeout(function(){
    var handler=function(e){
      var pop=document.getElementById(popId);
      if(!pop)return;
      if(pop.contains(e.target))return;
      if(btn&&btn.contains(e.target))return;
      _closePopMenu(popId,btn);
      document.removeEventListener('touchstart',handler,true);
      document.removeEventListener('click',handler,true);
    };
    document.addEventListener('touchstart',handler,true);
    document.addEventListener('click',handler,true);
  },100);
}
function renameBook(id){
  var book=cols.books.find(function(b){return b.id===id;});
  if(!book)return;
  showInp('更名','输入新书名',function(name){
    name=name.trim();
    if(!name){showToast('标题不能为空');return;}
    book.title=name;
    if(book.chapters&&book.chapters.length>0){
      var _lines=book.chapters[0].split('\n');
      for(var _i=0;_i<_lines.length;_i++){if(_lines[_i].trim()){_lines[_i]=name;break;}}
      book.chapters[0]=_lines.join('\n');
    }
    var wsArt=ws.find(function(a){return a.id===id;});
    if(wsArt){
      wsArt.title=name;
      if(wsArt.chapters&&wsArt.chapters.length>0){
        var _l2=wsArt.chapters[0].split('\n');
        for(var _j=0;_j<_l2.length;_j++){if(_l2[_j].trim()){_l2[_j]=name;break;}}
        wsArt.chapters[0]=_l2.join('\n');
      }
      sv(K.ws,ws);
    }
    sv(K.cols,cols);
    renderCollections();
    showToast('已更名');
  });
  setTimeout(function(){var f=document.getElementById('inpField');if(f)f.value=book.title||'';},120);
}
function toggleBookMenu(id,btn){
  var old=document.getElementById('bookMenuPop');
  if(old){old.remove();btn._menuOpen=false;return;}
  if(btn._menuClosedAt&&Date.now()-btn._menuClosedAt<200)return;
  btn._menuOpen=true;
  var pop=document.createElement('div');
  pop.id='bookMenuPop';
  pop.className='pop-glass-menu';
  pop.style.cssText='position:fixed;z-index:300;width:216px;padding:8px;animation:fadeIn .15s ease;display:grid;grid-template-columns:1fr 1fr 1fr;gap:2px';
  var items=[
    {icon:'fa-pen',text:'更名',fn:function(){renameBook(id);}},
    {icon:'fa-palette',text:'封面',fn:function(){openCoverOptions(id);}},
    {icon:'fa-sync-alt',text:'状态',fn:function(){cycleStatus(id);}},
    {icon:'fa-folder',text:'移动到文件夹',fn:function(){openColFolderPicker('book',id);}},
    {icon:'fa-share-alt',text:'分享',fn:function(){shareColBookAsRes(id);}},
    {icon:'fa-file-export',text:'导出',fn:function(){exportBookToTxt(id);}},
    {icon:'fa-trash-alt',text:'删除',fn:function(){deleteBook(id);},danger:true}
  ];
  items.forEach(function(it){
    var d=document.createElement('div');
    d.style.cssText='padding:11px 4px;font-size:11px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:5px;color:'+(it.danger?'var(--danger)':'var(--text2)')+';border-radius:10px;text-align:center;transition:background .15s;';
    d.innerHTML='<i class="fas '+it.icon+'" style="font-size:17px;'+(it.danger?'color:var(--danger)':'color:var(--text)')+'"></i><span style="font-size:11px;color:'+(it.danger?'var(--danger)':'var(--text2)')+'">'+it.text+'</span>';
    d.addEventListener('click',function(e){
      e.preventDefault();e.stopPropagation();
      _closePopMenu('bookMenuPop',btn);
      setTimeout(function(){it.fn();},50);
    });
    pop.appendChild(d);
  });
  document.body.appendChild(pop);
  _positionPopMenu(pop,btn);
  _bindPopMenuClose('bookMenuPop',btn);
}
function openColBook(id){
  const book=cols.books.find(b=>b.id===id);
  if(book)openReading(book);
}

function uploadCover(id,target){
  target=target||'col';
  const input=document.getElementById('coverUp');
  input.onchange=e=>{
    const file=e.target.files[0];if(!file)return;
    if(file.size>5*1024*1024){showToast('图片太大，请选择5MB以内的图片',3000);input.value='';return;}
    const canvas=document.createElement('canvas');
    const img=new Image();
    img.onerror=()=>{URL.revokeObjectURL(img.src);input.value='';showToast('图片加载失败，请换一张');};
    img.onload=()=>{
      const maxW=600;
      let w=img.width,h=img.height;
      if(w>maxW){h=h*(maxW/w);w=maxW;}
      canvas.width=w;canvas.height=h;
      canvas.getContext('2d').drawImage(img,0,0,w,h);
      const dataUrl=canvas.toDataURL('image/jpeg',0.75);
      if(dataUrl.length>200*1024){
        showToast('图片较大，已自动优化质量',2000);
        const dataUrl2=canvas.toDataURL('image/jpeg',0.5);
        _saveCoverData(id,target,dataUrl2);
        return;
      }
      _saveCoverData(id,target,dataUrl);
    };
    img.src=URL.createObjectURL(file);
    input.value='';
  };
  input.click();
}

function copyBook(id){
  const book=cols.books.find(b=>b.id===id);if(!book)return;
  let text='';
  if(book.chapters){book.chapters.forEach((ch,i)=>{text+='第'+(i+1)+'章\n\n'+ch+'\n\n';});}
  text=text.replace(/[\u200B-\u200D\uFEFF]/g,'');
  const header='════════════════════\n「'+book.title+'」\n本文由「星叙」辅助创作生成\n创作工具：星叙 · Created by 心田\n════════════════════\n\n';
  const footer='\n\n════════════════════\n本文由AI辅助创作，内容仅供参考\n创作工具：星叙 '+APP_VER+'（AI辅助创作工坊）\n网页作者：心田\n════════════════════';
  doCopy(header+text+footer);
}
function shareBook(id){
  const book=cols.books.find(b=>b.id===id);if(!book)return;
  let text='';
  if(book.chapters){book.chapters.forEach((ch,i)=>{text+='第'+(i+1)+'章\n\n'+ch+'\n\n';});}
  text=text.replace(/[\u200B-\u200D\uFEFF]/g,'');
  const header='════════════════════\n「'+book.title+'」\n本文由「星叙」辅助创作生成\n创作工具：星叙 · Created by 心田\n════════════════════\n\n';
  const footer='\n\n════════════════════\n本文由AI辅助创作，内容仅供参考\n创作工具：星叙 '+APP_VER+'（AI辅助创作工坊）\n网页作者：心田\n════════════════════';
  const shareText=header+text+footer;
  if(navigator.share){
    navigator.share({title:book.title||'分享作品',text:shareText}).catch(function(){});
  } else {
    doCopy(shareText);showToast('已复制到剪贴板，可粘贴分享');
  }
}
function shareColBookAsRes(id){
  var book=cols.books.find(function(b){return b.id===id;});
  if(!book)return;
  var wc=getTotalWords(book);
  if(wc<10){showToast('内容太少，至少写10字再分享');return;}
  _showResPackInfoForm(
    {name:book.title||'未命名',author:userCard.name||'星叙用户'},
    function(packName,packAuthor,packDesc){
      var packData=JSON.parse(JSON.stringify(book));
      var pack={
        _app:'syn_resource',_ver:APP_VER,
        id:uid(),name:packName,
        desc:packDesc||(book.chapters?book.chapters.length+'章 · '+wc+'字':'短篇 · '+wc+'字'),
        author:packAuthor,
        createdAt:new Date().toISOString(),
        items:[{type:'work',name:'小说：'+(book.title||'未命名'),data:packData}]
      };
      var jsonStr=JSON.stringify(pack,null,2);
      var fileName='星叙_'+packName+'_'+new Date().toLocaleDateString().replace(/\//g,'-')+'.json';
      _exportFileWithFallback(fileName,jsonStr,'application/json;charset=utf-8');
    }
  );
}
function deleteBook(id){
const book=cols.books.find(b=>b.id===id);
if(!book)return;
const chCount=book.chapters?book.chapters.length:0;
const wc=getTotalWords(book);
showDlg('删除确认','确定要删除《'+book.title+'》吗？\n\n'+chCount+' 章 · '+wc+' 字\n\n会放进回收站，保留7天，期间可以恢复。',()=>{
const target=cols.books.find(b=>b.id===id);
if(!target){renderCollections();return;}
// 先放进回收站再从书架移除：回收站写入失败时作品保持原样，不会凭空消失
if(!_moveToTrash('colBook',target)){showToast('放入回收站失败，作品未删除',4000);return;}
cols.books=cols.books.filter(b=>b.id!==id);
sv(K.cols,cols);renderCollections();showToast('已移入回收站（保留7天）');
},true);
}


function copyShort(id){
const s=cols.shorts.find(x=>x.id===id);if(!s)return;
let text=s.content||'';
text=text.replace(/[\u200B-\u200D\uFEFF]/g,'');
const header='════════════════════\n「'+s.title+'」\n本文由「星叙」辅助创作生成\n创作工具：星叙 · Created by 心田\n════════════════════\n\n';
const footer='\n\n════════════════════\n本文由AI辅助创作，内容仅供参考\n创作工具：星叙 '+APP_VER+'（AI辅助创作工坊）\n网页作者：心田\n════════════════════';
doCopy(header+text+footer);
}
function shareShort(id){
  var s=cols.shorts.find(function(x){return x.id===id;});
  if(!s)return;
  var wc=(s.content||'').length;
  if(wc<10){showToast('内容太少，至少写10字再分享');return;}
  _showResPackInfoForm(
    {name:(s.title||'未命名短篇'),author:userCard.name||'星叙用户'},
    function(packName,packAuthor,packDesc){
      var packData=JSON.parse(JSON.stringify(s));
      var pack={
        _app:'syn_resource',_ver:APP_VER,
        id:uid(),name:packName,
        desc:packDesc||('短篇 · '+wc+'字'),
        author:packAuthor,
        createdAt:new Date().toISOString(),
        items:[{type:'work',name:'短篇：'+(s.title||'未命名'),data:packData}]
      };
      var jsonStr=JSON.stringify(pack,null,2);
      var fileName='星叙_'+packName+'_'+new Date().toLocaleDateString().replace(/\//g,'-')+'.json';
      _exportFileWithFallback(fileName,jsonStr,'application/json;charset=utf-8');
    }
  );
}
function deleteShort(id){
showDlg('删除确认','确定要删除这篇短文吗？\n\n会放进回收站，保留7天，期间可以恢复。',()=>{
const target=cols.shorts.find(s=>s.id===id);
if(!target){renderCollections();return;}
if(!_moveToTrash('colShort',target)){showToast('放入回收站失败，短文未删除',4000);return;}
cols.shorts=cols.shorts.filter(s=>s.id!==id);
sv(K.cols,cols);renderCollections();showToast('已移入回收站（保留7天）');
},true);
}
// 短篇卡片菜单"复制"：不依赖当前是否正在阅读该短篇（curRd），直接按id从cols.shorts取内容复制
function copyShortFullText(id){
  var s=cols.shorts.find(function(x){return x.id===id;});
  if(!s){showToast('找不到该短篇');return;}
  var text=(s.content||'').replace(/[\u200B-\u200D\uFEFF]/g,'');
  var header='════════════════════\n「'+(s.title||'未命名短篇')+'」\n本文由「星叙」辅助创作生成\n创作工具：星叙 · Created by 心田\n════════════════════\n\n';
  var footer='\n\n════════════════════\n本文由AI辅助创作，内容仅供参考\n创作工具：星叙 '+APP_VER+'（AI辅助创作工坊）\n网页作者：心田\n════════════════════';
  doCopy(header+text+footer);
}
function toggleShortMenu(id,btn){
  var old=document.getElementById('shortMenuPop');
  if(old){old.remove();btn._menuOpen=false;return;}
  if(btn._menuClosedAt&&Date.now()-btn._menuClosedAt<200)return;
  btn._menuOpen=true;
  var pop=document.createElement('div');
  pop.id='shortMenuPop';
  pop.className='pop-glass-menu';
  pop.style.cssText='position:fixed;z-index:300;width:216px;padding:8px;animation:fadeIn .15s ease;display:grid;grid-template-columns:1fr 1fr 1fr;gap:2px';
  var items=[
    {icon:'fa-pen',text:'更名',fn:function(){renameShort(id);}},
    {icon:'fa-copy',text:'复制',fn:function(){copyShortFullText(id);}},
    {icon:'fa-folder',text:'移动到文件夹',fn:function(){openColFolderPicker('short',id);}},
    {icon:'fa-share-alt',text:'分享',fn:function(){shareShort(id);}},
    {icon:'fa-file-export',text:'导出',fn:function(){exportShort(id);}},
    {icon:'fa-trash-alt',text:'删除',fn:function(){deleteShort(id);},danger:true}
  ];
  var colCount=Math.ceil(Math.sqrt(items.length));
  pop.style.gridTemplateColumns='repeat('+colCount+',1fr)';
  pop.style.width=(colCount*72+16)+'px';
  items.forEach(function(it){
    var d=document.createElement('div');
    d.style.cssText='padding:11px 4px;font-size:11px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:5px;color:'+(it.danger?'var(--danger)':'var(--text2)')+';border-radius:10px;text-align:center;transition:background .15s;';
    d.innerHTML='<i class="fas '+it.icon+'" style="font-size:17px;'+(it.danger?'color:var(--danger)':'color:var(--text)')+'"></i><span style="font-size:11px;color:'+(it.danger?'var(--danger)':'var(--text2)')+'">'+it.text+'</span>';
    d.addEventListener('click',function(e){
      e.preventDefault();e.stopPropagation();
      _closePopMenu('shortMenuPop',btn);
      setTimeout(function(){it.fn();},50);
    });
    pop.appendChild(d);
  });
  document.body.appendChild(pop);
  _positionPopMenu(pop,btn);
  _bindPopMenuClose('shortMenuPop',btn);
}

function renameShort(id){
  var s=cols.shorts.find(function(x){return x.id===id;});
  if(!s)return;
  showInp('更名','输入新标题',function(name){
    name=(name||'').trim();
    if(!name){showToast('标题不能为空');return;}
    s.title=name;
    var wsArt=ws.find(function(a){return a.id===id;});
    if(wsArt){wsArt.title=name;sv(K.ws,ws);}
    sv(K.cols,cols);
    renderCollections();
    showToast('已更名');
  });
  setTimeout(function(){var f=document.getElementById('inpField');if(f)f.value=s.title||'';},120);
}

function exportShort(id){
  var s=cols.shorts.find(function(x){return x.id===id;});
  if(!s){showToast('找不到该短篇');return;}
  doExportWork(s,true);
}

// ==================== 新手教程：星笺分步引导 ====================
// 整体流程：首次测试API通过 → 星笺询问是否跟着教学 → 快速向导 → 作坊引导 → 首次打开长篇时的阅读页引导
// 状态标志（ld/sv 持久化）：
//   bj_tutPromptDone    询问弹窗已处理（点"好的"/"不需要"/点遮罩关闭都算），之后不再询问
//   bj_tutAccepted      用户点了"好的"；作坊引导和阅读页引导只在它为真时才会出现
//   bj_tutWorkshopDone / bj_tutReaderDone   对应引导已经展示过，各只出现一次
var _tutSession=null;     // 当前正在进行的引导；同一时间只允许一个
var _tutOfferTimer=null;  // 询问弹窗的延迟定时器
var _tutWsTimer=null;     // 作坊引导的延迟定时器
var _tutRdTimer=null;     // 阅读页引导的延迟定时器

function _tutUserName(){
  return (typeof userCard!=='undefined' && userCard && userCard.name)?userCard.name:'你';
}
function _tutIsAccepted(){
  return !!ld('bj_tutAccepted',false);
}
// 元素在文档里且有实际尺寸
function _tutElVisible(el){
  if(!el || !document.body.contains(el)) return false;
  var r=el.getBoundingClientRect();
  return r.width>0 && r.height>0;
}
// 在"可见"之外，再确认元素没被别的浮层盖住（取中心点命中测试；中心点在屏幕外时无法判断，按没被盖住处理）
function _tutElReachable(el){
  if(!_tutElVisible(el)) return false;
  var r=el.getBoundingClientRect();
  var x=r.left+r.width/2, y=r.top+r.height/2;
  if(x<0 || y<0 || x>window.innerWidth || y>window.innerHeight) return true;
  var hit=document.elementFromPoint(x,y);
  return !!hit && (hit===el || el.contains(hit) || hit.contains(el));
}

// ---------- 第一步：测试连接通过后询问 ----------
// 只对全新用户、且从没问过的情况生效
function tutOfferAfterApiTest(){
  if(!ld('bj_isNewUserFlag',false) || ld('bj_tutPromptDone',false)) return;
  if(_tutOfferTimer) return; // 已在排队，连续测试时不重复弹
  // 延后一点，让用户先看到"测试通过"的提示
  _tutOfferTimer=setTimeout(function(){
    _tutOfferTimer=null;
    try{
      // 延迟期间状态可能变了，重新确认
      if(ld('bj_tutPromptDone',false)) return;
      var dlg=document.getElementById('dlgOv');
      var okBtn=document.getElementById('dlgOkBtn');
      var cancelBtn=document.querySelector('#dlgOv .dlg-cancel');
      // 确认弹窗是全局共用的一个节点：别的弹窗正在显示时不覆盖它，留到下次测试通过再问
      if(!dlg || !okBtn || !cancelBtn || dlg.classList.contains('show')) return;
      showDlg('星笺',_tutUserName()+'，API连上了。接下来要设定上下文提示词，AI才知道你想写什么样的故事。要不要星笺带你一起做一遍？',function(){
        sv('bj_tutAccepted',true);
        try{ openWizard(); }catch(e){ logError('tutOpenWizard',e); }
      });
      okBtn.textContent='好的';
      cancelBtn.style.display='';
      cancelBtn.textContent='不需要';
      // 弹窗已经显示，之后无论怎么关闭都算处理过，不再重复询问
      sv('bj_tutPromptDone',true);
    }catch(e){ logError('tutOfferAfterApiTest',e); }
  },700);
}

// ---------- 第二步：向导完成后进入作坊引导 ----------
// 向导"完成并应用"后调用。已同意教学且作坊引导还没展示过时，带用户去作坊并安排引导；返回 true 表示后续由教程接管
function tutAfterWizardApplied(){
  try{
    if(!_tutIsAccepted() || ld('bj_tutWorkshopDone',false)) return false;
    var wsBtn=document.querySelector('.bnav-i');
    if(!wsBtn) return false;
    // 向导从API设置页的询问弹窗进来时，那一页还盖在上面，先关掉，否则作坊会被遮住
    var apiModal=document.getElementById('setModalApi');
    if(apiModal && apiModal.classList.contains('show')) closeSetModal('api');
    if(!wsBtn.classList.contains('act')) switchPage('workshop',wsBtn);
    tutScheduleWorkshopGuide();
    return true;
  }catch(e){
    logError('tutAfterWizardApplied',e);
    return false;
  }
}

// 每次切换到某个页面后调用（switchPage 内）
function tutOnPageEnter(pg){
  if(pg==='workshop') tutScheduleWorkshopGuide();
}

function tutScheduleWorkshopGuide(){
  if(!_tutIsAccepted() || ld('bj_tutWorkshopDone',false) || _tutWsTimer) return;
  // 等页面切换动画结束、元素位置稳定后再开始
  _tutWsTimer=setTimeout(function(){
    _tutWsTimer=null;
    try{ tutStartWorkshopGuide(); }catch(e){ logError('tutStartWorkshopGuide',e); }
  },700);
}

function tutStartWorkshopGuide(){
  if(_tutSession || !_tutIsAccepted() || ld('bj_tutWorkshopDone',false)) return false;
  var pg=document.getElementById('pg-workshop');
  var input=document.getElementById('searchInput');
  // 作坊不是当前页、或输入框被别的浮层盖住时不开始，也不记为已展示，留给下一次进入作坊
  if(!pg || !pg.classList.contains('act') || !_tutElReachable(input)) return false;
  sv('bj_tutWorkshopDone',true);
  return tutRun([
    {pick:function(){
      return {el:document.getElementById('searchInput'),text:'想写什么，就写在这儿。长按输入框可以放大，写长一点也不挤。'};
    }},
    {pick:function(){
      return {el:document.getElementById('tagsWrap'),text:'标签最多选六个，也能用来筛出同类型的作品。想清空的话，双击任意一个标签就行。'};
    }},
    {pick:function(){
      var previewBtn=document.querySelector('#pg-workshop button[onclick="showSettingPreview()"]');
      if(_tutElVisible(previewBtn)) return {el:previewBtn,text:'点「查看当前生效设定」，确认没用错，就可以点「生成」了。'};
      // 精简模式下这个按钮被隐藏，改为直接指向生成按钮
      return {el:document.getElementById('btnGen'),text:'设定确认好了，就点「生成」吧。'};
    }}
  ]);
}

// ---------- 第三步：第一次打开长篇时的阅读页引导 ----------
// openReading 末尾调用
function tutScheduleReaderGuide(){
  if(!_tutIsAccepted() || ld('bj_tutReaderDone',false) || _tutRdTimer) return;
  // 续写相关的内容只有长篇才有
  if(!curRd || curRd.type!=='long') return;
  var rdId=curRd.id;
  // 等翻页阅读器分页完成后再开始
  _tutRdTimer=setTimeout(function(){
    _tutRdTimer=null;
    try{ tutStartReaderGuide(rdId); }catch(e){ logError('tutStartReaderGuide',e); }
  },900);
}

function tutStartReaderGuide(rdId){
  if(_tutSession || !_tutIsAccepted() || ld('bj_tutReaderDone',false)) return false;
  var modal=document.getElementById('rdModal');
  // 阅读页已关闭、或已换成别的作品时不再开始
  if(!modal || !modal.classList.contains('show') || !curRd || curRd.id!==rdId || !_rdOverlayEl) return false;
  sv('bj_tutReaderDone',true);
  // 要指向浮层里的按钮，所以先把浮层呼出来；引导结束后再收起，恢复成正常阅读状态
  _rdShowOverlay();
  var topBtns=function(){
    return _rdOverlayEl?_rdOverlayEl.querySelectorAll('.rd-reader-ov-top .rd-reader-ov-btn'):[];
  };
  var started=tutRun([
    {pick:function(){
      var b=topBtns();
      return {el:b.length?b[b.length-1]:null,text:'想续写的话，得先点右上角的爱心收藏，没收藏的作品没法续写。'};
    }},
    {pick:function(){
      var b=topBtns();
      return {el:b.length>=2?b[b.length-2]:null,text:'旁边的铅笔是在线编辑，想改哪里直接改。'};
    }},
    {pick:function(){
      // 续写区只在"长篇且已收藏"时才存在；还没收藏时找不到它，就居中讲解
      var quick=_rdOverlayEl?_rdOverlayEl.querySelector('[onclick*="quickContinue"]'):null;
      var how='快速续写直接往下写，更快；智能续写会先梳理前情和人物状态，更稳，不容易跑偏。';
      if(quick && quick.parentElement) return {el:quick.parentElement,text:how};
      return {el:null,text:'收藏之后就会出现续写按钮。'+how};
    }},
    {pick:function(){
      var save=_rdOverlayEl?_rdOverlayEl.querySelector('[onclick*="manualSaveSnapshot"]'):null;
      return {el:save,text:'写到喜欢的地方记得手动存档，也要定期去设置里导出备份。数据都在本机，丢了星笺也找不回来。其他的，你慢慢探索吧。'};
    }}
  ],function(){
    // 引导结束（含被返回键、关闭阅读页打断）后收起浮层
    if(_rdOverlayEl) _rdHideOverlay();
  });
  if(!started && _rdOverlayEl) _rdHideOverlay();
  return started;
}

// ---------- 分步引导引擎 ----------
// steps: [{pick:function(){ return {el:目标元素或null, text:'星笺说的话'}; }}]
// el 为 null 时不高亮，气泡居中显示。onEnd 在引导结束时（无论正常结束还是被打断）调用一次。返回 true 表示引导已开始
function tutRun(steps,onEnd){
  tutDismiss();
  // 开始前先筛掉目标已经不可见的步骤，这样进度"1 / N"里的 N 是准确的
  var usable=steps.filter(function(st){
    var p=null;
    try{ p=st.pick(); }catch(e){ logError('tutPick',e); }
    return !!p && typeof p.text==='string' && (!p.el || _tutElVisible(p.el));
  });
  if(usable.length===0) return false;

  var blocker=document.createElement('div');
  blocker.className='xj-tut-blocker';
  // 引导期间吞掉点击和滚轮，避免用户操作把高亮位置带偏
  blocker.addEventListener('click',function(e){e.stopPropagation();});
  blocker.addEventListener('wheel',function(e){e.preventDefault();},{passive:false});

  var spot=document.createElement('div');
  spot.className='xj-tut-spot';
  spot.setAttribute('aria-hidden','true');
  spot.style.transition='none'; // 第一次定位不要从左上角滑过来

  var bubble=document.createElement('div');
  bubble.className='xj-tut-bubble';
  bubble.setAttribute('role','dialog');
  bubble.setAttribute('aria-label','星笺新手引导');
  bubble.innerHTML=
    '<div class="xj-tut-row"><img class="xj-tut-avatar" src="./photos/xinx.png" alt="星笺"><div class="xj-tut-text"></div></div>'+
    '<div class="xj-tut-foot"><span class="xj-tut-count"></span><span class="xj-tut-btns"></span></div>';

  var s={
    steps:usable,idx:0,cur:null,onEnd:onEnd,raf:0,settleTimer:null,
    nodes:{
      blocker:blocker,spot:spot,bubble:bubble,
      text:bubble.querySelector('.xj-tut-text'),
      count:bubble.querySelector('.xj-tut-count'),
      btns:bubble.querySelector('.xj-tut-btns')
    }
  };
  // 窗口尺寸变化或任意容器滚动后，高亮框和气泡要跟着目标重新定位；合并到下一帧，避免连续触发
  s.onReflow=function(){
    if(s.raf) return;
    s.raf=requestAnimationFrame(function(){ s.raf=0; _tutPlace(s); });
  };
  // 在捕获阶段拦截 Esc，否则全局的 Esc 处理会连带把阅读页等界面关掉
  s.onKey=function(e){
    if(e.key==='Escape'){ e.preventDefault(); e.stopPropagation(); tutDismiss(); }
  };

  _tutSession=s;
  document.body.appendChild(blocker);
  document.body.appendChild(spot);
  document.body.appendChild(bubble);
  window.addEventListener('resize',s.onReflow);
  window.addEventListener('scroll',s.onReflow,true);
  document.addEventListener('keydown',s.onKey,true);
  navPush('xjTutOv');
  _tutRenderStep(s);
  requestAnimationFrame(function(){ spot.style.transition=''; });
  return true;
}

function _tutMakeBtn(label,extraClass,onClick){
  var b=document.createElement('button');
  b.type='button';
  b.className='xj-tut-btn'+(extraClass?' '+extraClass:'');
  b.textContent=label;
  b.onclick=function(){
    // 点击瞬间就禁用，防止连点让同一步操作触发多次；点完后要么整个气泡被移除，要么按钮被下一步重建
    b.disabled=true;
    onClick();
  };
  return b;
}

function _tutRenderStep(s){
  if(_tutSession!==s) return;
  // 找到下一个目标仍然可见的步骤；目标已经消失的步骤直接跳过
  var picked=null;
  while(s.idx<s.steps.length){
    var p=null;
    try{ p=s.steps[s.idx].pick(); }catch(e){ logError('tutPick',e); }
    if(p && typeof p.text==='string' && (!p.el || _tutElVisible(p.el))){ picked=p; break; }
    s.idx++;
  }
  if(!picked){ tutDismiss(); return; }

  s.cur=picked;
  var isLast=(s.idx>=s.steps.length-1);
  s.nodes.text.textContent=picked.text;
  s.nodes.count.textContent=(s.idx+1)+' / '+s.steps.length;
  s.nodes.btns.innerHTML='';
  if(!isLast) s.nodes.btns.appendChild(_tutMakeBtn('跳过','',function(){ tutDismiss(); }));
  var nextBtn=_tutMakeBtn(isLast?'知道了':'下一步','primary',function(){
    if(isLast){ tutDismiss(); return; }
    s.idx++;
    _tutRenderStep(s);
  });
  s.nodes.btns.appendChild(nextBtn);

  // 目标不在可视区时先滚进来；只在切换步骤时滚一次，重新定位时不滚，避免和滚动监听互相触发
  if(picked.el){
    var r=picked.el.getBoundingClientRect();
    if(r.top<0 || r.bottom>window.innerHeight){
      try{ picked.el.scrollIntoView({block:'center'}); }catch(e){}
    }
  }
  _tutPlace(s);
  try{ nextBtn.focus({preventScroll:true}); }catch(e){}
  // 浮层淡入动画、滚动结束后位置会有细微偏移，稍后再校准一次
  if(s.settleTimer) clearTimeout(s.settleTimer);
  s.settleTimer=setTimeout(function(){ s.settleTimer=null; _tutPlace(s); },350);
}

// 根据当前步骤的目标，摆放高亮框和气泡
function _tutPlace(s){
  if(_tutSession!==s || !s.cur) return;
  var vw=window.innerWidth, vh=window.innerHeight;
  var spot=s.nodes.spot, bubble=s.nodes.bubble, blocker=s.nodes.blocker;
  var bw=bubble.offsetWidth, bh=bubble.offsetHeight;
  var margin=12, pad=6, gap=12;
  var el=s.cur.el;
  var left, top;
  // 目标还在文档里才高亮；已被移除（如浮层被重建）就退化成居中显示，不留悬空的高亮框
  if(el && _tutElVisible(el)){
    var r=el.getBoundingClientRect();
    spot.style.display='block';
    spot.style.left=Math.round(r.left-pad)+'px';
    spot.style.top=Math.round(r.top-pad)+'px';
    spot.style.width=Math.round(r.width+pad*2)+'px';
    spot.style.height=Math.round(r.height+pad*2)+'px';
    blocker.classList.remove('xj-tut-dim');
    var spaceBelow=vh-(r.bottom+pad), spaceAbove=r.top-pad;
    if(spaceBelow>=bh+gap+margin) top=r.bottom+pad+gap;
    else if(spaceAbove>=bh+gap+margin) top=r.top-pad-gap-bh;
    else top=(r.top+r.height/2>vh/2)?margin:vh-bh-margin; // 上下都放不下：放到与目标相反的半屏
    left=r.left+r.width/2-bw/2;
  }else{
    spot.style.display='none';
    blocker.classList.add('xj-tut-dim'); // 没有高亮框时由遮罩自己负责变暗
    top=(vh-bh)/2;
    left=(vw-bw)/2;
  }
  left=Math.max(margin,Math.min(vw-bw-margin,left));
  top=Math.max(margin,Math.min(vh-bh-margin,top));
  bubble.style.left=Math.round(left)+'px';
  bubble.style.top=Math.round(top)+'px';
}

// 结束引导并清理全部痕迹（遮罩、监听器、定时器、返回栈层级）；没有进行中的引导时也可安全调用
function tutDismiss(){
  if(_tutWsTimer){ clearTimeout(_tutWsTimer); _tutWsTimer=null; }
  if(_tutRdTimer){ clearTimeout(_tutRdTimer); _tutRdTimer=null; }
  var s=_tutSession;
  if(!s) return;
  _tutSession=null;
  if(s.raf) cancelAnimationFrame(s.raf);
  if(s.settleTimer) clearTimeout(s.settleTimer);
  window.removeEventListener('resize',s.onReflow);
  window.removeEventListener('scroll',s.onReflow,true);
  document.removeEventListener('keydown',s.onKey,true);
  ['blocker','spot','bubble'].forEach(function(k){
    var n=s.nodes[k];
    if(n && n.parentNode) n.parentNode.removeChild(n);
  });
  navPop('xjTutOv');
  if(typeof s.onEnd==='function'){
    try{ s.onEnd(); }catch(e){ logError('tutOnEnd',e); }
  }
}
