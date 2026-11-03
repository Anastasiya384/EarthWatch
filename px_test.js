const fs = require('fs');
const path = require('path');
const Px = require('px');
const iconv = require('iconv-lite');

async function main() {
    const pot = path.join(
        __dirname,
        'data',
        'vremenski_podatki.px'
    );

    const datoteka = fs.readFileSync(pot);
    const vsebina = iconv.decode(datoteka, 'windows-1250');

    const px = new Px(vsebina);

    // Pridobimo vrednosti vseh treh spremenljivk.
    const postaje = px.values('METEOROLOŠKA POSTAJA');
    const obdobja = px.values('OBDOBJE, LETO');
    const meritve = px.values('MERITVE');

    // Poiščemo indekse izbrane postaje in meritve.
    const indeksPostaje = postaje.indexOf('Maribor, Tabor');

    const indeksMeritve = meritve.indexOf(
        'Število dni z nevihto'
    );

    // Pripravimo seznam rezultatov.
    const rezultati = [];

    // Gremo skozi vsa leta.
    for (const leto of obdobja) {

        // Zanimajo nas samo posamezna leta.
        if (!/^\d{4}$/.test(leto)) {
            continue;
        }

        const indeksLeta = obdobja.indexOf(leto);

        // Pridobimo statistično vrednost.
        const vrednost = px.datum([
            indeksPostaje,
            indeksLeta,
            indeksMeritve
        ]);

        rezultati.push({
            leto: leto,
            steviloDniZNevihto: vrednost
        });
    }

    // Shranimo rezultate v JSON.
    const izhodnaPot = path.join(
        __dirname,
        'data',
        'nevihte_maribor.json'
    );

    fs.writeFileSync(
        izhodnaPot,
        JSON.stringify(rezultati, null, 2),
        'utf8'
    );

    console.log('Rezultati za Maribor, Tabor:');
    console.table(rezultati);

    console.log('Podatki so shranjeni v:', izhodnaPot);
}

main().catch(napaka => {
    console.error('Napaka:', napaka);
});


main().catch(napaka => {
    console.error('Napaka pri branju PC-Axis datoteke:', napaka);
});
