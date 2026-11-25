/* Zakładka "Ustawienia": profil, powiadomienia, źródła, dane. FA.ui.settings */
(function () {
  const FA = window.FA, u = FA.u;
  FA.ui = FA.ui || {};
  const DEMO = [
    ['jajka', 6, 'szt', 'fridge', 5], ['mleko', 1, 'l', 'fridge', 2], ['kurczak', 500, 'g', 'fridge', 1], ['ser żółty', 200, 'g', 'fridge', 9],
    ['cebula', 3, 'szt', 'fridge', 0], ['ziemniaki', 1.5, 'kg', 'fridge', 0], ['papryka', 2, 'szt', 'fridge', 3], ['pomidor', 3, 'szt', 'fridge', 4],
    ['makaron', 500, 'g', 'pantry', 0], ['ryż', 400, 'g', 'pantry', 0], ['pomidory w puszce', 2, 'opak', 'pantry', 0], ['olej', 1, 'l', 'pantry', 0],
    ['oliwa', 0.5, 'l', 'pantry', 0], ['czosnek', 2, 'szt', 'fridge', 0], ['papryka słodka', 1, 'opak', 'pantry', 0], ['mąka', 1, 'kg', 'pantry', 0]
  ];
  FA.ui.settings = {
    render(root) {
      const S = FA.store.state, w = document.createElement('div'); root.appendChild(w);
      const perm = FA.notify.permission();
      const permTxt = { granted: 'włączone', denied: 'zablokowane w przeglądarce', default: 'jeszcze nie włączone', unsupported: 'niedostępne w tej przeglądarce' }[perm];
      w.innerHTML =
        '<div class="sec"><h2>Mój profil</h2><div id="prof">' + FA.ui.onboarding.form(S.profile) + '</div><div class="btns"><button class="btn" id="saveP">Zapisz profil</button></div></div>' +
        '<div class="sec"><h2>Powiadomienia o terminach</h2><p class="note">Baner z kończącymi się produktami pokazuje się zawsze po otwarciu aplikacji. Powiadomienia systemowe działają, gdy aplikacja jest otwarta (np. w karcie przeglądarki). Status: ' + permTxt + '.</p>' +
        '<label class="chip"><input type="checkbox" id="nt" ' + (S.settings.notify ? 'checked' : '') + '><span>Powiadamiaj o terminach</span></label>' +
        '<div class="btns"><button class="btn ghost" id="perm"' + (perm === 'granted' || perm === 'unsupported' ? ' disabled' : '') + '>Zezwól na powiadomienia</button></div></div>' +
        '<div class="sec"><h2>Źródła przepisów</h2><label class="chip"><input type="checkbox" id="api" ' + (S.settings.useApi ? 'checked' : '') + '><span>Szukaj też w TheMealDB (internet, po angielsku)</span></label></div>' +
        '<div class="sec"><h2>Dane</h2><p class="note">Wszystko jest zapisane tylko w tej przeglądarce (' + (FA.db.mode() === 'idb' ? 'IndexedDB' : 'localStorage') + '). Zrób kopię, jeśli zmieniasz komputer.</p>' +
        '<div class="btns"><button class="btn ghost" id="demo">Dodaj przykładowe produkty</button><button class="btn ghost" id="exp">Pobierz kopię (JSON)</button>' +
        '<label class="btn ghost">Wczytaj kopię<input type="file" id="imp" accept=".json,application/json" hidden></label><button class="btn ghost" id="reset">Usuń wszystkie dane</button></div></div>';
      const $ = s => u.$(s, w);
      $('#saveP').onclick = async () => { await FA.store.setProfile(FA.ui.onboarding.read($('#prof'))); u.toast('Zapisano profil'); };
      $('#nt').onchange = e => FA.store.setSettings({ notify: e.target.checked });
      $('#api').onchange = e => FA.store.setSettings({ useApi: e.target.checked });
      $('#perm').onclick = async () => { const r = await FA.notify.request(); u.toast(r === 'granted' ? 'Powiadomienia włączone' : 'Nie udzielono zgody'); FA.app.render(); };
      $('#demo').onclick = async () => { await FA.store.addMany(DEMO.map(d => ({ name: d[0], qty: d[1], unit: d[2], zone: d[3], expiresAt: d[4] ? u.addDays(d[4]) : null }))); u.toast('Dodano przykładowe produkty'); };
      $('#exp').onclick = () => u.download('co-z-lodowki-' + u.today() + '.json', FA.store.exportJSON());
      $('#imp').onchange = e => {
        const f = e.target.files[0]; if (!f) return;
        const r = new FileReader();
        r.onload = async () => { try { await FA.store.importJSON(r.result); u.toast('Wczytano kopię'); } catch (err) { u.toast('Błąd: ' + err.message); } };
        r.readAsText(f);
      };
      $('#reset').onclick = async () => { if (confirm('Usunąć wszystkie produkty, ustawienia i ulubione?')) { await FA.store.resetAll(); FA.ui.onboarding.show(); } };
    }
  };
})();
