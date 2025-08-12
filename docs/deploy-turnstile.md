# Turnstile Edge Function Deployment Guide

## Εναλλακτικοί τρόποι εγκατάστασης Supabase CLI

### Μέθοδος 1: Με npm (αν δεν λειτουργεί global)
```bash
npm install supabase --save-dev
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase secrets set TURNSTILE_SECRET_KEY=YOUR_SECRET_KEY_HERE
npx supabase functions deploy verify-turnstile
```

### Μέθοδος 2: Με Windows Package Manager (winget)
```bash
winget install Supabase.CLI
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase secrets set TURNSTILE_SECRET_KEY=YOUR_SECRET_KEY_HERE
supabase functions deploy verify-turnstile
```

### Μέθοδος 3: Με Chocolatey
```bash
choco install supabase
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase secrets set TURNSTILE_SECRET_KEY=YOUR_SECRET_KEY_HERE
supabase functions deploy verify-turnstile
```

### Μέθοδος 4: Manual Download
1. Πήγαινε στο https://github.com/supabase/cli/releases
2. Κατέβασε το `supabase_windows_amd64.exe`
3. Μετονομασέ το σε `supabase.exe`
4. Βάλτο στο PATH ή χρησιμοποίησέ το απευθείας

## Βήματα Deployment

### 1. Πάρε το Secret Key
- Πήγαινε στο [Cloudflare Turnstile Dashboard](https://dash.cloudflare.com/)
- Βρες το **Secret Key** (όχι το Site Key)

### 2. Βρες το Project Reference
- Πήγαινε στο [Supabase Dashboard](https://supabase.com/dashboard)
- Επίλεξε το project σου
- Κόπιαρε το Project Reference (π.χ. `abcdefghijklmnop`)

### 3. Εκτέλεσε τα Commands
```bash
# Login στο Supabase
supabase login

# Link το project
supabase link --project-ref YOUR_PROJECT_REF

# Set το secret key
supabase secrets set TURNSTILE_SECRET_KEY=YOUR_SECRET_KEY_HERE

# Deploy το function
supabase functions deploy verify-turnstile
```

### 4. Test το Function
Μετά το deployment, το function θα είναι διαθέσιμο στο:
```
https://YOUR_PROJECT_REF.supabase.co/functions/v1/verify-turnstile
```

## Troubleshooting

### Αν δεν μπορείς να εγκαταστήσεις το CLI:
1. Δοκίμασε τις εναλλακτικές μεθόδους παραπάνω
2. Ελέγξε αν έχεις Node.js v18+ εγκατεστημένο
3. Δοκίμασε να τρέξεις PowerShell ως Administrator

### Αν το deployment αποτυγχάνει:
1. Ελέγξε αν είσαι logged in στο Supabase
2. Βεβαιώσου ότι το project reference είναι σωστό
3. Ελέγξε αν το secret key είναι σωστό

## Εναλλακτική: Manual Deployment via Supabase Dashboard

Αν δεν μπορείς να χρησιμοποιήσεις το CLI:

1. Πήγαινε στο [Supabase Dashboard](https://supabase.com/dashboard)
2. Επίλεξε το project σου
3. Πήγαινε στο Edge Functions
4. Create New Function
5. Copy-paste τον κώδικα από το `supabase/functions/verify-turnstile/index.ts`
6. Set το environment variable `TURNSTILE_SECRET_KEY` στο Settings 