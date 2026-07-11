# NOLANCE — The World's Greatest Freelancing Platform

Built by **Joshua Eniola**

## 🚀 Quick Start

### 1. Clone and install
```bash
cd nolance
npm install
```

### 2. Set up environment variables
```bash
cp .env.example .env.local
# Fill in all values in .env.local
```

### 3. Set up Supabase
1. Create a project at supabase.com
2. Go to SQL Editor and run the full `schema.sql` file
3. Copy your project URL and anon key to `.env.local`

### 4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Homepage
│   ├── auth/               # Login, signup, verify, reset
│   ├── dashboard/          # Dashboard hub, orders, messages, earnings
│   ├── explore/            # Browse gigs
│   ├── gig/[slug]/         # Single gig page
│   ├── orders/             # Orders list + detail
│   ├── scout/              # Scout section
│   ├── marketplace/        # Marketplace
│   ├── community/          # Communities
│   ├── directory/          # Business directory
│   ├── managed/            # Managed services
│   ├── settings/           # Account settings
│   └── api/                # All API routes
│       ├── auth/           # Signup, login, verify, reset
│       ├── gigs/           # CRUD + search
│       ├── orders/         # Place, deliver, complete
│       ├── payments/       # Paystack + Stripe
│       ├── messages/       # Conversations + chat
│       ├── scout/          # Jobs + proposals
│       ├── marketplace/    # Listings
│       ├── community/      # Posts + members
│       ├── directory/      # Businesses
│       ├── managed/        # Managed requests
│       ├── reviews/        # Submit + respond
│       ├── disputes/       # Open + appeal
│       ├── notifications/  # List + mark read
│       ├── withdrawals/    # Request + methods
│       ├── users/          # Profile + phone
│       └── webhooks/       # Paystack + Stripe
├── components/
│   ├── ui/                 # Button, Input, Avatar, Badge, etc.
│   ├── layout/             # Navbar, Footer
│   ├── gigs/               # Gig-specific components
│   └── shared/             # Shared components
├── lib/
│   ├── supabase/           # Client + server
│   ├── auth/               # Middleware
│   ├── email/              # All email templates
│   ├── sms/                # Twilio SMS
│   └── ai/                 # Market AI
├── store/                  # Zustand stores
├── types/                  # TypeScript types
└── utils/                  # Helper functions
```

---

## 🗄️ Database

Run `schema.sql` in Supabase SQL Editor. It creates:
- **76 tables** covering every feature
- **30 indexes** for performance
- **11 triggers** for automation
- Row Level Security on all sensitive tables

---

## 💳 Payment Setup

### Paystack (Nigeria)
1. Create account at paystack.com
2. Get test keys from dashboard
3. Add to `.env.local`
4. Set webhook URL: `https://yourdomain.com/api/webhooks/paystack`

### Stripe (Global)
1. Create account at stripe.com
2. Get test keys from dashboard
3. Add to `.env.local`
4. Set webhook URL: `https://yourdomain.com/api/webhooks/stripe`

---

## 📧 Email Setup (Resend — recommended)
1. Create account at resend.com
2. Add your domain
3. Get API key
4. Add to `.env.local` as `EMAIL_PASSWORD`

---

## 📱 SMS Setup (Twilio)
1. Create account at twilio.com
2. Get a phone number
3. Add credentials to `.env.local`

---

## ☁️ File Storage (Cloudinary)
1. Create account at cloudinary.com
2. Get cloud name and API keys
3. Add to `.env.local`

---

## 🏗️ Build Order (Solo Developer)

Build sections in this order:
1. ✅ Database schema (done — `schema.sql`)
2. ✅ Authentication (done — `/auth/*`)
3. ✅ Homepage (done — `/`)
4. ✅ Gig system (done — `/gig/*`, `/explore`)
5. ✅ Orders (done — `/orders/*`)
6. ✅ Payments (done — `/api/payments/*`)
7. ✅ Messages (done — `/dashboard/messages`)
8. ✅ Earnings & Withdrawals (done — `/dashboard/earnings`)
9. 🔲 Scout section (`/scout/*`)
10. 🔲 Marketplace (`/marketplace/*`)
11. 🔲 Community (`/community/*`)
12. 🔲 Business Directory (`/directory/*`)
13. 🔲 Managed Services (`/managed/*`)
14. 🔲 Admin panel
15. 🔲 Mobile app (React Native)

---

## 🔒 Commission Rates

| Section | Nolance | Seller |
|---|---|---|
| Gigs | 15% | 85% |
| Scout | 15% | 85% |
| Scout-to-Business | 10% | 90% |
| Marketplace | 5% | 95% |
| Managed Services | 25% | 75% |
| Community | 0% | Free |

---

## ⏱️ Fund Clearance

| Level | Days |
|---|---|
| New Seller | 10 |
| Level 1 | 7 |
| Nolance Plus | 5 |
| Level 2 | 3 |
| Top Rated | 24h |
| Pro Verified | 24h |

---

## 🌍 Deployment

### Vercel (Recommended)
```bash
npm run build
vercel deploy
```

### Environment Variables on Vercel
Add all variables from `.env.example` to your Vercel project settings.

---

Built with ❤️ by Joshua Eniola
© 2026 Nolance. All rights reserved.
