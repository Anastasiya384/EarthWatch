# EarthWatch – povezovanje XML in JSON

## Opis projekta

EarthWatch je preprosta aplikacija za obdelavo podatkov o naravnih dogodkih. Podatki so shranjeni v treh XML-datotekah, ki so med seboj povezane prek enoličnih ID-jev.

Aplikacija prebere vse XML-datoteke, podatke pretvori v JavaScriptove objekte, poveže dogodke z območji in obvestili ter omogoči filtriranje dogodkov po mestu. Rezultate izpiše v konzolo in jih izvozi v datoteki JSON in XML.

Podatki v projektu so namenjeni demonstraciji delovanja aplikacije.

## Uporabljene tehnologije

- JavaScript
- Node.js
- fast-xml-parser
- JSON in XML

## Struktura projekta

- `app.js` – izvorna koda aplikacije.
- `data/obmocja.xml` – podatki o geografskih območjih.
- `data/dogodki.xml` – podatki o naravnih dogodkih.
- `data/obvestila.xml` – podatki o obvestilih za posamezne dogodke.
- `filtrirano.json` – filtrirani podatki v formatu JSON.
- `filtrirano.xml` – isti filtrirani podatki v formatu XML.

## Povezovanje podatkov

Datoteke so povezane prek ID-jev:

- `obmocjeId` v datoteki `dogodki.xml` se sklicuje na atribut `id` v datoteki `obmocja.xml`.
- `dogodekId` v datoteki `obvestila.xml` se sklicuje na atribut `id` v datoteki `dogodki.xml`.

Tako lahko aplikacija za vsak dogodek pridobi podatke o njegovem območju in vsa povezana obvestila.

## Namestitev

Za delovanje aplikacije sta potrebna Node.js in npm.

V terminalu, v glavni mapi projekta, izvedemo:

```bash
npm install
```

Če odvisnosti še niso zapisane v `package.json`, knjižnico namestimo z ukazom:

```bash
npm install fast-xml-parser
```

## Zagon aplikacije

Aplikacijo zaženemo z ukazom:

```bash
node app.js
```

Program uporabnika vpraša za mesto, po katerem želi filtrirati dogodke.

Primer vnosa:

```text
Maribor
```

Za prikaz vseh dogodkov vnesemo:

```text
*
```

## Primer izhoda v konzoli

```text
Vnesi mesto za filtriranje (ali * za vsa mesta): Maribor

Filtrirani dogodki:
ID     Dogodek       Kategorija   Datum        Mesto
D001   Gozdni požar  Požar        2026-09-12   Maribor

Izvoz končan:
- filtrirano.json
- filtrirano.xml
```

Prikaz je ilustrativen. Dejanski rezultat je odvisen od podatkov v vhodnih XML-datotekah.

## Izvoz podatkov

Po izvedenem filtriranju aplikacija ustvari:

- `filtrirano.json` – seznam filtriranih dogodkov, njihovih območij in povezanih obvestil.
- `filtrirano.xml` – enake podatke v obliki XML.

Obe datoteki se ustvarita v glavni mapi projekta.
