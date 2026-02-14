#!/bin/sh
set -e

# Function to ensure a file is persistent in /data
prepare_persistent_file() {
    FILENAME=$1
    DATA_PATH="/data/$FILENAME"

    # If it's already a symlink, we're good
    if [ -L "$FILENAME" ]; then
        return
    fi

    # If the file exists in the app dir but not in /data, move it to /data
    if [ -f "$FILENAME" ] && [ ! -f "$DATA_PATH" ]; then
        echo "Moving existing $FILENAME to /data"
        mv "$FILENAME" "$DATA_PATH"
    fi

    # Ensure the target file exists in /data so symlink doesn't point to nothing
    # (Only if it doesn't exist yet, to avoid overwriting if it was already there)
    if [ ! -f "$DATA_PATH" ]; then
        touch "$DATA_PATH"
    fi

    # Create the symlink
    ln -sf "$DATA_PATH" "$FILENAME"
}

# Prepare persistent files
prepare_persistent_file "ooye.db"
prepare_persistent_file "registration.yaml"

if [ "$1" = "setup" ]; then
    echo "--- Entering Setup Mode ---"
    echo "This will guide you through the OOYE configuration."
    npm run setup

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
    npm run start
elif [ "$1" = "registration" ]; then
    if [ -f "/data/registration.yaml" ]; then
        cat /data/registration.yaml
    else
        echo "Error: /data/registration.yaml not found."
        exit 1
    fi
else
    # Allow running custom commands
    exec "$@"
fi
