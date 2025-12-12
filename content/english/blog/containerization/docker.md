+++
date = '2022-12-12T09:00:00+10:00'
draft = false
title = 'Docker'
tags = ['Docker']
summary = "Overview of Docker architecture and practical patterns; focused on Kubernetes for orchestration."
+++

Docker is an open-source platform for building, shipping and running applications in containers. It standardizes packaging through images, enabling consistent environments across development, testing and production. Core features include image layering, container isolation, volume management, and networking. Orchestration is typically handled by Kubernetes in production environments.

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

Docker volume basics:
- Named volumes: Managed by Docker and stored under Docker’s data directory; portable across containers and survive container removal.
- Anonymous volumes: Created implicitly (no name) and can be harder to manage; useful for quick runs but less ideal for long-term persistence.
- Bind mounts: Map a host path into a container; great for development and sharing files, but path must exist and host permissions apply.
- Persistence: Volumes persist beyond the lifecycle of a container, unlike the container writable layer which is ephemeral.
- Performance: Named volumes often outperform bind mounts on macOS/Windows due to filesystem sharing; on Linux both are performant.
- Permissions/ownership: Ensure UID/GID alignment between host and container; use chown or run as matching user. On macOS, Docker Desktop translates permissions; some tools may need extra flags.
- SELinux/AppArmor: On Linux with SELinux, use :z or :Z for bind mounts to adjust labels; AppArmor profiles may restrict mounts.
- Backup/restore: Volumes can be backed up via `docker run --rm -v vol:/data -v $PWD:/backup busybox tar -czf /backup/vol.tgz -C /data .` and restored similarly.

```bash
# Create volumes
docker volume create VOLUME_NAME

# List volumes
docker volume ls

# Inspect volume details
docker volume inspect VOLUME_NAME

# Remove volumes
docker volume rm VOLUME_NAME
# Remove all unused volumes
docker volume prune

# Use volumes with containers
# Named volume mounted at a path
docker run -v VOLUME_NAME:/path/in/container IMAGE
# Bind mount (host path to container path)
docker run --mount type=bind,source=$PWD/data,target=/data IMAGE
# Advanced --mount with options
docker run --mount source=VOLUME_NAME,target=/path,readonly IMAGE
```

### Network Management

Docker networking basics:
- Bridge network: The default local, single-host network type. Containers get IPs on a private subnet and can reach each other on that bridge. Host access is via published ports (e.g., -p 8080:80). User-defined bridges also provide built-in DNS so containers can resolve each other by name.
- Network driver: The implementation backing a network (bridge, host, macvlan, overlay). Bridge is single-host; overlay spans multiple hosts in a swarm/cluster.
- Subnet: The IP range allocated to a Docker network, defined in CIDR notation (e.g., 172.18.0.0/16). It determines the pool from which container IPs are assigned.
- CIDR: A way to express IP blocks. /16 provides ~65k addresses (e.g., 172.18.0.1–172.18.255.254); /24 provides 254 usable addresses (e.g., 172.18.0.1–172.18.0.254).
- Gateway: The default route for containers on the network (often the bridge itself, e.g., 172.18.0.1). You can set it explicitly when creating networks.
- DNS on user-defined bridges: Docker runs an embedded DNS that maps container names and service aliases to IPs on the same user-defined bridge.
- IPAM: IP Address Management component in Docker that assigns IPs to containers from the network’s pool.
- Isolation: User-defined bridges isolate broadcast domains; containers on different bridges cannot reach each other unless connected to both or via routing/NAT.

```bash
# Inspect the default bridge network
docker network inspect bridge | jq '.[0].IPAM, .[0].Containers'

# Create networks
# A generic network with default driver (bridge on single host)
docker network create NETWORK_NAME
# Explicit bridge network on the local host
docker network create --driver bridge NETWORK_NAME
# Bridge network with an explicit subnet in CIDR notation (and optional gateway)
docker network create --driver bridge \
  --subnet=172.18.0.0/16 \
  --gateway=172.18.0.1 \
  NETWORK_NAME

# Connect/disconnect a container to a network
docker network connect NETWORK_NAME CONTAINER
docker network disconnect NETWORK_NAME CONTAINER

# Verify container IP allocation and name resolution
docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' CONTAINER
# On user-defined bridges, containers can ping each other by name
# (replace other-container with the actual name)
docker exec CONTAINER ping -c2 other-container
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

## Design Patterns for Kubernetes

### Single Container Pattern

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

### Sidecar Pattern

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

### Ambassador Pattern

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

### Adapter Pattern

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

### Init Container Pattern

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

### Multi-Container Pod Pattern

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

### Pod Disruption Budget (PDB)

Ensure a minimum number of replicas remain available during voluntary disruptions (node drain, upgrades).

```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: myapp-pdb
spec:
  minAvailable: 2
  selector:
    matchLabels:
      app: myapp
```

### Horizontal Pod Autoscaler (HPA)

Automatically scales replicas based on CPU or custom metrics.

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: myapp-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: myapp
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

### NetworkPolicy (Default deny + allow to DB)

Restrict east-west traffic; start with default-deny and explicitly allow needed flows.

```yaml
# Default deny all ingress to app namespace
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny
  namespace: app
spec:
  podSelector: {}
  policyTypes: [Ingress]
---
# Allow only web pods to reach db pods on 5432
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-web-to-db
  namespace: app
spec:
  podSelector:
    matchLabels: { tier: db }
  policyTypes: [Ingress]
  ingress:
  - from:
    - podSelector:
        matchLabels: { tier: web }
    ports:
    - protocol: TCP
      port: 5432
```

### Affinity / Anti-affinity

Control pod placement to spread replicas and avoid single-node risk.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  replicas: 4
  selector:
    matchLabels: { app: myapp }
  template:
    metadata:
      labels: { app: myapp }
    spec:
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 100
            podAffinityTerm:
              labelSelector:
                matchExpressions:
                - key: app
                  operator: In
                  values: [myapp]
              topologyKey: kubernetes.io/hostname
        nodeAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
            nodeSelectorTerms:
            - matchExpressions:
              - key: topology.kubernetes.io/zone
                operator: In
                values: [zone-a, zone-b]
```


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

1. **Local Kubernetes**: Use kind (Kubernetes in Docker) or minikube to spin up a local cluster.
2. **kubectl + manifests**: Apply Deployment/Service/Ingress YAMLs directly; keep them in version control.
3. **Helm charts**: Template and package your Kubernetes configs for repeatable installs and environment overlays.
4. **Hot reload**: For containerized dev, bind mount source or use Skaffold/ Tilt to auto-rebuild/redeploy to Kubernetes.
5. **Testing**: Add integration tests against cluster services; use ephemeral namespaces per test run.
6. **CI/CD integration**: Automate image build, push, and kubectl/Helm deploy steps.
7. **Registry management**: Use private registries and imagePullSecrets; tag images semantically.

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
