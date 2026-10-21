(() => {
  'use strict';
  const button = document.querySelector('#word');
  const canvas = button.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const ink = document.createElement('canvas');
  const inkCtx = ink.getContext('2d');
  const mist = document.createElement('canvas');
  const mistCtx = mist.getContext('2d');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const HOLD = 4200;
  const RETURN = 2400;
  let width, height, wordWidth, wordHeight, pad, dpr;
  let hover = false, focus = false, armed = true, breeze = 0, lift = 0;
  let pointer = .5, pointerTarget = .5, phase = 0, previous = 0;
  let state = 'veiled', clickedAt = -Infinity, liftFrom = 0, returnFrom = 1, returnAt = 0;
  let raf = 0, ready = false;
  const ease = t => t * t * (3 - 2 * t);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  function resize() {
    const fontSize = Math.min(136, innerWidth * .24, innerHeight * .24);
    dpr = Math.min(devicePixelRatio || 1, 2.5);
    inkCtx.font = `${fontSize}px Nabla`;
    const m = inkCtx.measureText('reveal');
    wordWidth = m.actualBoundingBoxLeft + m.actualBoundingBoxRight;
    wordHeight = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
    pad = fontSize * .65;
    width = wordWidth + pad * 2;
    height = wordHeight + pad * 2;
    for (const c of [canvas, ink, mist]) {
      c.width = Math.ceil(width * dpr);
      c.height = Math.ceil(height * dpr);
    }
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    button.style.width = `${wordWidth + 24}px`;
    button.style.height = `${wordHeight + 34}px`;
    inkCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    inkCtx.font = `${fontSize}px Nabla`;
    inkCtx.fillText('reveal', pad + m.actualBoundingBoxLeft, pad + m.actualBoundingBoxAscent);
    // Keep Nabla's actual contours and extrusion, recolored to the reference's black.
    inkCtx.globalCompositeOperation = 'source-in';
    inkCtx.fillStyle = '#000';
    inkCtx.fillRect(0, 0, width, height);
    inkCtx.globalCompositeOperation = 'source-over';
    // Cache the translucent frosted view; only the cloth boundary moves each frame.
    mistCtx.filter = `blur(${fontSize * .036 * dpr}px)`;
    mistCtx.globalAlpha = .48;
    mistCtx.drawImage(ink, 0, 0);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    wake();
  }

  function edge(x) {
    const u = (x - pad) / wordWidth;
    const rest = Math.sin(u * 10 + .5) * .022 + Math.sin(u * 22 + 1.8) * .013;
    const gust = Math.sin(u * 10 - phase * 2.8) * .105
      + Math.sin(u * 19 - phase * 3.9 + .7) * .044
      + Math.sin(u * 5 + phase * 1.7) * .045;
    const local = Math.exp(-Math.pow((u - pointer) / .23, 2)) * .075;
    const baseline = pad + wordHeight * (.59 - breeze * .105);
    return baseline + wordHeight * (rest * (1 - breeze * .5) + breeze * (gust - local))
      - lift * (wordHeight * 1.1 + pad)
      + Math.sin(u * 8 - phase * 3) * wordHeight * .08 * Math.sin(lift * Math.PI);
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(ink, 0, 0, width, height);
    if (lift > .999) return;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, edge(0));
    for (let x = 3; x < width; x += 3) ctx.lineTo(x, edge(x));
    ctx.lineTo(width, edge(width));
    ctx.lineTo(width, 0);
    ctx.closePath();
    ctx.clip();
    // The veil diffuses and lightens the type beneath it, like sheer white cloth.
    ctx.globalAlpha = 1 - ease(clamp((lift - .7) / .3, 0, 1));
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(mist, 0, 0, width, height);
    ctx.restore();
  }

  function frame(now) {
    raf = 0;
    const dt = Math.min((now - (previous || now)) / 1000, .05);
    previous = now;
    const wind = (hover || focus) && armed && state === 'veiled' ? 1 : 0;
    breeze += (wind - breeze) * (1 - Math.exp(-dt * (wind ? 3.8 : 2.7)));
    pointer += (pointerTarget - pointer) * (1 - Math.exp(-dt * 5));
    if (!motion.matches) phase += dt * (.55 + breeze * .75);
    if (state === 'lifted') {
      lift = motion.matches ? 1 : liftFrom + (1 - liftFrom) * ease(clamp((now - clickedAt) / 1100, 0, 1));
      if (now - clickedAt >= HOLD) {
        state = 'returning'; returnFrom = lift; returnAt = now;
        button.setAttribute('aria-pressed', 'false');
      }
    }
    if (state === 'returning') {
      const t = clamp((now - returnAt) / (motion.matches ? 250 : RETURN), 0, 1);
      lift = returnFrom * (1 - ease(t));
      if (t === 1) state = 'veiled';
    }
    if (motion.matches) breeze = 0;
    if (!wind && breeze < .001) breeze = 0;
    button.dataset.state = state;
    draw();
    if (state !== 'veiled' || breeze > .001 || wind && !motion.matches) raf = requestAnimationFrame(frame);
    else previous = 0;
  }

  function wake() { if (ready && !raf && !document.hidden) raf = requestAnimationFrame(frame); }
  function reveal() {
    // A repeat click extends the open interval without restarting the upward motion.
    liftFrom = lift;
    clickedAt = performance.now();
    state = 'lifted'; armed = false;
    button.setAttribute('aria-pressed', 'true');
    wake();
  }
  button.addEventListener('pointerenter', event => { if (event.pointerType !== 'touch') { hover = true; wake(); } });
  button.addEventListener('pointerleave', () => { hover = false; armed = true; wake(); });
  button.addEventListener('pointermove', event => {
    const bounds = button.getBoundingClientRect();
    pointerTarget = clamp((event.clientX - bounds.left) / bounds.width, 0, 1);
  });
  button.addEventListener('focus', () => { focus = button.matches(':focus-visible'); wake(); });
  button.addEventListener('blur', () => { focus = false; armed = true; wake(); });
  button.addEventListener('click', reveal);
  button.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      state = 'returning'; returnAt = performance.now(); returnFrom = lift;
      armed = false; button.setAttribute('aria-pressed', 'false'); wake();
    }
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(raf); raf = 0; previous = 0; }
    else wake();
  });
  motion.addEventListener('change', wake);
  window.addEventListener('resize', () => { if (ready) resize(); });
  document.fonts.load('156px Nabla', 'reveal').then(() => {
    ready = true; resize(); button.classList.add('ready'); button.dataset.ready = 'true';
  }).catch(() => { button.setAttribute('aria-label', 'reveal'); });
})();
