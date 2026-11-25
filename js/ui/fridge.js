/* Zakładka "Lodówka?" z podzakładką spiżarni (przyprawy, oleje, octy, sypkie). FA.ui.fridge */
(function () {
  const FA = window.FA, u = FA.u, C = FA.config;
  FA.ui = FA.ui || {};
  let sub = 'fridge';

  function rowHtml(it) {
    const st = FA.expiry.status(it), lb = FA.expiry.label(it);
    return '<li class="row ' + st + '" data-id="' + it.id + '"><div class="nm"><b>' + u.esc(it.displayName || it.name) + '</b>' +
      (lb ? '<small class="badge ' + st + '">ważne: ' + lb + '</small>' : '') + '</div>' +
      '<div class="ctl"><input class="q" type="number" min="0" step="any" value="' + it.qty + '" aria-label="Ilość"><span class="un">' + it.unit + '</span>' +
      '<input class="d" type="date" value="' + (it.expiresAt || '') + '" title="Data ważności" aria-label="Data ważności">' +
      '<button class="x" title="Usuń" aria-label="Usuń">✕</button></div></li>';
  }

  FA.ui.fridge = {
    render(root) {
      const S = FA.store.state, w = document.createElement('div'); root.appendChild(w);
      const inZone = z => S.items.filter(i => i.zone === z);
      const items = inZone(sub), groups = {};
      items.forEach(i => { const c = i.category || 'inne'; (groups[c] = groups[c] || []).push(i); });
      const order = Object.keys(C.CAT_LABEL).filter(c => groups[c]);
      const body = order.length
        ? order.map(c => '<div class="cat">' + C.CAT_LABEL[c] + '</div><ul class="rows">' + groups[c].sort((a, b) => a.name.localeCompare(b.name, 'pl')).map(rowHtml).join('') + '</ul>').join('')
        : '<div class="empty">' + (sub === 'fridge' ? 'Lodówka jest pusta. Dodaj produkt powyżej albo zeskanuj paragon.' : 'Brak przypraw i zapasów. Dodaj je powyżej, np. olej, ocet, makaron, ryż.') + '</div>';
      w.innerHTML =
        '<div class="sub"><button data-sub="fridge" class="' + (sub === 'fridge' ? 'on' : '') + '">Lodówka (' + inZone('fridge').length + ')</button>' +
        '<button data-sub="pantry" class="' + (sub === 'pantry' ? 'on' : '') + '">Przyprawy, oleje, octy i zapasy (' + inZone('pantry').length + ')</button></div>' +
        '<form class="add"><input name="pname" list="prodlist" placeholder="Produkt, np. mleko" required autocomplete="off" aria-label="Nazwa produktu">' +
        '<input name="qty" type="number" min="0" step="any" value="1" aria-label="Ilość">' +
        '<select name="unit" aria-label="Jednostka">' + C.UNITS.map(x => '<option>' + x + '</option>').join('') + '</select>' +
        '<input name="exp" type="date" aria-label="Data ważności" title="Data ważności (opcjonalnie)">' +
        '<button class="btn">Dodaj</button></form>' +
        '<datalist id="prodlist">' + FA.catalog.list.map(p => '<option value="' + u.esc(p.name) + '">').join('') + '</datalist>' + body;

      const f = u.$('.add', w);
      f.elements.pname.onchange = () => { const p = FA.catalog.match(f.elements.pname.value); if (p) f.elements.unit.value = p.unit; };
      f.onsubmit = e => {
        e.preventDefault();
        const r = FA.catalog.resolve(f.elements.pname.value);
        FA.store.addItem({ name: r.name, qty: u.num(f.elements.qty.value) || 1, unit: f.elements.unit.value, zone: sub, category: r.cat, expiresAt: f.elements.exp.value || null, source: 'manual' });
      };
      w.addEventListener('click', e => {
        const b = e.target.closest('[data-sub]'); if (b) { sub = b.dataset.sub; return FA.app.render(); }
        const x = e.target.closest('.x'); if (x) FA.store.removeItem(x.closest('.row').dataset.id);
      });
      w.addEventListener('change', e => {
        const row = e.target.closest('.row'); if (!row) return;
        if (e.target.classList.contains('q')) FA.store.updateItem(row.dataset.id, { qty: u.num(e.target.value) });
        if (e.target.classList.contains('d')) FA.store.updateItem(row.dataset.id, { expiresAt: e.target.value || null });
      });
    }
  };
})();
