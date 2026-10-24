/* Shared by the homepage and every project template. Run in <head> before paint. */
(()=>{
 const root=document.documentElement,key='yidong-portfolio-theme',valid=v=>v==='light'||v==='dark';
 let saved;try{saved=localStorage.getItem(key);}catch{}
 const requested=new URL(location.href).searchParams.get('theme');
 let theme=valid(requested)?requested:valid(saved)?saved:'dark';
 const sun='<circle cx="12" cy="12" r="3.6"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.4 1.4m11.2 11.2L19 19M5 19l1.4-1.4M17.6 6.4 19 5"/>';
 const moon='<path d="M20.3 14.3A8.6 8.6 0 0 1 9.7 3.7a8.6 8.6 0 1 0 10.6 10.6Z"/>';
 let button;
 function carry(a){
  if(location.protocol!=='file:'||!a?.hasAttribute('href'))return;
  const u=new URL(a.href,location.href),base=new URL('.',document.currentScript?.src||scriptURL);
  if(u.protocol==='file:'&&u.pathname.startsWith(base.pathname)&&u.pathname.endsWith('.html')&&u.pathname!==location.pathname){u.searchParams.set('theme',theme);a.href=u.href;}
 }
 const scriptURL=document.currentScript.src;
 function apply(next,persist=true){
  theme=next;root.dataset.theme=theme;root.style.colorScheme=theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content',theme==='light'?'#ffffff':'#050505');
  if(persist)try{localStorage.setItem(key,theme);}catch{}
  if(location.protocol==='file:'){const u=new URL(location.href);u.searchParams.set('theme',theme);try{history.replaceState(history.state,'',u);}catch{}}
  if(button){const label=theme==='dark'?'Switch to light mode':'Switch to dark mode';button.setAttribute('aria-label',label);button.title=label;button.setAttribute('aria-pressed',String(theme==='light'));button.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(theme==='dark'?sun:moon)+'</svg>';}
  if(location.protocol==='file:')document.querySelectorAll('a[href]').forEach(carry);
  window.dispatchEvent(new CustomEvent('portfolio:theme',{detail:{theme}}));
 }
 apply(theme);
 document.addEventListener('DOMContentLoaded',()=>{
  const nav=document.querySelector('.site-header nav');if(!nav)return;
  button=document.createElement('button');button.className='theme-toggle';button.type='button';nav.append(button);
  button.addEventListener('click',()=>apply(theme==='dark'?'light':'dark'));apply(theme,false);
  // Keep both glass capsules on one row; move the same links into a disclosure
  // on phones, so desktop navigation and its active-page state stay intact.
  const header=nav.closest('.site-header'),links=[...nav.querySelectorAll('a')],mobile=matchMedia('(max-width:580px)');
  const toggle=document.createElement('button'),panel=document.createElement('nav');
  toggle.type='button';toggle.className='mobile-nav-toggle';toggle.textContent='Menu';
  panel.id='mobile-site-navigation';panel.className='mobile-nav-panel';panel.hidden=true;panel.setAttribute('aria-label','Mobile navigation');
  toggle.setAttribute('aria-controls',panel.id);toggle.setAttribute('aria-expanded','false');
  nav.insertBefore(toggle,nav.querySelector('.language-toggle')||button);header.append(panel);header.classList.add('mobile-nav-ready');
  function closeMenu(restoreFocus=false){panel.hidden=true;toggle.setAttribute('aria-expanded','false');if(restoreFocus)toggle.focus();}
  function arrange(){closeMenu();for(const link of links){if(mobile.matches)panel.append(link);else nav.insertBefore(link,toggle);}}
  toggle.addEventListener('click',()=>{const open=panel.hidden;panel.hidden=!open;toggle.setAttribute('aria-expanded',String(open));});
  panel.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu();});
  document.addEventListener('click',e=>{if(!header.contains(e.target))closeMenu();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden){closeMenu(true);e.preventDefault();}});
  header.addEventListener('focusout',e=>{if(!header.contains(e.relatedTarget))closeMenu();});
  window.addEventListener('pageshow',()=>closeMenu());mobile.addEventListener('change',arrange);arrange();
 });
 document.addEventListener('click',e=>carry(e.target.closest('a[href]')),true);
 // Chromium ignores download attributes for file:// PDFs. Use an on-demand
 // local Blob for previews; hosted pages keep the normal PDF download link.
 let resumePayload;
 document.addEventListener('click',async e=>{
  const link=e.target.closest('a[data-resume-download]');
  if(location.protocol!=='file:'||!link||e.button!==0||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;
  e.preventDefault();
  try{
   if(!resumePayload)resumePayload=new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=new URL('resume-file.js',scriptURL).href;script.onload=resolve;script.onerror=reject;document.head.append(script);});
   await resumePayload;
   const url=URL.createObjectURL(window.portfolioResumeBlob),download=document.createElement('a');
   download.href=url;download.download=link.download;document.body.append(download);download.click();download.remove();
   setTimeout(()=>URL.revokeObjectURL(url),60000);
  }catch(error){resumePayload=null;console.warn('Local resume download unavailable',error);location.href=link.href;}
 },true);
 window.addEventListener('storage',e=>{if(e.key===key&&valid(e.newValue))apply(e.newValue,false);});
 window.addEventListener('pageshow',e=>{if(e.persisted){let choice;try{choice=localStorage.getItem(key);}catch{}if(valid(choice))apply(choice,false);}});
})();
