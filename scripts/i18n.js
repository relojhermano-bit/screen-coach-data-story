/* Local, dependency-free bilingual UI. No translation service or network calls. */
(function () {
  'use strict';
  var lang = document.documentElement.lang === 'en' ? 'en' : 'zh';
  var originals = new Map(), bound = new Map(), attributes = [];
  var words = {
    '引入':'Opening', '流量密码':'The formula for clicks', '科学被压缩':'Science gets cut',
    '看不见的手':'The invisible hand', '多方共谋':'Shared responsibility',
    ' · 标题如何制造点击':' · How titles attract clicks', ' · 被删掉的训练科学':' · What gets left out',
    ' · 推荐算法的筛选':' · How recommendations filter', ' · 风险扩散的合力':' · How risk spreads',
    '搜索':'Search', '减肥':'Weight loss', '示意':'Illustration',
    '分钟':'Minutes', '燃脂':'Burn fat', '新手':'Beginners', '每天':'Daily', '居家':'At home',
    '深蹲':'Squats', '瘦腿':'Slim legs', '暴汗':'Sweat', '站立':'Standing', '减脂':'Fat loss',
    '瘦肚子':'Belly fat', '快速':'Fast', '高效':'Efficient', '有效':'Effective', '友好':'Friendly',
    '塑形':'Toning', '见效':'Results', '一周':'One week', '热身':'Warm-up', '恢复':'Recovery',
    '训练强度':'Intensity', '循序渐进':'Gradual progress', '退阶':'Easier options',
    '风险提示':'Risk warnings', '禁忌人群':'Who should avoid it', '动作标准':'Technique',
    '频率':'How often?', '强度':'How hard?', '时间':'How long?', '方式':'What activity?',
    '总量':'How much?', '进阶':'How to progress?', '腰':'Lower back', '膝盖':'Knees', '颈':'Neck',
    '科学评分 →':'Science score →', '互动率 →':'Engagement rate →',
    '拟合近平 · r=0.034（不显著）':'Near-flat fit · r=0.034 (not significant)',
    '健身达人':'Influencers', '体科教练':'Coaches', '机构媒体':'Institutions',
    '普通个人':'Individuals', '医疗康复':'Medical / rehab', '播放量':'Views', '科学分':'Science score',
    'B站中位播放量':'Median views', '平均科学分':'Mean science score',
    '章节导航':'Chapter navigation',
    '数百条视频涌入眼前，个人被内容淹没':'A person overwhelmed by hundreds of fitness videos',
    '小刘跟练后受伤，坐在地上捂着腿':'Liu sits on the floor holding their injured leg after a workout',
    '小刘以为在自己挑视频，背后是算法这只看不见的手':'The invisible hand of an algorithm shapes Liu’s video choices',
    '小刘开练前对照清单逐条确认，比第一次从容':'Liu calmly checks each item before starting a workout',
    '人体受伤热力图':'Body map of pain-related mentions in on-screen comments',
    '跟练者沿传播链条逐层流失的漏斗图：进入100、开始64、坚持一周38、持续打卡21、分享13':'Illustrative attrition funnel: 100 potential participants, 64 start, 38 continue a week, 21 keep checking in, 13 share. Not measured retention.',
    '科学评分与互动率散点图':'Science score versus engagement rate: 865 Bilibili videos',
    '按博主资质：B站中位播放量(柱)与平均科学分(线)':'By creator credentials: median Bilibili views as bars and mean science scores as a line',
    '无意识的变瘦行为（30斤）':'Habits for losing weight without noticing (15 kg)',
    '一口气讲清如何<em>减肥</em>，深度对话上海六院减重专家韩晓东主任':'<em>Weight loss</em> explained: a conversation with specialist Han Xiaodong',
    '【3个月减35斤？】10个你必须知道的减脂技巧(新手必看)':'Lose 17.5 kg in 3 months? 10 fat-loss tips for beginners',
    '【偏口鱼博士】教你如何<em>减肥</em>，减肥不需要运动，肥胖的终极原因大揭秘':'Dr. Piankouyu on <em>weight loss</em>: “No exercise needed”—the causes of obesity',
    '【无广】<em>减肥</em>失败不是你的错！关于减肥你想了解的都在这':'No ads: failed <em>weight loss</em> is not your fault—your questions answered',
    '每天坚持12分钟全身HIIT运动（疯狂燃脂，快速瘦身）':'12-minute daily full-body HIIT: burn fat and slim down fast',
    '帕梅拉 30分钟经典燃脂三部曲｜暴汗内啡肽+最佳HIIT+站立腹':'Pamela’s 30-minute fat-burning trio: sweat, HIIT and standing abs',
    '【每天一遍】10分钟肚腩消减训练(男女通用)':'Once a day: a 10-minute belly-fat workout for everyone',
    '30分钟全程站立有氧燃脂操｜无跳跃 无深蹲 膝友好':'30-minute standing cardio: no jumping, no squats, knee-friendly',
    '【每天15分钟，坚持就能瘦】30分钟站立无跳跃暴汗燃脂操 · 零基础友好':'“15 minutes a day to slim down”: 30-minute standing cardio, no jumping, beginner-friendly',
    '3个月30斤【适合100斤-250斤】无跳跃 不伤膝 大体重友好运动':'Lose 15 kg in 3 months: low-impact exercise for people weighing 50–125 kg',
    '30天减肥挑战！运动vs节食vs医疗减肥法哪个最有效？':'30-day weight-loss challenge: exercise, dieting or medical treatment?',
    '大体重减肥9周跟练1.0｜必瘦10斤+｜200斤欢迎光临':'9-week workout for heavier beginners: “lose 5 kg+”—100 kg welcome',
    '30岁以后，减脂为什么突然变难了?!(如何提升代谢)':'Why does fat loss get harder after 30? How to boost metabolism',
    '这世界本就是这样':'Zhe Shijie Ben Jiu Shi Zheyang', '透近医学':'Toujin Medicine',
    '帅soserious':'Shuai Soserious', '科普知识干货分享':'Science Knowledge', '神奇菌汤锅':'Shenqi Juntangguo',
    '小波健身':'Xiaobo Fitness', '帕梅拉PamelaReif':'Pamela Reif', '周六野Zoey':'Zoey',
    '某健身博主':'An anonymized fitness creator', '健身小柯蚪':'Fitness Xiaokedou',
    '杰克小兔':'Jack Xiaotu', '叶的冒险':'Ye’s Adventures', '鹿麻雀':'Lu Maque', '见谁夸谁':'Jian Shui Kua Shui',
    '我想问一下，瘦得跟火柴人一样、手腕一夹就一圈的这种怎么增肥？每顿吃饱了吃撑了还是不胖…':'How do you gain weight when you are very thin? I eat until I am full but still do not gain…',
    '博主讲得很好，但对减肥人群最关键的一点就是别骗自己——别说自己吃得少、别说喝水都胖…':'Well explained, but the key to losing weight is being honest with yourself about how much you eat…'
  };
  function t(source) { return lang === 'en' && Object.hasOwn(words, source) ? words[source] : source; }
  function text(el, source) { bound.set(el, source); el.textContent = t(source); return el; }
  function count(source) {
    if (lang !== 'en' || !/^[\d.]+万$/.test(source)) return source;
    var n = parseFloat(source) * 10000;
    return n >= 1000000 ? +(n / 1000000).toFixed(3) + 'M' : +(n / 1000).toFixed(2) + 'K';
  }
  function pointTitle(d) {
    return lang === 'en'
      ? 'Science score ' + Math.round(d.s) + ' | Engagement ' + (d.e * 100).toFixed(1) + '%' + (d.t ? ' | Original title (Chinese): ' + d.t : '')
      : '科学分 ' + Math.round(d.s) + ' ｜ 互动率 ' + (d.e * 100).toFixed(1) + '%' + (d.t ? ' ｜ ' + d.t : '');
  }
  function apply() {
    document.documentElement.lang = lang === 'en' ? 'en' : 'zh-CN';
    originals.forEach(function (source, el) {
      el.innerHTML = lang === 'en' ? window.SCREEN_COACH_EN[el.dataset.i18n] : source;
    });
    bound.forEach(function (source, el) { el.textContent = t(source); });
    attributes.forEach(function (item) { item.el.setAttribute(item.attr, t(item.source)); });
    document.querySelectorAll('[data-lang]').forEach(function (button) {
      button.setAttribute('aria-pressed', String(button.dataset.lang === lang));
    });
    document.querySelectorAll('#scatter4 circle.dot title').forEach(function (el, i) { el.textContent = pointTitle(window.SCATTER_R1[i]); });
    document.querySelectorAll('#combo4 .catick').forEach(function (el) {
      var n = Number(el.dataset.value);
      el.textContent = lang === 'en' ? (n ? n / 1000 + 'K' : '0') : n / 10000 + '万';
    });
    var mobileFunnel = document.querySelector('.funnel-mobile');
    if (mobileFunnel) {
      var labels = document.querySelectorAll('.fn-labels .t'), details = document.querySelectorAll('.fn-labels .s');
      mobileFunnel.querySelectorAll('.funnel-mobile-row').forEach(function (row, i) {
        row.querySelector('.funnel-label-text').textContent = labels[i].textContent;
        row.querySelector('.funnel-detail').textContent = details[i].textContent;
      });
    }
    var metadata = [
      ['title', 'Are we following science or the clicks? — Inside the screen coach of 120 million people'],
      ['meta[name="description"]', 'A data story about fitness videos, science and clicks, based on 1,477 videos, 572,000 on-screen comment lines and 2,794 top comments.'],
      ['meta[property="og:title"]', 'Are we following science or the clicks?'],
      ['meta[property="og:description"]', 'Inside the screen coach of 120 million people: a data story about fitness videos, scientific quality and the logic of clicks.'],
      ['meta[property="og:locale"]', 'en_US']
    ];
    metadata.forEach(function (m) {
      var el = document.querySelector(m[0]), attr = el.tagName === 'TITLE' ? null : 'content';
      if (!el.dataset.zh) el.dataset.zh = attr ? el.getAttribute(attr) : el.textContent;
      var value = lang === 'en' ? m[1] : el.dataset.zh;
      if (attr) el.setAttribute(attr, value); else el.textContent = value;
    });
  }
  function setLanguage(next) {
    if (!['zh', 'en'].includes(next) || next === lang) return;
    var anchor = null, distance = Infinity;
    document.querySelectorAll('.s1-step,.titlecard,.divider,.prose,.lede,.step-body,.chart,.method,.check').forEach(function (el) {
      var rect = el.getBoundingClientRect(), d = Math.abs(rect.top - 80);
      if (rect.bottom > 80 && d < distance) { anchor = el; distance = d; }
    });
    var before = anchor ? anchor.getBoundingClientRect().top : 0;
    lang = next;
    try { localStorage.setItem('screen-coach-language', lang); } catch (e) { /* Private browsing still works. */ }
    try {
      var url = new URL(location.href); url.searchParams.set('lang', lang);
      history.replaceState(history.state, '', url);
    } catch (e) { /* file:// previews may not allow history updates. */ }
    apply();
    window.dispatchEvent(new CustomEvent('languagechange'));
    requestAnimationFrame(function () {
      if (anchor) window.scrollBy(0, anchor.getBoundingClientRect().top - before);
      window.dispatchEvent(new Event('resize'));
    });
  }
  function init() {
    var mobileFunnel = document.createElement('div'); mobileFunnel.className = 'funnel-mobile';
    [100,64,38,21,13].forEach(function(n){
      var row=document.createElement('div');row.className='funnel-mobile-row';
      row.style.setProperty('--width',n+'%');
      row.innerHTML='<span class="funnel-value">'+n+'</span><span class="funnel-label"><span class="funnel-label-text"></span><span class="funnel-detail"></span></span><span class="funnel-bar" aria-hidden="true"></span>';
      mobileFunnel.appendChild(row);
    });
    document.querySelector('.funnel-svg').after(mobileFunnel);
    document.querySelectorAll('#scatter4,#combo4').forEach(function(el){el.classList.add('chart-scroll');el.setAttribute('tabindex','0');el.setAttribute('role','region');});
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      if (!Object.hasOwn(window.SCREEN_COACH_EN, el.dataset.i18n)) throw new Error('Missing translation: ' + el.dataset.i18n);
      originals.set(el, el.innerHTML);
    });
    document.querySelectorAll('[alt],[aria-label]').forEach(function (el) {
      ['alt', 'aria-label'].forEach(function (attr) {
        if (el.hasAttribute(attr)) attributes.push({el:el, attr:attr, source:el.getAttribute(attr)});
      });
    });
    document.querySelectorAll('[data-lang]').forEach(function (button) {
      button.addEventListener('click', function () { setLanguage(button.dataset.lang); });
    });
    document.querySelectorAll('#checklist li').forEach(function (el) {
      function toggle() {
        var checked = el.getAttribute('aria-checked') !== 'true';
        el.setAttribute('aria-checked', String(checked)); el.dataset.checked = String(checked);
      }
      el.addEventListener('click', toggle);
      el.addEventListener('keydown', function (event) {
        if (event.key === ' ' || event.key === 'Enter') { event.preventDefault(); toggle(); }
      });
    });
    apply();
    window.dispatchEvent(new CustomEvent('languagechange'));
    window.dispatchEvent(new Event('resize'));
  }
  window.ScreenCoachI18n = {t:t, text:text, count:count, pointTitle:pointTitle, init:init, setLanguage:setLanguage, get language(){return lang;}};
})();
