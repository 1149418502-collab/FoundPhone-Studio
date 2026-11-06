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
