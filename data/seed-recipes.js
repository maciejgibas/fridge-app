/* Przepisy startowe (w pliku .js, żeby działały też po otwarciu index.html z dysku, bez serwera).
   R(id, tytuł, minuty, porcje, tagi, sprzęt, składniki, kroki, popularny)
   - sprzęt: alternatywy po przecinku, "a+b" = potrzebne oba (puste = bez sprzętu)
   - składniki: nazwa:ilość:jednostka[:o] (o = opcjonalny); nazwy takie jak w katalogu produktów
   - tagi: vege, vegan, gluten-free, lactose-free */
(function () {
  const R = (id, title, time, servings, tags, eq, ing, steps, pop) => ({
    id, title, time, servings, source: 'seed', popular: !!pop,
    tags: tags ? tags.split(',') : [], equipment: eq ? eq.split(',') : [],
    ingredients: ing.split(';').map(s => { const [name, qty, unit, o] = s.split(':'); return { name, qty: +qty || 0, unit: unit || '', optional: o === 'o' }; }),
    steps: steps.split('|')
  });
  window.FA_SEED_RECIPES = [
    R('r01', '🍳 Jajecznica z cebulą', 10, 1, 'vege,gluten-free', 'kuchenka', 'jajka:3:szt;cebula:0.5:szt;masło:10:g', 'Pokrój cebulę i zeszklij ją na maśle.|Wbij jajka, dopraw solą i mieszaj na średnim ogniu do ścięcia.|Podawaj od razu z pieczywem.', 1),
    R('r02', '🍝 Makaron w sosie pomidorowym', 25, 2, 'vege,vegan,lactose-free', 'kuchenka', 'makaron:200:g;pomidory w puszce:1:opak;czosnek:2:szt;oliwa:30:ml;bazylia:1:opak:o', 'Ugotuj makaron al dente.|Na oliwie podsmaż czosnek, dodaj pomidory i duś 10 minut.|Wymieszaj z makaronem, dopraw bazylią, solą i pieprzem.', 1),
    R('r03', '🥞 Naleśniki', 30, 3, 'vege', 'kuchenka', 'mąka:200:g;mleko:0.4:l;jajka:2:szt;olej:30:ml;cukier:1:opak:o', 'Wymieszaj mąkę, mleko, jajka i szczyptę soli na gładkie ciasto.|Odstaw na 10 minut.|Smaż cienkie placki na rozgrzanej, lekko natłuszczonej patelni, ok. 1 min z każdej strony.', 1),
    R('r04', '🍗 Kurczak pieczony z ziemniakami', 60, 3, 'gluten-free,lactose-free', 'piekarnik,airfryer', 'kurczak:600:g;ziemniaki:0.8:kg;czosnek:2:szt;olej:30:ml;papryka słodka:1:opak', 'Wymieszaj olej, czosnek i paprykę, natrzyj nimi kurczaka.|Ziemniaki pokrój w ćwiartki i dołóż do formy.|Piecz 45–50 min w 200°C (w airfryerze porcjami ok. 25 min w 180°C).', 1),
    R('r05', '🍗 Kurczak z airfryera', 25, 2, 'gluten-free,lactose-free', 'airfryer', 'kurczak:500:g;papryka słodka:1:opak;olej:15:ml;czosnek:2:szt', 'Pokrój kurczaka w kawałki, wymieszaj z olejem, przyprawami i czosnkiem.|Smaż w airfryerze 15–18 min w 190°C, w połowie wymieszaj.'),
    R('r06', '🍟 Frytki z airfryera', 25, 2, 'vege,vegan,gluten-free,lactose-free', 'airfryer,piekarnik', 'ziemniaki:0.6:kg;olej:15:ml;papryka słodka:1:opak:o', 'Pokrój ziemniaki w słupki i dokładnie osusz.|Wymieszaj z olejem i przyprawami.|Smaż 18–22 min w 200°C, co kilka minut potrząsaj koszem.', 1),
    R('r07', '🍅 Zupa pomidorowa z ryżem', 40, 3, 'vege', 'kuchenka', 'pomidory w puszce:1:opak;marchew:1:szt;cebula:1:szt;ryż:100:g;śmietana:1:opak:o;liść laurowy:1:opak:o', 'Zagotuj 1 l wody z pokrojoną marchewką, cebulą i liściem laurowym.|Dodaj pomidory, gotuj 15 min.|Dodaj ugotowany ryż, dopraw, na koniec zabiel śmietaną.'),
    R('r08', '🧀 Omlet ze szpinakiem i serem', 12, 1, 'vege,gluten-free', 'kuchenka', 'jajka:3:szt;ser żółty:50:g;szpinak:50:g:o;masło:10:g', 'Roztrzep jajka z solą.|Na maśle podsmaż szpinak, zalej jajkami.|Posyp serem, złóż omlet i smaż do ścięcia.'),
    R('r09', '🥣 Owsianka z bananem', 8, 1, 'vege', 'kuchenka,mikrofalowka', 'płatki owsiane:60:g;mleko:0.25:l;banan:1:szt;miód:1:opak:o', 'Zagotuj mleko z płatkami (lub podgrzej w mikrofali 2–3 min).|Dodaj pokrojonego banana i miód.', 1),
    R('r10', '🥗 Sałatka grecka', 10, 2, 'vege,gluten-free', '', 'pomidor:2:szt;ogórek:1:szt;ser feta:100:g;cebula:0.5:szt;oliwa:30:ml;oregano:1:opak:o', 'Pokrój warzywa w kostkę.|Dodaj fetę, oliwę i oregano, delikatnie wymieszaj.', 1),
    R('r11', '🌶️ Chili sin carne', 40, 4, 'vege,vegan,gluten-free,lactose-free', 'kuchenka', 'fasola:1:opak;kukurydza:1:opak;pomidory w puszce:1:opak;cebula:1:szt;papryka:1:szt;czosnek:2:szt;kmin rzymski:1:opak:o;olej:20:ml', 'Zeszklij cebulę, czosnek i paprykę na oleju.|Dodaj pomidory, fasolę, kukurydzę i kmin.|Duś 20–25 min, dopraw solą i pieprzem.', 1),
    R('r12', '🥕 Pieczone warzywa', 45, 3, 'vege,vegan,gluten-free,lactose-free', 'piekarnik,airfryer', 'ziemniaki:0.5:kg;marchew:3:szt;cukinia:1:szt;papryka:1:szt;oliwa:30:ml;oregano:1:opak:o', 'Pokrój warzywa na większe kawałki.|Wymieszaj z oliwą i ziołami.|Piecz 35–40 min w 200°C, raz zamieszaj.'),
    R('r13', '🍔 Kotlety mielone', 35, 3, 'lactose-free', 'kuchenka', 'mięso mielone:500:g;cebula:1:szt;jajka:1:szt;bułka tarta:50:g;olej:40:ml', 'Wymieszaj mięso z posiekaną cebulą, jajkiem, bułką tartą i przyprawami.|Uformuj kotlety.|Smaż po 5–6 min z każdej strony.', 1),
    R('r14', '🍚 Ryż z kurczakiem i warzywami', 30, 2, 'lactose-free', 'kuchenka', 'ryż:150:g;kurczak:250:g;papryka:1:szt;cebula:1:szt;sos sojowy:20:ml:o;olej:20:ml', 'Ugotuj ryż.|Podsmaż kurczaka, dodaj cebulę i paprykę.|Wymieszaj z ryżem, dopraw sosem sojowym.'),
    R('r15', '🥔 Placki ziemniaczane', 35, 3, 'vege,lactose-free', 'kuchenka', 'ziemniaki:0.8:kg;cebula:1:szt;jajka:1:szt;mąka:40:g;olej:80:ml', 'Zetrzyj ziemniaki i cebulę, odciśnij nadmiar wody.|Dodaj jajko, mąkę, sól i pieprz.|Smaż małe placki na złoto z obu stron.', 1),
    R('r16', '🍝 Zapiekanka makaronowa', 40, 3, 'vege', 'piekarnik', 'makaron:250:g;ser żółty:150:g;pomidory w puszce:1:opak;cebula:1:szt;śmietana:1:opak:o', 'Ugotuj makaron.|Wymieszaj z podsmażoną cebulą i pomidorami, przełóż do formy.|Posyp serem i piecz 20 min w 190°C.'),
    R('r17', '🥪 Kanapki z jajkiem', 10, 2, 'vege', '', 'chleb:1:szt;jajka:2:szt;majonez:1:opak:o;ogórek:1:szt:o', 'Ugotuj jajka na twardo (9 min).|Rozgnieć z majonezem, dopraw.|Nałóż na pieczywo, dodaj ogórka.'),
    R('r18', '🧀 Tosty z serem', 10, 1, 'vege', 'airfryer,piekarnik', 'chleb:1:szt;ser żółty:60:g;pomidor:1:szt:o', 'Ułóż ser (i pomidora) między kromkami.|Zapiekaj 5–7 min w 180°C, aż ser się rozpuści.'),
    R('r19', '🥦 Krem z brokułów', 30, 3, 'vege,gluten-free', 'kuchenka+blender', 'brokuł:1:szt;ziemniaki:0.3:kg;cebula:1:szt;czosnek:1:szt;śmietana:1:opak:o', 'Ugotuj brokuła z ziemniakami, cebulą i czosnkiem w 0,8 l wody (15 min).|Zmiksuj na gładko, dopraw.|Dodaj odrobinę śmietany.'),
    R('r20', '🍳 Szakszuka', 25, 2, 'vege,gluten-free', 'kuchenka', 'jajka:4:szt;pomidory w puszce:1:opak;papryka:1:szt;cebula:1:szt;czosnek:2:szt;ser feta:50:g:o;papryka słodka:1:opak:o', 'Podsmaż cebulę, paprykę i czosnek.|Dodaj pomidory, duś 10 min.|Zrób wgłębienia, wbij jajka i gotuj pod przykryciem 5–7 min.', 1),
    R('r21', '🐟 Łosoś pieczony z cytryną', 25, 2, 'gluten-free,lactose-free', 'piekarnik,airfryer', 'łosoś:300:g;cytryna:1:szt;oliwa:20:ml;czosnek:1:szt', 'Natrzyj łososia oliwą, czosnkiem i solą.|Dodaj plasterki cytryny.|Piecz 12–15 min w 200°C.'),
    R('r22', '🍌 Koktajl bananowy', 5, 1, 'vege,gluten-free', 'blender', 'banan:2:szt;mleko:0.3:l;miód:1:opak:o', 'Zmiksuj wszystkie składniki na gładko.'),
    R('r23', '🍝 Makaron z kurczakiem i szpinakiem', 30, 2, '', 'kuchenka', 'makaron:200:g;kurczak:250:g;szpinak:150:g;śmietana:1:opak;czosnek:2:szt', 'Ugotuj makaron.|Podsmaż kurczaka z czosnkiem, dodaj szpinak i śmietanę.|Połącz z makaronem.'),
    R('r24', '🥘 Tortilla ziemniaczana', 30, 2, 'vege,gluten-free,lactose-free', 'kuchenka', 'jajka:4:szt;ziemniaki:0.4:kg;cebula:1:szt;olej:40:ml', 'Usmaż pokrojone ziemniaki z cebulą do miękkości.|Zalej roztrzepanymi jajkami.|Smaż pod przykryciem 8 min, obróć i dosmaż.'),
    R('r25', '🥗 Sałatka z tuńczykiem', 10, 2, 'gluten-free,lactose-free', '', 'tuńczyk:1:opak;kukurydza:1:opak;ogórek:1:szt;pomidor:1:szt;majonez:1:opak:o', 'Odsącz tuńczyka i kukurydzę.|Pokrój warzywa i wymieszaj ze wszystkim.', 1),
    R('r26', '☕ Jajko w kubku (mikrofalówka)', 4, 1, 'vege,gluten-free', 'mikrofalowka', 'jajka:2:szt;ser żółty:30:g:o;mleko:0.03:l:o', 'Roztrzep składniki w kubku.|Podgrzewaj w mikrofali 60–90 s, mieszając w połowie.'),
    R('r27', '🍲 Gulasz z fasolą i kiełbasą', 35, 3, 'gluten-free,lactose-free', 'kuchenka', 'kiełbasa:200:g;fasola:1:opak;cebula:1:szt;pomidory w puszce:1:opak;papryka słodka:1:opak:o', 'Podsmaż pokrojoną kiełbasę z cebulą.|Dodaj pomidory i fasolę, duś 20 min.|Dopraw papryką, solą i pieprzem.')
  ];
})();
