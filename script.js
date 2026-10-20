(() => {
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ----- reveal on scroll ----- */
  const io = 'IntersectionObserver' in window
    ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { threshold: .1, rootMargin: '0px 0px -5% 0px' })
    : null;
  const observe = root => $$('[data-reveal]:not(.is-in)', root).forEach(el => io ? io.observe(el) : el.classList.add('is-in'));

  const nav = document.getElementById('nav');

  /* ----- plan switch (nav, cards, section header) ----- */
  const panels = { a: document.getElementById('panel-a'), b: document.getElementById('panel-b') };
  const planesEl = document.getElementById('planes');
  const setPlan = (plan, { scroll = false, push = true } = {}) => {
    if (!panels[plan]) return;
    document.body.dataset.plan = plan;
    Object.entries(panels).forEach(([k, el]) => { el.hidden = k !== plan; });
    $$('.seg [data-set-plan]').forEach(b => {
      const on = b.dataset.setPlan === plan;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-selected', on);
    });
    if (push) history.replaceState(null, '', '#plan-' + plan);
    if (scroll) planesEl.scrollIntoView();
  };
  $$('[data-set-plan]').forEach(b => b.addEventListener('click', () => {
    setPlan(b.dataset.setPlan, { scroll: !b.closest('#planes') });
  }));

  /* ----- nav scrollspy (position based; never moves the page) ----- */
  const links = $$('.nav-links a');
  const navLinks = document.getElementById('nav-links');
  const spyTargets = links.map(a => document.getElementById(a.dataset.spy));
  let current = null, ticking = false;
  const spy = () => {
    ticking = false;
    const line = nav.offsetHeight + window.innerHeight * 0.25;
    let idx = -1;
    spyTargets.forEach((t, i) => { if (t && t.getBoundingClientRect().top <= line) idx = i; });
    if (idx === current) return;
    current = idx;
    links.forEach((a, i) => a.classList.toggle('is-on', i === idx));
    if (idx >= 0) { const a = links[idx]; navLinks.scrollLeft = a.offsetLeft - (navLinks.clientWidth - a.offsetWidth) / 2; }
  };
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(spy); } }, { passive: true });
  window.addEventListener('resize', spy);

  /* ----- conditions toggle ----- */
  const toggle = document.getElementById('toggle-conds');
  const conds = $$('#conds .cond');
  const sync = () => { toggle.textContent = conds.every(c => c.open) ? 'Cerrar todo' : 'Expandir todo'; };
  conds.forEach(c => c.addEventListener('toggle', sync));
  toggle.addEventListener('click', () => { const open = !conds.every(c => c.open); conds.forEach(c => { c.open = open; }); sync(); });

  /* ----- validity countdown (14 días corridos desde 20.10.2026) ----- */
  const left = Math.ceil((new Date(2026, 10, 3, 23, 59) - new Date()) / 86400000);
  const days = Math.min(14, Math.max(0, left));
  document.getElementById('days').textContent = days;
  document.getElementById('days-label').textContent = days === 0
    ? 'Propuesta vencida — consultar revisión de valores'
    : (days === 14 ? 'días corridos desde la fecha de emisión' : (days === 1 ? 'día de validez restante' : 'días de validez restantes'));

  /* ----- init ----- */
  const hash = location.hash;
  setPlan(hash === '#plan-b' ? 'b' : 'a', { push: false });
  observe();
  spy();
  if (hash === '#plan-b' || hash === '#plan-a') requestAnimationFrame(() => planesEl.scrollIntoView());
})();
