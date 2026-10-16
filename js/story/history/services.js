/* Message history — SMS services: Swift Ride, 95588 (Yunmeng Commercial Bank), Lotus Eats. Facts: docs/STORY.md */
(function () {
  'use strict';
  const { story } = window.JC;
  const BANK = '[Yunmeng Commercial Bank] ';

  // ── Swift Ride ───────────────────────────────────────────────────
  story.thread({
    id: 'swift',
    members: ['swift'],
    name: null,
    pinned: false,
    muted: false,
    service: 'sms',
    fails: false,
    history: [
      ['2026-09-16 07:42', 'swift', "[Swift Ride] Your verification code is 4471. It expires in 5 minutes. Never share this code."],
      ['2026-09-23 22:14', 'swift', "[Swift Ride] Trip complete · Lanling South Station → Koi Tower Residences · ¥38.00. Rate your driver in the app."],
      ['-15 10:00', 'swift', "[Swift Ride] Golden Week offer: 15% off rides to Lanling South Station until 7 Oct. Reply TD to unsubscribe."],
      ['-8 06:58', 'swift', "[Swift Ride] Trip complete · Lotus Pier → Yunmeng Station · ¥41.00. Rate your driver in the app."],
      ['+0 23:21', 'swift', "[Swift Ride] Master Wu Lihua has arrived at Koi Tower (云A·9X277). Your trip has started.", { u: 1 }],
      ['+0 23:36', 'swift', "[Swift Ride] Trip complete · Koi Tower → Golden Peony Hotel · 15 min · ¥64.00. Left something behind? Use Report a Lost Item in the app.", { u: 1 }],
    ],
  });

  // ── 95588 · Yunmeng Commercial Bank ──────────────────────────────
  story.thread({
    id: 'bank',
    members: ['bank'],
    name: null,
    pinned: false,
    muted: false,
    service: 'sms',
    fails: false,
    history: [
      ['2022-07-03 14:22', 'bank', BANK + "Supplementary card ending 7781: ¥8,800.00 spent at PET KINGDOM on 07/03 14:22. Not you? Call 95588."],
      ['2024-04-13 22:38', 'bank', BANK + "Card ending 4417: ¥1,486.00 spent at LAOMA HOTPOT (GUSU) on 04/13 22:38."],
      ['2024-12-09 11:50', 'bank', BANK + "Card ending 4417: ¥168.00 spent at LOTUS EATS on 12/09 11:50."],
      ['2025-01-11 14:47', 'bank', BANK + "Supplementary card ending 7781: ¥26,800.00 spent at LANLING MOTORS on 01/11 14:47. Not you? Call 95588."],
      ['2025-01-11 16:32', 'bank', BANK + "Card ending 7781: refund of ¥26,800.00 from LANLING MOTORS on 01/11 16:32."],
      ['2026-02-17 09:40', 'bank', BANK + "Transfer of ¥8,888.00 to JIN LING completed on 02/17 09:40. Note: New Year."],
      ['2026-09-01 08:00', 'bank', BANK + "Scheduled transfer of ¥3,000.00 to JIN LING completed on 09/01 08:00. Note: allowance."],
      ['2026-09-25 09:48', 'bank', BANK + "Card ending 4417: ¥880.00 spent at CLOUD RECESSES TEA SHOP on 09/25 09:48."],
      ['-15 08:00', 'bank', BANK + "Scheduled transfer of ¥3,000.00 to JIN LING completed on 10/01 08:00. Note: allowance."],
      ['-12 16:05', 'bank', BANK + "Card ending 4417: ¥1,260.00 spent at PET KINGDOM (LANLING) on 10/04 16:05."],
      ['-6 11:02', 'bank', BANK + "Your verification code is 739104. Do not share it with anyone, including bank staff."],
      ['-1 15:20', 'bank', BANK + "Card ending 4417: pre-authorization of ¥3,600.00 at GOLDEN PEONY HOTEL on 10/15 15:20."],
      ['+0 23:21', 'bank', BANK + "Card ending 4417: ¥64.00 spent at SWIFT RIDE on 10/16 23:21.", { u: 1 }],
    ],
  });

  // ── Lotus Eats ───────────────────────────────────────────────────
  story.thread({
    id: 'eats',
    members: ['eats'],
    name: null,
    pinned: false,
    muted: false,
    service: 'sms',
    fails: false,
    history: [
      // Wei Wuxian had the flu. Someone who is definitely not Jiang Cheng sent soup.
      ['2024-12-09 11:50', 'eats', "[Lotus Eats] Order confirmed: Auntie Lu's Soup Kitchen (Gusu) → The Jingshi, Cloud Recesses. 1 × Lotus root & pork rib soup (large). Note to rider: \"Don't say who it's from.\""],
      ['2024-12-09 12:41', 'eats', "[Lotus Eats] Delivered! Your order from Auntie Lu's Soup Kitchen has arrived at The Jingshi. Enjoy your meal!"],
      ['2025-12-15 21:05', 'eats', "[Lotus Eats] Order confirmed: Grandma Qin's Kitchen (Lanling) → Koi Tower Residences. Note to rider: \"Tell him to eat the vegetables.\""],
      ['2025-12-15 21:44', 'eats', "[Lotus Eats] Delivered! Your order from Grandma Qin's Kitchen has arrived at Koi Tower Residences."],
      ['2026-03-19 01:12', 'eats', "[Lotus Eats] Order confirmed: Night Owl Congee (Yunmeng) → YMJ Main Office, Lotus Pier. Estimated arrival 01:40."],
      ['2026-03-19 01:38', 'eats', "[Lotus Eats] Delivered! Your order from Night Owl Congee has arrived at YMJ Main Office."],
      ['-5 11:00', 'eats', "[Lotus Eats] Weekend craving? 20% off all hotpot orders until Sunday. Reply TD to unsubscribe."],
      ['-2 13:10', 'eats', "[Lotus Eats] Order confirmed: Tea Leaf Milk Tea (Yunmeng) → YMJ Warehouse B. 38 × Brown sugar milk tea. Note to rider: \"From the boss. Don't make it a thing.\""],
      ['-2 13:52', 'eats', "[Lotus Eats] Delivered! Your order from Tea Leaf Milk Tea has arrived at YMJ Warehouse B."],
    ],
  });
})();
