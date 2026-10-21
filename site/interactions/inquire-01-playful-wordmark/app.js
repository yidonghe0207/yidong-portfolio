(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const wordButton = $('#word-button'), playground = $('#playground');
  const marks = [$('#mark-0'), $('#mark-1')];
  const hits = [$('#hit-0'), $('#hit-1')];
  const letters = [...document.querySelectorAll('.letter')];
  // Matching cubic contours let the hook straighten into a tapered exclamation.
  const question = 'M27 32 L41 32 C40 51 33 62 23 74 C9 90 17 104 32 102 C39 101 44 98 48 95 L56 107 C44 116 29 119 17 113 C-7 105 -3 81 12 65 C23 52 26 44 27 32 Z';
  const exclaim = 'M30 32 L36 32 C36 51 37 62 37 74 C38 90 39 104 39 113 C36 113 34 113 32 113 L27 113 C27 105 28 98 28 90 C28 79 29 69 29 59 C30 48 30 40 30 32 Z';
  const numbers = s => s.match(/-?\d+(?:\.\d+)?/g).map(Number);
  const from = numbers(question), to = numbers(exclaim);
  const values = [0, 0], velocity = [0, 0], hovered = [false, false], focused = [false, false];
  let locked = false, hoverPaused = false, frame = 0, previous = 0, celebration = -10000, particles = [];
  const ns = 'http://www.w3.org/2000/svg';
  function target(i) { return locked || hovered[i] || focused[i] ? 1 : 0; }
  function updateState() {
    playground.dataset.state = locked ? 'delighted' : hovered.some(Boolean) || focused.some(Boolean) ? 'hover' : 'curious';
  }
  function draw(now) {
    const contractions = values.map(v => v * 29);
    const center = (contractions[0] + contractions[1]) / 2;
    const age = now - celebration;
    function bounce(index) {
      if (reduced.matches) return 0;
      const t = (age - index * 36) / 1000;
      return t > 0 && t < 1.3 ? -Math.sin(t * 13) * Math.exp(-t * 4.5) * 15 : 0;
    }
    marks.forEach((mark, i) => {
      let n = 0;
      mark.querySelector('.stem').setAttribute('d', question.replace(/-?\d+(?:\.\d+)?/g, () => {
        const coordinate = from[n] + (to[n] - from[n]) * values[i];
        n++;
        return coordinate.toFixed(3);
      }));
      const x = (i ? 332 - contractions[0] : 0) + center;
      mark.setAttribute('transform', `translate(${x - values[i] * 22},${bounce(i ? 4 : 0)})`);
      hits[i].style.left = `${(x + 32 + 1) / 594 * 100}%`;
      hits[i].style.width = `${(64 - contractions[i] * .55) / 594 * 100}%`;
    });
    letters.forEach((letter, i) => {
      const x = +letter.dataset.x + center - contractions[0] - (i > 2 ? contractions[1] : 0);
      letter.setAttribute('transform', `translate(${x},${bounce(i + 1)})`);
    });
    particles = particles.filter(p => {
      const t = (now - p.start) / 1000;
      if (t > .8) { p.el.remove(); return false; }
      p.el.setAttribute('transform', `translate(${p.x + p.vx * t},${p.y + p.vy * t + 90 * t * t}) rotate(${p.spin * t})`);
      p.el.setAttribute('opacity', (1 - t / .8).toFixed(3));
      return true;
    });
  }
  function tick(now) {
    const dt = Math.min((now - (previous || now - 16)) / 1000, .032);
    previous = now;
    let moving = false;
    for (let i = 0; i < 2; i++) {
      const goal = target(i);
      if (reduced.matches) { values[i] = goal; velocity[i] = 0; }
      else {
        velocity[i] += ((goal - values[i]) * 260 - velocity[i] * 21) * dt;
        values[i] += velocity[i] * dt;
        if (Math.abs(values[i] - goal) < .0005 && Math.abs(velocity[i]) < .003) { values[i] = goal; velocity[i] = 0; }
        else moving = true;
      }
    }
    draw(now);
    if (moving || particles.length || now - celebration < 1550) frame = requestAnimationFrame(tick);
    else { frame = 0; previous = 0; }
  }
  function wake() { if (!frame) frame = requestAnimationFrame(tick); }
  function burst(i) {
    if (reduced.matches) return;
    const x = (i ? 332 : 0) + 33;
    for (let j = 0; j < 8; j++) {
      const el = document.createElementNS(ns, j % 2 ? 'circle' : 'rect');
      if (j % 2) { el.setAttribute('r', '1.8'); }
      else { el.setAttribute('x', '-1'); el.setAttribute('y', '-4'); el.setAttribute('width', '2'); el.setAttribute('height', '8'); el.setAttribute('rx', '1'); }
      $('#particles').append(el);
      const angle = j * Math.PI / 4;
      particles.push({el, x, y:9, vx:Math.cos(angle)*55, vy:Math.sin(angle)*55-35, spin:j*60, start:performance.now()});
    }
  }
  function commit() {
    if (locked) { reset(); celebration = performance.now(); wake(); return; }
    locked = true;
    celebration = performance.now();
    wordButton.setAttribute('aria-pressed', 'true');
    wordButton.setAttribute('aria-label', 'Inquire with exclamation marks. Click to return to question marks');
    burst(0); burst(1); updateState(); wake();
  }
  function reset() {
    locked = false; celebration = -10000;
    // Let a click visibly restore both hooks even while the pointer stays on one.
    hoverPaused = true;
    hovered.fill(false); focused.fill(false);
    particles.forEach(p => p.el.remove()); particles = [];
    wordButton.setAttribute('aria-pressed', 'false');
    wordButton.setAttribute('aria-label', 'Transform inquire into exclamation marks');
    updateState(); wake();
  }
  hits.forEach((hit, i) => {
    hit.addEventListener('pointerenter', e => { if(e.pointerType === 'touch' || hoverPaused) return; hovered[i] = true; updateState(); wake(); });
    hit.addEventListener('pointerleave', () => { hovered[i] = false; updateState(); wake(); });
  });
  wordButton.addEventListener('click', commit);
  wordButton.addEventListener('pointerleave', () => { hoverPaused = false; });
  wordButton.addEventListener('focus', () => { if(wordButton.matches(':focus-visible')) { focused.fill(true); updateState(); wake(); } });
  wordButton.addEventListener('blur', () => { focused.fill(false); updateState(); wake(); });
  document.addEventListener('keydown', e => { if(e.key === 'Escape') { wordButton.blur(); reset(); } });
  reduced.addEventListener('change', wake);
  draw(performance.now());
})();
