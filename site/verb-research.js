/* Read-only board exports and the featured study. No Figma writes or live dependencies. */
(()=>{
 const root='../assets/verb-research/';
 const boards={
  sync:['2-480','Sync — shared timing, copies, rhythm, and the uncertainty of syncing.'],
  tune:['3-903','Tune — adjustment, harmony, refinement, and giving up control.'],
  drift:['3-706','Drift — currents, momentum, and becoming socially distant while digitally connected.'],
  inquire:['1-59','Inquire — asking, anticipation, and the tension between knowing and not knowing.'],
  reveal:['2-12','Reveal — unveiling, pattern-finding, anticipation, and selective legibility.']
 };
 const preview=document.querySelector('#board-preview'),boardButton=preview.closest('button');
 document.querySelectorAll('[data-board]').forEach(button=>button.addEventListener('click',()=>{
  const id=button.dataset.board,name=button.textContent;
  document.querySelectorAll('[data-board]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  preview.src=root+id+'-board.png';preview.alt=name+' progress board: word research, visual references and interaction sketches';
  boardButton.dataset.enlarge=root+id+(['reveal','tune'].includes(id)?'-board-detail.png':'-board.png');
  boardButton.dataset.caption=name+' — progress board';boardButton.setAttribute('aria-label','Enlarge '+name+' progress board');
  document.querySelector('#board-caption').textContent=boards[id][1];
  document.querySelector('#board-source').href='https://www.figma.com/design/XZ9jnVRXNWU3WVALbcdmfv/VIS2489-Verb-Studies-Yidong-He?node-id='+boards[id][0];
 }));
 const dialog=document.querySelector('.research-dialog'),photo=dialog.querySelector('img'),scroll=dialog.querySelector('.research-image-scroll'),zoom=dialog.querySelector('.research-zoom');
 let opener,previousOverflow='';
 document.querySelectorAll('[data-enlarge]').forEach(button=>button.addEventListener('click',()=>{
  opener=button;previousOverflow=document.body.style.overflow;window.PortfolioScroll?.cancel();document.body.style.overflow='hidden';
  dialog.querySelector('h2').textContent=button.dataset.caption;photo.alt=button.dataset.caption;photo.src=button.dataset.enlarge;
  scroll.classList.toggle('is-board',button.classList.contains('board-image'));
  scroll.classList.remove('is-zoomed');zoom.setAttribute('aria-pressed','false');zoom.textContent='Zoom in';
  dialog.showModal();scroll.scrollTo(0,0);dialog.querySelector('.research-close').focus();
 }));
 zoom.addEventListener('click',()=>{const enlarged=scroll.classList.toggle('is-zoomed');zoom.setAttribute('aria-pressed',String(enlarged));zoom.textContent=enlarged?'Fit image':'Zoom in';scroll.scrollTo(0,0);});
 dialog.querySelector('.research-close').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();});
 dialog.addEventListener('close',()=>{document.body.style.overflow=previousOverflow;opener?.focus({preventScroll:true});});
 window.addEventListener('portfolio:depart',()=>{if(dialog.open)dialog.close();});
 const video=document.querySelector('.research-demo-video'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let visible=false,wantsPlay=!reduced.matches&&!navigator.connection?.saveData,managedPause=false,departing=false;
 if(reduced.matches){video.removeAttribute('autoplay');video.pause();}
 function sync(){if(visible&&wantsPlay&&!document.hidden&&!departing&&!document.querySelector('dialog[open]'))video.play().catch(()=>{});else if(!video.paused){managedPause=true;video.pause();}}
 video.addEventListener('pause',()=>{if(managedPause)managedPause=false;else wantsPlay=false;});
 video.addEventListener('play',()=>{wantsPlay=true;sync();});
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)window.PortfolioMedia?.load(video);sync();},{threshold:.2}).observe(video);
 const observer=new MutationObserver(sync);document.querySelectorAll('dialog').forEach(d=>observer.observe(d,{attributes:true,attributeFilter:['open']}));
 document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',()=>{wantsPlay=!reduced.matches;sync();});
 window.addEventListener('portfolio:depart',()=>{departing=true;sync();});window.addEventListener('pageshow',()=>{departing=false;sync();});
})();
