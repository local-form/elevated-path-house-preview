/* Elevated Path House preview: menu, scroll reveals, the availability form (preview only, nothing is sent). */
(() => {
  const html = document.documentElement, btn = document.querySelector('.menu-btn');
  if (btn) {
    const set = on => { html.classList.toggle('nav-open', on); btn.setAttribute('aria-expanded', on); };
    btn.addEventListener('click', () => set(!html.classList.contains('nav-open')));
    document.querySelectorAll('.nav a').forEach(a => a.addEventListener('click', () => set(false)));
    addEventListener('keydown', e => { if (e.key === 'Escape') set(false); });
    matchMedia('(min-width: 1061px)').addEventListener('change', e => e.matches && set(false));
  }
})();

(() => {
  const els = [...document.querySelectorAll('[data-reveal]')];
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('is-visible')); return; }
  const n = new Map();   // stagger siblings by .08s
  els.forEach(e => { const p = e.parentElement, i = n.get(p) || 0; e.style.setProperty('--d', i * .08 + 's'); n.set(p, i + 1); });
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); } }), { threshold: .01, rootMargin: '0px 0px -8% 0px' });
  els.forEach(e => io.observe(e));
  setTimeout(() => els.forEach(e => { if (e.getBoundingClientRect().top < innerHeight) e.classList.add('is-visible'); }), 1500);   // failsafe
})();

(() => {
  const form = document.getElementById('apply'); if (!form) return;
  const pre = new URLSearchParams(location.search).get('who');
  [...form.querySelectorAll('[name=who]')].forEach(r => { if (r.value === pre) r.checked = true; });
  const name = form.elements.namedItem('name'), phone = form.elements.namedItem('phone'), move = form.elements.namedItem('move');
  const today = () => new Intl.DateTimeFormat('en-CA', {timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  move.min = today();
  const error = (field, message) => { field.classList.toggle('bad', !!message); field.setAttribute('aria-invalid', String(!!message)); document.getElementById(field.name + '-error').textContent = message; return !!message; };
  [name,phone,move].forEach(field => field.addEventListener('input', () => error(field, '')));
  form.addEventListener('submit', e => {
    e.preventDefault();
    const badName = error(name, name.value.trim() ? '' : 'Enter your name.');
    const badPhone = error(phone, phone.value.replace(/\D/g, '').length >= 10 ? '' : 'Enter a phone number with at least 10 digits.');
    const badMove = error(move, move.value && move.value < today() ? 'Choose today or a future date.' : '');
    if (badName || badPhone || badMove) { (badName ? name : badPhone ? phone : move).focus(); return; }
    const who = form.querySelector('[name=who]:checked').value;
    const roles = {self:'for yourself',family:'for a family member',partner:'as a referral partner'};
    const date = move.value ? new Intl.DateTimeFormat('en-US',{month:'long',day:'numeric',timeZone:'UTC'}).format(new Date(move.value + 'T12:00:00Z')) : '';
    const done = document.getElementById('done');
    const title = document.createElement('b');
    title.textContent = 'Thanks, ' + name.value.trim().split(/\s+/)[0] + '. Your example inquiry is ready.';
    const detail = document.createElement('p');
    detail.textContent = 'Reaching out ' + roles[who] + (date ? ', with a preferred move-in date of ' + date : '') + '. Preview only: nothing was sent or stored. On the real site, Jon would call or text you back.';
    done.replaceChildren(title, detail); done.hidden = false; done.focus();
    done.scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block:'center'});
  });
})();
