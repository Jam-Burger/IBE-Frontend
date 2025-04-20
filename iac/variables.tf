variable "aws_region" {
  description = "AWS region"
  type        = string
}

variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "team_name" {
  description = "Name of the team"
  type        = string
}

# Social Provider Variables
variable "google_client_id" {
  description = "Google OAuth client ID"
  type        = string
}

variable "google_client_secret" {
  description = "Google OAuth client secret"
  type        = string
  sensitive   = true
}

variable "fb_app_id" {
  description = "Facebook App ID"
  type        = string
}

variable "fb_app_secret" {
  description = "Facebook App secret"
  type        = string
  sensitive   = true
}