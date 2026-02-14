# Out Of Your Element (OOYE) Docker

This repository provides a Dockerized version of [Out Of Your Element (OOYE)](https://gitdab.com/cadence/out-of-your-element), a Matrix-Discord bridge.

## Features

- **Automated Builds**: GitHub Actions automatically builds and pushes the image to GitHub Container Registry (GHCR).
    - `latest`: Tracks the latest stable tag from the official OOYE repository.
    - `nightly`: Tracks the `main` branch of the official OOYE repository (development).
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
docker run -it -v ooye_data:/data ghcr.io/sim2kid/ooye-docker:latest setup
```

Follow the interactive prompts in your terminal.

**Important**: During the setup process, the script will pause and wait for you to register the `registration.yaml` file with your homeserver. Since the setup is still running in your current terminal, you will need to open a **second terminal window** to view the registration file.

To view the file while setup is running, execute:
```bash
docker-compose run ooye registration
```
or
```bash
docker run -it --rm -v ooye_data:/data ghcr.io/sim2kid/ooye-docker:latest registration
```

Copy the output and provide it to your homeserver (Synapse or Conduit) as instructed in the setup terminal. Once the homeserver is configured and restarted, the setup script will detect the registration and complete.

After the setup finishes, the content of `registration.yaml` will also be printed one last time to the console.

You can also view the registration file at any time by running:
```bash
docker-compose run ooye registration
```
or
```bash
docker run -it -v ooye_data:/data ghcr.io/sim2kid/ooye-docker:latest registration
```

### 2. Production Mode

Once setup is complete, you can start the bridge in production mode.

Using Docker Compose:
```bash
docker-compose up -d
```

Using Docker CLI:
```bash
docker run -d --name ooye -v ooye_data:/data -p 6693:6693 ghcr.io/sim2kid/ooye-docker:latest
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
