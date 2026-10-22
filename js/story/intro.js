/* Prologue and the lock screen's non-message notifications at 23:47. Owner: S4 (core story).
   Message notifications on the lock screen come from the history threads' unread (`u:1`) messages. */
(function () {
  'use strict';
  const JC = (window.JC = window.JC || {});

  // One line per screen.
  JC.story.intro = [
    'Friday, 11:47 PM. Liyue Harbor.',
    'You came down to the water because you couldn’t sleep. Along the promenade the lanterns are going out, one by one.',
    'Pier 7 is empty. Almost.',
    'A fishing rod lies across the boards. A beautiful one: lacquered, a ribbon still tied near the reel. The line has been cut clean through.',
    'Beside it, a paper cup of osmanthus tea. You touch it. Stone cold.',
    'The planks are soaked in one long, scuffed streak to the edge, as if something went into the sea. Or climbed out of it.',
    'On the bench, face down: a phone. Matte blue case. A little red fish charm, still swinging.',
    'There’s a sticker on the back, in a child’s careful capitals: WORLD’S BEST BIG BROTHER.',
    'You look up and down the pier. No one. Just the sea, breathing against the pilings.',
    'The phone buzzes in your hand.',
    'And again.',
    'And again. Someone, somewhere, very badly wants him to answer.',
  ];

  // Non-message notifications already waiting on the lock screen when the player picks it up.
  JC.story.lockNotifs = [
    { app: 'health', title: 'Hard Fall Detected', body: 'It looks like you’ve taken a hard fall. Pier 7, Liyue Harbor. You didn’t respond, so no one was contacted.', t: '+0 23:24', open: { app: 'health', intent: {} } },
    { app: 'health', title: 'High Heart Rate', body: 'Your heart rate rose above 160 BPM (168) while you seemed to be inactive for 10 minutes.', t: '+0 23:24', open: { app: 'health', intent: {} } },
    { app: 'swift', title: 'Harbor Ride', body: 'How was your trip with Mr. Fang? Liuli Pavilion → Pier 7 · ℳ46. Rate your trip ★★★★★', t: '+0 23:10', open: { app: 'swift', intent: { id: 'ride_1016_2258' } } },
    { app: 'feiyun', title: 'Feiyun Market', body: 'Auction ending soon: Guizhong-era celadon tea set — you were outbid. Current bid ℳ11,200. Ends 00:30.', t: '+0 23:45', open: { app: 'feiyun', intent: { id: 'lot_teaset' } } },
    { app: 'wallet', title: 'Liyue Air', body: 'LA 711 has departed Zapolyarny. Arrives Liyue Harbor International 07:40 (Sat). Shared by Mama ❤️.', t: '+0 23:43', open: { app: 'wallet', intent: {} } },
    { app: 'wavelet', title: 'Ripple', body: '@kabukimono mentioned you in a comment: “@tartaglia the fishwife has gone quiet. how restful.”', t: '+0 23:39', open: { app: 'wavelet', intent: { user: 'kabukimono' } } },
    { app: 'northland', title: 'Northland Bank', body: 'New sign-in to Corporate — Special Collections (Liyue) from Zapolyarny Palace, Snezhnaya. Not you? Freeze your card in the app.', t: '+0 23:36', open: { app: 'northland', intent: {} } },
  ];
})();
