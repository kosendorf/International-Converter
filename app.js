const kilosIn = document.getElementById('kilos');
const poundsIn = document.getElementById('pounds');
const kphIn = document.getElementById('kph');
const mphIn = document.getElementById('mph');
const kmIn = document.getElementById('km');
const milesIn = document.getElementById('miles');

const KG_TO_LBS = 2.20462262;
const KM_TO_MI = 0.621371192; 

// --- Weight ---
kilosIn.addEventListener('input', e => {
    const v = parseFloat(e.target.value);
    if (isNaN(v)) return poundsIn.value = '';
    poundsIn.value = parseFloat((v * KG_TO_LBS).toFixed(4));
});
poundsIn.addEventListener('input', e => {
    const v = parseFloat(e.target.value);
    if (isNaN(v)) return kilosIn.value = '';
    kilosIn.value = parseFloat((v / KG_TO_LBS).toFixed(4));
});

// --- Speed ---
kphIn.addEventListener('input', e => {
    const v = parseFloat(e.target.value);
    if (isNaN(v)) return mphIn.value = '';
    mphIn.value = parseFloat((v * KM_TO_MI).toFixed(4));
});
mphIn.addEventListener('input', e => {
    const v = parseFloat(e.target.value);
    if (isNaN(v)) return kphIn.value = '';
    kphIn.value = parseFloat((v / KM_TO_MI).toFixed(4));
});

// --- Distance ---
kmIn.addEventListener('input', e => {
    const v = parseFloat(e.target.value);
    if (isNaN(v)) return milesIn.value = '';
    milesIn.value = parseFloat((v * KM_TO_MI).toFixed(4));
});
milesIn.addEventListener('input', e => {
    const v = parseFloat(e.target.value);
    if (isNaN(v)) return kmIn.value = '';
    kmIn.value = parseFloat((v / KM_TO_MI).toFixed(4));
});

// Register Service Worker for PWA functionality
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('Service Worker registered successfully'))
            .catch(err => console.error('Service Worker registration failed:', err));
    });
}
