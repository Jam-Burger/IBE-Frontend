locals {
  environment = terraform.workspace

  # Resource naming convention
  name_prefix = "${var.project_name}-${var.team_name}-${local.environment}"

  tags = {
    Creator     = "team-${var.team_name}"
    Purpose     = "${var.project_name}-project"
    Environment = local.environment
  }
}

module "s3_cloudfront" {
  source       = "./modules/s3_cloudfront"
  project_name = local.name_prefix
  team_name    = var.team_name
  tags         = local.tags
}

