/* Powiadomienia o kończących się terminach. FA.notify
   Bez serwera działają tylko przy otwartej aplikacji (baner zawsze + powiadomienie systemowe po zgodzie). */
(function () {
  const FA = window.FA, u = FA.u;
  FA.notify = {
    supported: () => 'Notification' in window,
    permission() { return this.supported() ? Notification.permission : 'unsupported'; },
    async request() {
      if (!this.supported()) return 'unsupported';
      try { return await Notification.requestPermission(); } catch (e) { return 'denied'; }
    },
    async check(force) {
      const list = FA.expiry.getExpiring(FA.store.state.items);
      if (!list.length || !FA.store.state.settings.notify || this.permission() !== 'granted') return list;
      if (!force && (await FA.db.kvGet('lastNotify')) === u.today()) return list;
      const body = list.slice(0, 4).map(i => (i.displayName || i.name) + ' (' + FA.expiry.label(i) + ')').join(', ');
      try { new Notification('Te produkty zaraz się zepsują', { body }); await FA.db.kvSet('lastNotify', u.today()); } catch (e) {}
      return list;
    }
  };
})();
