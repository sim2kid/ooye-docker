#!/bin/sh
set -e

if [ "$1" = "setup" ]; then
    echo "--- Entering Setup Mode ---"
    echo "This will guide you through the OOYE configuration."
    npm run setup --prefix /app

    echo ""
    echo "--- Setup Complete ---"
    echo "Your registration.yaml has been generated/updated."
    if [ -f "/data/registration.yaml" ]; then
        echo "Contents of /data/registration.yaml:"
        echo "-----------------------------------"
        cat /data/registration.yaml
        echo "-----------------------------------"
    else
        echo "Error: /data/registration.yaml not found."
    fi
elif [ "$1" = "start" ]; then
    echo "--- Starting OOYE in Production Mode ---"
    # Ensure registration.yaml exists, if not, maybe warn?
    # The app might create it or fail if missing, but we run from /data now.
    npm run start --prefix /app
elif [ "$1" = "registration" ]; then
    if [ -f "/data/registration.yaml" ]; then
        cat /data/registration.yaml
    elif [ -f "registration.yaml" ]; then
        cat registration.yaml
    else
        echo "Error: registration.yaml not found."
        exit 1
    fi
else
    # Allow running custom commands
    exec "$@"
fi
