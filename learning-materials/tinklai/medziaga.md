# Kompiuterių tinklai – 11 klasė (III gimnazijos klasė)

NGG informatikos platformai | Bendrosios programos 30.4.1 punktas

**Paskirtis:** savarankiškas mokymasis, darbas pamokoje ir pasirengimas informatikos VBE I daliai. **Apimtis:** 6 pamokos po 45 min. (siūloma trukmė), 18 praktinių užduočių ir 30 autorinių VBE tipo savikontrolės klausimų. Užduotys nėra ankstesnių valstybinių egzaminų klausimų kopijos.

## Mokymosi tikslai ir ribos

Mokinys gebės paaiškinti tinklo paskirtį, atskirti LAN ir WAN, pasirinkti ryšio priemonę ir tinklo įrangą, paaiškinti IP adresavimą bei TCP/IP, susieti domenus su URL, atskirti interneto paslaugų protokolus, pasirinkti saugų ryšį, paaiškinti belaidžių įrenginių susiejimą ir interpretuoti paprastus tinklo diagnostikos rezultatus. DHCP, NAT, IPv6, MAC, numatytasis šliuzas, prievadai ir tinklo kaukė pateikiami tiek, kiek padeda suprasti pavyzdžius; tai nėra atskiras privalomų egzamino terminų sąrašas. Sudėtingas potinklių skaičiavimas, OSI modelio mokymasis atmintinai, maršrutizavimo algoritmai ir profesionalus tinklų administravimas nėra šio modulio tikslas.

**Pamokos modelis:** 5 min. įvadinis klausimas, 15 min. teorija, 20 min. praktika, 5 min. refleksija. Mokytojas gali skirti užduotis skirtingais tempais ir paskutinę pamoką dalį laiko naudoti diagnostikai bei kartojimui.

**Saugumas:** visos simuliacijos veikia su išgalvotais duomenimis. Mokyklos tinklo nustatymų keisti, kitų įrenginių skenuoti, perimti srautą, prisijungti prie svetimų maršrutizatorių, atsisiųsti nežinomų programų ar siųsti tikrų IP/MAC adresų mokytojui nereikia. Tikro tinklo diagnostika – tik mokytojui leidus, savo kompiuteryje, naudojant skaitymo komandas; jei nėra leidimo ar interneto, naudojami pateikti pavyzdiniai rezultatai. Domenas `.example` ir adresai 192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24 rezervuoti pavyzdžiams; jie nėra realios paslaugos adresai.

---

## 1 pamoka. Kam reikalingi kompiuterių tinklai?

### Teorija

Kompiuterių tinklas – tarpusavyje sujungtų įrenginių sistema, leidžianti perduoti duomenis ir naudotis bendrais ištekliais. Tinkle gali veikti kompiuteriai, telefonai, spausdintuvai, serveriai, televizoriai ir kiti įrenginiai. Tinklai leidžia dalytis failais, naudotis bendru spausdintuvu, bendrauti, dirbti su nutolusiais serveriais ir pasiekti interneto paslaugas. Tinklui veikti internetas nėra būtinas: du vietiniame tinkle esantys kompiuteriai gali bendrauti ir be išorinio ryšio.

| Sąvoka | Paskirtis | Pavyzdys |
|---|---|---|
| LAN (Local Area Network) | Vietinis tinklas ribotoje teritorijoje | Mokyklos kompiuterių kabinetas |
| WAN (Wide Area Network) | Ryšys tarp geografiškai nutolusių tinklų | Įmonės filialų tinklai skirtinguose miestuose |
| Internetas | Pasaulinis tarpusavyje sujungtų tinklų tinklas | Interneto paslaugų pasiekimas iš įvairių šalių |
| WWW (žiniatinklis) | Viena internetu teikiamų paslaugų, susijusi su tinklalapiais | Svetainės atvėrimas naršyklėje |

Internetas nėra tas pats, kas WWW. Elektroninis paštas ir kitos interneto paslaugos gali veikti nepriklausomai nuo žiniatinklio. Wi-Fi yra belaidžio ryšio technologija, o ne interneto sinonimas. Prie Wi-Fi galima prisijungti net tuomet, kai ryšys su interneto tiekėju nutrūkęs.

### Kaip įrenginiai sujungiami?

| Ryšio priemonė | Savybės ir naudojimas |
|---|---|
| Ethernet | Dažnai naudojamas laidinis LAN ryšys. Paprastai stabilus, tinkamas stacionariems kompiuteriams. |
| Wi-Fi | Belaidis ryšys vietiniame tinkle. Patogus mobiliems įrenginiams; signalą veikia atstumas, kliūtys ir trukdžiai. |
| Šviesolaidis | Duomenys perduodami šviesos signalais. Tinka didelės spartos ir ilgesnio atstumo ryšiui. |
| 4G / 5G | Mobiliojo tinklo ryšys; tinka ten, kur laidinė interneto prieiga nepatogi arba neprieinama. |
| Bluetooth | Paprastai nedidelio atstumo ryšys tarp įrenginių, pavyzdžiui, kompiuterio ir ausinių. |

Ryšio technologiją renkamės pagal įrenginio mobilumą, aprėptį, stabilumą, spartą, kainą ir saugumo poreikį. Laidinis ryšys nėra automatiškai saugus, o belaidis – automatiškai nesaugus.

### Praktinės užduotys

**1.1. Atpažink tinklą (3 tšk.).** Priskirk kiekvienai situacijai LAN, WAN arba internetą kaip nurodytos apimties tinklą: a) 20 vieno kabineto kompiuterių dalijasi vienu vietiniu spausdintuvu; b) įmonės Vilniaus ir Klaipėdos filialų vietiniai tinklai sujungti į vieną įmonės tinklą; c) naršyklėje lankoma pasauliniu viešuoju tinklu pasiekiama svetainė. Paaiškink bent vieną pasirinkimą.

**1.2. Pasirink ryšį (3 tšk.).** Parink vieną tinkamiausią priemonę iš Ethernet, Wi-Fi, Bluetooth, 4G/5G: a) stacionarus kompiuteris šalia tinklo lizdo, svarbu stabilumas; b) belaidės ausinės su telefonu; c) išvykoje naudojamas telefonas, nėra prieinamo vietinio Wi-Fi. Pagrįsk pasirinkimus po vieną sakinį.

**1.3. Mokyklos LAN projektas (3 tšk.).** Naudodamas schemos rengyklę arba lapą, nubraižyk 4 kompiuterius, tinklinį spausdintuvą ir bendrą vietinio tinklo sujungimo įrenginį (žymėk „komutatorius“). Pažymėk LAN ribą. Atsakyk, ar šie įrenginiai gali spausdinti vietiniame tinkle, nutrūkus internetui. Laikyk, kad įrenginiai tinkamai sukonfigūruoti ir įjungti.

**Pamokos refleksija:** kodėl telefonas gali rodyti prisijungimą prie Wi-Fi, tačiau naršyklė neįkelia svetainės?

---

## 2 pamoka. Tinklo įranga ir tinklo kūrimas

### Teorija

Tinklo įranga atlieka skirtingas funkcijas. Buitiniuose įrenginiuose kelios funkcijos dažnai sujungtos į vieną korpusą, tačiau mokantis svarbu jas atskirti.

| Įranga | Paskirtis |
|---|---|
| Modemas | Pritaiko signalus prie interneto prieigos technologijos, pvz., kabelinės ar DSL linijos. |
| ONT | Šviesolaidinio tinklo galinis įrenginys; sujungia optinę prieigą su vartotojo tinklo įranga. |
| Šakotuvas (hub) | Gautus fizinio lygmens signalus kartoja į kitus prievadus. Neskiria gavėjų taip, kaip komutatorius. |
| Komutatorius (switch) | Sujungia Ethernet įrenginius LAN tinkle ir perduoda kadrus pagal MAC adresus; žinomo individualaus gavėjo kadrą siunčia į atitinkamą prievadą. |
| Maršrutizatorius (router) | Sujungia skirtingus IP tinklus ir nukreipia paketus tarp jų. Dažnai jungia namų LAN prie interneto. |
| Belaidžio ryšio prieigos taškas (access point) | Leidžia Wi-Fi įrenginiams prisijungti prie vietinio tinklo. |
| Tinklo plokštė | Įrenginio sąsaja ryšiui su tinklu. |

**Tipinė schema (mokomasis pavyzdys):**

```
Internetas / tiekėjas
          │
      Modemas / ONT
          │
    Maršrutizatorius
      ┌───┴────────┐
 Komutatorius   Wi-Fi prieigos taškas
  ┌──┴─────┐          ┌──┴────┐
 PC    Spausdintuvas  Telefonas  Planšetė
```

Schema rodo atskiras funkcijas; namuose maršrutizatorius ir prieigos taškas dažnai yra vienas įrenginys, kartais kartu su modemu ar ONT. Komutatorius neprivalo būti tiesiogiai prijungtas prie interneto, kad vietiniame tinkle perduotų duomenis. Šakotuvas ir komutatorius nėra tas pats. MAC adresas šiame modulyje aiškinamas kaip tinklo sąsajos identifikatorius, naudojamas vietinio ryšio lygmenyje; MAC nėra IP adreso pakaitalas ir gali būti programiškai keičiamas ar atsitiktinamas.

### Praktinės užduotys

**2.1. Parink tinklo įrangą (3 tšk.).** Susiek situaciją su įrenginiu: a) sujungti šešis laidinius kompiuterius į LAN; b) sujungti mokyklos LAN su kitu IP tinklu; c) leisti telefonams prisijungti prie to paties LAN belaidžiu ryšiu. Rinkis iš komutatoriaus, maršrutizatoriaus ir prieigos taško.

**2.2. Sukurk veikiantį tinklą (3 tšk.).** Simuliatoriuje sujunk tiekėją, ONT, maršrutizatorių, komutatorių, du laidinius kompiuterius, spausdintuvą, prieigos tašką ir telefoną. Kompiuteriai bei spausdintuvas jungiami prie komutatoriaus; komutatorius ir prieigos taškas – prie LAN maršrutizatoriaus pusės; telefonas jungiasi per Wi-Fi. Tada atjunk tiekėjo ryšį ir patikrink, kurie duomenų perdavimo keliai lieka veikiantys. Laikyk, kad visas kitas tinklas tinkamai sukonfigūruotas. Pateik išvadą apie vietinį spausdinimą ir interneto prieigą.

**2.3. Šakotuvas ar komutatorius? (3 tšk.).** Keturi kompiuteriai A, B, C, D prijungti prie to paties įrenginio. A perduoda B skirtą kadrą. Palygink, į kuriuos kitus prievadus perduodamas signalas naudojant šakotuvą ir į kurį prievadą komutatorius siunčia kadrą, kai B MAC adresas žinomas. Paaiškink komutatoriaus naudą. Nežinomo gavėjo ir transliacinių kadrų atvejai šiame pavyzdyje nenagrinėjami.

**Pamokos refleksija:** ar maršrutizatorius visada būtinas, kad du to paties LAN kompiuteriai bendrautų tarpusavyje?

---

## 3 pamoka. TCP/IP, duomenų paketai ir IP adresai

### Teorija

Protokolas – taisyklių rinkinys, pagal kurį įrenginiai keičiasi duomenimis. TCP/IP – interneto protokolų šeima. Duomenys perduodami dalimis, kurios turi valdymo informaciją. IP atsako už adresavimą ir paketų nukreipimą tarp tinklų; pats IP negarantuoja pristatymo. TCP užtikrina patikimą, eilės tvarką išlaikantį baitų srautą: aptinka trūkumus ir prireikus pakartotinai siunčia duomenis. Ne visas interneto srautas naudoja TCP – egzistuoja ir UDP, naudojamas, kai svarbi mažesnė delsa arba programos pačios valdo patikimumą.

**Supaprastinta kelionė:** programa → transporto protokolas (pvz., TCP) → IP paketai → vietinis tinklas → maršrutizatoriai → gavėjo tinklas → gavėjo programa. Paketai gali nukeliauti skirtingais maršrutais ir atvykti ne eilės tvarka. TCP prireikus atkuria tinkamą duomenų seką. Ši schema nėra tiksli visų tinklo sluoksnių emuliacija.

### IP adresai

IPv4 adresas sudarytas iš keturių dešimtainių skaičių nuo 0 iki 255, atskirtų taškais (32 bitai), pvz., `192.168.10.11`. Sintaksiškai taisyklingas adresas dar nebūtinai tinka konkrečiam kompiuteriui. IPv6 yra 128 bitų adresavimo sistema; pavyzdys `2001:db8::10` (dokumentacinis adresas).

| Sąvoka | Paaiškinimas |
|---|---|
| Vidinis / privatus IPv4 | Naudojamas vietiniame tinkle; tiesiogiai viešajame internete nemaršrutizuojamas. Privatiems adresams rezervuoti intervalai 10.0.0.0–10.255.255.255, 172.16.0.0–172.31.255.255 ir 192.168.0.0–192.168.255.255. |
| Išorinis / viešasis IP | Viešai maršrutizuojamas adresas, jei atitinkamai suteiktas ir naudojamas. Ne kiekvienas adresas už privataus diapazono ribų yra viešasis (yra ir kitų specialių diapazonų). |
| Statinis IP | Pastovus, nustatomas arba administruojamas taip, kad išliktų tas pats. |
| Dinaminis IP | Suteikiamas automatiškai, gali keistis; neprivalo keistis per kiekvieną prisijungimą. |
| DHCP | Automatiškai suteikia tinklo nustatymus, pvz., IP adresą, kaukę, numatytąjį šliuzą ir DNS serverio adresą. |
| NAT | Dažnai IPv4 tinkluose pakeičia adresus (o kartu su prievadų vertimu – ir prievadus), kad keli vietiniai įrenginiai naudotųsi bendru išoriniu ryšiu. NAT savaime nėra ugniasienė. |
| Numatytasis šliuzas | Įrenginys, kuriam paprastai siunčiami paketai į kitus tinklus; dažniausiai maršrutizatoriaus LAN adresas. |

Privatus ir viešas apibūdina adreso naudojimo sritį; statinis ir dinaminis – suteikimo būdą. Tai dvi skirtingos klasifikacijos. Privatus adresas taip pat gali būti statinis, o viešasis – dinaminis.

### Praktinės užduotys

**3.1. IP adresų patikra (3 tšk.).** a) Kuris iš pateiktų užrašų nėra taisyklingas IPv4: `192.168.10.12`, `10.0.0.8`, `192.168.256.1`? b) Iš `10.0.0.8`, `172.20.5.4`, `192.168.10.12`, `203.0.113.9` atrink visus privataus IPv4 diapazono adresus (paskutinis yra dokumentacinis, ne realus viešasis adresas). c) Paaiškink, ar privatus IP gali būti statinis.

**3.2. Rask konfigūracijos klaidą (3 tšk.).** Simuliuojamo LAN kaukė `255.255.255.0`, šliuzas `192.168.10.1`, visi įrenginiai prijungti prie to paties komutatoriaus. A – `192.168.10.11`, B – `192.168.10.12`, C – `192.168.10.12`, spausdintuvas – `192.168.10.20`. a) Nurodyk konfliktuojančius įrenginius. b) Pasiūlyk C laisvą tinkamą adresą iš `192.168.10.13` ir `192.168.11.13`. c) Paaiškink, kaip tinkamai veikiantis DHCP padeda išvengti dublikatų. Adresų skaičiavimo pagal potinklius iš mokinio nereikalaujama; pateikta taisyklė, kad šiame pavyzdyje LAN įrenginių pirmi trys skaičiai turi būti 192.168.10, o paskutinis – nuo 1 iki 254, nepanaudotas kito įrenginio.

**3.3. Atkurk duomenų kelionę (3 tšk.).** Mokomojoje TCP simuliacijoje trys duomenų dalys sunumeruotos 1, 2, 3. Gavėją pasiekia 3 ir 1, dalis 2 dingsta. a) Kuri dalis trūksta? b) Ką TCP gali padaryti dėl trūkstamos dalies? c) Kokia turi būti galutinė duomenų dalių seka? Paaiškink, kuo TCP funkcija skiriasi nuo IP.

**Pamokos refleksija:** ar telefonas ir kompiuteris viename namų tinkle gali turėti skirtingus vidinius IP, bet naudoti tą patį išorinį IPv4 ryšį?

---

## 4 pamoka. DNS, domenai, URL ir žiniatinklis

### Teorija

Domeno vardas – žmogui patogus hierarchinis vardas, pvz., `mokykla.example`. DNS (domenų vardų sistema) padeda rasti su vardu susietus tinklo duomenis, dažniausiai IPv4 ar IPv6 adresus. DNS serverio atsakymas gali būti gautas iš talpyklos; jei reikia, DNS infrastruktūra randa reikiamą įrašą. DNS pats neperduoda svetainės turinio ir neužtikrina viso ryšio šifravimo.

URL (universalusis ištekliaus adresas) nurodo, kaip pasiekti konkretų išteklių. Domenas yra viena galima URL adreso dalis, o ne visas URL.

**Mokomasis URL:** `https://mokykla.example:443/medziaga/tinklai?klase=11#praktika`

| Dalis | Reikšmė |
|---|---|
| `https` | Schema, nurodanti saugaus HTTP ryšio naudojimą |
| `mokykla.example` | Serverio vardas (host); šiame pavyzdyje domeno vardas |
| `443` | Aiškiai nurodytas prievadas (įprastas numatytasis HTTPS prievadas) |
| `/medziaga/tinklai` | Ištekliaus kelias |
| `klase=11` | Užklausos parametras po `?` |
| `praktika` | Fragmentas po `#`, kurį naršyklė gali naudoti puslapio vietai pasirinkti; HTTP užklausoje fragmentas serveriui nesiunčiamas |

**Kaip atidaroma svetainė?** Supaprastintas naujo HTTPS ryšio scenarijus be talpyklų: naudotojas įveda URL → DNS padeda rasti IP → užmezgamas ryšys su serveriu ir patikrinamas TLS sertifikatas → naršyklė siunčia HTTPS užklausą → serveris grąžina atsakymą → naršyklė atvaizduoja turinį. Reali naršyklė gali naudoti talpyklas ar jau esamus ryšius; šiuolaikinis HTTP/3 naudoja QUIC, todėl ne kiekvienas HTTPS ryšys naudoja TCP.

HTTP – žiniatinklio išteklių užklausų ir atsakymų protokolas. HTTPS – HTTP naudojant TLS apsaugą. HTTPS saugo perduodamų duomenų konfidencialumą bei vientisumą ir leidžia tikrinti serverio tapatybę. HTTPS nereiškia, kad svetainė būtinai sąžininga, teisėta arba be kenkėjiško turinio. Visada tikrink domeną ir naršyklės įspėjimus.

### Praktinės užduotys

**4.1. Išskaidyk URL (3 tšk.).** Nagrinėk `https://biblioteka.example/katalogas/knygos?id=42#aprasymas`. a) Užrašyk schemą ir serverio vardą. b) Užrašyk kelią. c) Užrašyk parametrą ir fragmentą. Pavyzdinis adresas nėra veikianti svetainė.

**4.2. Sudėliok svetainės atidarymo procesą (3 tšk.).** Sudėk žingsnius į logišką eilę, laikydamas, kad nėra talpyklos ir ryšys užmezgamas iš naujo: A – serveris grąžina atsakymą; B – DNS nustato reikiamą IP; C – naršyklė siunčia HTTPS užklausą; D – naudotojas įveda URL; E – naršyklė parodo turinį; F – užmezgamas apsaugotas ryšys ir patikrinamas sertifikatas. Pagrįsk DNS ir HTTPS vaidmenis.

**4.3. Saugus prisijungimas (3 tšk.).** Mokykla nurodo, kad jos prisijungimo puslapis yra `https://mokykla.example/prisijungti`. Simuliacijoje pateikti A `http://mokykla.example/prisijungti`, B `https://mokykla.example/prisijungti`, C `https://mokykla.example.svetimas.example/prisijungti`. Kuris geriausiai atitinka nurodytą adresą, jei sertifikatas galioja ir nėra įspėjimų? Paaiškink, kodėl netinka A ir C. Nurodyk, kodėl vien HTTPS nepakanka pasitikėti svetaine.

**Pamokos refleksija:** kas gali nutikti, kai interneto ryšys veikia, tačiau DNS vardų paieška neveikia?

---

## 5 pamoka. Interneto paslaugos, protokolai ir belaidžių įrenginių sauga

### Teorija

Skirtingos interneto paslaugos naudoja skirtingus protokolus. Protokolo pasirinkimas priklauso nuo to, ką norime atlikti.

| Protokolas | Paskirtis |
|---|---|
| HTTP | Žiniatinklio išteklių perdavimas be TLS apsaugos. |
| HTTPS | HTTP naudojant TLS. |
| FTP | Failų perdavimas; standartinis FTP savaime nešifruoja prisijungimo duomenų ir failų. |
| FTPS | FTP su TLS apsauga. |
| SMTP | Elektroninių laiškų siuntimas ir perdavimas tarp pašto serverių. |
| POP3 | Laiškų atsisiuntimas iš pašto serverio; galima palikti kopijas serveryje, priklausomai nuo nustatymų. |
| IMAP / IMAP4 | Serveryje laikomų laiškų bei aplankų sinchronizavimas tarp įrenginių. |
| DNS | Vardų susiejimas su tinklo informacija, pvz., IP adresais. |
| DHCP | Automatinis tinklo konfigūracijos suteikimas. |

SMTP, POP3 ir IMAP gali veikti naudojant TLS; jų vien pavadinimas neužtikrina saugaus perdavimo. SFTP yra atskiras failų perdavimo per SSH protokolas, ne FTPS sinonimas (papildoma informacija). Pašto laiško siuntimo tarp klientų ir serverių TLS apsauga savaime negarantuoja ištisinio laiško turinio šifravimo.

**Bluetooth susiejimas:** įjungiamas Bluetooth abiejuose įrenginiuose, reikiamas įrenginys perjungiamas į susiejimo režimą, pasirenkamas jo pavadinimas, patvirtinamas sutampantis kodas, jei jo prašoma, patikrinamas veikimas. Nežinomų susiejimo užklausų priimti nereikia. Nebenaudojamą atrandamumo režimą geriau išjungti. Wi-Fi ryšiui rinkis patikimą tinklą, naudok WPA2 arba WPA3, stiprų slaptažodį ir atnaujintus įrenginius. Viešame tinkle venk jautrių veiksmų, jei negali patikrinti ryšio ir svetainės tapatybės. Niekuomet neignoruok netikėto sertifikato įspėjimo.

### Praktinės užduotys

**5.1. Tinkamas protokolas (3 tšk.).** Parink protokolą: a) kompiuterio pašto programa siunčia laišką; b) mokinys nori, kad telefono ir kompiuterio pašto aplankai būtų sinchronizuojami; c) organizacija reikalauja failų perdavimo naudojant FTP su TLS. Rinkis iš SMTP, IMAP4, FTPS, POP3 ir HTTP.

**5.2. Pašto kelionė (3 tšk.).** Pavaizduok: siuntėjo pašto programa → siuntėjo pašto serveris → gavėjo pašto serveris → gavėjo pašto programa. Pažymėk, kuriuose pirmuose dviejuose ryšiuose įprastai naudojamas SMTP, ir paskutiniam ryšiui parink IMAP, jei gavėjas skaito laiškus keliuose įrenginiuose. Paaiškink skirtumą tarp laiškų gavimo su POP3 ir sinchronizavimo su IMAP.

**5.3. Saugus belaidis ryšys (3 tšk.).** Trijose situacijose parink saugų veiksmą ir pagrįsk: a) nepažįstamas įrenginys prašo Bluetooth susiejimo; b) žinomo mokyklos puslapio naršyklė rodo TLS sertifikato įspėjimą; c) reikia siųsti jautrų failą, siūlomas tik nešifruotas FTP arba tinkamai sukonfigūruotas FTPS. Tai simuliacijos, nereikia realiai jungtis prie įrenginių ar perduoti duomenų.

**Pamokos refleksija:** kodėl pašto programoje paprastai reikia atskirai nustatyti laiškų siuntimo ir gavimo paslaugas?

---

## 6 pamoka. Tinklo diagnostika ir problemų sprendimas

### Teorija

Diagnostika – nuoseklus tinklo veikimo tikrinimas, siekiant rasti galimą problemos priežastį. Pradėk nuo paprasčiausių patikrų: fizinis ar belaidis prisijungimas, tinklo konfigūracija, vietinis ryšys, vardų nustatymas ir tik tada konkreti paslauga. Vieno testo rezultatas ne visada įrodo gedimo priežastį.

| Windows komanda | Ką parodo |
|---|---|
| `ipconfig` | IP adresą, kaukę, numatytąjį šliuzą ir pagrindinę konfigūraciją. |
| `ipconfig /all` | Išsamesnę tinklo konfigūraciją, įskaitant DNS ir DHCP informaciją. |
| `ping <adresas>` | Tikrina, ar gaunamas ICMP atsakymas; gali rodyti delsą ir prarastus atsakymus. Nepavykęs ping vienas neįrodo, kad įrenginys neveikia (ICMP gali būti filtruojamas). |
| `nslookup <domenas>` | Padeda patikrinti DNS vardo nustatymą. |
| `tracert <domenas arba IP>` | Parodo atsakančius maršruto mazgus ir apytikslę delsą; ne visi mazgai privalo atsakyti. |

Pateiktos komandos yra papildomos praktinės diagnostikos priemonės, ne atskiras privalomų VBE komandų sąrašas. Simuliatorius turi naudoti fiksuotus mokomuosius rezultatus, nevykdyti komandų operacinėje sistemoje, nesiųsti realių tinklo užklausų ir nerinkti tikrų įrenginių adresų.

### Praktinės užduotys

**6.1. Skaityk diagnostikos rezultatą (3 tšk.).** Mokomasis `ipconfig` išrašas: IPv4 `192.168.10.15`; kaukė `255.255.255.0`; numatytasis šliuzas `192.168.10.1`. a) Užrašyk kompiuterio IP. b) Užrašyk numatytojo šliuzo IP ir jo paskirtį. c) Ar šis kompiuterio adresas privatus, ar viešasis? Remkis teorijoje aprašytais intervalais.

**6.2. Rask tikėtiną problemą (3 tšk.).** Simuliuojamas kompiuteris: `ping 192.168.10.1` atsako; `ping 198.51.100.24` atsako; `nslookup mokykla.example` rodo DNS užklausos laiko viršijimą. Pavyzdiniai adresai veikia tik simuliacijoje. a) Ką rodo pirmasis testas? b) Ką leidžia įtarti trečiasis rezultatas? c) Ką reikėtų tikrinti toliau (DNS nustatymus / paslaugą ar kompiuterio maitinimą)? Pagrįsk, kad tai tikėtina, o ne vienintelė įmanoma priežastis.

**6.3. Gedimų tyrėjas (3 tšk.).** Kiekvienai situacijai nurodyk tikėtiną priežastį ir vieną saugų patikrinimą: A – tik vienas iš dviejų to paties LAN kompiuterių neturi ryšio, jo kabelis neprijungtas; B – visi LAN kompiuteriai gali spausdinti, tačiau neturi interneto, o tiekėjo jungtis maršrutizatoriuje simuliacijoje pažymėta kaip atjungta; C – viena konkreti svetainė neatsidaro, kitos atsidaro. Mokinio tikslas – diagnozuoti, o ne keisti realaus tinklo nustatymus.

**Pamokos refleksija:** kodėl vien nepavykęs ping nėra pakankamas įrodymas, kad neveikia internetas?

---

## Interaktyvių veiklų specifikacija NGG platformai

Šios trys veiklos padeda atlikti praktines užduotis, neapsiriboja dekoratyviomis animacijomis. Visos turi veikti ir klaviatūra, su pasirinkimo valdikliais, be privalomo tempimo pele. Visur aiškiai žymėti „Mokomoji simuliacija“.

### A. Sukurk savo tinklą (2.2)

- Pradiniai įrenginiai: internetas/tiekėjas, ONT, maršrutizatorius (WAN ir LAN pusės), komutatorius, du PC, spausdintuvas, Wi-Fi prieigos taškas, telefonas.
- Mokinys kuria ar šalina jungtis pasirinkdamas abu galus ir ryšio tipą (laidinis arba Wi-Fi); ekrane matoma schema ir sujungimų sąrašas.
- Patikrinti tiekėjo–ONT–maršrutizatoriaus WAN grandinę, LAN įrenginių ryšį ir telefono prisijungimą per prieigos tašką. Konkrečiai 2.2 užduočiai naudojama aprašyta topologija, neteigiant, kad kiti realių tinklų variantai neteisingi.
- Mygtukai „Patikrinti“, „Atjungti tiekėją / Prijungti tiekėją“, „Atkurti“. Patikrinus pateikiamas paaiškinimas, kodėl vietinis spausdinimas gali likti veikiantis.
- Nereikia fizinio mokyklos tinklo, paskyros prisijungimo paslapčių, duomenų siuntimo ar išorinio tinklų simuliatoriaus.

### B. Paketų kelionė ir IP adresai (3.2–3.3)

- Keturių įrenginių IP lentelė su C dublikatu, redaguojamas tik C adresas; visada matomos fiksuotos tinklo taisyklės, šliuzas ir kaukė.
- Tikrinti adreso sintaksę, leidžiamą intervalą ir unikalumą; pateikti konkrečią klaidą, neleisti naudoti šliuzo ar užimto adreso.
- Atskira trijų dalių demonstracija: gavėjas gauna 3 ir 1; mokinys nurodo trūkstamą dalį, po patvirtinimo simuliuojamas pakartotinis siuntimas ir atkuriama 1–2–3 seka. Aiškiai paaiškinti, kad tai supaprastintas TCP modelis.
- Mygtukai „Patikrinti“, „Pakartoti“, „Atkurti“.

### C. Tinklo gedimų laboratorija (6.2–6.3)

- Keturi scenarijai: atjungtas kabelis, atjungta tiekėjo jungtis, DNS sutrikimas, neveikianti viena svetainė. Visi rezultatai išgalvoti, determinuoti ir saugūs.
- Mokinys pasirenka `ipconfig`, vietinio šliuzo `ping`, išorinio mokomojo IP `ping`, `nslookup` arba `tracert`. Ekrane atvaizduojamas simuliuotas atsakymas; nėra tikros komandų eilutės ar tinklo užklausų.
- Mokinys iš galimų priežasčių parenka tikėtiniausią ir pagrindžia sprendimą. Po patikrinimo paaiškinama, ką kiekviena diagnostikos priemonė įrodo ir ko neįrodo.
- Jei ping neatsako, nevertinti to savaime kaip interneto gedimo įrodymo. Scenarijai turi pateikti pakankamai papildomų duomenų.

---

## Savikontrolės klausimai – 30 autorinių VBE tipo klausimų

Klausimai skirti mokymuisi. 1–24 klausimai po 1 tašką, 25–30 po 2 taškus; iš viso 36 taškai. Užduotis su vienu teisingu pasirinkimu pažymima aiškiai. Atvirų klausimų atsakymai vertinami pagal prasmę, ne pagal tikslų teksto sutapimą. Šis rinkinys nėra oficiali NŠA užduotis ir nėra skirtas konfidencialiam atsiskaitymui.

### Pasirenkamasis atsakymas (1–24)

1. Kuris pavyzdys geriausiai apibūdina LAN? A. Pasaulinis internetas; B. Vieno kabineto kompiuterių ir spausdintuvo tinklas; C. Kelių miestų filialų tinklas; D. Naršyklės žymių sąrašas.
2. Koks teiginys apie Wi-Fi teisingas? A. Wi-Fi visada reiškia veikiančią interneto prieigą; B. Wi-Fi veikia tik su šviesolaidžiu; C. Wi-Fi yra žiniatinklis; D. Wi-Fi gali veikti ir vietiniame tinkle be interneto.
3. Kuo internetas skiriasi nuo WWW? A. WWW yra viena iš internetu teikiamų paslaugų; B. Internetas yra naršyklė; C. WWW yra maršrutizatorius; D. Jie visada reiškia tą patį.
4. Koks ryšys tinkamiausias telefonui susieti su netoliese esančiomis belaidėmis ausinėmis? A. FTP; B. Ethernet; C. Bluetooth; D. SMTP.
5. Kuris įrenginys pirmiausia skirtas jungti skirtingus IP tinklus? A. Šakotuvas; B. Maršrutizatorius; C. Spausdintuvas; D. Prieigos taškas.
6. Kuris įrenginys LAN perduoda žinomo individualaus gavėjo Ethernet kadrą į atitinkamą prievadą? A. Komutatorius; B. Modemas; C. Šakotuvas; D. DNS serveris.
7. Kam skirtas prieigos taškas? A. Automatiškai suteikti pažymius; B. Pakeisti domeną URL fragmentu; C. Priimti el. laiškus; D. Prijungti belaidžius įrenginius prie vietinio tinklo.
8. Ką daro modemas arba šviesolaidžio ONT tipinėje namų tinklo schemoje? A. Rodo svetainės turinį; B. Siunčia elektroninius laiškus; C. Užtikrina fizinės interneto prieigos su tiekėju sąsają pagal ryšio technologiją; D. Visada pakeičia komutatorių.
9. Kuris užrašas nėra taisyklingas IPv4 adresas? A. `192.168.1.10`; B. `10.0.0.8`; C. `172.16.2.1`; D. `192.168.300.1`.
10. Kuris adresas priklauso privačiam IPv4 diapazonui? A. `8.8.8.8`; B. `192.168.5.11`; C. `1.1.1.1`; D. `9.9.9.9`.
11. Koks protokolas paprastai automatiškai suteikia IP adresą ir kitus tinklo nustatymus? A. DHCP; B. SMTP; C. FTP; D. HTTPS.
12. Kuri užduotis būdinga TCP, o ne IP adresavimui? A. Domenų vardų suteikimas; B. Wi-Fi slaptažodžio kūrimas; C. Patikimo, eilės tvarką išlaikančio duomenų srauto užtikrinimas; D. HTML puslapio piešimas.
13. Kam pirmiausia naudojamas DNS? A. Automatiškai nustatyti monitoriaus ryškumą; B. Šifruoti visą interneto srautą; C. Rasti su domenų vardais susietus IP adresus; D. Siųsti el. laiškus.
14. Kuris yra serverio vardas adrese `https://mokykla.example/temos/tinklai`? A. `mokykla.example`; B. `https`; C. `/temos/tinklai`; D. `tinklai`.
15. Ką papildomai suteikia HTTPS, lyginant su neapsaugotu HTTP? A. Garantuoja visų svetainės teiginių teisingumą; B. Panaikina DNS poreikį visais atvejais; C. Garantuoja, kad svetainė neturi virusų; D. TLS apsaugą ir galimybę patikrinti serverio tapatybę.
16. Kokia adreso `https://mokykla.example/tinklai?klase=11` dalis yra kelias? A. `klase=11`; B. `/tinklai`; C. `https`; D. `mokykla.example`.
17. Kuris protokolas paprastai naudojamas elektroniniams laiškams siųsti? A. SMTP; B. POP3; C. IMAP; D. DHCP.
18. Kuris protokolas tinka pašto aplankams sinchronizuoti telefone ir kompiuteryje? A. FTP; B. HTTP; C. SMTP; D. IMAP.
19. Kuo FTPS skiriasi nuo standartinio FTP? A. FTPS yra tik el. pašto protokolas; B. FTPS naudoja TLS apsaugą; C. FTPS negali perduoti failų; D. FTP ir FTPS visada vienodai šifruoja duomenis.
20. Ką daryti gavus netikėtą nežinomo įrenginio Bluetooth susiejimo užklausą? A. Patvirtinti bet kokį kodą; B. Išsiųsti įrenginiui slaptažodį; C. Atmesti užklausą, jei susiejimas nebuvo inicijuotas; D. Išjungti visų įrenginių saugos funkcijas.
21. Kuri komanda padeda peržiūrėti savo Windows kompiuterio IP konfigūraciją? A. `ipconfig`; B. `nslookup`; C. `tracert`; D. `dir`.
22. Kuri komanda skirta DNS vardo nustatymo patikrai? A. `ping` be argumento; B. `ipconfig`; C. `mkdir`; D. `nslookup`.
23. Kuris teiginys apie nepavykusį ping teisingas? A. Jis visada įrodo, kad neveikia visas internetas; B. Atsakymo gali nebūti ir dėl ICMP filtravimo; C. Jis visada įrodo, kad sugedo monitorius; D. Jis visada rodo netinkamą Wi-Fi slaptažodį.
24. Ką pirmiausia tikėtina reikėtų tikrinti, jei simuliacijoje vietinis ir išorinis IP pasiekiami, bet DNS vardų nustatymas neveikia? A. Klaviatūros bateriją; B. Spausdintuvo tonerį; C. DNS konfigūraciją ir paslaugą; D. Monitoriaus skiriamąją gebą.

### Struktūriniai ir trumpojo atsakymo klausimai (25–30)

25. (2 tšk.) Mokyklos kompiuteriai gali naudotis vietiniu spausdintuvu net tada, kai nutrūko ryšys su interneto tiekėju. Įvardyk vietinio tinklo tipą ir paaiškink, kodėl spausdintuvas gali veikti.
26. (2 tšk.) Mokykla turi komutatorių ir maršrutizatorių. Paaiškink abiejų įrenginių skirtingas pagrindines funkcijas.
27. (2 tšk.) Vieno kompiuterio IPv4 yra `192.168.10.11`, antro – `192.168.10.11`, abu tame pačiame LAN. Nurodyk problemą ir vieną tinkamą jos sprendimą, nekeisdamas realių įrenginių konfigūracijos.
28. (2 tšk.) Adresas `https://biblioteka.example/knygos?id=7`. Nurodyk serverio vardą ir paaiškink DNS paskirtį atidarant šį adresą (mokomasis domenas).
29. (2 tšk.) Mokinys naudoja telefoną ir kompiuterį laiškams skaityti bei nori, kad aplankai būtų sinchronizuojami. Įvardyk tinkamą laiškų skaitymo protokolą ir laiškų siuntimo protokolą.
30. (2 tšk.) Simuliacijoje kompiuteris sėkmingai gauna atsakymą iš vietinio šliuzo, tačiau DNS vardo nustatymas nesėkmingas. Įvardyk tikėtiną sutrikimą ir vieną priemonę jam papildomai patikrinti. Paaiškinti, kodėl negalima iš vieno požymio garantuoti gedimo priežasties, galima papildomai, bet tai ne atskiras taškas.

---

## Šaltiniai ir metodinės nuorodos

- Oficialus informatikos mokymo(si) turinys, III gimnazijos klasė: https://emokykla.lt/bendrosios-programos/vidurinis-ugdymas/3?st=1 (30.4.1 „Kompiuterių tinklai“).
- Informatikos vidurinio ugdymo bendrosios programos įgyvendinimo rekomendacijos, 2025-03-31: https://emokykla.lt/upload/files/2025/04/01/vidurinio-ugdymo-informatikos-bp-ir-2025-03-31.pdf (rekomenduojamos 6 valandos).
- LInMA metodinė medžiaga III gimnazijos klasei, teorija ir užduotys: https://emokykla.lt/metodine-medziaga/medziaga/perziura/265
- LInMA diagnostiniai testai (10 tema – kompiuterių tinklai): https://emokykla.lt/metodine-medziaga/medziaga/perziura/446
- NŠA informatikos VBE vertinimo gairės, 2026-02-09: https://emokykla.lt/upload/files/2026/02/09/informatikos-vertinimo-gaires-2026-02-09-final.pdf?r=1 (pateikiami ir tinklų klausimų pavyzdžiai).

Programos reikalavimais ir vertinimo gairėmis remtasi parenkant temas bei klausimų pobūdį. Visos čia pateiktos teorijos formuluotės, situacijos, praktinės užduotys ir savikontrolės klausimai parengti šiam mokomajam moduliui, o ne nukopijuoti iš oficialių egzaminų ar LInMA failų.
