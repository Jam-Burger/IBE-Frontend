resource "aws_cognito_user_pool" "this" {
  name = "${var.project_name}-user-pool"

  auto_verified_attributes = ["email"]
  alias_attributes         = ["email"]

  schema {
    attribute_data_type = "String"
    name                = "tenant_id"
    required            = false
    mutable             = true
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

resource "aws_cognito_user_pool_client" "frontend" {
  name            = "${var.project_name}-frontend-client"
  user_pool_id    = aws_cognito_user_pool.this.id
  generate_secret = false

  explicit_auth_flows = [
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_CUSTOM_AUTH"
  ]

  supported_identity_providers = ["COGNITO", "Google", "Facebook"]
  callback_urls                = ["https://yourfrontend.com/callback"]
  logout_urls                  = ["https://yourfrontend.com/logout"]
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