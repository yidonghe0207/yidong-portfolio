(() => {
  const earthURL = new URL('assets/earth.png', document.currentScript.src).href;
  function mount(stage, index) {
    const card = stage.closest('.work-tile');
    const linkedCard = card?.matches('a[href]');
    if (!stage.querySelector('.world-logo')) {
      const mask = `world-cover-cutout-${index}`;
      stage.innerHTML = `
        <img class="world-earth" src="${earthURL}" alt="" loading="lazy" draggable="false">
        <${card ? 'span class="world-logo" aria-hidden="true"' : 'button class="world-logo" type="button"'}>
          <svg viewBox="22 22 156 156" focusable="false">
            <defs><mask id="${mask}" maskUnits="userSpaceOnUse" x="22" y="22" width="156" height="156" style="mask-type:luminance">
              <circle cx="100" cy="100" r="78" fill="white"/>
              <path fill="black" d="M62.5 62.5H100.5V74H62.5Z M62.5 78.5C83.6 79.2 100.5 91.4 100.5 107.3C100.5 123.5 84.7 135.5 62.5 136.2V124.7C77 124.1 86.3 117.1 86.3 107.3C86.3 97.8 77.1 90.3 62.5 89.6Z M124.5 62.5H137.5V136.2H124.5Z"/>
            </mask></defs>
            <circle class="world-disc" cx="100" cy="100" r="78" mask="url(#${mask})"/>
          </svg>
        </${card ? 'span' : 'button'}>`;
    }
    const trigger = card || stage.querySelector('.world-logo');
    const status = stage.querySelector('[role="status"]');
    // Published cards remain native links; standalone artwork can hold a view.
    if (card && !linkedCard) {
      trigger.setAttribute('role', 'button');
      trigger.tabIndex = 0;
    }
    let hovered = false;
    let focused = false;
    let pinned = false;
    const render = () => {
      stage.dataset.active = String(hovered || focused || pinned);
      if (linkedCard) return;
      trigger.setAttribute('aria-pressed', String(pinned));
      trigger.setAttribute('aria-label', `51WORLD — ${pinned ? 'release' : 'hold'} the Earth view`);
    };
    trigger.addEventListener('pointerenter', event => {
      if (event.pointerType === 'touch') return;
      hovered = true;
      render();
    });
    trigger.addEventListener('pointerleave', () => { hovered = false; render(); });
    trigger.addEventListener('pointercancel', () => { hovered = false; render(); });
    trigger.addEventListener('focus', () => {
      focused = trigger.matches(':focus-visible');
      render();
    });
    trigger.addEventListener('blur', () => { focused = false; render(); });
    trigger.addEventListener('click', () => {
      if (linkedCard) return;
      pinned = !pinned;
      if (status) status.textContent = pinned ? 'Earth view held.' : 'Earth view released.';
      render();
    });
    if (card && !linkedCard) trigger.addEventListener('keydown', event => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      if (!event.repeat) trigger.click();
    });
    document.addEventListener('keydown', event => {
      if (event.key !== 'Escape') return;
      hovered = false;
      focused = false;
      pinned = false;
      if (status) status.textContent = 'Earth view reset.';
      render();
    });
    window.addEventListener('blur', () => { hovered = false; focused = false; render(); });
    render();
  }
  document.querySelectorAll('.world-stage').forEach(mount);
})();
