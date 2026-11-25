/* Warstwa danych: IndexedDB, a gdy niedostępna (np. tryb prywatny) – localStorage. FA.db */
(function () {
  const FA = window.FA, STORES = ['items', 'kv'], LS = 'fa:';
  let idb = null, mode = 'idb';
  const keyOf = s => (s === 'kv' ? 'key' : 'id');
  const lsGet = s => { try { return JSON.parse(localStorage.getItem(LS + s) || '{}'); } catch (e) { return {}; } };
  const lsSet = (s, o) => { try { localStorage.setItem(LS + s, JSON.stringify(o)); } catch (e) {} };
  const req = r => new Promise((ok, no) => { r.onsuccess = () => ok(r.result); r.onerror = () => no(r.error); });
  const os = (s, rw) => idb.transaction(s, rw ? 'readwrite' : 'readonly').objectStore(s);

  FA.db = {
    mode: () => mode,
    init() {
      return new Promise(res => {
        if (!window.indexedDB) { mode = 'ls'; return res(mode); }
        let o;
        try { o = indexedDB.open(FA.config.DB_NAME, 1); } catch (e) { mode = 'ls'; return res(mode); }
        o.onupgradeneeded = () => STORES.forEach(s => { if (!o.result.objectStoreNames.contains(s)) o.result.createObjectStore(s, { keyPath: keyOf(s) }); });
        o.onsuccess = () => { idb = o.result; res(mode); };
        o.onerror = o.onblocked = () => { mode = 'ls'; res(mode); };
      });
    },
    async getAll(s) { return mode === 'ls' ? Object.values(lsGet(s)) : req(os(s).getAll()); },
    async get(s, id) { return mode === 'ls' ? lsGet(s)[id] : req(os(s).get(id)); },
    async put(s, obj) {
      if (mode === 'ls') { const o = lsGet(s); o[obj[keyOf(s)]] = obj; lsSet(s, o); return obj; }
      await req(os(s, true).put(obj)); return obj;
    },
    async del(s, id) {
      if (mode === 'ls') { const o = lsGet(s); delete o[id]; lsSet(s, o); return; }
      await req(os(s, true).delete(id));
    },
    async clear(s) { if (mode === 'ls') return lsSet(s, {}); await req(os(s, true).clear()); },
    async kvGet(key) { const r = await this.get('kv', key); return r ? r.value : undefined; },
    kvSet(key, value) { return this.put('kv', { key, value }); }
  };
})();
