const admin = require("firebase-admin");
const serviceAccount = require("./firebase-key.json");

if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: "https://metro-cash-1fc92-default-rtdb.firebaseio.com"
    });
}
const db = admin.database();

function generateRandomResult(period) {
    const resNum = Math.floor(Math.random() * 10);
    let resColor = '', dotHtml = '', numStyle = '';
    if(resNum === 0) { resColor = 'Red & Violet'; dotHtml = `<span style="width:10px; height:10px; border-radius:50%; display:inline-block; background:var(--w-red);"></span> <span style="width:10px; height:10px; border-radius:50%; display:inline-block; background:var(--w-violet);"></span>`; numStyle = 'background: linear-gradient(135deg, var(--w-red) 50%, var(--w-violet) 50%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;'; }
    else if(resNum === 5) { resColor = 'Green & Violet'; dotHtml = `<span style="width:10px; height:10px; border-radius:50%; display:inline-block; background:var(--w-green);"></span> <span style="width:10px; height:10px; border-radius:50%; display:inline-block; background:var(--w-violet);"></span>`; numStyle = 'background: linear-gradient(135deg, var(--w-green) 50%, var(--w-violet) 50%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;'; }
    else if(resNum % 2 === 0) { resColor = 'Red'; dotHtml = `<span style="width:10px; height:10px; border-radius:50%; display:inline-block; background:var(--w-red);"></span>`; numStyle = 'color: var(--w-red);'; }
    else { resColor = 'Green'; dotHtml = `<span style="width:10px; height:10px; border-radius:50%; display:inline-block; background:var(--w-green);"></span>`; numStyle = 'color: var(--w-green);'; }
    const size = resNum < 5 ? 'Small' : 'Big';
    return { period, num: resNum, size, color: resColor, colorHtml: dotHtml, numStyle };
}

// Ye function jo period abhi just khatam hua hai, uska exact number nikalega (IST Time ke sath)
function getFinishedPeriod(durationSec, offsetMs) {
    const ms = Date.now() - offsetMs; 
    const durationMs = durationSec * 1000;
    const istOffset = 5.5 * 60 * 60 * 1000;
    const startOfDayIST = Math.floor((ms + istOffset) / 86400000) * 86400000 - istOffset;
    const elapsedMs = ms - startOfDayIST;
    const seq = Math.floor(elapsedMs / durationMs) + 1;
    const dateStr = new Date(ms).toISOString().slice(0,10).replace(/-/g,'');
    return dateStr + String(seq).padStart(4, '0');
}

module.exports = async function(req, res) {
    try {
        const currentMin = new Date().getMinutes();

        // 30Sec Game (Pichle 1 minute mein 2 blocks khatam hue)
        let p30_1 = getFinishedPeriod(30, 45000); 
        let p30_2 = getFinishedPeriod(30, 15000); 
        await db.ref(`wingo/results/30sec/${p30_1}`).set(generateRandomResult(p30_1));
        await db.ref(`wingo/results/30sec/${p30_2}`).set(generateRandomResult(p30_2));

        // 1Min Game (Jo abhi khatam hua hai)
        let p1 = getFinishedPeriod(60, 30000);
        await db.ref(`wingo/results/1min/${p1}`).set(generateRandomResult(p1));

        // 3Min Game
        if (currentMin % 3 === 0) {
            let p3 = getFinishedPeriod(180, 30000);
            await db.ref(`wingo/results/3min/${p3}`).set(generateRandomResult(p3));
        }

        // 5Min Game
        if (currentMin % 5 === 0) {
            let p5 = getFinishedPeriod(300, 30000);
            await db.ref(`wingo/results/5min/${p5}`).set(generateRandomResult(p5));
        }

        res.status(200).json({ success: true, message: "All correct past results generated successfully!" });
    } catch (error) {
        console.error("Backend Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
}
