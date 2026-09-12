# Tubigon Express — Vercel Deployment

## 1. Install
```bash
npm install
```

## 2. Configure Supabase
Run `supabase/schema.sql` in your Supabase SQL Editor.

Create `.env` from `.env.example`:
```env
EXPO_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

Never put a Supabase service-role/private key in the browser app.

## 3. Test the web build
```bash
npm run web:build
```
The production website files will be created in `dist/`.

## 4. Deploy to Vercel
Recommended:
1. Put this project in a GitHub repository.
2. Sign in to Vercel and import the GitHub repository.
3. Build Command: `npm run web:build`
4. Output Directory: `dist`
5. Add these Vercel Environment Variables:
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
6. Deploy.

Vercel will give you a public `vercel.app` URL.

## 5. Production checklist
Test customer signup/login, rider signup/login, ordering, delivery address,
realtime order updates, rider acceptance/status changes, and Chat Support.
Review Supabase Row Level Security before accepting real orders.

This package is deployment-prepared, but production testing/security review is
still required before handling real customer data, payments, or live deliveries.
