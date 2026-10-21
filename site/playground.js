(()=>{
 'use strict';
 const grid=document.querySelector('.playground-grid');if(!grid)return;
 const projects=window.PORTFOLIO.works.filter(p=>p.collection==='playground');
 const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const visual=p=>p.previewTiles?`<div class="play-art-grid" role="img" aria-label="${escape(p.previewAlt)}">${p.previewTiles.map(a=>`<img src="${escape(a.src)}" alt="" title="${escape(a.alt)}" loading="lazy" style="object-position:${escape(a.position||'50% 50%')}">`).join('')}</div>`:`<img src="${p.preview}" alt="${p.previewAlt}" loading="lazy">`;
 grid.innerHTML=projects.map(p=>p.url?`<article class="play-card play-project" data-id="${p.id}">
  <a class="play-project-link" href="${p.url}" target="_blank" rel="noopener noreferrer" aria-label="Play ${p.title} (opens in a new tab)">
   <div class="tile-visual play-visual">${visual(p)}</div>
   <div class="play-meta"><h3>${p.title}</h3><span class="play-status" aria-hidden="true">Play ↗</span></div>
   <p class="play-description">${p.description}</p>
  </a>
  <a class="play-source" href="${p.repository}" target="_blank" rel="noopener noreferrer" aria-label="${p.title} source on GitHub (opens in a new tab)">GitHub ↗</a>
  ${p.imageCredit?`<a class="play-art-credit" href="${p.imageCredit}" target="_blank" rel="noopener noreferrer">Art: Harvard Art Museums ↗</a>`:''}
 </article>`:`<article class="play-card play-preview" data-id="${p.id}" tabindex="0" aria-label="${p.title}, coming soon" aria-describedby="${p.id}-status">
  <div class="tile-visual play-visual"><img src="${p.preview}" alt="${p.previewAlt}" loading="lazy"></div>
  <div class="play-meta"><h3>${p.title}</h3><span class="preview-status" id="${p.id}-status">Coming soon</span></div>
 </article>`).join('');
 const bubble=document.createElement('span');bubble.className='coming-soon-bubble';bubble.textContent='Coming soon';bubble.setAttribute('aria-hidden','true');document.body.append(bubble);
 const fine=matchMedia('(hover:hover) and (pointer:fine)');
 let active=null;
 const hide=()=>{active=null;bubble.classList.remove('is-visible');};
 function place(x,y){
  bubble.style.left=Math.max(8,Math.min(x+18,innerWidth-bubble.offsetWidth-12))+'px';
  bubble.style.top=Math.max(8,Math.min(y+18,innerHeight-bubble.offsetHeight-12))+'px';
 }
 for(const card of grid.querySelectorAll('.play-preview')){
  card.addEventListener('pointermove',e=>{if(!fine.matches||e.pointerType==='touch')return;active=card;place(e.clientX,e.clientY);bubble.classList.add('is-visible');});
  card.addEventListener('pointerleave',hide);
  card.addEventListener('focus',()=>{if(!card.matches(':focus-visible'))return;active=card;const r=card.getBoundingClientRect();place(r.left+16,r.top+16);bubble.classList.add('is-visible');});
  card.addEventListener('blur',hide);
 }
 window.addEventListener('scroll',hide,{passive:true});
 window.addEventListener('resize',hide);
 document.addEventListener('keydown',e=>{if(e.key==='Escape')hide();});
})();
