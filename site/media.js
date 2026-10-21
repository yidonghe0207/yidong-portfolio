/* Choose a smaller copy on phones, and attach video sources only when needed. */
(()=>{
 const mobile=matchMedia('(max-width: 700px), (pointer: coarse)');
 const variants=new Set([
  'verb-studies/final-cover.mp4','verb-studies/final-reel.mp4',
  'verb-studies/DRIFT_01_Water_Type.mp4','verb-studies/DRIFT_03_Universe.mp4',
  'verb-studies/SYNC_04_Halftone.mp4','verb-studies/TUNE_03_Sand_Morph.mp4',
  'verb-studies/TUNE_04_Retro_Universe.mp4',
  'fog-gravity/cover.mp4','fog-gravity/highlight.mp4','ferry/cover.mp4'
 ]);
 function source(url){
  if(!url||(!mobile.matches&&!navigator.connection?.saveData))return url;
  const u=new URL(url,location.href),key=u.pathname.split('/prototypes/assets/')[1];
  if(!variants.has(key))return url;
  u.pathname=u.pathname.replace(/\.mp4$/,'-mobile.mp4');return u.href;
 }
 function load(video){
  if(!video?.dataset.src)return;
  video.src=source(video.dataset.src);delete video.dataset.src;
 }
 window.PortfolioMedia={source,load};
})();
