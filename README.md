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
