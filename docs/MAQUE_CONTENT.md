# Maque preview content

The independent game is `maque/index.html`; its date and gift content is separate
from the general FoundPhone runtime and `stories/template/story.json`.

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

### Media still awaiting original files

`mediaAssets.instagramAvatar.src` is the slot for reference image 2, and
`mediaAssets.footballMemory.src` is the slot for reference image 1. Both are
currently empty because the chat references have no downloadable file paths.
Do not claim either supplied photograph has been installed. The IG portrait
temporarily retains the existing portrait; the football message uses a clearly
illustrated memory card. Story portrait alignment is fixed independently.

Gift-photo URLs point to Unsplash (`https://unsplash.com/license`). The cloud
proxy denied the image host with HTTP 403, so these remote photographs and their
product matching have not been verified or bundled locally in this build.
The self-contained illustration fallback is intentional and tested. Do not
describe the external photographs as verified. When originals and reliable
licensed product files become available, bundle them and retain their source
and license records.

## Author material still to add

`dateScenes` contains a `photos` array for each scene. The scene background uses
the first entry (`{src, alt}`); Instagram prefers the player's selected photo.
Before a player selects a photo, legacy posts can use the scene art.
The current release uses
drawn backgrounds and a baseball ticket illustration; the inline chat images
were visible as references but were not available as downloadable workspace
files. No substitute photographs or generated likenesses were imported.

The author identified the baseball background as Sungchan and Eunseok appearing
at an LG Twins first-pitch event. An independent news source, exact event date,
opponent, and quotes have not been verified in this environment. Do not present
the fictional dialogue or Instagram captions as real quotes or real posts.
The author plans to supply final captions and images. Preserve stable scene IDs
and existing progress when replacing this material.
