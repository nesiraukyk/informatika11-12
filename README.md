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
