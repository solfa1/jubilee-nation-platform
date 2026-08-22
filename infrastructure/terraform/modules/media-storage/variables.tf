variable "bucket_name" {
  description = "Name of the private media S3 bucket."
  type        = string
}

variable "environment" {
  description = "Deployment environment."
  type        = string
}

variable "allowed_origins" {
  description = "Origins allowed to upload directly to the bucket."
  type        = list(string)
}