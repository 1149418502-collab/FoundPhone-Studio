/* Samsara authored sequel. Fictional story state stays in this browser. */
(() => {
  'use strict';
  const story = window.MaqueSequelStory;
  if (!story) return;
  const KEY = 'maque_sequel_v1';
  const chapterIds = story.chapters.map(chapter => chapter.id);
  const endingIds = ['reunion', 'farewell', 'suspense', 'loop', 'trueHeart'];
  const freshChapter = () => ({ cursor: 0, choice: null, solved: false, storySeen: false, liked: false, saved: false, comment: false });
  const state = { version: 1, chapters: {}, endings: [], currentEnding: null, activeChapter: chapterIds[0], announced: 0, dates: [] };
  let initialized = false, busy = false, chatToken = 0, currentArchive = null;
  let storyOverlay = null;
  try {
    const stored = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (stored && stored.version === 1 && typeof stored === 'object') {
      state.endings = [...new Set((Array.isArray(stored.endings) ? stored.endings : []).filter(id => endingIds.includes(id)))];
      state.currentEnding = endingIds.includes(stored.currentEnding) ? stored.currentEnding : null;
      state.activeChapter = chapterIds.includes(stored.activeChapter) ? stored.activeChapter : chapterIds[0];
      // Retain valid announcements, while old thresholds below 60 no longer qualify.
      state.announced = Number.isFinite(stored.announced) && stored.announced >= 60 && stored.announced <= 100 ? stored.announced : 0;
      state.dates = [...new Set((Array.isArray(stored.dates) ? stored.dates : []).filter(id => ['escape', 'baseball', 'idol', 'football'].includes(id)))];
      for (const chapter of story.chapters) {
        const old = stored.chapters?.[chapter.id];
        const progress = freshChapter();
        if (old && typeof old === 'object') {
          progress.cursor = Number.isFinite(old.cursor) ? Math.max(0, Math.min(chapter.chat.length, Math.floor(old.cursor))) : 0;
          progress.choice = chapter.choices.some(choice => choice.id === old.choice) ? old.choice : null;
          for (const field of ['solved', 'storySeen', 'liked', 'saved', 'comment']) progress[field] = old[field] === true;
        }
        state.chapters[chapter.id] = progress;
      }
    }
  } catch (_) { /* A damaged or unavailable save should never block the phone. */ }
  for (const id of chapterIds) state.chapters[id] ||= freshChapter();
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (_) {} }
  function node(tag, text, className, parent) {
    const el = document.createElement(tag);
    if (text !== undefined && text !== null) el.textContent = text;
    if (className) el.className = className;
    if (parent) parent.append(el);
    return el;
  }
  function button(parent, text, onClick, className = 'sequel-button', id) {
    const el = node('button', text, className, parent);
    el.type = 'button'; if (id) el.id = id; el.onclick = onClick; return el;
  }
  function chapterById(id) { return story.chapters.find(chapter => chapter.id === id); }
  function accessible(chapter) {
    const index = chapterIds.indexOf(chapter.id);
    return affection >= chapter.threshold && (index === 0 || state.chapters[chapterIds[index - 1]].solved);
  }
  function nextChapter() { return story.chapters.find(chapter => accessible(chapter) && !state.chapters[chapter.id].solved) || story.chapters.filter(accessible).at(-1); }
  function allSolved() { return story.chapters.every(chapter => state.chapters[chapter.id].solved && state.chapters[chapter.id].choice); }
  function header(parent, title, subtitle, back) {
    const head = node('header', null, 'sequel-header', parent);
    const backButton = button(head, '‹', back, 'sequel-back'); backButton.setAttribute('aria-label', '返回');
    const titles = node('div', null, '', head); node('b', title, '', titles); node('small', subtitle, '', titles);
    button(head, '⌂', () => view('home'), 'sequel-home').setAttribute('aria-label', '返回手机桌面');
    return head;
  }
  function sync() {
    if (!initialized) return;
    const available = affection >= 60;
    document.getElementById('archiveApp').hidden = !available;
    document.getElementById('archives')?.classList.toggle('room-nine-read', state.dates.includes('escape'));
    document.getElementById('sequelChatEntry').hidden = !available;
    document.getElementById('archiveTeaser').hidden = !available;
    document.getElementById('archiveTeaser').textContent = available ? 'RECOVERY INDEX · 01 ↗' : '';
    const eligible = story.chapters.filter(accessible).at(-1);
    if (eligible && eligible.threshold > state.announced) {
      state.announced = eligible.threshold; save();
      announceFeature('KakaoTalk · 成灿', eligible.id === 'echo' ? '有一件小事，想和你确认。' : '银硕，那份记录又多了一页。');
    }
    if (document.getElementById('archives').classList.contains('active')) renderArchives();
  }
  function openArchives(id) {
    if (affection < 60) { explain('档案还没有准备好', '好感度达到 60% 后，成灿会把秘密档案的入口交给我。'); return; }
    currentArchive = id && accessible(chapterById(id) || {}) ? id : null;
    state.currentEnding = null; save();
    renderArchives(); view('archives');
  }
  function renderArchives() {
    const screen = document.getElementById('archives'); screen.replaceChildren();
    header(screen, '档案', 'SAMSARA / 01' , () => { if (currentArchive) { currentArchive = null; renderArchives(); } else view('home'); });
    const content = node('div', null, 'archive-content', screen);
    if (currentArchive) { renderDossier(content, chapterById(currentArchive)); return; }
    node('p', 'RECOVERY INDEX / 01', 'sequel-eyebrow', content);
    node('p', story.notice || '', 'archive-fiction-note', content);
    node('h1', '我遗忘的，\n仍然在这里。', 'archive-title', content);
    node('p', '只读副本。\n访问记录将被保留。', 'sequel-description', content);
    if (state.dates.includes('escape') && state.chapters.second.solved) {
      const journal = node('section', null, 'archive-journal', content);
      node('small', 'PRIVATE JOURNAL', 'archive-journal-label', journal);
      node('h2', '离开房间以前与以后', 'archive-journal-title', journal);
      node('p', '十日记事。字迹有些模糊，纸页按日期收在一起。', 'archive-journal-intro', journal);
      for (const entry of story.roomJournal || []) {
        const item = node('details', null, 'archive-journal-day', journal);
        item.dataset.roomJournalDay = entry.day;
        node('summary', `DAY ${entry.day} / ${entry.title}`, '', item);
        node('p', entry.text, '', item);
      }
    }
    for (const [index, chapter] of story.chapters.entries()) {
      const progress = state.chapters[chapter.id], canOpen = accessible(chapter);
      const card = button(content, '', () => { currentArchive = chapter.id; state.activeChapter = chapter.id; save(); renderArchives(); }, 'archive-folder');
      card.dataset.chapter = chapter.id; card.disabled = !canOpen;
      node('span', `0${index + 1} / ${progress.solved ? '已复原' : canOpen ? '待核对' : '尚未送达'}`, 'sequel-eyebrow', card);
      node('strong', chapter.title, '', card);
      node('small', canOpen ? chapter.subtitle : affection < chapter.threshold ? `好感度 ${chapter.threshold}% · 继续约会或赠礼` : '先复原上一份记录', '', card);
    }
    if (allSolved()) button(content, '去听听他的回答', renderFinalChoice, 'sequel-button', 'sequelFinale');
    if (state.endings.length) {
      node('h2', '我们抵达过的地方', 'archive-section-title', content);
      for (const id of state.endings) button(content, story.endings[id].title, () => renderEnding(id, false), 'archive-ending-link');
    }
    node('p', '读取不会删除我的照片或约会记录。', 'archive-footnote', content);
  }
  function renderDossier(content, chapter) {
    const progress = state.chapters[chapter.id];
    node('p', 'FILE / ' + String(chapterIds.indexOf(chapter.id) + 1).padStart(2, '0'), 'sequel-eyebrow', content);
    node('h1', chapter.title, 'archive-title', content);
    node('p', chapter.subtitle, 'sequel-description', content);
    const records = node('dl', null, 'archive-metadata', content);
    for (const record of chapter.dossier) { node('dt', record.label, '', records); node('dd', record.value, '', records); }
    const clues = node('div', null, 'archive-clues', content);
    button(clues, (progress.choice ? '✓ ' : '○ ') + 'KakaoTalk · 和成灿确认', () => openChat(chapter.id), 'archive-clue-link');
    button(clues, (progress.storySeen ? '✓ ' : '○ ') + 'Instagram · 查看他的快拍', () => { state.activeChapter = chapter.id; save(); openApp('instagram'); showStory(chapter.id); }, 'archive-clue-link');
    if (chapter.id === 'echo') button(clues, '信息 · 重读那封邀请短信', () => openSms(), 'archive-clue-link');
    if (progress.solved) {
      node('p', chapter.puzzle.success, 'archive-success', content);
      const letter = node('div', null, 'archive-letter', content);
      for (const text of chapter.reveal) node('p', text, '', letter);
      button(content, '重新回应这段对话', () => { progress.choice = null; save(); openChat(chapter.id); }, 'sequel-secondary');
      const next = story.chapters[chapterIds.indexOf(chapter.id) + 1];
      if (next) button(content, accessible(next) ? '翻开下一份记录 →' : `下一份记录 · 好感度 ${next.threshold}%`, () => { currentArchive = null; renderArchives(); }, 'sequel-button');
      else if (allSolved()) button(content, '去听听他的回答', renderFinalChoice, 'sequel-button', 'sequelFinale');
      return;
    }
    const form = node('form', null, 'archive-puzzle', content);
    const label = node('label', chapter.puzzle.question, '', form); label.htmlFor = 'archiveAnswer';
    const input = node('input', null, '', form); input.id = 'archiveAnswer'; input.autocomplete = 'off'; input.maxLength = chapter.puzzle.answer.length; input.placeholder = chapter.id === 'dawn' ? '输入四位数字' : '输入两位编号'; input.inputMode = 'numeric';
    const feedback = node('p', '', 'archive-feedback', form); feedback.id = 'archiveFeedback'; feedback.setAttribute('role', 'status');
    const submit = node('button', '核对记录', 'sequel-button', form); submit.type = 'submit'; submit.id = 'archiveSubmit';
    form.onsubmit = event => {
      event.preventDefault();
      if (!progress.choice || !progress.storySeen) { feedback.textContent = '先听完成灿的话，再看一眼他的快拍。两处线索都可以随时重读。'; return; }
      const normalize = value => String(value).normalize('NFKC').trim().toLowerCase().replace(/\s+/g, ' ');
      if (normalize(input.value) !== normalize(chapter.puzzle.answer)) { feedback.textContent = '还没有对上。记录不会消失，慢慢来。'; input.setAttribute('aria-invalid', 'true'); return; }
      progress.solved = true; input.removeAttribute('aria-invalid'); save(); sync(); renderArchives();
    };
    const hint = node('p', '', 'archive-hint', form); hint.id = 'archiveHintText'; hint.hidden = true;
    button(form, '需要一点提示', () => { hint.hidden = !hint.hidden; hint.textContent = chapter.puzzle.hint; }, 'sequel-link', 'archiveHint');
  }
  function openChat(id) {
    const chapter = chapterById(id) || nextChapter();
    if (!chapter || !accessible(chapter)) { openArchives(); return; }
    state.activeChapter = chapter.id;
    if (!state.chapters[chapter.id].cursor) state.chapters[chapter.id].cursor = 1;
    busy = false; chatToken++; save(); renderChat(); view('sequelChat');
  }
  function message(parent, speaker, text, index) {
    if (speaker === 'system') { node('p', text, 'sequel-chat-system', parent); return; }
    const row = node('div', null, 'sequel-message ' + (speaker === 'me' ? 'is-me' : 'is-him'), parent);
    if (speaker !== 'me') { const avatar = node('img', null, 'sequel-chat-avatar', row); avatar.src = getInstagramAvatar(); avatar.alt = ''; }
    const bubble = node('div', text, 'sequel-bubble', row);
    const meta = node('small', speaker === 'me' ? '已读' : '成灿', 'sequel-message-meta', row);
    bubble.dataset.message = String(index); meta.setAttribute('aria-label', speaker === 'me' ? '成灿已读' : '成灿的消息');
  }
  function renderChat() {
    const screen = document.getElementById('sequelChat'), chapter = chapterById(state.activeChapter), progress = state.chapters[chapter.id];
    screen.replaceChildren();
    header(screen, '成灿', 'KakaoTalk · ' + chapter.title, () => openApp('kakao'));
    const area = node('div', null, 'sequel-chat-log', screen); area.id = 'sequelChatLog'; area.setAttribute('role', 'log'); area.setAttribute('aria-live', 'polite');
    node('p', '只有我们看得到的对话', 'sequel-chat-system', area);
    chapter.chat.slice(0, progress.cursor).forEach((line, index) => message(area, line.speaker, line.text, index));
    const controls = node('div', null, 'sequel-chat-compose', screen);
    if (progress.cursor < chapter.chat.length) {
      if (busy) node('p', '成灿正在输入…', 'sequel-typing', area);
      const next = button(controls, busy ? '正在输入…' : '继续聊天', () => {
        if (busy) return; busy = true; const token = ++chatToken; renderChat();
        setTimeout(() => { if (token !== chatToken) return; progress.cursor++; busy = false; save(); if (screen.classList.contains('active')) renderChat(); }, 280);
      }, 'sequel-chat-next', 'sequelNext'); next.disabled = busy;
    } else if (!progress.choice) {
      node('small', '我想这样回答他', 'sequel-compose-label', controls);
      for (const choice of chapter.choices) {
        const el = button(controls, choice.label, () => { if (progress.choice) return; progress.choice = choice.id; save(); renderChat(); }, 'sequel-chat-choice');
        el.dataset.sequelChoice = choice.id;
      }
    } else {
      const choice = chapter.choices.find(item => item.id === progress.choice);
      message(area, 'me', choice.label, 'choice'); message(area, 'him', choice.reply, 'reply');
      button(controls, '把线索带回秘密档案', () => openArchives(chapter.id), 'sequel-chat-next', 'sequelBackToArchive');
    }
    requestAnimationFrame(() => { area.scrollTop = area.scrollHeight; });
  }
  function renderInstagram() {
    if (!initialized) return;
    document.querySelectorAll('.sequel-instagram-post, .sequel-story-entry').forEach(el => el.remove());
    const feed = document.getElementById('insFeed');
    const chapters = story.chapters.filter(accessible);
    if (!chapters.length) return;
    feed.querySelector('.ins-empty')?.remove();
    const stories = document.querySelector('.ins-stories');
    const storyButton = button(stories, '', () => showStory((nextChapter() || chapters.at(-1)).id), 'ins-story sequel-story-entry');
    const ring = node('div', null, 'ins-ring', storyButton); const portrait = node('img', null, '', ring); portrait.src = getInstagramAvatar(); portrait.alt = '';
    node('span', '只给你看', '', storyButton); storyButton.setAttribute('aria-label', '查看成灿的私密快拍');
    for (const chapter of [...chapters].reverse()) {
      const progress = state.chapters[chapter.id], post = node('article', null, 'ins-post sequel-instagram-post', feed); post.dataset.sequelPost = chapter.id;
      const head = node('div', null, 'ins-post-header', post); const avatar = node('img', null, '', head); avatar.src = getInstagramAvatar(); avatar.alt = '成灿';
      const author = node('div', null, '', head); node('b', 'sungchan', '', author); node('small', '密友 · 仅与你分享', '', author);
      const photo = node('img', null, 'sequel-ins-photo', post); photo.src = chapter.instagram.image; photo.alt = chapter.title + ' · 回忆照片'; photo.loading = 'lazy';
      const actions = node('div', null, 'ins-actions', post);
      const like = button(actions, progress.liked ? '♥' : '♡', () => { progress.liked = !progress.liked; save(); renderInstagram(); }, ''); like.setAttribute('aria-label', '喜欢这条私密动态'); like.setAttribute('aria-pressed', String(progress.liked));
      button(actions, '◯', () => { progress.comment = !progress.comment; save(); renderInstagram(); }, '').setAttribute('aria-label', '查看这条动态的评论');
      const bookmark = button(actions, progress.saved ? '已收藏' : '收藏', () => { progress.saved = !progress.saved; save(); renderInstagram(); }, 'sequel-bookmark'); bookmark.setAttribute('aria-pressed', String(progress.saved));
      const caption = node('div', null, 'ins-caption', post); node('b', 'sungchan', '', caption); node('p', chapter.instagram.caption, '', caption);
      if (progress.comment) { const comment = node('div', null, 'sequel-ins-comment', caption); node('b', 'sungchan 回复我', '', comment); node('p', chapter.instagram.comment, '', comment); }
      button(caption, progress.storySeen ? '重看这段快拍 ↗' : '打开他留给我的快拍 ↗', () => showStory(chapter.id), 'sequel-link');
      button(caption, '回到秘密档案', () => openArchives(chapter.id), 'sequel-link');
      node('small', 'SAMSARA · 剧情动态', '', caption);
    }
  }
  function showStory(id) {
    const chapter = chapterById(id); if (!chapter || !accessible(chapter)) return;
    state.chapters[id].storySeen = true; save(); storyOverlay?.remove();
    storyOverlay = node('div', null, 'sequel-story-overlay', document.getElementById('instagram'));
    storyOverlay.setAttribute('role', 'dialog'); storyOverlay.setAttribute('aria-modal', 'true'); storyOverlay.setAttribute('aria-label', '成灿的私密快拍');
    const photo = node('img', null, 'sequel-story-photo', storyOverlay); photo.src = chapter.instagram.image; photo.alt = '';
    const top = node('div', null, 'sequel-story-top', storyOverlay); node('span', 'sungchan · 密友', '', top);
    const close = button(top, '×', () => { storyOverlay.remove(); storyOverlay = null; document.querySelector('.sequel-story-entry')?.focus(); }, 'sequel-story-close'); close.setAttribute('aria-label', '关闭快拍');
    const card = node('div', null, 'sequel-story-copy', storyOverlay); node('p', chapter.instagram.story, '', card);
    button(card, '把这句话记下来', () => { state.chapters[id].saved = true; save(); storyOverlay.remove(); storyOverlay = null; openArchives(id); }, 'sequel-story-save');
    storyOverlay.onkeydown = event => { if (event.key === 'Escape') close.click(); if (event.key === 'Tab') { const buttons = [...storyOverlay.querySelectorAll('button')]; if (event.shiftKey && document.activeElement === buttons[0]) { event.preventDefault(); buttons.at(-1).focus(); } else if (!event.shiftKey && document.activeElement === buttons.at(-1)) { event.preventDefault(); buttons[0].focus(); } } };
    close.focus();
  }
  function renderFinalChoice() {
    if (!allSolved()) { openArchives(); return; }
    const screen = document.getElementById('archives'); screen.replaceChildren(); currentArchive = null; state.currentEnding = null; save();
    header(screen, '天亮之前', '最后一段对话', () => openArchives());
    const content = node('div', null, 'archive-content sequel-final-choice', screen);
    node('p', 'CHAPTER 03 / THE CHOICE IS OURS', 'sequel-eyebrow', content);
    node('h1', '这一次，\n让我自己回答。', 'archive-title', content);
    message(content, 'him', '我把出口放回原来的地方了。银硕，我还是想和你在一起，但这次，决定在你手里。', 0);
    message(content, 'me', '屏幕上的光没有再闪烁。第一次，我能够慢慢想完自己的答案。', 1);
    const options = [
      ['reunion', '保留记忆，重新认识现在的你'],
      ['farewell', '好好道别，让我们都走向明天'],
      ['loop', '我累了，把所有决定交给你'],
    ];
    for (const [id, label] of options) {
      const el = button(content, label, () => {
        const trust = story.chapters.reduce((sum, chapter) => sum + (chapter.choices.find(choice => choice.id === state.chapters[chapter.id].choice)?.value || 0), 0);
        renderEnding(id === 'reunion' && trust < 2 ? 'suspense' : id, true);
      }, 'sequel-final-option'); el.dataset.endingChoice = id;
    }
    view('archives');
  }
  function showClosingLetter(endingId) {
    const letter = story.closingLetter;
    const screen = document.getElementById('archives'); screen.replaceChildren(); currentArchive = null;
    const shell = node('div', null, 'sequel-ending sequel-epilogue', screen);
    header(shell, 'Samsara', '最后一封信', () => renderEnding(endingId, false, true));
    const content = node('div', null, 'sequel-ending-content epilogue-content', shell);
    node('p', 'A LETTER FOR THE END OF THIS LOOP', 'sequel-eyebrow', content);
    const envelope = node('div', null, 'epilogue-envelope', content);
    const flap = node('span', '♡', 'epilogue-seal', envelope); flap.setAttribute('aria-hidden', 'true');
    const openButton = button(content, '拆开这封信', () => {
      envelope.classList.add('is-open'); openButton.disabled = true;
      window.setTimeout(() => { note.hidden = false; note.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 650);
    }, 'sequel-button', 'openClosingLetter');
    openButton.setAttribute('aria-label', '拆开最后的情书');
    const note = node('article', null, 'epilogue-note', content); note.hidden = true;
    node('p', letter.word, 'epilogue-word', note);
    node('p', letter.transliteration, 'epilogue-definition', note);
    node('p', letter.definition, 'epilogue-definition', note);
    node('p', letter.gameMeaning, 'epilogue-game-meaning', note);
    node('p', letter.salutation, 'epilogue-salutation', note);
    node('p', letter.body, 'epilogue-letter-body', note);
    const memories = window.MaqueCorrespondence?.endingMemories() || [];
    if (memories.length) {
      node('small', '这一路留下的几件小事', 'epilogue-salutation', note);
      for (const memory of memories) node('p', memory, 'epilogue-definition', note);
    }
    const keepsake = window.MaqueCorrespondence?.closingKeepsake();
    if (keepsake) { node('small', '我留给下次的一句话', 'epilogue-salutation', note); node('blockquote', keepsake, 'epilogue-game-meaning', note); }
    node('p', '—— ' + letter.signature, 'epilogue-signature', note);
    button(content, '重新看一遍这个结局', () => renderEnding(endingId, false, true), 'sequel-secondary');
    button(content, '合上信，回到手机', () => view('home'), 'sequel-secondary');
    view('archives'); screen.scrollTop = 0;
  }
  function renderEnding(id, record = true, vaultOverride = false) {
    if (!endingIds.includes(id) || (record && !allSolved() && !vaultOverride)) return;
    if (record && !state.endings.includes(id)) state.endings.push(id);
    state.currentEnding = id; save();
    const ending = story.endings[id], screen = document.getElementById('archives'); screen.replaceChildren();
    const shell = node('div', null, 'sequel-ending ending-' + id, screen);
    header(shell, 'Samsara', '我们抵达的地方', () => showClosingLetter(id));
    const content = node('div', null, 'sequel-ending-content', shell);
    node('p', 'ENDING / ' + id.toUpperCase(), 'sequel-eyebrow', content); node('h1', ending.title, '', content); node('p', ending.subtitle, 'sequel-ending-subtitle', content);
    for (const paragraph of ending.paragraphs) node('p', paragraph, 'sequel-ending-paragraph', content);
    const last = node('div', null, 'sequel-ending-message', content); node('small', 'KakaoTalk · 成灿', '', last); node('p', ending.lastMessage, '', last);
    node('p', '已收录结局 ' + state.endings.length + ' / 5', 'sequel-ending-count', content);
    button(content, '打开片尾的信', () => showClosingLetter(id), 'sequel-button', 'sequelClosingLetter');
    view('archives'); screen.scrollTop = 0;
  }
  function onDateComplete(id) {
    if (!state.dates.includes(id)) { state.dates.push(id); save(); }
    sync();
  }
  function init() {
    if (initialized) return;
    const phone = document.querySelector('.phone');
    for (const [id, className] of [['archives', 'sequel-archives'], ['sequelChat', 'sequel-chat']]) {
      const screen = node('section', null, 'view ' + className, phone); screen.id = id; ids.push(id);
      screen.setAttribute('aria-label', id === 'archives' ? '秘密档案' : 'KakaoTalk 主线对话');
    }
    const app = button(document.querySelector('#home .grid'), '', () => openArchives(), 'app', 'archiveApp');
    const icon = node('span', '01', 'appico sequel-app-icon', app); icon.setAttribute('aria-hidden', 'true'); node('span', '索引', '', app);
    button(document.querySelector('#kakao .nav'), '私密对话', () => openChat(), 'sequel-chat-entry', 'sequelChatEntry');
    button(document.getElementById('info'), '', () => openArchives(), 'sequel-secondary', 'archiveTeaser');
    initialized = true; sync();
    if (document.getElementById('instagram').classList.contains('active')) renderInstagram();
  }
  function finishDiaryEnding() { renderEnding('reunion', true, true); }
  function finishTrueHeartEnding() { renderEnding('trueHeart', true, true); }
  window.MaqueSequel = { init, sync, renderInstagram, onDateComplete, openArchives, openChat, finishDiaryEnding, finishTrueHeartEnding };
  init();
})();
