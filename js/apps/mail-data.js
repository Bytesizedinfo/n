/* Mail — seed mailbox for jiang.cheng@lotuspier.yunmeng (+ attachment illustrations, ids prefixed mail_).
   Facts: docs/STORY.md. Owned by the Mail app (js/apps/mail.js). */
(function () {
  'use strict';
  const JC = window.JC;
  const ME = { name: 'Jiang Cheng', addr: 'jiang.cheng@lotuspier.yunmeng' };
  const to = [ME];

  // ── attachment art ────────────────────────────────────────────────
  const paper = (w, h, inner) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="#fbfaf7"/>${inner}</svg>`;
  const T = (x, y, s, size, o) => `<text x="${x}" y="${y}" font-family="Helvetica,Arial,sans-serif" font-size="${size}" ${o || ''}>${s}</text>`;
  function seats(names, hl) {
    const cx = 450, cy = 640, r = 250;
    let out = `<circle cx="${cx}" cy="${cy}" r="170" fill="#f3ead2" stroke="#c9a54a" stroke-width="5"/>` + T(cx, cy - 10, 'TABLE 1', 40, 'text-anchor="middle" font-weight="700" fill="#8a6d1f" letter-spacing="4"') + T(cx, cy + 36, 'Head Table', 26, 'text-anchor="middle" fill="#a08540"');
    names.forEach((n, i) => {
      const a = (i / names.length) * Math.PI * 2 - Math.PI / 2;
      const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
      const on = hl && hl.includes(i);
      out += `<circle cx="${x}" cy="${y}" r="44" fill="${on ? '#ffe3ec' : '#fff'}" stroke="${on ? '#e64980' : '#bfb6a3'}" stroke-width="${on ? 6 : 3}"/>` + T(x, y + 10, String(i + 1), 30, 'text-anchor="middle" font-weight="700" fill="#555"');
      const lx = cx + Math.cos(a) * (r + 92), ly = cy + Math.sin(a) * (r + 74);
      out += T(lx, ly + 8, n, 25, `text-anchor="middle" fill="${on ? '#c2255c' : '#333'}" font-weight="${on ? 700 : 400}"`);
    });
    return out;
  }
  JC.art.def('mail_seating', {
    title: 'Seating_Chart_FINAL.pdf', w: 900, h: 1200,
    svg: (w, h) => paper(w, h, T(450, 120, 'JIN GROUP · AUTUMN CHARITY GALA', 34, 'text-anchor="middle" font-weight="700" fill="#8a6d1f" letter-spacing="3"') + T(450, 168, 'Koi Tower Grand Hall · Friday 16 October 2026 · 19:00', 25, 'text-anchor="middle" fill="#777"') + `<line x1="120" y1="200" x2="780" y2="200" stroke="#c9a54a" stroke-width="3"/>` +
      seats(['Jin Rulan', 'Jiang Cheng', 'Jin Zixun', 'Mrs. Jin', 'Board Member', 'Nie Huaisang', 'Lan Xichen', 'Lan Qiren'], [1]) +
      T(450, 1080, 'FINAL · Jin Group Events Office', 24, 'text-anchor="middle" fill="#999"')),
  });
  JC.art.def('mail_seating_v2', {
    title: 'Seating_Chart_FINAL_v2_REAL.pdf', w: 900, h: 1200,
    svg: (w, h) => paper(w, h, T(450, 120, 'JIN GROUP · AUTUMN CHARITY GALA', 34, 'text-anchor="middle" font-weight="700" fill="#8a6d1f" letter-spacing="3"') + T(450, 168, 'Koi Tower Grand Hall · FINAL (v2) (real) (final)', 25, 'text-anchor="middle" fill="#777"') + `<line x1="120" y1="200" x2="780" y2="200" stroke="#c9a54a" stroke-width="3"/>` +
      seats(['Jin Rulan', 'Jin Zixun', 'Mrs. Jin', 'Jiang Cheng', 'Lan Xichen', 'Nie Huaisang', 'Board Member', 'Lan Qiren'], [3, 4]) +
      `<path d="M555 975c-18-22-60-8-40 26l40 38 40-38c20-34-22-48-40-26z" fill="#ff8fab" opacity=".85"/>` + T(640, 1020, 'hehe~', 40, 'fill="#e64980" font-style="italic" font-weight="700" transform="rotate(-8 640 1020)"') +
      `<path d="M220 1000l60-60 60 60-60 30z" fill="#7bd389" opacity=".8"/>` + T(280, 1080, '🪭', 40, 'text-anchor="middle"')),
  });
  JC.art.def('mail_dogfriday_pdf', {
    title: 'DogFriday_Proposal.pdf', w: 900, h: 1200,
    svg: (w, h) => paper(w, h, `<rect x="0" y="0" width="900" height="210" fill="#2b8a3e"/>` + T(80, 120, 'Bring Your Dog to Work Friday', 46, 'font-weight="700" fill="#fff"') + T(80, 172, 'Pilot proposal · YMJ Operations · Liu Qian', 26, 'fill="#d3f9d8"') +
      ['• 41 staff dog owners', '• 87% of staff in favour', '• Pilot: four Fridays, east courtyard only', '• Staff with allergies: 0 (checked)', '• Supervision: Old Huang (volunteered)', '• Honorary mascot: Fairy (pending)', '• Cost: water bowls ×12 (¥240)', '• Risk: A-Bai will pet every dog'].map((l, i) => T(90, 300 + i * 70, l, 32, 'fill="#333"')).join('') +
      `<circle cx="720" cy="980" r="90" fill="#ffe8cc"/><circle cx="690" cy="960" r="10" fill="#333"/><circle cx="750" cy="960" r="10" fill="#333"/><path d="M700 1005q20 18 40 0" stroke="#333" stroke-width="7" fill="none"/><path d="M640 920l-20-70 60 40zM800 920l20-70-60 40z" fill="#c08457"/>` + T(80, 1120, 'Decision requested by Friday night. — L.Q.', 26, 'fill="#999"')),
  });
  JC.art.def('mail_survey_chart', {
    title: 'Survey_Results.png', w: 1200, h: 900,
    svg: (w, h) => paper(w, h, T(80, 110, 'Staff survey: Bring Your Dog to Work Friday', 44, 'font-weight="700" fill="#222"') + T(80, 160, '214 responses · YMJ Lotus Pier', 28, 'fill="#888"') +
      [['Yes', 87, '#40c057'], ['No', 10, '#fa5252'], ['Only if Fairy comes', 3, '#7950f2']].map(([l, v, c], i) => `<rect x="380" y="${250 + i * 180}" width="${v * 7.2}" height="110" rx="14" fill="${c}"/>` + T(80, 320 + i * 180, l, 38, 'fill="#333" font-weight="600"') + T(400 + v * 7.2, 320 + i * 180, v + '%', 40, 'fill="#333" font-weight="700"')).join('')),
  });
  JC.art.def('mail_tangtang_card', {
    title: 'card_for_aling.jpg', w: 1200, h: 900,
    svg: (w, h) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="#fff6d6"/><rect x="40" y="40" width="1120" height="820" rx="30" fill="none" stroke="#ffb703" stroke-width="10" stroke-dasharray="40 24"/>` +
      `<text x="600" y="190" text-anchor="middle" font-family="Comic Sans MS,Chalkboard,cursive" font-size="92" fill="#e63946" font-weight="700" transform="rotate(-3 600 190)">HAPPY BIRTHDAY A-LING!!</text>` +
      `<ellipse cx="600" cy="520" rx="230" ry="110" fill="#222"/><circle cx="830" cy="430" r="80" fill="#222"/><path d="M790 360l20-80 40 70zM860 360l40-70 10 80z" fill="#222"/><circle cx="855" cy="420" r="12" fill="#fff"/><path d="M370 480q-80-60-60-140" stroke="#222" stroke-width="22" fill="none" stroke-linecap="round"/>` +
      [430, 500, 570, 640, 710, 780].map((x, i) => `<path d="M${x} 600l${i % 2 ? 30 : -30} 140" stroke="#222" stroke-width="24" stroke-linecap="round"/>`).join('') +
      `<text x="600" y="820" text-anchor="middle" font-family="Comic Sans MS,Chalkboard,cursive" font-size="54" fill="#3a86ff">FAIRY IS RUNNING — Tangtang (6)</text>` +
      `<path d="M150 300l30 60 64 6-48 42 14 64-60-34-56 34 14-64-48-42 64-6z" fill="#ffd60a"/><path d="M1020 640l20 40 44 4-32 28 10 44-42-22-40 22 10-44-32-28 44-4z" fill="#ff8fab"/></svg>`,
  });
  JC.art.def('mail_wedding_card', {
    title: 'invitation.jpg', w: 1200, h: 900,
    svg: (w, h) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f8f9fa"/><stop offset="1" stop-color="#e7f5ff"/></linearGradient></defs><rect width="${w}" height="${h}" fill="url(#g)"/><rect x="60" y="60" width="1080" height="780" fill="none" stroke="#a5d8ff" stroke-width="4"/>` +
      `<text x="600" y="250" text-anchor="middle" font-family="Georgia,serif" font-size="44" fill="#495057" letter-spacing="6">TOGETHER WITH THEIR FAMILIES</text><text x="600" y="400" text-anchor="middle" font-family="Georgia,serif" font-size="96" fill="#1c7ed6" font-style="italic">Wei Ying &amp; Lan Zhan</text><text x="600" y="500" text-anchor="middle" font-family="Georgia,serif" font-size="40" fill="#495057">Tuesday · 20 May 2025 · Cloud Recesses</text><text x="600" y="600" text-anchor="middle" font-family="Georgia,serif" font-size="34" fill="#868e96">5 · 2 · 0</text><path d="M560 690c-26-30-80-10-56 34l56 52 56-52c24-44-30-64-56-34z" fill="#ff8787"/></svg>`,
  });

  // ── the mailbox ───────────────────────────────────────────────────
  const peony = { name: 'Golden Peony Hotel', addr: 'reservations@goldenpeony.lanling' };
  const jinEvents = { name: 'Jin Group Events', addr: 'events@koitower.lanling' };
  const school = { name: 'Lanling International School', addr: 'office@lanling-intl.lanling' };
  const daily = { name: 'Lanling Daily', addr: 'brief@lanlingdaily.lanling' };
  const ea = { name: 'Tang Mei', addr: 'tang.mei@lotuspier.yunmeng' };
  const liu = { name: 'Liu Qian', addr: 'liu.qian@lotuspier.yunmeng' };
  const nhs = { name: 'Nie Huaisang', addr: 'chairman@niecorp.qinghe' };
  const qr = { name: 'Lan Qiren', addr: 'lan.qiren@cloudrecesses.gusu' };
  const wwx = { name: 'Wei Wuxian', addr: 'weiying@radish.yiling' };
  const teashop = { name: 'Cloud Recesses Tea Shop', addr: 'orders@cloudrecesses-tea.gusu' };

  JC.store.seed('mail', [
    // ── Inbox ──
    { id: 'm_turndown', box: 'inbox', cat: 'updates', from: { name: 'Golden Peony Hotel', addr: 'guestservices@goldenpeony.lanling' }, to, t: '+0 23:30', read: false, flagged: false,
      subject: 'Turndown service complete · Room 1808',
      body: 'Good evening, Mr. Jiang.\n\nYour turndown service in Room 1808 is complete. As requested: no flowers. A tin of white peony tea and a kettle are on the desk, and the blackout curtains are drawn.\n\nWe noticed you have not yet returned to your room this evening. Our night manager, Mr. Liang, is at the front desk until 07:00 and can be reached at +86 555 0880 1808 should you need anything at all.\n\nRest well, Mr. Jiang.\n\nGuest Services · Golden Peony Hotel, Lanling' },
    { id: 'm_swift', box: 'inbox', cat: 'transactions', from: { name: 'Swift Ride', addr: 'receipts@swiftride.app' }, to, t: '+0 23:37', read: false, flagged: false,
      subject: 'Your Friday night trip with Master Wu Lihua',
      body: 'Thanks for riding with Swift Ride, Jiang Cheng.\n\nKoi Tower → Golden Peony Hotel\nFriday 16 October · 23:21 – 23:36 · 15 min · 6.8 km\n\nFare ¥58.00\nNight surcharge ¥6.00\nTotal ¥64.00 · paid with card ending 4417\n\nYour driver: Master Wu Lihua ★ 4.97\nGrey electric sedan · plate 云A·9X277\n\nLeft something behind? Report a lost item in the Swift Ride app: swiftride://lost — or call Swift Ride Customer Care on +86 555 0101 8888. Drivers keep found items for 48 hours.\n\nRate your trip: https://swiftride.app/rate/9X277-1016',
      attach: [{ name: 'Receipt_SR-1016-2321.pdf', art: 'p_taxi_night', size: '84 KB' }] },
    { id: 'm_wavelet', box: 'inbox', cat: 'updates', from: { name: 'Wavelet', addr: 'no-reply@wavelet.app' }, to, t: '+0 23:38', read: false, flagged: false,
      subject: '@teaspiller_qh mentioned you in a post',
      body: '@teaspiller_qh mentioned you:\n\n“The CEO of a certain logistics group left a certain gala at 23:15 with his ears very red. A certain Chancellor watched him go. #BalconyGate 👀”\n\nSee the post: wavelet://post\n\nYou can turn off mention emails in Wavelet → Settings → Notifications.' },
    { id: 'm_jin_thanks', box: 'inbox', cat: 'updates', from: jinEvents, to, t: '+0 23:02', read: false, flagged: false,
      subject: 'Thank you for attending the Autumn Charity Gala',
      body: 'Dear Mr. Jiang,\n\nOn behalf of the Jin Group, thank you for joining us at Koi Tower tonight, and for the Yunmeng Jiang Group’s generous gift of ¥2,000,000 to the Lanling Children’s Hospital. Your receipt for tax purposes is attached.\n\nTonight’s gala raised ¥18.4 million in total. Mr. Jin Rulan’s speech was, we are told, the shortest in the event’s history, and the most applauded.\n\nWith gratitude,\nJin Group Events Office · Koi Tower\n+86 555 0518 0001',
      attach: [{ name: 'Donation_Receipt_YMJ.pdf', art: 'p_gala_hall', size: '212 KB' }] },
    { id: 'm_nhs_swap', box: 'inbox', cat: 'primary', from: nhs, to, t: '+0 18:55', read: true, flagged: false,
      subject: 'hehe I swapped the seats~',
      body: 'Brother Jiang!!!\n\nDon’t be mad~ 🙈 The old chart had you next to Jin Zixun, and he talks about bond yields for three hours. I saved your life. You’re welcome!!\n\nNew seats: Table 1, Seat 4. Zewu-jun is Seat 5. I don’t know how that happened!! The Jin events office is very busy, maybe they made a mistake? 🪭\n\nhehe~\n\n— Huaisang\n\nP.S. Zewu-jun asked me which tea you like. I said white peony. Was I right? 👀',
      attach: [{ name: 'Seating_Chart_FINAL_v2_REAL.pdf', art: 'mail_seating_v2', size: '1.1 MB' }] },
    { id: 'm_ea_agenda', box: 'inbox', cat: 'primary', from: ea, to, t: '+0 17:40', read: true, flagged: true,
      subject: 'Monday — Board Q4 agenda',
      body: 'Mr. Jiang,\n\nMonday 19 October\n\n07:00 — Do not email me.\n08:30 — Car from Lotus Pier Residence (Old Huang driving).\n09:00 — Board — Q4. The deck is final. Slide 7 is fine.\n11:30 — Call: Lanling cold-chain contract (Jin Group logistics team).\n13:00 — Lunch. You will eat it. Old Huang has been informed.\n15:00 — Canteen soup week tasting (Liu Qian insisted; I did not argue).\n16:30 — Signatures (12 documents, flagged yellow).\n\nReminders:\n• Sunday 18 — A-Ling’s birthday. The bell is back from the silversmith. It is in the safe.\n• Lan Qiren’s board letter needs a reply by Monday. By email.\n• Dog Friday: Liu Qian expects a decision tonight.\n\nDeck: https://drive.lotuspier.yunmeng/board/q4-final\n\nT.M.' },
    { id: 'm_daily_gala', box: 'inbox', cat: 'updates', from: daily, to, t: '+0 07:00', read: false, flagged: false,
      subject: 'Morning Brief: Tonight — Jin Group Autumn Charity Gala at Koi Tower',
      body: 'LANLING DAILY · MORNING BRIEF · Friday 16 October\n\n1. Tonight: Jin Group Autumn Charity Gala\nKoi Tower’s Grand Hall opens at 19:00. Heir Jin Rulan, who turns eighteen on Sunday, is expected to speak. Guests include Lan Xichen of Gusu Lan Academy and Yunmeng Jiang Group CEO Jiang Cheng.\nhttps://lanlingdaily.lanling/2026/10/16/autumn-gala\n\n2. Lotus harvest closes strong in Yunmeng\nYMJ reports its best autumn lotus-root harvest in a decade.\n\n3. Swift Ride extends late-night service in Lanling\nRides after 23:00 now carry a ¥6 night surcharge.\n\nWeather: rain all evening. 14°, low 11°. Bring an umbrella. Do not leave it in a taxi.' },
    { id: 'm_qr_board', box: 'inbox', cat: 'primary', from: qr, to, t: '-3 07:58', read: true, flagged: true,
      subject: 'Gusu Lan Academy — Q4 sponsorship (board letter)',
      body: 'Jiang Cheng,\n\nOn behalf of the Board of Gusu Lan Academy, I write regarding the Yunmeng Jiang Group’s sponsorship for the fourth quarter.\n\n1. The Board gratefully acknowledges the Group’s continued support of the Cloud Recesses Summer Programme, which you yourself attended in 2007, with results the Board recalls clearly.\n\n2. The proposed renovation of the archery range requires the Group’s written confirmation by Monday 19 October.\n\n3. The Board notes that the Chancellor has resumed his duties. The Board asks that correspondence concerning the Academy be directed to the Board, and not to the Chancellor’s personal telephone, at any hour.\n\n4. Kindly reply by email. Not by text message.\n\nRule 1,207 of the Academy reminds us that a gentleman answers letters promptly.\n\n— Lan Qiren\nChair of the Board, Gusu Lan Academy\nOffice: +86 555 0512 0010',
      attach: [{ name: 'Q4_Sponsorship_Letter.pdf', art: 'p_rules_wall', size: '640 KB' }] },
    { id: 'm_seating', box: 'inbox', cat: 'updates', from: jinEvents, to, t: '-3 11:20', read: true, flagged: false,
      subject: 'Autumn Charity Gala — Final Seating Chart',
      body: 'Dear Mr. Jiang,\n\nPlease find attached the final seating chart for Friday’s Autumn Charity Gala at Koi Tower. You are seated at Table 1, Seat 2, between Mr. Jin Rulan and the Jin Group Board Treasurer, Mr. Jin Zixun.\n\nProgramme\n19:00 Reception (Grand Hall)\n20:00 Dinner\n21:30 Speeches, including a few words from Mr. Jin Rulan\n22:30 Dessert, music and dancing\n\nDress code: black tie. Valet parking is available at the east entrance. Please note the koi pond forecourt is closed to all vehicles.\n\nWith thanks,\nJin Group Events Office · Koi Tower\n+86 555 0518 0001',
      attach: [{ name: 'Seating_Chart_FINAL.pdf', art: 'mail_seating', size: '980 KB' }] },
    { id: 'm_teashop_promo', box: 'inbox', cat: 'promotions', from: teashop, to, t: '-2 09:00', read: true, flagged: false,
      subject: 'Your White Peony is back in stock 🍃',
      body: 'Dear customer,\n\nThe Silver Needle White Peony you ordered on 25 September (250 g tin, delivered to The Hanshi) is back in stock after the autumn picking.\n\nBrewing note from the shop: 85°C, three minutes, no sugar. Some people take it with nothing at all and pretend they do not like it.\n\nReorder: https://cloudrecesses-tea.gusu/white-peony\nShop: +86 555 0512 2000\n\nCloud Recesses Tea Shop · Gusu' },
    { id: 'm_school_lab', box: 'inbox', cat: 'updates', from: school, to, t: '-1 18:30', read: true, flagged: false,
      subject: 'Follow-up: Chemistry Laboratory Incident (Grade 12)',
      body: 'Dear Mr. Jiang,\n\nThank you for meeting with Ms. Su this afternoon.\n\nAs discussed, the fume hood in Laboratory 2 will be replaced (estimate ¥4,800). The students involved, including Jin Rulan, will assist with laboratory inventory after class for the next two weeks. The affected student’s eyebrows are expected to grow back fully within six weeks.\n\nJin Rulan was honest about his part in the incident, which we appreciated.\n\nKind regards,\nOffice of the Head of Upper School\nLanling International School · +86 555 0418 6600\nhttps://portal.lanling-intl.lanling/guardian' },
    { id: 'm_mian_card', box: 'inbox', cat: 'primary', from: { name: 'Luo Qingyang', addr: 'luo@mianmian-studio.yunmeng' }, to, t: '-3 16:05', read: true, flagged: false,
      subject: 'Tangtang’s card for A-Ling',
      body: 'Jiang Cheng,\n\nScan attached, in case the original gets lost before Sunday. She insists the dog is running. Do not tell her it has six legs.\n\nAlso — you looked tired at the board dinner. Sleep.\n\nQingyang',
      attach: [{ name: 'card_for_aling.jpg', art: 'mail_tangtang_card', size: '2.4 MB' }] },
    { id: 'm_school_ptc', box: 'inbox', cat: 'updates', from: school, to, t: '-6 14:00', read: true, flagged: false,
      subject: 'Parent–Teacher Conference: Thursday 15 Oct, 16:00 — Jin Rulan (Grade 12)',
      body: 'Dear Mr. Jiang,\n\nThis is a reminder of your conference with Jin Rulan’s homeroom teacher, Ms. Su Mei, on Thursday 15 October at 16:00 in Room 3B (Upper School, second floor).\n\nTopics: university applications, archery team captaincy, and one item regarding the chemistry laboratory.\n\nTo reschedule please call the office on +86 555 0418 6600 or use the guardian portal: https://portal.lanling-intl.lanling/guardian\n\nLanling International School' },
    { id: 'm_petkingdom', box: 'inbox', cat: 'transactions', from: { name: 'Pet Kingdom Lanling', addr: 'receipts@petkingdom.lanling' }, to, t: '-5 14:22', read: true, flagged: false,
      subject: 'Your receipt — Order #PK-20261011-0716',
      body: 'Thank you for shopping at Pet Kingdom Lanling!\n\nOrder #PK-20261011-0716 · Sunday 11 October, 14:22\n\nGiantPaws Large Breed Adult, 20 kg × 1 — ¥689.00\nSalmon training treats × 2 — ¥98.00\nOatmeal dog shampoo (“for dogs who hate baths”) × 1 — ¥68.00\nSqueaky radish toy × 1 — ¥39.00\nDelivery to Koi Tower Residences — ¥0.00\n\nTotal ¥894.00 · card ending 4417\nPet name on file: Fairy 🐾\n\nQuestions? Call us on +86 555 0601 3300.',
      attach: [{ name: 'receipt_PK0716.jpg', art: 'p_receipt', size: '310 KB' }] },
    { id: 'm_radish', box: 'inbox', cat: 'primary', from: { name: 'Yiling Radish Co.', addr: 'weiying@radish.yiling' }, to, t: '-6 20:00', read: true, flagged: false,
      subject: 'RADISH NEWS #12 🥕 (u r subscribed. no u cant leave)',
      body: 'YILING RADISH CO. — MONTHLY NEWSLETTER #12\n\nsubscribers: 41 (hi jiang cheng i know ur reading this)\n\n🥕 THIS MONTH\n• biggest radish so far: 3.4 kg. lan zhan carried it. it was very romantic\n• weekend pop-up in gusu: sold out of radish cake by 11am\n• the farm dog situation: still no dogs. there will never be dogs\n\n🍲 SOUP CORNER\nattempt 7 of a very important soup was a success. two hours. low fire. didn’t rush it. someone taught me that\n\n📅 COMING SOON\nsomething important on sunday. not telling. (it’s a-ling’s birthday. everyone knows)\n\nunsubscribe: https://radish.yiling/unsubscribe (this link goes to a picture of a radish)\n\n— wei ying, chief radish officer',
      attach: [{ name: 'biggest_radish.jpg', art: 'p_radishes', size: '1.8 MB' }] },
    { id: 'm_liu_survey', box: 'inbox', cat: 'primary', from: liu, to, t: '-6 09:10', read: true, flagged: false,
      subject: 'Re: Proposal: Bring Your Dog to Work Friday — survey results 📊',
      body: 'Good morning, Mr. Jiang!\n\nFollowing your reply (“No.”), I have gathered data as promised. 📊\n\n• Staff survey: 87% in favour (214 responses)\n• Staff with allergies: 0 (checked twice)\n• Tang Mei: abstained (“I’m not getting involved.”)\n• Old Huang: will supervise, will bring Dabao\n• A-Bai: has started a sign-up sheet (unauthorised)\n\nChart attached. I would be grateful for a decision by Friday night.\n\nBest regards,\nLiu Qian · Operations',
      attach: [{ name: 'Survey_Results.png', art: 'mail_survey_chart', size: '420 KB' }] },
    { id: 'm_liu_dog', box: 'inbox', cat: 'primary', from: liu, to, t: '-9 08:28', read: true, flagged: false,
      subject: 'Proposal: Bring Your Dog to Work Friday (pilot) 🐕',
      body: 'Good morning, Mr. Jiang!\n\nPlease find attached a proposal for a Bring Your Dog to Work Friday pilot at Lotus Pier.\n\n• 41 staff dog owners\n• Pilot: four Fridays, east courtyard only\n• Old Huang has volunteered to supervise\n• Fairy invited as honorary mascot (pending her uncle’s approval)\n\nThe poster is also attached. Tang Mei has seen it. It has a dog doodle.\n\nBest regards,\nLiu Qian · Operations Manager, Yunmeng Jiang Group',
      attach: [{ name: 'DogFriday_Poster.png', art: 'p_dogfriday_poster', size: '1.2 MB' }, { name: 'DogFriday_Proposal.pdf', art: 'mail_dogfriday_pdf', size: '860 KB' }] },
    { id: 'm_bank', box: 'inbox', cat: 'transactions', from: { name: 'Yunmeng Commercial Bank', addr: 'estatements@ymcb.yunmeng' }, to, t: '-8 06:00', read: true, flagged: false,
      subject: 'Your October e-Statement is ready (card ending 4417)',
      body: 'Dear Mr. Jiang Cheng,\n\nYour e-Statement for the period ending 7 October 2026 is now available in Mobile Banking.\n\nStatement balance: ¥38,214.60\nMinimum payment due: ¥0.00 (auto-pay enabled)\nPayment date: 25 October 2026\n\nFor your security we will never ask for your password or verification codes. If you did not make a transaction, call 95588.\n\nYunmeng Commercial Bank' },
    { id: 'm_eats', box: 'inbox', cat: 'promotions', from: { name: 'Lotus Eats', addr: 'hello@lotuseats.app' }, to, t: '-5 11:00', read: true, flagged: false,
      subject: 'Weekend craving? 20% off all hotpot 🍲',
      body: 'Rainy weekend in Lanling? Stay in.\n\n20% off every hotpot order until Sunday night — including Laoma Hotpot, back on Lotus Eats this month.\n\nOrder now: https://lotuseats.app/hotpot\n\nYou’re receiving this because you once ordered 38 brown sugar milk teas. Legendary.' },
    { id: 'm_koirec', box: 'inbox', cat: 'promotions', from: { name: 'Koi Records', addr: 'news@koirecords.lanling' }, to, t: '-4 10:00', read: true, flagged: false,
      subject: 'Now on vinyl: Lotus Nocturnes (limited pressing)',
      body: 'Lotus Nocturnes — the late-night guzheng album you have streamed 214 times this year — is now available on 180 g vinyl.\n\nLimited to 500 numbered copies. Ships in a purple sleeve.\n\nhttps://koirecords.lanling/lotus-nocturnes',
      attach: [{ name: 'cover.jpg', art: 'cover_lotus_nocturnes', size: '540 KB' }] },
    { id: 'm_daily_lxc', box: 'inbox', cat: 'updates', from: daily, to, t: '2026-09-26 07:00', read: true, flagged: false,
      subject: 'Morning Brief: Zewu-jun returns to Cloud Recesses after a year away',
      body: 'LANLING DAILY · MORNING BRIEF · Saturday 26 September\n\n1. Zewu-jun returns\nLan Xichen has resumed his duties as Chancellor of Gusu Lan Academy after a year-long sabbatical that began in the weeks after the Jin Guangyao affair. “I am grateful for the patience of my family and my friends,” he said, “and for every message.” He declined to answer further questions and served the reporters tea.\nhttps://lanlingdaily.lanling/2026/09/26/zewu-jun-returns\n\n2. Jin Group confirms Autumn Charity Gala for 16 October\n\n3. Koi Tower forecourt pond reopens after renovation — “the koi are thriving,” says the Jin Group.\n\nWeather: mist in Gusu, rain in Lanling.',
      attach: [{ name: 'cloud_recesses.jpg', art: 'p_cloud_recesses', size: '760 KB' }] },
    { id: 'm_it', box: 'inbox', cat: 'updates', from: { name: 'YMJ IT Service Desk', addr: 'it@lotuspier.yunmeng' }, to, t: '2026-09-15 09:00', read: true, flagged: false,
      subject: 'Security reminder: please don’t use birthdays as passcodes',
      body: 'Dear colleagues,\n\nA friendly reminder from IT: device passcodes must not be birthdays, anniversaries or other dates that family members can guess.\n\nThis reminder follows an incident at a recent family dinner in which an executive’s passcode was correctly guessed by his nephew in under ten seconds.\n\nTo change your passcode: Settings → Face ID & Passcode → Change Passcode.\n\nThank you,\nYMJ IT Service Desk' },
    // ── Junk ──
    { id: 'j_yacht', box: 'junk', cat: 'promotions', from: { name: 'Lucky Yacht Club', addr: 'prize-center@lucky-yacht.biz' }, to, t: '-1 03:12', read: false, flagged: false,
      subject: 'CONGRATULATIONS Mr. Jiang!!! You have been selected for a FREE YACHT 🛥️',
      body: 'DEAR VALUED WINNER,\n\nYou have been RANDOMLY SELECTED to receive a 40-metre luxury yacht!!! To claim, simply send your bank details and a small processing fee of ¥8,888 to our agent.\n\nCLAIM NOW: http://lucky-yacht.biz/claim\n\nThis offer expires in 10 minutes. It has expired 14 times before.' },
    { id: 'j_phish', box: 'junk', cat: 'updates', from: { name: 'Lotus Pier Security', addr: 'security@lotuspier-yunmeng.support' }, to, t: '-2 04:40', read: false, flagged: false,
      subject: 'Urgent: Your Lotus Pier account has been suspended',
      body: 'Dear user,\n\nWe have detected unusual activity on your Lotus Pier account. Your account will be suspended in 24 hours unless you verify your password.\n\nVerify here: http://lotuspier-yunmeng.support/verify\n\nLotus Pier IT Securty Team' },
    { id: 'j_singles', box: 'junk', cat: 'promotions', from: { name: 'Yunmeng Hearts', addr: 'match@yunmeng-hearts.love' }, to, t: '-4 23:58', read: false, flagged: false,
      subject: 'Single lotus farmers in YUNMENG want to discuss LOGISTICS with you',
      body: '3 people near Lotus Pier viewed your profile!\n\nOne of them wrote: “I also enjoy shipping containers.”\n\nSee who: http://yunmeng-hearts.love/matches' },
    { id: 'j_koicoin', box: 'junk', cat: 'promotions', from: { name: 'KoiCoin Wallet', addr: 'rewards@koicoin.xyz' }, to, t: '-7 02:15', read: false, flagged: false,
      subject: 'You have 3.2 KOI waiting 🐟🚀',
      body: 'Your KoiCoin wallet has 3.2 KOI (≈ ¥0.04) waiting to be claimed. Connect your bank account to withdraw.\n\nhttp://koicoin.xyz/claim\n\nKoiCoin is not affiliated with Koi Tower, the Jin Group or any actual fish.' },
    // ── Drafts ──
    { id: 'd_wwx', box: 'drafts', cat: 'primary', from: ME, to: [wwx], t: '2024-06-22 01:05', read: true, flagged: false,
      subject: '', body: 'I know about' },
    // ── Sent ──
    { id: 's_ea', box: 'sent', cat: 'primary', from: ME, to: [ea], t: '+0 21:22', read: true, flagged: false,
      subject: 'Re: Monday — Board Q4 agenda', body: 'Slide 7.' },
    { id: 's_nhs', box: 'sent', cat: 'primary', from: ME, to: [nhs], t: '+0 18:56', read: true, flagged: false,
      subject: 'Re: hehe I swapped the seats~', body: 'I know where you live.' },
    { id: 's_school', box: 'sent', cat: 'primary', from: ME, to: [school], t: '-1 19:02', read: true, flagged: false,
      subject: 'Re: Follow-up: Chemistry Laboratory Incident (Grade 12)', body: 'Send me the invoice for the fume hood. He will apologise to the student in person, and he will mean it.\n\nJiang Cheng' },
    { id: 's_peony', box: 'sent', cat: 'primary', from: ME, to: [peony], t: '-1 09:20', read: true, flagged: false,
      subject: 'Re: Your reservation is confirmed — Room 1808', body: 'Late checkout Sunday. No flowers.\n\nJ.C.' },
    { id: 's_liu', box: 'sent', cat: 'primary', from: ME, to: [liu], t: '-9 10:02', read: true, flagged: false,
      subject: 'Re: Proposal: Bring Your Dog to Work Friday (pilot) 🐕', body: 'No.' },
    { id: 's_qr', box: 'sent', cat: 'primary', from: ME, to: [qr], t: '2026-07-02 08:00', read: true, flagged: false,
      subject: 'Re: Gusu Lan Academy — Q3 sponsorship', body: 'Received. Approved.\n\nJiang Cheng' },
    // ── Archive ──
    { id: 'm_peony_res', box: 'inbox', cat: 'transactions', from: peony, to, t: '-1 09:06', read: true, flagged: false,
      subject: 'Your reservation is confirmed — Room 1808',
      body: 'Dear Mr. Jiang,\n\nThank you for choosing the Golden Peony Hotel, Lanling. We are delighted to confirm your stay.\n\nConfirmation: GP-1808-1015\nGuest: Mr. Jiang Cheng\nArrival: Thursday 15 October 2026 (after 15:00)\nDeparture: Sunday 18 October 2026 (late checkout 14:00, as requested)\nRoom: 1808 — Executive King, Lake View\nRate: ¥1,200 per night · 3 nights (pre-authorised to card ending 4417)\n\nSpecial requests (from your assistant, Ms. Tang): quiet floor; no fresh flowers in the room; white peony tea in the minibar; do not upgrade.\n\nOur front desk is available 24 hours on +86 555 0880 1808. You can also manage your stay at https://goldenpeony.lanling/stay/GP-1808-1015\n\nWe look forward to welcoming you.\n\nWarm regards,\nReservations · Golden Peony Hotel',
      attach: [{ name: 'GP-1808-1015.pdf', art: 'p_hotel_lobby', size: '320 KB' }] },
    { id: 'a_tea_order', box: 'archive', cat: 'transactions', from: teashop, to: [ea], t: '2026-09-25 08:10', read: true, flagged: false,
      subject: 'Order confirmed: Silver Needle White Peony (250 g) — delivery to The Hanshi',
      body: 'Thank you for your order.\n\nSilver Needle White Peony, 250 g tin × 1 — ¥880.00\nDeliver to: The Hanshi, Cloud Recesses, Gusu\nDelivery: today, by 11:00\nGift note: (none)\n\nOrdered by Tang Mei on behalf of Jiang Cheng. Paid with card ending 4417.\n\nCloud Recesses Tea Shop' },
    { id: 'a_wedding', box: 'archive', cat: 'primary', from: wwx, to, t: '2025-04-01 10:00', read: true, flagged: false,
      subject: 'you’re invited 🤍 Wei Ying & Lan Zhan · 20 May 2025',
      body: 'jiang cheng\n\nthis is the real invitation. lan zhan says texting “come to my wedding lol” does not count\n\nTuesday 20 May 2025 (5·2·0, yes on purpose)\nCloud Recesses, Gusu · ceremony at 11:00, lunch after\n\nur at table 2. u can leave before the toasts if u want. i know u will\n\ncome anyway\n\n— wei ying',
      attach: [{ name: 'invitation.jpg', art: 'mail_wedding_card', size: '1.6 MB' }] },
    // ── Trash ──
    { id: 't_leap', box: 'trash', cat: 'updates', from: { name: 'Lotus Leap', addr: 'weekly@lotusleap.games' }, to, t: '-1 22:30', read: true, flagged: false,
      subject: 'Your week in Lotus Leap: 1 h 20 min played 🐸',
      body: 'Great week, Jiang Cheng!\n\nTime played: 1 h 20 min\nBest score: 1,812 — just 12 points behind your friend Rulan (1,824)!\n\nKeep leaping! https://lotusleap.games' },
    { id: 't_promo', box: 'trash', cat: 'promotions', from: { name: 'Lanling Motors', addr: 'offers@lanlingmotors.lanling' }, to, t: '-7 12:00', read: true, flagged: false,
      subject: 'A first car for a new driver? 🚗',
      body: 'Is someone in your family getting their licence soon? Our learner-friendly hatchbacks come with free parking sensors and a free year of driving lessons.\n\nBook a test drive: https://lanlingmotors.lanling/first-car' },
  ]);

  JC.store.seed('mailboxes', []);
  JC.store.seed('mailvip', [
    { id: 'tang.mei@lotuspier.yunmeng', name: 'Tang Mei' },
    { id: 'rulan.jin@lanling-intl.lanling', name: 'A-Ling' },
    { id: 'weiying@radish.yiling', name: 'Wei Wuxian' },
  ]);
})();
