variable "aws_region" {
  description = "AWS region used for Jubilee Nation development resources."
  type        = string
  default     = "eu-west-1"
}

variable "media_bucket_name" {
  description = "Globally unique S3 bucket name for Jubilee Nation media."
  type        = string
}