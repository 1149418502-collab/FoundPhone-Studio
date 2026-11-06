/* Temporary date copy is retained until Silver supplies replacement dialogue and media. */
(() => {
  'use strict';
  const STORAGE_KEY = 'maque_extra_dates_v1';
  const chapterIds = ['football', 'idol', 'escape'];
  const stories = {
    football: {
      title: '把晚风，留到终场', subtitle: 'AFTER CLASS / 足球校园',
      description: '放学后的操场还亮着灯。我想试着踢一脚球，也想听成灿讲讲小时候。输赢不是今天最重要的事，等他一起走出校门才是。',
      memory: './assets/sungchan-football-childhood.jpg', memoryLabel: '他翻给我看的童年足球旧照',
      caption: '银硕，今天的传球我收到了。以前一有空就往操场跑，现在跑到终场，最想见的人就在旁边。下次也一起慢慢走回去吧。',
      nodes: [
        { type: 'line', title: '01 / 放学以后', who: 'me', text: '我沿着跑道走到场边，成灿抱着足球向我跑来。鞋尖沾了一点草屑，他却先问我等了多久。', ko: '오래 기다렸어요?', reply: '“没有。我也刚到。今天让我一起玩吧。”' },
        { type: 'choice', title: '02 / 把球交给我', text: '成灿把球停在我面前，退开两步。场上没有观众，只有他在等我的选择。', key: 'play', options: [{ id: 'pass', label: '先和他练一次传球', response: '成灿站到我正前方：“不用太用力。我会接住的。”' }, { id: 'shoot', label: '试着射向他守着的小球门', response: '他把外套放成球门，又向我眨了下眼：“今天的守门员只为你一个人上场。”' }] },
        { type: 'ball', title: '03 / 轮到我的这一脚', text: '我按他说的把脚尖转开一点。轻触球，完成这一脚；不用抢时间，他会等我准备好。' },
        { type: 'line', title: '04 / 球停下来以后', who: 'him', ko: '당신이랑 하니까 더 재미있어요.', text: s => s.choices.play === 'shoot' ? '球擦着他的鞋边滚进小球门。他先替我欢呼，才笑着举起双手：“这次算你赢。再来一次的时候，我可要认真了。”' : '球偏了一点，他却轻快地迈出去接住，再准确地送回我脚边。“很好啊。你看，我们已经完成第一次配合了。”' },
        { type: 'choice', title: '05 / 长椅上的空位', text: '我把水递给他。晚风吹过，操场的灯一盏一盏亮起来。我想问他——', key: 'talk', options: [{ id: 'childhood', label: '小时候踢完球，也会这样舍不得回去吗？', response: '“会。天黑了才发现肚子很饿。”他翻出一张旧照，“那时候总觉得，再多踢一分钟就好了。”' }, { id: 'today', label: '今天最开心的是什么？', response: '“你真的来了。”他转过头，“虽然只说了会在这里见面，我还是提前看了好多次校门。”' }] },
        { type: 'memory', title: '06 / 他愿意分享的过去', text: '我接过手机，看见照片里追着足球跑的小小身影。原来他从那么早开始，就会为了喜欢的事情这样认真。', note: '这张旧照属于他的童年。今天的晚风，留在我们的记忆里。' },
        { type: 'choice', title: '07 / 一起走到校门口', text: '成灿背起球袋，却没有急着往前。他朝我伸出手，又留出一点让我选择的距离。', key: 'goodnight', options: [{ id: 'hand', label: '把手轻轻放进他手心', response: '“今天可以走慢一点吗？”他握住我的手，“我好像还不想那么快说再见。”' }, { id: 'beside', label: '和他并肩，约好下次见面的时间', response: '他认真记下我说的时间。“好，那今天先到这里。下次见，银硕。”走到校门口，他又回头朝我挥了挥手。' }] },
        { type: 'done', title: '08 / 约好了，下次见', text: '终场以后还有晚风，告别以后也还有下次。今天，我想把这件小事和他一起记住。' }
      ]
    },
    idol: {
      title: '灯光之外的名字', subtitle: 'BEHIND THE SPOTLIGHT / 一日爱豆',
      description: '我和成灿一起走进排练室，记住一小段动作，再玩一次只属于我们的身份交换：这一场，我也可以是站上舞台的人，而成灿会做我的粉丝。掌声落下后，我们再换回来。',
      memory: './assets/date-idol-reference-1.jpg', secondaryMemory: './assets/date-idol-reference-2.jpg', memoryLabel: '我们留下的舞台日记',
      caption: '今天排练结束后，最先听见的是你的声音。银硕，台上要记很多拍子，和你相处的时候，好像只要慢慢呼吸就可以了。',
      nodes: [
        { type: 'line', title: '01 / 练习室的门', who: 'me', text: '我推开练习室的门。成灿把一张写着名字的通行卡递给我，笑着让出身边的位置：“今天一起试试？”', ko: '오늘은 같이 해 볼까요?' },
        { type: 'choice', title: '02 / 开始之前', text: '音乐还没开始，他已经认真数起了拍子。我想先做一件很小的事。', key: 'care', options: [{ id: 'water', label: '把水放在他随手就能拿到的地方', response: '他看了一眼水瓶，又看向我：“谢谢。我总是练起来就忘了喝水。”' }, { id: 'breathe', label: '陪他一起做一次深呼吸', response: '我们一起吸气，又慢慢呼出。他肩膀松下来：“你在旁边，我好像没那么紧张了。”' }] },
        { type: 'rehearsal', title: '03 / 三个小小的拍点', text: '成灿在镜子前示范了一遍。我看着便签记住顺序，再点选动作陪他完成这段排练。', hint: '排练便签：先「呼吸」，再「抬手」，最后「转身」。不用抢拍，记错了也能重新开始。' },
        { type: 'line', title: '04 / 同一个拍子', who: 'him', ko: '방금 우리 잘 맞았죠?', text: s => s.choices.care === 'water' ? '“刚刚是不是很合拍？”他拿起我准备的水喝了一口，“原来排练结束，有人等着自己是这种感觉。”' : '“刚刚是不是很合拍？”他朝我弯起眼睛，“我记住了。先呼吸，再去做想做的事情。”' },
        { type: 'choice', title: '05 / 交换一次身份', text: '小舞台的灯光亮起。我们抽到一张写着“互换身份”的游戏卡：只在这场排练里，我可以做上台的偶像，也可以做台下的粉丝。', key: 'stage', options: [{ id: 'sungchan', label: '让成灿站上舞台，我在台下为他应援', response: '成灿朝我挥手，熟悉的笑容落进聚光灯里。我举起写着他名字的应援板，他一下就找到了我。' }, { id: 'eunseok', label: '换我做一次偶像，让成灿当我的粉丝', response: '我走上舞台，成灿在台下举起应援板。谢幕时他弯腰鞠躬：“今天我终于也能站在你的光里看你了。”我笑着让他把花留到散场以后再送。' }] },
        { type: 'memory', title: '06 / 留在舞台之外', text: '灯光渐渐暗下来。我和他翻看今天留下的片段，笑着指给对方看那些差点没跟上的动作。', note: '不用每一秒都表现得完美。这些没有剪掉的小小停顿，也是我们的今天。' },
        { type: 'choice', title: '07 / 卸下舞台的声音', text: '成灿靠在准备室门边问：“如果我没有站在这么亮的地方，你也会看见我吗？”我想认真回答。', key: 'answer', options: [{ id: 'name', label: '我看见的是成灿，和灯有多亮没关系', response: '他安静了一会儿，笑着把通行卡放回我手里。“那今天，能不能再陪这个普通的成灿吃一顿饭？”' }, { id: 'ordinary', label: '明天换个普通的地方见面，好不好？', response: '“好啊。没有镜头，也没有倒计时。”他答得很快，“只是我们两个，想说什么就慢慢说。”' }] },
        { type: 'done', title: '08 / 灯光之外，我仍然看见你', text: '舞台上的音乐停了。我们并肩走出门，继续聊今天还没有说完的话。' }
      ]
    },
    escape: {
      title: '九号房间', subtitle: 'ROOM 09',
      description: '我和成灿走进九号房间。门在身后合上，墙上的屏幕亮了起来。九天，每天都要留下一个选择。',
      memory: './assets/date-escape-eunseok-reference.jpg', secondaryMemory: './assets/date-escape-sungchan-reference.jpg', memoryLabel: '九号房间',
      caption: '门开以后，我们在走廊站了一会儿。银硕，回去的路一起走吧。',
      nodes: [
        { type: 'line', title: 'ROOM 09 / 门内', who: 'me', text: '门合上的声音很轻。我回头看了成灿一眼，又看向墙上慢慢亮起的屏幕。', ko: '같이 들어가요.', reply: '“一起进去吧。”' },
        { type: 'roomNine', title: 'ROOM 09' },
        { type: 'done', title: '09 / 门外仍有明天', text: '门打开了。我和成灿走到走廊里，终于听见了房间外的声音。' }
      ]
    }
  };

  const emptyState = () => ({ version: 4, sessions: {}, completed: [], likes: [], comments: {} });
  const freshSession = () => ({ step: 0, choices: {}, rehearsal: [], response: '', roomChoices: [], roomIndex: 0, eraseAttempted: false, selfAttempted: false, roomResponse: '', roomComplete: false, reward: 0 });
  const restrictedRoomDays = new Set([2, 3, 5, 6, 7]);
  function restoreRoomProgress(old, saved, version, completed) {
    const choices = [];
    if (version >= 2 && Array.isArray(old.roomChoices)) {
      for (const entry of old.roomChoices.slice(0, 9)) {
        if (!['self', 'other', 'shared', 'erase'].includes(entry?.id)) break;
        if (entry.day !== undefined && entry.day !== choices.length + 1) break;
        choices.push({ id: entry.id, day: choices.length + 1 });
      }
    }
    const rawIndex = Number.isInteger(old.roomIndex) ? Math.max(0, Math.min(8, old.roomIndex)) : 0;
    const confirmed = choices.length > 0 && (rawIndex === choices.length - 1 || choices.length === 9);
    saved.roomChoices = choices;
    saved.roomIndex = Math.min(8, confirmed ? choices.length - 1 : choices.length);
    saved.roomComplete = old.roomComplete === true && (choices.length === 9 || completed);
    saved.roomResponse = confirmed && !saved.roomComplete ? '选择已确认。' : '';
    const sameDay = rawIndex === saved.roomIndex && !saved.roomResponse;
    saved.eraseAttempted = sameDay && version >= 4 && old.eraseAttempted === true;
    saved.selfAttempted = sameDay && restrictedRoomDays.has(saved.roomIndex + 1) && old.selfAttempted === true;
    if (saved.roomComplete) saved.step = 2;
    if (saved.step === 2 && !saved.roomComplete && !completed) saved.step = choices.length ? 1 : 0;
    if (saved.step === 0 && choices.length) saved.step = saved.roomComplete ? 2 : 1;
  }
  function load() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (!parsed || ![1, 2, 3, 4].includes(parsed.version)) return emptyState();
      const result = emptyState();
      for (const id of chapterIds) {
        const old = parsed.sessions?.[id];
        if (old && Number.isInteger(old.step) && old.step >= 0 && old.step < stories[id].nodes.length) {
          result.sessions[id] = {
            step: old.step,
            choices: old.choices && typeof old.choices === 'object' ? old.choices : {},
            rehearsal: Array.isArray(old.rehearsal) ? old.rehearsal.filter(x => ['breathe', 'raise', 'turn'].includes(x)).slice(0, 3) : [],
            response: typeof old.response === 'string' ? old.response.slice(0, 250) : '',
            roomChoices: [], roomIndex: 0, eraseAttempted: false, selfAttempted: false, roomResponse: '', roomComplete: false,
            reward: Number.isInteger(old.reward) && old.reward >= 0 && old.reward <= (parsed.version >= 4 ? 20 : parsed.version < 3 && id === 'escape' ? 15 : 5) ? old.reward : 0
          };
          if (id === 'escape') restoreRoomProgress(old, result.sessions[id], parsed.version, Array.isArray(parsed.completed) && parsed.completed.includes(id));
        }
        if (typeof parsed.comments?.[id] === 'string') result.comments[id] = parsed.comments[id].slice(0, 100);
      }
      for (const key of ['completed', 'likes']) result[key] = Array.isArray(parsed[key]) ? parsed[key].filter(id => chapterIds.includes(id)) : [];
      return result;
    } catch (_) { return emptyState(); }
  }
  const state = load();
  let activeId = null;
  let initialized = false;
  function persist() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (_) {} }
  function session(id = activeId) {
    if (!state.sessions[id]) state.sessions[id] = freshSession();
    return state.sessions[id];
  }
  function nodeText(text, s) { return typeof text === 'function' ? text(s) : text || ''; }
  function element(tag, text, className) {
    const node = document.createElement(tag);
    if (text) node.textContent = text;
    if (className) node.className = className;
    return node;
  }
  function button(label, id, handler, className = 'date-primary') {
    const node = element('button', label, className);
    node.type = 'button';
    if (id) node.id = id;
    node.addEventListener('click', handler);
    return node;
  }
  function isCurrent(id, step) {
    return activeId === id && session(id).step === step && document.getElementById('dates').classList.contains('active') && !document.getElementById('dateDetail').hidden;
  }
  function advance(id, expected) {
    if (!isCurrent(id, expected)) return;
    const s = session(id);
    s.step = Math.min(s.step + 1, stories[id].nodes.length - 1);
    s.response = '';
    if (stories[id].nodes[s.step].type === 'done') complete(id);
    persist(); render();
  }
  function complete(id) {
    const s = session(id);
    s.reward = 0;
    if (!state.completed.includes(id) && !completedDates.has(id)) {
      state.completed.push(id);
      completedDates.add(id);
      storeDateList('maque_dates_completed', completedDates);
      persist();
      const before = affection;
      if (typeof window.grantMaqueAffection === 'function') window.grantMaqueAffection(20);
      else increaseAffection();
      s.reward = affection - before;
      announceFeature('Instagram · 新的约会日记', '成灿把今天的小事写进了动态。');
    } else if (!state.completed.includes(id)) state.completed.push(id);
    window.MaqueSequel?.onDateComplete?.(id);
  }
  function render() {
    if (!activeId) return;
    const id = activeId, story = stories[id], s = session(id), step = s.step, node = story.nodes[step];
    const box = document.getElementById('dateDetailContent');
    const scene = dateScenes.find(item => item.id === id);
    box.replaceChildren(); box.className = 'immersive-story extra-date extra-date-' + id;
    box.dataset.extraScene = id; box.dataset.extraStep = String(s.step); box.dataset.extraType = node.type;
    const wallpaper = element('div', '', 'date-scene-wallpaper');
    const wallImage = element('img'); wallImage.src = scene.photos[0].src; wallImage.alt = ''; wallpaper.append(wallImage); box.append(wallpaper);
    if (node.type !== 'roomNine') box.append(element('p', story.subtitle, 'date-eyebrow'));
    const visual = element('div', '', 'date-stage-visual extra-date-visual');
    const picture = element('img'); picture.src = scene.photos[0].src; picture.alt = scene.photos[0].alt; visual.append(picture);
    visual.append(element('span', node.type === 'roomNine' ? 'ROOM 09' : node.title, 'date-stage-label')); box.append(visual);
    const progress = element('div', '', 'extra-date-progress'); progress.setAttribute('aria-label', node.type === 'roomNine' ? `第 ${s.roomIndex + 1} 天，共 9 天` : `约会进度，第 ${s.step + 1} 步，共 ${story.nodes.length} 步`);
    const progressItems = node.type === 'roomNine' ? Array(9).fill(null) : story.nodes;
    progressItems.forEach((_, index) => { const mark = element('span', '', index <= (node.type === 'roomNine' ? s.roomIndex : s.step) ? 'is-visited' : ''); progress.append(mark); }); box.append(progress);
    const identity = getDatePhoto();
    if (identity && id !== 'escape') {
      const chip = element('div', '', 'date-player-chip'), avatar = element('img');
      avatar.src = photoURL(identity); avatar.alt = '我的形象'; chip.append(avatar, element('span', '银硕 · 我的形象')); box.append(chip);
    }
    if (node.type === 'line') {
      const dialogue = element('div', '', 'date-story');
      dialogue.append(element('p', node.who === 'me' ? 'EUNSEOK / 我' : 'SUNGCHAN, TO YOU', 'date-story-label'));
      if (node.ko) { const ko = element('p', node.ko, 'date-story-ko'); ko.lang = 'ko'; dialogue.append(ko); }
      dialogue.append(element('p', nodeText(node.text, s), 'date-story-cn'));
      if (node.reply) dialogue.append(element('p', node.reply, 'date-story-cn'));
      box.append(dialogue, button('继续 →', 'extraDateNext', () => advance(id, step)));
    } else if (node.type === 'choice') renderChoice(box, id, s, node);
    else if (node.type === 'roomNine') renderRoomNine(box, id, s, node);
    else if (node.type === 'ball') renderBall(box, id, s, node);
    else if (node.type === 'rehearsal') renderRehearsal(box, id, s, node);
    else if (node.type === 'clue') {
      box.append(element('p', node.text, 'date-detail-copy'));
      const cards = element('div', '', 'extra-number-cards');
      for (const [label, code] of node.cards) { const card = element('div'); card.append(element('small', label), element('strong', code)); cards.append(card); }
      box.append(cards, element('p', node.note, 'extra-date-note'), button('记住号码，去门边看看 →', 'extraDateNext', () => advance(id, s.step)));
    } else if (node.type === 'puzzle') renderPuzzle(box, id, s, node);
    else if (node.type === 'memory') {
      box.append(element('p', node.text, 'date-detail-copy'));
      appendMemory(box, story);
      box.append(element('p', node.note, 'extra-date-note'), button('继续 →', 'extraDateNext', () => advance(id, s.step)));
    } else if (node.type === 'done') renderDone(box, id, s, node);
    if (node.type !== 'done') box.append(element('p', '离开时会记住进度。下一次，可以从这里继续。', 'extra-save-note'));
    view('dates'); showDatePane('dateDetail');
  }
  function renderChoice(box, id, s, node) {
    const step = s.step;
    box.append(element('p', node.text, 'date-detail-copy'));
    if (s.response) {
      const response = element('div', '', 'date-story');
      response.append(element('p', 'SUNGCHAN, TO YOU', 'date-story-label'), element('p', s.response, 'date-story-cn'));
      box.append(response, button('继续 →', 'extraDateNext', () => advance(id, step)));
      return;
    }
    const choices = element('div', '', 'date-options'); choices.id = 'extraDateChoices';
    for (const choice of node.options) {
      const option = button(choice.label, '', () => {
        if (!isCurrent(id, step) || s.response) return;
        s.choices[node.key] = choice.id; s.response = choice.response; persist(); render();
      }, 'extra-date-choice');
      option.dataset.choice = choice.id; choices.append(option);
    }
    box.append(choices);
  }
  const roomTasks = [
    '拥抱 · 不少于 120 秒',
    '修剪头发 · 长度不超过 1cm',
    '耳光 · 直至脸颊肿胀',
    '对视 · 15 秒',
    '采血 · 600ml',
    '留下创口 · 长度不少于 10mm，深度不少于 4mm',
    '掌心的钢钉',
    '双侧耳垂穿刺',
    '说出此刻最恨的人，以及最害怕的事'
  ];
  function renderRoomNine(box, id, s, node) {
    const round = Math.min(s.roomIndex, 8), day = round + 1;
    const isDay = () => session(id) === s && isCurrent(id, 1) && s.roomIndex === round;
    box.append(element('p', `第 ${String(day).padStart(2,'0')} / 09 天`, 'room-nine-day'));
    box.append(element('h3', roomTasks[round], 'room-nine-task'));
    if (s.roomResponse) {
      const result = element('div', '', 'room-nine-result');
      result.append(element('p', s.roomResponse));
      const next = button(day === 9 ? '走出房间 →' : '继续下一天 →', 'roomNineContinue', () => {
        if (!isDay() || !s.roomResponse) return;
        s.roomResponse = '';
        if (s.roomIndex >= 8) { s.roomComplete = true; advance(id, s.step); return; }
        s.roomIndex = s.roomChoices.length; s.eraseAttempted = false; s.selfAttempted = false; persist(); render();
      });
      result.append(next); box.append(result); return;
    }
    const opts = element('div', '', 'room-nine-options');
    const options = [
      ['other', '让成灿承受伤害'],
      ['self', '我独自承受伤害'],
      ['erase', '二人都失去一段共同的记忆']
    ];
    for (const [choice, label] of options) {
      if (choice === 'self' && restrictedRoomDays.has(day) && s.selfAttempted) continue;
      const control = button(label, '', () => {
        if (!isDay() || s.roomResponse || s.roomChoices.length !== round) return;
        if (choice === 'erase') { s.eraseAttempted = true; persist(); render(); return; }
        if (choice === 'self' && restrictedRoomDays.has(day)) {
          s.selfAttempted = true; persist(); render();
          requestAnimationFrame(() => box.querySelector('[data-choice="other"]')?.focus({ preventScroll: true }));
          return;
        }
        s.roomChoices.push({ id: choice, day });
        s.roomResponse = '选择已确认。';
        persist(); render();
      }, 'room-nine-choice'); control.dataset.choice = choice; opts.append(control);
      if (choice === 'erase' && s.eraseAttempted) { control.disabled = true; control.classList.add('is-locked'); control.setAttribute('aria-describedby', 'roomNineMemoryLock'); }
    }
    box.append(opts);
    if (s.eraseAttempted) { const note = element('p', '不可以。', 'room-nine-lock-note'); note.id = 'roomNineMemoryLock'; note.setAttribute('role', 'status'); box.append(note); }
  }
  function renderBall(box, id, s, node) {
    const step = s.step;
    box.append(element('p', node.text, 'date-detail-copy'));
    const field = element('div', '', 'extra-football-field');
    field.append(element('div', s.choices.play === 'shoot' ? '成灿守着的小球门' : '成灿 · 我会接住的', 'extra-football-goal'));
    const ball = button('', 'extraDateBall', () => {
      if (!isCurrent(id, step) || ball.disabled) return;
      ball.disabled = true; field.classList.add('is-kicked');
      const result = element('p', s.choices.play === 'shoot' ? '球沿着草地滚向他，轻轻擦过鞋边。' : '球滚向成灿。他抬起脚，稳稳停住了它。', 'extra-ball-feedback');
      result.setAttribute('role', 'status'); box.append(result, button('看看他的反应 →', 'extraDateNext', () => advance(id, step)));
    }, 'extra-football-ball');
    ball.setAttribute('aria-label', s.choices.play === 'shoot' ? '踢球射门' : '把球传给成灿');
    ball.innerHTML = '<svg viewBox="0 0 80 80" aria-hidden="true"><circle cx="40" cy="40" r="36" fill="#fffaf0" stroke="#77786b" stroke-width="2"/><path d="m40 23 16 12-6 18H30l-6-18zM16 15l12 6-3 14-17 2M64 15l-12 6 4 14 16 2M20 64l10-11 10 8v15M60 64 50 53 40 61" fill="#686c61" stroke="#686c61" stroke-width="2"/></svg>';
    field.append(ball); box.append(field);
  }
  function renderRehearsal(box, id, s, node) {
    const step = s.step, order = ['breathe', 'raise', 'turn'];
    const labels = { breathe: '呼吸', raise: '抬手', turn: '转身' };
    box.append(element('p', node.text, 'date-detail-copy'), element('p', node.hint, 'extra-rehearsal-note'));
    const progress = element('p', '', 'extra-rehearsal-status'); progress.id = 'extraDateRhythmStatus'; progress.setAttribute('role', 'status');
    const setProgress = () => { progress.textContent = s.rehearsal.length ? s.rehearsal.map(item => labels[item]).join(' → ') + (s.rehearsal.length === 3 ? ' · 合拍了！' : ' → …') : '准备好了，就从第一个动作开始。'; };
    setProgress(); box.append(progress);
    const choices = element('div', '', 'extra-rehearsal-controls');
    for (const key of ['turn', 'breathe', 'raise']) {
      const control = button(labels[key], '', () => {
        if (!isCurrent(id, step) || s.rehearsal.length === 3) return;
        if (order[s.rehearsal.length] !== key) {
          s.rehearsal = []; persist(); setProgress(); progress.textContent = '没关系，再一起数一遍：呼吸 → 抬手 → 转身。';
          return;
        }
        s.rehearsal.push(key); persist(); setProgress();
        if (s.rehearsal.length === 3) {
          choices.querySelectorAll('button').forEach(item => { item.disabled = true; });
          box.append(button('和他击掌，完成排练 →', 'extraDateNext', () => advance(id, step)));
        }
      }, 'extra-rehearsal-button');
      control.dataset.move = key; control.disabled = s.rehearsal.length === 3; choices.append(control);
    }
    box.append(choices);
    if (s.rehearsal.length === 3) box.append(button('和他击掌，完成排练 →', 'extraDateNext', () => advance(id, step)));
  }
  function renderPuzzle(box, id, s, node) {
    const step = s.step;
    box.append(element('p', node.text, 'date-detail-copy'));
    const form = element('form', '', 'extra-date-lock');
    const label = element('label', '门锁密码'); label.htmlFor = 'extraDatePuzzle';
    const input = element('input'); input.id = 'extraDatePuzzle'; input.type = 'text'; input.inputMode = 'numeric'; input.pattern = '[0-9０-９]{4}'; input.maxLength = 4; input.autocomplete = 'off'; input.placeholder = '四位数字'; input.required = true;
    const status = element('p', '', 'extra-puzzle-status'); status.id = 'extraDatePuzzleStatus'; status.setAttribute('role', 'status');
    const submit = button('一起打开这扇门', 'extraDateSubmit', () => {}); submit.type = 'submit';
    form.addEventListener('submit', event => {
      event.preventDefault(); if (!isCurrent(id, step)) return;
      const answer = input.value.trim().replace(/[０-９]/g, value => String(value.charCodeAt(0) - 0xFF10));
      if (answer !== node.answer) { status.textContent = '门锁没有打开。号码卡还在，我们可以慢慢再试一次。'; input.setAttribute('aria-invalid', 'true'); return; }
      s.choices.door = answer; advance(id, step);
    });
    form.append(label, input, submit, status); box.append(form);
    box.append(button('再看看号码卡 / 提示', 'extraDateHint', () => {
      status.textContent = node.hint; input.removeAttribute('aria-invalid');
    }, 'date-inline-link'));
  }
  function appendMemory(box, story) {
    const gallery = element('div', '', 'extra-date-memories');
    for (const src of [story.memory, story.secondaryMemory].filter(Boolean)) {
      const figure = element('figure'), img = element('img'); img.src = src; img.alt = story.memoryLabel; img.loading = 'lazy'; figure.append(img); gallery.append(figure);
    }
    box.append(gallery, element('p', story.memoryLabel, 'extra-memory-label'));
  }
  function renderDone(box, id, s, node) {
    const result = element('div', '', 'extra-date-result'); result.id = 'extraDateResult';
    const room = id === 'escape' ? s.roomChoices || [] : [];
    let roomEnding = node.text;
    if (id === 'escape') {
      const count = key => room.filter(item => item.id === key).length;
      if (count('self') >= 7) roomEnding = '门开了。成灿扶住门，等我走到他身边，才和我一起走出去。';
      else if (count('other') >= 5) roomEnding = '门开后，我们坐在走廊的长椅上。过了很久，成灿轻轻握住了我的手。';
    }
    result.append(element('h2', stories[id].title), element('p', roomEnding, 'date-detail-copy'));
    appendMemory(result, stories[id]);
    result.append(element('p', s.reward ? `♡ +${s.reward}% · 这次约会已珍藏` : '♡ 这份回忆已经珍藏，重温不重复增加好感', 'date-reward'));
    result.append(button('看看他的 Instagram 日记 ↗', '', () => openApp('instagram')));
    result.append(button('重温这次约会', 'extraDateRestart', () => {
      state.sessions[id] = freshSession(); persist(); render();
    }, 'date-inline-link'));
    result.append(button('回到约会邀请', '', showDateCatalog, 'date-inline-link')); box.append(result);
  }
  function canStart(id) { return id !== 'escape' || ['baseball','football','idol'].every(key => completedDates.has(key)); }
  function renderEntryControls(box, id) {
    if (id !== 'escape') return false;
    const saved = state.sessions[id];
    const hasSavedDay = saved && saved.step > 0;
    const entry = element('div', '', 'room-nine-entry');
    if (hasSavedDay) {
      entry.append(element('p', saved.step === 2 ? '九天的记录已珍藏。' : `已保存至第 ${String(saved.roomIndex + 1).padStart(2, '0')} / 09 天${saved.roomResponse ? ' · 选择已确认' : ''}`, 'room-nine-saved-day'));
    }
    entry.append(button('从第一天开始', 'roomNineStart', () => start(id, true)));
    if (hasSavedDay) entry.append(button(saved.step === 2 ? '查看已珍藏的记录' : `继续第 ${String(saved.roomIndex + 1).padStart(2, '0')} 天`, 'roomNineResume', () => start(id), 'date-secondary'));
    box.append(entry); return true;
  }
  function start(id, restart = false) {
    if (!chapterIds.includes(id) || !canStart(id)) return false;
    if (affection < 5 || !hasDatePhoto()) return false;
    if (restart) state.sessions[id] = freshSession();
    activeId = id; activeDateId = id; dateSession++; session(id); persist(); render(); return true;
  }
  function renderInstagram() {
    const feed = document.getElementById('insFeed');
    if (!feed) return;
    feed.querySelectorAll('[data-extra-date-post]').forEach(item => item.remove());
    if (state.completed.length) feed.querySelector('.ins-empty')?.remove();
    for (const id of [...state.completed].reverse()) {
      const story = stories[id];
      if (!story) continue;
      const post = element('article', '', 'ins-post extra-date-post'); post.dataset.extraDatePost = id;
      const header = element('div', '', 'ins-post-header'), portrait = element('img');
      portrait.src = getInstagramAvatar(); portrait.alt = '成灿';
      const name = element('div'); name.append(element('b', 'sungchan'), element('small', story.subtitle)); header.append(portrait, name, element('span', '···')); post.append(header);
      const media = element('div', '', 'ins-photo'); const image = element('img', '', 'ins-post-image'); image.src = story.memory; image.alt = story.memoryLabel; media.append(image); post.append(media);
      const actions = element('div', '', 'ins-actions');
      const like = button(state.likes.includes(id) ? '♥' : '♡', '', () => {
        state.likes = state.likes.includes(id) ? state.likes.filter(item => item !== id) : [...state.likes, id]; persist();
        like.textContent = state.likes.includes(id) ? '♥' : '♡'; like.setAttribute('aria-pressed', String(state.likes.includes(id)));
      }, '');
      like.setAttribute('aria-label', '喜欢这条约会日记'); like.setAttribute('aria-pressed', String(state.likes.includes(id)));
      const revisit = button('↗', '', () => { view('dates'); showDateDetail(id); }, ''); revisit.setAttribute('aria-label', '重温' + dateScenes.find(item => item.id === id).label);
      actions.append(like, revisit); post.append(actions);
      const caption = element('div', '', 'ins-caption'); caption.append(element('b', 'sungchan'), element('p', story.caption, 'cn'), element('small', 'SAMSARA · 约会日记')); post.append(caption);
      const comments = element('div', '', 'extra-date-comments');
      if (state.comments[id]) {
        comments.append(element('p', '我：' + state.comments[id]), element('p', 'sungchan：好。下一次，也把想做的事慢慢告诉我。'));
      } else {
        const comment = button('回复：下次也一起吧', '', () => { state.comments[id] = '下次也一起吧。'; persist(); renderInstagram(); }, 'date-inline-link');
        comment.setAttribute('aria-label', '回复这条约会日记'); comments.append(comment);
      }
      post.append(comments); feed.append(post);
    }
  }
  function init() {
    if (initialized) return; initialized = true;
    for (const id of chapterIds) {
      const scene = dateScenes.find(item => item.id === id);
      if (scene) { scene.ready = id !== 'escape' || canStart(id); scene.description = stories[id].description; }
      if (state.completed.includes(id)) completedDates.add(id);
      else if (completedDates.has(id)) state.completed.push(id);
    }
    persist();
  }
  window.MaqueExtraDates = { init, start, canStart, renderEntryControls, renderInstagram, hasProgress: id => Boolean(state.sessions[id]?.step), isComplete: id => state.completed.includes(id) };
})();
