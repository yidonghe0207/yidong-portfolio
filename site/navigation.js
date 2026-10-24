/* Cross-document mist transitions also work when this prototype is opened as local files. */
(()=>{
  'use strict';
  const root=window.PortfolioLocale?.prefix||new URL(document.currentScript.src).pathname.replace(/navigation\.js$/,''),key='yidong-floating-v2:'+root;
  const isHome=pathname=>[root,root.slice(0,-1),root+'index.html'].includes(pathname);
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const store={get(name){try{return JSON.parse(sessionStorage.getItem(key+name));}catch{return null;}},set(name,value){try{sessionStorage.setItem(key+name,JSON.stringify(value));}catch{}},remove(name){try{sessionStorage.removeItem(key+name);}catch{}}};
  let pending=store.get(':journey'),busy=false,overlay,departureTimer,watchdog;
  const back=performance.getEntriesByType('navigation')[0]?.type==='back_forward';
  const arrival=!!pending&&pending.path===location.pathname&&Date.now()-pending.time<10000;
  if(arrival)store.remove(':journey');else pending=null;
  if((arrival||back)&&!reduced.matches){document.documentElement.classList.add('nav-arriving');watchdog=setTimeout(()=>reveal(),1600);}
  if(isHome(location.pathname))history.scrollRestoration='manual';
  function mist(){if(!overlay){overlay=document.createElement('div');overlay.className='page-mist';overlay.setAttribute('aria-hidden','true');document.body.append(overlay);}return overlay;}
  function clear(){clearTimeout(departureTimer);clearTimeout(watchdog);busy=false;document.documentElement.classList.remove('nav-leaving','nav-arriving');document.querySelectorAll('.is-pressed').forEach(e=>e.classList.remove('is-pressed'));}
  function reveal(){clear();if(reduced.matches){overlay?.remove();overlay=null;return;}const cover=mist();cover.classList.add('is-active');document.documentElement.classList.add('nav-revealing');requestAnimationFrame(()=>requestAnimationFrame(()=>{cover.classList.remove('is-active');setTimeout(()=>document.documentElement.classList.remove('nav-revealing'),360);}));}
  window.PortfolioNav={store,key,returning:(arrival&&pending?.home)||back,ready(){if(arrival||back)reveal();},get busy(){return busy;}};
  document.addEventListener('click',event=>{
    const a=event.target.closest('a[href]');if(!a||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||a.hasAttribute('download')||(a.target&&a.target!=='_self'))return;
    const url=new URL(a.href,location.href);if(url.origin!==location.origin||!url.pathname.startsWith(root)||!url.pathname.endsWith('.html')||url.pathname===location.pathname)return;
    event.preventDefault();if(busy)return;
    const home=isHome(url.pathname);
    window.dispatchEvent(new CustomEvent('portfolio:depart',{detail:{link:a}}));
    const saved=store.get(':home');if(home&&saved?.url){const source=new URL(saved.url,location.href);if(isHome(source.pathname))url.hash=source.hash;}
    store.set(':journey',{path:url.pathname,time:Date.now(),home});busy=true;
    if(reduced.matches){location.assign(url.href);return;}
    a.classList.add('is-pressed');mouseOrigin(event);document.documentElement.classList.add('nav-leaving');requestAnimationFrame(()=>mist().classList.add('is-active'));
    departureTimer=setTimeout(()=>location.assign(url.href),170);
  });
  function mouseOrigin(event){const cover=mist();cover.style.setProperty('--mist-x',event.clientX?event.clientX/innerWidth*100+'%':'50%');cover.style.setProperty('--mist-y',event.clientY?event.clientY/innerHeight*100+'%':'48%');}
  // A back/forward-cache entry may contain the outgoing overlay. Always release it on restore.
  window.addEventListener('pageshow',event=>{if(event.persisted)reveal();});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&!busy)document.documentElement.classList.remove('nav-leaving');});
})();
