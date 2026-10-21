(()=>{
 'use strict';
 const cases={
  intent:{evidence:'The revised plan no longer contains the original presenter constraint.',action:'Inspect how intent is retained across turns before blaming the video model.'},
  generation:{evidence:'The generation instructions retain the presenter constraint, but the returned clip changes the character.',action:'Investigate generation and reference conditioning; a planning change alone may not address this failure.'},
  assembly:{evidence:'The generated clips retain the correct presenter, but the assembled video uses an older, mismatched clip.',action:'Inspect asset selection and post-processing before changing the model or the creative brief.'}
 };
 const buttons=[...document.querySelectorAll('[data-scenario]')];
 for(const button of buttons)button.addEventListener('click',()=>{
  const key=button.dataset.scenario,entry=cases[key];
  buttons.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  document.querySelectorAll('[data-stage]').forEach(el=>{const active=el.dataset.stage===key;el.classList.toggle('is-suspect',active);if(active)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');});
  document.querySelector('[data-trace-evidence]').textContent=entry.evidence;
  document.querySelector('[data-trace-action]').textContent=entry.action;
 });
 document.querySelector('[data-stage="intent"]').setAttribute('aria-current','step');
})();
