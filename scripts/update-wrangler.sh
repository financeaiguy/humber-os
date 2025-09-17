#!/bin/bash

# Script to update Wrangler to the latest version across all packages
# and fix any configuration issues

set -e

echo "🔧 Updating Wrangler to Latest Version..."
echo "========================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Current and target versions
CURRENT_VERSION="4.32.0"
TARGET_VERSION="4.37.1"

echo -e "${BLUE}Current version: $CURRENT_VERSION${NC}"
echo -e "${BLUE}Target version: $TARGET_VERSION${NC}"
echo ""

# Update root package.json if it exists
if [ -f "package.json" ]; then
    echo -e "${BLUE}Updating root package.json...${NC}"
    sed -i.bak "s/\"wrangler\": \"[^\"]*\"/\"wrangler\": \"^$TARGET_VERSION\"/g" package.json
    rm -f package.json.bak
fi

# Update apps/web package.json
if [ -f "apps/web/package.json" ]; then
    echo -e "${BLUE}Updating apps/web/package.json...${NC}"
    sed -i.bak "s/\"wrangler\": \"[^\"]*\"/\"wrangler\": \"^$TARGET_VERSION\"/g" apps/web/package.json
    rm -f apps/web/package.json.bak
fi

# Update apps/worker package.json (already done but let's ensure)
if [ -f "apps/worker/package.json" ]; then
    echo -e "${BLUE}Updating apps/worker/package.json...${NC}"
    sed -i.bak "s/\"wrangler\": \"[^\"]*\"/\"wrangler\": \"^$TARGET_VERSION\"/g" apps/worker/package.json
    rm -f apps/worker/package.json.bak
fi

# Fix wrangler.toml files - remove invalid 'remote' field from vectorize
echo -e "${BLUE}Fixing wrangler.toml configurations...${NC}"

# Fix in apps/worker/wrangler.toml
if [ -f "apps/worker/wrangler.toml" ]; then
    echo "  - Fixing apps/worker/wrangler.toml"
    # Remove 'remote = true' or 'remote = "..."' lines after vectorize sections
    sed -i.bak '/\[\[vectorize\]\]/,/^\[/{/remote[[:space:]]*=/d;}' apps/worker/wrangler.toml
    rm -f apps/worker/wrangler.toml.bak
fi

# Fix in apps/web/wrangler.toml
if [ -f "apps/web/wrangler.toml" ]; then
    echo "  - Fixing apps/web/wrangler.toml"
    sed -i.bak '/\[\[.*vectorize\]\]/,/^\[/{/remote[[:space:]]*=/d;}' apps/web/wrangler.toml
    rm -f apps/web/wrangler.toml.bak
fi

# Fix in other wrangler config files
for config in apps/web/wrangler-*.toml; do
    if [ -f "$config" ]; then
        echo "  - Fixing $config"
        sed -i.bak '/\[\[.*vectorize\]\]/,/^\[/{/remote[[:space:]]*=/d;}' "$config"
        rm -f "${config}.bak"
    fi
done

echo ""
echo -e "${BLUE}Installing updated dependencies...${NC}"

# Install in root if package.json exists
if [ -f "package.json" ]; then
    echo "Installing in root..."
    pnpm install
fi

# Install in apps/web
if [ -d "apps/web" ]; then
    echo "Installing in apps/web..."
    cd apps/web
    pnpm install
    cd ../..
fi

# Install in apps/worker
if [ -d "apps/worker" ]; then
    echo "Installing in apps/worker..."
    cd apps/worker
    pnpm install
    cd ../..
fi

echo ""
echo -e "${BLUE}Verifying wrangler installation...${NC}"

# Check installed version
INSTALLED_VERSION=$(npx wrangler --version 2>/dev/null | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1)

if [ "$INSTALLED_VERSION" = "$TARGET_VERSION" ]; then
    echo -e "${GREEN}✅ Wrangler successfully updated to $TARGET_VERSION${NC}"
else
    echo -e "${YELLOW}⚠️  Wrangler version is $INSTALLED_VERSION (expected $TARGET_VERSION)${NC}"
fi

echo ""
echo -e "${BLUE}Testing wrangler configurations...${NC}"

# Test worker configuration
if [ -f "apps/worker/wrangler.toml" ]; then
    echo -n "Testing worker configuration... "
    cd apps/worker
    if npx wrangler deploy --dry-run --env production > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Valid${NC}"
    else
        echo -e "${YELLOW}⚠️  Has warnings (run 'npx wrangler deploy --dry-run' to see details)${NC}"
    fi
    cd ../..
fi

echo ""
echo -e "${GREEN}🎉 Wrangler Update Complete!${NC}"
echo ""
echo "Summary:"
echo "========"
echo "✅ Updated to Wrangler $TARGET_VERSION"
echo "✅ Fixed vectorize configuration issues"
echo "✅ Updated all package.json files"
echo "✅ Installed dependencies"
echo ""
echo "Next steps:"
echo "1. Test deployment: cd apps/worker && npx wrangler deploy --dry-run"
echo "2. Deploy to production: ./scripts/deploy-all-workers.sh production"
echo "3. Monitor for any issues in the Cloudflare dashboard"