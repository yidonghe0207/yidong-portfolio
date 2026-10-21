(()=>{
 const bar=document.querySelector('.site-header');if(!bar)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const items=[...bar.querySelectorAll('nav a,nav button')],work=items[0],play=items.find(item=>item.getAttribute('href')?.endsWith('#playground')),playSection=document.getElementById('playground'),dialog=document.querySelector('.info-dialog');let dialogButton=null;
 const about=items.find(item=>item.hasAttribute('data-about-page'));
 function currentSection(){if(about&&document.body.dataset.collection==='about')return about;return play&&(document.body.dataset.collection==='playground'||(playSection&&playSection.getBoundingClientRect().top<=innerHeight*.55))?play:work;}
 function selection(){const selected=dialog?.open&&dialogButton?dialogButton:currentSection();items.forEach(item=>{item.classList.toggle('is-active',item===selected);if(item===work||item===play||item===about){if(item===selected)item.setAttribute('aria-current',playSection?'location':'page');else item.removeAttribute('aria-current');}if(item.matches('button'))item.setAttribute('aria-expanded',String(item===selected&&!!dialog?.open));});}
 bar.addEventListener('click',e=>{const button=e.target.closest('nav button[data-about]');if(button){dialogButton=button;selection();}});
 if(dialog)new MutationObserver(selection).observe(dialog,{attributes:true,attributeFilter:['open']});selection();
 // Each separate glass surface gets a map sized to its own rounded rectangle.
 function attachLens(bar,index){
 bar.classList.add('glass-surface');
 const filterId='liquid-lens-'+index;
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
 svg.setAttribute('aria-hidden','true');svg.setAttribute('width','0');svg.setAttribute('height','0');svg.style.cssText='position:fixed;pointer-events:none';
 svg.innerHTML='<defs><filter id="liquid-lens" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feImage result="lens-map" preserveAspectRatio="none"/><feDisplacementMap in="SourceGraphic" in2="lens-map" scale="18" xChannelSelector="R" yChannelSelector="G"/></filter></defs>';
 svg.innerHTML=svg.innerHTML.replace('id="liquid-lens"','id="'+filterId+'"');
 document.body.append(svg);
 const lens=document.createElement('span');lens.className='glass-lens';lens.setAttribute('aria-hidden','true');bar.prepend(lens);
 if(/Chrome|Chromium|Edg\//.test(navigator.userAgent)&&CSS.supports('backdrop-filter','url("#'+filterId+'")')){bar.classList.add('refractive');lens.style.backdropFilter='url("#'+filterId+'") blur(.65px) saturate(135%)';}
 const map=svg.querySelector('feImage'),displacement=svg.querySelector('feDisplacementMap');
 function makeLens(){
  const box=bar.getBoundingClientRect(),w=Math.round(box.width),h=Math.round(box.height),radius=Math.min(parseFloat(getComputedStyle(bar).borderRadius)||18,w/2,h/2);
  if(!w||!h)return;const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const ctx=canvas.getContext('2d'),pixels=ctx.createImageData(w,h);
  const sdf=(x,y)=>{const qx=Math.abs(x-w/2)-(w/2-radius),qy=Math.abs(y-h/2)-(h/2-radius);return Math.hypot(Math.max(qx,0),Math.max(qy,0))+Math.min(Math.max(qx,qy),0)-radius;};
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
   const depth=-sdf(x+.5,y+.5),bend=depth>0&&depth<15?Math.sin(depth/15*Math.PI)**2:0;
   const dx=sdf(x+1,y)-sdf(x-1,y),dy=sdf(x,y+1)-sdf(x,y-1),length=Math.hypot(dx,dy)||1,i=(y*w+x)*4;
   pixels.data[i]=128+dx/length*bend*105;pixels.data[i+1]=128+dy/length*bend*105;pixels.data[i+2]=128;pixels.data[i+3]=255;
  }
  ctx.putImageData(pixels,0,0);map.setAttribute('href',canvas.toDataURL());
 }
 new ResizeObserver(makeLens).observe(bar);makeLens();
 let x=30,y=0,tx=30,ty=0,power=18,targetPower=18,raf=0,last=0;
 function paint(now){
  const ease=reduced.matches?1:1-Math.exp(-Math.min((now-last)||16,50)/95);last=now;
  x+=(tx-x)*ease;y+=(ty-y)*ease;power+=(targetPower-power)*ease;
  bar.style.setProperty('--glass-x',x+'%');bar.style.setProperty('--glass-y',y+'%');
  bar.style.setProperty('--glass-angle',(100+(x-50)*.35)+'deg');displacement.setAttribute('scale',power.toFixed(2));
  if(Math.abs(tx-x)+Math.abs(ty-y)+Math.abs(targetPower-power)>.08)raf=requestAnimationFrame(paint);else raf=0;
 }
 function start(){if(!raf){last=performance.now();raf=requestAnimationFrame(paint);}}
 bar.addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;const r=bar.getBoundingClientRect();tx=(e.clientX-r.left)/r.width*100;ty=(e.clientY-r.top)/r.height*100;targetPower=reduced.matches?18:24;start();});
 bar.addEventListener('pointerleave',()=>{tx=30;ty=0;targetPower=18;start();});
 window.addEventListener('pagehide',()=>{cancelAnimationFrame(raf);raf=0;});
 }
 const name=bar.querySelector('.wordmark'),label=document.createElement('span');label.className='glass-label';label.textContent=name.textContent;name.replaceChildren(label);
 [name,bar.querySelector('nav')].forEach(attachLens);
 const update=()=>{bar.classList.toggle('is-scrolled',scrollY>40);selection();};
 window.addEventListener('scroll',update,{passive:true});update();

})();
