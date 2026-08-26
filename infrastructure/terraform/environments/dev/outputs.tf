output "media_bucket_name" {
  description = "Name of the Jubilee Nation development media bucket."
  value       = module.media_storage.bucket_name
}

output "media_bucket_arn" {
  description = "ARN of the Jubilee Nation development media bucket."
  value       = module.media_storage.bucket_arn
}