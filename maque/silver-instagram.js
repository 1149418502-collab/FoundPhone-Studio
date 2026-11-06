/* The player's dated Instagram history. No affection or main-story state is changed here. */
(() => {
  'use strict';
  const story = window.MaqueSilverInstagramStory;
  if (!story) return;
  const posts = [...story.posts].sort((a, b) => b.publishedOn.localeCompare(a.publishedOn));
  const ids = new Set(posts.map(post => post.id));
  const KEY = 'maque_silver_instagram_v1';
  const state = { version: 1, liked: [], saved: [], slides: {}, comments: {}, announced: [], storyDates: {}, storyOrder: {} };
  try {
    const old = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (old?.version === 1) {
      for (const key of ['liked', 'saved']) state[key] = Array.isArray(old[key]) ? [...new Set(old[key].filter(id => ids.has(id)))] : [];
      for (const post of posts) {
        const index = old.slides?.[post.id];
        if (Number.isInteger(index) && index >= 0 && index < post.photos.length) state.slides[post.id] = index;
        state.comments[post.id] = Array.isArray(old.comments?.[post.id]) ? [...new Set(old.comments[post.id].filter(text => post.commentChoices?.includes(text)))] : [];
      }
      state.announced = Array.isArray(old.announced) ? [...new Set(old.announced.filter(id => ids.has(id)))] : [];
      for (const id of ['scene-baseball','extra-football','extra-escape','secret-echo','secret-second','secret-dawn']) {
        if (/^\d{4}-\d{2}-\d{2}$/.test(old.storyDates?.[id] || '')) state.storyDates[id] = old.storyDates[id];
        if (Number.isInteger(old.storyOrder?.[id]) && old.storyOrder[id] > 0) state.storyOrder[id] = old.storyOrder[id];
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
  function getAvatar() { return story.avatarSrc || './assets/eunseok-instagram-avatar.jpg'; }
  function available(post) {
    if (post.unlockAfter === 'baseball-post') return openedDates.has('baseball') || completedDates.has('baseball');
    if (post.unlockAfter === 'idol-memory') return completedDates.has('idol') || window.MaqueExtraDates?.hasReachedIdolMemory();
    if (post.unlockAfter === 'idol-complete') return completedDates.has('idol');
    return true;
  }
  function notifyUnlocks(silent = false) {
    for (const post of [...posts].reverse()) {
      if (!post.unlockAfter || !available(post) || state.announced.includes(post.id)) continue;
      state.announced.push(post.id);
      if (!silent) announceFeature(post.author === 'sungchan' ? 'Instagram · 成灿更新了动态' : 'Instagram · 我的新动态', post.caption);
    }
    persist();
  }
  function sortFeed(feed) {
    const articles = [...feed.querySelectorAll(':scope > .ins-post')];
    const now = new Date(), today = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
    for (const article of articles) {
      if (article.dataset.publishedOn) continue;
      const id = article.dataset.scene ? 'scene-' + article.dataset.scene : article.dataset.extraDatePost ? 'extra-' + article.dataset.extraDatePost : 'secret-' + article.dataset.sequelPost;
      state.storyDates[id] ||= today;
      state.storyOrder[id] ||= Math.max(0, ...Object.values(state.storyOrder)) + 1;
      article.dataset.publishedOn = state.storyDates[id]; article.dataset.publishedOrder = String(state.storyOrder[id]);
    }
    articles.sort((a,b) => b.dataset.publishedOn.localeCompare(a.dataset.publishedOn) || Number(b.dataset.publishedOrder || 0) - Number(a.dataset.publishedOrder || 0));
    for (const article of articles) feed.append(article);
    persist();
  }
  function renderPhotos(parent, post) {
    const media = el('div', null, 'ins-photo silver-carousel', parent);
    if (post.photoAspect) media.style.aspectRatio = post.photoAspect;
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
    feed.querySelectorAll('.authored-instagram-post').forEach(post => post.remove());
    notifyUnlocks(true);
    for (const post of posts.filter(available)) {
      const authorName = post.author || story.username;
      const own = authorName !== 'sungchan';
      const article = el('article', null, 'ins-post authored-instagram-post ' + (own ? 'silver-profile-post' : 'authored-sungchan-post'), feed);
      article.dataset.authoredPost = post.id; article.dataset.author = authorName;
      if (own) article.dataset.silverPost = post.id;
      article.dataset.publishedOn = post.publishedOn; article.dataset.publishedOrder = String(post.dayOrder || 0);
      const header = el('div', null, 'ins-post-header', article);
      const avatar = el('img', null, '', header); avatar.src = own ? getAvatar() : getInstagramAvatar(); avatar.alt = own ? '我的 Instagram 头像' : '成灿';
      const author = el('div', null, '', header); el('b', authorName, '', author); el('small', own ? '我的动态 · Instagram' : '一日爱豆 · Instagram', '', author);
      el('span', '···', '', header);
      renderPhotos(article, post);
      const actions = el('div', null, 'ins-actions', article);
      let commentsControl;
      for (const [key, label] of [['liked', '喜欢这条动态'], ['saved', '收藏这条动态']]) {
        if (key === 'saved' && post.commentChoices) {
          commentsControl = button(actions, '评论这条动态', '', 'authored-comment-toggle', () => { thread.hidden = !thread.hidden; commentsControl.setAttribute('aria-expanded', String(!thread.hidden)); });
          commentsControl.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M20 11a8 8 0 0 1-12 7l-5 2 2-5a8 8 0 1 1 15-4Z"/></svg>';
        }
        const control = button(actions, label, '', key === 'saved' ? 'silver-save' : 'silver-like', () => {
          state[key] = state[key].includes(post.id) ? state[key].filter(id => id !== post.id) : [...state[key], post.id]; persist();
          control.setAttribute('aria-pressed', String(state[key].includes(post.id)));
        });
        control.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true"><path d="' + (key === 'saved' ? 'M6 3h12v18l-6-4-6 4V3Z' : 'M12 20S3 14.7 3 8.7C3 3.5 9 2.8 12 7c3-4.2 9-3.5 9 1.7C21 14.7 12 20 12 20Z') + '"/></svg>';
        control.setAttribute('aria-pressed', String(state[key].includes(post.id)));
      }
      const caption = el('div', null, 'ins-caption', article); el('b', authorName, '', caption); el('p', post.caption, 'cn silver-post-caption', caption);
      const thread = el('div', null, 'authored-comments', caption);
      if (post.commentChoices) {
        const renderThread = () => {
          thread.replaceChildren();
          for (const text of state.comments[post.id] || []) {
            const row = el('p', null, 'authored-comment', thread); el('b', story.username, '', row); el('span', text, '', row);
          }
          const choices = el('div', null, 'authored-comment-choices', thread);
          for (const text of post.commentChoices) {
            const send = button(choices, '评论：' + text, text, '', () => {
              state.comments[post.id] ||= [];
              if (!state.comments[post.id].includes(text)) state.comments[post.id].push(text);
              persist(); renderThread();
            });
            send.disabled = (state.comments[post.id] || []).includes(text);
          }
        };
        thread.hidden = !(state.comments[post.id] || []).length;
        commentsControl.setAttribute('aria-expanded', String(!thread.hidden));
        renderThread();
      } else thread.hidden = true;
      const date = el('time', dateLabel(post.publishedOn), 'silver-post-date', caption); date.dateTime = post.publishedOn;
    }
  }
  if (completedDates.has('baseball') && !openedDates.has('baseball')) { openedDates.add('baseball'); storeDateList('maque_date_posts', openedDates); }
  window.MaqueSilverInstagram = { render, getAvatar, notifyUnlocks, sortFeed };
  if (document.getElementById('instagram')?.classList.contains('active')) renderInstagram();
})();
