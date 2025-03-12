terraform {
  backend "s3" {
    bucket         = "${var.project_name}-${var.team_name}-terraform-frontend-state"
    key            = "terraform.tfstate"
    region         = var.aws_region
    dynamodb_table = "${var.project_name}-${var.team_name}-terraform-frontend-locks"
    encrypt        = true
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "5.81.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}