# Tinklų laboratorijos: II ir III etapų techninis planas

2026-11-25. Tai būsimo darbo planas, ne įgyvendintų funkcijų sąrašas. II etapas pradedamas tik po naudotojo I etapo peržiūros ir patvirtinimo. Publikavimas į veikiančią svetainę tvirtinamas atskirai.

## Bendras pagrindas

I etapo kodas yra `learning-materials/tinklai/tyrimas/`. Plėsti esamą darbo aplinką, išlaikant penkis mokymosi etapus, įrenginių piktogramas, būsenų spalvas, klaviatūros alternatyvas, bandymų istoriją ir atskirą objektyvų bei subjektyvų vertinimą.

| Esamas modulis | Paskirtis ir plėtra |
| --- | --- |
| `devices.mjs`, `engine.mjs` | Įrenginiai, prievadai, L2 pasiekiamumas, tiesioginis /24 maršrutizavimas, DHCP, vardų ir IP patikrų skirtumas. Naujų paslaugų modeliai turi remtis šia būsena. |
| `packet-engine.mjs` | Deterministinis virtualaus laiko modelis, perdavimo būsenos ir įvykių žurnalas. Naudoti procesų žingsniavimui, nesieti virtualaus laiko su animacijos greičiu. |
| `*-missions.mjs` | Situacijos, tikslai, teorija, hipotezės, trijų lygių užuominos, 3–5 klausimai, perkėlimas į naują situaciją ir gebėjimai. |
| `assessment.mjs` | Funkcinių sąlygų ir eksperimentinių įrodymų vertinimas; nepririšti sėkmės prie vieno brėžinio. |
| `progress.mjs`, `restore.mjs` | Vietiniai įrašai ir jų patikra. Keičiant formatą pridėti aiškią versijų migraciją, atskirus testus ir senų duomenų skaitymo galimybę. |
| `learning-ui.mjs`, `studio.css` | Vienoda mokymosi eiga, savikontrolė, rekomendacijos ir įsivertinimas. Naujos laboratorijos įjungiamos per `LABS`, `MISSIONS` ir `app.mjs`. |

Kiekvienos naujos laboratorijos darbus atlikti atskiroje `codex/` šakoje nuo patvirtintos versijos. Pirmiausia įgyvendinti vieną jos visą veiklą su logikos testais ir naršyklės patikra, tik tada pridėti likusius scenarijus. Tarpinius funkcionalius rezultatus fiksuoti vietiniais Git commit.

## II etapas

### 4. DNS ir svetainės atidarymas

Nauji moduliai: `web-engine.mjs`, `web-ui.mjs`, `web-missions.mjs`. Būsenos: naršyklės adresas, virtuali DNS talpykla su galiojimu, išgalvota DNS zona, TCP/TLS/HTTP eiga, serverio būsena ir HTTP atsakymas. Domenai tik `.example`; adresai iš dokumentacinių intervalų. Jokio tikro `fetch`, DNS ar tinklo patikrų.

Procesas: talpykla → DNS užklausa → IP → ryšys → TLS, jei HTTPS → HTTP užklausa → atsakymas → puslapis. Leisti sustoti kiekviename žingsnyje, peržiūrėti perduodamus mokomuosius laukus ir palyginti šaltą bei šiltą talpyklą. Išplėstiniame paaiškinime atskirti rekursinį, šakninį, TLD ir autoritetingąjį serverį.

Šešios veiklos: neveikiantis DNS, talpyklos įrašas, nepasiekiamas serveris, HTTP ir HTTPS pasirinkimas, neegzistuojantis vardas, HTTP 404. URL schema, domenas, kelias, parametrai ir fragmentas turi būti analizuojami atskirai; fragmentas nesiunčiamas HTTP serveriui.

Priėmimo testai: talpyklos pataikymas nekuria naujos DNS užklausos; pasibaigęs galiojimas ją sukuria; NXDOMAIN atskiriamas nuo nepasiekiamo DNS; 404 nevadinamas DNS klaida; TLS žingsnis priklauso nuo schemos; nepasiekiamas IP sustabdo procesą anksčiau už HTTP. Kiekviena veikla turi naują praktinį savikontrolės atvejį.

### 5. Wi-Fi signalo tyrimas

Nauji moduliai: `wifi-engine.mjs`, `wifi-ui.mjs`, `wifi-missions.mjs`. SVG patalpų planas su trimis klasėmis, koridoriumi, sienomis, baldais, klientais ir AP. AP judinamas pele arba pasirenkant koordinates / padėties mygtukus. Šilumos žemėlapis ir klientų tekstinės kokybės etiketės turi rodyti tą pačią būseną.

Deterministinis modelis: bazinis signalo lygis minus atstumo ir kertamų sienų slopinimas; atskiri mokomieji 2,4 ir 5 GHz parametrai, trukdžių dydis ir AP skaičius. Riboti skaičiavimų tinklelį, perskaičiuoti tik pasikeitus geometrijai ar parametrams. Koeficientus bei ribas aiškiai įvardyti kaip mokomąją aproksimaciją, ne pastato radijo ryšio prognozę.

Šešios veiklos: trijų klasių aprėptis, geriausia vieno AP vieta, dažnių palyginimas, kelių sienų poveikis, papildomas AP, ribotas įrangos kiekis. Išsaugoti bent du mokinio bandymus palyginimui. Vertinti pasiektus aprėpties reikalavimus ir argumentus, ne vieną pageidaujamą AP tašką.

Priėmimo testai: esant vienodoms kitoms sąlygoms papildomas atstumas ar siena negali pagerinti apskaičiuoto signalo; dažnio ir trukdžių pokyčiai turi veikti rezultatą; papildomas AP nevertinamas vien už pridėjimą; vienodi nustatymai duoda vienodus rezultatus; žemėlapis suprantamas be spalvų.

### 6. Tinklo administratorius

Nauji moduliai: `diagnostic-engine.mjs`, `diagnostic-ui.mjs`, `diagnostic-missions.mjs`. Sukurti 12 atskirų scenarijų: kabelis, komutatoriaus maitinimas, maršrutizatorius, IP konfliktas, IP potinklis, šliuzas, DNS, DHCP, tiekėjas, Wi-Fi stiprumas, vienas serveris, netinkamas pasirinktas tinklas.

Virtualūs `ipconfig`, `ping`, `nslookup`, `tracert` išvedami iš bendro tinklo ir paslaugų modelio. Nevykdyti operacinės sistemos komandų. Tyrimo žurnalas saugo pasirinktą įrankį, tikslą, konfigūracijos pakeitimus ir stebėjimus. Gedimo priežastis neatskleidžiama pradžioje; bendri požymiai gali turėti kelias pagrįstas diagnozes.

Priėmimo testai: bent dvi nepriklausomos diagnostikos patikros pagrindžia išvadą; taisymas tikrai pakeičia būseną; vienas nepavykęs ping nėra laikomas įrodymu, kad įrenginys išjungtas; DNS ir HTTP gedimai atskiriami; galima atkurti pradžią neprarandant kitų veiklų pažangos.

II etapo pabaigoje: pakartoti visus I etapo testus, naujų modelių testus, visas penkių etapų eigas, klaviatūros ir mobilią peržiūrą. Pateikti realias ekrano nuotraukas ir peržiūros ataskaitą. Prie III etapo pereiti po atskiros rezultatų peržiūros.

## III etapas

### 7. HTTP ir HTTPS

Nauji `tls-engine.mjs`, `tls-ui.mjs`, `tls-missions.mjs`; panaudoti II etapo naršyklės būsenas. Trys dalyviai: siuntėjas, gavėjas, tinklo stebėtojas. Siunčiami tik išgalvoti duomenys; jokių slaptažodžių laukų ar tikro paketų perėmimo.

HTTP atveju parodyti skaitomą mokomąjį turinį. HTTPS atveju turinys slepiamas, tačiau atskirai parodyti galimus matomus ryšio metaduomenis ir jų prielaidas: IP, trukmę, dydį; domeno matomumas priklauso nuo DNS ir TLS nustatymų. Sertifikatas aiškinamas kaip serverio tapatybės ir ryšio apsaugos mechanizmo dalis. HTTPS neskelbti svetainės sąžiningumo garantija. Susieti su esama viešojo ir privataus rakto tema, paaiškinti simetrinio sesijos rakto vaidmenį.

Testai: HTTPS nerodo mokomojo slapto turinio stebėtojui; HTTP rodo; sertifikato klaida turi savą būseną; HTTPS nepanaikina visų metaduomenų; privatūs raktai nerodomi kaip viešai perduodami.

### 8. Protokolų valdymo centras

Nauji `protocol-engine.mjs`, `protocol-ui.mjs`, `protocol-missions.mjs`. Veiklos: svetainė, failo įkėlimas, laiško siuntimas, laiškų atsiuntimas, pašto sinchronizavimas, saugus failas, belaidės ausinės. Įtraukti HTTP, HTTPS, FTP, FTPS, SMTP, POP3, IMAP, DNS ir Bluetooth.

Modeliuoti programos tikslą, protokolo funkciją ir atskirą šifravimo nustatymą. SMTP/POP3/IMAP neklasifikuoti kaip visada nešifruotų; FTP ir FTPS, taip pat FTPS ir SFTP, nesuplakti. Bluetooth parodyti kaip kitokio ryšio technologiją, ne kaip TCP/IP programos protokolą. Testuoti tinkamą funkciją, šifravimo sąlygas ir rezultatą, priimant kelis techniškai pagrįstus sprendimus.

### Baigiamasis mokyklos tinklo projektas

Nauji `school-missions.mjs`, `school-ui.mjs`, įrangos mokomųjų kainų lentelė. Trys klasės, mokytojų kambarys, biblioteka, spausdintuvai, serveris, laidiniai ir belaidžiai klientai bei tiekėjas. Sujungti I etapo konstruktorių, IP, II etapo Wi-Fi aprėptį ir diagnostiką.

Vertinti biudžetą, konkrečių klientų vietinį ir išorinį pasiekiamumą, aprėptį, adresų unikalumą, funkcinių testų įrodymus ir paaiškinimą. Tinkamų topologijų gali būti daug. Netikėtas gedimas parenkamas iš atkuriamo scenarijų rinkinio; išlaikyti projekto kopiją prieš gedimą. Jokių tikrų pirkimų, eurų mokėjimų ar mokamų paslaugų.

### Bendra pažanga ir baigiamasis testas

Išplėsti dabartinę vietinę pažangą iki visų laboratorijų gebėjimų suvestinės. Objektyvūs praktikos ir savikontrolės įrodymai išlieka atskirti nuo savijautos įvertinimų. Trūkstamų įrodymų nežymėti kaip įgytų gebėjimų.

Sukurti 24–28 autorinių VBE tipo klausimų baigiamąjį testą: įranga ir LAN/WAN; IP/TCP/UDP; DNS ir interneto paslaugos; Wi-Fi; saugumas; diagnostika; projektavimo argumentai. Naudoti schemas ir scenarijus, lygiaverčių kartojimo variantų banką, aiškius atvirų atsakymų kriterijus. Dabartinis senesnio modulio 30 klausimų bankas išlieka; jis nėra pristatomas kaip jau įgyvendintas naujas visų aštuonių laboratorijų egzaminas.

Testuoti perskaičiavimą keičiant atsakymus, tuščius bandymus, vietinės saugyklos gedimą, senos versijos migraciją, atskirą veiklos atkūrimą, skirtingus lygiaverčius variantus ir konkrečias pakartojimo rekomendacijas. Nė vienas rezultatas neblokuoja mokymosi.

## Publikavimo ir grįžimo tvarka

1. Užfiksuoti patvirtintą pradinį Git commit ir švarią darbo būseną; neištrinti naudotojo pakeitimų.
2. Kiekvieną etapą rengti atskiroje šakoje, pateikti failų diff, testų įrodymus ir vietinę peržiūrą.
3. Prieš publikavimą atskirai patvirtinti konkretų commit ir tikslinę aplinką. `main` ir veikiančios svetainės nekeisti vien gavus leidimą pradėti etapą.
4. Publikuojant išsaugoti ankstesnio diegimo / commit identifikatorių ir patikrinti grįžimo kelią. Šie statiniai moduliai neturi reikalauti DB migracijų ar mokinių įrašų keitimo.
5. Supabase sinchronizavimas nėra šio plano prielaida. Jeigu vėliau jo reikės, parengti atskirą duomenų ir leidimų projektą, sintetinę testavimo aplinką, migracijų testus ir gauti atskirą patvirtinimą prieš produkcinius veiksmus.
