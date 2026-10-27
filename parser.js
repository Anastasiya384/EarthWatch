const puppeteer = require('puppeteer');
const fs = require('fs/promises');
const path = require('path');

async function main() {
    const browser = await puppeteer.launch({ headless: true });

    try {
        const page = await browser.newPage();

        const url =
            'https://science.nasa.gov/earth/earth-observatory/topics/natural-events/';

        // Odpremo spletno stran.
        await page.goto(url, {
            waitUntil: 'domcontentloaded',
            timeout: 60000
        });

        // Preberemo povezave in naslove člankov.
        const novice = await page.evaluate(() => {
            const povezave = Array.from(
                document.querySelectorAll('main a[href]')
            );

            const rezultat = povezave
                .map(povezava => ({
                    naslov: povezava.innerText
                        .trim()
                        .replace(/\s+/g, ' '),

                    povezava: new URL(
                        povezava.getAttribute('href'),
                        location.origin
                    ).href
                }))
                .filter(novica =>
                    novica.naslov.length > 15 &&
                    novica.povezava.includes(
                        '/earth/earth-observatory/'
                    ) &&
                    !novica.povezava.includes('/topics/') &&
                    !novica.povezava.includes('/subscribe/') &&
                    !novica.povezava.includes('/image-of-the-day/')
                );
            // Odstranimo podvojene povezave.
            return Array.from(
                new Map(
                    rezultat.map(novica => [
                        novica.povezava,
                        novica
                    ])
                ).values()
            );
        });

        const mapa = path.join(__dirname, 'data');

        // Shranimo podatke v JSON.
        const datoteka = path.join(mapa, 'nasa_novice.json');

        await fs.writeFile(
            datoteka,
            JSON.stringify(novice, null, 2),
            'utf8'
        );

        console.log(`Najdenih zapisov: ${novice.length}`);
        console.log(`Podatki so shranjeni v: ${datoteka}`);
    } finally {
        await browser.close();
    }
}

main().catch(napaka => {
    console.error('Pri razčlenjevanju je prišlo do napake:', napaka);
    process.exitCode = 1;
});
