// ==========================================
// AVIATOR FRONTEND LOGIC (game/aviator.js)
// ==========================================

var currentAvRound = null;
var avAnimFrame = null;
var isAvFlying = false;
var currentAvPhase = 0; 
var currentAvMulti = 1.00;
var avBets = {
    1: { active: false, amount: 0, cashedOut: false, queued: false, autoCash: 0, gameId: null },
    2: { active: false, amount: 0, cashedOut: false, queued: false, autoCash: 0, gameId: null }
};

var allAviatorRounds = [];
db.ref('aviator/rounds').orderByChild('endTime').on('value', snap => {
    allAviatorRounds = [];
    snap.forEach(child => { allAviatorRounds.push(child.val()); });
    renderAviatorHistoryUI(); 
});

function renderAviatorHistoryUI() {
    let tape = document.getElementById('avTopHistory');
    let grid = document.getElementById('avFullHistoryGrid');
    if(!tape || !grid) return;
    
    let now = getTrueTime();
    let pastRounds = allAviatorRounds.filter(r => (r.endTime - 3000) <= now).sort((a,b) => b.endTime - a.endTime).slice(0, 50);
    
    let html = '';
    pastRounds.forEach(r => {
        let cp = parseFloat(r.crashPoint);
        let colorClass = cp < 1.5 ? 'blue' : (cp < 5 ? 'purple' : 'pink');
        html += `<div class="av-pill ${colorClass}">${cp.toFixed(2)}x</div>`;
    });
    tape.innerHTML = html;
    grid.innerHTML = html;
}

function toggleAviatorHistory() {
    let drop = document.getElementById('avHistoryDropdown'); let icon = document.getElementById('avHistIcon');
    if(!drop || !icon) return;
    if (drop.classList.contains('active')) { drop.classList.remove('active'); icon.classList.replace('fa-chevron-up', 'fa-chevron-down'); } 
    else { drop.classList.add('active'); icon.classList.replace('fa-chevron-down', 'fa-chevron-up'); renderAviatorHistoryUI(); }
}

function switchAvTab(panel, tab) {
    document.getElementById(`p${panel}-tab-bet`).classList.remove('active'); document.getElementById(`p${panel}-tab-auto`).classList.remove('active');
    document.getElementById(`p${panel}-tab-${tab}`).classList.add('active');
    if(tab === 'auto') { document.getElementById(`p${panel}-auto-options`).classList.add('active'); } else { document.getElementById(`p${panel}-auto-options`).classList.remove('active'); }
}

function changeAvBet(panel, amt) {
    let input = document.getElementById(`avBetInput${panel}`);
    let val = parseFloat(input.value) + amt; if(val < 10) val = 10;
    input.value = val.toFixed(2); document.getElementById(`avBtnTxt${panel}`).innerText = val.toFixed(2) + " INR";
}

function setAvBet(panel, amt) {
    document.getElementById(`avBetInput${panel}`).value = amt.toFixed(2);
    document.getElementById(`avBtnTxt${panel}`).innerText = amt.toFixed(2) + " INR";
}

function handleAvBtnClick(panel) {
    if (!currentUser) return showToast("Please login first!");
    let btn = document.getElementById(`avBtn${panel}`);
    let amt = parseFloat(document.getElementById(`avBetInput${panel}`).value);
    let isAutoCashOn = document.getElementById(`p${panel}-autocash`).checked;
    let autoCashVal = parseFloat(document.querySelector(`#p${panel}-auto-options input[type="number"]`).value);

    if (!avBets[panel].active && !avBets[panel].queued) {
        let totalBal = (parseFloat(currentUser.depositBal) || 0) + (parseFloat(currentUser.withdrawBal) || 0);
        if (totalBal < amt) return showToast("Insufficient wallet balance!");

        if (currentUser.depositBal >= amt) { currentUser.depositBal -= amt; } else { let rem = amt - currentUser.depositBal; currentUser.depositBal = 0; currentUser.withdrawBal -= rem; }
        currentUser.balance = currentUser.depositBal + currentUser.withdrawBal;
        
        avBets[panel].amount = amt; avBets[panel].autoCash = isAutoCashOn ? autoCashVal : 0; avBets[panel].gameId = 'AV' + Date.now() + panel; 
        if(!currentUser.gameHistory) currentUser.gameHistory = [];
        currentUser.gameHistory.unshift({ id: avBets[panel].gameId, game: 'Aviator', bet: amt, actualBet: amt.toFixed(2), status: 'Pending', date: new Date().toLocaleString() });

        updateBalDisplay(); saveUserToDB(currentUser); 
        
        if (isAvFlying) {
            avBets[panel].queued = true; btn.className = 'av-big-btn av-btn-red';
            btn.innerHTML = `<span style="font-size:14px; font-weight:normal;">WAITING FOR NEXT</span><span>CANCEL</span>`;
        } else {
            avBets[panel].active = true; avBets[panel].cashedOut = false; btn.className = 'av-big-btn av-btn-red';
            btn.innerHTML = `<span style="font-size:14px; font-weight:normal;">BET ${amt.toFixed(2)}</span><span>CANCEL</span>`;
        }
    } 
    else if (avBets[panel].queued || (!isAvFlying && avBets[panel].active)) {
        currentUser.depositBal += avBets[panel].amount; currentUser.balance = currentUser.depositBal + currentUser.withdrawBal;
        if(currentUser.gameHistory) { let idx = currentUser.gameHistory.findIndex(g => g.id === avBets[panel].gameId); if(idx !== -1) currentUser.gameHistory.splice(idx, 1); }
        updateBalDisplay(); saveUserToDB(currentUser); 
        avBets[panel].active = false; avBets[panel].queued = false; resetSingleAvButton(panel);
    }
    else if (isAvFlying && avBets[panel].active && !avBets[panel].cashedOut) { cashoutAviator(panel, currentAvMulti); }
}

function cashoutAviator(panel, multi) {
    let winAmt = avBets[panel].amount * multi;
    currentUser.withdrawBal += winAmt; currentUser.balance = currentUser.depositBal + currentUser.withdrawBal;
    
    if(currentUser.gameHistory) { let record = currentUser.gameHistory.find(g => g.id === avBets[panel].gameId); if(record) { record.status = 'Success'; record.isWin = true; record.winAmt = winAmt.toFixed(2); } }
    avBets[panel].cashedOut = true; avBets[panel].active = false;
    let btn = document.getElementById(`avBtn${panel}`); btn.style.background = ''; btn.className = 'av-big-btn av-btn-orange';
    btn.innerHTML = `<span style="font-size:12px;">CASHED OUT</span><span>${winAmt.toFixed(2)} INR</span><span style="font-size:10px;">at ${multi.toFixed(2)}x</span>`;

    let toast = document.createElement('div');
    toast.innerHTML = `<div style="display: flex; background: #28a745; color: white; padding: 6px 15px; border-radius: 30px; align-items: center; justify-content: space-between; min-width: 220px; font-size: 13px; font-weight: bold; box-shadow: 0 4px 15px rgba(0,0,0,0.5); border: 2px solid #1e7e34;"><div style="text-align: center; border-right: 1px solid #1e7e34; padding-right: 15px;"><span style="font-size: 10px; font-weight:normal; display: block; margin-bottom: 2px;">You have cashed out!</span><span style="font-size: 16px;">${multi.toFixed(2)}x</span></div><div style="text-align: center; padding-left: 15px;"><span style="font-size: 10px; font-weight:normal; display: block; margin-bottom: 2px;">You got:</span><span style="font-size: 16px;">₹${winAmt.toFixed(2)}</span></div></div>`;
    toast.style.position = 'fixed'; toast.style.top = '80px'; toast.style.left = '50%'; toast.style.transform = 'translate(-50%, -20px)'; toast.style.zIndex = '999999'; toast.style.opacity = '0'; toast.style.pointerEvents = 'none'; toast.style.transition = 'transform 0.4s ease, opacity 0.4s ease';
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.transform = 'translate(-50%, 0)'; toast.style.opacity = '1'; }, 10);
    setTimeout(() => { toast.style.transform = 'translate(-50%, -20px)'; toast.style.opacity = '0'; setTimeout(() => toast.remove(), 400); }, 2500);
}

function resetAvButtonsForBet() { [1, 2].forEach(panel => { if (avBets[panel].queued) { avBets[panel].active = true; avBets[panel].queued = false; avBets[panel].cashedOut = false; let btn = document.getElementById(`avBtn${panel}`); btn.className = 'av-big-btn av-btn-red'; btn.innerHTML = `<span style="font-size:14px; font-weight:normal;">BET ${avBets[panel].amount.toFixed(2)}</span><span>CANCEL</span>`; } else if (!avBets[panel].active) { resetSingleAvButton(panel); let autoBetToggle = document.getElementById(`p${panel}-autobet`); if(autoBetToggle && autoBetToggle.checked) { setTimeout(() => handleAvBtnClick(panel), 100); } } }); }

function resetSingleAvButton(panel) { let btn = document.getElementById(`avBtn${panel}`); let amt = document.getElementById(`avBetInput${panel}`).value; btn.style.background = ''; btn.className = 'av-big-btn av-btn-green'; btn.innerHTML = `<span>BET</span><span style="font-size:14px; font-weight:normal;" id="avBtnTxt${panel}">${parseFloat(amt).toFixed(2)} INR</span>`; }
function lockAvBetsAndTurnToCashout() { [1, 2].forEach(panel => { let btn = document.getElementById(`avBtn${panel}`); if (avBets[panel].active && !avBets[panel].cashedOut) { btn.className = 'av-big-btn av-btn-orange'; btn.innerHTML = `<span>CASH OUT</span><span style="font-size:14px; font-weight:normal;" id="avLiveCash${panel}">0.00 INR</span>`; } }); }
function failUncashedBets() { [1, 2].forEach(panel => { if (avBets[panel].active && !avBets[panel].cashedOut) { avBets[panel].active = false; let btn = document.getElementById(`avBtn${panel}`); btn.className = 'av-big-btn'; btn.style.background = '#333'; btn.innerHTML = `<span style="font-size:16px;">LOST</span>`; setTimeout(() => { resetSingleAvButton(panel); }, 2000); } else if (avBets[panel].cashedOut) { setTimeout(() => { resetSingleAvButton(panel); }, 2000); } }); }

setInterval(() => {
    let now = getTrueTime(); let activeRound = allAviatorRounds.find(r => r.endTime > now);
    if (activeRound) { if (!currentAvRound || currentAvRound.period !== activeRound.period) { currentAvRound = activeRound; currentAvPhase = 0; } } 
    else { currentAvRound = null; fetch('/api/aviator?t=' + Date.now()).catch(e => {}); }
}, 100);

var aviatorBackgroundLoop = setInterval(() => {
    let multText = document.getElementById('avMultiplierText'); if (!multText) return; 

    // FRESH LOAD RECOVERY
    if (multText.getAttribute('data-init') !== 'true') {
        multText.setAttribute('data-init', 'true');
        if (typeof avAnimFrame !== 'undefined') cancelAnimationFrame(avAnimFrame);
        currentAvPhase = -1; // Force reset phase
        isAvFlying = false;
    }

    let avFlyAudio = document.getElementById('avFlySound'); let avCrashAudio = document.getElementById('avCrashSound');
    
    // YE LINE NAYI HAI: Check karega ki Game screen open hai ya nahi
    let isGameVisible = document.getElementById('gamePlayScreen') && document.getElementById('gamePlayScreen').classList.contains('active');

    if(!currentAvRound) { multText.innerHTML = `<span style="font-size:20px; color:#ccc;">Loading next round...</span>`; document.getElementById('avFlewText').style.display = 'none'; return; }

    let now = getTrueTime(); let flightStart = currentAvRound.flightStartTime; let crashPoint = parseFloat(currentAvRound.crashPoint);
    
    if (now < flightStart) {
        if (currentAvPhase !== 1) {
            currentAvPhase = 1; isAvFlying = false; if(avAnimFrame) cancelAnimationFrame(avAnimFrame);
            multText.style.color = "#ccc"; multText.style.fontSize = "30px"; document.getElementById('avFlewText').style.display = 'none';
            let planeEl = document.getElementById('avPlane'); planeEl.style.transition = 'none'; planeEl.style.bottom = '10px'; planeEl.style.left = '10px'; planeEl.style.opacity = '1';
            let trail = document.getElementById('avTrailPath'); if(trail) trail.setAttribute('d', '');
            resetAvButtonsForBet();
        }
        let waitTime = ((flightStart - now) / 1000).toFixed(1);
        if(waitTime > 0) { multText.innerHTML = `<img src="https://i.postimg.cc/SNZNW2H4/file-00000000c9948211b3140c9ce0ef1663.png" style="width:50px; opacity:0.5; filter:grayscale(1); display:block; margin:0 auto -10px auto;"><br><span style="font-size:14px; letter-spacing:1px; color:white;">WAITING FOR NEXT ROUND</span><br><span style="font-size:30px; color:#e5053a; font-weight:bold;">${waitTime}s</span>`; }
    } 
    else if (now >= flightStart && now < currentAvRound.endTime - 3000) {
        if (currentAvPhase !== 2) {
            currentAvPhase = 2; isAvFlying = true; multText.style.fontSize = "60px";
            lockAvBetsAndTurnToCashout(); startAviatorAnimation();
            
            // SOUND PLAY KARNE SE PEHLE CHECK KAREGA KI SCREEN VISIBLE HAI
            if(!document.hidden && isGameVisible && avFlyAudio) { avFlyAudio.currentTime = 0; avFlyAudio.play().catch(e=>{}); }
        }
    }
    else {
        if (currentAvPhase !== 3) {
            currentAvPhase = 3; isAvFlying = false; if(avAnimFrame) cancelAnimationFrame(avAnimFrame);
            multText.innerText = crashPoint.toFixed(2) + "x"; multText.style.color = "#e5053a"; document.getElementById('avFlewText').style.display = 'block'; 
            let planeEl = document.getElementById('avPlane'); planeEl.style.transition = 'left 0.7s ease-in, bottom 0.7s ease-in'; planeEl.style.left = '200%'; planeEl.style.bottom = '800px'; 
            let trail = document.getElementById('avTrailPath'); if(trail) trail.setAttribute('d', '');
            failUncashedBets(); renderAviatorHistoryUI(); 
            if(avFlyAudio) avFlyAudio.pause(); 
            
            // CRASH SOUND BHI TABHI BAJEGA JAB SCREEN VISIBLE HOGI
            if(!document.hidden && isGameVisible && avCrashAudio) { avCrashAudio.currentTime = 0; avCrashAudio.play().catch(e=>{}); }
        }
    }
}, 100);


function startAviatorAnimation() {
    if (!currentAvRound) return; // Crash hone se bachane ke liye safety check
    let flightStart = currentAvRound.flightStartTime; let crashPoint = parseFloat(currentAvRound.crashPoint); let canvasH = 220; 
    function animate() {
        if (!currentAvRound) { avAnimFrame = requestAnimationFrame(animate); return; } // Beech me data miss hone par safety check
        let now = getTrueTime(); if(now >= currentAvRound.endTime - 3000) return;

        let timeElapsed = now - flightStart; let currentMulti = Math.exp(timeElapsed / 10000); if(currentMulti > crashPoint) currentMulti = crashPoint; currentAvMulti = currentMulti; 

        let planeEl = document.getElementById('avPlane'); let trailPath = document.getElementById('avTrailPath'); let multText = document.getElementById('avMultiplierText');
        if (multText) { multText.innerText = currentMulti.toFixed(2) + "x"; multText.style.color = "#ffffff";  }

        if (planeEl && trailPath) {
            let gameW = document.getElementById('avGameCanvas').clientWidth; let maxH = 150, maxW = gameW - 65; 
            let percentX = Math.min((timeElapsed / 10000) * 65, 100); let percentY = Math.min(Math.pow(timeElapsed / 10000, 1.2) * 65, 90); let hoverY = Math.sin(timeElapsed / 200) * 4; 
            let px = 10 + (percentX/100 * maxW); let py = 10 + (percentY/100 * maxH) + hoverY;
            planeEl.style.left = px + 'px'; planeEl.style.bottom = py + 'px';
            let tiltAngle = Math.min((percentY / 100) * 12, 12); planeEl.style.transform = `rotate(${tiltAngle}deg)`;
            let pathY = canvasH - py - 20; let startY = canvasH - 20;     
            let d = `M 20 ${startY} Q ${px * 0.5} ${startY} ${px+30} ${pathY} L ${px+30} ${canvasH} L 20 ${canvasH} Z`; trailPath.setAttribute('d', d);
        }

        if(avBets[1].active && !avBets[1].cashedOut) { let cash1 = document.getElementById('avLiveCash1'); if(cash1) cash1.innerText = (avBets[1].amount * currentMulti).toFixed(2) + " INR"; }
        if(avBets[2].active && !avBets[2].cashedOut) { let cash2 = document.getElementById('avLiveCash2'); if(cash2) cash2.innerText = (avBets[2].amount * currentMulti).toFixed(2) + " INR"; }
        [1, 2].forEach(p => { if(avBets[p].active && !avBets[p].cashedOut && avBets[p].autoCash > 0 && currentMulti >= avBets[p].autoCash) cashoutAviator(p, currentMulti); });
        avAnimFrame = requestAnimationFrame(animate);
    }
    animate();
}
// ==========================================
// AVIATOR EXIT & CLEANUP LOGIC
// ==========================================

function closeGame() {
    // 1. Background Music aur Crash Sound ko turant band karna
    let flyAudio = document.getElementById('avFlySound');
    let crashAudio = document.getElementById('avCrashSound');
    if (flyAudio) { flyAudio.pause(); flyAudio.currentTime = 0; }
    if (crashAudio) { crashAudio.pause(); crashAudio.currentTime = 0; }

    // 2. Animation rokna aur phase reset karna (Loop kill nahi karna hai)
    if (typeof avAnimFrame !== 'undefined') cancelAnimationFrame(avAnimFrame);
    if (typeof currentAvPhase !== 'undefined') currentAvPhase = -1;

    // 3. Screen se bahar nikalna
    history.back();
}

// Agar user mobile ka apna Back Button (ya swipe back) use kare
window.addEventListener('popstate', function aviatorCleanup(e) {
    let flyAudio = document.getElementById('avFlySound');
    let crashAudio = document.getElementById('avCrashSound');
    
    if (flyAudio) { flyAudio.pause(); flyAudio.currentTime = 0; }
    if (crashAudio) { crashAudio.pause(); crashAudio.currentTime = 0; }
    
    if (typeof avAnimFrame !== 'undefined') cancelAnimationFrame(avAnimFrame);
    if (typeof currentAvPhase !== 'undefined') currentAvPhase = -1;
});
