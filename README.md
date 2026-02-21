# Out Of Your Element (OOYE) Docker

[![Releases](https://img.shields.io/gitea/v/release/cadence/out-of-your-element?gitea_url=https%3A%2F%2Fgitdab.com&style=plastic&color=green)](https://gitdab.com/cadence/out-of-your-element/releases) [![Discuss on Matrix](https://img.shields.io/badge/discuss-%23out--of--your--element-white?style=plastic)](https://matrix.to/#/#out-of-your-element:cadence.moe)

Container Builds Statuses:
![Nightly](https://github.com/sim2kid/ooye-docker/actions/workflows/nightly.yml/badge.svg)
![Latest](https://github.com/sim2kid/ooye-docker/actions/workflows/stable.yml/badge.svg)

> [!IMPORTANT]
> This is an **UNOFFICIAL** docker release of [Out Of Your Element (OOYE)](https://gitdab.com/cadence/out-of-your-element). For detailed information about the project itself, please visit the [official repository](https://gitdab.com/cadence/out-of-your-element/).
>
> If you are having issues, please try without docker first. Otherwise the original developers will not be able to help you.
> 
> **DO NOT ASK THE DEVELOPERS FOR HELP WITH DOCKER. THEY WON'T GIVE IT**

If you need to make a container of your own, the source code for these build can be found at [sim2kid/ooye-docker](https://github.com/sim2kid/ooye-docker).

## Tags

Automated builds are handled by GitHub Actions and pushed to Docker Hub:

- `latest`: Tracks the latest stable tag from the official OOYE repository (dynamically determined).
- `nightly`: Tracks the `main` branch of the official OOYE repository (development).
- `nightly-<date>`: A nightly build from a specific date.
- `<version>`: Specific versions are tagged according to the official release (e.g., `v3.3`).
- `<hash>`: A specific build identified by its git hash.

> [!WARNING]
> **DO NOT** use the hashed tags for your production setup. These are used for internal tracking and are subject to cleanup. Always prefer `latest`, `nightly`, or a specific version tag.

## How to Use

> [!WARNING]
> You **MUST** run the setup mode before the bridge will function.

### 1. Setup Mode (Required once)

First, you need to run the setup to configure the bridge and generate the `registration.yaml` file. This process follows the [official installation instructions](https://gitdab.com/cadence/out-of-your-element/src/branch/main/docs/get-started.md).

Using Docker Compose (example [docker-compose.yml](docker-compose.yml)):
```bash
docker-compose run ooye setup
```

> [!NOTE]
> The setup process is a script that must be run inside the container to generate the necessary configuration files.
> 
> You will need to interact in a console to complete this setup process.
> 
> Ensure the setup script tells you that it is finished before running normally.

Using Docker CLI:
```bash
docker run -it -v ooye_data:/data sim2kid/ooye-docker:latest setup
```

Follow the interactive prompts in your terminal.

> [!IMPORTANT]
> During the setup process, the script will pause and wait for you to register the `registration.yaml` file with your homeserver. Since the setup is still running in your current terminal, you will need to open a **second terminal window** to view the registration file.

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

## Backups

> [!CAUTION]
> This is an unsupported solution. **You are responsible for your own data.**
>
> It is **strongly recommended** to take regular backups of your database (`ooye.db`). Automated backup solutions are highly encouraged to prevent data loss in case of container failure or corruption.

## Migration Guide

If you are migrating an existing OOYE installation to Docker, you can move your existing database and registration files into the Docker volume.

> [!WARNING]
> This docker container is UNOFFICIAL and UNSUPPORTED and may be broken. ALWAYS BACK UP YOUR DATA before making ANY changes.

### 1. Identify your files
Locate your existing `ooye.db` and `registration.yaml` files from your previous installation.

### 2. Move files to the Docker volume

#### Using Docker Compose (Bind Mount)
If you prefer using a local directory instead of a named volume, update your `docker-compose.yml`:

```yaml
services:
  ooye:
    # ...
    volumes:
      - ./ooye_data:/data
```

Then, simply copy your files into the `./ooye_data` directory on your host:
```bash
mkdir -p ooye_data
cp /path/to/existing/ooye.db ./ooye_data/
cp /path/to/existing/registration.yaml ./ooye_data/
```

#### Using Docker CLI (Named Volume)
If you are using a named volume (e.g., `ooye_data`), you can use a temporary container to copy the files:

```bash
# Copy ooye.db
docker run --rm -v ooye_data:/data -v /path/to/existing:/backup alpine cp /backup/ooye.db /data/ooye.db

# Copy registration.yaml
docker run --rm -v ooye_data:/data -v /path/to/existing:/backup alpine cp /backup/registration.yaml /data/registration.yaml
```

### 3. Start the container
Once the files are in place, you can start the bridge normally. It will detect the existing files and use them.

```bash
docker-compose up -d
```

## Configuration

The `Dockerfile` clones the latest stable release by default using a dynamic lookup. You can build a specific version using build arguments:
```bash
docker build --build-arg OOYE_VERSION=v3.3 -t ooye .
```

## Tag Cleanup Policy

To keep Docker Hub clean, a weekly automated cleanup script runs. The retention policy is configurable in the `.github/workflows/cleanup.yml` workflow:

- **Daily**: Keep the 7 most recent daily tags (`KEEP_DAILY`).
- **Weekly**: Keep the 4 most recent end-of-week tags (Mondays, ISO standard) (`KEEP_WEEKLY`).
- **Monthly**: Keep the 12 most recent monthly tags (1st of the month) (`KEEP_MONTHLY`).
- **Yearly**: Keep the 7 most recent yearly tags (January 1st) (`KEEP_YEARLY`).

If a tag fulfills any of these roles, it remains. 

Additionally, all **hashed tags** are removed, except for the one currently associated with the `latest` tag.

---

[See the official User Guide for more information about features →](https://gitdab.com/cadence/out-of-your-element/src/branch/main/docs/user-guide.md)

---

## Issues & Help

If you are having issues running the bridge in container mode, reach out to [@sim2kid:starfallinn.com](https://matrix.to/#/@sim2kid:starfallinn.com) on the [matrix #containers room](https://matrix.to/#/!PkwISXahWEKtmIhrIG:cadence.moe?via=cadence.moe&via=ucc.asn.au&via=starfallinn.com) room.

> As a reminder, this is an **UNOFFICIAL** docker release of [Out Of Your Element (OOYE)](https://gitdab.com/cadence/out-of-your-element).
> 
> Support for this project is not provided by the original developers.
> 
> **DO NOT ASK THE DEVELOPERS FOR HELP WITH DOCKER. THEY WON'T GIVE IT**

If I am not to be found in the OOYE space, you can try finding me in the [Starfall Inn](https://matrix.to/#/#inn:starfallinn.com).
