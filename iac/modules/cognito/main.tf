data "aws_region" "current" {}

resource "aws_cognito_user_pool" "this" {
  name = "${var.project_name}-user-pool"

  auto_verified_attributes = ["email"]
  alias_attributes         = ["email"]

  # Custom attributes
  schema {
    attribute_data_type      = "String"
    name                     = "tenant_id"
    required                 = false
    mutable                  = true
    developer_only_attribute = false

    string_attribute_constraints {
      min_length = 1
      max_length = 256
    }
  }

  password_policy {
    minimum_length    = 8
    require_uppercase = true
    require_lowercase = true
    require_numbers   = true
    require_symbols   = true
  }

  admin_create_user_config {
    allow_admin_create_user_only = false
  }

  mfa_configuration = "OFF"

  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }

  tags = var.tags
}

# Google Identity Provider
resource "aws_cognito_identity_provider" "google" {
  user_pool_id  = aws_cognito_user_pool.this.id
  provider_name = "Google"
  provider_type = "Google"

  provider_details = {
    client_id        = var.google_client_id
    client_secret    = var.google_client_secret
    authorize_scopes = "email profile openid"
    attributes_url   = "https://people.googleapis.com/v1/people/me?personFields="
    attributes_url_add_attributes = "true"
    authorize_url    = "https://accounts.google.com/o/oauth2/v2/auth"
    oidc_issuer      = "https://accounts.google.com"
    token_request_method = "POST"
    token_url        = "https://www.googleapis.com/oauth2/v4/token"
  }

  attribute_mapping = {
    email    = "email"
    username = "sub"
  }
}

# Facebook Identity Provider
resource "aws_cognito_identity_provider" "facebook" {
  user_pool_id  = aws_cognito_user_pool.this.id
  provider_name = "Facebook"
  provider_type = "Facebook"

  provider_details = {
    client_id        = var.fb_app_id
    client_secret    = var.fb_app_secret
    authorize_scopes = "public_profile,email"
    attributes_url   = "https://graph.facebook.com/v21.0/me?fields="
    attributes_url_add_attributes = "true"
    authorize_url    = "https://www.facebook.com/v21.0/dialog/oauth"
    token_request_method = "GET"
    token_url        = "https://graph.facebook.com/v21.0/oauth/access_token"
  }

  attribute_mapping = {
    email    = "email"
    username = "id"
  }
}

resource "aws_cognito_user_pool_domain" "this" {
  domain       = "${var.project_name}-auth-domain"
  user_pool_id = aws_cognito_user_pool.this.id
}

resource "aws_cognito_user_pool_client" "frontend" {
  name            = "${var.project_name}-frontend-client"
  user_pool_id    = aws_cognito_user_pool.this.id
  generate_secret = false

  # OAuth Configuration
  allowed_oauth_flows                  = ["code"]
  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_scopes = [
    "email",
    "openid",
    "profile"
  ]

  # Auth Flows Configuration
  explicit_auth_flows = [
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_USER_SRP_AUTH"
  ]

  supported_identity_providers = [
    "COGNITO",
    aws_cognito_identity_provider.google.provider_name,
    aws_cognito_identity_provider.facebook.provider_name
  ]

  callback_urls = var.callback_urls
  logout_urls   = var.logout_urls

  # Token Configuration
  token_validity_units {
    access_token  = "hours"
    id_token      = "hours"
    refresh_token = "days"
  }

  access_token_validity  = 1
  id_token_validity      = 1
  refresh_token_validity = 30

  enable_token_revocation = true
}

resource "aws_cognito_identity_pool" "this" {
  identity_pool_name               = "${var.project_name}-identity-pool"
  allow_unauthenticated_identities = true

  cognito_identity_providers {
    client_id               = aws_cognito_user_pool_client.frontend.id
    provider_name           = aws_cognito_user_pool.this.endpoint
    server_side_token_check = false
  }

  supported_login_providers = {
    "accounts.google.com" = var.google_client_id
    "graph.facebook.com"  = var.fb_app_id
  }
}