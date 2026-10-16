# App reactions: Photos & Camera, Wavelet, Safari, Mail, Music

Scenes live in `js/story/scenes/react-social.js` (one file; `python3 tools/manifest.py` already run).
Everything here is an app reaction as described in docs/DEV.md, "App reactions":

- Every scene is `polite`, starts from an act, and is **night-only** (`when` + a guard at the top of `start`) unless
  marked *anytime*.
- Scene nodes never see the act payload, so `match(p, s)` saves what a scene needs in an `r_*` flag (`keep(s, k, v)`)
  and returns true. The `r_*` flags are internal.
- `whenFree(thread)`: before talking in a scripted thread (`busy_<thread>` lock: wwx, lxc, jl, nhs, fam, bday, ops,
  alumni), a reaction waits up to ~60 s for the scripted beat to finish. After that it goes ahead, and the engine's
  polite rules still apply.
- After every suspicion bump that could set off `caught_nhs` / `caught_total`, the reaction stops (`stopIfCaught`) so it
  doesn't talk over the scene that catches you.
- Affection budget for this file (max +2 per contact): **lxc** gets +1 for the balcony moon (sent or posted) and +1 for
  a shared song. **wwx** gets +1 for the first family photo and +1 for the draft email. **jl** gets +1 for A-Ling's
  playlist and +1 for the Shijie songs, both through Apple Music friend sharing. Each bump is guarded by an `r_*_aff`
  flag, so it can only happen once.
- "OOC" below means the player's own words broke Jiang Cheng's voice: an emoji, please, sorry, lol, haha, omg, `!!`,
  `<3` and similar (`ooc()`). OOC text adds a little suspicion.

## 1. Photos & Camera

**Recognizing a selfie.** Camera saves every front-camera shot (photo or video) with art id `cam_selfie_dark`. Photos,
the Messages photo picker, the share sheet and Wavelet all send `art` = that id. The art now carries the tag
`front-camera` (camera.js), and `isSelfie()` checks for either the id or the tag. The `selfie` tag alone is not enough,
because `p_jl_selfie_gala` (A-Ling's own selfie) also carries it.

| Trigger | Reaction | Effect |
|---|---|---|
| `send` img selfie → **jl, wwx, lxc, nhs, wn, lwj, ea, huang, liu, bai, sz, jy, mian, qr** (`r_selfie_<cid>`) | Each contact sees a stranger in a hoodie, in their own voice (Tang Mei: "That is not your hotel room, either."; Old Huang: "Boss face is like This: 😠 👍"). Then a choice: **cover** ("Wrong photo." / "Wrong photo. That's the driver." / "It's the driver.") or **come clean** ("I'm not Jiang Cheng. I found his phone in a taxi."). Timeout after 90 s → a short line. | sus +4 (lxc, wn, huang, liu, bai, sz, jy), +5 (jl, wwx, nhs, lwj, mian, qr) or +6 (ea). Cover: +1 more from NHS and Tang Mei. Timeout: +1. Log "Sent X a selfie. It was not of Jiang Cheng"; hint "X saw your face." Come clean: `api.story.confess(cid)` starts that contact's confess.js flow (wwx, jl, lxc, nhs → **busted**, wn → **wen_ning**, lwj); everyone else gets the engine fallback (→ **honest**). |
| `send` img selfie → groups **fam, bday, ops, alumni** (`r_selfie_<group>`) | Group pile-on, then cover ("Wrong photo." / "Wrong chat.") or come clean. | fam: sus jl +3, wwx +3. bday: nhs +3, wwx +2, sz +1. ops: ea +3, liu +2. alumni: nhs +3, mian +2, wwx +1. Come clean sets `told_truth`; Lan Wangji has already called the Golden Peony (fam) → **honest** in every group. |
| `post` with a selfie (Wavelet) (`r_selfie_post`) | A-Ling: "WHY IS THERE A STRANGER ON UR WAVELET". Wei Wuxian and Nie Huaisang chime in. Choice: "Hacked." or come clean (→ confess_jl). | sus jl +4, wwx +2, nhs +2; log; hint "Everyone saw your face." |
| `dm` with a selfie to rulan_jin, yiling_radish_king, zewujun, huaisang_fans, teaspiller_qh, lanwangji, lan_sizhui, jingyi_lan, mianmian_studio (`r_wvdm_selfie_*`) | Starts that contact's `r_selfie_<cid>` in Messages. Wavelet's own canned DM reply also happens. | As above. |
| `send` img `p_balcony_moon` → lxc (`r_moon_lxc`) | "That's my sleeve. At the edge of the frame. You kept it in." Then 🙂. If he already has it (lxc_moon's photo option, or the Wavelet post): "You sent it again. I'll keep both. 🙂" | aff lxc +1 (once, shared with the moon post); flag `moon_sent`; log; hint "Lan Xichen will remember that." |
| `send` dog photo → wwx: Fairy (`r_dog_wwx_fairy`), `p_puppies`, `p_childhood_dogs`, `p_dog_park` | Torment, in character. Fairy on the roof gives Sandu away ("is sandu in a POND"). Puppies: "NOT THE PUPPIES". If he has asked about Sunday and isn't invited yet (`fin.wwx_sunday`): "ARE THE PUPPIES A NO… i'm choosing to read it as a not no". Jasmine, Princess, Love-Love: "i know u said i was nine. i'm still sorry". | No suspicion. Puppies-as-answer sets `wwx_maybe`. Log for each. |
| `send` dog photo → jl: Fairy (`r_dog_jl_fairy`), other dogs (`r_dog_jl_other`) | Per-photo lines ("that's the day u gave her to me", "she went to a BOARD MEETING??", "r u cheating on fairy"). | Log only. |
| `send` `p_family_2007`, `p_ajie_soup`, `p_ajie_wedding`, `p_kites` → wwx (`r_fam_wwx_*`) | Quiet, emotional replies, one per photo ("that's her pot. before the lid got chipped. the fire is so low u can barely see it"). | aff wwx +1 on the first only; `soup_photo` flag for the soup pot; log for each; hint on the first. |
| `send` `p_shot_bank` → jl (`r_bank_jl`) | "…is this a birthday hint". Choice: "Check your spending." / "Sunday." / "Happy early birthday, kiddo 🥳💸". | The OOC option: sus jl +3, hint. Log "He now expects money on Sunday". |
| `send` `p_jl_selfie_gala` → nhs (`r_jlsel_nhs`) | "A-LING IN THE TUX 😭😭 … (I will not keep it safe)". About 75 s later @teaspiller_qh posts it (`post_tea_jlselfie`, notified), and A-Ling texts: "why is my gala selfie on the TEA ACCOUNT". | sus nhs +1, then jl +1; two log lines; hint. |
| `send` `p_shot_gossip` → nhs (`r_gossip_nhs`) | "I've never seen it before in my life!!" Choice: "I know it's you." → `nhs_accused`, or "Delete it." | Log. No suspicion (accusing him is in character). |
| `send` `p_shot_gossip` → lxc (`r_gossip_lxc`) | "Huaisang sent me the same picture an hour ago. 'By accident.'" | Log. |
| `photo_taken` with `selfie` (*anytime*) | Nothing visible. | `took_selfie`; log "Took a selfie with Jiang Cheng’s phone". |
| `photo_delete` of ph_fam07, ph_wed07, ph_soup08 or ph_kites03 (*anytime*) | Nothing visible. | `deleted_ajie`; log. |
| `photo_delete` of ph_moon (*anytime*) | Nothing visible. | `deleted_moon`; log. |

Any other photo is **not claimed**, so the contact's usual reply (imgReact or dogReact) still plays. The tests check this.

## 2. Wavelet

Post ids: #BalconyGate is `wv_tea_teaser` and `post_balconygate2`. #KoiPondGate is `post_koipondgate` and
`post_koipondgate_jc`. The other @teaspiller_qh posts are `wv_tea_ceos`, `wv_tea_return` and `post_tea_jlselfie`.

| Trigger | Reaction (Messages) | Effect |
|---|---|---|
| `like` #BalconyGate (`r_wv_like_bg`) | Nie Huaisang, straight away: "Did you just LIKE the #BalconyGate post?? … Don't ask how I know!! A little bird!!" Choice: "My thumb slipped." / "How do you know what I like." (→ `nhs_slipped`) / "It was funny 😂" (+2 more). | sus nhs +2; log; hint "Nie Huaisang noticed." |
| `like` #KoiPondGate (`r_wv_like_koi`) | "Your own car!! Your own nephew!!" | sus nhs +2; log; hint. |
| `like` another tea post (`r_wv_like_tea`) | CEO list: "(#2 is very flattered that you looked) 🙈" (sets `nhs_slipped`). Zewu-jun post: "The lotus seasons!! The LAKE!!" A-Ling's selfie: "Proud uncle". | sus nhs +2; log; hint. |
| `comment` on any tea post, unless it is a cover-up leak (`r_wv_cmt_tea`) | "You COMMENTED on the tea account??" (or "First a like and now a COMMENT??"), then he quotes the comment back. "Delete this." gets "Classic". | sus nhs +2. "Delete this.": +1 instead. OOC: +3. Log; hint. |
| `post`, not a selfie and not a cover-up leak: `r_wv_post_jl`, `_wwx`, `_ops`, `_nhs` | A-Ling ("u POSTED?? on WAVELET??", with a line for the moon, his own face, the pond or dogs). Wei Wuxian ("lan zhan put down the ladle"). The Ops group (Old Huang's grandson, "No." from Tang Mei, "It reads like a press statement."). Nie Huaisang ("Very closely!! 🙈"). Wavelet's in-app likes and comments still happen. | sus jl +2 (+1 OOC caption), wwx +1, ea +1, nhs +1; log "his fourth post in three years"; hint "A-Ling noticed." |
| `post` of `p_balcony_moon` (`r_wv_post_lxc`) | Lan Xichen: "my sleeve, at the edge, in front of two thousand people. I had thought you were a private man, Wanyin. 🙂" | aff lxc +1 (shared moon bump); `moon_sent`. |
| `car_cover` is set, and a `post` mentions the koi, pond, valet, car, Sandu or fish, or shows `p_fairy_roof` / `p_koi_pond_car`; or a `comment` or a DM to @teaspiller_qh mentions them (`r_wv_koi_post`, `r_wv_koi_cmt`, `r_wv_koi_dm` → `r_koigate`) | @teaspiller_qh posts `post_koipondgate_jc` ("Its owner just brought up the pond himself."). A-Ling: "#KOIPONDGATE IS TRENDING"; Nie Huaisang, Wei Wuxian and Tang Mei ("You have already commented."). | Log; → **koigate**. This is the only reaction that ends in koigate. nhs.js `koigate_leak` would leak it anyway, 200 s after the cover-up. |
| `dm` to @teaspiller_qh (`r_wv_dm_tea`) | "a cousin of mine runs— I mean. READS. A cousin reads that account 🙈". If the DM accuses him ("Huaisang", "it's you", "I know"), extra lines and `nhs_accused`. | sus nhs +1; log; hint. Other Wavelet DMs keep only Wavelet's in-app canned replies. |
| `like` a Lan Xichen post (`r_wv_like_lxc`) | The white peony tin (`wv_lxc_peony`): "It arrived without a card. I had a guess. Thank you for confirming it. 🙂" Any other post: "I didn't know you looked at Wavelet." | `peony_confirmed`; log. No affection (budget). |
| `comment` on A-Ling, Lan Xichen or Wei Wuxian posts (`r_wv_cmt_jl`, `_lxc`, `_wwx`) | A-Ling quotes it ("jingyi already screenshotted it"). Lan Xichen: "In public. 🙂 … my uncle is one of them." Wei Wuxian: "i'm pinning it forever". | jl +1 (+1 more if OOC, so +2); lxc +1; wwx +1; logs; hint (jl). |

## 3. Safari

| Trigger | Reaction | Effect |
|---|---|---|
| `ymj_locked` (third wrong YMJ Intranet password) (`r_ymj_locked`) | Ops group: Liu Qian forwards an IT alert ("Device: his iPhone, Jinxing District, Lanling"). A-Bai, Old Huang ("password is on paper in your desk"), then Tang Mei: "Jinxing District. You are staying at the Golden Peony. … It is not a birthday. Stop trying birthdays." | sus liu +1, ea +1; log; hint "Tang Mei noticed." |
| `visit` to howto.lanling/found-a-lost-phone, help.swiftride.lanling/lost-items, swiftride.app/lost or police.lanling/lost-and-found (`r_web_lost`, *anytime*) | Nothing in Messages. | `looked_up_return`; log "Looked up how to return a lost phone"; hint "You could just give it back." |
| `web_comment` on Spilled Tea (`tea-balconygate`, `tea-ceos`, `tea-return`) or the fan journal (`fans-moonlit-balcony`) (`r_web_cmt_nhs`) | Nie Huaisang: "Did you just comment on a BLOG?? As 'jiang.cheng'??" Different lines for the gossip blog ("I don't even know who writes that blog!!") and his fan journal. He quotes the comment. | sus nhs +2 (+1 OOC); log; hint. |
| `web_comment` on the soup recipe (`recipe:lotus-root-pork-rib-soup`, the page Wei Wuxian has been commenting on all week) (`r_web_cmt_soup`) | Wei Wuxian sees "jiang.cheng" reply and quotes it. If it gives the secret (low, fire, two hours, don't rush, lid, simmer): "LOW FIRE … lan zhan turn it down". Otherwise: "is that U?? on a RECIPE SITE??" | The secret sets `told_recipe` (hint "Wei Wuxian will remember that."), or, if already told, "now it's IN WRITING". Otherwise sus wwx +1. Log. |

## 4. Mail

The player's own words are the reply text with the quoted original ("On … wrote:", "> …", forwards) removed.

| Trigger (`mail_send`, by `contacts`) | Reaction | Effect |
|---|---|---|
| lxc (`r_mail_lxc`) | "Wanyin, you sent me an email. With a subject line. … I've printed it. Uncle would approve." | OOC: lxc +1. Log. |
| wwx (`r_mail_wwx`; not after `burned`) | **The draft** `d_wwx` ("I know about", started 22 Jun 2024, 01:05) sent **with a thank-you**: "how long has that been in ur drafts … i'm printing it. lan zhan is getting the good frame". **The draft without thanks**: "is this about 2008 … if u ever want to finish the sentence. i'm here." A reply to **Radish News**: "the first reply EVER". **Anything else**: "u EMAILED me?? … is this a legal thing". | Draft and thanks: `wwx_thanked` (if neither `wwx_thanked` nor `memo_sent` is set yet) and aff wwx +1. Draft only: `wwx_draft` and aff wwx +1. Radish News and anything else: sus wwx +1. Log; hint for the draft. |
| nhs (`r_mail_nhs`) | A reply to "hehe I swapped the seats~": "You replied to the seats email AGAIN!! … (I opened it)". Anything else: "My secretary is going to think we're doing a merger 🙈". | sus nhs +1 (+1 OOC); log; hint. |
| jl (`r_mail_jl`) | "why did u email my SCHOOL email … THE EYEBROWS ARE GROWING BACK". | sus jl +1 (+1 OOC); log; hint. |
| ea (`r_mail_ea`) | "I said not before Monday 07:00. You said 'No promises.' I see. … (I've read it.)" | OOC: ea +2 and hint. Log. |
| liu, not about Dog Friday (`r_mail_liu`) | Bullet-point receipt in her DM. | OOC: liu +1. Log. |
| qr (`r_mail_qr`) | He replies **by email** (`m_qr_reply` lands in the inbox, notified): "It is the second time this year. Rule 1,207 is satisfied. Rule 6 is not." Plus an SMS: "Your email has been received, and answered. By email." | OOC: qr +2 ("a small yellow face"). Log. |
| wn, mian, lwj (`r_mail_wn`, `_mian`, `_lwj`) | Short replies in their voices. | OOC: +1 each. Log. |
| liu, about Dog Friday (subject or own words mention dog or Fairy) (`r_mail_dogfriday`) | The own words are parsed: yes, no, Fairy only, or unclear (the earliest yes or no word wins, "only/except Fairy" means Fairy). **Unclear**: Liu Qian DMs "I am choosing to read it as a maybe 🐕". **The chat has not decided**: a yes or Fairy is announced in the Ops group (Old Huang 👍, A-Bai's hamster, "No." from Tang Mei, "Head of Morale"); a no gets "the poster stays up out of spite". **The chat already approved**: "We now have it in the chat AND in writing", or a "Conflicting instructions" line if the email says no. **The chat said no** (ops_dogfriday finished without `dog_friday`): an email yes or Fairy is a reversal ("The boss has reversed his decision. By EMAIL"). | `dog_friday_mail` = yes, no, fairy or maybe. Yes or Fairy before any chat approval: `dog_friday` true or 'fairy' and **ops_morale +1**. Never a second morale point if the chat already approved. Log; hint "The Ops team will remember that." |
| `mail_open` `m_nhs_swap` (*anytime*) (`r_mail_swap`) | Nothing visible. | `knows_swap`; log "Read Nie Huaisang’s “hehe I swapped the seats~” email". |
| `mail_open` of draft `d_wwx` (*anytime*) (`r_mail_draft`) | Nothing visible. | `found_draft`; log "Found the draft to Wei Wuxian: two years old, three words". |

## 5. Music

**"Share with Friends" is on by default.** A-Ling turned it on in September ("so i can see if ur still listening to sad
lake music"). It is the only way anyone can see what plays, and only A-Ling can. Turn it off in Music → Account and
nobody reacts; the quiet log still records the song.

| Trigger (`music_play`, `shared`) | Reaction (A-Ling, `jl`) | Effect |
|---|---|---|
| a song from `pl_aling` ("A-Ling made this 🔥"), or `kt3` Learner Permit (`r_mu_aling`) | "why does apple music say ur listening to MY playlist". Learner Permit: "TONIGHT?? after the POND??" if the car is known. Get Lost: "i only put it in so u'd open the playlist". Ends "…is it good". | aff jl +1; log; hint "A-Ling noticed." |
| `yl5` Come Home for Soup, Wei Wuxian's song about the Lotus Pier gate (`r_mu_soup`) | "i turned on friend sharing on ur account in september btw … u've played that one like forty times. i never told him. i'm not going to. but u should." If Wei Wuxian is already invited: "u said yes to him tho. so i guess u told him. kind of". | `soup_song_seen`; log. |
| `pl_shijie`, or `sj1`–`sj4` from Shen Yao's album (`r_mu_shijie`) | `sj2` Little Lotus, Sleep: "u used to hum that when i was little. u hummed it wrong every time". Otherwise: "mom's playlist / the one called shijie. i never said anything … wei wuxian is making the soup right now btw". Ends "…night jiujiu". | aff jl +1; log; hint. |
| `kt2` Peony Season, the gala song (not inside A-Ling's playlist) (`r_mu_peony`) | "PEONY SEASON?? … u said it's the reason u leave every gala at 11 … is this about the balcony … ew. good for u. EW". | sus jl +1; log; hint. |
| `cr4` Hanshi, Early Snow (`r_mu_hanshi`) | "that's zewu-jun's HOUSE … i'm saying NOTHING". | Log. |
| `yl5`, `sj1`, `sj2`, `kt2`, `cr4` or `kt3` with sharing **off** (`r_mu_quiet`, *anytime*) | Nothing visible. | Log "Played “…” on his phone with sharing off. Nobody saw". |
| `send` with a music.apple.com link → lxc (share sheet) (`r_mu_share_lxc`) | Hanshi, Early Snow: "That's my house. In the snow." A Gusu Strings Ensemble track: "Wangji's ensemble… quietly pleased". Peony Season: "'If you ask me twice, I'll answer again.' Is that a hint, Wanyin? 🙂". Get Lost: "…Is this a message? 🙂". Come Home for Soup and Shijie songs each get a line. Any other song: "I'll listen to it now. With tea." | aff lxc +1 (once); log; hint "Lan Xichen will remember that." |
| `send` music link → wwx: his band, `yl5`, `yl2`, or Shen Yao (`r_mu_share_wwx`; not after `burned`) | Come Home for Soup: "u sent me MY song … is this an answer". Choice: "Six-thirty." (→ `wwx_invited`, `wwx_done`: "6:29 at the gate. i'll knock this time") or "It's a song." (→ `wwx_maybe`). Don't Bring the Dog: "is this a THREAT". Shen Yao: "the radio on the kitchen windowsill". His band: "we have one (1) fan" (sus wwx +1). | No affection (budget). Invite: log + hint. |
| `send` `kt3` link → jl (`r_mu_share_jl`) | "why would u send me this. TONIGHT" (the koi line if the car is known). | Log. |

Shares are claimed, so no generic "texted first" reply plays. A share from the share sheet arrives as
`send {kind: 'text', text: 'Title — Artist', link: {url: 'https://music.apple.com/cn/<kind>/<id>'}}`: it has text, so its
kind is `text`, not `link`. The reactions match on `link.url`.

## New acts

| Act | Payload | Emitted by |
|---|---|---|
| `music_play` | `{ id, title, artist, album, playlist, src, shared }`. `playlist` is the playlist id when the queue came from a playlist. `src` is the queue kind (album, playlist, station…). `shared` is "Share with Friends". | `js/apps/music-engine.js` `loadIndex()` → `reportPlay()`, for every track that starts playing, autoplay included. |
| `mail_open` (extended) | `{ id, draft: true }` | `js/apps/mail.js`, when a draft is opened (draft rows and the `{id}` intent). Drafts open the composer, so they used to report nothing. |

Unchanged acts used here: `send`, `photo_taken`, `photo_delete`, `like`, `comment`, `post`, `dm`, `visit`, `web_comment`,
`ymj_locked`, `mail_send`, `mail_open`.

## New flags

Story-meaningful (the finale or other scenes may read them):
`moon_sent`, `soup_photo`, `took_selfie`, `deleted_ajie`, `deleted_moon`, `nhs_accused`, `nhs_slipped`,
`peony_confirmed`, `looked_up_return`, `wwx_draft`, `found_draft`, `knows_swap`, `dog_friday_mail`, `soup_song_seen`.

Existing flags these reactions set: `told_truth` (group come-clean; DMs go through `confess()`), `told_recipe`,
`wwx_thanked`, `wwx_invited`, `wwx_done`, `wwx_maybe`, `dog_friday`, `ops_morale` (inc).

Internal (`r_*`, payload stash and once-guards): `r_moon_aff`, `r_moon_post`, `r_fam_aff`, `r_wwx_mail_aff`,
`r_lxc_song_aff`, `r_dogw_fairy`, `r_dogj_fairy`, `r_dogj_other`, `r_wvlike_tea`, `r_wvcmt_tea`, `r_wvpost`, `r_wvdm_tea`,
`r_wvlike_lxc`, `r_wvcmt_jl`, `r_wvcmt_lxc`, `r_wvcmt_wwx`, `r_webcmt_nhs`, `r_webcmt_soup`, `r_mail_<cid>`, `r_dogmail`,
`r_mu_aling`, `r_mu_shijie`, `r_mu_quiet`, `r_mu_lxc`, `r_mu_wwx`.

New content ids: posts `post_tea_jlselfie` and `post_koipondgate_jc` (by teaspiller_qh); mail `m_qr_reply`.

## New UI

- **Safari**
  - **Spilled Tea** (`spilledtea.qinghe`) is the blog of @teaspiller_qh: a home page and three posts (`/balconygate`,
    `/hottest-single-ceos-2026`, `/zewujun-returns`), each with comments (`tea-balconygate`, `tea-ceos`,
    `tea-return`). It has its own `w-spill-*` styles; `w-tea-*` already belonged to the Cloud Recesses Tea Shop.
  - **Huaisang Fans painting journal**: `/journal/moonlit-balcony`, with comments (`fans-moonlit-balcony`). A link card
    on the shop's home page leads to it.
  - Wavesearch finds these for "balconygate", "teaspiller", "spilled tea", "gossip", "hottest single CEOs" and
    "moonlit balcony".
  - The lost-phone page already existed (`howto.lanling/found-a-lost-phone`, found by "lost phone" and similar
    searches).
- **Music**
  - Account → "Share with Friends" is on by default. Its footer explains who can see ("A-Ling turned this on in
    September…") and changes when it is switched off.
  - The account sheet's toggles now save together; before, the second toggle overwrote the first.
  - The first shared play shows a one-time toast: "Listening activity is shared with A-Ling".
- **Camera**: `cam_selfie_dark` is tagged `front-camera`. Nothing visible changes.

## FINALE notes (for the 07:41 call or the ending text)

- A "Sent … a selfie" log line: "You sent them a picture of your face. From my phone." Whoever saw it already knows
  what the caller looks like. `took_selfie` alone: "You took a picture of yourself on my phone. Why."
- `r_jlsel_nhs` done: "You sent A-Ling's photo to Nie Huaisang. It was on a gossip account in an hour. He's eighteen on
  Sunday. He's going to remind me forever."
- `told_recipe` set by `r_web_cmt_soup`: "You told him about the fire. On a recipe website. As me." (This also
  pays off lxc_moon's existing line: "Apparently someone finally told him about the fire.")
- `wwx_draft` or `found_draft`: "That draft was two years old." / "You found it. You sent it." If `wwx_thanked` came
  from the email: "You finished my sentence."
- `peony_confirmed`: "He knows about the tea now. Tang Mei is going to be insufferable."
- `nhs_slipped` or `nhs_accused`: "Huaisang will deny everything. He always does."
- `looked_up_return`: "You looked it up. How to give it back. It's in my history. And then you kept texting."
  Better still if the player then told the truth.
- `dog_friday_mail`: "Liu Qian has my approval in writing now. After midnight. Thank you for that."
- `soup_song_seen` or the Music logs: "A-Ling says you listened to her playlist. He's been waiting two years for me to
  open it."
- `knows_swap`: "You read Huaisang's seating email. Then you know whose fault the balcony was."
- `deleted_ajie` or `deleted_moon`: "You deleted— …It's in Recently Deleted. Thirty days. Don't touch anything else."
- The ending card's "What you did with his phone" already gets every log line above.

## Requests for the lead (files I don't own)

1. **ops.js, `ops_dogfriday`:** if the decision already came by email (`F(s).dog_friday_mail` set), skip the pitch.
   For example, in `dogs:`, add `{ if: (s) => !!F(s).dog_friday_mail, go: 'mailed' }`, where `mailed` is
   `[{ m: '• The boss already answered my proposal by email', from: 'liu' }, { m: '• No further questions 🐕', from: 'liu' }, { go: 'done' }]`.
   Without this, the chat asks again, and approving there adds a second ops_morale point. The integration run shows it:
   "ops: Approved." after the email.
2. **xicheng.js, `lxc_moon`:** hide "[Send him your balcony photo]" (`if: (s) => !F(s).moon_sent`) or branch to "You
   already sent it. I've been looking at it all night." Otherwise he says "…That is my sleeve." a second time. The
   integration run shows this too.
3. **family.js, `wwx_followup`:** if `told_recipe` is already set (recipe comment), hide "Low fire. Two hours. Don't
   rush it." or let him answer "u told me. on the internet. i know".
4. **docs/DEV.md, act catalogue:** add `music_play` (Music) and `mail_open {id, draft}` (Mail).
5. **docs/STORY.md, "Facts added":**
   - A-Ling turned on Apple Music friend sharing on JC's account in September and has watched him play "Come Home for
     Soup" about forty times without telling Wei Wuxian.
   - @teaspiller_qh also writes a blog, Spilled Tea (spilledtea.qinghe).
   - Nie Huaisang painted the "Moonlit Balcony" fan tonight (painting journal, 23:58).
   - JC replied to Lan Qiren's Q3 board letter by email in July, so an email reply tonight is "the second time this year".
6. Optional: `koigate_leak` could skip when `s.done.r_koigate` is set. This is cosmetic, because both end the game.
7. Optional, for the `APP_ACTS` list in tools/storytest.js (payloads as my apps emit them):
   `['send', { thread: 'lxc', msg: { img: 'p_balcony_moon' } }]`, `['send', { thread: 'wwx', msg: { img: 'p_puppies' } }]`,
   `['like', { post: 'wv_tea_teaser' }]`, `['post', { text: 'July.', art: 'p_lotus_macro' }]`, `['ymj_locked', {}]`,
   `['visit', { url: 'https://howto.lanling/found-a-lost-phone' }]`,
   `['web_comment', { text: 'Low fire. Two hours.', page: 'recipe:lotus-root-pork-rib-soup' }]`,
   `['mail_send', { to: 'liu.qian@lotuspier.yunmeng', contacts: ['liu'], subject: 'Re: Dog Friday', body: 'Approved.' }]`,
   `['music_play', { id: 'sj2', title: 'Little Lotus, Sleep', artist: 'Shen Yao', album: 'sy', playlist: 'pl_shijie', src: 'playlist', shared: true }]`.
   A selfie (`['send', { thread: 'jl', msg: { img: 'cam_selfie_dark' } }]`) opens a cover / come-clean question, so
   the first-option strategy covers and the last-option strategy confesses and ends the game.
