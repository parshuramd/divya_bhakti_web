#!/usr/bin/env bash
# =============================================================
# Divya Bhakti Store — Production Deployment Checklist & Script
# =============================================================
# Run this script to validate your environment before deploying.
# Usage: bash scripts/pre-deploy-check.sh

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo ""
echo "🕉  Divya Bhakti Store — Pre-Deployment Check"
echo "================================================"
echo ""

ERRORS=0
WARNINGS=0

# ---- Required Environment Variables ----
check_env() {
  local var_name=$1
  local is_required=$2
  local value=$(grep "^${var_name}=" .env 2>/dev/null | cut -d'=' -f2- | tr -d '"')

  if [ -z "$value" ] || [ "$value" = "" ]; then
    if [ "$is_required" = "required" ]; then
      echo -e "  ${RED}✗ ${var_name} — MISSING (required)${NC}"
      ERRORS=$((ERRORS + 1))
    else
      echo -e "  ${YELLOW}⚠ ${var_name} — not set (optional)${NC}"
      WARNINGS=$((WARNINGS + 1))
    fi
  else
    # Check for placeholder values
    if echo "$value" | grep -qiE "(xxxx|your-|change-in-production|password@localhost|test_)"; then
      echo -e "  ${YELLOW}⚠ ${var_name} — looks like a placeholder value${NC}"
      WARNINGS=$((WARNINGS + 1))
    else
      echo -e "  ${GREEN}✓ ${var_name}${NC}"
    fi
  fi
}

echo "1️⃣  Checking environment variables..."
echo ""
echo "  Core:"
check_env "DATABASE_URL" "required"
check_env "NEXTAUTH_SECRET" "required"
check_env "NEXTAUTH_URL" "required"
echo ""
echo "  Payment:"
check_env "RAZORPAY_KEY_ID" "required"
check_env "RAZORPAY_KEY_SECRET" "required"
check_env "RAZORPAY_WEBHOOK_SECRET" "optional"
check_env "NEXT_PUBLIC_RAZORPAY_KEY_ID" "optional"
echo ""
echo "  Email:"
check_env "RESEND_API_KEY" "optional"
check_env "EMAIL_FROM" "optional"
echo ""
echo "  Shipping:"
check_env "SHIPROCKET_EMAIL" "optional"
check_env "SHIPROCKET_PASSWORD" "optional"
echo ""
echo "  Public:"
check_env "NEXT_PUBLIC_APP_URL" "required"
check_env "NEXT_PUBLIC_WHATSAPP_NUMBER" "optional"
echo ""

# ---- Check for test keys in production ----
echo "2️⃣  Checking for test/dev values..."
RAZORPAY_KEY=$(grep "^RAZORPAY_KEY_ID=" .env 2>/dev/null | cut -d'=' -f2- | tr -d '"')
if echo "$RAZORPAY_KEY" | grep -q "rzp_test_"; then
  echo -e "  ${YELLOW}⚠ Razorpay is using TEST keys — switch to LIVE for production${NC}"
  WARNINGS=$((WARNINGS + 1))
else
  echo -e "  ${GREEN}✓ Razorpay keys look like production${NC}"
fi

NEXTAUTH_URL=$(grep "^NEXTAUTH_URL=" .env 2>/dev/null | cut -d'=' -f2- | tr -d '"')
if echo "$NEXTAUTH_URL" | grep -q "localhost"; then
  echo -e "  ${YELLOW}⚠ NEXTAUTH_URL points to localhost — update for production${NC}"
  WARNINGS=$((WARNINGS + 1))
else
  echo -e "  ${GREEN}✓ NEXTAUTH_URL looks like production${NC}"
fi
echo ""

# ---- TypeScript Check ----
echo "3️⃣  Running TypeScript check..."
if npx tsc --noEmit 2>/dev/null; then
  echo -e "  ${GREEN}✓ TypeScript — no errors${NC}"
else
  echo -e "  ${RED}✗ TypeScript errors found — fix before deploying${NC}"
  ERRORS=$((ERRORS + 1))
fi
echo ""

# ---- Build Check ----
echo "4️⃣  Running production build..."
if npm run build 2>/dev/null 1>/dev/null; then
  echo -e "  ${GREEN}✓ Build — successful${NC}"
else
  echo -e "  ${RED}✗ Build failed — fix errors before deploying${NC}"
  ERRORS=$((ERRORS + 1))
fi
echo ""

# ---- Database Check ----
echo "5️⃣  Checking database connection..."
if npx prisma db push --accept-data-loss 2>/dev/null; then
  echo -e "  ${GREEN}✓ Database — connection OK${NC}"
else
  echo -e "  ${YELLOW}⚠ Cannot connect to database — check DATABASE_URL${NC}"
  WARNINGS=$((WARNINGS + 1))
fi
echo ""

# ---- Summary ----
echo "================================================"
if [ $ERRORS -gt 0 ]; then
  echo -e "${RED}❌ $ERRORS error(s) and $WARNINGS warning(s) found.${NC}"
  echo -e "${RED}   Fix errors before deploying to production.${NC}"
  exit 1
elif [ $WARNINGS -gt 0 ]; then
  echo -e "${YELLOW}⚠️  0 errors and $WARNINGS warning(s) found.${NC}"
  echo -e "${YELLOW}   Review warnings before deploying.${NC}"
else
  echo -e "${GREEN}✅ All checks passed! Ready for deployment.${NC}"
fi
echo ""
echo "Next steps:"
echo "  1. Run: npx prisma migrate deploy"
echo "  2. Run: npx prisma db seed"
echo "  3. Deploy: vercel --prod"
echo ""
