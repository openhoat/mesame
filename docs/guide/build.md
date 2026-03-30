# Build Executables

This guide explains how to build distributable executables for Windows, macOS, and Linux.

## Prerequisites

- Node.js 22+
- npm
- Platform-specific tools (see below)

## Quick Build

Build for your current platform:

```bash
npm run build:all  # Compile all code
npm run dist       # Build installer
```

Output location: `dist/electron-app/`

## Platform-Specific Requirements

### Linux

**Required**:
- Standard build tools: `make`, `gcc`, `g++`

**Install (Debian/Ubuntu)**:
```bash
sudo apt-get install -y build-essential
```

**Build**:
```bash
npm run dist
```

**Output**:
- `dist/electron-app/MeSame-0.1.0.AppImage` — Portable executable
- `dist/electron-app/mesame_0.1.0_amd64.deb` — Debian package (optional)

### macOS

**Required**:
- Xcode Command Line Tools

**Install**:
```bash
xcode-select --install
```

**Build**:
```bash
npm run dist
```

**Output**:
- `dist/electron-app/MeSame-0.1.0-arm64.dmg` — ARM64 installer (Apple Silicon)
- `dist/electron-app/MeSame-0.1.0-x64.dmg` — Intel installer (optional)

**Code Signing** (optional):
```bash
export CSC_IDENTITY_AUTO_DISCOVERY=false  # Skip signing for local builds
npm run dist
```

For distribution, see [Electron Builder Code Signing](https://www.electron.build/code-signing).

### Windows

**Required**:
- Visual Studio Build Tools or Visual Studio Community
- Windows SDK

**Install**:
1. Download [Visual Studio Build Tools](https://visualstudio.microsoft.com/downloads/)
2. Install "Desktop development with C++" workload

**Build**:
```bash
npm run dist
```

**Output**:
- `dist/electron-app/MeSame.Setup.0.1.0.exe` — NSIS installer

## Build Configuration

Build settings are in `package.json` under `build`:

```json
{
  "build": {
    "appId": "com.mesame.app",
    "productName": "MeSame",
    "directories": {
      "output": "dist/electron-app"
    },
    "files": [
      "dist/**/*",
      "assets/**/*",
      "prisma/**/*",
      "node_modules/**/*",
      "package.json"
    ],
    "mac": {
      "category": "public.app-category.productivity",
      "icon": "assets/MeSame_icon.png",
      "target": ["dmg"]
    },
    "win": {
      "icon": "assets/MeSame_icon.png",
      "target": ["nsis"]
    },
    "linux": {
      "icon": "assets/MeSame_icon.png",
      "target": ["AppImage"],
      "category": "Utility"
    }
  }
}
```

## Build Targets

### AppImage (Linux)

Portable executable — no installation required.

**Build**:
```bash
npm run dist -- --linux AppImage
```

**Run**:
```bash
chmod +x dist/electron-app/MeSame-0.1.0.AppImage
./dist/electron-app/MeSame-0.1.0.AppImage
```

### Debian Package (Linux)

System package for Debian/Ubuntu.

**Build**:
```bash
npm run dist -- --linux deb
```

**Install**:
```bash
sudo dpkg -i dist/electron-app/mesame_0.1.0_amd64.deb
```

### DMG (macOS)

Disk image with drag-to-install UI.

**Build**:
```bash
npm run dist -- --mac dmg
```

**Install**:
1. Open `MeSame-0.1.0-arm64.dmg`
2. Drag MeSame to Applications folder

### NSIS Installer (Windows)

Classic Windows installer.

**Build**:
```bash
npm run dist -- --win nsis
```

**Install**:
1. Run `MeSame.Setup.0.1.0.exe`
2. Follow installation wizard

## Development Builds

For testing without full distribution:

```bash
npm run pack  # Package without creating installer
```

Output: `dist/electron-app/linux-unpacked/` (or `mac`, `win-unpacked`)

**Run**:
```bash
./dist/electron-app/linux-unpacked/MeSame
```

## CI/CD Builds

Example GitHub Actions workflow:

```yaml
name: Build

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]

    runs-on: ${{ matrix.os }}

    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v5
        with:
          node-version: 22

      - run: npm install
      - run: npm run build:all
      - run: npm run dist

      - uses: actions/upload-artifact@v7
        with:
          name: installers-${{ matrix.os }}
          path: dist/electron-app/*.{AppImage,dmg,exe,deb}
```

## Troubleshooting

### Build Fails on Linux

**Error**: `Cannot find module 'electron'`

**Solution**:
```bash
rm -rf node_modules package-lock.json
npm install
```

### AppImage Won't Run

**Error**: `Permission denied`

**Solution**:
```bash
chmod +x MeSame-0.1.0.AppImage
```

### macOS Build Fails

**Error**: `Command failed: xcrun`

**Solution**:
```bash
xcode-select --install
sudo xcode-select --reset
```

### Windows Build Fails

**Error**: `MSBuild.exe not found`

**Solution**:
1. Install Visual Studio Build Tools
2. Restart terminal
3. Retry build

### Build is Very Slow

**Optimization**:
```bash
# Skip compression for faster builds
npm run dist -- --config.compression=store
```

## Advanced Configuration

### Custom Icon

Replace `assets/MeSame_icon.png` with your icon (at least 512x512px).

### App Metadata

Edit `package.json`:

```json
{
  "name": "mesame",
  "version": "0.1.0",
  "description": "Your personal style proxy",
  "author": "Your Name <your.email@example.com>"
}
```

### Target Multiple Architectures

```bash
# Build for both x64 and ARM64 on macOS
npm run dist -- --mac --x64 --arm64
```

### Skip Platform-Specific Builds

```bash
# Build only AppImage on Linux (skip .deb)
npm run dist -- --linux AppImage
```

## Distribution

### GitHub Releases

Upload built artifacts to GitHub Releases:

```bash
gh release create v0.1.0 \
  dist/electron-app/MeSame-0.1.0.AppImage \
  dist/electron-app/MeSame-0.1.0-arm64.dmg \
  dist/electron-app/MeSame.Setup.0.1.0.exe
```

### Auto-Update

For auto-update support, see [Electron Builder Auto-Update](https://www.electron.build/auto-update).

## Versioning

Update version in `package.json`:

```json
{
  "version": "0.2.0"
}
```

Or use npm:

```bash
npm version patch  # 0.1.0 → 0.1.1
npm version minor  # 0.1.0 → 0.2.0
npm version major  # 0.1.0 → 1.0.0
```

Then rebuild:

```bash
npm run dist
```

## Docker Deployment

Deploy MeSame as a web application using Docker Compose.

### Quick Start

```bash
# Start MeSame
docker compose up -d

# View logs
docker compose logs -f

# Stop MeSame
docker compose down
```

The application will be available at `http://localhost:3000`

### Configuration

Edit `docker-compose.yml` to configure environment variables.

#### LLM Provider

```yaml
environment:
  # Use local Ollama (default)
  - MESAME_PROVIDER=ollama
  - MESAME_MODEL=gemma3:1b
  - MESAME_TARGET_BASE_URL=http://host.docker.internal:11434

  # Or use OpenAI
  # - MESAME_PROVIDER=openai
  # - MESAME_MODEL=gpt-4o
  # - OPENAI_API_KEY=sk-...
```

#### Server Settings

```yaml
environment:
  - MESAME_HOST=0.0.0.0         # Listen on all interfaces
  - MESAME_PORT=3000            # Port to bind
  - MESAME_LOG_LEVEL=info       # Logging level
  - MESAME_LANGUAGE=en          # UI language
```

### Data Persistence

The SQLite database is stored in a Docker volume:

```bash
# Backup database
docker compose exec mesame cat /app/data/mesame.db > mesame-backup.db

# Restore database
docker compose cp mesame-backup.db mesame:/app/data/mesame.db
docker compose restart
```
