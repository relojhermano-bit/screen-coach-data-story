/* V11 正式提交版交互：手机滚动、词云与对比条、FITT、人体热力图、散点图和全局导航。 */
/* 滚动性能：把多个 scroll 回调合并到每帧一次，避免移动端逐事件强制重排造成卡顿 */
function rafThrottle(fn){var q=false;return function(){if(q)return;q=true;requestAnimationFrame(function(){q=false;fn();});};}
/* 章节可见性门控：返回 ()=>bool。章节远离视口时跳过逐帧场景计算与 DOM 写入，
   避免离屏章节在整页滚动时持续触发布局/合成（Safari 掉帧主因）。*/
function makeVisibilityGate(el,margin){
  var vis=true;
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){vis=es[es.length-1].isIntersecting;},{rootMargin:(margin||'240px')+' 0px'});
    io.observe(el);
  }
  return function(){return vis;};
}
/* ch0 */
(function(){
var __r=document.getElementById('ch0');

(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  var progress=document.getElementById('progress__ch0');
  function onScrollProgress(){var h=document.documentElement.scrollHeight-window.innerHeight;progress.style.width=(h>0?(window.scrollY/h*100):0)+'%';}

  /* reveal */
  __r.querySelectorAll('.reveal').forEach(function(el){
    var o=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');o.unobserve(e.target);}});},{threshold:.16});
    o.observe(el);
  });

  /* 巨型数字滚动（强调“好多人”）*/
  function countUp(el){
    var t=parseFloat(el.getAttribute('data-count')),d=parseInt(el.getAttribute('data-dec')||'0',10);
    if(reduce){el.textContent=t.toFixed(d);return;}
    var t0=null;
    requestAnimationFrame(function s(ts){            // 经 rAF 拿到真实时间戳，避免 NaN
      if(t0===null)t0=ts;
      var p=Math.min((ts-t0)/1400,1),e=1-Math.pow(1-p,3);
      el.textContent=(t*e).toFixed(d);
      if(p<1)requestAnimationFrame(s);
    });
  }
  __r.querySelectorAll('[data-count]').forEach(function(el){
    var o=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){countUp(el);o.unobserve(el);}});},{threshold:.6});o.observe(el);
  });

  /* 人形点阵：填充每个大数字背后，进入视图时随机错峰浮出 */
  (function(){
    var glyph='<svg viewBox="0 0 12 18" fill="currentColor"><circle cx="6" cy="3.4" r="3"/><path d="M0.6 18V12.8C0.6 8.4 11.4 8.4 11.4 12.8V18Z"/></svg>';
    var mb=__r.querySelector('.magnitude'); if(!mb)return;
    mb.querySelectorAll('.mag').forEach(function(mag){
      var n=parseInt(mag.getAttribute('data-people')||'0',10); if(!n)return;  // 仅 1.2亿 有人形（1 小人≈100万）
      var field=document.createElement('div');field.className='mag-people';
      for(var i=0;i<n;i++){var s=document.createElement('span');s.className='pf';s.innerHTML=glyph;
        s.style.transitionDelay=(Math.random()*1.15).toFixed(2)+'s';field.appendChild(s);}
      mag.insertBefore(field,mag.firstChild);
    });
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){
      mb.querySelectorAll('.mag-people').forEach(function(f){f.classList.add('on');});io.disconnect();}});},{threshold:.4});
    io.observe(mb);
  })();

  /* ===== ③ 真封面砌柱：滚到时一格一格往上堆 ===== */
  (function(){
    var TILE_H=23;
    var COVS=[];for(var i=0;i<28;i++)COVS.push("assets/covers/c"+(i<10?'0':'')+i+".jpg?v=4");
    var grow=document.getElementById('mvGrow'); if(!grow)return;
    var bars=[].map.call(grow.querySelectorAll('.coverbar'),function(b){return {el:b,n:parseInt(b.getAttribute('data-tiles'),10)||1,i:0};});
    bars.forEach(function(bar){bar.el.style.height=(bar.n*TILE_H)+'px';});  // 预留最终高度，整框不再变大
    function addTile(bar,seed){
      var t=document.createElement('div');t.className='tile';
      t.style.backgroundImage="url('"+COVS[(seed*5+2)%COVS.length]+"')";
      bar.appendChild(t);
      requestAnimationFrame(function(){requestAnimationFrame(function(){t.classList.add('on');});});
    }
    function run(){
      // 先短款（一年前），再高款（现在），逐格堆叠
      var order=bars.slice().sort(function(a,b){return a.n-b.n;});
      var idx=0;
      function tick(){
        var bar=order[idx];
        if(!bar){ // 全堆完 → 亮出 ×2.9 / +186%
          grow.querySelectorAll('.vv,.mult').forEach(function(e){e.classList.add('on');});
          return;
        }
        if(bar.i>=bar.n){ idx++; setTimeout(tick,180); return; }
        addTile(bar.el,bar.i); bar.i++;
        setTimeout(tick,reduce?0:135);
      }
      tick();
    }
    var done=false;
    var io=new IntersectionObserver(function(es){es.forEach(function(e){
      if(e.isIntersecting&&!done){done=true;run();io.disconnect();}
    });},{threshold:.45});
    io.observe(grow);
  })();

  /* ===== 真实 B 站“减肥”搜索数据（标题/UP主/播放量取自真实结果）===== */
  // hero:true 为“播放量最高、且典型流量承诺”的那条
  // cov = 封面网格序号(0..27)，按标题匹配真实封面
  var feed=[
    {t:'无意识的变瘦行为（30斤）',up:'这世界本就是这样',play:'1392.6万',dm:'2.1万',dur:'3:51',cov:21},
    {t:'一口气讲清如何<em>减肥</em>，深度对话上海六院减重专家韩晓东主任',up:'透近医学',play:'27.3万',dm:'1825',dur:'1:25:16',cov:0},
    {t:'【3个月减35斤？】10个你必须知道的减脂技巧(新手必看)',up:'帅soserious',play:'327.1万',dm:'9026',dur:'13:57',cov:1},
    {c:'鹿麻雀：我想问一下，瘦得跟火柴人一样、手腕一夹就一圈的这种怎么增肥？每顿吃饱了吃撑了还是不胖…'},
    {t:'【偏口鱼博士】教你如何<em>减肥</em>，减肥不需要运动，肥胖的终极原因大揭秘',up:'科普知识干货分享',play:'2.9万',dm:'13',dur:'36:35',cov:3},
    {t:'【无广】<em>减肥</em>失败不是你的错！关于减肥你想了解的都在这',up:'神奇菌汤锅',play:'105.7万',dm:'2865',dur:'20:16',cov:6},
    {t:'每天坚持12分钟全身HIIT运动（疯狂燃脂，快速瘦身）',up:'小波健身',play:'1556.1万',dm:'6.2万',dur:'12:45',cov:4},
    {t:'帕梅拉 30分钟经典燃脂三部曲｜暴汗内啡肽+最佳HIIT+站立腹',up:'帕梅拉PamelaReif',play:'521.0万',dm:'1.2万',dur:'33:43',cov:7},
    {c:'见谁夸谁：博主讲得很好，但对减肥人群最关键的一点就是别骗自己——别说自己吃得少、别说喝水都胖…'},
    {t:'【每天一遍】10分钟肚腩消减训练(男女通用)',up:'帅soserious',play:'1804.5万',dm:'15.8万',dur:'11:46',cov:23},
    {t:'30分钟全程站立有氧燃脂操｜无跳跃 无深蹲 膝友好',up:'周六野Zoey',play:'1391.7万',dm:'4.6万',dur:'31:26',cov:15},
    {t:'【每天15分钟，坚持就能瘦】30分钟站立无跳跃暴汗燃脂操 · 零基础友好',up:'某健身博主',play:'2900.0万',dm:'11.0万',dur:'31:01',cov:12,hero:true,anon:true},
    {t:'3个月30斤【适合100斤-250斤】无跳跃 不伤膝 大体重友好运动',up:'健身小柯蚪',play:'550.7万',dm:'1.0万',dur:'15:31',cov:22},
    {t:'30天减肥挑战！运动vs节食vs医疗减肥法哪个最有效？',up:'杰克小兔',play:'338.5万',dm:'2954',dur:'22:41',cov:27},
    {t:'大体重减肥9周跟练1.0｜必瘦10斤+｜200斤欢迎光临',up:'叶的冒险',play:'265.5万',dm:'2024',dur:'2:12:24',cov:20},
    {t:'30岁以后，减脂为什么突然变难了?!(如何提升代谢)',up:'帅soserious',play:'242.4万',dm:'1710',dur:'11:33',cov:25}
  ];

  function covUrl(i){return "assets/covers/c"+(i<10?'0':'')+i+".jpg?v=4";}
  // --cov is consumed inside styles/main.css, so its relative URL starts one level above that stylesheet.
  function covCssUrl(i){return "../assets/covers/c"+(i<10?'0':'')+i+".jpg?v=4";}
  var inner=document.getElementById('vlistInner');
  var nodes=[], heroNode=null;
  feed.forEach(function(it){
    var el=document.createElement('div');
    if(it.c){
      el.className='crow';
      var parts=it.c.split('：');
      el.innerHTML='<span class="av"></span><span class="ct"><b>'+parts[0]+'</b>'+(parts[1]||'')+'</span>';
    }else{
      el.className='vrow'+(it.hero?' hero':'');
      var thumb;
      if(it.anon){
        // 致害视频去标识：封面打码、加“示意”标，避免指向真实账号
        var au=(it.cov!=null)?covUrl(it.cov):'';
        thumb='<div class="vthumb" style="position:relative;overflow:hidden">'+
          '<span style="position:absolute;inset:0;background:url(\''+au+'\') center/cover no-repeat;filter:blur(9px) saturate(.9);transform:scale(1.2)"></span>'+
          '<span style="position:absolute;z-index:2;left:5px;top:5px;background:rgba(20,20,22,.6);color:#fff;font-size:10px;line-height:1;padding:2px 6px;border-radius:3px;letter-spacing:.08em">示意</span>'+
          '<span class="dur">'+it.dur+'</span></div>';
      }else{
        var cv=(it.cov!=null)?"--cov:url('"+covCssUrl(it.cov)+"')":'';
        thumb='<div class="vthumb" style="'+cv+'"><span class="dur">'+it.dur+'</span></div>';
      }
      el.innerHTML=
        thumb+
        '<div class="vinfo"><div class="vtitle">'+it.t+'</div>'+
        '<div class="vup"><span class="up">⏏ '+it.up+'</span></div>'+
        '<div class="vstat"><span>▶ '+it.play+'</span><span>💬 '+it.dm+'</span></div></div>';
      if(it.hero) heroNode=el;
    }
    inner.appendChild(el);
    nodes.push(el);
  });

  /* ===== 第一幕：The Pudding 式 step 驱动 =====
     左侧文字 step 真正流动滚过；当前 step 由“视口中线落在哪一段”决定，
     段内进度 lp(0→1) 连续驱动手机：打字 / 视频涌入 / 推近高赞。 */
  var q=document.getElementById('q'), qText=q.firstChild, caret=document.getElementById('caret');
  var vlist=document.getElementById('vlist'), counter=document.getElementById('counter');
  var stepEls=__r.querySelectorAll('.s1-step');
  var TYPE='减肥', shown=-1, lastActive=-1;

  function setQuery(str,empty){qText.nodeValue=empty?'搜索':str;q.classList.toggle('empty',!!empty);}
  function setActive(idx){
    if(idx===lastActive)return;lastActive=idx;
    for(var i=0;i<stepEls.length;i++) stepEls[i].classList.toggle('active',i===idx);
  }
  function showRows(n){
    if(n===shown)return;shown=n;
    for(var i=0;i<nodes.length;i++){
      var on=i<n || (nodes[i]===heroNode && n>0);
      nodes[i].classList.toggle('show',on);
    }
  }
  function fillResults(){          // 移动端 / reduce：直接呈现结果
    setActive(0);showRows(nodes.length);setQuery(TYPE,false);
    caret.style.display='none';counter.classList.remove('show');
    vlist.classList.remove('zoom');inner.style.transform='translateY(0)';
  }

  function renderPhone(idx,lp){
    if(idx<=0){                                   // 打开手机
      setQuery('',true);caret.style.display='none';
      showRows(0);counter.classList.remove('show');vlist.classList.remove('zoom');
      inner.style.transform='translateY(0)';
    }else if(idx===1){                            // 假装打字“减肥”
      var nc=Math.round(Math.min(lp/0.55,1)*TYPE.length);
      setQuery(TYPE.slice(0,nc),nc===0);caret.style.display='inline-block';
      showRows(0);counter.classList.remove('show');vlist.classList.remove('zoom');
      inner.style.transform='translateY(0)';
    }else if(idx===2){                            // 视频涌入
      setQuery(TYPE,false);caret.style.display='none';
      var n=Math.round(lp*nodes.length);
      showRows(n);
      counter.classList.add('show');
      counter.textContent='已加载 '+Math.round(lp*(326-8)+8)+' 条';
      vlist.classList.remove('zoom');
      var maxShift=Math.max(0,inner.scrollHeight-vlist.clientHeight);
      inner.style.transform='translateY('+(-lp*Math.min(maxShift,120))+'px)';
    }else{                                        // 推近高赞那条
      setQuery(TYPE,false);caret.style.display='none';
      showRows(nodes.length);
      counter.classList.remove('show');vlist.classList.add('zoom');
      if(heroNode){
        var target=heroNode.offsetTop-(vlist.clientHeight/2-heroNode.offsetHeight/2);
        var ms=Math.max(0,inner.scrollHeight-vlist.clientHeight);
        inner.style.transform='translateY('+(-Math.max(0,Math.min(target,ms)))+'px)';
      }
    }
  }

  function onScene(){
    if(reduce){ if(shown!==nodes.length) fillResults(); return; }
    var vc=window.innerHeight*0.5;                // 视口中线
    var active=0, lp=0, matched=false;
    for(var i=0;i<stepEls.length;i++){
      var r=stepEls[i].getBoundingClientRect();
      if(r.top<=vc && r.bottom>vc){active=i;lp=(vc-r.top)/r.height;matched=true;break;}
    }
    var lastR=stepEls[stepEls.length-1].getBoundingClientRect();
    if(!matched && lastR.bottom<=vc){active=stepEls.length-1;lp=1;}  // 滚过末段
    lp=Math.min(Math.max(lp,0),1);
    setActive(active);renderPhone(active,lp);
  }
  /* #ch0 离屏时冻结手机场景：停掉逐帧布局读取与 DOM 写入，并暂停装饰动画。 */
  var ch0Vis=true;
  if('IntersectionObserver' in window){
    var ch0io=new IntersectionObserver(function(es){
      ch0Vis=es[es.length-1].isIntersecting;
      __r.classList.toggle('offscreen',!ch0Vis);
      inner.style.willChange=ch0Vis?'transform':'auto';
      if(ch0Vis)onScene();   // 重新入屏立即同步手机状态，避免残留旧帧
    },{rootMargin:'240px 0px'});
    ch0io.observe(__r);
  }
  function tick(){if(!ch0Vis)return;onScrollProgress();onScene();}
  var tickT=rafThrottle(tick);
  window.addEventListener('scroll',tickT,{passive:true});
  window.addEventListener('resize',tickT);

  if(reduce){ fillResults(); }
  else { showRows(0); tick(); }

  
})();

})();

/* ch1 */
(function(){
var __r=document.getElementById('ch1');

(function(){
  var reduce=window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  var progress=document.getElementById('progress__ch1');
  var ch1Vis=makeVisibilityGate(__r);   // ch1 离屏时不再逐帧读取布局或写入进度条
  window.addEventListener('scroll',rafThrottle(function(){
    if(!ch1Vis())return;
    var h=document.documentElement.scrollHeight-window.innerHeight;
    progress.style.width=(h>0?(window.scrollY/h*100):0)+'%';
  }),{passive:true});

  /* reveal */
  __r.querySelectorAll('.reveal').forEach(function(el){
    var o=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');o.unobserve(e.target);}});},{threshold:.16});
    o.observe(el);
  });
  /* ② 高频词（a1）：在场（按词频定字号）vs 缺席 */
  var PRESENT=[
    ['分钟',243],['燃脂',76],['新手',78],['每天',65],['居家',64],['深蹲',61],['瘦腿',56],
    ['暴汗',44],['站立',44],['减脂',41],['减肥',38],['瘦肚子',37],['快速',35],
    ['高效',31],['有效',31],['友好',30],['塑形',30],['见效',21],['一周',21]
  ];
  var GHOST=['热身','恢复','训练强度','循序渐进','退阶','风险提示','禁忌人群','动作标准'];
  var maxV=243;

  /* 矩形相交检测（带内边距，避免贴太紧）*/
  function cloudHit(a,list){
    for(var i=0;i<list.length;i++){var b=list[i];
      if(a.l<b.r&&a.r>b.l&&a.t<b.b&&a.b>b.t)return true;}
    return false;
  }
  /* 螺旋词云布局：字号大→小，从中心沿阿基米德螺旋找首个不重叠位置；纵向压扁→更像云朵 */
  function layoutCloud(boxEl,items,opt){
    opt=opt||{}; boxEl.innerHTML='';
    var cw=boxEl.clientWidth||700, H=opt.height||400, pad=(opt.pad!=null?opt.pad:6);
    boxEl.style.height=H+'px';
    var cx=cw/2, cy=H/2, placed=[];
    items.slice().sort(function(a,b){return b.size-a.size;}).forEach(function(it,idx){
      var s=document.createElement('span'); s.className='w'+(it.ghost?' ghost':'');
      s.style.fontSize=it.size+'px';
      if(it.color) s.style.color=it.color;
      if(it.vertical) s.style.writingMode='vertical-rl';
      s.style.transitionDelay=(idx*0.035).toFixed(2)+'s';
      s.textContent=it.text; boxEl.appendChild(s);
      var bw=s.offsetWidth, bh=s.offsetHeight, x=cx, y=cy, t=0, k;
      var offX=it.ghost?((idx*7)%21-10):0, offY=it.ghost?((idx*13)%19-9):0;
      for(k=0;k<4800;k++){
        var r=1.8*t;
        x=cx+r*Math.cos(t)+offX; y=cy+r*Math.sin(t)*0.62+offY;
        var rc={l:x-bw/2-pad,t:y-bh/2-pad,r:x+bw/2+pad,b:y+bh/2+pad};
        if(rc.l>=0&&rc.t>=0&&rc.r<=cw&&rc.b<=H&&!cloudHit(rc,placed))break;
        t+=0.16;
      }
      s.style.left=Math.round(x-bw/2)+'px';
      s.style.top=Math.round(y-bh/2)+'px';
      placed.push({l:x-bw/2-pad,t:y-bh/2-pad,r:x+bw/2+pad,b:y+bh/2+pad});
    });
  }
  /* 一朵云：高频承诺词(红，按频次定大小) + 其余少见词(灰·虚线，刻意小)，
     字号大→小依次螺旋落位 → 少见词自然被挤到边缘，视觉上「被承诺词淹没」 */
  function cloudItems(){
    var arr=PRESENT.map(function(w,i){return {
      text:w[0],
      size:20+Math.round(Math.pow(w[1]/maxV,0.6)*38),          // 20–58px
      color:(w[1]>=40?'var(--accent)':'#cf6a54'),
      vertical:(i%5===3)
    };});
    GHOST.forEach(function(t,i){
      arr.push({text:t,size:17+(i%3)*2,ghost:true,vertical:(i%4===2)});   // 17–21px
    });
    return arr;
  }
  var cAllEl=document.getElementById('cloudAll');
  var _lastCW=-1;   // 仅在词云宽度真正变化时重排，避免移动端 Safari 反复触发布局
  function relayoutClouds(force){
    var cw=cAllEl.clientWidth;
    if(!force && cw===_lastCW) return;
    _lastCW=cw;
    layoutCloud(cAllEl,cloudItems(),{height:(cw<520?500:440)});
  }
  relayoutClouds(true);
  /* 字体异步加载完 / 窗口缩放后重排（布局确定性，不会抖动）*/
  if(document.fonts&&document.fonts.ready) document.fonts.ready.then(function(){relayoutClouds(true);});
  window.addEventListener('load',function(){relayoutClouds(true);});
  var _rcT; window.addEventListener('resize',function(){clearTimeout(_rcT);_rcT=setTimeout(relayoutClouds,200);});

  /* ③ 对比条：进入视图即生长 */
  var bars=document.getElementById('bars');
  var bo=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){bars.classList.add('in');bo.disconnect();}});},{threshold:.4});
  bo.observe(bars);
})();

})();

/* ch2 */
(function(){
var __r=document.getElementById('ch2');

(function(){
  var reduce=window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  var progress=document.getElementById('progress__ch2');
  var ch2Vis=makeVisibilityGate(__r);   // 供进度条与人体热力图共用；ch2 离屏时跳过逐帧计算
  window.addEventListener('scroll',rafThrottle(function(){
    if(!ch2Vis())return;
    var h=document.documentElement.scrollHeight-window.innerHeight;
    progress.style.width=(h>0?(window.scrollY/h*100):0)+'%';
  }),{passive:true});

  /* reveal */
  function observe(el,cb,th){
    var o=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){cb(e.target);o.unobserve(e.target);}});},{threshold:th||.16});
    o.observe(el);
  }
  __r.querySelectorAll('.reveal').forEach(function(el){observe(el,function(t){t.classList.add('in');});});

  /* ① FITT-VP 六要素卡片 */
  var FITT=[
    ['F','Frequency','频率'],['I','Intensity','强度'],['T','Time','时间'],
    ['T','Type','方式'],['V','Volume','总量'],['P','Progression','进阶']
  ];
  var fittWrap=document.getElementById('fittvp');
  var grid=document.createElement('div'); grid.className='fitt-grid';
  FITT.forEach(function(f,i){
    var c=document.createElement('div'); c.className='fcard';
    c.style.transitionDelay=(i*0.06).toFixed(2)+'s';
    c.innerHTML='<div class="w"><span class="cap">'+f[0]+'</span><span class="rest">'+f[1].slice(1)+'</span><span class="zh">'+f[2]+'</span></div>';
    grid.appendChild(c);
  });
  fittWrap.appendChild(grid);
  observe(grid,function(t){t.classList.add('in');},.3);  /* ③ 人体热力图（暖发光；文字滑过逐段点亮 膝/腰/颈，参照「人体受伤热力图_滚动版」）*/
  var SVGNS='http://www.w3.org/2000/svg';
  var heatG=document.getElementById('heatG'), defs=__r.querySelector('#bodySvg defs');
  var bodyPath=document.getElementById('bodyPath');
  var bb; try{bb=bodyPath.getBBox();}catch(e){bb=null;} if(!bb||bb.width<1) bb={x:59.8,y:0,width:86.5,height:206.1};

  // fy/dx = 占人体外接框比例（真实聚合 a4：腰2046·膝盖1099·脖子(颈)687）
      var PARTS={
    knee:      {zh:'膝盖', count:1099, mid:false, fy:0.72, dx:0.125},
    lower_back:{zh:'腰',   count:2046, mid:true,  fy:0.34},
    neck:      {zh:'颈',   count:687,  mid:true,  fy:0.13}
  };
  var MAXc=2046;
  var GLOW=[['0','rgb(255,206,128)','0.95'],['0.32','rgb(244,128,46)','0.9'],['0.62','rgb(232,74,42)','0.8'],['1','rgb(232,74,42)','0']];
  function mkStop(s){var e=document.createElementNS(SVGNS,'stop');e.setAttribute('offset',s[0]);e.setAttribute('stop-color',s[1]);e.setAttribute('stop-opacity',s[2]);return e;}
  var groups={};
  Object.keys(PARTS).forEach(function(id){
    var r=PARTS[id], norm=r.count/MAXc, rad=(0.16+0.12*Math.sqrt(norm))*bb.width;
    var fxs=r.mid?[0.5]:[0.5-r.dx,0.5+r.dx];
    var g=document.createElementNS(SVGNS,'g'); g.setAttribute('class','hr'); g.dataset.id=id;
    fxs.forEach(function(fx,k){
      var vx=bb.x+fx*bb.width, vy=bb.y+r.fy*bb.height, gid='hg_'+id+'_'+k;
      var grad=document.createElementNS(SVGNS,'radialGradient');
      grad.setAttribute('id',gid);grad.setAttribute('gradientUnits','userSpaceOnUse');
      grad.setAttribute('cx',vx);grad.setAttribute('cy',vy);grad.setAttribute('r',rad);
      GLOW.forEach(function(s){grad.appendChild(mkStop(s));});
      defs.appendChild(grad);
      var c=document.createElementNS(SVGNS,'circle');
      c.setAttribute('cx',vx);c.setAttribute('cy',vy);c.setAttribute('r',rad);
      c.setAttribute('fill','url(#'+gid+')');
      g.appendChild(c);
    });
    heatG.appendChild(g); groups[id]=g;
  });/* data-target → 点亮哪些部位 + 计数标签 */
  var TARGETS={
    '':           {ids:[], label:null},
    lower_back:   {ids:['lower_back'],       label:{nm:'腰',   count:2046}},
    knee:         {ids:['knee'],            label:{nm:'膝盖', count:1099}},
    neckshoulder: {ids:['neck'],            label:{nm:'颈',   count:687}},
    all:          {ids:['knee','lower_back','neck'], label:null}
  };
  function highlight(target){
    var t=TARGETS[target]||TARGETS[''];
    Object.keys(groups).forEach(function(id){ groups[id].classList.toggle('on',t.ids.indexOf(id)!==-1); });
  }

  /* 滚动：视口中线落在哪个 step-body → 激活并点亮对应部位 */
  var bSteps=[].slice.call(__r.querySelectorAll('.step-body'));
  var bLast=-1;
  function onBodyScroll(){
    var vc=window.innerHeight*0.5, active=-1;
    for(var i=0;i<bSteps.length;i++){ var r=bSteps[i].getBoundingClientRect(); if(r.top<=vc && r.bottom>vc){active=i;break;} }
    if(active<0){ var f=bSteps[0].getBoundingClientRect(); active=(f.top>vc)?0:bSteps.length-1; }
    if(active===bLast) return; bLast=active;
    for(var j=0;j<bSteps.length;j++) bSteps[j].classList.toggle('active',j===active);
    highlight(bSteps[active].getAttribute('data-target'));
  }
  /* ch2 离屏时跳过逐帧的 step-body 布局读取；初始化和 resize 时仍会更新状态。 */
  var onBodyScrollT=rafThrottle(function(){if(ch2Vis())onBodyScroll();});
  window.addEventListener('scroll',onBodyScrollT,{passive:true});
  window.addEventListener('resize',onBodyScroll);
  onBodyScroll();
})();

})();

/* ch3 —— 看不见的疼痛 */
(function(){
  var __r=document.getElementById('ch3'); if(!__r)return;
  __r.querySelectorAll('.reveal').forEach(function(el){
    var o=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');o.unobserve(e.target);}});},{threshold:.16});
    o.observe(el);
  });

  /* 评论墙：绿=正向（多），红=受伤（少且被淹没）——代表性样本，可替换为真实截图 */
  var COMMENTS=[
    {t:'三个月瘦了 28 斤，真的有效，强烈推荐！',k:'pos'},
    {t:'跟练打卡第 21 天，肚子明显小了一圈',k:'pos'},
    {t:'出汗超多，第二天体重轻了一斤多',k:'pos'},
    {t:'跟练第三天膝盖就疼了，是我的问题吗…',k:'hurt'},
    {t:'新手友好，不太累还能瘦，已经二刷',k:'pos'},
    {t:'腰围细了 5cm，开心到飞起',k:'pos'},
    {t:'每天 10 分钟，一个月瘦了 8 斤',k:'pos'},
    {t:'终于坚持下来了，感谢博主！',k:'pos'},
    {t:'练完腰一直酸，是不是我姿势不对？',k:'hurt'},
    {t:'无跳跃真的不吵，膝盖没什么负担',k:'pos'},
    {t:'马甲线初现，继续冲！',k:'pos'},
    {t:'比去健身房省钱多了，效果还不错',k:'pos'},
    {t:'肩颈练完反而更僵了，有点慌',k:'hurt'},
    {t:'第 30 天打卡，体脂降了 3%',k:'pos'},
    {t:'亲测有效，瘦腿很明显',k:'pos'},
    {t:'打卡第 14 天，裤子都松了',k:'pos'}
  ];
  var wall=document.getElementById('commentWall');
  if(wall){ COMMENTS.forEach(function(c,i){
    var d=document.createElement('div'); d.className='cwc '+c.k;
    d.style.transitionDelay=(i*0.04).toFixed(2)+'s';
    d.innerHTML='<span class="cwu">'+(c.k==='hurt'?'受伤反馈':'正向反馈')+'</span>'+c.t;
    wall.appendChild(d);
  }); }
})();

/* ch4 —— 看不见的手 */
(function(){
  var __r=document.getElementById('ch4'); if(!__r)return;
  __r.querySelectorAll('.reveal').forEach(function(el){
    var o=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');o.unobserve(e.target);}});},{threshold:.16});
    o.observe(el);
  });

  /* 科学评分 × 互动率散点（B站样本 n=865；r=0.034；数据见 data/science-engagement-scatter.js）。 */
  var sc=document.getElementById('scatter4');
  if(sc){
    var NS='http://www.w3.org/2000/svg';
    var VW=680, VH=320, L=54, Rp=18, Tp=16, Bp=44;
    var x0=L, x1=VW-Rp, y0=VH-Bp, y1=Tp;
    var svg=document.createElementNS(NS,'svg');
    svg.setAttribute('viewBox','0 0 '+VW+' '+VH);
    svg.setAttribute('preserveAspectRatio','xMidYMid meet');
    function el(n){return document.createElementNS(NS,n);}
    function line(a,b,c,d,cls){var l=el('line');l.setAttribute('x1',a);l.setAttribute('y1',b);l.setAttribute('x2',c);l.setAttribute('y2',d);l.setAttribute('class',cls);return l;}
    function txt(x,y,s,cls,anchor){var e=el('text');e.setAttribute('x',x);e.setAttribute('y',y);e.setAttribute('class',cls);if(anchor)e.setAttribute('text-anchor',anchor);e.textContent=s;return e;}
    svg.appendChild(line(x0,y0,x1,y0,'ax'));
    svg.appendChild(line(x0,y1,x0,y0,'ax'));
    svg.appendChild(txt((x0+x1)/2,VH-10,'科学评分 →','axtitle','middle'));
    var yc=(y0+y1)/2, yt=txt(16,yc,'互动率 →','axtitle','middle'); yt.setAttribute('transform','rotate(-90 16 '+yc+')'); svg.appendChild(yt);
    // —— R1 真实数据：B站可计算播放量样本 n=865；x=科学分 0-100，y=互动率(截顶 30%) ——
    var DATA=(window.SCATTER_R1||[]);
    var SXmin=0,SXmax=100, YMAX=0.30;
    function px(s){return x0+(Math.max(SXmin,Math.min(SXmax,s))-SXmin)/(SXmax-SXmin)*(x1-x0);}
    function py(v){return y0-Math.max(0,Math.min(YMAX,v))/YMAX*(y0-y1);}
    [0,20,40,60,80,100].forEach(function(s){ svg.appendChild(txt(px(s),y0+15,String(s),'axlab','middle')); });
    [0.1,0.2,0.3].forEach(function(v){ svg.appendChild(line(x0,py(v),x1,py(v),'cgrid')); svg.appendChild(txt(x0-8,py(v)+4,Math.round(v*100)+'%','axlab','end')); });
    /* 865 个点整体作为一层淡入，取代逐点 opacity 过渡造成的动画突刺。
       点本体恒定 opacity=.4，hover 时单点提亮仍有效。*/
    var dotwrap=el('g'); dotwrap.setAttribute('class','dotwrap');
    DATA.forEach(function(d,i){
      var c=el('circle');
      c.setAttribute('cx',px(d.s).toFixed(1)); c.setAttribute('cy',py(d.e).toFixed(1));
      c.setAttribute('r','2.6'); c.setAttribute('class','dot');
      var ti=document.createElementNS(NS,'title');
      ti.textContent='科学分 '+Math.round(d.s)+' ｜ 互动率 '+(d.e*100).toFixed(1)+'%'+(d.t?' ｜ '+d.t:'');
      c.appendChild(ti); dotwrap.appendChild(c);
    });
    svg.appendChild(dotwrap);
    // —— R2 真实回归线：eng = 0.0807283 + 0.00061339 × score（r=0.034，p=0.317，不显著）——
    var FI=0.0807283, FK=0.00061339;
    var fit=line(px(SXmin),py(FI+FK*SXmin),px(SXmax),py(FI+FK*SXmax),'binline'); fit.setAttribute('stroke-dasharray','5 5'); fit.setAttribute('stroke-width','2'); svg.appendChild(fit);
    svg.appendChild(txt(x1,y1+12,'拟合近平 · r=0.034（不显著）','axlab','end'));
    sc.appendChild(svg);
  }

  /* 资质 × 流量组合图：柱=B站中位播放量(左轴) + 线=平均科学分(右轴)；最严谨的几乎没流量=“倒挂”部分成立 */
  var cb=document.getElementById('combo4');
  if(cb){
    var N3='http://www.w3.org/2000/svg';
    var W=680,H=384, mL=58,mR=52,mT=46,mB=72;
    var x0=mL, x1=W-mR, y0=H-mB, y1=mT;
    function e3(n){return document.createElementNS(N3,n);}
    function t3(x,y,s,cls,anc){var e=e3('text');e.setAttribute('x',x);e.setAttribute('y',y);e.setAttribute('class',cls);if(anc)e.setAttribute('text-anchor',anc);e.textContent=s;return e;}
    function ln3(a,b,c,d,cls){var l=e3('line');l.setAttribute('x1',a);l.setAttribute('y1',b);l.setAttribute('x2',c);l.setAttribute('y2',d);l.setAttribute('class',cls);return l;}
    var g=e3('svg'); g.setAttribute('viewBox','0 0 '+W+' '+H); g.setAttribute('preserveAspectRatio','xMidYMid meet');
    // 真实聚合(analysis_dashboard a2)：健身达人中位播放最高(≈68万)、科学分偏低；医疗康复科学分最高(34.1)、中位播放最低(≈1.2万)
    var DATA=[{n:'健身达人',play:682612,sci:18.6},{n:'体科教练',play:319790,sci:24.1},{n:'机构媒体',play:42377,sci:12.5},{n:'普通个人',play:21081,sci:13.8},{n:'医疗康复',play:12225,sci:34.1}];
    var PMAX=700000, SMAX=45;
    function pY(v){return y0-(v/PMAX)*(y0-y1);}
    function sY(v){return y0-(v/SMAX)*(y0-y1);}
    [0,100000,200000,300000,400000,500000,600000,700000].forEach(function(v){
      var y=pY(v); if(v>0) g.appendChild(ln3(x0,y,x1,y,'cgrid'));
      g.appendChild(t3(x0-8,y+4,(v/10000)+'万','catick','end'));
    });
    [0,10,20,30,40].forEach(function(v){ g.appendChild(t3(x1+8,sY(v)+4,String(v),'satick','start')); });
    g.appendChild(ln3(x0,y0,x1,y0,'caxis'));
    g.appendChild(t3(x0-46,y1-16,'播放量','axt','start'));
    g.appendChild(t3(x1+46,y1-16,'科学分','axt','end'));
    var n=DATA.length, slot=(x1-x0)/n, bw=slot*0.46, pts=[];
    DATA.forEach(function(d,i){
      var cx=x0+slot*(i+0.5), by=pY(d.play), bh=Math.max(0,y0-by);
      var r=e3('rect'); r.setAttribute('x',(cx-bw/2).toFixed(1)); r.setAttribute('y',by.toFixed(1));
      r.setAttribute('width',bw.toFixed(1)); r.setAttribute('height',bh.toFixed(1)); r.setAttribute('rx',4); r.setAttribute('class','cbar');
      r.style.transitionDelay=(i*0.08).toFixed(2)+'s'; g.appendChild(r);
      g.appendChild(t3(cx,y0+22,d.n,'ccat','middle'));
      pts.push([cx,sY(d.sci),d.sci]);
    });
    var pl=e3('polyline'); pl.setAttribute('class','cline');
    pl.setAttribute('points',pts.map(function(p){return p[0].toFixed(1)+','+p[1].toFixed(1);}).join(' ')); g.appendChild(pl);
    pts.forEach(function(p,i){
      var c=e3('circle'); c.setAttribute('cx',p[0].toFixed(1)); c.setAttribute('cy',p[1].toFixed(1)); c.setAttribute('r',5); c.setAttribute('class','cdot');
      c.style.transitionDelay=(0.5+i*0.06).toFixed(2)+'s'; g.appendChild(c);
      g.appendChild(t3(p[0],p[1]-11,String(Math.round(p[2])),'cval','middle'));
    });
    var sw=e3('rect'); sw.setAttribute('x',184); sw.setAttribute('y',H-22); sw.setAttribute('width',16); sw.setAttribute('height',12); sw.setAttribute('rx',2); sw.setAttribute('fill','#c3bcae'); g.appendChild(sw);
    g.appendChild(t3(206,H-12,'B站中位播放量','leg','start'));
    g.appendChild(ln3(338,H-16,366,H-16,'cline'));
    var ld=e3('circle'); ld.setAttribute('cx',352); ld.setAttribute('cy',H-16); ld.setAttribute('r',4.5); ld.setAttribute('fill','var(--accent)'); g.appendChild(ld);
    g.appendChild(t3(372,H-12,'平均科学分','leg','start'));
    cb.appendChild(g);
  }
})();

(function(){
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{threshold:.22});
  document.querySelectorAll('.titlecard,.divider').forEach(function(el){io.observe(el);});
  /* 新增章节 #ch5 多方共谋 / #ch6 自查 无独立模块，reveal 统一挂到此全局观察器 */
  document.querySelectorAll('#ch5 .reveal,#ch6 .reveal').forEach(function(el){io.observe(el);});
  var SEGS=[{id:'ch0',n:'',name:'引入',desc:'',en:'Intro'},{id:'seg1',n:'01',name:'流量密码',desc:' · 标题如何制造点击',en:'THE ALGORITHM'},{id:'seg2',n:'02',name:'科学被压缩',desc:' · 被删掉的训练科学',en:'THE SCIENCE'},{id:'seg3',n:'03',name:'看不见的手',desc:' · 推荐算法的筛选',en:'THE INVISIBLE HAND'},{id:'seg4',n:'04',name:'多方共谋',desc:' · 风险扩散的合力',en:'THE COMPLICITY'}];
  var nodes=SEGS.map(function(s){return document.getElementById(s.id);});
  var gp=document.getElementById('gprog'),railNow=document.getElementById('railNow'),pager=document.getElementById('pager');
  var cur=-1,tick=false,full=0,offs=[];
  function measure(){ full=document.documentElement.scrollHeight-window.innerHeight; offs=nodes.map(function(nd){return nd?nd.offsetTop:Infinity;}); } // 缓存布局值，避免每帧强制重排
  function onScroll(){
    if(tick)return;tick=true;
    requestAnimationFrame(function(){
      tick=false;var H=window.innerHeight, y=window.scrollY;
      gp.style.width=(full>0?(y/full*100):0)+'%';
      var center=y+H*0.45, act=0;
      for(var i=0;i<offs.length;i++){ if(offs[i]<=center) act=i; }
      if(act!==cur){cur=act;railNow.innerHTML='<b>'+SEGS[act].n+'</b>'+SEGS[act].name+'<span class="nav-desc">'+SEGS[act].desc+'</span>';
        [].forEach.call(pager.querySelectorAll('button'),function(b,j){b.classList.toggle('active',j===act);});}
    });
  }
  pager.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;var nd=document.getElementById(b.dataset.seg);if(nd)window.scrollTo({top:Math.max(0,nd.offsetTop-36),behavior:'smooth'});});
  window.addEventListener('scroll',onScroll,{passive:true});
  window.addEventListener('resize',function(){measure();onScroll();});
  window.addEventListener('load',measure);
  measure();onScroll();
})();
