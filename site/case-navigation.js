/* Shared chapter navigation and scroll rail for text-led case studies. */
(()=>{
 'use strict';
 const links=[...document.querySelectorAll('.case-sections a')],menu=document.querySelector('.case-menu'),rail=document.querySelector('.case-scroll-rail');
 if(!menu||!rail||!links.length)return;
 const desktop=matchMedia('(min-width:1101px)'),reduced=matchMedia('(prefers-reduced-motion:reduce)'),ticks=[...rail.children];
 const setMenu=()=>menu.open=desktop.matches;setMenu();desktop.addEventListener('change',setMenu);
 links.forEach(a=>a.addEventListener('click',()=>{if(!desktop.matches)menu.open=false;const target=document.querySelector(a.hash);target.tabIndex=-1;target.focus({preventScroll:true});}));
 menu.addEventListener('keydown',e=>{if(e.key==='Escape'&&!desktop.matches){menu.open=false;menu.querySelector('summary').focus();}});
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
