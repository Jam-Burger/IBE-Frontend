#!/bin/bash

# Create backend.tfvars file with the variables only if it doesn't exist
if [ ! -f "backend/terraform.tfvars" ]; then
    # Check if required environment variables are set
    if [ -z "$TF_VAR_aws_region" ] || [ -z "$TF_VAR_project_name" ] || [ -z "$TF_VAR_team_name" ]; then
        echo "Error: Required environment variables are not set and terraform.tfvars doesn't exist"
        echo "Please ensure TF_VAR_aws_region, TF_VAR_project_name, and TF_VAR_team_name are set"
        exit 1
    fi

    echo "Creating terraform.tfvars file..."
    cat > backend/terraform.tfvars << EOF
aws_region   = "$TF_VAR_aws_region"
project_name = "$TF_VAR_project_name"
team_name    = "$TF_VAR_team_name"
EOF
else
    echo "Using existing terraform.tfvars file"
fi

# Apply the backend module first
cd backend || exit
terraform init -backend=false
terraform apply -auto-approve

# Get the backend configuration
BACKEND_CONFIG=$(terraform output -json backend_config)

# Create the backend.config file
cat > ../backend.config << EOF
bucket         = "$(echo $BACKEND_CONFIG | jq -r '.bucket')"
key            = "$(echo $BACKEND_CONFIG | jq -r '.key')"
region         = "$(echo $BACKEND_CONFIG | jq -r '.region')"
dynamodb_table = "$(echo $BACKEND_CONFIG | jq -r '.dynamodb_table')"
encrypt        = "$(echo $BACKEND_CONFIG | jq -r '.encrypt')"
EOF

echo "Backend configuration generated successfully!"