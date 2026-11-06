/* A fictional encrypted keepsake. The author's two supplied photos stay in local assets. */
(() => {
  'use strict';
  const KEY = 'maque_memory_vault_v1';
  let state = { owned: false, opened: false };
  try { state = { ...state, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch (_) {}
  const phone = document.querySelector('.phone');
  const screen = document.createElement('section');
  screen.id = 'memoryVault'; screen.className = 'view memory-vault-screen'; screen.setAttribute('aria-label', '上锁的旧日记');
  phone.append(screen); ids.push('memoryVault');
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (_) {} };
  function syncCard() { const button=document.getElementById('vaultPurchaseButton'); if(button) button.textContent=state.owned?'打开旧日记':'购买这份旧日记'; window.MaqueRoomGiftPurchaseUnlocked?.(); }
  const el = (tag, text, cls, parent) => { const n = document.createElement(tag); if (text) n.textContent = text; if (cls) n.className = cls; if (parent) parent.append(n); return n; };
  const btn = (text, handler, cls='vault-button') => { const b=el('button',text,cls); b.type='button'; b.onclick=handler; return b; };
  function shell(title='上锁的旧日记') {
    screen.replaceChildren();
    const head=el('header',null,'vault-header',screen); const back=btn('‹',()=>view('gifts'),'vault-back'); back.setAttribute('aria-label','返回礼赠'); head.append(back,el('span',title,'',head));
    const body=el('div',null,'vault-content',screen); return body;
  }
  function purchase() {
    if (!state.owned) {
      if (!window.MaqueRoomGiftsUnlocked?.()) { explain('这份旧日记还未上架','完成棒球场约会后，可以在礼赠商店找到它。'); return; }
      if (affection < 80) { explain('尚未解锁','好感度达到 80% 后，才能购买这份旧日记。'); return; }
      state.owned=true; save(); syncCard();
    }
    openChoice();
  }
  function openChoice() {
    const body=shell(); el('p','LOCAL ONLY / ENCRYPTED COPY','vault-eyebrow',body); el('h1','一份没有寄出的旧日记','vault-title',body);
    el('p','文件日期被擦掉了。封面内侧有一道很浅的折痕，像是曾经被反复打开。','vault-copy',body);
    const warning=el('div','这份记录可能改变我对成灿的了解，也会影响最后的结局。','vault-warning',body); warning.setAttribute('role','note');
    const actions=el('div',null,'vault-actions',body);
    actions.append(btn('现在打开',confirmOpen),btn('稍后再说',()=>view('gifts'),'vault-secondary'));
    view('memoryVault');
  }
  function confirmOpen() {
    const body=shell('访问确认'); el('p','ACCESS / SECOND CONFIRMATION','vault-eyebrow',body);
    el('h1','确认打开？','vault-title',body);
    el('p','打开后，我会看到收在这里的照片、信件和消息。它们也许会改变结局。要继续吗？','vault-warning',body);
    const actions=el('div',null,'vault-actions',body);
    actions.append(btn('确认，打开文件夹',showContents),btn('取消',openChoice,'vault-secondary'));
  }
  function showContents() {
    state.opened=true; save(); const body=shell('已解密 / 只读');
    el('p','PRIVATE COLLECTION','vault-eyebrow',body);
    el('h1','我们曾经这样相爱。','vault-title',body);
    el('p','相片背面没有日期。只有一句字迹很轻的话：\n“如果有一天忘记了，就从这里重新认识我。”','vault-copy',body);
    const gallery=el('div',null,'vault-gallery',body);
    for (const [src,alt,caption] of [
      ['./assets/date-baseball-couple-1.jpg','我和成灿留下的球场合照','一起留下的合照'],
      ['./assets/date-baseball-couple-2.jpg','我和成灿留下的另一张合照','合照 · 原始文件未改写']
    ]) { const figure=el('figure',null,'',gallery),image=el('img',null,'',figure); image.src=src;image.alt=alt;image.loading='lazy';el('figcaption',caption,'',figure); }
    const letter=el('blockquote','银硕，如果你读到这里，说明有些事又被清空了。别为了证明我们相爱过，就逼自己把每一天都想起来。只要我们再次见面，你仍然可以重新选择我。','vault-letter',body);
    el('p','KakaoTalk · 新消息','vault-chat-label',body);
    const bubble=el('div','你看到那个文件夹了，对吗？','vault-chat-bubble',body); bubble.setAttribute('aria-live','polite');
    el('p','我没有问你为什么记得。我先把这一条留在这里，等你准备好了再回我。','vault-reply',body);
    const actions=el('div',null,'vault-actions',body);
    actions.append(btn('回复成灿',()=>{announceFeature('KakaoTalk · 成灿','你看到那个文件夹了，对吗？');el('p','我看完了。照片里的我们，好像真的很开心。','vault-chat-own',body);el('p','“那就够了。以后也不用照着照片里的样子生活。我们再一起拍新的。”','vault-chat-bubble',body);actions.replaceChildren(btn('记起我们，再次相爱',()=>window.MaqueSequel?.finishDiaryEnding(),'vault-button'));},'vault-secondary'));
    actions.append(btn('保留日记，回到手机',()=>view('home'),'vault-secondary'));
  }
  syncCard();
  window.MaqueMemoryVault={purchase,open:openChoice,isOwned:()=>state.owned};
})();
