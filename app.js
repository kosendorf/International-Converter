// --- Tabs Logic ---
const btnUnits = document.getElementById('btn-units');
const btnCurrency = document.getElementById('btn-currency');
const viewUnits = document.getElementById('view-units');
const viewCurrency = document.getElementById('view-currency');

function switchTab(showUnits) {
    if (showUnits) {
        btnUnits.classList.add('active');
        btnCurrency.classList.remove('active');
        viewUnits.classList.add('active');
        viewCurrency.classList.remove('active');
    } else {
        btnCurrency.classList.add('active');
        btnUnits.classList.remove('active');
        viewCurrency.classList.add('active');
        viewUnits.classList.remove('active');
    }
}
btnUnits.addEventListener('click', () => switchTab(true));
btnCurrency.addEventListener('click', () => switchTab(false));

// --- Unit Converter Logic ---
const KG_TO_LBS = 2.20462262;
const KM_TO_MI = 0.621371192; 

function setupBidirectional(id1, id2, multiplier) {
    const el1 = document.getElementById(id1);
    const el2 = document.getElementById(id2);
    
    el1.addEventListener('input', e => {
        const v = parseFloat(e.target.value);
        if (isNaN(v)) return el2.value = '';
        el2.value = parseFloat((v * multiplier).toFixed(4));
    });
    
    el2.addEventListener('input', e => {
        const v = parseFloat(e.target.value);
        if (isNaN(v)) return el1.value = '';
        el1.value = parseFloat((v / multiplier).toFixed(4));
    });
}
setupBidirectional('kilos', 'pounds', KG_TO_LBS);
setupBidirectional('kph', 'mph', KM_TO_MI);
setupBidirectional('km', 'miles', KM_TO_MI);

// --- Currency Converter Logic ---
const curFrom = document.getElementById('currency-from');
const curTo = document.getElementById('currency-to');
const amtFrom = document.getElementById('amount-from');
const amtTo = document.getElementById('amount-to');
const statusText = document.getElementById('currency-status');

let exchangeRates = {};

async function fetchRates() {
    try {
        const res = await fetch('https://api.frankfurter.dev/v1/latest');
        const data = await res.json();
        exchangeRates = data.rates;
        exchangeRates['EUR'] = 1; // Frankfurter base is EUR by default
        localStorage.setItem('cachedRates', JSON.stringify(exchangeRates));
        statusText.textContent = `Rates updated: ${data.date} (Offline Ready)`;
    } catch (err) {
        const cached = localStorage.getItem('cachedRates');
        if (cached) {
            exchangeRates = JSON.parse(cached);
            statusText.textContent = "Offline Mode: Using cached rates";
        } else {
            statusText.textContent = "Error: No connection and no cached rates.";
        }
    }
    // Re-calculate if numbers exist
    if (amtFrom.value) calculateCurrency(false);
}

function calculateCurrency(reverse) {
    if (!exchangeRates[curFrom.value] || !exchangeRates[curTo.value]) return;
    
    const rateFrom = exchangeRates[curFrom.value];
    const rateTo = exchangeRates[curTo.value];
    
    if (!reverse) {
        const val = parseFloat(amtFrom.value);
        if (isNaN(val)) return amtTo.value = '';
        // Convert to base (EUR), then to target
        amtTo.value = ((val / rateFrom) * rateTo).toFixed(2);
    } else {
        const val = parseFloat(amtTo.value);
        if (isNaN(val)) return amtFrom.value = '';
        amtFrom.value = ((val / rateTo) * rateFrom).toFixed(2);
    }
}

amtFrom.addEventListener('input', () => calculateCurrency(false));
amtTo.addEventListener('input', () => calculateCurrency(true));
curFrom.addEventListener('change', () => calculateCurrency(false));
curTo.addEventListener('change', () => calculateCurrency(false));

// Initialize Currency Rates
fetchRates();

// --- Register Service Worker ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .catch(err => console.error('Service Worker registration failed:', err));
    });
}
