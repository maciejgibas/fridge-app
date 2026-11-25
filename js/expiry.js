/* Daty ważności. FA.expiry */
(function () {
  const FA = window.FA, u = FA.u, C = FA.config;
  FA.expiry = {
    status(it) {
      const d = u.daysUntil(it.expiresAt);
      if (d === null) return 'none';
      if (d < 0) return 'expired';
      return d <= C.SOON_DAYS ? 'soon' : 'ok';
    },
    label(it) {
      const d = u.daysUntil(it.expiresAt);
      if (d === null) return '';
      if (d < 0) return 'przeterminowane (' + (-d) + ' d.)';
      if (d === 0) return 'dziś';
      if (d === 1) return 'jutro';
      return 'za ' + d + ' dni';
    },
    getExpiring(items, days) {
      const lim = days == null ? C.SOON_DAYS : days;
      return items.filter(i => i.expiresAt && i.qty > 0 && u.daysUntil(i.expiresAt) <= lim).sort((a, b) => a.expiresAt.localeCompare(b.expiresAt));
    }
  };
})();
