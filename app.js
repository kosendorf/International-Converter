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

function populateDropdowns() {
    curFrom.innerHTML = '';
    curTo.innerHTML = '';
    
    const keys = Object.keys(exchangeRates).sort();
    
    // Use built-in browser API to translate currency codes to names automatically
    const displayNames = new Intl.DisplayNames(['en'], {type: 'currency'});
    
    keys.forEach(code => {
        let name = code;
        try {
            name = displayNames.of(code);
        } catch(e) {
            // Fallback to code if browser doesn't recognize it
        }
        
        const optFrom = document.createElement('option');
        optFrom.value = code;
        optFrom.textContent = `${code} - ${name}`;
        curFrom.appendChild(optFrom);
        
        const optTo = document.createElement('option');
        optTo.value = code;
        optTo.textContent = `${code} - ${name}`;
        curTo.appendChild(optTo);
    });

    curFrom.value = localStorage.getItem('selectedFrom') || 'USD';
    curTo.value = localStorage.getItem('selectedTo') || 'EUR';
}

async function fetchRates() {
    try {
        // Switched to ExchangeRate-API open endpoint for 160+ free currencies including AED & VND
        const ratesRes = await fetch('https://open.er-api.com/v6/latest/USD');
        const data = await ratesRes.json();
        
        exchangeRates = data.rates;
        
        const fetchTime = new Date().toLocaleTimeString();
        const fetchDate = new Date().toLocaleDateString();
        
        localStorage.setItem('cachedRates', JSON.stringify(exchangeRates));
        localStorage.setItem('cachedDate', fetchDate);
        localStorage.setItem('cachedTime', fetchTime);
        
        populateDropdowns();
        statusText.textContent = `Rates updated: ${fetchDate} at ${fetchTime} (Offline Ready)`;
    } catch (err) {
        const cachedRates = localStorage.getItem('cachedRates');
        const cachedDate = localStorage.getItem('cachedDate') || 'Unknown Date';
        const cachedTime = localStorage.getItem('cachedTime') || 'Unknown Time';
        
        if (cachedRates) {
            exchangeRates = JSON.parse(cachedRates);
            populateDropdowns();
            statusText.textContent = `Offline Mode: Using cached rates from ${cachedDate} at ${cachedTime}`;
        } else {
            statusText.textContent = "Error: No connection and no cached rates.";
        }
    }
    
    if (amtFrom.value) calculateCurrency(false);
}

function formatString(str) {
    if (!str) return '';
    let raw = str.toString().replace(/[^0-9.]/g, '');
    let parts = raw.split('.');
    if (parts.length > 2) {
        parts = [parts[0], parts.slice(1).join('')];
    }
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join('.');
}

function calculateCurrency(reverse) {
    if (!exchangeRates[curFrom.value] || !exchangeRates[curTo.value]) return;
    
    const rateFrom = exchangeRates[curFrom.value];
    const rateTo = exchangeRates[curTo.value];
    
    if (!reverse) {
        const val = parseFloat(amtFrom.value.replace(/,/g, ''));
        if (isNaN(val)) return amtTo.value = '';
        amtTo.value = formatString(((val / rateFrom) * rateTo).toFixed(2));
    } else {
        const val = parseFloat(amtTo.value.replace(/,/g, ''));
        if (isNaN(val)) return amtFrom.value = '';
        amtFrom.value = formatString(((val / rateTo) * rateFrom).toFixed(2));
    }
}

amtFrom.addEventListener('input', (e) => {
    e.target.value = formatString(e.target.value);
    calculateCurrency(false);
});
amtTo.addEventListener('input', (e) => {
    e.target.value = formatString(e.target.value);
    calculateCurrency(true);
});
curFrom.addEventListener('change', () => {
    localStorage.setItem('selectedFrom', curFrom.value);
    calculateCurrency(false);
});
curTo.addEventListener('change', () => {
    localStorage.setItem('selectedTo', curTo.value);
    calculateCurrency(false);
});

fetchRates();

// --- Calculator Logic ---
const calcDisplay = document.getElementById('calc-display');
let calcVal = '';

function updateCalcDisplay() {
    if (calcVal === '') {
        calcDisplay.value = '';
        return;
    }
    calcDisplay.value = calcVal.replace(/\d+(\.\d+)?/g, match => formatString(match));
}

window.calcAppend = (val) => {
    calcVal += val;
    updateCalcDisplay();
};

window.calcOp = (op) => {
    if (calcVal !== '' && !isNaN(calcVal.slice(-1))) {
        calcVal += op;
        updateCalcDisplay();
    }
};

window.calcClear = () => {
    calcVal = '';
    updateCalcDisplay();
};

window.calcBackSpace = () => {
    if (calcVal.length > 0) {
        calcVal = calcVal.slice(0, -1);
        updateCalcDisplay();
    }
};

window.calcCalculate = () => {
    try {
        // Safe evaluation of basic math string
        calcVal = new Function('return ' + calcVal)().toString();
        // Limit to 2 decimal places if it's a float
        if (calcVal.includes('.')) {
            calcVal = parseFloat(calcVal).toFixed(2);
        }
        updateCalcDisplay();
    } catch (e) {
        calcDisplay.value = 'Error';
        calcVal = '';
    }
};

window.pushToCurrency = (isToField) => {
    if (!calcVal || calcDisplay.value === 'Error') return;
    
    try {
        calcVal = new Function('return ' + calcVal)().toString();
        if (calcVal.includes('.')) {
            calcVal = parseFloat(calcVal).toFixed(2);
        }
        updateCalcDisplay();
    } catch (e) {
        return;
    }
    
    if (isToField) {
        amtTo.value = formatString(calcVal);
        calculateCurrency(true);
    } else {
        amtFrom.value = formatString(calcVal);
        calculateCurrency(false);
    }
};

// --- Register Service Worker with Auto-Update Logic ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => {
                // Listen for incoming updates to the service worker
                reg.addEventListener('updatefound', () => {
                    const newWorker = reg.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // A new update is ready and the new service worker skipped waiting.
                            window.location.reload();
                        }
                    });
                });
            })
            .catch(err => console.error('Service Worker registration failed:', err));
    });

    // Reload the page when the service worker controller changes
    let refreshing;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
    });
}
