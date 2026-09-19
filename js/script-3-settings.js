/*
╔══════════════════════════════════════════════════════════════════
║  星叙 script-3-settings.js — JS 结构目录（拆分 3/5）
║  主题：设置中心 & 数据管理 & 编辑器核心
║
║  本文件是原 script.js 按功能板块拆成的 5 份之一，浏览器里需要按顺序加载：
║  script-1-core.js → script-2-content.js → script-3-settings.js → script-4-aitools.js → script-5-system.js
║  （原单文件共 40191 行；本文件对应原文件第 9315~16071 行，body 共 6757 行）
╠══════════════════════════════════════════════════════════════════
║   SETTINGS                      47
║   SETTINGS MODAL                48
║   全局/局部设定管理                     459
║   自定义系统提示词预设                    500
║   绑定预设美化选择器                     715
║   预设与模板自定义分类系统                  786
║   通用模板选择弹窗                      1133
║   APPEARANCE                    1287
║   全屏模式                          1375
║   内置字体                          1460
║   DATA IMPORT/EXPORT            1716
║   CREATE PAGE                   2522
║   创作页折叠工具栏                      2539
║   创作页顶部「创作工具箱」按钮：搜索作品           2562
║   创作工具箱文件夹                      2827
║   收藏页文件夹                        3119
║   EDITOR                        3427
║   氛围写作                          3428
║   编辑器折叠工具栏                      4102
║   创作编辑器                         4153
║   编辑器章节拖拽排序                     4327
║   编辑器撤回功能                       4502
║   写作排版设置                        4642
║   自动排版·排版规则                     4647
║   编辑器搜索功能                       4778
║   创作页阅读模式                       4945
║   Markdown 编辑功能                 5488
║   排版规则设置弹窗                      5633
║   AI REVIEW                     5677
║   AI深度校对（不改内容只挑问题）              5743
║   AI错别字检查                       5982
║   章节大纲：分卷分组 + 排序                6153
║   章节目录：长按删除（共享工具，创作页/阅读页目录通用）   6410
║   分卷（章节目录/章节大纲通用）               6453
╚══════════════════════════════════════════════════════════════════
*/

// ==================== SETTINGS ====================
// ==================== SETTINGS MODAL ====================
function openSetModal(type){
// 如果是API设置或其他全屏设置，先关闭可能遮挡的小弹窗
if(true){
  try{document.getElementById('dlgOv').classList.remove('show');}catch(e){}
  try{document.getElementById('inpOv').classList.remove('show');}catch(e){}
  try{document.getElementById('resExpOv').classList.remove('show');}catch(e){}
  try{document.getElementById('phraseModalOv').classList.remove('show');}catch(e){}
  try{document.getElementById('regenFeedbackOv').classList.remove('show');}catch(e){}
  try{document.getElementById('wheelEditOv').classList.remove('show');}catch(e){}
  try{document.getElementById('presetOptOv').classList.remove('show');}catch(e){}
  try{document.getElementById('presetModalOv').classList.remove('show');}catch(e){}
  try{document.getElementById('favModal').classList.remove('show');}catch(e){}
  try{document.getElementById('globalSearchModal').classList.remove('show');}catch(e){}
  try{document.getElementById('genTemplateModal').classList.remove('show');}catch(e){}
  try{document.getElementById('coverGenOv').classList.remove('show');}catch(e){}
  try{document.getElementById('diffCompareOv').classList.remove('show');}catch(e){}
  try{document.getElementById('expandOv').classList.remove('show');}catch(e){}
  try{document.getElementById('rewriteOv').classList.remove('show');}catch(e){}
  try{document.getElementById('avatarCropOv').classList.remove('show');}catch(e){}
  try{document.getElementById('gfbPanel').classList.remove('show');}catch(e){}
}
const map={api:'setModalApi',char:'setModalChar',world:'setModalWorld',style:'setModalStyle',rule:'setModalRule',ban:'setModalBan',theme:'setModalTheme',notify:'setModalNotify',data:'setModalData',sysPrompt:'setModalSysPrompt',other:'setModalOther',about:'setModalAbout'};
const id=map[type];if(!id)return;
document.getElementById(id).classList.add('show');
navPush(id);
  // 打开其他设置时恢复氛围写作控件状态
  if(type==='other') setTimeout(_restoreAmbienceSettings, 50);
document.getElementById('bnav').classList.add('hide');
if(type==='api'){
  // 首次进入API设置页：仅对"新用户"显示按钮闪红光 + 星笺气泡引导，老用户不会看到，且每人只展示一次
  if(ld('bj_isNewUserFlag', false) && !ld('bj_apiGuideOnboardShown', false)){
    sv('bj_apiGuideOnboardShown', true);
    window._apiGuideOnboardTimer = setTimeout(function(){
      window._apiGuideOnboardTimer = null;
      showApiGuideOnboarding();
    }, 600);
  }
}
if(type==='char'){renderCharCards();renderCustomTraitList();renderRelList();renderNpcCards();}
if(type==='other'){updateXjVisibleUI();updateXjBubbleUI();updateContQualityUINew();initAll7Switches();try{refreshPersistStorageStatus();}catch(e){logError('refreshPersistStorageStatus', e);}}
if(type==='theme'){syncBuiltinFontActiveState();}
if(type==='data'){updateStorageDisplay();_updateLastBackupDisplay();try{refreshPersistStorageStatus();}catch(e){logError('refreshPersistStorageStatus', e);}var dmv=document.getElementById('dataMgrVerText');if(dmv)dmv.textContent=APP_VER;}
if(type==='data')setTimeout(updateDevUI,50);
if(type==='about'){
  var av=document.getElementById('aboutVerText');
  if(av)av.textContent=APP_VER;
}
if(type==='sysPrompt'){
  ensureSysPromptEntries();
  renderSysPromptEntryList();
  renderSysPromptPresets();
  return;
}
renderAllPresets();
}
function closeSetModal(type){
const map={api:'setModalApi',char:'setModalChar',world:'setModalWorld',style:'setModalStyle',rule:'setModalRule',ban:'setModalBan',theme:'setModalTheme',notify:'setModalNotify',data:'setModalData',sysPrompt:'setModalSysPrompt',other:'setModalOther',about:'setModalAbout'};
const id=map[type];if(!id)return;
// 关闭 API 设置时清理模型列表面板，避免残留展开状态
if(type==='api'){
  var _mla=document.getElementById('modelListArea');
  if(_mla)_mla.innerHTML='';
  var _tmla=document.getElementById('toolModelListArea');
  if(_tmla)_tmla.innerHTML='';
  var _fb=document.getElementById('fetchModelsBtn');
  if(_fb){_fb.disabled=false;_fb.innerHTML='<i class="fas fa-cloud-arrow-down"></i> 拉取';}
  var _tfb=document.getElementById('fetchToolModelsBtn');
  if(_tfb){_tfb.disabled=false;_tfb.innerHTML='<i class="fas fa-cloud-arrow-down"></i> 拉取';}
  // 关闭页面时清理"配置教程"新手引导的残留状态（还没点掉就退出设置页的情况）
  if(window._apiGuideOnboardTimer){clearTimeout(window._apiGuideOnboardTimer);window._apiGuideOnboardTimer=null;}
  if(typeof window._apiGuideDismiss==='function'){window._apiGuideDismiss();}
}
document.getElementById(id).classList.remove('show');
navPop(id);
document.getElementById('bnav').classList.remove('hide');
saveCurSettings();
}
// ===== API设置页：配置教程 首次新手引导 =====
function showApiGuideOnboarding(){
  var btn=document.getElementById('apiGuideBtn');
  if(!btn) return;
  // 防御性清理：如果上一次的引导还没消失就被再次调用，先清掉，避免重复创建导致的界面残留
  if(typeof window._apiGuideDismiss==='function'){
    window._apiGuideDismiss();
  }

  btn.classList.add('api-guide-flash');

  var badge=document.createElement('div');
  badge.className='api-guide-xj-badge';
  badge.style.visibility='hidden';
  var badgeImg=document.createElement('img');
  badgeImg.src='./photos/xinx.png';
  badgeImg.alt='星笺';
  badge.appendChild(badgeImg);

  var skinClass=(typeof xjSkin!=='undefined' && xjSkin && xjSkin!=='default')?(' skin-'+xjSkin):'';
  var bubble=document.createElement('div');
  bubble.className='xj-gb-bubble'+skinClass;
  var uName=(typeof userCard!=='undefined' && userCard && userCard.name)?userCard.name:'你';
  bubble.textContent=uName+'，记得点这里看配置教程哦～也可以自己上网搜「API使用教程」多了解一下。想快速用起来的话，可以试试注册公益站或中转站；不过站点质量参差不齐，星笺没法保证一定好用，请自行甄别～';
  bubble.style.visibility='hidden';

  document.body.appendChild(badge);
  document.body.appendChild(bubble);

  requestAnimationFrame(function(){
    // 元素可能在这一帧渲染前就被closeSetModal提前清理掉，先确认还挂在页面上
    if(!badge.parentNode || !bubble.parentNode) return;
    var btnRect=btn.getBoundingClientRect();
    var vw=window.innerWidth, vh=window.innerHeight;

    // 星笺小头像：吸附在"配置教程"按钮右下角（沿用主页悬浮星笺的比例，显示完整形象，不裁剪）
    var badgeW=44, badgeH=56;
    var badgeLeft=btnRect.right-badgeW/2;
    var badgeTop=btnRect.bottom-badgeH/2;
    badgeLeft=Math.max(4,Math.min(vw-badgeW-4,badgeLeft));
    badgeTop=Math.max(4,Math.min(vh-badgeH-4,badgeTop));
    badge.style.left=Math.round(badgeLeft)+'px';
    badge.style.top=Math.round(badgeTop)+'px';

    // 对话气泡：默认显示在星笺头像下方，放不下则自动翻到上方
    var bw=bubble.offsetWidth||220;
    var bh=bubble.offsetHeight||60;
    var bubbleLeft=badgeLeft+badgeW/2-bw/2;
    var bubbleTop=badgeTop+badgeH+10;
    if(bubbleTop+bh>vh-16) bubbleTop=badgeTop-bh-10;
    if(bubbleTop<8) bubbleTop=8;
    if(bubbleLeft<8) bubbleLeft=8;
    if(bubbleLeft+bw>vw-8) bubbleLeft=vw-bw-8;
    bubble.style.left=Math.round(bubbleLeft)+'px';
    bubble.style.top=Math.round(bubbleTop)+'px';

    badge.style.visibility='visible';
    bubble.style.visibility='visible';
  });

  // 点击页面任意处，引导效果全部消失
  function dismiss(){
    btn.classList.remove('api-guide-flash');
    if(badge.parentNode) badge.remove();
    if(bubble.parentNode) bubble.remove();
    document.removeEventListener('click',dismiss,true);
    window._apiGuideDismiss=null;
  }
  window._apiGuideDismiss=dismiss;
  document.addEventListener('click',dismiss,true);
}
function toggleGrp(el){el.classList.toggle('exp');el.nextElementSibling.classList.toggle('show');}

// API Presets
function saveApiPreset(){
showInp('保存API预设','为预设起个名字',name=>{
var toolUrl=(document.getElementById('toolApiUrl').value||'').trim();
var toolKey=(document.getElementById('toolApiKey').value||'').trim();
var toolModel=(document.getElementById('toolApiModel').value||'').trim();
var preset={name,...getCurApi()};
if(toolUrl||toolKey||toolModel){
preset.toolUrl=toolUrl;
preset.toolKey=toolKey;
preset.toolModel=toolModel;
}
apiP.push(preset);
sv(K.apiP,apiP);saveCurSettings();renderApiPresets();if(_presetType){renderPresetModalList();}showToast('API预设已保存');
});
}
function renderApiPresets(){
const l=document.getElementById('apiPL');l.innerHTML='';
apiP.forEach((p,i)=>{
const it=document.createElement('div');it.className='pitem';
var hasToolApi=p.toolUrl||p.toolKey||p.toolModel; it.innerHTML='<span class="pitem-n">'+esc(p.name)+' <span style="font-size:9px;color:var(--text2)">('+esc(p.model||'')+(hasToolApi?' + <i class="fas fa-tools"></i>工具API':'')+')</span></span><div class="pitem-a"><button class="btn-use" onclick="useApiP('+i+')">使用</button><button class="btn-del" onclick="delApiP('+i+')">删除</button></div>';
l.appendChild(it);
});
}
function useApiP(i){
const p=apiP[i];
document.getElementById('apiUrl').value=p.url||'';
document.getElementById('apiKey').value=p.key||'';
document.getElementById('apiModel').value=p.model||'';
document.getElementById('apiTemp').value=p.temp??0.8;
document.getElementById('apiMaxTokens').value=p.maxTokens||4096;
if(p.toolUrl!==undefined)document.getElementById('toolApiUrl').value=p.toolUrl||'';
if(p.toolKey!==undefined)document.getElementById('toolApiKey').value=p.toolKey||'';
if(p.toolModel!==undefined)document.getElementById('toolApiModel').value=p.toolModel||'';
if(p.freqPenalty!==undefined){var _fp=document.getElementById('apiFreqPenalty');if(_fp){_fp.value=p.freqPenalty;_fp.dispatchEvent(new Event('input'));var _fpv=document.getElementById('freqPenVal');if(_fpv)_fpv.textContent=parseFloat(p.freqPenalty).toFixed(2);}}
if(p.presPenalty!==undefined){var _pp=document.getElementById('apiPresPenalty');if(_pp){_pp.value=p.presPenalty;_pp.dispatchEvent(new Event('input'));var _ppv=document.getElementById('presPenVal');if(_ppv)_ppv.textContent=parseFloat(p.presPenalty).toFixed(2);}}
if(p.hideAntiRepeat!==undefined){toggleAntiRepeat(p.hideAntiRepeat);}
saveCurSettings();showToast('已切换: '+p.name);
}
var _antiRepeatHidden=false;
function toggleAntiRepeat(forceState){
  var body=document.getElementById('antiRepeatBody');
  var icon=document.getElementById('antiRepeatToggleIcon');
  var btn=document.getElementById('antiRepeatToggleBtn');
  if(!body)return;
  if(forceState!==undefined){_antiRepeatHidden=forceState;}
  else{_antiRepeatHidden=!_antiRepeatHidden;}
  if(_antiRepeatHidden){
    body.style.display='none';
    if(icon){icon.className='fas fa-eye';}
    if(btn){btn.innerHTML='<i class="fas fa-eye"></i> 已隐藏';}
  }else{
    body.style.display='';
    if(icon){icon.className='fas fa-eye-slash';}
    if(btn){btn.innerHTML='<i class="fas fa-eye-slash"></i> 已展开';}
  }
}
function delApiP(i){apiP.splice(i,1);sv(K.apiP,apiP);renderApiPresets();}

// Char Presets
function saveCharPreset(){
saveCharactersFromUI();
showInp('保存人物预设','为这组人物起个名字',name=>{
charP.push({name,characters:JSON.parse(JSON.stringify(characters)),relations:JSON.parse(JSON.stringify(charRelations)),npcs:JSON.parse(JSON.stringify(npcList))});
sv(K.charP,charP);saveCurSettings();renderCharPresets();if(_presetType){renderPresetModalList();}showToast('人物预设已保存');
});
}
function renderCharPresets(){
const l=document.getElementById('charPL');l.innerHTML='';
charP.forEach((p,i)=>{
const it=document.createElement('div');it.className='pitem';
const charNames=(p.characters||[]).map(c=>c.name).filter(Boolean).join('、')||'未命名';
it.innerHTML='<span class="pitem-n">'+esc(p.name)+' <span style="font-size:9px;color:var(--text2)">('+esc(charNames)+')</span></span><div class="pitem-a"><button class="btn-use" onclick="useCharP('+i+')">使用</button><button class="btn-del" onclick="delCharP('+i+')">删除</button></div>';
l.appendChild(it);
});
}
function useCharP(i){
const p=charP[i];
characters=JSON.parse(JSON.stringify(p.characters||[{name:'',desc:''}]));
sv(K.curChars,characters);
charRelations=JSON.parse(JSON.stringify(p.relations||[]));
sv('bj_charRelations',charRelations);
npcList=JSON.parse(JSON.stringify(p.npcs||[]));
sv('bj_npcList',npcList);
renderCharCards();
renderRelList();
renderNpcCards();
// 加载绑定的局部设定
loadLocalSettingsForPreset(p.name);
showToast('已加载人物: '+p.name);
}
function delCharP(i){charP.splice(i,1);sv(K.charP,charP);renderCharPresets();updateBindingNames();}

// World Presets
function clearAllWorld(){
showDlg('清空世界观','将清空全局世界观和局部世界观（预设不受影响）\n\n确定继续吗？',function(){
document.getElementById('globalWorldDesc').value='';
document.getElementById('worldDesc').value='';
globalWorld='';
sv('bj_globalWorld','');
if(currentWorldBinding){
localWorldBindings[currentWorldBinding]='';
sv('bj_localWorldBindings',localWorldBindings);
}
saveCurSettings();
refreshAllCounters();
showToast('已清空世界观内容');
},true);
}
function saveWorldPreset(){
showInp('保存世界观预设','为世界观起个名字',name=>{
worldP.push({name,desc:document.getElementById('worldDesc').value,minWords:parseInt(document.getElementById('minWords').value)||800});
sv(K.worldP,worldP);saveCurSettings();renderWorldPresets();if(_presetType){renderPresetModalList();}showToast('世界观预设已保存');
});
}
function renderWorldPresets(){
const l=document.getElementById('worldPL');l.innerHTML='';
worldP.forEach((p,i)=>{
const it=document.createElement('div');it.className='pitem';
it.innerHTML='<span class="pitem-n">'+esc(p.name)+'</span><div class="pitem-a"><button class="btn-use" onclick="useWorldP('+i+')">使用</button><button class="btn-del" onclick="delWorldP('+i+')">删除</button></div>';
l.appendChild(it);
});
}
function useWorldP(i){
const p=worldP[i];
document.getElementById('worldDesc').value=p.desc||'';
document.getElementById('minWords').value=p.minWords||800;
currentWorldPresetName=p.name||'';sv('bj_currentWorldPresetName',currentWorldPresetName);
saveCurSettings();
if(!_silentPresetApply)showToast('已加载世界观: '+p.name);
refreshAllCounters();
}
function delWorldP(i){worldP.splice(i,1);sv(K.worldP,worldP);renderWorldPresets();}

function clearAllStyle(){
showDlg('清空文风','将清空当前文风设置（预设不受影响）\n\n确定继续吗？',function(){
document.getElementById('styleDesc').value='';
ap.curStyle='';
sv(K.ap,ap);
if(currentStyleBinding){
localStyleBindings[currentStyleBinding]='';
sv('bj_localStyleBindings',localStyleBindings);
}
refreshAllCounters();
showToast('已清空文风内容');
},true);
}
// 文风预设
function saveStylePreset(){
const desc=(document.getElementById('styleDesc').value||'').trim();
if(!desc){showToast('请先填写文风描述');return;}
showInp('保存文风预设','为这个文风起个名字',name=>{
styleP.push({name,desc});
sv('bj_styleP',styleP);renderStylePresets();if(_presetType){renderPresetModalList();}showToast('文风预设已保存');
});
}
function renderStylePresets(){
const l=document.getElementById('stylePL');if(!l)return;l.innerHTML='';
styleP.forEach((p,i)=>{
const it=document.createElement('div');it.className='pitem';
it.innerHTML='<span class="pitem-n">'+esc(p.name)+' <span style="font-size:9px;color:var(--text2)">('+esc((p.desc||'').substring(0,20))+'...)</span></span><div class="pitem-a"><button class="btn-use" onclick="useStyleP('+i+')">使用</button><button class="btn-del" onclick="delStyleP('+i+')">删除</button></div>';
l.appendChild(it);
});
}
function useStyleP(i){
const p=styleP[i];
document.getElementById('styleDesc').value=p.desc||'';
ap.curStyle=p.desc;sv(K.ap,ap);
currentStylePresetName=p.name||'';sv('bj_currentStylePresetName',currentStylePresetName);
refreshAllCounters();
if(!_silentPresetApply)showToast('已加载文风: '+p.name);
}
function delStyleP(i){styleP.splice(i,1);sv('bj_styleP',styleP);renderStylePresets();}

function clearAllRule(){
showDlg('清空规则','将清空全局规则和局部规则（预设不受影响）\n\n确定继续吗？',function(){
document.getElementById('globalRuleDesc').value='';
document.getElementById('ruleDesc').value='';
globalRule='';
sv('bj_globalRule','');
curRule='';
sv('bj_curRule','');
if(currentRuleBinding){
localRuleBindings[currentRuleBinding]='';
sv('bj_localRuleBindings',localRuleBindings);
}
refreshAllCounters();
showToast('已清空规则内容');
},true);
}
// 规则预设
function saveRulePreset(){
const desc=(document.getElementById('ruleDesc').value||'').trim();
if(!desc){showToast('请先填写规则内容');return;}
showInp('保存规则预设','为这组规则起个名字',name=>{
ruleP.push({name,desc});
sv('bj_ruleP',ruleP);renderRulePresets();if(_presetType){renderPresetModalList();}showToast('规则预设已保存');
});
}
function renderRulePresets(){
const l=document.getElementById('rulePL');if(!l)return;l.innerHTML='';
ruleP.forEach((p,i)=>{
const it=document.createElement('div');it.className='pitem';
it.innerHTML='<span class="pitem-n">'+esc(p.name)+' <span style="font-size:9px;color:var(--text2)">('+esc((p.desc||'').substring(0,20))+'...)</span></span><div class="pitem-a"><button class="btn-use" onclick="useRuleP('+i+')">使用</button><button class="btn-del" onclick="delRuleP('+i+')">删除</button></div>';
l.appendChild(it);
});
}
function useRuleP(i){
const p=ruleP[i];
document.getElementById('ruleDesc').value=p.desc||'';
curRule=p.desc||'';sv('bj_curRule',curRule);
currentRulePresetName=p.name||'';sv('bj_currentRulePresetName',currentRulePresetName);
refreshAllCounters();
if(!_silentPresetApply)showToast('已加载规则: '+p.name);
}
function delRuleP(i){ruleP.splice(i,1);sv('bj_ruleP',ruleP);renderRulePresets();}

function clearAllBanWords(){
showDlg('清空禁用词','将清空全局禁用词和局部禁用词（预设不受影响）\n\n确定继续吗？',function(){
document.getElementById('globalBanWordsInput').value='';
document.getElementById('banWordsInput').value='';
globalBanWords='';
sv('bj_globalBanWords','');
banWords='';
sv('bj_banWords','');
if(currentBanBinding){
localBanWordsBindings[currentBanBinding]='';
sv('bj_localBanWordsBindings',localBanWordsBindings);
}
refreshAllCounters();
showToast('已清空禁用词内容');
},true);
}
// 禁用词预设
function saveBanWordsPreset(){
const desc=(document.getElementById('banWordsInput').value||'').trim();
if(!desc){showToast('请先填写禁用词');return;}
showInp('保存禁用词预设','为这组禁用词起个名字',name=>{
banWordsP.push({name,desc});
sv('bj_banWordsP',banWordsP);renderBanWordsPresets();if(_presetType){renderPresetModalList();}showToast('禁用词预设已保存');
});
}
function renderBanWordsPresets(){
const l=document.getElementById('banWordsPL');if(!l)return;l.innerHTML='';
banWordsP.forEach((p,i)=>{
const wordCount=(p.desc||'').split('\n').filter(w=>w.trim()).length;
const it=document.createElement('div');it.className='pitem';
it.innerHTML='<span class="pitem-n">'+esc(p.name)+' <span style="font-size:9px;color:var(--text2)">('+wordCount+'个词)</span></span><div class="pitem-a"><button class="btn-use" onclick="useBanWordsP('+i+')">使用</button><button class="btn-del" onclick="delBanWordsP('+i+')">删除</button></div>';
l.appendChild(it);
});
}
function useBanWordsP(i){
const p=banWordsP[i];
document.getElementById('banWordsInput').value=p.desc||'';
banWords=p.desc||'';sv('bj_banWords',banWords);
currentBanPresetName=p.name||'';sv('bj_currentBanPresetName',currentBanPresetName);
refreshAllCounters();
if(!_silentPresetApply)showToast('已加载禁用词: '+p.name);
}
function delBanWordsP(i){banWordsP.splice(i,1);sv('bj_banWordsP',banWordsP);renderBanWordsPresets();}
// ==================== 全局/局部设定管理 ====================

// 保存局部世界观
function saveLocalWorld(){
if(!currentWorldBinding)return;
const val=document.getElementById('worldDesc').value||'';
localWorldBindings[currentWorldBinding]=val;
sv('bj_localWorldBindings',localWorldBindings);
}
// 字体预设
function saveFontPreset(){
  const url=(document.getElementById('customFontUrl').value||'').trim();
  if(!url){
    showToast('请先填写字体链接');
    return;
  }
  showInp('保存字体预设','给这套字体起个名字',name=>{
    fontP.push({name,url});
    sv('bj_fontP',fontP);
    renderFontPresets();
    if(_presetType){renderPresetModalList();}
    showToast('字体预设已保存');
  });
}

function renderFontPresets(){
  const l=document.getElementById('fontPL');
  if(!l)return;
  l.innerHTML='';
  fontP.forEach((p,i)=>{
    const it=document.createElement('div');
    it.className='pitem';
    it.innerHTML=
      '<span class="pitem-n">'+esc(p.name)+' <span style="font-size:9px;color:var(--text2)">('+esc((p.url||'').substring(0,30))+'...)</span></span>'+
      '<div class="pitem-a">'+
        '<button class="btn-use" onclick="useFontP('+i+')">使用</button>'+
        '<button class="btn-del" onclick="delFontP('+i+')">删除</button>'+
      '</div>';
    l.appendChild(it);
  });
}
// ==================== 自定义系统提示词预设 ====================
// 新版预设保存的是完整条目数组（顺序 + 内置提示词改写 + 自定义指令），世界观/文风/人物设定等关联模块的内容本身不保存在这里。
// 兼容旧版预设：旧数据只有 {name,prompt} 单条字符串，使用时会迁移成一条自定义指令插入到当前条目顶部。
function saveSysPromptPreset(){
  ensureSysPromptEntries();
  showInp('保存预设','为这套条目排列起个名字', name => {
    sysPromptP.push({ name, entries: JSON.parse(JSON.stringify(sysPromptEntries)) });
    sv('bj_sysPromptP', sysPromptP);
    renderSysPromptPresets();
    if(_presetType){renderPresetModalList();}
    showToast('预设已保存');
  });
}

function renderSysPromptPresets(){
  const container = document.getElementById('sysPromptPL');
  if(!container) return;
  if(sysPromptP.length === 0){
    container.innerHTML = '<p style="font-size:11px;color:var(--text2);text-align:center;padding:10px">暂无预设</p>';
    return;
  }
  container.innerHTML = '';
  sysPromptP.forEach((p, i) => {
    const it = document.createElement('div');
    it.className = 'pitem';
    const descTxt = p.entries ? ('共'+p.entries.length+'个条目') : ((p.prompt||'').substring(0,20)+'...');
    it.innerHTML = `
      <span class="pitem-n">${esc(p.name)} <span style="font-size:9px;color:var(--text2)">(${descTxt})</span></span>
      <div class="pitem-a">
        <button class="btn-use" onclick="useSysPromptPreset(${i})">使用</button>
        <button class="btn-del" onclick="delSysPromptPreset(${i})">删除</button>
      </div>
    `;
    container.appendChild(it);
  });
}

function useSysPromptPreset(i){
  const p = sysPromptP[i];
  if(!p) return;
  if(p.entries && Array.isArray(p.entries)){
    sysPromptEntries = JSON.parse(JSON.stringify(p.entries));
  }else{
    ensureSysPromptEntries();
    sysPromptEntries.unshift({id:'custom_'+uid(),type:'custom',enabled:true,title:p.name||'自定义指令',content:p.prompt||''});
  }
  sv('bj_sysPromptEntries', sysPromptEntries);
  renderSysPromptEntryList();
  showToast('已加载预设：' + p.name);
}

function delSysPromptPreset(i){
  showDlg('删除预设','确定要删除「' + sysPromptP[i].name + '」吗？', () => {
    sysPromptP.splice(i, 1);
    sv('bj_sysPromptP', sysPromptP);
    renderSysPromptPresets();
    showToast('预设已删除');
  }, true);
}

function useFontP(i){
  const p=fontP[i];
  if(!p)return;
  document.getElementById('customFontUrl').value=p.url||'';
  ap.fontUrl=p.url||'';
  sv(K.ap,ap);
  loadFont(ap.fontUrl);
  showToast('已应用字体预设：'+p.name);
}

function delFontP(i){
  fontP.splice(i,1);
  sv('bj_fontP',fontP);
  renderFontPresets();
}
// 保存局部规则
function saveLocalRule(){
if(!currentRuleBinding)return;
const val=document.getElementById('ruleDesc').value||'';
localRuleBindings[currentRuleBinding]=val;
sv('bj_localRuleBindings',localRuleBindings);
curRule=val;
sv('bj_curRule',curRule);
}

// 保存局部禁用词
function saveLocalBanWords(){
if(!currentBanBinding)return;
const val=document.getElementById('banWordsInput').value||'';
localBanWordsBindings[currentBanBinding]=val;
sv('bj_localBanWordsBindings',localBanWordsBindings);
banWords=val;
sv('bj_banWords',banWords);
}

// 保存局部文风
function saveLocalStyle(){
if(!currentStyleBinding)return;
const val=document.getElementById('styleDesc').value||'';
localStyleBindings[currentStyleBinding]=val;
sv('bj_localStyleBindings',localStyleBindings);
ap.curStyle=val;
sv(K.ap,ap);
}

// 加载角色预设时同步加载绑定的局部设定
function loadLocalSettingsForPreset(presetName){
currentCharPresetName=presetName;
sv('bj_currentCharPresetName',currentCharPresetName);

// 加载局部世界观
const localWorld=localWorldBindings[presetName]||'';
document.getElementById('worldDesc').value=localWorld;

// 加载局部规则
const localRule=localRuleBindings[presetName]||'';
document.getElementById('ruleDesc').value=localRule;
curRule=localRule;
sv('bj_curRule',curRule);

// 加载局部禁用词
const localBan=localBanWordsBindings[presetName]||'';
document.getElementById('banWordsInput').value=localBan;
banWords=localBan;
sv('bj_banWords',banWords);

// 加载局部文风
const localStyle=localStyleBindings[presetName]||'';
document.getElementById('styleDesc').value=localStyle;
ap.curStyle=localStyle;
sv(K.ap,ap);

// 更新界面显示
updateBindingNames();
if(!_silentPresetApply)showToast('已加载「'+presetName+'」的绑定设定');
}

// 更新界面上显示的绑定名称
// 更新绑定显示按钮标签
function updateBindingNames(){
// 同步更新四个绑定显示按钮的标签文字
function _setLabel(id, value){
  var el = document.getElementById(id);
  if(el) el.textContent = value || '— 不绑定 —';
}
_setLabel('worldBindingLabel', currentWorldBinding);
_setLabel('styleBindingLabel', currentStyleBinding);
_setLabel('ruleBindingLabel', currentRuleBinding);
_setLabel('banBindingLabel', currentBanBinding);
}

function switchWorldBinding(presetName){
if(currentWorldBinding){
localWorldBindings[currentWorldBinding]=document.getElementById('worldDesc').value||'';
sv('bj_localWorldBindings',localWorldBindings);
}
currentWorldBinding=presetName;
sv('bj_currentWorldBinding',currentWorldBinding);
const content=presetName?localWorldBindings[presetName]||'':'';
document.getElementById('worldDesc').value=content;
const el=document.getElementById('worldDesc');
if(el) limitTextarea(el,3000,'lwCount');
if(presetName)showToast('已切换到「'+presetName+'」的世界观');
// 同步更新显示标签
updateBindingNames();
}

function switchRuleBinding(presetName){
if(currentRuleBinding){
localRuleBindings[currentRuleBinding]=document.getElementById('ruleDesc').value||'';
sv('bj_localRuleBindings',localRuleBindings);
}
currentRuleBinding=presetName;
sv('bj_currentRuleBinding',currentRuleBinding);
const content=presetName?localRuleBindings[presetName]||'':'';
document.getElementById('ruleDesc').value=content;
curRule=content;
sv('bj_curRule',curRule);
if(presetName)showToast('已切换到「'+presetName+'」的规则');
// 同步更新显示标签
updateBindingNames();
}

function switchBanBinding(presetName){
if(currentBanBinding){
localBanWordsBindings[currentBanBinding]=document.getElementById('banWordsInput').value||'';
sv('bj_localBanWordsBindings',localBanWordsBindings);
}
currentBanBinding=presetName;
sv('bj_currentBanBinding',currentBanBinding);
const content=presetName?localBanWordsBindings[presetName]||'':'';
document.getElementById('banWordsInput').value=content;
banWords=content;
sv('bj_banWords',banWords);
if(presetName)showToast('已切换到「'+presetName+'」的禁用词');
// 同步更新显示标签
updateBindingNames();
}

function switchStyleBinding(presetName){
if(currentStyleBinding){
localStyleBindings[currentStyleBinding]=document.getElementById('styleDesc').value||'';
sv('bj_localStyleBindings',localStyleBindings);
}
currentStyleBinding=presetName;
sv('bj_currentStyleBinding',currentStyleBinding);
const content=presetName?localStyleBindings[presetName]||'':'';
document.getElementById('styleDesc').value=content;
ap.curStyle=content;
sv(K.ap,ap);
if(presetName)showToast('已切换到「'+presetName+'」的文风');
// 同步更新显示标签
updateBindingNames();
}

// ==================== 绑定预设美化选择器 ====================
var _bindingPickerType = '';

function openBindingPicker(type) {
  _bindingPickerType = type;
  var titles = {
    world: '绑定局部世界观到角色预设',
    style: '绑定文风到角色预设',
    rule: '绑定局部规则到角色预设',
    ban: '绑定局部禁用词到角色预设'
  };
  var icons = {
    world: 'fa-globe',
    style: 'fa-feather-alt',
    rule: 'fa-scroll',
    ban: 'fa-ban'
  };
  var currentValues = {
    world: currentWorldBinding,
    style: currentStyleBinding,
    rule: currentRuleBinding,
    ban: currentBanBinding
  };
  var current = currentValues[type] || '';
  var titleEl = document.getElementById('bindingPickerTitle');
  var listEl = document.getElementById('bindingPickerList');
  if (!titleEl || !listEl) return;
  titleEl.innerHTML = '<i class="fas ' + (icons[type] || 'fa-link') + '"></i> ' + (titles[type] || '选择绑定预设');

  var html = '';
  // 不绑定选项
  var notBound = !current;
  html += '<button class="bp-item' + (notBound ? ' bp-selected' : '') + '" onclick="pickBinding(\'\')">' +
    '<span class="bp-item-icon"><i class="fas fa-ban"></i></span>' +
    '<span>— 不绑定 —</span>' +
    '<div class="bp-radio"></div>' +
  '</button>';

  if (charP.length === 0) {
    html += '<div style="padding:20px;text-align:center;color:var(--text2);font-size:12px"><i class="fas fa-user-slash" style="font-size:24px;opacity:.4;display:block;margin-bottom:8px"></i>暂无人物预设<br><span style="font-size:10px">请先在「人物设定」中保存人物预设</span></div>';
  } else {
    charP.forEach(function(p) {
      var sel = p.name === current;
      html += '<button class="bp-item' + (sel ? ' bp-selected' : '') + '" onclick="pickBinding(\'' + p.name.replace(/\\/g,'\\\\').replace(/'/g,"\\'") + '\')">' +
        '<span class="bp-item-icon"><i class="fas fa-user"></i></span>' +
        '<span>' + esc(p.name) + '</span>' +
        '<div class="bp-radio"></div>' +
      '</button>';
    });
  }
  listEl.innerHTML = html;
  document.getElementById('bindingPickerOv').classList.add('show');
}

function pickBinding(value) {
  // 必须在 closeBindingPicker() 之前保存 type，
  // 因为 closeBindingPicker 会把 _bindingPickerType 清空
  var type = _bindingPickerType;
  closeBindingPicker();
  if (type === 'world') switchWorldBinding(value);
  else if (type === 'style') switchStyleBinding(value);
  else if (type === 'rule') switchRuleBinding(value);
  else if (type === 'ban') switchBanBinding(value);
}

function closeBindingPicker() {
  var ov = document.getElementById('bindingPickerOv');
  if (ov) ov.classList.remove('show');
  _bindingPickerType = '';
}

// ==================== 预设与模板自定义分类系统 ====================
var _presetFilter = 'all';

function _getPresetCats(type) {
  try { return JSON.parse(localStorage.getItem('bj_presetCats_' + type) || '[]'); } catch(e) { return []; }
}
function _savePresetCats(type, arr) {
  try { localStorage.setItem('bj_presetCats_' + type, JSON.stringify(arr)); } catch(e) {}
}

function setPresetFilter(filter) {
  _presetFilter = filter;
  renderPresetModalList();
  var tabs = document.querySelectorAll('#presetCatsBar .pcat-tab');
  tabs.forEach(function(t) { t.classList.toggle('act', t.dataset.cat === filter); });
}

function setPresetCategory(idx, catName) {
  var cfg = PRESET_CONFIG[_presetType];
  if (!cfg) return;
  var list = cfg.getList();
  if (idx < 0 || idx >= list.length) return;
  list[idx].category = catName;
  cfg.setList(list);
  _renderPresetCatsBar();
  renderPresetModalList();
  showToast('分类已更新');
}

function _openCategoryPicker(idx) {
  var cfg = PRESET_CONFIG[_presetType];
  if (!cfg) return;
  var list = cfg.getList();
  if (idx < 0 || idx >= list.length) return;
  var current = list[idx].category || '';
  var userCats = _getPresetCats(_presetType);
  var titleEl = document.getElementById('bindingPickerTitle');
  var listEl = document.getElementById('bindingPickerList');
  if (!titleEl || !listEl) return;
  titleEl.innerHTML = '<i class="fas fa-folder"></i> 设置「' + esc(list[idx].name || '未命名') + '」的分类';
  _bindingPickerType = '__category__' + idx;
  var items = [{ value: '', label: '不指定分类', icon: '<i class="fas fa-clipboard-list"></i>' }];
  userCats.forEach(function(c) { items.push({ value: c, label: c, icon: '<i class="fas fa-tag"></i>' }); });
  var html = items.map(function(c) {
    var sel = c.value === current;
    var safeVal = c.value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    return '<button class="bp-item' + (sel ? ' bp-selected' : '') + '" onclick="pickCategory(\'' + safeVal + '\')">' +
      '<span class="bp-item-icon">' + c.icon + '</span>' +
      '<span>' + esc(c.label) + '</span>' +
      '<div class="bp-radio"></div></button>';
  }).join('');
  listEl.innerHTML = html;
  document.getElementById('bindingPickerOv').classList.add('show');
}

function pickCategory(value) {
  var raw = _bindingPickerType;
  closeBindingPicker();
  if (raw.startsWith('__category__')) {
    var idx = parseInt(raw.replace('__category__', ''), 10);
    if (!isNaN(idx)) setPresetCategory(idx, value);
  } else if (raw.startsWith('__tplcat__')) {
    var idx2 = parseInt(raw.replace('__tplcat__', ''), 10);
    if (!isNaN(idx2)) _setTplCategory(idx2, value);
  }
}

function _renamePreset(idx) {
  var cfg = PRESET_CONFIG[_presetType];
  if (!cfg) return;
  var list = cfg.getList();
  if (idx < 0 || idx >= list.length) return;
  showInp('预设改名', '输入新名称', function(name) {
    name = (name || '').trim();
    if (!name) return;
    list[idx].name = name;
    cfg.setList(list);
    renderPresetModalList();
    showToast('已改名为「' + name + '」');
  }, list[idx].name || '');
}

function _renamePresetCat(catName) {
  showInp('分类改名', '输入新的分类名称', function(newName) {
    newName = (newName || '').trim();
    if (!newName || newName === catName) return;
    var cats = _getPresetCats(_presetType);
    if (cats.indexOf(newName) !== -1) { showToast('该名称已存在'); return; }
    var i = cats.indexOf(catName);
    if (i === -1) return;
    cats[i] = newName;
    _savePresetCats(_presetType, cats);
    var cfg = PRESET_CONFIG[_presetType];
    if (cfg) {
      var list = cfg.getList();
      list.forEach(function(p) { if (p.category === catName) p.category = newName; });
      cfg.setList(list);
    }
    if (_presetFilter === catName) _presetFilter = newName;
    _renderPresetCatsBar();
    renderPresetModalList();
    showToast('分类已改名为「' + newName + '」');
  }, catName);
}

function _addPresetCat() {
  showInp('新建分类', '输入分类名称（如：古风、现代、系列A）', function(name) {
    name = (name || '').trim();
    if (!name) return;
    var cats = _getPresetCats(_presetType);
    if (cats.indexOf(name) !== -1) { showToast('分类「' + name + '」已存在'); return; }
    cats.push(name);
    _savePresetCats(_presetType, cats);
    _presetFilter = name;
    _renderPresetCatsBar();
    renderPresetModalList();
    showToast('分类「' + name + '」已创建');
  });
}

function _delPresetCat(catName) {
  showDlg('删除分类', '确定删除分类「' + catName + '」？该分类下的预设将移到未分类，不会被删除。', function() {
    var cats = _getPresetCats(_presetType);
    var i = cats.indexOf(catName);
    if (i !== -1) { cats.splice(i, 1); _savePresetCats(_presetType, cats); }
    var cfg = PRESET_CONFIG[_presetType];
    if (cfg) {
      var list = cfg.getList();
      list.forEach(function(p) { if (p.category === catName) p.category = ''; });
      cfg.setList(list);
    }
    if (_presetFilter === catName) _presetFilter = 'all';
    _renderPresetCatsBar();
    renderPresetModalList();
    showToast('分类已删除');
  }, true);
}

function _renderPresetCatsBar() {
  var bar = document.getElementById('presetCatsBar');
  if (!bar) return;
  var cats = _getPresetCats(_presetType);
  var cfg = PRESET_CONFIG[_presetType];
  var list = cfg ? (cfg.getList() || []) : [];
  var noneCount = list.filter(function(p) { return !p.category; }).length;
  var html = '<button class="pcat-tab' + (_presetFilter === 'all' ? ' act' : '') + '" data-cat="all" onclick="setPresetFilter(\'all\')">全部<span style="font-size:9px;margin-left:3px;opacity:.6">' + list.length + '</span></button>';
  cats.forEach(function(c) {
    var cnt = list.filter(function(p) { return p.category === c; }).length;
    var safe = c.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    html += '<button class="pcat-tab' + (_presetFilter === c ? ' act' : '') + '" data-cat="' + esc(c) + '" onclick="setPresetFilter(\'' + safe + '\')" ondblclick="event.stopPropagation();_renamePresetCat(\'' + safe + '\')" oncontextmenu="event.preventDefault();_delPresetCat(\'' + safe + '\')">' + esc(c) + '<span style="font-size:9px;margin-left:3px;opacity:.6">' + cnt + '</span></button>';
  });
  if (cats.length > 0 && noneCount > 0) {
    html += '<button class="pcat-tab' + (_presetFilter === '__none__' ? ' act' : '') + '" data-cat="__none__" onclick="setPresetFilter(\'__none__\')">未分类<span style="font-size:9px;margin-left:3px;opacity:.6">' + noneCount + '</span></button>';
  }
  html += '<button class="pcat-tab-add" onclick="_addPresetCat()" title="新建分类">＋</button>';
  bar.innerHTML = html;
  bar.style.display = 'flex';
}

// ── 模板分类 & 搜索 & 置顶 ──
var _tplSearchQuery = '';
var _tplCatFilter = 'all';

function _getTplCats() {
  try { return JSON.parse(localStorage.getItem('bj_tplCats') || '[]'); } catch(e) { return []; }
}
function _saveTplCats(arr) {
  try { localStorage.setItem('bj_tplCats', JSON.stringify(arr)); } catch(e) {}
}
function _onTplSearch(val) {
  _tplSearchQuery = (val || '').trim().toLowerCase();
  _renderGenTemplateBody();
}
function _setTplCatFilter(cat) {
  _tplCatFilter = cat;
  _renderGenTemplateBody();
  var tabs = document.querySelectorAll('#tplCatsBar .pcat-tab');
  tabs.forEach(function(t) { t.classList.toggle('act', t.dataset.cat === cat); });
}
function _renderTplCatsBar() {
  var bar = document.getElementById('tplCatsBar');
  if (!bar) return;
  var cats = _getTplCats();
  var noneCount = (genTemplates || []).filter(function(t) { return !t.category; }).length;
  var total = (genTemplates || []).length;
  var html = '<button class="pcat-tab' + (_tplCatFilter === 'all' ? ' act' : '') + '" data-cat="all" onclick="_setTplCatFilter(\'all\')">全部<span style="font-size:9px;margin-left:3px;opacity:.6">' + total + '</span></button>';
  cats.forEach(function(c) {
    var cnt = (genTemplates || []).filter(function(t) { return t.category === c; }).length;
    var safe = c.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    html += '<button class="pcat-tab' + (_tplCatFilter === c ? ' act' : '') + '" data-cat="' + esc(c) + '" onclick="_setTplCatFilter(\'' + safe + '\')" ondblclick="event.stopPropagation();_renameTplCat(\'' + safe + '\')" oncontextmenu="event.preventDefault();_delTplCat(\'' + safe + '\')">' + esc(c) + '<span style="font-size:9px;margin-left:3px;opacity:.6">' + cnt + '</span></button>';
  });
  if (cats.length > 0 && noneCount > 0) {
    html += '<button class="pcat-tab' + (_tplCatFilter === '__none__' ? ' act' : '') + '" data-cat="__none__" onclick="_setTplCatFilter(\'__none__\')">未分类<span style="font-size:9px;margin-left:3px;opacity:.6">' + noneCount + '</span></button>';
  }
  html += '<button class="pcat-tab-add" onclick="_addTplCat()" title="新建分类">＋</button>';
  bar.innerHTML = html;
}
function _addTplCat() {
  showInp('新建模板分类', '输入分类名称（如：古风、都市、系列A）', function(name) {
    name = (name || '').trim();
    if (!name) return;
    var cats = _getTplCats();
    if (cats.indexOf(name) !== -1) { showToast('分类「' + name + '」已存在'); return; }
    cats.push(name);
    _saveTplCats(cats);
    _tplCatFilter = name;
    _renderGenTemplateBody();
    showToast('分类「' + name + '」已创建');
  });
}
function _delTplCat(catName) {
  showDlg('删除分类', '确定删除分类「' + catName + '」？该分类下的模板将移到未分类，不会被删除。', function() {
    var cats = _getTplCats();
    var i = cats.indexOf(catName);
    if (i !== -1) { cats.splice(i, 1); _saveTplCats(cats); }
    (genTemplates || []).forEach(function(t) { if (t.category === catName) t.category = ''; });
    sv('bj_genTemplates', genTemplates);
    if (_tplCatFilter === catName) _tplCatFilter = 'all';
    _renderGenTemplateBody();
    showToast('分类已删除');
  }, true);
}
function _setTplCategory(idx, catName) {
  if (idx < 0 || idx >= genTemplates.length) return;
  genTemplates[idx].category = catName;
  sv('bj_genTemplates', genTemplates);
  _renderGenTemplateBody();
  showToast('分类已更新');
}
function _openTplCategoryPicker(idx) {
  if (idx < 0 || idx >= genTemplates.length) return;
  var current = genTemplates[idx].category || '';
  var cats = _getTplCats();
  var titleEl = document.getElementById('bindingPickerTitle');
  var listEl = document.getElementById('bindingPickerList');
  if (!titleEl || !listEl) return;
  titleEl.innerHTML = '<i class="fas fa-folder"></i> 设置模板分类';
  _bindingPickerType = '__tplcat__' + idx;
  var items = [{ value: '', label: '不指定分类', icon: '<i class="fas fa-clipboard-list"></i>' }];
  cats.forEach(function(c) { items.push({ value: c, label: c, icon: '<i class="fas fa-tag"></i>' }); });
  var html = items.map(function(c) {
    var sel = c.value === current;
    var safeVal = c.value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    return '<button class="bp-item' + (sel ? ' bp-selected' : '') + '" onclick="pickCategory(\'' + safeVal + '\')">' +
      '<span class="bp-item-icon">' + c.icon + '</span>' +
      '<span>' + esc(c.label) + '</span>' +
      '<div class="bp-radio"></div></button>';
  }).join('');
  listEl.innerHTML = html;
  document.getElementById('bindingPickerOv').classList.add('show');
}
function _toggleTplPin(idx) {
  if (idx < 0 || idx >= genTemplates.length) return;
  genTemplates[idx].pinned = !genTemplates[idx].pinned;
  sv('bj_genTemplates', genTemplates);
  _renderGenTemplateBody();
}
function _renameTplCat(catName) {
  showInp('分类改名', '输入新的分类名称', function(newName) {
    newName = (newName || '').trim();
    if (!newName || newName === catName) return;
    var cats = _getTplCats();
    if (cats.indexOf(newName) !== -1) { showToast('该名称已存在'); return; }
    var i = cats.indexOf(catName);
    if (i === -1) return;
    cats[i] = newName;
    _saveTplCats(cats);
    (genTemplates || []).forEach(function(t) { if (t.category === catName) t.category = newName; });
    sv('bj_genTemplates', genTemplates);
    if (_tplCatFilter === catName) _tplCatFilter = newName;
    _renderGenTemplateBody();
    showToast('分类已改名为「' + newName + '」');
  }, catName);
}

function _renameTpl(idx) {
  if (idx < 0 || idx >= genTemplates.length) return;
  showInp('模板改名', '输入新名称', function(name) {
    name = (name || '').trim();
    if (!name) return;
    genTemplates[idx].name = name;
    sv('bj_genTemplates', genTemplates);
    _renderGenTemplateBody();
    showToast('已改名为「' + name + '」');
  }, genTemplates[idx].name || '');
}

function _renderGenTemplateBody() {
  var body = document.getElementById('genTemplateBody');
  if (!body) return;
  _renderTplCatsBar();
  var items = (genTemplates || []).map(function(t, i) { return { t: t, origIdx: i }; });
  if (_tplCatFilter !== 'all') {
    items = items.filter(function(item) {
      return _tplCatFilter === '__none__' ? !(item.t.category || '') : item.t.category === _tplCatFilter;
    });
  }
  if (_tplSearchQuery) {
    items = items.filter(function(item) {
      return (item.t.name || '').toLowerCase().indexOf(_tplSearchQuery) !== -1;
    });
  }
  items.sort(function(a, b) { return (b.t.pinned ? 1 : 0) - (a.t.pinned ? 1 : 0); });
  if (items.length === 0) {
    if (_tplSearchQuery) {
      body.innerHTML = '<div style="text-align:center;padding:30px;color:var(--text2);font-size:12px">没有匹配「' + esc(_tplSearchQuery) + '」的模板</div>';
    } else if (_tplCatFilter !== 'all') {
      body.innerHTML = '<div style="text-align:center;padding:30px;color:var(--text2);font-size:12px">该分类下暂无模板<br><span style="font-size:10px;opacity:.7">长按分类标签可删除分类</span></div>';
    } else {
      body.innerHTML = '<div style="text-align:center;padding:30px;color:var(--text2);font-size:12px"><div style="font-size:36px;margin-bottom:12px;opacity:.4"><i class="fas fa-box-open"></i></div>还没有保存的模板</div>';
    }
    return;
  }
  var html = '';
  items.forEach(function(item) {
    var t = item.t;
    var i = item.origIdx;
    var timeStr = t.savedAt ? new Date(t.savedAt).toLocaleDateString() : '';
    var catBadge = t.category ? '<span class="preset-cat-badge">' + esc(t.category) + '</span>' : '';
    var pinnedBadge = t.pinned ? '<span class="tpl-pinned-badge"><i class="fas fa-thumbtack"></i></span>' : '';
    // 完整性检测（展示模式，不自动修正）
    var _intCheck = _checkTemplateIntegrity(t,'check');
    var intIssues = _intCheck.issues;
    html += '<div class="tpl-card">';
    html += '<div style="display:flex;align-items:center;margin-bottom:4px">';
    html += '<div class="tpl-card-name" ondblclick="_renameTpl(' + i + ')" title="双击改名">' + esc(t.name || '未命名') + pinnedBadge + catBadge + '</div>';
    html += '<button class="p-cat-btn" onclick="_openTplCategoryPicker(' + i + ')" title="设置分类"><i class="fas fa-folder"></i></button>';
    html += '</div>';
    if (t.desc) html += '<div class="tpl-card-desc">' + esc(t.desc) + '</div>';
    if(intIssues.length>0){
      var warnParts=intIssues.map(function(iss){
        if(iss.status==='renamed') return '<span style="color:var(--accent2)"><i class="fas fa-rotate"></i> '+esc(iss.label)+'已改名→「'+esc(iss.newName)+'」</span>';
        if(iss.status==='changed') return '<span style="color:#e67e22"><i class="fas fa-triangle-exclamation"></i> '+esc(iss.label)+'内容已更新</span>';
        return '<span style="color:var(--danger)"><i class="fas fa-circle-xmark"></i> '+esc(iss.label)+'「'+esc(iss.name)+'」已删除</span>';
      });
      html+='<div style="font-size:10px;margin:4px 0 0;display:flex;flex-wrap:wrap;gap:6px;line-height:1.6">'+warnParts.join('')+'</div>';
    }
    html += '<div class="tpl-card-ft">';
    html += '<span class="tpl-card-time">' + (timeStr ? timeStr : '') + '</span>';
    html += '<button class="tpl-act-btn tpl-act-pin' + (t.pinned ? ' pinned' : '') + '" onclick="_toggleTplPin(' + i + ')">' + (t.pinned ? '取消置顶' : '置顶') + '</button>';
    html += '<button class="tpl-act-btn tpl-act-use" onclick="useGenTemplate(' + i + ');closeGenTemplateModal()">使用</button>';
    html += '<button class="tpl-act-btn tpl-act-del" onclick="deleteGenTemplateFromModal(' + i + ')">删除</button>';
    html += '</div></div>';
  });
  body.innerHTML = html;
}

// ==================== 通用模板选择弹窗 ====================
let _tplChooserCallback = null;
function showTemplateChooser(title, templates, onSelect){
  _tplChooserCallback = onSelect;
  var ov = document.getElementById('dlgOv');
  document.getElementById('dlgTitle').textContent = title;
  var html = '<div style="display:flex;flex-direction:column;gap:6px;max-height:55vh;overflow-y:auto;-webkit-overflow-scrolling:touch">';
  templates.forEach(function(t, idx){
    var name = typeof t === 'string' ? t : t.name;
    var desc = typeof t === 'object' && t.desc ? t.desc : '';
    html += '<div onclick="closeDlg();if(_tplChooserCallback)_tplChooserCallback(\''+name.replace(/'/g,"\\'")+'\')" style="padding:12px 14px;background:var(--bg);border:1px solid var(--border);border-radius:10px;cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:10px">';
    html += '<span style="font-size:18px;flex-shrink:0">' + _getTplEmoji(name) + '</span>';
    html += '<div style="flex:1"><div style="font-size:13px;font-weight:600;color:var(--text)">' + esc(name) + '</div>';
    if(desc) html += '<div style="font-size:10px;color:var(--text2);margin-top:2px;line-height:1.5">' + esc(desc) + '</div>';
    html += '</div></div>';
  });
  html += '</div>';
  document.getElementById('dlgMsg').innerHTML = html;
  document.getElementById('dlgOkBtn').style.display = 'none';
  ov.classList.add('show');
  navPush('dlgOv');
}

function _getTplEmoji(name){
  var map = {
    '现代都市':'<i class="fas fa-city"></i>','古代宫廷':'<i class="fas fa-landmark"></i>','仙侠修真':'<i class="fas fa-yin-yang"></i>','西方奇幻':'<i class="fas fa-dragon"></i>',
    '末日废土':'<i class="fas fa-radiation" style="color:#f0a030"></i>','校园青春':'<i class="fas fa-graduation-cap"></i>','民国乱世':'<i class="fas fa-clock-rotate-left"></i>','星际科幻':'<i class="fas fa-rocket"></i>',
    '克苏鲁诡异':'<i class="fas fa-ghost"></i>','赛博朋克':'<i class="fas fa-microchip" style="color:#00d4ff"></i>','东方玄幻':'<i class="fas fa-torii-gate"></i>','都市异能':'<i class="fas fa-bolt" style="color:#f0a030"></i>',
    '轻松日常':'<i class="fas fa-sun" style="color:#f0a030"></i>','沉郁文学':'<i class="fas fa-cloud-rain"></i>','甜宠言情':'<i class="fas fa-heart" style="color:#ff6b6b"></i>','悬疑紧张':'<i class="fas fa-magnifying-glass"></i>',
    '古风典雅':'<i class="fas fa-fan"></i>','幽默讽刺':'<i class="fas fa-face-laugh-squint"></i>','硬核写实':'<i class="fas fa-hammer"></i>','诗意散文':'<i class="fas fa-feather"></i>',
    '第一人称内心流':'<i class="fas fa-brain"></i>','短句冲击流':'<i class="fas fa-burst"></i>','民国白话':'<i class="fas fa-scroll"></i>','网文爽文':'<i class="fas fa-fire" style="color:#ff6b6b"></i>',
    '纯爱向':'<i class="fas fa-heart-circle-check" style="color:#ff6b6b"></i>','无虐向':'<i class="fas fa-rainbow"></i>','慢热型':'<i class="fas fa-hourglass-half"></i>','快节奏':'<i class="fas fa-gauge-high"></i>',
    '古风限定':'<i class="fas fa-torii-gate"></i>','现代限定':'<i class="fas fa-building"></i>','BE向':'<i class="fas fa-heart-crack" style="color:var(--danger)"></i>','高虐向':'<i class="fas fa-skull" style="color:var(--danger)"></i>',
    '禁止升级打怪':'<i class="fas fa-ban"></i>','双男主':'<i class="fas fa-user-group"></i>','女强型':'<i class="fas fa-venus"></i>','互虐型':'<i class="fas fa-heart-crack" style="color:var(--danger)"></i>',
    '网文通病':'<i class="fas fa-virus" style="color:var(--danger)"></i>','空洞形容':'<i class="fas fa-wind"></i>','说书腔调':'<i class="fas fa-bullhorn"></i>','AI腔':'<i class="fas fa-robot"></i>',
    '过度感叹':'<i class="fas fa-exclamation" style="color:var(--danger)"></i>','爽文通病':'<i class="fas fa-explosion" style="color:var(--danger)"></i>'
  };
  return map[name] || '<i class="fas fa-clipboard-list"></i>';
}
// 全局世界观模板
function applyGlobalWorldTemplate(name){
  const templates={
'现代都市':'故事发生在当代中国的一线城市（北京/上海/深圳）。城市有两张面孔：玻璃幕墙后是金融精英和互联网新贵，CBD以外是出租屋、外卖骑手和流水线工人。高房价与内卷是每个人身上的隐形锁链。\n【地理】高档小区与城中村毗邻，地铁是阶层交汇的罕见场所。\n【社会】新富、中产、底层各有其焦虑。阶层流动的通道正在收窄，但每个人都不肯承认梦想已死。\n【信息环境】社交媒体塑造滤镜人生，私信可见范围成为权力游戏，舆论反转是家常便饭。\n【情感底色】原子化的孤独，以及在孤独里执拗寻找连接。',
'古代宫廷':'架空王朝，融合汉唐宋明历史元素，不严格对应某朝代。皇权至上，但受宗室、外戚、文官集团制衡。\n【权力结构】皇帝→内阁/宰相→六部→地方官；宦官是隐形权力脉络。后宫等级：皇后→四妃→九嫔→贵人→才人→宫女。\n【宫廷地理】前朝政务，后宫起居，内外廷界限森严，擅越是死罪。\n【文化氛围】诗词是社交货币，宴饮投壶是日常。节气礼仪严格执行，连举止仪态都是政治表态。\n【核心矛盾】生存与忠诚、权力与情感、礼教与人性的永恒拉锯。一道圣旨可以赐死，一次站队可以灭族，也可因缘际会鸡犬升天。',
'仙侠修真':'天地间灵气以脉络流淌，分布于名山大川。凡人寿命百年，修士可活千载，大能者寿元无算。\n【修为体系（低→高）】练气→筑基→结丹→元婴→化神→合体→大乘→渡劫→飞升。每大境分初期/中期/后期/圆满四层。\n【宗门格局】正道三宗五峰为首，魔道以血海门、幽冥宗为代表，散修夹缝求存。争夺核心：灵脉、功法传承、炼器材料。\n【灵根体系】金木水火土五行灵根，天灵根最稀缺，杂灵根修炼缓慢。\n【经济】灵石为货币（下品→中品→上品→顶品）。\n【重要场所】坊市（交易）、秘境（历练）、渡劫禁地（最终考验）。\n【世界规则】天道有常，因果循环；大能者可逆天改命，但代价惨烈。',
'西方奇幻':'大陆名为"艾尔德拉"，七大王国被古神留下的符文结界分隔。数百年前的魔王战争遗迹遍布各地。\n【种族】人类（数量最多但寿命最短）、精灵（长寿，居古老森林）、矮人（地下，擅锻造）、兽人（北境荒原）、暗精灵（因古代叛乱被驱至地下）。\n【魔法体系】元素魔法（火/水/土/风）、精神魔法（幻术/治愈/传送）、黑暗魔法（亡灵/诅咒/血祭）。施法消耗法力，大型法术需材料媒介，法师须进学院修习。\n【势力】圣光教会（道德权威）、各王国（政治独立）、冒险者公会（中立第三方）。\n【核心冲突】旧神残余复苏、种族歧视与融合、魔法与信仰的边界。',
'末日废土':'2047年，核冬结束第十五年。大多数城市已成废墟，人口分散在据点、地堡和废城边缘聚居点。\n【地貌层级】辐射禁区→危险过渡区→稀缺绿洲净土。大地上是焦黑城市骨架、生锈高速和变异植被。\n【社会形态】无统一政府。"秩序据点"（资源换安全的独裁体）与"自由区"（民主但无力抵御威胁）并存。奴隶制在部分地区复活。\n【资源等级】洁净水＞食物＞药物＞武器弹药＞燃料＞辐射防护装备。以物易物为主。\n【威胁层级】辐射变异兽、感染者（有残存意识）、其他幸存者（最大威胁）。\n【文化残片】前时代杂志、磁带、碟片是珍贵精神遗产，一台能放音乐的收音机可换半年食物。',
'校园青春':'故事发生在中国当代高中或大学校园（也可设定为十年内的过去）。\n【高中版】升学压力笼罩一切，成绩排名是公开的阶层划分。班级是小社会，座位与小组合作都有潜在政治逻辑。早恋被官方压制，但在暗处无处不在。重要节点：分班、期末、高考、毕业旅行。\n【大学版】第一次真正的自由，随之而来的是迷茫和自我寻找。宿舍关系是最重要的人际关系。社团、校园节、实习、考研是主要情节线索。\n【共同场景】食堂窗口（命运邂逅的圣地）、操场（情感宣泄空间）、图书馆（暗恋温床）、宿舍走廊（秘密传递通道）。\n【青春本质】每一次心动都当作天大的事，多年后回望才明白那只是开始。',
'民国乱世':'1920-1940年代中国。清帝国覆灭未久，共和理想尚未实现。军阀割据，日军侵逼，国共明面握手、暗地角力。\n【地理层级】上海（冒险家乐园，繁华与黑暗并存）→北平（文化旧都，新旧思想交战）→重庆（陪都大后方）→战区（血与火的前线）。\n【社会阶层】买办阶级（西化生意人）、军阀幕僚、知识分子（新文化运动余脉）、旧式乡绅、城市无产者（工人/黄包车夫/歌女）。\n【文化氛围】左翼文学兴起，鲁迅式批判弥漫知识界。百乐门舞厅的纸醉金迷与街头流民的衣衫褴褛，相距不过一条马路。\n【时代道具】旗袍与长衫、留声机与《夜来香》、电报、老式相机、租界通行证。\n【核心矛盾】个人情感与家国大义的抉择，理想主义与现实幻灭的落差。',
'星际科幻':'公元2387年，人类建立"星际共同体"，管辖37个殖民星系。地球已成朝圣圣地，实际权力中心转移至第三环行星群"新日内瓦"轨道站。\n【文明格局】星际共同体（人类主体）、合成意识联盟（AI主权实体，2201年独立战争后获法律人格）、克里希族（已知最古老外星文明，超技术但不干涉）、边缘殖民地（脱管自由港）。\n【技术基础】曲速引擎实现星际旅行；量子纠缠通讯实现即时跨星通讯；基因编辑使人类平均寿命达180年；意识上传技术存在但有争议。\n【核心矛盾】地球原住民vs殖民地新人类的身份认同；人类中心主义vs多元生命权利；AI觉醒的伦理困境；"深空病"（长期旅行导致的精神综合症）。\n【日常】舱位等级决定生活质量，真实物件是奢侈品，虚拟沉浸是最主流娱乐。',
'克苏鲁诡异':'时间：1920-1930年代（或现代）。地点：美国新英格兰沿岸小镇（如阿卡姆Arkham、因斯茅斯Innsmouth），或架空的类似地区。\n【宇宙观】人类文明是宇宙历史中微不足道的尘埃。在人类出现之前，"旧日支配者"已统治地球亿万年，它们并未死去，只是沉睡。仅仅是"了解"它们的存在就会导致理智崩溃。\n【主要实体】克苏鲁（沉睡于拉莱耶城）、犹格·索托斯（全知的门与钥匙）、奈亚拉托提普（唯一主动接触人类的爬行混沌）、阿撒托斯（宇宙中心的终极虚无）。\n【调查者命运】接触真相→理智下降→幻觉妄想→死去、疯癫或沦为仆从。极少数保住自我，但再也无法正常生活。\n【叙事准则】越平静的描写越预示恐怖。古怪气味、不合逻辑的墙角、夜间无法解释的声响——细节是恐怖的前哨。',
'赛博朋克':'近未来（2075-2120年），城市无限膨胀，贫富差距达历史极值。四家"超级企业"（MegaCorps）GDP各超数十国总和，事实上取代了民族国家。\n【空间层级】天空塔（超级富豪，阳光洁净）→中层区（企业中产）→地面区（大多数人，商业密集但混乱）→地下区（法外之地，帮派/黑市/非法改造诊所）。\n【义体改造】人体改造是常态。视网膜芯片、神经加速器、外骨骼机械臂……改造程度越高"人性值"越受质疑，极端改造者称"空壳人"。改造需持续维护，欠债者会被收走义体。\n【黑客（网络牛仔）】直接进入数字空间攻击企业防火墙，被反杀会造成真实脑死亡。\n【核心命题】什么是人？数字意识是否有生命权？个人隐私在全面监控时代是否还有意义？',
'东方玄幻':'以中华神话为骨架的架空宇宙——"洪荒大世界"。盘古开天辟地后，三千大道散于天地，得道者可成圣。当下为"第三元会"末期，众圣归隐，大道争锋。\n【五族格局】天庭（仙族）↔冥界（幽族）↔妖族大陆↔魔界（魔族）↔人族九州。五族以"封神协议"维持表面和平，暗中争夺气运。\n【大道与境界】炼体→炼气→御气→结元→化虚→通灵→问道→证道→封圣。封圣者绕开天道，自开一方法则，可镇压一界。\n【气运体系】天命所归之人气运磅礴，逆天者被气运反噬。气运是本世界最神秘也最残忍的力量。\n【重要遗迹】混沌古地（盘古化形之所）、封神台（封印上古神明）、魔族禁地（第一次天魔大战遗址）。\n【文化元素】丹道（炼制灵丹）、阵法（布置天地大阵）、符道（以天地之理书写神符）。',
'都市异能':'当代中国，表面与普通都市无异，但在社会褶皱里存在"超常群体"——因基因突变、上古传承或不明能量辐射而拥有超越常人的能力。\n【能力体系】超常者按"星级"划分（一星至九星）。一至三星较为常见，七星以上凤毛麟角，九星称"超限者"，被各方视为核武级威胁。能力类型：体能强化、元素操控、精神感知、空间能力、预知等。\n【势力格局】国家超常局（官方管理，数据库记录全国超常者）→民间修炼宗门（以传统武学为包装）→境外势力（以资本或宗教渗透）→自由超常者（隐居或游走）。\n【社会规则】超常者不能在普通公众面前暴露，违者由超常局处置，有单独司法体系。\n【觉醒特征】通常在极端危险或强烈情绪的催化下发生，初期能力不稳定，随时会伤及自身。'
};
  const desc=templates[name]||'';
  const el=document.getElementById('globalWorldDesc');
  if(el) el.value=desc;

  if(el) limitTextarea(el,3000,'gwCount');

  globalWorld=desc;
  sv('bj_globalWorld',globalWorld);
  showToast('已应用全局世界观: '+name);
}

// 全局规则模板
function applyGlobalRuleTemplate(name){
  const templates={
'纯爱向':'- 主角之间是严格的1v1，任何第三者插足均以失败告终\n- 感情线纯粹，不搞三角恋，不允许出现"备胎"逻辑\n- 误会可以有，但必须在三章内靠沟通解开，不允许无限拖延\n- 结局必须HE（Happy Ending），所有障碍最终都是感情的催化剂\n- 对感情的表达要细腻真实，不要靠外部强行撮合，而是两人自然靠近',
'无虐向':'- 禁止出现主角重伤、濒死、失忆、失去至亲等虐心情节\n- 禁止出现背叛、长期欺骗、恶意伤害感情的行为\n- 误会和矛盾要温和，不要撕心裂肺，解决过程自然流畅\n- 即使有反派，其危害程度也要控制，不让读者过于揪心\n- 整体基调轻松愉快，情感波折在读者接受范围内',
'慢热型':'- 感情发展循序渐进，不允许一见钟情后立即推进关系\n- 前期要有充分的铺垫：互不理解→有所留意→心生好感→暧昧期→确认关系\n- 每一次靠近都要有具体的契机和理由，不能无故突然拉近距离\n- 暧昧期要足够长，模糊地带是这类故事的核心魅力\n- 告白或确定关系放在故事60%-75%处，留出充分的甜蜜回味空间',
'快节奏':'- 情节推进要快，每一章都必须有实质性进展（感情推进/悬念解开/冲突爆发）\n- 大幅减少日常琐碎描写，聚焦关键事件，场景切换利落\n- 对话简洁有力，每句话都要有信息量或情绪推动作用，删掉废话\n- 冲突来得快，解决得也快，不要让读者在同一个困境里等太久\n- 每章结尾留一个小钩子，保证读者有继续看下去的动力',
'古风限定':'- 严禁出现任何现代词汇（"OK""手机""塑料""打卡""内卷"等）\n- 对话符合古代语境，称呼用"公子/姑娘/大人/娘子/夫君"等\n- 计量单位用古制（两/钱/尺/丈/里/斗/匹）\n- 交通工具限于马车、轿子、船，信息传递靠书信、信鸽、跑腿\n- 文化元素：诗词、礼仪、节气、古典乐器（琴/箫/筝）、武术\n- 禁止出现与时代不符的思想观念（如完全现代化的女权意识表达方式）',
'现代限定':'- 故事必须发生在当代现实世界（2010年至今），不允许穿越或大幅架空\n- 所有情节设定要经得起现实逻辑检验，不能出现重大常识错误\n- 禁止出现魔法、修仙、异能等奇幻元素\n- 科技水平与现实一致，手机/网络/交通方式要符合当代\n- 如有职业背景，术语和流程要准确（医院手术/刑侦流程/法庭程序等）',
'BE向':'- 故事结局必须是悲剧（Bad Ending），主角以分离、失去或死亡收场\n- 悲剧必须有充分的铺垫和内在逻辑，不能突兀降临\n- 悲剧来自角色自身的局限、性格或命运，而非随意的外力破坏\n- 即使是悲剧也要有美感——读者哭完之后要感到值得，而不是愤怒\n- 允许存在令人心疼的"如果当时……"时刻，增加悲剧的厚度',
'高虐向':'- 允许出现主角重伤、失忆、被迫分离、失去至亲等高强度虐心情节\n- 感情线中可以有背叛和长期误解，但每一次伤害都要有它的情感逻辑\n- 虐心情节的目的是更深的情感共鸣，而非无意义的折磨——虐要虐得有意义\n- 每次低谷之后要给读者一点喘息的空间（小甜/短暂和解），再次坠落才更有冲击力\n- 整体要维持"痛并期待着"的阅读状态，不要让读者彻底绝望到弃文',
'禁止升级打怪':'- 故事重心在人际关系、情感博弈和内心成长，不在战斗和实力提升\n- 禁止出现等级碾压、一招秒杀、金手指开挂等爽文模式\n- 冲突来自人心的复杂性、立场的对立和选择的代价，而非实力差距\n- 主角靠智慧、情感和理解解决问题，而非靠变强\n- 如有战斗场面，重点描写心理博弈和策略，而非技能特效',
'双男主':'- 故事有两位同等重要的男性主角，两人戏份、情感弧度和成长线要大致均衡\n- 两人关系是全文情感核心，关系类型可以是竞争/互补/惺惺相惜/相爱相杀\n- 禁止其中任何一人长期沦为另一人的工具人、背景板或配角\n- 两人的分歧和和解是主要情节驱动力，每次冲突后关系要有实质性变化\n- 他们对彼此的理解和羁绊，要深过对任何其他角色的感情',
'女强型':'- 女主角是故事绝对核心，性格独立、有能力、有自己明确的目标和价值观\n- 禁止女主在男性角色面前无缘无故软化、失去判断力或让对方替她做决定\n- 感情线服务于女主的成长弧，而非相反——男主是助力，不是女主的全部\n- 女主的胜利和成就必须靠自己的能力取得，不靠男性拯救\n- 允许女主犯错，但她要自己承担后果并成长，而不是等人收场',
'互虐型':'- 主角双方都会主动和被动地给对方造成伤害，不存在单纯的受害者\n- 双方都有自己的执念、创伤和不得已，读者可以理解但不必认同\n- 不存在"坏人"，只有两个被各自局限所困住的人\n- 每一次伤害之后，两人之间的羁绊要更深而非更浅——分开之后更分不开\n- 感情基调：爱而不得，得而复失，失而复得……最终走向和解或毁灭，但过程中要充分呈现羁绊的厚度'
};
  const desc=templates[name]||'';
  const el=document.getElementById('globalRuleDesc');
  if(el) el.value=desc;
  if(el) limitTextarea(el,2000,'grCount');
  globalRule=desc;
  sv('bj_globalRule',globalRule);
  showToast('已应用全局规则: '+name);
}

// 全局禁用词模板
function applyGlobalBanTemplate(name){
const templates={
'网文通病':'不禁\n缓缓\n淡淡\n微微\n默默\n静静\n轻轻\n渐渐\n居然\n竟然\n忍不住\n情不自禁\n下意识\n突然\n猛地\n不知为何\n莫名\n不由得\n怔住\n愣住\n微微一愣\n心跳加速\n呼吸急促\n泪水涌上\n眼眶泛红\n嘴角微勾\n唇角上扬\n一抹笑意\n心中一动\n脑海中\n情绪涌上心头',
'空洞形容':'深邃的眼眸\n完美的侧脸\n精致的五官\n不可方物\n倾国倾城\n绝世容颜\n宛如天仙\n帅得一塌糊涂\n清冽出尘\n英俊不凡\n如谪仙降世\n天人之姿\n肤若凝脂\n明眸皓齿\n沉鱼落雁\n高挺的鼻梁\n完美的轮廓\n令人窒息的美\n美得不真实\n无懈可击的外表\n气质出众\n浑身散发着气场',
'说书腔调':'殊不知\n岂料\n却说\n话说\n且说\n原来\n谁知\n不料\n哪知道\n万万没想到\n正是\n有道是\n此话不假\n按下不表\n话分两头\n欲知后事\n书中暗表\n只见得\n但见\n却不知\n正当此时\n说时迟那时快\n转眼间',
'AI腔':'总的来说\n综上所述\n值得注意的是\n毋庸置疑\n不言而喻\n由此可见\n令人欣慰的是\n不禁让人\n不由自主\n仿佛在说\n不得不说\n与此同时\n除此之外\n正如所说\n令人印象深刻\n这一切都\n随着时间的推移\n在这个过程中\n不可否认\n显而易见\n整体而言\n从某种意义上说\n这无疑是\n可以看出',
'过度感叹':'！！\n震惊\n不可思议\n令人瞠目结舌\n难以置信\n简直难以置信\n太恐怖了\n太可怕了\n怎么可能\n这不可能\n天哪\n我的天\n简直绝了\n太厉害了\n惊为天人\n惊天大秘密\n颠覆认知',
'爽文通病':'废物\n垃圾\n狗东西\n给我跪下\n叫爸爸\n我让你见识一下\n区区\n蝼蚁\n蠢货\n本少爷\n本公子\n本座\n区区小人\n弹指可灭\n无名之辈\n一个小小的\n竟敢\n岂有此理\n小小的xxx\n还不快滚\n你算什么东西\n给我跪好了'
};
const desc=templates[name]||'';
document.getElementById('globalBanWordsInput').value=desc;
globalBanWords=desc;
sv('bj_globalBanWords',globalBanWords);
showToast('已应用全局禁用词: '+name);
limitLines(document.getElementById('globalBanWordsInput'),30,'gbwCount');
}
function applyStyleTemplate(name){
const templates={
'轻松日常':'语言轻松自然，口语化为主，像两个熟人聊天。多用短句，节奏明快活泼。善用生活化比喻（"心跳得像洗衣机脱水"），适当加入自嘲和小幽默。情绪基调温暖舒适，即使有矛盾也点到为止。场景细节要日常（便利店/公交/点外卖），通过生活小事传递情感温度。避免华丽词汇堆砌，真实感比文学性更重要。',
'沉郁文学':'语言凝练克制，每一个词都有分量，拒绝直白的情感词汇。多用意象和隐喻传递情绪（"她站在窗边，像一个句号"）。句式长而富有层次，带有思辨色彩。大量留白，让读者自己填补情感的缺口。叙述者像冷静的旁观者，观察但不判断。悲剧感来自克制而非宣泄，时间感要强，过去与现在可以自由穿插。',
'甜宠言情':'语言甜而不腻，重视细节制造心跳感。善用心理描写展现暧昧（脸红、心跳、大脑空白），对话要有化学反应——来回拉扯比直接告白更让读者心痒。节奏张弛有度，甜蜜中穿插小误会制造落差。强调感官细节：光线的角度、衣物的气味、指尖碰到的温度。情感表达有层次，从暗流涌动到爆发要有充分过程。',
'悬疑紧张':'叙述视角有严格的信息限制，读者和主角同步发现线索，不提前泄露答案。多用短句制造窒息感（"他转身。窗户是开着的。昨晚他明明锁上了。"），长句铺垫不安氛围。关键线索藏在日常细节里，初读不显眼，回头看才觉背脊发凉。时间节点要精确，"下午三点十七分"比"下午"更有压迫感。',
'古风典雅':'语言典雅含蓄，有古典韵味但不堆砌冷僻词汇。善用自然意象映射人物心境（秋雨/孤灯/落花），情感多以景语带出，"她未曾回头"胜过"她很难过"。句式有骈散结合的节奏感，长短交错。对话用"你我"亦可，但语气要有时代厚重感，避免现代口语。化用诗词要自然融入，不要生硬引用。整体节奏舒缓从容，留白是美德。',
'幽默讽刺':'叙述者声音有强烈个性，像一个毒舌但善良的旁观者，用调侃的语气观察一切荒诞。善用反差制造喜感（庄严场合的滑稽细节，崇高话语后的尴尬现实）。大量夸张和对比，但控制分寸——过了是闹剧，刚好是讽刺。可以打破第四面墙。笑点背后藏着悲剧，最好的幽默都是带泪的。节奏要轻快，不要让读者停下来想笑点在哪。',
'硬核写实':'语言朴素扎实，不修饰不美化。细节经得起推敲，涉及专业领域（医疗/法律/刑侦/军事）时用语准确。人物说话符合其身份、年龄、教育背景，不是每个人都出口成章。情节推进靠内在逻辑，不靠巧合。人性描写要灰度——没有纯粹的好人坏人，只有各自有道理的立场。冲突来自真实的利益碰撞，不靠误会驱动。',
'诗意散文':'语言如散文诗，意象丰富，句子有内在的呼吸节奏。大量使用比喻和通感（"悲伤的颜色是蓝绿色的，像潮水退后留在沙滩上的痕迹"），情绪融入自然景物而非直接言明。句子有时故意不完整，让停顿成为意义的一部分。不追求情节密度，只追求意境的精准传达。时态和时间线可以自由流动，每段都可以独立成篇。',
'第一人称内心流':'叙述者就是主角，用实时意识流呈现内心。思绪可无逻辑地跳跃（外部刺激→联想→童年记忆→当下感受），时间线碎片化。外部事件只是触发内心涌动的导火索，真正的主角是"我此刻的感受"。大量使用破折号、省略号、括号（补充或否定刚才说的话）。矛盾和自我欺骗要如实记录——"我不在乎。——才怪。"是这个风格的核心魅力。',
'短句冲击流':'以短句为主体，一句一个画面，一句一个情绪节拍。极少使用连词，让断裂感制造张力和速度。适合动作场面、情绪爆发、关键转折。每一句话都必须有重量，废话是罪。标点要精准——句号是落锤，省略号是犹豫，破折号是转折。节奏像鼓点，快而精准。可以把一个长场景拆解成十个短镜头，像电影剪辑。',
'民国白话':'语言类似民国时期白话文，半文半白，有知识分子的腔调和时代感。句式舒展，有层次，略带书卷气但不古板。叙述者有强烈的主观视角，会发表观点和感慨（民国文人喜欢这样）。对话保留"你我"，但语气有时代的庄重和文雅。避免网络用语和过于现代的口语。描写中常有时代感细节（茶楼/电报/洋车）。',
'网文爽文':'语言直接爽快，信息密度大，每段都有情绪落点。主角的碾压感通过对比体现——反派的嚣张→主角出手→反派懵逼→围观群众震惊的标准三段式。对话犀利有力，金句频出。反派要够烂，才能衬托主角够好。节奏极快，绝不拖泥带水。读者每隔三段就要有"爽到"的感觉。禁止主角无意义受苦，受苦必须是为更大的爽服务。'
};
const desc=templates[name]||'';
document.getElementById('styleDesc').value=desc;
ap.curStyle=desc;sv(K.ap,ap);
showToast('已应用文风: '+name);
limitTextarea(document.getElementById('styleDesc'),600,'stCount');
if(currentStyleBinding) saveLocalStyle();
}
function renderAllPresets(){renderApiPresets();renderCharPresets();renderWorldPresets();renderStylePresets();renderRulePresets();renderBanWordsPresets();renderFontPresets();try{renderSysPromptPresets();}catch(e){}}
function applyWorldTemplate(name){
  const templates={
    '现代都市':'故事发生在当代中国的一线城市（北京/上海/深圳）。城市有两张面孔：玻璃幕墙后是金融精英和互联网新贵，CBD以外是出租屋、外卖骑手和流水线工人。高房价与内卷是每个人身上的隐形锁链。\n【地理】高档小区与城中村毗邻，地铁是阶层交汇的罕见场所。\n【社会】新富、中产、底层各有其焦虑。阶层流动的通道正在收窄，但每个人都不肯承认梦想已死。\n【信息环境】社交媒体塑造滤镜人生，私信可见范围成为权力游戏，舆论反转是家常便饭。\n【情感底色】原子化的孤独，以及在孤独里执拗寻找连接。',
    '古代宫廷':'架空王朝，融合汉唐宋明历史元素，不严格对应某朝代。皇权至上，但受宗室、外戚、文官集团制衡。\n【权力结构】皇帝→内阁/宰相→六部→地方官；宦官是隐形权力脉络。后宫等级：皇后→四妃→九嫔→贵人→才人→宫女。\n【宫廷地理】前朝政务，后宫起居，内外廷界限森严，擅越是死罪。\n【文化氛围】诗词是社交货币，宴饮投壶是日常。节气礼仪严格执行，连举止仪态都是政治表态。\n【核心矛盾】生存与忠诚、权力与情感、礼教与人性的永恒拉锯。一道圣旨可以赐死，一次站队可以灭族，也可因缘际会鸡犬升天。',
    '仙侠修真':'天地间灵气以脉络流淌，分布于名山大川。凡人寿命百年，修士可活千载，大能者寿元无算。\n【修为体系（低→高）】练气→筑基→结丹→元婴→化神→合体→大乘→渡劫→飞升。每大境分初期/中期/后期/圆满四层。\n【宗门格局】正道三宗五峰为首，魔道以血海门、幽冥宗为代表，散修夹缝求存。争夺核心：灵脉、功法传承、炼器材料。\n【灵根体系】金木水火土五行灵根，天灵根最稀缺，杂灵根修炼缓慢。\n【经济】灵石为货币（下品→中品→上品→顶品）。\n【重要场所】坊市（交易）、秘境（历练）、渡劫禁地（最终考验）。\n【世界规则】天道有常，因果循环；大能者可逆天改命，但代价惨烈。',
    '西方奇幻':'大陆名为"艾尔德拉"，七大王国被古神留下的符文结界分隔。数百年前的魔王战争遗迹遍布各地。\n【种族】人类（数量最多但寿命最短）、精灵（长寿，居古老森林）、矮人（地下，擅锻造）、兽人（北境荒原）、暗精灵（因古代叛乱被驱至地下）。\n【魔法体系】元素魔法（火/水/土/风）、精神魔法（幻术/治愈/传送）、黑暗魔法（亡灵/诅咒/血祭）。施法消耗法力，大型法术需材料媒介，法师须进学院修习。\n【势力】圣光教会（道德权威）、各王国（政治独立）、冒险者公会（中立第三方）。\n【核心冲突】旧神残余复苏、种族歧视与融合、魔法与信仰的边界。',
    '末日废土':'2047年，核冬结束第十五年。大多数城市已成废墟，人口分散在据点、地堡和废城边缘聚居点。\n【地貌层级】辐射禁区→危险过渡区→稀缺绿洲净土。大地上是焦黑城市骨架、生锈高速和变异植被。\n【社会形态】无统一政府。"秩序据点"（资源换安全的独裁体）与"自由区"（民主但无力抵御威胁）并存。奴隶制在部分地区复活。\n【资源等级】洁净水＞食物＞药物＞武器弹药＞燃料＞辐射防护装备。以物易物为主。\n【威胁层级】辐射变异兽、感染者（有残存意识）、其他幸存者（最大威胁）。\n【文化残片】前时代杂志、磁带、碟片是珍贵精神遗产，一台能放音乐的收音机可换半年食物。',
    '校园青春':'故事发生在中国当代高中或大学校园（也可设定为十年内的过去）。\n【高中版】升学压力笼罩一切，成绩排名是公开的阶层划分。班级是小社会，早恋被官方压制，但在暗处无处不在。重要节点：分班、期末、高考、毕业旅行。\n【大学版】第一次真正的自由，随之而来的是迷茫和自我寻找。宿舍关系是最重要的人际关系。社团、校园节、实习、考研是主要情节线索。\n【共同场景】食堂窗口（命运邂逅的圣地）、操场（情感宣泄空间）、图书馆（暗恋温床）、宿舍走廊（秘密传递通道）。\n【青春本质】每一次心动都当作天大的事，多年后回望才明白那只是开始。',
    '民国乱世':'1920-1940年代中国。清帝国覆灭未久，共和理想尚未实现。军阀割据，日军侵逼，国共明面握手、暗地角力。\n【地理层级】上海（冒险家乐园，繁华与黑暗并存）→北平（文化旧都，新旧思想交战）→重庆（陪都大后方）→战区（血与火的前线）。\n【社会阶层】买办阶级（西化生意人）、军阀幕僚、知识分子（新文化运动余脉）、旧式乡绅、城市无产者（工人/黄包车夫/歌女）。\n【文化氛围】左翼文学兴起，鲁迅式批判弥漫知识界。百乐门舞厅的纸醉金迷与街头流民的衣衫褴褛，相距不过一条马路。\n【时代道具】旗袍与长衫、留声机与《夜来香》、电报、老式相机、租界通行证。\n【核心矛盾】个人情感与家国大义的抉择，理想主义与现实幻灭的落差。',
    '星际科幻':'公元2387年，人类建立"星际共同体"，管辖37个殖民星系。地球已成朝圣圣地，实际权力中心转移至第三环行星群"新日内瓦"轨道站。\n【文明格局】星际共同体（人类主体）、合成意识联盟（AI主权实体，2201年独立战争后获法律人格）、克里希族（已知最古老外星文明，超技术但不干涉）、边缘殖民地（脱管自由港）。\n【技术基础】曲速引擎实现星际旅行；量子纠缠通讯实现即时跨星通讯；基因编辑使人类平均寿命达180年；意识上传技术存在但有争议。\n【核心矛盾】地球原住民vs殖民地新人类的身份认同；AI觉醒的伦理困境；"深空病"（长期旅行导致的精神综合症）。\n【日常】舱位等级决定生活质量，真实物件是奢侈品，虚拟沉浸是最主流娱乐。',
    '克苏鲁诡异':'时间：1920-1930年代（或现代）。地点：美国新英格兰沿岸小镇（如阿卡姆Arkham、因斯茅斯Innsmouth），或架空的类似地区。\n【宇宙观】人类文明是宇宙历史中微不足道的尘埃。在人类出现之前，"旧日支配者"已统治地球亿万年，它们并未死去，只是沉睡。仅仅是"了解"它们的存在就会导致理智崩溃。\n【主要实体】克苏鲁（沉睡于拉莱耶城）、犹格·索托斯（全知的门与钥匙）、奈亚拉托提普（唯一主动接触人类的爬行混沌）、阿撒托斯（宇宙中心的终极虚无）。\n【调查者命运】接触真相→理智下降→幻觉妄想→死去、疯癫或沦为仆从。极少数保住自我，但再也无法正常生活。\n【叙事准则】越平静的描写越预示恐怖。古怪气味、不合逻辑的墙角、夜间无法解释的声响——细节是恐怖的前哨。',
    '赛博朋克':'近未来（2075-2120年），城市无限膨胀，贫富差距达历史极值。四家"超级企业"（MegaCorps）GDP各超数十国总和，事实上取代了民族国家。\n【空间层级】天空塔（超级富豪，阳光洁净）→中层区（企业中产）→地面区（大多数人，商业密集但混乱）→地下区（法外之地，帮派/黑市/非法改造诊所）。\n【义体改造】人体改造是常态。视网膜芯片、神经加速器、外骨骼机械臂……改造程度越高"人性值"越受质疑，极端改造者称"空壳人"。改造需持续维护，欠债者会被收走义体。\n【黑客】直接进入数字空间攻击企业防火墙，被反杀会造成真实脑死亡。\n【核心命题】什么是人？数字意识是否有生命权？个人隐私在全面监控时代是否还有意义？',
    '东方玄幻':'以中华神话为骨架的架空宇宙——"洪荒大世界"。盘古开天辟地后，三千大道散于天地，得道者可成圣。当下为"第三元会"末期，众圣归隐，大道争锋。\n【五族格局】天庭（仙族）↔冥界（幽族）↔妖族大陆↔魔界（魔族）↔人族九州。五族以"封神协议"维持表面和平，暗中争夺气运。\n【大道与境界】炼体→炼气→御气→结元→化虚→通灵→问道→证道→封圣。封圣者绕开天道，自开一方法则，可镇压一界。\n【气运体系】天命所归之人气运磅礴，逆天者被气运反噬。气运是本世界最神秘也最残忍的力量。\n【重要遗迹】混沌古地（盘古化形之所）、封神台（封印上古神明）、魔族禁地（第一次天魔大战遗址）。\n【文化元素】丹道（炼制灵丹）、阵法（布置天地大阵）、符道（以天地之理书写神符）。',
    '都市异能':'当代中国，表面与普通都市无异，但在社会褶皱里存在"超常群体"——因基因突变、上古传承或不明能量辐射而拥有超越常人的能力。\n【能力体系】超常者按"星级"划分（一星至九星）。一至三星较为常见，七星以上凤毛麟角，九星称"超限者"，被各方视为核武级威胁。能力类型：体能强化、元素操控、精神感知、空间能力、预知等。\n【势力格局】国家超常局（官方管理）→民间修炼宗门（以传统武学为包装）→境外势力（以资本或宗教渗透）→自由超常者（隐居或游走）。\n【社会规则】超常者不能在普通公众面前暴露，违者由超常局处置，有单独司法体系。\n【觉醒特征】通常在极端危险或强烈情绪催化下发生，初期能力不稳定，随时会伤及自身。'
  };
  const desc=templates[name]||'';
  const el=document.getElementById('worldDesc');
  if(el) el.value=desc;
  if(el) limitTextarea(el,3000,'lwCount');
  if(currentWorldBinding) saveLocalWorld();
  saveCurSettings();
  showToast('已应用世界观: '+name);
}
// ==================== APPEARANCE ====================
function setTheme(theme,el){
document.body.className='';
if(ap.simpleUI) document.body.classList.add('simple-ui');
if(theme==='auto'){
  // 跟随系统
  if(window.matchMedia&&window.matchMedia('(prefers-color-scheme: light)').matches){
    document.body.classList.add('theme-light');
  }
  // 深色模式用默认紫色主题
}else if(theme==='light'){
  document.body.classList.add('theme-light');
}else if(theme!=='default'){
  document.body.classList.add('theme-'+theme);
}
document.querySelectorAll('.t-opt').forEach(o=>o.classList.remove('act'));
el.classList.add('act');
ap.theme=theme;sv(K.ap,ap);
}
function applyRuleTemplate(name){
const templates={
'纯爱向':'- 主角之间是严格的1v1，任何第三者插足均以失败告终\n- 感情线纯粹，不搞三角恋，不允许出现"备胎"逻辑\n- 误会可以有，但必须在三章内靠沟通解开，不允许无限拖延\n- 结局必须HE（Happy Ending），所有障碍最终都是感情的催化剂\n- 对感情的表达要细腻真实，不要靠外部强行撮合，而是两人自然靠近',
'无虐向':'- 禁止出现主角重伤、濒死、失忆、失去至亲等虐心情节\n- 禁止出现背叛、长期欺骗、恶意伤害感情的行为\n- 误会和矛盾要温和，不要撕心裂肺，解决过程自然流畅\n- 即使有反派，其危害程度也要控制，不让读者过于揪心\n- 整体基调轻松愉快，情感波折在读者接受范围内',
'慢热型':'- 感情发展循序渐进，不允许一见钟情后立即推进关系\n- 前期要有充分的铺垫：互不理解→有所留意→心生好感→暧昧期→确认关系\n- 每一次靠近都要有具体的契机和理由，不能无故突然拉近距离\n- 暧昧期要足够长，模糊地带是这类故事的核心魅力\n- 告白或确定关系放在故事60%-75%处，留出充分的甜蜜回味空间',
'快节奏':'- 情节推进要快，每一章都必须有实质性进展（感情推进/悬念解开/冲突爆发）\n- 大幅减少日常琐碎描写，聚焦关键事件，场景切换利落\n- 对话简洁有力，每句话都要有信息量或情绪推动作用，删掉废话\n- 冲突来得快，解决得也快，不要让读者在同一个困境里等太久\n- 每章结尾留一个小钩子，保证读者有继续看下去的动力',
'古风限定':'- 严禁出现任何现代词汇（"OK""手机""塑料""打卡""内卷"等）\n- 对话符合古代语境，称呼用"公子/姑娘/大人/娘子/夫君"等\n- 计量单位用古制（两/钱/尺/丈/里/斗/匹）\n- 交通工具限于马车、轿子、船，信息传递靠书信、信鸽、跑腿\n- 文化元素：诗词、礼仪、节气、古典乐器（琴/箫/筝）、武术\n- 禁止出现与时代不符的思想观念（如完全现代化的女权意识表达方式）',
'现代限定':'- 故事必须发生在当代现实世界（2010年至今），不允许穿越或大幅架空\n- 所有情节设定要经得起现实逻辑检验，不能出现重大常识错误\n- 禁止出现魔法、修仙、异能等奇幻元素\n- 科技水平与现实一致，手机/网络/交通方式要符合当代\n- 如有职业背景，术语和流程要准确（医院手术/刑侦流程/法庭程序等）',
'BE向':'- 故事结局必须是悲剧（Bad Ending），主角以分离、失去或死亡收场\n- 悲剧必须有充分的铺垫和内在逻辑，不能突兀降临\n- 悲剧来自角色自身的局限、性格或命运，而非随意的外力破坏\n- 即使是悲剧也要有美感——读者哭完之后要感到值得，而不是愤怒\n- 允许存在令人心疼的"如果当时……"时刻，增加悲剧的厚度',
'高虐向':'- 允许出现主角重伤、失忆、被迫分离、失去至亲等高强度虐心情节\n- 感情线中可以有背叛和长期误解，但每一次伤害都要有它的情感逻辑\n- 虐心情节的目的是更深的情感共鸣，而非无意义的折磨——虐要虐得有意义\n- 每次低谷之后要给读者一点喘息的空间（小甜/短暂和解），再次坠落才更有冲击力\n- 整体要维持"痛并期待着"的阅读状态，不要让读者彻底绝望到弃文',
'禁止升级打怪':'- 故事重心在人际关系、情感博弈和内心成长，不在战斗和实力提升\n- 禁止出现等级碾压、一招秒杀、金手指开挂等爽文模式\n- 冲突来自人心的复杂性、立场的对立和选择的代价，而非实力差距\n- 主角靠智慧、情感和理解解决问题，而非靠变强\n- 如有战斗场面，重点描写心理博弈和策略，而非技能特效',
'双男主':'- 故事有两位同等重要的男性主角，两人戏份、情感弧度和成长线要大致均衡\n- 两人关系是全文情感核心，关系类型可以是竞争/互补/惺惺相惜/相爱相杀\n- 禁止其中任何一人长期沦为另一人的工具人、背景板或配角\n- 两人的分歧和和解是主要情节驱动力，每次冲突后关系要有实质性变化\n- 他们对彼此的理解和羁绊，要深过对任何其他角色的感情',
'女强型':'- 女主角是故事绝对核心，性格独立、有能力、有自己明确的目标和价值观\n- 禁止女主在男性角色面前无缘无故软化、失去判断力或让对方替她做决定\n- 感情线服务于女主的成长弧，而非相反——男主是助力，不是女主的全部\n- 女主的胜利和成就必须靠自己的能力取得，不靠男性拯救\n- 允许女主犯错，但她要自己承担后果并成长，而不是等人收场',
'互虐型':'- 主角双方都会主动和被动地给对方造成伤害，不存在单纯的受害者\n- 双方都有自己的执念、创伤和不得已，读者可以理解但不必认同\n- 不存在"坏人"，只有两个被各自局限所困住的人\n- 每一次伤害之后，两人之间的羁绊要更深而非更浅——分开之后更分不开\n- 感情基调：爱而不得，得而复失，失而复得……最终走向和解或毁灭，但过程中要充分呈现羁绊的厚度'
};
const desc=templates[name]||'';
document.getElementById('ruleDesc').value=desc;
curRule=desc;
sv('bj_curRule',curRule);
showToast('已应用规则: '+name);
limitTextarea(document.getElementById('ruleDesc'),2000,'lrCount');
if(currentRuleBinding) saveLocalRule();
}
function applyBanTemplate(name){
const templates={
'网文通病':'不禁\n缓缓\n淡淡\n微微\n默默\n静静\n轻轻\n渐渐\n居然\n竟然\n忍不住\n情不自禁\n下意识\n突然\n猛地\n不知为何\n莫名\n不由得\n怔住\n愣住\n微微一愣\n心跳加速\n呼吸急促\n泪水涌上\n眼眶泛红\n嘴角微勾\n唇角上扬\n一抹笑意\n心中一动\n脑海中\n情绪涌上心头',
'空洞形容':'深邃的眼眸\n完美的侧脸\n精致的五官\n不可方物\n倾国倾城\n绝世容颜\n宛如天仙\n帅得一塌糊涂\n清冽出尘\n英俊不凡\n如谪仙降世\n天人之姿\n肤若凝脂\n明眸皓齿\n沉鱼落雁\n高挺的鼻梁\n完美的轮廓\n令人窒息的美\n美得不真实\n无懈可击的外表\n气质出众\n浑身散发着气场',
'说书腔调':'殊不知\n岂料\n却说\n话说\n且说\n原来\n谁知\n不料\n哪知道\n万万没想到\n正是\n有道是\n此话不假\n按下不表\n话分两头\n欲知后事\n书中暗表\n只见得\n但见\n却不知\n正当此时\n说时迟那时快\n转眼间',
'AI腔':'总的来说\n综上所述\n值得注意的是\n毋庸置疑\n不言而喻\n由此可见\n令人欣慰的是\n不禁让人\n不由自主\n仿佛在说\n不得不说\n与此同时\n除此之外\n正如所说\n令人印象深刻\n这一切都\n随着时间的推移\n在这个过程中\n不可否认\n显而易见\n整体而言\n从某种意义上说\n这无疑是\n可以看出',
'全部清空':''
};
const desc=templates[name]||'';
document.getElementById('banWordsInput').value=desc;
banWords=desc;
sv('bj_banWords',banWords);
showToast(name==='全部清空'?'禁用词已清空':'已应用禁用词: '+name);
limitLines(document.getElementById('banWordsInput'),30,'lbwCount');
if(currentBanBinding) saveLocalBanWords();
}
function applySimpleUiClass(){
  if(ap.simpleUI){
    document.body.classList.add('simple-ui');
  }else{
    document.body.classList.remove('simple-ui');
  }
}

function updateSimpleUiSwitch(){
  const cb=document.getElementById('simpleUiOn');
  const track=document.getElementById('simpleUiTrack');
  const thumb=document.getElementById('simpleUiThumb');
  if(!cb||!track||!thumb)return;
  cb.checked=!!ap.simpleUI;
  if(cb.checked){
    track.style.background='var(--accent)';
    thumb.style.left='22px';
  }else{
    track.style.background='var(--border)';
    thumb.style.left='2px';
  }
}

function toggleSimpleUiSwitch(){
  ap.simpleUI=!ap.simpleUI;
  sv(K.ap,ap);
  applySimpleUiClass();
  updateSimpleUiSwitch();
  showToast(ap.simpleUI?'已开启简洁模式':'已关闭简洁模式');
}
// ==================== 全屏模式 ====================
function enterFullscreen(){
  var el=document.documentElement;
  if(el.requestFullscreen)el.requestFullscreen();
  else if(el.webkitRequestFullscreen)el.webkitRequestFullscreen();
  else if(el.mozRequestFullScreen)el.mozRequestFullScreen();
  else if(el.msRequestFullscreen)el.msRequestFullscreen();
}
function exitFullscreen(){
  if(document.exitFullscreen)document.exitFullscreen();
  else if(document.webkitExitFullscreen)document.webkitExitFullscreen();
  else if(document.mozCancelFullScreen)document.mozCancelFullScreen();
  else if(document.msExitFullscreen)document.msExitFullscreen();
}
function updateFullscreenSwitch(){
  var cb=document.getElementById('fullscreenOn');
  var track=document.getElementById('fullscreenTrack');
  var thumb=document.getElementById('fullscreenThumb');
  if(!cb||!track||!thumb)return;
  var on=!!ap.fullscreen;
  cb.checked=on;
  track.style.background=on?'var(--accent)':'var(--border)';
  thumb.style.left=on?'22px':'2px';
}
function toggleFullscreenSwitch(){
  ap.fullscreen=!ap.fullscreen;
  sv(K.ap,ap);
  if(ap.fullscreen){enterFullscreen();}else{exitFullscreen();}
  updateFullscreenSwitch();
  showToast(ap.fullscreen?'已开启全屏模式':'已关闭全屏模式');
}
document.addEventListener('fullscreenchange',function(){
  if(!document.fullscreenElement&&!document.webkitFullscreenElement){
    ap.fullscreen=false;sv(K.ap,ap);updateFullscreenSwitch();
  }
});
document.addEventListener('webkitfullscreenchange',function(){
  if(!document.fullscreenElement&&!document.webkitFullscreenElement){
    ap.fullscreen=false;sv(K.ap,ap);updateFullscreenSwitch();
  }
});
function applyAppearance(){
document.body.className='';
document.documentElement.style.background = (ap.theme==='light')?'#f5f5f8':'#0f0f14';
if(ap.theme==='auto'){
  if(window.matchMedia&&window.matchMedia('(prefers-color-scheme: light)').matches){
    document.body.classList.add('theme-light');
  }
}else if(ap.theme==='light'){
  document.body.classList.add('theme-light');
}else if(ap.theme&&ap.theme!=='default'){
  document.body.classList.add('theme-'+ap.theme);
}

// 简洁模式：根据 ap.simpleUI 给 body 加/去 simple-ui 类
applySimpleUiClass();
// 全屏模式：浏览器不允许自动进入全屏，必须由用户手势触发
// 所以如果保存了全屏状态但实际不在全屏，需要在首次用户交互时重新进入
if(ap.fullscreen){
  if(!document.fullscreenElement && !document.webkitFullscreenElement){
    // 浏览器不在全屏状态，等待用户首次交互再尝试
    var _fullscreenRetry = function(){
      enterFullscreen();
      document.removeEventListener('click', _fullscreenRetry);
      document.removeEventListener('touchstart', _fullscreenRetry);
    };
    document.addEventListener('click', _fullscreenRetry, {once:true});
    document.addEventListener('touchstart', _fullscreenRetry, {once:true});
  }
}
updateFullscreenSwitch();
document.querySelectorAll('.t-opt').forEach(o=>o.classList.remove('act'));
const themeMap={default:'t0',warm:'t1',green:'t2',blue:'t3',light:'t4',auto:'t5'};
const target=document.querySelector('.t-opt.'+(themeMap[ap.theme]||'t0'));
if(target)target.classList.add('act');

if(ap.fontUrl){
document.getElementById('customFontUrl').value=ap.fontUrl;
loadFont(ap.fontUrl);
}

// 同步“简洁模式”开关按钮的样式
updateSimpleUiSwitch();
try{updateContQualityUI();}catch(e){}
}
// ==================== 内置字体 ====================
var BUILTIN_FONTS = [
  {name:'古早数码体', family:'CF-Digits',  url:'https://yexingphoto.pages.dev/file/NSTJqJl9.ttf'},
  {name:'可爱奶酪体', family:'CF-Cheese',  url:'https://zf.sc.chinaz.com/Files/DownLoad/upload/2024/0412/aacaomeikesongmianbaoyuan.ttf'},
  {name:'宁静手写体', family:'CF-Calm',    url:'https://zf.sc.chinaz.com/Files/DownLoad/upload/2023/0731/ningjingdeqixi.ttf'},
  {name:'连笔书信体', family:'CF-Letter',  url:'https://zf.sc.chinaz.com/Files/DownLoad/upload/2023/0811/taxuexunmiwenrou.ttf'}
];

function _loadBuiltinFontPreviews(){
  if(document.getElementById('bfPreviewStyle')) return;
  try{
    var css = BUILTIN_FONTS.map(function(f){
      var s = f.url.replace(/"/g,'%22').replace(/'/g,'%27');
      return '@font-face{font-family:"'+f.family+'";src:url("'+s+'");font-display:swap;}';
    }).join('');
    var style = document.createElement('style');
    style.id = 'bfPreviewStyle';
    style.textContent = css;
    document.head.appendChild(style);
    // 将预览字体应用到卡片预览文字
    BUILTIN_FONTS.forEach(function(f, i){
      var el = document.getElementById('bfprev'+i);
      if(el) el.style.fontFamily = '"'+f.family+'",sans-serif';
    });
  }catch(e){ console.warn('内置字体预览加载失败', e); }
}

function applyBuiltinFont(idx){
  var f = BUILTIN_FONTS[idx];
  if(!f){ showToast('字体不存在'); return; }
  showToast('⏳ 正在加载字体，首次加载需要数秒，请耐心等待…');
  try{
    document.getElementById('customFontUrl').value = f.url;
    ap.fontUrl = f.url;
    sv(K.ap, ap);
    loadFont(f.url);
    _syncBuiltinFontCards();
  }catch(e){ console.error('应用内置字体失败', e); showToast('字体应用失败'); }
}

function clearBuiltinFont(){
  try{
    document.getElementById('customFontUrl').value = '';
    ap.fontUrl = '';
    sv(K.ap, ap);
    loadFont('');
    _syncBuiltinFontCards();
    showToast('已恢复默认字体');
  }catch(e){ console.error('清除字体失败', e); }
}

function _syncBuiltinFontCards(){
  var currentUrl = (ap.fontUrl || '').trim();
  BUILTIN_FONTS.forEach(function(f, i){
    var card = document.getElementById('bfcard'+i);
    if(!card) return;
    if(f.url === currentUrl){
      card.classList.add('bfont-active');
    } else {
      card.classList.remove('bfont-active');
    }
  });
}

function syncBuiltinFontActiveState(){
  _loadBuiltinFontPreviews();
  _syncBuiltinFontCards();
}
function loadFont(url){
const existing=document.getElementById('cfStyle');
if(existing)existing.remove();
if(!url)return;
try{
const sanitized=url.replace(/"/g,'%22').replace(/'/g,'%27');
const style=document.createElement('style');
style.id='cfStyle';
style.textContent='@font-face{font-family:"CF";src:url("'+sanitized+'");font-display:swap;}body,.rd-content,.acard-pv,.acard-t,.rd-title{font-family:"CF",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif!important;}.fa,.fas,.far,.fab{font-family:"Font Awesome 6 Free"!important;font-weight:900!important;}.far{font-weight:400!important;}.fab{font-family:"Font Awesome 6 Brands"!important;font-weight:400!important;}';
document.head.appendChild(style);
}catch(e){showToast('字体加载失败');console.warn(e);}
}

document.getElementById('customFontUrl').addEventListener('change',function(){
ap.fontUrl=this.value.trim();sv(K.ap,ap);loadFont(ap.fontUrl);
if(ap.fontUrl)showToast('字体已更新，如无变化请检查链接');
});

function uploadRdBg(e){
const file=e.target.files[0];if(!file)return;
// Compress bg image
const canvas=document.createElement('canvas');
const img=new Image();
img.onload=()=>{
const maxW=600;
let w=img.width,h=img.height;
if(w>maxW){h=h*(maxW/w);w=maxW;}
canvas.width=w;canvas.height=h;
canvas.getContext('2d').drawImage(img,0,0,w,h);
const dataUrl=canvas.toDataURL('image/jpeg',0.5);
ap.rdBg=dataUrl;sv(K.ap,ap);showToast('阅读背景已设置');
};
img.src=URL.createObjectURL(file);
e.target.value='';
}

function clearRdBg(){
ap.rdBg='';sv(K.ap,ap);
document.getElementById('rdBg').style.display='none';
const rm=document.getElementById('rdModal');
if(rm)rm.style.setProperty('--rd-bg-img','none');
showToast('阅读背景已清除');
}
function uploadCrBg(e){
const file=e.target.files[0];if(!file)return;
const canvas=document.createElement('canvas');
const img=new Image();
img.onload=()=>{
const maxW=600;
let w=img.width,h=img.height;
if(w>maxW){h=h*(maxW/w);w=maxW;}
canvas.width=w;canvas.height=h;
canvas.getContext('2d').drawImage(img,0,0,w,h);
const dataUrl=canvas.toDataURL('image/jpeg',0.5);
ap.crBg=dataUrl;sv(K.ap,ap);
applyCrBg();
// 刷新阅读背景（如果阅读器开着）
var rdContainer = document.getElementById('rdReaderContainer');
if(rdContainer){
    setRdThemeBg(ap.rdThemeBg || '');
}
showToast('创作背景已设置');
};
img.src=URL.createObjectURL(file);
e.target.value='';
}

function clearCrBg(){
ap.crBg='';sv(K.ap,ap);
document.getElementById('crBg').style.display='none';
showToast('创作背景已清除');
}

function applyCrBg(){
const bg=document.getElementById('crBg');
if(bg){
if(ap.crBg){
bg.style.backgroundImage='url('+ap.crBg+')';
bg.style.display='block';
}else{
bg.style.display='none';
}
}
}
function uploadRdBgImg(e){
  var file=e.target.files[0];if(!file)return;
  var canvas=document.createElement('canvas');
  var img=new Image();
  img.onload=function(){
    var maxW=600;
    var w=img.width,h=img.height;
    if(w>maxW){h=h*(maxW/w);w=maxW;}
    canvas.width=w;canvas.height=h;
    canvas.getContext('2d').drawImage(img,0,0,w,h);
    var dataUrl=canvas.toDataURL('image/jpeg',0.5);
    rdBgImg=dataUrl;
    sv('bj_rdBgImg',rdBgImg);
    // 清除主题背景，因为自定义图片优先
    ap.rdThemeBg='';
    sv(K.ap,ap);
    showToast('阅读背景已设置（主题背景已自动清除）');
  };
  img.src=URL.createObjectURL(file);
  e.target.value='';
}

function clearRdBgImg(){
  rdBgImg='';
  sv('bj_rdBgImg','');
  showToast('阅读背景已清除，可以设置主题背景了');
}
function uploadHomeBg(e){
  var file=e.target.files[0];if(!file)return;
  var canvas=document.createElement('canvas');
  var img=new Image();
  img.onload=function(){
    var maxW=800;var w=img.width,h=img.height;
    if(w>maxW){h=Math.round(h*(maxW/w));w=maxW;}
    canvas.width=w;canvas.height=h;
    canvas.getContext('2d').drawImage(img,0,0,w,h);
    homeBgImg=canvas.toDataURL('image/jpeg',0.5);
    sv('bj_homeBg',homeBgImg);
    applyHomeBg();
    URL.revokeObjectURL(img.src);
    showToast('主页背景已设置');
  };
  img.src=URL.createObjectURL(file);
  e.target.value='';
}
function clearHomeBg(){
  homeBgImg='';
  sv('bj_homeBg','');
  applyHomeBg();
  showToast('主页背景已清除');
}
function applyHomeBg(){
  if(homeBgImg){
    document.body.style.backgroundImage='url('+homeBgImg+')';
    document.body.style.backgroundSize='cover';
    document.body.style.backgroundPosition='center';
    document.body.style.backgroundAttachment='fixed';
  }else{
    document.body.style.backgroundImage='';
    document.body.style.backgroundSize='';
    document.body.style.backgroundPosition='';
    document.body.style.backgroundAttachment='';
  }
}
function uploadBnavBg(e){
  var file=e.target.files[0];if(!file)return;
  var canvas=document.createElement('canvas');
  var img=new Image();
  img.onload=function(){
    var maxW=600;var w=img.width,h=img.height;
    if(w>maxW){h=h*(maxW/w);w=maxW;}
    canvas.width=w;canvas.height=h;
    canvas.getContext('2d').drawImage(img,0,0,w,h);
    bnavBgImg=canvas.toDataURL('image/jpeg',0.5);
    sv('bj_bnavBg',bnavBgImg);
    applyBnavBg();
    URL.revokeObjectURL(img.src);
    showToast('底部导航背景已设置');
  };
  img.src=URL.createObjectURL(file);
  e.target.value='';
}
function clearBnavBg(){
  bnavBgImg='';
  sv('bj_bnavBg','');
  applyBnavBg();
  showToast('底部导航背景已清除');
}
function applyBnavBg(){
  var nav=document.getElementById('bnav');
  if(!nav)return;
  if(bnavBgImg){
    nav.style.backgroundImage='linear-gradient(180deg,rgba(26,26,36,.75) 0%,rgba(20,20,28,.92) 100%),url('+bnavBgImg+')';
    nav.style.backgroundSize='auto,cover';
    nav.style.backgroundPosition='center,center';
  }else{
    nav.style.backgroundImage='';
    nav.style.backgroundSize='';
    nav.style.backgroundPosition='';
  }
}
function applyRdBgImg(){
  // 仅用于初始化时加载（如果需要的话）
}
// ==================== DATA IMPORT/EXPORT ====================
function exportAllNotes(){
const allNotes={};
const allArticles=[...ws,...cols.books,...cols.shorts];
const ids=[...new Set(allArticles.map(a=>a.id))];
ids.forEach(id=>{
const n=ld('bj_notes_'+id,[]);
if(n.length>0)allNotes[id]=n;
});
return allNotes;
}
function importAllNotes(notesObj){
if(!notesObj||typeof notesObj!=='object')return;
Object.keys(notesObj).forEach(id=>{
if(Array.isArray(notesObj[id])&&notesObj[id].length>0){
sv('bj_notes_'+id,notesObj[id]);
}
});
}
function exportAllForeshadow(){
const allFs={};
const allArticles=[...ws,...cols.books,...cols.shorts];
const ids=[...new Set(allArticles.map(a=>a.id))];
ids.forEach(id=>{
const list=ld('bj_foreshadow_'+id,[]);
if(list.length>0)allFs[id]=list;
});
return allFs;
}
function importAllForeshadow(fsObj){
if(!fsObj||typeof fsObj!=='object')return;
Object.keys(fsObj).forEach(id=>{
if(Array.isArray(fsObj[id])&&fsObj[id].length>0){
sv('bj_foreshadow_'+id,fsObj[id]);
}
});
}
function exportAllTimeline(){
const allTl={};
const allArticles=[...ws,...cols.books,...cols.shorts];
const ids=[...new Set(allArticles.map(a=>a.id))];
ids.forEach(id=>{
const list=ld('bj_timeline_'+id,[]);
if(list.length>0)allTl[id]=list;
});
return allTl;
}
function importAllTimeline(tlObj){
if(!tlObj||typeof tlObj!=='object')return;
Object.keys(tlObj).forEach(id=>{
if(Array.isArray(tlObj[id])&&tlObj[id].length>0){
sv('bj_timeline_'+id,tlObj[id]);
}
});
}
function exportData(){
    saveCurSettings();
    markBackupDone();
    // 导出前强制刷新写入队列
try{if(_svTimer){clearTimeout(_svTimer);_svTimer=null;}_flushSv();}catch(e){}
// 从IndexedDB重新加载确保数据最新
try{
  ws=ld(K.ws,ws||[]);
  cols=ld(K.cols,cols||{books:[],shorts:[]});
  if(!cols.folders)cols.folders=[];
  crWorks=ld('bj_crWorks',crWorks||[]);
  crFolders=ld('bj_crFolders',crFolders||[]);
}catch(e){}
    const data = {
        _app: 'syn',
        _version: 3,
        _ver: APP_VER,
        _exportedAt: new Date().toISOString(),
        apiPresets: apiP,
        charPresets: charP,
        worldPresets: worldP,
        stylePresets: styleP,
        rulePresets: ruleP,
        curRule: curRule,
        banWords: banWords,
        banWordsPresets: banWordsP,
        curApi: (function(){var a=ld(K.curApi,{});return{url:a.url||'',key:a.key?('sk-***'+a.key.slice(-4)):'',model:a.model||'',temp:a.temp,maxTokens:a.maxTokens};})(),
        toolApi: (function(){var t=ld('bj_toolApi',{});return{url:t.url||'',key:t.key?('***'+t.key.slice(-4)):'',model:t.model||''}})(),
        curChars: characters,
        charRelations: charRelations,
        npcList: npcList,
        curWorld: ld(K.curWorld, {}),
        collections: cols,
        workshop: ws,
        crWorks: crWorks,
        crFolders: crFolders,
        resPacks: resPacks,
        tags: tags,
        appearance: ap,
        userCard: userCard,
        lockSettings: lockSettings,
        goalSettings: goalSettings,
        goalProgress: goalProgress,
        goalYearStats: goalYearStats,
goalDailyStats: goalDailyStats,
globalWorld: globalWorld,
        globalRule: globalRule,
        globalBanWords: globalBanWords,
        localWorldBindings: localWorldBindings,
        localRuleBindings: localRuleBindings,
        localBanWordsBindings: localBanWordsBindings,
        localStyleBindings: localStyleBindings,
        currentCharPresetName: currentCharPresetName,
        articleContexts: articleContexts,
        storyWheels: storyWheels,
        genLogs: genLogs,
        fontPresets: fontP,
        sysPromptPresets: sysPromptP,
        sysPromptEntries: sysPromptEntries,
        customTraits: customTraits,
        customSysPrompt: customSysPrompt,
        customSysPromptPosition: customSysPromptPosition,
        rpChars: ld('bj_rpChars', []),
        rpSettings: ld('bj_rpSettings', {userDesc:'',contextLen:10,bg:'',autoSumEnabled:false,autoSumInterval:20}),
        rpCurrentCharId: ld('bj_rpCurrentCharId', ''),
        rpGroups: ld('bj_rpGroups', []),
        rpCurrentGroupId: ld('bj_rpCurrentGroupId', ''),
        rpWorldFolders: ld('bj_rpWorldFolders', []),
        rpBookLib: ld('bj_rpBookLib', []),
        rpGrpPlayPresets: ld('bj_rpGrpPlayPresets', []),
        dndMode: dndMode,
        ttsSettings: ttsSettings_,
        devMode: devMode,xjVisible: xjVisible,
xjBubbleEnabled: xjBubbleEnabled,
        rdBgImg: rdBgImg,autoSaveToast:autoSaveToast,contAutoScroll:contAutoScroll,genVibrate:genVibrate,rdProgressMemory:rdProgressMemory,edExitConfirm:edExitConfirm,showThemeBtn:showThemeBtn,genConfirm:genConfirm,contAutoExtend:contAutoExtend,contDirMemory:contDirMemory,paraLongPress:paraLongPress,rdFooterVisible:rdFooterVisible,backupReminder:backupReminder,backupInterval:backupInterval,storageFullReminder:storageFullReminder,navBarText:navBarText,rpStreamOutput:ld('bj_rpStreamOutput',true),rpMsgSplit:ld('bj_rpMsgSplit',true),clearDataConfirm:clearDataConfirm,rpTimeAware:ld('bj_rpTimeAware',false),xjMsgSplit:xjMsgSplit,dwBlink:dwBlink,volSynFromOutline:volSynFromOutline,volSynExcerptLen:volSynExcerptLen,
        xjPetData: (function(){
          try{var r=localStorage.getItem('xj_pet_v3');return r?JSON.parse(r):null;}
          catch(e){return null;}
        }()),
        dwEntries: ld('dw_entries',[]),
        dwCustomPrompts: (function(){try{var r=localStorage.getItem('dw_custom_prompts');return r?JSON.parse(r):[];}catch(e){return [];}}()),
        notes: exportAllNotes(),
        favItems: favItems,favTags: favTags,savedPhrases: savedPhrases,
        genTemplates: genTemplates,rtInterviews: ld('bj_rtInterviews', {}),
        rtPlays: ld('bj_rtPlays', {}),
        rtPlayPresets: ld('bj_rtPlayPresets', []),
        rtBgImg: ld('bj_rtBgImg', ''),homeBgImg: homeBgImg,rpContactBgImg: ld('bj_rpContactBg', ''),
        rpApiOverride: ld('bj_rpApiOverride', null),
xjSkin: xjSkin,
xjSkinUnlocked: xjSkinUnlocked,
xjUsedCodes: ld('bj_xjUsedCodes',[]),xjTotalChats: parseInt(localStorage.getItem('bj_xjTotalChats')||'0',10),
xjEverLong: localStorage.getItem('bj_xjEverLong')==='1',
xjEverShort: localStorage.getItem('bj_xjEverShort')==='1',
xjEverStreak7: localStorage.getItem('bj_xjEverStreak7')==='1',
xjEverMillion: localStorage.getItem('bj_xjEverMillion')==='1',
        tbData: (function(){
          try{
            var j=localStorage.getItem('tb_journeys');
            var s=localStorage.getItem('tb_settings');
            var b=localStorage.getItem('tb_bindings');
            var beau=localStorage.getItem('tb_beauty');
            var lp=localStorage.getItem('tb_local_presets');
return {journeys:j?JSON.parse(j):null,settings:s?JSON.parse(s):null,bindings:b?JSON.parse(b):null,beauty:beau?JSON.parse(beau):null,localPresets:lp?JSON.parse(lp):null,shortcuts:(function(){try{var sc=localStorage.getItem('tb_shortcuts');return sc?JSON.parse(sc):null;}catch(e){return null;}})(),phrases:(function(){try{var ph=localStorage.getItem('tb_phrases');return ph?JSON.parse(ph):null;}catch(e){return null;}})(),beautyBg:(function(){try{return localStorage.getItem('tb_beauty_bg')||null;}catch(e){return null;}})()};
          }catch(e){return null;}
        }()),
        materials: ld('bj_materials',[]),
        foreshadow: exportAllForeshadow(),
        timeline: exportAllTimeline(),
        currentWorldBinding: ld('bj_currentWorldBinding',''),
        currentRuleBinding: ld('bj_currentRuleBinding',''),
        currentBanBinding: ld('bj_currentBanBinding',''),
        currentStyleBinding: ld('bj_currentStyleBinding',''),
        currentWorldPresetName: ld('bj_currentWorldPresetName',''),
        currentRulePresetName: ld('bj_currentRulePresetName',''),
        currentBanPresetName: ld('bj_currentBanPresetName',''),
        currentStylePresetName: ld('bj_currentStylePresetName',''),
        dailyStreak: ld('bj_daily_streak',{lastDate:'',currentStreak:0,longestStreak:0,totalCount:0}),
        advGenres: ld('bj_advGenres',['甜宠','虐恋','悬疑','奇幻','古风','现代','校园','职场','重生','穿越','仙侠','都市','末日','科幻','豪门','娱乐圈','电竞','军旅']),
        advProjects: ld('bj_advProjects',[]),
        rpDiaries: ld('bj_rpDiaries',{}),
        rpDiaryAutoEnabled: ld('bj_rpDiaryAutoEnabled',false),
        rpDiaryAutoTime: ld('bj_rpDiaryAutoTime','22:00'),
        rpDiaryAutoLastDates: ld('bj_rpDiaryAutoLastDates',{}),
        rpUserPresets: ld('bj_rpUserPresets',[]),
        rpBubbleColors: ld('bj_rpBubbleColors',{char:'purple',user:'sky'}),
        xjMessages: ld('bj_xjMessages',[]),
        xjBg: ld('bj_xjBg',''),
        xjContextLen: ld('bj_xjContextLen',30),
        ringData: ld('bj_ringData',''),
        ringName: ld('bj_ringName',''),
        ringVolume: ld('bj_ringVolume',0.8),
        useStream: ld('bj_stream',true),
        consistencyCheckOn: ld('bj_consistencyCheckOn',false),
        contQualityOn: ld('bj_contQualityOn',true),
        ctxAutoSave: ld('bj_ctxAutoSave',false),
        globalFloatBtnOn: ld('bj_globalFloatBtnOn',true),
        noDescLimit: ld('bj_noDescLimit',false),
        edFontSize: ld('bj_edFontSize',15),
        edLetterSpacing: ld('bj_edLetterSpacing',0),
        edLineHeight: ld('bj_edLineHeight',2),
        edRdFontSize: ld('bj_edRdFontSize',15),
        edRdLetterSpacing: ld('bj_edRdLetterSpacing',0),
        edRdLineHeight: ld('bj_edRdLineHeight',2)
    };

    let jsonStr;
try{
  jsonStr = JSON.stringify(data, null, 2);
  // 基本完整性校验（避免大数据时完整解析卡顿）
  if(!jsonStr || jsonStr.length<10 || jsonStr[0]!=='{'){
    throw new Error('序列化结果异常');
  }
}catch(e){
  showToastForce('导出数据序列化异常：'+e.message+'，尝试修复中...',4000);
  // 尝试清理不可序列化的内容后重试
  try{
    var cleanData=JSON.parse(JSON.stringify(data));
    jsonStr=JSON.stringify(cleanData,null,2);
  }catch(e2){
    showToast('导出失败，数据中包含无法序列化的内容',5000);
    return;
  }
}
    const filename = '星叙_' + new Date().toLocaleDateString().replace(/\//g, '-') + '_备份.json';

    _exportFileWithFallback(filename,jsonStr,'application/json');
}

function fallbackExport(jsonStr,fileName){
// 使用data URI方式，兼容性最好
const dataUri='data:application/json;charset=utf-8,'+encodeURIComponent(jsonStr);
const a=document.createElement('a');
a.href=dataUri;a.download=fileName;
a.style.display='none';
document.body.appendChild(a);a.click();
setTimeout(()=>{document.body.removeChild(a);},500);
showToast('数据已导出');
}

function importData(e){
const file=e.target.files[0];if(!file)return;
const reader=new FileReader();
reader.onload=ev=>{
try{
let rawText=ev.target.result||'';
// 去BOM和不可见字符
rawText=rawText.replace(/^\uFEFF/,'').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g,'');
let data;
try{data=JSON.parse(rawText);}catch(pe){
  // 尝试修复常见JSON问题
  try{
    var fixed=rawText.replace(/,\s*([}\]])/g,'$1');
    data=JSON.parse(fixed);
    showToast('JSON已自动修复并导入',2000);
  }catch(pe2){
    showToast('文件解析失败：不是有效的JSON文件\n\n错误：'+pe2.message,5000);
    return;
  }
}
if(data._app!=='bijiAI' && data._app!=='syn'){showToast('文件格式不正确（非星叙/笔记AI备份文件）',3000);return;}
// 版本兼容转换
var dataVer=data._version||1;
try{
  if(dataVer<2){
    // v1→v2: 旧版可能没有relations/npcs字段
    if(data.charPresets&&Array.isArray(data.charPresets)){
      data.charPresets.forEach(function(p){
        if(!p.relations)p.relations=[];
        if(!p.npcs)p.npcs=[];
      });
    }
    if(!data.globalWorld)data.globalWorld='';
    if(!data.globalRule)data.globalRule='';
    if(!data.globalBanWords)data.globalBanWords='';
    if(!data.localWorldBindings)data.localWorldBindings={};
    if(!data.localRuleBindings)data.localRuleBindings={};
    if(!data.localBanWordsBindings)data.localBanWordsBindings={};
    if(!data.localStyleBindings)data.localStyleBindings={};
  }
  if(dataVer<3){
    // v2→v3: 确保collections结构完整
    if(data.collections){
      if(!data.collections.books)data.collections.books=[];
      if(!data.collections.shorts)data.collections.shorts=[];
      data.collections.books.forEach(function(b){
        if(!b.status)b.status='ongoing';
        if(!b.rating)b.rating=0;
        if(b.type==='long'&&!Array.isArray(b.chapters))b.chapters=[b.content||''];
      });
      data.collections.shorts.forEach(function(s){if(!s.rating)s.rating=0;});
    }
    // 确保crWorks每个都有updatedAt
    if(data.crWorks&&Array.isArray(data.crWorks)){
      data.crWorks.forEach(function(w){
        if(!w.updatedAt)w.updatedAt=w.createdAt||new Date().toISOString();
        if(w.type==='novel'&&!Array.isArray(w.chapters))w.chapters=[w.content||''];
      });
    }
    // RP角色记忆格式升级
    if(data.rpChars&&Array.isArray(data.rpChars)){
      data.rpChars.forEach(function(c){
        if(c.memory&&!c.memories){
          c.memories=[{id:uid(),text:c.memory,time:new Date().toISOString()}];
          delete c.memory;
        }
        if(!c.memories)c.memories=[];
      });
    }
  }
  showToast('数据版本 v'+dataVer+'，已自动兼容转换',2000);
}catch(compatErr){
  console.warn('版本兼容转换异常（不影响导入）:',compatErr);
}
showDlg('导入确认','导入将覆盖当前所有设置和收藏数据，是否继续？',()=>{
if(data.apiPresets){apiP=data.apiPresets;sv(K.apiP,apiP);}
if(data.charPresets){charP=data.charPresets;sv(K.charP,charP);}
if(data.worldPresets){worldP=data.worldPresets;sv(K.worldP,worldP);}
if(data.lockSettings){
  lockSettings=data.lockSettings;
  sv('bj_lockSettings',lockSettings);}
  if(data.goalSettings){
  goalSettings=data.goalSettings;
  sv('bj_goalSettings',goalSettings);
}
if(data.goalProgress){
  goalProgress=data.goalProgress;
  sv('bj_goalProgress',goalProgress);
}
if(data.goalYearStats){
  goalYearStats=data.goalYearStats;
  sv('bj_goalYearStats',goalYearStats);
}
if(data.goalDailyStats){
  goalDailyStats=data.goalDailyStats;
  sv('bj_goalDailyStats',goalDailyStats);
}
if(data.stylePresets){styleP=data.stylePresets;sv('bj_styleP',styleP);}
if(data.rulePresets){ruleP=data.rulePresets;sv('bj_ruleP',ruleP);}
if(data.curRule){curRule=data.curRule;sv('bj_curRule',curRule);}
if(data.banWords){banWords=data.banWords;sv('bj_banWords',banWords);}
if(data.banWordsPresets){banWordsP=data.banWordsPresets;sv('bj_banWordsP',banWordsP);}
if(data.curApi)sv(K.curApi,data.curApi);
if(data.toolApi)sv('bj_toolApi',data.toolApi);
if(data.curChars){characters=data.curChars;sv(K.curChars,characters);}
if(data.charRelations){charRelations=data.charRelations;sv('bj_charRelations',charRelations);}
if(data.npcList){npcList=data.npcList;sv('bj_npcList',npcList);}
else if(data.currentChar){
// v1/ compatibility
const cc=data.currentChar;
characters=[{name:cc.aName||'',desc:cc.aDesc||''},{name:cc.bName||'',desc:cc.bDesc||''}];
sv(K.curChars,characters);
}
if(data.curWorld)sv(K.curWorld,data.curWorld);
else if(data.currentWorld)sv(K.curWorld,data.currentWorld);
if(data.collections){
cols=data.collections;
// Ensure fields
if(!cols.books)cols.books=[];
if(!cols.shorts)cols.shorts=[];
if(!cols.folders)cols.folders=[];
cols.books.forEach(b=>{if(!b.status)b.status='ongoing';if(!b.rating)b.rating=0;});
cols.shorts.forEach(s=>{if(!s.rating)s.rating=0;});
sv(K.cols,cols);
}
if(data.tags){tags=data.tags;sv(K.tags,tags);}
if(data.workshop){ws=data.workshop;sv(K.ws,ws);}
if(data.crWorks){crWorks=data.crWorks;sv('bj_crWorks',crWorks);}
if(data.crFolders){crFolders=data.crFolders;sv('bj_crFolders',crFolders);}
if(data.resPacks){resPacks=data.resPacks;sv('bj_resPacks',resPacks);}
if(data.dwEntries&&Array.isArray(data.dwEntries)){sv('dw_entries',data.dwEntries);}
if(data.dwCustomPrompts&&Array.isArray(data.dwCustomPrompts)){try{localStorage.setItem('dw_custom_prompts',JSON.stringify(data.dwCustomPrompts));}catch(e){}}
if(data.notes)importAllNotes(data.notes);
if(data.favItems){favItems=data.favItems;sv('bj_favItems',favItems);}
if(data.favTags){favTags=data.favTags;sv('bj_favTags',favTags);}
if(data.savedPhrases){savedPhrases=data.savedPhrases;sv('bj_savedPhrases',savedPhrases);}
if(data.genTemplates){genTemplates=data.genTemplates;sv('bj_genTemplates',genTemplates);}
if(data.rtInterviews){sv('bj_rtInterviews',data.rtInterviews);}
if(data.rtPlays){sv('bj_rtPlays',data.rtPlays);}
if(data.rtPlayPresets){sv('bj_rtPlayPresets',data.rtPlayPresets);}
if(data.rtBgImg){sv('bj_rtBgImg',data.rtBgImg);}
if(data.homeBgImg){homeBgImg=data.homeBgImg;sv('bj_homeBg',homeBgImg);}
if(data.rpContactBgImg){sv('bj_rpContactBg',data.rpContactBgImg);}
if(data.rpApiOverride){sv('bj_rpApiOverride',data.rpApiOverride);}
if(data.xjSkin){xjSkin=data.xjSkin;sv('bj_xjSkin',xjSkin);}
if(data.xjSkinUnlocked){xjSkinUnlocked=data.xjSkinUnlocked;sv('bj_xjSkinUnlocked',xjSkinUnlocked);}
if(data.xjUsedCodes){sv('bj_xjUsedCodes',data.xjUsedCodes);}
if(data.xjTotalChats)localStorage.setItem('bj_xjTotalChats',String(data.xjTotalChats));
if(data.xjEverLong)localStorage.setItem('bj_xjEverLong','1');
if(data.xjEverShort)localStorage.setItem('bj_xjEverShort','1');
if(data.xjEverStreak7)localStorage.setItem('bj_xjEverStreak7','1');
if(data.xjEverMillion)localStorage.setItem('bj_xjEverMillion','1');
if(data.tbData){try{var td=data.tbData;if(td.journeys)localStorage.setItem('tb_journeys',JSON.stringify(td.journeys));if(td.settings)localStorage.setItem('tb_settings',JSON.stringify(td.settings));if(td.bindings)localStorage.setItem('tb_bindings',JSON.stringify(td.bindings));if(td.beauty)localStorage.setItem('tb_beauty',JSON.stringify(td.beauty));if(td.localPresets)localStorage.setItem('tb_local_presets',JSON.stringify(td.localPresets));if(td.shortcuts)localStorage.setItem('tb_shortcuts',JSON.stringify(td.shortcuts));if(td.phrases)localStorage.setItem('tb_phrases',JSON.stringify(td.phrases));if(td.beautyBg)localStorage.setItem('tb_beauty_bg',td.beautyBg);}catch(e){}}
if(data.globalWorld){globalWorld=data.globalWorld;sv('bj_globalWorld',globalWorld);}
if(data.globalRule){globalRule=data.globalRule;sv('bj_globalRule',globalRule);}
if(data.globalBanWords){globalBanWords=data.globalBanWords;sv('bj_globalBanWords',globalBanWords);}
if(data.localWorldBindings){localWorldBindings=data.localWorldBindings;sv('bj_localWorldBindings',localWorldBindings);}
if(data.localRuleBindings){localRuleBindings=data.localRuleBindings;sv('bj_localRuleBindings',localRuleBindings);}
if(data.localBanWordsBindings){localBanWordsBindings=data.localBanWordsBindings;sv('bj_localBanWordsBindings',localBanWordsBindings);}
if(data.localStyleBindings){localStyleBindings=data.localStyleBindings;sv('bj_localStyleBindings',localStyleBindings);}
if(data.currentCharPresetName){currentCharPresetName=data.currentCharPresetName;sv('bj_currentCharPresetName',currentCharPresetName);}
if(data.userCard){userCard=data.userCard;sv('bj_userCard',userCard);}
if(data.articleContexts){articleContexts=data.articleContexts;sv('bj_articleContexts',articleContexts);}
if(data.storyWheels){storyWheels=data.storyWheels;sv('bj_storyWheels',storyWheels);}
if(data.genLogs){genLogs=data.genLogs;sv('bj_genLogs',genLogs);}
if(data.fontPresets){fontP=data.fontPresets;sv('bj_fontP',fontP);}
if(data.sysPromptPresets){ sysPromptP = data.sysPromptPresets; sv('bj_sysPromptP', sysPromptP); }
if(data.customTraits){customTraits=data.customTraits;sv('bj_customTraits',customTraits);}
if(data.appearance){
ap={...{theme:'default',fontUrl:'',rdBg:'',rdFontSize:15,rdLineHeight:2},...data.appearance};
sv(K.ap,ap);
}
if(data.customSysPrompt){ customSysPrompt=data.customSysPrompt; sv('bj_customSysPrompt',customSysPrompt); }
if(data.customSysPromptPosition){ customSysPromptPosition = data.customSysPromptPosition; sv('bj_customSysPromptPosition', customSysPromptPosition); }
if(data.sysPromptEntries){
  sysPromptEntries = data.sysPromptEntries;
  sv('bj_sysPromptEntries', sysPromptEntries);
}else if(data.customSysPrompt){
  // 兼容更早期的备份文件（只有旧版单条自定义指令，没有条目数组）：迁移成一条自定义指令
  ensureSysPromptEntries();
  const _mig={id:'custom_'+uid(),type:'custom',enabled:true,title:'自定义指令',content:data.customSysPrompt};
  if(data.customSysPromptPosition==='head'){ sysPromptEntries.unshift(_mig); } else { sysPromptEntries.push(_mig); }
  sv('bj_sysPromptEntries', sysPromptEntries);
}
if(data.rpChars){sv('bj_rpChars',data.rpChars);}
if(data.rpSettings){sv('bj_rpSettings',data.rpSettings);}
if(data.rpGroups){sv('bj_rpGroups',data.rpGroups);}
if(data.rpWorldFolders){sv('bj_rpWorldFolders',data.rpWorldFolders);}
if(data.rpBookLib){sv('bj_rpBookLib',data.rpBookLib);}
if(data.rpCurrentGroupId){sv('bj_rpCurrentGroupId',data.rpCurrentGroupId);}
if(data.rpGrpPlayPresets){sv('bj_rpGrpPlayPresets',data.rpGrpPlayPresets);}
if(data.rpCurrentCharId){sv('bj_rpCurrentCharId',data.rpCurrentCharId);}
if(typeof data.dndMode!=='undefined'){dndMode=data.dndMode;sv('bj_dndMode',dndMode);}
if(data.ttsSettings){ttsSettings_=data.ttsSettings;sv('bj_ttsSettings',ttsSettings_);}
if(typeof data.devMode!=='undefined'){devMode=data.devMode;sv('bj_devMode',devMode);}
if(typeof data.xjVisible!=='undefined'){xjVisible=data.xjVisible;sv('bj_xjVisible',xjVisible);}
if(typeof data.xjBubbleEnabled!=='undefined'){xjBubbleEnabled=data.xjBubbleEnabled;sv('bj_xjBubbleEnabled',xjBubbleEnabled);}
if(data.rdBgImg){rdBgImg=data.rdBgImg;sv('bj_rdBgImg',rdBgImg);}
if(typeof data.autoSaveToast!=='undefined'){autoSaveToast=data.autoSaveToast;sv('bj_autoSaveToast',autoSaveToast);}
if(typeof data.contAutoScroll!=='undefined'){contAutoScroll=data.contAutoScroll;sv('bj_contAutoScroll',contAutoScroll);}
if(typeof data.genVibrate!=='undefined'){genVibrate=data.genVibrate;sv('bj_genVibrate',genVibrate);}
if(typeof data.rdProgressMemory!=='undefined'){rdProgressMemory=data.rdProgressMemory;sv('bj_rdProgressMemory',rdProgressMemory);}
if(typeof data.edExitConfirm!=='undefined'){edExitConfirm=data.edExitConfirm;sv('bj_edExitConfirm',edExitConfirm);}
if(typeof data.showThemeBtn!=='undefined'){showThemeBtn=data.showThemeBtn;sv('bj_showThemeBtn',showThemeBtn);}
if(typeof data.genConfirm!=='undefined'){genConfirm=data.genConfirm;sv('bj_genConfirm',genConfirm);}
if(typeof data.contAutoExtend!=='undefined'){contAutoExtend=data.contAutoExtend;sv('bj_contAutoExtend',contAutoExtend);}
if(typeof data.contDirMemory!=='undefined'){contDirMemory=data.contDirMemory;sv('bj_contDirMemory',contDirMemory);}
if(typeof data.paraLongPress!=='undefined'){paraLongPress=data.paraLongPress;sv('bj_paraLongPress',paraLongPress);}
if(typeof data.rdFooterVisible!=='undefined'){rdFooterVisible=data.rdFooterVisible;sv('bj_rdFooterVisible',rdFooterVisible);}
if(typeof data.backupReminder!=='undefined'){backupReminder=data.backupReminder;sv('bj_backupReminder',backupReminder);}
if(typeof data.backupInterval!=='undefined'){var _bi=parseInt(data.backupInterval,10);backupInterval=(_bi&&_bi>=1&&_bi<=30)?_bi:7;sv('bj_backupInterval',backupInterval);}
if(typeof data.storageFullReminder!=='undefined'){storageFullReminder=data.storageFullReminder;sv('bj_storageFullReminder',storageFullReminder);try{updateStorageFullReminderUI();}catch(e){}}
if(typeof data.navBarText!=='undefined'){navBarText=data.navBarText;sv('bj_navBarText',navBarText);}
if(typeof data.rpStreamOutput!=='undefined'){sv('bj_rpStreamOutput',data.rpStreamOutput);}
if(typeof data.rpMsgSplit!=='undefined'){sv('bj_rpMsgSplit',data.rpMsgSplit);}
if(typeof data.clearDataConfirm!=='undefined'){clearDataConfirm=data.clearDataConfirm;sv('bj_clearDataConfirm',clearDataConfirm);}
if(typeof data.rpTimeAware!=='undefined'){sv('bj_rpTimeAware',data.rpTimeAware);}
if(typeof data.xjMsgSplit!=='undefined'){xjMsgSplit=data.xjMsgSplit;sv('bj_xjMsgSplit',xjMsgSplit);}
if(typeof data.dwBlink!=='undefined'){dwBlink=data.dwBlink;sv('bj_dwBlink',dwBlink);}
if(data.xjPetData){
  try{localStorage.setItem('xj_pet_v3',JSON.stringify(data.xjPetData));}
  catch(e){}
}
if(data.materials){sv('bj_materials',data.materials);}
if(data.foreshadow)importAllForeshadow(data.foreshadow);
if(data.timeline)importAllTimeline(data.timeline);
if(data.currentWorldBinding){currentWorldBinding=data.currentWorldBinding;sv('bj_currentWorldBinding',currentWorldBinding);}
if(data.currentRuleBinding){currentRuleBinding=data.currentRuleBinding;sv('bj_currentRuleBinding',currentRuleBinding);}
if(data.currentBanBinding){currentBanBinding=data.currentBanBinding;sv('bj_currentBanBinding',currentBanBinding);}
if(data.currentStyleBinding){currentStyleBinding=data.currentStyleBinding;sv('bj_currentStyleBinding',currentStyleBinding);}
if(data.currentWorldPresetName){currentWorldPresetName=data.currentWorldPresetName;sv('bj_currentWorldPresetName',currentWorldPresetName);}
if(data.currentRulePresetName){currentRulePresetName=data.currentRulePresetName;sv('bj_currentRulePresetName',currentRulePresetName);}
if(data.currentBanPresetName){currentBanPresetName=data.currentBanPresetName;sv('bj_currentBanPresetName',currentBanPresetName);}
if(data.currentStylePresetName){currentStylePresetName=data.currentStylePresetName;sv('bj_currentStylePresetName',currentStylePresetName);}
if(data.dailyStreak){sv('bj_daily_streak',data.dailyStreak);}
if(data.advGenres){advGenreList=data.advGenres;sv('bj_advGenres',advGenreList);}
if(data.advProjects){advProjects=data.advProjects;sv('bj_advProjects',advProjects);}
if(data.rpDiaries){sv('bj_rpDiaries',data.rpDiaries);}
if(typeof data.rpDiaryAutoEnabled!=='undefined'){sv('bj_rpDiaryAutoEnabled',data.rpDiaryAutoEnabled);}
if(data.rpDiaryAutoTime){sv('bj_rpDiaryAutoTime',data.rpDiaryAutoTime);}
if(data.rpDiaryAutoLastDates){sv('bj_rpDiaryAutoLastDates',data.rpDiaryAutoLastDates);}
if(data.rpUserPresets){sv('bj_rpUserPresets',data.rpUserPresets);}
if(data.rpBubbleColors){sv('bj_rpBubbleColors',data.rpBubbleColors);}
if(data.xjMessages){xjMessages=data.xjMessages;sv('bj_xjMessages',xjMessages);}
if(data.xjBg){xjBgImg=data.xjBg;sv('bj_xjBg',xjBgImg);}
if(data.xjContextLen){xjContextLen=data.xjContextLen;sv('bj_xjContextLen',xjContextLen);}
if(data.ringData){ringData=data.ringData;sv('bj_ringData',ringData);}
if(data.ringName){ringName=data.ringName;sv('bj_ringName',ringName);}
if(data.ringVolume){ringVolume_=data.ringVolume;sv('bj_ringVolume',ringVolume_);}
if(typeof data.useStream!=='undefined'){useStream=data.useStream;sv('bj_stream',useStream);}
if(typeof data.consistencyCheckOn!=='undefined'){sv('bj_consistencyCheckOn',data.consistencyCheckOn);}
if(typeof data.contQualityOn!=='undefined'){sv('bj_contQualityOn',data.contQualityOn);}
if(typeof data.ctxAutoSave!=='undefined'){window.ctxAutoSave=data.ctxAutoSave;sv('bj_ctxAutoSave',data.ctxAutoSave);}
if(typeof data.volSynFromOutline!=='undefined'){volSynFromOutline=data.volSynFromOutline;sv('bj_volSynFromOutline',volSynFromOutline);}
if(data.volSynExcerptLen){volSynExcerptLen=data.volSynExcerptLen;sv('bj_volSynExcerptLen',volSynExcerptLen);}
if(typeof data.globalFloatBtnOn!=='undefined'){globalFloatBtnOn=data.globalFloatBtnOn;sv('bj_globalFloatBtnOn',globalFloatBtnOn);}
if(typeof data.noDescLimit!=='undefined'){noDescLimit=data.noDescLimit;sv('bj_noDescLimit',noDescLimit);}
if(data.edFontSize){edFontSize=data.edFontSize;sv('bj_edFontSize',edFontSize);}
if(typeof data.edLetterSpacing!=='undefined'){edLetterSpacing=data.edLetterSpacing;sv('bj_edLetterSpacing',edLetterSpacing);}
if(data.edLineHeight){edLineHeight=data.edLineHeight;sv('bj_edLineHeight',edLineHeight);}
if(data.edRdFontSize){_edRdFontSize=data.edRdFontSize;sv('bj_edRdFontSize',_edRdFontSize);}
if(typeof data.edRdLetterSpacing!=='undefined'){_edRdLetterSpacing=data.edRdLetterSpacing;sv('bj_edRdLetterSpacing',_edRdLetterSpacing);}
if(data.edRdLineHeight){_edRdLineHeight=data.edRdLineHeight;sv('bj_edRdLineHeight',_edRdLineHeight);}
// Reload forms
const api=data.curApi||data.currentApi||{};
document.getElementById('apiUrl').value=api.url||'';
if(api.key&&!api.key.includes('***')){document.getElementById('apiKey').value=api.key;}
document.getElementById('apiModel').value=api.model||'gpt-4o-mini';
document.getElementById('apiTemp').value=api.temp??0.8;
document.getElementById('apiMaxTokens').value=api.maxTokens||4096;

const world=data.curWorld||data.currentWorld||{};
document.getElementById('worldDesc').value=world.desc||'';
document.getElementById('minWords').value=world.minWords||800;

renderTags();renderAllPresets();renderCollections();renderCharCards();
applyAppearance();
// 导入后数据完整性快速检查
try{
  if(!Array.isArray(ws))ws=[];
  ws=ws.filter(function(a){return a&&a.id;});
  if(!cols||typeof cols!=='object')cols={books:[],shorts:[]};
  if(!Array.isArray(cols.books))cols.books=[];
  if(!Array.isArray(cols.shorts))cols.shorts=[];
  if(!Array.isArray(cols.folders))cols.folders=[];
  cols.books=cols.books.filter(function(b){return b&&b.id;});
  cols.shorts=cols.shorts.filter(function(s){return s&&s.id;});
  cols.folders=cols.folders.filter(function(f){return f&&f.id;});
  if(!Array.isArray(crWorks))crWorks=[];
  crWorks=crWorks.filter(function(w){return w&&w.id;});
  if(!Array.isArray(crFolders))crFolders=[];
  crFolders=crFolders.filter(function(f){return f&&f.id;});
  if(!Array.isArray(characters)||characters.length===0)characters=[{name:'',desc:''}];
  sv(K.ws,ws);sv(K.cols,cols);sv('bj_crWorks',crWorks);sv(K.curChars,characters);
}catch(intErr){console.warn('导入后检查异常:',intErr);}
showToast('数据导入成功');
_unlocked=false; initLockSystem();
});renderUserCard();
}catch(err){showToast('文件解析失败: '+err.message,3000);}
};
reader.readAsText(file);e.target.value='';
}
function deleteWsArticle(id){
const article=ws.find(a=>a.id===id);
if(!article)return;
showDlg('删除文章','确定要从作坊删除「'+article.title+'」吗？',()=>{
ws=ws.filter(a=>a.id!==id);
sv(K.ws,ws);renderArticles();showToast('已删除');
},true);
}
// 数据管理页顶部"加载最新版本"：手动兜底渠道，不依赖弹窗提示也能主动更新+清缓存
function manualLoadLatestVersion(){
  showDlg('加载最新版本','将清理页面缓存并刷新，加载服务器上的最新版本。你的创作数据保存在本地数据库里，不会受影响，确定吗？',function(){
    showToast('正在加载最新版本...');
    if(typeof _hardRefreshApp==='function'){
      _hardRefreshApp();
    }else{
      // 兜底：极端情况下函数未定义（如脚本加载异常），至少保证能刷新
      location.reload();
    }
  },false);
}
function cleanOldData(){
  var oneMonth=30*24*60*60*1000;
  var ninetyDays=90*24*60*60*1000;
  var now=Date.now();

  // ① 候选文章（30天前未收藏）
  var candidates=[];
  ws.forEach(function(a){
    if(!a||!a.createdAt)return;
    var age=now-new Date(a.createdAt).getTime();
    if(age>oneMonth&&!isLiked(a)){
      candidates.push({id:a.id,title:a.title||'未命名',wc:getTotalWords(a),age:Math.floor(age/86400000),del:true});
    }
  });

  // ② 旧生成日志（30天前）
  var oldLogsCount=(genLogs||[]).filter(function(x){
    return x.time&&(now-new Date(x.time).getTime())>oneMonth;
  }).length;

  // ③ 孤儿上下文（对应文章已不存在）
  var allArtIds=new Set();
  ws.forEach(function(a){if(a&&a.id)allArtIds.add(a.id);});
  (cols.books||[]).forEach(function(b){if(b&&b.id)allArtIds.add(b.id);});
  (cols.shorts||[]).forEach(function(s){if(s&&s.id)allArtIds.add(s.id);});
  (crWorks||[]).forEach(function(w){if(w&&w.id)allArtIds.add(w.id);});
  var orphanCtxIds=Object.keys(articleContexts||{}).filter(function(id){return !allArtIds.has(id);});

  // ④ 旧角色日记（90天前）
  var oldDiaryCount=0;
  try{
    var _cleanDiaries=ld('bj_rpDiaries',{});
    Object.keys(_cleanDiaries||{}).forEach(function(cid){
      (_cleanDiaries[cid]||[]).forEach(function(e){
        if(!e.date)return;
        var parts=e.date.split('-');
        if(parts.length<3)return;
        var d=new Date(parseInt(parts[0]),parseInt(parts[1])-1,parseInt(parts[2]));
        if((now-d.getTime())>ninetyDays)oldDiaryCount++;
      });
    });
  }catch(e){}

  if(candidates.length===0&&oldLogsCount===0&&orphanCtxIds.length===0&&oldDiaryCount===0){
    showToast('没有需要清理的旧数据');return;
  }

  // 初始化清理状态（存在window上，供内联onclick回调读写）
  window._cleanState={
    articles:candidates,
    orphanCtxIds:orphanCtxIds,
    cleanLogs:false,
    cleanCtx:false,
    cleanDiary:false
  };

  var html='';

  // —— 文章区 ——
  if(candidates.length>0){
    html+='<div style="font-size:11px;font-weight:700;color:var(--accent2);margin-bottom:6px;display:flex;align-items:center;gap:5px;"><i class="fas fa-file-alt"></i> 作坊文章（共'+candidates.length+'篇）</div>';
    html+='<div style="font-size:10px;color:var(--text2);margin-bottom:8px;line-height:1.5;">30天前未收藏的文章。<b>勾选 = 删除</b>，默认全部勾选。</div>';
    html+='<div style="display:flex;gap:6px;margin-bottom:8px;">';
    html+='<button onclick="cleanToggleAll(true)" style="flex:1;padding:6px;border-radius:8px;border:1px solid rgba(255,107,107,.4);background:rgba(255,107,107,.08);color:var(--danger);font-size:11px;font-weight:600;cursor:pointer;">全选（全删）</button>';
    html+='<button onclick="cleanToggleAll(false)" style="flex:1;padding:6px;border-radius:8px;border:1px solid var(--border);background:var(--card);color:var(--text2);font-size:11px;cursor:pointer;">全部保留</button>';
    html+='</div>';
    html+='<div style="max-height:28vh;overflow-y:auto;margin-bottom:12px;">';
    candidates.forEach(function(c,i){
      html+='<div id="cleanItemN'+i+'" onclick="cleanToggleItem('+i+')" style="display:flex;align-items:center;gap:10px;padding:9px 12px;background:rgba(255,107,107,.06);border:1px solid rgba(255,107,107,.3);border-radius:10px;margin-bottom:6px;cursor:pointer;transition:background .2s,border-color .2s;">';
      html+='<div id="cleanChkN'+i+'" style="width:20px;height:20px;border-radius:6px;background:var(--danger);border:2px solid var(--danger);display:flex;align-items:center;justify-content:center;font-size:12px;color:#fff;flex-shrink:0;"><i class="fas fa-check"></i></div>';
      html+='<div style="flex:1;min-width:0;"><div style="font-size:12px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+esc(c.title)+'</div>';
      html+='<div style="font-size:10px;color:var(--text2);">'+c.wc+'字 · '+c.age+'天前</div></div></div>';
    });
    html+='</div>';
  }

  // —— 其他数据区 ——
  var hasOther=(oldLogsCount>0||orphanCtxIds.length>0||oldDiaryCount>0);
  if(hasOther){
    html+='<div style="font-size:11px;font-weight:700;color:var(--accent2);margin-bottom:6px;display:flex;align-items:center;gap:5px;"><i class="fas fa-database"></i> 其他数据（自选清理）</div>';
    if(oldLogsCount>0){
      html+='<div id="cleanOptLogs" onclick="cleanToggleOpt(\'cleanLogs\',\'cleanOptLogs\',\'cleanChkLogs\')" style="display:flex;align-items:center;gap:10px;padding:9px 12px;background:var(--bg);border:1px solid var(--border);border-radius:10px;margin-bottom:6px;cursor:pointer;transition:background .2s,border-color .2s;">';
      html+='<div id="cleanChkLogs" style="width:20px;height:20px;border-radius:6px;border:2px solid var(--border);flex-shrink:0;"></div>';
      html+='<div><div style="font-size:12px;font-weight:600;">生成日志</div><div style="font-size:10px;color:var(--text2);">删除30天前的记录（共'+oldLogsCount+'条）</div></div></div>';
    }
    if(orphanCtxIds.length>0){
      html+='<div id="cleanOptCtx" onclick="cleanToggleOpt(\'cleanCtx\',\'cleanOptCtx\',\'cleanChkCtx\')" style="display:flex;align-items:center;gap:10px;padding:9px 12px;background:var(--bg);border:1px solid var(--border);border-radius:10px;margin-bottom:6px;cursor:pointer;transition:background .2s,border-color .2s;">';
      html+='<div id="cleanChkCtx" style="width:20px;height:20px;border-radius:6px;border:2px solid var(--border);flex-shrink:0;"></div>';
      html+='<div><div style="font-size:12px;font-weight:600;">孤立上下文设置</div><div style="font-size:10px;color:var(--text2);">已删除文章遗留的设定（共'+orphanCtxIds.length+'条）</div></div></div>';
    }
    if(oldDiaryCount>0){
      html+='<div id="cleanOptDiary" onclick="cleanToggleOpt(\'cleanDiary\',\'cleanOptDiary\',\'cleanChkDiary\')" style="display:flex;align-items:center;gap:10px;padding:9px 12px;background:var(--bg);border:1px solid var(--border);border-radius:10px;margin-bottom:6px;cursor:pointer;transition:background .2s,border-color .2s;">';
      html+='<div id="cleanChkDiary" style="width:20px;height:20px;border-radius:6px;border:2px solid var(--border);flex-shrink:0;"></div>';
      html+='<div><div style="font-size:12px;font-weight:600;">角色日记</div><div style="font-size:10px;color:var(--text2);">删除90天前的角色日记（共'+oldDiaryCount+'条）</div></div></div>';
    }
  }

  showDlg('清理旧数据',html,function(){
    var st=window._cleanState||{};
    var msgs=[];

    // 删除勾选的文章
    var toDelIds=new Set((st.articles||[]).filter(function(c){return c.del;}).map(function(c){return c.id;}));
    if(toDelIds.size>0){
      // 同步清理关联的笔记和上下文
      var _ctxChanged=false;
      toDelIds.forEach(function(id){
        try{localStorage.removeItem('bj_notes_'+id);}catch(e){}
        try{if(dbCache.hasOwnProperty('bj_notes_'+id))delete dbCache['bj_notes_'+id];}catch(e){}
        if(articleContexts&&articleContexts.hasOwnProperty(id)){
          delete articleContexts[id];
          _ctxChanged=true;
        }
      });
      if(_ctxChanged)sv('bj_articleContexts',articleContexts);
      ws=ws.filter(function(a){return !(!a||!a.id||toDelIds.has(a.id));});
      sv(K.ws,ws);
      renderArticles();
      msgs.push('删除文章 '+toDelIds.size+' 篇（含关联笔记和上下文）');
    }

    // 清理旧日志
    if(st.cleanLogs){
      var _oneM=30*24*60*60*1000;
      var _now=Date.now();
      var _before=(genLogs||[]).length;
      genLogs=(genLogs||[]).filter(function(x){return !x.time||(_now-new Date(x.time).getTime())<=_oneM;});
      sv('bj_genLogs',genLogs);
      var _cleaned=_before-genLogs.length;
      if(_cleaned>0)msgs.push('清理日志 '+_cleaned+' 条');
      try{renderGenLogList();}catch(e){}
    }

    // 清理孤儿上下文
    if(st.cleanCtx){
      var _count=0;
      (st.orphanCtxIds||[]).forEach(function(id){
        if(articleContexts[id]!==undefined){delete articleContexts[id];_count++;}
      });
      if(_count>0){sv('bj_articleContexts',articleContexts);msgs.push('清理上下文 '+_count+' 条');}
    }

    // 清理旧日记
    if(st.cleanDiary){
      var _nD=Date.now();
      var _ninety=90*24*60*60*1000;
      var _dc=0;
      try{
        var _rpDiariesClean=ld('bj_rpDiaries',{});
        Object.keys(_rpDiariesClean||{}).forEach(function(cid){
          var _b=(_rpDiariesClean[cid]||[]).length;
          _rpDiariesClean[cid]=(_rpDiariesClean[cid]||[]).filter(function(e){
            if(!e.date)return true;
            var _p=e.date.split('-');
            if(_p.length<3)return true;
            var _d=new Date(parseInt(_p[0]),parseInt(_p[1])-1,parseInt(_p[2]));
            return (_nD-_d.getTime())<_ninety;
          });
          _dc+=_b-(_rpDiariesClean[cid]||[]).length;
        });
        if(_dc>0){sv('bj_rpDiaries',_rpDiariesClean);msgs.push('清理日记 '+_dc+' 条');}
      }catch(e){}
    }

    window._cleanState=null;
    showToast(msgs.length>0?'已清理：'+msgs.join('、'):'未选择任何清理项');
  },true,true);

  setTimeout(function(){
    var okBtn=document.getElementById('dlgOkBtn');
    if(okBtn)okBtn.textContent='确认清理';
    var p=document.getElementById('dlgMsg');
    if(p){p.style.maxHeight='70vh';p.style.overflowY='auto';}
  },50);
}

// 切换单个文章勾选状态（勾选 = 删除）
function cleanToggleItem(i){
  var st=window._cleanState;
  if(!st||!st.articles[i])return;
  var c=st.articles[i];
  c.del=!c.del;
  var chk=document.getElementById('cleanChkN'+i);
  var item=document.getElementById('cleanItemN'+i);
  if(!chk||!item)return;
  if(c.del){
    chk.style.cssText='width:20px;height:20px;border-radius:6px;background:var(--danger);border:2px solid var(--danger);display:flex;align-items:center;justify-content:center;font-size:12px;color:#fff;flex-shrink:0;';
    chk.textContent='✓';
    item.style.background='rgba(255,107,107,.06)';item.style.borderColor='rgba(255,107,107,.3)';
  }else{
    chk.style.cssText='width:20px;height:20px;border-radius:6px;border:2px solid var(--border);flex-shrink:0;';
    chk.textContent='';
    item.style.background='var(--bg)';item.style.borderColor='var(--border)';
  }
}

// 全选 / 全不选文章（del=true全删，del=false全留）
function cleanToggleAll(del){
  var st=window._cleanState;
  if(!st)return;
  (st.articles||[]).forEach(function(c,i){
    c.del=del;
    var chk=document.getElementById('cleanChkN'+i);
    var item=document.getElementById('cleanItemN'+i);
    if(!chk||!item)return;
    if(del){
      chk.style.cssText='width:20px;height:20px;border-radius:6px;background:var(--danger);border:2px solid var(--danger);display:flex;align-items:center;justify-content:center;font-size:12px;color:#fff;flex-shrink:0;';
      chk.textContent='✓';
      item.style.background='rgba(255,107,107,.06)';item.style.borderColor='rgba(255,107,107,.3)';
    }else{
      chk.style.cssText='width:20px;height:20px;border-radius:6px;border:2px solid var(--border);flex-shrink:0;';
      chk.textContent='';
      item.style.background='var(--bg)';item.style.borderColor='var(--border)';
    }
  });
}

// 切换其他数据项勾选（勾选 = 清理）
function cleanToggleOpt(key,itemId,chkId){
  var st=window._cleanState;
  if(!st)return;
  st[key]=!st[key];
  var chk=document.getElementById(chkId);
  var item=document.getElementById(itemId);
  if(!chk||!item)return;
  if(st[key]){
    chk.style.cssText='width:20px;height:20px;border-radius:6px;background:var(--accent);border:2px solid var(--accent);display:flex;align-items:center;justify-content:center;font-size:12px;color:#fff;flex-shrink:0;';
    chk.textContent='✓';
    item.style.borderColor='var(--accent)';item.style.background='rgba(108,92,231,.06)';
  }else{
    chk.style.cssText='width:20px;height:20px;border-radius:6px;border:2px solid var(--border);flex-shrink:0;';
    chk.textContent='';
    item.style.borderColor='var(--border)';item.style.background='var(--bg)';
  }
}

function clearWorkshop(){
  var count=ws.length;
  if(count===0){showToast('作坊已经是空的');return;}
  var totalWc=0;
  var artIds=[];
  ws.forEach(function(a){totalWc+=getTotalWords(a);if(a&&a.id)artIds.push(a.id);});
  showDlg('清空作坊','即将删除作坊中的 '+count+' 篇文章（共 '+totalWc+' 字）\n\n已收藏的文章不受影响\n关联的笔记和上下文也会一并清理\n\n建议先导出备份！',function(){
    // 清理每篇文章关联的笔记和上下文
    var ctxChanged=false;
    artIds.forEach(function(id){
      try{localStorage.removeItem('bj_notes_'+id);}catch(e){}
      try{if(dbCache.hasOwnProperty('bj_notes_'+id))delete dbCache['bj_notes_'+id];}catch(e){}
      if(articleContexts&&articleContexts.hasOwnProperty(id)){
        delete articleContexts[id];
        ctxChanged=true;
      }
    });
    if(ctxChanged){sv('bj_articleContexts',articleContexts);}
    ws=[];
    sv(K.ws,ws);
    renderArticles();
    showToast('作坊已清空，关联数据已彻底清理');
    markBackupDone();
  },true);
}

// ==================== CREATE PAGE ====================
function switchCrTab(tab,el){
crTab=tab;
document.querySelectorAll('.cr-tab').forEach(t=>t.classList.remove('act'));
el.classList.add('act');
const goalPanel=document.getElementById('goalPanel');
const crList=document.getElementById('crList');
if(tab==='goal'){
crList.style.display='none';
goalPanel.style.display='block';
renderGoalPanel();
}else{
crList.style.display='';
goalPanel.style.display='none';
renderCrList();
}
}
// ==================== 创作页折叠工具栏 ====================
function toggleCrToolbar(el){
const panel=document.getElementById('crToolPanel');
const btn=document.getElementById('crToolToggle');
const isOpen=panel.classList.contains('open');
if(!isOpen){
panel.classList.add('open');
btn.classList.add('open');
// 点击空白处自动关闭
setTimeout(function(){
  document.addEventListener('click',function closeCrPanel(e){
    if(!panel.contains(e.target)&&e.target!==btn){
      panel.classList.remove('open');
      btn.classList.remove('open');
      document.removeEventListener('click',closeCrPanel);
    }
  });
},100);
}else{
panel.classList.remove('open');
btn.classList.remove('open');
}
}
// ==================== 创作页顶部「创作工具箱」按钮：搜索作品 ====================
// 这里的「创作工具箱」specifically 指创作页最顶部那一整条按钮（id=crToolToggle，图标+文字+
// 展开箭头那条，点了会展开下面的抽屉），不是抽屉里的某个子按钮。
// 点按钮右侧的放大镜后，这条按钮本身从"图标+创作工具箱+新建/AI辅助/导出"整体换成
// "对勾+搜索框"；抽屉（#crToolPanel）本身完全没变，只是如果搜索时抽屉正好开着，顺手收起来
// 避免两块内容挤在一起。搜索不单开结果区域——草稿箱/我的小说本来就是天然的分类栏目，
// 搜索直接过滤当前选中 tab 下面那个已有的列表（#crList，逻辑在 renderCrList() 里，见
// crSearchKw），命中的显示、不命中的隐藏，点作品和平时一样直接进编辑器。
// 点对勾图标退出搜索、按钮恢复原状、列表恢复未过滤的完整状态。
function openCrToolSearch(){
var panel=document.getElementById('crToolPanel');
var toggle=document.getElementById('crToolToggle');
if(panel&&panel.classList.contains('open')){
panel.classList.remove('open');
if(toggle)toggle.classList.remove('open');
}
document.getElementById('crToolNormalLabel').style.display='none';
document.getElementById('crToolSearchTrigger').style.display='none';
document.getElementById('crToolSearchRow').style.display='flex';
var input=document.getElementById('crToolSearchInput');
input.value='';
crSearchKw='';
renderCrList();
setTimeout(function(){input.focus();},80);
}
function closeCrToolSearch(){
document.getElementById('crToolNormalLabel').style.display='flex';
document.getElementById('crToolSearchTrigger').style.display='flex';
document.getElementById('crToolSearchRow').style.display='none';
crSearchKw='';
renderCrList();
}
function filterCrListBySearch(kw){
crSearchKw=kw||'';
renderCrList();
}
function renderCrList(){
const list=document.getElementById('crList');
let filtered=crWorks.filter(w=>w.type===crTab);
// 创作工具箱顶部搜索框：按名称或创建日期过滤当前 tab（草稿箱/我的小说各自独立筛选，
// 不新开单独的结果区域——草稿箱/我的小说本来就是天然的分类栏目，直接复用这个列表就够了）
const kw=(crSearchKw||'').trim().toLowerCase();
if(kw){
filtered=filtered.filter(function(w){
var dateStr=new Date(w.createdAt).toLocaleDateString();
return (w.title||'').toLowerCase().includes(kw)||dateStr.includes(kw);
});
}
filtered.sort(function(a,b){return (b.pinned?1:0)-(a.pinned?1:0);});
if(filtered.length===0){
if(kw){
list.innerHTML='<div class="empty-st"><p>没有找到匹配"'+esc(crSearchKw.trim())+'"的'+(crTab==='draft'?'草稿':'小说')+'</p></div>';
}else{
list.innerHTML='<div class="empty-st"><p>'+(crTab==='draft'?'还没有草稿<br>点击上方「新建草稿」开始写作':'还没有小说<br>点击上方「新建小说」开始连载')+'</p></div>';
}
return;
}
// 我的小说用带封面缩略图的网格卡片，草稿箱保持原来的纯文字列表——两者外观不同，
// 所以只对承载列表的容器切换一个网格模式的class，card本身该走哪套HTML由work.type分流
list.classList.toggle('cr-list-grid',crTab==='novel');
list.innerHTML='';
filtered.forEach(work=>{
const card=document.createElement('div');
let preview='';
if(work.type==='draft'){
preview=(work.content||'').replace(/\n/g,' ').substring(0,60);
}else{
const lastCh=work.chapters&&work.chapters.length>0?work.chapters[work.chapters.length-1]:'';
preview=(lastCh||'').replace(/\n/g,' ').substring(0,60);
}
const wc=getCrWordCount(work);
const time=work.updatedAt?new Date(work.updatedAt).toLocaleDateString():'';
const chInfo=work.type==='novel'&&work.chapters?' · '+work.chapters.length+'章':'';
if(work.type==='novel'){
card.className='cr-ncard';
const workTitle=work.title||'无标题';
const covHtml=work.cover
  ?'<img src="'+work.cover+'" alt="封面" loading="lazy" onerror="this.style.display=\'none\';this.nextElementSibling&&(this.nextElementSibling.style.display=\'\')">'
  :'';
const phHtml='<div class="cr-ncov-ph"'+(work.cover?' style="display:none"':'')+'><span style="font-size:22px"><i class="fas fa-book"></i></span><span>'+esc(workTitle.substring(0,4))+'</span></div>';
card.innerHTML=
'<div class="cr-ncov">'+covHtml+phHtml+'</div>'+
'<div class="cr-ninfo">'+
'<div style="display:flex;align-items:center;gap:4px">'+
'<div class="cr-ninfo-t" style="flex:1">'+(work.pinned?'<i class="fas fa-star" style="color:var(--accent2);font-size:10px;margin-right:3px"></i>':'')+esc(workTitle)+'</div>'+
'<button class="cr-nact" onclick="event.stopPropagation();toggleCrCardMenu(\''+work.id+'\',this)"><i class="fas fa-ellipsis-h"></i></button>'+
'</div>'+
'<div class="cr-ninfo-m">'+wc+'字'+chInfo+'</div>'+
'<div class="cr-ninfo-m" style="opacity:.7">'+(time?'更新于 '+time:'')+'</div>'+
'</div>';
}else{
card.className='cr-card';
card.innerHTML=
'<div class="cr-card-hd">'+
'<div class="cr-card-t">'+(work.pinned?'<i class="fas fa-star" style="color:var(--accent2);font-size:12px;margin-right:4px"></i>':'')+esc(work.title||'无标题')+'</div>'+
'<span class="cr-card-badge '+work.type+'">草稿</span>'+
'</div>'+
'<div class="cr-card-pv">'+esc(preview||'暂无内容')+'</div>'+
'<div class="cr-card-ft">'+
'<span class="cr-card-info">'+wc+'字'+chInfo+' · '+time+'</span>'+
'<div class="cr-card-acts">'+
'<button onclick="event.stopPropagation();toggleCrCardMenu(\''+work.id+'\',this)"><i class="fas fa-ellipsis-h"></i></button>'+
'</div>'+
'</div>';
}
card.onclick=e=>{
  if(window._crPinJustDone&&Date.now()-window._crPinJustDone<800)return;
  if(!e.target.closest('.cr-card-acts')&&!e.target.closest('.cr-nact'))openEditor(work.id);
};
(function(cardEl,workId){
var _lpT=null,_moved=false,_sx=0,_sy=0,_pinDone=false;
cardEl.addEventListener('touchstart',function(e){
  _moved=false;_pinDone=false;
  if(e.touches.length>0){_sx=e.touches[0].clientX;_sy=e.touches[0].clientY;}
  _lpT=setTimeout(function(){
    if(_moved)return;
    _pinDone=true;
    window._crPinJustDone=Date.now();
    _suppressSelect(cardEl);
    try{if(navigator.vibrate)navigator.vibrate(30);}catch(e){}
    toggleCrPin(workId);
    setTimeout(function(){_restoreSelect(cardEl);},500);
  },600);
},{passive:true});
cardEl.addEventListener('touchmove',function(e){
  if(e.touches.length>0&&(Math.abs(e.touches[0].clientX-_sx)>10||Math.abs(e.touches[0].clientY-_sy)>10)){
    _moved=true;
  }
  if(_moved&&_lpT){clearTimeout(_lpT);_lpT=null;}
},{passive:true});
cardEl.addEventListener('touchend',function(e){
  if(_lpT){clearTimeout(_lpT);_lpT=null;}
  // 关键修复：长按置顶后阻止click事件触发
  if(_pinDone){
    e.preventDefault&&e.preventDefault();
    e.stopPropagation&&e.stopPropagation();
    _pinDone=false;
    return;
  }
});
cardEl.addEventListener('touchcancel',function(){
  if(_lpT){clearTimeout(_lpT);_lpT=null;}
  _pinDone=false;
});
cardEl.addEventListener('contextmenu',function(e){
  e.preventDefault();
  if(window._crPinJustDone&&Date.now()-window._crPinJustDone<1000)return;
  toggleCrPin(workId);
});
})(card,work.id);
list.appendChild(card);
});
}
function toggleCrCardMenu(id,btn){
  var old=document.getElementById('crCardMenuPop');
  if(old){old.remove();btn._menuOpen=false;return;}
  if(btn._menuClosedAt&&Date.now()-btn._menuClosedAt<200)return;
  btn._menuOpen=true;
  var pop=document.createElement('div');
  pop.id='crCardMenuPop';
  pop.className='pop-glass-menu';
  pop.style.cssText='position:fixed;z-index:300;width:216px;padding:8px;animation:fadeIn .15s ease;display:grid;grid-template-columns:1fr 1fr 1fr;gap:2px';
  var _work=crWorks.find(function(w){return w.id===id;});
  var _isPinned=_work&&_work.pinned;
  var items=[
    {icon:'fa-pen',text:'更名',fn:function(){renameCrWork(id);}},
    (_work&&_work.type==='novel')
      ?{icon:'fa-palette',text:'封面',fn:function(){openCoverOptions(id,'cr');}}
      :{icon:'fa-copy',text:'复制',fn:function(){copyCrWork(id);}},
    {icon:'fa-folder',text:'移动到文件夹',fn:function(){openCrFolderPicker(id);}},
    {icon:'fa-file-export',text:'导出',fn:function(){exportSingleCrWork(id);}},
    {icon:'fa-share-alt',text:'分享',fn:function(){shareCrToRes(id);}},
    {icon:'fa-thumbtack',text:_isPinned?'取消置顶':'置顶',fn:function(){toggleCrPin(id);}},
    {icon:'fa-trash-alt',text:'删除',fn:function(){deleteCrWork(id);},danger:true}
  ];
  items.forEach(function(it){
    var d=document.createElement('div');
    d.style.cssText='padding:11px 4px;font-size:11px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:5px;color:'+(it.danger?'var(--danger)':'var(--text2)')+';border-radius:10px;text-align:center;transition:background .15s;';
    d.innerHTML='<i class="fas '+it.icon+'" style="font-size:17px;'+(it.danger?'color:var(--danger)':'color:var(--text)')+'"></i><span style="font-size:11px;color:'+(it.danger?'var(--danger)':'var(--text2)')+'">'+it.text+'</span>';
    d.addEventListener('click',function(e){
      e.preventDefault();e.stopPropagation();
      _closePopMenu('crCardMenuPop',btn);
      setTimeout(function(){it.fn();},50);
    });
    pop.appendChild(d);
  });
  document.body.appendChild(pop);
  _positionPopMenu(pop,btn);
  _bindPopMenuClose('crCardMenuPop',btn);
}
function getCrWordCount(work){
if(work.type==='draft')return countWords(work.content||'');
let total=0;
if(work.chapters)work.chapters.forEach(ch=>total+=countWords(ch));
return total;
}
function newDraft(){
showInp('新建草稿','给草稿起个标题',function(name){
const work={
id:uid(),type:'draft',title:name.trim(),content:'',
createdAt:new Date().toISOString(),
updatedAt:new Date().toISOString()
};
crWorks.unshift(work);
sv('bj_crWorks',crWorks);
openEditor(work.id);
});
}
function newNovel(){
showInp('新建小说','给小说起个名字',name=>{
const work={
id:uid(),type:'novel',title:name,chapters:[''],
createdAt:new Date().toISOString(),
updatedAt:new Date().toISOString()
};
crWorks.unshift(work);
sv('bj_crWorks',crWorks);
openEditor(work.id);
});
}
function toggleCrPin(id){
var work=crWorks.find(function(w){return w.id===id;});
if(!work)return;
work.pinned=!work.pinned;
sv('bj_crWorks',crWorks);
renderCrList();
showToast(work.pinned?'已置顶「'+(work.title||'无标题')+'」 ⭐':'已取消置顶');
}
function deleteCrWork(id){
const work=crWorks.find(w=>w.id===id);
if(!work)return;
showDlg('删除确认','确定要删除「'+(work.title||'无标题')+'」吗？不可恢复。',()=>{
crWorks=crWorks.filter(w=>w.id!==id);
sv('bj_crWorks',crWorks);
renderCrList();
showToast('已删除');
},true);
}
function renameCrWork(id){
const work=crWorks.find(w=>w.id===id);
if(!work)return;
showInp('更名','请输入新标题',function(name){
work.title=name.trim();
work.updatedAt=new Date().toISOString();
sv('bj_crWorks',crWorks);
renderCrList();
showToast('已更名');
});
}
function copyCrWork(id){
const work=crWorks.find(w=>w.id===id);
if(!work)return;
let text='';
if(work.type==='draft'){
text=work.content||'';
}else if(work.chapters){
work.chapters.forEach((ch,i)=>{
text+='第'+(i+1)+'章\n\n'+ch+'\n\n';
});
}
const header='════════════════════\n「'+(work.title||'无标题')+'」\n原创作品 · 星叙创作页\n════════════════════\n\n';
const footer='\n\n════════════════════\n创作工具：星叙 '+APP_VER+'\n════════════════════';
doCopy(header+text.trim()+footer);
}

// ==================== 创作工具箱文件夹 ====================
// 数据结构：crFolders=[{id,name,createdAt}]；每个crWorks作品用work.folderId记录所属文件夹id
// （''或未设置=未分类）。文件夹只是一层分类标签，不影响crWorks数组本身的存储方式和顺序；
// 删除文件夹≠删除作品：文件夹内的作品会自动变回"未分类"。草稿箱和我的小说共用同一套文件夹。
function _crFolderName(id){
  if(!id)return '未分类';
  var f=crFolders.find(function(x){return x.id===id;});
  return f?(f.name||'未命名文件夹'):'未分类';
}
function _crWorksInFolder(folderId){
  var key=folderId||'';
  return crWorks.filter(function(w){return (w.folderId||'')===key;});
}
function _createCrFolder(name){
  var f={id:uid(),name:name,createdAt:new Date().toISOString()};
  crFolders.push(f);
  sv('bj_crFolders',crFolders);
  return f.id;
}
function _renameCrFolder(id,name){
  var f=crFolders.find(function(x){return x.id===id;});
  if(!f)return false;
  f.name=name;
  sv('bj_crFolders',crFolders);
  return true;
}
function _deleteCrFolder(id){
  var idx=crFolders.findIndex(function(x){return x.id===id;});
  if(idx===-1)return false;
  crFolders.splice(idx,1);
  crWorks.forEach(function(w){if(w.folderId===id)w.folderId='';});
  sv('bj_crFolders',crFolders);
  sv('bj_crWorks',crWorks);
  return true;
}
function moveCrWorkToFolder(workId,folderId){
  var w=crWorks.find(function(x){return x.id===workId;});
  if(!w)return;
  w.folderId=folderId||'';
  sv('bj_crWorks',crWorks);
  showToast(folderId?'已移动到「'+_crFolderName(folderId)+'」':'已移出文件夹，归入未分类');
}

// ---- 第一层：文件夹列表抽屉 ----
function openCrFolderDrawer(){
  renderCrFolderDrawerList();
  document.getElementById('crFolderDrawerOv').classList.add('show');
  document.getElementById('crFolderDrawerPanel').classList.add('show');
  navPush('crFolderDrawerOv');
}
function closeCrFolderDrawer(){
  navPop('crFolderDrawerOv');
  document.getElementById('crFolderDrawerOv').classList.remove('show');
  document.getElementById('crFolderDrawerPanel').classList.remove('show');
}
function renderCrFolderDrawerList(){
  var list=document.getElementById('crFolderDrawerList');
  if(!list)return;
  var uncatCount=_crWorksInFolder('').length;
  var html='<div class="cr-fd-row" onclick="openCrFolderDetail(\'\')">'+
    '<i class="fas fa-inbox cr-fd-icon"></i><span class="cr-fd-name">未分类</span>'+
    '<span class="cr-fd-count">'+uncatCount+'</span></div>';
  crFolders.forEach(function(f){
    var cnt=_crWorksInFolder(f.id).length;
    html+='<div class="cr-fd-row" data-folder-id="'+f.id+'" onclick="openCrFolderDetail(\''+f.id+'\')">'+
      '<i class="fas fa-folder cr-fd-icon"></i><span class="cr-fd-name">'+esc(f.name||'未命名文件夹')+'</span>'+
      '<span class="cr-fd-count">'+cnt+'</span>'+
      '</div>';
  });
  if(crFolders.length===0){
    html+='<div class="cr-fd-empty">还没有自建文件夹<br>点击下方"新建文件夹"创建</div>';
  }
  list.innerHTML=html;
  // 长按自建文件夹行→重命名/删除菜单（未分类是系统固定分组，不参与，也没有data-folder-id）
  list.querySelectorAll('.cr-fd-row[data-folder-id]').forEach(function(row){
    _bindLongPress(row,function(){
      toggleCrFolderRowMenu(row.getAttribute('data-folder-id'),row);
    });
  });
}
function promptCreateCrFolder(){
  showInp('新建文件夹','请输入文件夹名称',function(name){
    name=(name||'').trim();
    if(!name)return;
    _createCrFolder(name);
    renderCrFolderDrawerList();
    showToast('已创建文件夹');
  });
}
// 文件夹行的"…"菜单：重命名/删除（复用作品卡片菜单的通用弹出层机制，避免另起一套）
function toggleCrFolderRowMenu(folderId,btn){
  var old=document.getElementById('crFolderRowMenuPop');
  if(old){old.remove();return;}
  var pop=document.createElement('div');
  pop.id='crFolderRowMenuPop';
  pop.className='pop-glass-menu';
  pop.style.cssText='position:fixed;z-index:1400;width:132px;padding:6px;animation:fadeIn .15s ease';
  var items=[
    {icon:'fa-pen',text:'重命名',fn:function(){renameCrFolderPrompt(folderId);}},
    {icon:'fa-trash-alt',text:'删除',fn:function(){deleteCrFolderConfirm(folderId);},danger:true}
  ];
  items.forEach(function(it){
    var d=document.createElement('div');
    d.style.cssText='padding:10px 12px;font-size:12px;cursor:pointer;display:flex;align-items:center;gap:8px;color:'+(it.danger?'var(--danger)':'var(--text)')+';border-radius:8px;transition:background .15s;';
    d.innerHTML='<i class="fas '+it.icon+'" style="font-size:13px;width:14px;text-align:center"></i><span>'+it.text+'</span>';
    d.addEventListener('click',function(e){
      e.preventDefault();e.stopPropagation();
      _closePopMenu('crFolderRowMenuPop',btn);
      setTimeout(function(){it.fn();},50);
    });
    pop.appendChild(d);
  });
  document.body.appendChild(pop);
  _positionPopMenu(pop,btn);
  _bindPopMenuClose('crFolderRowMenuPop',btn);
}
function renameCrFolderPrompt(folderId){
  var f=crFolders.find(function(x){return x.id===folderId;});
  if(!f)return;
  showInp('重命名文件夹','请输入文件夹名称',function(name){
    name=(name||'').trim();
    if(!name)return;
    _renameCrFolder(folderId,name);
    renderCrFolderDrawerList();
    if(_crFolderDetailCtx&&_crFolderDetailCtx.folderId===folderId){
      document.getElementById('crFolderDetailTitle').textContent=name;
    }
    showToast('已重命名');
  });
  setTimeout(function(){var el=document.getElementById('inpField');if(el)el.value=f.name||'';},120);
}
function deleteCrFolderConfirm(folderId){
  var f=crFolders.find(function(x){return x.id===folderId;});
  if(!f)return;
  showDlg('删除文件夹','确定要删除「'+esc(f.name||'未命名文件夹')+'」吗？文件夹内的作品不会被删除，会自动归入"未分类"。',function(){
    _deleteCrFolder(folderId);
    renderCrFolderDrawerList();
    showToast('已删除文件夹');
  },true);
}

// ---- 第二层：文件夹内作品列表（同时也是"选择小说弹窗"，可从这里把小说挪出/浏览） ----
var _crFolderDetailCtx=null; // {folderId}
function openCrFolderDetail(folderId){
  _crFolderDetailCtx={folderId:folderId};
  document.getElementById('crFolderDetailTitle').textContent=folderId?_crFolderName(folderId):'未分类';
  document.getElementById('crFolderDetailAddBtn').style.display=folderId?'':'none';
  renderCrFolderDetailList();
  document.getElementById('crFolderDetailOv').classList.add('show');
  document.getElementById('crFolderDetailPanel').classList.add('show');
  navPush('crFolderDetailOv');
}
function closeCrFolderDetail(){
  navPop('crFolderDetailOv');
  document.getElementById('crFolderDetailOv').classList.remove('show');
  document.getElementById('crFolderDetailPanel').classList.remove('show');
  _crFolderDetailCtx=null;
}
function renderCrFolderDetailList(){
  if(!_crFolderDetailCtx)return;
  var list=document.getElementById('crFolderDetailList');
  if(!list)return;
  var works=_crWorksInFolder(_crFolderDetailCtx.folderId);
  if(works.length===0){
    list.innerHTML='<div class="cr-fd-empty">这里还没有作品'+(_crFolderDetailCtx.folderId?'<br>点击右上角"+"添加':'')+'</div>';
    return;
  }
  var html='';
  works.forEach(function(w){
    var wc=getCrWordCount(w);
    html+='<div class="cr-fd-row" onclick="_crFolderDetailOpenWork(\''+w.id+'\')">'+
      '<span class="cr-card-badge '+w.type+'" style="flex-shrink:0">'+(w.type==='draft'?'草稿':'小说')+'</span>'+
      '<div class="cr-fd-worktitle"><b>'+esc(w.title||'无标题')+'</b><span>'+wc+'字</span></div>'+
      '<button class="cr-fd-more" onclick="event.preventDefault();event.stopPropagation();openCrFolderPicker(\''+w.id+'\')" title="移动到其他文件夹"><i class="fas fa-folder"></i></button>'+
      '</div>';
  });
  list.innerHTML=html;
}
function _crFolderDetailOpenWork(workId){
  closeCrFolderDetail();
  closeCrFolderDrawer();
  openEditor(workId);
}

// ---- 第三层：把其他文件夹（含未分类）里的作品添加进当前文件夹 ----
var _crFolderAddSearchVal='';
function openCrFolderAddPick(){
  if(!_crFolderDetailCtx||!_crFolderDetailCtx.folderId)return;
  _crFolderAddSearchVal='';
  var inp=document.getElementById('crFolderAddSearchInput');
  if(inp)inp.value='';
  var clearBtn=document.getElementById('crFolderAddSearchClear');
  if(clearBtn)clearBtn.style.display='none';
  renderCrFolderAddPickList();
  document.getElementById('crFolderAddPickOv').classList.add('show');
  document.getElementById('crFolderAddPickPanel').classList.add('show');
  navPush('crFolderAddPickOv');
}
function closeCrFolderAddPick(){
  navPop('crFolderAddPickOv');
  document.getElementById('crFolderAddPickOv').classList.remove('show');
  document.getElementById('crFolderAddPickPanel').classList.remove('show');
}
function _crFolderAddSearch(val){
  _crFolderAddSearchVal=String(val==null?'':val).trim().toLowerCase();
  var clearBtn=document.getElementById('crFolderAddSearchClear');
  if(clearBtn)clearBtn.style.display=_crFolderAddSearchVal?'flex':'none';
  renderCrFolderAddPickList();
}
function _crFolderAddSearchClear(){
  var inp=document.getElementById('crFolderAddSearchInput');
  if(inp)inp.value='';
  _crFolderAddSearch('');
}
function renderCrFolderAddPickList(){
  if(!_crFolderDetailCtx)return;
  // 注意：只重绘这个结果容器，绝不重绘上面的搜索输入框本身——否则每敲一个字输入框都会
  // 失焦，体验很差（和长图导出章节选择弹窗的_liRenderPickerList是同一个道理）
  var list=document.getElementById('crFolderAddPickList');
  if(!list)return;
  var curId=_crFolderDetailCtx.folderId;
  var others=crWorks.filter(function(w){return (w.folderId||'')!==curId;});
  if(_crFolderAddSearchVal){
    others=others.filter(function(w){return (w.title||'').toLowerCase().indexOf(_crFolderAddSearchVal)!==-1;});
  }
  if(others.length===0){
    list.innerHTML='<div class="cr-fd-empty">'+(_crFolderAddSearchVal?'没有匹配的作品':'没有其他可添加的作品了')+'</div>';
    return;
  }
  var html='';
  others.forEach(function(w){
    html+='<div class="cr-fd-row" onclick="_addCrWorkToCurFolder(\''+w.id+'\')">'+
      '<span class="cr-card-badge '+w.type+'" style="flex-shrink:0">'+(w.type==='draft'?'草稿':'小说')+'</span>'+
      '<div class="cr-fd-worktitle"><b>'+esc(w.title||'无标题')+'</b><span>当前：'+esc(_crFolderName(w.folderId))+'</span></div>'+
      '<i class="fas fa-plus cr-fd-icon" style="margin-left:auto"></i>'+
      '</div>';
  });
  list.innerHTML=html;
}
function _addCrWorkToCurFolder(workId){
  if(!_crFolderDetailCtx)return;
  moveCrWorkToFolder(workId,_crFolderDetailCtx.folderId);
  renderCrFolderAddPickList();
  renderCrFolderDetailList();
  renderCrFolderDrawerList();
}

// ---- 作品卡片"…"菜单里的"移动到文件夹"（复用分卷选择弹窗的视觉样式，保持交互一致） ----
var _crFolderPickWorkId=null;
function openCrFolderPicker(workId){
  _crFolderPickWorkId=workId;
  var w=crWorks.find(function(x){return x.id===workId;});
  if(!w)return;
  var curId=w.folderId||'';
  var listEl=document.getElementById('crFolderPickerList');
  if(!listEl)return;
  var html='<button class="col-fp-item'+(!curId?' selected':'')+'" onclick="pickCrFolderForWork(\'\')"><span>未分类</span>'+(!curId?'<i class="fas fa-check fp-check"></i>':'')+'</button>';
  crFolders.forEach(function(f){
    var sel=f.id===curId;
    html+='<button class="col-fp-item'+(sel?' selected':'')+'" onclick="pickCrFolderForWork(\''+f.id+'\')"><span>'+esc(f.name||'未命名文件夹')+'</span>'+(sel?'<i class="fas fa-check fp-check"></i>':'')+'</button>';
  });
  html+='<button class="col-fp-item" style="border-style:dashed;color:var(--accent2)" onclick="addCrFolderFromPicker()"><span><i class="fas fa-plus" style="font-size:10px"></i> 新建文件夹</span></button>';
  listEl.innerHTML=html;
  document.getElementById('crFolderPickerOv').classList.add('show');
  navPush('crFolderPickerOv');
}
function closeCrFolderPicker(){
  navPop('crFolderPickerOv');
  document.getElementById('crFolderPickerOv').classList.remove('show');
  _crFolderPickWorkId=null;
}
function pickCrFolderForWork(folderId){
  var workId=_crFolderPickWorkId;
  closeCrFolderPicker();
  if(!workId)return;
  moveCrWorkToFolder(workId,folderId);
  if(document.getElementById('crFolderDetailOv').classList.contains('show'))renderCrFolderDetailList();
  if(document.getElementById('crFolderDrawerOv').classList.contains('show'))renderCrFolderDrawerList();
}
function addCrFolderFromPicker(){
  var workId=_crFolderPickWorkId;
  closeCrFolderPicker();
  showInp('新建文件夹','请输入文件夹名称',function(name){
    name=(name||'').trim();
    if(!name)return;
    var newId=_createCrFolder(name);
    if(workId)moveCrWorkToFolder(workId,newId);
    if(document.getElementById('crFolderDetailOv').classList.contains('show'))renderCrFolderDetailList();
    if(document.getElementById('crFolderDrawerOv').classList.contains('show'))renderCrFolderDrawerList();
  });
}

// ==================== 收藏页文件夹 ====================
// 数据结构：cols.folders=[{id,name,createdAt}]；cols.books/cols.shorts的每一项用folderId记录所属文件夹
// （''或未设置=未分类）。长篇书架和短篇收藏共用同一套文件夹；因为book和short分属两个数组，
// 涉及具体某一项时一律用{kind:'book'|'short',id}两个值一起标识，避免两个数组里出现同id时认错对象。
// 删除文件夹≠删除作品：文件夹内的作品会自动变回"未分类"。
function _colFolderName(id){
  if(!id)return '未分类';
  var f=cols.folders.find(function(x){return x.id===id;});
  return f?(f.name||'未命名文件夹'):'未分类';
}
function _colWorksInFolder(folderId){
  var key=folderId||'';
  var books=cols.books.filter(function(b){return (b.folderId||'')===key;}).map(function(b){return {kind:'book',id:b.id,obj:b};});
  var shorts=cols.shorts.filter(function(s){return (s.folderId||'')===key;}).map(function(s){return {kind:'short',id:s.id,obj:s};});
  return books.concat(shorts);
}
function _createColFolder(name){
  var f={id:uid(),name:name,createdAt:new Date().toISOString()};
  cols.folders.push(f);
  sv(K.cols,cols);
  return f.id;
}
function _renameColFolder(id,name){
  var f=cols.folders.find(function(x){return x.id===id;});
  if(!f)return false;
  f.name=name;
  sv(K.cols,cols);
  return true;
}
function _deleteColFolder(id){
  var idx=cols.folders.findIndex(function(x){return x.id===id;});
  if(idx===-1)return false;
  cols.folders.splice(idx,1);
  cols.books.forEach(function(b){if(b.folderId===id)b.folderId='';});
  cols.shorts.forEach(function(s){if(s.folderId===id)s.folderId='';});
  sv(K.cols,cols);
  return true;
}
function moveColWorkToFolder(kind,itemId,folderId){
  var arr=kind==='short'?cols.shorts:cols.books;
  var it=arr.find(function(x){return x.id===itemId;});
  if(!it)return;
  it.folderId=folderId||'';
  sv(K.cols,cols);
  showToast(folderId?'已移动到「'+_colFolderName(folderId)+'」':'已移出文件夹，归入未分类');
}

// ---- 第一层：文件夹列表抽屉 ----
function openColFolderDrawer(){
  renderColFolderDrawerList();
  document.getElementById('colFolderDrawerOv').classList.add('show');
  document.getElementById('colFolderDrawerPanel').classList.add('show');
  navPush('colFolderDrawerOv');
}
function closeColFolderDrawer(){
  navPop('colFolderDrawerOv');
  document.getElementById('colFolderDrawerOv').classList.remove('show');
  document.getElementById('colFolderDrawerPanel').classList.remove('show');
}
function renderColFolderDrawerList(){
  var list=document.getElementById('colFolderDrawerList');
  if(!list)return;
  var uncatCount=_colWorksInFolder('').length;
  var html='<div class="cr-fd-row" onclick="openColFolderDetail(\'\')">'+
    '<i class="fas fa-inbox cr-fd-icon"></i><span class="cr-fd-name">未分类</span>'+
    '<span class="cr-fd-count">'+uncatCount+'</span></div>';
  cols.folders.forEach(function(f){
    var cnt=_colWorksInFolder(f.id).length;
    html+='<div class="cr-fd-row" data-folder-id="'+f.id+'" onclick="openColFolderDetail(\''+f.id+'\')">'+
      '<i class="fas fa-folder cr-fd-icon"></i><span class="cr-fd-name">'+esc(f.name||'未命名文件夹')+'</span>'+
      '<span class="cr-fd-count">'+cnt+'</span>'+
      '</div>';
  });
  if(cols.folders.length===0){
    html+='<div class="cr-fd-empty">还没有自建文件夹<br>点击下方"新建文件夹"创建</div>';
  }
  list.innerHTML=html;
  list.querySelectorAll('.cr-fd-row[data-folder-id]').forEach(function(row){
    _bindLongPress(row,function(){
      toggleColFolderRowMenu(row.getAttribute('data-folder-id'),row);
    });
  });
}
function promptCreateColFolder(){
  showInp('新建文件夹','请输入文件夹名称',function(name){
    name=(name||'').trim();
    if(!name)return;
    _createColFolder(name);
    renderColFolderDrawerList();
    showToast('已创建文件夹');
  });
}
function toggleColFolderRowMenu(folderId,btn){
  var old=document.getElementById('colFolderRowMenuPop');
  if(old){old.remove();return;}
  var pop=document.createElement('div');
  pop.id='colFolderRowMenuPop';
  pop.className='pop-glass-menu';
  pop.style.cssText='position:fixed;z-index:1400;width:132px;padding:6px;animation:fadeIn .15s ease';
  var items=[
    {icon:'fa-pen',text:'重命名',fn:function(){renameColFolderPrompt(folderId);}},
    {icon:'fa-trash-alt',text:'删除',fn:function(){deleteColFolderConfirm(folderId);},danger:true}
  ];
  items.forEach(function(it){
    var d=document.createElement('div');
    d.style.cssText='padding:10px 12px;font-size:12px;cursor:pointer;display:flex;align-items:center;gap:8px;color:'+(it.danger?'var(--danger)':'var(--text)')+';border-radius:8px;transition:background .15s;';
    d.innerHTML='<i class="fas '+it.icon+'" style="font-size:13px;width:14px;text-align:center"></i><span>'+it.text+'</span>';
    d.addEventListener('click',function(e){
      e.preventDefault();e.stopPropagation();
      _closePopMenu('colFolderRowMenuPop',btn);
      setTimeout(function(){it.fn();},50);
    });
    pop.appendChild(d);
  });
  document.body.appendChild(pop);
  _positionPopMenu(pop,btn);
  _bindPopMenuClose('colFolderRowMenuPop',btn);
}
function renameColFolderPrompt(folderId){
  var f=cols.folders.find(function(x){return x.id===folderId;});
  if(!f)return;
  showInp('重命名文件夹','请输入文件夹名称',function(name){
    name=(name||'').trim();
    if(!name)return;
    _renameColFolder(folderId,name);
    renderColFolderDrawerList();
    if(_colFolderDetailCtx&&_colFolderDetailCtx.folderId===folderId){
      document.getElementById('colFolderDetailTitle').textContent=name;
    }
    showToast('已重命名');
  });
  setTimeout(function(){var el=document.getElementById('inpField');if(el)el.value=f.name||'';},120);
}
function deleteColFolderConfirm(folderId){
  var f=cols.folders.find(function(x){return x.id===folderId;});
  if(!f)return;
  showDlg('删除文件夹','确定要删除「'+esc(f.name||'未命名文件夹')+'」吗？文件夹内的作品不会被删除，会自动归入"未分类"。',function(){
    _deleteColFolder(folderId);
    renderColFolderDrawerList();
    showToast('已删除文件夹');
  },true);
}

// ---- 第二层：文件夹内长篇+短篇列表（同时也是"选择小说弹窗"） ----
var _colFolderDetailCtx=null; // {folderId}
function openColFolderDetail(folderId){
  _colFolderDetailCtx={folderId:folderId};
  document.getElementById('colFolderDetailTitle').textContent=folderId?_colFolderName(folderId):'未分类';
  document.getElementById('colFolderDetailAddBtn').style.display=folderId?'':'none';
  renderColFolderDetailList();
  document.getElementById('colFolderDetailOv').classList.add('show');
  document.getElementById('colFolderDetailPanel').classList.add('show');
  navPush('colFolderDetailOv');
}
function closeColFolderDetail(){
  navPop('colFolderDetailOv');
  document.getElementById('colFolderDetailOv').classList.remove('show');
  document.getElementById('colFolderDetailPanel').classList.remove('show');
  _colFolderDetailCtx=null;
}
function renderColFolderDetailList(){
  if(!_colFolderDetailCtx)return;
  var list=document.getElementById('colFolderDetailList');
  if(!list)return;
  var items=_colWorksInFolder(_colFolderDetailCtx.folderId);
  if(items.length===0){
    list.innerHTML='<div class="cr-fd-empty">这里还没有作品'+(_colFolderDetailCtx.folderId?'<br>点击右上角"+"添加':'')+'</div>';
    list._colFolderItems=[];
    return;
  }
  var html='';
  items.forEach(function(it,idx){
    var isBook=it.kind==='book';
    var wc=isBook?getTotalWords(it.obj):countWords(it.obj.content||'');
    html+='<div class="cr-fd-row" onclick="_colFolderDetailOpenWork('+idx+')">'+
      '<span class="cr-card-badge '+(isBook?'novel':'draft')+'" style="flex-shrink:0">'+(isBook?'长篇':'短篇')+'</span>'+
      '<div class="cr-fd-worktitle"><b>'+esc(it.obj.title||'无标题')+'</b><span>'+wc+'字</span></div>'+
      '<button class="cr-fd-more" onclick="event.preventDefault();event.stopPropagation();openColFolderPicker(\''+it.kind+'\',\''+it.id+'\')" title="移动到其他文件夹"><i class="fas fa-folder"></i></button>'+
      '</div>';
  });
  list.innerHTML=html;
  list._colFolderItems=items; // 按索引取用，避免book/short两个数组可能出现的id重名歧义
}
function _colFolderDetailOpenWork(idx){
  var list=document.getElementById('colFolderDetailList');
  var items=list&&list._colFolderItems;
  if(!items||!items[idx])return;
  var obj=items[idx].obj;
  closeColFolderDetail();
  closeColFolderDrawer();
  openReading(obj);
}

// ---- 第三层：把其他文件夹（含未分类）里的长篇/短篇添加进当前文件夹 ----
var _colFolderAddSearchVal='';
function openColFolderAddPick(){
  if(!_colFolderDetailCtx||!_colFolderDetailCtx.folderId)return;
  _colFolderAddSearchVal='';
  var inp=document.getElementById('colFolderAddSearchInput');
  if(inp)inp.value='';
  var clearBtn=document.getElementById('colFolderAddSearchClear');
  if(clearBtn)clearBtn.style.display='none';
  renderColFolderAddPickList();
  document.getElementById('colFolderAddPickOv').classList.add('show');
  document.getElementById('colFolderAddPickPanel').classList.add('show');
  navPush('colFolderAddPickOv');
}
function closeColFolderAddPick(){
  navPop('colFolderAddPickOv');
  document.getElementById('colFolderAddPickOv').classList.remove('show');
  document.getElementById('colFolderAddPickPanel').classList.remove('show');
}
function _colFolderAddSearch(val){
  _colFolderAddSearchVal=String(val==null?'':val).trim().toLowerCase();
  var clearBtn=document.getElementById('colFolderAddSearchClear');
  if(clearBtn)clearBtn.style.display=_colFolderAddSearchVal?'flex':'none';
  renderColFolderAddPickList();
}
function _colFolderAddSearchClear(){
  var inp=document.getElementById('colFolderAddSearchInput');
  if(inp)inp.value='';
  _colFolderAddSearch('');
}
function renderColFolderAddPickList(){
  if(!_colFolderDetailCtx)return;
  // 只重绘结果容器，绝不重绘搜索输入框本身，避免每敲一个字输入框就失焦
  var list=document.getElementById('colFolderAddPickList');
  if(!list)return;
  var curId=_colFolderDetailCtx.folderId;
  var books=cols.books.filter(function(b){return (b.folderId||'')!==curId;}).map(function(b){return {kind:'book',id:b.id,obj:b};});
  var shorts=cols.shorts.filter(function(s){return (s.folderId||'')!==curId;}).map(function(s){return {kind:'short',id:s.id,obj:s};});
  var others=books.concat(shorts);
  if(_colFolderAddSearchVal){
    others=others.filter(function(it){return (it.obj.title||'').toLowerCase().indexOf(_colFolderAddSearchVal)!==-1;});
  }
  if(others.length===0){
    list.innerHTML='<div class="cr-fd-empty">'+(_colFolderAddSearchVal?'没有匹配的作品':'没有其他可添加的作品了')+'</div>';
    list._colFolderAddItems=[];
    return;
  }
  var html='';
  others.forEach(function(it,idx){
    var isBook=it.kind==='book';
    html+='<div class="cr-fd-row" onclick="_addColWorkToCurFolder('+idx+')">'+
      '<span class="cr-card-badge '+(isBook?'novel':'draft')+'" style="flex-shrink:0">'+(isBook?'长篇':'短篇')+'</span>'+
      '<div class="cr-fd-worktitle"><b>'+esc(it.obj.title||'无标题')+'</b><span>当前：'+esc(_colFolderName(it.obj.folderId))+'</span></div>'+
      '<i class="fas fa-plus cr-fd-icon" style="margin-left:auto"></i>'+
      '</div>';
  });
  list.innerHTML=html;
  list._colFolderAddItems=others;
}
function _addColWorkToCurFolder(idx){
  var list=document.getElementById('colFolderAddPickList');
  var items=list&&list._colFolderAddItems;
  if(!items||!items[idx]||!_colFolderDetailCtx)return;
  moveColWorkToFolder(items[idx].kind,items[idx].id,_colFolderDetailCtx.folderId);
  renderColFolderAddPickList();
  renderColFolderDetailList();
  renderColFolderDrawerList();
}

// ---- 作品卡片"…"菜单里的"移动到文件夹" ----
var _colFolderPickCtx=null; // {kind,id}
function openColFolderPicker(kind,itemId){
  _colFolderPickCtx={kind:kind,id:itemId};
  var arr=kind==='short'?cols.shorts:cols.books;
  var it=arr.find(function(x){return x.id===itemId;});
  if(!it)return;
  var curId=it.folderId||'';
  var listEl=document.getElementById('colFolderPickerList');
  if(!listEl)return;
  var html='<button class="col-fp-item'+(!curId?' selected':'')+'" onclick="pickColFolderForWork(\'\')"><span>未分类</span>'+(!curId?'<i class="fas fa-check fp-check"></i>':'')+'</button>';
  cols.folders.forEach(function(f){
    var sel=f.id===curId;
    html+='<button class="col-fp-item'+(sel?' selected':'')+'" onclick="pickColFolderForWork(\''+f.id+'\')"><span>'+esc(f.name||'未命名文件夹')+'</span>'+(sel?'<i class="fas fa-check fp-check"></i>':'')+'</button>';
  });
  html+='<button class="col-fp-item" style="border-style:dashed;color:var(--accent2)" onclick="addColFolderFromPicker()"><span><i class="fas fa-plus" style="font-size:10px"></i> 新建文件夹</span></button>';
  listEl.innerHTML=html;
  document.getElementById('colFolderPickerOv').classList.add('show');
  navPush('colFolderPickerOv');
}
function closeColFolderPicker(){
  navPop('colFolderPickerOv');
  document.getElementById('colFolderPickerOv').classList.remove('show');
  _colFolderPickCtx=null;
}
function pickColFolderForWork(folderId){
  var ctx=_colFolderPickCtx;
  closeColFolderPicker();
  if(!ctx)return;
  moveColWorkToFolder(ctx.kind,ctx.id,folderId);
  if(document.getElementById('colFolderDetailOv').classList.contains('show'))renderColFolderDetailList();
  if(document.getElementById('colFolderDrawerOv').classList.contains('show'))renderColFolderDrawerList();
}
function addColFolderFromPicker(){
  var ctx=_colFolderPickCtx;
  closeColFolderPicker();
  showInp('新建文件夹','请输入文件夹名称',function(name){
    name=(name||'').trim();
    if(!name)return;
    var newId=_createColFolder(name);
    if(ctx)moveColWorkToFolder(ctx.kind,ctx.id,newId);
    if(document.getElementById('colFolderDetailOv').classList.contains('show'))renderColFolderDetailList();
    if(document.getElementById('colFolderDrawerOv').classList.contains('show'))renderColFolderDrawerList();
  });
}

// ==================== EDITOR ====================
// ==================== 氛围写作 ====================
var ambienceMode=false;
var ambienceType=null;
// 用户可调参数（从localStorage恢复）
var ambienceVolumePct = parseInt(safeLS('get','bj_ambienceVol')||'100',10);
var ambienceEffectPct = parseInt(safeLS('get','bj_ambienceEffect')||'100',10);
var ambienceBgMode    = safeLS('get','bj_ambienceBgMode')||'builtin';
// 取消按钮状态
var _ambiCancelRevealed = false;
var _ambiCancelDragging = false;
var _ambiCancelPos = {x:16, y: window.innerHeight - 88 - 32}; // 初始位置
var ambienceTimerInterval=null;
var ambienceDetailTimeout=null;
var ambienceSecsLeft=0;
var ambienceTotalSecs=0;
var ambienceAudioMain=null;
var ambienceAudioDetail=null;
var ambienceAnimReq=null;
var ambienceSelectedMins=25;
var AMBIENCE_CFG={
  rainy:{
    bg:'./photos/rainy.jpg',
    main:'./music/Singing%20in%20Rainy.mp3',mainVol:0.50,
    detail:'./music/page%20turning%20book.wav',detailVol:0.38,detailLoop:false,
    effect:'rain'
  },
  coffee:{
    bg:'./photos/coffee%20shop.jpg',
    main:'./music/Coffee%20shop%20music.mp3',mainVol:0.38,
    detail:null,
    effect:'coffee'
  },
  forest:{
    bg:'./photos/forest.jpg',
    main:'./music/forest%20birds%20morning loop.mp3',mainVol:0.50,
    detail:'./music/wind%20leaves%20rustling.mp3',detailVol:0.30,detailLoop:false,
    effect:'forest'
  },
  snowy:{
    bg:'./photos/Snowy%20Cottage.jpg',
    main:'./music/blizzard%20wind outside.wav',mainVol:0.38,
    detail:'./music/fireplace%20crackling%20loop.mp3',detailVol:0.52,detailLoop:true,
    effect:'snow'
  },
  library:{
    bg:'./photos/library.jpg',
    main:'./music/Writing%20sound.wav',mainVol:0.32,
    detail:'./music/page%20turning%20book.wav',detailVol:0.35,detailLoop:false,
    effect:'none'
  }
};

function openAmbiencePanel(){
  // 氛围进行中，禁止重新开始，高亮取消按钮引导用户
  if(ambienceMode){
    showToast('氛围写作进行中，如需切换请先点左下角取消',2500);
    var cb=document.querySelector('.ambience-cancel-btn');
    if(cb){
      cb.style.transform='scale(1.18)';
      cb.style.boxShadow='0 0 0 5px rgba(255,80,80,.35),0 4px 20px rgba(200,50,50,.6)';
      cb.style.animation='none';
      setTimeout(function(){
        if(cb){
          cb.style.transform='';
          cb.style.boxShadow='';
          cb.style.animation='ambiCancelPulse 2.5s ease-in-out infinite';
        }
      },1400);
    }
    return;
  }
  ambienceType=null;
  ambienceSelectedMins=25;
  document.querySelectorAll('.ambience-type-btn').forEach(function(b){b.classList.remove('sel');});
  var chips=document.querySelectorAll('.ambience-time-chip');
  chips.forEach(function(c,i){c.classList.toggle('sel',i===0);});
  var ci=document.getElementById('ambienceCustomMin');
  if(ci)ci.value='';
  var sb=document.getElementById('ambienceStartBtn');
  if(sb){sb.disabled=true;sb.style.opacity='.45';}
  document.getElementById('ambiencePanelOv').classList.add('show');
}
function closeAmbiencePanel(){
  document.getElementById('ambiencePanelOv').classList.remove('show');
}
function selectAmbienceType(type){
  ambienceType=type;
  document.querySelectorAll('.ambience-type-btn').forEach(function(b){b.classList.remove('sel');});
  var btn=document.getElementById('at-'+type);
  if(btn)btn.classList.add('sel');
  _updateAmbienceStartBtn();
}
function selectAmbienceTime(mins,el){
  ambienceSelectedMins=mins;
  document.querySelectorAll('.ambience-time-chip').forEach(function(c){c.classList.remove('sel');});
  if(el)el.classList.add('sel');
  var ci=document.getElementById('ambienceCustomMin');
  if(ci)ci.value='';
  _updateAmbienceStartBtn();
}
function selectAmbienceTimeCustom(){
  var ci=document.getElementById('ambienceCustomMin');
  var v=parseInt(ci.value,10);
  if(v>0){
    ambienceSelectedMins=v;
    document.querySelectorAll('.ambience-time-chip').forEach(function(c){c.classList.remove('sel');});
  }else{
    ambienceSelectedMins=0;
  }
  _updateAmbienceStartBtn();
}
function _updateAmbienceStartBtn(){
  var sb=document.getElementById('ambienceStartBtn');
  if(!sb)return;
  var ok=!!(ambienceType&&ambienceSelectedMins>0);
  sb.disabled=!ok;
  sb.style.opacity=ok?'1':'.45';
}
function startAmbienceWriting(){
  if(!ambienceType){showToast('请先选择一种氛围');return;}
  if(!ambienceSelectedMins||ambienceSelectedMins<=0){showToast('请设置写作时长');return;}
  closeAmbiencePanel();

  // ── 防御性清理：确保所有旧状态彻底停止，不叠加 ──
  if(ambienceAnimReq){cancelAnimationFrame(ambienceAnimReq);ambienceAnimReq=null;}
  if(ambienceTimerInterval){clearInterval(ambienceTimerInterval);ambienceTimerInterval=null;}
  if(ambienceDetailTimeout){clearTimeout(ambienceDetailTimeout);ambienceDetailTimeout=null;}
  _fadeOutAndStopAudio(ambienceAudioMain);ambienceAudioMain=null;
  _fadeOutAndStopAudio(ambienceAudioDetail);ambienceAudioDetail=null;
  try{var cv=document.getElementById('ambienceCanvas');if(cv)cv.getContext('2d').clearRect(0,0,cv.width,cv.height);}catch(e){}

  var cfg=AMBIENCE_CFG[ambienceType];
  ambienceMode=true;
  ambienceTotalSecs=ambienceSelectedMins*60;
  ambienceSecsLeft=ambienceTotalSecs;

  var modal=document.getElementById('edModal');
  // 先全部清除，再精确添加当前类型的类名
  modal.classList.remove('ambience-rain','ambience-coffee','ambience-forest','ambience-snowy','ambience-library');
  modal.classList.add('ambience-mode');
  if(cfg.effect==='rain')  modal.classList.add('ambience-rain');
  if(cfg.effect==='coffee')modal.classList.add('ambience-coffee');
  if(cfg.effect==='forest')modal.classList.add('ambience-forest');
  if(cfg.effect==='snow')  modal.classList.add('ambience-snowy');

  // 根据用户设置决定背景图来源
  var bgEl=document.getElementById('ambienceBg');
  var crBgEl=document.getElementById('crBg');

  if(ambienceBgMode==='custom'){
    // 自定义模式：保留用户创作背景，隐藏内置背景图层
    if(bgEl){bgEl.dataset.ambiSaved=bgEl.style.backgroundImage||'';bgEl.style.backgroundImage='';}
    // crBg 保持原样，不动
    if(crBgEl) crBgEl.dataset.ambiSaved='__keep__';
    // 若用户根本没设置创作背景，自动降级为内置图
    var hasCrBg=crBgEl&&crBgEl.style.display!=='none'&&crBgEl.style.backgroundImage&&crBgEl.style.backgroundImage!=='none';
    if(!hasCrBg){
      if(bgEl)bgEl.style.backgroundImage='url('+cfg.bg+')';
    }
  }else{
    // 内置模式：显示内置背景，隐藏用户背景
    if(bgEl)bgEl.style.backgroundImage='url('+cfg.bg+')';
    if(crBgEl){crBgEl.dataset.ambiSaved=crBgEl.style.display;crBgEl.style.display='none';}
  }

  _initAmbienceCancelBtn();
  _startAmbienceAudio(cfg);
  _startAmbienceEffect(cfg.effect);
  _updateAmbienceTimerDisplay();
  ambienceTimerInterval=setInterval(_ambienceTick,1000);

  // 每种氛围有专属开场提示
  var msgs={
    rainy:'雨声淅沥，图书馆静谧，专心写 '+ambienceSelectedMins+' 分钟',
    coffee:'咖啡香气弥漫，惬意创作 '+ambienceSelectedMins+' 分钟',
    forest:'鸟鸣环绕、萤火微光，沉浸森林 '+ambienceSelectedMins+' 分钟',
    snowy:'壁炉噼啪作响，暴风雪之夜写 '+ambienceSelectedMins+' 分钟',
    library:'图书馆翻书声，静谧专注 '+ambienceSelectedMins+' 分钟'
  };
  showToast(msgs[ambienceType]||'氛围写作开始！专心写 '+ambienceSelectedMins+' 分钟',3000);
}

// 音频淡出停止辅助函数
function _fadeOutAndStopAudio(audio){
  if(!audio)return;
  try{
    var origVol=audio.volume;
    var steps=12,step=0;
    var fade=setInterval(function(){
      step++;
      try{
        if(!audio){clearInterval(fade);return;}
        audio.volume=Math.max(0,origVol*(1-step/steps));
        if(step>=steps){clearInterval(fade);try{audio.pause();}catch(e2){}}
      }catch(e){clearInterval(fade);}
    },40);
  }catch(e){try{audio.pause();}catch(e2){}}
}

function _startAmbienceAudio(cfg){
  // 主音频：淡入播放
  try{
    if(ambienceAudioMain){ambienceAudioMain.pause();ambienceAudioMain=null;}
    if(cfg.main){
      ambienceAudioMain=new Audio(cfg.main);
ambienceAudioMain.loop=true;
ambienceAudioMain.volume=0;
ambienceAudioMain.preload='auto';
var playPromise=ambienceAudioMain.play();
if(playPromise!==undefined){
  playPromise.catch(function(e){
    console.warn('氛围音频自动播放受限，需要用户手势触发：',e);
  });
}
      var targetVol=(cfg.mainVol||0.45)*(ambienceVolumePct/100);
      var step=0,fadeSteps=24;
      var fadeIn=setInterval(function(){
        step++;
        if(!ambienceAudioMain){clearInterval(fadeIn);return;}
        ambienceAudioMain.volume=Math.min(targetVol,targetVol*(step/fadeSteps));
        if(step>=fadeSteps)clearInterval(fadeIn);
      },50);
    }
  }catch(e){}

  // 细节音频：区分循环型（如壁炉）和随机型（如翻书）
  if(ambienceDetailTimeout){clearTimeout(ambienceDetailTimeout);ambienceDetailTimeout=null;}
  try{if(ambienceAudioDetail){ambienceAudioDetail.pause();ambienceAudioDetail=null;}}catch(e){}

  if(cfg.detail){
    if(cfg.detailLoop){
      // 连续循环的次级氛围音（如壁炉声）
      try{
        ambienceAudioDetail=new Audio(cfg.detail);
        ambienceAudioDetail.loop=true;
        ambienceAudioDetail.volume=0;
        ambienceAudioDetail.play().catch(function(){});
        var dv=(cfg.detailVol||0.4)*(ambienceVolumePct/100);
        var ds=0,dFadeSteps=20;
        var dFade=setInterval(function(){
          ds++;
          if(!ambienceAudioDetail){clearInterval(dFade);return;}
          ambienceAudioDetail.volume=Math.min(dv,dv*(ds/dFadeSteps));
          if(ds>=dFadeSteps)clearInterval(dFade);
        },60);
      }catch(e){}
    }else{
      // 随机偶发的细节音（如翻书声、风叶声）
      _scheduleAmbienceDetail(cfg.detail,cfg.detailVol||0.25);
    }
  }
}

function _scheduleAmbienceDetail(file,vol){
  if(!ambienceMode||!file)return;
  var v=(vol||0.25)*(ambienceVolumePct/100);
  // 随机间隔 15~55 秒，模拟真实环境中偶发的细节音
  var delay=(15+Math.random()*40)*1000;
  ambienceDetailTimeout=setTimeout(function(){
    if(!ambienceMode)return;
    try{
      if(ambienceAudioDetail){ambienceAudioDetail.pause();ambienceAudioDetail=null;}
      ambienceAudioDetail=new Audio(file);
      // 每次音量轻微随机，更自然真实
      ambienceAudioDetail.volume=v*(0.85+Math.random()*0.3);
      ambienceAudioDetail.play().catch(function(){});
      ambienceAudioDetail.onended=function(){
        ambienceAudioDetail=null;
        if(ambienceMode)_scheduleAmbienceDetail(file,v);
      };
    }catch(e){
      if(ambienceMode)_scheduleAmbienceDetail(file,v);
    }
  },delay);
}

// ── 雨滴特效：更多雨滴，自然随机感 ──
var _ambiRainDrops=[];
function _initRain(canvas){
  _ambiRainDrops=[];
   var rainCount=Math.round(130*(ambienceEffectPct/100));
  for(var i=0;i<rainCount;i++){
    _ambiRainDrops.push({
      x:Math.random()*canvas.width,
      y:Math.random()*canvas.height,
      len:9+Math.random()*18,
      spd:7+Math.random()*7,
      op:0.04+Math.random()*0.17,
      w:0.4+Math.random()*0.8
    });
  }
}
function _drawRain(canvas){
  var ctx=canvas.getContext('2d');
  ctx.clearRect(0,0,canvas.width,canvas.height);
  _ambiRainDrops.forEach(function(d){
    ctx.beginPath();
    ctx.strokeStyle='rgba(185,215,240,'+d.op+')';
    ctx.lineWidth=d.w;
    ctx.moveTo(d.x,d.y);
    ctx.lineTo(d.x+d.len*0.13,d.y+d.len);
    ctx.stroke();
    d.y+=d.spd;d.x+=d.spd*0.13;
    if(d.y>canvas.height+d.len){
      d.y=-d.len;d.x=Math.random()*canvas.width;
      // 落回顶部时重新随机化，避免整齐感
      d.spd=7+Math.random()*7;
      d.op=0.04+Math.random()*0.17;
    }
  });
}

// ── 雪花特效：自然摇摆，大小层次分明 ──
var _ambiSnowFlakes=[];
function _initSnow(canvas){
  _ambiSnowFlakes=[];
  var snowCount=Math.round(90*(ambienceEffectPct/100));
  for(var i=0;i<snowCount;i++){
    _ambiSnowFlakes.push({
      x:Math.random()*canvas.width,
      y:Math.random()*canvas.height,
      r:0.8+Math.random()*2.8,
      spd:0.35+Math.random()*1.3,
      drift:(Math.random()-.5)*0.7,
      op:0.35+Math.random()*0.55,
      wobble:Math.random()*Math.PI*2,
      wobbleSpd:0.008+Math.random()*0.025
    });
  }
}
function _drawSnow(canvas){
  var ctx=canvas.getContext('2d');
  ctx.clearRect(0,0,canvas.width,canvas.height);
  _ambiSnowFlakes.forEach(function(f){
    f.wobble+=f.wobbleSpd;
    // 叠加正弦波让雪花左右飘动，模拟真实雪落
    var curDrift=f.drift+0.5*Math.sin(f.wobble);
    ctx.beginPath();
    ctx.arc(f.x,f.y,f.r,0,Math.PI*2);
    ctx.fillStyle='rgba(255,255,255,'+f.op+')';
    ctx.fill();
    f.y+=f.spd;f.x+=curDrift;
    if(f.y>canvas.height+f.r){f.y=-f.r;f.x=Math.random()*canvas.width;}
    if(f.x>canvas.width+f.r)f.x=-f.r;
    if(f.x<-f.r)f.x=canvas.width+f.r;
  });
}

// ── 森林特效：树影光斑 + 萤火虫 ──
var _ambiForestSpots=[];
var _ambiFireflies=[];
function _initForest(canvas){
  _ambiForestSpots=[];
  var spotCount=Math.round(14*(ambienceEffectPct/100));
  for(var i=0;i<spotCount;i++){
    _ambiForestSpots.push({
      x:Math.random()*canvas.width,
      y:Math.random()*canvas.height,
      r:50+Math.random()*110,
      phase:Math.random()*Math.PI*2,
      spd:0.18+Math.random()*0.38,
      op:0.03+Math.random()*0.07,
      // 金黄/嫩绿两种光色，模拟林间碎光
      color:Math.random()>0.45?'255,238,150':'195,255,170'
    });
  }
  _ambiFireflies=[];
  var ffCount=Math.round(9*(ambienceEffectPct/100));
  for(var j=0;j<ffCount;j++){
    _ambiFireflies.push({
      x:Math.random()*canvas.width,
      y:canvas.height*0.25+Math.random()*canvas.height*0.65,
      phase:Math.random()*Math.PI*2,
      blinkSpd:0.025+Math.random()*0.045,
      vx:(Math.random()-.5)*0.45,
      vy:(Math.random()-.5)*0.28
    });
  }
}
function _drawForest(canvas){
  var ctx=canvas.getContext('2d');
  var t=Date.now()*.001;
  ctx.clearRect(0,0,canvas.width,canvas.height);
  // 树影碎光
  _ambiForestSpots.forEach(function(s){
    var op=s.op*(0.5+0.5*Math.sin(t*s.spd+s.phase));
    var dx=22*Math.sin(t*s.spd*.7+s.phase),dy=14*Math.cos(t*s.spd*.5+s.phase+1);
    var grd=ctx.createRadialGradient(s.x+dx,s.y+dy,0,s.x+dx,s.y+dy,s.r);
    grd.addColorStop(0,'rgba('+s.color+','+op+')');
    grd.addColorStop(1,'rgba('+s.color+',0)');
    ctx.beginPath();ctx.arc(s.x+dx,s.y+dy,s.r,0,Math.PI*2);ctx.fillStyle=grd;ctx.fill();
  });
  // 萤火虫
  _ambiFireflies.forEach(function(f){
    f.phase+=f.blinkSpd;
    var bright=Math.max(0,Math.sin(f.phase)*.5+.5);
    if(bright>0.08){
      var r=1.5+bright*2;
      // 外晕
      var grd=ctx.createRadialGradient(f.x,f.y,0,f.x,f.y,r*5);
      grd.addColorStop(0,'rgba(210,255,160,'+(bright*.8)+')');
      grd.addColorStop(0.45,'rgba(170,255,100,'+(bright*.35)+')');
      grd.addColorStop(1,'rgba(170,255,100,0)');
      ctx.beginPath();ctx.arc(f.x,f.y,r*5,0,Math.PI*2);ctx.fillStyle=grd;ctx.fill();
      // 亮核
      ctx.beginPath();ctx.arc(f.x,f.y,r,0,Math.PI*2);
      ctx.fillStyle='rgba(235,255,190,'+(bright*.92)+')';ctx.fill();
    }
    f.x+=f.vx;f.y+=f.vy;
    // 边界处理：超出画布则从对侧重新出现
    if(f.x<0)f.x=canvas.width;
    if(f.x>canvas.width)f.x=0;
    if(f.y<canvas.height*0.15){f.y=canvas.height*0.85;}
    if(f.y>canvas.height){f.y=canvas.height*0.25;}
  });
}

function _startAmbienceEffect(effect){
  var canvas=document.getElementById('ambienceCanvas');
  if(!canvas)return;
  // 先停掉旧动画帧，防止叠加
  if(ambienceAnimReq){cancelAnimationFrame(ambienceAnimReq);ambienceAnimReq=null;}
  canvas.width=window.innerWidth;
  canvas.height=window.innerHeight;
  if(effect==='rain'){
    _initRain(canvas);
    (function loop(){
      if(!ambienceMode)return;
      _drawRain(canvas);
      ambienceAnimReq=requestAnimationFrame(loop);
    }());
  }else if(effect==='snow'){
    _initSnow(canvas);
    (function loop(){
      if(!ambienceMode)return;
      _drawSnow(canvas);
      ambienceAnimReq=requestAnimationFrame(loop);
    }());
  }else if(effect==='forest'){
    _initForest(canvas);
    (function loop(){
      if(!ambienceMode)return;
      _drawForest(canvas);
      ambienceAnimReq=requestAnimationFrame(loop);
    }());
  }
  // 'coffee' 和 'none' 只靠背景图+CSS滤镜，无需canvas动画
}

function _ambienceTick(){
  if(!ambienceMode)return;
  ambienceSecsLeft--;
  _updateAmbienceTimerDisplay();
  if(ambienceSecsLeft<=0)_ambienceComplete();
}
function _updateAmbienceTimerDisplay(){
  var m=Math.floor(Math.max(0,ambienceSecsLeft)/60),s=Math.max(0,ambienceSecsLeft)%60;
  var str=(m<10?'0':'')+m+':'+(s<10?'0':'')+s;
  var el=document.getElementById('ambienceTimerFloat');
  if(el)el.textContent=str;
  var prog=document.getElementById('ambienceTimerProgress');
  if(prog){var pct=ambienceTotalSecs>0?(1-Math.max(0,ambienceSecsLeft)/ambienceTotalSecs)*100:100;prog.style.width=pct+'%';}
}
function _ambienceComplete(){
  var mins=Math.round(ambienceTotalSecs/60);
  _stopAmbienceMode();
  playRingForGoal();
  showDlg('写作完成！','太棒了！你坚持专注写作了 '+mins+' 分钟！\n\n每一次坚持都是成长，继续保持这份热情\n\n记得保存你的作品哦',function(){},false);
}
function cancelAmbienceMode(){
  showDlg('取消氛围写作','确定取消当前氛围写作计时吗？\n\n取消后可以正常退出写作页。',function(){
    _stopAmbienceMode();
    showToast('氛围写作已取消');
  },true);
}
function _stopAmbienceMode(){
  ambienceMode=false;
  ambienceType=null;
  if(ambienceTimerInterval){clearInterval(ambienceTimerInterval);ambienceTimerInterval=null;}
  if(ambienceDetailTimeout){clearTimeout(ambienceDetailTimeout);ambienceDetailTimeout=null;}
  if(ambienceAnimReq){cancelAnimationFrame(ambienceAnimReq);ambienceAnimReq=null;}
  // 音频淡出而非直接停止，体验更自然
  _fadeOutAndStopAudio(ambienceAudioMain);ambienceAudioMain=null;
  _fadeOutAndStopAudio(ambienceAudioDetail);ambienceAudioDetail=null;
  try{var c=document.getElementById('ambienceCanvas');if(c){c.getContext('2d').clearRect(0,0,c.width,c.height);}}catch(e){}
  try{
  var _canvas=document.getElementById('ambienceCanvas');
  if(_canvas){_canvas.width=_canvas.width;} // 强制重置canvas
}catch(e){}
  var modal=document.getElementById('edModal');
  modal.classList.remove('ambience-mode','ambience-rain','ambience-coffee','ambience-forest','ambience-snowy','ambience-library');
  // 恢复字体颜色
var edTa=document.getElementById('edTextarea');
if(edTa)edTa.style.color='';
  var bgEl2=document.getElementById('ambienceBg');
  if(bgEl2&&bgEl2.dataset.ambiSaved!==undefined){bgEl2.style.backgroundImage=bgEl2.dataset.ambiSaved;delete bgEl2.dataset.ambiSaved;}
  var crBgEl=document.getElementById('crBg');
  if(crBgEl&&crBgEl.dataset.ambiSaved!==undefined){
    if(crBgEl.dataset.ambiSaved!=='__keep__') crBgEl.style.display=crBgEl.dataset.ambiSaved;
    delete crBgEl.dataset.ambiSaved;
  }
  // 重置取消按钮状态
  if(typeof _ambiCancelAutoHideTimer!=='undefined'){
    clearTimeout(_ambiCancelAutoHideTimer);
    _ambiCancelAutoHideTimer=null;
  }
  try{clearTimeout(document.querySelector('.ambience-cancel-btn')._autoHideTimer);}catch(e){}
  _ambiCancelRevealed=false;
  _ambiCancelDragging=false;
  var cb=document.querySelector('.ambience-cancel-btn');
  if(cb){
    cb.classList.remove('revealed','dragging');
    cb.innerHTML='<i class="fas fa-times"></i>';
  }
}

// ── 取消按钮：半透明→点击展开→再点取消，可拖动 ──
// 用模块级变量存储自动收起计时器，避免 DOM 属性不稳定
var _ambiCancelAutoHideTimer=null;
function _initAmbienceCancelBtn(){
  var btn=document.querySelector('.ambience-cancel-btn');
  if(!btn)return;
clearTimeout(_ambiCancelAutoHideTimer);
_ambiCancelAutoHideTimer=null;
_ambiCancelRevealed=false;
_ambiCancelDragging=false;
btn.classList.remove('revealed','dragging');
btn.innerHTML='<i class="fas fa-times"></i>';
btn.style.left='16px';
btn.style.top='auto';
btn.style.bottom='88px';
  // 彻底清理旧状态
  clearTimeout(_ambiCancelAutoHideTimer);
  _ambiCancelAutoHideTimer=null;
  _ambiCancelRevealed=false;
  _ambiCancelDragging=false;
  btn.classList.remove('revealed','dragging');
  btn.innerHTML='<i class="fas fa-times"></i>';

  // 恢复上次拖动的位置
  var savedX=parseInt(localStorage.getItem('bj_ambiCancelX')||'16',10);
  var savedY=parseInt(localStorage.getItem('bj_ambiCancelY')||''+(window.innerHeight-120),10);
  btn.style.left=savedX+'px';
  btn.style.bottom='auto';
  btn.style.top=savedY+'px';

  // 自动收起：3秒后收回小圆圈
  function scheduleAutoHide(){
    clearTimeout(_ambiCancelAutoHideTimer);
    _ambiCancelAutoHideTimer=setTimeout(function(){
      if(!_ambiCancelRevealed)return;
      _ambiCancelRevealed=false;
      btn.classList.remove('revealed');
      btn.innerHTML='<i class="fas fa-times"></i>';
    },3000);
  }

  // 点击：展开 → 再点取消（用 onclick 赋值，避免重复绑定）
  btn.onclick=function(e){
    if(_ambiCancelDragging)return;
    if(!_ambiCancelRevealed){
      _ambiCancelRevealed=true;
      btn.classList.add('revealed');
      btn.innerHTML='<i class="fas fa-times"></i> 取消氛围';
      scheduleAutoHide();
    }else{
      clearTimeout(_ambiCancelAutoHideTimer);
      _ambiCancelAutoHideTimer=null;
      cancelAmbienceMode();
    }
    e.stopPropagation();
  };

  // 拖动逻辑：用克隆节点替换，彻底移除旧 touch 监听，防止累积
  var newBtn=btn.cloneNode(true);
  newBtn.onclick=btn.onclick;
  btn.parentNode.replaceChild(newBtn,btn);
  btn=newBtn;

  var dragStartX,dragStartY,btnStartX,btnStartY,moved=false;
  btn.addEventListener('touchstart',function(e){
    var t=e.touches[0];
    dragStartX=t.clientX;dragStartY=t.clientY;
    var r=btn.getBoundingClientRect();
    btnStartX=r.left;btnStartY=r.top;
    moved=false;
    _ambiCancelDragging=false;
    // 暂停自动收起，防止拖动时触发
    clearTimeout(_ambiCancelAutoHideTimer);
    _ambiCancelAutoHideTimer=null;
  },{passive:true});
  btn.addEventListener('touchmove',function(e){
    var t=e.touches[0];
    var dx=t.clientX-dragStartX,dy=t.clientY-dragStartY;
    if(!moved&&Math.sqrt(dx*dx+dy*dy)>6){
      moved=true;_ambiCancelDragging=true;
      btn.classList.add('dragging');
    }
    if(moved){
      e.preventDefault();
      var nx=Math.max(0,Math.min(window.innerWidth-50,btnStartX+dx));
      var ny=Math.max(0,Math.min(window.innerHeight-50,btnStartY+dy));
      btn.style.left=nx+'px';btn.style.top=ny+'px';btn.style.bottom='auto';
    }
  },{passive:false});
  btn.addEventListener('touchend',function(){
    if(moved){
      var r=btn.getBoundingClientRect();
      safeLS('set','bj_ambiCancelX',Math.round(r.left));
      safeLS('set','bj_ambiCancelY',Math.round(r.top));
    }
    setTimeout(function(){
      _ambiCancelDragging=false;
      btn.classList.remove('dragging');
      // 拖动结束后若处于展开态，重启自动收起计时
      if(_ambiCancelRevealed) scheduleAutoHide();
    },120);
  });
}

// ── 设置页：音量/特效/背景模式 ──
function applyAmbienceVolume(val){
  ambienceVolumePct=parseInt(val,10);
  localStorage.setItem('bj_ambienceVol',ambienceVolumePct);
  var el=document.getElementById('ambienceVolLabel');
  if(el)el.textContent=ambienceVolumePct+'%';
  // 实时应用到正在播放的音频
  var ratio=ambienceVolumePct/100;
  var cfg=ambienceType?AMBIENCE_CFG[ambienceType]:null;
  try{
    if(ambienceAudioMain&&cfg)ambienceAudioMain.volume=Math.min(1,Math.max(0,(cfg.mainVol||0.45)*ratio));
  }catch(e){}
  try{
    if(ambienceAudioDetail&&cfg&&!cfg.detailLoop)
      ambienceAudioDetail.volume=Math.min(1,Math.max(0,(cfg.detailVol||0.25)*ratio));
    if(ambienceAudioDetail&&cfg&&cfg.detailLoop)
      ambienceAudioDetail.volume=Math.min(1,Math.max(0,(cfg.detailVol||0.4)*ratio));
  }catch(e){}
}
function applyAmbienceEffect(val){
  ambienceEffectPct=parseInt(val,10);
  localStorage.setItem('bj_ambienceEffect',ambienceEffectPct);
  var el=document.getElementById('ambienceEffectLabel');
  if(el)el.textContent=ambienceEffectPct+'%';
  // 实时调整粒子数量（重启特效才能生效，此处仅保存值）
  // 如果氛围进行中，重启粒子特效
  if(ambienceMode&&ambienceType){
    var cfg=AMBIENCE_CFG[ambienceType];
    if(ambienceAnimReq){cancelAnimationFrame(ambienceAnimReq);ambienceAnimReq=null;}
    _startAmbienceEffect(cfg.effect);
  }
}
function setAmbienceBgMode(mode){
  ambienceBgMode=mode;
  localStorage.setItem('bj_ambienceBgMode',mode);
  // 高亮选中行
  ['builtin','custom'].forEach(function(m){
    var row=document.getElementById('ambienceBgMode'+m.charAt(0).toUpperCase()+m.slice(1)+'Row');
    if(row)row.style.borderColor=m===mode?'var(--accent)':'var(--border)';
  });
}
// 打开设置页时恢复控件状态
function _restoreAmbienceSettings(){
  var vs=document.getElementById('ambienceVolSlider');
  var vl=document.getElementById('ambienceVolLabel');
  var es=document.getElementById('ambienceEffectSlider');
  var el=document.getElementById('ambienceEffectLabel');
  if(vs){vs.value=ambienceVolumePct;if(vl)vl.textContent=ambienceVolumePct+'%';}
  if(es){es.value=ambienceEffectPct;if(el)el.textContent=ambienceEffectPct+'%';}
  var rb=document.getElementById('ambienceBg'+
    (ambienceBgMode==='custom'?'Custom':'Builtin'));
  if(rb)rb.checked=true;
  setAmbienceBgMode(ambienceBgMode);
}
// ==================== 编辑器折叠工具栏 ====================
function closeAllToolPanels(){
document.getElementById('toolOverlay').style.display='none';
try{
const ep=document.getElementById('edToolPanel');
if(ep)ep.classList.remove('open');
const et=document.getElementById('edToolToggle');
if(et){et.innerHTML='<i class="fas fa-tools"></i> 更多工具 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:12px;height:12px"><path d="M6 9l6 6 6-6"/></svg>';}
const eh=document.getElementById('edToolHint');
if(eh)eh.style.display='';
}catch(e){logError('op',e)}
try{
const rp=document.getElementById('rdToolPanel');
if(rp)rp.classList.remove('open');
rdToolOpen=false;
const rb=document.getElementById('rdToolToggle');
if(rb){rb.innerHTML='<i class="fas fa-tools"></i> 工具 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><path d="M6 9l6 6 6-6"/></svg>';}
}catch(e){logError('op',e)}
try{
const cp=document.getElementById('crToolPanel');
if(cp)cp.classList.remove('open');
const cb=document.getElementById('crToolToggle');
if(cb)cb.classList.remove('open');
}catch(e){logError('op',e)}
}

function showToolOverlay(){
document.getElementById('toolOverlay').style.display='block';
}
function toggleEdToolbar(){
var panel=document.getElementById('edToolPanel');
var btn=document.getElementById('edToolToggle');
var hint=document.getElementById('edToolHint');
var overlay=document.getElementById('toolOverlay');
if(!panel)return;
var isOpen=panel.classList.contains('open');
if(!isOpen){
panel.style.opacity='0';
panel.classList.add('open');
panel.offsetHeight;
setTimeout(function(){panel.style.opacity='';},20);
btn.innerHTML='<i class="fas fa-tools"></i> 收起工具 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:12px;height:12px;transform:rotate(180deg)"><path d="M6 9l6 6 6-6"/></svg>';
if(hint)hint.style.display='none';
if(overlay)overlay.style.display='none';
}else{
panel.classList.remove('open');
btn.innerHTML='<i class="fas fa-tools"></i> 更多工具 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:12px;height:12px"><path d="M6 9l6 6 6-6"/></svg>';
if(hint)hint.style.display='';
if(overlay)overlay.style.display='none';
}
}
// ==================== 创作编辑器 ====================
function openEditor(id){
var _edNeedsLoading=_needsLoadingAnim('editor');
if(_edNeedsLoading) showPageLoading();
const work=crWorks.find(w=>w.id===id);
if(!work)return;
try{document.getElementById('xjGlobalFloat').style.display='none';}catch(e){}
curEd=work;
curEdCh=0;
edUndoStack=[];
updateEdUndoBtn();
document.getElementById('edTitle').value=work.title||'';
if(work.type==='novel'){
document.getElementById('edChBar').style.display='flex';
document.getElementById('edTextarea').value=work.chapters[curEdCh]||'';
renderEdChBar();
}else{
document.getElementById('edChBar').style.display='none';
document.getElementById('edTextarea').value=work.content||'';
}
updateEdWc();
document.getElementById('edSaveStatus').textContent='已保存';
try{document.getElementById('edOutlineBtnNew').style.display=(work.outline?'flex':'none');}catch(e){logError('op',e)}
try{document.getElementById('edChOutlineBtnNew').style.display=(work.type==='novel'?'flex':'none');}catch(e){logError('op',e)}
try{document.getElementById('edRenameBtnNew').style.display=(work.type==='novel'?'flex':'none');}catch(e){logError('op',e)}
// 草稿没有"章节"概念，这一整组功能本质是一样的（保存/管理/删除），只是文案换成"草稿"更贴切
try{document.getElementById('edChGroupTitle').innerHTML=work.type==='novel'?'<i class="fas fa-tasks"></i> 章节管理':'<i class="fas fa-tasks"></i> 草稿管理';}catch(e){logError('op',e)}
try{document.getElementById('edSaveVerDesc').textContent=work.type==='novel'?'保存当前章为一个版本':'保存当前草稿为一个版本';}catch(e){logError('op',e)}
try{document.getElementById('edDelChLabel').textContent=work.type==='novel'?'删除本章':'删除草稿';}catch(e){logError('op',e)}
// 草稿没有"章节"概念，保留单一的"复制全文"；我的小说细分成"复制本章"/"复制全书"两个按钮
try{document.getElementById('edCopyAllBtn').style.display=(work.type==='novel'?'none':'flex');}catch(e){logError('op',e)}
try{document.getElementById('edCopyChBtn').style.display=(work.type==='novel'?'flex':'none');}catch(e){logError('op',e)}
try{document.getElementById('edCopyBookBtn').style.display=(work.type==='novel'?'flex':'none');}catch(e){logError('op',e)}
applyCrBg();
try{document.getElementById('edToolPanel').classList.remove('open');}catch(e){logError('op',e)}
try{document.getElementById('edToolToggle').innerHTML='<i class="fas fa-tools"></i> 更多工具 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:12px;height:12px"><path d="M6 9l6 6 6-6"/></svg>';}catch(e){logError('op',e)}
try{document.getElementById('edToolHint').style.display='';}catch(e){logError('op',e)}
document.getElementById('edModal').classList.add('show');
document.getElementById('edModal').style.overscrollBehavior='contain';
navPush('edModal');
loadEdWriteSettings();
// 启动自动保存
   if(autoSaveInterval) clearInterval(autoSaveInterval);
   autoSaveInterval = setInterval(() => {
       if(curEd) {
           const statusEl=document.getElementById('edSaveStatus');
           if(statusEl&&statusEl.textContent==='编辑中...'){
               saveEditorContent();
           }
       }
   }, 8000);
// 键盘弹出时动态适配高度（兼容安卓）
var edTa = document.getElementById('edTextarea');
if(edTa){
  edTa.addEventListener('focus', function(){
    setTimeout(function(){
      edTa.scrollIntoView({behavior:'smooth', block:'center'});
    }, 300);
  });
}
if(window.visualViewport){
  var _vpHandler=function(){
    var edBody=document.getElementById('edModal');
    if(!edBody||!edBody.classList.contains('show'))return;
    var kbHeight=window.innerHeight-window.visualViewport.height;
    edBody.style.paddingBottom=kbHeight>50?(kbHeight+'px'):'';
  };
  window.visualViewport.addEventListener('resize',_vpHandler);
  window.visualViewport.addEventListener('scroll',_vpHandler);
}
if(_edNeedsLoading) hidePageLoading();
document.getElementById('bnav').classList.add('hide');
}
function closeEditor(){
if(ambienceMode){
  showToast('⏳ 氛围写作计时中，请先点左下角按钮取消氛围模式再离开');
  // 高亮取消按钮提示用户
  var _cb=document.querySelector('.ambience-cancel-btn');
  if(_cb){
    _cb.style.transform='scale(1.3)';
    setTimeout(function(){if(_cb)_cb.style.transform='';},600);
  }
  return;
}
if(document.getElementById('edModal').classList.contains('ed-read-mode')){closeEdReadMode();}
// 检查未保存修改
const currentText=document.getElementById('edTextarea').value||'';
let savedText='';
if(curEd){
if(curEd.type==='novel'&&curEd.chapters){savedText=curEd.chapters[curEdCh]||'';}
else{savedText=curEd.content||'';}
}
if(edExitConfirm&&currentText!==savedText&&currentText.length>0){
showDlg('未保存的修改','你还有修改没保存呢！\n\n选择「保存并离开」星笺会帮你保存，选「放弃」则丢弃修改。',function(){
saveEditorContent();
_doCloseEditor();
});
// 修改按钮文字
setTimeout(function(){
var okBtn=document.getElementById('dlgOkBtn');
if(okBtn)okBtn.textContent='保存并离开';
var msgEl=document.getElementById('dlgMsg');
if(msgEl){
msgEl.innerHTML+='<div style="margin-top:12px"><button onclick="closeDlg();_doCloseEditor()" style="width:100%;padding:10px;border-radius:10px;border:1px solid rgba(255,107,107,.3);background:transparent;color:var(--danger);font-size:12px;cursor:pointer">放弃修改并离开</button></div>';
}
},50);
return;
}
saveEditorContent();
_doCloseEditor();
}
function _doCloseEditor(){
  navPop('edModal');
  if(document.getElementById('edModal').classList.contains('ed-read-mode')){closeEdReadMode();}
  if(autoSaveInterval){clearInterval(autoSaveInterval);autoSaveInterval=null;}
  saveEditorContent();
  document.getElementById('edModal').classList.remove('show');
  document.getElementById('bnav').classList.remove('hide');
  curEd=null;
  try{if(!document.querySelector('.pg.act#pg-settings'))document.getElementById('xjGlobalFloat').style.display='';}catch(e){}
  renderCrList();
}
function renderEdChBar(){
if(!curEd||curEd.type!=='novel')return;
const total=curEd.chapters.length;
if(!curEd.chNames)curEd.chNames=[];
const chName=curEd.chNames[curEdCh]||'';
const displayName=chName?'第'+(curEdCh+1)+'章 '+chName:'第'+(curEdCh+1)+'章';
document.getElementById('edChCurrent').textContent=displayName+' / 共'+total+'章';
document.getElementById('edPrevBtn').style.display=curEdCh>0?'':'none';
document.getElementById('edNextBtn').style.display=curEdCh<total-1?'':'none';
}
function openEdChList(preserveExpand){
if(!curEd||curEd.type!=='novel')return;
if(!preserveExpand)_chCatalogExpanded={}; // 重新打开目录：所有分卷/未分卷默认折叠
saveEditorChapter();
const total=curEd.chapters.length;
let totalWords=0;
curEd.chapters.forEach(ch=>totalWords+=countWords(ch||''));
document.getElementById('edChPanelTitle').textContent='「'+(curEd.title||'未命名')+'」';
document.getElementById('edChPanelInfo').textContent='共 '+total+' 章 · '+totalWords+' 字';
const list=document.getElementById('edChPanelList');
_renderChListGrouped(curEd,list,function(i){
const ch=curEd.chapters[i];
const wc=countWords(ch||'');
const preview=(ch||'').replace(/\n/g,' ').substring(0,30);
const hasOutline=curEd.chOutlines&&curEd.chOutlines[i];
const item=document.createElement('div');
item.className='ch-item'+(i===curEdCh?' act':'');
item.dataset.chIdx=i;
item.setAttribute('draggable','false'); // 用touch手动处理
item.innerHTML=
'<span class="ch-drag-handle" data-drag="'+i+'">☰</span>'+
'<span class="ch-item-num" style="width:auto;max-width:100px;flex-shrink:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">第'+(i+1)+'章'+(curEd.chNames&&curEd.chNames[i]?' '+esc(curEd.chNames[i]):'')+'</span>'+
'<span style="flex:1;font-size:11px;color:var(--text2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+esc(preview||'空白章节')+'</span>'+
'<span class="ch-item-wc" style="flex-shrink:0">'+wc+'字'+(hasOutline?' <i class="fas fa-clipboard-list"></i>':'')+'</span>';
item.onclick=function(e){
if(e.target.closest('.ch-drag-handle'))return;
curEdCh=i;
document.getElementById('edTextarea').value=curEd.chapters[i]||'';
updateEdWc();
renderEdChBar();
closeEdChList();
};
_bindChItemLongPressDelete(item,function(){openChAction(curEd,i);});
return item;
},_chCatalogExpanded);
// 绑定触摸拖拽排序
bindEdChDragSort(list);
requestAnimationFrame(function(){
document.getElementById('edChOv').classList.add('show');
navPush('edChOv');
});
}
// ==================== 编辑器章节拖拽排序 ====================
function bindEdChDragSort(listEl){
  var dragIdx=-1;
  var dragEl=null;
  var placeholder=null;
  var startY=0;
  var items=[];
  var moved=false;

  listEl.querySelectorAll('.ch-drag-handle').forEach(function(handle){
    var lpTimer=null;
    handle.addEventListener('touchstart',function(e){
      e.preventDefault();
      moved=false;
      startY=e.touches[0].clientY;
      var item=handle.closest('.ch-item');
      dragIdx=parseInt(handle.dataset.drag);
      lpTimer=setTimeout(function(){
        if(moved)return;
        dragEl=item;
        dragEl.classList.add('dragging');
        try{if(navigator.vibrate)navigator.vibrate(30);}catch(e){}
        // 拖拽候选范围限定在同一个分卷分组内（同 dataset.vol）：卷内章节可以不连续，
        // 允许跨组拖拽会导致"拖到别的卷区域，但分卷归属没变"这种视觉上说不通的结果——
        // 跨卷移动请用长按菜单里的"移动到分卷"，这里只负责组内顺序调整
        items=Array.from(listEl.querySelectorAll('.ch-item')).filter(function(it){return it.dataset.vol===item.dataset.vol;});
      },150);
    },{passive:false});

    handle.addEventListener('touchmove',function(e){
      e.preventDefault();
      var dy=Math.abs(e.touches[0].clientY-startY);
      if(dy>5)moved=true;
      if(!dragEl)return;
      var touchY=e.touches[0].clientY;
      items.forEach(function(it){
        it.classList.remove('drag-over');
        var rect=it.getBoundingClientRect();
        var midY=rect.top+rect.height/2;
        if(touchY>rect.top&&touchY<rect.bottom&&it!==dragEl){
          if(touchY<midY){
            it.classList.add('drag-over');
          }
        }
      });
    },{passive:false});

    handle.addEventListener('touchend',function(e){
      clearTimeout(lpTimer);
      if(!dragEl){return;}
      var touchY=e.changedTouches[0].clientY;
      var targetIdx=-1;
      items.forEach(function(it,idx2){
        it.classList.remove('drag-over');
        var rect=it.getBoundingClientRect();
        if(touchY>rect.top&&touchY<rect.bottom&&it!==dragEl){
          targetIdx=parseInt(it.dataset.chIdx);
        }
      });
      dragEl.classList.remove('dragging');

      if(targetIdx>=0&&targetIdx!==dragIdx&&curEd&&curEd.chapters){
        // 版本历史要在chapters本身被splice之前搬移，此时chapters.length还是搬移前的章节总数（搬移不改变总数）
        _moveChapterVersions(curEd.id,dragIdx,targetIdx,curEd.chapters.length);
        // 执行章节交换
        var ch=curEd.chapters.splice(dragIdx,1)[0];
        curEd.chapters.splice(targetIdx,0,ch);
        // 同步章节名
        if(curEd.chNames){
          var nm=curEd.chNames.splice(dragIdx,1)[0];
          curEd.chNames.splice(targetIdx,0,nm);
        }
        // 同步章节大纲
        if(curEd.chOutlines){
          var ol=curEd.chOutlines.splice(dragIdx,1)[0];
          curEd.chOutlines.splice(targetIdx,0,ol);
        }
        // 同步章节大纲标签
        if(curEd.chOutlineTags){
          var tg=curEd.chOutlineTags.splice(dragIdx,1)[0];
          curEd.chOutlineTags.splice(targetIdx,0,tg);
        }
        // 同步章节大纲修改时间
        if(curEd.chOutlineUpdatedAt){
          var ut=curEd.chOutlineUpdatedAt.splice(dragIdx,1)[0];
          curEd.chOutlineUpdatedAt.splice(targetIdx,0,ut);
        }
        // 同步章节摘要
        if(curEd.chSummaries){
          var sm=curEd.chSummaries.splice(dragIdx,1)[0];
          curEd.chSummaries.splice(targetIdx,0,sm);
        }
        // 同步章节所属分卷（拖拽范围本身已限定在同一分卷内，这里的搬移不会改变分卷归属，只是保持索引对齐）
        if(curEd.chVolume){
          var vl=curEd.chVolume.splice(dragIdx,1)[0];
          curEd.chVolume.splice(targetIdx,0,vl);
        }
        // 更新当前编辑章节索引
        if(curEdCh===dragIdx){
          curEdCh=targetIdx;
        }else if(dragIdx<curEdCh&&targetIdx>=curEdCh){
          curEdCh--;
        }else if(dragIdx>curEdCh&&targetIdx<=curEdCh){
          curEdCh++;
        }
        document.getElementById('edTextarea').value=curEd.chapters[curEdCh]||'';
        updateEdWc();
        renderEdChBar();
        saveEditorContent();
        // 重新渲染目录
        closeEdChList();
        openEdChList(true);
        showToast('章节已移动');
      }

      dragEl=null;
      dragIdx=-1;
    });

    handle.addEventListener('touchcancel',function(){
      clearTimeout(lpTimer);
      if(dragEl)dragEl.classList.remove('dragging');
      items.forEach(function(it){it.classList.remove('drag-over');});
      dragEl=null;dragIdx=-1;
    });
  });
}
function closeEdChList(){
  navPop('edChOv');
document.getElementById('edChOv').classList.remove('show');
}
function goEdPrevCh(){
if(!curEd||curEdCh<=0)return;
saveEditorContent();
curEdCh--;
document.getElementById('edTextarea').value=curEd.chapters[curEdCh]||'';
updateEdWc();
renderEdChBar();
}
function goEdNextCh(){
if(!curEd||curEdCh>=curEd.chapters.length-1)return;
saveEditorChapter();
saveEditorContent();
curEdCh++;
document.getElementById('edTextarea').value=curEd.chapters[curEdCh]||'';
updateEdWc();
renderEdChBar();
}
function addEdChapter(){
if(!curEd)return;
saveEditorChapter();
curEd.chapters.push('');
if(!curEd.chOutlines)curEd.chOutlines=[];
curEd.chOutlines.push('');
if(!curEd.chVolume)curEd.chVolume=[];
curEd.chVolume.push(''); // 新章节默认未分卷
curEdCh=curEd.chapters.length-1;
document.getElementById('edTextarea').value='';
updateEdWc();
renderEdChBar();
saveEditorContent();
closeEdChList();
// 记录新增章节到创作目标
recordManualWrite(0,1);
showToast('已添加第'+curEd.chapters.length+'章');
}
function saveEditorChapter(){
if(!curEd)return;
const text=document.getElementById('edTextarea').value;
if(curEd.type==='novel'){
if(curEd.chapters[curEdCh]!==undefined)curEd.chapters[curEdCh]=text;
}else{
curEd.content=text;
}
}
// ==================== 编辑器撤回功能 ====================
let edUndoStack=[];
const ED_UNDO_MAX=30;

// text/ch 可以显式传入"要记住的状态"；不传时退回到读取当前文本框（适合在改动发生前主动调用的场景，
// 比如useVersion切换版本前调用edPushUndo()，此时文本框里还是改动前的旧内容）
function edPushUndo(text,ch){
if(!curEd)return;
const snapshot={
ch: ch!==undefined ? ch : curEdCh,
text: text!==undefined ? text : (document.getElementById('edTextarea').value||''),
time:Date.now()
};
// 避免重复记录（内容一样不记）
if(edUndoStack.length>0){
const last=edUndoStack[edUndoStack.length-1];
if(last.text===snapshot.text&&last.ch===snapshot.ch)return;
}
edUndoStack.push(snapshot);
if(edUndoStack.length>ED_UNDO_MAX)edUndoStack.shift();
updateEdUndoBtn();
}

function edUndo(){
if(edUndoStack.length===0){showToast('没有可撤回的操作');return;}
const snapshot=edUndoStack.pop();
if(curEd&&curEd.type==='novel'&&snapshot.ch!==curEdCh){
// 切换到对应章节
curEdCh=snapshot.ch;
renderEdChBar();
}
document.getElementById('edTextarea').value=snapshot.text;
onEditorInput();
updateEdUndoBtn();
showToast('已撤回 ↩');
}

function updateEdUndoBtn(){
const btn=document.getElementById('edUndoBtnNew');
if(!btn)return;
btn.style.opacity=edUndoStack.length>0?'1':'0.5';
btn.title=edUndoStack.length+'步可撤回';
}
function saveEditorContent(){
if(!curEd)return;
// 只在内容确实变化时才推入撤回栈；入栈的是"变化前"的旧文本，这样点撤回才能真正回到变化之前，
// 而不是把刚发生的这次改动原样再存一遍（那样撤回第一下会是个看不出效果的空操作）
var _curText=document.getElementById('edTextarea').value||'';
var _savedText='';
if(curEd.type==='novel'&&curEd.chapters){_savedText=curEd.chapters[curEdCh]||'';}
else{_savedText=curEd.content||'';}
if(_curText!==_savedText) edPushUndo(_savedText,curEdCh);
// 记录保存前的字数（用于计算增量）
let oldWc=0;
const oldWork=crWorks.find(w=>w.id===curEd.id);
if(oldWork){
if(oldWork.type==='novel'&&oldWork.chapters){
oldWork.chapters.forEach(ch=>oldWc+=countWords(ch||''));
}else{oldWc=countWords(oldWork.content||'');}
}
saveEditorChapter();
const edTitleEl=document.getElementById('edTitle'); curEd.title=edTitleEl?(edTitleEl.value||'').trim():(curEd.title||'');
curEd.updatedAt=new Date().toISOString();
const idx=crWorks.findIndex(w=>w.id===curEd.id);
if(idx>-1)crWorks[idx]=curEd;
sv('bj_crWorks',crWorks);
const edStatusEl=document.getElementById('edSaveStatus'); if(edStatusEl)edStatusEl.textContent='已保存';
try{var s2b=document.getElementById('edSaveStatus2');if(s2b)s2b.textContent='已保存';}catch(e){}
// 计算新增字数，记录到创作目标
let newWc=0;
if(curEd.type==='novel'&&curEd.chapters){
curEd.chapters.forEach(ch=>newWc+=countWords(ch||''));
}else{newWc=countWords(curEd.content||'');}
const addedWords=newWc-oldWc;
if(addedWords>10){
recordManualWrite(addedWords,0);
}
}
let _edWcTimer = null;
function toggleEdFooter(e){
var footer=document.getElementById('edFooter');
if(!footer)return;
if(footer.classList.contains('expanded')){
footer.classList.remove('expanded');
}else{
footer.classList.add('expanded');
// 点击其他区域自动收起
setTimeout(function(){
var handler=function(ev){
if(!footer.contains(ev.target)){
footer.classList.remove('expanded');
document.removeEventListener('click',handler);
document.removeEventListener('touchstart',handler);
}
};
document.addEventListener('click',handler);
document.addEventListener('touchstart',handler);
},50);
}
e.stopPropagation();
}
// 记录光标位置：手机浏览器点击工具栏按钮（比如Markdown格式化按钮）时，输入框会先失焦，
// 部分移动端浏览器一失焦selectionStart/selectionEnd就会被重置成0，导致后续插入操作全部落在文本最开头，
// 跟光标实际停在哪完全没关系。这里持续记录"最后一次在输入框里的光标位置"，工具栏按钮点击时如果发现
// 输入框已经不是当前焦点（说明selectionStart可能已经不可信了），就改用这个记住的位置。
let _edLastSelStart=0;
let _edLastSelEnd=0;
function _edTrackSelection(){
const ta=document.getElementById('edTextarea');
if(!ta)return;
_edLastSelStart=ta.selectionStart;
_edLastSelEnd=ta.selectionEnd;
}
function _edGetSelection(){
const ta=document.getElementById('edTextarea');
if(document.activeElement===ta){
// 输入框仍然是当前焦点，selectionStart/End绝对可信，直接用
return {start:ta.selectionStart, end:ta.selectionEnd};
}
// 输入框已经失焦（比如刚点了工具栏按钮），改用之前记住的位置
return {start:_edLastSelStart, end:_edLastSelEnd};
}

function onEditorInput(){
    _edTrackSelection();
    // 字数统计用200ms防抖，避免每次按键都计算
    if(_edWcTimer) clearTimeout(_edWcTimer);
    _edWcTimer = setTimeout(updateEdWc, 400);
    
    const statusEl=document.getElementById('edSaveStatus');
    if(statusEl)statusEl.textContent='编辑中...';
    try{var s2c=document.getElementById('edSaveStatus2');if(s2c)s2c.textContent='编辑中...';}catch(e){}
    if(edAutoSaveTimer)clearTimeout(edAutoSaveTimer);
    edAutoSaveTimer=setTimeout(()=>{
        saveEditorContent();
        const s2=document.getElementById('edSaveStatus');
        if(s2)s2.textContent=autoSaveToast?'已自动保存 ✓':'已保存';
        try{var s2d=document.getElementById('edSaveStatus2');if(s2d)s2d.textContent='已自动保存 ✓';}catch(e){}
    },3000);
}
// ==================== 写作排版设置 ====================
let edFontSize=ld('bj_edFontSize',15);
let edLineHeight=ld('bj_edLineHeight',2);
let edLetterSpacing=ld('bj_edLetterSpacing',0);

// ==================== 自动排版·排版规则 ====================
// 默认值刻意贴合原来formatEditorText固定写死的行为（不缩进/段间空一行/清除多余空行），
// 这样老用户升级后第一次点"自动排版"效果和以前完全一样，不会有突兀的变化
let edFmtIndentOn=ld('bj_edFmtIndentOn',false);
let edFmtIndentChars=ld('bj_edFmtIndentChars',2);
let edFmtBlankMode=ld('bj_edFmtBlankMode','blank');// 'none'|'skip'|'blank'|'blank-indent'
let edFmtClearExtra=ld('bj_edFmtClearExtra',true);

function toggleEdWriteSettings(){
const el=document.getElementById('edWriteSettings');
if(el)el.classList.toggle('show');
}

function setEdFont(v){
v=parseInt(v);
edFontSize=v;
sv('bj_edFontSize',v);
document.getElementById('edFontVal').textContent=v;
applyEdWriteStyle();
}

function setEdLine(v){
v=parseFloat(v);
edLineHeight=v;
sv('bj_edLineHeight',v);
document.getElementById('edLineVal').textContent=v.toFixed(1);
applyEdWriteStyle();
}

function setEdLetterSpacing(v){
v=parseFloat(v);
edLetterSpacing=v;
sv('bj_edLetterSpacing',v);
document.getElementById('edLsVal').textContent=v;
applyEdWriteStyle();
}

function applyEdWriteStyle(){
const ta=document.getElementById('edTextarea');
if(!ta)return;
ta.style.setProperty('--ed-fontsize',edFontSize+'px');
ta.style.setProperty('--ed-lineheight',edLineHeight);
ta.style.setProperty('--ed-letterspacing',edLetterSpacing+'px');
// 字号/行高/字距会改变每行能容纳的字数，从而改变 scrollHeight——用 requestAnimationFrame
// 等浏览器按新样式重新排完版再同步滚动条，不然读到的还是改样式前的旧高度
try{requestAnimationFrame(function(){_edSyncCustomScrollbar();});}catch(e){}
}

function loadEdWriteSettings(){
edFontSize=ld('bj_edFontSize',ap.rdFontSize||15);
edLineHeight=ld('bj_edLineHeight',ap.rdLineHeight||2);
edLetterSpacing=ld('bj_edLetterSpacing',0);
try{
document.getElementById('edFontVal').textContent=edFontSize;
document.getElementById('edLineVal').textContent=edLineHeight.toFixed(1);
document.getElementById('edLsVal').textContent=edLetterSpacing;
const ranges=document.querySelectorAll('#edWriteSettings input[type=range]');
if(ranges[0])ranges[0].value=edFontSize;
if(ranges[1])ranges[1].value=edLineHeight;
if(ranges[2])ranges[2].value=edLetterSpacing;
}catch(e){logError('op',e)}
applyEdWriteStyle();
}
function updateEdWc(){
const ta=document.getElementById('edTextarea');
if(!ta)return;
// 内容变化后顺带同步一下自定义滚动条的滑块高度/位置（内容变长变短都会影响 scrollHeight）。
// updateEdWc() 几乎在每个"文本框内容被改动"的地方都会被调用（打字、切章、AI改写、格式化…），
// 放在这一个函数里统一同步，不用去每个改动内容的地方都补一遍
try{_edSyncCustomScrollbar();}catch(e){}
const text=ta.value||'';
const wc=countWords(text);
const wcEl=document.getElementById('edWc');
if(!wcEl)return;
wcEl.textContent=wc;
const readTime=Math.ceil(wc/500);
const rtEl=document.getElementById('edReadTime');
if(rtEl)rtEl.textContent=readTime>0?'约'+readTime+'分钟阅读':'';
// Token估算显示
const tokenEl=document.getElementById('edTokenEst');
if(tokenEl){
  const textTokens=estimateTokens(text);
var sysTokens=0;
try{sysTokens=getFullPromptTokens();}catch(e){}
  const totalTokens=textTokens+sysTokens;
  tokenEl.textContent='~'+totalTokens+' tokens(文本'+textTokens+'+提示'+sysTokens+')';
  if(totalTokens>10000)tokenEl.style.color='var(--danger)';
  else if(totalTokens>6000)tokenEl.style.color='#f0a030';
  else tokenEl.style.color='var(--text2)';
}
const minWords=parseInt((document.getElementById('minWords')||{}).value)||800;
if(wc>0&&wc<minWords){
wcEl.style.color='var(--danger)';
wcEl.title='未达到最低字数要求('+minWords+'字)';
}else if(wc>=minWords){
wcEl.style.color='var(--success)';
wcEl.title='已达到字数要求';
}else{
wcEl.style.color='var(--text2)';
wcEl.title='';
}
const barInner=document.getElementById('edWordBarInner');
const targetEl=document.getElementById('edWordTarget');
if(barInner&&targetEl){
const pct2=minWords>0?Math.min(100,Math.round(wc/minWords*100)):0;
barInner.style.width=pct2+'%';
if(wc>0&&minWords>0){
targetEl.textContent='/ '+minWords+'字 ('+pct2+'%)';
}else{
targetEl.textContent='';
}
}
try{var s2=document.getElementById('edSaveStatus2');var s1=document.getElementById('edSaveStatus');if(s2&&s1)s2.textContent=s1.textContent;}catch(e){}
}
function copyEditorContent(){
if(!curEd)return;
saveEditorContent();
copyCrWork(curEd.id);
}
// 复制本章：只复制当前正在编辑的这一章，头尾格式与"复制全书"(copyCrWork)保持统一，只是多插入一行章节名
function copyEditorChapter(){
if(!curEd||curEd.type!=='novel'||!curEd.chapters)return;
saveEditorContent();
const chIdx=curEdCh;
const chText=curEd.chapters[chIdx]||'';
const chName=(curEd.chNames&&curEd.chNames[chIdx])?curEd.chNames[chIdx]:'';
const chLabel='第'+(chIdx+1)+'章'+(chName?' '+chName:'');
const header='════════════════════\n「'+(curEd.title||'无标题')+'」\n'+chLabel+'\n原创作品 · 星叙创作页\n════════════════════\n\n';
const footer='\n\n════════════════════\n创作工具：星叙 '+APP_VER+'\n════════════════════';
doCopy(header+chText.trim()+footer);
}
// ==================== 编辑器搜索功能 ====================
let edSearchScope='chapter';// chapter or all
let edSearchMatches=[];
let edSearchIdx=-1;

function toggleEdSearch(){
const bar=document.getElementById('edSearchBar');
if(!bar)return;
if(bar.style.display==='flex'){
closeEdSearch();
}else{
bar.style.display='flex';
const inp=document.getElementById('edSearchInput');
if(inp)inp.focus();
}
}

function closeEdSearch(){
const bar=document.getElementById('edSearchBar');
if(bar)bar.style.display='none';
const inp=document.getElementById('edSearchInput');
if(inp)inp.value='';
edSearchMatches=[];
edSearchIdx=-1;
const cnt=document.getElementById('edSearchCount');
if(cnt)cnt.textContent='0/0';
}

function toggleEdSearchScope(){
edSearchScope=edSearchScope==='chapter'?'all':'chapter';
document.getElementById('edSearchScopeBtn').textContent=edSearchScope==='chapter'?'本章':'全文';
doEdSearch();
}
function doEdSearchCount(){
var kw=(document.getElementById('edSearchInput').value||'').trim();
edSearchMatches=[];
edSearchIdx=-1;
if(!kw||!curEd){
document.getElementById('edSearchCount').textContent='0/0';
return;
}
var kwLower=kw.toLowerCase();
if(edSearchScope==='chapter'){
var text=document.getElementById('edTextarea').value||'';
var idx2=0;
while(true){
var found=text.toLowerCase().indexOf(kwLower,idx2);
if(found===-1)break;
edSearchMatches.push({ch:curEdCh,pos:found,len:kw.length});
idx2=found+1;
}
}else{
if(curEd.type==='novel'&&curEd.chapters){
// 先同步当前章节内容，确保搜索到最新修改
saveEditorChapter();
curEd.chapters.forEach(function(ch,ci){
var idx3=0;
var t=(ch||'').toLowerCase();
while(true){
var found2=t.indexOf(kwLower,idx3);
if(found2===-1)break;
edSearchMatches.push({ch:ci,pos:found2,len:kw.length});
idx3=found2+1;
}
});
}else{
var text2=(curEd.content||document.getElementById('edTextarea').value||'');
var idx4=0;
while(true){
var found3=text2.toLowerCase().indexOf(kwLower,idx4);
if(found3===-1)break;
edSearchMatches.push({ch:0,pos:found3,len:kw.length});
idx4=found3+1;
}
}
}
// 只更新数量，不跳转！
document.getElementById('edSearchCount').textContent=
'0/'+edSearchMatches.length;
}
function doEdSearch(){
const kw=(document.getElementById('edSearchInput').value||'').trim();
edSearchMatches=[];
edSearchIdx=-1;
if(!kw||!curEd){
document.getElementById('edSearchCount').textContent='0/0';
return;
}
const kwLower=kw.toLowerCase();
if(edSearchScope==='chapter'){
// 只搜本章
const text=document.getElementById('edTextarea').value||'';
let idx=0;
while(true){
const found=text.toLowerCase().indexOf(kwLower,idx);
if(found===-1)break;
edSearchMatches.push({ch:curEdCh,pos:found,len:kw.length});
idx=found+1;
}
}else{
// 搜全文（所有章节）
if(curEd.type==='novel'&&curEd.chapters){
// 先同步当前章节内容，确保搜索到最新修改
saveEditorChapter();
curEd.chapters.forEach((ch,ci)=>{
let idx=0;
const t=(ch||'').toLowerCase();
while(true){
const found=t.indexOf(kwLower,idx);
if(found===-1)break;
edSearchMatches.push({ch:ci,pos:found,len:kw.length});
idx=found+1;
}
});
}else{
const text=(curEd.content||document.getElementById('edTextarea').value||'');
let idx=0;
while(true){
const found=text.toLowerCase().indexOf(kwLower,idx);
if(found===-1)break;
edSearchMatches.push({ch:0,pos:found,len:kw.length});
idx=found+1;
}
}
}
if(edSearchMatches.length>0){
edSearchIdx=0;
goToEdSearchMatch();
}
document.getElementById('edSearchCount').textContent=
(edSearchMatches.length>0?(edSearchIdx+1):0)+'/'+edSearchMatches.length;
}

function edSearchNext(){
if(edSearchMatches.length===0)return;
edSearchIdx=(edSearchIdx+1)%edSearchMatches.length;
goToEdSearchMatch();
document.getElementById('edSearchCount').textContent=(edSearchIdx+1)+'/'+edSearchMatches.length;
}

function edSearchPrev(){
if(edSearchMatches.length===0)return;
edSearchIdx=(edSearchIdx-1+edSearchMatches.length)%edSearchMatches.length;
goToEdSearchMatch();
document.getElementById('edSearchCount').textContent=(edSearchIdx+1)+'/'+edSearchMatches.length;
}

function goToEdSearchMatch(){
const m=edSearchMatches[edSearchIdx];
if(!m)return;
// 如果在不同章节，先切过去
if(curEd.type==='novel'&&m.ch!==curEdCh){
saveEditorChapter();
curEdCh=m.ch;
document.getElementById('edTextarea').value=curEd.chapters[curEdCh]||'';
updateEdWc();
renderEdChBar();
}
const ta=document.getElementById('edTextarea');
ta.focus();
ta.setSelectionRange(m.pos,m.pos+m.len);
// 滚动到选中位置
const lineHeight=parseInt(getComputedStyle(ta).lineHeight)||24;
const charsPerLine=Math.floor(ta.clientWidth/14)||40;
const approxLine=Math.floor(m.pos/charsPerLine);
ta.scrollTop=Math.max(0,approxLine*lineHeight-ta.clientHeight/3);
}
// ==================== 创作页阅读模式 ====================
let _edRdPages=[];
let _edRdCurPage=0;
let _edRdTotalPg=0;
let _edRdContainer=null;
let _edRdAnimating=false;
let _edRdFontSize=15;
let _edRdLineHeight=2;
let _edRdLetterSpacing=0;

function openEdReadMode(){
  if(!curEd){showToast('请先打开一篇作品');return;}
  saveEditorContent();
  
  let text='';
  if(curEd.type==='novel'&&curEd.chapters){
    text=curEd.chapters[curEdCh]||'';
  }else{
    text=curEd.content||document.getElementById('edTextarea').value||'';
  }
  if(countWords(text)<1){showToast('当前章节没有内容');return;}
  
  // 读取排版设置
  _edRdFontSize=ld('bj_edRdFontSize',edFontSize||15);
  _edRdLineHeight=ld('bj_edRdLineHeight',edLineHeight||2);
  _edRdLetterSpacing=ld('bj_edRdLetterSpacing',edLetterSpacing||0);
  
  const modal=document.getElementById('edModal');
  modal.classList.add('ed-read-mode');
  navPush('edReadMode');
  
  _edRdInitReader(text);
}

function closeEdReadMode(){
  navPop('edReadMode');
  const modal=document.getElementById('edModal');
  modal.classList.remove('ed-read-mode');
  if(_edRdContainer){
    _edRdContainer.remove();
    _edRdContainer=null;
  }
  _edRdPages=[];
  _edRdCurPage=0;
  _edRdTotalPg=0;
  _edRdAnimating=false;
  // 同步编辑器内容到当前章节
  if(curEd && curEd.type==='novel' && curEd.chapters){
    if(curEdCh>=curEd.chapters.length)curEdCh=curEd.chapters.length-1;
    if(curEdCh<0)curEdCh=0;
    document.getElementById('edTextarea').value=curEd.chapters[curEdCh]||'';
    updateEdWc();
    renderEdChBar();
  }
}

function _edRdInitReader(text){
  if(_edRdContainer){_edRdContainer.remove();_edRdContainer=null;}
  
  // 解析段落，支持Markdown标记
  const rawParas=text.split(/\n+/).filter(function(p){return p.trim();});
  if(rawParas.length===0)rawParas.push('（暂无内容）');
  // 把Markdown标记转换成内联样式标记（阅读模式渲染用）
  const paras=rawParas.map(function(p){return p.trim();});
  
  const container=document.createElement('div');
  container.className='ed-reader-container';
  container.id='edReaderContainer';
  
  // 顶部栏
  const top=document.createElement('div');
  top.className='ed-reader-top';
  const isNovel=curEd&&curEd.type==='novel';
  const chName=(curEd&&curEd.chNames&&curEd.chNames[curEdCh])?curEd.chNames[curEdCh]:'';
  const titleText=isNovel
    ?'第'+(curEdCh+1)+'章'+(chName?' '+esc(chName):'')
    :esc(curEd.title||'草稿');
  
  top.innerHTML=
    '<button class="ert-back" onclick="closeEdReadMode()"><i class="fas fa-times"></i> 退出</button>'+
    '<div class="ert-title">'+titleText+'</div>'+
    '<button class="ert-toc" onclick="_edRdOpenToc()">'+
      (isNovel?'<i class="fas fa-list-alt"></i> 目录':'<i class="fas fa-file"></i> 跳页')+
    '</button>';
  container.appendChild(top);
  
  // 内容区
  const contentArea=document.createElement('div');
  contentArea.className='ed-reader-content';
  contentArea.id='edReaderContent';
  container.appendChild(contentArea);
  
  // 进度条
  const progressWrap=document.createElement('div');
  progressWrap.className='ed-reader-progress';
  const progressInner=document.createElement('div');
  progressInner.className='ed-reader-progress-inner';
  progressInner.id='edReaderProgressInner';
  progressWrap.appendChild(progressInner);
  container.appendChild(progressWrap);
  
  // 底部状态栏
  const footer=document.createElement('div');
  footer.className='ed-reader-footer';
  footer.innerHTML=
    '<span class="erf-ch">'+titleText+'</span>'+
    '<span class="erf-page" id="edReaderPageNum">1 / ?</span>'+
    '<span class="erf-wc">'+countWords(text)+'字</span>';
  // 点击底部状态栏打开设置
  footer.style.cursor='pointer';
  footer.onclick=function(){_edRdOpenSettings();};
  container.appendChild(footer);
  
  document.getElementById('edModal').appendChild(container);
  _edRdContainer=container;
  
  requestAnimationFrame(function(){
    setTimeout(function(){
      _edRdDoPaginate(paras,contentArea);
      _edRdBindGestures(contentArea);
    },80);
  });
}

function _edRdDoPaginate(paras,contentArea){
  var rect=contentArea.getBoundingClientRect();
  var paddingH=24+12;
  var paddingW=22*2;
  var availW=rect.width-paddingW;
  var availH=rect.height-paddingH;
  
  if(availH<80||availW<50){
    if(!_edRdDoPaginate._retryCount) _edRdDoPaginate._retryCount=0;
    _edRdDoPaginate._retryCount++;
    if(_edRdDoPaginate._retryCount>20){
      _edRdDoPaginate._retryCount=0;
    }else{
      setTimeout(function(){_edRdDoPaginate(paras,contentArea);},100);
      return;
    }
  }
  
  // 创建测量容器
  var measure=document.createElement('div');
  measure.style.cssText='position:absolute;left:-9999px;top:-9999px;width:'+availW+'px;visibility:hidden;pointer-events:none;font-size:'+_edRdFontSize+'px;line-height:'+_edRdLineHeight+';letter-spacing:'+_edRdLetterSpacing+'px;';
  document.body.appendChild(measure);
  
  // 一次性添加所有段落
  var paraEls=[];
  paras.forEach(function(p,i){
    var div=document.createElement('p');
    div.style.cssText='margin-bottom:12px;text-indent:2em;padding:2px 4px;box-sizing:border-box;word-wrap:break-word;overflow-wrap:break-word;';
    div.textContent=p.trim();
    measure.appendChild(div);
    paraEls.push(div);
  });
  
  measure.offsetHeight;
  
  var paraData=[];
  paraEls.forEach(function(div,i){
    var r=div.getBoundingClientRect();
    var h=Math.ceil(r.height)+12;
    paraData.push({idx:i,text:paras[i].trim(),height:h});
  });
  
  document.body.removeChild(measure);
  
  var pageThreshold=Math.floor(availH*0.95);
  _edRdPages=[];
  var curPageParas=[];
  var curH=0;
  
  paraData.forEach(function(pd){
    if(curH+pd.height>pageThreshold&&curPageParas.length>0){
      _edRdPages.push(curPageParas);
      curPageParas=[];
      curH=0;
    }
    curPageParas.push(pd);
    curH+=pd.height;
  });
  if(curPageParas.length>0)_edRdPages.push(curPageParas);
  if(_edRdPages.length===0)_edRdPages.push([]);
  
  _edRdTotalPg=_edRdPages.length;
  _edRdCurPage=0;
  
  _edRdRenderPage(contentArea);
}

function _edRdRenderPage(contentArea,animClass){
  if(!contentArea)contentArea=document.getElementById('edReaderContent');
  if(!contentArea)return;
  
  var createNewPage=function(){
    contentArea.innerHTML='';
    var pageDiv=document.createElement('div');
    pageDiv.className='ed-reader-page'+(animClass?' '+animClass:'');
    pageDiv.style.cssText='--ed-reader-fs:'+_edRdFontSize+'px;--ed-reader-lh:'+_edRdLineHeight+';--ed-reader-ls:'+_edRdLetterSpacing+'px;';
    
    var pageParas=_edRdPages[_edRdCurPage]||[];
    pageParas.forEach(function(pd){
      var rawText=pd.text;
      var pEl=document.createElement('p');
      // 检测Markdown标记并渲染
      if(rawText.startsWith('# ')){
        pEl.style.cssText='font-size:1.5em;font-weight:800;color:var(--accent2);margin-bottom:14px;text-indent:0;border-bottom:2px solid var(--border);padding-bottom:6px;';
        pEl.innerHTML=renderInlineMd(rawText.substring(2));
      }else if(rawText.startsWith('## ')){
        pEl.style.cssText='font-size:1.3em;font-weight:700;color:var(--accent2);margin-bottom:12px;text-indent:0;';
        pEl.innerHTML=renderInlineMd(rawText.substring(3));
      }else if(rawText.startsWith('### ')){
        pEl.style.cssText='font-size:1.15em;font-weight:600;color:var(--accent2);margin-bottom:10px;text-indent:0;';
        pEl.innerHTML=renderInlineMd(rawText.substring(4));
      }else if(rawText.startsWith('> ')){
        pEl.style.cssText='border-left:3px solid var(--accent);padding:8px 14px;margin:6px 0;background:rgba(108,92,231,.05);border-radius:0 8px 8px 0;color:var(--text2);text-indent:0;';
        pEl.innerHTML=renderInlineMd(rawText.substring(2));
      }else if(rawText.startsWith('- ')){
        pEl.style.cssText='padding-left:16px;text-indent:0;';
        pEl.innerHTML='• '+renderInlineMd(rawText.substring(2));
      }else if(rawText==='---'||rawText==='==='||rawText==='***'){
        pEl.style.cssText='border:none;border-top:1px solid var(--border);margin:12px 0;height:0;';
        pEl.innerHTML='';
      }else{
        pEl.innerHTML=renderInlineMd(rawText);
      }
      pageDiv.appendChild(pEl);
    });
    contentArea.appendChild(pageDiv);
    
    if(animClass){
      pageDiv.addEventListener('animationend',function(){
        pageDiv.classList.remove(animClass);
        _edRdAnimating=false;
      },{once:true});
    }
  };
  
  var oldPage=contentArea.querySelector('.ed-reader-page');
  if(animClass&&oldPage){
    var exitClass=animClass==='slide-in-right'?'slide-out-left':'slide-out-right';
    oldPage.classList.add(exitClass);
    oldPage.addEventListener('animationend',function(){createNewPage();},{once:true});
  }else{
    createNewPage();
    _edRdAnimating=false;
  }
  
  _edRdUpdateFooter();
}

function _edRdUpdateFooter(){
  var numEl=document.getElementById('edReaderPageNum');
  if(numEl)numEl.textContent=(_edRdCurPage+1)+' / '+_edRdTotalPg;
  
  var progEl=document.getElementById('edReaderProgressInner');
  if(progEl){
    var pct=_edRdTotalPg>0?((_edRdCurPage+1)/_edRdTotalPg*100):0;
    progEl.style.width=pct+'%';
  }
}

function _edRdNextPage(){
  if(_edRdAnimating)return false;
  if(_edRdCurPage<_edRdTotalPg-1){
    _edRdAnimating=true;
    _edRdCurPage++;
    _edRdRenderPage(null,'slide-in-right');
    return true;
  }
  return false;
}

function _edRdPrevPage(){
  if(_edRdAnimating)return false;
  if(_edRdCurPage>0){
    _edRdAnimating=true;
    _edRdCurPage--;
    _edRdRenderPage(null,'slide-in-left');
    return true;
  }
  return false;
}

function _edRdBindGestures(contentArea){
  var startX=0,startY=0,startTime=0,moved=false;
  
  contentArea.addEventListener('touchstart',function(e){
    if(e.touches.length!==1)return;
    startX=e.touches[0].clientX;
    startY=e.touches[0].clientY;
    startTime=Date.now();
    moved=false;
  },{passive:true});
  
  contentArea.addEventListener('touchmove',function(e){
    if(e.touches.length!==1)return;
    var dx=Math.abs(e.touches[0].clientX-startX);
    var dy=Math.abs(e.touches[0].clientY-startY);
    if(dx>10||dy>10)moved=true;
  },{passive:true});
  
  contentArea.addEventListener('touchend',function(e){
    if(_edRdAnimating)return;
    var endX=e.changedTouches[0].clientX;
    var endY=e.changedTouches[0].clientY;
    var dx=endX-startX;
    var elapsed=Date.now()-startTime;
    var w=contentArea.clientWidth;
    
    if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(endY-startY)*1.2){
      if(dx<-50){
        if(!_edRdNextPage()){
          // 最后一页：如果是小说模式尝试切下一章
          _edRdTryNextCh();
        }
      }else if(dx>50){
        if(!_edRdPrevPage()){
          _edRdTryPrevCh();
        }
      }
    }else if(!moved&&elapsed<300){
      var tapX=startX;
      var w3=w/3;
      if(tapX<w3){
        if(!_edRdPrevPage())_edRdTryPrevCh();
      }else if(tapX>w3*2){
        if(!_edRdNextPage())_edRdTryNextCh();
      }else{
        // 中间区域：打开设置
        _edRdOpenSettings();
      }
    }
  },{passive:true});
}

function _edRdTryNextCh(){
  if(!curEd||curEd.type!=='novel'||!curEd.chapters)return;
  if(curEdCh<curEd.chapters.length-1){
    curEdCh++;
    var text=curEd.chapters[curEdCh]||'';
    if(countWords(text)<1){showToast('下一章为空');return;}
    _edRdShowChToast('第'+(curEdCh+1)+'章');
    setTimeout(function(){
      closeEdReadMode();
      document.getElementById('edTextarea').value=text;
      updateEdWc();
      renderEdChBar();
      openEdReadMode();
    },400);
  }else{
    _edRdShowChToast('已是最后一章');
  }
}

function _edRdTryPrevCh(){
  if(!curEd||curEd.type!=='novel'||!curEd.chapters)return;
  if(curEdCh>0){
    curEdCh--;
    var text=curEd.chapters[curEdCh]||'';
    _edRdShowChToast('第'+(curEdCh+1)+'章');
    setTimeout(function(){
      closeEdReadMode();
      document.getElementById('edTextarea').value=text;
      updateEdWc();
      renderEdChBar();
      openEdReadMode();
      // 跳到最后一页
      setTimeout(function(){
        _edRdCurPage=_edRdTotalPg-1;
        _edRdRenderPage();
      },150);
    },400);
  }else{
    _edRdShowChToast('已是第一章');
  }
}

function _edRdShowChToast(text){
  var old=document.querySelector('.rd-reader-ch-toast');
  if(old)old.remove();
  var toast=document.createElement('div');
  toast.className='rd-reader-ch-toast';
  toast.textContent=text;
  var c=document.getElementById('edReaderContainer')||document.getElementById('edModal');
  c.appendChild(toast);
  setTimeout(function(){if(toast.parentNode)toast.remove();},700);
}

// 目录/跳页
function _edRdOpenToc(){
  if(!curEd)return;
  
  if(curEd.type==='novel'&&curEd.chapters&&curEd.chapters.length>1){
    // 小说模式：显示章节目录
    var items='';
    curEd.chapters.forEach(function(ch,i){
      var wc=countWords(ch||'');
      var chName=(curEd.chNames&&curEd.chNames[i])?curEd.chNames[i]:'';
      var isAct=i===curEdCh;
      items+='<div style="padding:12px 16px;border-bottom:1px solid var(--border);cursor:pointer;background:'+(isAct?'rgba(108,92,231,.1)':'transparent')+';color:'+(isAct?'var(--accent2)':'var(--text)')+'" onclick="_edRdGoToCh('+i+')">'+
        '<div style="font-size:13px;font-weight:'+(isAct?'700':'400')+'">第'+(i+1)+'章'+(chName?' '+esc(chName):'')+'</div>'+
        '<div style="font-size:10px;color:var(--text2);margin-top:2px">'+wc+'字</div>'+
      '</div>';
    });
    
    showDlg('章节目录',items,function(){},false,true);
    // 隐藏确认按钮
    document.getElementById('dlgOkBtn').style.display='none';
    // 让内容可滚动
    setTimeout(function(){
      var p=document.getElementById('dlgMsg');
      if(p){p.style.maxHeight='60vh';p.style.overflowY='auto';p.style.padding='0';}
    },50);
  }else{
    // 草稿模式：输入页码跳转
    showInp('跳转到页码','输入页码 (1-'+_edRdTotalPg+')',function(val){
      var pg=parseInt(val);
      if(!pg||pg<1||pg>_edRdTotalPg){showToast('页码无效，范围1-'+_edRdTotalPg);return;}
      _edRdCurPage=pg-1;
      _edRdRenderPage();
      showToast('已跳转到第'+pg+'页');
    });
  }
}

function _edRdGoToCh(chIdx){
  closeDlg();
  if(chIdx===curEdCh){
    // 同章节：回到第一页
    _edRdCurPage=0;
    _edRdRenderPage();
    return;
  }
  curEdCh=chIdx;
  var text=(curEd.chapters&&curEd.chapters[curEdCh])||'';
  closeEdReadMode();
  document.getElementById('edTextarea').value=text;
  updateEdWc();
  renderEdChBar();
  openEdReadMode();
}

// 阅读设置弹窗
function _edRdOpenSettings(){
  var html='<div class="ed-reader-settings-box">'+
    '<h3><i class="fas fa-book"></i> 阅读设置</h3>'+
    '<div class="ed-reader-s-row"><span class="ed-reader-s-label">字号</span>'+
      '<input type="range" min="12" max="24" value="'+_edRdFontSize+'" oninput="_edRdSetFont(this.value)" ontouchstart="event.stopPropagation()">'+
      '<span class="ed-reader-s-val" id="edRdFontVal">'+_edRdFontSize+'</span></div>'+
    '<div class="ed-reader-s-row"><span class="ed-reader-s-label">行距</span>'+
      '<input type="range" min="1.4" max="3" step="0.1" value="'+_edRdLineHeight+'" oninput="_edRdSetLine(this.value)" ontouchstart="event.stopPropagation()">'+
      '<span class="ed-reader-s-val" id="edRdLineVal">'+_edRdLineHeight.toFixed(1)+'</span></div>'+
    '<div class="ed-reader-s-row"><span class="ed-reader-s-label">字距</span>'+
      '<input type="range" min="0" max="4" step="0.5" value="'+_edRdLetterSpacing+'" oninput="_edRdSetLS(this.value)" ontouchstart="event.stopPropagation()">'+
      '<span class="ed-reader-s-val" id="edRdLsVal">'+_edRdLetterSpacing+'</span></div>'+
    '<div style="display:flex;gap:8px;margin-top:14px">'+
      '<button onclick="_edRdCloseSettings()" style="flex:1;padding:10px;border-radius:10px;border:1px solid var(--border);background:var(--card);color:var(--text);font-size:12px;cursor:pointer">关闭</button>'+
      '<button onclick="_edRdGoToPageInput()" style="flex:1;padding:10px;border-radius:10px;border:1px solid var(--accent);background:transparent;color:var(--accent2);font-size:12px;cursor:pointer">跳转页码</button>'+
    '</div>'+
  '</div>';
  
  // 创建设置浮层
  var ov=document.createElement('div');
  ov.className='ed-reader-settings-ov show';
  ov.id='edRdSettingsOv';
  ov.innerHTML=html;
  ov.addEventListener('touchstart',function(e){e.stopPropagation();},{passive:true});
  ov.addEventListener('touchmove',function(e){e.stopPropagation();},{passive:true});
  ov.addEventListener('touchend',function(e){e.stopPropagation();},{passive:true});
  // 点击背景关闭
  ov.addEventListener('click',function(e){
    if(e.target===ov)_edRdCloseSettings();
  });
  
  var c=document.getElementById('edReaderContainer');
  if(c)c.appendChild(ov);
}

function _edRdCloseSettings(){
  var ov=document.getElementById('edRdSettingsOv');
  if(ov)ov.remove();
}

function _edRdSetFont(v){
  v=parseInt(v);
  _edRdFontSize=v;
  sv('bj_edRdFontSize',v);
  var el=document.getElementById('edRdFontVal');
  if(el)el.textContent=v;
  _edRdRepaginate();
}

function _edRdSetLine(v){
  v=parseFloat(v);
  _edRdLineHeight=v;
  sv('bj_edRdLineHeight',v);
  var el=document.getElementById('edRdLineVal');
  if(el)el.textContent=v.toFixed(1);
  _edRdRepaginate();
}

function _edRdSetLS(v){
  v=parseFloat(v);
  _edRdLetterSpacing=v;
  sv('bj_edRdLetterSpacing',v);
  var el=document.getElementById('edRdLsVal');
  if(el)el.textContent=v;
  _edRdRepaginate();
}

function _edRdRepaginate(){
  if(!curEd)return;
  var text='';
  if(curEd.type==='novel'&&curEd.chapters){
    text=curEd.chapters[curEdCh]||'';
  }else{
    text=curEd.content||'';
  }
  var paras=text.split(/\n+/).filter(function(p){return p.trim();});
  if(paras.length===0)paras.push('（暂无内容）');
  var contentArea=document.getElementById('edReaderContent');
  if(contentArea){
    var savedPage=_edRdCurPage;
    _edRdDoPaginate(paras,contentArea);
    if(savedPage<_edRdTotalPg){
      _edRdCurPage=savedPage;
      _edRdRenderPage();
    }
  }
}

function _edRdGoToPageInput(){
  _edRdCloseSettings();
  showInp('跳转到页码','输入页码 (1-'+_edRdTotalPg+')',function(val){
    var pg=parseInt(val);
    if(!pg||pg<1||pg>_edRdTotalPg){showToast('页码无效，范围1-'+_edRdTotalPg);return;}
    _edRdCurPage=pg-1;
    _edRdRenderPage();
    showToast('已跳转到第'+pg+'页');
  });
}
// ==================== Markdown 编辑功能 ====================
let edMdToolbarVisible=false;
let edPreviewMode=false;

function toggleEdMdToolbar(){
  edMdToolbarVisible=!edMdToolbarVisible;
  const bar=document.getElementById('edMdToolbar');
  if(bar) bar.classList.toggle('show',edMdToolbarVisible);
  showToast(edMdToolbarVisible?'Markdown工具栏已显示':'Markdown工具栏已隐藏');
}

function edMdInsert(before,after){
  const ta=document.getElementById('edTextarea');
  if(!ta||edPreviewMode)return;
  const sel=_edGetSelection();
  const start=sel.start;
  const end=sel.end;
  const text=ta.value;
  edPushUndo(text,curEdCh); // 插入前先记撤回点，不依赖3秒防抖
  const selected=text.substring(start,end);
  const newText=text.substring(0,start)+before+(selected||'文字')+after+text.substring(end);
  ta.value=newText;
  ta.focus();
  if(selected){
    ta.setSelectionRange(start+before.length,start+before.length+selected.length);
  }else{
    ta.setSelectionRange(start+before.length,start+before.length+2);
  }
  _edTrackSelection();
  onEditorInput();
}

function edMdInsertLine(prefix){
  const ta=document.getElementById('edTextarea');
  if(!ta||edPreviewMode)return;
  const sel=_edGetSelection();
  const start=sel.start;
  const text=ta.value;
  edPushUndo(text,curEdCh); // 插入前先记撤回点，不依赖3秒防抖
  // 找到当前行的开头
  let lineStart=start;
  while(lineStart>0&&text[lineStart-1]!=='\n')lineStart--;
  const newText=text.substring(0,lineStart)+prefix+text.substring(lineStart);
  ta.value=newText;
  ta.focus();
  ta.setSelectionRange(lineStart+prefix.length,lineStart+prefix.length);
  _edTrackSelection();
  onEditorInput();
}

function toggleEdPreview(){
  // 直接跳转到阅读模式（会渲染Markdown）
  if(!curEd){showToast('请先打开一篇作品');return;}
  saveEditorContent();
  openEdReadMode();
}
// 行内Markdown渲染（安全版，不用innerHTML注入风险）
function renderInlineMd(text){
  if(!text)return'';
  var html=esc(text);
  // 粗斜体
  html=html.replace(/\*\*\*(.+?)\*\*\*/g,'<strong><em>$1</em></strong>');
  // 粗体
  html=html.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>');
  // 斜体
  html=html.replace(/\*(.+?)\*/g,'<em>$1</em>');
  // 删除线
  html=html.replace(/~~(.+?)~~/g,'<del>$1</del>');
  // 行内代码
  html=html.replace(/`([^`]+)`/g,'<code style="background:var(--card2);padding:1px 4px;border-radius:3px;font-size:0.9em">$1</code>');
  return html;
}
function renderMarkdown(text){
  if(!text)return'<p style="color:var(--text2)">暂无内容</p>';
  let html=esc(text);
  // 标题
  html=html.replace(/^### (.+)$/gm,'<h3>$1</h3>');
  html=html.replace(/^## (.+)$/gm,'<h2>$1</h2>');
  html=html.replace(/^# (.+)$/gm,'<h1>$1</h1>');
  // 粗体和斜体
  html=html.replace(/\*\*\*(.+?)\*\*\*/g,'<strong><em>$1</em></strong>');
  html=html.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>');
  html=html.replace(/\*(.+?)\*/g,'<em>$1</em>');
  // 删除线
  html=html.replace(/~~(.+?)~~/g,'<del>$1</del>');
  // 行内代码
  html=html.replace(/`([^`]+)`/g,'<code>$1</code>');
  // 分割线
  html=html.replace(/^---+$/gm,'<hr>');
  // 引用块
  html=html.replace(/^&gt; (.+)$/gm,'<blockquote>$1</blockquote>');
  // 无序列表
  html=html.replace(/^- (.+)$/gm,'<li>$1</li>');
  html=html.replace(/(<li>.*<\/li>\n?)+/g,'<ul>$&</ul>');
  // 段落：把剩余的连续行包成 <p>
  html=html.split('\n\n').map(function(block){
    block=block.trim();
    if(!block)return'';
    if(block.startsWith('<h')||block.startsWith('<blockquote')||block.startsWith('<ul')||block.startsWith('<hr')||block.startsWith('<li'))return block;
    return'<p>'+block.replace(/\n/g,'<br>')+'</p>';
  }).join('\n');
  return html;
}
function formatEditorText(){
const ta=document.getElementById('edTextarea');
if(!ta)return;
edPushUndo(); // 排版前先记一个撤回点，不依赖3秒自动保存的防抖，排完版立刻就能撤回
let text=ta.value||'';

const blankMode=edFmtBlankMode; // 'none'|'skip'|'blank'|'blank-indent'
const forceIndent=blankMode==='blank-indent';
const indentN=(edFmtIndentOn||forceIndent) ? Math.max(1,edFmtIndentChars||2) : 0;
const indentStr=indentN>0 ? '　'.repeat(indentN) : '';

if(blankMode==='skip'){
  // 不处理空行结构：不合并/拆分段落换行，只做"按行加缩进"和"清除多余空行"
  if(edFmtClearExtra){
    text=text.replace(/\n{3,}/g,'\n\n');
  }
  if(indentStr){
    text=text.split('\n').map(function(line){
      const body=line.replace(/^[\s　]+/,'');
      return body.trim() ? indentStr+body : line;
    }).join('\n');
  }
}else{
  // 按段落重新组织：任意一段换行（不管单个还是多个）都视为段落边界，再按设置的分隔方式重新拼接
  const paras=text.split(/\n+/).map(function(p){return p.trim();}).filter(function(p){return p.length>0;});
  const sep=blankMode==='none' ? '\n' : '\n\n';
  const rebuilt=paras.map(function(p){
    const body=p.replace(/^[\s　]+/,'');
    return indentStr ? indentStr+body : body;
  });
  text=rebuilt.join(sep);
  if(edFmtClearExtra){
    text=text.replace(/\n{3,}/g,'\n\n');
  }
}
// 只清理首尾多余的换行，不用trim()——trim()会把首段刚加上的全角空格缩进也一起吃掉
text=text.replace(/^\n+/,'').replace(/\n+$/,'');
ta.value=text;
onEditorInput();
showToast('排版完成 ¶');
}

// ==================== 排版规则设置弹窗 ====================
function openFmtRuleOv(){
_syncFmtRuleUI();
document.getElementById('fmtRuleOv').classList.add('show');
navPush('fmtRuleOv');
}
function closeFmtRuleOv(){
navPop('fmtRuleOv');
document.getElementById('fmtRuleOv').classList.remove('show');
}
function _syncFmtRuleUI(){
document.querySelectorAll('.fmt-indent-opt').forEach(function(el){
el.classList.toggle('act', parseInt(el.dataset.v,10)===(edFmtIndentOn?edFmtIndentChars:0));
});
document.querySelectorAll('.fmt-blank-opt').forEach(function(el){
el.classList.toggle('act', el.dataset.v===edFmtBlankMode);
});
var chk=document.getElementById('fmtClearExtraChk');
if(chk){chk.checked=edFmtClearExtra;updateAdvSwitch('fmtClearExtraChk');}
}
function setFmtIndent(n){
n=parseInt(n,10)||0;
edFmtIndentOn = n>0;
edFmtIndentChars = n>0 ? n : edFmtIndentChars; // 选"不缩进"时不清空已记住的字符数，方便下次再打开时数值还在
sv('bj_edFmtIndentOn',edFmtIndentOn);
sv('bj_edFmtIndentChars',edFmtIndentChars);
_syncFmtRuleUI();
}
function setFmtBlankMode(mode){
edFmtBlankMode=mode;
sv('bj_edFmtBlankMode',mode);
// "空一行+缩进"这个预设选中时，如果缩进还没开，顺手把缩进也打开（默认2字符），方便一键达到"缩进+空一行"的效果；
// 用户之后仍然可以在"首段缩进"里单独调整字符数或关掉
if(mode==='blank-indent' && !edFmtIndentOn){
edFmtIndentOn=true;
sv('bj_edFmtIndentOn',true);
}
_syncFmtRuleUI();
}
function setFmtClearExtra(v){
edFmtClearExtra=!!v;
sv('bj_edFmtClearExtra',edFmtClearExtra);
}

// ==================== AI REVIEW ====================
async function requestAIReview(){
if(!curEd)return;
const cfg=getCurApi();
if(!cfg.url||!cfg.key){showToast('请先在设置中配置API');return;}
saveEditorContent();
const text=document.getElementById('edTextarea').value||'';
if(countWords(text)<20){showToast('内容太少，至少写20字再请AI评价');return;}
const body=document.getElementById('aiReviewBody');
body.innerHTML='<div style="text-align:center;padding:20px;color:var(--text2)"><span class="ldots"><span></span><span></span><span></span></span><br>AI正在阅读你的作品...</div>';
document.getElementById('aiReviewOv').classList.add('show');
navPush('aiReviewOv');
// 注入当前角色设定，让评价更精准
const reviewChars=characters.filter(c=>c.name).map(c=>c.name).join('、');
const reviewStyle=(document.getElementById('styleDesc')&&document.getElementById('styleDesc').value||ap.curStyle||'').trim();
const sysMsg=`你是一位在网文圈摸爬滚打多年的资深编辑，读过的稿子比任何人都多。你的评价有三个原则：说人话、给得准、能直接用。

${reviewChars?'【本作登场角色】'+reviewChars+'\n评价时请留意角色是否OOC、对话是否有个人腔调。\n':''}${reviewStyle?'【作者设定文风】'+reviewStyle+'\n请结合这个文风方向给出建议，不要用通用标准衡量。\n':''}
【评价框架】严格按以下结构输出，不许省略任何一项：

📊 一句话印象
用一句话说出这篇文章最强烈的感受（好的坏的都要说实话）

✨ 写得最好的2处
格式：> 引用原文片段
↑ 为什么好（具体到句子层面）

⚠️ 最影响阅读的2处问题
格式：问题所在 → 为什么不好 → 修改示范（直接给出改好的版本）

👤 角色塑造
主角/配角的说话方式有没有区分度？有没有OOC的地方？

🎯 文笔评分：X/10
（6分=能看完不卡顿；7分=有亮点；8分=明显好于平均；9分=打动人；10分=不舍得合上）

💡 最重要的一条建议
如果作者只有时间改一个地方，改哪里收益最大——给出具体操作步骤，而不是方向建议

【铁律】
- 引用原文时只引最有代表性的一句，不要大段复制
- 批评必须附带修改示范，不然不算有用
- 不许敷衍夸奖，也不许只挑毛病
- 全程不许用"您""贵作"这类词，说话像个朋友`;
const chInfo=curEd.type==='novel'?'（这是第'+(curEdCh+1)+'章）':'';
const userMsg='请评价以下作品'+chInfo+'：\n\n标题：'+(curEd.title||'无标题')+'\n\n正文：\n'+text.substring(0,3000);
const messages=[{role:'system',content:sysMsg},{role:'user',content:userMsg}];
var reviewResult = await callToolAPINonStream(messages);
if(reviewResult){
body.textContent = reviewResult;
}else{
body.innerHTML='<div style="color:var(--text2);text-align:center">获取评价失败，请检查API设置</div>';
}
}
function copyAiReview(){
  var body=document.getElementById('aiReviewBody');
  if(!body){showToast('没有评价内容');return;}
  var text=body.textContent||body.innerText||'';
  if(!text.trim()){showToast('评价内容为空');return;}
  doCopy(text.trim());
  showToast('AI评价已复制');
}
function closeAIReview(){
  navPop('aiReviewOv');
document.getElementById('aiReviewOv').classList.remove('show');
}
// ==================== AI深度校对（不改内容只挑问题） ====================
let prfScope='chapter';
let prfSource='editor'; // editor 或 reading

function openProofread(source){
  prfSource=source||'editor';
  prfScope='chapter';
  document.getElementById('prfScopeCh').classList.add('act');
  document.getElementById('prfScopeAll').classList.remove('act');
  document.getElementById('proofreadBody').innerHTML='<div class="note-empty">选择校对类型开始检查<br><br><i class="fas fa-file-alt"></i> 错别字：同音字、形近字、多字少字<br><i class="fas fa-link"></i> 逻辑矛盾：前后矛盾、设定冲突<br><i class="fas fa-music"></i> 节奏问题：节奏失衡、描写过多过少<br><i class="fas fa-microscope"></i> 全面校对：以上全部</div>';
  document.getElementById('prfIssueList').style.display='none';
  document.getElementById('proofreadOv').classList.add('show');
  navPush('proofreadOv');
}

function closeProofread(){
  navPop('proofreadOv');
  document.getElementById('proofreadOv').classList.remove('show');
}
function copyProofreadToRewrite(){
  var body = document.getElementById('proofreadBody');
  if(!body || !body.textContent.trim() || body.textContent.includes('选择校对类型')){
    showToast('请先进行校对');
    return;
  }
  var result = body.textContent.trim().substring(0, 900);
  if(prfSource === 'editor' && curEd){
    closeProofread();
    aiRewriteChapter();
    setTimeout(function(){
      var ta = document.getElementById('rewriteReqInput');
      if(ta) ta.value = '根据以下校对问题进行改写修正：\n\n' + result;
    }, 350);
  } else {
    doCopy(result);
    showToast('校对结果已复制，请粘贴到改写需求框');
  }
}
function setPrfScope(scope){
  prfScope=scope;
  document.getElementById('prfScopeCh').classList.toggle('act',scope==='chapter');
  document.getElementById('prfScopeAll').classList.toggle('act',scope==='all');
}

function getPrfText(){
  var text='';
  if(prfSource==='reading'){
    if(!curRd){showToast('没有打开的文章');return'';}
    if(prfScope==='chapter'){
      if(curRd.type==='long'&&curRd.chapters){
        text=curRd.chapters[curCh]||'';
      }else{
        text=curRd.content||'';
      }
    }else{
      if(curRd.type==='long'&&curRd.chapters){
        curRd.chapters.forEach(function(ch,i){
          text+='【第'+(i+1)+'章】\n'+(ch||'')+'\n\n';
        });
      }else{
        text=curRd.content||'';
      }
    }
  }else{
    // editor
    if(!curEd){showToast('没有打开的作品');return'';}
    if(prfScope==='chapter'){
      text=document.getElementById('edTextarea').value||'';
    }else{
      if(curEd.type==='novel'&&curEd.chapters){
        // 先保存当前章
        saveEditorChapter();
        curEd.chapters.forEach(function(ch,i){
          text+='【第'+(i+1)+'章】\n'+(ch||'')+'\n\n';
        });
      }else{
        text=curEd.content||document.getElementById('edTextarea').value||'';
      }
    }
  }
  return text;
}

async function doProofread(type){
  var cfg=getCurApi();
  if(!cfg.url||!cfg.key){showToast('请先配置API');return;}
  var text=getPrfText();
  if(!text||countWords(text)<20){showToast('内容太少，至少20字才能校对');return;}

  // 高亮按钮
  ['prfTypoBtn','prfLogicBtn','prfRhythmBtn','prfAllBtn'].forEach(function(id){
    document.getElementById(id).classList.remove('act');
  });
  var btnMap={typo:'prfTypoBtn',logic:'prfLogicBtn',rhythm:'prfRhythmBtn',all:'prfAllBtn'};
  if(btnMap[type])document.getElementById(btnMap[type]).classList.add('act');

  var body=document.getElementById('proofreadBody');
  var typeLabel={typo:'错别字',logic:'逻辑矛盾',rhythm:'节奏问题',all:'全面'}[type]||'全面';
  body.innerHTML='<div style="text-align:center;padding:30px;color:var(--text2)"><span class="ldots"><span></span><span></span><span></span></span><br>正在进行'+typeLabel+'校对...</div>';
  document.getElementById('prfIssueList').style.display='none';

  var sysMsg='你是一位经验极其丰富的小说编辑，你的工作是：只挑问题，绝对不改原文。\n\n';
  sysMsg+='【铁律】你只负责指出问题和位置，不要给出修改版本，不要重写任何段落。\n\n';

  if(type==='typo'||type==='all'){
    sysMsg+='【错别字检查】\n';
    sysMsg+='找出：同音字错误、形近字错误、多字少字、标点误用\n';
    sysMsg+='格式：❌ 错误词 → ✅ 正确词 | 所在位置（引用原文5-10字片段）\n\n';
  }

  if(type==='logic'||type==='all'){
    sysMsg+='【逻辑矛盾检查——这是最重要的】\n';
    sysMsg+='重点找以下问题：\n';
    sysMsg+='① 前后矛盾：前面说A角色左手受伤，后面又用左手拿东西\n';
    sysMsg+='② 设定冲突：角色身份、年龄、外貌、能力前后不一致\n';
    sysMsg+='③ 时间线错误：事件发生顺序不对，白天突然变晚上\n';
    sysMsg+='④ 空间矛盾：角色在A地，下一段突然在B地，没有移动描写\n';
    sysMsg+='⑤ 人物行为矛盾：角色做出与其性格完全不符的行为（无合理动机）\n';
    sysMsg+='⑥ 遗忘的物品/人物：提到某个重要物品后再也没出现\n\n';
    sysMsg+='格式：\n';
    sysMsg+='🔗 矛盾类型：XX\n';
    sysMsg+='   前文：「引用原文片段」\n';
    sysMsg+='   后文：「引用原文片段」\n';
    sysMsg+='   问题：具体矛盾说明\n\n';
  }

  if(type==='rhythm'||type==='all'){
    sysMsg+='【节奏问题检查】\n';
    sysMsg+='① 过度描写：某个场景/动作描写过长，拖慢节奏\n';
    sysMsg+='② 描写不足：关键情节一笔带过，缺少必要的细节\n';
    sysMsg+='③ 节奏失衡：连续多段都是对话/都是叙述/都是心理活动\n';
    sysMsg+='④ 转场突兀：场景切换太突然，缺少过渡\n';
    sysMsg+='⑤ 情绪断层：角色情绪变化太快，缺少铺垫\n\n';
    sysMsg+='格式：\n';
    sysMsg+='🎵 问题类型：XX\n';
    sysMsg+='   位置：引用原文片段或指出大概位置\n';
    sysMsg+='   说明：为什么这里有问题\n\n';
  }

  sysMsg+='【输出要求】\n';
  sysMsg+='1. 如果没有发现问题，就说"未发现明显问题 ✅"\n';
  sysMsg+='2. 每类问题按严重程度排序，最严重的放前面\n';
  sysMsg+='3. 对每个问题都要引用原文片段作为证据\n';
  sysMsg+='4. 不要泛泛而谈，每个问题都要具体\n';
  sysMsg+='5. 最后用一句话总结：最需要优先修改的是什么\n';
  sysMsg+='6. 禁止输出思维过程和分析步骤\n';

  // 注入人物设定（帮助检测角色矛盾）
  var validChars=characters.filter(function(c){return c.name;});
  if(curRd && (curRd.customTitle || curRd.title)){
  sysMsg += '\n【正在校对的作品】《' + (curRd.customTitle || curRd.title) + '》\n';
  sysMsg += '检测角色矛盾时以该作品的已有人物设定为准。\n';
}
  if(validChars.length>0&&(type==='logic'||type==='all')){
    sysMsg+='\n【已设定的角色（用于检测OOC和设定冲突）】\n';
    validChars.forEach(function(c){
      sysMsg+='· '+c.name;
      if(c.traits&&c.traits.length>0)sysMsg+='（'+c.traits.join('·')+'）';
      if(c.desc)sysMsg+='：'+c.desc.substring(0,100);
      sysMsg+='\n';
    });
  }

  var userMsg='请对以下'+typeLabel+'校对'+(prfScope==='all'?'（全文）':'（本章）')+'：\n\n'+text.substring(0,8000);

  var messages=[{role:'system',content:sysMsg},{role:'user',content:userMsg}];

  var result=await callToolAPINonStream(messages);
if(result){
body.textContent=result;
parsePrfResult(result,type);
}else{
body.textContent='校对失败，请检查API设置';
}
}

function parsePrfResult(text,type){
  // 提取关键问题标签
  var issues=[];
  var lines=text.split('\n');
  lines.forEach(function(line){
    line=line.trim();
    // 提取错别字
    if(line.startsWith('❌')){
      var match=line.match(/❌\s*(.+?)\s*→/);
      if(match&&match[1])issues.push({type:'typo',text:match[1].trim()});
    }
    // 提取矛盾
    if(line.startsWith('🔗')){
      var desc=line.replace(/^🔗\s*/,'').replace(/矛盾类型[：:]\s*/,'').trim();
      if(desc)issues.push({type:'logic',text:desc.substring(0,30)});
    }
    // 提取节奏问题
    if(line.startsWith('🎵')){
      var desc2=line.replace(/^🎵\s*/,'').replace(/问题类型[：:]\s*/,'').trim();
      if(desc2)issues.push({type:'rhythm',text:desc2.substring(0,30)});
    }
  });

  if(issues.length===0){
    document.getElementById('prfIssueList').style.display='none';
    return;
  }

  var listDiv=document.getElementById('prfIssueList');
  var tagsDiv=document.getElementById('prfIssueTags');
  listDiv.style.display='block';
  tagsDiv.innerHTML='';

  var colors={typo:'rgba(255,107,107,.12)',logic:'rgba(230,126,34,.12)',rhythm:'rgba(52,152,219,.12)'};
  var textColors={typo:'var(--danger)',logic:'#e67e22',rhythm:'#3498db'};
  var icons={typo:'',logic:'',rhythm:''};

  issues.forEach(function(issue){
    var tag=document.createElement('span');
    tag.style.cssText='padding:6px 12px;border-radius:10px;background:'+(colors[issue.type]||'var(--card2)')+';color:'+(textColors[issue.type]||'var(--text)')+';font-size:11px;cursor:pointer;border:1px solid transparent;transition:all .2s';
    tag.textContent=(icons[issue.type]||'')+ ' '+issue.text;
    tag.title='点击复制到搜索栏快速定位';
    tag.onclick=function(){
      // 复制问题关键词用于定位
      var kw=issue.text.replace(/[（(].+[）)]/g,'').trim();
      if(kw.length>15)kw=kw.substring(0,15);
      doCopy(kw);

      // 如果编辑器打开，尝试在编辑器搜索中定位
      if(prfSource==='editor'&&document.getElementById('edModal').classList.contains('show')){
        var bar=document.getElementById('edSearchBar');
        if(bar){
          bar.style.display='flex';
          document.getElementById('edSearchInput').value=kw;
          doEdSearch();
          closeProofread();
        }
      }
      showToast('已复制「'+kw+'」');
    };
    tagsDiv.appendChild(tag);
  });
}
// ==================== AI错别字检查 ====================
let typoResults=[];

function openTypoCheck(){
document.getElementById('typoOv').classList.add('show');
navPush('typoOv');
document.getElementById('typoBody').innerHTML='<div class="note-empty">点击上方按钮开始检查</div>';
document.getElementById('typoList').style.display='none';
typoResults=[];
}

function closeTypoCheck(){
  navPop('typoOv');
document.getElementById('typoOv').classList.remove('show');
}

async function aiCheckTypo(scope){
if(!curEd){showToast('请先打开一篇文章');return;}
const cfg=getCurApi();
if(!cfg.url||!cfg.key){showToast('请先配置API');return;}

// 如果直接从工具栏调用（无参数），先打开弹窗
if(!scope){
openTypoCheck();
return;
}

let text='';
let label='';
if(scope==='chapter'){
text=document.getElementById('edTextarea').value||'';
label='本章（第'+(curEdCh+1)+'章）';
try{
document.getElementById('typoChBtn').style.background='var(--accent)';
document.getElementById('typoChBtn').style.color='#fff';
document.getElementById('typoAllBtn').style.background='var(--card)';
document.getElementById('typoAllBtn').style.color='var(--text)';
}catch(e){logError('op',e)}
}else{
if(curEd.type==='novel'&&curEd.chapters){
saveEditorChapter();
curEd.chapters.forEach((ch,i)=>{
text+='【第'+(i+1)+'章】\n'+ch+'\n\n';
});
}else{
text=curEd.content||document.getElementById('edTextarea').value||'';
}
label='全文';
try{
document.getElementById('typoAllBtn').style.background='var(--accent)';
document.getElementById('typoAllBtn').style.color='#fff';
document.getElementById('typoChBtn').style.background='var(--card)';
document.getElementById('typoChBtn').style.color='var(--text)';
}catch(e){logError('op',e)}
}

if(countWords(text)<10){showToast('内容太少，至少10字');return;}

const body=document.getElementById('typoBody');
body.innerHTML='<div style="text-align:center;padding:30px;color:var(--text2)"><span class="ldots"><span></span><span></span><span></span></span><br>正在检查'+label+'的错别字...</div>';
document.getElementById('typoList').style.display='none';

const sysMsg=`你是一位严谨的中文校对编辑，专门负责检查小说文本中的错别字、用词错误、语病。

【任务】检查用户提供的文本，找出所有错别字和明显的用词错误。

【输出格式】严格按以下格式，每行一条：
错误词 → 正确词 | 所在句子片段（前后各5字）

【检查范围】
- 同音字错误（如：以经→已经、在见→再见）
- 形近字错误（如：己以→已经、未来→末来）
- 多字/少字（如：我我去→我去）
- 标点符号错用
- 常见网文笔误

【注意】
- 不要修改文风和表达方式
- 不要把故意的用法当成错误（如角色口头禅、方言）
- 如果没有发现错误，就说"未发现明显错别字 ✅"
- 只输出错误列表，不要其他内容`;

const userMsg='请检查以下'+label+'的文本：\n\n'+text.substring(0,6000);
const messages=[{role:'system',content:sysMsg},{role:'user',content:userMsg}];

typoResults=[];

var result=await callToolAPINonStream(messages);
if(result){
body.textContent=result;
parseTypoResult(result);
}else{
body.textContent='检查失败，请重试';
}
}

function parseTypoResult(text){
typoResults=[];
const lines=text.split('\n').filter(l=>l.trim());
lines.forEach(line=>{
const arrow=line.indexOf('→');
if(arrow>0){
const wrongWord=line.substring(0,arrow).trim().replace(/^[\d\.\、\)\]]+/,'').trim();
if(wrongWord&&wrongWord.length<20){
typoResults.push(wrongWord);
}
}
});

if(typoResults.length===0){
document.getElementById('typoList').style.display='none';
return;
}

// 去重
typoResults=[...new Set(typoResults)];

const listDiv=document.getElementById('typoList');
const tagsDiv=document.getElementById('typoTags');
listDiv.style.display='block';
tagsDiv.innerHTML='';

typoResults.forEach(word=>{
const tag=document.createElement('span');
tag.style.cssText='padding:6px 12px;border-radius:10px;background:rgba(255,107,107,.12);color:var(--danger);font-size:12px;font-weight:600;cursor:pointer;border:1px solid rgba(255,107,107,.3);transition:all .2s';
tag.textContent=word;
tag.title='点击复制「'+word+'」并打开搜索';
tag.onclick=function(){
doCopy(word);
// 自动打开搜索栏并填入
const bar=document.getElementById('edSearchBar');
bar.style.display='flex';
document.getElementById('edSearchInput').value=word;
edSearchScope='chapter';
document.getElementById('edSearchScopeBtn').textContent='本章';
doEdSearch();
closeTypoCheck();
showToast('已复制「'+word+'」并定位到搜索');
};
tagsDiv.appendChild(tag);
});
}
function shareCrToRes(id){
  var work=crWorks.find(function(w){return w.id===id;});
  if(!work)return;
  var wc=getCrWordCount(work);
  if(wc<10){showToast('内容太少，至少写10字再分享');return;}
  var typeLabel=work.type==='draft'?'草稿':'小说';
  _showResPackInfoForm(
    {name:(work.title||'无标题'),author:userCard.name||'星叙用户'},
    function(packName,packAuthor,packDesc){
      var packData=JSON.parse(JSON.stringify(work));
      var pack={
        _app:'syn_resource',_ver:APP_VER,
        id:uid(),name:packName,
        desc:packDesc||(typeLabel+' · '+wc+'字'),
        author:packAuthor,
        createdAt:new Date().toISOString(),
        items:[{type:'work',name:typeLabel+'：'+(work.title||'无标题'),data:packData}]
      };
      var jsonStr=JSON.stringify(pack,null,2);
      var fileName='星叙_'+packName+'_'+new Date().toLocaleDateString().replace(/\//g,'-')+'.json';
      _exportFileWithFallback(fileName,jsonStr,'application/json;charset=utf-8');
    }
  );
}
// 章节大纲管理
function viewOutline(){
if(!curEd||!curEd.outline){showToast('这篇作品没有大纲');return;}
showDlg('总大纲',curEd.outline.substring(0,500)+(curEd.outline.length>500?'...':''),()=>{});
}
// ==================== 章节大纲：分卷分组 + 排序 ====================
var _chOutlineSortValue='seq-asc';
// 章节大纲页的分组展开状态（和章节目录页的 _chCatalogExpanded 是各自独立的一份，两个页面互不影响）
var _chOutlineExpanded={};
var _chOutlineLocateVal=''; // 定位输入框当前值：纯数字按章节号定位，其余按分卷名模糊匹配，''表示不筛选
var _chOutlineSortOptions=[
{value:'seq-desc',label:'最新'},
{value:'seq-asc',label:'最旧'},
{value:'recent',label:'最近'}
];

function openChOutline(){
if(!curEd||curEd.type!=='novel')return;
if(!curEd.chOutlines)curEd.chOutlines=[];
if(!curEd.chOutlineUpdatedAt)curEd.chOutlineUpdatedAt=[];
_ensureVolFields(curEd);
_chOutlineSortValue='seq-asc';
_chOutlineExpanded={}; // 重新打开大纲：所有分卷/未分卷默认折叠
_chOutlineLocateVal='';
var lbl=document.getElementById('chOutlineSortLabel');
if(lbl)lbl.textContent='最旧';
var locInp=document.getElementById('chOutlineLocateInput');
if(locInp)locInp.value='';
var locClr=document.getElementById('chOutlineLocateClear');
if(locClr)locClr.style.display='none';
renderChOutlineList();
document.getElementById('chOutlineOv').classList.add('show');
navPush('chOutlineOv');
}
function closeChOutline(){
navPop('chOutlineOv');
document.getElementById('chOutlineOv').classList.remove('show');
}

// 静默保存所有大纲文本框（不关闭弹窗、不弹提示），供切换排序/分卷分组前调用，
// 避免重新渲染列表时把用户还没点"保存"的编辑内容弄丢
function _autoSaveChOutlineTextareas(){
if(!curEd)return;
if(!curEd.chOutlines)curEd.chOutlines=[];
if(!curEd.chOutlineUpdatedAt)curEd.chOutlineUpdatedAt=[];
var now=Date.now();
var changed=false;
document.querySelectorAll('#chOutlineList textarea[data-ch]').forEach(function(ta){
var ch=parseInt(ta.dataset.ch,10);
var newVal=ta.value;
if(curEd.chOutlines[ch]!==newVal){
curEd.chOutlines[ch]=newVal;
curEd.chOutlineUpdatedAt[ch]=now;
changed=true;
}
});
if(changed)saveEditorContent();
}

function saveChOutlines(){
if(!curEd)return;
_autoSaveChOutlineTextareas();
closeChOutline();
showToast('章节大纲已保存');
}

// ---- 排序方式选择弹窗（排序发生在每个分卷分组内部，不打乱分组）----
function openChOutlineSortPicker(){
var listEl=document.getElementById('chOutlineSortPickerList');
if(!listEl)return;
var html='';
_chOutlineSortOptions.forEach(function(o){
var sel=o.value===_chOutlineSortValue;
html+='<button class="col-fp-item'+(sel?' selected':'')+'" onclick="pickChOutlineSort(\''+o.value+'\')">'+
'<span>'+o.label+'</span>'+(sel?'<i class="fas fa-check fp-check"></i>':'')+
'</button>';
});
listEl.innerHTML=html;
document.getElementById('chOutlineSortPickerOv').classList.add('show');
navPush('chOutlineSortPickerOv');
}
function pickChOutlineSort(value){
closeChOutlineSortPicker();
_chOutlineSortValue=value;
var opt=_chOutlineSortOptions.find(function(o){return o.value===value;});
var lbl=document.getElementById('chOutlineSortLabel');
if(lbl&&opt)lbl.textContent=opt.label;
_autoSaveChOutlineTextareas();
renderChOutlineList();
}
function closeChOutlineSortPicker(){
navPop('chOutlineSortPickerOv');
document.getElementById('chOutlineSortPickerOv').classList.remove('show');
}

// ---- 列表渲染：按分卷分组，组内按当前排序方式排列（只影响这个管理弹窗里的浏览顺序，
// 不会改变小说本身的实际章节顺序）。分组标题长按可编辑卷名+梗概（和章节目录页共用同一套弹窗）。----
function renderChOutlineList(){
if(!curEd)return;
_autoSaveChOutlineTextareas();
var list=document.getElementById('chOutlineList');
if(!list)return;
if(!curEd.chapters||curEd.chapters.length===0){
list.innerHTML='<div style="text-align:center;padding:30px;color:var(--text2);font-size:12px">还没有章节</div>';
return;
}
var sortFns={
'seq-asc':function(a,b){return a-b;},
'seq-desc':function(a,b){return b-a;},
'recent':function(a,b){
var ua=(curEd.chOutlineUpdatedAt&&curEd.chOutlineUpdatedAt[a])||0;
var ub=(curEd.chOutlineUpdatedAt&&curEd.chOutlineUpdatedAt[b])||0;
return ub-ua;
}
};
var sortFn=sortFns[_chOutlineSortValue]||sortFns['seq-asc'];
var groups=_buildVolGroups(curEd);
var hasAnyVolume=(curEd.volumes||[]).length>0;
// 章节/分卷定位：纯数字按章节号定位，命中且属于某个分卷时只显示这一整卷、其余分卷隐藏；
// 非数字按分卷名模糊匹配，同样只显示匹配到的分卷。还没建过分卷时没有"卷"可筛，
// 这里不做隐藏，只在按章节号命中时自动滚动过去，体验上退化成"单纯的定位"而不报错/清空列表。
var locateActive=(_chOutlineLocateVal!=='');
var isNumericLocate=locateActive&&/^\d+$/.test(_chOutlineLocateVal);
var numericHitIdx=-1;
var keepGroupIds=null; // null=不按分组筛选；否则是"允许显示的分组key集合"（key为卷id，未分卷用''）
var emptyMsg='还没有章节';
if(locateActive){
if(isNumericLocate){
var locateNum=parseInt(_chOutlineLocateVal,10);
numericHitIdx=(locateNum>0&&locateNum-1<curEd.chapters.length)?(locateNum-1):-1;
if(hasAnyVolume){
if(numericHitIdx>=0){
var hitVol=(curEd.chVolume&&curEd.chVolume[numericHitIdx])||'';
keepGroupIds={};keepGroupIds[hitVol]=true;
}else{
keepGroupIds={};
}
}
emptyMsg='未找到第'+esc(_chOutlineLocateVal)+'章';
}else if(hasAnyVolume){
var kw=_chOutlineLocateVal.trim().toLowerCase();
keepGroupIds={};
(curEd.volumes||[]).forEach(function(v){if((v.name||'').toLowerCase().indexOf(kw)!==-1)keepGroupIds[v.id]=true;});
emptyMsg='未找到名称包含"'+esc(_chOutlineLocateVal.trim())+'"的分卷';
}
}
var html='';
var anyGroupShown=false;
groups.forEach(function(g){
if(g.indices.length===0)return; // 空分组（比如全部章节都已分卷时的"未分卷"）不渲染
var key=g.id||'';
if(keepGroupIds&&!keepGroupIds[key])return; // 定位筛选生效时，不在结果里的分组整组跳过
anyGroupShown=true;
var indices=g.indices.slice().sort(sortFn);
if(hasAnyVolume){
var expanded=keepGroupIds?true:!!_chOutlineExpanded[key]; // 定位命中时强制展开，方便直接看到内容
html+='<div class="vol-group-hdr'+(g.id===null?' unassigned':'')+'" data-vol-hdr="'+key+'"><i class="fas fa-chevron-'+(expanded?'down':'right')+' vol-chevron"></i><span class="vol-name">'+esc(g.name||'未命名分卷')+'</span><span class="vol-count">（'+indices.length+'章）</span>'+(g.summary?'<span class="vol-summary">'+esc(g.summary)+'</span>':'')+'</div>';
if(expanded)html+=indices.map(function(i){return _renderChOutlineItem(i);}).join('');
}else{
html+=indices.map(function(i){return _renderChOutlineItem(i);}).join('');
}
});
if(keepGroupIds&&!anyGroupShown){
list.innerHTML='<div style="text-align:center;padding:30px;color:var(--text2);font-size:12px">'+emptyMsg+'</div>';
return;
}
list.innerHTML=html;
if(hasAnyVolume){
// 分组标题的点击展开/长按编辑都是JS事件监听，不是innerHTML能直接带上的，批量赋值后要单独补绑
list.querySelectorAll('.vol-group-hdr').forEach(function(hdr){
var volId=hdr.dataset.volHdr;
hdr.onclick=function(){
_chOutlineExpanded[volId]=!_chOutlineExpanded[volId];
renderChOutlineList();
};
if(volId)_bindVolHdrLongPress(hdr,curEd,volId,function(){renderChOutlineList();});
});
}
// 数字定位命中时自动滚动到那一具体章节，方便"快速找到"（哪怕展示的是它所在的整卷）
if(numericHitIdx>=0){
var hit=list.querySelector('.ch-outline-item[data-ch="'+numericHitIdx+'"]');
if(hit)setTimeout(function(){hit.scrollIntoView({block:'nearest',behavior:'smooth'});},50);
}
}
function chOutlineLocate(val){
var clean=String(val==null?'':val);
var inp=document.getElementById('chOutlineLocateInput');
if(inp&&inp.value!==clean)inp.value=clean;
_chOutlineLocateVal=clean;
var clearBtn=document.getElementById('chOutlineLocateClear');
if(clearBtn)clearBtn.style.display=clean?'flex':'none';
renderChOutlineList();
}
function chOutlineLocateClear(){
var inp=document.getElementById('chOutlineLocateInput');
if(inp)inp.value='';
chOutlineLocate('');
}
function _openChOutlineVolPicker(i){
_autoSaveChOutlineTextareas();
openVolPicker(curEd,i,function(){renderChOutlineList();});
}
function _renderChOutlineItem(i){
var outline=curEd.chOutlines[i]||'';
var chWords=countWords(curEd.chapters[i]||'');
var chName=(curEd.chNames&&curEd.chNames[i])?(' '+curEd.chNames[i]):'';
var preview=(curEd.chapters[i]||'').replace(/\n/g,' ').substring(0,30);
var volId=(curEd.chVolume&&curEd.chVolume[i])||'';
var vol=volId?(curEd.volumes||[]).find(function(v){return v.id===volId;}):null;
return '<div class="ch-outline-item" data-ch="'+i+'">'+
'<div class="ch-outline-item-hdr"><span>第'+(i+1)+'章'+esc(chName)+'</span><span style="font-size:10px;color:var(--text2);font-weight:400">'+chWords+'字 · '+esc(preview)+(preview.length>=30?'…':'')+'</span></div>'+
'<div style="margin-bottom:8px"><span class="ch-vol-select'+(vol?' assigned':'')+'" onclick="_openChOutlineVolPicker('+i+')"><i class="fas fa-layer-group" style="font-size:9px"></i> '+(vol?esc(vol.name||'未命名分卷'):'不分卷')+'</span></div>'+
// 用 .tx-wrap 包住输入框，右下角配一个紫色拖拽三角——和"续写上下文设置"里的章节大纲输入框用的是
// 同一套全局拖拽扩大机制（见文件末尾 _initTxResize 的事件委托），不需要额外写一遍拖拽逻辑，
// 长按/按住三角往下拖就能把输入框拉高，方便大段大纲不用来回滚动查看
'<div class="tx-wrap"><textarea data-ch="'+i+'" placeholder="【必填内容】本章必须出现的事件、人物行为、情绪走向、要埋的伏笔、禁止出现的内容...写得越详细AI越听话">'+esc(outline)+'</textarea><div class="tx-resize-handle"></div></div>'+
'</div>';
}
function renameEdChapter(){
if(!curEd||curEd.type!=='novel')return;
if(!curEd.chNames)curEd.chNames=[];
const current=curEd.chNames[curEdCh]||'';
showInp('第'+(curEdCh+1)+'章 章节名','输入章节名称（如：初遇、暗涌）',name=>{
curEd.chNames[curEdCh]=name;
saveEditorContent();
renderEdChBar();
showToast('第'+(curEdCh+1)+'章已命名为「'+name+'」');
});
// 预填已有名称
setTimeout(()=>{
const f=document.getElementById('inpField');
if(f&&current)f.value=current;
},120);
}
function deleteEdChapter(){
if(!curEd)return;
if(curEd.type!=='novel'){
  // 草稿没有"章节"概念，这里删除的是整个草稿
  var draftId=curEd.id;
  var draftWc=countWords(curEd.content||'');
  showDlg('删除草稿','确定要删除这篇草稿吗？('+draftWc+'字)\n\n此操作不可恢复！',function(){
    crWorks=crWorks.filter(function(w){return w.id!==draftId;});
    sv('bj_crWorks',crWorks);
    showToast('已删除');
    // 直接关闭编辑器，不走closeEditor()——那个函数会重新保存当前内容，
    // 但作品已经被删了，保存会往一个不存在的作品上写入无意义的数据
    navPop('edModal');
    if(autoSaveInterval){clearInterval(autoSaveInterval);autoSaveInterval=null;}
    if(edAutoSaveTimer){clearTimeout(edAutoSaveTimer);edAutoSaveTimer=null;}
    document.getElementById('edModal').classList.remove('show');
    document.getElementById('bnav').classList.remove('hide');
    curEd=null;
    try{if(!document.querySelector('.pg.act#pg-settings'))document.getElementById('xjGlobalFloat').style.display='';}catch(e){}
    renderCrList();
  },true);
  return;
}
// 小说：委托给"按索引删除"的实现（confirmDeleteEdChapterAt → deleteEdChapterAt），
// 和章节目录里长按删除走同一套逻辑，会同步清理章节名/大纲/标签/版本历史等所有平行数据，
// 不再单独维护一份不完整的删除代码（之前这里只删了chapters数组，chNames/chOutlines等都没跟着删，会导致后面章节的名字/大纲错位）
confirmDeleteEdChapterAt(curEdCh);
}
// ==================== 章节目录：长按删除（共享工具，创作页/阅读页目录通用） ====================
// 通用长按检测核心：按住600ms触发onLongPress，期间移动超过10px视为滚动/拖拽，取消触发。
// excludeSelector 可选：触摸起点落在该选择器命中的区域内时不触发长按（比如章节条目里的拖拽手柄）。
function _bindLongPress(el,onLongPress,excludeSelector){
  var lpTimer=null,moved=false,sx=0,sy=0,fired=false;
  el.addEventListener('touchstart',function(e){
    if(excludeSelector&&e.target.closest(excludeSelector))return;
    moved=false;fired=false;
    if(e.touches.length>0){sx=e.touches[0].clientX;sy=e.touches[0].clientY;}
    lpTimer=setTimeout(function(){
      if(moved)return;
      fired=true;
      // 强制阻止文字选中：CSS层已禁用，这里再加一层JS保险
      if(window.getSelection)try{window.getSelection().removeAllRanges();}catch(ex){}
      _suppressSelect(el);
      try{if(navigator.vibrate)navigator.vibrate(30);}catch(e){}
      try{onLongPress();}catch(err){logError('op',err);}
      setTimeout(function(){_restoreSelect(el);},600);
    },600);
  },{passive:false}); // passive:false 允许在回调内调用preventDefault
  el.addEventListener('touchmove',function(e){
    if(e.touches.length>0&&(Math.abs(e.touches[0].clientX-sx)>10||Math.abs(e.touches[0].clientY-sy)>10)){
      moved=true;
      if(lpTimer){clearTimeout(lpTimer);lpTimer=null;}
    }
  },{passive:true});
  el.addEventListener('touchend',function(e){
    if(lpTimer){clearTimeout(lpTimer);lpTimer=null;}
    if(fired){
      e.preventDefault&&e.preventDefault();
      e.stopPropagation&&e.stopPropagation();
      fired=false;
    }
  },{passive:false});
  el.addEventListener('touchcancel',function(){
    if(lpTimer){clearTimeout(lpTimer);lpTimer=null;}
    fired=false;
  });
}
// item：目录列表中的单个章节DOM项；onLongPress：长按触发后要执行的回调（不含参数，由调用方通过闭包传入具体索引）
function _bindChItemLongPressDelete(item,onLongPress){
  _bindLongPress(item,onLongPress,'.ch-drag-handle');
}
// ==================== 分卷（章节目录/章节大纲通用）====================
// 数据结构：work.volumes = [{id,name,summary}, ...]；work.chVolume[i] = 第i章所属的分卷id（''或未设置=未分卷）
// work 可以是 curEd（创作页当前作品）或 curRd（阅读页当前文章，涵盖"我的小说"预览和收藏长篇两种来源）——
// 两者是同一份底层数据的引用（不是拷贝），所以只要都读写这两个字段，创作页/阅读页/收藏页三处会自动保持一致，
// 不需要额外的"同步"代码。
function _ensureVolFields(work){
  if(!work)return;
  if(!work.volumes)work.volumes=[];
  if(!work.chVolume)work.chVolume=[];
}
// 按 work.volumes 的顺序分组，每组内的章节按真实章节号升序排列；
// 最后固定追加一个 id 为 null 的"未分卷"分组（是否渲染这个分组标题由调用方决定，见 _renderChListGrouped）
function _buildVolGroups(work){
  _ensureVolFields(work);
  var groups=work.volumes.map(function(v){return {id:v.id,name:v.name,summary:v.summary,indices:[]};});
  var groupById={};
  groups.forEach(function(g){groupById[g.id]=g;});
  var unassigned={id:null,name:'未分卷',summary:'',indices:[]};
  var chapters=work.chapters||[];
  for(var i=0;i<chapters.length;i++){
    var vid=work.chVolume[i];
    if(vid&&groupById[vid])groupById[vid].indices.push(i);
    else unassigned.indices.push(i);
  }
  groups.push(unassigned);
  return groups;
}
function _createVolume(work,name,summary){
  _ensureVolFields(work);
  var id=uid();
  work.volumes.push({id:id,name:name||'',summary:summary||''});
  return id;
}
function _updateVolumeMeta(work,volId,name,summary){
  _ensureVolFields(work);
  var v=work.volumes.find(function(v){return v.id===volId;});
  if(!v)return false;
  v.name=name||'';
  v.summary=summary||'';
  return true;
}
// 删除分卷≠删除章节：分卷删除后，卷内章节的chVolume清空自动变成"未分卷"，不删除任何章节本身
function _deleteVolumeById(work,volId){
  _ensureVolFields(work);
  var idx=work.volumes.findIndex(function(v){return v.id===volId;});
  if(idx===-1)return false;
  work.volumes.splice(idx,1);
  if(work.__advMode){
    // 高级创作模式：章节是{outline,title,volumeId}对象数组，分卷归属记在每个章节对象自己身上，
    // 不是平行数组，所以清空方式和 curEd/curRd 不一样
    advChapters.forEach(function(ch){if(ch&&ch.volumeId===volId)ch.volumeId='';});
  }else{
    work.chVolume=work.chVolume.map(function(v){return v===volId?'':v;});
  }
  return true;
}
function _assignChVolume(work,chIdx,volId){
  _ensureVolFields(work);
  if(!work.chapters||chIdx<0||chIdx>=work.chapters.length)return;
  while(work.chVolume.length<=chIdx)work.chVolume.push('');
  work.chVolume[chIdx]=volId||'';
}
// work 是 curEd 时用编辑器的保存方式，是 curRd 时用阅读页的保存方式，__advMode 时是高级创作模式（纯内存态，
// 用户点"保存项目"/"开始创作"时才真正落盘，这里不需要做任何事）——三套存储机制不同，这里统一收口，
// 调用方（分卷编辑/删除/选择等所有入口）都不需要关心自己存在哪
function _persistWorkAfterVolChange(work){
  if(work===curEd){saveEditorContent();}
  else if(work===curRd){syncArticle(curRd);}
}
// 长按分卷分组标题：打开编辑弹窗（复用 _bindLongPress 核心逻辑，不重复实现触摸计时）
function _bindVolHdrLongPress(hdr,work,volId,onDone){
  _bindLongPress(hdr,function(){openVolEdit(work,volId,onDone);});
}
// 章节目录的分组展开状态（创作页edChOv / 阅读收藏页chOv 共用一份，二者不会同时显示）：
// key 是分卷id（未分卷用''），value 为 true 表示展开。默认全部折叠，见 openEdChList/openChapterList。
var _chCatalogExpanded={};
// 按分卷分组渲染章节列表（创作页目录 edChOv / 阅读页目录 chOv 共用）。
// itemBuilder(i) 由调用方提供：负责生成第i章对应的 .ch-item 节点（各自的点击/长按行为不同，这里不关心）。
// expandState 由调用方传入并在多次刷新之间复用同一个对象：key 是分卷id（未分卷用''），value 为 true 表示展开。
// 只有当这本书已经创建过至少一个分卷时才显示分组标题（含"未分卷"）；从没建过分卷的书保持原来的平铺列表，
// 不会让所有存量数据一打开目录就多出一个多余的"未分卷"标题。
function _renderChListGrouped(work,listEl,itemBuilder,expandState){
  listEl.innerHTML='';
  var groups=_buildVolGroups(work);
  var hasAnyVolume=(work.volumes||[]).length>0;
  groups.forEach(function(g){
    if(!hasAnyVolume||(g.id===null&&g.indices.length===0)){
      g.indices.forEach(function(i){
        var item=itemBuilder(i);
        item.dataset.vol='';
        listEl.appendChild(item);
      });
      return;
    }
    var key=g.id||'';
    var expanded=!!expandState[key];
    var hdr=document.createElement('div');
    hdr.className='vol-group-hdr'+(g.id===null?' unassigned':'');
    hdr.innerHTML='<i class="fas fa-chevron-'+(expanded?'down':'right')+' vol-chevron"></i><span class="vol-name">'+esc(g.name||'未命名分卷')+'</span><span class="vol-count">（'+g.indices.length+'章）</span>'+(g.summary?'<span class="vol-summary">'+esc(g.summary)+'</span>':'');
    // 点击标题行：展开/折叠。长按标题行：编辑卷名+梗概。二者共存不冲突——长按一旦触发，
    // _bindLongPress 会在 touchend 里 preventDefault，浏览器就不会再补发一次点击事件。
    hdr.onclick=function(){
      expandState[key]=!expandState[key];
      if(work===curEd)openEdChList(true);else openChapterList(true);
    };
    if(g.id!==null){
      _bindVolHdrLongPress(hdr,work,g.id,function(){
        if(work===curEd)openEdChList(true);else openChapterList(true);
      });
    }
    listEl.appendChild(hdr);
    if(expanded){
      g.indices.forEach(function(i){
        var item=itemBuilder(i);
        item.dataset.vol=key;
        listEl.appendChild(item);
      });
    }
  });
}
// ---- 新建/编辑/删除分卷 弹窗 ----
var _volEditCtx=null; // {work,volId,onDone} volId为null表示"新建"
function openVolEdit(work,volId,onDone){
  if(!work)return;
  _ensureVolFields(work);
  var isNew=!volId;
  var vol=isNew?null:work.volumes.find(function(v){return v.id===volId;});
  if(!isNew&&!vol)return;
  _volEditCtx={work:work,volId:isNew?null:volId,onDone:onDone};
  document.getElementById('volEditTitle').textContent=isNew?'新建分卷':'编辑分卷';
  document.getElementById('volEditName').value=vol?(vol.name||''):'';
  document.getElementById('volEditSummary').value=vol?(vol.summary||''):'';
  document.getElementById('volEditDelBtn').style.display=isNew?'none':'';
  document.getElementById('volEditOv').classList.add('show');
  navPush('volEditOv');
  setTimeout(function(){var f=document.getElementById('volEditName');if(f)f.focus();},100);
}
function closeVolEdit(){
  navPop('volEditOv');
  document.getElementById('volEditOv').classList.remove('show');
  _volEditCtx=null;
}
function saveVolEdit(){
  if(!_volEditCtx)return;
  var name=(document.getElementById('volEditName').value||'').trim();
  if(!name){showToast('请输入卷名');return;}
  var summary=(document.getElementById('volEditSummary').value||'').trim();
  var work=_volEditCtx.work,volId=_volEditCtx.volId,onDone=_volEditCtx.onDone;
  if(volId){_updateVolumeMeta(work,volId,name,summary);}
  else{volId=_createVolume(work,name,summary);}
  _persistWorkAfterVolChange(work);
  closeVolEdit();
  showToast('已保存');
  try{if(onDone)onDone();}catch(e){logError('op',e)}
}
function deleteVolFromEdit(){
  if(!_volEditCtx||!_volEditCtx.volId)return;
  var work=_volEditCtx.work,volId=_volEditCtx.volId,onDone=_volEditCtx.onDone;
  showDlg('删除分卷','确定要删除这个分卷吗？\n\n分卷内的章节不会被删除，会自动变为"未分卷"。',function(){
    _deleteVolumeById(work,volId);
    _persistWorkAfterVolChange(work);
    closeVolEdit();
    showToast('已删除分卷');
    try{if(onDone)onDone();}catch(e){logError('op',e)}
  },true);
}
// ---- 选择分卷（用于"移动到分卷"/章节大纲每章的分卷选择框）----
var _volPickCtx=null; // {work,chIdx,onDone}
// chIdx 为 null/undefined 时是"仅选择模式"：不写入任何章节，选中后把 volId 原样传给 onDone(volId)——
// 用于像续写上下文页"新章节预分卷"/单条大纲改选分卷这种"只是要选一个分卷id，不对应具体真实章节"的场景。
// presetVolId 仅在仅选择模式下使用，用来高亮当前已选中的分卷。
// excludeNone 为 true 时不渲染"不分卷"选项（例如"为此卷生成梗概"必须对应一个具体分卷，不能选"不分卷"），
// 默认 falsy，不影响其余调用方原有行为。
function openVolPicker(work,chIdx,onDone,presetVolId,excludeNone){
  if(!work)return;
  var bindMode=(chIdx!==null&&chIdx!==undefined);
  if(bindMode&&(!work.chapters||chIdx<0||chIdx>=work.chapters.length))return;
  _ensureVolFields(work);
  _volPickCtx={work:work,chIdx:bindMode?chIdx:null,onDone:onDone};
  var listEl=document.getElementById('volPickerList');
  if(!listEl)return;
  var curVol=bindMode?(work.chVolume[chIdx]||''):(presetVolId||'');
  var html='';
  if(!excludeNone){
    html+='<button class="col-fp-item'+(!curVol?' selected':'')+'" onclick="pickVolForChapter(\'\')"><span>不分卷</span>'+(!curVol?'<i class="fas fa-check fp-check"></i>':'')+'</button>';
  }
  work.volumes.forEach(function(v){
    var sel=v.id===curVol;
    var vname=v.name||'未命名分卷';
    html+='<button class="col-fp-item vol-pick-item'+(sel?' selected':'')+'" data-vol-name="'+esc(vname.toLowerCase())+'" onclick="pickVolForChapter(\''+v.id+'\')"><span>'+esc(vname)+'</span>'+(sel?'<i class="fas fa-check fp-check"></i>':'')+'</button>';
  });
  html+='<div class="rel-empty" id="volPickerNoMatch" style="display:none;padding:8px">没有找到匹配的分卷</div>';
  html+='<button class="col-fp-item" style="border-style:dashed;color:var(--accent2)" onclick="addVolFromPicker()"><span><i class="fas fa-plus" style="font-size:10px"></i> 新建分卷</span></button>';
  listEl.innerHTML=html;
  // 每次打开都重置上一次残留的搜索状态，避免带着旧筛选条件打开新的选择场景
  var searchInp=document.getElementById('volPickerSearchInput');
  if(searchInp) searchInp.value='';
  var searchClearBtn=document.getElementById('volPickerSearchClear');
  if(searchClearBtn) searchClearBtn.style.display='none';
  document.getElementById('volPickerOv').classList.add('show');
  navPush('volPickerOv');
}
// 分卷选择弹窗内的搜索过滤：按卷名子串匹配（不区分大小写），非匹配项隐藏；"不分卷"/"新建分卷"两个固定选项不参与过滤，始终显示
function filterVolPickerList(val){
  var q=String(val==null?'':val).trim().toLowerCase();
  var clearBtn=document.getElementById('volPickerSearchClear');
  if(clearBtn) clearBtn.style.display=q?'flex':'none';
  var items=document.querySelectorAll('#volPickerList .vol-pick-item');
  var visibleCount=0;
  items.forEach(function(el){
    var name=el.getAttribute('data-vol-name')||'';
    var match=!q||name.indexOf(q)>-1;
    el.style.display=match?'':'none';
    if(match)visibleCount++;
  });
  var noMatchEl=document.getElementById('volPickerNoMatch');
  if(noMatchEl) noMatchEl.style.display=(q&&visibleCount===0&&items.length>0)?'':'none';
}
function clearVolPickerSearch(){
  var inp=document.getElementById('volPickerSearchInput');
  if(inp) inp.value='';
  filterVolPickerList('');
}
function closeVolPicker(){
  navPop('volPickerOv');
  document.getElementById('volPickerOv').classList.remove('show');
  _volPickCtx=null;
}
function pickVolForChapter(volId){
  if(!_volPickCtx)return;
  var work=_volPickCtx.work,chIdx=_volPickCtx.chIdx,onDone=_volPickCtx.onDone;
  closeVolPicker();
  if(chIdx===null){
    // 仅选择模式：不对应具体章节，直接把选中结果交给调用方自己处理
    try{if(onDone)onDone(volId);}catch(e){logError('op',e)}
    return;
  }
  _assignChVolume(work,chIdx,volId);
  _persistWorkAfterVolChange(work);
  showToast(volId?'已移动到分卷':'已移出分卷');
  try{if(onDone)onDone();}catch(e){logError('op',e)}
}
function addVolFromPicker(){
  if(!_volPickCtx)return;
  var work=_volPickCtx.work,chIdx=_volPickCtx.chIdx,onDone=_volPickCtx.onDone;
  closeVolPicker();
  // 新建分卷紧接着自动把当前章节/当前选择分配进去，避免用户新建完还要再选一次
  openVolEdit(work,null,function(){
    var newVol=work.volumes[work.volumes.length-1];
    if(!newVol)return;
    if(chIdx===null){
      try{if(onDone)onDone(newVol.id);}catch(e){logError('op',e)}
      return;
    }
    _assignChVolume(work,chIdx,newVol.id);
    _persistWorkAfterVolChange(work);
    try{if(onDone)onDone();}catch(e){logError('op',e)}
  });
}
// ---- 章节长按操作菜单（移动到分卷 / 删除章节）----
var _chActionCtx=null; // {work,chIdx}
function openChAction(work,chIdx){
  if(!work||!work.chapters||chIdx<0||chIdx>=work.chapters.length)return;
  _chActionCtx={work:work,chIdx:chIdx};
  var title=document.getElementById('chActionTitle');
  if(title)title.textContent='第'+(chIdx+1)+'章'+((work.chNames&&work.chNames[chIdx])?' '+work.chNames[chIdx]:'');
  document.getElementById('chActionOv').classList.add('show');
  navPush('chActionOv');
}
function closeChAction(){
  navPop('chActionOv');
  document.getElementById('chActionOv').classList.remove('show');
  _chActionCtx=null;
}
function chActionMoveToVol(){
  if(!_chActionCtx)return;
  var work=_chActionCtx.work,chIdx=_chActionCtx.chIdx;
  closeChAction();
  openVolPicker(work,chIdx,function(){
    if(work===curEd)openEdChList(true);else openChapterList(true);
  });
}
function chActionDelete(){
  if(!_chActionCtx)return;
  var work=_chActionCtx.work,chIdx=_chActionCtx.chIdx;
  closeChAction();
  if(work===curEd)confirmDeleteEdChapterAt(chIdx);
  else confirmDeleteRdChapterAt(chIdx);
}
// 创作页目录：按索引确认删除章节
function confirmDeleteEdChapterAt(idx){
  if(!curEd||curEd.type!=='novel'||!curEd.chapters)return;
  if(idx<0||idx>=curEd.chapters.length)return;
  if(curEd.chapters.length<=1){showToast('至少保留一章');return;}
  var chWc=countWords(curEd.chapters[idx]||'');
  var chLabel='第'+(idx+1)+'章'+(curEd.chNames&&curEd.chNames[idx]?' '+curEd.chNames[idx]:'');
  showDlg('删除章节','确定要删除'+chLabel+'吗？('+chWc+'字)\n\n此操作不可恢复！',function(){
    deleteEdChapterAt(idx);
  },true);
}
// 拖拽调整章节顺序后，version历史存储也要跟着"搬家"，语义和chapters.splice(dragIdx,1)[0]/splice(targetIdx,0,item)完全对应：
// 取出该章的版本历史，插到新位置，中间跨过的章节顺移一位。不这样做的话，拖动章节顺序后，版本历史还留在原来的序号上，
// 后续点"版本管理"看到的会是别的章节的历史记录。
function _moveChapterVersions(workId,dragIdx,targetIdx,chapterCount){
if(!workId)return;
var all=[];
for(var i=0;i<chapterCount;i++){
all.push(getChapterVersions(workId,i));
}
var moved=all.splice(dragIdx,1)[0];
all.splice(targetIdx,0,moved);
for(var j=0;j<all.length;j++){
saveChapterVersions(workId,j,all[j]);
}
}
// 删除某章后，把该章之后所有章节的"版本历史"存储都往前挪一位，跟上新的章节序号。
// 版本历史是按"作品id_章节序号"存的独立存储条目，不会随curEd.chapters.splice()自动跟着变——
// 如果不处理，删掉第3章后，原来第4章的版本历史会错位地对应到新的第3章上，越往后错位越明显。
function _shiftChapterVersionsAfterDelete(workId,deletedIdx,chapterCountBeforeDelete){
if(!workId)return;
for(var i=deletedIdx;i<chapterCountBeforeDelete-1;i++){
var nextVersions=getChapterVersions(workId,i+1);
saveChapterVersions(workId,i,nextVersions);
}
// 最后一个位置已经没有章节对应了，清空避免残留数据一直占着存储空间
sv('bj_chVer_'+workId+'_'+(chapterCountBeforeDelete-1),[]);
}
// 创作页目录：按索引执行删除（同步清理章节名/大纲/标签/摘要/版本历史等所有平行数据，避免索引错位）
function deleteEdChapterAt(idx){
  if(!curEd||!curEd.chapters||idx<0||idx>=curEd.chapters.length)return;
  if(curEd.chapters.length<=1){showToast('至少保留一章');return;}
  edPushUndo();
  var _chCountBefore=curEd.chapters.length;
  _shiftChapterVersionsAfterDelete(curEd.id,idx,_chCountBefore);
  curEd.chapters.splice(idx,1);
  if(curEd.chNames&&curEd.chNames.length>idx)curEd.chNames.splice(idx,1);
  if(curEd.chOutlines&&curEd.chOutlines.length>idx)curEd.chOutlines.splice(idx,1);
  if(curEd.chOutlineTags&&curEd.chOutlineTags.length>idx)curEd.chOutlineTags.splice(idx,1);
  if(curEd.chOutlineUpdatedAt&&curEd.chOutlineUpdatedAt.length>idx)curEd.chOutlineUpdatedAt.splice(idx,1);
  if(curEd.chSummaries&&curEd.chSummaries.length>idx)curEd.chSummaries.splice(idx,1);
  if(curEd.chVolume&&curEd.chVolume.length>idx)curEd.chVolume.splice(idx,1);
  if(curEdCh>=curEd.chapters.length)curEdCh=curEd.chapters.length-1;
  else if(curEdCh>idx)curEdCh--;
  document.getElementById('edTextarea').value=curEd.chapters[curEdCh]||'';
  updateEdWc();
  renderEdChBar();
  saveEditorContent();
  showToast('已删除');
  closeEdChList();
  openEdChList(true);
}
