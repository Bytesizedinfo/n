# Stillwater

A website for a lakeside wellness retreat that gets worse the further you scroll.

It opens as an ordinary marketing page for Stillwater, a retreat at Hollin Mere. There's a dawn lake, pricing cards, testimonials and a friendly chat bubble. By the bottom you are forty metres under the water in the flooded church of the village the reservoir drowned in 1891. The congregation is still at the evening service, and your name is on the memorial roll.

Open `index.html` in a browser. It needs no build step and no server.

## How it escalates

| Act | Sections | What changes |
|---|---|---|
| I · Ordinary | hero, press, pillars, stays, stats | Almost nothing: a spire in the lake's reflection, "Departure: —" |
| II · Uncanny | reviews, guides, a day at Stillwater, map | Faces follow the cursor and smile wider; testimonial initials spell H-E-L-P; the schedule runs to 03:33; every road ends at the water |
| III · Wrong | the parish record, FAQ, booking, footer | The page darkens and a waterline rises over it; redactions wash away; the booking form won't let you choose to leave |
| IV · Terror | the descent, memorial, the bottom | The page sinks into the flooded nave; the congregation turns around and comes closer; handprints appear on the glass |

The page footer is a false ending, and the page keeps going below it.

Stay at the very bottom, or try to scroll past it, and something comes up out of the dark. After that the page puts you back at the top, where you're welcomed back by name. The site remembers this on later visits. **Unsubscribe**, under the hero or in the footer, resets it.

## Sound

All sound is synthesised in the browser with the Web Audio API, and nothing plays until you press **Listen to the lake** or the speaker button. The layers follow the scroll:
- lake water and birdsong;
- a pad that drifts out of tune;
- a beating drone;
- bells under the water;
- whispers;
- a heartbeat that speeds up;
- knocking;
- a silence just before the scream, which is very loud.

## Content and accessibility notes

- There is one jump scare at the very end: a sudden full-screen face with a scream. The scream only plays if sound is on. Nothing flashes faster than three times a second.
- With `prefers-reduced-motion` turned on, the shake, sway and drifting effects are switched off and the jump scare becomes a quick fade.
- Every name, place, publication and business on the site is invented.

## Files

```
index.html       markup and all copy, top to bottom
css/site.css     marketing design system plus dread-driven styles
js/dread.js      scroll → dread (0–1) → CSS custom properties, events for the other modules
js/art.js        generated SVG: lake, faces, map, nave, congregation, handprints, the face
js/audio.js      Web Audio engine
js/uncanny.js    text swaps, flickers, counters, cookie banner, FAQ, booking form, tab title
js/chat.js       "Wren", the live-chat assistant
js/finale.js     the descent, memorial, the bottom, the scare and the reset loop
```

Each `<section data-d="…">` sets the dread level at its top edge. To re-pace the page, change those numbers.
