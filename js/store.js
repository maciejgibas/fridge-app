/* Stan aplikacji w pamięci + zapis do bazy + powiadamianie widoków. FA.store */
(function () {
  const FA = window.FA, u = FA.u, C = FA.config, subs = [];
  const S = {
    items: [],
    profile: { diet: [], excludeIngredients: [], equipment: ['kuchenka'], onboarded: false },
    favorites: [],
    settings: { useApi: false, notify: true }
  };
  const zoneOf = cat => (C.FRIDGE_CATS.includes(cat) ? 'fridge' : 'pantry');

  function normalize(it) {
    const r = FA.catalog.resolve(it.name);
    const category = it.category || r.cat;
    return {
      id: it.id || u.uuid(),
      name: r.known ? r.name : String(it.name).trim(),
      displayName: it.displayName || (r.known ? r.name : String(it.name).trim()),
      qty: it.qty == null ? 1 : it.qty,
      unit: it.unit || r.unit,
      zone: it.zone || zoneOf(category),
      category,
      expiresAt: it.expiresAt || null,
      addedAt: it.addedAt || u.today(),
      source: it.source || 'manual'
    };
  }

  FA.store = {
    state: S,
    subscribe(fn) { subs.push(fn); },
    emit() { subs.forEach(f => f(S)); },
    async load() {
      S.items = await FA.db.getAll('items');
      const p = await FA.db.kvGet('profile'); if (p) Object.assign(S.profile, p);
      S.favorites = (await FA.db.kvGet('favorites')) || [];
      const s = await FA.db.kvGet('settings'); if (s) Object.assign(S.settings, s);
    },
    // dodaje produkty; ten sam produkt (nazwa + jednostka + strefa) jest scalany przez zsumowanie ilości
    async addMany(list) {
      for (const raw of list) {
        const it = normalize(raw);
        const same = S.items.find(x => FA.catalog.canonical(x.name) === FA.catalog.canonical(it.name) && x.unit === it.unit && x.zone === it.zone);
        if (same) {
          same.qty = u.round(same.qty + it.qty);
          if (it.expiresAt && (!same.expiresAt || it.expiresAt < same.expiresAt)) same.expiresAt = it.expiresAt;
          await FA.db.put('items', same);
        } else { S.items.push(it); await FA.db.put('items', it); }
      }
      this.emit();
    },
    addItem(it) { return this.addMany([it]); },
    async updateItem(id, patch) {
      const it = S.items.find(x => x.id === id); if (!it) return;
      Object.assign(it, patch); await FA.db.put('items', it); this.emit();
    },
    async removeItem(id) {
      S.items = S.items.filter(x => x.id !== id); await FA.db.del('items', id); this.emit();
    },
    async setProfile(p) { Object.assign(S.profile, p); await FA.db.kvSet('profile', S.profile); this.emit(); },
    async setSettings(p) { Object.assign(S.settings, p); await FA.db.kvSet('settings', S.settings); this.emit(); },
    async toggleFav(id) {
      const i = S.favorites.indexOf(id);
      if (i < 0) S.favorites.push(id); else S.favorites.splice(i, 1);
      await FA.db.kvSet('favorites', S.favorites); this.emit();
      return i < 0;
    },
    // "Ugotowane": odejmuje od zapasów to, co zużył przepis (tylko gdy jednostki da się przeliczyć)
    async consume(recipe) {
      let n = 0;
      for (const ing of recipe.ingredients) {
        const key = FA.catalog.canonical(ing.name);
        const it = S.items.find(x => FA.catalog.canonical(x.name) === key && x.qty > 0);
        if (!it || !ing.qty) continue;
        const q = u.convert(ing.qty, ing.unit, it.unit);
        if (q == null) continue;
        it.qty = u.round(it.qty - q); n++;
        if (it.qty <= 0) { S.items = S.items.filter(x => x.id !== it.id); await FA.db.del('items', it.id); }
        else await FA.db.put('items', it);
      }
      this.emit(); return n;
    },
    exportJSON() { return JSON.stringify({ v: 1, items: S.items, profile: S.profile, favorites: S.favorites, settings: S.settings }, null, 1); },
    async importJSON(txt) {
      const o = JSON.parse(txt);
      if (!o || !Array.isArray(o.items)) throw new Error('To nie jest plik kopii aplikacji.');
      await FA.db.clear('items'); S.items = [];
      for (const it of o.items) { const n = normalize(it); S.items.push(n); await FA.db.put('items', n); }
      if (o.profile) { Object.assign(S.profile, o.profile); await FA.db.kvSet('profile', S.profile); }
      if (o.favorites) { S.favorites = o.favorites; await FA.db.kvSet('favorites', S.favorites); }
      if (o.settings) { Object.assign(S.settings, o.settings); await FA.db.kvSet('settings', S.settings); }
      this.emit();
    },
    async resetAll() {
      await FA.db.clear('items'); await FA.db.clear('kv');
      S.items = []; S.favorites = [];
      S.profile = { diet: [], excludeIngredients: [], equipment: ['kuchenka'], onboarded: false };
      S.settings = { useApi: false, notify: true };
      this.emit();
    }
  };
})();
