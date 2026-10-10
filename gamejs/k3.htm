// =======================================================
// K3 LOTRE FRONTEND LOGIC (REAL 3D DICE, FULL TABS, WIN LOGIC)
// =======================================================

var activeK3Tab = sessionStorage.getItem('k3Tab') || '1min'; 
var activeK3HistTab = 'global';
var currentK3Page = 1; 
var k3Interval = null;
var globalK3History = { '1min': [], '3min': [], '5min': [], '10min': [] };
var currentK3Bet = { choice: '', base: 1, qty: 1, multi: 1, odds: 0, color: '' }; 
var isK3SoundEnabled = true;
var currentK3Listener = null;
var isK3Spinning = false;
var lastK3Period = "";
var k3HashBeforeModal = ""; 

var k3AudioCtx = null;
try { k3AudioCtx = window.audioCtx || new (window.AudioContext || window.webkitAudioContext)(); } catch(e){}

function pushK3ModalState() { if(window.location.hash !== '#modalOpen') { window.history.pushState({ screen: 'gamePlayScreen', isModal: true }, "", "#modalOpen"); } }
function toggleK3Sound() { isK3SoundEnabled = !isK3SoundEnabled; let icon = document.getElementById('k3SoundToggle'); if(icon) { if(isK3SoundEnabled) { icon.classList.replace('fa-volume-xmark', 'fa-volume-high'); icon.style.color = "inherit"; showToast("Sound On"); } else { icon.classList.replace('fa-volume-high', 'fa-volume-xmark'); icon.style.color = "gray"; showToast("Sound Off"); } } }
function playK3TickSound() { if (!k3AudioCtx || !isK3SoundEnabled) return; try { const osc = k3AudioCtx.createOscillator(); const gainNode = k3AudioCtx.createGain(); osc.type = 'sine'; osc.frequency.setValueAtTime(800, k3AudioCtx.currentTime); osc.frequency.exponentialRampToValueAtTime(300, k3AudioCtx.currentTime + 0.05); gainNode.gain.setValueAtTime(0.5, k3AudioCtx.currentTime); gainNode.gain.exponentialRampToValueAtTime(0.01, k3AudioCtx.currentTime + 0.05); osc.connect(gainNode); gainNode.connect(k3AudioCtx.destination); osc.start(); osc.stop(k3AudioCtx.currentTime + 0.05); } catch(e){} }
function playK3SpinSound() { if (!k3AudioCtx || !isK3SoundEnabled) return; try { const osc = k3AudioCtx.createOscillator(); const gainNode = k3AudioCtx.createGain(); osc.type = 'triangle'; osc.frequency.setValueAtTime(400, k3AudioCtx.currentTime); gainNode.gain.setValueAtTime(0.2, k3AudioCtx.currentTime); gainNode.gain.exponentialRampToValueAtTime(0.01, k3AudioCtx.currentTime + 0.05); osc.connect(gainNode); gainNode.connect(k3AudioCtx.destination); osc.start(); osc.stop(k3AudioCtx.currentTime + 0.05); } catch(e){} }

// Wallet Spin Fix (No Redirect)
function forceK3BalanceRefresh() {
    let icon = document.querySelector('#k3Bal').nextElementSibling;
    if(icon) icon.classList.add('fa-spin-fast');
    if(typeof currentUser !== 'undefined' && currentUser && db) {
        db.ref('users/' + currentUser.id).once('value').then(snap => {
            let u = snap.val(); if(u) { currentUser = u; if(typeof updateBalDisplay === 'function') updateBalDisplay(); showToast("Balance refreshed!"); }
            setTimeout(() => { if(icon) icon.classList.remove('fa-spin-fast'); }, 600);
        });
    } else { setTimeout(() => { if(icon) icon.classList.remove('fa-spin-fast'); }, 600); }
}

// 3D DICE RENDERER
function renderDice(diceId, val) {
    let cube = document.getElementById(diceId); if(!cube) return;
    let frontFace = cube.querySelector('.cube-face-front'); if(!frontFace) return;
    let dotsHtml = '';
    if(val === 1) dotsHtml = `<div class="k3-dot dot-center dot-big-yellow"></div>`;
    else if(val === 2) dotsHtml = `<div class="k3-dot dot-tl"></div><div class="k3-dot dot-br"></div>`;
    else if(val === 3) dotsHtml = `<div class="k3-dot dot-tl"></div><div class="k3-dot dot-center"></div><div class="k3-dot dot-br"></div>`;
    else if(val === 4) dotsHtml = `<div class="k3-dot dot-tl"></div><div class="k3-dot dot-tr"></div><div class="k3-dot dot-bl"></div><div class="k3-dot dot-br"></div>`;
    else if(val === 5) dotsHtml = `<div class="k3-dot dot-tl"></div><div class="k3-dot dot-tr"></div><div class="k3-dot dot-center"></div><div class="k3-dot dot-bl"></div><div class="k3-dot dot-br"></div>`;
    else if(val === 6) dotsHtml = `<div class="k3-dot dot-tl"></div><div class="k3-dot dot-tr"></div><div class="k3-dot dot-ml"></div><div class="k3-dot dot-mr"></div><div class="k3-dot dot-bl"></div><div class="k3-dot dot-br"></div>`;
    frontFace.innerHTML = dotsHtml;
}

// MINI DICE RENDERER FOR HISTORY TABLES
function getMiniDiceHtml(d1, d2, d3) {
    const getDotHtml = (val) => {
        if(val==1) return `<div class="hd-dot hd-c yellow" style="width:6px; height:6px;"></div>`;
        if(val==2) return `<div class="hd-dot hd-tl"></div><div class="hd-dot hd-br"></div>`;
        if(val==3) return `<div class="hd-dot hd-tl"></div><div class="hd-dot hd-c"></div><div class="hd-dot hd-br"></div>`;
        if(val==4) return `<div class="hd-dot hd-tl"></div><div class="hd-dot hd-tr"></div><div class="hd-dot hd-bl"></div><div class="hd-dot hd-br"></div>`;
        if(val==5) return `<div class="hd-dot hd-tl"></div><div class="hd-dot hd-tr"></div><div class="hd-dot hd-c"></div><div class="hd-dot hd-bl"></div><div class="hd-dot hd-br"></div>`;
        if(val==6) return `<div class="hd-dot hd-tl"></div><div class="hd-dot hd-tr"></div><div class="hd-dot hd-ml"></div><div class="hd-dot hd-mr"></div><div class="hd-dot hd-bl"></div><div class="hd-dot hd-br"></div>`;
        return '';
    };
    return `<div class="h-dice-wrap"><div class="h-dice">${getDotHtml(d1)}</div><div class="h-dice">${getDotHtml(d2)}</div><div class="h-dice">${getDotHtml(d3)}</div></div>`;
}

// TIMER LOGIC
function getK3State(type) { 
    let ms = typeof getTrueTime === 'function' ? getTrueTime() : Date.now(); 
    let durationSec = type === '1min' ? 60 : (type === '3min' ? 180 : (type === '5min' ? 300 : 600)); 
    let durationMs = durationSec * 1000; let startOfDay = new Date().setHours(0,0,0,0); let elapsedMs = ms - startOfDay; 
    let seq = Math.floor(elapsedMs / durationMs) + 1; let currentPeriodStartMs = startOfDay + ((seq - 1) * durationMs); 
    let remainingSec = Math.floor((currentPeriodStartMs + durationMs - ms) / 1000); 
    let dateStr = new Date(ms).toISOString().slice(0,10).replace(/-/g,''); let period = dateStr + String(seq).padStart(4, '0'); 
    let displaySec = remainingSec; let isSpinTime = false;
    if (remainingSec === 0 || remainingSec >= durationSec - 2) { displaySec = 0; isSpinTime = true; }
    return { period, remainingSec, displaySec, isSpinTime }; 
}

// REALTIME SYNC
function startK3RealtimeSync() {
    ['1min', '3min', '5min', '10min'].forEach(type => {
        if(db) db.ref(`k3/results/${type}`).orderByKey().limitToLast(100).on('value', snap => {
            let data = snap.val(); let histArray = []; 
            if(data) { Object.keys(data).sort((a,b) => b.localeCompare(a)).forEach(key => histArray.push(data[key])); } 
            globalK3History[type] = histArray;
            
            let kScreen = document.getElementById('k3Screen');
            if(activeK3Tab === type && kScreen && kScreen.classList.contains('active')) {
                let latest = histArray[0];
                if(latest) { renderDice('dice1', latest.d1||1); renderDice('dice2', latest.d2||1); renderDice('dice3', latest.d3||1); }
                if (isK3Spinning) stopK3AutoSpin(); 
                if(activeK3HistTab === 'global') renderK3HistoryTable(); 
                if(activeK3HistTab === 'chart') renderK3Chart(); 
            }
        });
    });
}

function stopK3AutoSpin() { isK3Spinning = false; document.querySelectorAll('.cube').forEach(c => c.classList.remove('spinning')); }
function startK3AutoSpin() { if (isK3Spinning) return; isK3Spinning = true; playK3SpinSound(); document.querySelectorAll('.cube').forEach(c => c.classList.add('spinning')); }

// SUB TABS SWITCHER
function switchK3SubTab(tab) {
    ['total', '2same', '3same', 'diff'].forEach(t => { 
        let el = document.getElementById('st-'+t); let p = document.getElementById('panel-'+t);
        if(el) el.classList.remove('active'); if(p) p.classList.remove('active');
    });
    let actEl = document.getElementById('st-'+tab); let actP = document.getElementById('panel-'+tab);
    if(actEl) actEl.classList.add('active'); if(actP) actP.classList.add('active');
    
    let title = "Total";
    if(tab==='2same') title = "2 same"; else if(tab==='3same') title = "3 same"; else if(tab==='diff') title = "Different";
    document.getElementById('k3BetModalTitle').innerText = title;
}

// HISTORY TABS SWITCHER
function switchK3HistPanel(tab) {
    activeK3HistTab = tab;
    ['global', 'chart', 'mine'].forEach(t => {
        let b = document.getElementById('k3Btn' + t.charAt(0).toUpperCase() + t.slice(1));
        let p = document.getElementById('k3Pane' + t.charAt(0).toUpperCase() + t.slice(1) + 'Hist');
        if(b) b.classList.remove('active'); if(p) p.classList.remove('active');
    });
    let actB = document.getElementById('k3Btn' + tab.charAt(0).toUpperCase() + tab.slice(1));
    let actP = document.getElementById('k3Pane' + tab.charAt(0).toUpperCase() + tab.slice(1) + 'Hist');
    if(actB) actB.classList.add('active'); if(actP) actP.classList.add('active');
    
    if(tab === 'global') renderK3HistoryTable();
    if(tab === 'chart') renderK3Chart();
    if(tab === 'mine') renderK3MyHistory();
}

// HISTORY TABLE (STRAIGHT LAYOUT + REAL DICE)
function renderK3HistoryTable() {
    let list = document.getElementById('k3HistoryList'); if(!list) return;
    let rawData = globalK3History[activeK3Tab] || []; let state = getK3State(activeK3Tab);
    let histData = rawData.filter(r => parseInt(r.period) < parseInt(state.period));
    list.innerHTML = "";
    if(histData.length === 0) { document.getElementById('k3PageIndicator').innerText = "1/1"; return; }
    
    let totalPages = Math.ceil(histData.length / 10);
    if (currentK3Page > totalPages) currentK3Page = totalPages; if (currentK3Page < 1) currentK3Page = 1;
    document.getElementById('k3PageIndicator').innerText = currentK3Page + "/" + totalPages;
    let startIndex = (currentK3Page - 1) * 10;
    
    histData.slice(startIndex, startIndex + 10).forEach(res => {
        let oeColor = res.oddEven === 'Odd' ? '#ff4757' : '#18b660'; 
        let sizeColor = res.size === 'Big' ? '#ff9800' : '#4facfe'; 
        let diceVisual = getMiniDiceHtml(res.d1||1, res.d2||1, res.d3||1);
        
        list.innerHTML += `<div class="table-row">
            <div style="flex:2; font-weight:bold;">${res.period}</div>
            <div style="flex:1; text-align:center; font-weight:900; font-size:16px;">${res.sum}</div>
            <div style="flex:1.5; display:flex; justify-content:flex-end; align-items:center; gap:5px;">
                <span style="color:${sizeColor}; font-size:11px;">${res.size}</span>
                <span style="color:${oeColor}; font-size:11px;">${res.oddEven}</span>
                ${diceVisual}
            </div>
        </div>`;
    });
}
function changeK3Page(dir) { let histData = globalK3History[activeK3Tab] || []; let totalPages = Math.ceil(histData.length / 10); currentK3Page += dir; if(currentK3Page < 1) currentK3Page = 1; if(currentK3Page > totalPages) currentK3Page = totalPages; renderK3HistoryTable(); }

// CHART TAB
function renderK3Chart() {
    let list = document.getElementById('k3ChartList'); if(!list) return;
    let rawData = globalK3History[activeK3Tab] || []; let state = getK3State(activeK3Tab);
    let histData = rawData.filter(r => parseInt(r.period) < parseInt(state.period));
    list.innerHTML = "";
    histData.slice(0, 30).forEach(res => {
        let diceVisual = getMiniDiceHtml(res.d1||1, res.d2||1, res.d3||1);
        let numTxt = res.is3Same ? '3 same numbers' : (res.isConsecutive ? '3 continuous numbers' : (res.is3Different ? '3 different numbers' : '2 same numbers'));
        list.innerHTML += `<div class="table-row">
            <div style="flex:2;">${res.period}</div>
            <div style="flex:1.5; display:flex; justify-content:center;">${diceVisual}</div>
            <div style="flex:2.5; text-align:right; font-size:11px; color:gray;">${numTxt}</div>
        </div>`;
    });
}

// MY HISTORY
function renderK3MyHistory() {
    let list = document.getElementById('k3MineList'); if(!list) return; 
    if(!currentUser || !currentUser.gameHistory) { list.innerHTML = "<p style='text-align:center; color:gray; padding:20px;'>No data</p>"; return; }
    let todayStr = new Date().toDateString(); 
    let myData = currentUser.gameHistory.filter(h => h.game && h.game.includes('K3') && h.type === activeK3Tab && new Date(h.date).toDateString() === todayStr); 
    list.innerHTML = ""; if(myData.length === 0) { list.innerHTML = "<p style='text-align:center; color:gray; padding:20px;'>No data</p>"; return; }
    
    myData.forEach(item => {
        let isPending = item.status === 'Pending'; let isRefund = item.status === 'Refunded'; let isWin = item.isWin; 
        let actualBetAmt = item.actualBet || (parseFloat(item.bet)*0.98).toFixed(2); 
        let amtText = isPending ? `₹${item.bet}` : (isRefund ? `+₹${item.bet}` : (isWin ? `+₹${item.winAmt}` : `-₹${actualBetAmt}`)); 
        let statusColor = isPending ? '#fb9337' : (isRefund ? '#0984e3' : (isWin ? '#18b660' : '#ff4757'));
        
        let choiceTxt = item.choice;
        if(choiceTxt.includes('_')) choiceTxt = choiceTxt.split('_')[0]; // Clean DB prefixes if any
        
        list.innerHTML += `<div style="background:white; margin:10px 15px; padding:15px; border-radius:10px; border:1px solid var(--border); display:flex; justify-content:space-between; align-items:center;">
            <div>
                <div style="font-weight:bold; font-size:14px; margin-bottom:5px;">${item.period}</div>
                <div style="font-size:11px; color:gray; margin-bottom:5px;">Select: <b style="color:var(--primary);">${choiceTxt}</b></div>
                <div style="font-size:10px; color:#ccc;">${item.date}</div>
            </div>
            <div style="text-align:right;">
                <div style="color:${statusColor}; font-size:12px; font-weight:bold; border:1px solid ${statusColor}; padding:2px 8px; border-radius:10px; display:inline-block; margin-bottom:5px;">${item.status}</div>
                <div style="color:${statusColor}; font-weight:bold; font-size:15px;">${amtText}</div>
            </div>
        </div>`;
    });
}

// MAIN TIMER TICK
function k3TimerTick() {
    try {
        let state = getK3State(activeK3Tab);
        let kScreen = document.getElementById('k3Screen');
        if(!kScreen || !kScreen.classList.contains('active')) return; 

        if (state.displaySec <= 5 && state.displaySec > 0 && document.visibilityState === 'visible') { playK3TickSound(); }
        
        let pEl = document.getElementById('k3Period'); if(pEl) pEl.innerText = state.period;
        
        let min = Math.floor(Math.max(0, state.displaySec) / 60); let sec = Math.max(0, state.displaySec) % 60;
        let m1 = document.getElementById('k3-min-1'); if(m1) m1.innerText = Math.floor(min / 10); 
        let m2 = document.getElementById('k3-min-2'); if(m2) m2.innerText = min % 10; 
        let s1 = document.getElementById('k3-sec-1'); if(s1) s1.innerText = Math.floor(sec / 10); 
        let s2 = document.getElementById('k3-sec-2'); if(s2) s2.innerText = sec % 10;
        
        let lockOverlay = document.getElementById('k3LockOverlay'), lockDigitSec = document.getElementById('k3LockDigitSec');
        if (state.displaySec <= 5 && state.displaySec >= 0) { 
            if(lockOverlay) lockOverlay.classList.add('active'); 
            if(lockDigitSec) { let newLock = lockDigitSec.cloneNode(true); newLock.innerText = state.displaySec; lockDigitSec.parentNode.replaceChild(newLock, lockDigitSec); }
        } else { 
            if(lockOverlay) lockOverlay.classList.remove('active'); 
        }

        if (state.isSpinTime) { if (!isK3Spinning) startK3AutoSpin(); } else { if (isK3Spinning) stopK3AutoSpin(); }
        
        if (lastK3Period !== "" && lastK3Period !== state.period) { switchK3HistPanel(activeK3HistTab); }
        lastK3Period = state.period;
        processK3PendingBets();
    } catch(e) {}
}

function startGlobalK3Timers() {
    k3TimerTick(); 
    if(k3Interval) clearInterval(k3Interval);
    k3Interval = setInterval(k3TimerTick, 1000);
}

function switchK3Tab(tab) { 
    activeK3Tab = tab; currentK3Page = 1; sessionStorage.setItem('k3Tab', tab); 
    ['1min', '3min', '5min', '10min'].forEach(t => { let el = document.getElementById('k3Tab'+t); if(el) el.classList.remove('active');}); 
    let actEl = document.getElementById('k3Tab' + tab); if(actEl) actEl.classList.add('active'); 
    startK3RealtimeSync(); 
}

// VIP BET MODAL LOGIC
function k3BetPrompt(choice, odds, colorClass) {
    let state = getK3State(activeK3Tab); if (state.displaySec === 0 || (state.displaySec <= 5 && state.displaySec > 0)) return showToast("Betting locked!");
    currentK3Bet.choice = choice; currentK3Bet.odds = odds; currentK3Bet.color = colorClass; currentK3Bet.base = 1; currentK3Bet.qty = 1; currentK3Bet.multi = 1;
    
    let btnColor = '#ff4757'; // Default Metro Cash Red accent for buttons
    if(colorClass === 'k3-green') btnColor = '#18b660'; else if(colorClass === 'k3-yellow') btnColor = '#ff9800'; else if(colorClass === 'k3-blue') btnColor = '#0984e3'; else if(colorClass === 'k3-purple') btnColor = '#d591ff';
    
    document.getElementById('k3BetModalChoice').innerText = String(choice).replace(/_/g, ' ');
    document.getElementById('k3BetModalChoice').style.background = btnColor;
    
    // Dynamically inject active style colors for this specific bet
    const styleElement = document.createElement('style'); styleElement.id = 'dynamicK3BetStyle';
    styleElement.innerHTML = `.bm-opt.active { background: ${btnColor} !important; color: white !important; box-shadow: 0 2px 5px rgba(0,0,0,0.3); } .qty-box button { background: ${btnColor} !important; } .bm-btn-confirm { background: ${btnColor} !important; }`;
    const existingStyle = document.getElementById('dynamicK3BetStyle'); if (existingStyle) existingStyle.remove(); document.head.appendChild(styleElement);
    
    updateK3BetModalUI(); 
    k3HashBeforeModal = window.location.hash; pushK3ModalState();
    let overlay = document.getElementById('k3BetModalOverlay'); if(overlay) overlay.classList.add('active');
}

function setK3BetBase(val) { currentK3Bet.base = val; updateK3BetModalUI(); } 
function setK3BetMulti(val) { currentK3Bet.multi = val; updateK3BetModalUI(); }
function changeK3BetQty(val) { let newQty = currentK3Bet.qty + val; if(newQty >= 1) currentK3Bet.qty = newQty; updateK3BetModalUI(); }
function updateK3BetModalUI() { 
    document.querySelectorAll('#k3BaseOptions .bm-opt').forEach(el => el.classList.toggle('active', parseInt(el.innerText) === currentK3Bet.base)); 
    document.querySelectorAll('#k3MultiOptions .bm-opt').forEach(el => el.classList.toggle('active', parseInt(el.innerText.replace('X','')) === currentK3Bet.multi)); 
    document.getElementById('k3BetQtyInput').value = currentK3Bet.qty; 
    let total = currentK3Bet.base * currentK3Bet.qty * currentK3Bet.multi;
    document.getElementById('btnK3ConfirmBet').innerText = `Total amount ₹${total.toFixed(2)}`; 
}
function closeK3BetModal() { let modal = document.getElementById('k3BetModalOverlay'); if(modal) modal.classList.remove('active'); if(window.location.hash === '#modalOpen') window.history.back(); }

function confirmK3Bet() {
    let totalAmt = currentK3Bet.base * currentK3Bet.qty * currentK3Bet.multi;
    if(totalAmt < 1) return showToast("Invalid amount");
    if(typeof currentUser === 'undefined' || !currentUser) return showToast("User not loaded");
    let depBal = parseFloat(currentUser.depositBal) || 0; let wthBal = parseFloat(currentUser.withdrawBal) || 0; let total = depBal + wthBal;
    if(totalAmt > total) { closeK3BetModal(); return showToast("Insufficient balance!"); }
    if(depBal >= totalAmt) { currentUser.depositBal = depBal - totalAmt; } else { let remainder = totalAmt - depBal; currentUser.depositBal = 0; currentUser.withdrawBal = wthBal - remainder; }
    currentUser.balance = currentUser.depositBal + currentUser.withdrawBal;
    
    let k3OrdId = `K3${Date.now()}`; 
    let actualBet = totalAmt * 0.98; 
    if(!currentUser.gameHistory) currentUser.gameHistory = []; let state = getK3State(activeK3Tab);
    
    currentUser.gameHistory.unshift({ id: k3OrdId, game: `K3 ${activeK3Tab}`, type: activeK3Tab, period: state.period, choice: currentK3Bet.choice, bet: totalAmt, actualBet: actualBet.toFixed(2), odds: currentK3Bet.odds, status: 'Pending', date: new Date().toLocaleString() });
    
    if(typeof db !== 'undefined') db.ref('users/' + currentUser.id).set(currentUser); 
    closeK3BetModal(); showToast("Bet success", 1200); 
    if(typeof updateBalDisplay === 'function') updateBalDisplay();
    if(activeK3HistTab === 'mine') renderK3MyHistory();
}

// 🏆 K3 WIN LOGIC (AUTO PENDING RESOLUTION)
function processK3PendingBets() {
    if(!currentUser || !currentUser.gameHistory) return; let needsUpdate = false;
    currentUser.gameHistory.forEach(b => {
        if(b.status === 'Pending' && b.game && b.game.includes('K3')) {
            let histArray = globalK3History[b.type] || []; let currentState = getK3State(b.type); let resultData = histArray.find(r => r.period === b.period);
            if(resultData && parseInt(b.period) < parseInt(currentState.period)) {
                let isWin = false; let c = String(b.choice);
                
                // 1. Total Tab
                if(c === resultData.size || c === resultData.oddEven || c == resultData.sum) isWin = true;
                
                // 2. 3 Same Tab
                if(c === 'Any 3 of the same number' && resultData.is3Same) isWin = true;
                if(c.length === 3 && resultData.is3Same && c[0] == resultData.d1) isWin = true; // e.g., '111'
                
                // 3. Different Tab
                if(c === '3 continuous numbers' && resultData.isConsecutive) isWin = true;
                if(c.startsWith('3diff_') && resultData.is3Different) { let num = c.split('_')[1]; if(resultData.d1==num || resultData.d2==num || resultData.d3==num) isWin = true; }
                if(c.startsWith('2diff_') && !resultData.is3Same) { let num = c.split('_')[1]; if(resultData.d1==num || resultData.d2==num || resultData.d3==num) isWin = true; }
                
                // 4. 2 Same Tab
                if(c.length === 2 && !c.includes('_') && (resultData.is2Same || resultData.is3Same)) { // e.g., '11'
                    let match = 0; if(resultData.d1 == c[0]) match++; if(resultData.d2 == c[0]) match++; if(resultData.d3 == c[0]) match++; if(match >= 2) isWin = true;
                }
                if(c.endsWith('_pair') && (resultData.is2Same || resultData.is3Same)) { let num = c[0]; let match = 0; if(resultData.d1 == num) match++; if(resultData.d2 == num) match++; if(resultData.d3 == num) match++; if(match >= 2) isWin = true; }
                if(c.endsWith('_unique')) { let num = c.split('_')[0]; if(resultData.d1==num || resultData.d2==num || resultData.d3==num) { if(resultData.is2Same && (resultData.d1!=num || resultData.d2!=num || resultData.d3!=num)) isWin = true; } }

                let actualBetAmt = parseFloat(b.actualBet) || (parseFloat(b.bet) * 0.98); let winAmt = isWin ? (actualBetAmt * b.odds).toFixed(2) : 0;
                if(isWin) { currentUser.withdrawBal = (parseFloat(currentUser.withdrawBal) || 0) + parseFloat(winAmt); currentUser.balance = (parseFloat(currentUser.depositBal) || 0) + currentUser.withdrawBal; }
                
                b.status = isWin ? 'Success' : 'Failed'; b.isWin = isWin; b.winAmt = winAmt; needsUpdate = true;
            } else if (!resultData && parseInt(currentState.period) > parseInt(b.period) + 1) {
                let refundAmt = parseFloat(b.bet); currentUser.depositBal = (parseFloat(currentUser.depositBal) || 0) + refundAmt; currentUser.balance = currentUser.depositBal + (parseFloat(currentUser.withdrawBal) || 0);
                b.status = 'Refunded'; b.isWin = false; b.winAmt = refundAmt; needsUpdate = true;
            }
        }
    });
    if(needsUpdate) { if(db) db.ref('users/' + currentUser.id).set(currentUser); if(typeof updateBalDisplay === 'function') updateBalDisplay(); if(activeK3HistTab === 'mine') renderK3MyHistory(); }
}

function openK3HowToPlay() { k3HashBeforeModal = window.location.hash; pushK3ModalState(); let modal = document.getElementById('k3HtpModalOverlay'); if(modal) modal.classList.add('active'); }
function closeK3HowToPlay() { let modal = document.getElementById('k3HtpModalOverlay'); if (modal) modal.classList.remove('active'); if(window.location.hash === '#modalOpen') window.history.back(); }

// BACK BUTTON INTERCEPTOR
window.addEventListener('popstate', function(e) {
    if (window.location.hash !== "#modalOpen") {
        let betModal = document.getElementById('k3BetModalOverlay');
        let htpModal = document.getElementById('k3HtpModalOverlay');
        if (betModal) betModal.classList.remove('active');
        if (htpModal) htpModal.classList.remove('active');
    }
});
document.addEventListener('DOMContentLoaded', () => { document.addEventListener('click', function(e) { let betModal = document.getElementById('k3BetModalOverlay'); if (betModal && e.target === betModal) { closeK3BetModal(); } let htpModal = document.getElementById('k3HtpModalOverlay'); if (htpModal && e.target === htpModal) { closeK3HowToPlay(); } }); });

// INITIALIZATION
renderDice('dice1', 4); renderDice('dice2', 5); renderDice('dice3', 6);
startK3RealtimeSync(); startGlobalK3Timers();
