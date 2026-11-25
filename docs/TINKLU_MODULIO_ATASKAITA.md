# Kompiuterių tinklų mokymosi modulis

> Ankstesnio vietinio kūrimo etapo ataskaita. Vėliau naudotojo patvirtintas prijungimas prie pamokos aprašytas [paskelbimo dokumente](TINKLU_PAMOKOS_PASKELBIMAS.md).

Patikra: 2026-11-25. Būsena: parengta vietinė versija; paskelbimui reikia naudotojo galutinio patvirtinimo.

## Rezultatas

Atnaujintas esamas `learning-materials/kompiuteriu-tinklai-teorija.html` puslapis. Adresas nekeičiamas, todėl Supabase mokymosi failo nuorodos taisyti nereikia.

| Dalis | Įgyvendinta |
| --- | --- |
| Teorija | Visos šešios pateiktos pamokos: tikslai, teorija, pavyzdžiai, lentelės, schemos, sąvokos, praktikos nuorodos ir refleksija. Papildomi paaiškinimai pažymėti ir dalis jų išskleidžiami. |
| Praktika | Visos 18 originalių užduočių. Pasirinkimai, susiejimas, keli atsakymai, trumpos įvestys, URL dalys, šešių veiksmų seka, LAN schema, IP ir gedimų analizė. |
| Laboratorija A | Aštuonių jungčių tinklas, laidinis ir Wi-Fi ryšys, WAN ir LAN atskyrimas, jungčių pridėjimas ir šalinimas, klaidų paaiškinimas, tiekėjo atjungimas ir vietinis spausdinimas. |
| Laboratorija B | Sintetinis LAN, IP sintaksė, tinklo ribos, dublikatai ir šliuzo rezervacija; DHCP modelis; dingusi dalis, pakartotinis siuntimas, sekos atkūrimas, TCP ir IP skirtumas. |
| Laboratorija C | Keturi gedimų scenarijai. Simuliuojamos `ipconfig /all`, dvi `ping` patikros, `nslookup`, `tracert`. Išvada grindžiama bent dviem skirtingomis patikromis. |
| Savikontrolė | Visi 24 uždari ir 6 atviri autoriniai klausimai. Atsitiktiniai 10 arba visi 24, grįžimas prie atsakymų, procentai, klaidos, paaiškinimai, kartotinos pamokos ir naujas bandymas. |

Atviri paaiškinimai nevertinami pagal simbolių sutapimą. Rodomi prasminiai kriterijai. Praktikos objektyvių laukų skaičius aiškiai atskirtas nuo visos užduoties taškų. 4.2 užduoties seka verta 2 taškų; tik vienas gretimų veiksmų sukeitimas vertas 1 taško. Abiejų protokolų paaiškinimas vertinamas atskirai iki 1 taško. Savikontrolė nėra pažymys.

## Turinys ir šaltiniai

Perskaityti abu pateikti failai. Mokinio medžiaga išsaugota `learning-materials/tinklai/medziaga.md`; generatorius iš jos sukuria teoriją, 18 užduočių sąlygas ir 30 klausimų. Mokytojo atsakymų failas perskaitytas tik vietoje ir į projektą nekopijuotas. Viešame savikontrolės kode pateikiamas mokymuisi skirtas grįžtamasis ryšys, ne konfidencialaus atsiskaitymo bankas.

Faktinių klaidų, dėl kurių reikėtų keisti pateiktus teisingus atsakymus, nenustatyta. Išlaikyti visi 24 mokytojo rakto atsakymai ir šešių atvirų klausimų taškų ribos. URL įvesties tikrinime schema ir serverio vardas nepriklauso nuo raidžių dydžio; kelias, parametras ir fragmentas tikrinami išlaikant jų rašybą.

Patikrintos techninės ribos: privatus adresas gali būti statinis; ne kiekvienas neprivatus adresas yra viešasis; NAT nėra ugniasienė; DHCP nesuteikia absoliučios apsaugos nuo rankinių konfliktų; TCP ir IP turi skirtingas funkcijas; POP3 gali palikti kopijas; FTPS ir SFTP skiriasi; nepavykęs `ping` ir tarpinė `tracert` žvaigždutė savaime neįrodo gedimo. Laboratorijoje IP ryšys ir DNS gali veikti, nors vienos svetainės HTTP paslauga neveikia.

- [Informatikos programos įgyvendinimo rekomendacijos](https://emokykla.lt/upload/files/2025/04/01/vidurinio-ugdymo-informatikos-bp-ir-2025-03-31.pdf) – temos apimtis ir šešių pamokų planavimas.
- [TCP, RFC 9293](https://www.rfc-editor.org/rfc/rfc9293.html) ir [DHCP, RFC 2131](https://www.rfc-editor.org/rfc/rfc2131.html) – perdavimo bei konfigūracijos funkcijos.
- [Privatūs IPv4, RFC 1918](https://www.rfc-editor.org/rfc/rfc1918.html), [dokumentaciniai IPv4, RFC 5737](https://www.rfc-editor.org/rfc/rfc5737.html) ir [URL, RFC 3986](https://www.rfc-editor.org/rfc/rfc3986.html) – adresų ir URL taisyklės.
- [Microsoft ping](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/ping) ir [Microsoft tracert](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/tracert) – diagnostikos rezultatų ribos.

## Patikrų rezultatai

| Patikra | Rezultatas |
| --- | --- |
| `node --test tests/network-module.test.mjs` | 30 iš 30 testų praėjo. |
| JavaScript sintaksė | Modulio, generatoriaus ir peržiūros serverio patikros praėjo. |
| Turinys | 6 pamokos, 18 užduočių, 24 uždari ir 6 atviri klausimai; sąlygos išliko; raktas sutampa. |
| Visos 18 formų naršyklėje | Patikrintos tuščios įvestys, objektyvūs atsakymai ir kriterijai; sekos 0/2, 1/2 ir 2/2 rezultatai. |
| Laboratorija A | Patikrintos netinkamos, pasikartojančios ir savęs jungtys, visi aštuoni teisingi ryšiai, šalinimas ir tiekėjo atjungimas. |
| Laboratorija B | Dublikatas ir netaisyklingas IP atmesti, tinkamas adresas priimtas, DHCP veikia; neteisinga dingusi dalis atmetama, 2 dalis persiunčiama, galutinė seka tikrinama. |
| Laboratorija C | Visos 20 scenarijaus ir komandos kombinacijų, teisingos ir klaidingos priežastys, įrodymų reikalavimas, būsenos išvalymas. |
| Savikontrolė naršyklėje | 1/10 = 10 %, 24/24 = 100 %, neatsakytų klausimų įspėjimas, klaidų paaiškinimai, atsakymo išlaikymas grįžus ir pakartojimas. Visų šešių atvirų klausimų kriterijai. |
| Navigacija | Visos vidinės nuorodos turi paskirties elementą; nėra pasikartojančių ID; išsaugotos 11 senų fragmentų nuorodų; pasikartojantis paspaudimas atveria užvertą pamoką. |
| Ekranų dydžiai | Visos keturios dalys patikrintos ties 320, 390, 768 ir 1280 px. Puslapis horizontaliai neišsiplečia; didelės schemos ir lentelės turi savo slinkimą. |
| Naršyklės konsolė | Patikros metu klaidų ir įspėjimų neužfiksuota. |
| Vietinis HTTP | Visi 6 modulio ištekliai pasiekiami. Penki draudžiami keliai, įskaitant konfigūraciją ir mokytojo failą, grąžina 404. Pradinis adresas teisingai nukreipia į modulį. |

Naršyklės patikros atliktos Chromium aplinkoje; atskira Firefox ir Safari patikra neatlikta. Vietiniai įrodymai: `.local/browser-checks.json`, `.local/tinklai-desktop.jpg`, `.local/tinklai-mobile.jpg`, `.local/tinklai-laboratorija.jpg`. Jie neįtraukiami į Git. Patikros pakartojimo eiga pateikta `docs/TINKLU_MODULIO_PATIKRA.md`.

## Duomenys, greitis ir integracija

Supabase pakeitimų nereikia. Nekviesta produkcinė duomenų bazė, nekeista schema, RLS, paskyros, pažymiai, failai ar atsiskaitymo mechanizmas. Modulis neturi Supabase kliento. Laboratorijos nevykdo tikrų komandų ir nerenka įrenginių adresų. CSP draudžia modulio tinklo užklausas (`connect-src 'none'`).

Visi atsakymai saugomi tik atverto puslapio atmintyje: perkrovus jie išvalomi. Ši savybė aiškiai nurodyta mokiniui. Pažangos sinchronizavimas tarp įrenginių neįtrauktas.

Moduliui reikia šešių vietinių išteklių, iš viso apie 135 kB nesuspausto turinio. Nėra išorinių šriftų, JS bibliotekų ar paslaugų užklausų. Teorija pateikiama statiniame HTML. Produkcinio tinklo įkėlimo sparta šioje vietinėje patikroje nematuota.

## Git ir paskelbimas

- Darbo katalogas: `informatika11-12-tinklai`.
- Vietinė šaka: `codex/network-learning-module`.
- Bazė: `c21078f46d678b7f106cc9e69b45857ab1fbc159`. 2026-11-25 GitHub `main` patikrintas skaitymo operacija ir sutampa su baze.
- Ankstesnė šaka `codex/login-review-submissions` ir jos darbai išsaugoti atskirame kataloge; jie neprijungti prie šio modulio.
- Vienintelis pakeistas esamas mokymosi puslapis: `learning-materials/kompiuteriu-tinklai-teorija.html`.
- Nauji failai: `.gitignore`; šeši `learning-materials/tinklai/` failai; trys `scripts/` failai; `tests/network-module.test.mjs`; du šio modulio `docs/` aprašai.
- Nieko neįkelta į GitHub ir nepaskelbta veikiančioje svetainėje.

Prašomas kitas veiksmas: patvirtinti būtent šio tinklų modulio paskelbimą per atskirą GitHub pakeitimų užklausą į `main`, po jos patikrų – GitHub Pages atnaujinimą. Prieš vykdant dar kartą patikrinti tuometinę `main` būseną, kad nebūtų perrašyti vėlesni darbai. Kitų vietinių patobulinimų šis patvirtinimas neapima.

Grįžimas: atšaukti tik modulio commit / sujungimo pakeitimą nauju `git revert` įrašu, patikrinti rezultatą ir paskelbti per tą patį peržiūros procesą. Nenaudoti `reset --hard` ar priverstinio `push`. Senas puslapis išlieka bazės istorijoje; duomenų bazės grąžinimas nereikalingas.
