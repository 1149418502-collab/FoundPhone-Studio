# Maque preview content

The independent game is `maque/index.html`; its date and gift content is separate
from the general FoundPhone runtime and `stories/template/story.json`.

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

Twelve consecutive, saved conversations are authored in `maque/correspondence-story.js`. They expand ordinary moments and reciprocal care without replacing the four date scripts or changing gift/date affection. KakaoTalk, Notes, the date catalog and the game introduction link to this route.

Each chapter has a cross-app artifact, a personal response, subsequent chat and a kept page. Four artifacts allow freely keeping an actual quote; one assembles a short text; one uses an in-game bedtime checklist. No real microphone or system alarm is used. Old first-playthrough room nine remains archival background, not another playable run.

Reading progress, fragment ordering, chosen quotes, personal responses and kept pages persist under `maque_correspondence_v1`. Later conversations recall four earlier responses; Notes retains all twelve, and the existing ending letter can include memories and an optional player-written line.

The route has over 14,000 Han characters on its shortest first-pass path. See `docs/MAQUE_PLAYTIME.md` for the full-route 45–65 minute target and its limits. Static script/style URLs include the visible build version so a previously cached phone module cannot hide the new Notes entries.
