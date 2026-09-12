# Tubigon Express — Direct Food Ordering + Rider + Chat Support

Mobile app starter for iOS/Android using Expo React Native + Supabase.

## Roles
- Customer: choose food, cart, delivery address, place direct order, live tracking, chat support.
- Rider: see pending orders, accept, pickup, on-the-way, delivered.
- Admin: manage food/catalog, customers, riders, orders, and support conversations (admin panel can be added next).

There are **no restaurant/store accounts**.

## Setup
1. Create a Supabase project.
2. Copy `.env.example` to `.env` and add your Supabase URL and anon key.
3. Run `supabase/schema.sql` in Supabase SQL Editor.
4. `npm install`
5. `npx expo start`

The app uses Supabase Realtime for order updates and the support chat.

## Production
Before App Store/Google Play release, add production payment, push notifications, maps/location permissions, moderation/reporting, privacy policy, terms, and production build/signing.

## Vercel Web Deployment
See `VERCEL_DEPLOYMENT.md` for the deployment steps.
