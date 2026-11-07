#!/usr/bin/env bash
set -euo pipefail

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}====================================================${NC}"
echo -e "${BLUE}       Local Docker Deployment (No Cloud Needed)     ${NC}"
echo -e "${BLUE}====================================================${NC}"

# Check Docker daemon
if ! docker info > /dev/null 2>&1; then
  echo -e "${RED}[ERROR] Docker daemon is not running. Please start Docker Desktop or dockerd.${NC}"
  exit 1
fi

IMAGE_NAME="${1:-naveenkumar21032006/cicd-web-app:latest}"
echo -e "${YELLOW}Deploying image: ${IMAGE_NAME}${NC}"

# Stop existing container if running
if docker ps -a --format '{{.Names}}' | grep -q "^cicd-web-app$"; then
  echo -e "${YELLOW}Stopping and removing existing 'cicd-web-app' container...${NC}"
  docker rm -f cicd-web-app > /dev/null 2>&1 || true
fi

# Build or run
if [[ "$IMAGE_NAME" == "cicd-local-app:latest" ]]; then
  echo -e "${BLUE}Building local Docker image...${NC}"
  docker build -t "$IMAGE_NAME" .
fi

echo -e "${BLUE}Starting container on port 3000...${NC}"
docker run -d \
  --name cicd-web-app \
  -p 3000:3000 \
  --restart unless-stopped \
  "$IMAGE_NAME"

echo -e "${YELLOW}Waiting for application healthcheck...${NC}"
ATTEMPTS=0
MAX_ATTEMPTS=15
until curl -s http://localhost:3000/health | grep -q '"status":"UP"'; do
  ATTEMPTS=$((ATTEMPTS+1))
  if [ "$ATTEMPTS" -ge "$MAX_ATTEMPTS" ]; then
    echo -e "${RED}[ERROR] Healthcheck timed out after ${MAX_ATTEMPTS} attempts.${NC}"
    docker logs cicd-web-app
    exit 1
  fi
  sleep 1
done

echo -e "${GREEN}====================================================${NC}"
echo -e "${GREEN}🎉 Application successfully deployed & healthy!${NC}"
echo -e "${GREEN}👉 Open in browser: http://localhost:3000${NC}"
echo -e "${GREEN}👉 Health Endpoint: http://localhost:3000/health${NC}"
echo -e "${GREEN}👉 System Metrics:  http://localhost:3000/api/info${NC}"
echo -e "${GREEN}====================================================${NC}"

