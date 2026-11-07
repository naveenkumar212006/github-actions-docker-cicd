.PHONY: help test lint docker-build docker-run docker-stop minikube-start minikube-deploy clean

IMAGE_NAME ?= cicd-web-app:latest
PORT ?= 3000

help: ## Display available make targets
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

test: ## Run automated unit and API integration tests
	npm test

lint: ## Check JavaScript syntax and linting
	npm run lint

docker-build: ## Build optimized production Docker image locally
	docker build -t $(IMAGE_NAME) .

docker-run: ## Run Docker container locally on port 3000
	./scripts/deploy-docker.sh $(IMAGE_NAME)

docker-stop: ## Stop and remove running local Docker container
	docker rm -f cicd-web-app 2>/dev/null || true

minikube-start: ## Start local Minikube cluster
	minikube start

minikube-deploy: ## Deploy manifests to local Minikube cluster
	./scripts/deploy-minikube.sh $(IMAGE_NAME)

minikube-status: ## Check Minikube pod and service status
	kubectl get pods -l app=cicd-web -o wide
	kubectl get service cicd-web-service

k8s-validate: ## Validate Kubernetes YAML manifests with dry-run
	kubectl apply --dry-run=client -f k8s/deployment.yaml
	kubectl apply --dry-run=client -f k8s/service.yaml

clean: docker-stop ## Clean up temporary logs and containers
	rm -rf coverage .nyc_output

