const admin = require("firebase-admin");

if (!admin.apps.length) {
    // Vercel ke existing Environment Variables se connect hoga
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
      databaseURL: "https://metro-cash-1fc92-default-rtdb.firebaseio.com" 
    });
}
const db = admin.database();

// K3 Result banane ka logic (3 Dice, Sum, Big/Small, Odd/Even)
function generateK3RandomResult(period) {
    // 3 Random Dice (1 to 6)
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    const d3 = Math.floor(Math.random() * 6) + 1;
    
    const sum = d1 + d2 + d3;
    
    // Big/Small Logic
    const size = (sum >= 11 && sum <= 18) ? 'Big' : 'Small';
    
    // Odd/Even Logic
    const oddEven = (sum % 2 === 0) ? 'Even' : 'Odd';
    
    // Frontend history ke liye Dice Icons generate karna
    const diceHtml = `
        <span class="k3-hist-dice k3-hd-${d1}"></span>
        <span class="k3-hist-dice k3-hd-${d2}"></span>
        <span class="k3-hist-dice k3-hd-${d3}"></span>
    `;

    return { period, d1, d2, d3, sum, size, oddEven, diceHtml };
}

// Period ID nikalne ka logic (IST Timezone Fix) - Same as WinGo
function getPeriod(durationSec, offsetMs = 0) {
    const ms = Date.now() + offsetMs;
    const durationMs = durationSec * 1000;

    const istOffset = 5.5 * 60 * 60 * 1000;
    const msIST = ms + istOffset;

    const dateIST = new Date(msIST);
    dateIST.setUTCHours(0, 0, 0, 0);
    const startOfDay = dateIST.getTime() - istOffset;

    const seq = Math.floor((ms - startOfDay) / durationMs) + 1;
    const dateStr = new Date(ms).toISOString().slice(0,10).replace(/-/g,'');

    return dateStr + String(seq).padStart(4, '0');
}

// NAYA: Smart Save Function (Jo purane result ko overwrite nahi karega)
async function saveK3ResultSafe(gameType, periodId) {
    const ref = db.ref(`k3/results/${gameType}/${periodId}`);
    const snap = await ref.once('value');
    if (!snap.exists()) {
        await ref.set(generateK3RandomResult(periodId));
    }
}

export default async function handler(req, res) {
    try {
        const tasks = [];

        // K3 1Min Game
        tasks.push(saveK3ResultSafe('1min', getPeriod(60, -60000)));
        tasks.push(saveK3ResultSafe('1min', getPeriod(60, 0)));
        tasks.push(saveK3ResultSafe('1min', getPeriod(60, 60000)));

        // K3 3Min Game
        tasks.push(saveK3ResultSafe('3min', getPeriod(180, -180000)));
        tasks.push(saveK3ResultSafe('3min', getPeriod(180, 0)));
        tasks.push(saveK3ResultSafe('3min', getPeriod(180, 180000)));

        // K3 5Min Game
        tasks.push(saveK3ResultSafe('5min', getPeriod(300, -300000)));
        tasks.push(saveK3ResultSafe('5min', getPeriod(300, 0)));
        tasks.push(saveK3ResultSafe('5min', getPeriod(300, 300000)));

        // K3 10Min Game (Tumhare nayi tab ke hisaab se)
        tasks.push(saveK3ResultSafe('10min', getPeriod(600, -600000)));
        tasks.push(saveK3ResultSafe('10min', getPeriod(600, 0)));
        tasks.push(saveK3ResultSafe('10min', getPeriod(600, 600000)));

        // Ek sath saare result superfast save karo
        await Promise.all(tasks);

        res.status(200).json({ success: true, message: "K3 Superfast Results Generated!" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}
