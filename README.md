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
