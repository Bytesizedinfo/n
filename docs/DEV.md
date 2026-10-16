# Jiang Cheng's Phone — Developer Guide

Vanilla HTML/CSS/JS, no build step, no frameworks. Every file is a classic script that attaches to the global
namespace `window.JC`. Files load in the order listed in `index.html`. Story/content files only *register* data at load
time; nothing runs until `JC.boot()` at the end.

Read `docs/STORY.md` for every fact about the characters and the world.

## Golden rules
1. **No dead UI.** Every element that looks tappable must do something real: navigate, open a sheet, toggle, edit data,
   play a sound, or show a believable in-world alert. Give tappable elements the `.tap` class (or use the kit helpers,
   which do it for you) and attach the handler with `onTap`. Run `index.html#audit` to list tappable elements with no handler.
2. **iOS 26 look.** Use the kit (`JC.ui.*`) and the CSS tokens (`var(--label)`, `var(--blue)` …). Never hard-code a
   colour that only works in light or only in dark mode. The phone has its own appearance (light/dark) via
   `#screen.dark`; your CSS must look right in both.
3. **Logical points.** The screen is 402 × 874 CSS px (iPhone 17 Pro points). Never use `vh`/`vw` inside the phone.
   Use `var(--safe-top)` (54px, status bar + island) and `var(--safe-bottom)` (34px, home indicator) for padding.
4. **Own your files.** Only edit the files your task owns. If you need something from core, write a note in
   `docs/REQUESTS.md` and work around it locally.
5. **Story acts.** Apps must report meaningful player actions with `JC.story.act(name, payload)` (list below) so the
   story can react.
6. **No external resources** except Google Fonts (already loaded). No images from the web. Illustrations come from `JC.art`.
7. Never use `alert()`, `confirm()`, `prompt()`; use `JC.ui.alert` etc.

## File map
```
index.html             loads everything (order matters)
css/os.css             frame, lock, home, status bar, island, CC, notification UI, keyboard   (core)
css/ui.css             kit components: nav bars, lists, controls, sheets, alerts, menus        (core)
css/apps/<app>.css     one stylesheet per app (owned by that app's author)
js/core/util.js        JC.h, JC.util
js/core/state.js       JC.state  (persistence, rewind)
js/core/time.js        JC.time   (in-game clock)
js/core/store.js       JC.store  (app data collections)
js/core/icons.js       JC.icon, app icons
js/core/art.js         JC.art    (illustration registry & renderer)
js/core/audio.js       JC.audio
js/core/keyboard.js    JC.kb     (on-screen iOS keyboard)
js/core/ui.js          JC.ui     (component kit)
js/core/notify.js      JC.notify (banners, notification center, badges)
js/core/os.js          JC.os     (springboard, lock screen, gestures, control center, app windows)
js/core/story.js       JC.story  (branching engine)
js/core/boot.js        JC.boot
js/data/contacts.js    JC.contacts
js/art/*.js            illustrations
js/apps/<app>.js       one file per app
js/story/history/*.js  pre-existing message threads
js/story/scenes/*.js   live branching scenes, calls, endings
```

## DOM helper — `JC.h(selector, props?, ...children)`
```js
const { h } = JC;
h('div.row.tap', { onTap: () => open(), style: { color: 'var(--red)' } }, 'Delete')
h('button.btn#save', { onTap, disabled: false, data: { id: 3 } }, [icon, 'Save'])
```
- selector: `tag.class.class#id` (tag defaults to `div`).
- props: `class` (string|array|object), `style` (string|object, supports `--vars`), `onTap`/`onClick` (click, marks
  the element tappable for the audit), any `onEvent` (lower-cased event name), `html`, `text`, `data`, `attrs`, `ref(el)`,
  plus element properties (`value`, `placeholder`, `type` …).
- children: strings, numbers, nodes, arrays, `null`/`false` (skipped).
- `JC.util`: `clamp, lerp, uid(prefix), wait(ms), esc(str), debounce, throttle, pick(arr), shuffle, fmtTime(ms|Date),
  fmtDate(ms, style), fmtRelative(ms), fmtDur(sec), longPress(el, fn), drag(el, handlers)`.

## In-game time — `JC.time`
- The night starts **Fri 16 Oct 2026 23:47**. `JC.time.now()` → ms (in-game), `JC.time.date()` → Date.
- `JC.time.parse(str)` accepts `'-3 21:04'` (3 days before 16 Oct at 21:04), `'+0 23:12'` (16 Oct), `'+1 07:40'`
  (Sat 17 Oct), `'2009-02-12 18:30'` (absolute), `'23:12'` (16 Oct).
- Events on `JC.bus`: `tick` (each second), `minute`.

## Event bus — `JC.bus.on(name, fn)` / `off` / `emit` / `once`

## Persistent app data — `JC.store`
Collections of plain objects with an `id`. Seed data is registered by the app that owns the collection; the story may
add items. Mutations are persisted automatically.
```js
JC.store.seed('notes', [ { id: 'n1', ... }, ... ]);   // at load time (owner app file)
JC.store.all('notes')            // array (do not mutate directly)
JC.store.get('notes', 'n1')
JC.store.add('notes', item, { front: true })   // returns item (id generated if missing)
JC.store.update('notes', 'n1', { body: '...' })
JC.store.remove('notes', 'n1')
JC.store.on('notes', fn)         // fn(collection) after any change; returns unsubscribe
```
### Collection schemas (owners must honour these; the story writes them)
- `notes` `{id, folder:'notes'|'personal'|'work', title, body, t, created, pinned, locked}` (body plain text; lines
  `- [ ] x` / `- [x] x` render as checklist; a locked note asks for the passcode 181008).
- `photos` `{id, art, t, albums:[], fav, people:[], place, caption, kind:'photo'|'screenshot'|'live'|'video', dur}`
- `albums` `{id, title, cover}`
- `events` `{id, cal:'work'|'home'|'family'|'birthdays', title, start, end, allDay, location, notes, tentative}`
- `reminders` `{id, list, title, done, due, notes, flagged}`; `remlists` `{id, title, color, icon}`
- `mail` `{id, box:'inbox'|'sent'|'drafts'|'junk'|'trash'|'archive', from:{name, addr}, to:[{name, addr}], subject, body, t, read, flagged, attach:[{name, art}]}`
- `calls` `{id, contact, num, t, dir:'in'|'out'|'missed', dur, video}`
- `voicemails` `{id, contact, num, t, dur, text, heard}`
- `memos` `{id, title, t, dur, text, place, fav}`
- `posts` `{id, by, t, art, text, likes, liked, comments:[{by, text, t}]}` (`by` = Wavelet handle)
- `tx` `{id, card, merchant, amount, t, cat, note}`
- `orders` `{id, rest, items:[{name, qty, price}], total, t, status, to}`
- `rides` `{id, from, to, t, end, price, driver:{name, car, plate, rating}, status}`
- `places` `{id, name, city, x, y, cat, addr, phone, hours, rating, desc}` (Maps owns; ids from STORY.md)
- `history` (Safari) `{id, url, title, t}`

## Contacts — `JC.contacts`
`JC.contacts.get(id)`, `JC.contacts.all()`, `JC.contacts.name(id)` (saved display name), `JC.contacts.full(id)`
(real full name). Contact fields: `id, first, last, display, nick, avatar, phones:[{label,num}], emails:[{label,addr}],
bday, company, title, address, notes, fav, color, related:[{label,id}], wavelet, idle:[], dial, voicemail`.
`JC.ui.avatar(idOrSpec, size)` renders an avatar.

## Illustrations — `JC.art`
```js
JC.art.def('p_fairy_roof', {
  title: 'Fairy on the car roof',
  w: 1200, h: 900,                 // viewBox size; photos 4:3 (1200×900), portrait 900×1200, wallpapers 1206×2622
  tags: ['dog', 'night'],
  svg: (w, h) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">…</svg>`,
});
JC.art.url(id)            // data: URI (cached) — use as <img src> or background-image
JC.art.el(id, { cls, fit: 'cover'|'contain' })   // element with the image
JC.art.has(id), JC.art.meta(id)
```
Unknown ids render a tasteful placeholder, so referencing an id that does not exist yet never breaks.
SVGs are rendered as images (data URIs) so `id`s inside different SVGs never collide. Keep each SVG under ~25 KB and
avoid heavy filters (one light grain `feTurbulence` max).

## Icons — `JC.icon(name, { size = 22, cls })`
SF-Symbol-like outline/filled glyphs, `currentColor`. Names: see `JC.icon.names()` (e.g. `chevron.left`,
`chevron.right`, `plus`, `xmark`, `magnifyingglass`, `square.and.pencil`, `ellipsis`, `ellipsis.circle`, `trash`,
`heart`, `heart.fill`, `star`, `star.fill`, `phone.fill`, `video.fill`, `message.fill`, `envelope`, `info.circle`,
`checkmark`, `play.fill`, `pause.fill`, `forward.fill`, `backward.fill`, `mic.fill`, `camera.fill`, `photo`, `gear`,
`person.fill`, `person.crop.circle`, `location.fill`, `paperplane.fill`, `arrow.up`, `square.and.arrow.up`, `folder`,
`bell.fill`, `moon.fill`, `wifi`, `airplane`, `bolt.fill`, `lock.fill`, `flag.fill`, `clock`, `calendar`, `map`, `house.fill` …).
Apps may add icons with `JC.icon.add({ name: '<svg path markup in a 24×24 box>' })` from their own file.

## Sounds — `JC.audio.play(name)`
`tap, key, key.delete, key.space, send, receive, notify, lock, unlock, shutter, ring, ring.stop, alert, error, swoosh,
tink, success`. `JC.audio.ctx()` returns the AudioContext (created after the first user gesture). `JC.audio.out` is the
media output node (respects the volume setting).

## UI kit — `JC.ui`
Everything below returns DOM elements or small controller objects.

### Navigation
```js
// inside an app's launch(win):
const nav = JC.ui.nav(win.body, () => rootPage());
function rootPage() {
  return JC.ui.page({
    title: 'Notes', large: true, tint: 'var(--yellow-ui)',
    right: [ JC.ui.navBtn({ icon: 'ellipsis', onTap: (e) => JC.ui.menu(e.currentTarget, [...]) }) ],
    search: { placeholder: 'Search', onInput: (q) => page.render() },
    bg: 'grouped',                       // 'grouped' | 'plain' | any css colour
    content: (page) => [ JC.ui.list([...]) ],   // re-run by page.render()
    toolbar: [ JC.ui.spacer(), h('div.tb-label', '12 Notes'), JC.ui.navBtn({ icon: 'square.and.pencil', onTap }) ],
    onShow, onHide,
  });
}
nav.push(page) / nav.pop() / nav.popToRoot() / nav.top() / nav.replace(page)
page.render() / page.setTitle(t) / page.scroll (the scroll element) / page.el
```
Pages get the iOS 26 nav bar (glass back button, large title collapsing into an inline title on scroll), edge-swipe back.
`JC.ui.tabs(win.body, { tabs: [{ id, title, icon, root: () => page }], active, onChange })` builds an app with a floating
glass tab bar and one nav stack per tab; returns `{ select(id), nav(id), current() }`.

### Lists
```js
JC.ui.list([
  { header: 'Connectivity', footer: 'Footer text', rows: [
    { icon: { glyph: 'airplane', bg: 'var(--orange)' }, title: 'Airplane Mode', toggle: { on, onChange } },
    { icon: { glyph: 'wifi', bg: 'var(--blue)' }, title: 'Wi-Fi', detail: 'Golden Peony Guest', chevron: true, onTap },
    { title: 'Name', subtitle: 'Second line', avatar: 'jl', detail: '11:47', onTap,
      swipe: [{ text: 'Delete', color: 'var(--red)', icon: 'trash', onTap }],   // trailing swipe actions
      lead: [{ text: 'Pin', color: 'var(--orange)', onTap }] },
    { title: 'Sign Out', destructive: true, center: true, onTap },
    { custom: someElement },
  ]},
], { style: 'inset' | 'plain' })
```
Rows without `onTap` and without a control render as plain (non-tappable) rows.

### Controls
`JC.ui.btn({ text, icon, onTap, kind: 'plain'|'filled'|'tinted'|'gray'|'glass', size: 's'|'m'|'l', tint })`,
`JC.ui.navBtn({ icon | text, onTap, prominent })` (glass circle / capsule),
`JC.ui.toggle({ on, onChange })`, `JC.ui.segmented({ items: [...labels], value, onChange })`,
`JC.ui.slider({ value, min, max, step, onInput, icons: [leftGlyph, rightGlyph] })`,
`JC.ui.stepper({ value, min, max, onChange })`,
`JC.ui.search({ placeholder, onInput, onSubmit })`,
`JC.ui.input({ placeholder, value, onInput, onSubmit, multiline, enterkey: 'send'|'search'|'done'|'go'|'return' })` —
real `<input>/<textarea>` wired to the on-screen keyboard (desktop typing works too).
`JC.ui.wheel({ cols: [{ items: [...], value }], onChange })` (iOS picker wheel),
`JC.ui.spacer()`, `JC.ui.empty({ icon, title, text })`, `JC.ui.badge(n)`.

### Overlays (mounted inside the current app window, or the system layer)
```js
await JC.ui.alert({ title, message, buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive' }], input: { placeholder } })
// resolves { index, text, value }
JC.ui.actionSheet({ title, message, actions: [{ text, style, onTap }] })
const s = JC.ui.sheet({ title, left: { text: 'Cancel' }, right: { text: 'Done', bold: true, onTap }, content: (sheet) => node, detent: 'medium'|'large', onClose }); s.close()
JC.ui.menu(anchorEl, [{ text, icon, onTap, destructive, checked }, '-' /* separator */])
JC.ui.contextMenu(el, () => ({ items: [...], preview: optionalNode }))   // long-press
JC.ui.toast(text, { icon })
JC.ui.share({ title, subtitle, art, text, kind: 'photo'|'link'|'text'|'memo', payload, actions: [...] })
```
`JC.ui.share` shows contacts (sending really posts into that Messages thread via `JC.story.send`), apps, and actions.

## App registration — `JC.app(def)`
```js
JC.app({
  id: 'notes', name: 'Notes',
  status: 'dark',                 // status bar text colour on this app: 'dark' (black text) | 'light' | 'auto' (follows appearance)
  launch(win, intent) {           // called once when the app is first opened (or after it was killed)
    // win.body  : element to render into (full screen, under status bar)
    // win.setStatus('light'|'dark'|'auto')
    // win.close()  go home
    return {
      intent(intent) {},          // deep link while running, e.g. { thread: 'wwx' }
      show() {}, hide() {},       // foreground/background
      back() { return true },     // optional: handle edge-swipe/Esc; return true if handled
    };
  },
});
JC.os.open('messages', { thread: 'wwx' })   // open an app (with optional intent)
JC.os.home()
JC.os.setWallpaper(id) / JC.os.setAppearance('light'|'dark'|'auto') / JC.os.dark (bool)
JC.os.toggles (wifi, bt, airplane, focus, silent, flashlight, lowPower, rotationLock) / JC.os.setToggle(key, on)
JC.os.lostMode({ message, phone })   // finale
JC.os.battery()                       // percent
```
Badges: `JC.notify.badge(appId, n)`. Notifications: `JC.notify.push({ app, title, subtitle, body, avatar, art,
open: { app, intent }, thread })`.

## Story engine — `JC.story`

### Authoring: threads (history)
```js
JC.story.thread({
  id: 'wwx',                 // thread id (DMs use the contact id)
  members: ['wwx'],          // contact ids, not including 'me'
  name: null,                // group name (groups only)
  pinned: true, muted: false,
  service: 'imessage',       // 'imessage' (blue) | 'sms' (green)
  fails: false,              // true: everything the player sends shows "Not Delivered" (A-Jie)
  history: [
    ['-2 21:03', 'wwx', 'jiang cheng'],
    ['-2 21:03', 'wwx', 'jiang cheng!!!'],
    ['-2 21:30', 'me',  'What.'],
    ['-2 21:31', 'wwx', '', { img: 'p_radishes' }],
    ['+0 23:40', 'wwx', 'u left without saying bye!!! rude.', { u: 1 }],   // u:1 = unread (shows on the lock screen)
  ],
});
```
History tuple: `[time, from, text, extra?]` — `from` is `'me'` or a contact id; `extra` may contain:
`u:1` (unread), `img:'artId'`, `voice:{ dur: 12, text: 'transcript' }`, `link:{ title, site, art, url }`,
`loc:{ place: 'koi-tower' }`, `react:[{ by: 'me'|'wwx', t: 'love'|'like'|'dislike'|'haha'|'emph'|'q' }]`,
`unsent:true`, `edited:true`, `fail:true` (Not Delivered), `effect:'slam'|'loud'|'gentle'|'invisible'`,
`sys:true` (centered system line, e.g. "Wei Wuxian named the conversation …"), `sticker:'🐶'`.
A message whose text is only 1–3 emoji renders large automatically.

### Authoring: scenes (live, branching)
```js
JC.story.scene({
  id: 'jl_car',
  thread: 'jl',                         // default thread for steps
  trigger: { on: 'unlock', delay: 180 },
  when: (s) => !s.flags.burned,         // optional guard checked when the trigger fires
  nodes: {
    start: [
      { m: 'jiujiu' },
      { m: 'jiujiu', d: 0.6 },
      { m: 'JIUJIU' },
      { m: 'ok dont be mad', img: 'p_fairy_roof' },
      { choice: [
          { t: 'JIN LING.', fx: { aff: { jl: 1 } }, go: 'yell' },
          { t: 'Are you hurt?', fx: { aff: { jl: 2 } }, go: 'hurt' },
          { t: "It's okay sweetie, cars can be replaced 🥰", fx: { sus: { jl: 4 } }, go: 'sweet' },
          { t: '[Leave him on read]', silent: true, go: 'ignored' },
        ], timeout: 90, onTimeout: 'ignored' },
    ],
    yell: [ { m: 'ok good ur normal' }, ... , { fx: { set: { car_handled: true } } } ],
  },
});
```
**Triggers**: `{ on: 'unlock', delay }` (seconds after the phone is first unlocked), `{ on: 'scene', scene, delay }`
(after another scene finishes), `{ on: 'flag', flag, delay }` (when a flag becomes truthy),
`{ on: 'act', act: 'memo_play', match: (p) => p.id === 'memo14', delay }`, `{ on: 'open', thread: 'ajie' }` or
`{ on: 'open', app: 'voicememos' }`, `{ on: 'time', at: '01:10' }` (in-game time), `{ on: 'manual' }` (started by a
`start` step). Delays are in seconds of play time.

**Steps** (a node is an array of steps, executed in order):
| step | meaning |
|---|---|
| `{ m: 'text', from, d, img, voice, link, loc, effect, th }` | Message from a contact (typing indicator first; `d` = typing seconds, default from length). `from` required in groups. `th` sends to another thread. |
| `{ me: 'text', img, th }` | Message sent automatically as the player. |
| `{ choice: [opt…], timeout, onTimeout }` | Wait for the player. Option: `{ t, label, go, fx, silent, send:[…extra bubbles], if: s => bool }`. `t` is the text sent; `label` (optional) is shown on the button instead; `silent: true` sends nothing. Timeout seconds start when the player has the thread open. |
| `{ fx: { set: {flag: v}, sus: {id: n}, aff: {id: n}, inc: {counter: n} } }` | Effects (options may carry `fx` too). |
| `{ go: 'node' }` | Jump. |
| `{ if: (s) => bool, go: 'a', else: 'b' }` | Branch (`else` optional = continue). |
| `{ start: 'sceneId', delay }` | Start another scene. |
| `{ wait: seconds }` | Pause. |
| `{ typing: seconds, from }` | Typing indicator that stops without a message. |
| `{ react: 'haha'\|'love'\|'like'\|'dislike'\|'emph'\|'q', from, on: 'me'\|'them' }` | Tapback on the last message (default the player's). |
| `{ unsend: true, from }` | The contact unsends their last message. |
| `{ sys: 'text' }` | System line in the thread ("Lan Jingyi added Jin Ling to the conversation."). |
| `{ add: { to: 'notes'\|'mail'\|'events'\|…, item: {...}, notify: true } }` | Add app data. |
| `{ notify: { app, title, body, open } }` | A notification from any app. |
| `{ call: 'callId', delay }` | Incoming call (see calls). |
| `{ time: '+20m' \| '07:38', card: 'Optional narrator line' }` | Move the in-game clock (with `card` a full-screen "time passes" moment). |
| `{ run: (api) => {} }` | Escape hatch (api = `{ state, os, store, story, notify }`). |
| `{ ending: 'id' }` / `{ endings: ['id', …] }` | Finish the game with an ending (the first id is shown; all are unlocked). |
| `{ end: true }` | End the scene now. |

`s` (in `when`, `if`, `opt.if`) is the live state: `s.flags`, `s.sus`, `s.aff`, `s.done` (scene ids started),
plus helpers `s.susTotal()`.

### Authoring: calls
```js
JC.story.call({
  id: 'call_wn', from: 'wn', video: false,
  missed: [ { start: 'wn_texts_after_missed' } ],   // steps run if declined / unanswered (rings 25 s)
  voicemail: 'Mr. Jiang, it's Wen Ning…',           // optional voicemail left when missed
  nodes: {
    start: [ { say: 'M-Mr. Jiang? It's Wen Ning. Sorry. Jin Ling said…' },
             { choice: [ { t: '(Stay silent)', go: 'silent' }, { t: '"…Mm."', go: 'mm' }, { t: 'Tell him the truth', go: 'truth' } ] } ],
    silent: [ { say: '…Mr. Jiang? Your breathing sounds… different.' }, { hangup: true } ],
  },
});
JC.story.dialScript('jl', 'call_jl_out', (s) => s.flags.car_handled);   // what happens when the PLAYER calls jl
```
Call steps: `say` (line from the caller, shown as live captions), `choice` (player options; spoken lines in quotes,
actions in parentheses), `hangup` (they hang up), plus every normal step. Unscripted outgoing calls get a sensible
default (rings, then voicemail or "Jiang Cheng? Hello?" with options to hang up, stay silent, or tell the truth).

### Authoring: endings & intro
```js
JC.story.ending({ id: 'reunited', n: 9, title: 'Lotus Pier, Reunited', tag: 'Family', art: 'end_reunited',
  hint: 'Some invitations are thirteen years late. Send them anyway.',
  text: ['paragraph', '…'], jc: ['When Jiang Cheng got his phone back…', '…'] });
JC.story.intro = ['11:47 PM. Lanling.', 'The taxi smells like rain…', …];   // prologue lines, one per screen
JC.story.lockNotifs = [ { app: 'phone', title: 'Missed Call', body: '🐶 DO NOT ANSWER (3)', t: '+0 23:12' } ];
JC.story.onSuspicion('nhs', 8, 'caught_nhs');   // start scene when suspicion reaches a threshold
JC.story.onTotalSuspicion(25, 'caught_total');
```
Contact flavour used by the engine for unscripted messages lives on the contact (`idle`, `confused`, `voiceReact`,
`imgReact`, `dogReact`, `confess`) — set them in `js/story/flavor.js`.

### Runtime API (apps)
```js
JC.story.threads()            // [{ id, name, members, group, pinned, muted, unread, last, typing }]
JC.story.messages(threadId)   // normalized: { id, t, from, text, img, voice, link, loc, react:[], unsent, edited, fail, effect, sys, sticker, status:'sent'|'delivered'|'read'|'failed', readAt }
JC.story.pending(threadId)    // null | { options: [{ i, label, text, silent }] }
JC.story.choose(threadId, i)
JC.story.send(threadId, { text } | { img } | { voice } | { loc } | { memo })   // free message from the player
JC.story.typing(threadId)     // contact id currently typing, or null
JC.story.setOpen(threadId|null), JC.story.markRead(threadId)
JC.story.react(threadId, msgId, type), JC.story.pin(threadId, on), JC.story.mute(threadId, on), JC.story.remove(threadId)
JC.story.threadFor(contactId) // DM thread id (created on demand)
JC.story.sus(contactId), JC.story.susTotal(), JC.story.flag(name)
JC.story.act(name, payload)   // report player actions
JC.story.dial(contactId, { video })   // player places a call
JC.story.call()               // current call state or null
JC.story.answer(), JC.story.decline(), JC.story.callChoose(i), JC.story.hangup()
JC.story.endings()            // [{ id, n, title, tag, hint, unlocked, at }]
JC.story.rewind(), JC.story.restart()
```
Bus events: `story:thread` ({ thread }), `story:threads`, `story:typing` ({ thread, who }), `story:pending` ({ thread }),
`story:call` (call state), `story:ending` ({ id }).

### Story acts (apps MUST emit these)
| app | act | payload |
|---|---|---|
| OS | `open_app` | `{ app }` (automatic) |
| Messages | `open_thread`, `send`, `tapback` | `{ thread }`, `{ thread, kind, text, art }`, `{ thread, msg, t }` |
| Voice Memos | `memo_play`, `memo_share`, `memo_delete` | `{ id }`, `{ id, to }`, `{ id }` |
| Photos / Camera | `photo_view`, `photo_delete`, `photo_fav`, `photo_taken` | `{ id }` |
| Notes | `note_open`, `note_edit` | `{ id }` |
| Safari | `visit` | `{ url }` |
| Maps / Find My | `place_view`, `directions`, `findmy_sound`, `findmy_view` | `{ place }`, `{ place }`, `{ id }`, `{ id }` |
| Lotus Eats | `order` | `{ rest, total, to }` |
| Swift Ride | `ride_view`, `ride_report_lost` | `{ id }`, `{}` |
| Wavelet | `post`, `like`, `comment`, `dm` | `{ text, art }`, `{ post }`, `{ post, text }`, `{ to, text }` |
| Lotus Leap | `game_score` | `{ score }` |
| Phone | `voicemail_play` | `{ id }` |
| Mail | `mail_open`, `mail_send` | `{ id }`, `{ to, subject, body }` |
| Calendar | `event_open`, `event_add` | `{ id }` |
| Settings | `setting` | `{ key, value }` |

## App author guide (read before writing an app)

### Files, naming, loading
- Your app lives in `js/apps/<id>.js` (+ optional extra files `js/apps/<id>-*.js`) and `css/apps/<id>.css`.
  After creating or renaming a file run `python3 tools/manifest.py` (regenerates `js/manifest.js`, which `index.html`
  and the bundler use). Do not edit `index.html`.
- **Prefix every CSS class you invent** with a short app prefix (`msg-`, `ph-`, `mail-`, `ntz-` …) and scope rules under
  your window body class (add one in `launch`: `win.body.classList.add('app-notes')`). Never style bare kit classes
  globally (`.row`, `.list`, `.page`, `.btn` …) — override them only inside `.app-<id> …`.
- Read `js/apps/calculator.js` for the pattern. `launch(win, intent)` builds the UI once; return `{ intent, show, hide, back, destroy }`.
- Seeds: `JC.store.seed('<collection>', [...])` at the top level of your file (runs at load). Times may be strings in
  the `JC.time.parse` formats ('-3 21:04', '+0 23:21', '2009-02-12 18:30').
- Listen for changes with `JC.store.on(col, fn)`, `JC.bus.on('story:thread', fn)` etc. and re-render (`page.render()`).
- Things that must exist before your app is opened (badges, island activities) go in `JC.bus.on('boot', () => {...})`.

### Look & feel checklist (iOS 26)
- Nav bars: glass circle/capsule buttons (`JC.ui.navBtn`), large titles that collapse on scroll (`large: true`).
- Lists: inset grouped, 26px radius sections (`JC.ui.list`). Separators inset. Row heights ≥ 44.
- Tab bars: floating glass capsule (`JC.ui.tabs`).
- Sheets slide up with grabber; alerts are capsule-button glass cards (`JC.ui.sheet`, `JC.ui.alert`).
- Colours only from tokens: `--bg --bg2 --gbg --cell --label --label2 --label3 --sep --fill* --blue --green --red --orange
  --yellow --pink --purple --indigo --teal --tint --glass --glass-strong --material`. Both light and dark must look right
  (Settings → Display can switch; test both by toggling `JC.os.setAppearance('dark')`).
- Typography: SF-style stack is inherited. Sizes: large title 34/700, title 28, headline 17/600, body 17, subhead 15,
  footnote 13, caption 12. Use `font-variant-numeric: tabular-nums` for digits in columns.
- Every tappable thing: `onTap` (via `JC.h` or `JC.ui.onTap`). Long-press menus via `JC.ui.contextMenu` where iOS has them.
- Keep the app usable at screen heights from 600 to 874 px (`var(--H)`), and with the keyboard open (window shrinks).

### Shared runtime hooks you may need
- `JC.os.island.start(id, { priority, width, compact: () => ({ left: Node, right: Node }), expanded: (el) => {}, onTap })`,
  `JC.os.island.update(id)`, `JC.os.island.stop(id)`, `JC.os.island.flash(text, icon, color)`.
- `JC.notify.push({...})`, `JC.notify.badge(app, n)`.
- `JC.os.open(appId, intent)`, `JC.os.home()`, `JC.os.setStatus('light'|'dark'|'auto')` (status-bar text for the current screen).
- `JC.os.isOpen(appId)`, `JC.os.online()`, `JC.os.battery()`, `JC.os.setWallpaper(id)`, `JC.os.setAppearance(a)`,
  `JC.os.setToggle(k, v)`, `JC.os.showEndings()`, `JC.os.confirmRestart()`, `JC.story.rewind()`, `JC.state.setting(k, v)`.
- `JC.time.now()` (in-game ms) — use it for "now" everywhere, never `Date.now()` for displayed times.
- Music must expose `JC.music = { nowPlaying() → {title, artist, art, playing} | null, toggle(), next(), prev() }` and emit
  `JC.bus.emit('music')` on change (Control Center reads it).
- The incoming/active call screen is drawn by `js/apps/callui.js` into `#call-layer`, driven by `JC.bus.on('story:call', call)`
  and `JC.story.call()` (phases: 'ringing' | 'active' | 'ended'; `call.dir` 'in'|'out'; `call.lines` [{who, text}];
  `call.pend.options` [{i, label}]; actions `JC.story.answer() / decline() / callChoose(i) / hangup()`).

### Intents each app must accept (deep links used by notifications, Spotlight, share sheet, other apps)
messages `{thread}` `{compose: {text|img|memo|loc}}` · phone `{tab}` `{call: cid}` · contacts `{contact}` · facetime `{call}` ·
mail `{id}` `{compose: {to, subject, body}}` · voicememos `{id}` · wavelet `{id}` `{post}` `{user}` `{compose}` ·
photos `{id}` `{photo}` `{album}` `{memory}` · camera `{selfie}` · notes `{id}` `{note}` `{compose, title}` ·
calendar `{id}` `{date}` · reminders `{id}` `{list}` · clock `{tab, create}` · weather `{city}` · safari `{url}` `{search}` `{newTab}` ·
maps `{place}` `{directions}` `{share}` · findmy `{id}` `{tab}` · swift `{id}` · lotuseats `{id}` `{rest}` · wallet `{id}` `{card}` ·
music `{tab}` `{play}` · stocks `{symbol}` · settings `{page: 'wifi'|'battery'|'wallpaper'|'display'|'endings'|'general'|'about'|'faceid'|'screentime'|'notifications'|'sounds'|'story'}`.
An intent `{ id }` always means "open that item of your main collection".

### Testing your app
```js
// node script (put it in the scratchpad, not the repo)
const T = require('/home/user/n/tools/pw.js');
const { page, done } = await T.open({});          // desktop viewport; { mobile: true } for a phone viewport; { dark: true }
await T.skipIntro(page); await T.unlock(page);     // dismiss the prologue, type the passcode
await page.evaluate(() => JC.os.open('notes'));   await page.waitForTimeout(800);
await T.shot(page, 'notes-home');                  // PNG of the device into $SHOTS (set process.env.SHOTS)
const errors = await done();                       // console + page errors (ignore font ERR_FAILED)
```
Look at your screenshots with the Read tool, in light and dark, and fix what looks wrong. Click through every control.
