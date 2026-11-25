/* Profil: dieta, wykluczenia, sprzęt. Formularz używany na starcie i w Ustawieniach. FA.ui.onboarding */
(function () {
  const FA = window.FA, u = FA.u, C = FA.config;
  FA.ui = FA.ui || {};
  const chk = (name, list, sel) => list.map(x => '<label class="chip"><input type="checkbox" name="' + name + '" value="' + x.id + '"' + (sel.includes(x.id) ? ' checked' : '') + '><span>' + u.esc(x.label) + '</span></label>').join('');
  FA.ui.onboarding = {
    form(p) {
      return '<h3>Dieta</h3><div class="chips">' + chk('diet', C.DIETS, p.diet || []) + '</div>' +
        '<h3>Czego nie jesz (alergie, niechciane składniki)</h3><input class="ex" style="width:100%" placeholder="np. orzechy, ryby (po przecinku)" value="' + u.esc((p.excludeIngredients || []).join(', ')) + '">' +
        '<h3>Mój sprzęt</h3><div class="chips">' + chk('equip', C.EQUIPMENT, p.equipment || []) + '</div>';
    },
    read(root) {
      const v = n => u.$$('input[name=' + n + ']:checked', root).map(i => i.value);
      return { diet: v('diet'), equipment: v('equip'), excludeIngredients: u.$('.ex', root).value.split(',').map(s => s.trim()).filter(Boolean) };
    },
    show() {
      const self = this;
      const m = u.modal('<h2>Witaj!</h2><p>Ustaw aplikację pod siebie. Pokażę tylko przepisy, które pasują do Twojej diety i które zrobisz na swoim sprzęcie. Zmienisz to później w Ustawieniach.</p>' + this.form(FA.store.state.profile) + '<div class="btns"><button class="btn" id="obSave">Zapisz i zacznij</button></div>', { lock: true });
      u.$('#obSave', m).onclick = async () => {
        await FA.store.setProfile(Object.assign({}, self.read(m), { onboarded: true }));
        u.closeModal();
      };
    }
  };
})();
