# Out Of Your Element (OOYE) Docker

This repository provides a Dockerized version of [Out Of Your Element (OOYE)](https://gitdab.com/cadence/out-of-your-element), a Matrix-Discord bridge.

## Features

- **Automated Builds**: GitHub Actions automatically builds and pushes the image to GitHub Container Registry (GHCR).
- **Two-Phase Setup**: Supports an interactive setup mode and a production start mode.
- **Persistence**: Easily manage persistent data (`ooye.db` and `registration.yaml`) via volumes.

## How to Use

### 1. Setup Mode (Required once)

First, you need to run the setup to configure the bridge and generate the `registration.yaml` file.

Using Docker Compose:
```bash
docker-compose run ooye setup
```

Using Docker CLI:
```bash
docker run -it -v ooye_data:/data ghcr.io/YOUR_USERNAME/ooye-docker:latest setup
```

Follow the interactive prompts in your terminal.

### 2. Production Mode

Once setup is complete, you can start the bridge in production mode.

Using Docker Compose:
```bash
docker-compose up -d
```

Using Docker CLI:
```bash
docker run -d --name ooye -v ooye_data:/data -p 6693:6693 ghcr.io/YOUR_USERNAME/ooye-docker:latest
```

## Volumes

The image uses a volume mounted at `/data` to store:
- `ooye.db`: The database file.
- `registration.yaml`: The Matrix registration file.

## Configuration

The `Dockerfile` clones the `main` branch by default. You can build a specific version using build arguments:
```bash
docker build --build-arg OOYE_VERSION=v1.2.3 -t ooye .
```
