/* Contacts in Jiang Cheng's phone. Facts: docs/STORY.md */
(function () {
  'use strict';
  const JC = (window.JC = window.JC || {});
  const list = [];
  const byId = {};

  const GRAY = ['#a5abb9', '#858994'];

  function def(c) {
    c.phones = c.phones || [];
    c.emails = c.emails || [];
    c.related = c.related || [];
    c.idle = c.idle || [];
    c.avatar = c.avatar || { initials: ((c.first || '')[0] || '') + ((c.last || '')[0] || ''), grad: GRAY };
    if (!c.display) c.display = [c.first, c.last].filter(Boolean).join(' ');
    list.push(c);
    byId[c.id] = c;
    return c;
  }

  JC.contacts = {
    def,
    get: (id) => byId[id] || null,
    all: () => list.slice(),
    people: () => list.filter((c) => !c.service),
    name: (id) => (id === 'me' ? 'Jiang Cheng' : byId[id] ? byId[id].display : id),
    // full real name in Chinese order ("Jin Ling"); falls back to first + last
    full: (id) => {
      if (id === 'me') return 'Jiang Cheng';
      const c = byId[id];
      return c ? c.real || [c.first, c.last].filter(Boolean).join(' ') || c.display : id;
    },
    // Chinese-order name used in prose ("Wei Wuxian"), e.g. for captions
    real: (id) => (byId[id] && byId[id].real) || JC.contacts.full(id),
    short: (id) => {
      const c = byId[id];
      if (!c) return id;
      return c.short || c.display.replace(/\s*\(.*\)$/, '');
    },
  };

  JC.me = {
    id: 'me', first: 'Cheng', last: 'Jiang', real: 'Jiang Cheng', display: 'Jiang Cheng', nick: 'Wanyin',
    phones: [{ label: 'mobile', num: '+86 555 0716 0515' }],
    emails: [{ label: 'work', addr: 'jiang.cheng@lotuspier.yunmeng' }],
    bday: '1992-05-15', company: 'Yunmeng Jiang Group', title: 'Chief Executive Officer',
    avatar: { initials: 'JC', grad: ['#8e6bd8', '#5b3fa6'] },
  };

  // ── Family & friends ─────────────────────────────────────────────
  def({
    id: 'wwx', first: 'Wuxian', last: 'Wei', real: 'Wei Wuxian', display: '🐶 DO NOT ANSWER', short: 'Wei Wuxian', nick: 'Wei Ying',
    avatar: { emoji: '🐶', grad: ['#ffd8a8', '#ff922b'] },
    phones: [{ label: 'mobile', num: '+86 555 1031 0031' }],
    emails: [{ label: 'home', addr: 'weiying@radish.yiling' }],
    bday: '1992-10-31', company: 'Yiling Radish Co.', title: 'Founder, Chief Radish Officer',
    address: 'The Jingshi, Cloud Recesses, Gusu',
    notes: 'Do not give him the Wi-Fi password. Do not lend him the car. Do not answer after midnight.',
    related: [{ label: 'brother', id: 'me' }, { label: 'spouse', id: 'lwj' }],
    color: '#f76707', wavelet: 'yiling_radish_king', fav: false, dial: 'answer',
    voicemail: "Heyyy you've reached Wei Ying! I'm probably in a radish field. Or asleep. Leave a message! Unless you're Jiang Cheng, then— no, wait, Jiang Cheng, leave a message too!",
  });
  def({
    id: 'jl', first: 'Ling', last: 'Jin', real: 'Jin Ling', display: 'A-Ling', short: 'Jin Ling', nick: 'Rulan',
    avatar: { art: 'av_jl', initials: 'JL', grad: ['#ffd43b', '#f59f00'] },
    phones: [{ label: 'mobile', num: '+86 555 1018 2008' }],
    emails: [{ label: 'school', addr: 'rulan.jin@lanling-intl.lanling' }],
    bday: '2008-10-18', company: 'Jin Group', title: 'Heir (allegedly)',
    address: 'Koi Tower Residences, Lanling',
    notes: 'Allergic to: nothing. Afraid of: nothing (lie). Fairy’s vet: Dr. Fang, Lanling Pet Hospital.',
    related: [{ label: 'nephew', id: 'me' }],
    color: '#e8a400', wavelet: 'rulan_jin', fav: true, dial: 'answer',
    voicemail: "it's jin ling. leave a message. or don't. wtv.",
  });
  def({
    id: 'lxc', first: 'Xichen', last: 'Lan', real: 'Lan Xichen', display: 'Zewu-jun', short: 'Lan Xichen', nick: 'Lan Huan',
    avatar: { art: 'av_lxc', initials: 'LX', grad: ['#d0ebff', '#74c0fc'] },
    phones: [{ label: 'mobile', num: '+86 555 0903 1989' }, { label: 'Hanshi', num: '+86 555 0512 0001' }],
    emails: [{ label: 'work', addr: 'chancellor@cloudrecesses.gusu' }],
    bday: '1989-09-03', company: 'Gusu Lan Academy', title: 'Chancellor',
    address: 'The Hanshi, Cloud Recesses, Gusu',
    notes: 'White peony. 85°C. No sugar.',
    related: [{ label: 'brother', id: 'lwj' }],
    color: '#1c7ed6', wavelet: 'zewujun', fav: false, dial: 'answer',
    voicemail: "You've reached Lan Xichen. I'm sorry I can't come to the phone. Please leave a message and I will return your call.",
  });
  def({
    id: 'lwj', first: 'Wangji', last: 'Lan', real: 'Lan Wangji', display: 'Lan Wangji', nick: 'Lan Zhan',
    avatar: { initials: 'LW', grad: ['#e7f5ff', '#a5d8ff'] },
    phones: [{ label: 'mobile', num: '+86 555 0123 0001' }],
    emails: [{ label: 'work', addr: 'hanguangjun@cloudrecesses.gusu' }],
    bday: '1992-01-23', company: 'Gusu Lan Academy', title: 'Professor of Music',
    address: 'The Jingshi, Cloud Recesses, Gusu',
    related: [{ label: 'brother-in-law', id: 'me' }],
    color: '#4c6ef5', wavelet: 'lanwangji', dial: 'answer',
    voicemail: 'Lan Wangji. Leave a message.',
  });
  def({
    id: 'nhs', first: 'Huaisang', last: 'Nie', real: 'Nie Huaisang', display: 'Nie Huaisang',
    avatar: { art: 'av_nhs', initials: 'NH', grad: ['#b2f2bb', '#40c057'] },
    phones: [{ label: 'mobile', num: '+86 555 0225 0777' }],
    emails: [{ label: 'work', addr: 'chairman@niecorp.qinghe' }, { label: 'fans', addr: 'hello@huaisangfans.qinghe' }],
    bday: '1993-02-25', company: 'Nie Corp', title: 'Chairman',
    address: 'The Unclean Realm, Qinghe',
    notes: 'Knows everything. Says he knows nothing.',
    color: '#2f9e44', wavelet: 'huaisang_fans', dial: 'answer',
    voicemail: "Hiii, it's Huaisang! I don't know where my phone is, I don't know anything! Leave a message~",
  });
  def({
    id: 'wn', first: 'Ning', last: 'Wen', real: 'Wen Ning', display: 'Wen Ning', nick: 'A-Ning',
    avatar: { initials: 'WN', grad: ['#dee2e6', '#868e96'] },
    phones: [{ label: 'mobile', num: '+86 555 0611 0412' }],
    emails: [{ label: 'work', addr: 'wen.ning@yiling-ems.yiling' }],
    bday: '1995-06-11', company: 'Yiling Emergency Medical Service', title: 'Paramedic',
    color: '#495057', dial: 'answer',
    voicemail: "Hello, this is Wen Ning. I'm sorry I missed your call. Please leave a message. Sorry.",
  });
  def({
    id: 'sz', first: 'Sizhui', last: 'Lan', real: 'Lan Sizhui', display: 'Lan Sizhui', nick: 'A-Yuan',
    avatar: { art: 'av_sz', initials: 'LS', grad: ['#e3fafc', '#66d9e8'] },
    phones: [{ label: 'mobile', num: '+86 555 0408 2008' }],
    bday: '2008-04-08', company: 'Gusu Lan Academy', title: 'Student',
    color: '#0c8599', wavelet: 'lan_sizhui', dial: 'answer',
    voicemail: "Hello, you've reached Lan Sizhui. Please leave a message and I'll call you back soon!",
  });
  def({
    id: 'jy', first: 'Jingyi', last: 'Lan', real: 'Lan Jingyi', display: 'Lan Jingyi',
    avatar: { art: 'av_jy', initials: 'LJ', grad: ['#fff3bf', '#fcc419'] },
    phones: [{ label: 'mobile', num: '+86 555 0717 2008' }],
    bday: '2008-07-17', company: 'Gusu Lan Academy', title: 'Student',
    color: '#e67700', wavelet: 'jingyi_lan', dial: 'answer',
    voicemail: "YO it's jingyi leave a message!!! ...wait is it recording—",
  });
  def({
    id: 'mian', first: 'Qingyang', last: 'Luo', real: 'Luo Qingyang', display: 'Mianmian',
    avatar: { art: 'av_mian', initials: 'LQ', grad: ['#ffdeeb', '#f783ac'] },
    phones: [{ label: 'mobile', num: '+86 555 0322 1993' }],
    emails: [{ label: 'work', addr: 'luo@mianmian-studio.yunmeng' }],
    bday: '1993-03-22', company: 'Mianmian Studio', title: 'Architect',
    color: '#d6336c', dial: 'voicemail',
    voicemail: "Hi, this is Luo Qingyang. I'm away from my phone. Leave a message.",
  });

  // ── Work ─────────────────────────────────────────────────────────
  def({
    id: 'ea', first: 'Mei', last: 'Tang', real: 'Tang Mei', display: 'Tang Mei (EA)', short: 'Tang Mei',
    avatar: { initials: 'TM', grad: ['#e5dbff', '#9775fa'] },
    phones: [{ label: 'work', num: '+86 555 0716 0002' }, { label: 'mobile', num: '+86 555 0901 1985' }],
    emails: [{ label: 'work', addr: 'tang.mei@lotuspier.yunmeng' }],
    company: 'Yunmeng Jiang Group', title: 'Executive Assistant to the CEO',
    color: '#7048e8', fav: true, dial: 'voicemail',
    voicemail: "Tang Mei, office of the CEO. It is outside office hours. If this is the CEO: go to sleep.",
  });
  def({
    id: 'huang', first: 'Huang', last: '', real: 'Old Huang', display: 'Old Huang', nick: 'Lao Huang',
    avatar: { art: 'av_huang', initials: 'OH', grad: ['#ffe8cc', '#fd7e14'] },
    phones: [{ label: 'mobile', num: '+86 555 0716 0099' }],
    company: 'Yunmeng Jiang Group', title: 'Head of Security, Lotus Pier',
    color: '#d9480f', fav: true, dial: 'answer',
    voicemail: 'Huang here. Speak after the beep. Boss, if this is you, I am already on my way.',
  });
  def({
    id: 'liu', first: 'Qian', last: 'Liu', real: 'Liu Qian', display: 'Liu Qian (Ops)', short: 'Liu Qian',
    avatar: { initials: 'LQ', grad: ['#d3f9d8', '#51cf66'] },
    phones: [{ label: 'work', num: '+86 555 0716 0310' }],
    emails: [{ label: 'work', addr: 'liu.qian@lotuspier.yunmeng' }],
    company: 'Yunmeng Jiang Group', title: 'Operations Manager',
    color: '#2b8a3e', dial: 'voicemail',
    voicemail: "You've reached Liu Qian, YMJ Operations. Leave your name, number and shipment ID.",
  });
  def({
    id: 'bai', first: 'Bai', last: '', real: 'A-Bai', display: 'A-Bai (Logistics)', short: 'A-Bai',
    avatar: { initials: 'AB', grad: ['#c5f6fa', '#22b8cf'] },
    phones: [{ label: 'work', num: '+86 555 0716 0418' }],
    company: 'Yunmeng Jiang Group', title: 'Logistics Coordinator',
    color: '#1098ad', dial: 'answer',
    voicemail: "Hi this is A-Bai from logistics, sorry, I mean, leave a message, sorry!",
  });
  def({
    id: 'qr', first: 'Qiren', last: 'Lan', real: 'Lan Qiren', display: 'Lan Qiren',
    avatar: { initials: 'LQ', grad: ['#e9ecef', '#adb5bd'] },
    phones: [{ label: 'office', num: '+86 555 0512 0010' }],
    emails: [{ label: 'work', addr: 'lan.qiren@cloudrecesses.gusu' }],
    company: 'Gusu Lan Academy', title: 'Chair of the Board',
    color: '#495057', dial: 'voicemail',
    voicemail: 'This is Lan Qiren. State your business concisely.',
  });

  // ── Family (gone) ────────────────────────────────────────────────
  def({
    id: 'ajie', first: 'Yanli', last: 'Jiang', real: 'Jiang Yanli', display: 'A-Jie 🪷', short: 'A-Jie',
    avatar: { emoji: '🪷', grad: ['#fff0f6', '#faa2c1'] },
    phones: [{ label: 'mobile', num: '+86 555 0212 1988' }],
    bday: '1988-02-12', related: [{ label: 'sister', id: 'me' }],
    notes: 'Lotus root and pork rib soup. Two hours. Low fire. Don’t rush it.',
    color: '#c2255c', dial: 'disconnected',
  });
  def({
    id: 'mom', first: 'Ziyuan', last: 'Yu', real: 'Yu Ziyuan', display: 'Mother',
    avatar: { initials: 'YZ', grad: ['#e5dbff', '#7950f2'] },
    phones: [{ label: 'mobile', num: '+86 555 0101 1966' }],
    related: [{ label: 'mother', id: 'me' }], color: '#6741d9', dial: 'disconnected',
  });
  def({
    id: 'dad', first: 'Fengmian', last: 'Jiang', real: 'Jiang Fengmian', display: 'Father',
    avatar: { initials: 'JF', grad: ['#d0bfff', '#845ef7'] },
    phones: [{ label: 'mobile', num: '+86 555 0101 1964' }],
    related: [{ label: 'father', id: 'me' }], color: '#5f3dc4', dial: 'disconnected',
  });

  // ── Services ─────────────────────────────────────────────────────
  def({
    id: 'hq', first: 'Lotus Pier HQ', last: '', display: 'Lotus Pier HQ',
    avatar: { emoji: '🪷', grad: ['#d0bfff', '#7048e8'] },
    phones: [{ label: 'main', num: '+86 555 0716 0000' }],
    company: 'Yunmeng Jiang Group', fav: true, dial: 'answer',
  });
  def({ id: 'swift', first: 'Swift Ride', display: 'Swift Ride', service: true, avatar: { emoji: '🚕', grad: ['#ffe066', '#fab005'] }, phones: [{ label: 'service', num: '10655 0101' }], dial: 'busy' });
  def({ id: 'bank', first: '95588', display: '95588', service: true, avatar: { initials: '95', grad: GRAY }, phones: [{ label: 'service', num: '95588' }], dial: 'busy' });
  def({ id: 'eats', first: 'Lotus Eats', display: 'Lotus Eats', service: true, avatar: { emoji: '🥢', grad: ['#ffc9c9', '#fa5252'] }, phones: [{ label: 'service', num: '10655 8888' }], dial: 'busy' });
})();
