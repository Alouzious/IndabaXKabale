#!/bin/bash
# Setup script for deployment preparation

set -e

echo "=== IndabaX Kabale Deployment Setup ==="
echo ""

# Create local environment files from examples
echo "Setting up environment files..."

if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    echo "✓ Created backend/.env"
else
    echo "✓ backend/.env already exists"
fi

if [ ! -f "frontend/.env" ]; then
    cp frontend/.env.example frontend/.env
    echo "✓ Created frontend/.env"
else
    echo "✓ frontend/.env already exists"
fi

echo ""
echo "⚠️  Important: Update these files with actual values:"
echo "1. backend/.env - Add your Neon DATABASE_URL and generate JWT_SECRET"
echo "2. frontend/.env - Add your backend API URL once deployed"
echo ""
echo "To generate a secure JWT_SECRET, run:"
echo "  openssl rand -base64 32"
echo ""
echo "Setup complete! Follow DEPLOYMENT.md for next steps."
