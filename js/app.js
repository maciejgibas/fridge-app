/* Start aplikacji, zakładki, baner terminów. FA.app */
(function () {
  const FA = window.FA, u = FA.u;
  let tab = 'fridge';
  FA.app = {
    go(t) {
      tab = t;
      u.$$('#nav button').forEach(b => b.classList.toggle('on', b.dataset.tab === t));
      this.render(); window.scrollTo(0, 0);
    },
    render() {
      const v = u.$('#view'); v.innerHTML = '';
      const root = document.createElement('div'); v.appendChild(root);
      FA.ui[tab].render(root);
      this.banner();
    },
    banner() {
      const list = FA.expiry.getExpiring(FA.store.state.items), b = u.$('#banner');
      if (!list.length) { b.innerHTML = ''; return; }
      const names = list.slice(0, 4).map(i => u.esc(i.displayName || i.name) + ' (' + FA.expiry.label(i) + ')').join(', ');
      b.innerHTML = '<div class="alert"><span>Kończą się: ' + names + (list.length > 4 ? ' i ' + (list.length - 4) + ' więcej' : '') + '</span><button class="btn sm" id="seeR">Zobacz przepisy</button></div>';
      u.$('#seeR').onclick = () => { FA.ui.recipes.setChip('expiring'); this.go('recipes'); };
    },
    async init() {
      try { await FA.db.init(); await FA.store.load(); } catch (e) { u.toast('Nie udało się odczytać zapisanych danych'); }
      FA.store.subscribe(() => FA.app.render());
      u.$('#nav').addEventListener('click', e => { const b = e.target.closest('[data-tab]'); if (b) this.go(b.dataset.tab); });
      this.go('fridge');
      if (!FA.store.state.profile.onboarded) FA.ui.onboarding.show();
      FA.notify.check();
      setInterval(() => { FA.notify.check(); this.banner(); }, 3600e3);
    }
  };
  document.addEventListener('DOMContentLoaded', () => FA.app.init());
})();
