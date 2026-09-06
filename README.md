# Informatika 11 – v2

Profesionaliai suskaidyta GitHub Pages svetainės versija.

## Kas pakeista
- Naudojami tikslūs III gimnazijos klasės temų pavadinimai iš pateiktų 2026-08-31 rekomendacijų.
- Iš viso svetainėje yra 15 temų.
- Atidaryta tik 30.1.2 „Vektorinės grafikos ypatumai, vektorinės grafikos failų formatai“.
- Visos kitos temos matomos, tačiau užrakintos.
- Vektorinės grafikos praktikos banke yra 65 klausimai.
- Atsiskaitymas užrakintas, o jo tikras klausimų bankas į viešą svetainę dar neįkeltas.
- Kiekviena tema gali turėti savo mokiniams atsisiunčiamų failų sąrašą.

## Failai
- index.html – struktūra
- style.css – dizainas
- config.js – pagrindinis mokytojo valdymas
- questions.js – praktikos klausimai
- assessment.js – atsiskaitymo klausimai
- app.js – logika
- resources/ – failai mokiniams

## Kaip atrakinti temą
config.js prie temos:
"open": true,
"practiceOpen": true

## Kaip atrakinti atsiskaitymą
1. Į assessment.js įkelti atskirą klausimų banką.
2. config.js nustatyti "assessmentOpen": true.

SVARBU: GitHub Pages yra vieša statinė svetainė. Vien užrakintas mygtukas nėra tikra klausimų apsauga.
Todėl tikro atsiskaitymo banko geriau nekelti į viešą repository iki pat atsiskaitymo.

## Kaip pridėti failą mokiniams
1. Įkelti failą į, pvz., resources/vektorine-grafika/
2. config.js skiltyje resources pridėti:
{
  "title": "Praktinė užduotis Nr. 1",
  "path": "resources/vektorine-grafika/uzduotis-1.pdf",
  "note": "PDF · praktinis darbas"
}

## GitHub atnaujinimas
Įkelkite visus šio paketo failus į repository šaknį ir patvirtinkite Commit changes.
