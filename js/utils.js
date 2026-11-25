/* Narzędzia wspólne dla wszystkich modułów: FA.u */
(function () {
  const FA = window.FA, u = (FA.u = {});
  u.$ = (s, r = document) => r.querySelector(s);
  u.$$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  u.esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  u.uuid = () => (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : 'id' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  // normalizacja: małe litery, bez polskich znaków i interpunkcji
  u.norm = s => String(s || '').toLowerCase().replace(/ł/g, 'l').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
  u.num = s => { const n = parseFloat(String(s).replace(',', '.')); return isNaN(n) ? 0 : n; };
  u.round = n => Math.round(n * 1000) / 1000;
  u.iso = d => { const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000); return z.toISOString().slice(0, 10); };
  u.today = () => u.iso(new Date());
  u.addDays = n => { const d = new Date(); d.setDate(d.getDate() + n); return u.iso(d); };
  u.daysUntil = iso => {
    if (!iso) return null;
    return Math.round((new Date(iso + 'T00:00:00') - new Date(u.today() + 'T00:00:00')) / 864e5);
  };
  u.lev = (a, b) => {
    const m = a.length, n = b.length; if (!m) return n; if (!n) return m;
    let p = Array.from({ length: n + 1 }, (_, j) => j);
    for (let i = 1; i <= m; i++) {
      const c = [i];
      for (let j = 1; j <= n; j++) c[j] = Math.min(p[j] + 1, c[j - 1] + 1, p[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      p = c;
    }
    return p[n];
  };
  u.sim = (a, b) => { const m = Math.max(a.length, b.length); return m ? 1 - u.lev(a, b) / m : 1; };
  // konwersja jednostek; zwraca null gdy się nie da
  u.convert = (q, f, t) => {
    if (f === t) return q;
    const m = { 'g>kg': 0.001, 'kg>g': 1000, 'ml>l': 0.001, 'l>ml': 1000 }[f + '>' + t];
    return m ? q * m : null;
  };
  u.toast = msg => {
    const t = u.$('#toast'); t.textContent = msg; t.hidden = false;
    clearTimeout(u._tt); u._tt = setTimeout(() => (t.hidden = true), 2800);
  };
  u.modal = (html, o = {}) => {
    const m = u.$('#modal');
    m.innerHTML = '<div class="sheet">' + (o.lock ? '' : '<button class="close" data-close aria-label="Zamknij">✕</button>') + html + '</div>';
    m.hidden = false; document.body.classList.add('noscroll');
    m.onclick = e => { if (!o.lock && (e.target === m || e.target.closest('[data-close]'))) u.closeModal(); };
    return u.$('.sheet', m);
  };
  u.closeModal = () => { const m = u.$('#modal'); m.hidden = true; m.innerHTML = ''; document.body.classList.remove('noscroll'); };
  u.download = (name, text) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' })); a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
})();
