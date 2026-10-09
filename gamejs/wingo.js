// ==========================================
// WINGO FRONTEND LOGIC (game/wingo.js)
// ==========================================

var activeWingoTab = sessionStorage.getItem('wTab') || '1min'; 
var activeHistTab = sessionStorage.getItem('hTab') || 'global'; 
var currentWingoPage = 1; 
var wingoItemsPerPage = 10; 
var globalWingoHistory = { '30sec': [], '1min': [], '3min': [], '5min': [] }; 
var wingoInterval = null;
var lastWingoPeriod = "";
var currentBet = { choice: '', multi: 0, base: 1, qty: 1, x: 1 };
var resultModalTimeout;
var outerMultiplier = 1; 
var isWingoSoundEnabled = true;

// --- AUDIO UTILS (For Wingo Timer 5s Tick & Animation) ---
const AudioContext = window.AudioContext || window.webkitAudioContext; 
let audioCtx; 
function initAudio() { if (!audioCtx) audioCtx = new AudioContext(); if (audioCtx.state === 'suspended') audioCtx.resume(); } 
document.addEventListener('click', initAudio, { once: true }); 
document.addEventListener('touchstart', initAudio, { once: true });

function playTickSound() { 
    if (!audioCtx || !isWingoSoundEnabled) return; 
    const osc = audioCtx.createOscillator(); 
    const gainNode = audioCtx.createGain(); 
    osc.type = 'sine'; 
    osc.frequency.setValueAtTime(800, audioCtx.currentTime); 
    osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.05); 
    gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime); 
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05); 
    osc.connect(gainNode); gainNode.connect(audioCtx.destination); 
    osc.start(); osc.stop(audioCtx.currentTime + 0.05); 
}

function playSpinSound() {
    if (!audioCtx || !isWingoSoundEnabled) return; 
    const osc = audioCtx.createOscillator(); 
    const gainNode = audioCtx.createGain(); 
    osc.type = 'triangle'; 
    osc.frequency.setValueAtTime(400, audioCtx.currentTime); 
    gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime); 
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05); 
    osc.connect(gainNode); gainNode.connect(audioCtx.destination); 
    osc.start(); osc.stop(audioCtx.currentTime + 0.05); 
}

function toggleWingoSound() {
    isWingoSoundEnabled = !isWingoSoundEnabled;
    let icon = document.getElementById('soundToggleIcon');
    if(icon) {
        if(isWingoSoundEnabled) {
            icon.classList.replace('fa-volume-xmark', 'fa-volume-high');
            icon.style.color = "inherit";
            showToast("Sound On");
        } else {
            icon.classList.replace('fa-volume-high', 'fa-volume-xmark');
            icon.style.color = "gray";
            showToast("Sound Off");
        }
    }
}
// ---------------------------------------------



// Firebase Listeners for Wingo History
['30sec', '1min', '3min', '5min'].forEach(type => {
    db.ref(`wingo/results/${type}`).orderByKey().limitToLast(150).on('value', snap => {
        let data = snap.val(); let histArray = []; 
        if(data) { Object.keys(data).sort((a,b) => b.localeCompare(a)).forEach(key => histArray.push(data[key])); } 
        globalWingoHistory[type] = histArray;
        let wScreen = document.getElementById('wingoScreen');
        if(activeWingoTab === type && wScreen && wScreen.classList.contains('active')) { 
            if(activeHistTab === 'global') renderWingoHistory(); 
            if(activeHistTab === 'chart') renderChartHistory(); 
            updateLast5Balls();
        }
    });
});

function updateLast5Balls() {
    let container = document.getElementById('last5BallsContainer');
    if(!container) return;
    let rawHistData = globalWingoHistory[activeWingoTab] || [];
    let currentState = getWingoState(activeWingoTab);
    let histData = rawHistData.filter(r => parseInt(r.period) < parseInt(currentState.period));
    let last5 = histData.slice(0, 5);
    container.innerHTML = "";
    last5.forEach(r => {
        let num = parseInt(r.num);
        let bgC = num % 2 === 0 ? 'var(--w-red)' : 'var(--w-green)'; 
        if(num === 0 || num === 5) bgC = num === 0 ? 'linear-gradient(135deg, var(--w-red) 50%, var(--w-violet) 50%)' : 'linear-gradient(135deg, var(--w-green) 50%, var(--w-violet) 50%)';
        container.innerHTML += `<div class="l5-ball" style="background:${bgC};">${num}</div>`;
    });
}

function switchWingoTab(tab) { 
    activeWingoTab = tab; currentWingoPage = 1; sessionStorage.setItem('wTab', tab); 
    ['30sec', '1min', '3min', '5min'].forEach(t => { let el = document.getElementById('tab'+t); if(el) el.classList.remove('active');}); 
    let actEl = document.getElementById('tab' + tab); if(actEl) actEl.classList.add('active'); 
    
    let timeText = tab === '30sec' ? '30 seconds' : (tab === '1min' ? '1 minute' : (tab === '3min' ? '3 minutes' : '5 minutes'));
    let ticketEl = document.getElementById('ticketTimeText');
    let htpEl = document.getElementById('htpTimeDesc');
    if(ticketEl) ticketEl.innerText = timeText;
    if(htpEl) htpEl.innerText = timeText;

    updateWingoUI(); 
    switchHistPanel(activeHistTab); 
    updateLast5Balls();
}

function switchHistPanel(tab) { activeHistTab = tab; sessionStorage.setItem('hTab', tab); ['Global', 'Chart', 'Mine'].forEach(t => { let btn = document.getElementById('btnTab'+t); let pane = document.getElementById('pane'+t+'Hist'); if(btn) btn.classList.remove('active'); if(pane) pane.classList.remove('active'); }); let capTab = tab.charAt(0).toUpperCase() + tab.slice(1); let actBtn = document.getElementById('btnTab'+capTab); let actPane = document.getElementById('pane'+capTab+'Hist'); if(actBtn) actBtn.classList.add('active'); if(actPane) actPane.classList.add('active'); if(tab === 'global') renderWingoHistory(); if(tab === 'chart') renderChartHistory(); if(tab === 'mine') renderMyHistory(); }

function getWingoState(type) { let ms = getTrueTime(); let durationSec = type === '30sec' ? 30 : (type === '1min' ? 60 : (type === '3min' ? 180 : 300)); let durationMs = durationSec * 1000; let startOfDay = new Date().setHours(0,0,0,0); let elapsedMs = ms - startOfDay; let seq = Math.floor(elapsedMs / durationMs) + 1; let currentPeriodStartMs = startOfDay + ((seq - 1) * durationMs); let remainingSec = Math.floor((currentPeriodStartMs + durationMs - ms) / 1000); let dateStr = new Date(ms).toISOString().slice(0,10).replace(/-/g,''); let period = dateStr + String(seq).padStart(4, '0'); return { period, remainingSec }; }

function startGlobalWingoTimers() {
    if(wingoInterval) clearInterval(wingoInterval);
    wingoInterval = setInterval(() => {
        let state = getWingoState(activeWingoTab);
        
        let wScreen = document.getElementById('wingoScreen');
        if(!wScreen) return; 

        if (state.remainingSec <= 5 && state.remainingSec > 0 && wScreen.classList.contains('active') && document.visibilityState === 'visible') { playTickSound(); }
        
        if(wScreen.classList.contains('active')) updateWingoUI(state); 
        
        if (lastWingoPeriod !== "" && lastWingoPeriod !== state.period) {
            if(wScreen.classList.contains('active')) { switchHistPanel(activeHistTab); }
        }
        lastWingoPeriod = state.period;

        processPendingBets();
    }, 1000);
}

function updateWingoUI(state = null) {
    if(!state) state = getWingoState(activeWingoTab); 
    let periodEl = document.getElementById('wingoPeriod');
    if(!periodEl) return; 
    periodEl.innerText = state.period;

    let min = Math.floor(state.remainingSec / 60); let sec = state.remainingSec % 60;
    document.getElementById('t-min-1').innerText = Math.floor(min / 10); document.getElementById('t-min-2').innerText = min % 10; document.getElementById('t-sec-1').innerText = Math.floor(sec / 10); document.getElementById('t-sec-2').innerText = sec % 10;
    let lockOverlay = document.getElementById('betLockOverlay'), lockDigitSec = document.getElementById('lockDigitSec');
    if (state.remainingSec <= 5 && state.remainingSec >= 0) { lockOverlay.classList.add('active'); let newLock = lockDigitSec.cloneNode(true); newLock.innerText = state.remainingSec; lockDigitSec.parentNode.replaceChild(newLock, lockDigitSec); } else { lockOverlay.classList.remove('active'); }
}

function wingoBetPrompt(choice, multi) {
    let state = getWingoState(activeWingoTab); if (state.remainingSec <= 5) return showToast("Betting locked for last 5 secs!");
    
    currentBet.choice = choice; currentBet.multi = multi; currentBet.base = 1; currentBet.qty = 1; 
    currentBet.x = outerMultiplier; 

    let headerBg = 'var(--primary)', btnBg = 'var(--primary)';
    
    // ==========================================
    // VIOLET BUG FIX (Color logic is corrected)
    // ==========================================
    if(choice === '0') {
        headerBg = 'linear-gradient(135deg, var(--w-red) 50%, var(--w-violet) 50%)';
        btnBg = 'var(--w-red)'; 
    } else if(choice === '5') {
        headerBg = 'linear-gradient(135deg, var(--w-green) 50%, var(--w-violet) 50%)';
        btnBg = 'var(--w-green)';
    } else if(choice === 'Violet') { 
        headerBg = 'var(--w-violet)'; btnBg = 'var(--w-violet)'; 
    } else if(choice === 'Big') { 
        headerBg = 'var(--w-yellow)'; btnBg = 'var(--w-yellow)'; 
    } else if(choice === 'Small') { 
        headerBg = 'var(--w-blue)'; btnBg = 'var(--w-blue)'; 
    } else if(choice === 'Red' || (!isNaN(choice) && choice % 2 === 0)) { 
        headerBg = 'var(--w-red)'; btnBg = 'var(--w-red)'; 
    } else if(choice === 'Green' || (!isNaN(choice) && choice % 2 !== 0)) { 
        headerBg = 'var(--w-green)'; btnBg = 'var(--w-green)'; 
    }

    document.getElementById('betModalHeader').style.background = headerBg; 
    document.getElementById('btnConfirmBet').style.background = btnBg;
    const styleElement = document.createElement('style'); styleElement.id = 'dynamicBetStyle';
    styleElement.innerHTML = `.bet-opt.active { background: ${btnBg} !important; box-shadow: 0 2px 5px rgba(0,0,0,0.3) !important; color: white !important; } .qty-control button { background: ${btnBg} !important; }`;
    const existingStyle = document.getElementById('dynamicBetStyle'); if (existingStyle) existingStyle.remove(); document.head.appendChild(styleElement);
    
    document.getElementById('betModalTitle').innerText = "WinGo Bet"; document.getElementById('betModalChoice').innerText = "Select " + choice;
    updateBetModalUI(); 
    document.getElementById('betModalOverlay').classList.add('active');
    
    // BACK BUTTON FIX: Push state history in mobile so back button works
    history.pushState({ modal: 'betMenu' }, '', '');
}

function setOuterMultiplier(val) {
    outerMultiplier = val;
    document.querySelectorAll('.chip-row .chip').forEach(el => el.classList.remove('active'));
    event.target.classList.add('active');
}

let isSpinningRandom = false;
function startRandomBet() {
    let state = getWingoState(activeWingoTab); 
    if (state.remainingSec <= 5) return showToast("Betting locked for last 5 secs!");
    if (isSpinningRandom) return;
    
    isSpinningRandom = true;
    let count = 0; let maxSpins = 20; let speed = 50; 
    let numBalls = document.querySelectorAll('.w-ball');
    let prevIndex = -1;

    let spinInterval = setInterval(() => {
        playSpinSound();
        if(prevIndex !== -1) {
            numBalls[prevIndex].style.transform = 'scale(1)';
            numBalls[prevIndex].style.boxShadow = 'none';
        }
        let randomIdx = Math.floor(Math.random() * 10);
        numBalls[randomIdx].style.transform = 'scale(1.2)';
        numBalls[randomIdx].style.boxShadow = '0 0 15px var(--primary)';
        prevIndex = randomIdx;
        count++;
        
        if (count >= maxSpins) {
            clearInterval(spinInterval);
            setTimeout(() => {
                numBalls[prevIndex].style.transform = 'scale(1)';
                numBalls[prevIndex].style.boxShadow = 'none';
                isSpinningRandom = false;
                let finalChoice = prevIndex.toString();
                wingoBetPrompt(finalChoice, 9);
            }, 300);
        }
    }, speed);
}

function openHowToPlay() { document.getElementById('htpModalOverlay').classList.add('active'); }
function closeHowToPlay() { document.getElementById('htpModalOverlay').classList.remove('active'); }


function setBetBase(val) { currentBet.base = val; updateBetModalUI(); } function setBetMulti(val) { currentBet.x = val; updateBetModalUI(); } function changeBetQty(val) { let newQty = currentBet.qty + val; if(newQty >= 1) currentBet.qty = newQty; updateBetModalUI(); }
function updateBetModalUI() { document.querySelectorAll('#baseOptions .bet-opt').forEach(el => el.classList.toggle('active', parseInt(el.innerText) === currentBet.base)); document.querySelectorAll('#multiOptions .bet-opt').forEach(el => el.classList.toggle('active', parseInt(el.innerText.replace('X','')) === currentBet.x)); document.getElementById('betQtyInput').value = currentBet.qty; let total = currentBet.base * currentBet.qty * currentBet.x; document.getElementById('btnConfirmBet').innerText = `Total amount ₹${total.toFixed(2)}`; }
function closeBetModal() { document.getElementById('betModalOverlay').classList.remove('active'); }

function confirmBet() {
    let totalAmt = currentBet.base * currentBet.qty * currentBet.x;
    if(totalAmt < 1) return showToast("Invalid amount");
    
    let depBal = parseFloat(currentUser.depositBal) || 0; let wthBal = parseFloat(currentUser.withdrawBal) || 0; let total = depBal + wthBal;
    if(totalAmt > total) { closeBetModal(); return showToast("Insufficient balance!"); }
    
    if(depBal >= totalAmt) { currentUser.depositBal = depBal - totalAmt; } 
    else { let remainder = totalAmt - depBal; currentUser.depositBal = 0; currentUser.withdrawBal = wthBal - remainder; }
    currentUser.balance = currentUser.depositBal + currentUser.withdrawBal;
    
    let actualBet = totalAmt * 0.98; 
    if(!currentUser.gameHistory) currentUser.gameHistory = [];
    let state = getWingoState(activeWingoTab);
    currentUser.gameHistory.unshift({ id: Date.now().toString(), game: `Win Go ${activeWingoTab}`, type: activeWingoTab, period: state.period, choice: currentBet.choice, bet: totalAmt, actualBet: actualBet.toFixed(2), multi: currentBet.multi, status: 'Pending', date: new Date().toLocaleString() });
    
    (function(userClone) { db.ref('users/' + userClone.id).set(userClone); })(JSON.parse(JSON.stringify(currentUser)));
    
    closeBetModal(); showToast("Bet success", 1200); if(activeHistTab === 'mine') renderMyHistory();
}

function processPendingBets() {
    if(!currentUser || !currentUser.gameHistory) return; let needsUpdate = false; let popupsToShow = [];
    currentUser.gameHistory.forEach(b => {
        if(b.status === 'Pending' && b.game && b.game.includes('Win Go')) {
            let histArray = globalWingoHistory[b.type] || []; 
            let currentState = getWingoState(b.type);
            let resultData = histArray.find(r => r.period === b.period);
            
            if(resultData && parseInt(b.period) < parseInt(currentState.period)) {
                let isWin = false;
                if(b.choice === 'Green' && (resultData.num===1 || resultData.num===3 || resultData.num===7 || resultData.num===9 || resultData.num===5)) isWin = true;
                if(b.choice === 'Red' && (resultData.num===2 || resultData.num===4 || resultData.num===6 || resultData.num===8 || resultData.num===0)) isWin = true;
                if(b.choice === 'Violet' && (resultData.num===0 || resultData.num===5)) isWin = true;
                if(b.choice === resultData.size) isWin = true;
                if(b.choice == resultData.num) isWin = true;
                
                let actualBetAmt = parseFloat(b.actualBet) || (parseFloat(b.bet) * 0.98); let winAmt = isWin ? (actualBetAmt * b.multi).toFixed(2) : 0;
                if(isWin) { currentUser.withdrawBal = (parseFloat(currentUser.withdrawBal) || 0) + parseFloat(winAmt); currentUser.balance = (parseFloat(currentUser.depositBal) || 0) + currentUser.withdrawBal; }
                
                b.status = isWin ? 'Success' : 'Failed'; b.isWin = isWin; b.winAmt = winAmt; b.actualBet = actualBetAmt.toFixed(2); b.resNum = resultData.num; needsUpdate = true;
                if(activeWingoTab === b.type && document.getElementById('wingoScreen') && document.getElementById('wingoScreen').classList.contains('active')) { popupsToShow.push({status: isWin?'win':'lose', num: resultData.num, color: resultData.color, size: resultData.size, amt: winAmt, type: b.type, period: b.period}); }
            } else if (!resultData) {
                if(parseInt(currentState.period) > parseInt(b.period) + 1) {
                    let refundAmt = parseFloat(b.bet);
                    currentUser.depositBal = (parseFloat(currentUser.depositBal) || 0) + refundAmt;
                    currentUser.balance = currentUser.depositBal + (parseFloat(currentUser.withdrawBal) || 0);
                    b.status = 'Refunded'; b.isWin = false; b.winAmt = refundAmt; b.actualBet = 0; b.resNum = '-'; needsUpdate = true;
                }
            }
        }
    });
    if(needsUpdate) { (function(userClone) { db.ref('users/' + userClone.id).set(userClone); })(JSON.parse(JSON.stringify(currentUser))); updateBalDisplay(); if(activeHistTab === 'mine') renderMyHistory(); }
    if(popupsToShow.length > 0) { let p = popupsToShow[0]; showResultModal(p.status, p.num, p.color, p.size, parseFloat(p.amt), p.type, p.period); }
}

function showResultModal(status, num, color, size, amt, type, period) {
    clearTimeout(resultModalTimeout); let overlay = document.getElementById('resultModalOverlay'), card = document.getElementById('resultCard'), badge = document.getElementById('resultBadge'), title = document.getElementById('resultTitle'), bonusLabel = document.getElementById('resultBonusLabel'), bonusAmt = document.getElementById('resultBonusAmt');
    if(!overlay) return;
    document.getElementById('resColorBox').innerText = color; document.getElementById('resNumBox').innerText = num; document.getElementById('resSizeBox').innerText = size; let cBox = document.getElementById('resColorBox'); cBox.style.color = '#fff';
    if(color === 'Red') cBox.style.background = 'var(--w-red)'; else if(color === 'Green') cBox.style.background = 'var(--w-green)'; else if(color === 'Red & Violet') cBox.style.background = 'linear-gradient(135deg, var(--w-red) 50%, var(--w-violet) 50%)'; else if(color === 'Green & Violet') cBox.style.background = 'linear-gradient(135deg, var(--w-green) 50%, var(--w-violet) 50%)';
    document.getElementById('resultPeriodText').innerText = `Period: WinGo ${period}`;
    
    if(status === 'win') { 
        card.className = 'result-card'; badge.innerHTML = '<i class="fa-solid fa-trophy"></i>'; title.innerText = 'Congratulations'; bonusLabel.innerText = 'Bonus'; bonusAmt.innerText = '₹' + amt.toFixed(2); bonusAmt.style.color = '#f95959'; document.getElementById('resBonusSlipBox').style.color = '#f95959'; 
        let winSound = new Audio('WIN_SOUND_LINK_YAHAN_DALEIN.mp3'); winSound.play().catch(e=>{});
    } else { 
        card.className = 'result-card lose-theme'; badge.innerHTML = '<i class="fa-solid fa-face-sad-tear"></i>'; title.innerText = 'Sorry, You Lose'; bonusLabel.innerText = 'Loss'; bonusAmt.innerText = '₹0.00'; bonusAmt.style.color = '#455a64'; document.getElementById('resBonusSlipBox').style.color = '#455a64'; 
        let loseSound = new Audio('LOSE_SOUND_LINK_YAHAN_DALEIN.mp3'); loseSound.play().catch(e=>{});
    }

    overlay.classList.add('active'); resultModalTimeout = setTimeout(() => { closeResultModal(); }, 3000);
}
function closeResultModal() { let ol = document.getElementById('resultModalOverlay'); if(ol) ol.classList.remove('active'); }

function renderWingoHistory() { 
    let list = document.getElementById('wingoHistoryList'); if(!list) return;
    let rawHistData = globalWingoHistory[activeWingoTab] || []; 
    let currentState = getWingoState(activeWingoTab);
    let histData = rawHistData.filter(r => parseInt(r.period) < parseInt(currentState.period));
    list.innerHTML = ""; 
    if(histData.length === 0) { document.getElementById('wingoPageIndicator').innerText = "1/1"; return; }
    let totalPages = Math.ceil(histData.length / wingoItemsPerPage); if (currentWingoPage > totalPages) currentWingoPage = totalPages; if (currentWingoPage < 1) currentWingoPage = 1; document.getElementById('wingoPageIndicator').innerText = currentWingoPage + "/" + totalPages;
    let startIndex = (currentWingoPage - 1) * wingoItemsPerPage; let endIndex = startIndex + wingoItemsPerPage;
    histData.slice(startIndex, endIndex).forEach(r => { list.innerHTML += `<div style="display:flex; padding:10px; border-bottom:1px solid var(--border); font-size:13px; align-items:center;"><div style="flex:2;">${r.period}</div><div style="flex:1; text-align:center;"><span style="font-size:18px; font-weight:bold; ${r.numStyle}">${r.num}</span></div><div style="flex:1; text-align:center;">${r.size}</div><div style="flex:1; display:flex; justify-content:center; gap:3px;">${r.colorHtml}</div></div>`; }); 
    document.getElementById('btnPrevPage').style.background = currentWingoPage === 1 ? '#e0e0e0' : 'var(--w-red)'; document.getElementById('btnPrevPage').style.color = currentWingoPage === 1 ? '#888' : 'white'; document.getElementById('btnNextPage').style.background = currentWingoPage === totalPages ? '#e0e0e0' : 'var(--w-red)'; document.getElementById('btnNextPage').style.color = currentWingoPage === totalPages ? '#888' : 'white';
}
function changeWingoPage(dir) { let histData = globalWingoHistory[activeWingoTab] || []; let totalPages = Math.ceil(histData.length / wingoItemsPerPage); currentWingoPage += dir; if(currentWingoPage < 1) currentWingoPage = 1; if(currentWingoPage > totalPages) currentWingoPage = totalPages; renderWingoHistory(); }

function renderChartHistory() {
    let list = document.getElementById('wingoChartList'); if(!list) return;
    let rawHistData = globalWingoHistory[activeWingoTab] || []; 
    let currentState = getWingoState(activeWingoTab);
    let histData = rawHistData.filter(r => parseInt(r.period) < parseInt(currentState.period));
    list.innerHTML = "";
    histData.slice(0, 30).forEach(r => { let bgC = r.num % 2 === 0 ? 'var(--w-red)' : 'var(--w-green)'; if(r.num === 0 || r.num === 5) bgC = 'var(--w-violet)'; let numsHtml = ''; for(let i=0; i<=9; i++) { if(i === r.num) numsHtml += `<div class="c-num active" style="background:${bgC};">${i}</div>`; else numsHtml += `<div class="c-num">${i}</div>`; } list.innerHTML += `<div class="chart-row"><div style="flex:1;">${r.period}</div><div class="chart-nums">${numsHtml}</div></div>`; });
    setTimeout(drawChartLines, 50); 
}
function drawChartLines() {
    let svg = document.getElementById('chartLineSvg'), container = document.getElementById('wingoChartList'); if(!svg || !container) return; svg.innerHTML = ''; let points = []; let actives = container.querySelectorAll('.c-num.active'); let containerRect = container.getBoundingClientRect();
    actives.forEach(el => { let rect = el.getBoundingClientRect(); let x = rect.left - containerRect.left + (rect.width / 2); let y = rect.top - containerRect.top + (rect.height / 2); points.push(`${x},${y}`); });
    if(points.length > 1) { let polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline"); polyline.setAttribute("points", points.join(" ")); polyline.setAttribute("fill", "none"); polyline.setAttribute("stroke", "#fb4e4e"); polyline.setAttribute("stroke-width", "1.5"); svg.appendChild(polyline); }
}

function renderMyHistory() {
    let list = document.getElementById('wingoMineList'); if(!list) return;
    if(!currentUser || !currentUser.gameHistory) { list.innerHTML = "<p style='text-align:center; color:gray; padding:20px;'>No data</p>"; return; }
    let todayStr = new Date().toDateString();
    let myData = currentUser.gameHistory.filter(h => h.type === activeWingoTab && new Date(h.date).toDateString() === todayStr); 
    list.innerHTML = ""; if(myData.length === 0) { list.innerHTML = "<p style='text-align:center; color:gray; padding:20px;'>No data</p>"; return; }
    myData.forEach(item => {
        let boxBg = 'var(--w-blue)'; if(item.choice === 'Red') boxBg = 'var(--w-red)'; else if(item.choice === 'Green') boxBg = 'var(--w-green)'; else if(item.choice === 'Violet') boxBg = 'var(--w-violet)'; else if(item.choice === 'Big') boxBg = 'var(--w-yellow)'; else if(item.choice === 'Small') boxBg = 'var(--w-blue)'; else if(!isNaN(item.choice)) { if(item.choice == 0 || item.choice == 5) boxBg = 'var(--w-violet)'; else if(item.choice % 2 == 0) boxBg = 'var(--w-red)'; else boxBg = 'var(--w-green)'; }
        let boxTxt = ""; if(!isNaN(item.choice)) { boxTxt = item.choice; } else { if(item.status === 'Success' && item.resNum !== undefined) { boxTxt = item.resNum; } else if (item.status === 'Refunded') { boxTxt = '-'; } }
        let isPending = item.status === 'Pending'; let isRefund = item.status === 'Refunded'; let isWin = item.isWin; 
        let actualBetAmt = item.actualBet || (parseFloat(item.bet)*0.98).toFixed(2); 
        let amtText = isPending ? `₹${item.bet}` : (isRefund ? `+₹${item.bet}` : (isWin ? `+₹${item.winAmt}` : `-₹${actualBetAmt}`)); 
        let statusColor = isPending ? '#fb9337' : (isRefund ? '#0984e3' : (isWin ? '#18b660' : '#fb4e4e'));
        list.innerHTML += `<div class="my-hist-card"><div style="display:flex; gap:10px; align-items:center;"><div style="width:40px; height:40px; border-radius:8px; background:${boxBg}; color:white; display:flex; justify-content:center; align-items:center; font-weight:bold; font-size:18px;">${boxTxt}</div><div><div style="font-weight:bold; font-size:14px; margin-bottom:2px;">${item.period}</div><div style="font-size:11px; color:gray;">${item.date}</div></div></div><div style="text-align:right;"><div style="color:${statusColor}; font-size:12px; font-weight:bold; border:1px solid ${statusColor}; padding:2px 8px; border-radius:10px; display:inline-block; margin-bottom:5px;">${item.status}</div><div style="color:${statusColor}; font-weight:bold; font-size:15px;">${amtText}</div></div></div>`;
    });
}

// ==========================================
// BACK BUTTON FIX (Modals close on mobile back button)
// ==========================================
window.addEventListener('popstate', function(event) {
    let betModal = document.getElementById('betModalOverlay');
    if (betModal && betModal.classList.contains('active')) {
        betModal.classList.remove('active');
    }
    let resultModal = document.getElementById('resultModalOverlay');
    if (resultModal && resultModal.classList.contains('active')) {
        resultModal.classList.remove('active');
    }
    let htpModal = document.getElementById('htpModalOverlay');
    if (htpModal && htpModal.classList.contains('active')) {
        htpModal.classList.remove('active');
    }
});

// Start immediately when this script loads
startGlobalWingoTimers();
