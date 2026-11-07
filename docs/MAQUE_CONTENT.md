# Maque preview content

The independent game is `maque/index.html`; its date and gift content is separate
from the general FoundPhone runtime and `stories/template/story.json`.

## Eunseok Instagram history · 2026.11.06.2

The author supplied `银硕ins.zip` and five exact captions. Seven original JPEGs
are bundled unchanged, with source filenames, dimensions and SHA-256 hashes in
`maque/assets/media-sources.json`. `silver-instagram-story.js` holds the authored
caption/photo/date mapping, independently of gameplay and save data.

Five posts are available before any date is opened. Their publication sequence is
2024-05-10, 2024-06-21, 2024-09-03, 2024-09-18, 2024-09-21; the feed displays newest
first. June 21 and September 18 each contain a two-photo carousel. The explicitly
labelled September 18 second image remains second. Caption spelling, punctuation,
emoji and the mixed Korean/Chinese text are retained verbatim. Displayed dates are
publication dates, not inferred photograph capture dates.

The two invented baseball-history placeholders are replaced. Newly created date,
archive and correspondence posts remain above the historical posts, including
after interacting with them. Carousels support arrows, keyboard and horizontal
swipes; like, bookmark and slide position are saved under
`maque_silver_instagram_v1`. These interactions do not award affection or change
date progress. The author-provided identity album remains separate and unchanged.

## Nine Room progression and archive design · 2026.11.06.1

- The room introduction offers an explicit start from day one and, when present,
  a separate continuation labelled with the saved day. Existing date completions,
  affection, gifts, likes and comments survive restarting the room. A saved day
  cursor is reconciled with contiguous recorded decisions; an unsupported cursor
  cannot jump to day five. Stale intro, choice and continue controls cannot act on
  another day.
- On days 2, 3, 5, 6 and 7 (haircut, slap, blood draw, wound and nail), attempting
  the self option removes it without recording a choice or advancing. Only the
  Sungchan option can commit those days. Day 8 (ear piercing) permits the self
  choice. Non-injury days 1, 4 and 9 retain both choices. Each day's memory option
  still grays out on its first attempt. Both rejected states survive reloading,
  and reset independently on advancing to the next day.
- The archive has a small original graphite folder icon, an embossed document
  cover, numbered file rows, restrained status labels and matching document pages.
  The archive remains hidden below 60%; its story, puzzles, journal gate and ending
  IDs are unchanged. Author-supplied photographs are retained untouched.

## Player knowledge correction · 2026.11.05.5

Nine Room shows only the current date: its introduction, nine daily tasks, three
choices, current-day response and exit. No recovered snapshot, prior-playthrough
summary, A/B identity mapping, unconscious-recognition narration, memory index or
simulation explanation is shown. Choices are full-width stacked buttons at least
80px tall with 16px centered text and retain their size when disabled. Each day
allows one memory-option attempt before it grays out; a confirmed choice survives
reloading without accepting a duplicate decision. Affection rewards and existing
saves are preserved.

Social posts, gift confirmations and all three archive chapters no longer explain
playthrough numbers or character-instance succession. The ten-day private journal
appears only after both completing the room and decrypting its related file.
Author-only background and the boundary between it and player knowledge are in
`docs/SAMSARA_AUTHOR_CANON.md`, outside the deployed game bundle. The following
entries record historical builds; current behavior follows this correction.

## Preview 2026.11.02.2

- Ordinary gifts have at least seven bilingual lines. Football and hamburger
  conversations include longer invitations written for this game.
- Dating unlocks at 5% affection. Feature notices last 1.5 seconds, do not take
  focus, do not change the current view, and allow clicks through to the page.
- Four horizontal scene cards are displayed vertically. All have introductions;
  baseball is the playable scene. The other three await the author's stories.
- Opening the baseball scene creates one saved fictional Instagram post.
  Completing either interaction path awards 3%–5% affection once. Replays do not
  repeatedly award affection. Posts and likes survive reloads.

## Preview 2026.11.02.3

- The player is Song Eunseok. Baseball descriptions and Sungchan's fictional
  Instagram captions address the player directly rather than treating Eunseok
  as a third participant.
- Dating now has a Yes/No invitation after the introduction. No stays on the
  invitation; the second consecutive No shows the requested red message.
  Yes opens the photo picker. A selected photo gets a one-second preparation
  screen before scene selection. The same photo is the Instagram post cover.
- The Photos app imports supported image files into the browser's `maque-media`
  IndexedDB database and retains original bytes, dimensions, type, import time,
  optional `takenAt`, and favorites. Unknown capture dates stay unknown.
  Imported player files are never uploaded to GitHub or any remote service.
- Lock-screen and home times follow the device clock and timezone. Resuming a
  backgrounded tab refreshes the clock immediately.
- The football conversation uses the author's supplied sequence, including the
  gift announcement after "是什么呀" and a childhood-photo message at the
  specified point. Affection is awarded once at the final line.
- Gift cards and the gift picker use product photos first and locally drawn
  product illustrations when those cannot load; they no longer use emoji art.

## Preview 2026.11.02.4

The author supplied the original files in `图片素材.zip`. Image 2 is now bundled
at `maque/assets/sungchan-instagram-avatar.jpg` and used for Instagram's story
portrait and post portrait. Image 1 is bundled at
`maque/assets/sungchan-football-childhood.jpg` and appears at the authored
childhood-memory point in the football conversation. Original bytes and
watermarks are retained. Source records are in `maque/assets/media-sources.json`.
These two references are no longer pending. Existing saves are unchanged.

## Preview 2026.11.02.5

- The author supplied `图片素材2.0.zip`. All nine image files are bundled unchanged
  with provenance records. Escape, baseball, and idol scene cards use their named
  background photographs at 50% opacity. No football-campus background was in
  this archive, so that card temporarily uses the previously supplied football
  childhood photograph. No replacement scene photographs were generated.
- The extra escape-character and idol images are displayed in the corresponding
  scene introductions. These scenes still await full interactive stories.
- The uploaded photo now represents the player's identity. Selection and loading
  copy consistently says 我的形象. Legacy `maque_date_photo_id` remains the storage
  key for compatibility; the selected photo is used only for the player's image
  in the date HUD and personal story circle. It is not used as a couple photo.
- Final baseball memories use only the two author-supplied `棒球场ins合影` images.
  They appear in the finale and the Instagram carousel. There is no face-swap or
  AI image-generation service in this static game; the author supplies the final
  story images. Player uploads remain private to their current browser.
- The baseball date is fictional: Eunseok and Sungchan agree to watch an LG Twins
  game, are drawn as lucky spectators to participate in a ceremonial first pitch,
  and are later selected by the stadium kiss camera. This is not a reconstruction
  or factual claim about a real celebrity outing.
- The interactive sequence includes a two-person ticket, lucky-spectator invite,
  two support responses, a tappable pitching action, and two voluntary kiss-camera
  responses. All four response combinations reach the same saved memory, with
  the one-time +20% affection reward; ordinary gifts retain their 3%–5% rewards. Existing saves are retained.
- Samsara, Gifts, and Dates share a coordinated black/white SVG icon family with a rose heart.
  Samsara uses an infinity ribbon with a heart at its center.

Gift-photo URLs point to Unsplash (`https://unsplash.com/license`). The cloud
proxy denied the image host with HTTP 403, so these remote photographs and their
product matching have not been verified or bundled locally in this build.
The self-contained illustration fallback is intentional and tested. Do not
describe the external photographs as verified. When originals and reliable
licensed product files become available, bundle them and retain their source
and license records.

## Author material still to add

`dateScenes.photos` contains the scene background (`{src, alt}`), `references`
contains character/story reference images, and `memories` contains final couple
photographs. Keep these roles separate from the player-uploaded identity image.
The football-campus background and the author's identity-album content remain
pending. Date identity selection reads only the author-supplied in-game album; device import is hidden and disabled in this mode.
No generated likenesses were imported.

The supplied baseball photographs are illustrative materials for the fictional
date. Do not present its dialogue, lucky draw, kiss-camera event, or Instagram
captions as real quotes, real posts, or verified news. Preserve stable scene IDs
and existing progress when replacing or extending the author's material.

## Phone details · 2026.11.05.2

- Optional Notes contains a persistent food checklist. Completing the baseball date adds a keepsake note using the two supplied couple photographs. At 60% affection, searching Notes for `01` reveals a short recovered draft. These details do not change affection or core story choices.
- The dock Settings icon opens wallpaper choices and a reduced-motion toggle. Couple wallpapers unlock only after the baseball date. The original backgrounds can be restored, and appearance choices survive reloading.
- Double-tapping an Instagram photo uses the post’s existing like handler, preserving its save rules; repeated double taps never unlike the post.
- Photo details support previous/next controls, horizontal touch swipes, arrow keys and Escape. Game album favorites read the canonical saved record. Bundled photos remain readable if IndexedDB is unavailable; imported personal images still require browser storage.
- Date rewards up to 20% and valid archive announcement flags survive reloading. This visible version update does not run another save-reset migration.
- The author’s identity album remains empty pending supplied images. Do not fill it with unrelated or generated likenesses to bypass that step.

## Everyday correspondence · 2026.11.05.3

Historical record: this optional route was removed at the author's request in 2026.11.06.3. Its files, entry points and duration estimate below no longer describe the current build.

Twelve consecutive, saved conversations are authored in `maque/correspondence-story.js`. They expand ordinary moments and reciprocal care without replacing the four date scripts or changing gift/date affection. KakaoTalk, Notes, the date catalog and the game introduction link to this route.

Each chapter has a cross-app artifact, a personal response, subsequent chat and a kept page. Four artifacts allow freely keeping an actual quote; one assembles a short text; one uses an in-game bedtime checklist. No real microphone or system alarm is used. Old first-playthrough room nine remains archival background, not another playable run.

Reading progress, fragment ordering, chosen quotes, personal responses and kept pages persist under `maque_correspondence_v1`. Later conversations recall four earlier responses; Notes retains all twelve, and the existing ending letter can include memories and an optional player-written line.

The route has over 14,000 Han characters on its shortest first-pass path. See `docs/MAQUE_PLAYTIME.md` for the full-route 45–65 minute target and its limits. Static script/style URLs include the visible build version so a previously cached phone module cannot hide the new Notes entries.

## Author materials and feed update · 2026.11.06.3

- Removed the entire optional twelve-part correspondence route, its four entry points, Notes entries and ending-letter inserts. Its obsolete local storage is left alone; other saves and affection rules are preserved. The previous playtime estimate is retired in `MAQUE_PLAYTIME.md`.
- All fifteen shop items and their chat-picker thumbnails now share one locally bundled set of generated photographic still-life illustrations: warm ivory surfaces, consistent lighting and matching framing. `gift-collection.png` is generated interface artwork, not verified photographs of real merchandise. Prices, gift rewards, purchase gates and special-gift outcomes remain unchanged. No remote product-image requests are needed.
- Seven originals from `新素材.zip` are bundled without modifying their bytes or markings. The football-campus card, scene banner and final couple memory use `足球背景板.JPG`; the childhood football photograph remains at the childhood-memory beat. Eunseok's Instagram avatar uses the labelled portrait, independently of the date identity image.
- Added Eunseok's `2026-10-20` post, caption `커플템으로 가자 ~`, as existing history. His two-slide `2026-10-06` post, `오늘 잘 즐기다 왔다 ~`, unlocks automatically after Sungchan's baseball post.
- The idol memory first unlocks Eunseok's `2025-07-09` post, `成璨nim康桑哈密哒`. Completing the idol date then unlocks Sungchan's `2025-08-17` post, `和一位很害羞的男粉一起`. Sungchan's post accepts the author's two supplied player comments, `康桑哈密达！` and `我是夫熙俊`; each can be sent once and persists. The accompanying external link is retained as author reference, not silently added to the caption.
- The entire feed sorts by publication date, newest first, including old history and newly unlocked story posts. On the shared baseball date, Eunseok's later post appears above Sungchan's. Story posts without an author-supplied date retain their first displayed device-local date and relative publication order. Likes, bookmarks, carousel positions and comments persist without adding affection.
- The identity-selection album remains pending separate author material. Instagram posts and profile photos do not populate it or open the device's real photo library.

## Room interactions and restricted database · 2026.11.07.1

- Room days 1, 4 and 9 replace all recipient buttons with shared touch scenes: embrace, eye contact and a spoken-message animation. Each records a shared event only after its short animation completes. Day 8 keeps both named recipients and requires a separate symbolic ear-piercing animation. All other selection days show “请选择承受者：”, “Sungchan”, “Eunseok” and the shared-memory branch, preserving the existing forced-target and disabled-memory rules.
- Room saves migrate to version 5 without deleting recorded days, rewards or other game progress. A selected day-eight recipient survives reloading; an interrupted animation never commits a day. Detached controls cannot submit to another day or restarted session.
- Archive access still requires 60% affection. A single page-session key, 2001, opens a 1.8-second “绝密档案开启中” screen. The index, private dialogue and database content remain sealed until this completes. Leaving the loading page cancels entry; refreshing requires the key again without resetting any records.
- The three stable archive IDs now contain database audit logs: reset count 2, unrepairable memory residue, unauthorized invitations, forced choice patches, denied rollback, failed isolation and interrupted self-destruction. Sparse corrupted characters appear in the logs. Charcoal panels, muted dark red status markers and numbered timestamped entries replace the former letter presentation. KakaoTalk and Instagram still supply the per-file confirmations; no duplicate password is required for each file.
- Renamed reunion to “明天见”, suspense to “明日或不再” and loop to “∞”, retaining all five ending IDs and existing unlock conditions. The shared closing letter and gentle endings keep their separate presentation.
- All supplied photographs, gift images, SMS clues, ordinary date scripts, affection rewards and the pending identity album are preserved. New-link generation remains paused; this update does not invoke the alternative preview service.

## True-heart photo flood and final impact · 2026.11.07.2

- Imported all seventeen JPEGs from `20261107-201534.zip` without modifying bytes or markings. Fourteen new asset files are bundled; three byte-identical images reuse existing escape, baseball and football backgrounds. `true-heart-story.js` records each uploaded filename, dimensions, checksum and ending role, alongside the two existing baseball couple photographs.
- The photo flood now uses nineteen distinct originals, each displayed twice in the standard thirty-eight-frame sequence. Images retain their natural aspect ratios. Purchase intent preloads the photos, and the actual displayed elements decode before their entrance animations, with a bounded fallback for interrupted loading.
- The white text section fills and scrolls with repeated vows. A brief black interval precedes a new dark red final scene using the supplied eye close-up, oversized lettering, clipped echoes and finite distortion. The author's red-line and final vow text are retained. Continue appears after the final message has held briefly, then records the same trueHeart ending and shared epilogue.
- Reduced motion includes every original once and suppresses the zoom, tears and motion effects. Replay cancels pending callbacks; hidden Continue cannot skip the performance; keyboard focus stays on the ending until Continue is available. No new audio or device permissions are introduced.
- Other dates, archives, social posts, gift conditions, affection and saves remain unchanged. These photographs do not populate the still-pending identity album.
