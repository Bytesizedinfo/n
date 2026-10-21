# Sunday at Lotus Pier: Writer A (Wei Wuxian, Wen Ning, A-Jie, calls, confessions, social reactions)

Files: `js/story-sunday/scenes/family.js`, `calls.js`, `confess.js`, `react-social.js`.
Nothing in these files ends the game any more. Every old `{ ending }` is now a set of flags plus a `start` of a
consequence scene. When the scene belongs to another writer, a small `goTo(id)` step starts it and only logs a
console warning if it is missing, so the static check passes while scenes are still being written.

## The shape of the storylines

**Wei Wuxian (`wwx`).** Everything he does now points at the dinner.
1. `wwx_sunday` (00:00). He asks to come home on Sunday with A-Jie's soup. The branches are the same as before: yes, "why", the pot, "not no", no, and "You should have stayed gone."
2. `wwx_wenning` (100 s after `wwx_invited`). He asks: can Wen Ning drive us, and can he come in? This is cross-storyline beat 1.
3. `wwx_followup` (only if he isn't invited yet). A practice batch at midnight. He knows about the 400 kg of lotus root: `ops_keep` gives "Honghu root", which he heard about in an Old Huang voice message; `ops_soup` gives Auntie Chen's canteen soup. This is cross-storyline beat 2. You can tell him the recipe here, and he asks again.
4. `wwx_practice` (~01:05, if he is invited or a maybe). Batch six or seven, and Lan Wangji says "closer". Possible answers: "Salt at the end." or "It'll be yours." (`soup_practiced`), or "Low fire. Two hours." (`told_recipe`).
5. `wwx_goodnight` (~01:30). Before the last choice he passes on what he has heard from the other storylines:
   - Lan Xichen's tea (via Lan Wangji), or `lxc_sunday`
   - the bell (via Sizhui)
   - Fairy coming inside ("I'll sit next to her")
   - Wen Ning ironing his one shirt
   - the party possibly moving to Koi Tower
6. The memo "Untitled 14":
   - `memo_to_wwx` is the climax.
   - `memo_to_fam` now ends with Jin Ling demanding a straight answer about Sunday.
   - `memo_to_wwx_burned` is new: after "stay gone", he plays it twice on the roof. It does not mend `burned`.
7. The family group:
   - `fam_car` adds the valet (`car_cover`) and Wen Ning's van (`wn_asked`).
   - `fam_invited` adds Jin Ling asking whether it's his mother's soup. "Let it stand" sets `fam_name_stood`.
   - `fam_scandal` is new. When `scandal` is set: "is Sunday still at Lotus Pier?" You can choose "Sunday is at Lotus Pier." (`sunday_held`).

**Consequence `burned_after` (lwj thread).**
- Lan Wangji's message. You can answer "I didn't mean it." or "Tell him I'm sorry." (both set `burned_regret`).
- Jin Ling asks what you did.
- ~150 s later: "He came down. He is making the soup anyway… he will leave it at the gate." You can answer "The gate will be open." (`burned_gate`).
- It sets `wwx_done` so the night can settle. **Nothing here sets `burned_mended`.**
- After `burned`, every Wei Wuxian reaction goes quiet; Lan Wangji answers her photos and the recipe comment.
- Calling him reaches Lan Wangji (`call_wwx_burned`).

**Wen Ning (`wn`).**
- `call_wn` (the tow):
  - silence or "mm": he tows the car.
  - "Thank you, Wen Ning." gives your voice away.
  - Truth, or hanging up after he has realized: `wn_accomplice`.
- `wn_tow_done`: after the tow he asks about the van on Sunday. This is cross-storyline beat 3. The options:
  - "Drive them. Then come in and eat." or "Six-thirty. Park inside the gate." (`wn_invited`)
  - "Drive them." (`wn_drives`)
  - There is a variant if `burned` ("only as far as the gate") and one if Wei Wuxian told him to ask himself (`wn_may_ask`).
- `wn_told`: Wen Ning checks with you after Wei Wuxian (or an outgoing call) tells him he's invited in.
- Calls can also invite him (the voice risk is a suspicion cost):
  - `call_wn_out` "Sunday. Six-thirty. Come in."
  - `call_wwx_out` "Wen Ning comes in."

**Consequence `wn_accomplice` (calls.js).**
- He knows, or you told him. He won't tell. He offers to take the phone to the Golden Peony **at half past eight on Saturday** (he is staying in Lanling overnight; `wn_pickup`).
- He asks you to keep answering people kindly until then. The night continues.
- `wn_accomplice_late` checks in later: "Did you eat?"
- From then on, dialling him reaches `call_wn_knows`: he answers the stranger, not Mr. Jiang.

**A-Jie.** In `ajie_open`, "Your son turns eighteen on Sunday." is cross-storyline beat 4. There are also new
gated lines: "A-Xian is coming home on Sunday. He is bringing your pot." and "I told him about the fire."
Free-typed messages count too. All of these log, show the hint "Her bowl will be on the table on Sunday." and set `ajie_wrote`.

**Confessions (`confess.js`).**

| told to | consequence |
|---|---|
| Wei Wuxian, Jin Ling, Lan Xichen, Lan Wangji | `told_truth`, `returned_early`, `returned_how`, `told_to`, then `early_return` |
| Wen Ning | `wn_accomplice` |
| Nie Huaisang | `nhs_knows`, then `nhs_bargain` (B) |

- The take-backs (Wei Wuxian, Jin Ling) clear `told_truth`; the engine sets it on every confession.
- Jin Ling sets `jl_knows` (so you are at the table) only if the night went well for him: `bday_planned`, `car_handled`, `fairy_ok`, or affection ≥ 3. Then he says "ur coming on sunday".
- If `burned`, Wei Wuxian's confession scene mentions it.

**Calls (`calls.js`).**
- Every truth line on a call sets `told_truth`, `returned_early`, `returned_how: 'call'` and `told_to`. It then starts `call_truth_after`, which starts `early_return`.
- FaceTime:
  - "(Show your face)" followed by the truth, or the truth after he saw your face: `returned_how: 'facetime'`.
  - Lying to the face he just saw: `zidian`, then `zidian_fall`.
- Hanging up on Lan Wangji after he heard your voice: `zidian`.
- `caught_total` (total suspicion ≥ 25): `zidian`, then `zidian_fall`.

**Social reactions (`react-social.js`).**
- Selfie come-clean:
  - Confessors (Jin Ling, Wei Wuxian, Lan Xichen, Nie Huaisang, Wen Ning, Lan Wangji) get `r_selfie: cid` and their confession scene, with no take-back. `returned_how` is `'selfie'`; Wen Ning and Nie Huaisang branch to their own consequences.
  - Everyone else (Tang Mei, Old Huang, Liu Qian, A-Bai, Sizhui, Jingyi, Mianmian, Lan Qiren) answers in voice. Then: `told_truth` + `returned_early` + `returned_how: 'selfie'` + `told_to`, then `early_return`.
  - Group selfies do the same, with `told_to` set to the group id.
- `r_koigate` (talking about the pond on Wavelet during `car_cover`):
  - The post trends. Sets `scandal`, `scandal_kind: 'koi'`, then `scandal_breaks` (B).
  - Posting again while the scandal is live only annoys Jin Ling.
- Her photos to Wei Wuxian set `ajie_shared`. The 2008 soup-pot photo (low flame) also sets `soup_practiced`.
- The recipe comment with the tip sets `told_recipe`.
- Dog Friday by email sets `dog_friday` (unchanged).
- The "I know about" draft with a thank-you sets `wwx_thanked` (unchanged).
- Nothing was cut. Every reaction still feeds a flag or a log line, and none ends the game.

## Flags

**Table flags set here:**
- `wwx_invited`, `wwx_maybe`, `burned`
- `told_recipe`, `soup_practiced`
- `memo_sent`, `wwx_thanked`, `ajie_wrote`
- `wn_invited`, `wn_accomplice`, `wn_knows`, `wn_towed`, `car_handled` (tow)
- `told_truth`, `returned_early`, `returned_how`, `jl_knows` (Jin Ling confession, conditional)
- `zidian`, `scandal`, `scandal_kind` (koi), `nhs_knows`, `dog_friday`

**`returned_how` values set:**

| value | when |
|---|---|
| `confess` | texted |
| `call` | said on a phone call |
| `selfie` | came clean after a selfie |
| `facetime` | Wei Wuxian saw your face |

**New flags:**

| flag | meaning |
|---|---|
| `told_to` | who heard the truth: a contact id (`wwx`, `jl`, `lxc`, `lwj`, `wn`, `nhs`, `hq`, `ea` …) or a group id (`fam`, `bday`, `ops`, `alumni`) |
| `burned_regret` | the stranger said "I didn't mean it" or "sorry" to Lan Wangji |
| `burned_gate` | the stranger promised the gate would be open |
| `wn_drives` | asked Wen Ning to drive only |
| `wn_may_ask` | Wei Wuxian was told Wen Ning should ask himself |
| `wn_sunday_asked` | the van question has been settled |
| `wn_told` | the stranger told Wen Ning the truth themselves |
| `wn_pickup` | Wen Ning will collect the phone at 08:30 Saturday |
| `ajie_shared` | her photos were sent to Wei Wuxian |
| `sunday_held` | told the family Sunday stays at Lotus Pier despite the Jin board |
| `fam_name_stood` | let "Lotus Pier Family 🪷🍲 SUNDAY!!!" stand |
| `soup_photo` | kept from the earlier edition |
| `r_selfie` | internal: which contact's confession came from a selfie |

Kept from the old edition: `wwx_done`, `wwx_hurt`, `wwx_saw_face`, `memo_climax`, `memo_to_jl`, `wn_realized`, `wn_declined`, the `busy_*` locks.

**Read from other writers:**
- `ops_keep`, `ops_soup`, `car_known`, `car_cover`, `wn_asked`
- `scandal_fixed`, `bday_planned`, `gift_bell`, `fairy_taken`, `fairy_inside`, `fairy_ok`
- `tea_yes`, `lxc_sunday`, `night_done`

## FINALE notes for Writer C (dinner beats)

**Wen Ning:**
- `wn_invited`: he comes in the Yiling Radish Co. van with the Lans and parks *inside* the gate. He wears his one shirt, ironed at 2 a.m. He brings tea in a thermos, "for after", and not soup, because Wei Wuxian threatened him. Lan Wangji has bought a **sixth good bowl** from a Gusu potter for him. It is his first dinner at Lotus Pier since 2008. Wei Wuxian says he still says "Lotus Pier" "like it's a church".
- `wn_accomplice`:
  - He brought the phone back Saturday at 08:30 (`wn_pickup`). Note that Tang Mei collecting at ten collides with this, so pick one or let him hand it to her.
  - He told Jiang Cheng the stranger "was kind to his family all night".
  - If `wn_told`, he is the one person who has heard the stranger's voice. Jiang Cheng thanks him (the second thank-you this month) and invites him himself.
- `wn_drives` or `wn_towed` only: the van waits at the gate and Old Huang takes him tea.

**Wei Wuxian:**
- `burned` (unmended): he is outside the gate with A-Jie's pot (chipped lid). Batch six, "he did not burn it". The details that can colour the scene:
  - `burned_regret`: the stranger said "I didn't mean it", but in Jiang Cheng's voice; Wei Wuxian says it "still sounded like him".
  - `burned_gate`: someone promised the gate would be open.
  - `memo_sent` + `burned`: he played Untitled 14 twice on the roof.
- Fairy: he promised "i'll sit next to FAIRY". If Fairy is inside and he is at the table, Lan Wangji sits between them.
- `wwx_saw_face`: Wei Wuxian has seen the stranger's face on FaceTime. If you are at the table, he recognises you first.
- He may play "Come Home for Soup" on the flute at the gate (`r_mu_share_wwx`), with Lan Wangji drumming on the pot.
- `fam_name_stood`: the chat is still called "Lotus Pier Family 🪷🍲 SUNDAY!!!" and Jiang Cheng never changed it.
- `sunday_held`: Jiang Cheng told the family "Sunday is at Lotus Pier" before the call (useful for the scandal-fixed card).

**The soup:**

| soup | what happened | taste |
|---|---|---|
| `right` (`told_recipe`) | "Low fire. Two hours. Don't rush it." are A-Jie's exact words from her 2008 text. Wei Wuxian learned them from Jiang Cheng's phone (or from "jiang.cheng" on a recipe site). Jiang Cheng knows his own secret was given away. | It tastes like hers. |
| `close` (`soup_practiced`) | He learned to salt at the end, like her ("she always tasted it last, right before the lid"), or saw her low flame in the 2008 photo, or was told "it'll be yours". | Lan Wangji said "closer". |
| `almost` | Batch five, "edible". | The fire is wrong. Lan Wangji has two bowls anyway. |

- Lotus root `honghu` (`ops_keep`): Old Huang sent Wei Wuxian a voice message (forty seconds of wind) about twenty kilos. He has had Wei Wuxian's number since the gate in 2024.

**A-Jie's bowl:**
- `ajie_wrote`: Jiang Cheng finds a new Not Delivered message in her thread: "Your son turns eighteen on Sunday." (or "A-Xian is coming home…" / "I told him about the fire.").
- `memo_sent` (invited): Wei Wuxian said "i'm putting a bowl out for her. don't argue."
- `ajie_shared`: he printed the 2007 dock photo.

**You:** `jl_knows` from a text confession means Jin Ling invited you himself ("it's MY birthday and i'm an adult and i decide").

## Requests
1. **Lead (table.js):** honour A-Jie's bowl on `ajie_shared` too (her photos sent to Wei Wuxian). Today only `ajie_wrote`, `memo_sent` and `wwx_thanked` count.
2. **Lead (table.js):** consider `wn: 'drives'` also when `wn_drives` is set (the player asked Wen Ning to drive only). Today `drives` needs `wn_towed`.
3. **Writer C (early_return):**
   - Please pick the confidant from `told_to` before `s.done`. Call confessions are not scenes, so a truth on `call_jl_out`, `call_lxc_out`, `call_lwj_out` or `call_hq_night`, or after the FaceTime (`wwx_ft_hung`), currently falls through to `c_ea`.
   - Your `selfie` node always plays family-chat lines. A selfie come-clean to Tang Mei or Old Huang (`told_to: 'ea'` / `'huang'`) would read better with its own branch.
   - Map `returned_how` `'call'` and `'facetime'` (both set `told_to`).
4. **Writer C (Saturday call):** mending `burned` could be easier with `burned_regret`, `burned_gate`, or `memo_sent` while burned. Wen Ning's 08:30 pickup (`wn_pickup`) needs reconciling with "Tang Mei collects the phone at ten". `told_truth` without `returned_early` happens on purpose: Wen Ning (accomplice) and Nie Huaisang (bargain) both keep the phone overnight.
5. **Writer B:**
   - `confess_nhs` sets `nhs_knows` and starts `nhs_bargain` after his "I know 🙈". The bargain (favour, kindly or badly) is yours.
   - `call_nhs_out` (voice) still starts your `caught_nhs`.
   - `r_koigate` sets `scandal`/`koi` and starts `scandal_breaks`.
   - `fam_scandal` (fam thread, 120 s after `scandal`) has Jin Ling say the board wants to move his birthday, so please don't repeat that beat in `fam`.
   - `jl_car` must keep calling `call_wn`.
6. **Lead (STORY.md "Facts added"),** please add:
   - Wen Ning owns one shirt.
   - Lan Wangji orders a sixth good bowl from a Gusu potter for Sunday.
   - Old Huang has had Wei Wuxian's number since 29 Jun 2024.
   - A-Jie salted the soup last, right before the lid.
   - Wen Ning stays in Lanling on Friday night (the van doesn't like the mountain road in the dark).
