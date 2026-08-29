const kilosInput = document.getElementById('kilos');
const poundsInput = document.getElementById('pounds');

// Handle the weight conversion
kilosInput.addEventListener('input', (e) => {
    const kilos = parseFloat(e.target.value);
    
    // Clear the output if the input is empty or invalid
    if (isNaN(kilos)) {
        poundsInput.value = '';
        return;
    }
    
    const pounds = kilos * 2.20462;
    poundsInput.value = pounds.toFixed(2);
});

// Register the Service Worker for PWA functionality
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Using a relative path so it works on GitHub Pages subdirectories
        navigator.serviceWorker.register('./sw.js')
            .then(registration => {
                console.log('Service Worker registered successfully');
            })
            .catch(error => {
                console.error('Service Worker registration failed:', error);
            });
    });
}
