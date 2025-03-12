terraform {
  backend "s3" {
    bucket         = "ibe-hufflepuff-terraform-frontend-state"
    key            = "terraform.tfstate"
    region         = "ap-northeast-2"
    dynamodb_table = "ibe-hufflepuff-terraform-frontend-locks"
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