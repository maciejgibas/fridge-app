/* Tekst z OCR -> lista produktów (Biedronka, Lidl, Kaufland, Auchan). FA.receipt
   Obsługuje układy: "Nazwa ... 3,29 C", "Nazwa" + osobna linia "2 x 3,49 6,98C", "0,532 kg x 12,99 6,91". */
(function () {
  const FA = window.FA, u = FA.u, C = FA.config, D = FA.receiptDict;
  const QTY = /(\d+(?:[.,]\d+)?)\s*(kg|szt|g)?\s*[x×*]\s*(\d+[.,]\d{2})/i;
  const PRICE_END = /(\d+[.,]\d{2})\s*[A-Ga-g]?\s*$/;
  const PRICE_ALL = /\d+[.,]\d{2}\s*[A-Ga-g]?(?=\s|$)/g;
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

  function detectStore(text) {
    const t = u.norm(text);
    for (const s in D.stores) if (D.stores[s].some(k => t.includes(k))) return s;
    return '';
  }
  function isSkip(line) {
    const t = ' ' + u.norm(line) + ' ';
    return D.skipWords.some(w => t.includes(' ' + w + ' ')) || D.skipStems.some(s => t.includes(u.norm(s)));
  }

  FA.receipt = {
    detectStore,
    parse(text) {
      const lines = String(text || '').split(/\r?\n/).map(s => s.trim()).filter(Boolean);
      const entries = []; let last = null;
      for (const line of lines) {
        const q = line.match(QTY);
        let rest = q ? line.replace(q[0], ' ') : line;
        const pm = rest.match(PRICE_END);
        rest = rest.replace(PRICE_ALL, ' ');
        const letters = (rest.match(/[A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż]/g) || []).length;
        if (letters < 3) { // linia z samą ilością i ceną – dotyczy poprzedniego produktu
          if (q && last && !last.qtySet) {
            last.count = u.num(q[1]); last.weighed = /kg/i.test(q[2] || '') || !Number.isInteger(last.count);
            last.qtySet = true; if (last.price == null) last.price = u.num(q[3]);
          }
          continue;
        }
        if (isSkip(line)) { last = null; continue; }
        const cnt = q ? u.num(q[1]) : 1;
        last = { raw: line, text: rest, count: cnt, qtySet: !!q, weighed: q ? (/kg/i.test(q[2] || '') || !Number.isInteger(cnt)) : false, price: pm ? u.num(pm[1]) : (q ? u.num(q[3]) : null) };
        entries.push(last);
      }
      const items = [];
      entries.forEach(e => {
        let t = e.text, size = null, pack = 1;
        const pk = t.match(/(\d+)\s*szt\b/i); // np. "Jajka M 10szt"
        if (pk) { pack = +pk[1]; t = t.replace(pk[0], ' '); }
        const sm = t.match(/(\d+(?:[.,]\d+)?)\s*(kg|g|ml|l)\b/i);
        if (sm) { size = { v: u.num(sm[1]), u: sm[2].toLowerCase() }; t = t.replace(sm[0], ' '); }
        t = t.replace(/\d+(?:[.,]\d+)?\s*%/g, ' ');
        const nm = u.norm(t).split(' ').filter(w => w && !/^\d+$/.test(w) && !D.noise.includes(w)).map(w => (D.abbr[w] !== undefined ? D.abbr[w] : w)).join(' ').replace(/\s+/g, ' ').trim();
        if (nm.length < 3) return;
        const m = FA.catalog.find(nm);
        if (!m && e.price == null && !e.qtySet) return; // linia bez ceny i bez dopasowania = szum (adres, nagłówek)
        let qty = e.count || 1, unit, cat, name;
        if (m) { name = m.prod.name; cat = m.prod.cat; unit = m.prod.unit; } else { name = cap(nm); cat = 'inne'; unit = 'szt'; }
        const pu = unit;
        if (e.weighed) { if (pu === 'g') { qty *= 1000; unit = 'g'; } else unit = 'kg'; }
        else if (size && ['g', 'kg', 'ml', 'l'].includes(pu)) {
          const v = u.convert(size.v * qty, size.u, pu);
          if (v != null) qty = v; else unit = 'opak';
        } else if (pu === 'szt') qty *= pack;
        else if (pu !== 'opak') unit = 'opak';
        const zone = m ? (C.FRIDGE_CATS.includes(cat) ? 'fridge' : 'pantry') : 'fridge';
        const prev = items.find(x => x.name === name && x.unit === unit);
        if (prev) prev.qty = u.round(prev.qty + qty);
        else items.push({ raw: e.raw, name, qty: u.round(qty), unit, category: cat, zone, matched: !!m, confidence: m ? m.score : 0, price: e.price });
      });
      return { store: detectStore(text), items };
    }
  };
})();
