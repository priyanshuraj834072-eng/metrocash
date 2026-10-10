// =======================================================
// K3 LOTRE FRONTEND LOGIC & ANIMATIONS (57s ILLUSION + 10-PAGE + K3 ID)
// =======================================================

var activeK3Tab = sessionStorage.getItem('k3Tab') || '1min'; 
var currentK3Page = 1; 
var k3Interval = null;
var k3HistoryData = [];
var currentK3Bet = { choice: '', multi: 0, base: 1, qty: 1, x: 1 };
var k3OuterMultiplier = 1; 
var isK3SoundEnabled = true;
var currentK3Listener = null;

var k3AudioCtx = null;
try { k3AudioCtx = window.audioCtx || new (window.AudioContext || window.webkitAudioContext)(); } catch(e){}

function pushK3ModalState() { if(window.location.hash !== '#modalOpen') { window.history.pushState({ screen: 'gamePlayScreen', isModal: true }, "", "#modalOpen"); } }
function toggleK3Sound() { isK3SoundEnabled = !isK3SoundEnabled; let icon = document.getElementById('k3SoundToggle'); if(icon) { if(isK3SoundEnabled) { icon.classList.replace('fa-volume-xmark', 'fa-volume-high'); icon.style.color = "inherit"; showToast("Sound On"); } else { icon.classList.replace('fa-volume-high', 'fa-volume-xmark'); icon.style.color = "gray"; showToast("Sound Off"); } } }

function playK3TickSound() { 
    if (!k3AudioCtx || !isK3SoundEnabled) return; 
    try { const osc = k3AudioCtx.createOscillator(); const gainNode = k3AudioCtx.createGain(); osc.type = 'sine'; osc.frequency.setValueAtTime(800, k3AudioCtx.currentTime); osc.frequency.exponentialRampToValueAtTime(300, k3AudioCtx.currentTime + 0.05); gainNode.gain.setValueAtTime(0.5, k3AudioCtx.currentTime); gainNode.gain.exponentialRampToValueAtTime(0.01, k3AudioCtx.currentTime + 0.05); osc.connect(gainNode); gainNode.connect(k3AudioCtx.destination); osc.start(); osc.stop(k3AudioCtx.currentTime + 0.05); } catch(e){} 
}
function playK3SpinSound() { 
    if (!k3AudioCtx || !isK3SoundEnabled) return; 
    try { const osc = k3AudioCtx.createOscillator(); const gainNode = k3AudioCtx.createGain(); osc.type = 'triangle'; osc.frequency.setValueAtTime(400, k3AudioCtx.currentTime); gainNode.gain.setValueAtTime(0.2, k3AudioCtx.currentTime); gainNode.gain.exponentialRampToValueAtTime(0.01, k3AudioCtx.currentTime + 0.05); osc.connect(gainNode); gainNode.connect(k3AudioCtx.destination); osc.start(); osc.stop(k3AudioCtx.currentTime + 0.05); } catch(e){} 
}

function renderDice(diceId, val) {
    let d = document.getElementById(diceId); if(!d) return;
    d.className = `k3-dice d${val}`;
    let dotsHtml = '';
    if(val === 1) dotsHtml = `<div class="k3-dot dot-center" style="width:22px; height:22px;"></div>`;
    else if(val === 2) dotsHtml = `<div class="k3-dot dot-tl"></div><div class="k3-dot dot-br"></div>`;
    else if(val === 3) dotsHtml = `<div class="k3-dot dot-tl"></div><div class="k3-dot dot-center"></div><div class="k3-dot dot-br"></div>`;
    else if(val === 4) dotsHtml = `<div class="k3-dot dot-tl"></div><div class="k3-dot dot-tr"></div><div class="k3-dot dot-bl"></div><div class="k3-dot dot-br"></div>`;
    else if(val === 5) dotsHtml = `<div class="k3-dot dot-tl"></div><div class="k3-dot dot-tr"></div><div class="k3-dot dot-center"></div><div class="k3-dot dot-bl"></div><div class="k3-dot dot-br"></div>`;
    else if(val === 6) dotsHtml = `<div class="k3-dot dot-tl"></div><div class="k3-dot dot-tr"></div><div class="k3-dot dot-ml"></div><div class="k3-dot dot-mr"></div><div class="k3-dot dot-bl"></div><div class="k3-dot dot-br"></div>`;
    d.innerHTML = dotsHtml;
}

// ==========================================
// THE 57s ILLUSION TIMER LOGIC
// ==========================================
function getK3State(type) { 
    let ms = typeof getTrueTime === 'function' ? getTrueTime() : Date.now(); 
    let durationSec = type === '1min' ? 60 : (type === '3min' ? 180 : (type === '5min' ? 300 : 600)); 
    let durationMs = durationSec * 1000; let startOfDay = new Date().setHours(0,0,0,0); let elapsedMs = ms - startOfDay; 
    let seq = Math.floor(elapsedMs / durationMs) + 1; let currentPeriodStartMs = startOfDay + ((seq - 1) * durationMs); 
    let remainingSec = Math.floor((currentPeriodStartMs + durationMs - ms) / 1000); 
    let dateStr = new Date(ms).toISOString().slice(0,10).replace(/-/g,''); let period = dateStr + String(seq).padStart(4, '0'); 
    
    // Illusion: Hold timer at 0 when real time is 0, 59, or 58 (Waiting for Firebase)
    let displaySec = remainingSec;
    let isSpinTime = false;
    if (remainingSec === 0 || remainingSec >= 58) {
        displaySec = 0;
        isSpinTime = true;
    }
    
    return { period, remainingSec, displaySec, isSpinTime }; 
}

let isK3Spinning = false;
let k3SpinInterval = null;

function startK3RealtimeSync() {
    if(currentK3Listener && db) db.ref('k3/results/' + activeK3Tab).off('value', currentK3Listener);
    if(!db) return; 
    
    currentK3Listener = db.ref('k3/results/' + activeK3Tab).orderByKey().limitToLast(100).on('value', snap => {
        let data = snap.val();
        if(data) {
            k3HistoryData = [];
            let keys = Object.keys(data).sort().reverse();
            keys.forEach(k => k3HistoryData.push(data[k]));
            
            let latest = k3HistoryData[0];
            
            // Jaise hi Database me data aaya -> SPIN ROK DO aur Result dikha do!
            if (isK3Spinning) {
                stopK3AutoSpin();
            }
            
            renderDice('dice1', latest.d1 || 1);
            renderDice('dice2', latest.d2 || 1);
            renderDice('dice3', latest.d3 || 1);
            
            currentK3Page = 1; // Reset to page 1
            renderK3HistoryTable();
        }
    });
}

function stopK3AutoSpin() {
    clearInterval(k3SpinInterval);
    isK3Spinning = false;
    let dc = document.querySelector('.dice-container');
    if(dc) dc.style.transform = `translate(0, 0)`;
}

function startK3AutoSpin() {
    if (isK3Spinning) return;
    isK3Spinning = true;
    k3SpinInterval = setInterval(() => {
        playK3SpinSound();
        let dc = document.querySelector('.dice-container');
        if(dc) dc.style.transform = `translate(${Math.random()*4-2}px, ${Math.random()*4-2}px)`;
        renderDice('dice1', Math.floor(Math.random()*6)+1);
        renderDice('dice2', Math.floor(Math.random()*6)+1);
        renderDice('dice3', Math.floor(Math.random()*6)+1);
    }, 80);
}

function renderK3HistoryTable() {
    let list = document.getElementById('k3HistoryList'); if(!list) return;
    
    // 10 items pagination logic
    let startIndex = (currentK3Page - 1) * 10;
    let endIndex = startIndex + 10;
    let pageData = k3HistoryData.slice(startIndex, endIndex);
    let totalPages = Math.ceil(k3HistoryData.length / 10) || 1;
    
    let ind = document.getElementById('k3PageIndicator');
    if(ind) ind.innerText = `${currentK3Page}/${totalPages}`;
    
    let html = '';
    pageData.forEach(res => {
        let sizeColor = res.size === 'Big' ? '#ff9800' : '#4facfe'; 
        let oeColor = res.oddEven === 'Odd' ? '#ff4757' : '#18b660'; 
        let d1 = res.d1||1, d2 = res.d2||1, d3 = res.d3||1;
        html += `<div style="display:flex; border-bottom:1px solid var(--border); padding:12px 10px; font-size:13px; align-items:center;">
            <div style="flex:2; font-weight:bold; color:var(--text);">${res.period}</div>
            <div style="flex:1; font-weight:900; font-size:16px;">${res.sum}</div>
            <div style="flex:1.5; display:flex; gap:5px; align-items:center;">
                <span style="color:${sizeColor}; font-weight:bold;">${res.size}</span>
                <span style="color:${oeColor}; font-weight:bold;">${res.oddEven}</span>
                <div style="display:flex; gap:2px; margin-left:5px;">
                    <div class="k3-hist-dice">${d1}</div><div class="k3-hist-dice">${d2}</div><div class="k3-hist-dice">${d3}</div>
                </div>
            </div>
        </div>`;
    });
    list.innerHTML = html;
}

function changeK3Page(dir) {
    let totalPages = Math.ceil(k3HistoryData.length / 10) || 1;
    let newPage = currentK3Page + dir;
    if(newPage >= 1 && newPage <= totalPages) {
        currentK3Page = newPage;
        renderK3HistoryTable();
    }
}

function startGlobalK3Timers() {
    if(k3Interval) clearInterval(k3Interval);
    k3Interval = setInterval(() => {
        let state = getK3State(activeK3Tab);
        let kScreen = document.getElementById('k3Screen');
        if(!kScreen || !kScreen.classList.contains('active')) return; 

        if (state.displaySec <= 5 && state.displaySec > 0 && document.visibilityState === 'visible') { playK3TickSound(); }
        
        document.getElementById('k3Period').innerText = state.period;
        let min = Math.floor(Math.max(0, state.displaySec) / 60); let sec = Math.max(0, state.displaySec) % 60;
        document.getElementById('k3-min-1').innerText = Math.floor(min / 10); document.getElementById('k3-min-2').innerText = min % 10; 
        document.getElementById('k3-sec-1').innerText = Math.floor(sec / 10); document.getElementById('k3-sec-2').innerText = sec % 10;
        
        let lockOverlay = document.getElementById('k3LockOverlay'); let lockDigitSec = document.getElementById('k3LockDigitSec');
        
        if (state.displaySec <= 5 && state.displaySec > 0) { 
            if(lockOverlay) lockOverlay.classList.add('active'); 
            if(lockDigitSec) lockDigitSec.innerText = state.displaySec;
        } else { 
            if(lockOverlay) lockOverlay.classList.remove('active'); 
        }

        // Auto spin jab illusion timer 0 ho
        if (state.isSpinTime) {
            if(lockOverlay) lockOverlay.classList.remove('active');
            if (!isK3Spinning) startK3AutoSpin(); 
        } else {
            // Failsafe: Agar timer reset ho gaya hai toh spin band ho jaye
            if (isK3Spinning) stopK3AutoSpin();
        }

    }, 1000);
}

function switchK3Tab(tab) { 
    activeK3Tab = tab; currentK3Page = 1; sessionStorage.setItem('k3Tab', tab); 
    ['1min', '3min', '5min', '10min'].forEach(t => { let el = document.getElementById('k3Tab'+t); if(el) el.classList.remove('active');}); 
    let actEl = document.getElementById('k3Tab' + tab); if(actEl) actEl.classList.add('active'); 
    startK3RealtimeSync(); 
}

function k3BetPrompt(choice, multi) {
    let state = getK3State(activeK3Tab); if (state.displaySec === 0 || (state.displaySec <= 5 && state.displaySec > 0)) return showToast("Betting locked!");
    currentK3Bet.choice = choice; currentK3Bet.multi = multi; currentK3Bet.base = 1; currentK3Bet.qty = 1; currentK3Bet.x = k3OuterMultiplier; 
    let headerBg = 'var(--primary)', btnBg = 'var(--primary)';
    if(choice === 'Big') { headerBg = 'linear-gradient(135deg, #ffc107, #ff9800)'; btnBg = '#ff9800'; }
    else if(choice === 'Small') { headerBg = 'linear-gradient(135deg, #4facfe, #00f2fe)'; btnBg = '#4facfe'; }
    else if(choice === 'Odd') { headerBg = 'linear-gradient(135deg, #ff6b6b, #ff4757)'; btnBg = '#ff4757'; }
    else if(choice === 'Even') { headerBg = 'linear-gradient(135deg, #2ecc71, #18b660)'; btnBg = '#18b660'; }
    document.getElementById('k3BetModalHeader').style.background = headerBg; document.getElementById('btnK3ConfirmBet').style.background = btnBg;
    const styleElement = document.createElement('style'); styleElement.id = 'dynamicK3BetStyle';
    styleElement.innerHTML = `.bet-opt.active { background: ${btnBg} !important; box-shadow: 0 2px 5px rgba(0,0,0,0.3) !important; color: white !important; } .qty-control button { background: ${btnBg} !important; }`;
    const existingStyle = document.getElementById('dynamicK3BetStyle'); if (existingStyle) existingStyle.remove(); document.head.appendChild(styleElement);
    document.getElementById('k3BetModalChoice').innerText = "Select " + choice;
    updateK3BetModalUI(); pushK3ModalState();
    let overlay = document.getElementById('k3BetModalOverlay'); if(overlay) overlay.classList.add('active');
}

function setK3OuterMultiplier(val, el) { k3OuterMultiplier = val; document.querySelectorAll('.k3-chip-row .k3-chip').forEach(e => e.classList.remove('active')); el.classList.add('active'); }
function setK3BetBase(val) { currentK3Bet.base = val; updateK3BetModalUI(); } 
function setK3BetMulti(val) { currentK3Bet.x = val; updateK3BetModalUI(); } 
function changeK3BetQty(val) { let newQty = currentK3Bet.qty + val; if(newQty >= 1) currentK3Bet.qty = newQty; updateK3BetModalUI(); }
function updateK3BetModalUI() { 
    document.querySelectorAll('#k3BaseOptions .bet-opt').forEach(el => el.classList.toggle('active', parseInt(el.innerText) === currentK3Bet.base)); 
    document.querySelectorAll('#k3MultiOptions .bet-opt').forEach(el => el.classList.toggle('active', parseInt(el.innerText.replace('X','')) === currentK3Bet.x)); 
    document.getElementById('k3BetQtyInput').value = currentK3Bet.qty; 
    let total = currentK3Bet.base * currentK3Bet.qty * currentK3Bet.x; document.getElementById('btnK3ConfirmBet').innerText = `Total amount ₹${total.toFixed(2)}`; 
}

function closeK3BetModal() { let modal = document.getElementById('k3BetModalOverlay'); if(modal) modal.classList.remove('active'); if(window.location.hash === '#modalOpen') { window.history.back(); } }

function confirmK3Bet() {
    let totalAmt = currentK3Bet.base * currentK3Bet.qty * currentK3Bet.x;
    if(totalAmt < 1) return showToast("Invalid amount");
    if(!currentUser) return showToast("User not loaded");
    let depBal = parseFloat(currentUser.depositBal) || 0; let wthBal = parseFloat(currentUser.withdrawBal) || 0; let total = depBal + wthBal;
    if(totalAmt > total) { closeK3BetModal(); return showToast("Insufficient balance!"); }
    if(depBal >= totalAmt) { currentUser.depositBal = depBal - totalAmt; } else { let remainder = totalAmt - depBal; currentUser.depositBal = 0; currentUser.withdrawBal = wthBal - remainder; }
    currentUser.balance = currentUser.depositBal + currentUser.withdrawBal;
    
    // Yahan ORDER ID ko "K3" se start kiya hai
    let dateStr = new Date().toISOString().slice(0,10).replace(/-/g,'');
    let randStr = Math.floor(100000 + Math.random() * 900000);
    let k3OrdId = `K3${dateStr}${randStr}`; 

    let actualBet = totalAmt * 0.98; 
    if(!currentUser.gameHistory) currentUser.gameHistory = []; let state = getK3State(activeK3Tab);
    currentUser.gameHistory.unshift({ id: k3OrdId, game: `K3 ${activeK3Tab}`, type: activeK3Tab, period: state.period, choice: currentK3Bet.choice, bet: totalAmt, actualBet: actualBet.toFixed(2), multi: currentK3Bet.multi, status: 'Pending', date: new Date().toLocaleString() });
    db.ref('users/' + currentUser.id).set(currentUser); closeK3BetModal(); showToast("Bet success", 1200); 
    if(typeof updateBalDisplay === 'function') updateBalDisplay();
}

function openK3HowToPlay() { pushK3ModalState(); let modal = document.getElementById('k3HtpModalOverlay'); if(modal) modal.classList.add('active'); }
function closeK3HowToPlay() { let modal = document.getElementById('k3HtpModalOverlay'); if (modal) modal.classList.remove('active'); if (window.location.hash === '#modalOpen') window.history.back(); }
function closeK3ResultModal() { let ol = document.getElementById('k3ResultModalOverlay'); if(ol) ol.classList.remove('active'); if(window.location.hash === '#modalOpen') window.history.back(); }

// INIT
startK3RealtimeSync();
startGlobalK3Timers();
