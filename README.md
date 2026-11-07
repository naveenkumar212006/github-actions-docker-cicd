# Production CI/CD Pipeline with GitHub Actions & Docker (No Cloud Needed)

[![CI/CD Pipeline](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-blue?logo=github-actions)](.github/workflows/ci-cd.yml)
[![Docker](https://img.shields.io/badge/Docker-Multi--stage-2496ED?logo=docker)](Dockerfile)
[![Docker Hub](https://img.shields.io/badge/Docker%20Hub-Registry-0db7ed?logo=docker)](https://hub.docker.com)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-Minikube-326CE5?logo=kubernetes)](k8s/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An end-to-end, production-grade Continuous Integration and Continuous Deployment (CI/CD) pipeline that tests and containerizes an application via **GitHub Actions**, pushes it to **Docker Hub**, and automatically deploys it to a **local environment** (Minikube or local Docker VM) — requiring **zero cloud spend**.

---

## 🏗 Architecture Overview

![CI/CD Architecture](assets/cicd-architecture.svg)

### Pipeline Stages
1. **Automated Testing & Linting**: GitHub Actions spins up Node.js 20.x & 22.x test runners, checks syntax, and executes the unit & integration test suite.
2. **Container Build & Push**: Uses Docker Buildx with GitHub Actions caching to build an optimized, multi-arch image (~50MB Alpine base) and pushes it to your free Docker Hub account.
3. **Local Deployment**: Pulls the newly published image directly onto your local machine using **Docker Compose** or a local **Minikube** Kubernetes cluster with liveness and readiness probes.

---

## 📸 Screenshots & Visual Deliverables

### 1. Deployed Application Running Locally (`http://localhost:3000`)
![Deployed App UI](assets/deployed-app-screenshot.svg)

### 2. GitHub Actions Automated Workflow Execution
![GitHub Actions Run](assets/github-actions-workflow-run.svg)

---

## 📁 Repository Structure

```text
├── .github/
│   └── workflows/
│       └── ci-cd.yml          # GitHub Actions full CI/CD pipeline
├── assets/
│   ├── cicd-architecture.svg  # Visual architecture diagram
│   ├── deployed-app-screenshot.svg # Deployed app screenshot mockup
│   └── github-actions-workflow-run.svg # GitHub Actions pipeline run
├── k8s/
│   ├── deployment.yaml        # Kubernetes 2-replica deployment with probes
│   ├── service.yaml           # Kubernetes NodePort service (port 30080)
│   └── kustomization.yaml     # Kustomize manifest for easy overrides
├── scripts/
│   ├── deploy-docker.sh       # One-click Docker container deployment & verification
│   ├── deploy-minikube.sh     # One-click Minikube cluster deployment & rollout
│   └── test-local.sh          # Local test & linter runner
├── src/
│   ├── app.js                 # Core application router, metrics & HTML dashboard
│   └── server.js              # HTTP server with graceful shutdown handling
├── tests/
│   └── app.test.js            # Automated unit and API integration tests
├── .dockerignore              # Files excluded from Docker build context
├── docker-compose.yml         # Local Docker Compose service configuration
├── Dockerfile                 # Multi-stage, secure non-root Dockerfile
└── package.json               # Node.js project manifest & test scripts
```

---

## ⚡ Quick Start (Local Testing)

Run tests and syntax checks locally with zero external npm dependencies:

```bash
# 1. Run local test suite
npm test

# 2. Run syntax linting
npm run lint

# 3. Or use the automated test script
./scripts/test-local.sh
```

---

## 🔑 Setting Up GitHub Actions & Docker Hub

To enable automated image pushing, configure two secrets in your GitHub repository:

1. **Create a Docker Hub Access Token**:
   - Go to [Docker Hub Security Settings](https://hub.docker.com/settings/security).
   - Click **New Access Token**, name it `github-actions`, with `Read & Write` permissions.
   - Copy the generated token.

2. **Add Secrets to GitHub Repository**:
   - In your GitHub repository, navigate to:  
     `Settings` → `Secrets and variables` → `Actions` → `New repository secret`.
   - Add:
     - `DOCKERHUB_USERNAME`: Your Docker Hub username.
     - `DOCKERHUB_TOKEN`: The Personal Access Token created above.

3. **Push to Main**:
   ```bash
   git add .
   git commit -m "feat: complete automated CI/CD pipeline"
   git push origin main
   ```
   The workflow will trigger automatically:
   - ✅ Stage 1: Runs lint and unit tests.
   - ✅ Stage 2: Builds the image, tags it with `latest` and `sha-<git-short-sha>`, and pushes to:
     `https://hub.docker.com/r/<YOUR_DOCKERHUB_USERNAME>/cicd-web-app`
   - ✅ Stage 3: Generates the local deployment commands in the GitHub Step Summary.

---

## 💻 Local Deployment Options (No Cloud Needed)

### Option A: Deploy with Docker / Docker Compose

Pull the published image from Docker Hub (or build locally) and run:

```bash
# Using the turnkey script:
./scripts/deploy-docker.sh <YOUR_DOCKERHUB_USERNAME>/cicd-web-app:latest

# Or using Docker Compose directly:
DOCKER_IMAGE=<YOUR_DOCKERHUB_USERNAME>/cicd-web-app:latest docker compose up -d

# Check running status:
docker ps
```

Visit the running application at: **`http://localhost:3000`**

---

### Option B: Deploy with Minikube (Local Kubernetes)

Ensure Minikube is installed, then run:

```bash
# Using the automated Minikube deployment script:
./scripts/deploy-minikube.sh <YOUR_DOCKERHUB_USERNAME>/cicd-web-app:latest
```

Or deploy manually via `kubectl`:

```bash
# 1. Start Minikube
minikube start

# 2. Apply manifests
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml

# 3. Set your Docker Hub image
kubectl set image deployment/cicd-web-deployment web-container=<YOUR_DOCKERHUB_USERNAME>/cicd-web-app:latest

# 4. Check rollout status
kubectl rollout status deployment/cicd-web-deployment

# 5. Access the service
minikube service cicd-web-service
# Or open http://$(minikube ip):30080
```

---

## 🌐 API & Health Probes Reference

| Endpoint | Method | Purpose | Response |
| :--- | :--- | :--- | :--- |
| `/` | `GET` | Interactive Visual Dashboard | HTML5 with system stats & pipeline flowchart |
| `/health` | `GET` | Liveness & Readiness Probe | `{"status":"UP","timestamp":"...","uptimeSeconds":120}` |
| `/api/info` | `GET` | Microservice Diagnostics | System metrics, CPU cores, memory RSS, environment |
| `/api/ping` | `GET` | Health Check Ping | `{"message":"pong","timestamp":1700000000}` |

---

## 🛡️ Best Practices Implemented

- **Non-root Container User**: Runs under user `node` (UID 1000) inside the container.
- **Layer Caching**: Uses GitHub Actions Cache (`type=gha`) to minimize build times.
- **Micro-footprint**: Alpine Linux base ensures minimal image size (~50MB) and zero bloat.
- **Zero-Dependency Architecture**: Built using native Node.js libraries, removing third-party vulnerability vectors.
- **K8s Resiliency**: Includes rolling updates with 0 downtime, liveness probes, and readiness probes.

