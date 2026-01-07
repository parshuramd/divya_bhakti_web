# 🙏 Divya Bhakti Store

A production-ready devotional e-commerce web application built with Next.js 14, featuring a beautiful UI, multi-language support (English + Marathi), and comprehensive admin panel.

![Divya Bhakti Store](https://images.unsplash.com/photo-1532767153582-b1a0e5145009?w=1200)

## ✨ Features

### Public Store
- 🏠 Beautiful responsive home page with hero banner
- 📦 Product catalog with categories and filters
- 🔍 Search functionality
- 🛒 Shopping cart with real-time updates
- ❤️ Wishlist functionality
- 👤 User authentication (Email + OTP)
- 📍 Multiple address management
- 💳 Secure checkout (Razorpay + COD)
- 📋 Order tracking

### Admin Panel
- 📊 Dashboard with analytics
- 📦 Product management (CRUD)
- 🏷️ Category management
- 📑 Order management
- 🎟️ Coupon management
- 🖼️ Banner management
- 📄 CMS for legal pages

### Technical Features
- 🌐 Internationalization (English + Marathi)
- 📱 Mobile-first responsive design
- 🎨 Tailwind CSS with custom devotional theme
- 🔐 Secure authentication with NextAuth
- 💾 PostgreSQL with Prisma ORM
- 📧 Email notifications (Resend/Nodemailer)
- 🚚 Shiprocket shipping integration
- 💰 Razorpay payment gateway

## 🚀 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Shadcn UI
- **State Management:** Zustand
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** NextAuth.js
- **Payments:** Razorpay
- **Shipping:** Shiprocket
- **i18n:** next-intl
- **Email:** Resend / Nodemailer

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn or pnpm
- PostgreSQL database
- Razorpay account (for payments)
- Shiprocket account (for shipping)
- Resend account (for emails) OR SMTP credentials

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/divya-bhakti-store.git
cd divya-bhakti-store
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Set up environment variables

Copy the example env file and update with your values:

```bash
cp env.example .env
```

Update the `.env` file with your credentials:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/divya_bhakti_store"

# NextAuth
NEXTAUTH_SECRET="your-super-secret-key-change-in-production"
NEXTAUTH_URL="http://localhost:3000"

# Email (Resend)
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxx"
EMAIL_FROM="Divya Bhakti Store <noreply@divyabhaktistore.com>"

# OR Email (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Razorpay
RAZORPAY_KEY_ID="rzp_test_xxxxxxxxxxxx"
RAZORPAY_KEY_SECRET="xxxxxxxxxxxxxxxxxxxx"

# Shiprocket
SHIPROCKET_EMAIL="your-shiprocket-email"
SHIPROCKET_PASSWORD="your-shiprocket-password"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Set up the database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed the database with sample data
npm run db:seed
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
divya-bhakti-store/
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Seed data script
├── src/
│   ├── app/
│   │   ├── (store)/        # Public store routes
│   │   ├── admin/          # Admin panel routes
│   │   ├── api/            # API routes
│   │   └── layout.tsx      # Root layout
│   ├── components/
│   │   ├── ui/             # Shadcn UI components
│   │   ├── layout/         # Header, Footer
│   │   ├── product/        # Product components
│   │   ├── cart/           # Cart components
│   │   └── common/         # Shared components
│   ├── lib/
│   │   ├── prisma.ts       # Prisma client
│   │   ├── auth.ts         # Auth configuration
│   │   ├── utils.ts        # Utility functions
│   │   ├── validations.ts  # Zod schemas
│   │   ├── email.ts        # Email utilities
│   │   └── shiprocket.ts   # Shipping integration
│   ├── store/
│   │   └── cart-store.ts   # Zustand stores
│   ├── types/
│   │   └── index.ts        # TypeScript types
│   ├── messages/
│   │   ├── en.json         # English translations
│   │   └── mr.json         # Marathi translations
│   └── i18n.ts             # i18n configuration
├── public/                  # Static assets
├── package.json
├── tailwind.config.ts
└── next.config.js
```

## 🔑 Default Admin Credentials

After running the seed script:

- **Email:** admin@divyabhaktistore.com
- **Password:** Admin@123

⚠️ **Important:** Change these credentials in production!

## 🚢 Deployment

### Vercel (Recommended for Next.js)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

```bash
# Or use Vercel CLI
vercel --prod
```

### Railway (Database)

1. Create a new PostgreSQL database on Railway
2. Copy the connection URL
3. Update `DATABASE_URL` in Vercel environment variables

### Supabase (Alternative Database)

1. Create a new project on Supabase
2. Get the PostgreSQL connection URL from Settings > Database
3. Update `DATABASE_URL` in your environment

## 🔧 Configuration

### Razorpay Setup

1. Create a Razorpay account at [razorpay.com](https://razorpay.com)
2. Get API keys from Dashboard > Settings > API Keys
3. For testing, use test mode keys
4. For webhooks, set up endpoint: `https://yourdomain.com/api/razorpay/webhook`

### Shiprocket Setup

1. Create a Shiprocket account at [shiprocket.in](https://shiprocket.in)
2. Get credentials from Settings
3. Set up pickup location in Shiprocket dashboard
4. Note: This integration works in no-GST mode

### Email Setup

**Using Resend (Recommended):**
1. Create account at [resend.com](https://resend.com)
2. Verify your domain
3. Create API key

**Using Gmail SMTP:**
1. Enable 2FA on your Google account
2. Generate an App Password
3. Use App Password as `SMTP_PASS`

## 🧪 Sample Data

The seed script creates:
- 1 Admin user
- 6 Categories (Idols, Mala, Incense, Photos, Puja, Books)
- 14 Sample products with images
- 2 Banners
- 3 Coupon codes (WELCOME10, DIVYA50, FESTIVE20)
- Legal pages (About, Privacy, Terms, Refund)

## 📝 Available Scripts

```bash
# Development
npm run dev          # Start development server

# Build
npm run build        # Build for production
npm run start        # Start production server

# Database
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:migrate   # Run migrations
npm run db:seed      # Seed database
npm run db:studio    # Open Prisma Studio

# Linting
npm run lint         # Run ESLint
```

## 🎨 Customization

### Theme Colors

The theme uses a devotional color palette defined in `tailwind.config.ts`:

- **Saffron:** Primary brand color (#f97316)
- **Maroon:** Accent color (#ab2347)
- **Gold:** Highlight color (#eab308)

### Adding New Languages

1. Create a new message file in `src/messages/[locale].json`
2. Add the locale to `src/i18n.ts`
3. Update the language switcher component

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting a PR.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn UI](https://ui.shadcn.com/)
- [Prisma](https://prisma.io/)
- [Unsplash](https://unsplash.com/) for sample images

---

Made with ❤️ in India for devotees everywhere.

🙏 **|| श्री गणेशाय नमः ||**

