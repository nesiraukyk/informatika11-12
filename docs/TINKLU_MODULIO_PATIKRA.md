# Tinklų modulio tikrinimas ir priežiūra

Komandas vykdyti iš `informatika11-12-tinklai` projekto katalogo. Pakanka Node.js 18 arba naujesnės versijos; papildomų paketų nereikia.

## Automatinė patikra

```powershell
node scripts/build-network-content.mjs
node --check learning-materials/tinklai/module.js
node --test tests/network-module.test.mjs
git diff --check
```

Generatorius skaito tik viešą mokinio medžiagą. Jis atnaujina `content.js` ir šešias teorijos pamokas tarp HTML žymų `THEORY START` / `THEORY END`. Praktikos laukų aprašai bei individualus grįžtamasis ryšys yra `activities.js`; simuliacijų ir vertinimo logika – `core.js`; sąsajos veikimas – `module.js`.

## Izoliuota peržiūra

Pirmame terminale:

```powershell
node scripts/preview-safe.mjs
```

Antrame terminale:

```powershell
node scripts/check-network-preview.mjs
```

Atverti `http://127.0.0.1:4179/learning-materials/kompiuteriu-tinklai-teorija.html`. Serveris klausosi tik šio kompiuterio. Teikiamas konkretus modulio failų sąrašas ir dizaino pavyzdžio puslapis; programos konfigūracija, kiti projekto failai ir mokytojo medžiaga neteikiami. Baigus sustabdyti pirmą terminalą su Ctrl+C.

## Naršyklės regresijos scenarijai

1. Atverti kiekvieną iš šešių pamokų. Patikrinti lietuviškas raides, tikslus, lenteles, papildomus paaiškinimus, refleksiją ir nuorodas į užduotis. Sugrįžti tuo pačiu pamokos adresu užvėrus pamoką.
2. Visose 18 praktinių formų patikrinti tuščią bandymą, teisingus ir klaidingus pasirinkimus. 1.3 užduotyje sujungti penkis įrenginius ir pažymėti LAN. 4.1 išlaikyti kelio, parametro ir fragmento raidžių dydį. 4.2 bandyti teisingą seką, vieną gretimų veiksmų sukeitimą ir kelias klaidas. Atviri paaiškinimai turi gauti kriterijus, ne automatinį pažymį.
3. A laboratorijoje pridėti ir pašalinti netinkamą jungtį. Bandyti sujungti tą patį įrenginį su savimi bei pakartoti jungtį. Sudaryti visą reikalaujamą tinklą. Atjungti tiekėją: A ir telefonas turi pasiekti spausdintuvą, A neturi pasiekti interneto. Atkurti tuščią schemą.
4. B laboratorijoje bandyti pasikartojantį `.12`, šliuzo `.1`, `.0`, `.255`, kito tinklo ir netaisyklingą adresą. Priimti laisvą `.13`. Išbandyti DHCP ir pradinės būsenos atkūrimą. Klaidinga trūkstama dalis neturi leisti persiųsti; teisinga 2 turi leisti. Atkurti seką 1–2–3, išbandyti klaidingą ir pasikartojančią seką bei atkūrimą.
5. C laboratorijoje patikrinti visas penkias komandų parinktis kiekviename iš keturių scenarijų. Be dviejų skirtingų patikrų ir pagrindimo išvada nevertinama. Bandyti teisingą ir klaidingą priežastį. Pakeitus situaciją neturi likti ankstesnės išvados; pakeitus atsakymą turi išnykti senas teisingumo pranešimas.
6. Pradėti 10 klausimų bandymą, grįžti prie atsakyto klausimo, persijungti tarp modulio dalių. Bandyti baigti su neatsakytais klausimais. Patikrinti skaičių, procentą, paaiškinimus ir pamokų nuorodas. Kartoti; atlikti visus 24. Visi šeši atviri klausimai turi reikalauti bandymo ir parodyti po du kriterijus.
7. Tikrinti keturias modulio dalis 320, 390, 768 ir 1280 px pločiu. Puslapis neturi horizontaliai išsiplėsti; schemų ir lentelių slinkimas turi likti jų konteineriuose. Patikrinti valdiklių naudojimą klaviatūra, matomą fokusą ir „Pereiti prie turinio“ nuorodą.
8. Patikrinti naršyklės konsolę, vidinius adresus ir senus fragmentus: `tinklo-esme`, `iranga`, `paketai`, `ip`, `dns`, `protokolai`, `sauga`, `diagnostika`, `veiklos`, `savikontrole`, `atmintine`.

## Leidimo rengimas

Keisti tik šiam moduliui priklausančius failus. Prieš commit peržiūrėti `git status`, diff ir tikslų įtraukiamų failų sąrašą. Mokytojo failas, ekrano nuotraukos, tikri mokinių duomenys ir paslaptys neturi patekti į commit. `.local/` ignoruojamas.

Paskelbti tik po naudotojo galutinio patvirtinimo. Pirmiausia patikrinti naujausią `main`, pakartoti reikalingas patikras ir parengti atskirą PR. Keičiant CSS ar JS po išleidimo atnaujinti jų `?v=` žymas, kad klientai gautų naują versiją. Atšaukimui naudoti atskirą `git revert`, išsaugant istoriją.
