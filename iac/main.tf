locals {
  tags = {
    Creator = "team-${var.team_name}"
    Purpose = "${var.project_name}-project"
  }
}

module "s3_cloudfront" {
  source       = "./modules/s3_cloudfront"
  project_name = var.project_name
  team_name    = var.team_name
  tags         = local.tags
}

