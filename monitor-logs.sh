#!/bin/bash

echo "🔍 Live Backend Log Monitor"
echo "=========================="
echo "Monitoring backend API calls in real-time..."
echo "Press Ctrl+C to stop"
echo ""

# Function to show timestamp
show_timestamp() {
    echo -n "[$(date '+%H:%M:%S')] "
}

# Monitor for new API calls
while true; do
    # Check if backend is running
    if ! curl -s http://localhost:3001/health > /dev/null 2>&1; then
        echo "❌ Backend not responding on port 3001"
        sleep 2
        continue
    fi
    
    # Show a heartbeat every 30 seconds
    if [ $(($(date +%s) % 30)) -eq 0 ]; then
        show_timestamp
        echo "💓 Backend is running and ready for requests..."
    fi
    
    sleep 1
done

