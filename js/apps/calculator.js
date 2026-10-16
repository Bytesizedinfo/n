/* Calculator — iOS 18-style basic + scientific calculator. Reference app: shows the JC.app() pattern. */
(function () {
  'use strict';
  const { h } = JC;

  // ── safe expression evaluator (shunting-yard; no eval) ─────────────
  const PREC = { '+': 1, '−': 1, '×': 2, '÷': 2, '^': 3 };
  const FUNCS = {
    sin: (x, deg) => Math.sin(deg ? (x * Math.PI) / 180 : x),
    cos: (x, deg) => Math.cos(deg ? (x * Math.PI) / 180 : x),
    tan: (x, deg) => Math.tan(deg ? (x * Math.PI) / 180 : x),
    ln: (x) => Math.log(x),
    log: (x) => Math.log10(x),
    '√': (x) => Math.sqrt(x),
  };
  function tokenize(s) {
    const out = [];
    let i = 0;
    while (i < s.length) {
      const c = s[i];
      if (/[0-9.]/.test(c)) {
        let j = i;
        while (j < s.length && /[0-9.]/.test(s[j])) j++;
        out.push({ t: 'n', v: parseFloat(s.slice(i, j)) });
        i = j;
      } else if (c === 'π') { out.push({ t: 'n', v: Math.PI }); i++; }
      else if (c === 'e' && s.slice(i, i + 1) === 'e' && !/[a-z]/.test(s[i + 1] || '')) { out.push({ t: 'n', v: Math.E }); i++; }
      else if ('+−×÷^'.includes(c)) { out.push({ t: 'o', v: c }); i++; }
      else if (c === '(' || c === ')') { out.push({ t: c }); i++; }
      else if (c === '%') { out.push({ t: 'pct' }); i++; }
      else if (c === '!') { out.push({ t: 'fact' }); i++; }
      else {
        const m = s.slice(i).match(/^(sin|cos|tan|ln|log|√)/);
        if (m) { out.push({ t: 'f', v: m[1] }); i += m[1].length; } else i++;
      }
    }
    // unary minus → (0 − x)
    const res = [];
    out.forEach((tk, k) => {
      const prev = res[res.length - 1];
      if (tk.t === 'o' && tk.v === '−' && (!prev || prev.t === 'o' || prev.t === '(' || prev.t === 'f')) res.push({ t: 'n', v: 0 });
      res.push(tk);
    });
    return res;
  }
  function fact(n) {
    if (n < 0 || n > 170 || Math.floor(n) !== n) return NaN;
    let r = 1;
    for (let i = 2; i <= n; i++) r *= i;
    return r;
  }
  function evaluate(expr, deg) {
    const toks = tokenize(expr);
    const out = [];
    const ops = [];
    for (const tk of toks) {
      if (tk.t === 'n') out.push(tk.v);
      else if (tk.t === 'pct') out.push(out.pop() / 100);
      else if (tk.t === 'fact') out.push(fact(out.pop()));
      else if (tk.t === 'f') ops.push(tk);
      else if (tk.t === 'o') {
        while (ops.length) {
          const top = ops[ops.length - 1];
          if (top.t === 'f' || (top.t === 'o' && (PREC[top.v] > PREC[tk.v] || (PREC[top.v] === PREC[tk.v] && tk.v !== '^')))) apply(ops.pop());
          else break;
        }
        ops.push(tk);
      } else if (tk.t === '(') ops.push(tk);
      else if (tk.t === ')') {
        while (ops.length && ops[ops.length - 1].t !== '(') apply(ops.pop());
        ops.pop();
        if (ops.length && ops[ops.length - 1].t === 'f') apply(ops.pop());
      }
    }
    while (ops.length) { const o = ops.pop(); if (o.t !== '(') apply(o); }
    function apply(o) {
      if (o.t === 'f') { out.push(FUNCS[o.v](out.pop(), deg)); return; }
      const b = out.pop(), a = out.pop();
      if (a === undefined || b === undefined) { out.push(NaN); return; }
      out.push(o.v === '+' ? a + b : o.v === '−' ? a - b : o.v === '×' ? a * b : o.v === '÷' ? a / b : Math.pow(a, b));
    }
    return out.length ? out[out.length - 1] : 0;
  }
  function fmt(n) {
    if (!isFinite(n)) return 'Error';
    if (Math.abs(n) >= 1e16 || (Math.abs(n) < 1e-9 && n !== 0)) return n.toExponential(6).replace('e+', 'e');
    const r = Math.round(n * 1e10) / 1e10;
    const [i, d] = String(r).split('.');
    const grouped = Number(i).toLocaleString('en-US');
    return d ? grouped + '.' + d : (i === '-0' ? '0' : grouped);
  }

  JC.app({
    id: 'calculator',
    name: 'Calculator',
    status: 'light',
    launch(win) {
      win.body.classList.add('calc');
      let expr = '';
      let shown = '0';
      let justEval = false;
      let sci = false;
      let deg = true;
      const history = [];
      const exprEl = h('div.calc-expr');
      const out = h('div.calc-out', '0');
      const pad = h('div.calc-pad');
      const top = h('div.calc-top',
        h('div.calc-hist', { onTap: () => showHistory() }, JC.icon('list.bullet', { size: 22 })));
      win.body.append(top, h('div.calc-display', exprEl, out), pad);

      function fit() {
        const len = out.textContent.length;
        out.style.fontSize = (sci ? 64 : 86) * Math.min(1, 9 / Math.max(9, len)) + 'px';
      }
      function paint() {
        exprEl.textContent = justEval ? expr : '';
        out.textContent = shown;
        const ac = pad.querySelector('[data-k="AC"]');
        if (ac) ac.textContent = expr && !justEval ? '⌫' : 'AC';
        fit();
      }
      function preview() {
        const s = expr.replace(/[+−×÷^(]$/, '');
        try {
          const v = evaluate(s, deg);
          return isNaN(v) ? shown : fmt(v);
        } catch (e) { return shown; }
      }
      function press(k) {
        JC.audio.play('tap');
        if (k === 'AC') {
          if (expr && !justEval) { expr = expr.slice(0, -1); shown = expr ? lastNumber() || preview() : '0'; }
          else { expr = ''; shown = '0'; }
          justEval = false;
        } else if (k === '=') {
          if (!expr) return;
          let open = (expr.match(/\(/g) || []).length - (expr.match(/\)/g) || []).length;
          let full = expr + ')'.repeat(Math.max(0, open));
          const v = evaluate(full, deg);
          shown = fmt(v);
          history.unshift({ expr: full, result: shown });
          expr = full;
          justEval = true;
          if (shown === '1824' || shown === '1,824') JC.ui.toast('1,824 — A-Ling’s Lotus Leap high score', { icon: 'lotus.fill' });
          if (shown === '181,008' || shown === '181008') JC.ui.toast('That number looks familiar…', { icon: 'lock.open.fill' });
          if (/^(5,?318,?008|58,?008|80,?085)$/.test(shown.replace(/\.0+$/, ''))) JC.ui.toast('Very mature.', { icon: 'face.smiling' });
        } else if (k === '±') {
          const m = expr.match(/(−?)(\d*\.?\d+)$/);
          if (m) {
            const start = expr.length - m[0].length;
            expr = expr.slice(0, start) + (m[1] ? '' : '−') + m[2];
            shown = (m[1] ? '' : '−') + m[2];
          }
          justEval = false;
        } else if ('+−×÷^'.includes(k)) {
          if (justEval) { expr = shown.replace(/,/g, '').replace(/^-/, '−'); justEval = false; }
          if (!expr) expr = '0';
          if (/[+−×÷^]$/.test(expr)) expr = expr.slice(0, -1);
          expr += k;
        } else if (k === 'x²') { expr = wrapLast((x) => '(' + x + ')^2'); shown = preview(); }
        else if (k === 'x³') { expr = wrapLast((x) => '(' + x + ')^3'); shown = preview(); }
        else if (k === '1/x') { expr = wrapLast((x) => '1÷(' + x + ')'); shown = preview(); }
        else if (k === 'x!') { expr = wrapLast((x) => '(' + x + ')!'); shown = preview(); }
        else if (k === 'Rad' || k === 'Deg') { deg = !deg; render(); return; }
        else if (k === 'rand') { if (justEval) { expr = ''; justEval = false; } expr += String(Math.round(Math.random() * 1e6) / 1e6); shown = lastNumber(); }
        else if (['sin', 'cos', 'tan', 'ln', 'log', '√'].includes(k)) { if (justEval) { expr = ''; justEval = false; } expr += k + '('; }
        else if (k === '%') { expr += '%'; shown = preview(); }
        else {
          if (justEval) { expr = ''; justEval = false; }
          if (k === '.' && /\d*\.\d*$/.test(lastNumber())) return;
          expr += k;
          shown = /[\d.π]$/.test(expr) || k === 'e' ? (lastNumber() || preview()) : preview();
        }
        paint();
      }
      function lastNumber() {
        const m = expr.match(/(−?[\d.]+|π|e)$/);
        if (!m) return '';
        const raw = m[1];
        if (raw === 'π' || raw === 'e') return fmt(raw === 'π' ? Math.PI : Math.E);
        const [i, d] = raw.replace('−', '-').split('.');
        return (i === '' || i === '-' ? i + '0' : Number(i).toLocaleString('en-US')) + (d !== undefined ? '.' + d : '');
      }
      function wrapLast(fn) {
        if (justEval) { justEval = false; return fn(shown.replace(/,/g, '')); }
        const m = expr.match(/(\([^()]*\)|−?[\d.]+|π|e)$/);
        if (!m) return expr;
        return expr.slice(0, expr.length - m[0].length) + fn(m[0]);
      }
      function showHistory() {
        JC.ui.sheet({
          title: 'History', detent: 'medium', left: { text: 'Done' },
          right: history.length ? { text: 'Clear', bold: false, onTap: () => { history.length = 0; } } : null,
          content: () => history.length
            ? [JC.ui.list([{ rows: history.slice(0, 30).map((r) => ({ title: r.result, subtitle: r.expr, onTap: () => { expr = r.result.replace(/,/g, ''); shown = r.result; justEval = false; paint(); } })) }])]
            : [JC.ui.empty({ icon: 'clock', title: 'No History', text: 'Your calculations will appear here.' })],
        });
      }

      function key(k, cls) {
        const label = k === '÷' || k === '×' || k === '−' || k === '+' || k === '=' ? k : k;
        return h('div.calc-key', { class: cls, data: { k }, onTap: () => press(k) }, label === 'menu' ? JC.icon('calculator', { size: 30, weight: 1.6 }) : label);
      }
      function render() {
        pad.innerHTML = '';
        pad.classList.toggle('sci', sci);
        win.body.classList.toggle('sci', sci);
        if (sci) {
          const rows = [
            ['(', ')', 'x²', 'x³', '^'],
            ['1/x', '√', 'x!', 'π', 'e'],
            ['sin', 'cos', 'tan', 'ln', 'log'],
            [deg ? 'Rad' : 'Deg', 'rand', 'AC', '±', '%'],
          ];
          rows.forEach((r) => r.forEach((k) => pad.appendChild(key(k, k === 'AC' || k === '±' || k === '%' ? 'fn sm' : 'sci-k sm'))));
          const rest = [['7', '8', '9', '÷'], ['4', '5', '6', '×'], ['1', '2', '3', '−'], ['menu', '0', '.', '+']];
          rest.forEach((r, ri) => {
            r.forEach((k) => pad.appendChild(key(k, '+−×÷'.includes(k) ? 'op sm' : k === 'menu' ? 'num sm calc-menu' : 'num sm')));
            pad.appendChild(ri === 3 ? key('=', 'op sm eq') : h('div.calc-gap'));
          });
        } else {
          const rows = [['AC', '±', '%', '÷'], ['7', '8', '9', '×'], ['4', '5', '6', '−'], ['1', '2', '3', '+'], ['menu', '0', '.', '=']];
          rows.forEach((r) => r.forEach((k) => pad.appendChild(key(k, ['AC', '±', '%'].includes(k) ? 'fn' : '+−×÷='.includes(k) ? 'op' : k === 'menu' ? 'num calc-menu' : 'num'))));
        }
        const menuKey = pad.querySelector('[data-k="menu"]');
        if (menuKey) {
          menuKey.onclick = null;
          menuKey.replaceWith(h('div.calc-key.num.calc-menu' + (sci ? '.sm' : ''), {
            onTap: (e) => JC.ui.menu(e.currentTarget, [
              { text: 'Basic', icon: 'calculator', checked: !sci, onTap: () => { sci = false; render(); } },
              { text: 'Scientific', icon: 'function', checked: sci, onTap: () => { sci = true; render(); } },
              { text: 'Math Notes', icon: 'scribble', checked: false, onTap: () => JC.os.open('notes', { compose: true, title: 'Math Notes' }) },
              '-',
              { text: 'Convert', icon: 'arrow.up.arrow.down', onTap: () => convert() },
            ]),
          }, JC.icon('calculator', { size: sci ? 26 : 30, weight: 1.6 })));
        }
        paint();
      }
      function convert() {
        const v = parseFloat(shown.replace(/,/g, '')) || 0;
        JC.ui.actionSheet({
          title: 'Convert ' + shown,
          actions: [
            { text: '¥ → US$  (' + (v / 7.1).toFixed(2) + ')', onTap: () => { shown = fmt(v / 7.1); expr = String(v / 7.1); justEval = true; paint(); } },
            { text: 'km → mi  (' + (v * 0.621371).toFixed(2) + ')', onTap: () => { shown = fmt(v * 0.621371); expr = String(v * 0.621371); justEval = true; paint(); } },
            { text: 'kg → jin  (' + (v * 2).toFixed(2) + ')', onTap: () => { shown = fmt(v * 2); expr = String(v * 2); justEval = true; paint(); } },
            { text: '°C → °F  (' + (v * 1.8 + 32).toFixed(1) + ')', onTap: () => { shown = fmt(v * 1.8 + 32); expr = String(v * 1.8 + 32); justEval = true; paint(); } },
          ],
        });
      }
      JC.icon.add({ function: '<path d="M10 20c2 0 2.6-1.3 3-3.5l1.9-10c.4-2.2 1-3 3-3M8.5 9.5h8"/><path d="M14.6 13.5l5 5M19.6 13.5l-5 5"/>' });
      render();

      // copy result on long-press of the display
      JC.ui.contextMenu(out, () => ({ items: [
        { text: 'Copy', icon: 'doc.on.doc', onTap: () => { JC.util.copy(shown); JC.ui.toast('Copied', { icon: 'doc.on.doc' }); } },
        { text: 'Paste', icon: 'doc.on.doc', onTap: () => JC.ui.toast('Nothing to paste') },
      ] }));
      // physical keyboard
      const onKey = (e) => {
        if (!JC.os.isOpen('calculator') || JC.kb.visible) return;
        const map = { '*': '×', '/': '÷', '-': '−', '+': '+', Enter: '=', '=': '=', Backspace: 'AC', '%': '%', '.': '.', '(': '(', ')': ')' };
        const k = /^[0-9]$/.test(e.key) ? e.key : map[e.key];
        if (k) { e.preventDefault(); press(k); }
      };
      window.addEventListener('keydown', onKey);
      return { destroy() { window.removeEventListener('keydown', onKey); } };
    },
  });
})();
