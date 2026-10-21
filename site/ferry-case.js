(()=>{
 const film=document.querySelector('#ferry-film'),button=document.querySelector('.ferry-play');
 button.addEventListener('click',()=>{film.play().catch(()=>{button.hidden=false;});});
 film.addEventListener('play',()=>{button.hidden=true;});
 film.addEventListener('ended',()=>{button.hidden=false;});
 // The complete film is viewer-initiated and retains sound. Never auto-resume it.
 new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)film.pause();},{threshold:0}).observe(film);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)film.pause();});
 new MutationObserver(()=>{if(document.querySelector('dialog[open]'))film.pause();}).observe(document.querySelector('.language-dialog'),{attributes:true,attributeFilter:['open']});
})();
