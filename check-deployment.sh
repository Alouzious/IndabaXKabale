#!/bin/bash
# Quick deployment checklist script

set -e

echo "=== IndabaX Kabale Deployment Checklist ==="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check requirement
check_requirement() {
    local name=$1
    local command=$2
    
    if command -v $command &> /dev/null; then
        echo -e "${GREEN}✓${NC} $name is installed"
        return 0
    else
        echo -e "${RED}✗${NC} $name is NOT installed"
        return 1
    fi
}

# Function to check file exists
check_file() {
    local file=$1
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file exists"
        return 0
    else
        echo -e "${RED}✗${NC} $file MISSING"
        return 1
    fi
}

echo "--- Prerequisites ---"
check_requirement "Git" "git"
check_requirement "Rust" "rustc"
check_requirement "Docker" "docker"
check_requirement "Node.js" "node"
check_requirement "npm" "npm"

echo ""
echo "--- Project Files ---"
check_file "backend/Cargo.toml"
check_file "backend/.env.example"
check_file "backend/Dockerfile"
check_file "frontend/package.json"
check_file "frontend/.env.example"
check_file "render.yaml"
check_file "DEPLOYMENT.md"

echo ""
echo "--- GitHub Workflows ---"
check_file ".github/workflows/backend.yml"
check_file ".github/workflows/frontend.yml"

echo ""
echo "--- Environment Setup ---"
if [ -f "backend/.env" ]; then
    echo -e "${GREEN}✓${NC} backend/.env configured"
else
    echo -e "${YELLOW}⚠${NC} backend/.env not found"
    echo "   Run: cp backend/.env.example backend/.env"
fi

if [ -f "frontend/.env" ]; then
    echo -e "${GREEN}✓${NC} frontend/.env configured"
else
    echo -e "${YELLOW}⚠${NC} frontend/.env not found"
    echo "   Run: cp frontend/.env.example frontend/.env"
fi

echo ""
echo "--- Deployment Service Accounts ---"
echo -e "${YELLOW}Ensure you have:${NC}"
echo "  • GitHub account with repo access"
echo "  • Neon account with database created"
echo "  • Render account connected to GitHub"
echo "  • Vercel account connected to GitHub"

echo ""
echo "--- Next Steps ---"
echo "1. Update DATABASE_URL in backend/.env with your Neon connection string"
echo "2. Commit and push: git add . && git commit -m 'Setup deployment' && git push"
echo "3. Follow DEPLOYMENT.md for step-by-step instructions"

echo ""
echo -e "${GREEN}Deployment setup complete!${NC}"
