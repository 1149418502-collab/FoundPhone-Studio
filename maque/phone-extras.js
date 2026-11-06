/* Optional phone details. Existing story, invitations and affection rules stay in their own modules. */
(() => {
  'use strict';
  const KEY = 'maque_phone_details_v1';
  const food = [
    ['fries', '汉堡。还有薯条，别漏了。'],
    ['fish', '鲫鱼饼买五个：四个红豆，一个奶油。'],
    ['shake', '草莓奶昔。下次点两根吸管。']
  ];
  const wallpapers = [
    { id: 'original', title: '原来的壁纸', src: null },
    { id: 'stands', title: '看台上的我们', src: './assets/date-baseball-couple-1.jpg' },
    { id: 'camera', title: '镜头停下来的时候', src: './assets/date-baseball-couple-2.jpg' }
  ];
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (_) {}
  const state = {
    checked: Array.isArray(saved.checked) ? saved.checked.filter(id => food.some(([key]) => key === id)) : [],
    wallpaper: wallpapers.some(item => item.id === saved.wallpaper) ? saved.wallpaper : 'original',
    calm: saved.calm === true
  };
  const originalWalls = ['lock', 'home'].map(id => [document.getElementById(id), document.getElementById(id).style.backgroundImage]);
  const persist = () => { try { localStorage.setItem(KEY, JSON.stringify({ version: 1, ...state })); } catch (_) {} };
  const el = (tag, text, cls, parent) => {
    const item = document.createElement(tag);
    if (text != null) item.textContent = text;
    if (cls) item.className = cls;
    parent?.append(item); return item;
  };
  function button(parent, text, action, cls = 'phone-detail-button') {
    const item = el('button', text, cls, parent); item.type = 'button'; item.onclick = action; return item;
  }
  function screen(id, title) {
    const item = el('section', null, 'view phone-details', document.querySelector('.phone'));
    item.id = id; item.setAttribute('aria-label', title); ids.push(id); return item;
  }
  const notes = screen('phoneNotes', '备忘录 App');
  const settings = screen('phoneSettings', '手机设置');
  function heading(parent, title, back = goHome) {
    const bar = el('header', null, 'phone-details-header', parent);
    button(bar, '‹', back, 'phone-detail-back').setAttribute('aria-label', '返回');
    el('b', title, '', bar);
  }
  function openNotes() {
    notes.replaceChildren(); heading(notes, '备忘录');
    const body = el('div', null, 'phone-details-body', notes);
    const now = new Date();
    el('p', `${now.getMonth() + 1} 月 ${now.getDate()} 日 · 我的手机`, 'phone-detail-caption', body);
    el('h1', '留给下次的事', '', body);
    const search = el('input', null, 'phone-note-search', body);
    search.type = 'search'; search.placeholder = '搜索备忘录'; search.setAttribute('aria-label', '搜索备忘录');
    const list = el('div', null, 'phone-note-list', body);
    const render = () => {
      list.replaceChildren(); const query = search.value.trim();
      const entries = [{ id: 'food', title: '下次别忘了', detail: '汉堡、薯条，还有……' }];
      if (completedDates.has('baseball')) entries.push({ id: 'ticket', title: '球票夹在这里', detail: '两张照片。一张也舍不得删。' });
      if (affection >= 60 && query === '01') entries.push({ id: 'draft', title: '01 · 未发送', detail: '恢复的草稿' });
      for (const item of entries.filter(item => !query || (item.title + item.detail).includes(query))) {
        const row = button(list, '', item.open || (() => openNote(item.id)), 'phone-note-row'); row.dataset.note = item.id;
        el('strong', item.title, '', row); el('span', item.detail, '', row);
      }
      if (!list.children.length) el('p', '没有找到这条备忘录。', 'phone-note-empty', list);
      if (affection >= 60 && !query) el('small', '本机恢复项目 · 01', 'phone-note-index', list);
    };
    search.addEventListener('input', render); render(); view('phoneNotes');
  }
  function openNote(id) {
    notes.replaceChildren(); heading(notes, '备忘录', openNotes);
    const body = el('article', null, 'phone-details-body phone-note-paper', notes);
    if (id === 'food') {
      el('small', '我先记下来，免得到店里又忘了。', 'phone-detail-caption', body);
      el('h1', '下次别忘了', '', body);
      for (const [key, copy] of food) {
        const label = el('label', null, 'phone-note-check', body);
        const input = el('input', null, '', label); input.type = 'checkbox'; input.checked = state.checked.includes(key);
        el('span', copy, '', label);
        input.onchange = () => { state.checked = input.checked ? [...new Set([...state.checked, key])] : state.checked.filter(id => id !== key); persist(); };
      }
      el('p', '吃完以后，走一会儿再回去。', 'phone-note-handwriting', body);
    } else if (id === 'ticket' && completedDates.has('baseball')) {
      el('small', '我和成灿 · 棒球场', 'phone-detail-caption', body); el('h1', '球票夹在这里', '', body);
      el('p', '本来只是想看一场比赛。', 'phone-note-handwriting', body);
      for (const photo of wallpapers.slice(1)) { const image = el('img', null, 'phone-note-photo', body); image.src = photo.src; image.alt = photo.title; }
      button(body, '把这一刻设成壁纸', openSettings);
    } else if (id === 'draft' && affection >= 60) {
      el('small', '01 · 未发送', 'phone-note-index', body); el('h1', '还没按下发送', '', body);
      el('p', '回来的时候，叫我一声就好。\n\n我怕等得太久，会忘记自己在等谁。', 'phone-note-handwriting phone-note-draft', body);
      el('small', '附件缺失 · 原稿只读', 'phone-detail-caption', body);
    }
    view('phoneNotes');
  }
  function applyAppearance() {
    const selected = wallpapers.find(item => item.id === state.wallpaper);
    for (const [target, original] of originalWalls) {
      target.style.backgroundImage = selected?.src && completedDates.has('baseball') ? `linear-gradient(#0003,#0007),url("${selected.src}")` : original;
    }
    document.body.classList.toggle('phone-calm-motion', state.calm);
  }
  function openSettings() {
    settings.replaceChildren(); heading(settings, '手机设置');
    const body = el('div', null, 'phone-details-body', settings); el('h1', '我的手机', '', body);
    el('h2', '壁纸', '', body);
    el('p', completedDates.has('baseball') ? '把已经发生的事，留在每次亮屏时。' : '球场约会结束后，可以把合照设成壁纸。', 'phone-detail-caption', body);
    const choices = el('div', null, 'phone-wallpaper-choices', body);
    const status = el('p', '', 'phone-detail-caption', body); status.setAttribute('role', 'status');
    for (const item of wallpapers) {
      const option = button(choices, '', () => { state.wallpaper = item.id; persist(); applyAppearance(); openSettings(); document.getElementById('phoneWallpaperStatus').textContent = '已应用到锁屏和桌面。'; }, 'phone-wallpaper-choice');
      option.dataset.wallpaper = item.id; option.disabled = !!item.src && !completedDates.has('baseball'); option.setAttribute('aria-pressed', String(state.wallpaper === item.id));
      if (item.src) { const photo = el('img', null, '', option); photo.src = item.src; photo.alt = ''; }
      else el('span', 'S', 'phone-wallpaper-original', option);
      el('span', item.title, '', option);
    }
    status.id = 'phoneWallpaperStatus';
    const label = el('label', null, 'phone-setting-toggle', body); el('span', '减少动态效果', '', label);
    const input = el('input', null, '', label); input.type = 'checkbox'; input.checked = state.calm;
    input.onchange = () => { state.calm = input.checked; persist(); applyAppearance(); };
    el('p', '保留故事演出，放慢连续文字并减少闪动。', 'phone-detail-caption', body);
    el('small', 'Samsara · 测试版 ' + document.querySelector('meta[name="maque-build"]').content, 'phone-settings-build', body);
    view('phoneSettings');
  }
  const app = button(document.querySelector('#home .grid'), '', openNotes, 'app'); app.id = 'phoneNotesApp';
  const notesIcon = el('span', null, 'appico native-app-icon', app);
  const notesImage = el('img', null, '', notesIcon); notesImage.src = './assets/launcher-notes.png?v=2026.11.05.4'; notesImage.alt = ''; notesImage.setAttribute('aria-hidden', 'true');
  el('span', '备忘录', '', app);
  const oldSettings = document.querySelector('#home .dock [title="设置"]');
  if (oldSettings) {
    const control = document.createElement('button'); control.type = 'button'; control.className = oldSettings.className;
    control.style.cssText = oldSettings.style.cssText;
    for (const child of oldSettings.childNodes) control.append(child.cloneNode(true));
    control.setAttribute('aria-label', '打开手机设置'); control.onclick = openSettings; oldSettings.replaceWith(control);
  }
  applyAppearance();

  // Like through the post's existing handler so its own save format stays authoritative.
  let lastTouch = null, touchLikedAt = -Infinity;
  function likeImage(image, x, y) {
    const post = image.closest('.ins-post');
    const like = post?.querySelector('.ins-actions button[aria-pressed]');
    if (!like) return;
    if (like.getAttribute('aria-pressed') !== 'true') like.click();
    const heart = el('span', '♥', 'phone-double-heart', document.body); heart.setAttribute('aria-hidden', 'true');
    heart.style.left = x + 'px'; heart.style.top = y + 'px'; setTimeout(() => heart.remove(), 750);
  }
  const feed = document.getElementById('insFeed');
  const imageAt = target => target instanceof Element ? target.closest('.ins-post-image,.sequel-ins-photo') : null;
  feed.addEventListener('dblclick', event => {
    const image = imageAt(event.target); if (image && performance.now() - touchLikedAt > 500) likeImage(image, event.clientX, event.clientY);
  });
  feed.addEventListener('pointerup', event => {
    if (event.pointerType !== 'touch') return;
    const image = imageAt(event.target); if (!image) return;
    const time = performance.now();
    if (lastTouch?.image === image && time - lastTouch.time < 300 && Math.hypot(lastTouch.x - event.clientX, lastTouch.y - event.clientY) < 30) {
      likeImage(image, event.clientX, event.clientY); lastTouch = null; touchLikedAt = time;
    } else lastTouch = { image, time, x: event.clientX, y: event.clientY };
  });

  const detail = document.getElementById('photoDetail');
  const photoArea = detail.querySelector('.photo-detail-image');
  const nav = el('div', null, 'phone-photo-nav', photoArea);
  const previous = button(nav, '‹', () => movePhoto(-1)); previous.setAttribute('aria-label', '上一张照片');
  const next = button(nav, '›', () => movePhoto(1)); next.setAttribute('aria-label', '下一张照片');
  function currentPhotos() {
    const source = photoSelectionMode === 'date' ? mediaAssets.album.map(item => photoRecords.get(item.id) || item) : [...photoRecords.values()];
    return source.filter(item => photoFilter !== 'favorite' || item.favorite).sort((a, b) => new Date(a.takenAt || a.importedAt || 0) - new Date(b.takenAt || b.importedAt || 0));
  }
  function syncPhotoNav() {
    const photos = currentPhotos(), at = photos.findIndex(item => item.id === activePhotoId);
    nav.hidden = detail.hidden || photos.length < 2; previous.disabled = at <= 0; next.disabled = at < 0 || at >= photos.length - 1;
  }
  function movePhoto(offset) {
    const photos = currentPhotos(), at = photos.findIndex(item => item.id === activePhotoId);
    const target = at >= 0 ? photos[at + offset] : null;
    if (target) { openPhotoDetail(target.id); syncPhotoNav(); }
  }
  new MutationObserver(syncPhotoNav).observe(detail, { attributes: true, attributeFilter: ['hidden'] });
  new MutationObserver(syncPhotoNav).observe(document.getElementById('photoDetailImage'), { attributes: true, attributeFilter: ['src'] });
  document.addEventListener('keydown', event => {
    if (!document.getElementById('photos').classList.contains('active') || detail.hidden || event.ctrlKey || event.metaKey || event.altKey || (event.target instanceof Element && event.target.closest('input,textarea'))) return;
    if (event.key === 'Escape') { event.preventDefault(); closePhotoDetail(); }
    else if (['ArrowLeft', 'ArrowRight'].includes(event.key)) { event.preventDefault(); movePhoto(event.key === 'ArrowLeft' ? -1 : 1); }
  });
  let swipe = null;
  photoArea.addEventListener('pointerdown', event => { if (event.pointerType === 'touch' && !event.target.closest('button')) swipe = { x: event.clientX, y: event.clientY }; });
  photoArea.addEventListener('pointercancel', () => { swipe = null; });
  photoArea.addEventListener('pointerup', event => {
    if (!swipe) return; const dx = event.clientX - swipe.x, dy = event.clientY - swipe.y; swipe = null;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.5) movePhoto(dx < 0 ? 1 : -1);
  });
  window.MaquePhoneExtras = { openNotes, openSettings, prefersCalmMotion: () => state.calm || matchMedia('(prefers-reduced-motion: reduce)').matches };
})();
