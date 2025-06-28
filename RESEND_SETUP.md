# Resend Email Setup για τη Φόρμα Επικοινωνίας

## Βήματα Setup

### 1. Δημιουργία Resend Account
1. Πήγαινε στο [resend.com](https://resend.com)
2. Δημιούργησε λογαριασμό
3. Πάρε το API Key από το dashboard

### 2. Domain Verification (Προαιρετικό)
Για να στέλνεις από `noreply@dsuth.gr`:
1. Πρόσθεσε το domain `dsuth.gr` στο Resend
2. Επιβεβαίωσε το domain με τα DNS records
3. Αναμονή για verification (μπορεί να πάρει 24 ώρες)

### 3. Supabase Environment Variables
Πρόσθεσε στο Supabase Dashboard > Settings > Edge Functions:

```
RESEND_API_KEY=re_your_api_key_here
```

### 4. Deploy Edge Function
```bash
supabase functions deploy send-contact-email
```

### 5. Test Email
1. Πήγαινε στη σελίδα επικοινωνίας
2. Συμπλήρωσε τη φόρμα
3. Στείλε το μήνυμα
4. Έλεγξε το Gmail σου (vaggelismpomponis@gmail.com)

## Troubleshooting

### Αν δεν λειτουργεί:
1. **Έλεγξε τα logs**: `supabase functions logs send-contact-email`
2. **Επιβεβαίωσε το API Key**: Στο Resend dashboard
3. **Έλεγξε τα environment variables**: Στο Supabase
4. **Test με curl**:
```bash
curl -X POST https://your-project.supabase.co/functions/v1/send-contact-email \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","subject":"Test","message":"Test message"}'
```

### Αν θέλεις να αλλάξεις το recipient email:
Επεξεργάσου το αρχείο `supabase/functions/send-contact-email/index.ts` και άλλαξε τη γραμμή:
```typescript
to: "vaggelismpomponis@gmail.com", // Αλλάξε εδώ
```

## Email Template
Τα emails θα έχουν:
- **Subject**: "Νέο μήνυμα επικοινωνίας: [Θέμα]"
- **Content**: Όνομα, Email, Θέμα, Μήνυμα σε HTML format
- **Footer**: Αναφορά στο DS UTH Τράπεζα Θεμάτων

## Security
- ✅ Email validation
- ✅ Required fields validation
- ✅ CORS headers
- ✅ Error handling
- ✅ Rate limiting (από το Resend) 