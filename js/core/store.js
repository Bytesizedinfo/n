/* JC.store — app data collections. Seeds come from app files; edits persist in JC.state.d.store. */
(function () {
  'use strict';
  const JC = (window.JC = window.JC || {});
  const seeds = {};
  const TIME_KEYS = ['t', 'start', 'end', 'due', 'created'];

  function norm(item) {
    for (const k of TIME_KEYS) {
      if (typeof item[k] === 'string' && JC.time) item[k] = JC.time.parse(item[k]);
    }
    if (item.comments && Array.isArray(item.comments)) {
      item.comments.forEach((c) => { if (typeof c.t === 'string' && JC.time) c.t = JC.time.parse(c.t); });
    }
    return item;
  }

  function seedArr(col) {
    let s = seeds[col];
    if (typeof s === 'function') {
      s = seeds[col] = s();
    }
    if (!s) s = seeds[col] = [];
    if (!s.__norm) {
      s.forEach((it, i) => { if (!it.id) it.id = col + '_' + i; norm(it); });
      s.__norm = true;
    }
    return s;
  }

  function live(col) {
    const st = JC.state.d.store;
    if (!st[col]) st[col] = JSON.parse(JSON.stringify(seedArr(col)));
    return st[col];
  }

  function changed(col) {
    JC.state.save();
    JC.bus.emit('store:' + col, store.all(col));
    JC.bus.emit('store', { col });
  }

  const store = {
    seed(col, items) {
      seeds[col] = items;
    },
    hasSeed: (col) => !!seeds[col],
    all(col) {
      const st = JC.state.d.store;
      return st[col] || seedArr(col);
    },
    get(col, id) {
      return store.all(col).find((x) => x.id === id) || null;
    },
    find(col, fn) {
      return store.all(col).find(fn) || null;
    },
    filter(col, fn) {
      return store.all(col).filter(fn);
    },
    add(col, item, opts) {
      const arr = live(col);
      item = norm(Object.assign({}, item));
      if (!item.id) item.id = JC.util.uid(col);
      const i = arr.findIndex((x) => x.id === item.id);
      if (i >= 0) arr[i] = Object.assign(arr[i], item);
      else if (opts && opts.front) arr.unshift(item);
      else arr.push(item);
      changed(col);
      return item;
    },
    update(col, id, patch) {
      const arr = live(col);
      const it = arr.find((x) => x.id === id);
      if (!it) return null;
      Object.assign(it, norm(Object.assign({}, patch)));
      changed(col);
      return it;
    },
    remove(col, id) {
      const arr = live(col);
      const i = arr.findIndex((x) => x.id === id);
      if (i < 0) return false;
      arr.splice(i, 1);
      changed(col);
      return true;
    },
    set(col, arr) {
      JC.state.d.store[col] = arr.map((x) => norm(Object.assign({}, x)));
      changed(col);
    },
    reset(col) {
      delete JC.state.d.store[col];
      changed(col);
    },
    on(col, fn) {
      return JC.bus.on('store:' + col, fn);
    },
  };
  JC.store = store;
})();
