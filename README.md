# FinanceCalc Public 💎

A modern, high-performance, offline-first personal spending and finance tracker built with **React 19**, **TypeScript**, **Tailwind CSS**, and **Electron**.

Features a **Deep Emerald Liquid Glassmorphism** design, custom display typography, and real-time spending analytics formatted in INR (₹).

---

## 🌟 Key Features

- 🔒 **100% Private & Offline-First**: No cloud sync, no tracking, zero telemetry. All data is saved locally on your machine.
- 💎 **Emerald Liquid Glassmorphism**: Frosted glass surfaces (`backdrop-blur-2xl`), animated ambient lighting orbs, and high-contrast dark theme.
- 📊 **Real-Time Analytics & Budgets**:
  - Live net outflow tracking & spending velocity
  - Category portfolio breakdown with budget threshold indicators
  - Payment split metrics (UPI / Digital vs Physical Cash)
- 📝 **Spend Logger**: Log transactions with merchant, note, category badge, date, time, and payment method.
- 🗂️ **Category Manager**: Add, edit, or customize spending categories with custom colors and budget limits.
- 📄 **Report Exporting**: Export transaction logs to formatted PDF reports or CSV spreadsheets.
- 🛡️ **Optional App Lock**: Client-side password protection with PIN/Master key support.

---

## 🚀 Quick Start

### 1. Installation
Clone or open this repository, then install dependencies:
```bash
npm install
```

### 2. Run in Development Mode
Launch the web interface:
```bash
npm run dev
```

Launch the standalone desktop application in dev mode:
```bash
npm run electron:dev
```

### 3. Build & Run Standalone Desktop App
Compile production assets:
```bash
npm run build
```

Launch native desktop app:
```bash
npx electron .
```

---

## 💾 Local Data Storage

- On the first run, FinanceCalc initializes with clean demo records and automatically creates a local database file on your system.
- In desktop mode, data is saved atomically to your user profile directory:
  - **Windows**: `%APPDATA%\financecalc-public\finance_data_store.json`
- In browser mode, data persists to the browser's `localStorage`.

---

## 📜 License

MIT License. Free for personal, educational, and commercial customization.
