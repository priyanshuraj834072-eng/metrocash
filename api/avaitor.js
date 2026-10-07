const admin = require('firebase-admin');

// 1. FIREBASE INITIALIZATION (Same as Wingo)
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
        }),
        databaseURL: "https://metro-cash-1fc92-default-rtdb.firebaseio.com" // Tumhara database URL
    });
}

const db = admin.database();

module.exports = async (req, res) => {
    try {
        const roundsRef = db.ref('aviator/rounds');
        
        // 2. CHECK LAST GENERATED ROUND
        const snapshot = await roundsRef.orderByKey().limitToLast(1).once('value');
        
        let lastRoundTime = Date.now();
        // Generate period ID logic: YYYYMMDD0000
        let dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        let lastPeriod = parseInt(dateStr + "0000");

        if (snapshot.exists()) {
            const lastRound = Object.values(snapshot.val())[0];
            // Agar aage ka round already bana hua hai, toh uske aage se continue karo
            if (lastRound.endTime > lastRoundTime) {
                lastRoundTime = lastRound.endTime;
            }
            lastPeriod = parseInt(lastRound.period);
        }

        // 3. GENERATE ADVANCE ROUNDS
        const roundsToGenerate = 15; // Ek baar mein 15 rounds advance banayega
        const newRounds = {};
        
        const bettingTimeMs = 10000; // 10 seconds Betting Phase
        const crashBreakMs = 3000;   // 3 seconds ka break crash hone ke baad

        for (let i = 0; i < roundsToGenerate; i++) {
            // A. CRASH POINT CALCULATION (Casino Math)
            let crashPoint = 1.00;
            let rand = Math.random();
            
            // 5% chance of Insta-Crash at 1.00x (House Edge)
            if (rand > 0.05) {
                // Fair Crash Logic
                crashPoint = Math.max(1.01, Math.floor((0.99 / (1 - Math.random())) * 100) / 100);
                if (crashPoint > 500) crashPoint = 500.00; // Maximum cap at 500x
            }

            // B. FLIGHT TIME CALCULATION (Logarithmic curve)
            // Time = ln(multiplier) * 10000. 
            // Example: 2.00x = ~6.9 seconds, 10.00x = ~23 seconds
            let flightDurationMs = 0;
            if (crashPoint > 1.00) {
                flightDurationMs = Math.floor(Math.log(crashPoint) * 10000);
            }

            // C. SCHEDULE TIMESTAMPS
            const startTime = lastRoundTime + bettingTimeMs; // Plane udne ka exact time
            const endTime = startTime + flightDurationMs + crashBreakMs; // Round khatam hone ka time
            lastPeriod += 1; // Naya Period ID

            newRounds[lastPeriod] = {
                period: lastPeriod.toString(),
                crashPoint: crashPoint,
                betStartTime: lastRoundTime,     // Betting is time par shuru hogi
                flightStartTime: startTime,      // Plane is time par udega
                endTime: endTime,                // Round complete
                status: 'scheduled'
            };

            lastRoundTime = endTime; // Agle loop ke liye time update
        }

        // 4. SAVE TO FIREBASE
        await roundsRef.update(newRounds);

        // 5. CLEANUP OLD DATA (Firebase full na ho isliye)
        const oldTime = Date.now() - (30 * 60 * 1000); // 30 minute purane rounds delete karo
        const cleanupSnap = await roundsRef.orderByChild('endTime').endAt(oldTime).once('value');
        if (cleanupSnap.exists()) {
            const updates = {};
            cleanupSnap.forEach(child => { updates[child.key] = null; });
            await roundsRef.update(updates);
        }

        res.status(200).json({ 
            success: true, 
            message: `Successfully generated ${roundsToGenerate} Aviator rounds.`, 
            latestPeriod: lastPeriod 
        });

    } catch (error) {
        console.error("Aviator API Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};
