#!/bin/bash

# Kill processes running on development ports
# This script reads ports from .env.local and kills any processes using them

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[KILL-DEV-PORTS]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[KILL-DEV-PORTS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[KILL-DEV-PORTS]${NC} $1"
}

print_error() {
    echo -e "${RED}[KILL-DEV-PORTS]${NC} $1"
}

# Function to kill process on a specific port
kill_port() {
    local port=$1
    local service_name=$2
    
    print_status "Checking for processes on port $port ($service_name)..."
    
    # Find processes using the port (try multiple methods for WSL compatibility)
    local pids=$(lsof -t -i:$port 2>/dev/null || ss -lptn "sport = :$port" 2>/dev/null | grep -oP 'pid=\K[0-9]+' || fuser $port/tcp 2>/dev/null | awk '{print $1}' || true)
    
    if [ -z "$pids" ]; then
        print_success "No processes found on port $port"
        return 0
    fi
    
    print_warning "Found processes on port $port: $pids"
    
    # Kill the processes
    for pid in $pids; do
        print_status "Killing process $pid on port $port..."
        if kill -TERM $pid 2>/dev/null; then
            print_success "Successfully killed process $pid"
        else
            print_warning "Process $pid may have already exited"
        fi
    done
    
    # Wait a moment for graceful shutdown
    sleep 1
    
    # Check if any processes are still running and force kill if necessary
    local remaining_pids=$(lsof -t -i:$port 2>/dev/null || ss -lptn "sport = :$port" 2>/dev/null | grep -oP 'pid=\K[0-9]+' || fuser $port/tcp 2>/dev/null | awk '{print $1}' || true)
    if [ -n "$remaining_pids" ]; then
        print_warning "Some processes still running on port $port, force killing..."
        for pid in $remaining_pids; do
            print_status "Force killing process $pid on port $port..."
            kill -KILL $pid 2>/dev/null || true
        done
        print_success "Force killed remaining processes on port $port"
    else
        print_success "All processes on port $port have been terminated"
    fi
}

# Main execution
main() {
    print_status "Starting development port cleanup..."
    
    # Check if .env.local exists
    if [ ! -f ".env.local" ]; then
        print_warning ".env.local not found, using default ports"
        DEV_WEB_PORT=3001
        DEV_API_PORT=4001
    else
        # Parse .env.local file to extract port values
        # Handle comments and empty lines properly
        DEV_WEB_PORT=$(grep "^DEV_WEB_PORT=" .env.local 2>/dev/null | head -1 | cut -d'=' -f2 | tr -d ' ' | tr -d '"' | tr -d "'" || echo "3001")
        DEV_API_PORT=$(grep "^DEV_API_PORT=" .env.local 2>/dev/null | head -1 | cut -d'=' -f2 | tr -d ' ' | tr -d '"' | tr -d "'" || echo "4001")
        
        # Validate that we got numeric values
        if ! [[ "$DEV_WEB_PORT" =~ ^[0-9]+$ ]]; then
            print_warning "Invalid DEV_WEB_PORT value '$DEV_WEB_PORT', using default 3001"
            DEV_WEB_PORT=3001
        fi
        
        if ! [[ "$DEV_API_PORT" =~ ^[0-9]+$ ]]; then
            print_warning "Invalid DEV_API_PORT value '$DEV_API_PORT', using default 4001"
            DEV_API_PORT=4001
        fi
    fi
    
    print_status "Using ports: WEB=$DEV_WEB_PORT, API=$DEV_API_PORT"
    
    # Kill processes on both ports
    kill_port $DEV_WEB_PORT "WEB"
    kill_port $DEV_API_PORT "API"
    
    print_success "Development port cleanup completed!"
}

# Run main function
main "$@"
