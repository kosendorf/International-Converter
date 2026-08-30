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
let currencyNames = {};

function populateDropdowns() {
    curFrom.innerHTML = '';
    curTo.innerHTML = '';
    
    const keys = Object.keys(exchangeRates).sort();
    
    keys.forEach(code => {
        const name = currencyNames[code] || code;
        
        const optFrom = document.createElement('option');
        optFrom.value = code;
        optFrom.textContent = `${code} - ${name}`;
        curFrom.appendChild(optFrom);
        
        const optTo = document.createElement('option');
        optTo.value = code;
        optTo.textContent = `${code} - ${name}`;
        curTo.appendChild(optTo);
    });

    curFrom.value = 'USD';
    curTo.value = 'EUR';
}

async function fetchRates() {
    try {
        const [namesRes, ratesRes] = await Promise.all([
            fetch('https://api.frankfurter.dev/v1/currencies'),
            fetch('https://api.frankfurter.dev/v1/latest')
        ]);
        
        currencyNames = await namesRes.json();
        const data = await ratesRes.json();
        
        exchangeRates = data.rates;
        exchangeRates['EUR'] = 1; 
        currencyNames['EUR'] = "Euro"; 
        
        const fetchTime = new Date().toLocaleTimeString();
        
        localStorage.setItem('cachedRates', JSON.stringify(exchangeRates));
        localStorage.setItem('cachedNames', JSON.stringify(currencyNames));
        localStorage.setItem('cachedDate', data.date);
        localStorage.setItem('cachedTime', fetchTime);
        
        populateDropdowns();
        statusText.textContent = `Rates updated: ${data.date} at ${fetchTime} (Offline Ready)`;
    } catch (err) {
        const cachedRates = localStorage.getItem('cachedRates');
        const cachedNames = localStorage.getItem('cachedNames');
        const cachedDate = localStorage.getItem('cachedDate') || 'Unknown Date';
        const cachedTime = localStorage.getItem('cachedTime') || 'Unknown Time';
        
        if (cachedRates && cachedNames) {
            exchangeRates = JSON.parse(cachedRates);
            currencyNames = JSON.parse(cachedNames);
            populateDropdowns();
            statusText.textContent = `Offline Mode: Using cached rates from ${cachedDate} at ${cachedTime}`;
        } else {
            statusText.textContent = "Error: No connection and no cached rates.";
        }
    }
    
    if (amtFrom.value) calculateCurrency(false);
}

function calculateCurrency(reverse) {
    if (!exchangeRates[curFrom.value] || !exchangeRates[curTo.value]) return;
    
    const rateFrom = exchangeRates[curFrom.value];
    const rateTo = exchangeRates[curTo.value];
    
    if (!reverse) {
        const val = parseFloat(amtFrom.value);
        if (isNaN(val)) return amtTo.value = '';
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

fetchRates();

// --- Calculator Logic ---
const calcDisplay = document.getElementById('calc-display');
let calcVal = '';

window.calcAppend = (val) => {
    calcVal += val;
    calcDisplay.value = calcVal;
};

window.calcOp = (op) => {
    if (calcVal !== '' && !isNaN(calcVal.slice(-1))) {
        calcVal += op;
        calcDisplay.value = calcVal;
    }
};

window.calcClear = () => {
    calcVal = '';
    calcDisplay.value = '';
};

window.calcBackSpace = () => {
    if (calcVal.length > 0) {
        calcVal = calcVal.slice(0, -1);
        calcDisplay.value = calcVal;
    }
};

window.calcCalculate = () => {
    try {
        calcVal = new Function('return ' + calcVal)().toString();
        if (calcVal.includes('.')) {
            calcVal = parseFloat(calcVal).toFixed(2);
        }
        calcDisplay.value = calcVal;
    } catch (e) {
        calcDisplay.value = 'Error';
        calcVal = '';
    }
};

window.pushToCurrency = (isToField) => {
    if (!calcDisplay.value || calcDisplay.value === 'Error') return;
    if (isToField) {
        amtTo.value = calcDisplay.value;
        calculateCurrency(true);
    } else {
        amtFrom.value = calcDisplay.value;
        calculateCurrency(false);
    }
};

// --- Register Service Worker ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .catch(err => console.error('Service Worker registration failed:', err));
    });
}
