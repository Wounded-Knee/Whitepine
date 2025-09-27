#!/bin/bash

# Install git hooks for the project
# This script should be run after cloning the repository

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 Installing git hooks...${NC}"

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}⚠️  Warning: Not in a git repository. Skipping hook installation.${NC}"
    exit 0
fi

# Create hooks directory if it doesn't exist
mkdir -p .git/hooks

# Install pre-commit hook
if [ -f "scripts/pre-commit" ]; then
    cp scripts/pre-commit .git/hooks/pre-commit
    chmod +x .git/hooks/pre-commit
    echo -e "${GREEN}✅ Pre-commit hook installed successfully${NC}"
else
    echo -e "${YELLOW}⚠️  Warning: scripts/pre-commit not found${NC}"
fi

echo -e "${GREEN}🎉 Git hooks installation complete!${NC}"
echo -e "${BLUE}💡 The pre-commit hook will now run tests before each commit${NC}"
echo -e "${BLUE}💡 Use 'git commit --no-verify' to bypass tests when needed${NC}"
