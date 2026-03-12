# Divya Bhakti Store — Production Deployment Guide

## Choose Your Deployment Path

| Option | Cost | Difficulty | Best For |
|--------|------|------------|----------|
| **Vercel + Neon** | Free tier available | Easy | Fastest to go live |
| **VPS + Docker** | ~$5-10/mo | Medium | Full control |
| **Railway** | Pay-as-you-go | Easy | Simple Docker deploy |

---

## Option A: Vercel + Neon (Recommended)

### Step 1: Set Up Production Database (Neon - Free)

1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project → name it `divya-bhakti-store`
3. Copy the connection string — it looks like:
   ```
   postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/divya_bhakti_store?sslmode=require
   ```

### Step 2: Set Up Razorpay Live Keys

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Complete KYC verification (required for live payments)
3. Switch to **Live Mode** (toggle at top)
4. Go to Settings → API Keys → Generate Live Key
5. Note down your `key_id` (starts with `rzp_live_`) and `key_secret`
6. Go to Settings → Webhooks → Add:
   - URL: `https://yourdomain.com/api/razorpay/webhook`
   - Events: `payment.captured`, `payment.failed`, `refund.created`
   - Copy the webhook secret

### Step 3: Set Up Email (Resend)

1. Go to [resend.com](https://resend.com) and create account
2. Add & verify your domain (divyabhaktistore.com)
3. Create an API key
4. Set `EMAIL_FROM` to `Divya Bhakti Store <noreply@divyabhaktistore.com>`

### Step 4: Set Up Cloudinary

1. Go to [cloudinary.com](https://cloudinary.com) → sign up (free tier: 25GB)
2. Copy Cloud Name, API Key, API Secret from Dashboard

### Step 5: Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy (follow prompts)
vercel

# Set environment variables (do this for EACH variable)
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add NEXTAUTH_URL production
# ... repeat for all variables below

# Deploy to production
vercel --prod
```

### Step 6: Set ALL Environment Variables in Vercel

Go to Vercel Dashboard → Project → Settings → Environment Variables.
Add each of these for the **Production** environment:

```env
# Database (from Neon)
DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/divya_bhakti_store?sslmode=require"

# Auth (generate a new secret: openssl rand -base64 32)
NEXTAUTH_SECRET="<generate-new-strong-secret>"
NEXTAUTH_URL="https://divyabhaktistore.com"

# Razorpay LIVE keys
RAZORPAY_KEY_ID="rzp_live_xxxxxxxxxxxx"
RAZORPAY_KEY_SECRET="your-live-secret"
RAZORPAY_WEBHOOK_SECRET="your-webhook-secret"
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_live_xxxxxxxxxxxx"

# Email (Resend)
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxx"
EMAIL_FROM="Divya Bhakti Store <noreply@divyabhaktistore.com>"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Shiprocket (if using)
SHIPROCKET_EMAIL="your-shiprocket-email"
SHIPROCKET_PASSWORD="your-shiprocket-password"
SHIPROCKET_API_URL="https://apiv2.shiprocket.in/v1/external"

# App
NEXT_PUBLIC_APP_URL="https://divyabhaktistore.com"
NEXT_PUBLIC_APP_NAME="Divya Bhakti Store"

# Contact
NEXT_PUBLIC_SUPPORT_EMAIL="support@divyabhaktistore.com"
NEXT_PUBLIC_SUPPORT_PHONE="+91XXXXXXXXXX"
NEXT_PUBLIC_WHATSAPP_NUMBER="91XXXXXXXXXX"
NEXT_PUBLIC_STORE_ADDRESS="Your real store address"

# Social Media
NEXT_PUBLIC_FACEBOOK_URL="https://facebook.com/divyabhaktistore"
NEXT_PUBLIC_INSTAGRAM_URL="https://instagram.com/divyabhaktistore"
NEXT_PUBLIC_TWITTER_URL="https://twitter.com/divyabhaktistore"
NEXT_PUBLIC_YOUTUBE_URL="https://youtube.com/@divyabhaktistore"

# Admin
ADMIN_EMAIL="admin@divyabhaktistore.com"
ADMIN_PASSWORD="<strong-password-here>"
ADMIN_NOTIFICATION_EMAIL="your-real-email@gmail.com"
```

### Step 7: Push Database Schema & Seed

```bash
# Set DATABASE_URL to your Neon production URL temporarily
export DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/divya_bhakti_store?sslmode=require"

# Push schema
npx prisma db push

# Seed initial data (admin user, categories, etc.)
npx prisma db seed

# Generate Prisma migrations for future changes
npx prisma migrate dev --name init
```

### Step 8: Connect Your Domain

1. In Vercel Dashboard → Project → Settings → Domains
2. Add `divyabhaktistore.com` and `www.divyabhaktistore.com`
3. Update DNS at your domain registrar:
   - `A` record: `76.76.21.21`
   - `CNAME` for `www`: `cname.vercel-dns.com`
4. Vercel auto-provisions SSL certificates

### Step 9: Post-Deploy Verification

- [ ] Homepage loads correctly
- [ ] Products display with images
- [ ] User can register/login via OTP
- [ ] Add to cart works
- [ ] Checkout with COD works
- [ ] Checkout with Razorpay works (use test card: 4111 1111 1111 1111)
- [ ] Order confirmation email is received
- [ ] Admin panel loads at /admin
- [ ] Admin can update order status
- [ ] Customer receives status update email
- [ ] WhatsApp button links to correct number
- [ ] All legal pages load (privacy, terms, refund, shipping)

---

## Option B: VPS with Docker (DigitalOcean/Hetzner)

### Step 1: Provision a Server

- DigitalOcean Droplet ($6/mo) or Hetzner VPS (€4/mo)
- Ubuntu 22.04, 1GB RAM minimum
- Enable firewall: allow ports 22, 80, 443

### Step 2: Install Docker

```bash
ssh root@your-server-ip

# Install Docker
curl -fsSL https://get.docker.com | sh
apt install -y docker-compose-plugin

# Install Nginx + Certbot for SSL
apt install -y nginx certbot python3-certbot-nginx
```

### Step 3: Clone & Configure

```bash
git clone https://github.com/your-repo/divya-bhakti-store.git
cd divya-bhakti-store

# Create production .env
cp env.example .env
nano .env  # Fill in ALL production values
```

### Step 4: Deploy with Docker Compose

```bash
# Build and start
docker compose up -d --build

# Push schema & seed
docker compose exec app npx prisma db push
docker compose exec app npx prisma db seed
```

### Step 5: Configure Nginx + SSL

```nginx
# /etc/nginx/sites-available/divyabhaktistore.com
server {
    server_name divyabhaktistore.com www.divyabhaktistore.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
ln -s /etc/nginx/sites-available/divyabhaktistore.com /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
certbot --nginx -d divyabhaktistore.com -d www.divyabhaktistore.com
```

---

## Critical Security Checklist

- [ ] Generate new `NEXTAUTH_SECRET` (`openssl rand -base64 32`)
- [ ] Change admin password from `Admin@123` to something strong
- [ ] Use Razorpay LIVE keys (not test)
- [ ] Set `NEXTAUTH_URL` to your real domain (not localhost)
- [ ] Set `NEXT_PUBLIC_APP_URL` to your real domain
- [ ] Verify `.env` is in `.gitignore` (never commit secrets)
- [ ] Set up Razorpay webhook with your production URL
- [ ] Replace all placeholder contact info with real values
- [ ] Upload real product images to Cloudinary
- [ ] Add real OG image at `/public/og-image.jpg` (1200x630px)

## Domain & DNS Checklist

- [ ] Buy domain (e.g., divyabhaktistore.com via Namecheap/GoDaddy)
- [ ] Point DNS to hosting provider
- [ ] SSL certificate active (auto with Vercel, Certbot for VPS)
- [ ] Verify Google Search Console (add `GOOGLE_SITE_VERIFICATION`)
- [ ] Submit sitemap: `https://divyabhaktistore.com/sitemap.xml`

## After Going Live

1. **Monitor**: Check Vercel/server logs for errors
2. **Test a real order**: Place a small test order with real payment
3. **Google Search Console**: Submit sitemap, monitor indexing
4. **Analytics**: Vercel Analytics is already integrated
5. **Backups**: Set up daily database backups (Neon does this automatically)
