/* Adapted from The Fog's cached radial cloud sprites and integrated motion clock.
   Original: QUANTITATIVE AESTHETICS/Demo Files/qa2026/02_class/static/app.js.
   The supplied ByteDance silhouette masks the colour field; blurred copies bloom outside it. */
(() => {
  'use strict';
  const shape = 'M0 22 80 42 80 364 0 386Z M128 183 208 203 208 376 128 397Z M260 151 340 131 340 345 260 325Z M389 0 469 21 469 386 389 407Z';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const size = 640, logoWidth = 300, scale = logoWidth / 470;
  const path = new Path2D(shape);
  const sprites = new Map();

  function sprite(index) {
    index = (index + 60) % 60;
    if (sprites.has(index)) return sprites.get(index);
    const c = document.createElement('canvas'); c.width = c.height = 96;
    const ctx = c.getContext('2d'), hue = index * 6;
    const g = ctx.createRadialGradient(48,48,0,48,48,48);
    g.addColorStop(0, `hsla(${hue},88%,67%,1)`);
    g.addColorStop(.35, `hsla(${hue+15},82%,70%,.65)`);
    g.addColorStop(.72, `hsla(${hue+25},76%,73%,.15)`);
    g.addColorStop(1, `hsla(${hue+25},76%,73%,0)`);
    ctx.fillStyle = g; ctx.fillRect(0,0,96,96);
    sprites.set(index,c); return c;
  }

  function cloud(ctx,x,y,r,hue,alpha,stretch) {
    const step = ((hue % 360 + 360) % 360) / 6;
    const index = Math.floor(step), fraction = step - index;
    ctx.save(); ctx.translate(x,y); ctx.scale(stretch,1);
    ctx.globalAlpha = alpha * (1-fraction);
    ctx.drawImage(sprite(index),-r,-r,r*2,r*2);
    ctx.globalAlpha = alpha * fraction;
    ctx.drawImage(sprite(index+1),-r,-r,r*2,r*2);
    ctx.restore();
  }

  function mount(stage) {
    if (stage.dataset.fogReady) return;
    stage.dataset.fogReady = 'true';
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'bytedance-trigger';
    button.setAttribute('aria-label','ByteDance — click to keep the colour flowing');
    button.setAttribute('aria-pressed','false');
    button.innerHTML = `<svg viewBox="0 0 470 407" aria-hidden="true"><path fill="white" d="${shape}"/></svg><canvas width="640" height="640" aria-hidden="true"></canvas>`;
    stage.prepend(button);
    const canvas = button.querySelector('canvas'), ctx = canvas.getContext('2d');
    const field = document.createElement('canvas'); field.width = field.height = size;
    const brush = field.getContext('2d');
    const hoverTarget = stage.closest('.work-tile') || stage;
    let hover = false, focus = false, pinned = false, visible = true;
    let amount = 0, motion = 0, colour = 0, speed = 0;
    let last = 0, frame = 0, x = 0, y = 0, tx = 0, ty = 0;
    const hint = stage.querySelector('.bytedance-hint');
    const paused = () => reduced.matches || document.body.classList.contains('motion-paused');
    const active = () => hover || focus || pinned;

    function draw() {
      ctx.clearRect(0,0,size,size);
      if (amount < .001) return;
      brush.clearRect(0,0,size,size);
      brush.globalCompositeOperation = 'source-over';
      const base = brush.createLinearGradient(120,100,520,540);
      base.addColorStop(0,'#83b9ff'); base.addColorStop(.42,'#ada0f7');
      base.addColorStop(.72,'#e6a6c9'); base.addColorStop(1,'#75e4db');
      brush.fillStyle = base; brush.fillRect(0,0,size,size);
      // Independent overlapping lobes drift and breathe; no rotating gradient seam.
      for (let i=0;i<9;i++) {
        const phase = i*Math.PI*2/9 + motion*.21;
        cloud(brush,
          320 + Math.cos(phase)*125 + Math.sin(motion*.39+i)*48 + x*35,
          320 + Math.sin(phase*1.17)*135 + Math.cos(motion*.31+i)*42 + y*35,
          118 + 36*Math.sin(motion*.34+i),
          185 + i*31 + 72*Math.sin(colour*.16+i*.8), 1, 1.2);
      }
      // Clip only the colour body. Bloom is composited afterwards, outside the mask.
      brush.globalCompositeOperation = 'destination-in';
      brush.save(); brush.translate(170,320-407*scale/2); brush.scale(scale,scale);
      brush.fillStyle = '#fff'; brush.fill(path); brush.restore();
      brush.globalCompositeOperation = 'source-over';
      ctx.save(); ctx.globalAlpha = amount;
      ctx.globalCompositeOperation = 'lighter';
      // Broad drifting fog, separate from the fixed silhouette. Avoid a tight rim.
      const driftX = Math.sin(motion*.29)*12;
      const driftY = Math.cos(motion*.23)*10;
      ctx.filter = 'blur(56px)';
      ctx.globalAlpha = amount*(.90 + .10*Math.sin(motion*.37));
      ctx.drawImage(field,driftX,driftY);
      ctx.filter = 'blur(28px)';
      ctx.globalAlpha = amount*(.76 + .10*Math.sin(motion*.43+1.8));
      ctx.drawImage(field,-driftX*.45,-driftY*.45);
      // Remove halo from the exact silhouette before painting its flat, sharp face.
      ctx.globalCompositeOperation = 'destination-out'; ctx.filter = 'none';
      ctx.globalAlpha = 1;
      ctx.save(); ctx.translate(170,320-407*scale/2); ctx.scale(scale,scale);
      ctx.fill(path); ctx.restore();
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = amount; ctx.drawImage(field,0,0); ctx.restore();
      button.querySelector('svg').style.opacity = String(1-amount);
    }

    function tick(now) {
      frame = 0;
      if (!visible || document.hidden) { last=0; return; }
      const dt = last ? Math.min((now-last)/1000,.05) : 1/60; last=now;
      const target = active() ? 1 : 0;
      if (paused()) { amount=target; }
      else {
        amount += (target-amount)*(1-Math.exp(-dt/(target?.30:.48)));
        speed += ((target ? 1 : .35)-speed)*(1-Math.exp(-dt/.3));
        motion += dt*5.4*speed; colour += dt*4.2*speed;
      }
      x += (tx-x)*(1-Math.exp(-dt*4)); y += (ty-y)*(1-Math.exp(-dt*4));
      if (Math.abs(target-amount)<.001) amount=target;
      draw();
      if (!amount) button.querySelector('svg').style.opacity='1';
      if (!paused() && (active() || amount>0)) frame=requestAnimationFrame(tick);
      else last=0;
    }
    function wake() { if (!frame && visible && !document.hidden) frame=requestAnimationFrame(tick); }
    function releasePointer() { hover=false;tx=ty=0;wake(); }
    hoverTarget.addEventListener('pointerenter', e => { if(e.pointerType!=='touch'){hover=true;wake();} });
    hoverTarget.addEventListener('pointerleave',releasePointer);
    hoverTarget.addEventListener('pointercancel',releasePointer);
    hoverTarget.addEventListener('pointermove',e => {
      if(e.pointerType==='touch')return;
      const r=hoverTarget.getBoundingClientRect();
      tx=(e.clientX-r.left)/r.width-.5;ty=(e.clientY-r.top)/r.height-.5;wake();
    });
    button.addEventListener('focus',()=>{focus=button.matches(':focus-visible');wake();});
    button.addEventListener('blur',()=>{focus=false;wake();});
    function setPinned(value) {
      pinned=value;button.setAttribute('aria-pressed',String(pinned));
      button.setAttribute('aria-label',pinned?'ByteDance — click to release the glow':'ByteDance — click to keep the colour flowing');
      if(hint)hint.textContent=pinned?'Glow held · click to release':'Hover to awaken · click to hold';
      wake();
    }
    button.addEventListener('click',()=>{setPinned(!pinned);});
    button.addEventListener('keydown',e=>{if(e.key==='Escape'){setPinned(false);focus=false;hover=false;button.blur();wake();}});
    new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)wake();else{cancelAnimationFrame(frame);frame=0;last=0;}},{threshold:0}).observe(stage);
    document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;last=0;}else wake();});
    reduced.addEventListener('change',wake);
    new MutationObserver(wake).observe(document.body,{attributes:true,attributeFilter:['class']});
  }
  document.querySelectorAll('.bytedance-stage').forEach(mount);
})();
