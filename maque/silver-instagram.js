/* The player's dated Instagram history. No affection or main-story state is changed here. */
(() => {
  'use strict';
  const story = window.MaqueSilverInstagramStory;
  if (!story) return;
  const posts = [...story.posts].sort((a, b) => b.publishedOn.localeCompare(a.publishedOn));
  const ids = new Set(posts.map(post => post.id));
  const KEY = 'maque_silver_instagram_v1';
  const state = { version: 1, liked: [], saved: [], slides: {} };
  try {
    const old = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (old?.version === 1) {
      for (const key of ['liked', 'saved']) state[key] = Array.isArray(old[key]) ? [...new Set(old[key].filter(id => ids.has(id)))] : [];
      for (const post of posts) {
        const index = old.slides?.[post.id];
        if (Number.isInteger(index) && index >= 0 && index < post.photos.length) state.slides[post.id] = index;
      }
    }
  } catch (_) { /* Old or unavailable storage does not prevent reading the posts. */ }
  function persist() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (_) {} }
  function el(tag, text, className, parent) {
    const node = document.createElement(tag);
    if (text != null) node.textContent = text;
    if (className) node.className = className;
    if (parent) parent.append(node);
    return node;
  }
  function button(parent, label, text, className, action) {
    const node = el('button', text, className, parent);
    node.type = 'button'; node.setAttribute('aria-label', label); node.onclick = action;
    return node;
  }
  function dateLabel(date) {
    const [year, month, day] = date.split('-').map(Number);
    return `${year}年${month}月${day}日`;
  }
  function renderPhotos(parent, post) {
    const media = el('div', null, 'ins-photo silver-carousel', parent);
    const image = el('img', null, 'ins-post-image', media); image.loading = 'lazy'; image.decoding = 'async';
    let at = state.slides[post.id] || 0;
    const many = post.photos.length > 1;
    let previous, next, counter;
    const dots = [];
    const update = () => {
      image.src = post.photos[at].src; image.alt = post.photos[at].alt;
      media.dataset.slide = String(at + 1);
      if (!many) return;
      previous.hidden = at === 0; next.hidden = at === post.photos.length - 1;
      counter.textContent = `${at + 1} / ${post.photos.length}`;
      dots.forEach((dot, index) => dot.classList.toggle('is-current', index === at));
    };
    const move = delta => {
      const target = at + delta;
      if (target < 0 || target >= post.photos.length) return;
      at = target; state.slides[post.id] = at; persist(); update();
    };
    if (many) {
      media.tabIndex = 0; media.setAttribute('role', 'group'); media.setAttribute('aria-label', dateLabel(post.publishedOn) + '的动态照片');
      counter = el('span', '', 'silver-photo-counter', media); counter.setAttribute('role', 'status');
      previous = button(media, '上一张动态照片', '‹', 'silver-photo-previous', () => move(-1));
      next = button(media, '下一张动态照片', '›', 'silver-photo-next', () => move(1));
      const pagination = el('div', null, 'silver-photo-dots', media); pagination.setAttribute('aria-hidden', 'true');
      post.photos.forEach(() => dots.push(el('span', null, '', pagination)));
      media.addEventListener('keydown', event => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); event.stopPropagation(); move(event.key === 'ArrowRight' ? 1 : -1); }
      });
      let touch = null;
      media.addEventListener('touchstart', event => {
        const point = event.touches[0];
        touch = point && !event.target.closest('button') ? { x: point.clientX, y: point.clientY } : null;
      }, { passive: true });
      media.addEventListener('touchend', event => {
        const point = event.changedTouches[0], start = touch; touch = null;
        if (!point || !start) return;
        const dx = point.clientX - start.x, dy = point.clientY - start.y;
        if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) move(dx < 0 ? 1 : -1);
      }, { passive: true });
      media.addEventListener('touchcancel', () => { touch = null; }, { passive: true });
    }
    update();
  }
  function render(feed) {
    feed.querySelectorAll('.silver-profile-post').forEach(post => post.remove());
    const identity = getDatePhoto();
    for (const post of posts) {
      const article = el('article', null, 'ins-post silver-profile-post', feed);
      article.dataset.silverPost = post.id; article.dataset.publishedOn = post.publishedOn;
      const header = el('div', null, 'ins-post-header', article);
      if (identity) { const image = el('img', null, '', header); image.src = photoURL(identity); image.alt = '我选择的形象'; }
      else el('span', '银', 'silver-profile-avatar', header);
      const author = el('div', null, '', header); el('b', story.username, '', author); el('small', '我的动态 · Instagram', '', author);
      el('span', '···', '', header);
      renderPhotos(article, post);
      const actions = el('div', null, 'ins-actions', article);
      for (const [key, label] of [['liked', '喜欢这条动态'], ['saved', '收藏这条动态']]) {
        const control = button(actions, label, '', key === 'saved' ? 'silver-save' : 'silver-like', () => {
          state[key] = state[key].includes(post.id) ? state[key].filter(id => id !== post.id) : [...state[key], post.id]; persist();
          control.setAttribute('aria-pressed', String(state[key].includes(post.id)));
        });
        control.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true"><path d="' + (key === 'saved' ? 'M6 3h12v18l-6-4-6 4V3Z' : 'M12 20S3 14.7 3 8.7C3 3.5 9 2.8 12 7c3-4.2 9-3.5 9 1.7C21 14.7 12 20 12 20Z') + '"/></svg>';
        control.setAttribute('aria-pressed', String(state[key].includes(post.id)));
      }
      const caption = el('div', null, 'ins-caption', article); el('b', story.username, '', caption); el('p', post.caption, 'cn silver-post-caption', caption);
      const date = el('time', dateLabel(post.publishedOn), 'silver-post-date', caption); date.dateTime = post.publishedOn;
    }
  }
  window.MaqueSilverInstagram = { render };
  if (document.getElementById('instagram')?.classList.contains('active')) renderInstagram();
})();
