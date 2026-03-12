#!/usr/bin/env bash
# =============================================================
# Divya Bhakti Store — Production Deployment Checklist
# =============================================================
# Usage: bash scripts/pre-deploy-check.sh

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo "🕉  Divya Bhakti Store — Pre-Deployment Check"
echo "================================================"
echo ""

ERRORS=0
WARNINGS=0

check_env() {
  local var_name=$1
  local is_required=$2
  local value=$(grep "^${var_name}=" .env 2>/dev/null | cut -d'=' -f2- | tr -d '"')

  if [ -z "$value" ]; then
    if [ "$is_required" = "required" ]; then
      echo -e "  ${RED}✗ ${var_name} — MISSING (required)${NC}"
      ERRORS=$((ERRORS + 1))
    else
      echo -e "  ${YELLOW}⚠ ${var_name} — not set (optional)${NC}"
      WARNINGS=$((WARNINGS + 1))
    fi
  else
    if echo "$value" | grep -qiE "(xxxx|your-|change-in-production|password@localhost)"; then
      echo -e "  ${YELLOW}⚠ ${var_name} — looks like a placeholder${NC}"
      WARNINGS=$((WARNINGS + 1))
    else
      echo -e "  ${GREEN}✓ ${var_name}${NC}"
    fi
  fi
}

echo "1️⃣  Checking environment variables..."
echo ""
echo "  ${BLUE}Core:${NC}"
check_env "DATABASE_URL" "required"
check_env "NEXTAUTH_SECRET" "required"
check_env "NEXTAUTH_URL" "required"
echo ""
echo "  ${BLUE}Payment:${NC}"
check_env "RAZORPAY_KEY_ID" "required"
check_env "RAZORPAY_KEY_SECRET" "required"
check_env "RAZORPAY_WEBHOOK_SECRET" "optional"
check_env "NEXT_PUBLIC_RAZORPAY_KEY_ID" "required"
echo ""
echo "  ${BLUE}Email:${NC}"
check_env "RESEND_API_KEY" "optional"
check_env "EMAIL_FROM" "optional"
check_env "SMTP_HOST" "optional"
echo ""
echo "  ${BLUE}Media:${NC}"
check_env "CLOUDINARY_CLOUD_NAME" "optional"
check_env "CLOUDINARY_API_KEY" "optional"
check_env "CLOUDINARY_API_SECRET" "optional"
echo ""
echo "  ${BLUE}Public:${NC}"
check_env "NEXT_PUBLIC_APP_URL" "required"
check_env "NEXT_PUBLIC_APP_NAME" "optional"
check_env "NEXT_PUBLIC_SUPPORT_EMAIL" "optional"
check_env "NEXT_PUBLIC_SUPPORT_PHONE" "optional"
check_env "NEXT_PUBLIC_WHATSAPP_NUMBER" "optional"
check_env "NEXT_PUBLIC_STORE_ADDRESS" "optional"
echo ""
echo "  ${BLUE}Social:${NC}"
check_env "NEXT_PUBLIC_FACEBOOK_URL" "optional"
check_env "NEXT_PUBLIC_INSTAGRAM_URL" "optional"
echo ""
echo "  ${BLUE}Admin:${NC}"
check_env "ADMIN_EMAIL" "required"
check_env "ADMIN_PASSWORD" "required"
check_env "ADMIN_NOTIFICATION_EMAIL" "optional"
echo ""

# ---- Production readiness checks ----
echo "2️⃣  Checking production readiness..."

RAZORPAY_KEY=$(grep "^RAZORPAY_KEY_ID=" .env 2>/dev/null | cut -d'=' -f2- | tr -d '"')
if echo "$RAZORPAY_KEY" | grep -q "rzp_test_"; then
  echo -e "  ${YELLOW}⚠ Razorpay using TEST keys — switch to rzp_live_ for real payments${NC}"
  WARNINGS=$((WARNINGS + 1))
else
  echo -e "  ${GREEN}✓ Razorpay keys look like production${NC}"
fi

NEXTAUTH_URL=$(grep "^NEXTAUTH_URL=" .env 2>/dev/null | cut -d'=' -f2- | tr -d '"')
if echo "$NEXTAUTH_URL" | grep -q "localhost"; then
  echo -e "  ${YELLOW}⚠ NEXTAUTH_URL points to localhost${NC}"
  WARNINGS=$((WARNINGS + 1))
else
  echo -e "  ${GREEN}✓ NEXTAUTH_URL → ${NEXTAUTH_URL}${NC}"
fi

APP_URL=$(grep "^NEXT_PUBLIC_APP_URL=" .env 2>/dev/null | cut -d'=' -f2- | tr -d '"')
if echo "$APP_URL" | grep -q "localhost"; then
  echo -e "  ${YELLOW}⚠ NEXT_PUBLIC_APP_URL points to localhost${NC}"
  WARNINGS=$((WARNINGS + 1))
else
  echo -e "  ${GREEN}✓ NEXT_PUBLIC_APP_URL → ${APP_URL}${NC}"
fi

DB_URL=$(grep "^DATABASE_URL=" .env 2>/dev/null | cut -d'=' -f2- | tr -d '"')
if echo "$DB_URL" | grep -q "localhost"; then
  echo -e "  ${YELLOW}⚠ DATABASE_URL points to localhost — use a managed DB for production${NC}"
  WARNINGS=$((WARNINGS + 1))
else
  echo -e "  ${GREEN}✓ DATABASE_URL points to remote host${NC}"
fi

ADMIN_PASS=$(grep "^ADMIN_PASSWORD=" .env 2>/dev/null | cut -d'=' -f2- | tr -d '"')
if [ "$ADMIN_PASS" = "Admin@123" ]; then
  echo -e "  ${YELLOW}⚠ ADMIN_PASSWORD is the default — change it!${NC}"
  WARNINGS=$((WARNINGS + 1))
else
  echo -e "  ${GREEN}✓ Admin password changed from default${NC}"
fi

# Check for OG image
if [ -f "public/og-image.jpg" ] || [ -f "public/og-image.png" ]; then
  echo -e "  ${GREEN}✓ OG image exists${NC}"
else
  echo -e "  ${YELLOW}⚠ Missing public/og-image.jpg (social sharing image, 1200x630px)${NC}"
  WARNINGS=$((WARNINGS + 1))
fi

echo ""

# ---- Build Check ----
echo "3️⃣  Running production build..."
if npm run build 2>&1 | tail -5; then
  echo -e "  ${GREEN}✓ Build successful${NC}"
else
  echo -e "  ${RED}✗ Build failed${NC}"
  ERRORS=$((ERRORS + 1))
fi
echo ""

# ---- Summary ----
echo "================================================"
if [ $ERRORS -gt 0 ]; then
  echo -e "${RED}❌ $ERRORS error(s) and $WARNINGS warning(s)${NC}"
  echo -e "${RED}   Fix errors before deploying.${NC}"
  exit 1
elif [ $WARNINGS -gt 0 ]; then
  echo -e "${YELLOW}⚠️  0 errors, $WARNINGS warning(s)${NC}"
  echo -e "${YELLOW}   Review warnings before going live.${NC}"
else
  echo -e "${GREEN}✅ All checks passed! Ready for deployment.${NC}"
fi
echo ""
echo "${BLUE}Quick deploy commands:${NC}"
echo ""
echo "  Vercel:  vercel --prod"
echo "  Docker:  docker compose up -d --build"
echo ""
echo "  After deploy:"
echo "    npx prisma db push"
echo "    npx prisma db seed"
echo ""
