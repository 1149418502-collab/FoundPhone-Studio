/* Original SVG stage art; no new story branches or player data. */
(() => {
  'use strict';
  const calm = () => !!(window.MaquePhoneExtras?.prefersCalmMotion() || matchMedia('(prefers-reduced-motion: reduce)').matches);
  const svg = body => '<svg viewBox="0 0 360 225" fill="none" aria-hidden="true">' + body + '</svg>';
  const infinity = '<path class="ending-infinity" d="M180 110C128 35 67 49 64 105c-3 68 77 75 116 5 39-70 119-63 116 5-3 56-64 70-116-5Z"/>';
  const scenes = {
    reunion: svg('<circle class="ending-dawn" cx="180" cy="155" r="64"/><path class="ending-horizon" d="M28 173h304"/>' + infinity + '<circle class="ending-orbit ending-orbit-left" cx="115" cy="112" r="6"/><circle class="ending-orbit ending-orbit-right" cx="245" cy="112" r="6"/><path class="ending-sunray" d="M180 47V25m-80 45-14-14m174 14 14-14"/>'),
    farewell: svg('<path class="ending-branch" d="M54 210Q109 139 124 43m-21 96 56-38m-44-23L87 53"/><g class="ending-petal ending-petal-one"><path d="M123 47q-26-34-34-9t34 9Z"/><path d="M123 47q28-29 32-3t-32 3Z"/></g><path class="ending-petal ending-petal-two" d="M197 76q-27-24-28 0t28 0Z"/><path class="ending-petal ending-petal-three" d="M246 127q-27-24-28 0t28 0Z"/><path class="ending-petal ending-petal-four" d="M291 177q-27-24-28 0t28 0Z"/><path class="ending-wind" d="M43 173q84-81 175 4t116-6"/>'),
    suspense: svg('<path class="ending-door-frame" d="M111 197V31h141v166"/><path class="ending-door-light" d="m176 48 59-17v166l-59-17Z"/><path class="ending-door" d="m111 31 65 17v132l-65 17Z"/><circle class="ending-door-handle" cx="162" cy="119" r="3"/><path class="ending-light-floor" d="m176 180 59 17 63 25H95Z"/><circle class="ending-waiting-star" cx="211" cy="105" r="3"/>'),
    loop: svg('<circle class="ending-clock-face" cx="180" cy="111" r="85"/><g class="ending-clock-hand"><path d="M180 111V46m0 65 44 24"/></g>' + infinity + '<circle class="ending-clock-center" cx="180" cy="111" r="3"/>')
  };
  function ending(parent, id) {
    if (!scenes[id]) return;
    const stage = document.createElement('div'); stage.className = 'ending-art ending-art-' + id;
    stage.dataset.endingAnimation = id; stage.classList.toggle('is-calm', calm());
    stage.innerHTML = scenes[id]; stage.setAttribute('aria-hidden', 'true'); parent.append(stage);
  }
  function letter(parent, onOpen) {
    const scene = document.createElement('div'); scene.className = 'letter-formation';
    const reduced = calm(); scene.classList.toggle('is-calm', reduced); scene.dataset.phase = reduced ? 'formed' : 'gathering';
    const lights = document.createElement('div'); lights.className = 'letter-light-particles'; lights.setAttribute('aria-hidden', 'true');
    // Scatter converges on the envelope edges and diagonal folds, not a random box.
    for (let i = 0; i < 128; i++) {
      const light = document.createElement('i'), edge = i % 6, t = Math.floor(i / 6) / 21;
      const point = edge === 0 ? [t * 260 - 130, -78] : edge === 1 ? [t * 260 - 130, 78] : edge === 2 ? [-130, t * 156 - 78] : edge === 3 ? [130, t * 156 - 78] : edge === 4 ? [t * 260 - 130, -78 + 100 * (1 - Math.abs(t * 2 - 1))] : [t * 260 - 130, 78 - 78 * (1 - Math.abs(t * 2 - 1))];
      light.style.setProperty('--end-x', point[0] + 'px'); light.style.setProperty('--end-y', point[1] + 'px');
      light.style.setProperty('--start-x', (Math.sin(i * 2.399) * (150 + i % 100)) + 'px');
      light.style.setProperty('--start-y', (Math.cos(i * 2.399) * (125 + i % 90)) + 'px');
      light.style.setProperty('--particle-delay', (i % 17 * 27) + 'ms'); light.style.setProperty('--particle-size', (1 + i % 3 * .6) + 'px'); lights.append(light);
    }
    const envelope = document.createElement('button'); envelope.type = 'button'; envelope.id = 'openClosingLetter'; envelope.className = 'epilogue-envelope'; envelope.disabled = !reduced; envelope.setAttribute('aria-label', '拆开最后的情书');
    envelope.innerHTML = '<span class="letter-envelope-back"></span><span class="letter-paper-preview"><span>Samsara</span><i></i><i></i><i></i></span><span class="letter-envelope-front"></span><span class="letter-envelope-flap"></span><span class="letter-wax-seal"><svg viewBox="0 0 60 60" fill="none" aria-hidden="true"><path d="M30 29C18 10 7 20 9 30c3 14 15 17 21-1 6-18 18-15 21-1 2 10-9 20-21 1Z"/><path d="m30 28-4-4c-5-4-10 3-5 7l9 7 9-7c5-4 0-11-5-7Z"/></svg></span>';
    const hint = document.createElement('p'); hint.className = 'letter-touch-hint'; hint.textContent = '光会替我，把这封信送到你手中。'; hint.setAttribute('role', 'status');
    scene.append(lights, envelope, hint); parent.append(scene);
    const formed = () => { if (!scene.isConnected) return; scene.dataset.phase = 'formed'; envelope.disabled = false; hint.textContent = '轻触，拆开这封信'; };
    if (reduced) formed(); else window.setTimeout(formed, 2700);
    envelope.onclick = () => {
      if (envelope.disabled || !scene.isConnected) return;
      envelope.disabled = true; scene.dataset.phase = 'opening'; envelope.classList.add('is-open'); hint.textContent = '写给你的信件';
      window.setTimeout(() => { if (!scene.isConnected) return; scene.dataset.phase = 'opened'; onOpen(); }, reduced ? 0 : 1150);
    };
    return scene;
  }
  window.MaqueEndingArt = { ending, letter };
})();
