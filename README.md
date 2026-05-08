# 💤 WakeUp Bot

A WhatsApp-based recurring wake-up and accountability bot for students living in hostels and dorms.

Never miss morning classes again 😈

---

# 🚀 Features

- ⏰ Daily recurring alarms
- 📝 Custom wake-up messages
- 👥 Buddy escalation system
- 🔁 Repeating alarms until deleted
- 😴 Stop reminders for the day using `AWAKE`
- 🗑 Delete alarms anytime
- 📋 View active alarms
- 🤖 WhatsApp chat interface

---

# 💡 Problem

Students in dorms and hostels often:
- oversleep
- miss classes
- ignore alarms
- silence notifications

This bot introduces:
- escalation
- accountability
- social wake-up systems

If the user does not respond:
1. Bot sends reminders
2. Bot escalates
3. Bot alerts a buddy/friend

---

# 🛠 Tech Stack

- Node.js
- whatsapp-web.js
- Railway
- node-cron
- Local JSON database

---

# 📦 Installation

## 1. Clone repository

```bash
git clone https://github.com/YOUR_USERNAME/wakeup-bot.git
cd wakeup-bot
```

---

## 2. Install dependencies

```bash
npm install
```

---

## 3. Start bot

```bash
node index.js
```

---

# 📲 Connect WhatsApp

After starting:

- A QR code appears in terminal
- Open WhatsApp on your phone
- Go to:
  - Linked Devices
  - Link Device
- Scan QR

Bot is now connected.

---

# 🤖 Commands

## Create recurring alarm

```text
wake me at 08:30
```

---

## Set custom wake-up message

```text
message BRO GO TO CLASS 💀
```

---

## Set buddy

```text
set buddy 9198XXXXXXX
```

---

## Stop reminders for today

```text
awake
```

---

## Show active alarms

```text
show alarms
```

---

## Delete alarm

```text
delete alarm
```

---

## Help / onboarding

```text
hi
```

---

# 🔁 Alarm Escalation Flow

## At alarm time

Bot sends:

```text
⏰ WAKE UP!
Reply AWAKE
```

---

## After 5 minutes

```text
⚠️ You're going to miss class!
```

---

## After 10 minutes

Buddy receives:

```text
🚨 Your friend is still sleeping! Go wake them 😈
```

---

# ☁️ Deployment

Recommended deployment platform:

- Railway

This project supports:
- GitHub auto-deploy
- 24/7 hosting
- Persistent execution

---

# 🔐 Security Notes

## IMPORTANT

Never commit:
- `.env`
- `.wwebjs_auth`
- `.wwebjs_cache`

Use a `.gitignore` file.

Example:

```gitignore
node_modules
.env
.wwebjs_auth
.wwebjs_cache
.ipynb_checkpoints
```

---

# ⚠️ Disclaimer

This project uses:
- `whatsapp-web.js`

which automates WhatsApp Web and is not officially supported by Meta.

Use responsibly.

---

# 🚀 Future Improvements

- Multiple alarms per user
- Group escalation
- Voice call escalation
- AI-generated wake-up roasting
- Dashboard UI
- Analytics
- Attendance integration
- Sleep tracking
- Mobile app

---

# 👨‍💻 Development

## Run locally

```bash
node index.js
```

---

## Push updates

```bash
git add .
git commit -m "update"
git push
```

Railway automatically redeploys.

---

# 📄 License

MIT License

---

# 😈 Built for hostel survivors
