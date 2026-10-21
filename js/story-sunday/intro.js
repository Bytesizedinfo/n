/* Prologue (one line per screen) and the non-message notifications waiting on the lock screen at 23:47.
   Sunday edition: the prologue plants the one question (who sits at the table on Sunday).
   Message notifications come from history messages marked { u: 1 }. Facts: docs/STORY.md */
(function () {
  'use strict';
  const JC = window.JC;

  JC.story.intro = [
    '11:47 PM. Friday. Lanling.',
    'It’s raining the soft, stubborn way it only rains here in October.',
    'A taxi pulls up outside the Golden Peony Hotel just as you give up on finding one. You don’t ask questions. You get in.',
    'The driver — Master Wu, says the card on the dashboard — hums along to a late-night call-in show. Someone is dedicating a song to their kid, who turns eighteen on Sunday.',
    'The back seat smells of rain and someone else’s expensive cologne.',
    'Something hard presses into your hip, wedged deep between the cushions.',
    'A phone. Matte purple case. Not yours.',
    'You turn it over in your hands. No name. No sticker. Nothing to say whose life this is.',
    'You should give it to the driver.',
    'It buzzes in your palm before you can.',
    'Then again. And again. Under the clock, a calendar widget: Sun · A-Ling turns 18 🎂.',
    'Somewhere a table is being set for Sunday. Nobody has decided yet who sits at it.',
  ];

  JC.story.lockNotifs = [
    { app: 'health', title: 'High Heart Rate', body: 'Your heart rate rose to 121 BPM at 22:50 while you seemed to be inactive.', t: '+0 22:50' },
    { app: 'calendar', title: 'Tea? — Hanshi', body: 'Tomorrow, 15:00 · The Hanshi, Cloud Recesses', t: '+0 23:00' },
    { app: 'calendar', title: 'Dinner — Lotus Pier (?)', body: 'Sunday, 18:30 · Lotus Pier · A-Ling turns 18', t: '+0 23:01' },
    { app: 'phone', title: 'Missed Call', body: 'A-Ling', t: '+0 23:05' },
    { app: 'phone', title: 'Missed Calls', body: '🐶 DO NOT ANSWER (3)', t: '+0 23:12' },
    { app: 'phone', title: 'Voicemail', body: 'New voicemail from 🐶 DO NOT ANSWER', t: '+0 23:13' },
    { app: 'mail', title: 'Golden Peony Hotel', body: 'Turndown service complete · Room 1808. Rest well, Mr. Jiang.', t: '+0 23:30' },
    { app: 'swift', title: 'Swift Ride', body: 'How was your ride with Master Wu Lihua? Rate your trip — or report a lost item.', t: '+0 23:37' },
    { app: 'wavelet', title: 'Wavelet', body: '@teaspiller_qh mentioned you in a post: “#BalconyGate 👀”', t: '+0 23:38' },
  ];
})();
