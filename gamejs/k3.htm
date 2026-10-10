// =======================================================
// K3 LOTRE FRONTEND LOGIC & ANIMATIONS
// =======================================================

var activeK3Tab = sessionStorage.getItem('k3Tab') || '1min'; 
var activeK3HistTab = sessionStorage.getItem('k3HTab') || 'global'; 
var currentK3Page = 1; 
var k3ItemsPerPage = 10; 
var globalK3History = { '1min': [], '3min': [], '5min': [], '10min': [] }; 
var k3Interval = null;
var lastK3Period = "";
var currentK3Bet = { choice: '', multi: 0, base: 1, qty: 1, x: 1 };
var k3OuterMultiplier = 1; 
var isK3SoundEnabled = true;

function pushK3ModalState() {
    if(window.location.hash !== '#modalOpen') { window.history.pushState({ screen: 'gamePlayScreen', isModal: true }, "", "#modalOpen"); }
}

function toggleK3Sound() {
    isK3SoundEnabled = !isK3SoundEnabled;
    let icon = document.getElementById('k3SoundToggle');
    if(icon) {
        if(isK3SoundEnabled) { icon.classList.replace('fa-volume-xmark', 'fa-volume-high'); icon.style.color = "inherit"; showToast("Sound On"); } 
        else { icon.classList.replace('fa-volume-high', 'fa-volume-xmark'); icon.style.color = "gray"; showToast("Sound Off"); }
    }
}

// Sound functions
function playK3TickSound() { 
    if (!audioCtx || !isK3SoundEnabled) return; 
    const osc = audioCtx.createOscillator(); const gainNode = audioCtx.createGain(); 
    osc.type = 'sine'; osc.frequency.setValueAtTime(800, audioCtx.currentTime); osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.05); 
    gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime); gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05); 
    osc.connect(gainNode); gainNode.connect(audioCtx.destination); 
    osc.start(); osc.stop(audioCtx.currentTime + 0.05); 
}

function playK3SpinSound() {
    if (!audioCtx || !isK3SoundEnabled) return; 
    const osc = audioCtx.createOscillator(); const gainNode = audioCtx.createGain(); 
    osc.type = 'triangle'; osc.frequency.setValueAtTime(400, audioCtx.currentTime); 
    gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime); gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05); 
    osc.connect(gainNode); gainNode.connect(audioCtx.destination); 
    osc.start(); osc.stop(audioCtx.currentTime + 0.05); 
}

// Dice Rendering Function (Dots change karega)
function renderDice(diceId, val) {
    let d = document.getElementById(diceId); if(!d) return;
    d.className = `k3-dice d${val}`;
    let dotsHtml = '';
    // Custom dot placement based on value 1 to 6
    if(val === 1) dotsHtml = `<div class="k3-dot" style="top:50%; left:50%; transform:translate(-50%, -50%); width:15px; height:15px;"></div>`;
    else if(val === 2) dotsHtml = `<div class="k3-dot" style="top:10px; left:10px;"></div><div class="k3-dot" style="bottom:10px; right:10px;"></div>`;
    else if(val === 3) dotsHtml = `<div class="k3-dot" style="top:10px; left:10px;"></div><div class="k3-dot" style="top:50%; left:50%; transform:translate(-50%, -50%);"></div><div class="k3-dot" style="bottom:10px; right:10px;"></div>`;
    else if(val === 4) dotsHtml = `<div class="k3-dot dot1"></div><div class="k3-dot dot2"></div><div class="k3-dot dot3"></div><div class="k3-dot dot4"></div>`;
    else if(val === 5) dotsHtml = `<div class="k3-dot dot1"></div><div class="k3-dot dot2"></div><div class="k3-dot" style="top:50%; left:50%; transform:translate(-50%, -50%);"></div><div class="k3-dot dot3"></div><div class="k3-dot dot4"></div>`;
    else if(val === 6) dotsHtml = `<div class="k3-dot dot1"></div><div class="k3-dot dot2"></div><div class="k3-dot dot3"></div><div class="k3-dot dot4"></div><div class="k3-dot dot5"></div><div class="k3-dot dot6"></div>`;
    d.innerHTML = dotsHtml;
}

function getK3State(type) { 
    let ms = getTrueTime(); let durationSec = type === '1min' ? 60 : (type === '3min' ? 180 : (type === '5min' ? 300 : 600)); 
    let durationMs = durationSec * 1000; let startOfDay = new Date().setHours(0,0,0,0); let elapsedMs = ms - startOfDay; 
    let seq = Math.floor(elapsedMs / durationMs) + 1; let currentPeriodStartMs = startOfDay + ((seq - 1) * durationMs); 
    let remainingSec = Math.floor((currentPeriodStartMs + durationMs - ms) / 1000); 
    let dateStr = new Date(ms).toISOString().slice(0,10).replace(/-/g,''); let period = dateStr + String(seq).padStart(4, '0'); 
    return { period, remainingSec }; 
}

function startGlobalK3Timers() {
    if(k3Interval) clearInterval(k3Interval);
    k3Interval = setInterval(() => {
        let state = getK3State(activeK3Tab);
        let kScreen = document.getElementById('k3Screen');
        if(!kScreen) return; 

        if (state.remainingSec <= 5 && state.remainingSec > 0 && kScreen.classList.contains('active') && document.visibilityState === 'visible') { playK3TickSound(); }
        
        if(kScreen.classList.contains('active')) {
            document.getElementById('k3Period').innerText = state.period;
            let min = Math.floor(state.remainingSec / 60); let sec = state.remainingSec % 60;
            document.getElementById('k3-min-1').innerText = Math.floor(min / 10); document.getElementById('k3-min-2').innerText = min % 10; document.getElementById('k3-sec-1').innerText = Math.floor(sec / 10); document.getElementById('k3-sec-2').innerText = sec % 10;
            
            let lockOverlay = document.getElementById('k3LockOverlay'), lockDigitSec = document.getElementById('k3LockDigitSec');
            if (state.remainingSec <= 5 && state.remainingSec >= 0) { 
                lockOverlay.classList.add('active'); 
                let newLock = lockDigitSec.cloneNode(true); newLock.innerText = state.remainingSec; lockDigitSec.parentNode.replaceChild(newLock, lockDigitSec); 
                // Randomly shuffle dice slightly during lock
                renderDice('dice1', Math.floor(Math.random()*6)+1); renderDice('dice2', Math.floor(Math.random()*6)+1); renderDice('dice3', Math.floor(Math.random()*6)+1);
            } else { 
                lockOverlay.classList.remove('active'); 
            }
        } 
    }, 1000);
}

function switchK3Tab(tab) { 
    activeK3Tab = tab; currentK3Page = 1; sessionStorage.setItem('k3Tab', tab); 
    ['1min', '3min', '5min', '10min'].forEach(t => { let el = document.getElementById('k3Tab'+t); if(el) el.classList.remove('active');}); 
    let actEl = document.getElementById('k3Tab' + tab); if(actEl) actEl.classList.add('active'); 
    // Logic for loading history will go here later
}

// RANDOM BUTTON ANIMATION + SOUND
let isK3Spinning = false;
function startK3RandomBet() {
    let state = getK3State(activeK3Tab); if (state.remainingSec <= 5) return showToast("Betting locked for last 5 secs!"); 
    if (isK3Spinning) return;
    
    isK3Spinning = true; 
    let count = 0; let maxSpins = 25; let speed = 50; 
    
    let spinInterval = setInterval(() => {
        playK3SpinSound();
        // Shake animation effect
        document.querySelector('.dice-container').style.transform = `translate(${Math.random()*4-2}px, ${Math.random()*4-2}px)`;
        
        renderDice('dice1', Math.floor(Math.random()*6)+1);
        renderDice('dice2', Math.floor(Math.random()*6)+1);
        renderDice('dice3', Math.floor(Math.random()*6)+1);
        
        count++;
        if (count >= maxSpins) {
            clearInterval(spinInterval);
            document.querySelector('.dice-container').style.transform = `translate(0, 0)`;
            isK3Spinning = false;
            
            // Pick a random total sum between 3 and 18
            let randomSum = Math.floor(Math.random() * (18 - 3 + 1)) + 3;
            // Fake multipliers just for prompt (Normally you'd map this correctly)
            let m = (randomSum===3 || randomSum===18) ? 207.36 : 10; 
            
            k3BetPrompt(randomSum.toString(), m);
        }
    }, speed);
}

function k3BetPrompt(choice, multi) {
    let state = getK3State(activeK3Tab); if (state.remainingSec <= 5) return showToast("Betting locked for last 5 secs!");
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
    updateK3BetModalUI(); 
    
    pushK3ModalState();
    document.getElementById('k3BetModalOverlay').classList.add('active');
}

function setK3OuterMultiplier(val, el) { 
    k3OuterMultiplier = val; 
    document.querySelectorAll('.k3-chip-row .k3-chip').forEach(e => e.classList.remove('active')); 
    el.classList.add('active'); 
}

function setK3BetBase(val) { currentK3Bet.base = val; updateK3BetModalUI(); } 
function setK3BetMulti(val) { currentK3Bet.x = val; updateK3BetModalUI(); } 
function changeK3BetQty(val) { let newQty = currentK3Bet.qty + val; if(newQty >= 1) currentK3Bet.qty = newQty; updateK3BetModalUI(); }
function updateK3BetModalUI() { 
    document.querySelectorAll('#k3BaseOptions .bet-opt').forEach(el => el.classList.toggle('active', parseInt(el.innerText) === currentK3Bet.base)); 
    document.querySelectorAll('#k3MultiOptions .bet-opt').forEach(el => el.classList.toggle('active', parseInt(el.innerText.replace('X','')) === currentK3Bet.x)); 
    document.getElementById('k3BetQtyInput').value = currentK3Bet.qty; 
    let total = currentK3Bet.base * currentK3Bet.qty * currentK3Bet.x; 
    document.getElementById('btnK3ConfirmBet').innerText = `Total amount ₹${total.toFixed(2)}`; 
}

function closeK3BetModal() { 
    let modal = document.getElementById('k3BetModalOverlay'); if(modal) modal.classList.remove('active');
    if(window.location.hash === '#modalOpen') { window.history.back(); }
}

function confirmK3Bet() {
    let totalAmt = currentK3Bet.base * currentK3Bet.qty * currentK3Bet.x;
    if(totalAmt < 1) return showToast("Invalid amount");
    let depBal = parseFloat(currentUser.depositBal) || 0; let wthBal = parseFloat(currentUser.withdrawBal) || 0; let total = depBal + wthBal;
    if(totalAmt > total) { closeK3BetModal(); return showToast("Insufficient balance!"); }
    
    // Deduct balance
    if(depBal >= totalAmt) { currentUser.depositBal = depBal - totalAmt; } else { let remainder = totalAmt - depBal; currentUser.depositBal = 0; currentUser.withdrawBal = wthBal - remainder; }
    currentUser.balance = currentUser.depositBal + currentUser.withdrawBal;
    let actualBet = totalAmt * 0.98; 
    
    if(!currentUser.gameHistory) currentUser.gameHistory = []; let state = getK3State(activeK3Tab);
    currentUser.gameHistory.unshift({ id: Date.now().toString(), game: `K3 ${activeK3Tab}`, type: activeK3Tab, period: state.period, choice: currentK3Bet.choice, bet: totalAmt, actualBet: actualBet.toFixed(2), multi: currentK3Bet.multi, status: 'Pending', date: new Date().toLocaleString() });
    
    db.ref('users/' + currentUser.id).set(currentUser);
    closeK3BetModal(); showToast("Bet success", 1200); updateBalDisplay();
}

function openK3HowToPlay() { pushK3ModalState(); document.getElementById('k3HtpModalOverlay').classList.add('active'); }
function closeK3HowToPlay() { let modal = document.getElementById('k3HtpModalOverlay'); if (modal) modal.classList.remove('active'); if (window.location.hash === '#modalOpen') window.history.back(); }
function closeK3ResultModal() { let ol = document.getElementById('k3ResultModalOverlay'); if(ol) ol.classList.remove('active'); if(window.location.hash === '#modalOpen') window.history.back(); }

// Render initial dice state
renderDice('dice1', 4); renderDice('dice2', 5); renderDice('dice3', 6);
startGlobalK3Timers();
