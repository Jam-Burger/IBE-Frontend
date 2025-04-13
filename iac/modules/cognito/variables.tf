variable "project_name" {}
variable "tags" {}

variable "google_client_id" {}
variable "google_client_secret" {}

variable "fb_app_id" {}
variable "fb_app_secret" {}

variable "callback_urls" {
  description = "List of callback URLs for the Cognito client"
  type        = list(string)
}

variable "logout_urls" {
  description = "List of logout URLs for the Cognito client"
  type        = list(string)
}