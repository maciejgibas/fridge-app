/* Silnik dopasowania przepisów do produktów w domu. FA.matcher */
(function () {
  const FA = window.FA, u = FA.u, C = FA.config;
  const key = n => FA.catalog.canonical(n);
  const basics = new Set(C.BASICS.map(u.norm));

  FA.allRecipes = () => window.FA_SEED_RECIPES || [];

  function haveMap(items) {
    const m = new Map();
    items.forEach(i => { if (i.qty > 0) { const k = key(i.name); (m.get(k) || m.set(k, []).get(k)).push(i); } });
    return m;
  }
  // sprzęt: wystarczy jedna alternatywa, w której masz wszystko ("kuchenka+blender" = oba)
  function equipmentOk(r, p) {
    if (!r.equipment || !r.equipment.length) return true;
    const have = new Set(p.equipment || []);
    return r.equipment.some(alt => alt.split('+').every(e => have.has(e)));
  }
  function evaluate(r, items, map) {
    map = map || haveMap(items);
    const have = [], missing = [], exp = [];
    let req = 0, got = 0;
    r.ingredients.forEach(i => {
      const k = key(i.name); if (basics.has(k)) return;
      const its = map.get(k);
      if (its) {
        have.push(i.name);
        const e = its.find(x => x.expiresAt && u.daysUntil(x.expiresAt) <= C.SOON_DAYS);
        if (e) exp.push({ name: i.name, item: e });
      } else if (!i.optional) missing.push(i.name);
      if (!i.optional) { req++; if (its) got++; }
    });
    const coverage = req ? got / req : 1;
    // bonus za składniki, które zaraz się zepsują (przeterminowane mniej niż "na dziś")
    const bonus = exp.reduce((s, x) => s + (u.daysUntil(x.item.expiresAt) < 0 ? 4 : 10), 0);
    return { recipe: r, have, missing, exp, coverage, req, got, score: coverage * 100 + bonus - missing.length * 3 + (r.popular ? 1 : 0) };
  }
  FA.matcher = {
    haveMap, equipmentOk, evaluate,
    // filtr twardy (dieta, sprzęt) -> ocena -> sortowanie
    rank(recipes, items, profile) {
      const map = haveMap(items);
      return recipes
        .filter(r => FA.diet.allows(r, profile) && equipmentOk(r, profile))
        .map(r => evaluate(r, items, map))
        .sort((a, b) => b.score - a.score || (a.recipe.time || 0) - (b.recipe.time || 0));
    }
  };
})();
