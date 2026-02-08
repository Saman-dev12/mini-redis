#!/bin/bash
# Build and test Docker image locally

set -e

PUSH=false
TAG="latest"
REGISTRY="ghcr.io/saman-dev12"

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --push)
            PUSH=true
            shift
            ;;
        --tag)
            TAG="$2"
            shift 2
            ;;
        --registry)
            REGISTRY="$2"
            shift 2
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: $0 [--push] [--tag TAG] [--registry REGISTRY]"
            exit 1
            ;;
    esac
done

echo "=== Building Mini-Redis Docker Image ==="
echo ""

# Build the image
IMAGE_NAME="mini-redis:$TAG"
echo "Building $IMAGE_NAME..."
docker build -t "$IMAGE_NAME" .

echo "✅ Build successful!"
echo ""

# Test the image
echo "=== Testing Image ==="
TEST_CONTAINER="mini-redis-test-$$"

echo "Starting test container: $TEST_CONTAINER"
docker run -d --rm -p 6380:6379 --name "$TEST_CONTAINER" "$IMAGE_NAME"

sleep 2

# Check if container is running
if docker ps --filter "name=$TEST_CONTAINER" --format "{{.Names}}" | grep -q "$TEST_CONTAINER"; then
    echo "✅ Container is running!"
    
    # Stop test container
    docker stop "$TEST_CONTAINER" > /dev/null
    echo "✅ Test passed! Container stopped."
else
    echo "❌ Container failed to start!"
    docker logs "$TEST_CONTAINER"
    exit 1
fi

echo ""

# Push if requested
if [ "$PUSH" = true ]; then
    echo "=== Pushing to Registry ==="
    
    REGISTRY_IMAGE="$REGISTRY/mini-redis:$TAG"
    echo "Tagging as $REGISTRY_IMAGE"
    docker tag "$IMAGE_NAME" "$REGISTRY_IMAGE"
    
    echo "Pushing to registry..."
    docker push "$REGISTRY_IMAGE"
    
    echo "✅ Successfully pushed to $REGISTRY_IMAGE"
fi

echo ""
echo "=== Done ==="
echo "To run: docker run -d -p 6379:6379 -v redis-data:/app/storage --name mini-redis $IMAGE_NAME"
