#!/bin/bash

PROJECT_ID="wilde-rosen"
REGION="europe-west1"
ARTIFACT_REGISTRY_REPO="$REGION-docker.pkg.dev/$PROJECT_ID/carsharing"
APP_NAME="wilde-rosen-carsharing"
IMAGE_NAME="wilde-rosen-carsharing"

# Extract version from app.config.ts
VERSION=$(grep "version:" nuxt.config.ts | sed -E "s/.*version: '([^']+)'.*/\1/")

echo "###################################################"
echo "# Building version $VERSION ..."
echo "###################################################"

# build with version tag
podman build -t $IMAGE_NAME:$VERSION .

# tag also as as artifact registry tag
podman tag $IMAGE_NAME:$VERSION $ARTIFACT_REGISTRY_REPO/$IMAGE_NAME:$VERSION

# push to artifact registry (commented out for now)
echo "###################################################"
echo "# Pushing to artifact registry..."
echo "###################################################"
gcloud auth configure-docker $REGION-docker.pkg.dev
podman push $ARTIFACT_REGISTRY_REPO/$IMAGE_NAME:$VERSION

# Ask for confirmation before deploying to production
if [[ "$1" == "--prod" ]]; then
  echo ""
  echo "###################################################"
  echo "# WARNING: You are about to deploy to PRODUCTION!"
  echo "# Version: $VERSION"
  echo "# Image: $ARTIFACT_REGISTRY_REPO/$IMAGE_NAME:$VERSION"
  echo "###################################################"
  echo ""
  read -p "Are you sure you want to deploy to PRODUCTION? (y/N): " confirm
  
  if [[ "$confirm" == "y" || "$confirm" == "Y" ]]; then
    # deploy to production Cloud Run
    echo "###################################################"
    echo "# Deploying to PRODUCTION..."
    echo "###################################################"
    gcloud run deploy $APP_NAME --image $ARTIFACT_REGISTRY_REPO/$IMAGE_NAME:$VERSION --project $PROJECT_ID --region $REGION --allow-unauthenticated
  else
    echo "Deployment to PRODUCTION cancelled."
    exit 0
  fi
else
  echo "###################################################"
  echo "# Deploying to NON-PRODUCTION environment..."
  echo "###################################################"
  gcloud run deploy $APP_NAME-npr --image $ARTIFACT_REGISTRY_REPO/$IMAGE_NAME:$VERSION --project $PROJECT_ID --region $REGION --allow-unauthenticated
fi
