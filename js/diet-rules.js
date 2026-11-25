/* Filtr diet i wykluczonych składników. FA.diet */
(function () {
  const FA = window.FA, u = FA.u;
  FA.diet = {
    allows(r, p) {
      const tags = new Set(r.tags || []);
      for (const d of (p.diet || [])) {
        if (d === 'vege') { if (!tags.has('vege') && !tags.has('vegan')) return false; }
        else if (d === 'lactose-free') { if (!tags.has('lactose-free') && !tags.has('vegan')) return false; }
        else if (!tags.has(d)) return false;
      }
      const ex = (p.excludeIngredients || []).map(u.norm).filter(Boolean);
      if (ex.length) {
        const names = r.ingredients.filter(i => !i.optional).map(i => u.norm(i.name));
        if (ex.some(e => names.some(n => n.includes(e) || e.includes(n)))) return false;
      }
      return true;
    },
    label(p) {
      const l = FA.config.DIETS.filter(d => (p.diet || []).includes(d.id)).map(d => d.label.toLowerCase());
      return l.length ? l.join(', ') : 'bez ograniczeń';
    }
  };
})();
