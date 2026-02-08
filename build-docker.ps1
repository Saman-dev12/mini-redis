#!/usr/bin/env pwsh
# Build and test Docker image locally

param(
    [switch]$Push = $false,
    [string]$Tag = "latest",
    [string]$Registry = "ghcr.io/saman-dev12"
)

Write-Host "=== Building Mini-Redis Docker Image ===" -ForegroundColor Cyan
Write-Host ""

# Build the image
$imageName = "mini-redis:$Tag"
Write-Host "Building $imageName..." -ForegroundColor Yellow
docker build -t $imageName .

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build successful!" -ForegroundColor Green
Write-Host ""

# Test the image
Write-Host "=== Testing Image ===" -ForegroundColor Cyan
$testContainer = "mini-redis-test-$(Get-Random)"

Write-Host "Starting test container: $testContainer" -ForegroundColor Yellow
docker run -d --rm -p 6380:6379 --name $testContainer $imageName

Start-Sleep -Seconds 2

# Check if container is running
$running = docker ps --filter "name=$testContainer" --format "{{.Names}}"
if ($running -eq $testContainer) {
    Write-Host "✅ Container is running!" -ForegroundColor Green
    
    # Stop test container
    docker stop $testContainer | Out-Null
    Write-Host "✅ Test passed! Container stopped." -ForegroundColor Green
} else {
    Write-Host "❌ Container failed to start!" -ForegroundColor Red
    docker logs $testContainer
    exit 1
}

Write-Host ""

# Push if requested
if ($Push) {
    Write-Host "=== Pushing to Registry ===" -ForegroundColor Cyan
    
    $registryImage = "$Registry/mini-redis:$Tag"
    Write-Host "Tagging as $registryImage" -ForegroundColor Yellow
    docker tag $imageName $registryImage
    
    Write-Host "Pushing to registry..." -ForegroundColor Yellow
    docker push $registryImage
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Successfully pushed to $registryImage" -ForegroundColor Green
    } else {
        Write-Host "❌ Push failed!" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "=== Done ===" -ForegroundColor Cyan
Write-Host "To run: docker run -d -p 6379:6379 -v redis-data:/app/storage --name mini-redis $imageName"
