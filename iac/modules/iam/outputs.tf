output "cognito_dynamodb_role_arn" {
  description = "ARN of the IAM role for Cognito to access DynamoDB"
  value       = aws_iam_role.cognito_dynamodb_access.arn
}

output "cognito_dynamodb_role_name" {
  description = "Name of the IAM role for Cognito to access DynamoDB"
  value       = aws_iam_role.cognito_dynamodb_access.name
} 