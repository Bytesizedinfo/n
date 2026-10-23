/* Mail — seed mailbox for tartaglia@northland.sn (+ attachment illustrations, ids prefixed mail_).
   Facts: docs/STORY.md. Owned by the Mail app (js/apps/mail.js).
   Story clues here: mail_osial (osial_protocol.pdf), mail_travel (Pulcinella's booking), mail_invoice (Hu Tao bills
   Zhongli's own funeral to Childe), mail_archives (a link to the 1926 founding photo). */
(function () {
  'use strict';
  const JC = window.JC;
  const ME = { name: 'Childe', addr: 'tartaglia@northland.sn' };
  const to = [ME];

  // ── attachment art ────────────────────────────────────────────────
  const paper = (w, h, inner) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="#fbfaf7"/>${inner}</svg>`;
  const T = (x, y, s, size, o) => `<text x="${x}" y="${y}" font-family="Helvetica,Arial,sans-serif" font-size="${size}" ${o || ''}>${s}</text>`;
  const line = (y, w) => `<rect x="90" y="${y}" width="${w}" height="14" rx="7" fill="#dfe3e8"/>`;

  JC.art.def('mail_itinerary', {
    title: 'LA 711 itinerary', w: 900, h: 1200, tags: ['document', 'travel'],
    svg: (w, h) => paper(w, h,
      `<rect width="${w}" height="170" fill="#1c3f6e"/>` + T(90, 105, 'NORTHLAND EXECUTIVE TRAVEL', 40, 'fill="#fff" font-weight="700" letter-spacing="3"') + T(90, 145, 'Booked by: Office of Pulcinella · Ref NET-1014-0711', 24, 'fill="#c5d7ee"') +
      T(90, 260, 'LA 711', 72, 'font-weight="800" fill="#1c3f6e"') + T(90, 310, 'Zapolyarny (ZPY) → Liyue Harbor Intl (LHI)', 28, 'fill="#333"') +
      T(90, 360, 'Dep Fri 16 Oct 23:50 · Arr Sat 17 Oct 07:40', 28, 'fill="#333"') +
      `<rect x="90" y="400" width="720" height="2" fill="#ccd"/>` +
      T(90, 460, 'PASSENGERS (unaccompanied minors)', 24, 'fill="#777" letter-spacing="2"') + T(90, 505, 'TONIA · seat 23A', 32, 'fill="#222" font-weight="700"') + T(90, 550, 'TEUCER · seat 23B', 32, 'fill="#222" font-weight="700"') +
      T(90, 630, 'GROUND TRANSPORT', 24, 'fill="#777" letter-spacing="2"') + T(90, 672, 'Northland car, Gate B, name board "AJAX"', 28, 'fill="#222"') +
      T(90, 750, 'HOTEL', 24, 'fill="#777" letter-spacing="2"') + T(90, 792, 'Liyue Harbor Grand · 3 nights · Suite 1101', 28, 'fill="#222"') + T(90, 830, '(Northland partner property)', 24, 'fill="#888"') +
      T(90, 910, 'Released to: Office of Pulcinella only', 26, 'fill="#c92a2a" font-weight="700"') +
      line(980, 600) + line(1010, 520) + line(1040, 640) +
      `<rect x="640" y="1080" width="170" height="70" rx="8" fill="none" stroke="#1c3f6e" stroke-width="4"/>` + T(725, 1125, 'PAID', 30, 'text-anchor="middle" fill="#1c3f6e" font-weight="800" letter-spacing="4"')),
  });
  JC.art.def('mail_invoice', {
    title: 'Wangsheng invoice', w: 900, h: 1200, tags: ['document', 'invoice'],
    svg: (w, h) => paper(w, h,
      `<rect width="${w}" height="12" fill="#5c1a1b"/>` + T(90, 140, 'WANGSHENG FUNERAL PARLOR', 40, 'fill="#5c1a1b" font-weight="800" letter-spacing="2"') + T(90, 180, 'Feiyun Slope · est. 77 generations ago · "We care for you, until the end"', 20, 'fill="#8a5a5a"') +
      T(90, 270, 'INVOICE No. 77-1016', 30, 'fill="#222" font-weight="700"') + T(90, 310, 'Bill to: Mr. Tartaglia, Northland Bank (per client instruction)', 24, 'fill="#444"') +
      T(90, 350, 'Client: Zhongli', 24, 'fill="#444"') + T(90, 390, 'Service: Rite of Parting — Rex Lapis (consultancy)', 24, 'fill="#444"') +
      `<rect x="90" y="430" width="720" height="2" fill="#d9c9c9"/>` +
      T(90, 490, 'Ceremony consultancy (client: himself?)', 24, 'fill="#222"') + T(810, 490, 'ℳ12,000', 24, 'fill="#222" text-anchor="end"') +
      T(90, 540, 'White lanterns ×1,000 (Yujing Terrace)', 24, 'fill="#222"') + T(810, 540, 'ℳ18,800', 24, 'fill="#222" text-anchor="end"') +
      T(90, 590, 'Incense, the good kind', 24, 'fill="#222"') + T(810, 590, 'ℳ2,200', 24, 'fill="#222" text-anchor="end"') +
      T(90, 640, 'Tea for the consultant (he insisted)', 24, 'fill="#222"') + T(810, 640, 'ℳ880', 24, 'fill="#222" text-anchor="end"') +
      `<rect x="90" y="680" width="720" height="2" fill="#d9c9c9"/>` + T(90, 740, 'TOTAL', 30, 'fill="#5c1a1b" font-weight="800"') + T(810, 740, 'ℳ33,880', 30, 'fill="#5c1a1b" font-weight="800" text-anchor="end"') +
      T(90, 860, '"The client says the deceased would want it billed', 22, 'fill="#8a5a5a" font-style="italic"') + T(90, 892, ' to Mr. Tartaglia. I didn\'t ask how he knows. — H.T."', 22, 'fill="#8a5a5a" font-style="italic"') +
      `<circle cx="720" cy="1040" r="70" fill="none" stroke="#c92a2a" stroke-width="6" opacity=".8"/>` + T(720, 1050, '往生', 40, 'text-anchor="middle" fill="#c92a2a" opacity=".85" font-weight="700"')),
  });

  // ── people & senders ──────────────────────────────────────────────
  const signora = { name: 'La Signora', addr: 'signora@northland.sn' };
  const travel = { name: 'Northland Executive Travel', addr: 'travel@northland.sn' };
  const hr = { name: 'Northland HR (Liyue)', addr: 'hr.liyue@northland.sn' };
  const pantalone = { name: 'Pantalone', addr: 'chairman@northland.sn' };
  const ekat = { name: 'Ekaterina', addr: 'reception.liyue@northland.sn' };
  const hutao = { name: 'Hu Tao', addr: 'director@wangsheng.ly' };
  const zl = { name: 'Zhongli', addr: 'consultant@wangsheng.ly' };
  const yunjin = { name: 'Heyu Tea House', addr: 'boxoffice@heyu.ly' };
  const beidou = { name: 'Beidou', addr: 'captain@crux.ly' };
  const market = { name: 'Feiyun Market', addr: 'auctions@feiyun.market' };
  const air = { name: 'Liyue Air', addr: 'checkin@liyueair.ly' };
  const archives = { name: 'Liyue Archives', addr: 'newsletter@archives.ly' };
  const steambird = { name: 'The Steambird', addr: 'weekly@steambird.fon' };
  const ripple = { name: 'Ripple', addr: 'no-reply@ripple.app' };
  const ride = { name: 'Harbor Ride', addr: 'receipts@harborride.ly' };
  const mama = { name: 'Mama', addr: 'mama.morepesok@ripple.mail' };

  JC.store.seed('mail', [
    // ── Inbox ──
    { id: 'mail_market_outbid', box: 'inbox', cat: 'updates', from: market, to, t: '+0 23:40', read: false, flagged: false,
      subject: 'You’ve been outbid: Guizhong-era celadon tea set (Lot 1016)',
      body: 'Hi Childe,\n\nSomeone has placed a higher bid on an item you’re watching.\n\nGuizhong-era celadon tea set (teapot + 4 cups)\nCurrent bid: ℳ11,200 · Bidder: jade_connoisseur_88\nEnds tonight at 00:30\n\nBid again in the Feiyun Market app. Good luck!\n\n— Feiyun Market · a Feiyun Commerce Guild company' },
    { id: 'mail_ride', box: 'inbox', cat: 'transactions', from: ride, to, t: '+0 23:10', read: true, flagged: false,
      subject: 'Your Friday night trip with Mr. Fang',
      body: 'Thanks for riding with Harbor Ride, Childe.\n\nLiuli Pavilion → Pier 7, Liyue Harbor\nFriday 16 October · 22:58 – 23:09 · 11 min · 3.1 km\n2 passengers (guest added: “Z.”)\n\nFare ℳ40\nNight surcharge ℳ6\nTotal ℳ46 · paid with Northland Black ••1111\n\nYour driver: Mr. Fang ★ 4.95\nBlue electric sedan · plate 璃A·0716\n\nLeft something behind? Report a lost item in the Harbor Ride app: harborride://lost — drivers keep found items for 48 hours.' },
    { id: 'mail_ripple', box: 'inbox', cat: 'updates', from: ripple, to, t: '+0 23:38', read: false, flagged: false,
      subject: '@kabukimono mentioned you in a post',
      body: '@kabukimono mentioned you:\n\n“A certain ginger Harbinger left Liuli Pavilion with a certain consultant at 22:58 and his phone has been VERY quiet since 23:20. Somebody check the harbor. #Eleventh 🎣”\n\nSee the post: ripple://post\n\nYou can turn off mention emails in Ripple → Settings → Notifications.' },
    { id: 'mail_air', box: 'inbox', cat: 'updates', from: air, to, t: '+0 21:02', read: true, flagged: false,
      subject: 'Check-in complete — LA 711 (shared by your family)',
      body: 'Dear Mr. Ajax,\n\nYou have been added as a contact for the following booking:\n\nLA 711 · Zapolyarny → Liyue Harbor International\nDeparts Fri 16 Oct 23:50 · Arrives Sat 17 Oct 07:40\nPassengers: TONIA, TEUCER (unaccompanied minor service)\n\nOur staff will meet the passengers at Gate B. Unaccompanied minors are released only to the adult named on the booking.\n\nTrack the flight in the Liyue Air app or at liyueair.ly/flight/LA711.\n\nSafe travels!\nLiyue Air' },
    { id: 'mail_osial', box: 'inbox', cat: 'primary', from: signora, to, t: '-1 23:58', read: true, flagged: true,
      subject: 'Re: Osial — final',
      body: 'Tartaglia.\n\nRevision four is attached. You will notice the countersignature has been removed. It was redundant; the project has only ever had one author, and the Tsaritsa appreciates clarity.\n\nThe resonators at G-4 and G-9 are live. Unit 3 at G-17 awaits only your authorization, which you will send me before the founder’s lanterns go out on Sunday. The transfer to Sea Lantern Logistics releases at 23:00 that night regardless.\n\nYou wanted a god to come out and fight you. Be grateful. I am giving you one.\n\nDo not make me come to you.\n\n— Signora\nOffice of the Eighth\n\n> On 9 Oct, Tartaglia wrote:\n> I’m pulling Osial. There are kids in that harbor.',
      attach: [{ name: 'osial_protocol.pdf', art: 'p_osial_diagram', size: '2.4 MB' }] },
    { id: 'mail_travel', box: 'inbox', cat: 'transactions', from: travel, to, t: '-2 10:20', read: true, flagged: false,
      subject: 'Itinerary confirmed — LA 711 ×2 · Liyue Harbor Grand ×3 nights',
      body: 'Dear Director Tartaglia,\n\nOn behalf of the Office of Pulcinella, Northland Executive Travel is pleased to confirm the following arrangements for your family:\n\nFLIGHT · LA 711 · Fri 16 Oct 23:50 → Sat 17 Oct 07:40\nPassengers: Tonia, Teucer (unaccompanied minor service)\nRelease: Office of Pulcinella (a Northland driver will meet the passengers at Gate B)\n\nHOTEL · Liyue Harbor Grand · Suite 1101 · 3 nights (Northland partner property; room service and security provided)\n\nTotal ℳ21,400 · charged to Corporate — Special Collections (Liyue)\n\nThe Fifth Harbinger asks us to tell you not to thank him.\n\nNorthland Executive Travel',
      attach: [{ name: 'Itinerary_NET-1014-0711.pdf', art: 'mail_itinerary', size: '640 KB' }] },
    { id: 'mail_invoice', box: 'inbox', cat: 'transactions', from: hutao, to, t: '-1 15:00', read: false, flagged: false,
      subject: 'Invoice — Rite of Parting consultancy (client: Zhongli)',
      body: 'Dear Mr. Harbinger!!\n\nWangsheng Funeral Parlor thanks you for your continued patronage~ Please find attached Invoice No. 77-1016 for the Rite of Parting (Rex Lapis), consultancy by Zhongli.\n\nHe said to bill you. He said “the deceased would want it that way.” I asked how he knows what the deceased wants. He looked at me for a very long time and then asked for more tea.\n\nPayment due: whenever~ (but soon~)\n\nWith warmest regards and a coupon (2nd coffin half price),\nHu Tao, 77th Director\n\nP.S. why do you always look so alive. it’s suspicious',
      attach: [{ name: 'Invoice_77-1016.pdf', art: 'mail_invoice', size: '310 KB' }] },
    { id: 'mail_archives', box: 'inbox', cat: 'updates', from: archives, to, t: '-2 07:00', read: false, flagged: false,
      subject: 'This week in the Archives: the Founder’s years',
      body: 'Liyue mourns. This week the Archives open our photo collection of Rex Lapis, the Founder, whose Rite of Parting will be held at Yujing Terrace on Sunday.\n\nHighlight: the only known photograph of the Founder, taken at the founding of the Liyue Exchange in 1926. Collectors have long remarked on how modern he looks.\n\nView the collection: https://archives.ly/photos/1926-founding\n\nThe Archives will be closed on Sunday for the Rite.\n\n— Liyue Archives' },
    { id: 'mail_yunjin', box: 'inbox', cat: 'primary', from: yunjin, to, t: '-14 11:20', read: true, flagged: false,
      subject: 'Your tickets — Yun Jin, “The Divine Damsel” · Sat 17 Oct, 15:00 · Box 2',
      body: 'Dear Mr. Tartaglia,\n\nThank you for your booking. Box Two is reserved in your name for Saturday’s matinee, two seats (No. 071820, No. 071821).\n\nMiss Yun Jin asks us to add a personal note: she is honoured that “the gentleman who quotes my lyrics back to me” will be in the audience, and hopes his companion enjoys the second act.\n\nYour tickets are in Wallet.\n\nHeyu Tea House Box Office',
      attach: [{ name: 'Tickets_Box2.pdf', art: 'p_zl_opera_tickets', size: '420 KB' }] },
    { id: 'mail_beidou', box: 'inbox', cat: 'primary', from: beidou, to, t: '-3 01:30', read: true, flagged: false,
      subject: 'rematch?',
      body: 'Kid.\n\nSaturday. My deck. 22:00. Bring the water swords.\n\nKazuha says he’ll referee. He’ll write a poem instead. Don’t let it distract you. Actually, do.\n\n— Beidou\nCaptain, The Alcor' },
    { id: 'mail_hr', box: 'inbox', cat: 'primary', from: hr, to, t: '-5 09:00', read: true, flagged: false,
      subject: 'Mandatory: Delusion check-up — Mon 19 Oct, 09:00',
      body: 'Director,\n\nPer directive of the Second Harbinger, your quarterly Delusion check-up is scheduled for Monday 19 October at 09:00 (Northland Medical Wing, Liyue Branch).\n\nThe Doctor has requested that you bring “the family baseline” for comparative readings. We have no further information about what this means.\n\nAttendance is mandatory.\n\nNorthland HR, Liyue Branch' },
    { id: 'mail_pantalone', box: 'inbox', cat: 'primary', from: pantalone, to, t: '-4 08:00', read: true, flagged: false,
      subject: 'Q4 — numbers by Monday',
      body: 'Dear Tartaglia,\n\nA gentle reminder that the Chairman’s office expects the Liyue collections summary by Monday.\n\nI have also taken the liberty of reviewing your personal card. Liuli Pavilion appears forty-one times since April. I assume these are client dinners. I assume the client is very important. I assume he is very hungry.\n\nWarmly,\nPantalone\nNinth of the Harbingers · Chairman, Northland Bank Group' },
    { id: 'mail_ekat', box: 'inbox', cat: 'primary', from: ekat, to, t: '+0 18:40', read: true, flagged: false,
      subject: 'Your passcode (again)',
      body: 'Sir,\n\nSecurity has asked me, for the fourth time, to ask you to change your passcode. They say “the Eleventh using eleven” is not a security policy.\n\nI have also restocked your desk with the almond tofu. Please eat lunch.\n\nEkaterina\nReception, Liyue Branch' },
    { id: 'mail_steambird', box: 'inbox', cat: 'updates', from: steambird, to, t: '-1 06:00', read: false, flagged: false,
      subject: 'The Steambird Weekly — Liyue in mourning; Fontaine’s court of opinions',
      body: 'THE STEAMBIRD WEEKLY\n\n• LIYUE: The harbor prepares to bid farewell to its Founder. Sources say the Rite will be “the largest funeral in six thousand years”. Our correspondent asks: whose six thousand years?\n• FONTAINE: The Opera Epiclese announces a new season of trials.\n• SNEZHNAYA: Northland Bank Group reports record quarter; declines to comment on “Project O”.\n\nRead more at steambird.fon' },
    { id: 'mail_spam', box: 'inbox', cat: 'promotions', from: { name: 'Mora Meat Rewards', addr: 'win@moramt-rewards.biz' }, to, t: '-1 03:12', read: false, flagged: false,
      subject: 'CONGRATULATIONS!!! You have won a LIFETIME supply of Mora Meat',
      body: 'Dear valued customer,\n\nClick here to claim your prize: http://moramt-rewards.biz/claim\n\nThis is not a scam.' },
    // ── Sent ──
    { id: 'sent_mama', box: 'sent', cat: 'primary', from: ME, to: [mama], t: '-6 20:30', read: true, flagged: false,
      subject: 'photos from the harbor',
      body: 'Mama,\n\nHere’s the harbor from the terrace near the office. Tell Teucer the toy factory is behind the big pagoda (it isn’t, don’t tell him). Tell Papa I caught a bass. Tell Anthon nothing, he’ll post it.\n\nEat something.\nAjax',
      attach: [{ name: 'harbor.jpg', art: 'p_harbor_day', size: '2.1 MB' }] },
    { id: 'sent_signora', box: 'sent', cat: 'primary', from: ME, to: [signora], t: '-7 01:12', read: true, flagged: false,
      subject: 'Osial',
      body: 'I’m pulling Osial. There are kids in that harbor.\n\nTartaglia' },
    { id: 'sent_zl', box: 'sent', cat: 'primary', from: ME, to: [zl], t: '-3 23:59', read: true, flagged: false,
      subject: 'that book',
      body: 'xiansheng, I finished the rock book. all 900 pages. I want you to know I did that for you and I will never do it again.\n\nwhich rock was your favourite. don’t say “all of them”' },
    // ── Drafts ──
    { id: 'draft_zl', box: 'drafts', cat: 'primary', from: ME, to: [zl], t: '+0 22:44', read: true, flagged: false,
      subject: 'dinner',
      body: 'I' },
    // ── Trash ──
    { id: 't_reelrush', box: 'trash', cat: 'updates', from: { name: 'Reel Rush', addr: 'weekly@reelrush.games' }, to, t: '-1 22:30', read: true, flagged: false,
      subject: 'Your week in Reel Rush: 2 h 10 min played 🎣',
      body: 'Great week, Childe!\n\nBest score: 1,998 — just 49 points behind your friend Teucer (2,047)!\n\nKeep reeling! https://reelrush.games' },
    { id: 't_promo', box: 'trash', cat: 'promotions', from: { name: 'Mingyun Toys & Games', addr: 'offers@mingyun.ly' }, to, t: '-7 12:00', read: true, flagged: false,
      subject: 'The Frost Fortress is BACK 🏰❄️',
      body: 'The Glacier Guardians Frost Fortress is back in stock — limited quantities! Lights up! Ages 6+.\n\nShop now: https://mingyun.ly/frost-fortress' },
  ]);

  JC.store.seed('mailboxes', []);
  JC.store.seed('mailvip', [
    { id: 'consultant@wangsheng.ly', name: 'Zhongli' },
    { id: 'reception.liyue@northland.sn', name: 'Ekaterina' },
    { id: 'mama.morepesok@ripple.mail', name: 'Mama' },
  ]);
})();
