/* Persistent, optional everyday conversations. No new affection or ending gates. */
(() => {
  'use strict';
  const story = window.MaqueCorrespondenceStory;
  if (!story?.episodes?.length) return;
  const KEY = 'maque_correspondence_v1';
  const episodes = story.episodes;
  const byId = id => episodes.find(item => item.id === id);
  const evidenceValid = (episode, value) => episode.artifact.interaction === 'quote' ? Number.isInteger(value) && value >= 0 && value < episode.artifact.quotes.length : value === episode.artifact.answer;
  const fresh = () => ({ cursor: 0, evidenceChoice: null, evidenceWork: [], choice: null, after: 0, closed: false, liked: false });
  const state = { version: 1, chapters: {}, activeId: episodes[0].id, activeMs: 0, personalNote: '' };
  let old = null;
  try { old = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (_) {}
  if (old?.version === 1) {
    if (byId(old.activeId)) state.activeId = old.activeId;
    state.activeMs = Number.isFinite(old.activeMs) ? Math.max(0, Math.min(365 * 86400000, old.activeMs)) : 0;
    state.personalNote = typeof old.personalNote === 'string' ? old.personalNote.slice(0, 240) : '';
  }
  for (const episode of episodes) {
    const saved = old?.version === 1 ? old.chapters?.[episode.id] : null;
    const progress = fresh();
    if (saved && typeof saved === 'object') {
      progress.cursor = Number.isInteger(saved.cursor) ? Math.max(0, Math.min(episode.opening.length + (episode.recall ? 1 : 0), saved.cursor)) : 0;
      progress.evidenceChoice = evidenceValid(episode, saved.evidenceChoice) ? saved.evidenceChoice : null;
      const workLength = (episode.artifact.items || episode.artifact.fragments || []).length;
      progress.evidenceWork = Array.isArray(saved.evidenceWork) ? [...new Set(saved.evidenceWork.filter(value => Number.isInteger(value) && value >= 0 && value < workLength))] : [];
      progress.choice = episode.choices.some(item => item.id === saved.choice) ? saved.choice : null;
      const reply = episode.choices.find(item => item.id === progress.choice);
      progress.after = reply && progress.evidenceChoice !== null ? Math.max(0, Math.min(reply.reply.length + episode.closing.length, Number.isInteger(saved.after) ? saved.after : 0)) : 0;
      if (progress.evidenceChoice === null) progress.choice = null;
      progress.closed = saved.closed === true && progress.cursor >= episode.opening.length && !!progress.choice && progress.after === reply?.reply.length + episode.closing.length;
      progress.liked = saved.liked === true;
    }
    state.chapters[episode.id] = progress;
  }
  // A corrupted save cannot open chapters ahead of the last completed one.
  let previousComplete = true;
  for (const episode of episodes) {
    if (!previousComplete) state.chapters[episode.id] = fresh();
    previousComplete = state.chapters[episode.id].closed;
  }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (_) {} };
  const count = () => episodes.filter(item => state.chapters[item.id].closed).length;
  const accessible = id => { const at = episodes.findIndex(item => item.id === id); return at >= 0 && (at === 0 || state.chapters[episodes[at - 1].id].closed); };
  const el = (tag, text, cls, parent) => {
    const node = document.createElement(tag); if (text != null) node.textContent = text;
    if (cls) node.className = cls; parent?.append(node); return node;
  };
  function button(parent, label, action, cls = 'cw-button') { const node = el('button', label, cls, parent); node.type = 'button'; node.onclick = action; return node; }
  function makeView(id, label, cls) { const node = el('section', null, 'view ' + cls, document.querySelector('.phone')); node.id = id; node.setAttribute('aria-label', label); ids.push(id); return node; }
  const inbox = makeView('correspondenceInbox', 'KakaoTalk 日常往来', 'cw-inbox');
  const chat = makeView('correspondenceChat', '和成灿的日常聊天', 'cw-chat');
  const paper = makeView('correspondencePaper', '手机里留存的一页', 'cw-paper');
  function header(parent, title, subtitle, back = openHub) {
    const head = el('header', null, 'cw-header', parent);
    button(head, '‹', back, 'cw-back').setAttribute('aria-label', '返回');
    const titles = el('div', null, '', head); el('b', title, '', titles); el('small', subtitle, '', titles);
    button(head, '⌂', goHome, 'cw-home').setAttribute('aria-label', '返回手机桌面');
  }
  function opening(episode) {
    const lines = [...episode.opening];
    const previous = episode.recall && state.chapters[episode.recall.episode]?.choice;
    const remembered = previous && episode.recall.replies[previous];
    if (remembered) lines.splice(2, 0, ['him', remembered]);
    return lines;
  }
  const selected = episode => episode.choices.find(item => item.id === state.chapters[episode.id].choice);
  const hasEvidence = episode => evidenceValid(episode, state.chapters[episode.id].evidenceChoice);
  const evidenceText = episode => episode.artifact.interaction === 'quote' && hasEvidence(episode) ? episode.artifact.quotes[state.chapters[episode.id].evidenceChoice] : episode.artifact.excerpt;
  function openHub() {
    inbox.replaceChildren(); header(inbox, '成灿', 'KakaoTalk · 日常往来', () => view('kakao'));
    const body = el('div', null, 'cw-inbox-body', inbox);
    el('h1', story.title, '', body);
    el('p', '有些话，是在回家以后才慢慢想明白的。', 'cw-subtitle', body);
    const total = count();
    el('p', `${total} / ${episodes.length} 页已收好 · 阅读到哪一句，都会记住`, 'cw-progress', body);
    const next = episodes.find(item => !state.chapters[item.id].closed);
    if (next) button(body, state.chapters[next.id].cursor ? '继续没聊完的那一段' : '打开下一段往来', () => openEpisode(next.id));
    else button(body, '看看我们留下了什么', openLedger);
    for (const [index, episode] of episodes.entries()) {
      const progress = state.chapters[episode.id];
      const row = button(body, '', () => openEpisode(episode.id), 'cw-inbox-row'); row.dataset.correspondenceEpisode = episode.id;
      row.disabled = !accessible(episode.id);
      el('span', String(index + 1).padStart(2, '0'), 'cw-number', row);
      const copy = el('span', null, 'cw-row-copy', row); el('strong', episode.title, '', copy);
      el('small', progress.closed ? selected(episode)?.remember : accessible(episode.id) ? episode.teaser : '上一段的话说完以后，再打开这一页。', '', copy);
      el('span', progress.closed ? '✓' : '›', 'cw-row-mark', row);
    }
    if (total) button(body, '我们慢慢学会的事', openLedger, 'cw-secondary');
    if (state.activeMs >= 60000) el('small', `已在这只手机里停留约 ${Math.floor(state.activeMs / 60000)} 分钟`, 'cw-playtime', body);
    view('correspondenceInbox');
  }
  function message(parent, who, text, index) {
    const row = el('div', null, 'cw-message ' + who, parent); row.dataset.messageIndex = String(index);
    if (who === 'him') { const img = el('img', null, 'cw-avatar', row); img.src = getInstagramAvatar(); img.alt = '成灿'; }
    el('p', text, 'cw-bubble', row);
  }
  function openEpisode(id) {
    if (!accessible(id)) { openHub(); return; }
    state.activeId = id; const progress = state.chapters[id];
    if (!progress.cursor) progress.cursor = 1;
    save(); renderChat();
  }
  function renderChat() {
    const episode = byId(state.activeId), progress = state.chapters[episode.id];
    const first = opening(episode); chat.replaceChildren();
    header(chat, '成灿', episode.title);
    const area = el('div', null, 'cw-messages', chat); area.id = 'correspondenceMessages';
    el('p', '我和成灿 · 这一段往来', 'cw-chat-date', area);
    for (const [index, line] of first.slice(0, progress.cursor).entries()) message(area, ...line, index);
    if (hasEvidence(episode)) {
      const saved = el('aside', null, 'cw-saved-excerpt', area); el('small', '从手机里带回的一句', '', saved); el('p', evidenceText(episode), '', saved);
      button(saved, '再读那一页', () => openEvidence(episode.id), 'cw-inline');
    }
    const reply = selected(episode);
    if (reply) {
      message(area, 'me', reply.label, 'choice');
      for (const [index, line] of [...reply.reply, ...episode.closing].slice(0, progress.after).entries()) message(area, ...line, 'after-' + index);
    }
    const controls = el('div', null, 'cw-controls', chat);
    if (progress.cursor < first.length) {
      const next = button(controls, '继续聊天', () => { progress.cursor++; save(); renderChat(); }); next.id = 'correspondenceNext';
    } else if (!hasEvidence(episode)) {
      el('small', `他留了一页「${episode.artifact.title}」。`, '', controls);
      const labels = { notes: '去备忘录看看', instagram: '去 Instagram 看看', photos: '打开那张照片和附注', draft: '读他没有发出的草稿' };
      button(controls, labels[episode.artifact.app], () => openClue(episode.id)).id = 'correspondenceClue';
    } else if (!reply) {
      el('small', '我想这样回他', '', controls);
      for (const item of episode.choices) {
        const choice = button(controls, item.label, () => {
          if (progress.choice) return;
          progress.choice = item.id; progress.after = 1; save(); renderChat();
        }, 'cw-choice'); choice.dataset.correspondenceChoice = item.id;
      }
    } else if (progress.after < reply.reply.length + episode.closing.length) {
      const next = button(controls, '继续聊天', () => { progress.after++; save(); renderChat(); }); next.id = 'correspondenceNext';
    } else {
      button(controls, progress.closed ? '重读收好的这一页' : '把今天这一页收好', () => openLetter(episode.id)).id = 'correspondenceLetter';
      if (progress.closed) {
        const next = episodes[episodes.indexOf(episode) + 1];
        button(controls, next ? '下一段往来' : '我们慢慢学会的事', next ? () => openEpisode(next.id) : openLedger, 'cw-secondary');
      }
    }
    view('correspondenceChat'); requestAnimationFrame(() => { area.scrollTop = area.scrollHeight; });
  }
  function evidenceAvailable(episode) { return accessible(episode.id) && state.chapters[episode.id].cursor >= opening(episode).length; }
  function openClue(id) {
    const episode = byId(id); if (!episode || !evidenceAvailable(episode)) return;
    if (episode.artifact.app === 'notes' && window.MaquePhoneExtras) window.MaquePhoneExtras.openNotes();
    else if (episode.artifact.app === 'instagram') {
      openApp('instagram');
      requestAnimationFrame(() => document.querySelector(`[data-correspondence-post="${id}"]`)?.scrollIntoView({ block: 'start' }));
    } else openEvidence(id);
  }
  function openEvidence(id) {
    const episode = byId(id); if (!episode || !evidenceAvailable(episode)) return;
    const progress = state.chapters[id], artifact = episode.artifact;
    const names = { notes: '备忘录', instagram: 'Instagram · 密友', photos: '照片 · 附注', draft: 'KakaoTalk · 草稿' };
    paper.replaceChildren(); paper.dataset.app = artifact.app;
    header(paper, names[artifact.app], episode.title, () => openEpisode(id));
    const body = el('article', null, 'cw-paper-body', paper);
    el('small', artifact.app === 'draft' ? '未发送 · 文字草稿' : '只留在这只手机里的记录', 'cw-paper-source', body);
    el('h1', artifact.title, '', body);
    if (artifact.image) { const image = el('img', null, 'cw-attachment', body); image.src = artifact.image; image.alt = artifact.title; }
    for (const text of artifact.paragraphs) el('p', text, 'cw-prose', body);
    const question = el('section', null, 'cw-evidence-question', body);
    const prompts = { quote: '我想把哪一句留在这一页？', arrange: '把没说完的一句，慢慢放回原处', checklist: '把睡前的三个小动作收好' };
    el('h2', prompts[artifact.interaction] || artifact.question, '', question);
    const feedback = el('p', '', 'cw-evidence-feedback', question); feedback.setAttribute('role', 'status');
    const refresh = () => { const top = paper.scrollTop; openEvidence(id); paper.scrollTop = top; };
    if (hasEvidence(episode)) {
      el('blockquote', evidenceText(episode), '', question); button(question, '带着这一句回到聊天', () => openEpisode(id)).id = 'correspondenceBack';
    } else if (artifact.interaction === 'quote') {
      el('p', '留住此刻打动我的那一句就好。', 'cw-paper-source', question);
      for (const [index, quote] of artifact.quotes.entries()) {
        const keep = button(question, quote, () => { progress.evidenceChoice = index; save(); refresh(); }, 'cw-evidence-answer');
        keep.dataset.evidenceQuote = String(index);
      }
    } else if (artifact.interaction === 'arrange') {
      const preview = el('p', progress.evidenceWork.map(index => artifact.fragments[index]).join('') || '这一句还没排好。', 'cw-draft-preview', question);
      preview.setAttribute('aria-live', 'polite');
      for (const index of artifact.fragments.map((_, index) => index).reverse()) {
        const fragment = button(question, artifact.fragments[index], () => { if (!progress.evidenceWork.includes(index)) { progress.evidenceWork.push(index); save(); refresh(); } }, 'cw-evidence-answer');
        fragment.dataset.evidenceFragment = String(index); fragment.disabled = progress.evidenceWork.includes(index);
      }
      button(question, '重排这一句', () => { progress.evidenceWork = []; save(); refresh(); }, 'cw-secondary').id = 'correspondenceReorder';
      const submit = button(question, '把这句话放回去', () => {
        if (!progress.evidenceWork.every((value, index) => value === index) || progress.evidenceWork.length !== artifact.fragments.length) { feedback.textContent = artifact.arrangeHint; return; }
        progress.evidenceChoice = artifact.answer; save(); refresh();
      }); submit.id = 'correspondenceArrange'; submit.disabled = progress.evidenceWork.length !== artifact.fragments.length;
    } else if (artifact.interaction === 'checklist') {
      const inputs = [];
      for (const [index, text] of artifact.items.entries()) {
        const label = el('label', null, 'cw-pack-item', question);
        const input = el('input', null, '', label); input.type = 'checkbox'; input.checked = progress.evidenceWork.includes(index); inputs.push(input);
        el('span', text, '', label);
        input.onchange = () => { progress.evidenceWork = inputs.flatMap((item, at) => item.checked ? [at] : []); save(); keep.disabled = progress.evidenceWork.length !== artifact.items.length; };
      }
      const keep = button(question, '收好这三个小动作', () => { if (progress.evidenceWork.length === artifact.items.length) { progress.evidenceChoice = artifact.answer; save(); refresh(); } });
      keep.id = 'correspondencePack'; keep.disabled = progress.evidenceWork.length !== artifact.items.length;
    } else {
      for (const [index, label] of artifact.options.entries()) {
        const answer = button(question, label, () => {
          if (index !== artifact.answer) { feedback.textContent = artifact.hint; return; }
          progress.evidenceChoice = index; save(); openEvidence(id);
        }, 'cw-evidence-answer'); answer.dataset.evidenceAnswer = String(index);
      }
    }
    view('correspondencePaper'); paper.scrollTop = 0;
  }
  function openLetter(id) {
    const episode = byId(id), progress = episode && state.chapters[id], reply = episode && selected(episode);
    if (!episode || !accessible(id) || !reply || progress.after < reply.reply.length + episode.closing.length) return;
    paper.replaceChildren(); paper.dataset.app = 'letter';
    header(paper, '备忘录 · 留下的一页', episode.title, () => openEpisode(id));
    const body = el('article', null, 'cw-paper-body cw-keepsake', paper);
    el('small', '我想记住的事', 'cw-paper-source', body); el('h1', episode.letter.title, '', body);
    el('blockquote', '我当时说：“' + reply.label + '”', 'cw-my-answer', body);
    if (episode.artifact.interaction === 'quote') el('blockquote', '我留下的原句：“' + evidenceText(episode) + '”', 'cw-my-answer', body);
    for (const text of episode.letter.paragraphs) el('p', text, 'cw-prose', body);
    const finish = button(body, progress.closed ? '已收好 · 回到往来列表' : '收好这一页', () => {
      progress.closed = true; save(); updateEntries();
      const next = episodes[episodes.indexOf(episode) + 1];
      if (next) openHub(); else openLedger();
    }); finish.id = 'correspondenceFinish';
    view('correspondencePaper'); paper.scrollTop = 0;
  }
  function openLedger() {
    paper.replaceChildren(); paper.dataset.app = 'ledger'; header(paper, '备忘录', '我们慢慢学会的事');
    const body = el('article', null, 'cw-paper-body', paper); el('h1', '我们慢慢学会的事', '', body);
    el('p', '那些认真说过的话，都留在这里。它们不是一张要求以后照做的清单。', 'cw-prose', body);
    for (const episode of episodes.filter(item => state.chapters[item.id].closed)) {
      const card = button(body, '', () => openLetter(episode.id), 'cw-memory-row'); card.dataset.memoryEpisode = episode.id;
      el('small', episode.title, '', card); el('p', selected(episode).remember, '', card);
      if (episode.artifact.interaction === 'quote') el('small', '我留下的原句：' + evidenceText(episode), 'cw-kept-quote', card);
    }
    if (count() === episodes.length) {
      el('label', '也给以后的自己留一句话', 'cw-note-label', body).htmlFor = 'correspondencePersonalNote';
      const input = el('textarea', null, 'cw-personal-note', body); input.id = 'correspondencePersonalNote'; input.maxLength = 240; input.value = state.personalNote;
      input.placeholder = '可以晚一点再写。';
      const status = el('p', '', 'cw-evidence-feedback', body); status.setAttribute('role', 'status');
      button(body, '留在这只手机里', () => { state.personalNote = input.value.slice(0, 240).trim(); save(); status.textContent = '收好了。以后打开这一页，还会看见。'; });
      el('p', '日常往来写到这里。想赴约、翻照片，或者继续看那些没读完的记录时，回到手机就能找到。', 'cw-prose', body);
    }
    button(body, '回到手机', goHome, 'cw-secondary'); view('correspondencePaper'); paper.scrollTop = 0;
  }
  function noteEntries() {
    const list = [{ id: 'correspondence-hub', title: story.title, detail: count() + ' / ' + episodes.length + ' 段往来', open: openHub }];
    for (const episode of episodes) {
      if (evidenceAvailable(episode) && episode.artifact.app === 'notes') list.push({ id: 'correspondence-clue-' + episode.id, title: episode.artifact.title, detail: '成灿留的一页 · ' + episode.title, pending: !state.chapters[episode.id].closed, open: () => openEvidence(episode.id) });
      if (state.chapters[episode.id].closed) list.push({ id: 'correspondence-letter-' + episode.id, title: episode.letter.title, detail: '我和成灿 · 已收好', open: () => openLetter(episode.id) });
    }
    if (count()) list.push({ id: 'correspondence-ledger', title: '我们慢慢学会的事', detail: count() + ' 段往来的留痕', open: openLedger });
    return list.sort((a, b) => Number(!!b.pending) - Number(!!a.pending));
  }
  function renderInstagram() {
    document.querySelectorAll('.cw-instagram-post').forEach(node => node.remove());
    const feed = document.getElementById('insFeed');
    for (const episode of episodes.filter(item => item.artifact.app === 'instagram' && evidenceAvailable(item))) {
      const progress = state.chapters[episode.id], post = el('article', null, 'ins-post cw-instagram-post'); post.dataset.correspondencePost = episode.id;
      const head = el('div', null, 'ins-post-header', post), img = el('img', null, '', head); img.src = getInstagramAvatar(); img.alt = '成灿';
      const author = el('div', null, '', head); el('b', 'sungchan', '', author); el('small', '密友 · 一段没说完的话', '', author);
      const quote = button(post, '', () => openEvidence(episode.id), 'cw-story-quote');
      el('small', episode.artifact.title, '', quote); el('p', episode.artifact.excerpt, '', quote);
      const actions = el('div', null, 'ins-actions', post);
      const like = button(actions, progress.liked ? '♥' : '♡', () => { progress.liked = !progress.liked; save(); like.textContent = progress.liked ? '♥' : '♡'; like.setAttribute('aria-pressed', String(progress.liked)); }, '');
      like.setAttribute('aria-label', '喜欢这条日常快拍'); like.setAttribute('aria-pressed', String(progress.liked));
      button(actions, '打开完整快拍', () => openEvidence(episode.id), 'cw-inline');
      if (progress.closed) feed.insertBefore(post, feed.querySelector('.silver-profile-post')); else feed.prepend(post);
    }
  }
  const entry = button(document.querySelector('#kakao .compose'), '', openHub, 'cw-entry'); entry.id = 'correspondenceEntry';
  const gameEntry = button(document.getElementById('game'), '', openHub, 'cw-game-entry');
  button(document.getElementById('dateCatalog'), '赴约前后 · 和他多聊一会儿', openHub, 'date-inline-link');
  function updateEntries() { entry.textContent = '日常往来 ' + count() + '/' + episodes.length; gameEntry.textContent = count() ? '继续那些没聊完的小事' : '和他多聊一会儿 · 日常往来'; }
  updateEntries(); save();
  document.addEventListener('keydown', event => {
    if (!chat.classList.contains('active') || event.repeat || event.ctrlKey || event.metaKey || event.altKey || ![' ', 'Enter'].includes(event.key)) return;
    if (event.target instanceof Element && event.target.closest('button,input,textarea')) return;
    const next = document.getElementById('correspondenceNext'); if (next) { event.preventDefault(); next.click(); }
  });
  // Count only visible, recently active play. It never locks content behind elapsed time.
  let tick = Date.now(), lastInteraction = tick, wasVisible = !document.hidden;
  function flushTime() {
    const now = Date.now(), delta = now - tick; tick = now;
    const active = document.querySelector('.view.active');
    if (wasVisible && delta > 0 && delta <= 15000 && now - lastInteraction < 60000 && active && !['lock', 'pin'].includes(active.id)) { state.activeMs += delta; save(); }
    wasVisible = !document.hidden;
  }
  for (const name of ['pointerdown', 'keydown', 'scroll']) document.addEventListener(name, () => { lastInteraction = Date.now(); }, { passive: true, capture: true });
  document.addEventListener('visibilitychange', flushTime); window.addEventListener('pagehide', flushTime); setInterval(flushTime, 10000);
  window.MaqueCorrespondence = { open: openHub, openEpisode, noteEntries, renderInstagram, openLedger,
    endingMemories: () => episodes.filter(item => state.chapters[item.id].closed).map(item => selected(item).remember).slice(-3),
    closingKeepsake: () => count() === episodes.length && state.personalNote ? state.personalNote : '' };
})();
