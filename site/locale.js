/* Static bilingual pages; no network geolocation or translation service. */
(()=>{
 'use strict';
 const locale=document.documentElement.lang.startsWith('zh')?'zh':'en';
 const scriptRoot=new URL('.',document.currentScript.src);
 const explicit=/\/(en|zh)(?:\/|$)/.test(location.pathname);
 const prefix=explicit?new URL(locale+'/',scriptRoot).pathname:scriptRoot.pathname;
 const dictionary=window.PORTFOLIO_ZH||{};
 const normalize=s=>String(s).replace(/\s+/g,' ').trim();
 function t(s){
  if(locale!=='zh'||!s)return s;
  const key=normalize(s);if(Object.hasOwn(dictionary,key))return dictionary[key];
  if(/^\d+ studies$/.test(key))return key.split(' ')[0]+' 项实验';
  for(const [en,zh] of [['Explore ','查看 '],['Watch ','观看 '],['Try ','体验 '],['Enlarge ','放大 '],['Open in Figma: ','在 Figma 中打开：']])if(key.startsWith(en))return zh+t(key.slice(en.length));
  if(key.endsWith(' — progress board'))return key.slice(0,-17)+' — 过程展板';
  if(key.endsWith(' progress board'))return key.slice(0,-15)+' 过程展板';
  if(key.endsWith(' progress board: word research, visual references and interaction sketches'))return key.split(' progress board:')[0]+' 过程展板：词语研究、视觉参考与交互草图';
  if(key.endsWith(' interactive prototype'))return t(key.slice(0,-22))+' 交互原型';
  if(key.endsWith(', coming soon'))return t(key.slice(0,-13))+'，即将上线';
  if(key.startsWith('Play ')&&key.endsWith(' (opens in a new tab)'))return '体验 '+t(key.slice(5,-21))+'（在新标签页打开）';
  if(key.endsWith(' source on GitHub (opens in a new tab)'))return key.slice(0,-38)+' 的 GitHub 源码（在新标签页打开）';
  return s;
 }
 window.PortfolioLocale={locale,prefix,t,asset:p=>new URL(p,scriptRoot).href};
 function remember(next){
  try{localStorage.setItem('yidong-language',next);}catch{}
  document.cookie='yidong-language='+next+'; Path=/; Max-Age=31536000; SameSite=Lax'+(location.protocol==='https:'?'; Secure':'');
 }
 document.addEventListener('DOMContentLoaded',()=>{
  const nav=document.querySelector('.site-header>nav');if(!nav)return;
  const button=document.createElement('button');button.type='button';button.className='language-toggle';
  button.textContent=locale==='zh'?'EN':'中文';button.lang=locale==='zh'?'en':'zh-CN';
  button.title=button.getAttribute('aria-label')|| (locale==='zh'?'Switch to English':'切换为中文');button.setAttribute('aria-label',button.title);
  button.addEventListener('click',()=>{
   const next=locale==='zh'?'en':'zh';remember(next);
   const url=new URL(location.href),relative=url.pathname.slice(scriptRoot.pathname.length).replace(/^(en|zh)(?:\/|$)/,'');
   const known=/^(?:index\.html|about\.html|404\.html|work\/(?:bytedance|51world|fog|verbs|verbs-tune|ferry|tuneful)\.html)?$/.test(relative);
   url.pathname=scriptRoot.pathname+next+'/'+(known?(relative||'index.html'):'404.html');
   url.searchParams.delete('lang');location.assign(url.href);
  });
  nav.insertBefore(button,nav.querySelector('.theme-toggle'));
  if(locale==='zh')document.querySelector('[data-resume-download]')?.setAttribute('title','下载简历（英文 PDF）');
  // Only translate known portfolio UI strings. Artwork and embedded prototypes stay intact.
  if(locale==='zh'){
   const attributes=['aria-label','title','alt'];
   function text(node){const next=t(node.data),value=node.data.replace(/\S[\s\S]*\S|\S/,next);if(value!==node.data)node.data=value;}
   function translate(node){
    if(node.nodeType===3){if(!node.parentElement?.closest('script,style,svg,iframe,[translate="no"]'))text(node);return;}
    if(node.nodeType!==1||node.matches('script,style,svg,iframe,[translate="no"]'))return;
    for(const attr of attributes)if(node.hasAttribute(attr)){const old=node.getAttribute(attr),next=t(old);if(next!==old)node.setAttribute(attr,next);}
    node.childNodes.forEach(translate);
   }
   translate(document.body);
   new MutationObserver(records=>{for(const r of records){if(r.type==='childList')r.addedNodes.forEach(translate);else if(r.type==='characterData')translate(r.target);else translate(r.target);}}).observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:attributes});
  }
 });
})();
