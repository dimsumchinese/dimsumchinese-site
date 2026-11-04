// DimSumChinese 點心中文 — resource search.
// Data lives in resources.csv (edit in Excel / Google Sheets / GitHub).
// Filter columns (age, difficulty, skill, topic, format) can hold several values separated by ";".
// The "tags" column holds your own extra search keywords, separated by spaces.
(function () {
  // First visit: follow the browser language (Chinese → 繁中, anything else → English). Afterwards remember the choice.
  let lang = /^zh/i.test(navigator.language || '') ? 'zh' : 'en';
  try { lang = localStorage.getItem('lang') || lang; } catch (e) {}

  const GROUPS = [
    { key: 'age',        zh: '年齡', en: 'Age',
      order: ['幼兒 0-5', '兒童 6-12', '青少年及成人 13+', '15+ 建議 15 歲以上 Ages 15+', '家長老師 Parents & teachers'] },
    { key: 'difficulty', zh: '程度', en: 'Difficulty',
      order: ['入門 Beginner', '中級 Intermediate', '進階 Advanced'] },
    { key: 'skill',      zh: '技能', en: 'Skill',
      order: ['聆聽 Listening', '觀看 Watching', '說話 Speaking', '閱讀 Reading', '書寫 Writing', '打字 Typing'] },
    { key: 'topic',      zh: '主題', en: 'Topic', sidebar: true,   // shown as the left category list
      order: ['兒歌音樂 Songs & music', '故事 Stories', '卡通 Cartoons', '節日 Festivals', '認字詞彙 Reading & vocabulary',
              '寫字打字 Writing & typing', '粵拼 Jyutping', '聲調發音 Pronunciation', '日常口語 Speaking', '語法 Grammar',
              '詩詞成語謎語 Poems & idioms', '生活 Daily life', '歷史文化 History & culture', '課程 Courses',
              '字典工具 Dictionaries & tools', '教學參考 For teachers', '綜合 General'] },
    { key: 'format',     zh: '形式', en: 'Format' }
  ];
  // Display names for filter values whose English part can't be read straight from the value
  const LABEL_OVERRIDE = {
    '幼兒 0-5': { zh: '幼兒 0-5', en: 'Toddlers 0-5' },
    '兒童 6-12': { zh: '兒童 6-12', en: 'Kids 6-12' },
    '青少年及成人 13+': { zh: '青少年及成人 13+', en: 'Teens & adults 13+' },
    'YouTube 頻道 Channel': { zh: 'YouTube 頻道', en: 'YouTube channel' },
    '日常口語 Speaking': { zh: '日常口語', en: 'Everyday speech' }
  };
  // Show "中文 English" values in the current language only
  function label(v) {
    if (LABEL_OVERRIDE[v]) return LABEL_OVERRIDE[v][lang];
    const m = v.match(/^(.*[\u3400-\u9fff\uff00-\uffef].*?)\s+([A-Za-z].*)$/);
    return m ? (lang === 'zh' ? m[1] : m[2]) : v;
  }
  // Extra search keywords added automatically for each filter value (so people can search synonyms in either language)
  const VALUE_KW = {
      "幼兒 0-5": "toddler toddlers preschool preschooler baby babies little ones 幼稚園 BB",
      "兒童 6-12": "kid kids child children primary school 小學 小朋友",
      "青少年及成人 13+": "teen teens teenager teenagers adult adults grown-up 中學 大人",
      "家長老師 Parents & teachers": "parent parents parenting teacher teachers educator 家長 老師 教師",
      "入門 Beginner": "beginner beginners basic basics easy starter absolute 初學 簡單 基礎",
      "中級 Intermediate": "intermediate medium 中等",
      "進階 Advanced": "advanced fluent native difficult hard 高級 深",
      "聆聽 Listening": "listen listening audio 聽",
      "觀看 Watching": "watch watching video videos 看 睇",
      "說話 Speaking": "speak speaking talk conversation say 講 說",
      "閱讀 Reading": "read reading 讀 睇書",
      "書寫 Writing": "write writing handwriting 寫",
      "打字 Typing": "type typing keyboard input 打字 輸入",
      "影片 Video": "video videos 片 影片",
      "YouTube 頻道 Channel": "youtube channel youtuber",
      "網站 Website": "website site web online 網站 網頁",
      "練習紙 Printable": "printable worksheet worksheets pdf print 工作紙",
      "遊戲 Game": "game games play quiz 遊戲 玩",
      "Podcast": "podcast audio radio 電台",
      "App 及工具 Apps & tools": "app apps tool tools software 軟件 程式",
      "電子書 E-book": "ebook e-book book books picture book 書 圖書",
      "社群 Community": "community group facebook forum 群組",
      "文章 Article": "article blog post 文章",
      "兒歌音樂 Songs & music": "兒歌 唱歌 歌曲 童謠 音樂 廣東歌 song songs music nursery rhyme sing",
      "故事 Stories": "故事 講故事 繪本 睡前故事 童話 story stories storytelling bedtime picture book",
      "粵拼 Jyutping": "粵拼 拼音 羅馬拼音 jyutping romanization romanisation pinyin",
      "聲調發音 Pronunciation": "聲調 發音 九聲六調 懶音 tones tone pronunciation accent",
      "認字詞彙 Reading & vocabulary": "認字 識字 詞彙 生字 閱讀 reading vocabulary characters words",
      "寫字打字 Writing & typing": "寫字 筆順 筆畫 打字 輸入法 倉頡 速成 handwriting stroke order typing input",
      "日常口語 Speaking": "口語 會話 對話 日常 speaking conversation phrases everyday",
      "詩詞成語謎語 Poems & idioms": "唐詩 古詩 成語 謎語 詩詞 poem poems poetry idiom idioms riddle riddles",
      "語法 Grammar": "語法 文法 助詞 grammar particles",
      "歷史文化 History & culture": "歷史 文化 香港 history culture hong kong",
      "生活 Daily life": "生活 飲食 點心 交通 food dim sum transport daily life",
      "節日 Festivals": "節日 聖誕 新年 復活節 festival christmas chinese new year easter",
      "卡通 Cartoons": "卡通 動畫 cartoon animation anime",
      "教學參考 For teachers": "教學 教案 教師 家長 teaching teacher parent lesson plan",
      "字典工具 Dictionaries & tools": "字典 詞典 工具 dictionary tool",
      "課程 Courses": "課程 course courses lesson lessons class"
  };
  const ADULT = '15+ 建議 15 歲以上 Ages 15+';
  const T = {
    zh: { count: n => `共 ${n} 項資源`, empty: '找不到相關資源，試試其他關鍵字或篩選。', by: '來源：',
          more: n => `查看全部 ${n} 項結果`, none: '沒有結果', clear: '清除全部', all: '全部資源', items: n => `${n} 項` },
    en: { count: n => `${n} resource${n === 1 ? '' : 's'}`, empty: 'No matches — try another keyword or filter.', by: 'By ',
          more: n => `See all ${n} results`, none: 'No results', clear: 'Clear all', all: 'All resources', items: n => `${n}` }
  };

  const $ = id => document.getElementById(id);
  let data = [], openGroup = '', filters = {}; // filters = { groupKey: value }

  function parseCSV(text) {
    const rows = []; let row = [], cell = '', q = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (q) {
        if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
        else if (c === '"') q = false;
        else cell += c;
      } else if (c === '"') q = true;
      else if (c === ',') { row.push(cell); cell = ''; }
      else if (c === '\n' || c === '\r') {
        if (c === '\r' && text[i + 1] === '\n') i++;
        row.push(cell); rows.push(row); row = []; cell = '';
      } else cell += c;
    }
    if (cell || row.length) { row.push(cell); rows.push(row); }
    const head = rows.shift().map(h => h.trim().replace(/^﻿/, ''));
    return rows.filter(r => r.some(v => v.trim()))
      .map(r => Object.fromEntries(head.map((h, i) => [h, (r[i] || '').trim()])));
  }

  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const safeUrl = u => /^https?:\/\//i.test(u) ? u : '#';
  // Accepts ";" (hand-edited CSV) or "," (Notion CSV export) between values
  const split = v => (v || '').split(/[;,]/).map(s => s.trim()).filter(Boolean);
  const pick = (d, k) => (lang === 'zh' ? d[k + '_zh'] : d[k + '_en']) || d[k + '_zh'] || d[k + '_en'] || '';
  const other = (d, k) => { const o = lang === 'zh' ? d[k + '_en'] : d[k + '_zh']; return o && o !== pick(d, k) ? o : ''; };

  function imageFor(d) {
    if (d.image) return d.image;
    const m = d.url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
    return m ? `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg` : 'images/card-placeholder.jpg';
  }

  // ---- matching
  const words = () => $('q').value.toLowerCase().split(/\s+/).filter(Boolean);
  const isAdult = d => d.age.includes(ADULT);
  function matches(d, ws, ignore) {
    if (ignore !== 'age' && isAdult(d) && !$('adultChk').checked && filters.age !== ADULT) return false;
    for (const g of GROUPS) {
      if (g.key === ignore) continue;
      if (filters[g.key] && !d[g.key].includes(filters[g.key])) return false;
    }
    return ws.every(w => d._text.includes(w));
  }
  // ---- relevance: title > creator > tags > description > category labels (ties keep the list order)
  function score(d, ws) {
    const q = ws.join(' ');
    let s = 0;
    for (const t of [d._tz, d._te]) {
      if (!t) continue;
      if (t === q) s += 200; else if (t.startsWith(q)) s += 120; else if (t.includes(q)) s += 80;
    }
    for (const w of ws) {
      if (d._tz.includes(w) || d._te.includes(w)) {
        // English words: prefer a whole-word start ("story" ranks Story Corner above History)
        const ascii = /^[\x00-\x7f]+$/.test(w);
        const re = ascii && new RegExp('(^|[^a-z0-9])' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
        s += !ascii || re.test(d._tz) || re.test(d._te) ? 40 : 25;
      }
      else if (d._cr.includes(w)) s += 20;
      else if (d._tg.includes(w)) s += 15;
      else if (d._ds.includes(w)) s += 10;
      else s += 3; // matched only through topic / format / synonyms
    }
    return s;
  }

  // ---- UI
  function applyLang() {
    document.documentElement.lang = lang === 'zh' ? 'zh-Hant-HK' : 'en';
    document.title = lang === 'zh' ? 'DimSumChinese 點心中文 · 粵語學習資源庫' : 'DimSumChinese 點心中文 · Cantonese Learning Resources';
    $('langBtn').innerHTML = `<span class="${lang === 'zh' ? 'on' : ''}">繁中</span><span class="${lang === 'en' ? 'on' : ''}">EN</span>`;
    $('langBtn').setAttribute('aria-label', lang === 'zh' ? 'Switch to English' : '切換至繁體中文');
    document.querySelectorAll('[data-zh]').forEach(el => { el.textContent = el.dataset[lang]; });
    document.querySelectorAll('[data-zh-ph]').forEach(el => { el.placeholder = el.dataset[lang + 'Ph']; });
    refresh();
  }

  function renderFilters() {
    const any = Object.keys(filters).length > 0;
    $('allBtn').classList.toggle('on', !any && !openGroup);
    $('groups').innerHTML = GROUPS.filter(g => !g.sidebar).map(g =>
      `<button class="fbtn ${openGroup === g.key ? 'open' : ''} ${filters[g.key] ? 'on' : ''}" type="button" data-group="${g.key}" aria-expanded="${openGroup === g.key}">${g[lang]}${filters[g.key] ? ' ✓' : ''}</button>`).join('');

    if (openGroup) {
      const g = GROUPS.find(x => x.key === openGroup);
      const ws = words();
      let values = [...new Set(data.flatMap(d => d[g.key]))];
      if (g.order) values.sort((a, b) => (g.order.indexOf(a) + 1 || 99) - (g.order.indexOf(b) + 1 || 99));
      else values.sort();
      if (g.key === 'age' || $('adultChk').checked) {} else values = values.filter(v => v !== ADULT);
      $('opts').innerHTML = values.map(v => {
        const n = data.filter(d => d[g.key].includes(v) && matches(d, ws, g.key)).length;
        return `<button class="opt ${filters[g.key] === v ? 'on' : ''}" type="button" data-key="${g.key}" data-value="${esc(v)}" ${n ? '' : 'disabled'}>${esc(label(v))} <small>${n}</small></button>`;
      }).join('');
    } else $('opts').innerHTML = '';

    renderSidebar();
    const chips = GROUPS.filter(g => filters[g.key] && !g.sidebar).map(g =>
      `<button class="chip-x" type="button" data-key="${g.key}" data-value="${esc(filters[g.key])}">${g[lang]}${lang === 'zh' ? '：' : ': '}${esc(label(filters[g.key]))} ×</button>`);
    $('active').innerHTML = chips.length ? chips.join('') + `<button class="clear" type="button" id="clearAll">${T[lang].clear}</button>` : '';
  }

  // ---- left category list (like a game portal's side bar)
  const sortBy = (vals, order) => vals.sort((a, b) => ((order.indexOf(a) + 1) || 999) - ((order.indexOf(b) + 1) || 999) || a.localeCompare(b));
  function renderSidebar() {
    const g = GROUPS.find(x => x.sidebar), ws = words(), cur = filters[g.key] || '';
    const pool = data.filter(d => matches(d, ws, g.key));
    const values = sortBy([...new Set(data.flatMap(d => d[g.key]))], g.order);
    const item = (v, text, n) => `<button type="button" class="cat ${cur === v ? 'on' : ''}" data-cat="${esc(v)}" ${cur === v ? 'aria-current="true"' : ''}>
        <span>${esc(text)}</span><small>${n}</small></button>`;
    $('sidebar').innerHTML = item('', T[lang].all, pool.length) +
      values.map(v => item(v, label(v), pool.filter(d => d[g.key].includes(v)).length)).join('');
  }

  function card(d) {
    const title = pick(d, 'title'), desc = pick(d, 'desc'), note = pick(d, 'note');
    const url = esc(safeUrl(d.url));
    const tags = ['age', 'difficulty', 'skill', 'topic', 'format'].flatMap(k => d[k].map(v =>
      `<button class="tag ${v === ADULT ? 'tag-adult' : ''}" type="button" data-key="${k}" data-value="${esc(v)}">${esc(label(v))}</button>`)).join('');
    const sub = other(d, 'title');
    return `<article class="card">
      <h2><a href="${url}" target="_blank" rel="noopener">${esc(title)}</a></h2>
      ${sub ? `<p class="subtitle">${esc(sub)}</p>` : ''}
      <a class="thumb ${d.image && d.format.some(f => /Channel/.test(f)) ? 'avatar' : ''}" href="${url}" target="_blank" rel="noopener" tabindex="-1">
        <img src="${esc(imageFor(d))}" alt="" loading="lazy" onerror="this.onerror=null;this.src='images/card-placeholder.jpg'"></a>
      ${note ? `<p class="note">⚠ ${esc(note)}</p>` : ''}
      ${desc ? `<p class="desc">${esc(desc)}</p>` : ''}
      ${d.creator ? `<p class="creator">${T[lang].by}${esc(d.creator)}</p>` : ''}
      <div class="tags">${tags}</div>
    </article>`;
  }

  function render() {
    const ws = words();
    let hits = data.filter(d => matches(d, ws));
    if (ws.length) hits = hits.map((d, i) => [score(d, ws), i, d]).sort((a, b) => b[0] - a[0] || a[1] - b[1]).map(x => x[2]);
    $('count').textContent = T[lang].count(hits.length);
    $('listTitle').textContent = filters.topic ? label(filters.topic) : T[lang].all;
    $('listCount').textContent = T[lang].items(hits.length);
    $('list').innerHTML = hits.length ? hits.map(card).join('') : `<p class="empty">${T[lang].empty}</p>`;
    return hits;
  }

  // ---- search suggestions under the top-right search bar
  let sel = -1;
  function suggest(hits) {
    const box = $('suggest');
    if (!words().length || document.activeElement !== $('q')) { box.hidden = true; $('q').setAttribute('aria-expanded', 'false'); return; }
    sel = -1;
    const top = hits.slice(0, 8);
    box.innerHTML = (top.length ? top.map((d, i) =>
      `<a class="sg" role="option" id="sg${i}" href="${esc(safeUrl(d.url))}" target="_blank" rel="noopener">
         <span class="sg-t">${esc(pick(d, 'title'))}</span>
         <span class="sg-m">${esc([d.format[0] && label(d.format[0]), d.creator].filter(Boolean).join(' · '))}</span></a>`).join('')
      : `<p class="sg-none">${T[lang].none}</p>`) +
      (hits.length > top.length ? `<button class="sg-more" type="button" id="sgMore">${T[lang].more(hits.length)}</button>` : '');
    box.hidden = false; $('q').setAttribute('aria-expanded', 'true');
  }

  function refresh() { renderFilters(); suggest(render()); }
  function setFilter(key, value) {
    if (filters[key] === value) delete filters[key]; else filters[key] = value;
    refresh();
  }
  const toResults = () => { $('suggest').hidden = true; document.querySelector('.filter-box').scrollIntoView({ behavior: 'smooth' }); };

  $('q').addEventListener('input', refresh);
  $('q').addEventListener('focus', () => suggest(render()));
  $('q').addEventListener('keydown', e => {
    const items = [...$('suggest').querySelectorAll('.sg')];
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault(); if (!items.length) return;
      sel = (sel + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
      items.forEach((a, i) => a.classList.toggle('sel', i === sel));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (sel >= 0 && items[sel]) items[sel].click(); else toResults();
    } else if (e.key === 'Escape') $('suggest').hidden = true;
  });
  document.addEventListener('click', e => {
    if (e.target.id === 'sgMore') return toResults();
    if (!e.target.closest('.search-wrap')) $('suggest').hidden = true;
  });
  $('allBtn').addEventListener('click', () => { filters = {}; openGroup = ''; $('q').value = ''; refresh(); });
  $('groups').addEventListener('click', e => {
    const b = e.target.closest('[data-group]'); if (!b) return;
    openGroup = openGroup === b.dataset.group ? '' : b.dataset.group; renderFilters();
  });
  $('sidebar').addEventListener('click', e => {
    const b = e.target.closest('.cat'); if (!b) return;
    if (b.dataset.cat) filters.topic = b.dataset.cat; else delete filters.topic;
    refresh();
    if (window.innerWidth > 860) document.querySelector('.content').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  $('opts').addEventListener('click', e => { const b = e.target.closest('.opt'); if (b) setFilter(b.dataset.key, b.dataset.value); });
  $('active').addEventListener('click', e => {
    if (e.target.id === 'clearAll') { filters = {}; return refresh(); }
    const b = e.target.closest('.chip-x'); if (b) setFilter(b.dataset.key, b.dataset.value);
  });
  $('list').addEventListener('click', e => {
    const b = e.target.closest('.tag'); if (!b) return;
    filters[b.dataset.key] = b.dataset.value; openGroup = b.dataset.key; refresh(); toResults();
  });
  $('adultChk').addEventListener('change', refresh);

  // ---- GoatCounter 統計：搜尋字、點擊資源、分類（本機 file:// 不會記錄）
  const track = (path, title) => {
    try { if (window.goatcounter && goatcounter.count) goatcounter.count({ path, title, event: true }); } catch (e) {}
  };
  let lastQ = '', qTimer;
  const logSearch = () => {
    const q = $('q').value.trim().toLowerCase().slice(0, 60);
    if (q.length < 2 || q === lastQ) return;
    lastQ = q;
    const n = data.filter(d => matches(d, words())).length;
    track((n ? 'search/' : 'search-none/') + q, n ? '搜尋 Search' : '搜尋沒有結果 No results');
  };
  $('q').addEventListener('input', () => { clearTimeout(qTimer); qTimer = setTimeout(logSearch, 2000); });
  $('q').addEventListener('keydown', e => { if (e.key === 'Enter') logSearch(); });
  document.addEventListener('click', e => {
    const a = e.target.closest('#list a[href], #suggest a[href]'); if (!a) return;
    const href = a.getAttribute('href');
    const d = data.find(r => safeUrl(r.url) === href);
    if ($('q').value.trim()) logSearch();
    track('click/' + (d ? d.title_zh : href), '點擊資源 Click');
  });
  $('sidebar').addEventListener('click', e => {
    const b = e.target.closest('.cat'); if (b && b.dataset.cat) track('category/' + b.dataset.cat, '分類 Category');
  });

  $('langBtn').addEventListener('click', () => {
    lang = lang === 'zh' ? 'en' : 'zh';
    try { localStorage.setItem('lang', lang); } catch (e) {}
    applyLang();
  });

  function load(text) {
    data = parseCSV(text).map(d => {
      GROUPS.forEach(g => { d[g.key] = split(d[g.key]); });
      d.title_zh = d.title_zh || d['\uFEFFtitle_zh'] || '';
      const lc = v => (v || '').toLowerCase();
      d._tz = lc(d.title_zh); d._te = lc(d.title_en); d._cr = lc(d.creator); d._tg = lc(d.tags);
      d._ds = lc(d.desc_zh) + ' ' + lc(d.desc_en);
      d._text = [d.title_zh, d.title_en, d.creator, d.desc_zh, d.desc_en, d.tags, d.url,
        ...GROUPS.flatMap(g => d[g.key]), ...GROUPS.flatMap(g => d[g.key].map(v => (VALUE_KW[v] || '') + ' ' + (LABEL_OVERRIDE[v] ? LABEL_OVERRIDE[v].en : '')))].join(' ').toLowerCase();
      return d;
    });
    applyLang();
  }
  // Online: read resources.csv. Opened from your computer (file://): fall back to data.js.
  function fallback() {
    const s = document.createElement('script'); s.src = 'data.js';
    s.onload = () => load(window.RESOURCES_CSV);
    s.onerror = () => { $('list').innerHTML = '<p class="empty">resources.csv 載入失敗 / failed to load.</p>'; };
    document.body.appendChild(s);
  }
  if (location.protocol === 'file:') fallback();
  else fetch('resources.csv', { cache: 'no-cache' }).then(r => { if (!r.ok) throw 0; return r.text(); }).then(load).catch(fallback);
})();

// ---- Contact form (Web3Forms)
(function () {
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  if (!form) return;
  const M = {
    zh: { sending: '傳送中…', ok: '已收到你的訊息，謝謝！我們會盡快回覆。', invalid: '請填寫名字、有效的電郵和訊息。',
          fail: '傳送失敗，請稍後再試，或直接電郵 dimsumchineseinfo@gmail.com。', nokey: '表格尚未設定（缺少 access key）。請直接電郵 dimsumchineseinfo@gmail.com。' },
    en: { sending: 'Sending…', ok: 'Thanks! Your message has been received.', invalid: 'Please enter your name, a valid email and a message.',
          fail: 'Sending failed. Please try again later or email dimsumchineseinfo@gmail.com.', nokey: 'The form is not set up yet (missing access key). Please email dimsumchineseinfo@gmail.com.' }
  };
  const t = k => M[document.documentElement.lang === 'en' ? 'en' : 'zh'][k];
  const show = (k, cls) => { status.textContent = t(k); status.className = 'form-status ' + (cls || ''); };

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!form.checkValidity()) { show('invalid', 'err'); return; }
    if (form.access_key.value.startsWith('YOUR_')) { show('nokey', 'err'); return; }
    if (form.botcheck.checked) return; // spam bot
    const btn = form.querySelector('.send'); btn.disabled = true; show('sending');
    try {
      const fd = new FormData(form);
      // Opt-in to the mailing list: mark the email subject so it is easy to filter in Gmail
      if (/Yes/.test(fd.get('mailing_list') || '')) fd.set('subject', form.subject.value + '【加入通訊名單】');
      const res = await fetch(form.action, { method: 'POST', headers: { Accept: 'application/json' }, body: fd });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      form.reset(); show('ok', 'ok');
    } catch (err) {
      show('fail', 'err');
    } finally { btn.disabled = false; }
  });
})();

// ---- "Back to top" button: appears after scrolling down
(function () {
  const btn = document.getElementById('toTop');
  if (!btn) return;
  const onScroll = () => { btn.hidden = window.scrollY < 600; };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  btn.addEventListener('click', () => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  });
  // keep the tooltip in the current language
  new MutationObserver(() => {
    btn.title = document.documentElement.lang === 'en' ? btn.dataset.enTitle : btn.dataset.zhTitle;
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
})();
