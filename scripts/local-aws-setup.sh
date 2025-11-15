#!/bin/sh
set -eu

# Setup steps for working with LocalStack (S3) and DynamoDB local (DB).
# Requires: awscli installed; compose services running.

echo "Setting AWS env for local mocks..."
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_SESSION_TOKEN=test
export AWS_DEFAULT_REGION=us-east-1
echo "  AWS_DEFAULT_REGION=$AWS_DEFAULT_REGION"

# Wait for LocalStack S3 to report ready
echo "Waiting for LocalStack S3..."
until (curl --silent http://localhost:4566/_localstack/health | grep '"s3": "\(running\|available\)"' >/dev/null); do
  sleep 2
done
echo "LocalStack S3 is ready."

# Create S3 bucket (idempotent—ignore if already exists)
BUCKET_NAME="${AWS_S3_BUCKET_NAME:-fragments}"
echo "Creating S3 bucket: $BUCKET_NAME"
aws --endpoint-url=http://localhost:4566 s3api create-bucket --bucket "$BUCKET_NAME" \
  || echo "(bucket probably exists, continuing)"

# Create DynamoDB table (idempotent)
TABLE_NAME="${AWS_DYNAMODB_TABLE_NAME:-fragments}"
echo "Creating DynamoDB table: $TABLE_NAME"
aws --endpoint-url=http://localhost:8000 dynamodb create-table \
  --table-name "$TABLE_NAME" \
  --attribute-definitions AttributeName=ownerId,AttributeType=S AttributeName=id,AttributeType=S \
  --key-schema AttributeName=ownerId,KeyType=HASH AttributeName=id,KeyType=RANGE \
  --provisioned-throughput ReadCapacityUnits=10,WriteCapacityUnits=5 \
  || echo "(table probably exists, continuing)"

echo "Waiting for DynamoDB table to be ACTIVE..."
aws --endpoint-url=http://localhost:8000 dynamodb wait table-exists --table-name "$TABLE_NAME"
echo "Done."