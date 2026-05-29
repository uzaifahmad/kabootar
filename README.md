<p align="center">
  <h1 align="center">🕊️ Kabootar</h1>
  <p align="center">
    <strong>Open-source API testing platform</strong>
  </p>
  <p align="center">
    Cross-platform desktop client · Self-hostable backend · Git-first collections · JS test runner · CI/CD ready
  </p>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#license">License</a>
</p>

---

## Features

- **🖥️ Cross-Platform Desktop App** — Electron + React with premium dark-mode UI. Windows, macOS, Linux.
- **🔥 Powerful Request Builder** — Every HTTP method, auth type, body format. Variable interpolation, timing breakdown.
- **🧪 JavaScript Test Runner** — Write pre-request & test scripts. Built-in assertions library. Sandboxed execution.
- **📂 Git-First Storage** — Collections stored as JSON files on disk. Version control with any Git provider.
- **☁️ Optional Cloud Sync** — Self-host the backend for team workspaces, RBAC, and real-time sync. K8s-ready.
- **⚡ CI/CD Integration** — Run collections headlessly via CLI. JUnit XML + JSON reporters. GitHub Actions template.
- **🔒 Security First** — CSP headers, secret masking, sandboxed scripts, dependency auditing.
- **📦 SDKs** — TypeScript & Python SDKs for programmatic access.

## Quick Start

### Desktop App

Download the latest release from [GitHub Releases](https://github.com/kabootar-dev/kabootar/releases) for your platform.

### Development Setup

```bash
# Prerequisites: Node.js >= 20, pnpm >= 9, Go >= 1.22

# Clone and install
git clone https://github.com/kabootar-dev/kabootar.git
cd kabootar
pnpm install

# Build core packages
pnpm build

# Launch desktop app
pnpm dev:desktop

# Run backend (needs PostgreSQL)
pnpm dev:server

# Run headless tests via CLI
npx @kabootar/cli run ./my-collection --env production
```

## Architecture

```
kabootar/
├── packages/
│   ├── core/            # Request engine, collection schema, environments
│   ├── test-runner/     # JS test sandbox with assertions
│   └── git-sync/        # Git-first collection read/write/diff
├── apps/
│   ├── desktop/         # Electron + React + Vite
│   └── server/          # Go (Fiber) backend — auth, sync, teams
├── cli/                 # Headless CLI runner
├── sdks/                # TypeScript & Python SDKs
├── deploy/              # Docker, Helm, K8s manifests
├── docs/                # Architecture & contributor docs
└── e2e/                 # Playwright E2E tests
```

## Self-Hosting

```bash
# Docker Compose (quickest)
docker compose -f deploy/docker/docker-compose.yml up -d

# Kubernetes via Helm
helm install kabootar deploy/helm/ --namespace kabootar --create-namespace
```

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, coding standards, and PR process.

Please note that this project adheres to a [Code of Conduct](CODE_OF_CONDUCT.md).

## License

MIT — see [LICENSE](LICENSE).

---

<p align="center">
  Built with ❤️ by the Kabootar community
</p>
