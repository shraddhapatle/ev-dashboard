# Sajag Tactical Command — Beginner Setup Guide

> **No experience needed.** This guide walks you through every single click
> and keypress to get the app running locally on Windows using VS Code.

---

## What You Will End Up With

After following this guide you will have:
- A dark tactical dashboard open in your browser at `http://localhost:5173`
- A live map of India showing EESL EV charging stations
- A running backend API at `http://localhost:5000`
- A running MongoDB database with real station data

The whole thing runs entirely on your own computer. No internet, no cloud,
no accounts needed (except to download the tools once).

---

## Table of Contents

1. [Install the required tools](#step-1--install-the-required-tools)
2. [Open the project in VS Code](#step-2--open-the-project-in-vs-code)
3. [Open 3 terminals inside VS Code](#step-3--open-3-terminals-inside-vs-code)
4. [Terminal 1 — Start MongoDB](#step-4--terminal-1--start-mongodb)
5. [Terminal 2 — Start the backend API](#step-5--terminal-2--start-the-backend-api)
6. [Terminal 3 — Start the frontend](#step-6--terminal-3--start-the-frontend)
7. [Use the app](#step-7--use-the-app)
8. [How to stop everything](#step-8--how-to-stop-everything)
9. [How to start again next time](#step-9--how-to-start-again-next-time)
10. [Troubleshooting](#step-10--troubleshooting)

---

## Step 1 — Install the required tools

You need three programs installed before anything else.
**If a tool is already installed, skip it.**

---

### 1a — Node.js

Node.js lets you run JavaScript on your computer (outside a browser).

1. Go to **https://nodejs.org**
2. Click the big green button that says **"LTS"** (stands for Long-Term Support — it's the stable version)
3. Download the `.msi` installer for Windows
4. Open the downloaded file and click **Next → Next → Next → Install**
   - Leave all options at their defaults
   - If it asks to install Chocolatey, you can uncheck that box
5. Click **Finish**

**Verify it worked:**
- Press `Windows key + R`, type `cmd`, press Enter
- In the black window that opens, type:
  ```
  node --version
  ```
  and press Enter
- You should see something like `v22.0.0` (any number is fine)
- Type `npm --version` and press Enter — you should see something like `10.0.0`

> If you see "not recognized as a command", restart your computer and try again.

---

### 1b — MongoDB

MongoDB is the database that stores all the charging station data.

1. Go to **https://www.mongodb.com/try/download/community**
2. Make sure the dropdowns say:
   - Version: **8.x.x (current)**
   - Platform: **Windows**
   - Package: **msi**
3. Click **Download**
4. Open the downloaded `.msi` file
5. Click **Next → Accept the agreement → Next**
6. When it asks "Setup Type", choose **Complete**
7. On the "Service Configuration" screen:
   - Leave everything as-is (it will install MongoDB as a Windows Service)
   - Make sure **"Install MongoDB as a Service"** is checked
8. **Uncheck** "Install MongoDB Compass" (we don't need the GUI)
9. Click **Next → Install**
10. Click **Finish**

**Verify it worked:**
- Press `Windows key + R`, type `cmd`, press Enter
- Type `mongod --version` and press Enter
- You should see `db version v8.x.x`

> If you see "not recognized", close and reopen the command prompt and try again.
> If it still fails, see [Troubleshooting](#step-10--troubleshooting).

---

### 1c — VS Code (Visual Studio Code)

VS Code is the code editor we will use to run the project.

1. Go to **https://code.visualstudio.com**
2. Click the blue **Download for Windows** button
3. Open the downloaded installer
4. Accept the agreement, click Next through all screens
5. On the "Select Additional Tasks" screen, **check all boxes** (especially
   "Add to PATH" and "Open with Code")
6. Click **Install → Finish**

---

## Step 2 — Open the Project in VS Code

1. Open VS Code (click the icon on your desktop or search "VS Code" in the Start menu)
2. In VS Code, click **File** in the top-left menu bar
3. Click **Open Folder...**
4. In the file browser that opens, navigate to the project folder
   (the folder that contains `package.json`, `src/`, `backend/`, `GUIDE.md`)
5. Click on that folder once to select it
6. Click **Select Folder**

You should now see the project files listed in the left panel (called the Explorer).
It should look something like this:

```
SOMETASK
├── backend/
├── public/
├── src/
├── GUIDE.md
├── package.json
└── vite.config.js
```

---

## Step 3 — Open 3 Terminals Inside VS Code

You need **3 separate terminal tabs** running at the same time.
Think of each terminal as a separate "worker" running one piece of the app.

**Open the first terminal:**
1. Click **Terminal** in the top menu bar
2. Click **New Terminal**
3. A panel opens at the bottom of VS Code — this is your terminal
4. It shows something like `PS D:\path\to\your\project>`

**Open a second terminal:**
1. Look at the terminal panel at the bottom
2. Click the **`+`** icon (top-right corner of the terminal panel)
3. A second terminal tab appears

**Open a third terminal:**
1. Click **`+`** again
3. A third terminal tab appears

You now have 3 terminals. You can switch between them by clicking the tabs
(they are labeled `pwsh` or `powershell 1`, `powershell 2`, `powershell 3`).

```
┌─────────────────── VS Code ─────────────────────┐
│  File  Edit  View  Terminal  Help                │
│ ┌────────────────────────────────────────────┐   │
│ │  EXPLORER                                  │   │
│ │  > backend/                               │   │
│ │  > src/                                   │   │
│ │  > public/                                │   │
│ │    package.json                           │   │
│ └────────────────────────────────────────────┘   │
│ ┌────────────────────────────────────────────┐   │
│ │  TERMINAL                           [+] [x]│   │
│ │  powershell 1 | powershell 2 | powershell 3│   │← click tabs to switch
│ │                                            │   │
│ │  PS D:\...\sometask>  _                   │   │
│ └────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

> **Keyboard shortcut:** Press `` Ctrl + ` `` (the backtick key, top-left of
> keyboard next to `1`) to show/hide the terminal panel.

---

## Step 4 — Terminal 1 — Start MongoDB

Click on **terminal tab 1** (or whichever is currently showing).

**First, check if MongoDB is already running** (common if you ran this before):

Click in the terminal and type exactly:
```
netstat -ano | findstr ":27017"
```
Press **Enter**.

- **If you see a line with LISTENING** → MongoDB is already running. Skip to Step 5.
- **If the output is blank** → MongoDB is not running. Continue below.

---

**Create the data folder** (only needed the very first time):

Type this and press Enter:
```
New-Item -ItemType Directory -Force "$env:USERPROFILE\sajag-mongo-data"
```

You should see output like:
```
    Directory: C:\Users\YourName

Mode                 LastWriteTime         Length Name
----                 -------------         ------
d----        09-06-2026    13:16              sajag-mongo-data
```
(If it says "already exists" — that's fine, it just means you already created it before.)

---

**Start MongoDB:**

Type this and press Enter:
```
& "C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe" --dbpath "$env:USERPROFILE\sajag-mongo-data" --port 27017 --bind_ip 127.0.0.1
```

> **Important:** Copy-paste this exactly. Do not change `$env:USERPROFILE` to `~`
> — the `~` shortcut does **not** work with MongoDB on Windows.

You will see a lot of lines with dates and codes. That is normal.

**Wait until you see this line** (scroll down to find it):
```
Waiting for connections on port 27017
```
Once you see that, MongoDB is ready.

**Leave this terminal running. Do not close it or press Ctrl+C.**

> **If you see "8.2" is not the right version:** Open File Explorer, navigate to
> `C:\Program Files\MongoDB\Server\` and see what version folder exists
> (e.g., `7.0` or `6.0`). Replace `8.2` in the command with your version number.

---

## Step 5 — Terminal 2 — Start the Backend API

Click on **terminal tab 2**.

**Navigate into the backend folder:**

Type this and press Enter:
```
cd backend
```

Your prompt should now end with `...\sometask\backend>`.

---

**Install the backend's packages** (only needed the first time):

Type this and press Enter:
```
npm install
```

You will see lots of text scrolling by. Wait for it to finish.
When done, you will see something like:
```
added 119 packages, and audited 120 packages in 1s
found 0 vulnerabilities
```

---

**Seed the database** (fill it with station data):

Type this and press Enter:
```
npm run seed
```

You should see:
```
✅ Connected → mongodb://localhost:27017/sajag_db
🧹 Cleared 0 existing station(s).
✅ Inserted 5 stations:
   🔴 EESL-BLR-001  BESCOM HQ Fast Charger     Bengaluru   risk=91
   🟠 EESL-BLR-002  Electronic City Hub        Bengaluru   risk=67
   🟢 EESL-NGP-001  MIHAN SEZ Charger          Nagpur      risk=14
   🟢 EESL-NGP-002  Civil Lines Charger        Nagpur      risk=9
   🟢 EESL-BLR-003  Whitefield ITPL Charger    Bengaluru   risk=19

🔎 Critical fault check (EESL-BLR-001):
   status            = critical
   rectifier_temp_c  = 84.2
   fan_vibration_hz  = 42.1
   ai_risk_score     = 91
   advisory[0].title = "Critical Thermal Runaway" (BLR_RECTIFIER_FAIL)

🎉 Seed complete.
🔌 Disconnected.
```

If you see `🎉 Seed complete.` — the database is ready.

---

**Start the backend server:**

Type this and press Enter:
```
npm run dev
```

You should see:
```
✅ MongoDB connected → mongodb://localhost:27017/sajag_db
🚀 API listening on http://localhost:5000
   Try:  http://localhost:5000/api/stations
```

**Leave this terminal running. Do not close it or press Ctrl+C.**

> **If you see `EADDRINUSE: address already in use :::5000`** → a previous
> server is still running. See [Port 5000 already in use](#port-5000-already-in-use) in Troubleshooting.

---

## Step 6 — Terminal 3 — Start the Frontend

Click on **terminal tab 3**.

**Make sure you are in the project root folder** (not inside `backend/`):

Look at your prompt. It should end with `...\sometask>` (not `...\sometask\backend>`).

If it shows `backend>`, type this and press Enter to go up one level:
```
cd ..
```

---

**Install the frontend's packages** (only needed the first time):

Type this and press Enter:
```
npm install
```

Wait for it to finish. You will see:
```
added 438 packages, and audited 439 packages in 12s
found 0 vulnerabilities
```

---

**Start the frontend:**

Type this and press Enter:
```
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in 300 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**Your browser should open automatically** to `http://localhost:5173`.

If it does not open automatically, open your browser (Chrome, Firefox, or Edge)
and type `http://localhost:5173` in the address bar, then press Enter.

**Leave this terminal running. Do not close it or press Ctrl+C.**

---

## Step 7 — Use the App

### The map loads — what am I looking at?

You should see a dark map of India covered in coloured dots.

- **Red pulsing dot** near Bengaluru = critical fault station (BESCOM HQ)
- **Orange pulsing dot** near Bengaluru = warning station (Electronic City)
- **Green dots** everywhere else = online stations

```
     ●  ●  ●  ←  green dots = online (thousands of EESL stations)
  ●    ●  ●
     ●
  Bengaluru ⟵  ⬤  ← red pulsing dot (EESL-BLR-001, critical fault)
               ◉  ← orange pulsing dot (EESL-BLR-002, warning)
       Nagpur ●  ●
```

---

### Confirm the backend is connected

1. Press **F12** to open Developer Tools in your browser
2. Click the **Console** tab
3. Look for this green line:
   ```
   [Sajag] Backend online — 5 managed stations loaded.
   ```
4. Press **F12** again to close Developer Tools

If you see that line, the frontend is successfully talking to your backend API.

---

### Demo walkthrough

**Click any station dot on the map.**
A panel slides in from the right showing:
- Station name and status
- Utilisation gauge
- Power output, energy today, revenue, sessions
- Sensor readings (rectifier temperature, fan vibration, etc.)
- 24-hour charts (click the "Charts" tab)
- Maintenance history (click the "Maintenance" tab)

**Click the red pulsing dot near Bengaluru** (BESCOM HQ).
This is the critical fault station. You will see:
- Status: **Critical** (red)
- AI Risk Score: **91/100**
- Rectifier Temp: **84.2 °C**
- Advisory card: **"Critical Thermal Runaway"** with an automated 50 kW throttle

**Click "Full View"** in the panel.
A full station detail page opens with all 6 KPIs and charts.

**Click "Launch Digital Twin".**
A 3D model of the charger opens. On the left panel:
- Expand the component tree: `Root → Cabinet Chassis → Power Conversion`
- Click **`rectifier_02`** — the right panel highlights the fault with exact
  sensor values, an alert card, and an action button
- Try the **Explode** slider at the bottom to pull the model apart
- Click **"Isolate Anomaly"** to auto-focus the critical component

**Use the Station Navigator** (right-side panel on the main map):
- Click **Critical** filter to show only fault stations
- Type a city name in the search box (e.g., "Nagpur")
- Click any station row to fly the map to it

---

## Step 8 — How to Stop Everything

When you are done, stop all three terminals in this order:

1. Click **terminal tab 3** (frontend) → press **Ctrl + C** → type `Y` if asked → press Enter
2. Click **terminal tab 2** (backend) → press **Ctrl + C** → type `Y` if asked → press Enter
3. Click **terminal tab 1** (MongoDB) → press **Ctrl + C** → type `Y` if asked → press Enter

All three processes are now stopped. You can close VS Code.

---

## Step 9 — How to Start Again Next Time

The next time you want to run the app, you do **not** need to run
`npm install` or `npm run seed` again. Just do:

1. Open VS Code → open the project folder
2. Open 3 terminal tabs (`` Ctrl + ` `` then the `+` button twice)
3. **Terminal 1** — check if MongoDB is already running:
   ```
   netstat -ano | findstr ":27017"
   ```
   - If you see a LISTENING line → skip the mongod command
   - If blank → start MongoDB:
     ```
     & "C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe" --dbpath "$env:USERPROFILE\sajag-mongo-data" --port 27017 --bind_ip 127.0.0.1
     ```
4. **Terminal 2** — start backend:
   ```
   cd backend
   npm run dev
   ```
5. **Terminal 3** — start frontend:
   ```
   npm run dev
   ```
6. Open `http://localhost:5173` in your browser

---

## Step 10 — Troubleshooting

---

### "mongod is not recognized as a command"

MongoDB was installed but its folder was not added to your system PATH.

**Quick fix:** Use the full path instead of just `mongod`:
```powershell
& "C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe" --dbpath "$env:USERPROFILE\sajag-mongo-data" --port 27017 --bind_ip 127.0.0.1
```
Replace `8.2` with whatever version you installed (check
`C:\Program Files\MongoDB\Server\` in File Explorer).

---

### MongoDB shows "DBPathInUse" or "lock file in use"

This is **not an error**. It means MongoDB is already running in the
background (perhaps from a previous session that you didn't stop).

**What to do:** Skip the mongod command entirely and go straight to Step 5.

To double-check: run `netstat -ano | findstr ":27017"` — if you see
LISTENING, MongoDB is running fine.

---

### "NonExistentPath: Data directory ~/sajag-mongo-data not found"

You used `~` in the mongod command. On Windows, `~` does not work with
`mongod.exe` — you must use the full path.

**Fix:** Copy-paste this exact command (the `$env:USERPROFILE` part
automatically becomes your real username):
```powershell
& "C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe" --dbpath "$env:USERPROFILE\sajag-mongo-data" --port 27017 --bind_ip 127.0.0.1
```

---

### Port 5000 already in use

`npm run dev` (backend) crashes with:
```
Error: listen EADDRINUSE: address already in use :::5000
```

This means a previous backend server is still running. Kill it:

1. In any terminal, type:
   ```
   netstat -ano | findstr ":5000"
   ```
   Press Enter. Look for the last number on the LISTENING line — that is the
   PID (Process ID). For example:
   ```
   TCP    0.0.0.0:5000    0.0.0.0:0    LISTENING    50228
                                                     ^^^^^
                                                     this is the PID
   ```

2. Kill that process (replace `50228` with your actual PID):
   ```
   taskkill /F /PID 50228
   ```
   Press Enter. You should see `SUCCESS: The process with PID 50228 has been terminated.`

3. Now run `npm run dev` again in terminal 2.

---

### The frontend starts but the browser stays blank / white

Wait 5–10 seconds. Vite takes a moment to compile everything on the first run.
If it stays blank after 30 seconds, press **F5** (or **Ctrl+Shift+R**) to
hard-refresh the browser.

---

### The map loads but shows only green dots — no red/orange pulsing stations

The frontend did not connect to the backend API.

**Check:**
1. Is terminal 2 (backend) still running? You should see
   `🚀 API listening on http://localhost:5000`.
2. Press F12 in the browser and look at the Console tab — do you see any
   red error messages?
3. Open a new browser tab and go to `http://localhost:5000/api/stations`.
   You should see a JSON response with `"count": 5`.

If step 3 shows an error, the backend is not running. Go back to terminal 2
and run `npm run dev` inside the `backend/` folder.

---

### "Cannot connect to MongoDB" in the backend terminal

The backend logs:
```
MongoNetworkError: connect ECONNREFUSED 127.0.0.1:27017
```

MongoDB is not running. Go to terminal 1 and start it (see Step 4).

---

### npm install fails with "permission denied"

Right-click the VS Code icon → **Run as Administrator** → try `npm install` again.

---

### The 3D Digital Twin shows a black screen

Your browser needs WebGL (3D graphics support). Make sure you are using a
recent version of Chrome, Firefox, or Edge. If you are on a remote desktop
or VM, hardware acceleration may be disabled — enable it in the browser
settings:
- Chrome: go to `chrome://settings/system` → turn on "Use hardware acceleration"
- Edge: go to `edge://settings/system` → turn on "Use hardware acceleration"

---

### Still stuck?

Open a new terminal in VS Code and run:
```
node --version && npm --version && mongod --version
```
Send the output (three version lines) along with a description of what step
you are stuck on.

---

*End of guide.*
