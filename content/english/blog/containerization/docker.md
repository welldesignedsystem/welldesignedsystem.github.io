+++
date = '2022-12-12T09:00:00+10:00'
draft = false
title = 'Docker'
tags = ['docker', 'containerization']
summary = "Overview of Docker architecture and some design patterns for using Docker container in the perspective of kubernetes."
+++

Docker is an open-source platform for building, shipping and running applications in containers. It standardizes packaging through images, enabling consistent environments across development, testing and production. Core features include image layering, container isolation, volume management, networking and orchestration via Docker Compose.

```bash
docker run hello-world
```

## Key Concepts

- **Container**: A lightweight, standalone executable package that includes everything needed to run a piece of software, including the code, runtime, libraries and system tools.
- **Image**: A read-only template used to create containers. Images are built from a series of layers, each representing a set of filesystem changes.
- **Dockerfile**: A text file that contains instructions for building a Docker image.
- **Volume**: A persistent storage mechanism that allows data to be shared between containers and the host system.
- **Network**: A virtual network that allows containers to communicate with each other and with the outside world.
- **Docker Hub**: A cloud-based registry service for sharing and managing Docker images.
- **Docker Compose**: A tool for defining and running multi-container Docker applications using a YAML file.

## Docker Architecture

![](../img/docker-architecture.png)

Docker creates 10 major system features:

- **PID (Process ID) namespace**: Isolates process IDs, allowing containers to have their own process trees.
- **UTS (UNIX Time-Sharing System) namespace**: Isolates hostname and domain name, enabling containers to have unique network identities.
- **MNT namespace**: Isolates filesystem mount points, allowing containers to have their own filesystem views.
- **IPC namespace**: Isolates inter-process communication resources, such as shared memory and semaphores.
- **NET namespace**: Isolates network interfaces, IP addresses and routing tables, enabling containers to have their own network stacks.
- **USER namespace**: Isolates user and group IDs, allowing containers to have their own user mappings.
- **CGROUPS (Control Groups)**: Limits and prioritizes resource usage (CPU, memory, disk I/O) for containers.
- **chroot**: Changes the root filesystem for a container, providing filesystem isolation.
- **CAP Drop**: Reduces the privileges of processes running in a container by dropping unnecessary capabilities.
- **Security Modules**: Integrates with security modules like SELinux and AppArmor to enforce security policies on containers.

## Advantages

- **Virus Protection**: Containers provide an isolated environment, reducing the risk of viruses spreading to the host system.
- **Portability**: Containers can run consistently across different environments, making it easier to move applications between various environment stages.
- **Efficiency**: Containers share the host OS kernel, making them more lightweight and efficient than traditional virtual machines.
- **Scalability**: Containers can be easily scaled up or down to handle varying workloads.
- **Version Control**: Docker images can be versioned, allowing for easy rollbacks and updates.
- **Integration**: Docker integrates well with various CI/CD tools, cloud platforms and orchestration systems like Kubernetes.
- **Microservices**: Docker is well-suited for microservices architectures, allowing each service to run in its own container.
- **Isolation**: Containers provide process and filesystem isolation, enhancing security and stability.
- **Resource Management**: Docker allows for fine-grained control over resource allocation for containers.
- **Automation**: Docker can be easily integrated into automated workflows for building, testing and deploying applications.
- **Cost Savings**: Docker's efficiency can lead to cost savings in terms of infrastructure and resource usage.
- **Flexibility**: Docker supports a wide range of applications and programming languages, making it a versatile choice for developers.

## Docker Commands Reference

### Container Management

```bash
# Run a container
docker run [OPTIONS] IMAGE [COMMAND] [ARG...]
docker run -d --name myapp nginx                    # Run in detached mode
docker run -it ubuntu /bin/bash                     # Interactive mode
docker run -p 8080:80 nginx                         # Port mapping
docker run -v /host/path:/container/path nginx      # Volume mounting
docker run --rm nginx                               # Remove after exit
docker run -e ENV_VAR=value nginx                   # Set environment variable

# List containers
docker ps                     # List running containers
docker ps -a                  # List all containers
docker ps -q                  # List container IDs only
docker ps --filter "status=exited"  # Filter by status

# Start/Stop containers
docker start CONTAINER        # Start a stopped container
docker stop CONTAINER         # Stop a running container
docker restart CONTAINER      # Restart a container
docker pause CONTAINER        # Pause a container
docker unpause CONTAINER      # Unpause a container

# Remove containers
docker rm CONTAINER           # Remove a stopped container
docker rm -f CONTAINER        # Force remove a running container
docker rm $(docker ps -aq)    # Remove all containers
docker container prune        # Remove all stopped containers

# Container information
docker inspect CONTAINER      # Detailed container information
docker logs CONTAINER         # View container logs
docker logs -f CONTAINER      # Follow log output
docker logs --tail 100 CONTAINER  # Last 100 lines
docker top CONTAINER          # Running processes in container
docker stats                  # Live resource usage statistics
docker port CONTAINER         # Port mappings

# Execute commands in containers
docker exec CONTAINER COMMAND      # Execute a command
docker exec -it CONTAINER /bin/bash  # Interactive shell
docker attach CONTAINER            # Attach to running container

# Copy files
docker cp CONTAINER:/path/to/file /host/path  # Copy from container
docker cp /host/path CONTAINER:/path/to/file  # Copy to container
```

### Image Management

```bash
# Build images
docker build -t IMAGE_NAME .                    # Build from Dockerfile
docker build -t IMAGE_NAME:TAG .                # Build with tag
docker build -f Dockerfile.prod -t IMAGE_NAME . # Specify Dockerfile
docker build --no-cache -t IMAGE_NAME .         # Build without cache
docker build --build-arg VAR=value -t IMAGE .   # Build with arguments

# List images
docker images                 # List all images
docker images -a              # List all images (including intermediates)
docker images -q              # List image IDs only

# Pull/Push images
docker pull IMAGE[:TAG]       # Pull image from registry
docker push IMAGE[:TAG]       # Push image to registry
docker login                  # Login to Docker Hub
docker logout                 # Logout from Docker Hub

# Tag images
docker tag SOURCE_IMAGE[:TAG] TARGET_IMAGE[:TAG]

# Remove images
docker rmi IMAGE              # Remove an image
docker rmi -f IMAGE           # Force remove an image
docker image prune            # Remove unused images
docker image prune -a         # Remove all unused images

# Image information
docker inspect IMAGE          # Detailed image information
docker history IMAGE          # Show image layers
docker image ls --digests     # Show image digests
```

### Volume Management

```bash
# Create volumes
docker volume create VOLUME_NAME
docker volume create --driver local VOLUME_NAME

# List volumes
docker volume ls
docker volume ls -q

# Inspect volumes
docker volume inspect VOLUME_NAME

# Remove volumes
docker volume rm VOLUME_NAME
docker volume prune              # Remove unused volumes

# Use volumes with containers
docker run -v VOLUME_NAME:/path/in/container IMAGE
docker run --mount source=VOLUME_NAME,target=/path IMAGE
```

### Network Management

```bash
# Create networks
docker network create NETWORK_NAME
docker network create --driver bridge NETWORK_NAME
docker network create --subnet=172.18.0.0/16 NETWORK_NAME

# List networks
docker network ls

# Inspect networks
docker network inspect NETWORK_NAME

# Connect/Disconnect containers
docker network connect NETWORK CONTAINER
docker network disconnect NETWORK CONTAINER

# Remove networks
docker network rm NETWORK_NAME
docker network prune             # Remove unused networks
```

### Docker Compose Commands

```bash
# Start services
docker-compose up                    # Start all services
docker-compose up -d                 # Start in detached mode
docker-compose up --build            # Rebuild images before starting
docker-compose up SERVICE_NAME       # Start specific service

# Stop services
docker-compose down                  # Stop and remove containers
docker-compose down -v               # Also remove volumes
docker-compose stop                  # Stop services without removing

# Service management
docker-compose start                 # Start existing containers
docker-compose restart               # Restart services
docker-compose pause                 # Pause services
docker-compose unpause               # Unpause services

# View information
docker-compose ps                    # List containers
docker-compose logs                  # View logs
docker-compose logs -f               # Follow logs
docker-compose logs SERVICE_NAME     # Logs for specific service
docker-compose top                   # Display running processes

# Execute commands
docker-compose exec SERVICE COMMAND  # Execute in running service
docker-compose run SERVICE COMMAND   # Run one-off command

# Build and pull
docker-compose build                 # Build or rebuild services
docker-compose pull                  # Pull service images

# Configuration
docker-compose config                # Validate and view configuration
docker-compose config --services     # List services
```

### System Commands

```bash
# System information
docker version               # Docker version information
docker info                  # System-wide information
docker system df             # Disk usage
docker system events         # Real-time events

# Clean up
docker system prune          # Remove unused data
docker system prune -a       # Remove all unused data
docker system prune --volumes  # Also remove volumes

# Export/Import
docker export CONTAINER > container.tar  # Export container
docker import container.tar IMAGE_NAME   # Import as image
docker save IMAGE > image.tar            # Save image to tar
docker load < image.tar                  # Load image from tar

# Context management
docker context ls            # List contexts
docker context use CONTEXT   # Switch context
```

## Dockerfile Instructions

```dockerfile
# Base image
FROM ubuntu:20.04
FROM node:18-alpine AS builder

# Metadata
LABEL maintainer="email@example.com"
LABEL version="1.0"
LABEL description="Application description"

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV PATH=/app/bin:$PATH

# Working directory
WORKDIR /app

# Copy files
COPY package*.json ./
COPY . .
COPY --from=builder /app/dist ./dist

# Add files (with URL support and auto-extraction)
ADD https://example.com/file.tar.gz /tmp/
ADD archive.tar.gz /app/

# Run commands
RUN apt-get update && apt-get install -y \
    python3 \
    && rm -rf /var/lib/apt/lists/*
RUN npm install --production

# Expose ports
EXPOSE 3000
EXPOSE 8080/tcp
EXPOSE 53/udp

# Volume mount points
VOLUME ["/data", "/logs"]
VOLUME /app/uploads

# User specification
USER node
USER 1001

# Arguments (build-time variables)
ARG VERSION=latest
ARG BUILD_DATE

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:3000/health || exit 1

# Entrypoint (cannot be overridden easily)
ENTRYPOINT ["docker-entrypoint.sh"]
ENTRYPOINT ["/bin/sh", "-c"]

# Default command (can be overridden)
CMD ["node", "server.js"]
CMD npm start

# Shell form vs Exec form
RUN echo "Shell form"              # Shell form
RUN ["echo", "Exec form"]          # Exec form (preferred)

# Multi-stage build
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY package*.json ./
RUN npm install --production
CMD ["node", "dist/server.js"]
```

## Docker Compose File Structure

```yaml
version: '3.8'

services:
  web:
    build:
      context: .
      dockerfile: Dockerfile.prod
      args:
        - NODE_ENV=production
    image: myapp:latest
    container_name: web_container
    restart: always
    ports:
      - "8080:80"
      - "443:443"
    volumes:
      - ./src:/app/src
      - node_modules:/app/node_modules
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgres://db:5432/mydb
    env_file:
      - .env
      - .env.production
    depends_on:
      - db
      - redis
    networks:
      - frontend
      - backend
    command: npm start
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:80/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M

  db:
    image: postgres:15-alpine
    container_name: postgres_db
    restart: unless-stopped
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    environment:
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: mydb
    networks:
      - backend
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    container_name: redis_cache
    restart: always
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    networks:
      - backend
    ports:
      - "6379:6379"

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local
  node_modules:

networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
    internal: true
```

## Design Patterns for Kubernetes

### 1. Single Container Pattern

Simple one-to-one mapping between container and pod.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: simple-app
spec:
  containers:
  - name: app
    image: myapp:latest
    ports:
    - containerPort: 8080
```

### 2. Sidecar Pattern

Helper container runs alongside main application container.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: sidecar-example
spec:
  containers:
  - name: main-app
    image: myapp:latest
    ports:
    - containerPort: 8080
  - name: log-shipper
    image: fluent/fluentd:latest
    volumeMounts:
    - name: logs
      mountPath: /var/log
  volumes:
  - name: logs
    emptyDir: {}
```

**Use Cases**: Log collection, monitoring agents, service mesh proxies, configuration synchronization.

### 3. Ambassador Pattern

Proxy container that handles external connections for the main container.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: ambassador-example
spec:
  containers:
  - name: app
    image: myapp:latest
    ports:
    - containerPort: 8080
  - name: ambassador
    image: envoyproxy/envoy:latest
    ports:
    - containerPort: 9901
```

**Use Cases**: Database proxy, API gateway, circuit breaker, rate limiting.

### 4. Adapter Pattern

Standardizes output from the main container.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: adapter-example
spec:
  containers:
  - name: app
    image: myapp:latest
  - name: adapter
    image: prometheus-adapter:latest
    volumeMounts:
    - name: metrics
      mountPath: /metrics
  volumes:
  - name: metrics
    emptyDir: {}
```

**Use Cases**: Metrics normalization, log format conversion, monitoring data transformation.

### 5. Init Container Pattern

Runs initialization tasks before main containers start.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: init-container-example
spec:
  initContainers:
  - name: init-db
    image: busybox:latest
    command: ['sh', '-c', 'until nc -z db 5432; do sleep 1; done']
  - name: migration
    image: myapp-migrations:latest
    command: ['npm', 'run', 'migrate']
  containers:
  - name: app
    image: myapp:latest
```

**Use Cases**: Database migrations, waiting for dependencies, configuration setup, secret fetching.

### 6. Multi-Container Pod Pattern

Multiple tightly coupled containers sharing resources.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: multi-container
spec:
  containers:
  - name: web
    image: nginx:latest
    volumeMounts:
    - name: shared-data
      mountPath: /usr/share/nginx/html
  - name: content-generator
    image: content-gen:latest
    volumeMounts:
    - name: shared-data
      mountPath: /data
  volumes:
  - name: shared-data
    emptyDir: {}
```

**Use Cases**: Web server with content generator, application with cache warmer, streaming data processor.

## Best Practices

### Dockerfile Optimization

1. **Use specific base image versions**: Avoid `latest` tag for reproducibility.
2. **Minimize layers**: Combine RUN commands with && to reduce layers.
3. **Order instructions by change frequency**: Place frequently changing instructions last.
4. **Use multi-stage builds**: Reduce final image size by separating build and runtime dependencies.
5. **Don't run as root**: Create and use a non-root user for security.
6. **Use .dockerignore**: Exclude unnecessary files from build context.
7. **Leverage build cache**: Order instructions to maximize cache reuse.
8. **Scan for vulnerabilities**: Use `docker scan` or similar tools.

### Security Best Practices

1. **Use minimal base images**: Alpine, distroless, or scratch when possible.
2. **Keep images updated**: Regular rebuild with latest security patches.
3. **Scan images**: Use vulnerability scanning tools.
4. **Don't store secrets in images**: Use environment variables or secret management.
5. **Use read-only root filesystem**: Add `--read-only` flag when possible.
6. **Limit capabilities**: Drop unnecessary Linux capabilities.
7. **Use security modules**: Enable AppArmor or SELinux.
8. **Network segmentation**: Use custom networks to isolate containers.

### Performance Optimization

1. **Resource limits**: Set CPU and memory limits to prevent resource exhaustion.
2. **Health checks**: Implement proper health check endpoints.
3. **Logging**: Use structured logging and log aggregation.
4. **Volume optimization**: Use volumes for persistent data and bind mounts for development.
5. **Network mode**: Choose appropriate network mode for use case.
6. **Image size**: Keep images small to reduce pull time and attack surface.

### Development Workflow

1. **Local development**: Use Docker Compose for local multi-service setup.
2. **Hot reload**: Mount source code as volumes for faster development.
3. **Testing**: Include test stages in multi-stage builds.
4. **CI/CD integration**: Automate image building and testing in pipelines.
5. **Registry management**: Use private registries for proprietary images.
6. **Tagging strategy**: Implement semantic versioning for images.

## Common Use Cases

### Python Application

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN useradd -m appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

CMD ["python", "app.py"]
```

### Node.js Application

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine

WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .

USER node

EXPOSE 3000

CMD ["node", "server.js"]
```

### Microservices with Docker Compose

```yaml
version: '3.8'

services:
  api:
    build: ./api
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgres://db:5432/api
      - REDIS_URL=redis://cache:6379
    depends_on:
      - db
      - cache

  worker:
    build: ./worker
    environment:
      - REDIS_URL=redis://cache:6379
    depends_on:
      - cache

  db:
    image: postgres:15-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: api
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: secret

  cache:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

## Troubleshooting

### Common Issues

```bash
# Container won't start
docker logs CONTAINER                    # Check logs
docker inspect CONTAINER                 # Check configuration
docker events                            # Monitor real-time events

# Permission issues
docker exec CONTAINER ls -la /path       # Check file permissions
docker exec -u root CONTAINER chown -R user:group /path

# Network issues
docker network inspect NETWORK           # Check network configuration
docker exec CONTAINER ping OTHER_CONTAINER  # Test connectivity
docker port CONTAINER                    # Check port mappings

# Resource issues
docker stats                             # Monitor resource usage
docker system df                         # Check disk usage
docker system prune                      # Clean up unused resources

# Image build issues
docker build --no-cache .                # Build without cache
docker build --progress=plain .          # Detailed build output
docker history IMAGE                     # Inspect image layers
```

