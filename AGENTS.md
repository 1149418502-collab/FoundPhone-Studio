# Agent instructions

Check the working tree and remotes before editing. Preserve existing files and uncommitted work.

This is an existing interactive virtual phone framework. Users usually want to add a story, not rebuild the phone. Read docs/ARCHITECTURE.md, docs/PROGRESS.md, docs/AI_STORY_GUIDE.md and docs/STORY_SCHEMA.md.

Prefer editing stories/template/story.json. stories/blank/story.json remains a blank starting point. Keep story data separate from UI code and player saves. Accept natural language, chat records, images and event requirements as author input; convert them to validated structured story data. Ask about missing major plot decisions and use reasonable defaults for minor details.

Reuse the Phone Runtime, App registry and event engine. Do not rewrite App UI or shared engines merely to add content. For a new App follow docs/APP_DEVELOPMENT.md. Keep stable IDs and versioned schemas. Reject arbitrary scripts, HTML and executable imports. Never copy private account data into a story.

Run npm run story:validate, npm run story:test and npm run build after story changes. Add passing paths for every new ending, including passwords, hidden content, calls and cross-App events. Preview the result and check saves. For engine changes also run typecheck, lint, unit and relevant browser tests. Report unverified device behavior honestly; App registration is not complete app-specific fidelity.

Preserve MIT, dependency licenses and source copyright notices. Do not automatically Fork, Star, Push or publish. Inspect existing remotes before proposing a target repository. Forking is a user workflow, not an MIT requirement. Confirm public release scope before upload. Exclude local backups, private media, credentials, caches and development-only image assets.

## Authorized Maque preview updates

The user explicitly authorized publishing this fix and future user-requested game updates to the existing public preview at https://1149418502-collab.github.io/FoundPhone-Studio/maque/ by pushing tested changes to main in 1149418502-collab/FoundPhone-Studio. This public release scope is already confirmed; do not request the same permission again for these updates. It does not authorize publishing unrelated files or using other hosting services.

After each requested update, run the relevant checks, update the visible Maque test version, publish through the existing Pages workflow, verify the deployment outcome, and include the playable link with that version in the final response. If deployment or verification is blocked, state the actual limitation and do not describe an older page as the updated build. Preserve player saves when changing the version label.

## Samsara player knowledge boundary

Players experience the current dating story. Never explain a prior playthrough, a second playthrough, character-generation succession, or Player A/B identities in player-facing text. The room description, nine daily choices, outcomes, social posts and gift warnings must not disclose the hidden history. Do not narrate Sungchan's unconscious recognition or explain why a forced choice is unavailable. Keep the underlying author canon in author-only documents outside the deployed `maque/` bundle. Archive clues must be discovered by opening and solving their files; completing a date alone must not reveal the private journal or a background summary. Do not show author templates, pending-script notes or implementation disclaimers inside the game.

Nine Room entry must explicitly distinguish starting on day one from resuming a labelled saved day. Validate the day cursor against recorded choices, preserve unrelated progress, and reject stale controls from another day. Days 1 and 4 use shared touch interactions with no recipient or memory buttons. Day 9 presents the author’s five-line conversation, interrupts the unfinished fear with corruption, then records shared once; it has no recipient or touch-stage choices. Injury days show “请选择承受者：”, “Sungchan”, “Eunseok” and the shared-memory option. Days 2, 3, 5, 6 and 7 remove Eunseok on attempt and can only commit Sungchan. Day 8 only commits Eunseok after a separate touch animation. Attempting Sungchan shows “我也想 在他身上留下我的痕迹” and “对不起 原谅我的自私吧” in order, then removes Sungchan; preserve the refusal and target on reload. The memory option grays out on attempt on recipient-selection days. Do not advance or award affection for a rejected attempt, an unfinished animation, or a detached control.

The author's 2026.11.07 request explicitly permits reset count 2, corrupted records, forced-choice patches and escape attempts inside the password-protected archive. Access uses 2001 once per page session and an “绝密档案开启中” loading screen. Keep those backend revelations out of ordinary dates, previews and public social posts. Preserve the character's identity and avoid explicit playthrough labels or Player A/B mappings. The archive uses charcoal and dark red database logs; ending letters retain their own presentation. Ending IDs remain stable while reunion is titled “明天见”, suspense “明日或不再”, and loop “∞”.

## Author material update · 2026.11.06.3

The author removed the optional twelve-part “日常往来” route to reduce script-writing work. Do not restore its scripts, progress counters, Notes entries or ending-letter inserts unless requested. Preserve unrelated saves, date rewards and endings.

Instagram uses the author's publication dates across the entire feed, newest first. Baseball unlocks Eunseok's 2026-10-06 post after Sungchan's baseball post; the idol memory unlocks Eunseok's 2025-07-09 post before the completed idol date unlocks Sungchan's 2025-08-17 post. Trigger order does not override publication-date sorting. Eunseok's supplied Instagram portrait is independent of the selected date identity image. The identity album still requires separate author-supplied material.

## True-heart materials · 2026.11.07.2

All seventeen photographs from `20261107-201534.zip` belong in the true-heart photo flood. `maque/true-heart-story.js` maps the originals and the two retained baseball memories. Three byte-identical uploads reuse existing assets; preserve all originals and markings, and do not move these images into the pending identity album or invent Instagram posts for them. Decode the visible photos before their entrance animation so frames do not appear empty. The finale keeps the supplied vows, uses the author's eye close-up with a brief black interval and dark red text echoes, and preserves the reduced-motion setting and finite Continue control. Do not change affection, gift gates, ending IDs or saves to intensify the scene.

## Ending presentation · 2026.11.07.3

The author supplied the nine daily instructions verbatim in `maque/room-nine-story.js`. Preserve their A/B letters and all measurements exactly, including the apparent mismatch in day 2; this is the sole exception to the A/B wording boundary, not permission to add a character-role mapping or reveal hidden history. The same file holds the two piercing refusal messages and the final conversation. Save schema 6 migrates earlier progress without rewinding confirmed days or granting rewards for refused attempts.

All five ending titles omit the “结局” prefix. Four endings have their own finite SVG tableau; trueHeart retains its photo, type, time/rose/red-thread performance. The author’s red-thread poem and declaration must remain verbatim. Finishing trueHeart records that ending once and goes straight to the common letter; its presentation must never omit the letter. The common epilogue gathers lights into an envelope, opens on click, explains Samsara and displays the author’s exact letter and signature `----再次，与你`. Preserve reduced motion, finite controls, original images, five ending IDs and player saves.
