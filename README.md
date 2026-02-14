# Out Of Your Element (OOYE) Docker

[![Releases](https://img.shields.io/gitea/v/release/cadence/out-of-your-element?gitea_url=https%3A%2F%2Fgitdab.com&style=plastic&color=green)](https://gitdab.com/cadence/out-of-your-element/releases) [![Discuss on Matrix](https://img.shields.io/badge/discuss-%23out--of--your--element-white?style=plastic)](https://matrix.to/#/#out-of-your-element:cadence.moe)

![Nightly](https://github.com/sim2kid/ooye-docker/actions/workflows/nightly.yml/badge.svg)
![Container](https://github.com/sim2kid/ooye-docker/actions/workflows/stable.yml/badge.svg)

> [!IMPORTANT]
> This is an **UNOFFICIAL** docker release of [Out Of Your Element (OOYE)](https://gitdab.com/cadence/out-of-your-element). For detailed information about the project itself, please visit the [official repository](https://gitdab.com/cadence/out-of-your-element/).

## Tags

Automated builds are handled by GitHub Actions and pushed to Docker Hub:

- `latest`: Tracks the latest stable tag from the official OOYE repository (dynamically determined).
- `nightly`: Tracks the `main` branch of the official OOYE repository (development).
- `nightly-<date>`: A nightly build from a specific date.
- `<version>`: Specific versions are tagged according to the official release (e.g., `v3.3`).

## How to Use

> [!WARNING]
> You **MUST** run the setup mode before the bridge will function.

### 1. Setup Mode (Required once)

First, you need to run the setup to configure the bridge and generate the `registration.yaml` file. This process follows the [official installation instructions](https://gitdab.com/cadence/out-of-your-element/src/branch/main/docs/get-started.md).

Using Docker Compose:
```bash
docker-compose run ooye setup
```

Using Docker CLI:
```bash
docker run -it -v ooye_data:/data sim2kid/ooye-docker:latest setup
```

Follow the interactive prompts in your terminal.

**Important**: During the setup process, the script will pause and wait for you to register the `registration.yaml` file with your homeserver. Since the setup is still running in your current terminal, you will need to open a **second terminal window** to view the registration file.

To view the file while setup is running, execute:
```bash
docker-compose run ooye registration
```
or
```bash
docker run -it --rm -v ooye_data:/data sim2kid/ooye-docker:latest registration
```

Copy the output and provide it to your homeserver (Synapse or Conduit) as instructed in the setup terminal. Once the homeserver is configured and restarted, the setup script will detect the registration and complete.

After the setup finishes, the content of `registration.yaml` will also be printed one last time to the console.

You can also view the registration file at any time by running:
```bash
docker-compose run ooye registration
```
or
```bash
docker run -it -v ooye_data:/data sim2kid/ooye-docker:latest registration
```

### 2. Production Mode

Once setup is complete, you can start the bridge in production mode.

Using Docker Compose:
```bash
docker-compose up -d
```

Using Docker CLI:
```bash
docker run -d --name ooye -v ooye_data:/data -p 6693:6693 sim2kid/ooye-docker:latest
```

## Volumes

The image uses a volume mounted at `/data` to store:
- `ooye.db`: The database file.
- `registration.yaml`: The Matrix registration file.

## Configuration

The `Dockerfile` clones the latest stable release by default using a dynamic lookup. You can build a specific version using build arguments:
```bash
docker build --build-arg OOYE_VERSION=v3.3 -t ooye .
```

---

[See the official User Guide for more information about features →](https://gitdab.com/cadence/out-of-your-element/src/branch/main/docs/user-guide.md)
