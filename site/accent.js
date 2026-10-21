(()=>{
 'use strict';
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(hover: hover) and (pointer: fine)');
 const card=document.querySelector('.float-work[data-id=fog]'),cover=card?.querySelector('.cover-fog');
 let enabled=false,visible=true,active=false,progress=0,cells=[],w=0,h=0,raf=0,last=0,source;
 const photo=cover?.querySelector('.fog-source'),canvas=cover?.querySelector('.fog-letters'),ctx=canvas?.getContext('2d');
 function resize(){
  enabled=!!source&&fine.matches&&innerWidth>580&&!reduced.matches;cover?.classList.toggle('accent-enabled',enabled);
  if(!enabled||!ctx)return;
  const r=cover.getBoundingClientRect();w=r.width;h=r.height;const dpr=Math.min(devicePixelRatio||1,1.5);
  for(const c of [photo,canvas]){c.width=Math.round(w*dpr);c.height=Math.round(h*dpr);c.getContext('2d').setTransform(dpr,0,0,dpr,0,0);}
  const draw=(target,tw,th)=>target.drawImage(source,source.width*.20,source.height*.15,source.width*.60,source.height*.74,0,0,tw,th);
  draw(photo.getContext('2d'),w,h);
  const sample=document.createElement('canvas');sample.width=Math.ceil(w/9);sample.height=Math.ceil(h/9);const sctx=sample.getContext('2d',{willReadFrequently:true});draw(sctx,sample.width,sample.height);const data=sctx.getImageData(0,0,sample.width,sample.height).data;cells=[];
  for(let y=0;y<sample.height;y++)for(let x=0;x<sample.width;x++){const i=(y*sample.width+x)*4,l=(data[i]*.2126+data[i+1]*.7152+data[i+2]*.0722)/255;if(l<.13)continue;cells.push({x:(x+.5)*w/sample.width,y:(y+.5)*h/sample.height,l,seed:(x*19+y*31)%37});}
  cover.dataset.cells=cells.length;
 }
 if(cover){
  const image=new Image();image.onload=()=>{source=image;resize();};image.onerror=()=>cover.classList.remove('accent-enabled');image.src=window.FOG_SOURCE;
  const update=()=>{active=card.matches(':hover')||card.matches(':focus-visible');cover.classList.toggle('is-revealed',active);};
  for(const type of ['pointerenter','pointerleave','focus','blur'])card.addEventListener(type,update);
  new IntersectionObserver(entries=>visible=entries[0].isIntersecting).observe(cover);new ResizeObserver(resize).observe(cover);
  window.addEventListener('resize',resize);reduced.addEventListener('change',resize);fine.addEventListener('change',resize);
  function frame(now){raf=requestAnimationFrame(frame);if(!enabled||!visible||document.hidden||window.PortfolioNav?.busy||now-last<33)return;last=now;
   const target=active?1:0;progress+=(target-progress)*.15;if(Math.abs(target-progress)<.002)progress=target;ctx.clearRect(0,0,w,h);cover.dataset.reveal=progress.toFixed(2);if(progress===1)return;
   const still=document.body.classList.contains('motion-paused')||!!document.querySelector('dialog[open]'),t=still?0:now*.0005;ctx.font='9px "Courier New",monospace';ctx.textAlign='center';ctx.textBaseline='middle';
   for(const c of cells){const a=c.seed*2.399,scatter=progress*progress*(28+c.seed),x=c.x+Math.cos(a)*scatter+Math.sin(c.y*.025+t)*.6,y=c.y+Math.sin(a)*scatter;ctx.fillStyle=c.l>.55?'#f2ebea':'#cbb6d7';ctx.globalAlpha=(.22+c.l*.65)*Math.pow(1-progress,1.5);ctx.fillText('.:+*oO#@'[Math.min(7,Math.floor(c.l*9))],x,y);}
   ctx.globalAlpha=1;
  }
  window.addEventListener('pageshow',()=>{cancelAnimationFrame(raf);update();raf=requestAnimationFrame(frame);});window.addEventListener('pagehide',()=>cancelAnimationFrame(raf));raf=requestAnimationFrame(frame);
 }
})();
