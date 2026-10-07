const admin = require('firebase-admin');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined
        }),
        databaseURL: "https://metro-cash-1fc92-default-rtdb.firebaseio.com"
    });
}

const db = admin.database();

module.exports = async (req, res) => {
    try {
        const ref = db.ref('aviator/rounds');
        const snap = await ref.orderByKey().limitToLast(1).once('value');
        
        let lastRound = null;
        snap.forEach(child => { lastRound = child.val(); });

        let now = Date.now();
        let currentStart = now + 5000; // 5 Seconds betting time
        
        // Date ke hisaab se Period ID generate karna
        let dateStr = new Date(now).toISOString().slice(0,10).replace(/-/g,'');
        let startPeriod = parseInt(dateStr + "0001");

        if (lastRound && lastRound.endTime > now) {
            let timeDiff = lastRound.endTime - now;
            
            // ANTI-SPAM LOCK: Agar already 5 minute ka advance queue hai, toh ruk jao
            if (timeDiff > 5 * 60 * 1000) {
                return res.status(200).json({ success: true, message: "Queue full. No new rounds needed." });
            }
            currentStart = lastRound.endTime + 5000; // Pichli flight ke 5 sec baad
            startPeriod = parseInt(lastRound.period) + 1;
        }

        let newRounds = {};

        // Ek baar mein sirf 5 rounds banana
        for (let i = 0; i < 5; i++) {
            // Provably Fair Casino Math (Crash Point)
            let e = 2 ** 32;
            let h = require('crypto').randomBytes(4).readUInt32BE(0);
            let crashPoint = Math.max(1.00, (100 * e - h) / (e - h) / 100);
            
            // Flight Duration = ln(crash) * 10000
            let flightDuration = Math.log(crashPoint) * 10000;
            let endTime = currentStart + flightDuration + 3000; // 3 sec crash animation
            
            let periodStr = startPeriod.toString();
            
            newRounds[periodStr] = {
                period: periodStr,
                flightStartTime: currentStart,
                crashPoint: crashPoint.toFixed(2),
                endTime: endTime
            };
            
            currentStart = endTime + 5000; 
            startPeriod++;
        }

        // Database mein save karna
        await ref.update(newRounds);

        // AUTO-CLEANUP: 10 minute se purane rounds delete karo taaki app hang na ho
        const oldSnap = await ref.orderByChild('endTime').endAt(now - 10 * 60 * 1000).once('value');
        let updates = {};
        oldSnap.forEach(child => { updates[child.key] = null; });
        if (Object.keys(updates).length > 0) { await ref.update(updates); }

        res.status(200).json({ success: true, message: "Generated 5 fresh rounds & cleaned old ones." });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
