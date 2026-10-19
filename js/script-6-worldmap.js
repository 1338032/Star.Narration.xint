/*
╔══════════════════════════════════════════════════════════════════
║  星叙 script-6-worldmap.js — 世界地图（第 6 份脚本，需在 script-5 之后加载）
║  主题：世界观页的地图上传/16:9 裁剪/预览，以及横屏全屏的地图编辑器
║
║  数据层（状态、校验、克隆、保存、提示词文字）在 script-1-core.js 的「WORLD MAP」段，
║  预设/绑定/备份的接入分别在 script-3、script-4、script-5 里，这里只管界面和交互。
╠══════════════════════════════════════════════════════════════════
║   一、公共小工具
║   二、世界观页：上传 / 替换 / 清空 / 只读预览
║   三、16:9 裁剪弹窗
║   四、编辑器：几何与绘制
║   五、编辑器：视图（缩放平移）、横屏、手势
║   六、编辑器：新建分区 / 地点戳 / 关联线、编辑与删除、边界点编辑、撤回、保存退出
║   七、编辑器：提示词字数预览与逐条「写入/不写入」
║   八、编辑器：元素列表（定位、高亮、编辑）
║   九、导出带标注的地图图片
╚══════════════════════════════════════════════════════════════════
*/

// ==================== 一、公共小工具 ====================
var WM_SVGNS='http://www.w3.org/2000/svg';
var WM_MAX_FILE=15*1024*1024; // 源图片大小上限
var WM_TAP_SLOP=8;            // 手指移动不超过这个像素数才算「点击」
var WM_LONGPRESS_MS=420;      // 长按多久后大头针进入可拖动状态
var WM_SNAP_PX=14;            // 边界点：离其他分区的顶点不超过这个屏幕像素数就吸附
var WM_VTX_EPS=0.0002;        // 边界点：两个顶点的坐标差不超过这个比例（约 0.26 个地图像素）就算「同一个点」
var WM_VTX_REF_MAX=400;       // 边界点编辑时，其他分区的顶点参考点最多画这么多个
var WM_FOCUS_PAD=48;          // 元素列表定位时，目标四周留出的屏幕像素
var WM_EXPORT_SCALE=2;        // 导出图片的倍数（2 → 2560×1440）

function wmEl(id){return document.getElementById(id);}
function wmEllipsis(text,max){
  var chars=Array.from(String(text||''));
  return chars.length>max?chars.slice(0,max).join('')+'…':chars.join('');
}
function wmClamp(v,lo,hi){return Math.min(hi,Math.max(lo,v));}
function wmNavPush(id){if(typeof navPush==='function')navPush(id);}
function wmNavPop(id){if(typeof navPop==='function')navPop(id);}

// ==================== 二、世界观页：上传 / 替换 / 清空 / 只读预览 ====================
var _wmPickMode='new';   // 'new' 首次上传；'replace' 替换（决定成功后的提示语）
var _wmInlineBound=false;

// 世界观页的地图卡片：没有图片显示上传按钮；有图片显示完整预览（16:9，叠加只读的分区/地点/线）
function wmRenderInline(){
  var empty=wmEl('wmEmpty'),filled=wmEl('wmFilled');
  if(!empty||!filled)return;
  var has=!!(worldMap&&worldMap.img);
  empty.style.display=has?'none':'';
  filled.style.display=has?'':'none';
  var exportBtn=wmEl('wmExportBtn');
  if(exportBtn)exportBtn.style.display=has?'':'none';
  if(!has)return;
  var img=wmEl('wmInlineImg');
  if(img&&img.getAttribute('src')!==worldMap.img)img.src=worldMap.img;
  var stage=wmEl('wmInlineStage');
  if(stage)wmFillShapes(stage,worldMap,{});
  var info=wmEl('wmInlineInfo');
  if(info){
    var amount='';
    if(worldMap.enabled){
      try{
        var plan=wmBuildPromptPlan(worldMap);
        amount='（'+(plan.limit===null?plan.used+' 字，无限制':plan.used+'/'+plan.limit+' 字')+'）';
      }catch(err){logError('wmRenderInline',err);}
    }
    info.textContent='共 '+worldMap.zones.length+' 个分区、'+worldMap.pins.length+' 个地点、'+worldMap.links.length+' 条关联线；地图文字'+
      (worldMap.enabled?'已启用，会追加到世界观设定后'+amount:'未启用')+'。点击地图进入编辑。';
  }
  wmLayoutInline();
}
// 预览里的图片按容器宽度缩放；文字用反向缩放保持可读（缩略图里略小一点）
function wmLayoutInline(){
  var box=document.querySelector('#wmInline .wm-inline-box');
  var stage=wmEl('wmInlineStage');
  if(!box||!stage)return;
  var w=box.clientWidth;
  if(!w)return; // 世界观页还没打开时宽度是 0，等 ResizeObserver 再来一次
  var k=w/WM_W;
  stage.style.transform='scale('+k.toFixed(5)+')';
  stage.style.setProperty('--wm-inv',(0.85/k).toFixed(4));
}
function wmInitInline(){
  if(_wmInlineBound)return;
  _wmInlineBound=true;
  var box=document.querySelector('#wmInline .wm-inline-box');
  if(box&&typeof ResizeObserver==='function'){
    new ResizeObserver(function(){wmLayoutInline();}).observe(box);
  }else{
    window.addEventListener('resize',wmLayoutInline);
  }
}

// 把一张新地图（或空地图）设为当前地图并保存
function wmApplyNewMap(m){
  worldMap=wmSanitizeMap(m);
  wmPersistMap();
  wmRenderInline();
}
function wmPickFile(){
  _wmPickMode='new';
  wmOpenFileDialog();
}
function wmOpenFileDialog(){
  if(_wmCrop.open)return;
  var input=wmEl('wmFileInput');
  if(!input)return;
  input.value='';
  input.click();
}
// 替换/清空都会丢掉当前地图的全部数据（图片+分区+地点戳+关联线），所以先确认；确认之后才打开选文件，取消选文件不会丢任何东西
function wmReplaceClick(){
  showDlg('替换地图','替换地图会丢失当前地图的全部数据（图片、分区、地点戳、关联线）。\n\n确定要替换吗？',function(){
    _wmPickMode='replace';
    wmOpenFileDialog();
  },true);
}
function wmClearClick(){
  showDlg('清空地图','清空地图会丢失当前地图的全部数据（图片、分区、地点戳、关联线）。\n\n确定要清空吗？',function(){
    wmApplyNewMap(wmEmptyMap());
    showToast('已清空地图');
  },true);
}
// 只接受 jpg/png/webp：svg 等格式可能带脚本，gif 会丢动画，一律拒绝
function wmValidateFile(file){
  if(!file)return '没有选择文件';
  var type=(file.type||'').toLowerCase();
  var okType=type==='image/jpeg'||type==='image/png'||type==='image/webp';
  if(!type){ // 部分安卓 WebView 拿不到 MIME，退回按扩展名判断
    okType=/\.(jpe?g|png|webp)$/i.test(file.name||'');
  }
  if(!okType)return '只支持 JPG、PNG、WebP 图片';
  if(!file.size)return '图片文件是空的';
  if(file.size>WM_MAX_FILE)return '图片太大了，请选择 15MB 以内的图片';
  return '';
}
function wmOnFileChosen(input){
  var file=input&&input.files&&input.files[0];
  if(!file)return;
  var err=wmValidateFile(file);
  if(err){showToast(err,3000);return;}
  wmOpenCrop(file);
}

// ==================== 三、16:9 裁剪弹窗 ====================
var _wmCrop={
  open:false,loaded:false,busy:false,token:0,
  url:'',isObjectUrl:false,
  imgW:0,imgH:0,fw:0,fh:0,
  min:1,scale:1,x:0,y:0,
  ptr:{},pinch:null,bound:false
};

function wmOpenCrop(file){
  wmCropRelease();
  var token=++_wmCrop.token;
  var ov=wmEl('wmCropOv'),img=wmEl('wmCropImg'),ok=wmEl('wmCropOkBtn');
  if(!ov||!img)return;
  _wmCrop.open=true;_wmCrop.loaded=false;_wmCrop.busy=false;_wmCrop.ptr={};_wmCrop.pinch=null;
  if(ok)ok.disabled=true;
  ov.classList.add('show');
  wmNavPush('wmCropOv');
  wmCropBind();
  window.addEventListener('resize',wmCropOnResize);
  // 图片迟迟读不出来（损坏、内存不足）时不能让弹窗一直卡着「确认」按钮灰掉
  setTimeout(function(){
    if(token!==_wmCrop.token||!_wmCrop.open||_wmCrop.loaded)return;
    wmCancelCrop(false);
    showToast('图片读取超时，请换一张试试',3000);
  },20000);
  var begin=function(src){
    if(token!==_wmCrop.token||!_wmCrop.open)return; // 期间用户取消或重新选了图
    img.onload=function(){
      if(token!==_wmCrop.token||!_wmCrop.open)return;
      _wmCrop.imgW=img.naturalWidth;_wmCrop.imgH=img.naturalHeight;
      if(!_wmCrop.imgW||!_wmCrop.imgH){wmCancelCrop(false);showToast('图片读取失败，请换一张试试',3000);return;}
      _wmCrop.loaded=true;
      wmCropReset();
      if(ok)ok.disabled=false;
    };
    img.onerror=function(){
      if(token!==_wmCrop.token||!_wmCrop.open)return;
      wmCancelCrop(false);
      showToast('图片读取失败，请换一张试试',3000);
    };
    img.src=src;
  };
  var objUrl='';
  try{if(window.URL&&typeof URL.createObjectURL==='function')objUrl=URL.createObjectURL(file);}catch(e){objUrl='';}
  if(objUrl){
    _wmCrop.url=objUrl;_wmCrop.isObjectUrl=true;
    begin(objUrl);
  }else{
    // 没有 createObjectURL 的老环境：退回 FileReader
    var reader=new FileReader();
    reader.onload=function(){_wmCrop.url=String(reader.result||'');_wmCrop.isObjectUrl=false;begin(_wmCrop.url);};
    reader.onerror=function(){
      if(token!==_wmCrop.token)return;
      wmCancelCrop(false);
      showToast('图片读取失败，请重试',3000);
    };
    reader.readAsDataURL(file);
  }
}
// 释放上一次的图片资源，避免大图一直占着内存
function wmCropRelease(){
  var img=wmEl('wmCropImg');
  if(img){img.onload=null;img.onerror=null;img.removeAttribute('src');}
  if(_wmCrop.url&&_wmCrop.isObjectUrl){try{URL.revokeObjectURL(_wmCrop.url);}catch(e){}}
  _wmCrop.url='';_wmCrop.isObjectUrl=false;_wmCrop.loaded=false;
}
// fromNav=true 表示是返回键触发，导航栈里这一层已经被弹出
function wmCancelCrop(fromNav){
  _wmCrop.token++; // 让还没回来的 onload/FileReader/超时回调作废
  var wasOpen=_wmCrop.open;
  window.removeEventListener('resize',wmCropOnResize);
  _wmCrop.open=false;_wmCrop.busy=false;_wmCrop.ptr={};_wmCrop.pinch=null;
  wmCropRelease();
  var ov=wmEl('wmCropOv');
  if(ov)ov.classList.remove('show');
  if(wasOpen&&!fromNav)wmNavPop('wmCropOv');
}
function wmCropClamp(){
  var c=_wmCrop;
  c.scale=wmClamp(c.scale,c.min,c.min*6);
  var w=c.imgW*c.scale,h=c.imgH*c.scale;
  c.x=Math.min(0,Math.max(c.fw-w,c.x));
  c.y=Math.min(0,Math.max(c.fh-h,c.y));
}
function wmCropApply(){
  var img=wmEl('wmCropImg'),c=_wmCrop;
  if(!img||!c.loaded)return;
  img.style.width=c.imgW+'px';
  img.style.height=c.imgH+'px';
  img.style.transform='translate('+c.x.toFixed(2)+'px,'+c.y.toFixed(2)+'px) scale('+c.scale.toFixed(5)+')';
  var range=wmEl('wmCropRange');
  if(range)range.value=String(Math.round(c.scale/c.min*100));
}
// 重置：图片铺满裁剪框并居中（相当于自动居中裁剪）
function wmCropReset(){
  var frame=wmEl('wmCropFrame'),c=_wmCrop;
  if(!frame||!c.loaded)return;
  c.fw=frame.clientWidth;
  c.fh=c.fw*9/16;
  if(!c.fw)return;
  c.min=Math.max(c.fw/c.imgW,c.fh/c.imgH);
  c.scale=c.min;
  c.x=(c.fw-c.imgW*c.scale)/2;
  c.y=(c.fh-c.imgH*c.scale)/2;
  wmCropApply();
}
// 弹窗打开期间旋转手机/缩放窗口，框的宽度会变；按比例换算当前位置和缩放，保证框里看到的就是最终裁出来的
function wmCropOnResize(){
  var c=_wmCrop,frame=wmEl('wmCropFrame');
  if(!c.open||!c.loaded||!frame)return;
  var w=frame.clientWidth;
  if(!w||!c.fw||w===c.fw)return;
  var k=w/c.fw;
  c.fw=w;c.fh=w*9/16;
  c.min*=k;c.scale*=k;c.x*=k;c.y*=k;
  wmCropClamp();
  wmCropApply();
}
// 以框内某点为中心缩放，缩放前后该点对应的图片位置不变
function wmCropZoomAt(newScale,cx,cy){
  var c=_wmCrop;
  if(!c.loaded)return;
  var s=wmClamp(newScale,c.min,c.min*6);
  var ix=(cx-c.x)/c.scale,iy=(cy-c.y)/c.scale;
  c.scale=s;
  c.x=cx-ix*s;
  c.y=cy-iy*s;
  wmCropClamp();
  wmCropApply();
}
function wmCropZoomTo(factor){
  var c=_wmCrop,f=parseFloat(factor);
  if(!c.loaded||!isFinite(f))return;
  wmCropZoomAt(c.min*f,c.fw/2,c.fh/2);
}
function wmCropZoomBy(delta){
  var c=_wmCrop;
  if(!c.loaded)return;
  wmCropZoomTo(c.scale/c.min+delta);
}
function wmCropPoint(e){
  var r=wmEl('wmCropFrame').getBoundingClientRect();
  return {x:e.clientX-r.left,y:e.clientY-r.top};
}
function wmCropBind(){
  var frame=wmEl('wmCropFrame');
  if(!frame||_wmCrop.bound)return;
  _wmCrop.bound=true; // 绑定在常驻节点上，只绑一次；处理函数里都会检查弹窗是否打开
  if(window.PointerEvent){
    frame.addEventListener('pointerdown',function(e){
      var c=_wmCrop;
      if(!c.open||!c.loaded)return;
      if(e.pointerType==='mouse'&&e.button!==0)return;
      if(Object.keys(c.ptr).length>=2)return;
      var p=wmCropPoint(e);
      c.ptr[e.pointerId]={x:p.x,y:p.y};
      try{frame.setPointerCapture(e.pointerId);}catch(err){}
      var ids=Object.keys(c.ptr);
      if(ids.length===2){
        var a=c.ptr[ids[0]],b=c.ptr[ids[1]];
        var mx=(a.x+b.x)/2,my=(a.y+b.y)/2;
        c.pinch={d0:Math.max(1,Math.hypot(a.x-b.x,a.y-b.y)),s0:c.scale,ix:(mx-c.x)/c.scale,iy:(my-c.y)/c.scale};
      }
      e.preventDefault();
    });
    frame.addEventListener('pointermove',function(e){
      var c=_wmCrop,rec=c.ptr[e.pointerId];
      if(!c.open||!rec)return;
      var p=wmCropPoint(e);
      var ids=Object.keys(c.ptr);
      if(ids.length===1){
        c.x+=p.x-rec.x;c.y+=p.y-rec.y;
        wmCropClamp();wmCropApply();
      }else if(c.pinch){
        rec.x=p.x;rec.y=p.y;
        var a=c.ptr[ids[0]],b=c.ptr[ids[1]];
        var mx=(a.x+b.x)/2,my=(a.y+b.y)/2;
        c.scale=wmClamp(c.pinch.s0*Math.hypot(a.x-b.x,a.y-b.y)/c.pinch.d0,c.min,c.min*6);
        c.x=mx-c.pinch.ix*c.scale;
        c.y=my-c.pinch.iy*c.scale;
        wmCropClamp();wmCropApply();
      }
      rec.x=p.x;rec.y=p.y;
    });
    var up=function(e){
      var c=_wmCrop;
      if(!c.ptr[e.pointerId])return;
      delete c.ptr[e.pointerId];
      c.pinch=null;
      try{frame.releasePointerCapture(e.pointerId);}catch(err){}
    };
    frame.addEventListener('pointerup',up);
    frame.addEventListener('pointercancel',up);
  }
  frame.addEventListener('wheel',function(e){
    var c=_wmCrop;
    if(!c.open||!c.loaded)return;
    e.preventDefault();
    var p=wmCropPoint(e);
    wmCropZoomAt(c.scale*Math.exp(-e.deltaY*0.0015),p.x,p.y);
  },{passive:false});
}
// 确认裁剪：把框内区域输出成 1280×720 的 JPEG，成功后替换当前地图（新地图没有任何分区/地点/线）
function wmConfirmCrop(){
  var c=_wmCrop;
  if(!c.open||!c.loaded||c.busy)return;
  c.busy=true;
  var ok=wmEl('wmCropOkBtn');
  if(ok)ok.disabled=true;
  wmCropOnResize();
  var success=false;
  try{
    var img=wmEl('wmCropImg');
    var s=c.scale;
    var sw=Math.min(c.imgW,c.fw/s),sh=Math.min(c.imgH,c.fh/s);
    var sx=wmClamp(-c.x/s,0,c.imgW-sw),sy=wmClamp(-c.y/s,0,c.imgH-sh);
    var canvas=document.createElement('canvas');
    canvas.width=WM_W;canvas.height=WM_H;
    var ctx=canvas.getContext('2d');
    if(!ctx)throw new Error('当前浏览器不支持图片处理');
    ctx.fillStyle='#ffffff'; // 透明 PNG 转 JPEG 时用白底，避免变成黑色
    ctx.fillRect(0,0,WM_W,WM_H);
    if('imageSmoothingQuality' in ctx)ctx.imageSmoothingQuality='high';
    ctx.drawImage(img,sx,sy,sw,sh,0,0,WM_W,WM_H);
    var data=canvas.toDataURL('image/jpeg',0.8);
    if(data.indexOf('data:image/jpeg')!==0)throw new Error('当前浏览器无法导出 JPEG 图片');
    if(data.length>WM_LIMIT.img)data=canvas.toDataURL('image/jpeg',0.6);
    if(data.length>WM_LIMIT.img)throw new Error('裁剪后的图片仍然太大');
    var replaced=_wmPickMode==='replace';
    wmApplyNewMap({img:data,enabled:false,zones:[],pins:[],links:[]});
    if(!worldMap.img)throw new Error('地图保存失败');
    success=true;
    wmCancelCrop(false);
    showToast(replaced?'地图已替换':'地图已上传');
  }catch(err){
    logError('wmConfirmCrop',err);
    showToast('裁剪失败：'+((err&&err.message)||'未知错误'),4000);
  }finally{
    c.busy=false;
    if(ok&&!success)ok.disabled=!c.loaded;
  }
}

// ==================== 四、编辑器：几何与绘制 ====================
// 点是否在多边形内（奇偶规则，自交的多边形也能得到确定结果）
function wmPointInPoly(x,y,pts){
  var inside=false;
  for(var i=0,j=pts.length-1;i<pts.length;j=i++){
    var xi=pts[i][0],yi=pts[i][1],xj=pts[j][0],yj=pts[j][1];
    if(((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi))inside=!inside;
  }
  return inside;
}
function wmDistToSeg(px,py,ax,ay,bx,by){
  var dx=bx-ax,dy=by-ay;
  var len2=dx*dx+dy*dy;
  var t=len2>0?wmClamp(((px-ax)*dx+(py-ay)*dy)/len2,0,1):0;
  return Math.hypot(px-(ax+t*dx),py-(ay+t*dy));
}
// 分区名称的位置：先取面积重心；重心落在多边形外（凹形）或面积退化时，
// 在包围盒里网格采样，取离所有边最远的内部点，保证名称一定显示在区域里面
function wmPolyCenter(pts){
  var n=pts.length,a=0,cx=0,cy=0,i;
  for(i=0;i<n;i++){
    var p=pts[i],q=pts[(i+1)%n];
    var f=p[0]*q[1]-q[0]*p[1];
    a+=f;cx+=(p[0]+q[0])*f;cy+=(p[1]+q[1])*f;
  }
  if(Math.abs(a)>1e-6){
    a*=0.5;
    var c=[cx/(6*a),cy/(6*a)];
    if(wmPointInPoly(c[0],c[1],pts))return c;
  }
  var minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
  pts.forEach(function(p){minX=Math.min(minX,p[0]);maxX=Math.max(maxX,p[0]);minY=Math.min(minY,p[1]);maxY=Math.max(maxY,p[1]);});
  var best=null,bestD=-1,N=24;
  for(var gx=0;gx<N;gx++){
    for(var gy=0;gy<N;gy++){
      var x=minX+(maxX-minX)*(gx+0.5)/N,y=minY+(maxY-minY)*(gy+0.5)/N;
      if(!wmPointInPoly(x,y,pts))continue;
      var d=Infinity;
      for(i=0;i<n;i++){var e=pts[(i+1)%n];d=Math.min(d,wmDistToSeg(x,y,pts[i][0],pts[i][1],e[0],e[1]));}
      if(d>bestD){bestD=d;best=[x,y];}
    }
  }
  if(best)return best;
  var sx=0,sy=0;
  pts.forEach(function(p){sx+=p[0];sy+=p[1];});
  return [sx/n,sy/n];
}
function wmSvgEl(tag,attrs){
  var el=document.createElementNS(WM_SVGNS,tag);
  Object.keys(attrs).forEach(function(k){el.setAttribute(k,attrs[k]);});
  return el;
}
// 地点戳的外形路径，以及各类型的图标（白色，画在针头里；mode：fill 填充，evenodd 镂空填充，stroke 描线）。导出图片时用同一套数据
var WM_PIN_PATH='M14 1C7.4 1 2 6.4 2 13c0 8.6 12 22 12 22s12-13.4 12-22C26 6.4 20.6 1 14 1z';
var WM_PIN_GLYPHS={
  pin:[{d:'M9.5 13a4.5 4.5 0 1 0 9 0a4.5 4.5 0 1 0-9 0Z',mode:'fill'}],
  city:[{d:'M8 8H11V11H12.5V8H15.5V11H17V8H20V19H8Z',mode:'fill'}],
  village:[{d:'M14 7.5L21 13.5H19V19H9V13.5H7Z',mode:'fill'}],
  mountain:[{d:'M6.5 19L12 9.5L15 14.5L17 11.5L21.5 19Z',mode:'fill'}],
  port:[{d:'M14 10.4V18.5M11.5 12.8H16.5M8.5 14.5Q9 18.5 14 18.5Q19 18.5 19.5 14.5',mode:'stroke',w:1.7},{d:'M12.4 8.8a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0-3.2 0Z',mode:'stroke',w:1.4}],
  ruins:[{d:'M8 19V9H14V11.5H11V19Z',mode:'fill'},{d:'M17 19V13H20V19Z',mode:'fill'}],
  pass:[{d:'M7.5 19V9H20.5V19ZM12 19V14.5A2 2 0 0 1 16 14.5V19Z',mode:'evenodd'}],
  forest:[{d:'M14 7.5L18.5 13H16.3L19.5 17H8.5L11.7 13H9.5ZM13 17H15V19.5H13Z',mode:'fill'}],
  temple:[{d:'M14 7.5L21 11.5H7ZM8.5 12.5H10.5V18H8.5ZM13 12.5H15V18H13ZM17.5 12.5H19.5V18H17.5ZM7 18.2H21V19.8H7Z',mode:'fill'}]
};
function wmPinGlyphEls(type){
  return (WM_PIN_GLYPHS[type]||WM_PIN_GLYPHS.pin).map(function(g){
    if(g.mode==='stroke')return wmSvgEl('path',{d:g.d,fill:'none',stroke:'#ffffff','stroke-width':String(g.w),'stroke-linecap':'round','stroke-linejoin':'round'});
    var attrs={d:g.d,fill:'#ffffff'};
    if(g.mode==='evenodd')attrs['fill-rule']='evenodd';
    return wmSvgEl('path',attrs);
});
}
// 大头针图标：尖端在底部中心。颜色已在数据层校验为调色板里的值，类型已校验为 WM_PIN_TYPES 里的 id
function wmPinIcon(color,type){
  var svg=wmSvgEl('svg',{'class':'wm-pin-icon','viewBox':'0 0 28 36','aria-hidden':'true'});
  svg.appendChild(wmSvgEl('path',{d:WM_PIN_PATH,fill:color,stroke:'#ffffff','stroke-width':'2','stroke-linejoin':'round'}));
  wmPinGlyphEls(type).forEach(function(el){svg.appendChild(el);});
  return svg;
}
// 弹窗里选类型用的小图标：彩色圆底 + 同一个白色图案
function wmPinTypeIcon(type,color){
  var svg=wmSvgEl('svg',{'class':'wm-ptype-icon','viewBox':'4 3 20 20','aria-hidden':'true'});
  svg.appendChild(wmSvgEl('circle',{cx:'14',cy:'13',r:'10',fill:color}));
  wmPinGlyphEls(type).forEach(function(el){svg.appendChild(el);});
  return svg;
}
function wmMakeLabel(cls,text,x,y,color,kind,id,selected){
  var el=document.createElement('div');
  el.className=cls+(selected?' wm-sel':'');
  el.textContent=text; // 用户输入一律走 textContent，不会被当成 HTML
  el.style.left=x.toFixed(1)+'px';
  el.style.top=y.toFixed(1)+'px';
  el.style.setProperty('--wm-c',color);
  el.setAttribute('data-wm-t',kind);
  el.setAttribute('data-wm-id',id);
  return el;
}
function wmIsSelected(sel,t,id){
  if(!sel)return false;
  for(var i=0;i<sel.length;i++){if(sel[i].t===t&&sel[i].id===id)return true;}
  return false;
}
// 把地图上的形状和文字画进 host：svg（分区边框、关联线）+ 文字层（名称、大头针）。
// 编辑器和世界观页的只读预览共用这一个函数；opt 可带 sel（关联线已选端点）、draftPts/draftColor（分区草稿）、draftPin（地点戳草稿）。
// 返回 {anchors, draftPinEl}：anchors 是各分区/地点在 1280×720 坐标系里的锚点，供关联线连接和点击判定使用
function wmFillShapes(host,map,opt){
  opt=opt||{};
  while(host.firstChild)host.removeChild(host.firstChild);
  var svg=wmSvgEl('svg',{'class':'wm-svg','viewBox':'0 0 '+WM_W+' '+WM_H,'aria-hidden':'true'});
  var layer=document.createElement('div');
  layer.className='wm-layer';
  host.appendChild(svg);
  host.appendChild(layer);
  var anchors={};
  var result={anchors:anchors,draftPinEl:null};
  var fmt=function(pts){return pts.map(function(p){return p[0].toFixed(1)+','+p[1].toFixed(1);}).join(' ');};

  map.pins.forEach(function(p){anchors['pin:'+p.id]=[p.x*WM_W,p.y*WM_H];});
  // 隐藏的项不画；被元素列表定位到的隐藏项（opt.reveal）临时画出来，用虚线表示「其实是隐藏的」
  var hid=wmHiddenMap(map),reveal=opt.reveal||null;
  var isRevealed=function(kind,id){return !!reveal&&reveal.t===kind&&reveal.id===id&&hid[kind+':'+id]===true;};
  var isShown=function(kind,id){return hid[kind+':'+id]!==true||isRevealed(kind,id);};
  var zoneLabels=[];
  map.zones.forEach(function(z){
    var pts=z.pts.map(function(p){return [p[0]*WM_W,p[1]*WM_H];});
    var c=wmPolyCenter(pts);
    anchors['zone:'+z.id]=c; // 隐藏的分区也要有锚点：被临时显示的关联线要连到它
    if(!isShown('zone',z.id))return;
    var sel=wmIsSelected(opt.sel,'zone',z.id);
    var poly={points:fmt(pts),fill:z.color,'fill-opacity':sel?'0.32':'0.12',stroke:z.color,'stroke-width':sel?'4':'2.5','stroke-linejoin':'round'};
    if(isRevealed('zone',z.id))poly['stroke-dasharray']='8 5';
    svg.appendChild(wmSvgEl('polygon',poly));
    if(z.hideName!==true||isRevealed('zone',z.id))zoneLabels.push(wmMakeLabel('wm-lbl wm-zlbl',z.name,c[0],c[1],z.color,'zone',z.id,sel));
  });
  var linkLabels=[];
  map.links.forEach(function(l){
    var a=anchors[l.a.t+':'+l.a.id],b=anchors[l.b.t+':'+l.b.id];
    if(!a||!b||!isShown('link',l.id))return;
    var lsel=wmIsSelected(opt.sel,'link',l.id);
    svg.appendChild(wmSvgEl('line',{x1:a[0].toFixed(1),y1:a[1].toFixed(1),x2:b[0].toFixed(1),y2:b[1].toFixed(1),stroke:l.color,'stroke-width':lsel?'5':'3','stroke-linecap':'round','stroke-dasharray':'10 6'}));
    if(l.hideName!==true||isRevealed('link',l.id))linkLabels.push(wmMakeLabel('wm-lbl wm-llbl',l.name,(a[0]+b[0])/2,(a[1]+b[1])/2,l.color,'link',l.id,lsel));
  });
  // 分区草稿：点数不足 3 个画折线，够了画成闭合的虚线多边形
  if(opt.draftPts&&opt.draftPts.length){
    var dpts=opt.draftPts.map(function(p){return [p[0]*WM_W,p[1]*WM_H];});
    var dc=opt.draftColor||WM_COLORS[0].hex;
    var common={fill:'none',stroke:dc,'stroke-width':'2.5','stroke-dasharray':'7 5','stroke-linejoin':'round','stroke-linecap':'round'};
    if(dpts.length>=3){
      common.fill=dc;common['fill-opacity']='0.12';common.points=fmt(dpts);
      svg.appendChild(wmSvgEl('polygon',common));
    }else if(dpts.length===2){
      common.points=fmt(dpts);
      svg.appendChild(wmSvgEl('polyline',common));
    }
  }
  zoneLabels.forEach(function(el){layer.appendChild(el);});
  linkLabels.forEach(function(el){layer.appendChild(el);});
  if(opt.draftPts){
    opt.draftPts.forEach(function(p,i){
      var dot=document.createElement('div');
      dot.className='wm-dot'+(i===0?' wm-dot-first':'');
      dot.style.left=(p[0]*WM_W).toFixed(1)+'px';
      dot.style.top=(p[1]*WM_H).toFixed(1)+'px';
      dot.style.setProperty('--wm-c',opt.draftColor||WM_COLORS[0].hex);
      layer.appendChild(dot);
    });
  }
  map.pins.forEach(function(p){
    if(!isShown('pin',p.id))return;
    var sel=wmIsSelected(opt.sel,'pin',p.id);
    var box=document.createElement('div');
    box.className='wm-pin'+(opt.liftPinId===p.id?' wm-lifted':'');
    box.style.left=(p.x*WM_W).toFixed(1)+'px';
    box.style.top=(p.y*WM_H).toFixed(1)+'px';
    box.style.setProperty('--wm-c',p.color);
    var body=document.createElement('div');
    body.className='wm-pin-body'+(sel?' wm-sel':'');
    body.setAttribute('data-wm-t','pin');
    body.setAttribute('data-wm-id',p.id);
    if(p.hideName!==true||isRevealed('pin',p.id)){
      var nm=document.createElement('div');
      nm.className='wm-pin-name';
      nm.textContent=p.name;
      body.appendChild(nm);
    }
    body.appendChild(wmPinIcon(p.color,p.type));
    box.appendChild(body);
    layer.appendChild(box);
  });
  if(opt.draftPin){
    var dp=document.createElement('div');
    dp.className='wm-pin wm-pin-draft';
    dp.style.left=(opt.draftPin.x*WM_W).toFixed(1)+'px';
    dp.style.top=(opt.draftPin.y*WM_H).toFixed(1)+'px';
    var db=document.createElement('div');
    db.className='wm-pin-body';
    db.setAttribute('data-wm-draft','pin');
    db.appendChild(wmPinIcon(opt.draftColor||WM_COLORS[0].hex));
    dp.appendChild(db);
    layer.appendChild(dp);
    result.draftPinEl=dp;
  }
  return result;
}

// ==================== 五、编辑器：视图（缩放平移）、横屏、手势 ====================
var wmEd={
  open:false,session:0,
  work:null,base:'',                 // work：编辑中的副本（含图片）；base：打开时的签名，用来判断有没有改动
  mode:'idle',editMode:false,        // mode：idle | zone | pin | link | vertex（编辑分区边界点）；editMode：单击名称/大头针/线时是编辑还是预览
  color:WM_COLORS[0].hex,            // 新建时弹窗默认选中的颜色，也是草稿预览的颜色；每次创建后记住所选颜色
  draftPts:[],draftPin:null,linkSel:[],
  undo:[],
  view:{s:1,tx:0,ty:0,min:0},
  rot:0,enteredFs:false,locked:false,
  ptr:{},pinch:null,lpTimer:0,pinDrag:null,
  anchors:{},draftPinEl:null,
  dlgOpen:false,dlgCancel:null,saving:false,
  toastTimer:0,resizeTimer:0,renderRaf:0,dlgColorsBuilt:false,dlgColor:WM_COLORS[0].hex,
  countTimer:0,                      // 提示词字数的延迟刷新计时器（拖动时每 150ms 最多算一次）
  promptOpen:false,promptSnap:'',    // promptOpen：提示词预览面板是否打开；promptSnap：打开时的快照，关闭时有变化才记一步撤回
  listOpen:false,focus:null,         // listOpen：元素列表是否展开；focus：列表里点选并高亮的项 {t,id}
  dlgPinType:'pin'                   // 弹窗里当前选中的地点类型
};
// 边界点编辑状态：zoneId 正在编辑的分区；sel 选中的点；link 是否联动相邻分区的同一顶点；drag 拖动中的点；snapTo 吸附目标
var wmVtx={zoneId:'',sel:-1,link:true,drag:null,snapTo:null};
// 首次进入导览的状态：wmTour 为 null 表示没有在讲解；wmTourTimer 是延迟出现的计时器
var wmTour=null;
var wmTourTimer=0;

function wmSig(m){return JSON.stringify([m.enabled,m.autoSpatial,m.offRel,m.zones,m.pins,m.links]);}
function wmViewSize(){
  var c=wmEl('wmCenter');
  return {w:c?c.clientWidth:0,h:c?c.clientHeight:0};
}
function wmViewToMap(vx,vy){
  var v=wmEd.view;
  return {x:(vx-v.tx)/v.s,y:(vy-v.ty)/v.s};
}
// 地图比视口小时居中；比视口大时不允许拖出空白
function wmClampView(){
  var size=wmViewSize(),v=wmEd.view;
  var mw=WM_W*v.s,mh=WM_H*v.s;
  v.tx=mw<=size.w?(size.w-mw)/2:Math.min(0,Math.max(size.w-mw,v.tx));
  v.ty=mh<=size.h?(size.h-mh)/2:Math.min(0,Math.max(size.h-mh,v.ty));
}
function wmApplyView(){
  var st=wmEl('wmStage'),v=wmEd.view;
  if(!st)return;
  st.style.transform='translate('+v.tx.toFixed(2)+'px,'+v.ty.toFixed(2)+'px) scale('+v.s.toFixed(5)+')';
  st.style.setProperty('--wm-inv',(1/v.s).toFixed(5)); // 文字和圆点反向缩放，屏幕上大小不随缩放变化
}
function wmZoomAt(newScale,cx,cy){
  var v=wmEd.view;
  var s=wmClamp(newScale,v.min,v.min*8);
  var mx=(cx-v.tx)/v.s,my=(cy-v.ty)/v.s;
  v.s=s;v.tx=cx-mx*s;v.ty=cy-my*s;
  wmClampView();wmApplyView();
}
// 容器尺寸变化（旋转手机、窗口缩放）后重新计算最小缩放；原本是「整图」状态就继续保持整图
function wmRefit(){
  var size=wmViewSize(),v=wmEd.view;
  if(!size.w||!size.h)return;
  var atFit=!v.min||Math.abs(v.s-v.min)<1e-4;
  v.min=Math.min(size.w/WM_W,size.h/WM_H);
  v.s=atFit?v.min:wmClamp(v.s,v.min,v.min*8);
  wmClampView();wmApplyView();
}
// 决定是否需要用 CSS 把整个编辑器旋转 90°：设备已经是横向就不转；竖屏（系统横屏锁定失败或不支持）就转
function wmLayout(){
  var ov=wmEl('wmEditorOv'),root=wmEl('wmRoot');
  if(!ov||!root||!wmEd.open)return;
  var W=ov.clientWidth,H=ov.clientHeight;
  if(!W||!H)return;
  if(W>=H){
    wmEd.rot=0;
    root.style.width='';root.style.height='';root.style.transform='';
    root.style.setProperty('--wm-pt','env(safe-area-inset-top,0px)');
    root.style.setProperty('--wm-pr','env(safe-area-inset-right,0px)');
    root.style.setProperty('--wm-pb','env(safe-area-inset-bottom,0px)');
    root.style.setProperty('--wm-pl','env(safe-area-inset-left,0px)');
  }else{
    wmEd.rot=90;
    root.style.width=H+'px';
    root.style.height=W+'px';
    root.style.transform='translateX('+W+'px) rotate(90deg)';
    // 顺时针转 90° 后：屏幕顶部在容器左边，屏幕右侧在容器上边，屏幕底部在容器右边，屏幕左侧在容器下边
    root.style.setProperty('--wm-pl','env(safe-area-inset-top,0px)');
    root.style.setProperty('--wm-pt','env(safe-area-inset-right,0px)');
    root.style.setProperty('--wm-pr','env(safe-area-inset-bottom,0px)');
    root.style.setProperty('--wm-pb','env(safe-area-inset-left,0px)');
  }
  wmRefit();
  if(wmTour)wmTourReflow();
}
// 屏幕坐标 → 编辑器容器自己的坐标（旋转模式下要换算）
function wmToLocal(clientX,clientY){
  var ov=wmEl('wmEditorOv'),r=ov.getBoundingClientRect();
  var x=clientX-r.left,y=clientY-r.top;
  if(wmEd.rot===90)return {x:y,y:ov.clientWidth-x};
  return {x:x,y:y};
}
function wmLocalPoint(e){
  var l=wmToLocal(e.clientX,e.clientY),c=wmEl('wmCenter');
  return {x:l.x-c.offsetLeft,y:l.y-c.offsetTop};
}
function wmDocFullscreenEl(){return document.fullscreenElement||document.webkitFullscreenElement||null;}
// 竖屏手机：先请求全屏并锁定横屏（安卓 Chrome 可用，iOS Safari 不支持）；失败就保持 CSS 旋转兜底
function wmEnterLandscape(){
  var ov=wmEl('wmEditorOv'),session=wmEd.session;
  if(!ov||ov.clientWidth>=ov.clientHeight)return;
  try{
    var req=ov.requestFullscreen||ov.webkitRequestFullscreen;
    if(!req||wmDocFullscreenEl())return;
    var onEntered=function(){
      if(session!==wmEd.session||!wmEd.open){ // 请求期间编辑器已经关了：马上退出全屏
        try{var ex=document.exitFullscreen||document.webkitExitFullscreen;if(ex){var r0=ex.call(document);if(r0&&r0.catch)r0.catch(function(){});}}catch(e0){}
        return;
      }
      wmEd.enteredFs=true;
      try{
        var so=window.screen&&screen.orientation;
        if(so&&typeof so.lock==='function'){
          var r=so.lock('landscape');
          if(r&&typeof r.then==='function'){
            r.then(function(){
              if(session!==wmEd.session||!wmEd.open){try{screen.orientation.unlock();}catch(e1){}return;}
              wmEd.locked=true;wmLayout();
            },function(){});
          }
        }
      }catch(e2){}
    };
    var p=req.call(ov);
    if(p&&typeof p.then==='function')p.then(onEntered,function(){});
    else onEntered();
  }catch(e){}
}
function wmLeaveLandscape(){
  try{if(wmEd.locked&&window.screen&&screen.orientation&&typeof screen.orientation.unlock==='function')screen.orientation.unlock();}catch(e){}
  try{
    if(wmEd.enteredFs&&wmDocFullscreenEl()){
      var ex=document.exitFullscreen||document.webkitExitFullscreen;
      if(ex){var r=ex.call(document);if(r&&r.catch)r.catch(function(){});}
    }
  }catch(e2){}
  wmEd.locked=false;wmEd.enteredFs=false;
}

// —— 手势：单指拖动平移，双指缩放；点击和长按拖动大头针由下面的函数分发 ——
function wmClearLongPress(){
  if(wmEd.lpTimer){clearTimeout(wmEd.lpTimer);wmEd.lpTimer=0;}
}
function wmOnDown(e){
  if(!wmEd.open||wmEd.dlgOpen)return;
  if(e.pointerType==='mouse'&&e.button!==0)return;
  var tg=e.target;
  if(tg&&tg.closest&&tg.closest('.wm-ok,.wm-popup,.wm-hint,.wm-toast,.wm-vbar,.wm-pcount,.wm-list'))return; // 这些控件自己处理点击
  if(wmEd.pinDrag||wmVtx.drag||Object.keys(wmEd.ptr).length>=2)return; // 正在拖大头针或边界点时不响应第二根手指
  var p=wmLocalPoint(e);
  var rec={x:p.x,y:p.y,sx:p.x,sy:p.y,t0:Date.now(),target:tg,moved:false};
  wmEd.ptr[e.pointerId]=rec;
  var center=wmEl('wmCenter');
  try{center.setPointerCapture(e.pointerId);}catch(err){}
  if(Object.keys(wmEd.ptr).length===1&&wmVtxBegin(e,rec,tg))return; // 按在边界点手柄上：由边界点编辑接管
  var ids=Object.keys(wmEd.ptr);
  if(ids.length===1){
    // 按住 420ms 不动，大头针进入「可拖动」状态：新建时的草稿大头针，或编辑模式下已有的大头针
    var closest=tg&&tg.closest?tg:null;
    var draftEl=closest&&closest.closest('[data-wm-draft="pin"]');
    var pinEl=closest&&closest.closest('.wm-pin-body[data-wm-t="pin"]');
    var canDragDraft=wmEd.mode==='pin'&&!!wmEd.draftPin&&!!draftEl;
    var canDragPin=wmEd.mode==='idle'&&wmEd.editMode&&!!pinEl;
    if(canDragDraft||canDragPin){
      var pid=e.pointerId,pinId=canDragPin?pinEl.getAttribute('data-wm-id'):'';
      wmClearLongPress();
      wmEd.lpTimer=setTimeout(function(){
        wmEd.lpTimer=0;
        var r=wmEd.ptr[pid];
        if(!wmEd.open||!r||r.moved||Object.keys(wmEd.ptr).length!==1)return;
        var m=wmViewToMap(r.x,r.y);
        if(canDragDraft){
          if(!wmEd.draftPin)return;
          wmEd.pinDrag={id:pid,pinId:'',ox:m.x/WM_W-wmEd.draftPin.x,oy:m.y/WM_H-wmEd.draftPin.y};
          if(wmEd.draftPinEl)wmEd.draftPinEl.classList.add('wm-lifted');
        }else{
          var pin=wmFindItem({t:'pin',id:pinId});
          if(!pin)return;
          // snap：拖动前的整体状态，松手后确实移动了才会作为一步撤回
          wmEd.pinDrag={id:pid,pinId:pin.id,ox:m.x/WM_W-pin.x,oy:m.y/WM_H-pin.y,sx:pin.x,sy:pin.y,snap:wmSnap(wmEd.work)};
          wmHidePopup();
          wmRenderAll();
        }
        center.classList.add('wm-dragging');
        try{if(navigator.vibrate)navigator.vibrate(15);}catch(err2){}
      },WM_LONGPRESS_MS);
    }
  }else{
    wmClearLongPress();
    ids.forEach(function(id){wmEd.ptr[id].moved=true;}); // 两指操作不算点击
    var a=wmEd.ptr[ids[0]],b=wmEd.ptr[ids[1]];
    var mid={x:(a.x+b.x)/2,y:(a.y+b.y)/2};
    var mm=wmViewToMap(mid.x,mid.y);
    wmEd.pinch={d0:Math.max(1,Math.hypot(a.x-b.x,a.y-b.y)),s0:wmEd.view.s,mx:mm.x,my:mm.y};
  }
}
function wmOnMove(e){
  var rec=wmEd.ptr[e.pointerId];
  if(!wmEd.open||!rec)return;
  var p=wmLocalPoint(e);
  var wasMoved=rec.moved;
  if(Math.hypot(p.x-rec.sx,p.y-rec.sy)>WM_TAP_SLOP)rec.moved=true;
  if(wmVtx.drag&&wmVtx.drag.id===e.pointerId){
    wmVtxMove(p,rec);
    rec.x=p.x;rec.y=p.y;
    return;
  }
  if(wmEd.pinDrag&&wmEd.pinDrag.id===e.pointerId){
    var d=wmEd.pinDrag,m=wmViewToMap(p.x,p.y);
    var nx=wmClamp(m.x/WM_W-d.ox,0,1),ny=wmClamp(m.y/WM_H-d.oy,0,1);
    if(d.pinId){
      var pin=wmFindItem({t:'pin',id:d.pinId});
      if(pin){pin.x=nx;pin.y=ny;}
      wmScheduleRender(); // 与这个大头针相连的关联线跟着重画
    }else{
      wmEd.draftPin={x:nx,y:ny};
      wmUpdateDraftPinPos();
    }
    rec.x=p.x;rec.y=p.y;
    return;
  }
  var ids=Object.keys(wmEd.ptr);
  var v=wmEd.view;
  if(ids.length===1){
    if(rec.moved){
      wmClearLongPress();
      // 刚越过点击阈值的那一下，把从按下起的全部位移一次补上，拖动不会「吃掉」前几个像素
      var dx=wasMoved?p.x-rec.x:p.x-rec.sx,dy=wasMoved?p.y-rec.y:p.y-rec.sy;
      v.tx+=dx;v.ty+=dy;
      wmClampView();wmApplyView();wmHidePopup();
    }
  }else if(wmEd.pinch){
    rec.x=p.x;rec.y=p.y;
    var a=wmEd.ptr[ids[0]],b=wmEd.ptr[ids[1]];
    var mid={x:(a.x+b.x)/2,y:(a.y+b.y)/2};
    var s=wmClamp(wmEd.pinch.s0*Math.hypot(a.x-b.x,a.y-b.y)/wmEd.pinch.d0,v.min,v.min*8);
    v.s=s;
    v.tx=mid.x-wmEd.pinch.mx*s; // 两指中点下面的地图位置保持不动，同时支持双指平移
    v.ty=mid.y-wmEd.pinch.my*s;
    wmClampView();wmApplyView();wmHidePopup();
  }
  rec.x=p.x;rec.y=p.y;
}
function wmOnUp(e){
  var rec=wmEd.ptr[e.pointerId];
  if(!rec)return;
  delete wmEd.ptr[e.pointerId];
  try{wmEl('wmCenter').releasePointerCapture(e.pointerId);}catch(err){}
  wmClearLongPress();
  if(wmVtx.drag&&wmVtx.drag.id===e.pointerId){
    wmVtxFinishDrag(e.type==='pointercancel');
    return;
  }
  if(wmEd.pinDrag&&wmEd.pinDrag.id===e.pointerId){
    wmFinishPinDrag(e.type==='pointercancel');
    return;
  }
  if(wmEd.pinch){
    wmEd.pinch=null;
    Object.keys(wmEd.ptr).forEach(function(id){wmEd.ptr[id].moved=true;}); // 剩下的那根手指继续拖动，但不会触发点击
    return;
  }
  if(e.type==='pointercancel')return;
  if(!rec.moved&&Date.now()-rec.t0<600&&Object.keys(wmEd.ptr).length===0)wmOnTap(rec);
}
// 拖动大头针时每个 pointermove 都重画会白白浪费，合并成每帧最多一次
function wmScheduleRender(){
  if(wmEd.renderRaf)return;
  if(!window.requestAnimationFrame){wmRenderAll();return;}
  wmEd.renderRaf=window.requestAnimationFrame(function(){
    wmEd.renderRaf=0;
    if(wmEd.open)wmRenderAll();
  });
}
function wmCancelScheduledRender(){
  if(wmEd.renderRaf&&window.cancelAnimationFrame)window.cancelAnimationFrame(wmEd.renderRaf);
  wmEd.renderRaf=0;
}
// 结束大头针拖动：cancelled=true（系统打断/切换模式）时已有大头针回到原位；
// 正常松手时，位置真的变了才记一步撤回，没动就不占撤回步数
function wmFinishPinDrag(cancelled){
  var d=wmEd.pinDrag;
  if(!d)return;
  wmEd.pinDrag=null;
  wmCancelScheduledRender();
  var c=wmEl('wmCenter');
  if(c)c.classList.remove('wm-dragging');
  if(!d.pinId){
    if(wmEd.draftPinEl)wmEd.draftPinEl.classList.remove('wm-lifted');
    return;
  }
  var pin=wmFindItem({t:'pin',id:d.pinId});
  if(pin){
    if(cancelled){
      pin.x=d.sx;pin.y=d.sy;
    }else{
      pin.x=Math.round(pin.x*10000)/10000;
      pin.y=Math.round(pin.y*10000)/10000;
      if(Math.hypot((pin.x-d.sx)*WM_W,(pin.y-d.sy)*WM_H)>=0.5)wmPushUndo(d.snap);
      else{pin.x=d.sx;pin.y=d.sy;}
    }
  }
  wmRenderAll();
}
function wmOnWheel(e){
  if(!wmEd.open||wmEd.dlgOpen)return;
  if(e.target&&e.target.closest&&e.target.closest('.wm-list'))return; // 在元素列表上滚轮是滚动列表，不是缩放地图
  e.preventDefault();
  var p=wmLocalPoint(e);
  wmZoomAt(wmEd.view.s*Math.exp(-e.deltaY*0.0015),p.x,p.y);
  wmHidePopup();
}
function wmOnResize(){
  if(wmEd.resizeTimer)clearTimeout(wmEd.resizeTimer);
  wmEd.resizeTimer=setTimeout(function(){wmEd.resizeTimer=0;wmLayout();},60);
}
function wmOnKey(e){
  if(!wmEd.open||e.key!=='Escape')return;
  e.preventDefault();
  if(wmTour){wmTourEnd();return;} // 导览中按 Esc 只关导览
  wmRequestExit(false);
}
function wmBlock(e){e.preventDefault();}
// 编辑器打开期间才挂这些监听，关闭时全部摘掉，不留泄漏
function wmBindEditor(){
  var c=wmEl('wmCenter');
  c.addEventListener('pointerdown',wmOnDown);
  c.addEventListener('pointermove',wmOnMove);
  c.addEventListener('pointerup',wmOnUp);
  c.addEventListener('pointercancel',wmOnUp);
  c.addEventListener('wheel',wmOnWheel,{passive:false});
  c.addEventListener('contextmenu',wmBlock);
  var pop=wmEl('wmPopup');
  if(pop)pop.addEventListener('click',wmHidePopup); // 点浮窗本身也能关闭它
  window.addEventListener('resize',wmOnResize);
  window.addEventListener('orientationchange',wmOnResize);
  document.addEventListener('keydown',wmOnKey);
  document.addEventListener('gesturestart',wmBlock); // iOS：禁止页面级捏合缩放
}
function wmUnbindEditor(){
  var c=wmEl('wmCenter');
  if(c){
    c.removeEventListener('pointerdown',wmOnDown);
    c.removeEventListener('pointermove',wmOnMove);
    c.removeEventListener('pointerup',wmOnUp);
    c.removeEventListener('pointercancel',wmOnUp);
    c.removeEventListener('wheel',wmOnWheel,{passive:false});
    c.removeEventListener('contextmenu',wmBlock);
  }
  var pop=wmEl('wmPopup');
  if(pop)pop.removeEventListener('click',wmHidePopup);
  window.removeEventListener('resize',wmOnResize);
  window.removeEventListener('orientationchange',wmOnResize);
  document.removeEventListener('keydown',wmOnKey);
  document.removeEventListener('gesturestart',wmBlock);
}

// ==================== 六、编辑器：打开/关闭、新建、编辑与删除、撤回、保存退出 ====================
// ==================== 十、首次进入导览：星笺讲解两侧工具图标 ====================
// 导览层放在 wmRoot 里面（不是 body）：竖屏时编辑器会请求全屏、也可能被 CSS 旋转 90°，
// 放在 body 的元素在全屏下看不见，放在 wmRoot 里则会跟着编辑器一起旋转，位置和文字方向都对得上
var WM_TOUR_DONE_KEY='bj_wmTourDone';
var WM_TOUR_START_DELAY=500; // 等全屏/横屏切换和布局稳定后再出现
var WM_TOUR_STEPS=[
  {id:'wmBtnEdit',text:'编辑开关。打开后，点地图上已有的东西就能改；关掉就只是看看。'},
  {id:'wmBtnZone',text:'新建分区。在地图上点出边界，围成一片区域，最后点 ✓ 确定。'},
  {id:'wmBtnPin',text:'新建地点戳。点一下就钉一枚大头针，长按它还能拖到别处。'},
  {id:'wmBtnLink',text:'新建关联线。依次点两个地方，把它们连起来，最多选两个哦。'},
  {id:'wmBtnList',text:'元素列表。分区、地点、连线都收在这里，能搜、能定位、能改。'},
  {id:'wmBtnEnable',text:'启用开关。开着，保存后地图文字才会追加到世界观设定后面。'},
  {id:'wmBtnUndo',text:'撤回。点错了别慌，一步一步退回去就好。'},
  {id:'wmBtnClearAll',text:'清空所有设置。只清分区、地点和连线，地图图片不动，还能撤回。'},
  {id:'wmBtnExit',text:'退出。有没保存的改动时，星笺会先拦你一下。'},
  {id:'wmBtnSave',text:'保存。改完记得点它，不然就白忙啦。更详细的玩法，翻翻星笺新手引导吧。'}
];

function wmTourIsDone(){
  try{return ld(WM_TOUR_DONE_KEY,false)===true;}
  catch(e){return true;} // 读不到记录时宁可不弹，也不要每次都打扰
}
function wmTourStepVisible(step){
  var el=wmEl(step.id);
  return !!el&&el.offsetWidth>0&&el.offsetHeight>0;
}
function wmTourScheduleStart(){
  if(wmTourTimer){clearTimeout(wmTourTimer);wmTourTimer=0;}
  var session=wmEd.session;
  wmTourTimer=setTimeout(function(){
    wmTourTimer=0;
    if(!wmEd.open||session!==wmEd.session)return;
    wmTourStart();
  },WM_TOUR_START_DELAY);
}
function wmTourStart(){
  if(wmTour||!wmEd.open||wmEd.dlgOpen||wmEd.promptOpen)return;
  if(wmTourIsDone())return;
  if(typeof tutSession!=='undefined'&&tutSession)return; // 新手引导正在进行时让路，这次不记为已看，下次进入再讲
  var root=wmEl('wmRoot');
  if(!root)return;
  var steps=WM_TOUR_STEPS.filter(wmTourStepVisible);
  if(!steps.length)return;
  sv(WM_TOUR_DONE_KEY,true); // 一开始就记为已看：中途取消也不会反复弹出
  var layer=document.createElement('div');
  layer.className='wm-tour';
  layer.setAttribute('role','dialog');
  layer.setAttribute('aria-modal','true');
  layer.setAttribute('aria-label','星笺工具讲解');
  var spot=document.createElement('div');
  spot.className='wm-tour-spot';
  spot.setAttribute('aria-hidden','true');
  var bubble=document.createElement('div');
  bubble.className='wm-tour-bubble';
  var row=document.createElement('div');
  row.className='xj-tut-row';
  var avatar=document.createElement('img');
  avatar.className='xj-tut-avatar';
  avatar.alt='星笺';
  avatar.src=(typeof getXjSkinImg==='function')?getXjSkinImg():'';
  var textEl=document.createElement('div');
  textEl.className='xj-tut-text';
  textEl.setAttribute('aria-live','polite');
  row.appendChild(avatar);
  row.appendChild(textEl);
  var foot=document.createElement('div');
  foot.className='xj-tut-foot';
  var countEl=document.createElement('span');
  countEl.className='xj-tut-count';
  var btns=document.createElement('span');
  btns.className='xj-tut-btns';
  var cancelBtn=document.createElement('button');
  cancelBtn.type='button';
  cancelBtn.className='xj-tut-btn';
  cancelBtn.textContent='取消';
  var okBtn=document.createElement('button');
  okBtn.type='button';
  okBtn.className='xj-tut-btn primary';
  okBtn.textContent='确定';
  btns.appendChild(cancelBtn);
  btns.appendChild(okBtn);
  foot.appendChild(countEl);
  foot.appendChild(btns);
  bubble.appendChild(row);
  bubble.appendChild(foot);
  layer.appendChild(spot);
  layer.appendChild(bubble);
  layer.addEventListener('pointerdown',function(e){e.stopPropagation();}); // 导览期间不让手势穿透到地图
  layer.addEventListener('wheel',function(e){e.preventDefault();},{passive:false});
  root.appendChild(layer);
  wmTour={steps:steps,idx:0,cur:null,layer:layer,spot:spot,bubble:bubble,textEl:textEl,countEl:countEl,okBtn:okBtn,cancelBtn:cancelBtn,raf:0};
  cancelBtn.onclick=function(){
    cancelBtn.disabled=true;
    okBtn.disabled=true;
    wmTourEnd();
  };
  okBtn.onclick=function(){
    if(!wmTour)return;
    cancelBtn.disabled=true;
    okBtn.disabled=true;
    wmTour.idx++;
    wmTourRender();
  };
  wmTourRender();
}
function wmTourRender(){
  var t=wmTour;
  if(!t)return;
  var step=null;
  while(t.idx<t.steps.length){
    if(wmTourStepVisible(t.steps[t.idx])){step=t.steps[t.idx];break;}
    t.idx++;
  }
  if(!step){wmTourEnd();return;}
  t.cur=wmEl(step.id);
  t.textEl.textContent=step.text;
  t.countEl.textContent=(t.idx+1)+' / '+t.steps.length;
  t.okBtn.disabled=false;
  t.cancelBtn.disabled=false;
  wmTourPlace();
  try{t.okBtn.focus({preventScroll:true});}catch(e){}
}
// 目标按钮的屏幕矩形 → 编辑器自己的坐标（旋转模式下要换算）
function wmTourPlace(){
  var t=wmTour;
  if(!t||!t.cur||!t.layer.parentNode)return;
  var W=t.layer.clientWidth,H=t.layer.clientHeight;
  if(!W||!H)return;
  var r=t.cur.getBoundingClientRect();
  var p1=wmToLocal(r.left,r.top),p2=wmToLocal(r.right,r.bottom);
  var pad=6,gap=12,margin=8;
  var left=Math.min(p1.x,p2.x),top=Math.min(p1.y,p2.y);
  var w=Math.abs(p2.x-p1.x),h=Math.abs(p2.y-p1.y);
  t.spot.style.left=Math.round(left-pad)+'px';
  t.spot.style.top=Math.round(top-pad)+'px';
  t.spot.style.width=Math.round(w+pad*2)+'px';
  t.spot.style.height=Math.round(h+pad*2)+'px';
  var bw=Math.min(280,W-margin*2);
  t.bubble.style.width=bw+'px';
  var bh=t.bubble.offsetHeight||110;
  var bx=(left+w/2<W/2)?(left+w+pad+gap):(left-pad-gap-bw); // 左侧图标 → 气泡在右边；右侧图标 → 气泡在左边
  var by=top+h/2-bh/2;
  bx=Math.max(margin,Math.min(W-bw-margin,bx));
  by=Math.max(margin,Math.min(H-bh-margin,by));
  t.bubble.style.left=Math.round(bx)+'px';
  t.bubble.style.top=Math.round(by)+'px';
}
// 窗口尺寸/旋转变化后，在下一帧重新定位
function wmTourReflow(){
  var t=wmTour;
  if(!t||t.raf)return;
  if(typeof requestAnimationFrame!=='function'){wmTourPlace();return;}
  t.raf=requestAnimationFrame(function(){
    if(!wmTour)return;
    wmTour.raf=0;
    wmTourPlace();
  });
}
function wmTourEnd(){
  if(wmTourTimer){clearTimeout(wmTourTimer);wmTourTimer=0;}
  var t=wmTour;
  if(!t)return;
  wmTour=null;
  if(t.raf&&typeof cancelAnimationFrame==='function')cancelAnimationFrame(t.raf);
  t.okBtn.onclick=null;
  t.cancelBtn.onclick=null;
  if(t.layer.parentNode)t.layer.parentNode.removeChild(t.layer);
}

function wmOpenEditor(){
  if(wmEd.open||_wmCrop.open)return;
  if(!worldMap||!worldMap.img){showToast('请先上传地图');return;}
  // 手势全部基于 Pointer Events；不支持的浏览器直接说明原因，不进入一个用不了的界面
  if(!window.PointerEvent){showToast('当前浏览器不支持地图编辑，请升级浏览器后再试',3500);return;}
  var ov=wmEl('wmEditorOv'),stage=wmEl('wmStage');
  if(!ov||!stage)return;
  wmEd.session++;
  wmEd.open=true;
  wmEd.work=wmCloneMap(worldMap); // 编辑的是副本，点「保存」才写回；「退出」直接丢弃
  wmEd.base=wmSig(wmEd.work);
  wmEd.mode='idle';wmEd.editMode=false;
  wmEd.draftPts=[];wmEd.draftPin=null;wmEd.linkSel=[];wmEd.undo=[];
  wmEd.ptr={};wmEd.pinch=null;wmEd.pinDrag=null;
  wmEd.dlgOpen=false;wmEd.dlgCancel=null;wmEd.saving=false;
  wmEd.view={s:1,tx:0,ty:0,min:0};
  wmEd.promptOpen=false;wmEd.promptSnap='';
  wmVtxReset();
  wmListReset();
  wmBuildDialogColors();
  while(stage.firstChild)stage.removeChild(stage.firstChild);
  var img=document.createElement('img');
  img.alt='世界地图';
  img.draggable=false;
  img.src=wmEd.work.img;
  var host=document.createElement('div');
  host.className='wm-shapes';
  host.id='wmShapes';
  stage.appendChild(img);
  stage.appendChild(host);
  ov.classList.add('show');
  document.body.classList.add('wm-open'); // 全局悬浮球层级比编辑器高，会盖住右侧按钮，编辑期间先藏起来
  wmNavPush('wmEditorOv');
  wmBindEditor();
  wmEnterLandscape();
  wmLayout();
  wmRenderAll();
  wmTourScheduleStart();
}
function wmCloseEditor(){
  if(!wmEd.open)return;
  wmEd.open=false;
  wmTourEnd();
  wmClearLongPress();
  wmVtxReset();
  wmListReset();
  wmCancelScheduledRender();
  if(wmEd.countTimer){clearTimeout(wmEd.countTimer);wmEd.countTimer=0;}
  if(wmEd.toastTimer){clearTimeout(wmEd.toastTimer);wmEd.toastTimer=0;}
  if(wmEd.resizeTimer){clearTimeout(wmEd.resizeTimer);wmEd.resizeTimer=0;}
  wmUnbindEditor();
  wmLeaveLandscape();
  var ov=wmEl('wmEditorOv'),root=wmEl('wmRoot'),stage=wmEl('wmStage');
  if(ov)ov.classList.remove('show');
  document.body.classList.remove('wm-open');
  if(root){root.style.width='';root.style.height='';root.style.transform='';}
  if(stage)while(stage.firstChild)stage.removeChild(stage.firstChild); // 释放图片和形状节点
  var modal=wmEl('wmModal'),popup=wmEl('wmPopup'),toast=wmEl('wmToast'),center=wmEl('wmCenter'),promptModal=wmEl('wmPromptModal');
  if(modal)modal.classList.remove('show');
  if(promptModal)promptModal.classList.remove('show');
  if(popup)popup.classList.remove('show');
  if(toast)toast.classList.remove('show');
  if(center)center.classList.remove('wm-dragging','wm-editing');
  wmNavPop('wmEditorOv');
  wmEd.work=null;wmEd.undo=[];wmEd.draftPts=[];wmEd.draftPin=null;wmEd.linkSel=[];
  wmEd.ptr={};wmEd.pinch=null;wmEd.pinDrag=null;wmEd.dlgOpen=false;wmEd.dlgCancel=null;
  wmEd.promptOpen=false;wmEd.promptSnap='';
  wmRenderInline();
}
// 轻提示放在编辑器内部，方向和地图一致（全局 toast 在旋转模式下是歪的）
function wmToast(msg){
  var el=wmEl('wmToast');
  if(!el||!wmEd.open){showToast(msg);return;}
  el.textContent=msg;
  el.classList.add('show');
  if(wmEd.toastTimer)clearTimeout(wmEd.toastTimer);
  wmEd.toastTimer=setTimeout(function(){wmEd.toastTimer=0;el.classList.remove('show');},2200);
}
// 颜色选择在名称/内容弹窗里（新建和编辑共用同一排），地图上方不再放颜色条，不遮挡地图
function wmBuildDialogColors(){
  if(wmEd.dlgColorsBuilt)return;
  var box=wmEl('wmFieldColors');
  if(!box)return;
  WM_COLORS.forEach(function(c){
    var b=document.createElement('button');
    b.type='button';
    b.className='wm-color';
    b.setAttribute('role','radio');
    b.setAttribute('aria-label',c.name+'色');
    b.setAttribute('data-hex',c.hex);
    b.style.setProperty('--wm-c',c.hex);
    b.addEventListener('click',function(){wmSetDlgColor(c.hex);});
    box.appendChild(b);
  });
  wmEd.dlgColorsBuilt=true;
}
function wmSetPinType(type){
  wmEd.dlgPinType=wmCleanPinType(type);
  wmRefreshPinTypes();
  var checked=document.querySelector('#wmFieldPinTypes [aria-checked="true"]');
  if(checked)checked.focus(); // 重画后把键盘焦点还给刚选的那一项
}
// 重画地点类型选择器（图标底色跟随当前选中的颜色，所以换颜色时也要重画）
function wmRefreshPinTypes(){
  var box=wmEl('wmFieldPinTypes');
  if(!box)return;
  while(box.firstChild)box.removeChild(box.firstChild);
  WM_PIN_TYPES.forEach(function(t){
    var b=document.createElement('button');
    b.type='button';
    b.className='wm-ptype';
    b.setAttribute('role','radio');
    b.setAttribute('aria-label',t.id==='pin'?'默认地点针':t.name);
    b.setAttribute('aria-checked',t.id===wmEd.dlgPinType?'true':'false');
    b.appendChild(wmPinTypeIcon(t.id,wmEd.dlgColor));
    var cap=document.createElement('span');
    cap.textContent=t.name;
    b.appendChild(cap);
    b.addEventListener('click',function(){wmSetPinType(t.id);});
    box.appendChild(b);
});
}
function wmSetDlgColor(hex){
  wmEd.dlgColor=wmCleanColor(hex);
  wmRefreshPinTypes();
  var box=wmEl('wmFieldColors');
  if(!box)return;
  Array.prototype.forEach.call(box.children,function(b){
    b.setAttribute('aria-checked',b.getAttribute('data-hex')===wmEd.dlgColor?'true':'false');
  });
}
function wmRenderAll(){
  var host=wmEl('wmShapes');
  if(!wmEd.open||!host)return;
  if(wmEd.focus&&!wmFindItem(wmEd.focus))wmEd.focus=null; // 高亮的项已被删除或撤回掉
  var res=wmFillShapes(host,wmEd.work,{
    sel:wmEd.mode==='link'?wmEd.linkSel:(wmEd.mode==='vertex'?[{t:'zone',id:wmVtx.zoneId}]:(wmEd.focus?[wmEd.focus]:null)),
    reveal:wmEd.focus,
    draftPts:wmEd.mode==='zone'?wmEd.draftPts:null,
    draftPin:wmEd.mode==='pin'?wmEd.draftPin:null,
    draftColor:wmEd.color,
    liftPinId:wmEd.pinDrag?wmEd.pinDrag.pinId:''
  });
  wmEd.anchors=res.anchors;
  wmEd.draftPinEl=res.draftPinEl;
  wmDrawVertexHandles(host);
  wmUpdateToolbar();
}
function wmUpdateDraftPinPos(){
  var el=wmEd.draftPinEl;
  if(!el||!wmEd.draftPin)return;
  el.style.left=(wmEd.draftPin.x*WM_W).toFixed(1)+'px';
  el.style.top=(wmEd.draftPin.y*WM_H).toFixed(1)+'px';
}
function wmUpdateToolbar(){
  if(!wmEd.open||!wmEd.work)return;
  var w=wmEd.work,mode=wmEd.mode;
  var press=function(id,on){var b=wmEl(id);if(b)b.setAttribute('aria-pressed',on?'true':'false');};
  press('wmBtnEdit',wmEd.editMode);
  press('wmBtnZone',mode==='zone');
  press('wmBtnPin',mode==='pin');
  press('wmBtnLink',mode==='link');
  press('wmBtnList',wmEd.listOpen);
  press('wmBtnEnable',w.enabled);
  var en=wmEl('wmBtnEnable'),icon=en?en.querySelector('i'):null;
  if(icon)icon.className=w.enabled?'fas fa-toggle-on':'fas fa-toggle-off';
  var undoBtn=wmEl('wmBtnUndo');
  if(undoBtn){
    undoBtn.disabled=!(wmEd.undo.length>0||(mode==='zone'&&wmEd.draftPts.length>0)||(mode==='link'&&wmEd.linkSel.length>0));
  }
  var ok=wmEl('wmDraftOk');
  if(ok){
    ok.classList.toggle('show',mode!=='idle');
    var ready=mode==='zone'?wmEd.draftPts.length>=3:(mode==='pin'?!!wmEd.draftPin:(mode==='link'?wmEd.linkSel.length===2:mode==='vertex'));
    ok.classList.toggle('wm-dim',!ready);
    ok.setAttribute('aria-disabled',ready?'false':'true');
  }
  var center=wmEl('wmCenter');
  if(center)center.classList.toggle('wm-editing',wmEd.editMode);
  var hint=wmEl('wmHint'),text='';
  if(mode==='zone')text='点击地图添加边界点（已添加 '+wmEd.draftPts.length+' 个，至少 3 个），再点右上角的 ✓ 确定；再点一次分区图标取消';
  else if(mode==='pin')text='长按大头针后拖动到位置，再点右上角的 ✓ 确定；再点一次地点图标取消';
  else if(mode==='link')text='点选两个地区或地点（已选 '+wmEd.linkSel.length+'/2），再点右上角的 ✓ 确定；再点一次关联图标取消';
  text=wmVertexHintText(text);
  if(hint){hint.textContent=text;hint.classList.toggle('show',!!text);}
  wmSchedulePromptCount();
}
function wmToggleEditMode(){
  if(!wmEd.open||wmEd.dlgOpen)return;
  wmClearLongPress();
  wmFinishPinDrag(true);
  wmEd.editMode=!wmEd.editMode;
  wmHidePopup();
  wmUpdateToolbar();
  wmToast(wmEd.editMode?'编辑模式已开启：单击分区、大头针或关联线即可编辑，长按大头针可移动':'编辑模式已关闭：单击可预览内容');
}
function wmToggleEnabled(){
  if(!wmEd.open||wmEd.dlgOpen)return;
  wmEd.work.enabled=!wmEd.work.enabled;
  wmUpdateToolbar();
  wmToast(wmEd.work.enabled?'已启用：保存后，地图文字会追加到世界观设定后':'已关闭：地图文字不会追加到世界观设定');
}

// —— 模式切换：分区 / 地点戳 / 关联线 ——
function wmSetMode(m){
  if(!wmEd.open||wmEd.dlgOpen)return;
  var next=wmEd.mode===m?'idle':m; // 再点一次同一个图标 = 取消当前新建
  if(wmEd.mode==='zone'&&wmEd.draftPts.length>=3){
    wmConfirmModal('放弃未完成的分区','当前分区还没有点「确定」，切换后这些点会丢失。\n\n确定放弃吗？','放弃',function(){wmEnterMode(next);},true);
    return;
  }
  wmEnterMode(next);
}
function wmEnterMode(next){
  if(next!=='vertex')wmVtxReset();
  wmEd.focus=null;
  wmClearLongPress();
  wmFinishPinDrag(true);
  wmEd.mode=next;
  wmEd.draftPts=[];wmEd.linkSel=[];wmEd.draftPin=null;
  if(next==='pin'){
    // 大头针出现在当前视角的中心
    var size=wmViewSize(),m=wmViewToMap(size.w/2,size.h/2);
    wmEd.draftPin={x:wmClamp(m.x/WM_W,0,1),y:wmClamp(m.y/WM_H,0,1)};
  }
  wmHidePopup();
  wmRenderAll();
}

// —— 点击分发 ——
function wmHitDom(target){
  var el=target&&target.closest?target.closest('[data-wm-t]'):null;
  if(!el)return null;
  var t=el.getAttribute('data-wm-t'),id=el.getAttribute('data-wm-id');
  if((t!=='zone'&&t!=='pin'&&t!=='link')||!id)return null;
  return {t:t,id:id};
}
// 关联线很细，手指点不准：距离线 14 个屏幕像素以内都算点中，取最近的一条
function wmHitLine(m){
  var best=null,bestD=14/wmEd.view.s,hid=wmHiddenMap(wmEd.work);
  wmEd.work.links.forEach(function(l){
    if(hid['link:'+l.id])return; // 隐藏的线点不到
    var a=wmEd.anchors[l.a.t+':'+l.a.id],b=wmEd.anchors[l.b.t+':'+l.b.id];
    if(!a||!b)return;
    var d=wmDistToSeg(m.x,m.y,a[0],a[1],b[0],b[1]);
    if(d<=bestD){bestD=d;best={t:'link',id:l.id};}
  });
  return best;
}
function wmPolyArea(pts){
  var a=0;
  for(var i=0;i<pts.length;i++){var q=pts[(i+1)%pts.length];a+=pts[i][0]*q[1]-q[0]*pts[i][1];}
  return Math.abs(a)/2;
}
// 点在哪个分区里：多个分区重叠（比如大区里套小区）时取面积最小的那个，点小区就是小区；面积相同取后画的
function wmHitZoneArea(m){
  var found=null,foundArea=Infinity,hid=wmHiddenMap(wmEd.work);
  wmEd.work.zones.forEach(function(z){
    if(hid['zone:'+z.id])return; // 隐藏的分区点不到
    var pts=z.pts.map(function(p){return [p[0]*WM_W,p[1]*WM_H];});
    if(!wmPointInPoly(m.x,m.y,pts))return;
    var area=wmPolyArea(pts);
    if(area<=foundArea){found=z;foundArea=area;}
  });
  return found?{t:'zone',id:found.id}:null;
}
function wmFindItem(hit){
  if(!hit||!wmEd.work)return null;
  var list=hit.t==='zone'?wmEd.work.zones:(hit.t==='pin'?wmEd.work.pins:wmEd.work.links);
  for(var i=0;i<list.length;i++){if(list[i].id===hit.id)return list[i];}
  return null;
}
function wmNameOfRef(ref){
  var it=wmFindItem({t:ref.t,id:ref.id});
  return it?it.name:'?';
}
function wmOnTap(rec){
  var m=wmViewToMap(rec.x,rec.y);
  if(wmEd.focus){wmEd.focus=null;wmRenderAll();} // 点地图任何地方，取消列表定位的高亮
  if(wmEd.mode==='vertex'){wmVtxOnBackgroundTap();return;}
  if(wmEd.mode==='zone'){wmZoneAddPoint(m);return;}
  if(wmEd.mode==='pin'){wmHidePopup();return;}
  if(wmEd.mode==='link'){wmLinkTap(rec.target,m);return;}
  // 优先级：大头针/名称标签 > 关联线 > 分区范围。名称可能被别的东西盖住，所以点分区内部任意位置都算点中它
  var hit=wmHitDom(rec.target)||wmHitLine(m),at=null;
  if(!hit){
    hit=wmHitZoneArea(m);
    if(hit)at=[m.x,m.y];
  }
  if(!hit){wmHidePopup();return;}
  if(wmEd.editMode){wmHidePopup();wmOpenEditDialog(hit);}
  else wmShowPopup(hit,at);
}
function wmZoneAddPoint(m){
  if(m.x<0||m.x>WM_W||m.y<0||m.y>WM_H)return; // 点在地图图片外面
  if(wmEd.draftPts.length>=WM_LIMIT.vertices){wmToast('一个分区最多 '+WM_LIMIT.vertices+' 个点');return;}
  var nx=Math.round(wmClamp(m.x/WM_W,0,1)*10000)/10000,ny=Math.round(wmClamp(m.y/WM_H,0,1)*10000)/10000;
  var snapped=wmSnapToVertex(nx,ny,null); // 靠近已有分区的顶点就吸附上去，相邻分区才能共用边界
  if(snapped){nx=snapped[0];ny=snapped[1];}
  var last=wmEd.draftPts[wmEd.draftPts.length-1];
  if(last&&Math.hypot((nx-last[0])*WM_W,(ny-last[1])*WM_H)*wmEd.view.s<6)return; // 连点同一个位置不重复加点
  wmEd.draftPts.push([nx,ny]);
  wmRenderAll();
}
function wmLinkTap(target,m){
  var hit=wmHitDom(target);
  if(!hit||hit.t==='link')hit=wmHitZoneArea(m); // 点在分区内部也算选中这个分区
  if(!hit)return;
  var idx=-1;
  wmEd.linkSel.forEach(function(s,i){if(s.t===hit.t&&s.id===hit.id)idx=i;});
  if(idx>=0)wmEd.linkSel.splice(idx,1);
  else if(wmEd.linkSel.length>=2){wmToast('最多选两个，请先点一下已选的取消');return;}
  else wmEd.linkSel.push(hit);
  wmRenderAll();
}

// —— 预览浮窗（编辑模式关闭时单击大头针/分区名称/关联线）——
function wmInfoOf(hit,at){
  var it=wmFindItem(hit);
  if(!it)return null;
  if(hit.t==='zone')return {title:it.name,sub:'分区',body:it.content,a:at||wmEd.anchors['zone:'+it.id],lift:at?12:16};
  if(hit.t==='pin')return {title:it.name,sub:'地点',body:it.content,a:wmEd.anchors['pin:'+it.id],lift:64};
  var pa=wmEd.anchors[it.a.t+':'+it.a.id],pb=wmEd.anchors[it.b.t+':'+it.b.id];
  return {title:it.name,sub:wmNameOfRef(it.a)+' ↔ '+wmNameOfRef(it.b),body:it.content,a:(pa&&pb)?[(pa[0]+pb[0])/2,(pa[1]+pb[1])/2]:null,lift:18};
}
function wmShowPopup(hit,at){
  var info=wmInfoOf(hit,at),pop=wmEl('wmPopup');
  if(!info||!info.a||!pop){wmHidePopup();return;}
  while(pop.firstChild)pop.removeChild(pop.firstChild);
  var t=document.createElement('b');
  t.textContent=info.title;
  var sub=document.createElement('div');
  sub.className='wm-pop-sub';
  sub.textContent=info.sub;
  var body=document.createElement('div');
  body.className='wm-pop-body';
  body.textContent=info.body?wmEllipsis(info.body,100):'（暂无内容）'; // 内容太多用省略号
  pop.appendChild(t);pop.appendChild(sub);pop.appendChild(body);
  pop.style.visibility='hidden';
  pop.classList.add('show');
  var size=wmViewSize(),v=wmEd.view;
  var ax=v.tx+info.a[0]*v.s,ay=v.ty+info.a[1]*v.s;
  var pw=pop.offsetWidth,ph=pop.offsetHeight;
  var left=wmClamp(ax-pw/2,8,Math.max(8,size.w-pw-8));
  var top=ay-info.lift-ph;
  if(top<8)top=ay+14; // 上方放不下就放到下面
  top=wmClamp(top,8,Math.max(8,size.h-ph-8));
  pop.style.left=left.toFixed(0)+'px';
  pop.style.top=top.toFixed(0)+'px';
  pop.style.visibility='';
}
function wmHidePopup(){
  var pop=wmEl('wmPopup');
  if(pop)pop.classList.remove('show');
}

// —— 编辑器内的弹窗（名称/内容表单、确认框）——
function wmUpdateContentCount(){
  var f=wmEl('wmFieldContent'),c=wmEl('wmContentCount');
  if(f&&c)c.textContent=Array.from(f.value).length+'/'+WM_LIMIT.content;
}
function wmSetModalButtons(defs){
  var box=wmEl('wmModalBtns');
  while(box.firstChild)box.removeChild(box.firstChild);
  defs.forEach(function(d){
    var b=document.createElement('button');
    b.type='button';
    b.className=d.cls;
    b.textContent=d.text;
    b.addEventListener('click',function(){if(wmEd.dlgOpen)d.fn();}); // 弹窗已关闭后的迟到点击直接忽略
    box.appendChild(b);
  });
  return box;
}
function wmCloseModal(runCancel){
  var modal=wmEl('wmModal');
  if(modal)modal.classList.remove('show');
  var wasOpen=wmEd.dlgOpen,cb=wmEd.dlgCancel;
  wmEd.dlgOpen=false;wmEd.dlgCancel=null;
  var box=wmEl('wmModalBtns');
  if(box)while(box.firstChild)box.removeChild(box.firstChild);
  var ae=document.activeElement;
  if(ae&&typeof ae.blur==='function'&&modal&&modal.contains(ae))ae.blur(); // 收起软键盘
  if(runCancel&&wasOpen&&typeof cb==='function')cb();
}
// cfg：title、msg(可选)、name、content、color、inPrompt(是否写入提示词，默认 true)、okText、autoFocus、
//      hidden/hideName(隐藏整项/隐藏名称，默认 false)、pinType(只有地点传，传了才显示类型选择)、
//      onOk(name,content,color,inPrompt,extra)——extra={hidden,hideName,pinType}、onEditShape(可选，只有分区有)、onDelete(可选)、onCancel(可选)
function wmOpenFormModal(cfg){
  var nameEl=wmEl('wmFieldName'),contentEl=wmEl('wmFieldContent'),modal=wmEl('wmModal');
  if(!nameEl||!contentEl||!modal)return;
  wmEd.dlgOpen=true;
  wmEd.dlgCancel=cfg.onCancel||null;
  wmEl('wmModalTitle').textContent=cfg.title;
  var msg=wmEl('wmModalMsg');
  msg.textContent=cfg.msg||'';
  msg.style.display=cfg.msg?'':'none';
  wmEl('wmModalForm').style.display='';
  nameEl.value=cfg.name||'';
  contentEl.value=cfg.content||'';
  wmUpdateContentCount();
  wmBuildDialogColors();
  wmSetDlgColor(cfg.color||wmEd.color);
  var promptEl=wmEl('wmFieldPrompt'),showEl=wmEl('wmFieldShow'),showNameEl=wmEl('wmFieldShowName'),typeRow=wmEl('wmPinTypeRow');
  if(promptEl)promptEl.checked=cfg.inPrompt!==false;
  if(showEl)showEl.checked=cfg.hidden!==true;
  if(showNameEl)showNameEl.checked=cfg.hideName!==true;
  var isPin=cfg.pinType!==undefined;
  if(typeRow)typeRow.style.display=isPin?'':'none';
  if(isPin){wmEd.dlgPinType=wmCleanPinType(cfg.pinType);wmRefreshPinTypes();}
  var defs=[];
  if(cfg.onDelete)defs.push({text:'删除',cls:'dlg-danger',fn:function(){wmCloseModal(false);cfg.onDelete();}});
  if(cfg.onEditShape)defs.push({text:'编辑边界',cls:'dlg-cancel',fn:function(){wmCloseModal(false);cfg.onEditShape();}});
  defs.push({text:'取消',cls:'dlg-cancel',fn:function(){wmCloseModal(true);}});
  defs.push({text:cfg.okText||'确定',cls:'dlg-ok',fn:function(){
    var name=wmCleanText(nameEl.value,WM_LIMIT.name,true);
    if(!name){wmToast('请输入名称');nameEl.focus();return;}
    var content=wmCleanText(contentEl.value,WM_LIMIT.content,false);
    var color=wmEd.dlgColor;
    var inPrompt=promptEl?promptEl.checked:true;
    var extra={hidden:showEl?!showEl.checked:false,hideName:showNameEl?!showNameEl.checked:false,pinType:isPin?wmEd.dlgPinType:undefined};
    wmCloseModal(false); // 先关弹窗再执行，重复点击不会重复创建
    cfg.onOk(name,content,color,inPrompt,extra);
  }});
  wmSetModalButtons(defs);
  modal.classList.add('show');
  if(cfg.autoFocus){
    try{nameEl.focus({preventScroll:true});}catch(e){nameEl.focus();}
  }
}
function wmConfirmModal(title,msg,okText,onOk,danger,onCancel){
  var modal=wmEl('wmModal');
  if(!modal)return;
  wmEd.dlgOpen=true;
  wmEd.dlgCancel=onCancel||null;
  wmEl('wmModalTitle').textContent=title;
  var m=wmEl('wmModalMsg');
  m.textContent=msg;
  m.style.display='';
  wmEl('wmModalForm').style.display='none';
  var box=wmSetModalButtons([
    {text:'取消',cls:'dlg-cancel',fn:function(){wmCloseModal(true);}},
    {text:okText,cls:danger?'dlg-danger':'dlg-ok',fn:function(){wmCloseModal(false);onOk();}}
  ]);
  modal.classList.add('show');
  var focusBtn=danger?box.children[0]:box.children[1]; // 危险操作默认聚焦「取消」
  if(focusBtn)focusBtn.focus();
}

// —— 撤回（最多 30 步，退出编辑器后清空）——
function wmSnap(m){return JSON.stringify({zones:m.zones,pins:m.pins,links:m.links,offRel:m.offRel,autoSpatial:m.autoSpatial});}
// 在改动数据之前调用：保存改动前的状态（拖动这类「边改边画」的操作，由调用方提前截好快照传进来）
function wmPushUndo(snap){
  wmEd.undo.push(typeof snap==='string'?snap:wmSnap(wmEd.work));
  if(wmEd.undo.length>WM_LIMIT.undo)wmEd.undo.shift();
}
function wmPruneSelection(){
  wmEd.linkSel=wmEd.linkSel.filter(function(s){return !!wmFindItem(s);});
}
function wmUndo(){
  if(!wmEd.open||wmEd.dlgOpen)return;
  // 正在画分区/选关联线时，撤回先回退草稿，不消耗那 30 步
  if(wmEd.mode==='zone'&&wmEd.draftPts.length){wmEd.draftPts.pop();wmRenderAll();return;}
  if(wmEd.mode==='link'&&wmEd.linkSel.length){wmEd.linkSel.pop();wmRenderAll();return;}
  if(!wmEd.undo.length){wmToast('没有可以撤回的操作');return;}
  wmRestoreSnap(wmEd.undo.pop());
  wmHidePopup();
  wmRenderAll();
  wmToast('已撤回上一步');
}

// —— 确定：新建分区 / 地点戳 / 关联线 ——
function wmDraftConfirm(){
  if(!wmEd.open||wmEd.dlgOpen)return;
  if(wmEd.mode==='vertex'){wmExitVertexMode();return;}
  var w=wmEd.work,mode=wmEd.mode;
  if(mode==='zone'){
    if(wmEd.draftPts.length<3){wmToast('至少需要 3 个点才能围成分区');return;}
    if(w.zones.length>=WM_LIMIT.zones){wmToast('分区最多 '+WM_LIMIT.zones+' 个');return;}
    wmOpenFormModal({title:'新建分区',autoFocus:true,okText:'创建',onOk:function(name,content,color,inPrompt,extra){
      if(!wmEd.open||wmEd.mode!=='zone'||wmEd.draftPts.length<3)return;
      wmPushUndo();
      wmEd.color=color;
      w.zones.push({id:wmNewId('z'),name:name,content:content,color:color,pts:wmEd.draftPts.map(function(p){return [p[0],p[1]];}),inPrompt:inPrompt,hidden:extra.hidden,hideName:extra.hideName});
      wmEnterMode('idle');
      wmToast('已添加分区「'+name+'」');
    }});
  }else if(mode==='pin'){
    if(!wmEd.draftPin)return;
    if(w.pins.length>=WM_LIMIT.pins){wmToast('地点戳最多 '+WM_LIMIT.pins+' 个');return;}
    wmOpenFormModal({title:'新建地点戳',pinType:'pin',autoFocus:true,okText:'创建',onOk:function(name,content,color,inPrompt,extra){
      if(!wmEd.open||wmEd.mode!=='pin'||!wmEd.draftPin)return;
      wmPushUndo();
      wmEd.color=color;
      w.pins.push({id:wmNewId('p'),name:name,content:content,color:color,x:Math.round(wmEd.draftPin.x*10000)/10000,y:Math.round(wmEd.draftPin.y*10000)/10000,type:wmCleanPinType(extra.pinType),inPrompt:inPrompt,hidden:extra.hidden,hideName:extra.hideName});
      wmEnterMode('idle');
      wmToast('已添加地点「'+name+'」');
    }});
  }else if(mode==='link'){
    if(wmEd.linkSel.length!==2){wmToast('请先选两个地区或地点');return;}
    if(w.links.length>=WM_LIMIT.links){wmToast('关联线最多 '+WM_LIMIT.links+' 条');return;}
    var a=wmEd.linkSel[0],b=wmEd.linkSel[1];
    wmOpenFormModal({title:'新建关联线',msg:wmNameOfRef(a)+' ↔ '+wmNameOfRef(b),autoFocus:true,okText:'创建',onOk:function(name,content,color,inPrompt,extra){
      if(!wmEd.open||wmEd.mode!=='link'||wmEd.linkSel.length!==2||!wmFindItem(a)||!wmFindItem(b))return;
      wmPushUndo();
      wmEd.color=color;
      w.links.push({id:wmNewId('l'),a:{t:a.t,id:a.id},b:{t:b.t,id:b.id},name:name,content:content,color:color,inPrompt:inPrompt,hidden:extra.hidden,hideName:extra.hideName});
      wmEnterMode('idle');
      wmToast('已添加关联线「'+name+'」');
    }});
  }
}

// —— 编辑分区边界点：拖动顶点、在边上插点、删除点、吸附到已有顶点、相邻分区联动 ——
function wmRound4(v){return Math.round(v*10000)/10000;}
function wmVtxSame(a,b){return Math.abs(a[0]-b[0])<=WM_VTX_EPS&&Math.abs(a[1]-b[1])<=WM_VTX_EPS;}
// 找离 (nx,ny) 最近且在吸附范围内的已有顶点；skip(zoneId,index) 返回 true 的顶点不参与（正在拖的点和它的联动点自己不能当吸附目标）
function wmSnapToVertex(nx,ny,skip){
  var scale=wmEd.view&&wmEd.view.s>0?wmEd.view.s:1;
  var best=null,bestD=WM_SNAP_PX/scale;
  if(!wmEd.work)return null;
  wmEd.work.zones.forEach(function(z){
      z.pts.forEach(function(pt,i){
          if(skip&&skip(z.id,i))return;
          var d=Math.hypot((pt[0]-nx)*WM_W,(pt[1]-ny)*WM_H);
          if(d<=bestD){bestD=d;best=[pt[0],pt[1]];}
      });
  });
  return best;
}
// 和 z 的第 idx 个点位置相同的所有点（含它自己）。联动关闭时只有它自己
function wmVtxCollectGroup(z,idx){
  var base=z.pts[idx],group=[{zid:z.id,i:idx}];
  if(!wmVtx.link)return group;
  wmEd.work.zones.forEach(function(oz){
      oz.pts.forEach(function(q,qi){
          if(oz.id===z.id&&qi===idx)return;
          if(wmVtxSame(q,base))group.push({zid:oz.id,i:qi});
      });
  });
  return group;
}
// 在 z 的第 i 条边（点 i 到点 i+1）的中点插入新点。联动开启时，共用这条边的相邻分区也插入同一个点，边界才不会裂开。
// 返回新点所在的全部位置
function wmVtxInsertOnEdge(z,i){
  var n=z.pts.length,a=z.pts[i],b=z.pts[(i+1)%n];
  var mid=[wmRound4((a[0]+b[0])/2),wmRound4((a[1]+b[1])/2)];
  var group=[];
  if(wmVtx.link){
    wmEd.work.zones.forEach(function(oz){
        if(oz.id===z.id||oz.pts.length>=WM_LIMIT.vertices)return;
        var len=oz.pts.length;
        for(var j=0;j<len;j++){
          var p=oz.pts[j],q=oz.pts[(j+1)%len];
          if((wmVtxSame(p,a)&&wmVtxSame(q,b))||(wmVtxSame(p,b)&&wmVtxSame(q,a))){
            oz.pts.splice(j+1,0,[mid[0],mid[1]]);
            group.push({zid:oz.id,i:j+1});
            return;
          }
        }
    });
  }
  z.pts.splice(i+1,0,[mid[0],mid[1]]);
  group.unshift({zid:z.id,i:i+1});
  return group;
}
// 按快照还原分区、地点、关联线和写入设置（撤回和中止拖动共用）
function wmRestoreSnap(snap){
  var s=JSON.parse(snap);
  wmEd.work.zones=s.zones;wmEd.work.pins=s.pins;wmEd.work.links=s.links;
  if(Array.isArray(s.offRel))wmEd.work.offRel=s.offRel;
  if(typeof s.autoSpatial==='boolean')wmEd.work.autoSpatial=s.autoSpatial;
  wmPruneSelection();
}
// 按下顶点圆点（拖动）或边中点的＋（先插入再拖动）。返回 true 表示这次按下已被边界点编辑接管
function wmVtxBegin(e,rec,target){
  if(wmEd.mode!=='vertex'||!wmEd.work)return false;
  var el=target&&target.closest?target.closest('.wm-vh,.wm-vm'):null;
  if(!el)return false;
  var z=wmFindItem({t:'zone',id:wmVtx.zoneId});
  if(!z)return false;
  var kind=el.getAttribute('data-wm-vt'),idx=parseInt(el.getAttribute('data-wm-vi'),10);
  if(!isFinite(idx)||idx<0||idx>=z.pts.length)return false;
  var snap=wmSnap(wmEd.work),inserted=false,group;
  if(kind==='m'){
    if(z.pts.length>=WM_LIMIT.vertices){wmToast('一个分区最多 '+WM_LIMIT.vertices+' 个点');return true;}
    group=wmVtxInsertOnEdge(z,idx);
    idx=idx+1;
    inserted=true;
  }else{
    group=wmVtxCollectGroup(z,idx);
  }
  var zoneSet={};
  group.forEach(function(g){zoneSet[g.zid]=true;});
  var pt=z.pts[idx],m=wmViewToMap(rec.x,rec.y);
  wmVtx.drag={id:e.pointerId,index:idx,zoneId:z.id,group:group,zoneSet:zoneSet,snap:snap,inserted:inserted,moved:false,
    sx:pt[0],sy:pt[1],ox:pt[0]-m.x/WM_W,oy:pt[1]-m.y/WM_H};
  var center=wmEl('wmCenter');
  if(center)center.classList.add('wm-dragging');
  wmHidePopup();
  if(inserted)wmRenderAll();
  return true;
}
function wmVtxMove(p,rec){
  var d=wmVtx.drag;
  if(!d||!wmEd.work)return;
  if(!d.moved){
    if(!rec.moved)return; // 没超过点击阈值：当作点击，不移动
    d.moved=true;
  }
  var m=wmViewToMap(p.x,p.y);
  var nx=wmClamp(m.x/WM_W+d.ox,0,1),ny=wmClamp(m.y/WM_H+d.oy,0,1);
  var sn=wmSnapToVertex(nx,ny,function(zid){return d.zoneSet[zid]===true;});
  wmVtx.snapTo=sn;
  if(sn){nx=sn[0];ny=sn[1];}
  d.group.forEach(function(g){
      var z=wmFindItem({t:'zone',id:g.zid});
      if(z&&z.pts[g.i]){z.pts[g.i][0]=nx;z.pts[g.i][1]=ny;}
  });
  wmScheduleRender();
}
// 松手：真的移动了才记一步撤回；没动就还原并当作「点选/取消选中」；系统打断（cancelled）整体还原
function wmVtxFinishDrag(cancelled){
  var d=wmVtx.drag;
  if(!d)return;
  wmVtx.drag=null;wmVtx.snapTo=null;
  wmCancelScheduledRender();
  var center=wmEl('wmCenter');
  if(center)center.classList.remove('wm-dragging');
  if(!wmEd.open||!wmEd.work)return;
  if(cancelled){wmRestoreSnap(d.snap);wmRenderAll();return;}
  var z=wmFindItem({t:'zone',id:d.zoneId}),moved=false;
  if(z&&z.pts[d.index]&&d.moved){
    var cur=z.pts[d.index];
    moved=Math.hypot((cur[0]-d.sx)*WM_W,(cur[1]-d.sy)*WM_H)>=0.5;
  }
  if(!moved&&!d.inserted){
    d.group.forEach(function(g){
        var gz=wmFindItem({t:'zone',id:g.zid});
        if(gz&&gz.pts[g.i]){gz.pts[g.i][0]=d.sx;gz.pts[g.i][1]=d.sy;}
    });
    if(!d.moved)wmVtx.sel=wmVtx.sel===d.index?-1:d.index;
    wmRenderAll();
    return;
  }
  d.group.forEach(function(g){
      var gz=wmFindItem({t:'zone',id:g.zid});
      if(gz&&gz.pts[g.i]){gz.pts[g.i][0]=wmRound4(gz.pts[g.i][0]);gz.pts[g.i][1]=wmRound4(gz.pts[g.i][1]);}
  });
  wmPushUndo(d.snap);
  wmVtx.sel=d.index;
  wmRenderAll();
}
function wmVtxDeleteSelected(){
  if(!wmEd.open||wmEd.dlgOpen||wmEd.mode!=='vertex'||wmVtx.drag)return;
  var z=wmFindItem({t:'zone',id:wmVtx.zoneId});
  if(!z)return;
  if(wmVtx.sel<0||wmVtx.sel>=z.pts.length){wmToast('请先点选一个边界点');return;}
  if(z.pts.length<=3){wmToast('分区至少需要 3 个点');return;}
  var sel=wmVtx.sel,group=wmVtxCollectGroup(z,sel);
  wmPushUndo();
  z.pts.splice(sel,1);
  var removed=0,kept=0;
  group.forEach(function(g){
      if(g.zid===z.id&&g.i===sel)return;
      var gz=wmFindItem({t:'zone',id:g.zid});
      if(!gz)return;
      var gi=(gz.id===z.id&&g.i>sel)?g.i-1:g.i; // 同一分区里先删了 sel，后面的序号要前移
      if(gz.pts.length<=3||!gz.pts[gi]){kept++;return;}
      gz.pts.splice(gi,1);
      if(gz.id!==z.id)removed++;
  });
  wmVtx.sel=-1;
  wmRenderAll();
  wmToast('已删除边界点'+(removed?'，并同步删除了 '+removed+' 个相邻分区的同一顶点':'')+(kept?'；有 '+kept+' 个点所在分区只剩 3 个点，已保留':''));
}
function wmVtxToggleLink(){
  if(!wmEd.open||wmEd.dlgOpen)return;
  wmVtx.link=!wmVtx.link;
  wmVtxSyncBar();
  wmToast(wmVtx.link?'联动已开启：共用的顶点会一起移动':'联动已关闭：只移动当前分区的点');
}
function wmVtxOnBackgroundTap(){
  if(wmVtx.sel<0)return;
  wmVtx.sel=-1;
  wmRenderAll();
}
// 边界点工具条（#wmVtxBar：删除点 / 联动开关）：只在边界点模式下显示
function wmVtxSyncBar(){
  var bar=wmEl('wmVtxBar'),del=wmEl('wmVtxDel'),link=wmEl('wmVtxLink');
  var inVertex=wmEd.open&&wmEd.mode==='vertex';
  if(bar)bar.classList.toggle('show',inVertex);
  if(del)del.disabled=wmVtx.sel<0;
  if(link)link.setAttribute('aria-pressed',wmVtx.link?'true':'false');
}
function wmVertexHintText(text){
  if(wmEd.mode==='vertex')return '拖动圆点移动边界点；点＋插入新点；点选圆点后可删除；靠近其他分区的顶点会自动吸附；完成后点右上角 ✓';
  if(wmEd.mode==='zone'&&text)return text+'；靠近已有分区的顶点会自动吸附';
  return text;
}
function wmVtxHandle(cls,x,y,color,kind,index){
  var el=document.createElement('div');
  el.className=cls;
  el.style.left=(x*WM_W).toFixed(1)+'px';
  el.style.top=(y*WM_H).toFixed(1)+'px';
  el.style.setProperty('--wm-c',color);
  if(kind){el.setAttribute('data-wm-vt',kind);el.setAttribute('data-wm-vi',String(index));}
  return el;
}
// 每次重画后，把边界点手柄画进 wmFillShapes 生成的图层。手柄没有 data-wm-t，不会被当成分区/地点/线点中
function wmDrawVertexHandles(host){
  wmVtxSyncBar();
  if(wmEd.mode!=='vertex')return;
  var layer=host?host.querySelector('.wm-layer'):null;
  var z=wmFindItem({t:'zone',id:wmVtx.zoneId});
  if(!z){ // 正在编辑的分区没了（例如被撤回掉）：退出边界点编辑
    wmVtx.zoneId='';wmVtx.sel=-1;wmEd.mode='idle';
    wmVtxSyncBar();
    return;
  }
  if(!layer)return;
  if(wmVtx.sel>=z.pts.length)wmVtx.sel=-1;
  var total=0;
  wmEd.work.zones.forEach(function(oz){if(oz.id!==z.id)total+=oz.pts.length;});
  if(total<=WM_VTX_REF_MAX){
    wmEd.work.zones.forEach(function(oz){
        if(oz.id===z.id)return;
        oz.pts.forEach(function(pt){layer.appendChild(wmVtxHandle('wm-vref',pt[0],pt[1],oz.color,'',0));});
    });
  }
  var n=z.pts.length;
  if(n<WM_LIMIT.vertices&&!wmVtx.drag){
    z.pts.forEach(function(pt,i){
        var q=z.pts[(i+1)%n];
        layer.appendChild(wmVtxHandle('wm-vm',(pt[0]+q[0])/2,(pt[1]+q[1])/2,z.color,'m',i));
    });
  }
  z.pts.forEach(function(pt,i){
      layer.appendChild(wmVtxHandle('wm-vh'+(i===wmVtx.sel?' wm-vh-sel':''),pt[0],pt[1],z.color,'v',i));
  });
  if(wmVtx.drag&&wmVtx.snapTo)layer.appendChild(wmVtxHandle('wm-snap',wmVtx.snapTo[0],wmVtx.snapTo[1],'#ffffff','',0));
}
function wmEnterVertexMode(zoneId){
  if(!wmEd.open||wmEd.dlgOpen||!wmFindItem({t:'zone',id:zoneId}))return;
  wmVtx.zoneId=zoneId;
  wmVtx.sel=-1;
  wmEnterMode('vertex');
  wmToast('拖动圆点调整边界，点＋插入新点；完成后点右上角 ✓');
}
function wmExitVertexMode(){
  if(wmEd.mode!=='vertex')return;
  wmEnterMode('idle');
  wmToast('边界点已更新');
}
// 离开边界点模式、关闭或重新打开编辑器时调用：中止拖动并收起工具条
function wmVtxReset(){
  if(wmVtx.drag)wmVtxFinishDrag(true);
  wmVtx.zoneId='';wmVtx.sel=-1;wmVtx.snapTo=null;
  var bar=wmEl('wmVtxBar');
  if(bar)bar.classList.remove('show');
}

// —— 编辑模式：单击分区范围/大头针/关联线 → 改名称、内容和颜色，或删除 ——
function wmOpenEditDialog(hit){
  var it=wmFindItem(hit);
  if(!it)return;
  var kind=hit.t==='zone'?'分区':(hit.t==='pin'?'地点戳':'关联线');
  wmOpenFormModal({
    title:'编辑'+kind,
    msg:hit.t==='link'?(wmNameOfRef(it.a)+' ↔ '+wmNameOfRef(it.b)):'',
    name:it.name,content:it.content,color:it.color,inPrompt:it.inPrompt!==false,okText:'保存',
    hidden:it.hidden===true,hideName:it.hideName===true,pinType:hit.t==='pin'?wmCleanPinType(it.type):undefined,
    onOk:function(name,content,color,inPrompt,extra){
      var cur=wmFindItem(hit);
      if(!wmEd.open||!cur)return;
      var same=cur.name===name&&cur.content===content&&cur.color===color&&(cur.inPrompt!==false)===inPrompt&&
        (cur.hidden===true)===extra.hidden&&(cur.hideName===true)===extra.hideName&&(hit.t!=='pin'||wmCleanPinType(cur.type)===extra.pinType);
      if(same)return; // 没改动就不占撤回步数
      wmPushUndo();
      cur.name=name;cur.content=content;cur.color=color;cur.inPrompt=inPrompt;
      cur.hidden=extra.hidden;cur.hideName=extra.hideName;
      if(hit.t==='pin')cur.type=extra.pinType;
      wmRenderAll();
    },
    onEditShape:hit.t==='zone'?function(){wmEnterVertexMode(hit.id);}:null,
    onDelete:function(){wmConfirmDelete(hit);}
  });
}
function wmConfirmDelete(hit){
  var it=wmFindItem(hit);
  if(!it)return;
  var kind=hit.t==='zone'?'分区':(hit.t==='pin'?'地点戳':'关联线');
  var cascade=0;
  if(hit.t!=='link'){
    wmEd.work.links.forEach(function(l){
      if((l.a.t===hit.t&&l.a.id===hit.id)||(l.b.t===hit.t&&l.b.id===hit.id))cascade++;
    });
  }
  var msg='将删除'+kind+'「'+it.name+'」'+(cascade?'，同时删除与它相连的 '+cascade+' 条关联线':'')+'。可以点撤回图标恢复。\n\n确定删除吗？';
  wmConfirmModal('删除'+kind,msg,'删除',function(){
    if(!wmEd.open||!wmFindItem(hit))return;
    var w=wmEd.work;
    wmPushUndo();
    if(hit.t==='zone')w.zones=w.zones.filter(function(z){return z.id!==hit.id;});
    else if(hit.t==='pin')w.pins=w.pins.filter(function(p){return p.id!==hit.id;});
    else w.links=w.links.filter(function(l){return l.id!==hit.id;});
    if(hit.t!=='link'){
      w.links=w.links.filter(function(l){
        return !((l.a.t===hit.t&&l.a.id===hit.id)||(l.b.t===hit.t&&l.b.id===hit.id));
      });
    }
    wmPruneSelection();
    wmHidePopup();
    wmRenderAll();
    wmToast('已删除'+kind);
  },true);
}

// —— 清空所有设置：只清分区、地点戳、关联线，不动图片 ——
function wmClearAllClick(){
  if(!wmEd.open||wmEd.dlgOpen)return;
  var w=wmEd.work;
  if(!w.zones.length&&!w.pins.length&&!w.links.length){wmToast('当前没有分区、地点戳或关联线');return;}
  wmConfirmModal('清空所有设置','将清空全部分区、地点戳和关联线（地图图片不受影响）。可以点撤回图标恢复。\n\n确定清空吗？','清空',function(){
    if(!wmEd.open)return;
    wmPushUndo();
    w.zones=[];w.pins=[];w.links=[];w.offRel=[];
    wmEd.linkSel=[];
    wmHidePopup();
    wmRenderAll();
    wmToast('已清空');
  },true);
}

// —— 退出 / 保存 ——
function wmIsDirty(){return !!wmEd.work&&wmSig(wmEd.work)!==wmEd.base;}
// fromNav=true：由返回键/左划触发，导航栈里这一层已被弹出，编辑器继续留着就要重新入栈
function wmRequestExit(fromNav){
  if(!wmEd.open)return;
  if(wmTour){ // 导览中返回键只关导览
    wmTourEnd();
    if(fromNav)wmNavPush('wmEditorOv');
    return;
  }
  if(wmEd.promptOpen){ // 提示词预览开着时，返回键只关预览
    wmClosePromptPanel();
    if(fromNav)wmNavPush('wmEditorOv');
    return;
  }
  if(wmEd.dlgOpen){ // 弹窗开着时，返回键只关弹窗
    wmCloseModal(true);
    if(fromNav)wmNavPush('wmEditorOv');
    return;
  }
  if(!wmIsDirty()){wmCloseEditor();return;}
  if(fromNav)wmNavPush('wmEditorOv');
  wmConfirmModal('退出地图编辑','有修改还没有保存，退出后这些修改会丢失。\n\n确定要退出吗？','退出',function(){wmCloseEditor();},true);
}
function wmSave(){
  if(!wmEd.open||wmEd.dlgOpen||wmEd.saving)return;
  var pending=(wmEd.mode==='zone'&&wmEd.draftPts.length>0)||(wmEd.mode==='pin'&&!!wmEd.draftPin)||(wmEd.mode==='link'&&wmEd.linkSel.length===2);
  if(pending){
    wmConfirmModal('保存地图','还有没点 ✓ 确定 的分区、地点戳或关联线，保存时不会包含它们。\n\n仍然保存吗？','保存',wmDoSave,false);
    return;
  }
  wmDoSave();
}
function wmDoSave(){
  if(!wmEd.open||wmEd.saving)return;
  wmEd.saving=true;
  var btn=wmEl('wmBtnSave');
  if(btn)btn.disabled=true;
  try{
    wmEd.work.offRel=wmPruneOffRel(wmEd.work); // 已经不存在的自动关系，不再记录它们的「不写入」
    var clean=wmSanitizeMap(wmEd.work); // 写入前再校验一遍，保证存下去的数据一定合法
    if(!clean.img)throw new Error('地图图片丢失，请重新上传');
    worldMap=clean;
    wmPersistMap();
    wmCloseEditor();
    showToast('地图已保存');
  }catch(err){
    logError('wmDoSave',err);
    wmToast('保存失败：'+((err&&err.message)||'未知错误'));
  }finally{
    wmEd.saving=false;
    if(btn)btn.disabled=false;
  }
}

// ==================== 七、编辑器：提示词字数预览与逐条「写入/不写入」 ====================
// 左上角的字数提示条（#wmPromptCount）显示「当前将追加 N/2000 字」，点开是预览面板（#wmPromptModal）：
// 列出所有分区、地点、关系和自动算出的空间关系，每条可单独勾选，超出上限被舍去的条目会标出来。
// 开启「去掉所有设定字数限制」时显示「N 字（无限制）」，不舍去任何条目。
function wmPromptAmount(plan){
  return plan.limit===null?plan.used+' 字（无限制）':plan.used+'/'+plan.limit+' 字';
}
function wmUpdatePromptCount(){
  var el=wmEl('wmPromptCount');
  if(!el||!wmEd.open||!wmEd.work)return;
  var plan=wmBuildPromptPlan(wmEd.work);
  var text=(wmEd.work.enabled?'当前将追加 ':'未启用，启用后将追加 ')+wmPromptAmount(plan)+(plan.dropped?'；'+plan.dropped+' 条超出被舍去':'');
  el.textContent=text;
  el.title=text;
  el.setAttribute('aria-label','提示词预览：'+text);
  el.classList.toggle('wm-pcount-warn',plan.overflow);
}
// 拖动地点或边界点时每帧都会重画，字数合并成每 150ms 最多算一次
function wmSchedulePromptCount(){
  if(wmEd.countTimer)return;
  wmEd.countTimer=setTimeout(function(){
    wmEd.countTimer=0;
    if(!wmEd.open)return;
    wmUpdatePromptCount();
    if(wmEd.listOpen)wmRenderListPanel();
  },150);
}
function wmPromptSectionName(kind){
  if(kind==='zone')return '分区';
  if(kind==='pin')return '地点';
  if(kind==='link')return '关系';
  return '空间关系（自动生成）';
}
function wmPromptRow(it){
  var row=document.createElement('label');
  row.className='wm-prow'+(it.dropped?' wm-prow-drop':'')+(it.blocked?' wm-prow-off':'');
  var cb=document.createElement('input');
  cb.type='checkbox';
  cb.checked=it.sel;
  cb.disabled=it.blocked==='auto';
  cb.setAttribute('data-wm-pk',it.kind+'|'+it.id);
  cb.addEventListener('change',function(){wmPromptToggle(it.kind,it.id,cb.checked);});
  var text=document.createElement('span');
  text.className='wm-prow-t';
  text.textContent=it.text.replace(/^· /,''); // 用户输入一律走 textContent
  var meta=document.createElement('span');
  meta.className='wm-prow-n';
  if(it.dropped)meta.textContent='将被舍去';
  else if(it.blocked==='hidden')meta.textContent='已隐藏，不写入';
  else if(it.blocked==='entity')meta.textContent='相关项未写入';
  else if(it.blocked==='auto')meta.textContent='总开关已关';
  else meta.textContent=it.len+' 字';
  row.appendChild(cb);row.appendChild(text);row.appendChild(meta);
  return row;
}
function wmRenderPromptPanel(){
  var list=wmEl('wmPromptList'),sum=wmEl('wmPromptSum'),auto=wmEl('wmPromptAuto');
  if(!list||!sum||!auto||!wmEd.work)return;
  var plan=wmBuildPromptPlan(wmEd.work);
  var focused=document.activeElement&&document.activeElement.getAttribute?document.activeElement.getAttribute('data-wm-pk'):null;
  var scroll=list.scrollTop;
  sum.textContent=(wmEd.work.enabled?'当前将追加 ':'未启用，启用后将追加 ')+wmPromptAmount(plan)+(plan.dropped?'；超出上限，'+plan.dropped+' 条会被舍去（已标出，可取消勾选其他条目腾出空间）':'');
  sum.classList.toggle('wm-pcount-warn',plan.overflow);
  auto.checked=wmEd.work.autoSpatial!==false;
  while(list.firstChild)list.removeChild(list.firstChild);
  var any=false;
  plan.sections.forEach(function(sec){
      if(!sec.items.length)return;
      any=true;
      var head=document.createElement('div');
      head.className='wm-pgrp';
      head.textContent=wmPromptSectionName(sec.kind);
      list.appendChild(head);
      sec.items.forEach(function(it){list.appendChild(wmPromptRow(it));});
  });
  if(!any){
    var empty=document.createElement('div');
    empty.className='wm-pgrp';
    empty.textContent='还没有分区、地点或关联线';
    list.appendChild(empty);
  }
  list.scrollTop=scroll;
  if(focused){ // 重画后把键盘焦点还给刚才操作的那一项
    Array.prototype.some.call(list.querySelectorAll('input'),function(input){
        if(input.getAttribute('data-wm-pk')!==focused)return false;
        input.focus();
        return true;
    });
  }
}
function wmPromptToggle(kind,id,on){
  var w=wmEd.work;
  if(!wmEd.open||!w)return;
  if(kind==='rel'){
    var idx=w.offRel.indexOf(id);
    if(on&&idx>=0){
      w.offRel.splice(idx,1);
    }else if(!on&&idx<0){
      if(w.offRel.length>=WM_MAX_OFF_REL){wmToast('取消写入的关系太多了');wmRenderPromptPanel();return;}
      w.offRel.push(id);
    }
  }else{
    var it=wmFindItem({t:kind,id:id});
    if(!it){wmRenderPromptPanel();return;}
    it.inPrompt=on;
  }
  wmRenderPromptPanel();
  wmUpdatePromptCount();
}
function wmPromptAutoChange(on){
  if(!wmEd.open||!wmEd.work)return;
  wmEd.work.autoSpatial=!!on;
  wmRenderPromptPanel();
  wmUpdatePromptCount();
}
// 全部写入 / 全部不写入：作用于分区、地点、关系和每一条自动空间关系
function wmPromptSetAll(on){
  var w=wmEd.work;
  if(!wmEd.open||!w)return;
  w.zones.forEach(function(z){z.inPrompt=on;});
  w.pins.forEach(function(p){p.inPrompt=on;});
  w.links.forEach(function(l){l.inPrompt=on;});
  if(on){
    w.offRel=[];
  }else{
    w.offRel=wmComputeSpatialFacts(w).map(function(f){return f.key;}).slice(0,WM_MAX_OFF_REL);
  }
  wmRenderPromptPanel();
  wmUpdatePromptCount();
}
function wmOpenPromptPanel(){
  if(!wmEd.open||wmEd.dlgOpen||wmEd.promptOpen)return;
  var modal=wmEl('wmPromptModal');
  if(!modal||!wmEd.work)return;
  wmClearLongPress();
  wmFinishPinDrag(true);
  wmHidePopup();
  wmEd.promptOpen=true;
  wmEd.dlgOpen=true; // 复用「弹窗开着」的拦截：地图手势、工具栏、撤回在面板开着时都暂停
  wmEd.promptSnap=wmSnap(wmEd.work);
  wmRenderPromptPanel();
  modal.classList.add('show');
  var done=wmEl('wmPromptDone');
  if(done)done.focus();
}
// 关闭面板：这一次的勾选改动合并成一步撤回，不会一次点十下占掉十步
function wmClosePromptPanel(){
  if(!wmEd.promptOpen)return;
  var modal=wmEl('wmPromptModal');
  if(modal)modal.classList.remove('show');
  var ae=document.activeElement;
  if(ae&&typeof ae.blur==='function'&&modal&&modal.contains(ae))ae.blur();
  wmEd.promptOpen=false;
  wmEd.dlgOpen=false;
  if(wmEd.work&&wmSnap(wmEd.work)!==wmEd.promptSnap)wmPushUndo(wmEd.promptSnap);
  wmEd.promptSnap='';
  wmUpdatePromptCount();
  wmUpdateToolbar();
}

// ==================== 八、编辑器：元素列表 ====================
// 左侧工具栏的「元素列表」按钮展开 #wmListPanel：列出全部分区、地点和关联线。
// 点一项：地图平移/缩放到它并高亮（被隐藏的项会临时显示出来）；行尾的铅笔直接打开它的编辑弹窗。
// 名称被盖住、大区套小区点不中的时候，用它来选中和编辑。
function wmToggleListPanel(){
  if(!wmEd.open||wmEd.dlgOpen)return;
  wmEd.listOpen=!wmEd.listOpen;
  var panel=wmEl('wmListPanel'),center=wmEl('wmCenter');
  if(panel)panel.classList.toggle('show',wmEd.listOpen);
  if(center)center.classList.toggle('wm-list-open',wmEd.listOpen); // 列表展开时，左上角的字数提示条要让到列表右边
  if(wmEd.listOpen){
    wmRenderListPanel();
  }else if(wmEd.focus){
    wmEd.focus=null;
    wmRenderAll();
  }
  wmUpdateToolbar();
}
function wmRenderListPanel(){
  var body=wmEl('wmListBody'),filter=wmEl('wmListFilter');
  if(!body||!wmEd.work||!wmEd.listOpen)return;
  var kw=filter?filter.value.trim().toLowerCase():'';
  var hid=wmHiddenMap(wmEd.work);
  var scroll=body.scrollTop;
  while(body.firstChild)body.removeChild(body.firstChild);
  var any=false;
  [['zone','分区',wmEd.work.zones],['pin','地点',wmEd.work.pins],['link','关联线',wmEd.work.links]].forEach(function(g){
    var rows=g[2].filter(function(it){return !kw||it.name.toLowerCase().indexOf(kw)>=0;});
    if(!rows.length)return;
    any=true;
    var head=document.createElement('div');
    head.className='wm-pgrp';
    head.textContent=g[1]+'（'+rows.length+'）';
    body.appendChild(head);
    rows.forEach(function(it){body.appendChild(wmListRow(g[0],g[1],it,hid[g[0]+':'+it.id]===true));});
});
  if(!any){
    var empty=document.createElement('div');
    empty.className='wm-pgrp';
    empty.textContent=kw?'没有匹配的元素':'还没有分区、地点或关联线';
    body.appendChild(empty);
  }
  body.scrollTop=scroll;
}
function wmListRow(kind,kindName,it,hidden){
  var on=!!wmEd.focus&&wmEd.focus.t===kind&&wmEd.focus.id===it.id;
  var row=document.createElement('div');
  row.className='wm-lrow'+(on?' wm-lrow-on':'')+(hidden?' wm-lrow-off':'');
  var main=document.createElement('button');
  main.type='button';
  main.className='wm-lmain';
  main.setAttribute('aria-pressed',on?'true':'false');
  main.setAttribute('aria-label','定位'+kindName+'：'+it.name+(hidden?'（已隐藏）':''));
  var mark;
  if(kind==='pin'){
    mark=wmPinTypeIcon(wmCleanPinType(it.type),it.color);
  }else{
    mark=document.createElement('span');
    mark.className='wm-ldot'+(kind==='link'?' wm-ldot-link':'');
    mark.style.setProperty('--wm-c',it.color);
  }
  var name=document.createElement('span');
  name.className='wm-lname';
  name.textContent=it.name; // 用户输入一律走 textContent
  main.appendChild(mark);
  main.appendChild(name);
  if(hidden){
    var tag=document.createElement('span');
    tag.className='wm-ltag';
    tag.textContent='已隐藏';
    main.appendChild(tag);
  }
  main.addEventListener('click',function(){wmFocusItem(kind,it.id);});
  var edit=document.createElement('button');
  edit.type='button';
  edit.className='wm-ledit';
  edit.setAttribute('aria-label','编辑'+kindName+'：'+it.name);
  var icon=document.createElement('i');
  icon.className='fas fa-pen';
  edit.appendChild(icon);
  edit.addEventListener('click',function(){wmListEdit(kind,it.id);});
  row.appendChild(main);
  row.appendChild(edit);
  return row;
}
// 定位：高亮并把它移到视口中心（列表展开时，移到列表右边那块空地的中心）
function wmFocusItem(kind,id){
  if(!wmEd.open||wmEd.dlgOpen)return;
  var it=wmFindItem({t:kind,id:id});
  if(!it)return;
  wmEd.focus={t:kind,id:id};
  wmHidePopup();
  wmRenderAll(); // 先重画：被临时显示的隐藏项要重画后 anchors 里才有它
  wmCenterOnItem(kind,it);
  wmRenderListPanel();
}
function wmCenterOnItem(kind,it){
  var box=null,pad=WM_FOCUS_PAD,v=wmEd.view;
  if(kind==='zone'){
    var xs=it.pts.map(function(p){return p[0]*WM_W;}),ys=it.pts.map(function(p){return p[1]*WM_H;});
    box=[Math.min.apply(null,xs),Math.min.apply(null,ys),Math.max.apply(null,xs),Math.max.apply(null,ys)];
  }else if(kind==='pin'){
    box=[it.x*WM_W,it.y*WM_H,it.x*WM_W,it.y*WM_H];
  }else{
    var a=wmEd.anchors[it.a.t+':'+it.a.id],b=wmEd.anchors[it.b.t+':'+it.b.id];
    if(!a||!b)return;
    box=[Math.min(a[0],b[0]),Math.min(a[1],b[1]),Math.max(a[0],b[0]),Math.max(a[1],b[1])];
  }
  var size=wmViewSize(),panel=wmEl('wmListPanel');
  var left=(wmEd.listOpen&&panel)?panel.offsetWidth:0;
  var freeW=Math.max(1,size.w-left),freeH=Math.max(1,size.h);
  var bw=Math.max(1,box[2]-box[0]),bh=Math.max(1,box[3]-box[1]);
  var s;
  if(kind==='pin'){
    s=Math.max(v.s,v.min*2.5); // 地点只是一个点：至少放大到能看清周围
  }else{
    s=Math.min((freeW-pad*2)/bw,(freeH-pad*2)/bh);
  }
  v.s=wmClamp(s,v.min,v.min*8);
  v.tx=left+freeW/2-(box[0]+box[2])/2*v.s;
  v.ty=freeH/2-(box[1]+box[3])/2*v.s;
  wmClampView();wmApplyView();
}
function wmListEdit(kind,id){
  if(!wmEd.open||wmEd.dlgOpen)return;
  if(wmEd.mode!=='idle'){wmToast('请先完成当前操作');return;}
  wmHidePopup();
  wmOpenEditDialog({t:kind,id:id});
}
// 关闭或重新打开编辑器时调用：收起列表、清掉高亮和过滤词
function wmListReset(){
  wmEd.listOpen=false;wmEd.focus=null;
  var panel=wmEl('wmListPanel'),filter=wmEl('wmListFilter'),center=wmEl('wmCenter');
  if(panel)panel.classList.remove('show');
  if(center)center.classList.remove('wm-list-open');
  if(filter)filter.value='';
}

// ==================== 九、导出带标注的地图图片 ====================
// 把底图和标注（分区、关联线、名称、地点戳）合成一张 PNG，方便发给读者或做小说配图。
// 隐藏的项不画，名称被隐藏的项不画名称。生成后交给长图导出同一套交付流程（系统分享 → 下载 → 长按保存），套壳 APK 也能用
var _wmExporting=false;
var WM_EXPORT_FONT='"PingFang SC","Noto Sans SC","Microsoft YaHei",sans-serif';
function wmExportImage(){
  if(_wmExporting)return;
  if(!worldMap||!worldMap.img){showToast('请先上传地图');return;}
  var btn=wmEl('wmExportBtn');
  _wmExporting=true;
  if(btn)btn.disabled=true;
  var release=function(){ // 成功、失败、超时都走这里，按钮不会卡在禁用状态
    _wmExporting=false;
    if(btn)btn.disabled=false;
  };
  showToast('正在生成地图图片...',2000);
  wmRenderExportBlob(worldMap,function(blob){
    release();
    wmDeliverExport(blob);
  },function(reason){
    release();
    showDlg('地图导出失败',reason,function(){},false,false);
});
}
function wmExportRoundRect(ctx,x,y,w,h,r){
  ctx.beginPath();
  ctx.moveTo(x+r,y);
  ctx.arcTo(x+w,y,x+w,y+h,r);
  ctx.arcTo(x+w,y+h,x,y+h,r);
  ctx.arcTo(x,y+h,x,y,r);
  ctx.arcTo(x,y,x+w,y,r);
  ctx.closePath();
}
// 名称标签：深色半透明底 + 彩色描边 + 白字，与编辑器里一致；cy 是标签中心的纵坐标
function wmExportLabel(ctx,text,cx,cy,color){
  var size=15,padX=10,maxW=220;
  ctx.font='600 '+size+'px '+WM_EXPORT_FONT;
  var chars=Array.from(text),shown=text;
  while(chars.length>1&&ctx.measureText(shown).width>maxW-padX*2){
    chars.pop();
    shown=chars.join('')+'…';
  }
  var w=ctx.measureText(shown).width+padX*2,h=size+10;
  wmExportRoundRect(ctx,cx-w/2,cy-h/2,w,h,h/2);
  ctx.fillStyle='rgba(15,15,20,.74)';
  ctx.fill();
  ctx.lineWidth=1.5;
  ctx.strokeStyle=color;
  ctx.stroke();
  ctx.fillStyle='#ffffff';
  ctx.textAlign='center';
  ctx.textBaseline='middle';
  ctx.fillText(shown,cx,cy+1);
  return h;
}
function wmExportPin(ctx,p,hideName){
  var x=p.x*WM_W,y=p.y*WM_H;
  ctx.save();
  ctx.translate(x-14,y-36);
  ctx.fillStyle=p.color;
  ctx.strokeStyle='#ffffff';
  ctx.lineWidth=2;
  ctx.lineJoin='round';
  var body=new Path2D(WM_PIN_PATH);
  ctx.fill(body);
  ctx.stroke(body);
  (WM_PIN_GLYPHS[wmCleanPinType(p.type)]||WM_PIN_GLYPHS.pin).forEach(function(g){
    var path=new Path2D(g.d);
    if(g.mode==='stroke'){
      ctx.lineWidth=g.w;
      ctx.lineCap='round';
      ctx.strokeStyle='#ffffff';
      ctx.stroke(path);
    }else{
      ctx.fillStyle='#ffffff';
      if(g.mode==='evenodd')ctx.fill(path,'evenodd');else ctx.fill(path);
    }
});
  ctx.restore();
  if(!hideName)wmExportLabel(ctx,p.name,x,y-36-2-12,p.color);
}
function wmDrawExport(ctx,map,img){
  var hid=wmHiddenMap(map),anchors={};
  ctx.drawImage(img,0,0,WM_W,WM_H);
  var labels=[];
  map.pins.forEach(function(p){anchors['pin:'+p.id]=[p.x*WM_W,p.y*WM_H];});
  map.zones.forEach(function(z){
    var pts=z.pts.map(function(p){return [p[0]*WM_W,p[1]*WM_H];});
    var c=wmPolyCenter(pts);
    anchors['zone:'+z.id]=c;
    if(hid['zone:'+z.id])return;
    ctx.beginPath();
    pts.forEach(function(p,i){if(i===0)ctx.moveTo(p[0],p[1]);else ctx.lineTo(p[0],p[1]);});
    ctx.closePath();
    ctx.globalAlpha=0.12;
    ctx.fillStyle=z.color;
    ctx.fill();
    ctx.globalAlpha=1;
    ctx.lineWidth=2.5;
    ctx.lineJoin='round';
    ctx.strokeStyle=z.color;
    ctx.stroke();
    if(!z.hideName)labels.push({text:z.name,x:c[0],y:c[1],color:z.color});
});
  map.links.forEach(function(l){
    var a=anchors[l.a.t+':'+l.a.id],b=anchors[l.b.t+':'+l.b.id];
    if(!a||!b||hid['link:'+l.id])return;
    ctx.beginPath();
    ctx.moveTo(a[0],a[1]);
    ctx.lineTo(b[0],b[1]);
    ctx.lineWidth=3;
    ctx.lineCap='round';
    ctx.strokeStyle=l.color;
    ctx.setLineDash([10,6]);
    ctx.stroke();
    ctx.setLineDash([]);
    if(!l.hideName)labels.push({text:l.name,x:(a[0]+b[0])/2,y:(a[1]+b[1])/2,color:l.color});
});
  labels.forEach(function(lb){wmExportLabel(ctx,lb.text,lb.x,lb.y,lb.color);});
  map.pins.forEach(function(p){
    if(hid['pin:'+p.id])return;
    wmExportPin(ctx,p,p.hideName===true);
});
}
// 渲染成 PNG Blob。onDone(blob) / onFail(reason) 只会有一个被调用一次（含 20 秒超时）
function wmRenderExportBlob(map,onDone,onFail){
  var settled=false,timer=0;
  var finish=function(fn,arg){
    if(settled)return;
    settled=true;
    if(timer)clearTimeout(timer);
    fn(arg);
  };
  try{
    if(typeof Path2D!=='function')throw new Error('当前浏览器版本过低，不支持导出地图图片');
    var img=new Image();
    img.onload=function(){
      try{
        var canvas=document.createElement('canvas');
        canvas.width=WM_W*WM_EXPORT_SCALE;
        canvas.height=WM_H*WM_EXPORT_SCALE;
        var ctx=canvas.getContext('2d');
        if(!ctx)throw new Error('当前环境不支持 Canvas，无法生成图片');
        ctx.scale(WM_EXPORT_SCALE,WM_EXPORT_SCALE);
        wmDrawExport(ctx,map,img);
        var toBlob=function(blob){
          if(blob)finish(onDone,blob);
          else finish(onFail,'图片生成失败，当前环境不支持导出，请更换浏览器后重试。');
        };
        if(canvas.toBlob){
          canvas.toBlob(toBlob,'image/png');
        }else{ // 极少数不支持 toBlob 的环境：用 toDataURL 手动转成 Blob
          var dataUrl=canvas.toDataURL('image/png');
          var bstr=atob(dataUrl.split(',')[1]);
          var n=bstr.length,u8=new Uint8Array(n);
          while(n--){u8[n]=bstr.charCodeAt(n);}
          toBlob(new Blob([u8],{type:'image/png'}));
        }
      }catch(err){
        logError('wmRenderExportBlob',err);
        finish(onFail,'地图图片生成时发生错误：'+((err&&err.message)||'未知错误'));
      }
    };
    img.onerror=function(){finish(onFail,'地图底图读取失败，请重新上传地图后再试。');};
    timer=setTimeout(function(){finish(onFail,'生成图片超时，请稍后重试。');},20000);
    img.src=map.img;
  }catch(err){
    logError('wmRenderExportBlob',err);
    finish(onFail,(err&&err.message)||'地图图片生成失败');
  }
}
function wmDeliverExport(blob){
  var now=new Date();
  var pad=function(n){return (n<10?'0':'')+n;};
  var filename='世界地图_'+now.getFullYear()+pad(now.getMonth()+1)+pad(now.getDate())+'-'+pad(now.getHours())+pad(now.getMinutes())+'.png';
  if(typeof _liDeliverImage==='function'){
    _liDeliverImage(blob,filename,'地图导出完成'); // 与小说长图共用：系统分享 → 下载 → 长按保存
    return;
  }
  try{ // 长图导出模块不可用时的兜底，正常不会走到这里
    var url=URL.createObjectURL(blob);
    var a=document.createElement('a');
    a.href=url;a.download=filename;a.style.display='none';
    document.body.appendChild(a);a.click();
    setTimeout(function(){try{URL.revokeObjectURL(url);document.body.removeChild(a);}catch(e){}},1000);
    showToast('已尝试导出：'+filename);
  }catch(err){
    logError('wmDeliverExport',err);
    showToast('当前环境无法导出图片',3000);
  }
}

wmInitInline();
wmRenderInline();
