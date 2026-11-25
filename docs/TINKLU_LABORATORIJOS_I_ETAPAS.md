# Kompiuterių tinklų tyrinėjimo laboratorija – I etapas

> Ankstesnio vietinio kūrimo etapo ataskaita. Vėliau naudotojo patvirtintas prijungimas prie pamokos aprašytas [paskelbimo dokumente](TINKLU_PAMOKOS_PASKELBIMAS.md).

2026-11-25. Parengta vietinėje `codex/network-inquiry-stage1` šakoje. Veikianti svetainė nepakeista, į GitHub niekas nesiųsta. II etapas nepradėtas.

## Įgyvendintas rezultatas

| Laboratorija | Veiklos ir funkcijos |
| --- | --- |
| Tinklo konstruktorius | 7 situacijos: trijų kompiuterių spausdinimas, interneto prijungimas, tiekėjo atjungimas, switch/hub palyginimas, du LAN, belaidis klientas, dalinė išorinė prieiga. Visi 11 prašytų įrenginių tipų; pridėjimas, tempimas, padėties mygtukai, kabeliai, prievadai, Wi-Fi/SSID, šalinimas, maitinimas ir konfigūracija. |
| Paketų kelionė | 5 situacijos: pristatymas, praradimas, kita atvykimo seka, nutrūkę keliai ir vėlavimas. Žinutės skaidymas, TCP/UDP, pradžia, pauzė, žingsniavimas, sulėtinimas, mokomoji antraštė, UTF-8 baitų pozicijos, gyvas kelio nutraukimas, baigtiniai pakartojimai ir įvykių žurnalas. |
| IP eksperimentai | 6 situacijos: dublikatas, kitas /24, šliuzas, DNS, DHCP, privatus adresas su NAT. Rankinė ir automatinė konfigūracija; LAN, router, išorinio IP ir svetainės patikros; paslaugų būsenų keitimas, nuomos gavimas ir atlaisvinimas. |

Kiekviena iš 18 veiklų turi penkis etapus: **Suprask → Numatyk → Tyrinėk → Pasitikrink → Įsivertink**. Iš viso sukurti 72 autoriniai savikontrolės klausimai, po keturis veiklai. Tai nėra oficialių egzaminų kopijos ar konfidencialūs mokytojo atsiskaitymų atsakymai.

Prieš plečiant veiklas patikrinta viena visa `lan-print` eiga: teorija, hipotezė, nesėkmingas ir sėkmingas LAN bandymas, grįžimas neprarandant schemos, savikontrolė, subjektyvus įsivertinimas ir perkrovimas. Tuo metu praėjo pirmieji 12 logikos testų. Tik po šios patikros tas pats mokymosi pagrindas pritaikytas likusioms veikloms.

Savikontrolė apima vieną ir kelis pasirinkimus, susiejimą, seką, schemos analizę bei trumpus atvirus paaiškinimus. Kiekvienoje veikloje yra nauja praktinė situacija. Atviri atsakymai lyginami su kriterijais; automatinis procentas skaičiuojamas tik iš trijų objektyvių klausimų. Hipotezė ir pasitikėjimas savimi rezultato nedidina ir nemažina. Klaidos turi paaiškinimus ir grįžimą prie konkrečios susijusios sąvokos. Kartojant keičiasi pasirinkimų išdėstymas; naujų lygiaverčių klausimų variantų bankas numatytas III etape.

Trys sudėtingumo lygiai, laisvas tyrinėjimas, trijų lygių palaipsnės užuominos, išvada, iki 40 paskutinių bandymų istorija, konkretaus eksperimento atkūrimas. Žemas rezultatas neblokuoja kitos veiklos. Navigacijos žyma reiškia praktikos tikslą, atliktą bandymą ir 100 % objektyvią savikontrolę, ne oficialų pažymį.

## Tikros modeliavimo taisyklės

Konstruktorius ir IP laboratorija naudoja tą patį prievadų grafą bei `probe` funkciją. Tinkamumas vertinamas pagal pasiekiamumą, o ne vieną autoriaus schemą. Patikrintas ir veikiantis variantas su dviem komutatoriais. Galiniai kompiuteriai savaime neperduoda svetimo srauto kaip komutatoriai.

Paketų laboratorija naudoja bendrą kelio paiešką ir atskirą virtualaus laiko modelį. Nutraukus kelio jungtį kelyje buvusi dalis nepasiekia gavėjo. TCP gali ją kartoti veikiančiu alternatyviu keliu; UDP gavėjo programoje nėra papildomo atkūrimo. Eiliškumo ir praradimo tikslams būtini palyginami tos pačios žinutės bandymai. Skirtingas animacijos greitis nekeičia virtualaus rezultato.

Aiškiai nurodytos ribos:

- Tik /24, tiesiogiai prie vieno maršrutizatoriaus prijungti LAN ir vienas mokomasis WAN. LAN1/LAN2 yra atskiros L3 sąsajos; jos neatitinka įprasto namų router bendro komutatoriaus lizdų.
- Switch žino gavėjo MAC prievadą; MAC mokymasis ir broadcast atskirai nesimuliuojami. Hub kartoja fizinį signalą ir į kitas šakas. L2 kilpa pažymima kaip nepalaikoma, nes STP neįgyvendintas.
- Wi-Fi modeliuojama AP asociacija ir SSID, ne radijo signalo fizika. Vienas kliento radijas siejamas su vienu AP. Signalo tyrimas numatytas II etape.
- Mokomajame TCP numatyti daugiausia trys pakartojimai; tai nėra universali TCP standarto taisyklė. ACK, langai ir dinaminis maršrutų perskaičiavimas neimituojami.
- DHCP nuoma išlieka išjungus serverį. Šio trumpo bandymo virtualus nuomos laikrodis nesibaigia; galima aiškiai atlaisvinti nuomą ir bandyti ją gauti vėl. DHCP relay neįgyvendintas.
- NAT reikalingas dėl aiškios prielaidos, kad virtualus tiekėjas neturi grįžtamojo maršruto į privatų LAN. NAT nėra ugniasienė. DNS patikra šiame etape neturi talpyklos ar rekursijos; jų modelis numatytas II etape.
- Mokomoji ryšio patikra nėra tikro ICMP ping, ugniasienių ar visos operacinės sistemos emuliacija. Fiziniai ir Wi-Fi adresai iš kompiuterio nerenkami.

## Saugumas ir išsaugotas funkcionalumas

Pradėta nuo švaraus `a030b577d4a106b4513b57ca85cf2b3ff97b9535` commit, sukūrus atskirą vietinę šaką. Ankstesnė `codex/network-learning-module` šaka ir atskira ankstesnių platformos pataisų darbo kopija paliktos.

Visos šešios ankstesnės pamokos, 18 praktinių užduočių, trys trumpieji bandymai ir ankstesnis 30 klausimų bankas išliko. Į pagrindinį temos puslapį pridėtos nuorodos į naują studiją; senasis puslapio adresas išsaugotas. Pradinis teorijos turinys tikrinamas automatiniu testu.

Nekeistos paskyros, autentifikavimas, RLS, pažymiai, atsiskaitymai, mokinių failai, Supabase ar produkcinis diegimas. Nėra išorinių mokamų paslaugų, naujų priklausomybių ar CDN. Nauji studijos failai sudaro apie 140 KB be glaudinimo; veikiančios platformos našumo šiame etape nematavome ir prisijungimo kodo nekeitėme.

Naujo puslapio CSP nustato `connect-src 'none'`. Peržiūros serveris klausosi tik `127.0.0.1:4179` ir pateikia baigtinį leidžiamų failų sąrašą. Programos konfigūracija, `.git`, mokytojo failas ir pirminė mokomoji medžiaga per jį neprieinami.

Pažanga saugoma tik `ngg.network.inquiry.v1` naršyklės `localStorage` rakte; duomenys niekur nesiunčiami. Sugadinta būsena patikrinama / atkuriama, nepasiekiama saugykla neužblokuoja darbo. Tai nėra apsauga nuo paties naudotojo pakeitimų savo naršyklėje, todėl duomenys netinka oficialiam vertinimui. Bendrame mokyklos naršyklės profilyje pažanga bendra; pabaigus galima išvalyti tik šio modulio įrašą. Simuliacijoje rašytini tik išgalvoti pavyzdžiai.

## Patikros

| Patikra | Rezultatas |
| --- | --- |
| Automatiniai Node testai | 73/73: 43 naujos laboratorijos ir 30 ankstesnio modulio testų. |
| Logikos apimtis | Alternatyvios topologijos, prievadai, maitinimas, L2 kilpa, SSID, du LAN, /24 ir rezervuoti adresai, DNS/HTTP skirtumas, DHCP nuoma, NAT, paketų praradimas, seka, kelio nutraukimas, vėlavimas, baigtinumas, vertinimas ir saugyklos atkūrimas. |
| Izoliuota HTTP peržiūra | 28 leidžiami modulio ištekliai, 5 blokuojami keliai, peradresavimas ir CSP patikrinti. |
| Naršyklės veiklos | Atverti visų 18 veiklų visi penki etapai; 72 klausimai ir trijų sąvokų teorija pateikiami. |
| Funkcinė naršyklės patikra | Užfiksuotos 65 sėkmingos patikros. LAN konstravimas, tempimas ir padėties mygtukai, hub/switch, maitinimas, laisvas režimas ir užuominos; TCP/UDP, pauzė/žingsnis, kelio nutraukimas; DNS ir DHCP taisymas, atkūrimas; 0 % ir 100 %, grįžimas prie sąvokos, atskiras įsivertinimas ir puslapio perkrovimas. Konsolėje klaidų ar įspėjimų neužfiksuota. |
| Ekranai | Visos trys laboratorijos patikrintos 320, 390, 768 ir 1280 px pločiuose. Dokumentas horizontaliai neišsiplečia; didelės schemos slenkamos savo srityje. Mobilioji teorija patikrinta vizualiai. |
| Įrodymai | Tikros vietinės naršyklės nuotraukos ir funkcinių patikrų žurnalas `.local/` kataloge. Tai sintetiniai bandymai; į Git šis katalogas neįtraukiamas. |

Automatiniai testai tikrina modelį, o naršyklės patikros atliktos per tikrus valdiklius. Tai nėra visų galimų tinklo topologijų ar visų mokyklos naršyklių sertifikavimas. Prieš viešą naudojimą tikslinga mokytojo pedagoginė peržiūra ir bandomoji pamoka numatytuose kompiuteriuose.

## Failai

- `learning-materials/tinklai/tyrinejimas.html` – naujas studijos įėjimas.
- `learning-materials/tinklai/tyrimas/` – įrenginiai, grafas, scenarijai, vertinimas, paketų modelis, trijų laboratorijų sąsajos, mokymosi komponentai, animacijos, SVG ir stilius, vietinė pažanga bei jos atkūrimas.
- `learning-materials/kompiuteriu-tinklai-teorija.html`, `learning-materials/tinklai/module.css` – integravimo nuorodos ir jų išvaizda.
- `tests/inquiry-engine.test.mjs`, `tests/inquiry-scenarios.test.mjs` – nauji testai. `tests/network-module.test.mjs` vietinių nuorodų patikra papildyta fragmentų palaikymu ir LF/CRLF eilučių pabaigų suvienodinimu palyginimui, išsaugant teorijos ir izoliacijos reikalavimus.
- `scripts/preview-safe.mjs`, `scripts/check-network-preview.mjs` – išplėstas izoliuotos peržiūros leidžiamų failų sąrašas ir jo patikra.
- Ši ataskaita ir `TINKLU_LABORATORIJU_II_III_ETAPU_PLANAS.md` – įgyvendinimo ribos ir tolesnis planas.

## Vietinė peržiūra ir grįžimas

Projekto `informatika11-12-tinklai` kataloge paleisti:

```powershell
node scripts/preview-safe.mjs
```

Atverti `http://127.0.0.1:4179/learning-materials/tinklai/tyrinejimas.html`. Baigus peržiūrą serveris stabdomas `Ctrl+C`. Modulių neatverti tiesiogiai per `file://`, nes naršyklė gali blokuoti ES modulių importus.

Pakartojama logikos patikra:

```powershell
node --test tests/network-module.test.mjs tests/inquiry-engine.test.mjs tests/inquiry-scenarios.test.mjs
node scripts/check-network-preview.mjs
```

Antrai komandai turi veikti vietinis serveris. Ji nesikreipia į produkcinę svetainę.

Grįžimo taškas yra `a030b577` ir ankstesnė `codex/network-learning-module` šaka. Prieš keičiant šaką išsaugoti bet kokius vėliau atsiradusius vietinius pakeitimus. Kadangi niekas nepaskelbta, produkcinio grąžinimo ar DB atkūrimo dabar nereikia.

Toliau reikia **I etapo peržiūros ir patvirtinimo pradėti II etapą**. Leidimas pradėti II etapą savaime nėra leidimas skelbti į produkciją. [II ir III etapų techninis planas](TINKLU_LABORATORIJU_II_III_ETAPU_PLANAS.md) išlaiko visas likusias užduotis, įskaitant bendrą baigiamąjį testą.

## Techniniai šaltiniai

- [Programos įgyvendinimo rekomendacijos](https://emokykla.lt/upload/files/2025/04/01/vidurinio-ugdymo-informatikos-bp-ir-2025-03-31.pdf) – tinklų temos mokymo kontekstas; papildomi modelio mechanizmai nevadinami atskirais privalomais VBE reikalavimais.
- [Cisco: Ethernet switch](https://www.cisco.com/site/us/en/learn/topics/networking/what-is-an-ethernet-switch.html) – hub ir switch funkcijos.
- [RFC 1122](https://www.rfc-editor.org/rfc/rfc1122.html#section-3.3.1) – vietiniai ir nutolę IP tikslai.
- [RFC 2131](https://www.rfc-editor.org/rfc/rfc2131.html#section-4.4.5) – DHCP nuomos naudojimas ir galiojimas.
- [RFC 1034](https://www.rfc-editor.org/rfc/rfc1034.html) – DNS paskirtis.
- [RFC 3022](https://www.rfc-editor.org/rfc/rfc3022.html#section-2.2) – adresų ir prievadų vertimo kontekstas.
- [RFC 9293](https://www.rfc-editor.org/rfc/rfc9293.html) ir [RFC 8085](https://www.rfc-editor.org/rfc/rfc8085.html#section-3.3) – TCP ir UDP savybės bei programos atsakomybė.
- [RFC 5737](https://www.rfc-editor.org/rfc/rfc5737.html) – dokumentaciniai IPv4 intervalai.
