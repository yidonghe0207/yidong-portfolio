// Preserve the artwork while allowing Escape to return to the portfolio.
document.addEventListener('keydown',event=>{
 if(event.key==='Escape'&&window.parent!==window){
  event.preventDefault();window.parent.postMessage('portfolio:close-study','*');
 }
});
