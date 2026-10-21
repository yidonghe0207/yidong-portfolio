/* Real app screenshots in lightweight browser and phone mockups. */
(function(root){
  function phone(base,file,alt,eager=false){return `<div class="tn-phone"><span class="tn-speaker" aria-hidden="true"></span><div class="tn-screen"><img src="${base}${file}" alt="${alt}" width="780" height="1688" loading="${eager?'eager':'lazy'}" decoding="async"></div><span class="tn-home-line" aria-hidden="true"></span></div>`;}
  function cover(base,eager=false){return `<div class="tn-cover"><div class="tn-device-pair"><div class="tn-browser"><div class="tn-browser-bar" aria-hidden="true"><i></i><i></i><i></i><span>tuneful</span></div><div class="tn-browser-screen"><img src="${base}desktop-home-light.png" alt="Tuneful in a desktop browser: music practice games for listening, singing and reading." width="2560" height="2854" loading="${eager?'eager':'lazy'}" decoding="async"></div></div>${phone(base,'phone-echo-garden.png','Echo Garden on a phone: repeat a melody by tapping colourful flowers.',eager)}</div></div>`;}
  const api={phone,cover};if(typeof module==='object'&&module.exports)module.exports=api;else root.TunefulVisuals=api;
})(typeof window==='object'?window:globalThis);
