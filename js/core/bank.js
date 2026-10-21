/* JC.bank — one bank balance that every app shares (Wallet, food delivery, rides, transfers, the bank app).
   Cards and accounts come from JC.world.bank. Every movement is a `tx` record (the Wallet schema), an optional bank
   SMS (JC.world.bank.sms) and a story act: charge / decline / transfer / card_freeze. */
(function () {
  'use strict';
  const JC = (window.JC = window.JC || {});
  const U = JC.util;
  const B = () => (JC.world && JC.world.bank) || {};
  const round = (n) => Math.round(n * 100) / 100;
  const subs = new Set();

  /** persisted balances: { bal: { accountId: n } } (the main account id is 'main') */
  function st() {
    const d = JC.state.d;
    if (!d.bank || !d.bank.bal) {
      const bal = { main: Number(B().balance) || 0 };
      (B().accounts || []).forEach((a) => { if (!a.main && a.id) bal[a.id] = Number(a.balance) || 0; });
      d.bank = { bal };
    }
    return d.bank;
  }
  const cards = () => B().cards || [];
  const mainCard = () => B().main || (cards()[0] && cards()[0].id) || null;
  /** does this card draw on the bank balance? (undefined / null = the main card) */
  const isBankCard = (card) => card == null || card === mainCard() || cards().some((c) => c.id === card);
  const act = (name, p) => { try { if (JC.story && JC.story.act) JC.story.act(name, p); } catch (e) { console.error('[bank] act failed', e); } };

  function emit(kind, extra) {
    const ev = Object.assign({ kind, balance: bank.balance(), frozen: bank.frozen() }, extra || {});
    JC.bus.emit('bank', ev);
    subs.forEach((fn) => { try { fn(ev); } catch (e) { console.error('[bank] listener failed', e); } });
  }
  function sms(kind, tx) {
    const S = B().sms;
    if (!S || typeof S.text !== 'function' || !JC.story || !JC.story.incoming) return;
    if (tx.card && !isBankCard(tx.card)) return;
    let text = null;
    try { text = S.text(kind, tx); } catch (e) { text = null; }
    if (!text) return;
    try { JC.story.incoming(S.thread || 'bank', { from: S.from || S.thread || 'bank', text }); } catch (e) { /* no such thread yet */ }
  }
  function record(o, amount) {
    const tx = {
      card: o.card || mainCard(), merchant: o.merchant || 'Payment', amount, t: JC.time.now(), cat: o.cat || 'other', note: o.note || '',
      place: o.place || null, pending: !!o.pending, app: o.app || null,
    };
    if (o.contact) tx.contact = o.contact;
    if (o.supp) tx.supp = o.supp;
    try { return JC.store.add('tx', tx, { front: true }); } catch (e) { return tx; }
  }

  const bank = {
    /** balance of the main account (or of `account`) */
    balance(account) { const b = st().bal; return round(b[account || 'main'] || 0); },
    /** accounts with live balances: [{ id, name, number, balance, main }] */
    accounts() {
      return (B().accounts && B().accounts.length ? B().accounts : [{ id: 'main', name: 'Main Account', main: true }]).map((a) => Object.assign({}, a, { balance: bank.balance(a.main ? 'main' : a.id) }));
    },
    cards: () => cards().slice(),
    mainCard,
    isBankCard,
    frozen: () => !!(JC.state.d.flags && JC.state.d.flags.card_frozen),
    /** would this charge go through? → { ok, reason: 'frozen' | 'funds' } (no side effects) */
    check(o) {
      o = o || {};
      if (!isBankCard(o.card)) return { ok: true };
      if (bank.frozen()) return { ok: false, reason: 'frozen' };
      const amt = Math.abs(Number(o.amount) || 0);
      if (amt > bank.balance()) return { ok: false, reason: 'funds' };
      return { ok: true };
    },
    /** take money: { amount, merchant, app, cat, note, card, place, sms, quiet } → { ok, reason, tx } */
    charge(o) {
      o = o || {};
      const amt = round(Math.abs(Number(o.amount) || 0));
      const chk = bank.check(Object.assign({}, o, { amount: amt }));
      if (!chk.ok) {
        const info = { amount: amt, merchant: o.merchant || '', app: o.app || null, card: o.card || mainCard(), reason: chk.reason };
        if (!o.quiet) sms('decline', Object.assign({ t: JC.time.now(), card: info.card, merchant: info.merchant, sms: o.sms }, info));
        act('decline', info);
        emit('decline', info);
        return { ok: false, reason: chk.reason };
      }
      const tx = record(o, amt);
      if (isBankCard(tx.card)) { st().bal.main = round(st().bal.main - amt); JC.state.save(); }
      if (!o.quiet) sms('charge', Object.assign({}, tx, { sms: o.sms }));
      act('charge', { amount: amt, merchant: tx.merchant, app: tx.app, cat: tx.cat, card: tx.card, tx: tx.id, balance: bank.balance() });
      emit('charge', { tx });
      JC.bus.emit('wallet:tx', tx);
      return { ok: true, tx };
    },
    /** put money back (refunds, incoming transfers): same fields as charge → { ok, tx } */
    credit(o) {
      o = o || {};
      const amt = round(Math.abs(Number(o.amount) || 0));
      const tx = record(o, -amt);
      if (isBankCard(tx.card)) { st().bal.main = round(st().bal.main + amt); JC.state.save(); }
      if (!o.quiet) sms('credit', Object.assign({}, tx, { sms: o.sms }));
      emit('credit', { tx });
      JC.bus.emit('wallet:tx', tx);
      return { ok: true, tx };
    },
    /** send money to a contact (or any payee name): { to, amount, memo } → { ok, reason, tx } */
    transfer(o) {
      o = o || {};
      const c = o.to && JC.contacts ? JC.contacts.get(o.to) : null;
      const name = c ? JC.contacts.short(o.to) : String(o.toName || o.to || 'Payee');
      const r = bank.charge({ amount: o.amount, merchant: 'Transfer to ' + name, app: o.app || 'bank', cat: 'transfer', note: o.memo || '', contact: c ? o.to : undefined, card: mainCard(), quiet: o.quiet });
      if (r.ok) act('transfer', { to: o.to, amount: round(Math.abs(Number(o.amount) || 0)), memo: o.memo || '' });
      return r;
    },
    /** freeze / unfreeze the bank's cards (sets flag card_frozen, act card_freeze) */
    freeze(on) {
      on = !!on;
      if (on === bank.frozen()) return on;
      if (JC.story && JC.story.applyFx) JC.story.applyFx({ set: { card_frozen: on } }); // story:fx → emit('freeze')
      else { JC.state.d.flags.card_frozen = on; emit('freeze', { on }); }
      act('card_freeze', { on });
      return on;
    },
    /** listen for every change: fn({ kind: 'charge'|'decline'|'credit'|'freeze', balance, frozen, tx?, reason? }) → unsubscribe */
    on(fn) { subs.add(fn); return () => subs.delete(fn); },
    fmt: (n) => U.fmtMoney(n),
    /** human text for a decline reason */
    reasonText: (r) => (r === 'frozen' ? 'This card is frozen. Unfreeze it in your bank app to pay.' : 'Insufficient funds. Your balance is ' + U.fmtMoney(bank.balance()) + '.'),
  };
  JC.bank = bank;
  // a scene can freeze the card with fx { set: { card_frozen: true } }; keep listeners in sync
  JC.bus.on('story:fx', (fx) => { if (fx && fx.set && 'card_frozen' in fx.set) emit('freeze', { on: !!fx.set.card_frozen }); });
})();
