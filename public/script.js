const stationSelect = document.getElementById('stationSelect');
const statusElement = document.getElementById('status');

const ctx = document.getElementById('stormChart');

let stormChart = null;

// Pridobimo podatke s strežnika.
async function naloziPodatke(postaja = '') {
    try {
        statusElement.textContent = 'Nalaganje podatkov...';

        let url = '/api/storm-data';

        if (postaja) {
            url += `?station=${encodeURIComponent(postaja)}`;
        }

        const odgovor = await fetch(url);

        if (!odgovor.ok) {
            throw new Error('Podatkov ni bilo mogoče pridobiti.');
        }

        const podatki = await odgovor.json();

        // Če postaje še niso naložene, jih dodamo v select.
        if (stationSelect.options.length <= 1) {
            stationSelect.innerHTML = '';

            podatki.postaje.forEach(postaja => {
                const option = document.createElement('option');

                option.value = postaja;
                option.textContent = postaja;

                stationSelect.appendChild(option);
            });

            stationSelect.value = podatki.izbranaPostaja;
        }

        // Pripravimo podatke za graf.
        const leta = podatki.rezultati.map(
            rezultat => rezultat.leto
        );

        const steviloNeviht = podatki.rezultati.map(
            rezultat => rezultat.steviloDniZNevihto
        );

        // Če graf že obstaja, ga uničimo.
        if (stormChart !== null) {
            stormChart.destroy();
        }

        // Ustvarimo nov graf.
        stormChart = new Chart(ctx, {
            type: 'bar',

            data: {
                labels: leta,

                datasets: [{
                    label: 'Število dni z nevihto',
                    data: steviloNeviht,
                    backgroundColor: 'rgba(54, 162, 235, 0.7)',
                    borderColor: 'rgb(54, 162, 235)',
                    borderWidth: 1
                }]
            },

            options: {
                responsive: true,
                maintainAspectRatio: false,

                plugins: {
                    title: {
                        display: true,
                        text: `Število dni z nevihto – ${podatki.izbranaPostaja}`
                    }
                },

                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Leto'
                        }
                    },

                    y: {
                        beginAtZero: true,

                        title: {
                            display: true,
                            text: 'Število dni'
                        }
                    }
                }
            }
        });

        statusElement.textContent =
            `Prikazani so podatki za ${podatki.izbranaPostaja}.`;

    } catch (napaka) {
        console.error(napaka);

        statusElement.textContent =
            'Pri nalaganju podatkov je prišlo do napake.';
    }
}

// Ob spremembi postaje ponovno naložimo podatke.
stationSelect.addEventListener('change', () => {
    naloziPodatke(stationSelect.value);
});

// Ob odprtju strani naložimo začetne podatke.
naloziPodatke();
