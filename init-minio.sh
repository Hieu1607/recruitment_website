#!/bin/bash

# Wait for MinIO to be ready
echo "Waiting for MinIO to start..."
until curl -f http://minio:9000/minio/health/live; do
  echo "MinIO is not ready yet. Waiting..."
  sleep 2
done

echo "MinIO is ready!"

# Install MinIO client if not exists
if ! command -v mc &> /dev/null; then
    echo "Installing MinIO client..."
    curl https://dl.min.io/client/mc/release/linux-amd64/mc -o /usr/local/bin/mc
    chmod +x /usr/local/bin/mc
fi

# Configure MinIO client
echo "Configuring MinIO client..."
mc alias set myminio http://minio:9000 ${MINIO_ROOT_USER:-minioadmin} ${MINIO_ROOT_PASSWORD:-minioadmin123}

# Create bucket if not exists
BUCKET_NAME=${MINIO_BUCKET_NAME:-recruitment-files}
echo "Checking if bucket '$BUCKET_NAME' exists..."

if mc ls myminio/$BUCKET_NAME > /dev/null 2>&1; then
    echo "Bucket '$BUCKET_NAME' already exists."
else
    echo "Creating bucket '$BUCKET_NAME'..."
    mc mb myminio/$BUCKET_NAME
    echo "Bucket '$BUCKET_NAME' created successfully."
fi

# Set bucket policy to public-read
echo "Setting bucket policy to public-read..."
cat > /tmp/policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": [
        "s3:GetBucketLocation",
        "s3:ListBucket"
      ],
      "Resource": "arn:aws:s3:::$BUCKET_NAME"
    },
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
    }
  ]
}
EOF

mc policy set-json /tmp/policy.json myminio/$BUCKET_NAME
echo "Bucket policy set to public-read for '$BUCKET_NAME'."

# Create additional buckets if needed
ADDITIONAL_BUCKETS="resumes avatars company-logos"
for bucket in $ADDITIONAL_BUCKETS; do
    if mc ls myminio/$bucket > /dev/null 2>&1; then
        echo "Bucket '$bucket' already exists."
    else
        echo "Creating bucket '$bucket'..."
        mc mb myminio/$bucket
        mc policy set-json /tmp/policy.json myminio/$bucket
        echo "Bucket '$bucket' created and set to public-read."
    fi
done

echo "MinIO initialization completed successfully!"
echo "Available buckets:"
mc ls myminio/