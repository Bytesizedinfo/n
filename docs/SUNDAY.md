# Sunday at Lotus Pier — edition bible

A third edition of the game, built from the same phone, apps and art (`js/story-sunday/`, dev page `sunday.html`,
bundle `dist/sunday-at-lotus-pier.html`). Everything in docs/STORY.md still holds (cast, voices, places,
backstory, facts) **except where this file changes it**. Engine conventions: docs/DEV.md (scenes, `polite`,
`log`, `hint`, `cancel`, computed `say`, conditional text).

## The one question
Everything the player does on the phone answers a single question:
**On Sunday 18 October at 6:30 p.m., at Lotus Pier, for Jin Ling's 18th birthday: who sits at the table, what is
served, what is said, and is the stranger one of them?**

There are no separate endings any more. The game always reaches Sunday. The finale is the dinner, told as a
tap-through sequence whose every beat depends on the night. It ends on a named outcome and the list of what the
player did with his phone.

## Shape of the game
1. **Friday night, 23:47 → ~02:00.** The same five storylines (Wei Wuxian, Lan Xichen, Jin Ling and the birthday
   group, Ops, Nie Huaisang) plus calls, Voice Memos, A-Jie's thread and every app. **Rewritten so that they talk
   to each other and all point at Sunday.**
2. **Saturday 07:38–07:41.** Lost Mode, Tang Mei, the real Jiang Cheng calls from Lotus Pier HQ. On this call he
   goes through Sunday: who "he" invited, what he'll keep, what he'll fix (the scandal, the burned bridge), and
   whether the stranger is welcome. Tang Mei collects the phone at ten. **The phone part of the game ends here.**
3. **The dinner sequence** (`{ dinner: true }`): first a few Saturday cards (tea at three, the scandal fixed or
   not, the bell, the soup practice), then Sunday 6:30 p.m. at Lotus Pier, beat by beat, then the outcome.

Early exits no longer end the game; they skip ahead (see "Consequences").

## The Table — `JC.sunday.table(s)` (js/story-sunday/table.js)
Derived **only from flags** (and affection/suspicion). Scenes change the table by setting flags. Do not compute seats
anywhere else: read `JC.sunday.table(s)` (conditions get `s`; use `JC.sunday.table(s).seats.wwx.state` etc.).

| seat | states | from flags (the contract) |
|---|---|---|
| `jc` | yes | always (he hosts) |
| `jl` Jin Ling | yes · late | `late` if `party_moved`, or `scandal` set and not `scandal_fixed` once `saturday_done` (the Jin board moves his birthday to a Koi Tower press party; he escapes for cake) |
| `wwx` Wei Wuxian | yes · outside · no | `outside` if `burned` and not `burned_mended`; `yes` if `wwx_invited` (or `wwx_maybe` and trust ≥ 2) |
| `lwj` Lan Wangji | follows `wwx` | |
| `lxc` Lan Xichen | yes · late · no | `yes` if `lxc_sunday`, or `tea_yes` and aff lxc ≥ 3; `late` (after dinner, with the peony) if only `tea_yes` |
| `wn` Wen Ning | yes · drives · no | `yes` if `wn_invited` or `wn_accomplice`; `drives` (drops the Lans, won't come in) if only `wn_towed` or `wn_drives` |
| `sz`, `jy` the kids | yes · no | `bday_planned` |
| `nhs` Nie Huaisang | yes · no | `yes` if `nhs_ally` and not `nhs_leak` |
| `huang` Old Huang | gate | `huang_list` (he was given the guest list) makes the gate beat warmer |
| `fairy` | in · garden | `in` if `dog_friday` / `fairy_inside` / `fairy_taken` |
| `ajie` A-Jie's bowl | bowl (honoured?) | honoured if `ajie_wrote`, `ajie_shared`, `memo_sent` or `wwx_thanked` |
| `you` | table · thanks · photos · none | `photos` if `zidian`; `table` if `you_invited`, or `told_truth` and trust ≥ 5, or `jl_knows` and `told_truth`; `thanks` if only `told_truth` |

**Dishes:**
- soup: `right` (`told_recipe`), `close` (`soup_practiced`), `almost`, or `none` when Wei Wuxian doesn't come.
- lotus root: `honghu` (`ops_keep`: from the 400 kg), `canteen` (`ops_soup`), or `market`.
- cake: lotus seed (`cake_ok`).
- tea: white peony (Lan Xichen comes).
- bell: `given` (`gift_bell` + `bell_ready`), `unboxed`, or `none`.

**Threats:** `scandal` (unfixed), `nhs_leak`, `burned` (unmended), total suspicion ≥ 18, `memo_deleted`.

**Trust** (`JC.sunday.trust(s)`, settled on the Saturday call):
- +2 for `told_truth`, +1 for `returned_early`.
- +1 each: `wwx_invited`, `tea_yes`, `car_handled`, `bday_planned`, `wwx_thanked`, `memo_sent`, `ajie_wrote`, `scandal_fixed`, `wn_invited`.
- −2 for an unmended `burned`; −1 each for `car_cover` and `nhs_leak`; −1 or −2 for suspicion of 12 or 18.
- Plus the counter `trust_bonus`, which the call adds to or subtracts from.

**Outcomes** (`table.outcome`, first match):
| id | when | working title |
|---|---|---|
| `full` | you at the table + jl yes + wwx yes + lxc yes + wn yes + soup right + bell given | A Full Table |
| `gate` | Wei Wuxian outside | Outside the Gate |
| `two_parties` | Jin Ling late | Two Parties |
| `photos` | you: photos | Photos from Jin Ling |
| `six` | you at the table + Wei Wuxian | Six Bowls |
| `five` | Wei Wuxian | Five Bowls |
| `tea` | Lan Xichen at least late | Tea after Dinner |
| `empty` | otherwise | The Empty Chair |

**Balance targets:**
- Each seat should be reachable in 2–3 different ways, at least one through another app.
- `full` needs deliberate play across every storyline.
- `empty` only comes from neglect.
- A random run should usually land on `five`, `tea`, `two_parties`, `gate` or `six`.

## New flags (set by the writers; add more as needed and list them in your doc)
- **Table:** `wn_invited`, `lxc_sunday`, `nhs_ally`, `nhs_leak`, `nhs_knows`, `ops_keep`, `huang_list`, `bell_ready`, `fairy_inside`, `soup_practiced`, `you_invited`, `trust_bonus` (inc).
- **Status:** `scandal` and `scandal_kind` (`'koi'` / `'balcony'`), `scandal_fixed`, `party_moved`, `burned_mended`, `jl_knows`, `wn_knows`, `wn_accomplice`, `returned_early` and `returned_how`, `zidian`, `saturday_done`.
- **Existing flags keep their meaning:** `wwx_invited`, `wwx_maybe`, `burned`, `tea_yes`, `bday_planned`, `cake_ok`, `gift_bell`, `venue_lp`, `dog_friday`, `ops_soup`, `ops_morale`, `told_recipe`, `memo_sent`, `wwx_thanked`, `ajie_wrote`, `car_handled`, `car_cover`, `wn_towed`, `fairy_taken`.

## Consequences (the 13 endings, re-imagined)
In this edition an `{ ending: id }` step is routed by the engine to `JC.sunday.consequence(id)`, which sets flags
and starts a scene. **Do not write `{ ending }` steps in new content. Set flags and `start` the scene yourself.**
The single real finish is `{ dinner: true }`, written once, by writer C, at the end of the Saturday call or
early-return scenes.

| old ending | now | scene (owner) |
|---|---|---|
| The Honest Stranger (confession, Swift Ride report, front desk, selfie come-clean) | `told_truth`, `returned_early`, `returned_how`. The phone goes back tonight. A short beat about who takes it; Jiang Cheng resolves the rest himself (unanswered questions stay unanswered), then `{ dinner: true }`. | `early_return` (C) |
| Fairy's New Favorite | `jl_knows`, `returned_early`, `returned_how: 'fairy'`. Jin Ling takes the phone, keeps your secret till morning and wants you at his birthday. | `early_return` (C) |
| Zidian Is Waiting (total suspicion ≥ 25, or hanging up twice) | `zidian`. The family compares notes, he finds you, you're not invited. The dinner reaches you as photos from Jin Ling. | `zidian_fall` (C) |
| Wen Ning Saw Nothing | `wn_knows`, `wn_accomplice`. The night continues; Wen Ning covers for you, brings the phone back at dawn, and is thanked and invited. | `wn_accomplice` (A) |
| I Know Nothing | `nhs_knows`. The night continues. You bargain: kindly (he becomes an ally, `nhs_ally`) or badly (he leaks, `nhs_leak`, `scandal_kind: 'balcony'`). | `nhs_bargain` (B) |
| #KoiPondGate | `scandal`, `scandal_kind: 'koi'`. The Jin board threatens to move the party. Fixable tonight (Jin Ling owns up to the valet) or on Saturday's call. | `scandal_breaks` (B) |
| Burned Bridges | `burned`. The night continues without him; Lan Wangji sits with him. The Saturday call can send Jiang Cheng to Gusu at dawn (`burned_mended`). | `burned_after` (A) |
| Reunited, Tea, Jiujiu of the Year, Group Chat Legend, Unsent, Good Samaritan | absorbed into the table and the dinner beats | — |

## Cross-storyline beats (every writer must land theirs)
**Writer A: Wei Wuxian, Wen Ning, A-Jie**
1. Wei Wuxian's Sunday ask: Wen Ning drove them to the gala, so can he drive them Sunday, and come in? (`wn_invited`)
2. His soup practice knows about the 400 kg of lotus root if Ops kept some (`ops_keep`).
3. Wen Ning, after the tow, asks whether he should bring the van on Sunday; Jiang Cheng can tell him to stay for dinner (`wn_invited`).
4. Telling A-Jie "Your son turns eighteen on Sunday." honours the empty bowl.

**Writer B: Jin Ling, the birthday group, Ops, Nie Huaisang**
5. Ops' 400 kg gets the option "Keep twenty kilos for Sunday." (`ops_keep`, morale).
6. Old Huang asks for Sunday's guest list for the gate; the choices list the people the player has invited so far (`huang_list`).
7. Jin Ling asks if Wei Wuxian is really coming, and asks about his mother's soup.
8. Nie Huaisang's gossip can make the Jin board move the party (`scandal_kind: 'balcony'`). He can become an ally who stops posting and asks if he's invited (`nhs_ally`).
9. Sizhui keeps a seating plan that uses `JC.sunday.table(s)`.
10. The bell has to be in the purple velvet box (`bell_ready`).

**Writer C: Lan Xichen, Lan Qiren, the morning, the dinner**
11. Lan Xichen asks, after tea is settled, whether he'd be welcome on Sunday (`lxc_sunday`).
12. He hears about the party move from Huaisang, if the scandal broke.
13. Lan Qiren's 1 a.m. letter is about both brothers leaving Gusu for a Yunmeng dinner.
14. The Saturday call: Jiang Cheng goes through the table, decides about the stranger (`you_invited` / `trust_bonus`), and can repair `burned` and fix the `scandal`.

**All writers:** wherever a character would plausibly know something from another storyline, let them mention it.
For example:
- Wei Wuxian has heard about the koi pond from the family chat.
- Lan Wangji, via Wei Wuxian, knows about the tea.
- Tang Mei has seen the lotus root invoice.

Prefer short, in-voice lines gated by flags. **App reactions** in your `react-*` file: keep the good ones, redirect their effects onto table flags, and remove `{ ending }`.

## The dinner (writer C: js/story-sunday/dinner.js)
`JC.sunday.finale()` builds the cards from the table, records the night (`JC.sunday.record`), and returns
`JC.os.dinner(cards)`, a tap-through. Card: `{ kicker: 'Sunday, 6:29 p.m.', text: 'one or two short paragraphs', art?: 'art id' }`.

**Saturday cards (0–3):**
- tea at the Hanshi
- the scandal (fixed / not)
- the bell
- the soup practice

**Sunday beats** (each has variants keyed on the table):
1. the gate (Old Huang)
2. who's waiting
3. the bowls
4. the soup
5. Fairy
6. Lan Xichen
7. Wen Ning
8. Nie Huaisang
9. the gift
10. the toast
11. the empty bowl
12. You
13. the last image

Then register `S.ending({ id: 'sunday', title, text, jc })`. The outcome card shows `title` from the outcome table, and its paragraphs (functions of `s`) carry Jiang Cheng's epilogue. Existing ending prose is good material to mine.

## Ownership (one writer per file)
- **A:**
  - `scenes/family.js`, `scenes/calls.js`, `scenes/confess.js`, `scenes/react-social.js`
  - new scenes `wn_accomplice`, `burned_after` (in those files)
  - doc `docs/sunday/a.md`
- **B:**
  - `scenes/jinling.js`, `scenes/ops.js`, `scenes/nhs.js`, `scenes/react-commerce.js`
  - new scenes `nhs_bargain`, `scandal_breaks`
  - doc `docs/sunday/b.md`
- **C:**
  - `scenes/xicheng.js`, `scenes/finale.js`, `scenes/react-life.js`, `dinner.js` (new), `intro.js`
  - new scenes `early_return`, `zidian_fall`
  - doc `docs/sunday/c.md`
  - C deletes `js/story-sunday/endings.js` and registers the single `sunday` ending in `dinner.js`
- **Lead:** `table.js`, `js/core/*`, `js/apps/*` (except app files a writer needs, which must be agreed first), the tools and this file. Ask the lead for anything core.
