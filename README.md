# Informatika 11 – v3 su prisijungimais

Tai ankstesnės svetainės tęsinys, ne naujas atskiras projektas.

Pagrindinis skirtumas: v3 prijungta prie Supabase ir skirta keliems mokytojams bei jų mokiniams.

Pradėk nuo `SETUP.md`.

Svarbiausi failai:
- `supabase-config.js` – įrašomi 2 Supabase duomenys;
- `supabase/schema.sql` – duomenų bazė ir prieigos taisyklės;
- `questions.js` – 65 vektorinės grafikos praktikos klausimai;
- `assessment.js` – kol kas tuščias atsiskaitymo bankas;
- `config.js` – temų katalogas;
- `app.js` – prisijungimai, mokytojo/mokinio skydeliai, rezultatai ir failai.


## v3.1 pakeitimai
- Sutvarkyta „Pradžia“ navigacija: mokinys po prisijungimo iškart patenka į savo klasę.
- Mokytojo meniu neberodoma tuščia „Pradžia“ nuoroda.
- Pridėta privati „Mokytojo biblioteka“ mokytojo failams.
- Išplėstas „Žinių treniruotės“ paaiškinimas mokiniams.
- `PATCH_v3_1.sql` sutvirtina profilio teises, kad mokinys negalėtų pats pasikeisti rolės.


## v3.2 pakeitimai
- Mokinio „Pradžia“ dabar visada atidaro jo klasės pagrindinį ekraną.
- Pridėtas cache-busting (`?v=3.2`), kad GitHub Pages neberodytų senos JS/CSS versijos.
- Mokinys vardą ir pavardę po registracijos gali pataisyti tik vieną kartą.
- Mokinys gali tiesiai iš „Pradžia“ įkelti atliktą darbą, pasirinkdamas temą.
- Mokytojas klasės „Užduotys ir darbai“ skiltyje mato ir atsisiunčia savarankiškai pateiktus mokinių failus.


## v3.3 pakeitimai
- Administratoriaus paskyra gali matyti visas klases ir išsamią mokinių statistiką.
- Pridėta prisijungimų istorija (kaupiama nuo v3.3 įdiegimo).
- Mokinio detalėse: aktyvus laikas, sesijų skaičius, vidutinė sesija, bandymų istorija, vidurkis, geriausias rezultatas, atsakymų tikslumas, pateiktų failų skaičius.
- Mokytojo skydelyje matomas bendras pateiktų failų skaičius ir naujausi darbai.
- Klasės skirtuke „Užduotys ir darbai“ rodomas pateiktų failų skaičius.
- Mokytojas gali ištrinti mokinio failą tik po patvirtinimo.
- Mokinys gali įkelti kelis failus vienu metu, vėliau pridėti daugiau ir ištrinti savo failus.
- Vienai mokytojo sukurtai užduočiai mokinys gali pateikti kelis failus.
- Mokytojas gali įjungti „Mokinio vaizdą“ ir demonstruoti temas bei užduočių išdėstymą neprisijungdamas kaip mokinys.


## v3.4 pakeitimai
- Iš mokytojo pagrindinio skydelio pašalinta skiltis „Naujausi mokiniai“.
- Skiltyje „Naujausi darbai“ prie kiekvieno failo pridėtas tik „Atsisiųsti“ mygtukas.
- Failų trynimas paliktas klasės / užduoties valdymo vietose, kur yra patvirtinimas prieš trynimą.
- Pridėtas `?v=3.4`, kad GitHub Pages greičiau užkrautų naują JavaScript/CSS versiją.


## v3.5 pakeitimai
- Klasėje pridėta skiltis „Skelbimai ir nuorodos“.
- Mokytojas gali paskelbti pavadinimą, trumpą komentarą/pranešimą ir pasirinktinai interneto nuorodą.
- Mokiniai skelbimus mato savo „Pradžia“ skiltyje ir nuorodas gali atidaryti naujame lange.
- Mokytojas gali ištrinti skelbimą su patvirtinimu.
- „Mokinio vaizdo“ peržiūroje mokytojas mato, kaip skelbimai atrodo mokiniui.


## v3.6 pakeitimai
- Bendras klasės „Skelbimai ir nuorodos“ skirtukas pašalintas.
- Kiekviena tema dabar turi savo mygtuką „Pranešimai / nuorodos“ mokytojo temų valdyme.
- Mokytojo pranešimai ir nuorodos saugomi su konkrečios temos ID.
- Mokinys pranešimus mato tik atsidaręs atitinkamą temą.
- „Mokinio vaizdo“ peržiūroje pranešimai taip pat rodomi tik konkrečioje temoje.
- Seni v3.5 bendri skelbimai netrinami, bet naujoje sąsajoje nerodomi.


## v3.7 pakeitimai
- Mokytojas prie savo temos pranešimo mato mygtuką „Redaguoti“.
- Galima keisti pavadinimą, komentarą ir nuorodą.
- Redaguoti leidžiama tik savo sukurtus pranešimus.
- `PATCH_v3_7_FULL.sql` apima ir v3.6 temos pranešimų struktūrą, todėl atskirai v3.6 SQL paleisti nereikia.


## v3.8 pakeitimai
- Mokytojas gali redaguoti savo sukurtas užduotis.
- Galima keisti temą, pavadinimą, instrukciją, terminą ir užduoties atidarymo būseną.
- Mokytojas gali ištrinti užduotį.
- Prieš trinant visada prašoma patvirtinimo.
- Jei prie užduoties yra mokinių failų, rodomas aiškus papildomas perspėjimas; patvirtinus pašalinami ir susiję failai iš Storage.
- Papildomo Supabase SQL šiai versijai nereikia, nes užduočių UPDATE/DELETE teisės jau buvo sukurtos bazinėje schemoje.


## v3.9 pakeitimai
- Sutvarkytas Supabase Storage „Invalid key“ klaidos atvejis.
- Į Storage kelią daugiau nededamas originalus failo pavadinimas.
- Lietuviškos raidės, tarpai, skliaustai ir kiti simboliai failo pavadinime nebeturėtų trukdyti įkėlimui.
- Originalus failo pavadinimas vis tiek saugomas duomenų bazėje ir rodomas mokytojui / mokiniui.
- Pataisymas pritaikytas mokymosi failams, mokytojo privačiai bibliotekai ir mokinių pateikiamiems darbams.
- Papildomo Supabase SQL šiai versijai nereikia.


## v3.10 pakeitimai
- Mokytojo ir administratoriaus viršutiniame meniu pridėta „Klausimų bankas“ skiltis.
- Joje rodomi visi `questions.js` praktikos klausimai.
- Matomi visi atsakymų variantai, teisingas atsakymas ir paaiškinimas.
- Galima filtruoti pagal temą, kategoriją ir sudėtingumą.
- Galima ieškoti pagal klausimo tekstą, atsakymus, ID ar paaiškinimą.
- Mokiniai šios skilties meniu nemato.
- Supabase SQL pakeitimų nereikia.


## v3.11 pakeitimai
- Bendras viršutinio meniu „Klausimų bankas“ pašalintas.
- Kiekviena tema mokytojo skiltyje dabar turi savo mygtuką „Klausimų bankas“.
- Prie mygtuko rodomas tos temos klausimų skaičius, kai klausimų yra.
- Atidarius banką rodomi tik konkrečios temos klausimai.
- Mokytojas / administratorius mato klausimą, visus atsakymų variantus, teisingą atsakymą, paaiškinimą, kategoriją ir sudėtingumą.
- Galima ieškoti ir filtruoti konkrečios temos banką.
- Temos be klausimų rodo aiškią tuščio banko būseną.
- Mokiniai šio valdymo mygtuko ir banko UI nemato.
- Supabase SQL pakeitimų nereikia.


## v4.0 – skirtingos temos kiekvienai klasei

Ši versija pakeičia temų architektūrą taip, kad kiekviena klasė gali turėti savo mokymosi temas.

Svarbiausia migracijos savybė: esama 11 klasės informacija nėra trinama ir nėra perkeliama į kitus ID. Dabartinėms klasėms į `class_topics` nukopijuojamas 11 klasės temų katalogas naudojant tuos pačius `topic_id`, todėl esami mokinių failai, užduotys, bandymai, pranešimai ir rezultatai lieka susieti kaip anksčiau.

Naujos klasės kūrime galima pasirinkti 10, 11, 12 klasę arba kitą programą. 11 klasė automatiškai gauna dabartinį temų šabloną. 10 ir 12 klasės pradeda nuo tuščio temų sąrašo; mokytojas klasėje per `Temos → + Nauja tema` susikuria reikalingas temas.

Temos pavadinimą, kodą, valandų skaičių, sritį ir emoji galima redaguoti nekeičiant techninio `topic_id`, todėl jau susieti duomenys išlieka.

Diegimo tvarka:
1. Supabase SQL Editor paleisti `supabase/PATCH_v4_0_CLASS_TOPICS_SAFE.sql`.
2. Tik gavus sėkmingą rezultatą į GitHub įkelti v4.0 failus.


## v4.1 – 10 klasės temų šablonas

10 klasė dabar automatiškai gauna šias šešias temas:
1. Skaitmeninio turinio kūrimas
2. Algoritmai ir programavimas
3. Duomenų tyryba ir informacija
4. Technologinių problemų sprendimas
5. Virtualioji komunikacija ir bendradarbiavimas
6. Saugus elgesys

Temų aprašymai sukelti pagal vartotojo pateiktą turinį. 11 klasės klasės, mokiniai, failai, užduotys, prisijungimai, aktyvumo istorija ir bandymų rezultatai nėra trinami. 11 klasės temoms išlaikomi tie patys `topic_id`.

`PATCH_v4_1_10_CLASS_TEMPLATE_SAFE.sql` yra pilnas, idempotentinis patchas: jį galima paleisti ir vietoje v4.0, ir po v4.0.


## v4.2 – klasės kūrimo RLS pataisymas

Klasė nebekuriama tiesioginiu `INSERT` iš naršyklės. Vietoje to naudojama `public.create_class(...)` SECURITY DEFINER funkcija, kuri pati patikrina, kad prisijungęs vartotojas yra mokytojas arba administratorius.

Tai pašalina `new row violates row-level security policy for table "classes"` klaidą, bet neatskleidžia papildomų teisių mokiniams.

`PATCH_v4_2_FULL_SAFE.sql` apima ir v4.1 10 klasės temų šabloną, todėl jį galima paleisti kaip vienintelį dabartinį patchą.
