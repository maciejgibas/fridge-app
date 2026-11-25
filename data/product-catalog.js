/* Słownik produktów: nazwa | kategoria | domyślna jednostka | aliasy (nazwy ze sklepów i paragonów).
   FA.catalog.match(tekst) rozpoznaje produkt dokładnie, po aliasie albo rozmyciem (literówki OCR). */
(function () {
  const FA = window.FA, u = FA.u, C = FA.config;
  const RAW = [
    'mleko|nabial|l|mleko uht,mleko 3 2,mleko 2,mleczko,mleko swieze',
    'masło|nabial|opak|maslo,maslo extra,maslo ekstra,maslo polskie',
    'jajka|nabial|szt|jaja,jajka m,jajka l,jaja swojskie,jajka wiejskie',
    'ser żółty|nabial|g|ser gouda,gouda,edamski,ser edamski,tylzycki,ser tylzycki,ser zolty,ser w plastrach',
    'ser biały|nabial|g|twarog,twarog polsmlaczny,twarozek,ser bialy',
    'śmietana|nabial|opak|smietana 18,smietana 30,smietanka,smietana',
    'jogurt naturalny|nabial|opak|jogurt,jogurt grecki,jogurt naturalny',
    'mozzarella|nabial|opak|ser mozzarella,mozarella',
    'ser feta|nabial|opak|feta,ser typu feta,ser typu grecki,salatkowy',
    'parmezan|nabial|g|grana padano,ser parmezan',
    'kefir|nabial|opak|maslanka,kefir naturalny',
    'kurczak|mieso|g|filet z piersi,piers z kurczaka,filet z kurczaka,udka,udko,kurczak,piers kurczaka,skrzydelka',
    'mięso mielone|mieso|g|mielone,mieso mielone,mielone wieprzowe,mielona wolowina,mieso mielone wieprzowe',
    'boczek|mieso|g|boczek wedzony,boczek surowy',
    'szynka|mieso|g|szynka wieprzowa,szynka konserwowa,szynka delikatesowa',
    'kiełbasa|mieso|g|kielbasa slaska,parowki,kabanosy,kielbasa',
    'schab|mieso|g|karkowka,poledwiczka,wieprzowina,schab',
    'łosoś|ryby|g|filet z lososia,losos atlantycki,losos',
    'tuńczyk|konserwy|opak|tunczyk w puszce,tunczyk kawalki,tunczyk w sosie wlasnym,tunczyk',
    'ziemniaki|warzywa|kg|ziemniak,ziemniaki myte,ziemniaki luz,mlode ziemniaki',
    'cebula|warzywa|szt|cebula zolta,cebula biala,cebule,cebula czerwona',
    'czosnek|warzywa|szt|czosnek swiezy,glowka czosnku',
    'marchew|warzywa|szt|marchewka,marchew luz,marchewki',
    'pomidor|warzywa|szt|pomidory,pomidor malinowy,pomidorki,pomidory cherry,pomidory gruntowe',
    'ogórek|warzywa|szt|ogorki,ogorek szklarniowy,ogorek zielony,ogorek gruntowy',
    'papryka|warzywa|szt|papryka czerwona,papryka zolta,papryka zielona,papryki',
    'cukinia|warzywa|szt|cukinie',
    'brokuł|warzywa|szt|brokul,brokuly',
    'kalafior|warzywa|szt|kalafior swiezy',
    'szpinak|warzywa|g|szpinak swiezy,szpinak baby,liscie szpinaku',
    'sałata|warzywa|szt|salata lodowa,salata maslowa,mix salat,rukola,salata rzymska,salata',
    'pieczarki|warzywa|g|pieczarka,pieczarki biale,pieczarki brazowe',
    'por|warzywa|szt|pory',
    'seler|warzywa|szt|seler korzen,seler naciowy',
    'kapusta|warzywa|szt|kapusta biala,kapusta kiszona,kapusta pekinska',
    'burak|warzywa|szt|buraki,burak czerwony',
    'jabłko|owoce|kg|jablka,jablka szara reneta,jablko,jablka luz',
    'banan|owoce|kg|banany,banan luz',
    'cytryna|owoce|szt|cytryny',
    'pomarańcza|owoce|szt|pomarancze,pomarancza',
    'chleb|pieczywo|szt|chleb pszenny,chleb razowy,chleb wiejski,chleb tostowy,chleb zytni,chleb baltonowski',
    'bułki|pieczywo|szt|bulka,bulka kajzerka,bagietka,kajzerka,bulki,bulki pszenne',
    'mąka|sypkie|kg|maka pszenna,maka tortowa,maka wroclawska,maka',
    'cukier|sypkie|kg|cukier bialy,cukier kryształ,cukier puder',
    'ryż|sypkie|g|ryz bialy,ryz basmati,ryz jasminowy,ryz dlugoziarnisty,ryz',
    'makaron|sypkie|g|makaron spaghetti,makaron penne,makaron swiderki,makaron nitki,makaron rurki,makaron wstazki,spaghetti,penne',
    'kasza|sypkie|g|kasza gryczana,kasza jaglana,kasza bulgur,kuskus,kasza jeczmienna,bulgur',
    'płatki owsiane|sypkie|g|platki owsiane gorskie,platki owsiane,platki gorskie',
    'bułka tarta|sypkie|g|bulka tarta,tarta bulka',
    'proszek do pieczenia|sypkie|opak|proszek do pieczenia,soda oczyszczona',
    'sól|przyprawy|opak|sol kamienna,sol morska,sol spozywcza,sol',
    'pieprz|przyprawy|opak|pieprz czarny,pieprz mielony,pieprz',
    'papryka słodka|przyprawy|opak|papryka mielona,papryka wedzona,papryka slodka,papryka w proszku',
    'oregano|przyprawy|opak|oregano suszone',
    'bazylia|przyprawy|opak|bazylia suszona',
    'curry|przyprawy|opak|przyprawa curry',
    'cynamon|przyprawy|opak|cynamon mielony',
    'majeranek|przyprawy|opak|majeranek suszony',
    'liść laurowy|przyprawy|opak|lisc laurowy,ziele angielskie,lisc',
    'kmin rzymski|przyprawy|opak|kumin,kmin,kmin rzymski mielony',
    'tymianek|przyprawy|opak|tymianek suszony',
    'olej|oleje|l|olej rzepakowy,olej slonecznikowy,olej roslinny,olej uniwersalny',
    'oliwa|oleje|l|oliwa z oliwek,oliwa extra virgin,oliwa z oliwek extra',
    'ocet|oleje|l|ocet spirytusowy,ocet jablkowy,ocet balsamiczny,ocet winny',
    'sos sojowy|oleje|opak|sos sojowy',
    'ketchup|oleje|opak|ketchup lagodny,ketchup pikantny',
    'musztarda|oleje|opak|musztarda sarepska,musztarda delikatesowa',
    'majonez|oleje|opak|majonez dekoracyjny,majonez kielecki',
    'koncentrat pomidorowy|oleje|opak|koncentrat pomidorowy,koncentrat',
    'pomidory w puszce|konserwy|opak|pomidory krojone,pomidory pelati,passata,przecier pomidorowy,pomidory w puszce,pomidory w kawalkach',
    'fasola|konserwy|opak|fasola czerwona,fasola biala,fasola w puszce,fasola konserwowa,fasolka',
    'kukurydza|konserwy|opak|kukurydza konserwowa,kukurydza w puszce,kukurydza',
    'ciecierzyca|konserwy|opak|ciecierzyca w puszce',
    'groszek|konserwy|opak|groszek konserwowy,groszek zielony',
    'mleko kokosowe|konserwy|opak|mleko kokosowe,kokosowe mleko',
    'mrożone warzywa|mrozonki|opak|warzywa na patelnie,mieszanka warzywna,mrozony szpinak,mrozone warzywa,mrozonka',
    'frytki|mrozonki|opak|frytki mrozone,frytki',
    'miód|inne|opak|miod,miod wielokwiatowy',
    'orzechy|inne|g|orzechy wloskie,migdaly,orzechy laskowe,orzechy nerkowca,orzechy',
    'masło orzechowe|inne|opak|maslo orzechowe,maslo z orzechow'
  ];
  const list = RAW.map(r => { const [name, cat, unit, al] = r.split('|'); return { name, cat, unit, aliases: (al || '').split(',').filter(Boolean) }; });
  const idx = [];
  list.forEach(p => [p.name].concat(p.aliases).forEach(a => { const k = u.norm(a); if (k) idx.push({ k, p }); }));
  idx.sort((a, b) => b.k.length - a.k.length); // najdłuższy alias wygrywa ("mleko kokosowe" > "mleko")
  const memo = {};

  function find(text, fuzzy) {
    if (fuzzy === undefined) fuzzy = true;
    const t = u.norm(text); if (!t) return null;
    const mk = t + '|' + fuzzy; if (mk in memo) return memo[mk];
    let res = null;
    const ex = idx.find(e => e.k === t);
    if (ex) res = { prod: ex.p, score: 1 };
    else {
      const pad = ' ' + t + ' ';
      const c = idx.find(e => pad.includes(' ' + e.k + ' '));
      if (c) res = { prod: c.p, score: 0.95 };
      else if (fuzzy) {
        const toks = t.split(' ').filter(x => x.length >= 4);
        let best = 0, bp = null;
        idx.forEach(e => {
          let s = u.sim(t, e.k);
          if (e.k.indexOf(' ') < 0) toks.forEach(x => { s = Math.max(s, u.sim(x, e.k)); });
          if (s > best) { best = s; bp = e.p; }
        });
        if (best >= C.FUZZY) res = { prod: bp, score: best };
      }
    }
    return (memo[mk] = res);
  }

  FA.catalog = {
    list, find,
    match: (t, f) => { const r = find(t, f); return r ? r.prod : null; },
    // nazwa kanoniczna znormalizowana – do porównań (składnik przepisu vs produkt w lodówce)
    canonical: t => { const p = FA.catalog.match(t); return u.norm(p ? p.name : t); },
    // dane do zapisu nowego produktu
    resolve: t => {
      const p = FA.catalog.match(t);
      return p ? { name: p.name, cat: p.cat, unit: p.unit, known: true } : { name: String(t).trim(), cat: 'inne', unit: 'szt', known: false };
    }
  };
})();
