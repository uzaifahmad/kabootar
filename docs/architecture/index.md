# Architecture

Kabootar is built as a highly modular pnpm monorepo. The core logic is decoupled from the UI, allowing it to run in the Desktop App (Electron) or headless in CI (CLI).

## System Context

```mermaid
C4Context
    title System Context for Kabootar API Testing Platform

    Person(user, "Developer / QA", "Builds API tests and collections.")
    System(desktop, "Desktop App", "Electron/React cross-platform UI.")
    System(cli, "CLI Runner", "Headless test executor for CI/CD.")
    System(server, "Kabootar Backend", "Optional self-hosted sync server (Go).")
    System_Ext(git, "Git Provider", "GitHub, GitLab, Bitbucket (Storage).")
    System_Ext(targetApi, "Target API", "The API being tested.")

    Rel(user, desktop, "Uses for authoring requests")
    Rel(user, cli, "Executes headless tests")
    
    Rel(desktop, targetApi, "Sends HTTP requests")
    Rel(cli, targetApi, "Sends HTTP requests")

    Rel(desktop, git, "Git sync operations", "isomorphic-git")
    Rel(desktop, server, "Real-time team sync")
```

## Packages

- `@kabootar/core`: The pure TypeScript request executor, variable interpolator, and collection schema mapper.
- `@kabootar/test-runner`: V8 VM sandbox for writing tests with Chai-like syntax (`kb.expect(kb.response.status).toBe(200)`).
- `@kabootar/git-sync`: Isomorphic Git bindings and filesystem serializers to map collections to `.json` request trees.

## Desktop Container

```mermaid
C4Container
    title Desktop App Architecture

    Container(main, "Electron Main", "Node.js", "Manages Window & IPC Security (CSP)")
    Container(preload, "Preload Bridge", "Node.js", "Secure context bridge expose")
    Container(renderer, "React UI", "Vite + React", "Request Builder, Tree Explorer")
    Container(sidecar, "Rust Sidecar", "napi-rs", "Performance-critical JSON parsing (Optional phase 2)")
    
    Rel(renderer, preload, "Calls via window.electronAPI")
    Rel(preload, main, "IPC Messaging")
    Rel(renderer, sidecar, "FFI Bindings")
```
