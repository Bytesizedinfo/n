/* Northland Bank — seed data (owner: N1). Statement history for every account, payees, standing orders, the secure
   inbox and the two corporate "clue" lines (OSIAL/PH3 wire, Executive Travel). Facts: docs/STORY.md.

   One source of truth: every money line lives in the shared `tx` collection (Wallet schema:
   { id, card, merchant, amount (+ charge, − credit), t, cat, note, place, pending, contact, app }) plus `acct`
   ('current' | 'kids' | 'corp'). Personal Current lines use the bank card id 'nb' (JC.world.bank.main) so Wallet,
   JC.bank and this app all read the same records; the savings and corporate accounts use card ids 'kids' / 'corp',
   which JC.bank never balance-checks and Wallet never lists. Running balances are derived from JC.bank's live balance,
   so these seeds never move money.

   Wallet (and anything else) also seeds `tx`, and JC.store.seed() replaces a collection's seed, so this file merges its
   lines into whatever `tx` seed exists at boot (skipping any line another seed already has: same amount, same card
   family, within 45 minutes) instead of competing for the seed slot. */
(function () {
  'use strict';
  const JC = (window.JC = window.JC || {});

  // ── Personal Current (card 'nb') ──────────────────────────────────────────────────────────────────────────────
  const CUR = [];
  const cur = (id, t, merchant, amount, cat, note, extra) => CUR.push(Object.assign({ id: 'nb_' + id, card: 'nb', acct: 'current', merchant, amount, t, cat, note: note || '' }, extra || {}));

  // monthly: service charge, the "toy commission" home, the kids' savings standing order, salary, the Steambird
  const MONTHS = [['04', 'April'], ['05', 'May'], ['06', 'June'], ['07', 'July'], ['08', 'August'], ['09', 'September'], ['10', 'October']];
  MONTHS.forEach(([mm, name]) => {
    const d = '2026-' + mm + '-01';
    cur('svc_' + mm, d + ' 06:00', 'Pier View Residences', 2850, 'bills', 'Service charge · Apartment 2207 · ' + name, { place: 'apartment', ref: 'PVR-2207-' + mm, recurring: 'monthly' });
    cur('mama_' + mm, d + ' 08:00', 'Transfer to Mama', 20000, 'transfer', 'toy commission (' + name + ') ❤️', { contact: 'mama', app: 'northland', recurring: 'monthly', ref: 'SO-MAMA-0001' });
    cur('kids_' + mm, d + ' 08:00', 'To Savings — for the kids', 10000, 'savings', 'Standing order · ' + name, { recurring: 'monthly', ref: 'SO-KIDS-0720' });
    cur('steam_' + mm, d + ' 09:12', 'The Steambird', 58, 'bills', 'Digital subscription · Fontaine edition', { recurring: 'monthly' });
    if (mm !== '10') cur('sal_' + mm, '2026-' + mm + '-25 09:00', 'Northland Bank Group — Salary', -52000, 'income', 'Director, Special Collections (Liyue) · ' + name, { ref: 'PAY-NBG-11-' + mm });
  });

  // April — posted to Liyue; the gala consultant
  cur('0406_3r', '2026-04-06 19:40', 'Third-Round Knockout', 74, 'dining', 'Fish stew, rice, tea', { place: 'third-round' });
  cur('0409_wm', '2026-04-09 21:15', 'Wanmin Go', 186, 'food', 'Wanmin Restaurant → Pier View Residences 2207 · mapo tofu, rice ×2', { place: 'wanmin-rest', app: 'lotuseats' });
  cur('0411_tackle', '2026-04-11 07:30', 'Pier 3 Tackle & Bait', 1180, 'fishing', 'Surfcasting rod (spare) · 12 ft · “for the big ones”');
  cur('0415_ws', '2026-04-15 14:20', 'Wangsheng Funeral Parlor', 5000, 'services', 'Consultancy — Liyue customs for the bank gala (consultant: Z.) · inv. WS-2604-118', { place: 'wangsheng' });
  cur('0422_liuli', '2026-04-22 22:10', 'Liuli Pavilion', 2400, 'dining', 'Dinner for two · “gala consult”', { place: 'liuli', ledger: true });
  cur('0429_xinyue', '2026-04-29 21:30', 'Xinyue Kiosk', 4150, 'dining', 'Dinner for two · tasting menu — “one of each”', { place: 'xinyue', ledger: true });

  // May — Third-Round Knockout ×9 with xiansheng (Ledger ℳ2,430), the birdcage
  [['03', '12:40', 240], ['06', '13:10', 310], ['09', '12:55', 255], ['13', '13:20', 280], ['16', '12:30', 265], ['20', '13:05', 300], ['23', '12:45', 250], ['27', '13:15', 260], ['30', '12:50', 270]]
    .forEach(([dd, hm, n], i) => cur('05' + dd + '_3r', '2026-05-' + dd + ' ' + hm, 'Third-Round Knockout', n, 'dining', ['Lunch for two · fish stew, almond tofu', 'Lunch for two · “the usual”', 'Lunch for two · crystal shrimp ×2', 'Lunch for two', 'Lunch for two · he ordered the whole page again', 'Lunch for two · jade parcels', 'Lunch for two', 'Lunch for two · sweet flower chicken', 'Lunch for two · tea (extra pot)'][i], { place: 'third-round', ledger: true }));
  cur('0511_toys', '2026-05-11 17:20', 'Mingyun Toys & Games', 420, 'gifts', 'Glacier Guardians — Frost Wolf figure', { place: 'mingyun' });
  cur('0512_post', '2026-05-12 10:05', 'Liyue Post', 265, 'gifts', 'Parcel to Morepesok · 1.2 kg · “toys”');
  cur('0518_cage', '2026-05-18 16:30', 'Shitou’s Curios', 3300, 'shopping', 'Antique birdcage · Qingce bamboo, c. 1890 · “for a thrush”', { ledger: true });
  cur('0521_wm', '2026-05-21 20:50', 'Wanmin Go', 142, 'food', 'Wanmin Restaurant → Pier View Residences 2207 · jade parcels', { place: 'wanmin-rest', app: 'lotuseats' });

  // June — the Heyu tab and the ℳ40,000 "tea"
  cur('0605_tackle', '2026-06-05 06:40', 'Pier 3 Tackle & Bait', 320, 'fishing', 'Hooks, swivels, braided line 30 lb');
  cur('0614_wm', '2026-06-14 22:05', 'Wanmin Go', 228, 'food', 'Wanmin Restaurant → Pier View Residences 2207 · fish stew, pelmeni (off-menu)', { place: 'wanmin-rest', app: 'lotuseats' });
  cur('0618_bubu', '2026-06-18 23:30', 'Bubu Pharmacy', 146, 'health', 'Bandages, cold compress, ibuprofen', { place: 'bubu' });
  cur('0628_heyu', '2026-06-28 18:00', 'Heyu Tea House', 5320, 'dining', 'Monthly tab · June · tea, seeds, opera intervals', { place: 'heyu', ledger: true });
  cur('0630_tea', '2026-06-30 22:47', 'Liuli Pavilion', 40000, 'dining', '“tea”', {
    place: 'liuli', ledger: true, odd: true,
    items: [['Private room — Pavilion of Clouds', 2000], ['Tea service ×1 · house reserve, “the last cake”', 38000]],
    memo: 'Server’s note: guest asked for the cake “from before the harbor had a name”. Brewed four times. Guest wept on the third.',
  });

  // July — chess set, birthday hotpot
  cur('0708_wm', '2026-07-08 21:40', 'Wanmin Go', 196, 'food', 'Wanmin Restaurant → Pier View Residences 2207 · mora meat ×3', { place: 'wanmin-rest', app: 'lotuseats' });
  cur('0712_chess', '2026-07-12 15:10', 'Shitou’s Curios', 2100, 'shopping', 'Jade chess set · Liyue xiangqi, 32 pieces', { ledger: true });
  cur('0719_toys', '2026-07-19 16:45', 'Mingyun Toys & Games', 540, 'gifts', 'Glacier Guardians — Ice Wolf Den playset', { place: 'mingyun' });
  cur('0720_hotpot', '2026-07-20 21:30', 'Wanmin Restaurant', 1980, 'dining', 'Hotpot · table of 6 · birthday 🎂', { place: 'wanmin-rest' });
  cur('0728_tackle', '2026-07-28 05:50', 'Pier 3 Tackle & Bait', 265, 'fishing', 'Squid bait (frozen) ×2, leader line');

  // August — osmanthus wine, night shift, Reel Rush
  cur('0807_wine', '2026-08-07 18:30', 'Jade Cup Wine Merchants', 1450, 'shopping', 'Osmanthus wine ×6 · 2020 vintage', { ledger: true });
  cur('0812_3r', '2026-08-12 13:00', 'Third-Round Knockout', 96, 'dining', 'Fish stew, extra rice', { place: 'third-round' });
  cur('0816_toys', '2026-08-16 17:10', 'Mingyun Toys & Games', 360, 'gifts', 'Glacier Guardians — Sledge Captain figure', { place: 'mingyun' });
  cur('0816_post', '2026-08-16 17:55', 'Liyue Post', 290, 'gifts', 'Parcel to Morepesok · 1.4 kg · “toys”');
  cur('0822_wm', '2026-08-22 02:10', 'Wanmin Go', 264, 'food', 'Wanmin Restaurant → Northland Bank, Liyue Branch · pelmeni ×24 (night shift)', { place: 'wanmin-rest', app: 'lotuseats' });
  cur('0830_reel', '2026-08-30 22:15', 'Reel Rush', 30, 'leisure', 'In-app purchase · Golden Lure Pack');

  // September — the rock book, the umbrella, a refund
  cur('0903_book', '2026-09-03 14:30', 'Wanwen Bookhouse', 980, 'shopping', '“Strata of Liyue: A Geological History” · 900 pp., hardcover', { place: 'wanwen', ledger: true });
  cur('0909_jewel', '2026-09-09 11:15', 'Mingxing Jewelry', 1880, 'shopping', 'Pendant cord replacement · silver, Vision-safe clasp', { place: 'mingxing' });
  cur('0912_bubu', '2026-09-12 23:05', 'Bubu Pharmacy', 88, 'health', 'Bandages, arnica', { place: 'bubu' });
  cur('0914_3r', '2026-09-14 12:35', 'Third-Round Knockout', 82, 'dining', 'Almond tofu, tea', { place: 'third-round' });
  cur('0916_feiyun', '2026-09-16 10:20', 'Feiyun Market', -450, 'shopping', 'Refund · lot cancelled by seller (“Mondstadt fishing net, 1820s”)', { app: 'feiyun' });
  cur('0921_umb', '2026-09-21 18:50', 'Harbor Road Convenience', 75, 'shopping', 'Umbrella · large, black', { ledger: true });
  cur('0927_wm', '2026-09-27 21:20', 'Wanmin Go', 214, 'food', 'Wanmin Restaurant → Pier View Residences 2207 · fish stew, rice', { place: 'wanmin-rest', app: 'lotuseats' });
  cur('0928_tackle', '2026-09-28 06:05', 'Pier 3 Tackle & Bait', 410, 'fishing', 'Night-fishing headlamp, squid jigs ×6');

  // October — this week
  cur('1001_permit', '2026-10-01 10:00', 'Liyue Harbor Authority', 420, 'fishing', 'Night fishing permit · Pier 7 · Q4 (Oct–Dec)', { place: 'pier7' });
  cur('1002_heyu', '2026-10-02 11:20', 'Heyu Tea House', 3600, 'leisure', 'Box 2 · Yun Jin — matinee Sat 17 Oct, 15:00 · 2 seats', { place: 'heyu', ledger: true, ref: 'HEYU-BOX2-1017' });
  cur('1004_liuli', '2026-10-04 23:10', 'Liuli Pavilion', 6900, 'dining', 'Dinner for two + osmanthus wine (2 bottles)', { place: 'liuli', ledger: true });
  cur('1007_wm', '2026-10-07 21:35', 'Wanmin Go', 176, 'food', 'Wanmin Restaurant → Pier View Residences 2207 · crystal shrimp', { place: 'wanmin-rest', app: 'lotuseats' });
  cur('1009_3r', '2026-10-09 13:10', 'Third-Round Knockout', 88, 'dining', 'Fish stew (ate standing up)', { place: 'third-round' });
  cur('1011_toys', '2026-10-11 16:40', 'Mingyun Toys & Games', 340, 'gifts', 'Glacier Guardians — Cryo Cicin figure', { place: 'mingyun' });
  cur('1012_post', '-4 10:30', 'Liyue Post', 380, 'gifts', 'Parcel to Morepesok (4 Pristan Lane) · 2.1 kg · “toys”');
  cur('1013_tackle', '-3 06:10', 'Pier 3 Tackle & Bait', 265, 'fishing', 'Braided line 40 lb ×2, hooks, squid bait');
  cur('1014_wm', '-2 22:40', 'Wanmin Go', 264, 'food', 'Wanmin Restaurant → Northland Bank, Liyue Branch · pelmeni ×24 (night shift)', { place: 'wanmin-rest', app: 'lotuseats' });
  cur('1015_wm', '-1 21:30', 'Wanmin Go', 312, 'food', 'Wanmin Restaurant → Pier View Residences 2207 · fish stew, jade parcels ×2', { place: 'wanmin-rest', app: 'lotuseats' });
  cur('1016_bkfst', '+0 07:58', 'Chihu Rock Breakfast Stall', 24, 'dining', 'Soy milk, youtiao ×2 (after a 14 km run)', { place: 'player-home' });
  cur('1016_3r', '+0 13:05', 'Third-Round Knockout', 86, 'dining', 'Fish stew, almond tofu', { place: 'third-round' });
  cur('1016_liuli', '+0 20:00', 'Liuli Pavilion', 8800, 'dining', 'Dinner for two · chef’s autumn menu · osmanthus wine', {
    place: 'liuli', ledger: true,
    items: [['Chef’s autumn menu ×2', 5600], ['Osmanthus wine (1 bottle)', 1880], ['Crystal shrimp (extra, “for the table”)', 680], ['Service', 640]],
    memo: 'Table 9 (window). Second guest “left his wallet in his other coat.”',
  });
  cur('1016_ride', '+0 22:58', 'Harbor Ride', 46, 'transport', 'Liuli Pavilion → Pier 7 · 2 passengers · driver Mr. Fang', { place: 'liuli', app: 'swift', ref: 'ride_1016_2258' });

  // ── Savings — "for the kids" (card 'kids') ─────────────────────────────────────────────────────────────────────
  const KIDS = [];
  MONTHS.forEach(([mm, name]) => KIDS.push({ id: 'nbk_so_' + mm, card: 'kids', acct: 'kids', merchant: 'From Personal Current', amount: -10000, t: '2026-' + mm + '-01 08:00', cat: 'savings', note: 'Standing order · ' + name, ref: 'SO-KIDS-0720' }));
  KIDS.push({ id: 'nbk_int_q2', card: 'kids', acct: 'kids', merchant: 'Interest', amount: -2346, t: '2026-06-30 23:59', cat: 'interest', note: 'Q2 · 3.10% AER' });
  KIDS.push({ id: 'nbk_int_q3', card: 'kids', acct: 'kids', merchant: 'Interest', amount: -2410, t: '2026-09-30 23:59', cat: 'interest', note: 'Q3 · 3.10% AER' });
  KIDS.push({ id: 'nbk_bday', card: 'kids', acct: 'kids', merchant: 'From Personal Current', amount: -7200, t: '2026-07-20 23:40', cat: 'savings', note: 'birthday. mine. for theirs.' });

  // ── Corporate — Special Collections (Liyue), view only (card 'corp') ───────────────────────────────────────────
  const CORP = [
    {
      id: 'nb_c_osial', key: 'osial', card: 'corp', acct: 'corp', merchant: 'Sea Lantern Logistics Co.', amount: 3000000, t: '-2 17:42', cat: 'wire', pending: true,
      note: 'OSIAL/PH3 · scheduled wire · releases Sun 18 Oct, 23:00',
      ref: 'OSIAL/PH3', wire: 'NBW-26-1018-0003',
      release: '+2 23:00',
      counterparty: [
        ['Beneficiary', 'Sea Lantern Logistics Co., Ltd.'],
        ['Address', 'Pier 11 Bonded Warehouse, Liyue Harbor'],
        ['Bank', 'Liyue Maritime Bank · LMBK LY HX'],
        ['Account', '•••• 3301'],
        ['Registered', '2 Sep 2026 · directors: nominee (Fontaine registry)'],
      ],
      purpose: 'Phase 3 — resonator deployment, Guyun Stone Forest: pillars G-4, G-9, G-17 (“Unit 3”). Marine transport, installation, activation support.',
      memo: 'PH3 · final tranche · by the time the founder’s lanterns go out. — R.',
      approvals: [
        ['Initiated', 'Office of the Eighth (La Signora) · Wed 14 Oct, 17:42'],
        ['Approved', 'Office of the Eighth'],
        ['Countersignature', 'Removed (mandate rev. 4, 9 Oct)'],
        ['Authorising signatory', 'Director of Special Collections — Tartaglia (sole signatory)'],
        ['Authorization', 'Signatory code requested by the Office of the Eighth'],
      ],
      controls: 'A freeze placed by the signatory suspends every outgoing payment on the accounts you sign for, including this one.',
      audit: [
        ['21 Aug', 'Programme OSIAL created · sponsor: Tartaglia (Special Collections)'],
        ['29 Aug', 'Ownership transferred to the Office of the Eighth'],
        ['2 Sep', 'PH1 released · ℳ800,000 → Sea Lantern Logistics'],
        ['24 Sep', 'PH2 released · ℳ1,200,000 → Guyun Marine Survey Co.'],
        ['9 Oct', 'Mandate rev. 4 · countersignature removed · sole signatory: Tartaglia'],
        ['9 Oct', 'Withdrawal request by Tartaglia · declined (Office of the Eighth)'],
        ['14 Oct', 'PH3 scheduled · ℳ3,000,000 · release Sun 18 Oct 23:00'],
      ],
    },
    {
      id: 'nb_c_travel', key: 'travel', card: 'corp', acct: 'corp', merchant: 'Executive Travel — Office of Pulcinella', amount: 21400, t: '-2 10:14', cat: 'travel',
      note: 'LA 711 ×2 · Liyue Harbor Grand ×3 nights', ref: 'NB-ET-26-1014-0711',
      items: [
        ['LA 711 · Snezhnaya → Liyue Harbor (LHI) · arr. Sat 17 Oct 07:40 · return LA 712 Mon 19 Oct 13:10 · TONIA, TEUCER', 9800],
        ['Liyue Harbor Grand Hotel · Family Deluxe (sea view) · 17–20 Oct · 3 nights × ℳ3,700', 11100],
        ['Executive Travel booking fee', 500],
      ],
      counterparty: [
        ['Booked by', 'Office of the Fifth (Pulcinella), Morepesok'],
        ['Cost centre', 'Special Collections (Liyue) — recharged at the request of the Office of the Fifth'],
        ['Hotel', 'Liyue Harbor Grand · Northland partner property'],
        ['Guests', 'Tonia (15), Teucer (8) — “guests of Mr. Pulcinella”'],
        ['Ground transfer', 'Office of the Fifth driver · LHI arrivals, Sat 07:40'],
      ],
      approvals: [
        ['Requested', 'Office of the Fifth · Wed 14 Oct, 09:58'],
        ['Approved', 'Office of the Fifth (no Director approval required — “family courtesy”)'],
        ['Notified', 'Director of Special Collections: not notified'],
      ],
      memo: 'Family visit. Rooms held under “Guests of Mr. Pulcinella”. Do not share room numbers with the Director’s office.',
    },
    { id: 'nb_c_ph2', card: 'corp', acct: 'corp', merchant: 'Guyun Marine Survey Co.', amount: 1200000, t: '2026-09-24 11:00', cat: 'wire', note: 'OSIAL/PH2 · survey vessel charter, resonator transport (Units 1–3)', ref: 'OSIAL/PH2', wire: 'NBW-26-0924-0002' },
    { id: 'nb_c_ph1', card: 'corp', acct: 'corp', merchant: 'Sea Lantern Logistics Co.', amount: 800000, t: '2026-09-02 11:00', cat: 'wire', note: 'OSIAL/PH1 · Pier 11 warehouse lease, crating', ref: 'OSIAL/PH1', wire: 'NBW-26-0902-0001' },
    { id: 'nb_c_budget', card: 'corp', acct: 'corp', merchant: 'Zapolyarny Treasury — internal', amount: -5000000, t: '2026-10-09 09:30', cat: 'internal', note: 'OSIAL programme funds · ref. Office of the Eighth' },
    { id: 'nb_c_mandate', card: 'corp', acct: 'corp', merchant: 'Mandate change (rev. 4)', amount: 0, t: '2026-10-09 16:02', cat: 'notice', note: 'Countersignature removed · sole signatory: Tartaglia' },
    { id: 'nb_c_payroll_oct', card: 'corp', acct: 'corp', merchant: 'Payroll — Liyue Branch staff', amount: 486400, t: '2026-10-01 09:00', cat: 'payroll', note: 'October · 17 staff' },
    { id: 'nb_c_payroll_sep', card: 'corp', acct: 'corp', merchant: 'Payroll — Liyue Branch staff', amount: 486400, t: '2026-09-01 09:00', cat: 'payroll', note: 'September · 17 staff' },
    { id: 'nb_c_qixing', card: 'corp', acct: 'corp', merchant: 'Collections — Qixing Treasury', amount: -12500000, t: '2026-09-15 10:00', cat: 'collections', note: 'Liyue sovereign facility · tranche 41 · scheduled service' },
    { id: 'nb_c_jade', card: 'corp', acct: 'corp', merchant: 'Collections — The Jade Chamber', amount: -2750000, t: '-1 10:00', cat: 'collections', note: 'Private facility · note 7 of 12' },
    { id: 'nb_c_aqua', card: 'corp', acct: 'corp', merchant: 'Liyue Aquatics', amount: 3880, t: '2026-09-19 14:20', cat: 'office', note: 'Office aquarium — emergency thaw & restock (2nd time this year)' },
    { id: 'nb_c_vend', card: 'corp', acct: 'corp', merchant: 'FrostFizz Vending', amount: 1240, t: '2026-10-06 16:45', cat: 'office', note: 'Machine repair — error E-11 · 3F break room' },
    { id: 'nb_c_wanmin', card: 'corp', acct: 'corp', merchant: 'Wanmin Go', amount: 1860, t: '2026-10-10 02:14', cat: 'office', note: 'Night shift catering · pelmeni ×120', app: 'lotuseats' },
    { id: 'nb_c_kolya', card: 'corp', acct: 'corp', merchant: 'Expense claim — K. (recruit)', amount: 186, t: '2026-10-13 11:30', cat: 'office', note: 'Rope 30 m, headlamp, “a better map of the Chasm”' },
    { id: 'nb_c_wreath', card: 'corp', acct: 'corp', merchant: 'Wangsheng Funeral Parlor', amount: 12000, t: '2026-10-05 15:00', cat: 'office', note: 'Condolence arrangement — Rite of Parting · Northland Bank Group', place: 'wangsheng' },
  ];

  // ── payees (saved in the app) ────────────────────────────────────────────────────────────────────────────────
  const PAYEES = [
    { id: 'mama', bank: 'Morepesok Fishermen’s Credit Union', acct: '•••• 2201', memo: 'toy commission ❤️', fam: true },
    { id: 'tonia', bank: 'Northland Junior Saver', acct: '•••• 1511', memo: 'for school things (don’t tell Mama)', fam: true },
    { id: 'teucer', bank: 'Northland Junior Saver', acct: '•••• 0418', memo: 'snacks for Sir Fang 🐟', fam: true },
    { id: 'anthon', bank: 'Northland Junior Saver', acct: '•••• 1412', memo: 'NOT for skins', fam: true },
    { id: 'papa', bank: 'Morepesok Fishermen’s Credit Union', acct: '•••• 2200', memo: 'for the boat', fam: true },
    { id: 'zl', bank: 'c/o Wangsheng Funeral Parlor · Liyue Maritime Bank', acct: '•••• 0001 · ref ZHONGLI', memo: 'for your other coat', note: 'Has no account of his own. Payments reach him through the parlor.' },
    { id: 'ht', bank: 'Liyue Maritime Bank · Wangsheng Funeral Parlor', acct: '•••• 0001', memo: 'coffin rent' },
    { id: 'lumine', bank: 'Adventurers’ Guild Payments', acct: '•••• 7777', memo: 'sparring fee (I won)' },
    { id: 'paimon', bank: 'Adventurers’ Guild Payments · “Paimon’s piggy bank”', acct: '•••• 0000', memo: 'NOT all on food' },
    { id: 'ekat', bank: 'Northland Bank · staff', acct: '•••• 0626', memo: 'thank you. really.' },
    { id: 'xl', bank: 'Liyue Maritime Bank · Wanmin Restaurant', acct: '•••• 8888', memo: 'for the pelmeni tab' },
    { id: 'beidou', bank: 'Crux Shipping · Liyue Maritime Bank', acct: '•••• 4321', memo: 'rematch stakes' },
    { id: 'yunjin', bank: 'Heyu Tea House box office', acct: '•••• 1500', memo: 'for the costumes' },
  ];

  const STANDING = [
    { id: 'so_mama', to: 'mama', amount: 20000, day: 1, title: 'Mama — toy commission', since: 'Since Jun 2021' },
    { id: 'so_kids', to: 'kids', amount: 10000, day: 1, title: 'Savings — for the kids', since: 'Since Jul 2024' },
    { id: 'so_pvr', to: 'Pier View Residences', amount: 2850, day: 1, title: 'Pier View — service charge', since: 'Since Apr 2026' },
  ];

  // ── secure inbox (collection `nbinbox`, owned here) ─────────────────────────────────────────────────────────────
  const INBOX = [
    {
      id: 'm_wire_sched', kind: 'corporate', from: 'Northland Corporate Banking', t: '-2 17:43', read: false,
      title: 'Scheduled wire created: OSIAL/PH3',
      body: ['A scheduled wire has been created on Corporate — Special Collections (Liyue).', 'Amount: ℳ3,000,000 · Beneficiary: Sea Lantern Logistics Co. · Release: Sun 18 Oct, 23:00 (Liyue Harbor time).', 'Initiated by: Office of the Eighth. Authorising signatory: you.', 'If you did not expect this payment, contact Corporate Banking. A freeze placed by the signatory suspends outgoing payments.'],
      action: { text: 'View Payment', open: { statement: 'osial' } },
    },
    {
      id: 'm_travel', kind: 'corporate', from: 'Northland Corporate Banking', t: '-2 10:15', read: false,
      title: 'Card charge posted: Executive Travel ℳ21,400',
      body: ['Executive Travel — Office of Pulcinella charged ℳ21,400 to Corporate — Special Collections (Liyue).', 'Booked by the Office of the Fifth. No Director approval was required for this booking.'],
      action: { text: 'View Charge', open: { statement: 'travel' } },
    },
    {
      id: 'm_policy', kind: 'chairman', from: 'Office of the Chairman', t: '2026-10-12 09:00', read: true,
      title: 'Q4 reminder: Harbinger expense policy',
      body: ['Dear Tartaglia,', 'A friendly reminder, sent to every Harbinger and read, I suspect, by two: osmanthus wine is not a business expense. Nor is fishing tackle. Nor, dear Tartaglia, is “tea”.', 'Your personal accounts are, of course, your own. I merely look at them.', 'Warmly,\nPantalone\nOffice of the Chairman, Northland Bank Group'],
    },
    {
      id: 'm_mandate', kind: 'corporate', from: 'Northland Corporate Banking', t: '2026-10-09 16:03', read: true,
      title: 'Mandate change on Corporate — Special Collections',
      body: ['The signing mandate on Corporate — Special Collections (Liyue) was updated (rev. 4).', 'Countersignature: removed. Sole authorising signatory: Tartaglia, Director of Special Collections.', 'Requested by: Office of the Eighth.'],
    },
    {
      id: 'm_stmt_sep', kind: 'statement', from: 'Northland Bank', t: '2026-10-02 08:00', read: true,
      title: 'Your September statement is ready',
      body: ['Your statement for Personal Current (•••• 1111), 1–30 September 2026, is ready to view in Accounts → Statements.'],
      action: { text: 'View Statement', open: { stmt: 'current:2026-09' } },
    },
    {
      id: 'm_interest', kind: 'statement', from: 'Northland Bank', t: '2026-09-30 23:59', read: true,
      title: 'Interest paid: ℳ2,410',
      body: ['We’ve paid ℳ2,410 interest into Savings — for the kids (Q3, 3.10% AER).', 'Your savings goal: ℳ500,000.'],
    },
    {
      id: 'm_fraud_sep', kind: 'fraud', from: 'Northland Fraud Prevention', t: '2026-09-07 03:12', read: true,
      title: 'We blocked a suspicious payment',
      body: ['We blocked a ℳ1 payment at FNTN*STEAMBIRD-VERIFY (Fontaine) on your Northland Black card •••• 1111.', 'Small “verification” charges are often used to test stolen card details. Your card stays active. If you don’t recognise other payments, freeze your card in the Cards tab.'],
    },
    {
      id: 'm_black', kind: 'info', from: 'Northland Private', t: '2026-08-02 10:00', read: true,
      title: 'Northland Black: 2× Mora rewards at Liuli Pavilion',
      body: ['Through 31 December, earn 2× Mora rewards at Liuli Pavilion and Xinyue Kiosk with your Northland Black card.', 'Our records suggest this will be of interest to you.'],
    },
    {
      id: 'm_otp', kind: 'security', from: 'Northland Security', t: '2026-07-01 12:00', read: true,
      title: 'Never share your one-time code',
      body: ['Northland Bank will never ask you for a one-time code, your passcode or your card PIN — by phone, by message or in person.', 'Not even if the caller says they are from the Office of the Eighth.'],
    },
  ];

  JC.northlandData = { CUR, KIDS, CORP, PAYEES, STANDING, INBOX, all: () => CUR.concat(KIDS, CORP) };
  JC.store.seed('nbinbox', INBOX);

  // ── merge our statement lines into the shared `tx` seed (and into an existing save that predates them) ─────────
  const famOf = (t) => (t.card === 'kids' || t.card === 'corp' ? t.card : 'bank');
  function merge(base, mine) {
    const parse = (x) => (typeof x === 'string' ? JC.time.parse(x) : x);
    const out = base.slice();
    const ids = new Set(out.map((x) => x.id));
    mine.forEach((m) => {
      if (ids.has(m.id)) return;
      const mt = parse(m.t);
      const dup = out.some((x) => famOf(x) === famOf(m) && (x.card == null || famOf(x) !== 'bank' || JC.bank.isBankCard(x.card)) &&
        Math.abs(Math.abs(Number(x.amount) || 0) - Math.abs(m.amount)) < 0.5 && Math.abs(parse(x.t) - mt) <= 45 * 60000);
      if (!dup) out.push(Object.assign({}, m, { t: mt }));
    });
    return out;
  }
  JC.bus.on('boot', () => {
    try {
      const mine = JC.northlandData.all();
      const live = JC.state.d.store && JC.state.d.store.tx;
      if (live) {
        // a save from before these lines existed: add the ones it lacks (only once per save)
        const ap = (JC.state.d.apps = JC.state.d.apps || {});
        const st = (ap.northland = ap.northland || {});
        if (!st.merged) { st.merged = 1; JC.store.set('tx', merge(live, mine)); }
      } else {
        JC.store.seed('tx', merge(JC.store.hasSeed('tx') ? JC.store.all('tx') : [], mine));
      }
    } catch (e) { console.error('[northland] seed merge failed', e); }
  });
})();
