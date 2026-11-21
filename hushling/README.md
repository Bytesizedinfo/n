# Hushling

A website for a smart baby monitor that gets worse the further you scroll. It's the companion piece to `../stillwater`.

It opens as a bright product launch page for **Halo**, "the baby monitor that never sleeps. So you can." There's a crescent-moon camera, an app showing a sleeping baby, feature cards and a live demo nursery you can look around. Halo's headline feature is Night Shift, a soothing AI voice that settles your baby so you don't have to get up. The voice is called Nanny, and Nanny is not software.

Open `index.html` in a browser. It needs no build step and no server.

## How it escalates

The page runs on a night clock, from 19:02 at the top to 03:33 at the bottom. It shows on every camera timestamp and on the tab title.

| Act | Sections | What changes |
|---|---|---|
| I · Ordinary | hero, press, features, sleep report | Almost nothing: the sleep report counts "Visitors: 0" |
| II · Uncanny | live demo, parent reviews, cry translator | In the demo nursery, night vision shows someone in the corner, a little closer each time you switch it on. The breathing graph gains a second, slower breather. "In the room: 2". The baby turns to look at the camera, and the rocking chair rocks by itself. Hold to talk, and something says "shh" back. Cry translations drift from "Hungry 92%" to "Saying her name 99%" |
| III · Wrong | Night Shift transcript, setup, FAQ, activity log, shop | The site switches to the app's night mode. Night Shift can't be turned off. Setup ends "Let Halo be your voice". The activity log fills in the night. The basket says "Already in your home" |
| IV · Terror | the app takes over | Full-screen infrared: the cot empties, the camera pans by itself, then cuts to the parents' room and finally to the front camera of the phone you're holding |

A picture-in-picture monitor and push notifications follow you down the page, the way the Wren chat did in Stillwater. The PiP label changes from "Demo nursery" to "Your nursery".

The footer is a false ending. At the bottom, "Goodnight." appears, and a moment later her face fills the screen. Then the page goes back to the top: "Welcome back. Halo kept watch while you were away. Visitors: 1." The site remembers this on later visits. **Unsubscribe**, under the hero or in the footer, resets it.

The baby is never shown harmed. The horror is implied: an empty cot, and Nanny holding her in the parents' room.

## Sound

Everything is synthesised in the browser with the Web Audio API. Nothing plays until you press **Hear Halo's lullaby**, the speaker button, or the Lullaby control in the demo. The sounds are:
- monitor hiss and room tone;
- an original music-box lullaby that slows down, drifts out of tune and slips into a minor key;
- a baby breathing, then something else breathing;
- whispered "shh";
- a heartbeat;
- static at each camera cut;
- the scream.

## Content and accessibility notes

- There is one jump scare at the very end. It only screams if sound is on.
- Nothing flashes faster than three times a second.
- `prefers-reduced-motion` turns the shake into a quick fade.
- Every brand, person, publication and place is invented.

## Files

```
index.html       markup and all copy
css/site.css     design system plus dread-driven styles
js/dread.js      scroll → dread (0–1) → CSS variables, plus the night clock (same engine as Stillwater)
js/art.js        generated SVG: Halo, parent faces (Stillwater's parametric face), the nursery in colour and
                 infrared, the parents' room, the front camera, sprites, the final face
js/feed.js       the canvas camera feed used four times (hero phone, demo, picture-in-picture, takeover)
js/audio.js      Web Audio engine
js/uncanny.js    text swaps, the monitors and their controls, notifications, translator, Night Shift, log, shop
js/finale.js     the takeover's camera sequence, the scare and the reset loop
```

Each `<section data-d="…">` sets the dread level at its top edge. Change those numbers to re-pace the page.
