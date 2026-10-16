/* JC.kb — on-screen iOS keyboard. Works with real <input>/<textarea> (inputmode=none) inside #screen. */
(function () {
  'use strict';
  const JC = (window.JC = window.JC || {});
  const { h } = JC;

  const ROWS = {
    abc: [
      ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
      ['⇧', 'z', 'x', 'c', 'v', 'b', 'n', 'm', '⌫'],
      ['123', 'space', 'return'],
    ],
    num: [
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
      ['-', '/', ':', ';', '(', ')', '¥', '&', '@', '"'],
      ['#+=', '.', ',', '?', '!', "'", '⌫'],
      ['ABC', 'space', 'return'],
    ],
    sym: [
      ['[', ']', '{', '}', '#', '%', '^', '*', '+', '='],
      ['_', '\\', '|', '~', '<', '>', '$', '€', '£', '•'],
      ['123', '.', ',', '?', '!', "'", '⌫'],
      ['ABC', 'space', 'return'],
    ],
  };
  const EMOJI = {
    'Frequently Used': ['😂', '🙄', '😤', '🙏', '😭', '❤️', '👍', '😒', '🪷', '🐶', '💜', '🔥', '😅', '🥺', '😡', '👀'],
    'Smileys & People': ['😀', '😃', '😄', '😁', '😆', '🥹', '😊', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😋', '😛', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥸', '🤩', '🥳', '😏', '😞', '😔', '😟', '😕', '🙁', '😣', '😖', '😫', '😩', '🥱', '😢', '😠', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🫡', '🤭', '🫢', '🤫', '🤥', '😶', '😐', '😑', '😬', '🫠', '🙄', '😯', '😦', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👻', '💀', '🤡', '💩', '👋', '🤚', '✋', '👌', '🤌', '✌️', '🤞', '🫶', '👏', '🙌', '💪', '🫵', '👊'],
    'Animals & Nature': ['🐶', '🐕', '🦮', '🐩', '🐱', '🐰', '🦊', '🐻', '🐼', '🐯', '🦁', '🐸', '🐔', '🐧', '🦆', '🦚', '🐟', '🐠', '🐡', '🦈', '🐢', '🐍', '🦋', '🐝', '🪷', '🌸', '🌺', '🌷', '🌹', '🥀', '🌼', '🌻', '🍀', '🍃', '🌿', '🎋', '🌕', '🌙', '⭐️', '⚡️', '🔥', '🌧️', '☔️', '🌈', '❄️', '🌊'],
    'Food & Drink': ['🍲', '🥟', '🍜', '🍚', '🍙', '🥮', '🍵', '🧋', '🍶', '🍺', '🥂', '🍷', '🍰', '🎂', '🧁', '🍡', '🥢', '🌶️', '🥕', '🥬', '🍠', '🥔', '🍑', '🍓', '🍉', '🍊', '🍋', '🍎'],
    'Objects & Symbols': ['💜', '❤️', '🧡', '💛', '💚', '💙', '🖤', '🤍', '💔', '❣️', '💕', '✨', '💯', '‼️', '⁉️', '❓', '❗️', '🚗', '🚕', '🚙', '🛞', '🔑', '🔔', '🎁', '🎈', '🎉', '📱', '💸', '🧧', '🏮', '🪭', '🎐', '🪈', '⚔️', '🛡️', '📿', '⏰', '📍', '✅', '❌', '⚠️', '🆘'],
  };
  const DICT = ('the to and you i it is that of for in me my what are on no not be your just this with do so we can get have if at all was but know im dont like ok okay go now one will its out up he about how time when why there yes yeah well good see then come home sorry thanks thank please want need tonight tomorrow sunday soup dinner car dog fairy lotus pier tea call later sure fine maybe never again really idiot ridiculous get lost stop sleep morning night lanling yunmeng gusu jiujiu jin ling wei wuxian ying lan xichen zhan wangji huaisang wen ning sizhui jingyi hotpot birthday cake bell gift brother sister uncle nephew pond koi tower hanshi meeting board ops warehouse delivery').split(' ');
  const COMPLETIONS = { wei: ['Wei', 'Wei Wuxian', 'Wei Ying'], lan: ['Lan', 'Lan Xichen', 'Lan Zhan'], jin: ['Jin', 'Jin Ling', 'jiujiu'], xi: ['Xichen', 'Xi', 'xin'], ji: ['jiujiu', 'Jin Ling', 'just'], zew: ['Zewu-jun', 'Zewu', 'zero'], hua: ['Huaisang', 'hua', 'huh'], nie: ['Nie Huaisang', 'Nie', 'niece'], idi: ['idiot', 'idea', 'idle'], ri: ['ridiculous', 'right', 'ring'] };

  let host = null; // keyboard element
  let target = null; // focused input
  let layer = 'abc';
  let shift = 1; // 0 off, 1 once, 2 caps lock
  let visible = false;
  let lastShiftTap = 0;
  let repeatT = null;
  let emojiCat = 'Frequently Used';
  let suggestOverride = null;
  const KB_H = 336;

  function isField(el) {
    return el && (el.tagName === 'TEXTAREA' || (el.tagName === 'INPUT' && !['checkbox', 'radio', 'range', 'button', 'submit'].includes(el.type))) && !el.readOnly && !el.disabled;
  }

  function insert(text) {
    if (!target) return;
    const el = target;
    const s = el.selectionStart == null ? el.value.length : el.selectionStart;
    const e = el.selectionEnd == null ? el.value.length : el.selectionEnd;
    if (el.maxLength > 0 && el.value.length - (e - s) + text.length > el.maxLength) return;
    el.setRangeText(text, s, e, 'end');
    el.dispatchEvent(new Event('input', { bubbles: true }));
    autoShift();
    renderSuggest();
  }

  function backspace() {
    if (!target) return;
    const el = target;
    let s = el.selectionStart, e = el.selectionEnd;
    if (s == null) s = e = el.value.length;
    if (s === e) {
      if (s === 0) return;
      const before = Array.from(el.value.slice(0, s));
      before.pop();
      const ns = before.join('').length;
      el.setRangeText('', ns, s, 'end');
    } else el.setRangeText('', s, e, 'end');
    el.dispatchEvent(new Event('input', { bubbles: true }));
    autoShift();
    renderSuggest();
  }

  function doReturn() {
    if (!target) return;
    const el = target;
    if (el.tagName === 'TEXTAREA' && !el.dataset.send) {
      insert('\n');
      return;
    }
    el.dispatchEvent(new CustomEvent('kbreturn', { bubbles: true }));
  }

  function autoShift() {
    if (!target || shift === 2) return;
    const v = target.value.slice(0, target.selectionStart == null ? target.value.length : target.selectionStart);
    const want = target.dataset.cap === 'none' ? false : (v.length === 0 || /[.!?]\s$/.test(v) || /\n$/.test(v));
    const ns = want ? 1 : 0;
    if (ns !== shift) {
      shift = ns;
      render();
    }
  }

  function currentWord() {
    if (!target) return '';
    const v = target.value.slice(0, target.selectionStart == null ? target.value.length : target.selectionStart);
    const m = v.match(/([A-Za-z\-']+)$/);
    return m ? m[1] : '';
  }

  function suggestions() {
    if (suggestOverride) return suggestOverride;
    const w = currentWord();
    if (!w) return [{ text: 'I' }, { text: 'What' }, { text: 'The' }];
    const lw = w.toLowerCase();
    const out = [];
    out.push({ text: '“' + w + '”', literal: true });
    const comp = COMPLETIONS[lw.slice(0, 3)];
    if (comp) comp.forEach((c) => { if (out.length < 3 && c.toLowerCase() !== lw) out.push({ text: c }); });
    for (const d of DICT) {
      if (out.length >= 3) break;
      if (d.startsWith(lw) && d !== lw && !out.find((o) => o.text.toLowerCase() === d)) out.push({ text: w[0] === w[0].toUpperCase() ? d[0].toUpperCase() + d.slice(1) : d });
    }
    while (out.length < 3) out.push({ text: '' });
    return out.slice(0, 3);
  }

  function acceptSuggestion(sg) {
    if (!target || !sg.text) return;
    if (sg.onTap) return sg.onTap();
    if (sg.literal) { insert(' '); return; }
    const w = currentWord();
    const el = target;
    const s = el.selectionStart;
    el.setRangeText(sg.text + ' ', s - w.length, s, 'end');
    el.dispatchEvent(new Event('input', { bubbles: true }));
    autoShift();
    renderSuggest();
  }

  function renderSuggest() {
    if (!host) return;
    const bar = host.querySelector('.kb-suggest');
    if (!bar) return;
    bar.innerHTML = '';
    if (layer === 'emoji') return;
    suggestions().forEach((sg, i) => {
      if (i) bar.appendChild(h('div.kb-sep'));
      bar.appendChild(h('div.kb-sg', {
        class: sg.literal ? 'lit' : '',
        onPointerdown: (e) => e.preventDefault(),
        onClick: () => { JC.audio.play('key'); acceptSuggestion(sg); },
      }, sg.text));
    });
  }

  function keyLabel(k) {
    if (k.length === 1 && /[a-z]/.test(k)) return shift ? k.toUpperCase() : k;
    return k;
  }

  function press(k, el) {
    JC.audio.haptic(5);
    if (k === '⌫') { JC.audio.play('key.delete'); backspace(); return; }
    if (k === '⇧') {
      const n = Date.now();
      if (n - lastShiftTap < 320) shift = 2;
      else shift = shift ? 0 : 1;
      lastShiftTap = n;
      JC.audio.play('key');
      render();
      return;
    }
    if (k === '123') { layer = 'num'; JC.audio.play('key'); render(); return; }
    if (k === '#+=') { layer = 'sym'; JC.audio.play('key'); render(); return; }
    if (k === 'ABC') { layer = 'abc'; JC.audio.play('key'); render(); return; }
    if (k === 'space') {
      JC.audio.play('key.space');
      // double-space → period
      if (target) {
        const v = target.value.slice(0, target.selectionStart);
        if (/[A-Za-z0-9] $/.test(v)) { target.setRangeText('. ', target.selectionStart - 1, target.selectionStart, 'end'); target.dispatchEvent(new Event('input', { bubbles: true })); autoShift(); renderSuggest(); return; }
      }
      insert(' ');
      return;
    }
    if (k === 'return') { JC.audio.play('key'); doReturn(); return; }
    JC.audio.play('key');
    const ch = keyLabel(k);
    insert(ch);
    if (shift === 1) { shift = 0; render(); }
    if (layer !== 'abc' && (k === "'" )) { layer = 'abc'; render(); }
    if (el) popup(el, ch);
  }

  function popup(el, ch) {
    if (!/^.$/u.test(ch) && ch.length > 2) return;
    const r = el.getBoundingClientRect();
    const hr = host.getBoundingClientRect();
    const sc = JC.os ? JC.os.scale : 1;
    const p = h('div.kb-pop', ch);
    p.style.left = (r.left - hr.left) / sc + r.width / sc / 2 + 'px';
    p.style.top = (r.top - hr.top) / sc + 'px';
    host.appendChild(p);
    setTimeout(() => p.remove(), 140);
  }

  function returnLabel() {
    const hint = target && (target.getAttribute('enterkeyhint') || '');
    if (hint === 'search') return 'search';
    if (hint === 'send') return 'send';
    if (hint === 'go') return 'go';
    if (hint === 'done') return 'done';
    if (hint === 'next') return 'next';
    return 'return';
  }

  function render() {
    if (!host) return;
    host.innerHTML = '';
    host.classList.toggle('emoji', layer === 'emoji');
    host.appendChild(h('div.kb-suggest'));
    const body = h('div.kb-body');
    host.appendChild(body);
    if (layer === 'emoji') {
      const grid = h('div.kb-emoji-grid');
      const title = h('div.kb-emoji-title', emojiCat.toUpperCase());
      Object.keys(EMOJI).forEach((cat) => {
        if (cat !== emojiCat) return;
        EMOJI[cat].forEach((em) => grid.appendChild(h('div.kb-emoji', {
          onPointerdown: (e) => e.preventDefault(),
          onClick: (e) => { JC.audio.play('key'); insert(em); popup(e.currentTarget, em); },
        }, em)));
      });
      const cats = h('div.kb-emoji-cats');
      cats.appendChild(h('div.kb-key.fn.abc', { onPointerdown: (e) => e.preventDefault(), onClick: () => { layer = 'abc'; render(); } }, 'ABC'));
      const icons = { 'Frequently Used': 'clock', 'Smileys & People': 'face.smiling', 'Animals & Nature': 'leaf.fill', 'Food & Drink': 'flame.fill', 'Objects & Symbols': 'heart' };
      Object.keys(EMOJI).forEach((cat) => cats.appendChild(h('div.kb-cat', {
        class: cat === emojiCat ? 'on' : '',
        onPointerdown: (e) => e.preventDefault(),
        onClick: () => { emojiCat = cat; render(); },
      }, JC.icon(icons[cat], { size: 18 }))));
      cats.appendChild(h('div.kb-key.fn.del', { onPointerdown: (e) => { e.preventDefault(); startRepeat('⌫'); }, onClick: () => {} }, JC.icon('delete.left', { size: 22 })));
      body.append(title, grid, cats);
    } else {
      const rows = ROWS[layer];
      rows.forEach((row, ri) => {
        const r = h('div.kb-row.r' + ri);
        row.forEach((k) => {
          let cls = 'kb-key';
          let content = keyLabel(k);
          if (k === '⇧') { cls += ' fn shift' + (shift ? ' on' : '') + (shift === 2 ? ' caps' : ''); content = JC.icon(shift === 2 ? 'capslock.fill' : shift ? 'shift.fill' : 'shift', { size: 20 }); }
          else if (k === '⌫') { cls += ' fn del'; content = JC.icon('delete.left', { size: 22 }); }
          else if (k === '123' || k === 'ABC' || k === '#+=') cls += ' fn mode';
          else if (k === 'space') { cls += ' space'; content = 'space'; }
          else if (k === 'return') {
            const rl = returnLabel();
            cls += ' fn ret' + (rl !== 'return' ? ' primary' : '');
            content = rl === 'send' ? JC.icon('arrow.up', { size: 18, weight: 2.4 }) : rl;
          }
          if (layer !== 'abc' && ri === 2 && k !== '⌫' && k !== '#+=' && k !== '123') cls += ' wide';
          const key = h('div', {
            class: cls,
            data: { k },
            onPointerdown: (e) => {
              e.preventDefault();
              if (k === '⌫') startRepeat('⌫', key);
            },
            onClick: (e) => { if (k !== '⌫') press(k, key); },
          }, content);
          r.appendChild(key);
        });
        body.appendChild(r);
      });
    }
    const bottom = h('div.kb-bottom');
    bottom.appendChild(h('div.kb-globe', {
      onPointerdown: (e) => e.preventDefault(),
      onClick: () => { layer = layer === 'emoji' ? 'abc' : 'emoji'; JC.audio.play('key'); render(); },
    }, layer === 'emoji' ? JC.icon('globe.simple', { size: 24 }) : JC.icon('face.smiling', { size: 26 })));
    bottom.appendChild(h('div.kb-mic', {
      onPointerdown: (e) => e.preventDefault(),
      onClick: () => JC.ui && JC.ui.toast('Dictation is off — this isn’t your voice', { icon: 'mic.slash.fill' }),
    }, JC.icon('mic', { size: 24 })));
    host.appendChild(bottom);
    renderSuggest();
  }

  function startRepeat(k, el) {
    clearTimeout(repeatT);
    press(k, el);
    let delay = 420;
    const go = () => { press(k, el); delay = Math.max(70, delay * 0.8); repeatT = setTimeout(go, delay); };
    repeatT = setTimeout(go, delay);
    const stop = () => { clearTimeout(repeatT); window.removeEventListener('pointerup', stop); window.removeEventListener('pointercancel', stop); };
    window.addEventListener('pointerup', stop);
    window.addEventListener('pointercancel', stop);
  }

  function show(el) {
    target = el;
    if (!host) return;
    layer = el.dataset.kb === 'num' ? 'num' : layer === 'emoji' ? 'emoji' : 'abc';
    shift = 0;
    autoShift();
    render();
    if (!visible) {
      visible = true;
      host.classList.add('show');
      JC.bus.emit('kb', { open: true, h: KB_H });
    }
  }

  function hide() {
    if (!visible) return;
    visible = false;
    target = null;
    suggestOverride = null;
    if (host) host.classList.remove('show');
    JC.bus.emit('kb', { open: false, h: 0 });
  }

  const kb = {
    H: KB_H,
    mount(el) {
      host = el;
      host.addEventListener('pointerdown', (e) => e.preventDefault());
      const screen = el.closest('#screen') || document;
      screen.addEventListener('focusin', (e) => {
        if (isField(e.target) && !e.target.dataset.nokb) show(e.target);
      });
      // Buttons beside a text field (send, reply suggestions) must not take focus from it, or the keyboard
      // drops after every message. Mark them, or a container around them, with data-kbkeep.
      screen.addEventListener('pointerdown', (e) => {
        if (!visible || isField(e.target)) return;
        if (e.target.closest && e.target.closest('[data-kbkeep]')) e.preventDefault();
      }, true);
      screen.addEventListener('focusout', () => {
        setTimeout(() => {
          const a = document.activeElement;
          if (!isField(a) || !screen.contains(a)) hide();
        }, 30);
      });
      // physical keyboard: animate matching key
      window.addEventListener('keydown', (e) => {
        if (!visible || !host) return;
        let k = e.key.length === 1 ? e.key.toLowerCase() : e.key === 'Backspace' ? '⌫' : e.key === 'Enter' ? 'return' : e.key === ' ' ? 'space' : null;
        if (e.key === ' ') k = 'space';
        if (!k) return;
        const node = host.querySelector(`.kb-key[data-k="${CSS.escape(k)}"]`);
        if (node) {
          node.classList.add('down');
          setTimeout(() => node.classList.remove('down'), 110);
        }
        if (JC.state.d.settings.keyClicks !== false) JC.audio.play(k === '⌫' ? 'key.delete' : k === 'space' ? 'key.space' : 'key');
        if (e.key === 'Enter' && target && (target.tagName === 'INPUT' || target.dataset.send)) {
          e.preventDefault();
          target.dispatchEvent(new CustomEvent('kbreturn', { bubbles: true }));
        }
        setTimeout(() => { autoShift(); renderSuggest(); }, 0);
      });
    },
    get visible() { return visible; },
    get target() { return target; },
    show,
    hide() {
      if (target) target.blur();
      hide();
    },
    insert,
    backspace,
    /** Replace the predictive bar with custom items [{text, onTap}] (or null to restore). */
    suggest(items) {
      suggestOverride = items;
      renderSuggest();
    },
    refresh: render,
  };
  JC.kb = kb;
})();
