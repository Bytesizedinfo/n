/* Service SMS threads: Northland Bank, Wanmin Go, Harbor Ride, Feiyun Market, Liyue Air. Owner: S4 (core story).
   Formats match the live SMS the apps send (JC.world.bank.sms for the bank). Facts: docs/STORY.md. */
(function () {
  'use strict';
  const JC = (window.JC = window.JC || {});
  const T = JC.story.thread;

  // ── Northland Bank ──────────────────────────────────────────────
  const card = (amt, who, when, t) => [t, 'nbank', '[Northland Bank] Card ••1111: ' + amt + ' at ' + who + ', ' + when + '. Not you? Freeze your card in the Northland app.'];
  const toy = (t, amt, month, extra) => [t, 'nbank', '[Northland Bank] Transfer of ' + amt + ' to M. (MOREPESOK) sent. Ref: TOY COMMISSION — ' + month + (extra ? ' ' + extra : '') + '.'];
  const code = (t, n) => [t, 'nbank', '[Northland Bank] ' + n + ' is your Northland verification code. Never share it, not even with colleagues. Especially not with colleagues.'];
  T({
    id: 'nbank', members: ['nbank'], service: 'sms',
    history: [
      toy('2026-01-01 09:00', 'ℳ25,000', 'DEC', '(+ NEW YEAR)'),
      code('2026-01-03 18:12', '207191'),
      card('ℳ1,180', 'SNEZHNAYA FISH MARKET', '03/01 18:20', '2026-01-03 18:20'),
      toy('2026-02-01 09:00', 'ℳ15,000', 'JAN'),
      toy('2026-03-01 09:00', 'ℳ15,000', 'FEB'),
      ['2026-03-16 07:02', 'nbank', '[Northland Bank] Welcome to Liyue! Your card ••1111 is ready to use in Liyue Harbor. Local support: 95511.'],
      toy('2026-04-01 09:00', 'ℳ15,000', 'MAR', '(+ TEUCER SKATES)'),
      card('ℳ4,260', 'LIULI PAVILION', '09/04 22:03', '2026-04-09 22:03'),
      card('ℳ5,980', 'LIULI PAVILION', '16/04 22:41', '2026-04-16 22:41'),
      card('ℳ1,288', 'WANGSHENG FUNERAL PARLOR (FLORIST)', '22/04 10:15', '2026-04-22 10:15'),
      toy('2026-05-01 09:00', 'ℳ15,000', 'APR'),
      card('ℳ3,980', 'XINYUE KIOSK', '07/05 21:56', '2026-05-07 21:56'),
      code('2026-05-19 23:48', '552034'),
      toy('2026-06-01 09:00', 'ℳ15,000', 'MAY'),
      card('ℳ412', 'THIRD-ROUND KNOCKOUT', '11/06 01:12', '2026-06-11 01:12'),
      card('ℳ7,140', 'LIULI PAVILION', '25/06 22:30', '2026-06-25 22:30'),
      toy('2026-07-01 09:00', 'ℳ15,000', 'JUN'),
      ['2026-07-20 00:00', 'nbank', '[Northland Bank] Happy birthday from all of us at Northland Bank Group! Enjoy 2× points on dining today.'],
      card('ℳ9,320', 'LIULI PAVILION', '20/07 23:02', '2026-07-20 23:02'),
      toy('2026-08-01 09:00', 'ℳ15,000', 'JUL'),
      card('ℳ1,450', 'FEIYUN MARKET', '14/08 16:40', '2026-08-14 16:40'),
      code('2026-08-22 02:31', '118204'),
      toy('2026-09-01 09:00', 'ℳ15,000', 'AUG'),
      card('ℳ2,640', 'FEIYUN MARKET', '12/09 11:05', '2026-09-12 11:05'),
      card('ℳ6,600', 'LIULI PAVILION', '24/09 22:18', '2026-09-24 22:18'),
      toy('2026-10-01 09:00', 'ℳ15,000', 'SEP'),
      ['2026-10-01 09:01', 'nbank', '[Northland Bank] Your September statement is ready. Dining was your top category (71%). Tip: set a monthly dining budget in the Northland app!'],
      card('ℳ5,120', 'LIULI PAVILION', '08/10 22:47', '2026-10-08 22:47'),
      card('ℳ3,600', 'HEYU TEA HOUSE (BOX 2)', '10/10 14:02', '2026-10-10 14:02'),
      code('2026-10-14 09:30', '640117'),
      card('ℳ8,800', 'LIULI PAVILION', '16/10 22:29', '+0 22:29'),
      card('ℳ46', 'HARBOR RIDE', '16/10 23:09', '+0 23:09'),
    ],
  });

  // ── Wanmin Go ───────────────────────────────────────────────────
  T({
    id: 'wanmin', members: ['wanmin'], service: 'sms',
    history: [
      ['2026-04-03 20:12', 'wanmin', 'Wanmin Go: Welcome! Your first order from Wanmin Restaurant (Chihu Rock) is being cooked by Xiangling herself 🔥'],
      ['2026-04-24 23:51', 'wanmin', 'Wanmin Go: Order #W-10482 confirmed. Mapo Tofu ×6, Jade Parcels ×4, Almond Tofu ×6 → Northland Bank, Harbor Road 1 (night desk).'],
      ['2026-04-25 00:22', 'wanmin', 'Wanmin Go: Delivered! Your rider says the building’s fish tank “looked at him”. Rate your meal?'],
      ['2026-05-28 15:08', 'wanmin', 'Wanmin Go: Order #W-11731 confirmed. Osmanthus Tea ×2 (no sugar, not too hot) → Wangsheng Funeral Parlor, Feiyun Slope. Note for rider: “for the consultant. do NOT let him pay (he can’t)”.'],
      ['2026-06-19 21:40', 'wanmin', 'Wanmin Go: Order #W-12960 confirmed. Hotpot Set for Four ×2, Sweet Madame ×1 → Chihu Rock pier steps. Note: “paimon this is NOT all for you”.'],
      ['2026-06-19 21:41', 'wanmin', 'Wanmin Go: Your rider has been intercepted by a small floating customer. Delivery continuing.'],
      ['2026-08-30 02:14', 'wanmin', 'Wanmin Go: Order #W-15502 confirmed. Pelmeni (Snezhnayan, trial batch) ×60 → Northland Bank, Harbor Road 1 (night desk). Chef’s note: “first try!! tell me if your mama would cry (good cry)”.'],
      ['2026-09-17 23:58', 'wanmin', 'Wanmin Go: Order #W-17311 confirmed. Fish Stew ×1, Crystal Shrimp ×1 → Pier 7, Liyue Harbor. Note: “the end of the pier. the guy with the rod.”'],
      ['2026-10-09 12:30', 'wanmin', 'Wanmin Go Rewards: 9/10 stamps! Your 10th order comes with a free portion of Jade Parcels 🥟'],
      ['2026-10-15 22:05', 'wanmin', 'Wanmin Go: Order #W-19044 confirmed. Pelmeni ×40, Borscht ×8 → Northland Bank, Harbor Road 1 (night desk). Note: “for the night shift. lyuba: do NOT freeze them”.'],
      ['2026-10-15 22:41', 'wanmin', 'Wanmin Go: Delivered! Photo left at reception: a very large man in armour giving a thumbs-up.'],
    ],
  });

  // ── Harbor Ride ─────────────────────────────────────────────────
  T({
    id: 'ride', members: ['ride'], service: 'sms',
    history: [
      ['2026-04-02 19:41', 'ride', 'Harbor Ride: Trip complete. Northland Bank → Wangsheng Funeral Parlor · ℳ28.00. Thanks for riding!'],
      ['2026-04-09 19:52', 'ride', 'Harbor Ride: Trip complete. Northland Bank → Liuli Pavilion · ℳ31.00.'],
      ['2026-06-11 00:20', 'ride', 'Harbor Ride: Trip complete. Crux Pier → Bubu Pharmacy · ℳ19.00. Your driver left a note: “hope the other guy looks worse”.'],
      ['2026-10-02 23:15', 'ride', 'Harbor Ride: Trip complete. Liuli Pavilion → Lane of Stone Lions · 2 passengers · ℳ34.00.'],
      ['2026-10-03 10:02', 'ride', 'Harbor Ride Lost & Found: your driver found 1 item after your trip on 02/10: a wallet (brown leather, very old, empty). Reply LOST to arrange its return.'],
      ['2026-10-03 10:40', 'me', 'LOST'],
      ['2026-10-03 10:41', 'ride', 'Harbor Ride: Thanks! The item will be returned to Lane of Stone Lions 6 today.'],
      ['+0 22:52', 'ride', 'Harbor Ride: Your driver Mr. Fang is arriving in a black Lumen Sedan (LY·7712). Pickup: Liuli Pavilion.'],
      ['+0 23:09', 'ride', 'Harbor Ride: Trip complete. Liuli Pavilion → Pier 7 · 22:58–23:09 · 2 passengers · ℳ46.00. Rate Mr. Fang in the app ★'],
    ],
  });

  // ── Feiyun Market ───────────────────────────────────────────────
  T({
    id: 'market', members: ['market'], service: 'sms',
    history: [
      ['2026-08-14 16:41', 'market', 'Feiyun Market: You won “Antique rosewood fishing reel, Mondstadt (c. 1890)” for ℳ1,450. Congratulations!'],
      ['2026-09-12 11:06', 'market', 'Feiyun Market: Order confirmed. Jueyun Premium Oolong, tin ×3 → Lane of Stone Lions 6. Gift message: “for the man who never has his wallet”.'],
      ['2026-09-14 09:30', 'market', 'Feiyun Market: Delivered to Lane of Stone Lions 6. Signed for by: “Z. (I will settle this)”.'],
      ['+0 22:42', 'market', 'Feiyun Market: You’re watching “Guizhong-era celadon tea set, five pieces (Lot 2241)”. Current bid ℳ10,400. Ends Sat 17 Oct, 00:30.'],
      ['+0 22:44', 'market', 'Feiyun Market: Bid placed: ℳ10,600 on Lot 2241. You’re the highest bidder!'],
      ['+0 23:02', 'market', 'Feiyun Market: You’ve been outbid on Lot 2241 “Guizhong-era celadon tea set”. Current bid ℳ11,200 (jade_connoisseur_88). Bid again in the app.'],
    ],
  });

  // ── Liyue Air ───────────────────────────────────────────────────
  T({
    id: 'liyueair', members: ['liyueair'], service: 'sms',
    history: [
      ['-2 16:20', 'liyueair', 'Liyue Air: Booking confirmed. LA 711 Zapolyarny → Liyue Harbor (LHI), Fri 16 Oct 23:40, arr. Sat 17 Oct 07:40. Passengers: TONIA, TEUCER. Booked by: Northland Executive Travel.'],
      ['-2 16:21', 'liyueair', 'Liyue Air: You have been added as the arrival contact for this booking. Return: LA 712 LHI → Zapolyarny, Mon 19 Oct 13:10.'],
      ['+0 11:40', 'liyueair', 'Liyue Air: Online check-in is open for LA 711. Seats 14A and 14B. Have a wonderful trip!'],
      ['+0 23:28', 'liyueair', 'Liyue Air: LA 711 is now boarding at Gate 3, Zapolyarny. Departure 23:40. Have a wonderful flight! 🛫'],
    ],
  });
})();
