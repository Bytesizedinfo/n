# Core requests

## From Music / Health / Stocks / Lotus Leap / Settings
- **css/os.css `#screen button { background:none; padding:0; color:inherit }`** (specificity 1-0-1) beats `.btn.k-filled/.k-gray/.k-tinted`,
  `.btn.s-*` padding and `.navbtn` glass backgrounds in css/ui.css (0-2-0), so `JC.ui.btn` fills are invisible everywhere. Suggest
  `:where(#screen) button { … }` (zero specificity). My apps work around it with div-based buttons.

## From Phone / Contacts / FaceTime / Mail / Voice Memos / Call UI
- **js/core/story.js: `story.call = () => call;` (calls section) overwrites the authoring method `call(def)`** from the
  `story` object literal, so every `JC.story.call({...})` definition (js/story/scenes/calls.js, finale.js, and the Phone
  keypad's unknown-number calls) is silently dropped, and `JC.story.dial(cid)` returns early whenever a `dialScript`
  points at a call id that was never registered (e.g. calling A-Ling did nothing). Suggested fix:
  `story.call = (def) => { if (def && def.id) { defs.calls[def.id] = def; return def; } return call; };`.
  Workaround in place: js/apps/callui.js installs exactly that dual-purpose wrapper at load (before scenes load).
- `callRecord()` stores `num: contact.phones[0].num`; the Phone app patches the record afterwards when the player dialled a
  different number (e.g. Tang Mei's mobile) or an unknown number. A `num` option on `JC.story.dial(cid, { num })` would be cleaner.

## From Messages / Wavelet
- +1 on the `#screen button` specificity issue above (it also strips `.navbtn` glass/prominent backgrounds, `.navbtn.cap`
  padding and the tint colour). Messages/Wavelet work around it with `#screen .msgapp …` / `#screen .wvapp …` overrides.
- **No API to rename a thread at runtime** (group "Change Name and Photo"). Workaround: Messages sets
  `JC.state.d.threads[id].rename` (which `threadName()` already honours) and posts a sys line via `JC.story.incoming`.
  Suggest `JC.story.rename(id, name)`.
- **No API to restore a removed thread** (Messages "Recently Deleted → Recover"). Workaround: delete
  `JC.state.d.threads[id].removed` + emit `story:threads`. Suggest `JC.story.restore(id)`.
- **No API to delete/hide a single message** ("Delete Message", "More… → Delete", failed "Delete"). Workaround: Messages keeps a
  local hidden-id list (JC.store collection `msgprefs`). Suggest `JC.story.hideMsg(id, msgId)`.
- `JC.story.choose()` delivers the chosen text with `status:'delivered'` even in a `fails:true` thread (A-Jie). Messages renders
  every outgoing message in a dead thread as Not Delivered regardless; the engine could set `status:'failed'` there.
- `JC.story.pending()` doesn't expose the remaining timeout; Messages reads `JC.state.d.runs[].tleft` for its countdown bar.
  Suggest adding `left` (ms) to the pending object.

## From Photos / Camera / Notes / Calendar / Reminders / Clock / Weather
- +1 on the `#screen button` specificity bug above (it also kills `.navbtn` glass + capsule padding and the `.navbtn`
  tint colour). Until it is fixed, css/apps/photos.css restores the kit's intended `.navbtn` / `.btn` styles inside
  these seven app windows only (`#screen [data-app=…] .navbtn …`); once core uses `:where(#screen) button` that block
  can be deleted.
- `ui.page()` runs `content(page)` synchronously inside the constructor, so a `content` closure that references the
  `const page = ui.page(…)` variable throws a TDZ ReferenceError on first render. Worth a line in DEV.md ("use the
  `pg` argument passed to `content`").
- **js/core/ui.js `ui.wheel`**: the snapped `.wheel-item`s carry the rotateX transform, and Chrome computes
  `scroll-snap-align` areas from the transformed boxes, so the initial `list.scrollTop = idx * ROW` is re-snapped
  ~1 row off; the debounced settle then fires `onChange` with the wrong value (e.g. an event's start silently becomes
  "Today 2:05 PM"). Fix: put the rotateX on an inner span (keep the snapped row untransformed). Workaround in
  Calendar/Clock/Reminders: `.wheel-col { scroll-snap-type: none !important }` scoped to the app + JS snap on settle.
- css/os.css: `#screen.dark` does not redefine `--knock` (it stays `#ffffff`), so knock-out glyphs (`clock.fill`, `person.crop.circle.fill`,
  `xmark.circle.fill` …) render as solid white discs in dark mode wherever the glyph itself is white — e.g. the Phone tab bar.
  Suggest `--knock` = the surface colour per context (or `#000` in dark). Phone works around it locally in css/apps/phone.css.
