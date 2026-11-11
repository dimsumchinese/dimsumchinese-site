// 首頁和贊助頁共用：Ko-fi 連結、贊助提示、（贊助頁的）語言切換
(function () {
  // ▼ 把你的 Ko-fi 頁面網址貼在這裡，例如 'https://ko-fi.com/dimsumchinese'
  const KOFI_URL = 'https://ko-fi.com/dimsumchinese';
  // ▼ 用了網站多少分鐘後出現贊助提示；提示關閉後多少日內不再出現
  const NUDGE_MINUTES = 12;
  const NUDGE_QUIET_DAYS = 30;

  const isZh = () => document.documentElement.lang !== 'en';
  const store = {
    get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  const track = path => { try { window.goatcounter && goatcounter.count && goatcounter.count({ path, event: true }); } catch (e) {} };

  // ---- Ko-fi buttons
  document.querySelectorAll('[data-kofi]').forEach(a => {
    if (KOFI_URL) {
      a.href = KOFI_URL;
      a.addEventListener('click', () => { track('donate/ko-fi'); store.set('dsc_donated', Date.now()); });
    } else {
      a.hidden = true;
      const soon = a.parentNode.querySelector('.kofi-soon'); if (soon) soon.hidden = false;
    }
  });

  // ---- Language toggle on pages without app.js (support page)
  if (document.body.dataset.page) { // support / privacy / 404 pages
    let lang = store.get('lang') || 'zh';
    const btn = document.getElementById('langBtn');
    const apply = () => {
      document.documentElement.lang = lang === 'zh' ? 'zh-Hant-HK' : 'en';
      const b = document.body.dataset; if (b.titleZh) document.title = lang === 'zh' ? b.titleZh : b.titleEn;
      btn.innerHTML = `<span class="${lang === 'zh' ? 'on' : ''}">繁中</span><span class="${lang === 'en' ? 'on' : ''}">EN</span>`;
      btn.setAttribute('aria-label', lang === 'zh' ? 'Switch to English' : '切換至繁體中文');
      document.querySelectorAll('[data-zh]').forEach(el => { el.textContent = el.dataset[lang]; });
    };
    btn.addEventListener('click', () => { lang = lang === 'zh' ? 'en' : 'zh'; store.set('lang', lang); apply(); });
    apply();
    return; // no nudge on these pages
  }

  // ---- Gentle donation nudge after NUDGE_MINUTES of active use (counted only while the tab is visible).
  // Shown at most once every NUDGE_QUIET_DAYS days; never again soon after someone clicks donate.
  // Preview it immediately by adding ?nudge=1 to the address.
  const DAY = 864e5, TICK = 15e3;
  const preview = /[?&]nudge=1/.test(location.search);
  const recently = k => Date.now() - Number(store.get(k) || 0) < NUDGE_QUIET_DAYS * DAY;
  if (!preview && (recently('dsc_nudge_at') || recently('dsc_donated'))) return;

  let used = Number(store.get('dsc_active_ms') || 0);
  const timer = setInterval(() => {
    if (document.visibilityState !== 'visible') return;
    used += TICK; store.set('dsc_active_ms', used);
    if (used >= NUDGE_MINUTES * 60e3) { clearInterval(timer); show(); }
  }, TICK);
  if (preview) { clearInterval(timer); setTimeout(show, 500); }

  function show() {
    store.set('dsc_nudge_at', Date.now()); store.set('dsc_active_ms', 0);
    const box = document.createElement('aside');
    box.className = 'nudge'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-labelledby', 'nudgeTitle');
    const render = () => {
      const zh = isZh();
      box.innerHTML = `
        <button class="nudge-x" type="button" aria-label="${zh ? '關閉' : 'Close'}">×</button>
        <p class="nudge-title" id="nudgeTitle">☕ ${zh ? '謝謝你使用點心中文！' : 'Thanks for using DimSumChinese!'}</p>
        <p>${zh ? '本站免費開放。如果覺得有用，歡迎請我們飲杯奶茶，支持網站繼續運作。'
                : 'This site is free. If it has been useful, you can buy us a milk tea to help keep it running.'}</p>
        <div class="nudge-actions">
          <a class="nudge-go" href="support.html">${zh ? '支持一下' : 'Support us'}</a>
          <button class="nudge-later" type="button">${zh ? '下次先' : 'Maybe later'}</button>
        </div>`;
    };
    render();
    document.body.appendChild(box);
    track('nudge/shown');
    const close = () => { box.remove(); obs.disconnect(); };
    box.addEventListener('click', e => {
      if (e.target.closest('.nudge-go')) track('nudge/click');
      if (e.target.closest('.nudge-x, .nudge-later')) close();
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); }, { once: true });
    const obs = new MutationObserver(render);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  }
})();
