#!/bin/bash

# ANSI color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

echo -e "${BLUE}${BOLD}Advanced File Converter Setup${NC}"
echo -e "${BLUE}============================${NC}"
echo ""
echo "This will launch the setup script for the Advanced File Converter."
echo ""
echo -e "${YELLOW}Checking for Node.js...${NC}"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js not found! Please install Node.js before running this script.${NC}"
    echo -e "Visit ${BLUE}https://nodejs.org${NC} to download and install Node.js."
    echo ""
    read -p "Press Enter to exit..."
    exit 1
fi

echo -e "${GREEN}Node.js found! Starting setup script...${NC}"
echo ""

# Make the script executable and run it
chmod +x setup.js
node setup.js

if [ $? -ne 0 ]; then
    echo ""
    echo -e "${RED}Setup script failed. Please check the error messages above.${NC}"
    read -p "Press Enter to exit..."
    exit 1
fi

echo ""
echo -e "${GREEN}Setup process completed.${NC}"
read -p "Press Enter to exit..." 