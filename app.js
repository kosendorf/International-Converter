const kilosInput = document.getElementById('kilos');
const poundsInput = document.getElementById('pounds');

const KG_TO_LBS = 2.20462262;

// Convert Kilos -> Pounds
kilosInput.addEventListener('input', (e) => {
    const kilos = parseFloat(e.target.value);
    if (isNaN(kilos)) {
        poundsInput.value = '';
        return;
    }
    const pounds = kilos * KG_TO_LBS;
    poundsInput.value = parseFloat(pounds.toFixed(4));
});

// Convert Pounds -> Kilos
poundsInput.addEventListener('input', (e) => {
    const pounds = parseFloat(e.target.value);
    if (isNaN(pounds)) {
        kilosInput.value = '';
        return;
    }
    const kilos = pounds / KG_TO_LBS;
    kilosInput.value = parseFloat(kilos.toFixed(4));
});

// Register Service Worker for PWA functionality
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('Service Worker registered successfully'))
            .catch(err => console.error('Service Worker registration failed:', err));
    });
}
