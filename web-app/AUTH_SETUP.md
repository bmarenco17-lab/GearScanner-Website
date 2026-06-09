# GearScanner Auth Setup

## Step 1 — Enable Email/Password Auth in Firebase Console

1. Go to https://console.firebase.google.com → **bmargearscanner** project
2. Click **Authentication** → **Sign-in method**
3. Enable **Email/Password**
4. Save

---

## Step 2 — Create the Demo Account

1. In Firebase Console → **Authentication** → **Users** → **Add user**
2. Email: `demogearscanner@gmail.com`
3. Password: `demo1234`
4. Save

---

## Step 3 — Create the Admin Account

1. In Firebase Console → **Authentication** → **Users** → **Add user**
2. Email: `admin@gearscanner.com`
3. Password: `FireAdmin2024!`  ← change this to something only you know
4. Save

---

## Step 4 — Apply Firestore Security Rules

1. In Firebase Console → **Firestore Database** → **Rules**
2. Replace the contents with what's in `firestore.rules`
3. Click **Publish**

---

## Step 5 — Install Dependencies & Run

```bash
cd web-app/frontend
npm install
npm run dev
```

---

## Account Summary

| Account | Email | Password | Role |
|---------|-------|----------|------|
| Demo | demogearscanner@gmail.com | demo1234 | Demo (Riverside FD, 90 records, resets 24h) |
| Admin | admin@gearscanner.com | *(you set this)* | Admin (sees all departments) |
| Departments | signup via app | *(they choose)* | Full access to own data only |
