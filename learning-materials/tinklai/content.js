/* Generated from the supplied student material; learning self-check only. */
window.NGG_NETWORK_CONTENT={
  "version": 1,
  "lessons": [
    {
      "number": 1,
      "title": "Kam reikalingi kompiuterių tinklai?",
      "html": "<h3>Teorija</h3><p>Kompiuterių tinklas – tarpusavyje sujungtų įrenginių sistema, leidžianti perduoti duomenis ir naudotis bendrais ištekliais. Tinkle gali veikti kompiuteriai, telefonai, spausdintuvai, serveriai, televizoriai ir kiti įrenginiai. Tinklai leidžia dalytis failais, naudotis bendru spausdintuvu, bendrauti, dirbti su nutolusiais serveriais ir pasiekti interneto paslaugas. Tinklui veikti internetas nėra būtinas: du vietiniame tinkle esantys kompiuteriai gali bendrauti ir be išorinio ryšio.</p><div class=\"table-scroll\" tabindex=\"0\" role=\"region\" aria-label=\"Mokomosios medžiagos lentelė\"><table><thead><tr><th scope=\"col\">Sąvoka</th><th scope=\"col\">Paskirtis</th><th scope=\"col\">Pavyzdys</th></tr></thead><tbody><tr><td>LAN (Local Area Network)</td><td>Vietinis tinklas ribotoje teritorijoje</td><td>Mokyklos kompiuterių kabinetas</td></tr><tr><td>WAN (Wide Area Network)</td><td>Ryšys tarp geografiškai nutolusių tinklų</td><td>Įmonės filialų tinklai skirtinguose miestuose</td></tr><tr><td>Internetas</td><td>Pasaulinis tarpusavyje sujungtų tinklų tinklas</td><td>Interneto paslaugų pasiekimas iš įvairių šalių</td></tr><tr><td>WWW (žiniatinklis)</td><td>Viena internetu teikiamų paslaugų, susijusi su tinklalapiais</td><td>Svetainės atvėrimas naršyklėje</td></tr></tbody></table></div><p>Internetas nėra tas pats, kas WWW. Elektroninis paštas ir kitos interneto paslaugos gali veikti nepriklausomai nuo žiniatinklio. Wi-Fi yra belaidžio ryšio technologija, o ne interneto sinonimas. Prie Wi-Fi galima prisijungti net tuomet, kai ryšys su interneto tiekėju nutrūkęs.</p><h3>Kaip įrenginiai sujungiami?</h3><div class=\"table-scroll\" tabindex=\"0\" role=\"region\" aria-label=\"Mokomosios medžiagos lentelė\"><table><thead><tr><th scope=\"col\">Ryšio priemonė</th><th scope=\"col\">Savybės ir naudojimas</th></tr></thead><tbody><tr><td>Ethernet</td><td>Dažnai naudojamas laidinis LAN ryšys. Paprastai stabilus, tinkamas stacionariems kompiuteriams.</td></tr><tr><td>Wi-Fi</td><td>Belaidis ryšys vietiniame tinkle. Patogus mobiliems įrenginiams; signalą veikia atstumas, kliūtys ir trukdžiai.</td></tr><tr><td>Šviesolaidis</td><td>Duomenys perduodami šviesos signalais. Tinka didelės spartos ir ilgesnio atstumo ryšiui.</td></tr><tr><td>4G / 5G</td><td>Mobiliojo tinklo ryšys; tinka ten, kur laidinė interneto prieiga nepatogi arba neprieinama.</td></tr><tr><td>Bluetooth</td><td>Paprastai nedidelio atstumo ryšys tarp įrenginių, pavyzdžiui, kompiuterio ir ausinių.</td></tr></tbody></table></div><p>Ryšio technologiją renkamės pagal įrenginio mobilumą, aprėptį, stabilumą, spartą, kainą ir saugumo poreikį. Laidinis ryšys nėra automatiškai saugus, o belaidis – automatiškai nesaugus.</p>",
      "goals": [
        "Atskirti LAN, WAN, internetą ir WWW.",
        "Parinkti ryšio priemonę pagal situaciją."
      ],
      "terms": [
        "LAN",
        "WAN",
        "internetas",
        "WWW",
        "Ethernet",
        "Wi-Fi",
        "Bluetooth"
      ],
      "reflection": "kodėl telefonas gali rodyti prisijungimą prie Wi-Fi, tačiau naršyklė neįkelia svetainės?"
    },
    {
      "number": 2,
      "title": "Tinklo įranga ir tinklo kūrimas",
      "html": "<h3>Teorija</h3><p>Tinklo įranga atlieka skirtingas funkcijas. Buitiniuose įrenginiuose kelios funkcijos dažnai sujungtos į vieną korpusą, tačiau mokantis svarbu jas atskirti.</p><div class=\"table-scroll\" tabindex=\"0\" role=\"region\" aria-label=\"Mokomosios medžiagos lentelė\"><table><thead><tr><th scope=\"col\">Įranga</th><th scope=\"col\">Paskirtis</th></tr></thead><tbody><tr><td>Modemas</td><td>Pritaiko signalus prie interneto prieigos technologijos, pvz., kabelinės ar DSL linijos.</td></tr><tr><td>ONT</td><td>Šviesolaidinio tinklo galinis įrenginys; sujungia optinę prieigą su vartotojo tinklo įranga.</td></tr><tr><td>Šakotuvas (hub)</td><td>Gautus fizinio lygmens signalus kartoja į kitus prievadus. Neskiria gavėjų taip, kaip komutatorius.</td></tr><tr><td>Komutatorius (switch)</td><td>Sujungia Ethernet įrenginius LAN tinkle ir perduoda kadrus pagal MAC adresus; žinomo individualaus gavėjo kadrą siunčia į atitinkamą prievadą.</td></tr><tr><td>Maršrutizatorius (router)</td><td>Sujungia skirtingus IP tinklus ir nukreipia paketus tarp jų. Dažnai jungia namų LAN prie interneto.</td></tr><tr><td>Belaidžio ryšio prieigos taškas (access point)</td><td>Leidžia Wi-Fi įrenginiams prisijungti prie vietinio tinklo.</td></tr><tr><td>Tinklo plokštė</td><td>Įrenginio sąsaja ryšiui su tinklu.</td></tr></tbody></table></div><p><strong>Tipinė schema (mokomasis pavyzdys):</strong></p><pre class=\"source-diagram\" aria-label=\"Tipinio tinklo tekstinė schema\">Internetas / tiekėjas\n          │\n      Modemas / ONT\n          │\n    Maršrutizatorius\n      ┌───┴────────┐\n Komutatorius   Wi-Fi prieigos taškas\n  ┌──┴─────┐          ┌──┴────┐\n PC    Spausdintuvas  Telefonas  Planšetė</pre><details class=\"scope\"><summary>Papildomai: jungtiniai įrenginiai ir MAC</summary><p>Schema rodo atskiras funkcijas; namuose maršrutizatorius ir prieigos taškas dažnai yra vienas įrenginys, kartais kartu su modemu ar ONT. Komutatorius neprivalo būti tiesiogiai prijungtas prie interneto, kad vietiniame tinkle perduotų duomenis. Šakotuvas ir komutatorius nėra tas pats. MAC adresas šiame modulyje aiškinamas kaip tinklo sąsajos identifikatorius, naudojamas vietinio ryšio lygmenyje; MAC nėra IP adreso pakaitalas ir gali būti programiškai keičiamas ar atsitiktinamas.</p></details>",
      "goals": [
        "Atskirti komutatoriaus, maršrutizatoriaus ir prieigos taško funkcijas.",
        "Paaiškinti vietinio ir išorinio ryšio kelią."
      ],
      "terms": [
        "modemas / ONT",
        "komutatorius",
        "maršrutizatorius",
        "prieigos taškas",
        "šakotuvas"
      ],
      "reflection": "ar maršrutizatorius visada būtinas, kad du to paties LAN kompiuteriai bendrautų tarpusavyje?"
    },
    {
      "number": 3,
      "title": "TCP/IP, duomenų paketai ir IP adresai",
      "html": "<h3>Teorija</h3><p>Protokolas – taisyklių rinkinys, pagal kurį įrenginiai keičiasi duomenimis. TCP/IP – interneto protokolų šeima. Duomenys perduodami dalimis, kurios turi valdymo informaciją. IP atsako už adresavimą ir paketų nukreipimą tarp tinklų; pats IP negarantuoja pristatymo. TCP užtikrina patikimą, eilės tvarką išlaikantį baitų srautą: aptinka trūkumus ir prireikus pakartotinai siunčia duomenis. Ne visas interneto srautas naudoja TCP – egzistuoja ir UDP, naudojamas, kai svarbi mažesnė delsa arba programos pačios valdo patikimumą.</p><p><strong>Supaprastinta kelionė:</strong> programa → transporto protokolas (pvz., TCP) → IP paketai → vietinis tinklas → maršrutizatoriai → gavėjo tinklas → gavėjo programa. Paketai gali nukeliauti skirtingais maršrutais ir atvykti ne eilės tvarka. TCP prireikus atkuria tinkamą duomenų seką. Ši schema nėra tiksli visų tinklo sluoksnių emuliacija.</p><h3>IP adresai</h3><p>IPv4 adresas sudarytas iš keturių dešimtainių skaičių nuo 0 iki 255, atskirtų taškais (32 bitai), pvz., <code>192.168.10.11</code>. Sintaksiškai taisyklingas adresas dar nebūtinai tinka konkrečiam kompiuteriui. IPv6 yra 128 bitų adresavimo sistema; pavyzdys <code>2001:db8::10</code> (dokumentacinis adresas).</p><div class=\"table-scroll\" tabindex=\"0\" role=\"region\" aria-label=\"Mokomosios medžiagos lentelė\"><table><thead><tr><th scope=\"col\">Sąvoka</th><th scope=\"col\">Paaiškinimas</th></tr></thead><tbody><tr><td>Vidinis / privatus IPv4</td><td>Naudojamas vietiniame tinkle; tiesiogiai viešajame internete nemaršrutizuojamas. Privatiems adresams rezervuoti intervalai 10.0.0.0–10.255.255.255, 172.16.0.0–172.31.255.255 ir 192.168.0.0–192.168.255.255.</td></tr><tr><td>Išorinis / viešasis IP</td><td>Viešai maršrutizuojamas adresas, jei atitinkamai suteiktas ir naudojamas. Ne kiekvienas adresas už privataus diapazono ribų yra viešasis (yra ir kitų specialių diapazonų).</td></tr><tr><td>Statinis IP</td><td>Pastovus, nustatomas arba administruojamas taip, kad išliktų tas pats.</td></tr><tr><td>Dinaminis IP</td><td>Suteikiamas automatiškai, gali keistis; neprivalo keistis per kiekvieną prisijungimą.</td></tr><tr><td>DHCP</td><td>Automatiškai suteikia tinklo nustatymus, pvz., IP adresą, kaukę, numatytąjį šliuzą ir DNS serverio adresą.</td></tr><tr><td>NAT</td><td>Dažnai IPv4 tinkluose pakeičia adresus (o kartu su prievadų vertimu – ir prievadus), kad keli vietiniai įrenginiai naudotųsi bendru išoriniu ryšiu. NAT savaime nėra ugniasienė.</td></tr><tr><td>Numatytasis šliuzas</td><td>Įrenginys, kuriam paprastai siunčiami paketai į kitus tinklus; dažniausiai maršrutizatoriaus LAN adresas.</td></tr></tbody></table></div><p>Privatus ir viešas apibūdina adreso naudojimo sritį; statinis ir dinaminis – suteikimo būdą. Tai dvi skirtingos klasifikacijos. Privatus adresas taip pat gali būti statinis, o viešasis – dinaminis.</p>",
      "goals": [
        "Atskirti TCP ir IP paskirtis.",
        "Atpažinti IP adreso klaidą bei dublikatą."
      ],
      "terms": [
        "protokolas",
        "TCP",
        "IP",
        "privatus ir viešasis adresas",
        "statinis ir dinaminis adresas"
      ],
      "reflection": "ar telefonas ir kompiuteris viename namų tinkle gali turėti skirtingus vidinius IP, bet naudoti tą patį išorinį IPv4 ryšį?"
    },
    {
      "number": 4,
      "title": "DNS, domenai, URL ir žiniatinklis",
      "html": "<h3>Teorija</h3><p>Domeno vardas – žmogui patogus hierarchinis vardas, pvz., <code>mokykla.example</code>. DNS (domenų vardų sistema) padeda rasti su vardu susietus tinklo duomenis, dažniausiai IPv4 ar IPv6 adresus. DNS serverio atsakymas gali būti gautas iš talpyklos; jei reikia, DNS infrastruktūra randa reikiamą įrašą. DNS pats neperduoda svetainės turinio ir neužtikrina viso ryšio šifravimo.</p><p>URL (universalusis ištekliaus adresas) nurodo, kaip pasiekti konkretų išteklių. Domenas yra viena galima URL adreso dalis, o ne visas URL.</p><p><strong>Mokomasis URL:</strong> <code>https://mokykla.example:443/medziaga/tinklai?klase=11#praktika</code></p><div class=\"table-scroll\" tabindex=\"0\" role=\"region\" aria-label=\"Mokomosios medžiagos lentelė\"><table><thead><tr><th scope=\"col\">Dalis</th><th scope=\"col\">Reikšmė</th></tr></thead><tbody><tr><td><code>https</code></td><td>Schema, nurodanti saugaus HTTP ryšio naudojimą</td></tr><tr><td><code>mokykla.example</code></td><td>Serverio vardas (host); šiame pavyzdyje domeno vardas</td></tr><tr><td><code>443</code></td><td>Aiškiai nurodytas prievadas (įprastas numatytasis HTTPS prievadas)</td></tr><tr><td><code>/medziaga/tinklai</code></td><td>Ištekliaus kelias</td></tr><tr><td><code>klase=11</code></td><td>Užklausos parametras po <code>?</code></td></tr><tr><td><code>praktika</code></td><td>Fragmentas po <code>#</code>, kurį naršyklė gali naudoti puslapio vietai pasirinkti; HTTP užklausoje fragmentas serveriui nesiunčiamas</td></tr></tbody></table></div><p><strong>Kaip atidaroma svetainė?</strong> Supaprastintas naujo HTTPS ryšio scenarijus be talpyklų: naudotojas įveda URL → DNS padeda rasti IP → užmezgamas ryšys su serveriu ir patikrinamas TLS sertifikatas → naršyklė siunčia HTTPS užklausą → serveris grąžina atsakymą → naršyklė atvaizduoja turinį. Reali naršyklė gali naudoti talpyklas ar jau esamus ryšius; šiuolaikinis HTTP/3 naudoja QUIC, todėl ne kiekvienas HTTPS ryšys naudoja TCP.</p><p>HTTP – žiniatinklio išteklių užklausų ir atsakymų protokolas. HTTPS – HTTP naudojant TLS apsaugą. HTTPS saugo perduodamų duomenų konfidencialumą bei vientisumą ir leidžia tikrinti serverio tapatybę. HTTPS nereiškia, kad svetainė būtinai sąžininga, teisėta arba be kenkėjiško turinio. Visada tikrink domeną ir naršyklės įspėjimus.</p>",
      "goals": [
        "Išskaidyti URL ir paaiškinti DNS vaidmenį.",
        "Įvertinti HTTPS apsaugą ir jos ribas."
      ],
      "terms": [
        "DNS",
        "domenas",
        "URL",
        "HTTP",
        "HTTPS"
      ],
      "reflection": "kas gali nutikti, kai interneto ryšys veikia, tačiau DNS vardų paieška neveikia?"
    },
    {
      "number": 5,
      "title": "Interneto paslaugos, protokolai ir belaidžių įrenginių sauga",
      "html": "<h3>Teorija</h3><p>Skirtingos interneto paslaugos naudoja skirtingus protokolus. Protokolo pasirinkimas priklauso nuo to, ką norime atlikti.</p><div class=\"table-scroll\" tabindex=\"0\" role=\"region\" aria-label=\"Mokomosios medžiagos lentelė\"><table><thead><tr><th scope=\"col\">Protokolas</th><th scope=\"col\">Paskirtis</th></tr></thead><tbody><tr><td>HTTP</td><td>Žiniatinklio išteklių perdavimas be TLS apsaugos.</td></tr><tr><td>HTTPS</td><td>HTTP naudojant TLS.</td></tr><tr><td>FTP</td><td>Failų perdavimas; standartinis FTP savaime nešifruoja prisijungimo duomenų ir failų.</td></tr><tr><td>FTPS</td><td>FTP su TLS apsauga.</td></tr><tr><td>SMTP</td><td>Elektroninių laiškų siuntimas ir perdavimas tarp pašto serverių.</td></tr><tr><td>POP3</td><td>Laiškų atsisiuntimas iš pašto serverio; galima palikti kopijas serveryje, priklausomai nuo nustatymų.</td></tr><tr><td>IMAP / IMAP4</td><td>Serveryje laikomų laiškų bei aplankų sinchronizavimas tarp įrenginių.</td></tr><tr><td>DNS</td><td>Vardų susiejimas su tinklo informacija, pvz., IP adresais.</td></tr><tr><td>DHCP</td><td>Automatinis tinklo konfigūracijos suteikimas.</td></tr></tbody></table></div><details class=\"scope\"><summary>Papildomai: TLS ir SFTP skirtumai</summary><p>SMTP, POP3 ir IMAP gali veikti naudojant TLS; jų vien pavadinimas neužtikrina saugaus perdavimo. SFTP yra atskiras failų perdavimo per SSH protokolas, ne FTPS sinonimas (papildoma informacija). Pašto laiško siuntimo tarp klientų ir serverių TLS apsauga savaime negarantuoja ištisinio laiško turinio šifravimo.</p></details><p><strong>Bluetooth susiejimas:</strong> įjungiamas Bluetooth abiejuose įrenginiuose, reikiamas įrenginys perjungiamas į susiejimo režimą, pasirenkamas jo pavadinimas, patvirtinamas sutampantis kodas, jei jo prašoma, patikrinamas veikimas. Nežinomų susiejimo užklausų priimti nereikia. Nebenaudojamą atrandamumo režimą geriau išjungti. Wi-Fi ryšiui rinkis patikimą tinklą, naudok WPA2 arba WPA3, stiprų slaptažodį ir atnaujintus įrenginius. Viešame tinkle venk jautrių veiksmų, jei negali patikrinti ryšio ir svetainės tapatybės. Niekuomet neignoruok netikėto sertifikato įspėjimo.</p>",
      "goals": [
        "Parinkti protokolą failams ir el. paštui.",
        "Saugiai susieti belaidžius įrenginius."
      ],
      "terms": [
        "FTP / FTPS",
        "SMTP",
        "POP3",
        "IMAP",
        "Bluetooth susiejimas"
      ],
      "reflection": "kodėl pašto programoje paprastai reikia atskirai nustatyti laiškų siuntimo ir gavimo paslaugas?"
    },
    {
      "number": 6,
      "title": "Tinklo diagnostika ir problemų sprendimas",
      "html": "<p class=\"lesson-level\">Praktinis taikymas. Komandos yra papildomos mokymosi priemonės, ne privalomas VBE komandų sąrašas.</p><h3>Teorija</h3><p>Diagnostika – nuoseklus tinklo veikimo tikrinimas, siekiant rasti galimą problemos priežastį. Pradėk nuo paprasčiausių patikrų: fizinis ar belaidis prisijungimas, tinklo konfigūracija, vietinis ryšys, vardų nustatymas ir tik tada konkreti paslauga. Vieno testo rezultatas ne visada įrodo gedimo priežastį.</p><div class=\"table-scroll\" tabindex=\"0\" role=\"region\" aria-label=\"Mokomosios medžiagos lentelė\"><table><thead><tr><th scope=\"col\">Windows komanda</th><th scope=\"col\">Ką parodo</th></tr></thead><tbody><tr><td><code>ipconfig</code></td><td>IP adresą, kaukę, numatytąjį šliuzą ir pagrindinę konfigūraciją.</td></tr><tr><td><code>ipconfig /all</code></td><td>Išsamesnę tinklo konfigūraciją, įskaitant DNS ir DHCP informaciją.</td></tr><tr><td><code>ping &lt;adresas&gt;</code></td><td>Tikrina, ar gaunamas ICMP atsakymas; gali rodyti delsą ir prarastus atsakymus. Nepavykęs ping vienas neįrodo, kad įrenginys neveikia (ICMP gali būti filtruojamas).</td></tr><tr><td><code>nslookup &lt;domenas&gt;</code></td><td>Padeda patikrinti DNS vardo nustatymą.</td></tr><tr><td><code>tracert &lt;domenas arba IP&gt;</code></td><td>Parodo atsakančius maršruto mazgus ir apytikslę delsą; ne visi mazgai privalo atsakyti.</td></tr></tbody></table></div><p>Pateiktos komandos yra papildomos praktinės diagnostikos priemonės, ne atskiras privalomų VBE komandų sąrašas. Simuliatorius turi naudoti fiksuotus mokomuosius rezultatus, nevykdyti komandų operacinėje sistemoje, nesiųsti realių tinklo užklausų ir nerinkti tikrų įrenginių adresų.</p>",
      "goals": [
        "Perskaityti diagnostikos rezultatą.",
        "Grįsti tikėtiną priežastį keliais požymiais."
      ],
      "terms": [
        "diagnostika",
        "vietinis ryšys",
        "DNS paieška",
        "tikėtina priežastis"
      ],
      "reflection": "kodėl vien nepavykęs ping nėra pakankamas įrodymas, kad neveikia internetas?"
    }
  ],
  "activities": [
    {
      "id": "1.1",
      "lesson": 1,
      "title": "Atpažink tinklą",
      "prompt": "Priskirk kiekvienai situacijai LAN, WAN arba internetą kaip nurodytos apimties tinklą: a) 20 vieno kabineto kompiuterių dalijasi vienu vietiniu spausdintuvu; b) įmonės Vilniaus ir Klaipėdos filialų vietiniai tinklai sujungti į vieną įmonės tinklą; c) naršyklėje lankoma pasauliniu viešuoju tinklu pasiekiama svetainė. Paaiškink bent vieną pasirinkimą.",
      "points": 3
    },
    {
      "id": "1.2",
      "lesson": 1,
      "title": "Pasirink ryšį",
      "prompt": "Parink vieną tinkamiausią priemonę iš Ethernet, Wi-Fi, Bluetooth, 4G/5G: a) stacionarus kompiuteris šalia tinklo lizdo, svarbu stabilumas; b) belaidės ausinės su telefonu; c) išvykoje naudojamas telefonas, nėra prieinamo vietinio Wi-Fi. Pagrįsk pasirinkimus po vieną sakinį.",
      "points": 3
    },
    {
      "id": "1.3",
      "lesson": 1,
      "title": "Mokyklos LAN projektas",
      "prompt": "Naudodamas schemos rengyklę arba lapą, nubraižyk 4 kompiuterius, tinklinį spausdintuvą ir bendrą vietinio tinklo sujungimo įrenginį (žymėk „komutatorius“). Pažymėk LAN ribą. Atsakyk, ar šie įrenginiai gali spausdinti vietiniame tinkle, nutrūkus internetui. Laikyk, kad įrenginiai tinkamai sukonfigūruoti ir įjungti.",
      "points": 3
    },
    {
      "id": "2.1",
      "lesson": 2,
      "title": "Parink tinklo įrangą",
      "prompt": "Susiek situaciją su įrenginiu: a) sujungti šešis laidinius kompiuterius į LAN; b) sujungti mokyklos LAN su kitu IP tinklu; c) leisti telefonams prisijungti prie to paties LAN belaidžiu ryšiu. Rinkis iš komutatoriaus, maršrutizatoriaus ir prieigos taško.",
      "points": 3
    },
    {
      "id": "2.2",
      "lesson": 2,
      "title": "Sukurk veikiantį tinklą",
      "prompt": "Simuliatoriuje sujunk tiekėją, ONT, maršrutizatorių, komutatorių, du laidinius kompiuterius, spausdintuvą, prieigos tašką ir telefoną. Kompiuteriai bei spausdintuvas jungiami prie komutatoriaus; komutatorius ir prieigos taškas – prie LAN maršrutizatoriaus pusės; telefonas jungiasi per Wi-Fi. Tada atjunk tiekėjo ryšį ir patikrink, kurie duomenų perdavimo keliai lieka veikiantys. Laikyk, kad visas kitas tinklas tinkamai sukonfigūruotas. Pateik išvadą apie vietinį spausdinimą ir interneto prieigą.",
      "points": 3
    },
    {
      "id": "2.3",
      "lesson": 2,
      "title": "Šakotuvas ar komutatorius?",
      "prompt": "Keturi kompiuteriai A, B, C, D prijungti prie to paties įrenginio. A perduoda B skirtą kadrą. Palygink, į kuriuos kitus prievadus perduodamas signalas naudojant šakotuvą ir į kurį prievadą komutatorius siunčia kadrą, kai B MAC adresas žinomas. Paaiškink komutatoriaus naudą. Nežinomo gavėjo ir transliacinių kadrų atvejai šiame pavyzdyje nenagrinėjami.",
      "points": 3
    },
    {
      "id": "3.1",
      "lesson": 3,
      "title": "IP adresų patikra",
      "prompt": "a) Kuris iš pateiktų užrašų nėra taisyklingas IPv4: `192.168.10.12`, `10.0.0.8`, `192.168.256.1`? b) Iš `10.0.0.8`, `172.20.5.4`, `192.168.10.12`, `203.0.113.9` atrink visus privataus IPv4 diapazono adresus (paskutinis yra dokumentacinis, ne realus viešasis adresas). c) Paaiškink, ar privatus IP gali būti statinis.",
      "points": 3
    },
    {
      "id": "3.2",
      "lesson": 3,
      "title": "Rask konfigūracijos klaidą",
      "prompt": "Simuliuojamo LAN kaukė `255.255.255.0`, šliuzas `192.168.10.1`, visi įrenginiai prijungti prie to paties komutatoriaus. A – `192.168.10.11`, B – `192.168.10.12`, C – `192.168.10.12`, spausdintuvas – `192.168.10.20`. a) Nurodyk konfliktuojančius įrenginius. b) Pasiūlyk C laisvą tinkamą adresą iš `192.168.10.13` ir `192.168.11.13`. c) Paaiškink, kaip tinkamai veikiantis DHCP padeda išvengti dublikatų. Adresų skaičiavimo pagal potinklius iš mokinio nereikalaujama; pateikta taisyklė, kad šiame pavyzdyje LAN įrenginių pirmi trys skaičiai turi būti 192.168.10, o paskutinis – nuo 1 iki 254, nepanaudotas kito įrenginio.",
      "points": 3
    },
    {
      "id": "3.3",
      "lesson": 3,
      "title": "Atkurk duomenų kelionę",
      "prompt": "Mokomojoje TCP simuliacijoje trys duomenų dalys sunumeruotos 1, 2, 3. Gavėją pasiekia 3 ir 1, dalis 2 dingsta. a) Kuri dalis trūksta? b) Ką TCP gali padaryti dėl trūkstamos dalies? c) Kokia turi būti galutinė duomenų dalių seka? Paaiškink, kuo TCP funkcija skiriasi nuo IP.",
      "points": 3
    },
    {
      "id": "4.1",
      "lesson": 4,
      "title": "Išskaidyk URL",
      "prompt": "Nagrinėk `https://biblioteka.example/katalogas/knygos?id=42#aprasymas`. a) Užrašyk schemą ir serverio vardą. b) Užrašyk kelią. c) Užrašyk parametrą ir fragmentą. Pavyzdinis adresas nėra veikianti svetainė.",
      "points": 3
    },
    {
      "id": "4.2",
      "lesson": 4,
      "title": "Sudėliok svetainės atidarymo procesą",
      "prompt": "Sudėk žingsnius į logišką eilę, laikydamas, kad nėra talpyklos ir ryšys užmezgamas iš naujo: A – serveris grąžina atsakymą; B – DNS nustato reikiamą IP; C – naršyklė siunčia HTTPS užklausą; D – naudotojas įveda URL; E – naršyklė parodo turinį; F – užmezgamas apsaugotas ryšys ir patikrinamas sertifikatas. Pagrįsk DNS ir HTTPS vaidmenis.",
      "points": 3
    },
    {
      "id": "4.3",
      "lesson": 4,
      "title": "Saugus prisijungimas",
      "prompt": "Mokykla nurodo, kad jos prisijungimo puslapis yra `https://mokykla.example/prisijungti`. Simuliacijoje pateikti A `http://mokykla.example/prisijungti`, B `https://mokykla.example/prisijungti`, C `https://mokykla.example.svetimas.example/prisijungti`. Kuris geriausiai atitinka nurodytą adresą, jei sertifikatas galioja ir nėra įspėjimų? Paaiškink, kodėl netinka A ir C. Nurodyk, kodėl vien HTTPS nepakanka pasitikėti svetaine.",
      "points": 3
    },
    {
      "id": "5.1",
      "lesson": 5,
      "title": "Tinkamas protokolas",
      "prompt": "Parink protokolą: a) kompiuterio pašto programa siunčia laišką; b) mokinys nori, kad telefono ir kompiuterio pašto aplankai būtų sinchronizuojami; c) organizacija reikalauja failų perdavimo naudojant FTP su TLS. Rinkis iš SMTP, IMAP4, FTPS, POP3 ir HTTP.",
      "points": 3
    },
    {
      "id": "5.2",
      "lesson": 5,
      "title": "Pašto kelionė",
      "prompt": "Pavaizduok: siuntėjo pašto programa → siuntėjo pašto serveris → gavėjo pašto serveris → gavėjo pašto programa. Pažymėk, kuriuose pirmuose dviejuose ryšiuose įprastai naudojamas SMTP, ir paskutiniam ryšiui parink IMAP, jei gavėjas skaito laiškus keliuose įrenginiuose. Paaiškink skirtumą tarp laiškų gavimo su POP3 ir sinchronizavimo su IMAP.",
      "points": 3
    },
    {
      "id": "5.3",
      "lesson": 5,
      "title": "Saugus belaidis ryšys",
      "prompt": "Trijose situacijose parink saugų veiksmą ir pagrįsk: a) nepažįstamas įrenginys prašo Bluetooth susiejimo; b) žinomo mokyklos puslapio naršyklė rodo TLS sertifikato įspėjimą; c) reikia siųsti jautrų failą, siūlomas tik nešifruotas FTP arba tinkamai sukonfigūruotas FTPS. Tai simuliacijos, nereikia realiai jungtis prie įrenginių ar perduoti duomenų.",
      "points": 3
    },
    {
      "id": "6.1",
      "lesson": 6,
      "title": "Skaityk diagnostikos rezultatą",
      "prompt": "Mokomasis `ipconfig` išrašas: IPv4 `192.168.10.15`; kaukė `255.255.255.0`; numatytasis šliuzas `192.168.10.1`. a) Užrašyk kompiuterio IP. b) Užrašyk numatytojo šliuzo IP ir jo paskirtį. c) Ar šis kompiuterio adresas privatus, ar viešasis? Remkis teorijoje aprašytais intervalais.",
      "points": 3
    },
    {
      "id": "6.2",
      "lesson": 6,
      "title": "Rask tikėtiną problemą",
      "prompt": "Simuliuojamas kompiuteris: `ping 192.168.10.1` atsako; `ping 198.51.100.24` atsako; `nslookup mokykla.example` rodo DNS užklausos laiko viršijimą. Pavyzdiniai adresai veikia tik simuliacijoje. a) Ką rodo pirmasis testas? b) Ką leidžia įtarti trečiasis rezultatas? c) Ką reikėtų tikrinti toliau (DNS nustatymus / paslaugą ar kompiuterio maitinimą)? Pagrįsk, kad tai tikėtina, o ne vienintelė įmanoma priežastis.",
      "points": 3
    },
    {
      "id": "6.3",
      "lesson": 6,
      "title": "Gedimų tyrėjas",
      "prompt": "Kiekvienai situacijai nurodyk tikėtiną priežastį ir vieną saugų patikrinimą: A – tik vienas iš dviejų to paties LAN kompiuterių neturi ryšio, jo kabelis neprijungtas; B – visi LAN kompiuteriai gali spausdinti, tačiau neturi interneto, o tiekėjo jungtis maršrutizatoriuje simuliacijoje pažymėta kaip atjungta; C – viena konkreti svetainė neatsidaro, kitos atsidaro. Mokinio tikslas – diagnozuoti, o ne keisti realaus tinklo nustatymus.",
      "points": 3
    }
  ],
  "questions": [
    {
      "id": 1,
      "prompt": "Kuris pavyzdys geriausiai apibūdina LAN?",
      "options": [
        "Pasaulinis internetas",
        "Vieno kabineto kompiuterių ir spausdintuvo tinklas",
        "Kelių miestų filialų tinklas",
        "Naršyklės žymių sąrašas"
      ],
      "correct": 1,
      "lesson": 1,
      "explanation": "LAN jungia įrenginius ribotoje teritorijoje, pavyzdžiui, viename kabinete.",
      "points": 1
    },
    {
      "id": 2,
      "prompt": "Koks teiginys apie Wi-Fi teisingas?",
      "options": [
        "Wi-Fi visada reiškia veikiančią interneto prieigą",
        "Wi-Fi veikia tik su šviesolaidžiu",
        "Wi-Fi yra žiniatinklis",
        "Wi-Fi gali veikti ir vietiniame tinkle be interneto"
      ],
      "correct": 3,
      "lesson": 1,
      "explanation": "Wi-Fi suteikia vietinį belaidį ryšį. Tiekėjo jungtis tuo metu gali neveikti.",
      "points": 1
    },
    {
      "id": 3,
      "prompt": "Kuo internetas skiriasi nuo WWW?",
      "options": [
        "WWW yra viena iš internetu teikiamų paslaugų",
        "Internetas yra naršyklė",
        "WWW yra maršrutizatorius",
        "Jie visada reiškia tą patį"
      ],
      "correct": 0,
      "lesson": 1,
      "explanation": "WWW – žiniatinklio paslauga. Internetu taip pat veikia el. paštas ir kitos paslaugos.",
      "points": 1
    },
    {
      "id": 4,
      "prompt": "Koks ryšys tinkamiausias telefonui susieti su netoliese esančiomis belaidėmis ausinėmis?",
      "options": [
        "FTP",
        "Ethernet",
        "Bluetooth",
        "SMTP"
      ],
      "correct": 2,
      "lesson": 1,
      "explanation": "Bluetooth tinka netoliese esančių įrenginių susiejimui.",
      "points": 1
    },
    {
      "id": 5,
      "prompt": "Kuris įrenginys pirmiausia skirtas jungti skirtingus IP tinklus?",
      "options": [
        "Šakotuvas",
        "Maršrutizatorius",
        "Spausdintuvas",
        "Prieigos taškas"
      ],
      "correct": 1,
      "lesson": 2,
      "explanation": "Maršrutizatorius nukreipia IP paketus tarp skirtingų tinklų.",
      "points": 1
    },
    {
      "id": 6,
      "prompt": "Kuris įrenginys LAN perduoda žinomo individualaus gavėjo Ethernet kadrą į atitinkamą prievadą?",
      "options": [
        "Komutatorius",
        "Modemas",
        "Šakotuvas",
        "DNS serveris"
      ],
      "correct": 0,
      "lesson": 2,
      "explanation": "Komutatorius naudoja MAC adresų lentelę; šiame pavyzdyje gavėjo prievadas jau žinomas.",
      "points": 1
    },
    {
      "id": 7,
      "prompt": "Kam skirtas prieigos taškas?",
      "options": [
        "Automatiškai suteikti pažymius",
        "Pakeisti domeną URL fragmentu",
        "Priimti el. laiškus",
        "Prijungti belaidžius įrenginius prie vietinio tinklo"
      ],
      "correct": 3,
      "lesson": 2,
      "explanation": "Prieigos taškas suteikia Wi-Fi įrenginiams ryšį su LAN.",
      "points": 1
    },
    {
      "id": 8,
      "prompt": "Ką daro modemas arba šviesolaidžio ONT tipinėje namų tinklo schemoje?",
      "options": [
        "Rodo svetainės turinį",
        "Siunčia elektroninius laiškus",
        "Užtikrina fizinės interneto prieigos su tiekėju sąsają pagal ryšio technologiją",
        "Visada pakeičia komutatorių"
      ],
      "correct": 2,
      "lesson": 2,
      "explanation": "Modemas arba ONT yra tiekėjo prieigos ir vartotojo įrangos sąsaja.",
      "points": 1
    },
    {
      "id": 9,
      "prompt": "Kuris užrašas nėra taisyklingas IPv4 adresas?",
      "options": [
        "`192.168.1.10`",
        "`10.0.0.8`",
        "`172.16.2.1`",
        "`192.168.300.1`"
      ],
      "correct": 3,
      "lesson": 3,
      "explanation": "Vienas IPv4 skaičius negali viršyti 255.",
      "points": 1
    },
    {
      "id": 10,
      "prompt": "Kuris adresas priklauso privačiam IPv4 diapazonui?",
      "options": [
        "`8.8.8.8`",
        "`192.168.5.11`",
        "`1.1.1.1`",
        "`9.9.9.9`"
      ],
      "correct": 1,
      "lesson": 3,
      "explanation": "192.168.0.0/16 yra privatus diapazonas.",
      "points": 1
    },
    {
      "id": 11,
      "prompt": "Koks protokolas paprastai automatiškai suteikia IP adresą ir kitus tinklo nustatymus?",
      "options": [
        "DHCP",
        "SMTP",
        "FTP",
        "HTTPS"
      ],
      "correct": 0,
      "lesson": 3,
      "explanation": "DHCP gali suteikti IP, kaukę, šliuzą ir DNS serverio adresą.",
      "points": 1
    },
    {
      "id": 12,
      "prompt": "Kuri užduotis būdinga TCP, o ne IP adresavimui?",
      "options": [
        "Domenų vardų suteikimas",
        "Wi-Fi slaptažodžio kūrimas",
        "Patikimo, eilės tvarką išlaikančio duomenų srauto užtikrinimas",
        "HTML puslapio piešimas"
      ],
      "correct": 2,
      "lesson": 3,
      "explanation": "TCP užtikrina patikimą baitų srautą ir eilės tvarką; IP adresuoja ir nukreipia paketus.",
      "points": 1
    },
    {
      "id": 13,
      "prompt": "Kam pirmiausia naudojamas DNS?",
      "options": [
        "Automatiškai nustatyti monitoriaus ryškumą",
        "Šifruoti visą interneto srautą",
        "Rasti su domenų vardais susietus IP adresus",
        "Siųsti el. laiškus"
      ],
      "correct": 2,
      "lesson": 4,
      "explanation": "DNS susieja vardus su tinklo informacija; pats tinklalapio neperduoda.",
      "points": 1
    },
    {
      "id": 14,
      "prompt": "Kuris yra serverio vardas adrese `https://mokykla.example/temos/tinklai`?",
      "options": [
        "`mokykla.example`",
        "`https`",
        "`/temos/tinklai`",
        "`tinklai`"
      ],
      "correct": 0,
      "lesson": 4,
      "explanation": "Serverio vardas yra po schemos ir prieš kelią.",
      "points": 1
    },
    {
      "id": 15,
      "prompt": "Ką papildomai suteikia HTTPS, lyginant su neapsaugotu HTTP?",
      "options": [
        "Garantuoja visų svetainės teiginių teisingumą",
        "Panaikina DNS poreikį visais atvejais",
        "Garantuoja, kad svetainė neturi virusų",
        "TLS apsaugą ir galimybę patikrinti serverio tapatybę"
      ],
      "correct": 3,
      "lesson": 4,
      "explanation": "TLS saugo ryšį ir leidžia tikrinti serverio tapatybę, tačiau negarantuoja turinio sąžiningumo.",
      "points": 1
    },
    {
      "id": 16,
      "prompt": "Kokia adreso `https://mokykla.example/tinklai?klase=11` dalis yra kelias?",
      "options": [
        "`klase=11`",
        "`/tinklai`",
        "`https`",
        "`mokykla.example`"
      ],
      "correct": 1,
      "lesson": 4,
      "explanation": "Kelias prasideda po serverio vardo; parametras prasideda po klaustuko.",
      "points": 1
    },
    {
      "id": 17,
      "prompt": "Kuris protokolas paprastai naudojamas elektroniniams laiškams siųsti?",
      "options": [
        "SMTP",
        "POP3",
        "IMAP",
        "DHCP"
      ],
      "correct": 0,
      "lesson": 5,
      "explanation": "SMTP naudojamas laiškams siųsti bei perduoti tarp pašto serverių.",
      "points": 1
    },
    {
      "id": 18,
      "prompt": "Kuris protokolas tinka pašto aplankams sinchronizuoti telefone ir kompiuteryje?",
      "options": [
        "FTP",
        "HTTP",
        "SMTP",
        "IMAP"
      ],
      "correct": 3,
      "lesson": 5,
      "explanation": "IMAP sinchronizuoja serveryje laikomus laiškus ir aplankus.",
      "points": 1
    },
    {
      "id": 19,
      "prompt": "Kuo FTPS skiriasi nuo standartinio FTP?",
      "options": [
        "FTPS yra tik el. pašto protokolas",
        "FTPS naudoja TLS apsaugą",
        "FTPS negali perduoti failų",
        "FTP ir FTPS visada vienodai šifruoja duomenis"
      ],
      "correct": 1,
      "lesson": 5,
      "explanation": "FTPS – FTP su TLS; SFTP yra kitas protokolas.",
      "points": 1
    },
    {
      "id": 20,
      "prompt": "Ką daryti gavus netikėtą nežinomo įrenginio Bluetooth susiejimo užklausą?",
      "options": [
        "Patvirtinti bet kokį kodą",
        "Išsiųsti įrenginiui slaptažodį",
        "Atmesti užklausą, jei susiejimas nebuvo inicijuotas",
        "Išjungti visų įrenginių saugos funkcijas"
      ],
      "correct": 2,
      "lesson": 5,
      "explanation": "Neprašytas susiejimas su nepažįstamu įrenginiu atmetamas.",
      "points": 1
    },
    {
      "id": 21,
      "prompt": "Kuri komanda padeda peržiūrėti savo Windows kompiuterio IP konfigūraciją?",
      "options": [
        "`ipconfig`",
        "`nslookup`",
        "`tracert`",
        "`dir`"
      ],
      "correct": 0,
      "lesson": 6,
      "explanation": "ipconfig parodo Windows tinklo konfigūraciją.",
      "points": 1
    },
    {
      "id": 22,
      "prompt": "Kuri komanda skirta DNS vardo nustatymo patikrai?",
      "options": [
        "`ping` be argumento",
        "`ipconfig`",
        "`mkdir`",
        "`nslookup`"
      ],
      "correct": 3,
      "lesson": 6,
      "explanation": "nslookup leidžia tirti DNS vardų nustatymą.",
      "points": 1
    },
    {
      "id": 23,
      "prompt": "Kuris teiginys apie nepavykusį ping teisingas?",
      "options": [
        "Jis visada įrodo, kad neveikia visas internetas",
        "Atsakymo gali nebūti ir dėl ICMP filtravimo",
        "Jis visada įrodo, kad sugedo monitorius",
        "Jis visada rodo netinkamą Wi-Fi slaptažodį"
      ],
      "correct": 1,
      "lesson": 6,
      "explanation": "ICMP atsakymai gali būti filtruojami, nors kitos paslaugos veikia.",
      "points": 1
    },
    {
      "id": 24,
      "prompt": "Ką pirmiausia tikėtina reikėtų tikrinti, jei simuliacijoje vietinis ir išorinis IP pasiekiami, bet DNS vardų nustatymas neveikia?",
      "options": [
        "Klaviatūros bateriją",
        "Spausdintuvo tonerį",
        "DNS konfigūraciją ir paslaugą",
        "Monitoriaus skiriamąją gebą"
      ],
      "correct": 2,
      "lesson": 6,
      "explanation": "IP pasiekiamumas ir nesėkmingas DNS rodo, kad pirmiausia verta tikrinti DNS nustatymus bei paslaugą.",
      "points": 1
    },
    {
      "id": 25,
      "prompt": "Mokyklos kompiuteriai gali naudotis vietiniu spausdintuvu net tada, kai nutrūko ryšys su interneto tiekėju. Įvardyk vietinio tinklo tipą ir paaiškink, kodėl spausdintuvas gali veikti.",
      "lesson": 1,
      "points": 2
    },
    {
      "id": 26,
      "prompt": "Mokykla turi komutatorių ir maršrutizatorių. Paaiškink abiejų įrenginių skirtingas pagrindines funkcijas.",
      "lesson": 2,
      "points": 2
    },
    {
      "id": 27,
      "prompt": "Vieno kompiuterio IPv4 yra `192.168.10.11`, antro – `192.168.10.11`, abu tame pačiame LAN. Nurodyk problemą ir vieną tinkamą jos sprendimą, nekeisdamas realių įrenginių konfigūracijos.",
      "lesson": 3,
      "points": 2
    },
    {
      "id": 28,
      "prompt": "Adresas `https://biblioteka.example/knygos?id=7`. Nurodyk serverio vardą ir paaiškink DNS paskirtį atidarant šį adresą (mokomasis domenas).",
      "lesson": 4,
      "points": 2
    },
    {
      "id": 29,
      "prompt": "Mokinys naudoja telefoną ir kompiuterį laiškams skaityti bei nori, kad aplankai būtų sinchronizuojami. Įvardyk tinkamą laiškų skaitymo protokolą ir laiškų siuntimo protokolą.",
      "lesson": 5,
      "points": 2
    },
    {
      "id": 30,
      "prompt": "Simuliacijoje kompiuteris sėkmingai gauna atsakymą iš vietinio šliuzo, tačiau DNS vardo nustatymas nesėkmingas. Įvardyk tikėtiną sutrikimą ir vieną priemonę jam papildomai patikrinti. Paaiškinti, kodėl negalima iš vieno požymio garantuoti gedimo priežasties, galima papildomai, bet tai ne atskiras taškas.",
      "lesson": 6,
      "points": 2
    }
  ]
};
