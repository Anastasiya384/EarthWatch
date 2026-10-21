
const fs = require("fs");
const readline = require("readline");
const { XMLParser, XMLBuilder } = require("fast-xml-parser");

// Pripravimo orodja za branje in ustvarjanje XML datotek.
const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_"
});

const builder = new XMLBuilder({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    format: true
});

// Funkcija za branje XML datoteke.
function preberiXML(imeDatoteke) {
    const vsebina = fs.readFileSync(imeDatoteke, "utf8");
    return parser.parse(vsebina);
}

// Če XML vsebuje samo en zapis, ga pretvorimo v seznam.
function vSeznam(podatki) {
    if (podatki === undefined || podatki === null) {
        return [];
    }

    return Array.isArray(podatki) ? podatki : [podatki];
}

// Preberemo vse tri XML datoteke.
const obmocjaPodatki = preberiXML("data/obmocja.xml");
const dogodkiPodatki = preberiXML("data/dogodki.xml");
const obvestilaPodatki = preberiXML("data/obvestila.xml");

// Podatke iz XML pretvorimo v sezname objektov.
const obmocja = vSeznam(obmocjaPodatki.obmocja.obmocje);
const dogodki = vSeznam(dogodkiPodatki.dogodki.dogodek);
const obvestila = vSeznam(obvestilaPodatki.obvestila.obvestilo);

// Povežemo dogodke z območji in obvestili prek ID-jev.
const povezaniDogodki = dogodki.map(dogodek => {
    const obmocje = obmocja.find(
        obmocje => obmocje["@_id"] === dogodek.obmocjeId
    );

    const povezanaObvestila = obvestila.filter(
        obvestilo => obvestilo.dogodekId === dogodek["@_id"]
    );

    return {
        dogodek: {
            id: dogodek["@_id"],
            ime: dogodek.ime,
            kategorija: dogodek.kategorija,
            datum: dogodek.datum,
            aktivnost: dogodek.aktivnost,
            steviloZadetkov: dogodek.steviloZadetkov,
            zadnjicSpremenjeno: dogodek.zadnjicSpremenjeno
        },
        obmocje: obmocje
            ? {
                id: obmocje["@_id"],
                ime: obmocje.ime,
                drzava: obmocje.drzava,
                sirina: obmocje.sirina,
                dolzina: obmocje.dolzina
            }
            : null,
        obvestila: povezanaObvestila.map(obvestilo => ({
            id: obvestilo["@_id"],
            datumUstvarjanja: obvestilo.datumUstvarjanja,
            sporocilo: obvestilo.sporocilo,
            status: obvestilo.status
        }))
    };
});

// Preverimo, ali imajo vsi dogodki ustrezno območje.
const brezObmocja = povezaniDogodki.filter(
    zapis => zapis.obmocje === null
);

if (brezObmocja.length > 0) {
    console.error("Napaka: nekateri dogodki nimajo ustreznega območja.");
    process.exit(1);
}

// Uporabnika vprašamo, v katerem mestu želi iskati dogodke.
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question(
    "Vnesi mesto za filtriranje (ali * za vsa mesta): ",
    odgovor => {
        const mesto = odgovor.trim().toLowerCase();

        // Izberemo dogodke, ki ustrezajo filtru.
        const filtrirani = povezaniDogodki.filter(zapis => {
            return mesto === "*" ||
                zapis.obmocje.ime.toLowerCase() === mesto;
        });

        // Rezultate pregledno izpišemo v konzolo.
        console.log("\nFiltrirani dogodki:");

        if (filtrirani.length === 0) {
            console.log("Ni dogodkov za izbrano mesto.");
        } else {
            console.table(
                filtrirani.map(zapis => ({
                    ID: zapis.dogodek.id,
                    Dogodek: zapis.dogodek.ime,
                    Kategorija: zapis.dogodek.kategorija,
                    Datum: zapis.dogodek.datum,
                    Mesto: zapis.obmocje.ime,
                    Drzava: zapis.obmocje.drzava,
                    ZadnjicSpremenjeno: zapis.dogodek.zadnjicSpremenjeno,
                    SteviloZadetkov: zapis.dogodek.steviloZadetkov,
                    SteviloObvestil: zapis.obvestila.length
                }))
            );
        }

        // Izvozimo filtrirane rezultate v JSON.
        fs.writeFileSync(
            "filtrirano.json",
            JSON.stringify(filtrirani, null, 2),
            "utf8"
        );

        // Iz istih rezultatov ustvarimo nov XML.
        const xmlPodatki = {
            filtriraniDogodki: {
                rezultat: filtrirani.map(zapis => ({
                    dogodek: {
                        "@_id": zapis.dogodek.id,
                        ime: zapis.dogodek.ime,
                        kategorija: zapis.dogodek.kategorija,
                        datum: zapis.dogodek.datum,
                        aktivnost: zapis.dogodek.aktivnost,
                        steviloZadetkov: zapis.dogodek.steviloZadetkov,
                        zadnjicSpremenjeno: zapis.dogodek.zadnjicSpremenjeno
                    },
                    obmocje: {
                        "@_id": zapis.obmocje.id,
                        ime: zapis.obmocje.ime,
                        drzava: zapis.obmocje.drzava,
                        sirina: zapis.obmocje.sirina,
                        dolzina: zapis.obmocje.dolzina
                    },
                    obvestila: {
                        obvestilo: zapis.obvestila.map(obvestilo => ({
                            "@_id": obvestilo.id,
                            datumUstvarjanja: obvestilo.datumUstvarjanja,
                            sporocilo: obvestilo.sporocilo,
                            status: obvestilo.status
                        }))
                    }
                }))
            }
        };

        const xmlIzhod = builder.build(xmlPodatki);

        fs.writeFileSync(
            "filtrirano.xml",
            '<?xml version="1.0" encoding="UTF-8"?>\n' + xmlIzhod,
            "utf8"
        );

        console.log("\nIzvoz končan:");
        console.log("- filtrirano.json");
        console.log("- filtrirano.xml");

        rl.close();
    }
);
