/* Konfiguracja i stałe – ładowana jako pierwsza. Cała aplikacja żyje w jednej przestrzeni nazw: window.FA */
window.FA = window.FA || {};
FA.config = {
  DB_NAME: 'fridge-app',
  SOON_DAYS: 3,                 // ile dni przed terminem uznajemy produkt za "kończy się"
  OCR_LANG: 'pol',
  FUZZY: 0.8,                   // próg podobieństwa przy rozpoznawaniu nazw
  BASICS: ['sól', 'pieprz', 'woda'], // zakładamy, że zawsze są w domu
  MEALDB: 'https://www.themealdb.com/api/json/v1/1/search.php?s=',
  SHELF: { nabial: 7, mieso: 3, ryby: 2, warzywa: 7, owoce: 7, pieczywo: 4, mrozonki: 180 }, // orientacyjna trwałość (dni)
  FRIDGE_CATS: ['nabial', 'mieso', 'ryby', 'warzywa', 'owoce', 'pieczywo', 'mrozonki'],
  CAT_LABEL: {
    nabial: 'Nabiał i jaja', mieso: 'Mięso i wędliny', ryby: 'Ryby', warzywa: 'Warzywa', owoce: 'Owoce',
    pieczywo: 'Pieczywo', mrozonki: 'Mrożonki', sypkie: 'Produkty sypkie', przyprawy: 'Przyprawy',
    oleje: 'Oleje, octy i sosy', konserwy: 'Konserwy i puszki', inne: 'Inne'
  },
  UNITS: ['szt', 'g', 'kg', 'ml', 'l', 'opak'],
  DIETS: [
    { id: 'vege', label: 'Wegetariańska' }, { id: 'vegan', label: 'Wegańska' },
    { id: 'gluten-free', label: 'Bez glutenu' }, { id: 'lactose-free', label: 'Bez laktozy' }
  ],
  EQUIPMENT: [
    { id: 'kuchenka', label: 'Kuchenka' }, { id: 'piekarnik', label: 'Piekarnik' },
    { id: 'airfryer', label: 'Airfryer' }, { id: 'mikrofalowka', label: 'Mikrofalówka' },
    { id: 'blender', label: 'Blender' }
  ]
};
