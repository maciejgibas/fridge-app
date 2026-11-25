/* Opcjonalne zewnętrzne źródło przepisów: TheMealDB (darmowe, bez klucza, po angielsku). FA.api */
(function () {
  const FA = window.FA;
  FA.api = {
    async search(q) {
      const r = await fetch(FA.config.MEALDB + encodeURIComponent(q));
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const j = await r.json();
      return (j.meals || []).map(m => {
        const ing = [];
        for (let i = 1; i <= 20; i++) {
          const n = (m['strIngredient' + i] || '').trim();
          if (n) ing.push({ name: n, qty: 0, unit: '', measure: (m['strMeasure' + i] || '').trim(), optional: false });
        }
        return {
          id: 'mdb' + m.idMeal, title: '🌍 ' + m.strMeal, time: 0, servings: 0, tags: [], equipment: [], ingredients: ing,
          steps: (m.strInstructions || '').split(/\r?\n+/).map(s => s.trim()).filter(Boolean),
          popular: false, source: 'themealdb', image: m.strMealThumb
        };
      });
    }
  };
})();
