/* Zakładka "Przepisy": wyszukiwarka, popularne, dopasowanie do lodówki, ulubione. FA.ui.recipes */
(function () {
  const FA = window.FA, u = FA.u;
  FA.ui = FA.ui || {};
  const st = { q: '', chip: 'all', ext: [], extMsg: '' };
  const CHIPS = [['all', 'Wszystkie'], ['ready', 'Mogę ugotować'], ['expiring', 'Z kończących się'], ['popular', 'Popularne'], ['fav', 'Ulubione']];

  function cardHtml(ev, fav) {
    const r = ev.recipe;
    return '<article class="card" data-id="' + r.id + '"><h3>' + u.esc(r.title) + '</h3>' +
      '<button class="fav" aria-label="Ulubione" data-fav>' + (fav ? '♥' : '♡') + '</button>' +
      '<p class="meta">' + r.time + ' min · ' + r.servings + ' porcji' + (r.tags.length ? ' · ' + r.tags.join(', ') : '') + '</p>' +
      '<div class="bar"><i style="width:' + Math.round(ev.coverage * 100) + '%"></i></div>' +
      '<p class="meta">' + (ev.req ? 'Masz ' + ev.got + ' z ' + ev.req + ' składników' : 'Bez składników z zakupów') + (ev.missing.length ? '. Brakuje: ' + u.esc(ev.missing.join(', ')) : (ev.req ? '. Masz wszystko' : '')) + '</p>' +
      (ev.exp.length ? '<p class="warn">Zużyje to, co zaraz się zepsuje: ' + u.esc(ev.exp.map(x => x.name).join(', ')) + '</p>' : '') + '</article>';
  }
  function extCard(r) {
    return '<article class="card" data-ext="' + r.id + '"><h3>' + u.esc(r.title) + '</h3><p class="meta">TheMealDB · ' + r.ingredients.length + ' składników (po angielsku, dieta niesprawdzona)</p></article>';
  }
  function filtered() {
    const S = FA.store.state;
    let list = FA.matcher.rank(FA.allRecipes(), S.items, S.profile);
    const q = u.norm(st.q);
    if (q) list = list.filter(e => { const t = u.norm(e.recipe.title + ' ' + e.recipe.ingredients.map(i => i.name).join(' ')); return q.split(' ').every(x => t.includes(x)); });
    if (st.chip === 'ready') list = list.filter(e => !e.missing.length);
    if (st.chip === 'expiring') list = list.filter(e => e.exp.length).sort((a, b) => b.exp.length - a.exp.length);
    if (st.chip === 'popular') list = list.filter(e => e.recipe.popular);
    if (st.chip === 'fav') list = list.filter(e => S.favorites.includes(e.recipe.id));
    return list;
  }
  function detail(r) {
    const S = FA.store.state, ev = FA.matcher.evaluate(r, S.items), ext = r.source !== 'seed';
    const ing = r.ingredients.map(i => {
      const k = FA.catalog.canonical(i.name), has = !ext && ev.have.includes(i.name), basic = FA.config.BASICS.map(u.norm).includes(k);
      const amount = ext ? i.measure : (i.qty ? i.qty + ' ' + i.unit : '');
      const cls = ext ? '' : (has || basic ? 'y' : (i.optional ? 'o' : 'n'));
      return '<li class="' + cls + '">' + (ext ? '• ' : (has || basic ? '✓ ' : (i.optional ? '○ ' : '✗ '))) + u.esc(i.name) + (amount ? ' – ' + u.esc(amount) : '') + (i.optional ? ' (opcjonalnie)' : '') + '</li>';
    }).join('');
    const m = u.modal((r.image ? '<img src="' + u.esc(r.image) + '" alt="" style="width:100%;border-radius:10px;max-height:220px;object-fit:cover">' : '') +
      '<h2>' + u.esc(r.title) + '</h2><p class="meta">' + (r.time ? r.time + ' min · ' + r.servings + ' porcji' : '') + '</p>' +
      '<h3>Składniki</h3><ul class="ing">' + ing + '</ul><h3>Przygotowanie</h3><ol>' + r.steps.map(s => '<li>' + u.esc(s) + '</li>').join('') + '</ol>' +
      '<div class="btns"><button class="btn ghost" id="mfav">' + (S.favorites.includes(r.id) ? '♥ W ulubionych' : '♡ Dodaj do ulubionych') + '</button>' +
      (ext ? '' : '<button class="btn" id="mdone">Ugotowane: odejmij produkty</button>') + '</div>');
    u.$('#mfav', m).onclick = async () => { const on = await FA.store.toggleFav(r.id); u.$('#mfav', m).textContent = on ? '♥ W ulubionych' : '♡ Dodaj do ulubionych'; };
    const d = u.$('#mdone', m);
    if (d) d.onclick = async () => { const n = await FA.store.consume(r); u.closeModal(); u.toast(n ? 'Odjęto ' + n + ' produktów z zapasów' : 'Nic nie odjęto (brak pasujących produktów)'); };
  }

  FA.ui.recipes = {
    setChip(c) { st.chip = c; },
    render(root) {
      const S = FA.store.state, w = document.createElement('div'); root.appendChild(w);
      w.innerHTML = '<form class="search"><input type="search" id="q" placeholder="Szukaj przepisu lub składnika…" value="' + u.esc(st.q) + '" aria-label="Szukaj"><button class="btn">Szukaj</button></form>' +
        '<div class="chips" id="chips">' + CHIPS.map(c => '<label class="chip"><input type="radio" name="chip" value="' + c[0] + '"' + (st.chip === c[0] ? ' checked' : '') + '><span>' + c[1] + '</span></label>').join('') + '</div>' +
        '<p class="note">Filtruję według diety (' + u.esc(FA.diet.label(S.profile)) + ') i Twojego sprzętu. Zmienisz to w Ustawieniach.</p><div class="grid" id="list"></div><div id="ext"></div>';
      const list = u.$('#list', w);
      const draw = () => {
        const l = filtered();
        list.innerHTML = l.length ? l.map(e => cardHtml(e, S.favorites.includes(e.recipe.id))).join('') : '<div class="empty">Brak przepisów dla tych filtrów. Dodaj produkty do lodówki albo zmień filtr.</div>';
        u.$('#ext', w).innerHTML = (st.ext.length ? '<h3>Z TheMealDB</h3><div class="grid">' + st.ext.map(extCard).join('') + '</div>' : '') + (st.extMsg ? '<p class="note">' + u.esc(st.extMsg) + '</p>' : '');
      };
      draw();
      u.$('#q', w).oninput = e => { st.q = e.target.value; draw(); };
      u.$('.search', w).onsubmit = async e => {
        e.preventDefault(); st.q = u.$('#q', w).value; st.ext = []; st.extMsg = '';
        if (S.settings.useApi && st.q.trim().length >= 3) {
          try { st.ext = await FA.api.search(st.q.trim()); st.extMsg = st.ext.length ? '' : 'TheMealDB nie ma wyników (szuka po angielsku).'; } catch (err) { st.extMsg = 'Nie udało się pobrać przepisów z internetu.'; }
        }
        draw();
      };
      u.$('#chips', w).onchange = e => { st.chip = e.target.value; draw(); };
      w.addEventListener('click', async e => {
        const f = e.target.closest('[data-fav]');
        if (f) { e.stopPropagation(); const id = f.closest('.card').dataset.id; const on = await FA.store.toggleFav(id); return; }
        const c = e.target.closest('.card'); if (!c) return;
        const r = c.dataset.ext ? st.ext.find(x => x.id === c.dataset.ext) : FA.allRecipes().find(x => x.id === c.dataset.id);
        if (r) detail(r);
      });
    }
  };
})();
