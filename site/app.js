(()=>{
'use strict';
const cfg=window.PORTFOLIO,$=s=>document.querySelector(s),reduced=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(pointer:fine)');
const detail=document.body.classList.contains('project-page'),base=detail?'../../prototypes/':'../prototypes/',asset=n=>base+'assets/'+n,href=id=>(detail?'':'work/')+id+'.html';
const hero=$('.hero'),dialog=$('.info-dialog'),grid=$('.work-grid');let paused=reduced.matches||!!navigator.connection?.saveData,heroVisible=!!hero,hoverWork=false,mouseActive=false,raf=0,last=0,colour=0,opacity=0;
const pointer={x:innerWidth/2,y:innerHeight/2,tx:innerWidth/2,ty:innerHeight/2};
function media(p,extra=''){const cover=window.projectCover?.(p,asset);if(cover)return cover;return p.video?`<video muted loop playsinline preload="metadata" poster="${asset(p.image)}" ${extra}><source src="${asset(p.video)}" type="video/webm"></video>`:`<img src="${asset(p.image)}" alt="${p.title}" ${extra}>`;}
if(grid){grid.innerHTML=cfg.works.filter(p=>!p.study&&!p.draft&&p.collection!=='playground').map(p=>{
  const tag=p.previewOnly?'article':'a';
  const attributes=p.previewOnly?`aria-label="${p.title}"`:`href="${href(p.id)}" aria-label="Explore ${p.title}"`;
  return `<${tag} class="work-tile${p.previewOnly?' work-preview':''}" data-id="${p.id}" ${attributes}><div class="tile-visual">${media(p,'loading="lazy"')}${p.previewOnly?'':'<span class="tile-open" aria-hidden="true">↗</span>'}</div><div class="tile-meta"><h3>${p.title}</h3></div><p class="tile-description">${p.description}</p></${tag}>`;
}).join('');}
const floats=[];
if(hero){const specs=[['fog',3,.32,.24,7],['ferry',58,.08,.36,9],['verbs',66,.64,.25,8]];
for(const [id,x,y,w,speed]of specs){const p=cfg.works.find(p=>p.id===id),el=document.createElement('a');el.className='float-work';el.dataset.id=id;el.href=href(id);el.setAttribute('aria-label','Explore '+p.title);el.style.setProperty('--ratio',id==='fog'?'1.90476':id==='ferry'?'1.7':id==='verbs'?'1.7777778':'1.5');el.innerHTML=`<div class="float-media">${media(p)}</div>`;$('.floating-works').append(el);floats.push({el,x,ySeed:y,w,speed,y:(innerWidth<580?({fog:.60,ferry:.12,verbs:.74,gravity:1.03}[id]):y)*hero.clientHeight,height:0,hold:false,velocity:1});}
new IntersectionObserver(entries=>{heroVisible=entries[0].isIntersecting},{threshold:0}).observe(hero);
}
let layoutMobile=innerWidth<580,layoutHeight=hero?.clientHeight||innerHeight;
function layout(){const nextHeight=hero?.clientHeight||innerHeight;for(const f of floats){const mobile=innerWidth<580,id=f.el.dataset.id;if(mobile!==layoutMobile)f.y=(mobile?({fog:.60,ferry:.12,verbs:.74}[id]):f.ySeed)*nextHeight;else if(nextHeight!==layoutHeight)f.y*=nextHeight/layoutHeight;const width=mobile?innerWidth*({fog:.49,ferry:.67,verbs:.49,gravity:.37}[id]):Math.min(innerWidth*f.w,id==='ferry'?640:490);f.el.style.setProperty('--w',width+'px');const ratio=id==='fog'?1.90476:id==='ferry'?1.7:id==='verbs'?1.25:1.5;f.height=width/ratio;f.left=mobile?innerWidth*({fog:.04,ferry:.30,verbs:.47,gravity:.10}[id]):Math.min(innerWidth-width-24,innerWidth*f.x/100);if(reduced.matches)f.y=(mobile?({fog:.60,ferry:.12,verbs:.74,gravity:1.03}[id]):f.ySeed)*hero.clientHeight;f.el.style.transform=`translate3d(${f.left}px,${f.y}px,0)`;}layoutMobile=innerWidth<580;layoutHeight=nextHeight;}
let phraseIndex=0,travel=0,phraseTime=0,phraseTimer=0,contextTimer=0,previousPointer=null,hoveredWork=null,focusedWork=null,activeWork=null;
const phraseEl=$('#phrase'),tileStates=[];
function changePhrase(text,immediate=false){if(!phraseEl)return;clearTimeout(phraseTimer);travel=0;phraseTime=performance.now();if(phraseEl.textContent===text){phraseEl.classList.remove('changing');return;}if(reduced.matches||immediate){phraseEl.textContent=text;phraseEl.classList.remove('changing');return;}phraseEl.classList.add('changing');phraseTimer=setTimeout(()=>{phraseEl.textContent=text;phraseEl.classList.remove('changing')},125);}
function nextPhrase(){if(!phraseEl||activeWork||window.PortfolioNav?.busy)return;phraseIndex=(phraseIndex+1)%cfg.phrases.length;changePhrase(cfg.phrases[phraseIndex]);}
function updateContext(){
  activeWork=hoveredWork||focusedWork;hoverWork=!!activeWork;travel=0;clearTimeout(contextTimer);document.body.classList.toggle('work-attention',!!activeWork);document.body.dataset.activeWork=activeWork?.dataset.id||'';floats.forEach(f=>f.el.classList.toggle('is-current',f.el===activeWork));
  floats.forEach(f=>{f.hold=f.el===hoveredWork||f.el===focusedWork;});
  const work=activeWork;
  if(work){contextTimer=setTimeout(()=>{if(activeWork===work)changePhrase(cfg.projectPhrases[work.dataset.id]||cfg.phrases[phraseIndex]);},110);}
  else contextTimer=setTimeout(()=>{if(!activeWork)changePhrase(cfg.phrases[phraseIndex]);},500);
}
document.querySelectorAll('.float-work,.work-tile').forEach(el=>{
  el.addEventListener('pointerenter',e=>{if(e.pointerType==='touch')return;hoveredWork=el;updateContext();});
  el.addEventListener('pointerleave',()=>{if(hoveredWork===el)hoveredWork=null;updateContext();});
  el.addEventListener('focus',()=>{if(el.matches(':focus-visible')){focusedWork=el;updateContext();}});
  el.addEventListener('blur',()=>{if(focusedWork===el)focusedWork=null;updateContext();});
  el.addEventListener('pointerdown',()=>el.classList.add('is-pressed'));
  if(el.classList.contains('work-tile')){
    const visual=el.querySelector('.tile-visual'),s={el,visual,x:0,y:0,tx:0,ty:0,active:false};tileStates.push(s);
    function target(e){const r=visual.getBoundingClientRect(),x=Math.max(0,Math.min(r.width,e.clientX-r.left)),y=Math.max(0,Math.min(r.height,e.clientY-r.top));const d=[x,r.width-x,y,r.height-y],edge=d.indexOf(Math.min(...d));s.tx=edge===0?0:edge===1?r.width:x;s.ty=edge===2?0:edge===3?r.height:y;el.style.setProperty('--visual-height',r.height+'px');}
    el.addEventListener('pointerenter',e=>{s.active=true;target(e);s.x=s.tx;s.y=s.ty;});el.addEventListener('pointermove',target);el.addEventListener('pointerleave',()=>s.active=false);
    el.addEventListener('focus',()=>{const r=visual.getBoundingClientRect();s.tx=r.width/2;s.ty=r.height;s.active=true;el.style.setProperty('--visual-height',r.height+'px');});el.addEventListener('blur',()=>s.active=false);
  }
});
['pointerup','pointercancel','dragstart'].forEach(event=>document.addEventListener(event,()=>document.querySelectorAll('.is-pressed').forEach(el=>el.classList.remove('is-pressed'))));
// Measure the longest phrase once per viewport/font change. Only the words change;
// the lead-in and brackets keep their positions, including on small screens.
function measurePhraseSlot(){
  if(!phraseEl)return;
  const line=$('.second-line'),wrap=$('.phrase-wrap'),lead=$('.phrase-lead'),font=getComputedStyle(line);
  const probe=document.createElement('em');Object.assign(probe.style,{position:'fixed',visibility:'hidden',whiteSpace:'nowrap',fontFamily:font.fontFamily,fontSize:font.fontSize,fontWeight:font.fontWeight,fontVariationSettings:font.fontVariationSettings,fontStyle:'italic',letterSpacing:getComputedStyle(phraseEl).letterSpacing});document.body.append(probe);
  let longest=0;for(const text of [...cfg.phrases,...Object.values(cfg.projectPhrases)]){probe.textContent=text;longest=Math.max(longest,probe.getBoundingClientRect().width);}probe.remove();
  const mobile=innerWidth<=580,available=$('.introduction').clientWidth-40,brackets=parseFloat(font.fontSize)*.76;
  const maxSlot=Math.max(100,available-(mobile?0:lead.getBoundingClientRect().width+parseFloat(font.fontSize)*.22)-brackets),slot=Math.min(longest+6,maxSlot),size=parseFloat(font.fontSize)*Math.min(1,(slot-6)/longest);
  wrap.style.setProperty('--phrase-width',slot+'px');wrap.style.setProperty('--phrase-size',size+'px');
}
document.fonts?.ready.then(measurePhraseSlot);
$('.phrase-next')?.addEventListener('click',nextPhrase);
function showInfo(type){const content=$('#info-content');if(type==='about'){content.innerHTML='<h2>Yidong He <span lang="zh-CN">何宜东</span></h2><p>I work across AI, interaction, and spatial design — exploring how ideas become things we can see, use, and feel.</p><p>My experience also includes AI product work at 51WORLD and model evaluation at ByteDance.</p><p><a href="'+cfg.links.linkedin+'" target="_blank" rel="noopener noreferrer">Find me on LinkedIn ↗</a></p>';}else{content.innerHTML='<h2>Résumé</h2><p>The résumé will be added here soon.</p><p><a href="'+cfg.links.linkedin+'" target="_blank" rel="noopener noreferrer">View LinkedIn ↗</a></p>';}
content.querySelector('h2').id='info-title';dialog.showModal();mouseActive=false;document.body.classList.remove('fog-ready');syncVideos();}
document.querySelectorAll('[data-about]').forEach(b=>b.addEventListener('click',()=>showInfo('about')));
document.querySelectorAll('[data-link]').forEach(b=>b.addEventListener('click',()=>{const link=cfg.links[b.dataset.link];if(link)location.href=link;else showInfo(b.dataset.link)}));
$('.close-dialog')?.addEventListener('click',()=>dialog.close());dialog?.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});dialog?.addEventListener('close',syncVideos);
const vids=[...document.querySelectorAll('video')],visibleVideos=new WeakSet();
function syncVideos(){for(const v of vids){if(v.controls)continue;if(visibleVideos.has(v)&&!paused&&!document.hidden&&!dialog?.open){window.PortfolioMedia?.load(v);v.play().catch(()=>{});}else v.pause();}}
const mediaObserver=new IntersectionObserver(entries=>{for(const e of entries){if(e.isIntersecting)visibleVideos.add(e.target);else visibleVideos.delete(e.target);}syncVideos();},{threshold:.04});vids.forEach(v=>mediaObserver.observe(v));
function setMotion(value){paused=value;document.body.classList.toggle('motion-paused',value);const b=$('.motion-toggle');if(b){b.setAttribute('aria-pressed',String(value));b.innerHTML=value?'Resume motion <span aria-hidden="true">▷</span>':'Pause motion <span aria-hidden="true">Ⅱ</span>';}syncVideos();}
$('.motion-toggle')?.addEventListener('click',()=>setMotion(!paused));setMotion(paused);
function resize(){layout();measurePhraseSlot();}
window.addEventListener('resize',resize);resize();
document.addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;pointer.tx=e.clientX;pointer.ty=e.clientY;mouseActive=true;hoverWork=!!e.target.closest('.float-work,.work-tile,.project-studies a');if(previousPointer&&heroVisible&&!paused&&!dialog?.open&&!activeWork&&!window.PortfolioNav?.busy&&!e.target.closest('a,button')){const distance=Math.hypot(e.clientX-previousPointer.x,e.clientY-previousPointer.y);if(distance>2)travel+=distance;if(travel>180&&performance.now()-phraseTime>1400)nextPhrase();}previousPointer={x:e.clientX,y:e.clientY};});
document.documentElement.addEventListener('pointerleave',()=>{mouseActive=false;document.body.classList.remove('fog-ready')});document.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'){mouseActive=false;document.body.classList.remove('fog-ready')}});
document.addEventListener('focusin',()=>{if(!mouseActive)document.body.classList.remove('fog-ready')});
function frame(time){const dt=Math.min((time-last)/1000||0,.045);last=time;
if(hero){const progress=Math.max(0,Math.min(1,scrollY/(hero.clientHeight*.72)));hero.style.setProperty('--scroll-progress',progress);}
if(heroVisible&&!paused&&!dialog?.open&&!window.PortfolioNav?.busy){for(const f of floats){const target=f.hold?0:1;f.velocity+=(target-f.velocity)*(1-Math.exp(-dt/(f.hold?.1:.4)));if(Math.abs(f.velocity-target)<.006)f.velocity=target;f.y-=f.speed*f.velocity*dt*(1-Math.min(.7,scrollY/hero.clientHeight));if(f.y<-f.height-75)f.y=hero.clientHeight+70;f.el.style.transform=`translate3d(${f.left}px,${f.y}px,0)`;}}
for(const s of tileStates){if(!s.active)continue;const ease=reduced.matches?1:1-Math.exp(-dt/.085);s.x+=(s.tx-s.x)*ease;s.y+=(s.ty-s.y)*ease;s.el.style.setProperty('--glow-x',s.x+'px');s.el.style.setProperty('--glow-y',s.y+'px');}
raf=requestAnimationFrame(frame);}
function start(){cancelAnimationFrame(raf);last=performance.now();raf=requestAnimationFrame(frame)}
document.addEventListener('visibilitychange',()=>{if(document.hidden)cancelAnimationFrame(raf);else start();syncVideos()});reduced.addEventListener('change',()=>{setMotion(reduced.matches);if(reduced.matches){document.body.classList.remove('fog-ready');}layout()});start();
// Real, existing studies are loaded on demand so the portfolio does not run several WebGL scenes at once.
const launch=$('.launch-study');launch?.addEventListener('click',()=>{const stage=$('.study-stage');if(stage.classList.contains('open'))return;const id=launch.dataset.study;stage.innerHTML=`<iframe title="${id} interactive study" src="${base}studies/${id}/index.html" allow="autoplay"></iframe><button class="close-study">Close experiment ↑</button>`;stage.classList.add('open');launch.hidden=true;stage.querySelector('.close-study').onclick=closeStudy;stage.scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'center'});});
function closeStudy(){const stage=$('.study-stage');stage?.replaceChildren();stage?.classList.remove('open');if(launch){launch.hidden=false;launch.focus();}}
window.addEventListener('message',e=>{const f=$('.study-stage iframe');if(f&&e.source===f.contentWindow&&e.data==='portfolio:close-study')closeStudy()});

let returnFocus=null;
function saveHome(link){if(!hero)return;if(link?.dataset.id)returnFocus={kind:link.classList.contains('float-work')?'float-work':'work-tile',id:link.dataset.id};const snapshot={url:location.href,scroll:scrollY,height:hero.clientHeight,paused,phraseIndex,phrase:phraseEl.textContent,focus:returnFocus,floats:floats.map(f=>({id:f.el.dataset.id,y:f.y}))};window.PortfolioNav?.store.set(':home',snapshot);try{history.replaceState({...history.state,portfolioHome:snapshot},'');}catch{}}
function restoreHome(){
  if(!hero)return;
  const s=history.state?.portfolioHome||window.PortfolioNav?.store.get(':home');if(!s||!Number.isFinite(s.scroll))return;
  hoveredWork=focusedWork=activeWork=null;hoverWork=false;document.body.classList.remove('work-attention');document.body.dataset.activeWork='';floats.forEach(f=>f.el.classList.remove('is-current'));clearTimeout(contextTimer);clearTimeout(phraseTimer);travel=0;previousPointer=null;
  phraseIndex=Number.isInteger(s.phraseIndex)?Math.max(0,Math.min(cfg.phrases.length-1,s.phraseIndex)):0;
  const valid=[...cfg.phrases,...Object.values(cfg.projectPhrases)];changePhrase(valid.includes(s.phrase)?s.phrase:cfg.phrases[phraseIndex],true);setMotion(reduced.matches||!!s.paused);
  for(const f of floats){const previous=s.floats?.find(x=>x.id===f.el.dataset.id);if(previous&&Number.isFinite(previous.y)&&s.height>0)f.y=Math.max(-f.height-70,Math.min(hero.clientHeight+70,previous.y*hero.clientHeight/s.height));f.hold=false;f.velocity=1;f.el.style.transform=`translate3d(${f.left}px,${f.y}px,0)`;}
  returnFocus=s.focus;window.scrollTo({top:s.scroll,behavior:'instant'});
  if(returnFocus&&cfg.works.some(p=>p.id===returnFocus.id)&&['float-work','work-tile'].includes(returnFocus.kind))document.querySelector('.'+returnFocus.kind+'[data-id="'+returnFocus.id+'"]')?.focus({preventScroll:true});
}
window.addEventListener('portfolio:depart',e=>saveHome(e.detail.link));
window.addEventListener('pagehide',()=>{saveHome();cancelAnimationFrame(raf);});
window.addEventListener('pageshow',e=>{if(e.persisted){restoreHome();start();syncVideos();}});
if(window.PortfolioNav?.returning)restoreHome();
window.PortfolioNav?.ready();
})();
