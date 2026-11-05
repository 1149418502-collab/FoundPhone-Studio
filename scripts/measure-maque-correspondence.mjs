import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const context = { window: {} };
vm.runInNewContext(readFileSync(new URL('../maque/correspondence-story.js', import.meta.url), 'utf8'), context);
const episodes = context.window.MaqueCorrespondenceStory.episodes;
const han = text => (String(text).match(/\p{Script=Han}/gu) || []).length;
let minimum = 0;
for (const episode of episodes) {
  const common = [...episode.opening.map(line => line[1]), ...episode.artifact.paragraphs, ...episode.closing.map(line => line[1]), ...episode.letter.paragraphs].reduce((sum, text) => sum + han(text), 0);
  minimum += common + Math.min(...episode.choices.map(choice => han(choice.label) + choice.reply.reduce((sum, line) => sum + han(line[1]), 0)));
}
console.log(JSON.stringify({ episodes: episodes.length, sourceInteractionsAndResponses: episodes.length * 2, savedPages: episodes.length, minimumSinglePassHanCharacters: minimum, textOnlyMinutesAt400HanPerMinute: +(minimum / 400).toFixed(1), textOnlyMinutesAt500HanPerMinute: +(minimum / 500).toFixed(1), note: 'Excludes alternate answers, repeated labels, recall lines and all pre-existing main story. Reading speed and exploration vary; this is not a measured human completion time.' }, null, 2));
