locals {
  environment = terraform.workspace
  # Resource naming convention
  name_prefix = "${var.project_name}-${var.team_name}-${local.environment}"

  tags = {
    Creator     = "team-${var.team_name}"
    Purpose     = "${var.project_name}-project"
    Environment = local.environment
  }

  # Base URLs for Cognito
  base_callback_urls = ["https://${module.s3_cloudfront.cloudfront_url}/auth/callback"]
  base_logout_urls   = ["https://${module.s3_cloudfront.cloudfront_url}/auth/logout"]

  # Add localhost URLs for dev environment
  callback_urls = local.environment == "dev" ? concat(local.base_callback_urls, ["http://localhost:5173/auth/callback"]) : local.base_callback_urls
  logout_urls   = local.environment == "dev" ? concat(local.base_logout_urls, ["http://localhost:5173/auth/logout"]) : local.base_logout_urls
}

module "iam" {
  source       = "./modules/iam"
  project_name = local.name_prefix
  tags         = local.tags
}

module "cognito" {
  source       = "./modules/cognito"
  project_name = local.name_prefix
  tags         = local.tags

  google_client_id     = var.google_client_id
  google_client_secret = var.google_client_secret
  fb_app_id            = var.fb_app_id
  fb_app_secret        = var.fb_app_secret

  callback_urls = local.callback_urls
  logout_urls   = local.logout_urls
}

module "s3_cloudfront" {
  source       = "./modules/s3_cloudfront"
  project_name = local.name_prefix
  tags         = local.tags
}