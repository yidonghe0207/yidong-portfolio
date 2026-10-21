(()=>{
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const videos=[...document.querySelectorAll('[data-case-video]')];
 const states=new Map(videos.map(v=>[v,{visible:false,userPaused:false,systemPause:false}]));
 function syncVideos(){for(const v of videos){
  const s=states.get(v),blocked=!s.visible||document.hidden||!!document.querySelector('dialog[open]');
  if(blocked||reduced.matches||navigator.connection?.saveData||s.userPaused){if(!v.paused){s.systemPause=true;v.pause();}}
  else v.play().catch(()=>{});
 }}
 const videoObserver=new IntersectionObserver(entries=>{
  for(const entry of entries){const v=entry.target;states.get(v).visible=entry.isIntersecting;
   if(entry.isIntersecting&&v.dataset.src){window.PortfolioMedia.load(v);}
  }syncVideos();
 },{threshold:.25});
 videos.forEach(v=>{v.muted=true;videoObserver.observe(v);
  v.addEventListener('pause',()=>{const s=states.get(v);if(s.systemPause){s.systemPause=false;return;}if(s.visible&&!document.hidden&&!document.querySelector('dialog[open]'))s.userPaused=true;});
  v.addEventListener('play',()=>{states.get(v).userPaused=false;});
 });
 document.addEventListener('visibilitychange',syncVideos);reduced.addEventListener('change',syncVideos);
 const dialog=document.querySelector('.language-dialog');let opener,overflow='';
 document.querySelectorAll('[data-enlarge]').forEach(button=>button.addEventListener('click',()=>{
  opener=button;overflow=document.body.style.overflow;document.body.style.overflow='hidden';
  dialog.querySelector('h2').textContent=button.dataset.title;
  const img=dialog.querySelector('img');img.src=button.dataset.enlarge;img.alt=button.dataset.alt||button.querySelector('img')?.alt||button.dataset.title;
  dialog.showModal();syncVideos();dialog.querySelector('button').focus();
 }));
 dialog.querySelector('[data-close-image]').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();});
 dialog.addEventListener('close',()=>{document.body.style.overflow=overflow;opener?.focus({preventScroll:true});syncVideos();});
 const links=[...document.querySelectorAll('.case-sections a')],menu=document.querySelector('.case-menu'),desktop=matchMedia('(min-width:1101px)');
 const setMenu=()=>{menu.open=desktop.matches;};setMenu();desktop.addEventListener('change',setMenu);
 links.forEach(a=>a.addEventListener('click',()=>{if(!desktop.matches)menu.open=false;const target=document.querySelector(a.hash);target.tabIndex=-1;target.focus({preventScroll:true});}));
 menu.addEventListener('keydown',e=>{if(e.key==='Escape'&&!desktop.matches){menu.open=false;menu.querySelector('summary').focus();}});
 const rail=document.querySelector('.case-scroll-rail'),ticks=[...rail.children];
 const range=()=>Math.max(0,document.documentElement.scrollHeight-innerHeight);
 function current(){
  let selected=links[0];for(const a of links)if(document.querySelector(a.hash).getBoundingClientRect().top<innerHeight*.42)selected=a;
  links.forEach(a=>a===selected?a.setAttribute('aria-current','location'):a.removeAttribute('aria-current'));
  const progress=range()?scrollY/range():0;rail.setAttribute('aria-valuenow',String(Math.round(progress*100)));
  ticks.forEach((tick,i)=>{const strength=Math.max(0,1-Math.abs(i-progress*(ticks.length-1))/4);tick.style.setProperty('--tick-width',(10+38*strength*strength)+'px');tick.style.setProperty('--tick-opacity',.35+.65*strength);});
 }
 function scrub(e){const r=rail.getBoundingClientRect();window.PortfolioScroll?.cancel();window.scrollTo({top:Math.max(0,Math.min(1,(e.clientY-r.top)/r.height))*range(),behavior:'instant'});}
 rail.addEventListener('pointerdown',e=>{if(e.button!==0)return;e.preventDefault();rail.focus({preventScroll:true});rail.setPointerCapture(e.pointerId);scrub(e);});
 rail.addEventListener('pointermove',e=>{if(rail.hasPointerCapture(e.pointerId))scrub(e);});
 rail.addEventListener('pointerup',e=>{if(rail.hasPointerCapture(e.pointerId))rail.releasePointerCapture(e.pointerId);});
 rail.addEventListener('keydown',e=>{const positions={Home:0,End:range(),ArrowDown:scrollY+80,ArrowUp:scrollY-80,PageDown:scrollY+innerHeight*.8,PageUp:scrollY-innerHeight*.8};if(!(e.key in positions))return;e.preventDefault();window.PortfolioScroll?.cancel();window.scrollTo({top:positions[e.key],behavior:reduced.matches?'instant':'smooth'});});
 window.addEventListener('scroll',current,{passive:true});window.addEventListener('resize',current);new ResizeObserver(current).observe(document.querySelector('main'));current();
})();
