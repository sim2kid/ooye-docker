FROM node:22-slim

# Install git and other potential build dependencies
RUN apt-get update && apt-get install -y \
    git \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Clone the repository
# We use an ARG for the version/tag so it can be updated during build.
# If OOYE_VERSION is "latest", we lookup the latest tag on git.
ARG OOYE_VERSION=latest
RUN if [ "${OOYE_VERSION}" = "latest" ]; then \
        VERSION=$(git ls-remote --tags --sort='v:refname' https://gitdab.com/cadence/out-of-your-element.git | grep -v '\^{}' | tail -n1 | sed 's/.*\///'); \
    else \
        VERSION=${OOYE_VERSION}; \
    fi; \
    echo "Cloning OOYE version: ${VERSION}" && \
    git clone --depth 1 --branch "${VERSION}" https://gitdab.com/cadence/out-of-your-element.git .

# Install dependencies
RUN npm install

# Create data directory for persistence
RUN mkdir /data && chmod 777 /data

# Copy entrypoint script
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Expose the default port
EXPOSE 6693

# Set the entrypoint
ENTRYPOINT ["entrypoint.sh"]
CMD ["start"]
