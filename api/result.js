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


export default async function handler(req, res) {
    const currentMin = new Date().getMinutes();

    // 1. 30Sec Game (Ek sath 2 result banayega taaki 1 min me dono cover ho jayein)
    let p30_1 = getPeriod(30);
    let p30_2 = getPeriod(30, 30000); // 30 second aage ka period
    await db.ref(`wingo/results/30sec/${p30_1}`).set(generateRandomResult(p30_1));
    await db.ref(`wingo/results/30sec/${p30_2}`).set(generateRandomResult(p30_2));

    // 2. 1Min Game (Har minute banega)
    let p1 = getPeriod(60);
    await db.ref(`wingo/results/1min/${p1}`).set(generateRandomResult(p1));

    // 3. 3Min Game (Sirf tab banega jab minute 3 se divide ho jaye)
    if (currentMin % 3 === 0) {
        let p3 = getPeriod(180);
        await db.ref(`wingo/results/3min/${p3}`).set(generateRandomResult(p3));
    }

    // 4. 5Min Game (Sirf tab banega jab minute 5 se divide ho jaye)
    if (currentMin % 5 === 0) {
        let p5 = getPeriod(300);
        await db.ref(`wingo/results/5min/${p5}`).set(generateRandomResult(p5));
    }

    res.status(200).json({ success: true, message: "All timer results updated securely!" });
}
