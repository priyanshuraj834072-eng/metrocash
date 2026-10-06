const admin = require("firebase-admin");

if (!admin.apps.length) {
    // Vercel me Environment Variables set karna hoga
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
      databaseURL: "https://metro-cash-1fc92-default-rtdb.firebaseio.com" // Aapka DB URL
    });
}
const db = admin.database();

// Result banane ka logic
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

// Period ID nikalne ka logic (IST Timezone Fix)
function getPeriod(durationSec, offsetMs = 0) {
    const ms = Date.now() + offsetMs;
    const durationMs = durationSec * 1000;

    // India Time (IST) Offset = +5:30 hours
    const istOffset = 5.5 * 60 * 60 * 1000;
    const msIST = ms + istOffset;

    // IST ke hisaab se raat 12 baje (midnight) ka exact time nikalna
    const dateIST = new Date(msIST);
    dateIST.setUTCHours(0, 0, 0, 0);
    const startOfDay = dateIST.getTime() - istOffset;

    const seq = Math.floor((ms - startOfDay) / durationMs) + 1;
    const dateStr = new Date(ms).toISOString().slice(0,10).replace(/-/g,'');

    return dateStr + String(seq).padStart(4, '0');
}


// NAYA: Smart Save Function (Jo purane result ko overwrite nahi karega)
async function saveResultSafe(gameType, periodId) {
    const ref = db.ref(`wingo/results/${gameType}/${periodId}`);
    const snap = await ref.once('value');
    if (!snap.exists()) {
        await ref.set(generateRandomResult(periodId));
    }
}

export default async function handler(req, res) {
    try {
        const tasks = [];

        // 1. 30Sec Game
        tasks.push(saveResultSafe('30sec', getPeriod(30, -30000)));
        tasks.push(saveResultSafe('30sec', getPeriod(30, 0)));
        tasks.push(saveResultSafe('30sec', getPeriod(30, 30000)));
        tasks.push(saveResultSafe('30sec', getPeriod(30, 60000)));

        // 2. 1Min Game
        tasks.push(saveResultSafe('1min', getPeriod(60, -60000)));
        tasks.push(saveResultSafe('1min', getPeriod(60, 0)));
        tasks.push(saveResultSafe('1min', getPeriod(60, 60000)));

        // 3. 3Min Game
        tasks.push(saveResultSafe('3min', getPeriod(180, -180000)));
        tasks.push(saveResultSafe('3min', getPeriod(180, 0)));
        tasks.push(saveResultSafe('3min', getPeriod(180, 180000)));

        // 4. 5Min Game
        tasks.push(saveResultSafe('5min', getPeriod(300, -300000)));
        tasks.push(saveResultSafe('5min', getPeriod(300, 0)));
        tasks.push(saveResultSafe('5min', getPeriod(300, 300000)));

        // Ek sath saare result superfast save karo (Vercel Timeout se bachne ke liye)
        await Promise.all(tasks);

        res.status(200).json({ success: true, message: "Superfast Bulletproof Results Generated!" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}
