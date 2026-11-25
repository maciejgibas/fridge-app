/* Słownik do parsowania paragonów (Biedronka, Lidl, Kaufland, Auchan): skróty, szum i linie do pominięcia. */
window.FA = window.FA || {};
FA.receiptDict = {
  stores: { Biedronka: ['biedronka', 'jeronimo', 'jmp'], Lidl: ['lidl'], Kaufland: ['kaufland'], Auchan: ['auchan'] },
  // skróty drukowane na paragonach -> pełne słowa (porównywane po normalizacji)
  abbr: {
    fil: 'filet', pier: 'piers', kur: 'kurczak', kurcz: 'kurczak', pom: 'pomidor', pomid: 'pomidor',
    og: 'ogorek', ogor: 'ogorek', ziem: 'ziemniaki', ziemn: 'ziemniaki', mlk: 'mleko', mlecz: 'mleko',
    mas: 'maslo', masl: 'maslo', jog: 'jogurt', kielb: 'kielbasa', parow: 'parowki', makar: 'makaron',
    miel: 'mielone', mielon: 'mielone', wedz: 'wedzony', wieprz: 'wieprzowe', pszen: 'pszenna',
    march: 'marchew', cebul: 'cebula', papr: 'papryka', jaj: 'jaja', smiet: 'smietana'
  },
  // słowa-szum, które nie pomagają w rozpoznaniu produktu
  noise: ['uht', 'bio', 'pl', 'x', 'szt', 'kg', 'g', 'ml', 'l', 'promocja', 'swieze', 'swiezy', 'fresh', 'natura', 'premium', 'klasyczny', 'tradycyjne', 'op', 'tacka', 'pakowane', 'luz', 'a', 'b', 'c', 'd'],
  // pojedyncze słowa oznaczające linie nieprodukowe
  skipWords: ['suma', 'razem', 'ptu', 'vat', 'nip', 'reszta', 'gotowka', 'karta', 'visa', 'mastercard', 'blik', 'rabat', 'kasa', 'nr', 'numer', 'godz', 'www', 'tel', 'ul', 'biedronka', 'lidl', 'kaufland', 'auchan', 'jeronimo', 'martins', 'bon', 'punkty', 'plus', 'kupon', 'aplikacja', 'sklep', 'data', 'torba', 'torebka', 'reklamowka', 'siatka', 'kaucja', 'zwrot', 'zoo', 'pln', 'zl', 'nabywca', 'sprzedawca'],
  // fragmenty (podciągi) oznaczające linie nieprodukowe i artykuły nie-spożywcze
  skipStems: ['opodatk', 'fiskaln', 'zaplaty', 'platnosc', 'transakcj', 'autoryz', 'dziekuj', 'zapraszam', 'oszczednos', 'paragon', 'kasjer', 'sprzedaz', 'plyn do', 'proszek do prania', 'papier toaletowy', 'szampon', 'mydlo', 'pasta do zebow', 'worki', 'gabka', 'zmywark', 'chusteczki', 'detergent', 'baterie', 'swieca', 'ręcznik', 'recznik']
};
