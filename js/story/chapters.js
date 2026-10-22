/* Chapters — the four days (seven chapters). Facts: docs/STORY.md "Chapters". Owner: S4 (core story).
   Ids, labels, at/until, clockRate, maxWait and cards are fixed by the story bible: other packages schedule against them.

   Settle rule (every chapter): the chapter's required scenes are done and nothing is mid-conversation (the engine's
   default test, `dflt()`), AND the clock has reached the chapter's "floor": the in-game time by which the last pacing
   slot of that chapter has had its chance to play. Players can always move on early with "Later…".

   Short path: if the player refused Childe's deal (`deal_refused`), chapter 1 never settles; the core finale scene
   `core_short` (js/story/scenes/finale.js) jumps to Saturday 7:05, raises Lost Mode and ends the game. */
(function () {
  'use strict';
  const JC = (window.JC = window.JC || {});
  const at = (str) => JC.time.parse(str);
  /** default settle + a clock floor */
  const floor = (str) => (s, dflt) => dflt() && s.now >= at(str);

  JC.story.chapter({
    id: 'fri_night', n: 1, title: 'The Phone on Pier 7', label: 'Friday night',
    at: '+0 23:47', until: '+1 02:40', clockRate: 6, maxWait: 1500,
    card: '',
    settle: (s, dflt) => {
      if (s.flags.deal_refused) return false; // the short path owns the rest of the night
      // the 01:30 call must have been answered, refused or turned into a voicemail
      const dealt = !!(s.flags.deal_childe || s.flags.deal_voicemail);
      return dflt() && dealt && s.now >= at('+1 02:00');
    },
  });

  JC.story.chapter({
    id: 'sat_dawn', n: 2, title: 'Cranes', label: 'Saturday morning',
    at: '+1 06:50', until: '+1 09:40', clockRate: 10, maxWait: 900,
    card: 'Saturday, 6:50 AM. You fell asleep on the couch with his phone on your chest. It’s buzzing.',
    settle: floor('+1 08:20'),
  });

  JC.story.chapter({
    id: 'sat_noon', n: 3, title: 'The Opera', label: 'Saturday afternoon',
    at: '+1 14:20', until: '+1 17:40', clockRate: 12, maxWait: 900,
    card: 'Saturday afternoon. The harbor smells of rain that hasn’t arrived.',
    settle: floor('+1 16:30'),
  });

  JC.story.chapter({
    id: 'sat_night', n: 4, title: 'Yujing Terrace', label: 'Saturday night',
    at: '+1 21:30', until: '+2 01:40', clockRate: 14, maxWait: 1000,
    card: 'Saturday night. The lanterns along Yujing Terrace are being lit for tomorrow.',
    settle: floor('+2 00:30'),
  });

  JC.story.chapter({
    id: 'sun_rite', n: 5, title: 'The Rite of Parting', label: 'Sunday',
    at: '+2 09:30', until: '+2 17:20', clockRate: 27, maxWait: 1000,
    card: 'Sunday, 9:30 AM. All of Liyue is wearing white.',
    settle: floor('+2 16:10'),
  });

  JC.story.chapter({
    id: 'sun_night', n: 6, title: 'Osial', label: 'Sunday night',
    at: '+2 21:00', until: '+3 03:40', clockRate: 21, maxWait: 1100,
    card: 'Sunday night. Out past Guyun, the sea has gone very still.',
    settle: floor('+3 03:05'),
  });

  JC.story.chapter({
    id: 'mon', n: 7, title: 'Northbound', label: 'Monday',
    at: '+3 07:55', until: '+3 18:30', clockRate: 30, maxWait: 1200,
    card: 'Monday. You didn’t sleep much.',
    // the last chapter never auto-advances; the 17:30 hand-back at Pier 7 ends the game (scenes/finale.js)
  });
})();
