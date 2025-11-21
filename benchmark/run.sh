#!/bin/bash

# Exit on error
set -e

# Configuration
DURATION="10s"
CONNECTIONS="100"
THREADS="10"
WARMUP_DURATION="5s"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check for wrk
if ! command -v wrk &> /dev/null; then
    echo -e "${RED}Error: 'wrk' is not installed.${NC}"
    echo "Please install it using: brew install wrk"
    exit 1
fi

# Function to run benchmark
run_benchmark() {
    NAME=$1
    PORT=$2

    echo ""
    echo -e "${GREEN}>>> Benchmarking $NAME (Port $PORT)...${NC}"
    
    # Check if server is reachable
    if ! curl -s http://localhost:$PORT > /dev/null; then
        echo -e "${RED}Error: Could not connect to server at http://localhost:$PORT${NC}"
        echo "Skipping..."
        return
    fi

    # Warmup
    echo "Warmup ($WARMUP_DURATION)..."
    wrk -t$THREADS -c$CONNECTIONS -d$WARMUP_DURATION http://localhost:$PORT > /dev/null

    # Actual Benchmark
    echo "Running Benchmark..."
    wrk -t$THREADS -c$CONNECTIONS -d$DURATION http://localhost:$PORT
}

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Benchmark Selection${NC}"
echo -e "${BLUE}========================================${NC}"
echo "1) Baseline (No Logger) [Port 3002]"
echo "2) Elysia Logger        [Port 3000]"
echo "3) Logixlysia           [Port 3001]"
echo "4) Run All"
echo -e "${BLUE}========================================${NC}"
read -p "Select an option [1-4]: " choice

case $choice in
    1)
        run_benchmark "Baseline (No Logger)" 3002
        ;;
    2)
        run_benchmark "Elysia Logger" 3000
        ;;
    3)
        run_benchmark "Logixlysia" 3001
        ;;
    4)
        run_benchmark "Baseline (No Logger)" 3002
        run_benchmark "Elysia Logger" 3000
        run_benchmark "Logixlysia" 3001
        ;;
    *)
        echo -e "${RED}Invalid selection.${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Benchmark Completed${NC}"
echo -e "${BLUE}========================================${NC}"
