/* Zakładka "Skan paragonu": zdjęcie -> OCR -> lista do zatwierdzenia -> lodówka. FA.ui.scan */
(function () {
  const FA = window.FA, u = FA.u, C = FA.config;
  FA.ui = FA.ui || {};
  const st = { text: '', show: false, busy: false, store: '', drafts: [], info: '' };

  function parseText() {
    const res = FA.receipt.parse(st.text);
    st.store = res.store;
    st.drafts = res.items.map(d => Object.assign(d, { checked: d.matched, expiresAt: d.zone === 'fridge' && C.SHELF[d.category] ? u.addDays(C.SHELF[d.category]) : '' }));
    st.info = st.drafts.length ? '' : 'Nie rozpoznano żadnych produktów. Popraw tekst powyżej albo dodaj produkty ręcznie w zakładce Lodówka.';
  }
  function drowHtml(d, i) {
    return '<div class="drow ' + (d.matched ? '' : 'low') + '" data-i="' + i + '"><input type="checkbox" class="ck" ' + (d.checked ? 'checked' : '') + ' aria-label="Dodaj">' +
      '<input class="nmi" list="prodlist" value="' + u.esc(d.name) + '" aria-label="Nazwa" title="' + u.esc(d.raw) + '">' +
      '<input type="number" class="qt" min="0" step="any" value="' + d.qty + '" aria-label="Ilość">' +
      '<select class="un">' + C.UNITS.map(x => '<option' + (x === d.unit ? ' selected' : '') + '>' + x + '</option>').join('') + '</select>' +
      '<select class="zn"><option value="fridge"' + (d.zone === 'fridge' ? ' selected' : '') + '>lodówka</option><option value="pantry"' + (d.zone === 'pantry' ? ' selected' : '') + '>spiżarnia</option></select>' +
      '<input type="date" class="ex" value="' + (d.expiresAt || '') + '" aria-label="Data ważności" title="Orientacyjny termin – popraw według opakowania">' +
      (d.matched ? '' : '<small class="badge soon" style="grid-column:2/-1">Nie rozpoznano – sprawdź nazwę</small>') + '</div>';
  }

  FA.ui.scan = {
    render(root) {
      const w = document.createElement('div'); root.appendChild(w);
      const rows = st.drafts.length
        ? '<h3>Rozpoznane produkty' + (st.store ? ' (' + st.store + ')' : '') + '</h3><p class="note">Popraw nazwy, ilości i terminy, odznacz to, czego nie chcesz dodawać.</p>' +
          '<datalist id="prodlist">' + FA.catalog.list.map(p => '<option value="' + u.esc(p.name) + '">').join('') + '</datalist>' +
          st.drafts.map(drowHtml).join('') + '<div class="btns"><button class="btn" id="add">Dodaj zaznaczone do lodówki</button></div>'
        : (st.info ? '<div class="empty">' + u.esc(st.info) + '</div>' : '');
      w.innerHTML =
        '<h2>Skan paragonu</h2><p class="note">Obsługiwane: Biedronka, Lidl, Kaufland, Auchan. Zdjęcie robione z góry, w dobrym świetle, z rozprostowanym paragonem. Rozpoznawanie działa w przeglądarce, a zdjęcie nigdzie nie jest wysyłane.</p>' +
        '<div class="btns"><label class="btn">Wybierz lub zrób zdjęcie<input type="file" id="file" accept="image/*" hidden></label>' +
        '<button class="btn ghost" id="paste">Wklej tekst ręcznie</button></div>' +
        (st.busy ? '<div class="prog"><i id="bar"></i></div><p class="note" id="stat">Wczytuję moduł rozpoznawania…</p>' : '') +
        (st.show || st.text ? '<h3>Tekst z paragonu</h3><textarea id="raw" spellcheck="false" placeholder="Wklej tutaj tekst paragonu…">' + u.esc(st.text) + '</textarea><div class="btns"><button class="btn ghost" id="reparse">Rozpoznaj produkty z tekstu</button></div>' : '') + rows;

      const bind = (sel, ev, fn) => { const e = u.$(sel, w); if (e) e['on' + ev] = fn; };
      bind('#paste', 'click', () => { st.show = true; FA.app.render(); });
      bind('#reparse', 'click', () => { st.text = u.$('#raw', w).value; parseText(); FA.app.render(); });
      bind('#file', 'change', async e => {
        const f = e.target.files[0]; if (!f) return;
        st.busy = true; st.drafts = []; st.info = ''; FA.app.render();
        try {
          st.text = await FA.ocr.recognize(f, p => { const b = u.$('#bar'), s = u.$('#stat'); if (b) b.style.width = Math.round(p * 100) + '%'; if (s) s.textContent = 'Rozpoznaję tekst… ' + Math.round(p * 100) + '%'; });
          parseText();
        } catch (err) { st.show = true; st.info = String(err.message || err); u.toast('Skan się nie udał'); }
        st.busy = false; FA.app.render();
      });
      bind('#add', 'click', async () => {
        const ok = st.drafts.filter(d => d.checked && d.name.trim() && d.qty > 0);
        if (!ok.length) return u.toast('Zaznacz co najmniej jeden produkt');
        await FA.store.addMany(ok.map(d => ({ name: d.name, qty: d.qty, unit: d.unit, zone: d.zone, category: d.matched ? d.category : undefined, expiresAt: d.expiresAt || null, source: 'receipt' })));
        u.toast('Dodano produktów: ' + ok.length); st.drafts = []; st.text = ''; st.show = false; FA.app.go('fridge');
      });
      w.addEventListener('change', e => {
        const row = e.target.closest('.drow'); if (!row) return;
        const d = st.drafts[+row.dataset.i], c = e.target.classList;
        if (c.contains('ck')) d.checked = e.target.checked;
        else if (c.contains('qt')) d.qty = u.num(e.target.value);
        else if (c.contains('un')) d.unit = e.target.value;
        else if (c.contains('zn')) d.zone = e.target.value;
        else if (c.contains('ex')) d.expiresAt = e.target.value;
        else if (c.contains('nmi')) {
          d.name = e.target.value; const p = FA.catalog.match(d.name);
          if (p) { d.matched = true; d.category = p.cat; d.unit = p.unit; d.zone = C.FRIDGE_CATS.includes(p.cat) ? 'fridge' : 'pantry'; d.checked = true; row.classList.remove('low'); u.$('.un', row).value = d.unit; u.$('.zn', row).value = d.zone; u.$('.ck', row).checked = true; }
        }
      });
    }
  };
})();
