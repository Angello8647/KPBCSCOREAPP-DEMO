// ==========================================
// 💤 RUSTSCHERM (IDLE CAROUSEL)
// ==========================================
// Toont na 5 min inactiviteit, enkel als je op pagina 1 staat, automatisch
// de rangschikking/kruistabel van elke discipline+categorie, wisselend elke
// 10 seconden — voor gebruik als "tweede scherm" richting toeschouwers.

let idleLastActivity = Date.now();
let idleCarouselActive = false;
let idleCarouselTimer = null;
let idleCarouselStep = 0; // 0 = rangschikking van huidige combo, 1 = kruistabel van huidige combo

const IDLE_TIMEOUT_MS = 5 * 60 * 1000;   // 5 minuten
const IDLE_STEP_MS = 10 * 1000;          // 10 seconden per stap

// ✅ Enkel ECHTE, fysieke gebruikersacties resetten de idle-klok — niet onze
// eigen, via JavaScript getriggerde acties (die hebben altijd isTrusted=false).
function registerIdleActivity(event) {
    if (event && event.isTrusted === false) return;
    idleLastActivity = Date.now();
    if (idleCarouselActive) {
        stopIdleCarousel();
    }
}
['mousedown', 'keydown', 'touchstart', 'click'].forEach(evt => {
    document.addEventListener(evt, registerIdleActivity, true);
});

function isOnPage1() {
    const p1 = document.getElementById('page1');
    return p1 && p1.classList.contains('active');
}

function startIdleCarousel() {
    if (idleCarouselActive) return;
    if (!window.compComboList || window.compComboList.length === 0) return; // niets om te tonen
    idleCarouselActive = true;
    idleCarouselStep = 0;
    if (typeof window.showPage === 'function') window.showPage(20);
    window.goToCompCombo(0);
    window.switchCompView('leaderboard');
    idleCarouselTimer = setInterval(advanceIdleCarousel, IDLE_STEP_MS);
}

function advanceIdleCarousel() {
    if (!idleCarouselActive) return;
    if (idleCarouselStep === 0) {
        // Van rangschikking naar kruistabel, zelfde combo
        idleCarouselStep = 1;
        window.switchCompView('crosstable');
    } else {
        // Van kruistabel naar rangschikking van de VOLGENDE combo
        idleCarouselStep = 0;
        window.goToCompCombo(window.compComboIndex + 1);
        window.switchCompView('leaderboard');
    }
}

function stopIdleCarousel() {
    idleCarouselActive = false;
    if (idleCarouselTimer) {
        clearInterval(idleCarouselTimer);
        idleCarouselTimer = null;
    }
    if (typeof window.showPage === 'function') window.showPage(1);
}

// ✅ Elke 5 seconden checken of het rustscherm gestart moet worden
setInterval(() => {
    if (idleCarouselActive) return;
    if (!isOnPage1()) return;
    if (Date.now() - idleLastActivity >= IDLE_TIMEOUT_MS) {
        startIdleCarousel();
    }
}, 5000);
