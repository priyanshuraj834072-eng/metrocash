// ==================================================================
// METRO CASH - MAIN.JS (CLEAN & MODULAR)
// ==================================================================

// ------------------------------------------------------------------
// API INITIALIZATION
// ------------------------------------------------------------------
const firebaseConfig = { apiKey: "AIzaSyBmisC43blfkZS0VwuyzduEPT11mFl_Nkk", authDomain: "metro-cash-1fc92.firebaseapp.com", databaseURL: "https://metro-cash-1fc92-default-rtdb.firebaseio.com", projectId: "metro-cash-1fc92", storageBucket: "metro-cash-1fc92.firebasestorage.app", messagingSenderId: "255202003635", appId: "1:255202003635:web:030bd81838b19ad283bec6" };
if (!firebase.apps.length) { firebase.initializeApp(firebaseConfig); }
const db = firebase.database();
const auth = firebase.auth();
auth.useDeviceLanguage();

try {
    if(typeof emailjs !== 'undefined') { emailjs.init("W4lCxdp2IiHj8gGIJ"); }
} catch(e) {}

function maskId(id) {
    if(!id) return "";
    if(id.includes('@')) { let p = id.split('@'); let n = p[0]; if(n.length<=3) return n+'***@'+p[1]; return n.substring(0,3)+'***@'+p[1]; }
    else { if(id.length<10) return id.substring(0,3)+'***'+id.substring(id.length-2); return id.substring(0,3)+'****'+id.substring(id.length-3); }
}

const gameLibrary = {
    popular: [
        { title: 'Chicken Road 2', icon: 'fa-drumstick-bite', color: 'linear-gradient(135deg, #ff416c, #ff4b2b)', img: '' },
        { title: 'Money Coming II', icon: 'fa-money-bill-trend-up', color: 'linear-gradient(135deg, #11998e, #38ef7d)', img: 'https://i.postimg.cc/kgxSw5yk/file-00000000fef482118a3db6a276b0ab86.png' },
        { title: 'Super Ace', icon: 'fa-crown', color: 'linear-gradient(135deg, #f12711, #f5af19)', img: '' },
        { title: 'Aviator', icon: 'fa-plane-up', color: 'linear-gradient(135deg, #c31432, #240b36)', img: 'https://i.postimg.cc/SNZNW2H4/file-00000000c9948211b3140c9ce0ef1663.png' },
        { title: 'Cricket', icon: 'fa-baseball-bat-ball', color: 'linear-gradient(135deg, #00b09b, #96c93d)', img: '' },
        { title: 'Goal', icon: 'fa-futbol', color: 'linear-gradient(135deg, #4A00E0, #8E2DE2)', img: '' },
        { title: 'Fortune Gems 3', icon: 'fa-gem', color: 'linear-gradient(135deg, #FDC830, #F37335)', img: '' }
    ],
    original: [
        { title: 'Chicken Road', icon: 'fa-drumstick-bite', color: 'linear-gradient(135deg, #ff416c, #ff4b2b)', img: '' },
        { title: 'Mines Pro', icon: 'fa-bomb', color: 'linear-gradient(135deg, #c31432, #240b36)', img: '' },
        { title: 'Cricket', icon: 'fa-baseball-bat-ball', color: 'linear-gradient(135deg, #00b09b, #96c93d)', img: '' },
        { title: 'Aviator', icon: 'fa-plane-up', color: 'linear-gradient(135deg, #c31432, #240b36)', img: 'https://i.postimg.cc/SNZNW2H4/file-00000000c9948211b3140c9ce0ef1663.png' },
        { title: 'Goal', icon: 'fa-futbol', color: 'linear-gradient(135deg, #18b660, #96c93d)', img: '' },
        { title: 'Boom Mines', icon: 'fa-bomb', color: 'linear-gradient(135deg, #00C9FF, #92FE9D)', img: '' }
    ]
};

window.addEventListener('load', () => { 
    let urlParams = new URLSearchParams(window.location.search); 
    let inviteCode = urlParams.get('invite'); 
    if (inviteCode) { 
        sessionStorage.setItem('pendingInvite', inviteCode); 
        let regInput = document.getElementById('regInvite');
        if (regInput) regInput.value = inviteCode;
        window.history.replaceState({}, document.title, window.location.pathname); 
    } else {
        let savedInvite = sessionStorage.getItem('pendingInvite');
        let regInput = document.getElementById('regInvite');
        if (savedInvite && regInput) regInput.value = savedInvite;
    }
});

function showToast(msg, duration = 3000) { const container = document.getElementById('toastContainer'); if(!container) return; const toast = document.createElement('div'); toast.className = 'custom-toast'; toast.innerText = msg; toast.style.setProperty('--duration', duration + 'ms'); container.appendChild(toast); setTimeout(() => { if(toast.parentElement) toast.remove(); }, duration); }

function openNotifications() { 
    let list = document.getElementById('notificationList');
    list.innerHTML = ""; 
    if (!currentUser || !currentUser.notifications || currentUser.notifications.length === 0) {
        list.innerHTML = "<p style='text-align:center; color:gray; padding:20px;'>No new notifications.</p>";
    } else {
        let needsUpdate = false;
        currentUser.notifications.forEach(n => {
            let bg = n.read ? "white" : "#f4f8ff"; 
            let border = n.read ? "var(--border)" : "#a8c0ff";
            list.innerHTML += `<div style="background:${bg}; padding:15px; border-radius:10px; margin-bottom:12px; border:1px solid ${border}; box-shadow:0 2px 5px rgba(0,0,0,0.03);"><h4 style="margin-bottom:5px; color:var(--primary); font-size:16px;">${n.title}</h4><p style="font-size:13px; color:var(--text); margin-bottom:8px; line-height:1.4;">${n.msg}</p><small style="color:gray; font-size:11px;"><i class="fa-regular fa-clock"></i> ${n.date}</small></div>`;
            if (!n.read) { n.read = true; needsUpdate = true; }
        });
        if (needsUpdate) { saveUserToDB(currentUser); updateMailBadge(); }
    }
    pushNav('notificationScreen'); 
}

let serverTimeOffset = 0; db.ref('.info/serverTimeOffset').on('value', snap => { serverTimeOffset = snap.val() || 0; });
function getTrueTime() { return Date.now() + serverTimeOffset; }

let usersDB = {}; let pendingDeps = []; let pendingWth = []; let currentUser = null; let isFirstLoad = true;
let globalPaymentSettings = { upi: "merchant@upi", qrUrl: "", apiKey: "" }; let globalGiftCodes = {};

db.ref('users').on('value', (snap) => {
    usersDB = snap.val() || {};
    if(isFirstLoad) { 
        isFirstLoad = false; 
        let storedId = sessionStorage.getItem('metroCurrentUserId') || localStorage.getItem('metroCurrentUserId'); 
        if(storedId && usersDB[storedId]) { 
            currentUser = usersDB[storedId]; 
            initAppUI(); 
        } else { 
            pushNav('loginScreen'); 
        } 
    } 
    else if (currentUser && usersDB[currentUser.id]) { 
        currentUser = usersDB[currentUser.id]; 
        updateBalDisplay(); updateMailBadge(); 
        if(document.getElementById('referApp').style.display === 'block') renderReferrals(); 
        let subScreen = document.getElementById('subordinateScreen');
        if(subScreen && subScreen.classList.contains('active')) renderSubordinateData();
    }
    let adScreen = document.getElementById('adminScreen');
    if (adScreen && adScreen.classList.contains('active')) renderAdminUsers();
}, (error) => {
    if (isFirstLoad) { isFirstLoad = false; pushNav('loginScreen'); }
});

db.ref('admin/paymentSettings').on('value', snap => {
    if(snap.val()) {
        globalPaymentSettings = snap.val();
        if(document.getElementById('adminSetupUpi')) document.getElementById('adminSetupUpi').value = globalPaymentSettings.upi || "";
        if(document.getElementById('adminSetupQr')) document.getElementById('adminSetupQr').value = globalPaymentSettings.qrUrl || "";
        if(document.getElementById('adminSetupApiKey')) document.getElementById('adminSetupApiKey').value = globalPaymentSettings.apiKey || "";
        updateDepositScreenUI();
    }
});

db.ref('deposits').on('value', (snap) => { let data = snap.val() || {}; pendingDeps = Object.keys(data).map(k => ({ dbKey: k, ...data[k] })); let adScreen = document.getElementById('adminScreen'); if (adScreen && adScreen.classList.contains('active')) renderAdminLists(); });
db.ref('withdrawals').on('value', (snap) => { let data = snap.val() || {}; pendingWth = Object.keys(data).map(k => ({ dbKey: k, ...data[k] })); let adScreen = document.getElementById('adminScreen'); if (adScreen && adScreen.classList.contains('active')) renderAdminLists(); });
db.ref('giftCodes').on('value', (snap) => { globalGiftCodes = snap.val() || {}; let adScreen = document.getElementById('adminScreen'); if (adScreen && adScreen.classList.contains('active')) renderAdminGiftCodes(); });

function saveUserToDB(userObj) { db.ref('users/' + userObj.id).set(userObj); }

function updateBalDisplay() {
    if(!currentUser) return;
    if(currentUser.depositBal === undefined) currentUser.depositBal = parseFloat(currentUser.balance) || 0;
    if(currentUser.withdrawBal === undefined) currentUser.withdrawBal = 0;
    
    let depBal = parseFloat(currentUser.depositBal) || 0; 
    let wthBal = parseFloat(currentUser.withdrawBal) || 0; 
    let totalBal = depBal + wthBal;
    currentUser.balance = totalBal;

    if (document.getElementById('homeBal')) document.getElementById('homeBal').innerText = totalBal.toFixed(2); 
    if (document.getElementById('accBal')) document.getElementById('accBal').innerText = totalBal.toFixed(2); 
    if (document.getElementById('wingoBal')) document.getElementById('wingoBal').innerText = totalBal.toFixed(2);
    if (document.getElementById('avWalletBal')) document.getElementById('avWalletBal').innerText = totalBal.toFixed(2);
    
    if (document.getElementById('wallTotalBal')) {

        document.getElementById('wallTotalBal').innerText = totalBal.toFixed(2);
        document.getElementById('wallDepBal').innerText = depBal.toFixed(2);
        document.getElementById('wallWthBal').innerText = wthBal.toFixed(2);
        let depPer = totalBal > 0 ? (depBal / totalBal) * 100 : 0; 
        let wthPer = totalBal > 0 ? (wthBal / totalBal) * 100 : 0;
        if(document.getElementById('wallDepPercent')) document.getElementById('wallDepPercent').innerText = depPer.toFixed(0) + "%"; 
        if(document.getElementById('wallWthPercent')) document.getElementById('wallWthPercent').innerText = wthPer.toFixed(0) + "%";
    }
    if (document.getElementById('wthBalDisplay')) { 
        document.getElementById('wthBalDisplay').innerText = wthBal.toFixed(2); 
    }
    updateWithdrawUI();
}

function forceBalanceRefresh() { let icons = document.querySelectorAll('.fa-rotate-right'); icons.forEach(i => i.classList.add('fa-spin-fast')); if(currentUser) { db.ref('users/' + currentUser.id).once('value').then(snap => { let u = snap.val(); if(u) { currentUser = u; updateBalDisplay(); showToast("Balance refreshed!"); } setTimeout(() => icons.forEach(i => i.classList.remove('fa-spin-fast')), 600); }); } else { setTimeout(() => icons.forEach(i => i.classList.remove('fa-spin-fast')), 600); } }
function updateMailBadge() { if(!currentUser) return; let unreadCount = (currentUser.notifications || []).filter(n => !n.read).length; let badge = document.getElementById('mailBadge'), accBadge = document.getElementById('accNotiBadge'); if(unreadCount > 0) { if(badge) { badge.style.display = 'block'; badge.innerText = unreadCount; } if(accBadge) { accBadge.style.display = 'block'; accBadge.innerText = unreadCount; } } else { if(badge) badge.style.display = 'none'; if(accBadge) accBadge.style.display = 'none'; } }

function initAppUI() {
    document.getElementById('mainBottomNav').style.display = 'flex'; updateBalDisplay(); updateMailBadge(); 
    document.getElementById('displayInviteCode').innerText = currentUser.uid || '00000000'; document.getElementById('accUid').innerText = currentUser.uid || '00000000';
    let userDisplay = currentUser.id || 'User'; if(currentUser.id === '9142816706') { userDisplay += ` <span onclick="openAdminAuth()" style="background:#ff4757; color:white; font-size:10px; padding:3px 8px; border-radius:12px; vertical-align:middle; cursor:pointer; margin-left:8px;"><i class="fa-solid fa-shield-halved"></i> Admin</span>`; }
    document.getElementById('accUser').innerHTML = userDisplay; renderReferrals(); renderHomePreviews(); updateDepositScreenUI();
    
    let savedScreen = sessionStorage.getItem('activeScreen') || 'appScreens'; 
    let savedAppTab = sessionStorage.getItem('activeAppTab') || 'homeApp';
    
    if (savedScreen === 'gamePlayScreen') {
        let gTitle = sessionStorage.getItem('savedGameTitle');
        let gUrl = sessionStorage.getItem('savedGameUrl');
        let gJs = sessionStorage.getItem('savedGameJs');
        
        if (gTitle && gUrl) {
            openGame(gTitle, gUrl, gJs);
        } else {
            pushNav('appScreens', 'homeApp');
        }
    } else {
        if(savedScreen === 'appScreens') pushNav('appScreens', savedAppTab); else pushNav(savedScreen);
    }
}

function renderHomePreviews() {
    let pContainer = document.getElementById('homePopularPreview'); pContainer.innerHTML = '';
    gameLibrary.popular.slice(0, 6).forEach(g => { 
        let imgHtml = g.isAviator ? `<div style="width:100%; height:100%; background: radial-gradient(circle at center, #222 0%, #000 100%); display:flex; flex-direction:column; align-items:center; justify-content:center; position:relative; overflow:hidden;"><i class="fa-solid fa-plane" style="color:#ff2a2a; font-size:35px; transform: rotate(-45deg); filter: drop-shadow(0 0 10px #ff2a2a); margin-bottom:5px; z-index:5;"></i><span style="color:#ff2a2a; font-family:'Arial', sans-serif; font-weight:900; font-size:12px; text-transform:uppercase; font-style:italic; letter-spacing:1px; text-shadow:0 0 10px #ff2a2a; z-index:5;">Aviator</span><div style="position:absolute; bottom:15%; width:50%; height:2px; background:#ff2a2a; box-shadow:0 0 10px #ff2a2a; z-index:2;"></div></div>` : (g.img ? `<img src="${g.img}" alt="${g.title}">` : `<i class="fa-solid ${g.icon}"></i>`); 
        let clickAction = g.title === 'Aviator' ? `openGame('Aviator', '/game/aviator.html', '/gamejs/aviator.js')` : `showToast('Coming soon!')`;

        pContainer.innerHTML += `<div class="sq-card" onclick="${clickAction}"><div class="sq-img-placeholder" style="background:${g.color}; padding:0;">${imgHtml}</div><div class="title">${g.title}</div></div>`; 
    });
    
    let oContainer = document.getElementById('homeOriginalPreview');
    if(oContainer) {
        oContainer.innerHTML = '';
        gameLibrary.original.slice(0, 6).forEach(g => { 
            let imgHtml = g.isAviator ? `<div style="width:100%; height:100%; background: radial-gradient(circle at center, #222 0%, #000 100%); display:flex; flex-direction:column; align-items:center; justify-content:center; position:relative; overflow:hidden;"><i class="fa-solid fa-plane" style="color:#ff2a2a; font-size:35px; transform: rotate(-45deg); filter: drop-shadow(0 0 10px #ff2a2a); margin-bottom:5px; z-index:5;"></i><span style="color:#ff2a2a; font-family:'Arial', sans-serif; font-weight:900; font-size:12px; text-transform:uppercase; font-style:italic; letter-spacing:1px; text-shadow:0 0 10px #ff2a2a; z-index:5;">Aviator</span><div style="position:absolute; bottom:15%; width:50%; height:2px; background:#ff2a2a; box-shadow:0 0 10px #ff2a2a; z-index:2;"></div></div>` : (g.img ? `<img src="${g.img}" alt="${g.title}">` : `<i class="fa-solid ${g.icon}"></i>`); 
            let clickAction = g.title === 'Aviator' ? `openGame('Aviator', '/game/aviator.html', '/gamejs/aviator.js')` : `showToast('Coming soon!')`;

            oContainer.innerHTML += `<div class="sq-card" onclick="${clickAction}"><div class="sq-img-placeholder" style="background:${g.color}; padding:0;">${imgHtml}</div><div class="title">${g.title}</div></div>`; 
        });
    }
}

function showGlobalLoader(ms = 0) { let l = document.getElementById('globalLoader'); if(l) { l.style.display = 'flex'; if(ms > 0) setTimeout(() => l.style.display = 'none', ms); } }
function hideGlobalLoader() { let l = document.getElementById('globalLoader'); if(l) l.style.display = 'none'; }

function pushNav(screenId, tabId = null) { showGlobalLoader(350); window.scrollTo(0,0); try { history.pushState({ screen: screenId, tab: tabId }, "", "#" + (tabId || screenId)); } catch(e){} renderNav(screenId, tabId); }

function renderNav(screenId, tabId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    
    if(screenId === 'appScreens' && tabId) {
        let appScreen = document.getElementById('appScreens');
        if(appScreen) appScreen.classList.add('active');

        document.querySelectorAll('.app-tab-pane').forEach(p => p.style.display = 'none');
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

        let targetTab = document.getElementById(tabId);
        if(targetTab) { targetTab.style.display = 'block'; } else { document.getElementById('homeApp').style.display = 'block'; }

        if(tabId === 'homeApp' && document.getElementById('navHome')) document.getElementById('navHome').classList.add('active');
        if(tabId === 'referApp' && document.getElementById('navRefer')) document.getElementById('navRefer').classList.add('active');
        if(tabId === 'accountApp' && document.getElementById('navAcc')) document.getElementById('navAcc').classList.add('active');

        sessionStorage.setItem('activeAppTab', tabId);
        sessionStorage.setItem('activeScreen', 'appScreens');
    } else {
        let el = document.getElementById(screenId);
        if(el) el.classList.add('active');
        else document.getElementById('loginScreen').classList.add('active');

        if(screenId === 'allGamesScreen' && tabId) { switchAllGamesTab(tabId); }
    }
    
    updateBalDisplay(); 
    sessionStorage.setItem('activeScreen', screenId);
}

window.addEventListener('popstate', function(e) { window.scrollTo(0,0); if(e.state && e.state.screen) renderNav(e.state.screen, e.state.tab); else if(currentUser) renderNav('appScreens', 'homeApp'); else renderNav('loginScreen'); });
function switchTab(tabId) { pushNav('appScreens', tabId); }

let authMode = 'phone';
function setAuthMode(mode) { 
    authMode = mode; document.getElementById('tabPhone').classList.remove('active'); document.getElementById('tabEmail').classList.remove('active'); 
    let lbl = document.getElementById('lblUsername'), input = document.getElementById('logUsername'), phoneBlock = document.getElementById('phoneRowBlock'); 
    if(mode === 'phone') { document.getElementById('tabPhone').classList.add('active'); lbl.innerHTML = '<i class="fa-solid fa-mobile-screen"></i> Phone number'; input.placeholder = "Enter phone number"; input.type = "number"; phoneBlock.style.display = "flex"; phoneBlock.classList.replace('input-box-wrapper', 'phone-input-row'); document.querySelector('.country-code').style.display = "flex"; } 
    else { document.getElementById('tabEmail').classList.add('active'); lbl.innerHTML = '<i class="fa-solid fa-envelope"></i> Email login'; input.placeholder = "Enter email address"; input.type = "email"; phoneBlock.classList.replace('phone-input-row', 'input-box-wrapper'); document.querySelector('.country-code').style.display = "none"; } 
}
function togglePass(inId, icId) { let i=document.getElementById(inId), c=document.getElementById(icId); if(i.type==="password"){ i.type="text"; c.classList.replace('fa-eye-slash','fa-eye'); c.style.color="var(--primary)"; } else { i.type="password"; c.classList.replace('fa-eye','fa-eye-slash'); c.style.color="var(--text-muted)"; } }

function doRegister(btn) { 
    let rawInput = document.getElementById('regId').value.trim().toLowerCase();
    let id = rawInput.replace(/\./g, ','); 
    let p1 = document.getElementById('regPass').value; 
    let p2 = document.getElementById('regPassConf').value; 
    let inv = document.getElementById('regInvite').value.trim(); 
    
    let isPhone = /^\d{10}$/.test(rawInput); let isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawInput);
    if(!isPhone && !isEmail) return showToast("Please enter a valid 10-digit Number or Email!");
    if(p1.length < 4) return showToast("Password must be at least 4 chars.");
    if(p1 !== p2) return showToast("Passwords do not match"); 
    if(usersDB[id]) return showToast("Account already exists with this Number/Email!"); 
    
    btn.classList.add('btn-loading'); 
    let authEmail = rawInput.includes('@') ? rawInput : rawInput + "@metrocash.com";

    auth.createUserWithEmailAndPassword(authEmail, p1).then((cred) => {
        let newUid = Math.floor(10000000 + Math.random() * 90000000).toString(); 
        if(inv) { 
            for(let key in usersDB) { 
                if(usersDB[key].uid === inv) { 
                    let refUser = usersDB[key]; if(!refUser.referrals) refUser.referrals = []; 
                    refUser.referrals.push({ id: id, date: new Date().toLocaleDateString() }); 
                    db.ref('users/' + refUser.id).set(refUser); break; 
                } 
            } 
        } 
        let bonusAmount = 25.0;
        let newUser = { id: id, password: p1, uid: newUid, authUid: cred.user.uid, balance: bonusAmount, depositBal: bonusAmount, withdrawBal: 0.0, txHistory: [{ type: 'Registration Bonus', amount: bonusAmount, status: 'Success', date: new Date().toLocaleString() }], gameHistory: [], referrals: [], notifications: [] };
        db.ref('users/' + id).set(newUser).then(() => { sessionStorage.removeItem('pendingInvite'); btn.classList.remove('btn-loading'); showToast(`Registered successfully! Bonus Added!`); history.back(); });
    }).catch((error) => { btn.classList.remove('btn-loading'); if(error.code === 'auth/email-already-in-use') showToast("Number already registered!"); else showToast(error.message); });
}

function doLogin(btn) { 
    let rawInput = document.getElementById('logUsername').value.trim().toLowerCase(); 
    let id = rawInput.replace(/\./g, ','); 
    let pass = document.getElementById('logPass').value; 
    let isPhone = /^\d{10}$/.test(rawInput); let isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawInput);
    if(authMode === 'phone' && !isPhone) return showToast("Please enter a valid 10-digit Phone Number!");
    if(authMode === 'email' && !isEmail) return showToast("Please enter a valid Email Address!");
    if(!pass) return showToast("Please enter Password!");

    btn.classList.add('btn-loading'); showGlobalLoader(); 
    let authEmail = rawInput.includes('@') ? rawInput : rawInput + "@metrocash.com";

    auth.signInWithEmailAndPassword(authEmail, pass).then((cred) => { finalizeLogin(id, btn); }).catch((error) => {
        if(error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
            db.ref('users/' + id).once('value').then(snap => {
                let oldUser = snap.val();
                if(oldUser && oldUser.password === pass) {
                    auth.createUserWithEmailAndPassword(authEmail, pass).then(cred => { oldUser.authUid = cred.user.uid; db.ref('users/' + id).set(oldUser).then(() => { finalizeLogin(id, btn); }); }).catch(e => { btn.classList.remove('btn-loading'); hideGlobalLoader(); showToast("Migration Error!"); });
                } else { btn.classList.remove('btn-loading'); hideGlobalLoader(); showToast("Wrong Number or Password!"); }
            });
        } else { btn.classList.remove('btn-loading'); hideGlobalLoader(); showToast(error.message); }
    });
}

function finalizeLogin(id, btn) {
    db.ref('users/' + id).once('value').then((snap) => {
        let userData = snap.val();
        if(userData) {
            currentUser = userData; currentUser.balance = parseFloat(currentUser.balance) || 0;
            if(!currentUser.referrals) currentUser.referrals = []; if(!currentUser.txHistory) currentUser.txHistory = []; if(!currentUser.gameHistory) currentUser.gameHistory = []; 
            localStorage.setItem('metroCurrentUserId', id); sessionStorage.setItem('metroCurrentUserId', id);
            sessionStorage.setItem('activeScreen', 'appScreens'); sessionStorage.setItem('activeAppTab', 'homeApp');
            initAppUI(); btn.classList.remove('btn-loading'); hideGlobalLoader(); showToast("Login Successful!");
        } else { btn.classList.remove('btn-loading'); hideGlobalLoader(); showToast("Data error!"); }
    });
}

function doLogout() { currentUser = null; localStorage.removeItem('metroCurrentUserId'); sessionStorage.clear(); document.getElementById('logUsername').value = ''; document.getElementById('logPass').value = ''; document.getElementById('mainBottomNav').style.display = 'none'; showToast("Logged Out"); pushNav('loginScreen'); }
function copyInviteLink() { let link = "https://metrocash.vercel.app/?invite=" + currentUser.uid; navigator.clipboard.writeText(link).then(() => { showToast("Invite Link Copied!"); }); }
function copyInviteCodeOnly() { navigator.clipboard.writeText(currentUser.uid).then(() => { showToast("Invite Code Copied!"); }); }

function renderReferrals() { 
    if(!currentUser) return; let directRefs = currentUser.referrals || [];
    let d_reg=0, d_depNum=0, d_depAmt=0, d_firstNum=0; let t_reg=0, t_depNum=0, t_depAmt=0, t_firstNum=0;
    d_reg = directRefs.length;
    directRefs.forEach(r => {
        let u = usersDB ? usersDB[r.id] : null;
        if(u) {
            if(u.txHistory) { let deps = u.txHistory.filter(t => t.type === 'Deposit' && (t.status === 'Success' || t.status === 'Approved')); if(deps.length > 0) { d_depNum++; d_firstNum++; deps.forEach(d => { d_depAmt += parseFloat(d.amount) || 0; }); } }
            if(u.referrals && u.referrals.length > 0) {
                t_reg += u.referrals.length;
                u.referrals.forEach(subRef => {
                    let subU = usersDB[subRef.id];
                    if(subU && subU.txHistory) { let subDeps = subU.txHistory.filter(t => t.type === 'Deposit' && (t.status === 'Success' || t.status === 'Approved')); if(subDeps.length > 0) { t_depNum++; t_firstNum++; subDeps.forEach(d => { t_depAmt += parseFloat(d.amount) || 0; }); } }
                });
            }
        }
    });
    document.getElementById('promoDirectSub') && (document.getElementById('promoDirectSub').innerText = d_reg); document.getElementById('promoTeamSub') && (document.getElementById('promoTeamSub').innerText = t_reg);
    document.getElementById('refTopDirectReg') && (document.getElementById('refTopDirectReg').innerText = d_reg); document.getElementById('refTopDirectDepNum') && (document.getElementById('refTopDirectDepNum').innerText = d_depNum); document.getElementById('refTopDirectDepAmt') && (document.getElementById('refTopDirectDepAmt').innerText = d_depAmt.toFixed(2)); document.getElementById('refTopDirectFirst') && (document.getElementById('refTopDirectFirst').innerText = d_firstNum);
    document.getElementById('refTopTeamReg') && (document.getElementById('refTopTeamReg').innerText = t_reg); document.getElementById('refTopTeamDepNum') && (document.getElementById('refTopTeamDepNum').innerText = t_depNum); document.getElementById('refTopTeamDepAmt') && (document.getElementById('refTopTeamDepAmt').innerText = t_depAmt.toFixed(2)); document.getElementById('refTopTeamFirst') && (document.getElementById('refTopTeamFirst').innerText = t_firstNum);
}

function renderSubordinateData() {
    let container = document.getElementById('subordinateDataContainer'); let search = (document.getElementById('subSearchInput')?.value || "").trim().toLowerCase();
    if(!container || !currentUser) return; container.innerHTML = ""; let refs = currentUser.referrals || [];
    let s_depNum=0, s_depAmt=0, s_betNum=0, s_betAmt=0, s_firstNum=0, s_firstAmt=0; let html = "";
    refs.forEach(r => {
        let u = usersDB ? usersDB[r.id] : null; let masked = maskId(r.id); let uidStr = u ? (u.uid || masked) : masked; 
        if(search !== "" && !uidStr.toLowerCase().includes(search) && !r.id.toLowerCase().includes(search)) return;
        let uDepAmt=0; let uBetAmt=0; let uCom=0;
        if(u) {
            if(u.txHistory) { let deps = u.txHistory.filter(t => t.type === 'Deposit' && (t.status === 'Success' || t.status === 'Approved')); if(deps.length > 0) { s_depNum++; s_firstNum++; s_firstAmt += parseFloat(deps[deps.length-1].amount) || 0; deps.forEach(d => { uDepAmt += parseFloat(d.amount) || 0; }); } }
            if(u.gameHistory) { let bets = u.gameHistory.filter(g => g.actualBet); if(bets.length > 0) { s_betNum++; bets.forEach(b => { uBetAmt += parseFloat(b.actualBet) || 0; }); } }
            uCom = uBetAmt * 0.01; 
        }
        s_depAmt += uDepAmt; s_betAmt += uBetAmt;
        html += `<div style="background:white; border-radius:10px; margin-bottom:15px; padding:15px; box-shadow:0 3px 10px rgba(0,0,0,0.05); border:1px solid var(--border);"><div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--border); padding-bottom:10px; margin-bottom:10px;"><div style="font-weight:bold; font-size:15px; color:var(--text);">UID:${uidStr} <i class="fa-regular fa-copy" style="color:gray; font-size:14px; margin-left:5px; cursor:pointer;" onclick="navigator.clipboard.writeText('${uidStr}'); showToast('UID Copied!');"></i></div></div><div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:13px; color:var(--text-muted);"><span>Level</span><span style="color:var(--text); font-weight:bold;">1</span></div><div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:13px; color:var(--text-muted);"><span>Deposit amount</span><span style="color:#f39c12; font-weight:bold;">${uDepAmt.toFixed(2)}</span></div><div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:13px; color:var(--text-muted);"><span>Bet amount</span><span style="color:#f39c12; font-weight:bold;">${uBetAmt.toFixed(2)}</span></div><div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:13px; color:var(--text-muted);"><span>Commission (1%)</span><span style="color:#18b660; font-weight:bold;">${uCom.toFixed(2)}</span></div><div style="display:flex; justify-content:space-between; font-size:13px; color:var(--text-muted);"><span>Time</span><span style="color:var(--text);">${r.date}</span></div></div>`;
    });
    if(html === "") container.innerHTML = "<p style='text-align:center; color:gray; padding:20px; font-weight:bold;'>No Subordinate found.</p>"; else container.innerHTML = html;
    if(search === "") {
        document.getElementById('subStatDepNum') && (document.getElementById('subStatDepNum').innerText = s_depNum); document.getElementById('subStatDepAmt') && (document.getElementById('subStatDepAmt').innerText = s_depAmt.toFixed(2)); document.getElementById('subStatBetNum') && (document.getElementById('subStatBetNum').innerText = s_betNum); document.getElementById('subStatBetAmt') && (document.getElementById('subStatBetAmt').innerText = s_betAmt.toFixed(2)); document.getElementById('subStatFirstDepNum') && (document.getElementById('subStatFirstDepNum').innerText = s_firstNum); document.getElementById('subStatFirstDepAmt') && (document.getElementById('subStatFirstDepAmt').innerText = s_firstAmt.toFixed(2));
        document.getElementById('promoTotalCom') && (document.getElementById('promoTotalCom').innerText = (s_betAmt * 0.01).toFixed(2)); document.getElementById('promoWeekCom') && (document.getElementById('promoWeekCom').innerText = (s_betAmt * 0.01).toFixed(2));
    }
}

function openSubordinatePage() { pushNav('subordinateScreen'); renderSubordinateData(); }

function openChangePassword() { document.getElementById('chgOldPass').value = ''; document.getElementById('chgNewPass').value = ''; document.getElementById('chgConfPass').value = ''; document.getElementById('changePassOverlay').classList.add('active'); }
function closeChangePassword() { document.getElementById('changePassOverlay').classList.remove('active'); }
function submitChangePassword() {
    let oldP = document.getElementById('chgOldPass').value; let newP = document.getElementById('chgNewPass').value; let confP = document.getElementById('chgConfPass').value;
    if(!oldP || !newP || !confP) return showToast("All fields are required!");
    if(oldP !== currentUser.password) return showToast("Incorrect old password!");
    if(newP.length < 4) return showToast("New password must be at least 4 characters!");
    if(newP !== confP) return showToast("New passwords do not match!");
    currentUser.password = newP; saveUserToDB(currentUser); showToast("Password updated successfully!"); closeChangePassword();
}

function addTxRecord(type, amt, status, utr = null) {
    if(!currentUser.txHistory) currentUser.txHistory = [];
    let prefix = type === 'Deposit' ? 'D' : (type === 'Withdraw' ? 'W' : 'T');
    let ordId = prefix + Date.now() + Math.floor(1000 + Math.random() * 9000);
    currentUser.txHistory.unshift({ type: type, amount: amt, status: status, utr: utr, orderId: ordId, date: new Date().toLocaleString() });
    saveUserToDB(currentUser);
}

let forgotAuthType = ""; let generatedForgotEmailOtp = ""; window.confirmationResult = null;
function sendForgotOtp(btn) {
    let rawId = document.getElementById('forgotId').value.trim().toLowerCase(); let p1 = document.getElementById('forgotPass').value; let p2 = document.getElementById('forgotPassConf').value;
    if (rawId.length < 5) return showToast("Enter a valid Email or Number."); if (p1.length < 4) return showToast("Password must be at least 4 characters."); if (p1 !== p2) return showToast("Passwords do not match!");
    let dbKey = rawId.replace(/\./g, ','); if (!usersDB[dbKey]) return showToast("Account not found!");
    btn.classList.add('btn-loading');
    if (rawId.includes('@')) {
        forgotAuthType = 'email'; generatedForgotEmailOtp = Math.floor(100000 + Math.random() * 900000).toString();
        emailjs.send('service_ehmighi', 'template_qal4o7p', { to_email: rawId, otp: generatedForgotEmailOtp }).then(function(response) { btn.classList.remove('btn-loading'); showToast("OTP Sent to Email!"); btn.innerText = "Sent"; btn.disabled = true; btn.style.opacity = "0.7"; setTimeout(() => { btn.innerText = "Get Code"; btn.disabled = false; btn.style.opacity = "1"; }, 60000); }, function(error) { btn.classList.remove('btn-loading'); showToast("Failed to send OTP to Email."); });
    } else {
        forgotAuthType = 'phone'; let phoneStr = rawId; if(phoneStr.length === 10) phoneStr = "+91" + phoneStr;
        if (!window.recaptchaVerifier) { window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container-forgot', { 'size': 'invisible' }); }
        auth.signInWithPhoneNumber(phoneStr, window.recaptchaVerifier).then((confRes) => { window.confirmationResult = confRes; btn.classList.remove('btn-loading'); showToast("OTP Sent to Phone!"); btn.innerText = "Sent"; btn.disabled = true; btn.style.opacity = "0.7"; setTimeout(() => { btn.innerText = "Get Code"; btn.disabled = false; btn.style.opacity = "1"; }, 60000); }).catch((error) => { btn.classList.remove('btn-loading'); showToast("Failed to send SMS."); if (window.recaptchaVerifier) { window.recaptchaVerifier.render().then(function(widgetId) { grecaptcha.reset(widgetId); }); } });
    }
}

function verifyAndResetPassword(btn) {
    let rawId = document.getElementById('forgotId').value.trim().toLowerCase(); let dbKey = rawId.replace(/\./g, ','); let p1 = document.getElementById('forgotPass').value; let otp = document.getElementById('forgotOtp').value.trim();
    if (otp.length < 4) return showToast("Enter a valid verification code."); btn.classList.add('btn-loading');
    if (forgotAuthType === 'email') {
        if (generatedForgotEmailOtp === "") { btn.classList.remove('btn-loading'); return showToast("Please Request OTP first."); }
        if (otp === generatedForgotEmailOtp) { finalizePasswordReset(dbKey, p1, btn); } else { btn.classList.remove('btn-loading'); showToast("Invalid Email OTP!"); }
    } else if (forgotAuthType === 'phone') {
        if (!window.confirmationResult) { btn.classList.remove('btn-loading'); return showToast("Please Request OTP first."); }
        window.confirmationResult.confirm(otp).then((result) => { finalizePasswordReset(dbKey, p1, btn); }).catch((error) => { btn.classList.remove('btn-loading'); showToast("Invalid Phone OTP!"); });
    } else { btn.classList.remove('btn-loading'); showToast("Please Request OTP first."); }
}

function finalizePasswordReset(dbKey, newPass, btn) {
    if (usersDB[dbKey]) {
        usersDB[dbKey].password = newPass; saveUserToDB(usersDB[dbKey]); btn.classList.remove('btn-loading'); showToast("Password Reset Successfully!");
        setTimeout(() => { document.getElementById('forgotId').value = ''; document.getElementById('forgotPass').value = ''; document.getElementById('forgotPassConf').value = ''; document.getElementById('forgotOtp').value = ''; generatedForgotEmailOtp = ""; forgotAuthType = ""; let otpBtn = document.getElementById('btnGetForgotOtp'); otpBtn.innerText = "Get Code"; otpBtn.disabled = false; otpBtn.style.opacity = "1"; history.back(); }, 1200);
    }
}

function updateDepositScreenUI() {
    let qrImg = document.getElementById('depositQrImg'); let upiTxt = document.getElementById('depositUpiText');
    if(upiTxt) upiTxt.innerText = globalPaymentSettings.upi || "Not configured";
    if(qrImg) { if(globalPaymentSettings.qrUrl) qrImg.src = globalPaymentSettings.qrUrl; else if(globalPaymentSettings.upi) qrImg.src = `https://fampay.rulebreaker.cc/api/v1/qr?upi_id=${globalPaymentSettings.upi}&amount=100&name=Metro%20Cash`; else qrImg.src = "https://via.placeholder.com/200?text=No+QR+Set"; }
}
function copyDepositUpi() { if(globalPaymentSettings.upi) { navigator.clipboard.writeText(globalPaymentSettings.upi).then(() => showToast("UPI ID Copied!")); } }

async function submitDeposit(btn) { 
    let amt = parseFloat(document.getElementById('depAmt').value); let utrInput = document.getElementById('depUtr').value.trim(); let upperInput = utrInput.toUpperCase(); 
    if (isNaN(amt) || amt < 10) return showToast("Please enter correct Amount (Min ₹10).");
    if (utrInput === "") return showToast("Please enter UTR or Transaction ID.");
    let apiPayload = { amount: amt }; let isDigitsOnly = /^\d+$/.test(utrInput); 
    if (isDigitsOnly) { if (utrInput.length !== 12) return showToast("Please enter valid 12-digit UTR."); apiPayload.utr = utrInput; } else { if (!upperInput.startsWith('FMPIB') || utrInput.length < 10) return showToast("Please enter valid Transaction ID."); apiPayload.transaction_id = upperInput; }
    btn.classList.add('btn-loading'); let apiKey = globalPaymentSettings.apiKey;
    if(!apiKey) { db.ref('deposits').push({ userId: currentUser.id, amt: amt, utr: upperInput, date: new Date().toLocaleString() }); addTxRecord('Deposit', amt, 'Pending', upperInput); setTimeout(() => { btn.classList.remove('btn-loading'); showToast("Deposit Request Sent to Admin!"); history.back(); }, 800); return; }
    try {
        let response = await fetch("https://fampay.rulebreaker.cc/api/v1/payment/verify", { method: "POST", headers: { "Authorization": "Bearer " + apiKey, "Content-Type": "application/json" }, body: JSON.stringify(apiPayload) });
        let resData = await response.json();
        if (resData.success && resData.received) {
            if (resData.already_verified) { showToast("Transaction already used!"); btn.classList.remove('btn-loading'); return; }
            let finalAmt = resData.amount || amt; currentUser.depositBal = (parseFloat(currentUser.depositBal) || 0) + finalAmt; currentUser.balance = currentUser.depositBal + (parseFloat(currentUser.withdrawBal) || 0); addTxRecord('Deposit', finalAmt, 'Success', upperInput); pushUserNotification(currentUser.id, "Deposit Successful! ✅", `Your deposit of ₹${finalAmt} was verified.`); showToast("Payment Verified!"); setTimeout(() => { btn.classList.remove('btn-loading'); updateBalDisplay(); history.back(); }, 1200);
        } else { showToast(resData.message || "Payment not found."); btn.classList.remove('btn-loading'); }
    } catch(e) { showToast("Verification server error."); btn.classList.remove('btn-loading'); }
}

function openHistory(type) { 
    let title = "History"; let data = [];
    if(type === 'tx') { title = "Transaction History"; data = currentUser.txHistory || []; }
    else if(type === 'game') { title = "Game History"; data = currentUser.gameHistory || []; }
    else if(type === 'dep') { title = "Deposit History"; data = (currentUser.txHistory || []).filter(t => t.type === 'Deposit'); }
    else if(type === 'wth') { title = "Withdraw History"; data = (currentUser.txHistory || []).filter(t => t.type === 'Withdraw'); }
    document.getElementById('historyTitle').innerText = title; let content = document.getElementById('historyContent'); 
    
    let htmlStr = "";
    if(!data || data.length === 0) { 
        htmlStr = `<p style="text-align:center; color:gray; margin-top:30px;"><i class="fa-solid fa-box-open" style="font-size:40px; margin-bottom:10px; opacity:0.5;"></i><br>No records found.</p>`; 
    } else { 
        data.forEach(item => { 
            if(type === 'game') { 
                let isPending = item.status === 'Pending'; let color = isPending ? 'orange' : (item.isWin ? 'green' : 'red'); let sign = isPending ? '' : (item.isWin ? '+' : '-'); let val = isPending ? 'Pending' : (item.isWin ? `₹${item.winAmt}` : `₹${item.actualBet}`);
                htmlStr += `<div style="background:white; padding:15px; border-radius:10px; margin-bottom:12px; border:1px solid var(--border); box-shadow:0 2px 5px rgba(0,0,0,0.02);"><b style="float:right; color:${color}">${sign}${val}</b><b style="color:var(--text);">${item.game}</b><br><small style="color:gray; margin-top:5px; display:block;">${item.date} | Bet: ₹${item.bet}</small></div>`; 
            } else { 
                let color = item.status === 'Pending' ? '#f39c12' : (item.status === 'Rejected' ? '#fb4e4e' : '#18b660'); let pillBg = item.type === 'Deposit' ? 'var(--w-green)' : (item.type === 'Withdraw' ? 'var(--w-red)' : 'var(--w-blue)'); let ordId = item.orderId || ((item.type === 'Deposit' ? 'D' : (item.type === 'Withdraw' ? 'W' : 'T')) + Math.abs(new Date(item.date).getTime()) + Math.floor(Math.random()*1000));
                let payTypeStr = "Online Payment"; if (item.type === 'Deposit') payTypeStr = item.utr ? 'UPI / Bank Transfer' : 'Gateway'; if (item.type === 'Withdraw') payTypeStr = (item.upi && item.upi.includes('Bank')) ? 'BANK CARD' : 'UPI';
                let statusTxt = item.status === 'Success' || item.status === 'Approved' ? 'Completed' : item.status;
                htmlStr += `<div style="background:white; border-radius:12px; margin-bottom:15px; padding:15px; box-shadow:0 4px 10px rgba(0,0,0,0.04); border:1px solid var(--border);"><div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px dashed #ddd; padding-bottom:12px; margin-bottom:12px;"><span style="background:${pillBg}; color:white; padding:4px 12px; border-radius:6px; font-weight:bold; font-size:12px; letter-spacing:0.5px;">${item.type.toUpperCase()}</span><span style="color:${color}; font-weight:bold; font-size:13px;">${statusTxt}</span></div><div style="display:flex; justify-content:space-between; margin-bottom:10px; font-size:13px;"><span style="color:gray;">Balance</span><span style="color:#f39c12; font-weight:bold; font-size:15px;">₹${item.amount}</span></div><div style="display:flex; justify-content:space-between; margin-bottom:10px; font-size:13px;"><span style="color:gray;">Type</span><span style="color:var(--text); font-weight:600;">${payTypeStr}</span></div><div style="display:flex; justify-content:space-between; margin-bottom:10px; font-size:13px;"><span style="color:gray;">Time</span><span style="color:var(--text); font-weight:500;">${item.date}</span></div><div style="display:flex; justify-content:space-between; align-items:center; font-size:13px;"><span style="color:gray;">Order number</span><span style="color:var(--text); font-family:monospace; display:flex; align-items:center; gap:8px; font-size:12px; background:#f4f5f8; padding:4px 8px; border-radius:4px;">${ordId} <i class="fa-regular fa-copy" style="color:var(--primary); cursor:pointer; font-size:14px;" onclick="navigator.clipboard.writeText('${ordId}'); showToast('Order ID Copied!');"></i></span></div></div>`;
            } 
        }); 
    }
    content.innerHTML = htmlStr;
    pushNav('historyScreen'); 
}


function switchAllGamesTab(tabId) {
    let tabs = ['tabPopular', 'tabLottery', 'tabOriginal'];
    tabs.forEach(t => { let el = document.getElementById(t); if(el) el.classList.remove('active'); });
    let activeTab = document.getElementById(tabId);
    if(activeTab) { activeTab.classList.add('active'); try { activeTab.scrollIntoView({behavior: "smooth", block: "nearest", inline: "center"}); } catch(e){} }
    let titleEl = document.getElementById('allGamesSectionTitle'); let gridEl = document.getElementById('allGamesGrid'); let lotteryGrid = document.getElementById('allLotteryGrid'); 
    gridEl.innerHTML = ''; 
    if (tabId === 'tabLottery') { 
        titleEl.innerText = '| Lottery'; gridEl.style.display = 'none'; lotteryGrid.style.display = 'grid'; 
    } else if (tabId) {
        lotteryGrid.style.display = 'none'; gridEl.style.display = 'grid';
        let dataKey = tabId.replace('tab', '').toLowerCase(); let displayTitle = tabId.replace('tab', ''); titleEl.innerText = '| ' + displayTitle;
        let gamesData = gameLibrary[dataKey] || []; let randomizedGames = [...gamesData];
        for (let i = randomizedGames.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [randomizedGames[i], randomizedGames[j]] = [randomizedGames[j], randomizedGames[i]]; }
        randomizedGames.forEach(g => { 
            let imgHtml = g.isAviator ? `<div style="width:100%; height:100%; background: radial-gradient(circle at center, #222 0%, #000 100%); display:flex; flex-direction:column; align-items:center; justify-content:center; position:relative; overflow:hidden;"><i class="fa-solid fa-plane" style="color:#ff2a2a; font-size:35px; transform: rotate(-45deg); filter: drop-shadow(0 0 10px #ff2a2a); margin-bottom:5px; z-index:5;"></i><span style="color:#ff2a2a; font-family:'Arial', sans-serif; font-weight:900; font-size:12px; text-transform:uppercase; font-style:italic; letter-spacing:1px; text-shadow:0 0 10px #ff2a2a; z-index:5;">Aviator</span><div style="position:absolute; bottom:15%; width:50%; height:2px; background:#ff2a2a; box-shadow:0 0 10px #ff2a2a; z-index:2;"></div></div>` : (g.img ? `<img src="${g.img}" alt="${g.title}">` : `<i class="fa-solid ${g.icon}"></i>`); 
            let clickAction = g.title === 'Aviator' ? `openGame('Aviator', '/game/aviator.html', '/game/aviator.js')` : `showToast('Coming soon!')`;
            gridEl.innerHTML += `<div class="sq-card" onclick="${clickAction}"><div class="sq-img-placeholder" style="background:${g.color}; padding:0;">${imgHtml}</div><div class="title">${g.title}</div></div>`; 
        });
    }
}

// --- ADMIN SECURITY, TABS & VIP GIFTS ---
function openAdminAuth() {
    db.ref('admin/settings/panelPassword').once('value').then(snap => { let pass = snap.val(); let content = document.getElementById('adminAuthContent');
        if(!pass) {
            content.innerHTML = `<h3 style="margin-bottom:15px; color:var(--text);">Set Admin Access Code</h3><input type="password" id="adminNewCode" class="input-box" placeholder="Enter New Code" style="margin-bottom:10px; border:1px solid var(--border);"><input type="password" id="adminConfCode" class="input-box" placeholder="Confirm Code" style="margin-bottom:15px; border:1px solid var(--border);"><button class="btn-pill btn-main" style="margin-bottom:10px; background:#00b894; box-shadow:0 4px 10px rgba(0,184,148,0.3);" onclick="setupAdminCode()">Save & Enter</button><button class="btn-pill btn-outline" style="margin-bottom:0;" onclick="closeAdminAuth()">Cancel</button>`;
        } else {
            content.innerHTML = `<h3 style="margin-bottom:15px; color:var(--text);">Admin Security</h3><input type="password" id="adminUniqueCodeInput" class="input-box" placeholder="Enter Access Code" style="margin-bottom:15px; border:1px solid var(--border);"><button class="btn-pill btn-main" style="margin-bottom:10px;" onclick="verifyAdminCode()">Enter Panel</button><button class="btn-pill btn-outline" style="margin-bottom:0;" onclick="closeAdminAuth()">Cancel</button>`;
        }
        document.getElementById('adminAuthOverlay').classList.add('active');
    });
}
function closeAdminAuth() { document.getElementById('adminAuthOverlay').classList.remove('active'); }

function setupAdminCode() { let n = document.getElementById('adminNewCode').value; let c = document.getElementById('adminConfCode').value; if(!n || n.length < 4) return showToast("Code must be at least 4 characters."); if(n !== c) return showToast("Codes do not match!"); db.ref('admin/settings/panelPassword').set(n).then(() => { closeAdminAuth(); pushNav('adminScreen'); renderAdminLists(); renderAdminUsers(); showToast("Admin Code Set Successfully!"); }); }
function verifyAdminCode() { let val = document.getElementById('adminUniqueCodeInput').value; db.ref('admin/settings/panelPassword').once('value').then(snap => { let truePass = snap.val(); if(val === truePass) { closeAdminAuth(); pushNav('adminScreen'); renderAdminLists(); renderAdminUsers(); renderAdminGiftCodes(); } else { showToast("Incorrect Security Code!"); } }); }

function showAdminTab(tabId) { 
    ['depTab', 'wthTab', 'usersTab', 'paySetupTab', 'secTab', 'giftTab', 'noticeTab'].forEach(id => { document.getElementById(id).style.display = 'none'; let btn = document.getElementById('btn' + id.charAt(0).toUpperCase() + id.slice(1)); if(btn) { btn.style.background = '#f5f6f8'; btn.style.color = 'black'; } });
    document.getElementById(tabId).style.display = 'block'; let actBtn = document.getElementById('btn' + tabId.charAt(0).toUpperCase() + tabId.slice(1));
    if(tabId === 'depTab') { actBtn.style.background = '#00b894'; actBtn.style.color = 'white'; } else if(tabId === 'wthTab') { actBtn.style.background = '#fdcb6e'; actBtn.style.color = 'black'; } else if(tabId === 'usersTab') { actBtn.style.background = '#2575fc'; actBtn.style.color = 'white'; renderAdminUsers(); } else if(tabId === 'paySetupTab') { actBtn.style.background = '#6c5ce7'; actBtn.style.color = 'white'; } else if(tabId === 'secTab') { actBtn.style.background = '#e84393'; actBtn.style.color = 'white'; } else if(tabId === 'giftTab') { actBtn.style.background = '#10ac84'; actBtn.style.color = 'white'; renderAdminGiftCodes(); } else if(tabId === 'noticeTab') { actBtn.style.background = '#0984e3'; actBtn.style.color = 'white'; }
}

function toggleAdminViewCode(event) { let input = document.getElementById('viewAdminCode'); let icon = event.target; if(input.type === 'password') { db.ref('admin/settings/panelPassword').once('value').then(snap => { input.value = snap.val(); input.type = 'text'; icon.classList.replace('fa-eye', 'fa-eye-slash'); }); } else { input.type = 'password'; input.value = '••••••••'; icon.classList.replace('fa-eye-slash', 'fa-eye'); } }
function changeAdminCode() { let oldC = document.getElementById('adminChangeOld').value; let newC = document.getElementById('adminChangeNew').value; let confC = document.getElementById('adminChangeConf').value; db.ref('admin/settings/panelPassword').once('value').then(snap => { let truePass = snap.val(); if(oldC !== truePass) return showToast("Incorrect Old Code!"); if(newC.length < 4) return showToast("New Code must be at least 4 chars."); if(newC !== confC) return showToast("New Codes do not match!"); db.ref('admin/settings/panelPassword').set(newC).then(() => { showToast("Access Code Updated Successfully!"); document.getElementById('adminChangeOld').value = ''; document.getElementById('adminChangeNew').value = ''; document.getElementById('adminChangeConf').value = ''; document.getElementById('viewAdminCode').type = 'password'; document.getElementById('viewAdminCode').value = '••••••••'; document.querySelector('#secTab .fa-eye-slash')?.classList.replace('fa-eye-slash', 'fa-eye'); }); }); }
function savePaymentSettings() { let upi = document.getElementById('adminSetupUpi').value.trim(); let qr = document.getElementById('adminSetupQr').value.trim(); let key = document.getElementById('adminSetupApiKey').value.trim(); db.ref('admin/paymentSettings').set({ upi: upi, qrUrl: qr, apiKey: key }); showToast("Payment Settings Saved Successfully!"); }

function renderAdminUsers(filterText = "") { 
    let uList = document.getElementById('adminUsersList'); uList.innerHTML = ""; let keys = Object.keys(usersDB); if(keys.length === 0) { uList.innerHTML = "<p style='color:gray;'>No users registered yet.</p>"; return; } 
    keys.forEach(k => { let user = usersDB[k]; if(k.includes(filterText) || user.uid.includes(filterText)) { uList.innerHTML += `<div style="background:var(--bg); padding:15px; margin-bottom:10px; border-radius:8px; border:1px solid var(--border);"><p style="margin-bottom:5px;"><b>Phone Number:</b> ${k}</p><p style="margin-bottom:5px;"><b>UID:</b> ${user.uid}</p><p style="margin-bottom:5px; padding:5px; background:#ffeaa7; display:inline-block; border-radius:5px;"><b>Password:</b> <span style="color:#d63031; font-weight:bold;">${user.password}</span></p><p style="margin-bottom:5px; margin-top:5px;"><b>Total Balance:</b> ₹${(parseFloat(user.balance) || 0).toFixed(2)}</p><p style="margin-bottom:5px; font-size:12px; color:gray;">(Dep: ₹${parseFloat(user.depositBal||0)} | Wth: ₹${parseFloat(user.withdrawBal||0)})</p></div>`; } }); 
}
function searchAdminUsers() { let text = document.getElementById('searchUserInput').value.trim().toLowerCase(); renderAdminUsers(text); }

function renderAdminLists() { 
    let dList = document.getElementById('pendingDepositsList'), wList = document.getElementById('pendingWithdrawsList'); dList.innerHTML = ""; wList.innerHTML = ""; 
    if(pendingDeps.length === 0) dList.innerHTML = "<p style='color:gray;'>No pending deposits.</p>"; else pendingDeps.forEach((r) => dList.innerHTML += `<div style="background:var(--bg); padding:15px; margin-bottom:10px; border-radius:8px; border:1px solid var(--border);"><p><b>${r.userId}</b>: ₹${r.amt} <br><small style="color:gray;">UTR: ${r.utr}</small></p><div style="margin-top:10px;"><button onclick="apprDep('${r.dbKey}')" style="background:#00b894; color:white; padding:8px 12px; border:none; border-radius:4px; font-weight:bold;">Approve</button> <button onclick="rejDep('${r.dbKey}')" style="background:#ff7675; color:white; padding:8px 12px; border:none; border-radius:4px; font-weight:bold;">Reject</button></div></div>`); 
    if(pendingWth.length === 0) wList.innerHTML = "<p style='color:gray;'>No pending withdrawals.</p>"; else pendingWth.forEach((r) => wList.innerHTML += `<div style="background:var(--bg); padding:15px; margin-bottom:10px; border-radius:8px; border:1px solid var(--border);"><p><b>${r.userId}</b>: ₹${r.amt}<br><small style="color:gray;">UPI: ${r.upi}</small></p><div style="margin-top:10px;"><button onclick="apprWth('${r.dbKey}')" style="background:#00b894; color:white; padding:8px 12px; border:none; border-radius:4px; font-weight:bold;">Approve</button> <button onclick="rejWth('${r.dbKey}')" style="background:#ff7675; color:white; padding:8px 12px; border:none; border-radius:4px; font-weight:bold;">Reject</button></div></div>`); 
}

function pushUserNotification(userId, title, msg) { if(usersDB[userId]) { let u = usersDB[userId]; if(!u.notifications) u.notifications = []; u.notifications.unshift({ title: title, msg: msg, date: new Date().toLocaleString(), read: false }); db.ref('users/' + userId).set(u); } }
function apprDep(dbKey) { let r = pendingDeps.find(p => p.dbKey === dbKey); if(usersDB[r.userId]) { let u = usersDB[r.userId]; u.depositBal = (parseFloat(u.depositBal) || 0) + r.amt; u.balance = u.depositBal + (parseFloat(u.withdrawBal)||0); if(!u.txHistory) u.txHistory = []; let tx = u.txHistory.find(t => t.type==='Deposit' && t.amount===r.amt && t.status==='Pending'); if(tx) tx.status = 'Approved'; db.ref('users/' + r.userId).set(u); pushUserNotification(r.userId, "Deposit Approved! ✅", `Your deposit of ₹${r.amt} was successful.`); } db.ref('deposits/' + dbKey).remove(); }
function rejDep(dbKey) { let r = pendingDeps.find(p => p.dbKey === dbKey); if(usersDB[r.userId]) { let u = usersDB[r.userId]; if(!u.txHistory) u.txHistory = []; let tx = u.txHistory.find(t => t.type==='Deposit' && t.amount===r.amt && t.status==='Pending'); if(tx) tx.status = 'Rejected'; db.ref('users/' + r.userId).set(u); pushUserNotification(r.userId, "Deposit Rejected ❌", `Your deposit request of ₹${r.amt} was rejected by Admin.`); } db.ref('deposits/' + dbKey).remove(); }
function apprWth(dbKey) { let r = pendingWth.find(p => p.dbKey === dbKey); if(usersDB[r.userId]) { let u = usersDB[r.userId]; if(!u.txHistory) u.txHistory = []; let tx = u.txHistory.find(t => t.type==='Withdraw' && t.amount===r.amt && t.status==='Pending'); if(tx) tx.status = 'Approved'; db.ref('users/' + r.userId).set(u); pushUserNotification(r.userId, "Withdrawal Approved! 💸", `Your withdrawal of ₹${r.amt} has been processed.`); } db.ref('withdrawals/' + dbKey).remove(); }
function rejWth(dbKey) { let r = pendingWth.find(p => p.dbKey === dbKey); if(usersDB[r.userId]) { let u = usersDB[r.userId]; u.withdrawBal = (parseFloat(u.withdrawBal) || 0) + r.amt; u.balance = (parseFloat(u.depositBal) || 0) + u.withdrawBal; if(!u.txHistory) u.txHistory = []; let tx = u.txHistory.find(t => t.type==='Withdraw' && t.amount===r.amt && t.status==='Pending'); if(tx) tx.status = 'Rejected'; db.ref('users/' + r.userId).set(u); pushUserNotification(r.userId, "Withdrawal Rejected ⚠️", `Your withdraw of ₹${r.amt} was rejected. Amount refunded to withdraw wallet.`); } db.ref('withdrawals/' + dbKey).remove(); }

function createAdminGiftCode() {
    let depReq = parseFloat(document.getElementById('adminGiftDep').value) || 0; let reward = document.getElementById('adminGiftReward').value.trim(); let days = parseInt(document.getElementById('adminGiftDays').value) || 1;
    if(!reward) return showToast("Please enter Reward Amount!"); let code = "GIFT" + Math.floor(10000 + Math.random() * 90000); let expiry = Date.now() + (days * 24 * 60 * 60 * 1000);
    db.ref('giftCodes/' + code).set({ code: code, depReq: depReq, reward: reward, expiry: expiry, date: new Date().toLocaleString() }).then(() => { showToast("Code created successfully!"); document.getElementById('adminGiftReward').value = ''; });
}
function renderAdminGiftCodes() {
    let list = document.getElementById('adminGiftCodeList'); list.innerHTML = ""; let keys = Object.keys(globalGiftCodes);
    if(keys.length === 0) { list.innerHTML = "<p style='color:gray;'>No codes created yet.</p>"; return; }
    keys.sort((a,b) => globalGiftCodes[b].expiry - globalGiftCodes[a].expiry).forEach(k => {
        let g = globalGiftCodes[k]; let isExpired = Date.now() > g.expiry; let claimCount = g.claimers ? Object.keys(g.claimers).length : 0; let claimsHtml = "";
        if(claimCount > 0) { claimsHtml = `<div style="margin-top:10px; border-top:1px dashed var(--border); padding-top:10px;"><p style="font-weight:bold; font-size:12px; margin-bottom:5px;">Claimers:</p>`; Object.values(g.claimers).forEach(c => { claimsHtml += `<div style="display:flex; justify-content:space-between; font-size:11px; color:gray; margin-bottom:3px;"><span>${c.uid}</span><span>₹${c.amt}</span></div>`; }); claimsHtml += `</div>`; }
        list.innerHTML += `<div style="background:var(--bg); padding:15px; margin-bottom:10px; border-radius:8px; border:1px solid var(--border);"><div style="display:flex; justify-content:space-between; align-items:center;"><h3 style="color:var(--primary); letter-spacing:1px; margin:0;">${g.code}</h3><i class="fa-regular fa-copy" style="cursor:pointer; color:var(--text-muted); font-size:18px;" onclick="navigator.clipboard.writeText('${g.code}'); showToast('Code Copied!');"></i></div><p style="font-size:12px; margin-top:8px;"><b>Deposit Req:</b> ₹${g.depReq} | <b>Reward:</b> ${g.reward}</p><p style="font-size:12px; color:${isExpired ? 'red' : 'green'}; margin-top:3px;"><b>Status:</b> ${isExpired ? 'Expired' : 'Active'} | <b>Claims:</b> ${claimCount}</p>${claimsHtml}</div>`;
    });
}
function redeemVIPGiftCode(btn) {
    let code = document.getElementById('giftCodeInput').value.trim().toUpperCase();
    if(!code) return showToast("Enter a code!"); btn.classList.add('btn-loading');
    db.ref('giftCodes/' + code).once('value').then(snap => {
        let g = snap.val(); if(!g) { showToast("Invalid Code!"); btn.classList.remove('btn-loading'); return; }
        if(Date.now() > g.expiry) { showToast("Code Expired!"); btn.classList.remove('btn-loading'); return; }
        if(g.claimers && g.claimers[currentUser.id]) { showToast("You already claimed this!"); btn.classList.remove('btn-loading'); return; }
        let hasValidDep = false;
        if(g.depReq === 0) hasValidDep = true;
        else if(currentUser.txHistory) {
            let sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000); let validDeps = currentUser.txHistory.filter(t => t.type === 'Deposit' && (t.status === 'Success' || t.status === 'Approved') && new Date(t.date).getTime() >= sevenDaysAgo);
            let totalRecentDep = validDeps.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0); if(totalRecentDep >= g.depReq) hasValidDep = true;
        }
        if(!hasValidDep) { showToast(`You must deposit at least ₹${g.depReq} within the last 7 days to claim!`); btn.classList.remove('btn-loading'); return; }
        let rAmt = 0; if(g.reward.includes('-')) { let parts = g.reward.split('-'); let min = parseInt(parts[0]); let max = parseInt(parts[1]); rAmt = Math.floor(Math.random() * (max - min + 1)) + min; } else { rAmt = parseInt(g.reward); }
        currentUser.depositBal = (parseFloat(currentUser.depositBal) || 0) + rAmt; currentUser.balance = currentUser.depositBal + (parseFloat(currentUser.withdrawBal) || 0); addTxRecord('Gift Code', rAmt, 'Credited');
        db.ref(`giftCodes/${code}/claimers/${currentUser.id}`).set({ uid: currentUser.uid, amt: rAmt, date: new Date().toLocaleString() }).then(() => { document.getElementById('giftCodeInput').value = ''; showToast(`Success! You received ₹${rAmt}`); btn.classList.remove('btn-loading'); setTimeout(()=> { updateBalDisplay(); history.back(); }, 1200); });
    });
}

function sendGlobalNotice() {
    let title = document.getElementById('adminNoticeTitle').value.trim(); let msg = document.getElementById('adminNoticeMsg').value.trim();
    if(!title || !msg) return showToast("Title and Message required!");
    let count = 0; Object.keys(usersDB).forEach(uid => { pushUserNotification(uid, title, msg); count++; });
    showToast(`Notice sent to ${count} users successfully!`); document.getElementById('adminNoticeTitle').value = ''; document.getElementById('adminNoticeMsg').value = '';
}

// ==========================================
// WITHDRAWAL & BANK LOGIC
// ==========================================
let currentWthMethod = 'bank'; let selectedBankAcc = null; let generatedBankOtp = "";

function updateWithdrawUI() {
    if(!currentUser) return;
    let wthBal = parseFloat(currentUser.withdrawBal) || 0;
    if(document.getElementById('wthNewBalDisplay')) document.getElementById('wthNewBalDisplay').innerText = wthBal.toFixed(2);
    if(document.getElementById('wthAvailSmall')) document.getElementById('wthAvailSmall').innerText = wthBal.toFixed(2);
    renderBankList();
} 

const originalUpdateBalDisplay = updateBalDisplay;
updateBalDisplay = function() { originalUpdateBalDisplay(); updateWithdrawUI(); }

function switchWthMethod(method) {
    currentWthMethod = method; document.getElementById('tabBankCard').classList.remove('active'); document.getElementById('tabUpi').classList.remove('active');
    if(method === 'bank') { document.getElementById('tabBankCard').classList.add('active'); } else { document.getElementById('tabUpi').classList.add('active'); }
    selectDefaultBank();
}

function fillAllWithdraw() { let wthBal = parseFloat(currentUser.withdrawBal) || 0; if(wthBal >= 100) { document.getElementById('wthAmtInput').value = wthBal.toFixed(2); } else { showToast("Balance must be at least ₹100 to withdraw."); } }

function renderBankList() {
    let container = document.getElementById('userBankListContainer'); if(!container || !currentUser) return; container.innerHTML = "";
    let banks = currentUser.savedBanks || []; let filteredBanks = banks.filter(b => b.type === currentWthMethod);
    let mainIcon = document.getElementById('selectedBankIcon'); let mainName = document.getElementById('selectedBankName'); let mainAcc = document.getElementById('selectedBankAcc');
    if(filteredBanks.length === 0) {
        if(mainName) mainName.innerText = currentWthMethod === 'upi' ? "No UPI added" : "No bank added";
        if(mainAcc) mainAcc.innerText = "Click to select or add";
        if(mainIcon) mainIcon.className = currentWthMethod === 'upi' ? "fa-brands fa-google-pay" : "fa-solid fa-building-columns";
        selectedBankAcc = null;
    } else {
        filteredBanks.forEach((b, index) => {
            let isSelected = (selectedBankAcc && selectedBankAcc.acc === b.acc) || (index === 0 && !selectedBankAcc);
            if(isSelected) { selectedBankAcc = b; if(mainName) mainName.innerText = b.name; if(mainAcc) mainAcc.innerText = b.type === 'bank' ? "Bank Ac: " + b.acc : "UPI: " + b.acc; if(mainIcon) mainIcon.className = b.type === 'bank' ? "fa-solid fa-building-columns" : "fa-brands fa-google-pay"; }
            let iconClass = b.type === 'bank' ? 'fa-building-columns' : 'fa-brands fa-google-pay';
            container.innerHTML += `<div class="bank-list-item ${isSelected ? 'selected' : ''}" onclick="selectBankAcc('${b.acc}')"><div style="background:#ff4757; color:white; padding:8px 15px; border-radius:5px 5px 0 0; margin:-15px -15px 15px -15px; font-weight:bold;"><i class="fa-solid ${iconClass}"></i> ${b.type === 'bank' ? 'Bank Card' : 'UPI ID'}</div><i class="fa-solid fa-circle-check check-icon"></i><div style="display:flex; justify-content:space-between; margin-bottom:8px;"><span style="color:gray;">Name</span> <b>${b.name}</b></div><div style="display:flex; justify-content:space-between; margin-bottom:8px;"><span style="color:gray;">Account</span> <b>${b.acc}</b></div>${b.ifsc ? `<div style="display:flex; justify-content:space-between;"><span style="color:gray;">IFSC</span> <b>${b.ifsc}</b></div>` : ''}</div>`;
        });
    }
    let btnText = currentWthMethod === 'upi' ? "Add UPI ID" : "Add bank account";
    container.innerHTML += `<div style="background:white; border-radius:10px; padding:20px; text-align:center; border:1px dashed #ccc; color:gray; cursor:pointer; margin-top:15px;" onclick="openAddBankScreen()"><i class="fa-solid fa-plus" style="font-size:24px; margin-bottom:10px; color:#ff4757;"></i><div style="font-weight:bold; font-size:14px;">${btnText}</div></div>`;
}

function selectBankAcc(accNum) { let banks = currentUser.savedBanks || []; selectedBankAcc = banks.find(b => b.acc === accNum); renderBankList(); history.back(); }
function selectDefaultBank() { selectedBankAcc = null; renderBankList(); }

function openAddBankScreen() {
    document.getElementById('bankAddName').value = ""; document.getElementById('bankAddOtp').value = ""; document.getElementById('bankAddEmail').value = "";
    let bAcc = document.getElementById('bankAddAcc'); if(bAcc) bAcc.value = ""; let bIfsc = document.getElementById('bankAddIfsc'); if(bIfsc) bIfsc.value = ""; let uId = document.getElementById('upiAddId'); if(uId) uId.value = ""; let uConf = document.getElementById('upiConfirmId'); if(uConf) uConf.value = "";
    let phoneStr = (typeof currentUser !== 'undefined' && currentUser) ? currentUser.id : ""; let maskedPhone = phoneStr; if(phoneStr.length === 10) { maskedPhone = phoneStr.substring(0,3) + "***" + phoneStr.substring(6,10); } document.getElementById('bankAddPhone').value = maskedPhone;
    if (typeof currentUser !== 'undefined' && currentUser && currentUser.isEmailVerified && currentUser.verifiedEmail) { document.getElementById('emailVerificationBlock').style.display = 'none'; document.getElementById('emailVerifiedBadge').style.display = 'block'; document.getElementById('emailVerifiedText').innerText = currentUser.verifiedEmail; } else { document.getElementById('emailVerificationBlock').style.display = 'block'; document.getElementById('emailVerifiedBadge').style.display = 'none'; }
    if(currentWthMethod === 'upi') { document.getElementById('addAccountTitle').innerText = "Add UPI Account"; document.getElementById('upiWarningMsg').style.display = 'block'; document.getElementById('bankOnlyFields1').style.display = 'none'; document.getElementById('bankOnlyFields2').style.display = 'none'; document.getElementById('upiOnlyFields').style.display = 'block'; document.getElementById('btnSaveBankAcc').style.background = "linear-gradient(135deg, #a8c0ff 0%, #3f2b96 100%)"; } else { document.getElementById('addAccountTitle').innerText = "Add a bank account number"; document.getElementById('upiWarningMsg').style.display = 'none'; document.getElementById('bankOnlyFields1').style.display = 'block'; document.getElementById('bankOnlyFields2').style.display = 'block'; document.getElementById('upiOnlyFields').style.display = 'none'; document.getElementById('btnSaveBankAcc').style.background = "linear-gradient(135deg, #a8c0ff 0%, #3f2b96 100%)"; }
    pushNav('addBankScreen');
}

function sendBankEmailOtp(btn) {
    let email = document.getElementById('bankAddEmail').value.trim().toLowerCase(); let isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isEmail) return showToast("Please enter a valid Gmail / Email address!");
    btn.classList.add('btn-loading'); generatedBankOtp = Math.floor(100000 + Math.random() * 900000).toString();
    emailjs.send('service_ehmighi', 'template_qal4o7p', { to_email: email, otp: generatedBankOtp }).then(function() { btn.classList.remove('btn-loading'); showToast("OTP Sent to Email successfully!"); btn.innerText = "Sent"; btn.disabled = true; btn.style.opacity = "0.7"; setTimeout(() => { btn.innerText = "Send"; btn.disabled = false; btn.style.opacity = "1"; }, 60000); }, function(error) { btn.classList.remove('btn-loading'); showToast("Failed to send OTP. Try again."); });
}

function saveBankAccount(btn) {
    let name = document.getElementById('bankAddName').value.trim(); let type = currentWthMethod; let acc = "", ifsc = "";
    if(!name) return showToast("Name is required!");
    if(type === 'bank') { acc = document.getElementById('bankAddAcc').value.trim(); ifsc = document.getElementById('bankAddIfsc').value.trim(); if(!acc || !ifsc) return showToast("Bank account and IFSC are required!"); } else { let upi1 = document.getElementById('upiAddId').value.trim(); let upi2 = document.getElementById('upiConfirmId').value.trim(); if(!upi1) return showToast("UPI ID is required!"); if(upi1 !== upi2) return showToast("UPI IDs do not match!"); acc = upi1; }
    let emailToSave = currentUser.verifiedEmail;
    if (currentUser && !currentUser.isEmailVerified) { let otp = document.getElementById('bankAddOtp').value.trim(); let typedEmail = document.getElementById('bankAddEmail').value.trim(); if(!typedEmail) return showToast("Gmail address is required!"); if(otp === "" || otp !== generatedBankOtp) return showToast("Invalid OTP code!"); emailToSave = typedEmail.toLowerCase(); }
    btn.classList.add('btn-loading');
    if (currentUser && !currentUser.isEmailVerified) { currentUser.isEmailVerified = true; currentUser.verifiedEmail = emailToSave; }
    if(currentUser && !currentUser.savedBanks) currentUser.savedBanks = [];
    currentUser.savedBanks.push({ type: type, name: name, acc: acc, ifsc: ifsc, date: new Date().toLocaleString() });
    db.ref('users/' + currentUser.id).set(currentUser).then(() => { btn.classList.remove('btn-loading'); showToast(type === 'upi' ? "UPI ID added successfully!" : "Bank Account added successfully!"); generatedBankOtp = ""; history.back(); renderBankList(); });
}

function submitCustomWithdraw(btn) { 
    let amt = parseFloat(document.getElementById('wthAmtInput').value);
    if(!selectedBankAcc) return showToast("Please add and select a withdrawal account first!");
    if(isNaN(amt) || amt < 100) return showToast("Minimum withdrawal is ₹100"); 
    let wthBal = parseFloat(currentUser.withdrawBal) || 0;
    if(amt > wthBal) return showToast(`Insufficient balance! ₹${wthBal.toFixed(2)} available.`); 
    btn.classList.add('btn-loading'); showGlobalLoader(); 
    currentUser.withdrawBal = wthBal - amt; currentUser.balance = (parseFloat(currentUser.depositBal) || 0) + currentUser.withdrawBal;
    let wthDetails = selectedBankAcc.type === 'bank' ? `Bank: ${selectedBankAcc.acc} (IFSC: ${selectedBankAcc.ifsc})` : `UPI: ${selectedBankAcc.acc}`;
    db.ref('withdrawals').push({ userId: currentUser.id, amt: amt, upi: wthDetails, date: new Date().toLocaleString() }); addTxRecord('Withdraw', amt, 'Pending');
    setTimeout(() => { btn.classList.remove('btn-loading'); hideGlobalLoader(); document.getElementById('wthAmtInput').value = ''; updateBalDisplay(); showToast("Withdraw Request Sent!"); }, 800); 
}

function openSupportChat() { if (window.tidioChatApi) { window.tidioChatApi.show(); window.tidioChatApi.open(); } else { showToast("Support chat is loading..."); } }
