# Tinklų laboratorijos prijungimas prie pamokos

2026-11-25. Naudotojas paprašė įkelti parengtą laboratoriją į pamokos temą. Šis pakeitimas apima tinklų mokymosi modulį ir jo I etapo laboratorijas. II ir III etapų funkcijos neįtrauktos.

## Mokinio kelias

- Esamas 11 klasės temos `tinklai` mokymosi išteklius jau nurodo `learning-materials/kompiuteriu-tinklai-teorija.html`. Tai patikrinta tik skaitymo Supabase užklausa; įrašas nekeičiamas.
- Tuo pačiu adresu tiesiogiai atveriama pagrindinė tyrinėjimo laboratorija: tinklo konstruktorius, paketų kelionė ir IP eksperimentai, iš viso 18 veiklų.
- Nuoroda **Teorijos atmintinė** veda į `learning-materials/kompiuteriu-tinklai-atmintine.html`. Išsaugotos visos šešios pamokos, papildoma praktika ir ankstesnė savikontrolė. Laboratorijos trumposios teorijos viso šio turinio nepakeičia.
- Kiekvienos veiklos nuoroda į visą teoriją atveria reikiamą atmintinės pamoką. Ji veikia tiek pagrindiniu, tiek ankstesniu `tinklai/tyrinejimas.html` adresu.
- Senos nuorodos su `#pamoka-N`, `#praktika-N-N`, `#dns`, kitais senais temos pavadinimais ir trumpųjų laboratorijų žymomis nukreipiamos į išsaugotą atmintinę. Naujų veiklų nuorodos lieka laboratorijoje.

## Patikra prieš paskelbimą

`node --test tests/inquiry-engine.test.mjs tests/inquiry-scenarios.test.mjs tests/network-module.test.mjs tests/network-entry.test.mjs`

**78 / 78 testai praėjo.** Patikrintas simuliacijų elgesys, savikontrolė, pažangos atkūrimas, visas teorijos turinys, abu įėjimo adresai ir senų nuorodų išsaugojimas.

`node scripts/check-network-preview.mjs` su paleistu `node scripts/preview-safe.mjs`: **30 išteklių pasiekiami, 5 draudžiami keliai nepasiekiami, pradinis nukreipimas ir izoliacijos antraštės teisingi**.

Naršyklėje patikrinta: pagrindinis adresas atveria 18 veiklų; nuoroda atveria teorijos atmintinę; sena `#dns` nuoroda atveria ketvirtą pamoką; grįžimo nuoroda atveria laboratoriją ir išsaugo jos vietinę pažangą. Ties 390 px telefono peržiūra horizontalios puslapio iškyšos nėra, atmintinės nuoroda matoma. Konsolėje klaidų neužfiksuota. Ankstesnės išsamios laboratorijų patikros užfiksuotos I etapo ataskaitoje.

## Paskelbimo apimtis ir grįžimas

- Paruošimo šaka: `codex/network-lesson-publish`. I etapas išsaugotas atskiroje šakoje `codex/network-inquiry-stage1`, commit `f57f7c4`.
- Patikrinta GitHub `main` bazė: `c21078f46d678b7f106cc9e69b45857ab1fbc159`.
- Paskelbiamas tik šios bazės ir tinklų šakos skirtumas: tinklų puslapiai bei jų ištekliai, susiję testai, paruošimo priemonės ir dokumentacija. Kitų vietinių svetainės patobulinimų nėra.
- GitHub atnaujinimas turi tikrinti laukiamą ankstesnį `main` commit; priverstinis istorijos perrašymas nenaudojamas. Jei bazė pasikeičia, pirmiausia peržiūrėti naujus pakeitimus.
- Supabase schema, RLS, mokinių įrašai, pažymiai ir svetainės prisijungimo kodas nekeičiami. Mokymosi pažanga lieka tik laboratorijos naršyklės saugykloje; serverio pažymiai nekuriami.
- Grįžimui atšaukti tik publikavimo commit nauju `git revert` įrašu ir paskelbti jį per tą patį GitHub Pages procesą. Nenaudoti `reset --hard` ar priverstinio `push`. Duomenų bazės grąžinimo nereikia.
- Po GitHub Pages paskelbimo patikrinti viešą pamokos adresą ir atmintinę. Publikavimo commit, diegimo rezultatas ir ekrano įrodymas saugomi vietiniame `.local/` kataloge, ne Git.

Ankstesni aprašai yra juose nurodytų vietinio kūrimo etapų ataskaitos. Šis dokumentas aprašo vėliau naudotojo patvirtintą prijungimą prie pamokos.
