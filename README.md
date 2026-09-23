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
- Mokytojo aplinkoje matomas bendras pateiktų failų skaičius ir naujausi darbai.
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


## v4.3 – Mokytojo aplinkos UI pakeitimai
- Mokytojo navigacija ir pagrindinis puslapis vadinasi „Mokytojo aplinka“.
- Pasveikinimas: „Sveiki, Mokytojau.“.
- Pašalinta atskira klasių skaičiaus metrika.
- „Naujausi darbai“ sugrupuoti pagal klases ir išskleidžiami / suskleidžiami.
- Naujausių darbų eilutėse nebekartojamas klasės pavadinimas, failo pavadinimas ir data.
- Klasės mokinių lentelėje aiškiai atskiriami žinių treniruočių ir atsiskaitymų bandymai.
- Pašalinti neaiškūs rezultatų „Vidurkis“ ir „Geriausias“ stulpeliai; rodomas realių įvestų 1–10 pažymių vidurkis.
- „Pranešimai / nuorodos“ perkelti iš „Temos“ į „Užduotys ir darbai“.
- Prisijungimo forma neprašo naršyklės automatiškai pildyti prisijungimo duomenų, o laukų reikšmės po prisijungimo išvalomos.
- Supabase SQL pakeitimų šiai versijai nereikia.


## v4.4 – Mokytojo aplinkos grupavimas
- „Naujausiuose darbuose“ mokinio vardas ir užduoties / darbo pavadinimas vizualiai atskirti; darbo pavadinimas rodomas akcentine spalva.
- Sutvarkytas temų valdymo išdėstymas, kad mygtukai ir Tema / Praktika / Atsiskaitymas jungikliai nebesimėtytų į kelias atsitiktines eilutes.
- „Mokymosi failai“ sugrupuoti pagal temas ir išskleidžiami / suskleidžiami.
- „Užduotys ir darbai“ sugrupuoti pagal temas. Kiekvienos temos viduje yra pranešimai / nuorodos, mokytojo užduotys ir mokinių savarankiškai pateikti darbai.
- Pagrindiniame Mokytojo aplinkos lange prie kiekvienos klasės pridėtas „Mokinio vaizdas“ mygtukas.
- Supabase SQL pakeitimų šiai versijai nereikia.


## v4.5 – klausimų banko atsisiuntimas
- Temos klausimų banke mokytojas / administratorius turi mygtuką „Atsisiųsti visus klausimus“.
- Atsisiunčiamas UTF-8 CSV failas, tinkamas atidaryti su Excel / Google Sheets.
- Faile yra klausimo ID, tema, kategorija, sudėtingumas, visi atsakymo variantai, teisingas variantas, teisingas atsakymas ir paaiškinimas.
- Mokinys šio mygtuko nemato.
- Supabase SQL pakeitimų nereikia.


## v4.6 – grupės pavadinimo keitimas ir naršyklės „Atgal“
- Mokytojo aplinkos klasių / grupių sąraše prie pavadinimo yra tik pieštuko ikonėlė `✎`.
- Paspaudus ikonėlę galima pakeisti grupės pavadinimą.
- Naršyklės mygtukas „Atgal“ dabar grąžina ankstesnį veiksmą platformoje, o ne iškart išeina iš svetainės.
- Istorija veikia pagrindiniame mokytojo lange, klasės skirtukuose, klausimų banke, pranešimuose, mokinio vaizdo peržiūroje ir mokinio temose.
- Pagrindiniame platformos lange paspaudus „Atgal“ vartotojas nebeišmetamas iš svetainės.
- Supabase SQL pakeitimų šiai versijai nereikia.


## v4.7 – užduoties kūrimas tiesiai temos grupėje
- Kiekvienoje išskleistoje temos grupėje pridėtas aiškus „+ Nauja užduotis“ mygtukas.
- Paspaudus jį tema parenkama automatiškai.
- Nauja užduotis iškart sukuriama kaip atidaryta mokiniams (`is_open=true`).
- Mokiniai prie užduoties gali įkelti vieną ar kelis failus.
- Bendras viršutinis „+ Nauja užduotis“ mygtukas paliktas.
- Supabase SQL pakeitimų nereikia.


## v4.8 – automatinis atsijungimas ir vektorinių failų pateikimas
- Visi vartotojai automatiškai atjungiami po 30 min. neaktyvumo.
- Po 25 min. neaktyvumo parodomas perspėjimas, kad liko 5 min.
- Pelės paspaudimas, klaviatūra, lietimas, įvedimas ar slinkimas pratęsia sesiją.
- Studentų failų įkėlimui aiškiai palaikomi SVG, AI, EPS, CDR, DXF, WMF ir EMF.
- Failams, kurių naršyklė neatpažįsta, priskiriamas saugus `application/octet-stream` MIME tipas.
- Reikia paleisti `PATCH_v4_8_VECTOR_UPLOAD.sql`, kad `student-submissions` bucket neturėtų MIME whitelist, bet liktų privatus.
- Vieno failo limitas lieka 25 MB.


## v4.9 – neaktyvumo laikas išlieka po puslapio perkrovimo
- 30 min. neaktyvumo terminas dabar saugomas naršyklėje ir nenusinulina paspaudus Refresh / F5.
- Uždarius skirtuką ir vėliau vėl atidarius svetainę, ankstesnė sesija taip pat bus užbaigta, jei nuo paskutinio realaus veiksmo praėjo 30 min.
- Keli tos pačios svetainės skirtukai naudoja bendrą paskutinio aktyvumo laiką.
- Tik realus vartotojo veiksmas (paspaudimas, klaviatūra, lietimas, įvedimas, slinkimas) pratęsia neaktyvumo laiką.
- Po 25 min. lieka 5 min. perspėjimas.
- Supabase SQL pakeitimų nereikia.

## v5.1 – 10 klasės BP klausimų blokai
- v5.0 diegti nereikia; ši versija skirta tiesiai po v4.9.
- 10 klasės „Skaitmeninio turinio kūrimas“ temoje įdiegiami 4 klausimų blokai ir 100 pradinių klausimų.
- Mokytojas savo klasėje atskirai įjungia / išjungia blokus bei gali pridėti, redaguoti ir trinti klausimus.
- Mokinys mato tik mokytojo įjungtus blokus. Jei įjungtas vienas – gauna vieną treniruotės pasirinkimą; jei keli – gali pasirinkti vieną, kelis arba „Visas skyrius“.
- 11 klasės dabartinis klausimų bankas neliečiamas.

## v5.2 – 11 klasės vektorinės grafikos klausimų banko papildymas
- 11 klasės „Vektorinės grafikos ypatumai, vektorinės grafikos failų formatai“ praktikos bankas padidintas nuo 65 iki 90 klausimų.
- Papildyta BP rekomendacijose aiškiai minimais aspektais: PS, WMF, EPS, fono permatomumas, grynos spalvos ir gradientai, teksto panaudojimas, importas / eksportas, kompozicija, forma ir erdvė, simetrija / asimetrija, maketo tankis, kontrastas ir objektų tarpusavio derinimas.
- Supabase SQL pakeitimų nereikia.


## v5.3 – subalansuota 11 klasės praktika ir saugus atsiskaitymas
- 11 klasės vektorinės grafikos praktikos bankas: 120 klausimų (90 vieno pasirinkimo + 30 kelių tipų).
- 10 klausimų praktika parenkama subalansuotai pagal kategorijas, sunkumą ir klausimo tipą.
- Saugus 11 klasės atsiskaitymo bankas laikomas Supabase: 100 klausimų, 4 tipai (vienas atsakymas, keli atsakymai, „kuris netinka“, sujungimas).
- Mokytojas prieš atidarydamas atsiskaitymą pasirenka 5–30 klausimų (numatyta 30).
- Atsiskaitymo trukmę skaičiuoja serveris; fiksuojami skirtuko/langų paslėpimo, fokuso praradimo, puslapio išėjimo ir nebaigto uždarymo įvykiai.
- Mokytojo mokinio detalėse atsiskaitymo eilutė turi mygtuką „Peržiūrėti“ su trukme, rezultatu, išėjimų laiku ir visais atsakymais.
- Atsiskaitymo teisingi atsakymai pradžioje į naršyklę nesiunčiami; vertinimas vyksta serverio RPC.
- REIKIA paleisti `PATCH_v5_3_BALANCED_PRACTICE_SECURE_ASSESSMENT.sql` ir tada įkelti v5.3 GitHub failus.


## v5.4 – vienas atsiskaitymo bandymas ir aiškus rezultatų langas
- 11 klasės temos atsiskaitymą kiekvienas mokinys gali atlikti tik vieną kartą.
- Jei pradėtas bandymas nutrūksta ar puslapis perkraunamas, naujas bandymas nekuriamas – tęsiamas tas pats.
- Jau išsaugotų atsakymų nebegalima perrašyti.
- Mokytojo klasės lange pridėta aiški skiltis „Atsiskaitymų rezultatai“.
- Joje rodoma būsena, rezultatas, trukmė, išėjimų iš testo lango / fokuso praradimų skaičius ir mygtukas „Peržiūrėti atsakymus“.
- SQL: paleisti tik PATCH_v5_4_SINGLE_ATTEMPT_ASSESSMENT_RESULTS.sql, jei v5.3 SQL jau buvo paleistas.

## v5.5 – lygiaverčiai atsiskaitymai, uždelsti mokinio rezultatai, prisijungę dabar
- 11 klasės vektorinės grafikos atsiskaitymas naudoja 30 balanso pozicijų. Standartiniame 30 klausimų teste kiekvienam mokiniui tenka tiksliai 12 vieno atsakymo, 8 kelių atsakymų, 6 „kuris netinka“ ir 4 sujungimo klausimai; 9 lengvi, 15 vidutinių ir 6 sunkesni.
- Kiekvienas balanso slotas turi 8 lygiaverčius klausimo variantus. Todėl mokiniai gauna tą patį turinio ir sunkumo karkasą, bet ne būtinai tuos pačius klausimus.
- Mokinys atsiskaitymo balą, teisingus atsakymus ir savo atsakymų peržiūrą pamato tik tada, kai visi dabartiniai klasės mokiniai yra užbaigę tą atsiskaitymą.
- Mokytojas atsiskaitymo rezultatus, laiką, fokuso / išėjimo įvykius ir atsakymus mato iš karto.
- Mokytojo pradžios lange rodoma „Prisijungę dabar“, o klasės mokinių lentelėje – dabartinė būsena ir veikla. Online laikomas aktyvumas per paskutines 90 s.; būsena atnaujinama kas 15 s.
- Reikalingas `PATCH_v5_5_FAIR_ASSESSMENT_DELAYED_RESULTS_ONLINE.sql`.


## v5.6 – 30 klausimų subalansuotas atsiskaitymas
- 11 klasės vektorinės grafikos standartinis atsiskaitymas pakeistas į 30 klausimų.
- Mokytojo nustatymuose numatyta 30; galima rinktis 5–30.
- 30 klausimų forma turi 30 atskirų balanso pozicijų; nė viena pozicija tame pačiame teste nesikartoja.
- Kiekvienai pozicijai yra 8 lygiaverčiai variantai: 30 × 8 = 240 saugių atsiskaitymo klausimų.
- 30 klausimų struktūra: 12 vieno atsakymo, 8 kelių atsakymų, 6 „kuris netinka“, 4 sujungimo; 9 lengvi, 15 vidutinių ir 6 sunkesni.
- Ankstesnė vieno bandymo taisyklė, uždelstas rezultatų rodymas, laiko / išėjimų fiksavimas ir prisijungusių mokinių stebėjimas išlieka.


## v5.7 – mokytojo leidžiamas pakartotinis atsiskaitymas
- Pagal nutylėjimą mokinys vis dar turi vieną atsiskaitymo bandymą.
- Skiltyje „Atsiskaitymų rezultatai“ mokytojas gali konkrečiam mokiniui paspausti „Leisti pakartoti“.
- Vienu paspaudimu atrakinamas tik vienas kitas bandymas; pakartotinis paspaudimas prieš jį atliekant papildomo limito neprideda.
- Ankstesni bandymai ir jų rezultatai lieka istorijoje.
- Naujam bandymui pirmiausia parenkami anksčiau tam mokiniui nerodyti to paties balanso slotų klausimų variantai.
- Mokinio kortelėje aiškiai rodoma, kai mokytojas leido pakartotinį bandymą.
- Mokinį pašalinant iš klasės nauju mygtuku, ištrinami visi jo tos klasės praktikos ir atsiskaitymų bandymai (kartu su atsakymais, laiku ir fokuso įvykiais). Pateikti failai ir Auth paskyra lieka.
- Reikia paleisti `PATCH_v5_7_RETRY_AND_STUDENT_CLEANUP.sql` po v5.6.

## v5.8 – atsiskaitymo UX ir automatinis išsaugojimas
- Mokytojo lentelėje prie mokinio rodoma tik „Prisijungęs“, be dabartinės vietos / veiklos teksto.
- Baigus atsiskaitymą mokiniui rodoma neutrali žinutė „Rezultatas bus paskelbtas vėliau“.
- Pasirinktas atsakymas atsiskaityme aiškiai paryškinamas.
- Atsiskaitymo atsakymus galima keisti iki galutinio darbo pateikimo.
- Nebereikia spausti „Patvirtinti atsakymą“ po kiekvieno klausimo: pasirinkimas išsaugomas automatiškai.
- Atsakymai saugomi Supabase iš karto ir papildomai lokaliai tame pačiame įrenginyje, todėl netyčia perkrovus puslapį tęsiamas tas pats bandymas.
- Atsiskaityme pridėti „Ankstesnis“, „Kitas“ ir 1–30 klausimų navigatorius; atsakyti klausimai pažymimi.
- Mygtukas „Išeiti“ nebaigia atsiskaitymo: išėjimas užfiksuojamas, o mokinys gali tęsti tą patį bandymą vėliau.
- Galutinis pateikimas lieka atskiras veiksmas ir po jo atsakymų keisti nebegalima.

## v5.9 – atsakymo pažymėjimo ir SVG klausimų pataisymai
- Neatsakytame vieno pasirinkimo klausime nebepažymimas pirmasis / teisingas variantas.
- Grįžus į jau atsakytą klausimą, mokinio pasirinkimas ir toliau rodomas pažymėtas.
- Pataisyti 8 SVG balanso pozicijos variantai, kad klausimas ir atsakymų tipas sutaptų (pvz. plėtinys -> .svg).
- Oficialūs formatų pavadinimai gali likti anglų kalba tik ten, kur tikrinama santrumpos reikšmė.
- Jau užbaigti arba atsakyti istoriniai klausimai neperrašomi; pataisomi tik dar neatsakyti aktyvių bandymų klausimai.

## v5.10 – kompaktiškesnė mokytojo rezultatų lentelė ir studento pastabų dizainas
- Atsiskaitymų rezultatų lentelėje ilga temos antraštė rodoma vienoje eilutėje su daugtaškiu.
- Paspaudus temos pavadinimą jis išsiskleidžia pilnai, neplatinant visos lentelės.
- Mokinio temos puslapyje „Pranešimai ir nuorodos“ pakeisti į vizualiai atskirą „Mokytojo pastabos“ bloką.
- Pastabos ir nuorodos aiškiai atskiriamos pagal tipą, pateikiamos kompaktiškiau ir nebeatrodo kaip pagrindinės mokymosi kortelės.
- Tas pats vaizdas rodomas ir mokytojo „Mokinio vaizdas“ peržiūroje.
- Supabase SQL pakeitimų nereikia.

## v5.11 – dviejų dalių 11 klasės atsiskaitymas
- Vektorinės grafikos atsiskaitymas gali būti padalintas į I dalį (teorijos testas) ir II dalį (logotipo kūrimas).
- Po teorijos pateikimo teorijos atsakymai užrakinami, o mokinys pereina į praktinę dalį.
- Praktinėje dalyje išėjimai iš naršyklės nefiksuojami, nes mokinys turi dirbti „Inkscape“ ar kita grafikos programa.
- Privalomi du failai: SVG originalas ir PNG peržiūra. Abu išsaugomi privačiame `student-submissions` bucket'e.
- Galutinis atsiskaitymo pateikimas galimas tik įkėlus SVG ir PNG.
- Mokytojas rezultatų lange mato PNG peržiūrą, gali atsisiųsti abu failus ir vertina logotipą pagal 10 taškų rubriką: objektai/formos 2, Bezjė 2, užpildas/kontūras/gradientas 2, tekstas 1, kompozicija 2, SVG+PNG 1.
- Bendras procentas skaičiuojamas iš teorijos taškų + praktinės dalies taškų (pvz. 30+10=40 t.).
- Mokinys rezultatą ir teisingus teorijos atsakymus mato tik kai klasė baigė atsiskaitymą ir mokytojas įvertino jo praktinę dalį.
- Pašalinant mokinį iš klasės, jo atsiskaitymo SVG/PNG failai taip pat išvalomi; įprastų užduočių failai neliečiami.

## v5.12 – praktinę dalį galima pateikti ir be failų
- SVG ir PNG išlieka rekomenduojami praktinės užduoties failai, bet nebėra techninė pateikimo sąlyga.
- „Pateikti visą atsiskaitymą“ visada aktyvus.
- Jei trūksta SVG ir/ar PNG, mokinys gauna aiškų perspėjimą ir gali pasirinkti „Atšaukti“ arba vis tiek pateikti.
- Po pateikimo failų keisti ar papildomai įkelti nebegalima.
- Mokytojas mato, kokie failai buvo pateikti, ir rubrikos kriterijų „Tinkamai pateikti SVG + PNG“ gali vertinti atitinkamai.

## v5.13 – sunkesnis ir įvairesnis 11 klasės atsiskaitymas
- 30 teorijos klausimų balansas: 6 lengvi, 16 vidutinių, 8 sunkesni.
- Daugiau realių situacijų ir kelių žingsnių sprendimų.
- 4 vaizdų analizės klausimų pozicijos (Bezjė schema, vektorius / rastras, kompozicija, gradientas).
- 3 eiliškumo klausimų pozicijos.
- 2 trumpų 1–2 sakinių atsakymų pozicijos su automatiniu esminių sąvokų patikrinimu.
- Išlieka vieno atsakymo, kelių atsakymų, „kuris netinka“ ir sujungimo klausimai.
- Atsakymai kaip ir anksčiau automatiškai saugomi, iki I dalies pateikimo juos galima keisti.
- II dalies logotipo praktinė užduotis lieka atskira ir nekeičiama.

## v5.14 – motyvacinė sistema mokiniams
- XP skiriamas tik už užbaigtas „Žinių treniruotes“, ne už atsiskaitymus.
- 7 lygiai: Pradedantysis, Smalsuolis, Tyrinėtojas, Pažengęs, Žinovas, Ekspertas, Meistras.
- Ženkliukai, mokymosi dienų serija, savaitės tikslas (3 treniruotės), dienos misija.
- Temos įvaldymas skaičiuojamas pagal paskutines iki 5 tos temos treniruočių.
- Bendras klasės savaitės iššūkis be viešo mokinių reitingo.
- Po treniruotės iškart rodoma, kiek XP gauta ir kaip pasikeitė progresas.
- Apsauga nuo XP „farminimo“: kartojant tą pačią temą tą pačią dieną vėlesni bandymai duoda mažiau XP.
- Sistema progresą paskaičiuoja ir iš anksčiau užbaigtų praktikų; duomenys nedubliuojami atskiroje XP lentelėje.
- Į ZIP įtraukti `CNAME` (`ngg-informatika.lt`) ir `.nojekyll`, kad GitHub Pages domeno nustatymai nedingtų keičiant versiją.

## v5.15 – motyvacinės sistemos valdymas mokytojui
- Klasės puslapyje atsirado skiltis `🎯 Motyvacija`.
- Mokytojas gali įjungti / išjungti sistemą visai klasei.
- Kiekvienam mokiniui galima pasirinkti: `Pagal klasės nustatymą`, `Įjungti šiam mokiniui`, `Išjungti šiam mokiniui`.
- Individualus nustatymas turi pirmenybę prieš klasės nustatymą.
- Po v5.15 motyvacija klasėms pagal nutylėjimą išjungta, todėl galima testuoti tik su pasirinktu demo mokiniu.
- Kai sistema mokiniui išjungta, jis nemato XP kortelės, `Pasiekimų`, temos įvaldymo ir XP atlygio po treniruotės. Pačios žinių treniruotės nesikeičia.
- Vėliau įjungus sistemą progresas perskaičiuojamas iš jau atliktų treniruočių.
- `CNAME` (`ngg-informatika.lt`) ir `.nojekyll` išlieka ZIP.

## v5.16 – motyvacinės sistemos tekstų ir rodiklių aiškumas
- Pašalintas tekstas „Čia nėra mokinių reitingo“.
- Pašalinta „Geriausia treniruotė“ kortelė.
- „Savaitės tikslas“ aiškiau rodomas kaip „treniruotės šią savaitę“.
- Pasiekimų puslapyje paaiškinta, kad 0/3 reiškia 0 iš 3 savaitės treniruočių.
- „XP farminti“ tekstas pakeistas neutraliu paaiškinimu apie mažėjantį XP už tos pačios temos kartojimą tą pačią dieną.
- Užrakinti pasiekimai dabar rodo savo pavadinimą ir atrakinimo sąlygą, vietoje „???“.
- Supabase SQL pakeitimų nereikia.

## v5.17 – ilgalaikiai apdovanojimai, klasė ir privilegijos
- Nauji ilgalaikiai pasiekimai už 10, 20, 30, 50, 100, 200, 300, 500 ir 1000 užbaigtų žinių treniruočių.
- Šie skaičiai sumuojami per visas mokymosi temas; oficialūs atsiskaitymai neskaičiuojami.
- Kai mokytojas leidžia, mokinys mato skiltį `👥 Klasė` su klasės draugų vardais ir jų ilgalaikio statuso ženkliukais.
- Klasės draugams nerodomi XP, pažymiai ar atsiskaitymų rezultatai.
- Mokinys gali pasirinkti vieną jau atrakintą ilgalaikį ženkliuką, rodomą prie jo vardo; nepasirinkus automatiškai naudojamas aukščiausias.
- Įdiegta pirmoji privilegijų sistema: kosmetinės aplinkos temos, atrakinamos ties 10 / 20 / 30 / 50 / 100 / 200 / 300 / 500 / 1000 treniruočių ribomis.
- Mokytojo `🎯 Motyvacija` skiltyje pridėti jungikliai: rodyti klasės draugus, rodyti statuso ženkliukus, leisti kosmetines temas.
- Visi nauji elementai mokiniui rodomi tik tada, kai jam įjungta motyvacinė sistema.
- `CNAME` (`ngg-informatika.lt`) ir `.nojekyll` išlieka ZIP.

## v5.18 – aiškesnės eiliškumo situacijos
- Pakeistos tik 11 klasės vektorinės grafikos eiliškumo užduotys (pozicijos 11, 17 ir 28).
- Ilgi ir dviprasmiški sakiniai pakeisti trumpais, konkrečiais veiksmais.
- Naujo logotipo seka: sukurti → sutvarkyti → išsaugoti SVG → eksportuoti PNG.
- Esamo logotipo atnaujinimas: atidaryti SVG → pakeisti → išsaugoti SVG → eksportuoti PNG.
- Galutinio failo parengimas internetui: baigti redaguoti → išsaugoti SVG → eksportuoti PNG → patikrinti PNG.
- Kiti v5.17 klausimai, motyvacinė sistema ir sąsaja nekeisti.
- Jau pradėti atsiskaitymai lieka su savo ankstesniais klausimų snapshot'ais; nauji bandymai naudos v5.18 formuluotes.
