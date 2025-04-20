# S3 and CloudFront outputs
output "frontend_url" {
  value = module.s3_cloudfront.cloudfront_url
}

output "cloudfront_distribution_id" {
  value = module.s3_cloudfront.cloudfront_distribution_id
}

output "s3_bucket_name" {
  value = module.s3_cloudfront.bucket_name
}

# Cognito outputs
output "cognito_user_pool_id" {
  value = module.cognito.user_pool_id
}

output "cognito_user_pool_client_id" {
  value = module.cognito.user_pool_client_id
}

output "cognito_identity_pool_id" {
  value = module.cognito.identity_pool_id
}

output "cognito_domain" {
  value = module.cognito.cognito_domain
}

output "cognito_domain_url" {
  value = module.cognito.cognito_domain_url
}

# IAM outputs
output "cognito_dynamodb_role_arn" {
  value = module.iam.cognito_dynamodb_role_arn
}

output "cognito_dynamodb_role_name" {
  value = module.iam.cognito_dynamodb_role_name
}