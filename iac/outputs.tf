output "frontend_url" {
  value = module.s3_cloudfront.cloudfront_url
}

output "cloudfront_distribution_id" {
  value = module.s3_cloudfront.cloudfront_distribution_id
}

output "s3_bucket_name" {
  value = module.s3_cloudfront.bucket_name
}