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
    // CREATE ALARM
    // =========================

    if (lower.startsWith("wake me at")) {

        const time = text.replace(/wake me at/i, "").trim();

        db = db.filter(a => !(a.user === user && a.status === "pending"));

        db.push({
            user,
            time,
            message: "⏰ WAKE UP!",
            buddy: null,
            status: "pending",
            lastNotified: null,
            secondAlert: false,
            buddyAlert: false
        });

        saveDB(db);

        message.reply(
`✅ Alarm set for ${time}

Commands:
• message <text>
• set buddy <number>
• delete alarm
• show alarms
• awake`
        );
    }

    // =========================
    // CUSTOM MESSAGE
    // =========================

    else if (lower.startsWith("message ")) {

        const customMessage = text.replace(/message/i, "").trim();

        const alarm = db.find(a =>
            a.user === user &&
            a.status === "pending"
        );

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

        const alarm = db.find(a =>
            a.user === user &&
            a.status === "pending"
        );

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

        const newDB = db.filter(a =>
            !(a.user === user && a.status === "pending")
        );

        saveDB(newDB);

        message.reply("🗑️ Alarm deleted.");
    }

    // =========================
    // SHOW ALARMS
    // =========================

    else if (lower === "show alarms") {

        const alarms = db.filter(a =>
            a.user === user &&
            a.status === "pending"
        );

        if (alarms.length === 0) {
            message.reply("📭 No active alarms.");
            return;
        }

        let reply = "⏰ Your alarms:\n\n";

        alarms.forEach((a, i) => {
            reply += `${i+1}. ${a.time}\n`;
        });

        message.reply(reply);
    }

    // =========================
    // USER WOKE UP
    // =========================

    else if (lower === "awake") {

        db.forEach(a => {
            if (a.user === user && a.status === "pending") {
                a.status = "done";
            }
        });

        saveDB(db);

        message.reply("🔥 Good morning!");
    }

    // =========================
    // HELP
    // =========================

    else if (lower === "help") {

        message.reply(`
🤖 Commands:

wake me at 08:30
message <text>
set buddy <number>
delete alarm
show alarms
awake
`);
    }

});

// =======================
// CRON JOB
// =======================

cron.schedule('* * * * *', async () => {

    const now = new Date();
    const currentTime = now.toTimeString().slice(0,5);

    let db = loadDB();

    for (let alarm of db) {

        if (alarm.status !== "pending") continue;

        // FIRST ALERT
        if (alarm.time === currentTime && !alarm.lastNotified) {

            await client.sendMessage(
                alarm.user,
                `${alarm.message}\n\nReply AWAKE`
            );

            alarm.lastNotified = Date.now();
        }

        // SECOND ALERT
        else if (
            alarm.lastNotified &&
            Date.now() - alarm.lastNotified > 5*60*1000 &&
            !alarm.secondAlert
        ) {

            await client.sendMessage(
                alarm.user,
                "⚠️ You're going to miss class!"
            );

            alarm.secondAlert = true;
        }

        // BUDDY ALERT
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
        }
    }

    saveDB(db);

});

// =======================
// START BOT
// =======================

client.initialize();