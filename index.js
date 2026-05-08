const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const cron = require('node-cron');
const fs = require('fs');

// =======================
// DATABASE
// =======================

const DB_FILE = 'alarms.json';

function loadDB() {
    if (!fs.existsSync(DB_FILE)) return [];
    return JSON.parse(fs.readFileSync(DB_FILE));
}

function saveDB(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// =======================
// WHATSAPP CLIENT
// =======================

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

// =======================
// QR CODE
// =======================

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

// =======================
// READY
// =======================

client.on('ready', () => {
    console.log('✅ Bot is ready!');
});

// =======================
// MESSAGE HANDLER
// =======================

client.on('message', async message => {

    const text = message.body.trim();
    const lower = text.toLowerCase();
    const user = message.from;

    let db = loadDB();

    // =========================
    // HI / INTRO MESSAGE
    // =========================

    if (lower === "hi") {

        message.reply(`
🤖 Welcome to WakeUp Bot!

Never miss class again 😈

COMMANDS:

⏰ wake me at 08:30
Create recurring daily alarm

📝 message <text>
Set custom wake-up message

👥 set buddy <number>
Set escalation buddy

🗑 delete alarm
Delete your alarm

📋 show alarms
View active alarms

😴 awake
Stop today's reminders

Example:

wake me at 08:30
message BRO GO TO CLASS 💀
set buddy 9198XXXXXXX
`);

        return;
    }

    // =========================
    // CREATE / UPDATE ALARM
    // =========================

    if (lower.startsWith("wake me at")) {

        const time = text.replace(/wake me at/i, "").trim();

        // Remove existing alarm
        db = db.filter(a => !(a.user === user));

        db.push({
            user,
            time,
            message: "⏰ WAKE UP!",
            buddy: null,

            // daily state
            stoppedToday: false,
            lastTriggeredDate: null,

            // escalation flags
            lastNotified: null,
            secondAlert: false,
            buddyAlert: false
        });

        saveDB(db);

        message.reply(`
✅ Daily recurring alarm set for ${time}

Commands:
• message <text>
• set buddy <number>
• delete alarm
• show alarms
`);
    }

    // =========================
    // CUSTOM MESSAGE
    // =========================

    else if (lower.startsWith("message ")) {

        const customMessage = text.replace(/message/i, "").trim();

        const alarm = db.find(a => a.user === user);

        if (!alarm) {
            message.reply("❌ No active alarm.");
            return;
        }

        alarm.message = customMessage;

        saveDB(db);

        message.reply("✅ Wake-up message updated!");
    }

    // =========================
    // SET BUDDY
    // =========================

    else if (lower.startsWith("set buddy")) {

        const number = text.replace(/set buddy/i, "").trim();

        const buddy = number + "@c.us";

        const alarm = db.find(a => a.user === user);

        if (!alarm) {
            message.reply("❌ No active alarm.");
            return;
        }

        alarm.buddy = buddy;

        saveDB(db);

        message.reply("✅ Buddy set!");
    }

    // =========================
    // DELETE ALARM
    // =========================

    else if (lower === "delete alarm") {

        db = db.filter(a => a.user !== user);

        saveDB(db);

        message.reply("🗑️ Alarm deleted.");
    }

    // =========================
    // SHOW ALARMS
    // =========================

    else if (lower === "show alarms") {

        const alarms = db.filter(a => a.user === user);

        if (alarms.length === 0) {
            message.reply("📭 No active alarms.");
            return;
        }

        let reply = "⏰ Your recurring alarms:\n\n";

        alarms.forEach((a, i) => {
            reply += `${i+1}. ${a.time}\n`;
        });

        message.reply(reply);
    }

    // =========================
    // USER IS AWAKE
    // =========================

    else if (lower === "awake") {

        const alarm = db.find(a => a.user === user);

        if (!alarm) {
            message.reply("❌ No active alarm.");
            return;
        }

        alarm.stoppedToday = true;

        saveDB(db);

        message.reply("🔥 Nice. Alarm stopped for today.");
    }

});

// =======================
// DAILY RESET
// =======================

cron.schedule('0 0 * * *', () => {

    let db = loadDB();

    db.forEach(alarm => {

        alarm.stoppedToday = false;

        alarm.lastNotified = null;
        alarm.secondAlert = false;
        alarm.buddyAlert = false;
    });

    saveDB(db);

    console.log("🔄 Daily reset complete");
});

// =======================
// MAIN ALARM CHECKER
// =======================

cron.schedule('* * * * *', async () => {

    const now = new Date();
    const currentTime = now.toTimeString().slice(0,5);

    let db = loadDB();

    for (let alarm of db) {

        // Skip if stopped today
        if (alarm.stoppedToday) continue;

        // =======================
        // FIRST ALERT
        // =======================

        if (
            alarm.time === currentTime &&
            !alarm.lastNotified
        ) {

            await client.sendMessage(
                alarm.user,
                `${alarm.message}\n\nReply AWAKE`
            );

            alarm.lastNotified = Date.now();

            saveDB(db);
        }

        // =======================
        // SECOND ALERT
        // =======================

        else if (
            alarm.lastNotified &&
            Date.now() - alarm.lastNotified > 5*60*1000 &&
            !alarm.secondAlert
        ) {

            await client.sendMessage(
                alarm.user,
                "⚠️ WAKE UP. You're going to miss class 😭"
            );

            alarm.secondAlert = true;

            saveDB(db);
        }

        // =======================
        // BUDDY ALERT
        // =======================

        else if (
            alarm.lastNotified &&
            Date.now() - alarm.lastNotified > 10*60*1000 &&
            !alarm.buddyAlert
        ) {

            if (alarm.buddy) {

                await client.sendMessage(
                    alarm.buddy,
                    "🚨 Your friend is still sleeping! Go wake them 😈"
                );
            }

            alarm.buddyAlert = true;

            saveDB(db);
        }
    }

});

// =======================
// START BOT
// =======================

client.initialize();