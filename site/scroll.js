/* Wheel momentum on the native document scroll. Touch keeps its native inertia. */
(()=>{
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(pointer: fine)');
 let raf=0,target=scrollY,position=scrollY,written=scrollY,last=0,direction=0,tau=190;
 const limit=()=>Math.max(0,document.documentElement.scrollHeight-innerHeight);
 const clamp=value=>Math.min(limit(),Math.max(0,value));
 function cancel(){cancelAnimationFrame(raf);raf=0;target=position=written=scrollY;direction=0;}
 function frame(now){
  if(document.hidden||reduced.matches||document.querySelector('dialog[open]')||window.PortfolioNav?.busy||Math.abs(scrollY-written)>2){cancel();return;}
  const dt=Math.min(now-last||16,64);last=now;target=clamp(target);
  position+=(target-position)*(1-Math.exp(-dt/tau));
  const done=Math.abs(target-position)<.4;if(done)position=target;
  window.scrollTo({top:position,behavior:'instant'});written=scrollY;
  if(done){raf=0;direction=0;}else raf=requestAnimationFrame(frame);
 }
 function nestedScroll(event){
  for(const el of event.composedPath()){
   if(!(el instanceof Element)||el===document.body||el===document.documentElement)continue;
   if(el.matches('dialog,textarea,input,select,[contenteditable=true],[data-native-scroll]'))return true;
   const style=getComputedStyle(el);if(/auto|scroll/.test(style.overflowY)&&el.scrollHeight>el.clientHeight+1)return true;
  }
  return false;
 }
 window.addEventListener('wheel',event=>{
  if(!fine.matches||reduced.matches||event.defaultPrevented||!event.cancelable||event.ctrlKey||event.metaKey||event.shiftKey||Math.abs(event.deltaX)>Math.abs(event.deltaY)||!event.deltaY||document.querySelector('dialog[open]')||window.PortfolioNav?.busy||nestedScroll(event))return;
  const delta=event.deltaY*(event.deltaMode===1?18:event.deltaMode===2?innerHeight:1),sign=Math.sign(delta);
  if(!raf||direction!==sign||Math.abs(scrollY-written)>2){cancel();}
  target=clamp(target+delta);if(!raf&&Math.abs(target-scrollY)<.5)return;
  event.preventDefault();direction=sign;tau=Math.abs(delta)<50?115:190;
  if(!raf){position=written=scrollY;last=performance.now();raf=requestAnimationFrame(frame);}
 },{passive:false});
 window.addEventListener('pointerdown',cancel,{passive:true});
 window.addEventListener('touchstart',cancel,{passive:true});
 window.addEventListener('keydown',event=>{if(['ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' ','Escape','Tab'].includes(event.key))cancel();});
 document.addEventListener('click',event=>{if(event.target.closest('a,button'))cancel();},true);
 for(const event of ['portfolio:depart','pagehide','pageshow','resize','hashchange','popstate'])window.addEventListener(event,cancel);
 document.addEventListener('visibilitychange',cancel);reduced.addEventListener('change',cancel);fine.addEventListener('change',cancel);
 window.PortfolioScroll={cancel,get active(){return !!raf;}};
})();
