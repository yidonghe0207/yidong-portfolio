(()=>{
 const modal=document.querySelector('.recording-dialog'),stage=modal.querySelector('.recording-stage'),title=modal.querySelector('h2');
 const reel=document.querySelector('#highlight-reel'),tryLink=modal.querySelector('.recording-try');let opener,previousOverflow='';
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let wantsPlayback=!reduced.matches,inView=true,managedPause=false,departing=false;
 if(reduced.matches){reel.removeAttribute('autoplay');reel.pause();}
 function pauseReel(){if(!reel.paused){managedPause=true;reel.pause();}}
 function syncReel(){
  if(wantsPlayback&&inView&&!document.hidden&&!document.querySelector('dialog[open]')&&!departing)reel.play().catch(()=>{});
  else pauseReel();
 }
 reel.addEventListener('pause',()=>{if(managedPause)managedPause=false;else wantsPlayback=false;});
 reel.addEventListener('play',()=>{wantsPlayback=true;if(!inView||document.hidden||document.querySelector('dialog[open]')||departing)pauseReel();});
 new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;syncReel();},{threshold:.15}).observe(reel);
 reduced.addEventListener('change',()=>{wantsPlayback=!reduced.matches;syncReel();});
 const info=document.querySelector('.info-dialog');
 new MutationObserver(syncReel).observe(info,{attributes:true,attributeFilter:['open']});
 new MutationObserver(syncReel).observe(document.querySelector('.research-dialog'),{attributes:true,attributeFilter:['open']});
 function open(button){
  if(!modal.open){opener=button;previousOverflow=document.body.style.overflow;document.body.style.overflow='hidden';}
  pauseReel();stage.querySelector('video')?.pause();
  tryLink.hidden=true;tryLink.removeAttribute('href');
  if(button.dataset.video){
   title.textContent=button.dataset.title;
   const video=document.createElement('video');video.controls=true;video.playsInline=true;video.src=button.dataset.video;stage.replaceChildren(video);
   if(button.dataset.tryUrl){const external=button.dataset.tryExternal==='true';tryLink.href=button.dataset.tryUrl;tryLink.dataset.external=String(external);tryLink.dataset.title=button.dataset.title;tryLink.textContent=(external?'Open in Figma':'Try it')+' ↗';tryLink.setAttribute('aria-label',(external?'Open in Figma: ':'Try ')+button.dataset.title);tryLink.hidden=false;}
   if(!modal.open)modal.showModal();video.play().catch(()=>{});
  }else{
   const id=button.dataset.prototype;title.textContent=button.dataset.title||(id[0].toUpperCase()+id.slice(1));
   const frame=document.createElement('iframe');frame.title=title.textContent+' interactive prototype';frame.src=button.hasAttribute('data-interaction')?button.href:'../../prototypes/studies/'+id+'/index.html';frame.allow=frame.src.includes('tune-01-equalizer-type')?'autoplay; fullscreen; microphone':'autoplay; fullscreen';stage.replaceChildren(frame);if(!modal.open)modal.showModal();
  }
  modal.querySelector('.recording-close').focus();
 }
 document.querySelectorAll('[data-video],[data-prototype]').forEach(b=>b.addEventListener('click',()=>open(b)));
 document.querySelectorAll('[data-interaction]').forEach(a=>a.addEventListener('click',e=>{if(a.dataset.external==='true'||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey||e.button!==0)return;const href=a.href;const label=a.dataset.title;e.preventDefault();if(a===tryLink){const proxy=document.createElement('a');proxy.href=href;proxy.dataset.interaction='';proxy.dataset.title=label;open(proxy);}else open(a);}));
 modal.querySelector('.recording-close').addEventListener('click',()=>modal.close());
 modal.addEventListener('click',e=>{if(e.target!==modal)return;const r=modal.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)modal.close();});
 modal.addEventListener('close',()=>{stage.querySelector('video')?.pause();stage.replaceChildren();document.body.style.overflow=previousOverflow;opener?.focus({preventScroll:true});syncReel();});
 window.addEventListener('message',e=>{const frame=stage.querySelector('iframe');if(frame&&e.source===frame.contentWindow&&e.data==='portfolio:close-study')modal.close();});
 const filters=[...document.querySelectorAll('[data-filter]')],cards=[...document.querySelectorAll('.study-recording')];
 filters.forEach(b=>b.addEventListener('click',()=>{
  filters.forEach(f=>f.setAttribute('aria-pressed',String(f===b)));
  for(const card of cards)card.hidden=b.dataset.filter!=='all'&&card.dataset.verb!==b.dataset.filter;
  document.querySelector('#filter-status').textContent=cards.filter(c=>!c.hidden).length+' studies';
 }));
 const links=[...document.querySelectorAll('.case-sections a')];
 const menu=document.querySelector('.case-menu');
 const desktop=matchMedia('(min-width:1101px)');
 const setMenu=()=>{menu.open=desktop.matches;};setMenu();desktop.addEventListener('change',setMenu);
 links.forEach(a=>a.addEventListener('click',()=>{if(!desktop.matches)menu.open=false;const target=document.querySelector(a.hash);target.tabIndex=-1;target.focus({preventScroll:true});}));
 menu.addEventListener('keydown',e=>{if(e.key==='Escape'&&!desktop.matches){menu.open=false;menu.querySelector('summary').focus();}});
 const rail=document.querySelector('.case-scroll-rail'),ticks=[...rail.children];
 const scrollRange=()=>Math.max(0,document.documentElement.scrollHeight-innerHeight);
 function updateRail(){
  const progress=scrollRange()?scrollY/scrollRange():0;
  rail.setAttribute('aria-valuenow',String(Math.round(progress*100)));
  ticks.forEach((tick,i)=>{const d=Math.abs(i-progress*(ticks.length-1)),strength=Math.max(0,1-d/4);tick.style.setProperty('--tick-width',(10+38*strength*strength)+'px');tick.style.setProperty('--tick-opacity',.35+.65*strength);});
 }
 function scrub(e){const r=rail.getBoundingClientRect();window.PortfolioScroll?.cancel();window.scrollTo({top:Math.max(0,Math.min(1,(e.clientY-r.top)/r.height))*scrollRange(),behavior:'instant'});}
 rail.addEventListener('pointerdown',e=>{if(e.button!==0)return;e.preventDefault();rail.focus({preventScroll:true});rail.setPointerCapture(e.pointerId);scrub(e);});
 rail.addEventListener('pointermove',e=>{if(rail.hasPointerCapture(e.pointerId))scrub(e);});
 rail.addEventListener('pointerup',e=>{if(rail.hasPointerCapture(e.pointerId))rail.releasePointerCapture(e.pointerId);});
 rail.addEventListener('keydown',e=>{
  const destinations={Home:0,End:scrollRange(),ArrowDown:scrollY+80,ArrowUp:scrollY-80,PageDown:scrollY+innerHeight*.8,PageUp:scrollY-innerHeight*.8};
  if(!(e.key in destinations))return;e.preventDefault();window.PortfolioScroll?.cancel();window.scrollTo({top:destinations[e.key],behavior:reduced.matches?'instant':'smooth'});
 });
 function current(){
  let selected=links[0];
  for(const a of links)if(document.querySelector(a.hash).getBoundingClientRect().top<innerHeight*.42)selected=a;
  links.forEach(a=>a===selected?a.setAttribute('aria-current','location'):a.removeAttribute('aria-current'));
  updateRail();
 }
 window.addEventListener('scroll',current,{passive:true});current();
 window.addEventListener('resize',current);new ResizeObserver(current).observe(document.querySelector('main'));
 document.addEventListener('visibilitychange',()=>{syncReel();if(document.hidden)stage.querySelector('video')?.pause();});
 window.addEventListener('portfolio:depart',()=>{departing=true;pauseReel();if(modal.open)modal.close();});
 window.addEventListener('pagehide',pauseReel);window.addEventListener('pageshow',()=>{departing=false;syncReel();});
})();
