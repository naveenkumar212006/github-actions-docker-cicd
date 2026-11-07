#!/usr/bin/env bash
set -euo pipefail

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}====================================================${NC}"
echo -e "${BLUE}      Local Minikube Deployment (No Cloud Needed)   ${NC}"
echo -e "${BLUE}====================================================${NC}"

# Check minikube command
if ! command -v minikube &> /dev/null; then
  echo -e "${RED}[ERROR] minikube CLI is not installed or not in PATH.${NC}"
  exit 1
fi

# Check kubectl
if ! command -v kubectl &> /dev/null; then
  echo -e "${RED}[ERROR] kubectl CLI is not installed or not in PATH.${NC}"
  exit 1
fi

# Ensure Minikube is running
STATUS=$(minikube status --format='{{.Host}}' 2>/dev/null || echo "Stopped")
if [[ "$STATUS" != "Running" ]]; then
  echo -e "${YELLOW}Minikube is not running. Starting Minikube cluster...${NC}"
  minikube start
else
  echo -e "${GREEN}Minikube is already running.${NC}"
fi

# Default to user Docker Hub image
IMAGE_NAME="${1:-naveenkumar21032006/cicd-web-app:latest}"

if [[ -z "$IMAGE_NAME" ]]; then
  echo -e "${YELLOW}No external image specified. Pointing shell to Minikube Docker daemon & building locally...${NC}"
  eval $(minikube docker-env)
  docker build -t cicd-web-app:latest .
  IMAGE_NAME="cicd-web-app:latest"
fi

echo -e "${BLUE}Applying Kubernetes manifests from k8s/...${NC}"
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml

if [[ -n "$IMAGE_NAME" ]]; then
  echo -e "${BLUE}Updating deployment to image: ${IMAGE_NAME}...${NC}"
  kubectl set image deployment/cicd-web-deployment web-container="${IMAGE_NAME}"
fi

echo -e "${YELLOW}Waiting for deployment rollout to complete...${NC}"
kubectl rollout status deployment/cicd-web-deployment --timeout=90s

MINIKUBE_IP=$(minikube ip)
NODE_PORT=30080
APP_URL="http://${MINIKUBE_IP}:${NODE_PORT}"

echo -e "${GREEN}====================================================${NC}"
echo -e "${GREEN}🎉 Kubernetes Deployment Complete!${NC}"
echo -e "${GREEN}Pod status:${NC}"
kubectl get pods -l app=cicd-web
echo -e "${GREEN}Service status:${NC}"
kubectl get service cicd-web-service
echo -e "${GREEN}====================================================${NC}"
echo -e "${GREEN}👉 Access the app at: ${APP_URL}${NC}"
echo -e "${GREEN}👉 Or run: minikube service cicd-web-service${NC}"
echo -e "${GREEN}====================================================${NC}"

