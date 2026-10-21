/* Art direction uses the original project outputs. Cropping stays in CSS,
   leaving every source image and live experiment intact. */
window.projectCover=function(p,asset){
  if(p.id==='tuneful')return window.TunefulVisuals.cover((document.body.classList.contains('project-page')?'../':'')+'assets/tuneful/');
  if(p.id==='bytedance')return '<div class="cover cover-bytedance bytedance-stage"></div>';
  if(p.id==='51world')return '<div class="cover cover-51world world-stage" data-active="false"></div>';
  if(p.cover)return `<div class="cover cover-bytedance"><img src="${document.body.classList.contains('project-page')?'../':''}${p.cover}" alt="ByteDance logo in softly glowing blue, lavender and teal on black" loading="lazy"></div>`;
  if(p.id==='fog')return `<div class="cover cover-fog-reel"><video muted loop playsinline preload="metadata" poster="${asset('fog-gravity/highlight.jpg')}" aria-label="The Fog and The Gravity highlight reel"><source src="${asset('fog-gravity/cover.mp4')}" type="video/mp4"></video></div>`;
  if(p.id==='ferry')return `<div class="cover cover-ferry"><video muted loop playsinline preload="metadata" poster="${asset('ferry/highlight.jpg')}" aria-label="The Ferry highlight reel"><source src="${asset('ferry/cover.mp4')}" type="video/mp4"></video><div class="film-shade"></div></div>`;
  if(p.id==='verbs')return `<div class="cover cover-verbs-reel"><video muted loop playsinline preload="metadata" poster="${asset('verb-studies/final-cover.jpg')}" aria-label="Verb Studies final reel"><source src="${asset('verb-studies/final-cover.mp4')}" type="video/mp4"></video></div>`;
  return null;
};
