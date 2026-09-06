# Informatika 11 v3 – pirmas prijungimas prie Supabase

Ši versija jau turi:
- mokinio ir mokytojo prisijungimus;
- atskiras mokytojų klases;
- klasės prisijungimo kodus;
- mokinių rezultatų kaupimą;
- bandymų skaičių, rezultatą ir trukmę;
- paskutinio prisijungimo / aktyvumo laiką;
- aktyvaus laiko platformoje kaupimą;
- mokytojo failų įkėlimą ir mokinio atsisiuntimą;
- mokinio darbų įkėlimą;
- mokytojo galimybę atsisiųsti tik savo mokinių darbus;
- temų, praktikos ir atsiskaitymų atrakinimą kiekvienai klasei atskirai;
- Row Level Security (RLS), kad skirtingų mokytojų duomenys nesimaišytų.

## 1. Susikurk Supabase projektą

Atidaryk https://supabase.com ir susikurk projektą.

## 2. Sukurk duomenų bazę

Supabase projekte:
1. atidaryk **SQL Editor**;
2. pasirink **New query**;
3. atidaryk šio paketo failą `supabase/schema.sql`;
4. nukopijuok VISĄ jo turinį;
5. įklijuok į SQL Editor;
6. spausk **Run**.

Bus sukurtos lentelės, RLS taisyklės, funkcijos ir dvi privačios failų saugyklos.

## 3. Įrašyk projekto URL ir Publishable key

Supabase projekte rask **Project URL** ir **Publishable key**.

Atidaryk failą:

`supabase-config.js`

ir pakeisk:

```js
url: "PAKEISKITE_SUPABASE_PROJECT_URL",
publishableKey: "PAKEISKITE_SUPABASE_PUBLISHABLE_KEY"
```

SVARBU: naršyklėje negalima naudoti `service_role` arba secret rakto.

## 4. Pirmoji mokytojo paskyra

Svetainėje pirmą paskyrą gali susikurti per „Mokinio registracija“.
Ji saugumo sumetimais automatiškai bus `student`.

Tada Supabase SQL Editor paleisk:

```sql
update public.profiles
set role='teacher'
where id=(select id from auth.users where email='TAVO_EL_PASTAS');
```

Atsijunk ir prisijunk iš naujo. Dabar matysi **Mokytojo skydelį**.

Kito mokytojo paskyrai padaryk tą patį su jo el. paštu.

## 5. Mokytojas sukuria klasę

Mokytojo skydelyje:
- „+ Nauja klasė“
- įrašo pavadinimą, pvz. `III A`
- sistema pasiūlo 6 simbolių kodą.

Mokiniai užsiregistruoja ir įveda tą klasės kodą.

## 6. Duomenys tarp mokytojų atskirti

Tai daroma ne tik svetainės ekrane. `schema.sql` įjungia PostgreSQL Row Level Security.

Mokytojas gali skaityti tik:
- savo klases;
- savo klasių mokinius;
- savo klasių rezultatus;
- savo klasių aktyvumo laiką;
- savo klasių mokymosi failus;
- savo klasių pateiktus mokinių darbus.

Kito mokytojo duomenų bazės užklausos jo duomenų negrąžina.

## 7. Failai

Mokytojo failai laikomi privačiame bucket:
`teacher-resources`

Mokinių pateikti darbai:
`student-submissions`

Failų parsisiuntimui svetainė sugeneruoja trumpalaikes signed URL nuorodas.

## 8. GitHub Pages

Kai Supabase prijungtas:
1. iš šio paketo į GitHub repository įkelk visus failus;
2. pakeisk senus to paties pavadinimo failus;
3. Commit changes;
4. senas GitHub Pages adresas lieka tas pats.

## Pastaba dėl atsiskaitymų

`assessment.js` kol kas paliktas tuščias. Viešoje GitHub Pages svetainėje nereikėtų iš anksto laikyti tikro atsiskaitymo klausimų banko, nes techniškai pažengęs mokinys gali peržiūrėti viešus JS failus.

Vėliau galime atsiskaitymo klausimus perkelti į Supabase ir pateikti juos per serverinę funkciją tik tuo metu, kai testas atidarytas. Tai bus saugesnis kitas etapas.
